import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import {
  Plus, Search, Loader2, Pencil, Trash2, AlertTriangle,
  CheckCircle2, FileText, Eye, Paperclip,
} from "lucide-react";

interface MortalityRecord {
  id: number;
  farmId: number;
  herdId: number | null;
  animalId: number | null;
  contractorId: number | null;
  contractorName: string | null;
  contractorApprovalNumber: string | null;
  tagNumber: string | null;
  species: string;
  breed: string | null;
  dateOfDeath: string;
  causeOfDeath: string;
  disposalMethod: string;
  disposalOperator: string | null;
  disposalRef: string | null;
  veterinaryAttended: boolean;
  vetName: string | null;
  postMortemCarriedOut: boolean;
  postMortemFindings: string | null;
  bcmsNotified: boolean;
  bcmsNotificationRef: string | null;
  notes: string | null;
  invoiceStatus: string;
  invoiceRef: string | null;
  invoiceAmount: string | null;
  invoicePaidDate: string | null;
  createdAt: string;
}

interface FallenStockContractor {
  id: number;
  farmId: number;
  name: string;
  approvalNumber: string;
  operatorType: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  isActive: boolean;
}

interface VetHealthPlan {
  id: number;
  farmId: number;
  planYear: number;
  vetName: string;
  practiceName: string | null;
  practicePhone: string | null;
  practiceAddress: string | null;
  planDate: string;
  reviewDate: string | null;
  healthPriorities: string | null;
  vaccinationProtocol: string | null;
  biosecurityMeasures: string | null;
  wormingProtocol: string | null;
  flukeTreatment: string | null;
  mastitisPrevention: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
}

interface Animal {
  id: number;
  farmId: number;
  herdId: number | null;
  tagNumber: string | null;
  earTagNumber: string | null;
  species: string;
  breed: string | null;
  status: string;
}

const CAUSE_LABELS: Record<string, string> = {
  disease: "Disease / Illness", injury: "Injury / Trauma", metabolic: "Metabolic Disorder",
  "difficult-birth": "Difficult Birth", hypothermia: "Hypothermia / Exposure",
  predation: "Predation", accidental: "Accidental", euthanised: "Euthanised",
  unknown: "Unknown / Sudden Death", other: "Other",
};

const DISPOSAL_LABELS: Record<string, string> = {
  nfas: "Fallen Stock (NFAS)", "hunt-kennel": "Hunt Kennel / Knacker",
  incineration: "Incineration / Cremation", "burial-licensed": "On-farm Burial",
  rendering: "Rendering Plant", other: "Other",
};

const CONTRACTOR_TYPES: Record<string, string> = {
  "nfas-collector": "NFAS Fallen Stock Collector",
  "hunt-kennel": "Hunt Kennel",
  "knacker": "Knacker / Slaughterer",
  "rendering": "Rendering Plant",
  "incinerator": "Licensed Incinerator",
  "other": "Other",
};

const EMPTY_MORTALITY = {
  animalId: "" as string,
  contractorId: "" as string,
  tagNumber: "", species: "", breed: "", dateOfDeath: new Date().toISOString().slice(0, 10),
  causeOfDeath: "", disposalMethod: "", disposalOperator: "", disposalRef: "",
  veterinaryAttended: false, vetName: "", postMortemCarriedOut: false, postMortemFindings: "",
  bcmsNotified: false, bcmsNotificationRef: "", notes: "",
  invoiceStatus: "none", invoiceRef: "", invoiceAmount: "", invoicePaidDate: "",
};

function formatDate(val: string | null | undefined): string {
  if (!val) return "—";
  try { return new Date(val).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return val; }
}

export function MortalitySection({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const base = `/api/farms/${farmId}/mortality-records`;
  const { data, isLoading } = useQuery<{ records: MortalityRecord[] }>({
    queryKey: ["mortality", farmId],
    queryFn: () => fetch(base).then(r => r.json()),
  });
  const records = data?.records ?? [];

  const { data: animalsForMortality } = useQuery<{ records: Animal[] }>({
    queryKey: ["animals", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/animals`).then(r => r.json()),
  });
  const animals: Animal[] = animalsForMortality?.records ?? [];
  const activeAnimals = animals.filter(a => a.status === "active");

  const { data: contractors = [] } = useQuery<FallenStockContractor[]>({
    queryKey: ["fallen-stock-contractors", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fallen-stock-contractors`).then(r => r.json()),
  });
  const activeContractors = Array.isArray(contractors) ? contractors.filter(c => c.isActive) : [];

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

  const { data: mortalityAttachCountsRaw = [] } = useQuery<Array<{ recordType: string; recordId: number; count: number }>>({
    queryKey: ["record-attachment-counts", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/record-attachments/counts`, { credentials: "include" }).then(r => r.json()),
    staleTime: 30000,
  });
  const mortalityAttachMap = Object.fromEntries(
    mortalityAttachCountsRaw.filter(c => c.recordType === "mortality").map(c => [c.recordId, c.count])
  );

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MortalityRecord | null>(null);
  const [viewMortality, setViewMortality] = useState<MortalityRecord | null>(null);
  const [form, setForm] = useState(EMPTY_MORTALITY);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [useOtherVet, setUseOtherVet] = useState(false);
  const [invoiceFilter, setInvoiceFilter] = useState<"all" | "awaiting" | "received" | "unpaid">("all");

  function setField(k: string, v: string | boolean) { setForm(f => ({ ...f, [k]: v })); }

  function handleAnimalSelect(animalId: string) {
    const a = activeAnimals.find(x => String(x.id) === animalId);
    if (a) {
      setForm(f => ({
        ...f,
        animalId,
        tagNumber: a.earTagNumber ?? a.tagNumber ?? "",
        species: a.species,
        breed: a.breed ?? "",
      }));
    }
  }

  function handleContractorSelect(contractorId: string) {
    if (contractorId === "__none__") { setForm(f => ({ ...f, contractorId: "", disposalOperator: "", disposalRef: "" })); return; }
    const c = activeContractors.find(x => String(x.id) === contractorId);
    if (c) setForm(f => ({ ...f, contractorId, disposalOperator: c.name, disposalRef: f.disposalRef || "" }));
  }

  const selectedContractor = activeContractors.find(c => String(c.id) === form.contractorId);

  const createMut = useMutation({
    mutationFn: (body: typeof EMPTY_MORTALITY) => fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mortality", farmId] });
      qc.invalidateQueries({ queryKey: ["animals", farmId] });
      setShowForm(false); setForm(EMPTY_MORTALITY); setUseOtherVet(false);
    },
  });
  const updateMut = useMutation({
    mutationFn: (body: typeof EMPTY_MORTALITY & { id: number }) => fetch(`${base}/${body.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["mortality", farmId] }); setEditing(null); setShowForm(false); setForm(EMPTY_MORTALITY); setUseOtherVet(false); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`${base}/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["mortality", farmId] }); setDeleteId(null); },
  });

  function openEdit(r: MortalityRecord) {
    setEditing(r);
    const existingVet = r.vetName ?? "";
    const isKnownVet = knownVets.some(v => v.value === existingVet);
    setUseOtherVet(existingVet !== "" && !isKnownVet);
    setForm({
      animalId: r.animalId ? String(r.animalId) : "",
      contractorId: r.contractorId ? String(r.contractorId) : "",
      tagNumber: r.tagNumber ?? "", species: r.species, breed: r.breed ?? "",
      dateOfDeath: r.dateOfDeath?.slice(0, 10) ?? "", causeOfDeath: r.causeOfDeath,
      disposalMethod: r.disposalMethod, disposalOperator: r.disposalOperator ?? "",
      disposalRef: r.disposalRef ?? "", veterinaryAttended: r.veterinaryAttended,
      vetName: existingVet, postMortemCarriedOut: r.postMortemCarriedOut,
      postMortemFindings: r.postMortemFindings ?? "", bcmsNotified: r.bcmsNotified,
      bcmsNotificationRef: r.bcmsNotificationRef ?? "", notes: r.notes ?? "",
      invoiceStatus: r.invoiceStatus ?? "none",
      invoiceRef: r.invoiceRef ?? "",
      invoiceAmount: r.invoiceAmount ?? "",
      invoicePaidDate: r.invoicePaidDate ?? "",
    });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.animalId) return;
    if (editing) updateMut.mutate({ ...form, id: editing.id });
    else createMut.mutate(form);
  }

  const selectedAnimal = activeAnimals.find(a => String(a.id) === form.animalId) ?? null;

  const filtered = records.filter(r => {
    const matchesSearch =
      (r.tagNumber ?? "").toLowerCase().includes(search.toLowerCase()) ||
      r.species.toLowerCase().includes(search.toLowerCase()) ||
      r.causeOfDeath.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (invoiceFilter === "awaiting") return r.invoiceStatus === "awaiting";
    if (invoiceFilter === "received") return r.invoiceStatus === "received";
    if (invoiceFilter === "unpaid") return r.invoiceStatus === "awaiting" || r.invoiceStatus === "received";
    return true;
  });

  return (
    <>
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by tag, species or cause…" className="pl-9 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button onClick={() => { setEditing(null); setForm(EMPTY_MORTALITY); setUseOtherVet(false); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add Record
        </Button>
      </div>

      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
        <strong>Legal requirement:</strong> Keep mortality records for a minimum of 3 years. Cattle deaths must be notified to BCMS within 7 days. Retain disposal certificates.
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-xs text-muted-foreground font-medium">Invoice filter:</span>
        {(["all", "unpaid", "awaiting", "received"] as const).map(f => {
          const labels: Record<string, string> = { all: "All records", unpaid: "Unpaid (awaiting + received)", awaiting: "Awaiting invoice", received: "Invoice received — unpaid" };
          const active = invoiceFilter === f;
          const colours: Record<string, string> = { all: "bg-gray-100 text-gray-700 border-gray-200", unpaid: "bg-orange-100 text-orange-700 border-orange-300", awaiting: "bg-amber-100 text-amber-700 border-amber-300", received: "bg-blue-100 text-blue-700 border-blue-300" };
          return (
            <button key={f} onClick={() => setInvoiceFilter(f)}
              className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${colours[f]} ${active ? "ring-2 ring-offset-1 ring-current" : "opacity-60 hover:opacity-100"}`}>
              {labels[f]}
            </button>
          );
        })}
        {invoiceFilter !== "all" && (
          <span className="text-xs text-muted-foreground ml-1">— {filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-16 text-center">
          <AlertTriangle className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">{search || invoiceFilter !== "all" ? "No matching records found." : "No mortality records yet."}</p>
        </CardContent></Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tag / Species</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cause</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Disposal</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Invoice</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">BCMS</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Vet</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{formatDate(r.dateOfDeath)}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.tagNumber || <span className="text-muted-foreground italic">No tag</span>}</div>
                    <div className="text-xs text-muted-foreground capitalize">{r.species}{r.breed ? ` · ${r.breed}` : ""}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">{CAUSE_LABELS[r.causeOfDeath] ?? r.causeOfDeath}</td>
                  <td className="px-4 py-3 text-xs">{DISPOSAL_LABELS[r.disposalMethod] ?? r.disposalMethod}</td>
                  <td className="px-4 py-3">
                    {r.invoiceStatus === "none" || !r.invoiceStatus
                      ? <span className="inline-flex items-center gap-1 text-xs text-gray-400 px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50">No invoice</span>
                      : r.invoiceStatus === "awaiting"
                        ? <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200"><AlertTriangle className="h-3 w-3" /> Awaiting</span>
                        : r.invoiceStatus === "received"
                          ? <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200"><FileText className="h-3 w-3" /> Received</span>
                          : <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200"><CheckCircle2 className="h-3 w-3" /> Paid</span>}
                    {r.invoiceRef && <div className="text-xs text-muted-foreground mt-0.5">{r.invoiceRef}</div>}
                  </td>
                  <td className="px-4 py-3">
                    {r.bcmsNotified
                      ? <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full"><CheckCircle2 className="h-3 w-3" /> Notified</span>
                      : <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full"><AlertTriangle className="h-3 w-3" /> Pending</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{r.veterinaryAttended ? r.vetName || "Yes" : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {(mortalityAttachMap[r.id] ?? 0) > 0 && (
                        <span className="text-xs bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Paperclip className="w-3 h-3" />{mortalityAttachMap[r.id]}
                        </span>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => setViewMortality(r)}><Eye className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteId(r.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewMortality && (
        <Dialog open onOpenChange={() => setViewMortality(null)}>
          <DialogContent style={{ maxWidth: 520 }}>
            <DialogHeader><DialogTitle>Mortality Record</DialogTitle></DialogHeader>
            <div className="space-y-3 text-sm py-2">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Date of Death</p><p>{formatDate(viewMortality.dateOfDeath)}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Tag Number</p><p className="font-mono text-xs">{viewMortality.tagNumber || "—"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Species</p><p className="capitalize">{viewMortality.species}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Breed</p><p>{viewMortality.breed || "—"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Cause of Death</p><p>{CAUSE_LABELS[viewMortality.causeOfDeath] ?? viewMortality.causeOfDeath}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Disposal Method</p><p>{DISPOSAL_LABELS[viewMortality.disposalMethod] ?? viewMortality.disposalMethod}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Disposal Operator</p><p>{viewMortality.disposalOperator || "—"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Disposal Ref</p><p className="font-mono text-xs">{viewMortality.disposalRef || "—"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">BCMS Notified</p><p>{viewMortality.bcmsNotified ? "Yes" : "Pending"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Vet Attended</p><p>{viewMortality.veterinaryAttended ? (viewMortality.vetName || "Yes") : "No"}</p></div>
              </div>
              {(() => {
                const s = viewMortality.invoiceStatus;
                if (s === "none" || !s) return null;
                return (
                  <div className="border rounded-lg p-3 bg-slate-50">
                    <p className="text-xs text-gray-500 uppercase font-medium mb-2">Collection Invoice</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Status</p>
                        {s === "awaiting" && <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200"><AlertTriangle className="h-3 w-3" /> Awaiting invoice</span>}
                        {s === "received" && <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200"><FileText className="h-3 w-3" /> Received — unpaid</span>}
                        {s === "paid" && <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200"><CheckCircle2 className="h-3 w-3" /> Paid</span>}
                      </div>
                      {viewMortality.invoiceRef && <div><p className="text-xs text-gray-400 mb-0.5">Invoice ref</p><p className="font-mono text-xs">{viewMortality.invoiceRef}</p></div>}
                      {viewMortality.invoiceAmount && <div><p className="text-xs text-gray-400 mb-0.5">Amount</p><p>£{viewMortality.invoiceAmount}</p></div>}
                      {viewMortality.invoicePaidDate && <div><p className="text-xs text-gray-400 mb-0.5">Date paid</p><p>{formatDate(viewMortality.invoicePaidDate)}</p></div>}
                    </div>
                  </div>
                );
              })()}
              {viewMortality.notes && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Notes</p><p className="text-gray-700 whitespace-pre-line">{viewMortality.notes}</p></div>}
              <div className="border-t pt-3">
                <RecordAttachments farmId={farmId} recordType="mortality" recordId={viewMortality.id} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewMortality); setViewMortality(null); }}><Pencil className="w-3.5 h-3.5 mr-1" />Edit</Button>
              <Button variant="ghost" onClick={() => setViewMortality(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showForm && (
        <Dialog open onOpenChange={o => { if (!o) { setShowForm(false); setEditing(null); setUseOtherVet(false); } }}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Mortality Record" : "Log Animal Mortality"}</DialogTitle>
              <DialogDescription>Required for Red Tractor and BCMS compliance. Retain for 3 years.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div>
                <Label>Animal from Register <span className="text-red-500">*</span></Label>
                {activeAnimals.length === 0 ? (
                  <div className="mt-1 p-3 rounded-lg border border-amber-200 bg-amber-50 text-sm text-amber-800 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>No active animals are registered on this farm. Go to the <strong>Individual Animals</strong> tab to register animals before logging mortality.</span>
                  </div>
                ) : (
                  <>
                    <Select value={form.animalId || "__unset__"} onValueChange={handleAnimalSelect}>
                      <SelectTrigger className={!form.animalId ? "border-red-300" : ""}><SelectValue placeholder="Select registered animal…" /></SelectTrigger>
                      <SelectContent>
                        {activeAnimals.map(a => (
                          <SelectItem key={a.id} value={String(a.id)}>
                            {a.earTagNumber ?? a.tagNumber ?? `#${a.id}`} — {a.species}{a.breed ? ` (${a.breed})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!form.animalId && <p className="text-xs text-red-600 mt-1">An animal from the register is required.</p>}
                    {selectedAnimal && <p className="text-xs text-green-700 mt-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> {selectedAnimal.earTagNumber ?? selectedAnimal.tagNumber} — tag, species and breed auto-filled from register</p>}
                  </>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <Label>Ear Tag / Tag Number</Label>
                  <Input value={form.tagNumber} readOnly className="bg-muted/40 text-muted-foreground" placeholder="Auto-filled from register" />
                </div>
                <div>
                  <Label>Species</Label>
                  <Input value={form.species} readOnly className="bg-muted/40 text-muted-foreground capitalize" placeholder="Auto-filled from register" />
                </div>
                <div>
                  <Label>Breed</Label>
                  <Input value={form.breed} readOnly className="bg-muted/40 text-muted-foreground" placeholder="Auto-filled from register" />
                </div>
                <div><Label>Date of Death *</Label><Input type="date" value={form.dateOfDeath} onChange={e => setField("dateOfDeath", e.target.value)} required /></div>
                <div><Label>Cause of Death *</Label>
                  <Select value={form.causeOfDeath || undefined} onValueChange={v => setField("causeOfDeath", v)}>
                    <SelectTrigger><SelectValue placeholder="Select cause" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(CAUSE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Disposal Method *</Label>
                  <Select value={form.disposalMethod || undefined} onValueChange={v => setField("disposalMethod", v)}>
                    <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(DISPOSAL_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label>Disposal Operator / Collector</Label>
                  {activeContractors.length > 0 ? (
                    <Select value={form.contractorId || "__none__"} onValueChange={handleContractorSelect}>
                      <SelectTrigger><SelectValue placeholder="Select registered contractor…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— Select contractor —</SelectItem>
                        {activeContractors.map(c => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name} <span className="text-gray-400">({CONTRACTOR_TYPES[c.operatorType] ?? c.operatorType})</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={form.disposalOperator} onChange={e => setField("disposalOperator", e.target.value)} placeholder="Operator name — add them in Fallen Stock Collectors tab" />
                  )}
                  {selectedContractor && (
                    <div className="mt-1.5 rounded bg-purple-50 border border-purple-100 px-3 py-2 text-xs text-purple-800 flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                      <span>APHA Approval No: <strong className="font-mono">{selectedContractor.approvalNumber}</strong></span>
                      {selectedContractor.phone && <span>· {selectedContractor.phone}</span>}
                    </div>
                  )}
                </div>

                <div className="col-span-2"><Label>Disposal Reference / Certificate No.</Label><Input value={form.disposalRef} onChange={e => setField("disposalRef", e.target.value)} placeholder="NFAS certificate no. or collection note ref" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.veterinaryAttended} onChange={e => setField("veterinaryAttended", e.target.checked)} className="rounded" />
                  Veterinary attended
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.postMortemCarriedOut} onChange={e => setField("postMortemCarriedOut", e.target.checked)} className="rounded" />
                  Post-mortem carried out
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.bcmsNotified} onChange={e => setField("bcmsNotified", e.target.checked)} className="rounded" />
                  BCMS notified
                </label>
              </div>
              {form.veterinaryAttended && (
                <div>
                  <Label>Attending Vet / Practice</Label>
                  {knownVets.length > 0 ? (
                    <>
                      <Select
                        value={(!useOtherVet && knownVets.find(v => v.value === form.vetName)) ? form.vetName : (useOtherVet ? "__other__" : "__none__")}
                        onValueChange={v => {
                          if (v === "__none__") { setUseOtherVet(false); setField("vetName", ""); }
                          else if (v === "__other__") { setUseOtherVet(true); setField("vetName", ""); }
                          else { setUseOtherVet(false); setField("vetName", v); }
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="Select from your vet register…" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">— Select vet —</SelectItem>
                          {knownVets.map(v => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}
                          <SelectItem value="__other__">Other / manual entry…</SelectItem>
                        </SelectContent>
                      </Select>
                      {useOtherVet && (
                        <Input className="mt-2" value={form.vetName} onChange={e => setField("vetName", e.target.value)} placeholder="e.g. Mr A. Jones BVSc — Shire Vets" autoFocus />
                      )}
                    </>
                  ) : (
                    <Input value={form.vetName} onChange={e => setField("vetName", e.target.value)} placeholder="e.g. Mr A. Jones BVSc — add vets in Vet Health Plans" />
                  )}
                </div>
              )}
              {form.postMortemCarriedOut && <div><Label>Post-mortem Findings</Label><Textarea value={form.postMortemFindings} onChange={e => setField("postMortemFindings", e.target.value)} placeholder="Summary of PM findings..." rows={2} /></div>}
              {form.bcmsNotified && <div><Label>BCMS Notification Reference</Label><Input value={form.bcmsNotificationRef} onChange={e => setField("bcmsNotificationRef", e.target.value)} placeholder="BCMS submission reference" /></div>}
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setField("notes", e.target.value)} placeholder="Additional circumstances or observations..." rows={2} /></div>

              <div className="border rounded-lg p-3 bg-slate-50 space-y-3">
                <p className="text-sm font-medium text-gray-700">Collection Invoice</p>
                <div>
                  <Label className="text-xs">Invoice status</Label>
                  <Select value={form.invoiceStatus} onValueChange={v => setField("invoiceStatus", v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No invoice expected</SelectItem>
                      <SelectItem value="awaiting">Awaiting invoice from collector</SelectItem>
                      <SelectItem value="received">Invoice received — payment pending</SelectItem>
                      <SelectItem value="paid">Invoice received and paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {form.invoiceStatus !== "none" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Invoice reference / number</Label>
                      <Input className="mt-1" value={form.invoiceRef} onChange={e => setField("invoiceRef", e.target.value)} placeholder="e.g. INV-2024-0041" />
                    </div>
                    <div>
                      <Label className="text-xs">Amount (£)</Label>
                      <Input className="mt-1" value={form.invoiceAmount} onChange={e => setField("invoiceAmount", e.target.value)} placeholder="e.g. 45.00" />
                    </div>
                    {form.invoiceStatus === "paid" && (
                      <div>
                        <Label className="text-xs">Date paid</Label>
                        <Input type="date" className="mt-1" value={form.invoicePaidDate} onChange={e => setField("invoicePaidDate", e.target.value)} />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); setUseOtherVet(false); }}>Cancel</Button>
                <Button type="submit" disabled={createMut.isPending || updateMut.isPending || !form.animalId}>
                  {(createMut.isPending || updateMut.isPending) ? <><Loader2 className="animate-spin h-4 w-4 mr-1" /> Saving…</> : editing ? "Update Record" : "Save Record"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {deleteId !== null && (
        <Dialog open onOpenChange={o => { if (!o) setDeleteId(null); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Delete Mortality Record?</DialogTitle><DialogDescription>This cannot be undone.</DialogDescription></DialogHeader>
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
