// @ts-nocheck
import { useState, useRef, useMemo, type ReactNode } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import { sanitiseCsvCell } from "@/lib/csv";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DocAttach } from "@/components/DocAttach";
import { openPrintWindow } from "@/lib/print-report";
import { Plus, Pencil, Trash2, Loader2, Home, Bird, BarChart3, Pill, SprayCan, Thermometer, FileText, ShieldCheck, Scissors, ClipboardList, ClipboardCheck, Star, Truck, UtensilsCrossed, FileDown, AlertTriangle, TrendingUp, LayoutDashboard, CheckCircle2, XCircle, Circle, Eye, Receipt, HardHat, Users, Package, X as XIcon, QrCode, Printer, ChevronDown, ChevronUp, Syringe, Activity, ArrowRightLeft, ShieldAlert, MapPin, Clock, Save } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useFarmMembers } from "@/hooks/use-farm-members";
import { useToast } from "@/hooks/use-toast";
import { StaffSelect } from "@/components/ui/staff-select";
import { ConfirmDialog as SharedConfirmDialog } from "@/components/ui/confirm-dialog";
import { BuyerCombobox } from "@/components/sales/BuyerCombobox";
import { apiUrl as api } from "@/lib/api";
import { fmt, fmtDate, exportCSV, StatCard, Empty, ConfirmDialog, DataTable, useCrud, HOUSE_TYPES, POULTRY_SPECIES, PRODUCTION_SYSTEMS, SPECIES_LABEL_MAP, SYSTEM_LABEL_MAP, fmtSpecies, fmtSystem, getStockingDensityInfo, useFlocks, FlockSelect, fmtFlock } from "./shared";
import type { DensityInfo } from "./shared";

export function TreatmentsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});

  const { data: rawRecords, isLoading } = useQuery({
    queryKey: ["poultry-treatments", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/poultry-treatments`), { credentials: "include" }).then(r => r.json()),
  });
  const records: Record<string, unknown>[] = Array.isArray(rawRecords) ? rawRecords : [];

  const { data: rawFlocks } = useQuery({
    queryKey: ["poultry-flocks", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/poultry-flocks`), { credentials: "include" }).then(r => r.json()),
  });
  const flocks: Record<string, unknown>[] = Array.isArray(rawFlocks) ? rawFlocks.map((r: { flock: Record<string, unknown>; houseName: string | null }) => ({ ...r.flock, houseName: r.houseName })) : [];

  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => {
      const url = editing ? api(`farms/${farmId}/poultry-treatments/${editing.id}`) : api(`farms/${farmId}/poultry-treatments`);
      const payload = { ...body };
      if (payload.flockId === "__none__" || payload.flockId === "") payload.flockId = null;
      else if (payload.flockId) payload.flockId = Number(payload.flockId);
      if (payload.durationDays === "") payload.durationDays = null; else if (payload.durationDays) payload.durationDays = Number(payload.durationDays);
      if (payload.withdrawalPeriodDays === "") payload.withdrawalPeriodDays = null; else if (payload.withdrawalPeriodDays) payload.withdrawalPeriodDays = Number(payload.withdrawalPeriodDays);
      if (payload.numberOfBirdsTreated === "") payload.numberOfBirdsTreated = null; else if (payload.numberOfBirdsTreated) payload.numberOfBirdsTreated = Number(payload.numberOfBirdsTreated);
      payload.prescriptionObtained = Boolean(payload.prescriptionObtained);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(payload) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["poultry-treatments", farmId] }); setOpen(false); setForm({}); setEditing(null); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/poultry-treatments/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["poultry-treatments", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function openAdd() { setEditing(null); setForm({ prescriptionObtained: false }); setOpen(true); }
  function openEdit(r: Record<string, unknown>) { setEditing(r); setForm({ ...r, flockId: r.flockId != null ? String(r.flockId) : "__none__" }); setOpen(true); }

  const todayStr = new Date().toISOString().split("T")[0];

  function handleWithdrawalDays(days: string) {
    setForm(f => {
      const updated = { ...f, withdrawalPeriodDays: days };
      const treatDate = f.treatmentDate as string | undefined;
      if (days && treatDate) {
        const clear = new Date(treatDate);
        clear.setDate(clear.getDate() + Number(days));
        updated.withdrawalClearDate = clear.toISOString().split("T")[0];
      }
      return updated;
    });
  }

  const [flockFilterTx, setFlockFilterTx] = useState("all");
  const [inWithdrawalOnly, setInWithdrawalOnly] = useState(false);
  const [yearFilterTx, setYearFilterTx] = useState("all");
  const yearsTx = useMemo(() => Array.from(new Set(records.map(r => String(r.treatmentDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [records]);
  const filteredTreatments = records.filter(r =>
    (flockFilterTx === "all" || String(r.flockId ?? "") === flockFilterTx) &&
    (!inWithdrawalOnly || (r.withdrawalClearDate && String(r.withdrawalClearDate) >= todayStr)) &&
    (yearFilterTx === "all" || String(r.treatmentDate ?? "").startsWith(yearFilterTx))
  );
  const inWithdrawal = records.filter(r => r.withdrawalClearDate && String(r.withdrawalClearDate) >= todayStr);
  const pomvCount = records.filter(r => r.prescriptionObtained).length;
  const medCounts: Record<string, number> = {};
  records.forEach(r => { if (r.productName) { const n = String(r.productName); medCounts[n] = (medCounts[n] ?? 0) + 1; } });
  const topMed = Object.entries(medCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  const tCsvCols = [
    { key: "treatmentDate", label: "Date", fmt: (r: Record<string, unknown>) => fmtDate(r.treatmentDate) },
    { key: "flockNumber", label: "Flock" }, { key: "houseName", label: "House" },
    { key: "productName", label: "Product" }, { key: "activeIngredient", label: "Active Ingredient" },
    { key: "condition", label: "Condition" }, { key: "routeOfAdministration", label: "Route" },
    { key: "doseRate", label: "Dose Rate" }, { key: "durationDays", label: "Duration (days)" },
    { key: "numberOfBirdsTreated", label: "Birds Treated" }, { key: "batchNumber", label: "Batch No." },
    { key: "withdrawalPeriodDays", label: "Withdrawal (days)" }, { key: "withdrawalClearDate", label: "Clear Date", fmt: (r: Record<string, unknown>) => fmtDate(r.withdrawalClearDate) },
    { key: "prescriptionObtained", label: "Rx Obtained", fmt: (r: Record<string, unknown>) => r.prescriptionObtained ? "Yes" : "No" },
    { key: "prescribingVetName", label: "Vet Name" }, { key: "prescribingVetPractice", label: "Vet Practice" },
    { key: "administeredBy", label: "Administered By" }, { key: "notes", label: "Notes" },
  ];

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg border border-blue-100 bg-blue-50 flex items-start gap-2">
        <Pill className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-800">Records required under <strong>Veterinary Medicines Regulations 2013</strong>. Retain for minimum 5 years. POM-V medicines must have a valid veterinary prescription — record the prescribing vet's details for every such treatment.</p>
      </div>
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h3 className="font-semibold text-sm">Medication & Treatment Records</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => exportCSV(filteredTreatments, "treatment-records.csv", tCsvCols)} disabled={!filteredTreatments.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Treatment</Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Select value={flockFilterTx} onValueChange={setFlockFilterTx}>
          <SelectTrigger className="w-44 h-8 text-xs"><SelectValue placeholder="All flocks" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All flocks</SelectItem>
            {flocks.map(f => <SelectItem key={String(f.id)} value={String(f.id)}>{String(f.flockNumber ?? f.id)}{f.houseName ? ` · ${f.houseName}` : ""}</SelectItem>)}
          </SelectContent>
        </Select>
        <button
          onClick={() => setInWithdrawalOnly(v => !v)}
          className={`h-8 px-3 text-xs rounded-md border font-medium transition-colors ${inWithdrawalOnly ? "bg-amber-100 border-amber-400 text-amber-800" : "bg-background border-input text-muted-foreground hover:text-foreground"}`}
        >
          {inWithdrawalOnly ? "⚠ In withdrawal only" : "In withdrawal only"}
        </button>
        <Select value={yearFilterTx} onValueChange={setYearFilterTx}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger><SelectContent><SelectItem value="all">All years</SelectItem>{yearsTx.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select>
      </div>
      {records.length > 0 && (
        <div className="space-y-3">
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-muted-foreground" /><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Treatment Summary</p></div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Total Records" value={records.length} />
              <StatCard label="In Withdrawal" value={inWithdrawal.length} color={inWithdrawal.length > 0 ? "amber" : "green"} sub={inWithdrawal.length > 0 ? "flocks cannot go to slaughter" : "all clear"} />
              <StatCard label="POM-V Treatments" value={pomvCount} sub="require vet prescription" />
              <StatCard label="Most Used Medicine" value={topMed.length > 20 ? topMed.slice(0, 18) + "…" : topMed} />
            </div>
          </div>
          {inWithdrawal.length > 0 && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 space-y-2">
              <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-600" /><p className="text-xs font-semibold text-amber-800">Active Withdrawal Periods — These flocks cannot be sent to slaughter yet</p></div>
              <div className="space-y-1">
                {inWithdrawal.map((r, i) => (
                  <div key={i} className="flex justify-between items-center text-xs bg-white rounded border border-amber-200 px-3 py-1.5">
                    <span className="font-medium">{r.flockNumber ? `Flock ${r.flockNumber}${r.houseName ? ` · ${r.houseName}` : ""}` : "—"}</span>
                    <span className="text-muted-foreground">{String(r.productName ?? "—")}</span>
                    <span className="text-amber-700 font-semibold">Clear: {fmtDate(r.withdrawalClearDate)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : filteredTreatments.length === 0 ? (
        <Empty msg={records.length === 0 ? "No treatment records yet. Log all medicines administered to your flocks, including over-the-counter and prescription products." : "No records match the current filters."} />
      ) : (
        <div className="space-y-2">
          {filteredTreatments.map((r, i) => {
            const isWithdrawal = r.withdrawalClearDate && String(r.withdrawalClearDate) >= todayStr;
            return (
              <div key={i} className={`border rounded-lg p-3 bg-white ${isWithdrawal ? "border-amber-300" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-sm">{String(r.productName ?? "—")}</span>
                      {!!r.flockNumber && <Badge variant="outline" className="text-xs">{String(r.flockNumber)}{r.houseName ? ` · ${r.houseName}` : ""}</Badge>}
                      {isWithdrawal && <Badge className="text-xs bg-amber-100 text-amber-800 border border-amber-300">⚠ Withdrawal until {fmtDate(r.withdrawalClearDate)}</Badge>}
                      {r.prescriptionObtained && <Badge className="text-xs bg-green-100 text-green-800 border border-green-200">Rx ✓</Badge>}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                      <span><span className="font-medium text-foreground/70">Date:</span> {fmtDate(r.treatmentDate)}</span>
                      <span><span className="font-medium text-foreground/70">Condition:</span> {String(r.condition ?? "—")}</span>
                      <span><span className="font-medium text-foreground/70">Route:</span> {String(r.routeOfAdministration ?? "—")}</span>
                      {!!r.numberOfBirdsTreated && <span><span className="font-medium text-foreground/70">Birds:</span> {String(r.numberOfBirdsTreated)}</span>}
                      {!!r.prescribingVetName && <span><span className="font-medium text-foreground/70">Vet:</span> {String(r.prescribingVetName)}</span>}
                      {!!r.withdrawalPeriodDays && <span><span className="font-medium text-foreground/70">Withdrawal:</span> {String(r.withdrawalPeriodDays)} days</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" onClick={() => setViewRecord(r)}><Eye className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => del.mutate(r.id as number)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                  </div>
                </div>
                <div className="mt-1.5 pt-1.5 border-t">
                  <DocAttach farmId={farmId} endpoint="poultry-treatments" recordId={r.id as number} documentPath={r.documentPath as string | null} documentName={r.documentName as string | null} queryKey={["poultry-treatments", farmId]} />
                </div>
              </div>
            );
          })}
        </div>
      )}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Treatment Record</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Product Name</p><p className="font-medium">{String(viewRecord.productName ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Treatment Date</p><p className="font-medium">{fmtDate(viewRecord.treatmentDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Condition</p><p className="font-medium">{String(viewRecord.condition ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Route</p><p className="font-medium">{String(viewRecord.routeOfAdministration ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Dosage</p><p className="font-medium">{String(viewRecord.doseRate ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Birds Treated</p><p className="font-medium">{String(viewRecord.numberOfBirdsTreated ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Prescribing Vet</p><p className="font-medium">{String(viewRecord.prescribingVetName ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Withdrawal Period</p><p className="font-medium">{String(viewRecord.withdrawalPeriodDays ?? "—")} days</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Clear Date</p><p className="font-medium">{fmtDate(viewRecord.withdrawalClearDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Prescription Obtained</p><p className="font-medium">{viewRecord.prescriptionObtained ? "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Batch Number</p><p className="font-medium">{String(viewRecord.batchNumber ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{String(viewRecord.notes ?? "—")}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent style={{ maxWidth: "44rem" }} className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Treatment Record" : "Record Medicine Treatment"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b pb-1">Treatment Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Treatment Date *</Label><Input type="date" value={String(form.treatmentDate ?? "")} onChange={e => setForm(f => ({ ...f, treatmentDate: e.target.value }))} /></div>
              <div><Label>Flock *</Label>
                <Select value={String(form.flockId ?? "__none__")} onValueChange={v => setForm(f => ({ ...f, flockId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select flock" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Select flock —</SelectItem>
                    {flocks.map((fl: Record<string, unknown>) => (
                      <SelectItem key={String(fl.id)} value={String(fl.id)}>
                        {String(fl.flockNumber ?? fl.id)}{fl.houseName ? ` — ${fl.houseName}` : ""}{fl.species ? ` (${fl.species})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Number of Birds Treated</Label><Input type="number" min="1" value={String(form.numberOfBirdsTreated ?? "")} onChange={e => setForm(f => ({ ...f, numberOfBirdsTreated: e.target.value }))} /></div>
              <div>
                <Label>Condition / Diagnosis *</Label>
                <Select value={String(form.condition ?? "__none__")} onValueChange={v => setForm(f => ({ ...f, condition: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Select condition —</SelectItem>
                    {[
                      "Coccidiosis",
                      "Necrotic Enteritis",
                      "Colibacillosis (E. coli)",
                      "Infectious Bronchitis (IB)",
                      "Newcastle Disease (ND)",
                      "Marek's Disease",
                      "Mycoplasma (MG / MS)",
                      "Gumboro Disease (IBD)",
                      "Infectious Laryngotracheitis (ILT)",
                      "Avian Metapneumovirus (aMPV / TRT)",
                      "Salmonella",
                      "Fowl Cholera (Pasteurella)",
                      "Clostridial Disease",
                      "Swollen Head Syndrome (SHS)",
                      "Respiratory Disease (general)",
                      "Egg Peritonitis / Salpingitis",
                      "External Parasites (Red Mite / Lice)",
                      "Internal Parasites",
                      "Bumblefoot",
                      "Nutritional Deficiency",
                      "Vaccination Reaction",
                      "Injury / Trauma",
                      "Other (specify in notes)",
                    ].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b pb-1">Medicine Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Product Name *</Label><Input placeholder="e.g. Tylan 200mg/ml, Baytril 100" value={String(form.productName ?? "")} onChange={e => setForm(f => ({ ...f, productName: e.target.value }))} /></div>
              <div>
                <Label>Active Ingredient</Label>
                <Select value={String(form.activeIngredient ?? "__none__")} onValueChange={v => setForm(f => ({ ...f, activeIngredient: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Select ingredient" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Select or leave blank —</SelectItem>
                    {[
                      "Amoxicillin",
                      "Amprolium",
                      "Colistin",
                      "Diclazuril",
                      "Doxycycline",
                      "Enrofloxacin",
                      "Erythromycin",
                      "Florfenicol",
                      "Flubendazole",
                      "Ivermectin",
                      "Lasalocid",
                      "Lincomycin",
                      "Maduramicin",
                      "Monensin",
                      "Narasin",
                      "Neomycin",
                      "Oxytetracycline",
                      "Permethrin",
                      "Robenidine",
                      "Salinomycin",
                      "Spectinomycin",
                      "Thiamphenicol",
                      "Toltrazuril",
                      "Trimethoprim / Sulfadiazine",
                      "Tylosin",
                      "Other (specify in notes)",
                    ].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Route of Administration *</Label>
                <Select value={String(form.routeOfAdministration ?? "__none__")} onValueChange={v => setForm(f => ({ ...f, routeOfAdministration: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Select —</SelectItem>
                    {["In-water medication", "In-feed medication", "Injection", "Spray", "Eye drops", "Topical", "Oral (individual)"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Dose Rate</Label><Input placeholder="e.g. 1ml per litre of water" value={String(form.doseRate ?? "")} onChange={e => setForm(f => ({ ...f, doseRate: e.target.value }))} /></div>
              <div><Label>Duration (days)</Label><Input type="number" min="1" value={String(form.durationDays ?? "")} onChange={e => setForm(f => ({ ...f, durationDays: e.target.value }))} /></div>
              <div><Label>Batch Number</Label><Input placeholder="From product label" value={String(form.batchNumber ?? "")} onChange={e => setForm(f => ({ ...f, batchNumber: e.target.value }))} /></div>
              <div><Label>Expiry Date</Label><Input type="date" value={String(form.expiryDate ?? "")} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} /></div>
              <div><Label>Administered By</Label><Input placeholder="Person who gave the treatment" value={String(form.administeredBy ?? "")} onChange={e => setForm(f => ({ ...f, administeredBy: e.target.value }))} /></div>
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b pb-1">Withdrawal Period</p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Withdrawal Period (days)</Label><Input type="number" min="0" value={String(form.withdrawalPeriodDays ?? "")} onChange={e => handleWithdrawalDays(e.target.value)} /></div>
              <div><Label>Withdrawal Clear Date</Label><Input type="date" value={String(form.withdrawalClearDate ?? "")} onChange={e => setForm(f => ({ ...f, withdrawalClearDate: e.target.value }))} /></div>
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b pb-1">Veterinary Prescription (VMR 2013)</p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Prescribing Vet Name</Label><Input placeholder="e.g. Dr. J. Bloggs" value={String(form.prescribingVetName ?? "")} onChange={e => setForm(f => ({ ...f, prescribingVetName: e.target.value }))} /></div>
              <div><Label>Vet Practice</Label><Input placeholder="e.g. Westway Vets" value={String(form.prescribingVetPractice ?? "")} onChange={e => setForm(f => ({ ...f, prescribingVetPractice: e.target.value }))} /></div>
              <div className="col-span-2 flex items-center gap-2 mt-1">
                <Checkbox id="rxObtained" checked={Boolean(form.prescriptionObtained)} onCheckedChange={v => setForm(f => ({ ...f, prescriptionObtained: Boolean(v) }))} />
                <Label htmlFor="rxObtained" className="font-normal cursor-pointer">Prescription obtained (required for POM-V medicines)</Label>
              </div>
            </div>

            <div><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending || !form.treatmentDate || !form.productName || !form.condition || !form.routeOfAdministration || !form.flockId || form.flockId === "__none__"}>Save Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

