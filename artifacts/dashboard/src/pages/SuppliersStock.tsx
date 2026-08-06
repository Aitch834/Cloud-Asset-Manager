import React, { useState, useEffect } from "react";
import { TradeHistoryTab } from "./TradeHistory";
import { TabButton, TabBar } from "@/components/ui/tab-button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

import { useAppStore } from "@/hooks/use-app-store";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { useUserRole } from "@/hooks/use-user-role";
import { useFarmMembers } from "@/hooks/use-farm-members";
import { StaffSelect } from "@/components/ui/staff-select";
import { AppLayout } from "@/components/layout/AppLayout";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Truck,
  TrendingDown,
  TrendingUp,
  Building2,
  Plus,
  Search,
  ChevronRight,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  RefreshCw,
  Info,
  ClipboardList,
  FileText,
  ChevronDown,
  ChevronUp,
  Trash2,
  Loader2,
  ClipboardCheck,
  Eye,
} from "lucide-react";

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
  "Other",
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
  "General",
];

const SERVICE_CATEGORIES = [
  "Agronomy",
  "Veterinary Services",
  "Haulage / Transport",
  "Contracting / Labour",
  "Waste Disposal",
  "Repairs & Maintenance",
  "Professional Services",
  "Other Services",
];

const ALL_UNITS = ["kg", "L", "t", "bags", "boxes", "units", "m³", "bales", "hours", "days", "visits", "loads", "items"];
/** @deprecated use ALL_UNITS */
const UNITS = ALL_UNITS;

function fmt(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB");
}

function fmtQty(q: string | number | null, unit?: string | null) {
  if (q === null || q === undefined) return "—";
  const n = parseFloat(String(q));
  if (isNaN(n)) return "—";
  const formatted = n % 1 === 0 ? n.toFixed(0) : n.toFixed(2);
  return unit ? `${formatted} ${unit}` : formatted;
}

function fmtCost(pence: number | null) {
  if (!pence) return "—";
  return `£${(pence / 100).toFixed(2)}`;
}

function movementBadge(type: string, qty: string) {
  const q = parseFloat(qty);
  const isIn = q > 0;
  if (type === "received") return <Badge style={{ background: "#d1fae5", color: "#065f46", border: "none" }} className="text-xs">Received</Badge>;
  if (type === "usage") return <Badge style={{ background: "#fee2e2", color: "#991b1b", border: "none" }} className="text-xs">Used</Badge>;
  if (type === "waste") return <Badge style={{ background: "#fef3c7", color: "#92400e", border: "none" }} className="text-xs">Waste</Badge>;
  return <Badge style={{ background: isIn ? "#dbeafe" : "#f3e8ff", color: isIn ? "#1e40af" : "#6b21a8", border: "none" }} className="text-xs">Adjustment</Badge>;
}


function EmptyState({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div style={{ background: "#f0fdf4", borderRadius: "50%", padding: "1.25rem", marginBottom: "1rem" }}>
        <Icon size={28} color="#166534" />
      </div>
      <p className="font-semibold text-gray-700 mb-1">{title}</p>
      <p className="text-sm text-gray-400">{subtitle}</p>
    </div>
  );
}

type SuppliersTab = "suppliers" | "products" | "purchase-orders" | "received" | "levels" | "movements" | "trade-history" | "stocktake";
const SUPPLIERS_TAB_IDS: SuppliersTab[] = ["suppliers", "products", "purchase-orders", "received", "levels", "movements", "trade-history", "stocktake"];

export default function SuppliersStockPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = usePersistedTab<SuppliersTab>({ page: "suppliers-stock", farmId, validIds: SUPPLIERS_TAB_IDS, defaultTab: "levels", urlOverride: new URLSearchParams(window.location.search).get("tab") });
  const [prefilledPo, setPrefilledPo] = useState<{ form: any; lines: any[] } | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const handleRaisePo = (level: any) => {
    const reorder = level.stockItemReorderLevel ? parseFloat(level.stockItemReorderLevel) : 0;
    const current = parseFloat(level.currentQuantity ?? "0");
    const suggestedQty = Math.max(reorder * 2 - current, reorder).toFixed(2);
    setPrefilledPo({
      form: {
        supplierId: level.defaultSupplierId ? String(level.defaultSupplierId) : "",
        orderDate: new Date().toISOString().split("T")[0],
        expectedDeliveryDate: "",
        status: "draft",
        notes: `Raised from stock card: ${level.stockItemName} is at or below reorder level.`,
      },
      lines: [{ stockItemId: String(level.stockItemId), quantityOrdered: suggestedQty, unitPricePence: "", notes: "" }],
    });
    setTab("purchase-orders");
  };

  const suppliersQ = useQuery({
    queryKey: ["suppliers", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/suppliers`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const productsQ = useQuery({
    queryKey: ["stock-items", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/stock-items`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const deliveriesQ = useQuery({
    queryKey: ["stock-deliveries", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/stock-deliveries`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const levelsQ = useQuery({
    queryKey: ["stock-levels", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/stock-levels`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const movementsQ = useQuery({
    queryKey: ["stock-movements", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/stock-movements`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const purchaseOrdersQ = useQuery({
    queryKey: ["purchase-orders", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/purchase-orders`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const feedStockQ = useQuery({
    queryKey: ["feed-stock", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/feed-stock`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["stock-items", farmId] });
    qc.invalidateQueries({ queryKey: ["stock-deliveries", farmId] });
    qc.invalidateQueries({ queryKey: ["stock-levels", farmId] });
    qc.invalidateQueries({ queryKey: ["stock-movements", farmId] });
    qc.invalidateQueries({ queryKey: ["suppliers", farmId] });
    qc.invalidateQueries({ queryKey: ["purchase-orders", farmId] });
  };

  return (
    <AppLayout title="Trade Contacts & Stock">
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div className="mb-4">
        <p className="text-sm text-gray-500">Product catalogue, goods received, live stock levels and full movement history</p>
      </div>

      <TabBar className="mb-6 overflow-x-auto flex-wrap">
        <TabButton active={tab === "levels"} onClick={() => setTab("levels")}>Stock Levels</TabButton>
        <TabButton active={tab === "purchase-orders"} onClick={() => setTab("purchase-orders")}>Purchase Orders</TabButton>
        <TabButton active={tab === "received"} onClick={() => setTab("received")}>Goods Received (GRN)</TabButton>
        <TabButton active={tab === "movements"} onClick={() => setTab("movements")}>Movements</TabButton>
        <TabButton active={tab === "products"} onClick={() => setTab("products")}>Product Catalogue</TabButton>
        <TabButton active={tab === "suppliers"} onClick={() => setTab("suppliers")}>Trade Contacts</TabButton>
        <TabButton active={tab === "trade-history"} onClick={() => setTab("trade-history")}>Trade History & Prices</TabButton>
        <TabButton active={tab === "stocktake"} onClick={() => setTab("stocktake")}>Stocktake</TabButton>
      </TabBar>

      {tab === "levels" && (
        <StockLevelsTab
          levels={levelsQ.data ?? []}
          products={productsQ.data ?? []}
          loading={levelsQ.isLoading}
          farmId={farmId}
          onRefresh={invalidate}
          toast={toast}
          qc={qc}
          onGoToProducts={() => setTab("products")}
          onRaisePo={handleRaisePo}
        />
      )}
      {tab === "purchase-orders" && (
        <PurchaseOrdersTab
          orders={purchaseOrdersQ.data ?? []}
          products={productsQ.data ?? []}
          suppliers={suppliersQ.data ?? []}
          feedStock={feedStockQ.data ?? []}
          loading={purchaseOrdersQ.isLoading}
          farmId={farmId}
          onRefresh={invalidate}
          toast={toast}
          qc={qc}
          onGoToGRN={() => setTab("received")}
          prefilledPo={prefilledPo}
          onClearPrefilledPo={() => setPrefilledPo(null)}
        />
      )}
      {tab === "received" && (
        <GoodsReceivedTab
          deliveries={deliveriesQ.data ?? []}
          products={productsQ.data ?? []}
          suppliers={suppliersQ.data ?? []}
          purchaseOrders={purchaseOrdersQ.data ?? []}
          loading={deliveriesQ.isLoading}
          farmId={farmId}
          onRefresh={invalidate}
          toast={toast}
          onGoToProducts={() => setTab("products")}
        />
      )}
      {tab === "movements" && (
        <MovementsTab
          movements={movementsQ.data ?? []}
          products={productsQ.data ?? []}
          loading={movementsQ.isLoading}
          farmId={farmId}
          onRefresh={invalidate}
          toast={toast}
        />
      )}
      {tab === "products" && (
        <ProductsTab
          products={productsQ.data ?? []}
          suppliers={suppliersQ.data ?? []}
          loading={productsQ.isLoading}
          farmId={farmId}
          onRefresh={invalidate}
          toast={toast}
        />
      )}
      {tab === "suppliers" && (
        <SuppliersTab
          suppliers={suppliersQ.data ?? []}
          loading={suppliersQ.isLoading}
          farmId={farmId}
          onRefresh={invalidate}
          toast={toast}
        />
      )}
      {tab === "trade-history" && farmId && (
        <TradeHistoryTab farmId={farmId} />
      )}
      {tab === "stocktake" && farmId && (
        <StocktakeTab farmId={farmId} />
      )}
    </div>
    </AppLayout>
  );
}

function StockLevelsTab({ levels, products, loading, farmId, onRefresh, toast, qc, onGoToProducts, onRaisePo }: any) {
  const [adjOpen, setAdjOpen] = useState(false);
  const [adjForm, setAdjForm] = useState({ stockItemId: "", quantityChange: "", movementType: "adjustment", notes: "" });
  const [search, setSearch] = useState("");

  const adjMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/stock-movements`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "Adjustment saved" }); onRefresh(); setAdjOpen(false); setAdjForm({ stockItemId: "", quantityChange: "", movementType: "adjustment", notes: "" }); },
    onError: () => toast({ title: "Failed to save adjustment", variant: "destructive" }),
  });

  const filtered = (levels ?? []).filter((l: any) => !search || l.stockItemName?.toLowerCase().includes(search.toLowerCase()));
  const low = (levels ?? []).filter((l: any) => l.stockItemReorderLevel && parseFloat(l.currentQuantity) <= parseFloat(l.stockItemReorderLevel));
  const hasProducts = products.length > 0;

  return (
    <div>
      {low.length > 0 && (
        <div style={{ background: "#fef3c7", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
          <AlertTriangle size={16} color="#92400e" />
          <span style={{ fontSize: "0.875rem", color: "#92400e", fontWeight: 500 }}>{low.length} product{low.length > 1 ? "s" : ""} at or below reorder level</span>
        </div>
      )}
      {!hasProducts && !loading && (
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "0.875rem 1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 10 }}>
          <Info size={16} color="#1d4ed8" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: "0.875rem", color: "#1e40af" }}>
            To track stock levels, first add products to your{" "}
            <button onClick={onGoToProducts} style={{ fontWeight: 600, textDecoration: "underline", background: "none", border: "none", color: "#1e40af", cursor: "pointer", padding: 0 }}>Product Catalogue</button>.
          </span>
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
          <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
        </div>
        <Button variant="outline" size="sm" onClick={() => { if (!hasProducts) { onGoToProducts(); } else { setAdjOpen(true); } }}>
          <Plus size={14} className="mr-1" />Manual Adjustment
        </Button>
      </div>
      {loading ? <p className="text-sm text-gray-400 py-8 text-center">Loading...</p> : filtered.length === 0 ? (
        <EmptyState icon={Package} title="No stock recorded yet" subtitle="Add products to your catalogue and log Goods Received to see levels here" />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {filtered.map((l: any) => {
            const qty = parseFloat(l.currentQuantity ?? "0");
            const reorder = l.stockItemReorderLevel ? parseFloat(l.stockItemReorderLevel) : null;
            const isLow = reorder !== null && qty <= reorder;
            return (
              <div key={l.id} style={{ background: "#fff", border: isLow ? "1.5px solid #f59e0b" : "1px solid #e5e7eb", borderRadius: 10, padding: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111827" }}>{l.stockItemName}</span>
                  {isLow && <AlertTriangle size={14} color="#f59e0b" />}
                </div>
                <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 8, textTransform: "capitalize" }}>{l.stockItemCategory || "Uncategorised"}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontSize: "1.75rem", fontWeight: 700, color: isLow ? "#b45309" : "#166534" }}>{qty % 1 === 0 ? qty.toFixed(0) : qty.toFixed(2)}</span>
                  <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>{l.stockItemUnit || "units"}</span>
                </div>
                {reorder !== null && (
                  <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: 4 }}>Reorder at: {reorder} {l.stockItemUnit}</p>
                )}
                <p style={{ fontSize: "0.7rem", color: "#d1d5db", marginTop: 6 }}>Updated {fmt(l.lastUpdated)}</p>
                {isLow && onRaisePo && (
                  <button
                    onClick={() => onRaisePo(l)}
                    style={{ marginTop: 8, width: "100%", fontSize: "0.75rem", fontWeight: 600, color: "#92400e", background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 6, padding: "4px 0", cursor: "pointer" }}
                  >
                    + Raise Purchase Order
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={adjOpen} onOpenChange={o => { setAdjOpen(o); if (!o) adjMut.reset(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Manual Stock Adjustment</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Product</Label>
              <Select value={adjForm.stockItemId} onValueChange={v => setAdjForm(f => ({ ...f, stockItemId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select product..." /></SelectTrigger>
                <SelectContent>{products.map((p: any) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type</Label>
              <Select value={adjForm.movementType} onValueChange={v => setAdjForm(f => ({ ...f, movementType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="adjustment">Adjustment (+ or −)</SelectItem>
                  <SelectItem value="waste">Waste / Loss</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quantity Change (positive to add, negative to deduct)</Label>
              <Input type="number" step="0.01" placeholder="e.g. -5 or +10" value={adjForm.quantityChange} onChange={e => setAdjForm(f => ({ ...f, quantityChange: e.target.value }))} />
            </div>
            <div>
              <Label>Reason / Notes</Label>
              <Textarea placeholder="Optional reason..." value={adjForm.notes} onChange={e => setAdjForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>
          </div>
          <DialogMutationError mutation={adjMut} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjOpen(false)}>Cancel</Button>
            <Button onClick={() => adjMut.mutate(adjForm)} disabled={!adjForm.stockItemId || !adjForm.quantityChange || adjMut.isPending}>Save Adjustment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const FINANCIAL_CATEGORIES = [
  "Seeds & Seed Treatments", "Fertiliser", "Pesticides & Herbicides",
  "Fungicides", "Insecticides", "Veterinary & Medicine", "Feed & Bedding",
  "Fuel", "Machinery & Equipment", "Labour", "Agri-Environment Scheme",
  "Grant / Subsidy", "Crop Sales", "Livestock Sales", "Haulage",
  "Other Income", "Other Expense",
];

function GoodsReceivedTab({ deliveries, products, suppliers, purchaseOrders, loading, farmId, onRefresh, toast, onGoToProducts }: any) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const emptyForm = { stockItemId: "", supplierId: "", poId: "", deliveryDate: new Date().toISOString().slice(0, 10), quantity: "", batchNumber: "", lotNumber: "", invoiceReference: "", receivedBy: "", costPence: "", notes: "" };
  const [form, setForm] = useState<any>(emptyForm);
  const [invoiceDelivery, setInvoiceDelivery] = useState<any>(null);
  const [invoiceForm, setInvoiceForm] = useState<any>({});
  const { data: membersData, isLoading: membersLoading } = useFarmMembers(farmId);
  const staffNames = (membersData?.members ?? []).filter((m: any) => m.isActive).map((m: any) => `${m.firstName} ${m.lastName}`);

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/stock-deliveries`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, costPence: body.costPence ? Math.round(parseFloat(body.costPence) * 100) : null }) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "Goods received logged (GRN auto-generated)" }); onRefresh(); setOpen(false); setForm(emptyForm); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const invoiceMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/financial-transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...body,
        amountPence: body.amountPence ? Math.round(parseFloat(body.amountPence) * 100) : 0,
        vatAmountPence: body.vatAmountPence ? Math.round(parseFloat(body.vatAmountPence) * 100) : null,
      }),
    }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => {
      toast({ title: "Invoice linked to Financial Records" });
      onRefresh();
      setInvoiceDelivery(null);
    },
    onError: () => toast({ title: "Failed to save invoice", variant: "destructive" }),
  });

  const openRaiseInvoice = (d: any) => {
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
      notes: d.batchNumber ? `Batch: ${d.batchNumber}` : "",
    });
  };

  const filtered = (deliveries ?? []).filter((d: any) => !search || d.stockItemName?.toLowerCase().includes(search.toLowerCase()) || d.supplierName?.toLowerCase().includes(search.toLowerCase()));
  const hasProducts = products.length > 0;

  return (
    <div>
      {!hasProducts && !loading && (
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "0.875rem 1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 10 }}>
          <Info size={16} color="#1d4ed8" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: "0.875rem", color: "#1e40af" }}>
            Before logging a delivery, add your products in the{" "}
            <button onClick={onGoToProducts} style={{ fontWeight: 600, textDecoration: "underline", background: "none", border: "none", color: "#1e40af", cursor: "pointer", padding: 0 }}>Product Catalogue</button>{" "}
            tab first.
          </span>
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
          <Input placeholder="Search deliveries..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
        </div>
        <Button size="sm" onClick={() => { if (!hasProducts) { onGoToProducts(); } else { setOpen(true); } }}>
          <Plus size={14} className="mr-1" />Log Goods Received
        </Button>
      </div>
      {loading ? <p className="text-sm text-gray-400 py-8 text-center">Loading...</p> : filtered.length === 0 ? (
        <EmptyState icon={Truck} title="No deliveries recorded" subtitle="Log goods received to track stock coming onto the farm" />
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["GRN No.", "Date", "Product", "Supplier / PO", "Quantity", "Batch No.", "Lot No.", "Invoice Ref", "Cost", "Financial Record"].map(h => (
                  <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d: any, i: number) => (
                <tr key={d.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <td style={{ padding: "0.625rem 0.875rem", whiteSpace: "nowrap", fontFamily: "monospace", fontSize: "0.75rem", color: "#166534", fontWeight: 600 }}>{d.grnNumber || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", whiteSpace: "nowrap" }}>{fmt(d.deliveryDate)}</td>
                  <td style={{ padding: "0.625rem 0.875rem", fontWeight: 500 }}>{d.stockItemName || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>
                    <div>{d.supplierName || "—"}</div>
                    {d.poNumber && <div style={{ fontSize: "0.7rem", color: "#166534", fontFamily: "monospace", marginTop: 2 }}>{d.poNumber}</div>}
                  </td>
                  <td style={{ padding: "0.625rem 0.875rem" }}>{fmtQty(d.quantity, d.stockItemUnit)}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", fontFamily: "monospace", fontSize: "0.75rem" }}>{d.batchNumber || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", fontFamily: "monospace", fontSize: "0.75rem" }}>{d.lotNumber || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{d.invoiceReference || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem" }}>{fmtCost(d.costPence)}</td>
                  <td style={{ padding: "0.5rem 0.875rem" }}>
                    {d.financialTransactionId ? (
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        background: "#dcfce7", color: "#166534", borderRadius: 6,
                        padding: "2px 8px", fontSize: "0.75rem", fontWeight: 500,
                      }}>
                        ✓ Invoice Raised
                      </span>
                    ) : (
                      <button
                        onClick={() => openRaiseInvoice(d)}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          background: "#eff6ff", border: "1px solid #bfdbfe",
                          borderRadius: 6, padding: "3px 10px", fontSize: "0.75rem",
                          color: "#1e40af", cursor: "pointer", fontWeight: 500, whiteSpace: "nowrap",
                        }}
                      >
                        + Raise Invoice
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={invoiceDelivery !== null} onOpenChange={o => { if (!o) { setInvoiceDelivery(null); invoiceMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 520 }}>
          <DialogHeader>
            <DialogTitle>Raise Invoice — Link to Financial Records</DialogTitle>
          </DialogHeader>
          <p style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: 8 }}>
            Pre-filled from the goods received record. Adjust any fields as needed.
          </p>
          <div className="space-y-3 py-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Transaction Date <span style={{ color: "#ef4444" }}>*</span></Label>
                <Input type="date" value={invoiceForm.transactionDate || ""} onChange={e => setInvoiceForm((f: any) => ({ ...f, transactionDate: e.target.value }))} />
              </div>
              <div>
                <Label>Category <span style={{ color: "#ef4444" }}>*</span></Label>
                <Select value={invoiceForm.category || ""} onValueChange={v => setInvoiceForm((f: any) => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {FINANCIAL_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Description <span style={{ color: "#ef4444" }}>*</span></Label>
              <Input value={invoiceForm.description || ""} onChange={e => setInvoiceForm((f: any) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Amount (£) <span style={{ color: "#ef4444" }}>*</span></Label>
                <Input type="number" step="0.01" placeholder="0.00" value={invoiceForm.amountPence || ""} onChange={e => setInvoiceForm((f: any) => ({ ...f, amountPence: e.target.value }))} />
              </div>
              <div>
                <Label>VAT (£)</Label>
                <Input type="number" step="0.01" placeholder="0.00" value={invoiceForm.vatAmountPence || ""} onChange={e => setInvoiceForm((f: any) => ({ ...f, vatAmountPence: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Supplier</Label>
                <Input value={invoiceForm.vendorCustomer || ""} onChange={e => setInvoiceForm((f: any) => ({ ...f, vendorCustomer: e.target.value }))} />
              </div>
              <div>
                <Label>Invoice Reference</Label>
                <Input value={invoiceForm.reference || ""} onChange={e => setInvoiceForm((f: any) => ({ ...f, reference: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea rows={2} value={invoiceForm.notes || ""} onChange={e => setInvoiceForm((f: any) => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <DialogMutationError mutation={invoiceMut} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setInvoiceDelivery(null)}>Cancel</Button>
            <Button
              onClick={() => invoiceMut.mutate(invoiceForm)}
              disabled={!invoiceForm.transactionDate || !invoiceForm.description || !invoiceForm.category || !invoiceForm.amountPence || invoiceMut.isPending}
            >
              Save & Link Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) createMut.reset(); }}>
        <DialogContent style={{ maxWidth: 520 }}>
          <DialogHeader><DialogTitle>Log Goods Received</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Product <span style={{ color: "#ef4444" }}>*</span></Label>
                <Select value={form.stockItemId} onValueChange={v => setForm((f: any) => ({ ...f, stockItemId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select product..." /></SelectTrigger>
                  <SelectContent>{products.map((p: any) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Supplier</Label>
                <Select value={form.supplierId} onValueChange={v => setForm((f: any) => ({ ...f, supplierId: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Select supplier..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {suppliers.map((s: any) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Delivery Date <span style={{ color: "#ef4444" }}>*</span></Label>
                <Input type="date" value={form.deliveryDate} onChange={e => setForm((f: any) => ({ ...f, deliveryDate: e.target.value }))} />
              </div>
              <div>
                <Label>Quantity <span style={{ color: "#ef4444" }}>*</span></Label>
                <Input type="number" step="0.01" placeholder="0.00" value={form.quantity} onChange={e => setForm((f: any) => ({ ...f, quantity: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Link to Purchase Order (optional)</Label>
              <Select value={form.poId} onValueChange={v => setForm((f: any) => ({ ...f, poId: v === "__none__" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Select PO (optional)..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No PO — standalone delivery</SelectItem>
                  {(purchaseOrders ?? []).filter((po: any) => po.status !== "cancelled" && po.status !== "fully_received").map((po: any) => (
                    <SelectItem key={po.id} value={String(po.id)}>{po.poNumber} — {po.supplierName || "No supplier"}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Batch Number</Label>
                <Input placeholder="e.g. BT240301" value={form.batchNumber} onChange={e => setForm((f: any) => ({ ...f, batchNumber: e.target.value }))} />
              </div>
              <div>
                <Label>Lot Number</Label>
                <Input placeholder="e.g. LOT-2026-001" value={form.lotNumber} onChange={e => setForm((f: any) => ({ ...f, lotNumber: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Invoice Reference</Label>
                <Input placeholder="e.g. INV-1234" value={form.invoiceReference} onChange={e => setForm((f: any) => ({ ...f, invoiceReference: e.target.value }))} />
              </div>
              <div>
                <Label>Cost (£)</Label>
                <Input type="number" step="0.01" placeholder="0.00" value={form.costPence} onChange={e => setForm((f: any) => ({ ...f, costPence: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Received By</Label>
                <StaffSelect value={form.receivedBy} onChange={v => setForm((f: any) => ({ ...f, receivedBy: v }))} staffNames={staffNames} loading={membersLoading} />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea placeholder="Optional notes..." value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>
          </div>
          <DialogMutationError mutation={createMut} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => createMut.mutate(form)} disabled={!form.stockItemId || !form.deliveryDate || !form.quantity || createMut.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MovementsTab({ movements, products, loading, farmId, onRefresh, toast }: any) {
  const [search, setSearch] = useState("");
  const [filterProduct, setFilterProduct] = useState("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = (movements ?? []).filter((m: any) => {
    if (filterProduct !== "all" && String(m.stockItemId) !== filterProduct) return false;
    if (search && !m.stockItemName?.toLowerCase().includes(search.toLowerCase()) && !m.notes?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
          <Input placeholder="Search movements..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
        </div>
        <Select value={filterProduct} onValueChange={setFilterProduct}>
          <SelectTrigger style={{ width: 200 }}><SelectValue placeholder="All products" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All products</SelectItem>
            {products.map((p: any) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {loading ? <p className="text-sm text-gray-400 py-8 text-center">Loading...</p> : filtered.length === 0 ? (
        <EmptyState icon={RefreshCw} title="No movements recorded" subtitle="Movements appear automatically when goods are received or spray / medicine records are saved" />
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Date", "Product", "Type", "Qty Change", "Source", "Notes", ""].map(h => (
                  <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m: any, i: number) => {
                const qty = parseFloat(m.quantityChange ?? "0");
                const isIn = qty > 0;
                const isExpanded = expandedId === m.id;
                const isLast = i === filtered.length - 1;
                return (
                  <React.Fragment key={m.id}>
                    <tr style={{ borderBottom: isExpanded || isLast ? "none" : "1px solid #f3f4f6" }}>
                      <td style={{ padding: "0.625rem 0.875rem", whiteSpace: "nowrap" }}>{fmt(m.movedAt)}</td>
                      <td style={{ padding: "0.625rem 0.875rem", fontWeight: 500 }}>{m.stockItemName || "—"}</td>
                      <td style={{ padding: "0.625rem 0.875rem" }}>{movementBadge(m.movementType, m.quantityChange)}</td>
                      <td style={{ padding: "0.625rem 0.875rem" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, color: isIn ? "#166534" : "#b91c1c", fontWeight: 600 }}>
                          {isIn ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                          {Math.abs(qty) % 1 === 0 ? Math.abs(qty).toFixed(0) : Math.abs(qty).toFixed(2)} {m.stockItemUnit || ""}
                        </span>
                      </td>
                      <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", fontSize: "0.75rem" }}>
                        {m.referenceType === "spray_application" && "Spray Record"}
                        {m.referenceType === "medicine_record" && "Medicine Record"}
                        {m.referenceType === "delivery" && "Goods Received"}
                        {(!m.referenceType || m.referenceType === "manual") && "Manual"}
                      </td>
                      <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.notes || "—"}</td>
                      <td style={{ padding: "0.375rem 0.5rem", textAlign: "center" }}>
                        {m.notes && (
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : m.id)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "2px 4px", borderRadius: 4, display: "flex", alignItems: "center" }}
                            title={isExpanded ? "Collapse" : "Show full note"}
                          >
                            <ChevronDown size={14} style={{ transition: "transform 0.15s", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }} />
                          </button>
                        )}
                      </td>
                    </tr>
                    {isExpanded && m.notes && (
                      <tr style={{ borderBottom: isLast ? "none" : "1px solid #f3f4f6" }}>
                        <td colSpan={7} style={{ padding: "0 0.875rem 0.75rem 0.875rem" }}>
                          <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 8, padding: "0.625rem 0.875rem" }}>
                            <p style={{ fontSize: "0.7rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 4px" }}>Note</p>
                            <p style={{ fontSize: "0.875rem", color: "#374151", margin: 0, lineHeight: 1.5 }}>{m.notes}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ProductsTab({ products, suppliers, loading, farmId, onRefresh, toast }: any) {
  const [open, setOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<any>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<any>({ name: "", category: "", productCode: "", mappNumber: "", unit: "", reorderLevel: "", storageLocation: "", defaultSupplierId: "", notes: "", approvalRequired: false, approverId: "" });

  const resetForm = () => setForm({ name: "", category: "", productCode: "", mappNumber: "", unit: "", reorderLevel: "", storageLocation: "", defaultSupplierId: "", notes: "", approvalRequired: false, approverId: "" });

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/stock-items`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "Product added" }); onRefresh(); setOpen(false); resetForm(); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });
  const updateMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/stock-items/${editItem.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "Product updated" }); onRefresh(); setOpen(false); setEditItem(null); resetForm(); },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  const { data: staffData } = useQuery({ queryKey: ["farm-staff", farmId], queryFn: () => fetch(`/api/farms/${farmId}/staff`).then(r => r.json()), enabled: !!farmId, staleTime: 120_000 });
  const staffList = staffData?.staff ?? [];

  const filtered = (products ?? []).filter((p: any) => !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase()));

  const openEdit = (p: any) => {
    setEditItem(p);
    setForm({ name: p.name, category: p.category || "", productCode: p.productCode || "", mappNumber: p.mappNumber || "", unit: p.unit || "", reorderLevel: p.reorderLevel || "", storageLocation: p.storageLocation || "", defaultSupplierId: p.defaultSupplierId ? String(p.defaultSupplierId) : "", notes: p.notes || "", approvalRequired: p.approvalRequired || false, approverId: p.approverId ? String(p.approverId) : "" });
    setOpen(true);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
          <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
        </div>
        <Button size="sm" onClick={() => { resetForm(); setEditItem(null); setOpen(true); }}><Plus size={14} className="mr-1" />Add Product</Button>
      </div>
      <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "0.625rem 0.875rem", marginBottom: "1rem", fontSize: "0.8rem", color: "#166534" }}>
        Linking a product here to a Spray Product in Spray Records will automatically deduct stock when applications are saved.
      </div>
      {loading ? <p className="text-sm text-gray-400 py-8 text-center">Loading...</p> : filtered.length === 0 ? (
        <EmptyState icon={Package} title="No products in catalogue" subtitle="Add products to track stock for fertilisers, pesticides, seeds and more" />
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Product Name", "Category", "Code", "MAPP No.", "Unit", "Reorder At", "Default Supplier", "Approval", ""].map(h => (
                  <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p: any, i: number) => (
                <tr key={p.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <td style={{ padding: "0.625rem 0.875rem", fontWeight: 500 }}>{p.name}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{p.category || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", fontFamily: "monospace", fontSize: "0.75rem" }}>{p.productCode || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", fontFamily: "monospace", fontSize: "0.75rem" }}>{p.mappNumber || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem" }}>{p.unit || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem" }}>{p.reorderLevel ? `${p.reorderLevel} ${p.unit || ""}` : "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{p.defaultSupplierName || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem" }}>
                    {p.approvalRequired ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#ede9fe", color: "#6d28d9", borderRadius: 20, padding: "2px 8px", fontSize: "0.7rem", fontWeight: 700, whiteSpace: "nowrap" }}>
                        ✓ {p.approverName || "Any manager"}
                      </span>
                    ) : (
                      <span style={{ color: "#d1d5db", fontSize: "0.75rem" }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: "0.625rem 0.875rem" }}>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setViewRecord(p)}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <button onClick={() => openEdit(p)} style={{ fontSize: "0.75rem", color: "#166534", cursor: "pointer", background: "none", border: "none" }}>Edit</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) { setEditItem(null); resetForm(); createMut.reset(); updateMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 520 }}>
          <DialogHeader><DialogTitle>{editItem ? "Edit Product" : "Add Product"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Product Name <span style={{ color: "#ef4444" }}>*</span></Label>
              <Input placeholder="e.g. Ammonium Nitrate 34.5%" value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm((f: any) => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{PRODUCT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Unit</Label>
                <Select value={form.unit} onValueChange={v => setForm((f: any) => ({ ...f, unit: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select unit..." /></SelectTrigger>
                  <SelectContent>{UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Product Code</Label>
                <Input placeholder="e.g. AN345" value={form.productCode} onChange={e => setForm((f: any) => ({ ...f, productCode: e.target.value }))} />
              </div>
              <div>
                <Label>MAPP Number (pesticides)</Label>
                <Input placeholder="e.g. MAPP 12345" value={form.mappNumber} onChange={e => setForm((f: any) => ({ ...f, mappNumber: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Reorder Level</Label>
                <Input type="number" step="0.01" placeholder={`qty in ${form.unit || "units"}`} value={form.reorderLevel} onChange={e => setForm((f: any) => ({ ...f, reorderLevel: e.target.value }))} />
              </div>
              <div>
                <Label>Default Supplier</Label>
                <Select value={form.defaultSupplierId} onValueChange={v => setForm((f: any) => ({ ...f, defaultSupplierId: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {suppliers.map((s: any) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Storage Location</Label>
              <Input placeholder="e.g. Chemical Store A" value={form.storageLocation} onChange={e => setForm((f: any) => ({ ...f, storageLocation: e.target.value }))} />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea rows={2} value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} />
            </div>

            {/* ── Approval Settings ── */}
            <div style={{ background: "#f8f4ff", border: "1px solid #e9d5ff", borderRadius: 10, padding: "0.875rem 1rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: form.approvalRequired ? 12 : 0 }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "0.85rem", color: "#4c1d95" }}>Purchase Approval Required</p>
                  <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#6d28d9" }}>When ordering this product, a specific person must approve the PO</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm((f: any) => ({ ...f, approvalRequired: !f.approvalRequired, approverId: !f.approvalRequired ? f.approverId : "" }))}
                  style={{
                    width: 42, height: 24, borderRadius: 12, border: "none", cursor: "pointer", transition: "background 0.2s", flexShrink: 0,
                    background: form.approvalRequired ? "#7c3aed" : "#d1d5db", position: "relative"
                  }}
                >
                  <span style={{
                    position: "absolute", top: 3, width: 18, height: 18, borderRadius: "50%", background: "white",
                    transition: "left 0.2s", left: form.approvalRequired ? 21 : 3,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                  }} />
                </button>
              </div>
              {form.approvalRequired && (
                <div>
                  <Label style={{ fontSize: "0.78rem", color: "#4c1d95" }}>Required Approver</Label>
                  <Select value={form.approverId} onValueChange={v => setForm((f: any) => ({ ...f, approverId: v === "__none__" ? "" : v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff member..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— No specific person (any manager)</SelectItem>
                      {staffList.map((s: any) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name} <span style={{ color: "#9ca3af", fontSize: "0.75em" }}>· {s.role}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {staffList.length === 0 && (
                    <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: 4 }}>No staff assigned to this farm yet. Staff can be added in the Staff & Training section.</p>
                  )}
                </div>
              )}
            </div>
          </div>
          <DialogMutationError mutation={editItem ? updateMut : createMut} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); setEditItem(null); resetForm(); }}>Cancel</Button>
            <Button onClick={() => {
              const body = { ...form, approverId: form.approverId && form.approverId !== "__none__" ? Number(form.approverId) : null };
              editItem ? updateMut.mutate(body) : createMut.mutate(body);
            }} disabled={!form.name || (editItem ? updateMut.isPending : createMut.isPending)}>
              {editItem ? "Save Changes" : "Add Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Product Catalogue Entry</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Product Name</p><p className="font-medium text-lg">{viewRecord.name}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Category</p><p className="font-medium">{viewRecord.category || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Unit</p><p className="font-medium">{viewRecord.unit || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Product Code</p><p className="font-medium font-mono">{viewRecord.productCode || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">MAPP Number</p><p className="font-medium font-mono">{viewRecord.mappNumber || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Reorder Level</p><p className="font-medium">{viewRecord.reorderLevel ? `${viewRecord.reorderLevel} ${viewRecord.unit || ""}` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Default Supplier</p><p className="font-medium">{viewRecord.defaultSupplierName || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Storage Location</p><p className="font-medium">{viewRecord.storageLocation || "—"}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium whitespace-pre-wrap">{viewRecord.notes || "—"}</p></div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Purchase Approval</p>
                {viewRecord.approvalRequired ? (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#ede9fe", border: "1px solid #c4b5fd", borderRadius: 8, padding: "4px 12px", marginTop: 4 }}>
                    <span style={{ color: "#6d28d9", fontWeight: 600, fontSize: "0.85rem" }}>
                      Approval required{viewRecord.approverName ? ` from ${viewRecord.approverName}` : " from any manager"}
                    </span>
                  </div>
                ) : (
                  <p className="font-medium text-muted-foreground">Not required</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function poStatusBadge(status: string) {
  const styles: Record<string, { bg: string; color: string; label: string }> = {
    draft: { bg: "#f3f4f6", color: "#374151", label: "Draft" },
    submitted: { bg: "#ede9fe", color: "#6d28d9", label: "Awaiting Approval" },
    sent: { bg: "#dbeafe", color: "#1e40af", label: "Sent" },
    partially_received: { bg: "#fef3c7", color: "#92400e", label: "Part. Received" },
    fully_received: { bg: "#d1fae5", color: "#065f46", label: "Fully Received" },
    cancelled: { bg: "#fee2e2", color: "#991b1b", label: "Cancelled" },
  };
  const s = styles[status] ?? styles.draft;
  return <span style={{ display: "inline-block", background: s.bg, color: s.color, borderRadius: 6, padding: "2px 8px", fontSize: "0.72rem", fontWeight: 600 }}>{s.label}</span>;
}

function PurchaseOrdersTab({ orders, products, suppliers, feedStock, loading, farmId, onRefresh, toast, qc, onGoToGRN, prefilledPo, onClearPrefilledPo }: any) {
  const { isAtLeast, displayName } = useUserRole();
  const emptyForm = { supplierId: "", orderDate: new Date().toISOString().slice(0, 10), expectedDeliveryDate: "", status: "draft", notes: "" };
  const emptyLine = { lineType: "item", stockItemId: "", description: "", category: "", quantityOrdered: "", unit: "", unitPricePence: "", notes: "" };
  const [open, setOpen] = useState(!!prefilledPo);
  const [viewPo, setViewPo] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<any>(prefilledPo ? prefilledPo.form : emptyForm);
  const [lines, setLines] = useState<any[]>(prefilledPo ? prefilledPo.lines : [emptyLine]);

  useEffect(() => {
    if (prefilledPo) {
      setForm(prefilledPo.form);
      setLines(prefilledPo.lines);
      setOpen(true);
      onClearPrefilledPo?.();
    }
  }, []);

  const viewQ = useQuery({
    queryKey: ["purchase-order-detail", viewPo?.id],
    queryFn: () => fetch(`/api/farms/${farmId}/purchase-orders/${viewPo.id}`).then(r => r.json()),
    enabled: !!viewPo?.id,
  });

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/purchase-orders`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "Purchase Order created" }); onRefresh(); setOpen(false); setForm(emptyForm); setLines([{ ...emptyLine }]); },
    onError: () => toast({ title: "Failed to create PO", variant: "destructive" }),
  });

  const updateStatusMut = useMutation({
    mutationFn: ({ poId, status }: any) => fetch(`/api/farms/${farmId}/purchase-orders/${poId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "Status updated" }); onRefresh(); if (viewPo) qc.invalidateQueries({ queryKey: ["purchase-order-detail", viewPo.id] }); },
    onError: () => toast({ title: "Failed to update status", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (poId: number) => fetch(`/api/farms/${farmId}/purchase-orders/${poId}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "PO deleted" }); onRefresh(); setViewPo(null); },
    onError: () => toast({ title: "Failed to delete PO", variant: "destructive" }),
  });

  const [statusFilter, setStatusFilter] = useState<string>("outstanding");
  const OUTSTANDING_STATUSES = ["draft", "submitted", "sent", "partially_received"];

  const statusCounts = (orders ?? []).reduce((acc: Record<string, number>, po: any) => {
    acc[po.status] = (acc[po.status] || 0) + 1;
    acc.all = (acc.all || 0) + 1;
    if (OUTSTANDING_STATUSES.includes(po.status)) acc.outstanding = (acc.outstanding || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusFiltered = (orders ?? []).filter((po: any) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "outstanding") return OUTSTANDING_STATUSES.includes(po.status);
    return po.status === statusFilter;
  });

  const filtered = statusFiltered.filter((po: any) => !search || po.poNumber?.toLowerCase().includes(search.toLowerCase()) || po.supplierName?.toLowerCase().includes(search.toLowerCase()));

  const addLine = () => setLines(ls => [...ls, emptyLine]);
  const removeLine = (i: number) => setLines(ls => ls.filter((_, idx) => idx !== i));
  const updateLine = (i: number, field: string, val: string) => setLines(ls => ls.map((l, idx) => idx === i ? { ...l, [field]: val } : l));

  const handleCreate = () => {
    const validLines = lines.filter(l =>
      (l.lineType !== "service" && l.stockItemId && l.quantityOrdered) ||
      (l.lineType === "service" && l.description && l.quantityOrdered)
    );
    createMut.mutate({
      ...form,
      submittedByName: displayName || undefined,
      lines: validLines.map(l => ({
        stockItemId: l.lineType !== "service" && l.stockItemId ? Number(l.stockItemId) : null,
        quantityOrdered: parseFloat(l.quantityOrdered),
        unitPricePence: l.unitPricePence ? Math.round(parseFloat(l.unitPricePence) * 100) : null,
        notes: l.lineType === "service"
          ? [l.description, l.category ? `[${l.category}]` : ""].filter(Boolean).join(" ") + (l.notes ? ` — ${l.notes}` : "")
          : (l.notes || null),
        feedStockItemId: null,
      })),
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
    { key: "all", label: "All", color: "#6b7280", bg: "#f9fafb" },
  ];

  return (
    <div>
      {/* ── Manager Approval Banner ── */}
      {isAtLeast("manager") && (statusCounts["submitted"] ?? 0) > 0 && (
        <div style={{ background: "linear-gradient(135deg, #6d28d9, #7c3aed)", color: "white", borderRadius: 10, padding: "0.875rem 1rem", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: "50%", padding: 6, flexShrink: 0 }}>
              <ClipboardList size={16} />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9rem" }}>
                {statusCounts["submitted"]} Purchase Order{statusCounts["submitted"] !== 1 ? "s" : ""} awaiting your approval
              </p>
              <p style={{ margin: "2px 0 0", fontSize: "0.78rem", opacity: 0.9 }}>
                Review, approve, or return to draft — click to filter the list below
              </p>
            </div>
          </div>
          <button onClick={() => setStatusFilter("submitted")} style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.35)", borderRadius: 7, color: "white", cursor: "pointer", padding: "6px 14px", fontSize: "0.8rem", fontWeight: 600, whiteSpace: "nowrap" }}>
            Review POs →
          </button>
        </div>
      )}

      {/* ── Status Filter Tabs ── */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
        {STATUS_TABS.map(tab => {
          const count = tab.key === "outstanding" ? (statusCounts.outstanding ?? 0) : tab.key === "all" ? (statusCounts.all ?? 0) : (statusCounts[tab.key] ?? 0);
          const active = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              style={{
                display: "flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 20,
                border: active ? `2px solid ${tab.color}` : "1px solid #e5e7eb",
                background: active ? tab.bg : "white",
                color: active ? tab.color : "#6b7280",
                fontWeight: active ? 700 : 500,
                fontSize: "0.78rem", cursor: "pointer", transition: "all 0.15s",
              }}
            >
              {tab.label}
              {count > 0 && (
                <span style={{ background: active ? tab.color : "#e5e7eb", color: active ? "white" : "#374151", borderRadius: 10, padding: "0px 6px", fontSize: "0.7rem", fontWeight: 700 }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Search + Raise PO ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
          <Input placeholder="Search by PO number or supplier..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
        </div>
        <Button size="sm" onClick={() => { setForm(emptyForm); setLines([{ ...emptyLine }]); setOpen(true); }}>
          <Plus size={14} className="mr-1" />Raise Purchase Order
        </Button>
      </div>

      {loading ? <p className="text-sm text-gray-400 py-8 text-center">Loading...</p> : (orders ?? []).length === 0 ? (
        <EmptyState icon={ClipboardList} title="No purchase orders yet" subtitle="Raise a PO to track what you've ordered from suppliers, then link GRNs when goods arrive" />
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#9ca3af", fontSize: "0.85rem" }}>
          No orders match this filter. <button onClick={() => setStatusFilter("all")} style={{ color: "#166534", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Show all</button>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["PO Number", "Supplier", "Order Date", "Expected Delivery", ...(statusFilter === "submitted" ? ["Submitted By"] : []), "Lines", "Est. Value", "Status", ""].map(h => (
                  <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((po: any, i: number) => (
                <tr key={po.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none", background: po.status === "submitted" && isAtLeast("manager") ? "#faf5ff" : "white" }}>
                  <td style={{ padding: "0.625rem 0.875rem" }}>
                    <span style={{ fontFamily: "monospace", fontSize: "0.85rem", fontWeight: 700, color: "#166534" }}>{po.poNumber}</span>
                    {po.poNumber?.startsWith("AUTO-") && (
                      <span style={{ marginLeft: 6, fontSize: "0.65rem", background: "#fef3c7", color: "#92400e", borderRadius: 4, padding: "1px 5px", fontWeight: 600, verticalAlign: "middle" }}>auto</span>
                    )}
                  </td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#374151" }}>{po.supplierName || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", whiteSpace: "nowrap" }}>{fmt(po.orderDate)}</td>
                  <td style={{ padding: "0.625rem 0.875rem", whiteSpace: "nowrap", color: po.expectedDeliveryDate ? "#374151" : "#9ca3af" }}>{po.expectedDeliveryDate ? fmt(po.expectedDeliveryDate) : "Not set"}</td>
                  {statusFilter === "submitted" && (
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6d28d9", fontSize: "0.82rem" }}>{po.submittedByName || "—"}</td>
                  )}
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{po.lineCount ?? 0} line{po.lineCount !== 1 ? "s" : ""}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: po.totalPence ? "#111827" : "#9ca3af", fontWeight: po.totalPence ? 600 : 400, whiteSpace: "nowrap" }}>
                    {po.totalPence ? `£${(Number(po.totalPence) / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
                  </td>
                  <td style={{ padding: "0.625rem 0.875rem" }}>{poStatusBadge(po.status)}</td>
                  <td style={{ padding: "0.5rem 0.875rem" }}>
                    <button onClick={() => setViewPo(po)} style={{ fontSize: "0.75rem", color: po.status === "submitted" && isAtLeast("manager") ? "#6d28d9" : "#166534", cursor: "pointer", background: "none", border: "none", fontWeight: 600 }}>
                      {po.status === "submitted" && isAtLeast("manager") ? "Review" : "View"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) { setForm(emptyForm); setLines([{ ...emptyLine }]); createMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 860, maxHeight: "92vh", overflowY: "auto" }}>
          <DialogHeader>
            <DialogTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ClipboardList size={17} style={{ color: "#166534" }} />
              Raise Purchase Order
            </DialogTitle>
            <p style={{ fontSize: "0.78rem", color: "#6b7280", margin: 0 }}>Order stock items, goods or services from any supplier across the holding</p>
          </DialogHeader>

          <div className="space-y-4 py-1">
            {/* ── Header: Supplier / Status / Dates / Notes ── */}
            <div style={{ background: "#f9fafb", borderRadius: 10, padding: "0.875rem 1rem", border: "1px solid #e5e7eb" }}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Supplier</Label>
                  <Select value={form.supplierId} onValueChange={v => setForm((f: any) => ({ ...f, supplierId: v === "__none__" ? "" : v }))}>
                    <SelectTrigger><SelectValue placeholder="Select supplier..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">No supplier / TBC</SelectItem>
                      {suppliers.map((s: any) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm((f: any) => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="submitted">Submit for Approval</SelectItem>
                      {isAtLeast("manager") && <SelectItem value="sent">Sent to Supplier</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <Label>Order Date <span style={{ color: "#ef4444" }}>*</span></Label>
                  <Input type="date" value={form.orderDate} onChange={e => setForm((f: any) => ({ ...f, orderDate: e.target.value }))} />
                </div>
                <div>
                  <Label>Expected Delivery</Label>
                  <Input type="date" value={form.expectedDeliveryDate} onChange={e => setForm((f: any) => ({ ...f, expectedDeliveryDate: e.target.value }))} />
                </div>
              </div>
              <div className="mt-3">
                <Label>Notes / Special Instructions</Label>
                <Input placeholder="e.g. Deliver to grain store, call ahead — contract ref 2024-A" value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>

            {/* ── Order Lines ── */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: "0.85rem", color: "#111827", margin: 0 }}>Order Lines</p>
                  <p style={{ fontSize: "0.72rem", color: "#9ca3af", margin: "2px 0 0" }}>Mix catalogue stock items and free-text services or one-off goods on the same order</p>
                </div>
                <button onClick={addLine} style={{ fontSize: "0.75rem", color: "#166534", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 4, padding: "4px 10px" }}>
                  <Plus size={12} />Add Line
                </button>
              </div>

              <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
                  <thead>
                    <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                      <th style={{ padding: "0.5rem 0.5rem", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "0.7rem", width: 110 }}>Type</th>
                      <th style={{ padding: "0.5rem 0.5rem", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "0.7rem" }}>Product / Description</th>
                      <th style={{ padding: "0.5rem 0.5rem", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "0.7rem", width: 64 }}>Qty</th>
                      <th style={{ padding: "0.5rem 0.5rem", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "0.7rem", width: 76 }}>Unit</th>
                      <th style={{ padding: "0.5rem 0.5rem", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "0.7rem", width: 88 }}>£ / Unit</th>
                      <th style={{ padding: "0.5rem 0.5rem", textAlign: "right", fontWeight: 600, color: "#6b7280", fontSize: "0.7rem", width: 72 }}>Total</th>
                      <th style={{ width: 30 }} />
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((l: any, i: number) => {
                      const isService = l.lineType === "service";
                      const selectedProduct = !isService && l.stockItemId ? (products ?? []).find((p: any) => String(p.id) === String(l.stockItemId)) : null;
                      const lineTotal = l.quantityOrdered && l.unitPricePence ? parseFloat(l.quantityOrdered) * parseFloat(l.unitPricePence) : null;
                      return (
                        <tr key={i} style={{ borderBottom: i < lines.length - 1 ? "1px solid #f3f4f6" : "none", background: isService ? "#fafaf9" : "white" }}>
                          {/* Type toggle */}
                          <td style={{ padding: "0.375rem 0.5rem", verticalAlign: "top" }}>
                            <Select value={l.lineType || "item"} onValueChange={v => updateLine(i, "lineType", v)}>
                              <SelectTrigger style={{ height: 30, fontSize: "0.72rem", borderColor: isService ? "#d97706" : "#166534", color: isService ? "#92400e" : "#166534", background: isService ? "#fffbeb" : "#f0fdf4" }}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="item">📦 Stock Item</SelectItem>
                                <SelectItem value="service">🔧 Service / Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>

                          {/* Product / Description */}
                          <td style={{ padding: "0.375rem 0.5rem", verticalAlign: "top" }}>
                            {isService ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                <Input
                                  placeholder="What are you ordering? e.g. Agronomy visit, Haulage, Lab testing..."
                                  value={l.description}
                                  onChange={e => updateLine(i, "description", e.target.value)}
                                  style={{ height: 30, fontSize: "0.78rem" }}
                                />
                                <Select value={l.category || "__none__"} onValueChange={v => updateLine(i, "category", v === "__none__" ? "" : v)}>
                                  <SelectTrigger style={{ height: 26, fontSize: "0.72rem" }}>
                                    <SelectValue placeholder="Category (optional)..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="__none__">Uncategorised service</SelectItem>
                                    {SERVICE_CATEGORIES.map((c: string) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </div>
                            ) : (
                              <Select value={l.stockItemId} onValueChange={v => {
                                const prod = (products ?? []).find((p: any) => String(p.id) === v);
                                setLines((ls: any[]) => ls.map((ll, idx) => idx === i ? { ...ll, stockItemId: v, unit: prod?.unit || ll.unit } : ll));
                              }}>
                                <SelectTrigger style={{ height: 30, fontSize: "0.78rem" }}>
                                  <SelectValue placeholder="Select from catalogue..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {(products ?? []).length === 0 && <SelectItem value="__empty__" disabled>No products in catalogue yet</SelectItem>}
                                  {(products ?? []).map((p: any) => (
                                    <SelectItem key={p.id} value={String(p.id)}>
                                      {p.name}{p.category ? <span style={{ color: "#9ca3af" }}> · {p.category}</span> : ""}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                            {/* Approval indicator */}
                            {!isService && l.stockItemId && (() => {
                              const prod = (products ?? []).find((p: any) => String(p.id) === l.stockItemId);
                              if (!prod?.approvalRequired) return null;
                              return (
                                <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 4, background: "#ede9fe", borderRadius: 4, padding: "2px 7px" }}>
                                  <span style={{ fontSize: "0.68rem", color: "#6d28d9", fontWeight: 600 }}>
                                    ⚠ Approval required{prod.approverName ? ` from ${prod.approverName}` : ""}
                                  </span>
                                </div>
                              );
                            })()}
                          </td>

                          {/* Qty */}
                          <td style={{ padding: "0.375rem 0.5rem", verticalAlign: "top" }}>
                            <Input type="number" step="0.01" min="0" placeholder="0" value={l.quantityOrdered} onChange={e => updateLine(i, "quantityOrdered", e.target.value)} style={{ height: 30, fontSize: "0.78rem" }} />
                          </td>

                          {/* Unit */}
                          <td style={{ padding: "0.375rem 0.5rem", verticalAlign: "top" }}>
                            {selectedProduct?.unit && !isService ? (
                              <span style={{ fontSize: "0.78rem", color: "#6b7280", lineHeight: "30px", display: "block", paddingLeft: 4 }}>{selectedProduct.unit}</span>
                            ) : (
                              <Select value={l.unit || "__none__"} onValueChange={v => updateLine(i, "unit", v === "__none__" ? "" : v)}>
                                <SelectTrigger style={{ height: 30, fontSize: "0.72rem" }}>
                                  <SelectValue placeholder="Unit" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__none__">—</SelectItem>
                                  {ALL_UNITS.map((u: string) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            )}
                          </td>

                          {/* Unit Price */}
                          <td style={{ padding: "0.375rem 0.5rem", verticalAlign: "top" }}>
                            <div style={{ position: "relative" }}>
                              <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: "0.7rem", pointerEvents: "none" }}>£</span>
                              <Input type="number" step="0.01" min="0" placeholder="0.00" value={l.unitPricePence} onChange={e => updateLine(i, "unitPricePence", e.target.value)} style={{ height: 30, fontSize: "0.78rem", paddingLeft: 20 }} />
                            </div>
                          </td>

                          {/* Line total */}
                          <td style={{ padding: "0.375rem 0.5rem", textAlign: "right", verticalAlign: "top" }}>
                            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: lineTotal ? "#111827" : "#d1d5db", lineHeight: "30px" }}>
                              {lineTotal != null ? `£${lineTotal.toFixed(2)}` : "—"}
                            </span>
                          </td>

                          {/* Delete */}
                          <td style={{ padding: "0.375rem 0.5rem", verticalAlign: "top" }}>
                            {lines.length > 1 && (
                              <button onClick={() => removeLine(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 2, marginTop: 2 }} title="Remove line">
                                <Trash2 size={13} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Order total */}
              {(() => {
                const total = (lines as any[]).reduce((sum, l) => {
                  if (l.quantityOrdered && l.unitPricePence) return sum + parseFloat(l.quantityOrdered) * parseFloat(l.unitPricePence);
                  return sum;
                }, 0);
                return total > 0 ? (
                  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 6, paddingTop: 8, paddingRight: 36 }}>
                    <span style={{ fontSize: "0.78rem", color: "#6b7280" }}>Estimated Order Total:</span>
                    <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#111827" }}>£{total.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                ) : null;
              })()}
            </div>

            {/* Feed stock link — only shown if any line is linked to a Feed item */}
            {(lines as any[]).some(l => l.lineType !== "service" && l.stockItemId && (products ?? []).find((p: any) => String(p.id) === String(l.stockItemId) && p.category === "Feed")) && (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.625rem 0.875rem" }}>
                <p style={{ fontSize: "0.78rem", color: "#166534", fontWeight: 600, margin: "0 0 4px" }}>🌾 Feed Stock Bin Links</p>
                <p style={{ fontSize: "0.75rem", color: "#4b7c6f", margin: 0 }}>
                  Feed items on this PO will update Feed Stock awaiting quantities automatically when the order is active. To link a specific bin, record the GRN after delivery.
                </p>
              </div>
            )}
          </div>

          <DialogMutationError mutation={createMut} message="Failed to create PO — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.orderDate || createMut.isPending}>
              {createMut.isPending ? "Creating…" : "Create Purchase Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewPo} onOpenChange={o => { if (!o) { setViewPo(null); updateStatusMut.reset(); deleteMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 740 }}>
          <DialogHeader>
            <DialogTitle style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontFamily: "monospace", color: "#166534" }}>{viewPo?.poNumber}</span>
              {viewPo && poStatusBadge(viewPo.status)}
            </DialogTitle>
          </DialogHeader>
          {viewQ.isLoading ? <p className="text-sm text-gray-400 py-6 text-center">Loading...</p> : detail ? (
            <div className="space-y-4 py-1">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span style={{ color: "#6b7280", fontSize: "0.75rem" }}>Supplier</span><br /><strong>{detail.record?.supplierName || "—"}</strong></div>
                <div><span style={{ color: "#6b7280", fontSize: "0.75rem" }}>Order Date</span><br /><strong>{fmt(detail.record?.orderDate)}</strong></div>
                <div><span style={{ color: "#6b7280", fontSize: "0.75rem" }}>Expected Delivery</span><br /><strong>{detail.record?.expectedDeliveryDate ? fmt(detail.record.expectedDeliveryDate) : "—"}</strong></div>
                {detail.record?.submittedByName && (
                  <div><span style={{ color: "#6b7280", fontSize: "0.75rem" }}>Submitted By</span><br /><strong style={{ color: "#6d28d9" }}>{detail.record.submittedByName}</strong></div>
                )}
              </div>
              {viewPo?.poNumber?.startsWith("AUTO-") && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 8, padding: "0.625rem 0.875rem" }}>
                  <AlertTriangle size={14} color="#92400e" style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: "0.8rem", color: "#78350f", margin: 0 }}>
                    <strong>Auto-generated PO</strong> — this draft was created automatically when stock dropped below reorder level. Review the suggested quantity and submit for approval or edit as needed before sending to the supplier.
                  </p>
                </div>
              )}
              {detail.record?.notes && <p style={{ fontSize: "0.85rem", color: "#6b7280", background: "#f9fafb", borderRadius: 6, padding: "0.5rem 0.75rem" }}>{detail.record.notes}</p>}

              <div>
                <p style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: 6, color: "#374151" }}>Order Lines</p>
                {(detail.lines ?? []).length === 0 ? <p style={{ fontSize: "0.8rem", color: "#9ca3af" }}>No lines recorded</p> : (
                  <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                      <thead>
                        <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                          {["Product", "Ordered", "Received", "Unit Price", "Progress"].map(h => (
                            <th key={h} style={{ padding: "0.5rem 0.75rem", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "0.72rem" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(detail.lines ?? []).map((l: any, i: number) => {
                          const pct = l.quantityOrdered > 0 ? Math.min(100, Math.round((parseFloat(l.quantityReceived ?? 0) / parseFloat(l.quantityOrdered)) * 100)) : 0;
                          return (
                            <tr key={l.id} style={{ borderBottom: i < detail.lines.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                              <td style={{ padding: "0.5rem 0.75rem", fontWeight: 500 }}>
                                {l.stockItemName ? (
                                  <span>{l.stockItemName}</span>
                                ) : l.notes ? (
                                  <span style={{ color: "#374151" }}>{l.notes}</span>
                                ) : (
                                  <span style={{ color: "#9ca3af" }}>—</span>
                                )}
                              </td>
                              <td style={{ padding: "0.5rem 0.75rem" }}>{fmtQty(l.quantityOrdered, l.stockItemUnit)}</td>
                              <td style={{ padding: "0.5rem 0.75rem", color: pct >= 100 ? "#166534" : "#374151" }}>{fmtQty(l.quantityReceived ?? 0, l.stockItemUnit)}</td>
                              <td style={{ padding: "0.5rem 0.75rem" }}>{l.unitPricePence ? `£${(l.unitPricePence / 100).toFixed(2)}` : "—"}</td>
                              <td style={{ padding: "0.5rem 0.75rem" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <div style={{ flex: 1, height: 6, background: "#e5e7eb", borderRadius: 3 }}>
                                    <div style={{ width: `${pct}%`, height: "100%", background: pct >= 100 ? "#16a34a" : "#f59e0b", borderRadius: 3 }} />
                                  </div>
                                  <span style={{ fontSize: "0.7rem", color: "#6b7280", minWidth: 28 }}>{pct}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {(detail.grns ?? []).length > 0 && (
                <div>
                  <p style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: 6, color: "#374151" }}>Goods Received (GRNs)</p>
                  <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                      <thead>
                        <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                          {["GRN No.", "Date", "Product", "Qty", "Batch", "Lot", "Invoice"].map(h => (
                            <th key={h} style={{ padding: "0.5rem 0.75rem", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "0.72rem" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(detail.grns ?? []).map((g: any, i: number) => (
                          <tr key={g.id} style={{ borderBottom: i < detail.grns.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                            <td style={{ padding: "0.5rem 0.75rem", fontFamily: "monospace", color: "#166534", fontWeight: 600, fontSize: "0.75rem" }}>{g.grnNumber || "—"}</td>
                            <td style={{ padding: "0.5rem 0.75rem" }}>{fmt(g.deliveryDate)}</td>
                            <td style={{ padding: "0.5rem 0.75rem" }}>{g.stockItemName || "—"}</td>
                            <td style={{ padding: "0.5rem 0.75rem" }}>{fmtQty(g.quantity, g.stockItemUnit)}</td>
                            <td style={{ padding: "0.5rem 0.75rem", fontFamily: "monospace", fontSize: "0.72rem", color: "#6b7280" }}>{g.batchNumber || "—"}</td>
                            <td style={{ padding: "0.5rem 0.75rem", fontFamily: "monospace", fontSize: "0.72rem", color: "#6b7280" }}>{g.lotNumber || "—"}</td>
                            <td style={{ padding: "0.5rem 0.75rem", color: "#6b7280" }}>{g.invoiceReference || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Approval panel — submitted, for managers */}
              {viewPo?.status === "submitted" && isAtLeast("manager") && (
                <div style={{ background: "linear-gradient(135deg, #6d28d9, #7c3aed)", borderRadius: 10, padding: "0.875rem 1rem", color: "white", marginBottom: 8 }}>
                  <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: "0.9rem" }}>Approval Required</p>
                  <p style={{ margin: "0 0 10px", fontSize: "0.78rem", opacity: 0.9 }}>
                    {viewPo?.submittedByName ? `Submitted by ${viewPo.submittedByName} — ` : ""}Review the order lines and either approve (send to supplier) or return to draft for amendment.
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Button size="sm" style={{ background: "rgba(255,255,255,0.95)", color: "#166534", fontWeight: 700 }} onClick={() => updateStatusMut.mutate({ poId: viewPo.id, status: "sent" })} disabled={updateStatusMut.isPending}>
                      ✓ Approve &amp; Send to Supplier
                    </Button>
                    <Button size="sm" style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.35)" }} variant="outline" onClick={() => updateStatusMut.mutate({ poId: viewPo.id, status: "draft" })} disabled={updateStatusMut.isPending}>
                      Return to Draft
                    </Button>
                  </div>
                </div>
              )}
              {/* Awaiting approval — for non-managers */}
              {viewPo?.status === "submitted" && !isAtLeast("manager") && (
                <div style={{ background: "#ede9fe", border: "1px solid #c4b5fd", borderRadius: 10, padding: "0.75rem 1rem", display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ background: "#6d28d9", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <ClipboardList size={14} color="white" />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: "0.85rem", color: "#4c1d95" }}>Awaiting Manager Approval</p>
                    <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#6d28d9" }}>
                      This order has been submitted and is pending approval by a Farm Manager or Owner.
                    </p>
                  </div>
                </div>
              )}
              <DialogMutationError mutation={updateStatusMut} message="Failed to update status — please try again." />
              <DialogMutationError mutation={deleteMut} message="Failed to delete — please try again." />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {viewPo?.status === "draft" && (
                  <Button size="sm" variant="outline" style={{ background: "#ede9fe", color: "#6d28d9", borderColor: "#c4b5fd" }} onClick={() => updateStatusMut.mutate({ poId: viewPo.id, status: "submitted" })} disabled={updateStatusMut.isPending}>
                    Submit for Approval
                  </Button>
                )}
                {viewPo?.status === "draft" && isAtLeast("manager") && (
                  <Button size="sm" variant="outline" onClick={() => updateStatusMut.mutate({ poId: viewPo.id, status: "sent" })} disabled={updateStatusMut.isPending}>Mark as Sent</Button>
                )}
                {viewPo?.status !== "cancelled" && viewPo?.status !== "fully_received" && (
                  <>
                    <Button size="sm" onClick={() => { setViewPo(null); onGoToGRN(); }}>Log Goods Received (GRN)</Button>
                    <Button size="sm" variant="outline" style={{ color: "#b91c1c", borderColor: "#fecaca" }} onClick={() => updateStatusMut.mutate({ poId: viewPo.id, status: "cancelled" })} disabled={updateStatusMut.isPending}>Cancel PO</Button>
                  </>
                )}
                {(viewPo?.status === "draft" || viewPo?.status === "submitted") && (
                  <Button size="sm" variant="outline" style={{ color: "#b91c1c", borderColor: "#fecaca" }} onClick={() => deleteMut.mutate(viewPo.id)} disabled={deleteMut.isPending}>Delete Draft</Button>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
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
  { value: "other", label: "Other" },
];

function certExpiryStatus(expiry: string | null | undefined): "ok" | "soon" | "expired" | null {
  if (!expiry) return null;
  const d = new Date(expiry);
  const now = new Date();
  const daysUntil = Math.round((d.getTime() - now.getTime()) / (1000 * 86400));
  if (daysUntil < 0) return "expired";
  if (daysUntil <= 60) return "soon";
  return "ok";
}

function SuppliersTab({ suppliers, loading, farmId, onRefresh, toast }: any) {
  const [open, setOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<any>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const { data: contractorsData } = useQuery({
    queryKey: ["contractors-hs", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/contractors?showInactive=false`).then(r => r.json()),
  });
  const linkedSupplierIds = new Set<number>((contractorsData?.contractors ?? []).map((c: any) => c.supplierId).filter(Boolean));
  const emptyForm = { name: "", contactName: "", email: "", phone: "", address: "", category: "", supplierType: "general", accountNumber: "", ufasNumber: "", femasNumber: "", aphaFeedRegNumber: "", certificationBody: "", certificationExpiry: "", notes: "" };
  const [form, setForm] = useState<any>(emptyForm);

  const resetForm = () => setForm(emptyForm);

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/suppliers`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "Trade contact added" }); onRefresh(); setOpen(false); resetForm(); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });
  const updateMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/suppliers/${editItem.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "Trade contact updated" }); onRefresh(); setOpen(false); setEditItem(null); resetForm(); },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  const deactivateMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/suppliers/${id}/deactivate`, { method: "PATCH" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "Contact deactivated — all historic records preserved" }); onRefresh(); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const reactivateMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/suppliers/${id}/reactivate`, { method: "PATCH" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "Contact reactivated" }); onRefresh(); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const allSuppliers = (suppliers ?? []);
  const allActive = allSuppliers.filter((s: any) => s.isActive !== false);
  const filtered = allSuppliers.filter((s: any) =>
    (filterType === "all" || s.supplierType === filterType) &&
    (!search || s.name?.toLowerCase().includes(search.toLowerCase()))
  );

  const expiringSoon = allActive.filter((s: any) => {
    const st = certExpiryStatus(s.certificationExpiry);
    return st === "expired" || st === "soon";
  });

  const openEdit = (s: any) => {
    setEditItem(s);
    setForm({
      name: s.name || "", contactName: s.contactName || "", email: s.email || "", phone: s.phone || "",
      address: s.address || "", category: s.category || "", supplierType: s.supplierType || "general",
      accountNumber: s.accountNumber || "", ufasNumber: s.ufasNumber || "", femasNumber: s.femasNumber || "",
      aphaFeedRegNumber: s.aphaFeedRegNumber || "", certificationBody: s.certificationBody || "",
      certificationExpiry: s.certificationExpiry ? String(s.certificationExpiry).substring(0, 10) : "",
      notes: s.notes || "",
    });
    setOpen(true);
  };

  const isFeedSupplier = form.supplierType === "feed";

  return (
    <div>
      {expiringSoon.length > 0 && (
        <div style={{ background: "#fef3c7", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1rem", display: "flex", alignItems: "flex-start", gap: 8 }}>
          <AlertTriangle size={16} color="#92400e" style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: "0.875rem", color: "#92400e", fontWeight: 600, marginBottom: 2 }}>Trade contact certifications require attention:</p>
            {expiringSoon.map((s: any) => {
              const st = certExpiryStatus(s.certificationExpiry);
              return (
                <p key={s.id} style={{ fontSize: "0.8rem", color: "#92400e" }}>
                  <strong>{s.name}</strong> — {st === "expired" ? "UFAS/certification EXPIRED" : "expires soon"} ({s.certificationExpiry ? new Date(s.certificationExpiry).toLocaleDateString("en-GB") : ""})
                </p>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
          <Input placeholder="Search trade contacts..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {SUPPLIER_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={() => { resetForm(); setEditItem(null); setOpen(true); }}><Plus size={14} className="mr-1" />Add Trade Contact</Button>
      </div>

      {loading ? <p className="text-sm text-gray-400 py-8 text-center">Loading...</p> : filtered.length === 0 ? (
        <EmptyState icon={Building2} title="No trade contacts found" subtitle="Add trade contacts — buyers, processors, input suppliers and more" />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
          {filtered.map((s: any) => {
            const certStatus = certExpiryStatus(s.certificationExpiry);
            const isActive = s.isActive !== false;
            return (
              <div key={s.id} style={{ background: isActive ? "#fff" : "#f9fafb", opacity: isActive ? 1 : 0.7, border: !isActive ? "1px solid #e5e7eb" : certStatus === "expired" ? "1.5px solid #ef4444" : certStatus === "soon" ? "1.5px solid #f59e0b" : "1px solid #e5e7eb", borderRadius: 10, padding: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: "0.9rem", textDecoration: isActive ? "none" : "line-through", color: isActive ? undefined : "#9ca3af" }}>{s.name}</span>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {!isActive && <Badge style={{ background: "#f3f4f6", color: "#6b7280", border: "none", fontSize: "0.65rem", letterSpacing: "0.05em" }}>INACTIVE</Badge>}
                    {isActive && s.isApproved && <Badge style={{ background: "#d1fae5", color: "#065f46", border: "none", fontSize: "0.7rem" }}>Approved</Badge>}
                    {isActive && s.supplierType && s.supplierType !== "general" && (
                      <Badge style={{ background: "#eff6ff", color: "#1d4ed8", border: "none", fontSize: "0.7rem" }}>
                        {SUPPLIER_TYPES.find(t => t.value === s.supplierType)?.label ?? s.supplierType}
                      </Badge>
                    )}
                    {isActive && linkedSupplierIds.has(s.id) && (
                      <Badge style={{ background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0", fontSize: "0.7rem" }}>H&amp;S File</Badge>
                    )}
                  </div>
                </div>
                {s.category && <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 4 }}>{s.category}</p>}
                {s.contactName && <p style={{ fontSize: "0.8rem", color: "#374151" }}>{s.contactName}</p>}
                {s.phone && <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>{s.phone}</p>}
                {s.email && <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>{s.email}</p>}
                {isActive && s.ufasNumber && (
                  <p style={{ fontSize: "0.72rem", color: "#065f46", marginTop: 4, fontFamily: "monospace", background: "#d1fae5", borderRadius: 4, padding: "2px 6px", display: "inline-block" }}>
                    UFAS: {s.ufasNumber}
                  </p>
                )}
                {isActive && s.femasNumber && (
                  <p style={{ fontSize: "0.72rem", color: "#5b21b6", marginTop: 2, fontFamily: "monospace", background: "#ede9fe", borderRadius: 4, padding: "2px 6px", display: "inline-block" }}>
                    FEMAS: {s.femasNumber}
                  </p>
                )}
                {isActive && s.certificationExpiry && (
                  <p style={{ fontSize: "0.72rem", marginTop: 4, color: certStatus === "expired" ? "#dc2626" : certStatus === "soon" ? "#d97706" : "#6b7280" }}>
                    {certStatus === "expired" ? "⚠ Cert EXPIRED" : certStatus === "soon" ? "⚠ Cert expires soon" : "Cert expires:"}{" "}
                    {new Date(s.certificationExpiry).toLocaleDateString("en-GB")}
                  </p>
                )}
                <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setViewRecord(s)}>
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                  {isActive && <button onClick={() => openEdit(s)} style={{ fontSize: "0.75rem", color: "#166534", cursor: "pointer", background: "none", border: "none", padding: 0 }}>Edit</button>}
                  <button
                    onClick={() => isActive ? deactivateMut.mutate(s.id) : reactivateMut.mutate(s.id)}
                    style={{ fontSize: "0.75rem", color: isActive ? "#dc2626" : "#16a34a", cursor: "pointer", background: "none", border: "none", padding: 0 }}>
                    {isActive ? "Deactivate" : "Reactivate"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) { setEditItem(null); resetForm(); createMut.reset(); updateMut.reset(); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editItem ? "Edit Trade Contact" : "Add Trade Contact"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Company Name <span style={{ color: "#ef4444" }}>*</span></Label>
              <Input value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Contact Type</Label>
                <Select value={form.supplierType || "general"} onValueChange={v => setForm((f: any) => ({ ...f, supplierType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SUPPLIER_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm((f: any) => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{SUPPLIER_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Contact Name</Label>
                <Input value={form.contactName} onChange={e => setForm((f: any) => ({ ...f, contactName: e.target.value }))} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={e => setForm((f: any) => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm((f: any) => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <Label>{form.supplierType === "waste" ? "EA Carrier Reg No." : form.supplierType === "hatchery" ? "Hatchery Approval No." : "Account Number"}</Label>
                <Input
                  value={form.accountNumber}
                  onChange={e => setForm((f: any) => ({ ...f, accountNumber: e.target.value }))}
                  placeholder={form.supplierType === "waste" ? "e.g. CBDU01234" : ""}
                  style={form.supplierType === "waste" ? { fontFamily: "monospace" } : {}}
                />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Textarea rows={2} value={form.address} onChange={e => setForm((f: any) => ({ ...f, address: e.target.value }))} />
            </div>

            {isFeedSupplier && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-3">
                <p className="text-xs font-semibold text-green-800">Feed Supplier Approvals — required for Red Tractor &amp; APHA compliance</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>UFAS Approval Number</Label>
                    <Input value={form.ufasNumber} onChange={e => setForm((f: any) => ({ ...f, ufasNumber: e.target.value }))} placeholder="UFAS-XXXX-XXXXXX" className="font-mono text-sm" />
                    <p className="text-xs text-gray-500 mt-1">Universal Feed Assurance Scheme — check supplier certificate</p>
                  </div>
                  <div>
                    <Label>FEMAS Approval Number</Label>
                    <Input value={form.femasNumber} onChange={e => setForm((f: any) => ({ ...f, femasNumber: e.target.value }))} placeholder="FEMAS-XXXX" className="font-mono text-sm" />
                    <p className="text-xs text-gray-500 mt-1">Feed Materials Assurance Scheme (if applicable)</p>
                  </div>
                </div>
                <div>
                  <Label>APHA Feed Business Registration No.</Label>
                  <Input value={form.aphaFeedRegNumber} onChange={e => setForm((f: any) => ({ ...f, aphaFeedRegNumber: e.target.value }))} placeholder="e.g. GB-XXXX-XXXXX" className="font-mono text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Certification body</Label>
                    <Input value={form.certificationBody} onChange={e => setForm((f: any) => ({ ...f, certificationBody: e.target.value }))} placeholder="e.g. UFAS Scheme" />
                  </div>
                  <div>
                    <Label>Certification expiry</Label>
                    <Input type="date" value={form.certificationExpiry} onChange={e => setForm((f: any) => ({ ...f, certificationExpiry: e.target.value }))} />
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label>Notes</Label>
              <Textarea rows={2} value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <DialogMutationError mutation={editItem ? updateMut : createMut} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); setEditItem(null); resetForm(); }}>Cancel</Button>
            <Button onClick={() => {
              const payload = { ...form };
              if (!payload.certificationExpiry) delete payload.certificationExpiry;
              editItem ? updateMut.mutate(payload) : createMut.mutate(payload);
            }} disabled={!form.name || (editItem ? updateMut.isPending : createMut.isPending)}>
              {editItem ? "Save Changes" : "Add Supplier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Main Stock Stocktake Tab ─────────────────────────────────────────────────

const VARIANCE_REASONS: { value: string; label: string }[] = [
  { value: "calibration", label: "Calibration / weighing error" },
  { value: "spillage",    label: "Spillage / wastage" },
  { value: "theft",       label: "Theft / loss" },
  { value: "data-entry",  label: "Data entry error" },
  { value: "other",       label: "Other" },
];

function StocktakeTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [localCounts, setLocalCounts] = useState<Record<number, string>>({});
  const [newOpen, setNewOpen] = useState(false);
  const [newForm, setNewForm] = useState({ stocktakeDate: new Date().toISOString().slice(0, 10), notes: "" });

  type ConfirmMutation = { isError: boolean; isPending: boolean; error: unknown; reset: () => void };
  type ConfirmState = { open: boolean; title: string; message: string; run: (onSuccess: () => void) => void; mutation?: ConfirmMutation; confirmLabel?: string; variant?: "default" | "destructive" };
  const [confirmState, setConfirmState] = useState<ConfirmState>({ open: false, title: "", message: "", run: () => {} });
  const closeConfirm = () => { confirmState.mutation?.reset(); setConfirmState(s => ({ ...s, open: false })); };
  const showConfirm = (title: string, message: string, run: (onSuccess: () => void) => void, opts?: { mutation?: ConfirmMutation; confirmLabel?: string; variant?: "default" | "destructive" }) =>
    setConfirmState({ open: true, title, message, run, ...opts });

  type StocktakeItem = { id: number; stockItemId: number | null; itemName: string; stockType: string | null; unit: string | null; location: string | null; expectedQty: string; countedQty: string | null; variance: string | null; varianceValue: string | null; varianceReason: string | null; notes: string | null; unitCostPence: number | null };
  type StocktakeSession = { id: number; stocktakeDate: string; status: string; itemCount: number; countedCount: number; totalVarianceValue: string | null; notes?: string; completedAt?: string; items?: StocktakeItem[] };

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<StocktakeSession[]>({
    queryKey: ["stocktakes", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/stocktakes`, { credentials: "include" }).then(r => r.json()),
  });

  const { data: activeSession } = useQuery<StocktakeSession>({
    queryKey: ["stocktake-detail", farmId, activeId],
    queryFn: () => fetch(`/api/farms/${farmId}/stocktakes/${activeId}`, { credentials: "include" }).then(r => r.json()),
    enabled: activeId !== null,
  });

  const createMut = useMutation({
    mutationFn: (body: { stocktakeDate: string; notes?: string }) =>
      fetch(`/api/farms/${farmId}/stocktakes`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: (data: StocktakeSession) => {
      qc.invalidateQueries({ queryKey: ["stocktakes", farmId] });
      setNewOpen(false);
      setLocalCounts({});
      setActiveId(data.id);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const updateItemMut = useMutation({
    mutationFn: ({ sessionId, itemId, body }: { sessionId: number; itemId: number; body: Record<string, unknown> }) =>
      fetch(`/api/farms/${farmId}/stocktakes/${sessionId}/items/${itemId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["stocktake-detail", farmId, activeId] }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const completeMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/stocktakes/${id}/complete`, { method: "POST", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stocktakes", farmId] });
      qc.invalidateQueries({ queryKey: ["stocktake-detail", farmId, activeId] });
      qc.invalidateQueries({ queryKey: ["stock-levels", farmId] });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/stocktakes/${id}`, { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["stocktakes", farmId] }); setActiveId(null); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const itemsMissingReason = (activeSession?.items ?? []).filter(i => {
    const v = i.variance !== null ? parseFloat(i.variance) : 0;
    return Math.abs(v) > 0.001 && !i.varianceReason;
  });
  const canComplete = (activeSession?.countedCount ?? 0) >= (activeSession?.itemCount ?? 0) && itemsMissingReason.length === 0;

  return (
    <div className="space-y-4">
      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        mutation={confirmState.mutation}
        onConfirm={() => confirmState.run(() => setConfirmState(s => ({ ...s, open: false })))}
        onCancel={closeConfirm}
        confirmLabel={confirmState.confirmLabel}
        confirmVariant={confirmState.variant}
      />

      {activeId === null ? (
        /* ── List view ──────────────────────────────────────────────────── */
        <>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-semibold text-sm flex items-center gap-1.5"><ClipboardCheck className="w-4 h-4" />Stocktake Records</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Physically count all farm inputs and compare against system quantities. Variance reasons are required for Red Tractor compliance.</p>
            </div>
            <Button size="sm" onClick={() => { setNewForm({ stocktakeDate: new Date().toISOString().slice(0, 10), notes: "" }); setNewOpen(true); }}>
              <Plus className="w-3.5 h-3.5 mr-1" />New Stocktake
            </Button>
          </div>

          {sessionsLoading ? <Loader2 className="animate-spin w-5 h-5" /> : sessions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No stocktakes recorded yet. Click "New Stocktake" to begin your first count.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b">
                  {["Date", "Status", "Progress", "Variance £", "Notes", ""].map(h => (
                    <th key={h} className="text-left py-2 pr-3 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {sessions.map(s => {
                    const varVal = s.totalVarianceValue ? parseFloat(s.totalVarianceValue) : null;
                    const isDraft = s.status === "draft";
                    return (
                      <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer" onClick={() => { setLocalCounts({}); setActiveId(s.id); }}>
                        <td className="py-2 pr-3 whitespace-nowrap font-medium">{fmtDate(s.stocktakeDate)}</td>
                        <td className="py-2 pr-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isDraft ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
                            {isDraft ? "In Progress" : "Completed"}
                          </span>
                        </td>
                        <td className="py-2 pr-3 text-muted-foreground">{s.countedCount ?? 0} / {s.itemCount ?? 0} counted</td>
                        <td className="py-2 pr-3">
                          {varVal === null ? <span className="text-muted-foreground">—</span> : (
                            <span className={varVal < 0 ? "text-red-600 font-medium" : varVal > 0 ? "text-amber-600 font-medium" : "text-green-600"}>
                              {varVal >= 0 ? "+" : ""}£{Math.abs(varVal).toFixed(2)}
                            </span>
                          )}
                        </td>
                        <td className="py-2 pr-3 text-muted-foreground text-xs max-w-[180px] truncate">{s.notes || "—"}</td>
                        <td className="py-2" onClick={e => e.stopPropagation()}>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setLocalCounts({}); setActiveId(s.id); }}>
                              {isDraft ? "Continue" : "View"}
                            </Button>
                            {isDraft && (
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => showConfirm("Delete Stocktake", "Delete this draft stocktake? All counts entered so far will be lost.", (onSuccess) => deleteMut.mutate(s.id, { onSuccess }), { mutation: deleteMut, confirmLabel: "Delete", variant: "destructive" })}>
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        /* ── Detail view ────────────────────────────────────────────────── */
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <Button size="sm" variant="outline" onClick={() => { setActiveId(null); qc.invalidateQueries({ queryKey: ["stocktakes", farmId] }); }}>← Back</Button>
            {activeSession && (
              <>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm">Stocktake — {fmtDate(activeSession.stocktakeDate)}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${activeSession.status === "draft" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
                      {activeSession.status === "draft" ? "In Progress" : "Completed"}
                    </span>
                    <span className="text-xs text-muted-foreground">{activeSession.countedCount ?? 0} / {activeSession.itemCount ?? 0} items counted</span>
                  </div>
                  {activeSession.notes && <p className="text-xs text-muted-foreground mt-0.5">{activeSession.notes}</p>}
                </div>
                {activeSession.status === "draft" && (
                  <Button size="sm" disabled={!canComplete || completeMut.isPending}
                    onClick={() => showConfirm("Complete Stocktake", "Stock levels will be updated to match your physical counts. This cannot be undone. Variance records will be created for Red Tractor audit.", (onSuccess) => completeMut.mutate(activeSession.id, { onSuccess }), { mutation: completeMut, confirmLabel: "Complete Stocktake" })}>
                    {completeMut.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                    Complete Stocktake
                  </Button>
                )}
              </>
            )}
          </div>

          {!activeSession ? <Loader2 className="animate-spin w-5 h-5" /> : (activeSession.items ?? []).length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No stock items found. Add items to the Product Catalogue first, then start a new stocktake.</div>
          ) : (
            <>
              {(() => {
                const items = activeSession.items ?? [];
                const totalVar = items.reduce((s, i) => s + (i.varianceValue ? parseFloat(i.varianceValue) : 0), 0);
                const negCount = items.filter(i => i.variance !== null && parseFloat(i.variance) < 0).length;
                const uncounted = items.filter(i => i.countedQty === null).length;
                return (
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Uncounted", value: String(uncounted), sub: "items remaining", color: uncounted > 0 ? "text-amber-600" : "text-green-600" },
                      { label: "Total Variance", value: `${totalVar >= 0 ? "+" : ""}£${Math.abs(totalVar).toFixed(2)}`, sub: "cost value difference", color: totalVar < 0 ? "text-red-600" : totalVar > 0 ? "text-amber-600" : "text-green-600" },
                      { label: "Shortfalls", value: String(negCount), sub: "lines below system qty", color: negCount > 0 ? "text-red-600" : "text-green-600" },
                    ].map(card => (
                      <div key={card.label} className="bg-muted/40 rounded-lg p-3 text-center border">
                        <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
                        <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
                        <p className="text-xs text-muted-foreground">{card.sub}</p>
                      </div>
                    ))}
                  </div>
                );
              })()}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b">
                    {["Item", "Type", "Unit", "System Qty", "Counted", "Variance", "Variance £", "Reason *", "Notes"].map(h => (
                      <th key={h} className="text-left py-2 pr-3 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {(activeSession.items ?? []).map(item => {
                      const varNum = item.variance !== null ? parseFloat(item.variance) : null;
                      const varVal = item.varianceValue !== null ? parseFloat(item.varianceValue!) : null;
                      const varColor = varNum === null ? "" : varNum < 0 ? "text-red-600 font-semibold" : varNum === 0 ? "text-green-600" : "text-amber-600 font-semibold";
                      const rowBg = varNum === null ? "" : varNum < 0 ? "bg-red-50/40" : varNum > 0 ? "bg-amber-50/30" : "";
                      const hasVariance = varNum !== null && Math.abs(varNum) > 0.001;
                      const isCompleted = activeSession.status === "completed";
                      const localVal = localCounts[item.id] !== undefined ? localCounts[item.id] : (item.countedQty ?? "");
                      return (
                        <tr key={item.id} className={`border-b last:border-0 ${rowBg}`}>
                          <td className="py-2 pr-3 font-medium whitespace-nowrap">{item.itemName}</td>
                          <td className="py-2 pr-3 text-muted-foreground text-xs capitalize">{item.stockType?.replace(/-/g, " ") || "—"}</td>
                          <td className="py-2 pr-3 text-muted-foreground text-xs">{item.unit || "—"}</td>
                          <td className="py-2 pr-3">{parseFloat(item.expectedQty).toFixed(2)}</td>
                          <td className="py-2 pr-3">
                            {isCompleted ? (
                              <span>{item.countedQty ?? "—"}</span>
                            ) : (
                              <Input type="number" min="0" step="0.01" className="h-7 w-24 text-sm" placeholder="0"
                                value={localVal}
                                onChange={e => setLocalCounts(prev => ({ ...prev, [item.id]: e.target.value }))}
                                onBlur={() => {
                                  const raw = localCounts[item.id];
                                  if (raw === undefined) return;
                                  const val = raw.trim() === "" ? null : raw;
                                  updateItemMut.mutate({ sessionId: activeSession.id, itemId: item.id, body: { countedQty: val } });
                                }}
                              />
                            )}
                          </td>
                          <td className={`py-2 pr-3 ${varColor}`}>
                            {varNum === null ? <span className="text-muted-foreground text-xs">—</span> : `${varNum >= 0 ? "+" : ""}${varNum.toFixed(2)}`}
                          </td>
                          <td className={`py-2 pr-3 ${varColor}`}>
                            {varVal === null ? <span className="text-muted-foreground text-xs">—</span> : `${varVal >= 0 ? "+" : ""}£${Math.abs(varVal).toFixed(2)}`}
                          </td>
                          <td className="py-2 pr-3">
                            {hasVariance && !isCompleted ? (
                              <Select value={item.varianceReason ?? "__none__"} onValueChange={val => updateItemMut.mutate({ sessionId: activeSession.id, itemId: item.id, body: { varianceReason: val === "__none__" ? null : val } })}>
                                <SelectTrigger className="h-7 text-xs w-40"><SelectValue placeholder="Select reason" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__none__">— select —</SelectItem>
                                  {VARIANCE_REASONS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            ) : hasVariance && isCompleted ? (
                              <span className="text-xs">{VARIANCE_REASONS.find(r => r.value === item.varianceReason)?.label ?? item.varianceReason ?? "—"}</span>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </td>
                          <td className="py-2">
                            {isCompleted ? (
                              <span className="text-xs text-muted-foreground">{item.notes || "—"}</span>
                            ) : (
                              <Input className="h-7 text-xs w-32" placeholder="Optional" defaultValue={item.notes ?? ""}
                                onBlur={e => { if (e.target.value !== (item.notes ?? "")) updateItemMut.mutate({ sessionId: activeSession.id, itemId: item.id, body: { notes: e.target.value || null } }); }}
                              />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {(activeSession.items ?? []).some(i => i.unitCostPence === null) && (
                <p className="text-xs text-muted-foreground border-t pt-2">
                  * Variance £ shows <span className="font-medium">—</span> for items without a unit cost. Add unit costs in the Product Catalogue to see cost-value variance.
                </p>
              )}
              {activeSession.status === "draft" && itemsMissingReason.length > 0 && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                  <strong>{itemsMissingReason.length} item{itemsMissingReason.length > 1 ? "s have" : " has"} a variance</strong> — a reason must be selected for each before completing (Red Tractor requirement).
                </p>
              )}
              {activeSession.status === "draft" && (activeSession.countedCount ?? 0) < (activeSession.itemCount ?? 0) && (
                <p className="text-xs text-muted-foreground text-center border-t pt-3">
                  Count all {(activeSession.itemCount ?? 0) - (activeSession.countedCount ?? 0)} remaining items before you can complete the stocktake.
                </p>
              )}
            </>
          )}
        </>
      )}

      <Dialog open={newOpen} onOpenChange={o => { if (!o) { setNewOpen(false); createMut.reset(); } }}>
        <DialogContent style={{ maxWidth: "22rem" }}>
          <DialogHeader><DialogTitle>New Stocktake</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground -mt-1">Snaps the current system stock for all active farm inputs (excl. workshop parts). You'll then count and enter physical quantities.</p>
          <div className="space-y-3">
            <div><Label>Stocktake Date *</Label><Input type="date" value={newForm.stocktakeDate} onChange={e => setNewForm(f => ({ ...f, stocktakeDate: e.target.value }))} /></div>
            <div><Label>Notes</Label><Input value={newForm.notes} placeholder="e.g. Monthly Red Tractor count" onChange={e => setNewForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogMutationError mutation={createMut} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button disabled={!newForm.stocktakeDate || createMut.isPending}
              onClick={() => createMut.mutate({ stocktakeDate: newForm.stocktakeDate, notes: newForm.notes || undefined })}>
              {createMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Start Stocktake"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
