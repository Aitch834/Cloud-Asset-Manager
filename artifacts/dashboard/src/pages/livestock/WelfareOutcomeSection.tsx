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
import { LabSelector } from "@/components/ui/LabSelector";
import { useFarmMembers, memberFullName } from "@/hooks/use-farm-members";
import { StaffSelect } from "@/components/ui/staff-select";

import { formatDate, formatDateLong, ConfirmDialog, PRODUCTION_TYPE_OPTIONS, EMPTY_SIRE, EMPTY_STRAW, EMPTY_HERD, EMPTY_PLAN, EMPTY_ANIMAL, PrintHerdRegisterDialog, PrintVetPlanDialog, getHerdNumberConfig, getBreedPlaceholder, getHerdNamePlaceholder, ANIMAL_SPECIES_FALLBACK, ANIMAL_STATUS_LABELS, MOVEMENT_TYPE_LABELS, OUTCOME_COLOURS, DOC_TYPE_LABELS } from "./shared";
import type { Farm, Herd, VetHealthPlan, VetHealthPlanActionCompletion, VetHealthPlanAction, MortalityRecord, FallenStockContractor, FeedRecord, WaterRecord, Animal, Sire, StrawInventory, AnimalDoc, VaccHistoryRecord, AnimalProfile } from "./shared";


// ─── Welfare Outcome Assessment ────────────────────────────────────────────────

interface WelfareOutcomeRecord {
  id: number; farmId: number; assessmentDate: string;
  assessorName: string; assessorRole: string | null;
  assessorType: string;
  assessorMemberId: number | null; assessorSupplierId: number | null;
  expectedFeeAmountPence: number | null; purchaseOrderId: number | null;
  species: string; herdFlockRef: string | null; sampleSize: number | null;
  lamenessScore: string | null; bodyConditionScore: string | null;
  dungScore: string | null; skinLesionScore: string | null;
  nasalDischargeScore: string | null; eyeDischargeScore: string | null;
  mortalityRate: string | null; calvingLambingScore: string | null;
  dagScore: string | null; tailBitingScore: string | null; snoutRootingScore: string | null;
  featherCoverageScore: string | null; footpadDermatitisScore: string | null;
  hockBurnScore: string | null; culledBirdsRate: string | null;
  stockingDensityCompliant: string | null;
  overallOutcome: string; correctiveActions: string | null;
  targetDate: string | null; nextAssessmentDue: string | null;
  documentUrl: string | null; documentName: string | null; documentPath: string | null;
  notes: string | null;
}

const EMPTY_WOA: Omit<WelfareOutcomeRecord, "id" | "farmId"> = {
  assessmentDate: "", assessorName: "", assessorRole: null,
  assessorType: "external", assessorMemberId: null, assessorSupplierId: null,
  expectedFeeAmountPence: null, purchaseOrderId: null,
  species: "", herdFlockRef: null, sampleSize: null,
  lamenessScore: null, bodyConditionScore: null, dungScore: null,
  skinLesionScore: null, nasalDischargeScore: null, eyeDischargeScore: null,
  mortalityRate: null, calvingLambingScore: null,
  dagScore: null, tailBitingScore: null, snoutRootingScore: null,
  featherCoverageScore: null, footpadDermatitisScore: null,
  hockBurnScore: null, culledBirdsRate: null, stockingDensityCompliant: null,
  overallOutcome: "acceptable", correctiveActions: null,
  targetDate: null, nextAssessmentDue: null,
  documentUrl: null, documentName: null, documentPath: null, notes: null,
};

interface WalkThroughForm {
  observedBy: string; observerMemberId: number | null; assessmentDate: string; sampleSize: number | null;
  lamenessAffected: number | null; lamenessTotal: number | null;
  bcsAffected: number | null; bcsTotal: number | null;
  dungAffected: number | null; dungTotal: number | null;
  skinLesionAffected: number | null; skinLesionTotal: number | null;
  nasalDischargeAffected: number | null; nasalDischargeTotal: number | null;
  eyeDischargeAffected: number | null; eyeDischargeTotal: number | null;
  calvingLambingAffected: number | null; calvingLambingTotal: number | null;
  dagAffected: number | null; dagTotal: number | null;
  tailBitingAffected: number | null; tailBitingTotal: number | null;
  snoutRootingAffected: number | null; snoutRootingTotal: number | null;
  featherCoverageAffected: number | null; featherCoverageTotal: number | null;
  footpadDermatitisAffected: number | null; footpadDermatitisTotal: number | null;
  hockBurnAffected: number | null; hockBurnTotal: number | null;
  culledBirdsAffected: number | null; culledBirdsTotal: number | null;
  walkthroughNotes: string; weatherConditions: string;
}
const EMPTY_WALKTHROUGH: WalkThroughForm = {
  observedBy: "", observerMemberId: null, assessmentDate: "", sampleSize: null,
  lamenessAffected: null, lamenessTotal: null, bcsAffected: null, bcsTotal: null,
  dungAffected: null, dungTotal: null, skinLesionAffected: null, skinLesionTotal: null,
  nasalDischargeAffected: null, nasalDischargeTotal: null, eyeDischargeAffected: null, eyeDischargeTotal: null,
  calvingLambingAffected: null, calvingLambingTotal: null,
  dagAffected: null, dagTotal: null, tailBitingAffected: null, tailBitingTotal: null,
  snoutRootingAffected: null, snoutRootingTotal: null, featherCoverageAffected: null, featherCoverageTotal: null,
  footpadDermatitisAffected: null, footpadDermatitisTotal: null, hockBurnAffected: null, hockBurnTotal: null,
  culledBirdsAffected: null, culledBirdsTotal: null,
  walkthroughNotes: "", weatherConditions: "",
};

type SpeciesMeasure = { key: keyof typeof EMPTY_WOA; label: string; placeholder: string; isSelect?: boolean; options?: { value: string; label: string }[] };
function getSpeciesMeasures(species: string): SpeciesMeasure[] {
  const common: SpeciesMeasure[] = [
    { key: "lamenessScore", label: "Lameness (%)", placeholder: "% animals lame" },
    { key: "bodyConditionScore", label: "Body Condition (%)", placeholder: "% thin animals" },
    { key: "skinLesionScore", label: "Skin Lesions (%)", placeholder: "% with injuries" },
    { key: "nasalDischargeScore", label: "Nasal Discharge (%)", placeholder: "% respiratory signs" },
    { key: "eyeDischargeScore", label: "Eye Discharge (%)", placeholder: "% with eye issues" },
  ];
  if (species === "cattle" || species === "beef-cattle") return [
    ...common,
    { key: "dungScore", label: "Dung Score (%)", placeholder: "% dirty hindquarters" },
  ];
  if (species === "sheep") return [
    ...common,
    { key: "dagScore", label: "Dag / Fleece Score (%)", placeholder: "% with dirty fleece or dag" },
  ];
  if (species === "pigs") return [
    { key: "lamenessScore", label: "Lameness (%)", placeholder: "% animals lame" },
    { key: "bodyConditionScore", label: "Body Condition (%)", placeholder: "% thin sows (BCS <2)" },
    { key: "tailBitingScore", label: "Tail Biting / Wounds (%)", placeholder: "% with tail wounds" },
    { key: "snoutRootingScore", label: "Snout Damage (%)", placeholder: "% with snout lesions" },
    { key: "skinLesionScore", label: "Fight Wounds / Skin Lesions (%)", placeholder: "% with skin injuries" },
  ];
  if (species === "poultry") return [
    { key: "featherCoverageScore", label: "Feather Coverage (%)", placeholder: "% with poor feathering (score 3–4)" },
    { key: "footpadDermatitisScore", label: "Footpad Dermatitis (%)", placeholder: "% with FPD score ≥2" },
    { key: "hockBurnScore", label: "Hock Burn (%)", placeholder: "% with hock burn score ≥2" },
    { key: "culledBirdsRate", label: "Culled / Rejected Birds (%)", placeholder: "% culled or rejected at processing" },
    { key: "stockingDensityCompliant", label: "Stocking Density", placeholder: "", isSelect: true, options: [
      { value: "yes", label: "Yes — within legal maximum" },
      { value: "no", label: "No — exceeds legal maximum" },
      { value: "not_checked", label: "Not checked this assessment" },
    ]},
  ];
  return common;
}

type WalkCriterion = { label: string; affKey: keyof WalkThroughForm; totKey: keyof WalkThroughForm; resultKey: keyof typeof EMPTY_WOA };
function getWalkthroughCriteria(species: string): WalkCriterion[] {
  const base: WalkCriterion[] = [
    { label: "Lame animals", affKey: "lamenessAffected", totKey: "lamenessTotal", resultKey: "lamenessScore" },
    { label: "Thin / poor BCS", affKey: "bcsAffected", totKey: "bcsTotal", resultKey: "bodyConditionScore" },
    { label: "Skin lesions / injuries", affKey: "skinLesionAffected", totKey: "skinLesionTotal", resultKey: "skinLesionScore" },
    { label: "Nasal discharge", affKey: "nasalDischargeAffected", totKey: "nasalDischargeTotal", resultKey: "nasalDischargeScore" },
    { label: "Eye discharge", affKey: "eyeDischargeAffected", totKey: "eyeDischargeTotal", resultKey: "eyeDischargeScore" },
  ];
  if (species === "cattle" || species === "beef-cattle") return [...base,
    { label: "Dirty hindquarters", affKey: "dungAffected", totKey: "dungTotal", resultKey: "dungScore" },
  ];
  if (species === "sheep") return [...base,
    { label: "Dag / dirty fleece", affKey: "dagAffected", totKey: "dagTotal", resultKey: "dagScore" },
  ];
  if (species === "pigs") return [
    { label: "Lame animals", affKey: "lamenessAffected", totKey: "lamenessTotal", resultKey: "lamenessScore" },
    { label: "Thin / poor BCS (<2)", affKey: "bcsAffected", totKey: "bcsTotal", resultKey: "bodyConditionScore" },
    { label: "Tail biting / wounds", affKey: "tailBitingAffected", totKey: "tailBitingTotal", resultKey: "tailBitingScore" },
    { label: "Snout damage", affKey: "snoutRootingAffected", totKey: "snoutRootingTotal", resultKey: "snoutRootingScore" },
    { label: "Skin lesions / fight wounds", affKey: "skinLesionAffected", totKey: "skinLesionTotal", resultKey: "skinLesionScore" },
  ];
  if (species === "poultry") return [
    { label: "Poor feather coverage", affKey: "featherCoverageAffected", totKey: "featherCoverageTotal", resultKey: "featherCoverageScore" },
    { label: "Footpad dermatitis (≥2)", affKey: "footpadDermatitisAffected", totKey: "footpadDermatitisTotal", resultKey: "footpadDermatitisScore" },
    { label: "Hock burn (≥2)", affKey: "hockBurnAffected", totKey: "hockBurnTotal", resultKey: "hockBurnScore" },
    { label: "Culled / rejected birds", affKey: "culledBirdsAffected", totKey: "culledBirdsTotal", resultKey: "culledBirdsRate" },
  ];
  return base;
}

function calcPct(aff: number | null, tot: number | null): string | null {
  if (aff == null || tot == null || tot === 0) return null;
  return ((aff / tot) * 100).toFixed(1);
}

export function WelfareOutcomeSection({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const base = `/api/farms/${farmId}/welfare-outcome-assessments`;
  const { data, isLoading } = useQuery<{ records: WelfareOutcomeRecord[] }>({ queryKey: ["welfare-outcomes", farmId], queryFn: () => fetch(base).then(r => r.json()) });
  const records = data?.records ?? [];
  const [yearFilterWoa, setYearFilterWoa] = usePersistedFilter({ page: "livestock-woa", filter: "year", farmId, defaultValue: "all", isValid: v => v === "all" || /^\d{4}$/.test(v) });
  const yearsWoa = useMemo(() => Array.from(new Set(records.map(r => String(r.assessmentDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [records]);
  const filteredWoaRecords = yearFilterWoa === "all" ? records : records.filter(r => String(r.assessmentDate ?? "").startsWith(yearFilterWoa));

  const { data: herdsData } = useQuery<{ records: { id: number; name: string; type: string; productionType: string | null; herdNumber: string | null }[] }>({ queryKey: ["herds", farmId], queryFn: () => fetch(`/api/farms/${farmId}/herds`).then(r => r.json()) });
  const herds = herdsData?.records ?? [];

  const { data: membersData } = useFarmMembers(farmId);
  const members = (membersData?.members ?? []).filter(m => m.isActive);

  const { data: suppliersData } = useQuery<{ records: { id: number; name: string; contactName: string | null; phone: string | null; supplierType: string }[] }>({
    queryKey: ["woa-suppliers", farmId], queryFn: () => fetch(`/api/farms/${farmId}/woa-suppliers`).then(r => r.json()),
  });
  const suppliers = suppliersData?.records ?? [];

  const { uploadFile: uploadWoaDoc, isUploading: isUploadingWoaDoc } = useUpload();
  const [pendingWoaDoc, setPendingWoaDoc] = useState<{ path: string; name: string } | null>(null);
  const woaDocRef = useRef<HTMLInputElement>(null);

  const [viewItem, setViewItem] = useState<WelfareOutcomeRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<WelfareOutcomeRecord | null>(null);
  const [form, setForm] = useState<typeof EMPTY_WOA>({ ...EMPTY_WOA });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedHerdId, setSelectedHerdId] = useState<number | null>(null);
  const setF = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  // Walkthrough tally dialog (inline, pre-fills form fields when applied)
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [wt, setWt] = useState<WalkThroughForm>({ ...EMPTY_WALKTHROUGH });
  const setW = (k: string, v: unknown) => setWt(w => ({ ...w, [k]: v }));

  // Fee display — kept as a raw string so the input is never rewritten mid-type.
  // form.expectedFeeAmountPence is updated in parallel (for the PO notice condition)
  // but is NOT used as the input value to avoid the pence↔pounds conversion jitter.
  const [feeInputStr, setFeeInputStr] = useState<string>("");

  // Auto-calc: fetch mortality rate + calving/lambing score when a herd is selected
  const { data: autoCalc } = useQuery<{ mortalityRate: string | null; calvingLambingScore: string | null; herdSize: number; deathCount: number }>({
    queryKey: ["woa-auto-calc", farmId, selectedHerdId, form.species],
    queryFn: () => fetch(`/api/farms/${farmId}/woa-auto-calc?herdId=${selectedHerdId}&species=${form.species}`).then(r => r.json()),
    enabled: selectedHerdId !== null && showForm,
    staleTime: 60_000,
  });

  /**
   * Returns true when a registered herd should appear in the WOA herd dropdown
   * for the given WOA species selection.
   *
   * Uses the explicit `productionType` field when set for precise filtering
   * (e.g. a Dairy WOA will NOT show a herd whose productionType is "beef").
   * Falls back to inferring from the herd type string for legacy records.
   * A herd with no production type specified always shows for any matching species.
   */
  function woaSpeciesMatchesHerdType(woaSpecies: string, herdType: string, productionType?: string | null): boolean {
    const s = woaSpecies.toLowerCase();
    const t = herdType.toLowerCase();

    if (s === "cattle" || s === "beef-cattle") {
      // First: check the canonical species matches cattle
      const isCattleHerd = canonicalHerdSpecies(t) === "cattle";
      if (!isCattleHerd) return false;

      const p = (productionType ?? "").toLowerCase().trim();
      if (p) {
        // Explicit production type set — filter precisely
        const pIsBeef = p === "beef" || p === "suckler";
        const pIsDairy = p === "dairy";
        const pIsMixed = p === "mixed" || p === "mixed (beef & dairy)";
        if (s === "cattle")       return pIsDairy || pIsMixed || (!pIsBeef && !pIsDairy); // Dairy WOA
        if (s === "beef-cattle")  return pIsBeef  || pIsMixed || (!pIsBeef && !pIsDairy); // Beef WOA
      }
      // No explicit production type — fall back to type-string inference for legacy data
      const typeIsOnlyDairy = t.includes("dairy") && !t.includes("beef") && !t.includes("suckler");
      const typeIsOnlyBeef  = (t.includes("beef") || t.includes("suckler")) && !t.includes("dairy");
      if (typeIsOnlyDairy) return s === "cattle";       // explicitly dairy-only → Dairy WOA only
      if (typeIsOnlyBeef)  return s === "beef-cattle";  // explicitly beef-only → Beef WOA only
      return true; // generic cattle → matches both Dairy and Beef WOA
    }

    if (s === "sheep")   return canonicalHerdSpecies(t) === "sheep";
    if (s === "pigs")    return canonicalHerdSpecies(t) === "pigs";
    if (s === "poultry") return canonicalHerdSpecies(t) === "poultry";
    if (s === "goats")   return canonicalHerdSpecies(t) === "goats";
    return canonicalHerdSpecies(t) === s;
  }
  const filteredHerds = herds.filter(h => woaSpeciesMatchesHerdType(form.species, h.type, h.productionType));
  // When no herds match the species (fallback to all herds), any selection is valid.
  const herdPool = filteredHerds.length > 0 ? filteredHerds : herds;
  const currentHerdStillValid = !form.herdFlockRef || herdPool.some(h => h.name === form.herdFlockRef);

  const createMut = useMutation({ mutationFn: (b: typeof EMPTY_WOA) => fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ["welfare-outcomes", farmId] }); setShowForm(false); setForm({ ...EMPTY_WOA }); setPendingWoaDoc(null); setFeeInputStr(""); }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const updateMut = useMutation({ mutationFn: (b: typeof EMPTY_WOA & { id: number }) => fetch(`${base}/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ["welfare-outcomes", farmId] }); setShowForm(false); setEditing(null); setPendingWoaDoc(null); setFeeInputStr(""); }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const deleteMut = useMutation({ mutationFn: (id: number) => fetch(`${base}/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ["welfare-outcomes", farmId] }); setDeleteId(null); }, onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const walkthroughMut = useMutation({
    mutationFn: (b: WalkThroughForm & { woaId: number | null; species: string; herdFlockRef: string | null }) =>
      fetch(`/api/farms/${farmId}/woa-walkthrough`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["welfare-outcomes", farmId] }); qc.invalidateQueries({ queryKey: ["woa-walkthroughs", farmId] }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const activeWoaId = viewItem?.id ?? editing?.id ?? null;
  const { data: linkedWalkthroughsData } = useQuery<{ records: Array<{ id: number; assessmentDate: string; observedBy: string; sampleSize: number | null; walkthroughNotes: string | null; weatherConditions: string | null; appliedToWoa: boolean; createdAt: string }> }>({
    queryKey: ["woa-walkthroughs", farmId, activeWoaId],
    queryFn: () => fetch(`/api/farms/${farmId}/woa-walkthrough?woaId=${activeWoaId}`).then(r => r.json()),
    enabled: activeWoaId !== null,
  });
  const linkedWalkthroughs = linkedWalkthroughsData?.records ?? [];

  const applyWalkthroughMut = useMutation({
    mutationFn: (wtId: number) => fetch(`/api/farms/${farmId}/woa-walkthrough/${wtId}/apply`, { method: "POST" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["welfare-outcomes", farmId] }); qc.invalidateQueries({ queryKey: ["woa-walkthroughs", farmId] }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const deleteWalkthroughMut = useMutation({
    mutationFn: (wtId: number) => fetch(`/api/farms/${farmId}/woa-walkthrough/${wtId}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["woa-walkthroughs", farmId] }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function openEdit(r: WelfareOutcomeRecord) {
    setEditing(r); setPendingWoaDoc(null);
    setFeeInputStr(r.expectedFeeAmountPence != null ? (r.expectedFeeAmountPence / 100).toString() : "");
    setForm({
      assessmentDate: r.assessmentDate, assessorName: r.assessorName, assessorRole: r.assessorRole ?? null,
      assessorType: r.assessorType ?? "external", assessorMemberId: r.assessorMemberId ?? null,
      assessorSupplierId: r.assessorSupplierId ?? null, expectedFeeAmountPence: r.expectedFeeAmountPence ?? null,
      purchaseOrderId: r.purchaseOrderId ?? null,
      species: r.species, herdFlockRef: r.herdFlockRef ?? null, sampleSize: r.sampleSize,
      lamenessScore: r.lamenessScore ?? null, bodyConditionScore: r.bodyConditionScore ?? null,
      dungScore: r.dungScore ?? null, skinLesionScore: r.skinLesionScore ?? null,
      nasalDischargeScore: r.nasalDischargeScore ?? null, eyeDischargeScore: r.eyeDischargeScore ?? null,
      mortalityRate: r.mortalityRate ?? null, calvingLambingScore: r.calvingLambingScore ?? null,
      dagScore: r.dagScore ?? null, tailBitingScore: r.tailBitingScore ?? null, snoutRootingScore: r.snoutRootingScore ?? null,
      featherCoverageScore: r.featherCoverageScore ?? null, footpadDermatitisScore: r.footpadDermatitisScore ?? null,
      hockBurnScore: r.hockBurnScore ?? null, culledBirdsRate: r.culledBirdsRate ?? null,
      stockingDensityCompliant: r.stockingDensityCompliant ?? null,
      overallOutcome: r.overallOutcome, correctiveActions: r.correctiveActions ?? null,
      targetDate: r.targetDate ?? null, nextAssessmentDue: r.nextAssessmentDue ?? null,
      documentUrl: r.documentUrl ?? null, documentName: r.documentName ?? null, documentPath: r.documentPath ?? null,
      notes: r.notes ?? null,
    });
    if (r.herdFlockRef) { const h = herds.find(hx => hx.name === r.herdFlockRef); setSelectedHerdId(h?.id ?? null); } else { setSelectedHerdId(null); }
    setShowForm(true);
  }

  function applyWalkthrough() {
    const criteria = getWalkthroughCriteria(form.species);
    const updates: Partial<typeof EMPTY_WOA> = {};
    for (const c of criteria) {
      const pct = calcPct(wt[c.affKey] as number | null, wt[c.totKey] as number | null);
      if (pct !== null) { (updates as Record<string, unknown>)[c.resultKey] = pct; }
    }
    setForm(f => ({ ...f, ...updates }));
    walkthroughMut.mutate({ ...wt, woaId: editing?.id ?? null, species: form.species, herdFlockRef: form.herdFlockRef });
    setShowWalkthrough(false);
    setWt({ ...EMPTY_WALKTHROUGH });
  }

  function printReport() {
    const rows = records.map(r => `<tr><td>${formatDate(r.assessmentDate)}</td><td>${r.species}</td><td>${r.assessorType === "internal" ? "Internal" : "External"}</td><td>${r.assessorName}</td><td>${r.herdFlockRef ?? "—"}</td><td>${r.sampleSize ?? "—"}</td><td>${r.lamenessScore ?? "—"}</td><td>${r.overallOutcome.toUpperCase()}</td><td>${formatDate(r.nextAssessmentDue)}</td></tr>`).join("");
    printProReport({ title: "Welfare Outcome Assessment Register", subtitle: `${records.length} assessments on record`, tableHtml: `<table><thead><tr><th>Date</th><th>Species</th><th>Type</th><th>Assessor</th><th>Herd/Flock</th><th>Sample</th><th>Lameness</th><th>Outcome</th><th>Next Due</th></tr></thead><tbody>${rows}</tbody></table>` });
  }

  const OUTCOME_COL: Record<string, string> = { good: "bg-green-50 text-green-700", acceptable: "bg-blue-50 text-blue-700", "needs-improvement": "bg-amber-50 text-amber-700", poor: "bg-red-50 text-red-700" };

  // Derived: primary score label for list view (species-sensitive)
  function primaryScore(r: WelfareOutcomeRecord): string {
    if (r.species === "poultry") return r.featherCoverageScore ? `Feat: ${r.featherCoverageScore}%` : "—";
    if (r.species === "pigs") return r.tailBitingScore ? `Tail: ${r.tailBitingScore}%` : (r.lamenessScore ? `Lame: ${r.lamenessScore}%` : "—");
    return r.lamenessScore ? `${r.lamenessScore}%` : "—";
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div>
          <h3 className="font-semibold text-gray-900">Welfare Outcome Assessments</h3>
          <p className="text-sm text-gray-500 mt-0.5">Animal welfare outcome measures (WOA) as required by Red Tractor Beef & Lamb, Dairy, and Cross Compliance standards.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={yearFilterWoa} onValueChange={setYearFilterWoa}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {yearsWoa.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={printReport}><Printer className="h-3.5 w-3.5 mr-1" />Print Report</Button>
          <Button onClick={() => { setEditing(null); setForm({ ...EMPTY_WOA }); setFeeInputStr(""); setShowForm(true); }}><Plus className="h-4 w-4 mr-1" />Record Assessment</Button>
        </div>
      </div>

      <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-800">
        <strong>Red Tractor WOA:</strong> Assessments should be completed at least twice per year for beef &amp; dairy cattle, and annually for other species. Record outcome measures and corrective actions to satisfy assurance requirements.
      </div>

      {isLoading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>
        : filteredWoaRecords.length === 0 ? <Card><CardContent className="py-16 text-center"><AlertTriangle className="h-10 w-10 mx-auto text-muted-foreground mb-3" /><p className="font-medium text-gray-700 mb-1">No welfare assessments recorded</p><p className="text-sm text-muted-foreground">Record your first welfare outcome assessment to satisfy Red Tractor requirements.</p></CardContent></Card>
        : <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50"><tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Species</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Assessor</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Herd/Flock</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Primary Score</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Outcome</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Next Due</th>
                <th className="px-4 py-3" />
              </tr></thead>
              <tbody className="divide-y">
                {filteredWoaRecords.map(r => (
                  <tr key={r.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{formatDate(r.assessmentDate)}</td>
                    <td className="px-4 py-3 text-xs capitalize">{r.species}</td>
                    <td className="px-4 py-3 text-xs">
                      <div>{r.assessorName}</div>
                      <span className={`inline-flex text-[10px] font-medium rounded px-1 py-0.5 mt-0.5 ${r.assessorType === "internal" ? "bg-emerald-50 text-emerald-700" : "bg-sky-50 text-sky-700"}`}>{r.assessorType === "internal" ? "Farm Staff" : "External"}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{r.herdFlockRef ?? "—"}</td>
                    <td className="px-4 py-3 text-xs font-mono">{primaryScore(r)}</td>
                    <td className="px-4 py-3"><span className={`inline-flex text-xs font-semibold rounded-full px-2 py-0.5 ${OUTCOME_COL[r.overallOutcome] ?? "bg-gray-100 text-gray-700"}`}>{r.overallOutcome.replace(/-/g," ").toUpperCase()}</span></td>
                    <td className="px-4 py-3 text-xs">{formatDate(r.nextAssessmentDue)}</td>
                    <td className="px-4 py-3"><div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setViewItem(r)} title="View"><Eye className="h-3 w-3 text-blue-500" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteId(r.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}

      {viewItem && (
        <Dialog open onOpenChange={o => { if (!o) { setViewItem(null); applyWalkthroughMut.reset(); deleteWalkthroughMut.reset(); } }}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>WOA — {formatDate(viewItem.assessmentDate)}</DialogTitle><DialogDescription>{viewItem.species} · {viewItem.assessorName} · {viewItem.assessorType === "internal" ? "Farm Staff" : "External Assessor"}</DialogDescription></DialogHeader>
            <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Date</p><p className="font-medium">{formatDate(viewItem.assessmentDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Species</p><p className="font-medium capitalize">{viewItem.species}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Assessor</p><p className="font-medium">{viewItem.assessorName}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Assessor Role / Type</p><p className="font-medium">{viewItem.assessorRole ?? (viewItem.assessorType === "internal" ? "Farm Staff" : "External")}</p></div>
              {viewItem.purchaseOrderId && <div className="col-span-2 p-2 bg-sky-50 border border-sky-200 rounded text-xs text-sky-800"><strong>Expected invoice logged</strong> — a purchase order was created in Stock &amp; Supplies when this assessment was saved.</div>}
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Herd / Flock</p><p className="font-medium">{viewItem.herdFlockRef ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Sample Size</p><p className="font-medium">{viewItem.sampleSize ?? "—"}</p></div>
              {viewItem.lamenessScore && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Lameness</p><p className="font-medium">{viewItem.lamenessScore}%</p></div>}
              {viewItem.bodyConditionScore && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Body Condition</p><p className="font-medium">{viewItem.bodyConditionScore}%</p></div>}
              {viewItem.dungScore && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Dung Score</p><p className="font-medium">{viewItem.dungScore}%</p></div>}
              {viewItem.dagScore && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Dag / Fleece</p><p className="font-medium">{viewItem.dagScore}%</p></div>}
              {viewItem.tailBitingScore && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Tail Biting</p><p className="font-medium">{viewItem.tailBitingScore}%</p></div>}
              {viewItem.snoutRootingScore && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Snout Damage</p><p className="font-medium">{viewItem.snoutRootingScore}%</p></div>}
              {viewItem.featherCoverageScore && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Feather Coverage</p><p className="font-medium">{viewItem.featherCoverageScore}%</p></div>}
              {viewItem.footpadDermatitisScore && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Footpad Dermatitis</p><p className="font-medium">{viewItem.footpadDermatitisScore}%</p></div>}
              {viewItem.hockBurnScore && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Hock Burn</p><p className="font-medium">{viewItem.hockBurnScore}%</p></div>}
              {viewItem.skinLesionScore && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Skin Lesions</p><p className="font-medium">{viewItem.skinLesionScore}%</p></div>}
              {viewItem.nasalDischargeScore && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Nasal Discharge</p><p className="font-medium">{viewItem.nasalDischargeScore}%</p></div>}
              {viewItem.eyeDischargeScore && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Eye Discharge</p><p className="font-medium">{viewItem.eyeDischargeScore}%</p></div>}
              {viewItem.mortalityRate && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Mortality Rate</p><p className="font-medium">{viewItem.mortalityRate}%</p></div>}
              {viewItem.calvingLambingScore && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Calving/Lambing</p><p className="font-medium">{viewItem.calvingLambingScore}%</p></div>}
              {viewItem.stockingDensityCompliant && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Stocking Density</p><p className="font-medium capitalize">{viewItem.stockingDensityCompliant.replace(/_/g," ")}</p></div>}
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Overall Outcome</p><p className="font-semibold">{viewItem.overallOutcome.replace(/-/g," ").toUpperCase()}</p></div>
              {viewItem.correctiveActions && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Corrective Actions</p><p className="whitespace-pre-line">{viewItem.correctiveActions}</p></div>}
              {viewItem.targetDate && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Target Date</p><p className="font-medium">{formatDate(viewItem.targetDate)}</p></div>}
              {viewItem.nextAssessmentDue && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Next Assessment Due</p><p className="font-medium">{formatDate(viewItem.nextAssessmentDue)}</p></div>}
              {viewItem.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="whitespace-pre-line">{viewItem.notes}</p></div>}
            </div>

            {linkedWalkthroughs.length > 0 && (
              <div className="mt-4 border rounded-lg overflow-hidden">
                <div className="bg-muted/40 px-3 py-2 flex items-center gap-2">
                  <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Saved Walkthroughs ({linkedWalkthroughs.length})</span>
                </div>
                <div className="divide-y text-sm">
                  {linkedWalkthroughs.map(wk => (
                    <div key={wk.id} className="px-3 py-2 flex items-center justify-between gap-2">
                      <div>
                        <span className="font-medium">{formatDate(wk.assessmentDate)}</span>
                        <span className="text-muted-foreground ml-2 text-xs">by {wk.observedBy}</span>
                        {wk.sampleSize != null && <span className="text-muted-foreground ml-1 text-xs">· {wk.sampleSize} animals</span>}
                        {wk.appliedToWoa && <span className="ml-2 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 rounded px-1 py-0.5">Applied</span>}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button size="sm" variant="outline" className="h-7 text-xs" disabled={applyWalkthroughMut.isPending} onClick={() => applyWalkthroughMut.mutate(wk.id)}>
                          {applyWalkthroughMut.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}Re-apply
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-destructive hover:text-destructive" onClick={() => deleteWalkthroughMut.mutate(wk.id)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <DialogMutationError mutation={applyWalkthroughMut} message="Failed to apply — please try again." />
            <DialogMutationError mutation={deleteWalkthroughMut} message="Failed to delete — please try again." />
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => { openEdit(viewItem); setViewItem(null); }}><Pencil className="w-3.5 h-3.5 mr-1" />Edit</Button>
              <Button variant="ghost" onClick={() => setViewItem(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Walkthrough Tally Dialog ─────────────────────────────────────────── */}
      {showWalkthrough && (
        <Dialog open onOpenChange={o => { if (!o) { setShowWalkthrough(false); walkthroughMut.reset(); } }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Record Walkthrough Observations</DialogTitle>
              <DialogDescription>Enter raw animal counts per welfare criterion. Percentages are calculated automatically and will pre-fill the assessment when you apply.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Observer Name *</Label>
                  <Select value={wt.observerMemberId != null ? String(wt.observerMemberId) : "__free__"} onValueChange={v => {
                    if (v === "__free__") { setW("observerMemberId", null); } else {
                      const m = members.find(mx => String(mx.id) === v);
                      if (m) { setW("observerMemberId", m.id); setW("observedBy", memberFullName(m)); }
                    }
                  }}>
                    <SelectTrigger><SelectValue placeholder="Select staff member" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__free__">— Enter name manually —</SelectItem>
                      {members.map(m => <SelectItem key={m.id} value={String(m.id)}>{memberFullName(m)}{m.jobTitle ? ` — ${m.jobTitle}` : ""}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {wt.observerMemberId == null && <Input className="mt-1" value={wt.observedBy} onChange={e => setW("observedBy", e.target.value)} placeholder="Observer name" />}
                </div>
                <div><Label>Walk Date</Label><Input type="date" value={wt.assessmentDate} onChange={e => setW("assessmentDate", e.target.value)} /></div>
                <div><Label>Animals Observed (Total)</Label><Input type="number" min={1} value={wt.sampleSize ?? ""} onChange={e => setW("sampleSize", e.target.value ? Number(e.target.value) : null)} placeholder="Total observed in walkthrough" /></div>
                <div><Label>Weather / Conditions</Label><Input value={wt.weatherConditions} onChange={e => setW("weatherConditions", e.target.value)} placeholder="e.g. Dry, housed, outdoor" /></div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50"><tr>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Criterion</th>
                    <th className="text-center px-3 py-2 font-medium text-muted-foreground">Affected</th>
                    <th className="text-center px-3 py-2 font-medium text-muted-foreground">Total observed</th>
                    <th className="text-center px-3 py-2 font-medium text-muted-foreground">%</th>
                  </tr></thead>
                  <tbody className="divide-y">
                    {getWalkthroughCriteria(form.species).map(c => {
                      const aff = wt[c.affKey] as number | null;
                      const tot = wt[c.totKey] as number | null;
                      const pct = calcPct(aff, tot);
                      return (
                        <tr key={c.label} className="hover:bg-muted/20">
                          <td className="px-3 py-2 font-medium text-gray-700">{c.label}</td>
                          <td className="px-3 py-2 w-32"><Input type="number" min={0} className="h-8 text-center" value={aff ?? ""} onChange={e => setW(c.affKey, e.target.value ? Number(e.target.value) : null)} /></td>
                          <td className="px-3 py-2 w-32"><Input type="number" min={0} className="h-8 text-center" value={tot ?? ""} onChange={e => setW(c.totKey, e.target.value ? Number(e.target.value) : null)} /></td>
                          <td className="px-3 py-2 text-center font-mono text-sm">{pct !== null ? <span className={`font-semibold ${parseFloat(pct) > 10 ? "text-amber-700" : "text-green-700"}`}>{pct}%</span> : <span className="text-muted-foreground">—</span>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div><Label>Walkthrough Notes</Label><Textarea value={wt.walkthroughNotes} onChange={e => setW("walkthroughNotes", e.target.value)} rows={2} placeholder="Any specific observations, environmental factors, or notes about individual animals" /></div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <strong>Apply to assessment:</strong> Calculated percentages will be copied to the welfare measures fields. You can still edit them manually before saving.
              </div>
            </div>
            <DialogMutationError mutation={walkthroughMut} message="Failed to save — your entries are still here." />
            <DialogFooter className="mt-4 gap-2">
              <Button variant="ghost" onClick={() => setShowWalkthrough(false)}>Cancel</Button>
              <Button onClick={applyWalkthrough} disabled={!wt.observedBy}><CheckCircle2 className="h-4 w-4 mr-1" />Apply to Assessment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showForm && (
        <Dialog open onOpenChange={o => { if (!o) { setShowForm(false); setEditing(null); createMut.reset(); updateMut.reset(); applyWalkthroughMut.reset(); deleteWalkthroughMut.reset(); } }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit Welfare Assessment" : "Record Welfare Outcome Assessment"}</DialogTitle><DialogDescription>Complete welfare outcome measures as required by Red Tractor and cross compliance.</DialogDescription></DialogHeader>
            <div className="space-y-5 mt-2">

              {/* ── Section: Assessment Info ─────────────────────────────────── */}
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Assessment Date *</Label><Input type="date" value={form.assessmentDate ?? ""} onChange={e => setF("assessmentDate", e.target.value)} /></div>
                <div><Label>Species *</Label>
                  <Select value={form.species || "__none__"} onValueChange={v => {
                    const species = v === "__none__" ? "" : v;
                    setF("species", species);
                    const herdStillValid = !form.herdFlockRef || herds.filter(h => woaSpeciesMatchesHerdType(species, h.type, h.productionType)).some(h => h.name === form.herdFlockRef);
                    if (!herdStillValid) { setF("herdFlockRef", null); setSelectedHerdId(null); }
                  }}>
                    <SelectTrigger><SelectValue placeholder="Select species…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— Select species —</SelectItem>
                      <SelectItem value="cattle">Cattle (Dairy)</SelectItem>
                      <SelectItem value="beef-cattle">Cattle (Beef)</SelectItem>
                      <SelectItem value="sheep">Sheep</SelectItem>
                      <SelectItem value="pigs">Pigs</SelectItem>
                      <SelectItem value="poultry">Poultry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Herd / Flock</Label>
                  <Select value={currentHerdStillValid ? (form.herdFlockRef ?? "__none__") : "__none__"} onValueChange={v => {
                    if (v === "__none__") { setF("herdFlockRef", null); setSelectedHerdId(null); }
                    else { const h = herdPool.find(h => h.name === v); setF("herdFlockRef", v); setSelectedHerdId(h?.id ?? null); }
                  }}>
                    <SelectTrigger><SelectValue placeholder="Select herd / flock" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— Not specified —</SelectItem>
                      {herdPool.map(h => <SelectItem key={h.id} value={h.name}>{h.name}{h.herdNumber ? ` (${h.herdNumber})` : ""}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {filteredHerds.length === 0 && herds.length > 0 && <p className="text-xs text-muted-foreground mt-0.5">No {form.species} herds matched — showing all.</p>}
                </div>
                <div><Label>Sample Size</Label><Input type="number" min={1} value={form.sampleSize ?? ""} onChange={e => setF("sampleSize", e.target.value ? Number(e.target.value) : null)} placeholder="No. animals observed" /></div>
              </div>

              {/* ── Section: Assessor ───────────────────────────────────────── */}
              <div className="border rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-sm text-gray-800">Assessor</h4>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Assessor Type</Label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setF("assessorType", "internal")}
                      className={`flex-1 py-2 px-3 text-sm rounded-md border font-medium transition-colors ${form.assessorType === "internal" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-700 border-gray-300 hover:border-emerald-400"}`}>
                      Farm Staff
                    </button>
                    <button type="button" onClick={() => setF("assessorType", "external")}
                      className={`flex-1 py-2 px-3 text-sm rounded-md border font-medium transition-colors ${form.assessorType === "external" ? "bg-sky-600 text-white border-sky-600" : "bg-white text-gray-700 border-gray-300 hover:border-sky-400"}`}>
                      External Assessor
                    </button>
                  </div>
                </div>

                {form.assessorType === "internal" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Staff Member *</Label>
                      <Select value={form.assessorMemberId != null ? String(form.assessorMemberId) : "__none__"} onValueChange={v => {
                        if (v === "__none__") { setF("assessorMemberId", null); setF("assessorName", ""); setF("assessorRole", null); }
                        else {
                          const m = members.find(mx => String(mx.id) === v);
                          if (m) { setF("assessorMemberId", m.id); setF("assessorName", memberFullName(m)); setF("assessorRole", m.jobTitle ?? "Farm Staff"); }
                        }
                      }}>
                        <SelectTrigger><SelectValue placeholder="Select staff member" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">— Select —</SelectItem>
                          {members.map(m => <SelectItem key={m.id} value={String(m.id)}>{memberFullName(m)}{m.jobTitle ? ` — ${m.jobTitle}` : ""}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {members.length === 0 && <p className="text-xs text-muted-foreground mt-0.5">No staff registered — <a href="/staff" className="underline text-primary">add staff</a> or enter name below.</p>}
                    </div>
                    <div><Label>Role / Job Title</Label><Input value={form.assessorRole ?? ""} onChange={e => setF("assessorRole", e.target.value || null)} placeholder="Auto-filled from staff register" /></div>
                    {form.assessorMemberId == null && <div className="col-span-2"><Label>Name (if not in register) *</Label><Input value={form.assessorName ?? ""} onChange={e => setF("assessorName", e.target.value)} placeholder="Full name" /></div>}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Supplier / Trade Contact *</Label>
                      <Select value={form.assessorSupplierId != null ? String(form.assessorSupplierId) : "__none__"} onValueChange={v => {
                        if (v === "__none__") { setF("assessorSupplierId", null); setF("assessorName", ""); }
                        else {
                          const s = suppliers.find(sx => String(sx.id) === v);
                          if (s) { setF("assessorSupplierId", s.id); setF("assessorName", s.contactName ?? s.name); }
                        }
                      }}>
                        <SelectTrigger><SelectValue placeholder="Select from suppliers" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">— Select —</SelectItem>
                          {suppliers.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}{s.contactName ? ` (${s.contactName})` : ""}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {suppliers.length === 0 && <p className="text-xs text-muted-foreground mt-0.5">No suppliers registered. Add in Stock &amp; Supplies, or enter name below.</p>}
                    </div>
                    <div><Label>Assessor Role / Title</Label><Input value={form.assessorRole ?? ""} onChange={e => setF("assessorRole", e.target.value || null)} placeholder="e.g. Farm Vet, Welfare Consultant" /></div>
                    {form.assessorSupplierId == null && <div><Label>Name (if not in register) *</Label><Input value={form.assessorName ?? ""} onChange={e => setF("assessorName", e.target.value)} placeholder="Assessor full name" /></div>}
                    <div>
                      <Label>Expected Fee (£)</Label>
                      <Input type="number" min={0} step={0.01} value={feeInputStr}
                        onChange={e => {
                          setFeeInputStr(e.target.value);
                          setF("expectedFeeAmountPence", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null);
                        }}
                        placeholder="0.00 — leave blank if no fee" />
                    </div>
                    {form.assessorSupplierId != null && form.expectedFeeAmountPence != null && form.expectedFeeAmountPence > 0 && (
                      <div className="col-span-2 flex items-start gap-2 p-3 bg-sky-50 border border-sky-200 rounded-lg text-sm text-sky-800">
                        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-sky-500" />
                        <span>An expected invoice (purchase order) will be automatically logged in <strong>Stock &amp; Supplies → Purchase Orders</strong> when you save this assessment.</span>
                      </div>
                    )}
                    {editing?.purchaseOrderId && (
                      <div className="col-span-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                        ✓ Purchase order already created for this assessment (PO #{editing.purchaseOrderId}).
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Section: Welfare Measures ───────────────────────────────── */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm text-gray-800">Welfare Measures — <span className="capitalize text-muted-foreground font-normal">{form.species}</span></h4>
                  {form.assessorType === "internal" && (
                    <Button type="button" variant="outline" size="sm" onClick={() => {
                      setWt({ ...EMPTY_WALKTHROUGH, observedBy: form.assessorName, assessmentDate: form.assessmentDate, sampleSize: form.sampleSize });
                      setShowWalkthrough(true);
                    }}>
                      <ClipboardList className="h-3.5 w-3.5 mr-1" />Enter Raw Counts
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {getSpeciesMeasures(form.species).map(m => (
                    <div key={m.key}>
                      <Label>{m.label}</Label>
                      {m.isSelect ? (
                        <Select value={(form[m.key] as string | null) ?? ""} onValueChange={v => setF(m.key, v || null)}>
                          <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                          <SelectContent>{m.options?.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                        </Select>
                      ) : (
                        <Input value={(form[m.key] as string | null) ?? ""} onChange={e => setF(m.key, e.target.value || null)} placeholder={m.placeholder} />
                      )}
                    </div>
                  ))}

                  {/* Mortality — auto-calc for cattle/sheep */}
                  {(form.species !== "poultry") && (
                    <div className="col-span-2 grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <Label>Mortality Rate (%, 12-month)</Label>
                          {autoCalc?.mortalityRate && <button type="button" className="text-xs text-primary underline" onClick={() => setF("mortalityRate", autoCalc.mortalityRate)}>Use {autoCalc.mortalityRate}% (calculated)</button>}
                        </div>
                        <Input value={form.mortalityRate ?? ""} onChange={e => setF("mortalityRate", e.target.value || null)} placeholder={autoCalc?.mortalityRate ? `Calculated: ${autoCalc.mortalityRate}%` : "Rolling 12-month mortality %"} />
                        {autoCalc?.mortalityRate
                          ? <p className="text-xs text-green-700 mt-0.5">✓ From Mortality Register: {autoCalc.deathCount} deaths / {autoCalc.herdSize} animals.</p>
                          : <p className="text-xs text-muted-foreground mt-0.5">{selectedHerdId ? "No mortality records found — enter manually." : "Select a herd to auto-calculate."}</p>}
                      </div>

                      {/* Calving/Lambing — cattle + sheep only */}
                      {(form.species === "cattle" || form.species === "beef-cattle" || form.species === "sheep") && (
                        <div>
                          <div className="flex items-center justify-between">
                            <Label>{form.species === "sheep" ? "Lambing Score" : "Calving Score"} (% assisted)</Label>
                            {autoCalc?.calvingLambingScore && <button type="button" className="text-xs text-primary underline" onClick={() => setF("calvingLambingScore", autoCalc.calvingLambingScore)}>Use {autoCalc.calvingLambingScore}%</button>}
                          </div>
                          <Input value={form.calvingLambingScore ?? ""} onChange={e => setF("calvingLambingScore", e.target.value || null)} placeholder="% assisted births" />
                          {autoCalc?.calvingLambingScore
                            ? <p className="text-xs text-green-700 mt-0.5">✓ From {form.species === "sheep" ? "Lambing" : "Calving"} records.</p>
                            : <p className="text-xs text-muted-foreground mt-0.5">{selectedHerdId ? "No records found — enter manually." : "Select a herd to auto-calculate."}</p>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Past Walkthroughs (edit mode only, internal assessor) ─────── */}
              {editing && linkedWalkthroughs.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted/40 px-3 py-2 flex items-center gap-2">
                    <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Saved Walkthroughs ({linkedWalkthroughs.length})</span>
                    <span className="text-xs text-muted-foreground ml-1">— click Re-apply to push tally counts to the scores below</span>
                  </div>
                  <div className="divide-y text-sm">
                    {linkedWalkthroughs.map(wk => (
                      <div key={wk.id} className="px-3 py-2 flex items-center justify-between gap-2">
                        <div>
                          <span className="font-medium">{formatDate(wk.assessmentDate)}</span>
                          <span className="text-muted-foreground ml-2 text-xs">by {wk.observedBy}</span>
                          {wk.sampleSize != null && <span className="text-muted-foreground ml-1 text-xs">· {wk.sampleSize} animals</span>}
                          {wk.weatherConditions && <span className="text-muted-foreground ml-1 text-xs">· {wk.weatherConditions}</span>}
                          {wk.appliedToWoa && <span className="ml-2 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 rounded px-1 py-0.5">Applied</span>}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button size="sm" variant="outline" className="h-7 text-xs" disabled={applyWalkthroughMut.isPending} onClick={() => applyWalkthroughMut.mutate(wk.id)}>
                            {applyWalkthroughMut.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}Re-apply
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-destructive hover:text-destructive" onClick={() => deleteWalkthroughMut.mutate(wk.id)}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Section: Outcome ────────────────────────────────────────── */}
              <div className="space-y-3">
                <div><Label>Overall Outcome *</Label>
                  <Select value={form.overallOutcome} onValueChange={v => setF("overallOutcome", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="good">Good — All measures within target</SelectItem>
                      <SelectItem value="acceptable">Acceptable — Minor areas for attention</SelectItem>
                      <SelectItem value="needs-improvement">Needs Improvement — Action plan required</SelectItem>
                      <SelectItem value="poor">Poor — Urgent action required</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(form.overallOutcome === "needs-improvement" || form.overallOutcome === "poor") && (
                  <div className="bg-amber-50 border border-amber-200 rounded-md px-3 py-2 text-sm text-amber-800">
                    <strong>⚠ Action required</strong> — A task will appear on the Week Ahead planner for all farm staff so this can be tracked and signed off before the target date.
                  </div>
                )}
                <div>
                  <Label>Corrective Actions</Label>
                  <Textarea value={form.correctiveActions ?? ""} onChange={e => setF("correctiveActions", e.target.value || null)} rows={3} placeholder="Describe the specific actions that must be taken — who, what, and by when" />
                  {(form.overallOutcome === "needs-improvement" || form.overallOutcome === "poor") && !form.correctiveActions && <p className="text-xs text-red-600 mt-0.5">Required when outcome is Needs Improvement or Poor</p>}
                </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Target Completion Date</Label><Input type="date" value={form.targetDate ?? ""} onChange={e => setF("targetDate", e.target.value || null)} /></div>
                <div><Label>Next Assessment Due</Label><Input type="date" value={form.nextAssessmentDue ?? ""} onChange={e => setF("nextAssessmentDue", e.target.value || null)} /></div>
              </div>
              <div>
                <Label>Assessment Document</Label>
                <input type="file" ref={woaDocRef} className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={async e => {
                  const file = e.target.files?.[0]; if (!file) return;
                  const upload = await uploadWoaDoc(file);
                  if (upload?.objectPath) { setPendingWoaDoc({ path: upload.objectPath, name: file.name }); setF("documentPath", upload.objectPath); setF("documentName", file.name); }
                  if (woaDocRef.current) woaDocRef.current.value = "";
                }} />
                {(pendingWoaDoc || form.documentPath || form.documentName) ? (
                  <div className="flex items-center gap-2 mt-1 p-2 border rounded text-sm">
                    <span className="text-muted-foreground">📎</span>
                    {form.documentPath ? (
                      <a href={`/api/storage${form.documentPath}`} target="_blank" rel="noreferrer" className="text-primary underline truncate flex-1">{form.documentName || "Document"}</a>
                    ) : (
                      <span className="truncate flex-1">{form.documentName || "Document"}</span>
                    )}
                    <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => { setPendingWoaDoc(null); setF("documentPath", null); setF("documentName", null); }}>×</Button>
                  </div>
                ) : (
                  <Button type="button" variant="outline" size="sm" className="mt-1" onClick={() => woaDocRef.current?.click()} disabled={isUploadingWoaDoc}>
                    {isUploadingWoaDoc ? "Uploading…" : "Upload Document (PDF / image)"}
                  </Button>
                )}
              </div>
              <div><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => setF("notes", e.target.value || null)} rows={2} /></div>
              </div>
            </div>
            <DialogMutationError mutation={createMut} message="Failed to save — your entries are still here." />
            <DialogMutationError mutation={updateMut} message="Failed to save — your entries are still here." />
            <DialogMutationError mutation={applyWalkthroughMut} message="Failed to apply — please try again." />
            <DialogMutationError mutation={deleteWalkthroughMut} message="Failed to delete — please try again." />
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
              <Button onClick={() => editing ? updateMut.mutate({ ...form, id: editing.id }) : createMut.mutate(form)} disabled={!form.assessmentDate || !form.assessorName || createMut.isPending || updateMut.isPending}>
                {(createMut.isPending || updateMut.isPending) && <Loader2 className="animate-spin h-4 w-4 mr-1" />}
                {editing ? "Update" : "Save Assessment"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {deleteId !== null && <ConfirmDialog open title="Delete Assessment?" message="This welfare outcome assessment will be permanently deleted." onConfirm={() => deleteMut.mutate(deleteId!)} onCancel={() => setDeleteId(null)} confirmLabel="Delete" confirmVariant="destructive" />}
    </>
  );
}
