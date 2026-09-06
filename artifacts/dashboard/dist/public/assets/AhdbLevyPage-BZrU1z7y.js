import { b as useAppStore, c as useQueryClient, a as useToast, r as reactExports, m as useQuery, S as useMutation, j as jsxRuntimeExports, L as Label, d as Button, T as Plus, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, I as Input, N as DialogMutationError, J as DialogFooter } from "./index-UT9am3Zj.js";
import { A as AppLayout, I as Info, s as AlertDialog, t as AlertDialogContent, v as AlertDialogHeader, w as AlertDialogTitle, x as AlertDialogDescription, y as AlertDialogFooter, z as AlertDialogCancel, D as AlertDialogAction } from "./AppLayout-B4he06xL.js";
import { T as Textarea } from "./textarea-C2zbp5_I.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CW6IgBfs.js";
import { a as apiUrl } from "./api-Dhdsf4oM.js";
import { d as downloadCsvFile } from "./csv-WN8MS5nh.js";
import { P as PoundSterling } from "./shield-alert-_kqco1GL.js";
import { T as TriangleAlert } from "./triangle-alert-C-4qGTc8.js";
import { D as Download } from "./download-CPCgOQIc.js";
import { P as Pencil } from "./pencil-BnJAcS9H.js";
import { T as Trash2 } from "./trash-2-VnOjjuhr.js";
import { P as Printer } from "./printer-CLKVjPTx.js";
import "./use-safe-clerk-B26Y9vRo.js";
import "./database-BAhRjlAr.js";
import "./shield-check-X07IgAvu.js";
import "./tractor-CfVYq1Qv.js";
import "./index-DXFNcNie.js";
import "./index-eToXocd5.js";
import "./chevron-up-cX-kvqyo.js";
const SECTORS = [
  { key: "cereals", label: "Cereals & Oilseeds" },
  { key: "beef_lamb", label: "Beef & Lamb" },
  { key: "dairy", label: "Dairy" },
  { key: "pork", label: "Pork" },
  { key: "horticulture", label: "Horticulture" },
  { key: "potatoes", label: "Potatoes" }
];
const QUARTERS = [
  { value: "1", label: "Q1 (Jan–Mar)" },
  { value: "2", label: "Q2 (Apr–Jun)" },
  { value: "3", label: "Q3 (Jul–Sep)" },
  { value: "4", label: "Q4 (Oct–Dec)" }
];
const CURRENT_YEAR = (/* @__PURE__ */ new Date()).getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i);
const fmt = (pence) => `£${(pence / 100).toFixed(2)}`;
const fmtQty = (q, unit) => {
  const n = typeof q === "string" ? parseFloat(q) : q;
  const digits = unit === "head" ? 0 : 3;
  return `${n.toFixed(digits)} ${unit}`;
};
const shortUnit = (unit) => unit.replace("thousand ", "k ").replace("£1,000 sales value", "£k sales");
const blankForm = () => ({
  sector: "cereals",
  period_year: CURRENT_YEAR,
  period_quarter: 1,
  commodity: "",
  quantity: "",
  unit: "",
  custom_rate_pence: "",
  notes: ""
});
function AhdbLevyPage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [tab, setTab] = reactExports.useState("overview");
  const [overviewYear, setOverviewYear] = reactExports.useState(CURRENT_YEAR);
  const [recYear, setRecYear] = reactExports.useState(CURRENT_YEAR);
  const [recQuarter, setRecQuarter] = reactExports.useState("");
  const [recSector, setRecSector] = reactExports.useState("");
  const [recOpen, setRecOpen] = reactExports.useState(false);
  const [recForm, setRecForm] = reactExports.useState(blankForm());
  const [editRecordId, setEditRecordId] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [regOpen, setRegOpen] = reactExports.useState(false);
  const [regSector, setRegSector] = reactExports.useState("");
  const [regForm, setRegForm] = reactExports.useState({ membership_number: "", registered_since: "", notes: "" });
  const [printYear, setPrintYear] = reactExports.useState(CURRENT_YEAR);
  const [printQuarter, setPrintQuarter] = reactExports.useState("");
  const ratesQ = useQuery({
    queryKey: ["ahdb-rates", farmId],
    enabled: !!farmId,
    staleTime: 60 * 60 * 1e3,
    queryFn: async () => {
      const res = await fetch(apiUrl(`/api/farms/${farmId}/ahdb/rates`));
      if (!res.ok) throw new Error("Failed to load levy rates");
      return res.json();
    }
  });
  const summaryQ = useQuery({
    queryKey: ["ahdb-summary", farmId, overviewYear],
    enabled: !!farmId,
    queryFn: async () => {
      const res = await fetch(apiUrl(`/api/farms/${farmId}/ahdb/summary?year=${overviewYear}`));
      if (!res.ok) throw new Error("Failed to load summary");
      return res.json();
    }
  });
  const recordsQ = useQuery({
    queryKey: ["ahdb-records", farmId, recYear, recQuarter, recSector],
    enabled: !!farmId,
    queryFn: async () => {
      const p = new URLSearchParams({ year: String(recYear) });
      if (recQuarter) p.set("quarter", recQuarter);
      if (recSector) p.set("sector", recSector);
      const res = await fetch(apiUrl(`/api/farms/${farmId}/ahdb/records?${p}`));
      if (!res.ok) throw new Error("Failed to load records");
      return res.json();
    }
  });
  const regsQ = useQuery({
    queryKey: ["ahdb-registrations", farmId],
    enabled: !!farmId,
    queryFn: async () => {
      const res = await fetch(apiUrl(`/api/farms/${farmId}/ahdb/registrations`));
      if (!res.ok) throw new Error("Failed to load registrations");
      return res.json();
    }
  });
  const saveRecordMut = useMutation({
    mutationFn: async (body) => {
      const url = editRecordId ? apiUrl(`/api/farms/${farmId}/ahdb/records/${editRecordId}`) : apiUrl(`/api/farms/${farmId}/ahdb/records`);
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
          notes: body.notes || null
        })
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
    }
  });
  const deleteRecordMut = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(apiUrl(`/api/farms/${farmId}/ahdb/records/${id}`), { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ahdb-records", farmId] });
      qc.invalidateQueries({ queryKey: ["ahdb-summary", farmId] });
      toast({ title: "Record deleted" });
      setDeleteId(null);
    },
    onError: (e) => toast({ variant: "destructive", title: "Failed to delete", description: e.message })
  });
  const saveRegMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(apiUrl(`/api/farms/${farmId}/ahdb/registrations/${regSector}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          membershipNumber: regForm.membership_number || null,
          registeredSince: regForm.registered_since || null,
          notes: regForm.notes || null
        })
      });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ahdb-registrations", farmId] });
      toast({ title: "Registration saved" });
      setRegOpen(false);
    }
  });
  const summaryBySector = reactExports.useMemo(() => {
    const m = {};
    (summaryQ.data?.summary ?? []).forEach((r) => {
      if (!m[r.sector]) m[r.sector] = { levyPence: 0, count: 0 };
      m[r.sector].levyPence += r.levyPence;
      m[r.sector].count++;
    });
    return m;
  }, [summaryQ.data]);
  const commodityOptions = reactExports.useMemo(() => {
    return (ratesQ.data?.rates[recForm.sector] ?? []).map((r) => ({
      commodity: r.commodity,
      unit: r.unit,
      note: r.note
    }));
  }, [ratesQ.data, recForm.sector]);
  const regMap = reactExports.useMemo(() => {
    const m = {};
    (regsQ.data?.registrations ?? []).forEach((r) => {
      m[r.sector] = r;
    });
    return m;
  }, [regsQ.data]);
  const openAddRecord = () => {
    setEditRecordId(null);
    setRecForm(blankForm());
    saveRecordMut.reset();
    setRecOpen(true);
  };
  const openEditRecord = (r) => {
    setEditRecordId(r.id);
    setRecForm({
      sector: r.sector,
      period_year: r.period_year,
      period_quarter: r.period_quarter,
      commodity: r.commodity,
      quantity: parseFloat(r.quantity).toString(),
      unit: r.unit,
      custom_rate_pence: r.custom_rate_pence ?? "",
      notes: r.notes ?? ""
    });
    saveRecordMut.reset();
    setRecOpen(true);
  };
  const openEditReg = (sector) => {
    const existing = regMap[sector];
    setRegSector(sector);
    setRegForm({
      membership_number: existing?.membership_number ?? "",
      registered_since: existing?.registered_since?.slice(0, 10) ?? "",
      notes: existing?.notes ?? ""
    });
    saveRegMut.reset();
    setRegOpen(true);
  };
  const handlePrint = () => {
    const p = new URLSearchParams({ year: String(printYear) });
    if (printQuarter) p.set("quarter", printQuarter);
    const url = apiUrl(`/api/farms/${farmId}/ahdb/return.html?${p}`);
    fetch(url).then((res) => res.text()).then((html) => {
      const win = window.open("", "_blank", "width=900,height=700");
      if (!win) {
        toast({ variant: "destructive", title: "Allow popups to print the return" });
        return;
      }
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => {
        win.print();
      }, 600);
    }).catch(() => toast({ variant: "destructive", title: "Failed to generate return" }));
  };
  const handleDownloadCsv = () => {
    const records = recordsQ.data?.records ?? [];
    if (!records.length) {
      toast({ title: "No records to download" });
      return;
    }
    const sectorLabels = ratesQ.data?.sectorLabels ?? {};
    const header = ["Sector", "Year", "Quarter", "Commodity", "Quantity", "Unit", "Rate (p/unit)", "Levy (£)", "Notes"];
    const rows = [header];
    records.forEach((r) => {
      const ratePence = r.custom_rate_pence ? parseFloat(r.custom_rate_pence) : ratesQ.data?.rates[r.sector]?.find((x) => x.commodity === r.commodity)?.ratePence ?? 0;
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
        r.notes ?? ""
      ]);
    });
    downloadCsvFile(`ahdb-levy-${recYear}.csv`, rows);
  };
  if (!farmId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-12 text-center text-muted-foreground", children: "Select a farm to manage AHDB levy records." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-5xl mx-auto space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl font-bold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PoundSterling, { className: "h-6 w-6 text-green-700" }),
          "AHDB Levy Management"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Track levy-eligible quantities, calculate amounts owed, and generate return summaries for each AHDB sector." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-start rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 mt-0.5 shrink-0 text-amber-600" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Rates shown are indicative 2024/25 AHDB figures. Always verify the current rate schedule at",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://ahdb.org.uk/levy", target: "_blank", rel: "noreferrer", className: "underline font-medium", children: "ahdb.org.uk/levy" }),
          " ",
          "before submitting official returns. Individual records support custom rate overrides."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex border-b", children: ["overview", "records", "registrations", "print"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setTab(t),
          className: `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? "border-green-700 text-green-700" : "border-transparent text-muted-foreground hover:text-foreground"}`,
          children: t === "print" ? "Print Return" : t.charAt(0).toUpperCase() + t.slice(1)
        },
        t
      )) }),
      tab === "overview" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "shrink-0 text-sm", children: "Year" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(overviewYear), onValueChange: (v) => setOverviewYear(Number(v)), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: YEARS.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(y), children: y }, y)) })
          ] }),
          summaryQ.isFetching && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Loading…" })
        ] }),
        (summaryQ.data?.summary.length ?? 0) === 0 && !summaryQ.isFetching ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-dashed p-14 text-center text-sm text-muted-foreground", children: [
          "No levy records for ",
          overviewYear,
          ".",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "text-green-700 underline",
              onClick: () => {
                setTab("records");
                openAddRecord();
              },
              children: "Add your first record."
            }
          )
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: SECTORS.map(({ key, label }) => {
            const s = summaryBySector[key];
            if (!s) return null;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-card p-4 space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-green-700", children: fmt(s.levyPence) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
                s.count,
                " commodity line",
                s.count !== 1 ? "s" : ""
              ] })
            ] }, key);
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border-2 border-green-700 bg-green-50 px-6 py-3 text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-semibold text-green-700 uppercase tracking-wide", children: [
              "Total levy ",
              overviewYear
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-bold text-green-700", children: fmt(summaryQ.data?.totalLevyPence ?? 0) })
          ] }) })
        ] })
      ] }),
      tab === "records" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 items-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Year" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(recYear), onValueChange: (v) => setRecYear(Number(v)), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: YEARS.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(y), children: y }, y)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Quarter" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: recQuarter || "all", onValueChange: (v) => setRecQuarter(v === "all" ? "" : v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-36", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All quarters" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All quarters" }),
                QUARTERS.map((q) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: q.value, children: q.label }, q.value))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Sector" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: recSector || "all", onValueChange: (v) => setRecSector(v === "all" ? "" : v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All sectors" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All sectors" }),
                SECTORS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.key, children: s.label }, s.key))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: handleDownloadCsv, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4 mr-1" }),
              " CSV"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAddRecord, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
              " Add Record"
            ] })
          ] })
        ] }),
        (recordsQ.data?.records.length ?? 0) === 0 && !recordsQ.isFetching ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground", children: "No records match these filters." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "border-b bg-muted/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-medium text-muted-foreground", children: "Sector" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-medium text-muted-foreground", children: "Period" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-medium text-muted-foreground", children: "Commodity" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-3 py-2 font-medium text-muted-foreground", children: "Quantity" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-3 py-2 font-medium text-muted-foreground", children: "Rate" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-3 py-2 font-medium text-muted-foreground", children: "Levy" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: (recordsQ.data?.records ?? []).map((r) => {
            const ratePence = r.custom_rate_pence ? parseFloat(r.custom_rate_pence) : ratesQ.data?.rates[r.sector]?.find((x) => x.commodity === r.commodity)?.ratePence ?? 0;
            const levyPence = Math.round(parseFloat(r.quantity) * ratePence);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/20", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 whitespace-nowrap", children: ratesQ.data?.sectorLabels[r.sector] ?? r.sector }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 text-muted-foreground whitespace-nowrap", children: [
                "Q",
                r.period_quarter,
                " ",
                r.period_year
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2", children: [
                r.commodity,
                r.custom_rate_pence && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-xs text-amber-600", children: "(custom rate)" }),
                r.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground truncate max-w-[160px]", children: r.notes })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right tabular-nums whitespace-nowrap", children: fmtQty(r.quantity, r.unit) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 text-right tabular-nums text-muted-foreground whitespace-nowrap", children: [
                fmt(ratePence),
                "/",
                shortUnit(r.unit)
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right tabular-nums font-semibold text-green-700 whitespace-nowrap", children: fmt(levyPence) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 justify-end", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "icon",
                    variant: "ghost",
                    className: "h-7 w-7",
                    onClick: () => openEditRecord(r),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "icon",
                    variant: "ghost",
                    className: "h-7 w-7 text-destructive hover:text-destructive",
                    onClick: () => setDeleteId(r.id),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" })
                  }
                )
              ] }) })
            ] }, r.id);
          }) })
        ] }) })
      ] }),
      tab === "registrations" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Store your AHDB levy/membership numbers for each sector. These appear on printed return summaries." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "border-b bg-muted/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-2 font-medium text-muted-foreground", children: "Sector" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-2 font-medium text-muted-foreground", children: "AHDB Levy Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-2 font-medium text-muted-foreground", children: "Registered Since" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-2 font-medium text-muted-foreground", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: SECTORS.map(({ key, label }) => {
            const reg = regMap[key];
            const isDisbanded = key === "potatoes";
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: `hover:bg-muted/20 ${isDisbanded ? "opacity-60" : ""}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 font-medium whitespace-nowrap", children: [
                label,
                isDisbanded && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-xs text-muted-foreground font-normal", children: "(levy disbanded 2022)" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: reg?.membership_number ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: reg.membership_number }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground whitespace-nowrap", children: reg?.registered_since ? new Date(reg.registered_since).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric"
              }) : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground max-w-[200px] truncate", children: reg?.notes ?? "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => openEditReg(key), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5 mr-1" }),
                " Edit"
              ] }) })
            ] }, key);
          }) })
        ] }) })
      ] }),
      tab === "print" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Generate a printable levy summary for a selected period. Use this as a management record or to cross-check against your official AHDB levy statement." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-card p-6 space-y-4 max-w-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Year" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(printYear), onValueChange: (v) => setPrintYear(Number(v)), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: YEARS.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(y), children: y }, y)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Quarter ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "(optional — leave blank for full year)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: printQuarter || "full", onValueChange: (v) => setPrintQuarter(v === "full" ? "" : v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Full year" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "full", children: "Full year" }),
                QUARTERS.map((q) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: q.value, children: q.label }, q.value))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "w-full bg-green-700 hover:bg-green-800", onClick: handlePrint, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-4 w-4 mr-2" }),
            "Open & Print Return"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-start rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 max-w-xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-4 w-4 mt-0.5 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "The return opens in a new window. Use your browser's Print function or Save as PDF to keep a copy. This document is a management record only and does not constitute an official AHDB return submission." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Dialog,
      {
        open: recOpen,
        onOpenChange: (o) => {
          if (!o) {
            setRecOpen(false);
            saveRecordMut.reset();
          }
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editRecordId ? "Edit Levy Record" : "Add Levy Record" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sector *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: recForm.sector,
                    onValueChange: (v) => setRecForm((f) => ({ ...f, sector: v, commodity: "", unit: "" })),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SECTORS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.key, children: s.label }, s.key)) })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Year *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: String(recForm.period_year),
                    onValueChange: (v) => setRecForm((f) => ({ ...f, period_year: Number(v) })),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: YEARS.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(y), children: y }, y)) })
                    ]
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quarter *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: String(recForm.period_quarter),
                  onValueChange: (v) => setRecForm((f) => ({ ...f, period_quarter: Number(v) })),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: QUARTERS.map((q) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: q.value, children: q.label }, q.value)) })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Commodity *" }),
              commodityOptions.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: recForm.commodity,
                    onValueChange: (v) => {
                      const opt = commodityOptions.find((o) => o.commodity === v);
                      setRecForm((f) => ({ ...f, commodity: v, unit: opt?.unit ?? f.unit }));
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select commodity" }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: commodityOptions.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.commodity, children: o.commodity }, o.commodity)) })
                    ]
                  }
                ),
                commodityOptions.find((o) => o.commodity === recForm.commodity)?.note && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: commodityOptions.find((o) => o.commodity === recForm.commodity)?.note })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: recForm.commodity,
                  onChange: (e) => setRecForm((f) => ({ ...f, commodity: e.target.value })),
                  placeholder: "Commodity name"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: "number",
                    step: "0.001",
                    min: "0",
                    value: recForm.quantity,
                    onChange: (e) => setRecForm((f) => ({ ...f, quantity: e.target.value })),
                    placeholder: "0.000"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Unit" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    value: recForm.unit,
                    onChange: (e) => setRecForm((f) => ({ ...f, unit: e.target.value })),
                    placeholder: "tonnes / head / etc."
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                "Custom rate (pence/unit)",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "— leave blank to use AHDB default" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  step: "0.01",
                  min: "0",
                  value: recForm.custom_rate_pence,
                  onChange: (e) => setRecForm((f) => ({ ...f, custom_rate_pence: e.target.value })),
                  placeholder: "e.g. 64 for 64p/tonne"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  rows: 2,
                  value: recForm.notes,
                  onChange: (e) => setRecForm((f) => ({ ...f, notes: e.target.value })),
                  placeholder: "Optional notes or source reference"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveRecordMut })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
              setRecOpen(false);
            }, children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                disabled: !recForm.commodity || !recForm.quantity || !recForm.unit || saveRecordMut.isPending,
                onClick: () => saveRecordMut.mutate(recForm),
                children: saveRecordMut.isPending ? "Saving…" : editRecordId ? "Save Changes" : "Add Record"
              }
            )
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) setDeleteId(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete this levy record?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "This record will be permanently removed and will no longer appear in levy calculations or return summaries." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          AlertDialogAction,
          {
            className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            onClick: () => deleteId !== null && deleteRecordMut.mutate(deleteId),
            children: "Delete"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Dialog,
      {
        open: regOpen,
        onOpenChange: (o) => {
          if (!o) {
            setRegOpen(false);
            saveRegMut.reset();
          }
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
            SECTORS.find((s) => s.key === regSector)?.label ?? regSector,
            " — AHDB Registration"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "AHDB Levy / Membership Number" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: regForm.membership_number,
                  onChange: (e) => setRegForm((f) => ({ ...f, membership_number: e.target.value })),
                  placeholder: "e.g. 123456789"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Registered Since" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "date",
                  value: regForm.registered_since,
                  onChange: (e) => setRegForm((f) => ({ ...f, registered_since: e.target.value }))
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  rows: 2,
                  value: regForm.notes,
                  onChange: (e) => setRegForm((f) => ({ ...f, notes: e.target.value })),
                  placeholder: "Optional notes"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveRegMut })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
              setRegOpen(false);
            }, children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: saveRegMut.isPending, onClick: () => saveRegMut.mutate(), children: saveRegMut.isPending ? "Saving…" : "Save" })
          ] })
        ] })
      }
    )
  ] });
}
export {
  AhdbLevyPage as default
};
