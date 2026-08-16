import { a as useCrud, F as FsaCompletenessBar } from "./shared-hnNgw5M0.js";
import { B, D, E, b, O, P, R, S, U, c, V, d, e, f, g, h, i, p, j, k, l, m, n, o, q, r, t, u } from "./shared-hnNgw5M0.js";
import { W as Wine, B as Beaker, D as Droplet, a as WINERY_VIEW_ADDITIONS_EVENT, b as BatchTrailQuickSearch, O as OverviewTab, V as VineRegisterTab, c as BlocksTab, d as VineyardBlockMapTab, P as PhenologyTab, e as OperationsTab, H as HarvestTab, S as ScoutingTab, L as LicensingTab, E as ExciseDutyTab, T as TastingsToursTab, A as AgeVerificationTab, f as WineProductionTab, g as WineryStockTab, h as HarvestReceptionTab, i as PressingRecordsTab, F as FermentationRecordsTab, j as VesselRegisterTab, C as CellarOpsTab, k as BottlingRecordsTab, l as So2TestingTab, m as EquipmentRegisterTab, G as GiComplianceTab, n as SprayDiaryTab, o as SoilAnalysisTab, p as ViticulturalAnalyticsTab, q as VintageSeasonReportTab, r as ViticulturalEnterpriseReport } from "./VineyardBlockMapTab-Bdrc684D.js";
import { s } from "./VineyardBlockMapTab-Bdrc684D.js";
import { b as useAppStore, K as Map, U as FlaskConical, r as reactExports, m as useQuery, j as jsxRuntimeExports, e as LoaderCircle, d as Button } from "./index-1TyBJonr.js";
import { R as RaiseTaskDialog } from "./RaiseTaskDialog-0x3Dh_ol.js";
import { e as ChartColumn, c as ClipboardList, S as Sprout, Y as Scissors, $ as Grape, r as Bug, G as Gauge, d as Wrench, B as BookOpen, T as TrendingUp, A as AppLayout } from "./AppLayout-Ct04za5p.js";
import { T as TabBar, a as TabButton } from "./tab-button-DmjkvX7K.js";
import { u as usePersistedTab } from "./use-persisted-tab-DWPxKAwF.js";
import { L as Leaf } from "./triangle-alert-DsHTnLix.js";
import { F as FileText, S as ShieldAlert } from "./shield-alert-HvE4k3Y1.js";
import { R as Receipt } from "./receipt-Cov5LkzK.js";
import { C as CalendarCheck } from "./tooltip-BytUTjNw.js";
import { S as ShieldCheck } from "./shield-check-DLKM_Y6O.js";
import { P as Package } from "./use-safe-clerk-CnbchdBc.js";
import { A as Award } from "./award-D6jHdIqU.js";
import { C } from "./confirm-dialog-C8OiEtbu.js";
import "./csv-BwoSy5Nc.js";
import "./api-Dhdsf4oM.js";
import "./chevron-up-Cu3yqhgf.js";
import "./trash-2-CQ3Z3qSp.js";
import "./chevrons-up-down-BMwsKAuj.js";
import "./eye-D8VO7eyf.js";
import "./pencil-CvfAa2rk.js";
import "./circle-check-BC3Ef8OE.js";
import "./circle-x-DBfXC4n1.js";
import "./globe-DAXfT8Q-.js";
import "./tractor-B9_Yw-yZ.js";
import "./use-farm-name-D1ZXU57g.js";
import "./RecordAttachments-DA40kBja.js";
import "./use-upload-CFPm_4O_.js";
import "./paperclip-CqFfYkCI.js";
import "./upload-DwSA0M1u.js";
import "./image-D5xsmKVK.js";
import "./download-DxZijB9i.js";
import "./textarea-tKk6VVef.js";
import "./badge-D6LXkxRl.js";
import "./select-CYT5_QC1.js";
import "./index-zPD8YLeB.js";
import "./index-DpXLYMpC.js";
import "./use-lookup-Bc7KE0qe.js";
import "./use-persisted-filter-DMdqrNel.js";
import "./link-CLeJIRfe.js";
import "./file-down-Be3kVfM5.js";
import "./printer-DnWp0geJ.js";
import "./mail-DQMDRxSr.js";
import "./arrow-left-right-C0LGUrzh.js";
import "./external-link-ClHleWTT.js";
import "./core.esm-pwIOW90L.js";
import "./camera-g46ryZje.js";
import "./star-385HKYvB.js";
import "./staff-select-zgsp-_Wq.js";
import "./dropdown-menu-DNhYAowU.js";
import "./index-B5u68H3a.js";
import "./circle-BU_aEQFr.js";
import "./generateCategoricalChart-D7AQvTAg.js";
import "./ComposedChart-CgcA0kCG.js";
import "./Area-BUJ3dLJs.js";
import "./Line-D8qz4U0w.js";
import "./CartesianGrid-BA2HuCIq.js";
import "./arrow-up-down-OjuHJsVh.js";
import "./arrow-up-XdIk8XVw.js";
import "./chevron-left-BX6i8AeR.js";
import "./print-labels-CG7baEvW.js";
import "./print-report-slff5PK4.js";
import "./use-farm-members-B42zp6ci.js";
import "./user-check-y6-wslEY.js";
import "./BarChart-ppJFXFQ_.js";
import "./YearCompareSelector-3r5noSap.js";
import "./LineChart-DuHE3Zrn.js";
import "./search-CPInd2WY.js";
import "./bottling-csv-BeHtHDhe.js";
import "./pen-line-RMu7QXmG.js";
import "./tabs-B5O9aLio.js";
import "./git-branch-By3wIPbd.js";
import "./typeof-WJl3ipnu.js";
import "./database-DCM9sdwU.js";
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
  const { data: dashData, isLoading: dashLoading } = useQuery({
    queryKey: ["farm-dashboard", selectedFarmId],
    queryFn: () => fetch(`/api/farms/${selectedFarmId}/dashboard`).then((r2) => r2.json()),
    enabled: !!selectedFarmId,
    staleTime: 6e4
  });
  const activeSubs = (dashData?.activeSubscriptions ?? []).map((s2) => s2.moduleKey);
  const hasViticulture = activeSubs.includes("viticulture") || activeSubs.includes("organic-viticulture");
  const { data: viticultureAlert } = useQuery({
    queryKey: ["viticulture-platform-alert", selectedFarmId],
    queryFn: () => fetch(`/api/viticulture-alert${selectedFarmId ? `?farmId=${selectedFarmId}` : ""}`).then((r2) => r2.json()).catch(() => ({ active: false })),
    staleTime: 5 * 60 * 1e3,
    enabled: !!selectedFarmId
  });
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
  if (dashLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center h-64 text-muted-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-5 h-5 animate-spin mr-2" }),
    "Loading farm details…"
  ] }) });
  if (!hasViticulture) return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center h-64 gap-3 text-center px-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Grape, { className: "w-10 h-10 text-purple-200" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-gray-800", children: "Viticulture module not active" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground max-w-sm", children: "This farm doesn't have the Viticulture module enabled. Contact your account manager to add it to your subscription." })
  ] }) });
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
      viticultureAlert?.active && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-start gap-3 p-3 rounded-lg text-white ${viticultureAlert.level === "national" ? "bg-red-600" : viticultureAlert.level === "regional" ? "bg-orange-500" : "bg-amber-500"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "w-5 h-5 mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold text-sm", children: [
            "Vine Disease Alert",
            viticultureAlert.level ? ` — ${viticultureAlert.level.charAt(0).toUpperCase() + viticultureAlert.level.slice(1)}` : ""
          ] }),
          viticultureAlert.message && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-0.5 opacity-90", children: viticultureAlert.message }),
          viticultureAlert.date && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs opacity-75 mt-0.5", children: [
            "Issued: ",
            new Date(viticultureAlert.date).toLocaleDateString("en-GB")
          ] })
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
        tab === "spray-diary" && /* @__PURE__ */ jsxRuntimeExports.jsx(SprayDiaryTab, { farmId: selectedFarmId, blocks: blocks.data, requestBulkLink: bulkLinkFor === "spray-diary", onNavigate: handleNavigate }),
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
  e as emailRpaReference,
  f as exportCSV,
  g as fmt,
  h as fmtDate,
  i as fmtNum,
  p as printDiseaseScouting,
  j as printExciseReturn,
  k as printHarvest,
  l as printOperations,
  m as printOrganicWineRecords,
  n as printPhenology,
  o as printRpaReference,
  q as printSprayRecords,
  r as printVineRegister,
  t as today,
  useCrud,
  u as useFarmMeta
};
