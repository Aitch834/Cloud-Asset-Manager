import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users, FileText, Wheat, Receipt, Plus, Pencil, Trash2, CheckCircle, XCircle,
  ChevronDown, ChevronUp, Building2, Phone, Mail, MapPin, Loader2,
  ClipboardList, TrendingUp, Package, AlertTriangle, Calendar, ArrowRight, Eye, RefreshCw, Printer,
  Briefcase, Clock, User, CheckSquare, Circle, Tractor, Fuel, ShieldCheck, ShieldAlert,
  ClipboardCheck, BarChart3, ArrowLeft, Wrench, X, ChevronRight, CalendarDays,
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

type Tab = "customers" | "agreements" | "grain" | "invoices" | "work-orders" | "hire";

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
  companyNumber?: string | null; vatNumber?: string | null;
  bankName?: string | null; bankAccountName?: string | null; bankAccountNumber?: string | null; bankSortCode?: string | null;
  paymentTermsDays?: number | null; invoiceFooterText?: string | null; invoiceLogoPath?: string | null;
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
  customerId?: number | null; customerName?: string | null;
  createdAt: string; completedAt?: string | null;
}

interface InvoicePrefill {
  customerId: number;
  customerName: string;
  title: string;
  suggestedLines?: Array<{ description: string; quantity: string; unit: string; unitPricePence: string; lineTotalPence: number }>;
}

// ─── Hire Types ──────────────────────────────────────────────────────────────

interface HireBooking {
  id: number; farmId: number; customerId: number; equipmentId: number;
  agreementId?: number | null; bookingRef?: string | null; startDate: string;
  plannedEndDate?: string | null; actualEndDate?: string | null;
  rateType: string; ratePence?: number | null; depositPence?: number | null;
  operatorType: string; operatorName?: string | null; fuelPolicy: string;
  insuranceVerified: boolean; insuranceNotes?: string | null;
  depositPaid: boolean; depositPaidDate?: string | null;
  status: string; totalHireCostPence?: number | null;
  jobReference?: string | null; fieldId?: number | null;
  notes?: string | null;
  createdAt: string; updatedAt?: string;
}

interface HireBookingRow {
  booking: HireBooking;
  customerName: string | null;
  equipmentName: string | null;
  equipmentMake: string | null;
  equipmentModel: string | null;
  equipmentRegistration: string | null;
}

interface HireBookingDetail {
  booking: HireBooking;
  customer: FarmCustomer | null;
  equipmentName: string | null;
  equipmentMake: string | null;
  equipmentModel: string | null;
  equipmentRegistration: string | null;
  equipmentCurrentHours: number | null;
  conditionLogs: HireConditionLog[];
  fuelIssues: HireFuelIssue[];
}

interface HireConditionLog {
  id: number; bookingId: number; logType: string; logDate: string;
  logTime?: string | null; hoursReading?: number | null; fuelLevelPercent?: number | null;
  conditionOverall?: string | null; conditionNotes?: string | null;
  damageNotes?: string | null; tyreConditionNotes?: string | null;
  attachmentNotes?: string | null; signedOffBy?: string | null; createdAt: string;
}

interface HireFuelIssue {
  id: number; bookingId: number; issueDate: string; litres: string;
  pricePerLitrePence?: number | null; totalCostPence?: number | null;
  billedToCustomer: boolean; issuedBy?: string | null; notes?: string | null;
  createdAt: string;
}

interface EquipmentItem {
  id: number; name: string; make?: string | null; model?: string | null;
  registrationNumber?: string | null; currentHours?: number | null;
}

interface InsuranceWarning { ok: boolean; warnings: string[]; }

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

const HIRE_STATUSES = [
  { value: "booked", label: "Booked", colour: "bg-blue-100 text-blue-800" },
  { value: "active", label: "Active", colour: "bg-green-100 text-green-800" },
  { value: "returned", label: "Returned", colour: "bg-purple-100 text-purple-800" },
  { value: "invoiced", label: "Invoiced", colour: "bg-amber-100 text-amber-800" },
  { value: "cancelled", label: "Cancelled", colour: "bg-muted text-muted-foreground" },
];

const HIRE_RATE_TYPES = [
  { value: "daily", label: "Daily" },
  { value: "hourly", label: "Hourly" },
  { value: "weekly", label: "Weekly" },
  { value: "fixed", label: "Fixed Price" },
];

const HIRE_OPERATOR_TYPES = [
  { value: "customer_operated", label: "Customer Operated" },
  { value: "farm_operator", label: "Farm Operator Provided" },
];

const HIRE_FUEL_POLICIES = [
  { value: "customer_supplied", label: "Customer Supplies Own Fuel" },
  { value: "included_in_rate", label: "Fuel Included in Rate" },
  { value: "billed_back", label: "Fuel Billed Back to Customer" },
];

const HIRE_CONDITION_RATINGS = [
  { value: "good", label: "Good", colour: "bg-green-100 text-green-800" },
  { value: "acceptable", label: "Acceptable", colour: "bg-amber-100 text-amber-800" },
  { value: "poor", label: "Poor — Damage Noted", colour: "bg-red-100 text-red-800" },
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
  const logoHtml = farm?.invoiceLogoPath
    ? `<img src="${window.location.origin}/api/storage/objects/${farm.invoiceLogoPath}" style="max-width:200px;max-height:70px;object-fit:contain;display:block;margin-bottom:6px" onerror="this.style.display='none'" />`
    : "";
  const metaParts = [
    farm?.address || "",
    farm?.postcode || "",
    farm?.bcmsHoldingNumber ? `CPH No: ${farm.bcmsHoldingNumber}` : "",
    farm?.companyNumber ? `Co. Reg: ${farm.companyNumber}` : "",
    farm?.vatNumber ? `VAT Reg: ${farm.vatNumber}` : "",
  ].filter(Boolean).join("<br>");
  return `<div class="doc-header">
    <div>
      ${logoHtml}
      <div class="farm-name">${farm?.name ?? "BDE Farm Trac"}</div>
      <div class="farm-meta">${metaParts}</div>
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
  const expiringCount = activeAgreements.filter((a) => expiryInfo(a) !== null).length;
  const landRentalAnnualPence = activeAgreements.filter((a) => a.agreementType === "land_rental").reduce((s, a) => s + (a.annualRentPence || 0), 0);

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
      {agreements.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-muted/40 rounded-lg p-3 text-center">
            <div className="text-xl font-bold">{agreements.length}</div>
            <div className="text-xs text-muted-foreground">Total Agreements</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-green-800">{activeAgreements.length}</div>
            <div className="text-xs text-green-700">Active</div>
          </div>
          <div className={`rounded-lg p-3 text-center ${expiringCount > 0 ? "bg-amber-50" : "bg-muted/40"}`}>
            <div className={`text-xl font-bold ${expiringCount > 0 ? "text-amber-800" : ""}`}>{expiringCount}</div>
            <div className={`text-xs ${expiringCount > 0 ? "text-amber-700" : "text-muted-foreground"}`}>Expiring ≤30 days</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-blue-800">{landRentalAnnualPence ? fmtPence(landRentalAnnualPence) : "—"}</div>
            <div className="text-xs text-blue-700">Annual Land Rent</div>
          </div>
        </div>
      )}
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
  const lotsInStore = intakes.filter((i) => i.status !== "removed").length;
  const totalReceivedTonnes = intakes.reduce((s, i) => s + parseFloat(i.quantityTonnes), 0);
  const commoditiesInStore = [...new Set(intakes.filter((i) => i.status !== "removed").map((i) => i.commodity))].length;

  return (
    <div className="space-y-3">
      {intakes.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-muted/40 rounded-lg p-3 text-center">
            <div className="text-xl font-bold">{intakes.length}</div>
            <div className="text-xs text-muted-foreground">Total Intakes</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-green-800">{lotsInStore}</div>
            <div className="text-xs text-green-700">Lots in Store</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-blue-800">{totalInStore.toFixed(1)}t</div>
            <div className="text-xs text-blue-700">Tonnes in Store</div>
          </div>
          <div className="bg-muted/40 rounded-lg p-3 text-center">
            <div className="text-xl font-bold">{totalReceivedTonnes.toFixed(1)}t</div>
            <div className="text-xs text-muted-foreground">Total Received</div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        {intakes.length > 0 && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{commoditiesInStore}</span> commodity type{commoditiesInStore !== 1 ? "s" : ""} currently in store
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

function WorkOrdersTab({ farmId, customers, onRaiseInvoice }: { farmId: number; customers: FarmCustomer[]; onRaiseInvoice: (prefill: InvoicePrefill) => void }) {
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
    estimatedHours: "", assignmentNote: "", customerId: "",
  });
  const [woForm, setWoForm] = useState(emptyWoForm());

  const workOrdersQ = useQuery<{ records: WorkOrder[] }>({
    queryKey: ["work-orders", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/work-orders`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId,
  });
  const allOrders = workOrdersQ.data?.records ?? [];

  const membersQ = useQuery<{ members: FarmMember[] }>({
    queryKey: ["farm-members", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/members`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId,
  });
  const members = membersQ.data?.members ?? [];

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
      customerId: wo.customerId ? String(wo.customerId) : "",
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
        customerId: woForm.customerId ? parseInt(woForm.customerId) : null,
      }});
    } else {
      createMut.mutate({
        title: woForm.title, description: woForm.description || null,
        assignedToMemberId: parseInt(woForm.assignedToMemberId), dueDate: woForm.dueDate || null,
        estimatedHours: woForm.estimatedHours || null, assignmentNote: woForm.assignmentNote || null,
        customerId: woForm.customerId ? parseInt(woForm.customerId) : null,
        isWorkOrder: true,
      });
    }
  }

  const openCount = allOrders.filter((w) => w.status !== "completed" && w.status !== "cancelled").length;
  const memberName = (id: number) => { const m = members.find((x) => x.id === id); return m ? `${m.firstName} ${m.lastName}` : `Member #${id}`; };
  const todayWo = new Date().toISOString().slice(0, 10);
  const thisMonthWo = new Date().toISOString().slice(0, 7);
  const overdueWoCount = allOrders.filter((w) => w.status !== "completed" && w.status !== "cancelled" && w.dueDate && w.dueDate < todayWo).length;
  const completedThisMonth = allOrders.filter((w) => w.status === "completed" && w.completedAt && w.completedAt.startsWith(thisMonthWo)).length;

  return (
    <div className="space-y-4">
      {allOrders.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-muted/40 rounded-lg p-3 text-center">
            <div className="text-xl font-bold">{allOrders.length}</div>
            <div className="text-xs text-muted-foreground">Total Orders</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-green-800">{openCount}</div>
            <div className="text-xs text-green-700">Open</div>
          </div>
          <div className={`rounded-lg p-3 text-center ${overdueWoCount > 0 ? "bg-red-50" : "bg-muted/40"}`}>
            <div className={`text-xl font-bold ${overdueWoCount > 0 ? "text-red-700" : ""}`}>{overdueWoCount}</div>
            <div className={`text-xs ${overdueWoCount > 0 ? "text-red-600" : "text-muted-foreground"}`}>Overdue</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-blue-800">{completedThisMonth}</div>
            <div className="text-xs text-blue-700">Completed This Month</div>
          </div>
        </div>
      )}
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
                      {wo.customerName && <span className="flex items-center gap-1 font-medium text-foreground/70"><Building2 className="h-3 w-3" /> {wo.customerName}</span>}
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
                        {!wo.invoiceNumber && (
                          <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5"
                            onClick={() => onRaiseInvoice({ customerId: wo.customerId ?? 0, customerName: wo.customerName ?? "", title: wo.title })}>
                            <Receipt className="h-3 w-3" /> Raise Invoice
                          </Button>
                        )}
                        {wo.invoiceNumber && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1 px-2"><Receipt className="h-3 w-3" /> {wo.invoiceNumber}</span>
                        )}
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
              <Label>Customer / farm this work is for</Label>
              <Select value={woForm.customerId} onValueChange={(v) => setWoForm((f) => ({ ...f, customerId: v === "none" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Select customer (optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— None / internal work —</SelectItem>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {customers.length === 0 && <p className="text-xs text-muted-foreground">Add customers in the Customers tab to link work orders to them.</p>}
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
                <Input type="date" min={new Date().toISOString().slice(0, 10)} value={woForm.dueDate} onChange={(e) => setWoForm((f) => ({ ...f, dueDate: e.target.value }))} />
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

function InvoicesTab({ farmId, customers, prefill }: { farmId: number; customers: FarmCustomer[]; prefill?: InvoicePrefill | null }) {
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

  // Auto-open new invoice dialog when navigated from a Work Order "Raise Invoice" button
  const prevPrefillRef = useRef<InvoicePrefill | null | undefined>(undefined);
  useEffect(() => {
    if (prefill && prefill !== prevPrefillRef.current) {
      prevPrefillRef.current = prefill;
      setForm((f) => ({ ...f, customerId: prefill.customerId ? String(prefill.customerId) : "" }));
      if (prefill.suggestedLines?.length) {
        setLines(prefill.suggestedLines);
      } else {
        setLines(prefill.title ? [{ description: prefill.title, quantity: "1", unit: "", unitPricePence: "0", lineTotalPence: 0 }] : []);
      }
      setOpen(true);
    }
  }, [prefill]);

  const emptyWoForm = () => ({ title: "", assignedToMemberId: "", scheduledDate: new Date().toISOString().slice(0, 10), estimatedHours: "", instructions: "" });
  const [woEnabled, setWoEnabled] = useState(false);
  const [woForm, setWoForm] = useState(emptyWoForm());

  const membersQ = useQuery<{ members: FarmMember[] }>({
    queryKey: ["farm-members", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/members`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId,
  });
  const members = membersQ.data?.members ?? [];

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
      ${(farm?.bankAccountNumber || farm?.bankSortCode || farm?.bankName) ? `
      <div style="margin-top:20px;padding:12px 16px;background:#f0f5ef;border:1px solid #c5d9c2;border-radius:6px">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:#2d5a27;font-weight:700;margin-bottom:8px">Payment Details</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:11px">
          ${farm.bankName ? `<div><span style="color:#888">Bank:</span> ${farm.bankName}</div>` : ""}
          ${farm.bankAccountName ? `<div><span style="color:#888">Account Name:</span> ${farm.bankAccountName}</div>` : ""}
          ${farm.bankAccountNumber ? `<div><span style="color:#888">Account Number:</span> ${farm.bankAccountNumber}</div>` : ""}
          ${farm.bankSortCode ? `<div><span style="color:#888">Sort Code:</span> ${farm.bankSortCode}</div>` : ""}
          ${farm?.paymentTermsDays ? `<div style="grid-column:1/-1;margin-top:4px;color:#2d5a27;font-weight:600">Payment due within ${farm.paymentTermsDays} days of invoice date.</div>` : ""}
        </div>
      </div>` : ""}
      ${farm?.invoiceFooterText ? `<p style="margin-top:14px;font-size:10.5px;color:#555;border-top:1px solid #e5e7eb;padding-top:10px">${farm.invoiceFooterText}</p>` : ""}
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
  const paidInvoices = invoicesWithStatus.filter((i) => i.effectiveStatus === "paid");
  const paidTotal = paidInvoices.reduce((s, i) => s + i.totalPence, 0);
  const draftCount = invoicesWithStatus.filter((i) => i.effectiveStatus === "draft").length;

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
      {invoicesWithStatus.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-muted/40 rounded-lg p-3 text-center">
            <div className="text-xl font-bold">{invoicesWithStatus.length}</div>
            <div className="text-xs text-muted-foreground">Total Invoices</div>
          </div>
          <div className={`rounded-lg p-3 text-center ${totalOutstanding > 0 ? "bg-amber-50" : "bg-muted/40"}`}>
            <div className={`text-xl font-bold ${totalOutstanding > 0 ? "text-amber-800" : ""}`}>{fmtPence(totalOutstanding)}</div>
            <div className={`text-xs ${totalOutstanding > 0 ? "text-amber-700" : "text-muted-foreground"}`}>Outstanding</div>
          </div>
          <div className={`rounded-lg p-3 text-center ${overdueInvoices.length > 0 ? "bg-red-50" : "bg-muted/40"}`}>
            <div className={`text-xl font-bold ${overdueInvoices.length > 0 ? "text-red-700" : ""}`}>{overdueInvoices.length > 0 ? fmtPence(overdueTotal) : "—"}</div>
            <div className={`text-xs ${overdueInvoices.length > 0 ? "text-red-600" : "text-muted-foreground"}`}>Overdue{overdueInvoices.length > 0 ? ` (${overdueInvoices.length})` : ""}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-green-800">{fmtPence(paidTotal)}</div>
            <div className="text-xs text-green-700">Paid ({paidInvoices.length})</div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        {draftCount > 0 && (
          <div className="text-sm text-muted-foreground">
            {draftCount} draft{draftCount !== 1 ? "s" : ""} not yet sent
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
                <Input type="date" max={new Date().toISOString().slice(0, 10)} value={form.invoiceDate} onChange={(e) => setForm((f) => ({ ...f, invoiceDate: e.target.value }))} /></div>
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
                      <Input type="date" min={new Date().toISOString().slice(0, 10)} value={woForm.scheduledDate}
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

// ─── Equipment Hire Tab ───────────────────────────────────────────────────────

function printHireAgreement(
  detail: HireBookingDetail,
  farm: FarmRecord | undefined,
) {
  const b = detail.booking;
  const eq = [detail.equipmentName, detail.equipmentMake, detail.equipmentModel].filter(Boolean).join(" — ");
  const reg = detail.equipmentRegistration ? ` (Reg: ${detail.equipmentRegistration})` : "";
  const rateLabel = HIRE_RATE_TYPES.find((r) => r.value === b.rateType)?.label ?? b.rateType;
  const fuelLabel = HIRE_FUEL_POLICIES.find((f) => f.value === b.fuelPolicy)?.label ?? b.fuelPolicy;
  const opLabel = HIRE_OPERATOR_TYPES.find((o) => o.value === b.operatorType)?.label ?? b.operatorType;
  const rate = b.ratePence ? `£${(b.ratePence / 100).toFixed(2)} per ${rateLabel.toLowerCase()}` : "Rate TBC";
  const deposit = b.depositPence ? `£${(b.depositPence / 100).toFixed(2)}` : "None";

  const html = `<!DOCTYPE html><html><head><title>Hire Agreement — ${b.bookingRef || `#${b.id}`}</title>
  ${docStyles()}</head><body>
  ${docHeader(farm)}
  <h2>Equipment Hire Agreement</h2>
  <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
    <tr><td style="padding:5px 8px;border:1px solid #ddd;background:#f9f9f9;font-weight:600;width:38%">Booking Reference</td><td style="padding:5px 8px;border:1px solid #ddd">${b.bookingRef || `HIRE-${b.id}`}</td></tr>
    <tr><td style="padding:5px 8px;border:1px solid #ddd;background:#f9f9f9;font-weight:600">Hire Date (Start)</td><td style="padding:5px 8px;border:1px solid #ddd">${b.startDate}</td></tr>
    <tr><td style="padding:5px 8px;border:1px solid #ddd;background:#f9f9f9;font-weight:600">Planned Return Date</td><td style="padding:5px 8px;border:1px solid #ddd">${b.plannedEndDate || "Open"}</td></tr>
    <tr><td style="padding:5px 8px;border:1px solid #ddd;background:#f9f9f9;font-weight:600">Customer</td><td style="padding:5px 8px;border:1px solid #ddd">${detail.customer?.name || "—"}</td></tr>
    <tr><td style="padding:5px 8px;border:1px solid #ddd;background:#f9f9f9;font-weight:600">Customer Contact</td><td style="padding:5px 8px;border:1px solid #ddd">${detail.customer?.contactName || "—"}  ${detail.customer?.contactPhone || ""}</td></tr>
    <tr><td style="padding:5px 8px;border:1px solid #ddd;background:#f9f9f9;font-weight:600">Machine</td><td style="padding:5px 8px;border:1px solid #ddd">${eq}${reg}</td></tr>
    <tr><td style="padding:5px 8px;border:1px solid #ddd;background:#f9f9f9;font-weight:600">Operator</td><td style="padding:5px 8px;border:1px solid #ddd">${opLabel}${b.operatorName ? ` — ${b.operatorName}` : ""}</td></tr>
    <tr><td style="padding:5px 8px;border:1px solid #ddd;background:#f9f9f9;font-weight:600">Hire Rate</td><td style="padding:5px 8px;border:1px solid #ddd">${rate}</td></tr>
    <tr><td style="padding:5px 8px;border:1px solid #ddd;background:#f9f9f9;font-weight:600">Deposit</td><td style="padding:5px 8px;border:1px solid #ddd">${deposit}${b.depositPaidDate ? ` — Received ${b.depositPaidDate}` : " — Awaiting"}</td></tr>
    <tr><td style="padding:5px 8px;border:1px solid #ddd;background:#f9f9f9;font-weight:600">Fuel Arrangement</td><td style="padding:5px 8px;border:1px solid #ddd">${fuelLabel}</td></tr>
    <tr><td style="padding:5px 8px;border:1px solid #ddd;background:#f9f9f9;font-weight:600">Insurance Verified</td><td style="padding:5px 8px;border:1px solid #ddd">${b.insuranceVerified ? "✓ Yes — operator has confirmed valid insurance" : "✗ Not yet verified"}${b.insuranceNotes ? ` — ${b.insuranceNotes}` : ""}</td></tr>
    ${b.notes ? `<tr><td style="padding:5px 8px;border:1px solid #ddd;background:#f9f9f9;font-weight:600">Notes</td><td style="padding:5px 8px;border:1px solid #ddd">${b.notes}</td></tr>` : ""}
  </table>
  <h2 style="margin-top:24px">Terms &amp; Conditions</h2>
  <ol style="font-size:11px;line-height:1.7;padding-left:16px;color:#444">
    <li>The hirer shall take full responsibility for the safe operation of the equipment during the hire period.</li>
    <li>The hirer shall return the equipment in the same condition as received, fair wear and tear excepted.</li>
    <li>Any damage beyond fair wear and tear shall be charged to the hirer at cost of repair.</li>
    <li>The hirer must hold valid public liability insurance covering the use of hired agricultural equipment. Evidence of insurance must be provided on request.</li>
    <li>The hire rate is payable as agreed above. Late payment may attract a surcharge of 2% per month.</li>
    <li>Fuel charges (if applicable) will be invoiced at the prevailing farm pump rate at the date of issue.</li>
    <li>The equipment owner reserves the right to recover the equipment immediately in the event of misuse or non-payment.</li>
    <li>Hours meter readings at hire-out and return shall be recorded on the handover checklist and signed by both parties.</li>
  </ol>
  <div style="margin-top:32px;display:grid;grid-template-columns:1fr 1fr;gap:40px">
    <div>
      <p style="font-weight:600;margin-bottom:4px">Equipment Owner / Agent</p>
      <div style="border-bottom:1px solid #333;margin-bottom:6px;padding-bottom:40px"></div>
      <p style="font-size:10px;color:#666">Signature &amp; Date</p>
    </div>
    <div>
      <p style="font-weight:600;margin-bottom:4px">Hirer (Customer)</p>
      <div style="border-bottom:1px solid #333;margin-bottom:6px;padding-bottom:40px"></div>
      <p style="font-size:10px;color:#666">Signature &amp; Date</p>
    </div>
  </div>
  </body></html>`;
  printHtml(html);
}

function printHandoverChecklist(
  detail: HireBookingDetail,
  farm: FarmRecord | undefined,
  logType: "hire_out" | "return",
) {
  const b = detail.booking;
  const eq = [detail.equipmentName, detail.equipmentMake, detail.equipmentModel].filter(Boolean).join(" — ");
  const reg = detail.equipmentRegistration ? ` (Reg: ${detail.equipmentRegistration})` : "";
  const existing = detail.conditionLogs.find((l) => l.logType === logType);
  const title = logType === "hire_out" ? "Pre-Hire Handover Checklist" : "Return Condition Checklist";

  function row(label: string, value?: string | null) {
    return `<tr><td style="padding:6px 8px;border:1px solid #ddd;background:#f9f9f9;font-weight:600;width:35%">${label}</td><td style="padding:6px 8px;border:1px solid #ddd">${value || "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"}</td></tr>`;
  }

  function checkItem(label: string) {
    return `<tr><td style="padding:6px 8px;border:1px solid #ddd">${label}</td><td style="padding:6px 8px;border:1px solid #ddd;text-align:center;width:80px">☐ OK</td><td style="padding:6px 8px;border:1px solid #ddd;text-align:center;width:80px">☐ Issue</td><td style="padding:6px 8px;border:1px solid #ddd;width:200px">Notes:</td></tr>`;
  }

  const html = `<!DOCTYPE html><html><head><title>${title} — ${b.bookingRef || `#${b.id}`}</title>
  ${docStyles()}</head><body>
  ${docHeader(farm)}
  <h2>${title}</h2>
  <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
    ${row("Booking Ref", b.bookingRef || `HIRE-${b.id}`)}
    ${row("Date", existing?.logDate || "")}
    ${row("Time", existing?.logTime || "")}
    ${row("Machine", `${eq}${reg}`)}
    ${row("Customer", detail.customer?.name || "")}
    ${row("Hours Meter Reading", existing?.hoursReading?.toString() || "")}
    ${row("Fuel Level", existing?.fuelLevelPercent ? `${existing.fuelLevelPercent}%` : "")}
    ${row("Overall Condition", existing?.conditionOverall ? (HIRE_CONDITION_RATINGS.find(r => r.value === existing.conditionOverall)?.label || existing.conditionOverall) : "")}
  </table>
  <h2 style="margin-top:18px">Inspection Checklist</h2>
  <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:11px">
    <thead><tr style="background:#2d5a27;color:#fff">
      <th style="padding:6px 8px;text-align:left;border:1px solid #ddd">Item</th>
      <th style="padding:6px 8px;text-align:center;border:1px solid #ddd;width:80px">OK</th>
      <th style="padding:6px 8px;text-align:center;border:1px solid #ddd;width:80px">Issue</th>
      <th style="padding:6px 8px;border:1px solid #ddd;width:200px">Notes</th>
    </tr></thead>
    <tbody>
      ${checkItem("Tyres — condition and pressure")}
      ${checkItem("Lights and indicators")}
      ${checkItem("Hydraulic hoses and connections")}
      ${checkItem("Engine oil level")}
      ${checkItem("Coolant level")}
      ${checkItem("Fuel level")}
      ${checkItem("PTO shaft and guards")}
      ${checkItem("Safety devices and guards")}
      ${checkItem("Cab / ROPS condition")}
      ${checkItem("Attachments / implements")}
      ${checkItem("Seat belts")}
      ${checkItem("Fire extinguisher present")}
      ${checkItem("Operator manual present")}
      ${checkItem("Visible damage / scratches")}
    </tbody>
  </table>
  ${existing?.conditionNotes ? `<p><strong>Condition Notes:</strong> ${existing.conditionNotes}</p>` : ""}
  ${existing?.damageNotes ? `<p><strong>Damage Notes:</strong> ${existing.damageNotes}</p>` : ""}
  ${existing?.attachmentNotes ? `<p><strong>Attachments:</strong> ${existing.attachmentNotes}</p>` : ""}
  <div style="margin-top:28px;display:grid;grid-template-columns:1fr 1fr;gap:40px">
    <div>
      <p style="font-weight:600;margin-bottom:4px">Equipment Owner / Agent</p>
      <div style="border-bottom:1px solid #333;margin-bottom:6px;padding-bottom:40px"></div>
      <p style="font-size:10px;color:#666">Name, Signature &amp; Date</p>
    </div>
    <div>
      <p style="font-weight:600;margin-bottom:4px">Hirer (Customer)</p>
      <div style="border-bottom:1px solid #333;margin-bottom:6px;padding-bottom:40px"></div>
      <p style="font-size:10px;color:#666">Name, Signature &amp; Date</p>
    </div>
  </div>
  </body></html>`;
  printHtml(html);
}

// ── Booking Form Dialog ──────────────────────────────────────────────────────

function HireBookingDialog({
  farmId, customers, equipment, open, onClose, editBooking,
}: {
  farmId: number;
  customers: FarmCustomer[];
  equipment: EquipmentItem[];
  open: boolean;
  onClose: () => void;
  editBooking?: HireBookingRow | null;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const isEdit = !!editBooking;

  const membersQ = useQuery<{ members: FarmMember[] }>({
    queryKey: ["farm-members", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/members`, { credentials: "include" }).then((r) => r.json()),
    enabled: open,
  });
  const members = membersQ.data?.members ?? [];

  const fieldsQ = useQuery<{ records: { id: number; name?: string | null; fieldReference?: string | null }[] }>({
    queryKey: ["fields", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fields`, { credentials: "include" }).then((r) => r.json()),
    enabled: open,
  });
  const fieldsList = fieldsQ.data?.records ?? [];

  const empty = {
    customerId: "", equipmentId: "", startDate: new Date().toISOString().split("T")[0],
    plannedEndDate: "", rateType: "daily", ratePence: "", depositPence: "",
    operatorName: "customer_operated", fuelPolicy: "customer_supplied", insuranceVerified: false, insuranceNotes: "",
    depositPaidDate: "", jobReference: "", fieldId: "", notes: "", status: "booked",
  };

  const [form, setForm] = useState({ ...empty });
  const [insWarning, setInsWarning] = useState<InsuranceWarning | null>(null);
  const [checkingIns, setCheckingIns] = useState(false);

  useEffect(() => {
    if (open) {
      if (isEdit) {
        const b = editBooking!.booking;
        setForm({
          customerId: String(b.customerId), equipmentId: String(b.equipmentId),
          startDate: b.startDate, plannedEndDate: b.plannedEndDate || "",
          rateType: b.rateType,
          ratePence: b.ratePence ? String(b.ratePence / 100) : "",
          depositPence: b.depositPence ? String(b.depositPence / 100) : "",
          operatorName: b.operatorType === "customer_operated" ? "customer_operated" : (b.operatorName || "customer_operated"),
          fuelPolicy: b.fuelPolicy, insuranceVerified: b.insuranceVerified,
          insuranceNotes: b.insuranceNotes || "", depositPaidDate: b.depositPaidDate || "",
          jobReference: b.jobReference || "", fieldId: b.fieldId ? String(b.fieldId) : "",
          notes: b.notes || "", status: b.status,
        });
      } else {
        setForm({ ...empty });
      }
      setInsWarning(null);
    }
  }, [open, isEdit]);

  async function checkInsurance(startDate: string, endDate: string) {
    if (!startDate) return;
    setCheckingIns(true);
    try {
      const params = new URLSearchParams({ startDate });
      if (endDate) params.set("endDate", endDate);
      const r = await fetch(`/api/farms/${farmId}/equipment-hire/insurance-check?${params}`, { credentials: "include" });
      if (r.ok) setInsWarning(await r.json());
    } finally {
      setCheckingIns(false);
    }
  }

  const saveMut = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch(
        isEdit
          ? `/api/farms/${farmId}/equipment-hire/${editBooking!.booking.id}`
          : `/api/farms/${farmId}/equipment-hire`,
        { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(data) },
      ).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["equipment-hire", farmId] });
      toast({ title: isEdit ? "Booking updated" : "Booking created" });
      onClose();
    },
  });

  function handleSave() {
    const isCustomerOperated = form.operatorName === "customer_operated";
    const data: Record<string, unknown> = {
      customerId: parseInt(form.customerId),
      equipmentId: parseInt(form.equipmentId),
      startDate: form.startDate,
      plannedEndDate: form.plannedEndDate || null,
      rateType: form.rateType,
      ratePence: form.ratePence ? Math.round(parseFloat(form.ratePence) * 100) : null,
      depositPence: form.depositPence ? Math.round(parseFloat(form.depositPence) * 100) : null,
      operatorType: isCustomerOperated ? "customer_operated" : "farm_operator",
      operatorName: isCustomerOperated ? null : form.operatorName,
      fuelPolicy: form.fuelPolicy,
      insuranceVerified: form.insuranceVerified,
      insuranceNotes: form.insuranceNotes || null,
      depositPaid: !!form.depositPaidDate,
      depositPaidDate: form.depositPaidDate || null,
      jobReference: form.jobReference || null,
      fieldId: form.fieldId ? parseInt(form.fieldId) : null,
      notes: form.notes || null,
    };
    if (isEdit) data.status = form.status;
    if (!data.customerId || !data.equipmentId || !form.startDate) {
      toast({ title: "Please fill in customer, machine and start date", variant: "destructive" });
      return;
    }
    saveMut.mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Hire Booking" : "New Hire Booking"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Customer *</Label>
              <Select value={form.customerId} onValueChange={(v) => setForm((f) => ({ ...f, customerId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  {customers.filter((c) => c.isActive).map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Machine *</Label>
              <Select value={form.equipmentId} onValueChange={(v) => setForm((f) => ({ ...f, equipmentId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select equipment" /></SelectTrigger>
                <SelectContent>
                  {equipment.map((e) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.name}{e.make ? ` — ${e.make}` : ""}{e.registrationNumber ? ` (${e.registrationNumber})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Start Date *</Label>
              <Input type="date" value={form.startDate} onChange={(e) => {
                setForm((f) => ({ ...f, startDate: e.target.value }));
                checkInsurance(e.target.value, form.plannedEndDate);
              }} />
            </div>
            <div className="space-y-1">
              <Label>Planned Return Date</Label>
              <Input type="date" value={form.plannedEndDate} onChange={(e) => {
                setForm((f) => ({ ...f, plannedEndDate: e.target.value }));
                checkInsurance(form.startDate, e.target.value);
              }} />
            </div>
          </div>

          {/* Insurance warning */}
          {checkingIns && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" />Checking insurance…</div>}
          {insWarning && !checkingIns && (
            insWarning.ok
              ? <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2"><ShieldCheck className="h-4 w-4 shrink-0" />Insurance coverage confirmed for hire period.</div>
              : <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-red-800"><ShieldAlert className="h-4 w-4 shrink-0" />Insurance Warning</div>
                  {insWarning.warnings.map((w, i) => <p key={i} className="text-xs text-red-700">{w}</p>)}
                </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Rate Type</Label>
              <Select value={form.rateType} onValueChange={(v) => setForm((f) => ({ ...f, rateType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{HIRE_RATE_TYPES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Rate (£)</Label>
              <Input type="number" step="0.01" min="0" value={form.ratePence} onChange={(e) => setForm((f) => ({ ...f, ratePence: e.target.value }))} placeholder="0.00" />
            </div>
            <div className="space-y-1">
              <Label>Deposit (£)</Label>
              <Input type="number" step="0.01" min="0" value={form.depositPence} onChange={(e) => setForm((f) => ({ ...f, depositPence: e.target.value }))} placeholder="0.00" />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Operator</Label>
            <Select value={form.operatorName} onValueChange={(v) => setForm((f) => ({ ...f, operatorName: v }))}>
              <SelectTrigger><SelectValue placeholder="Select operator" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="customer_operated">Customer Operated</SelectItem>
                {members.map((m) => (
                  <SelectItem key={m.id} value={`${m.firstName} ${m.lastName}`}>
                    {m.firstName} {m.lastName}{m.jobTitle ? ` — ${m.jobTitle}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Fuel Policy</Label>
            <Select value={form.fuelPolicy} onValueChange={(v) => setForm((f) => ({ ...f, fuelPolicy: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{HIRE_FUEL_POLICIES.map((fp) => <SelectItem key={fp.value} value={fp.value}>{fp.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Deposit Received Date</Label>
              <Input type="date" max={new Date().toISOString().slice(0, 10)} value={form.depositPaidDate} onChange={(e) => setForm((f) => ({ ...f, depositPaidDate: e.target.value }))} />
              <p className="text-xs text-muted-foreground">Leave blank if deposit not yet received</p>
            </div>
            <div className="flex items-end pb-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input type="checkbox" checked={form.insuranceVerified} onChange={(e) => setForm((f) => ({ ...f, insuranceVerified: e.target.checked }))} />
                Insurance verified by customer
              </label>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Insurance Notes</Label>
            <Input value={form.insuranceNotes} onChange={(e) => setForm((f) => ({ ...f, insuranceNotes: e.target.value }))} placeholder="e.g. Zurich NFU policy ZP-2024-1234 confirmed" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Job / Operation Reference</Label>
              <Input
                value={form.jobReference}
                onChange={(e) => setForm((f) => ({ ...f, jobReference: e.target.value }))}
                placeholder="e.g. August combining — South Block"
              />
              <p className="text-xs text-muted-foreground">Links multiple machine bookings to the same operation</p>
            </div>
            <div className="space-y-1">
              <Label>Linked Field (optional)</Label>
              <Select value={form.fieldId || "__none__"} onValueChange={(v) => setForm((f) => ({ ...f, fieldId: v === "__none__" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="No field linked" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No field linked</SelectItem>
                  {fieldsList.map((f) => (
                    <SelectItem key={f.id} value={String(f.id)}>
                      {f.name || `Field #${f.id}`}{f.fieldReference ? ` (${f.fieldReference})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} />
          </div>

          {isEdit && (
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{HIRE_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saveMut.isPending}>
            {saveMut.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            {isEdit ? "Save Changes" : "Create Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Condition Check Form ─────────────────────────────────────────────────────

function ConditionCheckForm({
  farmId, bookingId, logType, onSaved,
}: { farmId: number; bookingId: number; logType: "hire_out" | "return"; onSaved: () => void }) {
  const { toast } = useToast();
  const today = new Date().toISOString().split("T")[0];
  const now = new Date().toTimeString().slice(0, 5);
  const [form, setForm] = useState({
    logDate: today, logTime: now, hoursReading: "", fuelLevelPercent: "",
    conditionOverall: "good", conditionNotes: "", damageNotes: "", tyreConditionNotes: "",
    attachmentNotes: "", signedOffBy: "",
  });
  const mut = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch(`/api/farms/${farmId}/equipment-hire/${bookingId}/conditions`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => { toast({ title: `${logType === "hire_out" ? "Pre-hire" : "Return"} check saved` }); onSaved(); },
  });
  function handleSave() {
    mut.mutate({
      logType, logDate: form.logDate, logTime: form.logTime || null,
      hoursReading: form.hoursReading ? parseInt(form.hoursReading) : null,
      fuelLevelPercent: form.fuelLevelPercent ? parseInt(form.fuelLevelPercent) : null,
      conditionOverall: form.conditionOverall, conditionNotes: form.conditionNotes || null,
      damageNotes: form.damageNotes || null, tyreConditionNotes: form.tyreConditionNotes || null,
      attachmentNotes: form.attachmentNotes || null, signedOffBy: form.signedOffBy || null,
    });
  }
  return (
    <div className="bg-muted/40 border rounded-lg p-4 space-y-3">
      <h4 className="font-medium text-sm">{logType === "hire_out" ? "Pre-hire Condition Check" : "Return Condition Check"}</h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="space-y-1"><Label className="text-xs">Date</Label><Input type="date" max={new Date().toISOString().slice(0, 10)} value={form.logDate} onChange={(e) => setForm((f) => ({ ...f, logDate: e.target.value }))} /></div>
        <div className="space-y-1"><Label className="text-xs">Time</Label><Input type="time" value={form.logTime} onChange={(e) => setForm((f) => ({ ...f, logTime: e.target.value }))} /></div>
        <div className="space-y-1"><Label className="text-xs">Hours Meter</Label><Input type="number" min="0" value={form.hoursReading} onChange={(e) => setForm((f) => ({ ...f, hoursReading: e.target.value }))} placeholder="e.g. 1450" /></div>
        <div className="space-y-1"><Label className="text-xs">Fuel Level %</Label><Input type="number" min="0" max="100" value={form.fuelLevelPercent} onChange={(e) => setForm((f) => ({ ...f, fuelLevelPercent: e.target.value }))} placeholder="0–100" /></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Overall Condition</Label>
          <Select value={form.conditionOverall} onValueChange={(v) => setForm((f) => ({ ...f, conditionOverall: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{HIRE_CONDITION_RATINGS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1"><Label className="text-xs">Signed Off By</Label><Input value={form.signedOffBy} onChange={(e) => setForm((f) => ({ ...f, signedOffBy: e.target.value }))} placeholder="Name" /></div>
      </div>
      <div className="space-y-1"><Label className="text-xs">Condition Notes</Label><Textarea value={form.conditionNotes} onChange={(e) => setForm((f) => ({ ...f, conditionNotes: e.target.value }))} rows={2} placeholder="General condition remarks…" /></div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1"><Label className="text-xs">Damage Notes</Label><Input value={form.damageNotes} onChange={(e) => setForm((f) => ({ ...f, damageNotes: e.target.value }))} placeholder="Any existing or new damage" /></div>
        <div className="space-y-1"><Label className="text-xs">Tyre Condition</Label><Input value={form.tyreConditionNotes} onChange={(e) => setForm((f) => ({ ...f, tyreConditionNotes: e.target.value }))} placeholder="Tyre condition notes" /></div>
      </div>
      <div className="space-y-1"><Label className="text-xs">Attachments / Implements</Label><Input value={form.attachmentNotes} onChange={(e) => setForm((f) => ({ ...f, attachmentNotes: e.target.value }))} placeholder="List of attachments included" /></div>
      <div className="flex justify-end gap-2">
        <Button size="sm" onClick={handleSave} disabled={mut.isPending}>
          {mut.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}Save Check
        </Button>
      </div>
    </div>
  );
}

// ── Fuel Issue Form ───────────────────────────────────────────────────────────

function FuelIssueForm({
  farmId, bookingId, onSaved,
}: { farmId: number; bookingId: number; onSaved: () => void }) {
  const { toast } = useToast();
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({ issueDate: today, litres: "", pricePerLitrePence: "", billedToCustomer: true, issuedBy: "", notes: "" });
  const mut = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch(`/api/farms/${farmId}/equipment-hire/${bookingId}/fuel`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => { toast({ title: "Fuel issue logged" }); onSaved(); setForm({ issueDate: today, litres: "", pricePerLitrePence: "", billedToCustomer: true, issuedBy: "", notes: "" }); },
  });
  function handleSave() {
    if (!form.litres || parseFloat(form.litres) <= 0) { toast({ title: "Enter litres issued", variant: "destructive" }); return; }
    mut.mutate({
      issueDate: form.issueDate, litres: parseFloat(form.litres),
      pricePerLitrePence: form.pricePerLitrePence ? Math.round(parseFloat(form.pricePerLitrePence) * 100) : null,
      billedToCustomer: form.billedToCustomer, issuedBy: form.issuedBy || null, notes: form.notes || null,
    });
  }
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
      <h4 className="font-medium text-sm flex items-center gap-1.5"><Fuel className="h-4 w-4 text-amber-600" />Log Fuel Issue</h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="space-y-1"><Label className="text-xs">Date</Label><Input type="date" max={new Date().toISOString().slice(0, 10)} value={form.issueDate} onChange={(e) => setForm((f) => ({ ...f, issueDate: e.target.value }))} /></div>
        <div className="space-y-1"><Label className="text-xs">Litres Issued</Label><Input type="number" step="0.1" min="0" value={form.litres} onChange={(e) => setForm((f) => ({ ...f, litres: e.target.value }))} placeholder="0.0" /></div>
        <div className="space-y-1"><Label className="text-xs">Price per Litre (£)</Label><Input type="number" step="0.001" min="0" value={form.pricePerLitrePence} onChange={(e) => setForm((f) => ({ ...f, pricePerLitrePence: e.target.value }))} placeholder="0.000" /></div>
        <div className="space-y-1"><Label className="text-xs">Issued By</Label><Input value={form.issuedBy} onChange={(e) => setForm((f) => ({ ...f, issuedBy: e.target.value }))} placeholder="Name" /></div>
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.billedToCustomer} onChange={(e) => setForm((f) => ({ ...f, billedToCustomer: e.target.checked }))} />
          Bill to customer
        </label>
        {form.litres && form.pricePerLitrePence && (
          <span className="text-sm text-muted-foreground">
            Total: £{(parseFloat(form.litres) * parseFloat(form.pricePerLitrePence)).toFixed(2)}
          </span>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <Button size="sm" onClick={handleSave} disabled={mut.isPending}>
          {mut.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}Log Fuel
        </Button>
      </div>
    </div>
  );
}

// ── Booking Detail Panel ──────────────────────────────────────────────────────

function BookingDetailPanel({
  farmId, bookingId, customers, equipment, onBack, onEditBooking, onRaiseInvoice,
}: {
  farmId: number;
  bookingId: number;
  customers: FarmCustomer[];
  equipment: EquipmentItem[];
  onBack: () => void;
  onEditBooking: (row: HireBookingRow) => void;
  onRaiseInvoice: (prefill: InvoicePrefill) => void;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [innerTab, setInnerTab] = useState<"overview" | "conditions" | "fuel" | "revenue">("overview");
  const [showPreHireForm, setShowPreHireForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [showFuelForm, setShowFuelForm] = useState(false);
  const [plannerPrompt, setPlannerPrompt] = useState(false);
  const [plannerCreating, setPlannerCreating] = useState(false);

  const detailQ = useQuery<HireBookingDetail>({
    queryKey: ["hire-booking-detail", farmId, bookingId],
    queryFn: () => fetch(`/api/farms/${farmId}/equipment-hire/${bookingId}`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!bookingId,
  });

  const farmQ = useQuery<{ farm: FarmRecord }>({
    queryKey: ["farm", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`, { credentials: "include" }).then((r) => r.json()),
  });

  const membersQ = useQuery<{ members: FarmMember[] }>({
    queryKey: ["farm-members", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/members`, { credentials: "include" }).then((r) => r.json()),
  });
  const members = membersQ.data?.members ?? [];

  const detailFieldsQ = useQuery<{ records: { id: number; name?: string | null; fieldReference?: string | null }[] }>({
    queryKey: ["fields", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fields`, { credentials: "include" }).then((r) => r.json()),
  });
  const fieldsMap: Record<number, string> = Object.fromEntries(
    (detailFieldsQ.data?.records ?? []).map((f) => [f.id, [f.name, f.fieldReference ? `(${f.fieldReference})` : ""].filter(Boolean).join(" ")])
  );

  const updateStatusMut = useMutation({
    mutationFn: ({ status }: { status: string; triggerPlanner?: boolean }) =>
      fetch(`/api/farms/${farmId}/equipment-hire/${bookingId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ status }),
      }).then((r) => r.json()),
    onSuccess: (_, { status, triggerPlanner }) => {
      qc.invalidateQueries({ queryKey: ["hire-booking-detail", farmId, bookingId] });
      qc.invalidateQueries({ queryKey: ["equipment-hire", farmId] });
      toast({ title: `Booking status updated to ${HIRE_STATUSES.find((s) => s.value === status)?.label || status}` });
      if (triggerPlanner) setPlannerPrompt(true);
    },
  });

  async function addToPlanner(b: HireBooking) {
    const member = members.find((m) => `${m.firstName} ${m.lastName}` === b.operatorName);
    if (!member) {
      toast({ title: "Could not find staff member to assign", variant: "destructive" });
      setPlannerPrompt(false);
      return;
    }
    setPlannerCreating(true);
    try {
      const equipName = detailQ.data?.equipmentName || `Booking #${b.id}`;
      const custName = detailQ.data?.customer?.name || "";
      await fetch(`/api/farms/${farmId}/task-assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: `Operate ${equipName}${custName ? ` — ${custName}` : ""}`,
          description: `Equipment hire${b.bookingRef ? ` ${b.bookingRef}` : ""}. Machine out from ${b.startDate}${b.plannedEndDate ? ` — planned return ${b.plannedEndDate}` : ""}.`,
          assignedToMemberId: member.id,
          dueDate: b.startDate,
          customerId: b.customerId || null,
          isWorkOrder: true,
        }),
      });
      qc.invalidateQueries({ queryKey: ["work-orders", farmId] });
      toast({ title: `Work order added to planner for ${b.operatorName}` });
    } catch {
      toast({ title: "Failed to add to planner", variant: "destructive" });
    } finally {
      setPlannerCreating(false);
      setPlannerPrompt(false);
    }
  }

  const deleteCondMut = useMutation({
    mutationFn: (condId: number) =>
      fetch(`/api/farms/${farmId}/equipment-hire/${bookingId}/conditions/${condId}`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["hire-booking-detail", farmId, bookingId] }); toast({ title: "Condition log removed" }); },
  });

  const deleteFuelMut = useMutation({
    mutationFn: (fuelId: number) =>
      fetch(`/api/farms/${farmId}/equipment-hire/${bookingId}/fuel/${fuelId}`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["hire-booking-detail", farmId, bookingId] }); toast({ title: "Fuel issue removed" }); },
  });

  const updateCostMut = useMutation({
    mutationFn: (totalHireCostPence: number) =>
      fetch(`/api/farms/${farmId}/equipment-hire/${bookingId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ totalHireCostPence }),
      }).then((r) => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["hire-booking-detail", farmId, bookingId] }); toast({ title: "Hire cost updated" }); },
  });

  const [costInput, setCostInput] = useState("");

  if (detailQ.isLoading) return <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (!detailQ.data) return null;
  const detail = detailQ.data;
  const b = detail.booking;
  const farm = farmQ.data?.farm;
  const eq = [detail.equipmentName, detail.equipmentMake, detail.equipmentModel].filter(Boolean).join(" — ");

  const preHireLog = detail.conditionLogs.find((l) => l.logType === "hire_out");
  const returnLog = detail.conditionLogs.find((l) => l.logType === "return");
  const totalFuel = detail.fuelIssues.reduce((s, f) => s + (f.totalCostPence || 0), 0);
  const billedFuel = detail.fuelIssues.filter((f) => f.billedToCustomer).reduce((s, f) => s + (f.totalCostPence || 0), 0);
  const totalLitres = detail.fuelIssues.reduce((s, f) => s + parseFloat(f.litres), 0);
  const hireRevenue = b.totalHireCostPence || 0;
  const totalRevenue = hireRevenue + billedFuel;

  const bookingRow: HireBookingRow = {
    booking: b,
    customerName: detail.customer?.name || null,
    equipmentName: detail.equipmentName,
    equipmentMake: detail.equipmentMake,
    equipmentModel: detail.equipmentModel,
    equipmentRegistration: detail.equipmentRegistration,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />Back
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-lg leading-tight">{b.bookingRef || `Booking #${b.id}`}</h3>
            {statusBadge(b.status, HIRE_STATUSES)}
          </div>
          <p className="text-sm text-muted-foreground">{detail.customer?.name || "—"} · {eq}{detail.equipmentRegistration ? ` (${detail.equipmentRegistration})` : ""}</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => printHireAgreement(detail, farm)}>
            <Printer className="h-3.5 w-3.5" />Agreement
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => printHandoverChecklist(detail, farm, "hire_out")}>
            <Printer className="h-3.5 w-3.5" />Pre-hire Checklist
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => printHandoverChecklist(detail, farm, "return")}>
            <Printer className="h-3.5 w-3.5" />Return Checklist
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onEditBooking(bookingRow)}>
            <Pencil className="h-3.5 w-3.5" />Edit
          </Button>
        </div>
      </div>

      {/* Status actions */}
      {b.status === "booked" && (
        <div className="flex gap-2">
          <Button size="sm" className="bg-green-700 hover:bg-green-800 text-white gap-1.5"
            onClick={() => updateStatusMut.mutate({ status: "active", triggerPlanner: b.operatorType === "farm_operator" })}>
            <CheckCircle className="h-3.5 w-3.5" />Mark as Active (Machine Out)
          </Button>
        </div>
      )}
      {b.status === "active" && (
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5" onClick={() => updateStatusMut.mutate({ status: "returned" })}>
            <CheckCircle className="h-3.5 w-3.5" />Mark as Returned
          </Button>
        </div>
      )}
      {b.status === "returned" && (
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5" onClick={() => {
            const label = b.bookingRef || `Booking #${b.id}`;
            onRaiseInvoice({
              customerId: b.customerId,
              customerName: detail.customer?.name || "",
              title: `Equipment hire — ${label}`,
              suggestedLines: [
                { description: `Equipment hire — ${label}`, quantity: "1", unit: "", unitPricePence: "0", lineTotalPence: 0 },
                ...(b.depositPaidDate && b.depositPence ? [{ description: `Less: deposit received${b.depositPaidDate ? ` (${b.depositPaidDate})` : ""}`, quantity: "1", unit: "", unitPricePence: String(-(b.depositPence / 100)), lineTotalPence: -b.depositPence }] : []),
              ],
            });
          }}>
            <Receipt className="h-3.5 w-3.5" />Raise Invoice
          </Button>
          <Button size="sm" variant="outline" onClick={() => updateStatusMut.mutate({ status: "invoiced" })}>Mark as Invoiced</Button>
        </div>
      )}

      {/* Add to Planner prompt — shown after activating with a farm operator */}
      {plannerPrompt && b.operatorType === "farm_operator" && b.operatorName && (
        <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
          <CalendarDays className="h-4 w-4 text-blue-700 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-blue-900">Add to Work Planner?</p>
            <p className="text-xs text-blue-700 mt-0.5">
              Create a planner entry for <strong>{b.operatorName}</strong> so they can see this job in the Work Orders tab.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button size="sm" className="bg-blue-700 hover:bg-blue-800 text-white" disabled={plannerCreating} onClick={() => addToPlanner(b)}>
              {plannerCreating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><CalendarDays className="h-3.5 w-3.5" />Add to Planner</>}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setPlannerPrompt(false)}>Skip</Button>
          </div>
        </div>
      )}

      {/* Inner tab bar */}
      <div className="flex gap-1 border-b">
        {[
          { id: "overview", label: "Overview", icon: <FileText className="h-3.5 w-3.5" /> },
          { id: "conditions", label: "Condition Checks", icon: <ClipboardCheck className="h-3.5 w-3.5" /> },
          { id: "fuel", label: "Fuel Issues", icon: <Fuel className="h-3.5 w-3.5" /> },
          { id: "revenue", label: "Revenue", icon: <BarChart3 className="h-3.5 w-3.5" /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setInnerTab(t.id as typeof innerTab)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 transition-colors ${innerTab === t.id ? "border-green-700 text-green-800 font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {innerTab === "overview" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "Start Date", value: b.startDate },
            { label: "Planned Return", value: b.plannedEndDate || "Open-ended" },
            { label: "Actual Return", value: b.actualEndDate || "—" },
            { label: "Rate", value: b.ratePence ? `${fmtPence(b.ratePence)} per ${HIRE_RATE_TYPES.find((r) => r.value === b.rateType)?.label.toLowerCase() || b.rateType}` : "—" },
            { label: "Deposit", value: b.depositPence ? `${fmtPence(b.depositPence)}${b.depositPaidDate ? ` (Received ${b.depositPaidDate})` : " (Awaiting)"}` : "—" },
            { label: "Operator", value: `${HIRE_OPERATOR_TYPES.find((o) => o.value === b.operatorType)?.label || b.operatorType}${b.operatorName ? ` — ${b.operatorName}` : ""}` },
            { label: "Fuel Policy", value: HIRE_FUEL_POLICIES.find((f) => f.value === b.fuelPolicy)?.label || b.fuelPolicy },
            { label: "Insurance", value: b.insuranceVerified ? `Verified${b.insuranceNotes ? ` — ${b.insuranceNotes}` : ""}` : "Not verified" },
            { label: "Machine Hours (current)", value: detail.equipmentCurrentHours ? `${detail.equipmentCurrentHours} hrs` : "—" },
            ...(b.jobReference ? [{ label: "Job / Operation", value: b.jobReference }] : []),
            ...(b.fieldId ? [{ label: "Linked Field", value: fieldsMap[b.fieldId] || `Field #${b.fieldId}` }] : []),
          ].map((row) => (
            <div key={row.label} className="bg-muted/40 rounded-lg p-3">
              <div className="text-[11px] text-muted-foreground">{row.label}</div>
              <div className="font-medium text-sm mt-0.5">{row.value}</div>
            </div>
          ))}
          {b.notes && (
            <div className="col-span-full bg-muted/40 rounded-lg p-3">
              <div className="text-[11px] text-muted-foreground">Notes</div>
              <div className="font-medium text-sm mt-0.5">{b.notes}</div>
            </div>
          )}
          {!b.insuranceVerified && (
            <div className="col-span-full flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />Customer insurance has not been verified — obtain and note their policy details before releasing the machine.
            </div>
          )}
        </div>
      )}

      {/* Condition Checks */}
      {innerTab === "conditions" && (
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            {!preHireLog && <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowPreHireForm(true)}><Plus className="h-3.5 w-3.5" />Pre-hire Check</Button>}
            {!returnLog && <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowReturnForm(true)}><Plus className="h-3.5 w-3.5" />Return Check</Button>}
          </div>

          {showPreHireForm && !preHireLog && (
            <ConditionCheckForm farmId={farmId} bookingId={bookingId} logType="hire_out" onSaved={() => {
              setShowPreHireForm(false);
              qc.invalidateQueries({ queryKey: ["hire-booking-detail", farmId, bookingId] });
            }} />
          )}
          {showReturnForm && !returnLog && (
            <ConditionCheckForm farmId={farmId} bookingId={bookingId} logType="return" onSaved={() => {
              setShowReturnForm(false);
              qc.invalidateQueries({ queryKey: ["hire-booking-detail", farmId, bookingId] });
            }} />
          )}

          {detail.conditionLogs.length === 0 && !showPreHireForm && !showReturnForm && (
            <div className="text-center py-8 text-muted-foreground text-sm">No condition logs yet — add a pre-hire check before releasing the machine.</div>
          )}

          {detail.conditionLogs.map((log) => {
            const rating = HIRE_CONDITION_RATINGS.find((r) => r.value === log.conditionOverall);
            return (
              <div key={log.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${log.logType === "hire_out" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}>
                      {log.logType === "hire_out" ? "Pre-hire" : "Return"}
                    </span>
                    {rating && <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${rating.colour}`}>{rating.label}</span>}
                    <span className="text-sm">{log.logDate}{log.logTime ? ` at ${log.logTime}` : ""}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteCondMut.mutate(log.id)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                  {log.hoursReading !== null && <div><span className="text-muted-foreground">Hours:</span> {log.hoursReading}</div>}
                  {log.fuelLevelPercent !== null && <div><span className="text-muted-foreground">Fuel:</span> {log.fuelLevelPercent}%</div>}
                  {log.signedOffBy && <div><span className="text-muted-foreground">Signed:</span> {log.signedOffBy}</div>}
                </div>
                {log.conditionNotes && <p className="text-sm"><span className="font-medium">Condition:</span> {log.conditionNotes}</p>}
                {log.damageNotes && <p className="text-sm text-red-700"><span className="font-medium">Damage:</span> {log.damageNotes}</p>}
                {log.tyreConditionNotes && <p className="text-sm"><span className="font-medium">Tyres:</span> {log.tyreConditionNotes}</p>}
                {log.attachmentNotes && <p className="text-sm"><span className="font-medium">Attachments:</span> {log.attachmentNotes}</p>}
              </div>
            );
          })}
        </div>
      )}

      {/* Fuel Issues */}
      {innerTab === "fuel" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowFuelForm((v) => !v)}>
              <Fuel className="h-3.5 w-3.5" />{showFuelForm ? "Cancel" : "Log Fuel Issue"}
            </Button>
          </div>
          {showFuelForm && (
            <FuelIssueForm farmId={farmId} bookingId={bookingId} onSaved={() => {
              setShowFuelForm(false);
              qc.invalidateQueries({ queryKey: ["hire-booking-detail", farmId, bookingId] });
            }} />
          )}
          {detail.fuelIssues.length > 0 ? (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-amber-800">{totalLitres.toFixed(1)}L</div>
                  <div className="text-xs text-amber-700">Total Fuel Issued</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-green-800">{fmtPence(billedFuel)}</div>
                  <div className="text-xs text-green-700">Billed to Customer</div>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <div className="text-xl font-bold">{fmtPence(totalFuel)}</div>
                  <div className="text-xs text-muted-foreground">Total Fuel Cost</div>
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Date</th>
                      <th className="px-3 py-2 text-right font-medium">Litres</th>
                      <th className="px-3 py-2 text-right font-medium">p/L</th>
                      <th className="px-3 py-2 text-right font-medium">Total</th>
                      <th className="px-3 py-2 text-center font-medium">Billed</th>
                      <th className="px-3 py-2 text-left font-medium">Issued By</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.fuelIssues.map((f) => (
                      <tr key={f.id} className="border-t">
                        <td className="px-3 py-2">{f.issueDate}</td>
                        <td className="px-3 py-2 text-right">{parseFloat(f.litres).toFixed(1)}</td>
                        <td className="px-3 py-2 text-right">{f.pricePerLitrePence ? `${(f.pricePerLitrePence / 100).toFixed(3)}` : "—"}</td>
                        <td className="px-3 py-2 text-right font-medium">{f.totalCostPence ? fmtPence(f.totalCostPence) : "—"}</td>
                        <td className="px-3 py-2 text-center">{f.billedToCustomer ? <CheckCircle className="h-4 w-4 text-green-600 mx-auto" /> : <XCircle className="h-4 w-4 text-muted-foreground mx-auto" />}</td>
                        <td className="px-3 py-2 text-muted-foreground">{f.issuedBy || "—"}</td>
                        <td className="px-3 py-2">
                          <Button variant="ghost" size="icon" onClick={() => deleteFuelMut.mutate(f.id)}><Trash2 className="h-3.5 w-3.5 text-red-400" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : !showFuelForm ? (
            <div className="text-center py-8 text-muted-foreground text-sm">No fuel issues logged yet.</div>
          ) : null}
        </div>
      )}

      {/* Revenue */}
      {innerTab === "revenue" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-800">{fmtPence(hireRevenue)}</div>
              <div className="text-xs text-green-700 mt-1">Hire Revenue</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-amber-800">{fmtPence(billedFuel)}</div>
              <div className="text-xs text-amber-700 mt-1">Fuel Billed</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-800">{fmtPence(totalRevenue)}</div>
              <div className="text-xs text-blue-700 mt-1">Total Revenue</div>
            </div>
          </div>

          <div className="bg-muted/40 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-sm">Set Total Hire Cost</h4>
            <p className="text-xs text-muted-foreground">Enter the final agreed hire cost for this booking. This will be used in revenue summaries and invoice generation.</p>
            <div className="flex gap-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</span>
                <Input
                  type="number" step="0.01" min="0" className="pl-6 w-40"
                  value={costInput || (b.totalHireCostPence ? String(b.totalHireCostPence / 100) : "")}
                  onChange={(e) => setCostInput(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <Button variant="outline" size="sm" onClick={() => {
                if (costInput) updateCostMut.mutate(Math.round(parseFloat(costInput) * 100));
              }}>Save Cost</Button>
            </div>
          </div>

          {b.status === "returned" && (
            <Button className="gap-1.5" onClick={() => {
              const label = b.bookingRef || `Booking #${b.id}`;
              onRaiseInvoice({
                customerId: b.customerId,
                customerName: detail.customer?.name || "",
                title: `Equipment hire — ${label}`,
                suggestedLines: [
                  { description: `Equipment hire — ${label}`, quantity: "1", unit: "", unitPricePence: "0", lineTotalPence: 0 },
                  ...(b.depositPaidDate && b.depositPence ? [{ description: `Less: deposit received${b.depositPaidDate ? ` (${b.depositPaidDate})` : ""}`, quantity: "1", unit: "", unitPricePence: String(-(b.depositPence / 100)), lineTotalPence: -b.depositPence }] : []),
                ],
              });
            }}>
              <Receipt className="h-4 w-4" />Raise Invoice for This Booking
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Equipment Hire Tab ───────────────────────────────────────────────────────

function EquipmentHireTab({
  farmId, customers, onRaiseInvoice,
}: {
  farmId: number;
  customers: FarmCustomer[];
  onRaiseInvoice: (prefill: InvoicePrefill) => void;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRow, setEditRow] = useState<HireBookingRow | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showSummary, setShowSummary] = useState(false);

  const bookingsQ = useQuery<{ records: HireBookingRow[] }>({
    queryKey: ["equipment-hire", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/equipment-hire`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId,
  });

  const equipmentQ = useQuery<{ records: EquipmentItem[] }>({
    queryKey: ["equipment", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/equipment`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId,
  });

  const summaryQ = useQuery<{
    totalBookings: number; activeBookings: number; totalRevenuePence: number; totalFuelRevenuePence: number;
    byMachine: { equipmentName: string; bookingCount: number; totalHirePence: number; totalFuelPence: number }[];
    byCustomer: { customerName: string; bookingCount: number; totalHirePence: number }[];
  }>({
    queryKey: ["equipment-hire-summary", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/equipment-hire-summary`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId && showSummary,
  });

  const cancelMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/equipment-hire/${id}`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["equipment-hire", farmId] }); toast({ title: "Booking cancelled" }); },
  });

  const bookings = bookingsQ.data?.records ?? [];
  const equipment = equipmentQ.data?.records ?? [];
  const filtered = filterStatus === "all" ? bookings : bookings.filter((b) => b.booking.status === filterStatus);

  const active = bookings.filter((b) => ["booked", "active"].includes(b.booking.status)).length;
  const returned = bookings.filter((b) => b.booking.status === "returned").length;
  const totalRevenue = bookings.reduce((s, b) => s + (b.booking.totalHireCostPence || 0), 0);

  if (selectedId !== null) {
    return (
      <BookingDetailPanel
        farmId={farmId}
        bookingId={selectedId}
        customers={customers}
        equipment={equipment}
        onBack={() => setSelectedId(null)}
        onEditBooking={(row) => { setEditRow(row); setDialogOpen(true); }}
        onRaiseInvoice={(prefill) => { setSelectedId(null); onRaiseInvoice(prefill); }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-muted/40 rounded-lg p-3 text-center">
          <div className="text-xl font-bold">{bookings.length}</div>
          <div className="text-xs text-muted-foreground">Total Bookings</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-green-800">{active}</div>
          <div className="text-xs text-green-700">Active / Booked</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-purple-800">{returned}</div>
          <div className="text-xs text-purple-700">Awaiting Invoice</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-blue-800">{fmtPence(totalRevenue)}</div>
          <div className="text-xs text-blue-700">Hire Revenue</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2 flex-wrap">
          {["all", ...HIRE_STATUSES.map((s) => s.value)].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filterStatus === s ? "bg-green-700 text-white border-green-700" : "border-border text-muted-foreground hover:border-green-400"}`}
            >
              {s === "all" ? "All" : HIRE_STATUSES.find((h) => h.value === s)?.label || s}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowSummary((v) => !v)}>
            <BarChart3 className="h-3.5 w-3.5" />{showSummary ? "Hide" : "Revenue"} Summary
          </Button>
          <Button size="sm" className="gap-1.5 bg-green-700 hover:bg-green-800 text-white" onClick={() => { setEditRow(null); setDialogOpen(true); }}>
            <Plus className="h-3.5 w-3.5" />New Booking
          </Button>
        </div>
      </div>

      {/* Revenue Summary */}
      {showSummary && (
        <div className="border rounded-xl p-4 space-y-4 bg-muted/20">
          {summaryQ.isLoading ? <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin" /></div> : summaryQ.data ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center"><div className="text-xl font-bold">{summaryQ.data.totalBookings}</div><div className="text-xs text-muted-foreground">Total Bookings</div></div>
                <div className="text-center"><div className="text-xl font-bold text-green-700">{summaryQ.data.activeBookings}</div><div className="text-xs text-muted-foreground">Active Now</div></div>
                <div className="text-center"><div className="text-xl font-bold">{fmtPence(summaryQ.data.totalRevenuePence)}</div><div className="text-xs text-muted-foreground">Hire Revenue</div></div>
                <div className="text-center"><div className="text-xl font-bold">{fmtPence(summaryQ.data.totalFuelRevenuePence)}</div><div className="text-xs text-muted-foreground">Fuel Revenue</div></div>
              </div>
              {summaryQ.data.byMachine.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">By Machine</h4>
                  <div className="space-y-1">
                    {summaryQ.data.byMachine.map((m) => (
                      <div key={m.equipmentName} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                        <span>{m.equipmentName}</span>
                        <span className="text-muted-foreground">{m.bookingCount} hire{m.bookingCount !== 1 ? "s" : ""} · {fmtPence(m.totalHirePence)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {summaryQ.data.byCustomer.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">By Customer</h4>
                  <div className="space-y-1">
                    {summaryQ.data.byCustomer.map((c) => (
                      <div key={c.customerName} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                        <span>{c.customerName}</span>
                        <span className="text-muted-foreground">{c.bookingCount} hire{c.bookingCount !== 1 ? "s" : ""} · {fmtPence(c.totalHirePence)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}

      {/* Bookings List */}
      {bookingsQ.isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-14 space-y-3">
          <Tractor className="h-10 w-10 mx-auto text-muted-foreground/50" />
          <p className="text-muted-foreground">{bookings.length === 0 ? "No hire bookings yet — create your first booking." : "No bookings match the selected filter."}</p>
          {bookings.length === 0 && (
            <Button size="sm" className="bg-green-700 hover:bg-green-800 text-white gap-1.5" onClick={() => setDialogOpen(true)}>
              <Plus className="h-3.5 w-3.5" />New Booking
            </Button>
          )}
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2.5 text-left font-medium">Booking</th>
                <th className="px-3 py-2.5 text-left font-medium">Machine</th>
                <th className="px-3 py-2.5 text-left font-medium hidden sm:table-cell">Customer</th>
                <th className="px-3 py-2.5 text-left font-medium hidden md:table-cell">Start</th>
                <th className="px-3 py-2.5 text-left font-medium hidden md:table-cell">Return</th>
                <th className="px-3 py-2.5 text-left font-medium">Status</th>
                <th className="px-3 py-2.5 text-right font-medium">Revenue</th>
                <th className="px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const b = row.booking;
                const insWarn = !b.insuranceVerified && ["booked", "active"].includes(b.status);
                return (
                  <tr key={b.id} className="border-t hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setSelectedId(b.id)}>
                    <td className="px-3 py-2.5 font-medium">
                      <div className="flex items-center gap-1.5">
                        {b.bookingRef || `#${b.id}`}
                        {insWarn && <ShieldAlert className="h-3.5 w-3.5 text-red-500 shrink-0" />}
                      </div>
                      {b.jobReference && <div className="text-xs text-muted-foreground truncate max-w-[160px]">{b.jobReference}</div>}
                    </td>
                    <td className="px-3 py-2.5">
                      <div>{row.equipmentName || "—"}</div>
                      {(row.equipmentMake || row.equipmentModel) && (
                        <div className="text-xs text-muted-foreground">{[row.equipmentMake, row.equipmentModel].filter(Boolean).join(" ")}</div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 hidden sm:table-cell">{row.customerName || "—"}</td>
                    <td className="px-3 py-2.5 hidden md:table-cell">{b.startDate}</td>
                    <td className="px-3 py-2.5 hidden md:table-cell">{b.actualEndDate || b.plannedEndDate || "Open"}</td>
                    <td className="px-3 py-2.5">{statusBadge(b.status, HIRE_STATUSES)}</td>
                    <td className="px-3 py-2.5 text-right">{b.totalHireCostPence ? fmtPence(b.totalHireCostPence) : "—"}</td>
                    <td className="px-3 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" title="View" onClick={() => setSelectedId(b.id)}><Eye className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" title="Edit" onClick={() => { setEditRow(row); setDialogOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                        {!["cancelled", "invoiced"].includes(b.status) && (
                          <Button variant="ghost" size="icon" title="Cancel" onClick={() => { if (confirm("Cancel this booking?")) cancelMut.mutate(b.id); }}>
                            <X className="h-3.5 w-3.5 text-red-500" />
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

      <HireBookingDialog
        farmId={farmId}
        customers={customers}
        equipment={equipment}
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditRow(null); }}
        editBooking={editRow}
      />
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
    const valid: Tab[] = ["customers", "agreements", "grain", "invoices", "work-orders", "hire"];
    return t && valid.includes(t) ? t : "customers";
  });
  const [invoicePrefill, setInvoicePrefill] = useState<InvoicePrefill | null>(null);

  function handleRaiseInvoice(prefill: InvoicePrefill) {
    setInvoicePrefill({ ...prefill });
    setTab("invoices");
  }

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
          <TabButton active={tab === "hire"} onClick={() => setTab("hire")}>
            <span className="flex items-center gap-1.5"><Tractor className="h-3.5 w-3.5" /> Equipment Hire</span>
          </TabButton>
        </TabBar>

        {tab === "customers" && farmId && <CustomersTab farmId={farmId} customers={customers} isLoading={customersQ.isLoading} />}
        {tab === "agreements" && farmId && <AgreementsTab farmId={farmId} customers={customers} />}
        {tab === "grain" && farmId && <GrainIntakeTab farmId={farmId} customers={customers} />}
        {tab === "invoices" && farmId && <InvoicesTab farmId={farmId} customers={customers} prefill={invoicePrefill} />}
        {tab === "work-orders" && farmId && <WorkOrdersTab farmId={farmId} customers={customers} onRaiseInvoice={handleRaiseInvoice} />}
        {tab === "hire" && farmId && <EquipmentHireTab farmId={farmId} customers={customers} onRaiseInvoice={handleRaiseInvoice} />}
      </div>
    </AppLayout>
  );
}
