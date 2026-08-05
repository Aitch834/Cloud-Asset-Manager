import React, { useState, useRef, useMemo } from "react";
import { canonicalHerdSpecies, herdSpeciesDisplayLabel, herdProductionSubtype } from "@/lib/herd-utils";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import { MortalitySection } from "./MortalitySection";
import { useLookupStrings } from "@/hooks/use-lookup";
import { useAppStore } from "@/hooks/use-app-store";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { usePersistedFilter } from "@/hooks/use-persisted-filter";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Redirect } from "wouter";
import { Plus, Search, Loader2, Pencil, Trash2, ClipboardList, Stethoscope, CheckCircle2, Printer, AlertTriangle, Package, Droplets, XCircle, FileText, Upload, Paperclip, QrCode, Eye, FlaskConical, ClipboardCheck, Clock, ListChecks, BookOpen, ChevronDown, ChevronUp, RotateCcw, FileDown, Truck, BarChart3, Syringe } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useUpload } from "@workspace/object-storage-web";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { printProReport, openPrintWindow, buildProReport } from "@/lib/print-report";
import { LabSelector } from "@/components/ui/LabSelector";
import { useFarmMembers, memberFullName } from "@/hooks/use-farm-members";
import { StaffSelect } from "@/components/ui/staff-select";

import { formatDate, formatDateLong, ConfirmDialog, PRODUCTION_TYPE_OPTIONS, EMPTY_SIRE, EMPTY_STRAW, EMPTY_HERD, EMPTY_PLAN, EMPTY_ANIMAL, PrintHerdRegisterDialog, PrintVetPlanDialog, getHerdNumberConfig, getBreedPlaceholder, getHerdNamePlaceholder, ANIMAL_SPECIES_FALLBACK, ANIMAL_STATUS_LABELS, MOVEMENT_TYPE_LABELS, OUTCOME_COLOURS, DOC_TYPE_LABELS } from "./shared";
import type { Farm, Herd, VetHealthPlan, VetHealthPlanActionCompletion, VetHealthPlanAction, MortalityRecord, FallenStockContractor, FeedRecord, WaterRecord, Animal, Sire, StrawInventory, AnimalDoc, VaccHistoryRecord, AnimalProfile } from "./shared";

const CONTRACTOR_TYPES: Record<string, string> = {
  "nfas-collector": "NFAS Fallen Stock Collector",
  "hunt-kennel": "Hunt Kennel",
  "knacker": "Knacker / Slaughterer",
  "rendering": "Rendering Plant",
  "incinerator": "Licensed Incinerator",
  "other": "Other",
};

const FEED_TYPE_LABELS: Record<string, string> = {
  "compound-pellets": "Compound Pellets", "rolled-barley": "Rolled Barley",
  "wholecrop-silage": "Wholecrop Silage", "grass-silage": "Grass Silage",
  "maize-silage": "Maize Silage", hay: "Hay", straw: "Straw (feed)",
  "sugar-beet-pulp": "Sugar Beet Pulp", "distillers-grains": "Distillers' Grains",
  "soya-meal": "Soya Meal", "rape-meal": "Rape Meal", minerals: "Minerals / Boluses",
  "creep-feed": "Creep Feed", "milk-replacer": "Milk Replacer",
  "total-mixed-ration": "TMR", other: "Other",
};

const EMPTY_FEED = {
  feedType: "", supplier: "", batchNumber: "", quantityKg: "",
  feedDate: new Date().toISOString().slice(0, 10), notes: "",
  herdId: "", feedStockItemId: "", deliveryId: "",
};

export function FallenStockContractorsSection({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FallenStockContractor | null>(null);
  const [form, setForm] = useState({ name: "", approvalNumber: "", operatorType: "nfas-collector", contactName: "", phone: "", email: "", notes: "" });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: contractors = [], isLoading } = useQuery<FallenStockContractor[]>({
    queryKey: ["fallen-stock-contractors", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fallen-stock-contractors`).then(r => r.json()),
  });

  function setF(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  const createMut = useMutation({
    mutationFn: (body: typeof form) => fetch(`/api/farms/${farmId}/fallen-stock-contractors`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["fallen-stock-contractors", farmId] }); setShowForm(false); setForm({ name: "", approvalNumber: "", operatorType: "nfas-collector", contactName: "", phone: "", email: "", notes: "" }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const updateMut = useMutation({
    mutationFn: (body: typeof form & { id: number }) => fetch(`/api/farms/${farmId}/fallen-stock-contractors/${body.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["fallen-stock-contractors", farmId] }); setEditing(null); setShowForm(false); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => fetch(`/api/farms/${farmId}/fallen-stock-contractors/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive }) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fallen-stock-contractors", farmId] }),
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/fallen-stock-contractors/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["fallen-stock-contractors", farmId] }); setDeleteId(null); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function openEdit(c: FallenStockContractor) {
    setEditing(c);
    setForm({ name: c.name, approvalNumber: c.approvalNumber, operatorType: c.operatorType, contactName: c.contactName ?? "", phone: c.phone ?? "", email: c.email ?? "", notes: c.notes ?? "" });
    setShowForm(true);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4 gap-4">
        <div>
          <h3 className="font-semibold text-gray-900">Fallen Stock Collectors &amp; Disposal Operators</h3>
          <p className="text-sm text-gray-500 mt-0.5">APHA-approved collection and disposal operators for animal by-products only. These are not general suppliers or hauliers — add those in Trade Contacts &amp; Stock.</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm({ name: "", approvalNumber: "", operatorType: "nfas-collector", contactName: "", phone: "", email: "", notes: "" }); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add Collector
        </Button>
      </div>

      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
        <strong>Regulatory note:</strong> Under the Animal By-Products Regulations, fallen stock must be collected by an APHA-approved operator. Record their official approval/registration number here so it appears automatically on every mortality record — this is the evidence inspectors will check.<br /><br />
        <strong>If a collector also provides other services</strong> (e.g. stock haulage, feed delivery), add them separately as a Trade Contact in <em>Trade Contacts &amp; Stock</em> so that invoices and purchase orders for those services are kept distinct from fallen stock disposal records. Use exactly the same company name in both places to make reconciliation straightforward.
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>
      ) : contractors.length === 0 ? (
        <Card><CardContent className="py-16 text-center">
          <AlertTriangle className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="font-medium text-gray-700 mb-1">No contractors added yet</p>
          <p className="text-sm text-muted-foreground">Add your fallen stock collectors and disposal operators so they appear on mortality records.</p>
        </CardContent></Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Contractor</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">APHA Approval No.</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Contact</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {contractors.map(c => (
                <tr key={c.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{c.name}</div>
                    {c.email && <div className="text-xs text-muted-foreground">{c.email}</div>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{CONTRACTOR_TYPES[c.operatorType] ?? c.operatorType}</td>
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">{c.approvalNumber}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{[c.contactName, c.phone].filter(Boolean).join(" · ") || "—"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive.mutate({ id: c.id, isActive: !c.isActive })}
                      className={`inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5 font-medium transition-colors ${c.isActive ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                      {c.isActive ? <><CheckCircle2 className="h-3 w-3" /> Active</> : <><XCircle className="h-3 w-3" /> Inactive</>}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(c)}><Pencil className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteId(c.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Dialog open onOpenChange={o => { if (!o) { setShowForm(false); setEditing(null); createMut.reset(); updateMut.reset(); } }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Fallen Stock Collector" : "Add Fallen Stock Collector"}</DialogTitle>
              <DialogDescription>Record the contractor's APHA approval number for audit compliance.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="col-span-2">
                <Label>Contractor / Company Name *</Label>
                <Input value={form.name} onChange={e => setF("name", e.target.value)} placeholder="e.g. ABC Fallen Stock Services Ltd" required />
              </div>
              <div className="col-span-2">
                <Label>APHA Approval / Registration Number *</Label>
                <Input value={form.approvalNumber} onChange={e => setF("approvalNumber", e.target.value)} placeholder="e.g. ABP-XXXX-XXXX" required className="font-mono" />
                <p className="text-xs text-gray-400 mt-1">Required under Animal By-Products Regulations. Available on operator's APHA certificate.</p>
              </div>
              <div>
                <Label>Operator Type</Label>
                <Select value={form.operatorType} onValueChange={v => setF("operatorType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CONTRACTOR_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Contact Name</Label><Input value={form.contactName} onChange={e => setF("contactName", e.target.value)} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setF("phone", e.target.value)} type="tel" /></div>
              <div><Label>Email</Label><Input value={form.email} onChange={e => setF("email", e.target.value)} type="email" /></div>
              <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setF("notes", e.target.value)} rows={2} /></div>
            </div>
            <DialogMutationError mutation={createMut} message="Failed to save — your entries are still here." />
            <DialogMutationError mutation={updateMut} message="Failed to save — your entries are still here." />
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
              <Button onClick={() => editing ? updateMut.mutate({ ...form, id: editing.id }) : createMut.mutate(form)}
                disabled={!form.name || !form.approvalNumber || createMut.isPending || updateMut.isPending}>
                {(createMut.isPending || updateMut.isPending) ? <Loader2 className="animate-spin h-4 w-4 mr-1" /> : null}
                {editing ? "Update" : "Add Collector"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {deleteId !== null && (
        <Dialog open onOpenChange={o => { if (!o) { setDeleteId(null); deleteMut.reset(); } }}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Remove Fallen Stock Collector?</DialogTitle><DialogDescription>This will remove them from the register. Existing mortality records won't be affected.</DialogDescription></DialogHeader>
            <DialogMutationError mutation={deleteMut} message="Failed to remove — please try again." />
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deleteMut.mutate(deleteId!)} disabled={deleteMut.isPending}>
                {deleteMut.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Remove"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export function FeedSection({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const base = `/api/farms/${farmId}/feed-records`;

  const { data, isLoading } = useQuery<{ records: FeedRecord[] }>({
    queryKey: ["feed-records", farmId],
    queryFn: () => fetch(base).then(r => r.json()),
  });
  const records = data?.records ?? [];

  const { data: herdsData } = useQuery<{ records: any[] }>({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/herds`).then(r => r.json()),
  });
  const herds: any[] = herdsData?.records ?? [];

  const { data: feedBinsData } = useQuery<{ records: any[] }>({
    queryKey: ["feed-stock", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/feed-stock`).then(r => r.json()),
  });
  const feedBins: any[] = feedBinsData?.records ?? [];

  const { data: deliveriesData } = useQuery<{ records: any[] }>({
    queryKey: ["feed-deliveries", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/feed-deliveries`).then(r => r.json()),
  });
  const allDeliveries: any[] = deliveriesData?.records ?? [];

  const [search, setSearch] = useState("");
  const [yearFilterFeed, setYearFilterFeed] = usePersistedFilter({ page: "livestock-feed", filter: "year", farmId, defaultValue: "all", isValid: v => v === "all" || /^\d{4}$/.test(v) });
  const yearsFeed = useMemo(() => Array.from(new Set(records.map(r => String(r.feedDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [records]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FeedRecord | null>(null);
  const [form, setForm] = useState(EMPTY_FEED);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  function setField(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  const binDeliveries = form.feedStockItemId
    ? allDeliveries.filter((d: any) => String(d.feedStockItemId) === String(form.feedStockItemId))
    : allDeliveries;

  const herdMap = Object.fromEntries(herds.map((h: any) => [h.id, h.name]));
  const binMap = Object.fromEntries(feedBins.map((b: any) => [b.id, b]));

  const createMut = useMutation({
    mutationFn: (body: typeof EMPTY_FEED) => {
      const payload: any = { ...body };
      if (!payload.feedStockItemId) delete payload.feedStockItemId; else payload.feedStockItemId = Number(payload.feedStockItemId);
      if (!payload.deliveryId) delete payload.deliveryId; else payload.deliveryId = Number(payload.deliveryId);
      if (!payload.herdId) delete payload.herdId; else payload.herdId = Number(payload.herdId);
      return fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["feed-records", farmId] }); qc.invalidateQueries({ queryKey: ["feed-stock", farmId] }); setShowForm(false); setForm(EMPTY_FEED); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const updateMut = useMutation({
    mutationFn: (body: typeof EMPTY_FEED & { id: number }) => {
      const payload: any = { ...body };
      if (!payload.feedStockItemId) delete payload.feedStockItemId; else payload.feedStockItemId = Number(payload.feedStockItemId);
      if (!payload.deliveryId) delete payload.deliveryId; else payload.deliveryId = Number(payload.deliveryId);
      if (!payload.herdId) delete payload.herdId; else payload.herdId = Number(payload.herdId);
      return fetch(`${base}/${body.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["feed-records", farmId] }); qc.invalidateQueries({ queryKey: ["feed-stock", farmId] }); setEditing(null); setShowForm(false); setForm(EMPTY_FEED); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`${base}/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["feed-records", farmId] }); qc.invalidateQueries({ queryKey: ["feed-stock", farmId] }); setDeleteId(null); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function openEdit(r: FeedRecord) {
    setEditing(r);
    setForm({
      feedType: r.feedType,
      supplier: r.supplier ?? "",
      batchNumber: r.batchNumber ?? "",
      quantityKg: r.quantityKg ?? "",
      feedDate: r.feedDate?.slice(0, 10) ?? "",
      notes: r.notes ?? "",
      herdId: r.herdId ? String(r.herdId) : "",
      feedStockItemId: r.feedStockItemId ? String(r.feedStockItemId) : "",
      deliveryId: r.deliveryId ? String(r.deliveryId) : "",
    });
    setShowForm(true);
  }

  function handleBinSelect(binId: string) {
    if (binId === "__none__") {
      setForm(f => ({ ...f, feedStockItemId: "", deliveryId: "" }));
      return;
    }
    const bin = feedBins.find((b: any) => String(b.id) === binId);
    setForm(f => ({
      ...f,
      feedStockItemId: binId,
      deliveryId: "",
      feedType: bin?.feedType ?? f.feedType,
    }));
  }

  function handleDeliverySelect(delivId: string) {
    if (delivId === "__none__") { setForm(f => ({ ...f, deliveryId: "" })); return; }
    const d = allDeliveries.find((x: any) => String(x.id) === delivId);
    setForm(f => ({
      ...f,
      deliveryId: delivId,
      supplier: d?.supplierName ?? f.supplier,
      batchNumber: d?.batchNumber ?? d?.lotNumber ?? f.batchNumber,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) updateMut.mutate({ ...form, id: editing.id });
    else createMut.mutate(form);
  }

  const filtered = records.filter(r =>
    (r.feedType.toLowerCase().includes(search.toLowerCase()) ||
    (r.supplier ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (r.batchNumber ?? "").toLowerCase().includes(search.toLowerCase())) &&
    (yearFilterFeed === "all" || String(r.feedDate ?? "").startsWith(yearFilterFeed))
  );

  return (
    <>
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by feed type, supplier or batch…" className="pl-9 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <Select value={yearFilterFeed} onValueChange={setYearFilterFeed}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {yearsFeed.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => { setEditing(null); setForm(EMPTY_FEED); setShowForm(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Add Feed Record
          </Button>
        </div>
      </div>

      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
        <strong>Traceability requirement:</strong> Link each feeding event to a source bin and delivery batch. This creates a full audit chain from supplier → bin → herd. Retain invoices and delivery notes for 3 years.
      </div>

      {!isLoading && filtered.length > 0 && (() => {
        const totalKg = filtered.reduce((s: number, r: any) => s + (r.quantityKg ? Number(r.quantityKg) : 0), 0);
        const byType: Record<string, number> = {};
        filtered.forEach((r: any) => {
          const key = FEED_TYPE_LABELS[r.feedType as keyof typeof FEED_TYPE_LABELS] ?? r.feedType;
          byType[key] = (byType[key] ?? 0) + (r.quantityKg ? Number(r.quantityKg) : 0);
        });
        const typeRows = Object.entries(byType).sort((a, b) => b[1] - a[1]);
        return (
          <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 16px", minWidth: 130 }}>
              <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#15803d", letterSpacing: "0.06em", margin: "0 0 3px" }}>Feed Events</p>
              <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#14532d", lineHeight: 1, margin: 0 }}>{filtered.length}</p>
            </div>
            {totalKg > 0 && (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 16px", minWidth: 150 }}>
                <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#15803d", letterSpacing: "0.06em", margin: "0 0 3px" }}>Total Fed</p>
                <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#14532d", lineHeight: 1, margin: 0 }}>{totalKg.toLocaleString("en-GB", { maximumFractionDigits: 0 })} <span style={{ fontSize: "0.7rem", fontWeight: 500 }}>kg</span></p>
              </div>
            )}
            {typeRows.length > 1 && typeRows.map(([type, kg]) => (
              <div key={type} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 16px", minWidth: 130 }}>
                <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#374151", letterSpacing: "0.06em", margin: "0 0 3px" }}>{type}</p>
                <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#111827", lineHeight: 1, margin: 0 }}>{kg.toLocaleString("en-GB", { maximumFractionDigits: 0 })} <span style={{ fontSize: "0.7rem", fontWeight: 500 }}>kg</span></p>
              </div>
            ))}
          </div>
        );
      })()}

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-16 text-center">
          <Package className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">{search ? "No matching records." : "No feed records yet. Add the first feeding event."}</p>
        </CardContent></Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Herd</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Feed Type</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Source Bin</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Batch No.</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Qty (kg)</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(r => {
                const bin = r.feedStockItemId ? binMap[r.feedStockItemId] : null;
                return (
                  <tr key={r.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs">{formatDate(r.feedDate)}</td>
                    <td className="px-4 py-3 text-sm">{r.herdId ? (herdMap[r.herdId] ?? `Herd ${r.herdId}`) : <span className="text-muted-foreground">—</span>}</td>
                    <td className="px-4 py-3 font-medium">{FEED_TYPE_LABELS[r.feedType] ?? r.feedType}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{bin ? (bin.productName || bin.feedType) + (bin.storageLocation ? ` — ${bin.storageLocation}` : "") : <span>—</span>}</td>
                    <td className="px-4 py-3 font-mono text-xs">{r.batchNumber || "—"}</td>
                    <td className="px-4 py-3 font-medium">{r.quantityKg ? `${Number(r.quantityKg).toLocaleString()} kg` : "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-3 w-3" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeleteId(r.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Dialog open onOpenChange={o => { if (!o) { setShowForm(false); setEditing(null); createMut.reset(); updateMut.reset(); } }}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Feed Record" : "Record Feeding Event"}</DialogTitle>
              <DialogDescription>Link to a source bin and delivery batch to build the full traceability chain.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide">Traceability Links</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <Label className="text-xs">Source Bin</Label>
                    <Select value={form.feedStockItemId || "__none__"} onValueChange={handleBinSelect}>
                      <SelectTrigger className="text-xs"><SelectValue placeholder="Select feed bin…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Not linked</SelectItem>
                        {feedBins.map((b: any) => (
                          <SelectItem key={b.id} value={String(b.id)}>
                            {b.productName || FEED_TYPE_LABELS[b.feedType] || b.feedType}{b.storageLocation ? ` — ${b.storageLocation}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Delivery Batch</Label>
                    <Select value={form.deliveryId || "__none__"} onValueChange={handleDeliverySelect}>
                      <SelectTrigger className="text-xs"><SelectValue placeholder="Select delivery…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Not linked</SelectItem>
                        {binDeliveries.map((d: any) => (
                          <SelectItem key={d.id} value={String(d.id)}>
                            {d.deliveryDate?.slice(0, 10)} — {d.batchNumber || d.lotNumber || "no batch"} — {d.supplierName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <Label>Herd / Group</Label>
                  <Select value={form.herdId || "__none__"} onValueChange={v => setField("herdId", v === "__none__" ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="Select herd…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Not specified</SelectItem>
                      {herds.map((h: any) => <SelectItem key={h.id} value={String(h.id)}>{h.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Feed Date *</Label><Input type="date" value={form.feedDate} onChange={e => setField("feedDate", e.target.value)} required /></div>
                <div>
                  <Label>Feed Type *</Label>
                  <Select value={form.feedType || undefined} onValueChange={v => setField("feedType", v)}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(FEED_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Quantity (kg)</Label><Input type="number" value={form.quantityKg} onChange={e => setField("quantityKg", e.target.value)} placeholder="e.g. 500" min="0" step="0.1" /></div>
                <div><Label>Supplier</Label><Input value={form.supplier} onChange={e => setField("supplier", e.target.value)} placeholder="Auto-filled from delivery" /></div>
                <div><Label>Batch / Lot Number</Label><Input value={form.batchNumber} onChange={e => setField("batchNumber", e.target.value)} placeholder="Auto-filled from delivery" /></div>
              </div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setField("notes", e.target.value)} placeholder="Ration changes, refusals, withdrawal periods, etc." rows={2} /></div>
              <DialogMutationError mutation={createMut} message="Failed to save — your entries are still here." />
              <DialogMutationError mutation={updateMut} message="Failed to save — your entries are still here." />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
                <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
                  {(createMut.isPending || updateMut.isPending) ? <><Loader2 className="animate-spin h-4 w-4 mr-1" /> Saving…</> : editing ? "Update" : "Save Record"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {deleteId !== null && (
        <Dialog open onOpenChange={o => { if (!o) { setDeleteId(null); deleteMut.reset(); } }}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Delete Feed Record?</DialogTitle><DialogDescription>This will also restore the consumed quantity to the source bin. This cannot be undone.</DialogDescription></DialogHeader>
            <DialogMutationError mutation={deleteMut} message="Failed to delete — please try again." />
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deleteMut.mutate(deleteId!)} disabled={deleteMut.isPending}>
                {deleteMut.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

