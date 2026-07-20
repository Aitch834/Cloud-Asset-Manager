import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Loader2, AlertTriangle, ShoppingCart, Package, FlaskConical, CheckCircle2, Clock, Truck, XCircle, ChevronDown, ChevronUp, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL;
const api = (path: string) => `${BASE}api/${path}`;

interface PpeItem { id: number; ppeType: string; description: string | null; size: string | null; quantityInStock: number; unitCostPence: number | null; }
interface ChemItem { id: number; productName: string; stockItemId: number | null; currentQty: number | null; unit: string | null; }
interface AvailableStock { ppeItems: PpeItem[]; chemItems: ChemItem[]; }

interface Drawdown {
  id: number; dairyType: string; drawdownDate: string; itemType: string; itemName: string;
  ppeStockItemId: number | null; chemStockItemId: number | null; quantityUsed: string;
  unit: string; usedBy: string | null; usageContext: string | null; notes: string | null; createdAt: string;
}

interface RestockRequest {
  id: number; dairyType: string; requestDate: string; itemType: string; itemName: string;
  requestedQty: string; unit: string; urgency: string; requestedBy: string | null;
  supplierName: string | null; supplierOrderRef: string | null;
  qtyReceived: string | null; receivedBy: string | null;
  reason: string | null; status: string; adminNotes: string | null; resolvedBy: string | null; createdAt: string;
}

const DAIRY_LABELS: Record<string, string> = {
  cattle: "Cattle Dairy", sheep: "Sheep Dairy", goat: "Goat Dairy",
  "organic-cattle": "Organic Cattle Dairy", "organic-sheep": "Organic Sheep Dairy", "organic-goat": "Organic Goat Dairy",
};

const USAGE_CONTEXTS = [
  { value: "milking", label: "Milking session" },
  { value: "cip-cleaning", label: "CIP cleaning (pipeline/clusters)" },
  { value: "teat-prep", label: "Teat preparation (pre/post dip)" },
  { value: "calving-kidding", label: "Calving / kidding" },
  { value: "equipment-cleaning", label: "Equipment / surface cleaning" },
  { value: "general", label: "General dairy use" },
];

const URGENCY_META: Record<string, { label: string; colour: string }> = {
  low: { label: "Low", colour: "bg-gray-100 text-gray-700 border-gray-200" },
  normal: { label: "Normal", colour: "bg-blue-50 text-blue-700 border-blue-200" },
  urgent: { label: "Urgent", colour: "bg-amber-50 text-amber-700 border-amber-200" },
  critical: { label: "Critical", colour: "bg-red-50 text-red-700 border-red-200" },
};

const STATUS_META: Record<string, { label: string; icon: typeof Clock; colour: string }> = {
  pending: { label: "Pending", icon: Clock, colour: "bg-amber-50 text-amber-700 border-amber-200" },
  approved: { label: "Approved", icon: CheckCircle2, colour: "bg-blue-50 text-blue-700 border-blue-200" },
  ordered: { label: "Ordered", icon: Truck, colour: "bg-purple-50 text-purple-700 border-purple-200" },
  received: { label: "Received", icon: CheckCircle2, colour: "bg-green-50 text-green-700 border-green-200" },
  rejected: { label: "Rejected", icon: XCircle, colour: "bg-red-50 text-red-700 border-red-200" },
};

const today = () => new Date().toISOString().slice(0, 10);
const fmt = (d: string) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

function LowStockAlert({ ppeItems, chemItems }: { ppeItems: PpeItem[]; chemItems: ChemItem[] }) {
  const lowPpe = ppeItems.filter(p => p.quantityInStock <= 5);
  const lowChem = chemItems.filter(c => (c.currentQty ?? 0) <= 5);
  if (!lowPpe.length && !lowChem.length) return null;
  return (
    <div className="flex flex-col gap-1 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
      <div className="flex items-center gap-2 font-semibold"><AlertTriangle className="w-4 h-4 flex-shrink-0" />Low stock alert</div>
      {lowPpe.map(p => <span key={p.id} className="ml-6 text-xs">PPE — {p.ppeType}{p.description ? ` (${p.description})` : ""}: {p.quantityInStock} items remaining</span>)}
      {lowChem.map(c => <span key={c.id} className="ml-6 text-xs">Chemical — {c.productName}: {c.currentQty ?? 0} {c.unit || "units"} remaining</span>)}
    </div>
  );
}

export function DairySuppliesTab({ farmId, dairyType }: { farmId: number; dairyType: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const [drawdownOpen, setDrawdownOpen] = useState(false);
  const [restockOpen, setRestockOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyYear, setHistoryYear] = useState("all");
  const [historyItemType, setHistoryItemType] = useState("all");

  const blankDrawdown = { drawdownDate: today(), itemType: "ppe", itemName: "", ppeStockItemId: "", chemStockItemId: "", quantityUsed: "", unit: "items", usedBy: "", usageContext: "", notes: "" };
  const [dForm, setDForm] = useState<typeof blankDrawdown>(blankDrawdown);

  const blankRestock = { requestDate: today(), itemType: "ppe", itemName: "", ppeStockItemId: "", chemStockItemId: "", requestedQty: "", unit: "items", urgency: "normal", requestedBy: "", supplierName: "", reason: "" };
  const [rForm, setRForm] = useState<typeof blankRestock>(blankRestock);

  const stockQ = useQuery<AvailableStock>({
    queryKey: ["dairy-supplies-stock", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy-supplies/stock`)).then(r => r.json()),
  });
  const staffQ = useQuery<{ names: string[] }>({
    queryKey: ["dairy-staff-names", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/staff-names`), { credentials: "include" }).then(r => r.json()),
  });
  const staffNames = staffQ.data?.names ?? [];
  const abrSuppliersQ = useQuery<{ id: number; companyName: string }[]>({
    queryKey: ["dairy-abr-suppliers", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/abr-suppliers`), { credentials: "include" }).then(r => r.json()),
  });
  const supplierNames = (Array.isArray(abrSuppliersQ.data) ? abrSuppliersQ.data : []).map((s: { companyName: string }) => s.companyName);
  const drawdownsQ = useQuery<{ drawdowns: Drawdown[] }>({
    queryKey: ["dairy-supplies-drawdowns", farmId, dairyType],
    queryFn: () => fetch(api(`farms/${farmId}/dairy-supplies/drawdowns?dairyType=${dairyType}`)).then(r => r.json()),
  });
  const requestsQ = useQuery<{ requests: RestockRequest[] }>({
    queryKey: ["dairy-restock-requests", farmId, dairyType],
    queryFn: () => fetch(api(`farms/${farmId}/dairy-supplies/restock-requests?dairyType=${dairyType}`)).then(r => r.json()),
  });

  const ppeItems: PpeItem[] = stockQ.data?.ppeItems ?? [];
  const chemItems: ChemItem[] = stockQ.data?.chemItems ?? [];
  const drawdowns: Drawdown[] = drawdownsQ.data?.drawdowns ?? [];
  const requests: RestockRequest[] = requestsQ.data?.requests ?? [];

  const addDrawdown = useMutation({
    mutationFn: (body: object) => fetch(api(`farms/${farmId}/dairy-supplies/drawdowns`), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, dairyType }) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dairy-supplies-drawdowns", farmId, dairyType] }); qc.invalidateQueries({ queryKey: ["dairy-supplies-stock", farmId] }); setDrawdownOpen(false); toast({ title: "Usage logged" }); },
    onError: () => toast({ title: "Failed to log usage", variant: "destructive" }),
  });
  const delDrawdown = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/dairy-supplies/drawdowns/${id}`), { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dairy-supplies-drawdowns", farmId, dairyType] }); qc.invalidateQueries({ queryKey: ["dairy-supplies-stock", farmId] }); toast({ title: "Record removed" }); },
  });
  const addRequest = useMutation({
    mutationFn: (body: object) => fetch(api(`farms/${farmId}/dairy-supplies/restock-requests`), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, dairyType }) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dairy-restock-requests", farmId, dairyType] }); setRestockOpen(false); toast({ title: "Restock request raised" }); },
    onError: () => toast({ title: "Failed to raise request", variant: "destructive" }),
  });
  const updateRequest = useMutation({
    mutationFn: ({ id, ...body }: { id: number; status: string; adminNotes?: string; resolvedBy?: string }) => fetch(api(`farms/${farmId}/dairy-supplies/restock-requests/${id}`), { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dairy-restock-requests", farmId, dairyType] }); toast({ title: "Request updated" }); },
  });
  const delRequest = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/dairy-supplies/restock-requests/${id}`), { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dairy-restock-requests", farmId, dairyType] }); toast({ title: "Request deleted" }); },
  });

  const historyYears = useMemo(() => {
    const s = new Set<string>(drawdowns.map(d => d.drawdownDate.slice(0, 4)));
    return Array.from(s).sort((a, b) => b.localeCompare(a));
  }, [drawdowns]);

  const filteredHistory = useMemo(() => {
    return drawdowns.filter(d => {
      if (historyYear !== "all" && !d.drawdownDate.startsWith(historyYear)) return false;
      if (historyItemType !== "all" && d.itemType !== historyItemType) return false;
      return true;
    });
  }, [drawdowns, historyYear, historyItemType]);

  const pendingCount = requests.filter(r => r.status === "pending").length;
  const activeCount = requests.filter(r => r.status !== "received" && r.status !== "rejected").length;

  function handleDrawdownItemType(t: string) {
    const unit = t === "ppe" ? "items" : "litres";
    setDForm(p => ({ ...p, itemType: t, unit, itemName: "", ppeStockItemId: "", chemStockItemId: "" }));
  }
  function handleDrawdownPpeSelect(id: string) {
    const item = ppeItems.find(p => String(p.id) === id);
    if (item) setDForm(p => ({ ...p, ppeStockItemId: id, itemName: [item.ppeType, item.description, item.size].filter(Boolean).join(" — ") }));
    else setDForm(p => ({ ...p, ppeStockItemId: id }));
  }
  function handleDrawdownChemSelect(id: string) {
    const item = chemItems.find(c => String(c.id) === id);
    if (item) setDForm(p => ({ ...p, chemStockItemId: id, itemName: item.productName }));
    else setDForm(p => ({ ...p, chemStockItemId: id }));
  }

  function printReport() {
    const printedDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const label = DAIRY_LABELS[dairyType] || dairyType;
    const rows = filteredHistory.map(d => `<tr><td>${fmt(d.drawdownDate)}</td><td>${d.itemType === "ppe" ? "PPE" : "Chemical"}</td><td>${d.itemName}</td><td>${d.quantityUsed} ${d.unit}</td><td>${USAGE_CONTEXTS.find(c => c.value === d.usageContext)?.label || d.usageContext || "—"}</td><td>${d.usedBy || "—"}</td></tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Dairy Supply Usage — ${label}</title><style>body{font-family:Arial,sans-serif;font-size:10px;padding:20px}h1{font-size:14px}h2{font-size:11px;color:#555}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{border:1px solid #e5e7eb;padding:4px 6px;text-align:left}th{background:#f9fafb;font-weight:700;font-size:9px;text-transform:uppercase}.note{font-size:8px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:12px}</style></head><body><h1>Dairy Supply Usage Log — ${label}</h1><h2>Printed: ${printedDate}${historyYear !== "all" ? ` · Year: ${historyYear}` : ""}${historyItemType !== "all" ? ` · Type: ${historyItemType === "ppe" ? "PPE" : "Chemical"}` : ""}</h2><table><tr><th>Date</th><th>Type</th><th>Item</th><th>Qty Used</th><th>Context</th><th>Used By</th></tr>${rows || "<tr><td colspan='6'>No records</td></tr>"}</table><p class="note">Dairy supply usage log — BDE Farm Trac. Retain for 3 years. Printed: ${printedDate}.</p></body></html>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.print();
  }

  return (
    <div className="space-y-6">
      <LowStockAlert ppeItems={ppeItems} chemItems={chemItems} />

      {/* ─── Current Stock Overview ─────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2"><Package className="w-4 h-4 text-blue-600" />Available Supplies</h3>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => { setRForm(blankRestock); setRestockOpen(true); }}><ShoppingCart className="w-3.5 h-3.5 mr-1" />Request Restock</Button>
            <Button size="sm" variant="outline" onClick={() => { setDForm(blankDrawdown); setDrawdownOpen(true); }}><Plus className="w-3.5 h-3.5 mr-1" />Log Usage</Button>
          </div>
        </div>
        {stockQ.isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
        ) : (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PPE */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">PPE</h4>
              {ppeItems.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No PPE stock items set up. Add items in the PPE Store.</p>
              ) : (
                <div className="space-y-1">
                  {ppeItems.map(p => (
                    <div key={p.id} className="flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-background text-sm">
                      <div>
                        <span className="font-medium capitalize">{p.ppeType}</span>
                        {p.description && <span className="text-gray-500 ml-1 text-xs">— {p.description}</span>}
                        {p.size && <span className="text-gray-400 ml-1 text-xs">({p.size})</span>}
                      </div>
                      <span className={`font-bold tabular-nums ${p.quantityInStock <= 5 ? "text-red-600" : p.quantityInStock <= 15 ? "text-amber-600" : "text-green-700"}`}>{p.quantityInStock} items</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Chemicals */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Chemicals</h4>
              {chemItems.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No chemical stock items set up. Add products in the Chemical Store.</p>
              ) : (
                <div className="space-y-1">
                  {chemItems.map(c => (
                    <div key={c.id} className="flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-background text-sm">
                      <span className="font-medium">{c.productName}</span>
                      <span className={`font-bold tabular-nums ${(c.currentQty ?? 0) <= 5 ? "text-red-600" : (c.currentQty ?? 0) <= 20 ? "text-amber-600" : "text-green-700"}`}>
                        {c.currentQty != null ? `${Number(c.currentQty).toLocaleString("en-GB", { maximumFractionDigits: 1 })} ${c.unit || "L"}` : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── Restock Requests ───────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-purple-600" />Restock Requests
            {activeCount > 0 && <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold">{activeCount}</span>}
          </h3>
          <Button size="sm" onClick={() => { setRForm(blankRestock); setRestockOpen(true); }}><Plus className="w-3.5 h-3.5 mr-1" />New Request</Button>
        </div>
        {requestsQ.isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">No restock requests yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                <th className="py-2 px-3 text-left">Date</th>
                <th className="py-2 px-3 text-left">Type</th>
                <th className="py-2 px-3 text-left">Item</th>
                <th className="py-2 px-3 text-left">Qty Requested</th>
                <th className="py-2 px-3 text-left">Urgency</th>
                <th className="py-2 px-3 text-left">Requested By</th>
                <th className="py-2 px-3 text-left">Status</th>
                <th className="py-2 px-3 text-left">Actions</th>
              </tr></thead>
              <tbody>
                {requests.map(r => {
                  const sm = STATUS_META[r.status] ?? STATUS_META.pending;
                  const um = URGENCY_META[r.urgency] ?? URGENCY_META.normal;
                  return (
                    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 px-3 font-medium">{fmt(r.requestDate)}</td>
                      <td className="py-2 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${r.itemType === "ppe" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-purple-50 text-purple-700 border-purple-200"}`}>
                          {r.itemType === "ppe" ? <Package className="w-3 h-3" /> : <FlaskConical className="w-3 h-3" />}
                          {r.itemType === "ppe" ? "PPE" : "Chemical"}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-medium">{r.itemName}</td>
                      <td className="py-2 px-3">{r.requestedQty} {r.unit}</td>
                      <td className="py-2 px-3"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${um.colour}`}>{um.label}</span></td>
                      <td className="py-2 px-3 text-gray-500">{r.requestedBy || "—"}</td>
                      <td className="py-2 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${sm.colour}`}>
                          <sm.icon className="w-3 h-3" />{sm.label}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex gap-1 flex-wrap">
                          {r.status === "pending" && <Button size="sm" variant="outline" className="h-6 text-xs px-2" onClick={() => updateRequest.mutate({ id: r.id, status: "approved" })}>Approve</Button>}
                          {r.status === "approved" && <Button size="sm" variant="outline" className="h-6 text-xs px-2" onClick={() => updateRequest.mutate({ id: r.id, status: "ordered" })}>Mark Ordered</Button>}
                          {r.status === "ordered" && <Button size="sm" variant="outline" className="h-6 text-xs px-2 text-green-700 border-green-300" onClick={() => updateRequest.mutate({ id: r.id, status: "received" })}>Mark Received</Button>}
                          {r.status !== "received" && r.status !== "rejected" && <Button size="sm" variant="ghost" className="h-6 text-xs px-2 text-red-500" onClick={() => updateRequest.mutate({ id: r.id, status: "rejected" })}>Reject</Button>}
                          <Button size="sm" variant="ghost" className="h-6 text-xs text-red-400 px-1" onClick={() => delRequest.mutate(r.id)}><Trash2 className="w-3 h-3" /></Button>
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

      {/* ─── Usage History ──────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <button className="w-full px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between" onClick={() => setShowHistory(h => !h)}>
          <h3 className="text-sm font-semibold">Usage History ({drawdowns.length} records)</h3>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); printReport(); }} className="h-7"><Printer className="w-3.5 h-3.5 mr-1" />Print</Button>
            {showHistory ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </div>
        </button>
        {showHistory && (
          <>
            <div className="px-4 py-3 border-b border-border flex items-center gap-3 flex-wrap">
              <Select value={historyYear} onValueChange={setHistoryYear}>
                <SelectTrigger className="w-32 h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="all">All years</SelectItem>{historyYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={historyItemType} onValueChange={setHistoryItemType}>
                <SelectTrigger className="w-36 h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="ppe">PPE only</SelectItem>
                  <SelectItem value="chemical">Chemical only</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-gray-400">{filteredHistory.length} records</span>
            </div>
            {drawdownsQ.isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">No usage records yet. Use "Log Usage" to record PPE or chemical consumption.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                    <th className="py-2 px-3 text-left">Date</th>
                    <th className="py-2 px-3 text-left">Type</th>
                    <th className="py-2 px-3 text-left">Item</th>
                    <th className="py-2 px-3 text-left">Qty Used</th>
                    <th className="py-2 px-3 text-left">Context</th>
                    <th className="py-2 px-3 text-left">Used By</th>
                    <th className="py-2 px-3 text-left">Notes</th>
                    <th className="py-2 px-3 text-left">Del</th>
                  </tr></thead>
                  <tbody>
                    {filteredHistory.map(d => (
                      <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 px-3 font-medium">{fmt(d.drawdownDate)}</td>
                        <td className="py-2 px-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${d.itemType === "ppe" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-purple-50 text-purple-700 border-purple-200"}`}>
                            {d.itemType === "ppe" ? <Package className="w-3 h-3" /> : <FlaskConical className="w-3 h-3" />}
                            {d.itemType === "ppe" ? "PPE" : "Chemical"}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-medium">{d.itemName}</td>
                        <td className="py-2 px-3 tabular-nums">{d.quantityUsed} {d.unit}</td>
                        <td className="py-2 px-3 text-gray-500 capitalize">{USAGE_CONTEXTS.find(c => c.value === d.usageContext)?.label || d.usageContext || "—"}</td>
                        <td className="py-2 px-3 text-gray-500">{d.usedBy || "—"}</td>
                        <td className="py-2 px-3 text-gray-400 text-xs max-w-[120px] truncate">{d.notes || "—"}</td>
                        <td className="py-2 px-3">
                          <Button variant="ghost" size="sm" className="text-red-400 h-7 w-7 p-0" onClick={() => delDrawdown.mutate(d.id)}><Trash2 className="w-3 h-3" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── Log Usage Dialog ───────────────────────────────────────────────── */}
      <Dialog open={drawdownOpen} onOpenChange={setDrawdownOpen}>
        <DialogContent style={{ maxWidth: "34rem" }}>
          <DialogHeader><DialogTitle>Log Supply Usage</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Date</Label><Input type="date" value={dForm.drawdownDate} onChange={e => setDForm(p => ({ ...p, drawdownDate: e.target.value }))} /></div>
              <div>
                <Label className="text-xs">Item Type</Label>
                <Select value={dForm.itemType} onValueChange={handleDrawdownItemType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="ppe"><Package className="w-3.5 h-3.5 inline mr-1" />PPE</SelectItem><SelectItem value="chemical"><FlaskConical className="w-3.5 h-3.5 inline mr-1" />Chemical</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            {dForm.itemType === "ppe" ? (
              <>
                <div>
                  <Label className="text-xs">PPE Item (from stock)</Label>
                  <Select value={dForm.ppeStockItemId} onValueChange={handleDrawdownPpeSelect}>
                    <SelectTrigger><SelectValue placeholder="Select from PPE store..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__freeform__">— Enter manually below —</SelectItem>
                      {ppeItems.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.ppeType}{p.description ? ` — ${p.description}` : ""}{p.size ? ` (${p.size})` : ""} · {p.quantityInStock} in stock</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {(dForm.ppeStockItemId === "__freeform__" || !dForm.ppeStockItemId) && (
                  <div><Label className="text-xs">Item Name (manual)</Label><Input placeholder="e.g. Nitrile gloves (medium)" value={dForm.itemName} onChange={e => setDForm(p => ({ ...p, itemName: e.target.value }))} /></div>
                )}
              </>
            ) : (
              <>
                <div>
                  <Label className="text-xs">Chemical (from store)</Label>
                  <Select value={dForm.chemStockItemId} onValueChange={handleDrawdownChemSelect}>
                    <SelectTrigger><SelectValue placeholder="Select from chemical store..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__freeform__">— Enter manually below —</SelectItem>
                      {chemItems.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.productName}{c.currentQty != null ? ` · ${Number(c.currentQty).toFixed(1)} ${c.unit || "L"} in stock` : ""}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {(dForm.chemStockItemId === "__freeform__" || !dForm.chemStockItemId) && (
                  <div><Label className="text-xs">Chemical Name (manual)</Label><Input placeholder="e.g. CIP Acid Cleaner" value={dForm.itemName} onChange={e => setDForm(p => ({ ...p, itemName: e.target.value }))} /></div>
                )}
              </>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Quantity Used</Label><Input type="number" min="0" step="0.1" placeholder="0" value={dForm.quantityUsed} onChange={e => setDForm(p => ({ ...p, quantityUsed: e.target.value }))} /></div>
              <div>
                <Label className="text-xs">Unit</Label>
                <Select value={dForm.unit} onValueChange={v => setDForm(p => ({ ...p, unit: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="items">items</SelectItem>
                    <SelectItem value="pairs">pairs</SelectItem>
                    <SelectItem value="litres">litres</SelectItem>
                    <SelectItem value="ml">ml</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Usage Context</Label>
              <Select value={dForm.usageContext} onValueChange={v => setDForm(p => ({ ...p, usageContext: v }))}>
                <SelectTrigger><SelectValue placeholder="Select context..." /></SelectTrigger>
                <SelectContent>{USAGE_CONTEXTS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Used By</Label><Input placeholder="Staff name or initials" value={dForm.usedBy} onChange={e => setDForm(p => ({ ...p, usedBy: e.target.value }))} /></div>
            <div><Label className="text-xs">Notes (optional)</Label><Textarea rows={2} placeholder="Any observations..." value={dForm.notes} onChange={e => setDForm(p => ({ ...p, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDrawdownOpen(false)}>Cancel</Button>
            <Button disabled={addDrawdown.isPending || (!dForm.itemName && !dForm.ppeStockItemId && !dForm.chemStockItemId) || !dForm.quantityUsed} onClick={() => {
              const ppeId = dForm.itemType === "ppe" && dForm.ppeStockItemId && dForm.ppeStockItemId !== "__freeform__" ? Number(dForm.ppeStockItemId) : undefined;
              const chemId = dForm.itemType === "chemical" && dForm.chemStockItemId && dForm.chemStockItemId !== "__freeform__" ? Number(dForm.chemStockItemId) : undefined;
              const name = dForm.itemName || (ppeId ? ppeItems.find(p => p.id === ppeId)?.ppeType : "") || (chemId ? chemItems.find(c => c.id === chemId)?.productName : "") || "";
              addDrawdown.mutate({ ...dForm, itemName: name, ppeStockItemId: ppeId, chemStockItemId: chemId, quantityUsed: dForm.quantityUsed });
            }}>
              {addDrawdown.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Log Usage"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Restock Request Dialog ─────────────────────────────────────────── */}
      <Dialog open={restockOpen} onOpenChange={setRestockOpen}>
        <DialogContent style={{ maxWidth: "34rem" }}>
          <DialogHeader><DialogTitle>Request Restock</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Date Needed</Label><Input type="date" value={rForm.requestDate} onChange={e => setRForm(p => ({ ...p, requestDate: e.target.value }))} /></div>
              <div>
                <Label className="text-xs">Item Type</Label>
                <Select value={rForm.itemType} onValueChange={t => setRForm(p => ({ ...p, itemType: t, unit: t === "ppe" ? "items" : "litres", itemName: "" }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="ppe"><Package className="w-3.5 h-3.5 inline mr-1" />PPE</SelectItem><SelectItem value="chemical"><FlaskConical className="w-3.5 h-3.5 inline mr-1" />Chemical</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            {rForm.itemType === "ppe" ? (
              <div>
                <Label className="text-xs">PPE Item</Label>
                <Select value={rForm.ppeStockItemId} onValueChange={id => { const it = ppeItems.find(p => String(p.id) === id); setRForm(p => ({ ...p, ppeStockItemId: id, itemName: it ? [it.ppeType, it.description, it.size].filter(Boolean).join(" — ") : p.itemName })); }}>
                  <SelectTrigger><SelectValue placeholder="Select or enter below..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__freeform__">— Enter manually below —</SelectItem>
                    {ppeItems.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.ppeType}{p.description ? ` — ${p.description}` : ""}{p.size ? ` (${p.size})` : ""}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <Label className="text-xs">Chemical</Label>
                <Select value={rForm.chemStockItemId} onValueChange={id => { const it = chemItems.find(c => String(c.id) === id); setRForm(p => ({ ...p, chemStockItemId: id, itemName: it ? it.productName : p.itemName })); }}>
                  <SelectTrigger><SelectValue placeholder="Select or enter below..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__freeform__">— Enter manually below —</SelectItem>
                    {chemItems.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.productName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div><Label className="text-xs">Item Name {(rForm.ppeStockItemId === "__freeform__" || rForm.chemStockItemId === "__freeform__" || (!rForm.ppeStockItemId && !rForm.chemStockItemId)) && <span className="text-red-500">*</span>}</Label><Input placeholder="Exact item name / product" value={rForm.itemName} onChange={e => setRForm(p => ({ ...p, itemName: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Quantity Required</Label><Input type="number" min="1" placeholder="0" value={rForm.requestedQty} onChange={e => setRForm(p => ({ ...p, requestedQty: e.target.value }))} /></div>
              <div>
                <Label className="text-xs">Unit</Label>
                <Select value={rForm.unit} onValueChange={v => setRForm(p => ({ ...p, unit: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="items">items</SelectItem>
                    <SelectItem value="boxes">boxes</SelectItem>
                    <SelectItem value="litres">litres</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="drums">drums</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Urgency</Label>
              <Select value={rForm.urgency} onValueChange={v => setRForm(p => ({ ...p, urgency: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low — within a month</SelectItem>
                  <SelectItem value="normal">Normal — within 2 weeks</SelectItem>
                  <SelectItem value="urgent">Urgent — within 3 days</SelectItem>
                  <SelectItem value="critical">Critical — needed immediately</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Requested By</Label>
              <datalist id="ds-restock-staff">{staffNames.map(n => <option key={n} value={n} />)}</datalist>
              <Input list="ds-restock-staff" placeholder="Select or type name…" value={rForm.requestedBy} onChange={e => setRForm(p => ({ ...p, requestedBy: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs">Preferred Supplier <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <datalist id="ds-restock-supplier">{supplierNames.map(n => <option key={n} value={n} />)}</datalist>
              <Input list="ds-restock-supplier" placeholder="Supplier name" value={rForm.supplierName} onChange={e => setRForm(p => ({ ...p, supplierName: e.target.value }))} />
            </div>
            <div><Label className="text-xs">Reason / Notes</Label><Textarea rows={2} placeholder="Why is this needed? Current stock level?" value={rForm.reason} onChange={e => setRForm(p => ({ ...p, reason: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestockOpen(false)}>Cancel</Button>
            <Button disabled={addRequest.isPending || !rForm.itemName || !rForm.requestedQty} onClick={() => addRequest.mutate({ ...rForm })}>
              {addRequest.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Raise Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
