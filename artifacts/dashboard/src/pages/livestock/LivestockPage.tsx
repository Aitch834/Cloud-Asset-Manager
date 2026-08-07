import React, { useState, useRef, useMemo } from "react";
import { canonicalHerdSpecies, herdSpeciesDisplayLabel, herdProductionSubtype } from "@/lib/herd-utils";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import { MortalitySection } from "./MortalitySection";
import { useLookupStrings } from "@/hooks/use-lookup";
import { useAppStore } from "@/hooks/use-app-store";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { usePersistedFilter } from "@/hooks/use-persisted-filter";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Redirect, useLocation } from "wouter";
import { Plus, Search, Loader2, Pencil, Trash2, ClipboardList, Stethoscope, CheckCircle2, Printer, AlertTriangle, Package, Droplets, XCircle, FileText, Upload, Paperclip, QrCode, Eye, FlaskConical, ClipboardCheck, Clock, ListChecks, BookOpen, ChevronDown, ChevronUp, RotateCcw, FileDown, Truck, BarChart3, Syringe } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useUpload } from "@workspace/object-storage-web";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { printProReport, openPrintWindow, buildProReport } from "@/lib/print-report";
import { LabSelector } from "@/components/ui/LabSelector";
import { useFarmMembers, memberFullName } from "@/hooks/use-farm-members";
import { StaffSelect } from "@/components/ui/staff-select";

import { formatDate, formatDateLong, ConfirmDialog, PRODUCTION_TYPE_OPTIONS, EMPTY_SIRE, EMPTY_STRAW, EMPTY_HERD, EMPTY_PLAN, EMPTY_ANIMAL, PrintHerdRegisterDialog, PrintVetPlanDialog, getHerdNumberConfig, getBreedPlaceholder, getHerdNamePlaceholder, ANIMAL_SPECIES_FALLBACK, ANIMAL_STATUS_LABELS, MOVEMENT_TYPE_LABELS, OUTCOME_COLOURS, DOC_TYPE_LABELS } from "./shared";
import { useFarmMeta } from "@/pages/viticulture/shared";
import type { Farm, Herd, VetHealthPlan, VetHealthPlanActionCompletion, VetHealthPlanAction, MortalityRecord, FallenStockContractor, FeedRecord, WaterRecord, Animal, Sire, StrawInventory, AnimalDoc, VaccHistoryRecord, AnimalProfile } from "./shared";
import { HerdsSection } from "./HerdsSection";
import { VetHealthPlansSection } from "./VetHealthPlansSection";
import { FallenStockContractorsSection, FeedSection } from "./ContractorsFeedSections";
import { WaterSection } from "./WaterSection";
import { AnimalsSection } from "./AnimalsSection";
import { SiresSection } from "./SiresSection";
import { AIReproductionSection } from "./AIReproductionSection";
import { VetPrescriptionsSection } from "./VetPrescriptionsSection";
import { StrawInventorySection } from "./StrawInventorySection";
import { LambingSection } from "./LambingSection";
import { TbTestsSection } from "./TbTestsSection";
import { WelfareOutcomeSection } from "./WelfareOutcomeSection";
import { SheepDippingSection } from "./SheepDippingSection";
import { LivestockAnalyticsSection } from "./LivestockAnalyticsSection";
import { BvdTestingSection } from "./BvdTestingSection";
import { CasualtySlaughterSection } from "./CasualtySlaughterSection";
import { IsolationRegisterSection } from "./IsolationRegisterSection";

// ─── Livestock Farm Settings completeness checklist ───────────────────────────

function LivestockFarmSettingsChecklist({ farmId }: { farmId: number }) {
  const { farmRecord, isLoading } = useFarmMeta(farmId);
  const [, navigate] = useLocation();

  if (isLoading) return null;

  const hasAnyMark =
    (!!farmRecord?.herdMark && String(farmRecord.herdMark).trim() !== "") ||
    (!!farmRecord?.flockMark && String(farmRecord.flockMark).trim() !== "") ||
    (!!farmRecord?.pigHerdMark && String(farmRecord.pigHerdMark).trim() !== "");

  const fields = [
    { label: "CPH Number", filled: !!farmRecord?.cphNumber && String(farmRecord.cphNumber).trim() !== "" },
    { label: "SBI Number", filled: !!farmRecord?.sbiNumber && String(farmRecord.sbiNumber).trim() !== "" },
    { label: "Herd / Flock Mark", filled: hasAnyMark },
  ];

  const missingCount = fields.filter(f => !f.filled).length;
  const allComplete = missingCount === 0;

  if (allComplete) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 mb-6">
        <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
        <span className="font-medium">Farm Settings complete</span>
        <span className="text-green-700">— CPH, SBI and herd/flock marks are all filled in.</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 mb-6">
      <div className="flex items-start gap-2.5 mb-3">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Farm Settings incomplete</p>
          <p className="text-xs text-amber-700 mt-0.5">
            {missingCount} field{missingCount === 1 ? "" : "s"} below {missingCount === 1 ? "is" : "are"} missing — your printed livestock reports and movement submissions will have blank header fields.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {fields.map(f => (
          <div key={f.label} className="flex items-center gap-2 text-sm">
            {f.filled
              ? <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
              : <XCircle className="w-4 h-4 shrink-0 text-amber-500" />
            }
            <span className={f.filled ? "text-green-800" : "text-amber-800"}>{f.label}</span>
            {!f.filled && (
              <button
                type="button"
                className="ml-auto text-xs text-amber-700 underline underline-offset-2 hover:text-amber-900 font-medium whitespace-nowrap"
                onClick={() => navigate("/settings/farm")}
              >
                Add →
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 pt-2.5 border-t border-amber-200">
        <button
          type="button"
          className="text-xs text-amber-700 underline underline-offset-2 hover:text-amber-900 font-medium"
          onClick={() => navigate("/settings/farm")}
        >
          Open Farm Settings →
        </button>
      </div>
    </div>
  );
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

type LivestockTab = "herds" | "vet-plans" | "mortality" | "contractors" | "feed" | "water" | "animals" | "ai-repro" | "vet-rx" | "sires" | "straws" | "lambing" | "tb-tests" | "welfare-outcomes" | "sheep-dipping" | "bvd" | "casualty-slaughter" | "isolation" | "analytics";
const LIVESTOCK_TAB_IDS: LivestockTab[] = ["herds","vet-plans","mortality","contractors","feed","water","animals","ai-repro","vet-rx","sires","straws","lambing","tb-tests","welfare-outcomes","sheep-dipping","bvd","casualty-slaughter","isolation","analytics"];

export default function LivestockPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = usePersistedTab<LivestockTab>({ page: "livestock", farmId, validIds: LIVESTOCK_TAB_IDS, defaultTab: "herds", urlOverride: typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("tab") : null });

  if (!farmId) return <Redirect href="/select" />;

  return (
    <AppLayout title="Herds & Animals">
      <LivestockFarmSettingsChecklist farmId={farmId} />
      <TabBar className="mb-6">
        <TabButton active={tab === "herds"} onClick={() => setTab("herds")}>Herds & Flocks</TabButton>
        <TabButton active={tab === "animals"} onClick={() => setTab("animals")}>
          <span className="flex items-center gap-1"><ClipboardList className="h-3.5 w-3.5" /> Individual Animals</span>
        </TabButton>
        <TabButton active={tab === "vet-plans"} onClick={() => setTab("vet-plans")}>Vet Health Plans</TabButton>
        <TabButton active={tab === "mortality"} onClick={() => setTab("mortality")}>
          <span className="flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Mortality</span>
        </TabButton>
        <TabButton active={tab === "contractors"} onClick={() => setTab("contractors")}>
          <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Fallen Stock Collectors</span>
        </TabButton>
        <TabButton active={tab === "feed"} onClick={() => setTab("feed")}>
          <span className="flex items-center gap-1"><Package className="h-3.5 w-3.5" /> Feed Records</span>
        </TabButton>
        <TabButton active={tab === "water"} onClick={() => setTab("water")}>
          <span className="flex items-center gap-1"><Droplets className="h-3.5 w-3.5" /> Water Quality</span>
        </TabButton>
        <TabButton active={tab === "sires"} onClick={() => setTab("sires")}>
          <span className="flex items-center gap-1"><ClipboardList className="h-3.5 w-3.5" /> Sires &amp; Rams</span>
        </TabButton>
        <TabButton active={tab === "straws"} onClick={() => setTab("straws")}>
          <span className="flex items-center gap-1"><FlaskConical className="h-3.5 w-3.5" /> Straw Inventory</span>
        </TabButton>
        <TabButton active={tab === "ai-repro"} onClick={() => setTab("ai-repro")}>
          <span className="flex items-center gap-1"><Stethoscope className="h-3.5 w-3.5" /> AI & Reproduction</span>
        </TabButton>
        <TabButton active={tab === "vet-rx"} onClick={() => setTab("vet-rx")}>
          <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> Health Register</span>
        </TabButton>
        <TabButton active={tab === "lambing"} onClick={() => setTab("lambing")}>
          <span className="flex items-center gap-1"><ClipboardList className="h-3.5 w-3.5" /> Lambing Records</span>
        </TabButton>
        <TabButton active={tab === "tb-tests"} onClick={() => setTab("tb-tests")}>
          <span className="flex items-center gap-1"><ClipboardCheck className="h-3.5 w-3.5" /> TB Tests</span>
        </TabButton>
        <TabButton active={tab === "welfare-outcomes"} onClick={() => setTab("welfare-outcomes")}>
          <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Welfare Outcomes</span>
        </TabButton>
        <TabButton active={tab === "sheep-dipping"} onClick={() => setTab("sheep-dipping")}>
          <span className="flex items-center gap-1"><FlaskConical className="h-3.5 w-3.5" /> Sheep Dipping</span>
        </TabButton>
        <TabButton active={tab === "bvd"} onClick={() => setTab("bvd")}>
          <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> BVD Testing</span>
        </TabButton>
        <TabButton active={tab === "casualty-slaughter"} onClick={() => setTab("casualty-slaughter")}>
          <span className="flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Casualty Slaughter</span>
        </TabButton>
        <TabButton active={tab === "isolation"} onClick={() => setTab("isolation")}>
          <span className="flex items-center gap-1"><ClipboardCheck className="h-3.5 w-3.5" /> Isolation Register</span>
        </TabButton>
        <TabButton active={tab === "analytics"} onClick={() => setTab("analytics")}>
          <span className="flex items-center gap-1"><BarChart3 className="h-3.5 w-3.5" /> Analytics</span>
        </TabButton>
      </TabBar>
      <ErrorBoundary key={tab}>
        {tab === "herds" && <HerdsSection farmId={farmId} />}
        {tab === "animals" && <AnimalsSection farmId={farmId} />}
        {tab === "vet-plans" && <VetHealthPlansSection farmId={farmId} />}
        {tab === "mortality" && <MortalitySection farmId={farmId} />}
        {tab === "contractors" && <FallenStockContractorsSection farmId={farmId} />}
        {tab === "feed" && <FeedSection farmId={farmId} />}
        {tab === "water" && <WaterSection farmId={farmId} />}
        {tab === "sires" && <SiresSection farmId={farmId} />}
        {tab === "straws" && <StrawInventorySection farmId={farmId} />}
        {tab === "ai-repro" && <AIReproductionSection farmId={farmId} />}
        {tab === "vet-rx" && <VetPrescriptionsSection farmId={farmId} />}
        {tab === "lambing" && <LambingSection farmId={farmId} />}
        {tab === "tb-tests" && <TbTestsSection farmId={farmId} />}
        {tab === "welfare-outcomes" && <WelfareOutcomeSection farmId={farmId} />}
        {tab === "sheep-dipping" && <SheepDippingSection farmId={farmId} />}
        {tab === "bvd" && <BvdTestingSection farmId={farmId} />}
        {tab === "casualty-slaughter" && <CasualtySlaughterSection farmId={farmId} />}
        {tab === "isolation" && <IsolationRegisterSection farmId={farmId} />}
        {tab === "analytics" && <LivestockAnalyticsSection farmId={farmId} />}
      </ErrorBoundary>
    </AppLayout>
  );
}

