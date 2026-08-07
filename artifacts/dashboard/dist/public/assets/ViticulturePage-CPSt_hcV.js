import { W as Wine, B as Beaker, D as Droplet, a as WINERY_VIEW_ADDITIONS_EVENT, u as useCrud, b as BatchTrailQuickSearch, O as OverviewTab, V as VineRegisterTab, c as BlocksTab, d as VineyardBlockMapTab, P as PhenologyTab, e as OperationsTab, H as HarvestTab, S as ScoutingTab, L as LicensingTab, E as ExciseDutyTab, T as TastingsToursTab, A as AgeVerificationTab, f as WineProductionTab, g as WineryStockTab, h as HarvestReceptionTab, i as PressingRecordsTab, F as FermentationRecordsTab, j as VesselRegisterTab, C as CellarOpsTab, k as BottlingRecordsTab, l as So2TestingTab, m as EquipmentRegisterTab, G as GiComplianceTab, n as SprayDiaryTab, o as SoilAnalysisTab, p as ViticulturalAnalyticsTab, q as VintageSeasonReportTab, r as ViticulturalEnterpriseReport } from "./VineyardBlockMapTab-C3mTKZB6.js";
import { s, t, v, w, x, y, R, z, I, U, J, K, M, N, Q, X, Y, Z, _, $, a0, a1 } from "./VineyardBlockMapTab-C3mTKZB6.js";
import { b as useAppStore, K as Map, U as FlaskConical, r as reactExports, j as jsxRuntimeExports, d as Button } from "./index-Ds3qXTXl.js";
import { R as RaiseTaskDialog } from "./RaiseTaskDialog-CiZnBM9u.js";
import { e as ChartColumn, c as ClipboardList, S as Sprout, Y as Scissors, $ as Grape, r as Bug, G as Gauge, d as Wrench, B as BookOpen, T as TrendingUp, A as AppLayout } from "./AppLayout-gD7smBMK.js";
import { T as TabBar, a as TabButton } from "./tab-button-DhhDn-mM.js";
import { u as usePersistedTab } from "./use-persisted-tab-BkSWRSa_.js";
import { L as Leaf } from "./triangle-alert-PJXwwVnR.js";
import { F as FileText } from "./shield-alert-CScPgq-N.js";
import { R as Receipt } from "./receipt-m6ZpbD8l.js";
import { C as CalendarCheck } from "./calendar-check-DBqa77pc.js";
import { S as ShieldCheck } from "./shield-check-C14av2OH.js";
import { P as Package } from "./use-safe-clerk-XvRfZiHM.js";
import { A as Award } from "./award-BcguUR0p.js";
import { C } from "./confirm-dialog-FNKlITHY.js";
import "./circle-check-cBF89s-p.js";
import "./circle-x-CeFa3QP1.js";
import "./use-farm-name-BtNXk3HT.js";
import "./RecordAttachments-Db01xsc0.js";
import "./use-upload-DeZftziG.js";
import "./paperclip-DTuoAiz7.js";
import "./upload-B63nPi0q.js";
import "./image-BvYFDEGG.js";
import "./download-ECJ_mIsA.js";
import "./textarea-C9LnoljT.js";
import "./badge-q4Dm4D6y.js";
import "./select-Ds2cGH5k.js";
import "./index-C-AJI0p9.js";
import "./index-DhrpWCQs.js";
import "./trash-2-VSnlTP8U.js";
import "./chevron-up-Bdcaj78K.js";
import "./use-lookup-DgCYHyLw.js";
import "./use-persisted-filter-CJdGyPtw.js";
import "./api-Dhdsf4oM.js";
import "./file-down-C6pHYQkc.js";
import "./printer-Bf3wQ4Qq.js";
import "./external-link-C4ZMx6p-.js";
import "./camera-B3WqdzNZ.js";
import "./star-DhvZo_EI.js";
import "./staff-select-B8CZndmH.js";
import "./pencil-D9no5hvh.js";
import "./print-labels-BcWVAilU.js";
import "./print-report-B_FwCCVJ.js";
import "./use-farm-members-Cy_PmOjk.js";
import "./tractor-BmsewAim.js";
import "./user-check-DWLgK9BF.js";
import "./generateCategoricalChart-B7JM6Xey.js";
import "./BarChart-I2wKZC3l.js";
import "./CartesianGrid-BKPC_qWi.js";
import "./eye-tG5LLDy9.js";
import "./csv-Dr539t8b.js";
import "./chevrons-up-down-CEalG9Mx.js";
import "./globe-ArY4vlPC.js";
import "./YearCompareSelector-CdZJRjf8.js";
import "./Line-BBMr7_N1.js";
import "./LineChart-CpVBhlwK.js";
import "./bottling-csv-BeHtHDhe.js";
import "./search-BgPQ81WU.js";
import "./pen-line-C2HyqoAG.js";
import "./arrow-up-37owQuNw.js";
import "./arrow-up-down-Cnwp2noW.js";
import "./git-branch-BWao7C0c.js";
import "./typeof-WJl3ipnu.js";
import "./database-CtuKqm3A.js";
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
    const h = () => setTab("winery-pressing");
    window.addEventListener(WINERY_VIEW_ADDITIONS_EVENT, h);
    return () => window.removeEventListener(WINERY_VIEW_ADDITIONS_EVENT, h);
  }, [selectedFarmId]);
  const [raiseOpen, setRaiseOpen] = reactExports.useState(false);
  const [highlightBlockId, setHighlightBlockId] = reactExports.useState(void 0);
  const blocks = useCrud(selectedFarmId ?? 0, "vineyard-blocks", "vineyard-blocks");
  const handleNavigate = (toTab, blockId) => {
    setHighlightBlockId(blockId);
    setTab(toTab);
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
      tab.startsWith("winery-") && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-end py-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BatchTrailQuickSearch, { farmId: selectedFarmId }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/30 rounded-xl p-4", children: [
        tab === "overview" && /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewTab, { farmId: selectedFarmId }),
        tab === "vine-register" && /* @__PURE__ */ jsxRuntimeExports.jsx(VineRegisterTab, { farmId: selectedFarmId, blocks: blocks.data, highlightBlockId }),
        tab === "blocks" && /* @__PURE__ */ jsxRuntimeExports.jsx(BlocksTab, { farmId: selectedFarmId, onNavigate: handleNavigate }),
        tab === "block-map" && /* @__PURE__ */ jsxRuntimeExports.jsx(VineyardBlockMapTab, { farmId: selectedFarmId, blocks: blocks.data, onNavigate: handleNavigate }),
        tab === "phenology" && /* @__PURE__ */ jsxRuntimeExports.jsx(PhenologyTab, { farmId: selectedFarmId, blocks: blocks.data, highlightBlockId }),
        tab === "operations" && /* @__PURE__ */ jsxRuntimeExports.jsx(OperationsTab, { farmId: selectedFarmId, blocks: blocks.data, highlightBlockId }),
        tab === "harvest" && /* @__PURE__ */ jsxRuntimeExports.jsx(HarvestTab, { farmId: selectedFarmId, blocks: blocks.data, highlightBlockId }),
        tab === "scouting" && /* @__PURE__ */ jsxRuntimeExports.jsx(ScoutingTab, { farmId: selectedFarmId, blocks: blocks.data, highlightBlockId }),
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
        tab === "spray-diary" && /* @__PURE__ */ jsxRuntimeExports.jsx(SprayDiaryTab, { farmId: selectedFarmId, blocks: blocks.data }),
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
  s as BBCH_STAGES,
  BlocksTab,
  C as ConfirmDialog,
  t as DataTable,
  v as Empty,
  ExciseDutyTab,
  w as FarmSettingsWarning,
  GiComplianceTab,
  HarvestTab,
  LicensingTab,
  x as OPERATION_TYPES,
  OperationsTab,
  OverviewTab,
  y as PRESSURE_LABELS,
  PhenologyTab,
  R as RaiseTaskBtn,
  z as SO2Chip,
  ScoutingTab,
  SoilAnalysisTab,
  SprayDiaryTab,
  I as StatCard,
  TastingsToursTab,
  U as UK_GRAPE_VARIETIES,
  J as UK_ROOTSTOCKS,
  K as VIVC_VARIETY_MAP,
  M as ViewField,
  VineRegisterTab,
  WineProductionTab,
  WineryStockTab,
  ViticulturePage as default,
  N as exportCSV,
  Q as fmt,
  X as fmtDate,
  Y as fmtNum,
  Z as printExciseReturn,
  _ as printOrganicWineRecords,
  $ as printVineRegister,
  a0 as today,
  useCrud,
  a1 as useFarmMeta
};
