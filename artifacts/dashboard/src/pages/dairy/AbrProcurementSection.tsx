import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Plus, Pencil, Trash2, Loader2, AlertTriangle, CheckCircle2,
  ChevronRight, ChevronDown, Building2, ShoppingCart, PackageCheck,
  Receipt, Clock, BadgeCheck, XCircle,
} from "lucide-react";

const BASE = import.meta.env.BASE_URL;
const api = (path: string) => `${BASE}api/${path}`;

function formatDate(v?: string | null) {
  if (!v) return "—";
  try { return new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return v; }
}

function today() { return new Date().toISOString().slice(0, 10); }

function penceToGBP(p?: number | null) {
  if (p == null) return "—";
  return `£${(p / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Supplier {
  id: number; farmId: number; companyName: string;
  contactName?: string | null; phone?: string | null; email?: string | null;
  addressLine1?: string | null; addressLine2?: string | null;
  city?: string | null; postcode?: string | null;
  accountRef?: string | null; paymentTermsDays?: number | null;
  notes?: string | null;
}

interface PoItem {
  id: number; poId: number; productName: string;
  quantityOrdered: number; unitPricePence?: number | null; notes?: string | null;
}

interface PurchaseOrder {
  id: number; farmId: number; supplierId?: number | null;
  poNumber: string; orderDate: string; expectedDeliveryDate?: string | null;
  status: string; notes?: string | null;
  items: PoItem[];
}

interface Grn {
  id: number; farmId: number; poId?: number | null;
  grnNumber?: string | null; receivedDate: string;
  receivedBy?: string | null; conditionOnArrival?: string | null; notes?: string | null;
}

interface Invoice {
  id: number; farmId: number; supplierId?: number | null; poId?: number | null;
  invoiceNumber: string; invoiceDate: string; dueDate?: string | null;
  netAmountPence?: number | null; vatAmountPence?: number | null;
  grossAmountPence?: number | null; paymentStatus: string;
  paymentDate?: string | null; paymentReference?: string | null; notes?: string | null;
}

// ─── Status badges ─────────────────────────────────────────────────────────────

function PoBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    draft:         { bg: "bg-gray-100",   text: "text-gray-700",   label: "Draft" },
    sent:          { bg: "bg-blue-100",   text: "text-blue-700",   label: "Sent" },
    "part-received": { bg: "bg-amber-100", text: "text-amber-700", label: "Part received" },
    received:      { bg: "bg-green-100",  text: "text-green-700",  label: "Received" },
    cancelled:     { bg: "bg-red-100",    text: "text-red-700",    label: "Cancelled" },
  };
  const s = map[status] ?? map.draft;
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>{s.label}</span>;
}

function InvoiceBadge({ status }: { status: string }) {
  if (status === "paid") return <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700"><BadgeCheck className="h-3 w-3" />Paid</span>;
  if (status === "part-paid") return <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700"><Clock className="h-3 w-3" />Part paid</span>;
  if (status === "overdue") return <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700"><XCircle className="h-3 w-3" />Overdue</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700"><Clock className="h-3 w-3" />Unpaid</span>;
}

function GrnConditionBadge({ condition }: { condition?: string | null }) {
  if (!condition) return null;
  if (condition === "good") return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">Good condition</span>;
  if (condition === "damaged") return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">Damaged</span>;
  if (condition === "partial") return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Partial delivery</span>;
  return <span className="text-xs text-gray-500">{condition}</span>;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AbrProcurementSection({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  // Data
  const suppliersQ = useQuery<{ suppliers: Supplier[] }>({
    queryKey: ["abr-suppliers", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/abr-suppliers`), { credentials: "include" }).then(r => r.json()),
  });
  const ordersQ = useQuery<{ orders: PurchaseOrder[] }>({
    queryKey: ["abr-purchase-orders", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/abr-purchase-orders`), { credentials: "include" }).then(r => r.json()),
  });
  const grnsQ = useQuery<{ grns: Grn[] }>({
    queryKey: ["abr-grns", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/abr-grns`), { credentials: "include" }).then(r => r.json()),
  });
  const invoicesQ = useQuery<{ invoices: Invoice[] }>({
    queryKey: ["abr-invoices", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/abr-invoices`), { credentials: "include" }).then(r => r.json()),
  });

  const suppliers = suppliersQ.data?.suppliers ?? [];
  const orders = ordersQ.data?.orders ?? [];
  const grns = grnsQ.data?.grns ?? [];
  const invoices = invoicesQ.data?.invoices ?? [];

  const unpaidInvoices = invoices.filter(i => i.paymentStatus === "unpaid" || i.paymentStatus === "overdue");
  const supplierName = (id?: number | null) => suppliers.find(s => s.id === id)?.companyName ?? null;
  const poRef = (id?: number | null) => orders.find(o => o.id === id)?.poNumber ?? null;

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm text-gray-800">ABR Kit Procurement ({suppliers.length} suppliers, {orders.length} POs)</span>
          {unpaidInvoices.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              <AlertTriangle className="h-3 w-3" />{unpaidInvoices.length} unpaid invoice{unpaidInvoices.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        {open ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
      </button>

      {open && (
        <div className="divide-y divide-gray-100">
          <SupplierSubsection farmId={farmId} suppliers={suppliers} loading={suppliersQ.isLoading} qc={qc} />
          <PurchaseOrderSubsection farmId={farmId} orders={orders} suppliers={suppliers} loading={ordersQ.isLoading} qc={qc} supplierName={supplierName} />
          <GrnSubsection farmId={farmId} grns={grns} orders={orders} loading={grnsQ.isLoading} qc={qc} poRef={poRef} />
          <InvoiceSubsection farmId={farmId} invoices={invoices} suppliers={suppliers} orders={orders} loading={invoicesQ.isLoading} qc={qc} supplierName={supplierName} poRef={poRef} />
        </div>
      )}
    </div>
  );
}

// ─── Supplier Directory ───────────────────────────────────────────────────────

function SupplierSubsection({ farmId, suppliers, loading, qc }: {
  farmId: number; suppliers: Supplier[]; loading: boolean; qc: ReturnType<typeof useQueryClient>;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(true);
  const [dlgOpen, setDlgOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState<Partial<Supplier>>({});

  const save = useMutation({
    mutationFn: (body: Partial<Supplier>) => {
      const url = editing ? api(`farms/${farmId}/dairy/abr-suppliers/${editing.id}`) : api(`farms/${farmId}/dairy/abr-suppliers`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["abr-suppliers", farmId] }); setDlgOpen(false); setEditing(null); setForm({}); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/dairy/abr-suppliers/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["abr-suppliers", farmId] }); qc.invalidateQueries({ queryKey: ["abr-purchase-orders", farmId] }); qc.invalidateQueries({ queryKey: ["abr-invoices", farmId] }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function openAdd() { setEditing(null); setForm({}); setDlgOpen(true); }
  function openEdit(s: Supplier) { setEditing(s); setForm({ ...s }); setDlgOpen(true); }
  function set(k: keyof Supplier, v: unknown) { setForm(f => ({ ...f, [k]: v })); }

  return (
    <div>
      <button
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white hover:bg-gray-50 transition-colors text-left"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Supplier Directory</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{suppliers.length}</span>
        </div>
        {open ? <ChevronDown className="h-3.5 w-3.5 text-gray-400" /> : <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin text-gray-400" /> : suppliers.length === 0
            ? <p className="text-sm text-gray-400 italic">No suppliers added yet.</p>
            : suppliers.map(s => (
              <div key={s.id} className="flex items-start justify-between rounded-md border border-gray-200 bg-white px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm text-gray-900">{s.companyName}</span>
                    {s.accountRef && <span className="text-xs text-gray-400 font-mono">Acc: {s.accountRef}</span>}
                    {s.paymentTermsDays != null && <span className="text-xs text-gray-500">{s.paymentTermsDays}-day terms</span>}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    {s.contactName && <span>{s.contactName}</span>}
                    {s.phone && <a href={`tel:${s.phone}`} className="hover:text-blue-600">{s.phone}</a>}
                    {s.email && <a href={`mailto:${s.email}`} className="hover:text-blue-600">{s.email}</a>}
                    {(s.city || s.postcode) && <span>{[s.city, s.postcode].filter(Boolean).join(", ")}</span>}
                  </div>
                </div>
                <div className="flex gap-1 ml-2 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => del.mutate(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            ))
          }
          <Button size="sm" variant="outline" onClick={openAdd}><Plus className="h-3.5 w-3.5 mr-1" />Add Supplier</Button>
        </div>
      )}

      <Dialog open={dlgOpen} onOpenChange={setDlgOpen}>
        <DialogContent style={{ maxWidth: "44rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Supplier" : "Add Supplier"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2"><Label>Company Name *</Label><Input placeholder="e.g. Neogen Europe Ltd" value={form.companyName || ""} onChange={e => set("companyName", e.target.value)} /></div>
            <div><Label>Contact Name</Label><Input placeholder="Account manager" value={form.contactName || ""} onChange={e => set("contactName", e.target.value)} /></div>
            <div><Label>Account Reference</Label><Input placeholder="Your account number" value={form.accountRef || ""} onChange={e => set("accountRef", e.target.value)} /></div>
            <div><Label>Phone</Label><Input type="tel" placeholder="01234 567890" value={form.phone || ""} onChange={e => set("phone", e.target.value)} /></div>
            <div><Label>Email</Label><Input type="email" placeholder="orders@supplier.co.uk" value={form.email || ""} onChange={e => set("email", e.target.value)} /></div>
            <div className="col-span-2"><Label>Address Line 1</Label><Input value={form.addressLine1 || ""} onChange={e => set("addressLine1", e.target.value)} /></div>
            <div><Label>Address Line 2</Label><Input value={form.addressLine2 || ""} onChange={e => set("addressLine2", e.target.value)} /></div>
            <div><Label>City / Town</Label><Input value={form.city || ""} onChange={e => set("city", e.target.value)} /></div>
            <div><Label>Postcode</Label><Input value={form.postcode || ""} onChange={e => set("postcode", e.target.value)} /></div>
            <div><Label>Payment Terms (days)</Label><Input type="number" min="0" placeholder="30" value={form.paymentTermsDays ?? ""} onChange={e => set("paymentTermsDays", e.target.value ? parseInt(e.target.value) : null)} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={form.notes || ""} onChange={e => set("notes", e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDlgOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending || !form.companyName?.trim()}>
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {editing ? "Save Changes" : "Add Supplier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Purchase Orders ──────────────────────────────────────────────────────────

function PurchaseOrderSubsection({ farmId, orders, suppliers, loading, qc, supplierName }: {
  farmId: number; orders: PurchaseOrder[]; suppliers: Supplier[];
  loading: boolean; qc: ReturnType<typeof useQueryClient>;
  supplierName: (id?: number | null) => string | null;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(true);
  const [dlgOpen, setDlgOpen] = useState(false);
  const [editing, setEditing] = useState<PurchaseOrder | null>(null);
  const [form, setForm] = useState<Omit<Partial<PurchaseOrder>, "items">>({});
  const [lineItems, setLineItems] = useState<Partial<PoItem>[]>([]);
  const [expandedPo, setExpandedPo] = useState<number | null>(null);
  const [itemDlg, setItemDlg] = useState<{ poId: number; item?: PoItem } | null>(null);
  const [itemForm, setItemForm] = useState<Partial<PoItem>>({});

  const save = useMutation({
    mutationFn: (body: Omit<Partial<PurchaseOrder>, "items"> & { items?: Partial<PoItem>[] }) => {
      const url = editing ? api(`farms/${farmId}/dairy/abr-purchase-orders/${editing.id}`) : api(`farms/${farmId}/dairy/abr-purchase-orders`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["abr-purchase-orders", farmId] }); setDlgOpen(false); setEditing(null); setForm({}); setLineItems([]); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/dairy/abr-purchase-orders/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["abr-purchase-orders", farmId] }); qc.invalidateQueries({ queryKey: ["abr-grns", farmId] }); qc.invalidateQueries({ queryKey: ["abr-invoices", farmId] }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const saveItem = useMutation({
    mutationFn: (body: Partial<PoItem> & { poId: number }) => {
      const url = body.id ? api(`farms/${farmId}/dairy/abr-po-items/${body.id}`) : api(`farms/${farmId}/dairy/abr-purchase-orders/${body.poId}/items`);
      return fetch(url, { method: body.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["abr-purchase-orders", farmId] }); setItemDlg(null); setItemForm({}); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const delItem = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/dairy/abr-po-items/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["abr-purchase-orders", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function openAdd() { setEditing(null); setForm({ orderDate: today(), status: "draft" }); setLineItems([{ productName: "", quantityOrdered: 1 }]); setDlgOpen(true); }
  function openEdit(o: PurchaseOrder) { setEditing(o); setForm({ ...o }); setLineItems([]); setDlgOpen(true); }
  function set(k: keyof PurchaseOrder, v: unknown) { setForm(f => ({ ...f, [k]: v })); }

  const lineTotal = (items: Partial<PoItem>[]) => items.reduce((sum, it) => sum + ((it.unitPricePence ?? 0) * (it.quantityOrdered ?? 1)), 0);

  function addLineItem() { setLineItems(l => [...l, { productName: "", quantityOrdered: 1 }]); }
  function removeLineItem(i: number) { setLineItems(l => l.filter((_, idx) => idx !== i)); }
  function setLineItem(i: number, k: keyof PoItem, v: unknown) { setLineItems(l => l.map((it, idx) => idx === i ? { ...it, [k]: v } : it)); }

  return (
    <div>
      <button className="w-full flex items-center justify-between px-4 py-2.5 bg-white hover:bg-gray-50 transition-colors text-left" onClick={() => setOpen(o => !o)}>
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Purchase Orders</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{orders.length}</span>
        </div>
        {open ? <ChevronDown className="h-3.5 w-3.5 text-gray-400" /> : <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin text-gray-400" /> : orders.length === 0
            ? <p className="text-sm text-gray-400 italic">No purchase orders yet.</p>
            : orders.map(o => {
              const isExpanded = expandedPo === o.id;
              const sName = supplierName(o.supplierId);
              const itemTotal = lineTotal(o.items);
              return (
                <div key={o.id} className="rounded-md border border-gray-200 bg-white overflow-hidden">
                  <div className="flex items-start justify-between px-3 py-2.5">
                    <button className="flex-1 text-left" onClick={() => setExpandedPo(isExpanded ? null : o.id)}>
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <span className="font-medium text-sm text-gray-900 font-mono">{o.poNumber}</span>
                        <PoBadge status={o.status} />
                        {sName && <span className="text-xs text-gray-500">{sName}</span>}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        <span>Ordered: {formatDate(o.orderDate)}</span>
                        {o.expectedDeliveryDate && <span>Expected: {formatDate(o.expectedDeliveryDate)}</span>}
                        {o.items.length > 0 && <span>{o.items.length} line item{o.items.length !== 1 ? "s" : ""}</span>}
                        {itemTotal > 0 && <span className="font-medium text-gray-700">Est. {penceToGBP(itemTotal)}</span>}
                      </div>
                    </button>
                    <div className="flex gap-1 ml-2 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(o)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => del.mutate(o.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="border-t border-gray-100 px-3 py-2 bg-gray-50 space-y-1.5">
                      {o.items.length === 0
                        ? <p className="text-xs text-gray-400 italic">No line items.</p>
                        : (
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-gray-500">
                                <th className="text-left font-medium py-0.5">Product</th>
                                <th className="text-right font-medium py-0.5">Qty</th>
                                <th className="text-right font-medium py-0.5">Unit price</th>
                                <th className="text-right font-medium py-0.5">Line total</th>
                                <th className="w-12"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {o.items.map(it => (
                                <tr key={it.id} className="border-t border-gray-100">
                                  <td className="py-1 pr-2 text-gray-800">{it.productName}</td>
                                  <td className="py-1 text-right text-gray-700">{it.quantityOrdered}</td>
                                  <td className="py-1 text-right text-gray-700">{it.unitPricePence != null ? penceToGBP(it.unitPricePence) : "—"}</td>
                                  <td className="py-1 text-right font-medium text-gray-800">{it.unitPricePence != null ? penceToGBP(it.unitPricePence * it.quantityOrdered) : "—"}</td>
                                  <td className="py-1 text-right">
                                    <div className="flex gap-0.5 justify-end">
                                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setItemDlg({ poId: o.id, item: it }); setItemForm({ ...it }); }}><Pencil className="h-3 w-3" /></Button>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600" onClick={() => delItem.mutate(it.id)}><Trash2 className="h-3 w-3" /></Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            {o.items.some(it => it.unitPricePence != null) && (
                              <tfoot>
                                <tr className="border-t border-gray-200">
                                  <td colSpan={3} className="py-1 text-right text-xs font-medium text-gray-600">Total estimated value</td>
                                  <td className="py-1 text-right text-xs font-bold text-gray-900">{penceToGBP(itemTotal)}</td>
                                  <td></td>
                                </tr>
                              </tfoot>
                            )}
                          </table>
                        )
                      }
                      <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => { setItemDlg({ poId: o.id }); setItemForm({ productName: "", quantityOrdered: 1 }); }}>
                        <Plus className="h-3 w-3 mr-1" />Add line item
                      </Button>
                      {o.notes && <p className="text-xs text-gray-500 italic mt-1">Note: {o.notes}</p>}
                    </div>
                  )}
                </div>
              );
            })
          }
          <Button size="sm" variant="outline" onClick={openAdd}><Plus className="h-3.5 w-3.5 mr-1" />New Purchase Order</Button>
        </div>
      )}

      {/* PO Add/Edit dialog */}
      <Dialog open={dlgOpen} onOpenChange={setDlgOpen}>
        <DialogContent style={{ maxWidth: "46rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Purchase Order" : "New Purchase Order"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>PO Number *</Label><Input placeholder="e.g. PO-2026-001" value={form.poNumber || ""} onChange={e => set("poNumber", e.target.value)} /></div>
              <div>
                <Label>Status</Label>
                <Select value={form.status || "draft"} onValueChange={v => set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent to supplier</SelectItem>
                    <SelectItem value="part-received">Part received</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Supplier</Label>
                <Select value={form.supplierId?.toString() || ""} onValueChange={v => set("supplierId", v ? parseInt(v) : null)}>
                  <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                  <SelectContent>
                    {suppliers.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.companyName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Order Date *</Label><Input type="date" value={form.orderDate || today()} onChange={e => set("orderDate", e.target.value)} /></div>
              <div><Label>Expected Delivery</Label><Input type="date" value={form.expectedDeliveryDate || ""} onChange={e => set("expectedDeliveryDate", e.target.value || null)} /></div>
            </div>

            {!editing && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Line Items</Label>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={addLineItem}><Plus className="h-3 w-3 mr-1" />Add item</Button>
                </div>
                <div className="space-y-2">
                  {lineItems.map((it, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5"><Label className="text-xs">Product</Label><Input className="h-8 text-sm" placeholder="Product name" value={it.productName || ""} onChange={e => setLineItem(i, "productName", e.target.value)} /></div>
                      <div className="col-span-2"><Label className="text-xs">Qty</Label><Input className="h-8 text-sm" type="number" min="1" value={it.quantityOrdered ?? 1} onChange={e => setLineItem(i, "quantityOrdered", parseInt(e.target.value) || 1)} /></div>
                      <div className="col-span-3"><Label className="text-xs">Unit price (£)</Label><Input className="h-8 text-sm" type="number" min="0" step="0.01" placeholder="0.00" value={it.unitPricePence != null ? (it.unitPricePence / 100).toFixed(2) : ""} onChange={e => setLineItem(i, "unitPricePence", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null)} /></div>
                      <div className="col-span-2 flex justify-end pb-0.5">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400" onClick={() => removeLineItem(i)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  ))}
                  {lineItems.length === 0 && <p className="text-xs text-gray-400 italic">No line items yet — add items above.</p>}
                  {lineTotal(lineItems) > 0 && (
                    <div className="text-right text-sm font-medium text-gray-700">Estimated total: {penceToGBP(lineTotal(lineItems))}</div>
                  )}
                </div>
              </div>
            )}

            <div><Label>Notes</Label><Textarea rows={2} value={form.notes || ""} onChange={e => set("notes", e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDlgOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate({ ...form, items: editing ? undefined : lineItems.filter(it => it.productName?.trim()) })} disabled={save.isPending || !form.poNumber?.trim() || !form.orderDate}>
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {editing ? "Save Changes" : "Create PO"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Line item add/edit dialog */}
      <Dialog open={!!itemDlg} onOpenChange={o => { if (!o) { setItemDlg(null); setItemForm({}); } }}>
        <DialogContent style={{ maxWidth: "36rem" }}>
          <DialogHeader><DialogTitle>{itemDlg?.item ? "Edit Line Item" : "Add Line Item"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2"><Label>Product Name *</Label><Input placeholder="e.g. Delvotest Accelerator kit (50)" value={itemForm.productName || ""} onChange={e => setItemForm(f => ({ ...f, productName: e.target.value }))} /></div>
            <div><Label>Quantity Ordered</Label><Input type="number" min="1" value={itemForm.quantityOrdered ?? 1} onChange={e => setItemForm(f => ({ ...f, quantityOrdered: parseInt(e.target.value) || 1 }))} /></div>
            <div><Label>Unit Price (£)</Label><Input type="number" min="0" step="0.01" placeholder="0.00" value={itemForm.unitPricePence != null ? (itemForm.unitPricePence / 100).toFixed(2) : ""} onChange={e => setItemForm(f => ({ ...f, unitPricePence: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null }))} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={itemForm.notes || ""} onChange={e => setItemForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setItemDlg(null); setItemForm({}); }}>Cancel</Button>
            <Button onClick={() => saveItem.mutate({ ...itemForm, poId: itemDlg!.poId, id: itemDlg?.item?.id } as PoItem & { poId: number })} disabled={saveItem.isPending || !itemForm.productName?.trim()}>
              {saveItem.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {itemDlg?.item ? "Save Changes" : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Goods Received Notes ─────────────────────────────────────────────────────

function GrnSubsection({ farmId, grns, orders, loading, qc, poRef }: {
  farmId: number; grns: Grn[]; orders: PurchaseOrder[];
  loading: boolean; qc: ReturnType<typeof useQueryClient>;
  poRef: (id?: number | null) => string | null;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(true);
  const [dlgOpen, setDlgOpen] = useState(false);
  const [editing, setEditing] = useState<Grn | null>(null);
  const [form, setForm] = useState<Partial<Grn>>({});

  const save = useMutation({
    mutationFn: (body: Partial<Grn>) => {
      const url = editing ? api(`farms/${farmId}/dairy/abr-grns/${editing.id}`) : api(`farms/${farmId}/dairy/abr-grns`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["abr-grns", farmId] }); setDlgOpen(false); setEditing(null); setForm({}); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/dairy/abr-grns/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["abr-grns", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function openAdd() { setEditing(null); setForm({ receivedDate: today(), conditionOnArrival: "good" }); setDlgOpen(true); }
  function openEdit(g: Grn) { setEditing(g); setForm({ ...g }); setDlgOpen(true); }
  function set(k: keyof Grn, v: unknown) { setForm(f => ({ ...f, [k]: v })); }

  return (
    <div>
      <button className="w-full flex items-center justify-between px-4 py-2.5 bg-white hover:bg-gray-50 transition-colors text-left" onClick={() => setOpen(o => !o)}>
        <div className="flex items-center gap-2">
          <PackageCheck className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Goods Received Notes</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{grns.length}</span>
        </div>
        {open ? <ChevronDown className="h-3.5 w-3.5 text-gray-400" /> : <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin text-gray-400" /> : grns.length === 0
            ? <p className="text-sm text-gray-400 italic">No goods received notes yet.</p>
            : grns.map(g => {
              const po = poRef(g.poId);
              return (
                <div key={g.id} className="flex items-start justify-between rounded-md border border-gray-200 bg-white px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      {g.grnNumber && <span className="font-medium text-sm text-gray-900 font-mono">{g.grnNumber}</span>}
                      <GrnConditionBadge condition={g.conditionOnArrival} />
                      {po && <span className="text-xs text-gray-500">PO: {po}</span>}
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span>Received: {formatDate(g.receivedDate)}</span>
                      {g.receivedBy && <span>By: {g.receivedBy}</span>}
                      {g.notes && <span className="italic">{g.notes}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(g)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => del.mutate(g.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              );
            })
          }
          <Button size="sm" variant="outline" onClick={openAdd}><Plus className="h-3.5 w-3.5 mr-1" />Add GRN</Button>
        </div>
      )}

      <Dialog open={dlgOpen} onOpenChange={setDlgOpen}>
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit GRN" : "Add Goods Received Note"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div><Label>GRN Number</Label><Input placeholder="e.g. GRN-2026-001" value={form.grnNumber || ""} onChange={e => set("grnNumber", e.target.value)} /></div>
            <div><Label>Received Date *</Label><Input type="date" value={form.receivedDate || today()} onChange={e => set("receivedDate", e.target.value)} /></div>
            <div>
              <Label>Linked Purchase Order</Label>
              <Select value={form.poId?.toString() || ""} onValueChange={v => set("poId", v ? parseInt(v) : null)}>
                <SelectTrigger><SelectValue placeholder="Select PO (optional)" /></SelectTrigger>
                <SelectContent>
                  {orders.map(o => <SelectItem key={o.id} value={o.id.toString()}>{o.poNumber}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Received By</Label><Input placeholder="Name of person who received" value={form.receivedBy || ""} onChange={e => set("receivedBy", e.target.value)} /></div>
            <div className="col-span-2">
              <Label>Condition on Arrival</Label>
              <Select value={form.conditionOnArrival || ""} onValueChange={v => set("conditionOnArrival", v)}>
                <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="good">Good condition</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                  <SelectItem value="partial">Partial delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={form.notes || ""} onChange={e => set("notes", e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDlgOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending || !form.receivedDate}>
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {editing ? "Save Changes" : "Add GRN"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

function InvoiceSubsection({ farmId, invoices, suppliers, orders, loading, qc, supplierName, poRef }: {
  farmId: number; invoices: Invoice[]; suppliers: Supplier[]; orders: PurchaseOrder[];
  loading: boolean; qc: ReturnType<typeof useQueryClient>;
  supplierName: (id?: number | null) => string | null;
  poRef: (id?: number | null) => string | null;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(true);
  const [dlgOpen, setDlgOpen] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [form, setForm] = useState<Partial<Invoice>>({});

  const save = useMutation({
    mutationFn: (body: Partial<Invoice>) => {
      const url = editing ? api(`farms/${farmId}/dairy/abr-invoices/${editing.id}`) : api(`farms/${farmId}/dairy/abr-invoices`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["abr-invoices", farmId] }); setDlgOpen(false); setEditing(null); setForm({}); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/dairy/abr-invoices/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["abr-invoices", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function openAdd() { setEditing(null); setForm({ invoiceDate: today(), paymentStatus: "unpaid" }); setDlgOpen(true); }
  function openEdit(inv: Invoice) { setEditing(inv); setForm({ ...inv }); setDlgOpen(true); }
  function set(k: keyof Invoice, v: unknown) { setForm(f => ({ ...f, [k]: v })); }

  const totalOutstanding = invoices.filter(i => i.paymentStatus !== "paid").reduce((sum, i) => sum + (i.grossAmountPence ?? 0), 0);
  const totalPaid = invoices.filter(i => i.paymentStatus === "paid").reduce((sum, i) => sum + (i.grossAmountPence ?? 0), 0);

  return (
    <div>
      <button className="w-full flex items-center justify-between px-4 py-2.5 bg-white hover:bg-gray-50 transition-colors text-left" onClick={() => setOpen(o => !o)}>
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Invoices</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{invoices.length}</span>
          {totalOutstanding > 0 && <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">{penceToGBP(totalOutstanding)} outstanding</span>}
        </div>
        {open ? <ChevronDown className="h-3.5 w-3.5 text-gray-400" /> : <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2">
          {invoices.length > 1 && (totalOutstanding > 0 || totalPaid > 0) && (
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="bg-amber-50 border border-amber-100 rounded-md px-3 py-2">
                <div className="text-xs text-amber-600 font-medium">Outstanding</div>
                <div className="text-base font-bold text-amber-800">{penceToGBP(totalOutstanding)}</div>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-md px-3 py-2">
                <div className="text-xs text-green-600 font-medium">Total paid</div>
                <div className="text-base font-bold text-green-800">{penceToGBP(totalPaid)}</div>
              </div>
            </div>
          )}
          {loading ? <Loader2 className="h-4 w-4 animate-spin text-gray-400" /> : invoices.length === 0
            ? <p className="text-sm text-gray-400 italic">No invoices recorded yet.</p>
            : invoices.map(inv => {
              const sName = supplierName(inv.supplierId);
              const po = poRef(inv.poId);
              const isOverdue = inv.paymentStatus === "unpaid" && inv.dueDate && new Date(inv.dueDate) < new Date();
              const effectiveStatus = isOverdue ? "overdue" : inv.paymentStatus;
              return (
                <div key={inv.id} className={`flex items-start justify-between rounded-md border px-3 py-2.5 ${effectiveStatus === "overdue" ? "border-red-200 bg-red-50" : effectiveStatus === "paid" ? "border-green-100 bg-white" : "border-gray-200 bg-white"}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="font-medium text-sm text-gray-900 font-mono">{inv.invoiceNumber}</span>
                      <InvoiceBadge status={effectiveStatus} />
                      {sName && <span className="text-xs text-gray-500">{sName}</span>}
                      {po && <span className="text-xs text-gray-400">PO: {po}</span>}
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span>Dated: {formatDate(inv.invoiceDate)}</span>
                      {inv.dueDate && <span className={effectiveStatus === "overdue" ? "text-red-600 font-medium" : ""}>Due: {formatDate(inv.dueDate)}</span>}
                      {inv.grossAmountPence != null && <span className="font-medium text-gray-700">{penceToGBP(inv.grossAmountPence)}</span>}
                      {inv.netAmountPence != null && <span>Net: {penceToGBP(inv.netAmountPence)}</span>}
                      {inv.vatAmountPence != null && <span>VAT: {penceToGBP(inv.vatAmountPence)}</span>}
                      {inv.paymentDate && <span className="text-green-600">Paid: {formatDate(inv.paymentDate)}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(inv)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => del.mutate(inv.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              );
            })
          }
          <Button size="sm" variant="outline" onClick={openAdd}><Plus className="h-3.5 w-3.5 mr-1" />Add Invoice</Button>
        </div>
      )}

      <Dialog open={dlgOpen} onOpenChange={setDlgOpen}>
        <DialogContent style={{ maxWidth: "46rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Invoice" : "Add Invoice"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div><Label>Invoice Number *</Label><Input placeholder="e.g. INV-12345" value={form.invoiceNumber || ""} onChange={e => set("invoiceNumber", e.target.value)} /></div>
            <div>
              <Label>Payment Status</Label>
              <Select value={form.paymentStatus || "unpaid"} onValueChange={v => set("paymentStatus", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="part-paid">Part paid</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Supplier</Label>
              <Select value={form.supplierId?.toString() || ""} onValueChange={v => set("supplierId", v ? parseInt(v) : null)}>
                <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                <SelectContent>
                  {suppliers.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.companyName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Linked PO</Label>
              <Select value={form.poId?.toString() || ""} onValueChange={v => set("poId", v ? parseInt(v) : null)}>
                <SelectTrigger><SelectValue placeholder="Select PO (optional)" /></SelectTrigger>
                <SelectContent>
                  {orders.map(o => <SelectItem key={o.id} value={o.id.toString()}>{o.poNumber}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Invoice Date *</Label><Input type="date" value={form.invoiceDate || today()} onChange={e => set("invoiceDate", e.target.value)} /></div>
            <div><Label>Due Date</Label><Input type="date" value={form.dueDate || ""} onChange={e => set("dueDate", e.target.value || null)} /></div>
            <div><Label>Net Amount (£)</Label><Input type="number" min="0" step="0.01" placeholder="0.00" value={form.netAmountPence != null ? (form.netAmountPence / 100).toFixed(2) : ""} onChange={e => { const net = e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null; set("netAmountPence", net); if (net != null && form.vatAmountPence != null) set("grossAmountPence", net + form.vatAmountPence); }} /></div>
            <div><Label>VAT Amount (£)</Label><Input type="number" min="0" step="0.01" placeholder="0.00" value={form.vatAmountPence != null ? (form.vatAmountPence / 100).toFixed(2) : ""} onChange={e => { const vat = e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null; set("vatAmountPence", vat); if (vat != null && form.netAmountPence != null) set("grossAmountPence", form.netAmountPence + vat); }} /></div>
            <div><Label>Gross / Total (£)</Label><Input type="number" min="0" step="0.01" placeholder="0.00" value={form.grossAmountPence != null ? (form.grossAmountPence / 100).toFixed(2) : ""} onChange={e => set("grossAmountPence", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null)} /></div>
            {(form.paymentStatus === "paid" || form.paymentStatus === "part-paid") && (
              <>
                <div><Label>Payment Date</Label><Input type="date" value={form.paymentDate || ""} onChange={e => set("paymentDate", e.target.value || null)} /></div>
                <div><Label>Payment Reference</Label><Input placeholder="e.g. BACS ref, cheque no." value={form.paymentReference || ""} onChange={e => set("paymentReference", e.target.value)} /></div>
              </>
            )}
            <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={form.notes || ""} onChange={e => set("notes", e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDlgOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending || !form.invoiceNumber?.trim() || !form.invoiceDate}>
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {editing ? "Save Changes" : "Add Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
