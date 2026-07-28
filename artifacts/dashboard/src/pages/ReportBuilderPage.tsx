import { useState, useMemo, useRef } from "react";
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
  BarChart, LineChart, PieChart, Filter,
} from "lucide-react";
import { format } from "date-fns";
import {
  BarChart as RBarChart, Bar, LineChart as RLineChart, Line,
  PieChart as RPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ColumnMeta {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "boolean";
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

interface ReportConfig {
  datasource: string;
  columns: string[];
  filters: ReportFilter[];
  dateFrom?: string;
  dateTo?: string;
  sortField?: string;
  sortDirection?: "asc" | "desc";
  chart?: ChartConfig;
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

// ─── Datasource icon map ──────────────────────────────────────────────────────

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

const CHART_COLORS = ["#4f8e4b", "#2d6a4f", "#74b49b", "#a8d5a2", "#d4edda", "#f0a500", "#e07b39", "#c0392b"];

const STEPS = ["Data Source", "Columns", "Filters", "Preview & Save"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCellValue(val: unknown, type: string): string {
  if (val == null) return "—";
  if (type === "date") {
    try { return format(new Date(String(val)), "d MMM yyyy"); } catch { return String(val); }
  }
  if (type === "boolean") return val ? "Yes" : "No";
  if (type === "number" && typeof val === "number") {
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
    else if (chart.aggregation === "sum") value = vals.reduce((acc: number, v: number) => acc + v, 0);
    else value = vals.reduce((acc: number, v: number) => acc + v, 0) / vals.length;
    return { label, value: Math.round(value * 100) / 100 };
  }).sort((a, b) => b.value - a.value).slice(0, 20);
}

// ─── Step 1: Source picker ────────────────────────────────────────────────────

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

// ─── Step 2: Column picker ────────────────────────────────────────────────────

function ColumnsStep({
  columns, selected, onChange,
}: {
  columns: ColumnMeta[];
  selected: string[];
  onChange: (cols: string[]) => void;
}) {
  const allSelected = selected.length === columns.length;
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Choose which columns appear in your report. Drag to reorder is not yet supported — columns appear in the order listed.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 ml-4"
          onClick={() => onChange(allSelected ? [] : columns.map(c => c.key))}
        >
          {allSelected ? "Deselect all" : "Select all"}
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {columns.map(col => (
          <label key={col.key} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
            <Checkbox
              checked={selected.includes(col.key)}
              onCheckedChange={checked => {
                onChange(checked
                  ? [...selected, col.key]
                  : selected.filter(k => k !== col.key));
              }}
            />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{col.label}</p>
              <p className="text-xs text-muted-foreground capitalize">{col.type}</p>
            </div>
          </label>
        ))}
      </div>
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
  const textCols   = ds.columns.filter(c => c.type === "text");
  const numCols    = ds.columns.filter(c => c.type === "number");
  const selectedCols = config.columns.length ? config.columns : ds.defaultColumns;
  const filterableCols = ds.columns.filter(c => selectedCols.includes(c.key));

  const addFilter = () => {
    const first = filterableCols[0];
    if (!first) return;
    onChange({ filters: [...config.filters, { field: first.key, operator: "contains", value: "" }] });
  };

  const updateFilter = (i: number, patch: Partial<ReportFilter>) => {
    const next = config.filters.map((f, idx) => idx === i ? { ...f, ...patch } : f);
    onChange({ filters: next });
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
                    <SelectTrigger className="w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {filterableCols.map(c => (
                        <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={f.operator}
                    onValueChange={v => updateFilter(i, { operator: v as ReportFilter["operator"] })}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {!isNum && <SelectItem value="contains">contains</SelectItem>}
                      <SelectItem value="eq">equals</SelectItem>
                      {isNum && <SelectItem value="gte">≥</SelectItem>}
                      {isNum && <SelectItem value="lte">≤</SelectItem>}
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
        <p className="text-sm font-medium mb-3">Sort</p>
        <div className="flex gap-3">
          <Select value={config.sortField ?? ""} onValueChange={v => onChange({ sortField: v || undefined })}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="No sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No sort</SelectItem>
              {filterableCols.map(c => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={config.sortDirection ?? "asc"} onValueChange={v => onChange({ sortDirection: v as "asc" | "desc" })}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: Preview & Save ───────────────────────────────────────────────────

function PreviewStep({
  result, config, ds, onChartChange, reportName, onNameChange,
  reportDesc, onDescChange, onSave, isSaving, isEditing, farmId,
}: {
  result: RunResult | null;
  config: ReportConfig;
  ds: DatasourceMeta;
  onChartChange: (chart: ChartConfig | undefined) => void;
  reportName: string;
  onNameChange: (n: string) => void;
  reportDesc: string;
  onDescChange: (d: string) => void;
  onSave: () => void;
  isSaving: boolean;
  isEditing: boolean;
  farmId: number;
}) {
  const selectedCols = useMemo(
    () => (config.columns.length ? config.columns : ds.defaultColumns)
      .map(k => ds.columns.find(c => c.key === k)!)
      .filter(Boolean),
    [config.columns, ds],
  );

  const chartData = useMemo(() => {
    if (!result?.data || !config.chart?.labelField || !config.chart?.valueField) return [];
    return buildChartData(result.data, config.chart);
  }, [result, config.chart]);

  const csvHref = useMemo(() => {
    const cols = selectedCols.map(c => c.key);
    const rows = result?.data ?? [];
    const csv  = [cols.join(","), ...rows.map(r => cols.map(k => {
      const v = String(r[k] ?? "");
      return v.includes(",") || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v;
    }).join(","))].join("\n");
    return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
  }, [result, selectedCols]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Report Name *</Label>
          <Input placeholder="e.g. Monthly Spray Summary" value={reportName} onChange={e => onNameChange(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Description (optional)</Label>
          <Input placeholder="Short description" value={reportDesc} onChange={e => onDescChange(e.target.value)} />
        </div>
      </div>

      {result && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{result.count.toLocaleString()} rows</Badge>
              <Badge variant="outline">{selectedCols.length} columns</Badge>
            </div>
            <div className="flex gap-2">
              <a href={csvHref} download={`${reportName || "report"}.csv`}>
                <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" /> CSV
                </Button>
              </a>
              <Button onClick={onSave} disabled={!reportName.trim() || isSaving} size="sm" className="flex items-center gap-1.5">
                <Save className="w-3.5 h-3.5" />
                {isSaving ? "Saving…" : isEditing ? "Update Report" : "Save Report"}
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  {selectedCols.map(c => (
                    <TableHead key={c.key} className="whitespace-nowrap">{c.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.data.slice(0, 50).map((row, i) => (
                  <TableRow key={i}>
                    {selectedCols.map(c => (
                      <TableCell key={c.key} className="whitespace-nowrap text-sm">
                        {formatCellValue(row[c.key], c.type)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {result.count > 50 && (
                  <TableRow>
                    <TableCell colSpan={selectedCols.length} className="text-center text-xs text-muted-foreground py-3">
                      Showing 50 of {result.count.toLocaleString()} rows. Export CSV for full data.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="border rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-3">
              <BarChart2 className="w-4 h-4 text-primary" />
              <p className="text-sm font-medium">Add Chart (optional)</p>
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
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border hover:border-primary/50 hover:bg-muted/50 transition-all cursor-pointer"
                  >
                    {type === "bar" ? <BarChart className="w-6 h-6 text-primary" /> :
                     type === "line" ? <LineChart className="w-6 h-6 text-primary" /> :
                     <PieChart className="w-6 h-6 text-primary" />}
                    <span className="text-xs capitalize">{type} chart</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Group by (X / label)</Label>
                    <Select value={config.chart.labelField} onValueChange={v => onChartChange({ ...config.chart!, labelField: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {selectedCols.map(c => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Value (Y)</Label>
                    <Select value={config.chart.valueField} onValueChange={v => onChartChange({ ...config.chart!, valueField: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {selectedCols.map(c => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
                      </SelectContent>
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
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      {config.chart.type === "pie" ? (
                        <RPieChart>
                          <Pie data={chartData} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={90} label={({ label, percent }) => `${label} (${(percent * 100).toFixed(0)}%)`}>
                            {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                          </Pie>
                          <Tooltip />
                        </RPieChart>
                      ) : config.chart.type === "line" ? (
                        <RLineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="label" angle={-30} textAnchor="end" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Line type="monotone" dataKey="value" stroke="#4f8e4b" strokeWidth={2} dot={{ r: 4 }} />
                        </RLineChart>
                      ) : (
                        <RBarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="label" angle={-30} textAnchor="end" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#4f8e4b" radius={[4, 4, 0, 0]}>
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
      )}
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
          {report.config.chart && <><span>·</span><span>{report.config.chart.type} chart</span></>}
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

  const [view, setView]               = useState<"list" | "builder" | "viewer">("list");
  const [step, setStep]               = useState(0);
  const [editingId, setEditingId]     = useState<number | null>(null);
  const [reportName, setReportName]   = useState("");
  const [reportDesc, setReportDesc]   = useState("");
  const [runResult, setRunResult]     = useState<RunResult | null>(null);
  const [isRunning, setIsRunning]     = useState(false);
  const [viewingReport, setViewingReport] = useState<SavedReport | null>(null);
  const [viewResult, setViewResult]   = useState<RunResult | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const [config, setConfig] = useState<ReportConfig>({
    datasource: "",
    columns: [],
    filters: [],
  });

  const patchConfig = (patch: Partial<ReportConfig>) =>
    setConfig(prev => ({ ...prev, ...patch }));

  const { data: dsData } = useQuery<{ datasources: Record<string, DatasourceMeta> }>({
    queryKey: ["report-datasources"],
    queryFn: () => fetch("/api/reports/datasources").then(r => r.json()),
  });

  const { data: reportsData, isLoading: isLoadingReports } = useQuery<{ reports: SavedReport[] }>({
    queryKey: ["saved-reports", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/reports`).then(r => r.json()),
    enabled: !!farmId,
  });

  const datasources = dsData?.datasources ?? {};
  const ds = config.datasource ? datasources[config.datasource] : null;

  const saveReport = useMutation({
    mutationFn: async () => {
      const url  = editingId ? `/api/farms/${farmId}/reports/${editingId}` : `/api/farms/${farmId}/reports`;
      const method = editingId ? "PUT" : "POST";
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: reportName, description: reportDesc, config }),
      });
      if (!r.ok) throw new Error("Failed to save report");
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-reports", farmId] });
      toast({ title: "Report saved", description: `"${reportName}" has been saved to your reports.` });
      goToList();
    },
    onError: () => toast({ title: "Error", description: "Could not save report.", variant: "destructive" }),
  });

  const deleteReport = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/farms/${farmId}/reports/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-reports", farmId] });
      setDeleteConfirmId(null);
      toast({ title: "Report deleted" });
    },
  });

  const goToList = () => { setView("list"); setStep(0); setConfig({ datasource: "", columns: [], filters: [] }); setRunResult(null); setReportName(""); setReportDesc(""); setEditingId(null); };

  const startNewReport = () => { goToList(); setView("builder"); };

  const editReport = (r: SavedReport) => {
    setConfig(r.config);
    setReportName(r.name);
    setReportDesc(r.description ?? "");
    setEditingId(r.id);
    setStep(0);
    setRunResult(null);
    setView("builder");
  };

  const runReport = async (reportOrConfig: SavedReport | null, cfg: ReportConfig) => {
    setIsRunning(true);
    try {
      const url  = reportOrConfig ? `/api/farms/${farmId}/reports/${reportOrConfig.id}/run` : `/api/farms/${farmId}/reports/run`;
      const opts = reportOrConfig
        ? { method: "POST" }
        : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cfg) };
      const r = await fetch(url, opts);
      if (!r.ok) throw new Error("Run failed");
      const result: RunResult = await r.json();
      return result;
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunFromBuilder = async () => {
    try {
      const result = await runReport(null, config);
      setRunResult(result);
    } catch {
      toast({ title: "Error", description: "Could not run report.", variant: "destructive" });
    }
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

  const canAdvance = (): boolean => {
    if (step === 0) return !!config.datasource;
    if (step === 1) return config.columns.length > 0 || (ds?.defaultColumns?.length ?? 0) > 0;
    return true;
  };

  const handleStepNext = async () => {
    if (step === 2) {
      await handleRunFromBuilder();
    }
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  // ── Viewer view ──────────────────────────────────────────────────────────────
  if (view === "viewer" && viewingReport) {
    const vDs = viewingReport.config.datasource ? datasources[viewingReport.config.datasource] : null;
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
      const cols = vCols.map(c => c.key);
      const csv  = [cols.join(","), ...(viewResult?.data ?? []).map(r => cols.map(k => {
        const v = String(r[k] ?? "");
        return v.includes(",") || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v;
      }).join(","))].join("\n");
      return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    }, [viewResult, vCols]);

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
              <a href={csvHref} download={`${viewingReport.name.replace(/\s+/g, "_")}.csv`}>
                <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" /> CSV
                </Button>
              </a>
            )}
          </div>
        </div>

        {isRunning ? (
          <div className="py-16 text-center text-muted-foreground">Running report…</div>
        ) : viewResult ? (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{viewResult.count.toLocaleString()} rows</Badge>
              <Badge variant="outline">{vCols.length} columns</Badge>
              {viewingReport.config.dateFrom && <Badge variant="outline">From {viewingReport.config.dateFrom}</Badge>}
              {viewingReport.config.dateTo && <Badge variant="outline">To {viewingReport.config.dateTo}</Badge>}
            </div>

            {viewingReport.config.chart && chartData.length > 0 && (
              <div className="border rounded-xl p-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  {viewingReport.config.chart.type === "pie" ? (
                    <RPieChart>
                      <Pie data={chartData} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={100} label={({ label, percent }) => `${label} (${(percent * 100).toFixed(0)}%)`}>
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
                      <Line type="monotone" dataKey="value" stroke="#4f8e4b" strokeWidth={2} dot={{ r: 4 }} />
                    </RLineChart>
                  ) : (
                    <RBarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" angle={-30} textAnchor="end" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#4f8e4b" radius={[4, 4, 0, 0]}>
                        {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Bar>
                    </RBarChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}

            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {vCols.map(c => <TableHead key={c.key} className="whitespace-nowrap">{c.label}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {viewResult.data.slice(0, 100).map((row, i) => (
                    <TableRow key={i}>
                      {vCols.map(c => (
                        <TableCell key={c.key} className="whitespace-nowrap text-sm">{formatCellValue(row[c.key], c.type)}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                  {viewResult.count > 100 && (
                    <TableRow>
                      <TableCell colSpan={vCols.length} className="text-center text-xs text-muted-foreground py-3">
                        Showing 100 of {viewResult.count.toLocaleString()} rows. Download CSV for full data.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="py-16 text-center text-muted-foreground">No data returned.</div>
        )}
      </div>
    );
  }

  // ── Builder view ─────────────────────────────────────────────────────────────
  if (view === "builder") {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={goToList} className="flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <h2 className="text-xl font-bold">{editingId ? "Edit Report" : "New Report"}</h2>
        </div>

        <div className="flex items-center gap-1 mb-6">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-1">
              <button
                onClick={() => { if (i < step || canAdvance()) setStep(i); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  i === step ? "bg-primary text-primary-foreground" :
                  i < step ? "bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer" :
                  "bg-muted text-muted-foreground"
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${i === step ? "bg-primary-foreground text-primary" : "bg-current/20"}`}>
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
              <PreviewStep
                result={runResult}
                config={config}
                ds={ds}
                onChartChange={chart => patchConfig({ chart })}
                reportName={reportName}
                onNameChange={setReportName}
                reportDesc={reportDesc}
                onDescChange={setReportDesc}
                onSave={() => saveReport.mutate()}
                isSaving={saveReport.isPending}
                isEditing={!!editingId}
                farmId={farmId!}
              />
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(s => Math.max(s - 1, 0))} disabled={step === 0} className="flex items-center gap-1.5">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={handleStepNext} disabled={!canAdvance() || isRunning} className="flex items-center gap-1.5">
              {step === 2 && isRunning ? "Running…" : step === 2 ? <><Play className="w-3.5 h-3.5" /> Run & Preview</> : <>Next <ChevronRight className="w-4 h-4" /></>}
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  // ── List view ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-primary" />
            Report Builder
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Build, save, and export custom reports from any dataset on your farm. Add charts and filters, then export to CSV.
          </p>
        </div>
        <Button onClick={startNewReport} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Report
        </Button>
      </div>

      {isLoadingReports ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Loading reports…</p>
      ) : (reportsData?.reports ?? []).length === 0 ? (
        <div className="border-2 border-dashed rounded-2xl p-12 text-center">
          <BarChart2 className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-lg font-medium mb-1">No reports yet</p>
          <p className="text-sm text-muted-foreground mb-4">Build your first report in 4 steps — pick a dataset, choose columns, set filters, and preview.</p>
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
            <DialogDescription>This report will be permanently deleted. This action cannot be undone.</DialogDescription>
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
