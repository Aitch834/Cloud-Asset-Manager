import React, { useState, useEffect } from "react";
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
  Edit2, MapPin, Clock, CheckCircle2, XCircle, AlertCircle,
  GitBranch, Search, ChevronDown, ChevronRight, ArrowDown, ArrowUp, ShoppingCart
} from "lucide-react";

type Tab = "deliveries" | "stock" | "trace" | "orders";
type StockFilter = "all" | "low" | "out" | "awaiting";

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
  if (v === null || v === undefined || v === "") return "—";
  const n = parseFloat(String(v));
  if (isNaN(n)) return "—";
  return `${n.toLocaleString("en-GB")} kg`;
}
function fmtCost(p: number | null | undefined) {
  if (!p) return "—";
  return `£${(p / 100).toFixed(2)}`;
}

type StockStatus = "ok" | "low" | "out" | "awaiting";

function getStockStatus(s: Record<string, unknown>): StockStatus {
  if (s.awaitingDelivery) return "awaiting";
  const current = parseFloat(String(s.currentStockKg ?? 0));
  if (current <= 0) return "out";
  const reorder = s.reorderThresholdKg ? parseFloat(String(s.reorderThresholdKg)) : null;
  if (reorder !== null && current <= reorder) return "low";
  return "ok";
}

function StatusBadge({ status }: { status: StockStatus }) {
  if (status === "ok") return <Badge className="text-xs" style={{ background: "#dcfce7", color: "#166534", border: "none" }}>In Stock</Badge>;
  if (status === "low") return <Badge className="text-xs" style={{ background: "#fed7aa", color: "#9a3412", border: "none" }}>Low Stock</Badge>;
  if (status === "out") return <Badge className="text-xs" style={{ background: "#fee2e2", color: "#991b1b", border: "none" }}>Out of Stock</Badge>;
  return <Badge className="text-xs" style={{ background: "#dbeafe", color: "#1e40af", border: "none" }}>Awaiting Delivery</Badge>;
}

function UfasBadge({ number }: { number?: string | null }) {
  if (!number) return <Badge className="text-xs" style={{ background: "#fef3c7", color: "#92400e", border: "none" }}>No UFAS on note</Badge>;
  return <Badge className="text-xs" style={{ background: "#d1fae5", color: "#065f46", border: "none" }}>UFAS: {number}</Badge>;
}

function MedicatedBadge({ medicated }: { medicated?: boolean | null }) {
  if (!medicated) return null;
  return <Badge className="text-xs" style={{ background: "#fee2e2", color: "#991b1b", border: "none" }}>Medicated</Badge>;
}

function StockBar({ current, reorder, capacity }: { current: number; reorder: number | null; capacity: number | null }) {
  const max = capacity ?? (reorder ? reorder * 4 : current * 1.5 || 1000);
  const pct = Math.min(100, (current / max) * 100);
  const isLow = reorder !== null && current <= reorder;
  const isOut = current <= 0;
  const barColor = isOut ? "#ef4444" : isLow ? "#f97316" : "#22c55e";
  const reorderPct = reorder ? Math.min(100, (reorder / max) * 100) : null;
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{fmtKg(current)}</span>
        {capacity && <span className="text-gray-400">Capacity: {fmtKg(capacity)}</span>}
        {!capacity && reorder && <span className="text-gray-400">Reorder at {fmtKg(reorder)}</span>}
      </div>
      <div className="relative bg-gray-100 rounded-full h-2">
        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }} />
        {reorderPct !== null && (
          <div className="absolute top-0 h-2 w-0.5 bg-orange-400" style={{ left: `${reorderPct}%` }} title="Reorder level" />
        )}
      </div>
      {reorder !== null && capacity !== null && (
        <div className="text-xs text-gray-400 mt-0.5">Reorder at {fmtKg(reorder)}</div>
      )}
    </div>
  );
}

export default function FeedManagementPage() {
  const [tab, setTab] = useState<Tab>(() => { const p = new URLSearchParams(window.location.search); const t = p.get("tab") as Tab | null; const valid: Tab[] = ["stock", "deliveries", "trace", "orders"]; return t && valid.includes(t) ? t : "stock"; });
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
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
  const purchaseOrdersQ = useQuery({
    queryKey: ["purchase-orders", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/purchase-orders`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const feedFpoQ = useQuery({
    queryKey: ["feed-purchase-orders", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/feed-purchase-orders`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const membersQ = useQuery({
    queryKey: ["members", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/members`).then(r => r.json()).then(d => d.members ?? []),
    enabled: !!farmId,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["feed-deliveries", farmId] });
    qc.invalidateQueries({ queryKey: ["feed-stock", farmId] });
    qc.invalidateQueries({ queryKey: ["purchase-orders", farmId] });
    qc.invalidateQueries({ queryKey: ["feed-purchase-orders", farmId] });
    qc.invalidateQueries({ queryKey: ["feed-stock-targets", farmId] });
  };

  // ── Feed Purchase Order (FPO) state
  const [showFpoDialog, setShowFpoDialog] = useState(false);
  const [editFpo, setEditFpo] = useState<Record<string, unknown> | null>(null);
  const [fpoForm, setFpoForm] = useState<Record<string, string>>({});
  const [fpoFilter, setFpoFilter] = useState<"active" | "all">("active");
  const [receiveId, setReceiveId] = useState<number | null>(null);
  const [receiveDate, setReceiveDate] = useState(new Date().toISOString().substring(0, 10));

  function openFpoAdd() {
    setEditFpo(null);
    setFpoForm({
      supplierName: "",
      productName: "",
      feedType: "compound_pellets",
      speciesIntended: "__none__",
      quantityKg: "",
      orderDate: new Date().toISOString().substring(0, 10),
      expectedDeliveryDate: "",
      status: "sent",
      orderedBy: "",
      notes: "",
    });
    setShowFpoDialog(true);
  }
  function openFpoEdit(fpo: Record<string, unknown>) {
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
      notes: String(fpo.notes ?? ""),
    });
    setShowFpoDialog(true);
  }

  const fpoMut = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const url = editFpo
        ? `/api/farms/${farmId}/feed-purchase-orders/${editFpo.id}`
        : `/api/farms/${farmId}/feed-purchase-orders`;
      const res = await fetch(url, { method: editFpo ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => { invalidate(); setShowFpoDialog(false); toast({ title: editFpo ? "Order updated" : "Feed order raised" }); },
    onError: () => toast({ title: "Error saving order", variant: "destructive" }),
  });
  const deleteFpoMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/feed-purchase-orders/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { invalidate(); toast({ title: "Order removed" }); },
  });
  const receiveFpoMut = useMutation({
    mutationFn: ({ id, date }: { id: number; date: string }) =>
      fetch(`/api/farms/${farmId}/feed-purchase-orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "received", actualDeliveryDate: date }),
      }).then(r => r.json()),
    onSuccess: () => { invalidate(); setReceiveId(null); toast({ title: "Order marked as received — remember to log the delivery receipt in the Delivery Records tab." }); },
  });

  const [traceBinId, setTraceBinId] = useState<number | null>(null);
  const traceQ = useQuery({
    queryKey: ["feed-bin-trace", farmId, traceBinId],
    queryFn: () => fetch(`/api/farms/${farmId}/feed-stock/${traceBinId}/trace`).then(r => r.json()),
    enabled: !!farmId && !!traceBinId,
  });

  const [batchSearch, setBatchSearch] = useState("");
  const [batchQuery, setBatchQuery] = useState("");
  const batchTraceQ = useQuery({
    queryKey: ["feed-batch-trace", farmId, batchQuery],
    queryFn: () => fetch(`/api/farms/${farmId}/feed-batch-trace?batch=${encodeURIComponent(batchQuery)}`).then(r => r.json()),
    enabled: !!farmId && batchQuery.length >= 2,
  });

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
  const [stockAdjustment, setStockAdjustment] = useState("");
  const [stockAdjustReason, setStockAdjustReason] = useState("");

  function openStockAdd() {
    setEditStock(null);
    setStockAdjustment("");
    setStockAdjustReason("");
    setStockForm({ feedType: "compound_pellets", currentStockKg: "0", awaitingDelivery: "false" });
    setShowStockDialog(true);
  }
  function openStockEdit(s: Record<string, unknown>) {
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
      notes: String(s.notes ?? ""),
    });
    setShowStockDialog(true);
  }

  const stockMut = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const url = editStock
        ? `/api/farms/${farmId}/feed-stock/${editStock.id}`
        : `/api/farms/${farmId}/feed-stock`;
      const res = await fetch(url, { method: editStock ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => { invalidate(); setShowStockDialog(false); toast({ title: editStock ? "Feed bin updated" : "Feed bin registered" }); },
    onError: () => toast({ title: "Error saving", variant: "destructive" }),
  });
  const delStockMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/feed-stock/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { invalidate(); toast({ title: "Bin removed" }); },
  });

  // Deep-link: ?bin=BINID — highlight and scroll to the specific bin card
  const [highlightBinId, setHighlightBinId] = useState<number | null>(null);
  useEffect(() => {
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
        setTimeout(() => setHighlightBinId(null), 4000);
      }
    }
  }, []);

  // Raise Reorder dialog
  const [reorderBin, setReorderBin] = useState<Record<string, unknown> | null>(null);
  const [reorderDate, setReorderDate] = useState("");
  const [reorderNotes, setReorderNotes] = useState("");
  const [reorderMemberId, setReorderMemberId] = useState("__none__");
  const [reorderDueDate, setReorderDueDate] = useState("");
  const [reorderAssignNote, setReorderAssignNote] = useState("");

  const reorderMut = useMutation({
    mutationFn: async ({ id, expectedDeliveryDate, notes, memberId, dueDate, assignNote, binName, supplierName }: {
      id: number; expectedDeliveryDate: string; notes: string;
      memberId: string; dueDate: string; assignNote: string;
      binName: string; supplierName: string;
    }) => {
      const binRes = await fetch(`/api/farms/${farmId}/feed-stock/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ awaitingDelivery: true, expectedDeliveryDate: expectedDeliveryDate || null, notes: notes || null }),
      });
      if (!binRes.ok) throw new Error("Failed to update bin");
      let taskResult: { smsSent?: boolean; smsReason?: string | null } | null = null;
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
            assignmentNote: assignNote || null,
          }),
        });
        if (taskRes.ok) taskResult = await taskRes.json();
      }
      return taskResult;
    },
    onSuccess: (taskResult) => {
      invalidate();
      setReorderBin(null);
      if (taskResult) {
        const smsMsg = taskResult.smsSent
          ? " SMS notification sent to staff member."
          : taskResult.smsReason === "no_phone" ? " Staff member has no phone number — no SMS sent." : "";
        toast({ title: `Reorder raised & task assigned.${smsMsg}` });
      } else {
        toast({ title: "Reorder raised — bin status updated to Awaiting Delivery" });
      }
    },
    onError: () => toast({ title: "Error raising reorder", variant: "destructive" }),
  });

  const deliveries: Record<string, unknown>[] = deliveriesQ.data ?? [];
  const stock: Record<string, unknown>[] = stockQ.data ?? [];
  const feedSuppliers: Record<string, unknown>[] = suppliersQ.data ?? [];
  const suppliers: Record<string, unknown>[] = feedSuppliers.filter((s: Record<string, unknown>) => s.supplierType === "feed" || s.category === "Feed & Nutrition");

  // Autocomplete options derived from existing data
  const knownLocations = Array.from(new Set([
    ...stock.map(s => String(s.storageLocation ?? "")).filter(Boolean),
    ...deliveries.map(d => String(d.storageLocation ?? "")).filter(Boolean),
  ])).sort();
  const knownProducts = Array.from(new Set([
    ...stock.map(s => String(s.productName ?? "")).filter(Boolean),
    ...deliveries.map(d => String(d.productName ?? "")).filter(Boolean),
  ])).sort();

  const medicatedDeliveries = deliveries.filter(d => d.medicatedFeed);
  const noUfasDeliveries = deliveries.filter(d => !d.ufasNumberOnNote);

  // Stock status computations
  const stockWithStatus: (Record<string, unknown> & { _status: StockStatus })[] = stock.map(s => ({ ...s, _status: getStockStatus(s) }));
  const countOk = stockWithStatus.filter(s => s._status === "ok").length;
  const countLow = stockWithStatus.filter(s => s._status === "low").length;
  const countOut = stockWithStatus.filter(s => s._status === "out").length;
  const countAwaiting = stockWithStatus.filter(s => s._status === "awaiting").length;

  // Filtered stock
  const filteredStock = stockFilter === "all" ? stockWithStatus
    : stockWithStatus.filter(s => s._status === stockFilter);

  // Feed Purchase Orders
  const fpos: Record<string, unknown>[] = feedFpoQ.data ?? [];
  const today = new Date().toISOString().substring(0, 10);
  const INACTIVE_FPO_STATUSES = ["received", "cancelled"];
  const activeFpos = fpos.filter(o => !INACTIVE_FPO_STATUSES.includes(String(o.status)));
  const overdueFpos = activeFpos.filter(o => o.expectedDeliveryDate && String(o.expectedDeliveryDate).substring(0, 10) < today);
  const filteredFpos = fpoFilter === "active" ? activeFpos : fpos;

  // Group by location
  const locations = Array.from(new Set(filteredStock.map(s => String(s.storageLocation || "")))).sort();
  const stockByLocation: Record<string, typeof stockWithStatus> = {};
  for (const loc of locations) {
    stockByLocation[loc] = filteredStock.filter(s => String(s.storageLocation || "") === loc);
  }

  const feedTypeLabel = (v: string) => FEED_TYPES.find(ft => ft.value === v)?.label ?? v;

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
        {countOut > 0 && (
          <div className="flex gap-2 items-start bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
            <XCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <p className="text-sm text-red-800">
              <strong>{countOut} feed{countOut > 1 ? "s" : ""} out of stock.</strong> Check whether animals are affected and arrange deliveries urgently.
            </p>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1"><Package className="w-4 h-4 text-gray-500" /><span className="text-xs text-gray-500">Feeds tracked</span></div>
            <p className="text-xl font-bold text-gray-800">{stock.length}</p>
            <p className="text-xs text-gray-400">{locations.length} location{locations.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="bg-white rounded-xl border border-green-200 p-4">
            <div className="flex items-center gap-2 mb-1"><CheckCircle2 className="w-4 h-4 text-green-600" /><span className="text-xs text-gray-500">In stock</span></div>
            <p className="text-xl font-bold text-green-700">{countOk}</p>
            <p className="text-xs text-gray-400">feeds</p>
          </div>
          <div className={`rounded-xl border p-4 ${countLow > 0 ? "bg-orange-50 border-orange-200" : "bg-white border-gray-200"}`}>
            <div className="flex items-center gap-2 mb-1"><AlertCircle className="w-4 h-4 text-orange-500" /><span className="text-xs text-gray-500">Low stock</span></div>
            <p className="text-xl font-bold text-orange-600">{countLow}</p>
            <p className="text-xs text-gray-400">below reorder level</p>
          </div>
          <div className={`rounded-xl border p-4 ${countOut > 0 ? "bg-red-50 border-red-200" : "bg-white border-gray-200"}`}>
            <div className="flex items-center gap-2 mb-1"><XCircle className="w-4 h-4 text-red-500" /><span className="text-xs text-gray-500">Out of stock</span></div>
            <p className="text-xl font-bold text-red-600">{countOut}</p>
            <p className="text-xs text-gray-400">feeds</p>
          </div>
          <div className={`rounded-xl border p-4 ${countAwaiting > 0 ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"}`}>
            <div className="flex items-center gap-2 mb-1"><Truck className="w-4 h-4 text-blue-500" /><span className="text-xs text-gray-500">Awaiting delivery</span></div>
            <p className="text-xl font-bold text-blue-600">{countAwaiting}</p>
            <p className="text-xs text-gray-400">orders placed</p>
          </div>
        </div>

        <TabBar className="mb-6">
          <TabButton active={tab === "stock"} onClick={() => setTab("stock")}>Feed Bins ({stock.length})</TabButton>
          <TabButton active={tab === "deliveries"} onClick={() => setTab("deliveries")}>Delivery Records / GRN ({deliveries.length})</TabButton>
          <TabButton active={tab === "trace"} onClick={() => setTab("trace")}><GitBranch className="w-3.5 h-3.5 mr-1 inline" />Batch Trace</TabButton>
          <TabButton active={tab === "orders"} onClick={() => setTab("orders")}>
            <ShoppingCart className="w-3.5 h-3.5 mr-1 inline" />
            Feed Orders
            {overdueFpos.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 min-w-[1.25rem]">{overdueFpos.length}</span>
            )}
            {overdueFpos.length === 0 && activeFpos.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 min-w-[1.25rem]">{activeFpos.length}</span>
            )}
          </TabButton>
        </TabBar>

        {/* ── STOCK TAB ── */}
        {tab === "stock" && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">Registered Feed Bins</h3>
                <p className="text-xs text-gray-500">Each entry is a physical storage bin or location on your farm. Stock levels update automatically when deliveries are recorded and feed usage is logged.</p>
              </div>
              <Button onClick={openStockAdd} className="bg-green-800 hover:bg-green-900 text-white shrink-0">
                <Plus className="w-4 h-4 mr-1" />Register Feed Bin
              </Button>
            </div>

            {/* Filter buttons */}
            {stock.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-5">
                {(["all", "low", "out", "awaiting"] as StockFilter[]).map(f => {
                  const labels: Record<StockFilter, string> = { all: `All (${stock.length})`, low: `Low Stock (${countLow})`, out: `Out of Stock (${countOut})`, awaiting: `Awaiting Delivery (${countAwaiting})` };
                  return (
                    <button key={f} onClick={() => setStockFilter(f)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${stockFilter === f ? "bg-green-800 text-white border-green-800" : "bg-white text-gray-600 border-gray-300 hover:border-green-700 hover:text-green-700"}`}>
                      {labels[f]}
                    </button>
                  );
                })}
              </div>
            )}

            {stock.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No feed bins registered</p>
                <p className="text-sm">Register a bin for each feed type and storage location you hold on farm. Deliveries and feed usage records will then update its stock level automatically.</p>
                <Button onClick={openStockAdd} className="mt-4 bg-green-800 hover:bg-green-900 text-white"><Plus className="w-4 h-4 mr-1" />Register Feed Bin</Button>
              </div>
            ) : filteredStock.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No feeds match this filter</p>
              </div>
            ) : (
              <div className="space-y-6">
                {locations.map(loc => (
                  <div key={loc}>
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                        {loc || "No location specified"}
                      </h4>
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-xs text-gray-400">{stockByLocation[loc].length} feed{stockByLocation[loc].length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {stockByLocation[loc].map((s) => {
                        const status = s._status as StockStatus;
                        const current = parseFloat(String(s.currentStockKg ?? 0));
                        const reorder = s.reorderThresholdKg ? parseFloat(String(s.reorderThresholdKg)) : null;
                        const capacity = s.capacityKg ? parseFloat(String(s.capacityKg)) : null;
                        const cardBg = status === "out" ? "bg-red-50 border-red-200"
                          : status === "low" ? "bg-orange-50 border-orange-200"
                          : status === "awaiting" ? "bg-blue-50 border-blue-200"
                          : "bg-white border-gray-200";
                        const isHighlighted = highlightBinId === Number(s.id);
                        return (
                          <div
                            key={String(s.id)}
                            data-bin-id={String(s.id)}
                            className={`rounded-xl border p-4 transition-all duration-500 ${cardBg}${isHighlighted ? " ring-2 ring-orange-400 ring-offset-2" : ""}`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <div className="flex-1 min-w-0 pr-2">
                                <p className="font-semibold text-gray-900 leading-tight">{String(s.productName || feedTypeLabel(String(s.feedType ?? "")))}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{feedTypeLabel(String(s.feedType ?? ""))}{s.speciesIntended ? ` — ${s.speciesIntended}` : ""}</p>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <StatusBadge status={status} />
                                <Button size="sm" variant="ghost" onClick={() => setTraceBinId(Number(s.id))} className="h-7 px-2 text-blue-600" title="View traceability ledger"><GitBranch className="w-3 h-3" /></Button>
                                <Button size="sm" variant="ghost" onClick={() => openStockEdit(s)} className="h-7 px-2"><Edit2 className="w-3 h-3" /></Button>
                                <Button size="sm" variant="ghost" onClick={() => delStockMut.mutate(Number(s.id))} className="h-7 px-2 text-red-600"><Trash2 className="w-3 h-3" /></Button>
                              </div>
                            </div>

                            <p className="text-2xl font-bold text-gray-800 mt-2">{fmtKg(s.currentStockKg as string)}</p>

                            <StockBar current={current} reorder={reorder} capacity={capacity} />

                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                              {!!s.supplierName && (
                                <span className="flex items-center gap-1"><Truck className="w-3 h-3" />Supplier: {String(s.supplierName)}</span>
                              )}
                              {!!s.awaitingDelivery && !!s.expectedDeliveryDate && (
                                <span className="flex items-center gap-1 text-blue-600 font-medium"><Clock className="w-3 h-3" />Delivery expected {fmtDate(String(s.expectedDeliveryDate))}</span>
                              )}
                              {!!s.awaitingDelivery && !s.expectedDeliveryDate && (
                                <span className="flex items-center gap-1 text-blue-600"><Truck className="w-3 h-3" />Order placed — delivery date TBC</span>
                              )}
                            </div>

                            {!!s.notes && <p className="text-xs text-gray-400 mt-2 italic">{String(s.notes)}</p>}

                            {!s.awaitingDelivery && (status === "low" || status === "out") && (
                              <div className="mt-3 pt-3 border-t border-current border-opacity-10">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs gap-1.5 border-orange-300 text-orange-700 hover:bg-orange-50"
                                  onClick={() => { setReorderBin(s); setReorderDate(""); setReorderNotes(""); }}
                                >
                                  <ShoppingCart className="w-3 h-3" />
                                  Raise Reorder
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── DELIVERIES TAB ── */}
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
                          {!!d.femasNumberOnNote && <Badge className="text-xs" style={{ background: "#ede9fe", color: "#5b21b6", border: "none" }}>FEMAS: {d.femasNumberOnNote as string}</Badge>}
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
                      {!!d.batchNumber && <span><span className="text-gray-400">Batch:</span> {String(d.batchNumber)}</span>}
                      {!!d.lotNumber && <span><span className="text-gray-400">Lot:</span> {String(d.lotNumber)}</span>}
                      {!!d.storageLocation && <span><span className="text-gray-400">Stored:</span> {String(d.storageLocation)}</span>}
                      {!!d.bestBeforeDate && <span><span className="text-gray-400">Best before:</span> {fmtDate(String(d.bestBeforeDate))}</span>}
                      {!!d.speciesIntended && <span><span className="text-gray-400">For:</span> {String(d.speciesIntended)}</span>}
                      {!!d.receivedBy && <span><span className="text-gray-400">Received by:</span> {String(d.receivedBy)}</span>}
                      {!!d.medicatedFeed && !!d.withdrawalPeriodDays && (
                        <span className="text-red-600 font-medium col-span-2">Withdrawal period: {String(d.withdrawalPeriodDays)} days</span>
                      )}
                    </div>
                    {!!d.notes && <p className="text-xs text-gray-400 mt-2 italic">{String(d.notes)}</p>}
                    {!!d.medicationDetails && <p className="text-xs text-red-700 mt-1 font-medium">Medication: {String(d.medicationDetails)}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── DELIVERY DIALOG ── */}
      <Dialog open={showDeliveryDialog} onOpenChange={setShowDeliveryDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editDelivery ? "Edit Delivery" : "Record Feed Delivery"}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            {/* Smart link section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 grid grid-cols-2 gap-3">
              <div>
                <Label className="text-blue-800 text-xs font-semibold">Link to Feed Stock Bin</Label>
                <Select value={deliveryForm.feedStockItemId ?? "__none__"} onValueChange={v => {
                  const id = v === "__none__" ? "" : v;
                  if (id) {
                    const bin = (stockQ.data ?? []).find((s: Record<string, unknown>) => String(s.id) === id) as Record<string, unknown> | undefined;
                    if (bin) setDeliveryForm(f => ({ ...f, feedStockItemId: id, feedType: String(bin.feedType ?? f.feedType), productName: String(bin.productName ?? f.productName ?? ""), storageLocation: String(bin.storageLocation ?? f.storageLocation ?? "") }));
                    else setDeliveryForm(f => ({ ...f, feedStockItemId: id }));
                  } else setDeliveryForm(f => ({ ...f, feedStockItemId: "" }));
                }}>
                  <SelectTrigger className="h-8 text-xs mt-1"><SelectValue placeholder="Optional — auto-updates stock levels" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Not linked</SelectItem>
                    {(stockQ.data ?? []).map((s: Record<string, unknown>) => <SelectItem key={String(s.id)} value={String(s.id)}>{String(s.productName || s.feedType)} — {String(s.storageLocation || "no location")}</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-xs text-blue-600 mt-1">Stock level auto-updates on save</p>
              </div>
              <div>
                <Label className="text-blue-800 text-xs font-semibold">Link to Purchase Order</Label>
                <Select value={deliveryForm.poId ?? "__none__"} onValueChange={v => setDeliveryForm(f => ({ ...f, poId: v === "__none__" ? "" : v }))}>
                  <SelectTrigger className="h-8 text-xs mt-1"><SelectValue placeholder="Optional — closes PO receipt" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Not linked to a PO</SelectItem>
                    {(purchaseOrdersQ.data ?? []).filter((po: Record<string, unknown>) => !["cancelled", "fully_received"].includes(String(po.status))).map((po: Record<string, unknown>) => <SelectItem key={String(po.id)} value={String(po.id)}>{String(po.poNumber)} — {String(po.supplierName || "No supplier")}</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-xs text-blue-600 mt-1">Marks PO as received on save</p>
              </div>
            </div>
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
                <Select value={deliveryForm.speciesIntended ?? "__none__"} onValueChange={v => setDeliveryForm(f => ({ ...f, speciesIntended: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Select species" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Not specified</SelectItem>
                    {SPECIES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                  </SelectContent>
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
              if (!deliveryForm.deliveryDate || !deliveryForm.quantityKg || !deliveryForm.supplierName) { toast({ title: "Date, supplier and quantity required", variant: "destructive" }); return; }
              const costPence = deliveryForm.costPence ? Math.round(parseFloat(deliveryForm.costPence) * 100) : undefined;
              const data: Record<string, unknown> = { ...deliveryForm, costPence, medicatedFeed: deliveryForm.medicatedFeed === "true" };
              if (!data.supplierId) delete data.supplierId;
              if (!data.femasNumberOnNote) delete data.femasNumberOnNote;
              if (!data.bestBeforeDate) delete data.bestBeforeDate;
              if (!data.speciesIntended || data.speciesIntended === "__none__") delete data.speciesIntended;
              if (!data.feedStockItemId) delete data.feedStockItemId;
              if (!data.poId) delete data.poId;
              deliveryMut.mutate(data);
            }}>{editDelivery ? "Save Changes" : "Record Delivery"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── STOCK / BIN DIALOG ── */}
      <Dialog open={showStockDialog} onOpenChange={setShowStockDialog}>
        <DialogContent className="max-w-xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editStock ? "Edit Feed Bin" : "Register Feed Bin"}</DialogTitle>
          </DialogHeader>

          {/* Purpose banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-xs text-amber-800 leading-relaxed">
            {editStock
              ? "This is the bin's configuration record. Stock level is managed automatically by deliveries and feed usage. Use the adjustment section below only to correct an error."
              : "This registers a physical bin or storage location so the system can track its stock level. To record feed arriving, use \u201cRecord Delivery\u201d. To record feed being used, use the Feed Records section in Livestock."}
          </div>

          <div className="grid gap-3 py-1">

            {/* Section: Identity */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Feed type *</Label>
                <Select value={stockForm.feedType ?? "compound_pellets"} onValueChange={v => setStockForm(f => ({ ...f, feedType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{FEED_TYPES.map(ft => <SelectItem key={ft.value} value={ft.value}>{ft.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Species intended</Label>
                <Select value={stockForm.speciesIntended ?? "__none__"} onValueChange={v => setStockForm(f => ({ ...f, speciesIntended: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Any species" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Not specified</SelectItem>
                    {SPECIES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Product name</Label>
              <Input
                value={stockForm.productName ?? ""}
                onChange={e => setStockForm(f => ({ ...f, productName: e.target.value }))}
                placeholder="e.g. Beef Finisher 18% Nuts"
                list="known-products"
              />
              {knownProducts.length > 0 && (
                <datalist id="known-products">
                  {knownProducts.map(p => <option key={p} value={p} />)}
                </datalist>
              )}
            </div>

            <div>
              <Label>Storage location *</Label>
              <Input
                value={stockForm.storageLocation ?? ""}
                onChange={e => setStockForm(f => ({ ...f, storageLocation: e.target.value }))}
                placeholder="e.g. Grain Store Bay 4, Cattle Shed Bin"
                list="known-locations"
              />
              {knownLocations.length > 0 && (
                <datalist id="known-locations">
                  {knownLocations.map(l => <option key={l} value={l} />)}
                </datalist>
              )}
              <p className="text-xs text-gray-400 mt-1">Bins in the same location are grouped together on the stock page.</p>
            </div>

            {/* Section: Preferred supplier */}
            <div>
              <Label>Preferred supplier</Label>
              {suppliers.length > 0 ? (
                <Select
                  value={stockForm.supplierName || "__none__"}
                  onValueChange={v => setStockForm(f => ({ ...f, supplierName: v === "__none__" ? "" : v }))}
                >
                  <SelectTrigger><SelectValue placeholder="Select supplier…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Not specified</SelectItem>
                    {suppliers.map((s: any) => (
                      <SelectItem key={String(s.id)} value={String(s.name)}>{String(s.name)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={stockForm.supplierName ?? ""}
                  onChange={e => setStockForm(f => ({ ...f, supplierName: e.target.value }))}
                  placeholder="Who to contact when reordering"
                />
              )}
              <p className="text-xs text-gray-400 mt-1">
                {suppliers.length === 0
                  ? "Add suppliers in the Suppliers section to get a dropdown here."
                  : "The supplier you typically order this feed from."}
              </p>
            </div>

            {/* Section: Thresholds */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-600 mb-2.5">Stock thresholds</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Reorder at (kg)</Label>
                  <Input type="number" value={stockForm.reorderThresholdKg ?? ""} onChange={e => setStockForm(f => ({ ...f, reorderThresholdKg: e.target.value }))} placeholder="e.g. 500" min="0" />
                  <p className="text-xs text-gray-400 mt-1">Triggers a Low Stock alert when reached.</p>
                </div>
                <div>
                  <Label>Bin capacity (kg)</Label>
                  <Input type="number" value={stockForm.capacityKg ?? ""} onChange={e => setStockForm(f => ({ ...f, capacityKg: e.target.value }))} placeholder="Optional — silo/bin size" min="0" />
                </div>
              </div>
            </div>

            {/* Section: Opening balance (create only) OR Stock adjustment (edit only) */}
            {!editStock ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-green-800 mb-1">Opening balance</p>
                <p className="text-xs text-green-700 mb-2">If you already have feed in this bin, enter the current amount. Set to 0 if the bin is empty or you'll be recording the first delivery separately.</p>
                <div className="flex items-center gap-3">
                  <div className="w-40">
                    <Label>Quantity (kg)</Label>
                    <Input type="number" value={stockForm.currentStockKg ?? "0"} onChange={e => setStockForm(f => ({ ...f, currentStockKg: e.target.value }))} min="0" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-600 mb-1">Current stock level</p>
                <p className="text-2xl font-bold text-gray-800 mb-1">{fmtKg(stockForm.currentStockKg)}</p>
                <p className="text-xs text-gray-400 mb-3">Managed automatically by delivery records and feed usage. Only adjust below if correcting a data error.</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Manual adjustment (kg)</Label>
                    <Input
                      type="number"
                      value={stockAdjustment}
                      onChange={e => setStockAdjustment(e.target.value)}
                      placeholder="+500 to add, −200 to remove"
                    />
                  </div>
                  <div>
                    <Label>Reason</Label>
                    <Input
                      value={stockAdjustReason}
                      onChange={e => setStockAdjustReason(e.target.value)}
                      placeholder="e.g. Stocktake correction"
                    />
                  </div>
                </div>
                {stockAdjustment && !isNaN(parseFloat(stockAdjustment)) && (
                  <p className="text-xs text-blue-700 mt-2">
                    New stock level will be: <strong>{fmtKg(Math.max(0, parseFloat(stockForm.currentStockKg ?? "0") + parseFloat(stockAdjustment)))}</strong>
                  </p>
                )}
              </div>
            )}

            {/* Section: Manual awaiting flag — for when no PO exists in the system */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-700 mb-1">Awaiting delivery flag</p>
              <p className="text-xs text-blue-600 mb-2">This flag is set automatically when a linked Purchase Order is sent or confirmed. Only set it manually here if you have placed an order outside the system.</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Order placed outside system?</Label>
                  <Select value={stockForm.awaitingDelivery ?? "false"} onValueChange={v => setStockForm(f => ({ ...f, awaitingDelivery: v, expectedDeliveryDate: v === "false" ? "" : f.expectedDeliveryDate }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">No — not awaiting</SelectItem>
                      <SelectItem value="true">Yes — awaiting delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {stockForm.awaitingDelivery === "true" && (
                  <div>
                    <Label>Expected delivery date</Label>
                    <Input type="date" value={stockForm.expectedDeliveryDate ?? ""} onChange={e => setStockForm(f => ({ ...f, expectedDeliveryDate: e.target.value }))} />
                  </div>
                )}
              </div>
            </div>

            <div><Label>Notes</Label><Textarea value={stockForm.notes ?? ""} onChange={e => setStockForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Any notes about this bin or feed type" /></div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStockDialog(false)}>Cancel</Button>
            <Button className="bg-green-800 hover:bg-green-900 text-white" onClick={() => {
              if (!stockForm.storageLocation?.trim()) {
                toast({ title: "Storage location is required", variant: "destructive" });
                return;
              }
              const data: Record<string, unknown> = {
                ...stockForm,
                awaitingDelivery: stockForm.awaitingDelivery === "true",
              };
              // On edit: apply adjustment to current stock
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
            }}>{editStock ? "Save Changes" : "Register Bin"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── BATCH TRACE TAB ── */}
      {tab === "trace" && (
        <div>
          <div className="mb-5">
            <h3 className="font-semibold text-gray-800 mb-1">Batch Recall Trace</h3>
            <p className="text-xs text-gray-500 mb-4">Enter a batch or lot number to trace it from supplier delivery through to the herds it was fed to. Essential for APHA recall responses.</p>
            <div className="flex gap-2 max-w-lg">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  className="pl-9"
                  placeholder="Batch or lot number…"
                  value={batchSearch}
                  onChange={e => setBatchSearch(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") setBatchQuery(batchSearch.trim()); }}
                />
              </div>
              <Button onClick={() => setBatchQuery(batchSearch.trim())} className="bg-green-800 hover:bg-green-900 text-white">
                Trace
              </Button>
            </div>
          </div>

          {batchQuery.length >= 2 && (
            batchTraceQ.isLoading ? (
              <div className="py-10 text-center text-gray-400 text-sm">Searching…</div>
            ) : (
              <div className="space-y-6">
                {/* Deliveries found */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <ArrowDown className="w-4 h-4 text-green-700" />
                    Deliveries matching "{batchQuery}"
                    <span className="font-normal text-gray-400">({(batchTraceQ.data?.deliveries ?? []).length} found)</span>
                  </h4>
                  {(batchTraceQ.data?.deliveries ?? []).length === 0 ? (
                    <p className="text-sm text-gray-400 pl-6">No deliveries found with this batch / lot number.</p>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            {["Date", "Supplier", "Product", "Batch", "Lot", "Qty", "Storage Bin", "Medicated"].map(h => (
                              <th key={h} className="text-left px-3 py-2.5 font-medium text-gray-500">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {(batchTraceQ.data?.deliveries ?? []).map((d: any) => (
                            <tr key={d.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-mono">{fmtDate(d.deliveryDate)}</td>
                              <td className="px-3 py-2">{d.supplierName}</td>
                              <td className="px-3 py-2">{d.productName || d.feedType}</td>
                              <td className="px-3 py-2 font-mono font-semibold">{d.batchNumber || "—"}</td>
                              <td className="px-3 py-2 font-mono">{d.lotNumber || "—"}</td>
                              <td className="px-3 py-2 font-medium">{fmtKg(d.quantityKg)}</td>
                              <td className="px-3 py-2">{d.bin ? `${d.bin.productName || "Bin"} — ${d.bin.storageLocation || "—"}` : <span className="text-gray-300">Not linked</span>}</td>
                              <td className="px-3 py-2">{d.medicatedFeed ? <Badge variant="destructive" className="text-xs">YES</Badge> : <span className="text-gray-300">No</span>}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Usage / feeding events found */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <ArrowUp className="w-4 h-4 text-orange-600" />
                    Feeding events matching "{batchQuery}"
                    <span className="font-normal text-gray-400">({(batchTraceQ.data?.usage ?? []).length} found)</span>
                  </h4>
                  {(batchTraceQ.data?.usage ?? []).length === 0 ? (
                    <p className="text-sm text-gray-400 pl-6">No feeding events recorded with this batch number.</p>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            {["Date Fed", "Herd / Group", "Qty Fed", "Source Bin", "Batch"].map(h => (
                              <th key={h} className="text-left px-3 py-2.5 font-medium text-gray-500">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {(batchTraceQ.data?.usage ?? []).map((u: any) => (
                            <tr key={u.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-mono">{fmtDate(u.feedDate)}</td>
                              <td className="px-3 py-2 font-medium">{u.herdName || <span className="text-gray-300">—</span>}</td>
                              <td className="px-3 py-2">{fmtKg(u.quantityKg)}</td>
                              <td className="px-3 py-2">{u.bin ? `${u.bin.productName || "Bin"} — ${u.bin.storageLocation || "—"}` : <span className="text-gray-300">Not linked</span>}</td>
                              <td className="px-3 py-2 font-mono">{u.batchNumber || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {(batchTraceQ.data?.deliveries ?? []).length === 0 && (batchTraceQ.data?.usage ?? []).length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <GitBranch className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No records found for "{batchQuery}"</p>
                    <p className="text-sm">Check the batch number and try again.</p>
                  </div>
                )}
              </div>
            )
          )}

          {batchQuery.length < 2 && (
            <div className="text-center py-16 text-gray-400">
              <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium text-gray-500">Enter a batch or lot number to begin</p>
              <p className="text-sm mt-1">Enter at least 2 characters to search across all delivery and feeding records</p>
            </div>
          )}
        </div>
      )}

      {/* ── ORDERS TAB ── */}
      {tab === "orders" && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Feed Orders Register</h2>
              <p className="text-xs text-gray-500 mt-0.5">Track feed orders raised with suppliers. When delivery arrives, mark as received and log a delivery receipt.</p>
            </div>
            <Button size="sm" onClick={openFpoAdd}><Plus className="w-3.5 h-3.5 mr-1" />Raise Feed Order</Button>
          </div>

          {activeFpos.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1">
                <Clock className="w-3 h-3" />{activeFpos.length} active order{activeFpos.length !== 1 ? "s" : ""}
              </div>
              {overdueFpos.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-2.5 py-1">
                  <AlertCircle className="w-3 h-3" />{overdueFpos.length} overdue — chase supplier
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 mb-4">
            <button onClick={() => setFpoFilter("active")} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${fpoFilter === "active" ? "bg-green-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              Active ({activeFpos.length})
            </button>
            <button onClick={() => setFpoFilter("all")} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${fpoFilter === "all" ? "bg-green-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              All ({fpos.length})
            </button>
          </div>

          {filteredFpos.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium text-gray-500">{fpoFilter === "active" ? "No active feed orders" : "No feed orders on record"}</p>
              <p className="text-sm mt-1 mb-4">Raise a feed order when purchasing feed from a supplier.</p>
              <Button size="sm" onClick={openFpoAdd}><Plus className="w-3.5 h-3.5 mr-1" />Raise Feed Order</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFpos.map(fpo => {
                const isOverdue = !INACTIVE_FPO_STATUSES.includes(String(fpo.status)) && fpo.expectedDeliveryDate && String(fpo.expectedDeliveryDate).substring(0, 10) < today;
                const isReceived = fpo.status === "received";
                const isCancelled = fpo.status === "cancelled";
                return (
                  <div key={String(fpo.id)} className={`rounded-lg border p-4 ${isOverdue ? "border-red-300 bg-red-50" : isReceived ? "border-green-200 bg-green-50/60" : isCancelled ? "border-gray-200 bg-gray-50/60" : "border-amber-200 bg-white"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {isOverdue && <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                          {isReceived && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />}
                          <span className="font-mono text-sm font-semibold text-gray-800">{String(fpo.poNumber)}</span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isReceived ? "bg-green-100 text-green-700" : fpo.status === "confirmed" ? "bg-blue-100 text-blue-700" : fpo.status === "sent" ? "bg-amber-100 text-amber-700" : fpo.status === "draft" ? "bg-gray-100 text-gray-600" : isCancelled ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`}>
                            {String(fpo.status).charAt(0).toUpperCase() + String(fpo.status).slice(1)}
                          </span>
                          {isOverdue && (
                            <span className="text-xs text-red-600 font-medium">Overdue since {fmtDate(String(fpo.expectedDeliveryDate))}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-800 mt-0.5">
                          {fpo.supplierName ? <><span className="font-medium">{String(fpo.supplierName)}</span> — </> : null}
                          {String(fpo.productName)}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {fmtKg(fpo.quantityKg)}
                          {fpo.speciesIntended && fpo.speciesIntended !== "__none__" && <span> · For {String(fpo.speciesIntended).charAt(0).toUpperCase() + String(fpo.speciesIntended).slice(1)}</span>}
                          {fpo.feedType && <span> · {FEED_TYPES.find(t => t.value === fpo.feedType)?.label ?? String(fpo.feedType)}</span>}
                          {fpo.expectedDeliveryDate && !isOverdue && !isReceived && <span> · Expected {fmtDate(String(fpo.expectedDeliveryDate))}</span>}
                          {fpo.actualDeliveryDate && <span> · Delivered {fmtDate(String(fpo.actualDeliveryDate))}</span>}
                          {fpo.orderedBy && <span> · Raised by {String(fpo.orderedBy)}</span>}
                        </p>
                        {fpo.notes && <p className="text-xs text-gray-400 mt-1 italic truncate max-w-md">{String(fpo.notes)}</p>}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {!isReceived && !isCancelled && (
                          <button
                            className="text-xs font-medium px-2.5 py-1 rounded border border-green-300 text-green-700 bg-white hover:bg-green-50 flex items-center gap-1 transition-colors"
                            onClick={() => { setReceiveId(Number(fpo.id)); setReceiveDate(new Date().toISOString().substring(0, 10)); }}
                          >
                            <CheckCircle2 className="w-3 h-3" />Received
                          </button>
                        )}
                        <button className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 flex items-center gap-1 transition-colors" onClick={() => openFpoEdit(fpo)}>
                          <Edit2 className="w-3 h-3" />Edit
                        </button>
                        <button className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 bg-white hover:bg-red-50 flex items-center transition-colors" onClick={() => { if (confirm("Remove this feed order?")) deleteFpoMut.mutate(Number(fpo.id)); }}>
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── BIN TRACE DIALOG ── */}
      {traceBinId !== null && (
        <Dialog open onOpenChange={o => { if (!o) setTraceBinId(null); }}>
          <DialogContent style={{ maxWidth: "54rem" }}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-blue-600" />
                {traceQ.data?.bin ? `${traceQ.data.bin.productName || traceQ.data.bin.feedType} — ${traceQ.data.bin.storageLocation || "no location"}` : "Bin Ledger"}
              </DialogTitle>
            </DialogHeader>

            {traceQ.isLoading ? (
              <div className="py-10 text-center text-gray-400 text-sm">Loading ledger…</div>
            ) : (
              <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
                {/* Summary */}
                {traceQ.data?.bin && (
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Total IN", value: fmtKg((traceQ.data.deliveries ?? []).reduce((s: number, d: any) => s + parseFloat(d.quantityKg ?? 0), 0)), color: "text-green-700" },
                      { label: "Total OUT", value: fmtKg((traceQ.data.usage ?? []).reduce((s: number, u: any) => s + parseFloat(u.quantityKg ?? 0), 0)), color: "text-orange-600" },
                      { label: "Current Stock", value: fmtKg(traceQ.data.bin.currentStockKg), color: "text-gray-800" },
                    ].map(card => (
                      <div key={card.label} className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                        <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Deliveries IN */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <ArrowDown className="w-3.5 h-3.5 text-green-600" /> Deliveries IN ({(traceQ.data?.deliveries ?? []).length})
                  </h4>
                  {(traceQ.data?.deliveries ?? []).length === 0 ? (
                    <p className="text-sm text-gray-400 pl-5">No deliveries linked to this bin yet.</p>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-green-50">
                          <tr>
                            {["Date", "Supplier", "Batch No.", "Lot No.", "Qty IN", "Del. Note", "Medicated"].map(h => (
                              <th key={h} className="text-left px-3 py-2 font-medium text-green-800">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {(traceQ.data?.deliveries ?? []).map((d: any) => (
                            <tr key={d.id} className="hover:bg-green-50/50">
                              <td className="px-3 py-2 font-mono">{fmtDate(d.deliveryDate)}</td>
                              <td className="px-3 py-2">{d.supplierName}</td>
                              <td className="px-3 py-2 font-mono font-semibold">{d.batchNumber || "—"}</td>
                              <td className="px-3 py-2 font-mono">{d.lotNumber || "—"}</td>
                              <td className="px-3 py-2 font-medium text-green-700">+{fmtKg(d.quantityKg)}</td>
                              <td className="px-3 py-2 font-mono">{d.deliveryNoteNumber || "—"}</td>
                              <td className="px-3 py-2">{d.medicatedFeed ? <Badge variant="destructive" className="text-xs">YES</Badge> : "No"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Usage OUT */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <ArrowUp className="w-3.5 h-3.5 text-orange-600" /> Feeding Events OUT ({(traceQ.data?.usage ?? []).length})
                  </h4>
                  {(traceQ.data?.usage ?? []).length === 0 ? (
                    <p className="text-sm text-gray-400 pl-5">No feeding events linked to this bin yet. Record feed usage in Livestock → Feed Records.</p>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-orange-50">
                          <tr>
                            {["Date Fed", "Herd / Group", "Qty OUT", "Batch", "Notes"].map(h => (
                              <th key={h} className="text-left px-3 py-2 font-medium text-orange-800">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {(traceQ.data?.usage ?? []).map((u: any) => (
                            <tr key={u.id} className="hover:bg-orange-50/50">
                              <td className="px-3 py-2 font-mono">{fmtDate(u.feedDate)}</td>
                              <td className="px-3 py-2 font-medium">{u.herdName || <span className="text-gray-400">No herd linked</span>}</td>
                              <td className="px-3 py-2 font-medium text-orange-700">-{fmtKg(u.quantityKg)}</td>
                              <td className="px-3 py-2 font-mono">{u.batchNumber || "—"}</td>
                              <td className="px-3 py-2 text-gray-500">{u.notes || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setTraceBinId(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Raise Reorder dialog */}
      <Dialog open={!!reorderBin} onOpenChange={open => { if (!open) { setReorderBin(null); setReorderMemberId("__none__"); setReorderDueDate(""); setReorderAssignNote(""); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-orange-600" />
              Raise Reorder
            </DialogTitle>
          </DialogHeader>
          {reorderBin && (() => {
            const binName = String(reorderBin.productName || feedTypeLabel(String(reorderBin.feedType ?? "")));
            const supplierNameStr = String(reorderBin.supplierName ?? "");
            const members: Record<string, unknown>[] = membersQ.data ?? [];
            const selectedMember = members.find((m: Record<string, unknown>) => String(m.id) === reorderMemberId);
            const selectedPhone = selectedMember ? String(selectedMember.phone ?? "") : "";
            return (
              <div className="space-y-4 py-1">
                <div className="rounded-lg bg-orange-50 border border-orange-200 px-4 py-3 text-sm text-orange-800">
                  <p className="font-medium">{binName}</p>
                  {!!supplierNameStr && <p className="text-xs mt-0.5 text-orange-600">Supplier: {supplierNameStr}</p>}
                  <p className="text-xs mt-0.5">Current stock: {fmtKg(reorderBin.currentStockKg as string)}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Expected Delivery Date <span className="text-gray-400 font-normal">(optional)</span></Label>
                  <Input type="date" className="mt-1" value={reorderDate} onChange={e => setReorderDate(e.target.value)} />
                </div>

                <div>
                  <Label className="text-sm font-medium">Bin Notes <span className="text-gray-400 font-normal">(optional)</span></Label>
                  <Textarea
                    className="mt-1 text-sm" rows={2}
                    placeholder="e.g. quantity needed, urgency, contact details..."
                    value={reorderNotes} onChange={e => setReorderNotes(e.target.value)}
                  />
                </div>

                <div className="border-t pt-4">
                  <Label className="text-sm font-medium">Assign to Staff Member <span className="text-gray-400 font-normal">(optional)</span></Label>
                  <Select value={reorderMemberId} onValueChange={setReorderMemberId}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="— No assignment —" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— No assignment —</SelectItem>
                      {members.map((m: Record<string, unknown>) => (
                        <SelectItem key={String(m.id)} value={String(m.id)}>
                          {String(m.firstName ?? "")} {String(m.lastName ?? "")}
                          {m.role ? ` — ${String(m.role)}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {reorderMemberId !== "__none__" && (
                    <div className="mt-3 space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Task Due Date <span className="text-gray-400 font-normal">(optional)</span></Label>
                        <Input type="date" className="mt-1" value={reorderDueDate} onChange={e => setReorderDueDate(e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Note to Staff Member <span className="text-gray-400 font-normal">(optional)</span></Label>
                        <Textarea
                          className="mt-1 text-sm" rows={2}
                          placeholder="e.g. call supplier on 01234 567890, min order 1 tonne..."
                          value={reorderAssignNote} onChange={e => setReorderAssignNote(e.target.value)}
                        />
                      </div>
                      <div className={`rounded-md px-3 py-2 text-xs flex items-start gap-2 ${selectedPhone ? "bg-green-50 border border-green-200 text-green-700" : "bg-gray-50 border border-gray-200 text-gray-500"}`}>
                        <Info className="w-3 h-3 mt-0.5 shrink-0" />
                        {selectedPhone
                          ? `SMS notification will be sent to ${String(selectedMember?.firstName ?? "")} at ${selectedPhone}.`
                          : "No phone number registered for this staff member — SMS cannot be sent."}
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500">Confirming will mark this bin as <strong>Awaiting Delivery</strong> and suppress reorder alerts until the delivery is received.</p>
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setReorderBin(null); setReorderMemberId("__none__"); setReorderDueDate(""); setReorderAssignNote(""); }}>Cancel</Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white"
              disabled={reorderMut.isPending}
              onClick={() => {
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
                  supplierName: String(reorderBin.supplierName ?? ""),
                });
              }}
            >
              {reorderMut.isPending ? "Saving…" : "Confirm Reorder Raised"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* ── FEED ORDER DIALOG ── */}
      <Dialog open={showFpoDialog} onOpenChange={v => !v && setShowFpoDialog(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editFpo ? "Edit Feed Order" : "Raise Feed Order"}</DialogTitle>
            <DialogDescription>{editFpo ? `Edit details for ${editFpo.poNumber}` : "Record a feed purchase order raised with a supplier."}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">Supplier Name</Label>
                <Input value={fpoForm.supplierName ?? ""} onChange={e => setFpoForm(f => ({ ...f, supplierName: e.target.value }))} placeholder="e.g. J&H Feeds Ltd" />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Product Name *</Label>
                <Input value={fpoForm.productName ?? ""} onChange={e => setFpoForm(f => ({ ...f, productName: e.target.value }))} placeholder="e.g. Sheep Nut 16%" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">Feed Type</Label>
                <Select value={fpoForm.feedType ?? "compound_pellets"} onValueChange={v => setFpoForm(f => ({ ...f, feedType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FEED_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1 block">Species Intended</Label>
                <Select value={fpoForm.speciesIntended ?? "__none__"} onValueChange={v => setFpoForm(f => ({ ...f, speciesIntended: v }))}>
                  <SelectTrigger><SelectValue placeholder="Any / not specified" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Not specified</SelectItem>
                    <SelectItem value="cattle">Cattle</SelectItem>
                    <SelectItem value="sheep">Sheep</SelectItem>
                    <SelectItem value="pigs">Pigs</SelectItem>
                    <SelectItem value="poultry">Poultry</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Quantity (kg) *</Label>
              <Input type="number" value={fpoForm.quantityKg ?? ""} onChange={e => setFpoForm(f => ({ ...f, quantityKg: e.target.value }))} placeholder="e.g. 1000" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">Order Date *</Label>
                <Input type="date" value={fpoForm.orderDate ?? ""} onChange={e => setFpoForm(f => ({ ...f, orderDate: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Expected Delivery</Label>
                <Input type="date" value={fpoForm.expectedDeliveryDate ?? ""} onChange={e => setFpoForm(f => ({ ...f, expectedDeliveryDate: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">Status</Label>
                <Select value={fpoForm.status ?? "sent"} onValueChange={v => setFpoForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent to Supplier</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1 block">Raised By</Label>
                <Input value={fpoForm.orderedBy ?? ""} onChange={e => setFpoForm(f => ({ ...f, orderedBy: e.target.value }))} placeholder="Staff member name" />
              </div>
            </div>
            {fpoForm.status === "received" && (
              <div>
                <Label className="text-xs mb-1 block">Actual Delivery Date</Label>
                <Input type="date" value={fpoForm.actualDeliveryDate ?? ""} onChange={e => setFpoForm(f => ({ ...f, actualDeliveryDate: e.target.value }))} />
              </div>
            )}
            <div>
              <Label className="text-xs mb-1 block">Notes</Label>
              <Textarea value={fpoForm.notes ?? ""} onChange={e => setFpoForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any notes about this order…" rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFpoDialog(false)}>Cancel</Button>
            <Button
              disabled={!fpoForm.productName?.trim() || !fpoForm.quantityKg || !fpoForm.orderDate || fpoMut.isPending}
              onClick={() => {
                const data: Record<string, unknown> = {
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
                  notes: fpoForm.notes || null,
                };
                fpoMut.mutate(data);
              }}
            >
              {fpoMut.isPending ? "Saving…" : editFpo ? "Save Changes" : "Raise Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MARK AS RECEIVED DIALOG ── */}
      <Dialog open={receiveId !== null} onOpenChange={v => !v && setReceiveId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Mark Order as Received</DialogTitle>
            <DialogDescription>Confirm the actual delivery date. Then log a delivery receipt in the Delivery Records tab.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-1 block">Actual Delivery Date</Label>
              <Input type="date" value={receiveDate} onChange={e => setReceiveDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReceiveId(null)}>Cancel</Button>
            <Button
              disabled={!receiveDate || receiveFpoMut.isPending}
              onClick={() => { if (receiveId !== null) receiveFpoMut.mutate({ id: receiveId, date: receiveDate }); }}
            >
              {receiveFpoMut.isPending ? "Saving…" : "Mark Received"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </AppLayout>
  );
}
