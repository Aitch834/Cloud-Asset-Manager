import { W as Wine, B as Beaker, D as Droplet, a as WINERY_VIEW_ADDITIONS_EVENT, u as useCrud, b as BatchTrailQuickSearch, O as OverviewTab, V as VineRegisterTab, c as BlocksTab, d as VineyardBlockMapTab, P as PhenologyTab, e as OperationsTab, H as HarvestTab, S as ScoutingTab, L as LicensingTab, E as ExciseDutyTab, T as TastingsToursTab, A as AgeVerificationTab, f as WineProductionTab, g as WineryStockTab, h as HarvestReceptionTab, i as PressingRecordsTab, F as FermentationRecordsTab, j as VesselRegisterTab, C as CellarOpsTab, k as BottlingRecordsTab, l as So2TestingTab, m as EquipmentRegisterTab, G as GiComplianceTab, n as SprayDiaryTab, o as SoilAnalysisTab, p as ViticulturalAnalyticsTab, q as VintageSeasonReportTab, r as ViticulturalEnterpriseReport } from "./VineyardBlockMapTab-DMTNg8v8.js";
import { s, t, v, w, x, R, y, z, U, I, J, K, M, N, Q, X, Y, Z } from "./VineyardBlockMapTab-DMTNg8v8.js";
import { b as useAppStore, K as Map, U as FlaskConical, r as reactExports, j as jsxRuntimeExports, d as Button } from "./index-CL7I2SfF.js";
import { R as RaiseTaskDialog } from "./RaiseTaskDialog-U8a9uDrx.js";
import { e as ChartColumn, c as ClipboardList, S as Sprout, Y as Scissors, $ as Grape, r as Bug, G as Gauge, d as Wrench, B as BookOpen, T as TrendingUp, A as AppLayout } from "./AppLayout-swjhJeIk.js";
import { T as TabBar, a as TabButton } from "./tab-button-Dwo8f2lw.js";
import { u as usePersistedTab } from "./use-persisted-tab-VtQWzGlg.js";
import { L as Leaf } from "./triangle-alert-gAXTnZz-.js";
import { F as FileText } from "./shield-alert-e7MkaN-1.js";
import { R as Receipt } from "./receipt-1zMSIHO8.js";
import { C as CalendarCheck } from "./calendar-check-GCrADnJ7.js";
import { S as ShieldCheck } from "./shield-check-C2_xWcp4.js";
import { P as Package } from "./use-safe-clerk-VdTi7dYa.js";
import { A as Award } from "./award-DntqkC9Y.js";
import { C } from "./confirm-dialog-CtkPoyIK.js";
import "./circle-check-O6Peh1Cq.js";
import "./circle-x-DRSW8IN7.js";
import "./RecordAttachments-C3Q-J0Sd.js";
import "./use-upload-DjBKCXsp.js";
import "./paperclip-6M7ltjbw.js";
import "./upload-CGIcn5Yw.js";
import "./image-1K2v61jJ.js";
import "./download-DI28UKLe.js";
import "./textarea-F9glM0Jr.js";
import "./badge-xl1M8AUf.js";
import "./select-C29E8xvM.js";
import "./index-BIAhg7-a.js";
import "./index-Dr3FEjNy.js";
import "./trash-2-B9QM90sQ.js";
import "./chevron-up-xjqksvvm.js";
import "./use-lookup-ChLH8Q4Z.js";
import "./file-down-BmLyamjz.js";
import "./api-Dhdsf4oM.js";
import "./staff-select-Cc51MgLm.js";
import "./use-farm-name-B80qeXfl.js";
import "./printer-B5Is06hI.js";
import "./pencil-DPmB3pBI.js";
import "./tractor-DFDGZlbe.js";
import "./generateCategoricalChart-C1AJvGEX.js";
import "./BarChart-BYrzCIV8.js";
import "./CartesianGrid-Ce-7uw_K.js";
import "./eye-BVYaZZbC.js";
import "./csv-Dr539t8b.js";
import "./globe-BpDnCREB.js";
import "./Line-hKFWkFLS.js";
import "./LineChart-jcioyjNE.js";
import "./bottling-csv-BeHtHDhe.js";
import "./search-CNf2kDbS.js";
import "./pen-line-CuTscSPX.js";
import "./arrow-up-CphySRYH.js";
import "./arrow-up-down-qKa-gaBd.js";
import "./git-branch-D6zNlTN6.js";
import "./typeof-WJl3ipnu.js";
import "./use-persisted-filter-BnUxu9fq.js";
import "./database-BZBY5KTM.js";
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
  const blocks = useCrud(selectedFarmId ?? 0, "vineyard-blocks", "vineyard-blocks");
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
        tab === "vine-register" && /* @__PURE__ */ jsxRuntimeExports.jsx(VineRegisterTab, { farmId: selectedFarmId, blocks: blocks.data }),
        tab === "blocks" && /* @__PURE__ */ jsxRuntimeExports.jsx(BlocksTab, { farmId: selectedFarmId }),
        tab === "block-map" && /* @__PURE__ */ jsxRuntimeExports.jsx(VineyardBlockMapTab, { farmId: selectedFarmId, blocks: blocks.data }),
        tab === "phenology" && /* @__PURE__ */ jsxRuntimeExports.jsx(PhenologyTab, { farmId: selectedFarmId, blocks: blocks.data }),
        tab === "operations" && /* @__PURE__ */ jsxRuntimeExports.jsx(OperationsTab, { farmId: selectedFarmId, blocks: blocks.data }),
        tab === "harvest" && /* @__PURE__ */ jsxRuntimeExports.jsx(HarvestTab, { farmId: selectedFarmId, blocks: blocks.data }),
        tab === "scouting" && /* @__PURE__ */ jsxRuntimeExports.jsx(ScoutingTab, { farmId: selectedFarmId, blocks: blocks.data }),
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
  GiComplianceTab,
  HarvestTab,
  LicensingTab,
  w as OPERATION_TYPES,
  OperationsTab,
  OverviewTab,
  x as PRESSURE_LABELS,
  PhenologyTab,
  R as RaiseTaskBtn,
  y as SO2Chip,
  ScoutingTab,
  SoilAnalysisTab,
  SprayDiaryTab,
  z as StatCard,
  TastingsToursTab,
  U as UK_GRAPE_VARIETIES,
  I as UK_ROOTSTOCKS,
  J as ViewField,
  VineRegisterTab,
  WineProductionTab,
  WineryStockTab,
  ViticulturePage as default,
  K as exportCSV,
  M as fmt,
  N as fmtDate,
  Q as fmtNum,
  X as printExciseReturn,
  Y as printOrganicWineRecords,
  Z as today,
  useCrud
};
