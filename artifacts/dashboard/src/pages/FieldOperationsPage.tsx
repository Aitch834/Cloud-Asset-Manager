import React, { useState, useMemo } from "react";
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
import { Shovel, Plus, Search, Trash2, Pencil, Eye, Filter, CalendarDays, MapPin, Wrench, Printer, Tractor, Clock, PoundSterling, UserCheck, ChevronDown, ChevronUp } from "lucide-react";
import { printProReport } from "@/lib/print-report";
import { CropYearSelector } from "@/components/CropYearSelector";
import { currentCropYear, isInCropYear, cropYearLabel } from "@/lib/cropYear";
import { useFarmMembers, memberFullName } from "@/hooks/use-farm-members";
import { StaffSelect } from "@/components/ui/staff-select";
import { VEHICLE_TYPES, IMPLEMENT_TYPES, equipmentTypeLabel } from "@/lib/equipmentTypes";

const fmt = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

// ─── Operation type definitions ────────────────────
const OPERATION_GROUPS = [
  {
    label: "Primary Cultivation",
    types: [
      { value: "ploughing", label: "Ploughing", hasDepth: true, hasPasses: true },
      { value: "subsoiling", label: "Sub-soiling", hasDepth: true, hasPasses: true },
      { value: "mole_ploughing", label: "Mole Ploughing", hasDepth: true, hasPasses: false },
    ],
  },
  {
    label: "Secondary Cultivation",
    types: [
      { value: "discing", label: "Discing", hasDepth: true, hasPasses: true },
      { value: "power_harrowing", label: "Power Harrowing", hasDepth: true, hasPasses: true },
      { value: "rotovating", label: "Rotovating", hasDepth: true, hasPasses: false },
      { value: "tine_harrowing", label: "Tine Harrowing", hasDepth: false, hasPasses: true },
      { value: "stubble_cultivation", label: "Stubble Cultivation", hasDepth: true, hasPasses: true },
    ],
  },
  {
    label: "Consolidation",
    types: [
      { value: "rolling", label: "Rolling", hasDepth: false, hasPasses: true },
      { value: "cambridge_rolling", label: "Cambridge Rolling", hasDepth: false, hasPasses: true },
      { value: "bed_forming", label: "Bed Forming", hasDepth: false, hasPasses: false },
    ],
  },
  {
    label: "Soil Amendments",
    types: [
      { value: "lime_spreading", label: "Lime Spreading", hasDepth: false, hasPasses: false, hasQuantity: true, quantityLabel: "Quantity", defaultUnit: "t/ha" },
      { value: "gypsum", label: "Gypsum Application", hasDepth: false, hasPasses: false, hasQuantity: true, quantityLabel: "Quantity", defaultUnit: "t/ha" },
      { value: "compost", label: "Compost / Organic Matter", hasDepth: false, hasPasses: false, hasQuantity: true, quantityLabel: "Quantity", defaultUnit: "t/ha" },
    ],
  },
  {
    label: "Crop Establishment",
    types: [
      { value: "cover_crop_seeding", label: "Cover Crop Seeding", hasDepth: false, hasPasses: false, hasQuantity: true, quantityLabel: "Seed Rate", defaultUnit: "kg/ha" },
      { value: "cover_crop_rolling", label: "Cover Crop Rolling / Crimping", hasDepth: false, hasPasses: false },
    ],
  },
  {
    label: "Applications",
    types: [
      { value: "slug_pellets", label: "Slug Pellets", hasDepth: false, hasPasses: false, hasQuantity: true, quantityLabel: "Rate", defaultUnit: "kg/ha" },
      { value: "irrigation", label: "Irrigation", hasDepth: false, hasPasses: false, hasQuantity: true, quantityLabel: "Volume", defaultUnit: "mm" },
      { value: "desiccation", label: "Cover Crop Desiccation", hasDepth: false, hasPasses: false },
    ],
  },
  {
    label: "Drainage",
    types: [
      { value: "mole_drainage", label: "Mole Drainage", hasDepth: true, hasPasses: false },
      { value: "drainage_repair", label: "Drainage Repair", hasDepth: false, hasPasses: false },
    ],
  },
  {
    label: "Other",
    types: [
      { value: "other", label: "Other", hasDepth: false, hasPasses: false },
    ],
  },
];

const ALL_TYPES = OPERATION_GROUPS.flatMap((g) => g.types);

const getTypeDef = (value: string) => ALL_TYPES.find((t) => t.value === value) ?? null;

const labelForType = (value: string) => ALL_TYPES.find((t) => t.value === value)?.label ?? value;

const CATEGORY_BADGE_COLORS: Record<string, string> = {
  "Primary Cultivation": "bg-amber-100 text-amber-800",
  "Secondary Cultivation": "bg-orange-100 text-orange-800",
  "Consolidation": "bg-blue-100 text-blue-800",
  "Soil Amendments": "bg-green-100 text-green-800",
  "Crop Establishment": "bg-emerald-100 text-emerald-800",
  "Applications": "bg-purple-100 text-purple-800",
  "Drainage": "bg-cyan-100 text-cyan-800",
  "Other": "bg-gray-100 text-gray-700",
};

const getCategoryForType = (value: string) => {
  for (const g of OPERATION_GROUPS) {
    if (g.types.some((t) => t.value === value)) return g.label;
  }
  return "Other";
};

const UNITS = ["t/ha", "kg/ha", "l/ha", "mm", "m³", "bales", "bags"];

function computeOpCost(r: any): number {
  let cost = 0;
  if (r.isContractor && r.contractorCostPence) {
    cost += r.contractorCostPence / 100;
  } else {
    if (r.machineHours && r.machineRatePence) cost += parseFloat(r.machineHours) * (r.machineRatePence / 100);
    if (r.labourHours && r.labourRatePence) cost += parseFloat(r.labourHours) * (r.labourRatePence / 100);
  }
  return cost;
}

function fmtGbp(v: number) {
  return v > 0 ? `£${v.toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : "—";
}

function fmtHrs(v: number | null | undefined) {
  if (!v || v === 0) return "—";
  return `${parseFloat(v.toFixed(1))} hrs`;
}

// ─── Blank form ────────────────────────────────────
const blank = () => ({
  fieldName: "",
  fieldId: "",
  operationDate: new Date().toISOString().slice(0, 10),
  operationType: "",
  vehicleId: "",
  vehicleDescription: "",
  implement: "",
  implementId: "",
  workingDepthCm: "",
  passes: "1",
  areaHa: "",
  quantity: "",
  quantityUnit: "",
  operator: "",
  machineHours: "",
  labourHours: "",
  machineRatePence: "",
  labourRatePence: "",
  isContractor: false as boolean,
  contractorName: "",
  contractorCostPence: "",
  notes: "",
});

type FormState = ReturnType<typeof blank>;

// ─── Main component ────────────────────────────────
export default function FieldOperationsPage() {
  const { farmId } = useAppStore();
  const { data: membersData, isLoading: membersLoading } = useFarmMembers(farmId);
  const staffNames = (membersData?.members ?? []).map((m: any) => memberFullName(m));
  const { toast } = useToast();
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("__all__");
  const [cropYear, setCropYear] = useState(currentCropYear());
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [viewRecord, setViewRecord] = useState<any>(null);
  const [areaAutoSource, setAreaAutoSource] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(blank());
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [showCostSummary, setShowCostSummary] = useState(false);

  // Farm info for print header
  const farmQ = useQuery({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then((r) => r.json()),
    enabled: !!farmId,
  });
  const farmData = farmQ.data?.record ?? null;

  // Fields for selector
  const fieldsQ = useQuery({
    queryKey: ["fields", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fields`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? [],
  });

  const opsQ = useQuery({
    queryKey: ["field-operations", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/field-operations`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? [],
  });

  const modulesQ = useQuery({
    queryKey: ["farm-modules", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/modules`).then((r) => r.json()),
    enabled: !!farmId,
  });
  const activeModuleKeys: string[] = modulesQ.data?.activeModuleKeys ?? [];
  const hasEquipmentModule = activeModuleKeys.includes("equipment-management");

  const equipmentQ = useQuery({
    queryKey: ["equipment", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/equipment`).then((r) => r.json()),
    enabled: !!farmId && hasEquipmentModule,
    select: (d) => d.records ?? [],
  });
  const equipmentList: any[] = equipmentQ.data ?? [];
  const vehicleEquipment  = equipmentList.filter(e => VEHICLE_TYPES.has(e.type));
  const implementEquipment = equipmentList.filter(e => IMPLEMENT_TYPES.has(e.type));
  const unknownEquipment   = equipmentList.filter(e => !VEHICLE_TYPES.has(e.type) && !IMPLEMENT_TYPES.has(e.type));

  const records: any[] = opsQ.data ?? [];

  const createMut = useMutation({
    mutationFn: (data: FormState) =>
      fetch(`/api/farms/${farmId}/field-operations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["field-operations", farmId] });
      setShowDialog(false);
      toast({ title: "Operation logged" });
    },
    onError: () => toast({ title: "Error", description: "Could not save operation", variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormState }) =>
      fetch(`/api/farms/${farmId}/field-operations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["field-operations", farmId] });
      setShowDialog(false);
      toast({ title: "Operation updated" });
    },
    onError: () => toast({ title: "Error", description: "Could not update operation", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/farms/${farmId}/field-operations/${id}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["field-operations", farmId] });
      setConfirmDelete(null);
      toast({ title: "Operation deleted" });
    },
  });

  const typeDef = form.operationType ? getTypeDef(form.operationType) : null;

  const filtered = useMemo(() => {
    let list = records.filter((r: any) => isInCropYear(r.operationDate, cropYear));
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (r: any) =>
          r.fieldName?.toLowerCase().includes(s) ||
          labelForType(r.operationType).toLowerCase().includes(s) ||
          r.operator?.toLowerCase().includes(s) ||
          r.implement?.toLowerCase().includes(s)
      );
    }
    if (filterType !== "__all__") {
      list = list.filter((r: any) => r.operationType === filterType);
    }
    return list;
  }, [records, search, filterType, cropYear]);

  // Stats — all scoped to the selected crop year
  const thisYearRecords = records.filter((r: any) => isInCropYear(r.operationDate, cropYear));
  const thisYearArea = thisYearRecords.reduce((sum: number, r: any) => sum + (parseFloat(r.areaHa) || 0), 0);
  const thisYearFields = new Set(thisYearRecords.map((r: any) => r.fieldName).filter(Boolean)).size;
  const lastOpDate = records.length > 0
    ? records.slice().sort((a: any, b: any) => new Date(b.operationDate).getTime() - new Date(a.operationDate).getTime())[0].operationDate
    : null;
  const thisYearMachineHrs = thisYearRecords.reduce((s: number, r: any) => s + (parseFloat(r.machineHours) || 0), 0);
  const thisYearLabourHrs = thisYearRecords.reduce((s: number, r: any) => s + (parseFloat(r.labourHours) || 0), 0);
  const thisYearCost = thisYearRecords.reduce((s: number, r: any) => s + computeOpCost(r), 0);

  // Cost summary — grouped by field for selected crop year
  const costByField = useMemo(() => {
    const map: Record<string, { fieldName: string; ops: number; machineHrs: number; labourHrs: number; cost: number; areaHa: number }> = {};
    thisYearRecords.forEach((r: any) => {
      const key = r.fieldName || "Unknown";
      if (!map[key]) map[key] = { fieldName: key, ops: 0, machineHrs: 0, labourHrs: 0, cost: 0, areaHa: 0 };
      map[key].ops++;
      map[key].machineHrs += parseFloat(r.machineHours) || 0;
      map[key].labourHrs += parseFloat(r.labourHours) || 0;
      map[key].cost += computeOpCost(r);
      map[key].areaHa = Math.max(map[key].areaHa, parseFloat(r.areaHa) || 0);
    });
    return Object.values(map).sort((a, b) => b.cost - a.cost || b.ops - a.ops);
  }, [thisYearRecords]);

  function openAdd() {
    setEditId(null);
    setForm(blank());
    setAreaAutoSource(null);
    setShowDialog(true);
  }

  function openEdit(r: any) {
    setEditId(r.id);
    setAreaAutoSource(null);
    const hasDbField = r.fieldId && r.fieldId.toString() !== "" && r.fieldId.toString() !== "0";
    setForm({
      fieldName: r.fieldName ?? "",
      fieldId: hasDbField ? r.fieldId.toString() : "",
      operationDate: r.operationDate ? new Date(r.operationDate).toISOString().slice(0, 10) : "",
      operationType: r.operationType ?? "",
      vehicleId: r.vehicleId?.toString() ?? "",
      vehicleDescription: r.vehicleDescription ?? "",
      implement: r.implement ?? "",
      implementId: r.implementId?.toString() ?? "",
      workingDepthCm: r.workingDepthCm?.toString() ?? "",
      passes: r.passes?.toString() ?? "1",
      areaHa: r.areaHa?.toString() ?? "",
      quantity: r.quantity?.toString() ?? "",
      quantityUnit: r.quantityUnit ?? "",
      operator: r.operator ?? "",
      machineHours: r.machineHours?.toString() ?? "",
      labourHours: r.labourHours?.toString() ?? "",
      machineRatePence: r.machineRatePence?.toString() ?? "",
      labourRatePence: r.labourRatePence?.toString() ?? "",
      isContractor: r.isContractor ?? false,
      contractorName: r.contractorName ?? "",
      contractorCostPence: r.contractorCostPence?.toString() ?? "",
      notes: r.notes ?? "",
    });
    setShowDialog(true);
  }

  function handleFieldSelect(fid: string) {
    const field = (fieldsQ.data ?? []).find((f: any) => f.id.toString() === fid);
    setForm((prev) => {
      if (prev.areaHa) return { ...prev, fieldId: fid, fieldName: field?.name ?? prev.fieldName };
      const computedFarmable = field?.computedFarmableAreaHa;
      const manualFarmable = field?.farmableAreaHectares;
      const gross = field?.areaHectares;
      let autoArea = "";
      let autoSource: string | null = null;
      if (computedFarmable && parseFloat(computedFarmable) > 0) {
        autoArea = parseFloat(computedFarmable).toFixed(2);
        autoSource = "farmable area (gross minus enclosed features)";
      } else if (manualFarmable && parseFloat(manualFarmable) > 0) {
        autoArea = parseFloat(manualFarmable).toFixed(2);
        autoSource = "recorded farmable area";
      } else if (gross && parseFloat(gross) > 0) {
        autoArea = parseFloat(gross).toFixed(2);
        autoSource = "registered gross field area";
      }
      setAreaAutoSource(autoSource);
      return { ...prev, fieldId: fid, fieldName: field?.name ?? prev.fieldName, areaHa: autoArea };
    });
  }

  function handleOpTypeChange(val: string) {
    const def = getTypeDef(val);
    setForm((f) => ({
      ...f,
      operationType: val,
      quantityUnit: def && (def as any).defaultUnit ? (def as any).defaultUnit : f.quantityUnit,
    }));
  }

  function handleSubmit() {
    if (!form.fieldName || !form.operationDate || !form.operationType) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    const payload = {
      ...form,
      fieldId: form.fieldId === "__select__" ? "" : form.fieldId,
      vehicleId: form.vehicleId && form.vehicleId !== "__none__" ? form.vehicleId : "",
      implementId: form.implementId && form.implementId !== "__none__" ? form.implementId : "",
    };
    if (editId !== null) {
      updateMut.mutate({ id: editId, data: payload });
    } else {
      createMut.mutate(payload);
    }
  }

  const isBusy = createMut.isPending || updateMut.isPending;

  function printFieldOpsRegister(rows: any[], farm: any) {
    const tableRows = rows.map((r: any) => {
      const cat = getCategoryForType(r.operationType);
      const depthQty = r.workingDepthCm ? `${r.workingDepthCm} cm` : r.quantity ? `${r.quantity}${r.quantityUnit ? ` ${r.quantityUnit}` : ""}` : "—";
      return `<tr>
        <td style="white-space:nowrap">${fmt(r.operationDate)}</td>
        <td><strong>${r.fieldName || "—"}</strong></td>
        <td>${cat}</td>
        <td>${labelForType(r.operationType)}</td>
        <td>${r.vehicleDescription || "—"}</td>
        <td>${r.implement || "—"}</td>
        <td style="white-space:nowrap">${depthQty}${r.passes && r.passes > 1 ? ` · ${r.passes}×` : ""}</td>
        <td>${r.areaHa ? parseFloat(r.areaHa).toFixed(2) : "—"}</td>
        <td>${r.operator || "—"}</td>
        <td>${r.notes || ""}</td>
      </tr>`;
    }).join("");
    const tableHtml = `<table><thead><tr>
      <th>Date</th><th>Field</th><th>Category</th><th>Operation</th><th>Vehicle</th><th>Implement</th>
      <th>Depth / Qty</th><th>Area (ha)</th><th>Operator</th><th>Notes</th>
    </tr></thead><tbody>${tableRows}</tbody></table>`;
    printProReport({
      title: "Field Operations Register",
      farmName: farm?.name,
      cphNumber: farm?.cphNumber ?? undefined,
      redTractorId: farm?.redTractorId ?? undefined,
      recordCount: rows.length,
      tableHtml,
    });
  }

  return (
    <AppLayout title="Field Operations">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100">
              <Shovel className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Field Operations</h1>
              <p className="text-sm text-gray-500 mt-0.5">Cultivation, soil amendment &amp; field activity log</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => printFieldOpsRegister(filtered, farmData)}
              disabled={filtered.length === 0}
              className="flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Register
            </Button>
            <Button onClick={openAdd} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Log Operation
            </Button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Operations", value: thisYearRecords.length, sub: cropYearLabel(cropYear) },
            { label: "Area Worked", value: thisYearArea > 0 ? `${thisYearArea.toFixed(1)} ha` : "—", sub: cropYearLabel(cropYear) },
            { label: "Fields Active", value: thisYearFields > 0 ? thisYearFields : "—", sub: thisYearFields === 1 ? "field" : "fields" },
            { label: "Machine Hours", value: thisYearMachineHrs > 0 ? `${thisYearMachineHrs.toFixed(1)}` : "—", sub: "hrs logged" },
            { label: "Labour Hours", value: thisYearLabourHrs > 0 ? `${thisYearLabourHrs.toFixed(1)}` : "—", sub: "hrs logged" },
            { label: "Est. Total Cost", value: thisYearCost > 0 ? fmtGbp(thisYearCost) : "—", sub: "machine + labour" },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500 uppercase tracking-wide">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by field, operation, implement, operator…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-56">
              <Filter className="w-4 h-4 mr-2 text-gray-400 inline" />
              <SelectValue placeholder="All operation types" />
            </SelectTrigger>
            <SelectContent className="max-h-64 overflow-y-auto">
              <SelectItem value="__all__">All operation types</SelectItem>
              {OPERATION_GROUPS.map((g) => (
                <React.Fragment key={g.label}>
                  <div className="px-2 py-1 text-xs text-gray-400 font-semibold uppercase tracking-wide">{g.label}</div>
                  {g.types.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </React.Fragment>
              ))}
            </SelectContent>
          </Select>
          <CropYearSelector value={cropYear} onChange={setCropYear} />
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {opsQ.isLoading ? (
            <div className="p-12 text-center text-gray-400">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Shovel className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No operations logged yet</p>
              <p className="text-gray-400 text-sm mt-1">Click "Log Operation" to record your first field activity.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wide">
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Field</th>
                    <th className="px-4 py-3 font-semibold">Operation</th>
                    <th className="px-4 py-3 font-semibold">Vehicle</th>
                    <th className="px-4 py-3 font-semibold">Implement</th>
                    <th className="px-4 py-3 font-semibold">Depth / Qty</th>
                    <th className="px-4 py-3 font-semibold">Area (ha)</th>
                    <th className="px-4 py-3 font-semibold">Hrs / Cost</th>
                    <th className="px-4 py-3 font-semibold">Operator</th>
                    <th className="px-4 py-3 font-semibold sr-only">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((r: any) => {
                    const cat = getCategoryForType(r.operationType);
                    const badgeCls = CATEGORY_BADGE_COLORS[cat] ?? "bg-gray-100 text-gray-700";
                    return (
                      <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-gray-700">
                            <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                            {fmt(r.operationDate)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 font-medium text-gray-900">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            {r.fieldName}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badgeCls}`}>
                            {labelForType(r.operationType)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {r.vehicleDescription ? (
                            <div className="flex items-center gap-1">
                              <Tractor className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              {r.vehicleDescription}
                            </div>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {r.implement ? (
                            <div className="flex items-center gap-1">
                              <Wrench className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              {r.implement}
                            </div>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {r.workingDepthCm ? `${r.workingDepthCm} cm` : ""}
                          {r.quantity ? `${r.quantity}${r.quantityUnit ? ` ${r.quantityUnit}` : ""}` : ""}
                          {!r.workingDepthCm && !r.quantity ? "—" : ""}
                          {r.passes && r.passes > 1 ? ` · ${r.passes}×` : ""}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {r.areaHa ? parseFloat(r.areaHa).toFixed(2) : "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {r.isContractor ? (
                            <div className="text-xs space-y-0.5">
                              <div className="flex items-center gap-1 text-violet-700 font-medium"><UserCheck className="w-3 h-3" /> Contractor</div>
                              {r.contractorCostPence ? <div className="text-gray-600">{fmtGbp(r.contractorCostPence / 100)}</div> : null}
                            </div>
                          ) : (
                            <div className="text-xs space-y-0.5">
                              {r.machineHours ? <div className="flex items-center gap-1"><Tractor className="w-3 h-3 text-gray-400" />{fmtHrs(parseFloat(r.machineHours))}</div> : null}
                              {r.labourHours ? <div className="flex items-center gap-1"><Clock className="w-3 h-3 text-gray-400" />{fmtHrs(parseFloat(r.labourHours))}</div> : null}
                              {computeOpCost(r) > 0 ? <div className="flex items-center gap-1 font-medium text-green-700"><PoundSterling className="w-3 h-3" />{fmtGbp(computeOpCost(r)).replace("£","")}</div> : null}
                              {!r.machineHours && !r.labourHours ? "—" : null}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{r.operator || "—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setViewRecord(r)}
                              className="h-7 w-7 p-0 text-gray-400 hover:text-green-600"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEdit(r)}
                              className="h-7 w-7 p-0 text-gray-400 hover:text-blue-600"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setConfirmDelete(r.id)}
                              className="h-7 w-7 p-0 text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        </div>

        {filtered.length > 0 && (
          <p className="text-xs text-gray-400 text-right">
            Showing {filtered.length} of {records.length} records
          </p>
        )}
      </div>

      {/* Cost Summary */}
      {costByField.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <button
            type="button"
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
            onClick={() => setShowCostSummary((v) => !v)}
          >
            <div className="flex items-center gap-2 font-semibold text-gray-800">
              <PoundSterling className="w-4 h-4 text-green-600" />
              Cost Summary by Field — {cropYearLabel(cropYear)}
              {thisYearCost > 0 && <span className="text-sm font-normal text-green-700 ml-2">Total: {fmtGbp(thisYearCost)}</span>}
            </div>
            {showCostSummary ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>
          {showCostSummary && (
            <div className="border-t border-gray-100 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                    <th className="px-4 py-2 font-semibold">Field</th>
                    <th className="px-4 py-2 font-semibold text-right">Operations</th>
                    <th className="px-4 py-2 font-semibold text-right">Machine Hrs</th>
                    <th className="px-4 py-2 font-semibold text-right">Labour Hrs</th>
                    <th className="px-4 py-2 font-semibold text-right">Est. Cost</th>
                    <th className="px-4 py-2 font-semibold text-right">Cost / ha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {costByField.map((row) => (
                    <tr key={row.fieldName} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-medium text-gray-900">{row.fieldName}</td>
                      <td className="px-4 py-2.5 text-right text-gray-600">{row.ops}</td>
                      <td className="px-4 py-2.5 text-right text-gray-600">{row.machineHrs > 0 ? `${row.machineHrs.toFixed(1)} hrs` : "—"}</td>
                      <td className="px-4 py-2.5 text-right text-gray-600">{row.labourHrs > 0 ? `${row.labourHrs.toFixed(1)} hrs` : "—"}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-green-700">{fmtGbp(row.cost)}</td>
                      <td className="px-4 py-2.5 text-right text-gray-500 text-xs">{row.cost > 0 && row.areaHa > 0 ? fmtGbp(row.cost / row.areaHa) + "/ha" : "—"}</td>
                    </tr>
                  ))}
                  {/* Totals row */}
                  <tr className="bg-gray-50 font-semibold border-t-2 border-gray-200">
                    <td className="px-4 py-2.5 text-gray-900">Total</td>
                    <td className="px-4 py-2.5 text-right text-gray-700">{thisYearRecords.length}</td>
                    <td className="px-4 py-2.5 text-right text-gray-700">{thisYearMachineHrs > 0 ? `${thisYearMachineHrs.toFixed(1)} hrs` : "—"}</td>
                    <td className="px-4 py-2.5 text-right text-gray-700">{thisYearLabourHrs > 0 ? `${thisYearLabourHrs.toFixed(1)} hrs` : "—"}</td>
                    <td className="px-4 py-2.5 text-right text-green-700">{fmtGbp(thisYearCost)}</td>
                    <td className="px-4 py-2.5 text-right text-gray-400">—</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-gray-400 px-4 py-2">Cost estimates based on rates entered per operation. Operations without rate data show as —.</p>
            </div>
          )}
        </div>
      )}

      {/* View Dialog */}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: 520 }}>
            <DialogHeader><DialogTitle>Field Operation</DialogTitle></DialogHeader>
            <div className="space-y-3 text-sm py-2">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Date</p><p>{fmt(viewRecord.operationDate)}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Field</p><p>{viewRecord.fieldName || "—"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Operation</p><p>{labelForType(viewRecord.operationType)}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Operator</p><p>{viewRecord.operator || "—"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Vehicle</p><p>{viewRecord.vehicleDescription || "—"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Implement</p><p>{viewRecord.implement || "—"}</p></div>
                {viewRecord.workingDepthCm && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Working Depth</p><p>{viewRecord.workingDepthCm} cm</p></div>}
                {viewRecord.passes && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Passes</p><p>{viewRecord.passes}</p></div>}
                {viewRecord.areaHa && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Area (ha)</p><p>{parseFloat(viewRecord.areaHa).toFixed(2)}</p></div>}
                {viewRecord.quantity && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Quantity</p><p>{viewRecord.quantity}{viewRecord.quantityUnit ? ` ${viewRecord.quantityUnit}` : ""}</p></div>}
              </div>
              {/* Time & Cost */}
              {(viewRecord.machineHours || viewRecord.labourHours || viewRecord.isContractor) && (
                <div className="border-t border-gray-100 pt-3 space-y-1.5">
                  <p className="text-xs text-gray-500 uppercase font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> Time &amp; Cost</p>
                  <div className="grid grid-cols-2 gap-3">
                    {viewRecord.isContractor ? (
                      <>
                        <div><p className="text-xs text-gray-500 font-medium mb-0.5">Type</p><p className="text-violet-700 font-medium flex items-center gap-1"><UserCheck className="w-3 h-3" /> Contractor</p></div>
                        {viewRecord.contractorName && <div><p className="text-xs text-gray-500 font-medium mb-0.5">Contractor</p><p>{viewRecord.contractorName}</p></div>}
                        {viewRecord.contractorCostPence && <div><p className="text-xs text-gray-500 font-medium mb-0.5">Cost</p><p className="font-semibold text-green-700">{fmtGbp(viewRecord.contractorCostPence / 100)}</p></div>}
                      </>
                    ) : (
                      <>
                        {viewRecord.machineHours && <div><p className="text-xs text-gray-500 font-medium mb-0.5">Machine Hours</p><p>{fmtHrs(parseFloat(viewRecord.machineHours))}{viewRecord.machineRatePence ? ` @ £${(viewRecord.machineRatePence / 100).toFixed(0)}/hr` : ""}</p></div>}
                        {viewRecord.labourHours && <div><p className="text-xs text-gray-500 font-medium mb-0.5">Labour Hours</p><p>{fmtHrs(parseFloat(viewRecord.labourHours))}{viewRecord.labourRatePence ? ` @ £${(viewRecord.labourRatePence / 100).toFixed(0)}/hr` : ""}</p></div>}
                        {computeOpCost(viewRecord) > 0 && <div className="col-span-2"><p className="text-xs text-gray-500 font-medium mb-0.5">Estimated Cost</p><p className="font-semibold text-green-700">{fmtGbp(computeOpCost(viewRecord))}</p></div>}
                      </>
                    )}
                  </div>
                </div>
              )}
              {viewRecord.notes && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Notes</p><p className="text-gray-700 whitespace-pre-line">{viewRecord.notes}</p></div>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}><Pencil className="w-3.5 h-3.5 mr-1" />Edit</Button>
              <Button variant="ghost" onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent style={{ maxWidth: "42rem" }}>
          <DialogHeader>
            <DialogTitle>{editId !== null ? "Edit Operation" : "Log Field Operation"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-1">
            {/* Date + Operation Type */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="space-y-1.5">
                <Label>Date <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  value={form.operationDate}
                  onChange={(e) => setForm((f) => ({ ...f, operationDate: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Operation Type <span className="text-red-500">*</span></Label>
                <Select value={form.operationType || "__none__"} onValueChange={(v) => v !== "__none__" && handleOpTypeChange(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type…" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64 overflow-y-auto">
                    <SelectItem value="__none__" disabled>Select type…</SelectItem>
                    {OPERATION_GROUPS.map((g) => (
                      <React.Fragment key={g.label}>
                        <div className="px-2 py-1 text-xs text-gray-400 font-semibold uppercase tracking-wide">{g.label}</div>
                        {g.types.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </React.Fragment>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Field selector */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="space-y-1.5">
                <Label>Field <span className="text-red-500">*</span></Label>
                <Select value={form.fieldId || "__select__"} onValueChange={handleFieldSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select field…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__select__" disabled>Select field…</SelectItem>
                    {(fieldsQ.data ?? []).length === 0 && (
                      <SelectItem value="__noop__" disabled>No fields registered — add fields in Fields &amp; Crops</SelectItem>
                    )}
                    {(fieldsQ.data ?? []).map((f: any) => (
                      <SelectItem key={f.id} value={f.id.toString()}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Area (ha)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.areaHa}
                  onChange={(e) => { setAreaAutoSource(null); setForm((f) => ({ ...f, areaHa: e.target.value })); }}
                />
                {areaAutoSource && (
                  <p className="text-xs text-green-700 flex items-center gap-1">
                    <span>↑ Auto-filled from {areaAutoSource}. Edit if the worked area differs.</span>
                  </p>
                )}
              </div>
            </div>

            {/* Depth / Passes — only shown when relevant */}
            {typeDef && ((typeDef as any).hasDepth || (typeDef as any).hasPasses) && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {(typeDef as any).hasDepth && (
                  <div className="space-y-1.5">
                    <Label>Working Depth (cm)</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 25"
                      value={form.workingDepthCm}
                      onChange={(e) => setForm((f) => ({ ...f, workingDepthCm: e.target.value }))}
                    />
                  </div>
                )}
                {(typeDef as any).hasPasses && (
                  <div className="space-y-1.5">
                    <Label>No. of Passes</Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="1"
                      value={form.passes}
                      onChange={(e) => setForm((f) => ({ ...f, passes: e.target.value }))}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Quantity — only for relevant types */}
            {typeDef && (typeDef as any).hasQuantity && (
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
                <div className="space-y-1.5">
                  <Label>{(typeDef as any).quantityLabel ?? "Quantity"}</Label>
                  <Input
                    type="number"
                    step="0.001"
                    placeholder="0"
                    value={form.quantity}
                    onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Unit</Label>
                  <Select value={form.quantityUnit || "__none__"} onValueChange={(v) => setForm((f) => ({ ...f, quantityUnit: v === "__none__" ? "" : v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Select…</SelectItem>
                      {UNITS.map((u) => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Vehicle */}
            <div className="space-y-1.5">
              <Label>Vehicle / Tractor</Label>
              {hasEquipmentModule ? (
                <Select
                  value={form.vehicleId || "__none__"}
                  onValueChange={(v) => {
                    if (v === "__none__") {
                      setForm((f) => ({ ...f, vehicleId: "", vehicleDescription: "" }));
                      return;
                    }
                    const eq = equipmentList.find((e: any) => e.id.toString() === v);
                    const label = eq
                      ? [eq.name, eq.make, eq.model].filter(Boolean).join(" — ") + (eq.registrationNumber ? ` (${eq.registrationNumber})` : "")
                      : "";
                    setForm((f) => ({ ...f, vehicleId: v, vehicleDescription: label }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None / N/A</SelectItem>
                    {vehicleEquipment.map((e: any) => (
                      <SelectItem key={e.id} value={e.id.toString()}>
                        {[e.name, e.make, e.model].filter(Boolean).join(" — ")}
                        {e.registrationNumber ? ` (${e.registrationNumber})` : ""}
                      </SelectItem>
                    ))}
                    {unknownEquipment.length > 0 && vehicleEquipment.length > 0 && (
                      <SelectItem value="__separator__" disabled>── Other Equipment ──</SelectItem>
                    )}
                    {unknownEquipment.map((e: any) => (
                      <SelectItem key={e.id} value={e.id.toString()}>
                        {[e.name, e.make, e.model].filter(Boolean).join(" — ")}
                        {e.registrationNumber ? ` (${e.registrationNumber})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  placeholder="e.g. JD 6R 185 (YT23 ABC)"
                  value={form.vehicleDescription}
                  onChange={(e) => setForm((f) => ({ ...f, vehicleDescription: e.target.value }))}
                />
              )}
            </div>

            {/* Implement + Operator */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="space-y-1.5">
                <Label>Implement / Machinery</Label>
                {hasEquipmentModule ? (
                  <Select
                    value={form.implementId || "__none__"}
                    onValueChange={(v) => {
                      if (v === "__none__") {
                        setForm((f) => ({ ...f, implementId: "", implement: "" }));
                        return;
                      }
                      const eq = equipmentList.find((e: any) => e.id.toString() === v);
                      const label = eq ? [eq.name, eq.make, eq.model].filter(Boolean).join(" — ") : "";
                      setForm((f) => ({ ...f, implementId: v, implement: label }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select implement…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None / N/A</SelectItem>
                      {implementEquipment.map((e: any) => (
                        <SelectItem key={e.id} value={e.id.toString()}>
                          {[e.name, e.make, e.model].filter(Boolean).join(" — ")}
                        </SelectItem>
                      ))}
                      {unknownEquipment.length > 0 && implementEquipment.length > 0 && (
                        <SelectItem value="__separator2__" disabled>── Other Equipment ──</SelectItem>
                      )}
                      {unknownEquipment.map((e: any) => (
                        <SelectItem key={e.id} value={e.id.toString()}>
                          {[e.name, e.make, e.model].filter(Boolean).join(" — ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    placeholder="e.g. Vaderstad Topdown 400"
                    value={form.implement}
                    onChange={(e) => setForm((f) => ({ ...f, implement: e.target.value }))}
                  />
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Operator</Label>
                <StaffSelect
                  value={form.operator}
                  onChange={(v) => setForm((f) => ({ ...f, operator: v }))}
                  staffNames={staffNames}
                  loading={membersLoading}
                />
              </div>
            </div>

            {/* Time & Cost */}
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Time &amp; Cost</p>

              {/* Contractor toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, isContractor: !f.isContractor, machineHours: "", labourHours: "", machineRatePence: "", labourRatePence: "" }))}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${form.isContractor ? "bg-violet-600" : "bg-gray-200"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.isContractor ? "translate-x-4" : "translate-x-0"}`} />
                </button>
                <Label className="cursor-pointer mb-0" onClick={() => setForm((f) => ({ ...f, isContractor: !f.isContractor }))}>
                  <UserCheck className="w-3.5 h-3.5 inline mr-1 text-violet-600" />
                  Contractor operation
                </Label>
              </div>

              {form.isContractor ? (
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
                  <div className="space-y-1.5">
                    <Label>Contractor Name</Label>
                    <Input
                      placeholder="e.g. Smith Agri Services"
                      value={form.contractorName}
                      onChange={(e) => setForm((f) => ({ ...f, contractorName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Total Contractor Cost (£)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={form.contractorCostPence ? (parseInt(form.contractorCostPence) / 100).toFixed(2) : ""}
                      onChange={(e) => setForm((f) => ({ ...f, contractorCostPence: e.target.value ? String(Math.round(parseFloat(e.target.value) * 100)) : "" }))}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.75rem", alignItems: "end" }}>
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1"><Tractor className="w-3 h-3" /> Machine Hours</Label>
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        placeholder="0.0"
                        value={form.machineHours}
                        onChange={(e) => setForm((f) => ({ ...f, machineHours: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Machine Rate (£/hr)</Label>
                      <Input
                        type="number"
                        step="1"
                        min="0"
                        placeholder="e.g. 55"
                        value={form.machineRatePence ? (parseInt(form.machineRatePence) / 100).toFixed(0) : ""}
                        onChange={(e) => setForm((f) => ({ ...f, machineRatePence: e.target.value ? String(Math.round(parseFloat(e.target.value) * 100)) : "" }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1"><Clock className="w-3 h-3" /> Labour Hours</Label>
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        placeholder="0.0"
                        value={form.labourHours}
                        onChange={(e) => setForm((f) => ({ ...f, labourHours: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Labour Rate (£/hr)</Label>
                      <Input
                        type="number"
                        step="1"
                        min="0"
                        placeholder="e.g. 14"
                        value={form.labourRatePence ? (parseInt(form.labourRatePence) / 100).toFixed(0) : ""}
                        onChange={(e) => setForm((f) => ({ ...f, labourRatePence: e.target.value ? String(Math.round(parseFloat(e.target.value) * 100)) : "" }))}
                      />
                    </div>
                  </div>
                  {/* Live cost estimate */}
                  {(form.machineHours || form.labourHours) && (form.machineRatePence || form.labourRatePence) && (() => {
                    const mCost = parseFloat(form.machineHours || "0") * (parseInt(form.machineRatePence || "0") / 100);
                    const lCost = parseFloat(form.labourHours || "0") * (parseInt(form.labourRatePence || "0") / 100);
                    const total = mCost + lCost;
                    return total > 0 ? (
                      <p className="text-xs text-green-700 font-medium">
                        Estimated cost: <strong>{fmtGbp(total)}</strong>
                        {mCost > 0 && ` · Machine: ${fmtGbp(mCost)}`}
                        {lCost > 0 && ` · Labour: ${fmtGbp(lCost)}`}
                      </p>
                    ) : null;
                  })()}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea
                placeholder="Soil conditions, observations, any problems…"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isBusy}>
              {isBusy ? "Saving…" : editId !== null ? "Update Operation" : "Log Operation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={confirmDelete !== null} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent style={{ maxWidth: "24rem" }}>
          <DialogHeader>
            <DialogTitle>Delete Operation?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">This will permanently remove this field operation record. This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={deleteMut.isPending}
              onClick={() => confirmDelete !== null && deleteMut.mutate(confirmDelete)}
            >
              {deleteMut.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
