import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabButton, TabBar } from "@/components/ui/tab-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Plus, AlertTriangle, Package, Truck, ShieldCheck, Info, Trash2,
  Edit2, BarChart3
} from "lucide-react";

type Tab = "deliveries" | "stock";

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
  { value: "other", label: "Other" },
];

const SPECIES = ["cattle", "sheep", "pigs", "poultry", "horses", "mixed", "other"];

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB");
}
function fmtKg(v: string | number | null | undefined) {
  if (v === null || v === undefined) return "—";
  return `${parseFloat(String(v)).toLocaleString("en-GB")} kg`;
}
function fmtCost(p: number | null | undefined) {
  if (!p) return "—";
  return `£${(p / 100).toFixed(2)}`;
}

function UfasBadge({ number }: { number?: string | null }) {
  if (!number) return <Badge className="text-xs" style={{ background: "#fef3c7", color: "#92400e", border: "none" }}>No UFAS on note</Badge>;
  return <Badge className="text-xs" style={{ background: "#d1fae5", color: "#065f46", border: "none" }}>UFAS: {number}</Badge>;
}

function MedicatedBadge({ medicated }: { medicated?: boolean | null }) {
  if (!medicated) return null;
  return <Badge className="text-xs" style={{ background: "#fee2e2", color: "#991b1b", border: "none" }}>Medicated</Badge>;
}

export default function FeedManagementPage() {
  const [tab, setTab] = useState<Tab>("deliveries");
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();

  const deliveriesQ = useQuery({
    queryKey: ["feed-deliveries", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/feed-deliveries`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const stockQ = useQuery({
    queryKey: ["feed-stock", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/feed-stock`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const suppliersQ = useQuery({
    queryKey: ["suppliers", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/suppliers`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["feed-deliveries", farmId] });
    qc.invalidateQueries({ queryKey: ["feed-stock", farmId] });
  };

  // Feed delivery dialog
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [editDelivery, setEditDelivery] = useState<Record<string, unknown> | null>(null);
  const [deliveryForm, setDeliveryForm] = useState<Record<string, string>>({});

  function openDeliveryAdd() {
    setEditDelivery(null);
    setDeliveryForm({ feedType: "compound_pellets", medicatedFeed: "false", deliveryDate: new Date().toISOString().substring(0, 10) });
    setShowDeliveryDialog(true);
  }
  function openDeliveryEdit(d: Record<string, unknown>) {
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
    });
    setShowDeliveryDialog(true);
  }

  const deliveryMut = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const url = editDelivery
        ? `/api/farms/${farmId}/feed-deliveries/${editDelivery.id}`
        : `/api/farms/${farmId}/feed-deliveries`;
      const res = await fetch(url, { method: editDelivery ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => { invalidate(); setShowDeliveryDialog(false); toast({ title: editDelivery ? "Delivery updated" : "Delivery recorded" }); },
    onError: () => toast({ title: "Error saving delivery", variant: "destructive" }),
  });
  const delDeliveryMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/feed-deliveries/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { invalidate(); toast({ title: "Delivery removed" }); },
  });

  // Stock dialog
  const [showStockDialog, setShowStockDialog] = useState(false);
  const [editStock, setEditStock] = useState<Record<string, unknown> | null>(null);
  const [stockForm, setStockForm] = useState<Record<string, string>>({});
  const stockMut = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const url = editStock
        ? `/api/farms/${farmId}/feed-stock/${editStock.id}`
        : `/api/farms/${farmId}/feed-stock`;
      const res = await fetch(url, { method: editStock ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => { invalidate(); setShowStockDialog(false); toast({ title: "Feed stock updated" }); },
    onError: () => toast({ title: "Error saving", variant: "destructive" }),
  });
  const delStockMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/feed-stock/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { invalidate(); toast({ title: "Removed" }); },
  });

  const deliveries: Record<string, unknown>[] = deliveriesQ.data ?? [];
  const stock: Record<string, unknown>[] = stockQ.data ?? [];
  const suppliers: Record<string, unknown>[] = (suppliersQ.data ?? []).filter((s: Record<string, unknown>) => s.supplierType === "feed" || s.category === "Feed & Nutrition");

  const medicatedDeliveries = deliveries.filter(d => d.medicatedFeed);
  const noUfasDeliveries = deliveries.filter(d => !d.ufasNumberOnNote);
  const belowReorder = stock.filter(s => s.reorderThresholdKg && parseFloat(String(s.currentStockKg ?? 0)) <= parseFloat(String(s.reorderThresholdKg)));

  const feedTypeLabel = (v: string) => FEED_TYPES.find(ft => ft.value === v)?.label ?? v;

  const feedSuppliers: Record<string, unknown>[] = suppliersQ.data ?? [];

  return (
    <AppLayout title="Feed Management">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <p className="text-sm text-gray-500 mb-4">
          Feed goods-received records with full UFAS/FEMAS traceability — required for Red Tractor, APHA and cross-compliance audits
        </p>

        {/* Alert banners */}
        {noUfasDeliveries.length > 0 && (
          <div className="flex gap-2 items-start bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-800">
              <strong>{noUfasDeliveries.length} deliver{noUfasDeliveries.length > 1 ? "ies" : "y"} without a UFAS/FEMAS number recorded.</strong> Red Tractor and APHA require the supplier approval number from the delivery note to be on your records.
            </p>
          </div>
        )}
        {medicatedDeliveries.length > 0 && (
          <div className="flex gap-2 items-start bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
            <Info className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <p className="text-sm text-red-800">
              <strong>{medicatedDeliveries.length} medicated feed deliver{medicatedDeliveries.length > 1 ? "ies" : "y"} on record.</strong> Ensure withdrawal periods are recorded and observed before slaughter or sale of treated animals.
            </p>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1"><Truck className="w-4 h-4 text-green-700" /><span className="text-xs text-gray-500">Deliveries recorded</span></div>
            <p className="text-xl font-bold text-gray-800">{deliveries.length}</p>
            <p className="text-xs text-gray-400">Total goods-received notes</p>
          </div>
          <div className={`rounded-xl border p-4 ${noUfasDeliveries.length > 0 ? "bg-amber-50 border-amber-200" : "bg-white border-gray-200"}`}>
            <div className="flex items-center gap-2 mb-1"><ShieldCheck className="w-4 h-4 text-green-600" /><span className="text-xs text-gray-500">UFAS/FEMAS traced</span></div>
            <p className="text-xl font-bold text-gray-800">{deliveries.length - noUfasDeliveries.length}</p>
            <p className="text-xs text-gray-400">of {deliveries.length} deliveries</p>
          </div>
          <div className={`rounded-xl border p-4 ${medicatedDeliveries.length > 0 ? "bg-red-50 border-red-200" : "bg-white border-gray-200"}`}>
            <div className="flex items-center gap-2 mb-1"><AlertTriangle className="w-4 h-4 text-red-600" /><span className="text-xs text-gray-500">Medicated feeds</span></div>
            <p className="text-xl font-bold text-gray-800">{medicatedDeliveries.length}</p>
            <p className="text-xs text-gray-400">Check withdrawal periods</p>
          </div>
          <div className={`rounded-xl border p-4 ${belowReorder.length > 0 ? "bg-orange-50 border-orange-200" : "bg-white border-gray-200"}`}>
            <div className="flex items-center gap-2 mb-1"><Package className="w-4 h-4 text-orange-600" /><span className="text-xs text-gray-500">Low stock alerts</span></div>
            <p className="text-xl font-bold text-gray-800">{belowReorder.length}</p>
            <p className="text-xs text-gray-400">feeds below reorder level</p>
          </div>
        </div>

        <TabBar className="mb-6">
          <TabButton active={tab === "deliveries"} onClick={() => setTab("deliveries")}>Feed Deliveries / GRN ({deliveries.length})</TabButton>
          <TabButton active={tab === "stock"} onClick={() => setTab("stock")}>Feed Stock ({stock.length})</TabButton>
        </TabBar>

        {/* DELIVERIES TAB */}
        {tab === "deliveries" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">Feed Delivery Records</h3>
                <p className="text-xs text-gray-500">Record every delivery with UFAS/FEMAS number from the delivery note — batch traceability for Red Tractor and APHA audits</p>
              </div>
              <Button onClick={openDeliveryAdd} className="bg-green-800 hover:bg-green-900 text-white"><Plus className="w-4 h-4 mr-1" />Record Delivery</Button>
            </div>
            {deliveries.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Truck className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No feed deliveries recorded</p>
                <p className="text-sm">Record your first delivery to build traceability</p>
              </div>
            ) : (
              <div className="space-y-3">
                {deliveries.map((d) => (
                  <div key={String(d.id)} className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-gray-900">{String(d.productName || feedTypeLabel(String(d.feedType ?? "other")))}</span>
                          <Badge className="text-xs" style={{ background: "#eff6ff", color: "#1d4ed8", border: "none" }}>{feedTypeLabel(String(d.feedType ?? ""))}</Badge>
                          <MedicatedBadge medicated={d.medicatedFeed as boolean} />
                        </div>
                        <p className="text-sm font-medium text-gray-700">{String(d.supplierName ?? "—")}</p>
                        <div className="flex gap-2 flex-wrap mt-1">
                          <UfasBadge number={d.ufasNumberOnNote as string} />
                          {d.femasNumberOnNote && <Badge className="text-xs" style={{ background: "#ede9fe", color: "#5b21b6", border: "none" }}>FEMAS: {d.femasNumberOnNote as string}</Badge>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="font-bold text-green-700">{fmtKg(d.quantityKg as string)}</p>
                          <p className="text-xs text-gray-500">{fmtCost(d.costPence as number)}</p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => openDeliveryEdit(d)} className="h-7 px-2"><Edit2 className="w-3 h-3" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => delDeliveryMut.mutate(Number(d.id))} className="h-7 px-2 text-red-600"><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span><span className="text-gray-400">Date:</span> {fmtDate(String(d.deliveryDate ?? ""))}</span>
                      <span><span className="text-gray-400">DN:</span> {String(d.deliveryNoteNumber ?? "—")}</span>
                      {d.batchNumber && <span><span className="text-gray-400">Batch:</span> {String(d.batchNumber)}</span>}
                      {d.lotNumber && <span><span className="text-gray-400">Lot:</span> {String(d.lotNumber)}</span>}
                      {d.storageLocation && <span><span className="text-gray-400">Stored:</span> {String(d.storageLocation)}</span>}
                      {d.bestBeforeDate && <span><span className="text-gray-400">Best before:</span> {fmtDate(String(d.bestBeforeDate))}</span>}
                      {d.speciesIntended && <span><span className="text-gray-400">For:</span> {String(d.speciesIntended)}</span>}
                      {d.receivedBy && <span><span className="text-gray-400">Received by:</span> {String(d.receivedBy)}</span>}
                      {d.medicatedFeed && d.withdrawalPeriodDays && (
                        <span className="text-red-600 font-medium col-span-2">Withdrawal period: {String(d.withdrawalPeriodDays)} days</span>
                      )}
                    </div>
                    {d.notes && <p className="text-xs text-gray-400 mt-2 italic">{String(d.notes)}</p>}
                    {d.medicationDetails && <p className="text-xs text-red-700 mt-1 font-medium">Medication: {String(d.medicationDetails)}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STOCK TAB */}
        {tab === "stock" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">Feed Stock Levels</h3>
                <p className="text-xs text-gray-500">Track current on-farm feed stocks per species — set reorder thresholds to get low-stock alerts</p>
              </div>
              <Button onClick={() => { setEditStock(null); setStockForm({ feedType: "compound_pellets", currentStockKg: "0" }); setShowStockDialog(true); }} className="bg-green-800 hover:bg-green-900 text-white">
                <Plus className="w-4 h-4 mr-1" />Add Feed Stock
              </Button>
            </div>
            {stock.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No feed stock records</p>
                <p className="text-sm">Add stocks for each feed type to track levels</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {stock.map((s) => {
                  const current = parseFloat(String(s.currentStockKg ?? 0));
                  const reorder = s.reorderThresholdKg ? parseFloat(String(s.reorderThresholdKg)) : null;
                  const isLow = reorder !== null && current <= reorder;
                  return (
                    <div key={String(s.id)} className={`rounded-xl border p-4 ${isLow ? "bg-orange-50 border-orange-200" : "bg-white border-gray-200"}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{String(s.productName || feedTypeLabel(String(s.feedType ?? "")))}</p>
                          <p className="text-xs text-gray-500">{feedTypeLabel(String(s.feedType ?? ""))} {s.speciesIntended ? `— ${s.speciesIntended}` : ""}</p>
                        </div>
                        <div className="flex gap-2 items-center">
                          {isLow && <Badge className="text-xs" style={{ background: "#fed7aa", color: "#9a3412", border: "none" }}>Low stock</Badge>}
                          <Button size="sm" variant="ghost" onClick={() => { setEditStock(s); setStockForm({ feedType: String(s.feedType ?? ""), productName: String(s.productName ?? ""), storageLocation: String(s.storageLocation ?? ""), currentStockKg: String(s.currentStockKg ?? "0"), reorderThresholdKg: String(s.reorderThresholdKg ?? ""), notes: String(s.notes ?? "") }); setShowStockDialog(true); }} className="h-7 px-2"><Edit2 className="w-3 h-3" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => delStockMut.mutate(Number(s.id))} className="h-7 px-2 text-red-600"><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-gray-800">{fmtKg(s.currentStockKg as string)}</p>
                      {reorder !== null && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Current</span>
                            <span>Reorder at {fmtKg(s.reorderThresholdKg as string)}</span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full" style={{ width: `${Math.min(100, (current / (reorder * 3)) * 100)}%`, background: isLow ? "#f97316" : "#22c55e" }} />
                          </div>
                        </div>
                      )}
                      {s.storageLocation && <p className="text-xs text-gray-500 mt-2"><span className="text-gray-400">Stored:</span> {String(s.storageLocation)}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* DELIVERY DIALOG */}
      <Dialog open={showDeliveryDialog} onOpenChange={setShowDeliveryDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editDelivery ? "Edit Delivery" : "Record Feed Delivery"}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Delivery date *</Label><Input type="date" value={deliveryForm.deliveryDate ?? ""} onChange={e => setDeliveryForm(f => ({ ...f, deliveryDate: e.target.value }))} /></div>
              <div><Label>Feed type *</Label>
                <Select value={deliveryForm.feedType ?? "compound_pellets"} onValueChange={v => setDeliveryForm(f => ({ ...f, feedType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{FEED_TYPES.map(ft => <SelectItem key={ft.value} value={ft.value}>{ft.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Product name</Label><Input value={deliveryForm.productName ?? ""} onChange={e => setDeliveryForm(f => ({ ...f, productName: e.target.value }))} placeholder="e.g. Beef Finisher 18% Nuts" /></div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-green-800 mb-2">Supplier &amp; Traceability — required for compliance</p>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Supplier name *</Label>
                  <div className="flex gap-2">
                    <Input value={deliveryForm.supplierName ?? ""} onChange={e => setDeliveryForm(f => ({ ...f, supplierName: e.target.value }))} placeholder="Supplier name" />
                  </div>
                  {suppliers.length > 0 && (
                    <Select onValueChange={v => {
                      const sup = feedSuppliers.find((s: Record<string, unknown>) => String(s.id) === v) as Record<string, unknown> | undefined;
                      if (sup) setDeliveryForm(f => ({
                        ...f,
                        supplierId: String(sup.id ?? ""),
                        supplierName: String(sup.name ?? ""),
                        ufasNumberOnNote: String(sup.ufasNumber ?? ""),
                        femasNumberOnNote: String(sup.femasNumber ?? ""),
                      }));
                    }}>
                      <SelectTrigger className="mt-1 h-7 text-xs"><SelectValue placeholder="Auto-fill from supplier register" /></SelectTrigger>
                      <SelectContent>{feedSuppliers.filter((s: Record<string, unknown>) => s.isActive).map((s: Record<string, unknown>) => <SelectItem key={String(s.id)} value={String(s.id)}>{String(s.name)}</SelectItem>)}</SelectContent>
                    </Select>
                  )}
                </div>
                <div>
                  <Label>UFAS number (from delivery note)</Label>
                  <Input value={deliveryForm.ufasNumberOnNote ?? ""} onChange={e => setDeliveryForm(f => ({ ...f, ufasNumberOnNote: e.target.value }))} placeholder="UFAS-XXXX-XXXXXX" />
                </div>
                <div><Label>FEMAS number (if applicable)</Label><Input value={deliveryForm.femasNumberOnNote ?? ""} onChange={e => setDeliveryForm(f => ({ ...f, femasNumberOnNote: e.target.value }))} placeholder="FEMAS-XXXX" /></div>
                <div><Label>Delivery note number</Label><Input value={deliveryForm.deliveryNoteNumber ?? ""} onChange={e => setDeliveryForm(f => ({ ...f, deliveryNoteNumber: e.target.value }))} placeholder="DN-0001" /></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Quantity (kg) *</Label><Input type="number" value={deliveryForm.quantityKg ?? ""} onChange={e => setDeliveryForm(f => ({ ...f, quantityKg: e.target.value }))} placeholder="3000" /></div>
              <div><Label>Cost (£)</Label><Input type="number" step="0.01" value={deliveryForm.costPence ?? ""} onChange={e => setDeliveryForm(f => ({ ...f, costPence: e.target.value }))} placeholder="870.00" /></div>
              <div><Label>Invoice ref</Label><Input value={deliveryForm.invoiceReference ?? ""} onChange={e => setDeliveryForm(f => ({ ...f, invoiceReference: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Batch number</Label><Input value={deliveryForm.batchNumber ?? ""} onChange={e => setDeliveryForm(f => ({ ...f, batchNumber: e.target.value }))} /></div>
              <div><Label>Lot number</Label><Input value={deliveryForm.lotNumber ?? ""} onChange={e => setDeliveryForm(f => ({ ...f, lotNumber: e.target.value }))} /></div>
              <div><Label>Best before</Label><Input type="date" value={deliveryForm.bestBeforeDate ?? ""} onChange={e => setDeliveryForm(f => ({ ...f, bestBeforeDate: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Storage location</Label><Input value={deliveryForm.storageLocation ?? ""} onChange={e => setDeliveryForm(f => ({ ...f, storageLocation: e.target.value }))} placeholder="e.g. Grain store Bay 4" /></div>
              <div><Label>Species intended</Label>
                <Select value={deliveryForm.speciesIntended ?? ""} onValueChange={v => setDeliveryForm(f => ({ ...f, speciesIntended: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select species" /></SelectTrigger>
                  <SelectContent>{SPECIES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Medicated feed?</Label>
                <Select value={deliveryForm.medicatedFeed ?? "false"} onValueChange={v => setDeliveryForm(f => ({ ...f, medicatedFeed: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="false">No</SelectItem><SelectItem value="true">Yes — medicated</SelectItem></SelectContent>
                </Select>
              </div>
              {deliveryForm.medicatedFeed === "true" && (
                <div><Label>Withdrawal period (days)</Label><Input type="number" value={deliveryForm.withdrawalPeriodDays ?? ""} onChange={e => setDeliveryForm(f => ({ ...f, withdrawalPeriodDays: e.target.value }))} /></div>
              )}
            </div>
            {deliveryForm.medicatedFeed === "true" && (
              <div><Label>Medication details</Label><Input value={deliveryForm.medicationDetails ?? ""} onChange={e => setDeliveryForm(f => ({ ...f, medicationDetails: e.target.value }))} placeholder="Active ingredient, dose, veterinary authorisation" /></div>
            )}
            <div><Label>Received by</Label><Input value={deliveryForm.receivedBy ?? ""} onChange={e => setDeliveryForm(f => ({ ...f, receivedBy: e.target.value }))} /></div>
            <div><Label>Notes</Label><Textarea value={deliveryForm.notes ?? ""} onChange={e => setDeliveryForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeliveryDialog(false)}>Cancel</Button>
            <Button className="bg-green-800 hover:bg-green-900 text-white" onClick={() => {
              if (!deliveryForm.deliveryDate || !deliveryForm.quantityKg || !deliveryForm.supplierName) return toast({ title: "Date, supplier and quantity required", variant: "destructive" });
              const costPence = deliveryForm.costPence ? Math.round(parseFloat(deliveryForm.costPence) * 100) : undefined;
              const data: Record<string, unknown> = { ...deliveryForm, costPence, medicatedFeed: deliveryForm.medicatedFeed === "true" };
              if (!data.supplierId) delete data.supplierId;
              if (!data.femasNumberOnNote) delete data.femasNumberOnNote;
              if (!data.bestBeforeDate) delete data.bestBeforeDate;
              if (!data.speciesIntended) delete data.speciesIntended;
              deliveryMut.mutate(data);
            }}>{editDelivery ? "Save Changes" : "Record Delivery"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* STOCK DIALOG */}
      <Dialog open={showStockDialog} onOpenChange={setShowStockDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editStock ? "Update Feed Stock" : "Add Feed Stock"}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div><Label>Feed type</Label>
              <Select value={stockForm.feedType ?? "compound_pellets"} onValueChange={v => setStockForm(f => ({ ...f, feedType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{FEED_TYPES.map(ft => <SelectItem key={ft.value} value={ft.value}>{ft.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Product name</Label><Input value={stockForm.productName ?? ""} onChange={e => setStockForm(f => ({ ...f, productName: e.target.value }))} placeholder="e.g. Beef Finisher 18%" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Current stock (kg)</Label><Input type="number" value={stockForm.currentStockKg ?? "0"} onChange={e => setStockForm(f => ({ ...f, currentStockKg: e.target.value }))} /></div>
              <div><Label>Reorder at (kg)</Label><Input type="number" value={stockForm.reorderThresholdKg ?? ""} onChange={e => setStockForm(f => ({ ...f, reorderThresholdKg: e.target.value }))} placeholder="e.g. 500" /></div>
            </div>
            <div><Label>Storage location</Label><Input value={stockForm.storageLocation ?? ""} onChange={e => setStockForm(f => ({ ...f, storageLocation: e.target.value }))} /></div>
            <div><Label>Notes</Label><Textarea value={stockForm.notes ?? ""} onChange={e => setStockForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStockDialog(false)}>Cancel</Button>
            <Button className="bg-green-800 hover:bg-green-900 text-white" onClick={() => stockMut.mutate({ ...stockForm })}>{editStock ? "Update Stock" : "Add Stock"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
