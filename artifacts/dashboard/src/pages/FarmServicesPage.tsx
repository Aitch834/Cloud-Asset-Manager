import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users, FileText, Wheat, Receipt, Plus, Pencil, Trash2, CheckCircle, XCircle,
  ChevronDown, ChevronUp, Building2, Phone, Mail, MapPin, Loader2,
  ClipboardList, TrendingUp, Package, AlertTriangle, Calendar, ArrowRight, Eye,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/hooks/use-app-store";
import { useToast } from "@/hooks/use-toast";
import { TabBar, TabButton } from "@/components/ui/tab-button";

type Tab = "customers" | "agreements" | "grain" | "invoices";

// ─── Types ───────────────────────────────────────────────────────────────────

interface FarmCustomer {
  id: number; farmId: number; name: string; contactName?: string | null;
  contactPhone?: string | null; contactEmail?: string | null; address?: string | null;
  holdingNumber?: string | null; vatNumber?: string | null; notes?: string | null;
  isActive: boolean; createdAt: string;
}

interface ServiceAgreement {
  id: number; farmId: number; customerId: number; agreementType: string; title: string;
  referenceNumber?: string | null; startDate?: string | null; endDate?: string | null;
  status: string; areaHa?: string | null; annualRentPence?: number | null;
  rentPerHaPence?: number | null; paymentFrequency?: string | null; nextPaymentDate?: string | null;
  storageLocationId?: number | null; maxTonnesContracted?: string | null;
  storageRatePptWeek?: string | null; intakeChargePpt?: string | null;
  outloadingChargePpt?: string | null; dryingChargePpt?: string | null;
  dayRatePence?: number | null; notes?: string | null; createdAt: string;
}

interface GrainIntake {
  id: number; farmId: number; customerId: number; agreementId?: number | null;
  storageLocationId?: number | null; intakeDate: string; commodity: string; variety?: string | null;
  quantityTonnes: string; moisturePercent?: string | null; screeningsPercent?: string | null;
  specificWeightKgHl?: string | null; grade?: string | null; lotReference?: string | null;
  deliveryNoteRef?: string | null; vehicleReg?: string | null; haulier?: string | null;
  bayOrBin?: string | null; status: string; notes?: string | null; createdAt: string;
}

interface GrainMovement {
  id: number; intakeId: number; movementDate: string; movementType: string;
  quantityTonnes: string; destination?: string | null; vehicleReg?: string | null;
  haulier?: string | null; deliveryNoteRef?: string | null; notes?: string | null;
}

interface ServiceInvoice {
  id: number; farmId: number; customerId: number; agreementId?: number | null;
  invoiceNumber?: string | null; invoiceDate: string; dueDate?: string | null; status: string;
  subtotalPence: number; vatRatePercent: string; vatPence: number; totalPence: number;
  paymentDate?: string | null; paymentMethod?: string | null; paymentReference?: string | null;
  notes?: string | null; createdAt: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const AGREEMENT_TYPES = [
  { value: "grain_storage", label: "Grain Storage" },
  { value: "drying_service", label: "Drying Service" },
  { value: "land_rental", label: "Land Rental" },
  { value: "contract_farming", label: "Contract Farming" },
  { value: "machinery_hire", label: "Machinery Hire" },
  { value: "haulage", label: "Haulage" },
  { value: "other", label: "Other" },
];

const AGREEMENT_STATUS = [
  { value: "draft", label: "Draft", colour: "bg-muted text-muted-foreground" },
  { value: "active", label: "Active", colour: "bg-green-100 text-green-800" },
  { value: "expired", label: "Expired", colour: "bg-amber-100 text-amber-800" },
  { value: "terminated", label: "Terminated", colour: "bg-red-100 text-red-800" },
];

const GRAIN_STATUSES = [
  { value: "in_store", label: "In Store", colour: "bg-green-100 text-green-800" },
  { value: "partially_removed", label: "Partially Removed", colour: "bg-amber-100 text-amber-800" },
  { value: "removed", label: "Fully Removed", colour: "bg-muted text-muted-foreground" },
];

const MOVEMENT_TYPES = [
  { value: "outloading", label: "Outloading" },
  { value: "drying", label: "Sent for Drying" },
  { value: "treatment", label: "Treatment" },
  { value: "transfer", label: "Transfer" },
  { value: "loss", label: "Loss / Adjustment" },
];

const INVOICE_STATUSES = [
  { value: "draft", label: "Draft", colour: "bg-muted text-muted-foreground" },
  { value: "sent", label: "Sent", colour: "bg-blue-100 text-blue-800" },
  { value: "paid", label: "Paid", colour: "bg-green-100 text-green-800" },
  { value: "overdue", label: "Overdue", colour: "bg-red-100 text-red-800" },
  { value: "cancelled", label: "Cancelled", colour: "bg-muted text-muted-foreground" },
];

const COMMODITIES = ["Winter Wheat", "Spring Wheat", "Winter Barley", "Spring Barley", "Oilseed Rape", "Oats", "Rye", "Triticale", "Peas", "Beans", "Linseed", "Other"];
const PAYMENT_FREQS = [
  { value: "annual", label: "Annual" }, { value: "biannual", label: "Bi-annual" },
  { value: "quarterly", label: "Quarterly" }, { value: "monthly", label: "Monthly" },
];

function fmtPence(p: number) { return `£${(p / 100).toFixed(2)}`; }
function fmtPenceK(p: number) { return p >= 100000 ? `£${(p / 100000).toFixed(1)}k` : fmtPence(p); }
function statusBadge(val: string, list: { value: string; label: string; colour: string }[]) {
  const s = list.find((x) => x.value === val);
  return <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${s?.colour ?? "bg-muted"}`}>{s?.label ?? val}</span>;
}
function agreementTypeLabel(v: string) { return AGREEMENT_TYPES.find((t) => t.value === v)?.label ?? v; }

// ─── Customers Tab ────────────────────────────────────────────────────────────

function CustomersTab({ farmId, customers, isLoading }: { farmId: number; customers: FarmCustomer[]; isLoading: boolean }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<FarmCustomer | null>(null);
  const [edit, setEdit] = useState<FarmCustomer | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [form, setForm] = useState({ name: "", contactName: "", contactPhone: "", contactEmail: "", address: "", holdingNumber: "", vatNumber: "", notes: "", isActive: true });

  const saveMut = useMutation({
    mutationFn: (body: Record<string, unknown>) => {
      const url = edit ? `/api/farms/${farmId}/farm-customers/${edit.id}` : `/api/farms/${farmId}/farm-customers`;
      return fetch(url, { method: edit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["farm-customers", farmId] }); setOpen(false); toast({ title: edit ? "Customer updated" : "Customer added" }); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/farm-customers/${id}`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["farm-customers", farmId] }); toast({ title: "Customer deactivated" }); },
    onError: () => toast({ title: "Failed", variant: "destructive" }),
  });

  function openAdd() { setEdit(null); setForm({ name: "", contactName: "", contactPhone: "", contactEmail: "", address: "", holdingNumber: "", vatNumber: "", notes: "", isActive: true }); setOpen(true); }
  function openEdit(c: FarmCustomer) {
    setEdit(c);
    setForm({ name: c.name, contactName: c.contactName ?? "", contactPhone: c.contactPhone ?? "", contactEmail: c.contactEmail ?? "", address: c.address ?? "", holdingNumber: c.holdingNumber ?? "", vatNumber: c.vatNumber ?? "", notes: c.notes ?? "", isActive: c.isActive });
    setOpen(true);
  }

  const visible = customers.filter((c) => showInactive || c.isActive);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} className="h-4 w-4" />
          Show inactive
        </label>
        <Button size="sm" onClick={openAdd} className="gap-1.5"><Plus className="h-4 w-4" /> Add Customer</Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!isLoading && visible.length === 0 && (
        <div className="border rounded-xl p-10 text-center text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No customers yet. Add neighbouring farmers, tenants or contracting clients.</p>
        </div>
      )}

      {visible.length > 0 && (
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Contact</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Holding No.</th>
                <th className="text-left px-4 py-3 font-medium w-24">Status</th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {visible.map((c) => (
                <tr key={c.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">
                    {c.name}
                    {c.address && <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><MapPin className="h-3 w-3" />{c.address.split(",")[0]}</div>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    <div className="space-y-0.5">
                      {c.contactName && <div>{c.contactName}</div>}
                      {c.contactPhone && <div className="flex items-center gap-1 text-xs"><Phone className="h-3 w-3" />{c.contactPhone}</div>}
                      {c.contactEmail && <div className="flex items-center gap-1 text-xs"><Mail className="h-3 w-3" />{c.contactEmail}</div>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell text-xs font-mono">{c.holdingNumber || "—"}</td>
                  <td className="px-4 py-3">
                    {c.isActive ? <span className="flex items-center gap-1 text-green-600 text-xs"><CheckCircle className="h-4 w-4" /> Active</span>
                      : <span className="flex items-center gap-1 text-muted-foreground text-xs"><XCircle className="h-4 w-4" /> Inactive</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => setViewRecord(c)}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteMut.mutate(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Customer</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Name</p><p className="font-medium">{String(viewRecord.name ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Contact Name</p><p className="font-medium">{String(viewRecord.contactName ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Phone</p><p className="font-medium">{String(viewRecord.contactPhone ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p><p className="font-medium">{String(viewRecord.contactEmail ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Holding No.</p><p className="font-medium font-mono">{String(viewRecord.holdingNumber ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">VAT Number</p><p className="font-medium">{String(viewRecord.vatNumber ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Address</p><p className="font-medium">{String(viewRecord.address ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium whitespace-pre-wrap">{String(viewRecord.notes ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p><p className="font-medium">{viewRecord.isActive ? "Active" : "Inactive"}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEdit(null); }}>
        <DialogContent style={{ maxWidth: 560 }} aria-describedby={undefined}>
          <DialogHeader><DialogTitle>{edit ? "Edit Customer" : "Add Customer"}</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-1 max-h-[75vh] overflow-y-auto pr-1">
            <div className="space-y-1"><Label>Business / Farmer name <span className="text-destructive">*</span></Label>
              <Input required placeholder="e.g. J R Atkinson & Sons" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Contact name</Label>
                <Input placeholder="e.g. Robert Atkinson" value={form.contactName} onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Phone</Label>
                <Input placeholder="07700 000000" value={form.contactPhone} onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Email</Label>
                <Input type="email" placeholder="farmer@example.com" value={form.contactEmail} onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))} /></div>
              <div className="space-y-1"><Label>CPH / Holding No.</Label>
                <Input placeholder="e.g. 22/456/0001" value={form.holdingNumber} onChange={(e) => setForm((f) => ({ ...f, holdingNumber: e.target.value }))} /></div>
            </div>
            <div className="space-y-1"><Label>Address</Label>
              <Input placeholder="Farm address or postcode" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} /></div>
            <div className="space-y-1"><Label>VAT number</Label>
              <Input placeholder="GB 123 4567 89" value={form.vatNumber} onChange={(e) => setForm((f) => ({ ...f, vatNumber: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Notes</Label>
              <Textarea rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} /></div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="cust-active" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="h-4 w-4" />
              <Label htmlFor="cust-active" className="cursor-pointer font-normal">Active customer</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={saveMut.isPending || !form.name} onClick={() => saveMut.mutate(form)}>
              {saveMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : edit ? "Save Changes" : "Add Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Agreements Tab ───────────────────────────────────────────────────────────

function AgreementsTab({ farmId, customers }: { farmId: number; customers: FarmCustomer[] }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<ServiceAgreement | null>(null);
  const [edit, setEdit] = useState<ServiceAgreement | null>(null);

  const emptyForm = () => ({
    customerId: "", agreementType: "grain_storage", title: "", referenceNumber: "",
    startDate: "", endDate: "", status: "active", areaHa: "", annualRentPence: "",
    paymentFrequency: "annual", nextPaymentDate: "", maxTonnesContracted: "",
    storageRatePptWeek: "", intakeChargePpt: "", outloadingChargePpt: "", dryingChargePpt: "",
    dayRatePence: "", notes: "",
  });
  const [form, setForm] = useState(emptyForm());

  const agreementsQ = useQuery<{ records: ServiceAgreement[] }>({
    queryKey: ["service-agreements", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/service-agreements`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId,
  });
  const agreements = agreementsQ.data?.records ?? [];

  const saveMut = useMutation({
    mutationFn: (body: Record<string, unknown>) => {
      const url = edit ? `/api/farms/${farmId}/service-agreements/${edit.id}` : `/api/farms/${farmId}/service-agreements`;
      return fetch(url, { method: edit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["service-agreements", farmId] }); setOpen(false); toast({ title: edit ? "Agreement updated" : "Agreement added" }); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/service-agreements/${id}`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["service-agreements", farmId] }); toast({ title: "Agreement terminated" }); },
    onError: () => toast({ title: "Failed", variant: "destructive" }),
  });

  function openAdd() { setEdit(null); setForm(emptyForm()); setOpen(true); }
  function openEdit(a: ServiceAgreement) {
    setEdit(a);
    setForm({
      customerId: String(a.customerId), agreementType: a.agreementType, title: a.title,
      referenceNumber: a.referenceNumber ?? "", startDate: a.startDate ?? "", endDate: a.endDate ?? "",
      status: a.status, areaHa: a.areaHa ?? "", annualRentPence: a.annualRentPence != null ? String(a.annualRentPence / 100) : "",
      paymentFrequency: a.paymentFrequency ?? "annual", nextPaymentDate: a.nextPaymentDate ?? "",
      maxTonnesContracted: a.maxTonnesContracted ?? "", storageRatePptWeek: a.storageRatePptWeek ?? "",
      intakeChargePpt: a.intakeChargePpt ?? "", outloadingChargePpt: a.outloadingChargePpt ?? "",
      dryingChargePpt: a.dryingChargePpt ?? "", dayRatePence: a.dayRatePence != null ? String(a.dayRatePence / 100) : "",
      notes: a.notes ?? "",
    });
    setOpen(true);
  }

  function handleSave() {
    const isLandRental = form.agreementType === "land_rental";
    const isStorage = ["grain_storage", "drying_service"].includes(form.agreementType);
    const isContracting = ["contract_farming", "machinery_hire", "haulage"].includes(form.agreementType);
    saveMut.mutate({
      customerId: parseInt(form.customerId), agreementType: form.agreementType, title: form.title,
      referenceNumber: form.referenceNumber || null, startDate: form.startDate || null, endDate: form.endDate || null,
      status: form.status,
      areaHa: isLandRental ? (form.areaHa || null) : null,
      annualRentPence: isLandRental && form.annualRentPence ? Math.round(parseFloat(form.annualRentPence) * 100) : null,
      paymentFrequency: isLandRental ? (form.paymentFrequency || null) : null,
      nextPaymentDate: isLandRental ? (form.nextPaymentDate || null) : null,
      maxTonnesContracted: isStorage ? (form.maxTonnesContracted || null) : null,
      storageRatePptWeek: isStorage ? (form.storageRatePptWeek || null) : null,
      intakeChargePpt: isStorage ? (form.intakeChargePpt || null) : null,
      outloadingChargePpt: isStorage ? (form.outloadingChargePpt || null) : null,
      dryingChargePpt: isStorage ? (form.dryingChargePpt || null) : null,
      dayRatePence: isContracting && form.dayRatePence ? Math.round(parseFloat(form.dayRatePence) * 100) : null,
      notes: form.notes || null,
    });
  }

  function customerName(id: number) { return customers.find((c) => c.id === id)?.name ?? "—"; }

  const isLandRental = form.agreementType === "land_rental";
  const isStorage = ["grain_storage", "drying_service"].includes(form.agreementType);
  const isContracting = ["contract_farming", "machinery_hire", "haulage"].includes(form.agreementType);

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={openAdd} className="gap-1.5" disabled={customers.length === 0}><Plus className="h-4 w-4" /> New Agreement</Button>
      </div>
      {customers.length === 0 && <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">Add a customer first before creating agreements.</p>}

      {agreementsQ.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!agreementsQ.isLoading && agreements.length === 0 && (
        <div className="border rounded-xl p-10 text-center text-muted-foreground">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No service agreements yet — land rentals, storage contracts, drying services and contract farming.</p>
        </div>
      )}

      {agreements.length > 0 && (
        <div className="space-y-2">
          {agreements.map((a) => (
            <div key={a.id} className="border rounded-xl p-4 hover:bg-muted/20">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{a.title}</span>
                    {statusBadge(a.status, AGREEMENT_STATUS)}
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{agreementTypeLabel(a.agreementType)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />{customerName(a.customerId)}
                    {a.referenceNumber && <span className="ml-2 font-mono text-xs">{a.referenceNumber}</span>}
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                    {a.startDate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{a.startDate}{a.endDate ? ` → ${a.endDate}` : ""}</span>}
                    {a.annualRentPence && <span className="font-medium text-foreground">{fmtPence(a.annualRentPence)}/year rent</span>}
                    {a.maxTonnesContracted && <span>{a.maxTonnesContracted}t contracted</span>}
                    {a.storageRatePptWeek && <span>Storage £{parseFloat(a.storageRatePptWeek).toFixed(4)}/t/wk</span>}
                    {a.dayRatePence && <span>{fmtPence(a.dayRatePence)}/day</span>}
                    {a.areaHa && <span>{a.areaHa} ha</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => setViewRecord(a)}><Eye className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(a)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteMut.mutate(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Agreement</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Title</p><p className="font-medium">{String(viewRecord.title ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Customer</p><p className="font-medium">{customerName(viewRecord.customerId)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Agreement Type</p><p className="font-medium">{agreementTypeLabel(viewRecord.agreementType)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Reference Number</p><p className="font-medium">{String(viewRecord.referenceNumber ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Start Date</p><p className="font-medium">{String(viewRecord.startDate ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">End Date</p><p className="font-medium">{String(viewRecord.endDate ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p><p className="font-medium">{String(viewRecord.status ?? "—")}</p></div>
              {viewRecord.agreementType === "land_rental" && (
                <>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Area (ha)</p><p className="font-medium">{String(viewRecord.areaHa ?? "—")}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Annual Rent</p><p className="font-medium">{viewRecord.annualRentPence != null ? fmtPence(viewRecord.annualRentPence) : "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Payment Frequency</p><p className="font-medium">{String(viewRecord.paymentFrequency ?? "—")}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Next Payment Date</p><p className="font-medium">{String(viewRecord.nextPaymentDate ?? "—")}</p></div>
                </>
              )}
              {["grain_storage", "drying_service"].includes(viewRecord.agreementType) && (
                <>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Max Tonnes</p><p className="font-medium">{String(viewRecord.maxTonnesContracted ?? "—")}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Storage Rate (£/t/wk)</p><p className="font-medium">{String(viewRecord.storageRatePptWeek ?? "—")}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Intake Charge (£/t)</p><p className="font-medium">{String(viewRecord.intakeChargePpt ?? "—")}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Outloading Charge (£/t)</p><p className="font-medium">{String(viewRecord.outloadingChargePpt ?? "—")}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Drying Charge (£/t)</p><p className="font-medium">{String(viewRecord.dryingChargePpt ?? "—")}</p></div>
                </>
              )}
              {["contract_farming", "machinery_hire", "haulage"].includes(viewRecord.agreementType) && (
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Day Rate</p><p className="font-medium">{viewRecord.dayRatePence != null ? fmtPence(viewRecord.dayRatePence) : "—"}</p></div>
              )}
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium whitespace-pre-wrap">{String(viewRecord.notes ?? "—")}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEdit(null); }}>
        <DialogContent style={{ maxWidth: 620 }} aria-describedby={undefined}>
          <DialogHeader><DialogTitle>{edit ? "Edit Agreement" : "New Service Agreement"}</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-1 max-h-[78vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Customer <span className="text-destructive">*</span></Label>
                <Select value={form.customerId} onValueChange={(v) => setForm((f) => ({ ...f, customerId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>{customers.filter((c) => c.isActive).map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Agreement type</Label>
                <Select value={form.agreementType} onValueChange={(v) => setForm((f) => ({ ...f, agreementType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{AGREEMENT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Title <span className="text-destructive">*</span></Label>
              <Input placeholder="e.g. Grain storage — Atkinson 2024/25 season" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Reference number</Label>
                <Input placeholder="e.g. SA-2024-001" value={form.referenceNumber} onChange={(e) => setForm((f) => ({ ...f, referenceNumber: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{AGREEMENT_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Start date</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} /></div>
              <div className="space-y-1"><Label>End date</Label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} /></div>
            </div>

            {isLandRental && (
              <div className="rounded-lg border bg-green-50/50 p-3 space-y-3">
                <p className="text-xs font-semibold text-green-800 uppercase tracking-wide">Land Rental Terms</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Area (ha)</Label>
                    <Input type="number" step="0.01" placeholder="25.00" value={form.areaHa} onChange={(e) => setForm((f) => ({ ...f, areaHa: e.target.value }))} /></div>
                  <div className="space-y-1"><Label>Annual rent (£)</Label>
                    <Input type="number" step="0.01" placeholder="3500.00" value={form.annualRentPence} onChange={(e) => setForm((f) => ({ ...f, annualRentPence: e.target.value }))} /></div>
                  <div className="space-y-1"><Label>Payment frequency</Label>
                    <Select value={form.paymentFrequency} onValueChange={(v) => setForm((f) => ({ ...f, paymentFrequency: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{PAYMENT_FREQS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1"><Label>Next payment due</Label>
                    <Input type="date" value={form.nextPaymentDate} onChange={(e) => setForm((f) => ({ ...f, nextPaymentDate: e.target.value }))} /></div>
                </div>
              </div>
            )}

            {isStorage && (
              <div className="rounded-lg border bg-amber-50/50 p-3 space-y-3">
                <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Storage / Drying Rates</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Max tonnes contracted</Label>
                    <Input type="number" step="0.1" placeholder="500" value={form.maxTonnesContracted} onChange={(e) => setForm((f) => ({ ...f, maxTonnesContracted: e.target.value }))} /></div>
                  <div className="space-y-1"><Label>Storage (£/t/week)</Label>
                    <Input type="number" step="0.0001" placeholder="0.52" value={form.storageRatePptWeek} onChange={(e) => setForm((f) => ({ ...f, storageRatePptWeek: e.target.value }))} /></div>
                  <div className="space-y-1"><Label>Intake (£/t)</Label>
                    <Input type="number" step="0.0001" placeholder="1.40" value={form.intakeChargePpt} onChange={(e) => setForm((f) => ({ ...f, intakeChargePpt: e.target.value }))} /></div>
                  <div className="space-y-1"><Label>Outloading (£/t)</Label>
                    <Input type="number" step="0.0001" placeholder="1.40" value={form.outloadingChargePpt} onChange={(e) => setForm((f) => ({ ...f, outloadingChargePpt: e.target.value }))} /></div>
                  <div className="space-y-1"><Label>Drying (£/t)</Label>
                    <Input type="number" step="0.0001" placeholder="8.50" value={form.dryingChargePpt} onChange={(e) => setForm((f) => ({ ...f, dryingChargePpt: e.target.value }))} /></div>
                </div>
              </div>
            )}

            {isContracting && (
              <div className="rounded-lg border bg-blue-50/50 p-3 space-y-3">
                <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide">Contracting Terms</p>
                <div className="space-y-1"><Label>Day rate (£/day)</Label>
                  <Input type="number" step="0.01" placeholder="350.00" value={form.dayRatePence} onChange={(e) => setForm((f) => ({ ...f, dayRatePence: e.target.value }))} /></div>
              </div>
            )}

            <div className="space-y-1"><Label>Notes</Label>
              <Textarea rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={saveMut.isPending || !form.customerId || !form.title} onClick={handleSave}>
              {saveMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : edit ? "Save Changes" : "Create Agreement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Grain Intake Tab ─────────────────────────────────────────────────────────

function GrainIntakeTab({ farmId, customers }: { farmId: number; customers: FarmCustomer[] }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<GrainIntake | null>(null);
  const [edit, setEdit] = useState<GrainIntake | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [movementOpen, setMovementOpen] = useState<number | null>(null);
  const [mvForm, setMvForm] = useState({ movementDate: new Date().toISOString().slice(0, 10), movementType: "outloading", quantityTonnes: "", destination: "", vehicleReg: "", haulier: "", notes: "" });

  const emptyForm = () => ({
    customerId: "", agreementId: "", storageLocationId: "", intakeDate: new Date().toISOString().slice(0, 10),
    commodity: "Winter Wheat", variety: "", quantityTonnes: "", moisturePercent: "", screeningsPercent: "",
    specificWeightKgHl: "", grade: "", lotReference: "", deliveryNoteRef: "", vehicleReg: "", haulier: "", bayOrBin: "", status: "in_store", notes: "",
  });
  const [form, setForm] = useState(emptyForm());

  const intakesQ = useQuery<{ records: GrainIntake[] }>({
    queryKey: ["grain-intakes", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/grain-intakes`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId,
  });
  const intakes = intakesQ.data?.records ?? [];

  const agreementsQ = useQuery<{ records: ServiceAgreement[] }>({
    queryKey: ["service-agreements", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/service-agreements`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId,
  });
  const agreements = agreementsQ.data?.records ?? [];

  const movementsQ = useQuery<{ records: GrainMovement[] }>({
    queryKey: ["grain-movements", farmId, expandedId],
    queryFn: () => fetch(`/api/farms/${farmId}/grain-intakes/${expandedId}/movements`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId && !!expandedId,
  });
  const movements = movementsQ.data?.records ?? [];

  const saveMut = useMutation({
    mutationFn: (body: Record<string, unknown>) => {
      const url = edit ? `/api/farms/${farmId}/grain-intakes/${edit.id}` : `/api/farms/${farmId}/grain-intakes`;
      return fetch(url, { method: edit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["grain-intakes", farmId] }); setOpen(false); toast({ title: edit ? "Intake updated" : "Intake recorded" }); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const saveMv = useMutation({
    mutationFn: ({ intakeId, body }: { intakeId: number; body: Record<string, unknown> }) =>
      fetch(`/api/farms/${farmId}/grain-intakes/${intakeId}/movements`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grain-movements", farmId, expandedId] });
      setMovementOpen(null);
      toast({ title: "Movement recorded" });
    },
    onError: () => toast({ title: "Failed", variant: "destructive" }),
  });

  const deleteMv = useMutation({
    mutationFn: ({ intakeId, mvId }: { intakeId: number; mvId: number }) =>
      fetch(`/api/farms/${farmId}/grain-intakes/${intakeId}/movements/${mvId}`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["grain-movements", farmId, expandedId] }); toast({ title: "Movement deleted" }); },
  });

  function openAdd() { setEdit(null); setForm(emptyForm()); setOpen(true); }
  function openEdit(i: GrainIntake) {
    setEdit(i);
    setForm({ customerId: String(i.customerId), agreementId: i.agreementId ? String(i.agreementId) : "", storageLocationId: i.storageLocationId ? String(i.storageLocationId) : "", intakeDate: i.intakeDate, commodity: i.commodity, variety: i.variety ?? "", quantityTonnes: i.quantityTonnes, moisturePercent: i.moisturePercent ?? "", screeningsPercent: i.screeningsPercent ?? "", specificWeightKgHl: i.specificWeightKgHl ?? "", grade: i.grade ?? "", lotReference: i.lotReference ?? "", deliveryNoteRef: i.deliveryNoteRef ?? "", vehicleReg: i.vehicleReg ?? "", haulier: i.haulier ?? "", bayOrBin: i.bayOrBin ?? "", status: i.status, notes: i.notes ?? "" });
    setOpen(true);
  }

  function customerName(id: number) { return customers.find((c) => c.id === id)?.name ?? "—"; }

  const totalInStore = intakes.filter((i) => i.status !== "removed").reduce((s, i) => s + parseFloat(i.quantityTonnes), 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        {intakes.length > 0 && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{totalInStore.toFixed(1)}t</span> third-party grain currently in store
          </div>
        )}
        <Button size="sm" className="gap-1.5 ml-auto" onClick={openAdd} disabled={customers.length === 0}><Plus className="h-4 w-4" /> Book In Grain</Button>
      </div>
      {customers.length === 0 && <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">Add a customer first.</p>}

      {intakesQ.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!intakesQ.isLoading && intakes.length === 0 && (
        <div className="border rounded-xl p-10 text-center text-muted-foreground">
          <Wheat className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No third-party grain intakes recorded. Click Book In Grain when a customer delivers.</p>
        </div>
      )}

      {intakes.length > 0 && (
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Customer</th>
                <th className="text-left px-4 py-3 font-medium">Commodity</th>
                <th className="text-right px-4 py-3 font-medium">Qty (t)</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Lot Ref</th>
                <th className="text-left px-4 py-3 font-medium w-32">Status</th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {intakes.map((i) => {
                const isExp = expandedId === i.id;
                return (
                  <>
                    <tr key={i.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 tabular-nums text-muted-foreground">{i.intakeDate}</td>
                      <td className="px-4 py-3 font-medium">{customerName(i.customerId)}</td>
                      <td className="px-4 py-3">{i.commodity}{i.variety ? ` — ${i.variety}` : ""}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium">{parseFloat(i.quantityTonnes).toFixed(1)}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell font-mono">{i.lotReference || "—"}</td>
                      <td className="px-4 py-3">{statusBadge(i.status, GRAIN_STATUSES)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <Button variant="ghost" size="icon" title={isExp ? "Collapse" : "Movements"} onClick={() => setExpandedId(isExp ? null : i.id)} className="text-amber-600">
                            {isExp ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setViewRecord(i)}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(i)}><Pencil className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                    {isExp && (
                      <tr key={`${i.id}-mv`}>
                        <td colSpan={7} className="px-0 py-0">
                          <div className="bg-muted/20 border-t px-6 py-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                                <ArrowRight className="h-3.5 w-3.5 text-amber-600" /> Grain Movements
                              </div>
                              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => { setMovementOpen(i.id); setMvForm({ movementDate: new Date().toISOString().slice(0, 10), movementType: "outloading", quantityTonnes: "", destination: "", vehicleReg: "", haulier: "", notes: "" }); }}>
                                <Plus className="h-3.5 w-3.5" /> Record Movement
                              </Button>
                            </div>
                            {movementsQ.isLoading && <p className="text-xs text-muted-foreground">Loading…</p>}
                            {!movementsQ.isLoading && movements.length === 0 && <p className="text-xs text-muted-foreground italic">No movements recorded yet.</p>}
                            {movements.map((m) => (
                              <div key={m.id} className="flex items-center gap-3 text-xs text-muted-foreground border-b border-muted/30 pb-1.5">
                                <span className="tabular-nums">{m.movementDate}</span>
                                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px] font-medium">{MOVEMENT_TYPES.find((t) => t.value === m.movementType)?.label ?? m.movementType}</span>
                                <span className="font-medium text-foreground">{parseFloat(m.quantityTonnes).toFixed(1)}t</span>
                                {m.destination && <span><ArrowRight className="h-3 w-3 inline" /> {m.destination}</span>}
                                {m.vehicleReg && <span className="font-mono">{m.vehicleReg}</span>}
                                <button onClick={() => deleteMv.mutate({ intakeId: i.id, mvId: m.id })} className="ml-auto text-destructive hover:opacity-70"><Trash2 className="h-3.5 w-3.5" /></button>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Grain Intake</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Intake Date</p><p className="font-medium">{String(viewRecord.intakeDate ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Customer</p><p className="font-medium">{customerName(viewRecord.customerId)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Commodity</p><p className="font-medium">{String(viewRecord.commodity ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Variety</p><p className="font-medium">{String(viewRecord.variety ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Quantity (t)</p><p className="font-medium">{String(viewRecord.quantityTonnes ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Moisture (%)</p><p className="font-medium">{String(viewRecord.moisturePercent ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Specific Weight (kg/hl)</p><p className="font-medium">{String(viewRecord.specificWeightKgHl ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Lot Reference</p><p className="font-medium">{String(viewRecord.lotReference ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Delivery Note Ref</p><p className="font-medium">{String(viewRecord.deliveryNoteRef ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vehicle Reg</p><p className="font-medium">{String(viewRecord.vehicleReg ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Bay / Bin</p><p className="font-medium">{String(viewRecord.bayOrBin ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p><p className="font-medium">{String(viewRecord.status ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium whitespace-pre-wrap">{String(viewRecord.notes ?? "—")}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Intake form dialog */}
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEdit(null); }}>
        <DialogContent style={{ maxWidth: 620 }} aria-describedby={undefined}>
          <DialogHeader><DialogTitle>{edit ? "Edit Grain Intake" : "Book In Third-party Grain"}</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-1 max-h-[78vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Customer <span className="text-destructive">*</span></Label>
                <Select value={form.customerId} onValueChange={(v) => setForm((f) => ({ ...f, customerId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>{customers.filter((c) => c.isActive).map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Intake date <span className="text-destructive">*</span></Label>
                <Input type="date" value={form.intakeDate} onChange={(e) => setForm((f) => ({ ...f, intakeDate: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Commodity <span className="text-destructive">*</span></Label>
                <Select value={form.commodity} onValueChange={(v) => setForm((f) => ({ ...f, commodity: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{COMMODITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Variety</Label>
                <Input placeholder="e.g. KWS Zyatt" value={form.variety} onChange={(e) => setForm((f) => ({ ...f, variety: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1"><Label>Quantity (t) <span className="text-destructive">*</span></Label>
                <Input type="number" step="0.01" placeholder="150.00" value={form.quantityTonnes} onChange={(e) => setForm((f) => ({ ...f, quantityTonnes: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Moisture (%)</Label>
                <Input type="number" step="0.1" placeholder="15.2" value={form.moisturePercent} onChange={(e) => setForm((f) => ({ ...f, moisturePercent: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Spec weight (kg/hl)</Label>
                <Input type="number" step="0.1" placeholder="76.0" value={form.specificWeightKgHl} onChange={(e) => setForm((f) => ({ ...f, specificWeightKgHl: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Lot reference</Label>
                <Input placeholder="e.g. LOT-ATK-2024-001" value={form.lotReference} onChange={(e) => setForm((f) => ({ ...f, lotReference: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Delivery note ref</Label>
                <Input placeholder="e.g. DN-2024-1041" value={form.deliveryNoteRef} onChange={(e) => setForm((f) => ({ ...f, deliveryNoteRef: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Vehicle reg</Label>
                <Input placeholder="AB12 CDE" value={form.vehicleReg} onChange={(e) => setForm((f) => ({ ...f, vehicleReg: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Bay / Bin</Label>
                <Input placeholder="e.g. Bay A, North end" value={form.bayOrBin} onChange={(e) => setForm((f) => ({ ...f, bayOrBin: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{GRAIN_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Agreement (optional)</Label>
                <Select value={form.agreementId || "__none__"} onValueChange={(v) => setForm((f) => ({ ...f, agreementId: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {agreements.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1"><Label>Notes</Label>
              <Textarea rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={saveMut.isPending || !form.customerId || !form.intakeDate || !form.quantityTonnes}
              onClick={() => saveMut.mutate({ ...form, customerId: parseInt(form.customerId), agreementId: form.agreementId ? parseInt(form.agreementId) : null, quantityTonnes: form.quantityTonnes, moisturePercent: form.moisturePercent || null, screeningsPercent: form.screeningsPercent || null, specificWeightKgHl: form.specificWeightKgHl || null })}>
              {saveMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : edit ? "Save Changes" : "Book In"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Movement dialog */}
      <Dialog open={movementOpen !== null} onOpenChange={(o) => { if (!o) setMovementOpen(null); }}>
        <DialogContent style={{ maxWidth: 480 }} aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Record Grain Movement</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Date</Label>
                <Input type="date" value={mvForm.movementDate} onChange={(e) => setMvForm((f) => ({ ...f, movementDate: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Movement type</Label>
                <Select value={mvForm.movementType} onValueChange={(v) => setMvForm((f) => ({ ...f, movementType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{MOVEMENT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Quantity (t) <span className="text-destructive">*</span></Label>
                <Input type="number" step="0.01" placeholder="150.00" value={mvForm.quantityTonnes} onChange={(e) => setMvForm((f) => ({ ...f, quantityTonnes: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Destination / buyer</Label>
                <Input placeholder="e.g. Frontier Ag Lincoln" value={mvForm.destination} onChange={(e) => setMvForm((f) => ({ ...f, destination: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Vehicle reg</Label>
                <Input placeholder="AB12 CDE" value={mvForm.vehicleReg} onChange={(e) => setMvForm((f) => ({ ...f, vehicleReg: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Haulier</Label>
                <Input placeholder="Haulier name" value={mvForm.haulier} onChange={(e) => setMvForm((f) => ({ ...f, haulier: e.target.value }))} /></div>
            </div>
            <div className="space-y-1"><Label>Notes</Label>
              <Input value={mvForm.notes} onChange={(e) => setMvForm((f) => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMovementOpen(null)}>Cancel</Button>
            <Button disabled={saveMv.isPending || !mvForm.quantityTonnes}
              onClick={() => movementOpen !== null && saveMv.mutate({ intakeId: movementOpen, body: { ...mvForm, quantityTonnes: mvForm.quantityTonnes, destination: mvForm.destination || null, vehicleReg: mvForm.vehicleReg || null, haulier: mvForm.haulier || null, notes: mvForm.notes || null } })}>
              {saveMv.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Record Movement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Invoices Tab ─────────────────────────────────────────────────────────────

function InvoicesTab({ farmId, customers }: { farmId: number; customers: FarmCustomer[] }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [viewId, setViewId] = useState<number | null>(null);
  const [lines, setLines] = useState<Array<{ description: string; quantity: string; unit: string; unitPricePence: string; lineTotalPence: number }>>([]);

  const emptyForm = () => ({
    customerId: "", agreementId: "", invoiceNumber: "", invoiceDate: new Date().toISOString().slice(0, 10),
    dueDate: "", status: "draft", vatRatePercent: "20", notes: "",
  });
  const [form, setForm] = useState(emptyForm());

  const invoicesQ = useQuery<{ records: ServiceInvoice[] }>({
    queryKey: ["service-invoices", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/service-invoices`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId,
  });
  const invoices = invoicesQ.data?.records ?? [];

  const linesQ = useQuery<{ records: Array<{ id: number; description: string; quantity: string; unit: string; unitPricePence: number; lineTotalPence: number }> }>({
    queryKey: ["invoice-lines", farmId, viewId],
    queryFn: () => fetch(`/api/farms/${farmId}/service-invoices/${viewId}/lines`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId && !!viewId,
  });

  const agreementsQ = useQuery<{ records: ServiceAgreement[] }>({
    queryKey: ["service-agreements", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/service-agreements`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId,
  });
  const agreements = agreementsQ.data?.records ?? [];

  const saveMut = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetch(`/api/farms/${farmId}/service-invoices`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["service-invoices", farmId] }); setOpen(false); toast({ title: "Invoice created" }); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const markPaid = useMutation({
    mutationFn: ({ id, paymentDate }: { id: number; paymentDate: string }) =>
      fetch(`/api/farms/${farmId}/service-invoices/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ status: "paid", paymentDate }) }).then((r) => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["service-invoices", farmId] }); toast({ title: "Marked as paid" }); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/service-invoices/${id}`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["service-invoices", farmId] }); toast({ title: "Invoice deleted" }); },
  });

  function addLine() { setLines((l) => [...l, { description: "", quantity: "", unit: "tonnes", unitPricePence: "", lineTotalPence: 0 }]); }
  function updateLine(i: number, field: string, val: string) {
    setLines((prev) => prev.map((l, idx) => {
      if (idx !== i) return l;
      const updated = { ...l, [field]: val };
      if (field === "quantity" || field === "unitPricePence") {
        const qty = parseFloat(updated.quantity || "1") || 1;
        const unitP = Math.round(parseFloat(updated.unitPricePence || "0") * 100);
        updated.lineTotalPence = Math.round(qty * unitP);
      }
      return updated;
    }));
  }

  function handleCreate() {
    const processedLines = lines.filter((l) => l.description).map((l) => ({
      description: l.description, quantity: l.quantity || null, unit: l.unit || null,
      unitPricePence: Math.round(parseFloat(l.unitPricePence || "0") * 100),
      lineTotalPence: l.lineTotalPence,
    }));
    saveMut.mutate({ ...form, customerId: parseInt(form.customerId), agreementId: form.agreementId ? parseInt(form.agreementId) : null, lines: processedLines });
  }

  function openAdd() { setForm(emptyForm()); setLines([{ description: "", quantity: "", unit: "tonnes", unitPricePence: "", lineTotalPence: 0 }]); setOpen(true); }
  function customerName(id: number) { return customers.find((c) => c.id === id)?.name ?? "—"; }

  const subtotal = lines.reduce((s, l) => s + l.lineTotalPence, 0);
  const vatAmount = Math.round(subtotal * parseFloat(form.vatRatePercent || "20") / 100);
  const total = subtotal + vatAmount;

  const today = new Date().toISOString().slice(0, 10);
  // Compute effective status client-side — catches "sent" invoices whose dueDate has passed
  const invoicesWithStatus = invoices.map((inv) => ({
    ...inv,
    effectiveStatus: (inv.status === "sent" && inv.dueDate && inv.dueDate < today) ? "overdue" : inv.status,
  }));
  const totalOutstanding = invoicesWithStatus.filter((i) => i.effectiveStatus !== "paid" && i.effectiveStatus !== "cancelled").reduce((s, i) => s + i.totalPence, 0);
  const overdueInvoices = invoicesWithStatus.filter((i) => i.effectiveStatus === "overdue");
  const overdueTotal = overdueInvoices.reduce((s, i) => s + i.totalPence, 0);

  return (
    <div className="space-y-3">
      {overdueInvoices.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">{overdueInvoices.length} overdue invoice{overdueInvoices.length !== 1 ? "s" : ""} — {fmtPence(overdueTotal)} outstanding</p>
            <p className="text-xs text-red-600 mt-0.5">Payment is past the due date. Chase customers or mark as paid once received.</p>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        {invoicesWithStatus.length > 0 && totalOutstanding > 0 && overdueInvoices.length === 0 && (
          <div className="text-sm text-muted-foreground">
            Outstanding: <span className="font-semibold text-amber-700">{fmtPence(totalOutstanding)}</span>
          </div>
        )}
        <Button size="sm" className="gap-1.5 ml-auto" onClick={openAdd} disabled={customers.length === 0}><Plus className="h-4 w-4" /> New Invoice</Button>
      </div>

      {invoicesQ.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!invoicesQ.isLoading && invoicesWithStatus.length === 0 && (
        <div className="border rounded-xl p-10 text-center text-muted-foreground">
          <Receipt className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No invoices yet — raise invoices to customers for storage, drying, land rent or contract work.</p>
        </div>
      )}

      {invoicesWithStatus.length > 0 && (
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Invoice</th>
                <th className="text-left px-4 py-3 font-medium">Customer</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Date</th>
                <th className="text-right px-4 py-3 font-medium">Total</th>
                <th className="text-left px-4 py-3 font-medium w-28">Status</th>
                <th className="px-4 py-3 w-24" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoicesWithStatus.map((inv) => (
                <tr key={inv.id} className={`hover:bg-muted/30 ${inv.effectiveStatus === "overdue" ? "bg-red-50" : ""}`}>
                  <td className="px-4 py-3 font-mono text-xs">{inv.invoiceNumber || `INV-${String(inv.id).padStart(4, "0")}`}</td>
                  <td className="px-4 py-3 font-medium">{customerName(inv.customerId)}</td>
                  <td className={`px-4 py-3 hidden md:table-cell ${inv.effectiveStatus === "overdue" ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
                    {inv.invoiceDate}{inv.dueDate ? ` · due ${inv.dueDate}${inv.effectiveStatus === "overdue" ? " ⚠" : ""}` : ""}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">{fmtPence(inv.totalPence)}</td>
                  <td className="px-4 py-3">{statusBadge(inv.effectiveStatus, INVOICE_STATUSES)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="ghost" size="icon" title="View lines" onClick={() => setViewId(inv.id)}><FileText className="h-4 w-4" /></Button>
                      {inv.effectiveStatus !== "paid" && inv.effectiveStatus !== "cancelled" && (
                        <Button variant="ghost" size="icon" title="Mark paid" onClick={() => markPaid.mutate({ id: inv.id, paymentDate: new Date().toISOString().slice(0, 10) })}>
                          <CheckCircle className={`h-4 w-4 ${inv.effectiveStatus === "overdue" ? "text-red-500" : "text-green-600"}`} />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => deleteMut.mutate(inv.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View invoice lines */}
      {viewId && (() => {
        const inv = invoices.find((i) => i.id === viewId);
        return (
          <Dialog open onOpenChange={(o) => { if (!o) setViewId(null); }}>
            <DialogContent style={{ maxWidth: 560 }} aria-describedby={undefined}>
              <DialogHeader><DialogTitle>Invoice {inv?.invoiceNumber || `INV-${String(viewId).padStart(4, "0")}`}</DialogTitle></DialogHeader>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">{inv && customerName(inv.customerId)} · {inv?.invoiceDate}</div>
                {linesQ.isLoading ? <p className="text-xs text-muted-foreground">Loading…</p> : (
                  <table className="w-full text-sm">
                    <thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left py-1.5">Description</th><th className="text-right py-1.5">Qty</th><th className="text-right py-1.5">Unit £</th><th className="text-right py-1.5">Total</th></tr></thead>
                    <tbody>
                      {(linesQ.data?.records ?? []).map((l) => (
                        <tr key={l.id} className="border-b border-muted/30">
                          <td className="py-1.5 pr-2">{l.description}</td>
                          <td className="py-1.5 text-right tabular-nums">{l.quantity ? `${l.quantity} ${l.unit ?? ""}` : "—"}</td>
                          <td className="py-1.5 text-right tabular-nums">{fmtPence(l.unitPricePence)}</td>
                          <td className="py-1.5 text-right font-medium tabular-nums">{fmtPence(l.lineTotalPence)}</td>
                        </tr>
                      ))}
                    </tbody>
                    {inv && <tfoot>
                      <tr><td colSpan={3} className="py-1 text-right text-xs text-muted-foreground">Subtotal</td><td className="py-1 text-right tabular-nums">{fmtPence(inv.subtotalPence)}</td></tr>
                      <tr><td colSpan={3} className="py-1 text-right text-xs text-muted-foreground">VAT ({inv.vatRatePercent}%)</td><td className="py-1 text-right tabular-nums">{fmtPence(inv.vatPence)}</td></tr>
                      <tr className="border-t-2"><td colSpan={3} className="py-2 text-right font-bold">Total</td><td className="py-2 text-right font-bold text-lg tabular-nums">{fmtPence(inv.totalPence)}</td></tr>
                    </tfoot>}
                  </table>
                )}
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setViewId(null)}>Close</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}

      {/* Create invoice dialog */}
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); }}>
        <DialogContent style={{ maxWidth: 640 }} aria-describedby={undefined}>
          <DialogHeader><DialogTitle>New Invoice</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-1 max-h-[78vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Customer <span className="text-destructive">*</span></Label>
                <Select value={form.customerId} onValueChange={(v) => setForm((f) => ({ ...f, customerId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>{customers.filter((c) => c.isActive).map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Agreement (optional)</Label>
                <Select value={form.agreementId || "__none__"} onValueChange={(v) => setForm((f) => ({ ...f, agreementId: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {agreements.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1"><Label>Invoice number</Label>
                <Input placeholder="INV-2024-001" value={form.invoiceNumber} onChange={(e) => setForm((f) => ({ ...f, invoiceNumber: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Invoice date <span className="text-destructive">*</span></Label>
                <Input type="date" value={form.invoiceDate} onChange={(e) => setForm((f) => ({ ...f, invoiceDate: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Due date</Label>
                <Input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} /></div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Line items</Label>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={addLine}><Plus className="h-3 w-3" /> Add line</Button>
              </div>
              <div className="space-y-2">
                {lines.map((l, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-start text-sm">
                    <div className="col-span-5"><Input placeholder="Description" value={l.description} onChange={(e) => updateLine(i, "description", e.target.value)} /></div>
                    <div className="col-span-2"><Input type="number" step="0.01" placeholder="Qty" value={l.quantity} onChange={(e) => updateLine(i, "quantity", e.target.value)} /></div>
                    <div className="col-span-2"><Input type="number" step="0.01" placeholder="£/unit" value={l.unitPricePence} onChange={(e) => updateLine(i, "unitPricePence", e.target.value)} /></div>
                    <div className="col-span-2 text-right pt-2 font-medium tabular-nums">{fmtPence(l.lineTotalPence)}</div>
                    <div className="col-span-1 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setLines((prev) => prev.filter((_, idx) => idx !== i))}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-2 text-sm space-y-1">
                <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span className="tabular-nums">{fmtPence(subtotal)}</span></div>
                <div className="flex justify-between text-muted-foreground items-center gap-2">
                  <span>VAT</span>
                  <div className="flex items-center gap-1.5">
                    <Select value={form.vatRatePercent} onValueChange={(v) => setForm((f) => ({ ...f, vatRatePercent: v }))}>
                      <SelectTrigger className="h-7 w-20 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="0">0%</SelectItem><SelectItem value="5">5%</SelectItem><SelectItem value="20">20%</SelectItem></SelectContent>
                    </Select>
                    <span className="tabular-nums w-20 text-right">{fmtPence(vatAmount)}</span>
                  </div>
                </div>
                <div className="flex justify-between font-bold text-base"><span>Total</span><span className="tabular-nums">{fmtPence(total)}</span></div>
              </div>
            </div>
            <div className="space-y-1"><Label>Notes</Label>
              <Textarea rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={saveMut.isPending || !form.customerId || lines.filter((l) => l.description).length === 0} onClick={handleCreate}>
              {saveMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Compliance Banner ────────────────────────────────────────────────────────

function ComplianceBanner() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-amber-900">Important: Farm Service Provider Obligations</p>
          <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
            <li><strong>Insurance:</strong> Storing or handling third-party grain requires a <em>goods in custody</em> extension on your farm combined policy. Review your insurance schedule.</li>
            <li><strong>TASCC:</strong> Commercial grain storage for third parties falls under the Trade Assurance Scheme for Combinable Crops — separate from Red Tractor.</li>
            <li><strong>Red Tractor:</strong> Store standards apply regardless of whose grain is held. Traceability (lot references, segregation) is a compliance requirement.</li>
            <li><strong>VAT:</strong> Services provided to other farmers are subject to VAT. Ensure you are registered if turnover exceeds the threshold.</li>
            <li><strong>Contract work:</strong> If operating machinery on third-party land, ensure your machinery insurance covers commercial contracting.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FarmServicesPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<Tab>(() => {
    const p = new URLSearchParams(window.location.search);
    const t = p.get("tab") as Tab | null;
    const valid: Tab[] = ["customers", "agreements", "grain", "invoices"];
    return t && valid.includes(t) ? t : "customers";
  });

  const customersQ = useQuery<{ records: FarmCustomer[] }>({
    queryKey: ["farm-customers", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/farm-customers`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId,
  });
  const customers = customersQ.data?.records ?? [];

  const totalCustomers = customers.filter((c) => c.isActive).length;
  const totalAgreements = 0;

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
              <TrendingUp className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Farm Services</h1>
              <p className="text-sm text-muted-foreground">
                Manage services you provide to other farmers — storage, drying, land rental, contract work and invoicing.
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
            <div className="text-center"><div className="font-bold text-foreground text-lg">{totalCustomers}</div><div className="text-xs">Customers</div></div>
          </div>
        </div>

        <ComplianceBanner />

        <TabBar>
          <TabButton active={tab === "customers"} onClick={() => setTab("customers")}>
            <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Customers</span>
          </TabButton>
          <TabButton active={tab === "agreements"} onClick={() => setTab("agreements")}>
            <span className="flex items-center gap-1.5"><ClipboardList className="h-3.5 w-3.5" /> Service Agreements</span>
          </TabButton>
          <TabButton active={tab === "grain"} onClick={() => setTab("grain")}>
            <span className="flex items-center gap-1.5"><Wheat className="h-3.5 w-3.5" /> Third-party Grain</span>
          </TabButton>
          <TabButton active={tab === "invoices"} onClick={() => setTab("invoices")}>
            <span className="flex items-center gap-1.5"><Receipt className="h-3.5 w-3.5" /> Invoices</span>
          </TabButton>
        </TabBar>

        {tab === "customers" && farmId && <CustomersTab farmId={farmId} customers={customers} isLoading={customersQ.isLoading} />}
        {tab === "agreements" && farmId && <AgreementsTab farmId={farmId} customers={customers} />}
        {tab === "grain" && farmId && <GrainIntakeTab farmId={farmId} customers={customers} />}
        {tab === "invoices" && farmId && <InvoicesTab farmId={farmId} customers={customers} />}
      </div>
    </AppLayout>
  );
}
