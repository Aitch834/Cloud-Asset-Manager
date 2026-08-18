import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";
import { apiUrl } from "@/lib/api";
import { downloadCsvFile } from "@/lib/csv";
import {
  Plus, Pencil, Trash2, Printer, PoundSterling, Info, AlertTriangle, Download,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LevyRate {
  commodity: string;
  unit: string;
  ratePence: number;
  note?: string;
}

interface SummaryRow {
  sector: string;
  commodity: string;
  unit: string;
  totalQuantity: number;
  ratePence: number;
  levyPence: number;
}

interface LevyRecord {
  id: number;
  sector: string;
  period_year: number;
  period_quarter: number;
  commodity: string;
  quantity: string;
  unit: string;
  custom_rate_pence: string | null;
  notes: string | null;
  created_at: string;
}

interface Registration {
  id: number;
  sector: string;
  membership_number: string | null;
  registered_since: string | null;
  notes: string | null;
}

interface RatesData {
  rates: Record<string, LevyRate[]>;
  sectorLabels: Record<string, string>;
  rateYear: string;
  disclaimer: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SECTORS = [
  { key: "cereals",      label: "Cereals & Oilseeds" },
  { key: "beef_lamb",    label: "Beef & Lamb" },
  { key: "dairy",        label: "Dairy" },
  { key: "pork",         label: "Pork" },
  { key: "horticulture", label: "Horticulture" },
  { key: "potatoes",     label: "Potatoes" },
] as const;

const QUARTERS = [
  { value: "1", label: "Q1 (Jan–Mar)" },
  { value: "2", label: "Q2 (Apr–Jun)" },
  { value: "3", label: "Q3 (Jul–Sep)" },
  { value: "4", label: "Q4 (Oct–Dec)" },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i);

type Tab = "overview" | "records" | "registrations" | "print";

// ─── Formatting helpers ───────────────────────────────────────────────────────

const fmt = (pence: number) => `£${(pence / 100).toFixed(2)}`;
const fmtQty = (q: number | string, unit: string) => {
  const n = typeof q === "string" ? parseFloat(q) : q;
  const digits = unit === "head" ? 0 : 3;
  return `${n.toFixed(digits)} ${unit}`;
};
const shortUnit = (unit: string) =>
  unit.replace("thousand ", "k ").replace("£1,000 sales value", "£k sales");

const blankForm = () => ({
  sector: "cereals",
  period_year: CURRENT_YEAR,
  period_quarter: 1,
  commodity: "",
  quantity: "",
  unit: "",
  custom_rate_pence: "",
  notes: "",
});

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AhdbLevyPage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [tab, setTab] = useState<Tab>("overview");

  // Overview
  const [overviewYear, setOverviewYear] = useState(CURRENT_YEAR);

  // Records filters
  const [recYear, setRecYear] = useState(CURRENT_YEAR);
  const [recQuarter, setRecQuarter] = useState("");
  const [recSector, setRecSector] = useState("");

  // Record add/edit dialog
  const [recOpen, setRecOpen] = useState(false);
  const [recForm, setRecForm] = useState(blankForm());
  const [editRecordId, setEditRecordId] = useState<number | null>(null);

  // Delete confirm
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Registration edit
  const [regOpen, setRegOpen] = useState(false);
  const [regSector, setRegSector] = useState("");
  const [regForm, setRegForm] = useState({ membership_number: "", registered_since: "", notes: "" });

  // Print return
  const [printYear, setPrintYear] = useState(CURRENT_YEAR);
  const [printQuarter, setPrintQuarter] = useState("");

  // ── Queries ──────────────────────────────────────────────────────────────────

  const ratesQ = useQuery<RatesData>({
    queryKey: ["ahdb-rates", farmId],
    enabled: !!farmId,
    staleTime: 60 * 60 * 1000,
    queryFn: async () => {
      const res = await fetch(apiUrl(`/api/farms/${farmId}/ahdb/rates`));
      if (!res.ok) throw new Error("Failed to load levy rates");
      return res.json() as Promise<RatesData>;
    },
  });

  const summaryQ = useQuery<{ summary: SummaryRow[]; totalLevyPence: number; farmName: string }>({
    queryKey: ["ahdb-summary", farmId, overviewYear],
    enabled: !!farmId,
    queryFn: async () => {
      const res = await fetch(apiUrl(`/api/farms/${farmId}/ahdb/summary?year=${overviewYear}`));
      if (!res.ok) throw new Error("Failed to load summary");
      return res.json();
    },
  });

  const recordsQ = useQuery<{ records: LevyRecord[] }>({
    queryKey: ["ahdb-records", farmId, recYear, recQuarter, recSector],
    enabled: !!farmId,
    queryFn: async () => {
      const p = new URLSearchParams({ year: String(recYear) });
      if (recQuarter) p.set("quarter", recQuarter);
      if (recSector)  p.set("sector",  recSector);
      const res = await fetch(apiUrl(`/api/farms/${farmId}/ahdb/records?${p}`));
      if (!res.ok) throw new Error("Failed to load records");
      return res.json();
    },
  });

  const regsQ = useQuery<{ registrations: Registration[] }>({
    queryKey: ["ahdb-registrations", farmId],
    enabled: !!farmId,
    queryFn: async () => {
      const res = await fetch(apiUrl(`/api/farms/${farmId}/ahdb/registrations`));
      if (!res.ok) throw new Error("Failed to load registrations");
      return res.json();
    },
  });

  // ── Mutations ────────────────────────────────────────────────────────────────

  const saveRecordMut = useMutation({
    mutationFn: async (body: typeof recForm) => {
      const url = editRecordId
        ? apiUrl(`/api/farms/${farmId}/ahdb/records/${editRecordId}`)
        : apiUrl(`/api/farms/${farmId}/ahdb/records`);
      const res = await fetch(url, {
        method: editRecordId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sector: body.sector,
          periodYear: body.period_year,
          periodQuarter: body.period_quarter,
          commodity: body.commodity,
          quantity: parseFloat(body.quantity),
          unit: body.unit,
          customRatePence: body.custom_rate_pence ? parseFloat(body.custom_rate_pence) : null,
          notes: body.notes || null,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to save record");
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ahdb-records", farmId] });
      qc.invalidateQueries({ queryKey: ["ahdb-summary", farmId] });
      toast({ title: editRecordId ? "Record updated" : "Record added" });
      setRecOpen(false);
    },
  });

  const deleteRecordMut = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(apiUrl(`/api/farms/${farmId}/ahdb/records/${id}`), { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ahdb-records", farmId] });
      qc.invalidateQueries({ queryKey: ["ahdb-summary", farmId] });
      toast({ title: "Record deleted" });
      setDeleteId(null);
    },
    onError: (e: Error) => toast({ variant: "destructive", title: "Failed to delete", description: e.message }),
  });

  const saveRegMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(apiUrl(`/api/farms/${farmId}/ahdb/registrations/${regSector}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          membershipNumber: regForm.membership_number || null,
          registeredSince: regForm.registered_since || null,
          notes: regForm.notes || null,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ahdb-registrations", farmId] });
      toast({ title: "Registration saved" });
      setRegOpen(false);
    },
  });

  // ── Computed ─────────────────────────────────────────────────────────────────

  const summaryBySector = useMemo(() => {
    const m: Record<string, { levyPence: number; count: number }> = {};
    (summaryQ.data?.summary ?? []).forEach((r) => {
      if (!m[r.sector]) m[r.sector] = { levyPence: 0, count: 0 };
      m[r.sector].levyPence += r.levyPence;
      m[r.sector].count++;
    });
    return m;
  }, [summaryQ.data]);

  const commodityOptions = useMemo(() => {
    return (ratesQ.data?.rates[recForm.sector] ?? []).map((r) => ({
      commodity: r.commodity,
      unit: r.unit,
      note: r.note,
    }));
  }, [ratesQ.data, recForm.sector]);

  const regMap = useMemo(() => {
    const m: Record<string, Registration> = {};
    (regsQ.data?.registrations ?? []).forEach((r) => { m[r.sector] = r; });
    return m;
  }, [regsQ.data]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const openAddRecord = () => {
    setEditRecordId(null);
    setRecForm(blankForm());
    saveRecordMut.reset();
    setRecOpen(true);
  };

  const openEditRecord = (r: LevyRecord) => {
    setEditRecordId(r.id);
    setRecForm({
      sector: r.sector,
      period_year: r.period_year,
      period_quarter: r.period_quarter,
      commodity: r.commodity,
      quantity: parseFloat(r.quantity).toString(),
      unit: r.unit,
      custom_rate_pence: r.custom_rate_pence ?? "",
      notes: r.notes ?? "",
    });
    saveRecordMut.reset();
    setRecOpen(true);
  };

  const openEditReg = (sector: string) => {
    const existing = regMap[sector];
    setRegSector(sector);
    setRegForm({
      membership_number: existing?.membership_number ?? "",
      registered_since: existing?.registered_since?.slice(0, 10) ?? "",
      notes: existing?.notes ?? "",
    });
    saveRegMut.reset();
    setRegOpen(true);
  };

  const handlePrint = () => {
    const p = new URLSearchParams({ year: String(printYear) });
    if (printQuarter) p.set("quarter", printQuarter);
    const url = apiUrl(`/api/farms/${farmId}/ahdb/return.html?${p}`);
    fetch(url)
      .then((res) => res.text())
      .then((html) => {
        const win = window.open("", "_blank", "width=900,height=700");
        if (!win) {
          toast({ variant: "destructive", title: "Allow popups to print the return" });
          return;
        }
        win.document.write(html);
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); }, 600);
      })
      .catch(() => toast({ variant: "destructive", title: "Failed to generate return" }));
  };

  const handleDownloadCsv = () => {
    const records = recordsQ.data?.records ?? [];
    if (!records.length) { toast({ title: "No records to download" }); return; }
    const sectorLabels = ratesQ.data?.sectorLabels ?? {};
    const header = ["Sector", "Year", "Quarter", "Commodity", "Quantity", "Unit", "Rate (p/unit)", "Levy (£)", "Notes"];
    const rows: unknown[][] = [header];
    records.forEach((r) => {
      const ratePence = r.custom_rate_pence
        ? parseFloat(r.custom_rate_pence)
        : (ratesQ.data?.rates[r.sector]?.find((x) => x.commodity === r.commodity)?.ratePence ?? 0);
      const levyPence = Math.round(parseFloat(r.quantity) * ratePence);
      rows.push([
        sectorLabels[r.sector] ?? r.sector,
        r.period_year,
        `Q${r.period_quarter}`,
        r.commodity,
        parseFloat(r.quantity),
        r.unit,
        ratePence,
        (levyPence / 100).toFixed(2),
        r.notes ?? "",
      ]);
    });
    downloadCsvFile(`ahdb-levy-${recYear}.csv`, rows);
  };

  // ── Guard ─────────────────────────────────────────────────────────────────────

  if (!farmId) {
    return (
      <AppLayout>
        <div className="p-12 text-center text-muted-foreground">
          Select a farm to manage AHDB levy records.
        </div>
      </AppLayout>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-5">

        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <PoundSterling className="h-6 w-6 text-green-700" />
            AHDB Levy Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track levy-eligible quantities, calculate amounts owed, and generate return summaries for each AHDB sector.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="flex gap-2 items-start rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
          <span>
            Rates shown are indicative 2024/25 AHDB figures. Always verify the current rate schedule at{" "}
            <a href="https://ahdb.org.uk/levy" target="_blank" rel="noreferrer" className="underline font-medium">
              ahdb.org.uk/levy
            </a>{" "}
            before submitting official returns. Individual records support custom rate overrides.
          </span>
        </div>

        {/* Tab bar */}
        <div className="flex border-b">
          {(["overview", "records", "registrations", "print"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === t
                  ? "border-green-700 text-green-700"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "print" ? "Print Return" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════ OVERVIEW ══════════════════════════════════ */}
        {tab === "overview" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Label className="shrink-0 text-sm">Year</Label>
              <Select value={String(overviewYear)} onValueChange={(v) => setOverviewYear(Number(v))}>
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
              {summaryQ.isFetching && (
                <span className="text-xs text-muted-foreground">Loading…</span>
              )}
            </div>

            {(summaryQ.data?.summary.length ?? 0) === 0 && !summaryQ.isFetching ? (
              <div className="rounded-lg border border-dashed p-14 text-center text-sm text-muted-foreground">
                No levy records for {overviewYear}.{" "}
                <button
                  className="text-green-700 underline"
                  onClick={() => { setTab("records"); openAddRecord(); }}
                >
                  Add your first record.
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {SECTORS.map(({ key, label }) => {
                    const s = summaryBySector[key];
                    if (!s) return null;
                    return (
                      <div key={key} className="rounded-lg border bg-card p-4 space-y-1">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</div>
                        <div className="text-2xl font-bold text-green-700">{fmt(s.levyPence)}</div>
                        <div className="text-xs text-muted-foreground">
                          {s.count} commodity line{s.count !== 1 ? "s" : ""}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-end">
                  <div className="rounded-lg border-2 border-green-700 bg-green-50 px-6 py-3 text-right">
                    <div className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                      Total levy {overviewYear}
                    </div>
                    <div className="text-3xl font-bold text-green-700">
                      {fmt(summaryQ.data?.totalLevyPence ?? 0)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════ RECORDS ═══════════════════════════════════ */}
        {tab === "records" && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-end">
              <div className="space-y-1">
                <Label className="text-xs">Year</Label>
                <Select value={String(recYear)} onValueChange={(v) => setRecYear(Number(v))}>
                  <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {YEARS.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Quarter</Label>
                <Select value={recQuarter || "all"} onValueChange={(v) => setRecQuarter(v === "all" ? "" : v)}>
                  <SelectTrigger className="w-36"><SelectValue placeholder="All quarters" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All quarters</SelectItem>
                    {QUARTERS.map((q) => <SelectItem key={q.value} value={q.value}>{q.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Sector</Label>
                <Select value={recSector || "all"} onValueChange={(v) => setRecSector(v === "all" ? "" : v)}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="All sectors" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All sectors</SelectItem>
                    {SECTORS.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="ml-auto flex gap-2">
                <Button size="sm" variant="outline" onClick={handleDownloadCsv}>
                  <Download className="h-4 w-4 mr-1" /> CSV
                </Button>
                <Button size="sm" onClick={openAddRecord}>
                  <Plus className="h-4 w-4 mr-1" /> Add Record
                </Button>
              </div>
            </div>

            {/* Table */}
            {(recordsQ.data?.records.length ?? 0) === 0 && !recordsQ.isFetching ? (
              <div className="rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">
                No records match these filters.
              </div>
            ) : (
              <div className="rounded-lg border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/40">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Sector</th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Period</th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Commodity</th>
                      <th className="text-right px-3 py-2 font-medium text-muted-foreground">Quantity</th>
                      <th className="text-right px-3 py-2 font-medium text-muted-foreground">Rate</th>
                      <th className="text-right px-3 py-2 font-medium text-muted-foreground">Levy</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(recordsQ.data?.records ?? []).map((r) => {
                      const ratePence = r.custom_rate_pence
                        ? parseFloat(r.custom_rate_pence)
                        : (ratesQ.data?.rates[r.sector]?.find((x) => x.commodity === r.commodity)?.ratePence ?? 0);
                      const levyPence = Math.round(parseFloat(r.quantity) * ratePence);
                      return (
                        <tr key={r.id} className="hover:bg-muted/20">
                          <td className="px-3 py-2 whitespace-nowrap">
                            {ratesQ.data?.sectorLabels[r.sector] ?? r.sector}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                            Q{r.period_quarter} {r.period_year}
                          </td>
                          <td className="px-3 py-2">
                            {r.commodity}
                            {r.custom_rate_pence && (
                              <span className="ml-1 text-xs text-amber-600">(custom rate)</span>
                            )}
                            {r.notes && (
                              <div className="text-xs text-muted-foreground truncate max-w-[160px]">{r.notes}</div>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap">
                            {fmtQty(r.quantity, r.unit)}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums text-muted-foreground whitespace-nowrap">
                            {fmt(ratePence)}/{shortUnit(r.unit)}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums font-semibold text-green-700 whitespace-nowrap">
                            {fmt(levyPence)}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex gap-1 justify-end">
                              <Button
                                size="icon" variant="ghost" className="h-7 w-7"
                                onClick={() => openEditRecord(r)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon" variant="ghost"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => setDeleteId(r.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
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

        {/* ════════════════════════════════ REGISTRATIONS ═════════════════════════════════ */}
        {tab === "registrations" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Store your AHDB levy/membership numbers for each sector. These appear on printed return summaries.
            </p>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Sector</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">AHDB Levy Number</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Registered Since</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Notes</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {SECTORS.map(({ key, label }) => {
                    const reg = regMap[key];
                    const isDisbanded = key === "potatoes";
                    return (
                      <tr key={key} className={`hover:bg-muted/20 ${isDisbanded ? "opacity-60" : ""}`}>
                        <td className="px-4 py-3 font-medium whitespace-nowrap">
                          {label}
                          {isDisbanded && (
                            <span className="ml-2 text-xs text-muted-foreground font-normal">(levy disbanded 2022)</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {reg?.membership_number
                            ? <span className="font-mono">{reg.membership_number}</span>
                            : <span className="text-muted-foreground">—</span>}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {reg?.registered_since
                            ? new Date(reg.registered_since).toLocaleDateString("en-GB", {
                                day: "2-digit", month: "short", year: "numeric",
                              })
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
                          {reg?.notes ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Button size="sm" variant="outline" onClick={() => openEditReg(key)}>
                            <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════ PRINT RETURN ════════════════════════════════ */}
        {tab === "print" && (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">
              Generate a printable levy summary for a selected period. Use this as a management record
              or to cross-check against your official AHDB levy statement.
            </p>
            <div className="rounded-lg border bg-card p-6 space-y-4 max-w-sm">
              <div className="space-y-1">
                <Label>Year</Label>
                <Select value={String(printYear)} onValueChange={(v) => setPrintYear(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {YEARS.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Quarter <span className="text-muted-foreground text-xs">(optional — leave blank for full year)</span></Label>
                <Select value={printQuarter || "full"} onValueChange={(v) => setPrintQuarter(v === "full" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Full year" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full year</SelectItem>
                    {QUARTERS.map((q) => <SelectItem key={q.value} value={q.value}>{q.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full bg-green-700 hover:bg-green-800" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Open &amp; Print Return
              </Button>
            </div>
            <div className="flex gap-2 items-start rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 max-w-xl">
              <Info className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                The return opens in a new window. Use your browser's Print function or Save as PDF
                to keep a copy. This document is a management record only and does not constitute an
                official AHDB return submission.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Add / Edit Record Dialog ──────────────────────────────────────────── */}
      <Dialog
        open={recOpen}
        onOpenChange={(o) => {
          if (!o) { setRecOpen(false); saveRecordMut.reset(); }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editRecordId ? "Edit Levy Record" : "Add Levy Record"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Sector *</Label>
                <Select
                  value={recForm.sector}
                  onValueChange={(v) =>
                    setRecForm((f) => ({ ...f, sector: v, commodity: "", unit: "" }))
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SECTORS.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Year *</Label>
                <Select
                  value={String(recForm.period_year)}
                  onValueChange={(v) => setRecForm((f) => ({ ...f, period_year: Number(v) }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {YEARS.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Quarter *</Label>
              <Select
                value={String(recForm.period_quarter)}
                onValueChange={(v) => setRecForm((f) => ({ ...f, period_quarter: Number(v) }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {QUARTERS.map((q) => <SelectItem key={q.value} value={q.value}>{q.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Commodity *</Label>
              {commodityOptions.length > 0 ? (
                <>
                  <Select
                    value={recForm.commodity}
                    onValueChange={(v) => {
                      const opt = commodityOptions.find((o) => o.commodity === v);
                      setRecForm((f) => ({ ...f, commodity: v, unit: opt?.unit ?? f.unit }));
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Select commodity" /></SelectTrigger>
                    <SelectContent>
                      {commodityOptions.map((o) => (
                        <SelectItem key={o.commodity} value={o.commodity}>
                          {o.commodity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {commodityOptions.find((o) => o.commodity === recForm.commodity)?.note && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {commodityOptions.find((o) => o.commodity === recForm.commodity)?.note}
                    </p>
                  )}
                </>
              ) : (
                <Input
                  value={recForm.commodity}
                  onChange={(e) => setRecForm((f) => ({ ...f, commodity: e.target.value }))}
                  placeholder="Commodity name"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Quantity *</Label>
                <Input
                  type="number"
                  step="0.001"
                  min="0"
                  value={recForm.quantity}
                  onChange={(e) => setRecForm((f) => ({ ...f, quantity: e.target.value }))}
                  placeholder="0.000"
                />
              </div>
              <div className="space-y-1">
                <Label>Unit</Label>
                <Input
                  value={recForm.unit}
                  onChange={(e) => setRecForm((f) => ({ ...f, unit: e.target.value }))}
                  placeholder="tonnes / head / etc."
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>
                Custom rate (pence/unit){" "}
                <span className="text-muted-foreground text-xs">— leave blank to use AHDB default</span>
              </Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={recForm.custom_rate_pence}
                onChange={(e) => setRecForm((f) => ({ ...f, custom_rate_pence: e.target.value }))}
                placeholder="e.g. 64 for 64p/tonne"
              />
            </div>

            <div className="space-y-1">
              <Label>Notes</Label>
              <Textarea
                rows={2}
                value={recForm.notes}
                onChange={(e) => setRecForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Optional notes or source reference"
              />
            </div>

            <DialogMutationError mutation={saveRecordMut} />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setRecOpen(false); }}>
              Cancel
            </Button>
            <Button
              disabled={!recForm.commodity || !recForm.quantity || !recForm.unit || saveRecordMut.isPending}
              onClick={() => saveRecordMut.mutate(recForm)}
            >
              {saveRecordMut.isPending ? "Saving…" : editRecordId ? "Save Changes" : "Add Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ────────────────────────────────────────────────────── */}
      <AlertDialog open={deleteId !== null} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this levy record?</AlertDialogTitle>
            <AlertDialogDescription>
              This record will be permanently removed and will no longer appear in levy calculations or return summaries.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId !== null && deleteRecordMut.mutate(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Edit Registration Dialog ──────────────────────────────────────────── */}
      <Dialog
        open={regOpen}
        onOpenChange={(o) => {
          if (!o) { setRegOpen(false); saveRegMut.reset(); }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {SECTORS.find((s) => s.key === regSector)?.label ?? regSector} — AHDB Registration
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>AHDB Levy / Membership Number</Label>
              <Input
                value={regForm.membership_number}
                onChange={(e) => setRegForm((f) => ({ ...f, membership_number: e.target.value }))}
                placeholder="e.g. 123456789"
              />
            </div>
            <div className="space-y-1">
              <Label>Registered Since</Label>
              <Input
                type="date"
                value={regForm.registered_since}
                onChange={(e) => setRegForm((f) => ({ ...f, registered_since: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Notes</Label>
              <Textarea
                rows={2}
                value={regForm.notes}
                onChange={(e) => setRegForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Optional notes"
              />
            </div>
            <DialogMutationError mutation={saveRegMut} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRegOpen(false); }}>
              Cancel
            </Button>
            <Button disabled={saveRegMut.isPending} onClick={() => saveRegMut.mutate()}>
              {saveRegMut.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
