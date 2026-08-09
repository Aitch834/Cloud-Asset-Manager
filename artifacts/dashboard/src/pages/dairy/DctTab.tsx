import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { usePersistedFilter, usePersistedNumberFilter } from "@/hooks/use-persisted-filter";
import { useSafeUser } from "@/hooks/use-safe-clerk";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, PieChart, Pie, Cell, Legend } from "recharts";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { DocAttach } from "@/components/DocAttach";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Redirect } from "wouter";
import { Plus, Pencil, Trash2, Loader2, AlertTriangle, CheckCircle2, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, Eye, Droplets, Thermometer, FileDown, Paperclip, BarChart2, QrCode, Download, MapPin, ChevronsUpDown, Search, X, Sparkles, ClipboardList, Printer, Building2, ShoppingCart, PackageCheck, Receipt, Clock, BadgeCheck, XCircle, TrendingUp, TrendingDown, Package, Check, FlaskConical } from "lucide-react";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { QRCodeSVG } from "qrcode.react";
import { useFarmMembers } from "@/hooks/use-farm-members";
import { StaffSelect } from "@/components/ui/staff-select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { openPrintWindow } from "@/lib/print-report";
import { VMD_MEDICINES } from "@/data/vmdMedicines";
import { useToast } from "@/hooks/use-toast";
import { api, formatDate, today, SccBadge } from "./shared";

// ─── Dry Cow Therapy ───────────────────────────────────────────────────────────

// Typical withdrawal days for known intramammary DCT products (post-calving milk / meat from administration)
const DCT_WITHDRAWAL: Record<string, { milkDays: number; meatDays: number }> = {
  "Orbenin Extra Dry Cow": { milkDays: 7, meatDays: 28 },
  "Orbenin Quick Release": { milkDays: 4, meatDays: 10 },
  "Bovaclox DC Extra": { milkDays: 7, meatDays: 28 },
  "Bovaclox Milking": { milkDays: 4, meatDays: 14 },
  "Tetra-Delta": { milkDays: 7, meatDays: 60 },
  "Pirsue 5 mg/ml": { milkDays: 7, meatDays: 30 },
  "Mastiplan LC": { milkDays: 7, meatDays: 28 },
  "Kloxerate Plus": { milkDays: 7, meatDays: 28 },
  "Ubrolexin": { milkDays: 5, meatDays: 21 },
};

const INTRAMAMMARY_ANTIBIOTICS = VMD_MEDICINES.filter(
  m => m.category === "Intramammary" &&
    !m.name.toLowerCase().includes("sealant") &&
    !m.activeIngredient.toLowerCase().includes("bismuth")
);

const INTRAMAMMARY_SEALANTS = VMD_MEDICINES.filter(
  m => m.category === "Intramammary" && (
    m.name.toLowerCase().includes("sealant") ||
    m.activeIngredient.toLowerCase().includes("bismuth")
  )
);

interface DctRecord {
  id: number; herdId?: number | null; animalId?: number | null; cowEarTag?: string | null;
  dryOffDate: string; protocol: string; antibioticTubeProduct?: string | null;
  antibioticTubeBatch?: string | null; antibioticTubeWithdrawalMilkDays?: number | null;
  antibioticTubeWithdrawalMeatDays?: number | null; teatSealantProduct?: string | null;
  teatSealantBatch?: string | null; treatmentJustification?: string | null;
  sccAtDryOff?: number | null; mastitisEpisodes12Months?: number | null;
  administeredBy?: string | null; vetAuthorisation?: boolean; vetName?: string | null;
  expectedCalvingDate?: string | null; estimatedPrescriptionFee?: number | string | null; notes?: string | null;
}

interface FarmAnimal { id: number; earTagNumber?: string | null; tagNumber?: string | null; herdId?: number | null; breed?: string | null; species?: string | null; }

// ── Small reusable inline combobox for product name lookup ──────────────────
function ProductCombobox({
  value, onChange, options, placeholder,
}: {
  value: string; onChange: (v: string) => void;
  options: { name: string; activeIngredient: string }[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query.length >= 1
    ? options.filter(o =>
        o.name.toLowerCase().includes(query.toLowerCase()) ||
        o.activeIngredient.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10)
    : options.slice(0, 10);

  function select(name: string) { onChange(name); setQuery(""); setOpen(false); }

  return (
    <div ref={wrapRef} className="relative">
      <Input
        value={open ? query : (value || "")}
        placeholder={placeholder}
        onChange={e => { setQuery(e.target.value); setOpen(true); onChange(e.target.value); }}
        onFocus={() => { setOpen(true); setQuery(""); }}
        className="pr-7"
        autoComplete="off"
      />
      <ChevronsUpDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="px-3 py-3 text-xs text-gray-400 text-center">No products match — type to enter custom name</div>
          )}
          {filtered.map(o => (
            <button key={o.name} type="button"
              className={`w-full text-left px-3 py-2 text-sm hover:bg-primary/5 flex items-start justify-between gap-2 ${value === o.name ? "bg-primary/10" : ""}`}
              onMouseDown={e => { e.preventDefault(); select(o.name); }}
            >
              <div>
                <div className="font-medium">{o.name}</div>
                <div className="text-xs text-gray-400">{o.activeIngredient}</div>
              </div>
              {value === o.name && <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Generic name combobox (vet names, staff names) ──────────────────────────
function NameCombobox({
  value, onChange, names, placeholder, allowFreeType = true,
}: {
  value: string; onChange: (v: string) => void;
  names: string[]; placeholder: string; allowFreeType?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query.length >= 1
    ? names.filter(n => n.toLowerCase().includes(query.toLowerCase())).slice(0, 12)
    : names.slice(0, 12);

  function select(name: string) { onChange(name); setQuery(""); setOpen(false); }

  return (
    <div ref={wrapRef} className="relative">
      <Input
        value={open ? query : (value || "")}
        placeholder={placeholder}
        onChange={e => { setQuery(e.target.value); setOpen(true); if (allowFreeType) onChange(e.target.value); }}
        onFocus={() => { setOpen(true); setQuery(""); }}
        className="pr-7"
        autoComplete="off"
      />
      <ChevronsUpDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
          {filtered.length === 0 && names.length === 0 && (
            <div className="px-3 py-3 text-xs text-gray-400 text-center">No previous records — type name above</div>
          )}
          {filtered.length === 0 && names.length > 0 && query.length >= 1 && (
            <div className="px-3 py-2 text-xs text-gray-400">No match — will use "{query}"</div>
          )}
          {filtered.map(n => (
            <button key={n} type="button"
              className={`w-full text-left px-3 py-2 text-sm hover:bg-primary/5 flex items-center justify-between ${value === n ? "bg-primary/10" : ""}`}
              onMouseDown={e => { e.preventDefault(); select(n); }}
            >
              <span>{n}</span>
              {value === n && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Animal ear tag combobox ─────────────────────────────────────────────────
function AnimalEarTagCombobox({
  value, onSelect, animals,
}: {
  value: string; onSelect: (tag: string, animal: FarmAnimal | null) => void;
  animals: FarmAnimal[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query.length >= 1
    ? animals.filter(a => {
        const tag = (a.earTagNumber || a.tagNumber || "").toLowerCase();
        return tag.includes(query.toLowerCase());
      }).slice(0, 12)
    : animals.slice(0, 12);

  function select(a: FarmAnimal) {
    const tag = a.earTagNumber || a.tagNumber || "";
    onSelect(tag, a);
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative">
      <Input
        value={open ? query : (value || "")}
        placeholder="e.g. UK123456 78901"
        onChange={e => { setQuery(e.target.value); setOpen(true); onSelect(e.target.value, null); }}
        onFocus={() => { setOpen(true); setQuery(value || ""); }}
        className="pr-7"
        autoComplete="off"
      />
      <ChevronsUpDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {animals.length === 0 && (
            <div className="px-3 py-3 text-xs text-gray-400 text-center">No animals in register — enter tag manually</div>
          )}
          {filtered.length === 0 && query.length >= 1 && (
            <div className="px-3 py-3 text-xs text-gray-400 text-center">No match — enter "{query}" manually</div>
          )}
          {filtered.map(a => {
            const tag = a.earTagNumber || a.tagNumber || "—";
            return (
              <button key={a.id} type="button"
                className={`w-full text-left px-3 py-2 text-sm hover:bg-primary/5 flex items-center justify-between gap-2 ${value === tag ? "bg-primary/10" : ""}`}
                onMouseDown={e => { e.preventDefault(); select(a); }}
              >
                <div>
                  <div className="font-mono font-medium">{tag}</div>
                  {a.breed && <div className="text-xs text-gray-400">{a.breed}</div>}
                </div>
                {value === tag && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DctTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DctRecord | null>(null);
  const [viewRecord, setViewRecord] = useState<DctRecord | null>(null);
  const [form, setForm] = useState<Partial<DctRecord>>({});
  const [hint, setHint] = useState<{ mastitisCount12m: number; recentMastitisScc: number | null } | null>(null);
  const [hintLoading, setHintLoading] = useState(false);

  const { data, isLoading } = useQuery<{ records: DctRecord[] }>({
    queryKey: ["dairy-dct", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/dct-records`), { credentials: "include" }).then(r => r.json()),
  });

  const { data: animalsData } = useQuery<{ records: FarmAnimal[] }>({
    queryKey: ["farm-animals-dct", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/animals`), { credentials: "include" }).then(r => r.json()),
    staleTime: 60000,
  });
  const animals = (animalsData?.records ?? []).filter(a => {
    const sp = (a.species || "").toLowerCase();
    return !sp || sp.includes("bovine") || sp.includes("cattle") || sp.includes("cow") || sp.includes("dairy");
  });

  const { data: vetNamesData } = useQuery<{ names: string[] }>({
    queryKey: ["dct-vet-names", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/dct-vet-names`), { credentials: "include" }).then(r => r.json()),
    staleTime: 120000,
  });
  const vetNames = vetNamesData?.names ?? [];

  const { data: staffNamesData } = useQuery<{ names: string[] }>({
    queryKey: ["dairy-staff-names", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/staff-names`), { credentials: "include" }).then(r => r.json()),
    staleTime: 120000,
  });
  const staffNames = staffNamesData?.names ?? [];

  const { data: attachCountsRaw = [] } = useQuery<Array<{recordType: string; recordId: number; count: number}>>({
    queryKey: ["record-attachment-counts", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/record-attachments/counts`), { credentials: "include" }).then(r => r.json()),
    staleTime: 30000,
  });
  const dctAttachMap = Object.fromEntries(attachCountsRaw.filter(c => c.recordType === "dct").map(c => [c.recordId, c.count]));

  const save = useMutation({
    mutationFn: async (body: Partial<DctRecord>) => {
      const url = editing ? api(`farms/${farmId}/dairy/dct-records/${editing.id}`) : api(`farms/${farmId}/dairy/dct-records`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dairy-dct", farmId] }); setOpen(false); setEditing(null); setForm({}); setHint(null); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/dairy/dct-records/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-dct", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function openAdd() { setEditing(null); setForm({ dryOffDate: today(), protocol: "selective" }); setHint(null); setOpen(true); }
  function openEdit(r: DctRecord) { setEditing(r); setForm({ ...r, dryOffDate: r.dryOffDate.slice(0, 10), expectedCalvingDate: r.expectedCalvingDate?.slice(0, 10) }); setHint(null); setOpen(true); }
  function set(k: keyof DctRecord, v: unknown) { setForm(f => ({ ...f, [k]: v })); }

  const fetchHint = useCallback(async (earTag: string) => {
    if (!earTag.trim()) { setHint(null); return; }
    setHintLoading(true);
    try {
      const res = await fetch(api(`farms/${farmId}/dairy/dct-animal-hint?earTag=${encodeURIComponent(earTag)}`), { credentials: "include" });
      const data = await res.json();
      setHint({ mastitisCount12m: data.mastitisCount12m ?? 0, recentMastitisScc: data.recentMastitisScc ?? null });
    } catch { setHint(null); }
    setHintLoading(false);
  }, [farmId]);

  function handleAnimalSelect(tag: string, animal: FarmAnimal | null) {
    setForm(f => ({ ...f, cowEarTag: tag, animalId: animal?.id ?? null, herdId: animal?.herdId ?? f.herdId }));
    if (tag.trim().length >= 5) fetchHint(tag);
    else setHint(null);
  }

  function applyHint() {
    if (!hint) return;
    setForm(f => ({
      ...f,
      mastitisEpisodes12Months: hint.mastitisCount12m,
      ...(hint.recentMastitisScc && !f.sccAtDryOff ? { sccAtDryOff: hint.recentMastitisScc } : {}),
    }));
  }

  function handleAntibioticProduct(name: string) {
    set("antibioticTubeProduct", name);
    const wd = DCT_WITHDRAWAL[name];
    if (wd) {
      setForm(f => ({ ...f, antibioticTubeProduct: name, antibioticTubeWithdrawalMilkDays: wd.milkDays, antibioticTubeWithdrawalMeatDays: wd.meatDays }));
    }
  }

  const PROTOCOLS = [
    { value: "selective", label: "Selective DCT (antibiotic only where indicated)" },
    { value: "blanket", label: "Blanket DCT (all cows treated)" },
    { value: "teat-sealant-only", label: "Teat Sealant Only (no antibiotic)" },
    { value: "selective-sealant", label: "Selective DCT + Teat Sealant" },
    { value: "blanket-sealant", label: "Blanket DCT + Teat Sealant" },
  ];

  const needsVetAuth = form.protocol !== "teat-sealant-only";
  const canSave = !!form.dryOffDate && (!needsVetAuth || !!form.vetAuthorisation);

  const hasHintData = hint && (hint.mastitisCount12m > 0 || hint.recentMastitisScc);

  const [dctYear, setDctYear] = usePersistedNumberFilter({ page: "dairy-dct", filter: "chart-year", farmId, defaultValue: new Date().getFullYear() });
  const allDctRecords = data?.records ?? [];
  const dctYearRecords = allDctRecords.filter(r => r.dryOffDate && new Date(r.dryOffDate).getFullYear() === dctYear);
  const [dctListYear, setDctListYear] = usePersistedFilter({ page: "dairy-dct", filter: "year", farmId, defaultValue: "all" });
  const dctListYears = React.useMemo(() => Array.from(new Set(allDctRecords.map(r => String(r.dryOffDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [allDctRecords]);
  const filteredDctList = dctListYear === "all" ? allDctRecords : allDctRecords.filter(r => String(r.dryOffDate ?? "").startsWith(dctListYear));

  const dctStats = React.useMemo(() => {
    const recs = dctYearRecords;
    const total = recs.length;
    const selective = recs.filter(r => r.protocol === "selective" || r.protocol === "selective-sealant").length;
    const blanket = recs.filter(r => r.protocol === "blanket" || r.protocol === "blanket-sealant").length;
    const sealantOnly = recs.filter(r => r.protocol === "teat-sealant-only").length;
    const vetAuthorised = recs.filter(r => r.vetAuthorisation).length;
    const sccValues = recs.filter(r => r.sccAtDryOff != null).map(r => r.sccAtDryOff!);
    const avgScc = sccValues.length > 0 ? Math.round(sccValues.reduce((a, b) => a + b, 0) / sccValues.length) : null;
    const productCounts: Record<string, number> = {};
    recs.forEach(r => { if (r.antibioticTubeProduct) productCounts[r.antibioticTubeProduct] = (productCounts[r.antibioticTubeProduct] || 0) + 1; });
    const topProducts = Object.entries(productCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return { total, selective, blanket, sealantOnly, vetAuthorised, avgScc, topProducts };
  }, [dctYearRecords]);

  function generateDctReport() {
    const printedDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const s = dctStats;
    const recs = [...dctYearRecords].sort((a, b) => b.dryOffDate.localeCompare(a.dryOffDate));
    const productRows = s.topProducts.map(([p, c]) => `<tr><td>${p}</td><td>${c}</td><td>${s.total > 0 ? Math.round((c / s.total) * 100) : 0}%</td></tr>`).join("");
    const rows = recs.map(r => `<tr>
      <td>${new Date(r.dryOffDate).toLocaleDateString("en-GB")}</td>
      <td>${r.cowEarTag || "—"}</td>
      <td>${r.protocol.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</td>
      <td>${r.antibioticTubeProduct || "—"}</td>
      <td>${r.teatSealantProduct || "—"}</td>
      <td>${r.sccAtDryOff?.toLocaleString() ?? "—"}</td>
      <td>${r.mastitisEpisodes12Months ?? "—"}</td>
      <td>${r.vetAuthorisation ? "Yes" : "<b style='color:#b91c1c'>No</b>"}</td>
      <td>${r.vetName || "—"}</td>
      <td style="font-size:9px">${r.treatmentJustification || "—"}</td>
    </tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>DCT Stewardship Report ${dctYear}</title>
<style>
  body{font-family:Arial,sans-serif;font-size:10px;color:#000;margin:0;padding:20px}
  h1{font-size:14px;margin:0 0 2px}h2{font-size:11px;margin:0 0 12px;color:#555}h3{font-size:11px;margin:12px 0 6px}
  .hdr{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:10px;margin-bottom:14px}
  .hdr-r{text-align:right;font-size:9px;color:#555;line-height:1.8}
  .kpi{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px}
  .kpi-box{border:1px solid #e5e7eb;border-radius:4px;padding:8px;text-align:center}
  .kpi-val{font-size:18px;font-weight:700;color:#111}.kpi-lbl{font-size:9px;color:#6b7280;margin-top:2px}
  table{width:100%;border-collapse:collapse;margin-bottom:14px}
  th{background:#f9fafb;font-weight:700;font-size:9px;text-transform:uppercase;letter-spacing:.05em;padding:5px 6px;border:1px solid #e5e7eb;text-align:left}
  td{padding:4px 6px;border:1px solid #e5e7eb;vertical-align:top;font-size:10px}
  tr:nth-child(even) td{background:#fafafa}
  .note{font-size:8px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}
  @media print{@page{margin:1.5cm;size:landscape}}
</style></head><body>
<div class="hdr">
  <div><h1>Dry Cow Therapy (DCT) — Antibiotic Stewardship Report</h1><h2>Red Tractor Dairy Scheme — Reporting Year: ${dctYear}</h2></div>
  <div class="hdr-r"><b>${s.total} dry-off record${s.total !== 1 ? "s" : ""}</b><br>Printed: ${printedDate}</div>
</div>
<div class="kpi">
  <div class="kpi-box"><div class="kpi-val">${s.total}</div><div class="kpi-lbl">Total dry-offs recorded</div></div>
  <div class="kpi-box"><div class="kpi-val">${s.total > 0 ? Math.round((s.selective / s.total) * 100) : 0}%</div><div class="kpi-lbl">Selective DCT (${s.selective} cows)</div></div>
  <div class="kpi-box"><div class="kpi-val">${s.total > 0 ? Math.round((s.vetAuthorised / s.total) * 100) : 0}%</div><div class="kpi-lbl">Vet-authorised (${s.vetAuthorised}/${s.total})</div></div>
  <div class="kpi-box"><div class="kpi-val">${s.avgScc != null ? s.avgScc.toLocaleString() + " k/mL" : "—"}</div><div class="kpi-lbl">Avg SCC at dry-off</div></div>
</div>
<p style="font-size:10px;margin-bottom:8px"><b>Protocol breakdown:</b> Selective DCT: ${s.selective} &nbsp;|&nbsp; Blanket DCT: ${s.blanket} &nbsp;|&nbsp; Teat sealant only: ${s.sealantOnly}</p>
${productRows ? `<h3>Antibiotic Products Used</h3><table><tr><th>Product</th><th>Cows treated</th><th>% of total</th></tr>${productRows}</table>` : ""}
<h3>All DCT Records — ${dctYear}</h3>
<table>
  <tr><th>Dry-off date</th><th>Ear Tag</th><th>Protocol</th><th>Antibiotic product</th><th>Sealant</th><th>SCC at dry-off</th><th>Mastitis eps 12m</th><th>Vet auth.</th><th>Vet</th><th>Justification</th></tr>
  ${rows || "<tr><td colspan='10'>No records for this year</td></tr>"}
</table>
<p class="note">DCT Antibiotic Stewardship Report produced by BDE Farm Trac (Barnett Davies Enterprises Ltd). This report should be reviewed annually with your prescribing vet as part of your Veterinary Health Plan. Retain for a minimum of 5 years. Printed: ${printedDate}</p>
</body></html>`;
    openPrintWindow(html);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-500">Dry Cow Therapy (DCT) — record treatment decisions at dry-off. Antibiotic stewardship requires documented justification for each cow treated.</p>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={dctListYear} onValueChange={setDctListYear}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger><SelectContent><SelectItem value="all">All years</SelectItem>{dctListYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select>
          <Button variant="outline" size="sm" onClick={generateDctReport} disabled={dctYearRecords.length === 0}>
            <FileDown className="h-3.5 w-3.5 mr-1" />Print Report
          </Button>
          <Button onClick={openAdd} size="sm"><Plus className="h-4 w-4 mr-1" />Add DCT Record</Button>
        </div>
      </div>

      {/* ── Annual Stewardship Summary ── */}
      <Card className="mb-4">
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">Annual Stewardship Summary</p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setDctYear(dctYear - 1)} className="h-6 w-6 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50"><ChevronLeft className="h-3.5 w-3.5" /></button>
              <span className="text-sm font-semibold text-gray-800 w-12 text-center">{dctYear}</span>
              <button onClick={() => setDctYear(dctYear + 1)} disabled={dctYear >= new Date().getFullYear()} className="h-6 w-6 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40"><ChevronRight className="h-3.5 w-3.5" /></button>
            </div>
          </div>
          {dctYearRecords.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-3">No DCT records for {dctYear}.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg border bg-white px-3 py-2.5 text-center">
                <p className="text-2xl font-bold text-gray-800">{dctStats.total}</p>
                <p className="text-xs text-gray-500 mt-0.5">Dry-offs recorded</p>
              </div>
              <div className={`rounded-lg border px-3 py-2.5 text-center ${dctStats.total > 0 && Math.round((dctStats.selective / dctStats.total) * 100) >= 50 ? "bg-green-50 border-green-200" : "bg-white"}`}>
                <p className={`text-2xl font-bold ${dctStats.total > 0 && Math.round((dctStats.selective / dctStats.total) * 100) >= 50 ? "text-green-700" : "text-gray-800"}`}>
                  {dctStats.total > 0 ? `${Math.round((dctStats.selective / dctStats.total) * 100)}%` : "—"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Selective DCT</p>
              </div>
              <div className={`rounded-lg border px-3 py-2.5 text-center ${dctStats.vetAuthorised < dctStats.total ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"}`}>
                <p className={`text-2xl font-bold ${dctStats.vetAuthorised < dctStats.total ? "text-amber-700" : "text-green-700"}`}>
                  {dctStats.total > 0 ? `${Math.round((dctStats.vetAuthorised / dctStats.total) * 100)}%` : "—"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Vet-authorised</p>
              </div>
              <div className="rounded-lg border bg-white px-3 py-2.5 text-center">
                <p className="text-xl font-bold text-gray-800">{dctStats.avgScc != null ? dctStats.avgScc.toLocaleString() : "—"}</p>
                <p className="text-xs text-gray-500 mt-0.5">Avg SCC at dry-off (k/mL)</p>
              </div>
            </div>
          )}
          {dctStats.topProducts.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Antibiotic products used in {dctYear}</p>
              <div className="flex flex-wrap gap-2">
                {dctStats.topProducts.map(([p, c]) => (
                  <span key={p} className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded">
                    {p} <span className="font-semibold">×{c}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View DCT Record</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Dry-Off Date</p><p className="font-medium">{formatDate(viewRecord.dryOffDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Cow Ear Tag</p><p className="font-medium">{String(viewRecord.cowEarTag ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Protocol</p><p className="font-medium capitalize">{String(viewRecord.protocol ?? "—").replace(/-/g, " ")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Antibiotic Product</p><p className="font-medium">{String(viewRecord.antibioticTubeProduct || "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Teat Sealant</p><p className="font-medium">{String(viewRecord.teatSealantProduct ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">SCC at Dry-Off</p><p className="font-medium">{viewRecord.sccAtDryOff?.toLocaleString() ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Mastitis Eps (12m)</p><p className="font-medium">{String(viewRecord.mastitisEpisodes12Months ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vet Authorisation</p><p className="font-medium">{viewRecord.vetAuthorisation ? "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Expected Calving</p><p className="font-medium">{formatDate(viewRecord.expectedCalvingDate)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Justification</p><p className="font-medium">{String(viewRecord.treatmentJustification ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{String(viewRecord.notes ?? "—")}</p></div>
              <div className="col-span-2 border-t pt-3">
                <RecordAttachments farmId={farmId} recordType="dct" recordId={viewRecord.id} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-gray-400" /> : (
        <div className="space-y-2">
          {(!filteredDctList.length) && <Card><CardContent className="py-8 text-center text-gray-400 text-sm">No DCT records yet. Record dry-off treatments for each cow at the end of lactation.</CardContent></Card>}
          {filteredDctList.map(r => (
            <Card key={r.id}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-medium text-sm">{formatDate(r.dryOffDate)}</span>
                    {r.cowEarTag && <span className="text-sm text-gray-700 font-mono">{r.cowEarTag}</span>}
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded capitalize">{r.protocol.replace(/-/g, " ")}</span>
                    {r.antibioticTubeProduct && <span className="text-xs text-gray-500">{r.antibioticTubeProduct}</span>}
                    {r.teatSealantProduct && <span className="text-xs text-gray-500">Sealant: {r.teatSealantProduct}</span>}
                    {r.sccAtDryOff && <SccBadge v={r.sccAtDryOff} />}
                    {r.mastitisEpisodes12Months !== null && r.mastitisEpisodes12Months !== undefined && <span className="text-xs text-gray-500">{r.mastitisEpisodes12Months} mastitis episodes (12m)</span>}
                    {r.vetAuthorisation && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Vet authorised</span>}
                    {r.expectedCalvingDate && <span className="text-xs text-gray-400 flex items-center gap-1"><ChevronRight className="h-3 w-3" />Expected calving {formatDate(r.expectedCalvingDate)}</span>}
                    {(dctAttachMap[r.id] ?? 0) > 0 && (
                      <span className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1">
                        <Paperclip className="w-3 h-3" />{dctAttachMap[r.id]}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewRecord(r)}><Eye className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => del.mutate(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                {r.treatmentJustification && <p className="text-xs text-gray-500 mt-1">Justification: {r.treatmentJustification}</p>}
                {r.notes && <p className="text-xs text-gray-400 mt-0.5">{r.notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent style={{ maxWidth: "62rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit DCT Record" : "Add Dry Cow Therapy Record"}</DialogTitle></DialogHeader>
          <div className="flex gap-6 py-2">
            {/* ── Left column ── */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Cow Ear Tag</Label>
                  <AnimalEarTagCombobox
                    value={form.cowEarTag || ""}
                    onSelect={handleAnimalSelect}
                    animals={animals}
                  />
                </div>
                <div><Label>Dry-Off Date *</Label><Input type="date" value={form.dryOffDate?.slice(0, 10) || ""} onChange={e => set("dryOffDate", e.target.value)} /></div>
              </div>

              {/* Stewardship hint banner */}
              {form.cowEarTag && form.cowEarTag.length >= 5 && (
                <div className="rounded-md border border-blue-100 bg-blue-50 p-2.5 flex items-center justify-between gap-2">
                  {hintLoading ? (
                    <span className="flex items-center gap-1.5 text-xs text-blue-500"><Loader2 className="h-3 w-3 animate-spin" />Looking up animal history…</span>
                  ) : hasHintData ? (
                    <>
                      <div className="text-xs text-blue-700">
                        <span className="font-semibold">From records:</span>{" "}
                        {hint!.mastitisCount12m} mastitis episode{hint!.mastitisCount12m !== 1 ? "s" : ""} in 12 months
                        {hint!.recentMastitisScc ? ` · most recent SCC at onset ${hint!.recentMastitisScc.toLocaleString()} k/mL` : ""}
                      </div>
                      <Button size="sm" variant="outline" className="h-6 text-xs px-2 border-blue-200 text-blue-700 hover:bg-blue-100" onClick={applyHint}>
                        <Sparkles className="h-3 w-3 mr-1" />Auto-fill
                      </Button>
                    </>
                  ) : hint ? (
                    <span className="text-xs text-blue-400">No mastitis records found for this ear tag in the last 12 months.</span>
                  ) : null}
                </div>
              )}

              <div>
                <Label>DCT Protocol *</Label>
                <Select value={form.protocol || "selective"} onValueChange={v => set("protocol", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PROTOCOLS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {form.protocol !== "teat-sealant-only" && (
                <div className="rounded-md border p-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Antibiotic Tube</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <Label>Product Name</Label>
                      <ProductCombobox
                        value={form.antibioticTubeProduct || ""}
                        onChange={handleAntibioticProduct}
                        options={INTRAMAMMARY_ANTIBIOTICS}
                        placeholder="Search VMD intramammary products…"
                      />
                      {form.antibioticTubeProduct && DCT_WITHDRAWAL[form.antibioticTubeProduct] && (
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          Standard withdrawal pre-filled — verify against the product datasheet
                        </p>
                      )}
                    </div>
                    <div><Label>Batch Number</Label><Input value={form.antibioticTubeBatch || ""} onChange={e => set("antibioticTubeBatch", e.target.value)} /></div>
                    <div></div>
                    <div><Label>Milk Withdrawal (days)</Label><Input type="number" value={form.antibioticTubeWithdrawalMilkDays ?? ""} onChange={e => set("antibioticTubeWithdrawalMilkDays", e.target.value ? parseInt(e.target.value) : null)} /></div>
                    <div><Label>Meat Withdrawal (days)</Label><Input type="number" value={form.antibioticTubeWithdrawalMeatDays ?? ""} onChange={e => set("antibioticTubeWithdrawalMeatDays", e.target.value ? parseInt(e.target.value) : null)} /></div>
                  </div>
                </div>
              )}

              {form.protocol?.includes("sealant") && (
                <div className="rounded-md border p-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Teat Sealant</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <Label>Product</Label>
                      <ProductCombobox
                        value={form.teatSealantProduct || ""}
                        onChange={v => set("teatSealantProduct", v)}
                        options={INTRAMAMMARY_SEALANTS}
                        placeholder="Search sealant products…"
                      />
                    </div>
                    <div><Label>Batch Number</Label><Input value={form.teatSealantBatch || ""} onChange={e => set("teatSealantBatch", e.target.value)} /></div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Divider ── */}
            <div className="w-px bg-gray-200 self-stretch" />

            {/* ── Right column ── */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="rounded-md border p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Antibiotic Stewardship</p>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>SCC at Dry-Off (k/mL)</Label><Input type="number" value={form.sccAtDryOff ?? ""} onChange={e => set("sccAtDryOff", e.target.value ? parseInt(e.target.value) : null)} /></div>
                  <div><Label>Mastitis Episodes (12 mo)</Label><Input type="number" value={form.mastitisEpisodes12Months ?? ""} onChange={e => set("mastitisEpisodes12Months", e.target.value ? parseInt(e.target.value) : null)} /></div>
                </div>
                <div><Label>Treatment Justification</Label><Textarea value={form.treatmentJustification || ""} onChange={e => set("treatmentJustification", e.target.value)} placeholder="e.g. SCC consistently above 200k, 2 mastitis episodes in last lactation" rows={2} /></div>
              </div>

              <div className="rounded-md border p-3 space-y-2.5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Vet &amp; Administration</p>

                {/* POM-V authorisation — required when antibiotics involved */}
                {needsVetAuth && (
                  <div className={`rounded-md border p-2.5 ${form.vetAuthorisation ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id="vetauth"
                        checked={!!form.vetAuthorisation}
                        onChange={e => set("vetAuthorisation", e.target.checked)}
                        className="rounded mt-0.5 accent-green-600 h-4 w-4 shrink-0"
                      />
                      <div>
                        <Label htmlFor="vetauth" className={`font-semibold ${form.vetAuthorisation ? "text-green-800" : "text-red-800"}`}>
                          Written vet prescription / authorisation obtained *
                        </Label>
                        <p className={`text-xs mt-0.5 ${form.vetAuthorisation ? "text-green-700" : "text-red-700"}`}>
                          {form.vetAuthorisation
                            ? "Confirmed — this product is covered by a valid vet prescription."
                            : "Required by law: intramammary antibiotic tubes are POM-V medicines. A vet must examine the herd and issue a written prescription before the product can legally be obtained or used."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Teat sealant only — authorisation not required */}
                {!needsVetAuth && (
                  <p className="text-xs text-gray-400">No antibiotic used — vet prescription not required for internal teat sealants.</p>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Prescribing Vet</Label>
                    <NameCombobox
                      value={form.vetName || ""}
                      onChange={v => set("vetName", v)}
                      names={vetNames}
                      placeholder="Select or type vet name…"
                    />
                  </div>
                  <div>
                    <Label>Administered By</Label>
                    <NameCombobox
                      value={form.administeredBy || ""}
                      onChange={v => set("administeredBy", v)}
                      names={staffNames}
                      placeholder="Select or type staff name…"
                    />
                  </div>
                </div>

                <div>
                  <Label>Expected Calving Date</Label>
                  <Input type="date" value={form.expectedCalvingDate || ""} onChange={e => set("expectedCalvingDate", e.target.value)} />
                  <p className="text-xs text-gray-400 mt-1">
                    Used to determine withdrawal compliance — milk withdrawal for antibiotic dry cow tubes runs from calving, not from the date of administration.
                  </p>
                </div>

                {needsVetAuth && (
                  <div>
                    <Label>Estimated Prescription Fee (£)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 45.00"
                      value={form.estimatedPrescriptionFee ?? ""}
                      onChange={e => set("estimatedPrescriptionFee", e.target.value)}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Optional — this will appear against the vet visit in the Vet Ledger so finance can match it when the invoice arrives.
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-md border border-amber-100 bg-amber-50 p-2.5">
                <p className="text-xs text-amber-700 font-medium mb-0.5">Medicines Register</p>
                <p className="text-xs text-amber-600">When saved, any antibiotic tube product will be automatically added to the farm's Medicine Records for this animal.</p>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={3} />
              </div>
            </div>
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending || !canSave} title={!form.dryOffDate ? "Dry-off date is required" : needsVetAuth && !form.vetAuthorisation ? "Written vet prescription must be confirmed before saving" : undefined}>
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {editing ? "Save Changes" : "Add DCT Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

