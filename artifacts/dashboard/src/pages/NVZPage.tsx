import React, { useState, useMemo } from "react";
import { useLookupStrings } from "@/hooks/use-lookup";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { Badge } from "@/components/ui/badge";
import { TabButton } from "@/components/ui/tab-button";
import {
  AlertTriangle, CheckCircle2, Info, Plus, Trash2,
  Leaf, FlaskConical, Droplets, Eye, Pencil, ClipboardList,
  Building2, Phone, Mail, Users,
} from "lucide-react";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { BuyerCombobox } from "@/components/sales/BuyerCombobox";

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
  applicationMethod: string | null; notes: string | null; totalCostPence: number | null; createdAt: string;
  stockItemId: number | null; stockDeliveryId: number | null;
  applicationRateKgHa: string | null; unitCostPencePerTonne: number | null;
  batchNumber: string | null; lotNumber: string | null;
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
  totalCostPence: "",
  stockItemId: "",
  stockDeliveryId: "",
  applicationRateKgHa: "",
  unitCostPencePerTonne: "",
  batchNumber: "",
  lotNumber: "",
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

// ─── NVZ Closed Periods Tab ───────────────────────────────────────────────────
const CLOSED_PERIOD_RULES: { product: string; arableFrom: string; arableTo: string; grassFrom: string; grassTo: string; note: string }[] = [
  { product: "Slurry / Digestate (liquid)", arableFrom: "01 Aug", arableTo: "31 Jan", grassFrom: "15 Oct", grassTo: "31 Jan", note: "Nitrates Action Programme — England" },
  { product: "Poultry Manure (high-N)", arableFrom: "01 Oct", arableTo: "31 Jan", grassFrom: "01 Oct", grassTo: "31 Jan", note: "High total N from poultry" },
  { product: "Farm Yard Manure (solid)", arableFrom: "—", arableTo: "—", grassFrom: "15 Oct", grassTo: "31 Jan", note: "Grassland only" },
];

function nextOpenDate(landType: string | null | undefined): { date: string; daysUntil: number } | null {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth() + 1; // 1-based

  if (!landType || landType === "arable" || landType === "mixed") {
    // Arable closed 1 Aug – 31 Jan
    if (m >= 8) {
      const open = new Date(y + 1, 1, 1); // 1 Feb next year
      const days = Math.ceil((open.getTime() - today.getTime()) / 86400000);
      return { date: `1 Feb ${y + 1}`, daysUntil: days };
    }
  }
  if (landType === "grassland" || landType === "mixed") {
    // Grassland closed 15 Oct – 31 Jan
    if (m >= 10 || m === 1) {
      const open = new Date(y + (m === 1 ? 0 : 1), 1, 1); // 1 Feb
      const days = Math.ceil((open.getTime() - today.getTime()) / 86400000);
      return { date: `1 Feb ${m === 1 ? y : y + 1}`, daysUntil: days };
    }
  }
  return null;
}

function NvzClosedPeriodsTab({ fields }: { fields: FieldSummary[] }) {
  const today = new Date();
  const nvzFields = fields.filter(f => f.isNvz);

  const closedFields = nvzFields.filter(f => {
    const check = checkTodayClosedPeriod("slurry", f.nvzLandType);
    return check.closed;
  });

  const month = today.getMonth() + 1;
  const isArableClosed = month >= 8 || month <= 1;
  const isGrasslandClosed = month >= 10 || month <= 1;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h3 className="font-semibold text-gray-800 mb-1">NVZ Closed Spreading Periods</h3>
        <p className="text-xs text-gray-500">Automatic calculation of closed periods for slurry and digestate based on your NVZ field land types. Based on England Nitrates Action Programme rules.</p>
      </div>

      {/* Status widget */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`rounded-xl border p-4 ${isArableClosed ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isArableClosed ? "bg-red-500" : "bg-green-500"}`} />
            <span className="text-xs font-semibold text-gray-700">Arable Land</span>
          </div>
          {isArableClosed ? (
            <>
              <p className="text-sm font-bold text-red-700">CLOSED PERIOD</p>
              <p className="text-xs text-red-600 mt-0.5">No slurry/digestate — 1 Aug to 31 Jan</p>
              {nextOpenDate("arable") && (
                <p className="text-xs text-red-500 mt-1 font-medium">Opens: {nextOpenDate("arable")!.date} ({nextOpenDate("arable")!.daysUntil} days)</p>
              )}
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-green-700">OPEN — Spreading permitted</p>
              <p className="text-xs text-green-600 mt-0.5">Closed period starts: 1 Aug</p>
              <p className="text-xs text-gray-500 mt-1">Days until closed: {Math.ceil((new Date(today.getFullYear(), 7, 1).getTime() - today.getTime()) / 86400000)}</p>
            </>
          )}
        </div>
        <div className={`rounded-xl border p-4 ${isGrasslandClosed ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isGrasslandClosed ? "bg-red-500" : "bg-green-500"}`} />
            <span className="text-xs font-semibold text-gray-700">Grassland</span>
          </div>
          {isGrasslandClosed ? (
            <>
              <p className="text-sm font-bold text-red-700">CLOSED PERIOD</p>
              <p className="text-xs text-red-600 mt-0.5">No slurry/digestate — 15 Oct to 31 Jan</p>
              {nextOpenDate("grassland") && (
                <p className="text-xs text-red-500 mt-1 font-medium">Opens: {nextOpenDate("grassland")!.date} ({nextOpenDate("grassland")!.daysUntil} days)</p>
              )}
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-green-700">OPEN — Spreading permitted</p>
              <p className="text-xs text-green-600 mt-0.5">Closed period starts: 15 Oct</p>
              <p className="text-xs text-gray-500 mt-1">Days until closed: {Math.ceil((new Date(today.getFullYear(), 9, 15).getTime() - today.getTime()) / 86400000)}</p>
            </>
          )}
        </div>
      </div>

      {/* Per-field closed period status */}
      {nvzFields.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">NVZ Fields — Slurry/Digestate Status Today</h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-600">Field</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-600">Land Type</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-600">Status Today</th>
                  <th className="text-left px-3 py-2.5 font-medium text-gray-600 hidden sm:table-cell">Next Open</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {nvzFields.map(f => {
                  const cp = checkTodayClosedPeriod("slurry", f.nvzLandType);
                  const nextOpen = nextOpenDate(f.nvzLandType);
                  return (
                    <tr key={f.fieldId} className={cp.closed ? "bg-red-50/50" : "hover:bg-gray-50"}>
                      <td className="px-3 py-2 font-medium">{f.fieldName}</td>
                      <td className="px-3 py-2 capitalize">{f.nvzLandType || "—"}</td>
                      <td className="px-3 py-2">
                        {cp.closed
                          ? <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">CLOSED — No spreading</span>
                          : <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Open</span>
                        }
                      </td>
                      <td className="px-3 py-2 hidden sm:table-cell text-xs text-gray-500">
                        {nextOpen ? `${nextOpen.date} (${nextOpen.daysUntil}d)` : "No restriction"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rules reference table */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Closed Period Rules Reference</h4>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2.5 font-medium">Material</th>
                <th className="text-left px-3 py-2.5 font-medium">Arable Closed</th>
                <th className="text-left px-3 py-2.5 font-medium">Grassland Closed</th>
                <th className="text-left px-3 py-2.5 font-medium hidden md:table-cell">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {CLOSED_PERIOD_RULES.map(r => (
                <tr key={r.product} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium">{r.product}</td>
                  <td className="px-3 py-2">{r.arableFrom === "—" ? "No restriction" : `${r.arableFrom} – ${r.arableTo}`}</td>
                  <td className="px-3 py-2">{r.grassFrom === "—" ? "No restriction" : `${r.grassFrom} – ${r.grassTo}`}</td>
                  <td className="px-3 py-2 hidden md:table-cell text-gray-500">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-2">Source: The Nitrate Pollution Prevention Regulations 2015 (as amended). England only. Scotland, Wales and Northern Ireland have separate rules.</p>
      </div>
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
  const soilTypes = useLookupStrings("nvz_soil_types", [
    "Sand", "Loamy Sand", "Sandy Loam", "Sandy Silt Loam", "Silt Loam", "Silt",
    "Loam", "Clay Loam", "Sandy Clay Loam", "Silty Clay Loam", "Sandy Clay", "Silty Clay", "Clay",
  ]);
  const { toast } = useToast();
  const qc = useQueryClient();
  const [tab, setTab] = usePersistedTab<"summary" | "log" | "risk-assessments" | "closed-periods" | "budget-calc" | "contacts">({ page: "nvz", farmId, validIds: ["summary", "log", "risk-assessments", "closed-periods", "budget-calc", "contacts"], defaultTab: "summary" });
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [addOpen, setAddOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<NvzApplication | null>(null);
  const [viewRecord, setViewRecord] = useState<NvzApplication | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [raiseTaskFor, setRaiseTaskFor] = useState<NvzApplication | null>(null);
  const formOpen = addOpen || !!editRecord;
  function openEditApp(r: NvzApplication) {
    setEditRecord(r);
    setForm({
      fieldId: String(r.fieldId),
      applicationDate: r.applicationDate ? r.applicationDate.slice(0, 10) : "",
      productName: r.productName,
      productType: r.productType,
      nitrogenKgHa: String(r.nitrogenKgHa),
      areaAppliedHa: String(r.areaAppliedHa),
      applicationMethod: r.applicationMethod ?? "",
      notes: r.notes ?? "",
      totalCostPence: r.totalCostPence != null ? String(r.totalCostPence) : "",
      stockItemId: r.stockItemId != null ? String(r.stockItemId) : "",
      stockDeliveryId: r.stockDeliveryId != null ? String(r.stockDeliveryId) : "",
      applicationRateKgHa: r.applicationRateKgHa != null ? String(r.applicationRateKgHa) : "",
      unitCostPencePerTonne: r.unitCostPencePerTonne != null ? String(r.unitCostPencePerTonne) : "",
      batchNumber: r.batchNumber ?? "",
      lotNumber: r.lotNumber ?? "",
    });
  }
  function closeAppForm() { setAddOpen(false); setEditRecord(null); setForm(emptyForm); addMut.reset(); updateMut.reset(); }
  const [nvzEditField, setNvzEditField] = useState<FieldSummary | null>(null);
  const [nvzEditForm, setNvzEditForm] = useState({ isNvz: false, nvzLandType: "" });

  const [raAddOpen, setRaAddOpen] = useState(false);
  const [raViewItem, setRaViewItem] = useState<any>(null);
  const [raEditItem, setRaEditItem] = useState<any>(null);
  const [raDeleteId, setRaDeleteId] = useState<number | null>(null);
  const emptyRaForm = { assessmentDate: "", assessedBy: "", assessorName: "", assessorOrganisation: "", assessorSupplierId: null as number | null, assessorContactId: "", soilType: "", drainageRisk: "", slopeRisk: "", distanceToWatercourse: "", floodRisk: "", organicMatterLevel: "", applicationRestrictionsIdentified: "", mitigationMeasures: "", overallRiskLevel: "", nextReviewDate: "", notes: "" };
  const [raFieldIds, setRaFieldIds] = useState<number[]>([]);
  const [raForm, setRaForm] = useState({ ...emptyRaForm });

  const [contactAddOpen, setContactAddOpen] = useState(false);
  const [contactEditItem, setContactEditItem] = useState<any>(null);
  const [contactDeleteId, setContactDeleteId] = useState<number | null>(null);
  const emptyContactForm = { name: "", organisation: "", email: "", phone: "", role: "", qualifications: "", notes: "" };
  const [contactForm, setContactForm] = useState({ ...emptyContactForm });
  const [nvzRaiseTask, setNvzRaiseTask] = useState<{ title: string; description: string } | null>(null);

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

  const contactsQ = useQuery<{ contacts: any[] }>({
    queryKey: ["farm-contacts", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/contacts`).then(r => r.json()),
    enabled: !!farmId,
  });

  const raCreateMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/nvz-risk-assessments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, fieldIds: JSON.stringify(raFieldIds) }) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Risk assessment saved" }); qc.invalidateQueries({ queryKey: ["nvz-risk-assessments", farmId] }); setRaAddOpen(false); setRaForm({ ...emptyRaForm }); setRaFieldIds([]); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const raUpdateMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) => fetch(`/api/farms/${farmId}/nvz-risk-assessments/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, fieldIds: JSON.stringify(raFieldIds) }) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Risk assessment updated" }); qc.invalidateQueries({ queryKey: ["nvz-risk-assessments", farmId] }); setRaEditItem(null); setRaFieldIds([]); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const raDeleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/nvz-risk-assessments/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "Risk assessment deleted" }); qc.invalidateQueries({ queryKey: ["nvz-risk-assessments", farmId] }); setRaDeleteId(null); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const contactCreateMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/contacts`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Contact saved" }); qc.invalidateQueries({ queryKey: ["farm-contacts", farmId] }); setContactAddOpen(false); setContactForm({ ...emptyContactForm }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const contactUpdateMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) => fetch(`/api/farms/${farmId}/contacts/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Contact updated" }); qc.invalidateQueries({ queryKey: ["farm-contacts", farmId] }); setContactEditItem(null); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const contactDeleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/contacts/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "Contact removed" }); qc.invalidateQueries({ queryKey: ["farm-contacts", farmId] }); setContactDeleteId(null); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const applications: NvzApplication[] = appsQ.data?.records ?? [];
  const fields: Field[] = fieldsQ.data?.records ?? [];
  const riskAssessments: any[] = riskAssessmentsQ.data?.records ?? [];
  const contacts: any[] = contactsQ.data?.contacts ?? [];

  const availableYears = useMemo(() => {
    const years = new Set<number>([new Date().getFullYear()]);
    applications.forEach(a => { if (a.applicationDate) years.add(new Date(a.applicationDate).getFullYear()); });
    return Array.from(years).sort().reverse();
  }, [applications]);

  const yearApps = useMemo(() =>
    applications.filter(a => a.applicationDate && new Date(a.applicationDate).getFullYear() === selectedYear),
    [applications, selectedYear]);

  const yearSummary = useMemo((): FieldSummary[] => {
    const organicTypes = ["slurry", "fy", "poultry-manure", "organic-n", "digestate", "compost"];
    return fields.map(f => {
      const fa = yearApps.filter(a => a.fieldId === f.id);
      const areaHa = parseFloat(String(f.areaHectares ?? "1")) || 1;
      const totalNKg = fa.reduce((s, a) => s + parseFloat(a.totalNitrogenKg ?? "0"), 0);
      const organicNKg = fa.filter(a => organicTypes.includes(a.productType)).reduce((s, a) => s + parseFloat(a.totalNitrogenKg ?? "0"), 0);
      return {
        fieldId: f.id, fieldName: f.name, areaHectares: f.areaHectares,
        isNvz: f.isNvz, nvzLandType: f.nvzLandType,
        totalNKg: parseFloat(totalNKg.toFixed(2)),
        organicNKg: parseFloat(organicNKg.toFixed(2)),
        totalNKgHa: parseFloat((totalNKg / areaHa).toFixed(2)),
        organicNKgHa: parseFloat((organicNKg / areaHa).toFixed(2)),
        applicationCount: fa.length,
      };
    });
  }, [fields, yearApps]);

  const filteredApps = useMemo(() => {
    if (!search.trim()) return yearApps;
    const q = search.toLowerCase();
    return yearApps.filter(
      (a) =>
        (a.fieldName ?? "").toLowerCase().includes(q) ||
        a.productName.toLowerCase().includes(q) ||
        a.productType.toLowerCase().includes(q)
    );
  }, [yearApps, search]);

  const nvzFields = yearSummary.filter((f) => f.isNvz);
  const nvzFieldCount = nvzFields.length;
  const alertFields = yearSummary.filter((f) => f.totalNKgHa > TOTAL_N_LIMIT || f.organicNKgHa > ORGANIC_N_LIMIT).length;
  const warnFields = yearSummary.filter(
    (f) => (!f.totalNKgHa || f.totalNKgHa <= TOTAL_N_LIMIT) &&
      (!f.organicNKgHa || f.organicNKgHa <= ORGANIC_N_LIMIT) &&
      (f.totalNKgHa > TOTAL_N_LIMIT * 0.85 || f.organicNKgHa > ORGANIC_N_LIMIT * 0.85)
  ).length;

  const nvzDeliveriesQ = useQuery<{ deliveries: any[] }>({
    queryKey: ["stock-deliveries-for-item", farmId, form.stockItemId],
    queryFn: () => fetch(`/api/farms/${farmId}/stock-deliveries-for-item?stockItemId=${form.stockItemId}`).then(r => r.json()),
    enabled: !!farmId && !!form.stockItemId,
  });

  const nvzStockItemsQ = useQuery<{ items: any[] }>({
    queryKey: ["stock-items", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/stock-items`).then(r => r.json()),
    enabled: !!farmId,
  });

  const fertStockItems = (nvzStockItemsQ.data?.items ?? []).filter((si: any) =>
    ["fertiliser", "fert", "feed", "manure", "digestate"].some(t => String(si.stockType ?? "").toLowerCase().includes(t))
  );

  function handleNvzDeliverySelect(deliveryId: string) {
    if (!deliveryId) {
      setForm(f => ({ ...f, stockDeliveryId: "", batchNumber: "", lotNumber: "", unitCostPencePerTonne: "" }));
      return;
    }
    const del = (nvzDeliveriesQ.data?.deliveries ?? []).find((d: any) => String(d.id) === deliveryId);
    const unitPricePence = del?.unitPricePence ?? null;
    const unit = (del?.stockItemUnit ?? "kg").toLowerCase();
    const unitCostPencePerTonne = unitPricePence != null
      ? (unit === "tonne" || unit === "t" ? unitPricePence : unitPricePence * 1000)
      : null;
    setForm(f => ({
      ...f,
      stockDeliveryId: deliveryId,
      batchNumber: del?.batchNumber ?? f.batchNumber,
      lotNumber: del?.lotNumber ?? f.lotNumber,
      unitCostPencePerTonne: unitCostPencePerTonne != null ? String(Math.round(unitCostPencePerTonne)) : f.unitCostPencePerTonne,
    }));
  }

  const buildNvzPayload = (f: typeof emptyForm) => {
    const unitCostPT = f.unitCostPencePerTonne !== "" ? Number(f.unitCostPencePerTonne) : undefined;
    const appRateKgHa = f.applicationRateKgHa !== "" ? parseFloat(f.applicationRateKgHa) : undefined;
    const areaHa = parseFloat(f.areaAppliedHa);
    const computedCost = unitCostPT && appRateKgHa && areaHa
      ? Math.round(unitCostPT * appRateKgHa / 1000 * areaHa)
      : undefined;
    return {
      fieldId: parseInt(f.fieldId),
      applicationDate: f.applicationDate,
      productName: f.productName,
      productType: f.productType,
      nitrogenKgHa: parseFloat(f.nitrogenKgHa),
      areaAppliedHa: areaHa,
      applicationMethod: f.applicationMethod || undefined,
      notes: f.notes || undefined,
      totalCostPence: computedCost ?? (f.totalCostPence !== "" && f.totalCostPence != null ? Number(f.totalCostPence) : undefined),
      stockItemId: f.stockItemId ? parseInt(f.stockItemId) : undefined,
      stockDeliveryId: f.stockDeliveryId ? parseInt(f.stockDeliveryId) : undefined,
      applicationRateKgHa: appRateKgHa,
      unitCostPencePerTonne: unitCostPT,
      batchNumber: f.batchNumber || undefined,
      lotNumber: f.lotNumber || undefined,
    };
  };

  const addMut = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetch(`/api/farms/${farmId}/nvz-applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Application logged" });
      qc.invalidateQueries({ queryKey: ["nvz-applications", farmId] });
      qc.invalidateQueries({ queryKey: ["nvz-summary", farmId] });
      closeAppForm();
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
      fetch(`/api/farms/${farmId}/nvz-applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Application updated" });
      qc.invalidateQueries({ queryKey: ["nvz-applications", farmId] });
      qc.invalidateQueries({ queryKey: ["nvz-summary", farmId] });
      closeAppForm();
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/farms/${farmId}/nvz-applications/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
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
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then((r) => r.json()),
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
    if (editRecord) {
      updateMut.mutate({ id: editRecord.id, body: buildNvzPayload(form) });
    } else {
      addMut.mutate(buildNvzPayload(form));
    }
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
            <div className="text-2xl font-bold text-foreground">{yearApps.length}</div>
            <div className="text-xs text-foreground/50 mt-0.5">Applications in {selectedYear}</div>
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

        {/* Year selector + Tabs */}
        <div className="flex items-center justify-between gap-3 border-b border-border pb-0">
          <div className="flex gap-1">
            <TabButton active={tab === "summary"} onClick={() => setTab("summary")}>NVZ Summary</TabButton>
            <TabButton active={tab === "log"} onClick={() => setTab("log")}>Application Log</TabButton>
            <TabButton active={tab === "risk-assessments"} onClick={() => setTab("risk-assessments")}>Risk Assessments {riskAssessments.length > 0 && `(${riskAssessments.length})`}</TabButton>
            <TabButton active={tab === "closed-periods"} onClick={() => setTab("closed-periods")}>Closed Periods</TabButton>
            <TabButton active={tab === "budget-calc"} onClick={() => setTab("budget-calc")}>N Budget Calculator</TabButton>
            <TabButton active={tab === "contacts"} onClick={() => setTab("contacts")}>Contacts {contacts.length > 0 && `(${contacts.length})`}</TabButton>
          </div>
          {tab !== "risk-assessments" && (
            <div className="flex items-center gap-2 pb-1">
              <span className="text-xs text-foreground/50 font-medium">Year:</span>
              <Select value={String(selectedYear)} onValueChange={v => setSelectedYear(Number(v))}>
                <SelectTrigger className="h-7 text-xs w-24"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {availableYears.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* ── SUMMARY TAB ── */}
        {tab === "summary" && (
          <div className="space-y-3">
            {fieldsQ.isLoading || appsQ.isLoading ? (
              <p className="text-sm text-foreground/40 text-center py-10">Loading field data…</p>
            ) : yearSummary.length === 0 ? (
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
                    <span><strong>{alertFields} field{alertFields > 1 ? "s" : ""}</strong> ha{alertFields > 1 ? "ve" : "s"} exceeded NVZ nitrogen limits in {selectedYear}. Review applications immediately.</span>
                  </div>
                )}
                {yearApps.length === 0 && (
                  <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>No applications recorded in {selectedYear}. All fields show zero nitrogen totals for this year. Use the year selector to view other years, or log applications in the Application Log tab.</span>
                  </div>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {yearSummary.map((fs) => (
                    <NvzFieldCard key={fs.fieldId} fs={fs} onEdit={(f) => { setNvzEditField(f); setNvzEditForm({ isNvz: f.isNvz, nvzLandType: f.nvzLandType ?? "" }); }} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── CLOSED PERIODS TAB ── */}
        {tab === "closed-periods" && <NvzClosedPeriodsTab fields={yearSummary} />}

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
                      const fieldLandType = yearSummary.find((f) => f.fieldId === a.fieldId)?.nvzLandType ?? fields.find(f => f.id === a.fieldId)?.nvzLandType;
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
                            <div className="flex items-center gap-1">
                              <button onClick={() => setViewRecord(a)} className="text-foreground/30 hover:text-blue-500 transition-colors p-1 rounded" title="View details"><Eye className="w-3.5 h-3.5" /></button>
                              <button onClick={() => openEditApp(a)} className="text-foreground/30 hover:text-primary transition-colors p-1 rounded" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setDeleteId(a.id)} className="text-foreground/30 hover:text-red-500 transition-colors p-1 rounded" title="Delete record"><Trash2 className="w-3.5 h-3.5" /></button>
                              {cp.closed && (
                                <button onClick={() => setRaiseTaskFor(a)} className="text-amber-500 hover:text-amber-700 transition-colors p-1 rounded" title="Raise Task — closed period breach"><ClipboardList className="w-3.5 h-3.5" /></button>
                              )}
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
      </div>

      {/* ── VIEW APPLICATION DIALOG ── */}
      <Dialog open={!!viewRecord} onOpenChange={o => { if (!o) setViewRecord(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>NVZ Application Record</DialogTitle>
            {viewRecord && <DialogDescription>{viewRecord.fieldName ?? `Field #${viewRecord.fieldId}`} — {viewRecord.applicationDate ? new Date(viewRecord.applicationDate).toLocaleDateString("en-GB") : "—"}</DialogDescription>}
          </DialogHeader>
          {viewRecord && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Field", viewRecord.fieldName ?? `Field #${viewRecord.fieldId}`],
                  ["Date", viewRecord.applicationDate ? new Date(viewRecord.applicationDate).toLocaleDateString("en-GB") : "—"],
                  ["Product Name", viewRecord.productName],
                  ["Product Type", PRODUCT_TYPES.find(p => p.value === viewRecord.productType)?.label ?? viewRecord.productType],
                  ["N Rate (kg/ha)", parseFloat(viewRecord.nitrogenKgHa).toFixed(1)],
                  ["Area Applied (ha)", parseFloat(viewRecord.areaAppliedHa).toFixed(2)],
                  ["Total N Applied", `${parseFloat(viewRecord.totalNitrogenKg).toFixed(1)} kg`],
                  ["Application Method", viewRecord.applicationMethod ?? "—"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-xs text-foreground/50 font-medium uppercase tracking-wide mb-0.5">{k}</p>
                    <p className="font-medium text-foreground">{v || "—"}</p>
                  </div>
                ))}
              </div>
              {viewRecord.notes && (
                <div>
                  <p className="text-xs text-foreground/50 font-medium uppercase tracking-wide mb-0.5">Notes</p>
                  <p className="text-foreground/80">{viewRecord.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewRecord(null)}>Close</Button>
            <Button onClick={() => { const r = viewRecord!; setViewRecord(null); openEditApp(r); }}>Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── ADD / EDIT APPLICATION DIALOG ── */}
      <Dialog open={formOpen} onOpenChange={(o) => { if (!o) closeAppForm(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editRecord ? "Edit Fertiliser Application" : "Log Fertiliser Application"}</DialogTitle>
            <DialogDescription>
              {editRecord ? "Update this NVZ application record." : "Record a fertiliser or manure application for NVZ compliance tracking."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Field <span className="text-red-500">*</span></label>
                <Select value={form.fieldId} onValueChange={(v) => { const fld = fields.find(f => String(f.id) === v); setForm((f) => ({ ...f, fieldId: v, areaAppliedHa: fld?.areaHectares ? String(fld.areaHectares) : f.areaAppliedHa })); }}>
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
                {(() => {
                  const fr = fields.find((f) => String(f.id) === String(form.fieldId));
                  const area = form.areaAppliedHa ? parseFloat(form.areaAppliedHa) : null;
                  if ((fr as any)?.areaHectares && area && area > Number((fr as any).areaHectares)) {
                    return <p className="text-[11px] text-red-600 mt-1">Exceeds {(fr as any).name}&apos;s total area ({Number((fr as any).areaHectares).toFixed(2)} ha) — please correct before saving.</p>;
                  }
                  return null;
                })()}
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

            {/* ── Delivery-linked costing ── */}
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 px-3 py-2.5 space-y-2.5">
              <p className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                Link to Stock Delivery — auto-populate cost
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-foreground/60 mb-1 block">Fertiliser Stock Item</label>
                  <Select value={form.stockItemId} onValueChange={v => setForm(f => ({ ...f, stockItemId: v, stockDeliveryId: "", unitCostPencePerTonne: "", batchNumber: "", lotNumber: "" }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select stock item…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">— None —</SelectItem>
                      {fertStockItems.map((si: any) => <SelectItem key={String(si.id)} value={String(si.id)}>{String(si.name)}{si.unit ? ` (${si.unit})` : ""}</SelectItem>)}
                      {nvzStockItemsQ.data?.items?.filter((si: any) => !fertStockItems.find((f: any) => f.id === si.id)).map((si: any) => <SelectItem key={String(si.id)} value={String(si.id)}>{String(si.name)}{si.unit ? ` (${si.unit})` : ""}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground/60 mb-1 block">Delivery</label>
                  <Select value={form.stockDeliveryId} onValueChange={handleNvzDeliverySelect} disabled={!form.stockItemId}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={form.stockItemId ? "Select delivery…" : "Select item first"} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">— None —</SelectItem>
                      {(nvzDeliveriesQ.data?.deliveries ?? []).map((d: any) => (
                        <SelectItem key={String(d.id)} value={String(d.id)}>
                          {d.deliveryDate ? new Date(d.deliveryDate).toLocaleDateString("en-GB") : "—"}{d.batchNumber ? ` · ${d.batchNumber}` : ""}{d.unitPricePence != null ? ` · £${(d.unitPricePence / 100).toFixed(2)}/${d.stockItemUnit ?? "unit"}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-medium text-foreground/60 mb-1 block">Application Rate (kg/ha)</label>
                  <Input type="number" step="0.1" min="0" placeholder="e.g. 200" className="h-8 text-xs"
                    value={form.applicationRateKgHa}
                    onChange={e => setForm(f => ({ ...f, applicationRateKgHa: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground/60 mb-1 block">Unit Cost (p/tonne)</label>
                  <Input type="number" step="1" min="0" placeholder="auto" className="h-8 text-xs"
                    value={form.unitCostPencePerTonne}
                    onChange={e => setForm(f => ({ ...f, unitCostPencePerTonne: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground/60 mb-1 block">Calc. cost</label>
                  <div className="h-8 flex items-center px-2 rounded-lg border border-border/40 bg-white text-xs font-mono text-emerald-700">
                    {form.unitCostPencePerTonne && form.applicationRateKgHa && form.areaAppliedHa
                      ? `£${(Number(form.unitCostPencePerTonne) * parseFloat(form.applicationRateKgHa) / 1000 * parseFloat(form.areaAppliedHa) / 100).toFixed(2)}`
                      : "—"}
                  </div>
                </div>
              </div>
              {(form.batchNumber || form.lotNumber) && (
                <div className="flex gap-2 text-xs text-emerald-700">
                  {form.batchNumber && <span>Batch: <strong>{form.batchNumber}</strong></span>}
                  {form.lotNumber && <span>Lot: <strong>{form.lotNumber}</strong></span>}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Notes</label>
              <Input
                placeholder="Optional notes…"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Total Application Cost <span className="text-foreground/40 font-normal">(£) — optional, overridden by delivery calc above</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40 text-sm font-medium">£</span>
                <Input
                  type="number" step="0.01" min="0" placeholder="e.g. 320.00"
                  className="pl-7"
                  value={form.totalCostPence !== "" && form.totalCostPence != null ? (Number(form.totalCostPence) / 100).toFixed(2) : ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setForm((f) => ({ ...f, totalCostPence: v === "" ? "" : String(Math.round(parseFloat(v) * 100)) }));
                  }}
                />
              </div>
              <p className="text-xs text-foreground/40 mt-1">Manual override — leave blank if using delivery-linked costing above.</p>
            </div>
          </div>
          <DialogMutationError mutation={editRecord ? updateMut : addMut} message="Failed to save — your entries are still here." />
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={closeAppForm}>Cancel</Button>
            <Button onClick={handleAdd} disabled={addMut.isPending || updateMut.isPending}>
              {(addMut.isPending || updateMut.isPending) ? "Saving…" : editRecord ? "Save Changes" : "Save Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DELETE CONFIRM ── */}
      <Dialog open={deleteId !== null} onOpenChange={(o) => { if (!o) { setDeleteId(null); deleteMut.reset(); } }}>
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
          <DialogMutationError mutation={deleteMut} message="Failed to delete — the record is still here." />
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
                Record NVZ risk assessments required by the Nitrates Action Programme. Assessments identify application restrictions, soil risk factors, and mitigation measures.
              </p>
            </div>
            <Button size="sm" onClick={() => { setRaForm({ ...emptyRaForm }); setRaFieldIds([]); setRaAddOpen(true); }}>
              <Plus className="w-4 h-4 mr-1" /> Add Assessment
            </Button>
          </div>

          {riskAssessments.some(r => r.applicationRestrictionsIdentified?.trim()) && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "10px 14px" }}>
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-amber-800">Active Application Restrictions</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  {riskAssessments.filter(r => r.applicationRestrictionsIdentified?.trim()).length} assessment{riskAssessments.filter(r => r.applicationRestrictionsIdentified?.trim()).length !== 1 ? "s" : ""} have active restrictions. Review before spreading.
                </p>
              </div>
            </div>
          )}

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
                    {["Date", "Assessor", "Fields", "Soil Type", "Overall Risk", "Restrictions", "Next Review", ""].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "0.5rem 0.75rem", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {riskAssessments.map((r: any) => {
                    const riskColor = r.overallRiskLevel === "High" ? "#dc2626" : r.overallRiskLevel === "Medium" ? "#d97706" : "#16a34a";
                    const riskBg = r.overallRiskLevel === "High" ? "#fef2f2" : r.overallRiskLevel === "Medium" ? "#fffbeb" : "#f0fdf4";
                    const riskBorder = r.overallRiskLevel === "High" ? "#fecaca" : r.overallRiskLevel === "Medium" ? "#fde68a" : "#bbf7d0";
                    const displayAssessor = r.assessorName || r.assessedBy || "—";
                    const linkedIds: number[] = r.fieldIds ? (() => { try { return JSON.parse(r.fieldIds); } catch { return []; } })() : [];
                    const linkedNames = fields.filter(f => linkedIds.includes(f.id)).map(f => f.name);
                    const hasRestrictions = !!r.applicationRestrictionsIdentified?.trim();
                    return (
                      <tr key={r.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280" }}>{r.assessmentDate ? new Date(r.assessmentDate).toLocaleDateString("en-GB") : "—"}</td>
                        <td style={{ padding: "0.625rem 0.75rem" }}>
                          <div style={{ fontWeight: 500 }}>{displayAssessor}</div>
                          {r.assessorOrganisation && <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{r.assessorOrganisation}</div>}
                        </td>
                        <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280" }}>
                          {linkedNames.length > 0 ? <span title={linkedNames.join(", ")}>{linkedNames.length === 1 ? linkedNames[0] : `${linkedNames.length} fields`}</span> : "—"}
                        </td>
                        <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280" }}>{r.soilType || "—"}</td>
                        <td style={{ padding: "0.625rem 0.75rem" }}>
                          {r.overallRiskLevel ? <span style={{ background: riskBg, color: riskColor, border: `1px solid ${riskBorder}`, borderRadius: 4, padding: "2px 8px", fontSize: "0.75rem", fontWeight: 600 }}>{r.overallRiskLevel}</span> : <span style={{ color: "#9ca3af" }}>—</span>}
                        </td>
                        <td style={{ padding: "0.625rem 0.75rem", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {hasRestrictions
                            ? <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#d97706" }}><AlertTriangle style={{ width: 12, height: 12, flexShrink: 0 }} /><span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{r.applicationRestrictionsIdentified}</span></span>
                            : <span style={{ color: "#9ca3af" }}>None noted</span>}
                        </td>
                        <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280" }}>{r.nextReviewDate ? new Date(r.nextReviewDate).toLocaleDateString("en-GB") : "—"}</td>
                        <td style={{ padding: "0.625rem 0.75rem" }}>
                          <div style={{ display: "flex", gap: 4 }}>
                            <Button size="sm" variant="outline" style={{ fontSize: "0.75rem", height: 28 }} onClick={() => setRaViewItem(r)}>View</Button>
                            <Button size="sm" variant="outline" style={{ fontSize: "0.75rem", height: 28 }} onClick={() => {
                              setRaEditItem(r);
                              setRaFieldIds(r.fieldIds ? (() => { try { return JSON.parse(r.fieldIds); } catch { return []; } })() : []);
                              setRaForm({ assessmentDate: r.assessmentDate ? r.assessmentDate.slice(0, 10) : "", assessedBy: r.assessedBy ?? "", assessorName: r.assessorName ?? "", assessorOrganisation: r.assessorOrganisation ?? "", assessorSupplierId: (r as any).assessorSupplierId ?? null, assessorContactId: r.assessorContactId ? String(r.assessorContactId) : "", soilType: r.soilType ?? "", drainageRisk: r.drainageRisk ?? "", slopeRisk: r.slopeRisk ?? "", distanceToWatercourse: r.distanceToWatercourse ?? "", floodRisk: r.floodRisk ?? "", organicMatterLevel: r.organicMatterLevel ?? "", applicationRestrictionsIdentified: r.applicationRestrictionsIdentified ?? "", mitigationMeasures: r.mitigationMeasures ?? "", overallRiskLevel: r.overallRiskLevel ?? "", nextReviewDate: r.nextReviewDate ? r.nextReviewDate.slice(0, 10) : "", notes: r.notes ?? "" });
                            }}><Pencil style={{ width: 11, height: 11 }} /></Button>
                            <Button size="sm" variant="outline" style={{ fontSize: "0.75rem", height: 28, color: "#ef4444", borderColor: "#fca5a5" }} onClick={() => setRaDeleteId(r.id)}><Trash2 style={{ width: 11, height: 11 }} /></Button>
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
        <DialogContent style={{ maxWidth: 620 }}>
          <DialogHeader>
            <DialogTitle>NVZ Risk Assessment</DialogTitle>
            <DialogDescription>{raViewItem?.assessmentDate ? new Date(raViewItem.assessmentDate).toLocaleDateString("en-GB") : ""}</DialogDescription>
          </DialogHeader>
          {raViewItem && (() => {
            const riskColor = raViewItem.overallRiskLevel === "High" ? "#dc2626" : raViewItem.overallRiskLevel === "Medium" ? "#d97706" : "#16a34a";
            const riskBg = raViewItem.overallRiskLevel === "High" ? "#fef2f2" : raViewItem.overallRiskLevel === "Medium" ? "#fffbeb" : "#f0fdf4";
            const VField = ({ label, value }: { label: string; value?: string | null }) => (
              <div>
                <div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: "0.875rem", color: value ? "#111827" : "#d1d5db" }}>{value || "—"}</div>
              </div>
            );
            const linkedIds: number[] = raViewItem.fieldIds ? (() => { try { return JSON.parse(raViewItem.fieldIds); } catch { return []; } })() : [];
            const linkedFieldNames = fields.filter(f => linkedIds.includes(f.id)).map(f => f.name);
            return (
              <div style={{ display: "grid", gap: 14 }}>
                {raViewItem.applicationRestrictionsIdentified?.trim() && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px" }}>
                    <AlertTriangle style={{ width: 16, height: 16, color: "#d97706", marginTop: 1, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#92400e" }}>Application Restrictions Active</div>
                      <div style={{ fontSize: "0.8rem", color: "#78350f", marginTop: 2 }}>{raViewItem.applicationRestrictionsIdentified}</div>
                    </div>
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <VField label="Assessment Date" value={raViewItem.assessmentDate ? new Date(raViewItem.assessmentDate).toLocaleDateString("en-GB") : null} />
                  <VField label="Next Review Date" value={raViewItem.nextReviewDate ? new Date(raViewItem.nextReviewDate).toLocaleDateString("en-GB") : null} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <VField label="Assessor Name" value={raViewItem.assessorName || raViewItem.assessedBy} />
                  <VField label="Assessor Organisation" value={raViewItem.assessorOrganisation} />
                </div>
                {linkedFieldNames.length > 0 && <VField label="Fields Covered" value={linkedFieldNames.join(", ")} />}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <VField label="Soil Type (MAFF/AHDB)" value={raViewItem.soilType} />
                  <VField label="Organic Matter Level" value={raViewItem.organicMatterLevel} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                  <VField label="Drainage Risk" value={raViewItem.drainageRisk} />
                  <VField label="Slope Risk" value={raViewItem.slopeRisk} />
                  <VField label="Flood Risk" value={raViewItem.floodRisk} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <VField label="Distance to Watercourse" value={raViewItem.distanceToWatercourse} />
                  <div>
                    <div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 2 }}>Overall Risk Level</div>
                    {raViewItem.overallRiskLevel
                      ? <span style={{ background: riskBg, color: riskColor, border: `1px solid ${riskColor}33`, borderRadius: 4, padding: "2px 10px", fontSize: "0.8rem", fontWeight: 600 }}>{raViewItem.overallRiskLevel}</span>
                      : <span style={{ color: "#d1d5db", fontSize: "0.875rem" }}>—</span>}
                  </div>
                </div>
                {raViewItem.mitigationMeasures && <VField label="Mitigation Measures" value={raViewItem.mitigationMeasures} />}
                {raViewItem.notes && <VField label="Notes" value={raViewItem.notes} />}
              </div>
            );
          })()}
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setRaViewItem(null)}>Close</Button>
            {raViewItem?.applicationRestrictionsIdentified?.trim() && (
              <Button variant="outline" style={{ borderColor: "#fde68a", color: "#92400e", background: "#fffbeb" }}
                onClick={() => { setNvzRaiseTask({ title: "NVZ Application Restriction Active", description: raViewItem.applicationRestrictionsIdentified }); setRaViewItem(null); }}>
                <AlertTriangle className="w-4 h-4 mr-1" /> Raise Task
              </Button>
            )}
            <Button onClick={() => {
              const r = raViewItem;
              setRaViewItem(null);
              setRaEditItem(r);
              setRaFieldIds(r.fieldIds ? (() => { try { return JSON.parse(r.fieldIds); } catch { return []; } })() : []);
              setRaForm({ assessmentDate: r.assessmentDate ? r.assessmentDate.slice(0, 10) : "", assessedBy: r.assessedBy ?? "", assessorName: r.assessorName ?? "", assessorOrganisation: r.assessorOrganisation ?? "", assessorSupplierId: (r as any).assessorSupplierId ?? null, assessorContactId: r.assessorContactId ? String(r.assessorContactId) : "", soilType: r.soilType ?? "", drainageRisk: r.drainageRisk ?? "", slopeRisk: r.slopeRisk ?? "", distanceToWatercourse: r.distanceToWatercourse ?? "", floodRisk: r.floodRisk ?? "", organicMatterLevel: r.organicMatterLevel ?? "", applicationRestrictionsIdentified: r.applicationRestrictionsIdentified ?? "", mitigationMeasures: r.mitigationMeasures ?? "", overallRiskLevel: r.overallRiskLevel ?? "", nextReviewDate: r.nextReviewDate ? r.nextReviewDate.slice(0, 10) : "", notes: r.notes ?? "" });
            }}>Edit Assessment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── RISK ASSESSMENT ADD/EDIT DIALOG ── */}
      <Dialog open={raAddOpen || !!raEditItem} onOpenChange={open => { if (!open) { setRaAddOpen(false); setRaEditItem(null); setRaFieldIds([]); raCreateMut.reset(); raUpdateMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 620 }}>
          <DialogHeader><DialogTitle>{raEditItem ? "Edit Risk Assessment" : "Add NVZ Risk Assessment"}</DialogTitle></DialogHeader>
          <div style={{ display: "grid", gap: 12, maxHeight: "70vh", overflowY: "auto", paddingRight: 4 }}>
            <div><label className="text-sm font-medium mb-1.5 block">Assessment Date *</label><Input type="date" value={raForm.assessmentDate} onChange={e => setRaForm(f => ({ ...f, assessmentDate: e.target.value }))} /></div>
            {contacts.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-1.5 block">Select from Contacts Register</label>
                <Select value={raForm.assessorContactId} onValueChange={v => {
                  const c = contacts.find(x => String(x.id) === v);
                  setRaForm(f => ({ ...f, assessorContactId: v, assessorName: c?.name ?? f.assessorName, assessorOrganisation: c?.organisation ?? f.assessorOrganisation }));
                }}>
                  <SelectTrigger><SelectValue placeholder="Pick a contact to auto-fill assessor…" /></SelectTrigger>
                  <SelectContent>
                    {contacts.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}{c.organisation ? ` · ${c.organisation}` : ""}{c.role ? ` (${c.role})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label className="text-sm font-medium mb-1.5 block">Assessor Name</label><Input value={raForm.assessorName} onChange={e => setRaForm(f => ({ ...f, assessorName: e.target.value }))} placeholder="Full name" /></div>
              <div><label className="text-sm font-medium mb-1.5 block">Assessor Organisation</label><BuyerCombobox farmId={farmId!} types={["contractor", "general"]} valueId={raForm.assessorSupplierId ?? null} valueName={raForm.assessorOrganisation} onChange={(id, name) => setRaForm(f => ({ ...f, assessorSupplierId: id, assessorOrganisation: name }))} /></div>
            </div>
            {fields.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-1.5 block">Fields Covered</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 6, background: "#fafafa" }}>
                  {fields.map(f => (
                    <label key={f.id} style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer", fontSize: "0.8rem", userSelect: "none" }}>
                      <input type="checkbox" checked={raFieldIds.includes(f.id)} onChange={e => setRaFieldIds(ids => e.target.checked ? [...ids, f.id] : ids.filter(id => id !== f.id))} style={{ cursor: "pointer" }} />
                      {f.name}
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Soil Type (MAFF/AHDB)</label>
                <Select value={raForm.soilType} onValueChange={v => setRaForm(f => ({ ...f, soilType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select texture…" /></SelectTrigger>
                  <SelectContent>{soilTypes.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Organic Matter Level</label>
                <Select value={raForm.organicMatterLevel} onValueChange={v => setRaForm(f => ({ ...f, organicMatterLevel: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>{["Low", "Medium", "High"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
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
              <div><label className="text-sm font-medium mb-1.5 block">Distance to Watercourse</label><Input value={raForm.distanceToWatercourse} onChange={e => setRaForm(f => ({ ...f, distanceToWatercourse: e.target.value }))} placeholder="e.g. &gt;50m, 20m" /></div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Application Restrictions Identified</label>
              <Input value={raForm.applicationRestrictionsIdentified} onChange={e => setRaForm(f => ({ ...f, applicationRestrictionsIdentified: e.target.value }))} placeholder="e.g. No spreading Dec–Feb, 10m buffer required near drain" />
              {raForm.applicationRestrictionsIdentified?.trim() && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> This restriction will appear as a standing notice in the Week Ahead planner.</p>
              )}
            </div>
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
          <DialogMutationError mutation={raEditItem ? raUpdateMut : raCreateMut} message="Failed to save — your entries are still here." />
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => { setRaAddOpen(false); setRaEditItem(null); setRaFieldIds([]); }}>Cancel</Button>
            <Button onClick={() => {
              if (raEditItem) raUpdateMut.mutate({ id: raEditItem.id, body: raForm });
              else raCreateMut.mutate(raForm);
            }} disabled={!raForm.assessmentDate}>Save Assessment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={raDeleteId !== null} onOpenChange={open => { if (!open) { setRaDeleteId(null); raDeleteMut.reset(); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Risk Assessment</DialogTitle><DialogDescription>This cannot be undone.</DialogDescription></DialogHeader>
          <DialogMutationError mutation={raDeleteMut} message="Failed to delete — the record is still here." />
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setRaDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => raDeleteId !== null && raDeleteMut.mutate(raDeleteId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── CONTACTS TAB ── */}
      {tab === "contacts" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div style={{ flex: 1 }}>
              <p className="text-sm text-foreground/60">Farm contacts register for assessors, agronomists, vets, and advisers. Select a contact when recording risk assessments to auto-populate assessor details.</p>
            </div>
            <Button size="sm" onClick={() => { setContactForm({ ...emptyContactForm }); setContactAddOpen(true); }}>
              <Plus className="w-4 h-4 mr-1" /> Add Contact
            </Button>
          </div>
          {contactsQ.isLoading ? (
            <p className="text-sm text-foreground/40 text-center py-10">Loading…</p>
          ) : contacts.length === 0 ? (
            <div className="border border-border rounded-xl p-10 text-center text-foreground/40">
              <Users className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No contacts added yet</p>
              <p className="text-sm mt-1">Add assessors, agronomists and advisers to quickly populate risk assessment records.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                    {["Name", "Organisation", "Role", "Email", "Phone", ""].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "0.5rem 0.75rem", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((c: any) => (
                    <tr key={c.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "0.625rem 0.75rem", fontWeight: 500 }}>
                        {c.name}
                        {c.qualifications && <div style={{ fontSize: "0.7rem", color: "#9ca3af" }}>{c.qualifications}</div>}
                      </td>
                      <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280" }}>{c.organisation || "—"}</td>
                      <td style={{ padding: "0.625rem 0.75rem", color: "#6b7280" }}>{c.role || "—"}</td>
                      <td style={{ padding: "0.625rem 0.75rem" }}>
                        {c.email ? <a href={`mailto:${c.email}`} style={{ color: "#3b82f6", textDecoration: "none", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 3 }}><Mail style={{ width: 12, height: 12 }} />{c.email}</a> : <span style={{ color: "#9ca3af" }}>—</span>}
                      </td>
                      <td style={{ padding: "0.625rem 0.75rem" }}>
                        {c.phone ? <span style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 3 }}><Phone style={{ width: 12, height: 12 }} />{c.phone}</span> : <span style={{ color: "#9ca3af" }}>—</span>}
                      </td>
                      <td style={{ padding: "0.625rem 0.75rem" }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <Button size="sm" variant="outline" style={{ fontSize: "0.75rem", height: 28 }} onClick={() => { setContactEditItem(c); setContactForm({ name: c.name, organisation: c.organisation ?? "", email: c.email ?? "", phone: c.phone ?? "", role: c.role ?? "", qualifications: c.qualifications ?? "", notes: c.notes ?? "" }); }}><Pencil style={{ width: 11, height: 11 }} /></Button>
                          <Button size="sm" variant="outline" style={{ fontSize: "0.75rem", height: 28, color: "#ef4444", borderColor: "#fca5a5" }} onClick={() => setContactDeleteId(c.id)}><Trash2 style={{ width: 11, height: 11 }} /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── CONTACT ADD/EDIT DIALOG ── */}
      <Dialog open={contactAddOpen || !!contactEditItem} onOpenChange={open => { if (!open) { setContactAddOpen(false); setContactEditItem(null); contactCreateMut.reset(); contactUpdateMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 520 }}>
          <DialogHeader><DialogTitle>{contactEditItem ? "Edit Contact" : "Add Contact"}</DialogTitle></DialogHeader>
          <div style={{ display: "grid", gap: 12 }}>
            <div><label className="text-sm font-medium mb-1.5 block">Name *</label><Input value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label className="text-sm font-medium mb-1.5 block">Organisation</label><Input value={contactForm.organisation} onChange={e => setContactForm(f => ({ ...f, organisation: e.target.value }))} placeholder="Company or firm" /></div>
              <div><label className="text-sm font-medium mb-1.5 block">Role</label><Input value={contactForm.role} onChange={e => setContactForm(f => ({ ...f, role: e.target.value }))} placeholder="e.g. NVZ Assessor, Agronomist" /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label className="text-sm font-medium mb-1.5 block">Email</label><Input type="email" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" /></div>
              <div><label className="text-sm font-medium mb-1.5 block">Phone</label><Input value={contactForm.phone} onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))} placeholder="01234 567890" /></div>
            </div>
            <div><label className="text-sm font-medium mb-1.5 block">Qualifications</label><Input value={contactForm.qualifications} onChange={e => setContactForm(f => ({ ...f, qualifications: e.target.value }))} placeholder="e.g. FACTS qualified, BASIS registered" /></div>
            <div><label className="text-sm font-medium mb-1.5 block">Notes</label><Input value={contactForm.notes} onChange={e => setContactForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogMutationError mutation={contactEditItem ? contactUpdateMut : contactCreateMut} message="Failed to save — your entries are still here." />
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => { setContactAddOpen(false); setContactEditItem(null); }}>Cancel</Button>
            <Button onClick={() => {
              if (contactEditItem) contactUpdateMut.mutate({ id: contactEditItem.id, body: contactForm });
              else contactCreateMut.mutate(contactForm);
            }} disabled={!contactForm.name.trim()}>Save Contact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={contactDeleteId !== null} onOpenChange={open => { if (!open) { setContactDeleteId(null); contactDeleteMut.reset(); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Remove Contact</DialogTitle><DialogDescription>This will remove the contact from the register. Existing risk assessments are not affected.</DialogDescription></DialogHeader>
          <DialogMutationError mutation={contactDeleteMut} message="Failed to remove — the contact is still here." />
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setContactDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => contactDeleteId !== null && contactDeleteMut.mutate(contactDeleteId)}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RaiseTaskDialog
        farmId={farmId!}
        open={!!nvzRaiseTask}
        onClose={() => setNvzRaiseTask(null)}
        defaultTitle={nvzRaiseTask?.title ?? ""}
        defaultDescription={nvzRaiseTask?.description ?? ""}
        taskType="nvz_restriction"
        module="NVZ"
      />

      {/* ── BUDGET CALC TAB ── */}
      {tab === "budget-calc" && (
        <NvzBudgetCalcTab fields={fields} applications={applications} selectedYear={selectedYear} farmId={farmId!} raiseTaskFor={raiseTaskFor} setRaiseTaskFor={setRaiseTaskFor} />
      )}

      {/* ── NVZ FIELD SETTINGS DIALOG ── */}
      <Dialog open={nvzEditField !== null} onOpenChange={(o) => { if (!o) { setNvzEditField(null); nvzEditMut.reset(); } }}>
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
          <DialogMutationError mutation={nvzEditMut} message="Failed to save — your entries are still here." />
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

// ─── T019: NVZ Nitrogen Budget Calculator ─────────────────────────────────────
// DEFRA Action Programme N limits (kg N/ha/year)
const N_LIMITS: Record<string, Record<string, number>> = {
  arable:    { organic: 170, total: 250, syntheticMax: 150 },
  grassland: { organic: 170, total: 300, syntheticMax: 200 },
  mixed:     { organic: 170, total: 250, syntheticMax: 175 },
};
const BUDGET_ORGANIC_TYPES = new Set(["slurry","pig-slurry","poultry-manure","fym","digestate-liquid","digestate-solid","sewage-sludge","compost","other-organic"]);

interface NvzBudgetCalcProps {
  fields: { id: number; name?: string; areaHectares?: string | number | null; isNvz?: boolean; landType?: string | null; isActive?: boolean | null }[];
  applications: { fieldId?: number | null; productType?: string | null; totalNitrogenKgHa?: number | null; applicationDate?: string | null; quantityApplied?: number | null }[];
  selectedYear: number;
  farmId: number;
  raiseTaskFor: NvzApplication | null;
  setRaiseTaskFor: (r: NvzApplication | null) => void;
}

function NvzBudgetCalcTab({ fields, applications, selectedYear, farmId, raiseTaskFor, setRaiseTaskFor }: NvzBudgetCalcProps) {
  const nvzFields = fields.filter(f => f.isNvz && f.isActive !== false);
  const [extras, setExtras] = useState<Record<number, { synth: string; organic: string }>>({});

  const setExtra = (fieldId: number, key: "synth" | "organic", val: string) =>
    setExtras(p => ({ ...p, [fieldId]: { ...(p[fieldId] ?? { synth: "", organic: "" }), [key]: val } }));

  if (nvzFields.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Leaf className="w-8 h-8 mx-auto mb-3 opacity-30" />
        <p className="font-medium">No NVZ fields configured</p>
        <p className="text-sm mt-1">Mark fields as NVZ in the NVZ Summary tab to use the budget calculator.</p>
      </div>
    );
  }

  const yearApps = applications.filter(a => a.applicationDate?.startsWith(String(selectedYear)));

  return (
    <div className="space-y-5">
      <div className="flex gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800">
        <Leaf className="w-4 h-4 mt-0.5 shrink-0" />
        <div>
          <strong>Nitrogen Budget Calculator — {selectedYear}</strong> — Shows actual N applied (from your application log) plus any manual additions, against DEFRA Action Programme limits for NVZ fields.
          Organic N limit: <strong>170 kg N/ha/yr</strong>. Total N limit varies by land type.
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b text-xs text-gray-600">
              <th className="text-left px-4 py-2.5 font-medium">Field</th>
              <th className="text-left px-3 py-2.5 font-medium">Land type</th>
              <th className="text-right px-3 py-2.5 font-medium">Area (ha)</th>
              <th className="text-right px-3 py-2.5 font-medium">Logged N (kg/ha)</th>
              <th className="text-right px-3 py-2.5 font-medium">+ Synthetic N</th>
              <th className="text-right px-3 py-2.5 font-medium">+ Organic N</th>
              <th className="text-right px-3 py-2.5 font-medium">Total N</th>
              <th className="text-right px-3 py-2.5 font-medium">Limit</th>
              <th className="text-right px-3 py-2.5 font-medium">Remaining</th>
              <th className="text-center px-3 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {nvzFields.map((field, i, arr) => {
              const fid = field.id;
              const landType = (field.landType as string) || "arable";
              const limits = N_LIMITS[landType] ?? N_LIMITS["arable"];
              const ha = parseFloat(String(field.areaHectares ?? "0")) || 1;

              // Sum N from logged applications for this field and year
              const fieldApps = yearApps.filter(a => a.fieldId === fid);
              const loggedN = fieldApps.reduce((s, a) => {
                const n = parseFloat(String(a.totalNitrogenKgHa ?? "0")) || 0;
                return s + n;
              }, 0);
              const loggedOrganic = fieldApps.filter(a => BUDGET_ORGANIC_TYPES.has(a.productType ?? "")).reduce((s, a) => s + (parseFloat(String(a.totalNitrogenKgHa ?? "0")) || 0), 0);

              const extraSynth = parseFloat(extras[fid]?.synth ?? "0") || 0;
              const extraOrganic = parseFloat(extras[fid]?.organic ?? "0") || 0;
              const totalOrganic = loggedOrganic + extraOrganic;
              const totalN = loggedN + extraSynth + extraOrganic;
              const remaining = limits.total - totalN;
              const organicOk = totalOrganic <= 170;
              const totalOk = totalN <= limits.total;
              const status = !organicOk ? "organic-breach" : !totalOk ? "total-breach" : remaining < 30 ? "near-limit" : "ok";

              const statusBadge = {
                "ok":             { label: "Within limit", bg: "#dcfce7", col: "#15803d" },
                "near-limit":     { label: "Near limit",   bg: "#fef9c3", col: "#92400e" },
                "organic-breach": { label: "Organic over", bg: "#fee2e2", col: "#b91c1c" },
                "total-breach":   { label: "Over limit",   bg: "#fee2e2", col: "#b91c1c" },
              }[status];

              return (
                <tr key={fid} style={{ borderBottom: i < arr.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <td className="px-4 py-2.5 font-medium">{field.name ?? `Field ${fid}`}</td>
                  <td className="px-3 py-2.5 capitalize text-gray-500 text-xs">{landType}</td>
                  <td className="px-3 py-2.5 text-right text-gray-600">{ha.toFixed(1)}</td>
                  <td className="px-3 py-2.5 text-right font-mono">{loggedN.toFixed(1)}</td>
                  <td className="px-3 py-1.5 text-right">
                    <input type="number" min="0" step="any" className="w-16 border rounded px-1.5 py-1 text-xs text-right" value={extras[fid]?.synth ?? ""} onChange={e => setExtra(fid, "synth", e.target.value)} placeholder="0" />
                  </td>
                  <td className="px-3 py-1.5 text-right">
                    <input type="number" min="0" step="any" className="w-16 border rounded px-1.5 py-1 text-xs text-right" value={extras[fid]?.organic ?? ""} onChange={e => setExtra(fid, "organic", e.target.value)} placeholder="0" />
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono font-semibold">{totalN.toFixed(1)}</td>
                  <td className="px-3 py-2.5 text-right text-gray-500">{limits.total}</td>
                  <td className="px-3 py-2.5 text-right font-mono" style={{ color: remaining < 0 ? "#dc2626" : remaining < 30 ? "#d97706" : "#16a34a", fontWeight: 600 }}>
                    {remaining.toFixed(1)}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: statusBadge.bg, color: statusBadge.col }}>{statusBadge.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* eslint-disable-next-line */}
      {/* @ts-ignore */}
      <RaiseTaskDialog
        farmId={farmId}
        open={!!raiseTaskFor}
        onClose={() => setRaiseTaskFor(null)}
        defaultTitle={raiseTaskFor ? `NVZ Closed Period Breach — ${raiseTaskFor.fieldName ?? `Field #${raiseTaskFor.fieldId}`}` : ""}
        defaultDescription={raiseTaskFor ? `Application of ${raiseTaskFor.productName} (${PRODUCT_TYPES.find(p => p.value === raiseTaskFor.productType)?.label ?? raiseTaskFor.productType}) on ${raiseTaskFor.applicationDate ? new Date(raiseTaskFor.applicationDate).toLocaleDateString("en-GB") : "unknown date"} may be within a closed spreading period. Review and notify EA if required.` : ""}
        module="nvz"
      />

      <div className="text-xs text-gray-400 space-y-0.5">
        <p>Logged N is taken from your NVZ Application Log for {selectedYear}. Use the +Synthetic N / +Organic N columns to add any additional applications not yet recorded.</p>
        <p>Organic N limit: 170 kg N/ha/yr (all NVZ fields). Total N limits: arable 250, grassland 300, mixed 250 kg/ha/yr — DEFRA Action Programme for Nitrates, England.</p>
      </div>
    </div>
  );
}
