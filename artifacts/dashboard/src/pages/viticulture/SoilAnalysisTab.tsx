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
  Award, Globe, BadgeAlert, Beaker, Wrench, Gauge, Users, UserCheck, MapPin,
} from "lucide-react";
import { printSoilSampleLabel } from "@/lib/print-labels";
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
import { useFarmMembers } from "@/hooks/use-farm-members";

import { apiUrl as api } from "@/lib/api";
import { fmt, fmtDate, fmtNum, today, exportCSV, printExciseReturn, printOrganicWineRecords, PRESSURE_LABELS, BBCH_STAGES, UK_GRAPE_VARIETIES, UK_ROOTSTOCKS, OPERATION_TYPES, StatCard, Empty, ConfirmDialog, DataTable, useCrud, ViewField, RaiseTaskBtn } from "./shared";

type SoilSampleStatus = "pending_collection" | "collected" | "awaiting_results" | "complete";

const SOIL_ANALYSIS_TYPES = [
  "Soil Analysis", "Petiole (Leaf) Analysis", "Must Analysis", "Tissue Analysis",
];

const SAMPLE_STATUS_CONFIG: Record<SoilSampleStatus, { label: string; badge: string; step: number }> = {
  pending_collection: { label: "Awaiting Collection",  badge: "bg-amber-100 text-amber-800 border-amber-200",    step: 0 },
  collected:          { label: "Sample Collected",      badge: "bg-sky-100 text-sky-800 border-sky-200",          step: 1 },
  awaiting_results:   { label: "Awaiting Lab Results",  badge: "bg-purple-100 text-purple-800 border-purple-200", step: 2 },
  complete:           { label: "Results Received",      badge: "bg-green-100 text-green-800 border-green-200",    step: 3 },
};

const STEPPER_LABELS = ["Requested", "Collected", "Dispatched", "Results In"];

function SoilStepper({ status }: { status: string }) {
  const currentStep = SAMPLE_STATUS_CONFIG[status as SoilSampleStatus]?.step ?? 3;
  return (
    <div className="flex items-start gap-0 w-full mb-2">
      {STEPPER_LABELS.map((label, i) => (
        <div key={i} className="flex items-start flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1 min-w-0">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
              i < currentStep
                ? "bg-green-500 border-green-500 text-white"
                : i === currentStep
                ? "bg-primary border-primary text-primary-foreground"
                : "bg-white border-muted-foreground/25 text-muted-foreground/40"
            }`}>
              {i < currentStep ? <CheckCircle2 className="w-4 h-4" /> : <span>{i + 1}</span>}
            </div>
            <span className={`text-[10px] font-medium text-center leading-tight ${i <= currentStep ? "text-foreground" : "text-muted-foreground/40"}`}>
              {label}
            </span>
          </div>
          {i < STEPPER_LABELS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 mt-3.5 ${i < currentStep ? "bg-green-500" : "bg-muted-foreground/15"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export function SoilAnalysisTab({ farmId, blocks }: { farmId: number; blocks: Record<string, unknown>[] }) {
  const { data: records, isLoading, edit, remove } = useCrud(farmId, "vineyard-soil-analysis", "vineyard-soil-analysis");
  const analysisTypes = useLookupStrings("vineyard_soil_analysis_types", SOIL_ANALYSIS_TYPES);
  const labOptions = useLookupStrings("vineyard_laboratories", ["NRM Group", "Lancrop Laboratories", "ADAS Analytical Services", "Eurofins Agro UK", "Other"]);
  const qc = useQueryClient();
  const { toast } = useToast();

  // ── Staff names for StaffSelect ────────────────────────────────────────────
  const membersQ = useFarmMembers(farmId);
  const staffNames = (membersQ.data?.members ?? [])
    .filter(m => (m as any).isActive !== false)
    .map(m => `${m.firstName} ${m.lastName}`.trim());

  // ── External advisors (agronomists / consultants) ──────────────────────────
  const { data: advisorData } = useQuery<{ advisors: { id: number; name: string; supplierType: string; contactName?: string }[] }>({
    queryKey: ["vineyard-advisors", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/vineyard-advisors`), { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
  });
  const advisors = advisorData?.advisors ?? [];

  type DialogMode = "request" | "collect" | "dispatch" | "results" | "view";
  const [mode, setMode] = useState<DialogMode | null>(null);
  const [active, setActive] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const sf = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  const sfv = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));
  const blockName = (id: unknown) => (blocks.find(b => b.id === id) as Record<string, unknown> | undefined)?.blockName ?? id;
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));

  // "Requested By" source toggle
  const [requestedBySource, setRequestedBySource] = useState<"staff" | "external">("staff");

  // Task dialog state — opened after a request is created
  const [taskRecord, setTaskRecord] = useState<Record<string, unknown> | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

  const farmName = useFarmName(farmId);

  // ── Sample points — fetched when viewing a record ──────────────────────────
  const activeId = active && typeof active.id === "number" ? active.id : null;
  const { data: samplePointsData, refetch: refetchPoints } = useQuery<{
    points: { id: number; lat: string; lng: string; label: string | null; capturedBy: string | null; capturedAt: string }[];
  }>({
    queryKey: ["soil-sample-points", farmId, activeId],
    queryFn: () => fetch(api(`farms/${farmId}/vineyard-soil-analysis/${activeId}/sample-points`), { credentials: "include" }).then(r => r.json()),
    enabled: !!activeId && mode === "view",
  });
  const samplePoints = samplePointsData?.points ?? [];

  const deletePoint = useMutation({
    mutationFn: (pointId: number) => fetch(api(`farms/${farmId}/vineyard-soil-analysis/${activeId}/sample-points/${pointId}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => refetchPoints(),
  });

  const close = () => { setMode(null); setActive(null); setForm({}); setRequestedBySource("staff"); };

  const awaitingCount = (records as Record<string, unknown>[]).filter(r => r.status === "awaiting_results").length;
  const pendingCount = (records as Record<string, unknown>[]).filter(r => r.status === "pending_collection").length;

  const openRequest = () => { setActive(null); setForm({ requestDate: today }); setMode("request"); };
  const openCollect = (r: Record<string, unknown>) => { setActive(r); setForm({ collectionDate: today }); setMode("collect"); };
  const openDispatch = (r: Record<string, unknown>) => {
    setActive(r);
    setForm({ dispatchDate: today, labName: r.labName ?? "", sampleReference: r.sampleReference ?? "" });
    setMode("dispatch");
  };
  const openResults = (r: Record<string, unknown>) => {
    setActive(r);
    setForm({
      resultsReceivedDate: r.resultsReceivedDate ?? today,
      analysisDate: r.analysisDate ?? today,
      ph: r.ph ?? "", organicMatterPct: r.organicMatterPct ?? "",
      phosphorusMgL: r.phosphorusMgL ?? "", potassiumMgL: r.potassiumMgL ?? "",
      magnesiumMgL: r.magnesiumMgL ?? "", calciumMgL: r.calciumMgL ?? "",
      ironMgL: r.ironMgL ?? "", manganeseMgL: r.manganeseMgL ?? "",
      boronMgL: r.boronMgL ?? "", nitrogenMgL: r.nitrogenMgL ?? "",
      sulphurMgL: r.sulphurMgL ?? "", cecCmolKg: r.cecCmolKg ?? "",
      recommendations: r.recommendations ?? "", notes: r.notes ?? "",
    });
    setMode("results");
  };
  const openView = (r: Record<string, unknown>) => { setActive(r); setMode("view"); };
  const openNextAction = (r: Record<string, unknown>) => {
    const s = (r.status as SoilSampleStatus) ?? "complete";
    if (s === "pending_collection") openCollect(r);
    else if (s === "collected") openDispatch(r);
    else openResults(r);
  };
  const nextActionLabel = (s: string) => {
    if (s === "pending_collection") return "Record Collection";
    if (s === "collected") return "Mark Dispatched";
    if (s === "awaiting_results") return "Enter Results";
    return "Edit Results";
  };

  // ── Dedicated create mutation so we can capture the new record and open task dialog ──
  const createRequest = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const r = await fetch(api(`farms/${farmId}/vineyard-soil-analysis`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error("Save failed");
      return r.json() as Promise<{ record: Record<string, unknown> }>;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["vineyard-soil-analysis", farmId] });
      const record = data.record;
      close();
      setTaskRecord(record);
      setTaskDialogOpen(true);
    },
    onError: () => toast({ title: "Failed to create request", variant: "destructive" }),
  });

  const saveRequest = () => {
    createRequest.mutate({ ...form, status: "pending_collection" } as Record<string, unknown>);
  };
  const saveCollect = () => { edit.mutate({ id: active!.id as number, ...form, status: "collected" } as any); close(); };
  const saveDispatch = () => { edit.mutate({ id: active!.id as number, ...form, status: "awaiting_results" } as any); close(); };
  const saveResults = () => { edit.mutate({ id: active!.id as number, ...form, status: "complete" } as any); close(); };

  const soilYears = Array.from(new Set((records as Record<string, unknown>[]).map(r => {
    const d = r.requestDate ?? r.analysisDate;
    return d ? new Date(d as string).getFullYear() : null;
  }).filter(Boolean) as number[])).sort((a, b) => b - a);
  if (!soilYears.includes(new Date().getFullYear())) soilYears.unshift(new Date().getFullYear());
  const filteredSoil = yearFilter === "all" ? (records as Record<string, unknown>[]) : (records as Record<string, unknown>[]).filter(r => {
    const d = r.requestDate ?? r.analysisDate;
    return d ? new Date(d as string).getFullYear() === Number(yearFilter) : false;
  });
  const soilCsvCols = [
    { key: "requestReference", label: "Request Ref" },
    { key: "requestDate", label: "Requested", fmt: (r: Record<string, unknown>) => fmtDate(r.requestDate ?? r.analysisDate) },
    { key: "requestedBy", label: "Requested By" },
    { key: "blockId", label: "Block", fmt: (r: Record<string, unknown>) => String(blockName(r.blockId)) },
    { key: "analysisType", label: "Analysis Type" },
    { key: "labName", label: "Laboratory" },
    { key: "sampleReference", label: "Sample Ref" },
    { key: "status", label: "Status" },
    { key: "analysisDate", label: "Results Date", fmt: (r: Record<string, unknown>) => fmtDate(r.analysisDate) },
    { key: "ph", label: "pH" },
    { key: "organicMatterPct", label: "Organic Matter (%)" },
    { key: "phosphorusMgL", label: "Phosphorus (mg/L)" },
    { key: "potassiumMgL", label: "Potassium (mg/L)" },
    { key: "magnesiumMgL", label: "Magnesium (mg/L)" },
    { key: "recommendations", label: "Recommendations" },
  ];

  // ── "Requested By" helpers ─────────────────────────────────────────────────
  // When source toggle changes, clear the current requestedBy value
  const handleSourceChange = (src: "staff" | "external") => {
    setRequestedBySource(src);
    sfv("requestedBy", "");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-sm">Soil &amp; Leaf Analysis</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Multi-stage workflow: request a sample → field collection → dispatch to lab → record results. Attach lab report PDFs to completed records.
          </p>
        </div>
        <div className="flex gap-2 items-center shrink-0">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {soilYears.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => exportCSV(filteredSoil, "soil-analysis.csv", soilCsvCols)} disabled={!filteredSoil.length}><FileDown className="w-4 h-4 mr-1" />Export CSV</Button>
          <Button size="sm" onClick={openRequest} className="shrink-0">
            <Plus className="w-3.5 h-3.5 mr-1" />Request Analysis
          </Button>
        </div>
      </div>

      {/* Status banners */}
      {(awaitingCount > 0 || pendingCount > 0) && (
        <div className="space-y-2">
          {awaitingCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-purple-50 border border-purple-200 text-purple-800 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span><strong>{awaitingCount}</strong> sample{awaitingCount !== 1 ? "s" : ""} awaiting lab results — check for incoming reports.</span>
            </div>
          )}
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span><strong>{pendingCount}</strong> sample{pendingCount !== 1 ? "s" : ""} waiting to be collected from the field.</span>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <DataTable
          cols={[
            { key: "requestReference", label: "Ref", render: r => r.requestReference
              ? <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{String(r.requestReference)}</span>
              : <span className="text-muted-foreground text-xs">—</span>
            },
            { key: "status", label: "Status", render: r => {
              const cfg = SAMPLE_STATUS_CONFIG[(r.status as SoilSampleStatus) ?? "complete"];
              return <span className={`text-xs px-2 py-0.5 rounded-full border font-medium whitespace-nowrap ${cfg?.badge ?? ""}`}>{cfg?.label ?? "—"}</span>;
            }},
            { key: "requestDate", label: "Requested", render: r => fmtDate(r.requestDate ?? r.analysisDate) },
            { key: "blockId", label: "Block", render: r => fmt(blockName(r.blockId)) },
            { key: "analysisType", label: "Type" },
            { key: "requestedBy", label: "Requested By", render: r => fmt(r.requestedBy) },
            { key: "labName", label: "Lab" },
            { key: "analysisDate", label: "Results Date", render: r => r.status === "complete" ? fmtDate(r.analysisDate) : "—" },
            { key: "_action", label: "", render: r => {
              const s = (r.status as SoilSampleStatus) ?? "complete";
              return (
                <Button
                  size="sm"
                  variant={s === "complete" ? "ghost" : "outline"}
                  className={`h-7 text-xs whitespace-nowrap ${s !== "complete" ? "border-primary text-primary hover:bg-primary/5" : ""}`}
                  onClick={e => { e.stopPropagation(); openNextAction(r); }}
                >
                  {nextActionLabel(s)}<ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              );
            }},
          ]}
          rows={filteredSoil}
          onView={openView}
          onDelete={r => remove.mutate(r.id as number)} deleteMutation={remove}
        />
      )}

      {/* ── Request Dialog ──────────────────────────────────────────── */}
      <Dialog open={mode === "request"} onOpenChange={o => { if (!o) { close(); createRequest.reset(); } }}>
        <DialogContent style={{ maxWidth: "32rem" }}>
          <DialogHeader>
            <DialogTitle>Request Soil / Leaf Analysis</DialogTitle>
            <DialogDescription>Raise a sample request — a unique reference will be generated and a task can be assigned to a field worker for collection.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Request Date</Label><Input type="date" max={today} value={String(form.requestDate ?? today)} onChange={sf("requestDate")} /></div>
            <div>
              <Label>Block</Label>
              <Select value={form.blockId ? String(form.blockId) : "__none__"} onValueChange={v => sfv("blockId", v === "__none__" ? null : Number(v))}>
                <SelectTrigger><SelectValue placeholder="Select block" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— None / Farm-wide —</SelectItem>
                  {blocks.map(b => <SelectItem key={String(b.id)} value={String(b.id)}>{String((b as any).blockName ?? b.id)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Analysis Type *</Label>
              <Select value={String(form.analysisType ?? "")} onValueChange={v => sfv("analysisType", v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>{analysisTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {/* ── Requested By — dual source ─────────────────────────── */}
            <div className="col-span-2 space-y-2">
              <Label>Requested By</Label>
              {/* Source toggle */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleSourceChange("staff")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                    requestedBySource === "staff"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-white text-muted-foreground border-input hover:bg-muted"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />Staff Member
                </button>
                <button
                  type="button"
                  onClick={() => handleSourceChange("external")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                    requestedBySource === "external"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-white text-muted-foreground border-input hover:bg-muted"
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />External Provider
                </button>
              </div>

              {requestedBySource === "staff" ? (
                <StaffSelect
                  staffNames={staffNames}
                  loading={membersQ.isLoading}
                  value={String(form.requestedBy ?? "")}
                  onChange={v => sfv("requestedBy", v)}
                />
              ) : advisors.length > 0 ? (
                <Select value={String(form.requestedBy ?? "")} onValueChange={v => sfv("requestedBy", v)}>
                  <SelectTrigger><SelectValue placeholder="Select agronomist / consultant" /></SelectTrigger>
                  <SelectContent>
                    {advisors.map(a => (
                      <SelectItem key={a.id} value={a.name}>
                        <span>{a.name}</span>
                        {a.contactName && <span className="ml-1 text-muted-foreground text-xs">({a.contactName})</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                  No external advisors found. Add agronomists, consultants or other advisors via the Traders section (supplier type: <em>agronomist</em> or <em>consultant</em>).
                </div>
              )}
            </div>

            <div className="col-span-2"><Label>Instructions for Collector</Label><Textarea placeholder="Where to sample, depth, method, any special notes…" value={String(form.notes ?? "")} onChange={sf("notes")} rows={2} /></div>
          </div>
          <DialogMutationError mutation={createRequest} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button onClick={saveRequest} disabled={!form.analysisType || createRequest.isPending}>
              {createRequest.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              Create Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Task dialog — auto-opened after request creation ────────── */}
      {taskRecord && (
        <RaiseTaskDialog
          farmId={farmId}
          open={taskDialogOpen}
          onClose={() => { setTaskDialogOpen(false); setTaskRecord(null); }}
          defaultTitle={`Collect soil sample — ${String(taskRecord.requestReference ?? "")}`}
          defaultDescription={[
            taskRecord.analysisType ? `Analysis type: ${taskRecord.analysisType}` : "",
            taskRecord.blockId ? `Block: ${String(blockName(taskRecord.blockId))}` : "Farm-wide sample",
            taskRecord.notes ? `Instructions: ${taskRecord.notes}` : "",
          ].filter(Boolean).join("\n")}
          taskType="soil_analysis_collection"
          taskSourceId={String(taskRecord.id ?? "")}
          module="Viticulture"
          allowEditTitle={false}
        />
      )}

      {/* ── Collect Dialog ──────────────────────────────────────────── */}
      <Dialog open={mode === "collect"} onOpenChange={o => { if (!o) { close(); edit.reset(); } }}>
        <DialogContent style={{ maxWidth: "32rem" }}>
          <DialogHeader>
            <DialogTitle>Record Sample Collection</DialogTitle>
            <DialogDescription>
              {active && (
                <>
                  {active.requestReference && <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded mr-1">{String(active.requestReference)}</span>}
                  {fmt(blockName(active.blockId))} — {fmt(active.analysisType)}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <SoilStepper status="pending_collection" />
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Collection Date *</Label><Input type="date" max={today} value={String(form.collectionDate ?? today)} onChange={sf("collectionDate")} /></div>
            <div><Label>Collected By *</Label><StaffSelect staffNames={staffNames} loading={membersQ.isLoading} value={String(form.collectedBy ?? "")} onChange={v => sfv("collectedBy", v)} /></div>
            <div><Label>GPS Latitude</Label><Input type="number" step="any" placeholder="51.5074" value={String(form.collectionGpsLat ?? "")} onChange={sf("collectionGpsLat")} /></div>
            <div><Label>GPS Longitude</Label><Input type="number" step="any" placeholder="-1.2278" value={String(form.collectionGpsLng ?? "")} onChange={sf("collectionGpsLng")} /></div>
            <div className="col-span-2"><Label>Collection Notes</Label><Textarea placeholder="Exact location, sample depth, soil conditions…" value={String(form.collectionNotes ?? "")} onChange={sf("collectionNotes")} rows={2} /></div>
          </div>
          <DialogMutationError mutation={edit} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button onClick={saveCollect} disabled={!form.collectionDate || !form.collectedBy || edit.isPending}>
              {edit.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              Mark as Collected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dispatch Dialog ─────────────────────────────────────────── */}
      <Dialog open={mode === "dispatch"} onOpenChange={o => { if (!o) { close(); edit.reset(); } }}>
        <DialogContent style={{ maxWidth: "32rem" }}>
          <DialogHeader>
            <DialogTitle>Mark Sample as Dispatched to Lab</DialogTitle>
            <DialogDescription>
              {active && (
                <>
                  {active.requestReference && <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded mr-1">{String(active.requestReference)}</span>}
                  {fmt(blockName(active.blockId))} — collected {fmtDate(active.collectionDate)}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <SoilStepper status="collected" />
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Dispatch Date *</Label><Input type="date" max={today} value={String(form.dispatchDate ?? today)} onChange={sf("dispatchDate")} /></div>
            <div>
              <Label>Laboratory</Label>
              <Select value={String(form.labName ?? "")} onValueChange={v => sfv("labName", v)}>
                <SelectTrigger><SelectValue placeholder="Select laboratory" /></SelectTrigger>
                <SelectContent>{labOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label>Sample Reference / Barcode</Label><Input placeholder="Lab submission reference or barcode number" value={String(form.sampleReference ?? "")} onChange={sf("sampleReference")} /></div>
          </div>
          <DialogMutationError mutation={edit} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button onClick={saveDispatch} disabled={!form.dispatchDate || edit.isPending}>
              {edit.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              Mark as Dispatched
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Results Dialog ──────────────────────────────────────────── */}
      <Dialog open={mode === "results"} onOpenChange={o => { if (!o) { close(); edit.reset(); } }}>
        <DialogContent style={{ maxWidth: "40rem" }} className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{active?.status === "complete" ? "Edit Lab Results" : "Record Lab Results"}</DialogTitle>
            <DialogDescription>
              {active && (
                <>
                  {active.requestReference && <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded mr-1">{String(active.requestReference)}</span>}
                  {fmt(blockName(active.blockId))} — {fmt(active.analysisType)}{active.sampleReference ? ` · Lab ref: ${active.sampleReference}` : ""}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {active?.status !== "complete" && <SoilStepper status="awaiting_results" />}
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Results Received Date *</Label><Input type="date" max={today} value={String(form.resultsReceivedDate ?? today)} onChange={sf("resultsReceivedDate")} /></div>
            <div><Label>Analysis Date (on report)</Label><Input type="date" max={today} value={String(form.analysisDate ?? today)} onChange={sf("analysisDate")} /></div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide col-span-2 pt-1">Nutrient Values</p>
            <div><Label>pH</Label><Input type="number" step="0.01" value={String(form.ph ?? "")} onChange={sf("ph")} /></div>
            <div><Label>Organic Matter (%)</Label><Input type="number" step="0.01" value={String(form.organicMatterPct ?? "")} onChange={sf("organicMatterPct")} /></div>
            <div><Label>Phosphorus — P (mg/L)</Label><Input type="number" step="0.1" value={String(form.phosphorusMgL ?? "")} onChange={sf("phosphorusMgL")} /></div>
            <div><Label>Potassium — K (mg/L)</Label><Input type="number" step="0.1" value={String(form.potassiumMgL ?? "")} onChange={sf("potassiumMgL")} /></div>
            <div><Label>Magnesium — Mg (mg/L)</Label><Input type="number" step="0.1" value={String(form.magnesiumMgL ?? "")} onChange={sf("magnesiumMgL")} /></div>
            <div><Label>Calcium — Ca (mg/L)</Label><Input type="number" step="0.1" value={String(form.calciumMgL ?? "")} onChange={sf("calciumMgL")} /></div>
            <div><Label>Iron — Fe (mg/L)</Label><Input type="number" step="0.1" value={String(form.ironMgL ?? "")} onChange={sf("ironMgL")} /></div>
            <div><Label>Manganese — Mn (mg/L)</Label><Input type="number" step="0.1" value={String(form.manganeseMgL ?? "")} onChange={sf("manganeseMgL")} /></div>
            <div><Label>Boron — B (mg/L)</Label><Input type="number" step="0.1" value={String(form.boronMgL ?? "")} onChange={sf("boronMgL")} /></div>
            <div><Label>Nitrogen — N (mg/L)</Label><Input type="number" step="0.1" value={String(form.nitrogenMgL ?? "")} onChange={sf("nitrogenMgL")} /></div>
            <div><Label>Sulphur — S (mg/L)</Label><Input type="number" step="0.1" value={String(form.sulphurMgL ?? "")} onChange={sf("sulphurMgL")} /></div>
            <div><Label>CEC (cmol/kg)</Label><Input type="number" step="0.01" value={String(form.cecCmolKg ?? "")} onChange={sf("cecCmolKg")} /></div>
            <div className="col-span-2"><Label>Lab Recommendations</Label><Textarea value={String(form.recommendations ?? "")} onChange={sf("recommendations")} rows={2} placeholder="Recommendations from the lab report" /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={sf("notes")} rows={2} /></div>
          </div>
          <DialogMutationError mutation={edit} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button onClick={saveResults} disabled={!form.resultsReceivedDate || edit.isPending}>
              {edit.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              {active?.status === "complete" ? "Save Changes" : "Save Results"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── View Dialog ─────────────────────────────────────────────── */}
      {active && mode === "view" && (
        <Dialog open onOpenChange={close}>
          <DialogContent style={{ maxWidth: "44rem" }} className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-start justify-between gap-3">
                <DialogTitle className="flex items-center gap-2">
                  {!!active.requestReference && (
                    <span className="font-mono text-xs bg-gray-100 border border-gray-200 px-2 py-0.5 rounded text-gray-700">
                      {String(active.requestReference)}
                    </span>
                  )}
                  {fmt(blockName(active.blockId))} — {fmt(active.analysisType)}
                </DialogTitle>
                {!!active.requestReference && (
                  <button
                    onClick={() => printSoilSampleLabel({
                      requestReference: String(active.requestReference),
                      analysisType: String(active.analysisType ?? "Analysis"),
                      blockName: active.blockId ? String(blockName(active.blockId)) : null,
                      farmName,
                      requestedBy: active.requestedBy ? String(active.requestedBy) : null,
                      requestDate: active.requestDate ? new Date(String(active.requestDate)).toLocaleDateString("en-GB") : null,
                      instructions: active.notes ? String(active.notes) : null,
                    }, 4)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-medium shrink-0 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />Print Label
                  </button>
                )}
              </div>
            </DialogHeader>
            <SoilStepper status={(active.status as string) ?? "complete"} />

            <div className="space-y-4 text-sm">
              {/* Stage 1: Request */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Sample Request</p>
                <div className="grid grid-cols-2 gap-3">
                  <ViewField label="Requested On" value={fmtDate(active.requestDate ?? active.analysisDate)} />
                  <ViewField label="Requested By" value={fmt(active.requestedBy)} />
                  <ViewField label="Block" value={fmt(blockName(active.blockId))} />
                  <ViewField label="Analysis Type" value={fmt(active.analysisType)} />
                  {!!active.notes && <div className="col-span-2"><ViewField label="Instructions" value={fmt(active.notes)} /></div>}
                </div>
              </div>

              {/* Stage 2: Collection */}
              {["collected", "awaiting_results", "complete"].includes(active.status as string) && (
                <div className="border-t pt-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Sample Collection</p>
                  <div className="grid grid-cols-2 gap-3">
                    <ViewField label="Collected On" value={fmtDate(active.collectionDate)} />
                    <ViewField label="Collected By" value={fmt(active.collectedBy)} />
                    {!!active.collectionNotes && <div className="col-span-2"><ViewField label="Collection Notes" value={fmt(active.collectionNotes)} /></div>}
                  </div>
                  {/* Multi-point GPS locations */}
                  {samplePoints.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />GPS Sample Points ({samplePoints.length})
                      </p>
                      <div className="space-y-1.5">
                        {samplePoints.map((pt, i) => (
                          <div key={pt.id} className="flex items-center justify-between gap-2 bg-muted/40 rounded-md px-3 py-2 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-green-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</span>
                              <div>
                                <span className="font-mono text-gray-600">{Number(pt.lat).toFixed(6)}, {Number(pt.lng).toFixed(6)}</span>
                                {pt.label && <span className="ml-2 text-muted-foreground">— {pt.label}</span>}
                                {pt.capturedBy && <span className="text-muted-foreground/70 ml-1">(by {pt.capturedBy})</span>}
                              </div>
                            </div>
                            <button
                              onClick={() => deletePoint.mutate(pt.id)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                              title="Remove point"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${samplePoints[0].lat},${samplePoints[0].lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:underline"
                      >
                        <Map className="w-3 h-3" />View first point on map
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Stage 3: Dispatch */}
              {["awaiting_results", "complete"].includes(active.status as string) && (
                <div className="border-t pt-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Dispatch to Lab</p>
                  <div className="grid grid-cols-2 gap-3">
                    <ViewField label="Dispatched On" value={fmtDate(active.dispatchDate)} />
                    <ViewField label="Laboratory" value={fmt(active.labName)} />
                    <ViewField label="Sample Reference" value={fmt(active.sampleReference)} />
                  </div>
                </div>
              )}

              {/* Stage 4: Results */}
              {active.status === "complete" && (
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Lab Results</p>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { close(); setTimeout(() => openResults(active), 80); }}>
                      <Pencil className="w-3 h-3 mr-1" />Edit Results
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <ViewField label="Results Received" value={fmtDate(active.resultsReceivedDate ?? active.analysisDate)} />
                    <ViewField label="Analysis Date" value={fmtDate(active.analysisDate)} />
                    <ViewField label="pH" value={fmtNum(active.ph, 2)} />
                    <ViewField label="Organic Matter (%)" value={fmtNum(active.organicMatterPct, 2)} />
                    <ViewField label="Phosphorus — P (mg/L)" value={fmtNum(active.phosphorusMgL)} />
                    <ViewField label="Potassium — K (mg/L)" value={fmtNum(active.potassiumMgL)} />
                    <ViewField label="Magnesium — Mg (mg/L)" value={fmtNum(active.magnesiumMgL)} />
                    <ViewField label="Calcium — Ca (mg/L)" value={fmtNum(active.calciumMgL)} />
                    <ViewField label="Iron — Fe (mg/L)" value={fmtNum(active.ironMgL)} />
                    <ViewField label="Manganese — Mn (mg/L)" value={fmtNum(active.manganeseMgL)} />
                    <ViewField label="Boron — B (mg/L)" value={fmtNum(active.boronMgL)} />
                    <ViewField label="Nitrogen — N (mg/L)" value={fmtNum(active.nitrogenMgL)} />
                    <ViewField label="Sulphur — S (mg/L)" value={fmtNum(active.sulphurMgL)} />
                    <ViewField label="CEC (cmol/kg)" value={fmtNum(active.cecCmolKg, 2)} />
                    {!!active.recommendations && <div className="col-span-2"><ViewField label="Lab Recommendations" value={fmt(active.recommendations)} /></div>}
                  </div>
                </div>
              )}

              {/* Advance action for non-complete records */}
              {active.status !== "complete" && (
                <div className="border-t pt-3 flex justify-end">
                  <Button onClick={() => { close(); setTimeout(() => openNextAction(active), 80); }}>
                    <ChevronRight className="w-4 h-4 mr-1" />{nextActionLabel(active.status as string)}
                  </Button>
                </div>
              )}
            </div>

            {typeof active.id === "number" && (
              <div className="border-t pt-3 mt-1">
                <RecordAttachments farmId={farmId} recordType="vineyard-soil-analysis" recordId={active.id} />
              </div>
            )}
            <DialogFooter><Button variant="outline" onClick={close}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ─── Winery Stock Tab ─────────────────────────────────────────────────────────
