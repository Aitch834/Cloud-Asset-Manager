import { useFarmName } from "@/hooks/use-farm-name";
import { useState, useMemo, useEffect, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
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
import { fmt, fmtDate, fmtNum, today, exportCSV, printExciseReturn, printOrganicWineRecords, PRESSURE_LABELS, BBCH_STAGES, UK_GRAPE_VARIETIES, UK_ROOTSTOCKS, OPERATION_TYPES, StatCard, Empty, ConfirmDialog, DataTable, useCrud, ViewField, RaiseTaskBtn, useFarmMeta } from "./shared";

// ─── FSA / APPA registration completeness bar ─────────────────────────────────

type FsaField = {
  label: string;
  value: unknown;
};

function FsaCompletenessBar({ farmId }: { farmId: number }) {
  const { farmRecord, isLoading } = useFarmMeta(farmId);
  const [, navigate] = useLocation();

  if (isLoading) return null;

  const fields: FsaField[] = [
    { label: "FSA Vine Register Ref", value: farmRecord?.fsaVineRegisterRef },
    { label: "FSA Wine Production Ref", value: farmRecord?.fsaWineProductionRef },
    { label: "APPA Ref", value: farmRecord?.appaRef },
  ];

  const allComplete = fields.every(f => !!f.value && String(f.value).trim() !== "");

  // Hide the bar once everything is filled in
  if (allComplete) return null;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3.5">
      <div className="flex items-start gap-2.5 mb-2.5">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
        <div>
          <p className="text-sm font-semibold text-amber-800">FSA / APPA registration incomplete</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Missing references will appear blank in printed reports. Add them in{" "}
            <button
              type="button"
              className="underline underline-offset-2 hover:text-amber-900 font-medium"
              onClick={() => navigate("/settings/farm")}
            >
              Farm Settings → Viticulture &amp; Wine
            </button>
            .
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {fields.map(f => {
          const filled = !!f.value && String(f.value).trim() !== "";
          return (
            <button
              key={f.label}
              type="button"
              className={
                filled
                  ? "inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-800 cursor-default"
                  : "inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-white px-3 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 transition-colors"
              }
              onClick={() => { if (!filled) navigate("/settings/farm"); }}
              disabled={filled}
            >
              {filled
                ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-green-600" />
                : <XCircle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
              }
              {f.label}
              {!filled && <span className="text-amber-500 ml-0.5">→</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function OverviewTab({ farmId }: { farmId: number }) {
  const blocks = useCrud(farmId, "vineyard-blocks", "vineyard-blocks");
  const register = useCrud(farmId, "vine-register", "vine-register");
  const harvest = useCrud(farmId, "vineyard-harvest", "vineyard-harvest");
  const scouting = useCrud(farmId, "vineyard-scouting", "vineyard-scouting");

  const activeBlocks = blocks.data.filter(b => b.isActive !== false);
  const totalHa = activeBlocks.reduce((s, b) => s + parseFloat(String(b.areaHa || 0)), 0);
  const totalVines = activeBlocks.reduce((s, b) => s + Number(b.numberOfVines || 0), 0);
  const registeredHa = register.data.filter(r => !r.isRemovedFromRegister).reduce((s, r) => s + parseFloat(String(r.registeredAreaHa || 0)), 0);
  const latestHarvest = harvest.data[0];
  const latestScout = scouting.data[0];
  const xylellaAlert = scouting.data.some(s => s.xylellaFastidiosa);
  const highPressure = scouting.data.slice(0, 3).some(s =>
    Number(s.downyMildewPressure) >= 3 || Number(s.powderyMildewPressure) >= 3 || Number(s.botrytisPressure) >= 3
  );

  return (
    <div className="space-y-6">
      <FsaCompletenessBar farmId={farmId} />
      {xylellaAlert && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-red-800">Xylella fastidiosa Suspected</p>
            <p className="text-sm text-red-700 mt-0.5">A recent scouting record has flagged a possible Xylella sighting. This is a notifiable plant disease — contact APHA immediately and do not move plant material off-site.</p>
          </div>
        </div>
      )}
      {highPressure && !xylellaAlert && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-amber-800">High Disease Pressure Recorded</p>
            <p className="text-sm text-amber-700 mt-0.5">A recent scouting record shows high pressure from one or more diseases. Review the Disease Scouting tab and consider spray intervention.</p>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Active Blocks" value={activeBlocks.length} sub="in production" />
        <StatCard label="Total Vineyard Area" value={`${totalHa.toFixed(2)} ha`} sub="across all blocks" color="green" />
        <StatCard label="Total Vines" value={totalVines.toLocaleString()} sub="registered plants" />
        <StatCard label="FSA Registered" value={`${registeredHa.toFixed(2)} ha`} sub="on vine register" color="purple" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border p-4 space-y-3">
          <p className="font-semibold text-sm">Block Summary</p>
          {activeBlocks.length === 0 ? <Empty msg="No blocks registered yet." /> : (
            <table className="w-full text-sm">
              <thead><tr className="border-b"><th className="text-left py-1 pr-3 font-medium text-muted-foreground">Block</th><th className="text-left py-1 pr-3 font-medium text-muted-foreground">Variety</th><th className="text-left py-1 font-medium text-muted-foreground">Area (ha)</th></tr></thead>
              <tbody>{activeBlocks.slice(0, 8).map((b, i) => (
                <tr key={i} className="border-b last:border-0"><td className="py-1.5 pr-3">{fmt(b.blockName)}</td><td className="py-1.5 pr-3">{fmt(b.variety)}</td><td className="py-1.5">{fmtNum(b.areaHa, 4)}</td></tr>
              ))}</tbody>
            </table>
          )}
        </div>
        <div className="bg-white rounded-lg border p-4 space-y-3">
          <p className="font-semibold text-sm">Latest Vintage</p>
          {!latestHarvest ? <Empty msg="No harvest records yet." /> : (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Vintage Year</span><span className="font-medium">{fmt(latestHarvest.vintageYear)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Harvest Date</span><span>{fmtDate(latestHarvest.harvestDate)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total Yield (kg)</span><span>{fmtNum(latestHarvest.yieldKg, 1)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Brix</span><span>{fmtNum(latestHarvest.brix, 1)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Grape Condition</span><span>{fmt(latestHarvest.grapeCondition)}</span></div>
            </div>
          )}
          <p className="font-semibold text-sm pt-2">Latest Scouting</p>
          {!latestScout ? <Empty msg="No scouting records yet." /> : (
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{fmtDate(latestScout.scoutDate)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Downy Mildew</span><span className={PRESSURE_LABELS[Number(latestScout.downyMildewPressure) || 0]?.color}>{PRESSURE_LABELS[Number(latestScout.downyMildewPressure) || 0]?.label}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Powdery Mildew</span><span className={PRESSURE_LABELS[Number(latestScout.powderyMildewPressure) || 0]?.color}>{PRESSURE_LABELS[Number(latestScout.powderyMildewPressure) || 0]?.label}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Botrytis</span><span className={PRESSURE_LABELS[Number(latestScout.botrytisPressure) || 0]?.color}>{PRESSURE_LABELS[Number(latestScout.botrytisPressure) || 0]?.label}</span></div>
            </div>
          )}
        </div>
      </div>
      <div className="bg-white rounded-lg border p-4">
        <p className="font-semibold text-sm mb-2">UK Vineyard Compliance Checklist</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {[
            { label: "FSA Vine Register up to date", ok: register.data.length > 0 },
            { label: "All active blocks on vine register", ok: register.data.filter(r => !r.isRemovedFromRegister).length >= activeBlocks.length },
            { label: "Disease scouting undertaken this season", ok: scouting.data.length > 0 },
            { label: "Vintage harvest records complete", ok: harvest.data.length > 0 },
            { label: "Pruning / canopy records logged", ok: false },
            { label: "No Xylella suspicion outstanding", ok: !xylellaAlert },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              {item.ok ? <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" /> : <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
              <span className={item.ok ? "" : "text-muted-foreground"}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-slate-50 border rounded-lg p-4 text-sm text-slate-700 space-y-2">
        <p className="font-semibold text-slate-800 flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-slate-500" />About This Module</p>
        <p>The <strong>Viticulture</strong> module covers all aspects of UK vineyard and winery management under current English and Welsh wine regulations.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-600 pt-1">
          <div><strong>Vineyard Blocks</strong> — permanent block sites with full planting lifecycle (active / suspended / removed). Replanting creates a new planting history on the same block.</div>
          <div><strong>Vine Register</strong> — FSA statutory register. All vines producing wine for sale must be registered; notify the FSA within 30 days of planting, grubbing or variety change.</div>
          <div><strong>Spray Diary</strong> — all pesticide applications must be recorded within 48 hours under UK Plant Protection Products regulations (SI 2011/2131).</div>
          <div><strong>Disease Scouting</strong> — monitor for Xylella fastidiosa (notifiable), downy/powdery mildew and botrytis. Scouting records support spray diary decision trails.</div>
          <div><strong>Harvest Records</strong> — log yield, Brix, pH and grape condition per block. These feed Winery Reception and are required for vintage GI declarations.</div>
          <div><strong>GI Compliance</strong> — manage WSET-recognised GI labels (English Wine PGI, WO, Chapel Down etc.), variety approval, and annual yield declarations to HMRC.</div>
          <div><strong>Winery</strong> — fermentation records, vessel register, SO₂ testing, bottling records, and consumables stock. SO₂ total tracked against organic and conventional limits.</div>
          <div><strong>Licensing &amp; AV</strong> — WOWGR excise licences, premises licences, and age-verification policy records required for direct retail sales.</div>
        </div>
      </div>
    </div>
  );
}

// ─── Vine Register ─────────────────────────────────────────────────────────────
