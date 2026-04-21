import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users, FileText, Wheat, Receipt, Plus, Pencil, Trash2, CheckCircle, XCircle,
  ChevronDown, ChevronUp, Building2, Phone, Mail, MapPin, Loader2,
  ClipboardList, TrendingUp, Package, AlertTriangle, Calendar, ArrowRight, Eye, RefreshCw, Printer,
  Briefcase, Clock, User, CheckSquare, Circle,
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
import { printHtml } from "@/lib/utils";

type Tab = "customers" | "agreements" | "grain" | "invoices" | "work-orders";

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
  transportArrangedBy?: string | null; haulierId?: number | null;
  bayOrBin?: string | null; status: string; notes?: string | null; createdAt: string;
}

interface GrainMovement {
  id: number; intakeId: number; movementDate: string; movementType: string;
  quantityTonnes: string; destination?: string | null; vehicleReg?: string | null;
  haulier?: string | null; transportArrangedBy?: string | null; haulierId?: number | null;
  deliveryNoteRef?: string | null; notes?: string | null;
}

interface StorageLocation { id: number; name: string; storageCode?: string | null; capacityTonnes?: string | null; }
interface Haulier { id: number; companyName: string; }

interface ServiceInvoice {
  id: number; farmId: number; customerId: number; agreementId?: number | null;
  invoiceNumber?: string | null; invoiceDate: string; dueDate?: string | null; status: string;
  subtotalPence: number; vatRatePercent: string; vatPence: number; totalPence: number;
  paymentDate?: string | null; paymentMethod?: string | null; paymentReference?: string | null;
  notes?: string | null; createdAt: string;
}

interface FarmRecord {
  id: number; name: string; address?: string | null; postcode?: string | null;
  contactEmail?: string | null; contactPhone?: string | null; bcmsHoldingNumber?: string | null;
}

interface FarmMember {
  id: number; firstName: string; lastName: string; jobTitle?: string | null;
  phone?: string | null; email?: string | null;
}

interface WorkOrder {
  id: number; farmId: number; workOrderRef: string | null; title: string;
  description?: string | null; staffName: string; assignedToMemberId: number;
  dueDate?: string | null; estimatedHours?: string | null;
  assignmentNote?: string | null; completionNote?: string | null;
  status: string; serviceInvoiceId?: number | null; invoiceNumber?: string | null;
  createdAt: string; completedAt?: string | null;
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

// ─── Print document helpers ───────────────────────────────────────────────────

function docStyles() {
  return `<style>
    *{box-sizing:border-box}
    body{font-family:'Segoe UI',Arial,sans-serif;font-size:11.5px;color:#1a1a1a;padding:32px;max-width:820px;margin:0 auto}
    h2{font-size:15px;font-weight:600;margin:0 0 12px}
    .doc-header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:14px;border-bottom:3px solid #2d5a27;margin-bottom:20px}
    .farm-name{font-size:18px;font-weight:700;color:#1a1a1a}
    .farm-meta{font-size:11px;color:#555;margin-top:3px;line-height:1.6}
    .doc-meta{text-align:right;font-size:11px;color:#666;line-height:1.6}
    .doc-title{font-size:20px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#2d5a27;margin:0 0 16px}
    table{width:100%;border-collapse:collapse;margin-top:8px}
    th{background:#f0f5ef;text-align:left;padding:7px 10px;border-bottom:2px solid #2d5a27;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#2d5a27}
    td{padding:7px 10px;border-bottom:1px solid #e8eee8;vertical-align:top}
    tr:last-child td{border-bottom:none}
    .tr-total td{border-top:2px solid #2d5a27;font-weight:700;background:#f0f5ef}
    .amount{text-align:right;font-variant-numeric:tabular-nums}
    .section{margin-top:20px}
    .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    .lbl{font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:#888;margin-bottom:2px}
    .val{font-weight:500}
    .footer{margin-top:28px;padding-top:10px;border-top:1px solid #ddd;font-size:10px;color:#888;display:flex;justify-content:space-between}
    .badge{display:inline-block;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:600;background:#f0f5ef;color:#2d5a27;border:1px solid #c5d9c2}
    .highlight{background:#fffbeb;border-left:3px solid #d97706;padding:8px 12px;margin:12px 0;font-size:11px}
    @media print{body{padding:20px}}
  </style>`;
}

function docHeader(farm: FarmRecord | undefined) {
  const now = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return `<div class="doc-header">
    <div>
      <div class="farm-name">${farm?.name ?? "BDE Farm Trac"}</div>
      <div class="farm-meta">${farm?.address ? farm.address + "<br>" : ""}${farm?.postcode ? farm.postcode + "<br>" : ""}${farm?.bcmsHoldingNumber ? "CPH No: " + farm.bcmsHoldingNumber : ""}</div>
    </div>
    <div class="doc-meta">
      <div style="font-weight:700;color:#2d5a27;font-size:13px;margin-bottom:4px">BDE Farm Trac</div>
      <div>Barnett Davies Enterprises Ltd</div>
      <div>Produced: ${now}</div>
    </div>
  </div>`;
}

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
  const [showHistory, setShowHistory] = useState(false);

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

  const farmQ = useQuery<{ record: FarmRecord }>({
    queryKey: ["farm", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId,
  });
  const farm = farmQ.data?.record;

  function printAgreementSummary(a: ServiceAgreement) {
    const custName = customers.find((c) => c.id === a.customerId)?.name ?? "—";
    const custAddr = customers.find((c) => c.id === a.customerId)?.address ?? "";
    const custHolding = customers.find((c) => c.id === a.customerId)?.holdingNumber ?? "";
    const isLand = a.agreementType === "land_rental";
    const isStore = ["grain_storage", "drying_service"].includes(a.agreementType);
    const isContract = ["contract_farming", "machinery_hire", "haulage"].includes(a.agreementType);
    const row = (label: string, val: string | null | undefined) =>
      val ? `<tr><td class="lbl" style="width:200px;padding-right:16px">${label}</td><td class="val">${val}</td></tr>` : "";
    const termRows = [
      isStore && a.maxTonnesContracted ? row("Max Tonnes", `${a.maxTonnesContracted} t`) : "",
      isStore && a.storageRatePptWeek ? row("Storage Rate", `£${parseFloat(a.storageRatePptWeek).toFixed(4)}/t/week`) : "",
      isStore && a.intakeChargePpt ? row("Intake Charge", `£${parseFloat(a.intakeChargePpt).toFixed(4)}/t`) : "",
      isStore && a.outloadingChargePpt ? row("Outloading Charge", `£${parseFloat(a.outloadingChargePpt).toFixed(4)}/t`) : "",
      isStore && a.dryingChargePpt ? row("Drying Charge", `£${parseFloat(a.dryingChargePpt).toFixed(4)}/t`) : "",
      isLand && a.areaHa ? row("Area", `${a.areaHa} ha`) : "",
      isLand && a.annualRentPence ? row("Annual Rent", fmtPence(a.annualRentPence)) : "",
      isLand && a.paymentFrequency ? row("Payment Frequency", a.paymentFrequency.charAt(0).toUpperCase() + a.paymentFrequency.slice(1)) : "",
      isLand && a.nextPaymentDate ? row("Next Payment Due", a.nextPaymentDate) : "",
      isContract && a.dayRatePence ? row("Day Rate", fmtPence(a.dayRatePence)) : "",
    ].join("");
    const statusLabel = AGREEMENT_STATUS.find((s) => s.value === a.status)?.label ?? a.status;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Agreement — ${a.title}</title>${docStyles()}</head><body>
      ${docHeader(farm)}
      <div class="doc-title">Service Agreement Summary</div>
      <div class="grid-2" style="margin-bottom:20px">
        <div>
          <div class="lbl">Agreement Party</div>
          <div class="val" style="font-size:13px">${custName}</div>
          ${custAddr ? `<div style="font-size:11px;color:#555;margin-top:2px">${custAddr}</div>` : ""}
          ${custHolding ? `<div style="font-size:11px;color:#555">CPH: ${custHolding}</div>` : ""}
        </div>
        <div style="text-align:right">
          <span class="badge">${statusLabel}</span>
          ${a.referenceNumber ? `<div style="margin-top:6px;font-variant-numeric:tabular-nums;font-weight:600;font-size:13px;color:#2d5a27">${a.referenceNumber}</div>` : ""}
        </div>
      </div>
      <table style="margin-bottom:0">
        <tbody>
          ${row("Agreement Title", a.title)}
          ${row("Agreement Type", agreementTypeLabel(a.agreementType))}
          ${row("Start Date", a.startDate)}
          ${row("End Date", a.endDate)}
          ${termRows}
          ${a.notes ? row("Notes", a.notes) : ""}
        </tbody>
      </table>
      <div class="highlight" style="margin-top:20px">
        This agreement summary is for reference only. It is not a legally binding document in isolation. 
        Both parties should retain signed copies of the full agreement. This document was produced by BDE Farm Trac.
      </div>
      <div class="footer"><span>Agreement: ${a.title} — ${custName}</span><span>Produced by BDE Farm Trac</span></div>
    </body></html>`;
    printHtml(html);
  }

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

  // Renew: open a new-agreement form pre-filled with the previous agreement's terms,
  // but with blank dates and status reset to "active". Reference is cleared so the
  // user assigns a fresh number. The original agreement stays on record as the audit trail.
  function openRenew(a: ServiceAgreement) {
    setEdit(null);
    setForm({
      customerId: String(a.customerId), agreementType: a.agreementType, title: a.title,
      referenceNumber: "", startDate: "", endDate: "",
      status: "active", areaHa: a.areaHa ?? "", annualRentPence: a.annualRentPence != null ? String(a.annualRentPence / 100) : "",
      paymentFrequency: a.paymentFrequency ?? "annual", nextPaymentDate: "",
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

  const todayStr = new Date().toISOString().slice(0, 10);
  const activeAgreements = agreements.filter((a) => a.status === "active");
  const historicAgreements = agreements.filter((a) => a.status !== "active");
  const visibleAgreements = showHistory ? agreements : activeAgreements;

  function expiryInfo(a: ServiceAgreement): { daysUntil: number; label: string; colour: string } | null {
    if (!a.endDate || a.status !== "active") return null;
    const daysUntil = Math.round((new Date(a.endDate + "T00:00:00Z").getTime() - new Date(todayStr + "T00:00:00Z").getTime()) / (24 * 60 * 60 * 1000));
    if (daysUntil > 30) return null;
    if (daysUntil < 0) return { daysUntil, label: "Expired", colour: "text-red-600 bg-red-50 border-red-200" };
    if (daysUntil <= 7) return { daysUntil, label: `Expires in ${daysUntil}d`, colour: "text-red-600 bg-red-50 border-red-200" };
    return { daysUntil, label: `Expires in ${daysUntil}d`, colour: "text-amber-700 bg-amber-50 border-amber-200" };
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {historicAgreements.length > 0 && (
            <button
              onClick={() => setShowHistory((v) => !v)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${showHistory ? "bg-muted border-border text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {showHistory ? "Hide history" : `Show history (${historicAgreements.length} ended)`}
            </button>
          )}
        </div>
        <Button size="sm" onClick={openAdd} className="gap-1.5" disabled={customers.length === 0}><Plus className="h-4 w-4" /> New Agreement</Button>
      </div>
      {customers.length === 0 && <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">Add a customer first before creating agreements.</p>}

      {agreementsQ.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!agreementsQ.isLoading && activeAgreements.length === 0 && !showHistory && (
        <div className="border rounded-xl p-10 text-center text-muted-foreground">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">{historicAgreements.length > 0 ? "No active agreements — use the history toggle to view past ones." : "No service agreements yet — land rentals, storage contracts, drying services and contract farming."}</p>
        </div>
      )}

      {visibleAgreements.length > 0 && (
        <div className="space-y-2">
          {showHistory && historicAgreements.length > 0 && (
            <p className="text-xs text-muted-foreground px-1 pb-1 border-b">Showing {activeAgreements.length} active + {historicAgreements.length} historic agreement{historicAgreements.length !== 1 ? "s" : ""}</p>
          )}
          {visibleAgreements.map((a) => {
            const expiry = expiryInfo(a);
            const isHistoric = a.status !== "active";
            return (
              <div key={a.id} className={`border rounded-xl p-4 hover:bg-muted/20 ${isHistoric ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-medium ${isHistoric ? "text-muted-foreground" : ""}`}>{a.title}</span>
                      {statusBadge(a.status, AGREEMENT_STATUS)}
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{agreementTypeLabel(a.agreementType)}</span>
                      {expiry && (
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${expiry.colour}`}>{expiry.label}</span>
                      )}
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
                    <Button variant="ghost" size="icon" title="Print agreement summary" onClick={() => printAgreementSummary(a)}><Printer className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setViewRecord(a)}><Eye className="h-4 w-4" /></Button>
                    {isHistoric ? (
                      <Button variant="ghost" size="sm" className="text-xs gap-1 h-8 px-2 text-green-700 hover:text-green-800 hover:bg-green-50" onClick={() => openRenew(a)} title="Create a new agreement based on this one">
                        <RefreshCw className="h-3.5 w-3.5" /> Renew
                      </Button>
                    ) : (
                      <Button variant="ghost" size="icon" onClick={() => openEdit(a)} title="Edit / extend agreement"><Pencil className="h-4 w-4" /></Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => deleteMut.mutate(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              </div>
            );
          })}
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
              <Button variant="outline" className="gap-1.5 mr-auto" onClick={() => printAgreementSummary(viewRecord)}><Printer className="h-4 w-4" /> Print</Button>
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
  const emptyMvForm = () => ({
    movementDate: new Date().toISOString().slice(0, 10), movementType: "outloading",
    quantityTonnes: "", destination: "", vehicleReg: "", haulier: "", haulierId: "",
    transportArrangedBy: "customer", notes: "",
  });
  const [mvForm, setMvForm] = useState(emptyMvForm());

  const emptyForm = () => ({
    customerId: "", agreementId: "", storageLocationId: "", intakeDate: new Date().toISOString().slice(0, 10),
    commodity: "Winter Wheat", variety: "", quantityTonnes: "", moisturePercent: "", screeningsPercent: "",
    specificWeightKgHl: "", grade: "", lotReference: "", deliveryNoteRef: "",
    vehicleReg: "", haulier: "", haulierId: "", transportArrangedBy: "customer",
    bayOrBin: "", status: "in_store", notes: "",
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

  // Storage locations — needed for the "which bay/bin" dropdown on intake
  const storageLocsQ = useQuery<{ records: StorageLocation[] }>({
    queryKey: ["storage-locations", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/storage-locations`, { credentials: "include" }).then((r) => r.ok ? r.json() : { records: [] }),
    enabled: !!farmId,
  });
  const storageLocs = storageLocsQ.data?.records ?? [];

  // Hauliers directory — used when the holding arranges transport
  const hauliersQ = useQuery<{ records: Haulier[] }>({
    queryKey: ["hauliers", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/hauliers`, { credentials: "include" }).then((r) => r.ok ? r.json() : { records: [] }),
    enabled: !!farmId,
  });
  const hauliers = hauliersQ.data?.records ?? [];

  const movementsQ = useQuery<{ records: GrainMovement[] }>({
    queryKey: ["grain-movements", farmId, expandedId],
    queryFn: () => fetch(`/api/farms/${farmId}/grain-intakes/${expandedId}/movements`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId && !!expandedId,
  });
  const movements = movementsQ.data?.records ?? [];

  const farmQ = useQuery<{ record: FarmRecord }>({
    queryKey: ["farm", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId,
  });
  const farm = farmQ.data?.record;

  function printLotCertificate(i: GrainIntake, lotMovements: GrainMovement[]) {
    const custName = customers.find((c) => c.id === i.customerId)?.name ?? "—";
    const custAddr = customers.find((c) => c.id === i.customerId)?.address ?? "";
    const custHolding = customers.find((c) => c.id === i.customerId)?.holdingNumber ?? "";
    const agr = agreements.find((a) => a.id === i.agreementId);
    const storageLoc = storageLocs.find((l) => l.id === i.storageLocationId);
    const lotRef = i.lotReference || `LOT-${String(i.id).padStart(5, "0")}`;
    const statusLabel = GRAIN_STATUSES.find((s) => s.value === i.status)?.label ?? i.status;
    const totalOut = lotMovements.filter((m) => m.movementType === "outloading").reduce((s, m) => s + parseFloat(m.quantityTonnes), 0);
    const balance = parseFloat(i.quantityTonnes) - totalOut;
    const mvRows = lotMovements.length > 0 ? lotMovements.map((m) =>
      `<tr>
        <td>${m.movementDate}</td>
        <td>${MOVEMENT_TYPES.find((t) => t.value === m.movementType)?.label ?? m.movementType}</td>
        <td class="amount">${parseFloat(m.quantityTonnes).toFixed(3)} t</td>
        <td>${m.destination ?? "—"}</td>
        <td>${m.vehicleReg ?? "—"}</td>
        <td>${m.haulier ?? "—"}</td>
      </tr>`).join("") : `<tr><td colspan="6" style="color:#888;font-style:italic">No movements recorded</td></tr>`;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Lot Certificate ${lotRef}</title>${docStyles()}</head><body>
      ${docHeader(farm)}
      <div class="doc-title">Grain Intake / Lot Certificate</div>
      <div class="grid-2" style="margin-bottom:20px">
        <div>
          <div class="lbl">Lot Reference</div>
          <div style="font-size:20px;font-weight:700;color:#2d5a27;font-variant-numeric:tabular-nums">${lotRef}</div>
          <div style="margin-top:8px"><div class="lbl">Customer / Supplier</div>
          <div class="val">${custName}</div>
          ${custAddr ? `<div style="font-size:11px;color:#555">${custAddr}</div>` : ""}
          ${custHolding ? `<div style="font-size:11px;color:#555">CPH: ${custHolding}</div>` : ""}</div>
        </div>
        <div style="text-align:right">
          <span class="badge">${statusLabel}</span>
          ${agr ? `<div style="margin-top:6px;font-size:11px;color:#555">Agreement: ${agr.title}</div>` : ""}
        </div>
      </div>
      <table>
        <thead><tr><th colspan="2">Intake Details</th></tr></thead>
        <tbody>
          <tr><td style="width:50%" class="lbl">Intake Date</td><td class="val">${i.intakeDate}</td></tr>
          <tr><td class="lbl">Commodity</td><td class="val">${i.commodity}${i.variety ? " — " + i.variety : ""}</td></tr>
          <tr><td class="lbl">Quantity on Intake</td><td class="val" style="font-weight:700">${parseFloat(i.quantityTonnes).toFixed(3)} t</td></tr>
          ${i.moisturePercent ? `<tr><td class="lbl">Moisture</td><td class="val">${i.moisturePercent}%</td></tr>` : ""}
          ${i.specificWeightKgHl ? `<tr><td class="lbl">Specific Weight</td><td class="val">${i.specificWeightKgHl} kg/hl</td></tr>` : ""}
          ${i.screeningsPercent ? `<tr><td class="lbl">Screenings</td><td class="val">${i.screeningsPercent}%</td></tr>` : ""}
          ${i.grade ? `<tr><td class="lbl">Grade</td><td class="val">${i.grade}</td></tr>` : ""}
          ${i.deliveryNoteRef ? `<tr><td class="lbl">Delivery Note Ref</td><td class="val">${i.deliveryNoteRef}</td></tr>` : ""}
          ${i.vehicleReg ? `<tr><td class="lbl">Vehicle Reg (intake)</td><td class="val">${i.vehicleReg}</td></tr>` : ""}
          ${i.haulier ? `<tr><td class="lbl">Haulier (intake)</td><td class="val">${i.haulier}</td></tr>` : ""}
          ${storageLoc ? `<tr><td class="lbl">Storage Location</td><td class="val">${storageLoc.name}${storageLoc.storageCode ? " (" + storageLoc.storageCode + ")" : ""}</td></tr>` : ""}
          ${i.bayOrBin ? `<tr><td class="lbl">Bay / Bin</td><td class="val">${i.bayOrBin}</td></tr>` : ""}
          ${i.notes ? `<tr><td class="lbl">Notes</td><td class="val">${i.notes}</td></tr>` : ""}
        </tbody>
      </table>
      <div class="section">
        <h2>Movement History</h2>
        <table>
          <thead><tr><th>Date</th><th>Type</th><th class="amount">Quantity</th><th>Destination</th><th>Vehicle</th><th>Haulier</th></tr></thead>
          <tbody>${mvRows}</tbody>
          <tfoot>
            <tr class="tr-total">
              <td colspan="2">Balance Remaining</td>
              <td class="amount">${balance.toFixed(3)} t</td>
              <td colspan="3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div class="footer"><span>Lot Certificate: ${lotRef} — ${custName}</span><span>Produced by BDE Farm Trac · Red Tractor Scheme</span></div>
    </body></html>`;
    printHtml(html);
  }

  function printMovementCertificate(i: GrainIntake, m: GrainMovement) {
    const custName = customers.find((c) => c.id === i.customerId)?.name ?? "—";
    const lotRef = i.lotReference || `LOT-${String(i.id).padStart(5, "0")}`;
    const mvTypeLabel = MOVEMENT_TYPES.find((t) => t.value === m.movementType)?.label ?? m.movementType;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Movement Certificate</title>${docStyles()}</head><body>
      ${docHeader(farm)}
      <div class="doc-title">${mvTypeLabel} Certificate</div>
      <div class="grid-2" style="margin-bottom:20px">
        <div>
          <div class="lbl">Customer</div>
          <div class="val" style="font-size:13px">${custName}</div>
          <div style="margin-top:8px"><div class="lbl">Lot Reference</div>
          <div style="font-weight:700;color:#2d5a27">${lotRef}</div></div>
        </div>
        <div style="text-align:right">
          <div style="font-size:22px;font-weight:700;color:#2d5a27">${m.movementDate}</div>
          <div style="font-size:11px;color:#888">Movement Date</div>
        </div>
      </div>
      <table>
        <thead><tr><th colspan="2">Movement Details</th></tr></thead>
        <tbody>
          <tr><td style="width:50%" class="lbl">Movement Type</td><td class="val">${mvTypeLabel}</td></tr>
          <tr><td class="lbl">Commodity</td><td class="val">${i.commodity}${i.variety ? " — " + i.variety : ""}</td></tr>
          <tr><td class="lbl">Quantity</td><td class="val" style="font-weight:700;font-size:14px">${parseFloat(m.quantityTonnes).toFixed(3)} t</td></tr>
          ${m.destination ? `<tr><td class="lbl">Destination / Buyer</td><td class="val">${m.destination}</td></tr>` : ""}
          ${m.vehicleReg ? `<tr><td class="lbl">Vehicle Registration</td><td class="val" style="font-family:monospace">${m.vehicleReg}</td></tr>` : ""}
          ${m.haulier ? `<tr><td class="lbl">Haulier</td><td class="val">${m.haulier}</td></tr>` : ""}
          ${m.deliveryNoteRef ? `<tr><td class="lbl">Delivery Note Ref</td><td class="val">${m.deliveryNoteRef}</td></tr>` : ""}
          <tr><td class="lbl">Quantity on Original Intake</td><td class="val">${parseFloat(i.quantityTonnes).toFixed(3)} t</td></tr>
          ${m.notes ? `<tr><td class="lbl">Notes</td><td class="val">${m.notes}</td></tr>` : ""}
        </tbody>
      </table>
      <div class="highlight" style="margin-top:20px">
        This document confirms the ${mvTypeLabel.toLowerCase()} of <strong>${parseFloat(m.quantityTonnes).toFixed(3)} tonnes</strong> of
        <strong>${i.commodity}</strong> from lot <strong>${lotRef}</strong> belonging to <strong>${custName}</strong>
        on <strong>${m.movementDate}</strong>.
      </div>
      <div class="footer"><span>Movement Certificate — ${lotRef} — ${m.movementDate}</span><span>Produced by BDE Farm Trac · Red Tractor Scheme</span></div>
    </body></html>`;
    printHtml(html);
  }

  function printStorageStatement() {
    const activeIntakes = intakes.filter((i) => i.status !== "removed");
    const byCustomer = customers.map((c) => ({
      customer: c,
      lots: activeIntakes.filter((i) => i.customerId === c.id),
    })).filter((g) => g.lots.length > 0);
    const totalInStoreAll = activeIntakes.reduce((s, i) => s + parseFloat(i.quantityTonnes), 0);
    const custSections = byCustomer.map(({ customer: c, lots }) => {
      const custTotal = lots.reduce((s, i) => s + parseFloat(i.quantityTonnes), 0);
      const rows = lots.map((i) => {
        const loc = storageLocs.find((l) => l.id === i.storageLocationId);
        return `<tr>
          <td>${i.lotReference || `LOT-${String(i.id).padStart(5, "0")}`}</td>
          <td>${i.intakeDate}</td>
          <td>${i.commodity}${i.variety ? " — " + i.variety : ""}</td>
          <td class="amount">${parseFloat(i.quantityTonnes).toFixed(3)}</td>
          <td>${loc ? loc.name : (i.bayOrBin || "—")}</td>
          <td><span style="font-size:10px;padding:2px 6px;border-radius:9px;background:${i.status === "in_store" ? "#dcfce7" : "#fef9c3"};color:${i.status === "in_store" ? "#166534" : "#713f12"}">${GRAIN_STATUSES.find((s) => s.value === i.status)?.label ?? i.status}</span></td>
        </tr>`;
      }).join("");
      return `<div style="margin-bottom:24px">
        <h2 style="font-size:13px;font-weight:700;margin:0 0 4px;color:#1a1a1a">${c.name}</h2>
        ${c.holdingNumber ? `<div style="font-size:11px;color:#888;margin-bottom:6px">CPH: ${c.holdingNumber}</div>` : ""}
        <table>
          <thead><tr>
            <th>Lot Reference</th><th>Intake Date</th><th>Commodity</th>
            <th class="amount">Quantity (t)</th><th>Location</th><th>Status</th>
          </tr></thead>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr class="tr-total">
              <td colspan="3">Total in Store — ${c.name}</td>
              <td class="amount">${custTotal.toFixed(3)}</td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>
      </div>`;
    }).join("");
    const emptyNote = byCustomer.length === 0 ? `<p style="color:#888;font-style:italic;text-align:center;padding:24px">No third-party grain currently in store.</p>` : "";
    const now = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Grain Storage Statement — ${now}</title>${docStyles()}</head><body>
      ${docHeader(farm)}
      <div class="doc-title">Grain Storage Statement</div>
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:20px">
        <div style="font-size:12px;color:#555">Statement date: <strong>${now}</strong></div>
        <div style="font-size:16px;font-weight:700;color:#2d5a27">Total: ${totalInStoreAll.toFixed(3)} t</div>
      </div>
      ${custSections}${emptyNote}
      <div class="footer"><span>Grain Storage Statement — ${farm?.name ?? ""} — ${now}</span><span>Produced by BDE Farm Trac · Red Tractor Scheme</span></div>
    </body></html>`;
    printHtml(html);
  }

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
    setForm({
      customerId: String(i.customerId), agreementId: i.agreementId ? String(i.agreementId) : "",
      storageLocationId: i.storageLocationId ? String(i.storageLocationId) : "",
      intakeDate: i.intakeDate, commodity: i.commodity, variety: i.variety ?? "",
      quantityTonnes: i.quantityTonnes, moisturePercent: i.moisturePercent ?? "",
      screeningsPercent: i.screeningsPercent ?? "", specificWeightKgHl: i.specificWeightKgHl ?? "",
      grade: i.grade ?? "", lotReference: i.lotReference ?? "", deliveryNoteRef: i.deliveryNoteRef ?? "",
      vehicleReg: i.vehicleReg ?? "", haulier: i.haulier ?? "",
      haulierId: i.haulierId ? String(i.haulierId) : "",
      transportArrangedBy: i.transportArrangedBy || "customer",
      bayOrBin: i.bayOrBin ?? "", status: i.status, notes: i.notes ?? "",
    });
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
        <div className="flex items-center gap-2 ml-auto">
          {intakes.length > 0 && (
            <Button size="sm" variant="outline" className="gap-1.5" onClick={printStorageStatement} title="Print grain storage statement"><Printer className="h-4 w-4" /> Storage Statement</Button>
          )}
          <Button size="sm" className="gap-1.5" onClick={openAdd} disabled={customers.length === 0}><Plus className="h-4 w-4" /> Book In Grain</Button>
        </div>
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
                          <Button variant="ghost" size="icon" title="Print lot certificate" onClick={() => printLotCertificate(i, isExp ? movements : [])}><Printer className="h-4 w-4" /></Button>
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
                              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => { setMovementOpen(i.id); setMvForm(emptyMvForm()); }}>
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
                                <button title="Print movement certificate" onClick={() => printMovementCertificate(i, m)} className="ml-auto text-muted-foreground hover:text-foreground"><Printer className="h-3.5 w-3.5" /></button>
                                <button onClick={() => deleteMv.mutate({ intakeId: i.id, mvId: m.id })} className="text-destructive hover:opacity-70"><Trash2 className="h-3.5 w-3.5" /></button>
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
              <Button variant="outline" className="gap-1.5 mr-auto" onClick={() => printLotCertificate(viewRecord, expandedId === viewRecord.id ? movements : [])}><Printer className="h-4 w-4" /> Lot Certificate</Button>
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

            {/* Storage location + Bay/Bin */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Storage location</Label>
                {storageLocs.length > 0 ? (
                  <Select value={form.storageLocationId || "__none__"} onValueChange={(v) => setForm((f) => ({ ...f, storageLocationId: v === "__none__" ? "" : v }))}>
                    <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Not specified</SelectItem>
                      {storageLocs.map((loc) => <SelectItem key={loc.id} value={String(loc.id)}>{loc.name}{loc.storageCode ? ` (${loc.storageCode})` : ""}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input placeholder="e.g. North Barn" value={form.bayOrBin} onChange={(e) => setForm((f) => ({ ...f, bayOrBin: e.target.value }))} />
                )}
              </div>
              {storageLocs.length > 0 && (
                <div className="space-y-1"><Label>Bay / Bin (within location)</Label>
                  <Input placeholder="e.g. Bay A, North end" value={form.bayOrBin} onChange={(e) => setForm((f) => ({ ...f, bayOrBin: e.target.value }))} /></div>
              )}
            </div>

            {/* Transport arrangement */}
            <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
              <div className="space-y-1">
                <Label>Transport arranged by</Label>
                <div className="flex gap-2 mt-1">
                  {[{ v: "customer", label: "Customer's lorry" }, { v: "holding", label: "Holding arranged" }].map(({ v, label }) => (
                    <button key={v} type="button"
                      onClick={() => setForm((f) => ({ ...f, transportArrangedBy: v, haulierId: v === "customer" ? "" : f.haulierId }))}
                      className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${form.transportArrangedBy === v ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:border-primary/50"}`}>
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {form.transportArrangedBy === "customer" ? "Customer organised their own haulier — record the vehicle that arrived." : "Holding booked a haulier from your directory on the customer's behalf."}
                </p>
              </div>
              {form.transportArrangedBy === "holding" && hauliers.length > 0 ? (
                <div className="space-y-1">
                  <Label>Haulier (from directory)</Label>
                  <Select value={form.haulierId || "__none__"} onValueChange={(v) => {
                    const h = hauliers.find((x) => String(x.id) === v);
                    setForm((f) => ({ ...f, haulierId: v === "__none__" ? "" : v, haulier: h ? h.companyName : f.haulier }));
                  }}>
                    <SelectTrigger><SelectValue placeholder="Select haulier" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Not in directory</SelectItem>
                      {hauliers.map((h) => <SelectItem key={h.id} value={String(h.id)}>{h.companyName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Vehicle reg</Label>
                  <Input placeholder="AB12 CDE" value={form.vehicleReg} onChange={(e) => setForm((f) => ({ ...f, vehicleReg: e.target.value }))} /></div>
                {(form.transportArrangedBy === "customer" || !hauliers.length) && (
                  <div className="space-y-1"><Label>Haulier {form.transportArrangedBy === "customer" ? "(if known)" : ""}</Label>
                    <Input placeholder="Haulier name" value={form.haulier} onChange={(e) => setForm((f) => ({ ...f, haulier: e.target.value }))} /></div>
                )}
              </div>
            </div>
            <div className="space-y-1"><Label>Notes</Label>
              <Textarea rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={saveMut.isPending || !form.customerId || !form.intakeDate || !form.quantityTonnes}
              onClick={() => saveMut.mutate({
                ...form,
                customerId: parseInt(form.customerId),
                agreementId: form.agreementId ? parseInt(form.agreementId) : null,
                storageLocationId: form.storageLocationId ? parseInt(form.storageLocationId) : null,
                haulierId: form.haulierId ? parseInt(form.haulierId) : null,
                quantityTonnes: form.quantityTonnes,
                moisturePercent: form.moisturePercent || null,
                screeningsPercent: form.screeningsPercent || null,
                specificWeightKgHl: form.specificWeightKgHl || null,
              })}>
              {saveMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : edit ? "Save Changes" : "Book In"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Movement dialog */}
      <Dialog open={movementOpen !== null} onOpenChange={(o) => { if (!o) setMovementOpen(null); }}>
        <DialogContent style={{ maxWidth: 520 }} aria-describedby={undefined}>
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
            </div>

            {/* Transport arrangement for movements */}
            <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
              <div className="space-y-1">
                <Label>Transport arranged by</Label>
                <div className="flex gap-2 mt-1">
                  {[{ v: "customer", label: "Customer's lorry" }, { v: "holding", label: "Holding arranged" }].map(({ v, label }) => (
                    <button key={v} type="button"
                      onClick={() => setMvForm((f) => ({ ...f, transportArrangedBy: v, haulierId: v === "customer" ? "" : f.haulierId }))}
                      className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${mvForm.transportArrangedBy === v ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:border-primary/50"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {mvForm.transportArrangedBy === "holding" && hauliers.length > 0 ? (
                <div className="space-y-1">
                  <Label>Haulier (from directory)</Label>
                  <Select value={mvForm.haulierId || "__none__"} onValueChange={(v) => {
                    const h = hauliers.find((x) => String(x.id) === v);
                    setMvForm((f) => ({ ...f, haulierId: v === "__none__" ? "" : v, haulier: h ? h.companyName : f.haulier }));
                  }}>
                    <SelectTrigger><SelectValue placeholder="Select haulier" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Not in directory</SelectItem>
                      {hauliers.map((h) => <SelectItem key={h.id} value={String(h.id)}>{h.companyName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Vehicle reg</Label>
                  <Input placeholder="AB12 CDE" value={mvForm.vehicleReg} onChange={(e) => setMvForm((f) => ({ ...f, vehicleReg: e.target.value }))} /></div>
                {(mvForm.transportArrangedBy === "customer" || !hauliers.length) && (
                  <div className="space-y-1"><Label>Haulier {mvForm.transportArrangedBy === "customer" ? "(if known)" : ""}</Label>
                    <Input placeholder="Haulier name" value={mvForm.haulier} onChange={(e) => setMvForm((f) => ({ ...f, haulier: e.target.value }))} /></div>
                )}
              </div>
            </div>

            <div className="space-y-1"><Label>Notes</Label>
              <Input value={mvForm.notes} onChange={(e) => setMvForm((f) => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMovementOpen(null)}>Cancel</Button>
            <Button disabled={saveMv.isPending || !mvForm.quantityTonnes}
              onClick={() => movementOpen !== null && saveMv.mutate({
                intakeId: movementOpen,
                body: {
                  ...mvForm,
                  haulierId: mvForm.haulierId ? parseInt(mvForm.haulierId) : null,
                  destination: mvForm.destination || null,
                  vehicleReg: mvForm.vehicleReg || null,
                  haulier: mvForm.haulier || null,
                  notes: mvForm.notes || null,
                },
              })}>
              {saveMv.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Record Movement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Invoices Tab ─────────────────────────────────────────────────────────────

// ─── Work Orders Tab ──────────────────────────────────────────────────────────

const WO_STATUSES = [
  { value: "pending",     label: "Scheduled",   colour: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "in_progress", label: "In Progress",  colour: "bg-amber-100 text-amber-800 border-amber-200" },
  { value: "completed",   label: "Completed",    colour: "bg-green-100 text-green-800 border-green-200" },
  { value: "cancelled",   label: "Cancelled",    colour: "bg-gray-100 text-gray-600 border-gray-200" },
];
function woBadge(status: string) {
  const s = WO_STATUSES.find((x) => x.value === status) ?? { label: status, colour: "bg-gray-100 text-gray-600 border-gray-200" };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${s.colour}`}>{s.label}</span>;
}

function WorkOrdersTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [filter, setFilter] = useState<"open" | "all">("open");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editWo, setEditWo] = useState<WorkOrder | null>(null);
  const [completionNote, setCompletionNote] = useState("");
  const [completingId, setCompletingId] = useState<number | null>(null);

  const emptyWoForm = () => ({
    title: "", description: "", assignedToMemberId: "", dueDate: new Date().toISOString().slice(0, 10),
    estimatedHours: "", assignmentNote: "",
  });
  const [woForm, setWoForm] = useState(emptyWoForm());

  const workOrdersQ = useQuery<{ records: WorkOrder[] }>({
    queryKey: ["work-orders", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/work-orders`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId,
  });
  const allOrders = workOrdersQ.data?.records ?? [];

  const membersQ = useQuery<{ records: FarmMember[] }>({
    queryKey: ["farm-members", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/members`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId,
  });
  const members = membersQ.data?.records ?? [];

  const orders = filter === "open"
    ? allOrders.filter((w) => w.status !== "completed" && w.status !== "cancelled")
    : allOrders;

  const createMut = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetch(`/api/farms/${farmId}/task-assignments`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["work-orders", farmId] }); setDialogOpen(false); toast({ title: "Work order created" }); },
    onError: () => toast({ title: "Failed to create work order", variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
      fetch(`/api/farms/${farmId}/task-assignments/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["work-orders", farmId] }); setCompletingId(null); setCompletionNote(""); toast({ title: "Work order updated" }); },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/task-assignments/${id}`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["work-orders", farmId] }); toast({ title: "Work order deleted" }); },
  });

  function openCreate() { setEditWo(null); setWoForm(emptyWoForm()); setDialogOpen(true); }
  function openEdit(wo: WorkOrder) {
    setEditWo(wo);
    setWoForm({
      title: wo.title, description: wo.description ?? "",
      assignedToMemberId: String(wo.assignedToMemberId), dueDate: wo.dueDate ?? "",
      estimatedHours: wo.estimatedHours ?? "", assignmentNote: wo.assignmentNote ?? "",
    });
    setDialogOpen(true);
  }

  function handleSave() {
    if (!woForm.title || !woForm.assignedToMemberId) { toast({ title: "Title and assignee are required", variant: "destructive" }); return; }
    if (editWo) {
      updateMut.mutate({ id: editWo.id, body: {
        title: woForm.title, description: woForm.description || null,
        dueDate: woForm.dueDate || null, estimatedHours: woForm.estimatedHours || null,
        assignmentNote: woForm.assignmentNote || null, assignedToMemberId: parseInt(woForm.assignedToMemberId),
      }});
    } else {
      createMut.mutate({
        title: woForm.title, description: woForm.description || null,
        assignedToMemberId: parseInt(woForm.assignedToMemberId), dueDate: woForm.dueDate || null,
        estimatedHours: woForm.estimatedHours || null, assignmentNote: woForm.assignmentNote || null,
        isWorkOrder: true,
      });
    }
  }

  const openCount = allOrders.filter((w) => w.status !== "completed" && w.status !== "cancelled").length;
  const memberName = (id: number) => { const m = members.find((x) => x.id === id); return m ? `${m.firstName} ${m.lastName}` : `Member #${id}`; };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("open")}
            className={`text-sm px-3 py-1.5 rounded-md font-medium transition-colors ${filter === "open" ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}
          >Open {openCount > 0 && <span className="ml-1 bg-white/20 text-inherit rounded-full px-1.5 text-xs">{openCount}</span>}</button>
          <button
            onClick={() => setFilter("all")}
            className={`text-sm px-3 py-1.5 rounded-md font-medium transition-colors ${filter === "all" ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}
          >All</button>
        </div>
        <Button size="sm" className="gap-1.5" onClick={openCreate} disabled={members.length === 0}>
          <Plus className="h-4 w-4" /> New Work Order
        </Button>
      </div>

      {workOrdersQ.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}

      {!workOrdersQ.isLoading && orders.length === 0 && (
        <div className="border rounded-xl p-12 text-center text-muted-foreground">
          <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">{filter === "open" ? "No open work orders" : "No work orders yet"}</p>
          <p className="text-xs mt-1">
            {filter === "open"
              ? "All caught up — or switch to 'All' to see completed orders."
              : "Raise a work order when scheduling contract work for another farmer, or attach one when creating an invoice."}
          </p>
          {members.length === 0 && (
            <p className="text-xs mt-3 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 inline-block">
              Add staff members first so you can assign work orders to them.
            </p>
          )}
        </div>
      )}

      {orders.length > 0 && (
        <div className="border rounded-xl overflow-hidden divide-y">
          {orders.map((wo) => {
            const isExpanded = expandedId === wo.id;
            const isCompleting = completingId === wo.id;
            return (
              <div key={wo.id} className="bg-white">
                <button
                  className="w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : wo.id)}
                >
                  <div className="mt-0.5 text-primary/60">
                    {wo.status === "completed" ? <CheckSquare className="h-4.5 w-4.5 text-green-600" /> : <Circle className="h-4.5 w-4.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {wo.workOrderRef && <span className="text-xs font-mono text-muted-foreground">{wo.workOrderRef}</span>}
                      <span className="font-medium text-sm truncate">{wo.title}</span>
                      {woBadge(wo.status)}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" /> {wo.staffName}</span>
                      {wo.dueDate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {wo.dueDate}</span>}
                      {wo.estimatedHours && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {wo.estimatedHours}h est.</span>}
                      {wo.invoiceNumber && <span className="flex items-center gap-1"><Receipt className="h-3 w-3" /> {wo.invoiceNumber}</span>}
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 bg-muted/20 border-t">
                    {wo.description && <p className="text-sm text-muted-foreground pt-3">{wo.description}</p>}
                    {wo.assignmentNote && (
                      <div className="text-sm bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                        <span className="font-medium text-blue-800">Instructions: </span>
                        <span className="text-blue-700">{wo.assignmentNote}</span>
                      </div>
                    )}
                    {wo.completionNote && (
                      <div className="text-sm bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                        <span className="font-medium text-green-800">Completion note: </span>
                        <span className="text-green-700">{wo.completionNote}</span>
                      </div>
                    )}
                    {wo.completedAt && (
                      <p className="text-xs text-muted-foreground">Completed: {new Date(wo.completedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
                    )}

                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      {wo.status === "pending" && (
                        <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-amber-700 border-amber-300"
                          onClick={() => updateMut.mutate({ id: wo.id, body: { status: "in_progress" } })} disabled={updateMut.isPending}>
                          <Clock className="h-3 w-3" /> Mark In Progress
                        </Button>
                      )}
                      {(wo.status === "pending" || wo.status === "in_progress") && !isCompleting && (
                        <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-green-700 border-green-300"
                          onClick={() => setCompletingId(wo.id)}>
                          <CheckCircle className="h-3 w-3" /> Mark Complete
                        </Button>
                      )}
                      {isCompleting && (
                        <div className="flex items-center gap-2 w-full">
                          <Input className="h-8 text-xs flex-1" placeholder="Completion note (optional)…"
                            value={completionNote} onChange={(e) => setCompletionNote(e.target.value)} />
                          <Button size="sm" className="h-8 text-xs gap-1" disabled={updateMut.isPending}
                            onClick={() => updateMut.mutate({ id: wo.id, body: { status: "completed", completionNote: completionNote || null } })}>
                            {updateMut.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />} Confirm
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => { setCompletingId(null); setCompletionNote(""); }}>Cancel</Button>
                        </div>
                      )}
                      <div className="ml-auto flex items-center gap-1.5">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(wo)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => { if (confirm(`Delete work order ${wo.workOrderRef ?? wo.title}?`)) deleteMut.mutate(wo.id); }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent style={{ maxWidth: 520 }} aria-describedby={undefined}>
          <DialogHeader><DialogTitle>{editWo ? `Edit ${editWo.workOrderRef ?? "Work Order"}` : "New Work Order"}</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <Label>Job title <span className="text-destructive">*</span></Label>
              <Input placeholder="e.g. Hedge trimming — North Field boundary" value={woForm.title} onChange={(e) => setWoForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea rows={2} placeholder="Brief description of the work to be done…" value={woForm.description} onChange={(e) => setWoForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Assign to <span className="text-destructive">*</span></Label>
                <Select value={woForm.assignedToMemberId} onValueChange={(v) => setWoForm((f) => ({ ...f, assignedToMemberId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select staff member" /></SelectTrigger>
                  <SelectContent>
                    {members.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.firstName} {m.lastName}{m.jobTitle ? ` · ${m.jobTitle}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Scheduled date</Label>
                <Input type="date" value={woForm.dueDate} onChange={(e) => setWoForm((f) => ({ ...f, dueDate: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Estimated hours</Label>
                <Input type="number" step="0.5" min="0" placeholder="e.g. 3.5" value={woForm.estimatedHours} onChange={(e) => setWoForm((f) => ({ ...f, estimatedHours: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Instructions for assignee</Label>
              <Textarea rows={2} placeholder="Specific instructions, access codes, safety notes…" value={woForm.assignmentNote} onChange={(e) => setWoForm((f) => ({ ...f, assignmentNote: e.target.value }))} />
            </div>
            {members.length === 0 && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                No staff registered — add staff members in the Staff directory first.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button disabled={createMut.isPending || updateMut.isPending || !woForm.title || !woForm.assignedToMemberId} onClick={handleSave}>
              {(createMut.isPending || updateMut.isPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : editWo ? "Save Changes" : "Create Work Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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

  const emptyWoForm = () => ({ title: "", assignedToMemberId: "", scheduledDate: new Date().toISOString().slice(0, 10), estimatedHours: "", instructions: "" });
  const [woEnabled, setWoEnabled] = useState(false);
  const [woForm, setWoForm] = useState(emptyWoForm());

  const membersQ = useQuery<{ records: FarmMember[] }>({
    queryKey: ["farm-members", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/members`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId,
  });
  const members = membersQ.data?.records ?? [];

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

  const farmQ = useQuery<{ record: FarmRecord }>({
    queryKey: ["farm", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId,
  });
  const farm = farmQ.data?.record;

  function printInvoice(inv: ServiceInvoice & { effectiveStatus: string }) {
    const invLines = linesQ.data?.records ?? [];
    const invNumber = inv.invoiceNumber || `INV-${String(inv.id).padStart(4, "0")}`;
    const customer = customers.find((c) => c.id === inv.customerId);
    const agr = agreements.find((a) => a.id === inv.agreementId);
    const statusLabel = INVOICE_STATUSES.find((s) => s.value === inv.effectiveStatus)?.label ?? inv.effectiveStatus;
    const lineRows = invLines.map((l) =>
      `<tr>
        <td>${l.description}</td>
        <td class="amount">${l.quantity ? (l.quantity + " " + (l.unit ?? "")).trim() : "—"}</td>
        <td class="amount">${fmtPence(l.unitPricePence)}</td>
        <td class="amount">${fmtPence(l.lineTotalPence)}</td>
      </tr>`
    ).join("") || `<tr><td colspan="4" style="color:#888;font-style:italic">No line items</td></tr>`;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${invNumber}</title>${docStyles()}</head><body>
      ${docHeader(farm)}
      <div class="doc-title">Invoice</div>
      <div class="grid-2" style="margin-bottom:24px">
        <div>
          <div class="lbl">Invoice To</div>
          <div class="val" style="font-size:14px">${customer?.name ?? "—"}</div>
          ${customer?.address ? `<div style="font-size:11px;color:#555;margin-top:2px">${customer.address}</div>` : ""}
          ${customer?.holdingNumber ? `<div style="font-size:11px;color:#555">CPH: ${customer.holdingNumber}</div>` : ""}
          ${customer?.vatNumber ? `<div style="font-size:11px;color:#555">VAT No: ${customer.vatNumber}</div>` : ""}
        </div>
        <div style="text-align:right">
          <div style="font-size:20px;font-weight:700;color:#2d5a27;font-variant-numeric:tabular-nums">${invNumber}</div>
          <div style="margin-top:8px"><div class="lbl">Invoice Date</div><div class="val">${inv.invoiceDate}</div></div>
          ${inv.dueDate ? `<div style="margin-top:4px"><div class="lbl">Due Date</div><div class="val">${inv.dueDate}</div></div>` : ""}
          <div style="margin-top:6px"><span class="badge">${statusLabel}</span></div>
          ${agr ? `<div style="margin-top:6px;font-size:11px;color:#555">Agreement: ${agr.title}</div>` : ""}
        </div>
      </div>
      <table>
        <thead><tr><th>Description</th><th class="amount">Qty</th><th class="amount">Unit Price</th><th class="amount">Total</th></tr></thead>
        <tbody>${lineRows}</tbody>
        <tfoot>
          <tr><td colspan="3" class="amount" style="color:#888;padding-top:10px">Subtotal</td><td class="amount">${fmtPence(inv.subtotalPence)}</td></tr>
          <tr><td colspan="3" class="amount" style="color:#888">VAT (${inv.vatRatePercent}%)</td><td class="amount">${fmtPence(inv.vatPence)}</td></tr>
          <tr class="tr-total"><td colspan="3" class="amount">Total Due</td><td class="amount" style="font-size:15px">${fmtPence(inv.totalPence)}</td></tr>
          ${inv.paymentDate ? `<tr><td colspan="3" class="amount" style="color:#888;font-size:11px">Paid ${inv.paymentDate}${inv.paymentMethod ? " via " + inv.paymentMethod : ""}${inv.paymentReference ? " (Ref: " + inv.paymentReference + ")" : ""}</td><td class="amount" style="color:#2d5a27;font-weight:700">✓ Settled</td></tr>` : ""}
        </tfoot>
      </table>
      ${inv.notes ? `<p style="margin-top:16px;color:#555;font-size:11px"><strong>Notes:</strong> ${inv.notes}</p>` : ""}
      <div class="footer">
        <span>Invoice ${invNumber} — ${customer?.name ?? ""}</span>
        <span>Produced by BDE Farm Trac · Barnett Davies Enterprises Ltd</span>
      </div>
    </body></html>`;
    printHtml(html);
  }

  const saveMut = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetch(`/api/farms/${farmId}/service-invoices`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: async (data: { record?: ServiceInvoice }) => {
      qc.invalidateQueries({ queryKey: ["service-invoices", farmId] });
      setOpen(false);
      if (woEnabled && woForm.assignedToMemberId && woForm.title) {
        const invoiceId = data?.record?.id;
        const firstLine = lines.find((l) => l.description)?.description ?? "";
        const woTitle = woForm.title || firstLine || "Ad-hoc work order";
        await fetch(`/api/farms/${farmId}/task-assignments`, {
          method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
          body: JSON.stringify({
            isWorkOrder: true,
            title: woTitle,
            assignedToMemberId: parseInt(woForm.assignedToMemberId),
            dueDate: woForm.scheduledDate || null,
            estimatedHours: woForm.estimatedHours || null,
            assignmentNote: woForm.instructions || null,
            serviceInvoiceId: invoiceId ?? null,
          }),
        });
        qc.invalidateQueries({ queryKey: ["work-orders", farmId] });
        toast({ title: "Invoice created + work order raised", description: `${woTitle} has been assigned.` });
      } else {
        toast({ title: "Invoice created" });
      }
      setWoEnabled(false);
      setWoForm(emptyWoForm());
    },
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

  function openAdd() { setForm(emptyForm()); setLines([{ description: "", quantity: "", unit: "tonnes", unitPricePence: "", lineTotalPence: 0 }]); setWoEnabled(false); setWoForm(emptyWoForm()); setOpen(true); }
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
              <DialogFooter>
                {(() => { const inv = invoicesWithStatus.find((i) => i.id === viewId); return inv ? <Button variant="outline" className="gap-1.5 mr-auto" onClick={() => printInvoice(inv)}><Printer className="h-4 w-4" /> Print Invoice</Button> : null; })()}
                <Button variant="outline" onClick={() => setViewId(null)}>Close</Button>
              </DialogFooter>
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

            {/* Schedule Work Order panel */}
            <div className="border rounded-xl overflow-hidden">
              <button
                type="button"
                className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-muted/40 transition-colors"
                onClick={() => { setWoEnabled((v) => !v); if (!woEnabled) setWoForm((f) => ({ ...f, title: lines.find((l) => l.description)?.description ?? "" })); }}
              >
                <Briefcase className="h-4 w-4 text-primary" />
                <span className="flex-1 text-left">Schedule a Work Order with this invoice</span>
                {woEnabled ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                {woEnabled && <span className="text-xs text-primary font-semibold">On</span>}
              </button>
              {woEnabled && (
                <div className="border-t px-4 py-4 space-y-3 bg-muted/20">
                  <p className="text-xs text-muted-foreground">
                    A work order will be raised, assigned to a staff member, and appear in their task list and the Week Ahead planner. It's linked to this invoice for full traceability.
                  </p>
                  <div className="space-y-1">
                    <Label>Work description <span className="text-destructive">*</span></Label>
                    <Input placeholder="e.g. Hedge trimming — North Field" value={woForm.title}
                      onChange={(e) => setWoForm((f) => ({ ...f, title: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Assign to <span className="text-destructive">*</span></Label>
                      <Select value={woForm.assignedToMemberId} onValueChange={(v) => setWoForm((f) => ({ ...f, assignedToMemberId: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select staff member" /></SelectTrigger>
                        <SelectContent>
                          {members.map((m) => (
                            <SelectItem key={m.id} value={String(m.id)}>{m.firstName} {m.lastName}</SelectItem>
                          ))}
                          {members.length === 0 && <SelectItem value="" disabled>No staff registered</SelectItem>}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Scheduled date</Label>
                      <Input type="date" value={woForm.scheduledDate}
                        onChange={(e) => setWoForm((f) => ({ ...f, scheduledDate: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Estimated hours</Label>
                      <Input type="number" step="0.5" min="0" placeholder="e.g. 4" value={woForm.estimatedHours}
                        onChange={(e) => setWoForm((f) => ({ ...f, estimatedHours: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Instructions for assignee</Label>
                    <Textarea rows={2} placeholder="Access info, safety notes, specific tasks…" value={woForm.instructions}
                      onChange={(e) => setWoForm((f) => ({ ...f, instructions: e.target.value }))} />
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={saveMut.isPending || !form.customerId || lines.filter((l) => l.description).length === 0 || (woEnabled && (!woForm.title || !woForm.assignedToMemberId))} onClick={handleCreate}>
              {saveMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : woEnabled ? "Create Invoice + Work Order" : "Create Invoice"}
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
    const valid: Tab[] = ["customers", "agreements", "grain", "invoices", "work-orders"];
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
          <TabButton active={tab === "work-orders"} onClick={() => setTab("work-orders")}>
            <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> Work Orders</span>
          </TabButton>
        </TabBar>

        {tab === "customers" && farmId && <CustomersTab farmId={farmId} customers={customers} isLoading={customersQ.isLoading} />}
        {tab === "agreements" && farmId && <AgreementsTab farmId={farmId} customers={customers} />}
        {tab === "grain" && farmId && <GrainIntakeTab farmId={farmId} customers={customers} />}
        {tab === "invoices" && farmId && <InvoicesTab farmId={farmId} customers={customers} />}
        {tab === "work-orders" && farmId && <WorkOrdersTab farmId={farmId} />}
      </div>
    </AppLayout>
  );
}
