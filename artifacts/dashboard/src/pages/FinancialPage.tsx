import React, { useState } from "react";
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
import { Plus, Search, TrendingUp, TrendingDown, Trash2, PoundSterling, Package, Download, FileText, Wheat, Pencil, Eye } from "lucide-react";

type Tab = "transactions" | "crop-contracts" | "grants";

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
  const yearRecords = records.filter(r => {
    if (yearFilter === "all") return true;
    const y = r.transactionDate ? new Date(r.transactionDate).getFullYear() : null;
    return String(y) === yearFilter;
  });

  const filtered = yearRecords.filter((r) => {
    if (typeFilter !== "all" && r.transactionType !== typeFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return r.description?.toLowerCase().includes(s) || r.vendorCustomer?.toLowerCase().includes(s) || r.reference?.toLowerCase().includes(s) || r.category?.toLowerCase().includes(s);
    }
    return true;
  });

  const totalIncome = yearRecords.filter(r => r.transactionType === "income").reduce((s, r) => s + (r.amountPence ?? 0), 0);
  const totalExpense = yearRecords.filter(r => r.transactionType === "expense").reduce((s, r) => s + (r.amountPence ?? 0), 0);
  const net = totalIncome - totalExpense;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: "1.25rem" }}>
        <SummaryCard label="Total Income" amount={totalIncome} positive />
        <SummaryCard label="Total Expenses" amount={totalExpense} positive={false} />
        <SummaryCard label="Net Balance" amount={net} positive={net >= 0} net />
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
              {filtered.map((r: any, i: number) => (
                <tr key={r.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <td style={{ padding: "0.625rem 0.875rem", whiteSpace: "nowrap", color: "#6b7280" }}>{fmt(r.transactionDate)}</td>
                  <td style={{ padding: "0.625rem 0.875rem", fontWeight: 500, maxWidth: 200 }}>{r.description || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{r.category || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem" }}><TypeBadge type={r.transactionType} /></td>
                  <td style={{ padding: "0.625rem 0.875rem", fontWeight: 600, whiteSpace: "nowrap", color: r.transactionType === "income" ? "#166534" : "#111827" }}>{fmtAmt(r.amountPence)}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{r.vatAmountPence ? fmtAmt(r.vatAmountPence) : "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.vendorCustomer || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.reference || "—"}</td>
                  <td style={{ padding: "0.5rem" }}>
                    <button onClick={() => setDeleteId(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }} title="Delete"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
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
        </TabBar>
        {farmId && tab === "transactions" && <TransactionsTab farmId={farmId} />}
        {farmId && tab === "crop-contracts" && <CropContractsTab farmId={farmId} />}
        {farmId && tab === "grants" && <GrantsTab farmId={farmId} />}
      </div>
    </AppLayout>
  );
}
