import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  Link2,
  Trash2,
  PoundSterling,
  Package,
  Download,
} from "lucide-react";

const CATEGORIES = [
  "Seeds & Seed Treatments",
  "Fertiliser",
  "Pesticides & Herbicides",
  "Fungicides",
  "Insecticides",
  "Veterinary & Medicine",
  "Feed & Bedding",
  "Fuel",
  "Machinery & Equipment",
  "Labour",
  "Agri-Environment Scheme",
  "Grant / Subsidy",
  "Crop Sales",
  "Livestock Sales",
  "Haulage",
  "Other Income",
  "Other Expense",
];

const PAYMENT_METHODS = ["Bank Transfer", "Direct Debit", "Cheque", "Cash", "Card", "BACS", "Other"];

const fmt = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtAmt = (pence: number | null | undefined) => {
  if (pence == null) return "—";
  return `£${(pence / 100).toFixed(2)}`;
};

export default function FinancialPage() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");
  const [exporting, setExporting] = useState(false);
  const [form, setForm] = useState<any>({
    transactionDate: "",
    transactionType: "expense",
    category: "",
    description: "",
    amountPence: "",
    vatAmountPence: "",
    vatRate: "",
    vendorCustomer: "",
    paymentMethod: "",
    reference: "",
    notes: "",
  });

  const txQ = useQuery({
    queryKey: ["financial-transactions", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/financial-transactions`).then(r => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? [],
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["financial-transactions", farmId] });

  const createMut = useMutation({
    mutationFn: (body: any) =>
      fetch(`/api/farms/${farmId}/financial-transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...body,
          amountPence: body.amountPence ? Math.round(parseFloat(body.amountPence) * 100) : 0,
          vatAmountPence: body.vatAmountPence ? Math.round(parseFloat(body.vatAmountPence) * 100) : null,
        }),
      }),
    onSuccess: () => {
      toast({ title: "Transaction saved" });
      invalidate();
      setAddOpen(false);
      resetForm();
    },
    onError: () => toast({ title: "Failed to save transaction", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/farms/${farmId}/financial-transactions/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Transaction deleted" });
      invalidate();
      setDeleteId(null);
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const resetForm = () =>
    setForm({
      transactionDate: "",
      transactionType: "expense",
      category: "",
      description: "",
      amountPence: "",
      vatAmountPence: "",
      vatRate: "",
      vendorCustomer: "",
      paymentMethod: "",
      reference: "",
      notes: "",
    });

  const records: any[] = txQ.data ?? [];

  const filtered = records.filter((r) => {
    if (typeFilter !== "all" && r.transactionType !== typeFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        r.description?.toLowerCase().includes(s) ||
        r.vendorCustomer?.toLowerCase().includes(s) ||
        r.reference?.toLowerCase().includes(s) ||
        r.category?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const totalIncome = records.filter(r => r.transactionType === "income").reduce((s, r) => s + (r.amountPence ?? 0), 0);
  const totalExpense = records.filter(r => r.transactionType === "expense").reduce((s, r) => s + (r.amountPence ?? 0), 0);
  const net = totalIncome - totalExpense;

  return (
    <AppLayout title="Financial Records">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="mb-4">
          <p className="text-sm text-gray-500">
            Income, expenses and supplier invoices — linked to goods received records where applicable.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: "1.5rem" }}>
          <SummaryCard label="Total Income" amount={totalIncome} positive />
          <SummaryCard label="Total Expenses" amount={totalExpense} positive={false} />
          <SummaryCard label="Net Balance" amount={net} positive={net >= 0} net />
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
            <Input placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32 }} />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger style={{ width: 150 }}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income only</SelectItem>
              <SelectItem value="expense">Expenses only</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => setExportOpen(true)}>
            <Download size={14} className="mr-1" />Export to Xero
          </Button>
          <Button size="sm" onClick={() => { resetForm(); setAddOpen(true); }}>
            <Plus size={14} className="mr-1" />Add Transaction
          </Button>
        </div>

        {txQ.isLoading ? (
          <p className="text-sm text-gray-400 py-8 text-center">Loading...</p>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  {["Date", "Description", "Category", "Type", "Amount", "VAT", "Supplier / Customer", "Reference", "Linked Delivery", ""].map(h => (
                    <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r: any, i: number) => (
                  <tr key={r.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                    <td style={{ padding: "0.625rem 0.875rem", whiteSpace: "nowrap", color: "#6b7280" }}>{fmt(r.transactionDate)}</td>
                    <td style={{ padding: "0.625rem 0.875rem", fontWeight: 500, maxWidth: 200 }}>{r.description || "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{r.category || "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem" }}>
                      <TypeBadge type={r.transactionType} />
                    </td>
                    <td style={{ padding: "0.625rem 0.875rem", fontWeight: 600, whiteSpace: "nowrap", color: r.transactionType === "income" ? "#166534" : "#111827" }}>
                      {fmtAmt(r.amountPence)}
                    </td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>
                      {r.vatAmountPence ? fmtAmt(r.vatAmountPence) : "—"}
                    </td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.vendorCustomer || "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.reference || "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem" }}>
                      {r.stockDeliveryId ? (
                        <LinkedDeliveryBadge record={r} />
                      ) : (
                        <span style={{ color: "#d1d5db", fontSize: "0.75rem" }}>None</span>
                      )}
                    </td>
                    <td style={{ padding: "0.5rem" }}>
                      <button
                        onClick={() => setDeleteId(r.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) resetForm(); }}>
          <DialogContent style={{ maxWidth: 560 }}>
            <DialogHeader><DialogTitle>Add Financial Transaction</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Date <span style={{ color: "#ef4444" }}>*</span></Label>
                  <Input type="date" value={form.transactionDate} onChange={e => setForm((f: any) => ({ ...f, transactionDate: e.target.value }))} />
                </div>
                <div>
                  <Label>Type <span style={{ color: "#ef4444" }}>*</span></Label>
                  <Select value={form.transactionType} onValueChange={v => setForm((f: any) => ({ ...f, transactionType: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Description <span style={{ color: "#ef4444" }}>*</span></Label>
                <Input placeholder="e.g. Fertiliser purchase — 20 bags NPK" value={form.description} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Category <span style={{ color: "#ef4444" }}>*</span></Label>
                  <Select value={form.category} onValueChange={v => setForm((f: any) => ({ ...f, category: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select category..." /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <Select value={form.paymentMethod} onValueChange={v => setForm((f: any) => ({ ...f, paymentMethod: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Amount (£) <span style={{ color: "#ef4444" }}>*</span></Label>
                  <Input type="number" step="0.01" placeholder="0.00" value={form.amountPence} onChange={e => setForm((f: any) => ({ ...f, amountPence: e.target.value }))} />
                </div>
                <div>
                  <Label>VAT Amount (£)</Label>
                  <Input type="number" step="0.01" placeholder="0.00" value={form.vatAmountPence} onChange={e => setForm((f: any) => ({ ...f, vatAmountPence: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Supplier / Customer</Label>
                  <Input placeholder="Name of supplier or customer" value={form.vendorCustomer} onChange={e => setForm((f: any) => ({ ...f, vendorCustomer: e.target.value }))} />
                </div>
                <div>
                  <Label>Invoice / Reference No.</Label>
                  <Input placeholder="e.g. INV-2024-001" value={form.reference} onChange={e => setForm((f: any) => ({ ...f, reference: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea placeholder="Optional notes..." value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button
                onClick={() => createMut.mutate(form)}
                disabled={!form.transactionDate || !form.description || !form.category || !form.amountPence || createMut.isPending}
              >
                Save Transaction
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
          <DialogContent style={{ maxWidth: 420 }}>
            <DialogHeader><DialogTitle>Delete Transaction</DialogTitle></DialogHeader>
            <p className="text-sm text-gray-600 py-2">Are you sure you want to delete this transaction? This cannot be undone.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => deleteId !== null && deleteMut.mutate(deleteId)}
                disabled={deleteMut.isPending}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={exportOpen} onOpenChange={o => { setExportOpen(o); }}>
          <DialogContent style={{ maxWidth: 440 }}>
            <DialogHeader><DialogTitle>Export to Xero CSV</DialogTitle></DialogHeader>
            <p className="text-sm text-gray-600 py-1">Choose a date range to export transactions in Xero-compatible CSV format.</p>
            <div className="space-y-3 py-2">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">From Date</label>
                <input type="date" value={exportStartDate} onChange={e => setExportStartDate(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">To Date</label>
                <input type="date" value={exportEndDate} onChange={e => setExportEndDate(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setExportOpen(false)}>Cancel</Button>
              <Button
                onClick={async () => {
                  if (!farmId) return;
                  setExporting(true);
                  try {
                    const body: any = { format: "xero" };
                    if (exportStartDate) body.startDate = exportStartDate;
                    if (exportEndDate) body.endDate = exportEndDate;
                    const resp = await fetch(`/api/farms/${farmId}/financial-exports`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(body),
                    });
                    if (!resp.ok) throw new Error("Export failed");
                    const blob = await resp.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `xero-export-${exportStartDate || "all"}-to-${exportEndDate || "all"}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                    setExportOpen(false);
                    toast({ title: "Export downloaded" });
                  } catch {
                    toast({ title: "Export failed", variant: "destructive" });
                  } finally {
                    setExporting(false);
                  }
                }}
                disabled={exporting}
              >
                <Download size={14} className="mr-1" />
                {exporting ? "Exporting..." : "Download CSV"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

function SummaryCard({ label, amount, positive, net }: { label: string; amount: number; positive: boolean; net?: boolean }) {
  const color = net ? (positive ? "#166534" : "#991b1b") : positive ? "#166534" : "#374151";
  const bg = net ? (positive ? "#f0fdf4" : "#fef2f2") : positive ? "#f0fdf4" : "#f9fafb";
  return (
    <div style={{ background: bg, border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ background: positive ? "#dcfce7" : "#f3f4f6", borderRadius: 8, padding: 8 }}>
        {positive ? <TrendingUp size={18} color="#16a34a" /> : <TrendingDown size={18} color="#6b7280" />}
      </div>
      <div>
        <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: "1.25rem", fontWeight: 700, color }}>{amount >= 0 ? "" : "−"}£{(Math.abs(amount) / 100).toFixed(2)}</p>
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const isIncome = type === "income";
  return (
    <Badge style={{
      background: isIncome ? "#dcfce7" : "#fee2e2",
      color: isIncome ? "#166534" : "#991b1b",
      border: "none",
      textTransform: "capitalize",
      fontSize: "0.75rem",
    }}>
      {type}
    </Badge>
  );
}

function LinkedDeliveryBadge({ record }: { record: any }) {
  const [showDetail, setShowDetail] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setShowDetail(s => !s)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderRadius: 6,
          padding: "2px 8px",
          cursor: "pointer",
          fontSize: "0.75rem",
          color: "#1e40af",
          fontWeight: 500,
          whiteSpace: "nowrap",
        }}
      >
        <Link2 size={11} />
        {record.linkedDeliveryProductName || "Delivery"}
      </button>
      {showDetail && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 4px)",
          left: 0,
          zIndex: 50,
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: "0.75rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          minWidth: 240,
          fontSize: "0.8rem",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontWeight: 600, color: "#111827" }}>Linked Goods Received</span>
            <button onClick={() => setShowDetail(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>✕</button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {[
                ["Product", record.linkedDeliveryProductName],
                ["Date", record.linkedDeliveryDate ? new Date(record.linkedDeliveryDate).toLocaleDateString("en-GB") : null],
                ["Quantity", record.linkedDeliveryQuantity ? `${record.linkedDeliveryQuantity} ${record.linkedDeliveryProductUnit || ""}`.trim() : null],
                ["Batch No.", record.linkedDeliveryBatchNumber],
                ["Invoice Ref", record.linkedDeliveryInvoiceRef],
                ["Supplier", record.linkedDeliverySupplierName],
              ].map(([k, v]) => v ? (
                <tr key={k}>
                  <td style={{ color: "#6b7280", paddingRight: 8, paddingBottom: 2 }}>{k}</td>
                  <td style={{ color: "#111827", fontWeight: 500, paddingBottom: 2 }}>{v}</td>
                </tr>
              ) : null)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 1rem", textAlign: "center" }}>
      <div style={{ background: "#f3f4f6", borderRadius: "50%", padding: "1rem", marginBottom: "1rem" }}>
        <PoundSterling size={28} color="#9ca3af" />
      </div>
      <p style={{ fontWeight: 600, color: "#374151", marginBottom: 4 }}>No transactions recorded yet</p>
      <p style={{ fontSize: "0.875rem", color: "#9ca3af" }}>
        Add income and expenses here, or raise an invoice from a Goods Received record to link it automatically.
      </p>
    </div>
  );
}
