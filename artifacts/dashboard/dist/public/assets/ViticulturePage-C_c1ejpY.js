import { a as useCrud, F as FsaCompletenessBar } from "./shared-B-WsI3O2.js";
import { B, D, E, b, O, P, R, S, U, c, V, d, e, f, g, h, p, i, j, k, l, m, n, t, u } from "./shared-B-WsI3O2.js";
import { W as Wine, B as Beaker, D as Droplet, a as WINERY_VIEW_ADDITIONS_EVENT, b as BatchTrailQuickSearch, O as OverviewTab, V as VineRegisterTab, c as BlocksTab, d as VineyardBlockMapTab, P as PhenologyTab, e as OperationsTab, H as HarvestTab, S as ScoutingTab, L as LicensingTab, E as ExciseDutyTab, T as TastingsToursTab, A as AgeVerificationTab, f as WineProductionTab, g as WineryStockTab, h as HarvestReceptionTab, i as PressingRecordsTab, F as FermentationRecordsTab, j as VesselRegisterTab, C as CellarOpsTab, k as BottlingRecordsTab, l as So2TestingTab, m as EquipmentRegisterTab, G as GiComplianceTab, n as SprayDiaryTab, o as SoilAnalysisTab, p as ViticulturalAnalyticsTab, q as VintageSeasonReportTab, r as ViticulturalEnterpriseReport } from "./VineyardBlockMapTab-B81JwsJM.js";
import { s } from "./VineyardBlockMapTab-B81JwsJM.js";
import { b as useAppStore, K as Map, U as FlaskConical, r as reactExports, j as jsxRuntimeExports, d as Button } from "./index-C01S0eoM.js";
import { R as RaiseTaskDialog } from "./RaiseTaskDialog-BDUcgEEG.js";
import { e as ChartColumn, c as ClipboardList, S as Sprout, Y as Scissors, $ as Grape, r as Bug, G as Gauge, d as Wrench, B as BookOpen, T as TrendingUp, A as AppLayout } from "./AppLayout-BBU29tus.js";
import { T as TabBar, a as TabButton } from "./tab-button-DliTfobX.js";
import { u as usePersistedTab } from "./use-persisted-tab-C_r_zdLc.js";
import { L as Leaf } from "./triangle-alert-y2ryCWUo.js";
import { F as FileText } from "./shield-alert-BpPdx906.js";
import { R as Receipt } from "./receipt-BaQ-mtmN.js";
import { C as CalendarCheck } from "./calendar-check-0xHXaRwv.js";
import { S as ShieldCheck } from "./shield-check-Cj6v0s6D.js";
import { P as Package } from "./use-safe-clerk-BkBCH5US.js";
import { A as Award } from "./award-BCIY4VHS.js";
import { C } from "./confirm-dialog-fxRGoJcg.js";
import "./csv-Dr539t8b.js";
import "./api-Dhdsf4oM.js";
import "./chevron-up-L7JeB3Fz.js";
import "./trash-2-BwZPLCFy.js";
import "./chevrons-up-down-Ck2JON3K.js";
import "./eye-hjRW0AtM.js";
import "./pencil-DCLxYvDZ.js";
import "./circle-check-DBOcy-84.js";
import "./circle-x-DnnPvcCZ.js";
import "./tractor-BobQl5ES.js";
import "./use-farm-name-Dpt8ot_N.js";
import "./RecordAttachments-BjnDwlR7.js";
import "./use-upload-DwTSQN1m.js";
import "./paperclip-CNDrtq4d.js";
import "./upload-B9kChLoJ.js";
import "./image-CVnRo_3Y.js";
import "./download-Ch57SsCQ.js";
import "./textarea-W-HMOS5T.js";
import "./badge-B-gNe0tm.js";
import "./select-BVr8_FSX.js";
import "./index-DuRyzeyJ.js";
import "./index-DJ-pa9Rz.js";
import "./use-lookup-48BL6q9z.js";
import "./use-persisted-filter-4GlzQNgE.js";
import "./link-Bru2UiAx.js";
import "./file-down-D63bIZpN.js";
import "./globe-D3SNQMgj.js";
import "./printer-C_StnCT1.js";
import "./arrow-left-right-DvzZlpXS.js";
import "./external-link-CnAFAwEW.js";
import "./core.esm-Cjv1VnDx.js";
import "./camera-2XbiV07j.js";
import "./star-DQyS-uN8.js";
import "./staff-select-DyoV-7VE.js";
import "./dropdown-menu-37RP1w7O.js";
import "./index-Cw6lSEnq.js";
import "./circle-Dqn5sS6I.js";
import "./generateCategoricalChart-DCMMXlZV.js";
import "./ComposedChart-Bz4QZtp5.js";
import "./Area-DlaceNjz.js";
import "./Line-p45c_LBf.js";
import "./CartesianGrid-CfcdsNi9.js";
import "./print-labels-BbTZmrMS.js";
import "./print-report-slff5PK4.js";
import "./use-farm-members-D9knsBOt.js";
import "./user-check-CJks4vd5.js";
import "./BarChart-BF9-73x8.js";
import "./YearCompareSelector-CTvgJSvP.js";
import "./LineChart-DGBEfXy3.js";
import "./bottling-csv-BeHtHDhe.js";
import "./search-CzuqTmz3.js";
import "./pen-line-ZxG9TAuO.js";
import "./arrow-up-DvkeTgGT.js";
import "./arrow-up-down-COVrR-Az.js";
import "./git-branch-9syQvTwh.js";
import "./typeof-WJl3ipnu.js";
import "./database-BgSDgIqb.js";
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
