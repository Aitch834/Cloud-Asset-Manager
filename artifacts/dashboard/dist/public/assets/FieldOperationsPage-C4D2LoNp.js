import { b as useAppStore, a as useToast, c as useQueryClient, r as reactExports, m as useQuery, O as useMutation, j as jsxRuntimeExports, d as Button, S as Plus, I as Input, Q as React, M as MapPin, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, J as DialogFooter, L as Label, X as DialogMutationError } from "./index-NR-SGw0i.js";
import { A as AppLayout, n as Shovel, C as CalendarDays, d as Wrench } from "./AppLayout-Cd3p4pui.js";
import { T as Textarea } from "./textarea-BJLC97ak.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, g as SelectSeparator, e as SelectGroup, f as SelectLabel } from "./select-DqUDf0VF.js";
import { p as printProReport } from "./print-report-B_FwCCVJ.js";
import { C as CropYearSelector } from "./CropYearSelector-C2cu0zwK.js";
import { c as currentCropYear, i as isInCropYear, b as cropYearLabel } from "./cropYear-Dmv-iNR6.js";
import { u as useFarmMembers, m as memberFullName } from "./use-farm-members-BWT7zVxK.js";
import { S as StaffSelect } from "./staff-select-NISLjov9.js";
import { B as BuyerCombobox } from "./BuyerCombobox-BTLb4dbo.js";
import { V as VEHICLE_TYPES, I as IMPLEMENT_TYPES } from "./equipmentTypes-DkOagSn9.js";
import { P as Printer } from "./printer-CxrzQsyy.js";
import { S as Search } from "./search-DYvQU_aa.js";
import { F as Funnel } from "./funnel-DbuszN1Y.js";
import { T as Tractor } from "./tractor-g8DuD2ST.js";
import { U as UserCheck } from "./user-check-DS3CqkGG.js";
import { a as Clock } from "./database-Bsc-mGJk.js";
import { P as PoundSterling } from "./shield-alert-613BeFwq.js";
import { E as Eye } from "./eye-DWsC4A4l.js";
import { P as Pencil } from "./pencil-FHDCJ1OX.js";
import { T as Trash2, C as ChevronDown } from "./trash-2-CEwjwspm.js";
import { C as ChevronUp } from "./chevron-up-DM6s-LVb.js";
import "./use-safe-clerk-CTf4SFAG.js";
import "./triangle-alert-CoxyMuM1.js";
import "./shield-check-CO5y2JJE.js";
import "./index-BbUxYHyD.js";
import "./index-Bntpiimv.js";
import "./popover-f661WnvG.js";
import "./command-Bor_dTBu.js";
import "./chevrons-up-down-CZV0rkaD.js";
import "./user-plus-nIWHiP8V.js";
const fmt = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const OPERATION_GROUPS = [
  {
    label: "Primary Cultivation",
    types: [
      { value: "ploughing", label: "Ploughing", hasDepth: true, hasPasses: true },
      { value: "subsoiling", label: "Sub-soiling", hasDepth: true, hasPasses: true },
      { value: "mole_ploughing", label: "Mole Ploughing", hasDepth: true, hasPasses: false }
    ]
  },
  {
    label: "Secondary Cultivation",
    types: [
      { value: "discing", label: "Discing", hasDepth: true, hasPasses: true },
      { value: "power_harrowing", label: "Power Harrowing", hasDepth: true, hasPasses: true },
      { value: "rotovating", label: "Rotovating", hasDepth: true, hasPasses: false },
      { value: "tine_harrowing", label: "Tine Harrowing", hasDepth: false, hasPasses: true },
      { value: "stubble_cultivation", label: "Stubble Cultivation", hasDepth: true, hasPasses: true }
    ]
  },
  {
    label: "Consolidation",
    types: [
      { value: "rolling", label: "Rolling", hasDepth: false, hasPasses: true },
      { value: "cambridge_rolling", label: "Cambridge Rolling", hasDepth: false, hasPasses: true },
      { value: "bed_forming", label: "Bed Forming", hasDepth: false, hasPasses: false }
    ]
  },
  {
    label: "Soil Amendments",
    types: [
      { value: "lime_spreading", label: "Lime Spreading", hasDepth: false, hasPasses: false, hasQuantity: true, quantityLabel: "Quantity", defaultUnit: "t/ha" },
      { value: "gypsum", label: "Gypsum Application", hasDepth: false, hasPasses: false, hasQuantity: true, quantityLabel: "Quantity", defaultUnit: "t/ha" },
      { value: "compost", label: "Compost / Organic Matter", hasDepth: false, hasPasses: false, hasQuantity: true, quantityLabel: "Quantity", defaultUnit: "t/ha" }
    ]
  },
  {
    label: "Crop Establishment",
    types: [
      { value: "cover_crop_seeding", label: "Cover Crop Seeding", hasDepth: false, hasPasses: false, hasQuantity: true, quantityLabel: "Seed Rate", defaultUnit: "kg/ha" },
      { value: "cover_crop_rolling", label: "Cover Crop Rolling / Crimping", hasDepth: false, hasPasses: false }
    ]
  },
  {
    label: "Applications",
    types: [
      { value: "slug_pellets", label: "Slug Pellets", hasDepth: false, hasPasses: false, hasQuantity: true, quantityLabel: "Rate", defaultUnit: "kg/ha" },
      { value: "irrigation", label: "Irrigation", hasDepth: false, hasPasses: false, hasQuantity: true, quantityLabel: "Volume", defaultUnit: "mm" },
      { value: "desiccation", label: "Cover Crop Desiccation", hasDepth: false, hasPasses: false }
    ]
  },
  {
    label: "Drainage",
    types: [
      { value: "mole_drainage", label: "Mole Drainage", hasDepth: true, hasPasses: false },
      { value: "drainage_repair", label: "Drainage Repair", hasDepth: false, hasPasses: false }
    ]
  },
  {
    label: "Other",
    types: [
      { value: "other", label: "Other", hasDepth: false, hasPasses: false }
    ]
  }
];
const ALL_TYPES = OPERATION_GROUPS.flatMap((g) => g.types);
const getTypeDef = (value) => ALL_TYPES.find((t) => t.value === value) ?? null;
const labelForType = (value) => ALL_TYPES.find((t) => t.value === value)?.label ?? value;
const CATEGORY_BADGE_COLORS = {
  "Primary Cultivation": "bg-amber-100 text-amber-800",
  "Secondary Cultivation": "bg-orange-100 text-orange-800",
  "Consolidation": "bg-blue-100 text-blue-800",
  "Soil Amendments": "bg-green-100 text-green-800",
  "Crop Establishment": "bg-emerald-100 text-emerald-800",
  "Applications": "bg-purple-100 text-purple-800",
  "Drainage": "bg-cyan-100 text-cyan-800",
  "Other": "bg-gray-100 text-gray-700"
};
const getCategoryForType = (value) => {
  for (const g of OPERATION_GROUPS) {
    if (g.types.some((t) => t.value === value)) return g.label;
  }
  return "Other";
};
const UNITS = ["t/ha", "kg/ha", "l/ha", "mm", "m³", "bales", "bags"];
const UNITS_FOR_TYPE = {
  // Soil Amendments — solid material by weight per area
  lime_spreading: ["t/ha", "kg/ha"],
  gypsum: ["t/ha", "kg/ha"],
  compost: ["t/ha", "kg/ha", "l/ha"],
  // Crop Establishment — seed rate always in kg/ha
  cover_crop_seeding: ["kg/ha"],
  // Applications
  slug_pellets: ["kg/ha"],
  irrigation: ["mm", "m³", "l/ha"],
  desiccation: ["l/ha"]
};
function unitsForType(opType) {
  return UNITS_FOR_TYPE[opType] ?? UNITS;
}
const IMPLEMENTS_FOR_OP = {
  ploughing: ["plough"],
  subsoiling: ["cultivator"],
  mole_ploughing: ["plough", "cultivator"],
  discing: ["cultivator"],
  power_harrowing: ["power_harrow"],
  rotovating: ["cultivator", "power_harrow"],
  tine_harrowing: ["cultivator", "power_harrow"],
  stubble_cultivation: ["cultivator", "plough"],
  rolling: ["roller"],
  cambridge_rolling: ["roller"],
  bed_forming: ["roller", "cultivator"],
  lime_spreading: ["fertiliser_spreader", "muck_spreader"],
  gypsum: ["fertiliser_spreader"],
  compost: ["muck_spreader", "fertiliser_spreader"],
  cover_crop_seeding: ["drill"],
  cover_crop_rolling: ["roller"],
  slug_pellets: ["fertiliser_spreader", "other_implement"],
  irrigation: ["other_implement"],
  desiccation: ["trailed_sprayer"],
  mole_drainage: ["plough", "cultivator"],
  drainage_repair: ["other_implement"]
};
function eqDisplayName(e) {
  return e.name || [e.make, e.model].filter(Boolean).join(" ") || "Unknown";
}
function computeOpCost(r) {
  let cost = 0;
  if (r.isContractor && r.contractorCostPence) {
    cost += r.contractorCostPence / 100;
  } else {
    if (r.machineHours && r.machineRatePence) cost += parseFloat(r.machineHours) * (r.machineRatePence / 100);
    if (r.labourHours && r.labourRatePence) cost += parseFloat(r.labourHours) * (r.labourRatePence / 100);
  }
  return cost;
}
function fmtGbp(v) {
  return v > 0 ? `£${v.toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : "—";
}
function fmtHrs(v) {
  if (!v || v === 0) return "—";
  return `${parseFloat(v.toFixed(1))} hrs`;
}
const blank = () => ({
  fieldName: "",
  fieldId: "",
  operationDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
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
  isContractor: false,
  contractorName: "",
  contractorSupplierId: null,
  contractorCostPence: "",
  notes: ""
});
function FieldOperationsPage() {
  const { farmId } = useAppStore();
  const { data: membersData, isLoading: membersLoading } = useFarmMembers(farmId);
  const staffNames = (membersData?.members ?? []).map((m) => memberFullName(m));
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = reactExports.useState("");
  const [filterType, setFilterType] = reactExports.useState("__all__");
  const [filterField, setFilterField] = reactExports.useState("__all__");
  reactExports.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fn = params.get("fieldName");
    if (fn) setFilterField(fn);
  }, []);
  const [cropYear, setCropYear] = reactExports.useState(currentCropYear());
  const [showDialog, setShowDialog] = reactExports.useState(false);
  const [editId, setEditId] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [areaAutoSource, setAreaAutoSource] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(blank());
  const [confirmDelete, setConfirmDelete] = reactExports.useState(null);
  const [showCostSummary, setShowCostSummary] = reactExports.useState(false);
  const farmQ = useQuery({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const farmData = farmQ.data?.record ?? null;
  const fieldsQ = useQuery({
    queryKey: ["fields", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fields`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const opsQ = useQuery({
    queryKey: ["field-operations", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/field-operations`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const equipmentQ = useQuery({
    queryKey: ["equipment", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/equipment`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const equipmentList = equipmentQ.data ?? [];
  const vehicleEquipment = equipmentList.filter((e) => VEHICLE_TYPES.has(e.type));
  const implementEquipment = equipmentList.filter((e) => IMPLEMENT_TYPES.has(e.type));
  const suggestedTypes = form.operationType ? IMPLEMENTS_FOR_OP[form.operationType] ?? [] : [];
  const suggestedImplements = suggestedTypes.length > 0 ? implementEquipment.filter((e) => suggestedTypes.includes(e.type)) : [];
  const suggestedIds = new Set(suggestedImplements.map((e) => e.id));
  const otherImplements = implementEquipment.filter((e) => !suggestedIds.has(e.id));
  const records = opsQ.data ?? [];
  const createMut = useMutation({
    mutationFn: (data) => fetch(`/api/farms/${farmId}/field-operations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["field-operations", farmId] });
      setShowDialog(false);
      toast({ title: "Operation logged" });
    },
    onError: () => toast({ title: "Error", description: "Could not save operation", variant: "destructive" })
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => fetch(`/api/farms/${farmId}/field-operations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["field-operations", farmId] });
      setShowDialog(false);
      toast({ title: "Operation updated" });
    },
    onError: () => toast({ title: "Error", description: "Could not update operation", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/field-operations/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["field-operations", farmId] });
      setConfirmDelete(null);
      toast({ title: "Operation deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const typeDef = form.operationType ? getTypeDef(form.operationType) : null;
  const filtered = reactExports.useMemo(() => {
    let list = records.filter((r) => isInCropYear(r.operationDate, cropYear));
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (r) => r.fieldName?.toLowerCase().includes(s) || labelForType(r.operationType).toLowerCase().includes(s) || r.operator?.toLowerCase().includes(s) || r.implement?.toLowerCase().includes(s)
      );
    }
    if (filterType !== "__all__") {
      list = list.filter((r) => r.operationType === filterType);
    }
    if (filterField !== "__all__") {
      list = list.filter((r) => r.fieldName === filterField);
    }
    return list;
  }, [records, search, filterType, filterField, cropYear]);
  const thisYearRecords = records.filter((r) => isInCropYear(r.operationDate, cropYear));
  const thisYearArea = thisYearRecords.reduce((sum, r) => sum + (parseFloat(r.areaHa) || 0), 0);
  const thisYearFields = new Set(thisYearRecords.map((r) => r.fieldName).filter(Boolean)).size;
  records.length > 0 ? records.slice().sort((a, b) => new Date(b.operationDate).getTime() - new Date(a.operationDate).getTime())[0].operationDate : null;
  const thisYearMachineHrs = thisYearRecords.reduce((s, r) => s + (parseFloat(r.machineHours) || 0), 0);
  const thisYearLabourHrs = thisYearRecords.reduce((s, r) => s + (parseFloat(r.labourHours) || 0), 0);
  const thisYearCost = thisYearRecords.reduce((s, r) => s + computeOpCost(r), 0);
  const costByField = reactExports.useMemo(() => {
    const map = {};
    thisYearRecords.forEach((r) => {
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
  function openEdit(r) {
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
      contractorSupplierId: r.contractorSupplierId ?? null,
      contractorCostPence: r.contractorCostPence?.toString() ?? "",
      notes: r.notes ?? ""
    });
    setShowDialog(true);
  }
  function handleFieldSelect(fid) {
    const field = (fieldsQ.data ?? []).find((f) => f.id.toString() === fid);
    setForm((prev) => {
      if (prev.areaHa) return { ...prev, fieldId: fid, fieldName: field?.name ?? prev.fieldName };
      const computedFarmable = field?.computedFarmableAreaHa;
      const manualFarmable = field?.farmableAreaHectares;
      const gross = field?.areaHectares;
      let autoArea = "";
      let autoSource = null;
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
  function handleOpTypeChange(val) {
    const def = getTypeDef(val);
    const validUnits = unitsForType(val);
    setForm((f) => {
      const newUnit = def && def.defaultUnit ? def.defaultUnit : validUnits.includes(f.quantityUnit) ? f.quantityUnit : validUnits[0] ?? "";
      return { ...f, operationType: val, quantityUnit: newUnit };
    });
  }
  function handleSubmit() {
    if (!form.fieldName || !form.operationDate || !form.operationType) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    if (!form.isContractor && !form.labourHours) {
      toast({ title: "Labour hours required", description: "Please enter the labour hours for this operation.", variant: "destructive" });
      return;
    }
    const payload = {
      ...form,
      fieldId: form.fieldId === "__select__" ? "" : form.fieldId,
      vehicleId: form.vehicleId && form.vehicleId !== "__none__" ? form.vehicleId : "",
      implementId: form.implementId && form.implementId !== "__none__" ? form.implementId : ""
    };
    if (editId !== null) {
      updateMut.mutate({ id: editId, data: payload });
    } else {
      createMut.mutate(payload);
    }
  }
  const isBusy = createMut.isPending || updateMut.isPending;
  function printFieldOpsRegister(rows, farm) {
    const tableRows = rows.map((r) => {
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
      cphNumber: farm?.cphNumber ?? void 0,
      redTractorId: farm?.redTractorId ?? void 0,
      recordCount: rows.length,
      tableHtml
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { title: "Field Operations", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 rounded-lg bg-amber-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shovel, { className: "w-6 h-6 text-amber-700" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Field Operations" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mt-0.5", children: "Cultivation, soil amendment & field activity log" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: () => printFieldOpsRegister(filtered, farmData),
              disabled: filtered.length === 0,
              className: "flex items-center gap-2",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4" }),
                "Print Register"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAdd, className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
            "Log Operation"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4", children: [
        { label: "Operations", value: thisYearRecords.length, sub: cropYearLabel(cropYear) },
        { label: "Area Worked", value: thisYearArea > 0 ? `${thisYearArea.toFixed(1)} ha` : "—", sub: cropYearLabel(cropYear) },
        { label: "Fields Active", value: thisYearFields > 0 ? thisYearFields : "—", sub: thisYearFields === 1 ? "field" : "fields" },
        { label: "Machine Hours", value: thisYearMachineHrs > 0 ? `${thisYearMachineHrs.toFixed(1)}` : "—", sub: "hrs logged" },
        { label: "Labour Hours", value: thisYearLabourHrs > 0 ? `${thisYearLabourHrs.toFixed(1)}` : "—", sub: "hrs logged" },
        { label: "Est. Total Cost", value: thisYearCost > 0 ? fmtGbp(thisYearCost) : "—", sub: "machine + labour" }
      ].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase tracking-wide", children: s.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-gray-900 mt-1", children: s.value }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-0.5", children: s.sub })
      ] }, s.label)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "Search by field, operation, implement, operator…",
              value: search,
              onChange: (e) => setSearch(e.target.value),
              className: "pl-9"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterField, onValueChange: setFilterField, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full sm:w-48", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All fields" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { className: "max-h-64 overflow-y-auto", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__all__", children: "All fields" }),
            (fieldsQ.data ?? []).map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: f.name, children: f.name }, f.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterType, onValueChange: setFilterType, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectTrigger, { className: "w-full sm:w-56", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Funnel, { className: "w-4 h-4 mr-2 text-gray-400 inline" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All operation types" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { className: "max-h-64 overflow-y-auto", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__all__", children: "All operation types" }),
            OPERATION_GROUPS.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-2 py-1 text-xs text-gray-400 font-semibold uppercase tracking-wide", children: g.label }),
              g.types.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value))
            ] }, g.label))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CropYearSelector, { value: cropYear, onChange: setCropYear })
      ] }),
      !opsQ.isLoading && filtered.length > 0 && (() => {
        const filtArea = filtered.reduce((s, r) => s + (parseFloat(r.areaHa) || 0), 0);
        const filtMachHrs = filtered.reduce((s, r) => s + (parseFloat(r.machineHours) || 0), 0);
        const filtLabHrs = filtered.reduce((s, r) => s + (parseFloat(r.labourHours) || 0), 0);
        const filtCost = filtered.reduce((s, r) => s + computeOpCost(r), 0);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 16px", minWidth: 130 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#15803d", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Area Worked" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#14532d", lineHeight: 1, margin: 0 }, children: [
              filtArea.toFixed(1),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 500 }, children: "ha" })
            ] })
          ] }),
          filtMachHrs > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 16px", minWidth: 140 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#1d4ed8", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Machine Hours" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#1e3a8a", lineHeight: 1, margin: 0 }, children: [
              filtMachHrs.toFixed(1),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 500 }, children: "hrs" })
            ] })
          ] }),
          filtLabHrs > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 16px", minWidth: 140 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#1d4ed8", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Labour Hours" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#1e3a8a", lineHeight: 1, margin: 0 }, children: [
              filtLabHrs.toFixed(1),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 500 }, children: "hrs" })
            ] })
          ] }),
          filtCost > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 16px", minWidth: 130 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#374151", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Est. Cost" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#111827", lineHeight: 1, margin: 0 }, children: fmtGbp(filtCost) })
          ] })
        ] });
      })(),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden", children: opsQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-12 text-center text-gray-400", children: "Loading…" }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-12 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Shovel, { className: "w-12 h-12 text-gray-300 mx-auto mb-3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 font-medium", children: "No operations logged yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-400 text-sm mt-1", children: 'Click "Log Operation" to record your first field activity.' })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-gray-50 border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wide", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Field" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Operation" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Vehicle" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Implement" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Depth / Qty" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Area (ha)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Hrs / Cost" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold", children: "Operator" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-semibold sr-only", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-gray-100", children: filtered.map((r) => {
          const cat = getCategoryForType(r.operationType);
          const badgeCls = CATEGORY_BADGE_COLORS[cat] ?? "bg-gray-100 text-gray-700";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50 transition-colors", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-gray-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "w-3.5 h-3.5 text-gray-400" }),
              fmt(r.operationDate)
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 font-medium text-gray-900", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-3.5 h-3.5 text-gray-400 shrink-0" }),
              r.fieldName
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badgeCls}`, children: labelForType(r.operationType) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-gray-600", children: r.vehicleDescription ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tractor, { className: "w-3.5 h-3.5 text-gray-400 shrink-0" }),
              r.vehicleDescription
            ] }) : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-gray-600", children: r.implement ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { className: "w-3.5 h-3.5 text-gray-400 shrink-0" }),
              r.implement
            ] }) : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-gray-600", children: [
              r.workingDepthCm ? `${r.workingDepthCm} cm` : "",
              r.quantity ? `${r.quantity}${r.quantityUnit ? ` ${r.quantityUnit}` : ""}` : "",
              !r.workingDepthCm && !r.quantity ? "—" : "",
              r.passes && r.passes > 1 ? ` · ${r.passes}×` : ""
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-gray-600", children: r.areaHa ? parseFloat(r.areaHa).toFixed(2) : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-gray-600", children: r.isContractor ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs space-y-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-violet-700 font-medium", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "w-3 h-3" }),
                " Contractor"
              ] }),
              r.contractorCostPence ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-600", children: fmtGbp(r.contractorCostPence / 100) }) : null
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs space-y-0.5", children: [
              r.machineHours ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Tractor, { className: "w-3 h-3 text-gray-400" }),
                fmtHrs(parseFloat(r.machineHours))
              ] }) : null,
              r.labourHours ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3 text-gray-400" }),
                fmtHrs(parseFloat(r.labourHours))
              ] }) : null,
              computeOpCost(r) > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 font-medium text-green-700", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(PoundSterling, { className: "w-3 h-3" }),
                fmtGbp(computeOpCost(r)).replace("£", "")
              ] }) : null,
              !r.machineHours && !r.labourHours ? "—" : null
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-gray-600", children: r.operator || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  variant: "ghost",
                  onClick: () => setViewRecord(r),
                  className: "h-7 w-7 p-0 text-gray-400 hover:text-green-600",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  variant: "ghost",
                  onClick: () => openEdit(r),
                  className: "h-7 w-7 p-0 text-gray-400 hover:text-blue-600",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  variant: "ghost",
                  onClick: () => setConfirmDelete(r.id),
                  className: "h-7 w-7 p-0 text-gray-400 hover:text-red-600",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" })
                }
              )
            ] }) })
          ] }, r.id);
        }) })
      ] }) }) }),
      filtered.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400 text-right", children: [
        "Showing ",
        filtered.length,
        " of ",
        records.length,
        " records"
      ] })
    ] }),
    costByField.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          className: "w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors",
          onClick: () => setShowCostSummary((v) => !v),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 font-semibold text-gray-800", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(PoundSterling, { className: "w-4 h-4 text-green-600" }),
              "Cost Summary by Field — ",
              cropYearLabel(cropYear),
              thisYearCost > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-normal text-green-700 ml-2", children: [
                "Total: ",
                fmtGbp(thisYearCost)
              ] })
            ] }),
            showCostSummary ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "w-4 h-4 text-gray-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-4 h-4 text-gray-400" })
          ]
        }
      ),
      showCostSummary && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-gray-100 overflow-x-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 font-semibold", children: "Field" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 font-semibold text-right", children: "Operations" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 font-semibold text-right", children: "Machine Hrs" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 font-semibold text-right", children: "Labour Hrs" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 font-semibold text-right", children: "Est. Cost" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 font-semibold text-right", children: "Cost / ha" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-gray-100", children: [
            costByField.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 font-medium text-gray-900", children: row.fieldName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-right text-gray-600", children: row.ops }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-right text-gray-600", children: row.machineHrs > 0 ? `${row.machineHrs.toFixed(1)} hrs` : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-right text-gray-600", children: row.labourHrs > 0 ? `${row.labourHrs.toFixed(1)} hrs` : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-right font-semibold text-green-700", children: fmtGbp(row.cost) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-right text-gray-500 text-xs", children: row.cost > 0 && row.areaHa > 0 ? fmtGbp(row.cost / row.areaHa) + "/ha" : "—" })
            ] }, row.fieldName)),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-gray-50 font-semibold border-t-2 border-gray-200", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-gray-900", children: "Total" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-right text-gray-700", children: thisYearRecords.length }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-right text-gray-700", children: thisYearMachineHrs > 0 ? `${thisYearMachineHrs.toFixed(1)} hrs` : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-right text-gray-700", children: thisYearLabourHrs > 0 ? `${thisYearLabourHrs.toFixed(1)} hrs` : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-right text-green-700", children: fmtGbp(thisYearCost) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-right text-gray-400", children: "—" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 px-4 py-2", children: "Cost estimates based on rates entered per operation. Operations without rate data show as —." })
      ] })
    ] }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 520 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Field Operation" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: fmt(viewRecord.operationDate) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Field" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewRecord.fieldName || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Operation" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: labelForType(viewRecord.operationType) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Operator" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewRecord.operator || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Vehicle" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewRecord.vehicleDescription || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Implement" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewRecord.implement || "—" })
          ] }),
          viewRecord.workingDepthCm && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Working Depth" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              viewRecord.workingDepthCm,
              " cm"
            ] })
          ] }),
          viewRecord.passes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Passes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewRecord.passes })
          ] }),
          viewRecord.areaHa && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Area (ha)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: parseFloat(viewRecord.areaHa).toFixed(2) })
          ] }),
          viewRecord.quantity && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Quantity" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              viewRecord.quantity,
              viewRecord.quantityUnit ? ` ${viewRecord.quantityUnit}` : ""
            ] })
          ] })
        ] }),
        (viewRecord.machineHours || viewRecord.labourHours || viewRecord.isContractor) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-gray-100 pt-3 space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 uppercase font-medium flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3" }),
            " Time & Cost"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: viewRecord.isContractor ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 font-medium mb-0.5", children: "Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-violet-700 font-medium flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "w-3 h-3" }),
                " Contractor"
              ] })
            ] }),
            viewRecord.contractorName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 font-medium mb-0.5", children: "Contractor" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewRecord.contractorName })
            ] }),
            viewRecord.contractorCostPence && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 font-medium mb-0.5", children: "Cost" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-green-700", children: fmtGbp(viewRecord.contractorCostPence / 100) })
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            viewRecord.machineHours && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 font-medium mb-0.5", children: "Machine Hours" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                fmtHrs(parseFloat(viewRecord.machineHours)),
                viewRecord.machineRatePence ? ` @ £${(viewRecord.machineRatePence / 100).toFixed(0)}/hr` : ""
              ] })
            ] }),
            viewRecord.labourHours && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 font-medium mb-0.5", children: "Labour Hours" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                fmtHrs(parseFloat(viewRecord.labourHours)),
                viewRecord.labourRatePence ? ` @ £${(viewRecord.labourRatePence / 100).toFixed(0)}/hr` : ""
              ] })
            ] }),
            computeOpCost(viewRecord) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 font-medium mb-0.5", children: "Estimated Cost" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-green-700", children: fmtGbp(computeOpCost(viewRecord)) })
            ] })
          ] }) })
        ] }),
        viewRecord.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 whitespace-pre-line", children: viewRecord.notes })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5 mr-1" }),
          "Edit"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showDialog, onOpenChange: (o) => {
      setShowDialog(o);
      if (!o) {
        createMut.reset();
        updateMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editId !== null ? "Edit Operation" : "Log Field Operation" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Date ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "date",
                value: form.operationDate,
                onChange: (e) => setForm((f) => ({ ...f, operationDate: e.target.value }))
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Operation Type ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.operationType || "__none__", onValueChange: (v) => v !== "__none__" && handleOpTypeChange(v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { className: "max-h-64 overflow-y-auto", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", disabled: true, children: "Select type…" }),
                OPERATION_GROUPS.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-2 py-1 text-xs text-gray-400 font-semibold uppercase tracking-wide", children: g.label }),
                  g.types.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value))
                ] }, g.label))
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Field ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.fieldId || "__select__", onValueChange: handleFieldSelect, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select field…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__select__", disabled: true, children: "Select field…" }),
                (fieldsQ.data ?? []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__noop__", disabled: true, children: "No fields registered — add fields in Fields & Crops" }),
                (fieldsQ.data ?? []).map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: f.id.toString(), children: f.name }, f.id))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Area (ha)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                step: "0.01",
                placeholder: "0.00",
                value: form.areaHa,
                onChange: (e) => {
                  setAreaAutoSource(null);
                  setForm((f) => ({ ...f, areaHa: e.target.value }));
                }
              }
            ),
            areaAutoSource && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-700 flex items-center gap-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "↑ Auto-filled from ",
              areaAutoSource,
              ". Edit if the worked area differs."
            ] }) }),
            (() => {
              const fieldsArr = fieldsQ?.data ?? [];
              const fr = fieldsArr.find((f) => String(f.id) === String(form.fieldId));
              const area = form.areaHa ? parseFloat(String(form.areaHa)) : null;
              if (fr?.areaHectares && area && area > Number(fr.areaHectares)) {
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-red-600 mt-0", children: [
                  "Exceeds ",
                  fr.name,
                  "'s total area (",
                  Number(fr.areaHectares).toFixed(2),
                  " ha) — please correct before saving."
                ] });
              }
              return null;
            })()
          ] })
        ] }),
        typeDef && (typeDef.hasDepth || typeDef.hasPasses) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }, children: [
          typeDef.hasDepth && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Working Depth (cm)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                placeholder: "e.g. 25",
                value: form.workingDepthCm,
                onChange: (e) => setForm((f) => ({ ...f, workingDepthCm: e.target.value }))
              }
            )
          ] }),
          typeDef.hasPasses && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "No. of Passes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                min: "1",
                placeholder: "1",
                value: form.passes,
                onChange: (e) => setForm((f) => ({ ...f, passes: e.target.value }))
              }
            )
          ] })
        ] }),
        typeDef && typeDef.hasQuantity && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: typeDef.quantityLabel ?? "Quantity" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                step: "0.001",
                placeholder: "0",
                value: form.quantity,
                onChange: (e) => setForm((f) => ({ ...f, quantity: e.target.value }))
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Unit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.quantityUnit || "__none__", onValueChange: (v) => setForm((f) => ({ ...f, quantityUnit: v === "__none__" ? "" : v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Unit" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Select…" }),
                unitsForType(form.operationType).map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: u, children: u }, u))
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vehicle / Tractor" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: form.vehicleId || "__none__",
              onValueChange: (v) => {
                if (v === "__none__") {
                  setForm((f) => ({ ...f, vehicleId: "", vehicleDescription: "" }));
                  return;
                }
                const eq = equipmentList.find((e) => e.id.toString() === v);
                const label = eq ? eqDisplayName(eq) + (eq.registrationNumber ? ` (${eq.registrationNumber})` : "") : "";
                setForm((f) => ({ ...f, vehicleId: v, vehicleDescription: label }));
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select vehicle…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "None / N/A" }),
                  vehicleEquipment.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: e.id.toString(), children: [
                    eqDisplayName(e),
                    e.registrationNumber ? ` (${e.registrationNumber})` : ""
                  ] }, e.id))
                ] })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Implement / Machinery" }),
              suggestedImplements.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full", children: [
                suggestedImplements.length,
                " suggested"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: form.implementId || "__none__",
                onValueChange: (v) => {
                  if (v === "__none__") {
                    setForm((f) => ({ ...f, implementId: "", implement: "" }));
                    return;
                  }
                  const eq = equipmentList.find((e) => e.id.toString() === v);
                  const label = eq ? eqDisplayName(eq) : "";
                  setForm((f) => ({ ...f, implementId: v, implement: label }));
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select implement…" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "None / N/A" }),
                    suggestedImplements.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectSeparator, {}),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectGroup, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectLabel, { className: "text-[10px] font-semibold text-emerald-700 uppercase tracking-wide px-2 py-1", children: [
                          "Suggested for ",
                          labelForType(form.operationType)
                        ] }),
                        suggestedImplements.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: e.id.toString(), children: eqDisplayName(e) }, e.id))
                      ] }),
                      otherImplements.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectSeparator, {}),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectGroup, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectLabel, { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-2 py-1", children: "Other Implements" }),
                          otherImplements.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: e.id.toString(), children: eqDisplayName(e) }, e.id))
                        ] })
                      ] })
                    ] }) : implementEquipment.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: e.id.toString(), children: eqDisplayName(e) }, e.id))
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Operator" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              StaffSelect,
              {
                value: form.operator,
                onChange: (v) => setForm((f) => ({ ...f, operator: v })),
                staffNames,
                loading: membersLoading
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-gray-100 pt-4 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3.5 h-3.5" }),
            " Time & Cost"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setForm((f) => ({ ...f, isContractor: !f.isContractor, machineHours: "", labourHours: "", machineRatePence: "", labourRatePence: "" })),
                className: `relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${form.isContractor ? "bg-violet-600" : "bg-gray-200"}`,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.isContractor ? "translate-x-4" : "translate-x-0"}` })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "cursor-pointer mb-0", onClick: () => setForm((f) => ({ ...f, isContractor: !f.isContractor })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "w-3.5 h-3.5 inline mr-1 text-violet-600" }),
              "Contractor operation"
            ] })
          ] }),
          form.isContractor ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Contractor Name" }),
              farmId && /* @__PURE__ */ jsxRuntimeExports.jsx(BuyerCombobox, { farmId, types: ["contractor", "general"], valueId: form.contractorSupplierId ?? null, valueName: form.contractorName, onChange: (id, name) => setForm((f) => ({ ...f, contractorSupplierId: id, contractorName: name })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Total Contractor Cost (£)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  step: "0.01",
                  min: "0",
                  placeholder: "0.00",
                  value: form.contractorCostPence ? (parseInt(form.contractorCostPence) / 100).toFixed(2) : "",
                  onChange: (e) => setForm((f) => ({ ...f, contractorCostPence: e.target.value ? String(Math.round(parseFloat(e.target.value) * 100)) : "" }))
                }
              )
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.75rem", alignItems: "end" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Tractor, { className: "w-3 h-3" }),
                  " Machine Hours"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: "number",
                    step: "0.5",
                    min: "0",
                    placeholder: "0.0",
                    value: form.machineHours,
                    onChange: (e) => setForm((f) => ({ ...f, machineHours: e.target.value }))
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Machine Rate (£/hr)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: "number",
                    step: "1",
                    min: "0",
                    placeholder: "e.g. 55",
                    value: form.machineRatePence ? (parseInt(form.machineRatePence) / 100).toFixed(0) : "",
                    onChange: (e) => setForm((f) => ({ ...f, machineRatePence: e.target.value ? String(Math.round(parseFloat(e.target.value) * 100)) : "" }))
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3" }),
                  " Labour Hours ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500 ml-0.5", children: "*" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: "number",
                    step: "0.5",
                    min: "0",
                    placeholder: "0.0",
                    value: form.labourHours,
                    onChange: (e) => setForm((f) => ({ ...f, labourHours: e.target.value })),
                    className: !form.labourHours ? "border-amber-300 focus:border-amber-400" : ""
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Labour Rate (£/hr)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: "number",
                    step: "1",
                    min: "0",
                    placeholder: "e.g. 14",
                    value: form.labourRatePence ? (parseInt(form.labourRatePence) / 100).toFixed(0) : "",
                    onChange: (e) => setForm((f) => ({ ...f, labourRatePence: e.target.value ? String(Math.round(parseFloat(e.target.value) * 100)) : "" }))
                  }
                )
              ] })
            ] }),
            (form.machineHours || form.labourHours) && (form.machineRatePence || form.labourRatePence) && (() => {
              const mCost = parseFloat(form.machineHours || "0") * (parseInt(form.machineRatePence || "0") / 100);
              const lCost = parseFloat(form.labourHours || "0") * (parseInt(form.labourRatePence || "0") / 100);
              const total = mCost + lCost;
              return total > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-700 font-medium", children: [
                "Estimated cost: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: fmtGbp(total) }),
                mCost > 0 && ` · Machine: ${fmtGbp(mCost)}`,
                lCost > 0 && ` · Labour: ${fmtGbp(lCost)}`
              ] }) : null;
            })()
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              placeholder: "Soil conditions, observations, any problems…",
              value: form.notes,
              onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })),
              rows: 3
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: createMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: updateMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShowDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleSubmit, disabled: isBusy, children: isBusy ? "Saving…" : editId !== null ? "Update Operation" : "Log Operation" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: confirmDelete !== null, onOpenChange: (o) => {
      if (!o) {
        setConfirmDelete(null);
        deleteMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "24rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Operation?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "This will permanently remove this field operation record. This cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setConfirmDelete(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "destructive",
            disabled: deleteMut.isPending,
            onClick: () => confirmDelete !== null && deleteMut.mutate(confirmDelete),
            children: deleteMut.isPending ? "Deleting…" : "Delete"
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  FieldOperationsPage as default
};
