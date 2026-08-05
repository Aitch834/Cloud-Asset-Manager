import { useState, useMemo } from "react";
import type { FormEvent } from "react";
import { usePersistedFilter } from "@/hooks/use-persisted-filter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import {
  Plus, Search, Loader2, Pencil, Trash2, AlertTriangle,
  CheckCircle2, FileText, Eye, Paperclip, ArrowRight,
} from "lucide-react";
import {
  CAUSE_LABELS, DISPOSAL_LABELS, CONTRACTOR_TYPES, STATUS_CONFIG,
  formatDate, StatusBadge, RecordStepper,
} from "./shared";
import type { MortalityRecord, FallenStockContractor, VetHealthPlan, Animal } from "./shared";
import { ArrangeDisposalDialog, LogCollectionDialog, CloseRecordDialog } from "./StageDialogs";

// ─── Main Component ───────────────────────────────────────────────────────────

const EMPTY_FULL = {
  animalId: "" as string, contractorId: "" as string,
  tagNumber: "", species: "", breed: "",
  dateOfDeath: new Date().toISOString().slice(0, 10),
  causeOfDeath: "", disposalMethod: "", disposalOperator: "", disposalRef: "",
  veterinaryAttended: false, vetName: "", postMortemCarriedOut: false, postMortemFindings: "",
  bcmsNotified: false, bcmsNotificationRef: "", notes: "",
  invoiceStatus: "none", invoiceRef: "", invoiceAmount: "", invoicePaidDate: "",
  status: "reported",
};

export function MortalitySection({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const base = `/api/farms/${farmId}/mortality-records`;

  const { data, isLoading } = useQuery<{ records: MortalityRecord[] }>({
    queryKey: ["mortality", farmId],
    queryFn: () => fetch(base).then(r => r.json()),
  });
  const records = data?.records ?? [];

  const { data: animalsData } = useQuery<{ records: Animal[] }>({
    queryKey: ["animals", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/animals`).then(r => r.json()),
  });
  const activeAnimals = (animalsData?.records ?? []).filter(a => a.status === "active");

  const { data: contractorsRaw = [] } = useQuery<FallenStockContractor[]>({
    queryKey: ["fallen-stock-contractors", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fallen-stock-contractors`).then(r => r.json()),
  });
  const activeContractors = Array.isArray(contractorsRaw) ? contractorsRaw.filter(c => c.isActive) : [];

  const { data: vetPlansData } = useQuery({
    queryKey: ["mortality-vet-plans", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/vet-health-plans`).then(r => r.json()).then(d => d.records ?? []),
  });
  const vetPlans: VetHealthPlan[] = Array.isArray(vetPlansData) ? vetPlansData : [];
  const knownVets = vetPlans.reduce<{ label: string; value: string }[]>((acc, p) => {
    const value = [p.vetName, p.practiceName].filter(Boolean).join(" — ");
    if (!acc.find(v => v.value === value)) acc.push({ label: value + (p.practicePhone ? ` · ${p.practicePhone}` : ""), value });
    return acc;
  }, []);

  const { data: attachCountsRaw = [] } = useQuery<Array<{ recordType: string; recordId: number; count: number }>>({
    queryKey: ["record-attachment-counts", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/record-attachments/counts`, { credentials: "include" }).then(r => r.json()),
    staleTime: 30000,
  });
  const attachMap = Object.fromEntries(
    attachCountsRaw.filter(c => c.recordType === "mortality").map(c => [c.recordId, c.count])
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "reported" | "disposal_arranged" | "disposed" | "closed">("all");
  const [viewRecord, setViewRecord] = useState<MortalityRecord | null>(null);
  const [arrangingDisposal, setArrangingDisposal] = useState<MortalityRecord | null>(null);
  const [loggingCollection, setLoggingCollection] = useState<MortalityRecord | null>(null);
  const [closingRecord, setClosingRecord] = useState<MortalityRecord | null>(null);
  const [showFullEdit, setShowFullEdit] = useState(false);
  const [editRecord, setEditRecord] = useState<MortalityRecord | null>(null);
  const [fullForm, setFullForm] = useState(EMPTY_FULL);
  const [useOtherVet, setUseOtherVet] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  function setField(k: string, v: string | boolean) { setFullForm(f => ({ ...f, [k]: v })); }

  function openFullEdit(r: MortalityRecord) {
    setEditRecord(r);
    const existingVet = r.vetName ?? "";
    setUseOtherVet(existingVet !== "" && !knownVets.some(v => v.value === existingVet));
    setFullForm({
      animalId: r.animalId ? String(r.animalId) : "",
      contractorId: r.contractorId ? String(r.contractorId) : "",
      tagNumber: r.tagNumber ?? "", species: r.species, breed: r.breed ?? "",
      dateOfDeath: r.dateOfDeath?.slice(0, 10) ?? "", causeOfDeath: r.causeOfDeath,
      disposalMethod: r.disposalMethod, disposalOperator: r.disposalOperator ?? "",
      disposalRef: r.disposalRef ?? "", veterinaryAttended: r.veterinaryAttended,
      vetName: existingVet, postMortemCarriedOut: r.postMortemCarriedOut,
      postMortemFindings: r.postMortemFindings ?? "", bcmsNotified: r.bcmsNotified,
      bcmsNotificationRef: r.bcmsNotificationRef ?? "", notes: r.notes ?? "",
      invoiceStatus: r.invoiceStatus ?? "none", invoiceRef: r.invoiceRef ?? "",
      invoiceAmount: r.invoiceAmount ?? "", invoicePaidDate: r.invoicePaidDate ?? "",
      status: r.status ?? "reported",
    });
    setShowFullEdit(true);
  }

  function openNewRecord() {
    setEditRecord(null);
    setFullForm({ ...EMPTY_FULL, dateOfDeath: new Date().toISOString().slice(0, 10) });
    setUseOtherVet(false);
    setShowFullEdit(true);
  }

  function handleAnimalSelect(animalId: string) {
    const a = activeAnimals.find(x => String(x.id) === animalId);
    if (a) setFullForm(f => ({ ...f, animalId, tagNumber: a.earTagNumber ?? a.tagNumber ?? "", species: a.species, breed: a.breed ?? "" }));
  }

  function handleContractorSelect(contractorId: string) {
    if (contractorId === "__none__") { setFullForm(f => ({ ...f, contractorId: "", disposalOperator: "" })); return; }
    const c = activeContractors.find(x => String(x.id) === contractorId);
    if (c) setFullForm(f => ({ ...f, contractorId, disposalOperator: c.name }));
  }

  const createMut = useMutation({
    mutationFn: (body: typeof EMPTY_FULL) => fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["mortality", farmId] }); qc.invalidateQueries({ queryKey: ["animals", farmId] }); qc.invalidateQueries({ queryKey: ["notifications", farmId] }); setShowFullEdit(false); setFullForm(EMPTY_FULL); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const updateMut = useMutation({
    mutationFn: (body: typeof EMPTY_FULL & { id: number }) => fetch(`${base}/${body.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["mortality", farmId] }); qc.invalidateQueries({ queryKey: ["notifications", farmId] }); setEditRecord(null); setShowFullEdit(false); setFullForm(EMPTY_FULL); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`${base}/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["mortality", farmId] }); setDeleteId(null); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function handleFullSubmit(e: FormEvent) {
    e.preventDefault();
    if (!fullForm.animalId) return;
    if (editRecord) updateMut.mutate({ ...fullForm, id: editRecord.id });
    else createMut.mutate(fullForm);
  }

  const selectedContractor = activeContractors.find(c => String(c.id) === fullForm.contractorId);
  const selectedAnimal = activeAnimals.find(a => String(a.id) === fullForm.animalId) ?? null;

  const awaitingDisposal = records.filter(r => r.status === "reported").length;
  const awaitingCollection = records.filter(r => r.status === "disposal_arranged").length;
  const awaitingCloseOut = records.filter(r => r.status === "disposed").length;

  const [yearFilterMort, setYearFilterMort] = usePersistedFilter({ page: "livestock-mortality", filter: "year", farmId, defaultValue: "all", isValid: v => v === "all" || /^\d{4}$/.test(v) });
  const yearsMort = useMemo(() => Array.from(new Set(records.map(r => String(r.dateOfDeath ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [records]);

  const filtered = records.filter(r => {
    const matchesSearch =
      (r.tagNumber ?? "").toLowerCase().includes(search.toLowerCase()) ||
      r.species.toLowerCase().includes(search.toLowerCase()) ||
      r.causeOfDeath.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (yearFilterMort !== "all" && !String(r.dateOfDeath ?? "").startsWith(yearFilterMort)) return false;
    return true;
  });

  const STATUS_FILTER_TABS: { key: typeof statusFilter; label: string; count?: number }[] = [
    { key: "all", label: "All Records" },
    { key: "reported", label: "Awaiting Disposal", count: awaitingDisposal },
    { key: "disposal_arranged", label: "Disposal Arranged", count: awaitingCollection },
    { key: "disposed", label: "Collected", count: awaitingCloseOut },
    { key: "closed", label: "Closed" },
  ];

  return (
    <>
      {/* Alert banners */}
      {awaitingDisposal > 0 && (
        <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg mb-4 text-sm text-orange-800">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <strong>{awaitingDisposal} record{awaitingDisposal > 1 ? "s" : ""} awaiting disposal</strong> — arrange collection immediately.
            Cattle deaths must be notified to BCMS within 7 days.
          </div>
        </div>
      )}
      {awaitingCollection > 0 && (
        <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <strong>{awaitingCollection} record{awaitingCollection > 1 ? "s" : ""} awaiting contractor collection</strong> — log the disposal reference when the contractor collects.
        </div>
      )}
      {awaitingCloseOut > 0 && (
        <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4 text-sm text-blue-800">
          <FileText className="h-4 w-4 shrink-0 mt-0.5" />
          <strong>{awaitingCloseOut} collected record{awaitingCloseOut > 1 ? "s" : ""} awaiting close-out</strong> — record vet findings and invoice details to close.
        </div>
      )}

      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by tag, species or cause…" className="pl-9 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <Select value={yearFilterMort} onValueChange={setYearFilterMort}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {yearsMort.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={openNewRecord}>
            <Plus className="h-4 w-4 mr-1" /> Report Death
          </Button>
        </div>
      </div>

      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
        <strong>Legal requirement:</strong> Keep mortality records for a minimum of 3 years. Cattle deaths must be notified to BCMS within 7 days. Retain disposal certificates.
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-1 mb-4">
        {STATUS_FILTER_TABS.map(t => (
          <button key={t.key} onClick={() => setStatusFilter(t.key)}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all
              ${statusFilter === t.key ? "bg-primary text-primary-foreground border-primary" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}>
            {t.label}{t.count !== undefined && t.count > 0 ? ` (${t.count})` : ""}
          </button>
        ))}
      </div>

      {!isLoading && filtered.length > 0 && (() => {
        const bySp: Record<string, number> = {};
        filtered.forEach(r => { bySp[r.species] = (bySp[r.species] || 0) + 1; });
        const spRows = Object.entries(bySp).sort((a, b) => b[1] - a[1]);
        const totalCost = filtered.reduce((s: number, r: any) => s + (r.invoiceAmount ? parseFloat(String(r.invoiceAmount)) : 0), 0);
        return (
          <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 16px", minWidth: 120 }}>
              <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#b91c1c", letterSpacing: "0.06em", margin: "0 0 3px" }}>Deaths (filtered)</p>
              <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#7f1d1d", lineHeight: 1, margin: 0 }}>{filtered.length}</p>
            </div>
            {spRows.map(([sp, n]) => (
              <div key={sp} style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, padding: "10px 16px", minWidth: 100 }}>
                <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "capitalize", color: "#c2410c", letterSpacing: "0.06em", margin: "0 0 3px" }}>{sp}</p>
                <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#9a3412", lineHeight: 1, margin: 0 }}>{n}</p>
              </div>
            ))}
            {totalCost > 0 && (
              <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 16px", minWidth: 130 }}>
                <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#374151", letterSpacing: "0.06em", margin: "0 0 3px" }}>Disposal Cost</p>
                <p style={{ fontSize: "1.35rem", fontWeight: 800, color: "#111827", lineHeight: 1, margin: 0 }}>£{totalCost.toFixed(2)}</p>
              </div>
            )}
          </div>
        );
      })()}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-16 text-center">
          <AlertTriangle className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">{search || statusFilter !== "all" ? "No matching records found." : "No mortality records yet."}</p>
        </CardContent></Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tag / Species</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cause</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Next Action</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{formatDate(r.dateOfDeath)}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.tagNumber || <span className="text-muted-foreground italic">No tag</span>}</div>
                    <div className="text-xs text-muted-foreground capitalize">{r.species}{r.breed ? ` · ${r.breed}` : ""}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">{CAUSE_LABELS[r.causeOfDeath] ?? r.causeOfDeath}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status ?? "reported"} /></td>
                  <td className="px-4 py-3">
                    {r.status === "reported" && (
                      <Button size="sm" variant="outline" className="text-amber-700 border-amber-300 hover:bg-amber-50 h-7 text-xs" onClick={() => setArrangingDisposal(r)}>
                        Arrange Disposal <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                    {r.status === "disposal_arranged" && (
                      <Button size="sm" variant="outline" className="text-blue-700 border-blue-300 hover:bg-blue-50 h-7 text-xs" onClick={() => setLoggingCollection(r)}>
                        Log Collection <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                    {r.status === "disposed" && (
                      <Button size="sm" variant="outline" className="text-green-700 border-green-300 hover:bg-green-50 h-7 text-xs" onClick={() => setClosingRecord(r)}>
                        Close Record <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {(attachMap[r.id] ?? 0) > 0 && (
                        <span className="text-xs bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Paperclip className="w-3 h-3" />{attachMap[r.id]}
                        </span>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => setViewRecord(r)}><Eye className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => openFullEdit(r)}><Pencil className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteId(r.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Dialog */}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: 560 }}>
            <DialogHeader><DialogTitle>Mortality Record</DialogTitle></DialogHeader>
            <div className="space-y-4 text-sm py-2">
              <RecordStepper status={viewRecord.status ?? "reported"} />

              <div className="border rounded-lg p-3 space-y-2 bg-gray-50/60">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Stage 1 — Death Reported</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><p className="text-xs text-gray-400 mb-0.5">Date of Death</p><p>{formatDate(viewRecord.dateOfDeath)}</p></div>
                  <div><p className="text-xs text-gray-400 mb-0.5">Tag Number</p><p className="font-mono text-xs">{viewRecord.tagNumber || "—"}</p></div>
                  <div><p className="text-xs text-gray-400 mb-0.5">Species / Breed</p><p className="capitalize">{viewRecord.species}{viewRecord.breed ? ` — ${viewRecord.breed}` : ""}</p></div>
                  <div><p className="text-xs text-gray-400 mb-0.5">Cause of Death</p><p>{CAUSE_LABELS[viewRecord.causeOfDeath] ?? viewRecord.causeOfDeath}</p></div>
                  <div><p className="text-xs text-gray-400 mb-0.5">Planned Disposal</p><p>{DISPOSAL_LABELS[viewRecord.disposalMethod] ?? viewRecord.disposalMethod ?? "—"}</p></div>
                  {viewRecord.notes && <div className="col-span-2"><p className="text-xs text-gray-400 mb-0.5">Notes</p><p className="text-gray-700">{viewRecord.notes}</p></div>}
                </div>
              </div>

              {(["disposal_arranged", "disposed", "closed"] as string[]).includes(viewRecord.status) && (
                <div className="border rounded-lg p-3 space-y-2 bg-amber-50/40">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Stage 2 — Disposal Arranged</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><p className="text-xs text-gray-400 mb-0.5">Contractor</p><p>{viewRecord.contractorName || viewRecord.disposalOperator || "—"}</p></div>
                    {viewRecord.contractorApprovalNumber && <div><p className="text-xs text-gray-400 mb-0.5">APHA Approval No.</p><p className="font-mono text-xs">{viewRecord.contractorApprovalNumber}</p></div>}
                    <div><p className="text-xs text-gray-400 mb-0.5">BCMS Notified</p>
                      {viewRecord.bcmsNotified
                        ? <span className="inline-flex items-center gap-1 text-xs text-green-700"><CheckCircle2 className="w-3 h-3" /> Yes{viewRecord.bcmsNotificationRef ? ` — ${viewRecord.bcmsNotificationRef}` : ""}</span>
                        : <span className="inline-flex items-center gap-1 text-xs text-gray-400">Not notified</span>}
                    </div>
                  </div>
                </div>
              )}

              {(["disposed", "closed"] as string[]).includes(viewRecord.status) && (
                <div className="border rounded-lg p-3 space-y-2 bg-blue-50/40">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Stage 3 — Collected</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><p className="text-xs text-gray-400 mb-0.5">Disposal Reference</p><p className="font-mono text-xs">{viewRecord.disposalRef || "—"}</p></div>
                  </div>
                </div>
              )}

              {viewRecord.status === "closed" && (
                <div className="border rounded-lg p-3 space-y-2 bg-green-50/40">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Stage 4 — Closed</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><p className="text-xs text-gray-400 mb-0.5">Vet Attended</p><p>{viewRecord.veterinaryAttended ? (viewRecord.vetName || "Yes") : "No"}</p></div>
                    <div><p className="text-xs text-gray-400 mb-0.5">Post-mortem</p><p>{viewRecord.postMortemCarriedOut ? "Yes" : "No"}</p></div>
                    {viewRecord.postMortemFindings && <div className="col-span-2"><p className="text-xs text-gray-400 mb-0.5">PM Findings</p><p>{viewRecord.postMortemFindings}</p></div>}
                    {viewRecord.invoiceStatus !== "none" && <>
                      <div><p className="text-xs text-gray-400 mb-0.5">Invoice</p>
                        {viewRecord.invoiceStatus === "awaiting" && <span className="text-xs text-amber-700">Awaiting</span>}
                        {viewRecord.invoiceStatus === "received" && <span className="text-xs text-blue-700">Received</span>}
                        {viewRecord.invoiceStatus === "paid" && <span className="text-xs text-green-700">Paid</span>}
                      </div>
                      {viewRecord.invoiceRef && <div><p className="text-xs text-gray-400 mb-0.5">Invoice Ref</p><p className="font-mono text-xs">{viewRecord.invoiceRef}</p></div>}
                      {viewRecord.invoiceAmount && <div><p className="text-xs text-gray-400 mb-0.5">Amount</p><p>£{viewRecord.invoiceAmount}</p></div>}
                    </>}
                  </div>
                </div>
              )}

              <div className="border-t pt-3">
                <RecordAttachments farmId={farmId} recordType="mortality" recordId={viewRecord.id} />
              </div>
            </div>
            <DialogFooter>
              {viewRecord.status !== "closed" && (
                <Button variant="default" size="sm" onClick={() => {
                  if (viewRecord.status === "reported") { setArrangingDisposal(viewRecord); setViewRecord(null); }
                  else if (viewRecord.status === "disposal_arranged") { setLoggingCollection(viewRecord); setViewRecord(null); }
                  else if (viewRecord.status === "disposed") { setClosingRecord(viewRecord); setViewRecord(null); }
                }}>
                  {viewRecord.status === "reported" && <>Arrange Disposal <ArrowRight className="w-3.5 h-3.5 ml-1" /></>}
                  {viewRecord.status === "disposal_arranged" && <>Log Collection <ArrowRight className="w-3.5 h-3.5 ml-1" /></>}
                  {viewRecord.status === "disposed" && <>Close Record <ArrowRight className="w-3.5 h-3.5 ml-1" /></>}
                </Button>
              )}
              <Button variant="outline" onClick={() => { openFullEdit(viewRecord); setViewRecord(null); }}><Pencil className="w-3.5 h-3.5 mr-1" />Edit</Button>
              <Button variant="ghost" onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Full Edit / New Record Dialog */}
      {showFullEdit && (
        <Dialog open onOpenChange={o => { if (!o) { setShowFullEdit(false); setEditRecord(null); setUseOtherVet(false); createMut.reset(); updateMut.reset(); } }}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader>
              <DialogTitle>{editRecord ? "Edit Mortality Record" : "Report Animal Death"}</DialogTitle>
              <DialogDescription>Required for Red Tractor and BCMS compliance. Retain for 3 years.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleFullSubmit} className="space-y-4 mt-2 max-h-[75vh] overflow-y-auto pr-1">
              {/* Animal */}
              <div>
                <Label>Animal from Register <span className="text-red-500">*</span></Label>
                {activeAnimals.length === 0 ? (
                  <div className="mt-1 p-3 rounded-lg border border-amber-200 bg-amber-50 text-sm text-amber-800 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    No active animals registered. Add animals in the Individual Animals tab first.
                  </div>
                ) : (
                  <>
                    <Select value={fullForm.animalId || "__unset__"} onValueChange={handleAnimalSelect}>
                      <SelectTrigger className={!fullForm.animalId ? "border-red-300 mt-1" : "mt-1"}><SelectValue placeholder="Select registered animal…" /></SelectTrigger>
                      <SelectContent>
                        {activeAnimals.map(a => (
                          <SelectItem key={a.id} value={String(a.id)}>
                            {a.earTagNumber ?? a.tagNumber ?? `#${a.id}`} — {a.species}{a.breed ? ` (${a.breed})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedAnimal && <p className="text-xs text-green-700 mt-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Tag, species and breed auto-filled.</p>}
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><Label>Ear Tag / Tag Number</Label><Input value={fullForm.tagNumber} readOnly className="bg-muted/40 text-muted-foreground mt-1" placeholder="Auto-filled" /></div>
                <div><Label>Species</Label><Input value={fullForm.species} readOnly className="bg-muted/40 text-muted-foreground mt-1 capitalize" placeholder="Auto-filled" /></div>
                <div><Label>Breed</Label><Input value={fullForm.breed} readOnly className="bg-muted/40 text-muted-foreground mt-1" placeholder="Auto-filled" /></div>
                <div><Label>Date of Death *</Label><Input type="date" value={fullForm.dateOfDeath} onChange={e => setField("dateOfDeath", e.target.value)} required className="mt-1" /></div>
                <div><Label>Cause of Death *</Label>
                  <Select value={fullForm.causeOfDeath || undefined} onValueChange={v => setField("causeOfDeath", v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select cause" /></SelectTrigger>
                    <SelectContent>{Object.entries(CAUSE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Disposal Method *</Label>
                  <Select value={fullForm.disposalMethod || undefined} onValueChange={v => setField("disposalMethod", v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select method" /></SelectTrigger>
                    <SelectContent>{Object.entries(DISPOSAL_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label>Disposal Operator / Collector</Label>
                  {activeContractors.length > 0 ? (
                    <Select value={fullForm.contractorId || "__none__"} onValueChange={handleContractorSelect}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select registered contractor…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— Select contractor —</SelectItem>
                        {activeContractors.map(c => (
                          <SelectItem key={c.id} value={String(c.id)}>{c.name} ({CONTRACTOR_TYPES[c.operatorType] ?? c.operatorType})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={fullForm.disposalOperator} onChange={e => setField("disposalOperator", e.target.value)} className="mt-1" placeholder="Operator name" />
                  )}
                  {selectedContractor && (
                    <div className="mt-1.5 rounded bg-purple-50 border border-purple-100 px-3 py-2 text-xs text-purple-800 flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                      <span>APHA Approval No: <strong className="font-mono">{selectedContractor.approvalNumber}</strong></span>
                    </div>
                  )}
                </div>
                <div className="col-span-2"><Label>Disposal Reference / Certificate No.</Label><Input value={fullForm.disposalRef} onChange={e => setField("disposalRef", e.target.value)} className="mt-1" placeholder="NFAS certificate no. or collection note ref" /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={fullForm.veterinaryAttended} onChange={e => setField("veterinaryAttended", e.target.checked)} className="rounded" />
                  Veterinary attended
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={fullForm.postMortemCarriedOut} onChange={e => setField("postMortemCarriedOut", e.target.checked)} className="rounded" />
                  Post-mortem carried out
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={fullForm.bcmsNotified} onChange={e => setField("bcmsNotified", e.target.checked)} className="rounded" />
                  BCMS notified
                </label>
              </div>

              {fullForm.veterinaryAttended && (
                <div>
                  <Label>Attending Vet / Practice</Label>
                  {knownVets.length > 0 ? (
                    <>
                      <Select
                        value={(!useOtherVet && knownVets.find(v => v.value === fullForm.vetName)) ? fullForm.vetName : (useOtherVet ? "__other__" : "__none__")}
                        onValueChange={v => {
                          if (v === "__none__") { setUseOtherVet(false); setField("vetName", ""); }
                          else if (v === "__other__") { setUseOtherVet(true); setField("vetName", ""); }
                          else { setUseOtherVet(false); setField("vetName", v); }
                        }}
                      >
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select from your vet register…" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">— Select vet —</SelectItem>
                          {knownVets.map(v => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}
                          <SelectItem value="__other__">Other / manual entry…</SelectItem>
                        </SelectContent>
                      </Select>
                      {useOtherVet && <Input className="mt-2" value={fullForm.vetName} onChange={e => setField("vetName", e.target.value)} placeholder="e.g. Mr A. Jones BVSc — Shire Vets" />}
                    </>
                  ) : (
                    <Input value={fullForm.vetName} onChange={e => setField("vetName", e.target.value)} className="mt-1" placeholder="Vet name / practice" />
                  )}
                </div>
              )}
              {fullForm.postMortemCarriedOut && <div><Label>Post-mortem Findings</Label><Textarea value={fullForm.postMortemFindings} onChange={e => setField("postMortemFindings", e.target.value)} className="mt-1" rows={2} /></div>}
              {fullForm.bcmsNotified && <div><Label>BCMS Notification Reference</Label><Input value={fullForm.bcmsNotificationRef} onChange={e => setField("bcmsNotificationRef", e.target.value)} className="mt-1" placeholder="BCMS submission reference" /></div>}
              <div><Label>Notes</Label><Textarea value={fullForm.notes} onChange={e => setField("notes", e.target.value)} className="mt-1" rows={2} /></div>

              <div className="border rounded-lg p-3 bg-slate-50 space-y-3">
                <p className="text-sm font-medium text-gray-700">Collection Invoice</p>
                <div>
                  <Label className="text-xs">Invoice status</Label>
                  <Select value={fullForm.invoiceStatus} onValueChange={v => setField("invoiceStatus", v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No invoice expected</SelectItem>
                      <SelectItem value="awaiting">Awaiting invoice from collector</SelectItem>
                      <SelectItem value="received">Invoice received — payment pending</SelectItem>
                      <SelectItem value="paid">Invoice received and paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {fullForm.invoiceStatus !== "none" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-xs">Invoice reference</Label><Input className="mt-1" value={fullForm.invoiceRef} onChange={e => setField("invoiceRef", e.target.value)} placeholder="e.g. INV-2024-0041" /></div>
                    <div><Label className="text-xs">Amount (£)</Label><Input className="mt-1" value={fullForm.invoiceAmount} onChange={e => setField("invoiceAmount", e.target.value)} placeholder="e.g. 45.00" /></div>
                    {fullForm.invoiceStatus === "paid" && (
                      <div><Label className="text-xs">Date paid</Label><Input type="date" className="mt-1" value={fullForm.invoicePaidDate} onChange={e => setField("invoicePaidDate", e.target.value)} /></div>
                    )}
                  </div>
                )}
              </div>

              {editRecord && (
                <div className="border rounded-lg p-3 bg-slate-50">
                  <Label className="text-xs">Record Status</Label>
                  <Select value={fullForm.status} onValueChange={v => setField("status", v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-400 mt-1">Use the stage buttons in the table for normal workflow progression. Change status here only to correct an error.</p>
                </div>
              )}

              <DialogMutationError mutation={createMut} message="Failed to save — your entries are still here." />
              <DialogMutationError mutation={updateMut} message="Failed to save — your entries are still here." />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setShowFullEdit(false); setEditRecord(null); setUseOtherVet(false); }}>Cancel</Button>
                <Button type="submit" disabled={createMut.isPending || updateMut.isPending || !fullForm.animalId}>
                  {(createMut.isPending || updateMut.isPending) ? <><Loader2 className="animate-spin h-4 w-4 mr-1" /> Saving…</> : editRecord ? "Update Record" : "Save Record"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Stage dialogs */}
      {arrangingDisposal && (
        <ArrangeDisposalDialog farmId={farmId} record={arrangingDisposal} contractors={activeContractors} onClose={() => setArrangingDisposal(null)} />
      )}
      {loggingCollection && (
        <LogCollectionDialog farmId={farmId} record={loggingCollection} onClose={() => setLoggingCollection(null)} />
      )}
      {closingRecord && (
        <CloseRecordDialog farmId={farmId} record={closingRecord} vetOptions={knownVets} onClose={() => setClosingRecord(null)} />
      )}

      {/* Delete confirmation */}
      {deleteId !== null && (
        <Dialog open onOpenChange={o => { if (!o) { setDeleteId(null); deleteMut.reset(); } }}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Delete Mortality Record?</DialogTitle><DialogDescription>This cannot be undone.</DialogDescription></DialogHeader>
            <DialogMutationError mutation={deleteMut} message="Failed to delete — please try again." />
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deleteMut.mutate(deleteId!)} disabled={deleteMut.isPending}>
                {deleteMut.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
