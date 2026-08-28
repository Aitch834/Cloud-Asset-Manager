import React, { useState, useRef, useMemo } from "react";
import { canonicalHerdSpecies, herdSpeciesDisplayLabel, herdProductionSubtype } from "@/lib/herd-utils";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import { MortalitySection } from "./MortalitySection";
import { useLookupStrings } from "@/hooks/use-lookup";
import { useAppStore } from "@/hooks/use-app-store";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { usePersistedFilter } from "@/hooks/use-persisted-filter";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Redirect } from "wouter";
import { Plus, Search, Loader2, Pencil, Trash2, ClipboardList, Stethoscope, CheckCircle2, Printer, AlertTriangle, Package, Droplets, XCircle, FileText, Upload, Paperclip, QrCode, Eye, FlaskConical, ClipboardCheck, Clock, ListChecks, BookOpen, ChevronDown, ChevronUp, RotateCcw, FileDown, Truck, BarChart3, Syringe } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useUpload } from "@workspace/object-storage-web";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { printProReport, openPrintWindow, buildProReport } from "@/lib/print-report";
import { printBirthRecordReport } from "@/lib/birth-record-report";
import { useFarmReportMeta } from "@/hooks/use-farm-name";
import { LabSelector } from "@/components/ui/LabSelector";
import { useFarmMembers, memberFullName } from "@/hooks/use-farm-members";
import { StaffSelect } from "@/components/ui/staff-select";

import { formatDate, formatDateLong, ConfirmDialog, PRODUCTION_TYPE_OPTIONS, EMPTY_SIRE, EMPTY_STRAW, EMPTY_HERD, EMPTY_PLAN, EMPTY_ANIMAL, PrintHerdRegisterDialog, PrintVetPlanDialog, getHerdNumberConfig, getBreedPlaceholder, getHerdNamePlaceholder, ANIMAL_SPECIES_FALLBACK, ANIMAL_STATUS_LABELS, MOVEMENT_TYPE_LABELS, OUTCOME_COLOURS, DOC_TYPE_LABELS } from "./shared";
import type { Farm, Herd, VetHealthPlan, VetHealthPlanActionCompletion, VetHealthPlanAction, MortalityRecord, FallenStockContractor, FeedRecord, WaterRecord, Animal, Sire, StrawInventory, AnimalDoc, VaccHistoryRecord, AnimalProfile } from "./shared";


// ─── Lambing Records ──────────────────────────────────────────────────────────

interface LambingRecord {
  id: number;
  herdId?: number | null;
  eweAnimalId?: number | null;
  eweEarTag?: string | null;
  lambingDate: string;
  expectedLambingDate?: string | null;
  lambingEaseScore?: number | null;
  expectedLitterSize?: number | null;
  numberOfLambs: number;
  lambOutcome1?: string | null; lambSex1?: string | null; lambEarTag1?: string | null; lambEidNumber1?: string | null; lambBirthWeightKg1?: string | null; lambAnimalId1?: number | null;
  lambOutcome2?: string | null; lambSex2?: string | null; lambEarTag2?: string | null; lambEidNumber2?: string | null; lambBirthWeightKg2?: string | null; lambAnimalId2?: number | null;
  lambOutcome3?: string | null; lambSex3?: string | null; lambEarTag3?: string | null; lambEidNumber3?: string | null; lambBirthWeightKg3?: string | null; lambAnimalId3?: number | null;
  lambOutcome4?: string | null; lambSex4?: string | null; lambEarTag4?: string | null; lambEidNumber4?: string | null; lambBirthWeightKg4?: string | null; lambAnimalId4?: number | null;
  assistanceRequired: boolean; assistanceType?: string | null;
  vetAttended: boolean; vetName?: string | null;
  colostrumGivenWithin2Hours?: boolean | null; colostrumSource?: string | null;
  fosteringRequired: boolean; fosteringDetails?: string | null;
  ramEarTag?: string | null; ramBreed?: string | null; sireRegisterId?: number | null; conceptionMethod?: string | null;
  eweComplications?: string | null; notes?: string | null;
  perinatalDisposalContractorId?: number | null;
  perinatalCollectionDate?: string | null;
  perinatalCollectionRef?: string | null;
  perinatalDisposalMethod?: string | null;
  perinatalDisposalNotes?: string | null;
}

function LambingEaseBadge({ v }: { v?: number | null }) {
  if (!v) return null;
  const map: Record<number, { label: string; cls: string }> = {
    1: { label: "Ease 1 — Unassisted", cls: "bg-green-100 text-green-700" },
    2: { label: "Ease 2 — Easy assist", cls: "bg-yellow-100 text-yellow-700" },
    3: { label: "Ease 3 — Hard assist", cls: "bg-orange-100 text-orange-700" },
    4: { label: "Ease 4 — Vet required", cls: "bg-red-100 text-red-700" },
  };
  const d = map[v];
  if (!d) return null;
  return <span className={`text-xs px-2 py-0.5 rounded font-medium ${d.cls}`}>{d.label}</span>;
}

// LambSection extracted to avoid component-inside-component anti-pattern (prevents focus loss on type)
function LambSection({ n, form, set }: {
  n: 1 | 2 | 3 | 4;
  form: Partial<LambingRecord>;
  set: <K extends keyof LambingRecord>(k: K, v: unknown) => void;
}) {
  const outcomeKey = `lambOutcome${n}` as keyof LambingRecord;
  const sexKey = `lambSex${n}` as keyof LambingRecord;
  const tagKey = `lambEarTag${n}` as keyof LambingRecord;
  const eidKey = `lambEidNumber${n}` as keyof LambingRecord;
  const weightKey = `lambBirthWeightKg${n}` as keyof LambingRecord;
  const animalIdKey = `lambAnimalId${n}` as keyof LambingRecord;
  const outcome = form[outcomeKey] as string | undefined;
  const earTag = form[tagKey] as string | undefined;
  const animalId = form[animalIdKey] as number | undefined;
  const showHint = outcome === "live" && earTag?.trim();
  return (
    <div className="rounded border p-3 space-y-2 bg-gray-50/50">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Lamb {n}</p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Outcome</Label>
          <Select value={(form[outcomeKey] as string) || "__none__"} onValueChange={v => set(outcomeKey, v === "__none__" ? null : v)}>
            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Not recorded</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="stillborn">Stillborn</SelectItem>
              <SelectItem value="died-within-24h">Died within 24h</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Sex</Label>
          <Select value={(form[sexKey] as string) || "__none__"} onValueChange={v => set(sexKey, v === "__none__" ? null : v)}>
            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Not recorded</SelectItem>
              <SelectItem value="male">Male (ram lamb)</SelectItem>
              <SelectItem value="female">Female (ewe lamb)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Ear Tag</Label>
          <Input value={(form[tagKey] as string) || ""} onChange={e => set(tagKey, e.target.value)} placeholder="e.g. UK0141092 0200" />
          {showHint && !animalId && <p className="text-xs text-teal-600 mt-1">Live lamb — will be registered in Livestock on save.</p>}
          {animalId && <p className="text-xs text-teal-600 mt-1">Already in Flock Register (ID #{animalId}) ✓</p>}
        </div>
        <div>
          <Label>EID / Transponder</Label>
          <Input value={(form[eidKey] as string) || ""} onChange={e => set(eidKey, e.target.value)} placeholder="15-digit ISO 11784 EID" />
        </div>
      </div>
      <div>
        <Label>Birth Weight (kg)</Label>
        <Input type="number" step="0.1" min="0" value={(form[weightKey] as string) || ""} onChange={e => set(weightKey, e.target.value || null)} placeholder="e.g. 4.2" className="w-32" />
      </div>
    </div>
  );
}

export function LambingSection({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const farmMeta = useFarmReportMeta(farmId);
  const todayStr = () => new Date().toISOString().slice(0, 10);
  const EMPTY: Partial<LambingRecord> = { numberOfLambs: 1, lambingDate: todayStr(), assistanceRequired: false, vetAttended: false, fosteringRequired: false };

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LambingRecord | null>(null);
  const [viewRecord, setViewRecord] = useState<LambingRecord | null>(null);
  const [form, setForm] = useState<Partial<LambingRecord>>(EMPTY);
  const [showManualEwe, setShowManualEwe] = useState(false);
  const [showManualVet, setShowManualVet] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const CURRENT_YEAR = new Date().getFullYear();
  const [yearFilter, setYearFilter] = usePersistedFilter({ page: "livestock-lambing", filter: "year", farmId, defaultValue: String(CURRENT_YEAR), isValid: v => v === "all" || /^\d{4}$/.test(v) });

  const printBirthRecord = (record: LambingRecord) => {
    const offspring = Array.from({ length: Math.max(1, record.numberOfLambs ?? 1) }, (_, index) => {
      const n = index + 1;
      const get = (field: string) => record[`${field}${n}` as keyof LambingRecord] as string | number | null | undefined;
      return {
        label: `Lamb ${n}`,
        outcome: get("lambOutcome"),
        sex: get("lambSex"),
        tag: get("lambEarTag"),
        eid: get("lambEidNumber"),
        animalId: get("lambAnimalId"),
        weightKg: get("lambBirthWeightKg"),
        colostrum: record.colostrumGivenWithin2Hours == null ? null : record.colostrumGivenWithin2Hours ? "Within 2 hours" : "Not within 2 hours",
      };
    });
    const contractor = contractors.find(candidate => candidate.id === record.perinatalDisposalContractorId);
    printBirthRecordReport({
      species: "sheep",
      recordId: record.id,
      ...farmMeta,
      birthDate: record.lambingDate,
      damLabel: record.eweEarTag,
      damId: record.eweAnimalId,
      offspring,
      sire: record.ramEarTag ?? record.sireRegisterId,
      sireBreed: record.ramBreed,
      conceptionMethod: record.conceptionMethod,
      ease: record.lambingEaseScore,
      assistance: record.assistanceRequired,
      assistanceType: record.assistanceType,
      vet: record.vetAttended ? record.vetName || "Veterinary attendance recorded" : "No veterinary attendance recorded",
      complications: record.eweComplications,
      colostrumWithin2Hours: record.colostrumGivenWithin2Hours,
      colostrumSource: record.colostrumSource,
      fostering: record.fosteringRequired ? record.fosteringDetails || "Required" : "No",
      registration: offspring.some(child => child.eid) ? "EID details recorded in offspring table" : null,
      perinatalDisposal: [contractor ? `${contractor.name} (${contractor.approvalNumber})` : null, record.perinatalCollectionDate, record.perinatalCollectionRef, record.perinatalDisposalMethod, record.perinatalDisposalNotes].filter(Boolean).join(" · ") || null,
      notes: record.notes,
      attachmentCount: lambingAttachMap[record.id] ?? 0,
    });
  };

  const { data, isLoading } = useQuery<{ records: LambingRecord[] }>({
    queryKey: ["lambing-records", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/lambing-records`, { credentials: "include" }).then(r => r.json()),
  });

  const animalsQ = useQuery<{ records: Array<{ id: number; earTagNumber?: string | null; eidNumber?: string | null; species: string; sex?: string | null; status: string }> }>({
    queryKey: ["lambing-animals", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/animals`, { credentials: "include" }).then(r => r.json()),
    enabled: open,
  });
  const SHEEP_SPECIES = ["sheep", "ovine"];
  const ewes = (animalsQ.data?.records ?? []).filter(a => SHEEP_SPECIES.includes(a.species?.toLowerCase()) && a.status === "active" && a.earTagNumber);

  const siresQ = useQuery<{ records: Array<{ id: number; name: string; breed?: string | null; tagNumber?: string | null; species: string; isActive?: boolean | null }> }>({
    queryKey: ["lambing-sires", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/sires`, { credentials: "include" }).then(r => r.json()),
    enabled: open,
  });
  const ramSires = (siresQ.data?.records ?? []).filter(s => s.isActive !== false && ["sheep", "ovine"].includes(s.species?.toLowerCase()));

  const vetVisitsQ = useQuery<{ records: Array<{ id: number; vetName: string; vetPractice?: string | null }> }>({
    queryKey: ["lambing-vet-visits", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/vet-visits`, { credentials: "include" }).then(r => r.json()),
    enabled: open && !!form.vetAttended,
  });
  const uniqueVetNames = [...new Set((vetVisitsQ.data?.records ?? []).map(v => v.vetName).filter(Boolean))] as string[];
  const vetPracticeMap = Object.fromEntries(
    (vetVisitsQ.data?.records ?? []).filter(v => v.vetName && v.vetPractice).map(v => [v.vetName, v.vetPractice])
  );

  const { data: attachCountsRaw = [] } = useQuery<Array<{recordType: string; recordId: number; count: number}>>({
    queryKey: ["record-attachment-counts", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/record-attachments/counts`, { credentials: "include" }).then(r => r.json()),
    staleTime: 30000,
  });
  const lambingAttachMap = Object.fromEntries(attachCountsRaw.filter(c => c.recordType === "lambing").map(c => [c.recordId, c.count]));

  const contractorsQ = useQuery<Array<{ id: number; name: string; approvalNumber: string; operatorType: string; phone?: string | null }>>({
    queryKey: ["fallen-stock-contractors", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fallen-stock-contractors`, { credentials: "include" }).then(r => r.json()),
  });
  const contractors = contractorsQ.data ?? [];

  const save = useMutation({
    mutationFn: (body: Partial<LambingRecord>) => {
      const url = editing ? `/api/farms/${farmId}/lambing-records/${editing.id}` : `/api/farms/${farmId}/lambing-records`;
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["lambing-records", farmId] }); closeDialog(); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/lambing-records/${id}`, { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["lambing-records", farmId] }); setConfirmDelete(null); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function closeDialog() { setOpen(false); setEditing(null); setForm(EMPTY); setShowManualEwe(false); setShowManualVet(false); save.reset(); }
  function openAdd() { setEditing(null); setForm({ ...EMPTY, lambingDate: todayStr() }); setShowManualEwe(false); setShowManualVet(false); setOpen(true); }
  function openEdit(r: LambingRecord) {
    setEditing(r);
    setForm({ ...r, lambingDate: r.lambingDate?.slice(0, 10) ?? "" });
    setShowManualEwe(!r.eweAnimalId && !!r.eweEarTag);
    setShowManualVet(!!r.vetAttended && !!r.vetName);
    setOpen(true);
  }
  function set<K extends keyof LambingRecord>(k: K, v: unknown) { setForm(f => ({ ...f, [k]: v })); }

  const numLambs = form.numberOfLambs ?? 1;
  const hasDeadLambs = [form.lambOutcome1, form.lambOutcome2, form.lambOutcome3, form.lambOutcome4]
    .slice(0, numLambs)
    .some(o => o === "stillborn" || o === "died-within-24h");

  const allRecords = data?.records ?? [];
  const records = yearFilter === "all" ? allRecords : allRecords.filter(r => r.lambingDate?.startsWith(yearFilter));
  const availableYears = [...new Set(allRecords.map(r => r.lambingDate?.slice(0, 4)).filter(Boolean))].sort((a, b) => Number(b) - Number(a)) as string[];
  if (!availableYears.includes(String(CURRENT_YEAR))) availableYears.unshift(String(CURRENT_YEAR));

  function lambSeasonStats(recs: LambingRecord[]) {
    const totalBorn = recs.reduce((s, r) => s + (r.numberOfLambs ?? 0), 0);
    const allOutcomes = recs.flatMap(r => [r.lambOutcome1, r.lambOutcome2, r.lambOutcome3, r.lambOutcome4].filter(Boolean));
    const stillborns = allOutcomes.filter(o => o === "stillborn").length;
    const died24h = allOutcomes.filter(o => o === "died-within-24h").length;
    const perinatal = stillborns + died24h;
    const pct = (n: number) => totalBorn > 0 ? ((n / totalBorn) * 100).toFixed(1) : "—";
    return { ewes: recs.length, totalBorn, stillborns, died24h, perinatal, pct };
  }
  const currentStats = lambSeasonStats(records);
  const yearlyStats = availableYears.map(y => ({ year: y, ...lambSeasonStats(allRecords.filter(r => r.lambingDate?.startsWith(y))) }));

  function generateLambingReport() {
    const printedDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const fmtD = (v: unknown) => v ? new Date(v as string).toLocaleDateString("en-GB") : "—";
    const fv2 = (v: unknown) => (v === null || v === undefined || v === "") ? "—" : String(v);
    const easeLabel = (n?: number | null) => n ? ["", "1 — Unassisted", "2 — Easy assist", "3 — Hard assist", "4 — Vet/caesarean"][n] ?? String(n) : "—";
    const yesNo = (v: boolean | null | undefined) => v === true ? "Yes" : v === false ? "No" : "—";
    const litterLabel = (n?: number | null) => n === 1 ? "Single" : n === 2 ? "Twins" : n === 3 ? "Triplets" : n === 4 ? "Quads" : fv2(n);

    const rptStats = lambSeasonStats(records);
    const summaryRows = yearlyStats.map(s =>
      `<tr><td>${s.year}</td><td>${s.ewes}</td><td>${s.totalBorn}</td><td>${s.stillborns} (${s.pct(s.stillborns)}%)</td><td>${s.died24h} (${s.pct(s.died24h)}%)</td><td style="font-weight:700">${s.perinatal} (${s.pct(s.perinatal)}%)</td></tr>`
    ).join("");

    const tableRows = records.map(r => {
      const outcomes = [
        r.lambOutcome1 ? `${r.lambOutcome1} (${r.lambSex1 ?? "?"}) ${r.lambEarTag1 ? `[${r.lambEarTag1}]` : ""}` : null,
        r.lambOutcome2 ? `${r.lambOutcome2} (${r.lambSex2 ?? "?"}) ${r.lambEarTag2 ? `[${r.lambEarTag2}]` : ""}` : null,
        r.lambOutcome3 ? `${r.lambOutcome3} (${r.lambSex3 ?? "?"}) ${r.lambEarTag3 ? `[${r.lambEarTag3}]` : ""}` : null,
        r.lambOutcome4 ? `${r.lambOutcome4} (${r.lambSex4 ?? "?"}) ${r.lambEarTag4 ? `[${r.lambEarTag4}]` : ""}` : null,
      ].filter(Boolean).join("; ");
      const liveCount = [r.lambOutcome1, r.lambOutcome2, r.lambOutcome3, r.lambOutcome4].filter(o => o === "live").length;
      const deadCount = [r.lambOutcome1, r.lambOutcome2, r.lambOutcome3, r.lambOutcome4].filter(o => o === "stillborn" || o === "died-within-24h").length;
      const disposalCell = r.perinatalCollectionDate || r.perinatalCollectionRef || r.perinatalDisposalMethod
        ? `${r.perinatalCollectionDate ? fmtD(r.perinatalCollectionDate) : "—"} · ${fv2(r.perinatalCollectionRef)} · ${fv2(r.perinatalDisposalMethod)}`
        : (deadCount > 0 ? "<span style='color:#b91c1c'>DISPOSAL NOT RECORDED</span>" : "—");
      return `<tr>
        <td>${fmtD(r.lambingDate)}</td>
        <td>${fv2(r.eweEarTag)}</td>
        <td>${easeLabel(r.lambingEaseScore)}</td>
        <td>${litterLabel(r.numberOfLambs)}</td>
        <td style="font-size:9px">${outcomes || "—"}</td>
        <td>${liveCount} live${deadCount ? ` / ${deadCount} dead` : ""}</td>
        <td>${yesNo(r.colostrumGivenWithin2Hours)}</td>
        <td>${yesNo(r.assistanceRequired)}</td>
        <td>${yesNo(r.vetAttended)}</td>
        <td>${r.fosteringRequired ? `Yes — ${fv2(r.fosteringDetails).slice(0, 40)}` : "No"}</td>
        <td style="font-size:9px">${disposalCell}</td>
      </tr>`;
    }).join("");

    const html = `<!DOCTYPE html><html><head><title>Lambing Records — Red Tractor Sheep Assurance</title>
<style>
  body{font-family:Arial,sans-serif;font-size:10px;color:#000;margin:0;padding:20px}
  h1{font-size:14px;margin:0 0 2px}h2{font-size:11px;margin:0 0 12px;color:#555}
  h3{font-size:11px;margin:14px 0 6px;border-bottom:1px solid #e5e7eb;padding-bottom:4px}
  .hdr{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:10px;margin-bottom:14px}
  .hdr-r{text-align:right;font-size:9px;color:#555;line-height:1.8}
  .stat-row{display:flex;gap:16px;margin-bottom:14px}
  .stat{background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:8px 12px;flex:1;text-align:center}
  .stat-n{font-size:18px;font-weight:700;color:#111}
  .stat-l{font-size:9px;color:#555;margin-top:2px}
  table{width:100%;border-collapse:collapse;margin-bottom:16px}
  th{background:#f9fafb;font-weight:700;font-size:9px;text-transform:uppercase;letter-spacing:.05em;padding:5px 6px;border:1px solid #e5e7eb;text-align:left}
  td{padding:4px 6px;border:1px solid #e5e7eb;vertical-align:top;font-size:10px}
  tr:nth-child(even) td{background:#fafafa}
  .note{font-size:8px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}
  @media print{@page{margin:1.5cm;size:landscape}}
</style></head><body>
<div class="hdr">
  <div><h1>Lambing Records</h1><h2>Red Tractor Sheep Assurance — Compliance Report</h2></div>
  <div class="hdr-r"><b>${records.length} record${records.length !== 1 ? "s" : ""}</b><br>Season: ${yearFilter === "all" ? "All years" : yearFilter}<br>Printed: ${printedDate}</div>
</div>
<div class="stat-row">
  <div class="stat"><div class="stat-n">${rptStats.ewes}</div><div class="stat-l">Ewes Lambed</div></div>
  <div class="stat"><div class="stat-n">${rptStats.totalBorn}</div><div class="stat-l">Total Lambs Born</div></div>
  <div class="stat"><div class="stat-n">${rptStats.stillborns} (${rptStats.pct(rptStats.stillborns)}%)</div><div class="stat-l">Stillborn</div></div>
  <div class="stat"><div class="stat-n">${rptStats.died24h} (${rptStats.pct(rptStats.died24h)}%)</div><div class="stat-l">Died Within 24h</div></div>
  <div class="stat" style="border-color:#fca5a5;background:#fff1f2"><div class="stat-n" style="color:#b91c1c">${rptStats.perinatal} (${rptStats.pct(rptStats.perinatal)}%)</div><div class="stat-l">Perinatal Loss</div></div>
</div>
${yearlyStats.length > 1 ? `<h3>Season-by-Season Perinatal Mortality Trend</h3>
<table style="margin-bottom:16px">
  <thead><tr><th>Season</th><th>Ewes Lambed</th><th>Total Born</th><th>Stillborn</th><th>Died &lt;24h</th><th>Perinatal Loss</th></tr></thead>
  <tbody>${summaryRows}</tbody>
</table>` : ""}
<h3>Individual Lambing Records${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h3>
<table>
  <thead><tr>
    <th>Date</th><th>Ewe Tag</th><th>Ease Score</th><th>Litter</th><th>Lamb Outcomes / Tags</th>
    <th>Alive/Dead</th><th>Colostrum ≤2h</th><th>Assisted</th><th>Vet</th><th>Fostering</th><th>Disposal (date · ref · method)</th>
  </tr></thead>
  <tbody>${tableRows}</tbody>
</table>
<p class="note">Animal By-Products (Enforcement) (England) Regulations 2011: all perinatal deaths (stillborn and died within 24h) must be disposed of via an authorised route and the consignment note retained. Red Tractor Sheep Assurance: lambing performance and mortality records must be retained for a minimum of 3 years and made available at audit. Printed: ${printedDate}</p>
</body></html>`;
    openPrintWindow(html);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4 gap-3">
        <div>
          <p className="text-sm text-gray-500 mb-1">Lambing records including ease score, up to 4 lambs, colostrum, fostering, and automatic registration of live lambs in the flock register.</p>
          <p className="text-xs text-gray-400">Red Tractor Sheep Assurance: lambing performance must be recorded and available at audit.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {availableYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              <SelectItem value="all">All years</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={generateLambingReport}><FileDown className="h-4 w-4 mr-1" />Audit Report</Button>
          <Button onClick={openAdd} size="sm"><Plus className="h-4 w-4 mr-1" />Add Lambing</Button>
        </div>
      </div>
      {/* Season statistics panel */}
      {allRecords.length > 0 && (
        <div className="mb-4">
          <div className="grid grid-cols-5 gap-2 mb-3">
            {[
              { label: "Ewes Lambed", value: String(currentStats.ewes), sub: yearFilter === "all" ? "all time" : yearFilter, colour: "" },
              { label: "Total Lambs Born", value: String(currentStats.totalBorn), sub: "", colour: "" },
              { label: "Stillborn", value: `${currentStats.stillborns}`, sub: `${currentStats.pct(currentStats.stillborns)}% of born`, colour: currentStats.stillborns > 0 ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50" },
              { label: "Died Within 24h", value: `${currentStats.died24h}`, sub: `${currentStats.pct(currentStats.died24h)}% of born`, colour: currentStats.died24h > 0 ? "border-amber-200 bg-amber-50" : "border-green-200 bg-green-50" },
              { label: "Perinatal Loss", value: `${currentStats.perinatal}`, sub: `${currentStats.pct(currentStats.perinatal)}% of born`, colour: currentStats.perinatal > 0 ? "border-red-300 bg-red-50" : "border-green-200 bg-green-50" },
            ].map(s => (
              <div key={s.label} className={`rounded-lg border p-3 text-center ${s.colour || "border-gray-200 bg-gray-50"}`}>
                <p className={`text-xl font-bold ${s.colour.includes("red") ? "text-red-700" : s.colour.includes("amber") ? "text-amber-700" : s.colour.includes("green") ? "text-green-700" : "text-gray-900"}`}>{s.value}</p>
                <p className="text-xs font-medium text-gray-600 mt-0.5">{s.label}</p>
                {s.sub && <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>}
              </div>
            ))}
          </div>
          {yearlyStats.length > 1 && (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Season-by-Season Perinatal Mortality Trend</p>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-2 text-left font-semibold text-gray-500">Season</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-500">Ewes</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-500">Born</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-500">Stillborn</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-500">Died &lt;24h</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-500">Perinatal Loss</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-500">Bar</th>
                  </tr>
                </thead>
                <tbody>
                  {yearlyStats.map((s, i) => {
                    const maxRate = Math.max(...yearlyStats.map(x => Number(x.pct(x.perinatal)) || 0), 0.1);
                    const rate = Number(s.pct(s.perinatal)) || 0;
                    const barWidth = Math.round((rate / maxRate) * 100);
                    return (
                      <tr key={s.year} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-3 py-2 font-medium">{s.year}</td>
                        <td className="px-3 py-2 text-right">{s.ewes}</td>
                        <td className="px-3 py-2 text-right">{s.totalBorn}</td>
                        <td className="px-3 py-2 text-right">{s.stillborns} <span className="text-gray-400">({s.pct(s.stillborns)}%)</span></td>
                        <td className="px-3 py-2 text-right">{s.died24h} <span className="text-gray-400">({s.pct(s.died24h)}%)</span></td>
                        <td className={`px-3 py-2 text-right font-semibold ${rate > 5 ? "text-red-600" : rate > 2 ? "text-amber-600" : "text-green-700"}`}>{s.perinatal} ({s.pct(s.perinatal)}%)</td>
                        <td className="px-3 py-2 w-32">
                          <div className="h-3 bg-gray-100 rounded overflow-hidden">
                            <div className={`h-full rounded ${rate > 5 ? "bg-red-400" : rate > 2 ? "bg-amber-400" : "bg-green-400"}`} style={{ width: `${barWidth}%` }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-200">
                <p className="text-xs text-gray-400">Red indicator &gt;5% perinatal loss · Amber 2–5% · Green &lt;2%. Red Tractor Sheep Assurance may query rates above 5%.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-gray-400" /> : (
        <div className="space-y-2">
          {records.length === 0 && <Card><CardContent className="py-8 text-center text-gray-400 text-sm">No lambing records yet. Add the first record above.</CardContent></Card>}
          {records.map(r => {
            const liveCount = [r.lambOutcome1, r.lambOutcome2, r.lambOutcome3, r.lambOutcome4].filter(o => o === "live").length;
            const deadCount = [r.lambOutcome1, r.lambOutcome2, r.lambOutcome3, r.lambOutcome4].filter(o => o === "stillborn" || o === "died-within-24h").length;
            const registeredCount = [r.lambAnimalId1, r.lambAnimalId2, r.lambAnimalId3, r.lambAnimalId4].filter(Boolean).length;
            const litterLabel = r.numberOfLambs === 1 ? "Single" : r.numberOfLambs === 2 ? "Twins" : r.numberOfLambs === 3 ? "Triplets" : "Quads";
            return (
              <Card key={r.id}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-medium text-sm">{formatDate(r.lambingDate)}</span>
                      {r.eweEarTag && <span className="text-sm text-gray-700 font-mono">Ewe: {r.eweEarTag}</span>}
                      <LambingEaseBadge v={r.lambingEaseScore} />
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">{litterLabel} ({r.numberOfLambs})</span>
                      {liveCount > 0 && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">{liveCount} live</span>}
                      {deadCount > 0 && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">{deadCount} dead</span>}
                      {r.expectedLitterSize && r.expectedLitterSize !== r.numberOfLambs && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Scan: {r.expectedLitterSize} → Actual: {r.numberOfLambs}</span>
                      )}
                      {registeredCount > 0 && <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded">In Flock Register ✓ ×{registeredCount}</span>}
                      {r.fosteringRequired && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Fostered</span>}
                      {r.colostrumGivenWithin2Hours !== null && r.colostrumGivenWithin2Hours !== undefined && (
                        <span className={`text-xs px-2 py-0.5 rounded ${r.colostrumGivenWithin2Hours ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                          {r.colostrumGivenWithin2Hours ? "Colostrum ≤2h ✓" : "Colostrum >2h"}
                        </span>
                      )}
                      {r.vetAttended && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{r.vetName ? `Vet: ${r.vetName}` : "Vet attended"}</span>}
                      {r.expectedLambingDate && (() => {
                        const days = Math.floor((new Date(r.expectedLambingDate).getTime() - Date.now()) / 86400000);
                        return <span className={`text-xs px-2 py-0.5 rounded border ${days >= 0 && days <= 7 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-blue-50 text-blue-600 border-blue-200"}`}>Expected: {formatDate(r.expectedLambingDate)}</span>;
                      })()}
                      {deadCount > 0 && (() => {
                        const hasDisposal = r.perinatalCollectionDate || r.perinatalCollectionRef || r.perinatalDisposalMethod || r.perinatalDisposalContractorId;
                        return hasDisposal
                          ? <span className="text-xs bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded">Disposal recorded ✓</span>
                          : <span className="text-xs bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded">Disposal not recorded</span>;
                      })()}
                      {(lambingAttachMap[r.id] ?? 0) > 0 && (
                        <span className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1">
                          <Paperclip className="w-3 h-3" />{lambingAttachMap[r.id]}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewRecord(r)}><Eye className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => setConfirmDelete(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                  {r.notes && <p className="text-xs text-gray-400 mt-1">{r.notes}</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* View dialog */}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "44rem" }} className="max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Lambing Record — {viewRecord.eweEarTag || `Record #${viewRecord.id}`}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Lambing Date</p><p className="font-medium">{formatDate(viewRecord.lambingDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Expected Lambing Date</p><p className="font-medium">{viewRecord.expectedLambingDate ? formatDate(viewRecord.expectedLambingDate) : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Ewe Ear Tag</p><p className="font-medium font-mono">{viewRecord.eweEarTag || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Ease Score</p><p className="font-medium">{viewRecord.lambingEaseScore ? ["", "1 — Unassisted", "2 — Easy assist", "3 — Hard assist", "4 — Vet/caesarean"][viewRecord.lambingEaseScore] ?? viewRecord.lambingEaseScore : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Number of Lambs</p><p className="font-medium">{viewRecord.numberOfLambs === 1 ? "Single" : viewRecord.numberOfLambs === 2 ? "Twins" : viewRecord.numberOfLambs === 3 ? "Triplets" : "Quads"} ({viewRecord.numberOfLambs})</p></div>
              {[1, 2, 3, 4].slice(0, viewRecord.numberOfLambs ?? 1).map(n => {
                const outcome = viewRecord[`lambOutcome${n}` as keyof LambingRecord] as string | null;
                const sex = viewRecord[`lambSex${n}` as keyof LambingRecord] as string | null;
                const tag = viewRecord[`lambEarTag${n}` as keyof LambingRecord] as string | null;
                const wt = viewRecord[`lambBirthWeightKg${n}` as keyof LambingRecord] as string | null;
                if (!outcome) return null;
                return (
                  <div key={n} className="col-span-2 bg-gray-50 rounded p-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Lamb {n}</p>
                    <p className="text-sm">{outcome}{sex ? ` · ${sex}` : ""}{tag ? ` · Tag: ${tag}` : ""}{wt ? ` · ${wt} kg` : ""}</p>
                  </div>
                );
              })}
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Assistance Required</p><p className="font-medium">{viewRecord.assistanceRequired ? "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vet Attended</p><p className="font-medium">{viewRecord.vetAttended ? "Yes" : "No"}</p></div>
              {viewRecord.vetAttended && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vet Name</p><p className="font-medium">{viewRecord.vetName || "—"}</p></div>}
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Colostrum ≤2h</p><p className="font-medium">{viewRecord.colostrumGivenWithin2Hours === true ? "Yes ✓" : viewRecord.colostrumGivenWithin2Hours === false ? "No" : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Fostering Required</p><p className="font-medium">{viewRecord.fosteringRequired ? "Yes" : "No"}</p></div>
              {viewRecord.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{viewRecord.notes}</p></div>}
              {(() => {
                const deadCount = [viewRecord.lambOutcome1, viewRecord.lambOutcome2, viewRecord.lambOutcome3, viewRecord.lambOutcome4].filter(o => o === "stillborn" || o === "died-within-24h").length;
                if (deadCount === 0) return null;
                const contractor = contractors.find(c => c.id === viewRecord.perinatalDisposalContractorId);
                const hasDisposal = viewRecord.perinatalCollectionDate || viewRecord.perinatalCollectionRef || viewRecord.perinatalDisposalMethod || viewRecord.perinatalDisposalContractorId;
                return (
                  <div className={`col-span-2 rounded-md border p-3 ${hasDisposal ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2 ${hasDisposal ? 'text-green-800' : 'text-red-700'}"
                      style={{ color: hasDisposal ? "#166534" : "#b91c1c" }}>
                      Perinatal Disposal ({deadCount} perinatal death{deadCount !== 1 ? "s" : ""})
                      {hasDisposal ? " ✓" : " — NOT YET RECORDED"}
                    </p>
                    {hasDisposal ? (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {contractor && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Contractor</p><p className="font-medium">{contractor.name} ({contractor.approvalNumber})</p></div>}
                        {viewRecord.perinatalCollectionDate && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Collection Date</p><p className="font-medium">{formatDate(viewRecord.perinatalCollectionDate)}</p></div>}
                        {viewRecord.perinatalCollectionRef && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Consignment / NFAS Ref</p><p className="font-medium font-mono">{viewRecord.perinatalCollectionRef}</p></div>}
                        {viewRecord.perinatalDisposalMethod && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Disposal Method</p><p className="font-medium">{viewRecord.perinatalDisposalMethod}</p></div>}
                        {viewRecord.perinatalDisposalNotes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Disposal Notes</p><p className="font-medium">{viewRecord.perinatalDisposalNotes}</p></div>}
                      </div>
                    ) : (
                      <p className="text-xs text-red-600">Animal By-Products Regulations require disposal documentation for all perinatal deaths. Edit this record to add contractor collection details.</p>
                    )}
                  </div>
                );
              })()}
              <div className="col-span-2 border-t pt-3">
                <RecordAttachments farmId={farmId} recordType="lambing" recordId={viewRecord.id} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewRecord(null)}>Close</Button>
              <Button variant="outline" onClick={() => printBirthRecord(viewRecord)}><Printer className="w-4 h-4 mr-1" />Farm Birth Record</Button>
              <Button onClick={() => { openEdit(viewRecord); setViewRecord(null); }}><Pencil className="w-4 h-4 mr-1" />Edit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirm delete */}
      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete Lambing Record"
        message="This will permanently remove this lambing record. Live lamb livestock register entries will be kept."
        confirmLabel="Delete"
        confirmVariant="destructive"
        mutation={del}
        onConfirm={() => { if (confirmDelete !== null) del.mutate(confirmDelete); }}
        onCancel={() => { setConfirmDelete(null); del.reset(); }}
      />

      {/* Add / Edit dialog */}
      <Dialog open={open} onOpenChange={o => { if (!o) closeDialog(); }}>
        <DialogContent style={{ maxWidth: "68rem" }} className="max-h-[92vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Lambing Record" : "Add Lambing Record"}</DialogTitle></DialogHeader>
          <div className="flex gap-6 py-2">
            {/* Left column: ewe + event details */}
            <div className="flex-1 flex flex-col gap-3 min-w-0">
              {/* Ewe details */}
              <div className="rounded-md border p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ewe Details</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Lambing Date *</Label>
                    <Input type="date" value={form.lambingDate?.slice(0, 10) || ""} onChange={e => set("lambingDate", e.target.value)} />
                  </div>
                  <div>
                    <Label>Expected Lambing Date</Label>
                    <Input type="date" value={form.expectedLambingDate?.slice(0, 10) || ""} onChange={e => set("expectedLambingDate", e.target.value || null)} />
                    <p className="text-xs text-muted-foreground mt-0.5">Set before birth to track in Week Ahead</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Ewe Ear Tag</Label>
                    {ewes.length > 0 && !showManualEwe ? (
                      <Select
                        value={form.eweAnimalId ? String(form.eweAnimalId) : "__none__"}
                        onValueChange={v => {
                          if (v === "__manual__") { setShowManualEwe(true); set("eweAnimalId", null); return; }
                          const a = ewes.find(x => x.id === parseInt(v));
                          set("eweAnimalId", v === "__none__" ? null : parseInt(v));
                          set("eweEarTag", a?.earTagNumber ?? null);
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="Select ewe..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Not specified</SelectItem>
                          {ewes.map(a => <SelectItem key={a.id} value={String(a.id)}>{a.earTagNumber!}</SelectItem>)}
                          <SelectItem value="__manual__">Enter tag manually…</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex gap-1">
                        <Input value={form.eweEarTag || ""} onChange={e => set("eweEarTag", e.target.value)} placeholder="Ewe ear tag" />
                        {ewes.length > 0 && <Button type="button" variant="ghost" size="sm" className="shrink-0 text-xs" onClick={() => { setShowManualEwe(false); set("eweAnimalId", null); set("eweEarTag", null); }}>↩</Button>}
                      </div>
                    )}
                    {ewes.length === 0 && animalsQ.isSuccess && (
                      <p className="text-xs text-amber-600 mt-1">No sheep registered. Add animals in the Individual Animals tab, or enter the tag above.</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Lambing Ease Score</Label>
                    <Select value={form.lambingEaseScore ? String(form.lambingEaseScore) : "__none__"} onValueChange={v => set("lambingEaseScore", v === "__none__" ? null : parseInt(v))}>
                      <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Not recorded</SelectItem>
                        <SelectItem value="1">1 — Unassisted</SelectItem>
                        <SelectItem value="2">2 — Easy assistance (1 person)</SelectItem>
                        <SelectItem value="3">3 — Hard assistance (ropes/snares)</SelectItem>
                        <SelectItem value="4">4 — Vet required / caesarean</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Number of Lambs Born *</Label>
                    <Select value={String(numLambs)} onValueChange={v => set("numberOfLambs", parseInt(v))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 — Single</SelectItem>
                        <SelectItem value="2">2 — Twins</SelectItem>
                        <SelectItem value="3">3 — Triplets</SelectItem>
                        <SelectItem value="4">4 — Quads</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Expected Litter (from scan)</Label>
                    <Select value={form.expectedLitterSize ? String(form.expectedLitterSize) : "__none__"} onValueChange={v => set("expectedLitterSize", v === "__none__" ? null : parseInt(v))}>
                      <SelectTrigger><SelectValue placeholder="Not recorded" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Not recorded / no scan</SelectItem>
                        <SelectItem value="1">1 — Single</SelectItem>
                        <SelectItem value="2">2 — Twins</SelectItem>
                        <SelectItem value="3">3 — Triplets</SelectItem>
                        <SelectItem value="4">4 — Quads</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Ewe Complications</Label>
                    <Input value={form.eweComplications || ""} onChange={e => set("eweComplications", e.target.value)} placeholder="e.g. prolapse, twin lamb disease" />
                  </div>
                </div>
              </div>

              {/* Lamb sections */}
              {([1, 2, 3, 4] as const).slice(0, numLambs).map(n => (
                <LambSection key={n} n={n} form={form} set={set} />
              ))}
            </div>

            {/* Right column: assistance, colostrum, fostering, ram, notes */}
            <div className="w-72 flex-shrink-0 flex flex-col gap-3">
              {/* Assistance */}
              <div className="rounded-md border p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Assistance & Vet</p>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="ar-lamb" checked={!!form.assistanceRequired} onChange={e => { set("assistanceRequired", e.target.checked); if (!e.target.checked) set("assistanceType", null); }} className="rounded" />
                  <Label htmlFor="ar-lamb">Assistance required</Label>
                </div>
                {form.assistanceRequired && (
                  <div className="pl-6">
                    <Label>Type of Assistance</Label>
                    <Select value={form.assistanceType || "__none__"} onValueChange={v => set("assistanceType", v === "__none__" ? null : v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Not specified</SelectItem>
                        <SelectItem value="manual-1-person">Manual — 1 person</SelectItem>
                        <SelectItem value="manual-2-person">Manual — 2 persons</SelectItem>
                        <SelectItem value="ropes-snares">Ropes / snares</SelectItem>
                        <SelectItem value="vet-assisted">Vet-assisted delivery</SelectItem>
                        <SelectItem value="caesarean">Caesarean section</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="va-lamb" checked={!!form.vetAttended} onChange={e => { set("vetAttended", e.target.checked); if (!e.target.checked) { set("vetName", null); setShowManualVet(false); } }} className="rounded" />
                  <Label htmlFor="va-lamb">Vet attended</Label>
                </div>
                {form.vetAttended && (
                  <div className="pl-6">
                    <Label>Vet Name</Label>
                    {uniqueVetNames.length > 0 && !showManualVet ? (
                      <Select value={form.vetName || "__none__"} onValueChange={v => { if (v === "__manual__") { setShowManualVet(true); set("vetName", null); return; } set("vetName", v === "__none__" ? null : v); }}>
                        <SelectTrigger><SelectValue placeholder="Select vet..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Not specified</SelectItem>
                          {uniqueVetNames.map(n => <SelectItem key={n} value={n}>{n}{vetPracticeMap[n] ? ` — ${vetPracticeMap[n]}` : ""}</SelectItem>)}
                          <SelectItem value="__manual__">Enter name manually…</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex gap-1">
                        <Input value={form.vetName || ""} onChange={e => set("vetName", e.target.value)} placeholder="Vet's full name" />
                        {uniqueVetNames.length > 0 && <Button type="button" variant="ghost" size="sm" className="shrink-0 text-xs" onClick={() => { setShowManualVet(false); set("vetName", null); }}>↩</Button>}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Colostrum */}
              <div className="rounded-md border p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Colostrum Management</p>
                <p className="text-xs text-gray-400">Lambs should receive colostrum within 2 hours of birth. 50ml/kg is the target first feed.</p>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="col-lamb" checked={form.colostrumGivenWithin2Hours === true} onChange={e => set("colostrumGivenWithin2Hours", e.target.checked ? true : false)} className="rounded" />
                  <Label htmlFor="col-lamb">Colostrum given within 2 hours</Label>
                </div>
                <div>
                  <Label>Colostrum Source</Label>
                  <Select value={form.colostrumSource || "__none__"} onValueChange={v => set("colostrumSource", v === "__none__" ? null : v)}>
                    <SelectTrigger><SelectValue placeholder="Not recorded" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Not recorded</SelectItem>
                      <SelectItem value="own-dam">Own dam (natural suck)</SelectItem>
                      <SelectItem value="other-ewe">Other ewe (bottle)</SelectItem>
                      <SelectItem value="frozen">Frozen colostrum</SelectItem>
                      <SelectItem value="supplement">Colostrum supplement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Fostering */}
              <div className="rounded-md border p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Fostering</p>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="foster-lamb" checked={!!form.fosteringRequired} onChange={e => { set("fosteringRequired", e.target.checked); if (!e.target.checked) set("fosteringDetails", null); }} className="rounded" />
                  <Label htmlFor="foster-lamb">Fostering required</Label>
                </div>
                {form.fosteringRequired && (
                  <div>
                    <Label>Fostering Details</Label>
                    <Textarea value={form.fosteringDetails || ""} onChange={e => set("fosteringDetails", e.target.value)} placeholder="e.g. Lamb 2 fostered onto ewe UK0141092 0301 — skin graft method used" rows={3} />
                  </div>
                )}
              </div>

              {/* Ram / Sire */}
              <div className="rounded-md border p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ram / Sire</p>
                <div>
                  <Label>Conception Method</Label>
                  <Select value={form.conceptionMethod || "__none__"} onValueChange={v => set("conceptionMethod", v === "__none__" ? null : v)}>
                    <SelectTrigger><SelectValue placeholder="Not recorded" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Not recorded</SelectItem>
                      <SelectItem value="natural-service">Natural service</SelectItem>
                      <SelectItem value="ai">AI (artificial insemination)</SelectItem>
                      <SelectItem value="embryo-transfer">Embryo Transfer (ET)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {ramSires.length > 0 ? (
                  <div>
                    <Label>Ram (from Sire Register)</Label>
                    <Select value={form.sireRegisterId ? String(form.sireRegisterId) : "__none__"} onValueChange={v => {
                      const sid = v === "__none__" ? null : parseInt(v);
                      const sr = ramSires.find(s => s.id === sid);
                      set("sireRegisterId", sid);
                      set("ramEarTag", sr?.tagNumber ?? null);
                      set("ramBreed", sr?.breed ?? null);
                    }}>
                      <SelectTrigger><SelectValue placeholder="Select ram..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Not linked</SelectItem>
                        {ramSires.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}{s.breed ? ` (${s.breed})` : ""}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Ram Ear Tag</Label>
                    <Input value={form.ramEarTag || ""} onChange={e => set("ramEarTag", e.target.value)} placeholder="Tag no." />
                  </div>
                  <div>
                    <Label>Ram Breed</Label>
                    <Input value={form.ramBreed || ""} onChange={e => set("ramBreed", e.target.value)} placeholder="e.g. Texel" />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="rounded-md border p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</p>
                <Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} placeholder="Any additional notes..." rows={3} />
              </div>
            </div>
          </div>

          {/* Perinatal disposal — shown when any lamb is stillborn or died-within-24h */}
          {hasDeadLambs && (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-3 space-y-3 mt-2">
              <div>
                <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Perinatal Disposal — Animal By-Products Requirement</p>
                <p className="text-xs text-amber-700 mt-1">Stillborn and died-within-24h lambs must be collected by a licensed fallen stock contractor or disposed of via another authorised route. The collection note / consignment reference must be retained for 3 years.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Fallen Stock Contractor</Label>
                  {contractors.length > 0 ? (
                    <Select
                      value={form.perinatalDisposalContractorId ? String(form.perinatalDisposalContractorId) : "__none__"}
                      onValueChange={v => set("perinatalDisposalContractorId", v === "__none__" ? null : parseInt(v))}
                    >
                      <SelectTrigger><SelectValue placeholder="Select contractor..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Not yet collected</SelectItem>
                        {contractors.map(c => (
                          <SelectItem key={c.id} value={String(c.id)}>{c.name} ({c.approvalNumber})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-xs text-amber-600 mt-1 border border-amber-200 rounded p-2 bg-white">No fallen stock contractors registered. Add one in the Fallen Stock Contractors tab, then return here to link them.</p>
                  )}
                </div>
                <div>
                  <Label>Collection Date</Label>
                  <Input type="date" value={form.perinatalCollectionDate?.slice(0, 10) || ""} onChange={e => set("perinatalCollectionDate", e.target.value || null)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Consignment / NFAS Ref</Label>
                  <Input value={form.perinatalCollectionRef || ""} onChange={e => set("perinatalCollectionRef", e.target.value || null)} placeholder="e.g. NFAS-LIN-0042-240317" />
                  <p className="text-xs text-gray-500 mt-0.5">Collection note or NFAS certificate reference</p>
                </div>
                <div>
                  <Label>Disposal Method (if no contractor)</Label>
                  <Input value={form.perinatalDisposalMethod || ""} onChange={e => set("perinatalDisposalMethod", e.target.value || null)} placeholder="e.g. Hunt kennels, on-farm incinerator" />
                </div>
              </div>
              <div>
                <Label>Disposal Notes</Label>
                <Input value={form.perinatalDisposalNotes || ""} onChange={e => set("perinatalDisposalNotes", e.target.value || null)} placeholder="Any additional disposal details..." />
              </div>
            </div>
          )}

          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button disabled={save.isPending || !form.lambingDate} onClick={() => save.mutate(form)}>
              {save.isPending ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" />Saving…</> : editing ? "Save Changes" : "Add Lambing Record"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
