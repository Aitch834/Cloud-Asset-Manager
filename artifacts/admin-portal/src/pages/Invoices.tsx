import { useState, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type Invoice, type Tenant } from "@/lib/api";
import { getSecret } from "@/lib/auth";
import { FileText, Plus, Printer, CheckCircle, Send, XCircle, ChevronDown, AlertCircle, Clock, Loader2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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

function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = "Confirm", confirmVariant = "default" }: { open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; confirmLabel?: string; confirmVariant?: "default" | "destructive" }) {
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
        body { margin: 0; font-family: -apple-system, sans-serif; background: white; }
        @media print { @page { margin: 0; size: A4; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style></head><body>${content}</body></html>`);
    w.document.close();
    w.focus();
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [showGenerate, setShowGenerate] = useState(false);
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);
  const [markPaidInvoice, setMarkPaidInvoice] = useState<Invoice | null>(null);
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

  const updateMut = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Record<string, unknown> }) => api.updateInvoice(id, updates, secret),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-invoices"] }),
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => api.deleteInvoice(id, secret),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-invoices"] }),
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
        <button
          onClick={() => setShowGenerate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-800 text-white text-sm font-medium rounded-lg hover:bg-green-900 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Generate Invoice
        </button>
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
                        <button
                          onClick={() => updateMut.mutate({ id: inv.id, updates: { status: "sent" } })}
                          className="p-1.5 rounded hover:bg-blue-50 text-muted-foreground hover:text-blue-700 transition-colors"
                          title="Mark as Sent"
                        >
                          <Send className="w-3.5 h-3.5" />
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
        onConfirm={() => { pendingConfirm?.fn(); setPendingConfirm(null); }}
        onCancel={() => setPendingConfirm(null)}
        confirmLabel="Delete"
        confirmVariant="destructive"
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
    </div>
  );
}
