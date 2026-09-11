import React, { useState, useEffect, useRef, useMemo } from "react";
import { TabButton, TabBar } from "@/components/ui/tab-button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAppStore } from "@/hooks/use-app-store";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { usePersistedNumberFilter } from "@/hooks/use-persisted-filter";
import { useFields, useAddField, useUpdateField, useDeleteField } from "@/hooks/use-fields";
import { useCrops, useAddCrop, useFieldCropAssignments, useAssignCrop } from "@/hooks/use-crops";
import {
  getListFieldCropAssignmentsQueryKey,
  getListFieldsQueryKey,
  getListCropsQueryKey,
  useListSeedBatches,
  getListSeedBatchesQueryKey,
  useGenerateFieldCropLabels,
} from "@workspace/api-client-react/src/generated/api";
import { useFarmMembers, memberFullName } from "@/hooks/use-farm-members";
import { StaffSelect } from "@/components/ui/staff-select";
import {
  Plus, PlusCircle, Search, Map as MapIcon, MoreVertical, Pencil, Trash2, AlertTriangle,
  Sprout, Leaf, CalendarDays, Wheat, ChevronRight, X, History, ChevronDown, Printer, FlaskConical, Loader2, QrCode, StickyNote, ShoppingCart,
  Landmark, Phone, MapPin, BadgePoundSterling, RefreshCw, FileText, CheckCircle2, XCircle, Paperclip, Download, Key,
  TreePine, Layers3, TrendingUp, TrendingDown, Minus, Scale, CloudRain, BarChart2, Trophy, Medal, ChevronUp, Eye,
} from "lucide-react";
import { useUpload } from "@workspace/object-storage-web";
import { QRCodeSVG } from "qrcode.react";
import { FieldBoundaryMapDialog } from "@/components/fields/FieldBoundaryMapDialog";
import { FieldSchematicMap } from "@/components/fields/FieldSchematicMap";
import { useForm } from "react-hook-form";
import { Redirect, useLocation, Link } from "wouter";
import { useFarmMeta } from "@/pages/viticulture/shared";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { printProReport } from "@/lib/print-report";
import { printSeedBagLabels } from "@/lib/print-labels";
import { cropYearOptions, cropYearLabel, currentCropYear, isInCropYear } from "@/lib/cropYear";
import { getEstablishmentPercent, calculateSeedRate, suggestTargetPopulation, BLACKGRASS_TARGET_POPULATION_M2 } from "@/lib/seedRateCalculator";
import { SOIL_TYPE_OPTIONS } from "@/lib/irrigationData";
import { useToast } from "@/hooks/use-toast";
import { DocAttach } from "@/components/DocAttach";
import CropSeasonReport from "@/components/CropSeasonReport";
import { ArableFarmSettingsChecklist } from "@/components/ArableFarmSettingsChecklist";

import {
  CURRENT_YEAR,
  SEASON_OPTIONS,
  deriveSeasonFromDate,
  FieldRecord,
  CropRecord,
  CropDocRecord,
  FieldCropAssignment,
  FieldFormData,
  CropFormData,
  AssignCropFormData,
  SeedBatchRecord,
  LandUseRecord,
  LandUseFormData,
  LAND_USE_OPTIONS,
  LAND_USE_LABEL,
  LAND_USE_BADGE,
  SCHEME_CODES_NEEDED,
  formatDate,
  harvestVarianceDays,
  VarianceBadge,
  HarvestNoteEditor,
  Farm,
  PrintCropRegister,
  FieldCardMenu,
  CropComparisonData,
  SeasonRainfallBadge,
} from "./shared";
import { SeedDrillingSection } from "./SeedDrillingSection";
import { CropRotationPlanner } from "./CropRotationPlanner";
import { GrasslandSection } from "./GrasslandSection";
import { BydvAssessmentSection } from "./BydvAssessmentSection";

export default function FieldsPage() {
  const { farmId } = useAppStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  // Deep-link: ?editFieldId=<id> opens the edit dialog for that field on mount.
  // Must be declared before usePersistedTab so the urlOverride can reference it.
  const [autoOpenFieldId] = useState<number | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("editFieldId");
    const id = raw ? parseInt(raw, 10) : NaN;
    return isNaN(id) ? null : id;
  });
  // Remove the param from the URL so a refresh doesn't re-open the dialog
  useEffect(() => {
    if (autoOpenFieldId !== null) {
      const url = new URL(window.location.href);
      url.searchParams.delete("editFieldId");
      window.history.replaceState(null, "", url.toString());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [tab, setTab] = usePersistedTab<"fields" | "crops" | "seed" | "bydv" | "tenure" | "rotation" | "map" | "grassland">({
    page: "fields",
    farmId,
    validIds: ["fields", "crops", "seed", "bydv", "tenure", "rotation", "map", "grassland"],
    defaultTab: "fields",
    // When arriving via a deep-link ?editFieldId=, always land on the Fields tab
    // so the FieldCardMenu renders and the edit dialog can auto-open.
    urlOverride: autoOpenFieldId !== null ? "fields" : undefined,
  });

  const [search, setSearch] = useState("");
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [isAddCropOpen, setIsAddCropOpen] = useState(false);
  const [assignForField, setAssignForField] = useState<FieldRecord | null>(null);
  const [selectedYear, setSelectedYear] = usePersistedNumberFilter({ page: "fields", filter: "year", farmId, defaultValue: CURRENT_YEAR });
  const [selectedFieldForHistory, setSelectedFieldForHistory] = useState<FieldRecord | null>(null);
  const [drawerTab, setDrawerTab] = useState<"overview" | "history" | "nmp" | "tenure">("overview");
  const [tenureEditMode, setTenureEditMode] = useState(false);
  const [isSavingTenure, setIsSavingTenure] = useState(false);
  const [tenureForm, setTenureForm] = useState<{
    tenureType: string;
    landlordSupplierId: string;
    tenancyStartDate: string;
    tenancyEndDate: string;
    annualRentPounds: string;
    rentReviewDate: string;
    tenureNotes: string;
  }>({ tenureType: "owned", landlordSupplierId: "__none__", tenancyStartDate: "", tenancyEndDate: "", annualRentPounds: "", rentReviewDate: "", tenureNotes: "" });
  const [showAddLandlordDialog, setShowAddLandlordDialog] = useState(false);
  const [landlordQuickForm, setLandlordQuickForm] = useState({ name: "", contactName: "", phone: "", address: "" });
  const [savingLandlord, setSavingLandlord] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [expandedVarietyId, setExpandedVarietyId] = useState<number | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [editingCrop, setEditingCrop] = useState<CropRecord | null>(null);
  const [editCropForm, setEditCropForm] = useState({ name: "", variety: "", category: "", notes: "" });
  const [editCropSaving, setEditCropSaving] = useState(false);
  const [addingVarietyCropId, setAddingVarietyCropId] = useState<number | null>(null);
  const [addVarietyForm, setAddVarietyForm] = useState({ variety: "", notes: "" });
  const [addVarietySaving, setAddVarietySaving] = useState(false);
  const [landUseForField, setLandUseForField] = useState<FieldRecord | null>(null);
  const [editingLandUseRecord, setEditingLandUseRecord] = useState<LandUseRecord | null>(null);
  const [comparisonVarietyId, setComparisonVarietyId] = useState<number | null>(null);
  const [comparisonAssignmentId, setComparisonAssignmentId] = useState<number | null>(null);
  const [reportAssignmentId, setReportAssignmentId] = useState<number | null>(null);
  const [pendingDeleteVariety, setPendingDeleteVariety] = useState<number | null>(null);
  const [pendingDeleteDoc, setPendingDeleteDoc] = useState<{ cropTypeId: number; docId: number } | null>(null);
  const [pendingDeleteLandUse, setPendingDeleteLandUse] = useState<number | null>(null);

  // All hooks must be called unconditionally before any early return
  const safeFarmId = farmId ?? 0;
  const { data: fieldsData, isLoading: fieldsLoading, isSuccess: fieldsLoaded, refetch: fieldsRefetch } = useFields(safeFarmId);
  const { data: cropsData, isLoading: cropsLoading } = useCrops(safeFarmId);
  const { data: assignmentsData } = useFieldCropAssignments(safeFarmId);
  const fieldNmpQ = useQuery({
    queryKey: ["field-nmp-entries", safeFarmId, selectedFieldForHistory?.id, drawerTab],
    queryFn: () => fetch(`/api/farms/${safeFarmId}/fields/${selectedFieldForHistory?.id}/nmp-entries`).then(r => r.json()),
    enabled: !!farmId && !!selectedFieldForHistory && drawerTab === "nmp",
    select: (d: any) => d.entries ?? [],
  });

  type FieldHarvestRecord = {
    id: number;
    fieldCropAssignmentId: number;
    yieldTonnes: string | null;
    areaHarvestedHa: string | null;
    moisturePercent: string | null;
    qualityGrade: string | null;
    harvestDate: string;
  };
  const fieldHarvestsQ = useQuery<FieldHarvestRecord[]>({
    queryKey: ["field-harvests", safeFarmId, selectedFieldForHistory?.id],
    queryFn: () =>
      fetch(`/api/farms/${safeFarmId}/harvests?fieldId=${selectedFieldForHistory?.id}`)
        .then(r => r.json())
        .then((d: { records?: FieldHarvestRecord[] }) => d.records ?? []),
    enabled: !!farmId && !!selectedFieldForHistory && drawerTab === "history",
  });
  const fieldHarvests: FieldHarvestRecord[] = fieldHarvestsQ.data ?? [];

  type PillarKey = "ploughing" | "delayedDrilling" | "springCropping" | "higherSeedRate" | "fallowCover";
  type SeasonPillarResult = {
    year: number;
    season: string | null;
    pillars: Record<PillarKey, boolean>;
    pillarsUsedCount: number;
    herbicideMoaGroupsUsed: string[];
  };
  type RecommendationSeverity = "high" | "medium" | "low";
  type FieldRecommendation = {
    key: string;
    severity: RecommendationSeverity;
    title: string;
    detail: string;
  };
  type FiveInFiveScore = {
    fieldId: number;
    fieldName: string;
    blackgrassRiskField: boolean;
    seasons: SeasonPillarResult[];
    distinctPillarsUsed: PillarKey[];
    distinctPillarCount: number;
    moaRepetitionRisk: boolean;
    moaRepeatedGroup: string | null;
    recommendations: FieldRecommendation[];
  };
  const RECOMMENDATION_SEVERITY_STYLES: Record<RecommendationSeverity, string> = {
    high: "border-red-200 bg-red-50 text-red-800",
    medium: "border-amber-200 bg-amber-50 text-amber-800",
    low: "border-blue-200 bg-blue-50 text-blue-800",
  };
  const PILLAR_LABELS: Record<PillarKey, { label: string; detail: string }> = {
    ploughing: { label: "Rotational ploughing", detail: "Primary inversion cultivation used this season" },
    delayedDrilling: { label: "Delayed autumn drilling", detail: "Drilled after the stale-seedbed cut-off (1 Oct)" },
    springCropping: { label: "Spring cropping", detail: "Spring-sown crop breaks the autumn germination window" },
    higherSeedRate: { label: "Higher seed rate", detail: "Denser crop competition suppresses black-grass" },
    fallowCover: { label: "Fallow / cover crop", detail: "A reset season with no autumn cash crop" },
  };
  const fiveInFiveQ = useQuery<FiveInFiveScore | null>({
    queryKey: ["field-five-in-five", safeFarmId, selectedFieldForHistory?.id],
    queryFn: () =>
      fetch(`/api/farms/${safeFarmId}/fields/${selectedFieldForHistory?.id}/blackgrass-five-in-five`)
        .then(r => r.ok ? r.json() : null),
    enabled: !!farmId && !!selectedFieldForHistory && drawerTab === "history" && !!(selectedFieldForHistory as any)?.blackgrassRiskField,
  });
  const fiveInFiveScore = fiveInFiveQ.data ?? null;

  const [isUploadingCropDoc, setIsUploadingCropDoc] = useState(false);
  const expandedCropTypeId = expandedVarietyId
    ? (cropsData?.records as CropRecord[] | undefined)?.find(c => c.id === expandedVarietyId)?.cropId ?? null
    : null;
  const cropDocsQ = useQuery<CropDocRecord[]>({
    queryKey: ["crop-docs", safeFarmId, expandedCropTypeId],
    queryFn: () =>
      fetch(`/api/farms/${safeFarmId}/crops/${expandedCropTypeId}/documents`)
        .then(r => r.json())
        .then((d: { documents?: CropDocRecord[] }) => d.documents ?? []),
    enabled: !!farmId && !!expandedCropTypeId,
  });
  const cropDocs: CropDocRecord[] = cropDocsQ.data ?? [];

  const tenureDocsQ = useQuery({
    queryKey: ["field-tenure-docs", safeFarmId, selectedFieldForHistory?.id],
    queryFn: () => fetch(`/api/farms/${safeFarmId}/fields/${selectedFieldForHistory?.id}/tenure-documents`).then(r => r.json()).then(d => d.documents ?? []),
    enabled: !!farmId && !!selectedFieldForHistory && drawerTab === "tenure",
  });

  const biofuelDeclQ = useQuery({
    queryKey: ["biofuel-field-declarations", safeFarmId],
    queryFn: () => fetch(`/api/farms/${safeFarmId}/biofuel/field-declarations`).then(r => r.ok ? r.json() : { records: [] }).then(d => (d.records ?? []) as { fieldName: string; eligibilityStatus: string; highCarbonStockRisk: boolean; highBiodiversityRisk: boolean }[]),
    enabled: !!farmId,
    staleTime: 60_000,
  });
  const biofuelDeclarations: { fieldName: string; eligibilityStatus: string; highCarbonStockRisk: boolean; highBiodiversityRisk: boolean }[] = biofuelDeclQ.data ?? [];

  const landlordSuppliersQ = useQuery({
    queryKey: ["farm-landlords", safeFarmId],
    queryFn: () => fetch(`/api/farms/${safeFarmId}/landlords`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const landlordSuppliers: { id: number; name: string; contactName?: string | null; phone?: string | null; email?: string | null; address?: string | null }[] = landlordSuppliersQ.data ?? [];

  const landUseQ = useQuery<LandUseRecord[]>({
    queryKey: ["field-season-land-use", safeFarmId],
    queryFn: () => fetch(`/api/farms/${safeFarmId}/field-season-land-use`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const landUseRecords: LandUseRecord[] = landUseQ.data ?? [];

  const farmCoordsQ = useQuery({
    queryKey: ["farm-coords", safeFarmId],
    queryFn: () => fetch(`/api/farms/${safeFarmId}`).then(r => r.json()),
    enabled: !!farmId,
    staleTime: 10 * 60 * 1000,
    select: (d: any) => {
      const src = d?.farm ?? d?.result ?? d ?? {};
      return {
        lat: src.latitude ?? null,
        lng: src.longitude ?? null,
      } as { lat: string | null; lng: string | null };
    },
  });
  const farmLat = farmCoordsQ.data?.lat ?? null;
  const farmLng = farmCoordsQ.data?.lng ?? null;

  const comparisonQ = useQuery<CropComparisonData>({
    queryKey: ["crop-performance-comparison", safeFarmId, comparisonVarietyId],
    queryFn: () =>
      fetch(`/api/farms/${safeFarmId}/crop-performance-comparison?varietyId=${comparisonVarietyId}`)
        .then(r => r.json()),
    enabled: !!comparisonVarietyId && !!farmId,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    setComparisonVarietyId(null);
    setComparisonAssignmentId(null);
  }, [selectedFieldForHistory?.id]);

  const createLandUseMut = useMutation({
    mutationFn: (data: Partial<LandUseRecord> & { fieldId: number; year: number; landUse: string }) =>
      fetch(`/api/farms/${safeFarmId}/field-season-land-use`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["field-season-land-use", safeFarmId] }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const updateLandUseMut = useMutation({
    mutationFn: ({ id, ...data }: Partial<LandUseRecord> & { id: number }) =>
      fetch(`/api/farms/${safeFarmId}/field-season-land-use/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["field-season-land-use", safeFarmId] }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const deleteLandUseMut = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/farms/${safeFarmId}/field-season-land-use/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["field-season-land-use", safeFarmId] }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const deleteVarietyMut = useMutation({
    mutationFn: (varietyId: number) =>
      fetch(`/api/farms/${safeFarmId}/crop-varieties/${varietyId}`, { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Delete failed (${r.status})`); } return r; }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListCropsQueryKey(safeFarmId) }); },
    onError: () => toast({ title: "Failed to delete variety", variant: "destructive" }),
  });

  const deleteCropDocMut = useMutation({
    mutationFn: ({ cropTypeId, docId }: { cropTypeId: number; docId: number }) =>
      fetch(`/api/farms/${safeFarmId}/crops/${cropTypeId}/documents/${docId}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: (_data, vars) => { queryClient.invalidateQueries({ queryKey: ["crop-docs", safeFarmId, vars.cropTypeId] }); },
    onError: () => toast({ title: "Failed to remove document", variant: "destructive" }),
  });

  const { uploadFile, isUploading: isUploadingTenureDoc } = useUpload();

  const createFieldMut = useAddField(safeFarmId);
  const { mutate: createField, isPending: creatingField } = createFieldMut;
  const createCropMut = useAddCrop(safeFarmId);
  const { mutate: createCrop, isPending: creatingCrop } = createCropMut;
  const assignCropMut = useAssignCrop(safeFarmId);
  const { mutate: assignCrop, isPending: assigningCrop } = assignCropMut;

  const fieldForm = useForm<FieldFormData>();
  const cropForm = useForm<CropFormData>();
  const assignForm = useForm<AssignCropFormData>();
  const [seasonManuallySet, setSeasonManuallySet] = useState(false);
  const [tgwManuallySet, setTgwManuallySet] = useState(false);
  const watchedAssignVarietyId = assignForm.watch("varietyId");
  const { data: seedBatchesForVariety } = useListSeedBatches(
    safeFarmId,
    watchedAssignVarietyId ? { varietyId: Number(watchedAssignVarietyId) } : undefined,
    { query: { enabled: !!safeFarmId && !!watchedAssignVarietyId } as any },
  );
  const { data: allSeedBatchesData } = useListSeedBatches(
    safeFarmId,
    undefined,
    { query: { enabled: !!safeFarmId } as any },
  );
  const allSeedBatches: SeedBatchRecord[] = ((allSeedBatchesData as any)?.records ?? []) as SeedBatchRecord[];
  const { data: currentFarmData } = useQuery<{ record: { name?: string; cphNumber?: string } }>({
    queryKey: ["farm", safeFarmId],
    queryFn: async () => {
      const r = await fetch(`/api/farms/${safeFarmId}`);
      return r.json();
    },
    enabled: !!safeFarmId,
  });
  const currentFarm = currentFarmData?.record;
  const { mutate: generateLabels, isPending: generatingLabelsForId } = useGenerateFieldCropLabels();
  const [labelCountDraft, setLabelCountDraft] = useState<Record<number, string>>({});

  const handleGenerateLabels = async (a: FieldCropAssignment) => {
    const batch = allSeedBatches.find(b => b.id === a.seedBatchId);
    if (!batch) return;
    const defaultCount = a.bagsAllocated ?? 1;
    const raw = labelCountDraft[a.id];
    const count = raw !== undefined && raw !== "" ? Math.max(1, parseInt(raw, 10) || defaultCount) : defaultCount;
    const field = fields.find(f => f.id === a.fieldId);
    await printSeedBagLabels(
      {
        batchId: (batch as unknown as { id: number }).id,
        cropName: a.cropName,
        varietyName: a.variety,
        batchNumber: batch.batchNumber,
        supplierName: batch.supplierName ?? null,
        tgwGrams: batch.tgwGrams,
        quantityReceivedKg: (batch as unknown as { quantityReceivedKg?: string | number }).quantityReceivedKg ?? null,
        treatmentNotes: (batch as unknown as { treatmentNotes?: string | null }).treatmentNotes ?? null,
        fieldName: field?.name ?? null,
        fieldReference: field?.fieldReference ?? null,
        plantingDate: a.plantingDate ? formatDate(a.plantingDate) : null,
        farmName: currentFarm?.name ?? null,
        cphNumber: currentFarm?.cphNumber ?? null,
      },
      count
    );
    generateLabels({ farmId: safeFarmId, recordId: a.id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFieldCropAssignmentsQueryKey(safeFarmId) });
      },
    });
  };
  const availableSeedBatches: SeedBatchRecord[] = (
    ((seedBatchesForVariety as any)?.records ?? []) as SeedBatchRecord[]
  ).filter((b) => b.isActive && Number(b.quantityRemainingKg) > 0);
  const landUseForm = useForm<LandUseFormData>({
    defaultValues: { landUse: "fallow", year: String(CURRENT_YEAR), season: "", schemeActionCode: "", schemeReference: "", areaHectares: "", startDate: "", endDate: "", managementNotes: "" },
  });

  const fields = (fieldsData?.records ?? []) as unknown as FieldRecord[];
  const crops = (cropsData?.records ?? []) as unknown as CropRecord[];
  const assignments = (assignmentsData?.records ?? []) as unknown as FieldCropAssignment[];
  const missingDeepLinkNoticeShown = useRef(false);

  useEffect(() => {
    if (
      autoOpenFieldId === null ||
      !fieldsLoaded ||
      missingDeepLinkNoticeShown.current ||
      fields.some(field => field.id === autoOpenFieldId)
    ) {
      return;
    }

    missingDeepLinkNoticeShown.current = true;
    toast({
      title: "Field no longer available",
      description: "This field may have been deleted. You can continue using the field list.",
    });
  }, [autoOpenFieldId, fields, fieldsLoaded, toast]);

  // Early return after all hooks
  if (!farmId) return <Redirect href="/select" />;

  const availableYears = Array.from(
    new Set([CURRENT_YEAR,
      ...assignments.map(a => a.year).filter((y): y is number => !!y),
      ...landUseRecords.map(r => r.year),
    ])
  ).sort((a, b) => b - a);

  const currentAssignments = assignments.filter(a =>
    selectedYear === CURRENT_YEAR ? (a.year === CURRENT_YEAR || !a.year) : a.year === selectedYear
  );

  const currentCropByField = Object.fromEntries(
    currentAssignments.map(a => [a.fieldId, a])
  ) as Record<number, FieldCropAssignment>;

  const currentLandUseByField = Object.fromEntries(
    landUseRecords.filter(r => r.year === selectedYear).map(r => [r.fieldId, r])
  ) as Record<number, LandUseRecord>;

  const filteredFields = fields.filter(f =>
    !search || (f.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const onSubmitField = (values: FieldFormData) => {
    createField({ farmId, data: values as any }, { onSuccess: () => { setIsAddFieldOpen(false); fieldForm.reset(); } });
  };

  const onSubmitCrop = (values: CropFormData) => {
    createCrop({ farmId, data: values as any }, { onSuccess: () => { setIsAddCropOpen(false); cropForm.reset(); } });
  };

  async function handleEditCropSave() {
    if (!editingCrop) return;
    setEditCropSaving(true);
    try {
      const res = await fetch(`/api/farms/${safeFarmId}/crop-varieties/${editingCrop.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: editCropForm.name, variety: editCropForm.variety, category: editCropForm.category, notes: editCropForm.notes }),
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      await queryClient.invalidateQueries({ queryKey: getListCropsQueryKey(safeFarmId) });
      setEditingCrop(null);
    } catch (err) {
      alert(`Could not save changes: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setEditCropSaving(false);
    }
  }

  async function handleAddVarietySave() {
    if (!addingVarietyCropId) return;
    setAddVarietySaving(true);
    try {
      const res = await fetch(`/api/farms/${safeFarmId}/crops/${addingVarietyCropId}/varieties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ variety: addVarietyForm.variety, notes: addVarietyForm.notes }),
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      await queryClient.invalidateQueries({ queryKey: getListCropsQueryKey(safeFarmId) });
      setAddingVarietyCropId(null);
      setAddVarietyForm({ variety: "", notes: "" });
    } catch (err) {
      alert(`Could not add variety: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setAddVarietySaving(false);
    }
  }

  const onSubmitAssign = (values: AssignCropFormData) => {
    if (!assignForField) return;
    const targetPop = values.targetPlantPopulationM2 ? parseFloat(values.targetPlantPopulationM2) : null;
    const tgw = values.tgwGrams ? parseFloat(values.tgwGrams) : null;
    let estimatedEstablishmentPercent: number | null = null;
    let calculatedSeedRateKgHa: number | null = null;
    if (targetPop && tgw) {
      const establishment = getEstablishmentPercent(assignForField.soilType, values.plantingDate);
      const calc = calculateSeedRate(targetPop, tgw, establishment.percent);
      estimatedEstablishmentPercent = establishment.percent;
      calculatedSeedRateKgHa = calc?.seedRateKgHa ?? null;
    }
    const seedBatchId = values.seedBatchId ? Number(values.seedBatchId) : null;
    let bagsAllocated: number | null = null;
    if (seedBatchId) {
      const selectedBatch = availableSeedBatches.find(b => b.id === seedBatchId);
      const seedRateNum = values.seedRate ? parseFloat(values.seedRate) : NaN;
      const areaHa = assignForField.areaHectares ? Number(assignForField.areaHectares) : NaN;
      const bagWeightKg = selectedBatch ? Number(selectedBatch.bagWeightKg) || 25 : 25;
      if (selectedBatch && !isNaN(seedRateNum) && !isNaN(areaHa) && (values.seedUnit || "kg/ha") === "kg/ha") {
        bagsAllocated = Math.ceil((seedRateNum * areaHa) / bagWeightKg);
      }
    }
    assignCrop(
      {
        farmId,
        data: {
          ...values,
          fieldId: assignForField.id,
          varietyId: Number(values.varietyId),
          year: CURRENT_YEAR,
          season: values.season,
          seedRate: values.seedRate || null,
          seedUnit: values.seedRate ? (values.seedUnit || "kg/ha") : null,
          targetPlantPopulationM2: targetPop,
          tgwGrams: tgw,
          estimatedEstablishmentPercent,
          calculatedSeedRateKgHa,
          targetRowSpacingCm: values.targetRowSpacingCm ? parseFloat(values.targetRowSpacingCm) : null,
          seedBatchId,
          bagsAllocated,
        },
      },
      {
        onSuccess: () => {
          setAssignForField(null);
          assignForm.reset();
          setTgwManuallySet(false);
          if (seedBatchId) {
            queryClient.invalidateQueries({ queryKey: getListSeedBatchesQueryKey(safeFarmId) });
          }
        },
      }
    );
  };

  const CROP_CATEGORIES = ["Combinable Crops", "Root Crops", "Vegetables", "Oilseeds", "Pulses", "Grass & Forage", "Other"];

  // Crop register: group by name, sorted alphabetically
  const cropGroupMap = new Map<string, CropRecord[]>();
  for (const crop of crops) {
    if (!cropGroupMap.has(crop.name)) cropGroupMap.set(crop.name, []);
    cropGroupMap.get(crop.name)!.push(crop);
  }
  const sortedCropGroupNames = Array.from(cropGroupMap.keys()).sort((a, b) => a.localeCompare(b));

  const toggleCropGroup = (name: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  const cropSeasonAssignments = (varietyId: number) => assignments.filter(a =>
    a.varietyId === varietyId &&
    (selectedYear === CURRENT_YEAR ? (a.year === CURRENT_YEAR || !a.year) : a.year === selectedYear)
  );

  return (
    <AppLayout title="Fields & Crops">
      <style>{`
        @media print {
          body > * { display: none !important; }
          [role="dialog"] #fields-print-area { display: block !important; position: fixed; top:0; left:0; width:100%; padding:24px; font-size:11px; color:#000; background:#fff; }
        }
      `}</style>

      <ArableFarmSettingsChecklist farmId={safeFarmId} />

      {/* Tabs */}
      <TabBar className="mb-6">
        <TabButton active={tab === "fields"} onClick={() => setTab("fields")}>Fields</TabButton>
        <TabButton active={tab === "crops"} onClick={() => setTab("crops")}>Crops Register</TabButton>
        <TabButton active={tab === "seed"} onClick={() => setTab("seed")}>Seed Records</TabButton>
        <TabButton active={tab === "bydv"} onClick={() => setTab("bydv")}>BYDV Risk</TabButton>
        <TabButton active={tab === "tenure"} onClick={() => setTab("tenure")}>Land Tenure</TabButton>
        <TabButton active={tab === "rotation"} onClick={() => setTab("rotation")}>Crop Rotation</TabButton>
        <TabButton active={tab === "map"} onClick={() => setTab("map")}>Field Map</TabButton>
        <TabButton active={tab === "grassland"} onClick={() => setTab("grassland")}>Grassland</TabButton>
      </TabBar>

      {/* ── FIELDS TAB ── */}
      {tab === "fields" && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                <Input
                  placeholder="Search fields..."
                  className="pl-10 bg-white"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="relative flex-shrink-0">
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(Number(e.target.value))}
                  className="appearance-none border border-input rounded-lg pl-3 pr-8 py-2 text-sm bg-white font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                >
                  {availableYears.map(y => (
                    <option key={y} value={y}>{y} Season{y === CURRENT_YEAR ? " (Current)" : ""}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={() => setPrintOpen(true)} className="gap-2 flex-shrink-0">
                <Printer className="w-4 h-4" /> Print Register
              </Button>
            <Dialog open={isAddFieldOpen} onOpenChange={o => { setIsAddFieldOpen(o); if (!o) createFieldMut.reset(); }}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto"><Plus className="w-4 h-4 mr-2" /> Add Field</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Field</DialogTitle>
                  <DialogDescription>Register a new field or parcel to your farm holding.</DialogDescription>
                </DialogHeader>
                <form onSubmit={fieldForm.handleSubmit(onSubmitField)} className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Field Name / ID</label>
                    <Input {...fieldForm.register("name", { required: true })} placeholder="e.g. North Pasture" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Area (ha)</label>
                      <Input type="number" step="0.0001" {...fieldForm.register("areaHectares", { valueAsNumber: true })} placeholder="e.g. 12.5" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Soil Type</label>
                      <select
                        {...fieldForm.register("soilType")}
                        className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">— Select soil type —</option>
                        {SOIL_TYPE_OPTIONS.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      {(() => {
                        const sv = fieldForm.watch("soilType");
                        const opt = SOIL_TYPE_OPTIONS.find(o => o.value === sv);
                        return opt ? (
                          <p className="text-xs text-blue-600/80 mt-1">
                            💧 Holds ~{opt.awcMm} mm available water
                          </p>
                        ) : null;
                      })()}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">RPA Parcel Reference</label>
                    <Input {...fieldForm.register("fieldReference")} placeholder="e.g. TF 1234 5678" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Find this in the{" "}
                      <a href="https://www.ruralpayments.service.gov.uk" target="_blank" rel="noopener noreferrer" className="underline text-primary">
                        Rural Payments portal
                      </a>{" "}
                      or on any RPA correspondence. Leave blank if not registered for scheme payments.
                    </p>
                  </div>
                  <div className="border-t border-border pt-3">
                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                      <input type="checkbox" {...fieldForm.register("blackgrassRiskField")} className="rounded" />
                      Black-grass risk field
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tracks this field in the Black-grass Five-in-Five cultural control view (Crop History &amp; Season Reports).
                    </p>
                  </div>
                  <DialogMutationError mutation={createFieldMut} message="Failed to save — your entries are still here." />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddFieldOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={creatingField}>{creatingField ? "Saving..." : "Save Field"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {fieldsLoading ? (
              [1, 2, 3].map(i => <div key={i} className="h-56 rounded-2xl bg-black/5 animate-pulse" />)
            ) : filteredFields.length === 0 ? (
              <div className="col-span-full py-16 text-center text-foreground/50 border-2 border-dashed rounded-2xl">
                <MapIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg">No fields found.</p>
              </div>
            ) : filteredFields.map((field) => {
              const crop = currentCropByField[field.id];
              const fieldLandUse = !crop ? currentLandUseByField[field.id] : undefined;
              return (
                <Card key={field.id} className="group relative overflow-visible">
                  <div className="absolute top-3 right-3 z-30">
                    <FieldCardMenu
                      field={field}
                      farmId={farmId}
                      crops={crops}
                      currentCrop={crop}
                      onAssignCrop={() => { setAssignForField(field); assignForm.reset(); setSeasonManuallySet(false); setTgwManuallySet(false); }}
                      onBoundaryUpdated={() => { fieldsRefetch(); }}
                      defaultEditOpen={autoOpenFieldId === field.id}
                    />
                  </div>

                  {/* Green header — field name (clickable for history) */}
                  <div
                    className="bg-gradient-to-br from-green-100 to-emerald-50 rounded-t-2xl border-b border-border/50 px-4 pt-4 pb-3 cursor-pointer hover:from-green-200 hover:to-emerald-100 transition-colors group/header"
                    onClick={() => { setSelectedFieldForHistory(field); setDrawerTab("overview"); }}
                  >
                    <div className="flex items-center justify-between pr-8">
                      <h3 className="text-lg font-bold text-foreground leading-snug">{field.name || `Field #${field.id}`}</h3>
                      <History className="w-4 h-4 text-green-600/50 group-hover/header:text-green-700 transition-colors flex-shrink-0" />
                    </div>
                    {field.tenureType && field.tenureType !== "owned" && (() => {
                      const tenureBadgeMap: Record<string, { label: string; cls: string }> = {
                        fbt:              { label: "FBT",              cls: "bg-amber-100 text-amber-800 border-amber-300" },
                        aha:              { label: "AHA Tenancy",      cls: "bg-amber-100 text-amber-800 border-amber-300" },
                        contract_farming: { label: "Contract Farming", cls: "bg-violet-100 text-violet-800 border-violet-300" },
                        grazing_licence:  { label: "Grazing Licence",  cls: "bg-sky-100 text-sky-800 border-sky-300" },
                        seasonal_licence: { label: "Seasonal Licence", cls: "bg-blue-100 text-blue-800 border-blue-300" },
                        other:            { label: "Tenanted",         cls: "bg-slate-100 text-slate-700 border-slate-300" },
                      };
                      const b = tenureBadgeMap[field.tenureType] ?? { label: field.tenureType, cls: "bg-slate-100 text-slate-700 border-slate-300" };
                      return (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1.5 uppercase tracking-wide ${b.cls}`}>
                          <Key className="w-2.5 h-2.5" />
                          {b.label}
                        </span>
                      );
                    })()}
                    {(field as any).blackgrassRiskField && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1.5 ml-1.5 uppercase tracking-wide bg-red-100 text-red-800 border-red-300">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        Black-grass risk
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    {/* Crop / Land use badge */}
                    <div className="mb-3">
                      {crop ? (
                        <span className="inline-flex items-center gap-1.5 bg-green-700 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
                          <Wheat className="w-3 h-3" />
                          {crop.cropName}
                        </span>
                      ) : fieldLandUse ? (
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${LAND_USE_BADGE[fieldLandUse.landUse] ?? "bg-slate-100 text-slate-700 border-slate-300"}`}>
                          <TreePine className="w-3 h-3" />
                          {LAND_USE_LABEL[fieldLandUse.landUse] ?? fieldLandUse.landUse}
                          {fieldLandUse.schemeActionCode && <span className="font-mono ml-0.5 opacity-70">· {fieldLandUse.schemeActionCode}</span>}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-black/5 text-foreground/40 text-xs font-medium px-2.5 py-1 rounded-full">
                          <Leaf className="w-3 h-3" />
                          Not recorded
                        </span>
                      )}
                    </div>

                    {/* Crop details / Land use details / assign prompt */}
                    {crop ? (
                      <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-3 space-y-1">
                        {crop.plantingDate && (
                          <div className="flex items-center gap-2 text-xs text-foreground/70">
                            <CalendarDays className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                            <span>Planted: <strong>{formatDate(crop.plantingDate)}</strong></span>
                          </div>
                        )}
                        {crop.expectedHarvestDate && (
                          <div className="flex items-center gap-2 text-xs text-foreground/70">
                            <Wheat className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                            <span>Expected harvest: <strong>{formatDate(crop.expectedHarvestDate)}</strong></span>
                          </div>
                        )}
                        {crop.actualHarvestDate && (
                          <div className="flex items-center gap-2 text-xs text-foreground/70">
                            <Wheat className="w-3.5 h-3.5 text-green-700 flex-shrink-0" />
                            <span>Actual harvest: <strong>{formatDate(crop.actualHarvestDate)}</strong></span>
                            {(() => {
                              const days = harvestVarianceDays(crop.expectedHarvestDate, crop.actualHarvestDate);
                              return days !== null ? <VarianceBadge days={days} size="xs" /> : null;
                            })()}
                          </div>
                        )}
                        {crop.actualHarvestDate && (
                          <HarvestNoteEditor
                            assignmentId={crop.id}
                            farmId={farmId}
                            initialNote={crop.notes}
                          />
                        )}
                      </div>
                    ) : fieldLandUse ? (
                      <div className="bg-stone-50 border border-stone-100 rounded-xl p-3 mb-3 space-y-1">
                        {fieldLandUse.season && (
                          <div className="flex items-center gap-2 text-xs text-foreground/70">
                            <CalendarDays className="w-3.5 h-3.5 text-stone-500 flex-shrink-0" />
                            <span>{fieldLandUse.season}</span>
                          </div>
                        )}
                        {fieldLandUse.schemeReference && (
                          <div className="flex items-center gap-2 text-xs text-foreground/70">
                            <FileText className="w-3.5 h-3.5 text-stone-500 flex-shrink-0" />
                            <span className="font-mono">{fieldLandUse.schemeReference}</span>
                          </div>
                        )}
                        {fieldLandUse.managementNotes && (
                          <div className="flex items-start gap-2 text-xs text-foreground/60 italic">
                            <StickyNote className="w-3.5 h-3.5 text-stone-400 flex-shrink-0 mt-0.5" />
                            <span>{fieldLandUse.managementNotes}</span>
                          </div>
                        )}
                        <button
                          onClick={() => { setEditingLandUseRecord(fieldLandUse); landUseForm.reset({ landUse: fieldLandUse.landUse, year: String(fieldLandUse.year), season: fieldLandUse.season ?? "", schemeActionCode: fieldLandUse.schemeActionCode ?? "", schemeReference: fieldLandUse.schemeReference ?? "", areaHectares: fieldLandUse.areaHectares ? String(fieldLandUse.areaHectares) : "", startDate: fieldLandUse.startDate ?? "", endDate: fieldLandUse.endDate ?? "", managementNotes: fieldLandUse.managementNotes ?? "" }); }}
                          className="text-xs text-foreground/50 hover:text-foreground underline mt-1 cursor-pointer"
                        >
                          Edit record
                        </button>
                      </div>
                    ) : (
                      <div className="mb-3 space-y-1.5">
                        <button
                          onClick={() => { setAssignForField(field); assignForm.reset(); setSeasonManuallySet(false); setTgwManuallySet(false); }}
                          className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-green-200 rounded-xl text-xs text-green-700 font-medium hover:bg-green-50 transition-colors cursor-pointer"
                        >
                          <Sprout className="w-3.5 h-3.5" />
                          Assign crop
                        </button>
                        <button
                          onClick={() => { setLandUseForField(field); landUseForm.reset({ landUse: "fallow", year: String(selectedYear), season: "", schemeActionCode: "", schemeReference: "", areaHectares: field.areaHectares ? String(field.areaHectares) : "", startDate: "", endDate: "", managementNotes: "" }); }}
                          className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-stone-200 rounded-xl text-xs text-stone-600 font-medium hover:bg-stone-50 transition-colors cursor-pointer"
                        >
                          <TreePine className="w-3.5 h-3.5" />
                          Record land use
                        </button>
                      </div>
                    )}

                    {/* Field stats */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="text-xs text-foreground/50 uppercase font-semibold mb-0.5">Soil</p>
                        <p className="text-sm font-medium text-foreground">{field.soilType || '—'}</p>
                      </div>
                      {(field as any).fieldReference && (
                        <>
                          <div className="w-px h-8 bg-border" />
                          <div className="flex-1">
                            <p className="text-xs text-foreground/50 uppercase font-semibold mb-0.5">RPA Ref</p>
                            <p className="text-sm font-medium text-foreground font-mono">{(field as any).fieldReference}</p>
                          </div>
                        </>
                      )}
                      <div className="w-px h-8 bg-border" />
                      <div className="flex-1">
                        <p className="text-xs text-foreground/50 uppercase font-semibold mb-0.5">Area</p>
                        {field.enclosedFeatureAreaHa && field.enclosedFeatureAreaHa > 0 ? (
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {field.computedFarmableAreaHa != null ? field.computedFarmableAreaHa.toFixed(2) : (field.areaHectares ? parseFloat(String(field.areaHectares)).toFixed(2) : "—")} ha <span className="text-xs text-green-600 font-semibold">farmable</span>
                            </p>
                            <p className="text-xs text-foreground/50">
                              {field.areaHectares ? parseFloat(String(field.areaHectares)).toFixed(2) : "—"} ha gross · −{field.enclosedFeatureAreaHa.toFixed(2)} ha features
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm font-medium text-foreground">
                            {field.areaHectares ? `${parseFloat(String(field.areaHectares)).toFixed(2)} ha` : '—'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* ── CROPS REGISTER TAB ── */}
      {tab === "crops" && (
        <>
          <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
            <div>
              <p className="text-sm text-foreground/60">
                Your crop catalogue — add crop types here, then assign them to fields each season.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Year selector — same as Fields tab */}
              <div className="relative flex-shrink-0">
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
                <select
                  value={selectedYear}
                  onChange={e => { setSelectedYear(Number(e.target.value)); setExpandedVarietyId(null); setExpandedGroups(new Set()); }}
                  className="appearance-none border border-input rounded-lg pl-3 pr-8 py-2 text-sm bg-white font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                >
                  {availableYears.map(y => (
                    <option key={y} value={y}>{y} Season{y === CURRENT_YEAR ? " (Current)" : ""}</option>
                  ))}
                </select>
              </div>
              <Button variant="outline" className="gap-2" onClick={() => setPrintOpen(true)}>
                <Printer className="w-4 h-4" /> Print Register
              </Button>
            <Dialog open={isAddCropOpen} onOpenChange={o => { setIsAddCropOpen(o); if (!o) createCropMut.reset(); }}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" /> Add Crop</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Crop to Register</DialogTitle>
                  <DialogDescription>Add a crop type to your farm's catalogue. You can then assign it to fields each season.</DialogDescription>
                </DialogHeader>
                <form onSubmit={cropForm.handleSubmit(onSubmitCrop)} className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Crop Name</label>
                    <Input {...cropForm.register("name", { required: true })} placeholder="e.g. Winter Wheat, Oil Seed Rape" autoComplete="off" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Variety (optional)</label>
                    <Input {...cropForm.register("variety")} placeholder="e.g. KWS Zyatt, Extase" autoComplete="off" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Category</label>
                    <select
                      {...cropForm.register("category")}
                      className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white"
                    >
                      <option value="">Select category...</option>
                      {CROP_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <DialogMutationError mutation={createCropMut} message="Failed to save — your entries are still here." />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddCropOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={creatingCrop}>{creatingCrop ? "Saving..." : "Add Crop"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            </div>
          </div>

          {cropsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-black/5 animate-pulse" />)}
            </div>
          ) : crops.length === 0 ? (
            <div className="py-16 text-center text-foreground/50 border-2 border-dashed rounded-2xl">
              <Sprout className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No crops registered yet</p>
              <p className="text-sm mt-1">Add your crop types above, then assign them to fields each season.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedCropGroupNames.map(groupName => {
                const groupCrops = cropGroupMap.get(groupName)!;
                const isGroupExpanded = expandedGroups.has(groupName);
                const totalGroupFieldCount = groupCrops.reduce((sum, c) => sum + cropSeasonAssignments(c.id).length, 0);
                const groupCategories = Array.from(new Set(groupCrops.map(c => c.category).filter(Boolean)));

                return (
                  <div key={groupName} className="bg-white border border-border/50 rounded-xl overflow-hidden transition-shadow hover:shadow-sm">
                    {/* ── Group header row ── */}
                    <div className="flex items-center">
                      <button
                        onClick={() => toggleCropGroup(groupName)}
                        className="flex-1 flex items-center gap-4 px-5 py-4 text-left"
                      >
                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                          <Wheat className="w-5 h-5 text-green-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground">{groupName}</p>
                          <p className="text-sm text-foreground/50">
                            {groupCrops.length === 1 && !groupCrops[0].variety
                              ? groupCategories[0] ?? "No variety set"
                              : `${groupCrops.length} variet${groupCrops.length === 1 ? "y" : "ies"}${groupCategories.length === 1 ? ` · ${groupCategories[0]}` : ""}`
                            }
                          </p>
                        </div>
                        {totalGroupFieldCount > 0 ? (
                          <div className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full flex-shrink-0">
                            <Leaf className="w-3 h-3" />
                            {totalGroupFieldCount} field{totalGroupFieldCount !== 1 ? "s" : ""} this season
                          </div>
                        ) : (
                          <span className="text-xs text-foreground/30 flex-shrink-0">No fields this season</span>
                        )}
                        <ChevronDown className={`w-4 h-4 text-foreground/30 flex-shrink-0 transition-transform ${isGroupExpanded ? "rotate-180" : ""}`} />
                      </button>
                      <div className="flex items-center pr-4 flex-shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); setAddingVarietyCropId(groupCrops[0].cropId ?? null); setAddVarietyForm({ variety: "", notes: "" }); }}
                          className="flex items-center gap-1 text-xs font-medium text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 px-2.5 py-1.5 rounded-lg transition-colors"
                          title="Add a new variety to this crop"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add variety
                        </button>
                      </div>
                    </div>

                    {/* ── Variety sub-rows ── */}
                    {isGroupExpanded && (
                      <div className="border-t border-border/50 divide-y divide-border/30">
                        {groupCrops.map(crop => {
                          const assignedFields = cropSeasonAssignments(crop.id);
                          const isVarietyExpanded = expandedVarietyId === crop.id;
                          const hasAssignments = assignedFields.length > 0;

                          return (
                            <div key={crop.id}>
                              {/* Variety row header */}
                              <div className="flex items-center bg-green-50/20 hover:bg-green-50/50 transition-colors">
                                <button
                                  onClick={() => setExpandedVarietyId(isVarietyExpanded ? null : crop.id)}
                                  className="flex-1 flex items-center gap-3 px-5 py-3 text-left min-w-0"
                                >
                                  <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0 ml-3" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground">
                                      {crop.variety || <span className="italic text-foreground/40">No variety specified</span>}
                                    </p>
                                    {(crop as any).notes && (
                                      <p className="text-xs text-foreground/50 truncate max-w-sm mt-0.5">{(crop as any).notes}</p>
                                    )}
                                    {crop.category && (
                                      <p className="text-xs text-foreground/40">{crop.category}</p>
                                    )}
                                  </div>
                                  {hasAssignments ? (
                                    <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full flex-shrink-0">
                                      {assignedFields.length} field{assignedFields.length !== 1 ? "s" : ""}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-foreground/30 flex-shrink-0">No fields</span>
                                  )}
                                  <ChevronDown className={`w-3.5 h-3.5 text-foreground/30 flex-shrink-0 transition-transform ${isVarietyExpanded ? "rotate-180" : ""}`} />
                                </button>
                                <div className="flex items-center gap-0.5 pr-3 flex-shrink-0">
                                  <DocAttach
                                    farmId={safeFarmId}
                                    endpoint="crop-varieties"
                                    recordId={crop.id}
                                    documentPath={(crop as any).documentPath ?? null}
                                    documentName={(crop as any).documentName ?? null}
                                    queryKey={[...getListCropsQueryKey(safeFarmId)]}
                                    compact
                                  />
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setEditingCrop(crop); setEditCropForm({ name: crop.name, variety: crop.variety ?? "", category: crop.category ?? "", notes: (crop as any).notes ?? "" }); }}
                                    className="p-1.5 rounded hover:bg-green-100 text-foreground/30 hover:text-green-700 transition-colors"
                                    title="Edit variety"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setPendingDeleteVariety(crop.id); }}
                                    disabled={deleteVarietyMut.isPending && pendingDeleteVariety === crop.id}
                                    className="p-1.5 rounded hover:bg-red-50 text-foreground/30 hover:text-red-500 transition-colors disabled:opacity-40"
                                    title="Delete variety"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Expanded field list for this variety */}
                              {isVarietyExpanded && (
                                <div className="border-t border-border/30 bg-green-50/40 px-5 py-3">
                                  {!hasAssignments ? (
                                    <p className="text-xs text-foreground/40 py-2 text-center">
                                      No fields are growing {crop.variety ? `${groupName} (${crop.variety})` : groupName} this season.
                                    </p>
                                  ) : (
                                    <div className="space-y-2">
                                      <p className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wide mb-2">
                                        {crop.variety ? `${groupName} — ${crop.variety}` : groupName} · {selectedYear} season
                                      </p>
                                      {assignedFields.map(a => {
                                        const field = fields.find(f => f.id === a.fieldId);
                                        const varianceDays = harvestVarianceDays(a.expectedHarvestDate, a.actualHarvestDate);
                                        return (
                                          <div key={a.id} className="bg-white rounded-lg border border-border/50 px-3 py-2.5">
                                            <div className="flex items-center justify-between mb-1">
                                              <span className="font-semibold text-sm text-foreground">{field?.name || `Field #${a.fieldId}`}</span>
                                              {field?.areaHectares && (
                                                <span className="text-xs text-foreground/40">{parseFloat(String(field.areaHectares)).toFixed(1)} ha</span>
                                              )}
                                            </div>
                                            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-foreground/60">
                                              {a.plantingDate && (
                                                <span className="flex items-center gap-1">
                                                  <CalendarDays className="w-3 h-3 text-green-600" />
                                                  Planted {formatDate(a.plantingDate)}
                                                </span>
                                              )}
                                              {a.expectedHarvestDate && (
                                                <span className="flex items-center gap-1">
                                                  <Wheat className="w-3 h-3 text-amber-500" />
                                                  Exp. {formatDate(a.expectedHarvestDate)}
                                                </span>
                                              )}
                                              {a.actualHarvestDate && (
                                                <span className="flex items-center gap-2">
                                                  <Wheat className="w-3 h-3 text-green-700" />
                                                  Actual {formatDate(a.actualHarvestDate)}
                                                  {varianceDays !== null && <VarianceBadge days={varianceDays} size="xs" />}
                                                </span>
                                              )}
                                            </div>
                                            {a.notes && (
                                              <p className="text-xs text-foreground/40 italic mt-1 flex items-center gap-1">
                                                <StickyNote className="w-2.5 h-2.5" />{a.notes}
                                              </p>
                                            )}
                                            {a.seedBatchId && (
                                              <div className="mt-2 pt-2 border-t border-border/30 flex items-center gap-2 flex-wrap">
                                                <QrCode className="w-3 h-3 text-foreground/30" />
                                                <span className="text-[11px] text-foreground/50">
                                                  Seed batch: <strong>{allSeedBatches.find(b => b.id === a.seedBatchId)?.batchNumber ?? `#${a.seedBatchId}`}</strong>
                                                  {a.bagsAllocated ? ` · ${a.bagsAllocated} bag${a.bagsAllocated !== 1 ? "s" : ""}` : ""}
                                                </span>
                                                <Input
                                                  type="number"
                                                  min={1}
                                                  placeholder={String(a.bagsAllocated ?? 1)}
                                                  value={labelCountDraft[a.id] ?? ""}
                                                  onChange={e => setLabelCountDraft(prev => ({ ...prev, [a.id]: e.target.value }))}
                                                  className="h-6 w-16 text-xs px-2"
                                                />
                                                <Button
                                                  type="button"
                                                  size="sm"
                                                  variant="outline"
                                                  className="h-6 text-[11px] px-2 gap-1"
                                                  onClick={() => void handleGenerateLabels(a)}
                                                >
                                                  <Printer className="w-3 h-3" />
                                                  {a.labelsGeneratedAt ? "Reprint labels" : "Print bag labels"}
                                                </Button>
                                                {a.labelsGeneratedAt && (
                                                  <span className="text-[10px] text-foreground/35">
                                                    Last printed {formatDate(a.labelsGeneratedAt)}
                                                  </span>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                  {/* ── Variety Documents (data sheets, seed certs) ── */}
                                  <div className="mt-3 pt-3 border-t border-border/30">
                                    <p className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                      <Paperclip className="w-3 h-3" /> Variety Documents
                                    </p>
                                    {cropDocsQ.isLoading && expandedVarietyId === crop.id ? (
                                      <p className="text-xs text-foreground/30 mb-2">Loading…</p>
                                    ) : cropDocs.length > 0 ? (
                                      <div className="space-y-1.5 mb-2">
                                        {cropDocs.map(doc => (
                                          <div key={doc.id} className="flex items-center gap-2 bg-white border border-border/50 rounded-lg px-3 py-2">
                                            <FileText className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                              <p className="text-xs font-medium truncate">{doc.title}</p>
                                              {doc.documentName && doc.documentName !== doc.title && (
                                                <p className="text-[10px] text-foreground/40 truncate">{doc.documentName}</p>
                                              )}
                                            </div>
                                            <a
                                              href={`/api/storage${doc.documentUrl}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="flex-shrink-0 p-1 rounded hover:bg-blue-50 text-blue-500 transition-colors"
                                              title="Open document"
                                            >
                                              <Download className="w-3.5 h-3.5" />
                                            </a>
                                            <button
                                              onClick={() => {
                                                const cropTypeId = crop.cropId ?? null;
                                                if (!cropTypeId) return;
                                                setPendingDeleteDoc({ cropTypeId, docId: doc.id });
                                              }}
                                              className="flex-shrink-0 p-1 rounded hover:bg-red-50 text-foreground/30 hover:text-red-500 transition-colors"
                                              title="Remove"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-xs text-foreground/30 italic mb-2">No documents yet — attach the variety data sheet or seed certificate.</p>
                                    )}
                                    <label className={`flex items-center gap-2 cursor-pointer px-3 py-2 border border-dashed border-border/60 rounded-xl hover:border-green-400 hover:bg-green-50/50 transition-colors ${isUploadingCropDoc ? "opacity-50 pointer-events-none" : ""}`}>
                                      <Paperclip className="w-3.5 h-3.5 text-foreground/35 flex-shrink-0" />
                                      <span className="text-xs text-foreground/45">{isUploadingCropDoc ? "Uploading…" : "Attach variety data sheet or seed certificate"}</span>
                                      <input
                                        type="file"
                                        className="hidden"
                                        accept="application/pdf,image/*,.doc,.docx"
                                        disabled={isUploadingCropDoc}
                                        onChange={async e => {
                                          const file = e.target.files?.[0];
                                          if (!file) return;
                                          const cropTypeId = crop.cropId ?? null;
                                          if (!cropTypeId) return;
                                          setIsUploadingCropDoc(true);
                                          try {
                                            const result = await uploadFile(file);
                                            if (!result) return;
                                            await fetch(`/api/farms/${safeFarmId}/crops/${cropTypeId}/documents`, {
                                              method: "POST",
                                              headers: { "Content-Type": "application/json" },
                                              body: JSON.stringify({ title: file.name.replace(/\.[^.]+$/, ""), documentUrl: result.objectPath, documentName: file.name }),
                                            }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
                                            queryClient.invalidateQueries({ queryKey: ["crop-docs", safeFarmId, cropTypeId] });
                                            e.target.value = "";
                                          } finally {
                                            setIsUploadingCropDoc(false);
                                          }
                                        }}
                                      />
                                    </label>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Non-crop land use section */}
          {(() => {
            const seasonLandUse = landUseRecords.filter(r =>
              selectedYear === CURRENT_YEAR ? r.year === CURRENT_YEAR : r.year === selectedYear
            );
            if (seasonLandUse.length === 0) return null;
            return (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TreePine className="w-4 h-4 text-stone-600" />
                    <h3 className="font-semibold text-foreground">Non-Crop Land Use — {selectedYear} Season</h3>
                    <span className="text-xs text-foreground/40 bg-muted px-2 py-0.5 rounded-full">{seasonLandUse.length} record{seasonLandUse.length !== 1 ? "s" : ""}</span>
                  </div>
                </div>
                <div className="bg-white border border-border/50 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-stone-50 border-b border-border/50">
                      <tr>
                        <th className="text-left px-4 py-2.5 font-medium text-foreground/60 text-xs uppercase tracking-wide">Field</th>
                        <th className="text-left px-4 py-2.5 font-medium text-foreground/60 text-xs uppercase tracking-wide">Land Use</th>
                        <th className="text-left px-4 py-2.5 font-medium text-foreground/60 text-xs uppercase tracking-wide hidden sm:table-cell">Scheme</th>
                        <th className="text-left px-4 py-2.5 font-medium text-foreground/60 text-xs uppercase tracking-wide hidden md:table-cell">Season</th>
                        <th className="text-right px-4 py-2.5 font-medium text-foreground/60 text-xs uppercase tracking-wide hidden sm:table-cell">Area (ha)</th>
                        <th className="px-4 py-2.5 w-16" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {seasonLandUse.map(r => {
                        const field = fields.find(f => f.id === r.fieldId);
                        return (
                          <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3">
                              <p className="font-medium">{r.fieldName || field?.name || `Field #${r.fieldId}`}</p>
                              {r.fieldReference && <p className="text-xs text-foreground/40 font-mono">{r.fieldReference}</p>}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${LAND_USE_BADGE[r.landUse] ?? "bg-slate-100 text-slate-700 border-slate-300"}`}>
                                <TreePine className="w-3 h-3" />
                                {LAND_USE_LABEL[r.landUse] ?? r.landUse}
                              </span>
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell">
                              {r.schemeActionCode ? (
                                <span className="font-mono font-semibold text-teal-700 text-xs">{r.schemeActionCode}</span>
                              ) : <span className="text-foreground/30 text-xs">—</span>}
                              {r.schemeReference && <p className="text-xs text-foreground/40 font-mono">{r.schemeReference}</p>}
                            </td>
                            <td className="px-4 py-3 text-xs text-foreground/60 hidden md:table-cell">{r.season || "—"}</td>
                            <td className="px-4 py-3 text-right text-xs text-foreground/60 hidden sm:table-cell">
                              {r.areaHectares ? parseFloat(String(r.areaHectares)).toFixed(2) : field?.areaHectares ? `${parseFloat(String(field.areaHectares)).toFixed(2)} *` : "—"}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => { setEditingLandUseRecord(r); landUseForm.reset({ landUse: r.landUse, year: String(r.year), season: r.season ?? "", schemeActionCode: r.schemeActionCode ?? "", schemeReference: r.schemeReference ?? "", areaHectares: r.areaHectares ? String(r.areaHectares) : "", startDate: r.startDate ?? "", endDate: r.endDate ?? "", managementNotes: r.managementNotes ?? "" }); }}
                                className="text-xs text-foreground/40 hover:text-foreground underline cursor-pointer"
                              >Edit</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-foreground/40 mt-2 px-1">* Using full field area — no partial area recorded.</p>
              </div>
            );
          })()}
        </>
      )}

      {/* ── FIELD HISTORY DIALOG ── */}
      <Dialog open={!!selectedFieldForHistory} onOpenChange={(o) => { if (!o) setSelectedFieldForHistory(null); }}>
        <DialogContent className="max-w-3xl p-0 flex flex-col max-h-[85vh] overflow-hidden gap-0" aria-describedby={undefined}>
          <DialogTitle className="sr-only">
            {selectedFieldForHistory?.name || `Field #${selectedFieldForHistory?.id}`} — Field Details
          </DialogTitle>
          {selectedFieldForHistory && (() => {
            const f = selectedFieldForHistory;
            const fieldAssignments = assignments
              .filter(a => a.fieldId === f.id)
              .sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
            const currentCropForDrawer = currentCropByField[f.id];
            const currentLandUseForDrawer = !currentCropForDrawer ? currentLandUseByField[f.id] : undefined;
            const fieldLandUseHistory = landUseRecords.filter(r => r.fieldId === f.id).sort((a, b) => b.year - a.year);
            return (
              <>
              {/* header */}
              <div className="bg-gradient-to-br from-green-100 to-emerald-50 border-b border-border/50 px-8 pt-6 pb-4 flex-shrink-0 rounded-t-2xl">
                <div className="pr-8">
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-1">Field Details</p>
                  <h2 className="text-xl font-bold text-foreground leading-tight">{f.name || `Field #${f.id}`}</h2>
                  {f.fieldReference && (
                    <p className="text-xs text-foreground/50 mt-0.5">Ref: {f.fieldReference}</p>
                  )}
                </div>
                {/* tabs */}
                <TabBar className="mt-4">
                  <TabButton size="sm" active={drawerTab === "overview"} onClick={() => setDrawerTab("overview")}>Overview</TabButton>
                  <TabButton size="sm" active={drawerTab === "history"} onClick={() => setDrawerTab("history")}>Season History</TabButton>
                  <TabButton size="sm" active={drawerTab === "nmp"} onClick={() => setDrawerTab("nmp")}>NMP</TabButton>
                  <TabButton size="sm" active={drawerTab === "tenure"} onClick={() => { setDrawerTab("tenure"); setTenureEditMode(false); }}>Land Tenure</TabButton>
                </TabBar>
              </div>

              {/* body */}
              <div className="flex-1 overflow-y-auto p-6">

                {drawerTab === "overview" && (
                  <div className="space-y-5">
                    {/* field stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/[0.03] rounded-xl p-4">
                        <p className="text-xs text-foreground/50 uppercase font-semibold mb-1">Area</p>
                        <p className="text-base font-bold text-foreground">
                          {f.areaHectares ? `${parseFloat(String(f.areaHectares)).toFixed(2)} ha` : "—"}
                        </p>
                      </div>
                      <div className="bg-black/[0.03] rounded-xl p-4">
                        <p className="text-xs text-foreground/50 uppercase font-semibold mb-1">Soil Type</p>
                        <p className="text-base font-bold text-foreground">{f.soilType || "—"}</p>
                      </div>
                    </div>
                    {/* biofuel eligibility indicator */}
                    {(() => {
                      const decl = biofuelDeclarations.find(d => d.fieldName === f.name);
                      if (!decl && biofuelDeclarations.length === 0) return null;
                      const statusColor = decl?.eligibilityStatus === "eligible" ? { bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d", dot: "#16a34a" } : decl?.eligibilityStatus === "not-eligible" ? { bg: "#fef2f2", border: "#fecaca", text: "#dc2626", dot: "#dc2626" } : { bg: "#fefce8", border: "#fef08a", text: "#a16207", dot: "#ca8a04" };
                      return (
                        <div className="rounded-xl p-4" style={{ background: decl ? statusColor.bg : "#f9fafb", border: `1px solid ${decl ? statusColor.border : "#e5e7eb"}` }}>
                          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: decl ? statusColor.text : "#9ca3af" }}>Biofuel / RTFO</p>
                          {decl ? (
                            <div className="flex items-center gap-2">
                              <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ background: statusColor.dot }} />
                              <span className="text-sm font-semibold" style={{ color: statusColor.text }}>
                                {decl.eligibilityStatus === "eligible" ? "Eligible" : decl.eligibilityStatus === "not-eligible" ? "Not Eligible" : "Requires Verification"}
                              </span>
                              {(decl.highCarbonStockRisk || decl.highBiodiversityRisk) && (
                                <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "#fef2f2", color: "#dc2626" }}>
                                  {[decl.highCarbonStockRisk && "Carbon risk", decl.highBiodiversityRisk && "Biodiversity risk"].filter(Boolean).join(" · ")}
                                </span>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-foreground/50">No declaration on file</p>
                          )}
                        </div>
                      );
                    })()}

                    {/* current season crop */}
                    <div>
                      <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-3">
                        {selectedYear} Season
                      </p>
                      {currentCropForDrawer ? (
                        <div className="bg-green-50 border border-green-100 rounded-xl p-4 space-y-3">
                          <div className="flex items-center gap-2.5">
                            <span className="inline-flex items-center gap-1.5 bg-green-700 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                              <Wheat className="w-3 h-3" />
                              {currentCropForDrawer.cropName}
                            </span>
                            {currentCropForDrawer.season && (
                              <span className="text-xs text-foreground/50">{currentCropForDrawer.season}</span>
                            )}
                          </div>
                          {currentCropForDrawer.plantingDate && (
                            <div className="flex items-center gap-2 text-sm text-foreground/70">
                              <CalendarDays className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span>Planted <strong>{formatDate(currentCropForDrawer.plantingDate)}</strong></span>
                            </div>
                          )}
                          {currentCropForDrawer.expectedHarvestDate && (
                            <div className="flex items-center gap-2 text-sm text-foreground/70">
                              <Wheat className="w-4 h-4 text-amber-600 flex-shrink-0" />
                              <span>Expected harvest <strong>{formatDate(currentCropForDrawer.expectedHarvestDate)}</strong></span>
                            </div>
                          )}
                          {currentCropForDrawer.actualHarvestDate && (
                            <div className="flex items-center gap-2 text-sm text-foreground/70">
                              <Wheat className="w-4 h-4 text-green-700 flex-shrink-0" />
                              <span>Actual harvest <strong>{formatDate(currentCropForDrawer.actualHarvestDate)}</strong></span>
                              {(() => {
                                const days = harvestVarianceDays(currentCropForDrawer.expectedHarvestDate, currentCropForDrawer.actualHarvestDate);
                                return days !== null ? <VarianceBadge days={days} /> : null;
                              })()}
                            </div>
                          )}
                          {currentCropForDrawer.actualHarvestDate && (
                            <div className="pt-1">
                              <HarvestNoteEditor
                                assignmentId={currentCropForDrawer.id}
                                farmId={farmId}
                                initialNote={currentCropForDrawer.notes}
                              />
                            </div>
                          )}
                        </div>
                      ) : currentLandUseForDrawer ? (
                        <div className="bg-stone-50 border border-stone-100 rounded-xl p-4 space-y-3">
                          <div className="flex items-center gap-2.5">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${LAND_USE_BADGE[currentLandUseForDrawer.landUse] ?? "bg-slate-100 text-slate-700 border-slate-300"}`}>
                              <TreePine className="w-3 h-3" />
                              {LAND_USE_LABEL[currentLandUseForDrawer.landUse] ?? currentLandUseForDrawer.landUse}
                            </span>
                            {currentLandUseForDrawer.season && <span className="text-xs text-foreground/50">{currentLandUseForDrawer.season}</span>}
                          </div>
                          {currentLandUseForDrawer.schemeActionCode && (
                            <div className="flex items-center gap-2 text-sm text-foreground/70">
                              <FileText className="w-4 h-4 text-teal-600 flex-shrink-0" />
                              <span>Scheme action: <strong className="font-mono">{currentLandUseForDrawer.schemeActionCode}</strong></span>
                            </div>
                          )}
                          {currentLandUseForDrawer.schemeReference && (
                            <div className="flex items-center gap-2 text-sm text-foreground/70">
                              <FileText className="w-4 h-4 text-stone-500 flex-shrink-0" />
                              <span>Agreement ref: <strong className="font-mono">{currentLandUseForDrawer.schemeReference}</strong></span>
                            </div>
                          )}
                          {(currentLandUseForDrawer.startDate || currentLandUseForDrawer.endDate) && (
                            <div className="flex items-center gap-2 text-sm text-foreground/70">
                              <CalendarDays className="w-4 h-4 text-stone-500 flex-shrink-0" />
                              <span>{formatDate(currentLandUseForDrawer.startDate) ?? "—"} → {formatDate(currentLandUseForDrawer.endDate) ?? "—"}</span>
                            </div>
                          )}
                          {currentLandUseForDrawer.managementNotes && (
                            <p className="text-sm text-foreground/60 italic">{currentLandUseForDrawer.managementNotes}</p>
                          )}
                          <div className="flex gap-3 pt-1">
                            <button
                              onClick={() => { setEditingLandUseRecord(currentLandUseForDrawer); landUseForm.reset({ landUse: currentLandUseForDrawer.landUse, year: String(currentLandUseForDrawer.year), season: currentLandUseForDrawer.season ?? "", schemeActionCode: currentLandUseForDrawer.schemeActionCode ?? "", schemeReference: currentLandUseForDrawer.schemeReference ?? "", areaHectares: currentLandUseForDrawer.areaHectares ? String(currentLandUseForDrawer.areaHectares) : "", startDate: currentLandUseForDrawer.startDate ?? "", endDate: currentLandUseForDrawer.endDate ?? "", managementNotes: currentLandUseForDrawer.managementNotes ?? "" }); }}
                              className="text-xs font-semibold text-stone-600 hover:text-stone-800 underline cursor-pointer"
                            >Edit record</button>
                            <button
                              onClick={() => setPendingDeleteLandUse(currentLandUseForDrawer.id)}
                              className="text-xs font-semibold text-red-500 hover:text-red-700 underline cursor-pointer"
                            >Delete</button>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-stone-200 rounded-xl p-5 text-center">
                          <Leaf className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                          <p className="text-sm text-foreground/50">Nothing recorded for {selectedYear}</p>
                          {selectedYear === CURRENT_YEAR && (
                            <div className="flex justify-center gap-3 mt-3">
                              <button
                                onClick={() => { setSelectedFieldForHistory(null); setAssignForField(f); assignForm.reset(); setSeasonManuallySet(false); setTgwManuallySet(false); }}
                                className="text-xs font-semibold text-green-700 hover:underline cursor-pointer"
                              >
                                + Assign a crop
                              </button>
                              <span className="text-foreground/30">·</span>
                              <button
                                onClick={() => { setLandUseForField(f); landUseForm.reset({ landUse: "fallow", year: String(CURRENT_YEAR), season: "", schemeActionCode: "", schemeReference: "", areaHectares: f.areaHectares ? String(f.areaHectares) : "", startDate: "", endDate: "", managementNotes: "" }); }}
                                className="text-xs font-semibold text-stone-600 hover:underline cursor-pointer"
                              >
                                + Record land use
                              </button>
                            </div>
                          )}
                          {selectedYear !== CURRENT_YEAR && (
                            <button
                              onClick={() => { setSelectedFieldForHistory(null); setAssignForField(f); assignForm.reset(); setSeasonManuallySet(false); setTgwManuallySet(false); }}
                              className="mt-3 text-xs font-semibold text-green-700 hover:underline cursor-pointer"
                            >
                              + Assign a crop
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* quick link to history */}
                    {(fieldAssignments.length + fieldLandUseHistory.length) > 1 && (
                      <button
                        onClick={() => setDrawerTab("history")}
                        className="w-full flex items-center justify-between text-sm text-foreground/60 hover:text-foreground border border-border/50 rounded-xl px-4 py-3 hover:bg-black/[0.02] transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <History className="w-4 h-4" />
                          View full season history
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}

                {drawerTab === "nmp" && (
                  <div>
                    <p className="text-sm text-foreground/50 mb-5">
                      Nutrient Management Plan entries for this field — showing N, P and K budgets from all recorded annual plans.
                    </p>
                    {fieldNmpQ.isLoading ? (
                      <div className="space-y-3">
                        {[1, 2].map(i => <div key={i} className="h-24 rounded-xl bg-black/5 animate-pulse" />)}
                      </div>
                    ) : !fieldNmpQ.data || fieldNmpQ.data.length === 0 ? (
                      <div className="py-12 text-center border-2 border-dashed border-green-200 rounded-xl">
                        <FlaskConical className="w-10 h-10 mx-auto text-green-300 mb-3" />
                        <p className="text-foreground/40 text-sm font-medium">No NMP entries for this field yet</p>
                        <p className="text-foreground/30 text-xs mt-1">Go to the NMP page to create an annual plan and add field entries.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {fieldNmpQ.data.map((entry: any) => (
                          <div key={entry.id} className="bg-white border border-border/50 rounded-xl overflow-hidden">
                            {/* Plan year header */}
                            <div className="bg-green-50 border-b border-green-100 px-4 py-2.5 flex items-center justify-between">
                              <span className="font-bold text-green-800 text-sm">{entry.planYear} Plan</span>
                              <div className="flex items-center gap-2">
                                {entry.cropType && (
                                  <span className="inline-flex items-center gap-1 bg-green-700 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                                    <Wheat className="w-3 h-3" />{entry.cropType}
                                  </span>
                                )}
                                {entry.approvedDate
                                  ? <span className="text-xs text-green-700 font-medium">✓ Approved</span>
                                  : <span className="text-xs text-amber-600 font-medium">Pending</span>}
                              </div>
                            </div>
                            {/* Nutrient values */}
                            <div className="px-4 py-3 grid grid-cols-3 gap-3">
                              <div className="text-center">
                                <p className="text-xs text-foreground/40 font-semibold uppercase mb-1">Nitrogen N</p>
                                <p className="font-bold text-blue-700 text-base">{entry.nitrogenKgHa ? `${entry.nitrogenKgHa}` : "—"}</p>
                                <p className="text-xs text-foreground/40">kg/ha</p>
                              </div>
                              <div className="text-center border-x border-border/30">
                                <p className="text-xs text-foreground/40 font-semibold uppercase mb-1">Phosphorus P</p>
                                <p className="font-bold text-purple-700 text-base">{entry.phosphorusKgHa ? `${entry.phosphorusKgHa}` : "—"}</p>
                                <p className="text-xs text-foreground/40">kg/ha</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-foreground/40 font-semibold uppercase mb-1">Potassium K</p>
                                <p className="font-bold text-amber-700 text-base">{entry.potassiumKgHa ? `${entry.potassiumKgHa}` : "—"}</p>
                                <p className="text-xs text-foreground/40">kg/ha</p>
                              </div>
                            </div>
                            {/* Manure / method details */}
                            {(entry.organicManureType || entry.applicationMethod) && (
                              <div className="px-4 pb-3 flex flex-wrap gap-3 text-xs text-foreground/60">
                                {entry.organicManureType && entry.organicManureType !== "None" && (
                                  <span className="flex items-center gap-1">
                                    <Leaf className="w-3 h-3 text-green-600" />
                                    {entry.organicManureType}
                                    {entry.organicManureRate ? ` · ${entry.organicManureRate} t/ha` : ""}
                                  </span>
                                )}
                                {entry.applicationMethod && (
                                  <span className="flex items-center gap-1">
                                    <Sprout className="w-3 h-3 text-green-600" />
                                    {entry.applicationMethod}
                                  </span>
                                )}
                              </div>
                            )}
                            {entry.timingNotes && (
                              <div className="px-4 pb-3">
                                <p className="text-xs text-foreground/50 italic">"{entry.timingNotes}"</p>
                              </div>
                            )}
                            {entry.preparedBy && (
                              <div className="px-4 pb-3 text-xs text-foreground/40 border-t border-border/30 pt-2">
                                Prepared by: {entry.preparedBy}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {drawerTab === "tenure" && (() => {
                  const tenureLabels: Record<string, string> = {
                    owned: "Owned outright",
                    fbt: "Farm Business Tenancy (FBT)",
                    aha: "Agricultural Holdings Act tenancy",
                    contract_farming: "Contract farming agreement",
                    grazing_licence: "Grazing licence",
                    other: "Other arrangement",
                  };
                  const isRented = f.tenureType && f.tenureType !== "owned";
                  const endDate = f.tenancyEndDate ? new Date(f.tenancyEndDate) : null;
                  const today = new Date();
                  const daysToExpiry = endDate ? Math.ceil((endDate.getTime() - today.getTime()) / 86400000) : null;
                  const expiryUrgent = daysToExpiry !== null && daysToExpiry <= 90;
                  const expiryWarning = daysToExpiry !== null && daysToExpiry > 90 && daysToExpiry <= 180;
                  const reviewDate = f.rentReviewDate ? new Date(f.rentReviewDate) : null;
                  const daysToReview = reviewDate ? Math.ceil((reviewDate.getTime() - today.getTime()) / 86400000) : null;
                  const reviewSoon = daysToReview !== null && daysToReview <= 90;

                  if (tenureEditMode) {
                    const tf = tenureForm;
                    const setTf = (k: string, v: string) => setTenureForm(prev => ({ ...prev, [k]: v }));
                    const handleSaveTenure = async () => {
                      setIsSavingTenure(true);
                      try {
                        const body: Record<string, string | number | null> = {
                          tenureType: tf.tenureType || null,
                          landlordSupplierId: tf.landlordSupplierId && tf.landlordSupplierId !== "__none__" ? parseInt(tf.landlordSupplierId, 10) : null,
                          tenancyStartDate: tf.tenancyStartDate || null,
                          tenancyEndDate: tf.tenancyEndDate || null,
                          annualRentPounds: tf.annualRentPounds || null,
                          rentReviewDate: tf.rentReviewDate || null,
                          tenureNotes: tf.tenureNotes || null,
                        };
                        const res = await fetch(`/api/farms/${farmId}/fields/${f.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(body),
                        }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
                        const data = await res.json();
                        queryClient.invalidateQueries({ queryKey: ["farms", farmId, "fields"] });
                        setSelectedFieldForHistory(prev => prev ? { ...prev, ...data.record } : null);
                        setTenureEditMode(false);
                      } finally {
                        setIsSavingTenure(false);
                      }
                    };
                    return (
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5 block">Tenure Type</label>
                          <select value={tf.tenureType} onChange={e => setTf("tenureType", e.target.value)} className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white">
                            <option value="owned">Owned outright</option>
                            <option value="fbt">Farm Business Tenancy (FBT)</option>
                            <option value="aha">Agricultural Holdings Act tenancy</option>
                            <option value="contract_farming">Contract farming agreement</option>
                            <option value="grazing_licence">Grazing licence</option>
                            <option value="other">Other arrangement</option>
                          </select>
                        </div>
                        {tf.tenureType !== "owned" && (
                          <>
                            <div>
                              <label className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5 block">Landlord / Licensor</label>
                              <div className="flex gap-2">
                                <select value={tf.landlordSupplierId} onChange={e => setTf("landlordSupplierId", e.target.value)} className="flex-1 border border-input rounded-md px-3 py-2 text-sm bg-white">
                                  <option value="__none__">— None selected —</option>
                                  {landlordSuppliers.map(s => (
                                    <option key={s.id} value={String(s.id)}>{s.name}</option>
                                  ))}
                                </select>
                                <Button type="button" variant="outline" size="sm" className="flex-shrink-0 gap-1.5 whitespace-nowrap" onClick={() => { setLandlordQuickForm({ name: "", contactName: "", phone: "", address: "" }); setShowAddLandlordDialog(true); }}>
                                  <PlusCircle className="w-3.5 h-3.5" />
                                  New landlord
                                </Button>
                              </div>
                              {tf.landlordSupplierId && tf.landlordSupplierId !== "__none__" && (() => {
                                const s = landlordSuppliers.find(x => String(x.id) === tf.landlordSupplierId);
                                if (!s) return null;
                                return (
                                  <div className="mt-2 text-xs text-foreground/50 bg-black/[0.02] rounded-lg px-3 py-2 space-y-0.5">
                                    {s.contactName && <p><span className="font-medium">Contact:</span> {s.contactName}</p>}
                                    {s.phone && <p><span className="font-medium">Phone:</span> {s.phone}</p>}
                                    {s.email && <p><span className="font-medium">Email:</span> {s.email}</p>}
                                    {s.address && <p><span className="font-medium">Address:</span> {s.address}</p>}
                                  </div>
                                );
                              })()}</div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5 block">Tenancy Start</label>
                                <Input type="date" value={tf.tenancyStartDate} onChange={e => setTf("tenancyStartDate", e.target.value)} />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5 block">Tenancy End</label>
                                <Input type="date" value={tf.tenancyEndDate} onChange={e => setTf("tenancyEndDate", e.target.value)} />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5 block">Annual Rent (£)</label>
                                <Input type="number" step="0.01" min="0" value={tf.annualRentPounds} onChange={e => setTf("annualRentPounds", e.target.value)} placeholder="e.g. 3200.00" />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5 block">Rent Review Date</label>
                                <Input type="date" value={tf.rentReviewDate} onChange={e => setTf("rentReviewDate", e.target.value)} />
                              </div>
                            </div>
                          </>
                        )}
                        <div>
                          <label className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5 block">Notes</label>
                          <textarea value={tf.tenureNotes} onChange={e => setTf("tenureNotes", e.target.value)} rows={3} className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white resize-none" placeholder="Any additional tenancy notes, break clauses, special conditions..." />
                        </div>
                        <div className="flex gap-2 pt-1">
                          <Button onClick={handleSaveTenure} disabled={isSavingTenure} size="sm" className="gap-2">
                            {isSavingTenure ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            {isSavingTenure ? "Saving..." : "Save Land Tenure"}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setTenureEditMode(false)}>Cancel</Button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-5">
                      {(expiryUrgent || expiryWarning) && (
                        <div className={`flex items-start gap-3 rounded-xl p-3 text-sm ${expiryUrgent ? "bg-red-50 border border-red-200 text-red-800" : "bg-amber-50 border border-amber-200 text-amber-800"}`}>
                          <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${expiryUrgent ? "text-red-500" : "text-amber-500"}`} />
                          <div>
                            <p className="font-semibold">{expiryUrgent ? "Tenancy expiring soon" : "Tenancy approaching expiry"}</p>
                            <p className="text-xs mt-0.5">
                              {daysToExpiry === 0 ? "Expires today" : daysToExpiry! < 0 ? `Expired ${Math.abs(daysToExpiry!)} day${Math.abs(daysToExpiry!) !== 1 ? "s" : ""} ago` : `Expires in ${daysToExpiry} day${daysToExpiry !== 1 ? "s" : ""}`} — check your SFI/CS eligibility for this field.
                            </p>
                          </div>
                        </div>
                      )}
                      {reviewSoon && (
                        <div className="flex items-start gap-3 rounded-xl p-3 text-sm bg-blue-50 border border-blue-200 text-blue-800">
                          <RefreshCw className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-500" />
                          <div>
                            <p className="font-semibold">Rent review due soon</p>
                            <p className="text-xs mt-0.5">Review date in {daysToReview} day{daysToReview !== 1 ? "s" : ""}. Contact your landlord or agent to initiate review.</p>
                          </div>
                        </div>
                      )}
                      <div className="bg-black/[0.03] rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Landmark className="w-4 h-4 text-foreground/40" />
                          <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">Tenure Type</p>
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          {f.tenureType ? (tenureLabels[f.tenureType] ?? f.tenureType) : <span className="text-foreground/40 font-normal">Not recorded</span>}
                        </p>
                      </div>
                      {isRented && (
                        <>
                          {(() => {
                            const landlord = f.landlordSupplierId ? landlordSuppliers.find(s => s.id === f.landlordSupplierId) : null;
                            if (!landlord && !f.landlordSupplierId) return null;
                            return (
                              <div className="grid grid-cols-1 gap-3">
                                <div className="flex items-start gap-3 p-3 bg-black/[0.02] rounded-xl">
                                  <Landmark className="w-4 h-4 text-foreground/30 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-xs text-foreground/40 mb-0.5">Landlord / Licensor</p>
                                    <p className="text-sm font-medium">{landlord?.name ?? <span className="text-foreground/40 italic">Unknown landlord</span>}</p>
                                  </div>
                                </div>
                                {landlord?.contactName && (
                                  <div className="flex items-start gap-3 p-3 bg-black/[0.02] rounded-xl">
                                    <Phone className="w-4 h-4 text-foreground/30 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-xs text-foreground/40 mb-0.5">Contact</p>
                                      <p className="text-sm font-medium">{landlord.contactName}{landlord.phone ? ` · ${landlord.phone}` : ""}</p>
                                    </div>
                                  </div>
                                )}
                                {landlord?.address && (
                                  <div className="flex items-start gap-3 p-3 bg-black/[0.02] rounded-xl">
                                    <MapPin className="w-4 h-4 text-foreground/30 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-xs text-foreground/40 mb-0.5">Address</p>
                                      <p className="text-sm font-medium">{landlord.address}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-black/[0.03] rounded-xl p-3">
                              <p className="text-xs text-foreground/40 mb-1">Tenancy Start</p>
                              <p className="text-sm font-semibold">{f.tenancyStartDate ? new Date(f.tenancyStartDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</p>
                            </div>
                            <div className={`rounded-xl p-3 ${expiryUrgent ? "bg-red-50" : expiryWarning ? "bg-amber-50" : "bg-black/[0.03]"}`}>
                              <p className="text-xs text-foreground/40 mb-1">Tenancy End</p>
                              <p className={`text-sm font-semibold ${expiryUrgent ? "text-red-700" : expiryWarning ? "text-amber-700" : ""}`}>
                                {f.tenancyEndDate ? new Date(f.tenancyEndDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                              </p>
                              {daysToExpiry !== null && (
                                <p className={`text-xs mt-0.5 ${expiryUrgent ? "text-red-500" : expiryWarning ? "text-amber-500" : "text-foreground/40"}`}>
                                  {daysToExpiry < 0 ? `Expired ${Math.abs(daysToExpiry)}d ago` : daysToExpiry === 0 ? "Today" : `${daysToExpiry}d remaining`}
                                </p>
                              )}
                            </div>
                            <div className="bg-black/[0.03] rounded-xl p-3">
                              <p className="text-xs text-foreground/40 mb-1 flex items-center gap-1"><BadgePoundSterling className="w-3 h-3" />Annual Rent</p>
                              <p className="text-sm font-semibold">{f.annualRentPounds ? `£${parseFloat(String(f.annualRentPounds)).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}</p>
                            </div>
                            <div className={`rounded-xl p-3 ${reviewSoon ? "bg-blue-50" : "bg-black/[0.03]"}`}>
                              <p className="text-xs text-foreground/40 mb-1 flex items-center gap-1"><RefreshCw className="w-3 h-3" />Rent Review</p>
                              <p className={`text-sm font-semibold ${reviewSoon ? "text-blue-700" : ""}`}>
                                {f.rentReviewDate ? new Date(f.rentReviewDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                      {f.tenureNotes && (
                        <div className="flex items-start gap-3 p-3 bg-black/[0.02] rounded-xl">
                          <FileText className="w-4 h-4 text-foreground/30 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs text-foreground/40 mb-0.5">Notes</p>
                            <p className="text-sm text-foreground/70 whitespace-pre-line">{f.tenureNotes}</p>
                          </div>
                        </div>
                      )}
                      {!f.tenureType && !f.landlordSupplierId && (
                        <div className="py-8 text-center">
                          <Landmark className="w-10 h-10 mx-auto text-foreground/15 mb-3" />
                          <p className="text-sm text-foreground/40">No land tenure information recorded yet.</p>
                          <p className="text-xs text-foreground/30 mt-1">Record tenure type, landlord details, and tenancy dates to track SFI eligibility.</p>
                        </div>
                      )}

                      {/* ── Tenure Documents ── */}
                      <div>
                        <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-3">Documents</p>
                        {tenureDocsQ.isLoading ? (
                          <div className="flex items-center gap-2 text-sm text-foreground/40 py-2"><Loader2 className="w-4 h-4 animate-spin" />Loading…</div>
                        ) : tenureDocsQ.data && tenureDocsQ.data.length > 0 ? (
                          <div className="space-y-2 mb-3">
                            {(tenureDocsQ.data as any[]).map((doc: any) => (
                              <div key={doc.id} className="flex items-center gap-2 p-2.5 bg-black/[0.02] border border-border/40 rounded-xl">
                                <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{doc.title}</p>
                                  {doc.documentName && <p className="text-xs text-foreground/40 truncate">{doc.documentName}</p>}
                                </div>
                                <a href={`/api/storage${doc.documentUrl}`} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="Download">
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                                <button onClick={async () => {
                                  await fetch(`/api/farms/${farmId}/fields/${f.id}/tenure-documents/${doc.id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
                                  queryClient.invalidateQueries({ queryKey: ["field-tenure-docs", safeFarmId, f.id] });
                                }} className="flex-shrink-0 p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors" title="Remove">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-foreground/35 mb-3 italic">No documents attached yet.</p>
                        )}
                        <label className={`flex items-center gap-2 cursor-pointer px-3 py-2 border border-dashed border-border rounded-xl hover:border-green-400 hover:bg-green-50 transition-colors ${isUploadingTenureDoc ? "opacity-50 pointer-events-none" : ""}`}>
                          <Paperclip className="w-4 h-4 text-foreground/40 flex-shrink-0" />
                          <span className="text-sm text-foreground/50">{isUploadingTenureDoc ? "Uploading…" : "Attach tenancy agreement or document"}</span>
                          <input type="file" className="hidden" accept="application/pdf,image/*,.doc,.docx" disabled={isUploadingTenureDoc} onChange={async e => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const result = await uploadFile(file);
                            if (!result) return;
                            await fetch(`/api/farms/${farmId}/fields/${f.id}/tenure-documents`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ title: file.name.replace(/\.[^.]+$/, ""), documentUrl: result.objectPath, documentName: file.name }),
                            }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
                            queryClient.invalidateQueries({ queryKey: ["field-tenure-docs", safeFarmId, f.id] });
                            e.target.value = "";
                          }} />
                        </label>
                      </div>

                      <div className="pt-1">
                        <Button variant="outline" size="sm" className="gap-2" onClick={() => {
                          setTenureForm({
                            tenureType: f.tenureType ?? "owned",
                            landlordSupplierId: f.landlordSupplierId ? String(f.landlordSupplierId) : "__none__",
                            tenancyStartDate: f.tenancyStartDate ?? "",
                            tenancyEndDate: f.tenancyEndDate ?? "",
                            annualRentPounds: f.annualRentPounds ? String(f.annualRentPounds) : "",
                            rentReviewDate: f.rentReviewDate ?? "",
                            tenureNotes: f.tenureNotes ?? "",
                          });
                          setTenureEditMode(true);
                        }}>
                          <Pencil className="w-3.5 h-3.5" />
                          Edit Land Tenure
                        </Button>
                      </div>
                    </div>
                  );
                })()}

                {drawerTab === "history" && (() => {
                  type HistoryEntry =
                    | { kind: "crop"; year: number; data: FieldCropAssignment }
                    | { kind: "landuse"; year: number; data: LandUseRecord };
                  const historyEntries: HistoryEntry[] = [
                    ...fieldAssignments.map(a => ({ kind: "crop" as const, year: a.year ?? 0, data: a })),
                    ...fieldLandUseHistory.map(r => ({ kind: "landuse" as const, year: r.year, data: r })),
                  ].sort((a, b) => b.year - a.year);
                  return (
                  <div>
                    <p className="text-sm text-foreground/50 mb-4">
                      All recorded crop and non-crop land use entries for this field across all seasons.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-5">
                      <Link href={`/field-operations?fieldName=${encodeURIComponent(f?.name ?? "")}`}>
                        <span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-border/60 bg-muted/30 hover:bg-primary/10 hover:border-primary/40 text-foreground/65 hover:text-primary cursor-pointer transition-colors">
                          Field operations →
                        </span>
                      </Link>
                      <Link href={`/spray?fieldName=${encodeURIComponent(f?.name ?? "")}`}>
                        <span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-border/60 bg-muted/30 hover:bg-primary/10 hover:border-primary/40 text-foreground/65 hover:text-primary cursor-pointer transition-colors">
                          Spray records →
                        </span>
                      </Link>
                    </div>
                    {(f as any).blackgrassRiskField && (() => {
                      if (fiveInFiveQ.isLoading) {
                        return (
                          <div className="mb-5 flex items-center gap-2 text-xs text-foreground/40 border border-border/50 rounded-xl p-4">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />Loading black-grass Five-in-Five score…
                          </div>
                        );
                      }
                      if (!fiveInFiveScore) return null;
                      const { seasons, distinctPillarsUsed, distinctPillarCount, moaRepetitionRisk, moaRepeatedGroup } = fiveInFiveScore;
                      const yearsConsidered = seasons.map(s => s.year);
                      const strong = distinctPillarCount >= 4;
                      const moderate = distinctPillarCount >= 2 && distinctPillarCount < 4;
                      const pillarKeys = Object.keys(PILLAR_LABELS) as PillarKey[];
                      return (
                        <div className={`mb-5 rounded-xl border overflow-hidden ${strong ? "border-green-200 bg-green-50/50" : moderate ? "border-amber-200 bg-amber-50/50" : "border-red-200 bg-red-50/50"}`}>
                          <div className={`px-4 py-3 flex items-center justify-between flex-wrap gap-2 ${strong ? "bg-green-600" : moderate ? "bg-amber-500" : "bg-red-500"} text-white`}>
                            <div className="flex items-center gap-2">
                              <Sprout className="w-4 h-4" />
                              <span className="text-sm font-semibold">Black-grass Five-in-Five</span>
                              {yearsConsidered.length > 0 && (
                                <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full">
                                  {Math.min(...yearsConsidered)}–{Math.max(...yearsConsidered)}
                                </span>
                              )}
                            </div>
                            <span className="text-sm font-bold">{distinctPillarCount}/5 pillars</span>
                          </div>
                          <div className="p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                              {pillarKeys.map(key => {
                                const met = distinctPillarsUsed.includes(key);
                                const { label, detail } = PILLAR_LABELS[key];
                                return (
                                  <div key={key} className="flex items-start gap-2 text-xs">
                                    {met
                                      ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                                      : <XCircle className="w-3.5 h-3.5 text-foreground/25 flex-shrink-0 mt-0.5" />}
                                    <div>
                                      <p className={`font-semibold ${met ? "text-green-800" : "text-foreground/60"}`}>{label}</p>
                                      <p className="text-foreground/45 text-[11px]">{detail}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            {moaRepetitionRisk && (
                              <div className="flex items-start gap-2 text-xs border-t border-border/30 pt-2.5 mt-1">
                                <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-semibold text-red-700">Herbicide MOA repetition risk</p>
                                  <p className="text-foreground/50 text-[11px]">
                                    The same herbicide MOA group ({moaRepeatedGroup}) has been used for 3+ consecutive seasons on this field, increasing resistance risk.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                    {(f as any).blackgrassRiskField && fiveInFiveScore && fiveInFiveScore.recommendations.length > 0 && (
                      <div className="mb-5 rounded-xl border border-border/50 overflow-hidden">
                        <div className="px-4 py-3 bg-stone-700 text-white flex items-center gap-2">
                          <Sprout className="w-4 h-4" />
                          <span className="text-sm font-semibold">Recommended actions for this season</span>
                        </div>
                        <div className="p-4 space-y-2.5">
                          {fiveInFiveScore.recommendations.map((rec) => (
                            <div key={rec.key} className={`flex items-start gap-2 text-xs rounded-lg border px-3 py-2.5 ${RECOMMENDATION_SEVERITY_STYLES[rec.severity]}`}>
                              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-semibold">{rec.title}</p>
                                <p className="text-[11px] opacity-80 mt-0.5">{rec.detail}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {historyEntries.length === 0 ? (
                      <div className="py-12 text-center">
                        <History className="w-10 h-10 mx-auto text-foreground/20 mb-3" />
                        <p className="text-foreground/40 text-sm">No season history recorded yet.</p>
                        <button
                          onClick={() => { setLandUseForField(f); landUseForm.reset({ landUse: "fallow", year: String(CURRENT_YEAR), season: "", schemeActionCode: "", schemeReference: "", areaHectares: f.areaHectares ? String(f.areaHectares) : "", startDate: "", endDate: "", managementNotes: "" }); }}
                          className="mt-3 text-xs font-semibold text-stone-600 hover:underline cursor-pointer"
                        >+ Record land use</button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {historyEntries.map((entry, i) => {
                          const isCurrent = entry.year === CURRENT_YEAR;
                          if (entry.kind === "crop") {
                            const a = entry.data;
                            return (
                              <div key={`crop-${a.id}`} className="flex items-start gap-3">
                                <div className="flex flex-col items-center flex-shrink-0 pt-1.5">
                                  <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${isCurrent ? "bg-green-600 border-green-600" : "bg-white border-border"}`} />
                                  {i < historyEntries.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1" style={{ minHeight: "24px" }} />}
                                </div>
                                <div className={`flex-1 rounded-xl border p-4 mb-0 ${isCurrent ? "border-green-200 bg-green-50" : "border-border/50 bg-black/[0.01]"}`}>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${isCurrent ? "bg-green-700 text-white" : "bg-black/5 text-foreground/70"}`}>
                                      <Wheat className="w-3 h-3" />
                                      {a.cropName}
                                    </span>
                                    <span className="text-xs font-bold text-foreground/40">{a.year ?? "—"}{a.season ? ` · ${a.season}` : ""}</span>
                                  </div>
                                  {a.plantingDate && <p className="text-xs text-foreground/60 flex items-center gap-1.5 mt-1"><CalendarDays className="w-3 h-3 flex-shrink-0" />Planted {formatDate(a.plantingDate)}</p>}
                                  {a.expectedHarvestDate && <p className="text-xs text-foreground/60 flex items-center gap-1.5 mt-0.5"><Wheat className="w-3 h-3 flex-shrink-0 text-amber-500" />Expected harvest {formatDate(a.expectedHarvestDate)}</p>}
                                  {a.actualHarvestDate && (() => {
                                    const days = harvestVarianceDays(a.expectedHarvestDate, a.actualHarvestDate);
                                    return <div className="flex items-center gap-2 mt-0.5 flex-wrap"><p className="text-xs text-foreground/60 flex items-center gap-1.5"><Wheat className="w-3 h-3 flex-shrink-0 text-green-700" />Actual harvest {formatDate(a.actualHarvestDate)}</p>{days !== null && <VarianceBadge days={days} size="xs" />}</div>;
                                  })()}
                                  {a.actualHarvestDate && (
                                    (a.year ?? 0) >= CURRENT_YEAR ? (
                                      <div className="mt-1.5"><HarvestNoteEditor assignmentId={a.id} farmId={farmId} initialNote={a.notes} /></div>
                                    ) : a.notes ? (
                                      <p className="text-[11px] text-foreground/50 italic mt-1.5 leading-relaxed">{a.notes}</p>
                                    ) : null
                                  )}
                                  {(() => {
                                    const harvests = fieldHarvests.filter(h => h.fieldCropAssignmentId === a.id);
                                    if (!harvests.length) return null;
                                    const totalYield = harvests.reduce((s, h) => s + (h.yieldTonnes ? parseFloat(h.yieldTonnes) : 0), 0);
                                    const totalArea = harvests.reduce((s, h) => s + (h.areaHarvestedHa ? parseFloat(h.areaHarvestedHa) : 0), 0);
                                    const fieldArea = f.areaHectares ? parseFloat(String(f.areaHectares)) : null;
                                    const effectiveArea = totalArea > 0 ? totalArea : fieldArea;
                                    const yieldTha = effectiveArea && effectiveArea > 0 ? totalYield / effectiveArea : null;
                                    const moistureVals = harvests.filter(h => h.moisturePercent).map(h => parseFloat(h.moisturePercent!));
                                    const avgMoisture = moistureVals.length > 0 ? moistureVals.reduce((s, v) => s + v, 0) / moistureVals.length : null;
                                    const grades = [...new Set(harvests.map(h => h.qualityGrade).filter(Boolean))];
                                    return (
                                      <div className="mt-2.5 pt-2.5 border-t border-border/30 flex flex-wrap items-center gap-x-3 gap-y-1">
                                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700">
                                          <Scale className="w-3 h-3" />
                                          {yieldTha ? `${yieldTha.toFixed(1)} t/ha` : `${totalYield.toFixed(1)} t`}
                                        </span>
                                        {yieldTha && totalYield > 0 && (
                                          <span className="text-xs text-foreground/45">{totalYield.toFixed(1)} t total</span>
                                        )}
                                        {avgMoisture !== null && (
                                          <span className="text-xs text-foreground/45">{avgMoisture.toFixed(1)}% moisture</span>
                                        )}
                                        {grades.length > 0 && (
                                          <span className="text-xs text-foreground/45">Grade {grades.join(", ")}</span>
                                        )}
                                      </div>
                                    );
                                  })()}
                                  {/* ── Rainfall badge ── */}
                                  <div className="mt-1">
                                    <SeasonRainfallBadge
                                      lat={f.latitude ?? farmLat}
                                      lng={f.longitude ?? farmLng}
                                      startDate={a.plantingDate}
                                      endDate={a.actualHarvestDate ?? a.expectedHarvestDate}
                                    />
                                  </div>
                                  {/* ── Compare across farm button + Season Report button ── */}
                                  <div className="mt-2.5 pt-2 border-t border-border/20 flex items-center gap-2 flex-wrap">
                                    <button
                                      onClick={() => setReportAssignmentId(a.id)}
                                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md border text-green-700 border-green-200 bg-green-50 hover:bg-green-100 transition-colors"
                                    >
                                      <FileText className="w-3 h-3" />
                                      Season Report
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (comparisonAssignmentId === a.id) {
                                          setComparisonAssignmentId(null);
                                          setComparisonVarietyId(null);
                                        } else {
                                          setComparisonAssignmentId(a.id);
                                          setComparisonVarietyId(a.varietyId);
                                        }
                                      }}
                                      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md border transition-colors ${
                                        comparisonAssignmentId === a.id
                                          ? "bg-violet-600 text-white border-violet-600"
                                          : "text-violet-700 border-violet-200 bg-violet-50 hover:bg-violet-100"
                                      }`}
                                    >
                                      <BarChart2 className="w-3 h-3" />
                                      {comparisonAssignmentId === a.id ? "Hide comparison" : "Compare across farm"}
                                      {comparisonAssignmentId === a.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                    </button>
                                  </div>
                                  {/* ── Comparison panel ── */}
                                  {comparisonAssignmentId === a.id && (() => {
                                    const cq = comparisonQ;
                                    if (cq.isLoading) return (
                                      <div className="mt-3 flex items-center gap-2 text-xs text-foreground/40">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />Fetching farm-wide comparison…
                                      </div>
                                    );
                                    if (cq.isError || !cq.data) return (
                                      <div className="mt-3 text-xs text-red-500">Could not load comparison data.</div>
                                    );
                                    const { comparisons, farmAvgYieldTha, maxYieldTha, minYieldTha } = cq.data;
                                    if (!comparisons.length) return null;
                                    const withHarvest = comparisons.filter(c => c.hasHarvest && c.yieldTha !== null);
                                    const totalEntries = comparisons.length;
                                    const thisEntry = comparisons.find(c => c.id === a.id);
                                    const thisYieldTha = thisEntry?.yieldTha ?? null;
                                    // rank among entries with yield (lower index = better)
                                    const sorted = [...withHarvest].sort((x, y) => (y.yieldTha ?? 0) - (x.yieldTha ?? 0));
                                    const rank = thisYieldTha !== null ? sorted.findIndex(c => c.id === a.id) + 1 : null;
                                    const isTopPerformer = rank === 1 && sorted.length > 1;
                                    return (
                                      <div className="mt-3 rounded-xl border border-violet-200 bg-violet-50/40 overflow-hidden">
                                        {/* Header stats */}
                                        <div className="px-4 py-3 bg-violet-600 text-white">
                                          <div className="flex items-center gap-2 mb-2">
                                            <BarChart2 className="w-4 h-4" />
                                            <span className="text-sm font-semibold">Farm Performance Comparison</span>
                                            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{a.cropName}{a.variety ? ` · ${a.variety}` : ""}</span>
                                          </div>
                                          <div className="flex items-center gap-4 flex-wrap">
                                            {farmAvgYieldTha !== null && (
                                              <div className="text-center">
                                                <p className="text-[10px] text-violet-200 uppercase tracking-wider">Farm avg</p>
                                                <p className="text-lg font-bold">{farmAvgYieldTha.toFixed(1)} <span className="text-xs font-normal text-violet-200">t/ha</span></p>
                                              </div>
                                            )}
                                            {maxYieldTha !== null && (
                                              <div className="text-center">
                                                <p className="text-[10px] text-violet-200 uppercase tracking-wider">Best</p>
                                                <p className="text-lg font-bold text-green-300">{maxYieldTha.toFixed(1)} <span className="text-xs font-normal text-violet-200">t/ha</span></p>
                                              </div>
                                            )}
                                            {minYieldTha !== null && (
                                              <div className="text-center">
                                                <p className="text-[10px] text-violet-200 uppercase tracking-wider">Worst</p>
                                                <p className="text-lg font-bold text-red-300">{minYieldTha.toFixed(1)} <span className="text-xs font-normal text-violet-200">t/ha</span></p>
                                              </div>
                                            )}
                                            {rank !== null && (
                                              <div className="text-center ml-auto">
                                                <p className="text-[10px] text-violet-200 uppercase tracking-wider">This field rank</p>
                                                <p className="text-lg font-bold flex items-center gap-1">
                                                  {isTopPerformer && <Trophy className="w-4 h-4 text-yellow-300" />}
                                                  {rank === 2 && <Medal className="w-4 h-4 text-slate-300" />}
                                                  {rank}/{sorted.length}
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        {/* Comparison table */}
                                        <div className="overflow-x-auto">
                                          <table className="w-full text-xs">
                                            <thead>
                                              <tr className="border-b border-violet-200 bg-violet-50">
                                                <th className="text-left px-3 py-2 font-semibold text-foreground/50">Field</th>
                                                <th className="text-center px-3 py-2 font-semibold text-foreground/50">Year</th>
                                                <th className="text-right px-3 py-2 font-semibold text-foreground/50">Area</th>
                                                <th className="text-right px-3 py-2 font-semibold text-foreground/50">Yield t/ha</th>
                                                <th className="text-right px-3 py-2 font-semibold text-foreground/50">vs avg</th>
                                                <th className="text-center px-3 py-2 font-semibold text-foreground/50">Moisture</th>
                                                <th className="text-center px-3 py-2 font-semibold text-foreground/50">Grade</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {comparisons.map(c => {
                                                const isThis = c.id === a.id;
                                                const diff = (c.yieldTha !== null && farmAvgYieldTha !== null) ? c.yieldTha - farmAvgYieldTha : null;
                                                const isAbove = diff !== null && withHarvest.length > 1 && diff > 0.1;
                                                const isBelow = diff !== null && withHarvest.length > 1 && diff < -0.1;
                                                const rowCls = isThis
                                                  ? "bg-violet-100 border-b border-violet-200"
                                                  : "border-b border-violet-100 hover:bg-violet-50/60 transition-colors";
                                                const fieldAreaHa = c.fieldAreaHectares ? parseFloat(String(c.fieldAreaHectares)) : null;
                                                const displayArea = c.totalAreaHarvestedHa ? parseFloat(c.totalAreaHarvestedHa) : fieldAreaHa;
                                                return (
                                                  <tr key={c.id} className={rowCls}>
                                                    <td className="px-3 py-2">
                                                      <div className="flex items-center gap-1.5">
                                                        {isThis && <div className="w-1.5 h-1.5 rounded-full bg-violet-600 flex-shrink-0" />}
                                                        <span className={isThis ? "font-bold text-violet-900" : "text-foreground/70"}>
                                                          {c.fieldName}
                                                        </span>
                                                        {c.fieldReference && <span className="text-foreground/35 font-mono">{c.fieldReference}</span>}
                                                        {isThis && <span className="text-[10px] bg-violet-600 text-white px-1.5 py-0.5 rounded font-semibold ml-1">this</span>}
                                                      </div>
                                                    </td>
                                                    <td className="px-3 py-2 text-center text-foreground/60">{c.year ?? "—"}{c.season ? ` · ${c.season}` : ""}</td>
                                                    <td className="px-3 py-2 text-right text-foreground/60">{displayArea ? `${displayArea.toFixed(1)} ha` : "—"}</td>
                                                    <td className="px-3 py-2 text-right">
                                                      {c.yieldTha !== null
                                                        ? <span className={`font-bold ${isThis ? "text-violet-900" : "text-foreground"}`}>{c.yieldTha.toFixed(1)}</span>
                                                        : <span className="text-foreground/30">—</span>
                                                      }
                                                    </td>
                                                    <td className="px-3 py-2 text-right">
                                                      {isAbove && <span className="inline-flex items-center gap-0.5 text-green-600 font-semibold"><TrendingUp className="w-3 h-3" />+{diff!.toFixed(1)}</span>}
                                                      {isBelow && <span className="inline-flex items-center gap-0.5 text-red-500 font-semibold"><TrendingDown className="w-3 h-3" />{diff!.toFixed(1)}</span>}
                                                      {!isAbove && !isBelow && c.yieldTha !== null && withHarvest.length > 1 && <span className="text-foreground/30"><Minus className="w-3 h-3 inline" /></span>}
                                                      {c.yieldTha === null && !c.hasHarvest && <span className="text-foreground/25 text-[10px]">No harvest</span>}
                                                    </td>
                                                    <td className="px-3 py-2 text-center text-foreground/60">{c.avgMoisturePercent ? `${c.avgMoisturePercent}%` : "—"}</td>
                                                    <td className="px-3 py-2 text-center text-foreground/60">{c.qualityGrades || "—"}</td>
                                                  </tr>
                                                );
                                              })}
                                            </tbody>
                                            {farmAvgYieldTha !== null && withHarvest.length > 1 && (
                                              <tfoot>
                                                <tr className="border-t-2 border-violet-300 bg-violet-100/60">
                                                  <td colSpan={3} className="px-3 py-2 font-semibold text-foreground/60">Farm average</td>
                                                  <td className="px-3 py-2 text-right font-bold text-violet-900">{farmAvgYieldTha.toFixed(1)}</td>
                                                  <td colSpan={3} className="px-3 py-2 text-center text-[10px] text-foreground/40">across {withHarvest.length} harvest records</td>
                                                </tr>
                                              </tfoot>
                                            )}
                                          </table>
                                        </div>
                                        {totalEntries > withHarvest.length && (
                                          <p className="px-4 py-2 text-[10px] text-foreground/40 border-t border-violet-200">
                                            {totalEntries - withHarvest.length} assignment{totalEntries - withHarvest.length !== 1 ? "s" : ""} with no harvest data not shown in yield average.
                                          </p>
                                        )}
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                            );
                          } else {
                            const r = entry.data;
                            const luBadgeCls = LAND_USE_BADGE[r.landUse] ?? "bg-slate-100 text-slate-700 border-slate-300";
                            return (
                              <div key={`lu-${r.id}`} className="flex items-start gap-3">
                                <div className="flex flex-col items-center flex-shrink-0 pt-1.5">
                                  <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${isCurrent ? "bg-stone-500 border-stone-500" : "bg-white border-border"}`} />
                                  {i < historyEntries.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1" style={{ minHeight: "24px" }} />}
                                </div>
                                <div className={`flex-1 rounded-xl border p-4 mb-0 ${isCurrent ? "border-stone-200 bg-stone-50" : "border-border/50 bg-black/[0.01]"}`}>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${luBadgeCls}`}>
                                      <TreePine className="w-3 h-3" />
                                      {LAND_USE_LABEL[r.landUse] ?? r.landUse}
                                    </span>
                                    <span className="text-xs font-bold text-foreground/40">{r.year}{r.season ? ` · ${r.season}` : ""}</span>
                                  </div>
                                  {r.schemeActionCode && <p className="text-xs text-foreground/60 flex items-center gap-1.5 mt-1"><FileText className="w-3 h-3 flex-shrink-0 text-teal-600" />Action: <span className="font-mono font-semibold">{r.schemeActionCode}</span></p>}
                                  {r.schemeReference && <p className="text-xs text-foreground/60 flex items-center gap-1.5 mt-0.5"><FileText className="w-3 h-3 flex-shrink-0" />Ref: <span className="font-mono">{r.schemeReference}</span></p>}
                                  {(r.startDate || r.endDate) && <p className="text-xs text-foreground/60 flex items-center gap-1.5 mt-0.5"><CalendarDays className="w-3 h-3 flex-shrink-0" />{formatDate(r.startDate) ?? "—"} → {formatDate(r.endDate) ?? "—"}</p>}
                                  {r.managementNotes && <p className="text-xs text-foreground/50 italic mt-1">{r.managementNotes}</p>}
                                  <div className="flex gap-3 mt-2">
                                    <button onClick={() => { setEditingLandUseRecord(r); landUseForm.reset({ landUse: r.landUse, year: String(r.year), season: r.season ?? "", schemeActionCode: r.schemeActionCode ?? "", schemeReference: r.schemeReference ?? "", areaHectares: r.areaHectares ? String(r.areaHectares) : "", startDate: r.startDate ?? "", endDate: r.endDate ?? "", managementNotes: r.managementNotes ?? "" }); }} className="text-xs text-foreground/40 hover:text-foreground underline cursor-pointer">Edit</button>
                                    <button onClick={() => setPendingDeleteLandUse(r.id)} className="text-xs text-red-400 hover:text-red-600 underline cursor-pointer">Delete</button>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        })}
                        {(() => {
                          const yieldRows = fieldAssignments
                            .map(a => {
                              const harvests = fieldHarvests.filter(h => h.fieldCropAssignmentId === a.id);
                              if (!harvests.length) return null;
                              const totalYield = harvests.reduce((s, h) => s + (h.yieldTonnes ? parseFloat(h.yieldTonnes) : 0), 0);
                              const totalArea = harvests.reduce((s, h) => s + (h.areaHarvestedHa ? parseFloat(h.areaHarvestedHa) : 0), 0);
                              const fieldArea = f.areaHectares ? parseFloat(String(f.areaHectares)) : null;
                              const effectiveArea = totalArea > 0 ? totalArea : fieldArea;
                              const yieldTha = effectiveArea && effectiveArea > 0 ? totalYield / effectiveArea : null;
                              return { year: a.year ?? 0, cropName: a.cropName, yieldTha, totalYield };
                            })
                            .filter((r): r is { year: number; cropName: string; yieldTha: number | null; totalYield: number } => r !== null)
                            .sort((a, b) => b.year - a.year);
                          if (!yieldRows.length) return null;
                          const cropAvgs: Record<string, number> = {};
                          const cropCounts: Record<string, number> = {};
                          for (const row of yieldRows) {
                            if (row.yieldTha) {
                              cropAvgs[row.cropName] = (cropAvgs[row.cropName] ?? 0) + row.yieldTha;
                              cropCounts[row.cropName] = (cropCounts[row.cropName] ?? 0) + 1;
                            }
                          }
                          for (const crop of Object.keys(cropAvgs)) {
                            cropAvgs[crop] = cropAvgs[crop] / (cropCounts[crop] ?? 1);
                          }
                          return (
                            <div className="mt-4 pt-4 border-t border-border/50">
                              <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <Scale className="w-3.5 h-3.5" /> Yield History
                              </p>
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="border-b border-border/30">
                                    <th className="text-left pb-1.5 font-semibold text-foreground/40">Year</th>
                                    <th className="text-left pb-1.5 font-semibold text-foreground/40">Crop</th>
                                    <th className="text-right pb-1.5 font-semibold text-foreground/40">t/ha</th>
                                    <th className="text-right pb-1.5 font-semibold text-foreground/40">vs avg</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {yieldRows.map((row, i) => {
                                    const avg = cropAvgs[row.cropName] ?? 0;
                                    const diff = row.yieldTha !== null ? row.yieldTha - avg : null;
                                    const isAbove = diff !== null && cropCounts[row.cropName] > 1 && diff > 0.1;
                                    const isBelow = diff !== null && cropCounts[row.cropName] > 1 && diff < -0.1;
                                    return (
                                      <tr key={i} className="border-b border-border/20 last:border-0">
                                        <td className="py-1.5 font-medium text-foreground/70">{row.year}</td>
                                        <td className="py-1.5 text-foreground/60 truncate max-w-[80px]">{row.cropName}</td>
                                        <td className="py-1.5 text-right font-semibold text-foreground">
                                          {row.yieldTha ? row.yieldTha.toFixed(1) : `${row.totalYield.toFixed(1)} t`}
                                        </td>
                                        <td className="py-1.5 text-right">
                                          {isAbove && <span className="inline-flex items-center gap-0.5 text-green-600 font-semibold"><TrendingUp className="w-3 h-3" />+{diff!.toFixed(1)}</span>}
                                          {isBelow && <span className="inline-flex items-center gap-0.5 text-amber-600 font-semibold"><TrendingDown className="w-3 h-3" />{diff!.toFixed(1)}</span>}
                                          {!isAbove && !isBelow && row.yieldTha && <span className="text-foreground/30"><Minus className="w-3 h-3 inline" /></span>}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                              {Object.keys(cropCounts).some(c => cropCounts[c] > 1) && (
                                <p className="text-[10px] text-foreground/30 mt-2">Trend vs. this field's average per crop type</p>
                              )}
                            </div>
                          );
                        })()}
                        <button
                          onClick={() => { setLandUseForField(f); landUseForm.reset({ landUse: "fallow", year: String(CURRENT_YEAR), season: "", schemeActionCode: "", schemeReference: "", areaHectares: f.areaHectares ? String(f.areaHectares) : "", startDate: "", endDate: "", managementNotes: "" }); }}
                          className="w-full mt-4 flex items-center justify-center gap-2 py-2 border-2 border-dashed border-stone-200 rounded-xl text-xs text-stone-500 font-medium hover:bg-stone-50 transition-colors cursor-pointer"
                        >
                          <TreePine className="w-3.5 h-3.5" />
                          Record another season's land use
                        </button>
                      </div>
                    )}
                  </div>
                  );
                })()}

              </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ── EDIT CROP / VARIETY DIALOG ── */}
      <Dialog open={!!editingCrop} onOpenChange={(o) => { if (!o) setEditingCrop(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Variety</DialogTitle>
            <DialogDescription>Update this variety's details. Crop name and category changes apply to all varieties of this crop.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Crop Name</label>
              <Input
                value={editCropForm.name}
                onChange={e => setEditCropForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Winter Wheat, Oil Seed Rape"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Variety Name</label>
              <Input
                value={editCropForm.variety}
                onChange={e => setEditCropForm(f => ({ ...f, variety: e.target.value }))}
                placeholder="e.g. KWS Zyatt, Extase"
              />
              <p className="text-xs text-foreground/50 mt-1">Leave blank if variety is not known or not applicable.</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Category</label>
              <select
                value={editCropForm.category}
                onChange={e => setEditCropForm(f => ({ ...f, category: e.target.value }))}
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white"
              >
                <option value="">No category</option>
                {["Combinable Crops", "Root Crops", "Vegetables", "Oilseeds", "Pulses", "Grass & Forage", "Other"].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Notes</label>
              <textarea
                value={editCropForm.notes}
                onChange={e => setEditCropForm(f => ({ ...f, notes: e.target.value }))}
                rows={3}
                placeholder="Seed rate, treatment details, grower's observations, or any other variety-specific notes…"
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white resize-none"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setEditingCrop(null)}>Cancel</Button>
            <Button onClick={handleEditCropSave} disabled={editCropSaving || !editCropForm.name.trim()}>
              {editCropSaving ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── ADD VARIETY DIALOG ── */}
      <Dialog open={!!addingVarietyCropId} onOpenChange={(o) => { if (!o) setAddingVarietyCropId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Variety</DialogTitle>
            <DialogDescription>Add a new variety to this crop. You can attach a seed data sheet after saving.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Variety Name</label>
              <Input
                value={addVarietyForm.variety}
                onChange={e => setAddVarietyForm(f => ({ ...f, variety: e.target.value }))}
                placeholder="e.g. KWS Zyatt, Extase, Crusoe"
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Notes</label>
              <textarea
                value={addVarietyForm.notes}
                onChange={e => setAddVarietyForm(f => ({ ...f, notes: e.target.value }))}
                rows={3}
                placeholder="Seed rate, treatment details, grower's observations, or any other variety-specific notes…"
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white resize-none"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setAddingVarietyCropId(null)}>Cancel</Button>
            <Button onClick={handleAddVarietySave} disabled={addVarietySaving || !addVarietyForm.variety.trim()}>
              {addVarietySaving ? "Adding…" : "Add Variety"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── PRINT CROP REGISTER ── */}
      {printOpen && (
        <PrintCropRegister
          farmId={farmId}
          year={selectedYear}
          fields={fields}
          assignments={assignments}
          crops={crops}
          landUseRecords={landUseRecords}
          onClose={() => setPrintOpen(false)}
        />
      )}

      {/* ── ASSIGN CROP DIALOG ── */}
      <Dialog open={!!assignForField} onOpenChange={(o) => { if (!o) { setAssignForField(null); assignCropMut.reset(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sprout className="w-5 h-5 text-green-600" />
              Assign Crop to {assignForField?.name || "Field"}
            </DialogTitle>
            <DialogDescription>
              Record what's being grown in this field for the {CURRENT_YEAR} season.
            </DialogDescription>
          </DialogHeader>

          {crops.length === 0 ? (
            <div className="py-6 text-center text-foreground/60 text-sm">
              <p>No crops in your register yet.</p>
              <p className="mt-1">Go to the <strong>Crops Register</strong> tab to add crops first.</p>
            </div>
          ) : (
            <form onSubmit={assignForm.handleSubmit(onSubmitAssign)} className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Crop</label>
                <select
                  {...assignForm.register("varietyId", {
                    required: true,
                    valueAsNumber: true,
                    onChange: () => {
                      assignForm.setValue("seedBatchId", "");
                      setTgwManuallySet(false);
                    },
                  })}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white"
                >
                  <option value="">Select a crop...</option>
                  {crops.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}{c.variety ? ` — ${c.variety}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {!!watchedAssignVarietyId && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Seed Batch</label>
                  <p className="text-xs text-muted-foreground mb-1.5">Optional — selecting a batch auto-fills TGW and reserves stock.</p>
                  <select
                    {...assignForm.register("seedBatchId", {
                      onChange: (e) => {
                        const batch = availableSeedBatches.find(b => String(b.id) === e.target.value);
                        if (batch && !tgwManuallySet) {
                          assignForm.setValue("tgwGrams", batch.tgwGrams);
                        }
                      },
                    })}
                    className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white"
                  >
                    <option value="">No batch — enter TGW manually</option>
                    {availableSeedBatches.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.batchNumber} — TGW {b.tgwGrams}g — {Number(b.quantityRemainingKg).toFixed(1)}kg remaining
                        {b.supplierName ? ` (${b.supplierName})` : ""}
                      </option>
                    ))}
                  </select>
                  {availableSeedBatches.length === 0 && (
                    <p className="text-[11px] text-foreground/50 mt-1">No seed batches in stock for this variety. Add one in Seed Store.</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Planting Date</label>
                  <Input
                    type="date"
                    {...assignForm.register("plantingDate", {
                      onChange: (e) => {
                        if (!seasonManuallySet) {
                          const derived = deriveSeasonFromDate(e.target.value);
                          if (derived) assignForm.setValue("season", derived);
                        }
                      },
                    })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Expected Harvest</label>
                  <Input type="date" {...assignForm.register("expectedHarvestDate")} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Season</label>
                <p className="text-xs text-muted-foreground mb-1.5">When the crop goes in the ground — auto-filled from Planting Date, but you can change it.</p>
                <select
                  {...assignForm.register("season", {
                    onChange: () => setSeasonManuallySet(true),
                  })}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white"
                >
                  <option value="">Select a season...</option>
                  {SEASON_OPTIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {(() => {
                const soilType = assignForField?.soilType;
                const blackgrassRisk = !!assignForField?.blackgrassRiskField;
                const watchedPlantingDate = assignForm.watch("plantingDate");
                const watchedTarget = assignForm.watch("targetPlantPopulationM2");
                const watchedTgw = assignForm.watch("tgwGrams");
                const establishment = getEstablishmentPercent(soilType, watchedPlantingDate);
                const targetNum = watchedTarget ? parseFloat(watchedTarget) : NaN;
                const tgwNum = watchedTgw ? parseFloat(watchedTgw) : NaN;
                const calc = !isNaN(targetNum) && !isNaN(tgwNum)
                  ? calculateSeedRate(targetNum, tgwNum, establishment.percent)
                  : null;
                const applyCalculatedRate = () => {
                  if (!calc) return;
                  assignForm.setValue("seedRate", String(calc.seedRateKgHa));
                  assignForm.setValue("seedUnit", "kg/ha");
                };
                return (
                  <div className="rounded-lg border-2 border-dashed border-green-200 bg-green-50/40 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Sprout className="w-4 h-4 text-green-700" />
                      <p className="text-sm font-semibold text-green-900">Seed rate calculator</p>
                      <span className="text-xs text-foreground/50">(optional)</span>
                    </div>
                    <p className="text-xs text-foreground/60">
                      Target plants/m² × TGW ÷ estimated establishment %, adjusted for this field's soil type and planting date.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium mb-1 block text-foreground/70">Target Plant Population (plants/m²)</label>
                        <Input
                          type="number" step="1" placeholder={String(suggestTargetPopulation(blackgrassRisk))}
                          {...assignForm.register("targetPlantPopulationM2")}
                        />
                        {blackgrassRisk && (
                          <p className="text-[11px] text-red-700 mt-1">Black-grass risk field — suggest {BLACKGRASS_TARGET_POPULATION_M2}/m² to raise crop competition.</p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1 block text-foreground/70">TGW — Thousand Grain Weight (g)</label>
                        <Input
                          type="number" step="0.1" placeholder="e.g. 48.5"
                          {...assignForm.register("tgwGrams", { onChange: () => setTgwManuallySet(true) })}
                        />
                      </div>
                    </div>
                    <div className="text-xs text-foreground/60 space-y-0.5">
                      <p>Soil: {soilType || "not set"} — {establishment.soilLabel}</p>
                      <p>Timing: {establishment.dateLabel}</p>
                      <p className="font-medium text-foreground/80">Estimated establishment: {establishment.percent}%</p>
                    </div>
                    {calc ? (
                      <div className="flex items-center justify-between rounded-md bg-white border border-green-300 px-3 py-2">
                        <div>
                          <p className="text-sm font-semibold text-green-900">Suggested seed rate: {calc.seedRateKgHa} kg/ha</p>
                          <p className="text-xs text-foreground/60">{calc.seedsPerM2} seeds/m²</p>
                        </div>
                        <Button type="button" size="sm" variant="outline" onClick={applyCalculatedRate}>Use this rate</Button>
                      </div>
                    ) : (
                      <p className="text-xs text-foreground/50">Enter a target population and TGW to see a suggested seed rate.</p>
                    )}
                  </div>
                );
              })()}

              {(() => {
                const watchedSeedBatchId = assignForm.watch("seedBatchId");
                const selectedBatch = availableSeedBatches.find(b => String(b.id) === String(watchedSeedBatchId));
                if (!selectedBatch) return null;
                const watchedSeedRate = assignForm.watch("seedRate");
                const watchedSeedUnit = assignForm.watch("seedUnit") || "kg/ha";
                const seedRateNum = watchedSeedRate ? parseFloat(watchedSeedRate) : NaN;
                const areaHa = assignForField?.areaHectares ? Number(assignForField.areaHectares) : NaN;
                const bagWeightKg = Number(selectedBatch.bagWeightKg) || 25;
                const canCalc = !isNaN(seedRateNum) && !isNaN(areaHa) && watchedSeedUnit === "kg/ha";
                const bagsNeeded = canCalc ? Math.ceil((seedRateNum * areaHa) / bagWeightKg) : null;
                const kgNeeded = bagsNeeded !== null ? bagsNeeded * bagWeightKg : null;
                const remainingKg = Number(selectedBatch.quantityRemainingKg);
                const insufficient = kgNeeded !== null && kgNeeded > remainingKg;
                return (
                  <div className={`rounded-lg border p-3 text-sm ${insufficient ? "border-red-300 bg-red-50" : "border-blue-200 bg-blue-50/50"}`}>
                    {bagsNeeded !== null ? (
                      <>
                        <p className={insufficient ? "text-red-900 font-medium" : "text-blue-900 font-medium"}>
                          Bags needed: {bagsNeeded} ({kgNeeded?.toFixed(1)}kg of {bagWeightKg}kg bags)
                        </p>
                        {insufficient ? (
                          <p className="text-xs text-red-700 mt-1">
                            Only {remainingKg.toFixed(1)}kg remaining in this batch — not enough stock. Choose another batch or reduce area/rate.
                          </p>
                        ) : (
                          <p className="text-xs text-blue-700 mt-1">{remainingKg.toFixed(1)}kg remaining in batch after allocation would be {(remainingKg - (kgNeeded ?? 0)).toFixed(1)}kg.</p>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-foreground/60">Enter a Seed Rate in kg/ha to calculate bags needed from this batch.</p>
                    )}
                  </div>
                );
              })()}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Seed Rate</label>
                  <Input type="number" step="0.1" placeholder="e.g. 180" {...assignForm.register("seedRate")} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Unit</label>
                  <select
                    {...assignForm.register("seedUnit")}
                    className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm"
                  >
                    <option value="kg/ha">kg/ha</option>
                    <option value="seeds/m²">seeds/m²</option>
                    <option value="kg/acre">kg/acre</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Target Row Spacing (cm)</label>
                  <Input type="number" step="0.5" placeholder={assignForField?.blackgrassRiskField ? "≤ 15" : "e.g. 12.5"} {...assignForm.register("targetRowSpacingCm")} />
                </div>
              </div>

              <DialogMutationError mutation={assignCropMut} message="Failed to save — your entries are still here." />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAssignForField(null)}>Cancel</Button>
                <Button type="submit" disabled={assigningCrop}>{assigningCrop ? "Saving..." : "Assign Crop"}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ── LAND USE DIALOG ── */}
      {(() => {
        const isEditing = !!editingLandUseRecord;
        const targetField = isEditing
          ? fields.find(f => f.id === editingLandUseRecord!.fieldId) ?? null
          : landUseForField;
        const isOpen = !!landUseForField || !!editingLandUseRecord;
        const watchedLandUse = landUseForm.watch("landUse");
        const onClose = () => { setLandUseForField(null); setEditingLandUseRecord(null); landUseForm.reset(); createLandUseMut.reset(); updateLandUseMut.reset(); };
        const onSubmitLandUse = (values: LandUseFormData) => {
          const payload = {
            fieldId: targetField!.id,
            year: Number(values.year),
            season: values.season || null,
            landUse: values.landUse,
            schemeActionCode: values.schemeActionCode || null,
            schemeReference: values.schemeReference || null,
            areaHectares: values.areaHectares || null,
            startDate: values.startDate || null,
            endDate: values.endDate || null,
            managementNotes: values.managementNotes || null,
          };
          if (isEditing) {
            updateLandUseMut.mutate({ id: editingLandUseRecord!.id, ...payload }, { onSuccess: onClose });
          } else {
            createLandUseMut.mutate(payload as any, { onSuccess: onClose });
          }
        };
        return (
          <Dialog open={isOpen} onOpenChange={o => { if (!o) onClose(); }}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <TreePine className="w-5 h-5 text-stone-600" />
                  {isEditing ? "Edit Land Use Record" : `Record Land Use — ${targetField?.name || "Field"}`}
                </DialogTitle>
                <DialogDescription>
                  Record how this field is being managed when not in arable or horticultural production — for example fallow, SFI or Countryside Stewardship options, permanent grassland or woodland.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={landUseForm.handleSubmit(onSubmitLandUse)} className="space-y-4 mt-2">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Land Use Type <span className="text-red-500">*</span></label>
                  <select {...landUseForm.register("landUse", { required: true })} className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white">
                    {LAND_USE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.icon} {o.label}</option>
                    ))}
                  </select>
                </div>
                {SCHEME_CODES_NEEDED.has(watchedLandUse) && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Scheme Action Code</label>
                      <Input {...landUseForm.register("schemeActionCode")} placeholder="e.g. CSAM1, AB8, OP1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Agreement Reference</label>
                      <Input {...landUseForm.register("schemeReference")} placeholder="e.g. 23/12345/SFI" className="font-mono" />
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Year <span className="text-red-500">*</span></label>
                    <Input type="number" min="2000" max="2099" {...landUseForm.register("year", { required: true })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Season Description</label>
                    <Input {...landUseForm.register("season")} placeholder="e.g. Spring 2026" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Start Date</label>
                    <Input type="date" {...landUseForm.register("startDate")} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">End Date</label>
                    <Input type="date" {...landUseForm.register("endDate")} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Area (ha)</label>
                  <Input type="number" step="0.0001" {...landUseForm.register("areaHectares")} placeholder={targetField?.areaHectares ? String(parseFloat(String(targetField.areaHectares)).toFixed(2)) : "e.g. 12.40"} />
                  <p className="text-xs text-foreground/40 mt-1">Leave blank to use full field area. Enter a partial area if only part of the field is in this use.</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Management Notes</label>
                  <textarea {...landUseForm.register("managementNotes")} rows={3} placeholder="e.g. Wild bird seed mix sown April 2026. No cultivation or spraying until Aug." className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white resize-none" />
                </div>
                <DialogMutationError mutation={createLandUseMut} message="Failed to save — your entries are still here." />
                <DialogMutationError mutation={updateLandUseMut} message="Failed to save — your entries are still here." />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                  <Button type="submit" disabled={createLandUseMut.isPending || updateLandUseMut.isPending}>
                    {(createLandUseMut.isPending || updateLandUseMut.isPending) ? "Saving..." : isEditing ? "Save Changes" : "Record Land Use"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        );
      })()}

      {/* ── SEED RECORDS TAB ── */}
      {tab === "seed" && <SeedDrillingSection farmId={farmId} fields={fields} />}

      {/* ── AHDB BYDV DECISION SUPPORT TAB ── */}
      {tab === "bydv" && <BydvAssessmentSection farmId={farmId} fields={fields} assignments={assignments} />}

      {/* ── CROP ROTATION PLANNER TAB ── */}
      {tab === "rotation" && <CropRotationPlanner farmId={farmId} fields={fields} fieldsLoading={fieldsLoading} />}

      {/* ── FIELD MAP TAB ── */}
      {tab === "map" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-base font-semibold">Field Map</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Showing plantings and land use for the selected season.</p>
            </div>
            <div className="relative flex-shrink-0">
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
                className="appearance-none border border-input rounded-lg pl-3 pr-8 py-2 text-sm bg-white font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              >
                {availableYears.map(y => (
                  <option key={y} value={y}>{y} Season{y === CURRENT_YEAR ? " (Current)" : ""}</option>
                ))}
              </select>
            </div>
          </div>
          <FieldSchematicMap
            fields={fields}
            currentCropByField={currentCropByField as Record<number, { fieldId: number; cropName?: string; season?: string; year?: number; plantingDate?: string; expectedHarvestDate?: string }>}
            currentLandUseByField={currentLandUseByField as Record<number, { fieldId: number; landUse: string }>}
            selectedYear={selectedYear}
          />
        </div>
      )}

      {/* ── LAND TENURE REGISTER TAB ── */}
      {tab === "tenure" && (() => {
        const today = new Date().toISOString().slice(0, 10);
        const in60 = new Date(Date.now() + 60 * 86400 * 1000).toISOString().slice(0, 10);
        const rentedFields = fields.filter(f => f.tenureType && f.tenureType !== "owned" && f.isActive !== false);
        const totalAreaHa = rentedFields.reduce((s, f) => s + (f.areaHectares ? parseFloat(String(f.areaHectares)) : 0), 0);
        const totalAnnualRent = rentedFields.reduce((s, f) => s + (f.annualRentPounds ? parseFloat(String(f.annualRentPounds)) : 0), 0);
        const reviewsDue = rentedFields.filter(f => f.rentReviewDate && f.rentReviewDate >= today && f.rentReviewDate <= in60).length;
        const expiringSoon = rentedFields.filter(f => f.tenancyEndDate && f.tenancyEndDate >= today && f.tenancyEndDate <= in60).length;
        const expiredCount = rentedFields.filter(f => f.tenancyEndDate && f.tenancyEndDate < today).length;
        const alertCount = reviewsDue + expiringSoon + expiredCount;

        const tenureLabels: Record<string, string> = { owned: "Owned", tenanted: "Tenanted", license: "Grazing Licence", seasonal: "Seasonal" };
        const tenureColours: Record<string, string> = {
          tenanted: "bg-blue-100 text-blue-800 border-blue-200",
          license: "bg-amber-100 text-amber-800 border-amber-200",
          seasonal: "bg-purple-100 text-purple-800 border-purple-200",
        };

        function fmtRent(val?: string | number | null) {
          if (!val) return "—";
          const n = parseFloat(String(val));
          return isNaN(n) ? "—" : `£${n.toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
        }

        function openFieldTenure(f: FieldRecord) {
          setTab("fields");
          setSelectedFieldForHistory(f);
          setDrawerTab("tenure");
          setTenureEditMode(false);
        }

        function openFieldTenureForEdit(f: FieldRecord) {
          setTenureForm({
            tenureType: f.tenureType ?? "owned",
            landlordSupplierId: f.landlordSupplierId ? String(f.landlordSupplierId) : "__none__",
            tenancyStartDate: f.tenancyStartDate ?? "",
            tenancyEndDate: f.tenancyEndDate ?? "",
            annualRentPounds: f.annualRentPounds ? String(f.annualRentPounds) : "",
            rentReviewDate: f.rentReviewDate ?? "",
            tenureNotes: f.tenureNotes ?? "",
          });
          setTab("fields");
          setSelectedFieldForHistory(f);
          setDrawerTab("tenure");
          setTenureEditMode(true);
        }

        const fieldsWithoutTenure = fields.filter(f => f.isActive !== false && (!f.tenureType || f.tenureType === "owned"));

        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">Land Tenure Register</h2>
                <p className="text-xs text-muted-foreground mt-0.5">All land held by the farm under tenancy, licence, or seasonal agreement — and the associated rent liability.</p>
              </div>
            </div>

            {/* Stats bar */}
            {rentedFields.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-muted/40 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold">{rentedFields.length}</div>
                  <div className="text-xs text-muted-foreground">Fields Rented In</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-green-800">{totalAreaHa.toFixed(1)} ha</div>
                  <div className="text-xs text-green-700">Total Area Rented</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-blue-800">{totalAnnualRent > 0 ? `£${totalAnnualRent.toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : "—"}</div>
                  <div className="text-xs text-blue-700">Annual Rent Liability</div>
                </div>
                <div className={`rounded-lg p-3 text-center ${alertCount > 0 ? "bg-amber-50" : "bg-muted/40"}`}>
                  <div className={`text-xl font-bold ${alertCount > 0 ? "text-amber-800" : ""}`}>{alertCount}</div>
                  <div className={`text-xs ${alertCount > 0 ? "text-amber-700" : "text-muted-foreground"}`}>Upcoming Alerts</div>
                </div>
              </div>
            )}

            {/* Alert banners */}
            {expiredCount > 0 && (
              <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-800">{expiredCount} tenancy agreement{expiredCount !== 1 ? "s have" : " has"} passed their end date</p>
                  <p className="text-xs text-red-600 mt-0.5">Review the highlighted rows below and renew or update the tenancy details.</p>
                </div>
              </div>
            )}
            {(reviewsDue > 0 || expiringSoon > 0) && (
              <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                <CalendarDays className="h-4 w-4 text-amber-700 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  {reviewsDue > 0 && <p className="font-medium">{reviewsDue} rent review{reviewsDue !== 1 ? "s" : ""} due within 60 days — contact your landlord or agent to initiate.</p>}
                  {expiringSoon > 0 && <p className={`font-medium ${reviewsDue > 0 ? "mt-0.5" : ""}`}>{expiringSoon} tenancy agreement{expiringSoon !== 1 ? "s expire" : " expires"} within 60 days — arrange renewal if continuing.</p>}
                </div>
              </div>
            )}

            {/* Empty state — no rented fields yet */}
            {rentedFields.length === 0 && fieldsWithoutTenure.length === 0 && (
              <div className="border rounded-xl p-12 text-center text-muted-foreground">
                <Landmark className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No fields added yet</p>
                <p className="text-xs mt-1">Add fields on the Fields tab first, then set tenure here.</p>
              </div>
            )}

            {/* Table */}
            {rentedFields.length > 0 && (
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Field</th>
                      <th className="text-left px-4 py-3 font-medium">Type</th>
                      <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Landlord</th>
                      <th className="text-right px-4 py-3 font-medium hidden sm:table-cell">Area</th>
                      <th className="text-right px-4 py-3 font-medium">Annual Rent</th>
                      <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Tenancy End</th>
                      <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Rent Review</th>
                      <th className="px-4 py-3 w-20" />
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {rentedFields.map(f => {
                      const landlord = f.landlordSupplierId ? landlordSuppliers.find(s => s.id === f.landlordSupplierId) : null;
                      const isExpired = f.tenancyEndDate && f.tenancyEndDate < today;
                      const isEndingSoon = !isExpired && f.tenancyEndDate && f.tenancyEndDate <= in60;
                      const isReviewDue = f.rentReviewDate && f.rentReviewDate >= today && f.rentReviewDate <= in60;
                      return (
                        <tr key={f.id} className={`hover:bg-muted/30 transition-colors ${isExpired ? "bg-red-50" : ""}`}>
                          <td className="px-4 py-3">
                            <div className="font-medium">{f.name || `Field #${f.id}`}</div>
                            {f.fieldReference && <div className="text-xs text-muted-foreground font-mono">{f.fieldReference}</div>}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border font-medium ${tenureColours[f.tenureType!] ?? "bg-muted text-foreground border-border"}`}>
                              {tenureLabels[f.tenureType!] ?? f.tenureType}
                            </span>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            {landlord ? (
                              <div>
                                <div className="font-medium">{landlord.name}</div>
                                {landlord.phone && <div className="text-xs text-muted-foreground">{landlord.phone}</div>}
                              </div>
                            ) : <span className="text-muted-foreground">—</span>}
                          </td>
                          <td className="px-4 py-3 text-right hidden sm:table-cell text-muted-foreground">
                            {f.areaHectares ? `${parseFloat(String(f.areaHectares)).toFixed(2)} ha` : "—"}
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            {fmtRent(f.annualRentPounds)}
                            {f.annualRentPounds && (
                              <div className="text-xs text-muted-foreground font-normal">per year</div>
                            )}
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            {f.tenancyEndDate ? (
                              <span className={`text-xs font-medium ${isExpired ? "text-red-700" : isEndingSoon ? "text-amber-700" : "text-foreground"}`}>
                                {formatDate(f.tenancyEndDate)}
                                {isExpired && <span className="ml-1 text-red-600">(expired)</span>}
                                {isEndingSoon && <span className="ml-1 text-amber-600">(soon)</span>}
                              </span>
                            ) : <span className="text-muted-foreground text-xs">—</span>}
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            {f.rentReviewDate ? (
                              <span className={`text-xs font-medium ${isReviewDue ? "text-amber-700" : "text-foreground"}`}>
                                {formatDate(f.rentReviewDate)}
                                {isReviewDue && <span className="ml-1 text-amber-600">(due soon)</span>}
                              </span>
                            ) : <span className="text-muted-foreground text-xs">—</span>}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button size="sm" variant="outline" className="text-xs h-7 px-2.5 gap-1" onClick={() => openFieldTenure(f)}>
                              <FileText className="h-3 w-3" /> Open
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {rentedFields.length > 1 && totalAnnualRent > 0 && (
                    <tfoot className="border-t bg-muted/30">
                      <tr>
                        <td colSpan={4} className="px-4 py-2.5 text-xs font-medium text-muted-foreground hidden sm:table-cell">Total</td>
                        <td colSpan={4} className="px-4 py-2.5 text-xs font-medium sm:hidden">Total annual rent</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-sm">£{totalAnnualRent.toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}<span className="text-xs font-normal text-muted-foreground ml-1">/ yr</span></td>
                        <td colSpan={3} />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            )}

            {/* Per-hectare analysis */}
            {rentedFields.length > 0 && totalAreaHa > 0 && totalAnnualRent > 0 && (
              <p className="text-xs text-muted-foreground text-right px-1">
                Blended average: <span className="font-medium text-foreground">£{(totalAnnualRent / totalAreaHa).toFixed(2)} / ha / yr</span> across {totalAreaHa.toFixed(1)} ha
              </p>
            )}

            {/* Fields without tenure — shown when any active field has no tenure set */}
            {fieldsWithoutTenure.length > 0 && (
              <div className="border rounded-xl overflow-hidden">
                <div className="bg-muted/40 px-4 py-2.5 border-b flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {fieldsWithoutTenure.length} field{fieldsWithoutTenure.length !== 1 ? "s" : ""} — no tenure recorded
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">Click "Set tenure" to record the ownership or tenancy basis for each field.</p>
                  </div>
                </div>
                <div className="divide-y">
                  {fieldsWithoutTenure.map(f => (
                    <div key={f.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/20 transition-colors">
                      <div>
                        <p className="text-sm font-medium">{f.name || `Field #${f.id}`}</p>
                        <p className="text-xs text-muted-foreground">
                          {f.areaHectares ? `${parseFloat(String(f.areaHectares)).toFixed(2)} ha` : "Area not set"}
                          {(f as any).fieldReference ? ` · ${(f as any).fieldReference}` : ""}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs shrink-0" onClick={() => openFieldTenureForEdit(f)}>
                        <Key className="h-3 w-3" />
                        Set tenure
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ── GRASSLAND TAB ── */}
      {tab === "grassland" && <GrasslandSection farmId={farmId} fields={fields} />}

      {/* ── Add New Landlord Dialog ── */}
      <Dialog open={showAddLandlordDialog} onOpenChange={setShowAddLandlordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Landlord / Landowner</DialogTitle>
            <DialogDescription>Create a new landlord contact. They will be available to all fields on this farm.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5 block">Name <span className="text-red-500">*</span></label>
              <Input value={landlordQuickForm.name} onChange={e => setLandlordQuickForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Smith Estates Ltd" />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5 block">Contact Name</label>
              <Input value={landlordQuickForm.contactName} onChange={e => setLandlordQuickForm(p => ({ ...p, contactName: e.target.value }))} placeholder="e.g. James Smith" />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5 block">Phone</label>
              <Input value={landlordQuickForm.phone} onChange={e => setLandlordQuickForm(p => ({ ...p, phone: e.target.value }))} placeholder="e.g. 01234 567890" />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5 block">Address</label>
              <Input value={landlordQuickForm.address} onChange={e => setLandlordQuickForm(p => ({ ...p, address: e.target.value }))} placeholder="e.g. Estate Office, High Street" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddLandlordDialog(false)}>Cancel</Button>
            <Button disabled={savingLandlord || !landlordQuickForm.name.trim()} onClick={async () => {
              setSavingLandlord(true);
              try {
                const res = await fetch(`/api/farms/${safeFarmId}/landlords`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(landlordQuickForm),
                }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
                const data = await res.json();
                queryClient.invalidateQueries({ queryKey: ["farm-landlords", safeFarmId] });
                setTenureForm(prev => ({ ...prev, landlordSupplierId: String(data.record.id) }));
                setShowAddLandlordDialog(false);
              } finally {
                setSavingLandlord(false);
              }
            }}>
              {savingLandlord ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
              Save Landlord
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <CropSeasonReport
        assignmentId={reportAssignmentId}
        onClose={() => setReportAssignmentId(null)}
      />
      <ConfirmDialog
        open={pendingDeleteVariety !== null}
        title="Delete variety"
        message="Delete this variety? If it is the only variety for this crop, the entire crop record will be removed."
        confirmLabel="Delete"
        confirmVariant="destructive"
        mutation={deleteVarietyMut}
        onConfirm={() => { if (pendingDeleteVariety !== null) deleteVarietyMut.mutate(pendingDeleteVariety, { onSuccess: () => setPendingDeleteVariety(null) }); }}
        onCancel={() => { setPendingDeleteVariety(null); deleteVarietyMut.reset(); }}
      />
      <ConfirmDialog
        open={pendingDeleteDoc !== null}
        title="Remove document"
        message="Remove this document?"
        confirmLabel="Remove"
        confirmVariant="destructive"
        mutation={deleteCropDocMut}
        onConfirm={() => { if (pendingDeleteDoc) deleteCropDocMut.mutate(pendingDeleteDoc, { onSuccess: () => setPendingDeleteDoc(null) }); }}
        onCancel={() => { setPendingDeleteDoc(null); deleteCropDocMut.reset(); }}
      />
      <ConfirmDialog
        open={pendingDeleteLandUse !== null}
        title="Delete land use record"
        message="Delete this land use record?"
        confirmLabel="Delete"
        confirmVariant="destructive"
        mutation={deleteLandUseMut}
        onConfirm={() => { if (pendingDeleteLandUse !== null) deleteLandUseMut.mutate(pendingDeleteLandUse, { onSuccess: () => setPendingDeleteLandUse(null) }); }}
        onCancel={() => { setPendingDeleteLandUse(null); deleteLandUseMut.reset(); }}
      />
    </AppLayout>
  );
}

// ─── T016: Crop Rotation Planner ──────────────────────────────────────────────

