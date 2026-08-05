import { useState, useMemo } from "react";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Eye, Loader2, LayoutList, ShoppingBag, ClipboardCheck, PawPrint, Zap, PoundSterling, Crosshair, TrendingUp, PackagePlus, ChevronDown, ChevronRight, AlertTriangle, Package, Printer } from "lucide-react";
import { openPrintWindow } from "@/lib/print-report";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { useAppStore } from "@/hooks/use-app-store";
import { Redirect } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";

const api = (path: string) => `/api/${path}`;
const fmt = (v: unknown) => (v == null || v === "" ? "—" : String(v));
const fmtDate = (v: unknown) => (v ? new Date(v as string).toLocaleDateString("en-GB") : "—");
function Empty({ msg }: { msg: string }) { return <p className="text-sm text-muted-foreground italic py-6 text-center">{msg}</p>; }

function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = "Confirm", confirmVariant = "default" }: {
  open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void;
  confirmLabel?: string; confirmVariant?: "default" | "destructive";
}) {
  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onCancel(); }}>
      <DialogContent style={{ maxWidth: "22rem" }}>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">{message}</p>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant={confirmVariant} onClick={onConfirm}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DataTable({ cols, rows, onEdit, onDelete, onView }: { cols: { key: string; label: string; fmt?: (r: Record<string, unknown>) => string }[]; rows: Record<string, unknown>[]; onEdit?: (r: Record<string, unknown>) => void; onDelete?: (r: Record<string, unknown>) => void; onView?: (r: Record<string, unknown>) => void }) {
  const [pendingDelete, setPendingDelete] = useState<Record<string, unknown> | null>(null);
  if (!rows.length) return <Empty msg="No records yet." />;
  return (
    <>
      <div className="overflow-x-auto"><table className="w-full text-sm">
        <thead><tr className="border-b">{cols.map(c => <th key={c.key} className="text-left py-2 pr-4 font-medium text-muted-foreground">{c.label}</th>)}{(onEdit || onDelete || onView) && <th />}</tr></thead>
        <tbody>{rows.map((row, i) => <tr key={i} className="border-b last:border-0">
          {cols.map(c => <td key={c.key} className="py-2 pr-4">{c.fmt ? c.fmt(row) : fmt(row[c.key])}</td>)}
          {(onEdit || onDelete || onView) && <td className="py-2 text-right space-x-1">
            {onView && <Button size="icon" variant="ghost" onClick={() => onView(row)}><Eye className="w-3.5 h-3.5" /></Button>}
            {onEdit && <Button size="icon" variant="ghost" onClick={() => onEdit(row)}><Pencil className="w-3.5 h-3.5" /></Button>}
            {onDelete && <Button size="icon" variant="ghost" onClick={() => setPendingDelete(row)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>}
          </td>}
        </tr>)}</tbody>
      </table></div>
      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete Record"
        message="Are you sure you want to delete this record? This cannot be undone."
        onConfirm={() => { if (pendingDelete && onDelete) { onDelete(pendingDelete); } setPendingDelete(null); }}
        onCancel={() => setPendingDelete(null)}
        confirmLabel="Delete"
        confirmVariant="destructive"
      />
    </>
  );
}

function useCrud(farmId: number, endpoint: string, key: string) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const { data = [], isLoading } = useQuery({ queryKey: [key, farmId], queryFn: () => fetch(api(`farms/${farmId}/${endpoint}`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(editing ? api(`farms/${farmId}/${endpoint}/${editing.id}`) : api(`farms/${farmId}/${endpoint}`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => { qc.invalidateQueries({ queryKey: [key, farmId] }); setOpen(false); setForm({}); setEditing(null); }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/${endpoint}/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }), onSuccess: () => qc.invalidateQueries({ queryKey: [key, farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  function openAdd(def: Record<string, unknown> = {}) { setEditing(null); setForm(def); setOpen(true); }
  function openEdit(r: Record<string, unknown>) { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v ?? ""]))); setOpen(true); }
  return { data, isLoading, open, setOpen, editing, form, setForm, save, del, openAdd, openEdit };
}

function ActivitiesTab({ farmId }: { farmId: number }) {
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const { data: acts, isLoading, open, setOpen, editing, form, setForm, save, del, openAdd, openEdit } = useCrud(farmId, "diversification-activities", "div-activities");
  const TYPES = ["Farm Shop / Direct Sales", "Holiday Accommodation / Glamping", "Equine / Livery", "Renewable Energy", "Shooting & Game", "Leisure & Recreation", "Food Processing", "Dairy / Artisan Processing", "Events / Weddings", "Storage / Industrial Let", "Other"];
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="font-semibold text-sm">Diversification Activities</h3><Button size="sm" onClick={() => openAdd({ status: "active" })}><Plus className="w-4 h-4 mr-1" />Add Activity</Button></div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "activityName", label: "Activity" }, { key: "activityType", label: "Type" }, { key: "startDate", label: "Start Date", fmt: r => fmtDate(r.startDate) }, { key: "planningPermissionRef", label: "Planning Ref" }, { key: "status", label: "Status" }, { key: "annualTurnover", label: "Annual Turnover (£)" }]} rows={acts as Record<string, unknown>[]} onView={setViewRecord} onEdit={r => openEdit(r as Record<string, unknown>)} onDelete={r => del.mutate(r.id as number)} />}

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Activity</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Activity Name</p><p className="font-medium">{fmt(viewRecord.activityName)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Activity Type</p><p className="font-medium">{fmt(viewRecord.activityType)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p><p className="font-medium">{fmt(viewRecord.status)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Start Date</p><p className="font-medium">{fmtDate(viewRecord.startDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Annual Turnover (£)</p><p className="font-medium">{fmt(viewRecord.annualTurnover)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Planning Permission Ref</p><p className="font-medium">{fmt(viewRecord.planningPermissionRef)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Insurance Policy No.</p><p className="font-medium">{fmt(viewRecord.insurancePolicyNumber)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Insurance Renewal Date</p><p className="font-medium">{fmtDate(viewRecord.insuranceRenewalDate)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{fmt(viewRecord.notes)}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader><DialogTitle>Diversification Activity</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Label>Activity Name *</Label><Input value={String(form.activityName ?? "")} onChange={e => setForm(f => ({ ...f, activityName: e.target.value }))} /></div>
            <div><Label>Activity Type *</Label>
              <Select value={TYPES.filter(t => t !== "Other").includes(String(form.activityType ?? "")) ? String(form.activityType) : form.activityType ? "Other" : ""} onValueChange={v => setForm(f => ({ ...f, activityType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{TYPES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
              {(form.activityType === "Other" || (form.activityType && !TYPES.filter(t => t !== "Other").includes(String(form.activityType)))) ? (
                <Input className="mt-1.5" value={form.activityType === "Other" ? "" : String(form.activityType)} onChange={e => setForm(f => ({ ...f, activityType: e.target.value || "Other" }))} placeholder="Please specify activity type…" />
              ) : null}
            </div>
            <div><Label>Status</Label>
              <Select value={String(form.status ?? "active")} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["active", "planned", "suspended", "ceased"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Start Date *</Label><Input type="date" value={String(form.startDate ?? "")} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></div>
            <div><Label>Annual Turnover (£)</Label><Input type="number" step="0.01" value={String(form.annualTurnover ?? "")} onChange={e => setForm(f => ({ ...f, annualTurnover: e.target.value }))} /></div>
            <div><Label>Planning Permission Ref</Label><Input value={String(form.planningPermissionRef ?? "")} onChange={e => setForm(f => ({ ...f, planningPermissionRef: e.target.value }))} /></div>
            <div><Label>Insurance Policy No.</Label><Input value={String(form.insurancePolicyNumber ?? "")} onChange={e => setForm(f => ({ ...f, insurancePolicyNumber: e.target.value }))} /></div>
            <div><Label>Insurance Renewal Date</Label><Input type="date" value={String(form.insuranceRenewalDate ?? "")} onChange={e => setForm(f => ({ ...f, insuranceRenewalDate: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const SHOP_CATEGORIES = ["Meat & Poultry", "Dairy & Eggs", "Fruit & Vegetables", "Cereals & Bread", "Jams & Preserves", "Honey", "Alcohol", "Plants & Flowers", "Gifts & Crafts", "Other"];

type SaleItem = { productId?: number; productName: string; quantity: string; unitOfSale: string; pricePerUnit: string; lineTotal: number };
type Session = { id: number; saleDate: string; notes?: string; totalNet: string; items: Record<string, unknown>[] };

function FarmShopTab({ farmId }: { farmId: number }) {
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [shopTab, setShopTab] = useState<"products" | "sales" | "history" | "suppliers" | "purchases" | "stocktakes">("products");

  type ConfirmState = { open: boolean; title: string; message: string; onConfirm: () => void; confirmLabel?: string; variant?: "default" | "destructive" };
  const [confirmState, setConfirmState] = useState<ConfirmState>({ open: false, title: "", message: "", onConfirm: () => {} });
  const showConfirm = (title: string, message: string, onConfirm: () => void, opts?: { confirmLabel?: string; variant?: "default" | "destructive" }) =>
    setConfirmState({ open: true, title, message, onConfirm, ...opts });

  // ── Products state ──────────────────────────────────────────────────────────
  const { data: products = [], isLoading: prodLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: ["shop-products", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/farm-shop-products`), { credentials: "include" }).then(r => r.json()),
  });
  const [prodOpen, setProdOpen] = useState(false);
  const [prodEditing, setProdEditing] = useState<Record<string, unknown> | null>(null);
  const [prodForm, setProdForm] = useState<Record<string, unknown>>({});
  const saveProd = useMutation({
    mutationFn: (b: Record<string, unknown>) => fetch(prodEditing ? api(`farms/${farmId}/farm-shop-products/${prodEditing.id}`) : api(`farms/${farmId}/farm-shop-products`), { method: prodEditing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["shop-products", farmId] }); setProdOpen(false); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const delProd = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/farm-shop-products/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shop-products", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  // ── Stock adjustment state ──────────────────────────────────────────────────
  const [stockTarget, setStockTarget] = useState<Record<string, unknown> | null>(null);
  const [stockQty, setStockQty] = useState("");
  const adjustStock = useMutation({
    mutationFn: ({ id, adjustment }: { id: number; adjustment: number }) =>
      fetch(api(`farms/${farmId}/shop-products/${id}/adjust-stock`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ adjustment }) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["shop-products", farmId] }); setStockTarget(null); setStockQty(""); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  // ── Sales session state ─────────────────────────────────────────────────────
  const { data: sessions = [], isLoading: sessLoading } = useQuery<Session[]>({
    queryKey: ["shop-sales", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/shop-sales`), { credentials: "include" }).then(r => r.json()),
    enabled: shopTab === "history",
  });
  const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0, 10));
  const [saleNotes, setSaleNotes] = useState("");
  const [saleItems, setSaleItems] = useState<SaleItem[]>([{ productId: undefined, productName: "", quantity: "", unitOfSale: "", pricePerUnit: "", lineTotal: 0 }]);
  const [expandedSessions, setExpandedSessions] = useState<Set<number>>(new Set());

  const saleTotal = saleItems.reduce((s, i) => s + (i.lineTotal || 0), 0);

  function updateSaleItem(idx: number, patch: Partial<SaleItem>) {
    setSaleItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, ...patch };
      const qty = parseFloat(updated.quantity) || 0;
      const price = parseFloat(updated.pricePerUnit) || 0;
      updated.lineTotal = parseFloat((qty * price).toFixed(2));
      return updated;
    }));
  }

  function pickProduct(idx: number, productId: string) {
    const prod = (products as Record<string, unknown>[]).find(p => String(p.id) === productId);
    if (prod) {
      updateSaleItem(idx, {
        productId: prod.id as number,
        productName: String(prod.productName),
        unitOfSale: String(prod.unitOfSale ?? ""),
        pricePerUnit: String(prod.pricePerUnit ?? ""),
      });
    }
  }

  const saveSale = useMutation({
    mutationFn: () => fetch(api(`farms/${farmId}/shop-sales`), {
      method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
      body: JSON.stringify({ saleDate, notes: saleNotes || undefined, items: saleItems.filter(i => i.productName && parseFloat(i.quantity) > 0).map(i => ({ ...i, quantity: parseFloat(i.quantity), pricePerUnit: parseFloat(i.pricePerUnit), lineTotal: i.lineTotal })) }),
    }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shop-products", farmId] });
      qc.invalidateQueries({ queryKey: ["shop-sales", farmId] });
      setSaleItems([{ productId: undefined, productName: "", quantity: "", unitOfSale: "", pricePerUnit: "", lineTotal: 0 }]);
      setSaleNotes("");
      setShopTab("history");
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const delSession = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/shop-sales/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shop-sales", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  // ── Suppliers state ──────────────────────────────────────────────────────────
  const { data: suppliers = [], isLoading: suppLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: ["shop-suppliers", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/shop-suppliers`), { credentials: "include" }).then(r => r.json()),
  });
  const [suppOpen, setSuppOpen] = useState(false);
  const [suppEditing, setSuppEditing] = useState<Record<string, unknown> | null>(null);
  const [suppForm, setSuppForm] = useState<Record<string, unknown>>({});
  const saveSupp = useMutation({
    mutationFn: (b: Record<string, unknown>) => fetch(suppEditing ? api(`farms/${farmId}/shop-suppliers/${suppEditing.id}`) : api(`farms/${farmId}/shop-suppliers`), { method: suppEditing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["shop-suppliers", farmId] }); setSuppOpen(false); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const toggleSuppActive = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      fetch(api(`farms/${farmId}/shop-suppliers/${id}/${active ? "reactivate" : "deactivate"}`), { method: "PATCH", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shop-suppliers", farmId] }),
    onError: () => toast({ title: "Update failed", variant: "destructive" }),
  });

  // ── Purchases state ──────────────────────────────────────────────────────────
  const { data: purchases = [], isLoading: purchLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: ["shop-purchases", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/shop-purchases`), { credentials: "include" }).then(r => r.json()),
    enabled: shopTab === "purchases",
  });
  const [purchOpen, setPurchOpen] = useState(false);
  const [purchEditing, setPurchEditing] = useState<Record<string, unknown> | null>(null);
  const [purchForm, setPurchForm] = useState<Record<string, unknown>>({});
  const savePurch = useMutation({
    mutationFn: (b: Record<string, unknown>) => fetch(purchEditing ? api(`farms/${farmId}/shop-purchases/${purchEditing.id}`) : api(`farms/${farmId}/shop-purchases`), { method: purchEditing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["shop-purchases", farmId] }); qc.invalidateQueries({ queryKey: ["shop-products", farmId] }); setPurchOpen(false); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const delPurch = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/shop-purchases/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shop-purchases", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  // ── Stocktakes state ────────────────────────────────────────────────────────
  type StocktakeItem = { id: number; productName: string; unitOfSale?: string; expectedQty: string; countedQty: string | null; variance: string | null; varianceValue: string | null; costPrice: string | null; notes?: string };
  type StocktakeSession = { id: number; stocktakeDate: string; status: string; itemCount: number; countedCount: number; totalVarianceValue: string | null; notes?: string; completedAt?: string; items?: StocktakeItem[] };
  const { data: stocktakes = [], isLoading: stocktakesLoading } = useQuery<StocktakeSession[]>({
    queryKey: ["shop-stocktakes", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/farm-shop/stocktakes`), { credentials: "include" }).then(r => r.json()),
    enabled: shopTab === "stocktakes",
  });
  const [activeStocktakeId, setActiveStocktakeId] = useState<number | null>(null);
  const { data: activeStocktake, refetch: refetchStocktake } = useQuery<StocktakeSession>({
    queryKey: ["shop-stocktake-detail", farmId, activeStocktakeId],
    queryFn: () => fetch(api(`farms/${farmId}/farm-shop/stocktakes/${activeStocktakeId}`), { credentials: "include" }).then(r => r.json()),
    enabled: activeStocktakeId !== null,
  });
  const [stocktakeNewOpen, setStocktakeNewOpen] = useState(false);
  const [stocktakeForm, setStocktakeForm] = useState({ stocktakeDate: new Date().toISOString().slice(0, 10), notes: "" });
  const [localCounts, setLocalCounts] = useState<Record<number, string>>({});

  const createStocktakeMut = useMutation({
    mutationFn: (body: { stocktakeDate: string; notes?: string }) =>
      fetch(api(`farms/${farmId}/farm-shop/stocktakes`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: (data: StocktakeSession) => {
      qc.invalidateQueries({ queryKey: ["shop-stocktakes", farmId] });
      setStocktakeNewOpen(false);
      setLocalCounts({});
      setActiveStocktakeId(data.id);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const updateStocktakeItemMut = useMutation({
    mutationFn: ({ sessionId, itemId, countedQty }: { sessionId: number; itemId: number; countedQty: string | null }) =>
      fetch(api(`farms/${farmId}/farm-shop/stocktakes/${sessionId}/items/${itemId}`), { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ countedQty }) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["shop-stocktake-detail", farmId, activeStocktakeId] }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const completeStocktakeMut = useMutation({
    mutationFn: (sessionId: number) =>
      fetch(api(`farms/${farmId}/farm-shop/stocktakes/${sessionId}/complete`), { method: "POST", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shop-stocktakes", farmId] });
      qc.invalidateQueries({ queryKey: ["shop-stocktake-detail", farmId, activeStocktakeId] });
      qc.invalidateQueries({ queryKey: ["shop-products", farmId] });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const deleteStocktakeMut = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/farm-shop/stocktakes/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["shop-stocktakes", farmId] }); setActiveStocktakeId(null); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const activeProducts = (products as Record<string, unknown>[]).filter(p => p.active !== false);

  const fmtGbp = (v: unknown) => v ? `£${parseFloat(String(v)).toFixed(2)}` : "—";

  return (
    <div className="space-y-4">
      {/* Inner sub-tab bar */}
      <div className="flex gap-1 border-b pb-0 flex-wrap">
        {(["products", "sales", "history", "suppliers", "purchases", "stocktakes"] as const).map(t => (
          <button key={t} onClick={() => { setShopTab(t); if (t !== "stocktakes") setActiveStocktakeId(null); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors ${shopTab === t ? "bg-background border border-b-background -mb-px text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {t === "products" ? "Products & Stock" : t === "sales" ? "Record Sales" : t === "history" ? "Sales History" : t === "suppliers" ? "Suppliers" : t === "purchases" ? "Purchases" : "Stocktakes"}
          </button>
        ))}
      </div>

      {/* ── Products & Stock ─────────────────────────────────────────────────── */}
      {shopTab === "products" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-sm">Product Catalogue</h3>
            <Button size="sm" onClick={() => { setProdEditing(null); setProdForm({ active: true }); setProdOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Product</Button>
          </div>

          {viewRecord && (
            <Dialog open onOpenChange={() => setViewRecord(null)}>
              <DialogContent style={{ maxWidth: "42rem" }}>
                <DialogHeader><DialogTitle>View Product</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Product Name</p><p className="font-medium">{fmt(viewRecord.productName)}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Category</p><p className="font-medium">{fmt(viewRecord.category)}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Unit of Sale</p><p className="font-medium">{fmt(viewRecord.unitOfSale)}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Cost Price</p><p className="font-medium">{fmtGbp(viewRecord.costPrice)}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Retail Price</p><p className="font-medium">{fmtGbp(viewRecord.pricePerUnit)}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Reorder Level</p><p className="font-medium">{fmt(viewRecord.reorderLevel)}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Current Stock</p><p className="font-medium">{fmt(viewRecord.currentStock)}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Is Active</p><p className="font-medium">{viewRecord.active !== false ? "Yes" : "No"}</p></div>
                  <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{fmt(viewRecord.notes)}</p></div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setProdEditing(viewRecord); setProdForm(Object.fromEntries(Object.entries(viewRecord).map(([k, v]) => [k, v ?? ""]))); setProdOpen(true); setViewRecord(null); }}>Edit</Button>
                  <Button onClick={() => setViewRecord(null)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {prodLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b">
                  {["Product", "Category", "Unit", "Cost", "Price", "Margin", "In Stock", "Reorder At", "Status", ""].map(h => <th key={h} className="text-left py-2 pr-3 font-medium text-muted-foreground whitespace-nowrap">{h}</th>)}
                </tr></thead>
                <tbody>
                  {(products as Record<string, unknown>[]).map((p, i) => {
                    const stock = parseFloat(String(p.currentStock ?? "0")) || 0;
                    const reorder = parseFloat(String(p.reorderLevel ?? "0")) || 0;
                    const low = stock > 0 && reorder > 0 && stock <= reorder;
                    const zero = stock === 0 && p.active;
                    const costP = parseFloat(String(p.costPrice ?? "")) || 0;
                    const sellP = parseFloat(String(p.pricePerUnit ?? "")) || 0;
                    const margin = costP > 0 && sellP > 0 ? ((sellP - costP) / sellP * 100) : null;
                    return (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-2 pr-3 font-medium">{String(p.productName)}</td>
                        <td className="py-2 pr-3 text-muted-foreground">{String(p.category)}</td>
                        <td className="py-2 pr-3 text-muted-foreground">{fmt(p.unitOfSale)}</td>
                        <td className="py-2 pr-3 text-muted-foreground">{costP > 0 ? fmtGbp(p.costPrice) : <span className="italic text-xs">—</span>}</td>
                        <td className="py-2 pr-3">{fmtGbp(p.pricePerUnit)}</td>
                        <td className="py-2 pr-3">
                          {margin !== null ? (
                            <span className={`text-xs font-medium ${margin >= 40 ? "text-emerald-700" : margin >= 20 ? "text-amber-600" : "text-red-600"}`}>{margin.toFixed(0)}%</span>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </td>
                        <td className="py-2 pr-3">
                          <span className={`font-semibold ${zero ? "text-red-600" : low ? "text-amber-600" : "text-emerald-700"}`}>
                            {stock % 1 === 0 ? stock.toFixed(0) : stock.toFixed(1)}
                          </span>
                          {!!zero && <AlertTriangle className="inline w-3 h-3 ml-1 text-red-500" />}
                          {!!low && !zero && <AlertTriangle className="inline w-3 h-3 ml-1 text-amber-500" />}
                        </td>
                        <td className="py-2 pr-3 text-muted-foreground">{reorder > 0 ? (reorder % 1 === 0 ? reorder.toFixed(0) : reorder.toFixed(1)) : "—"}</td>
                        <td className="py-2 pr-3">
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${p.active ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{p.active ? "Active" : "Inactive"}</span>
                        </td>
                        <td className="py-2 text-right space-x-1 whitespace-nowrap">
                          <Button size="icon" variant="ghost" onClick={() => setViewRecord(p)}><Eye className="w-3.5 h-3.5" /></Button>
                          <Button size="icon" variant="ghost" title="Stock In" onClick={() => { setStockTarget(p); setStockQty(""); }}><PackagePlus className="w-3.5 h-3.5 text-emerald-600" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => { setProdEditing(p); setProdForm(Object.fromEntries(Object.entries(p).map(([k, v]) => [k, v ?? ""]))); setProdOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => showConfirm("Delete Product", "Remove this product from the catalogue? Stock history and purchase records will be retained.", () => delProd.mutate(p.id as number), { confirmLabel: "Delete", variant: "destructive" })}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                        </td>
                      </tr>
                    );
                  })}
                  {products.length === 0 && <tr><td colSpan={8} className="py-6 text-center text-sm text-muted-foreground italic">No products yet.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {/* Low stock summary */}
          {(products as Record<string, unknown>[]).some(p => {
            const s = parseFloat(String(p.currentStock ?? "0")) || 0;
            const r = parseFloat(String(p.reorderLevel ?? "0")) || 0;
            return s === 0 || (r > 0 && s <= r);
          }) && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
              <p className="font-medium text-amber-800 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" />Stock alerts</p>
              <ul className="mt-1 space-y-0.5">
                {(products as Record<string, unknown>[]).filter(p => {
                  const s = parseFloat(String(p.currentStock ?? "0")) || 0;
                  const r = parseFloat(String(p.reorderLevel ?? "0")) || 0;
                  return s === 0 || (r > 0 && s <= r);
                }).map((p, i) => {
                  const s = parseFloat(String(p.currentStock ?? "0")) || 0;
                  return <li key={i} className={`text-xs ${s === 0 ? "text-red-700 font-medium" : "text-amber-700"}`}>{String(p.productName)}: {s === 0 ? "Out of stock" : `Low stock (${s} remaining, reorder at ${p.reorderLevel})`}</li>;
                })}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ── Record Sales ──────────────────────────────────────────────────────── */}
      {shopTab === "sales" && (
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Record Today's Sales</h3>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <div><Label>Sale Date *</Label><Input type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)} /></div>
            <div><Label>Notes (optional)</Label><Input value={saleNotes} onChange={e => setSaleNotes(e.target.value)} placeholder="e.g. Saturday market" /></div>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-1">
              <span className="col-span-4">Product</span>
              <span className="col-span-2">Qty</span>
              <span className="col-span-2">Unit</span>
              <span className="col-span-2">Price (£)</span>
              <span className="col-span-1 text-right">Total</span>
              <span className="col-span-1" />
            </div>
            {saleItems.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-4">
                  <Select value={item.productId ? String(item.productId) : "__none__"} onValueChange={v => v !== "__none__" ? pickProduct(idx, v) : updateSaleItem(idx, { productId: undefined, productName: "", unitOfSale: "", pricePerUnit: "" })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Pick product…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— Select product —</SelectItem>
                      {activeProducts.map(p => <SelectItem key={String(p.id)} value={String(p.id)}>{String(p.productName)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2"><Input className="h-8 text-xs" type="number" min="0" step="0.5" placeholder="0" value={item.quantity} onChange={e => updateSaleItem(idx, { quantity: e.target.value })} /></div>
                <div className="col-span-2"><Input className="h-8 text-xs" placeholder="unit" value={item.unitOfSale} onChange={e => updateSaleItem(idx, { unitOfSale: e.target.value })} /></div>
                <div className="col-span-2"><Input className="h-8 text-xs" type="number" min="0" step="0.01" placeholder="0.00" value={item.pricePerUnit} onChange={e => updateSaleItem(idx, { pricePerUnit: e.target.value })} /></div>
                <div className="col-span-1 text-right text-xs font-semibold">{item.lineTotal > 0 ? `£${item.lineTotal.toFixed(2)}` : "—"}</div>
                <div className="col-span-1 text-right">
                  {saleItems.length > 1 && <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setSaleItems(prev => prev.filter((_, i) => i !== idx))}><Trash2 className="w-3 h-3 text-red-400" /></Button>}
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setSaleItems(prev => [...prev, { productId: undefined, productName: "", quantity: "", unitOfSale: "", pricePerUnit: "", lineTotal: 0 }])}>
              <Plus className="w-3.5 h-3.5 mr-1" />Add Line
            </Button>
          </div>

          <div className="flex items-center justify-between border-t pt-3">
            <div className="text-sm font-semibold">Session Total: <span className="text-lg text-emerald-700">£{saleTotal.toFixed(2)}</span></div>
            <Button
              onClick={() => saveSale.mutate()}
              disabled={saveSale.isPending || saleItems.filter(i => i.productName && parseFloat(i.quantity) > 0).length === 0 || !saleDate}
            >
              {saveSale.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Package className="w-4 h-4 mr-1" />}
              Save Sales Record
            </Button>
          </div>
        </div>
      )}

      {/* ── Sales History ──────────────────────────────────────────────────────── */}
      {shopTab === "history" && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Sales History</h3>
          {sessLoading ? <Loader2 className="animate-spin w-5 h-5" /> : sessions.length === 0 ? (
            <Empty msg="No sales recorded yet. Use 'Record Sales' to log your first session." />
          ) : sessions.map(sess => {
            const expanded = expandedSessions.has(sess.id);
            return (
              <div key={sess.id} className="rounded-lg border overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-muted/30 cursor-pointer" onClick={() => setExpandedSessions(prev => { const s = new Set(prev); s.has(sess.id) ? s.delete(sess.id) : s.add(sess.id); return s; })}>
                  <div className="flex items-center gap-3">
                    {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    <span className="font-medium text-sm">{fmtDate(sess.saleDate)}</span>
                    <span className="text-xs text-muted-foreground">{sess.items.length} item{sess.items.length !== 1 ? "s" : ""}</span>
                    {sess.notes && <span className="text-xs text-muted-foreground italic">— {sess.notes}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-emerald-700">£{parseFloat(sess.totalNet).toFixed(2)}</span>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={e => { e.stopPropagation(); showConfirm("Delete Sales Session", "This session and all its line items will be removed. Stock levels will be restored to pre-sale quantities.", () => delSession.mutate(sess.id), { confirmLabel: "Delete", variant: "destructive" }); }}><Trash2 className="w-3.5 h-3.5 text-red-400" /></Button>
                  </div>
                </div>
                {expanded && (
                  <div className="px-4 pb-3 pt-2">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b"><th className="text-left py-1.5 font-medium text-muted-foreground">Product</th><th className="text-left py-1.5 font-medium text-muted-foreground">Qty</th><th className="text-left py-1.5 font-medium text-muted-foreground">Unit</th><th className="text-left py-1.5 font-medium text-muted-foreground">Price</th><th className="text-right py-1.5 font-medium text-muted-foreground">Line Total</th></tr></thead>
                      <tbody>
                        {(sess.items as Record<string, unknown>[]).map((item, j) => (
                          <tr key={j} className="border-b last:border-0">
                            <td className="py-1.5 font-medium">{String(item.productName)}</td>
                            <td className="py-1.5">{String(item.quantity)}</td>
                            <td className="py-1.5 text-muted-foreground">{fmt(item.unitOfSale)}</td>
                            <td className="py-1.5">{fmtGbp(item.pricePerUnit)}</td>
                            <td className="py-1.5 text-right font-semibold">{fmtGbp(item.lineTotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Suppliers ────────────────────────────────────────────────────────── */}
      {shopTab === "suppliers" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Suppliers</h3>
            <Button size="sm" onClick={() => { setSuppEditing(null); setSuppForm({ name: "", contactName: "", phone: "", email: "", notes: "" }); setSuppOpen(true); }}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Supplier
            </Button>
          </div>

          {viewRecord && (
            <Dialog open onOpenChange={() => setViewRecord(null)}>
              <DialogContent style={{ maxWidth: "42rem" }}>
                <DialogHeader><DialogTitle>View Supplier</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Supplier Name</p><p className="font-medium">{fmt(viewRecord.supplierName)}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Contact Name</p><p className="font-medium">{fmt(viewRecord.contactName)}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Phone</p><p className="font-medium">{fmt(viewRecord.phone)}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p><p className="font-medium">{fmt(viewRecord.email)}</p></div>
                  <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{fmt(viewRecord.notes)}</p></div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setSuppEditing(viewRecord); setSuppForm({ name: String(viewRecord.supplierName ?? ""), contactName: String(viewRecord.contactName ?? ""), phone: String(viewRecord.phone ?? ""), email: String(viewRecord.email ?? ""), notes: String(viewRecord.notes ?? "") }); setSuppOpen(true); setViewRecord(null); }}>Edit</Button>
                  <Button onClick={() => setViewRecord(null)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {suppLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (suppliers as Record<string, unknown>[]).length === 0 ? (
            <Empty msg="No suppliers yet. Add one to start recording purchases." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b">
                  {["Supplier", "Contact", "Phone", "Email", "Notes", ""].map(h => <th key={h} className="text-left py-2 pr-3 font-medium text-muted-foreground">{h}</th>)}
                </tr></thead>
                <tbody>
                  {(suppliers as Record<string, unknown>[]).map((s, i) => {
                    const isActive = s.active !== false;
                    return (
                      <tr key={i} className={`border-b last:border-0 ${isActive ? "" : "opacity-50"}`}>
                        <td className="py-2 pr-3">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${isActive ? "" : "line-through text-muted-foreground"}`}>{String(s.supplierName)}</span>
                            {!isActive && <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-medium uppercase tracking-wide">Inactive</span>}
                          </div>
                        </td>
                        <td className="py-2 pr-3 text-muted-foreground">{fmt(s.contactName)}</td>
                        <td className="py-2 pr-3 text-muted-foreground">{fmt(s.phone)}</td>
                        <td className="py-2 pr-3 text-muted-foreground">{s.email ? <a href={`mailto:${s.email}`} className="underline underline-offset-2">{String(s.email)}</a> : "—"}</td>
                        <td className="py-2 pr-3 text-muted-foreground max-w-[200px] truncate">{fmt(s.notes)}</td>
                        <td className="py-2">
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setViewRecord(s)}><Eye className="w-3.5 h-3.5" /></Button>
                            {isActive && <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSuppEditing(s); setSuppForm({ name: String(s.supplierName ?? ""), contactName: s.contactName ?? "", phone: s.phone ?? "", email: s.email ?? "", notes: s.notes ?? "" }); setSuppOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>}
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => toggleSuppActive.mutate({ id: s.id as number, active: !isActive })}>
                              {isActive ? "Deactivate" : "Reactivate"}
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
        </div>
      )}

      {/* ── Purchases ────────────────────────────────────────────────────────── */}
      {shopTab === "purchases" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Purchase Ledger</h3>
            <Button size="sm" onClick={() => { setPurchEditing(null); setPurchForm({ purchaseDate: new Date().toISOString().slice(0, 10), supplierId: "__none__", productId: "__none__", quantityPurchased: "", costPerUnit: "", totalCost: "", invoiceRef: "", notes: "", updateCostPrice: false }); setPurchOpen(true); }}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Record Purchase
            </Button>
          </div>

          {viewRecord && (
            <Dialog open onOpenChange={() => setViewRecord(null)}>
              <DialogContent style={{ maxWidth: "42rem" }}>
                <DialogHeader><DialogTitle>View Purchase</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Purchase Date</p><p className="font-medium">{fmtDate(String(viewRecord.purchaseDate))}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Supplier</p><p className="font-medium">{fmt(viewRecord.supplierName)}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Product</p><p className="font-medium">{fmt(viewRecord.productName)}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Quantity</p><p className="font-medium">{fmt(viewRecord.quantity)}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Cost Per Unit</p><p className="font-medium">{fmtGbp(viewRecord.costPerUnit)}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Total Cost</p><p className="font-medium">{fmtGbp(viewRecord.totalCost)}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Invoice Reference</p><p className="font-medium">{fmt(viewRecord.invoiceRef)}</p></div>
                  <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{fmt(viewRecord.notes)}</p></div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setPurchEditing(viewRecord); setPurchForm({ purchaseDate: String(viewRecord.purchaseDate ?? "").slice(0, 10), supplierId: viewRecord.supplierId ? String(viewRecord.supplierId) : "__none__", productId: viewRecord.productId ? String(viewRecord.productId) : "__none__", quantityPurchased: String(viewRecord.quantity ?? ""), costPerUnit: String(viewRecord.costPerUnit ?? ""), totalCost: String(viewRecord.totalCost ?? ""), invoiceRef: String(viewRecord.invoiceRef ?? ""), notes: String(viewRecord.notes ?? ""), updateCostPrice: false }); setPurchOpen(true); setViewRecord(null); }}>Edit</Button>
                  <Button onClick={() => setViewRecord(null)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {purchLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (purchases as Record<string, unknown>[]).length === 0 ? (
            <Empty msg="No purchases recorded. Hit 'Record Purchase' to log your first order." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b">
                  {["Date", "Supplier", "Product", "Qty", "Cost/Unit", "Total", "Invoice Ref", ""].map(h => <th key={h} className="text-left py-2 pr-3 font-medium text-muted-foreground whitespace-nowrap">{h}</th>)}
                </tr></thead>
                <tbody>
                  {(purchases as Record<string, unknown>[]).map((p, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 pr-3 whitespace-nowrap">{fmtDate(String(p.purchaseDate))}</td>
                      <td className="py-2 pr-3">{p.supplierName ? fmt(p.supplierName) : <span className="italic text-xs text-muted-foreground">—</span>}</td>
                      <td className="py-2 pr-3 font-medium">{fmt(p.productName)}</td>
                      <td className="py-2 pr-3">{fmt(p.quantity)}</td>
                      <td className="py-2 pr-3">{fmtGbp(p.costPerUnit)}</td>
                      <td className="py-2 pr-3 font-semibold">{fmtGbp(p.totalCost)}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{fmt(p.invoiceRef)}</td>
                      <td className="py-2">
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setViewRecord(p)}><Eye className="w-3.5 h-3.5" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setPurchEditing(p); setPurchForm({ purchaseDate: String(p.purchaseDate ?? "").slice(0, 10), supplierId: p.supplierId ? String(p.supplierId) : "__none__", productId: p.productId ? String(p.productId) : "__none__", quantityPurchased: String(p.quantity ?? ""), costPerUnit: String(p.costPerUnit ?? ""), totalCost: String(p.totalCost ?? ""), invoiceRef: String(p.invoiceRef ?? ""), notes: String(p.notes ?? ""), updateCostPrice: false }); setPurchOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => showConfirm("Delete Purchase", "Remove this purchase record? Note: any stock that was added when this was logged will not be automatically reversed.", () => delPurch.mutate(p.id as number), { confirmLabel: "Delete", variant: "destructive" })}><Trash2 className="w-3.5 h-3.5 text-red-400" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Stocktakes ────────────────────────────────────────────────────────── */}
      {shopTab === "stocktakes" && (
        <div className="space-y-4">
          {activeStocktakeId === null ? (
            /* ── List view ─────────────────────────────────────────────── */
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm">Stocktake Records</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Count physical stock and compare against system quantities to detect theft, mis-sales, or data errors.</p>
                </div>
                <Button size="sm" onClick={() => { setStocktakeForm({ stocktakeDate: new Date().toISOString().slice(0, 10), notes: "" }); setStocktakeNewOpen(true); }}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> New Stocktake
                </Button>
              </div>

              {viewRecord && (
                <Dialog open onOpenChange={() => setViewRecord(null)}>
                  <DialogContent style={{ maxWidth: "42rem" }}>
                    <DialogHeader><DialogTitle>View Stocktake</DialogTitle></DialogHeader>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Stocktake Date</p><p className="font-medium">{fmtDate(String(viewRecord.stocktakeDate))}</p></div>
                      <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p><p className="font-medium">{fmt(viewRecord.status)}</p></div>
                      <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{fmt(viewRecord.notes)}</p></div>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => setViewRecord(null)}>Close</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {stocktakesLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (stocktakes as StocktakeSession[]).length === 0 ? (
                <Empty msg="No stocktakes recorded yet. Start your first count with 'New Stocktake'." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b">
                      {["Date", "Status", "Progress", "Variance £", "Notes", ""].map(h => (
                        <th key={h} className="text-left py-2 pr-3 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {(stocktakes as StocktakeSession[]).map(s => {
                        const varVal = s.totalVarianceValue ? parseFloat(s.totalVarianceValue) : null;
                        const isDraft = s.status === "draft";
                        return (
                          <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer" onClick={() => { setLocalCounts({}); setActiveStocktakeId(s.id); }}>
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
                            <td className="py-2 pr-3 text-muted-foreground text-xs">{s.notes || "—"}</td>
                            <td className="py-2" onClick={e => e.stopPropagation()}>
                              <div className="flex gap-1">
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setViewRecord(s)}><Eye className="w-3.5 h-3.5" /></Button>
                                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setLocalCounts({}); setActiveStocktakeId(s.id); }}>
                                  {isDraft ? "Continue" : "View"}
                                </Button>
                                {isDraft && (
                                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => showConfirm("Delete Stocktake", "Delete this draft stocktake? All counts entered so far will be lost.", () => deleteStocktakeMut.mutate(s.id), { confirmLabel: "Delete", variant: "destructive" })}>
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
            /* ── Detail view ────────────────────────────────────────────── */
            <>
              <div className="flex items-center gap-3 flex-wrap">
                <Button size="sm" variant="outline" onClick={() => { setActiveStocktakeId(null); qc.invalidateQueries({ queryKey: ["shop-stocktakes", farmId] }); }}>
                  ← Back
                </Button>
                {activeStocktake && (
                  <>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm">Stocktake — {fmtDate(activeStocktake.stocktakeDate)}</h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${activeStocktake.status === "draft" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
                          {activeStocktake.status === "draft" ? "In Progress" : "Completed"}
                        </span>
                        <span className="text-xs text-muted-foreground">{activeStocktake.countedCount ?? 0} / {activeStocktake.itemCount ?? 0} products counted</span>
                      </div>
                      {activeStocktake.notes && <p className="text-xs text-muted-foreground mt-0.5">{activeStocktake.notes}</p>}
                    </div>
                    {activeStocktake.status === "draft" && (
                      <Button size="sm"
                        disabled={(activeStocktake.countedCount ?? 0) < (activeStocktake.itemCount ?? 0) || completeStocktakeMut.isPending}
                        onClick={() => showConfirm("Complete Stocktake", "Stock levels will be updated to match your physical counts. This cannot be undone.", () => completeStocktakeMut.mutate(activeStocktake.id), { confirmLabel: "Complete Stocktake" })}>
                        {completeStocktakeMut.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                        Complete Stocktake
                      </Button>
                    )}
                  </>
                )}
              </div>

              {!activeStocktake ? <Loader2 className="animate-spin w-5 h-5" /> : (activeStocktake.items ?? []).length === 0 ? (
                <Empty msg="No products found. Add products to the catalogue first, then start a new stocktake." />
              ) : (
                <>
                  {/* Summary bar */}
                  {(() => {
                    const items = activeStocktake.items ?? [];
                    const totalVar = items.reduce((s, i) => s + (i.varianceValue ? parseFloat(i.varianceValue) : 0), 0);
                    const negCount = items.filter(i => i.variance !== null && parseFloat(i.variance) < 0).length;
                    const uncounted = items.filter(i => i.countedQty === null).length;
                    return (
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: "Uncounted", value: String(uncounted), sub: "products remaining", color: uncounted > 0 ? "text-amber-600" : "text-green-600" },
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
                        {["Product", "Unit", "System Qty", "Counted", "Variance", "Variance £"].map(h => (
                          <th key={h} className="text-left py-2 pr-3 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {(activeStocktake.items ?? []).map(item => {
                          const varNum = item.variance !== null ? parseFloat(item.variance) : null;
                          const varVal = item.varianceValue !== null ? parseFloat(item.varianceValue!) : null;
                          const varColor = varNum === null ? "" : varNum < 0 ? "text-red-600 font-semibold" : varNum === 0 ? "text-green-600" : "text-amber-600 font-semibold";
                          const rowBg = varNum === null ? "" : varNum < 0 ? "bg-red-50/40" : varNum > 0 ? "bg-amber-50/30" : "";
                          const isCounted = item.countedQty !== null;
                          const localVal = localCounts[item.id] !== undefined ? localCounts[item.id] : (item.countedQty ?? "");
                          const isCompleted = activeStocktake.status === "completed";
                          return (
                            <tr key={item.id} className={`border-b last:border-0 ${rowBg}`}>
                              <td className="py-2 pr-3 font-medium">{item.productName}</td>
                              <td className="py-2 pr-3 text-muted-foreground text-xs">{item.unitOfSale || "—"}</td>
                              <td className="py-2 pr-3">{parseFloat(item.expectedQty).toFixed(2)}</td>
                              <td className="py-2 pr-3">
                                {isCompleted ? (
                                  <span className={isCounted ? "" : "text-muted-foreground italic"}>{item.countedQty ?? "—"}</span>
                                ) : (
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="h-7 w-24 text-sm"
                                    placeholder="0"
                                    value={localVal}
                                    onChange={e => setLocalCounts(prev => ({ ...prev, [item.id]: e.target.value }))}
                                    onBlur={() => {
                                      const raw = localCounts[item.id];
                                      if (raw === undefined) return;
                                      const val = raw.trim() === "" ? null : raw;
                                      updateStocktakeItemMut.mutate({ sessionId: activeStocktake.id, itemId: item.id, countedQty: val });
                                    }}
                                  />
                                )}
                              </td>
                              <td className={`py-2 pr-3 ${varColor}`}>
                                {varNum === null ? <span className="text-muted-foreground text-xs">—</span> : `${varNum >= 0 ? "+" : ""}${varNum.toFixed(2)}`}
                              </td>
                              <td className={`py-2 ${varColor}`}>
                                {varVal === null ? <span className="text-muted-foreground text-xs">—</span> : `${varVal >= 0 ? "+" : ""}£${Math.abs(varVal).toFixed(2)}`}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {(activeStocktake.items ?? []).some(i => i.costPrice === null) && (
                    <p className="text-xs text-muted-foreground border-t pt-2">
                      * Variance £ shows <span className="font-medium">—</span> for products without a cost price set. Add cost prices in the Products &amp; Stock tab to see cost-value variance.
                    </p>
                  )}
                  {activeStocktake.status === "draft" && (activeStocktake.countedCount ?? 0) < (activeStocktake.itemCount ?? 0) && (
                    <p className="text-xs text-muted-foreground text-center border-t pt-3">
                      Count all {(activeStocktake.itemCount ?? 0) - (activeStocktake.countedCount ?? 0)} remaining products before you can complete the stocktake.
                    </p>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ── New Stocktake dialog ──────────────────────────────────────────────── */}
      <Dialog open={stocktakeNewOpen} onOpenChange={o => { if (!o) { setStocktakeNewOpen(false); createStocktakeMut.reset(); } }}>
        <DialogContent style={{ maxWidth: "22rem" }}>
          <DialogHeader><DialogTitle>New Stocktake</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground -mt-1">Snaps the current system stock for all active products. You'll then count and enter the physical quantities.</p>
          <div className="space-y-3">
            <div><Label>Stocktake Date *</Label><Input type="date" value={stocktakeForm.stocktakeDate} onChange={e => setStocktakeForm(f => ({ ...f, stocktakeDate: e.target.value }))} /></div>
            <div><Label>Notes</Label><Input value={stocktakeForm.notes} placeholder="e.g. Monthly count, post-market" onChange={e => setStocktakeForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogMutationError mutation={createStocktakeMut} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setStocktakeNewOpen(false)}>Cancel</Button>
            <Button disabled={!stocktakeForm.stocktakeDate || createStocktakeMut.isPending} onClick={() => createStocktakeMut.mutate({ stocktakeDate: stocktakeForm.stocktakeDate, notes: stocktakeForm.notes || undefined })}>
              {createStocktakeMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Start Stocktake"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Supplier dialog ───────────────────────────────────────────────────── */}
      <Dialog open={suppOpen} onOpenChange={o => { if (!o) { setSuppOpen(false); saveSupp.reset(); } }}>
        <DialogContent style={{ maxWidth: "26rem" }}>
          <DialogHeader><DialogTitle>{suppEditing ? "Edit Supplier" : "Add Supplier"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Supplier Name *</Label><Input value={String(suppForm.name ?? "")} onChange={e => setSuppForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Green Valley Feeds" /></div>
            <div><Label>Contact Name</Label><Input value={String(suppForm.contactName ?? "")} onChange={e => setSuppForm(f => ({ ...f, contactName: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Phone</Label><Input value={String(suppForm.phone ?? "")} onChange={e => setSuppForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div><Label>Email</Label><Input type="email" value={String(suppForm.email ?? "")} onChange={e => setSuppForm(f => ({ ...f, email: e.target.value }))} /></div>
            </div>
            <div><Label>Notes</Label><Input value={String(suppForm.notes ?? "")} onChange={e => setSuppForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogMutationError mutation={saveSupp} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuppOpen(false)}>Cancel</Button>
            <Button disabled={saveSupp.isPending || !String(suppForm.name ?? "").trim()} onClick={() => saveSupp.mutate({ name: suppForm.name, contactName: suppForm.contactName || undefined, phone: suppForm.phone || undefined, email: suppForm.email || undefined, notes: suppForm.notes || undefined })}>
              {saveSupp.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Purchase dialog ───────────────────────────────────────────────────── */}
      <Dialog open={purchOpen} onOpenChange={o => { if (!o) { setPurchOpen(false); savePurch.reset(); } }}>
        <DialogContent style={{ maxWidth: "28rem" }}>
          <DialogHeader><DialogTitle>{purchEditing ? "Edit Purchase" : "Record Purchase"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Date *</Label><Input type="date" value={String(purchForm.purchaseDate ?? "")} onChange={e => setPurchForm(f => ({ ...f, purchaseDate: e.target.value }))} /></div>
            <div>
              <Label>Supplier</Label>
              <Select value={String(purchForm.supplierId ?? "__none__")} onValueChange={v => setPurchForm(f => ({ ...f, supplierId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select supplier…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No supplier</SelectItem>
                  {(suppliers as Record<string, unknown>[]).filter(s => s.active !== false).map(s => <SelectItem key={String(s.id)} value={String(s.id)}>{String(s.supplierName)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Product (optional)</Label>
              <Select value={String(purchForm.productId ?? "__none__")} onValueChange={v => {
                const prod = (products as Record<string, unknown>[]).find(p => String(p.id) === v);
                setPurchForm(f => ({
                  ...f,
                  productId: v,
                  costPerUnit: prod && prod.costPrice ? String(prod.costPrice) : f.costPerUnit,
                }));
              }}>
                <SelectTrigger><SelectValue placeholder="Link to product…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No product</SelectItem>
                  {(products as Record<string, unknown>[]).map(p => <SelectItem key={String(p.id)} value={String(p.id)}>{String(p.productName)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Qty</Label><Input type="number" step="0.01" min="0" value={String(purchForm.quantityPurchased ?? "")} onChange={e => { const q = parseFloat(e.target.value) || 0; const cpu = parseFloat(String(purchForm.costPerUnit ?? "")) || 0; setPurchForm(f => ({ ...f, quantityPurchased: e.target.value, totalCost: q && cpu ? String((q * cpu).toFixed(2)) : f.totalCost })); }} /></div>
              <div><Label>Cost/Unit (£)</Label><Input type="number" step="0.01" min="0" value={String(purchForm.costPerUnit ?? "")} onChange={e => { const cpu = parseFloat(e.target.value) || 0; const q = parseFloat(String(purchForm.quantityPurchased ?? "")) || 0; setPurchForm(f => ({ ...f, costPerUnit: e.target.value, totalCost: q && cpu ? String((q * cpu).toFixed(2)) : f.totalCost })); }} /></div>
              <div><Label>Total Cost (£)</Label><Input type="number" step="0.01" min="0" value={String(purchForm.totalCost ?? "")} onChange={e => setPurchForm(f => ({ ...f, totalCost: e.target.value }))} /></div>
            </div>
            <div><Label>Invoice Ref</Label><Input value={String(purchForm.invoiceRef ?? "")} onChange={e => setPurchForm(f => ({ ...f, invoiceRef: e.target.value }))} placeholder="e.g. INV-2024-001" /></div>
            <div><Label>Notes</Label><Input value={String(purchForm.notes ?? "")} onChange={e => setPurchForm(f => ({ ...f, notes: e.target.value }))} /></div>
            <div className="flex items-center gap-2 pt-1">
              <input type="checkbox" id="updateCostPrice" checked={!!purchForm.updateCostPrice} onChange={e => setPurchForm(f => ({ ...f, updateCostPrice: e.target.checked }))} className="w-4 h-4 rounded" />
              <label htmlFor="updateCostPrice" className="text-sm">Update product's cost price to this cost/unit</label>
            </div>
          </div>
          <DialogMutationError mutation={savePurch} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setPurchOpen(false)}>Cancel</Button>
            <Button disabled={savePurch.isPending || !String(purchForm.purchaseDate ?? "").trim()} onClick={() => savePurch.mutate({
              purchaseDate: purchForm.purchaseDate,
              supplierId: purchForm.supplierId && purchForm.supplierId !== "__none__" ? parseInt(String(purchForm.supplierId)) : undefined,
              productId: purchForm.productId && purchForm.productId !== "__none__" ? parseInt(String(purchForm.productId)) : undefined,
              quantityPurchased: purchForm.quantityPurchased || undefined,
              costPerUnit: purchForm.costPerUnit || undefined,
              totalCost: purchForm.totalCost || undefined,
              invoiceRef: purchForm.invoiceRef || undefined,
              notes: purchForm.notes || undefined,
              updateCostPrice: !!purchForm.updateCostPrice,
            })}>
              {savePurch.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Stock In dialog ───────────────────────────────────────────────────── */}
      <Dialog open={!!stockTarget} onOpenChange={o => { if (!o) { setStockTarget(null); adjustStock.reset(); } }}>
        <DialogContent style={{ maxWidth: "22rem" }}>
          <DialogHeader><DialogTitle>Stock In — {stockTarget ? String(stockTarget.productName) : ""}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Current stock: <strong>{parseFloat(String(stockTarget?.currentStock ?? "0")).toFixed(0)} {fmt(stockTarget?.unitOfSale)}</strong></p>
          <div><Label>Quantity to add *</Label><Input type="number" min="1" step="1" value={stockQty} onChange={e => setStockQty(e.target.value)} placeholder="e.g. 24" /></div>
          <DialogMutationError mutation={adjustStock} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setStockTarget(null)}>Cancel</Button>
            <Button onClick={() => adjustStock.mutate({ id: stockTarget!.id as number, adjustment: parseFloat(stockQty) })} disabled={adjustStock.isPending || !stockQty || parseFloat(stockQty) <= 0}>
              {adjustStock.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}Add Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Shared confirmation dialog ────────────────────────────────────────── */}
      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={() => { confirmState.onConfirm(); setConfirmState(s => ({ ...s, open: false })); }}
        onCancel={() => setConfirmState(s => ({ ...s, open: false }))}
        confirmLabel={confirmState.confirmLabel ?? "Confirm"}
        confirmVariant={confirmState.variant ?? "default"}
      />

      {/* ── Add / Edit product dialog ─────────────────────────────────────────── */}
      <Dialog open={prodOpen} onOpenChange={o => { setProdOpen(o); if (!o) saveProd.reset(); }}>
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader><DialogTitle>{prodEditing ? "Edit Product" : "Add Product"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Label>Product Name *</Label><Input value={String(prodForm.productName ?? "")} onChange={e => setProdForm(f => ({ ...f, productName: e.target.value }))} /></div>
            <div><Label>Category *</Label>
              <Select value={SHOP_CATEGORIES.filter(c => c !== "Other").includes(String(prodForm.category ?? "")) ? String(prodForm.category) : prodForm.category ? "Other" : ""} onValueChange={v => setProdForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{SHOP_CATEGORIES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
              {(prodForm.category === "Other" || (prodForm.category && !SHOP_CATEGORIES.filter(c => c !== "Other").includes(String(prodForm.category)))) ? (
                <Input className="mt-1.5" value={prodForm.category === "Other" ? "" : String(prodForm.category)} onChange={e => setProdForm(f => ({ ...f, category: e.target.value || "Other" }))} placeholder="Please specify category…" />
              ) : null}
            </div>
            <div><Label>Unit of Sale</Label><Input value={String(prodForm.unitOfSale ?? "")} onChange={e => setProdForm(f => ({ ...f, unitOfSale: e.target.value }))} placeholder="e.g. dozen, kg, jar" /></div>
            <div><Label>Cost Price (£)</Label><Input type="number" step="0.01" value={String(prodForm.costPrice ?? "")} onChange={e => setProdForm(f => ({ ...f, costPrice: e.target.value }))} placeholder="What you pay" /></div>
            <div><Label>Selling Price (£)</Label><Input type="number" step="0.01" value={String(prodForm.pricePerUnit ?? "")} onChange={e => setProdForm(f => ({ ...f, pricePerUnit: e.target.value }))} placeholder="What you charge" /></div>
            <div><Label>Current Stock</Label><Input type="number" step="1" min="0" value={String(prodForm.currentStock ?? "0")} onChange={e => setProdForm(f => ({ ...f, currentStock: e.target.value }))} /></div>
            <div><Label>Reorder Level</Label><Input type="number" step="1" min="0" value={String(prodForm.reorderLevel ?? "0")} onChange={e => setProdForm(f => ({ ...f, reorderLevel: e.target.value }))} /></div>
            <div><Label>Country of Origin</Label><Input value={String(prodForm.countryOfOrigin ?? "")} onChange={e => setProdForm(f => ({ ...f, countryOfOrigin: e.target.value }))} /></div>
            <div><Label>Best Before (days)</Label><Input type="number" value={String(prodForm.bestBeforeDays ?? "")} onChange={e => setProdForm(f => ({ ...f, bestBeforeDays: e.target.value }))} /></div>
            <div><Label>Storage Requirements</Label><Input value={String(prodForm.storageRequirements ?? "")} onChange={e => setProdForm(f => ({ ...f, storageRequirements: e.target.value }))} /></div>
            <div className="flex items-center gap-2 mt-4"><Checkbox id="active-prod" checked={Boolean(prodForm.active)} onCheckedChange={v => setProdForm(f => ({ ...f, active: Boolean(v) }))} /><Label htmlFor="active-prod">Active product?</Label></div>
            <div className="col-span-2"><Label>Description</Label><Textarea value={String(prodForm.description ?? "")} onChange={e => setProdForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
          </div>
          <DialogMutationError mutation={saveProd} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setProdOpen(false)}>Cancel</Button>
            <Button onClick={() => saveProd.mutate(prodForm)} disabled={saveProd.isPending || !prodForm.productName || !prodForm.category}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const HYGIENE_RELATES_TO = ["Farm Shop", "Food Processing", "Dairy / Artisan Processing", "Events / Catering", "Farm Kitchen", "Equine / Livery", "Other"];

function HygieneInspectionsTab({ farmId }: { farmId: number }) {
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const { data: records, isLoading, open, setOpen, editing, form, setForm, save, del, openAdd, openEdit } = useCrud(farmId, "farm-shop-hygiene-inspections", "shop-hygiene");

  function printHygieneRegister() {
    const rows = (records as Record<string, unknown>[]).map(r => `<tr>
      <td>${fmt(r.relatesTo)}</td>
      <td>${fmtDate(r.inspectionDate)}</td>
      <td>${fmt(r.inspectionType)}</td>
      <td>${fmt(r.inspectorName)}</td>
      <td>${fmt(r.inspectorOrganisation)}</td>
      <td>${r.hygieneRating != null ? `${r.hygieneRating} / 5` : "—"}</td>
      <td>${r.reinspectionRequired ? "Yes" : "No"}</td>
      <td>${fmtDate(r.reinspectionDate)}</td>
      <td>${fmt(r.findingsSummary)}</td>
      <td>${fmt(r.correctiveActions)}</td>
    </tr>`).join("");
    openPrintWindow(`<!DOCTYPE html><html><head><title>Hygiene & Food Safety Inspection Register</title>
<style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb;font-size:10px;vertical-align:top}tr:nth-child(even) td{background:#fafafa}@media print{@page{margin:1.5cm;size:landscape}}</style>
</head><body>
<h1>Hygiene &amp; Food Safety Inspection Register</h1>
<h2>${(records as Record<string, unknown>[]).length} inspection${(records as Record<string, unknown>[]).length !== 1 ? "s" : ""} · Printed: ${new Date().toLocaleDateString("en-GB")}</h2>
<table><thead><tr><th>Relates To</th><th>Date</th><th>Type</th><th>Inspector</th><th>Organisation</th><th>Rating</th><th>Reinspection</th><th>Reinspection Date</th><th>Findings</th><th>Corrective Actions</th></tr></thead>
<tbody>${rows}</tbody></table>
</body></html>`);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-sm">Hygiene &amp; Food Safety Inspections</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Log all hygiene and food safety inspections across diversification activities — Farm Shop, food processing, events catering and more.</p>
        </div>
        <div className="flex gap-2">
          {(records as Record<string, unknown>[]).length > 0 && <Button size="sm" variant="outline" onClick={printHygieneRegister}><Printer className="w-4 h-4 mr-1" />Print</Button>}
          <Button size="sm" onClick={() => openAdd({ reinspectionRequired: false })}><Plus className="w-4 h-4 mr-1" />Add Inspection</Button>
        </div>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <DataTable
          cols={[
            { key: "relatesTo", label: "Relates To" },
            { key: "inspectionDate", label: "Date", fmt: r => fmtDate(r.inspectionDate) },
            { key: "inspectionType", label: "Type" },
            { key: "inspectorOrganisation", label: "Organisation" },
            { key: "hygieneRating", label: "Rating" },
            { key: "reinspectionRequired", label: "Reinspection", fmt: r => r.reinspectionRequired ? "Yes" : "No" },
          ]}
          rows={records as Record<string, unknown>[]}
          onView={setViewRecord}
          onEdit={r => openEdit(r as Record<string, unknown>)}
          onDelete={r => del.mutate(r.id as number)}
        />
      )}

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Hygiene Inspection</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Relates To</p><p className="font-medium">{fmt(viewRecord.relatesTo)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Inspection Date</p><p className="font-medium">{fmtDate(viewRecord.inspectionDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Inspection Type</p><p className="font-medium">{fmt(viewRecord.inspectionType)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Food Hygiene Rating</p><p className="font-medium">{viewRecord.hygieneRating != null ? `${viewRecord.hygieneRating} / 5` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Inspector Name</p><p className="font-medium">{fmt(viewRecord.inspectorName)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Organisation</p><p className="font-medium">{fmt(viewRecord.inspectorOrganisation)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Reinspection Required</p><p className="font-medium">{viewRecord.reinspectionRequired ? "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Reinspection Date</p><p className="font-medium">{fmtDate(viewRecord.reinspectionDate)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Findings Summary</p><p className="font-medium whitespace-pre-wrap">{fmt(viewRecord.findingsSummary)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Corrective Actions</p><p className="font-medium whitespace-pre-wrap">{fmt(viewRecord.correctiveActions)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium whitespace-pre-wrap">{fmt(viewRecord.notes)}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Hygiene Inspection</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Label>Relates To *</Label>
              <Select value={HYGIENE_RELATES_TO.filter(o => o !== "Other").includes(String(form.relatesTo ?? "")) ? String(form.relatesTo) : form.relatesTo ? "Other" : ""} onValueChange={v => setForm(f => ({ ...f, relatesTo: v }))}>
                <SelectTrigger><SelectValue placeholder="Select activity this inspection covers" /></SelectTrigger>
                <SelectContent>{HYGIENE_RELATES_TO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
              {(form.relatesTo === "Other" || (form.relatesTo && !HYGIENE_RELATES_TO.filter(o => o !== "Other").includes(String(form.relatesTo)))) ? (
                <Input className="mt-1.5" value={form.relatesTo === "Other" ? "" : String(form.relatesTo)} onChange={e => setForm(f => ({ ...f, relatesTo: e.target.value || "Other" }))} placeholder="Please specify…" />
              ) : null}
            </div>
            <div><Label>Inspection Date *</Label><Input type="date" value={String(form.inspectionDate ?? "")} onChange={e => setForm(f => ({ ...f, inspectionDate: e.target.value }))} /></div>
            <div><Label>Inspection Type *</Label>
              <Select value={String(form.inspectionType ?? "")} onValueChange={v => setForm(f => ({ ...f, inspectionType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Local Authority Routine", "Allergen Compliance", "HACCP Audit", "Red Tractor", "Self-Audit", "Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Inspector Name</Label><Input value={String(form.inspectorName ?? "")} onChange={e => setForm(f => ({ ...f, inspectorName: e.target.value }))} /></div>
            <div><Label>Organisation</Label><Input value={String(form.inspectorOrganisation ?? "")} onChange={e => setForm(f => ({ ...f, inspectorOrganisation: e.target.value }))} /></div>
            <div><Label>Food Hygiene Rating (0–5)</Label><Input type="number" min="0" max="5" value={String(form.hygieneRating ?? "")} onChange={e => setForm(f => ({ ...f, hygieneRating: e.target.value }))} /></div>
            <div className="flex items-center gap-2 self-end pb-1"><Checkbox id="reinsp" checked={Boolean(form.reinspectionRequired)} onCheckedChange={v => setForm(f => ({ ...f, reinspectionRequired: Boolean(v) }))} /><Label htmlFor="reinsp">Reinspection required?</Label></div>
            <div><Label>Reinspection Date</Label><Input type="date" value={String(form.reinspectionDate ?? "")} onChange={e => setForm(f => ({ ...f, reinspectionDate: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Findings Summary</Label><Textarea value={String(form.findingsSummary ?? "")} onChange={e => setForm(f => ({ ...f, findingsSummary: e.target.value }))} rows={2} /></div>
            <div className="col-span-2"><Label>Corrective Actions</Label><Textarea value={String(form.correctiveActions ?? "")} onChange={e => setForm(f => ({ ...f, correctiveActions: e.target.value }))} rows={2} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EquineTab({ farmId }: { farmId: number }) {
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [viewEvent, setViewEvent] = useState<Record<string, unknown> | null>(null);
  const { data: horses, isLoading, open, setOpen, editing, form, setForm, save, del, openAdd, openEdit } = useCrud(farmId, "equine-records", "equine");
  const { data: events, isLoading: evL, open: evOpen, setOpen: setEvOpen, form: evForm, setForm: setEvForm, save: evSave, del: evDel, openAdd: evOpenAdd } = useCrud(farmId, "equine-health-events", "equine-health");
  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-3"><h3 className="font-semibold text-sm">Equine Register</h3><Button size="sm" onClick={() => openAdd({ status: "active" })}><Plus className="w-4 h-4 mr-1" />Add Horse</Button></div>
        {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "horseName", label: "Name" }, { key: "breed", label: "Breed" }, { key: "sex", label: "Sex" }, { key: "passportNumber", label: "Passport No." }, { key: "microchipNumber", label: "Microchip" }, { key: "ownerName", label: "Owner" }, { key: "liveryType", label: "Livery Type" }, { key: "box", label: "Box" }]} rows={horses as Record<string, unknown>[]} onView={setViewRecord} onEdit={r => openEdit(r as Record<string, unknown>)} onDelete={r => del.mutate(r.id as number)} />}
      </div>
      <div>
        <div className="flex justify-between items-center mb-3"><h3 className="font-semibold text-sm">Health Events (Worming, Farrier, Vaccination)</h3><Button size="sm" onClick={() => evOpenAdd()}><Plus className="w-4 h-4 mr-1" />Log Event</Button></div>
        {evL ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "eventDate", label: "Date", fmt: r => fmtDate(r.eventDate) }, { key: "eventType", label: "Type" }, { key: "vetOrFarrierName", label: "Vet / Farrier" }, { key: "treatmentGiven", label: "Treatment" }, { key: "productUsed", label: "Product" }, { key: "cost", label: "Cost (£)" }]} rows={events as Record<string, unknown>[]} onView={setViewEvent} onDelete={r => evDel.mutate(r.id as number)} />}
      </div>

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Equine Record</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Horse Name</p><p className="font-medium">{fmt(viewRecord.horseName)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Breed</p><p className="font-medium">{fmt(viewRecord.breed)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Sex</p><p className="font-medium">{fmt(viewRecord.sex)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Colour</p><p className="font-medium">{fmt(viewRecord.colour)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Date of Birth</p><p className="font-medium">{fmtDate(viewRecord.dateOfBirth)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Passport Number</p><p className="font-medium">{fmt(viewRecord.passportNumber)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">UELN Number</p><p className="font-medium">{fmt(viewRecord.uelnNumber)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Microchip Number</p><p className="font-medium">{fmt(viewRecord.microchipNumber)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Owner Name</p><p className="font-medium">{fmt(viewRecord.ownerName)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Livery Type</p><p className="font-medium">{fmt(viewRecord.liveryType)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Box / Stable</p><p className="font-medium">{fmt(viewRecord.box)}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {viewEvent && (
        <Dialog open onOpenChange={() => setViewEvent(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Health Event</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Date</p><p className="font-medium">{fmtDate(viewEvent.eventDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Event Type</p><p className="font-medium">{fmt(viewEvent.eventType)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vet / Farrier Name</p><p className="font-medium">{fmt(viewEvent.vetOrFarrierName)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Treatment Given</p><p className="font-medium">{fmt(viewEvent.treatmentGiven)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Product Used</p><p className="font-medium">{fmt(viewEvent.productUsed)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Cost (£)</p><p className="font-medium">{fmt(viewEvent.cost)}</p></div>
            </div>
            <DialogFooter>
              <Button onClick={() => setViewEvent(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent style={{ maxWidth: "36rem" }}>
          <DialogHeader><DialogTitle>Equine Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Horse Name *</Label><Input value={String(form.horseName ?? "")} onChange={e => setForm(f => ({ ...f, horseName: e.target.value }))} /></div>
            <div><Label>Breed</Label><Input value={String(form.breed ?? "")} onChange={e => setForm(f => ({ ...f, breed: e.target.value }))} /></div>
            <div><Label>Colour</Label><Input value={String(form.colour ?? "")} onChange={e => setForm(f => ({ ...f, colour: e.target.value }))} /></div>
            <div><Label>Sex</Label>
              <Select value={String(form.sex ?? "")} onValueChange={v => setForm(f => ({ ...f, sex: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Stallion", "Gelding", "Mare", "Colt", "Filly"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Date of Birth</Label><Input type="date" value={String(form.dateOfBirth ?? "")} onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))} /></div>
            <div><Label>Passport Number</Label><Input value={String(form.passportNumber ?? "")} onChange={e => setForm(f => ({ ...f, passportNumber: e.target.value }))} /></div>
            <div><Label>UELN Number</Label><Input value={String(form.uelnNumber ?? "")} onChange={e => setForm(f => ({ ...f, uelnNumber: e.target.value }))} /></div>
            <div><Label>Microchip Number</Label><Input value={String(form.microchipNumber ?? "")} onChange={e => setForm(f => ({ ...f, microchipNumber: e.target.value }))} /></div>
            <div><Label>Owner Name</Label><Input value={String(form.ownerName ?? "")} onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))} /></div>
            <div><Label>Livery Type</Label>
              <Select value={String(form.liveryType ?? "")} onValueChange={v => setForm(f => ({ ...f, liveryType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Full Livery", "Part Livery", "DIY Livery", "Grass Livery", "Own Horses"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Box / Stable</Label><Input value={String(form.box ?? "")} onChange={e => setForm(f => ({ ...f, box: e.target.value }))} /></div>
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={evOpen} onOpenChange={o => { setEvOpen(o); if (!o) evSave.reset(); }}>
        <DialogContent style={{ maxWidth: "36rem" }}>
          <DialogHeader><DialogTitle>Health Event</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Date *</Label><Input type="date" value={String(evForm.eventDate ?? "")} onChange={e => setEvForm(f => ({ ...f, eventDate: e.target.value }))} /></div>
            <div><Label>Event Type *</Label>
              <Select value={String(evForm.eventType ?? "")} onValueChange={v => setEvForm(f => ({ ...f, eventType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Worming", "Farrier", "Vaccination", "Dental", "Veterinary Treatment", "Physiotherapy", "Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Vet / Farrier Name</Label><Input value={String(evForm.vetOrFarrierName ?? "")} onChange={e => setEvForm(f => ({ ...f, vetOrFarrierName: e.target.value }))} /></div>
            <div><Label>Treatment Given</Label><Input value={String(evForm.treatmentGiven ?? "")} onChange={e => setEvForm(f => ({ ...f, treatmentGiven: e.target.value }))} /></div>
            <div><Label>Product Used</Label><Input value={String(evForm.productUsed ?? "")} onChange={e => setEvForm(f => ({ ...f, productUsed: e.target.value }))} /></div>
            <div><Label>Cost (£)</Label><Input type="number" step="0.01" value={String(evForm.cost ?? "")} onChange={e => setEvForm(f => ({ ...f, cost: e.target.value }))} /></div>
          </div>
          <DialogMutationError mutation={evSave} message="Failed to save — your entries are still here." />
          <DialogFooter><Button variant="outline" onClick={() => setEvOpen(false)}>Cancel</Button><Button onClick={() => evSave.mutate(evForm)} disabled={evSave.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ShootingTab({ farmId }: { farmId: number }) {
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const { data: records, isLoading, open, setOpen, form, setForm, save, del, openAdd } = useCrud(farmId, "shooting-game-records", "shooting");

  function printShootRegister() {
    const rows = (records as Record<string, unknown>[]).map(r => `<tr>
      <td>${fmtDate(r.shootDate)}</td>
      <td>${fmt(r.shootType)}</td>
      <td>${fmt(r.organiser)}</td>
      <td>${fmt(r.gamekeeperName)}</td>
      <td>${fmt(r.numberOfGuns)}</td>
      <td>${fmt(r.bagsPheasant)}</td>
      <td>${fmt(r.bagsPartridge)}</td>
      <td>${fmt(r.bagsGrouse)}</td>
      <td>${fmt(r.bagsDuck)}</td>
      <td>${fmt(r.bagsWoodcock)}</td>
      <td>${fmt(r.bagsOther)}</td>
      <td>${fmt(r.totalBag)}</td>
      <td>${fmt(r.gameDealer)}</td>
      <td>${r.incomeLeaseFee ? `£${parseFloat(String(r.incomeLeaseFee)).toFixed(2)}` : "—"}</td>
    </tr>`).join("");
    const totalIncome = (records as Record<string, unknown>[]).reduce((s, r) => s + (parseFloat(String(r.incomeLeaseFee ?? 0)) || 0), 0);
    openPrintWindow(`<!DOCTYPE html><html><head><title>Shooting & Game Day Register</title>
<style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb;font-size:10px}tr:nth-child(even) td{background:#fafafa}tfoot td{font-weight:700;border-top:2px solid #d1d5db}@media print{@page{margin:1.5cm;size:landscape}}</style>
</head><body>
<h1>Shooting &amp; Game Day Register</h1>
<h2>${(records as Record<string, unknown>[]).length} shoot day${(records as Record<string, unknown>[]).length !== 1 ? "s" : ""} · Printed: ${new Date().toLocaleDateString("en-GB")}</h2>
<table><thead><tr><th>Date</th><th>Type</th><th>Organiser</th><th>Gamekeeper</th><th>Guns</th><th>Pheasant</th><th>Partridge</th><th>Grouse</th><th>Duck</th><th>Woodcock</th><th>Other</th><th>Total Bag</th><th>Game Dealer</th><th>Income</th></tr></thead>
<tbody>${rows}</tbody>
<tfoot><tr><td colspan="13">Total Income</td><td>£${totalIncome.toFixed(2)}</td></tr></tfoot>
</table>
</body></html>`);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Shooting & Game Records</h3>
        <div className="flex gap-2">
          {(records as Record<string, unknown>[]).length > 0 && <Button size="sm" variant="outline" onClick={printShootRegister}><Printer className="w-4 h-4 mr-1" />Print</Button>}
          <Button size="sm" onClick={() => openAdd({ bagsPheasant: "0", bagsPartridge: "0", bagsGrouse: "0", bagsDuck: "0", bagsWoodcock: "0", bagsOther: "0", totalBag: "0" })}><Plus className="w-4 h-4 mr-1" />Log Shoot</Button>
        </div>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "shootDate", label: "Date", fmt: r => fmtDate(r.shootDate) }, { key: "shootType", label: "Type" }, { key: "organiser", label: "Organiser" }, { key: "numberOfGuns", label: "Guns" }, { key: "totalBag", label: "Total Bag" }, { key: "gameDealer", label: "Game Dealer" }, { key: "incomeLeaseFee", label: "Income (£)" }]} rows={records as Record<string, unknown>[]} onView={setViewRecord} onDelete={r => del.mutate(r.id as number)} />}

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Shoot Record</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Shoot Date</p><p className="font-medium">{fmtDate(viewRecord.shootDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Shoot Type</p><p className="font-medium">{fmt(viewRecord.shootType)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Organiser</p><p className="font-medium">{fmt(viewRecord.organiser)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Number of Guns</p><p className="font-medium">{fmt(viewRecord.numberOfGuns)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Gamekeeper Name</p><p className="font-medium">{fmt(viewRecord.gamekeeperName)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Game Dealer</p><p className="font-medium">{fmt(viewRecord.gameDealer)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Total Bag</p><p className="font-medium">{fmt(viewRecord.totalBag)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Income / Lease Fee (£)</p><p className="font-medium">{fmt(viewRecord.incomeLeaseFee)}</p></div>
              <div className="col-span-2 grid grid-cols-3 gap-2">
                {[["bagsPheasant", "Pheasant"], ["bagsPartridge", "Partridge"], ["bagsGrouse", "Grouse"], ["bagsDuck", "Duck"], ["bagsWoodcock", "Woodcock"], ["bagsOther", "Other"]].map(([k, l]) => (
                  <div key={k}><p className="text-xs text-muted-foreground uppercase tracking-wide">{l}</p><p className="font-medium">{fmt(viewRecord[k])}</p></div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader><DialogTitle>Shoot Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Shoot Date *</Label><Input type="date" value={String(form.shootDate ?? "")} onChange={e => setForm(f => ({ ...f, shootDate: e.target.value }))} /></div>
            <div><Label>Shoot Type *</Label>
              <Select value={String(form.shootType ?? "")} onValueChange={v => setForm(f => ({ ...f, shootType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Driven Pheasant", "Rough Shoot", "Duck Flighting", "Walked-up", "Day Let", "Own Shoot"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Organiser / Tenant</Label><Input value={String(form.organiser ?? "")} onChange={e => setForm(f => ({ ...f, organiser: e.target.value }))} /></div>
            <div><Label>Number of Guns</Label><Input type="number" value={String(form.numberOfGuns ?? "")} onChange={e => setForm(f => ({ ...f, numberOfGuns: e.target.value }))} /></div>
            <div><Label>Gamekeeper Name</Label><Input value={String(form.gamekeeperName ?? "")} onChange={e => setForm(f => ({ ...f, gamekeeperName: e.target.value }))} /></div>
            <div><Label>Game Dealer</Label><Input value={String(form.gameDealer ?? "")} onChange={e => setForm(f => ({ ...f, gameDealer: e.target.value }))} /></div>
            {[["bagsPheasant", "Pheasant"], ["bagsPartridge", "Partridge"], ["bagsGrouse", "Grouse"], ["bagsDuck", "Duck"], ["bagsWoodcock", "Woodcock"], ["bagsOther", "Other"]].map(([k, l]) => <div key={k}><Label>{l}</Label><Input type="number" min="0" value={String(form[k] ?? "0")} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} /></div>)}
            <div><Label>Total Bag</Label><Input type="number" min="0" value={String(form.totalBag ?? "0")} onChange={e => setForm(f => ({ ...f, totalBag: e.target.value }))} /></div>
            <div><Label>Income / Lease Fee (£)</Label><Input type="number" step="0.01" value={String(form.incomeLeaseFee ?? "")} onChange={e => setForm(f => ({ ...f, incomeLeaseFee: e.target.value }))} /></div>
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const INCOME_TYPES = [
  "Farm Shop Sales",
  "Holiday Accommodation",
  "Livery / Equine",
  "Shoot Day / Let",
  "FIT / SEG Payment",
  "Event Hire",
  "Storage Let",
  "Tourism & Recreation",
  "Food Processing",
  "Other",
];

const VAT_RATES = [
  { value: "exempt", label: "Exempt" },
  { value: "zero", label: "Zero Rated (0%)" },
  { value: "reduced", label: "Reduced (5%)" },
  { value: "standard", label: "Standard (20%)" },
  { value: "outside_scope", label: "Outside Scope" },
];

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function IncomeTab({ farmId }: { farmId: number }) {
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const qc = useQueryClient();
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});

  const { data: activities = [] } = useQuery<Record<string, unknown>[]>({
    queryKey: ["div-activities", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/diversification-activities`), { credentials: "include" }).then(r => r.json()),
  });

  const { data: records = [], isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: ["div-income", farmId, year],
    queryFn: () => fetch(api(`farms/${farmId}/diversification-income${year ? `?year=${year}` : ""}`), { credentials: "include" }).then(r => r.json()),
  });

  const save = useMutation({
    mutationFn: (b: Record<string, unknown>) => fetch(
      editing ? api(`farms/${farmId}/diversification-income/${editing.id}`) : api(`farms/${farmId}/diversification-income`),
      { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }
    ),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["div-income", farmId] }); setOpen(false); setForm({}); setEditing(null); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/diversification-income/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["div-income", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function openAdd() { setEditing(null); setForm({ vatRate: "exempt", incomeDate: new Date().toISOString().slice(0, 10) }); setOpen(true); }
  function openEdit(r: Record<string, unknown>) { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v ?? ""]))); setOpen(true); }

  const fmtGbp = (v: unknown) => v ? `£${parseFloat(String(v)).toFixed(2)}` : "—";

  function printIncomeRegister() {
    const tableRows = (records as Record<string, unknown>[]).map(r => `<tr>
      <td>${fmtDate(r.incomeDate)}</td>
      <td>${fmt(r.incomeType)}</td>
      <td>${fmt(r.activityId)}</td>
      <td>${fmt(r.description)}</td>
      <td>${r.grossAmount ? `£${parseFloat(String(r.grossAmount)).toFixed(2)}` : "—"}</td>
      <td>${r.vatRate ? String(r.vatRate).replace(/_/g, " ") : "—"}</td>
      <td>${r.netAmount ? `£${parseFloat(String(r.netAmount)).toFixed(2)}` : "—"}</td>
      <td>${fmt(r.paymentMethod)}</td>
      <td>${fmt(r.reference)}</td>
    </tr>`).join("");
    const totalGross = (records as Record<string, unknown>[]).reduce((s, r) => s + (parseFloat(String(r.grossAmount ?? 0)) || 0), 0);
    const totalNet = (records as Record<string, unknown>[]).reduce((s, r) => s + (parseFloat(String(r.netAmount ?? 0)) || 0), 0);
    openPrintWindow(`<!DOCTYPE html><html><head><title>Diversification Income Register</title>
<style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb;font-size:10px}tr:nth-child(even) td{background:#fafafa}tfoot td{font-weight:700;border-top:2px solid #d1d5db}@media print{@page{margin:1.5cm;size:landscape}}</style>
</head><body>
<h1>Diversification Income Register</h1>
<h2>${(records as Record<string, unknown>[]).length} record${(records as Record<string, unknown>[]).length !== 1 ? "s" : ""}${year ? ` · ${year}` : ""} · Printed: ${new Date().toLocaleDateString("en-GB")}</h2>
<table><thead><tr><th>Date</th><th>Type</th><th>Activity</th><th>Description</th><th>Gross</th><th>VAT Rate</th><th>Net</th><th>Payment Method</th><th>Reference</th></tr></thead>
<tbody>${tableRows}</tbody>
<tfoot><tr><td colspan="4">Total</td><td>£${totalGross.toFixed(2)}</td><td></td><td>£${totalNet.toFixed(2)}</td><td colspan="2"></td></tr></tfoot>
</table>
</body></html>`);
  }
  const fmtGbpLong = (v: number) => `£${v.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const summary = useMemo(() => {
    const totals: Record<string, number> = {};
    const counts: Record<string, number> = {};
    let grand = 0;
    for (const r of records) {
      const type = String(r.incomeType ?? "Other");
      const net = parseFloat(String(r.amountNet ?? "0")) || 0;
      totals[type] = (totals[type] ?? 0) + net;
      counts[type] = (counts[type] ?? 0) + 1;
      grand += net;
    }
    return { totals, counts, grand };
  }, [records]);

  const displayRecords = useMemo(
    () => selectedType ? records.filter(r => r.incomeType === selectedType) : records,
    [records, selectedType]
  );

  const drillDown = useMemo(() => {
    if (!selectedType) return null;
    const filtered = records.filter(r => r.incomeType === selectedType);
    const amounts = filtered.map(r => parseFloat(String(r.amountNet ?? "0")) || 0);
    const total = amounts.reduce((a, b) => a + b, 0);
    const count = filtered.length;
    const avg = count ? total / count : 0;
    const largest = Math.max(...amounts, 0);

    const byMonth: Record<string, { total: number; count: number }> = {};
    for (const r of filtered) {
      const d = String(r.incomeDate ?? "");
      if (!d) continue;
      const key = d.slice(0, 7);
      const net = parseFloat(String(r.amountNet ?? "0")) || 0;
      byMonth[key] = { total: (byMonth[key]?.total ?? 0) + net, count: (byMonth[key]?.count ?? 0) + 1 };
    }
    const months = Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => {
      const [yr, mo] = k.split("-");
      return { label: `${MONTH_NAMES[parseInt(mo, 10) - 1]} ${yr}`, ...v };
    });

    const byCustomer: Record<string, number> = {};
    for (const r of filtered) {
      const name = String(r.customerName ?? "Unknown");
      byCustomer[name] = (byCustomer[name] ?? 0) + (parseFloat(String(r.amountNet ?? "0")) || 0);
    }
    const customers = Object.entries(byCustomer).sort((a, b) => b[1] - a[1]);

    const maxBar = Math.max(...months.map(m => m.total), 1);

    return { total, count, avg, largest, months, customers, maxBar };
  }, [records, selectedType]);

  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-semibold text-sm">Diversification Income</h3>
        <div className="flex items-center gap-2">
          <select
            className="text-sm border rounded-md px-2 py-1.5 bg-background"
            value={year ?? ""}
            onChange={e => { setYear(e.target.value ? parseInt(e.target.value) : null); setSelectedType(null); }}
          >
            <option value="">All Years</option>
            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          {(records as Record<string, unknown>[]).length > 0 && <Button size="sm" variant="outline" onClick={printIncomeRegister}><Printer className="w-4 h-4 mr-1" />Print</Button>}
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Income</Button>
        </div>
      </div>

      {summary.grand > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <button
            onClick={() => setSelectedType(null)}
            className={`col-span-2 sm:col-span-3 lg:col-span-4 p-4 rounded-xl border flex items-center justify-between transition-all text-left ${
              selectedType === null
                ? "bg-emerald-100 border-emerald-400 ring-2 ring-emerald-400"
                : "bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span className="font-semibold text-emerald-900">
                Total Net Income {year ? year : "— All Time"}
              </span>
              {selectedType === null && (
                <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-medium">All sources</span>
              )}
            </div>
            <span className="text-2xl font-bold text-emerald-700">{fmtGbpLong(summary.grand)}</span>
          </button>

          {Object.entries(summary.totals).sort((a, b) => b[1] - a[1]).map(([type, total]) => {
            const isActive = selectedType === type;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(isActive ? null : type)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  isActive
                    ? "bg-blue-50 border-blue-400 ring-2 ring-blue-400 shadow-sm"
                    : "bg-muted/30 hover:bg-muted/60 hover:border-blue-200"
                }`}
              >
                <p className={`text-xs truncate font-medium ${isActive ? "text-blue-700" : "text-muted-foreground"}`}>{type}</p>
                <p className={`font-bold text-sm mt-0.5 ${isActive ? "text-blue-900" : ""}`}>{fmtGbpLong(total)}</p>
                <p className={`text-[10px] ${isActive ? "text-blue-600" : "text-muted-foreground"}`}>
                  {((total / summary.grand) * 100).toFixed(1)}% · {summary.counts[type]} transaction{summary.counts[type] !== 1 ? "s" : ""}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {drillDown && selectedType && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm text-blue-900">{selectedType} — Breakdown</h4>
            <div className="flex gap-3 text-xs text-blue-700 font-medium">
              <span>{drillDown.count} transactions</span>
              <span>Avg {fmtGbp(drillDown.avg)}</span>
              <span>Largest {fmtGbp(drillDown.largest)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-blue-800 mb-2">Monthly Income</p>
              {drillDown.months.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No monthly data</p>
              ) : (
                <div className="space-y-1.5">
                  {drillDown.months.map(m => (
                    <div key={m.label} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-16 shrink-0">{m.label}</span>
                      <div className="flex-1 h-4 bg-blue-100 rounded overflow-hidden">
                        <div
                          className="h-full bg-blue-400 rounded transition-all"
                          style={{ width: `${(m.total / drillDown.maxBar) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-blue-900 w-20 text-right shrink-0">{fmtGbp(m.total)}</span>
                      <span className="text-[10px] text-muted-foreground w-12 shrink-0">×{m.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-medium text-blue-800 mb-2">By Customer / Payer</p>
              {drillDown.customers.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No customer data</p>
              ) : (
                <div className="space-y-1">
                  {drillDown.customers.map(([name, total], i) => (
                    <div key={name} className="flex items-center justify-between gap-2 py-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[10px] font-bold text-blue-400 w-4 shrink-0">#{i + 1}</span>
                        <span className="text-xs truncate">{name}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-semibold text-blue-900">{fmtGbp(total)}</span>
                        <span className="text-[10px] text-muted-foreground ml-1">{((total / drillDown.total) * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <>
          {selectedType && (
            <div className="flex items-center gap-2 text-sm text-blue-700 font-medium">
              <span>Showing: {selectedType}</span>
              <button onClick={() => setSelectedType(null)} className="text-xs text-muted-foreground hover:text-foreground underline">Clear filter</button>
            </div>
          )}

          {viewRecord && (
            <Dialog open onOpenChange={() => setViewRecord(null)}>
              <DialogContent style={{ maxWidth: "42rem" }}>
                <DialogHeader><DialogTitle>View Income Record</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Income Date</p><p className="font-medium">{fmtDate(viewRecord.incomeDate)}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Income Type</p><p className="font-medium">{fmt(viewRecord.incomeType)}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Activity</p><p className="font-medium">{fmt(viewRecord.activityName)}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Customer / Payer</p><p className="font-medium">{fmt(viewRecord.customerName)}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Net Amount (£)</p><p className="font-medium">{fmtGbp(viewRecord.amountNet)}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">VAT Rate</p><p className="font-medium">{VAT_RATES.find(v => v.value === viewRecord.vatRate)?.label ?? String(viewRecord.vatRate)}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">VAT Amount (£)</p><p className="font-medium">{fmt(viewRecord.vatAmount)}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Invoice / Reference</p><p className="font-medium">{fmt(viewRecord.invoiceRef)}</p></div>
                  <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Description</p><p className="font-medium">{fmt(viewRecord.description)}</p></div>
                  <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{fmt(viewRecord.notes)}</p></div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
                  <Button onClick={() => setViewRecord(null)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          <DataTable
            cols={[
              { key: "incomeDate", label: "Date", fmt: r => fmtDate(r.incomeDate) },
              { key: "activityName", label: "Activity" },
              ...(!selectedType ? [{ key: "incomeType", label: "Type" }] : []),
              { key: "description", label: "Description" },
              { key: "customerName", label: "Customer" },
              { key: "amountNet", label: "Net Amount", fmt: r => fmtGbp(r.amountNet) },
              { key: "vatRate", label: "VAT", fmt: r => VAT_RATES.find(v => v.value === r.vatRate)?.label ?? String(r.vatRate) },
              { key: "invoiceRef", label: "Invoice Ref" },
            ]}
            rows={displayRecords}
            onView={setViewRecord}
            onEdit={r => openEdit(r)}
            onDelete={r => del.mutate(r.id as number)}
          />
        </>
      )}

      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent style={{ maxWidth: "42rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Income Record" : "Add Income Record"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Income Date *</Label><Input type="date" value={String(form.incomeDate ?? "")} onChange={e => setForm(f => ({ ...f, incomeDate: e.target.value }))} /></div>
            <div><Label>Income Type *</Label>
              <Select value={INCOME_TYPES.filter(t => t !== "Other").includes(String(form.incomeType ?? "")) ? String(form.incomeType) : form.incomeType ? "Other" : ""} onValueChange={v => setForm(f => ({ ...f, incomeType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>{INCOME_TYPES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
              {(form.incomeType === "Other" || (form.incomeType && !INCOME_TYPES.filter(t => t !== "Other").includes(String(form.incomeType)))) ? (
                <Input className="mt-1.5" value={form.incomeType === "Other" ? "" : String(form.incomeType)} onChange={e => setForm(f => ({ ...f, incomeType: e.target.value || "Other" }))} placeholder="Please specify income type…" />
              ) : null}
            </div>
            <div><Label>Linked Activity</Label>
              <Select value={String(form.activityId ?? "__none__")} onValueChange={v => setForm(f => ({ ...f, activityId: v === "__none__" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— None —</SelectItem>
                  {(activities as Record<string, unknown>[]).map((a) => <SelectItem key={String(a.id)} value={String(a.id)}>{String(a.activityName)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Customer / Payer</Label><Input value={String(form.customerName ?? "")} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} /></div>
            <div><Label>Net Amount (£) *</Label><Input type="number" step="0.01" min="0" value={String(form.amountNet ?? "")} onChange={e => setForm(f => ({ ...f, amountNet: e.target.value }))} /></div>
            <div><Label>VAT Rate</Label>
              <Select value={String(form.vatRate ?? "exempt")} onValueChange={v => setForm(f => ({ ...f, vatRate: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{VAT_RATES.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>VAT Amount (£)</Label><Input type="number" step="0.01" min="0" value={String(form.vatAmount ?? "")} onChange={e => setForm(f => ({ ...f, vatAmount: e.target.value }))} /></div>
            <div><Label>Invoice / Reference</Label><Input value={String(form.invoiceRef ?? "")} onChange={e => setForm(f => ({ ...f, invoiceRef: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Description</Label><Textarea value={String(form.description ?? "")} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending || !form.incomeDate || !form.incomeType || !form.amountNet}>
              {save.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Analytics Tab ─────────────────────────────────────────────────────────────
const DIV_COLORS = ["#15803d","#a16207","#1d4ed8","#b91c1c","#7c3aed","#0e7490"];

function DiversificationAnalyticsTab({ farmId }: { farmId: number }) {
  const { data: incomeRaw } = useQuery({ queryKey: ["div-income", farmId], queryFn: () => fetch(`/api/farms/${farmId}/diversification-income`, { credentials: "include" }).then(r => r.json()) });
  const { data: activitiesRaw } = useQuery({ queryKey: ["div-activities", farmId], queryFn: () => fetch(`/api/farms/${farmId}/diversification-activities`, { credentials: "include" }).then(r => r.json()) });
  const { data: hygieneRaw } = useQuery({ queryKey: ["hygiene-inspections", farmId], queryFn: () => fetch(`/api/farms/${farmId}/diversification-hygiene-inspections`, { credentials: "include" }).then(r => r.json()) });

  const income: Record<string, unknown>[] = useMemo(() => incomeRaw?.records ?? incomeRaw ?? [], [incomeRaw]);
  const activities: Record<string, unknown>[] = useMemo(() => activitiesRaw?.records ?? activitiesRaw ?? [], [activitiesRaw]);
  const hygiene: Record<string, unknown>[] = useMemo(() => hygieneRaw?.records ?? hygieneRaw ?? [], [hygieneRaw]);

  const totalIncome = useMemo(() => income.reduce((s, r) => s + (Number(r.amount) || Number(r.value) || Number(r.revenue) || 0), 0), [income]);

  const incomeByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    income.forEach(r => { const c = String(r.category || r.source || r.activityType || "Other"); map[c] = (map[c] || 0) + (Number(r.amount) || Number(r.value) || 0); });
    return Object.entries(map).sort((a,b) => b[1]-a[1]).map(([name, value]) => ({ name: name.length > 14 ? name.slice(0,13)+"…" : name, value: +value.toFixed(2) }));
  }, [income]);

  const incomeByMonth = useMemo(() => {
    const map: Record<string, number> = {};
    income.forEach(r => {
      const d = String(r.date || r.incomeDate || ""); const k = d.slice(0, 7); if (!k || k.length < 7) return;
      map[k] = (map[k] || 0) + (Number(r.amount) || Number(r.value) || 0);
    });
    return Object.entries(map).sort().slice(-12).map(([m, val]) => ({ month: m.slice(5), income: +val.toFixed(2) }));
  }, [income]);

  const hygienePassRate = useMemo(() => {
    const passed = hygiene.filter(r => r.result === "pass" || r.rating === 5 || Number(r.rating) >= 4 || r.passed === true).length;
    return hygiene.length ? Math.round((passed / hygiene.length) * 100) : null;
  }, [hygiene]);

  const noData = income.length === 0 && activities.length === 0;
  if (noData) return (
    <div className="text-center py-16 text-muted-foreground text-sm">
      <TrendingUp className="w-8 h-8 mx-auto mb-3 opacity-30" />
      <p className="font-medium">No data yet</p>
      <p className="text-xs mt-1">Add income or activity records to see analytics.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Income Records", value: income.length, bg: "bg-green-50 border-green-100", text: "text-green-800", sub: "text-green-700" },
          { label: "Total Revenue", value: `£${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, bg: "bg-amber-50 border-amber-100", text: "text-amber-800", sub: "text-amber-700" },
          { label: "Activities", value: activities.length, bg: "bg-blue-50 border-blue-100", text: "text-blue-800", sub: "text-blue-700" },
          { label: "Hygiene Pass Rate", value: hygienePassRate !== null ? `${hygienePassRate}%` : "—", bg: "bg-purple-50 border-purple-100", text: "text-purple-800", sub: "text-purple-700" },
        ].map(c => (
          <div key={c.label} className={`${c.bg} rounded-xl border p-4 text-center`}>
            <p className={`text-2xl font-bold ${c.text}`}>{c.value}</p>
            <p className={`text-xs mt-0.5 ${c.sub}`}>{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {incomeByMonth.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-sm mb-4">Monthly Revenue</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeByMonth} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `£${v}`} />
                  <Tooltip formatter={(v) => [`£${Number(v).toLocaleString()}`, "Revenue"]} />
                  <Bar dataKey="income" fill="#15803d" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        {incomeByCategory.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-sm mb-4">Income Mix by Category</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={incomeByCategory} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                    {incomeByCategory.map((_, i) => <Cell key={i} fill={DIV_COLORS[i % DIV_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`£${Number(v).toLocaleString()}`, ""]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

type Tab = "activities" | "shop" | "hygiene" | "equine" | "shooting" | "income" | "analytics";

export default function DiversificationPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = usePersistedTab<Tab>({ page: "diversification", farmId, validIds: ["activities", "income", "shop", "hygiene", "equine", "shooting", "analytics"], defaultTab: "activities", urlOverride: new URLSearchParams(window.location.search).get("tab") });
  if (!farmId) return <Redirect to="/" />;
  return (
    <AppLayout title="Farm Diversification">
      <div className="space-y-4">
        <TabBar>
          <TabButton active={tab === "activities"} onClick={() => setTab("activities")}><LayoutList className="w-3.5 h-3.5 mr-1" />Activities</TabButton>
          <TabButton active={tab === "income"} onClick={() => setTab("income")}><PoundSterling className="w-3.5 h-3.5 mr-1" />Income</TabButton>
          <TabButton active={tab === "shop"} onClick={() => setTab("shop")}><ShoppingBag className="w-3.5 h-3.5 mr-1" />Farm Shop</TabButton>
          <TabButton active={tab === "hygiene"} onClick={() => setTab("hygiene")}><ClipboardCheck className="w-3.5 h-3.5 mr-1" />Hygiene</TabButton>
          <TabButton active={tab === "equine"} onClick={() => setTab("equine")}><PawPrint className="w-3.5 h-3.5 mr-1" />Equine</TabButton>
          <TabButton active={tab === "shooting"} onClick={() => setTab("shooting")}><Crosshair className="w-3.5 h-3.5 mr-1" />Shooting</TabButton>
          <TabButton active={tab === "analytics"} onClick={() => setTab("analytics")}><TrendingUp className="w-3.5 h-3.5 mr-1" />Analytics</TabButton>
        </TabBar>
        <Card><CardContent className="pt-4">
          {tab === "activities" && <ActivitiesTab farmId={farmId} />}
          {tab === "income" && <IncomeTab farmId={farmId} />}
          {tab === "shop" && <FarmShopTab farmId={farmId} />}
          {tab === "hygiene" && <HygieneInspectionsTab farmId={farmId} />}
          {tab === "equine" && <EquineTab farmId={farmId} />}
          {tab === "shooting" && <ShootingTab farmId={farmId} />}
          {tab === "analytics" && <DiversificationAnalyticsTab farmId={farmId} />}
        </CardContent></Card>
      </div>
    </AppLayout>
  );
}
