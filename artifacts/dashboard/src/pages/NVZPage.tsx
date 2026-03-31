import React, { useState, useMemo } from "react";
import { useLookupStrings } from "@/hooks/use-lookup";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TabButton } from "@/components/ui/tab-button";
import {
  AlertTriangle, CheckCircle2, Info, Plus, Trash2,
  Leaf, FlaskConical, Droplets,
} from "lucide-react";

const PRODUCT_TYPES: { value: string; label: string; isOrganic: boolean; isLiquid: boolean }[] = [
  { value: "synthetic-n", label: "Synthetic N (AN/Urea/UAN)", isOrganic: false, isLiquid: false },
  { value: "slurry", label: "Slurry (cattle/pig)", isOrganic: true, isLiquid: true },
  { value: "digestate", label: "Digestate (AD)", isOrganic: true, isLiquid: true },
  { value: "fy", label: "Farm Yard Manure (solid)", isOrganic: true, isLiquid: false },
  { value: "poultry-manure", label: "Poultry Manure", isOrganic: true, isLiquid: false },
  { value: "compost", label: "Compost / Green Waste", isOrganic: true, isLiquid: false },
  { value: "organic-n", label: "Other Organic N", isOrganic: true, isLiquid: false },
];

const APP_METHODS = [
  "Trailing shoe", "Dribble bar", "Injected", "Band spread",
  "Broadcast (surface)", "Umbilical", "Tanker spread",
  "Spinner / broadcast", "Foliar", "Irrigation",
];

const LAND_TYPES = ["arable", "grassland", "mixed"];

const ORGANIC_TYPES = new Set(["slurry", "digestate", "fy", "poultry-manure", "compost", "organic-n"]);
const LIQUID_TYPES = new Set(["slurry", "digestate"]);

const TOTAL_N_LIMIT = 250;
const ORGANIC_N_LIMIT = 170;

interface ClosedPeriodInfo { closed: boolean; reason: string | null }

function checkTodayClosedPeriod(productType: string, landType: string | null | undefined): ClosedPeriodInfo {
  if (!LIQUID_TYPES.has(productType)) return { closed: false, reason: null };
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const dayOfYear = month * 100 + day;

  if (landType === "arable") {
    if (dayOfYear >= 801 || dayOfYear <= 131) {
      return { closed: true, reason: "Slurry/digestate on arable land — closed period 1 Aug to 31 Jan" };
    }
  } else if (landType === "grassland") {
    if (dayOfYear >= 1015 || dayOfYear <= 131) {
      return { closed: true, reason: "Slurry/digestate on grassland — closed period 15 Oct to 31 Jan" };
    }
  } else if (landType === "mixed") {
    if (dayOfYear >= 801 || dayOfYear <= 131) {
      return { closed: true, reason: "Slurry/digestate on mixed land — closed period applies (1 Aug–31 Jan for arable portion)" };
    }
  }
  return { closed: false, reason: null };
}

function checkDateClosedPeriod(productType: string, landType: string | null | undefined, date: Date): ClosedPeriodInfo {
  if (!LIQUID_TYPES.has(productType)) return { closed: false, reason: null };
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfYear = month * 100 + day;

  if (landType === "arable") {
    if (dayOfYear >= 801 || dayOfYear <= 131) {
      return { closed: true, reason: "Applied during closed period (1 Aug–31 Jan, arable)" };
    }
  } else if (landType === "grassland") {
    if (dayOfYear >= 1015 || dayOfYear <= 131) {
      return { closed: true, reason: "Applied during closed period (15 Oct–31 Jan, grassland)" };
    }
  } else if (landType === "mixed") {
    if (dayOfYear >= 801 || dayOfYear <= 131) {
      return { closed: true, reason: "Applied during closed period (1 Aug–31 Jan)" };
    }
  }
  return { closed: false, reason: null };
}

interface FieldSummary {
  fieldId: number; fieldName: string; areaHectares: string | null;
  isNvz: boolean; nvzLandType: string | null;
  totalNKg: number; organicNKg: number;
  totalNKgHa: number; organicNKgHa: number;
  applicationCount: number;
}

interface NvzApplication {
  id: number; fieldId: number; fieldName: string | null;
  applicationDate: string; productName: string; productType: string;
  nitrogenKgHa: string; areaAppliedHa: string; totalNitrogenKg: string;
  applicationMethod: string | null; notes: string | null; createdAt: string;
}

interface Field { id: number; name: string; areaHectares: string | null; isNvz: boolean; nvzLandType: string | null; }

const emptyForm = {
  fieldId: "",
  applicationDate: new Date().toISOString().slice(0, 10),
  productName: "",
  productType: "",
  nitrogenKgHa: "",
  areaAppliedHa: "",
  applicationMethod: "",
  notes: "",
};

function NBar({ value, limit, className = "" }: { value: number; limit: number; className?: string }) {
  const pct = Math.min((value / limit) * 100, 100);
  const over = value > limit;
  const warn = value > limit * 0.85;
  return (
    <div className={`h-2 rounded-full overflow-hidden bg-black/5 ${className}`}>
      <div
        className={`h-full rounded-full transition-all ${over ? "bg-red-500" : warn ? "bg-amber-400" : "bg-green-500"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function NvzFieldCard({ fs, onEdit }: { fs: FieldSummary; onEdit: (fs: FieldSummary) => void }) {
  const totalOver = fs.totalNKgHa > TOTAL_N_LIMIT;
  const organicOver = fs.organicNKgHa > ORGANIC_N_LIMIT;
  const totalWarn = fs.totalNKgHa > TOTAL_N_LIMIT * 0.85 && !totalOver;
  const organicWarn = fs.organicNKgHa > ORGANIC_N_LIMIT * 0.85 && !organicOver;
  const areaHa = parseFloat(String(fs.areaHectares ?? "0")) || null;

  const closedPeriodWarnings = LIQUID_TYPES.size > 0
    ? ["slurry", "digestate"].map((pt) => checkTodayClosedPeriod(pt, fs.nvzLandType)).filter((c) => c.closed)
    : [];
  const hasTodayClosed = closedPeriodWarnings.length > 0;

  return (
    <div className={`border rounded-xl p-4 space-y-3 ${fs.isNvz ? "border-green-200 bg-green-50/30" : "border-border bg-card"}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground">{fs.fieldName}</span>
            {fs.isNvz ? (
              <Badge className="bg-green-100 text-green-800 border-green-200 text-[11px]">NVZ</Badge>
            ) : (
              <Badge variant="outline" className="text-foreground/40 text-[11px]">Non-NVZ</Badge>
            )}
            {fs.nvzLandType && (
              <Badge variant="outline" className="capitalize text-[11px]">{fs.nvzLandType}</Badge>
            )}
          </div>
          <div className="text-xs text-foreground/50 mt-0.5">
            {areaHa ? `${areaHa.toFixed(2)} ha` : "Area unknown"} · {fs.applicationCount} application{fs.applicationCount !== 1 ? "s" : ""} in 12 months
          </div>
        </div>
        <button
          onClick={() => onEdit(fs)}
          className="text-xs text-foreground/50 hover:text-foreground border border-border/50 rounded-lg px-2 py-1 bg-white whitespace-nowrap"
        >
          NVZ settings
        </button>
      </div>

      {hasTodayClosed && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>Closed period active today — slurry/digestate spreading not permitted on this field</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-foreground/60">Total N (12-month)</span>
            <span className={`font-semibold ${totalOver ? "text-red-600" : totalWarn ? "text-amber-600" : "text-foreground"}`}>
              {fs.totalNKgHa.toFixed(1)} <span className="font-normal text-foreground/40">/ {TOTAL_N_LIMIT} kg/ha</span>
            </span>
          </div>
          <NBar value={fs.totalNKgHa} limit={TOTAL_N_LIMIT} />
          {totalOver && (
            <div className="text-[11px] text-red-600 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Exceeds 250 kg N/ha annual limit
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-foreground/60">Organic N (12-month)</span>
            <span className={`font-semibold ${organicOver ? "text-red-600" : organicWarn ? "text-amber-600" : "text-foreground"}`}>
              {fs.organicNKgHa.toFixed(1)} <span className="font-normal text-foreground/40">/ {ORGANIC_N_LIMIT} kg/ha</span>
            </span>
          </div>
          <NBar value={fs.organicNKgHa} limit={ORGANIC_N_LIMIT} />
          {organicOver && (
            <div className="text-[11px] text-red-600 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Exceeds 170 kg organic N/ha NVZ limit
            </div>
          )}
        </div>
      </div>

      {fs.applicationCount === 0 && (
        <div className="text-xs text-foreground/40 italic">No applications logged in the last 12 months</div>
      )}
    </div>
  );
}

export default function NVZPage() {
  const { farmId } = useAppStore();
  const appMethods = useLookupStrings("nvz_application_methods", APP_METHODS);
  const { toast } = useToast();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"summary" | "log" | "risk-assessments">("summary");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [nvzEditField, setNvzEditField] = useState<FieldSummary | null>(null);
  const [nvzEditForm, setNvzEditForm] = useState({ isNvz: false, nvzLandType: "" });

  const [raAddOpen, setRaAddOpen] = useState(false);
  const [raViewItem, setRaViewItem] = useState<any>(null);
  const [raEditItem, setRaEditItem] = useState<any>(null);
  const [raDeleteId, setRaDeleteId] = useState<number | null>(null);
  const emptyRaForm = { assessmentDate: "", assessedBy: "", soilType: "", drainageRisk: "", slopeRisk: "", distanceToWatercourse: "", floodRisk: "", organicMatterLevel: "", applicationRestrictionsIdentified: "", mitigationMeasures: "", overallRiskLevel: "", nextReviewDate: "", notes: "" };
  const [raForm, setRaForm] = useState({ ...emptyRaForm });

  const summaryQ = useQuery<{ summary: FieldSummary[] }>({
    queryKey: ["nvz-summary", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/nvz/field-summary`).then((r) => r.json()),
    enabled: !!farmId,
  });

  const appsQ = useQuery<{ records: NvzApplication[] }>({
    queryKey: ["nvz-applications", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/nvz-applications`).then((r) => r.json()),
    enabled: !!farmId,
  });

  const fieldsQ = useQuery<{ records: Field[] }>({
    queryKey: ["fields", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fields`).then((r) => r.json()),
    enabled: !!farmId,
  });

  const riskAssessmentsQ = useQuery<{ records: any[] }>({
    queryKey: ["nvz-risk-assessments", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/nvz-risk-assessments`).then(r => r.json()),
    enabled: !!farmId,
  });

  const raCreateMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/nvz-risk-assessments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Risk assessment saved" }); qc.invalidateQueries({ queryKey: ["nvz-risk-assessments", farmId] }); setRaAddOpen(false); setRaForm({ ...emptyRaForm }); },
  });
  const raUpdateMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) => fetch(`/api/farms/${farmId}/nvz-risk-assessments/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Risk assessment updated" }); qc.invalidateQueries({ queryKey: ["nvz-risk-assessments", farmId] }); setRaEditItem(null); },
  });
  const raDeleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/nvz-risk-assessments/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Risk assessment deleted" }); qc.invalidateQueries({ queryKey: ["nvz-risk-assessments", farmId] }); setRaDeleteId(null); },
  });

  const summary: FieldSummary[] = summaryQ.data?.summary ?? [];
  const applications: NvzApplication[] = appsQ.data?.records ?? [];
  const fields: Field[] = fieldsQ.data?.records ?? [];
  const riskAssessments: any[] = riskAssessmentsQ.data?.records ?? [];

  const filteredApps = useMemo(() => {
    if (!search.trim()) return applications;
    const q = search.toLowerCase();
    return applications.filter(
      (a) =>
        (a.fieldName ?? "").toLowerCase().includes(q) ||
        a.productName.toLowerCase().includes(q) ||
        a.productType.toLowerCase().includes(q)
    );
  }, [applications, search]);

  const nvzFields = summary.filter((f) => f.isNvz);
  const nvzFieldCount = nvzFields.length;
  const alertFields = summary.filter((f) => f.totalNKgHa > TOTAL_N_LIMIT || f.organicNKgHa > ORGANIC_N_LIMIT).length;
  const warnFields = summary.filter(
    (f) => (!f.totalNKgHa || f.totalNKgHa <= TOTAL_N_LIMIT) &&
      (!f.organicNKgHa || f.organicNKgHa <= ORGANIC_N_LIMIT) &&
      (f.totalNKgHa > TOTAL_N_LIMIT * 0.85 || f.organicNKgHa > ORGANIC_N_LIMIT * 0.85)
  ).length;

  const addMut = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetch(`/api/farms/${farmId}/nvz-applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Application logged" });
      qc.invalidateQueries({ queryKey: ["nvz-applications", farmId] });
      qc.invalidateQueries({ queryKey: ["nvz-summary", farmId] });
      setAddOpen(false);
      setForm(emptyForm);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/farms/${farmId}/nvz-applications/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Record deleted" });
      qc.invalidateQueries({ queryKey: ["nvz-applications", farmId] });
      qc.invalidateQueries({ queryKey: ["nvz-summary", farmId] });
      setDeleteId(null);
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const nvzEditMut = useMutation({
    mutationFn: ({ fieldId, body }: { fieldId: number; body: Record<string, unknown> }) =>
      fetch(`/api/farms/${farmId}/fields/${fieldId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Field NVZ settings updated" });
      qc.invalidateQueries({ queryKey: ["nvz-summary", farmId] });
      qc.invalidateQueries({ queryKey: ["fields", farmId] });
      setNvzEditField(null);
    },
    onError: () => toast({ title: "Failed to update field", variant: "destructive" }),
  });

  const handleAdd = () => {
    if (!form.fieldId || !form.applicationDate || !form.productName || !form.productType || !form.nitrogenKgHa || !form.areaAppliedHa) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    addMut.mutate({
      fieldId: parseInt(form.fieldId),
      applicationDate: form.applicationDate,
      productName: form.productName,
      productType: form.productType,
      nitrogenKgHa: parseFloat(form.nitrogenKgHa),
      areaAppliedHa: parseFloat(form.areaAppliedHa),
      applicationMethod: form.applicationMethod || undefined,
      notes: form.notes || undefined,
    });
  };

  const totalNApplied = applications.reduce((s, a) => s + parseFloat(a.totalNitrogenKg ?? "0"), 0);

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const productLabel = (pt: string) => PRODUCT_TYPES.find((p) => p.value === pt)?.label ?? pt;

  const selectedField = fields.find((f) => f.id === parseInt(form.fieldId));

  const closedPeriodWarning =
    form.productType && form.applicationDate && selectedField
      ? checkDateClosedPeriod(form.productType, selectedField.nvzLandType, new Date(form.applicationDate))
      : null;

  return (
    <AppLayout title="NVZ Compliance">
      <div className="max-w-5xl mx-auto space-y-4">

        {/* Info banner */}
        <div className="flex gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
          <div className="space-y-0.5">
            <p className="font-semibold">NVZ Compliance Requirements (England)</p>
            <p className="text-green-700 text-xs leading-relaxed">
              Fields in Nitrate Vulnerable Zones must not exceed <strong>170 kg organic N/ha/year</strong> from livestock manures, or <strong>250 kg total N/ha/year</strong> from all sources. Slurry and digestate are subject to closed spreading periods: arable land <strong>1 Aug – 31 Jan</strong>, grassland <strong>15 Oct – 31 Jan</strong>. Records are required under the Nitrates Action Programme.
            </p>
            <p className="text-green-700 text-xs pt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
              <a href="https://www.gov.uk/guidance/nitrate-vulnerable-zones" target="_blank" rel="noopener noreferrer" className="underline hover:text-green-900 inline-flex items-center gap-1">
                NVZ guidance on GOV.UK ↗
              </a>
              <a href="https://magic.defra.gov.uk/MagicMap.aspx" target="_blank" rel="noopener noreferrer" className="underline hover:text-green-900 inline-flex items-center gap-1">
                Check NVZ boundaries on DEFRA MAGIC map ↗
              </a>
            </p>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="border border-border rounded-xl p-3 bg-card">
            <div className="text-2xl font-bold text-foreground">{nvzFieldCount}</div>
            <div className="text-xs text-foreground/50 mt-0.5">NVZ fields</div>
          </div>
          <div className="border border-border rounded-xl p-3 bg-card">
            <div className="text-2xl font-bold text-foreground">{applications.length}</div>
            <div className="text-xs text-foreground/50 mt-0.5">Applications logged</div>
          </div>
          <div className={`border rounded-xl p-3 ${alertFields > 0 ? "border-red-200 bg-red-50" : "border-border bg-card"}`}>
            <div className={`text-2xl font-bold ${alertFields > 0 ? "text-red-600" : "text-foreground"}`}>{alertFields}</div>
            <div className="text-xs text-foreground/50 mt-0.5">Fields over limit</div>
          </div>
          <div className={`border rounded-xl p-3 ${warnFields > 0 ? "border-amber-200 bg-amber-50" : "border-border bg-card"}`}>
            <div className={`text-2xl font-bold ${warnFields > 0 ? "text-amber-600" : "text-foreground"}`}>{warnFields}</div>
            <div className="text-xs text-foreground/50 mt-0.5">Fields approaching limit</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border pb-0">
          <TabButton active={tab === "summary"} onClick={() => setTab("summary")}>NVZ Summary</TabButton>
          <TabButton active={tab === "log"} onClick={() => setTab("log")}>Application Log</TabButton>
          <TabButton active={tab === "risk-assessments"} onClick={() => setTab("risk-assessments")}>Risk Assessments {riskAssessments.length > 0 && `(${riskAssessments.length})`}</TabButton>
        </div>

        {/* ── SUMMARY TAB ── */}
        {tab === "summary" && (
          <div className="space-y-3">
            {summaryQ.isLoading ? (
              <p className="text-sm text-foreground/40 text-center py-10">Loading field data…</p>
            ) : summary.length === 0 ? (
              <div className="border border-border rounded-xl p-10 text-center text-foreground/40">
                <Leaf className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No active fields found</p>
                <p className="text-sm mt-1">Add fields in Fields &amp; Crops, then log applications here.</p>
              </div>
            ) : (
              <>
                {alertFields > 0 && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span><strong>{alertFields} field{alertFields > 1 ? "s" : ""}</strong> ha{alertFields > 1 ? "ve" : "s"} exceeded NVZ nitrogen limits in the last 12 months. Review applications immediately.</span>
                  </div>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {summary.map((fs) => (
                    <NvzFieldCard key={fs.fieldId} fs={fs} onEdit={(f) => { setNvzEditField(f); setNvzEditForm({ isNvz: f.isNvz, nvzLandType: f.nvzLandType ?? "" }); }} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── LOG TAB ── */}
        {tab === "log" && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Input
                placeholder="Search by field or product…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs"
              />
              <div className="flex-1" />
              <div className="text-xs text-foreground/50 hidden sm:block">
                {totalNApplied > 0 && `Total N logged: ${totalNApplied.toFixed(0)} kg`}
              </div>
              <Button size="sm" onClick={() => { setForm(emptyForm); setAddOpen(true); }}>
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Log Application
              </Button>
            </div>

            {appsQ.isLoading ? (
              <p className="text-sm text-foreground/40 text-center py-10">Loading…</p>
            ) : filteredApps.length === 0 ? (
              <div className="border border-border rounded-xl p-10 text-center text-foreground/40">
                <FlaskConical className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No applications logged yet</p>
                <p className="text-sm mt-1">Use "Log Application" to record each fertiliser or manure application.</p>
              </div>
            ) : (
              <div className="border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border text-left">
                      <th className="px-4 py-2.5 font-medium text-foreground/60 text-xs">Date</th>
                      <th className="px-4 py-2.5 font-medium text-foreground/60 text-xs">Field</th>
                      <th className="px-4 py-2.5 font-medium text-foreground/60 text-xs">Product</th>
                      <th className="px-4 py-2.5 font-medium text-foreground/60 text-xs">Type</th>
                      <th className="px-4 py-2.5 font-medium text-foreground/60 text-xs text-right">N kg/ha</th>
                      <th className="px-4 py-2.5 font-medium text-foreground/60 text-xs text-right">Area (ha)</th>
                      <th className="px-4 py-2.5 font-medium text-foreground/60 text-xs text-right">Total N (kg)</th>
                      <th className="px-4 py-2.5 font-medium text-foreground/60 text-xs"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApps.map((a, idx) => {
                      const fieldLandType = summary.find((f) => f.fieldId === a.fieldId)?.nvzLandType;
                      const cp = checkDateClosedPeriod(a.productType, fieldLandType, new Date(a.applicationDate));
                      const isOrganic = ORGANIC_TYPES.has(a.productType);
                      return (
                        <tr
                          key={a.id}
                          className={`border-b border-border/50 last:border-0 ${idx % 2 === 1 ? "bg-muted/20" : ""} ${cp.closed ? "bg-red-50/50" : ""}`}
                        >
                          <td className="px-4 py-2.5 whitespace-nowrap">{fmt(a.applicationDate)}</td>
                          <td className="px-4 py-2.5 font-medium">{a.fieldName ?? `Field #${a.fieldId}`}</td>
                          <td className="px-4 py-2.5 text-foreground/70">{a.productName}</td>
                          <td className="px-4 py-2.5">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${isOrganic ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>
                              {isOrganic ? <Droplets className="w-3 h-3" /> : <FlaskConical className="w-3 h-3" />}
                              {isOrganic ? "Organic" : "Synthetic"}
                            </span>
                            {cp.closed && (
                              <span className="ml-1.5 inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                                <AlertTriangle className="w-3 h-3" />
                                Closed period
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums">{parseFloat(a.nitrogenKgHa).toFixed(1)}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums">{parseFloat(a.areaAppliedHa).toFixed(2)}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums font-medium">{parseFloat(a.totalNitrogenKg).toFixed(1)}</td>
                          <td className="px-4 py-2.5">
                            <button
                              onClick={() => setDeleteId(a.id)}
                              className="text-foreground/30 hover:text-red-500 transition-colors p-1 rounded"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── ADD APPLICATION DIALOG ── */}
      <Dialog open={addOpen} onOpenChange={(o) => { if (!o) setAddOpen(false); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Log Fertiliser Application</DialogTitle>
            <DialogDescription>
              Record a fertiliser or manure application for NVZ compliance tracking.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Field <span className="text-red-500">*</span></label>
                <Select value={form.fieldId} onValueChange={(v) => setForm((f) => ({ ...f, fieldId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select field…" /></SelectTrigger>
                  <SelectContent>
                    {fields.map((f) => (
                      <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Application Date <span className="text-red-500">*</span></label>
                <Input
                  type="date"
                  value={form.applicationDate}
                  onChange={(e) => setForm((f) => ({ ...f, applicationDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Product Name <span className="text-red-500">*</span></label>
                <Input
                  placeholder="e.g. Ammonium Nitrate 34.5%"
                  value={form.productName}
                  onChange={(e) => setForm((f) => ({ ...f, productName: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Product Type <span className="text-red-500">*</span></label>
                <Select value={form.productType} onValueChange={(v) => setForm((f) => ({ ...f, productType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select type…" /></SelectTrigger>
                  <SelectContent>
                    {PRODUCT_TYPES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">N Rate (kg/ha) <span className="text-red-500">*</span></label>
                <Input
                  type="number" step="0.1" min="0" placeholder="e.g. 80"
                  value={form.nitrogenKgHa}
                  onChange={(e) => setForm((f) => ({ ...f, nitrogenKgHa: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Area Applied (ha) <span className="text-red-500">*</span></label>
                <Input
                  type="number" step="0.01" min="0" placeholder="e.g. 12.50"
                  value={form.areaAppliedHa}
                  onChange={(e) => setForm((f) => ({ ...f, areaAppliedHa: e.target.value }))}
                />
              </div>
            </div>
            {form.nitrogenKgHa && form.areaAppliedHa && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-green-800">
                  Total N applied:{" "}
                  <strong>{(parseFloat(form.nitrogenKgHa) * parseFloat(form.areaAppliedHa)).toFixed(1)} kg</strong>
                </span>
              </div>
            )}
            {closedPeriodWarning?.closed && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span><strong>Closed period warning:</strong> {closedPeriodWarning.reason}. Spreading on this date may breach NVZ regulations.</span>
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Application Method</label>
              <Select value={form.applicationMethod} onValueChange={(v) => setForm((f) => ({ ...f, applicationMethod: v }))}>
                <SelectTrigger><SelectValue placeholder="Select method…" /></SelectTrigger>
                <SelectContent>
                  {appMethods.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Notes</label>
              <Input
                placeholder="Optional notes…"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={addMut.isPending}>
              {addMut.isPending ? "Saving…" : "Save Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DELETE CONFIRM ── */}
      <Dialog open={deleteId !== null} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Delete Record
            </DialogTitle>
            <DialogDescription>
              This application record will be permanently removed from the NVZ compliance log. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" disabled={deleteMut.isPending} onClick={() => { if (deleteId) deleteMut.mutate(deleteId); }}>
              {deleteMut.isPending ? "Deleting…" : "Delete Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── RISK ASSESSMENTS TAB ── */}
      {tab === "risk-assessments" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div style={{ flex: 1 }}>
              <p className="text-sm text-foreground/60">
                Record NVZ risk assessments as required by the Nitrates Action Programme. Assessments should identify application restrictions, drainage risk, and mitigation measures.
              </p>
            </div>
            <Button size="sm" onClick={() => { setRaForm({ ...emptyRaForm }); setRaAddOpen(true); }}>
              <Plus className="w-4 h-4 mr-1" /> Add Assessment
            </Button>
          </div>

          {riskAssessmentsQ.isLoading ? (
            <p className="text-sm text-foreground/40 text-center py-10">Loading…</p>
          ) : riskAssessments.length === 0 ? (
            <div className="border border-border rounded-xl p-10 text-center text-foreground/40">
              <Leaf className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No risk assessments recorded</p>
              <p className="text-sm mt-1">Log a formal NVZ risk assessment to demonstrate compliance with the Nitrates Action Programme.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                    {["Date", "Assessed By", "Overall Risk", "Restrictions", "Next Review", ""].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "0.5rem 0.75rem", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {riskAssessments.map((r: any) => {
                    const riskColor = r.overallRiskLevel === "High" ? "#dc2626" : r.overallRiskLevel === "Medium" ? "#d97706" : "#16a34a";
                    const riskBg = r.overallRiskLevel === "High" ? "#fef2f2" : r.overallRiskLevel === "Medium" ? "#fffbeb" : "#f0fdf4";
                    return (
                      <tr key={r.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280" }}>{r.assessmentDate ? new Date(r.assessmentDate).toLocaleDateString("en-GB") : "—"}</td>
                        <td style={{ padding: "0.625rem 0.75rem", fontWeight: 500 }}>{r.assessedBy}</td>
                        <td style={{ padding: "0.625rem 0.75rem" }}>
                          {r.overallRiskLevel ? <span style={{ background: riskBg, color: riskColor, border: `1px solid ${riskBg === "#f0fdf4" ? "#bbf7d0" : riskBg === "#fffbeb" ? "#fde68a" : "#fecaca"}`, borderRadius: 4, padding: "2px 8px", fontSize: "0.75rem", fontWeight: 600 }}>{r.overallRiskLevel}</span> : <span style={{ color: "#9ca3af" }}>—</span>}
                        </td>
                        <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.applicationRestrictionsIdentified || "None noted"}</td>
                        <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280" }}>{r.nextReviewDate ? new Date(r.nextReviewDate).toLocaleDateString("en-GB") : "—"}</td>
                        <td style={{ padding: "0.625rem 0.75rem" }}>
                          <div style={{ display: "flex", gap: 4 }}>
                            <Button size="sm" variant="outline" style={{ fontSize: "0.75rem", height: 28 }} onClick={() => setRaViewItem(r)}>View</Button>
                            <Button size="sm" variant="outline" style={{ fontSize: "0.75rem", height: 28, color: "#dc2626" }} onClick={() => setRaDeleteId(r.id)}>Del</Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── RISK ASSESSMENT VIEW DIALOG ── */}
      <Dialog open={!!raViewItem} onOpenChange={open => { if (!open) setRaViewItem(null); }}>
        <DialogContent style={{ maxWidth: 600 }}>
          <DialogHeader>
            <DialogTitle>NVZ Risk Assessment</DialogTitle>
            <DialogDescription>
              {raViewItem?.assessmentDate ? new Date(raViewItem.assessmentDate).toLocaleDateString("en-GB") : ""} — {raViewItem?.assessedBy}
            </DialogDescription>
          </DialogHeader>
          {raViewItem && (() => {
            const riskColor = raViewItem.overallRiskLevel === "High" ? "#dc2626" : raViewItem.overallRiskLevel === "Medium" ? "#d97706" : "#16a34a";
            const riskBg = raViewItem.overallRiskLevel === "High" ? "#fef2f2" : raViewItem.overallRiskLevel === "Medium" ? "#fffbeb" : "#f0fdf4";
            const Field = ({ label, value }: { label: string; value?: string | null }) => (
              <div>
                <div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: "0.875rem", color: value ? "#111827" : "#d1d5db" }}>{value || "—"}</div>
              </div>
            );
            return (
              <div style={{ display: "grid", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Field label="Assessment Date" value={raViewItem.assessmentDate ? new Date(raViewItem.assessmentDate).toLocaleDateString("en-GB") : null} />
                  <Field label="Assessed By" value={raViewItem.assessedBy} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Field label="Soil Type" value={raViewItem.soilType} />
                  <Field label="Organic Matter Level" value={raViewItem.organicMatterLevel} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                  <Field label="Drainage Risk" value={raViewItem.drainageRisk} />
                  <Field label="Slope Risk" value={raViewItem.slopeRisk} />
                  <Field label="Flood Risk" value={raViewItem.floodRisk} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Field label="Distance to Watercourse" value={raViewItem.distanceToWatercourse} />
                  <div>
                    <div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 2 }}>Overall Risk Level</div>
                    {raViewItem.overallRiskLevel
                      ? <span style={{ background: riskBg, color: riskColor, border: `1px solid ${riskColor}33`, borderRadius: 4, padding: "2px 10px", fontSize: "0.8rem", fontWeight: 600 }}>{raViewItem.overallRiskLevel}</span>
                      : <span style={{ color: "#d1d5db", fontSize: "0.875rem" }}>—</span>}
                  </div>
                </div>
                <Field label="Application Restrictions Identified" value={raViewItem.applicationRestrictionsIdentified} />
                <Field label="Mitigation Measures" value={raViewItem.mitigationMeasures} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Field label="Next Review Date" value={raViewItem.nextReviewDate ? new Date(raViewItem.nextReviewDate).toLocaleDateString("en-GB") : null} />
                </div>
                {raViewItem.notes && <Field label="Notes" value={raViewItem.notes} />}
              </div>
            );
          })()}
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setRaViewItem(null)}>Close</Button>
            <Button onClick={() => {
              const r = raViewItem;
              setRaViewItem(null);
              setRaEditItem(r);
              setRaForm({ assessmentDate: r.assessmentDate ? r.assessmentDate.slice(0, 10) : "", assessedBy: r.assessedBy ?? "", soilType: r.soilType ?? "", drainageRisk: r.drainageRisk ?? "", slopeRisk: r.slopeRisk ?? "", distanceToWatercourse: r.distanceToWatercourse ?? "", floodRisk: r.floodRisk ?? "", organicMatterLevel: r.organicMatterLevel ?? "", applicationRestrictionsIdentified: r.applicationRestrictionsIdentified ?? "", mitigationMeasures: r.mitigationMeasures ?? "", overallRiskLevel: r.overallRiskLevel ?? "", nextReviewDate: r.nextReviewDate ? r.nextReviewDate.slice(0, 10) : "", notes: r.notes ?? "" });
            }}>Edit Assessment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── RISK ASSESSMENT ADD/EDIT DIALOG ── */}
      <Dialog open={raAddOpen || !!raEditItem} onOpenChange={open => { if (!open) { setRaAddOpen(false); setRaEditItem(null); } }}>
        <DialogContent style={{ maxWidth: 580 }}>
          <DialogHeader><DialogTitle>{raEditItem ? "Edit Risk Assessment" : "Add NVZ Risk Assessment"}</DialogTitle></DialogHeader>
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label className="text-sm font-medium mb-1.5 block">Assessment Date *</label><Input type="date" value={raForm.assessmentDate} onChange={e => setRaForm(f => ({ ...f, assessmentDate: e.target.value }))} /></div>
              <div><label className="text-sm font-medium mb-1.5 block">Assessed By *</label><Input value={raForm.assessedBy} onChange={e => setRaForm(f => ({ ...f, assessedBy: e.target.value }))} placeholder="Name / Organisation" /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label className="text-sm font-medium mb-1.5 block">Soil Type</label><Input value={raForm.soilType} onChange={e => setRaForm(f => ({ ...f, soilType: e.target.value }))} placeholder="e.g. Sandy loam, Clay" /></div>
              <div><label className="text-sm font-medium mb-1.5 block">Organic Matter Level</label><Input value={raForm.organicMatterLevel} onChange={e => setRaForm(f => ({ ...f, organicMatterLevel: e.target.value }))} placeholder="e.g. Low, Medium, High" /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label className="text-sm font-medium mb-1.5 block">Drainage Risk</label>
                <Select value={raForm.drainageRisk} onValueChange={v => setRaForm(f => ({ ...f, drainageRisk: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>{["Low", "Medium", "High"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><label className="text-sm font-medium mb-1.5 block">Slope Risk</label>
                <Select value={raForm.slopeRisk} onValueChange={v => setRaForm(f => ({ ...f, slopeRisk: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>{["Low", "Medium", "High"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label className="text-sm font-medium mb-1.5 block">Flood Risk</label><Input value={raForm.floodRisk} onChange={e => setRaForm(f => ({ ...f, floodRisk: e.target.value }))} placeholder="e.g. Zone 1, Zone 3" /></div>
              <div><label className="text-sm font-medium mb-1.5 block">Distance to Watercourse</label><Input value={raForm.distanceToWatercourse} onChange={e => setRaForm(f => ({ ...f, distanceToWatercourse: e.target.value }))} placeholder="e.g. >50m, 20m" /></div>
            </div>
            <div><label className="text-sm font-medium mb-1.5 block">Application Restrictions Identified</label><Input value={raForm.applicationRestrictionsIdentified} onChange={e => setRaForm(f => ({ ...f, applicationRestrictionsIdentified: e.target.value }))} placeholder="e.g. No spreading Dec–Feb, buffer zone required" /></div>
            <div><label className="text-sm font-medium mb-1.5 block">Mitigation Measures</label><Input value={raForm.mitigationMeasures} onChange={e => setRaForm(f => ({ ...f, mitigationMeasures: e.target.value }))} placeholder="e.g. Trailing shoe only, maintain 10m buffer" /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label className="text-sm font-medium mb-1.5 block">Overall Risk Level</label>
                <Select value={raForm.overallRiskLevel} onValueChange={v => setRaForm(f => ({ ...f, overallRiskLevel: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>{["Low", "Medium", "High"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><label className="text-sm font-medium mb-1.5 block">Next Review Date</label><Input type="date" value={raForm.nextReviewDate} onChange={e => setRaForm(f => ({ ...f, nextReviewDate: e.target.value }))} /></div>
            </div>
            <div><label className="text-sm font-medium mb-1.5 block">Notes</label><Input value={raForm.notes} onChange={e => setRaForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => { setRaAddOpen(false); setRaEditItem(null); }}>Cancel</Button>
            <Button onClick={() => {
              if (raEditItem) raUpdateMut.mutate({ id: raEditItem.id, body: raForm });
              else raCreateMut.mutate(raForm);
            }} disabled={!raForm.assessmentDate || !raForm.assessedBy}>Save Assessment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={raDeleteId !== null} onOpenChange={open => { if (!open) setRaDeleteId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Risk Assessment</DialogTitle><DialogDescription>This cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setRaDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => raDeleteId !== null && raDeleteMut.mutate(raDeleteId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── NVZ FIELD SETTINGS DIALOG ── */}
      <Dialog open={nvzEditField !== null} onOpenChange={(o) => { if (!o) setNvzEditField(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>NVZ Settings — {nvzEditField?.fieldName}</DialogTitle>
            <DialogDescription>
              Mark this field as within a Nitrate Vulnerable Zone and set its land type for closed-period calculations.
            </DialogDescription>
          </DialogHeader>
          {nvzEditField && (
            <div className="space-y-4 mt-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isNvzCheck"
                  checked={nvzEditForm.isNvz}
                  onChange={(e) => setNvzEditForm((f) => ({ ...f, isNvz: e.target.checked }))}
                  className="w-4 h-4 accent-green-600"
                />
                <label htmlFor="isNvzCheck" className="text-sm font-medium cursor-pointer">
                  This field is within a Nitrate Vulnerable Zone (NVZ)
                </label>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Land Type</label>
                <Select
                  value={nvzEditForm.nvzLandType}
                  onValueChange={(v) => setNvzEditForm((f) => ({ ...f, nvzLandType: v }))}
                >
                  <SelectTrigger><SelectValue placeholder="Select land type…" /></SelectTrigger>
                  <SelectContent>
                    {LAND_TYPES.map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-foreground/50 mt-1">Used to determine closed periods for slurry and digestate.</p>
              </div>
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setNvzEditField(null)}>Cancel</Button>
            <Button
              disabled={nvzEditMut.isPending}
              onClick={() => {
                if (!nvzEditField) return;
                nvzEditMut.mutate({
                  fieldId: nvzEditField.fieldId,
                  body: { isNvz: nvzEditForm.isNvz, nvzLandType: nvzEditForm.nvzLandType || null },
                });
              }}
            >
              {nvzEditMut.isPending ? "Saving…" : "Save Settings"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
