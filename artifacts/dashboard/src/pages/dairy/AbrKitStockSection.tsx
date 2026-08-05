import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { useSafeUser } from "@/hooks/use-safe-clerk";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, PieChart, Pie, Cell, Legend } from "recharts";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { DocAttach } from "@/components/DocAttach";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Redirect } from "wouter";
import { Plus, Pencil, Trash2, Loader2, AlertTriangle, CheckCircle2, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, Eye, Droplets, Thermometer, FileDown, Paperclip, BarChart2, QrCode, Download, MapPin, ChevronsUpDown, Search, X, Sparkles, ClipboardList, Printer, Building2, ShoppingCart, PackageCheck, Receipt, Clock, BadgeCheck, XCircle, TrendingUp, TrendingDown, Package, Check, FlaskConical } from "lucide-react";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { QRCodeSVG } from "qrcode.react";
import { useFarmMembers } from "@/hooks/use-farm-members";
import { StaffSelect } from "@/components/ui/staff-select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { openPrintWindow } from "@/lib/print-report";
import { VMD_MEDICINES } from "@/data/vmdMedicines";
import { useToast } from "@/hooks/use-toast";
import { api, formatDate, AbrKitStock } from "./shared";

// ─── ABR Test Kit Stock Section ───────────────────────────────────────────────

export function AbrKitStockSection({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AbrKitStock | null>(null);
  const [form, setForm] = useState<Partial<AbrKitStock>>({});
  const [panelOpen, setPanelOpen] = useState(false);

  const stockQ = useQuery<{ stock: AbrKitStock[] }>({
    queryKey: ["dairy-abr-stock", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/abr-test-kit-stock`), { credentials: "include" }).then(r => r.json()),
  });
  const stock = stockQ.data?.stock ?? [];
  const lowStock = stock.filter(s => s.quantityRemaining <= s.lowStockThreshold && s.quantityRemaining >= 0);

  const save = useMutation({
    mutationFn: (body: Partial<AbrKitStock>) => {
      const url = editingItem ? api(`farms/${farmId}/dairy/abr-test-kit-stock/${editingItem.id}`) : api(`farms/${farmId}/dairy/abr-test-kit-stock`);
      return fetch(url, { method: editingItem ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dairy-abr-stock", farmId] }); setOpen(false); setEditingItem(null); setForm({}); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/dairy/abr-test-kit-stock/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-abr-stock", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function openAdd() { setEditingItem(null); setForm({ quantityPurchased: 0, quantityUsed: 0, lowStockThreshold: 5 }); setOpen(true); }
  function openEdit(s: AbrKitStock) { setEditingItem(s); setForm({ ...s }); setOpen(true); }
  function set(k: keyof AbrKitStock, v: unknown) { setForm(f => ({ ...f, [k]: v })); }

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
        onClick={() => setPanelOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm text-gray-800">ABR Test Kit Stock ({stock.length} products)</span>
          {lowStock.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              <AlertTriangle className="h-3 w-3" />{lowStock.length} low stock
            </span>
          )}
        </div>
        {panelOpen ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
      </button>
      {panelOpen && (
        <div className="p-4 space-y-3">
          <p className="text-xs text-gray-500">Track antibiotic residue test kit batches, lot numbers, expiry dates, and remaining stock. When linked to a milk record, stock automatically decrements.</p>
          {stockQ.isLoading
            ? <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            : stock.length === 0
              ? <p className="text-sm text-gray-400 italic">No kit stock logged yet. Add your first kit batch below.</p>
              : stock.map(s => {
                const isLow = s.quantityRemaining <= s.lowStockThreshold;
                const isOut = s.quantityRemaining === 0;
                return (
                  <div key={s.id} className={`flex items-start justify-between rounded-md border px-3 py-2.5 ${isOut ? "bg-red-50 border-red-200" : isLow ? "bg-amber-50 border-amber-200" : "bg-white border-gray-200"}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-gray-900">{s.productName}</span>
                        {s.supplier && <span className="text-xs text-gray-500">{s.supplier}</span>}
                        {isOut ? <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full">Out of stock</span>
                          : isLow ? <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Low stock</span>
                          : <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />In stock</span>}
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        {s.lotNumber && <span>Lot: <span className="font-mono text-gray-700">{s.lotNumber}</span></span>}
                        {s.batchNumber && <span>Batch: <span className="font-mono text-gray-700">{s.batchNumber}</span></span>}
                        {s.expiryDate && <span>Expires: {formatDate(s.expiryDate)}</span>}
                        <span className="font-medium text-gray-700">{s.quantityRemaining} of {s.quantityPurchased} remaining</span>
                        <span>({s.quantityUsed} used)</span>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => del.mutate(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                );
              })
          }
          <Button size="sm" variant="outline" onClick={openAdd}><Plus className="h-3.5 w-3.5 mr-1" />Add Kit Batch</Button>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent style={{ maxWidth: "42rem" }}>
          <DialogHeader><DialogTitle>{editingItem ? "Edit Kit Batch" : "Add ABR Test Kit Batch"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2"><Label>Product Name *</Label><Input placeholder="e.g. Delvotest Accelerator, BRT Tube Kit" value={form.productName || ""} onChange={e => set("productName", e.target.value)} /></div>
            <div><Label>Supplier</Label><Input placeholder="e.g. Neogen, Charm Sciences" value={form.supplier || ""} onChange={e => set("supplier", e.target.value)} /></div>
            <div><Label>Expiry Date</Label><Input type="date" value={form.expiryDate || ""} onChange={e => set("expiryDate", e.target.value)} /></div>
            <div><Label>Lot Number</Label><Input placeholder="From kit box" value={form.lotNumber || ""} onChange={e => set("lotNumber", e.target.value)} /></div>
            <div><Label>Batch Number</Label><Input placeholder="From kit box" value={form.batchNumber || ""} onChange={e => set("batchNumber", e.target.value)} /></div>
            <div><Label>Qty Purchased</Label><Input type="number" min="0" value={form.quantityPurchased ?? ""} onChange={e => set("quantityPurchased", parseInt(e.target.value) || 0)} /></div>
            <div><Label>Qty Used (to date)</Label><Input type="number" min="0" value={form.quantityUsed ?? ""} onChange={e => set("quantityUsed", parseInt(e.target.value) || 0)} /></div>
            <div><Label>Low Stock Alert Threshold</Label><Input type="number" min="0" value={form.lowStockThreshold ?? 5} onChange={e => set("lowStockThreshold", parseInt(e.target.value) || 5)} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending || !form.productName?.trim()}>
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {editingItem ? "Save Changes" : "Add Batch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
