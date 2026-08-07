import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart2, Plus, Trash2, Play, Save, Download, FileText,
  ArrowLeft, ChevronRight, ChevronLeft, X, SlidersHorizontal,
  Map, ArrowLeftRight, Syringe, Droplets, FlaskConical,
  ClipboardCheck, GraduationCap, Tractor, PoundSterling, ShieldAlert,
  BarChart, LineChart, PieChart, Printer, ChevronUp, ChevronDown,
  Palette, Type, AlignLeft,
} from "lucide-react";
import { format } from "date-fns";
import {
  BarChart as RBarChart, Bar, LineChart as RLineChart, Line,
  PieChart as RPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { openPrintWindow } from "@/lib/print-report";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ColumnMeta {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "boolean";
  format?: "pence";
}

interface DatasourceMeta {
  label: string;
  description: string;
  icon: string;
  dateField: string | null;
  columns: ColumnMeta[];
  defaultColumns: string[];
}

interface ReportFilter {
  field: string;
  operator: "contains" | "eq" | "gte" | "lte";
  value: string;
}

interface ChartConfig {
  type: "bar" | "line" | "pie";
  labelField: string;
  valueField: string;
  aggregation: "count" | "sum" | "avg";
}

interface ReportStyle {
  reportTitle: string;
  subtitle: string;
  fontFamily: string;
  accentColor: string;
  fontSize: "sm" | "md" | "lg";
  footerText: string;
  orientation: "portrait" | "landscape";
}

interface ReportConfig {
  datasource: string;
  columns: string[];
  filters: ReportFilter[];
  dateFrom?: string;
  dateTo?: string;
  sortField?: string;
  sortDirection?: "asc" | "desc";
  chart?: ChartConfig;
  style?: ReportStyle;
}

interface SavedReport {
  id: number;
  name: string;
  description?: string;
  config: ReportConfig;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface RunResult {
  data: Record<string, unknown>[];
  count: number;
  columns: ColumnMeta[];
  selectedColumns: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DS_ICON: Record<string, React.ReactNode> = {
  Map: <Map className="w-5 h-5" />,
  ArrowLeftRight: <ArrowLeftRight className="w-5 h-5" />,
  Syringe: <Syringe className="w-5 h-5" />,
  Droplets: <Droplets className="w-5 h-5" />,
  FlaskConical: <FlaskConical className="w-5 h-5" />,
  ClipboardCheck: <ClipboardCheck className="w-5 h-5" />,
  GraduationCap: <GraduationCap className="w-5 h-5" />,
  Tractor: <Tractor className="w-5 h-5" />,
  PoundSterling: <PoundSterling className="w-5 h-5" />,
  ShieldAlert: <ShieldAlert className="w-5 h-5" />,
};

const CHART_COLORS = ["#4f8e4b", "#2d6a4f", "#74b49b", "#a8d5a2", "#f0a500", "#e07b39", "#c0392b", "#8e44ad"];

const ACCENT_PRESETS = [
  { label: "Forest Green", value: "#1a5c2a" },
  { label: "Deep Navy",    value: "#1a2d5c" },
  { label: "Burgundy",     value: "#6b1a2d" },
  { label: "Slate Blue",   value: "#2d4a5c" },
  { label: "Charcoal",     value: "#2d2d2d" },
  { label: "Terracotta",   value: "#7a3b1e" },
];

const FONT_OPTIONS = [
  { label: "Georgia (Serif)",      value: "Georgia, 'Times New Roman', serif" },
  { label: "Arial (Sans-serif)",   value: "Arial, Helvetica, sans-serif" },
  { label: "Trebuchet (Modern)",   value: "'Trebuchet MS', Tahoma, sans-serif" },
  { label: "Times New Roman",      value: "'Times New Roman', Times, serif" },
];

const FONT_SIZE_OPTIONS: { label: string; value: ReportStyle["fontSize"]; pt: number }[] = [
  { label: "Small",  value: "sm", pt: 9  },
  { label: "Normal", value: "md", pt: 11 },
  { label: "Large",  value: "lg", pt: 13 },
];

const DEFAULT_STYLE: ReportStyle = {
  reportTitle:  "",
  subtitle:     "",
  fontFamily:   "Georgia, 'Times New Roman', serif",
  accentColor:  "#1a5c2a",
  fontSize:     "md",
  footerText:   "",
  orientation:  "landscape",
};

const STEPS = ["Data Source", "Columns", "Filters", "Style & Preview"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCellValue(val: unknown, col: ColumnMeta): string {
  if (val == null || val === "") return "—";
  if (col.format === "pence" && typeof val === "number") {
    return `£${(val / 100).toFixed(2)}`;
  }
  if (col.type === "date") {
    try { return format(new Date(String(val)), "d MMM yyyy"); } catch { return String(val); }
  }
  if (col.type === "boolean") return val ? "Yes" : "No";
  if (col.type === "number" && typeof val === "number") {
    return Number.isInteger(val) ? val.toLocaleString() : val.toFixed(2);
  }
  return String(val);
}

function buildChartData(
  rows: Record<string, unknown>[],
  chart: ChartConfig,
): { label: string; value: number }[] {
  const grouped: Record<string, number[]> = {};
  for (const row of rows) {
    const label = String(row[chart.labelField] ?? "Unknown");
    const raw   = Number(row[chart.valueField] ?? 0);
    if (!grouped[label]) grouped[label] = [];
    grouped[label]!.push(isNaN(raw) ? 1 : raw);
  }
  return Object.entries(grouped).map(([label, vals]) => {
    let value: number;
    if (chart.aggregation === "count") value = vals.length;
    else if (chart.aggregation === "sum") value = vals.reduce((a, v) => a + v, 0);
    else value = vals.reduce((a, v) => a + v, 0) / vals.length;
    return { label, value: Math.round(value * 100) / 100 };
  }).sort((a, b) => b.value - a.value).slice(0, 20);
}

/** Lighten a hex colour toward white by a fraction (0–1) */
function lightenHex(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lr = Math.round(r + (255 - r) * amount);
  const lg = Math.round(g + (255 - g) * amount);
  const lb = Math.round(b + (255 - b) * amount);
  return `#${lr.toString(16).padStart(2, "0")}${lg.toString(16).padStart(2, "0")}${lb.toString(16).padStart(2, "0")}`;
}

function buildPrintHTML(
  rows: Record<string, unknown>[],
  selectedCols: ColumnMeta[],
  style: ReportStyle,
  config: ReportConfig,
  farmName: string,
  reportName: string,
): string {
  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const title = style.reportTitle.trim() || reportName || "Report";
  const accent = style.accentColor || "#1a5c2a";
  const accentLight = lightenHex(accent, 0.9);
  const accentMid   = lightenHex(accent, 0.6);
  const pt = FONT_SIZE_OPTIONS.find(f => f.value === style.fontSize)?.pt ?? 11;
  const pageSize = style.orientation === "portrait" ? "A4 portrait" : "A4 landscape";
  const font = style.fontFamily || "Arial, Helvetica, sans-serif";

  // Meta row: date range + filters summary
  const metaParts: string[] = [];
  if (config.dateFrom && config.dateTo) metaParts.push(`${config.dateFrom} to ${config.dateTo}`);
  else if (config.dateFrom) metaParts.push(`From ${config.dateFrom}`);
  else if (config.dateTo)   metaParts.push(`To ${config.dateTo}`);
  if (config.filters.length > 0) metaParts.push(`${config.filters.length} filter${config.filters.length !== 1 ? "s" : ""} applied`);
  const metaStr = metaParts.join("  ·  ");

  const footer = style.footerText.trim() || `${farmName ? farmName + "  ·  " : ""}BDE Farm Trac`;

  // Build table rows
  const thHtml = selectedCols.map(c =>
    `<th style="padding:4px 7px;color:#fff;font-weight:700;font-size:${Math.max(pt - 2, 7)}pt;text-align:left;white-space:nowrap;border-right:1px solid ${accentMid};">${c.label}</th>`
  ).join("");

  const tbodyHtml = rows.map((row, i) => {
    const bg = i % 2 === 1 ? `background:${accentLight};` : "";
    const tdHtml = selectedCols.map(c =>
      `<td style="padding:3px 7px;border-bottom:1px solid #e5e7eb;border-right:1px solid #f0f0f0;vertical-align:top;line-height:1.4;">${escHtml(formatCellValue(row[c.key], c))}</td>`
    ).join("");
    return `<tr style="${bg}page-break-inside:avoid;">${tdHtml}</tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escHtml(title)}${farmName ? " — " + escHtml(farmName) : ""}</title>
<style>
  @page { size: ${pageSize}; margin: 12mm 14mm 18mm 14mm; }
  *, *::before, *::after { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  body { font-family: ${font}; font-size: ${pt}pt; color: #111; margin: 0; padding: 0; background: #fff; }
  h1.rpt-title { font-size: ${pt + 10}pt; font-weight: 700; color: ${accent}; margin: 0 0 4px; line-height: 1.2; }
  .rpt-subtitle { font-size: ${pt + 1}pt; color: #444; margin: 2px 0; }
  .rpt-meta { font-size: ${Math.max(pt - 2, 7)}pt; color: #666; margin: 2px 0; }
  .hdr { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2.5px solid ${accent}; padding-bottom: 8px; margin-bottom: 10px; }
  .hdr-right { text-align: right; font-size: ${Math.max(pt - 2, 7)}pt; color: #555; line-height: 1.8; white-space: nowrap; padding-left: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: ${pt}pt; margin-top: 2mm; }
  thead tr { background: ${accent}; }
  tbody tr { page-break-inside: avoid; }
  .footer-bar { position: running(footer); }
  @page { @bottom-left { content: element(footer); } }
  .footer { margin-top: 10mm; padding-top: 5px; border-top: 1px solid #d1d5db; display: flex; justify-content: space-between; font-size: ${Math.max(pt - 3, 6)}pt; color: #777; }
  .record-count { display: inline-block; background: ${accentLight}; color: ${accent}; border: 1px solid ${accentMid}; border-radius: 4px; padding: 1px 8px; font-size: ${Math.max(pt - 2, 7)}pt; font-weight: 600; }
</style>
</head>
<body>
<div class="hdr">
  <div>
    <h1 class="rpt-title">${escHtml(title)}</h1>
    ${style.subtitle.trim() ? `<div class="rpt-subtitle">${escHtml(style.subtitle)}</div>` : ""}
    ${farmName ? `<div class="rpt-meta"><strong>${escHtml(farmName)}</strong></div>` : ""}
    ${metaStr ? `<div class="rpt-meta">${escHtml(metaStr)}</div>` : ""}
  </div>
  <div class="hdr-right">
    <div>Printed: ${today}</div>
    <div><span class="record-count">${rows.length.toLocaleString()} record${rows.length !== 1 ? "s" : ""}</span></div>
  </div>
</div>
<table>
  <thead>
    <tr>${thHtml}</tr>
  </thead>
  <tbody>
    ${tbodyHtml || `<tr><td colspan="${selectedCols.length}" style="padding:12px;text-align:center;color:#888;">No records found.</td></tr>`}
  </tbody>
</table>
<div class="footer">
  <span>${escHtml(footer)}</span>
  <span>Generated by BDE Farm Trac · ${today}</span>
</div>
</body>
</html>`;
}

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function buildCSV(rows: Record<string, unknown>[], selectedCols: ColumnMeta[]): string {
  const esc = (v: string) =>
    v.includes(",") || v.includes('"') || v.includes("\n")
      ? `"${v.replace(/"/g, '""')}"` : v;
  const header = selectedCols.map(c => c.label).join(",");
  const body   = rows.map(r =>
    selectedCols.map(c => esc(formatCellValue(r[c.key], c))).join(",")
  );
  return [header, ...body].join("\n");
}

// ─── Step 1: Source ───────────────────────────────────────────────────────────

function SourceStep({
  datasources, selected, onSelect,
}: {
  datasources: Record<string, DatasourceMeta>;
  selected: string;
  onSelect: (key: string) => void;
}) {
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        Choose the dataset you want to build a report from.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.entries(datasources).map(([key, ds]) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
              selected === key
                ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                : "border-border hover:border-primary/40 hover:bg-muted/50"
            }`}
          >
            <span className={`mt-0.5 shrink-0 ${selected === key ? "text-primary" : "text-muted-foreground"}`}>
              {DS_ICON[ds.icon] ?? <FileText className="w-5 h-5" />}
            </span>
            <div>
              <p className="font-medium text-sm">{ds.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{ds.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Step 2: Columns with ordering ───────────────────────────────────────────

function ColumnsStep({
  columns, selected, onChange,
}: {
  columns: ColumnMeta[];
  selected: string[];
  onChange: (cols: string[]) => void;
}) {
  const selectedCols = selected.map(k => columns.find(c => c.key === k)!).filter(Boolean);
  const unselected   = columns.filter(c => !selected.includes(c.key));

  const move = (i: number, dir: -1 | 1) => {
    const next = [...selected];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j]!, next[i]!];
    onChange(next);
  };

  const remove = (key: string) => onChange(selected.filter(k => k !== key));
  const add    = (key: string) => onChange([...selected, key]);

  return (
    <div className="space-y-5">
      {selectedCols.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2 flex items-center gap-2">
            <span>Selected columns</span>
            <Badge variant="secondary">{selectedCols.length}</Badge>
            <span className="text-xs text-muted-foreground font-normal ml-1">— drag rows with ↑ ↓ to set print order</span>
          </p>
          <div className="rounded-lg border divide-y">
            {selectedCols.map((col, i) => (
              <div key={col.key} className="flex items-center gap-2 px-3 py-2 bg-primary/2 hover:bg-muted/30 transition-colors">
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-20 transition-opacity"
                    title="Move up"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    disabled={i === selectedCols.length - 1}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-20 transition-opacity"
                    title="Move down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-xs text-muted-foreground w-5 text-right shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{col.label}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {col.format === "pence" ? "currency (£)" : col.type}
                  </p>
                </div>
                <button
                  onClick={() => remove(col.key)}
                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  title="Remove column"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {unselected.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2 text-muted-foreground">
            Available columns — click to add
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {unselected.map(col => (
              <button
                key={col.key}
                onClick={() => add(col.key)}
                className="flex items-center gap-3 p-3 rounded-lg border border-dashed text-left hover:border-primary/60 hover:bg-muted/40 transition-colors group"
              >
                <Plus className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                <div className="min-w-0">
                  <p className="text-sm truncate">{col.label}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {col.format === "pence" ? "currency (£)" : col.type}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {selected.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">
          Select at least one column to continue.
        </p>
      )}
    </div>
  );
}

// ─── Step 3: Filters ──────────────────────────────────────────────────────────

function FiltersStep({
  ds, config, onChange,
}: {
  ds: DatasourceMeta;
  config: ReportConfig;
  onChange: (patch: Partial<ReportConfig>) => void;
}) {
  const selectedCols = (config.columns.length ? config.columns : ds.defaultColumns)
    .map(k => ds.columns.find(c => c.key === k)!)
    .filter(Boolean);

  const addFilter = () => {
    const first = selectedCols[0];
    if (!first) return;
    onChange({ filters: [...config.filters, { field: first.key, operator: "contains", value: "" }] });
  };

  const updateFilter = (i: number, patch: Partial<ReportFilter>) => {
    onChange({ filters: config.filters.map((f, idx) => idx === i ? { ...f, ...patch } : f) });
  };

  const removeFilter = (i: number) => {
    onChange({ filters: config.filters.filter((_, idx) => idx !== i) });
  };

  return (
    <div className="space-y-6">
      {ds.dateField && (
        <div>
          <p className="text-sm font-medium mb-3">Date Range</p>
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1 block">From</Label>
              <Input type="date" value={config.dateFrom ?? ""} onChange={e => onChange({ dateFrom: e.target.value || undefined })} />
            </div>
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1 block">To</Label>
              <Input type="date" value={config.dateTo ?? ""} onChange={e => onChange({ dateTo: e.target.value || undefined })} />
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium">Field Filters</p>
          <Button variant="outline" size="sm" onClick={addFilter} className="flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add Filter
          </Button>
        </div>
        {config.filters.length === 0 ? (
          <p className="text-sm text-muted-foreground">No filters — all records will be included.</p>
        ) : (
          <div className="space-y-2">
            {config.filters.map((f, i) => {
              const col = ds.columns.find(c => c.key === f.field);
              const isNum = col?.type === "number";
              return (
                <div key={i} className="flex gap-2 items-center">
                  <Select value={f.field} onValueChange={v => updateFilter(i, { field: v, value: "" })}>
                    <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {selectedCols.map(c => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={f.operator} onValueChange={v => updateFilter(i, { operator: v as ReportFilter["operator"] })}>
                    <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {!isNum && <SelectItem value="contains">contains</SelectItem>}
                      <SelectItem value="eq">equals</SelectItem>
                      {isNum && <SelectItem value="gte">≥ (at least)</SelectItem>}
                      {isNum && <SelectItem value="lte">≤ (at most)</SelectItem>}
                    </SelectContent>
                  </Select>
                  <Input
                    className="flex-1"
                    placeholder="Value…"
                    value={f.value}
                    onChange={e => updateFilter(i, { value: e.target.value })}
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeFilter(i)} className="shrink-0 text-muted-foreground hover:text-destructive">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-medium mb-3">Sort Order</p>
        <div className="flex gap-3">
          <Select value={config.sortField ?? ""} onValueChange={v => onChange({ sortField: v || undefined })}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Default order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Default order</SelectItem>
              {selectedCols.map(c => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={config.sortDirection ?? "asc"} onValueChange={v => onChange({ sortDirection: v as "asc" | "desc" })}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">A → Z / Oldest first</SelectItem>
              <SelectItem value="desc">Z → A / Newest first</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: Style & Preview ──────────────────────────────────────────────────

function StylePreviewStep({
  result, config, ds, selectedCols, style, onStyleChange, onChartChange,
  reportName, onNameChange, reportDesc, onDescChange,
  onSave, isSaving, isEditing, farmName,
}: {
  result: RunResult | null;
  config: ReportConfig;
  ds: DatasourceMeta;
  selectedCols: ColumnMeta[];
  style: ReportStyle;
  onStyleChange: (patch: Partial<ReportStyle>) => void;
  onChartChange: (chart: ChartConfig | undefined) => void;
  reportName: string;
  onNameChange: (n: string) => void;
  reportDesc: string;
  onDescChange: (d: string) => void;
  onSave: () => void;
  isSaving: boolean;
  isEditing: boolean;
  farmName: string;
}) {
  const chartData = useMemo(() => {
    if (!result?.data || !config.chart?.labelField) return [];
    return buildChartData(result.data, config.chart);
  }, [result, config.chart]);

  const handlePrint = useCallback(() => {
    if (!result) return;
    const html = buildPrintHTML(result.data, selectedCols, style, config, farmName, reportName);
    openPrintWindow(html);
  }, [result, selectedCols, style, config, farmName, reportName]);

  const csvHref = useMemo(() => {
    if (!result) return "#";
    return `data:text/csv;charset=utf-8,${encodeURIComponent(buildCSV(result.data, selectedCols))}`;
  }, [result, selectedCols]);

  const displayTitle = style.reportTitle.trim() || reportName || "Report";

  return (
    <div className="space-y-6">
      {/* Report naming */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Saved Report Name *</Label>
          <Input placeholder="e.g. Monthly Spray Summary" value={reportName} onChange={e => onNameChange(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Description (optional)</Label>
          <Input placeholder="Short description" value={reportDesc} onChange={e => onDescChange(e.target.value)} />
        </div>
      </div>

      {/* Style controls + preview side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5">
        {/* Left: style panel */}
        <div className="space-y-5 border rounded-xl p-4 bg-muted/20">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold">Report Style</p>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Report Title (printed header)</Label>
              <Input
                placeholder={reportName || "Report title…"}
                value={style.reportTitle}
                onChange={e => onStyleChange({ reportTitle: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Subtitle (optional)</Label>
              <Input
                placeholder="e.g. Year ended 31 December 2025"
                value={style.subtitle}
                onChange={e => onStyleChange({ subtitle: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-2 block flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5" /> Font Family
            </Label>
            <Select value={style.fontFamily} onValueChange={v => onStyleChange({ fontFamily: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.map(f => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Heading Colour</Label>
            <div className="flex gap-2 flex-wrap">
              {ACCENT_PRESETS.map(p => (
                <button
                  key={p.value}
                  title={p.label}
                  onClick={() => onStyleChange({ accentColor: p.value })}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${style.accentColor === p.value ? "border-foreground scale-110" : "border-transparent hover:scale-105"}`}
                  style={{ background: p.value }}
                />
              ))}
              <div className="relative" title="Custom colour">
                <input
                  type="color"
                  value={style.accentColor}
                  onChange={e => onStyleChange({ accentColor: e.target.value })}
                  className="sr-only absolute"
                  id="custom-color"
                />
                <label
                  htmlFor="custom-color"
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${!ACCENT_PRESETS.find(p => p.value === style.accentColor) ? "border-foreground scale-110" : "border-dashed border-muted-foreground hover:scale-105"}`}
                  style={{ background: !ACCENT_PRESETS.find(p => p.value === style.accentColor) ? style.accentColor : "#f0f0f0" }}
                >
                  <Plus className="w-3 h-3 text-muted-foreground" />
                </label>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-2 block flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5" /> Text Size
            </Label>
            <div className="flex gap-2">
              {FONT_SIZE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => onStyleChange({ fontSize: opt.value })}
                  className={`flex-1 py-1.5 rounded-lg border text-sm font-medium transition-all ${style.fontSize === opt.value ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/40"}`}
                >
                  {opt.label}
                  <span className="block text-xs font-normal text-muted-foreground">{opt.pt}pt</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Page Orientation</Label>
            <div className="flex gap-2">
              {(["portrait", "landscape"] as const).map(o => (
                <button
                  key={o}
                  onClick={() => onStyleChange({ orientation: o })}
                  className={`flex-1 py-2 rounded-lg border text-sm capitalize transition-all ${style.orientation === o ? "border-primary bg-primary/5 text-primary font-medium" : "border-border hover:border-primary/40"}`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Page Footer Text</Label>
            <Input
              placeholder={farmName ? `${farmName} · BDE Farm Trac` : "BDE Farm Trac"}
              value={style.footerText}
              onChange={e => onStyleChange({ footerText: e.target.value })}
            />
          </div>
        </div>

        {/* Right: preview */}
        <div className="space-y-4">
          {result ? (
            <>
              {/* Action bar */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">{result.count.toLocaleString()} records</Badge>
                <Badge variant="outline">{selectedCols.length} column{selectedCols.length !== 1 ? "s" : ""}</Badge>
                <div className="ml-auto flex gap-2 flex-wrap">
                  <a href={csvHref} download={`${reportName || "report"}.csv`}>
                    <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5" /> Export CSV
                    </Button>
                  </a>
                  <Button variant="outline" size="sm" onClick={handlePrint} className="flex items-center gap-1.5">
                    <Printer className="w-3.5 h-3.5" /> Print / PDF
                  </Button>
                  <Button onClick={onSave} disabled={!reportName.trim() || isSaving} size="sm" className="flex items-center gap-1.5">
                    <Save className="w-3.5 h-3.5" />
                    {isSaving ? "Saving…" : isEditing ? "Update Report" : "Save Report"}
                  </Button>
                </div>
              </div>

              {/* Live table preview with chosen style */}
              <div
                className="overflow-x-auto rounded-lg border"
                style={{ fontFamily: style.fontFamily }}
              >
                <table className="w-full border-collapse" style={{ fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ background: style.accentColor }}>
                      {selectedCols.map(c => (
                        <th
                          key={c.key}
                          style={{ color: "#fff", padding: "7px 10px", textAlign: "left", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}
                        >
                          {c.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.slice(0, 50).map((row, i) => (
                      <tr key={i} style={{ background: i % 2 === 1 ? lightenHex(style.accentColor, 0.92) : "#fff" }}>
                        {selectedCols.map(c => (
                          <td key={c.key} style={{ padding: "5px 10px", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap", fontSize: "0.8rem" }}>
                            {formatCellValue(row[c.key], c)}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {result.count > 50 && (
                      <tr>
                        <td colSpan={selectedCols.length} style={{ padding: "10px", textAlign: "center", fontSize: "0.75rem", color: "#888" }}>
                          Showing 50 of {result.count.toLocaleString()} records. All records appear in the printed PDF.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Report title preview */}
              <div
                className="rounded-lg border p-4"
                style={{ fontFamily: style.fontFamily, borderLeft: `4px solid ${style.accentColor}` }}
              >
                <p className="text-xs text-muted-foreground mb-1">Printed report header preview</p>
                <p style={{ fontSize: "1.1rem", fontWeight: 700, color: style.accentColor }}>{displayTitle}</p>
                {style.subtitle && <p style={{ fontSize: "0.9rem", color: "#555" }}>{style.subtitle}</p>}
                {farmName && <p style={{ fontSize: "0.8rem", color: "#666" }}>{farmName}</p>}
              </div>

              {/* Optional chart */}
              <div className="border rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <BarChart2 className="w-4 h-4 text-primary" />
                  <p className="text-sm font-medium">Add Chart (optional — appears on screen, not in printed report)</p>
                  {config.chart && (
                    <Button variant="ghost" size="sm" className="ml-auto text-xs h-7" onClick={() => onChartChange(undefined)}>
                      Remove chart
                    </Button>
                  )}
                </div>
                {!config.chart ? (
                  <div className="flex gap-3">
                    {(["bar", "line", "pie"] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => onChartChange({
                          type,
                          labelField: selectedCols[0]?.key ?? "",
                          valueField: selectedCols.find(c => c.type === "number")?.key ?? selectedCols[0]?.key ?? "",
                          aggregation: "count",
                        })}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl border hover:border-primary/50 hover:bg-muted/50 transition-all cursor-pointer flex-1"
                      >
                        {type === "bar" ? <BarChart className="w-5 h-5 text-primary" /> :
                         type === "line" ? <LineChart className="w-5 h-5 text-primary" /> :
                         <PieChart className="w-5 h-5 text-primary" />}
                        <span className="text-xs capitalize">{type} chart</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Group by</Label>
                        <Select value={config.chart.labelField} onValueChange={v => onChartChange({ ...config.chart!, labelField: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{selectedCols.map(c => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Value</Label>
                        <Select value={config.chart.valueField} onValueChange={v => onChartChange({ ...config.chart!, valueField: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{selectedCols.map(c => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Aggregation</Label>
                        <Select value={config.chart.aggregation} onValueChange={v => onChartChange({ ...config.chart!, aggregation: v as ChartConfig["aggregation"] })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="count">Count</SelectItem>
                            <SelectItem value="sum">Sum</SelectItem>
                            <SelectItem value="avg">Average</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Chart type</Label>
                        <Select value={config.chart.type} onValueChange={v => onChartChange({ ...config.chart!, type: v as ChartConfig["type"] })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bar">Bar</SelectItem>
                            <SelectItem value="line">Line</SelectItem>
                            <SelectItem value="pie">Pie</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {chartData.length > 0 && (
                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          {config.chart.type === "pie" ? (
                            <RPieChart>
                              <Pie data={chartData} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={80} label={({ label, percent }) => `${label} (${(percent * 100).toFixed(0)}%)`}>
                                {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                              </Pie>
                              <Tooltip />
                            </RPieChart>
                          ) : config.chart.type === "line" ? (
                            <RLineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="label" angle={-30} textAnchor="end" tick={{ fontSize: 10 }} />
                              <YAxis tick={{ fontSize: 10 }} />
                              <Tooltip />
                              <Line type="monotone" dataKey="value" stroke={style.accentColor} strokeWidth={2} dot={{ r: 3 }} />
                            </RLineChart>
                          ) : (
                            <RBarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="label" angle={-30} textAnchor="end" tick={{ fontSize: 10 }} />
                              <YAxis tick={{ fontSize: 10 }} />
                              <Tooltip />
                              <Bar dataKey="value" fill={style.accentColor} radius={[3, 3, 0, 0]}>
                                {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                              </Bar>
                            </RBarChart>
                          )}
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-xl text-muted-foreground">
              <div className="text-center">
                <Play className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Click "Run & Preview" to load your data</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Saved report card ────────────────────────────────────────────────────────

function ReportCard({
  report, dsRegistry, onRun, onEdit, onDelete,
}: {
  report: SavedReport;
  dsRegistry: Record<string, DatasourceMeta>;
  onRun: (r: SavedReport) => void;
  onEdit: (r: SavedReport) => void;
  onDelete: (id: number) => void;
}) {
  const ds = dsRegistry[report.config.datasource];
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
            <span className="shrink-0 text-primary mt-0.5">{DS_ICON[ds?.icon ?? ""] ?? <FileText className="w-4 h-4" />}</span>
            <div className="min-w-0">
              <CardTitle className="text-base truncate">{report.name}</CardTitle>
              {report.description && <CardDescription className="text-xs mt-0.5 truncate">{report.description}</CardDescription>}
            </div>
          </div>
          <Badge variant="outline" className="shrink-0 text-xs">{ds?.label ?? report.config.datasource}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <span>{report.config.columns.length || ds?.defaultColumns.length || 0} columns</span>
          {report.config.filters.length > 0 && <><span>·</span><span>{report.config.filters.length} filter{report.config.filters.length !== 1 ? "s" : ""}</span></>}
          {report.config.style?.accentColor && (
            <span className="flex items-center gap-1 ml-1">
              · <span className="w-3 h-3 rounded-full border inline-block" style={{ background: report.config.style.accentColor }} />
            </span>
          )}
          <span className="ml-auto">Updated {format(new Date(report.updatedAt), "d MMM yyyy")}</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onRun(report)} className="flex items-center gap-1.5 flex-1">
            <Play className="w-3.5 h-3.5" /> Run Report
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(report)} className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Edit
          </Button>
          <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(report.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ReportBuilderPage() {
  const { farmId } = useAppStore();
  const { toast }  = useToast();
  const queryClient = useQueryClient();

  const [view, setView]             = useState<"list" | "builder" | "viewer">("list");
  const [step, setStep]             = useState(0);
  const [editingId, setEditingId]   = useState<number | null>(null);
  const [reportName, setReportName] = useState("");
  const [reportDesc, setReportDesc] = useState("");
  const [runResult, setRunResult]   = useState<RunResult | null>(null);
  const [isRunning, setIsRunning]   = useState(false);
  const [viewingReport, setViewingReport] = useState<SavedReport | null>(null);
  const [viewResult, setViewResult]       = useState<RunResult | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const [config, setConfig] = useState<ReportConfig>({
    datasource: "", columns: [], filters: [],
  });

  const [style, setStyle] = useState<ReportStyle>({ ...DEFAULT_STYLE });

  const patchConfig = (patch: Partial<ReportConfig>) =>
    setConfig(prev => ({ ...prev, ...patch }));

  const patchStyle = (patch: Partial<ReportStyle>) =>
    setStyle(prev => ({ ...prev, ...patch }));

  // Fetch datasource catalogue
  const { data: dsData } = useQuery<{ datasources: Record<string, DatasourceMeta> }>({
    queryKey: ["report-datasources"],
    queryFn: () => fetch("/api/reports/datasources").then(r => r.json()),
  });

  // Fetch saved reports
  const { data: reportsData, isLoading: isLoadingReports } = useQuery<{ reports: SavedReport[] }>({
    queryKey: ["saved-reports", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/reports`).then(r => r.json()),
    enabled: !!farmId,
  });

  // Fetch farm name for print header
  const { data: farmData } = useQuery<{ farm?: { name?: string } }>({
    queryKey: ["farm-basic", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then(r => r.ok ? r.json() : { farm: null }),
    enabled: !!farmId,
  });
  const farmName = farmData?.farm?.name ?? "";

  const datasources = dsData?.datasources ?? {};
  const ds = config.datasource ? datasources[config.datasource] : null;

  const selectedCols = useMemo(() =>
    (config.columns.length ? config.columns : ds?.defaultColumns ?? [])
      .map(k => ds?.columns.find(c => c.key === k)!)
      .filter(Boolean),
    [config.columns, ds],
  );

  // ── Mutations ──────────────────────────────────────────────────────────────

  const saveReport = useMutation({
    mutationFn: async () => {
      const fullConfig: ReportConfig = { ...config, style };
      const url    = editingId ? `/api/farms/${farmId}/reports/${editingId}` : `/api/farms/${farmId}/reports`;
      const method = editingId ? "PUT" : "POST";
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: reportName, description: reportDesc, config: fullConfig }),
      });
      if (!r.ok) throw new Error("Failed to save report");
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-reports", farmId] });
      toast({ title: "Report saved", description: `"${reportName}" has been saved.` });
      goToList();
    },
    onError: () => toast({ title: "Error", description: "Could not save report.", variant: "destructive" }),
  });

  const deleteReport = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(`/api/farms/${farmId}/reports/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error(`Delete failed (${r.status})`);
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-reports", farmId] });
      setDeleteConfirmId(null);
      toast({ title: "Report deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  // ── Navigation ─────────────────────────────────────────────────────────────

  const goToList = () => {
    setView("list");
    setStep(0);
    setConfig({ datasource: "", columns: [], filters: [] });
    setStyle({ ...DEFAULT_STYLE });
    setRunResult(null);
    setReportName("");
    setReportDesc("");
    setEditingId(null);
  };

  const startNewReport = () => { goToList(); setView("builder"); };

  const editReport = (r: SavedReport) => {
    setConfig(r.config);
    setStyle(r.config.style ? { ...DEFAULT_STYLE, ...r.config.style } : { ...DEFAULT_STYLE });
    setReportName(r.name);
    setReportDesc(r.description ?? "");
    setEditingId(r.id);
    setStep(0);
    setRunResult(null);
    setView("builder");
  };

  // ── Run ────────────────────────────────────────────────────────────────────

  const runReport = async (reportOrConfig: SavedReport | null, cfg: ReportConfig) => {
    setIsRunning(true);
    try {
      const url  = reportOrConfig
        ? `/api/farms/${farmId}/reports/${reportOrConfig.id}/run`
        : `/api/farms/${farmId}/reports/run`;
      const opts = reportOrConfig
        ? { method: "POST" }
        : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cfg) };
      const r = await fetch(url, opts);
      if (!r.ok) throw new Error("Run failed");
      return await r.json() as RunResult;
    } finally {
      setIsRunning(false);
    }
  };

  const canAdvance = (): boolean => {
    if (step === 0) return !!config.datasource;
    if (step === 1) return (config.columns.length || (ds?.defaultColumns?.length ?? 0)) > 0;
    return true;
  };

  const handleStepNext = async () => {
    if (step === 2) {
      // Run the query before moving to style/preview step
      try {
        const result = await runReport(null, config);
        setRunResult(result);
      } catch {
        toast({ title: "Error", description: "Could not run report.", variant: "destructive" });
        return;
      }
    }
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const handleRunSavedReport = async (r: SavedReport) => {
    setViewingReport(r);
    setView("viewer");
    setViewResult(null);
    try {
      const result = await runReport(r, r.config);
      setViewResult(result);
    } catch {
      toast({ title: "Error", description: "Could not run report.", variant: "destructive" });
    }
  };

  // ── Viewer view ────────────────────────────────────────────────────────────

  if (view === "viewer" && viewingReport) {
    const vDs = viewingReport.config.datasource ? datasources[viewingReport.config.datasource] : null;
    const vStyle: ReportStyle = viewingReport.config.style
      ? { ...DEFAULT_STYLE, ...viewingReport.config.style }
      : DEFAULT_STYLE;
    const vCols = useMemo(
      () => (viewingReport.config.columns.length ? viewingReport.config.columns : vDs?.defaultColumns ?? [])
        .map(k => vDs?.columns.find(c => c.key === k)!)
        .filter(Boolean),
      [viewingReport, vDs],
    );
    const chartData = useMemo(() => {
      if (!viewResult?.data || !viewingReport.config.chart?.labelField) return [];
      return buildChartData(viewResult.data, viewingReport.config.chart);
    }, [viewResult, viewingReport.config.chart]);

    const csvHref = useMemo(() => {
      if (!viewResult) return "#";
      return `data:text/csv;charset=utf-8,${encodeURIComponent(buildCSV(viewResult.data, vCols))}`;
    }, [viewResult, vCols]);

    const handleViewerPrint = () => {
      if (!viewResult) return;
      const html = buildPrintHTML(viewResult.data, vCols, vStyle, viewingReport.config, farmName, viewingReport.name);
      openPrintWindow(html);
    };

    return (
      <div className="p-6 max-w-6xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => { setView("list"); setViewingReport(null); setViewResult(null); }} className="flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{viewingReport.name}</h2>
            {viewingReport.description && <p className="text-sm text-muted-foreground">{viewingReport.description}</p>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => editReport(viewingReport)} className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Edit
            </Button>
            {viewResult && (
              <>
                <a href={csvHref} download={`${viewingReport.name.replace(/\s+/g, "_")}.csv`}>
                  <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5" /> Export CSV
                  </Button>
                </a>
                <Button size="sm" onClick={handleViewerPrint} className="flex items-center gap-1.5">
                  <Printer className="w-3.5 h-3.5" /> Print / PDF
                </Button>
              </>
            )}
          </div>
        </div>

        {isRunning ? (
          <div className="py-16 text-center text-muted-foreground">Running report…</div>
        ) : viewResult ? (
          <div className="space-y-5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">{viewResult.count.toLocaleString()} records</Badge>
              <Badge variant="outline">{vCols.length} column{vCols.length !== 1 ? "s" : ""}</Badge>
              {viewingReport.config.dateFrom && <Badge variant="outline">From {viewingReport.config.dateFrom}</Badge>}
              {viewingReport.config.dateTo && <Badge variant="outline">To {viewingReport.config.dateTo}</Badge>}
              {vStyle.accentColor && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground ml-1">
                  <span className="w-3 h-3 rounded-full border inline-block" style={{ background: vStyle.accentColor }} />
                  {ACCENT_PRESETS.find(p => p.value === vStyle.accentColor)?.label ?? "Custom colour"}
                </span>
              )}
            </div>

            {viewingReport.config.chart && chartData.length > 0 && (
              <div className="border rounded-xl p-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  {viewingReport.config.chart.type === "pie" ? (
                    <RPieChart>
                      <Pie data={chartData} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={90} label={({ label, percent }) => `${label} (${(percent * 100).toFixed(0)}%)`}>
                        {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </RPieChart>
                  ) : viewingReport.config.chart.type === "line" ? (
                    <RLineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" angle={-30} textAnchor="end" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke={vStyle.accentColor} strokeWidth={2} dot={{ r: 4 }} />
                    </RLineChart>
                  ) : (
                    <RBarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" angle={-30} textAnchor="end" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill={vStyle.accentColor} radius={[4, 4, 0, 0]}>
                        {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Bar>
                    </RBarChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}

            <div className="overflow-x-auto rounded-lg border" style={{ fontFamily: vStyle.fontFamily }}>
              <table className="w-full border-collapse" style={{ fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ background: vStyle.accentColor }}>
                    {vCols.map(c => (
                      <th key={c.key} style={{ color: "#fff", padding: "7px 10px", textAlign: "left", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {viewResult.data.slice(0, 200).map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 1 ? lightenHex(vStyle.accentColor, 0.92) : "#fff" }}>
                      {vCols.map(c => (
                        <td key={c.key} style={{ padding: "5px 10px", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap", fontSize: "0.8rem" }}>
                          {formatCellValue(row[c.key], c)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {viewResult.count > 200 && (
                    <tr>
                      <td colSpan={vCols.length} style={{ padding: "10px", textAlign: "center", fontSize: "0.75rem", color: "#888" }}>
                        Showing 200 of {viewResult.count.toLocaleString()} records — all records appear in the printed PDF.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="py-16 text-center text-muted-foreground">No data returned.</div>
        )}
      </div>
    );
  }

  // ── Builder view ───────────────────────────────────────────────────────────

  if (view === "builder") {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={goToList} className="flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <h2 className="text-xl font-bold">{editingId ? "Edit Report" : "New Report"}</h2>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-1">
              <button
                onClick={() => { if (i < step) setStep(i); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  i === step ? "bg-primary text-primary-foreground" :
                  i < step   ? "bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer" :
                               "bg-muted text-muted-foreground cursor-default"
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${i === step ? "bg-white/20" : ""}`}>
                  {i + 1}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </button>
              {i < STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
            </div>
          ))}
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{STEPS[step]}</CardTitle>
          </CardHeader>
          <CardContent>
            {step === 0 && (
              <SourceStep
                datasources={datasources}
                selected={config.datasource}
                onSelect={key => {
                  const newDs = datasources[key];
                  setConfig({ datasource: key, columns: newDs?.defaultColumns ?? [], filters: [] });
                }}
              />
            )}
            {step === 1 && ds && (
              <ColumnsStep
                columns={ds.columns}
                selected={config.columns.length ? config.columns : ds.defaultColumns}
                onChange={cols => patchConfig({ columns: cols })}
              />
            )}
            {step === 2 && ds && (
              <FiltersStep ds={ds} config={config} onChange={patchConfig} />
            )}
            {step === 3 && ds && (
              <StylePreviewStep
                result={runResult}
                config={config}
                ds={ds}
                selectedCols={selectedCols}
                style={style}
                onStyleChange={patchStyle}
                onChartChange={chart => patchConfig({ chart })}
                reportName={reportName}
                onNameChange={setReportName}
                reportDesc={reportDesc}
                onDescChange={setReportDesc}
                onSave={() => saveReport.mutate()}
                isSaving={saveReport.isPending}
                isEditing={!!editingId}
                farmName={farmName}
              />
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(s => Math.max(s - 1, 0))} disabled={step === 0} className="flex items-center gap-1.5">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          {step < STEPS.length - 1 && (
            <Button onClick={handleStepNext} disabled={!canAdvance() || isRunning} className="flex items-center gap-1.5">
              {step === 2 && isRunning ? "Running…" :
               step === 2 ? <><Play className="w-3.5 h-3.5" /> Run & Preview</> :
               <>Next <ChevronRight className="w-4 h-4" /></>}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ── List view ──────────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-primary" />
            Report Builder
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Build custom reports from any dataset on your farm. Choose columns, set filters, apply your style, then print to PDF or export to CSV.
          </p>
        </div>
        <Button onClick={startNewReport} className="flex items-center gap-2 shrink-0">
          <Plus className="w-4 h-4" /> New Report
        </Button>
      </div>

      {isLoadingReports ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Loading reports…</p>
      ) : (reportsData?.reports ?? []).length === 0 ? (
        <div className="border-2 border-dashed rounded-2xl p-12 text-center">
          <Printer className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-lg font-medium mb-1">No reports yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Choose your data, pick your columns, set filters, style it to match your letterhead, then print a professional PDF — or export to CSV for Excel.
          </p>
          <Button onClick={startNewReport} className="flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" /> Build your first report
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(reportsData?.reports ?? []).map(r => (
            <ReportCard
              key={r.id}
              report={r}
              dsRegistry={datasources}
              onRun={handleRunSavedReport}
              onEdit={editReport}
              onDelete={id => setDeleteConfirmId(id)}
            />
          ))}
        </div>
      )}

      <Dialog open={!!deleteConfirmId} onOpenChange={open => { if (!open) setDeleteConfirmId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Report</DialogTitle>
            <DialogDescription>This report will be permanently deleted and cannot be recovered.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirmId && deleteReport.mutate(deleteConfirmId)} disabled={deleteReport.isPending}>
              {deleteReport.isPending ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
