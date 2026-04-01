import React, { useState, useEffect, useRef } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { openPrintWindow } from "@/lib/print-report";
import { CropYearSelector } from "@/components/CropYearSelector";
import { currentCropYear, isInCropYear, cropYearLabel } from "@/lib/cropYear";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LabSelector } from "@/components/ui/LabSelector";
import { SoilLocationPicker } from "@/components/ui/SoilLocationPicker";
import { Redirect } from "wouter";
import {
  Plus, Search, Loader2, Pencil, Trash2, ChevronDown, ChevronUp,
  TestTube, Printer, FlaskConical, ArrowRight, CheckCircle, Clock, Archive,
  MoreHorizontal, MapPin, Map, TrendingUp, TrendingDown, Minus,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient, useQueries } from "@tanstack/react-query";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

type PageTab = "register" | "map" | "trends" | "print";
type StatusFilter = "all" | "sampled" | "sent_to_lab" | "results_received" | "archived";

function formatDate(val: string | null | undefined): string {
  if (!val) return "—";
  try { return new Date(val).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return val; }
}
function formatDateLong(val: string | null | undefined): string {
  if (!val) return "—";
  try { return new Date(val).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }); }
  catch { return val; }
}

interface FieldRecord { id: number; name: string; fieldReference: string | null; }
interface SoilTestResult { id: number; soilTestId: number; nutrient: string; value: string | null; unit: string | null; index: string | null; status: string | null; }
interface SoilTestRecord {
  id: number; farmId: number; fieldId: number;
  sampleDate: string; sampleReference: string | null;
  status: string; laboratory: string | null;
  sentToLabDate: string | null; resultsReceivedDate: string | null;
  sampleDepthCm: number | null; sampledBy: string | null; notes: string | null;
  latitude: string | null; longitude: string | null; locationDescription: string | null;
  createdAt: string;
  results?: SoilTestResult[];
}
interface Farm { id: number; name: string; address: string | null; postcode: string | null; cphNumber: string | null; redTractorId: string | null; }

const COMMON_NUTRIENTS = ["pH", "Phosphorus (P)", "Potassium (K)", "Magnesium (Mg)", "Nitrogen (N)", "Sulphur (SO3)", "Organic Matter (OM)", "Calcium (Ca)", "Sodium (Na)", "Boron (B)"];
const EMPTY_TEST = { fieldId: "", sampleDate: new Date().toISOString().slice(0, 10), laboratory: "", sampleReference: "", sampleDepthCm: "", sampledBy: "", notes: "" };
const EMPTY_RESULT = { nutrient: "", value: "", unit: "mg/l", index: "", status: "" };

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  sampled:          { label: "Sampled",          color: "bg-blue-50 text-blue-700 border-blue-200",    icon: <Clock className="w-3 h-3" /> },
  sent_to_lab:      { label: "Sent to Lab",       color: "bg-amber-50 text-amber-700 border-amber-200", icon: <ArrowRight className="w-3 h-3" /> },
  results_received: { label: "Results Received",  color: "bg-green-50 text-green-700 border-green-200", icon: <CheckCircle className="w-3 h-3" /> },
  archived:         { label: "Archived",          color: "bg-gray-100 text-gray-500 border-gray-200",   icon: <Archive className="w-3 h-3" /> },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.sampled;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

function resultStatusBadge(status: string | null) {
  if (!status) return null;
  const s = status.toLowerCase();
  const cls = s === "low" ? "bg-red-100 text-red-700 border-red-200"
    : s === "high" ? "bg-blue-100 text-blue-700 border-blue-200"
    : s === "adequate" || s === "optimal" ? "bg-green-100 text-green-700 border-green-200"
    : "bg-gray-100 text-gray-600 border-gray-200";
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cls}`}>{status}</span>;
}

const STATUS_FILTER_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All Samples" },
  { key: "sampled", label: "Sampled" },
  { key: "sent_to_lab", label: "Sent to Lab" },
  { key: "results_received", label: "Results Received" },
  { key: "archived", label: "Archived" },
];

function RegisterTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [cropYear, setCropYear] = useState(currentCropYear());
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [addTestOpen, setAddTestOpen] = useState(false);
  const [editTest, setEditTest] = useState<SoilTestRecord | null>(null);
  const [deleteTestId, setDeleteTestId] = useState<number | null>(null);
  const [testForm, setTestForm] = useState<typeof EMPTY_TEST>(EMPTY_TEST);
  const [labSupplierId, setLabSupplierId] = useState<number | null>(null);
  const [sampleLat, setSampleLat] = useState("");
  const [sampleLng, setSampleLng] = useState("");
  const [sampleLocationDesc, setSampleLocationDesc] = useState("");
  const [addResultFor, setAddResultFor] = useState<number | null>(null);
  const [resultForm, setResultForm] = useState<typeof EMPTY_RESULT>(EMPTY_RESULT);
  const [deleteResultInfo, setDeleteResultInfo] = useState<{ testId: number; resultId: number } | null>(null);

  const fieldsQ = useQuery<{ records: FieldRecord[] }>({
    queryKey: ["fields-soil", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fields`).then(r => r.json()),
  });
  const testsQ = useQuery<{ records: SoilTestRecord[] }>({
    queryKey: ["soil-tests", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/soil-tests`).then(r => r.json()),
  });

  const fields: FieldRecord[] = fieldsQ.data?.records ?? [];
  const allTests: SoilTestRecord[] = testsQ.data?.records ?? [];

  const expandedIds = Array.from(expanded);
  const detailResults = useQueries({
    queries: expandedIds.map(testId => ({
      queryKey: ["soil-test-detail", farmId, testId],
      queryFn: (): Promise<{ record: SoilTestRecord & { results: SoilTestResult[] } }> =>
        fetch(`/api/farms/${farmId}/soil-tests/${testId}`).then(r => r.json()),
      enabled: true,
    })),
  });
  const detailMap: Record<number, SoilTestRecord & { results: SoilTestResult[] }> = {};
  expandedIds.forEach((testId, i) => { const d = detailResults[i]?.data?.record; if (d) detailMap[testId] = d; });
  const detailLoadingMap: Record<number, boolean> = {};
  expandedIds.forEach((testId, i) => { detailLoadingMap[testId] = detailResults[i]?.isLoading ?? false; });

  const createTest = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetch(`/api/farms/${farmId}/soil-tests`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["soil-tests", farmId] });
      setAddTestOpen(false); setEditTest(null); setTestForm(EMPTY_TEST);
      setSampleLat(""); setSampleLng(""); setSampleLocationDesc("");
      if (data?.record?.id) setExpanded(prev => new Set([...prev, data.record.id]));
    },
  });
  const updateTest = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
      fetch(`/api/farms/${farmId}/soil-tests/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["soil-tests", farmId] });
      setEditTest(null); setTestForm(EMPTY_TEST); setAddTestOpen(false);
      setSampleLat(""); setSampleLng(""); setSampleLocationDesc("");
    },
  });
  const deleteTest = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/soil-tests/${id}`, { method: "DELETE" }),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["soil-tests", farmId] });
      setDeleteTestId(null);
      setExpanded(prev => { const next = new Set(prev); next.delete(id); return next; });
    },
  });
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      fetch(`/api/farms/${farmId}/soil-tests/${id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["soil-tests", farmId] }); },
  });
  const addResult = useMutation({
    mutationFn: ({ testId, body }: { testId: number; body: Record<string, unknown> }) =>
      fetch(`/api/farms/${farmId}/soil-tests/${testId}/results`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: (_, vars) => { qc.invalidateQueries({ queryKey: ["soil-test-detail", farmId, vars.testId] }); setAddResultFor(null); setResultForm(EMPTY_RESULT); },
  });
  const deleteResult = useMutation({
    mutationFn: ({ testId, resultId }: { testId: number; resultId: number }) =>
      fetch(`/api/farms/${farmId}/soil-tests/${testId}/results/${resultId}`, { method: "DELETE" }),
    onSuccess: (_, vars) => { qc.invalidateQueries({ queryKey: ["soil-test-detail", farmId, vars.testId] }); setDeleteResultInfo(null); },
  });

  const filtered = allTests.filter(t => {
    if (!isInCropYear(t.sampleDate, cropYear)) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (!search) return true;
    const fieldName = fields.find(f => f.id === t.fieldId)?.name ?? "";
    return fieldName.toLowerCase().includes(search.toLowerCase())
      || t.laboratory?.toLowerCase().includes(search.toLowerCase())
      || t.sampleReference?.toLowerCase().includes(search.toLowerCase())
      || t.sampledBy?.toLowerCase().includes(search.toLowerCase());
  });

  const yearTests = allTests.filter(t => isInCropYear(t.sampleDate, cropYear));
  const counts: Record<string, number> = { all: yearTests.length };
  for (const t of yearTests) { counts[t.status] = (counts[t.status] ?? 0) + 1; }

  function openAddTest() {
    setEditTest(null); setTestForm(EMPTY_TEST); setLabSupplierId(null);
    setSampleLat(""); setSampleLng(""); setSampleLocationDesc("");
    setAddTestOpen(true);
  }
  function openEditTest(t: SoilTestRecord) {
    setEditTest(t);
    setTestForm({ fieldId: String(t.fieldId), sampleDate: t.sampleDate?.slice(0, 10) ?? "", laboratory: t.laboratory ?? "", sampleReference: t.sampleReference ?? "", sampleDepthCm: String(t.sampleDepthCm ?? ""), sampledBy: t.sampledBy ?? "", notes: t.notes ?? "" });
    setLabSupplierId((t as unknown as { labSupplierId?: number | null }).labSupplierId ?? null);
    setSampleLat(t.latitude ?? ""); setSampleLng(t.longitude ?? ""); setSampleLocationDesc(t.locationDescription ?? "");
    setAddTestOpen(true);
  }
  function handleTestSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body: Record<string, unknown> = {
      ...testForm,
      fieldId: Number(testForm.fieldId),
      sampleDate: new Date(testForm.sampleDate).toISOString(),
      sampleDepthCm: testForm.sampleDepthCm ? Number(testForm.sampleDepthCm) : null,
      sampledBy: testForm.sampledBy || null,
      sampleReference: testForm.sampleReference || null,
      labSupplierId: labSupplierId ?? null,
      latitude: sampleLat || null,
      longitude: sampleLng || null,
      locationDescription: sampleLocationDesc || null,
    };
    if (editTest) { updateTest.mutate({ id: editTest.id, body }); }
    else { createTest.mutate(body); }
  }
  function handleResultSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!addResultFor) return;
    const body = { ...resultForm, value: resultForm.value || null, index: resultForm.index || null, status: resultForm.status || null };
    addResult.mutate({ testId: addResultFor, body });
  }
  function toggleExpand(id: number) {
    setExpanded(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }

  const NEXT_STATUS: Record<string, { status: string; label: string } | null> = {
    sampled: { status: "sent_to_lab", label: "Mark as Sent to Lab" },
    sent_to_lab: { status: "results_received", label: "Mark Results Received" },
    results_received: null,
    archived: null,
  };

  return (
    <>
      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {STATUS_FILTER_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              statusFilter === tab.key
                ? "bg-primary text-white border-primary"
                : "bg-white text-foreground/60 border-border hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {tab.label}
            {counts[tab.key] != null && (
              <span className={`ml-1.5 text-xs rounded-full px-1.5 py-0.5 ${statusFilter === tab.key ? "bg-white/20" : "bg-black/5"}`}>
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <Input placeholder="Search by field, lab, reference, sampler..." className="pl-9 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <CropYearSelector value={cropYear} onChange={setCropYear} />
        <Button onClick={openAddTest} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Register Sample
        </Button>
      </div>

      {testsQ.isLoading ? (
        <div className="text-center py-12 text-foreground/50"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="text-center py-16 px-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/5 flex items-center justify-center mb-4">
              <TestTube className="w-8 h-8 text-primary/40" />
            </div>
            <h3 className="text-lg font-semibold text-foreground/80 mb-1">No samples in register</h3>
            <p className="text-foreground/50 text-sm">{search || statusFilter !== "all" ? "No samples match your filter." : "Register your first soil sample to begin tracking. Samples taken on the mobile app will appear here automatically after sync."}</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(test => {
            const fieldName = fields.find(f => f.id === test.fieldId)?.name ?? `Field #${test.fieldId}`;
            const isExp = expanded.has(test.id);
            const detail = detailMap[test.id];
            const detailLoading = detailLoadingMap[test.id] ?? false;
            const nextStatus = NEXT_STATUS[test.status ?? "sampled"];
            return (
              <Card key={test.id} className="overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                      <FlaskConical className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-foreground">{fieldName}</span>
                        {test.sampleReference && (
                          <span className="text-xs font-mono bg-black/5 px-1.5 py-0.5 rounded">{test.sampleReference}</span>
                        )}
                        <StatusBadge status={test.status ?? "sampled"} />
                      </div>
                      <p className="text-xs text-foreground/50 mt-0.5">
                        {formatDate(test.sampleDate)}
                        {test.laboratory && <> · {test.laboratory}</>}
                        {test.sampleDepthCm && <> · {test.sampleDepthCm}cm depth</>}
                        {test.sampledBy && <> · Sampled by {test.sampledBy}</>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 rounded-md hover:bg-black/5 text-foreground/40 hover:text-foreground">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        {nextStatus && (
                          <DropdownMenuItem onClick={() => updateStatus.mutate({ id: test.id, status: nextStatus.status })}>
                            <ArrowRight className="w-4 h-4 mr-2 text-primary" />{nextStatus.label}
                          </DropdownMenuItem>
                        )}
                        {test.status !== "archived" && (
                          <DropdownMenuItem onClick={() => updateStatus.mutate({ id: test.id, status: "archived" })}>
                            <Archive className="w-4 h-4 mr-2 text-foreground/40" />Archive
                          </DropdownMenuItem>
                        )}
                        {test.status === "archived" && (
                          <DropdownMenuItem onClick={() => updateStatus.mutate({ id: test.id, status: "sampled" })}>
                            <Clock className="w-4 h-4 mr-2 text-blue-500" />Restore to Sampled
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openEditTest(test)}>
                          <Pencil className="w-4 h-4 mr-2" />Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteTestId(test.id)} className="text-red-600 focus:text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <button onClick={() => toggleExpand(test.id)} className="p-1.5 rounded-md hover:bg-black/5 text-foreground/40 hover:text-foreground">
                      {isExp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isExp && (
                  <div className="border-t border-border/50 px-5 py-4 bg-muted/20">
                    {/* Status timeline */}
                    <div className="flex items-center gap-3 mb-4 text-xs text-foreground/50">
                      <span className="font-semibold text-foreground/70">Timeline:</span>
                      <span>Sampled {formatDate(test.sampleDate)}</span>
                      {test.sentToLabDate && <><ArrowRight className="w-3 h-3" /><span>Sent to lab {formatDate(test.sentToLabDate)}</span></>}
                      {test.resultsReceivedDate && <><ArrowRight className="w-3 h-3" /><span>Results received {formatDate(test.resultsReceivedDate)}</span></>}
                    </div>

                    {/* GPS location */}
                    {(test.latitude && test.longitude) && (
                      <div className="flex items-center gap-2 mb-4 text-xs text-foreground/60 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                        <MapPin className="w-3.5 h-3.5 text-green-600 shrink-0" />
                        <span className="font-mono text-green-800">{parseFloat(test.latitude).toFixed(6)}, {parseFloat(test.longitude).toFixed(6)}</span>
                        {test.locationDescription && <span className="text-green-700 before:content-['·'] before:mx-1.5">{test.locationDescription}</span>}
                        <a
                          href={`https://maps.google.com/?q=${test.latitude},${test.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-auto text-primary hover:underline whitespace-nowrap"
                        >
                          View on map ↗
                        </a>
                      </div>
                    )}

                    {detailLoading && !detail ? (
                      <div className="text-center py-4 text-foreground/40 text-sm"><Loader2 className="w-4 h-4 animate-spin mx-auto mb-1" />Loading results...</div>
                    ) : (
                      <>
                        {detail?.results && detail.results.length > 0 ? (
                          <div className="overflow-x-auto mb-4">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b border-border">
                                  <th className="text-left py-2 pr-4 font-bold text-foreground/50 uppercase tracking-wider">Nutrient</th>
                                  <th className="text-right py-2 pr-4 font-bold text-foreground/50 uppercase tracking-wider">Value</th>
                                  <th className="text-left py-2 pr-4 font-bold text-foreground/50 uppercase tracking-wider">Unit</th>
                                  <th className="text-left py-2 pr-4 font-bold text-foreground/50 uppercase tracking-wider">AHDB Index</th>
                                  <th className="text-left py-2 pr-4 font-bold text-foreground/50 uppercase tracking-wider">Status</th>
                                  <th className="text-right py-2"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {detail.results.map(r => (
                                  <tr key={r.id} className="border-b border-border/30 hover:bg-black/[0.02]">
                                    <td className="py-2 pr-4 font-medium text-foreground">{r.nutrient}</td>
                                    <td className="py-2 pr-4 text-right font-mono font-semibold text-foreground/80">{r.value ?? "—"}</td>
                                    <td className="py-2 pr-4 text-foreground/60">{r.unit ?? "—"}</td>
                                    <td className="py-2 pr-4 font-mono text-foreground/70">{r.index ?? "—"}</td>
                                    <td className="py-2 pr-4">{resultStatusBadge(r.status)}</td>
                                    <td className="py-2 text-right">
                                      <button onClick={() => setDeleteResultInfo({ testId: test.id, resultId: r.id })} className="p-1 rounded hover:bg-red-50 text-foreground/30 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-sm text-foreground/40 italic mb-4">
                            {test.status === "sampled" || test.status === "sent_to_lab"
                              ? "No lab results yet — add results when the lab report arrives."
                              : "No nutrient results recorded for this sample."}
                          </p>
                        )}

                        {addResultFor === test.id ? (
                          <form onSubmit={handleResultSubmit} className="border border-border/50 rounded-xl p-4 bg-white space-y-3">
                            <p className="text-xs font-bold uppercase tracking-wider text-foreground/50 mb-2">Add Lab Result</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              <div className="sm:col-span-2">
                                <label className="text-xs font-medium text-foreground/60 mb-1 block">Nutrient <span className="text-red-500">*</span></label>
                                <div className="flex gap-1.5">
                                  <select
                                    className="flex-1 h-8 rounded-md border border-input bg-background px-2 py-1 text-xs"
                                    value={COMMON_NUTRIENTS.includes(resultForm.nutrient) ? resultForm.nutrient : ""}
                                    onChange={e => e.target.value && setResultForm(f => ({ ...f, nutrient: e.target.value }))}
                                  >
                                    <option value="">Select...</option>
                                    {COMMON_NUTRIENTS.map(n => <option key={n} value={n}>{n}</option>)}
                                  </select>
                                  <Input className="h-8 text-xs w-32" placeholder="or type..." value={!COMMON_NUTRIENTS.includes(resultForm.nutrient) ? resultForm.nutrient : ""} onChange={e => setResultForm(f => ({ ...f, nutrient: e.target.value }))} />
                                </div>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-foreground/60 mb-1 block">Value</label>
                                <Input className="h-8 text-xs" type="number" step="0.01" placeholder="e.g. 6.5" value={resultForm.value} onChange={e => setResultForm(f => ({ ...f, value: e.target.value }))} />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-foreground/60 mb-1 block">Unit</label>
                                <select className="w-full h-8 rounded-md border border-input bg-background px-2 py-1 text-xs" value={resultForm.unit} onChange={e => setResultForm(f => ({ ...f, unit: e.target.value }))}>
                                  {["mg/l", "kg/ha", "%", "meq/100g", "ppm", "—"].map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-foreground/60 mb-1 block">AHDB Index</label>
                                <select className="w-full h-8 rounded-md border border-input bg-background px-2 py-1 text-xs" value={resultForm.index} onChange={e => setResultForm(f => ({ ...f, index: e.target.value }))}>
                                  <option value="">—</option>
                                  {["0", "0-", "1", "2-", "2+", "3", "4"].map(i => <option key={i} value={i}>{i}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-foreground/60 mb-1 block">Status</label>
                                <select className="w-full h-8 rounded-md border border-input bg-background px-2 py-1 text-xs" value={resultForm.status} onChange={e => setResultForm(f => ({ ...f, status: e.target.value }))}>
                                  <option value="">—</option>
                                  {["Low", "Adequate", "Optimal", "High", "Excessive"].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                              </div>
                            </div>
                            <div className="flex gap-2 pt-1 justify-end">
                              <Button type="button" size="sm" variant="outline" onClick={() => { setAddResultFor(null); setResultForm(EMPTY_RESULT); }}>Cancel</Button>
                              <Button type="submit" size="sm" disabled={!resultForm.nutrient || addResult.isPending}>
                                {addResult.isPending && <Loader2 className="w-3 h-3 animate-spin mr-1" />} Add Result
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { setAddResultFor(test.id); setResultForm(EMPTY_RESULT); }}>
                            <Plus className="w-3.5 h-3.5" /> Add Lab Result
                          </Button>
                        )}

                        {test.notes && (
                          <p className="text-xs text-foreground/50 italic mt-3 border-t border-border/30 pt-3">Notes: {test.notes}</p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit dialog */}
      <Dialog open={addTestOpen} onOpenChange={(o) => { if (!o) { setAddTestOpen(false); setEditTest(null); setTestForm(EMPTY_TEST); setSampleLat(""); setSampleLng(""); setSampleLocationDesc(""); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-amber-600" />
              {editTest ? "Edit Sample" : "Register Soil Sample"}
            </DialogTitle>
            <DialogDescription>
              {editTest ? "Update the sample details." : "Register a new soil sample. A reference will be auto-generated if left blank. Lab results can be added once the report arrives."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTestSubmit} className="space-y-4 pt-1">
            <div>
              <label className="text-sm font-medium text-foreground/70 mb-1 block">Field <span className="text-red-500">*</span></label>
              <select className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" value={testForm.fieldId} onChange={e => setTestForm(f => ({ ...f, fieldId: e.target.value }))} required>
                <option value="">Select field...</option>
                {fields.map(f => <option key={f.id} value={f.id}>{f.name}{f.fieldReference ? ` (${f.fieldReference})` : ""}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Sample Date <span className="text-red-500">*</span></label>
                <Input type="date" value={testForm.sampleDate} onChange={e => setTestForm(f => ({ ...f, sampleDate: e.target.value }))} required />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Depth (cm)</label>
                <Input type="number" min="0" max="200" placeholder="e.g. 15" value={testForm.sampleDepthCm} onChange={e => setTestForm(f => ({ ...f, sampleDepthCm: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Sample Reference</label>
                <Input placeholder="Auto-generated if blank" value={testForm.sampleReference} onChange={e => setTestForm(f => ({ ...f, sampleReference: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Sampled By</label>
                <Input placeholder="Name of sampler" value={testForm.sampledBy} onChange={e => setTestForm(f => ({ ...f, sampledBy: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <LabSelector
                  farmId={farmId}
                  value={labSupplierId}
                  labName={testForm.laboratory || null}
                  onChange={(id, name) => { setLabSupplierId(id); setTestForm(f => ({ ...f, laboratory: name ?? "" })); }}
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Notes</label>
                <Input placeholder="Any additional notes" value={testForm.notes} onChange={e => setTestForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <SoilLocationPicker
                  lat={sampleLat}
                  lng={sampleLng}
                  locationDescription={sampleLocationDesc}
                  onLatLngChange={(lat, lng) => { setSampleLat(lat); setSampleLng(lng); }}
                  onDescriptionChange={setSampleLocationDesc}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setAddTestOpen(false); setEditTest(null); setTestForm(EMPTY_TEST); }}>Cancel</Button>
              <Button type="submit" disabled={createTest.isPending || updateTest.isPending}>
                {(createTest.isPending || updateTest.isPending) && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {editTest ? "Update Sample" : "Register Sample"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete test confirmation */}
      <Dialog open={deleteTestId !== null} onOpenChange={() => setDeleteTestId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Soil Sample</DialogTitle></DialogHeader>
          <p className="text-foreground/70 text-sm">This will permanently delete this sample and all its lab results from the register. Cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTestId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteTestId && deleteTest.mutate(deleteTestId)} disabled={deleteTest.isPending}>
              {deleteTest.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete result confirmation */}
      <Dialog open={deleteResultInfo !== null} onOpenChange={() => setDeleteResultInfo(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Remove Lab Result</DialogTitle></DialogHeader>
          <p className="text-foreground/70 text-sm">Remove this nutrient reading from the sample record?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteResultInfo(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteResultInfo && deleteResult.mutate(deleteResultInfo)} disabled={deleteResult.isPending}>
              {deleteResult.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />} Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PrintTab({ farmId }: { farmId: number }) {
  const [printYear, setPrintYear] = useState<number | "all">("all");
  const [printStatus, setPrintStatus] = useState<string>("all");

  const fieldsQ = useQuery<{ records: FieldRecord[] }>({ queryKey: ["fields-soil", farmId], queryFn: () => fetch(`/api/farms/${farmId}/fields`).then(r => r.json()) });
  const testsQ = useQuery<{ records: SoilTestRecord[] }>({ queryKey: ["soil-tests", farmId], queryFn: () => fetch(`/api/farms/${farmId}/soil-tests`).then(r => r.json()) });
  const farmQ = useQuery<{ record: Farm }>({ queryKey: ["farm", farmId], queryFn: () => fetch(`/api/farms/${farmId}`).then(r => r.json()) });

  const fields: FieldRecord[] = fieldsQ.data?.records ?? [];
  const allTests: SoilTestRecord[] = testsQ.data?.records ?? [];
  const farm = farmQ.data?.record;
  const years = [...new Set(allTests.map(t => new Date(t.sampleDate).getFullYear()))].sort((a, b) => b - a);

  const testDetailResults = useQueries({
    queries: allTests.map(test => ({
      queryKey: ["soil-test-detail", farmId, test.id],
      queryFn: (): Promise<{ record: SoilTestRecord & { results: SoilTestResult[] } }> =>
        fetch(`/api/farms/${farmId}/soil-tests/${test.id}`).then(r => r.json()),
    })),
  });
  const testsWithResults = allTests.map((test, i) => ({ ...test, results: testDetailResults[i]?.data?.record?.results ?? [] }));
  const filteredTests = testsWithResults
    .filter(t => printYear === "all" || new Date(t.sampleDate).getFullYear() === printYear)
    .filter(t => printStatus === "all" || t.status === printStatus);

  const handlePrint = () => {
    const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const meta = [
      farm?.cphNumber ? `CPH: ${farm.cphNumber}` : null,
      farm?.redTractorId ? `Red Tractor ID: ${farm.redTractorId}` : null,
    ].filter(Boolean).join("  ·  ");
    const farmLine = `<div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #1a3a1a;padding-bottom:6px;margin-bottom:8px">
      <div>
        <h1 style="font-size:12px;font-weight:700;color:#1a3a1a;margin:0 0 2px">Soil Sample Register</h1>
        ${farm ? `<p style="font-size:7.5px;color:#374151;margin:4px 0;line-height:1.5"><strong>${farm.name}</strong>${meta ? "  ·  " + meta : ""}</p>` : ""}
        ${printYear !== "all" ? `<p style="font-size:7.5px;color:#444;margin:4px 0;line-height:1.5">Year: ${printYear}</p>` : ""}
      </div>
      <div style="text-align:right;font-size:7px;color:#374151;line-height:1.8">
        <div style="display:inline-block;background:#dc2626;color:#fff;font-size:6.5px;font-weight:700;padding:2px 6px;border-radius:3px;letter-spacing:.05em;margin-bottom:3px">RED TRACTOR</div><br>
        <span>Printed: ${today}</span><br>
        <span>${filteredTests.length} sample${filteredTests.length !== 1 ? "s" : ""}</span>
      </div>
    </div>`;
    const statusLabel = (s: string) => STATUS_CONFIG[s]?.label ?? s;
    const testBlocks = filteredTests.map(test => {
      const fieldName = fields.find(f => f.id === test.fieldId)?.name ?? `Field #${test.fieldId}`;
      const resultsRows = (test.results ?? []).map((r, i) =>
        `<tr style="background:${i % 2 ? "#f9fafb" : "#fff"}"><td style="border:1px solid #e5e7eb;padding:4px 8px;font-weight:600">${r.nutrient}</td><td style="border:1px solid #e5e7eb;padding:4px 8px;font-family:monospace">${r.value ?? "—"}</td><td style="border:1px solid #e5e7eb;padding:4px 8px">${r.unit ?? "—"}</td><td style="border:1px solid #e5e7eb;padding:4px 8px;font-family:monospace">${r.index ?? "—"}</td><td style="border:1px solid #e5e7eb;padding:4px 8px">${r.status ?? "—"}</td></tr>`
      ).join("");
      const hasResults = (test.results ?? []).length > 0;
      return `<div style="margin-bottom:24px;page-break-inside:avoid">
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:10px 14px;margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div>
              <p style="font-size:12px;font-weight:700;margin:0 0 2px">${fieldName} — <span style="font-family:monospace">${test.sampleReference ?? "—"}</span></p>
              <p style="font-size:10px;color:#374151;margin:0">${formatDateLong(test.sampleDate)}${test.sampleDepthCm ? ` · ${test.sampleDepthCm}cm depth` : ""}${test.laboratory ? ` · ${test.laboratory}` : ""}${test.sampledBy ? ` · Sampled by ${test.sampledBy}` : ""}</p>
            </div>
            <span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:12px;border:1px solid #d1d5db;background:#fff">${statusLabel(test.status ?? "sampled")}</span>
          </div>
          ${test.sentToLabDate ? `<p style="font-size:9px;color:#555;margin:4px 0 0">Sent to lab: ${formatDate(test.sentToLabDate)}${test.resultsReceivedDate ? ` · Results received: ${formatDate(test.resultsReceivedDate)}` : ""}</p>` : ""}
        </div>
        ${hasResults ? `<table style="width:100%;border-collapse:collapse;font-size:10px"><thead><tr style="background:#f3f4f6"><th style="border:1px solid #e5e7eb;padding:4px 8px;text-align:left">Nutrient</th><th style="border:1px solid #e5e7eb;padding:4px 8px;text-align:left">Value</th><th style="border:1px solid #e5e7eb;padding:4px 8px;text-align:left">Unit</th><th style="border:1px solid #e5e7eb;padding:4px 8px;text-align:left">AHDB Index</th><th style="border:1px solid #e5e7eb;padding:4px 8px;text-align:left">Status</th></tr></thead><tbody>${resultsRows}</tbody></table>` : `<p style="font-size:10px;color:#555;font-style:italic;margin:4px 0">Lab results pending</p>`}
        ${test.notes ? `<p style="font-size:9px;color:#444;font-style:italic;margin:4px 0 0">Notes: ${test.notes}</p>` : ""}
      </div>`;
    }).join("");
    openPrintWindow(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Soil Sample Register</title><style>
      @page { size: A4; margin: 0.9cm 1.1cm; }
      *, *::before, *::after { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      body { font-family: Arial, Helvetica, sans-serif; font-size: 8px; color: #111; margin: 0; padding: 0; }
      table { width: 100%; border-collapse: collapse; font-size: 7.5px; }
      th { background: #1a3a1a; padding: 4px 5px; color: #fff; font-weight: 700; font-size: 6.5px; text-transform: uppercase; letter-spacing: .05em; text-align: left; }
      td { padding: 3px 5px; border-bottom: 1px solid #e5e7eb; border-right: 1px solid #f0f0f0; vertical-align: top; }
      tr:nth-child(even) { background: #f8fafc; }
      .footer { margin-top: 10px; padding-top: 6px; border-top: 1px solid #d1d5db; display: flex; justify-content: space-between; font-size: 6.5px; color: #555; }
    </style></head><body>
    ${farmLine}${testBlocks}
    <div class="footer">
      <span>Retain for a minimum of 3 years and make available at Red Tractor audit inspection.</span>
      <span>BDE Farm Trac · ${today}</span>
    </div>
    </body></html>`);
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end mb-6">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">Print Sample Register</h3>
          <p className="text-sm text-foreground/50">Export a printable record for assessors or Red Tractor inspections.</p>
        </div>
        <div className="flex gap-3 items-end">
          <div>
            <label className="text-xs font-medium text-foreground/60 mb-1 block">Filter by year</label>
            <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={printYear} onChange={e => setPrintYear(e.target.value === "all" ? "all" : parseInt(e.target.value))}>
              <option value="all">All years</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-foreground/60 mb-1 block">Filter by status</label>
            <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={printStatus} onChange={e => setPrintStatus(e.target.value)}>
              <option value="all">All statuses</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" /> Print / Save PDF
          </Button>
        </div>
      </div>
      <div className="text-sm text-foreground/50 border-t border-border/30 pt-4">
        {filteredTests.length} sample{filteredTests.length !== 1 ? "s" : ""} will be included
        {filteredTests.filter(t => (t.results ?? []).length === 0).length > 0 && (
          <span className="ml-2 text-amber-600">· {filteredTests.filter(t => (t.results ?? []).length === 0).length} pending lab results</span>
        )}
      </div>
    </Card>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const STATUS_PIN_COLORS: Record<string, string> = {
  sampled:          "#3b82f6",
  sent_to_lab:      "#f59e0b",
  results_received: "#16a34a",
  archived:         "#9ca3af",
};

function destroyLeafletMap(map: import("leaflet").Map | null) {
  if (!map) return;
  try { map.off(); map.remove(); } catch { }
}

function extractNutrient(results: SoilTestResult[], names: string[]): string | null {
  for (const name of names) {
    const r = results.find(r => r.nutrient.toLowerCase().includes(name.toLowerCase()));
    if (r) return r.value ?? (r.index ? `Index ${r.index}` : null);
  }
  return null;
}

function extractIndex(results: SoilTestResult[], names: string[]): string | null {
  for (const name of names) {
    const r = results.find(r => r.nutrient.toLowerCase().includes(name.toLowerCase()));
    if (r?.index) return r.index;
  }
  return null;
}

// ─── Map Tab ───────────────────────────────────────────────────────────────

function MapTab({ farmId }: { farmId: number }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<import("leaflet").Map | null>(null);
  const [leafletReady, setLeafletReady] = useState(false);

  const fieldsQ = useQuery<{ records: FieldRecord[] }>({
    queryKey: ["fields-soil-map", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fields`, { credentials: "include" }).then(r => r.json()),
  });
  const testsQ = useQuery<{ records: SoilTestRecord[] }>({
    queryKey: ["soil-tests", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/soil-tests`, { credentials: "include" }).then(r => r.json()),
  });

  const fields: FieldRecord[] = fieldsQ.data?.records ?? [];
  const gpsTests = (testsQ.data?.records ?? []).filter(t => t.latitude && t.longitude);

  const detailResults = useQueries({
    queries: gpsTests.map(t => ({
      queryKey: ["soil-test-detail", farmId, t.id],
      queryFn: (): Promise<{ record: SoilTestRecord & { results: SoilTestResult[] } }> =>
        fetch(`/api/farms/${farmId}/soil-tests/${t.id}`, { credentials: "include" }).then(r => r.json()),
    })),
  });

  const detailMap: Record<number, SoilTestResult[]> = {};
  gpsTests.forEach((t, i) => {
    detailMap[t.id] = detailResults[i]?.data?.record?.results ?? [];
  });
  const allLoaded = gpsTests.length === 0 || !detailResults.some(r => r.isLoading);

  useEffect(() => {
    import("leaflet").then((L) => {
      if (!("_leafletLoaded" in window)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
        (window as unknown as Record<string, unknown>)["_leafletLoaded"] = true;
      }
      (window as unknown as Record<string, unknown>)["_L"] = L;
      setLeafletReady(true);
    });
    return () => { destroyLeafletMap(leafletMapRef.current); leafletMapRef.current = null; };
  }, []);

  useEffect(() => {
    if (!leafletReady || !mapRef.current || !allLoaded) return;
    const L = (window as unknown as Record<string, unknown>)["_L"] as typeof import("leaflet");

    destroyLeafletMap(leafletMapRef.current);
    leafletMapRef.current = null;

    const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: true }).setView([52.4, -1.5], 6);
    map.scrollWheelZoom.enable();
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { attribution: "Tiles &copy; Esri", maxZoom: 20 }
    ).addTo(map);
    leafletMapRef.current = map;

    const allBounds: [number, number][] = [];

    gpsTests.forEach(test => {
      if (!test.latitude || !test.longitude) return;
      const lat = parseFloat(test.latitude);
      const lng = parseFloat(test.longitude);
      if (isNaN(lat) || isNaN(lng)) return;

      const fieldName = fields.find(f => f.id === test.fieldId)?.name ?? `Field #${test.fieldId}`;
      const pinColor = STATUS_PIN_COLORS[test.status ?? "sampled"] ?? "#6b7280";
      const statusLabel = STATUS_CONFIG[test.status ?? "sampled"]?.label ?? test.status;
      const results = detailMap[test.id] ?? [];

      const pH = extractNutrient(results, ["pH", "ph"]);
      const pVal = extractNutrient(results, ["Phosphorus", "phosphorus", "P)"]);
      const pIdx = extractIndex(results, ["Phosphorus", "phosphorus", "P)"]);
      const kVal = extractNutrient(results, ["Potassium", "potassium", "K)"]);
      const kIdx = extractIndex(results, ["Potassium", "potassium", "K)"]);
      const mgVal = extractNutrient(results, ["Magnesium", "magnesium", "Mg)"]);
      const mgIdx = extractIndex(results, ["Magnesium", "magnesium", "Mg)"]);

      const nutrientRow = (label: string, val: string | null, idx: string | null) =>
        `<tr><td style="padding:2px 6px 2px 0;color:#6b7280;font-size:11px">${label}</td>
              <td style="padding:2px 0;font-family:monospace;font-size:11px;font-weight:600;color:#111">${val ?? "—"}</td>
              ${idx ? `<td style="padding:2px 0 2px 6px;font-size:10px;color:#6b7280">Index ${idx}</td>` : "<td></td>"}
         </tr>`;

      const hasResults = results.length > 0;
      const nutrientTable = hasResults
        ? `<table style="margin-top:6px;border-collapse:collapse;width:100%">
             ${pH ? nutrientRow("pH", pH, null) : ""}
             ${pVal || pIdx ? nutrientRow("Phosphorus (P)", pVal, pIdx) : ""}
             ${kVal || kIdx ? nutrientRow("Potassium (K)", kVal, kIdx) : ""}
             ${mgVal || mgIdx ? nutrientRow("Magnesium (Mg)", mgVal, mgIdx) : ""}
           </table>`
        : `<p style="font-size:11px;color:#9ca3af;font-style:italic;margin:4px 0 0">Lab results pending</p>`;

      const popupHtml = `
        <div style="font-family:system-ui;font-size:13px;min-width:200px;max-width:260px;padding:2px 0">
          <p style="font-weight:700;margin:0 0 2px;color:#111">${fieldName}</p>
          <p style="margin:0 0 4px;font-family:monospace;font-size:10px;color:#6b7280">${test.sampleReference ?? "No ref"}</p>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px">
            <span style="font-size:10px;color:#6b7280">${formatDate(test.sampleDate)}</span>
            <span style="font-size:10px;font-weight:600;padding:1px 8px;border-radius:10px;background:${pinColor}22;color:${pinColor};border:1px solid ${pinColor}40">${statusLabel}</span>
          </div>
          ${test.locationDescription ? `<p style="font-size:10px;color:#6b7280;margin:2px 0;font-style:italic">${test.locationDescription}</p>` : ""}
          ${nutrientTable}
          ${test.sampledBy ? `<p style="font-size:10px;color:#9ca3af;margin:4px 0 0">Sampled by ${test.sampledBy}</p>` : ""}
        </div>`;

      const pinHtml = `<div style="width:26px;height:26px;border-radius:50%;background:${pinColor};border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="13" height="13"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
      </div>`;
      const icon = L.divIcon({ html: pinHtml, className: "", iconSize: [26, 26], iconAnchor: [13, 13] });
      const marker = L.marker([lat, lng], { icon }).addTo(map);
      marker.bindPopup(popupHtml, { maxWidth: 280 });
      allBounds.push([lat, lng]);
    });

    if (allBounds.length > 0) {
      map.fitBounds(allBounds as [number, number][], { padding: [60, 60], maxZoom: 16 });
    }
  }, [leafletReady, allLoaded, gpsTests, fields, detailMap]);

  const loading = testsQ.isLoading || !allLoaded;
  const noGps = !loading && gpsTests.length === 0;

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <span key={key} className="inline-flex items-center gap-1.5 text-xs font-medium">
            <span className="w-3 h-3 rounded-full inline-block" style={{ background: STATUS_PIN_COLORS[key] }} />
            {cfg.label}
          </span>
        ))}
        <span className="text-xs text-foreground/40 ml-2">Click any pin to see sample details and nutrient results</span>
      </div>

      <div className="rounded-xl border border-border overflow-hidden" style={{ position: "relative" }}>
        {(loading || !leafletReady) && (
          <div className="absolute inset-0 bg-muted flex items-center justify-center z-10" style={{ height: 480 }}>
            <div className="flex items-center gap-2 text-foreground/50 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading sample map…
            </div>
          </div>
        )}
        {noGps && (
          <div className="absolute inset-0 bg-muted/80 flex flex-col items-center justify-center z-10" style={{ height: 480 }}>
            <MapPin className="w-8 h-8 text-foreground/20 mb-2" />
            <p className="text-sm font-semibold text-foreground/50">No GPS-tagged samples yet</p>
            <p className="text-xs text-foreground/40 mt-1">Use "Pick on map" when registering a sample to add it here.</p>
          </div>
        )}
        <div ref={mapRef} style={{ height: 480, width: "100%" }} />
      </div>

      {gpsTests.length > 0 && (
        <p className="text-xs text-foreground/40">{gpsTests.length} of {testsQ.data?.records.length ?? 0} samples have GPS coordinates · Showing all years</p>
      )}
    </div>
  );
}

// ─── Trends Tab ────────────────────────────────────────────────────────────

const TREND_NUTRIENTS = [
  { key: "ph",   label: "pH",             names: ["pH", "ph"],              color: "#7c3aed", target: 6.5, unit: "",      higherIsBetter: true,  targetNote: "Target ≥ 6.5 for arable" },
  { key: "p",    label: "Phosphorus (P)", names: ["Phosphorus", "phospho"], color: "#ea580c", target: 2,   unit: "index", higherIsBetter: false, targetNote: "AHDB Index 2 = optimal" },
  { key: "k",    label: "Potassium (K)",  names: ["Potassium", "potass"],   color: "#0891b2", target: 2,   unit: "index", higherIsBetter: false, targetNote: "AHDB Index 2 = optimal" },
  { key: "mg",   label: "Magnesium (Mg)", names: ["Magnesium", "magnes"],   color: "#16a34a", target: 2,   unit: "index", higherIsBetter: false, targetNote: "AHDB Index 2 = optimal" },
];

function getNutrientValue(results: SoilTestResult[], names: string[]): number | null {
  for (const name of names) {
    const r = results.find(r => r.nutrient.toLowerCase().includes(name.toLowerCase()));
    if (r) {
      const v = parseFloat(r.index ?? r.value ?? "");
      if (!isNaN(v)) return v;
    }
  }
  return null;
}

function TrendsTab({ farmId }: { farmId: number }) {
  const [selectedFieldId, setSelectedFieldId] = useState<number | "">("");

  const fieldsQ = useQuery<{ records: FieldRecord[] }>({
    queryKey: ["fields-soil-trends", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fields`, { credentials: "include" }).then(r => r.json()),
  });
  const testsQ = useQuery<{ records: SoilTestRecord[] }>({
    queryKey: ["soil-tests", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/soil-tests`, { credentials: "include" }).then(r => r.json()),
  });

  const fields: FieldRecord[] = fieldsQ.data?.records ?? [];
  const allTests: SoilTestRecord[] = testsQ.data?.records ?? [];

  const fieldTests = selectedFieldId
    ? allTests.filter(t => t.fieldId === selectedFieldId && t.status === "results_received")
        .sort((a, b) => new Date(a.sampleDate).getTime() - new Date(b.sampleDate).getTime())
    : [];

  const detailResults = useQueries({
    queries: fieldTests.map(t => ({
      queryKey: ["soil-test-detail", farmId, t.id],
      queryFn: (): Promise<{ record: SoilTestRecord & { results: SoilTestResult[] } }> =>
        fetch(`/api/farms/${farmId}/soil-tests/${t.id}`, { credentials: "include" }).then(r => r.json()),
    })),
  });

  const fieldsWithResults = allTests.length > 0
    ? fields.filter(f => allTests.some(t => t.fieldId === f.id && t.status === "results_received"))
    : [];

  const chartData = fieldTests.map((test, i) => {
    const results = detailResults[i]?.data?.record?.results ?? [];
    const row: Record<string, unknown> = {
      date: new Date(test.sampleDate).toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
      ref: test.sampleReference ?? "",
    };
    TREND_NUTRIENTS.forEach(n => {
      row[n.key] = getNutrientValue(results, n.names);
    });
    return row;
  });

  const allDetailLoaded = fieldTests.length === 0 || !detailResults.some(r => r.isLoading);

  function TrendArrow({ current, previous, higherIsBetter }: { current: number | null; previous: number | null; higherIsBetter: boolean }) {
    if (current === null || previous === null) return <Minus className="w-3.5 h-3.5 text-foreground/30" />;
    const diff = current - previous;
    if (Math.abs(diff) < 0.1) return <Minus className="w-3.5 h-3.5 text-foreground/40" />;
    const improving = higherIsBetter ? diff > 0 : Math.abs(current - 2) < Math.abs(previous - 2);
    if (diff > 0) return <TrendingUp className={`w-3.5 h-3.5 ${improving ? "text-green-600" : "text-red-500"}`} />;
    return <TrendingDown className={`w-3.5 h-3.5 ${improving ? "text-green-600" : "text-red-500"}`} />;
  }

  const latestResults = fieldTests.length > 0 ? detailResults[fieldTests.length - 1]?.data?.record?.results ?? [] : [];
  const prevResults = fieldTests.length > 1 ? detailResults[fieldTests.length - 2]?.data?.record?.results ?? [] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div>
          <label className="text-xs font-medium text-foreground/60 mb-1 block">Field</label>
          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-sm min-w-48"
            value={selectedFieldId}
            onChange={e => setSelectedFieldId(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">Select a field…</option>
            {fieldsWithResults.map(f => (
              <option key={f.id} value={f.id}>{f.name}{f.fieldReference ? ` (${f.fieldReference})` : ""}</option>
            ))}
          </select>
        </div>
        {selectedFieldId && fieldsWithResults.length === 0 && (
          <p className="text-sm text-foreground/50 mt-4">No fields with completed lab results yet.</p>
        )}
      </div>

      {!selectedFieldId && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TrendingUp className="w-10 h-10 text-foreground/20 mb-3" />
          <p className="text-sm font-semibold text-foreground/50">Select a field to view soil health trends</p>
          <p className="text-xs text-foreground/40 mt-1">Shows how pH, P, K and Mg have changed across all sampling events</p>
        </div>
      )}

      {selectedFieldId && !allDetailLoaded && (
        <div className="flex items-center gap-2 text-foreground/50 text-sm py-8 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading nutrient history…
        </div>
      )}

      {selectedFieldId && allDetailLoaded && fieldTests.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TestTube className="w-10 h-10 text-foreground/20 mb-3" />
          <p className="text-sm font-semibold text-foreground/50">No completed lab results for this field</p>
          <p className="text-xs text-foreground/40 mt-1">Results will appear here once samples reach "Results Received" status.</p>
        </div>
      )}

      {selectedFieldId && allDetailLoaded && fieldTests.length === 1 && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          Only one set of results recorded — trends appear when there are two or more sampling events with results.
        </p>
      )}

      {selectedFieldId && allDetailLoaded && fieldTests.length >= 1 && (
        <>
          {/* Summary row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TREND_NUTRIENTS.map(n => {
              const latest = getNutrientValue(latestResults, n.names);
              const prev = getNutrientValue(prevResults, n.names);
              return (
                <div key={n.key} className="rounded-xl border border-border bg-white p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">{n.label}</span>
                    <TrendArrow current={latest} previous={prev} higherIsBetter={n.higherIsBetter} />
                  </div>
                  <p className="text-2xl font-bold" style={{ color: n.color }}>{latest !== null ? latest.toFixed(n.key === "ph" ? 1 : 0) : "—"}</p>
                  <p className="text-xs text-foreground/40 mt-0.5">{n.unit || "value"} · {n.targetNote}</p>
                  {prev !== null && latest !== null && (
                    <p className="text-xs text-foreground/50 mt-1">
                      Previous: {prev.toFixed(n.key === "ph" ? 1 : 0)} · {latest > prev ? "▲" : latest < prev ? "▼" : "="} {Math.abs(latest - prev).toFixed(n.key === "ph" ? 1 : 0)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Charts */}
          {fieldTests.length >= 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {TREND_NUTRIENTS.map(n => {
                const hasData = chartData.some(d => d[n.key] !== null);
                if (!hasData) return null;
                return (
                  <div key={n.key} className="rounded-xl border border-border bg-white p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-foreground">{n.label}</h4>
                      <span className="text-xs text-foreground/40">{n.targetNote}</span>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
                        <Tooltip
                          contentStyle={{ fontSize: 11, borderRadius: 8 }}
                          formatter={(val: unknown) => [typeof val === "number" ? val.toFixed(n.key === "ph" ? 2 : 1) : String(val ?? ""), n.label] as [React.ReactNode, string]}
                          labelFormatter={(l) => `Sample: ${l}`}
                        />
                        <ReferenceLine y={n.target} stroke={n.color} strokeDasharray="5 3" opacity={0.5} label={{ value: `Target ${n.target}`, fontSize: 9, fill: n.color }} />
                        <Line
                          type="monotone"
                          dataKey={n.key}
                          stroke={n.color}
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: n.color, strokeWidth: 0 }}
                          activeDot={{ r: 6 }}
                          connectNulls={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sampling history table */}
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-3 bg-muted/30 border-b border-border">
              <h4 className="text-sm font-semibold text-foreground">All Sampling Events</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="text-left py-2 px-4 font-bold text-foreground/50 uppercase tracking-wider">Date</th>
                    <th className="text-left py-2 px-3 font-bold text-foreground/50 uppercase tracking-wider">Reference</th>
                    {TREND_NUTRIENTS.map(n => (
                      <th key={n.key} className="text-right py-2 px-3 font-bold uppercase tracking-wider" style={{ color: n.color }}>{n.label.split(" ")[0]}</th>
                    ))}
                    <th className="text-left py-2 px-3 font-bold text-foreground/50 uppercase tracking-wider">Lab</th>
                  </tr>
                </thead>
                <tbody>
                  {fieldTests.map((test, i) => {
                    const res = detailResults[i]?.data?.record?.results ?? [];
                    return (
                      <tr key={test.id} className="border-b border-border/30 hover:bg-black/[0.02]">
                        <td className="py-2 px-4 text-foreground/70">{formatDate(test.sampleDate)}</td>
                        <td className="py-2 px-3 font-mono text-foreground/60">{test.sampleReference ?? "—"}</td>
                        {TREND_NUTRIENTS.map(n => {
                          const val = getNutrientValue(res, n.names);
                          return (
                            <td key={n.key} className="py-2 px-3 text-right font-mono font-semibold" style={{ color: val !== null ? n.color : undefined }}>
                              {val !== null ? val.toFixed(n.key === "ph" ? 2 : 1) : "—"}
                            </td>
                          );
                        })}
                        <td className="py-2 px-3 text-foreground/50">{test.laboratory ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function SoilTestsPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<PageTab>("register");

  if (!farmId) return <Redirect to="/" />;

  return (
    <AppLayout title="Soil Sample Register">
      <TabBar>
        <TabButton active={tab === "register"} onClick={() => setTab("register")}>Sample Register</TabButton>
        <TabButton active={tab === "map"} onClick={() => setTab("map")}>
          <Map className="w-3.5 h-3.5 mr-1 inline-block" />Sample Map
        </TabButton>
        <TabButton active={tab === "trends"} onClick={() => setTab("trends")}>
          <TrendingUp className="w-3.5 h-3.5 mr-1 inline-block" />Soil Trends
        </TabButton>
        <TabButton active={tab === "print"} onClick={() => setTab("print")}>Print / Export</TabButton>
      </TabBar>
      <div className="mt-6">
        {tab === "register" && <RegisterTab farmId={farmId} />}
        {tab === "map" && <MapTab farmId={farmId} />}
        {tab === "trends" && <TrendsTab farmId={farmId} />}
        {tab === "print" && <PrintTab farmId={farmId} />}
      </div>
    </AppLayout>
  );
}
