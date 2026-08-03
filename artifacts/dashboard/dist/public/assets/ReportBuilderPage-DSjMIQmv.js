import { q as createLucideIcon, b as useAppStore, a as useToast, t as useQueryClient, r as reactExports, l as useQuery, O as useMutation, j as jsxRuntimeExports, c as Button, m as Card, a_ as CardHeader, a$ as CardTitle, n as CardContent, S as Plus, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, H as DialogDescription, C as Checkbox, L as Label, I as Input, $ as X, b0 as CardDescription, T as FlaskConical, K as Map } from "./index-CdPMp_BK.js";
import { B as Badge } from "./badge-x_b3Uh8h.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BpuhN8y7.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-tAnyf-Pj.js";
import { A as ArrowLeft, C as ChevronRight, T as Tractor } from "./tractor-CPNxHkQU.js";
import { D as Download } from "./download-ClsuB3fp.js";
import { R as ResponsiveContainer, C as Cell, T as Tooltip, X as XAxis, Y as YAxis, B as Bar } from "./generateCategoricalChart-BWRBXg0I.js";
import { P as PieChart, a as Pie } from "./PieChart-BLMdGK1n.js";
import { L as LineChart } from "./LineChart-DMVjC4wZ.js";
import { C as CartesianGrid } from "./CartesianGrid-Biwx6wPW.js";
import { L as Line } from "./Line-xe2_dQbj.js";
import { B as BarChart } from "./BarChart-B5bgqn99.js";
import { C as ChevronLeft } from "./chevron-left-DAl0joAR.js";
import { P as Play } from "./play-ZfEgYvue.js";
import { C as ChartNoAxesColumn } from "./chart-no-axes-column-DYR4YabT.js";
import { F as FileText, S as ShieldAlert, P as PoundSterling, G as GraduationCap, C as ClipboardCheck, D as Droplets } from "./shield-alert-BWQ2YhSb.js";
import { S as Save } from "./save-njiSa_M5.js";
import { C as ChartLine } from "./chart-line-CwRTbV9-.js";
import { T as Trash2 } from "./trash-2-BiiCX-Xt.js";
import { S as Syringe } from "./syringe-ZQTUmcf4.js";
import { A as ArrowLeftRight } from "./arrow-left-right-VgQZUQik.js";
import { f as format } from "./format-Fqx7OmaC.js";
import "./index-Bn7LExu_.js";
import "./index-DZTO6jyG.js";
import "./chevron-up-C01YHFYc.js";
const __iconNode$2 = [
  ["path", { d: "M5 21v-6", key: "1hz6c0" }],
  ["path", { d: "M12 21V9", key: "uvy0l4" }],
  ["path", { d: "M19 21V3", key: "11j9sm" }]
];
const ChartNoAxesColumnIncreasing = createLucideIcon("chart-no-axes-column-increasing", __iconNode$2);
const __iconNode$1 = [
  [
    "path",
    {
      d: "M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z",
      key: "pzmjnu"
    }
  ],
  ["path", { d: "M21.21 15.89A10 10 0 1 1 8 2.83", key: "k2fpak" }]
];
const ChartPie = createLucideIcon("chart-pie", __iconNode$1);
const __iconNode = [
  ["path", { d: "M10 5H3", key: "1qgfaw" }],
  ["path", { d: "M12 19H3", key: "yhmn1j" }],
  ["path", { d: "M14 3v4", key: "1sua03" }],
  ["path", { d: "M16 17v4", key: "1q0r14" }],
  ["path", { d: "M21 12h-9", key: "1o4lsq" }],
  ["path", { d: "M21 19h-5", key: "1rlt1p" }],
  ["path", { d: "M21 5h-7", key: "1oszz2" }],
  ["path", { d: "M8 10v4", key: "tgpxqk" }],
  ["path", { d: "M8 12H3", key: "a7s4jb" }]
];
const SlidersHorizontal = createLucideIcon("sliders-horizontal", __iconNode);
const DS_ICON = {
  Map: /* @__PURE__ */ jsxRuntimeExports.jsx(Map, { className: "w-5 h-5" }),
  ArrowLeftRight: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeftRight, { className: "w-5 h-5" }),
  Syringe: /* @__PURE__ */ jsxRuntimeExports.jsx(Syringe, { className: "w-5 h-5" }),
  Droplets: /* @__PURE__ */ jsxRuntimeExports.jsx(Droplets, { className: "w-5 h-5" }),
  FlaskConical: /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "w-5 h-5" }),
  ClipboardCheck: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardCheck, { className: "w-5 h-5" }),
  GraduationCap: /* @__PURE__ */ jsxRuntimeExports.jsx(GraduationCap, { className: "w-5 h-5" }),
  Tractor: /* @__PURE__ */ jsxRuntimeExports.jsx(Tractor, { className: "w-5 h-5" }),
  PoundSterling: /* @__PURE__ */ jsxRuntimeExports.jsx(PoundSterling, { className: "w-5 h-5" }),
  ShieldAlert: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "w-5 h-5" })
};
const CHART_COLORS = ["#4f8e4b", "#2d6a4f", "#74b49b", "#a8d5a2", "#d4edda", "#f0a500", "#e07b39", "#c0392b"];
const STEPS = ["Data Source", "Columns", "Filters", "Preview & Save"];
function formatCellValue(val, type) {
  if (val == null) return "—";
  if (type === "date") {
    try {
      return format(new Date(String(val)), "d MMM yyyy");
    } catch {
      return String(val);
    }
  }
  if (type === "boolean") return val ? "Yes" : "No";
  if (type === "number" && typeof val === "number") {
    return Number.isInteger(val) ? val.toLocaleString() : val.toFixed(2);
  }
  return String(val);
}
function buildChartData(rows, chart) {
  const grouped = {};
  for (const row of rows) {
    const label = String(row[chart.labelField] ?? "Unknown");
    const raw = Number(row[chart.valueField] ?? 0);
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(isNaN(raw) ? 1 : raw);
  }
  return Object.entries(grouped).map(([label, vals]) => {
    let value;
    if (chart.aggregation === "count") value = vals.length;
    else if (chart.aggregation === "sum") value = vals.reduce((acc, v) => acc + v, 0);
    else value = vals.reduce((acc, v) => acc + v, 0) / vals.length;
    return { label, value: Math.round(value * 100) / 100 };
  }).sort((a, b) => b.value - a.value).slice(0, 20);
}
function SourceStep({
  datasources,
  selected,
  onSelect
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Choose the dataset you want to build a report from." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: Object.entries(datasources).map(([key, ds]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => onSelect(key),
        className: `flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${selected === key ? "border-primary bg-primary/5 ring-2 ring-primary/30" : "border-border hover:border-primary/40 hover:bg-muted/50"}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `mt-0.5 shrink-0 ${selected === key ? "text-primary" : "text-muted-foreground"}`, children: DS_ICON[ds.icon] ?? /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-5 h-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-sm", children: ds.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: ds.description })
          ] })
        ]
      },
      key
    )) })
  ] });
}
function ColumnsStep({
  columns,
  selected,
  onChange
}) {
  const allSelected = selected.length === columns.length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Choose which columns appear in your report. Drag to reorder is not yet supported — columns appear in the order listed." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "outline",
          size: "sm",
          className: "shrink-0 ml-4",
          onClick: () => onChange(allSelected ? [] : columns.map((c) => c.key)),
          children: allSelected ? "Deselect all" : "Select all"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2", children: columns.map((col) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Checkbox,
        {
          checked: selected.includes(col.key),
          onCheckedChange: (checked) => {
            onChange(checked ? [...selected, col.key] : selected.filter((k) => k !== col.key));
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium truncate", children: col.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground capitalize", children: col.type })
      ] })
    ] }, col.key)) })
  ] });
}
function FiltersStep({
  ds,
  config,
  onChange
}) {
  ds.columns.filter((c) => c.type === "text");
  ds.columns.filter((c) => c.type === "number");
  const selectedCols = config.columns.length ? config.columns : ds.defaultColumns;
  const filterableCols = ds.columns.filter((c) => selectedCols.includes(c.key));
  const addFilter = () => {
    const first = filterableCols[0];
    if (!first) return;
    onChange({ filters: [...config.filters, { field: first.key, operator: "contains", value: "" }] });
  };
  const updateFilter = (i, patch) => {
    const next = config.filters.map((f, idx) => idx === i ? { ...f, ...patch } : f);
    onChange({ filters: next });
  };
  const removeFilter = (i) => {
    onChange({ filters: config.filters.filter((_, idx) => idx !== i) });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    ds.dateField && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium mb-3", children: "Date Range" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground mb-1 block", children: "From" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: config.dateFrom ?? "", onChange: (e) => onChange({ dateFrom: e.target.value || void 0 }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground mb-1 block", children: "To" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: config.dateTo ?? "", onChange: (e) => onChange({ dateTo: e.target.value || void 0 }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Field Filters" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: addFilter, className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5" }),
          " Add Filter"
        ] })
      ] }),
      config.filters.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No filters — all records will be included." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: config.filters.map((f, i) => {
        const col = ds.columns.find((c) => c.key === f.field);
        const isNum = col?.type === "number";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: f.field, onValueChange: (v) => updateFilter(i, { field: v, value: "" }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-44", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: filterableCols.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.key, children: c.label }, c.key)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: f.operator,
              onValueChange: (v) => updateFilter(i, { operator: v }),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-36", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  !isNum && /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "contains", children: "contains" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "eq", children: "equals" }),
                  isNum && /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "gte", children: "≥" }),
                  isNum && /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "lte", children: "≤" })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              className: "flex-1",
              placeholder: "Value…",
              value: f.value,
              onChange: (e) => updateFilter(i, { value: e.target.value })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => removeFilter(i), className: "shrink-0 text-muted-foreground hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4" }) })
        ] }, i);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium mb-3", children: "Sort" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: config.sortField ?? "", onValueChange: (v) => onChange({ sortField: v || void 0 }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "No sort" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "", children: "No sort" }),
            filterableCols.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.key, children: c.label }, c.key))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: config.sortDirection ?? "asc", onValueChange: (v) => onChange({ sortDirection: v }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-32", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "asc", children: "Ascending" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "desc", children: "Descending" })
          ] })
        ] })
      ] })
    ] })
  ] });
}
function PreviewStep({
  result,
  config,
  ds,
  onChartChange,
  reportName,
  onNameChange,
  reportDesc,
  onDescChange,
  onSave,
  isSaving,
  isEditing,
  farmId
}) {
  const selectedCols = reactExports.useMemo(
    () => (config.columns.length ? config.columns : ds.defaultColumns).map((k) => ds.columns.find((c) => c.key === k)).filter(Boolean),
    [config.columns, ds]
  );
  const chartData = reactExports.useMemo(() => {
    if (!result?.data || !config.chart?.labelField || !config.chart?.valueField) return [];
    return buildChartData(result.data, config.chart);
  }, [result, config.chart]);
  const csvHref = reactExports.useMemo(() => {
    const cols = selectedCols.map((c) => c.key);
    const rows = result?.data ?? [];
    const csv = [cols.join(","), ...rows.map((r) => cols.map((k) => {
      const v = String(r[k] ?? "");
      return v.includes(",") || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v;
    }).join(","))].join("\n");
    return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
  }, [result, selectedCols]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground mb-1 block", children: "Report Name *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Monthly Spray Summary", value: reportName, onChange: (e) => onNameChange(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground mb-1 block", children: "Description (optional)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Short description", value: reportDesc, onChange: (e) => onDescChange(e.target.value) })
      ] })
    ] }),
    result && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", children: [
            result.count.toLocaleString(),
            " rows"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
            selectedCols.length,
            " columns"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: csvHref, download: `${reportName || "report"}.csv`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-3.5 h-3.5" }),
            " CSV"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: onSave, disabled: !reportName.trim() || isSaving, size: "sm", className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-3.5 h-3.5" }),
            isSaving ? "Saving…" : isEditing ? "Update Report" : "Save Report"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-lg border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: selectedCols.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "whitespace-nowrap", children: c.label }, c.key)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
          result.data.slice(0, 50).map((row, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: selectedCols.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "whitespace-nowrap text-sm", children: formatCellValue(row[c.key], c.type) }, c.key)) }, i)),
          result.count > 50 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { colSpan: selectedCols.length, className: "text-center text-xs text-muted-foreground py-3", children: [
            "Showing 50 of ",
            result.count.toLocaleString(),
            " rows. Export CSV for full data."
          ] }) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-xl p-4 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartNoAxesColumn, { className: "w-4 h-4 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Add Chart (optional)" }),
          config.chart && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "ml-auto text-xs h-7", onClick: () => onChartChange(void 0), children: "Remove chart" })
        ] }),
        !config.chart ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-3", children: ["bar", "line", "pie"].map((type) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => onChartChange({
              type,
              labelField: selectedCols[0]?.key ?? "",
              valueField: selectedCols.find((c) => c.type === "number")?.key ?? selectedCols[0]?.key ?? "",
              aggregation: "count"
            }),
            className: "flex flex-col items-center gap-2 p-4 rounded-xl border hover:border-primary/50 hover:bg-muted/50 transition-all cursor-pointer",
            children: [
              type === "bar" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChartNoAxesColumnIncreasing, { className: "w-6 h-6 text-primary" }) : type === "line" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChartLine, { className: "w-6 h-6 text-primary" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChartPie, { className: "w-6 h-6 text-primary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs capitalize", children: [
                type,
                " chart"
              ] })
            ]
          },
          type
        )) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground mb-1 block", children: "Group by (X / label)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: config.chart.labelField, onValueChange: (v) => onChartChange({ ...config.chart, labelField: v }), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: selectedCols.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.key, children: c.label }, c.key)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground mb-1 block", children: "Value (Y)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: config.chart.valueField, onValueChange: (v) => onChartChange({ ...config.chart, valueField: v }), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: selectedCols.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.key, children: c.label }, c.key)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground mb-1 block", children: "Aggregation" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: config.chart.aggregation, onValueChange: (v) => onChartChange({ ...config.chart, aggregation: v }), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "count", children: "Count" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "sum", children: "Sum" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "avg", children: "Average" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground mb-1 block", children: "Chart type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: config.chart.type, onValueChange: (v) => onChartChange({ ...config.chart, type: v }), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "bar", children: "Bar" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "line", children: "Line" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pie", children: "Pie" })
                ] })
              ] })
            ] })
          ] }),
          chartData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-64", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: config.chart.type === "pie" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: chartData, dataKey: "value", nameKey: "label", cx: "50%", cy: "50%", outerRadius: 90, label: ({ label, percent }) => `${label} (${(percent * 100).toFixed(0)}%)`, children: chartData.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: CHART_COLORS[i % CHART_COLORS.length] }, i)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {})
          ] }) : config.chart.type === "line" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: chartData, margin: { top: 5, right: 20, left: 0, bottom: 40 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", angle: -30, textAnchor: "end", tick: { fontSize: 11 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 11 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: "value", stroke: "#4f8e4b", strokeWidth: 2, dot: { r: 4 } })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: chartData, margin: { top: 5, right: 20, left: 0, bottom: 40 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", angle: -30, textAnchor: "end", tick: { fontSize: 11 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 11 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "value", fill: "#4f8e4b", radius: [4, 4, 0, 0], children: chartData.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: CHART_COLORS[i % CHART_COLORS.length] }, i)) })
          ] }) }) })
        ] })
      ] })
    ] })
  ] });
}
function ReportCard({
  report,
  dsRegistry,
  onRun,
  onEdit,
  onDelete
}) {
  const ds = dsRegistry[report.config.datasource];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "hover:shadow-md transition-shadow", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 text-primary mt-0.5", children: DS_ICON[ds?.icon ?? ""] ?? /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-4 h-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base truncate", children: report.name }),
          report.description && /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "text-xs mt-0.5 truncate", children: report.description })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "shrink-0 text-xs", children: ds?.label ?? report.config.datasource })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          report.config.columns.length || ds?.defaultColumns.length || 0,
          " columns"
        ] }),
        report.config.filters.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "·" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            report.config.filters.length,
            " filter",
            report.config.filters.length !== 1 ? "s" : ""
          ] })
        ] }),
        report.config.chart && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "·" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            report.config.chart.type,
            " chart"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto", children: [
          "Updated ",
          format(new Date(report.updatedAt), "d MMM yyyy")
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => onRun(report), className: "flex items-center gap-1.5 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-3.5 h-3.5" }),
          " Run Report"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => onEdit(report), className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SlidersHorizontal, { className: "w-3.5 h-3.5" }),
          " Edit"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive", onClick: () => onDelete(report.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" }) })
      ] })
    ] })
  ] });
}
function ReportBuilderPage() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [view, setView] = reactExports.useState("list");
  const [step, setStep] = reactExports.useState(0);
  const [editingId, setEditingId] = reactExports.useState(null);
  const [reportName, setReportName] = reactExports.useState("");
  const [reportDesc, setReportDesc] = reactExports.useState("");
  const [runResult, setRunResult] = reactExports.useState(null);
  const [isRunning, setIsRunning] = reactExports.useState(false);
  const [viewingReport, setViewingReport] = reactExports.useState(null);
  const [viewResult, setViewResult] = reactExports.useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = reactExports.useState(null);
  const [config, setConfig] = reactExports.useState({
    datasource: "",
    columns: [],
    filters: []
  });
  const patchConfig = (patch) => setConfig((prev) => ({ ...prev, ...patch }));
  const { data: dsData } = useQuery({
    queryKey: ["report-datasources"],
    queryFn: () => fetch("/api/reports/datasources").then((r) => r.json())
  });
  const { data: reportsData, isLoading: isLoadingReports } = useQuery({
    queryKey: ["saved-reports", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/reports`).then((r) => r.json()),
    enabled: !!farmId
  });
  const datasources = dsData?.datasources ?? {};
  const ds = config.datasource ? datasources[config.datasource] : null;
  const saveReport = useMutation({
    mutationFn: async () => {
      const url = editingId ? `/api/farms/${farmId}/reports/${editingId}` : `/api/farms/${farmId}/reports`;
      const method = editingId ? "PUT" : "POST";
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: reportName, description: reportDesc, config })
      });
      if (!r.ok) throw new Error("Failed to save report");
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-reports", farmId] });
      toast({ title: "Report saved", description: `"${reportName}" has been saved to your reports.` });
      goToList();
    },
    onError: () => toast({ title: "Error", description: "Could not save report.", variant: "destructive" })
  });
  const deleteReport = useMutation({
    mutationFn: async (id) => {
      await fetch(`/api/farms/${farmId}/reports/${id}`, { method: "DELETE" }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-reports", farmId] });
      setDeleteConfirmId(null);
      toast({ title: "Report deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const goToList = () => {
    setView("list");
    setStep(0);
    setConfig({ datasource: "", columns: [], filters: [] });
    setRunResult(null);
    setReportName("");
    setReportDesc("");
    setEditingId(null);
  };
  const startNewReport = () => {
    goToList();
    setView("builder");
  };
  const editReport = (r) => {
    setConfig(r.config);
    setReportName(r.name);
    setReportDesc(r.description ?? "");
    setEditingId(r.id);
    setStep(0);
    setRunResult(null);
    setView("builder");
  };
  const runReport = async (reportOrConfig, cfg) => {
    setIsRunning(true);
    try {
      const url = reportOrConfig ? `/api/farms/${farmId}/reports/${reportOrConfig.id}/run` : `/api/farms/${farmId}/reports/run`;
      const opts = reportOrConfig ? { method: "POST" } : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cfg) };
      const r = await fetch(url, opts);
      if (!r.ok) throw new Error("Run failed");
      const result = await r.json();
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
  const handleRunSavedReport = async (r) => {
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
  const canAdvance = () => {
    if (step === 0) return !!config.datasource;
    if (step === 1) return config.columns.length > 0 || (ds?.defaultColumns?.length ?? 0) > 0;
    return true;
  };
  const handleStepNext = async () => {
    if (step === 2) {
      await handleRunFromBuilder();
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  if (view === "viewer" && viewingReport) {
    const vDs = viewingReport.config.datasource ? datasources[viewingReport.config.datasource] : null;
    const vCols = reactExports.useMemo(
      () => (viewingReport.config.columns.length ? viewingReport.config.columns : vDs?.defaultColumns ?? []).map((k) => vDs?.columns.find((c) => c.key === k)).filter(Boolean),
      [viewingReport, vDs]
    );
    const chartData = reactExports.useMemo(() => {
      if (!viewResult?.data || !viewingReport.config.chart?.labelField) return [];
      return buildChartData(viewResult.data, viewingReport.config.chart);
    }, [viewResult, viewingReport.config.chart]);
    const csvHref = reactExports.useMemo(() => {
      const cols = vCols.map((c) => c.key);
      const csv = [cols.join(","), ...(viewResult?.data ?? []).map((r) => cols.map((k) => {
        const v = String(r[k] ?? "");
        return v.includes(",") || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v;
      }).join(","))].join("\n");
      return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    }, [viewResult, vCols]);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-6xl mx-auto space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: () => {
          setView("list");
          setViewingReport(null);
          setViewResult(null);
        }, className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-4 h-4" }),
          " Back"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold", children: viewingReport.name }),
          viewingReport.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: viewingReport.description })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => editReport(viewingReport), className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SlidersHorizontal, { className: "w-3.5 h-3.5" }),
            " Edit"
          ] }),
          viewResult && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: csvHref, download: `${viewingReport.name.replace(/\s+/g, "_")}.csv`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-3.5 h-3.5" }),
            " CSV"
          ] }) })
        ] })
      ] }),
      isRunning ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-16 text-center text-muted-foreground", children: "Running report…" }) : viewResult ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", children: [
            viewResult.count.toLocaleString(),
            " rows"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
            vCols.length,
            " columns"
          ] }),
          viewingReport.config.dateFrom && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
            "From ",
            viewingReport.config.dateFrom
          ] }),
          viewingReport.config.dateTo && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
            "To ",
            viewingReport.config.dateTo
          ] })
        ] }),
        viewingReport.config.chart && chartData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-xl p-4 h-72", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: viewingReport.config.chart.type === "pie" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: chartData, dataKey: "value", nameKey: "label", cx: "50%", cy: "50%", outerRadius: 100, label: ({ label, percent }) => `${label} (${(percent * 100).toFixed(0)}%)`, children: chartData.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: CHART_COLORS[i % CHART_COLORS.length] }, i)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {})
        ] }) : viewingReport.config.chart.type === "line" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: chartData, margin: { top: 5, right: 20, left: 0, bottom: 40 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", angle: -30, textAnchor: "end", tick: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: "value", stroke: "#4f8e4b", strokeWidth: 2, dot: { r: 4 } })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: chartData, margin: { top: 5, right: 20, left: 0, bottom: 40 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", angle: -30, textAnchor: "end", tick: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "value", fill: "#4f8e4b", radius: [4, 4, 0, 0], children: chartData.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: CHART_COLORS[i % CHART_COLORS.length] }, i)) })
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-lg border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: vCols.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "whitespace-nowrap", children: c.label }, c.key)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            viewResult.data.slice(0, 100).map((row, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: vCols.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "whitespace-nowrap text-sm", children: formatCellValue(row[c.key], c.type) }, c.key)) }, i)),
            viewResult.count > 100 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { colSpan: vCols.length, className: "text-center text-xs text-muted-foreground py-3", children: [
              "Showing 100 of ",
              viewResult.count.toLocaleString(),
              " rows. Download CSV for full data."
            ] }) })
          ] })
        ] }) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-16 text-center text-muted-foreground", children: "No data returned." })
    ] });
  }
  if (view === "builder") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-4xl mx-auto space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: goToList, className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-4 h-4" }),
          " Back"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold", children: editingId ? "Edit Report" : "New Report" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1 mb-6", children: STEPS.map((label, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => {
              if (i < step || canAdvance()) setStep(i);
            },
            className: `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${i === step ? "bg-primary text-primary-foreground" : i < step ? "bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer" : "bg-muted text-muted-foreground"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${i === step ? "bg-primary-foreground text-primary" : "bg-current/20"}`, children: i + 1 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: label })
            ]
          }
        ),
        i < STEPS.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-3 h-3 text-muted-foreground" })
      ] }, i)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: STEPS[step] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          step === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
            SourceStep,
            {
              datasources,
              selected: config.datasource,
              onSelect: (key) => {
                const newDs = datasources[key];
                setConfig({ datasource: key, columns: newDs?.defaultColumns ?? [], filters: [] });
              }
            }
          ),
          step === 1 && ds && /* @__PURE__ */ jsxRuntimeExports.jsx(
            ColumnsStep,
            {
              columns: ds.columns,
              selected: config.columns.length ? config.columns : ds.defaultColumns,
              onChange: (cols) => patchConfig({ columns: cols })
            }
          ),
          step === 2 && ds && /* @__PURE__ */ jsxRuntimeExports.jsx(FiltersStep, { ds, config, onChange: patchConfig }),
          step === 3 && ds && /* @__PURE__ */ jsxRuntimeExports.jsx(
            PreviewStep,
            {
              result: runResult,
              config,
              ds,
              onChartChange: (chart) => patchConfig({ chart }),
              reportName,
              onNameChange: setReportName,
              reportDesc,
              onDescChange: setReportDesc,
              onSave: () => saveReport.mutate(),
              isSaving: saveReport.isPending,
              isEditing: !!editingId,
              farmId
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setStep((s) => Math.max(s - 1, 0)), disabled: step === 0, className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "w-4 h-4" }),
          " Back"
        ] }),
        step < STEPS.length - 1 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleStepNext, disabled: !canAdvance() || isRunning, className: "flex items-center gap-1.5", children: step === 2 && isRunning ? "Running…" : step === 2 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-3.5 h-3.5" }),
          " Run & Preview"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          "Next ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4" })
        ] }) }) : null
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-5xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl font-bold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartNoAxesColumn, { className: "w-6 h-6 text-primary" }),
          "Report Builder"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1 text-sm", children: "Build, save, and export custom reports from any dataset on your farm. Add charts and filters, then export to CSV." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: startNewReport, className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
        " New Report"
      ] })
    ] }),
    isLoadingReports ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-8 text-center", children: "Loading reports…" }) : (reportsData?.reports ?? []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-2 border-dashed rounded-2xl p-12 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChartNoAxesColumn, { className: "w-10 h-10 text-muted-foreground/40 mx-auto mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-medium mb-1", children: "No reports yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Build your first report in 4 steps — pick a dataset, choose columns, set filters, and preview." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: startNewReport, className: "flex items-center gap-2 mx-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
        " Build your first report"
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: (reportsData?.reports ?? []).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      ReportCard,
      {
        report: r,
        dsRegistry: datasources,
        onRun: handleRunSavedReport,
        onEdit: editReport,
        onDelete: (id) => setDeleteConfirmId(id)
      },
      r.id
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!deleteConfirmId, onOpenChange: (open) => {
      if (!open) setDeleteConfirmId(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Report" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "This report will be permanently deleted. This action cannot be undone." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 justify-end pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteConfirmId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteConfirmId && deleteReport.mutate(deleteConfirmId), disabled: deleteReport.isPending, children: deleteReport.isPending ? "Deleting…" : "Delete" })
      ] })
    ] }) })
  ] });
}
export {
  ReportBuilderPage as default
};
