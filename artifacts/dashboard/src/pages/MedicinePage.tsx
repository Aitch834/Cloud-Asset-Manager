import React, { useState, useEffect, useMemo, useRef } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { printProReport } from "@/lib/print-report";
import { CropYearSelector } from "@/components/CropYearSelector";
import { currentCropYear, isInCropYear } from "@/lib/cropYear";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Redirect } from "wouter";
import {
  Plus, Search, Loader2, Pencil, Trash2, HeartPulse, Printer,
  AlertTriangle, Clock, CheckCircle2, XCircle, ChevronDown, ChevronUp, Eye,
  Tag, Users, User, RefreshCw, ShieldAlert, ShieldCheck, BadgeCheck, Info, ClipboardList,
  ChevronsUpDown, X, History,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { VMD_MEDICINES, DOSE_UNITS, findVmdMedicine, type VmdMedicine } from "@/data/vmdMedicines";

type StatusFilter = "all" | "in_withdrawal" | "cleared" | "no_withdrawal" | "analytics" | "adr";
type TreatmentScope = "individual" | "group" | "whole_herd";

function formatDate(val: string | null | undefined): string {
  if (!val) return "—";
  try { return new Date(val).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return val; }
}
function formatDateLong(val: string | null | undefined): string {
  if (!val) return "—";
  try { return new Date(val).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }); }
  catch { return val; }
}
function addDays(dateStr: string, days: number): string {
  if (!dateStr || !days) return "";
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const d = new Date(dateStr); d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / 86400000);
}
function isInWithdrawal(endDate: string | null | undefined): boolean {
  if (!endDate) return false;
  return daysUntil(endDate) !== null && daysUntil(endDate)! >= 0;
}
function getRecordStatus(r: MedicineRecord): "in_withdrawal" | "cleared" | "no_withdrawal" {
  if (!r.withdrawalPeriodDays) return "no_withdrawal";
  if (isInWithdrawal(r.withdrawalEndDate)) return "in_withdrawal";
  return "cleared";
}

// ─── Tag validation helpers ────────────────────────────────────────────────────
function normalizeTag(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}
function lookupAnimalByTag(tag: string, pool: Animal[]): Animal | null {
  if (!tag) return null;
  const t = tag.toLowerCase();
  return pool.find(a =>
    (a.earTagNumber?.toLowerCase() === t) ||
    (a.tagNumber?.toLowerCase() === t)
  ) ?? null;
}
function animalShortLabel(a: Animal): string {
  return [a.earTagNumber ?? a.tagNumber, a.breed, a.species].filter(Boolean).join(" · ");
}

// ─── Interfaces ────────────────────────────────────────────────────────────────
interface Herd { id: number; name: string; type: string; isOrganicHerd?: boolean; organicCertBody?: string | null; organicCertNumber?: string | null; }
interface Animal {
  id: number; earTagNumber: string | null; tagNumber: string | null;
  species: string; breed: string | null; herdId: number | null;
}
interface TagValidation {
  raw: string;
  normalized: string;
  animal: Animal | null;
  correction: string;
}
interface MedicineRecord {
  id: number; farmId: number; animalId: number | null; herdId: number | null;
  medicineRef: string | null;
  medicineName: string; batchNumber: string | null; dosage: string | null;
  administrationRoute: string | null; administeredBy: string | null;
  administeredDate: string; withdrawalPeriodDays: number | null;
  withdrawalEndDate: string | null; reason: string | null;
  vetName: string | null; notes: string | null;
  treatmentScope: string | null;
  treatedAnimalTags: string | null;
  treatedAnimalCount: number | null;
  source: string | null;
  vetVisitMedicineId: number | null;
  prescriptionId: number | null;
  createdAt: string;
  // Adverse Drug Reaction (VMR 2013 Reg 58 / SARSS)
  adverseReactionSuspected: boolean | null;
  adverseReactionSigns: string | null;
  adverseReactionSeverity: string | null;
  adverseReactionOnsetHours: number | null;
  adverseReactionOutcome: string | null;
  reportedToVetDate: string | null;
  vetReportedToVmdDate: string | null;
  vmdSarssRef: string | null;
}
interface VetPrescription {
  id: number; prescriptionDate: string | null; prescriptionRef: string | null;
  vetName: string | null; vetPractice: string | null; productName: string | null;
  activeIngredient: string | null; withdrawalPeriodMeat: number | null;
  withdrawalPeriodMilk: number | null; expiryDate: string | null;
  indicationOrDiagnosis: string | null;
}
interface Farm { id: number; name: string; address: string | null; postcode: string | null; cphNumber: string | null; redTractorId: string | null; }

const EMPTY_FORM = {
  treatmentScope: "whole_herd" as TreatmentScope,
  animalId: "",
  herdId: "",
  treatedAnimalCount: "",
  treatedAnimalTags: "",
  medicineName: "", batchNumber: "", dosage: "",
  doseAmount: "", doseUnit: "ml" as string,
  administrationRoute: "",
  administeredBy: "", administeredDate: new Date().toISOString().slice(0, 10),
  withdrawalPeriodDays: "", reason: "", vetName: "", notes: "",
  // organic compliance — auto-populated when herd is organic
  isOrganicTreatment: false,
  doubledWithdrawalDays: "",
  certifierNotified: false,
  certifierNotifiedDate: "",
  // prescription link — optional FK to vet_prescription_records
  prescriptionId: "" as string | number,
  // Adverse Drug Reaction (VMR 2013 Reg 58 / SARSS)
  adverseReactionSuspected: false,
  adverseReactionSigns: "",
  adverseReactionSeverity: "",
  adverseReactionOnsetHours: "",
  adverseReactionOutcome: "",
  reportedToVetDate: "",
  vetReportedToVmdDate: "",
  vmdSarssRef: "",
  // Stock register linkage — deducts from stock_levels when stockItemId provided
  stockItemId: "" as string | number,
  stockQuantityUsed: "",
};
const ADMIN_ROUTES = ["Oral", "Subcutaneous injection", "Intramuscular injection", "Intravenous injection", "Intramammary", "Topical / Pour-on", "Intrauterine", "Ocular", "Nasal", "Other"];

// ─── Prescription Combobox ─────────────────────────────────────────────────────
function PrescriptionCombobox({
  prescriptions,
  value,
  onChange,
}: {
  prescriptions: VetPrescription[];
  value: string | number;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = value ? prescriptions.find(p => p.id === Number(value)) : null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function isExpired(p: VetPrescription) {
    if (!p.expiryDate) return false;
    return new Date(p.expiryDate) < today;
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    const matches = q
      ? prescriptions.filter(p =>
          (p.productName ?? "").toLowerCase().includes(q) ||
          (p.prescriptionRef ?? "").toLowerCase().includes(q) ||
          (p.vetName ?? "").toLowerCase().includes(q) ||
          (p.activeIngredient ?? "").toLowerCase().includes(q) ||
          (p.indicationOrDiagnosis ?? "").toLowerCase().includes(q)
        )
      : prescriptions;
    // Valid first, then expired
    const valid = matches.filter(p => !isExpired(p));
    const expired = matches.filter(p => isExpired(p));
    return { valid, expired };
  }, [prescriptions, query]);

  function selectPrescription(id: string) {
    onChange(id);
    setOpen(false);
    setQuery("");
  }

  function formatOption(p: VetPrescription) {
    const date = p.prescriptionDate ? new Date(p.prescriptionDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" }) : "?";
    const ref = p.prescriptionRef ? ` [${p.prescriptionRef}]` : "";
    const vet = p.vetName ? ` — ${p.vetName}` : "";
    return { date, ref, vet };
  }

  const totalResults = filtered.valid.length + filtered.expired.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`w-full flex items-center justify-between h-12 rounded-xl border-2 px-4 py-2 text-base transition-colors focus:outline-none ${
            open
              ? "border-primary ring-4 ring-primary/10 bg-white"
              : "border-border bg-transparent hover:border-foreground/30"
          }`}
          onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
        >
          {selected ? (
            <span className="flex-1 text-left truncate">
              <span className="font-medium">{selected.productName ?? "Unknown"}</span>
              {selected.prescriptionRef && <span className="text-foreground/40 ml-1 text-sm">[{selected.prescriptionRef}]</span>}
              {selected.prescriptionDate && <span className="text-foreground/40 ml-1 text-sm">· {new Date(selected.prescriptionDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}</span>}
              {selected.vetName && <span className="text-foreground/50 ml-1 text-sm">— {selected.vetName}</span>}
            </span>
          ) : (
            <span className="text-foreground/40 flex-1 text-left">Search prescriptions…</span>
          )}
          <div className="flex items-center gap-1 shrink-0 ml-2">
            {selected && (
              <span
                role="button"
                tabIndex={0}
                className="p-0.5 rounded hover:bg-black/10 text-foreground/30 hover:text-foreground/70"
                onClick={e => { e.stopPropagation(); selectPrescription(""); }}
                onKeyDown={e => { if (e.key === "Enter") { e.stopPropagation(); selectPrescription(""); } }}
              >
                <X className="w-3.5 h-3.5" />
              </span>
            )}
            <ChevronsUpDown className="w-4 h-4 text-foreground/30" />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-[var(--radix-popover-trigger-width)] max-h-[340px] overflow-hidden flex flex-col shadow-lg border border-border rounded-xl"
        align="start"
        sideOffset={4}
      >
        {/* Search input */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
          <Search className="w-3.5 h-3.5 text-foreground/30 shrink-0" />
          <input
            ref={inputRef}
            className="flex-1 text-sm bg-transparent focus:outline-none placeholder:text-foreground/30"
            placeholder="Type product name, ref, vet or indication…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="text-foreground/30 hover:text-foreground/70">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="overflow-y-auto flex-1">
          {/* Clear option */}
          <button
            type="button"
            className="w-full text-left px-3 py-2 text-sm text-foreground/40 hover:bg-black/5 italic border-b border-border/50"
            onClick={() => selectPrescription("")}
          >
            — Not linked to a prescription —
          </button>

          {totalResults === 0 && (
            <p className="px-3 py-4 text-sm text-foreground/40 text-center">No prescriptions match "{query}"</p>
          )}

          {filtered.valid.length > 0 && (
            <>
              {filtered.valid.map(p => {
                const { date, ref, vet } = formatOption(p);
                const isSelected = Number(value) === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`w-full text-left px-3 py-2.5 text-sm hover:bg-primary/5 transition-colors flex items-start justify-between gap-2 ${isSelected ? "bg-primary/10" : ""}`}
                    onClick={() => selectPrescription(String(p.id))}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{p.productName ?? "Unknown product"}{ref}</div>
                      <div className="text-xs text-foreground/50 truncate">{date}{vet}{p.indicationOrDiagnosis ? ` · ${p.indicationOrDiagnosis}` : ""}</div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </>
          )}

          {filtered.expired.length > 0 && (
            <>
              <div className="px-3 py-1 text-[10px] font-semibold text-foreground/30 uppercase tracking-wide border-t border-border/50 mt-1 bg-foreground/2">
                Expired prescriptions
              </div>
              {filtered.expired.map(p => {
                const { date, ref, vet } = formatOption(p);
                const isSelected = Number(value) === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`w-full text-left px-3 py-2.5 text-sm hover:bg-primary/5 transition-colors flex items-start justify-between gap-2 opacity-60 ${isSelected ? "bg-primary/10 !opacity-100" : ""}`}
                    onClick={() => selectPrescription(String(p.id))}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate text-foreground/60">{p.productName ?? "Unknown product"}{ref}</div>
                      <div className="text-xs text-foreground/40 truncate">{date}{vet} · Expired</div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </>
          )}
        </div>

        {prescriptions.length > 0 && (
          <div className="border-t border-border/50 px-3 py-1.5 text-[10px] text-foreground/30">
            {totalResults} of {prescriptions.length} prescriptions{query ? ` matching "${query}"` : ""}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ─── Ear Tag Validator Component ───────────────────────────────────────────────
function EarTagValidatorPanel({
  rawInput, onRawChange, validations, onValidate, onCorrect,
}: {
  rawInput: string;
  onRawChange: (v: string) => void;
  validations: TagValidation[];
  onValidate: () => void;
  onCorrect: (index: number, correction: string) => void;
}) {
  const matched = validations.filter(v => v.animal);
  const unmatched = validations.filter(v => !v.animal);
  const hasValidated = validations.length > 0;

  return (
    <div className="col-span-2 space-y-2">
      <label className="text-sm font-medium text-foreground/70 block">
        Ear Tags / Animal IDs <span className="text-red-500">*</span>
        <span className="ml-1 text-xs text-foreground/40 font-normal">Comma-separated. Each tag will be verified against registered animals.</span>
      </label>
      <div className="flex gap-2 items-start">
        <textarea
          className="flex-1 min-h-[64px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-y"
          placeholder="e.g. UK123456/0001, UK123456/0002, UK123456/0003"
          value={rawInput}
          onChange={e => onRawChange(e.target.value)}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5 mt-0.5"
          onClick={onValidate}
          disabled={!rawInput.trim()}
        >
          <RefreshCw className="w-3.5 h-3.5" />Validate Tags
        </Button>
      </div>

      {hasValidated && (
        <div className="rounded-xl border border-border overflow-hidden">
          {/* Summary bar */}
          <div className={`px-3 py-2 flex items-center gap-2 text-sm font-medium ${unmatched.length === 0 ? "bg-green-50 border-b border-green-200 text-green-800" : "bg-amber-50 border-b border-amber-200 text-amber-800"}`}>
            {unmatched.length === 0
              ? <><ShieldCheck className="w-4 h-4" />{matched.length} of {validations.length} ear tag{validations.length !== 1 ? "s" : ""} verified — all animals matched</>
              : <><ShieldAlert className="w-4 h-4" />{matched.length} of {validations.length} matched · {unmatched.length} need{unmatched.length === 1 ? "s" : ""} attention</>
            }
          </div>

          {/* Matched animals */}
          {matched.length > 0 && (
            <div className="p-3 space-y-1.5">
              <p className="text-[10px] uppercase font-semibold text-foreground/40 tracking-wide">Verified Animals</p>
              <div className="flex flex-wrap gap-1.5">
                {matched.map((v, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 text-xs font-medium bg-green-50 text-green-800 border border-green-200 px-2.5 py-1 rounded-full"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span className="font-mono">{v.normalized}</span>
                    <span className="opacity-70">· {v.animal!.breed ?? v.animal!.species}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Unmatched — each gets a correction row */}
          {unmatched.length > 0 && (
            <div className={`p-3 space-y-2 ${matched.length > 0 ? "border-t border-border" : ""}`}>
              <p className="text-[10px] uppercase font-semibold text-foreground/40 tracking-wide">Unrecognised Tags — Correction Required</p>
              {validations.map((v, i) => {
                if (v.animal) return null;
                return (
                  <div key={i} className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    <XCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-mono text-xs text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded shrink-0">{v.raw}</span>
                    <span className="text-xs text-amber-700 shrink-0">not found</span>
                    <Input
                      className="h-7 text-xs font-mono flex-1"
                      placeholder="Correct ear tag..."
                      value={v.correction}
                      onChange={e => onCorrect(i, e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); onCorrect(i, v.correction); } }}
                    />
                    <Button
                      type="button" variant="outline" size="sm"
                      className="h-7 px-2 text-xs shrink-0"
                      onClick={() => onCorrect(i, v.correction)}
                      disabled={!v.correction.trim()}
                    >
                      Re-check
                    </Button>
                  </div>
                );
              })}
              <p className="text-xs text-amber-700">
                Correct each tag above or remove it from the list. Tags that remain unmatched will not be linked to individual animal records.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ record }: { record: MedicineRecord }) {
  const status = getRecordStatus(record);
  const days = daysUntil(record.withdrawalEndDate);
  if (status === "in_withdrawal") return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
      <Clock className="w-3 h-3" />{days}d left
    </span>
  );
  if (status === "cleared") return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
      <CheckCircle2 className="w-3 h-3" />Cleared
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
      <XCircle className="w-3 h-3" />No W/D
    </span>
  );
}

function TreatmentScopeBadge({ record, herds, animals }: { record: MedicineRecord; herds: Herd[]; animals: Animal[] }) {
  const scope = record.treatmentScope;
  if (scope === "individual" && record.animalId) {
    const animal = animals.find(a => a.id === record.animalId);
    const tag = animal?.earTagNumber ?? animal?.tagNumber ?? `Animal #${record.animalId}`;
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-200">
        <Tag className="w-3 h-3" />{tag}
      </span>
    );
  }
  if (scope === "individual" && record.treatedAnimalTags) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-200">
        <Tag className="w-3 h-3" />{record.treatedAnimalTags}
      </span>
    );
  }
  if (scope === "group") {
    const herdName = herds.find(h => h.id === record.herdId)?.name;
    const count = record.treatedAnimalCount;
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
        <Users className="w-3 h-3" />Group{herdName ? ` — ${herdName}` : ""}{count ? ` (${count})` : ""}
      </span>
    );
  }
  if (scope === "whole_herd" || record.herdId) {
    const herdName = herds.find(h => h.id === record.herdId)?.name;
    const count = record.treatedAnimalCount;
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
        <Users className="w-3 h-3" />{herdName ?? "Whole Herd"}{count ? ` (${count})` : ""}
      </span>
    );
  }
  return null;
}

function treatmentTraceDetail(record: MedicineRecord, herds: Herd[], animals: Animal[]): string {
  const scope = record.treatmentScope;
  if (scope === "individual" && record.animalId) {
    const animal = animals.find(a => a.id === record.animalId);
    return animal ? `Individual: ${animal.earTagNumber ?? animal.tagNumber ?? `#${animal.id}`}` : `Individual: Animal #${record.animalId}`;
  }
  if (scope === "individual" && record.treatedAnimalTags) return `Individual: ${record.treatedAnimalTags}`;
  if (scope === "group") {
    const herdName = herds.find(h => h.id === record.herdId)?.name ?? "Group";
    const tags = record.treatedAnimalTags ? ` · Tags: ${record.treatedAnimalTags}` : "";
    return `Group: ${herdName}${record.treatedAnimalCount ? ` (${record.treatedAnimalCount} animals)` : ""}${tags}`;
  }
  const herdName = herds.find(h => h.id === record.herdId)?.name;
  const count = record.treatedAnimalCount;
  if (herdName) return `Whole herd: ${herdName}${count ? ` (${count} animals)` : ""}`;
  return "—";
}

function RecordCard({ record, herds, animals, prescriptions, onEdit, onDelete, onView, onRaiseTask }: {
  record: MedicineRecord; herds: Herd[]; animals: Animal[]; prescriptions: VetPrescription[];
  onEdit: (r: MedicineRecord) => void; onDelete: (id: number) => void; onView: (r: MedicineRecord) => void;
  onRaiseTask?: (r: MedicineRecord) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const status = getRecordStatus(record);
  const borderColor = status === "in_withdrawal" ? "border-l-amber-400" : status === "cleared" ? "border-l-green-400" : "border-l-blue-400";
  return (
    <div className={`bg-white border border-border rounded-xl border-l-4 ${borderColor} p-4 shadow-sm`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {record.medicineRef && (
              <span className="font-mono text-xs text-foreground/40 bg-foreground/5 px-1.5 py-0.5 rounded">{record.medicineRef}</span>
            )}
            <StatusBadge record={record} />
            <TreatmentScopeBadge record={record} herds={herds} animals={animals} />
            {record.source === "vet_ledger" && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Via Vet Ledger
              </span>
            )}
            {(() => {
              const rx = record.prescriptionId ? prescriptions.find(p => p.id === record.prescriptionId) : null;
              if (!rx) return null;
              return (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200" title={`Linked to prescription: ${rx.productName ?? "?"} — ${rx.vetName ?? "?"}`}>
                  <ClipboardList className="w-2.5 h-2.5" />Rx linked
                </span>
              );
            })()}
            {status === "in_withdrawal" && (
              <span className="text-xs text-amber-700 font-medium">Withdrawal ends {formatDate(record.withdrawalEndDate)}</span>
            )}
          </div>
          <h3 className="font-semibold text-foreground text-sm">{record.medicineName}</h3>
          <div className="flex items-center gap-3 flex-wrap mt-1 text-xs text-foreground/60">
            <span>{formatDate(record.administeredDate)}</span>
            {record.administeredBy && <span>· by {record.administeredBy}</span>}
            {record.withdrawalPeriodDays && <span>· {record.withdrawalPeriodDays}d W/D</span>}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {status === "in_withdrawal" && onRaiseTask && (
            <button onClick={() => onRaiseTask(record)} className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-primary border border-primary/30 bg-primary/5 hover:bg-primary/10" title="Raise withdrawal check task">
              <ClipboardList className="w-3 h-3" />
              Raise Task
            </button>
          )}
          <button onClick={() => onView(record)} className="p-1.5 rounded-md hover:bg-black/5 text-foreground/30 hover:text-blue-600"><Eye className="w-3.5 h-3.5" /></button>
          <button onClick={() => onEdit(record)} className="p-1.5 rounded-md hover:bg-black/5 text-foreground/30 hover:text-primary"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={() => onDelete(record.id)} className="p-1.5 rounded-md hover:bg-red-50 text-foreground/30 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
          <button onClick={() => setExpanded(e => !e)} className="p-1.5 rounded-md hover:bg-black/5 text-foreground/30">
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-xs">
          {[
            { label: "Animal / Group", value: treatmentTraceDetail(record, herds, animals) },
            { label: "Dosage", value: record.dosage },
            { label: "Route", value: record.administrationRoute },
            { label: "Batch No.", value: record.batchNumber },
            { label: "Vet", value: record.vetName },
            { label: "Reason", value: record.reason },
            { label: "Notes", value: record.notes },
          ].filter(f => f.value && f.value !== "—").map(f => (
            <div key={f.label}>
              <p className="text-foreground/40 uppercase tracking-wide font-semibold text-[10px]">{f.label}</p>
              <p className="text-foreground/80 font-medium">{f.value}</p>
            </div>
          ))}
          <div>
            <p className="text-foreground/40 uppercase tracking-wide font-semibold text-[10px]">Timeline</p>
            <p className="text-foreground/80 font-medium">Administered {formatDate(record.administeredDate)}</p>
            {record.withdrawalEndDate && <p className="text-foreground/80 font-medium">Withdrawal ends {formatDate(record.withdrawalEndDate)}</p>}
          </div>
          {record.prescriptionId && (() => {
            const rx = prescriptions.find(p => p.id === record.prescriptionId);
            if (!rx) return null;
            return (
              <div className="col-span-full mt-1 p-2 rounded-lg border border-purple-200 bg-purple-50 text-xs text-purple-800">
                <p className="font-semibold mb-0.5 flex items-center gap-1"><ClipboardList className="w-3 h-3" />Linked Prescription</p>
                <p>{rx.productName ?? "Unknown"}{rx.prescriptionRef ? ` [${rx.prescriptionRef}]` : ""}{rx.vetName ? ` — ${rx.vetName}` : ""}{rx.prescriptionDate ? `, issued ${formatDate(rx.prescriptionDate)}` : ""}</p>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

function printMedicineRegister(records: MedicineRecord[], herds: Herd[], animals: Animal[], farm: Farm, filterLabel: string): void {
  const tableHtml = `<table><thead><tr>
    <th>Reference</th><th>Medicine</th><th>Batch No.</th><th>Animal / Group Treated</th><th>Administered</th>
    <th>Dosage / Route</th><th>W/D Days</th><th>W/D Ends</th><th>Status</th><th>Vet</th><th>Reason</th>
  </tr></thead><tbody>${records.map(r => {
    const status = getRecordStatus(r);
    const days = daysUntil(r.withdrawalEndDate);
    const badge = status === "in_withdrawal"
      ? `<span style="background:#fef3c7;color:#92400e;padding:1px 5px;border-radius:3px;font-weight:600">${days}d left</span>`
      : status === "cleared"
      ? `<span style="background:#dcfce7;color:#166534;padding:1px 5px;border-radius:3px;font-weight:600">Cleared</span>`
      : `<span style="background:#dbeafe;color:#1e40af;padding:1px 5px;border-radius:3px;font-weight:600">No W/D</span>`;
    return `<tr>
      <td style="font-family:monospace">${r.medicineRef ?? "—"}</td>
      <td><strong>${r.medicineName}</strong></td>
      <td style="font-family:monospace">${r.batchNumber ?? "—"}</td>
      <td>${treatmentTraceDetail(r, herds, animals)}</td>
      <td style="white-space:nowrap">${formatDateLong(r.administeredDate)}</td>
      <td>${[r.dosage, r.administrationRoute].filter(Boolean).join(" · ") || "—"}</td>
      <td>${r.withdrawalPeriodDays ?? "—"}</td>
      <td style="white-space:nowrap">${r.withdrawalEndDate ? formatDateLong(r.withdrawalEndDate) : "—"}</td>
      <td>${badge}</td>
      <td>${r.vetName ?? "—"}</td>
      <td>${r.reason ?? "—"}</td>
    </tr>`;
  }).join("")}</tbody></table>`;
  printProReport({
    title: "Medicine Register",
    subtitle: "Veterinary Medicines Regulations 2013",
    farmName: farm.name,
    cphNumber: farm.cphNumber ?? undefined,
    redTractorId: farm.redTractorId ?? undefined,
    recordCount: records.length,
    extraMeta: `Filter: ${filterLabel}`,
    tableHtml,
    footerNote: "Legally required under the Veterinary Medicines Regulations 2013 — retain for at least 5 years. Observe all withdrawal periods before slaughter, milk sale, or egg collection.",
  });
}

// ─── Page root ─────────────────────────────────────────────────────────────────
export default function MedicinePageDedicated() {
  const { farmId } = useAppStore();
  if (!farmId) return <Redirect to="/select" />;
  return (
    <AppLayout title="Medicine Register">
      <MedicineRegisterContent farmId={farmId} />
    </AppLayout>
  );
}

const MED_PIE_COLOURS = ["#16a34a","#3b82f6","#f59e0b","#ef4444","#8b5cf6","#14b8a6","#f97316","#ec4899"];

function MedicineAnalyticsPanel({ records }: { records: MedicineRecord[] }) {
  const routeMap = useMemo(() => {
    const m = new Map<string, number>();
    records.forEach(r => {
      const route = r.administrationRoute || "Not recorded";
      m.set(route, (m.get(route) ?? 0) + 1);
    });
    return m;
  }, [records]);
  const routeData = [...routeMap.entries()].sort(([, a], [, b]) => b - a).map(([name, value]) => ({ name, value }));

  const monthMap = useMemo(() => {
    const m = new Map<string, { label: string; count: number; inWithdrawal: number }>();
    records.forEach(r => {
      if (!r.administeredDate) return;
      const d = new Date(r.administeredDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
      if (!m.has(key)) m.set(key, { label, count: 0, inWithdrawal: 0 });
      const b = m.get(key)!;
      b.count++;
      if (r.withdrawalPeriodDays && r.withdrawalPeriodDays > 0) b.inWithdrawal++;
    });
    return m;
  }, [records]);
  const monthData = [...monthMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);

  const medicineMap = useMemo(() => {
    const m = new Map<string, number>();
    records.forEach(r => { m.set(r.medicineName, (m.get(r.medicineName) ?? 0) + 1); });
    return m;
  }, [records]);
  const topMedicines = [...medicineMap.entries()].sort(([, a], [, b]) => b - a).slice(0, 10).map(([name, count]) => ({ name, count }));

  const inWithdrawalNow = records.filter(r => isInWithdrawal(r.withdrawalEndDate ?? null)).length;
  const withWdPeriod = records.filter(r => r.withdrawalPeriodDays && r.withdrawalPeriodDays > 0).length;
  const avgWd = withWdPeriod > 0 ? Math.round(records.filter(r => r.withdrawalPeriodDays && r.withdrawalPeriodDays > 0).reduce((s, r) => s + (r.withdrawalPeriodDays ?? 0), 0) / withWdPeriod) : 0;

  if (records.length === 0) return (
    <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
      <HeartPulse className="w-10 h-10 mx-auto mb-3 text-gray-300" />
      <p className="font-medium text-gray-600 mb-1">No medicine records yet</p>
      <p className="text-sm text-gray-400">Add medicine records to see analytics here.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase font-medium mb-1">Total Records</p>
          <p className="text-2xl font-bold text-green-700">{records.length}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase font-medium mb-1">Active Withdrawals</p>
          <p className="text-2xl font-bold text-amber-700">{inWithdrawalNow}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase font-medium mb-1">Avg. W/D Period</p>
          <p className="text-2xl font-bold text-blue-700">{avgWd > 0 ? `${avgWd}d` : "—"}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-gray-700 mb-4">Treatments by Administration Route</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={routeData} dataKey="value" nameKey="name" cx="40%" cy="50%" outerRadius={85} label={false}>
                {routeData.map((_: any, i: number) => <Cell key={i} fill={MED_PIE_COLOURS[i % MED_PIE_COLOURS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend layout="vertical" align="right" verticalAlign="middle" formatter={(n: string) => <span style={{ fontSize: 11 }}>{n}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-gray-700 mb-4">Monthly Treatments</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} width={30} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#16a34a" name="Treatments" radius={[3,3,0,0]} />
              <Bar dataKey="inWithdrawal" fill="#f59e0b" name="With W/D Period" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {topMedicines.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-gray-700 mb-4">Top Medicines Used (by frequency)</p>
          <ResponsiveContainer width="100%" height={Math.max(160, topMedicines.length * 34)}>
            <BarChart data={topMedicines} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} unit=" uses" allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={200} />
              <Tooltip formatter={(v: number) => [`${v} treatment${v !== 1 ? "s" : ""}`, ""]} />
              <Bar dataKey="count" fill="#16a34a" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ─── Medicine History Dialog ───────────────────────────────────────────────────
function MedHistoryDialog({ records, herds, onClose }: { records: any[]; herds: any[]; onClose: () => void }) {
  const [yearFilter, setYearFilter] = React.useState<number | "all">("all");
  const currentYear = new Date().getFullYear();
  const recentYears = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];
  const sorted = [...records].sort((a, b) => new Date(b.administeredDate ?? 0).getTime() - new Date(a.administeredDate ?? 0).getTime());
  const filtered = yearFilter === "all" ? sorted : sorted.filter(r => r.administeredDate && new Date(r.administeredDate).getFullYear() === yearFilter);

  function fmtDate(d: string | null | undefined) { return d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"; }

  function handlePrint() {
    const rows = filtered.map(r => {
      const herd = herds.find((h: any) => h.id === r.herdId);
      const wdEnd = r.withdrawalEndDate ? new Date(r.withdrawalEndDate).toLocaleDateString("en-GB") : "";
      return `<tr><td>${fmtDate(r.administeredDate)}</td><td>${r.medicineName}</td><td>${herd?.name ?? (r.treatmentScope === "individual" ? `Animal #${r.animalId}` : r.treatmentScope ?? "—")}</td><td>${r.dosage || "—"}</td><td>${r.administeredBy || "—"}</td><td>${r.vetName || "—"}</td><td>${r.withdrawalPeriodDays ? `${r.withdrawalPeriodDays}d (clears ${wdEnd})` : "—"}</td><td>${r.reason || ""}</td></tr>`;
    }).join("");
    const w = window.open("", "_blank");
    if (w) { w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Medicine Treatment History</title><style>body{font-family:Arial,sans-serif;font-size:10pt;margin:20mm}table{width:100%;border-collapse:collapse;margin-top:12px}th{background:#166534;color:#fff;padding:5px 6px;text-align:left;font-size:8.5pt}td{padding:4px 6px;border-bottom:1px solid #e5e7eb;font-size:9pt;vertical-align:top}tr:nth-child(even) td{background:#f9fafb}.footer{margin-top:18px;font-size:8pt;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:8px}@media print{body{margin:10mm}}</style></head><body><h1 style="font-size:14pt">Medicine Treatment History</h1><p style="font-size:9pt;color:#555">Printed: ${new Date().toLocaleDateString("en-GB")}${yearFilter !== "all" ? ` · Year: ${yearFilter}` : ""} · ${filtered.length} record${filtered.length !== 1 ? "s" : ""}</p><table><thead><tr><th>Date</th><th>Medicine</th><th>Herd / Animal</th><th>Dose</th><th>Administered By</th><th>Vet</th><th>Withdrawal</th><th>Reason</th></tr></thead><tbody>${rows}</tbody></table><p class="footer">APHA requirement: retain medicine records for 5 years (cattle/sheep) or 3 years (pigs/poultry).</p></body></html>`); w.document.close(); w.focus(); w.print(); }
  }

  return (
    <Dialog open onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><History className="w-4 h-4 text-green-700" />Full Treatment History — All Years</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 flex-wrap border-b pb-3">
          {(["all", ...recentYears] as (number | "all")[]).map(y => (
            <button key={y} onClick={() => setYearFilter(y)} style={{ padding: "3px 12px", borderRadius: 99, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", border: yearFilter === y ? "1.5px solid #15803d" : "1.5px solid #e5e7eb", background: yearFilter === y ? "#f0fdf4" : "#fff", color: yearFilter === y ? "#15803d" : "#6b7280" }}>
              {y === "all" ? "All years" : y}
            </button>
          ))}
          <span className="ml-auto text-xs text-muted-foreground">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-muted-foreground gap-2">
              <HeartPulse className="w-9 h-9 text-gray-300" />
              <p className="text-sm">No records{yearFilter !== "all" ? ` for ${yearFilter}` : ""}</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  {["Date", "Medicine", "Herd / Animal", "Dose", "Administered By", "Vet", "Withdrawal", "Reason"].map(h => (
                    <th key={h} style={{ padding: "0.5rem 0.75rem", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r: any, i: number) => {
                  const herd = herds.find((h: any) => h.id === r.herdId);
                  const wdDays = r.withdrawalPeriodDays;
                  const wdEnd = r.withdrawalEndDate ? new Date(r.withdrawalEndDate) : null;
                  const wdPast = wdEnd && wdEnd < new Date();
                  return (
                    <tr key={r.id} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                      <td style={{ padding: "0.5rem 0.75rem", whiteSpace: "nowrap", color: "#6b7280", fontSize: "0.8125rem" }}>{fmtDate(r.administeredDate)}</td>
                      <td style={{ padding: "0.5rem 0.75rem", fontWeight: 600, color: "#111827" }}>{r.medicineName}</td>
                      <td style={{ padding: "0.5rem 0.75rem" }}>{herd ? <span style={{ fontWeight: 500 }}>{herd.name}</span> : r.treatmentScope === "individual" ? <span style={{ color: "#6b7280" }}>Animal #{r.animalId}</span> : <span style={{ color: "#9ca3af" }}>—</span>}</td>
                      <td style={{ padding: "0.5rem 0.75rem", color: "#374151" }}>{r.dosage || "—"}</td>
                      <td style={{ padding: "0.5rem 0.75rem", color: "#6b7280" }}>{r.administeredBy || "—"}</td>
                      <td style={{ padding: "0.5rem 0.75rem", color: "#6b7280" }}>{r.vetName || "—"}</td>
                      <td style={{ padding: "0.5rem 0.75rem" }}>
                        {wdDays ? <span style={{ fontSize: "0.75rem", padding: "2px 6px", borderRadius: 99, background: wdPast ? "#f0fdf4" : "#fef2f2", color: wdPast ? "#15803d" : "#dc2626", fontWeight: 600, whiteSpace: "nowrap" }}>{wdDays}d{wdEnd ? ` — clears ${wdEnd.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}` : ""}</span> : <span style={{ color: "#9ca3af" }}>—</span>}
                      </td>
                      <td style={{ padding: "0.5rem 0.75rem", color: "#6b7280", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.reason || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <DialogFooter className="border-t pt-3 flex-row items-center gap-2 sm:justify-between">
          <p className="text-[11px] text-muted-foreground flex-1">APHA: retain medicine records for <strong>5 years</strong> (cattle/sheep) or <strong>3 years</strong> (pigs/poultry).</p>
          <div className="flex gap-2">
            {filtered.length > 0 && <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5"><Printer className="w-3.5 h-3.5" />Print / Export</Button>}
            <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main content ──────────────────────────────────────────────────────────────
function MedicineRegisterContent({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [cropYear, setCropYear] = useState(currentCropYear());
  const [historyOpen, setHistoryOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MedicineRecord | null>(null);
  const [viewRecord, setViewRecord] = useState<MedicineRecord | null>(null);
  const [form, setForm] = useState<typeof EMPTY_FORM>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [raiseTaskRecord, setRaiseTaskRecord] = useState<MedicineRecord | null>(null);

  // Tag validation state — used only when treatmentScope === "group"
  const [tagValidations, setTagValidations] = useState<TagValidation[]>([]);
  // Show a "save anyway?" confirm when there are still unmatched tags on submit
  const [pendingBodyWithUnmatched, setPendingBodyWithUnmatched] = useState<Record<string, unknown> | null>(null);
  // VMD medicine reference match for the currently typed medicine name
  const [vmdMatch, setVmdMatch] = useState<VmdMedicine | null>(null);

  const farmQ = useQuery<{ record: Farm }>({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`, { credentials: "include" }).then(r => r.json()),
  });
  const herdsQ = useQuery<{ records: Herd[] }>({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/herds`, { credentials: "include" }).then(r => r.json()),
  });
  const animalsQ = useQuery<{ records: Animal[] }>({
    queryKey: ["animals", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/animals`, { credentials: "include" }).then(r => r.json()),
  });
  const medicineQ = useQuery<{ records: MedicineRecord[] }>({
    queryKey: ["medicine-records", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/medicine-records`, { credentials: "include" }).then(r => r.json()),
  });
  const vetPlansQ = useQuery<{ records: Array<{ vetName: string; practiceName: string | null }> }>({
    queryKey: ["vet-health-plans", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/vet-health-plans`, { credentials: "include" }).then(r => r.json()),
  });
  const prescriptionsQ = useQuery<VetPrescription[]>({
    queryKey: ["vet-prescriptions", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/vet-prescriptions`, { credentials: "include" }).then(r => r.json()),
  });
  const stockItemsQ = useQuery<{ records: Array<{ id: number; name: string; category: string | null; unit: string | null; isActive: boolean }> }>({
    queryKey: ["stock-items", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/stock-items`, { credentials: "include" }).then(r => r.json()),
    staleTime: 5 * 60 * 1000,
  });
  const allStockItems = (stockItemsQ.data?.records ?? []).filter(s => s.isActive);
  const medicineStockItems = allStockItems.filter(s =>
    !s.category || ["medic", "vet", "pharma", "drug", "treatment"].some(k => s.category!.toLowerCase().includes(k))
  );
  const stockItemsForPicker = medicineStockItems.length > 0 ? medicineStockItems : allStockItems;

  const farm: Farm = farmQ.data?.record ?? { id: farmId, name: "Farm", address: null, postcode: null, cphNumber: null, redTractorId: null };
  const herds: Herd[] = herdsQ.data?.records ?? [];
  const animals: Animal[] = animalsQ.data?.records ?? [];
  const prescriptions: VetPrescription[] = prescriptionsQ.data ?? [];
  const allRecords: MedicineRecord[] = medicineQ.data?.records ?? [];

  const uniqueVetNames = useMemo(() => {
    const names = new Set<string>();
    vetPlansQ.data?.records?.forEach(p => { if (p.vetName) names.add(p.vetName); });
    allRecords.forEach(r => { if (r.vetName) names.add(r.vetName); });
    return Array.from(names).sort();
  }, [vetPlansQ.data, allRecords]);

  // Pool of animals valid for tag lookup — filtered to herd if one is selected
  const tagPool = form.herdId
    ? animals.filter(a => a.herdId === Number(form.herdId))
    : animals;

  // Reset tag validations whenever scope or herd changes
  useEffect(() => {
    setTagValidations([]);
    setPendingBodyWithUnmatched(null);
  }, [form.treatmentScope, form.herdId]);

  function runTagValidation() {
    const parts = form.treatedAnimalTags.split(",").map(s => s.trim()).filter(Boolean);
    if (!parts.length) return;
    const results: TagValidation[] = parts.map(raw => {
      const normalized = normalizeTag(raw);
      return { raw, normalized, animal: lookupAnimalByTag(normalized, tagPool), correction: "" };
    });
    setTagValidations(results);
  }

  function applyCorrection(index: number, correction: string) {
    const normalized = normalizeTag(correction);
    const animal = lookupAnimalByTag(normalized, tagPool);
    setTagValidations(vs => vs.map((v, i) =>
      i === index ? { ...v, correction, normalized: animal ? normalized : v.normalized, animal } : v
    ));
  }

  // Derive the final verified tag string and count from validation results
  function getVerifiedTags(): { tags: string; count: number; hasUnmatched: boolean } {
    if (form.treatmentScope !== "group" || tagValidations.length === 0) {
      return { tags: form.treatedAnimalTags, count: Number(form.treatedAnimalCount) || 0, hasUnmatched: false };
    }
    const matched = tagValidations.filter(v => v.animal);
    const unmatched = tagValidations.filter(v => !v.animal);
    return {
      tags: matched.map(v => v.normalized).join(", "),
      count: matched.length,
      hasUnmatched: unmatched.length > 0,
    };
  }

  const createM = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetch(`/api/farms/${farmId}/medicine-records`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["medicine-records", farmId] }); closeForm(); toast({ title: "Medicine record saved" }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const updateM = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
      fetch(`/api/farms/${farmId}/medicine-records/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["medicine-records", farmId] }); closeForm(); toast({ title: "Record updated" }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const deleteM = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/medicine-records/${id}`, { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["medicine-records", farmId] }); setDeleteId(null); toast({ title: "Record deleted" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setTagValidations([]);
    setPendingBodyWithUnmatched(null);
    setVmdMatch(null);
  }

  const yearRecords = allRecords.filter(r => isInCropYear(r.administeredDate, cropYear));
  const inWithdrawal = yearRecords.filter(r => getRecordStatus(r) === "in_withdrawal");
  const cleared = yearRecords.filter(r => getRecordStatus(r) === "cleared");
  const noWithdrawal = yearRecords.filter(r => getRecordStatus(r) === "no_withdrawal");
  const adrRecords = yearRecords.filter(r => r.adverseReactionSuspected);
  const tabCounts = { all: yearRecords.length, in_withdrawal: inWithdrawal.length, cleared: cleared.length, no_withdrawal: noWithdrawal.length, adr: adrRecords.length };

  const baseFiltered = statusFilter === "all" ? yearRecords
    : statusFilter === "in_withdrawal" ? inWithdrawal
    : statusFilter === "cleared" ? cleared
    : statusFilter === "adr" ? adrRecords
    : noWithdrawal;

  const filtered = baseFiltered.filter(r => !search
    || r.medicineName.toLowerCase().includes(search.toLowerCase())
    || r.medicineRef?.toLowerCase().includes(search.toLowerCase())
    || r.vetName?.toLowerCase().includes(search.toLowerCase())
    || r.reason?.toLowerCase().includes(search.toLowerCase())
    || r.treatedAnimalTags?.toLowerCase().includes(search.toLowerCase())
    || herds.find(h => h.id === r.herdId)?.name.toLowerCase().includes(search.toLowerCase())
    || (r.animalId && animals.find(a => a.id === r.animalId)?.earTagNumber?.toLowerCase().includes(search.toLowerCase()))
  );

  const filterLabel = statusFilter === "all" ? "All records" : statusFilter === "in_withdrawal" ? "In Withdrawal" : statusFilter === "cleared" ? "Cleared" : "No Withdrawal Required";

  function openEdit(r: MedicineRecord) {
    setEditing(r);
    setTagValidations([]);
    setPendingBodyWithUnmatched(null);
    setVmdMatch(findVmdMedicine(r.medicineName));
    const doseMatch = (r.dosage ?? "").match(/^(\d+(?:\.\d+)?)\s*(ml|mg|g|IU|tablets?|capsules?|doses?|sachets?)$/i);
    const newForm = {
      treatmentScope: (r.treatmentScope as TreatmentScope) ?? "whole_herd",
      animalId: r.animalId ? String(r.animalId) : "",
      herdId: r.herdId ? String(r.herdId) : "",
      treatedAnimalCount: r.treatedAnimalCount ? String(r.treatedAnimalCount) : "",
      treatedAnimalTags: r.treatedAnimalTags ?? "",
      medicineName: r.medicineName, batchNumber: r.batchNumber ?? "",
      dosage: r.dosage ?? "",
      doseAmount: doseMatch ? doseMatch[1] : "",
      doseUnit: doseMatch ? doseMatch[2].toLowerCase() : "ml",
      administrationRoute: r.administrationRoute ?? "",
      administeredBy: r.administeredBy ?? "", administeredDate: r.administeredDate?.slice(0, 10) ?? "",
      withdrawalPeriodDays: r.withdrawalPeriodDays ? String(r.withdrawalPeriodDays) : "",
      reason: r.reason ?? "", vetName: r.vetName ?? "", notes: r.notes ?? "",
      isOrganicTreatment: (r as any).isOrganicTreatment ?? false,
      doubledWithdrawalDays: (r as any).doubledWithdrawalDays ? String((r as any).doubledWithdrawalDays) : "",
      certifierNotified: (r as any).certifierNotified ?? false,
      certifierNotifiedDate: (r as any).certifierNotifiedDate ? new Date((r as any).certifierNotifiedDate).toISOString().slice(0, 10) : "",
      prescriptionId: r.prescriptionId ? String(r.prescriptionId) : "",
      adverseReactionSuspected: r.adverseReactionSuspected ?? false,
      adverseReactionSigns: r.adverseReactionSigns ?? "",
      adverseReactionSeverity: r.adverseReactionSeverity ?? "",
      adverseReactionOnsetHours: r.adverseReactionOnsetHours ? String(r.adverseReactionOnsetHours) : "",
      adverseReactionOutcome: r.adverseReactionOutcome ?? "",
      reportedToVetDate: r.reportedToVetDate ? new Date(r.reportedToVetDate).toISOString().slice(0, 10) : "",
      vetReportedToVmdDate: r.vetReportedToVmdDate ? new Date(r.vetReportedToVmdDate).toISOString().slice(0, 10) : "",
      vmdSarssRef: r.vmdSarssRef ?? "",
      stockItemId: "",
      stockQuantityUsed: "",
    };
    setForm(newForm);
    // If editing a group record that already has tags, pre-validate them
    if (r.treatmentScope === "group" && r.treatedAnimalTags) {
      const herdPool = r.herdId ? animals.filter(a => a.herdId === r.herdId) : animals;
      const parts = r.treatedAnimalTags.split(",").map(s => s.trim()).filter(Boolean);
      setTagValidations(parts.map(raw => {
        const normalized = normalizeTag(raw);
        return { raw, normalized, animal: lookupAnimalByTag(normalized, herdPool), correction: "" };
      }));
    }
    setFormOpen(true);
  }

  function buildBody(verifiedTags: string, verifiedCount: number): Record<string, unknown> {
    const wdDays = form.withdrawalPeriodDays ? Number(form.withdrawalPeriodDays) : null;
    const wdEnd = wdDays && form.administeredDate ? new Date(addDays(form.administeredDate, wdDays)).toISOString() : null;
    return {
      treatmentScope: form.treatmentScope,
      animalId: form.treatmentScope === "individual" && form.animalId ? Number(form.animalId) : null,
      herdId: form.treatmentScope !== "individual" && form.herdId ? Number(form.herdId) : null,
      treatedAnimalCount: (form.treatmentScope === "group" || form.treatmentScope === "whole_herd") && verifiedCount > 0 ? verifiedCount : null,
      treatedAnimalTags: verifiedTags || null,
      medicineName: form.medicineName, batchNumber: form.batchNumber || null,
      dosage: form.doseAmount ? `${form.doseAmount} ${form.doseUnit}`.trim() : (form.dosage || null),
      administrationRoute: form.administrationRoute || null,
      administeredBy: form.administeredBy || null,
      administeredDate: form.administeredDate ? new Date(form.administeredDate).toISOString() : null,
      withdrawalPeriodDays: wdDays, withdrawalEndDate: wdEnd,
      reason: form.reason || null, vetName: form.vetName || null, notes: form.notes || null,
      isOrganicTreatment: form.isOrganicTreatment ?? false,
      doubledWithdrawalDays: form.doubledWithdrawalDays ? Number(form.doubledWithdrawalDays) : null,
      certifierNotified: form.certifierNotified ?? false,
      certifierNotifiedDate: form.certifierNotified && form.certifierNotifiedDate ? new Date(form.certifierNotifiedDate).toISOString() : null,
      prescriptionId: form.prescriptionId ? Number(form.prescriptionId) : null,
      stockItemId: form.stockItemId ? Number(form.stockItemId) : undefined,
      stockQuantityUsed: form.stockQuantityUsed ? Number(form.stockQuantityUsed) : undefined,
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { tags, count, hasUnmatched } = getVerifiedTags();

    // Group scope: if user typed tags but hasn't validated yet, force validation first
    if (form.treatmentScope === "group" && form.treatedAnimalTags && tagValidations.length === 0) {
      runTagValidation();
      toast({ title: "Tags validated — please review and save again", variant: "default" });
      return;
    }

    const body = buildBody(tags, count);

    // Group scope: warn if some tags are unmatched
    if (form.treatmentScope === "group" && hasUnmatched) {
      setPendingBodyWithUnmatched(body);
      return;
    }

    if (editing) { updateM.mutate({ id: editing.id, body }); } else { createM.mutate(body); }
  }

  function confirmSaveWithUnmatched() {
    if (!pendingBodyWithUnmatched) return;
    if (editing) { updateM.mutate({ id: editing.id, body: pendingBodyWithUnmatched }); }
    else { createM.mutate(pendingBodyWithUnmatched); }
    setPendingBodyWithUnmatched(null);
  }

  const isSubmitting = createM.isPending || updateM.isPending;
  const previewWdEnd = form.withdrawalPeriodDays && form.administeredDate ? addDays(form.administeredDate, Number(form.withdrawalPeriodDays)) : null;
  const unmatchedCount = tagValidations.filter(v => !v.animal).length;

  // Detect if the selected herd is marked as organic — drives auto-fill of doubled withdrawal
  const selectedHerd = form.herdId ? herds.find(h => h.id === Number(form.herdId)) : null;
  const isOrganicHerdSelected = selectedHerd?.isOrganicHerd ?? false;

  // Auto-fill doubled withdrawal (× 2) whenever standard withdrawal or organic status changes
  const previewDoubledWdEnd = form.doubledWithdrawalDays && form.administeredDate ? addDays(form.administeredDate, Number(form.doubledWithdrawalDays)) : null;

  return (
    <>
      {inWithdrawal.length > 0 && (
        <div className="mb-6 border border-amber-200 bg-amber-50 rounded-xl px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">{inWithdrawal.length} active withdrawal period{inWithdrawal.length !== 1 ? "s" : ""} — check before selling or slaughtering</p>
            <p className="text-xs text-amber-700 mt-0.5">
              {inWithdrawal.slice(0, 3).map(r => {
                const days = daysUntil(r.withdrawalEndDate);
                return `${r.medicineName} — ${days} day${days !== 1 ? "s" : ""} remaining`;
              }).join(" · ")}{inWithdrawal.length > 3 ? ` · +${inWithdrawal.length - 3} more` : ""}
            </p>
          </div>
        </div>
      )}

      <TabBar className="mb-5">
        <TabButton active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>All <span className="ml-1 text-xs opacity-60">({tabCounts.all})</span></TabButton>
        <TabButton active={statusFilter === "in_withdrawal"} onClick={() => setStatusFilter("in_withdrawal")}>In Withdrawal <span className="ml-1 text-xs opacity-60">({tabCounts.in_withdrawal})</span></TabButton>
        <TabButton active={statusFilter === "cleared"} onClick={() => setStatusFilter("cleared")}>Cleared <span className="ml-1 text-xs opacity-60">({tabCounts.cleared})</span></TabButton>
        <TabButton active={statusFilter === "no_withdrawal"} onClick={() => setStatusFilter("no_withdrawal")}>No W/D Required <span className="ml-1 text-xs opacity-60">({tabCounts.no_withdrawal})</span></TabButton>
        <TabButton active={statusFilter === "analytics"} onClick={() => setStatusFilter("analytics")}>Analytics</TabButton>
        <TabButton active={statusFilter === "adr"} onClick={() => setStatusFilter("adr")}>
          <HeartPulse className="w-3.5 h-3.5 mr-1 inline-block" />ADR Register
          {tabCounts.adr > 0 && <span className="ml-1 text-xs bg-red-100 text-red-700 rounded-full px-1.5">{tabCounts.adr}</span>}
        </TabButton>
      </TabBar>

      {statusFilter === "analytics" && <MedicineAnalyticsPanel records={allRecords} />}

      {statusFilter === "adr" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-900">
            <div className="font-semibold flex items-center gap-2 mb-1"><HeartPulse className="w-4 h-4" />Adverse Drug Reaction (ADR) Register — VMR 2013 / VMD SARSS</div>
            <p className="text-xs text-red-800">Under the Veterinary Medicines Regulations 2013 (Reg 58 &amp; Sch 6), suspected adverse reactions must be reported to your prescribing vet. Serious reactions must reach the VMD SARSS portal within 15 days; non-serious within 90 days. This register tracks all flagged records and their reporting status.</p>
          </div>
          {adrRecords.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-xl bg-white">
              <HeartPulse className="mx-auto mb-2 w-8 h-8 opacity-20" />
              <p className="font-medium text-sm">No adverse reactions recorded for {cropYear}</p>
              <p className="text-xs mt-1">Flag a reaction when adding or editing a medicine record.</p>
            </div>
          ) : (
            <div className="bg-white border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-red-50 border-b border-red-100">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-medium text-xs text-red-800">Date</th>
                    <th className="px-4 py-2.5 text-left font-medium text-xs text-red-800">Medicine</th>
                    <th className="px-4 py-2.5 text-left font-medium text-xs text-red-800">Herd / Animal</th>
                    <th className="px-4 py-2.5 text-left font-medium text-xs text-red-800">Severity</th>
                    <th className="px-4 py-2.5 text-left font-medium text-xs text-red-800">Signs</th>
                    <th className="px-4 py-2.5 text-left font-medium text-xs text-red-800">Outcome</th>
                    <th className="px-4 py-2.5 text-left font-medium text-xs text-red-800">Reported to Vet</th>
                    <th className="px-4 py-2.5 text-left font-medium text-xs text-red-800">VMD SARSS Ref</th>
                    <th className="px-4 py-2.5 text-left font-medium text-xs text-red-800"></th>
                  </tr>
                </thead>
                <tbody>
                  {adrRecords.map(r => {
                    const herd = r.herdId ? herds.find(h => h.id === r.herdId) : null;
                    const animal = r.animalId ? animals.find(a => a.id === r.animalId) : null;
                    const severityColour = r.adverseReactionSeverity === "fatal" ? "text-red-700 bg-red-100"
                      : r.adverseReactionSeverity === "severe" ? "text-orange-700 bg-orange-100"
                      : r.adverseReactionSeverity === "moderate" ? "text-amber-700 bg-amber-100"
                      : "text-green-700 bg-green-100";
                    const vetReported = !!r.reportedToVetDate;
                    const sarssReported = !!r.vetReportedToVmdDate || !!r.vmdSarssRef;
                    return (
                      <tr key={r.id} className="border-t hover:bg-red-50/50">
                        <td className="px-4 py-2.5 whitespace-nowrap text-xs">{formatDate(r.administeredDate)}</td>
                        <td className="px-4 py-2.5 font-medium text-xs">{r.medicineName}</td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground">
                          {animal ? animalShortLabel(animal) : herd?.name ?? r.treatedAnimalTags ?? "—"}
                        </td>
                        <td className="px-4 py-2.5">
                          {r.adverseReactionSeverity ? (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${severityColour}`}>{r.adverseReactionSeverity}</span>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </td>
                        <td className="px-4 py-2.5 text-xs max-w-[180px] truncate" title={r.adverseReactionSigns ?? ""}>{r.adverseReactionSigns || "—"}</td>
                        <td className="px-4 py-2.5 text-xs capitalize">{r.adverseReactionOutcome?.replace("_", " ") || "—"}</td>
                        <td className="px-4 py-2.5">
                          {vetReported ? (
                            <span className="flex items-center gap-1 text-xs text-green-700"><CheckCircle2 className="w-3.5 h-3.5" />{formatDate(r.reportedToVetDate)}</span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-red-600"><XCircle className="w-3.5 h-3.5" />Not reported</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-xs font-mono">
                          {sarssReported ? (
                            <span className="flex items-center gap-1 text-green-700"><ShieldCheck className="w-3.5 h-3.5" />{r.vmdSarssRef || "Submitted"}</span>
                          ) : (
                            <span className="text-muted-foreground">Pending</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          <Button size="sm" variant="ghost" onClick={() => openEdit(r)} className="h-7 w-7 p-0">
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {statusFilter !== "analytics" && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <Input placeholder="Search medicine, ref, ear tag, reason..." className="pl-9 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <CropYearSelector value={cropYear} onChange={setCropYear} />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setHistoryOpen(true)} className="gap-2">
                <History className="w-4 h-4" /> Full History
              </Button>
              <Button variant="outline" size="sm" onClick={() => printMedicineRegister(filtered, herds, animals, farm, filterLabel)} className="gap-2">
                <Printer className="w-4 h-4" /> Print Register
              </Button>
              <Button onClick={() => { setEditing(null); setForm(EMPTY_FORM); setTagValidations([]); setFormOpen(true); }} className="gap-2" size="sm">
                <Plus className="w-4 h-4" /> Add Record
              </Button>
            </div>
          </div>

          {medicineQ.isLoading ? (
            <div className="text-center py-12 text-foreground/50"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading...</div>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="text-center py-16 px-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/5 flex items-center justify-center mb-4">
                  <HeartPulse className="w-8 h-8 text-primary/40" />
                </div>
                <h3 className="text-lg font-semibold text-foreground/80 mb-1">No medicine records</h3>
                <p className="text-foreground/50 text-sm">{search ? "No records match your search." : statusFilter === "all" ? "Record all veterinary medicines administered to your livestock." : `No records in the "${filterLabel}" category.`}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map(r => (
                <RecordCard key={r.id} record={r} herds={herds} animals={animals} prescriptions={prescriptions} onEdit={openEdit} onDelete={setDeleteId} onView={setViewRecord} onRaiseTask={setRaiseTaskRecord} />
              ))}
            </div>
          )}
        </>
      )}

      {historyOpen && <MedHistoryDialog records={allRecords} herds={herds} onClose={() => setHistoryOpen(false)} />}

      {/* ── View dialog ──────────────────────────────────── */}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: 520 }}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><HeartPulse className="w-5 h-5 text-primary" />Medicine Record</DialogTitle>
              <DialogDescription>Full record detail for audit and compliance purposes.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 text-sm py-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><p className="text-xs text-gray-500 uppercase font-medium mb-1">Medicine</p><p className="font-semibold">{viewRecord.medicineName}</p></div>
                {viewRecord.medicineRef && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Reference</p><p className="font-mono text-xs">{viewRecord.medicineRef}</p></div>}
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Status</p><StatusBadge record={viewRecord} /></div>
                <div className="col-span-2 bg-violet-50 border border-violet-200 rounded-lg p-3">
                  <p className="text-xs text-violet-700 uppercase font-semibold mb-2 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />Animal Traceability
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-500 uppercase font-medium mb-0.5 text-[10px]">Treatment Scope</p>
                      <p className="font-semibold capitalize">
                        {viewRecord.treatmentScope === "individual" ? "Individual Animal" :
                         viewRecord.treatmentScope === "group" ? "Group / Batch" :
                         viewRecord.treatmentScope === "whole_herd" ? "Whole Herd" : "—"}
                      </p>
                    </div>
                    {viewRecord.treatmentScope === "individual" && viewRecord.animalId && (
                      <div>
                        <p className="text-gray-500 uppercase font-medium mb-0.5 text-[10px]">Ear Tag</p>
                        <p className="font-semibold font-mono">
                          {(() => { const a = animals.find(x => x.id === viewRecord.animalId); return a?.earTagNumber ?? a?.tagNumber ?? `Animal #${viewRecord.animalId}`; })()}
                        </p>
                      </div>
                    )}
                    {viewRecord.herdId && (
                      <div><p className="text-gray-500 uppercase font-medium mb-0.5 text-[10px]">Herd / Group</p><p className="font-semibold">{herds.find(h => h.id === viewRecord.herdId)?.name ?? `Herd #${viewRecord.herdId}`}</p></div>
                    )}
                    {viewRecord.treatedAnimalCount && (
                      <div><p className="text-gray-500 uppercase font-medium mb-0.5 text-[10px]">Animals Treated</p><p className="font-semibold">{viewRecord.treatedAnimalCount}</p></div>
                    )}
                    {viewRecord.treatedAnimalTags && (
                      <div className="col-span-2">
                        <p className="text-gray-500 uppercase font-medium mb-1 text-[10px]">Verified Ear Tags</p>
                        <div className="flex flex-wrap gap-1">
                          {viewRecord.treatedAnimalTags.split(",").map(t => t.trim()).filter(Boolean).map(tag => {
                            const a = lookupAnimalByTag(tag, animals);
                            return (
                              <span key={tag} className={`inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full border ${a ? "bg-green-50 text-green-800 border-green-200" : "bg-gray-50 text-gray-600 border-gray-200"}`}>
                                {a && <CheckCircle2 className="w-3 h-3" />}{tag}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Administered Date</p><p>{formatDate(viewRecord.administeredDate)}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Administered By</p><p>{viewRecord.administeredBy || "—"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Dosage</p><p>{viewRecord.dosage || "—"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Route</p><p>{viewRecord.administrationRoute || "—"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Batch Number</p><p className="font-mono text-xs">{viewRecord.batchNumber || "—"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Vet</p><p>{viewRecord.vetName || "—"}</p></div>
                {viewRecord.withdrawalPeriodDays != null && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Withdrawal Period</p><p>{viewRecord.withdrawalPeriodDays} days</p></div>}
                {viewRecord.withdrawalEndDate && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Withdrawal End</p><p>{formatDate(viewRecord.withdrawalEndDate)}</p></div>}
              </div>
              {viewRecord.reason && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Reason</p><p className="text-gray-700 whitespace-pre-line">{viewRecord.reason}</p></div>}
              {viewRecord.notes && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Notes</p><p className="text-gray-700 whitespace-pre-line">{viewRecord.notes}</p></div>}
              {viewRecord.prescriptionId && (() => {
                const rx = prescriptions.find(p => p.id === viewRecord.prescriptionId);
                if (!rx) return null;
                return (
                  <div className="mt-2 p-3 rounded-lg border border-purple-200 bg-purple-50 text-sm text-purple-900">
                    <p className="font-semibold mb-1 flex items-center gap-1.5 text-purple-800"><ClipboardList className="w-4 h-4" />Linked Prescription</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
                      {rx.productName && <span><span className="font-medium text-purple-700">Product:</span> {rx.productName}</span>}
                      {rx.prescriptionRef && <span><span className="font-medium text-purple-700">Ref:</span> {rx.prescriptionRef}</span>}
                      {rx.vetName && <span><span className="font-medium text-purple-700">Vet:</span> {rx.vetName}</span>}
                      {rx.prescriptionDate && <span><span className="font-medium text-purple-700">Issued:</span> {formatDate(rx.prescriptionDate)}</span>}
                      {rx.expiryDate && <span><span className="font-medium text-purple-700">Expires:</span> {formatDate(rx.expiryDate)}</span>}
                      {rx.withdrawalPeriodMeat != null && <span><span className="font-medium text-purple-700">W/D Meat:</span> {rx.withdrawalPeriodMeat}d</span>}
                      {rx.withdrawalPeriodMilk != null && <span><span className="font-medium text-purple-700">W/D Milk:</span> {rx.withdrawalPeriodMilk}d</span>}
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}><Pencil size={14} className="mr-1" />Edit</Button>
              <Button variant="ghost" onClick={() => setViewRecord(null)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Add / Edit form dialog ────────────────────────── */}
      <Dialog open={formOpen} onOpenChange={(o) => { if (!o) closeForm(); }}>
        <DialogContent style={{ maxWidth: "60rem" }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-primary" />
              {editing ? "Edit Medicine Record" : "Add Medicine Record"}
            </DialogTitle>
            <DialogDescription>
              {editing?.medicineRef && <span className="font-mono text-xs text-foreground/50 mr-2">Ref: {editing.medicineRef}</span>}
              Required under Red Tractor Livestock Standards and the Veterinary Medicines Regulations 2013.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 pt-1">

            {/* Traceability section */}
            <div className="border border-violet-200 bg-violet-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-violet-800 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />Animal Traceability (Red Tractor / VMR 2013 required)
              </p>

              {/* Scope selector */}
              <div className="flex gap-2 mb-4">
                {(["individual", "group", "whole_herd"] as TreatmentScope[]).map(scope => (
                  <button
                    key={scope}
                    type="button"
                    onClick={() => {
                      const autoCount = scope === "whole_herd" && form.herdId
                        ? String(animals.filter(a => a.herdId === Number(form.herdId)).length || "")
                        : "";
                      setForm(f => ({ ...f, treatmentScope: scope, animalId: "", treatedAnimalCount: autoCount, treatedAnimalTags: "" }));
                    }}
                    className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${form.treatmentScope === scope
                      ? "border-violet-500 bg-violet-100 text-violet-800"
                      : "border-border bg-white text-foreground/60 hover:border-violet-300"}`}
                  >
                    {scope === "individual"
                      ? <span className="flex items-center justify-center gap-1.5"><User className="w-3.5 h-3.5" />Individual Animal</span>
                      : scope === "group"
                      ? <span className="flex items-center justify-center gap-1.5"><Users className="w-3.5 h-3.5" />Group / Batch</span>
                      : <span className="flex items-center justify-center gap-1.5"><Users className="w-3.5 h-3.5" />Whole Herd</span>
                    }
                  </button>
                ))}
              </div>

              {/* Individual scope */}
              {form.treatmentScope === "individual" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-foreground/70 mb-1 block">Select Animal <span className="text-red-500">*</span></label>
                    {animals.length > 0 ? (
                      <select
                        className="w-full h-12 rounded-xl border-2 border-border bg-white px-4 py-2 text-base focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                        value={form.animalId}
                        onChange={e => setForm(f => ({ ...f, animalId: e.target.value }))}
                        required={form.treatmentScope === "individual"}
                      >
                        <option value="">Select animal by ear tag...</option>
                        {animals.map(a => <option key={a.id} value={a.id}>{animalShortLabel(a)}</option>)}
                      </select>
                    ) : (
                      <div>
                        <Input
                          placeholder="Enter ear tag number (e.g. UK123456/0001)"
                          value={form.treatedAnimalTags}
                          onChange={e => setForm(f => ({ ...f, treatedAnimalTags: e.target.value }))}
                          required={form.treatmentScope === "individual"}
                        />
                        <p className="text-xs text-foreground/50 mt-1">No animals registered — enter ear tag manually.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Group scope — with ear tag validator */}
              {form.treatmentScope === "group" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-foreground/70 mb-1 block">Herd / Group <span className="text-red-500">*</span></label>
                    <select
                      className="w-full h-12 rounded-xl border-2 border-border bg-white px-4 py-2 text-base focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                      value={form.herdId}
                      onChange={e => setForm(f => ({ ...f, herdId: e.target.value }))}
                      required
                    >
                      <option value="">Select herd / group...</option>
                      {herds.map(h => <option key={h.id} value={h.id}>{h.name} ({h.type})</option>)}
                    </select>
                  </div>
                  <EarTagValidatorPanel
                    rawInput={form.treatedAnimalTags}
                    onRawChange={v => setForm(f => ({ ...f, treatedAnimalTags: v }))}
                    validations={tagValidations}
                    onValidate={runTagValidation}
                    onCorrect={applyCorrection}
                  />
                  {/* Auto-updated count from validation */}
                  <div>
                    <label className="text-sm font-medium text-foreground/70 mb-1 block">Animals Treated</label>
                    <Input
                      type="number" min="1"
                      value={tagValidations.length > 0 ? String(tagValidations.filter(v => v.animal).length) : form.treatedAnimalCount}
                      readOnly={tagValidations.length > 0}
                      onChange={e => setForm(f => ({ ...f, treatedAnimalCount: e.target.value }))}
                      className={tagValidations.length > 0 ? "bg-green-50 text-green-800 font-semibold" : ""}
                    />
                    {tagValidations.length > 0 && (
                      <p className="text-xs text-green-700 mt-1">Auto-set from {tagValidations.filter(v => v.animal).length} verified tags.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Whole herd scope */}
              {form.treatmentScope === "whole_herd" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-foreground/70 mb-1 block">Herd <span className="text-red-500">*</span></label>
                    <select
                      className="w-full h-12 rounded-xl border-2 border-border bg-white px-4 py-2 text-base focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                      value={form.herdId}
                      onChange={e => {
                        const newHerdId = e.target.value;
                        const autoCount = newHerdId
                          ? String(animals.filter(a => a.herdId === Number(newHerdId)).length || "")
                          : form.treatedAnimalCount;
                        setForm(f => ({ ...f, herdId: newHerdId, treatedAnimalCount: autoCount }));
                      }}
                      required
                    >
                      <option value="">Select herd...</option>
                      {herds.map(h => <option key={h.id} value={h.id}>{h.name} ({h.type})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground/70 mb-1 block">Total Animals in Herd</label>
                    <Input
                      type="number" min="1"
                      placeholder="Auto-filled from registered animals"
                      value={form.treatedAnimalCount}
                      onChange={e => setForm(f => ({ ...f, treatedAnimalCount: e.target.value }))}
                    />
                    {form.herdId && Number(form.treatedAnimalCount) > 0 && (
                      <p className="text-xs text-violet-700 mt-1">Auto-filled · adjust if animals have moved in/out.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Medicine details */}
            <datalist id="vmd-medicine-list">
              {VMD_MEDICINES.map(m => <option key={m.name} value={m.name} />)}
            </datalist>
            <datalist id="vet-name-list">
              {uniqueVetNames.map(n => <option key={n} value={n} />)}
            </datalist>

            <div className="grid grid-cols-2 gap-4">
              {/* Medicine Name — VMD autocomplete */}
              <div className="col-span-2">
                <label className="text-sm font-medium text-foreground/70 mb-1 block">
                  Medicine Name <span className="text-red-500">*</span>
                  <span className="ml-2 text-xs font-normal text-foreground/40">Start typing to search the UK VMD reference list of licensed veterinary medicines</span>
                </label>
                <Input
                  list="vmd-medicine-list"
                  placeholder="e.g. Alamycin 300, Metacam 20 mg/ml, Draxxin..."
                  value={form.medicineName}
                  onChange={e => {
                    const val = e.target.value;
                    const match = findVmdMedicine(val);
                    setVmdMatch(match);
                    setForm(f => ({
                      ...f,
                      medicineName: val,
                      administrationRoute: match?.route && !f.administrationRoute ? match.route : f.administrationRoute,
                    }));
                  }}
                  required
                />
                {/* VMD verification badge */}
                {form.medicineName.length >= 3 && (
                  vmdMatch ? (
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                        <BadgeCheck className="w-3 h-3" />VMD Reference Listed
                      </span>
                      <span className="text-xs text-foreground/60">{vmdMatch.activeIngredient}</span>
                      <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-foreground/70">{vmdMatch.legalCategory}</span>
                      <span className="text-xs text-foreground/50">{vmdMatch.species.join(", ")}</span>
                    </div>
                  ) : (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-700">
                      <Info className="w-3 h-3 shrink-0" />
                      Not found in VMD reference list — verify product name against{" "}
                      <a href="https://www.vmd.defra.gov.uk/productinformationdatabase/" target="_blank" rel="noopener noreferrer" className="underline">vmd.defra.gov.uk</a>
                    </div>
                  )
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Batch / Licence Number</label>
                <Input placeholder="e.g. UK/V/0083451/0001" value={form.batchNumber} onChange={e => setForm(f => ({ ...f, batchNumber: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Administered By</label>
                <Input placeholder="Name of person administering" value={form.administeredBy} onChange={e => setForm(f => ({ ...f, administeredBy: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Date Administered <span className="text-red-500">*</span></label>
                <Input type="date" value={form.administeredDate} onChange={e => setForm(f => ({ ...f, administeredDate: e.target.value }))} required />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Administration Route</label>
                <select className="w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                  value={ADMIN_ROUTES.filter(r => r !== "Other").includes(form.administrationRoute) ? form.administrationRoute : (form.administrationRoute ? "Other" : "")}
                  onChange={e => setForm(f => ({ ...f, administrationRoute: e.target.value }))}>
                  <option value="">Select route...</option>
                  {ADMIN_ROUTES.map(r => <option key={r} value={r}>{r === "Other" ? "Other (please specify)" : r}</option>)}
                </select>
                {(form.administrationRoute === "Other" || (form.administrationRoute && !ADMIN_ROUTES.filter(r => r !== "Other").includes(form.administrationRoute))) && (
                  <Input
                    className="mt-1.5"
                    value={form.administrationRoute === "Other" ? "" : form.administrationRoute}
                    onChange={e => setForm(f => ({ ...f, administrationRoute: e.target.value || "Other" }))}
                    placeholder="Please specify administration route…"
                    autoFocus={form.administrationRoute === "Other"}
                  />
                )}
                {vmdMatch && form.administrationRoute && form.administrationRoute !== "Other" && form.administrationRoute !== vmdMatch.route && (
                  <p className="text-xs text-foreground/50 mt-1">VMD reference typical route: {vmdMatch.route}</p>
                )}
              </div>

              {/* Structured dosage — amount + unit */}
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">
                  Dose Given (per animal)
                  <span className="ml-1 text-xs font-normal text-foreground/40">total amount administered</span>
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="Amount"
                    className="flex-1"
                    value={form.doseAmount}
                    onChange={e => setForm(f => ({ ...f, doseAmount: e.target.value }))}
                  />
                  <select
                    className="h-12 rounded-xl border-2 border-border bg-transparent px-3 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 min-w-[90px]"
                    value={form.doseUnit}
                    onChange={e => setForm(f => ({ ...f, doseUnit: e.target.value }))}
                  >
                    {DOSE_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                {/* If editing and original dosage didn't parse, show it as a hint */}
                {editing && form.dosage && !form.doseAmount && (
                  <p className="text-xs text-foreground/50 mt-1">Saved value: {form.dosage}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Withdrawal Period (days)</label>
                <Input type="number" min="0" placeholder="e.g. 7 — leave blank if none" value={form.withdrawalPeriodDays} onChange={e => setForm(f => ({ ...f, withdrawalPeriodDays: e.target.value }))} />
                {previewWdEnd && <p className="text-xs text-amber-700 mt-1 font-medium">Withdrawal ends: {formatDate(previewWdEnd)}</p>}
              </div>

              {/* Prescribing Vet — lookup from vet health plans */}
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">
                  Prescribing Vet
                  {uniqueVetNames.length > 0 && <span className="ml-1 text-xs font-normal text-foreground/40">— select from your registered vets or type a new name</span>}
                </label>
                <Input
                  list="vet-name-list"
                  placeholder={uniqueVetNames.length > 0 ? "Type or select vet name..." : "Vet name / practice"}
                  value={form.vetName}
                  onChange={e => setForm(f => ({ ...f, vetName: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Reason / Indication</label>
                <Input placeholder="e.g. Mastitis, lameness, respiratory" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Notes</label>
                <Input placeholder="Any additional information..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>

              {/* ── Linked Prescription ── */}
              <div className="col-span-full pt-1">
                <label className="text-sm font-medium text-foreground/70 mb-1 block flex items-center gap-1.5">
                  <ClipboardList className="w-3.5 h-3.5" />
                  Link to Written Prescription
                  <span className="ml-1 text-xs font-normal text-foreground/40">— optional, creates audit trail</span>
                </label>
                <PrescriptionCombobox
                  prescriptions={prescriptions}
                  value={form.prescriptionId ?? ""}
                  onChange={id => setForm(f => ({ ...f, prescriptionId: id }))}
                />
                {(() => {
                  const linkedRx = form.prescriptionId ? prescriptions.find(p => p.id === Number(form.prescriptionId)) : null;
                  if (!linkedRx) return null;
                  return (
                    <div className="mt-2 p-3 rounded-lg border border-blue-200 bg-blue-50 text-xs text-blue-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-blue-800"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />Prescription found</div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                        {linkedRx.productName && <span><span className="font-medium">Product:</span> {linkedRx.productName}</span>}
                        {linkedRx.activeIngredient && <span><span className="font-medium">Active:</span> {linkedRx.activeIngredient}</span>}
                        {linkedRx.vetName && <span><span className="font-medium">Vet:</span> {linkedRx.vetName}</span>}
                        {linkedRx.expiryDate && <span><span className="font-medium">Expires:</span> {new Date(linkedRx.expiryDate).toLocaleDateString("en-GB")}</span>}
                        {linkedRx.withdrawalPeriodMeat != null && <span><span className="font-medium">W/D Meat:</span> {linkedRx.withdrawalPeriodMeat}d</span>}
                        {linkedRx.withdrawalPeriodMilk != null && <span><span className="font-medium">W/D Milk:</span> {linkedRx.withdrawalPeriodMilk}d</span>}
                      </div>
                      {linkedRx.indicationOrDiagnosis && <p className="italic text-blue-700">{linkedRx.indicationOrDiagnosis}</p>}
                    </div>
                  );
                })()}
              </div>

              {/* ── Stock Register Link ── */}
              <div className="col-span-full pt-3 border-t border-border/50">
                <label className="flex items-center gap-2 text-sm font-semibold text-foreground/80 mb-2">
                  <Tag className="w-3.5 h-3.5" />
                  Link to Stock Register
                  <span className="ml-1 text-xs font-normal text-foreground/40">— optional, auto-deducts from inventory</span>
                </label>
                {stockItemsForPicker.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Stock item</p>
                      <Select
                        value={String(form.stockItemId ?? "")}
                        onValueChange={v => setForm(f => ({
                          ...f,
                          stockItemId: v,
                          medicineName: v ? (stockItemsForPicker.find(s => String(s.id) === v)?.name ?? f.medicineName) : f.medicineName,
                        }))}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Select item from stock register…" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">— Not linked —</SelectItem>
                          {stockItemsForPicker.map(s => (
                            <SelectItem key={s.id} value={String(s.id)}>
                              {s.name}{s.unit ? ` (${s.unit})` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Quantity used from stock</p>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        className="h-8 text-sm"
                        placeholder="e.g. 10"
                        value={form.stockQuantityUsed}
                        onChange={e => setForm(f => ({ ...f, stockQuantityUsed: e.target.value }))}
                        disabled={!form.stockItemId}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No stock items found. Add medicines to your{" "}
                    <a href="/stock" className="underline text-blue-600">Stock Register</a> to enable automatic inventory deductions.
                  </p>
                )}
              </div>

              {/* ── Adverse Drug Reaction (VMR 2013 Reg 58 / SARSS) ── */}
              <div className="col-span-full">
                <div
                  className={`rounded-xl border-2 p-4 space-y-3 transition-colors ${form.adverseReactionSuspected ? "border-red-400 bg-red-50" : "border-border bg-muted/20"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HeartPulse className={`w-4 h-4 ${form.adverseReactionSuspected ? "text-red-600" : "text-muted-foreground"}`} />
                      <span className={`text-sm font-semibold ${form.adverseReactionSuspected ? "text-red-800" : "text-foreground/70"}`}>
                        Suspected Adverse Reaction (ADR)
                      </span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.adverseReactionSuspected}
                        onChange={e => setForm(f => ({ ...f, adverseReactionSuspected: e.target.checked }))}
                        className="w-4 h-4 accent-red-600"
                      />
                      <span className="text-sm text-foreground/70">Flag this treatment as a suspected ADR</span>
                    </label>
                  </div>
                  {form.adverseReactionSuspected && (
                    <>
                      <p className="text-xs text-red-800">VMR 2013 Reg 58: report to your prescribing vet immediately. Serious reactions must reach the VMD SARSS portal within 15 days; non-serious within 90 days.</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="text-sm font-medium text-red-800 mb-1 block">Clinical Signs Observed</label>
                          <Input
                            placeholder="Describe the adverse signs observed (e.g. anaphylaxis, injection-site reaction, neurological signs)"
                            value={form.adverseReactionSigns}
                            onChange={e => setForm(f => ({ ...f, adverseReactionSigns: e.target.value }))}
                            className="border-red-300 focus:border-red-500"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-red-800 mb-1 block">Severity</label>
                          <select
                            className="w-full h-12 rounded-xl border-2 border-red-300 bg-transparent px-4 py-2 text-base focus:outline-none focus:border-red-500"
                            value={form.adverseReactionSeverity}
                            onChange={e => setForm(f => ({ ...f, adverseReactionSeverity: e.target.value }))}
                          >
                            <option value="">Select severity...</option>
                            <option value="mild">Mild — self-limiting, no treatment required</option>
                            <option value="moderate">Moderate — required treatment</option>
                            <option value="severe">Severe — life-threatening</option>
                            <option value="fatal">Fatal</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-red-800 mb-1 block">Onset (hours after treatment)</label>
                          <Input
                            type="number" min="0" placeholder="e.g. 2"
                            value={form.adverseReactionOnsetHours}
                            onChange={e => setForm(f => ({ ...f, adverseReactionOnsetHours: e.target.value }))}
                            className="border-red-300"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-red-800 mb-1 block">Outcome</label>
                          <select
                            className="w-full h-12 rounded-xl border-2 border-red-300 bg-transparent px-4 py-2 text-base focus:outline-none focus:border-red-500"
                            value={form.adverseReactionOutcome}
                            onChange={e => setForm(f => ({ ...f, adverseReactionOutcome: e.target.value }))}
                          >
                            <option value="">Select outcome...</option>
                            <option value="recovered">Recovered</option>
                            <option value="recovering">Recovering</option>
                            <option value="not_recovered">Not recovered</option>
                            <option value="fatal">Fatal</option>
                            <option value="unknown">Unknown</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-red-800 mb-1 block">Date Reported to Vet</label>
                          <Input
                            type="date"
                            value={form.reportedToVetDate}
                            onChange={e => setForm(f => ({ ...f, reportedToVetDate: e.target.value }))}
                            className="border-red-300"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-red-800 mb-1 block">Date Vet Reported to VMD SARSS</label>
                          <Input
                            type="date"
                            value={form.vetReportedToVmdDate}
                            onChange={e => setForm(f => ({ ...f, vetReportedToVmdDate: e.target.value }))}
                            className="border-red-300"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-red-800 mb-1 block">VMD SARSS Reference Number</label>
                          <Input
                            placeholder="e.g. SARSS-2025-12345"
                            value={form.vmdSarssRef}
                            onChange={e => setForm(f => ({ ...f, vmdSarssRef: e.target.value }))}
                            className="border-red-300"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-red-700 italic">Report via the VMD SARSS online portal at <a href="https://www.vmd.defra.gov.uk/adversereactionreporting/" target="_blank" rel="noopener noreferrer" className="underline">vmd.defra.gov.uk/adversereactionreporting/</a></p>
                    </>
                  )}
                </div>
              </div>

              {/* ── Organic compliance ── shown when organic herd selected or isOrganicTreatment is already set */}
              {(isOrganicHerdSelected || form.isOrganicTreatment) && (
                <div className="col-span-full rounded-xl border-2 border-green-400 bg-green-50 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-800 bg-green-100 border border-green-300 rounded-full px-2.5 py-1">
                      🌿 Organic Treatment Compliance
                    </span>
                    {selectedHerd?.organicCertBody && (
                      <span className="text-xs text-green-700">{selectedHerd.organicCertBody}{selectedHerd.organicCertNumber ? ` · ${selectedHerd.organicCertNumber}` : ""}</span>
                    )}
                  </div>
                  <p className="text-xs text-green-800">UK organic standards require withdrawal periods to be <strong>doubled</strong> for organic animals. Complete the fields below to generate a compliant organic treatment record.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-green-800 mb-1 block">Doubled Withdrawal Period (days)</label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Standard × 2"
                        value={form.doubledWithdrawalDays}
                        onChange={e => setForm(f => ({ ...f, doubledWithdrawalDays: e.target.value, isOrganicTreatment: true }))}
                        className="border-green-300 focus:border-green-500"
                      />
                      {form.withdrawalPeriodDays && !form.doubledWithdrawalDays && (
                        <button
                          type="button"
                          className="mt-1 text-xs text-green-700 underline"
                          onClick={() => setForm(f => ({ ...f, doubledWithdrawalDays: String(Number(form.withdrawalPeriodDays) * 2), isOrganicTreatment: true }))}
                        >
                          Auto-fill: {Number(form.withdrawalPeriodDays) * 2} days (standard × 2)
                        </button>
                      )}
                      {previewDoubledWdEnd && (
                        <p className="text-xs text-green-700 mt-1 font-medium">Organic withdrawal ends: {formatDate(previewDoubledWdEnd)}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-green-800 mb-1 block">Certifier Notified?</label>
                      <div className="flex items-center gap-3 h-12">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.certifierNotified}
                            onChange={e => setForm(f => ({ ...f, certifierNotified: e.target.checked, isOrganicTreatment: true }))}
                            className="w-4 h-4 accent-green-600"
                          />
                          <span className="text-sm text-green-800">Certifier informed</span>
                        </label>
                      </div>
                    </div>
                    {form.certifierNotified && (
                      <div>
                        <label className="text-sm font-medium text-green-800 mb-1 block">Date Notified</label>
                        <Input
                          type="date"
                          value={form.certifierNotifiedDate}
                          onChange={e => setForm(f => ({ ...f, certifierNotifiedDate: e.target.value }))}
                          className="border-green-300"
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-green-700 italic">This treatment will be automatically logged in the Organic Treatment Compliance register for this herd.</p>
                </div>
              )}
            </div>

            {/* Unmatched tag warning inline */}
            {form.treatmentScope === "group" && unmatchedCount > 0 && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-sm text-amber-800">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{unmatchedCount} ear tag{unmatchedCount !== 1 ? "s" : ""} still unmatched. Correct them above before saving, or save now and they will not appear on individual animal records.</span>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {editing ? "Save Changes" : "Add to Register"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Unmatched tags confirmation dialog ───────────── */}
      <Dialog open={!!pendingBodyWithUnmatched} onOpenChange={() => setPendingBodyWithUnmatched(null)}>
        <DialogContent style={{ maxWidth: "30rem" }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              Unverified Ear Tags
            </DialogTitle>
            <DialogDescription>
              {unmatchedCount} ear tag{unmatchedCount !== 1 ? "s" : ""} could not be matched to a registered animal. Those animals will not have this medicine record on their individual profile.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-foreground/70 px-1">
            You can go back and correct the tags, or save now. The unmatched tags will be discarded from the record — only the verified animals will be linked.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingBodyWithUnmatched(null)}>Go back and fix</Button>
            <Button variant="destructive" onClick={confirmSaveWithUnmatched} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Save with verified tags only
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirmation ───────────────────────────── */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent style={{ maxWidth: "28rem" }}>
          <DialogHeader>
            <DialogTitle>Delete Medicine Record</DialogTitle>
            <DialogDescription>This will permanently remove the record from the medicine register. This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && deleteM.mutate(deleteId)} disabled={deleteM.isPending}>
              {deleteM.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {raiseTaskRecord && (
        <RaiseTaskDialog
          farmId={farmId}
          open={!!raiseTaskRecord}
          onClose={() => setRaiseTaskRecord(null)}
          defaultTitle={`Withdrawal check: ${raiseTaskRecord.medicineName} — due ${raiseTaskRecord.withdrawalEndDate ? new Date(raiseTaskRecord.withdrawalEndDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "TBC"}`}
          defaultDescription={`Verify animals treated with ${raiseTaskRecord.medicineName} have completed their withdrawal period before slaughter or milk use.`}
          defaultDueDate={raiseTaskRecord.withdrawalEndDate?.slice(0, 10) ?? ""}
          taskType="medicine_followup"
          module="Medicine Register"
        />
      )}
    </>
  );
}
