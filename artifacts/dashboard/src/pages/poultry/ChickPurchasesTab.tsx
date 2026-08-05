// @ts-nocheck
import { useState, useRef, useMemo, type ReactNode } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import { sanitiseCsvCell } from "@/lib/csv";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DocAttach } from "@/components/DocAttach";
import { openPrintWindow } from "@/lib/print-report";
import { Plus, Pencil, Trash2, Loader2, Home, Bird, BarChart3, Pill, SprayCan, Thermometer, FileText, ShieldCheck, Scissors, ClipboardList, ClipboardCheck, Star, Truck, UtensilsCrossed, FileDown, AlertTriangle, TrendingUp, LayoutDashboard, CheckCircle2, XCircle, Circle, Eye, Receipt, HardHat, Users, Package, X as XIcon, QrCode, Printer, ChevronDown, ChevronUp, Syringe, Activity, ArrowRightLeft, ShieldAlert, MapPin, Clock, Save } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useFarmMembers } from "@/hooks/use-farm-members";
import { useToast } from "@/hooks/use-toast";
import { StaffSelect } from "@/components/ui/staff-select";
import { ConfirmDialog as SharedConfirmDialog } from "@/components/ui/confirm-dialog";
import { BuyerCombobox } from "@/components/sales/BuyerCombobox";
import { apiUrl as api } from "@/lib/api";
import { fmt, fmtDate, exportCSV, StatCard, Empty, ConfirmDialog, DataTable, useCrud, HOUSE_TYPES, POULTRY_SPECIES, PRODUCTION_SYSTEMS, SPECIES_LABEL_MAP, SYSTEM_LABEL_MAP, fmtSpecies, fmtSystem, getStockingDensityInfo, useFlocks, FlockSelect, fmtFlock } from "./shared";
import type { DensityInfo } from "./shared";

export function ChickPurchasesTab({ farmId }: { farmId: number }) {
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const { data: flockData } = useQuery({ queryKey: ["poultry-flocks", farmId], queryFn: () => fetch(api(`farms/${farmId}/poultry-flocks`), { credentials: "include" }).then(r => r.json()) });
  const flockList = Array.isArray(flockData) ? (flockData as { flock: Record<string, unknown>; houseName: string | null }[]).map(r => ({ ...r.flock, houseName: r.houseName })) : [];
  const { data: supplierData = [] } = useQuery({ queryKey: ["suppliers", farmId, "hatchery"], queryFn: () => fetch(api(`farms/${farmId}/suppliers`), { credentials: "include" }).then(r => r.json()).catch(() => []) });
  const hatcherySuppliers = (Array.isArray(supplierData) ? supplierData as Record<string, unknown>[] : []).filter(s => s.supplierType === "hatchery");
  const { data: raw, isLoading, open, setOpen, form, setForm, save, del, openAdd, openEdit } = useCrud(farmId, "poultry-chick-purchases", "poultry-chick-purchases");
  const records = (raw ?? []) as Record<string, unknown>[];
  const [payStatusFilter, setPayStatusFilter] = useState("all");
  const [flockFilterCP, setFlockFilterCP] = useState("all");
  const [yearFilterCP, setYearFilterCP] = useState("all");
  const yearsCP = useMemo(() => {
    const s = new Set(records.map(r => String(r.orderDate ?? r.deliveryDate ?? "").slice(0, 4)).filter(Boolean));
    return Array.from(s).sort().reverse();
  }, [records]);
  const filteredPurchases = records.filter(r =>
    (payStatusFilter === "all" || r.paymentStatus === payStatusFilter) &&
    (flockFilterCP === "all" || String(r.flockId) === flockFilterCP) &&
    (yearFilterCP === "all" || String(r.orderDate ?? r.deliveryDate ?? "").startsWith(yearFilterCP))
  );

  function fmtGBP(pence: unknown): string {
    const p = Number(pence ?? 0); if (!p) return "—";
    return `£${(p / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  function fmtFlockLabel(flockId: unknown): string {
    const f = flockList.find(fl => String(fl.id) === String(flockId));
    if (!f) return flockId ? String(flockId) : "—";
    return String(f.flockNumber ?? f.id) + (f.houseName ? ` · ${f.houseName}` : "");
  }
  const payStatusClass = (s: unknown) => s === "paid" ? "text-green-700" : s === "overdue" ? "text-red-600" : s === "part-paid" ? "text-amber-600" : "text-muted-foreground";

  const birdsReceived = parseInt(String(form.numberOfBirdsReceived ?? "")) || 0;
  const pricePerBird = parseInt(String(form.pricePerBirdPence ?? "")) || 0;
  const autoTotal = birdsReceived > 0 && pricePerBird > 0 ? birdsReceived * pricePerBird : null;

  function printPurchases() {
    const fmtD = (d: unknown) => d ? new Date(String(d)).toLocaleDateString("en-GB") : "—";
    const fmtGBPp = (p: unknown) => { const n = Number(p ?? 0); return n ? `£${(n / 100).toFixed(2)}` : "—"; };
    const trs = filteredPurchases.map(r => `<tr><td>${fmtFlockLabel(r.flockId)}</td><td>${String(r.supplierName ?? "—")}</td><td>${String(r.poReference ?? "—")}</td><td>${fmtD(r.orderDate)}</td><td>${String(r.numberOfBirdsOrdered ?? "—")}</td><td>${String(r.numberOfBirdsReceived ?? "—")}</td><td>${fmtGBPp(r.totalCostPence)}</td><td>${String(r.invoiceReference ?? "—")}</td><td>${String(r.paymentStatus ?? "—")}</td></tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Chick Purchases</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;padding:4px 6px;border:1px solid #e5e7eb;text-align:left;font-size:8px;text-transform:uppercase;letter-spacing:.05em}td{padding:4px 6px;border:1px solid #e5e7eb}@media print{@page{margin:1.5cm}}</style></head><body><h1>Chick Purchases</h1><h2>${filteredPurchases.length} record${filteredPurchases.length !== 1 ? "s" : ""} · Printed: ${new Date().toLocaleDateString("en-GB")}</h2><table><thead><tr><th>Flock</th><th>Hatchery</th><th>PO Ref</th><th>Order Date</th><th>Ordered</th><th>Received</th><th>Total Cost</th><th>Invoice Ref</th><th>Status</th></tr></thead><tbody>${trs}</tbody></table></body></html>`;
    openPrintWindow(html);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div><h3 className="font-semibold text-sm">Chick Purchases <span className="text-muted-foreground font-normal">({filteredPurchases.length})</span></h3><p className="text-xs text-muted-foreground mt-0.5">Track purchase orders, chick receipts, invoices and payment status for each flock placement.</p></div>
        <div className="flex gap-2">
          {filteredPurchases.length > 0 && <Button size="sm" variant="outline" onClick={printPurchases}><Printer className="w-4 h-4 mr-1" />Print</Button>}
          <Button size="sm" onClick={() => openAdd({ paymentStatus: "unpaid", paymentTermsDays: "30" })}><Plus className="w-4 h-4 mr-1" />Add Purchase</Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Select value={yearFilterCP} onValueChange={setYearFilterCP}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All years</SelectItem>
            {yearsCP.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={flockFilterCP} onValueChange={setFlockFilterCP}>
          <SelectTrigger className="w-44 h-8 text-xs"><SelectValue placeholder="All flocks" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All flocks</SelectItem>
            {flockList.map(f => <SelectItem key={String(f.id)} value={String(f.id)}>{String(f.flockNumber ?? f.id)}{f.houseName ? ` · ${f.houseName}` : ""}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={payStatusFilter} onValueChange={setPayStatusFilter}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="part-paid">Part-paid</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[
        { key: "flockId", label: "Flock", fmt: r => fmtFlockLabel(r.flockId) },
        { key: "supplierName", label: "Hatchery / Supplier" },
        { key: "poReference", label: "PO Ref" },
        { key: "orderDate", label: "Order Date", fmt: r => fmtDate(r.orderDate) },
        { key: "numberOfBirdsOrdered", label: "Ordered" },
        { key: "numberOfBirdsReceived", label: "Received" },
        { key: "pricePerBirdPence", label: "Price/Bird", fmt: r => r.pricePerBirdPence ? `£${(Number(r.pricePerBirdPence) / 100).toFixed(4)}` : "—" },
        { key: "totalCostPence", label: "Total Cost", fmt: r => fmtGBP(r.totalCostPence) },
        { key: "invoiceReference", label: "Invoice Ref" },
        { key: "paymentStatus", label: "Status", render: r => <span className={`capitalize font-medium text-xs ${payStatusClass(r.paymentStatus)}`}>{String(r.paymentStatus ?? "—")}</span> },
        { key: "_attach", label: "", render: r => r.id ? <RecordAttachments farmId={farmId} recordType="poultry-chick-purchases" recordId={r.id as number} compact /> : null },
      ]} rows={filteredPurchases} onEdit={r => openEdit(r)} onDelete={r => del.mutate(r.id as number)} onView={setViewRecord} />}

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>Chick Purchase — {String(viewRecord.poReference ?? fmtFlockLabel(viewRecord.flockId))}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-2">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Flock</p><p className="font-medium">{fmtFlockLabel(viewRecord.flockId)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Hatchery / Supplier</p><p className="font-medium">{String(viewRecord.supplierName ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Hatchery Approval No.</p><p className="font-medium">{String(viewRecord.hatcheryApprovalNumber ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">PO Reference</p><p className="font-medium">{String(viewRecord.poReference ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Order Date</p><p className="font-medium">{fmtDate(viewRecord.orderDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Birds Ordered</p><p className="font-medium">{String(viewRecord.numberOfBirdsOrdered ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Birds Received</p><p className="font-medium">{String(viewRecord.numberOfBirdsReceived ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Price per Bird</p><p className="font-medium">{viewRecord.pricePerBirdPence ? `£${(Number(viewRecord.pricePerBirdPence) / 100).toFixed(4)}` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Total Cost</p><p className="font-medium">{fmtGBP(viewRecord.totalCostPence)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Invoice Reference</p><p className="font-medium">{String(viewRecord.invoiceReference ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Invoice Date</p><p className="font-medium">{fmtDate(viewRecord.invoiceDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Payment Terms</p><p className="font-medium">{viewRecord.paymentTermsDays ? `${viewRecord.paymentTermsDays} days` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Payment Status</p><p className={`font-medium capitalize ${payStatusClass(viewRecord.paymentStatus)}`}>{String(viewRecord.paymentStatus ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Payment Date</p><p className="font-medium">{fmtDate(viewRecord.paymentDate)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{String(viewRecord.notes ?? "—")}</p></div>
              {viewRecord.id && <div className="col-span-2 border-t pt-3"><RecordAttachments farmId={farmId} recordType="poultry-chick-purchases" recordId={viewRecord.id as number} /></div>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent style={{ maxWidth: "46rem" }}>
          <DialogHeader><DialogTitle>Chick Purchase Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Flock</Label>
              <Select value={String(form.flockId ?? "")} onValueChange={v => setForm(f => ({ ...f, flockId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select flock..." /></SelectTrigger>
                <SelectContent>{flockList.map(fl => <SelectItem key={String(fl.id)} value={String(fl.id)}>{String(fl.flockNumber ?? fl.id)}{fl.houseName ? ` · ${fl.houseName}` : ""}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Hatchery / Supplier</Label>
              <Select value={String(form._suppId ?? "__none__")} onValueChange={v => {
                if (v === "__none__") { setForm(f => ({ ...f, _suppId: "" })); return; }
                const s = hatcherySuppliers.find(h => String(h.id) === v);
                setForm(f => ({ ...f, _suppId: v, supplierId: v, supplierName: s ? String(s.name ?? "") : f.supplierName, hatcheryApprovalNumber: f.hatcheryApprovalNumber || String(s?.accountNumber ?? "") }));
              }}>
                <SelectTrigger><SelectValue placeholder="Select hatchery..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Type name below —</SelectItem>
                  {hatcherySuppliers.map(s => <SelectItem key={String(s.id)} value={String(s.id)}>{String(s.name ?? "")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Hatchery Name</Label><Input placeholder="If not in list above" value={String(form.supplierName ?? "")} onChange={e => setForm(f => ({ ...f, supplierName: e.target.value }))} /></div>
            <div><Label>Hatchery Approval No.</Label><Input value={String(form.hatcheryApprovalNumber ?? "")} onChange={e => setForm(f => ({ ...f, hatcheryApprovalNumber: e.target.value }))} /></div>
            <div><Label>PO Reference</Label><Input placeholder="e.g. PO-2025-001" value={String(form.poReference ?? "")} onChange={e => setForm(f => ({ ...f, poReference: e.target.value }))} /></div>
            <div><Label>Order Date</Label><Input type="date" value={String(form.orderDate ?? "")} onChange={e => setForm(f => ({ ...f, orderDate: e.target.value }))} /></div>
            <div><Label>Birds Ordered</Label><Input type="number" value={String(form.numberOfBirdsOrdered ?? "")} onChange={e => setForm(f => ({ ...f, numberOfBirdsOrdered: e.target.value }))} /></div>
            <div><Label>Birds Received (actual)</Label><Input type="number" value={String(form.numberOfBirdsReceived ?? "")} onChange={e => setForm(f => ({ ...f, numberOfBirdsReceived: e.target.value }))} /></div>
            <div>
              <Label>Price per Bird (£)</Label>
              <Input type="number" step="0.0001" placeholder="e.g. 0.4200" value={form.pricePerBirdPence ? String(Number(form.pricePerBirdPence) / 100) : ""} onChange={e => { const p = e.target.value ? String(Math.round(parseFloat(e.target.value) * 100)) : ""; setForm(f => ({ ...f, pricePerBirdPence: p })); }} />
            </div>
            <div>
              <Label>Total Cost (£)</Label>
              {autoTotal !== null && !form.totalCostPence && <p className="text-xs text-muted-foreground mb-1">Auto: £{(autoTotal / 100).toLocaleString("en-GB", { minimumFractionDigits: 2 })}</p>}
              <Input type="number" step="0.01" placeholder="Auto-calculated from above" value={form.totalCostPence ? String(Number(form.totalCostPence) / 100) : ""} onChange={e => { const p = e.target.value ? String(Math.round(parseFloat(e.target.value) * 100)) : ""; setForm(f => ({ ...f, totalCostPence: p })); }} />
            </div>
            <div><Label>Invoice Reference</Label><Input value={String(form.invoiceReference ?? "")} onChange={e => setForm(f => ({ ...f, invoiceReference: e.target.value }))} /></div>
            <div><Label>Invoice Date</Label><Input type="date" value={String(form.invoiceDate ?? "")} onChange={e => setForm(f => ({ ...f, invoiceDate: e.target.value }))} /></div>
            <div><Label>Payment Terms (days)</Label><Input type="number" value={String(form.paymentTermsDays ?? "30")} onChange={e => setForm(f => ({ ...f, paymentTermsDays: e.target.value }))} /></div>
            <div>
              <Label>Payment Status</Label>
              <Select value={String(form.paymentStatus ?? "unpaid")} onValueChange={v => setForm(f => ({ ...f, paymentStatus: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["unpaid", "part-paid", "paid", "overdue"].map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Payment Date</Label><Input type="date" value={String(form.paymentDate ?? "")} onChange={e => setForm(f => ({ ...f, paymentDate: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              const tc = autoTotal && !form.totalCostPence ? String(autoTotal) : form.totalCostPence;
              save.mutate({ ...form, totalCostPence: tc });
            }} disabled={save.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

