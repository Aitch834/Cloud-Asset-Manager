import React, { useState } from "react";
import { TabButton, TabBar } from "@/components/ui/tab-button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
  "General",
];

const UNITS = ["kg", "L", "t", "bags", "boxes", "units", "m³", "bales"];

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

export default function SuppliersStockPage() {
  const [tab, setTab] = useState<"suppliers" | "products" | "received" | "levels" | "movements">("levels");
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();

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

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["stock-items", farmId] });
    qc.invalidateQueries({ queryKey: ["stock-deliveries", farmId] });
    qc.invalidateQueries({ queryKey: ["stock-levels", farmId] });
    qc.invalidateQueries({ queryKey: ["stock-movements", farmId] });
    qc.invalidateQueries({ queryKey: ["suppliers", farmId] });
  };

  return (
    <AppLayout title="Suppliers & Stock">
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div className="mb-4">
        <p className="text-sm text-gray-500">Product catalogue, goods received, live stock levels and full movement history</p>
      </div>

      <TabBar className="mb-6 overflow-x-auto flex-wrap">
        <TabButton active={tab === "levels"} onClick={() => setTab("levels")}>Stock Levels</TabButton>
        <TabButton active={tab === "received"} onClick={() => setTab("received")}>Goods Received</TabButton>
        <TabButton active={tab === "movements"} onClick={() => setTab("movements")}>Movements</TabButton>
        <TabButton active={tab === "products"} onClick={() => setTab("products")}>Product Catalogue</TabButton>
        <TabButton active={tab === "suppliers"} onClick={() => setTab("suppliers")}>Suppliers</TabButton>
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
        />
      )}
      {tab === "received" && (
        <GoodsReceivedTab
          deliveries={deliveriesQ.data ?? []}
          products={productsQ.data ?? []}
          suppliers={suppliersQ.data ?? []}
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
    </div>
    </AppLayout>
  );
}

function StockLevelsTab({ levels, products, loading, farmId, onRefresh, toast, qc, onGoToProducts }: any) {
  const [adjOpen, setAdjOpen] = useState(false);
  const [adjForm, setAdjForm] = useState({ stockItemId: "", quantityChange: "", movementType: "adjustment", notes: "" });
  const [search, setSearch] = useState("");

  const adjMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/stock-movements`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
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
          <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32 }} />
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
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={adjOpen} onOpenChange={setAdjOpen}>
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

function GoodsReceivedTab({ deliveries, products, suppliers, loading, farmId, onRefresh, toast, onGoToProducts }: any) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<any>({ stockItemId: "", supplierId: "", deliveryDate: "", quantity: "", batchNumber: "", invoiceReference: "", receivedBy: "", costPence: "", notes: "" });
  const [invoiceDelivery, setInvoiceDelivery] = useState<any>(null);
  const [invoiceForm, setInvoiceForm] = useState<any>({});

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/stock-deliveries`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, costPence: body.costPence ? Math.round(parseFloat(body.costPence) * 100) : null }) }),
    onSuccess: () => { toast({ title: "Goods received logged" }); onRefresh(); setOpen(false); setForm({ stockItemId: "", supplierId: "", deliveryDate: "", quantity: "", batchNumber: "", invoiceReference: "", receivedBy: "", costPence: "", notes: "" }); },
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
    }),
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
          <Input placeholder="Search deliveries..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32 }} />
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
                {["Date", "Product", "Supplier", "Quantity", "Batch No.", "Invoice Ref", "Cost", "Received By", "Financial Record"].map(h => (
                  <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d: any, i: number) => (
                <tr key={d.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <td style={{ padding: "0.625rem 0.875rem", whiteSpace: "nowrap" }}>{fmt(d.deliveryDate)}</td>
                  <td style={{ padding: "0.625rem 0.875rem", fontWeight: 500 }}>{d.stockItemName || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{d.supplierName || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem" }}>{fmtQty(d.quantity, d.stockItemUnit)}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{d.batchNumber || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{d.invoiceReference || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem" }}>{fmtCost(d.costPence)}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{d.receivedBy || "—"}</td>
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

      <Dialog open={invoiceDelivery !== null} onOpenChange={o => { if (!o) setInvoiceDelivery(null); }}>
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

      <Dialog open={open} onOpenChange={setOpen}>
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
                <Select value={form.supplierId} onValueChange={v => setForm((f: any) => ({ ...f, supplierId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select supplier..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Batch / Lot Number</Label>
                <Input placeholder="e.g. BT240301" value={form.batchNumber} onChange={e => setForm((f: any) => ({ ...f, batchNumber: e.target.value }))} />
              </div>
              <div>
                <Label>Invoice Reference</Label>
                <Input placeholder="e.g. INV-1234" value={form.invoiceReference} onChange={e => setForm((f: any) => ({ ...f, invoiceReference: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Cost (£)</Label>
                <Input type="number" step="0.01" placeholder="0.00" value={form.costPence} onChange={e => setForm((f: any) => ({ ...f, costPence: e.target.value }))} />
              </div>
              <div>
                <Label>Received By</Label>
                <Input placeholder="Name" value={form.receivedBy} onChange={e => setForm((f: any) => ({ ...f, receivedBy: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea placeholder="Optional notes..." value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>
          </div>
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
          <Input placeholder="Search movements..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32 }} />
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
                {["Date", "Product", "Type", "Qty Change", "Source", "Notes"].map(h => (
                  <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m: any, i: number) => {
                const qty = parseFloat(m.quantityChange ?? "0");
                const isIn = qty > 0;
                return (
                  <tr key={m.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none" }}>
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
                  </tr>
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
  const [editItem, setEditItem] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<any>({ name: "", category: "", productCode: "", mappNumber: "", unit: "", reorderLevel: "", storageLocation: "", defaultSupplierId: "", notes: "" });

  const resetForm = () => setForm({ name: "", category: "", productCode: "", mappNumber: "", unit: "", reorderLevel: "", storageLocation: "", defaultSupplierId: "", notes: "" });

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/stock-items`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => { toast({ title: "Product added" }); onRefresh(); setOpen(false); resetForm(); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });
  const updateMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/stock-items/${editItem.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => { toast({ title: "Product updated" }); onRefresh(); setOpen(false); setEditItem(null); resetForm(); },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  const filtered = (products ?? []).filter((p: any) => !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase()));

  const openEdit = (p: any) => {
    setEditItem(p);
    setForm({ name: p.name, category: p.category || "", productCode: p.productCode || "", mappNumber: p.mappNumber || "", unit: p.unit || "", reorderLevel: p.reorderLevel || "", storageLocation: p.storageLocation || "", defaultSupplierId: p.defaultSupplierId ? String(p.defaultSupplierId) : "", notes: p.notes || "" });
    setOpen(true);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
          <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32 }} />
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
                {["Product Name", "Category", "Code", "MAPP No.", "Unit", "Reorder At", "Default Supplier", ""].map(h => (
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
                    <button onClick={() => openEdit(p)} style={{ fontSize: "0.75rem", color: "#166534", cursor: "pointer", background: "none", border: "none" }}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) { setEditItem(null); resetForm(); } }}>
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
                <Select value={form.defaultSupplierId} onValueChange={v => setForm((f: any) => ({ ...f, defaultSupplierId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); setEditItem(null); resetForm(); }}>Cancel</Button>
            <Button onClick={() => editItem ? updateMut.mutate(form) : createMut.mutate(form)} disabled={!form.name || (editItem ? updateMut.isPending : createMut.isPending)}>
              {editItem ? "Save Changes" : "Add Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SuppliersTab({ suppliers, loading, farmId, onRefresh, toast }: any) {
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<any>({ name: "", contactName: "", email: "", phone: "", address: "", category: "", accountNumber: "", notes: "" });

  const resetForm = () => setForm({ name: "", contactName: "", email: "", phone: "", address: "", category: "", accountNumber: "", notes: "" });

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/suppliers`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => { toast({ title: "Supplier added" }); onRefresh(); setOpen(false); resetForm(); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });
  const updateMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/suppliers/${editItem.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => { toast({ title: "Supplier updated" }); onRefresh(); setOpen(false); setEditItem(null); resetForm(); },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  const filtered = (suppliers ?? []).filter((s: any) => s.isActive !== false && (!search || s.name?.toLowerCase().includes(search.toLowerCase())));

  const openEdit = (s: any) => {
    setEditItem(s);
    setForm({ name: s.name, contactName: s.contactName || "", email: s.email || "", phone: s.phone || "", address: s.address || "", category: s.category || "", accountNumber: s.accountNumber || "", notes: s.notes || "" });
    setOpen(true);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
          <Input placeholder="Search suppliers..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32 }} />
        </div>
        <Button size="sm" onClick={() => { resetForm(); setEditItem(null); setOpen(true); }}><Plus size={14} className="mr-1" />Add Supplier</Button>
      </div>
      {loading ? <p className="text-sm text-gray-400 py-8 text-center">Loading...</p> : filtered.length === 0 ? (
        <EmptyState icon={Building2} title="No suppliers added" subtitle="Add approved suppliers and link them to products" />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
          {filtered.map((s: any) => (
            <div key={s.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{s.name}</span>
                {s.isApproved && <Badge style={{ background: "#d1fae5", color: "#065f46", border: "none", fontSize: "0.7rem" }}>Approved</Badge>}
              </div>
              {s.category && <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 6 }}>{s.category}</p>}
              {s.contactName && <p style={{ fontSize: "0.8rem", color: "#374151" }}>{s.contactName}</p>}
              {s.phone && <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>{s.phone}</p>}
              {s.email && <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>{s.email}</p>}
              <button onClick={() => openEdit(s)} style={{ marginTop: 8, fontSize: "0.75rem", color: "#166534", cursor: "pointer", background: "none", border: "none", padding: 0 }}>Edit</button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) { setEditItem(null); resetForm(); } }}>
        <DialogContent style={{ maxWidth: 480 }}>
          <DialogHeader><DialogTitle>{editItem ? "Edit Supplier" : "Add Supplier"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Company Name <span style={{ color: "#ef4444" }}>*</span></Label>
              <Input value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Contact Name</Label>
                <Input value={form.contactName} onChange={e => setForm((f: any) => ({ ...f, contactName: e.target.value }))} />
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
                <Label>Phone</Label>
                <Input value={form.phone} onChange={e => setForm((f: any) => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm((f: any) => ({ ...f, email: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Textarea rows={2} value={form.address} onChange={e => setForm((f: any) => ({ ...f, address: e.target.value }))} />
            </div>
            <div>
              <Label>Account Number</Label>
              <Input value={form.accountNumber} onChange={e => setForm((f: any) => ({ ...f, accountNumber: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); setEditItem(null); resetForm(); }}>Cancel</Button>
            <Button onClick={() => editItem ? updateMut.mutate(form) : createMut.mutate(form)} disabled={!form.name || (editItem ? updateMut.isPending : createMut.isPending)}>
              {editItem ? "Save Changes" : "Add Supplier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
