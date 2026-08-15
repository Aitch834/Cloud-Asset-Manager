// @ts-nocheck
import { useState } from "react";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Home, Bird, BarChart3, Pill, SprayCan, Thermometer, FileText, ShieldCheck, Scissors, ClipboardList, ClipboardCheck, Star, Truck, FileDown, AlertTriangle, TrendingUp, LayoutDashboard, Receipt, Syringe, Activity, ArrowRightLeft, ShieldAlert, MapPin, Clock, Save } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { useAppStore } from "@/hooks/use-app-store";
import { useToast } from "@/hooks/use-toast";
import { Redirect } from "wouter";
import { apiUrl as api } from "@/lib/api";
import { PoultryFlockReport } from "@/components/PoultryFlockReport";
import { FlocksTab } from "./FlocksTab";
import { OverviewTab } from "./OverviewTab";
import { HousesTab } from "./HousesTab";
import { ChickPurchasesTab } from "./ChickPurchasesTab";
import { PlacementQualityTab } from "./PlacementQualityTab";
import { MortalityTab } from "./MortalityTab";
import { TreatmentsTab } from "./TreatmentsTab";
import { CleanoutsTab } from "./CleanoutsTab";
import { EnvironmentalLogsTab } from "./EnvironmentalLogsTab";
import { FciTab } from "./FciTab";
import { BroilerWelfareTab } from "./BroilerWelfareTab";
import { ThinningRecordsTab } from "./ThinningRecordsTab";
import { BiosecurityChecklistTab } from "./BiosecurityChecklistTab";
import { SchemeRecordsTab } from "./SchemeRecordsTab";
import { PoultryFeedTab } from "./PoultryFeedTab";
import { CampylobacterMonitoringTab } from "./CampylobacterMonitoringTab";
import { PoultryVaccinationTab } from "./PoultryVaccinationTab";
import { PoultryDiseaseMonitoringTab } from "./PoultryDiseaseMonitoringTab";
import { PoultryAnalyticsTab } from "./PoultryAnalyticsTab";
import { InterSiteTransfersTab } from "./InterSiteTransfersTab";
import { TransportWelfareTab } from "./TransportWelfareTab";

type Tab = "overview" | "houses" | "flocks" | "purchases" | "quality" | "mortality" | "treatments" | "cleanouts" | "envlogs" | "fci" | "bwi" | "thinning" | "biosecurity" | "scheme-records" | "feed" | "campylobacter" | "vaccination" | "disease-monitoring" | "analytics" | "enterprise" | "transfers" | "transport-welfare";
const POULTRY_PRODUCTION_TAB_IDS: Tab[] = ["overview", "houses", "flocks", "purchases", "quality", "mortality", "treatments", "cleanouts", "envlogs", "fci", "bwi", "thinning", "biosecurity", "scheme-records", "feed", "campylobacter", "vaccination", "disease-monitoring", "analytics", "enterprise", "transfers", "transport-welfare"];


export default function PoultryProductionPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = usePersistedTab<Tab>({ page: "poultry-production", farmId, validIds: POULTRY_PRODUCTION_TAB_IDS, defaultTab: "overview", urlOverride: new URLSearchParams(window.location.search).get("tab") });
  const [generating, setGenerating] = useState(false);
  if (!farmId) return <Redirect to="/" />;

  async function handleGeneratePdf() {
    setGenerating(true);
    try { await generateAuditPDF(farmId!); } catch (e) { console.error("PDF generation failed:", e); } finally { setGenerating(false); }
  }

  return (
    <AppLayout title="Poultry Production">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <TabBar>
            <TabButton active={tab === "overview"} onClick={() => setTab("overview")}><LayoutDashboard className="w-3.5 h-3.5 mr-1" />Overview</TabButton>
            <TabButton active={tab === "houses"} onClick={() => setTab("houses")}><Home className="w-3.5 h-3.5 mr-1" />Houses</TabButton>
            <TabButton active={tab === "flocks"} onClick={() => setTab("flocks")}><Bird className="w-3.5 h-3.5 mr-1" />Flocks</TabButton>
            <TabButton active={tab === "purchases"} onClick={() => setTab("purchases")}><Receipt className="w-3.5 h-3.5 mr-1" />Chick Purchases</TabButton>
            <TabButton active={tab === "quality"} onClick={() => setTab("quality")}><ClipboardCheck className="w-3.5 h-3.5 mr-1" />Placement Quality</TabButton>
            <TabButton active={tab === "mortality"} onClick={() => setTab("mortality")}><BarChart3 className="w-3.5 h-3.5 mr-1" />Mortality</TabButton>
            <TabButton active={tab === "treatments"} onClick={() => setTab("treatments")}><Pill className="w-3.5 h-3.5 mr-1" />Treatments</TabButton>
            <TabButton active={tab === "cleanouts"} onClick={() => setTab("cleanouts")}><SprayCan className="w-3.5 h-3.5 mr-1" />Cleanouts</TabButton>
            <TabButton active={tab === "envlogs"} onClick={() => setTab("envlogs")}><Thermometer className="w-3.5 h-3.5 mr-1" />Environment</TabButton>
            <TabButton active={tab === "fci"} onClick={() => setTab("fci")}><FileText className="w-3.5 h-3.5 mr-1" />FCI Docs</TabButton>
            <TabButton active={tab === "bwi"} onClick={() => setTab("bwi")}><ShieldCheck className="w-3.5 h-3.5 mr-1" />Broiler Welfare</TabButton>
            <TabButton active={tab === "thinning"} onClick={() => setTab("thinning")}><Scissors className="w-3.5 h-3.5 mr-1" />Thinning</TabButton>
            <TabButton active={tab === "biosecurity"} onClick={() => setTab("biosecurity")}><ClipboardList className="w-3.5 h-3.5 mr-1" />Biosecurity</TabButton>
            <TabButton active={tab === "scheme-records"} onClick={() => setTab("scheme-records")}><Star className="w-3.5 h-3.5 mr-1" />Scheme Records</TabButton>
            <TabButton active={tab === "feed"} onClick={() => setTab("feed")}><Truck className="w-3.5 h-3.5 mr-1" />Feed</TabButton>
            <TabButton active={tab === "campylobacter"} onClick={() => setTab("campylobacter")}><AlertTriangle className="w-3.5 h-3.5 mr-1" />Campylobacter</TabButton>
            <TabButton active={tab === "vaccination"} onClick={() => setTab("vaccination")}><Syringe className="w-3.5 h-3.5 mr-1" />Vaccination</TabButton>
            <TabButton active={tab === "disease-monitoring"} onClick={() => setTab("disease-monitoring")}><Activity className="w-3.5 h-3.5 mr-1" />Disease Monitoring</TabButton>
            <TabButton active={tab === "analytics"} onClick={() => setTab("analytics")}><TrendingUp className="w-3.5 h-3.5 mr-1" />Analytics</TabButton>
            <TabButton active={tab === "enterprise"} onClick={() => setTab("enterprise")}><TrendingUp className="w-3.5 h-3.5 mr-1" />Enterprise Report</TabButton>
            <TabButton active={tab === "transfers"} onClick={() => setTab("transfers")}><ArrowRightLeft className="w-3.5 h-3.5 mr-1" />Inter-Site Transfers</TabButton>
            <TabButton active={tab === "transport-welfare"} onClick={() => setTab("transport-welfare")}><ShieldAlert className="w-3.5 h-3.5 mr-1" />Transport Welfare</TabButton>
          </TabBar>
          <Button size="sm" variant="outline" onClick={handleGeneratePdf} disabled={generating} className="ml-3 shrink-0">
            {generating ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <FileDown className="w-3.5 h-3.5 mr-1" />}
            {generating ? "Generating…" : "Audit Report PDF"}
          </Button>
        </div>
        <HpaiBanner farmId={farmId} />
        <Card><CardContent className="pt-4">
          {tab === "overview" && <OverviewTab farmId={farmId} onGoto={t => setTab(t as Tab)} />}
          {tab === "houses" && <HousesTab farmId={farmId} />}
          {tab === "flocks" && <FlocksTab farmId={farmId} />}
          {tab === "purchases" && <ChickPurchasesTab farmId={farmId} />}
          {tab === "quality" && <PlacementQualityTab farmId={farmId} />}
          {tab === "mortality" && <MortalityTab farmId={farmId} />}
          {tab === "treatments" && <TreatmentsTab farmId={farmId} />}
          {tab === "cleanouts" && <CleanoutsTab farmId={farmId} />}
          {tab === "envlogs" && <EnvironmentalLogsTab farmId={farmId} />}
          {tab === "fci" && <FciTab farmId={farmId} />}
          {tab === "bwi" && <BroilerWelfareTab farmId={farmId} />}
          {tab === "thinning" && <ThinningRecordsTab farmId={farmId} />}
          {tab === "biosecurity" && <BiosecurityChecklistTab farmId={farmId} />}
          {tab === "scheme-records" && <SchemeRecordsTab farmId={farmId} />}
          {tab === "feed" && <PoultryFeedTab farmId={farmId} />}
          {tab === "campylobacter" && <CampylobacterMonitoringTab farmId={farmId} />}
          {tab === "vaccination" && <PoultryVaccinationTab farmId={farmId} />}
          {tab === "disease-monitoring" && <PoultryDiseaseMonitoringTab farmId={farmId} />}
          {tab === "analytics" && <PoultryAnalyticsTab farmId={farmId} />}
          {tab === "enterprise" && <PoultryFlockReport farmId={farmId} />}
          {tab === "transfers" && <InterSiteTransfersTab farmId={farmId} />}
          {tab === "transport-welfare" && <TransportWelfareTab farmId={farmId} />}
        </CardContent></Card>
      </div>
    </AppLayout>
  );
}

// ─── Campylobacter Monitoring Tab ─────────────────────────────────────────────

async function generateAuditPDF(farmId: number) {
  const headers = { credentials: "include" as const };
  const get = (path: string) => fetch(api(`farms/${farmId}/${path}`), headers).then(r => r.json());

  const [housesRes, flocksRes, mortalityRes, treatmentsRes, cleanoutsRes, envRes, fciRes, bwiRes, thinRes, bioRes, schemeRes] = await Promise.all([
    get("poultry-houses"), get("poultry-flocks"), get("poultry-daily-mortality"),
    get("poultry-treatments"), get("poultry-house-cleanouts"), get("poultry-environmental-logs"),
    get("poultry-fci-documents"), get("poultry-broiler-welfare"), get("poultry-thinning-records"),
    get("poultry-biosecurity-checklists"), get("poultry-scheme-records"),
  ]);

  const jsPDFModule = await import("jspdf");
  const autoTableModule = await import("jspdf-autotable");
  const jsPDF = jsPDFModule.default;
  const autoTable = autoTableModule.default;

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const today = new Date().toLocaleDateString("en-GB");

  function addSection(title: string, heads: string[], rows: (string | number)[][], newPage = true) {
    if (newPage) doc.addPage();
    doc.setFontSize(13); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 80, 40);
    doc.text(title, 14, 16);
    doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(120, 120, 120);
    doc.text(`Generated ${today} — BDE Farm Trac`, pageW - 14, 16, { align: "right" });
    autoTable(doc, {
      head: [heads], body: rows.map(r => r.map(String)),
      startY: 22, styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [30, 80, 40], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 250, 246] },
    });
  }

  const fd = (v: unknown) => v ? new Date(v as string).toLocaleDateString("en-GB") : "";
  const yn = (v: unknown) => v ? "Yes" : "No";

  doc.setFontSize(20); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 80, 40);
  doc.text("BDE Farm Trac — Poultry Production Audit Report", pageW / 2, 40, { align: "center" });
  doc.setFontSize(11); doc.setFont("helvetica", "normal"); doc.setTextColor(80, 80, 80);
  doc.text(`Generated: ${today}`, pageW / 2, 52, { align: "center" });
  doc.text("Barnett Davies Enterprises Ltd — Red Tractor Poultry Compliance Records", pageW / 2, 60, { align: "center" });

  const houses = (Array.isArray(housesRes) ? housesRes : housesRes?.houses ?? housesRes?.records ?? []) as Record<string, unknown>[];
  const flocks = (Array.isArray(flocksRes) ? flocksRes : flocksRes?.flocks ?? flocksRes?.records ?? []) as Record<string, unknown>[];
  const mortality = (mortalityRes?.records ?? []) as Record<string, unknown>[];
  const treatments = (treatmentsRes?.records ?? []) as Record<string, unknown>[];
  const cleanouts = (cleanoutsRes?.records ?? []) as Record<string, unknown>[];
  const envLogs = (envRes?.records ?? []) as Record<string, unknown>[];
  const fciDocs = (fciRes?.records ?? []) as Record<string, unknown>[];
  const bwi = (bwiRes?.records ?? []) as Record<string, unknown>[];
  const thinning = (thinRes?.records ?? []) as Record<string, unknown>[];
  const biosecurity = (bioRes?.records ?? []) as Record<string, unknown>[];
  const schemes = (Array.isArray(schemeRes) ? schemeRes : schemeRes?.records ?? []) as Record<string, unknown>[];

  if (houses.length) addSection("Houses", ["Name", "House Type", "Capacity", "Active"],
    houses.map(r => [String(r.houseName ?? ""), String(r.houseType ?? ""), String(r.capacity ?? ""), yn(r.isActive)]));

  if (flocks.length) addSection("Flocks", ["Flock No.", "Breed", "Placement Date", "Placement Count", "Status"],
    flocks.map(r => [String(r.flockNumber ?? ""), String(r.breed ?? ""), fd(r.placementDate), String(r.placementCount ?? ""), String(r.status ?? "")]));

  if (mortality.length) addSection("Daily Mortality Records", ["Date", "Flock", "Daily Mortality", "Running Total", "Percentage", "Main Cause"],
    mortality.map(r => [fd(r.mortalityDate), String(r.flockNumber ?? ""), String(r.dailyMortality ?? ""), String(r.runningTotalMortality ?? ""), `${r.mortalityPercentage ?? ""}%`, String(r.mainCause ?? "")]));

  if (treatments.length) addSection("Treatment Records", ["Date", "Flock", "Product", "Condition", "Route", "Withdrawal Clear Date", "Vet Prescribed"],
    treatments.map(r => [fd(r.treatmentDate), String(r.flockNumber ?? ""), String(r.productName ?? ""), String(r.condition ?? ""), String(r.routeOfAdministration ?? ""), fd(r.withdrawalClearDate), yn(r.prescriptionObtained)]));

  if (cleanouts.length) addSection("House Cleanout Records", ["Start Date", "End Date", "House", "Disinfectant", "Standing Time (days)", "Swabs Taken", "Results"],
    cleanouts.map(r => [fd(r.cleanoutStartDate), fd(r.cleanoutEndDate), String(r.houseName ?? ""), String(r.disinfectantUsed ?? ""), String(r.standingTimeDays ?? ""), yn(r.swabsTaken), String(r.swabResults ?? "")]));

  if (envLogs.length) addSection("Environmental Monitoring Logs", ["Date", "Flock", "Min °C", "Max °C", "Humidity %", "Ammonia ppm", "Alarm"],
    envLogs.map(r => [fd(r.logDate), String(r.flockNumber ?? ""), String(r.temperatureMin ?? ""), String(r.temperatureMax ?? ""), String(r.humidity ?? ""), String(r.ammoniaPpm ?? ""), yn(r.alarmActivated)]));

  if (fciDocs.length) addSection("Food Chain Information (FCI) Documents", ["Date", "Flock", "Abattoir", "Birds", "Withdrawal Clear", "Meds Last 7 Days", "Signed"],
    fciDocs.map(r => [fd(r.documentDate), String(r.flockNumber ?? ""), String(r.destinationAbattoir ?? ""), String(r.numberOfBirds ?? ""), yn(r.withdrawalPeriodClear), yn(r.medicationsLast7Days), yn(r.signedByFarmer)]));

  if (bwi.length) addSection("Broiler Welfare Indicators (BWI)", ["Date", "Flock", "Assessed By", "FPD Score", "Hock Burn", "Gait Score", "Outcome"],
    bwi.map(r => [fd(r.assessmentDate), String(r.flockNumber ?? ""), String(r.assessedBy ?? ""), String(r.footpadDermatitisScore ?? ""), String(r.hockBurnScore ?? ""), String(r.gaitScore ?? ""), String(r.overallOutcome ?? "")]));

  if (thinning.length) addSection("Thinning Records", ["Date", "Flock", "Thinning No.", "Birds Removed", "DOAs", "Avg Live Wt (kg)", "Abattoir"],
    thinning.map(r => [fd(r.thinningDate), String(r.flockNumber ?? ""), String(r.thinningNumber ?? ""), String(r.birdsRemoved ?? ""), String(r.doasAtLoading ?? "0"), String(r.averageLiveWeightKg ?? ""), String(r.destinationAbattoir ?? "")]));

  if (biosecurity.length) addSection("Biosecurity Checklists", ["Date", "House", "Downtime (days)", "Disinfectant", "Status", "Completed By"],
    biosecurity.map(r => [fd(r.cleanoutStartDate), String(r.houseName ?? ""), String(r.downtimeDays ?? ""), String(r.disinfectantUsed ?? ""), String(r.overallComplianceStatus ?? ""), String(r.completedBy ?? "")]));

  if (schemes.length) addSection("Assurance Scheme Records", ["Scheme", "Certificate No.", "Assessment Date", "Assessor", "Outcome", "Next Assessment Due"],
    schemes.map(r => [String(r.scheme ?? r.schemeName ?? ""), String(r.certificateNumber ?? ""), fd(r.assessmentDate), String(r.assessorName ?? ""), String(r.outcomeStatus ?? r.assessmentOutcome ?? ""), fd(r.nextAssessmentDue ?? r.certificateExpiryDate)]));

  const safeFarmId = String(farmId).replace(/[^a-z0-9]/gi, "");
  doc.save(`poultry-audit-report-farm${safeFarmId}-${today.replace(/\//g, "-")}.pdf`);
}

// ─── Analytics Tab ─────────────────────────────────────────────────────────────

const HPAI_ZONE_STATUSES = [
  { value: "none", label: "No zone restrictions" },
  { value: "protection_zone", label: "Protection Zone (PZ)" },
  { value: "surveillance_zone", label: "Surveillance Zone (SZ)" },
  { value: "temporary_control_zone", label: "Temporary Control Zone (TCZ)" },
];


function HpaiBanner({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editingZone, setEditingZone] = useState(false);
  const [zoneForm, setZoneForm] = useState<any>({});

  const { data: platformAlert } = useQuery({
    queryKey: ["hpai-platform-alert", farmId],
    queryFn: () => fetch(`/api/hpai-alert${farmId ? `?farmId=${farmId}` : ""}`).then(r => r.json()).catch(() => ({ active: false })),
    refetchInterval: 5 * 60 * 1000,
  });

  const { data: farmHpai } = useQuery({
    queryKey: ["hpai-status", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/hpai-status`), { credentials: "include" }).then(r => r.json()).catch(() => null),
    enabled: !!farmId,
  });

  const updateZoneMut = useMutation({
    mutationFn: () => fetch(api(`farms/${farmId}/hpai-status`), { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(zoneForm) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["hpai-status", farmId] }); setEditingZone(false); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const levelColours: Record<string, string> = {
    national: "bg-red-600",
    regional: "bg-orange-500",
    advisory: "bg-amber-500",
  };

  const showPlatformAlert = platformAlert?.active;
  const farmZoneStatus = farmHpai?.hpaiZoneStatus ?? "none";
  const housingRequiredSince = farmHpai?.hpaiHousingRequiredSince ? new Date(farmHpai.hpaiHousingRequiredSince) : null;
  const daysSinceHousing = housingRequiredSince ? Math.floor((Date.now() - housingRequiredSince.getTime()) / 86400000) : null;
  const organicClock16wk = daysSinceHousing !== null;
  const clockWarning = daysSinceHousing !== null && daysSinceHousing >= 98;
  const clockBreached = daysSinceHousing !== null && daysSinceHousing >= 112;
  const farmInZone = farmZoneStatus !== "none";

  if (!showPlatformAlert && !farmInZone && !organicClock16wk) return null;

  return (
    <div className="space-y-2 mb-1">
      {showPlatformAlert && (
        <div className={`flex items-start gap-3 p-3 rounded-lg text-white ${levelColours[platformAlert.level] ?? "bg-red-600"}`}>
          <ShieldAlert className="w-5 h-5 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">HPAI National Alert{platformAlert.level ? ` — ${platformAlert.level.charAt(0).toUpperCase() + platformAlert.level.slice(1)}` : ""}</p>
            {platformAlert.message && <p className="text-xs mt-0.5 opacity-90">{platformAlert.message}</p>}
            {platformAlert.date && <p className="text-xs opacity-75 mt-0.5">Issued: {new Date(platformAlert.date).toLocaleDateString("en-GB")}</p>}
          </div>
        </div>
      )}

      {farmInZone && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 border border-orange-200">
          <MapPin className="w-5 h-5 mt-0.5 text-orange-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-orange-900">This farm is within an HPAI {HPAI_ZONE_STATUSES.find(z => z.value === farmZoneStatus)?.label ?? farmZoneStatus}</p>
            {farmHpai?.hpaiZoneDate && <p className="text-xs text-orange-700 mt-0.5">Zone applied: {new Date(farmHpai.hpaiZoneDate).toLocaleDateString("en-GB")}</p>}
          </div>
          <Button size="sm" variant="outline" className="shrink-0 text-xs" onClick={() => { setZoneForm({ hpaiZoneStatus: farmHpai?.hpaiZoneStatus ?? "none", hpaiZoneDate: farmHpai?.hpaiZoneDate ?? "", hpaiHousingRequiredSince: farmHpai?.hpaiHousingRequiredSince ?? "" }); setEditingZone(true); }}>
            Update Zone
          </Button>
        </div>
      )}

      {organicClock16wk && (
        <div className={`flex items-start gap-3 p-3 rounded-lg border ${clockBreached ? "bg-red-50 border-red-300" : clockWarning ? "bg-amber-50 border-amber-300" : "bg-blue-50 border-blue-200"}`}>
          <Clock className={`w-5 h-5 mt-0.5 shrink-0 ${clockBreached ? "text-red-600" : clockWarning ? "text-amber-600" : "text-blue-600"}`} />
          <div className="flex-1 min-w-0">
            <p className={`font-semibold text-sm ${clockBreached ? "text-red-900" : clockWarning ? "text-amber-900" : "text-blue-900"}`}>
              Organic 16-week Housing Derogation: {daysSinceHousing} of 112 days
              {clockBreached && " — DEROGATION PERIOD EXCEEDED"}
              {!clockBreached && clockWarning && " — approaching limit"}
            </p>
            <p className={`text-xs mt-0.5 ${clockBreached ? "text-red-700" : clockWarning ? "text-amber-700" : "text-blue-700"}`}>
              Housing required since {housingRequiredSince!.toLocaleDateString("en-GB")}. After 112 days continuous housing, organic status cannot be maintained — contact your certification body.
            </p>
          </div>
        </div>
      )}

      {!farmInZone && !!farmId && (
        <div className="flex justify-end">
          <Button size="sm" variant="ghost" className="text-xs text-gray-400 h-6" onClick={() => { setZoneForm({ hpaiZoneStatus: "none", hpaiZoneDate: "", hpaiHousingRequiredSince: "" }); setEditingZone(true); }}>
            <MapPin className="w-3 h-3 mr-1" />Set HPAI zone status
          </Button>
        </div>
      )}

      <Dialog open={editingZone} onOpenChange={o => { if (!o) setEditingZone(false); }}>
        <DialogContent style={{ maxWidth: 440 }}>
          <DialogHeader><DialogTitle>Update HPAI Zone Status</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Zone Status</label>
              <select className="w-full border rounded px-2 py-1.5 text-sm" value={zoneForm.hpaiZoneStatus ?? "none"} onChange={e => setZoneForm((f: any) => ({ ...f, hpaiZoneStatus: e.target.value }))}>
                {HPAI_ZONE_STATUSES.map(z => <option key={z.value} value={z.value}>{z.label}</option>)}
              </select>
            </div>
            {zoneForm.hpaiZoneStatus !== "none" && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Zone Applied Date</label>
                <input type="date" className="w-full border rounded px-2 py-1.5 text-sm" value={zoneForm.hpaiZoneDate ?? ""} onChange={e => setZoneForm((f: any) => ({ ...f, hpaiZoneDate: e.target.value }))} />
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Housing Required Since (organic 16-week clock start)</label>
              <input type="date" className="w-full border rounded px-2 py-1.5 text-sm" value={zoneForm.hpaiHousingRequiredSince ?? ""} onChange={e => setZoneForm((f: any) => ({ ...f, hpaiHousingRequiredSince: e.target.value }))} />
              <p className="text-xs text-gray-500">Leave blank if not applicable. Set when mandatory housing order takes effect for organic farms.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingZone(false)}>Cancel</Button>
            <Button disabled={updateZoneMut.isPending} onClick={() => updateZoneMut.mutate()}>
              <Save className="w-3.5 h-3.5 mr-1" />{updateZoneMut.isPending ? "Saving…" : "Save Zone Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

