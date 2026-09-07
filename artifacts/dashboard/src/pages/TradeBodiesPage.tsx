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
import { shouldShowMissingLevyWarning } from "./trade-body-levy-warning";
import {
  Plus, Pencil, Trash2, Printer, PoundSterling, Info, AlertTriangle, Download, Building2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BodyCategory {
  key: string;
  unit: string;
  ratePence: number | null;
  note?: string;
}

interface BodyConfig {
  body: string;
  label: string;
  shortLabel: string;
  type: "membership" | "levy" | "statutory" | "assurance";
  description: string;
  website: string;
  rateYear: string;
  disclaimer: string;
  quarterly: boolean;
  categories: BodyCategory[];
}

interface TbRecord {
  id: number;
  body: string;
  period_year: number;
  period_quarter: number | null;
  category: string;
  quantity: string;
  unit: string;
  custom_rate_pence: string | null;
  notes: string | null;
  created_at: string;
}

interface Registration {
  id: number;
  body: string;
  membership_number: string | null;
  registered_since: string | null;
  notes: string | null;
}

interface SummaryEnriched {
  body: string;
  bodyLabel: string;
  category: string;
  unit: string;
  totalQuantity: number;
  ratePence: number;
  totalPence: number;
  usedIndicativeRate: boolean;
}

interface SummaryData {
  year: number;
  rows: SummaryEnriched[];
  totalsPerBody: Record<string, number>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => THIS_YEAR - i);
const QUARTERS = [1, 2, 3, 4];

const TYPE_BADGE: Record<string, { label: string; className: string }> = {
  levy:      { label: "Statutory Levy", className: "bg-red-100 text-red-800" },
  statutory: { label: "Statutory Scheme", className: "bg-amber-100 text-amber-800" },
  membership: { label: "Voluntary Membership", className: "bg-blue-100 text-blue-800" },
  assurance: { label: "Assurance Scheme", className: "bg-green-100 text-green-800" },
};

function formatPounds(pence: number): string {
  return (pence / 100).toLocaleString("en-GB", { style: "currency", currency: "GBP" });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TradeBodiesPage() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [activeTab, setActiveTab] = useState<"overview" | "records" | "memberships" | "print">("overview");
  const [year, setYear] = useState(THIS_YEAR);
  const [filterBody, setFilterBody] = useState<string>("");
  const [filterQuarter, setFilterQuarter] = useState<string>("");
  const [printBody, setPrintBody] = useState<string>("");
  const [printYear, setPrintYear] = useState(THIS_YEAR);

  // Record dialog state
  const [showRecordDialog, setShowRecordDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TbRecord | null>(null);
  const [recBody, setRecBody] = useState("");
  const [recYear, setRecYear] = useState(String(THIS_YEAR));
  const [recQuarter, setRecQuarter] = useState("");
  const [recCategory, setRecCategory] = useState("");
  const [recQuantity, setRecQuantity] = useState("");
  const [recCustomRate, setRecCustomRate] = useState("");
  const [recNotes, setRecNotes] = useState("");

  // Membership dialog state
  const [showMemberDialog, setShowMemberDialog] = useState(false);
  const [editingMemberBody, setEditingMemberBody] = useState<string>("");
  const [memNumber, setMemNumber] = useState("");
  const [memSince, setMemSince] = useState("");
  const [memNotes, setMemNotes] = useState("");

  // Delete dialog
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // ─── Queries ───────────────────────────────────────────────────────────────

  const bodiesQ = useQuery<{ bodies: BodyConfig[] }>({
    queryKey: ["trade-bodies-config", farmId],
    queryFn: () => fetch(apiUrl(`/farms/${farmId}/trade-levies/bodies`)).then((r) => r.json()),
    enabled: !!farmId,
  });

  const bodies: BodyConfig[] = bodiesQ.data?.bodies ?? [];

  const registrationsQ = useQuery<{ registrations: Registration[] }>({
    queryKey: ["trade-body-registrations", farmId],
    queryFn: () => fetch(apiUrl(`/farms/${farmId}/trade-levies/registrations`)).then((r) => r.json()),
    enabled: !!farmId,
  });

  const registrations = registrationsQ.data?.registrations ?? [];
  const regByBody = useMemo(
    () => Object.fromEntries(registrations.map((r) => [r.body, r])),
    [registrations],
  );

  const recordsQ = useQuery<{ records: TbRecord[] }>({
    queryKey: ["trade-body-records", farmId, filterBody, year, filterQuarter],
    queryFn: () => {
      const params = new URLSearchParams({ year: String(year) });
      if (filterBody) params.set("body", filterBody);
      if (filterQuarter) params.set("quarter", filterQuarter);
      return fetch(apiUrl(`/farms/${farmId}/trade-levies/records?${params}`)).then((r) => r.json());
    },
    enabled: !!farmId,
  });
  const records = recordsQ.data?.records ?? [];

  const summaryQ = useQuery<SummaryData>({
    queryKey: ["trade-body-summary", farmId, year],
    queryFn: () =>
      fetch(apiUrl(`/farms/${farmId}/trade-levies/summary?year=${year}`)).then((r) => r.json()),
    enabled: !!farmId && activeTab === "overview",
  });

  // ─── Derived helpers ───────────────────────────────────────────────────────

  const selectedBodyCfg = useMemo(
    () => bodies.find((b) => b.body === recBody) ?? null,
    [bodies, recBody],
  );

  const categoryOptions = useMemo(
    () => selectedBodyCfg?.categories ?? [],
    [selectedBodyCfg],
  );

  // ─── Mutations ─────────────────────────────────────────────────────────────

  const saveRecordMut = useMutation({
    mutationFn: async () => {
      const payload = {
        body: recBody,
        period_year: Number(recYear),
        period_quarter: recQuarter ? Number(recQuarter) : null,
        category: recCategory,
        quantity: Number(recQuantity),
        unit: categoryOptions.find((c) => c.key === recCategory)?.unit ?? "",
        custom_rate_pence: recCustomRate !== "" ? Number(recCustomRate) : null,
        notes: recNotes || null,
      };
      const url = editingRecord
        ? apiUrl(`/farms/${farmId}/trade-levies/records/${editingRecord.id}`)
        : apiUrl(`/farms/${farmId}/trade-levies/records`);
      const res = await fetch(url, {
        method: editingRecord ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trade-body-records"] });
      qc.invalidateQueries({ queryKey: ["trade-body-summary"] });
      setShowRecordDialog(false);
      toast({ title: editingRecord ? "Record updated" : "Record added" });
    },
  });

  const deleteRecordMut = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(apiUrl(`/farms/${farmId}/trade-levies/records/${id}`), { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trade-body-records"] });
      qc.invalidateQueries({ queryKey: ["trade-body-summary"] });
      setDeleteId(null);
      toast({ title: "Record deleted" });
    },
  });

  const saveMemberMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        apiUrl(`/farms/${farmId}/trade-levies/registrations/${editingMemberBody}`),
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            membership_number: memNumber || null,
            registered_since: memSince || null,
            notes: memNotes || null,
          }),
        },
      );
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trade-body-registrations"] });
      setShowMemberDialog(false);
      toast({ title: "Membership details saved" });
    },
  });

  // ─── Dialog openers ────────────────────────────────────────────────────────

  function openAddRecord() {
    setEditingRecord(null);
    setRecBody(filterBody || "");
    setRecYear(String(year));
    setRecQuarter("");
    setRecCategory("");
    setRecQuantity("");
    setRecCustomRate("");
    setRecNotes("");
    saveRecordMut.reset();
    setShowRecordDialog(true);
  }

  function openEditRecord(r: TbRecord) {
    setEditingRecord(r);
    setRecBody(r.body);
    setRecYear(String(r.period_year));
    setRecQuarter(r.period_quarter ? String(r.period_quarter) : "");
    setRecCategory(r.category);
    setRecQuantity(r.quantity);
    setRecCustomRate(r.custom_rate_pence ?? "");
    setRecNotes(r.notes ?? "");
    saveRecordMut.reset();
    setShowRecordDialog(true);
  }

  function openMemberDialog(body: string) {
    const reg = regByBody[body];
    setEditingMemberBody(body);
    setMemNumber(reg?.membership_number ?? "");
    setMemSince(reg?.registered_since ?? "");
    setMemNotes(reg?.notes ?? "");
    saveMemberMut.reset();
    setShowMemberDialog(true);
  }

  // ─── CSV export ────────────────────────────────────────────────────────────

  function exportCsv() {
    const header = ["Body", "Year", "Quarter", "Category", "Quantity", "Unit", "Rate (£)", "Amount (£)", "Notes"];
    const rows: unknown[][] = records.map((r) => {
      const cfg = bodies.find((b) => b.body === r.body);
      const catCfg = cfg?.categories.find((c) => c.key === r.category);
      const rate = r.custom_rate_pence !== null
        ? Number(r.custom_rate_pence) / 100
        : (catCfg?.ratePence ?? 0) / 100;
      const amount = Number(r.quantity) * rate;
      return [
        cfg?.shortLabel ?? r.body,
        r.period_year,
        r.period_quarter ? `Q${r.period_quarter}` : "Annual",
        r.category,
        r.quantity,
        r.unit,
        rate.toFixed(4),
        amount.toFixed(2),
        r.notes ?? "",
      ];
    });
    downloadCsvFile(`trade-body-records-${year}.csv`, [header, ...rows]);
  }

  // ─── Tabs ──────────────────────────────────────────────────────────────────

  const tabs = [
    { key: "overview",    label: "Overview" },
    { key: "records",     label: "Records" },
    { key: "memberships", label: "Memberships" },
    { key: "print",       label: "Print Return" },
  ] as const;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="w-6 h-6 text-primary" />
              Trade Body Levies &amp; Subscriptions
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track statutory levies, membership contributions, and assurance scheme fees for all trade bodies.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm">Year</Label>
            <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b flex gap-0">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === t.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Body summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {bodies.map((cfg) => {
                const total = summaryQ.data?.totalsPerBody?.[cfg.body] ?? 0;
                const hasNoRecordsThisYear = shouldShowMissingLevyWarning(
                  cfg,
                  summaryQ.data,
                  year,
                  THIS_YEAR,
                );
                const reg = regByBody[cfg.body];
                const badge = TYPE_BADGE[cfg.type];
                return (
                  <div key={cfg.body} className="border rounded-lg p-4 space-y-2 bg-card">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm">{cfg.shortLabel}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{cfg.description.split(".")[0]}.</p>
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                    {hasNoRecordsThisYear && (
                      <div className="flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-2 text-xs text-amber-800">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span>No records this year — is this correct?</span>
                      </div>
                    )}
                    <div className="flex items-end justify-between pt-1">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {reg?.membership_number
                            ? `Ref: ${reg.membership_number}`
                            : <span className="text-amber-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> No membership number</span>
                          }
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{year} total</p>
                        <p className="text-lg font-bold text-primary">{formatPounds(total)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                        onClick={() => { setFilterBody(cfg.body); setActiveTab("records"); }}
                      >
                        View Records
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                        onClick={() => openMemberDialog(cfg.body)}
                      >
                        Edit Membership
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detailed summary table */}
            {summaryQ.data && summaryQ.data.rows.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold mb-3">{year} — Detailed Breakdown</h2>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">Body</th>
                        <th className="text-left p-3 font-medium">Category</th>
                        <th className="text-right p-3 font-medium">Total Qty</th>
                        <th className="text-left p-3 font-medium">Unit</th>
                        <th className="text-right p-3 font-medium">Rate</th>
                        <th className="text-right p-3 font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summaryQ.data.rows.map((row, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-3 font-medium">{row.bodyLabel}</td>
                          <td className="p-3">{row.category}</td>
                          <td className="p-3 text-right">{row.totalQuantity.toLocaleString("en-GB", { maximumFractionDigits: 3 })}</td>
                          <td className="p-3">{row.unit}</td>
                          <td className="p-3 text-right text-muted-foreground">
                            {formatPounds(row.ratePence)}
                            {row.usedIndicativeRate && <span className="text-[10px] text-amber-600 ml-1">(indicative)</span>}
                          </td>
                          <td className="p-3 text-right font-medium">{formatPounds(row.totalPence)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t bg-muted/30">
                      <tr>
                        <td colSpan={5} className="p-3 font-semibold">Grand Total {year}</td>
                        <td className="p-3 text-right font-bold text-primary">
                          {formatPounds(Object.values(summaryQ.data.totalsPerBody).reduce((a, b) => a + b, 0))}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                  Rows marked &quot;indicative&quot; use published rate schedules where no custom rate was entered. Always verify figures with each body directly.
                </p>
              </div>
            )}

            {!summaryQ.isLoading && (!summaryQ.data || summaryQ.data.rows.length === 0) && (
              <div className="border rounded-lg p-8 text-center text-muted-foreground">
                <PoundSterling className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No records entered for {year}.</p>
                <p className="text-xs mt-1">Switch to the Records tab to start adding levy or subscription entries.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Records Tab ── */}
        {activeTab === "records" && (
          <div className="space-y-4">
            {/* Filters + actions */}
            <div className="flex flex-wrap items-center gap-3">
              <Select value={filterBody} onValueChange={setFilterBody}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All bodies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All bodies</SelectItem>
                  {bodies.map((b) => (
                    <SelectItem key={b.body} value={b.body}>{b.shortLabel}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterQuarter} onValueChange={setFilterQuarter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="All periods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All periods</SelectItem>
                  {QUARTERS.map((q) => (
                    <SelectItem key={q} value={String(q)}>Q{q}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="ml-auto flex gap-2">
                <Button variant="outline" size="sm" onClick={exportCsv} disabled={records.length === 0}>
                  <Download className="w-4 h-4 mr-1" /> Export CSV
                </Button>
                <Button size="sm" onClick={openAddRecord}>
                  <Plus className="w-4 h-4 mr-1" /> Add Record
                </Button>
              </div>
            </div>

            {/* Records table */}
            {records.length === 0 ? (
              <div className="border rounded-lg p-8 text-center text-muted-foreground">
                <PoundSterling className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No records match the selected filters.</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Body</th>
                      <th className="text-left p-3 font-medium">Period</th>
                      <th className="text-left p-3 font-medium">Category</th>
                      <th className="text-right p-3 font-medium">Quantity</th>
                      <th className="text-left p-3 font-medium">Unit</th>
                      <th className="text-right p-3 font-medium">Rate</th>
                      <th className="text-right p-3 font-medium">Amount</th>
                      <th className="p-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r) => {
                      const cfg = bodies.find((b) => b.body === r.body);
                      const catCfg = cfg?.categories.find((c) => c.key === r.category);
                      const rate = r.custom_rate_pence !== null
                        ? Number(r.custom_rate_pence)
                        : (catCfg?.ratePence ?? 0);
                      const amount = Number(r.quantity) * rate;
                      const isIndicative = r.custom_rate_pence === null && catCfg?.ratePence !== null;
                      return (
                        <tr key={r.id} className="border-t hover:bg-muted/20">
                          <td className="p-3 font-medium">{cfg?.shortLabel ?? r.body}</td>
                          <td className="p-3 text-muted-foreground">
                            {r.period_year}
                            {r.period_quarter ? ` Q${r.period_quarter}` : " (Annual)"}
                          </td>
                          <td className="p-3">{r.category}</td>
                          <td className="p-3 text-right">
                            {Number(r.quantity).toLocaleString("en-GB", { maximumFractionDigits: 3 })}
                          </td>
                          <td className="p-3">{r.unit}</td>
                          <td className="p-3 text-right text-muted-foreground">
                            {formatPounds(rate)}
                            {isIndicative && <span className="text-[10px] text-amber-600 ml-1">ind.</span>}
                          </td>
                          <td className="p-3 text-right font-medium">{formatPounds(amount)}</td>
                          <td className="p-3">
                            <div className="flex gap-1 justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => openEditRecord(r)}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={() => setDeleteId(r.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="border-t bg-muted/30">
                    <tr>
                      <td colSpan={6} className="p-3 font-semibold">Total shown</td>
                      <td className="p-3 text-right font-bold text-primary">
                        {formatPounds(
                          records.reduce((sum, r) => {
                            const cfg = bodies.find((b) => b.body === r.body);
                            const catCfg = cfg?.categories.find((c) => c.key === r.category);
                            const rate = r.custom_rate_pence !== null
                              ? Number(r.custom_rate_pence)
                              : (catCfg?.ratePence ?? 0);
                            return sum + Number(r.quantity) * rate;
                          }, 0),
                        )}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Memberships Tab ── */}
        {activeTab === "memberships" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Record your membership or registration number for each trade body. These details appear on printed returns.
            </p>
            <div className="space-y-3">
              {bodies.map((cfg) => {
                const reg = regByBody[cfg.body];
                const badge = TYPE_BADGE[cfg.type];
                return (
                  <div key={cfg.body} className="border rounded-lg p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm">{cfg.label}</p>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${badge.className}`}>
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{cfg.website}</p>
                      {reg?.membership_number && (
                        <p className="text-xs mt-1">
                          <span className="text-muted-foreground">Membership No: </span>
                          <span className="font-medium">{reg.membership_number}</span>
                        </p>
                      )}
                      {reg?.registered_since && (
                        <p className="text-xs text-muted-foreground">
                          Member since {new Date(reg.registered_since).toLocaleDateString("en-GB")}
                        </p>
                      )}
                      {!reg?.membership_number && (
                        <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                          <AlertTriangle className="w-3 h-3" />
                          No membership number recorded
                        </p>
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => openMemberDialog(cfg.body)}>
                      <Pencil className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Print Return Tab ── */}
        {activeTab === "print" && (
          <div className="space-y-6 max-w-lg">
            <p className="text-sm text-muted-foreground">
              Generate a printable levy or subscription return for any trade body and year.
            </p>
            <div className="space-y-4 border rounded-lg p-5">
              <div className="space-y-2">
                <Label>Trade Body</Label>
                <Select value={printBody} onValueChange={setPrintBody}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select body…" />
                  </SelectTrigger>
                  <SelectContent>
                    {bodies.map((b) => (
                      <SelectItem key={b.body} value={b.body}>{b.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Select value={String(printYear)} onValueChange={(v) => setPrintYear(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map((y) => (
                      <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {printBody && bodies.find((b) => b.body === printBody) && (
                <div className="bg-muted/40 rounded p-3 text-xs text-muted-foreground flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>{bodies.find((b) => b.body === printBody)?.disclaimer}</span>
                </div>
              )}
              <Button
                disabled={!printBody}
                onClick={() => {
                  window.open(
                    apiUrl(`/farms/${farmId}/trade-levies/return.html?body=${printBody}&year=${printYear}`),
                    "_blank",
                  );
                }}
              >
                <Printer className="w-4 h-4 mr-2" />
                Open Print Return
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Record Dialog ── */}
      <Dialog
        open={showRecordDialog}
        onOpenChange={(open) => {
          if (!open) { setShowRecordDialog(false); saveRecordMut.reset(); }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRecord ? "Edit Record" : "Add Record"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            {/* Body */}
            <div className="space-y-1">
              <Label>Trade Body</Label>
              <Select value={recBody} onValueChange={(v) => { setRecBody(v); setRecCategory(""); setRecCustomRate(""); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select body…" />
                </SelectTrigger>
                <SelectContent>
                  {bodies.map((b) => (
                    <SelectItem key={b.body} value={b.body}>{b.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Year */}
              <div className="space-y-1">
                <Label>Year</Label>
                <Select value={recYear} onValueChange={setRecYear}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {YEARS.map((y) => (
                      <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Quarter */}
              <div className="space-y-1">
                <Label>Quarter <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Select value={recQuarter} onValueChange={setRecQuarter}>
                  <SelectTrigger><SelectValue placeholder="Annual" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Annual</SelectItem>
                    {QUARTERS.map((q) => (
                      <SelectItem key={q} value={String(q)}>Q{q}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1">
              <Label>Category</Label>
              {categoryOptions.length > 0 ? (
                <Select value={recCategory} onValueChange={(v) => { setRecCategory(v); setRecCustomRate(""); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category…" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((c) => (
                      <SelectItem key={c.key} value={c.key}>{c.key}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={recCategory}
                  onChange={(e) => setRecCategory(e.target.value)}
                  placeholder="Select a body first"
                  disabled={!recBody}
                />
              )}
            </div>

            {/* Category note */}
            {recCategory && categoryOptions.find((c) => c.key === recCategory)?.note && (
              <div className="bg-muted/40 rounded p-3 text-xs text-muted-foreground flex items-start gap-2">
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{categoryOptions.find((c) => c.key === recCategory)?.note}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {/* Quantity */}
              <div className="space-y-1">
                <Label>
                  Quantity
                  {recCategory && categoryOptions.find((c) => c.key === recCategory) && (
                    <span className="text-muted-foreground text-xs ml-1">
                      ({categoryOptions.find((c) => c.key === recCategory)?.unit})
                    </span>
                  )}
                </Label>
                <Input
                  type="number"
                  min={0}
                  step="any"
                  value={recQuantity}
                  onChange={(e) => setRecQuantity(e.target.value)}
                  placeholder="0"
                />
              </div>
              {/* Custom Rate */}
              <div className="space-y-1">
                <Label>
                  {(() => {
                    const catCfg = categoryOptions.find((c) => c.key === recCategory);
                    return catCfg?.ratePence !== null && catCfg?.ratePence !== undefined
                      ? "Custom Rate (p) — override"
                      : "Rate (pence) — required";
                  })()}
                </Label>
                <Input
                  type="number"
                  min={0}
                  step="any"
                  value={recCustomRate}
                  onChange={(e) => setRecCustomRate(e.target.value)}
                  placeholder={(() => {
                    const catCfg = categoryOptions.find((c) => c.key === recCategory);
                    return catCfg?.ratePence !== null && catCfg?.ratePence !== undefined
                      ? `${catCfg.ratePence} (indicative)`
                      : "Enter rate in pence";
                  })()}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <Label>Notes <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Textarea
                value={recNotes}
                onChange={(e) => setRecNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Quarter 1 wheat levy, membership renewal…"
              />
            </div>

            <DialogMutationError mutation={saveRecordMut} />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setShowRecordDialog(false); saveRecordMut.reset(); }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => saveRecordMut.mutate()}
              disabled={saveRecordMut.isPending || !recBody || !recCategory || !recQuantity}
            >
              {saveRecordMut.isPending ? "Saving…" : editingRecord ? "Save Changes" : "Add Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Membership Dialog ── */}
      <Dialog
        open={showMemberDialog}
        onOpenChange={(open) => {
          if (!open) { setShowMemberDialog(false); saveMemberMut.reset(); }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Membership Details — {bodies.find((b) => b.body === editingMemberBody)?.shortLabel}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1">
              <Label>Membership / Reference Number</Label>
              <Input
                value={memNumber}
                onChange={(e) => setMemNumber(e.target.value)}
                placeholder="e.g. NFU12345, BW-001234…"
              />
            </div>
            <div className="space-y-1">
              <Label>Member / Registered Since</Label>
              <Input
                type="date"
                value={memSince}
                onChange={(e) => setMemSince(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Notes <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Textarea
                value={memNotes}
                onChange={(e) => setMemNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Renewal due April, contact details…"
              />
            </div>
            {editingMemberBody && bodies.find((b) => b.body === editingMemberBody) && (
              <div className="bg-muted/40 rounded p-3 text-xs text-muted-foreground flex items-start gap-2">
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{bodies.find((b) => b.body === editingMemberBody)?.disclaimer}</span>
              </div>
            )}
            <DialogMutationError mutation={saveMemberMut} />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setShowMemberDialog(false); saveMemberMut.reset(); }}
            >
              Cancel
            </Button>
            <Button onClick={() => saveMemberMut.mutate()} disabled={saveMemberMut.isPending}>
              {saveMemberMut.isPending ? "Saving…" : "Save Details"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ── */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this record?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
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
    </AppLayout>
  );
}
