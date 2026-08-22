import { b as useAppStore, a as useToast, c as useQueryClient, r as reactExports, m as useQuery, S as useMutation, j as jsxRuntimeExports, B as Building2, L as Label, d as Button, T as Plus, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, I as Input, N as DialogMutationError, J as DialogFooter } from "./index-DDEt41_d.js";
import { A as AppLayout, I as Info, s as AlertDialog, t as AlertDialogContent, v as AlertDialogHeader, w as AlertDialogTitle, x as AlertDialogDescription, y as AlertDialogFooter, z as AlertDialogCancel, D as AlertDialogAction } from "./AppLayout-COowmufl.js";
import { T as Textarea } from "./textarea-DnUrrtEV.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-b3ECnASR.js";
import { a as apiUrl } from "./api-Dhdsf4oM.js";
import { d as downloadCsvFile } from "./csv-BwoSy5Nc.js";
import { T as TriangleAlert } from "./triangle-alert-CLb5T2b5.js";
import { P as PoundSterling } from "./shield-alert-HU64hf1o.js";
import { D as Download } from "./download-BZqFZM7_.js";
import { P as Pencil } from "./pencil-DQjoknt5.js";
import { T as Trash2 } from "./trash-2-C9jEYpF7.js";
import { P as Printer } from "./printer-CKTlJsy3.js";
import "./use-safe-clerk-B63DoyIA.js";
import "./database-Cg8AYSNP.js";
import "./shield-check-Dq1P0HFE.js";
import "./tractor-EimxJ_d6.js";
import "./index-C6jhWaUq.js";
import "./index-DSSNAgNh.js";
import "./chevron-up-CKDnN7Hi.js";
const THIS_YEAR = (/* @__PURE__ */ new Date()).getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => THIS_YEAR - i);
const QUARTERS = [1, 2, 3, 4];
const TYPE_BADGE = {
  levy: { label: "Statutory Levy", className: "bg-red-100 text-red-800" },
  statutory: { label: "Statutory Scheme", className: "bg-amber-100 text-amber-800" },
  membership: { label: "Voluntary Membership", className: "bg-blue-100 text-blue-800" },
  assurance: { label: "Assurance Scheme", className: "bg-green-100 text-green-800" }
};
function formatPounds(pence) {
  return (pence / 100).toLocaleString("en-GB", { style: "currency", currency: "GBP" });
}
function TradeBodiesPage() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = reactExports.useState("overview");
  const [year, setYear] = reactExports.useState(THIS_YEAR);
  const [filterBody, setFilterBody] = reactExports.useState("");
  const [filterQuarter, setFilterQuarter] = reactExports.useState("");
  const [printBody, setPrintBody] = reactExports.useState("");
  const [printYear, setPrintYear] = reactExports.useState(THIS_YEAR);
  const [showRecordDialog, setShowRecordDialog] = reactExports.useState(false);
  const [editingRecord, setEditingRecord] = reactExports.useState(null);
  const [recBody, setRecBody] = reactExports.useState("");
  const [recYear, setRecYear] = reactExports.useState(String(THIS_YEAR));
  const [recQuarter, setRecQuarter] = reactExports.useState("");
  const [recCategory, setRecCategory] = reactExports.useState("");
  const [recQuantity, setRecQuantity] = reactExports.useState("");
  const [recCustomRate, setRecCustomRate] = reactExports.useState("");
  const [recNotes, setRecNotes] = reactExports.useState("");
  const [showMemberDialog, setShowMemberDialog] = reactExports.useState(false);
  const [editingMemberBody, setEditingMemberBody] = reactExports.useState("");
  const [memNumber, setMemNumber] = reactExports.useState("");
  const [memSince, setMemSince] = reactExports.useState("");
  const [memNotes, setMemNotes] = reactExports.useState("");
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const bodiesQ = useQuery({
    queryKey: ["trade-bodies-config", farmId],
    queryFn: () => fetch(apiUrl(`/farms/${farmId}/trade-levies/bodies`)).then((r) => r.json()),
    enabled: !!farmId
  });
  const bodies = bodiesQ.data?.bodies ?? [];
  const registrationsQ = useQuery({
    queryKey: ["trade-body-registrations", farmId],
    queryFn: () => fetch(apiUrl(`/farms/${farmId}/trade-levies/registrations`)).then((r) => r.json()),
    enabled: !!farmId
  });
  const registrations = registrationsQ.data?.registrations ?? [];
  const regByBody = reactExports.useMemo(
    () => Object.fromEntries(registrations.map((r) => [r.body, r])),
    [registrations]
  );
  const recordsQ = useQuery({
    queryKey: ["trade-body-records", farmId, filterBody, year, filterQuarter],
    queryFn: () => {
      const params = new URLSearchParams({ year: String(year) });
      if (filterBody) params.set("body", filterBody);
      if (filterQuarter) params.set("quarter", filterQuarter);
      return fetch(apiUrl(`/farms/${farmId}/trade-levies/records?${params}`)).then((r) => r.json());
    },
    enabled: !!farmId
  });
  const records = recordsQ.data?.records ?? [];
  const summaryQ = useQuery({
    queryKey: ["trade-body-summary", farmId, year],
    queryFn: () => fetch(apiUrl(`/farms/${farmId}/trade-levies/summary?year=${year}`)).then((r) => r.json()),
    enabled: !!farmId && activeTab === "overview"
  });
  const selectedBodyCfg = reactExports.useMemo(
    () => bodies.find((b) => b.body === recBody) ?? null,
    [bodies, recBody]
  );
  const categoryOptions = reactExports.useMemo(
    () => selectedBodyCfg?.categories ?? [],
    [selectedBodyCfg]
  );
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
        notes: recNotes || null
      };
      const url = editingRecord ? apiUrl(`/farms/${farmId}/trade-levies/records/${editingRecord.id}`) : apiUrl(`/farms/${farmId}/trade-levies/records`);
      const res = await fetch(url, {
        method: editingRecord ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trade-body-records"] });
      qc.invalidateQueries({ queryKey: ["trade-body-summary"] });
      setShowRecordDialog(false);
      toast({ title: editingRecord ? "Record updated" : "Record added" });
    }
  });
  const deleteRecordMut = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(apiUrl(`/farms/${farmId}/trade-levies/records/${id}`), { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trade-body-records"] });
      qc.invalidateQueries({ queryKey: ["trade-body-summary"] });
      setDeleteId(null);
      toast({ title: "Record deleted" });
    }
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
            notes: memNotes || null
          })
        }
      );
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trade-body-registrations"] });
      setShowMemberDialog(false);
      toast({ title: "Membership details saved" });
    }
  });
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
  function openEditRecord(r) {
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
  function openMemberDialog(body) {
    const reg = regByBody[body];
    setEditingMemberBody(body);
    setMemNumber(reg?.membership_number ?? "");
    setMemSince(reg?.registered_since ?? "");
    setMemNotes(reg?.notes ?? "");
    saveMemberMut.reset();
    setShowMemberDialog(true);
  }
  function exportCsv() {
    const header = ["Body", "Year", "Quarter", "Category", "Quantity", "Unit", "Rate (£)", "Amount (£)", "Notes"];
    const rows = records.map((r) => {
      const cfg = bodies.find((b) => b.body === r.body);
      const catCfg = cfg?.categories.find((c) => c.key === r.category);
      const rate = r.custom_rate_pence !== null ? Number(r.custom_rate_pence) / 100 : (catCfg?.ratePence ?? 0) / 100;
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
        r.notes ?? ""
      ];
    });
    downloadCsvFile(`trade-body-records-${year}.csv`, [header, ...rows]);
  }
  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "records", label: "Records" },
    { key: "memberships", label: "Memberships" },
    { key: "print", label: "Print Return" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-7xl mx-auto space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl font-bold flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-6 h-6 text-primary" }),
            "Trade Body Levies & Subscriptions"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Track statutory levies, membership contributions, and assurance scheme fees for all trade bodies." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Year" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(year), onValueChange: (v) => setYear(Number(v)), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: YEARS.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(y), children: y }, y)) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b flex gap-0", children: tabs.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setActiveTab(t.key),
          className: `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`,
          children: t.label
        },
        t.key
      )) }),
      activeTab === "overview" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4", children: bodies.map((cfg) => {
          const total = summaryQ.data?.totalsPerBody?.[cfg.body] ?? 0;
          const reg = regByBody[cfg.body];
          const badge = TYPE_BADGE[cfg.type];
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-4 space-y-2 bg-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm", children: cfg.shortLabel }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground line-clamp-2", children: [
                  cfg.description.split(".")[0],
                  "."
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${badge.className}`, children: badge.label })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end justify-between pt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: reg?.membership_number ? `Ref: ${reg.membership_number}` : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-amber-600 flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3 h-3" }),
                " No membership number"
              ] }) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                  year,
                  " total"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold text-primary", children: formatPounds(total) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  className: "text-xs h-7",
                  onClick: () => {
                    setFilterBody(cfg.body);
                    setActiveTab("records");
                  },
                  children: "View Records"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  className: "text-xs h-7",
                  onClick: () => openMemberDialog(cfg.body),
                  children: "Edit Membership"
                }
              )
            ] })
          ] }, cfg.body);
        }) }),
        summaryQ.data && summaryQ.data.rows.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-semibold mb-3", children: [
            year,
            " — Detailed Breakdown"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left p-3 font-medium", children: "Body" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left p-3 font-medium", children: "Category" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right p-3 font-medium", children: "Total Qty" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left p-3 font-medium", children: "Unit" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right p-3 font-medium", children: "Rate" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right p-3 font-medium", children: "Amount" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: summaryQ.data.rows.map((row, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3 font-medium", children: row.bodyLabel }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3", children: row.category }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3 text-right", children: row.totalQuantity.toLocaleString("en-GB", { maximumFractionDigits: 3 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3", children: row.unit }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-3 text-right text-muted-foreground", children: [
                formatPounds(row.ratePence),
                row.usedIndicativeRate && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-amber-600 ml-1", children: "(indicative)" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3 text-right font-medium", children: formatPounds(row.totalPence) })
            ] }, i)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { className: "border-t bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { colSpan: 5, className: "p-3 font-semibold", children: [
                "Grand Total ",
                year
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3 text-right font-bold text-primary", children: formatPounds(Object.values(summaryQ.data.totalsPerBody).reduce((a, b) => a + b, 0)) })
            ] }) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-2 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3 h-3 text-amber-500" }),
            'Rows marked "indicative" use published rate schedules where no custom rate was entered. Always verify figures with each body directly.'
          ] })
        ] }),
        !summaryQ.isLoading && (!summaryQ.data || summaryQ.data.rows.length === 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-8 text-center text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PoundSterling, { className: "w-8 h-8 mx-auto mb-2 opacity-30" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
            "No records entered for ",
            year,
            "."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1", children: "Switch to the Records tab to start adding levy or subscription entries." })
        ] })
      ] }),
      activeTab === "records" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterBody, onValueChange: setFilterBody, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-48", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All bodies" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "", children: "All bodies" }),
              bodies.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: b.body, children: b.shortLabel }, b.body))
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterQuarter, onValueChange: setFilterQuarter, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-36", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All periods" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "", children: "All periods" }),
              QUARTERS.map((q) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(q), children: [
                "Q",
                q
              ] }, q))
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: exportCsv, disabled: records.length === 0, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4 mr-1" }),
              " Export CSV"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAddRecord, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
              " Add Record"
            ] })
          ] })
        ] }),
        records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-8 text-center text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PoundSterling, { className: "w-8 h-8 mx-auto mb-2 opacity-30" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "No records match the selected filters." })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left p-3 font-medium", children: "Body" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left p-3 font-medium", children: "Period" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left p-3 font-medium", children: "Category" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right p-3 font-medium", children: "Quantity" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left p-3 font-medium", children: "Unit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right p-3 font-medium", children: "Rate" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right p-3 font-medium", children: "Amount" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: records.map((r) => {
            const cfg = bodies.find((b) => b.body === r.body);
            const catCfg = cfg?.categories.find((c) => c.key === r.category);
            const rate = r.custom_rate_pence !== null ? Number(r.custom_rate_pence) : catCfg?.ratePence ?? 0;
            const amount = Number(r.quantity) * rate;
            const isIndicative = r.custom_rate_pence === null && catCfg?.ratePence !== null;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t hover:bg-muted/20", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3 font-medium", children: cfg?.shortLabel ?? r.body }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-3 text-muted-foreground", children: [
                r.period_year,
                r.period_quarter ? ` Q${r.period_quarter}` : " (Annual)"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3", children: r.category }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3 text-right", children: Number(r.quantity).toLocaleString("en-GB", { maximumFractionDigits: 3 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3", children: r.unit }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-3 text-right text-muted-foreground", children: [
                formatPounds(rate),
                isIndicative && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-amber-600 ml-1", children: "ind." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3 text-right font-medium", children: formatPounds(amount) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 justify-end", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "icon",
                    className: "h-7 w-7",
                    onClick: () => openEditRecord(r),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "icon",
                    className: "h-7 w-7 text-destructive",
                    onClick: () => setDeleteId(r.id),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" })
                  }
                )
              ] }) })
            ] }, r.id);
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { className: "border-t bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "p-3 font-semibold", children: "Total shown" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3 text-right font-bold text-primary", children: formatPounds(
              records.reduce((sum, r) => {
                const cfg = bodies.find((b) => b.body === r.body);
                const catCfg = cfg?.categories.find((c) => c.key === r.category);
                const rate = r.custom_rate_pence !== null ? Number(r.custom_rate_pence) : catCfg?.ratePence ?? 0;
                return sum + Number(r.quantity) * rate;
              }, 0)
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", {})
          ] }) })
        ] }) })
      ] }),
      activeTab === "memberships" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Record your membership or registration number for each trade body. These details appear on printed returns." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: bodies.map((cfg) => {
          const reg = regByBody[cfg.body];
          const badge = TYPE_BADGE[cfg.type];
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-4 flex items-center gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm", children: cfg.label }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[10px] font-medium px-2 py-0.5 rounded-full ${badge.className}`, children: badge.label })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5 truncate", children: cfg.website }),
              reg?.membership_number && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs mt-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Membership No: " }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: reg.membership_number })
              ] }),
              reg?.registered_since && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                "Member since ",
                new Date(reg.registered_since).toLocaleDateString("en-GB")
              ] }),
              !reg?.membership_number && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-600 flex items-center gap-1 mt-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3 h-3" }),
                "No membership number recorded"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => openMemberDialog(cfg.body), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5 mr-1" }),
              "Edit"
            ] })
          ] }, cfg.body);
        }) })
      ] }),
      activeTab === "print" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 max-w-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Generate a printable levy or subscription return for any trade body and year." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 border rounded-lg p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Trade Body" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: printBody, onValueChange: setPrintBody, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select body…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: bodies.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: b.body, children: b.label }, b.body)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Year" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(printYear), onValueChange: (v) => setPrintYear(Number(v)), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: YEARS.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(y), children: y }, y)) })
            ] })
          ] }),
          printBody && bodies.find((b) => b.body === printBody) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/40 rounded p-3 text-xs text-muted-foreground flex items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-3.5 h-3.5 mt-0.5 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: bodies.find((b) => b.body === printBody)?.disclaimer })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              disabled: !printBody,
              onClick: () => {
                window.open(
                  apiUrl(`/farms/${farmId}/trade-levies/return.html?body=${printBody}&year=${printYear}`),
                  "_blank"
                );
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4 mr-2" }),
                "Open Print Return"
              ]
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Dialog,
      {
        open: showRecordDialog,
        onOpenChange: (open) => {
          if (!open) {
            setShowRecordDialog(false);
            saveRecordMut.reset();
          }
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingRecord ? "Edit Record" : "Add Record" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Trade Body" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: recBody, onValueChange: (v) => {
                setRecBody(v);
                setRecCategory("");
                setRecCustomRate("");
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select body…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: bodies.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: b.body, children: b.label }, b.body)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Year" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: recYear, onValueChange: setRecYear, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: YEARS.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(y), children: y }, y)) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                  "Quarter ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "(optional)" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: recQuarter, onValueChange: setRecQuarter, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Annual" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "", children: "Annual" }),
                    QUARTERS.map((q) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(q), children: [
                      "Q",
                      q
                    ] }, q))
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Category" }),
              categoryOptions.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: recCategory, onValueChange: (v) => {
                setRecCategory(v);
                setRecCustomRate("");
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select category…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: categoryOptions.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.key, children: c.key }, c.key)) })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: recCategory,
                  onChange: (e) => setRecCategory(e.target.value),
                  placeholder: "Select a body first",
                  disabled: !recBody
                }
              )
            ] }),
            recCategory && categoryOptions.find((c) => c.key === recCategory)?.note && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/40 rounded p-3 text-xs text-muted-foreground flex items-start gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-3.5 h-3.5 mt-0.5 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: categoryOptions.find((c) => c.key === recCategory)?.note })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                  "Quantity",
                  recCategory && categoryOptions.find((c) => c.key === recCategory) && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground text-xs ml-1", children: [
                    "(",
                    categoryOptions.find((c) => c.key === recCategory)?.unit,
                    ")"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: "number",
                    min: 0,
                    step: "any",
                    value: recQuantity,
                    onChange: (e) => setRecQuantity(e.target.value),
                    placeholder: "0"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: (() => {
                  const catCfg = categoryOptions.find((c) => c.key === recCategory);
                  return catCfg?.ratePence !== null && catCfg?.ratePence !== void 0 ? "Custom Rate (p) — override" : "Rate (pence) — required";
                })() }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: "number",
                    min: 0,
                    step: "any",
                    value: recCustomRate,
                    onChange: (e) => setRecCustomRate(e.target.value),
                    placeholder: (() => {
                      const catCfg = categoryOptions.find((c) => c.key === recCategory);
                      return catCfg?.ratePence !== null && catCfg?.ratePence !== void 0 ? `${catCfg.ratePence} (indicative)` : "Enter rate in pence";
                    })()
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                "Notes ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "(optional)" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  value: recNotes,
                  onChange: (e) => setRecNotes(e.target.value),
                  rows: 2,
                  placeholder: "e.g. Quarter 1 wheat levy, membership renewal…"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveRecordMut })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                onClick: () => {
                  setShowRecordDialog(false);
                  saveRecordMut.reset();
                },
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                onClick: () => saveRecordMut.mutate(),
                disabled: saveRecordMut.isPending || !recBody || !recCategory || !recQuantity,
                children: saveRecordMut.isPending ? "Saving…" : editingRecord ? "Save Changes" : "Add Record"
              }
            )
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Dialog,
      {
        open: showMemberDialog,
        onOpenChange: (open) => {
          if (!open) {
            setShowMemberDialog(false);
            saveMemberMut.reset();
          }
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
            "Membership Details — ",
            bodies.find((b) => b.body === editingMemberBody)?.shortLabel
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Membership / Reference Number" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: memNumber,
                  onChange: (e) => setMemNumber(e.target.value),
                  placeholder: "e.g. NFU12345, BW-001234…"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Member / Registered Since" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "date",
                  value: memSince,
                  onChange: (e) => setMemSince(e.target.value)
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                "Notes ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "(optional)" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  value: memNotes,
                  onChange: (e) => setMemNotes(e.target.value),
                  rows: 2,
                  placeholder: "e.g. Renewal due April, contact details…"
                }
              )
            ] }),
            editingMemberBody && bodies.find((b) => b.body === editingMemberBody) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/40 rounded p-3 text-xs text-muted-foreground flex items-start gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-3.5 h-3.5 mt-0.5 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: bodies.find((b) => b.body === editingMemberBody)?.disclaimer })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveMemberMut })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                onClick: () => {
                  setShowMemberDialog(false);
                  saveMemberMut.reset();
                },
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveMemberMut.mutate(), disabled: saveMemberMut.isPending, children: saveMemberMut.isPending ? "Saving…" : "Save Details" })
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: deleteId !== null, onOpenChange: (open) => {
      if (!open) setDeleteId(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete this record?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "This action cannot be undone." })
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
    ] }) })
  ] });
}
export {
  TradeBodiesPage as default
};
