import { useFarmName } from "@/hooks/use-farm-name";
import { useState, useMemo, useEffect, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StaffSelect } from "@/components/ui/staff-select";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import {
  Plus, Trash2, Loader2, Eye, Grape, Leaf, ClipboardList, Sprout,
  BarChart3, Bug, Scissors, ShieldAlert, CheckCircle2, XCircle, AlertTriangle,
  FileDown, Pencil, Map, FileText, Receipt, CalendarCheck, ShieldCheck, Wine,
  Droplet, FlaskConical, ChevronRight, Package, TrendingUp, BookOpen, Printer,
  Award, Globe, BadgeAlert, Beaker, Wrench, Gauge,
} from "lucide-react";
import {
  ViticulturalAnalyticsTab,
  VintageSeasonReportTab,
  ViticulturalEnterpriseReport,
} from "@/components/ViticulturalReports";
import {
  HarvestReceptionTab,
  PressingRecordsTab,
  FermentationRecordsTab,
  VesselRegisterTab,
  CellarOpsTab,
  BottlingRecordsTab,
  So2TestingTab,
  EquipmentRegisterTab,
  BatchTrailQuickSearch,
  WINERY_VIEW_ADDITIONS_EVENT,
} from "@/pages/WineryManagementTabs";
import { sanitiseCsvCell } from "@/lib/csv";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { useAppStore } from "@/hooks/use-app-store";
import { useUserRole } from "@/hooks/use-user-role";
import { useToast } from "@/hooks/use-toast";
import { VineyardBlockBoundaryMapDialog } from "@/components/viticulture/VineyardBlockBoundaryMapDialog";
import { VineyardBlockMapTab } from "@/components/viticulture/VineyardBlockMapTab";
import { Checkbox } from "@/components/ui/checkbox";
import { useLookupStrings } from "@/hooks/use-lookup";
import { usePersistedTab } from "@/hooks/use-persisted-tab";

import { apiUrl as api } from "@/lib/api";
import { fmt, fmtDate, fmtNum, today, exportCSV, printExciseReturn, printOrganicWineRecords, PRESSURE_LABELS, BBCH_STAGES, UK_GRAPE_VARIETIES, UK_ROOTSTOCKS, OPERATION_TYPES, StatCard, Empty, ConfirmDialog, DataTable, useCrud, ViewField, RaiseTaskBtn } from "./shared";
import { OverviewTab } from "./OverviewTab";
import { VineRegisterTab } from "./VineRegisterTab";
import { BlocksTab } from "./BlocksTab";
import { PhenologyTab } from "./PhenologyTab";
import { OperationsTab } from "./OperationsTab";
import { HarvestTab } from "./HarvestTab";
import { ScoutingTab } from "./ScoutingTab";
import { WineProductionTab } from "./WineProductionTab";
import { LicensingTab } from "./LicensingTab";
import { ExciseDutyTab } from "./ExciseDutyTab";
import { TastingsToursTab } from "./TastingsToursTab";
import { AgeVerificationTab } from "./AgeVerificationTab";
import { SprayDiaryTab } from "./SprayDiaryTab";
import { SoilAnalysisTab } from "./SoilAnalysisTab";
import { WineryStockTab } from "./WineryStockTab";
import { GiComplianceTab } from "./GiComplianceTab";

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
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
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "vintage-report", label: "Vintage Report", icon: BookOpen },
  { id: "enterprise-report", label: "Enterprise Report", icon: TrendingUp },
];

// ─── GI Compliance Tab ────────────────────────────────────────────────────────
export default function ViticulturePage() {
  const { farmId: selectedFarmId } = useAppStore();
  // Persist the active tab in localStorage, scoped to the farm — shared
  // usePersistedTab hook (same behaviour as all other tabbed pages); page key
  // "viticulture" keeps the historical `viticulture-active-tab-${farmId}` storage key.
  const [tab, setTab] = usePersistedTab<string>({
    page: "viticulture",
    farmId: selectedFarmId,
    validIds: TABS.map(t => t.id),
    defaultTab: "overview",
  });
  // Cross-tab "view additions" shortcut: fermentation/cellar-ops/bottling rows
  // request the Pressing tab's Additions Report; switching tabs mounts
  // PressingRecordsTab, which consumes the stored scope and opens the report.
  useEffect(() => {
    // Persist via the wrapped setter so the shortcut writes to the *current*
    // farm's storage key — re-registered whenever the farm changes.
    const h = () => setTab("winery-pressing");
    window.addEventListener(WINERY_VIEW_ADDITIONS_EVENT, h);
    return () => window.removeEventListener(WINERY_VIEW_ADDITIONS_EVENT, h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFarmId]);
  const [raiseOpen, setRaiseOpen] = useState(false);
  const [highlightBlockId, setHighlightBlockId] = useState<number | undefined>(undefined);
  const blocks = useCrud(selectedFarmId ?? 0, "vineyard-blocks", "vineyard-blocks");

  const handleNavigate = (toTab: string, blockId?: number) => {
    setHighlightBlockId(blockId);
    setTab(toTab);
  };

  if (!selectedFarmId) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64 text-muted-foreground">Select a farm to view Viticulture records.</div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-4 max-w-full">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Grape className="w-5 h-5 text-purple-600" />
              Viticulture
            </h1>
            <p className="text-sm text-muted-foreground">Growing compliance — FSA vine register, blocks, phenology, operations, harvest and disease scouting</p>
          </div>
          <Button variant="outline" size="sm" className="text-purple-700 border-purple-200 hover:bg-purple-50" onClick={() => setRaiseOpen(true)}>
            <ClipboardList className="w-4 h-4 mr-1" />
            Raise Task
          </Button>
        </div>
        <TabBar>
          {TABS.map(t => (
            <TabButton key={t.id} active={tab === t.id} onClick={() => setTab(t.id)}>
              <t.icon className="w-3.5 h-3.5 mr-1" />
              {t.label}
            </TabButton>
          ))}
        </TabBar>
        {tab.startsWith("winery-") && (
          <div className="flex items-center justify-end py-1">
            <BatchTrailQuickSearch farmId={selectedFarmId} />
          </div>
        )}
        <div className="bg-muted/30 rounded-xl p-4">
          {tab === "overview" && <OverviewTab farmId={selectedFarmId} />}
          {tab === "vine-register" && <VineRegisterTab farmId={selectedFarmId} blocks={blocks.data} highlightBlockId={highlightBlockId} />}
          {tab === "blocks" && <BlocksTab farmId={selectedFarmId} onNavigate={handleNavigate} />}
          {tab === "block-map" && <VineyardBlockMapTab farmId={selectedFarmId} blocks={blocks.data} onNavigate={handleNavigate} />}
          {tab === "phenology" && <PhenologyTab farmId={selectedFarmId} blocks={blocks.data} highlightBlockId={highlightBlockId} />}
          {tab === "operations" && <OperationsTab farmId={selectedFarmId} blocks={blocks.data} />}
          {tab === "harvest" && <HarvestTab farmId={selectedFarmId} blocks={blocks.data} />}
          {tab === "scouting" && <ScoutingTab farmId={selectedFarmId} blocks={blocks.data} highlightBlockId={highlightBlockId} />}
          {tab === "licensing" && <LicensingTab farmId={selectedFarmId} />}
          {tab === "excise" && <ExciseDutyTab farmId={selectedFarmId} />}
          {tab === "tours" && <TastingsToursTab farmId={selectedFarmId} />}
          {tab === "age-check" && <AgeVerificationTab farmId={selectedFarmId} />}
          {tab === "wine-production" && <WineProductionTab farmId={selectedFarmId} />}
          {tab === "winery-stock" && <WineryStockTab farmId={selectedFarmId} />}
          {tab === "winery-reception" && <HarvestReceptionTab farmId={selectedFarmId} blocks={blocks.data} />}
          {tab === "winery-pressing" && <PressingRecordsTab farmId={selectedFarmId} />}
          {tab === "winery-fermentation" && <FermentationRecordsTab farmId={selectedFarmId} />}
          {tab === "winery-vessels" && <VesselRegisterTab farmId={selectedFarmId} />}
          {tab === "winery-cellar-ops" && <CellarOpsTab farmId={selectedFarmId} />}
          {tab === "winery-bottling" && <BottlingRecordsTab farmId={selectedFarmId} />}
          {tab === "winery-so2" && <So2TestingTab farmId={selectedFarmId} />}
          {tab === "winery-equipment" && <EquipmentRegisterTab farmId={selectedFarmId} />}
          {tab === "gi-compliance" && <GiComplianceTab farmId={selectedFarmId} blocks={blocks.data} />}
          {tab === "spray-diary" && <SprayDiaryTab farmId={selectedFarmId} blocks={blocks.data} />}
          {tab === "soil-analysis" && <SoilAnalysisTab farmId={selectedFarmId} blocks={blocks.data} />}
          {tab === "analytics" && <ViticulturalAnalyticsTab farmId={selectedFarmId} />}
          {tab === "vintage-report" && <VintageSeasonReportTab farmId={selectedFarmId} />}
          {tab === "enterprise-report" && <ViticulturalEnterpriseReport farmId={selectedFarmId} />}
        </div>
      </div>
      <RaiseTaskDialog
        farmId={selectedFarmId}
        open={raiseOpen}
        onClose={() => setRaiseOpen(false)}
        defaultTitle="Viticulture Task"
        module="Viticulture"
      />
    </AppLayout>
  );
}

