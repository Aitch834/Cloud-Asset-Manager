import { useFarmName } from "@/hooks/use-farm-name";
import { useState, useMemo, useEffect, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StaffSelect } from "@/components/ui/staff-select";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import {
  Plus, Trash2, Loader2, Eye, Grape, Leaf, ClipboardList, Sprout,
  BarChart3, Bug, Scissors, ShieldAlert, CheckCircle2, XCircle, AlertTriangle,
  FileDown, Pencil, Map, FileText, Receipt, CalendarCheck, ShieldCheck, Wine,
  Droplet, FlaskConical, ChevronRight, Package, TrendingUp, BookOpen, Printer,
  Award, Globe, BadgeAlert, Beaker, Wrench, Gauge,
} from "lucide-react";
import {
  ViticulturalAnalyticsTab,
  VintageSeasonReportTab,
  ViticulturalEnterpriseReport,
} from "@/components/ViticulturalReports";
import {
  HarvestReceptionTab,
  PressingRecordsTab,
  FermentationRecordsTab,
  VesselRegisterTab,
  CellarOpsTab,
  BottlingRecordsTab,
  So2TestingTab,
  EquipmentRegisterTab,
  BatchTrailQuickSearch,
  WINERY_VIEW_ADDITIONS_EVENT,
} from "@/pages/WineryManagementTabs";
import { sanitiseCsvCell } from "@/lib/csv";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { useAppStore } from "@/hooks/use-app-store";
import { useUserRole } from "@/hooks/use-user-role";
import { useToast } from "@/hooks/use-toast";
import { VineyardBlockBoundaryMapDialog } from "@/components/viticulture/VineyardBlockBoundaryMapDialog";
import { VineyardBlockMapTab } from "@/components/viticulture/VineyardBlockMapTab";
import { Checkbox } from "@/components/ui/checkbox";
import { useLookupStrings } from "@/hooks/use-lookup";
import { usePersistedTab } from "@/hooks/use-persisted-tab";

import { apiUrl as api } from "@/lib/api";
import { fmt, fmtDate, fmtNum, today, exportCSV, printExciseReturn, printOrganicWineRecords, PRESSURE_LABELS, BBCH_STAGES, UK_GRAPE_VARIETIES, UK_ROOTSTOCKS, OPERATION_TYPES, StatCard, Empty, ConfirmDialog, DataTable, useCrud, ViewField, RaiseTaskBtn } from "./shared";

const WINERY_CATEGORIES = [
  "Bottles", "Corks & Stoppers", "Capsules & Closures", "Labels",
  "Barrels & Oak", "Fining Agents", "SO₂ & Preservatives",
  "Yeast & Nutrients", "Packaging & Cases", "Other",
];
const WINERY_UNITS = ["units", "bottles", "cases (12)", "cases (6)", "kg", "g", "L", "mL", "sheets"];
const WINERY_MOVEMENT_TYPES = [
  { value: "delivery", label: "Delivery / Received" },
  { value: "usage", label: "Used in Production" },
  { value: "write-off", label: "Write-off / Wastage" },
  { value: "stocktake", label: "Stocktake (Actual Count)" },
  { value: "adjustment", label: "Manual Adjustment" },
];
const MOVEMENT_COLOURS: Record<string, string> = {
  delivery: "text-green-700",
  usage: "text-red-600",
  "write-off": "text-orange-600",
  stocktake: "text-blue-600",
  adjustment: "text-gray-600",
};

type WineryItem = { id: number; name: string; category: string; unit: string; balance: number; minimum_stock?: number | null; notes?: string | null };
type WineryMovement = { id: number; movement_type: string; movement_date: string; quantity_change: number; running_balance: number; supplier?: string | null; reference?: string | null; notes?: string | null };

export function WineryStockTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [itemDialog, setItemDialog] = useState<"add" | "edit" | null>(null);
  const [editingItem, setEditingItem] = useState<WineryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<WineryItem | null>(null);
  const [itemForm, setItemForm] = useState<Record<string, string>>({});

  const [movDialog, setMovDialog] = useState<WineryItem | null>(null);
  const [histDialog, setHistDialog] = useState<WineryItem | null>(null);
  const [movForm, setMovForm] = useState<Record<string, string>>({});
  const [deletingMov, setDeletingMov] = useState<{ movId: number; itemId: number } | null>(null);

  const { data: itemsData, isLoading } = useQuery<{ items: WineryItem[] }>({
    queryKey: ["winery-stock", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/winery-stock`, { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
  });
  const items = itemsData?.items ?? [];
  const filteredItems = categoryFilter === "all" ? items : items.filter(item => item.category === categoryFilter);
  const stockCsvCols = [
    { key: "name", label: "Item Name" },
    { key: "category", label: "Category" },
    { key: "balance", label: "Balance" },
    { key: "unit", label: "Unit" },
    { key: "minimum_stock", label: "Low Stock Alert" },
    { key: "notes", label: "Notes" },
  ];

  const { data: histData, isLoading: histLoading } = useQuery<{ movements: WineryMovement[] }>({
    queryKey: ["winery-stock-movements", farmId, histDialog?.id],
    queryFn: () => fetch(`/api/farms/${farmId}/winery-stock/${histDialog!.id}/movements`, { credentials: "include" }).then(r => r.json()),
    enabled: !!histDialog,
  });
  const movements = histData?.movements ?? [];

  const itemSave = useMutation({
    mutationFn: async () => {
      const url = editingItem ? `/api/farms/${farmId}/winery-stock/${editingItem.id}` : `/api/farms/${farmId}/winery-stock`;
      const r = await fetch(url, { method: editingItem ? "PUT" : "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(itemForm) });
      if (!r.ok) throw new Error("Save failed");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["winery-stock", farmId] }); setItemDialog(null); setEditingItem(null); toast({ title: editingItem ? "Item updated" : "Item added" }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const itemDelete = useMutation({
    mutationFn: async (item: WineryItem) => { const r = await fetch(`/api/farms/${farmId}/winery-stock/${item.id}`, { method: "DELETE", credentials: "include" }); if (!r.ok) throw new Error("Delete failed"); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["winery-stock", farmId] }); setDeletingItem(null); toast({ title: "Item deleted" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const movSave = useMutation({
    mutationFn: async () => {
      const r = await fetch(`/api/farms/${farmId}/winery-stock/${movDialog!.id}/movements`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(movForm) });
      if (!r.ok) throw new Error("Save failed");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["winery-stock", farmId] }); qc.invalidateQueries({ queryKey: ["winery-stock-movements", farmId] }); setMovDialog(null); toast({ title: "Movement recorded" }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const movDelete = useMutation({
    mutationFn: async ({ movId, itemId }: { movId: number; itemId: number }) => { const r = await fetch(`/api/farms/${farmId}/winery-stock/${itemId}/movements/${movId}`, { method: "DELETE", credentials: "include" }); if (!r.ok) throw new Error("Delete failed"); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["winery-stock", farmId] }); qc.invalidateQueries({ queryKey: ["winery-stock-movements", farmId] }); setDeletingMov(null); toast({ title: "Movement deleted" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const openAddItem = () => { setEditingItem(null); setItemForm({ unit: "units" }); setItemDialog("add"); };
  const openEditItem = (item: WineryItem) => {
    setEditingItem(item);
    setItemForm({ name: item.name, category: item.category, unit: item.unit, minimumStock: item.minimum_stock != null ? String(item.minimum_stock) : "", notes: item.notes ?? "" });
    setItemDialog("edit");
  };
  const openMovDialog = (item: WineryItem) => { setMovDialog(item); setMovForm({ movementType: "delivery", movementDate: new Date().toISOString().slice(0, 10) }); };

  const sfi = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setItemForm(f => ({ ...f, [k]: e.target.value }));
  const sfm = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setMovForm(f => ({ ...f, [k]: e.target.value }));

  const isLowStock = (item: WineryItem) => item.minimum_stock != null && Number(item.balance) <= Number(item.minimum_stock);

  const movType = movForm.movementType;
  const isStocktake = movType === "stocktake";
  const isDelivery = movType === "delivery";

  const fmtQty = (qty: number) => {
    const n = Number(qty);
    if (Math.abs(n) < 0.001) return "0";
    return n > 0 ? `+${n.toLocaleString(undefined, { maximumFractionDigits: 3 })}` : n.toLocaleString(undefined, { maximumFractionDigits: 3 });
  };

  const movCanSave = movForm.movementDate && (isStocktake ? !!movForm.stocktakeActual : !!movForm.quantity);
  const stockChartData = filteredItems.slice(0, 15).map(item => ({
    name: item.name.length > 16 ? item.name.slice(0, 15) + "…" : item.name,
    Balance: Number(item.balance),
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-gray-600">
          Track winery consumables — bottles, corks, fining agents, SO₂ products and more.
          Record deliveries, production usage and stocktakes to maintain an accurate running balance.
        </p>
        <Button size="sm" onClick={openAddItem} className="shrink-0">
          <Plus className="h-4 w-4 mr-1" />Add Item
        </Button>
      </div>
      <div className="flex gap-2 items-center flex-wrap">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-44 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {WINERY_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" onClick={() => exportCSV(filteredItems as unknown as Record<string, unknown>[], "winery-stock.csv", stockCsvCols)} disabled={!filteredItems.length}>
          <FileDown className="h-4 w-4 mr-1" />Export CSV
        </Button>
      </div>
      {stockChartData.length > 0 && (
        <div className="bg-white rounded-lg border p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Current Stock Levels</p>
          <ResponsiveContainer width="100%" height={Math.max(140, stockChartData.length * 26)}>
            <BarChart data={stockChartData} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 90 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={90} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Bar dataKey="Balance" fill="#8b5cf6" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {isLoading && <div className="text-center py-8 text-muted-foreground text-sm">Loading…</div>}

      {!isLoading && items.length === 0 && (
        <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
          <Package className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="font-medium">No winery stock items yet</p>
          <p className="text-xs mt-1">Add bottles, corks, fining agents, barrels and other consumables to track stock levels.</p>
        </div>
      )}

      {items.length > 0 && (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left p-3 font-medium">Item</th>
                <th className="text-left p-3 font-medium">Category</th>
                <th className="text-right p-3 font-medium">Balance</th>
                <th className="text-left p-3 font-medium">Unit</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredItems.map(item => {
                const low = isLowStock(item);
                return (
                  <tr key={item.id} className={low ? "bg-amber-50" : ""}>
                    <td className="p-3 font-medium">
                      {item.name}
                      {low && <span className="ml-2 text-xs text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Low stock</span>}
                    </td>
                    <td className="p-3 text-muted-foreground">{item.category}</td>
                    <td className="p-3 text-right font-mono font-medium">{Number(item.balance).toLocaleString(undefined, { maximumFractionDigits: 3 })}</td>
                    <td className="p-3 text-muted-foreground">{item.unit}</td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="outline" onClick={() => openMovDialog(item)}>
                          <Plus className="h-3.5 w-3.5 mr-1" />Movement
                        </Button>
                        <Button size="sm" variant="ghost" title="View history" onClick={() => setHistDialog(item)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" title="Edit item" onClick={() => openEditItem(item)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" title="Delete item" onClick={() => setDeletingItem(item)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Add / Edit Item Dialog ─────────────────────────────────────────────── */}
      <Dialog open={!!itemDialog} onOpenChange={() => { setItemDialog(null); setEditingItem(null); itemSave.reset(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Stock Item" : "Add Winery Stock Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Item Name *</Label><Input value={itemForm.name ?? ""} onChange={sfi("name")} placeholder="e.g. Sauvignon Blanc Bottles (75cl)" /></div>
            <div>
              <Label>Category *</Label>
              <Select value={itemForm.category ?? ""} onValueChange={v => setItemForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue placeholder="Select category…" /></SelectTrigger>
                <SelectContent>{WINERY_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Unit *</Label>
              <Select value={itemForm.unit ?? "units"} onValueChange={v => setItemForm(f => ({ ...f, unit: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{WINERY_UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Low Stock Alert (optional)</Label><Input type="number" value={itemForm.minimumStock ?? ""} onChange={sfi("minimumStock")} placeholder="Alert when balance reaches or falls below…" /></div>
            <div><Label>Notes</Label><Textarea value={itemForm.notes ?? ""} onChange={sfi("notes")} rows={2} /></div>
          </div>
          <DialogMutationError mutation={itemSave} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setItemDialog(null); setEditingItem(null); }}>Cancel</Button>
            <Button onClick={() => itemSave.mutate()} disabled={!itemForm.name || !itemForm.category || !itemForm.unit || itemSave.isPending}>
              {itemSave.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Movement Dialog ────────────────────────────────────────────────── */}
      <Dialog open={!!movDialog} onOpenChange={() => { setMovDialog(null); movSave.reset(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Movement — {movDialog?.name}</DialogTitle>
            <DialogDescription>Current balance: <strong>{movDialog ? Number(movDialog.balance).toLocaleString() : 0} {movDialog?.unit}</strong></DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Movement Type *</Label>
              <Select value={movForm.movementType ?? "delivery"} onValueChange={v => setMovForm(f => ({ ...f, movementType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{WINERY_MOVEMENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Date *</Label><Input type="date" value={movForm.movementDate ?? ""} onChange={sfm("movementDate")} /></div>
            {isStocktake ? (
              <div>
                <Label>Actual Count *</Label>
                <Input type="number" value={movForm.stocktakeActual ?? ""} onChange={sfm("stocktakeActual")} placeholder="Physical count" />
                <p className="text-xs text-muted-foreground mt-1">The system will calculate the adjustment delta automatically.</p>
              </div>
            ) : (
              <div>
                <Label>Quantity *</Label>
                <Input type="number" value={movForm.quantity ?? ""} onChange={sfm("quantity")} placeholder={movType === "usage" || movType === "write-off" ? "Amount used / written off" : "Quantity"} />
              </div>
            )}
            {isDelivery && (
              <>
                <div><Label>Supplier</Label><Input value={movForm.supplier ?? ""} onChange={sfm("supplier")} placeholder="Supplier name" /></div>
                <div><Label>Cost per Unit (pence)</Label><Input type="number" value={movForm.costPence ?? ""} onChange={sfm("costPence")} placeholder="e.g. 45" /></div>
              </>
            )}
            <div><Label>Reference</Label><Input value={movForm.reference ?? ""} onChange={sfm("reference")} placeholder="Vintage year, batch ref, invoice no…" /></div>
            <div><Label>Notes</Label><Textarea value={movForm.notes ?? ""} onChange={sfm("notes")} rows={2} /></div>
          </div>
          <DialogMutationError mutation={movSave} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setMovDialog(null)}>Cancel</Button>
            <Button onClick={() => movSave.mutate()} disabled={!movCanSave || movSave.isPending}>
              {movSave.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Movement History Dialog ────────────────────────────────────────────── */}
      <Dialog open={!!histDialog} onOpenChange={() => setHistDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Movement History — {histDialog?.name}</DialogTitle>
            <DialogDescription>Current balance: <strong>{histDialog ? Number(histDialog.balance).toLocaleString() : 0} {histDialog?.unit}</strong></DialogDescription>
          </DialogHeader>
          {histLoading && <div className="py-6 text-center text-muted-foreground text-sm">Loading…</div>}
          {!histLoading && movements.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No movements recorded yet.</p>}
          {movements.length > 0 && (
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 sticky top-0">
                  <tr>
                    <th className="text-left p-2 font-medium">Date</th>
                    <th className="text-left p-2 font-medium">Type</th>
                    <th className="text-right p-2 font-medium">Change</th>
                    <th className="text-right p-2 font-medium">Balance</th>
                    <th className="text-left p-2 font-medium">Supplier / Ref</th>
                    <th className="text-left p-2 font-medium">Notes</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[...movements].reverse().map(mov => {
                    const colClass = MOVEMENT_COLOURS[mov.movement_type] ?? "text-gray-600";
                    const typeLabel = WINERY_MOVEMENT_TYPES.find(t => t.value === mov.movement_type)?.label ?? mov.movement_type;
                    const srText = [mov.supplier, mov.reference].filter(Boolean).join(" / ");
                    return (
                      <tr key={mov.id}>
                        <td className="p-2 whitespace-nowrap">{String(mov.movement_date).slice(0, 10)}</td>
                        <td className="p-2 whitespace-nowrap"><span className={`text-xs font-medium ${colClass}`}>{typeLabel}</span></td>
                        <td className={`p-2 text-right font-mono font-medium ${colClass}`}>{fmtQty(mov.quantity_change)}</td>
                        <td className="p-2 text-right font-mono text-muted-foreground">{Number(mov.running_balance).toLocaleString(undefined, { maximumFractionDigits: 3 })}</td>
                        <td className="p-2 text-muted-foreground text-xs">{srText || "—"}</td>
                        <td className="p-2 text-muted-foreground text-xs max-w-xs truncate">{mov.notes || "—"}</td>
                        <td className="p-2">
                          <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                            onClick={() => setDeletingMov({ movId: mov.id, itemId: histDialog!.id })}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setHistDialog(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Item Confirm ────────────────────────────────────────────────── */}
      <Dialog open={!!deletingItem} onOpenChange={() => { setDeletingItem(null); itemDelete.reset(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Stock Item</DialogTitle>
            <DialogDescription>Remove <strong>{deletingItem?.name}</strong> and all its movement history? This cannot be undone.</DialogDescription></DialogHeader>
          <DialogMutationError mutation={itemDelete} message="Failed to delete — please try again." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingItem(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => itemDelete.mutate(deletingItem!)} disabled={itemDelete.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Movement Confirm ────────────────────────────────────────────── */}
      <Dialog open={!!deletingMov} onOpenChange={() => { setDeletingMov(null); movDelete.reset(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Movement</DialogTitle>
            <DialogDescription>Remove this movement record? The running balance will be recalculated. This cannot be undone.</DialogDescription></DialogHeader>
          <DialogMutationError mutation={movDelete} message="Failed to delete — please try again." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingMov(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => movDelete.mutate(deletingMov!)} disabled={movDelete.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
