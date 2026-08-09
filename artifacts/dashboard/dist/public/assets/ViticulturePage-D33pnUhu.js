import { a as useCrud, F as FsaCompletenessBar } from "./shared-YQG0ONNV.js";
import { B, D, E, b, O, P, R, S, U, c, V, d, e, f, g, h, p, i, j, k, l, m, n, t, u } from "./shared-YQG0ONNV.js";
import { W as Wine, B as Beaker, D as Droplet, a as WINERY_VIEW_ADDITIONS_EVENT, b as BatchTrailQuickSearch, O as OverviewTab, V as VineRegisterTab, c as BlocksTab, d as VineyardBlockMapTab, P as PhenologyTab, e as OperationsTab, H as HarvestTab, S as ScoutingTab, L as LicensingTab, E as ExciseDutyTab, T as TastingsToursTab, A as AgeVerificationTab, f as WineProductionTab, g as WineryStockTab, h as HarvestReceptionTab, i as PressingRecordsTab, F as FermentationRecordsTab, j as VesselRegisterTab, C as CellarOpsTab, k as BottlingRecordsTab, l as So2TestingTab, m as EquipmentRegisterTab, G as GiComplianceTab, n as SprayDiaryTab, o as SoilAnalysisTab, p as ViticulturalAnalyticsTab, q as VintageSeasonReportTab, r as ViticulturalEnterpriseReport } from "./VineyardBlockMapTab-DtBmnbiH.js";
import { s } from "./VineyardBlockMapTab-DtBmnbiH.js";
import { b as useAppStore, K as Map, U as FlaskConical, r as reactExports, j as jsxRuntimeExports, d as Button } from "./index-SssA5mtq.js";
import { R as RaiseTaskDialog } from "./RaiseTaskDialog-_2uPU8nv.js";
import { e as ChartColumn, c as ClipboardList, S as Sprout, Y as Scissors, $ as Grape, r as Bug, G as Gauge, d as Wrench, B as BookOpen, T as TrendingUp, A as AppLayout } from "./AppLayout-z4vlO8Mn.js";
import { T as TabBar, a as TabButton } from "./tab-button-BJC6GdxH.js";
import { u as usePersistedTab } from "./use-persisted-tab-DW4ag1mS.js";
import { L as Leaf } from "./triangle-alert-BMFOvC2o.js";
import { F as FileText } from "./shield-alert-RVT43Iez.js";
import { R as Receipt } from "./receipt-Dj3eNgut.js";
import { C as CalendarCheck } from "./calendar-check-CAPENzo4.js";
import { S as ShieldCheck } from "./shield-check-C9TcxGVx.js";
import { P as Package } from "./use-safe-clerk-BqXwrZKf.js";
import { A as Award } from "./award-BZOqeI2A.js";
import { C } from "./confirm-dialog-s2h_i-La.js";
import "./csv-Dr539t8b.js";
import "./api-Dhdsf4oM.js";
import "./chevron-up-CNp919WB.js";
import "./trash-2-B4GqgECm.js";
import "./chevrons-up-down-CJy0Jup5.js";
import "./eye-BxQZR4g-.js";
import "./pencil-BNLLWb9Z.js";
import "./circle-check-ZzUArrra.js";
import "./circle-x-BvWfKygr.js";
import "./tractor-BQszadta.js";
import "./use-farm-name-D9GsZxEo.js";
import "./RecordAttachments-GEiLU09K.js";
import "./use-upload-DMzOnY91.js";
import "./paperclip-fjtWCXnp.js";
import "./upload-BwIOf8Sz.js";
import "./image-DSPKWgeP.js";
import "./download-D0FD6bUY.js";
import "./textarea-bflUIEaw.js";
import "./badge-B0E6S91K.js";
import "./select-6dhlsG3x.js";
import "./index-DO0E5EPi.js";
import "./index-BpvZ74Dt.js";
import "./use-lookup-DcTlITyr.js";
import "./use-persisted-filter-r9e32I64.js";
import "./link-CANmlHma.js";
import "./file-down-Duhfpnzg.js";
import "./globe-CUzfmvyw.js";
import "./printer-oFmjmgap.js";
import "./arrow-left-right-ChHRz5fE.js";
import "./external-link-DcS9ZIKb.js";
import "./core.esm-CpplbG4N.js";
import "./camera-n1mMA8X3.js";
import "./star-DDSTNCCg.js";
import "./staff-select-DXXWzqM3.js";
import "./dropdown-menu-D6pUJLum.js";
import "./index-LSeO7jsP.js";
import "./circle-CJEG0PkP.js";
import "./generateCategoricalChart-BiVsPlGG.js";
import "./ComposedChart-DnGNuGdO.js";
import "./Line-dgd_SusB.js";
import "./CartesianGrid-ChqJ8BTT.js";
import "./print-labels-D13Z7kN1.js";
import "./print-report-slff5PK4.js";
import "./use-farm-members-ChPLP5D2.js";
import "./user-check-ublBleA0.js";
import "./BarChart-BHVr4IVx.js";
import "./YearCompareSelector-By7lH3rM.js";
import "./LineChart-7_vl8NAS.js";
import "./bottling-csv-BeHtHDhe.js";
import "./search-CXmkTJZE.js";
import "./pen-line-DUpl3tXK.js";
import "./arrow-up-DLULd24_.js";
import "./arrow-up-down-adA87UuH.js";
import "./git-branch-C_xF-rh0.js";
import "./typeof-WJl3ipnu.js";
import "./database-BSrZwwIC.js";
const TABS = [
  { id: "overview", label: "Overview", icon: ChartColumn },
  { id: "vine-register", label: "Vine Register", icon: ClipboardList },
  { id: "blocks", label: "Blocks", icon: Sprout },
  { id: "block-map", label: "Block Map", icon: Map },
  { id: "phenology", label: "Phenology", icon: Leaf },
  { id: "operations", label: "Pruning & Canopy", icon: Scissors },
  { id: "harvest", label: "Harvest", icon: Grape },
  { id: "scouting", label: "Disease Scouting", icon: Bug },
  { id: "licensing", label: "Licensing", icon: FileText },
  { id: "excise", label: "Excise & Duty", icon: Receipt },
  { id: "tours", label: "Tastings & Tours", icon: CalendarCheck },
  { id: "age-check", label: "Age Verification", icon: ShieldCheck },
  { id: "wine-production", label: "Wine Production", icon: Wine },
  { id: "winery-stock", label: "Winery Stock", icon: Package },
  { id: "winery-reception", label: "Grape Intake", icon: Grape },
  { id: "winery-pressing", label: "Pressing Records", icon: Gauge },
  { id: "winery-fermentation", label: "Fermentation", icon: Beaker },
  { id: "winery-vessels", label: "Tank & Vessel Register", icon: Package },
  { id: "winery-cellar-ops", label: "Cellar Operations", icon: Wrench },
  { id: "winery-bottling", label: "Bottling Records", icon: Wine },
  { id: "winery-so2", label: "SO₂ Testing Register", icon: FlaskConical },
  { id: "winery-equipment", label: "Lab Equipment", icon: ShieldCheck },
  { id: "gi-compliance", label: "GI Compliance", icon: Award },
  { id: "spray-diary", label: "Spray Diary", icon: Droplet },
  { id: "soil-analysis", label: "Soil & Leaf Analysis", icon: FlaskConical },
  { id: "analytics", label: "Analytics", icon: ChartColumn },
  { id: "vintage-report", label: "Vintage Report", icon: BookOpen },
  { id: "enterprise-report", label: "Enterprise Report", icon: TrendingUp }
];
function ViticulturePage() {
  const { farmId: selectedFarmId } = useAppStore();
  const [tab, setTab] = usePersistedTab({
    page: "viticulture",
    farmId: selectedFarmId,
    validIds: TABS.map((t2) => t2.id),
    defaultTab: "overview"
  });
  reactExports.useEffect(() => {
    const h2 = () => setTab("winery-pressing");
    window.addEventListener(WINERY_VIEW_ADDITIONS_EVENT, h2);
    return () => window.removeEventListener(WINERY_VIEW_ADDITIONS_EVENT, h2);
  }, [selectedFarmId]);
  const [raiseOpen, setRaiseOpen] = reactExports.useState(false);
  const [highlightBlockId, setHighlightBlockId] = reactExports.useState(void 0);
  const [bulkLinkFor, setBulkLinkFor] = reactExports.useState(null);
  const blocks = useCrud(selectedFarmId ?? 0, "vineyard-blocks", "vineyard-blocks");
  const handleNavigate = (toTab, blockId) => {
    setHighlightBlockId(blockId);
    setTab(toTab);
  };
  const handleNavigateWithBulkLink = (toTab) => {
    setBulkLinkFor(toTab);
    setTab(toTab);
    setTimeout(() => setBulkLinkFor(null), 500);
  };
  if (!selectedFarmId) return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-64 text-muted-foreground", children: "Select a farm to view Viticulture records." }) });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 md:p-6 space-y-4 max-w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-xl font-bold flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grape, { className: "w-5 h-5 text-purple-600" }),
            "Viticulture"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Growing compliance — FSA vine register, blocks, phenology, operations, harvest and disease scouting" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "text-purple-700 border-purple-200 hover:bg-purple-50", onClick: () => setRaiseOpen(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-4 h-4 mr-1" }),
          "Raise Task"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabBar, { children: TABS.map((t2) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === t2.id, onClick: () => setTab(t2.id), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(t2.icon, { className: "w-3.5 h-3.5 mr-1" }),
        t2.label
      ] }, t2.id)) }),
      tab.startsWith("winery-") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FsaCompletenessBar, { farmId: selectedFarmId }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BatchTrailQuickSearch, { farmId: selectedFarmId }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/30 rounded-xl p-4", children: [
        tab === "overview" && /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewTab, { farmId: selectedFarmId, onNavigate: handleNavigate, onNavigateWithBulkLink: handleNavigateWithBulkLink }),
        tab === "vine-register" && /* @__PURE__ */ jsxRuntimeExports.jsx(VineRegisterTab, { farmId: selectedFarmId, blocks: blocks.data, highlightBlockId, onNavigate: handleNavigate }),
        tab === "blocks" && /* @__PURE__ */ jsxRuntimeExports.jsx(BlocksTab, { farmId: selectedFarmId, onNavigate: handleNavigate }),
        tab === "block-map" && /* @__PURE__ */ jsxRuntimeExports.jsx(VineyardBlockMapTab, { farmId: selectedFarmId, blocks: blocks.data, onNavigate: handleNavigate }),
        tab === "phenology" && /* @__PURE__ */ jsxRuntimeExports.jsx(PhenologyTab, { farmId: selectedFarmId, blocks: blocks.data, highlightBlockId, onNavigate: handleNavigate, requestBulkLink: bulkLinkFor === "phenology" }),
        tab === "operations" && /* @__PURE__ */ jsxRuntimeExports.jsx(OperationsTab, { farmId: selectedFarmId, blocks: blocks.data, highlightBlockId, requestBulkLink: bulkLinkFor === "operations" }),
        tab === "harvest" && /* @__PURE__ */ jsxRuntimeExports.jsx(HarvestTab, { farmId: selectedFarmId, blocks: blocks.data, highlightBlockId, requestBulkLink: bulkLinkFor === "harvest" }),
        tab === "scouting" && /* @__PURE__ */ jsxRuntimeExports.jsx(ScoutingTab, { farmId: selectedFarmId, blocks: blocks.data, highlightBlockId, requestBulkLink: bulkLinkFor === "scouting", onNavigate: handleNavigate }),
        tab === "licensing" && /* @__PURE__ */ jsxRuntimeExports.jsx(LicensingTab, { farmId: selectedFarmId }),
        tab === "excise" && /* @__PURE__ */ jsxRuntimeExports.jsx(ExciseDutyTab, { farmId: selectedFarmId }),
        tab === "tours" && /* @__PURE__ */ jsxRuntimeExports.jsx(TastingsToursTab, { farmId: selectedFarmId }),
        tab === "age-check" && /* @__PURE__ */ jsxRuntimeExports.jsx(AgeVerificationTab, { farmId: selectedFarmId }),
        tab === "wine-production" && /* @__PURE__ */ jsxRuntimeExports.jsx(WineProductionTab, { farmId: selectedFarmId }),
        tab === "winery-stock" && /* @__PURE__ */ jsxRuntimeExports.jsx(WineryStockTab, { farmId: selectedFarmId }),
        tab === "winery-reception" && /* @__PURE__ */ jsxRuntimeExports.jsx(HarvestReceptionTab, { farmId: selectedFarmId, blocks: blocks.data }),
        tab === "winery-pressing" && /* @__PURE__ */ jsxRuntimeExports.jsx(PressingRecordsTab, { farmId: selectedFarmId }),
        tab === "winery-fermentation" && /* @__PURE__ */ jsxRuntimeExports.jsx(FermentationRecordsTab, { farmId: selectedFarmId }),
        tab === "winery-vessels" && /* @__PURE__ */ jsxRuntimeExports.jsx(VesselRegisterTab, { farmId: selectedFarmId }),
        tab === "winery-cellar-ops" && /* @__PURE__ */ jsxRuntimeExports.jsx(CellarOpsTab, { farmId: selectedFarmId }),
        tab === "winery-bottling" && /* @__PURE__ */ jsxRuntimeExports.jsx(BottlingRecordsTab, { farmId: selectedFarmId }),
        tab === "winery-so2" && /* @__PURE__ */ jsxRuntimeExports.jsx(So2TestingTab, { farmId: selectedFarmId }),
        tab === "winery-equipment" && /* @__PURE__ */ jsxRuntimeExports.jsx(EquipmentRegisterTab, { farmId: selectedFarmId }),
        tab === "gi-compliance" && /* @__PURE__ */ jsxRuntimeExports.jsx(GiComplianceTab, { farmId: selectedFarmId, blocks: blocks.data }),
        tab === "spray-diary" && /* @__PURE__ */ jsxRuntimeExports.jsx(SprayDiaryTab, { farmId: selectedFarmId, blocks: blocks.data, requestBulkLink: bulkLinkFor === "spray-diary" }),
        tab === "soil-analysis" && /* @__PURE__ */ jsxRuntimeExports.jsx(SoilAnalysisTab, { farmId: selectedFarmId, blocks: blocks.data }),
        tab === "analytics" && /* @__PURE__ */ jsxRuntimeExports.jsx(ViticulturalAnalyticsTab, { farmId: selectedFarmId }),
        tab === "vintage-report" && /* @__PURE__ */ jsxRuntimeExports.jsx(VintageSeasonReportTab, { farmId: selectedFarmId }),
        tab === "enterprise-report" && /* @__PURE__ */ jsxRuntimeExports.jsx(ViticulturalEnterpriseReport, { farmId: selectedFarmId })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      RaiseTaskDialog,
      {
        farmId: selectedFarmId,
        open: raiseOpen,
        onClose: () => setRaiseOpen(false),
        defaultTitle: "Viticulture Task",
        module: "Viticulture"
      }
    )
  ] });
}
export {
  AgeVerificationTab,
  B as BBCH_STAGES,
  BlocksTab,
  C as ConfirmDialog,
  D as DataTable,
  E as Empty,
  ExciseDutyTab,
  b as FarmSettingsWarning,
  FsaCompletenessBar,
  GiComplianceTab,
  HarvestTab,
  LicensingTab,
  O as OPERATION_TYPES,
  OperationsTab,
  OverviewTab,
  P as PRESSURE_LABELS,
  PhenologyTab,
  R as RaiseTaskBtn,
  s as SO2Chip,
  ScoutingTab,
  SoilAnalysisTab,
  SprayDiaryTab,
  S as StatCard,
  TastingsToursTab,
  U as UK_GRAPE_VARIETIES,
  c as UK_ROOTSTOCKS,
  V as VIVC_VARIETY_MAP,
  d as ViewField,
  VineRegisterTab,
  WineProductionTab,
  WineryStockTab,
  ViticulturePage as default,
  e as exportCSV,
  f as fmt,
  g as fmtDate,
  h as fmtNum,
  p as printDiseaseScouting,
  i as printExciseReturn,
  j as printHarvest,
  k as printOperations,
  l as printOrganicWineRecords,
  m as printSprayRecords,
  n as printVineRegister,
  t as today,
  useCrud,
  u as useFarmMeta
};
