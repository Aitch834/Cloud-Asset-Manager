import { useState, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { api, type Invoice, type Tenant } from "@/lib/api";
import { getSecret } from "@/lib/auth";
import { FileText, Plus, Printer, CheckCircle, Send, XCircle, ChevronDown, AlertCircle, Clock, Loader2, Trash2, Mail, Users, PenLine } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { Button } from "@/components/ui/button";

function fmt(pence: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(pence / 100);
}
function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtPeriod(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  return `${s.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} – ${e.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`;
}

function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = "Confirm", confirmVariant = "default", mutation }: { open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; confirmLabel?: string; confirmVariant?: "default" | "destructive"; mutation?: { isError: boolean; isPending: boolean; error: unknown } }) {
  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onCancel(); }}>
      <DialogContent style={{ maxWidth: "22rem" }}>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">{message}</p>
        {mutation && <DialogMutationError mutation={mutation} />}
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant={confirmVariant} onClick={onConfirm} disabled={mutation?.isPending}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-600", icon: FileText },
  sent: { label: "Sent", color: "bg-blue-100 text-blue-700", icon: Send },
  paid: { label: "Paid", color: "bg-green-100 text-green-700", icon: CheckCircle },
  overdue: { label: "Overdue", color: "bg-red-100 text-red-700", icon: AlertCircle },
  void: { label: "Void", color: "bg-gray-100 text-gray-400 line-through", icon: XCircle },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

type CompanyConfig = Record<string, string>;

function InvoicePrintView({ invoice, company = {} }: { invoice: Invoice; company?: CompanyConfig }) {
  const items = (invoice.lineItems as { description: string; quantity: number; unitPricePence: number; netPence: number }[]) ?? [];

  const legalName = company["company.legalName"] || "Barnett Davies Enterprises Ltd";
  const tradingName = company["company.tradingName"] || "BDE Farm Trac";
  const address = company["company.address"] || "";
  const email = company["company.email"] || "hello@bdefarmtrac.co.uk";
  const vatNumber = company["company.vatNumber"] || "";
  const registrationNumber = company["company.registrationNumber"] || "";
  const bankName = company["company.bankName"] || "";
  const bankSortCode = company["company.bankSortCode"] || "";
  const bankAccountNumber = company["company.bankAccountNumber"] || "";
  const bankAccountName = company["company.bankAccountName"] || "";
  const paymentTermsDays = company["company.paymentTermsDays"] || "14";
  const logoDataUrl = company["company.logoDataUrl"] || "";

  return (
    <div className="font-sans text-sm text-gray-900 bg-white" style={{ width: "210mm", minHeight: "297mm", padding: "20mm", boxSizing: "border-box" }}>
      <div className="flex justify-between items-start mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {logoDataUrl ? (
              <img src={logoDataUrl} alt={tradingName} style={{ maxHeight: "56px", maxWidth: "200px", objectFit: "contain" }} />
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-800 rounded-md flex items-center justify-center">
                  <span className="text-white text-xs font-bold">BDE</span>
                </div>
                <div>
                  <p className="font-bold text-base text-green-900">{legalName}</p>
                  <p className="text-xs text-gray-500">{tradingName}</p>
                </div>
              </div>
            )}
          </div>
          {logoDataUrl && (
            <div className="mt-1 mb-2">
              <p className="font-bold text-base text-green-900">{legalName}</p>
              <p className="text-xs text-gray-500">{tradingName}</p>
            </div>
          )}
          <div className="text-xs text-gray-600 space-y-0.5 mt-2">
            {address && <p className="whitespace-pre-line">{address}</p>}
            <p className={address ? "mt-1" : ""}>{email}</p>
            {vatNumber && <p>VAT Reg: {vatNumber}</p>}
          </div>
        </div>
        <div className="text-right">
          <h1 className="text-3xl font-bold text-green-900 mb-3">INVOICE</h1>
          <table className="text-xs text-right ml-auto">
            <tbody>
              <tr><td className="text-gray-500 pr-3 py-0.5">Invoice No.</td><td className="font-semibold">{invoice.invoiceNumber}</td></tr>
              <tr><td className="text-gray-500 pr-3 py-0.5">Invoice Date</td><td>{fmtDate(invoice.invoiceDate)}</td></tr>
              <tr><td className="text-gray-500 pr-3 py-0.5">Due Date</td><td className="font-semibold">{fmtDate(invoice.dueDate)}</td></tr>
              <tr><td className="text-gray-500 pr-3 py-0.5">Billing Period</td><td>{fmtPeriod(invoice.billingPeriodStart, invoice.billingPeriodEnd)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-8 p-4 bg-gray-50 rounded-md border border-gray-200">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Bill To</p>
        <p className="font-semibold text-gray-900">{invoice.billingName}</p>
        {invoice.billingAddress && <p className="text-xs text-gray-600 whitespace-pre-line">{invoice.billingAddress}</p>}
        <p className="text-xs text-gray-600">{invoice.billingEmail}</p>
      </div>

      <table className="w-full mb-6 text-xs">
        <thead>
          <tr className="bg-green-900 text-white">
            <th className="text-left px-3 py-2 rounded-tl-md" style={{ width: "55%" }}>Description</th>
            <th className="text-center px-3 py-2" style={{ width: "10%" }}>Qty</th>
            <th className="text-right px-3 py-2" style={{ width: "17.5%" }}>Unit Price</th>
            <th className="text-right px-3 py-2 rounded-tr-md" style={{ width: "17.5%" }}>Net Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-3 py-2 border-b border-gray-100">{item.description}</td>
              <td className="px-3 py-2 border-b border-gray-100 text-center">{item.quantity}</td>
              <td className="px-3 py-2 border-b border-gray-100 text-right">{fmt(item.unitPricePence)}</td>
              <td className="px-3 py-2 border-b border-gray-100 text-right">{fmt(item.netPence)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-1.5 text-xs border-b border-gray-200">
            <span className="text-gray-600">Subtotal (Net)</span>
            <span>{fmt(invoice.netAmountPence)}</span>
          </div>
          <div className="flex justify-between py-1.5 text-xs border-b border-gray-200">
            <span className="text-gray-600">VAT ({invoice.vatRatePct}%)</span>
            <span>{fmt(invoice.vatAmountPence)}</span>
          </div>
          <div className="flex justify-between py-2 text-sm font-bold">
            <span>Total Due (GBP)</span>
            <span className="text-green-900">{fmt(invoice.grossAmountPence)}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6 mt-auto">
        <div className="grid grid-cols-2 gap-8 text-xs text-gray-600">
          <div>
            <p className="font-semibold text-gray-800 mb-1">Payment Terms</p>
            <p>Payment due within {paymentTermsDays} days of invoice date.</p>
            {(bankName || bankSortCode || bankAccountNumber) && (
              <>
                <p className="mt-2 font-semibold text-gray-800">BACS Bank Transfer</p>
                {bankName && <p>Bank: {bankName}</p>}
                {bankAccountName && <p>Account Name: {bankAccountName}</p>}
                {bankSortCode && <p>Sort Code: {bankSortCode}</p>}
                {bankAccountNumber && <p>Account No.: {bankAccountNumber}</p>}
              </>
            )}
            <p className="mt-1">Reference: <strong>{invoice.invoiceNumber}</strong></p>
          </div>
          <div>
            <p className="font-semibold text-gray-800 mb-1">Questions?</p>
            <p>{email}</p>
            <p className="mt-3 font-semibold text-gray-800">Company Details</p>
            <p>{legalName}</p>
            <p>Registered in England &amp; Wales</p>
            {registrationNumber && <p>Company No.: {registrationNumber}</p>}
          </div>
        </div>
        {invoice.notes && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded text-xs text-gray-700">
            <p className="font-semibold text-gray-800 mb-1">Notes</p>
            <p className="whitespace-pre-line">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PrintModal({ invoice, company, onClose }: { invoice: Invoice; company: CompanyConfig; onClose: () => void }) {
  const printRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${invoice.invoiceNumber}</title>
      <style>
        *, *::before, *::after { box-sizing: border-box; }
        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
          background: white;
          color: #111827;
          font-size: 10px;
          line-height: 1.5;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        /* Remove container padding — @page margin handles all whitespace */
        body > div { width: auto !important; min-height: unset !important; padding: 0 !important; }

        /* ── Layout ── */
        .flex { display: flex; }
        .grid { display: grid; }
        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .items-start { align-items: flex-start; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .justify-end { justify-content: flex-end; }
        .gap-2 { gap: 0.5rem; }
        .gap-8 { gap: 2rem; }
        .w-full { width: 100%; }
        .w-64 { width: 16rem; }
        .w-8 { width: 2rem; }
        .h-8 { height: 2rem; }
        .ml-auto { margin-left: auto; }
        .min-w-0 { min-width: 0; }

        /* ── Spacing ── */
        .mb-1 { margin-bottom: 0.3rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-3 { margin-bottom: 0.75rem; }
        .mb-6 { margin-bottom: 1.25rem; }
        .mb-8 { margin-bottom: 1.5rem; }
        .mb-10 { margin-bottom: 2rem; }
        .mt-1 { margin-top: 0.25rem; }
        .mt-2 { margin-top: 0.5rem; }
        .mt-3 { margin-top: 0.75rem; }
        .mt-4 { margin-top: 1rem; }
        .mt-auto { margin-top: auto; }
        .px-3 { padding-left: 0.6rem; padding-right: 0.6rem; }
        .py-0\\.5 { padding-top: 0.1rem; padding-bottom: 0.1rem; }
        .py-1 { padding-top: 0.2rem; padding-bottom: 0.2rem; }
        .py-1\\.5 { padding-top: 0.3rem; padding-bottom: 0.3rem; }
        .py-2 { padding-top: 0.4rem; padding-bottom: 0.4rem; }
        .p-3 { padding: 0.6rem; }
        .p-4 { padding: 0.8rem; }
        .pt-6 { padding-top: 1rem; }
        .pr-3 { padding-right: 0.6rem; }

        /* ── Typography ── */
        .text-3xl { font-size: 1.5rem; line-height: 2rem; }
        .text-base { font-size: 0.75rem; line-height: 1.2rem; }
        .text-sm { font-size: 0.7rem; line-height: 1.1rem; }
        .text-xs { font-size: 0.65rem; line-height: 1rem; }
        .font-bold { font-weight: 700; }
        .font-semibold { font-weight: 600; }
        .font-medium { font-weight: 500; }
        .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace; }
        .text-left { text-align: left; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .uppercase { text-transform: uppercase; }
        .tracking-wider { letter-spacing: 0.05em; }
        .whitespace-pre-line { white-space: pre-line; }

        /* ── Colours ── */
        .text-gray-900 { color: #111827; }
        .text-gray-800 { color: #1f2937; }
        .text-gray-700 { color: #374151; }
        .text-gray-600 { color: #4b5563; }
        .text-gray-500 { color: #6b7280; }
        .text-gray-400 { color: #9ca3af; }
        .text-green-900 { color: #14532d; }
        .text-white { color: #ffffff; }
        .text-amber-700 { color: #b45309; }
        .bg-white { background-color: #ffffff; }
        .bg-gray-50 { background-color: #f9fafb; }
        .bg-gray-100 { background-color: #f3f4f6; }
        .bg-green-900 { background-color: #14532d; }
        .bg-amber-50 { background-color: #fffbeb; }

        /* ── Borders ── */
        .border { border: 1px solid #e5e7eb; }
        .border-t { border-top: 1px solid #e5e7eb; }
        .border-b { border-bottom: 1px solid #e5e7eb; }
        .border-gray-100 { border-color: #f3f4f6; }
        .border-gray-200 { border-color: #e5e7eb; }
        .border-amber-100 { border-color: #fef3c7; }
        .border-border { border-color: #e5e7eb; }
        .rounded { border-radius: 0.25rem; }
        .rounded-md { border-radius: 0.375rem; }
        .rounded-tl-md { border-top-left-radius: 0.375rem; }
        .rounded-tr-md { border-top-right-radius: 0.375rem; }

        /* ── Space-y ── */
        .space-y-0\\.5 > * + * { margin-top: 0.125rem; }
        .space-y-1 > * + * { margin-top: 0.25rem; }

        /* ── Table ── */
        table { border-collapse: collapse; width: 100%; }
        thead { display: table-header-group; }
        thead tr { background-color: #14532d !important; }
        thead th { color: #ffffff !important; }
        tbody tr { break-inside: avoid; }

        /* ── Page breaks ── */
        @page {
          size: A4;
          margin: 14mm 18mm;
          @bottom-right {
            content: "Page " counter(page) " of " counter(pages);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
            font-size: 7pt;
            color: #6b7280;
          }
        }
      </style></head><body>${content}</body></html>`);
    w.document.close();
    w.focus();
    w.addEventListener("afterprint", () => w.close());
    setTimeout(() => { w.print(); }, 300);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 overflow-auto py-6">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full mx-4">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/40 rounded-t-lg">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-sm">{invoice.invoiceNumber}</span>
            <StatusBadge status={invoice.status} />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-800 text-white text-xs font-medium rounded-md hover:bg-green-900 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save as PDF
            </button>
            <button onClick={onClose} className="px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted rounded-md transition-colors">
              Close
            </button>
          </div>
        </div>
        <div className="overflow-auto max-h-[80vh] p-4 bg-gray-100 flex justify-center">
          <div ref={printRef} className="shadow-xl">
            <InvoicePrintView invoice={invoice} company={company} />
          </div>
        </div>
      </div>
    </div>
  );
}

function GenerateDialog({ tenants, onClose, onDone }: { tenants: Tenant[]; onClose: () => void; onDone: (inv: Invoice) => void }) {
  const secret = getSecret()!;
  const [tenantId, setTenantId] = useState("");
  const [vatPct, setVatPct] = useState(20);
  const [notes, setNotes] = useState("");

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
  const [periodStart, setPeriodStart] = useState(monthStart);
  const [periodEnd, setPeriodEnd] = useState(monthEnd);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (!tenantId) { setError("Select a customer"); return; }
    setLoading(true); setError("");
    try {
      const result = await api.generateInvoice(parseInt(tenantId, 10), { billingPeriodStart: periodStart, billingPeriodEnd: periodEnd, vatRatePct: vatPct, notes }, secret);
      onDone(result.invoice);
    } catch (e: any) {
      setError(e.message ?? "Failed to generate invoice");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold">Generate Invoice</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Auto-generates line items from active subscriptions</p>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Customer *</label>
            <select value={tenantId} onChange={e => setTenantId(e.target.value)} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background">
              <option value="">Select customer…</option>
              {tenants.filter(t => t.isActive).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Period Start</label>
              <input type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Period End</label>
              <input type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">VAT Rate</label>
            <select value={vatPct} onChange={e => setVatPct(parseInt(e.target.value, 10))} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background">
              <option value={20}>20% (Standard Rate)</option>
              <option value={0}>0% (Zero Rated / Not VAT Registered)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Notes (optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Any additional notes for this invoice…" className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background resize-none" />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <div className="px-5 py-4 border-t border-border flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-md transition-colors">Cancel</button>
          <button onClick={handleGenerate} disabled={loading} className="px-4 py-2 text-sm bg-green-800 text-white rounded-md hover:bg-green-900 transition-colors disabled:opacity-50 flex items-center gap-2">
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Generate Invoice
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Ad Hoc Invoice Dialog ────────────────────────────────────────────────────

function AdHocInvoiceDialog({ tenants, onClose, onDone }: { tenants: Tenant[]; onClose: () => void; onDone: (inv: Invoice) => void }) {
  const secret = getSecret()!;
  const today = new Date().toISOString().slice(0, 10);
  const [tenantId, setTenantId] = useState("");
  const [serviceDate, setServiceDate] = useState(today);
  const [vatPct, setVatPct] = useState(20);
  const [notes, setNotes] = useState("");
  const [billingName, setBillingName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  type LineItem = { id: number; description: string; quantity: string; unitPrice: string };
  const [lineItems, setLineItems] = useState<LineItem[]>([{ id: 1, description: "", quantity: "1", unitPrice: "" }]);
  const nextId = useRef(2);

  function selectTenant(id: string) {
    setTenantId(id);
    const t = tenants.find(t => String(t.id) === id);
    if (t) {
      setBillingName(t.name);
      setBillingEmail(t.contactEmail);
    }
  }

  function updateItem(id: number, field: keyof Omit<LineItem, "id">, value: string) {
    setLineItems(prev => prev.map(li => li.id === id ? { ...li, [field]: value } : li));
  }

  function addItem() {
    setLineItems(prev => [...prev, { id: nextId.current++, description: "", quantity: "1", unitPrice: "" }]);
  }

  function removeItem(id: number) {
    setLineItems(prev => prev.filter(li => li.id !== id));
  }

  const parsedItems = lineItems.map(li => {
    const qty = parseFloat(li.quantity) || 0;
    const unitPricePence = Math.round((parseFloat(li.unitPrice) || 0) * 100);
    const netPence = Math.round(qty * unitPricePence);
    return { description: li.description, quantity: qty, unitPricePence, netPence };
  });

  const netTotal = parsedItems.reduce((a, i) => a + i.netPence, 0);
  const vatTotal = Math.round(netTotal * (vatPct / 100));
  const grossTotal = netTotal + vatTotal;

  async function handleCreate() {
    if (!tenantId) { setError("Please select a customer"); return; }
    if (!billingName.trim() || !billingEmail.trim()) { setError("Billing name and email are required"); return; }
    if (parsedItems.some(i => !i.description.trim())) { setError("All line items need a description"); return; }
    if (parsedItems.some(i => i.quantity <= 0 || i.unitPricePence <= 0)) { setError("All line items need a valid quantity and unit price"); return; }
    setLoading(true); setError("");
    try {
      const result = await api.createAdHocInvoice({
        tenantId: parseInt(tenantId, 10),
        billingPeriodStart: serviceDate,
        billingPeriodEnd: serviceDate,
        lineItems: parsedItems,
        vatRatePct: vatPct,
        notes: notes.trim() || undefined,
        billingName: billingName.trim(),
        billingEmail: billingEmail.trim(),
      }, secret);
      onDone(result.invoice);
    } catch (e: any) {
      setError(e.message ?? "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-auto py-6">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 my-auto">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold">Create Ad Hoc Invoice</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Manually enter line items — e.g. onsite support, consultancy, training</p>
        </div>
        <div className="p-5 space-y-5 max-h-[72vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Customer *</label>
              <select value={tenantId} onChange={e => selectTenant(e.target.value)} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background">
                <option value="">Select customer…</option>
                {tenants.filter(t => t.isActive).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Service Date *</label>
              <input type="date" value={serviceDate} onChange={e => setServiceDate(e.target.value)} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Billing Name *</label>
              <input value={billingName} onChange={e => setBillingName(e.target.value)} placeholder="Auto-filled from customer" className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Billing Email *</label>
              <input type="email" value={billingEmail} onChange={e => setBillingEmail(e.target.value)} placeholder="Auto-filled from customer" className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-muted-foreground">Line Items *</label>
              <button onClick={addItem} className="text-xs text-green-800 hover:text-green-900 font-medium flex items-center gap-1 transition-colors">
                <Plus className="w-3 h-3" /> Add Line
              </button>
            </div>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-xs text-muted-foreground border-b border-border">
                    <th className="text-left px-3 py-2 font-medium" style={{ width: "48%" }}>Description</th>
                    <th className="text-center px-3 py-2 font-medium" style={{ width: "10%" }}>Qty</th>
                    <th className="text-right px-3 py-2 font-medium" style={{ width: "18%" }}>Unit Price (£)</th>
                    <th className="text-right px-3 py-2 font-medium" style={{ width: "18%" }}>Net</th>
                    <th className="px-2 py-2" style={{ width: "6%" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map(li => {
                    const qty = parseFloat(li.quantity) || 0;
                    const up = parseFloat(li.unitPrice) || 0;
                    const net = qty * up;
                    return (
                      <tr key={li.id} className="border-b border-border last:border-0">
                        <td className="px-2 py-1.5">
                          <input
                            value={li.description}
                            onChange={e => updateItem(li.id, "description", e.target.value)}
                            placeholder="e.g. One Day's Onsite Support During Go Live"
                            className="w-full border border-border rounded px-2 py-1.5 text-xs bg-background"
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={li.quantity}
                            onChange={e => updateItem(li.id, "quantity", e.target.value)}
                            className="w-full border border-border rounded px-2 py-1.5 text-xs bg-background text-center"
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={li.unitPrice}
                            onChange={e => updateItem(li.id, "unitPrice", e.target.value)}
                            placeholder="0.00"
                            className="w-full border border-border rounded px-2 py-1.5 text-xs bg-background text-right"
                          />
                        </td>
                        <td className="px-3 py-1.5 text-right text-xs font-mono text-muted-foreground whitespace-nowrap">
                          {net > 0 ? fmt(Math.round(net * 100)) : "—"}
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          {lineItems.length > 1 && (
                            <button onClick={() => removeItem(li.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div style={{ width: "200px", flexShrink: 0 }}>
              <label className="block text-xs font-medium text-muted-foreground mb-1">VAT Rate</label>
              <select value={vatPct} onChange={e => setVatPct(parseInt(e.target.value, 10))} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background">
                <option value={20}>20% (Standard Rate)</option>
                <option value={0}>0% (Zero Rated)</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Notes (optional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Any additional notes for this invoice…" className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background resize-none" />
            </div>
          </div>

          {netTotal > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Net Total</span>
                <span className="font-mono">{fmt(netTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">VAT ({vatPct}%)</span>
                <span className="font-mono">{fmt(vatTotal)}</span>
              </div>
              <div className="flex justify-between text-base font-bold border-t border-green-200 pt-2">
                <span className="text-green-900">Total Due</span>
                <span className="text-green-900 font-mono">{fmt(grossTotal)}</span>
              </div>
            </div>
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <div className="px-5 py-4 border-t border-border flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-md transition-colors">Cancel</button>
          <button onClick={handleCreate} disabled={loading} className="px-4 py-2 text-sm bg-green-800 text-white rounded-md hover:bg-green-900 transition-colors disabled:opacity-50 flex items-center gap-2">
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Create Draft Invoice
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Mark Sent Dialog ─────────────────────────────────────────────────────────

const SEND_METHODS = [
  { value: "email", label: "Email (sent manually)" },
  { value: "post", label: "Post" },
  { value: "hand_delivered", label: "Hand Delivered" },
  { value: "portal", label: "Portal / Online" },
  { value: "other", label: "Other" },
];

function MarkSentDialog({ invoice, onClose, onDone, mutation }: { invoice: Invoice; onClose: () => void; onDone: (method: string) => void; mutation?: { isError: boolean; isPending: boolean; error: unknown } }) {
  const [method, setMethod] = useState("post");
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Mark as Sent — {invoice.invoiceNumber}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground mt-1">How was this invoice sent to <strong>{invoice.billingName}</strong>?</p>
        <div className="space-y-1 mt-3">
          {SEND_METHODS.map(m => (
            <label key={m.value} className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg hover:bg-muted/40 transition-colors">
              <input type="radio" name="sentMethod" value={m.value} checked={method === m.value} onChange={() => setMethod(m.value)} className="w-4 h-4 accent-green-800" />
              <span className="text-sm">{m.label}</span>
            </label>
          ))}
        </div>
        {mutation && <DialogMutationError mutation={mutation} message="Failed to mark this invoice as sent — its status is unchanged." />}
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onDone(method)} disabled={mutation?.isPending} className="bg-green-800 hover:bg-green-900 text-white">Mark as Sent</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Bulk Generate Dialog ─────────────────────────────────────────────────────

function BulkGenerateDialog({ onClose }: { onClose: () => void }) {
  const secret = getSecret()!;
  const qc = useQueryClient();
  const now = new Date();
  const [start, setStart] = useState(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10));
  const [end, setEnd] = useState(new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10));
  const [vatRatePct, setVatRatePct] = useState(20);
  const [notes, setNotes] = useState("");
  const [results, setResults] = useState<{
    generated: Array<{ tenantName: string; invoiceNumber: string }>;
    skipped: Array<{ tenantName: string; reason: string }>;
    errors: Array<{ tenantName: string; error: string }>;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await api.bulkGenerateInvoices({ billingPeriodStart: start, billingPeriodEnd: end, vatRatePct, notes: notes || undefined }, secret);
      setResults(res);
      qc.invalidateQueries({ queryKey: ["admin-invoices"] });
      qc.invalidateQueries({ queryKey: ["admin-invoices-all-drafts"] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Bulk Generate Invoices</DialogTitle></DialogHeader>
        {!results ? (
          <>
            <p className="text-sm text-muted-foreground mt-1">Generates draft invoices for all active customers for the selected period. Customers who already have an invoice for this period will be skipped automatically.</p>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Period Start</label>
                  <input type="date" value={start} onChange={e => setStart(e.target.value)} className="w-full border border-border rounded-md px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Period End</label>
                  <input type="date" value={end} onChange={e => setEnd(e.target.value)} className="w-full border border-border rounded-md px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">VAT Rate</label>
                <select value={vatRatePct} onChange={e => setVatRatePct(Number(e.target.value))} className="w-full border border-border rounded-md px-3 py-2 text-sm">
                  <option value={20}>20% Standard Rate</option>
                  <option value={0}>0% Zero-rated</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Notes (optional — added to all invoices)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="e.g. Thank you for your continued subscription." className="w-full border border-border rounded-md px-3 py-2 text-sm resize-none" />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleGenerate} disabled={loading || !start || !end} className="bg-green-800 hover:bg-green-900 text-white">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Users className="w-4 h-4 mr-2" />Generate for All Customers</>}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="space-y-3 mt-2">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-green-800 mb-1.5">✓ {results.generated.length} invoice{results.generated.length !== 1 ? "s" : ""} generated</p>
                {results.generated.length > 0 && <ul className="text-xs text-green-700 space-y-0.5">{results.generated.map((r, i) => <li key={i}>{r.tenantName} — {r.invoiceNumber}</li>)}</ul>}
              </div>
              {results.skipped.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-amber-800 mb-1.5">→ {results.skipped.length} skipped (invoice already exists for this period)</p>
                  <ul className="text-xs text-amber-700 space-y-0.5">{results.skipped.map((r, i) => <li key={i}>{r.tenantName}</li>)}</ul>
                </div>
              )}
              {results.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-red-800 mb-1.5">✗ {results.errors.length} failed</p>
                  <ul className="text-xs text-red-700 space-y-0.5">{results.errors.map((r, i) => <li key={i}>{r.tenantName}: {r.error}</li>)}</ul>
                </div>
              )}
            </div>
            <DialogFooter className="mt-4">
              <Button onClick={onClose} className="bg-green-800 hover:bg-green-900 text-white">Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Bulk Email Dialog ────────────────────────────────────────────────────────

function BulkEmailDialog({ invoices, onClose }: { invoices: Invoice[]; onClose: () => void }) {
  const secret = getSecret()!;
  const qc = useQueryClient();
  const [results, setResults] = useState<Array<{ invoiceNumber: string; billingName: string; sent: boolean; reason?: string }> | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    setLoading(true);
    try {
      const res = await api.bulkEmailInvoices({ invoiceIds: invoices.map(i => i.id) }, secret);
      setResults(res.results);
      qc.invalidateQueries({ queryKey: ["admin-invoices"] });
      qc.invalidateQueries({ queryKey: ["admin-invoices-all-drafts"] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Email Invoices to Customers</DialogTitle></DialogHeader>
        {!results ? (
          <>
            <p className="text-sm text-muted-foreground mt-1">
              The following <strong>{invoices.length} draft invoice{invoices.length !== 1 ? "s" : ""}</strong> will be emailed to their billing contacts and automatically marked as <strong>Sent</strong>.
            </p>
            <div className="max-h-60 overflow-y-auto border border-border rounded-lg mt-3">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/40 border-b border-border sticky top-0">
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Invoice</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Customer</th>
                    <th className="text-right px-3 py-2 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Recipient</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => (
                    <tr key={inv.id} className="border-b border-border last:border-0">
                      <td className="px-3 py-2 font-mono font-semibold">{inv.invoiceNumber}</td>
                      <td className="px-3 py-2">{inv.billingName}</td>
                      <td className="px-3 py-2 text-right font-mono">{fmt(inv.grossAmountPence)}</td>
                      <td className="px-3 py-2 text-muted-foreground truncate max-w-[130px]">{inv.billingEmail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSend} disabled={loading} className="bg-green-800 hover:bg-green-900 text-white">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</> : <><Mail className="w-4 h-4 mr-2" />Send All Emails</>}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="space-y-2 mt-2 max-h-72 overflow-y-auto">
              {results.map((r, i) => (
                <div key={i} className={`flex items-start gap-3 px-4 py-3 rounded-lg border ${r.sent ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                  <span className={`text-base leading-none mt-0.5 ${r.sent ? "text-green-700" : "text-red-600"}`}>{r.sent ? "✓" : "✗"}</span>
                  <div>
                    <p className="text-sm font-medium">{r.billingName} — <span className="font-mono">{r.invoiceNumber}</span></p>
                    {!r.sent && r.reason && <p className="text-xs text-red-600 mt-0.5">{r.reason}</p>}
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter className="mt-4">
              <Button onClick={onClose} className="bg-green-800 hover:bg-green-900 text-white">Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Invoices Component ──────────────────────────────────────────────────

function MarkPaidDialog({ invoice, onClose, onDone }: { invoice: Invoice; onClose: () => void; onDone: () => void }) {
  const secret = getSecret()!;
  const [method, setMethod] = useState("bacs");
  const [ref, setRef] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      await api.updateInvoice(invoice.id, { status: "paid", paymentMethod: method, paymentReference: ref }, secret);
      onDone();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold">Record Payment — {invoice.invoiceNumber}</h2>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Payment Method</label>
            <select value={method} onChange={e => setMethod(e.target.value)} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background">
              <option value="bacs">BACS Bank Transfer</option>
              <option value="direct_debit">Direct Debit</option>
              <option value="card">Card Payment</option>
              <option value="cheque">Cheque</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Reference / Transaction ID</label>
            <input value={ref} onChange={e => setRef(e.target.value)} placeholder="e.g. bank ref or transaction ID" className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background" />
          </div>
        </div>
        <div className="px-5 py-4 border-t border-border flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-md transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={loading} className="px-4 py-2 text-sm bg-green-800 text-white rounded-md hover:bg-green-900 transition-colors disabled:opacity-50 flex items-center gap-2">
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Mark as Paid
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Invoices() {
  const secret = getSecret()!;
  const qc = useQueryClient();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const [showGenerate, setShowGenerate] = useState(false);
  const [showAdHoc, setShowAdHoc] = useState(false);
  const [showBulkGenerate, setShowBulkGenerate] = useState(false);
  const [bulkEmailList, setBulkEmailList] = useState<Invoice[] | null>(null);
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);
  const [markPaidInvoice, setMarkPaidInvoice] = useState<Invoice | null>(null);
  const [markSentInvoice, setMarkSentInvoice] = useState<Invoice | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<{ msg: string; fn: () => void } | null>(null);

  const { data: invoicesData, isLoading: invLoading } = useQuery({
    queryKey: ["admin-invoices", statusFilter],
    queryFn: () => api.listInvoices(statusFilter === "all" ? undefined : statusFilter, undefined, secret),
  });
  const { data: tenantsData } = useQuery({
    queryKey: ["admin-tenants"],
    queryFn: () => api.getTenants(secret),
  });
  const { data: configData } = useQuery({
    queryKey: ["admin-platform-config"],
    queryFn: () => api.getPlatformConfig(secret),
    staleTime: 5 * 60 * 1000,
  });
  const companyConfig = useMemo<CompanyConfig>(() => {
    if (!configData?.items) return {};
    return Object.fromEntries(configData.items.map(i => [i.key, i.currentValue ?? i.defaultValue ?? ""]));
  }, [configData]);

  const { data: allDraftsData } = useQuery({
    queryKey: ["admin-invoices-all-drafts"],
    queryFn: () => api.listInvoices("draft", undefined, secret),
  });
  const draftInvoices = allDraftsData?.invoices ?? [];

  const updateMut = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Record<string, unknown> }) => api.updateInvoice(id, updates, secret),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-invoices"] });
      qc.invalidateQueries({ queryKey: ["admin-invoices-all-drafts"] });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => api.deleteInvoice(id, secret),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-invoices"] });
      qc.invalidateQueries({ queryKey: ["admin-invoices-all-drafts"] });
      setPendingConfirm(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });
  const emailMut = useMutation({
    mutationFn: (id: number) => api.emailInvoice(id, secret),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-invoices"] });
      qc.invalidateQueries({ queryKey: ["admin-invoices-all-drafts"] });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const invoices = invoicesData?.invoices ?? [];
  const tenants = tenantsData?.tenants ?? [];

  const totals = {
    outstanding: invoices.filter(i => i.status === "sent" || i.status === "overdue").reduce((a, i) => a + i.grossAmountPence, 0),
    paid: invoices.filter(i => i.status === "paid").reduce((a, i) => a + i.grossAmountPence, 0),
    draft: invoices.filter(i => i.status === "draft").length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Invoices</h1>
          <p className="text-sm text-muted-foreground">Generate and manage customer invoices with VAT</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBulkGenerate(true)}
            className="flex items-center gap-2 px-3 py-2 border border-border bg-white text-sm font-medium rounded-lg hover:bg-muted/40 transition-colors text-foreground"
            title="Generate invoices for all active customers"
          >
            <Users className="w-4 h-4" />
            Bulk Generate
          </button>
          <button
            onClick={() => draftInvoices.length > 0 ? setBulkEmailList(draftInvoices) : undefined}
            disabled={draftInvoices.length === 0}
            className="flex items-center gap-2 px-3 py-2 border border-border bg-white text-sm font-medium rounded-lg hover:bg-muted/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-foreground"
            title={draftInvoices.length > 0 ? `Email ${draftInvoices.length} draft invoice${draftInvoices.length !== 1 ? "s" : ""} to customers` : "No draft invoices to email"}
          >
            <Mail className="w-4 h-4" />
            Email Drafts{draftInvoices.length > 0 ? ` (${draftInvoices.length})` : ""}
          </button>
          <button
            onClick={() => setShowAdHoc(true)}
            className="flex items-center gap-2 px-3 py-2 border border-border bg-white text-sm font-medium rounded-lg hover:bg-muted/40 transition-colors text-foreground"
            title="Create an invoice for a one-off service — e.g. onsite support, consultancy"
          >
            <PenLine className="w-4 h-4" />
            Ad Hoc Invoice
          </button>
          <button
            onClick={() => setShowGenerate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-800 text-white text-sm font-medium rounded-lg hover:bg-green-900 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Generate Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Outstanding (sent/overdue)</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{fmt(totals.outstanding)}</p>
        </div>
        <div className="bg-white border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Paid this view</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{fmt(totals.paid)}</p>
        </div>
        <div className="bg-white border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Drafts awaiting review</p>
          <p className="text-2xl font-bold mt-1">{totals.draft}</p>
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/20">
          {["all", "draft", "sent", "paid", "overdue", "void"].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize ${statusFilter === s ? "bg-green-800 text-white" : "text-muted-foreground hover:bg-muted"}`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>

        {invLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No invoices found</p>
            <p className="text-xs text-muted-foreground mt-1">Click "Generate Invoice" to create your first invoice</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground border-b border-border">
                <th className="text-left px-4 py-2.5 font-medium">Invoice No.</th>
                <th className="text-left px-4 py-2.5 font-medium">Customer</th>
                <th className="text-left px-4 py-2.5 font-medium">Period</th>
                <th className="text-left px-4 py-2.5 font-medium">Date</th>
                <th className="text-left px-4 py-2.5 font-medium">Due</th>
                <th className="text-right px-4 py-2.5 font-medium">Net</th>
                <th className="text-right px-4 py-2.5 font-medium">VAT</th>
                <th className="text-right px-4 py-2.5 font-medium">Gross</th>
                <th className="text-left px-4 py-2.5 font-medium">Status</th>
                <th className="text-right px-4 py-2.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium truncate max-w-[160px]">{(inv as any).tenantName ?? inv.billingName}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[160px]">{inv.billingEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {fmtPeriod(inv.billingPeriodStart, inv.billingPeriodEnd)}
                  </td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap">{fmtDate(inv.invoiceDate)}</td>
                  <td className={`px-4 py-3 text-xs whitespace-nowrap ${inv.status === "overdue" ? "text-red-600 font-semibold" : ""}`}>
                    {fmtDate(inv.dueDate)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs">{fmt(inv.netAmountPence)}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs">{fmt(inv.vatAmountPence)}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs font-semibold">{fmt(inv.grossAmountPence)}</td>
                  <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setPrintInvoice(inv)}
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="View / Print"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      {inv.status === "draft" && (
                        <>
                          <button
                            onClick={() => setMarkSentInvoice(inv)}
                            className="p-1.5 rounded hover:bg-blue-50 text-muted-foreground hover:text-blue-700 transition-colors"
                            title="Mark as Sent (record send method)"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => emailMut.mutate(inv.id)}
                            disabled={emailMut.isPending}
                            className="p-1.5 rounded hover:bg-green-50 text-muted-foreground hover:text-green-700 transition-colors disabled:opacity-40"
                            title={`Email invoice to ${inv.billingEmail}`}
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      {inv.status === "sent" && (
                        <button
                          onClick={() => emailMut.mutate(inv.id)}
                          disabled={emailMut.isPending}
                          className="p-1.5 rounded hover:bg-green-50 text-muted-foreground hover:text-green-700 transition-colors disabled:opacity-40"
                          title={`Re-send invoice to ${inv.billingEmail}`}
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {(inv.status === "sent" || inv.status === "overdue") && (
                        <button
                          onClick={() => setMarkPaidInvoice(inv)}
                          className="p-1.5 rounded hover:bg-green-50 text-muted-foreground hover:text-green-700 transition-colors"
                          title="Mark as Paid"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {(inv.status === "draft" || inv.status === "sent") && (
                        <button
                          onClick={() => updateMut.mutate({ id: inv.id, updates: { status: "void" } })}
                          className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                          title="Void Invoice"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {(inv.status === "draft" || inv.status === "void") && (
                        <button
                          onClick={() => setPendingConfirm({ msg: `Delete invoice ${inv.invoiceNumber}? This cannot be undone.`, fn: () => deleteMut.mutate(inv.id) })}
                          className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        open={!!pendingConfirm}
        title="Delete Invoice"
        message={pendingConfirm?.msg ?? ""}
        onConfirm={() => { pendingConfirm?.fn(); }}
        onCancel={() => { setPendingConfirm(null); deleteMut.reset(); }}
        confirmLabel="Delete"
        confirmVariant="destructive"
        mutation={deleteMut}
      />
      {showGenerate && (
        <GenerateDialog
          tenants={tenants}
          onClose={() => setShowGenerate(false)}
          onDone={(inv) => {
            qc.invalidateQueries({ queryKey: ["admin-invoices"] });
            setShowGenerate(false);
            setPrintInvoice(inv);
          }}
        />
      )}
      {printInvoice && <PrintModal invoice={printInvoice} company={companyConfig} onClose={() => setPrintInvoice(null)} />}
      {markPaidInvoice && (
        <MarkPaidDialog
          invoice={markPaidInvoice}
          onClose={() => setMarkPaidInvoice(null)}
          onDone={() => { qc.invalidateQueries({ queryKey: ["admin-invoices"] }); setMarkPaidInvoice(null); }}
        />
      )}
      {markSentInvoice && (
        <MarkSentDialog
          invoice={markSentInvoice}
          onClose={() => { setMarkSentInvoice(null); updateMut.reset(); }}
          onDone={(method) => {
            updateMut.mutate(
              { id: markSentInvoice.id, updates: { status: "sent", sentMethod: method } },
              { onSuccess: () => setMarkSentInvoice(null) },
            );
          }}
          mutation={updateMut}
        />
      )}
      {showAdHoc && (
        <AdHocInvoiceDialog
          tenants={tenants}
          onClose={() => setShowAdHoc(false)}
          onDone={(inv) => {
            qc.invalidateQueries({ queryKey: ["admin-invoices"] });
            qc.invalidateQueries({ queryKey: ["admin-invoices-all-drafts"] });
            setShowAdHoc(false);
            setPrintInvoice(inv);
          }}
        />
      )}
      {showBulkGenerate && <BulkGenerateDialog onClose={() => setShowBulkGenerate(false)} />}
      {bulkEmailList && (
        <BulkEmailDialog
          invoices={bulkEmailList}
          onClose={() => setBulkEmailList(null)}
        />
      )}
    </div>
  );
}
