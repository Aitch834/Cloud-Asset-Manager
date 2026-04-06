import React, { useState } from "react";
import { Link } from "wouter";
import { useLookupStrings } from "@/hooks/use-lookup";
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
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Plus, Search, TrendingUp, TrendingDown, Trash2, PoundSterling, Package, Download, FileText, Wheat, Pencil, Eye, Zap, ExternalLink, CheckCircle2, AlertCircle, Clock, ShoppingBag, CalendarCheck, X } from "lucide-react";

type Tab = "transactions" | "crop-contracts" | "grants" | "livestock-purchases";

const CATEGORIES = [
  "Seeds & Seed Treatments",
  "Fertiliser",
  "Pesticides & Herbicides",
  "Fungicides",
  "Insecticides",
  "Veterinary & Medicine",
  "Feed & Forage",
  "Feed & Bedding",
  "Fuel & Energy",
  "Fuel",
  "Machinery & Equipment",
  "Labour",
  "Agri-Environment Scheme",
  "Grant / Subsidy",
  "Crop Sales",
  "Livestock Sales",
  "Milk Sales",
  "Haulage",
  "Other Income",
  "Other Expense",
];

const SOURCE_CONFIG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  grain_sale:            { label: "Grain Sales",        bg: "#fef9c3", color: "#854d0e", border: "#fde68a" },
  livestock_deadweight:  { label: "Deadweight Sale",    bg: "#fee2e2", color: "#991b1b", border: "#fecaca" },
  livestock_mart:        { label: "Mart Sale",          bg: "#fff7ed", color: "#9a3412", border: "#fed7aa" },
  milk_statement:        { label: "Milk Statement",     bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  feed_delivery:         { label: "Feed Delivery",      bg: "#f0fdf4", color: "#166534", border: "#bbf7d0" },
  fuel_delivery:         { label: "Fuel Delivery",      bg: "#f5f3ff", color: "#6d28d9", border: "#ddd6fe" },
};

const PAYMENT_METHODS = ["Bank Transfer", "Direct Debit", "Cheque", "Cash", "Card", "BACS", "Other"];

const SPECIES_LIST = ["Cattle", "Sheep", "Pigs", "Goats", "Horses", "Deer", "Poultry", "Other"];

const PURCHASE_STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  outstanding: { label: "Outstanding", bg: "#fef3c7", color: "#92400e" },
  overdue:     { label: "Overdue",     bg: "#fee2e2", color: "#991b1b" },
  paid:        { label: "Paid",        bg: "#dcfce7", color: "#166534" },
};

const CROP_CONTRACT_STATUSES = [
  { value: "pending", label: "Pending", bg: "#f3f4f6", color: "#374151" },
  { value: "active", label: "Active", bg: "#dcfce7", color: "#166534" },
  { value: "fulfilled", label: "Fulfilled", bg: "#eff6ff", color: "#1e40af" },
  { value: "cancelled", label: "Cancelled", bg: "#fee2e2", color: "#991b1b" },
  { value: "disputed", label: "Disputed", bg: "#fef3c7", color: "#92400e" },
];

const GRANT_SCHEMES = [
  "Sustainable Farming Incentive (SFI)",
  "Countryside Stewardship (CS)",
  "Basic Payment Scheme (BPS)",
  "Higher Tier Countryside Stewardship",
  "Farming in Protected Landscapes (FiPL)",
  "Environmental Land Management (ELM)",
  "Slurry Infrastructure Grant",
  "Farming Equipment & Technology Fund (FETF)",
  "Productivity & Slurry Grant",
  "Water Management Grant",
  "Livestock Health & Welfare Pathway",
  "Other Government Grant",
  "AHDB Levy",
  "Other",
];

const GRANT_STATUSES = [
  { value: "draft", label: "Draft", bg: "#f3f4f6", color: "#6b7280" },
  { value: "applied", label: "Applied", bg: "#eff6ff", color: "#1d4ed8" },
  { value: "approved", label: "Approved", bg: "#fef3c7", color: "#92400e" },
  { value: "purchased", label: "Purchased / Active", bg: "#dcfce7", color: "#166534" },
  { value: "claimed", label: "Payment Claimed", bg: "#e0f2fe", color: "#0369a1" },
  { value: "paid", label: "Payment Received", bg: "#d1fae5", color: "#065f46" },
  { value: "rejected", label: "Rejected", bg: "#fee2e2", color: "#991b1b" },
  { value: "withdrawn", label: "Withdrawn", bg: "#f3f4f6", color: "#6b7280" },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i);

const fmt = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const fmtAmt = (pence: number | null | undefined) => {
  if (pence == null) return "—";
  return `£${(pence / 100).toFixed(2)}`;
};

function TypeBadge({ type }: { type: string }) {
  if (type === "income") return <Badge style={{ background: "#dcfce7", color: "#166534", border: "none", fontSize: "0.72rem" }}><TrendingUp size={10} className="mr-1" />Income</Badge>;
  return <Badge style={{ background: "#fee2e2", color: "#991b1b", border: "none", fontSize: "0.72rem" }}><TrendingDown size={10} className="mr-1" />Expense</Badge>;
}

function SummaryCard({ label, amount, positive, net }: { label: string; amount: number; positive: boolean; net?: boolean }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${net && !positive ? "#fecaca" : net && positive ? "#bbf7d0" : "#e5e7eb"}`, borderRadius: 10, padding: "1rem 1.25rem" }}>
      <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>{label}</p>
      <p style={{ fontSize: "1.5rem", fontWeight: 700, color: positive ? "#166534" : net ? "#991b1b" : "#111827" }}>
        {fmtAmt(Math.abs(amount))}
      </p>
    </div>
  );
}

function TransactionsTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState(String(CURRENT_YEAR));
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");
  const [exporting, setExporting] = useState(false);
  const emptyForm = { transactionDate: "", transactionType: "expense", category: "", description: "", amountPence: "", vatAmountPence: "", vatRate: "", vendorCustomer: "", paymentMethod: "", reference: "", notes: "" };
  const [form, setForm] = useState<any>(emptyForm);

  const txQ = useQuery({
    queryKey: ["financial-transactions", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/financial-transactions`).then(r => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? [],
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["financial-transactions", farmId] });

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/financial-transactions`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, amountPence: body.amountPence ? Math.round(parseFloat(body.amountPence) * 100) : 0, vatAmountPence: body.vatAmountPence ? Math.round(parseFloat(body.vatAmountPence) * 100) : null }),
    }),
    onSuccess: () => { toast({ title: "Transaction saved" }); invalidate(); setAddOpen(false); setForm(emptyForm); },
    onError: () => toast({ title: "Failed to save transaction", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/financial-transactions/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Transaction deleted" }); invalidate(); setDeleteId(null); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({ format: "xero-csv" });
      if (exportStartDate) params.set("startDate", new Date(exportStartDate).toISOString());
      if (exportEndDate) params.set("endDate", new Date(exportEndDate).toISOString());
      const res = await fetch(`/api/farms/${farmId}/financial-transactions/export?${params.toString()}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `financial-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setExportOpen(false);
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const records: any[] = txQ.data ?? [];
  const autoCount = records.filter(r => r.isAutoGenerated).length;
  const manualCount = records.filter(r => !r.isAutoGenerated).length;

  const yearRecords = records.filter(r => {
    if (yearFilter === "all") return true;
    const y = r.transactionDate ? new Date(r.transactionDate).getFullYear() : null;
    return String(y) === yearFilter;
  });

  const filtered = yearRecords.filter((r) => {
    if (typeFilter !== "all" && r.transactionType !== typeFilter) return false;
    if (sourceFilter === "manual" && r.isAutoGenerated) return false;
    if (sourceFilter === "auto" && !r.isAutoGenerated) return false;
    if (search) {
      const s = search.toLowerCase();
      return r.description?.toLowerCase().includes(s) || r.vendorCustomer?.toLowerCase().includes(s) || r.reference?.toLowerCase().includes(s) || r.category?.toLowerCase().includes(s) || r.sourceLabel?.toLowerCase().includes(s);
    }
    return true;
  });

  const totalIncome = yearRecords.filter(r => r.transactionType === "income").reduce((s, r) => s + (r.amountPence ?? 0), 0);
  const totalExpense = yearRecords.filter(r => r.transactionType === "expense").reduce((s, r) => s + (r.amountPence ?? 0), 0);
  const net = totalIncome - totalExpense;
  const autoIncome = yearRecords.filter(r => r.isAutoGenerated && r.transactionType === "income").reduce((s, r) => s + (r.amountPence ?? 0), 0);
  const autoExpense = yearRecords.filter(r => r.isAutoGenerated && r.transactionType === "expense").reduce((s, r) => s + (r.amountPence ?? 0), 0);

  return (
    <div>
      {autoCount > 0 && (
        <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 8, padding: "8px 14px", marginBottom: 14, display: "flex", gap: 8, alignItems: "center", fontSize: "0.8125rem", color: "#0369a1" }}>
          <Zap size={14} style={{ flexShrink: 0, color: "#0284c7" }} />
          <span><strong>{autoCount} transactions</strong> are auto-imported from other modules ({manualCount} manual). Grain sales, livestock sales, feed deliveries and fuel deliveries are pulled in automatically.</span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: "1.25rem" }}>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem 1.25rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>Total Income</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#166534", marginBottom: 2 }}>£{(totalIncome / 100).toFixed(2)}</p>
          {autoIncome > 0 && <p style={{ fontSize: "0.7rem", color: "#16a34a" }}><Zap size={10} style={{ display: "inline", marginRight: 2 }} />£{(autoIncome / 100).toFixed(2)} auto-imported</p>}
        </div>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem 1.25rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>Total Expenses</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", marginBottom: 2 }}>£{(totalExpense / 100).toFixed(2)}</p>
          {autoExpense > 0 && <p style={{ fontSize: "0.7rem", color: "#6b7280" }}><Zap size={10} style={{ display: "inline", marginRight: 2 }} />£{(autoExpense / 100).toFixed(2)} auto-imported</p>}
        </div>
        <div style={{ background: "#fff", border: `1px solid ${net >= 0 ? "#bbf7d0" : "#fecaca"}`, borderRadius: 10, padding: "1rem 1.25rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>Net Balance</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 700, color: net >= 0 ? "#166534" : "#991b1b" }}>£{(Math.abs(net) / 100).toFixed(2)}{net < 0 ? " deficit" : ""}</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
          <Input placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
        </div>
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger style={{ width: 120 }}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger style={{ width: 150 }}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income only</SelectItem>
            <SelectItem value="expense">Expenses only</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger style={{ width: 170 }}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="manual">Manual only</SelectItem>
            <SelectItem value="auto">Auto-imported only</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" onClick={() => setExportOpen(true)}><Download size={14} className="mr-1" />Export to Xero</Button>
        <Button size="sm" onClick={() => { setForm(emptyForm); setAddOpen(true); }}><Plus size={14} className="mr-1" />Add Transaction</Button>
      </div>

      {txQ.isLoading ? <p className="text-sm text-gray-400 py-8 text-center">Loading...</p> : filtered.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 1rem", textAlign: "center" }}>
          <div style={{ background: "#f3f4f6", borderRadius: "50%", padding: "1rem", marginBottom: "1rem" }}><PoundSterling size={28} color="#9ca3af" /></div>
          <p style={{ fontWeight: 600, color: "#374151", marginBottom: 4 }}>{records.length === 0 ? "No transactions recorded" : "No transactions match your filters"}</p>
          <p style={{ fontSize: "0.875rem", color: "#9ca3af", maxWidth: 400 }}>Record income, expenses and purchases linked to deliveries and invoices.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Date", "Description", "Category", "Type", "Amount", "VAT", "Supplier / Customer", "Reference", ""].map(h => (
                  <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r: any, i: number) => {
                const srcCfg = r.isAutoGenerated ? SOURCE_CONFIG[r.source] : null;
                return (
                <tr key={r.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none", background: r.isAutoGenerated ? "#fafeff" : undefined }}>
                  <td style={{ padding: "0.625rem 0.875rem", whiteSpace: "nowrap", color: "#6b7280" }}>{fmt(r.transactionDate)}</td>
                  <td style={{ padding: "0.625rem 0.875rem", fontWeight: 500, maxWidth: 220 }}>
                    <div>{r.description || "—"}</div>
                    {srcCfg && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3, marginTop: 3, fontSize: "0.68rem", fontWeight: 600, background: srcCfg.bg, color: srcCfg.color, border: `1px solid ${srcCfg.border}`, borderRadius: 4, padding: "1px 6px" }}>
                        <Zap size={9} />
                        {srcCfg.label}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{r.category || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem" }}><TypeBadge type={r.transactionType} /></td>
                  <td style={{ padding: "0.625rem 0.875rem", fontWeight: 600, whiteSpace: "nowrap", color: r.transactionType === "income" ? "#166534" : "#111827" }}>{fmtAmt(r.amountPence)}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{r.vatAmountPence ? fmtAmt(r.vatAmountPence) : "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.vendorCustomer || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.reference || "—"}</td>
                  <td style={{ padding: "0.5rem", whiteSpace: "nowrap" }}>
                    {r.isAutoGenerated ? (
                      r.sourceModule ? (
                        <Link href={r.sourceModule}>
                          <button style={{ background: "none", border: "none", cursor: "pointer", color: "#6366f1", padding: 4, display: "flex", alignItems: "center", gap: 3, fontSize: "0.75rem" }} title={`View in ${r.sourceLabel}`}>
                            <ExternalLink size={12} />
                          </button>
                        </Link>
                      ) : null
                    ) : (
                      <button onClick={() => setDeleteId(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }} title="Delete"><Trash2 size={14} /></button>
                    )}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={o => { setAddOpen(o); if (!o) setForm(emptyForm); }}>
        <DialogContent style={{ maxWidth: 560 }}>
          <DialogHeader><DialogTitle>Add Financial Transaction</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date <span style={{ color: "#ef4444" }}>*</span></Label><Input type="date" value={form.transactionDate} onChange={e => setForm((f: any) => ({ ...f, transactionDate: e.target.value }))} /></div>
              <div><Label>Type <span style={{ color: "#ef4444" }}>*</span></Label>
                <Select value={form.transactionType} onValueChange={v => setForm((f: any) => ({ ...f, transactionType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="income">Income</SelectItem><SelectItem value="expense">Expense</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Description <span style={{ color: "#ef4444" }}>*</span></Label><Input placeholder="e.g. Fertiliser purchase — 20 bags NPK" value={form.description} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Category <span style={{ color: "#ef4444" }}>*</span></Label>
                <Select value={form.category} onValueChange={v => setForm((f: any) => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select category..." /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Payment Method</Label>
                <Select value={form.paymentMethod} onValueChange={v => setForm((f: any) => ({ ...f, paymentMethod: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{PAYMENT_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Amount (£) <span style={{ color: "#ef4444" }}>*</span></Label><Input type="number" step="0.01" min="0" placeholder="0.00" value={form.amountPence} onChange={e => setForm((f: any) => ({ ...f, amountPence: e.target.value }))} /></div>
              <div><Label>VAT Amount (£)</Label><Input type="number" step="0.01" min="0" placeholder="0.00" value={form.vatAmountPence} onChange={e => setForm((f: any) => ({ ...f, vatAmountPence: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Supplier / Customer</Label><Input placeholder="Company or person name" value={form.vendorCustomer} onChange={e => setForm((f: any) => ({ ...f, vendorCustomer: e.target.value }))} /></div>
              <div><Label>Reference / Invoice No.</Label><Input placeholder="e.g. INV-2025-001" value={form.reference} onChange={e => setForm((f: any) => ({ ...f, reference: e.target.value }))} /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => createMut.mutate(form)} disabled={!form.transactionDate || !form.description || !form.category || !form.amountPence || createMut.isPending}>Save Transaction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete Transaction</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Are you sure you want to delete this transaction?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent style={{ maxWidth: 440 }}>
          <DialogHeader><DialogTitle>Export to Xero CSV</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-gray-600">Filter by date range or leave blank to export all transactions.</p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>From Date</Label><Input type="date" value={exportStartDate} onChange={e => setExportStartDate(e.target.value)} /></div>
              <div><Label>To Date</Label><Input type="date" value={exportEndDate} onChange={e => setExportEndDate(e.target.value)} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportOpen(false)}>Cancel</Button>
            <Button onClick={handleExport} disabled={exporting}><Download size={14} className="mr-1" />{exporting ? "Exporting…" : "Download CSV"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CropContractsTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const commodityTypes = useLookupStrings("commodity_types", ["Winter Wheat", "Spring Wheat", "Winter Barley", "Spring Barley", "Malting Barley", "Oilseed Rape", "Winter Oats", "Spring Oats", "Winter Beans", "Spring Beans", "Peas", "Maize", "Sugar Beet", "Potatoes", "Other"]);
  const [addOpen, setAddOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<any | null>(null);
  const [editRecord, setEditRecord] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const emptyForm = { commodity: "", variety: "", buyer: "", contractDate: "", deliveryWindowStart: "", deliveryWindowEnd: "", quantityTonnes: "", contractedPricePence: "", totalValuePence: "", qualitySpec: "", deliveryLocation: "", status: "pending", notes: "" };
  const [form, setForm] = useState<any>(emptyForm);

  const q = useQuery({
    queryKey: ["crop-contracts", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/crop-contracts`).then(r => r.json()),
    enabled: !!farmId,
    select: d => d.records ?? [],
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["crop-contracts", farmId] });

  const saveMut = useMutation({
    mutationFn: (body: any) => {
      const priceGbp = body.contractedPricePence ? parseFloat(body.contractedPricePence) : null;
      const qty = body.quantityTonnes ? parseFloat(body.quantityTonnes) : null;
      const payload = {
        ...body,
        contractDate: body.contractDate ? new Date(body.contractDate).toISOString() : null,
        deliveryWindowStart: body.deliveryWindowStart ? new Date(body.deliveryWindowStart).toISOString() : null,
        deliveryWindowEnd: body.deliveryWindowEnd ? new Date(body.deliveryWindowEnd).toISOString() : null,
        contractedPricePence: priceGbp ? Math.round(priceGbp * 100) : null,
        totalValuePence: priceGbp && qty ? Math.round(priceGbp * qty * 100) : null,
      };
      if (editRecord) return fetch(`/api/farms/${farmId}/crop-contracts/${editRecord.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      return fetch(`/api/farms/${farmId}/crop-contracts`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    },
    onSuccess: () => { toast({ title: editRecord ? "Contract updated" : "Contract saved" }); invalidate(); setAddOpen(false); setEditRecord(null); setForm(emptyForm); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/crop-contracts/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Deleted" }); invalidate(); setDeleteId(null); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const records: any[] = q.data ?? [];
  const activeContracts = records.filter(r => r.status === "active").length;
  const totalContractValue = records.filter(r => r.status !== "cancelled").reduce((s, r) => s + (r.totalValuePence ?? 0), 0);

  const openAdd = () => { setEditRecord(null); setForm(emptyForm); setAddOpen(true); };
  const openEdit = (r: any) => {
    setEditRecord(r);
    setForm({
      ...r,
      contractDate: r.contractDate?.slice(0, 10) ?? "",
      deliveryWindowStart: r.deliveryWindowStart?.slice(0, 10) ?? "",
      deliveryWindowEnd: r.deliveryWindowEnd?.slice(0, 10) ?? "",
      contractedPricePence: r.contractedPricePence ? (r.contractedPricePence / 100).toFixed(2) : "",
      quantityTonnes: r.quantityTonnes ?? "",
    });
    setAddOpen(true);
  };

  const getStatus = (val: string) => CROP_CONTRACT_STATUSES.find(s => s.value === val) ?? { label: val, bg: "#f3f4f6", color: "#374151" };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: "1.25rem" }}>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem 1.25rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 4, textTransform: "uppercase", fontWeight: 500 }}>Total Contracts</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827" }}>{records.length}</p>
        </div>
        <div style={{ background: "#fff", border: "1px solid #bbf7d0", borderRadius: 10, padding: "1rem 1.25rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 4, textTransform: "uppercase", fontWeight: 500 }}>Active Contracts</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#166534" }}>{activeContracts}</p>
        </div>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem 1.25rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 4, textTransform: "uppercase", fontWeight: 500 }}>Total Contract Value</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827" }}>{fmtAmt(totalContractValue)}</p>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <Button size="sm" onClick={openAdd}><Plus size={14} className="mr-1" />Add Crop Contract</Button>
      </div>

      {q.isLoading ? <p className="text-sm text-gray-400 py-8 text-center">Loading...</p> : records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <Wheat size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No crop contracts recorded</p>
          <p style={{ fontSize: "0.875rem" }}>Record grain, pulse and oilseed marketing contracts, pricing, tonnage commitments and delivery windows here.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Crop / Variety", "Contractor", "Contract Date", "Tonnage", "Price / t", "Total Value", "Delivery Window", "Location", "Status", ""].map(h => (
                  <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r: any, i: number) => {
                const s = getStatus(r.status);
                return (
                  <tr key={r.id} style={{ borderBottom: i < records.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                    <td style={{ padding: "0.625rem 0.875rem" }}>
                      <p style={{ fontWeight: 600 }}>{r.commodity || "—"}</p>
                      {r.variety && <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>{r.variety}</p>}
                    </td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.buyer || "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{fmt(r.contractDate)}</td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.quantityTonnes ? `${r.quantityTonnes}t` : "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.contractedPricePence ? `£${(r.contractedPricePence / 100).toFixed(2)}` : "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem", fontWeight: 600, color: "#166534" }}>{r.totalValuePence ? fmtAmt(r.totalValuePence) : "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", fontSize: "0.8rem" }}>
                      {r.deliveryWindowStart || r.deliveryWindowEnd ? `${fmt(r.deliveryWindowStart)} – ${fmt(r.deliveryWindowEnd)}` : "—"}
                    </td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.deliveryLocation || "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem" }}>
                      <Badge style={{ background: s.bg, color: s.color, border: "none", fontSize: "0.72rem" }}>{s.label}</Badge>
                    </td>
                    <td style={{ padding: "0.5rem" }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => setViewRecord(r)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }} title="View"><Eye size={13} /></button>
                        <button onClick={() => setDeleteId(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }} title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: 560 }}>
            <DialogHeader><DialogTitle>Crop Contract</DialogTitle></DialogHeader>
            {(() => {
              const r = viewRecord;
              const fmt = (d: string | null | undefined) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
              const fmtAmt = (p: number | null) => p != null ? `£${(p / 100).toFixed(2)}` : null;
              const F = ({ label, value }: { label: string; value?: string | null }) => (
                <div><div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: "0.875rem", color: value ? "#111827" : "#d1d5db" }}>{value || "—"}</div></div>
              );
              return (
                <div style={{ display: "grid", gap: 14 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                    <F label="Commodity" value={r.commodity} />
                    <F label="Variety" value={r.variety} />
                    <F label="Buyer" value={r.buyer} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <F label="Contract Date" value={fmt(r.contractDate)} />
                    <F label="Status" value={r.status} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <F label="Delivery Window Start" value={fmt(r.deliveryWindowStart)} />
                    <F label="Delivery Window End" value={fmt(r.deliveryWindowEnd)} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                    <F label="Quantity (t)" value={r.quantityTonnes != null ? `${r.quantityTonnes}t` : null} />
                    <F label="Price (£/t)" value={r.contractedPricePence != null ? `£${(r.contractedPricePence / 100).toFixed(2)}` : null} />
                    <F label="Total Value" value={fmtAmt(r.totalValuePence)} />
                  </div>
                  {r.qualitySpec && <F label="Quality Spec" value={r.qualitySpec} />}
                  {r.deliveryLocation && <F label="Delivery Location" value={r.deliveryLocation} />}
                  {r.notes && <F label="Notes" value={r.notes} />}
                </div>
              );
            })()}
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setViewRecord(null)}>Close</Button>
              <Button onClick={() => { const r = viewRecord; setViewRecord(null); openEdit(r); }}>Edit Contract</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={addOpen} onOpenChange={o => { if (!o) { setAddOpen(false); setEditRecord(null); setForm(emptyForm); } }}>
        <DialogContent style={{ maxWidth: 560 }}>
          <DialogHeader><DialogTitle>{editRecord ? "Edit Crop Contract" : "Add Crop Contract"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Commodity <span style={{ color: "#ef4444" }}>*</span></Label>
                <Select value={form.commodity} onValueChange={v => setForm((f: any) => ({ ...f, commodity: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select crop…" /></SelectTrigger>
                  <SelectContent>
                    {commodityTypes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Variety</Label><Input placeholder="e.g. KWS Zyatt, Skyfall" value={form.variety} onChange={e => setForm((f: any) => ({ ...f, variety: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Buyer / Merchant <span style={{ color: "#ef4444" }}>*</span></Label><Input placeholder="e.g. Openfield, ADM, Saxon" value={form.buyer} onChange={e => setForm((f: any) => ({ ...f, buyer: e.target.value }))} /></div>
              <div><Label>Contract Date</Label><Input type="date" value={form.contractDate} onChange={e => setForm((f: any) => ({ ...f, contractDate: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Quantity (t)</Label><Input type="number" step="0.1" min="0" placeholder="t" value={form.quantityTonnes} onChange={e => setForm((f: any) => ({ ...f, quantityTonnes: e.target.value }))} /></div>
              <div><Label>Price / tonne (£)</Label><Input type="number" step="0.01" min="0" placeholder="£/t" value={form.contractedPricePence} onChange={e => setForm((f: any) => ({ ...f, contractedPricePence: e.target.value }))} /></div>
              <div><Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm((f: any) => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CROP_CONTRACT_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Delivery Window Start</Label><Input type="date" value={form.deliveryWindowStart} onChange={e => setForm((f: any) => ({ ...f, deliveryWindowStart: e.target.value }))} /></div>
              <div><Label>Delivery Window End</Label><Input type="date" value={form.deliveryWindowEnd} onChange={e => setForm((f: any) => ({ ...f, deliveryWindowEnd: e.target.value }))} /></div>
            </div>
            <div><Label>Delivery Location / Store</Label><Input placeholder="e.g. Saxham Silos, Bury St Edmunds" value={form.deliveryLocation} onChange={e => setForm((f: any) => ({ ...f, deliveryLocation: e.target.value }))} /></div>
            <div><Label>Quality Specification</Label><Textarea placeholder="Moisture, protein, specific weight, admixture tolerances…" value={form.qualitySpec} onChange={e => setForm((f: any) => ({ ...f, qualitySpec: e.target.value }))} rows={2} /></div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); setEditRecord(null); setForm(emptyForm); }}>Cancel</Button>
            <Button onClick={() => saveMut.mutate(form)} disabled={!form.commodity || !form.buyer || saveMut.isPending}>
              {saveMut.isPending ? "Saving…" : editRecord ? "Save Changes" : "Add Contract"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete Crop Contract</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Are you sure you want to delete this contract record?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GrantsTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const emptyForm = { schemeName: "", reference: "", contractStartDate: "", contractEndDate: "", annualValuePence: "", totalValuePence: "", status: "applied", nextClaimDate: "", notes: "" };
  const [form, setForm] = useState<any>(emptyForm);

  const q = useQuery({
    queryKey: ["financial-transactions", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/financial-transactions`).then(r => r.json()),
    enabled: !!farmId,
    select: d => (d.records ?? []).filter((r: any) => r.category === "Agri-Environment Scheme" || r.category === "Grant / Subsidy"),
  });

  const records: any[] = q.data ?? [];
  const totalReceived = records.filter(r => r.transactionType === "income").reduce((s, r) => s + (r.amountPence ?? 0), 0);

  const getStatus = (val: string) => GRANT_STATUSES.find(s => s.value === val) ?? { label: val, bg: "#f3f4f6", color: "#374151" };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: "1.25rem" }}>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem 1.25rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 4, textTransform: "uppercase", fontWeight: 500 }}>Agri-Environment Transactions</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827" }}>{records.length}</p>
        </div>
        <div style={{ background: "#fff", border: "1px solid #bbf7d0", borderRadius: 10, padding: "1rem 1.25rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 4, textTransform: "uppercase", fontWeight: 500 }}>Total Received</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#166534" }}>{fmtAmt(totalReceived)}</p>
        </div>
      </div>

      <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.8rem", color: "#1e40af" }}>
        <strong>Tip:</strong> Subsidy and grant payments appear here when they are logged in the Transactions tab with the category "Agri-Environment Scheme" or "Grant / Subsidy". Record SFI, Countryside Stewardship, and BPS payments there to track scheme income.
      </div>

      {q.isLoading ? <p className="text-sm text-gray-400 py-8 text-center">Loading...</p> : records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <FileText size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No subsidy or grant payments recorded</p>
          <p style={{ fontSize: "0.875rem" }}>Log SFI, Countryside Stewardship, and BPS payments in the Transactions tab using the categories above.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Date", "Description", "Category", "Amount", "Reference", "Notes"].map(h => (
                  <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r: any, i: number) => (
                <tr key={r.id} style={{ borderBottom: i < records.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{fmt(r.transactionDate)}</td>
                  <td style={{ padding: "0.625rem 0.875rem", fontWeight: 500 }}>{r.description || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.category || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", fontWeight: 600, color: "#166534" }}>{fmtAmt(r.amountPence)}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.reference || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", fontSize: "0.8rem" }}>{r.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function LivestockPurchasesTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [markPaidId, setMarkPaidId] = useState<number | null>(null);
  const [paidDate, setPaidDate] = useState(new Date().toISOString().slice(0, 10));
  const [paidRef, setPaidRef] = useState("");
  const [paidMethod, setPaidMethod] = useState("Bank Transfer");

  const EMPTY: any = { invoiceDate: "", arrivalDate: "", supplierName: "", supplierCph: "", marketName: "", invoiceRef: "", species: "Cattle", numberOfHead: "", pricePerHeadPence: "", totalAmountPence: "", vatAmountPence: "", paymentTermsDays: "30", herdId: "", notes: "", paymentMethod: "Bank Transfer" };
  const [form, setForm] = useState<any>(EMPTY);

  const herdsQ = useQuery({ queryKey: ["herds", farmId], queryFn: () => fetch(`/api/farms/${farmId}/herds`).then(r => r.json()), enabled: !!farmId, select: (d: any) => d.records ?? [] });
  const herds: any[] = herdsQ.data ?? [];

  const q = useQuery({ queryKey: ["livestock-purchases", farmId], queryFn: () => fetch(`/api/farms/${farmId}/livestock-purchases`).then(r => r.json()), enabled: !!farmId, select: (d: any) => d.records ?? [] });
  const records: any[] = q.data ?? [];
  const filtered = statusFilter === "all" ? records : records.filter(r => r.paymentStatus === statusFilter);

  const outstanding = records.filter(r => r.paymentStatus === "outstanding").reduce((s, r) => s + (Number(r.totalAmountPence) || 0), 0);
  const overdue = records.filter(r => r.paymentStatus === "overdue").reduce((s, r) => s + (Number(r.totalAmountPence) || 0), 0);
  const paidYtd = records.filter(r => r.paymentStatus === "paid" && r.paidDate && new Date(r.paidDate).getFullYear() === new Date().getFullYear()).reduce((s, r) => s + (Number(r.totalAmountPence) || 0), 0);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["livestock-purchases", farmId] });

  const createMut = useMutation({ mutationFn: (b: any) => fetch(`/api/farms/${farmId}/livestock-purchases`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(r => r.json()), onSuccess: () => { toast({ title: "Invoice added" }); invalidate(); setAddOpen(false); setForm(EMPTY); }, onError: () => toast({ title: "Failed to save", variant: "destructive" }) });
  const updateMut = useMutation({ mutationFn: (b: any) => fetch(`/api/farms/${farmId}/livestock-purchases/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(r => r.json()), onSuccess: () => { toast({ title: "Invoice updated" }); invalidate(); setAddOpen(false); setEditRecord(null); setForm(EMPTY); }, onError: () => toast({ title: "Failed to update", variant: "destructive" }) });
  const deleteMut = useMutation({ mutationFn: (id: number) => fetch(`/api/farms/${farmId}/livestock-purchases/${id}`, { method: "DELETE" }).then(r => r.json()), onSuccess: () => { toast({ title: "Deleted" }); invalidate(); setDeleteId(null); } });
  const markPaidMut = useMutation({
    mutationFn: (b: { id: number; paidDate: string; paymentMethod: string; paymentReference: string }) => fetch(`/api/farms/${farmId}/livestock-purchases/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentStatus: "paid", paidDate: b.paidDate, paymentMethod: b.paymentMethod, paymentReference: b.paymentReference }) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Marked as paid" }); invalidate(); setMarkPaidId(null); },
  });

  const sCfg = (s: string) => PURCHASE_STATUS_CONFIG[s] ?? { label: s, bg: "#f3f4f6", color: "#374151" };

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: "1.25rem" }}>
        <div style={{ background: "#fff", border: "1px solid #fde68a", borderRadius: 10, padding: "1rem 1.25rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 4, textTransform: "uppercase", fontWeight: 500 }}>Outstanding</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#92400e" }}>{fmtAmt(outstanding)}</p>
          <p style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{records.filter(r => r.paymentStatus === "outstanding").length} invoice{records.filter(r => r.paymentStatus === "outstanding").length !== 1 ? "s" : ""}</p>
        </div>
        <div style={{ background: "#fff", border: "1px solid #fecaca", borderRadius: 10, padding: "1rem 1.25rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 4, textTransform: "uppercase", fontWeight: 500 }}>Overdue</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#991b1b" }}>{fmtAmt(overdue)}</p>
          <p style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{records.filter(r => r.paymentStatus === "overdue").length} overdue</p>
        </div>
        <div style={{ background: "#fff", border: "1px solid #bbf7d0", borderRadius: 10, padding: "1rem 1.25rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 4, textTransform: "uppercase", fontWeight: 500 }}>Paid — YTD {new Date().getFullYear()}</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#166534" }}>{fmtAmt(paidYtd)}</p>
          <p style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{records.filter(r => r.paymentStatus === "paid" && r.paidDate && new Date(r.paidDate).getFullYear() === new Date().getFullYear()).length} paid</p>
        </div>
      </div>

      {/* Filter + Add button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {(["all", "outstanding", "overdue", "paid"] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: "5px 12px", borderRadius: 8, fontSize: "0.78rem", fontWeight: 500, border: `1px solid ${statusFilter === s ? "#166534" : "#e5e7eb"}`, background: statusFilter === s ? "#166534" : "#fff", color: statusFilter === s ? "#fff" : "#374151", cursor: "pointer", transition: "all 0.15s" }}>
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}{s !== "all" ? ` (${records.filter(r => r.paymentStatus === s).length})` : ""}
            </button>
          ))}
        </div>
        <Button onClick={() => { setEditRecord(null); setForm(EMPTY); setAddOpen(true); }} className="bg-green-800 hover:bg-green-900 text-white">
          <Plus className="w-4 h-4 mr-1" />Add Invoice
        </Button>
      </div>

      {/* Table */}
      {q.isLoading ? <p className="text-sm text-gray-400 text-center py-10">Loading…</p> : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <ShoppingBag size={32} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>{statusFilter === "all" ? "No livestock purchase invoices recorded" : `No ${statusFilter} invoices`}</p>
          <p style={{ fontSize: "0.875rem" }}>{statusFilter === "all" ? "Record purchases from markets, dealers and direct farm-to-farm sales here" : "Try changing the status filter"}</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Invoice Date", "Supplier / Market", "Species", "Head", "Total ex-VAT", "VAT", "Status", "Due / Paid", "Actions"].map(h => (
                  <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r: any, i: number) => {
                const cfg = sCfg(r.paymentStatus);
                const herd = herds.find((h: any) => Number(h.id) === Number(r.herdId));
                return (
                  <tr key={r.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>
                      <div>{fmt(r.invoiceDate)}</div>
                      {r.invoiceRef && <div style={{ fontSize: "0.7rem", color: "#9ca3af" }}>{r.invoiceRef}</div>}
                    </td>
                    <td style={{ padding: "0.625rem 0.875rem" }}>
                      <div style={{ fontWeight: 500 }}>{r.supplierName || "—"}</div>
                      {r.marketName && <div style={{ fontSize: "0.7rem", color: "#9ca3af" }}>{r.marketName}</div>}
                      {r.supplierCph && <div style={{ fontSize: "0.7rem", color: "#9ca3af" }}>CPH: {r.supplierCph}</div>}
                    </td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#374151" }}>
                      {r.species || "—"}
                      {herd && <div style={{ fontSize: "0.7rem", color: "#9ca3af" }}>{herd.herdName || herd.name}</div>}
                    </td>
                    <td style={{ padding: "0.625rem 0.875rem", textAlign: "center", fontWeight: 600 }}>{r.numberOfHead ?? "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem", fontWeight: 600 }}>{fmtAmt(r.totalAmountPence)}</td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.vatAmountPence ? fmtAmt(r.vatAmountPence) : "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem" }}>
                      <span style={{ background: cfg.bg, color: cfg.color, borderRadius: 6, padding: "2px 8px", fontSize: "0.72rem", fontWeight: 600 }}>{cfg.label}</span>
                    </td>
                    <td style={{ padding: "0.625rem 0.875rem", whiteSpace: "nowrap" }}>
                      {r.paymentStatus === "paid" ? (
                        <div style={{ fontSize: "0.8rem", color: "#166534" }}>Paid {fmt(r.paidDate)}</div>
                      ) : (
                        <div style={{ fontSize: "0.8rem", color: r.paymentStatus === "overdue" ? "#dc2626" : "#6b7280" }}>{r.paymentDueDate ? fmt(r.paymentDueDate) : "—"}</div>
                      )}
                    </td>
                    <td style={{ padding: "0.625rem 0.875rem" }}>
                      <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "nowrap" }}>
                        {(r.paymentStatus === "outstanding" || r.paymentStatus === "overdue") && (
                          <Button size="sm" variant="outline" style={{ fontSize: "0.7rem", padding: "2px 8px", height: "auto", color: "#166534", borderColor: "#bbf7d0" }} onClick={() => { setMarkPaidId(Number(r.id)); setPaidDate(new Date().toISOString().slice(0, 10)); setPaidRef(r.invoiceRef ?? ""); setPaidMethod("Bank Transfer"); }}>
                            <CheckCircle2 size={11} className="mr-1" />Mark Paid
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => { setEditRecord(r); setForm({ ...r, invoiceDate: r.invoiceDate ?? "", arrivalDate: r.arrivalDate ?? "", numberOfHead: r.numberOfHead ?? "", pricePerHeadPence: r.pricePerHeadPence ? (Number(r.pricePerHeadPence) / 100).toFixed(2) : "", totalAmountPence: r.totalAmountPence ? (Number(r.totalAmountPence) / 100).toFixed(2) : "", vatAmountPence: r.vatAmountPence ? (Number(r.vatAmountPence) / 100).toFixed(2) : "", paymentTermsDays: r.paymentTermsDays ?? "30", herdId: r.herdId ? String(r.herdId) : "" }); setAddOpen(true); }}>
                          <Pencil size={13} />
                        </Button>
                        <Button size="sm" variant="ghost" style={{ color: "#ef4444" }} onClick={() => setDeleteId(Number(r.id))}>
                          <Trash2 size={13} />
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

      {/* ─── MARK AS PAID DIALOG ─── */}
      <Dialog open={markPaidId !== null} onOpenChange={o => { if (!o) setMarkPaidId(null); }}>
        <DialogContent style={{ maxWidth: 420 }}>
          <DialogHeader><DialogTitle>Mark Invoice as Paid</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div><Label>Payment date *</Label><Input type="date" value={paidDate} onChange={e => setPaidDate(e.target.value)} /></div>
            <div><Label>Payment method</Label>
              <Select value={paidMethod} onValueChange={setPaidMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PAYMENT_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Payment reference</Label><Input value={paidRef} onChange={e => setPaidRef(e.target.value)} placeholder="BACS ref, cheque number…" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMarkPaidId(null)}>Cancel</Button>
            <Button className="bg-green-800 hover:bg-green-900 text-white" disabled={markPaidMut.isPending} onClick={() => {
              if (!paidDate) { toast({ title: "Payment date is required", variant: "destructive" }); return; }
              markPaidMut.mutate({ id: markPaidId!, paidDate, paymentMethod: paidMethod, paymentReference: paidRef });
            }}>Confirm Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── ADD / EDIT DIALOG ─── */}
      <Dialog open={addOpen} onOpenChange={o => { if (!o) { setAddOpen(false); setEditRecord(null); setForm(EMPTY); } }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editRecord ? "Edit Livestock Purchase Invoice" : "Add Livestock Purchase Invoice"}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2 max-h-[65vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Invoice date *</Label><Input type="date" value={form.invoiceDate ?? ""} onChange={e => setForm((f: any) => ({ ...f, invoiceDate: e.target.value }))} /></div>
              <div><Label>Arrival date</Label><Input type="date" value={form.arrivalDate ?? ""} onChange={e => setForm((f: any) => ({ ...f, arrivalDate: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Supplier name *</Label><Input value={form.supplierName ?? ""} onChange={e => setForm((f: any) => ({ ...f, supplierName: e.target.value }))} placeholder="Seller name or auction mart" /></div>
              <div><Label>Supplier CPH no.</Label><Input value={form.supplierCph ?? ""} onChange={e => setForm((f: any) => ({ ...f, supplierCph: e.target.value }))} placeholder="XX/XXX/XXXX" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Market / auction</Label><Input value={form.marketName ?? ""} onChange={e => setForm((f: any) => ({ ...f, marketName: e.target.value }))} placeholder="e.g. Newark Livestock Market" /></div>
              <div><Label>Invoice / lot ref</Label><Input value={form.invoiceRef ?? ""} onChange={e => setForm((f: any) => ({ ...f, invoiceRef: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Species *</Label>
                <Select value={form.species ?? "Cattle"} onValueChange={v => setForm((f: any) => ({ ...f, species: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SPECIES_LIST.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>No. of head *</Label><Input type="number" min="1" value={form.numberOfHead ?? ""} onChange={e => setForm((f: any) => ({ ...f, numberOfHead: e.target.value }))} /></div>
              <div><Label>Herd / flock</Label>
                <Select value={form.herdId || "__none__"} onValueChange={v => setForm((f: any) => ({ ...f, herdId: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="— None —" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— None —</SelectItem>
                    {herds.map((h: any) => <SelectItem key={String(h.id)} value={String(h.id)}>{String(h.herdName || h.name)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Price / head (£)</Label><Input type="number" step="0.01" value={form.pricePerHeadPence ?? ""} onChange={e => setForm((f: any) => ({ ...f, pricePerHeadPence: e.target.value }))} placeholder="0.00" /></div>
              <div><Label>Total ex-VAT (£) *</Label><Input type="number" step="0.01" value={form.totalAmountPence ?? ""} onChange={e => setForm((f: any) => ({ ...f, totalAmountPence: e.target.value }))} placeholder="0.00" /></div>
              <div><Label>VAT amount (£)</Label><Input type="number" step="0.01" value={form.vatAmountPence ?? ""} onChange={e => setForm((f: any) => ({ ...f, vatAmountPence: e.target.value }))} placeholder="0.00" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Payment terms (days)</Label><Input type="number" value={form.paymentTermsDays ?? "30"} onChange={e => setForm((f: any) => ({ ...f, paymentTermsDays: e.target.value }))} /></div>
              <div><Label>Payment method</Label>
                <Select value={form.paymentMethod || "Bank Transfer"} onValueChange={v => setForm((f: any) => ({ ...f, paymentMethod: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PAYMENT_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); setEditRecord(null); setForm(EMPTY); }}>Cancel</Button>
            <Button className="bg-green-800 hover:bg-green-900 text-white" disabled={createMut.isPending || updateMut.isPending} onClick={() => {
              if (!form.invoiceDate || !form.supplierName || !form.numberOfHead || !form.totalAmountPence) { toast({ title: "Invoice date, supplier, head count and total are required", variant: "destructive" }); return; }
              const body = { ...form, numberOfHead: parseInt(String(form.numberOfHead)), pricePerHeadPence: form.pricePerHeadPence ? Math.round(parseFloat(form.pricePerHeadPence) * 100) : null, totalAmountPence: Math.round(parseFloat(form.totalAmountPence) * 100), vatAmountPence: form.vatAmountPence ? Math.round(parseFloat(form.vatAmountPence) * 100) : null, paymentTermsDays: form.paymentTermsDays ? parseInt(String(form.paymentTermsDays)) : 30, herdId: form.herdId && form.herdId !== "__none__" ? parseInt(String(form.herdId)) : null };
              if (editRecord) updateMut.mutate({ ...body, id: editRecord.id });
              else createMut.mutate(body);
            }}>{editRecord ? "Save Changes" : "Add Invoice"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── DELETE DIALOG ─── */}
      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete Invoice</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Permanently delete this livestock purchase invoice?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" disabled={deleteMut.isPending} onClick={() => deleteId !== null && deleteMut.mutate(deleteId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function FinancialPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<Tab>("transactions");

  return (
    <AppLayout title="Financial Records">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <p className="text-sm text-gray-500 mb-4">
          Income, expenses, crop contracts and government scheme payments for this farm.
        </p>
        <TabBar className="mb-6">
          <TabButton active={tab === "transactions"} onClick={() => setTab("transactions")}>Transactions</TabButton>
          <TabButton active={tab === "crop-contracts"} onClick={() => setTab("crop-contracts")}>Crop Contracts</TabButton>
          <TabButton active={tab === "grants"} onClick={() => setTab("grants")}>Subsidies &amp; Grants</TabButton>
          <TabButton active={tab === "livestock-purchases"} onClick={() => setTab("livestock-purchases")}>
            <span className="flex items-center gap-1"><ShoppingBag className="w-3.5 h-3.5" />Livestock Purchases</span>
          </TabButton>
        </TabBar>
        {farmId && tab === "transactions" && <TransactionsTab farmId={farmId} />}
        {farmId && tab === "crop-contracts" && <CropContractsTab farmId={farmId} />}
        {farmId && tab === "grants" && <GrantsTab farmId={farmId} />}
        {farmId && tab === "livestock-purchases" && <LivestockPurchasesTab farmId={farmId} />}
      </div>
    </AppLayout>
  );
}
