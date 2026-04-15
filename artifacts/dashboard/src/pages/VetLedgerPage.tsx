import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Stethoscope, Plus, Edit2, Trash2, Eye, Receipt,
  CheckCircle2, Clock, AlertCircle, X, ExternalLink,
  ChevronRight, Package,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

// ── Constants ─────────────────────────────────────────────────────────────────

const LINE_TYPES = [
  { value: "call_out", label: "Call-out fee" },
  { value: "consultation", label: "Consultation / Exam" },
  { value: "medicine", label: "Medicine / Vaccination" },
  { value: "lab_test", label: "Lab test / Sample analysis" },
  { value: "scanning", label: "Scanning / Pregnancy testing" },
  { value: "tb_testing", label: "TB Testing" },
  { value: "procedure", label: "Minor procedure / Castration / Disbudding" },
  { value: "other", label: "Other" },
];

const MEDICINE_UNITS = ["ml", "g", "kg", "tablets", "doses", "tubes", "sachets", "other"];

// ── Module-level helper components (React Fast Refresh safe) ──────────────────

function PaymentBadge({ status }: { status: string }) {
  if (status === "paid") return <Badge className="text-xs" style={{ background: "#dcfce7", color: "#166534", border: "none" }}>Paid</Badge>;
  if (status === "overdue") return <Badge className="text-xs" style={{ background: "#fee2e2", color: "#991b1b", border: "none" }}>Overdue</Badge>;
  if (status === "disputed") return <Badge className="text-xs" style={{ background: "#fef9c3", color: "#713f12", border: "none" }}>Disputed</Badge>;
  return <Badge className="text-xs" style={{ background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb" }}>Unpaid</Badge>;
}

function ReconBadge({ status }: { status: string }) {
  if (status === "reconciled") return <Badge className="text-xs" style={{ background: "#dcfce7", color: "#166534", border: "none" }}>✓ Reconciled</Badge>;
  if (status === "partial") return <Badge className="text-xs" style={{ background: "#fef3c7", color: "#92400e", border: "none" }}>⚡ Partial</Badge>;
  return <Badge className="text-xs" style={{ background: "#fee2e2", color: "#991b1b", border: "none" }}>✗ Unreconciled</Badge>;
}

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB");
}

function fmtGbp(v: unknown) {
  if (!v && v !== 0) return "—";
  return `£${Number(v).toFixed(2)}`;
}

function lineTypeLabel(t: string) {
  return LINE_TYPES.find(l => l.value === t)?.label ?? t;
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Med = { id?: number; medicineName: string; batchNumber: string; quantityUsed: string; unit: string; withdrawalPeriodDays: string; vetDispensed: boolean; notes: string };
type InvoiceLine = { id?: number; lineType: string; description: string; quantity: string; unitPriceGbp: string; lineTotalGbp: string; visitId: string; isMatched: boolean; matchNote: string };

function blankMed(): Med { return { medicineName: "", batchNumber: "", quantityUsed: "", unit: "ml", withdrawalPeriodDays: "", vetDispensed: true, notes: "" }; }
function blankLine(): InvoiceLine { return { lineType: "consultation", description: "", quantity: "1", unitPriceGbp: "", lineTotalGbp: "", visitId: "", isMatched: false, matchNote: "" }; }

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function VetLedgerPage() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const invalidate = () => { queryClient.invalidateQueries({ queryKey: ["vet-visits", farmId] }); queryClient.invalidateQueries({ queryKey: ["vet-invoices", farmId] }); };

  type VetTab = "visits" | "invoices";
  const [tab, setTab] = useState<VetTab>("visits");
  const [search, setSearch] = useState("");

  // ── Queries ─────────────────────────────────────────────
  const visitsQ = useQuery({
    queryKey: ["vet-visits", farmId],
    queryFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/vet-visits`);
      if (!res.ok) throw new Error("Failed to load vet visits");
      return res.json() as Promise<{ records: Record<string, unknown>[] }>;
    },
    enabled: !!farmId,
  });

  const invoicesQ = useQuery({
    queryKey: ["vet-invoices", farmId],
    queryFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/vet-invoices`);
      if (!res.ok) throw new Error("Failed to load vet invoices");
      return res.json() as Promise<{ records: Record<string, unknown>[] }>;
    },
    enabled: !!farmId,
  });

  // Also load herds for the visit form herd picker
  const herdsQ = useQuery({
    queryKey: ["herds", farmId],
    queryFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/herds`);
      if (!res.ok) return { records: [] };
      const data = await res.json();
      return { records: data.records ?? data ?? [] } as { records: Record<string, unknown>[] };
    },
    enabled: !!farmId,
  });

  const visits = (visitsQ.data?.records ?? []) as Record<string, unknown>[];
  const invoices = (invoicesQ.data?.records ?? []) as Record<string, unknown>[];
  const herds = (herdsQ.data?.records ?? []) as Record<string, unknown>[];

  // Known vet names / practices from existing records
  const knownVets: string[] = [...new Set([...visits.map(v => String(v.vetName ?? "")), ...invoices.map(i => String(i.vetName ?? ""))].filter(Boolean))];
  const knownPractices: string[] = [...new Set([...visits.map(v => String(v.vetPractice ?? "")), ...invoices.map(i => String(i.vetPractice ?? ""))].filter(Boolean))];

  // Medicine register — for autocomplete on vet visit medicine entries
  const medicineNamesQ = useQuery({
    queryKey: ["medicine-names-lookup", farmId],
    queryFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/medicine-records`);
      if (!res.ok) return { records: [] };
      return res.json() as Promise<{ records: { medicineName: string; source?: string }[] }>;
    },
    enabled: !!farmId,
  });
  const knownMedicineNames: string[] = [...new Set(
    (medicineNamesQ.data?.records ?? [])
      .filter(r => r.source !== "vet_ledger")
      .map(r => r.medicineName)
      .filter(Boolean)
  )];

  // ── Visit Dialog State ────────────────────────────────────
  const [showVisitDialog, setShowVisitDialog] = useState(false);
  const [editVisit, setEditVisit] = useState<Record<string, unknown> | null>(null);
  const [visitForm, setVisitForm] = useState<Record<string, string>>({});
  const [visitMeds, setVisitMeds] = useState<Med[]>([]);
  const [visitHerdIds, setVisitHerdIds] = useState<number[]>([]);

  // ── Visit View State ──────────────────────────────────────
  const [showViewVisitDialog, setShowViewVisitDialog] = useState(false);
  const [viewVisit, setViewVisit] = useState<Record<string, unknown> | null>(null);

  // ── Invoice Dialog State ──────────────────────────────────
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [editInvoice, setEditInvoice] = useState<Record<string, unknown> | null>(null);
  const [invoiceForm, setInvoiceForm] = useState<Record<string, string>>({});
  const [invoiceLines, setInvoiceLines] = useState<InvoiceLine[]>([]);

  // ── Invoice View State ────────────────────────────────────
  const [showViewInvoiceDialog, setShowViewInvoiceDialog] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<Record<string, unknown> | null>(null);

  // ── Mutations: Visits ──────────────────────────────────────
  const visitMut = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const url = editVisit ? `/api/farms/${farmId}/vet-visits/${editVisit.id}` : `/api/farms/${farmId}/vet-visits`;
      const res = await fetch(url, { method: editVisit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed to save visit");
      return res.json();
    },
    onSuccess: () => { invalidate(); setShowVisitDialog(false); toast({ title: editVisit ? "Visit updated" : "Visit logged" }); },
    onError: () => toast({ title: "Error saving visit", variant: "destructive" }),
  });

  const delVisitMut = useMutation({
    mutationFn: async (id: number) => { const res = await fetch(`/api/farms/${farmId}/vet-visits/${id}`, { method: "DELETE" }); if (!res.ok) throw new Error(); },
    onSuccess: () => { invalidate(); toast({ title: "Visit deleted" }); },
    onError: () => toast({ title: "Error deleting visit", variant: "destructive" }),
  });

  // ── Mutations: Invoices ───────────────────────────────────
  const invoiceMut = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const url = editInvoice ? `/api/farms/${farmId}/vet-invoices/${editInvoice.id}` : `/api/farms/${farmId}/vet-invoices`;
      const res = await fetch(url, { method: editInvoice ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed to save invoice");
      return res.json();
    },
    onSuccess: () => { invalidate(); setShowInvoiceDialog(false); toast({ title: editInvoice ? "Invoice updated" : "Invoice added" }); },
    onError: () => toast({ title: "Error saving invoice", variant: "destructive" }),
  });

  const delInvoiceMut = useMutation({
    mutationFn: async (id: number) => { const res = await fetch(`/api/farms/${farmId}/vet-invoices/${id}`, { method: "DELETE" }); if (!res.ok) throw new Error(); },
    onSuccess: () => { invalidate(); toast({ title: "Invoice deleted" }); },
    onError: () => toast({ title: "Error deleting invoice", variant: "destructive" }),
  });

  // ── Open Visit Dialog ─────────────────────────────────────
  function openVisitEdit(v?: Record<string, unknown>) {
    setEditVisit(v ?? null);
    if (v) {
      const form: Record<string, string> = {};
      for (const [k, val] of Object.entries(v)) {
        if (k === "medicines" || k === "herdIds" || k === "animalIds") continue;
        if (val !== null && val !== undefined) form[k] = String(val);
      }
      setVisitForm(form);
      try { setVisitHerdIds(JSON.parse(String(v.herdIds ?? "[]"))); } catch { setVisitHerdIds([]); }
      const meds = (v.medicines as Med[] | null) ?? [];
      setVisitMeds(meds.map(m => ({
        medicineName: String(m.medicineName ?? ""),
        batchNumber: String(m.batchNumber ?? ""),
        quantityUsed: String(m.quantityUsed ?? ""),
        unit: String(m.unit ?? "ml"),
        withdrawalPeriodDays: String(m.withdrawalPeriodDays ?? ""),
        vetDispensed: m.vetDispensed === true || (m.vetDispensed as unknown) === "true",
        notes: String(m.notes ?? ""),
      })));
    } else {
      setVisitForm({ visitDate: new Date().toISOString().slice(0, 10) });
      setVisitHerdIds([]);
      setVisitMeds([]);
    }
    setShowVisitDialog(true);
  }

  // ── Open Invoice Dialog ────────────────────────────────────
  function openInvoiceEdit(inv?: Record<string, unknown>) {
    setEditInvoice(inv ?? null);
    if (inv) {
      const form: Record<string, string> = {};
      for (const [k, val] of Object.entries(inv)) {
        if (k === "lines") continue;
        if (val !== null && val !== undefined) form[k] = String(val);
      }
      setInvoiceForm(form);
      const lines = (inv.lines as InvoiceLine[] | null) ?? [];
      setInvoiceLines(lines.map(l => ({
        lineType: String(l.lineType ?? "consultation"),
        description: String(l.description ?? ""),
        quantity: String(l.quantity ?? "1"),
        unitPriceGbp: String(l.unitPriceGbp ?? ""),
        lineTotalGbp: String(l.lineTotalGbp ?? ""),
        visitId: String(l.visitId ?? ""),
        isMatched: l.isMatched === true || (l.isMatched as unknown) === "true",
        matchNote: String(l.matchNote ?? ""),
      })));
    } else {
      setInvoiceForm({ invoiceDate: new Date().toISOString().slice(0, 10), paymentStatus: "unpaid" });
      setInvoiceLines([]);
    }
    setShowInvoiceDialog(true);
  }

  // ── Save Visit ────────────────────────────────────────────
  function saveVisit() {
    if (!visitForm.visitDate?.trim() || !visitForm.vetName?.trim() || !visitForm.reasonForVisit?.trim()) {
      toast({ title: "Date, vet name, and reason are required", variant: "destructive" }); return;
    }
    visitMut.mutate({
      ...visitForm,
      herdIds: JSON.stringify(visitHerdIds),
      medicines: visitMeds.filter(m => m.medicineName.trim()),
    });
  }

  // ── Save Invoice ──────────────────────────────────────────
  function saveInvoice() {
    if (!invoiceForm.invoiceNumber?.trim() || !invoiceForm.invoiceDate?.trim() || !invoiceForm.vetPractice?.trim() || !invoiceForm.totalAmountGbp?.trim()) {
      toast({ title: "Invoice number, date, practice, and total are required", variant: "destructive" }); return;
    }
    invoiceMut.mutate({
      ...invoiceForm,
      lines: invoiceLines.map(l => ({ ...l, visitId: l.visitId || null })),
    });
  }

  // ── Auto-compute line total ───────────────────────────────
  function updateLineTotal(idx: number, qty: string, unitPrice: string) {
    const q = parseFloat(qty) || 0;
    const u = parseFloat(unitPrice) || 0;
    if (q && u) {
      setInvoiceLines(ls => ls.map((l, i) => i === idx ? { ...l, lineTotalGbp: (q * u).toFixed(2) } : l));
    }
  }

  // ── Toggle herd in visit ──────────────────────────────────
  function toggleHerd(id: number) {
    setVisitHerdIds(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);
  }

  // ── Filtered lists ────────────────────────────────────────
  const q = search.toLowerCase();
  const filteredVisits = visits.filter(v =>
    String(v.vetName ?? "").toLowerCase().includes(q) ||
    String(v.vetPractice ?? "").toLowerCase().includes(q) ||
    String(v.reasonForVisit ?? "").toLowerCase().includes(q)
  );
  const filteredInvoices = invoices.filter(i =>
    String(i.invoiceNumber ?? "").toLowerCase().includes(q) ||
    String(i.vetPractice ?? "").toLowerCase().includes(q) ||
    String(i.vetName ?? "").toLowerCase().includes(q)
  );

  // ── Summary stats ──────────────────────────────────────────
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
  const visitsThisYear = visits.filter(v => String(v.visitDate ?? "") >= yearStart).length;
  const followUpsDue = visits.filter(v => v.followUpDueDate && String(v.followUpDueDate) <= now.toISOString().slice(0, 10)).length;
  const outstanding = invoices.filter(i => i.paymentStatus !== "paid").reduce((sum, i) => sum + (Number(i.totalAmountGbp) || 0), 0);
  const unreconciled = invoices.filter(i => i.reconciliationStatus !== "reconciled").length;

  return (
    <AppLayout title="Vet Ledger">
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-800 flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Vet Ledger</h1>
            <p className="text-xs text-gray-500">Visit records and invoice reconciliation</p>
          </div>
        </div>
        <Button
          className="bg-green-800 hover:bg-green-900 text-white h-8 px-3 text-sm"
          onClick={() => tab === "visits" ? openVisitEdit() : openInvoiceEdit()}
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          {tab === "visits" ? "Log Visit" : "Add Invoice"}
        </Button>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 mb-5">
        {[
          { label: "Visits this year", value: visitsThisYear, icon: Stethoscope, color: "#166534" },
          { label: "Follow-ups due", value: followUpsDue, icon: Clock, color: followUpsDue > 0 ? "#92400e" : "#6b7280" },
          { label: "Outstanding", value: outstanding > 0 ? fmtGbp(outstanding) : "£0.00", icon: Receipt, color: outstanding > 0 ? "#991b1b" : "#6b7280" },
          { label: "To reconcile", value: unreconciled, icon: AlertCircle, color: unreconciled > 0 ? "#991b1b" : "#166534" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3">
            <s.icon className="w-5 h-5 shrink-0" style={{ color: s.color }} />
            <div>
              <p className="text-lg font-bold text-gray-900 leading-none">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-4">
        {(["visits", "invoices"] as VetTab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? "border-green-800 text-green-900" : "border-transparent text-gray-500 hover:text-gray-800"}`}
          >
            {t === "visits" ? `Vet Visits (${visits.length})` : `Invoices (${invoices.length})`}
          </button>
        ))}
        <div className="ml-auto mb-1">
          <Input
            placeholder={tab === "visits" ? "Search visits…" : "Search invoices…"}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 text-sm w-52"
          />
        </div>
      </div>

      {/* ── VISITS TAB ───────────────────────────────────── */}
      {tab === "visits" && (
        <div className="space-y-3">
          {visitsQ.isLoading && <p className="text-sm text-gray-500">Loading…</p>}
          {!visitsQ.isLoading && filteredVisits.length === 0 && (
            <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl">
              <Stethoscope className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No vet visits recorded yet</p>
              <Button size="sm" className="mt-3 bg-green-800 hover:bg-green-900 text-white" onClick={() => openVisitEdit()}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Log First Visit
              </Button>
            </div>
          )}
          {filteredVisits.map(v => {
            const meds = (v.medicines as Med[] | null) ?? [];
            const followUpOverdue = v.followUpDueDate && String(v.followUpDueDate) < now.toISOString().slice(0, 10);
            // Match to invoices
            const linkedInvoices = invoices.filter(inv => {
              const lines = (inv.lines as InvoiceLine[] | null) ?? [];
              return lines.some(l => l.visitId && String(l.visitId) === String(v.id));
            });
            return (
              <div key={String(v.id)} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900">{fmtDate(String(v.visitDate ?? ""))}</span>
                      <span className="text-sm text-gray-700">{String(v.vetName ?? "")}{v.vetPractice ? ` — ${String(v.vetPractice)}` : ""}</span>
                      {followUpOverdue && <Badge className="text-xs" style={{ background: "#fef3c7", color: "#92400e", border: "none" }}>Follow-up overdue</Badge>}
                      {linkedInvoices.length > 0 && <Badge className="text-xs" style={{ background: "#e0f2fe", color: "#0369a1", border: "none" }}>
                        <Receipt className="w-2.5 h-2.5 mr-1 inline" />{linkedInvoices.length} invoice{linkedInvoices.length > 1 ? "s" : ""}
                      </Badge>}
                    </div>
                    <p className="text-sm text-gray-600 font-medium">{String(v.reasonForVisit ?? "")}</p>
                    {!!v.diagnoses && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">Dx: {String(v.diagnoses)}</p>}
                    <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-500">
                      {meds.length > 0 && <span className="flex items-center gap-1"><Package className="w-3 h-3" />{meds.length} medicine{meds.length > 1 ? "s" : ""}</span>}
                      {!!v.followUpDueDate && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Follow-up: {fmtDate(String(v.followUpDueDate))}</span>}
                      {!!v.estimatedTotalGbp && <span>Est. {fmtGbp(v.estimatedTotalGbp)}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="ghost" title="View" onClick={() => { setViewVisit(v); setShowViewVisitDialog(true); }} className="h-7 px-2 text-gray-500"><Eye className="w-3 h-3" /></Button>
                    <Button size="sm" variant="ghost" title="Edit" onClick={() => openVisitEdit(v)} className="h-7 px-2"><Edit2 className="w-3 h-3" /></Button>
                    <Button size="sm" variant="ghost" title="Delete" onClick={() => { if (confirm("Delete this visit record?")) delVisitMut.mutate(Number(v.id)); }} className="h-7 px-2 text-red-600"><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── INVOICES TAB ─────────────────────────────────── */}
      {tab === "invoices" && (
        <div className="space-y-3">
          {invoicesQ.isLoading && <p className="text-sm text-gray-500">Loading…</p>}
          {!invoicesQ.isLoading && filteredInvoices.length === 0 && (
            <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl">
              <Receipt className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No vet invoices recorded yet</p>
              <Button size="sm" className="mt-3 bg-green-800 hover:bg-green-900 text-white" onClick={() => openInvoiceEdit()}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add First Invoice
              </Button>
            </div>
          )}
          {filteredInvoices.map(inv => {
            const lines = (inv.lines as InvoiceLine[] | null) ?? [];
            const matchedCount = lines.filter(l => l.isMatched).length;
            return (
              <div key={String(inv.id)} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900">{String(inv.invoiceNumber ?? "")}</span>
                      <span className="text-xs text-gray-500">{fmtDate(String(inv.invoiceDate ?? ""))}</span>
                      <PaymentBadge status={String(inv.paymentStatus ?? "unpaid")} />
                      <ReconBadge status={String(inv.reconciliationStatus ?? "unreconciled")} />
                    </div>
                    <p className="text-sm text-gray-700">{String(inv.vetPractice ?? "")}{inv.vetName ? ` — ${String(inv.vetName)}` : ""}</p>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                      <span className="font-semibold text-gray-800">{fmtGbp(inv.totalAmountGbp)}</span>
                      {lines.length > 0 && <span>{matchedCount}/{lines.length} lines matched</span>}
                      {inv.paymentDate && <span>Paid: {fmtDate(String(inv.paymentDate))}</span>}
                      {inv.paymentReference && <span>Ref: {String(inv.paymentReference)}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="ghost" title="View & reconcile" onClick={() => { setViewInvoice(inv); setShowViewInvoiceDialog(true); }} className="h-7 px-2 text-gray-500">
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" title="Edit" onClick={() => openInvoiceEdit(inv)} className="h-7 px-2"><Edit2 className="w-3 h-3" /></Button>
                    <Button size="sm" variant="ghost" title="Delete" onClick={() => { if (confirm("Delete this invoice?")) delInvoiceMut.mutate(Number(inv.id)); }} className="h-7 px-2 text-red-600"><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          VET VISIT DIALOG (add / edit)
      ══════════════════════════════════════════════════════════════════ */}
      <Dialog open={showVisitDialog} onOpenChange={setShowVisitDialog}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editVisit ? "Edit Vet Visit" : "Log Vet Visit"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            {/* Date + vet */}
            <div className="flex items-end gap-3 flex-wrap">
              <div className="w-36 shrink-0">
                <Label className="text-xs">Visit date *</Label>
                <Input type="date" className="h-8 text-sm mt-1" value={visitForm.visitDate ?? ""} onChange={e => setVisitForm(f => ({ ...f, visitDate: e.target.value }))} />
              </div>
              <div className="flex-1 min-w-[140px]">
                <Label className="text-xs">Vet name *</Label>
                <Input className="h-8 text-sm mt-1" list="vl-vet-names" value={visitForm.vetName ?? ""} onChange={e => setVisitForm(f => ({ ...f, vetName: e.target.value }))} placeholder="e.g. Mr. James Stewart" />
                <datalist id="vl-vet-names">{knownVets.map(n => <option key={n} value={n} />)}</datalist>
              </div>
              <div className="flex-1 min-w-[140px]">
                <Label className="text-xs">Vet practice</Label>
                <Input className="h-8 text-sm mt-1" list="vl-practices" value={visitForm.vetPractice ?? ""} onChange={e => setVisitForm(f => ({ ...f, vetPractice: e.target.value }))} placeholder="e.g. Westgate Vets" />
                <datalist id="vl-practices">{knownPractices.map(p => <option key={p} value={p} />)}</datalist>
                <datalist id="vl-medicine-names">{knownMedicineNames.map(n => <option key={n} value={n} />)}</datalist>
              </div>
            </div>

            {/* Reason */}
            <div>
              <Label className="text-xs">Reason for visit *</Label>
              <Input className="h-8 text-sm mt-1" value={visitForm.reasonForVisit ?? ""} onChange={e => setVisitForm(f => ({ ...f, reasonForVisit: e.target.value }))} placeholder="e.g. Routine health check, Lameness investigation, TB test…" />
            </div>

            {/* Herds */}
            {herds.length > 0 && (
              <div>
                <Label className="text-xs">Herds / flocks seen</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {herds.map(h => {
                    const selected = visitHerdIds.includes(Number(h.id));
                    return (
                      <button
                        key={String(h.id)}
                        type="button"
                        onClick={() => toggleHerd(Number(h.id))}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${selected ? "bg-green-800 text-white border-green-800" : "bg-white text-gray-700 border-gray-300 hover:border-green-700"}`}
                      >
                        {String(h.herdName ?? h.name ?? `Herd ${h.id}`)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Clinical details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label className="text-xs">Diagnoses / findings</Label>
                <Textarea rows={2} className="text-sm mt-1" value={visitForm.diagnoses ?? ""} onChange={e => setVisitForm(f => ({ ...f, diagnoses: e.target.value }))} placeholder="Record any diagnoses or clinical findings…" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Treatments carried out</Label>
                <Textarea rows={2} className="text-sm mt-1" value={visitForm.treatmentsCarriedOut ?? ""} onChange={e => setVisitForm(f => ({ ...f, treatmentsCarriedOut: e.target.value }))} placeholder="Describe treatments and procedures performed on farm…" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Prescriptions issued</Label>
                <Textarea rows={1} className="text-sm mt-1" value={visitForm.prescriptionsIssued ?? ""} onChange={e => setVisitForm(f => ({ ...f, prescriptionsIssued: e.target.value }))} placeholder="Any medicines prescribed for farm purchase…" />
              </div>
            </div>

            {/* Follow-up */}
            <div className="flex items-end gap-3 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <Label className="text-xs">Follow-up actions required</Label>
                <Input className="h-8 text-sm mt-1" value={visitForm.followUpActions ?? ""} onChange={e => setVisitForm(f => ({ ...f, followUpActions: e.target.value }))} placeholder="e.g. Re-examine in 10 days, retest herd…" />
              </div>
              <div className="w-36 shrink-0">
                <Label className="text-xs">Follow-up due date</Label>
                <Input type="date" className="h-8 text-sm mt-1" value={visitForm.followUpDueDate ?? ""} onChange={e => setVisitForm(f => ({ ...f, followUpDueDate: e.target.value }))} />
              </div>
            </div>

            {/* Time / cost */}
            <div className="flex items-end gap-3 flex-wrap">
              <div className="w-32 shrink-0">
                <Label className="text-xs">Time on farm (mins)</Label>
                <Input type="number" className="h-8 text-sm mt-1" value={visitForm.timeOnFarmMinutes ?? ""} onChange={e => setVisitForm(f => ({ ...f, timeOnFarmMinutes: e.target.value }))} placeholder="e.g. 90" />
              </div>
              <div className="w-32 shrink-0">
                <Label className="text-xs">Call-out fee (£)</Label>
                <Input type="number" step="0.01" className="h-8 text-sm mt-1" value={visitForm.callOutFeeGbp ?? ""} onChange={e => setVisitForm(f => ({ ...f, callOutFeeGbp: e.target.value }))} placeholder="0.00" />
              </div>
              <div className="w-36 shrink-0">
                <Label className="text-xs">Estimated total (£)</Label>
                <Input type="number" step="0.01" className="h-8 text-sm mt-1" value={visitForm.estimatedTotalGbp ?? ""} onChange={e => setVisitForm(f => ({ ...f, estimatedTotalGbp: e.target.value }))} placeholder="0.00" />
              </div>
            </div>

            {/* Medicines administered */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-700" />
                  <p className="text-xs font-semibold text-blue-800">Medicines Administered / Dispensed</p>
                </div>
                <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={() => setVisitMeds(ms => [...ms, blankMed()])}>
                  <Plus className="w-3 h-3 mr-1" /> Add
                </Button>
              </div>
              <p className="text-xs text-blue-700 mb-2">Record each medicine given on this visit. These are automatically added to your Medicine Register for Red Tractor traceability — no need to enter them twice.</p>
              {visitMeds.length === 0 && <p className="text-xs text-blue-600 italic">No medicines recorded for this visit.</p>}
              {visitMeds.map((med, idx) => (
                <div key={idx} className="border border-blue-200 rounded-lg p-2 mb-2 bg-white">
                  <div className="flex items-end gap-2 flex-wrap">
                    <div className="flex-1 min-w-[140px]">
                      <Label className="text-xs">Medicine name</Label>
                      <Input className="h-7 text-xs mt-0.5" list="vl-medicine-names" value={med.medicineName} onChange={e => setVisitMeds(ms => ms.map((m, i) => i === idx ? { ...m, medicineName: e.target.value } : m))} placeholder="e.g. Norocillin LA" />
                    </div>
                    <div className="w-28 shrink-0">
                      <Label className="text-xs">Batch number</Label>
                      <Input className="h-7 text-xs mt-0.5" value={med.batchNumber} onChange={e => setVisitMeds(ms => ms.map((m, i) => i === idx ? { ...m, batchNumber: e.target.value } : m))} placeholder="e.g. ABC1234" />
                    </div>
                    <div className="w-20 shrink-0">
                      <Label className="text-xs">Qty</Label>
                      <Input type="number" className="h-7 text-xs mt-0.5" value={med.quantityUsed} onChange={e => setVisitMeds(ms => ms.map((m, i) => i === idx ? { ...m, quantityUsed: e.target.value } : m))} />
                    </div>
                    <div className="w-20 shrink-0">
                      <Label className="text-xs">Unit</Label>
                      <Select value={med.unit} onValueChange={v => setVisitMeds(ms => ms.map((m, i) => i === idx ? { ...m, unit: v } : m))}>
                        <SelectTrigger className="h-7 text-xs mt-0.5"><SelectValue /></SelectTrigger>
                        <SelectContent>{MEDICINE_UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="w-28 shrink-0">
                      <Label className="text-xs">Withdrawal (days)</Label>
                      <Input type="number" className="h-7 text-xs mt-0.5" value={med.withdrawalPeriodDays} onChange={e => setVisitMeds(ms => ms.map((m, i) => i === idx ? { ...m, withdrawalPeriodDays: e.target.value } : m))} placeholder="0" />
                    </div>
                    <div className="flex items-center gap-1.5 mt-4">
                      <Checkbox checked={med.vetDispensed} onCheckedChange={v => setVisitMeds(ms => ms.map((m, i) => i === idx ? { ...m, vetDispensed: !!v } : m))} id={`vd-${idx}`} />
                      <Label htmlFor={`vd-${idx}`} className="text-xs">Vet-dispensed</Label>
                    </div>
                    <Button size="sm" variant="ghost" className="h-7 px-1.5 text-red-600 mt-4" onClick={() => setVisitMeds(ms => ms.filter((_, i) => i !== idx))}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Notes */}
            <div>
              <Label className="text-xs">Notes</Label>
              <Textarea rows={2} className="text-sm mt-1" value={visitForm.notes ?? ""} onChange={e => setVisitForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVisitDialog(false)}>Cancel</Button>
            <Button className="bg-green-800 hover:bg-green-900 text-white" onClick={saveVisit} disabled={visitMut.isPending}>
              {editVisit ? "Save Changes" : "Log Visit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════
          VET VISIT VIEW DIALOG (read-only)
      ══════════════════════════════════════════════════════════════════ */}
      <Dialog open={showViewVisitDialog} onOpenChange={setShowViewVisitDialog}>
        <DialogContent className="max-w-xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-gray-500" />
              Vet Visit — {viewVisit ? fmtDate(String(viewVisit.visitDate ?? "")) : ""}
            </DialogTitle>
          </DialogHeader>
          <VetVisitViewBody visit={viewVisit} visits={visits} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewVisitDialog(false)}>Close</Button>
            <Button className="bg-green-800 hover:bg-green-900 text-white" onClick={() => { setShowViewVisitDialog(false); openVisitEdit(viewVisit!); }}>
              <Edit2 className="w-3 h-3 mr-1" /> Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════
          INVOICE DIALOG (add / edit)
      ══════════════════════════════════════════════════════════════════ */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editInvoice ? "Edit Invoice" : "Add Vet Invoice"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            {/* Invoice header */}
            <div className="flex items-end gap-3 flex-wrap">
              <div className="flex-1 min-w-[140px]">
                <Label className="text-xs">Invoice number *</Label>
                <Input className="h-8 text-sm mt-1" value={invoiceForm.invoiceNumber ?? ""} onChange={e => setInvoiceForm(f => ({ ...f, invoiceNumber: e.target.value }))} placeholder="e.g. VET-2024-0193" />
              </div>
              <div className="w-36 shrink-0">
                <Label className="text-xs">Invoice date *</Label>
                <Input type="date" className="h-8 text-sm mt-1" value={invoiceForm.invoiceDate ?? ""} onChange={e => setInvoiceForm(f => ({ ...f, invoiceDate: e.target.value }))} />
              </div>
            </div>
            <div className="flex items-end gap-3 flex-wrap">
              <div className="flex-1 min-w-[160px]">
                <Label className="text-xs">Vet practice *</Label>
                <Input className="h-8 text-sm mt-1" list="inv-practices" value={invoiceForm.vetPractice ?? ""} onChange={e => setInvoiceForm(f => ({ ...f, vetPractice: e.target.value }))} placeholder="e.g. Westgate Vets" />
                <datalist id="inv-practices">{knownPractices.map(p => <option key={p} value={p} />)}</datalist>
              </div>
              <div className="flex-1 min-w-[140px]">
                <Label className="text-xs">Vet name</Label>
                <Input className="h-8 text-sm mt-1" list="inv-vet-names" value={invoiceForm.vetName ?? ""} onChange={e => setInvoiceForm(f => ({ ...f, vetName: e.target.value }))} placeholder="e.g. Mr. James Stewart" />
                <datalist id="inv-vet-names">{knownVets.map(n => <option key={n} value={n} />)}</datalist>
              </div>
              <div className="w-32 shrink-0">
                <Label className="text-xs">Total (£) *</Label>
                <Input type="number" step="0.01" className="h-8 text-sm mt-1" value={invoiceForm.totalAmountGbp ?? ""} onChange={e => setInvoiceForm(f => ({ ...f, totalAmountGbp: e.target.value }))} placeholder="0.00" />
              </div>
            </div>

            {/* Payment */}
            <div className="flex items-end gap-3 flex-wrap">
              <div className="w-36 shrink-0">
                <Label className="text-xs">Payment status</Label>
                <Select value={invoiceForm.paymentStatus ?? "unpaid"} onValueChange={v => setInvoiceForm(f => ({ ...f, paymentStatus: v }))}>
                  <SelectTrigger className="h-8 text-sm mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="disputed">Disputed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {invoiceForm.paymentStatus === "paid" && <>
                <div className="w-36 shrink-0">
                  <Label className="text-xs">Payment date</Label>
                  <Input type="date" className="h-8 text-sm mt-1" value={invoiceForm.paymentDate ?? ""} onChange={e => setInvoiceForm(f => ({ ...f, paymentDate: e.target.value }))} />
                </div>
                <div className="flex-1 min-w-[120px]">
                  <Label className="text-xs">Payment reference</Label>
                  <Input className="h-8 text-sm mt-1" value={invoiceForm.paymentReference ?? ""} onChange={e => setInvoiceForm(f => ({ ...f, paymentReference: e.target.value }))} placeholder="BACS / cheque ref" />
                </div>
              </>}
            </div>

            {/* Document */}
            <div>
              <Label className="text-xs">Invoice document URL (optional)</Label>
              <Input className="h-8 text-sm mt-1" value={invoiceForm.invoiceDocumentUrl ?? ""} onChange={e => setInvoiceForm(f => ({ ...f, invoiceDocumentUrl: e.target.value }))} placeholder="https://…" />
            </div>

            {/* Line items */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-700">Invoice Line Items</p>
                <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={() => setInvoiceLines(ls => [...ls, blankLine()])}>
                  <Plus className="w-3 h-3 mr-1" /> Add line
                </Button>
              </div>
              <p className="text-xs text-gray-500 mb-2">Enter each line from the invoice. Link to a vet visit and mark as matched to reconcile.</p>
              {invoiceLines.length === 0 && <p className="text-xs text-gray-400 italic">No lines added yet — add lines to enable reconciliation.</p>}
              {invoiceLines.map((line, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-2 mb-2 bg-white">
                  <div className="flex items-end gap-2 flex-wrap">
                    <div className="w-40 shrink-0">
                      <Label className="text-xs">Type</Label>
                      <Select value={line.lineType} onValueChange={v => setInvoiceLines(ls => ls.map((l, i) => i === idx ? { ...l, lineType: v } : l))}>
                        <SelectTrigger className="h-7 text-xs mt-0.5"><SelectValue /></SelectTrigger>
                        <SelectContent>{LINE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1 min-w-[140px]">
                      <Label className="text-xs">Description</Label>
                      <Input className="h-7 text-xs mt-0.5" value={line.description} onChange={e => setInvoiceLines(ls => ls.map((l, i) => i === idx ? { ...l, description: e.target.value } : l))} placeholder="Description from invoice" />
                    </div>
                    <div className="w-14 shrink-0">
                      <Label className="text-xs">Qty</Label>
                      <Input type="number" className="h-7 text-xs mt-0.5" value={line.quantity} onChange={e => { setInvoiceLines(ls => ls.map((l, i) => i === idx ? { ...l, quantity: e.target.value } : l)); updateLineTotal(idx, e.target.value, line.unitPriceGbp); }} />
                    </div>
                    <div className="w-20 shrink-0">
                      <Label className="text-xs">Unit price (£)</Label>
                      <Input type="number" step="0.01" className="h-7 text-xs mt-0.5" value={line.unitPriceGbp} onChange={e => { setInvoiceLines(ls => ls.map((l, i) => i === idx ? { ...l, unitPriceGbp: e.target.value } : l)); updateLineTotal(idx, line.quantity, e.target.value); }} />
                    </div>
                    <div className="w-20 shrink-0">
                      <Label className="text-xs">Total (£)</Label>
                      <Input type="number" step="0.01" className="h-7 text-xs mt-0.5" value={line.lineTotalGbp} onChange={e => setInvoiceLines(ls => ls.map((l, i) => i === idx ? { ...l, lineTotalGbp: e.target.value } : l))} />
                    </div>
                    <div className="w-44 shrink-0">
                      <Label className="text-xs">Link to visit</Label>
                      <Select value={line.visitId || "__none__"} onValueChange={v => setInvoiceLines(ls => ls.map((l, i) => i === idx ? { ...l, visitId: v === "__none__" ? "" : v } : l))}>
                        <SelectTrigger className="h-7 text-xs mt-0.5"><SelectValue placeholder="No visit linked" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">No visit linked</SelectItem>
                          {visits.map(v => <SelectItem key={String(v.id)} value={String(v.id)}>{fmtDate(String(v.visitDate ?? ""))} — {String(v.vetName ?? "")}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-1.5 mt-4">
                      <Checkbox checked={line.isMatched} onCheckedChange={v => setInvoiceLines(ls => ls.map((l, i) => i === idx ? { ...l, isMatched: !!v } : l))} id={`match-${idx}`} />
                      <Label htmlFor={`match-${idx}`} className="text-xs">Matched</Label>
                    </div>
                    <Button size="sm" variant="ghost" className="h-7 px-1.5 text-red-600 mt-4" onClick={() => setInvoiceLines(ls => ls.filter((_, i) => i !== idx))}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {invoiceLines.length > 0 && (
                <div className="flex justify-end text-xs text-gray-700 font-semibold pt-1 border-t border-gray-200 mt-1">
                  Lines total: {fmtGbp(invoiceLines.reduce((s, l) => s + (parseFloat(l.lineTotalGbp) || 0), 0))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <Label className="text-xs">Notes</Label>
              <Textarea rows={2} className="text-sm mt-1" value={invoiceForm.notes ?? ""} onChange={e => setInvoiceForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvoiceDialog(false)}>Cancel</Button>
            <Button className="bg-green-800 hover:bg-green-900 text-white" onClick={saveInvoice} disabled={invoiceMut.isPending}>
              {editInvoice ? "Save Changes" : "Add Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════
          INVOICE VIEW / RECONCILIATION DIALOG
      ══════════════════════════════════════════════════════════════════ */}
      <Dialog open={showViewInvoiceDialog} onOpenChange={setShowViewInvoiceDialog}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-gray-500" />
              Invoice {viewInvoice ? String(viewInvoice.invoiceNumber ?? "") : ""}
            </DialogTitle>
          </DialogHeader>
          <InvoiceViewBody invoice={viewInvoice} visits={visits} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewInvoiceDialog(false)}>Close</Button>
            <Button className="bg-green-800 hover:bg-green-900 text-white" onClick={() => { setShowViewInvoiceDialog(false); openInvoiceEdit(viewInvoice!); }}>
              <Edit2 className="w-3 h-3 mr-1" /> Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </AppLayout>
  );
}

// ── VetVisitViewBody — top-level component (React Fast Refresh safe) ───────────

function VetVisitViewBody({ visit, visits }: { visit: Record<string, unknown> | null; visits: Record<string, unknown>[] }) {
  if (!visit) return null;
  const v = visit;
  const meds = (v.medicines as Med[] | null) ?? [];

  return (
    <div className="py-1 space-y-3">
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div><span className="text-xs font-medium text-gray-500">Date</span><p className="font-semibold text-gray-900">{String(new Date(String(v.visitDate ?? "")).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }))}</p></div>
        <div><span className="text-xs font-medium text-gray-500">Vet / Practice</span><p className="text-gray-900">{String(v.vetName ?? "")}{v.vetPractice ? ` — ${String(v.vetPractice)}` : ""}</p></div>
        {v.timeOnFarmMinutes && <div><span className="text-xs font-medium text-gray-500">Time on farm</span><p className="text-gray-900">{String(v.timeOnFarmMinutes)} min</p></div>}
        {v.estimatedTotalGbp && <div><span className="text-xs font-medium text-gray-500">Est. cost</span><p className="text-gray-900">£{Number(v.estimatedTotalGbp).toFixed(2)}</p></div>}
      </div>

      <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Reason for visit</p>
        <p className="text-sm text-gray-900">{String(v.reasonForVisit ?? "")}</p>
      </div>

      {!!v.diagnoses && <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Diagnoses / findings</p><p className="text-sm text-gray-900 whitespace-pre-wrap">{String(v.diagnoses)}</p></div>}
      {!!v.treatmentsCarriedOut && <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Treatments carried out</p><p className="text-sm text-gray-900 whitespace-pre-wrap">{String(v.treatmentsCarriedOut)}</p></div>}
      {!!v.prescriptionsIssued && <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Prescriptions issued</p><p className="text-sm text-gray-900 whitespace-pre-wrap">{String(v.prescriptionsIssued)}</p></div>}
      {!!v.followUpActions && (
        <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Follow-up required</p>
          <p className="text-sm text-gray-900">{String(v.followUpActions)}</p>
          {v.followUpDueDate && <p className="text-xs text-amber-700 mt-0.5">Due: {String(new Date(String(v.followUpDueDate)).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }))}</p>}
        </div>
      )}

      {meds.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Medicines administered ({meds.length})</p>
          <div className="space-y-1.5">
            {meds.map((m, i) => (
              <div key={i} className="flex items-start gap-3 border border-gray-200 rounded-lg px-3 py-2 bg-white text-sm">
                <div className="flex-1">
                  <span className="font-medium text-gray-900">{m.medicineName}</span>
                  {m.batchNumber && <span className="text-gray-500 text-xs ml-2">Batch: {m.batchNumber}</span>}
                  <div className="text-xs text-gray-500 mt-0.5">
                    {m.quantityUsed && m.unit && <span>{m.quantityUsed} {m.unit}</span>}
                    {m.withdrawalPeriodDays && <span className="ml-2 text-amber-700">Withdrawal: {m.withdrawalPeriodDays} days</span>}
                  </div>
                </div>
                <Badge className="text-xs shrink-0" style={m.vetDispensed ? { background: "#e0f2fe", color: "#0369a1", border: "none" } : { background: "#f3f4f6", color: "#6b7280", border: "none" }}>
                  {m.vetDispensed ? "Vet-dispensed" : "Farm stock"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {!!v.notes && <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</p><p className="text-sm text-gray-900 whitespace-pre-wrap">{String(v.notes)}</p></div>}
    </div>
  );
}

// ── InvoiceViewBody — top-level component (React Fast Refresh safe) ─────────────

function InvoiceViewBody({ invoice, visits }: { invoice: Record<string, unknown> | null; visits: Record<string, unknown>[] }) {
  if (!invoice) return null;
  const inv = invoice;
  const lines = (inv.lines as InvoiceLine[] | null) ?? [];
  const matched = lines.filter(l => l.isMatched).length;
  const linesTotal = lines.reduce((s, l) => s + (parseFloat(l.lineTotalGbp) || 0), 0);
  const invoiceTotal = Number(inv.totalAmountGbp) || 0;
  const variance = linesTotal - invoiceTotal;

  return (
    <div className="py-1 space-y-3">
      {/* Header */}
      <div className="flex flex-wrap gap-2 mb-1">
        <PaymentBadge status={String(inv.paymentStatus ?? "unpaid")} />
        <ReconBadge status={String(inv.reconciliationStatus ?? "unreconciled")} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
        <div><span className="text-xs font-medium text-gray-500">Invoice date</span><p className="text-gray-900 font-semibold">{String(new Date(String(inv.invoiceDate ?? "")).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }))}</p></div>
        <div><span className="text-xs font-medium text-gray-500">Practice</span><p className="text-gray-900">{String(inv.vetPractice ?? "")}</p></div>
        {inv.vetName && <div><span className="text-xs font-medium text-gray-500">Vet</span><p className="text-gray-900">{String(inv.vetName)}</p></div>}
        <div><span className="text-xs font-medium text-gray-500">Invoice total</span><p className="text-gray-900 font-bold text-base">£{Number(inv.totalAmountGbp).toFixed(2)}</p></div>
        {inv.paymentDate && <div><span className="text-xs font-medium text-gray-500">Paid on</span><p className="text-gray-900">{String(new Date(String(inv.paymentDate)).toLocaleDateString("en-GB"))}</p></div>}
        {inv.paymentReference && <div><span className="text-xs font-medium text-gray-500">Payment ref</span><p className="text-gray-900">{String(inv.paymentReference)}</p></div>}
      </div>

      {inv.invoiceDocumentUrl && (
        <a href={String(inv.invoiceDocumentUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
          <ExternalLink className="w-3.5 h-3.5" /> View invoice document
        </a>
      )}

      {/* Reconciliation */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Line Items ({matched}/{lines.length} matched)</p>
          {Math.abs(variance) > 0.01 && (
            <span className="text-xs text-red-700 font-medium">
              Lines total {fmtGbp(linesTotal)} — variance {variance > 0 ? "+" : ""}{fmtGbp(variance)}
            </span>
          )}
          {Math.abs(variance) <= 0.01 && lines.length > 0 && (
            <span className="text-xs text-green-700 font-medium flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Lines balance</span>
          )}
        </div>
        {lines.length === 0 && <p className="text-sm text-gray-400 italic">No line items entered — edit the invoice to add line items for reconciliation.</p>}
        {lines.map((l, i) => {
          const linkedVisit = l.visitId ? visits.find(v => String(v.id) === String(l.visitId)) : null;
          return (
            <div key={i} className={`flex items-start gap-3 border rounded-lg px-3 py-2 mb-1.5 text-sm ${l.isMatched ? "border-green-200 bg-green-50" : "border-gray-200 bg-white"}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500">{lineTypeLabel(l.lineType)}</span>
                  <span className="font-medium text-gray-900">{l.description}</span>
                </div>
                {linkedVisit && (
                  <p className="text-xs text-blue-700 mt-0.5 flex items-center gap-1">
                    <ChevronRight className="w-3 h-3" />
                    Linked: {fmtDate(String(linkedVisit.visitDate ?? ""))} — {String(linkedVisit.vetName ?? "")}: {String(linkedVisit.reasonForVisit ?? "")}
                  </p>
                )}
                {l.matchNote && <p className="text-xs text-gray-500 mt-0.5">{l.matchNote}</p>}
              </div>
              <div className="shrink-0 text-right">
                <p className="font-semibold text-gray-900">{fmtGbp(l.lineTotalGbp)}</p>
                {l.isMatched
                  ? <span className="text-xs text-green-700 flex items-center justify-end gap-0.5 mt-0.5"><CheckCircle2 className="w-3 h-3" /> Matched</span>
                  : <span className="text-xs text-red-600 mt-0.5 block">Unmatched</span>}
              </div>
            </div>
          );
        })}
      </div>

      {inv.notes && <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</p><p className="text-sm text-gray-900 whitespace-pre-wrap">{String(inv.notes)}</p></div>}
    </div>
  );
}
