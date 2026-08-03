import { b as useAppStore, j as jsxRuntimeExports, a as useToast, t as useQueryClient, r as reactExports, l as useQuery, O as useMutation, I as Input, c as Button, S as Plus, o as Link, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, J as DialogFooter, $ as X, d as LoaderCircle } from "./index-R3VuZ4m_.js";
import { u as useLookupStrings } from "./use-lookup-tLv-QWeJ.js";
import { u as usePersistedTab } from "./use-persisted-tab-BIMw9tHL.js";
import { A as AppLayout, k as ShoppingBag, e as ChartColumn, Z as Zap, a as Wheat, T as TrendingUp } from "./AppLayout-CixSqt5V.js";
import { T as Textarea } from "./textarea-D7JCcopF.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, e as SelectGroup, f as SelectLabel } from "./select-BNM7psQU.js";
import { D as DialogMutationError } from "./dialog-error-D-D63NaI.js";
import { B as Badge } from "./badge-Bi0vs0q9.js";
import { T as TabBar, a as TabButton } from "./tab-button-Xcf6IOpJ.js";
import { F as FileText, P as PoundSterling } from "./shield-alert-Cjv2OHEt.js";
import { S as Search } from "./search-TIv6tTEs.js";
import { D as Download } from "./download-CRdDvgab.js";
import { E as ExternalLink } from "./external-link-BPmE0FWd.js";
import { T as Trash2 } from "./trash-2-B5_u4SNN.js";
import { E as Eye } from "./eye-d9KauOnE.js";
import { L as Link2 } from "./link-2-Be5CJfGX.js";
import { C as CircleCheck } from "./circle-check-C62COSG7.js";
import { P as Pencil } from "./pencil-BQyOBZYa.js";
import { A as ArrowRightLeft } from "./arrow-right-left-Bi7Wm9LS.js";
import { U as Upload } from "./upload-D2NnGFmD.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, L as Legend, B as Bar, C as Cell } from "./generateCategoricalChart-Sx4zuLlf.js";
import { B as BarChart } from "./BarChart-BbDEA4Qn.js";
import { C as CartesianGrid } from "./CartesianGrid-DyCDvZo2.js";
import { L as LineChart } from "./LineChart-C8iveZjG.js";
import { L as Line } from "./Line-wcoHv87F.js";
import { P as PieChart, a as Pie } from "./PieChart-SqWdXLz7.js";
import { T as TrendingDown } from "./trending-down-DWcLLdNj.js";
import "./use-safe-clerk-CR3cNHq7.js";
import "./database-D3oLt-b3.js";
import "./triangle-alert-DrL-5blr.js";
import "./shield-check-BFyTiufq.js";
import "./tractor-C4z8nTfO.js";
import "./index-BLzEiqjD.js";
import "./index-DXko3SCO.js";
import "./chevron-up-DQgAIiZ8.js";
const INCOME_CATEGORIES = [
  // Core agricultural sales
  "Crop Sales",
  "Livestock Sales",
  "Milk Sales",
  "Wool Sales",
  "Straw & Crop By-Product Sales",
  "Timber & Woodland Sales",
  // Subsidies & grants
  "Agri-Environment Scheme",
  "Grant / Subsidy",
  // Diversification & other enterprise
  "Diversification Income",
  "Shooting & Sporting Rights Income",
  "Property & Building Rental Income",
  "Renewable Energy Income",
  "Telecom Mast & Wayleave Income",
  "Contracting Income",
  // Receipts & other
  "Insurance Receipts & Compensation",
  "Machinery & Asset Disposal Income",
  "Interest Received",
  "Other Income"
];
const EXPENSE_CATEGORIES = [
  // Variable / production inputs
  "Seeds & Seed Treatments",
  "Fertiliser",
  "Pesticides & Herbicides",
  "Fungicides",
  "Insecticides",
  "Veterinary & Medicine",
  "Feed & Forage",
  "Feed & Bedding",
  "Haulage",
  "Electricity",
  "Contracting & Machinery Hire",
  // Fixed overheads — property & occupancy
  "Rent & Land Charges",
  "Buildings Repairs & Maintenance",
  "Water & Drainage",
  "Business Rates",
  // Fixed overheads — machinery & equipment
  "Fuel",
  "Fuel & Energy",
  "Machinery & Equipment",
  // Fixed overheads — people
  "Labour",
  "Training & Development",
  // Fixed overheads — professional & admin
  "Professional Fees & Accountancy",
  "Legal Costs",
  "Office & Administration",
  "Telephone & IT",
  "Subscriptions & Memberships",
  "Marketing & Advertising",
  // Fixed overheads — finance & insurance
  "Insurance Premiums",
  "Bank Charges & Loan Interest",
  "Hire Purchase & Leasing",
  // Catch-all
  "Other Expense"
];
[.../* @__PURE__ */ new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES])];
const SOURCE_CONFIG = {
  grain_sale: { label: "Grain Sales", bg: "#fef9c3", color: "#854d0e", border: "#fde68a" },
  livestock_deadweight: { label: "Deadweight Sale", bg: "#fee2e2", color: "#991b1b", border: "#fecaca" },
  livestock_mart: { label: "Mart Sale", bg: "#fff7ed", color: "#9a3412", border: "#fed7aa" },
  milk_statement: { label: "Milk Statement", bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  feed_delivery: { label: "Feed Delivery", bg: "#f0fdf4", color: "#166534", border: "#bbf7d0" },
  fuel_delivery: { label: "Fuel Delivery", bg: "#f5f3ff", color: "#6d28d9", border: "#ddd6fe" },
  seed_delivery: { label: "Seed Delivery", bg: "#ecfdf5", color: "#047857", border: "#a7f3d0" }
};
const PAYMENT_METHODS = ["Bank Transfer", "Direct Debit", "Cheque", "Cash", "Card", "BACS", "Other"];
const SPECIES_LIST = ["Cattle", "Sheep", "Pigs", "Goats", "Horses", "Deer", "Poultry", "Other"];
const UK_LIVESTOCK_MARKETS = [
  "Skipton Auction Mart",
  "Carlisle Borderway Mart",
  "Hexham & Northern Marts",
  "Longtown Auction Mart",
  "Penrith Auction Mart",
  "Kirkby Stephen Mart",
  "Appleby Mart",
  "Northallerton Livestock Market",
  "Malton Livestock Market",
  "Thirsk Auction Mart",
  "Otley Auction Mart",
  "Bakewell Livestock Market",
  "Newark Livestock Market",
  "Melton Mowbray Livestock Market",
  "Chelford Livestock Market",
  "Welshpool Livestock Sales",
  "Shrewsbury Auction Centre",
  "Hereford Livestock Market",
  "Oswestry Livestock Market",
  "Ludlow Livestock Market",
  "Exeter Livestock Centre",
  "Sedgemoor Auction Centre",
  "Holsworthy Livestock Market",
  "Hatherleigh Livestock Market",
  "Truro Livestock Market",
  "Frome Livestock Market",
  "Thame Livestock Market",
  "Banbury Livestock Market",
  "Stirling Agricultural Centre",
  "St Boswells Livestock Market",
  "Ayr Livestock Market",
  "Inverurie Mart",
  "Dingwall & Highland Marts",
  "Lairg Livestock Sales",
  "Builth Wells Livestock Sales",
  "Carmarthen Livestock Market",
  "Aberystwyth Livestock Market",
  "Ballymena Livestock Market",
  "Markethill Livestock Market",
  "Other"
];
const SPECIES_HERD_KEYWORDS = {
  "Cattle": ["cattle", "beef", "dairy", "suckler", "heifer", "cow", "bull", "bovine"],
  "Sheep": ["sheep", "flock", "ewe", "lamb", "ram", "ovine"],
  "Pigs": ["pig", "swine", "sow", "boar", "pork", "porcine"],
  "Goats": ["goat", "caprine", "nanny", "billy"],
  "Horses": ["horse", "equine", "pony", "mare", "stallion"],
  "Deer": ["deer", "stag", "cervine", "hind"],
  "Poultry": ["poultry", "chicken", "hen", "turkey", "duck", "goose", "broiler", "layer"],
  "Other": []
};
const PURCHASE_STATUS_CONFIG = {
  outstanding: { label: "Outstanding", bg: "#fef3c7", color: "#92400e" },
  overdue: { label: "Overdue", bg: "#fee2e2", color: "#991b1b" },
  paid: { label: "Paid", bg: "#dcfce7", color: "#166534" }
};
const CROP_CONTRACT_STATUSES = [
  { value: "pending", label: "Pending", bg: "#f3f4f6", color: "#374151" },
  { value: "active", label: "Active", bg: "#dcfce7", color: "#166534" },
  { value: "fulfilled", label: "Fulfilled", bg: "#eff6ff", color: "#1e40af" },
  { value: "cancelled", label: "Cancelled", bg: "#fee2e2", color: "#991b1b" },
  { value: "disputed", label: "Disputed", bg: "#fef3c7", color: "#92400e" }
];
const CURRENT_YEAR = (/* @__PURE__ */ new Date()).getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i);
const fmt = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const fmtAmt = (pence) => {
  if (pence == null) return "—";
  return `£${(pence / 100).toFixed(2)}`;
};
function TypeBadge({ type }) {
  if (type === "income") return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { style: { background: "#dcfce7", color: "#166534", border: "none", fontSize: "0.72rem" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { size: 10, className: "mr-1" }),
    "Income"
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { style: { background: "#fee2e2", color: "#991b1b", border: "none", fontSize: "0.72rem" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { size: 10, className: "mr-1" }),
    "Expense"
  ] });
}
function TransactionsTab({ farmId }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = reactExports.useState("");
  const [typeFilter, setTypeFilter] = reactExports.useState("all");
  const [sourceFilter, setSourceFilter] = reactExports.useState("all");
  const [yearFilter, setYearFilter] = reactExports.useState(String(CURRENT_YEAR));
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [exportOpen, setExportOpen] = reactExports.useState(false);
  const [exportStartDate, setExportStartDate] = reactExports.useState("");
  const [exportEndDate, setExportEndDate] = reactExports.useState("");
  const [exporting, setExporting] = reactExports.useState(false);
  const emptyForm = { transactionDate: "", transactionType: "expense", category: "", description: "", amountPence: "", vatAmountPence: "", vatRate: "", vendorCustomer: "", paymentMethod: "", reference: "", notes: "" };
  const [form, setForm] = reactExports.useState(emptyForm);
  const calcVat = (amount, rate) => {
    const a = parseFloat(amount);
    const r = parseFloat(rate);
    if (isNaN(a) || isNaN(r) || !rate) return "";
    return (a * r / 100).toFixed(2);
  };
  reactExports.useEffect(() => {
    if (form.vatRate) {
      setForm((f) => ({ ...f, vatAmountPence: calcVat(f.amountPence, f.vatRate) }));
    }
  }, [form.amountPence, form.vatRate]);
  const txQ = useQuery({
    queryKey: ["financial-transactions", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/financial-transactions`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["financial-transactions", farmId] });
  const createMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/financial-transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, amountPence: body.amountPence ? Math.round(parseFloat(body.amountPence) * 100) : 0, vatAmountPence: body.vatAmountPence ? Math.round(parseFloat(body.vatAmountPence) * 100) : null })
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Transaction saved" });
      invalidate();
      setAddOpen(false);
      setForm(emptyForm);
    },
    onError: () => toast({ title: "Failed to save transaction", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/financial-transactions/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Transaction deleted" });
      invalidate();
      setDeleteId(null);
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({ format: "xero-csv" });
      if (exportStartDate) params.set("startDate", new Date(exportStartDate).toISOString());
      if (exportEndDate) params.set("endDate", new Date(exportEndDate).toISOString());
      const res = await fetch(`/api/farms/${farmId}/financial-transactions/export?${params.toString()}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `financial-export-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setExportOpen(false);
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };
  const records = txQ.data ?? [];
  const autoCount = records.filter((r) => r.isAutoGenerated).length;
  const manualCount = records.filter((r) => !r.isAutoGenerated).length;
  const yearRecords = records.filter((r) => {
    if (yearFilter === "all") return true;
    const y = r.transactionDate ? new Date(r.transactionDate).getFullYear() : null;
    return String(y) === yearFilter;
  });
  const filtered = yearRecords.filter((r) => {
    if (typeFilter !== "all" && r.transactionType !== typeFilter) return false;
    if (sourceFilter === "manual" && r.isAutoGenerated) return false;
    if (sourceFilter === "auto" && !r.isAutoGenerated) return false;
    if (search) {
      const s = search.toLowerCase();
      return r.description?.toLowerCase().includes(s) || r.vendorCustomer?.toLowerCase().includes(s) || r.reference?.toLowerCase().includes(s) || r.category?.toLowerCase().includes(s) || r.sourceLabel?.toLowerCase().includes(s);
    }
    return true;
  });
  const totalIncome = yearRecords.filter((r) => r.transactionType === "income").reduce((s, r) => s + (r.amountPence ?? 0), 0);
  const totalExpense = yearRecords.filter((r) => r.transactionType === "expense").reduce((s, r) => s + (r.amountPence ?? 0), 0);
  const net = totalIncome - totalExpense;
  const autoIncome = yearRecords.filter((r) => r.isAutoGenerated && r.transactionType === "income").reduce((s, r) => s + (r.amountPence ?? 0), 0);
  const autoExpense = yearRecords.filter((r) => r.isAutoGenerated && r.transactionType === "expense").reduce((s, r) => s + (r.amountPence ?? 0), 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    autoCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 8, padding: "8px 14px", marginBottom: 14, display: "flex", gap: 8, alignItems: "center", fontSize: "0.8125rem", color: "#0369a1" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 14, style: { flexShrink: 0, color: "#0284c7" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
          autoCount,
          " transactions"
        ] }),
        " are auto-imported from other modules (",
        manualCount,
        " manual). Grain sales, livestock sales, feed deliveries and fuel deliveries are pulled in automatically."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: "1.25rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem 1.25rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }, children: "Total Income" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.5rem", fontWeight: 700, color: "#166534", marginBottom: 2 }, children: [
          "£",
          (totalIncome / 100).toFixed(2)
        ] }),
        autoIncome > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.7rem", color: "#16a34a" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 10, style: { display: "inline", marginRight: 2 } }),
          "£",
          (autoIncome / 100).toFixed(2),
          " auto-imported"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem 1.25rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }, children: "Total Expenses" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.5rem", fontWeight: 700, color: "#111827", marginBottom: 2 }, children: [
          "£",
          (totalExpense / 100).toFixed(2)
        ] }),
        autoExpense > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.7rem", color: "#6b7280" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 10, style: { display: "inline", marginRight: 2 } }),
          "£",
          (autoExpense / 100).toFixed(2),
          " auto-imported"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: `1px solid ${net >= 0 ? "#bbf7d0" : "#fecaca"}`, borderRadius: 10, padding: "1rem 1.25rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }, children: "Net Balance" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.5rem", fontWeight: 700, color: net >= 0 ? "#166534" : "#991b1b" }, children: [
          "£",
          (Math.abs(net) / 100).toFixed(2),
          net < 0 ? " deficit" : ""
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center", flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "relative", flex: 1, minWidth: 200 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 14, style: { position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search transactions...", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-8" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilter, onValueChange: setYearFilter, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { style: { width: 120 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Years" }),
          YEARS.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(y), children: y }, y))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: typeFilter, onValueChange: setTypeFilter, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { style: { width: 150 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Types" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "income", children: "Income only" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "expense", children: "Expenses only" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: sourceFilter, onValueChange: setSourceFilter, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { style: { width: 170 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Sources" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "manual", children: "Manual only" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "auto", children: "Auto-imported only" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setExportOpen(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 14, className: "mr-1" }),
        "Export to Xero"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        setForm(emptyForm);
        setAddOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
        "Add Transaction"
      ] })
    ] }),
    txQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 py-8 text-center", children: "Loading..." }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 1rem", textAlign: "center" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#f3f4f6", borderRadius: "50%", padding: "1rem", marginBottom: "1rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(PoundSterling, { size: 28, color: "#9ca3af" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151", marginBottom: 4 }, children: records.length === 0 ? "No transactions recorded" : "No transactions match your filters" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#9ca3af", maxWidth: 400 }, children: "Record income, expenses and purchases linked to deliveries and invoices." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Date", "Description", "Category", "Type", "Amount", "VAT", "Supplier / Customer", "Reference", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }, children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filtered.map((r, i) => {
        const srcCfg = r.isAutoGenerated ? SOURCE_CONFIG[r.source] : null;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none", background: r.isAutoGenerated ? "#fafeff" : void 0 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", whiteSpace: "nowrap", color: "#6b7280" }, children: fmt(r.transactionDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.625rem 0.875rem", fontWeight: 500, maxWidth: 220 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: r.description || "—" }),
            srcCfg && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 3, marginTop: 3, fontSize: "0.68rem", fontWeight: 600, background: srcCfg.bg, color: srcCfg.color, border: `1px solid ${srcCfg.border}`, borderRadius: 4, padding: "1px 6px" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 9 }),
              srcCfg.label
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }, children: r.category || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TypeBadge, { type: r.transactionType }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", fontWeight: 600, whiteSpace: "nowrap", color: r.transactionType === "income" ? "#166534" : "#111827" }, children: fmtAmt(r.amountPence) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }, children: r.vatAmountPence ? fmtAmt(r.vatAmountPence) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.vendorCustomer || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.reference || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem", whiteSpace: "nowrap" }, children: r.isAutoGenerated ? r.sourceModule ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { href: r.sourceModule, children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { style: { background: "none", border: "none", cursor: "pointer", color: "#6366f1", padding: 4, display: "flex", alignItems: "center", gap: 3, fontSize: "0.75rem" }, title: `View in ${r.sourceLabel}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 12 }) }) }) : null : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteId(r.id), style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }, title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) }) })
        ] }, r.id);
      }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen, onOpenChange: (o) => {
      setAddOpen(o);
      if (!o) {
        setForm(emptyForm);
        createMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 560 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Add Financial Transaction" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Date ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.transactionDate, onChange: (e) => setForm((f) => ({ ...f, transactionDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Type ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.transactionType, onValueChange: (v) => setForm((f) => ({ ...f, transactionType: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "income", children: "Income" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "expense", children: "Expense" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Description ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Fertiliser purchase — 20 bags NPK", value: form.description, onChange: (e) => setForm((f) => ({ ...f, description: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Category ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.category, onValueChange: (v) => setForm((f) => ({ ...f, category: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select category..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: form.transactionType === "income" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectGroup, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectLabel, { children: "Agricultural Sales" }),
                  ["Crop Sales", "Livestock Sales", "Milk Sales", "Wool Sales", "Straw & Crop By-Product Sales", "Timber & Woodland Sales"].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c))
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectGroup, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectLabel, { children: "Subsidies & Grants" }),
                  ["Agri-Environment Scheme", "Grant / Subsidy"].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c))
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectGroup, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectLabel, { children: "Diversification & Other Enterprise" }),
                  ["Diversification Income", "Shooting & Sporting Rights Income", "Property & Building Rental Income", "Renewable Energy Income", "Telecom Mast & Wayleave Income", "Contracting Income"].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c))
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectGroup, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectLabel, { children: "Receipts & Other" }),
                  ["Insurance Receipts & Compensation", "Machinery & Asset Disposal Income", "Interest Received", "Other Income"].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c))
                ] })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectGroup, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectLabel, { children: "Variable / Production Inputs" }),
                  ["Seeds & Seed Treatments", "Fertiliser", "Pesticides & Herbicides", "Fungicides", "Insecticides", "Veterinary & Medicine", "Feed & Forage", "Feed & Bedding", "Haulage", "Electricity", "Contracting & Machinery Hire"].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c))
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectGroup, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectLabel, { children: "Property & Occupancy" }),
                  ["Rent & Land Charges", "Buildings Repairs & Maintenance", "Water & Drainage", "Business Rates"].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c))
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectGroup, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectLabel, { children: "Machinery & Equipment" }),
                  ["Fuel", "Fuel & Energy", "Machinery & Equipment"].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c))
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectGroup, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectLabel, { children: "People" }),
                  ["Labour", "Training & Development"].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c))
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectGroup, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectLabel, { children: "Professional & Administration" }),
                  ["Professional Fees & Accountancy", "Legal Costs", "Office & Administration", "Telephone & IT", "Subscriptions & Memberships", "Marketing & Advertising"].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c))
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectGroup, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectLabel, { children: "Finance & Insurance" }),
                  ["Insurance Premiums", "Bank Charges & Loan Interest", "Hire Purchase & Leasing"].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c))
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectGroup, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectLabel, { children: "Other" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Other Expense", children: "Other Expense" })
                ] })
              ] }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment Method" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.paymentMethod, onValueChange: (v) => setForm((f) => ({ ...f, paymentMethod: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PAYMENT_METHODS.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m, children: m }, m)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Amount (£) ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", placeholder: "0.00", value: form.amountPence, onChange: (e) => setForm((f) => ({ ...f, amountPence: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "VAT Rate" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.vatRate ?? "", onValueChange: (v) => setForm((f) => ({ ...f, vatRate: v, vatAmountPence: calcVat(f.amountPence, v) })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "None" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "", children: "None" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "20", children: "20% Standard" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "5", children: "5% Reduced" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "0", children: "0% Zero-rated" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "VAT Amount (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", placeholder: "Auto", value: form.vatAmountPence, onChange: (e) => setForm((f) => ({ ...f, vatAmountPence: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier / Customer" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Company or person name", value: form.vendorCustomer, onChange: (e) => setForm((f) => ({ ...f, vendorCustomer: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reference / Invoice No." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. INV-2025-001", value: form.reference, onChange: (e) => setForm((f) => ({ ...f, reference: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: createMut, message: "Failed to save the transaction — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAddOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => createMut.mutate(form), disabled: !form.transactionDate || !form.description || !form.category || !form.amountPence || createMut.isPending, children: "Save Transaction" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeleteId(null);
        deleteMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Transaction" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "Are you sure you want to delete this transaction?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMut, message: "Failed to delete the transaction." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteId !== null && deleteMut.mutate(deleteId), disabled: deleteMut.isPending, children: "Delete" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: exportOpen, onOpenChange: setExportOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 440 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Export to Xero CSV" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Filter by date range or leave blank to export all transactions." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "From Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: exportStartDate, onChange: (e) => setExportStartDate(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "To Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: exportEndDate, onChange: (e) => setExportEndDate(e.target.value) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setExportOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleExport, disabled: exporting, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 14, className: "mr-1" }),
          exporting ? "Exporting…" : "Download CSV"
        ] })
      ] })
    ] }) })
  ] });
}
function CropContractsTab({ farmId }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const commodityTypes = useLookupStrings("commodity_types", ["Winter Wheat", "Spring Wheat", "Winter Barley", "Spring Barley", "Malting Barley", "Oilseed Rape", "Winter Oats", "Spring Oats", "Winter Beans", "Spring Beans", "Peas", "Maize", "Sugar Beet", "Potatoes", "Other"]);
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [editRecord, setEditRecord] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const emptyForm = { commodity: "", variety: "", buyer: "", contractDate: "", deliveryWindowStart: "", deliveryWindowEnd: "", quantityTonnes: "", contractedPricePence: "", totalValuePence: "", qualitySpec: "", deliveryLocation: "", status: "pending", notes: "" };
  const [form, setForm] = reactExports.useState(emptyForm);
  const q = useQuery({
    queryKey: ["crop-contracts", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/crop-contracts`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["crop-contracts", farmId] });
  const saveMut = useMutation({
    mutationFn: (body) => {
      const priceGbp = body.contractedPricePence ? parseFloat(body.contractedPricePence) : null;
      const qty = body.quantityTonnes ? parseFloat(body.quantityTonnes) : null;
      const payload = {
        ...body,
        contractDate: body.contractDate ? new Date(body.contractDate).toISOString() : null,
        deliveryWindowStart: body.deliveryWindowStart ? new Date(body.deliveryWindowStart).toISOString() : null,
        deliveryWindowEnd: body.deliveryWindowEnd ? new Date(body.deliveryWindowEnd).toISOString() : null,
        contractedPricePence: priceGbp ? Math.round(priceGbp * 100) : null,
        totalValuePence: priceGbp && qty ? Math.round(priceGbp * qty * 100) : null
      };
      if (editRecord) return fetch(`/api/farms/${farmId}/crop-contracts/${editRecord.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      return fetch(`/api/farms/${farmId}/crop-contracts`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
    },
    onSuccess: () => {
      toast({ title: editRecord ? "Contract updated" : "Contract saved" });
      invalidate();
      setAddOpen(false);
      setEditRecord(null);
      setForm(emptyForm);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/crop-contracts/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Deleted" });
      invalidate();
      setDeleteId(null);
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  const records = q.data ?? [];
  const activeContracts = records.filter((r) => r.status === "active").length;
  const totalContractValue = records.filter((r) => r.status !== "cancelled").reduce((s, r) => s + (r.totalValuePence ?? 0), 0);
  const openAdd = () => {
    setEditRecord(null);
    setForm(emptyForm);
    setAddOpen(true);
  };
  const openEdit = (r) => {
    setEditRecord(r);
    setForm({
      ...r,
      contractDate: r.contractDate?.slice(0, 10) ?? "",
      deliveryWindowStart: r.deliveryWindowStart?.slice(0, 10) ?? "",
      deliveryWindowEnd: r.deliveryWindowEnd?.slice(0, 10) ?? "",
      contractedPricePence: r.contractedPricePence ? (r.contractedPricePence / 100).toFixed(2) : "",
      quantityTonnes: r.quantityTonnes ?? ""
    });
    setAddOpen(true);
  };
  const getStatus = (val) => CROP_CONTRACT_STATUSES.find((s) => s.value === val) ?? { label: val, bg: "#f3f4f6", color: "#374151" };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: "1.25rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem 1.25rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginBottom: 4, textTransform: "uppercase", fontWeight: 500 }, children: "Total Contracts" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.5rem", fontWeight: 700, color: "#111827" }, children: records.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #bbf7d0", borderRadius: 10, padding: "1rem 1.25rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginBottom: 4, textTransform: "uppercase", fontWeight: 500 }, children: "Active Contracts" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.5rem", fontWeight: 700, color: "#166534" }, children: activeContracts })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem 1.25rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginBottom: 4, textTransform: "uppercase", fontWeight: 500 }, children: "Total Contract Value" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.5rem", fontWeight: 700, color: "#111827" }, children: fmtAmt(totalContractValue) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 12 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
      "Add Crop Contract"
    ] }) }),
    q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 py-8 text-center", children: "Loading..." }) : records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Wheat, { size: 32, style: { margin: "0 auto 12px", opacity: 0.5 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: "No crop contracts recorded" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: "Record grain, pulse and oilseed marketing contracts, pricing, tonnage commitments and delivery windows here." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Crop / Variety", "Contractor", "Contract Date", "Tonnage", "Price / t", "Total Value", "Delivery Window", "Location", "Status", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }, children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: records.map((r, i) => {
        const s = getStatus(r.status);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < records.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.625rem 0.875rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600 }, children: r.commodity || "—" }),
            r.variety && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280" }, children: r.variety })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.buyer || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }, children: fmt(r.contractDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.quantityTonnes ? `${r.quantityTonnes}t` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.contractedPricePence ? `£${(r.contractedPricePence / 100).toFixed(2)}` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", fontWeight: 600, color: "#166534" }, children: r.totalValuePence ? fmtAmt(r.totalValuePence) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", fontSize: "0.8rem" }, children: r.deliveryWindowStart || r.deliveryWindowEnd ? `${fmt(r.deliveryWindowStart)} – ${fmt(r.deliveryWindowEnd)}` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.deliveryLocation || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: s.bg, color: s.color, border: "none", fontSize: "0.72rem" }, children: s.label }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewRecord(r), style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }, title: "View", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 13 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteId(r.id), style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }, title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
          ] }) })
        ] }, r.id);
      }) })
    ] }) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 560 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Crop Contract" }) }),
      (() => {
        const r = viewRecord;
        const fmt2 = (d) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
        const fmtAmt2 = (p) => p != null ? `£${(p / 100).toFixed(2)}` : null;
        const F = ({ label, value }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 2 }, children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.875rem", color: value ? "#111827" : "#d1d5db" }, children: value || "—" })
        ] });
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gap: 14 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Commodity", value: r.commodity }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Variety", value: r.variety }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Buyer", value: r.buyer })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Contract Date", value: fmt2(r.contractDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Status", value: r.status })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Delivery Window Start", value: fmt2(r.deliveryWindowStart) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Delivery Window End", value: fmt2(r.deliveryWindowEnd) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Quantity (t)", value: r.quantityTonnes != null ? `${r.quantityTonnes}t` : null }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Price (£/t)", value: r.contractedPricePence != null ? `£${(r.contractedPricePence / 100).toFixed(2)}` : null }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Total Value", value: fmtAmt2(r.totalValuePence) })
          ] }),
          r.qualitySpec && /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Quality Spec", value: r.qualitySpec }),
          r.deliveryLocation && /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Delivery Location", value: r.deliveryLocation }),
          r.notes && /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Notes", value: r.notes })
        ] });
      })(),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewRecord(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
          const r = viewRecord;
          setViewRecord(null);
          openEdit(r);
        }, children: "Edit Contract" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen, onOpenChange: (o) => {
      if (!o) {
        setAddOpen(false);
        setEditRecord(null);
        setForm(emptyForm);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 560 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editRecord ? "Edit Crop Contract" : "Add Crop Contract" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Commodity ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.commodity, onValueChange: (v) => setForm((f) => ({ ...f, commodity: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select crop…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: commodityTypes.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Variety" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. KWS Zyatt, Skyfall", value: form.variety, onChange: (e) => setForm((f) => ({ ...f, variety: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Buyer / Merchant ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Openfield, ADM, Saxon", value: form.buyer, onChange: (e) => setForm((f) => ({ ...f, buyer: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Contract Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.contractDate, onChange: (e) => setForm((f) => ({ ...f, contractDate: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity (t)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", min: "0", placeholder: "t", value: form.quantityTonnes, onChange: (e) => setForm((f) => ({ ...f, quantityTonnes: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Price / tonne (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", placeholder: "£/t", value: form.contractedPricePence, onChange: (e) => setForm((f) => ({ ...f, contractedPricePence: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status, onValueChange: (v) => setForm((f) => ({ ...f, status: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CROP_CONTRACT_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.value, children: s.label }, s.value)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Delivery Window Start" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.deliveryWindowStart, onChange: (e) => setForm((f) => ({ ...f, deliveryWindowStart: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Delivery Window End" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.deliveryWindowEnd, onChange: (e) => setForm((f) => ({ ...f, deliveryWindowEnd: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Delivery Location / Store" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Saxham Silos, Bury St Edmunds", value: form.deliveryLocation, onChange: (e) => setForm((f) => ({ ...f, deliveryLocation: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quality Specification" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Moisture, protein, specific weight, admixture tolerances…", value: form.qualitySpec, onChange: (e) => setForm((f) => ({ ...f, qualitySpec: e.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setAddOpen(false);
          setEditRecord(null);
          setForm(emptyForm);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveMut.mutate(form), disabled: !form.commodity || !form.buyer || saveMut.isPending, children: saveMut.isPending ? "Saving…" : editRecord ? "Save Changes" : "Add Contract" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) setDeleteId(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Crop Contract" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "Are you sure you want to delete this contract record?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteId !== null && deleteMut.mutate(deleteId), disabled: deleteMut.isPending, children: "Delete" })
      ] })
    ] }) })
  ] });
}
function GrantsTab({ farmId }) {
  useToast();
  useQueryClient();
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [editRecord, setEditRecord] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const emptyForm = { schemeName: "", reference: "", contractStartDate: "", contractEndDate: "", annualValuePence: "", totalValuePence: "", status: "applied", nextClaimDate: "", notes: "" };
  const [form, setForm] = reactExports.useState(emptyForm);
  const q = useQuery({
    queryKey: ["financial-transactions", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/financial-transactions`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => (d.records ?? []).filter((r) => r.category === "Agri-Environment Scheme" || r.category === "Grant / Subsidy")
  });
  const records = q.data ?? [];
  const totalReceived = records.filter((r) => r.transactionType === "income").reduce((s, r) => s + (r.amountPence ?? 0), 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: "1.25rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem 1.25rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginBottom: 4, textTransform: "uppercase", fontWeight: 500 }, children: "Agri-Environment Transactions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.5rem", fontWeight: 700, color: "#111827" }, children: records.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #bbf7d0", borderRadius: 10, padding: "1rem 1.25rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginBottom: 4, textTransform: "uppercase", fontWeight: 500 }, children: "Total Received" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.5rem", fontWeight: 700, color: "#166534" }, children: fmtAmt(totalReceived) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.8rem", color: "#1e40af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Tip:" }),
      ' Subsidy and grant payments appear here when they are logged in the Transactions tab with the category "Agri-Environment Scheme" or "Grant / Subsidy". Record SFI, Countryside Stewardship, and BPS payments there to track scheme income.'
    ] }),
    q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 py-8 text-center", children: "Loading..." }) : records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 32, style: { margin: "0 auto 12px", opacity: 0.5 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: "No subsidy or grant payments recorded" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: "Log SFI, Countryside Stewardship, and BPS payments in the Transactions tab using the categories above." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Date", "Description", "Category", "Amount", "Reference", "Notes"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }, children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: records.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < records.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }, children: fmt(r.transactionDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", fontWeight: 500 }, children: r.description || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.category || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", fontWeight: 600, color: "#166534" }, children: fmtAmt(r.amountPence) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.reference || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", fontSize: "0.8rem" }, children: r.notes || "—" })
      ] }, r.id)) })
    ] }) })
  ] });
}
function AttachmentPanel({ farmId, purchaseId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [uploading, setUploading] = reactExports.useState(false);
  const attQ = useQuery({
    queryKey: ["record-attachments", farmId, "livestock-purchase", purchaseId],
    queryFn: () => fetch(`/api/farms/${farmId}/record-attachments?recordType=livestock-purchase&recordId=${purchaseId}`).then((r) => r.json()),
    select: (d) => d.records ?? []
  });
  const atts = attQ.data ?? [];
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/record-attachments/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["record-attachments", farmId, "livestock-purchase", purchaseId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setUploading(true);
      const urlRes = await fetch("/api/storage/uploads/request-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type || "application/octet-stream" }) });
      if (!urlRes.ok) throw new Error();
      const { uploadURL, objectPath } = await urlRes.json();
      await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type || "application/octet-stream" } }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      await fetch(`/api/farms/${farmId}/record-attachments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recordType: "livestock-purchase", recordId: purchaseId, fileUrl: `/api/storage${objectPath}`, fileKey: objectPath, fileName: file.name, fileSize: file.size, mimeType: file.type }) }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      qc.invalidateQueries({ queryKey: ["record-attachments", farmId, "livestock-purchase", purchaseId] });
    } catch {
    } finally {
      setUploading(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "10px 14px", background: "#f9fafb", borderRadius: 6, border: "1px solid #e5e7eb" }, children: [
    atts.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 13, style: { color: "#2563eb", flexShrink: 0 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: a.fileUrl, target: "_blank", rel: "noopener noreferrer", style: { fontSize: "0.8125rem", color: "#2563eb", flex: 1 }, children: a.fileName || "Document" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => deleteMut.mutate(a.id), style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 13 }) })
    ] }, a.id)),
    atts.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#9ca3af", marginBottom: 8 }, children: "No documents attached yet" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*,application/pdf", style: { display: "none" }, disabled: uploading, onChange: handleFile }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.75rem", padding: "4px 10px", border: "1px solid #d1d5db", borderRadius: 5, color: "#374151", background: "#fff", display: "inline-flex", alignItems: "center", gap: 4 }, children: uploading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 11, style: { animation: "spin 1s linear infinite" } }),
        " Uploading…"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 11 }),
        " Add document / photo"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", color: "#9ca3af" }, children: "JPG, PNG or PDF" })
    ] })
  ] });
}
function LivestockPurchasesTab({ farmId }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = reactExports.useState("all");
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [editRecord, setEditRecord] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [markPaidId, setMarkPaidId] = reactExports.useState(null);
  const [paidDate, setPaidDate] = reactExports.useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [paidRef, setPaidRef] = reactExports.useState("");
  const [paidMethod, setPaidMethod] = reactExports.useState("Bank Transfer");
  const [supplierDropdown, setSupplierDropdown] = reactExports.useState(false);
  const [pendingFiles, setPendingFiles] = reactExports.useState([]);
  const [pendingUploading, setPendingUploading] = reactExports.useState(false);
  const EMPTY = { supplierId: "", invoiceDate: "", arrivalDate: "", supplierName: "", supplierCph: "", marketName: "", marketIsOther: false, invoiceRef: "", species: "Cattle", numberOfHead: "", pricePerHeadPence: "", totalAmountPence: "", vatAmountPence: "", paymentTermsDays: "30", herdId: "", movementId: "", notes: "", paymentMethod: "Bank Transfer" };
  const [form, setForm] = reactExports.useState(EMPTY);
  const herdsQ = useQuery({ queryKey: ["herds", farmId], queryFn: () => fetch(`/api/farms/${farmId}/herds`).then((r) => r.json()), enabled: !!farmId, select: (d) => d.records ?? [] });
  const herds = herdsQ.data ?? [];
  const suppliersQ = useQuery({ queryKey: ["livestock-suppliers", farmId], queryFn: () => fetch(`/api/farms/${farmId}/livestock-suppliers`).then((r) => r.json()), enabled: !!farmId, select: (d) => d.records ?? [] });
  const suppliers = suppliersQ.data ?? [];
  const filteredSuppliers = suppliers.filter((s) => !form.supplierName || s.name.toLowerCase().includes(form.supplierName.toLowerCase()));
  const speciesKw = SPECIES_HERD_KEYWORDS[form.species ?? "Cattle"] ?? [];
  const herdsForSpecies = speciesKw.length === 0 ? herds : herds.filter((h) => {
    const t = (h.type || h.name || "").toLowerCase();
    return speciesKw.some((k) => t.includes(k));
  });
  const q = useQuery({ queryKey: ["livestock-purchases", farmId], queryFn: () => fetch(`/api/farms/${farmId}/livestock-purchases`).then((r) => r.json()), enabled: !!farmId, select: (d) => d.records ?? [] });
  const records = q.data ?? [];
  const movementsQ = useQuery({ queryKey: ["livestock-movements-incoming", farmId], queryFn: () => fetch(`/api/farms/${farmId}/livestock-movements/incoming`).then((r) => r.json()), enabled: !!farmId, select: (d) => d.records ?? [] });
  const incomingMovements = movementsQ.data ?? [];
  const linkedMovement = incomingMovements.find((m) => String(m.id) === String(form.movementId)) ?? null;
  const [creatingMovement, setCreatingMovement] = reactExports.useState(false);
  async function handleCreateMovement() {
    if (!form.arrivalDate && !form.invoiceDate) {
      toast({ title: "Set an arrival or invoice date first", variant: "destructive" });
      return;
    }
    setCreatingMovement(true);
    try {
      const body = {
        movementType: "on",
        movementDate: form.arrivalDate || form.invoiceDate,
        numberOfAnimals: form.numberOfHead ? parseInt(String(form.numberOfHead)) : null,
        species: form.species ?? null,
        fromLocation: form.supplierCph ? form.supplierCph + (form.supplierName ? ` — ${form.supplierName}` : "") : form.marketName || form.supplierName || null,
        herdId: form.herdId && form.herdId !== "__none__" ? parseInt(String(form.herdId)) : null,
        notes: `Auto-created from purchase invoice${form.invoiceRef ? ` ref: ${form.invoiceRef}` : ""}`
      };
      const res = await fetch(`/api/farms/${farmId}/livestock-movements`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      const data = await res.json();
      const newId = data?.movement?.id;
      if (newId) {
        setForm((f) => ({ ...f, movementId: String(newId) }));
        movementsQ.refetch();
        toast({ title: "Movement record created and linked" });
      }
    } catch {
      toast({ title: "Failed to create movement", variant: "destructive" });
    } finally {
      setCreatingMovement(false);
    }
  }
  const filtered = statusFilter === "all" ? records : records.filter((r) => r.paymentStatus === statusFilter);
  const outstanding = records.filter((r) => r.paymentStatus === "outstanding").reduce((s, r) => s + (Number(r.totalAmountPence) || 0), 0);
  const overdue = records.filter((r) => r.paymentStatus === "overdue").reduce((s, r) => s + (Number(r.totalAmountPence) || 0), 0);
  const paidYtd = records.filter((r) => r.paymentStatus === "paid" && r.paidDate && new Date(r.paidDate).getFullYear() === (/* @__PURE__ */ new Date()).getFullYear()).reduce((s, r) => s + (Number(r.totalAmountPence) || 0), 0);
  const invalidate = () => qc.invalidateQueries({ queryKey: ["livestock-purchases", farmId] });
  const createMut = useMutation({ mutationFn: (b) => fetch(`/api/farms/${farmId}/livestock-purchases`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }).then((r) => r.json()), onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const updateMut = useMutation({ mutationFn: (b) => fetch(`/api/farms/${farmId}/livestock-purchases/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }).then((r) => r.json()), onSuccess: () => {
    toast({ title: "Invoice updated" });
    invalidate();
    setAddOpen(false);
    setEditRecord(null);
    setForm(EMPTY);
  }, onError: () => toast({ title: "Failed to update", variant: "destructive" }) });
  const deleteMut = useMutation({ mutationFn: (id) => fetch(`/api/farms/${farmId}/livestock-purchases/${id}`, { method: "DELETE" }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }).then((r) => r.json()), onSuccess: () => {
    toast({ title: "Deleted" });
    invalidate();
    setDeleteId(null);
  }, onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const markPaidMut = useMutation({
    mutationFn: (b) => fetch(`/api/farms/${farmId}/livestock-purchases/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentStatus: "paid", paidDate: b.paidDate, paymentMethod: b.paymentMethod, paymentReference: b.paymentReference }) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Marked as paid" });
      invalidate();
      setMarkPaidId(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const sCfg = (s) => PURCHASE_STATUS_CONFIG[s] ?? { label: s, bg: "#f3f4f6", color: "#374151" };
  async function handleSaveNew() {
    if (!form.invoiceDate || !form.supplierName || !form.numberOfHead || !form.totalAmountPence) {
      toast({ title: "Invoice date, supplier, head count and total are required", variant: "destructive" });
      return;
    }
    const body = { ...form, numberOfHead: parseInt(String(form.numberOfHead)), pricePerHeadPence: form.pricePerHeadPence ? Math.round(parseFloat(form.pricePerHeadPence) * 100) : null, totalAmountPence: Math.round(parseFloat(form.totalAmountPence) * 100), vatAmountPence: form.vatAmountPence ? Math.round(parseFloat(form.vatAmountPence) * 100) : null, paymentTermsDays: form.paymentTermsDays ? parseInt(String(form.paymentTermsDays)) : 30, herdId: form.herdId && form.herdId !== "__none__" ? parseInt(String(form.herdId)) : null };
    try {
      const result = await createMut.mutateAsync(body);
      const newId = result?.record?.id ?? result?.id;
      if (pendingFiles.length > 0 && newId) {
        setPendingUploading(true);
        for (const file of pendingFiles) {
          try {
            const urlRes = await fetch("/api/storage/uploads/request-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type || "application/octet-stream" }) });
            if (!urlRes.ok) continue;
            const { uploadURL, objectPath } = await urlRes.json();
            await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type || "application/octet-stream" } }).then(async (r) => {
              if (!r.ok) {
                const t = await r.text().catch(() => "");
                throw new Error(t || `Request failed (${r.status})`);
              }
              return r;
            });
            await fetch(`/api/farms/${farmId}/record-attachments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recordType: "livestock-purchase", recordId: newId, fileUrl: `/api/storage${objectPath}`, fileKey: objectPath, fileName: file.name, fileSize: file.size, mimeType: file.type }) }).then(async (r) => {
              if (!r.ok) {
                const t = await r.text().catch(() => "");
                throw new Error(t || `Request failed (${r.status})`);
              }
              return r;
            });
          } catch {
          }
        }
        setPendingUploading(false);
      }
      toast({ title: "Invoice added" });
      invalidate();
      setAddOpen(false);
      setForm(EMPTY);
      setPendingFiles([]);
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: "1.25rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #fde68a", borderRadius: 10, padding: "1rem 1.25rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginBottom: 4, textTransform: "uppercase", fontWeight: 500 }, children: "Outstanding" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.5rem", fontWeight: 700, color: "#92400e" }, children: fmtAmt(outstanding) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", color: "#9ca3af" }, children: [
          records.filter((r) => r.paymentStatus === "outstanding").length,
          " invoice",
          records.filter((r) => r.paymentStatus === "outstanding").length !== 1 ? "s" : ""
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #fecaca", borderRadius: 10, padding: "1rem 1.25rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginBottom: 4, textTransform: "uppercase", fontWeight: 500 }, children: "Overdue" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.5rem", fontWeight: 700, color: "#991b1b" }, children: fmtAmt(overdue) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", color: "#9ca3af" }, children: [
          records.filter((r) => r.paymentStatus === "overdue").length,
          " overdue"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #bbf7d0", borderRadius: 10, padding: "1rem 1.25rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginBottom: 4, textTransform: "uppercase", fontWeight: 500 }, children: [
          "Paid — YTD ",
          (/* @__PURE__ */ new Date()).getFullYear()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.5rem", fontWeight: 700, color: "#166534" }, children: fmtAmt(paidYtd) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", color: "#9ca3af" }, children: [
          records.filter((r) => r.paymentStatus === "paid" && r.paidDate && new Date(r.paidDate).getFullYear() === (/* @__PURE__ */ new Date()).getFullYear()).length,
          " paid"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 6 }, children: ["all", "outstanding", "overdue", "paid"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setStatusFilter(s), style: { padding: "5px 12px", borderRadius: 8, fontSize: "0.78rem", fontWeight: 500, border: `1px solid ${statusFilter === s ? "#166534" : "#e5e7eb"}`, background: statusFilter === s ? "#166534" : "#fff", color: statusFilter === s ? "#fff" : "#374151", cursor: "pointer", transition: "all 0.15s" }, children: [
        s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1),
        s !== "all" ? ` (${records.filter((r) => r.paymentStatus === s).length})` : ""
      ] }, s)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
        setEditRecord(null);
        setForm(EMPTY);
        setAddOpen(true);
      }, className: "bg-green-800 hover:bg-green-900 text-white", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
        "Add Invoice"
      ] })
    ] }),
    q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 text-center py-10", children: "Loading…" }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { size: 32, style: { margin: "0 auto 12px", opacity: 0.4 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: statusFilter === "all" ? "No livestock purchase invoices recorded" : `No ${statusFilter} invoices` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: statusFilter === "all" ? "Record purchases from markets, dealers and direct farm-to-farm sales here" : "Try changing the status filter" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Invoice Date", "Supplier / Market", "Species", "Head", "Total ex-VAT", "VAT", "Status", "Due / Paid", "Actions"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }, children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filtered.map((r, i) => {
        const cfg = sCfg(r.paymentStatus);
        const herd = herds.find((h) => Number(h.id) === Number(r.herdId));
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: fmt(r.invoiceDate) }),
            r.invoiceRef && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem", color: "#9ca3af" }, children: r.invoiceRef })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.625rem 0.875rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 500 }, children: r.supplierName || "—" }),
            r.marketName && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem", color: "#9ca3af" }, children: r.marketName }),
            r.supplierCph && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.7rem", color: "#9ca3af" }, children: [
              "CPH: ",
              r.supplierCph
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.625rem 0.875rem", color: "#374151" }, children: [
            r.species || "—",
            herd && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem", color: "#9ca3af" }, children: herd.herdName || herd.name }),
            r.movementId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "inline-flex", alignItems: "center", gap: 3, marginTop: 3, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 4, padding: "1px 6px" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { size: 9, style: { color: "#166534" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.65rem", color: "#166534", fontWeight: 600 }, children: "Movement linked" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", textAlign: "center", fontWeight: 600 }, children: r.numberOfHead ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", fontWeight: 600 }, children: fmtAmt(r.totalAmountPence) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.vatAmountPence ? fmtAmt(r.vatAmountPence) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { background: cfg.bg, color: cfg.color, borderRadius: 6, padding: "2px 8px", fontSize: "0.72rem", fontWeight: 600 }, children: cfg.label }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", whiteSpace: "nowrap" }, children: r.paymentStatus === "paid" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.8rem", color: "#166534" }, children: [
            "Paid ",
            fmt(r.paidDate)
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.8rem", color: r.paymentStatus === "overdue" ? "#dc2626" : "#6b7280" }, children: r.paymentDueDate ? fmt(r.paymentDueDate) : "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4, alignItems: "center", flexWrap: "nowrap" }, children: [
            (r.paymentStatus === "outstanding" || r.paymentStatus === "overdue") && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", style: { fontSize: "0.7rem", padding: "2px 8px", height: "auto", color: "#166534", borderColor: "#bbf7d0" }, onClick: () => {
              setMarkPaidId(Number(r.id));
              setPaidDate((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
              setPaidRef(r.invoiceRef ?? "");
              setPaidMethod("Bank Transfer");
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 11, className: "mr-1" }),
              "Mark Paid"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setViewRecord(r), title: "View", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 13 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => {
              setEditRecord(r);
              const knownMarkets = UK_LIVESTOCK_MARKETS.slice(0, -1);
              const marketIsOther = !!(r.marketName && !knownMarkets.includes(r.marketName));
              setForm({ ...r, invoiceDate: r.invoiceDate ?? "", arrivalDate: r.arrivalDate ?? "", numberOfHead: r.numberOfHead ?? "", pricePerHeadPence: r.pricePerHeadPence ? (Number(r.pricePerHeadPence) / 100).toFixed(2) : "", totalAmountPence: r.totalAmountPence ? (Number(r.totalAmountPence) / 100).toFixed(2) : "", vatAmountPence: r.vatAmountPence ? (Number(r.vatAmountPence) / 100).toFixed(2) : "", paymentTermsDays: r.paymentTermsDays ?? "30", herdId: r.herdId ? String(r.herdId) : "", movementId: r.movementId ? String(r.movementId) : "", marketName: marketIsOther ? r.marketName : r.marketName || "", marketIsOther });
              setAddOpen(true);
            }, title: "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 13 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", style: { color: "#ef4444" }, onClick: () => setDeleteId(Number(r.id)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 13 }) })
          ] }) })
        ] }, r.id);
      }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: viewRecord !== null, onOpenChange: (o) => {
      if (!o) setViewRecord(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 560 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Livestock Purchase Invoice" }) }),
      viewRecord && (() => {
        const herd = herds.find((h) => Number(h.id) === Number(viewRecord.herdId));
        const cfg = PURCHASE_STATUS_CONFIG[viewRecord.paymentStatus] ?? { label: viewRecord.paymentStatus, bg: "#f3f4f6", color: "#374151" };
        const field = (label, value) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#111827" }, children: value || "—" })
        ] });
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px", padding: "4px 0", maxHeight: "68vh", overflowY: "auto" }, children: [
          field("Invoice Date", fmt(viewRecord.invoiceDate)),
          field("Arrival Date", viewRecord.arrivalDate ? fmt(viewRecord.arrivalDate) : "—"),
          field("Invoice Ref", viewRecord.invoiceRef),
          field("Species", viewRecord.species),
          field("Supplier", viewRecord.supplierName),
          field("Supplier CPH", viewRecord.supplierCph),
          field("Market", viewRecord.marketName),
          field("Herd", herd ? herd.herdName || herd.name : "—"),
          field("Number of Head", viewRecord.numberOfHead),
          field("Price per Head", viewRecord.pricePerHeadPence ? `£${(Number(viewRecord.pricePerHeadPence) / 100).toFixed(2)}` : "—"),
          field("Total (ex-VAT)", fmtAmt(viewRecord.totalAmountPence)),
          field("VAT Amount", viewRecord.vatAmountPence ? fmtAmt(viewRecord.vatAmountPence) : "—"),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1/-1", display: "flex", alignItems: "center", gap: 10 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Payment Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { background: cfg.bg, color: cfg.color, borderRadius: 6, padding: "3px 10px", fontSize: "0.78rem", fontWeight: 600 }, children: cfg.label })
            ] }),
            viewRecord.paymentStatus === "paid" ? field("Paid", fmt(viewRecord.paidDate)) : field("Due", viewRecord.paymentDueDate ? fmt(viewRecord.paymentDueDate) : "—")
          ] }),
          viewRecord.paymentStatus === "paid" && field("Payment Method", viewRecord.paymentMethod),
          viewRecord.paymentStatus === "paid" && field("Payment Reference", viewRecord.paymentReference),
          viewRecord.movementId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1/-1" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }, children: "Movement Record" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.78rem", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 5, padding: "3px 10px", color: "#166534", fontWeight: 600 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { size: 11 }),
              "Movement #",
              viewRecord.movementId,
              " linked"
            ] })
          ] }),
          viewRecord.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1/-1" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", whiteSpace: "pre-line", color: "#374151" }, children: viewRecord.notes })
          ] })
        ] });
      })(),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => {
          const r = viewRecord;
          setViewRecord(null);
          setEditRecord(r);
          const knownMarkets = UK_LIVESTOCK_MARKETS.slice(0, -1);
          const marketIsOther = !!(r.marketName && !knownMarkets.includes(r.marketName));
          setForm({ ...r, invoiceDate: r.invoiceDate ?? "", arrivalDate: r.arrivalDate ?? "", numberOfHead: r.numberOfHead ?? "", pricePerHeadPence: r.pricePerHeadPence ? (Number(r.pricePerHeadPence) / 100).toFixed(2) : "", totalAmountPence: r.totalAmountPence ? (Number(r.totalAmountPence) / 100).toFixed(2) : "", vatAmountPence: r.vatAmountPence ? (Number(r.vatAmountPence) / 100).toFixed(2) : "", paymentTermsDays: r.paymentTermsDays ?? "30", herdId: r.herdId ? String(r.herdId) : "", movementId: r.movementId ? String(r.movementId) : "", marketName: marketIsOther ? r.marketName : r.marketName || "", marketIsOther });
          setAddOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 13, style: { marginRight: 5 } }),
          "Edit"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: markPaidId !== null, onOpenChange: (o) => {
      if (!o) setMarkPaidId(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 420 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Mark Invoice as Paid" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: paidDate, onChange: (e) => setPaidDate(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment method" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: paidMethod, onValueChange: setPaidMethod, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PAYMENT_METHODS.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m, children: m }, m)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: paidRef, onChange: (e) => setPaidRef(e.target.value), placeholder: "BACS ref, cheque number…" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setMarkPaidId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "bg-green-800 hover:bg-green-900 text-white", disabled: markPaidMut.isPending, onClick: () => {
          if (!paidDate) {
            toast({ title: "Payment date is required", variant: "destructive" });
            return;
          }
          markPaidMut.mutate({ id: markPaidId, paidDate, paymentMethod: paidMethod, paymentReference: paidRef });
        }, children: "Confirm Payment" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen, onOpenChange: (o) => {
      if (!o) {
        setAddOpen(false);
        setEditRecord(null);
        setForm(EMPTY);
        setPendingFiles([]);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editRecord ? "Edit Livestock Purchase Invoice" : "Add Livestock Purchase Invoice" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 py-2 max-h-[65vh] overflow-y-auto pr-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Invoice date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.invoiceDate ?? "", onChange: (e) => setForm((f) => ({ ...f, invoiceDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Arrival date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.arrivalDate ?? "", onChange: (e) => setForm((f) => ({ ...f, arrivalDate: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "relative" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 14, style: { position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none", zIndex: 1 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: form.supplierName ?? "",
                  onChange: (e) => {
                    setForm((f) => ({ ...f, supplierName: e.target.value, supplierId: "" }));
                    setSupplierDropdown(true);
                  },
                  onFocus: () => setSupplierDropdown(true),
                  onBlur: () => setTimeout(() => setSupplierDropdown(false), 180),
                  placeholder: "Search or enter supplier name",
                  style: { paddingLeft: 30 }
                }
              ),
              supplierDropdown && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", maxHeight: 220, overflowY: "auto" }, children: filteredSuppliers.length > 0 ? filteredSuppliers.slice(0, 8).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "8px 12px", cursor: "pointer", borderBottom: "1px solid #f3f4f6" }, onMouseDown: (e) => e.preventDefault(), onClick: () => {
                setForm((f) => ({ ...f, supplierName: s.name, supplierCph: s.cph || f.supplierCph, supplierId: s.id }));
                setSupplierDropdown(false);
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.875rem", fontWeight: 500 }, children: s.name }),
                s.cph && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.72rem", color: "#6b7280" }, children: [
                  "CPH: ",
                  s.cph
                ] })
              ] }, s.id)) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: "10px 12px", fontSize: "0.8rem", color: "#9ca3af" }, children: suppliersQ.isLoading ? "Loading saved suppliers…" : suppliers.length === 0 ? "No saved suppliers yet — type a name to continue" : "No match — will be saved as a new supplier" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier CPH no." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.supplierCph ?? "", onChange: (e) => setForm((f) => ({ ...f, supplierCph: e.target.value })), placeholder: "XX/XXX/XXXX" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Market / auction" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: form.marketIsOther ? "Other" : form.marketName || "__none__",
                onValueChange: (v) => {
                  if (v === "__none__") setForm((f) => ({ ...f, marketName: "", marketIsOther: false }));
                  else if (v === "Other") setForm((f) => ({ ...f, marketName: "", marketIsOther: true }));
                  else setForm((f) => ({ ...f, marketName: v, marketIsOther: false }));
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "— None —" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— None —" }),
                    UK_LIVESTOCK_MARKETS.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m, children: m }, m))
                  ] })
                ]
              }
            ),
            form.marketIsOther && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1.5", value: form.marketName || "", onChange: (e) => setForm((f) => ({ ...f, marketName: e.target.value })), placeholder: "Enter market name…", autoFocus: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Invoice / lot ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.invoiceRef ?? "", onChange: (e) => setForm((f) => ({ ...f, invoiceRef: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Species *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.species ?? "Cattle", onValueChange: (v) => setForm((f) => ({ ...f, species: v, herdId: "" })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SPECIES_LIST.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "No. of head *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", value: form.numberOfHead ?? "", onChange: (e) => setForm((f) => ({ ...f, numberOfHead: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Herd / flock" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.herdId || "__none__", onValueChange: (v) => setForm((f) => ({ ...f, herdId: v === "__none__" ? "" : v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "— None —" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— None —" }),
                herdsForSpecies.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(h.id), children: String(h.herdName || h.name || h.type) }, String(h.id)))
              ] })
            ] }),
            herdsForSpecies.length === 0 && herds.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.7rem", color: "#9ca3af", marginTop: 2 }, children: [
              "No ",
              form.species,
              " herds registered"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Price / head (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.pricePerHeadPence ?? "", onChange: (e) => setForm((f) => ({ ...f, pricePerHeadPence: e.target.value })), placeholder: "0.00" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Total ex-VAT (£) *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.totalAmountPence ?? "", onChange: (e) => setForm((f) => ({ ...f, totalAmountPence: e.target.value })), placeholder: "0.00" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "VAT amount (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.vatAmountPence ?? "", onChange: (e) => setForm((f) => ({ ...f, vatAmountPence: e.target.value })), placeholder: "0.00" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment terms (days)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.paymentTermsDays ?? "30", onChange: (e) => setForm((f) => ({ ...f, paymentTermsDays: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment method" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.paymentMethod || "Bank Transfer", onValueChange: (v) => setForm((f) => ({ ...f, paymentMethod: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PAYMENT_METHODS.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m, children: m }, m)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { border: "1px solid #e5e7eb", borderRadius: 8, padding: "12px 14px", background: "#f9fafb" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRightLeft, { size: 13, style: { color: "#6b7280" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 600, fontSize: "0.82rem", color: "#374151" }, children: "Movement Record" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.68rem", color: "#6b7280", background: "#e5e7eb", borderRadius: 4, padding: "1px 6px", fontWeight: 500 }, children: "Compliance" })
          ] }),
          linkedMovement ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, padding: "8px 12px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontWeight: 600, fontSize: "0.8rem", color: "#166534", display: "flex", alignItems: "center", gap: 4 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 12 }),
                [linkedMovement.movementDate ? new Date(linkedMovement.movementDate).toLocaleDateString("en-GB") : null, linkedMovement.numberOfAnimals ? `${linkedMovement.numberOfAnimals} head` : null, linkedMovement.species || form.species].filter(Boolean).join(" · ")
              ] }),
              (linkedMovement.licenceNumber || linkedMovement.bcmsSubmissionRef) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.7rem", color: "#166534", marginTop: 2 }, children: [
                linkedMovement.licenceNumber && `Licence: ${linkedMovement.licenceNumber}`,
                linkedMovement.licenceNumber && linkedMovement.bcmsSubmissionRef && " · ",
                linkedMovement.bcmsSubmissionRef && `BCMS: ${linkedMovement.bcmsSubmissionRef}`
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.7rem", color: "#6b7280", marginTop: 1 }, children: [
                "From: ",
                linkedMovement.fromLocation || "—"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setForm((f) => ({ ...f, movementId: "" })), style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0, flexShrink: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 13 }) })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", margin: 0 }, children: "Link this invoice to a movement record to complete the compliance audit trail (invoice → BCMS ref)." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.movementId || "__none__", onValueChange: (v) => setForm((f) => ({ ...f, movementId: v === "__none__" ? "" : v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Link to existing movement…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— No link —" }),
                incomingMovements.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(m.id), children: [
                  new Date(m.movementDate).toLocaleDateString("en-GB"),
                  " · ",
                  m.numberOfAnimals ?? "?",
                  " head",
                  m.species ? ` (${m.species})` : "",
                  " from ",
                  m.fromLocation || "—",
                  m.licenceNumber ? ` · ${m.licenceNumber}` : ""
                ] }, String(m.id))),
                incomingMovements.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__empty__", disabled: true, children: "No incoming movements recorded yet" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleCreateMovement, disabled: creatingMovement, style: { textAlign: "left", background: "none", border: "1px dashed #d1d5db", borderRadius: 6, padding: "6px 12px", cursor: creatingMovement ? "not-allowed" : "pointer", color: "#2563eb", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 6, opacity: creatingMovement ? 0.6 : 1 }, children: [
              creatingMovement ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 12, style: { animation: "spin 1s linear infinite" } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 12 }),
              `Create & link a new "on" movement from this invoice's data`
            ] })
          ] })
        ] }),
        editRecord ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { style: { display: "block", marginBottom: 6 }, children: "Documents & Photos" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AttachmentPanel, { farmId, purchaseId: editRecord.id })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { style: { display: "block", marginBottom: 6 }, children: "Documents & Photos" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "10px 14px", background: "#f9fafb", borderRadius: 6, border: "1px solid #e5e7eb" }, children: [
            pendingFiles.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#9ca3af", marginBottom: 8 }, children: "No documents queued yet" }),
            pendingFiles.map((f, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 13, style: { color: "#2563eb", flexShrink: 0 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8125rem", color: "#374151", flex: 1 }, children: f.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setPendingFiles((fs) => fs.filter((_, j) => j !== i)), style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 13 }) })
            ] }, i)),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*,application/pdf", style: { display: "none" }, onChange: (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) setPendingFiles((fs) => [...fs, file]);
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.75rem", padding: "4px 10px", border: "1px solid #d1d5db", borderRadius: 5, color: "#374151", background: "#fff", display: "inline-flex", alignItems: "center", gap: 4 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 11 }),
                " Add document / photo"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", color: "#9ca3af" }, children: "JPG, PNG or PDF — uploaded when you save" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setAddOpen(false);
          setEditRecord(null);
          setForm(EMPTY);
          setPendingFiles([]);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "bg-green-800 hover:bg-green-900 text-white", disabled: createMut.isPending || updateMut.isPending || pendingUploading, onClick: () => {
          if (editRecord) {
            if (!form.invoiceDate || !form.supplierName || !form.numberOfHead || !form.totalAmountPence) {
              toast({ title: "Invoice date, supplier, head count and total are required", variant: "destructive" });
              return;
            }
            const body = { ...form, numberOfHead: parseInt(String(form.numberOfHead)), pricePerHeadPence: form.pricePerHeadPence ? Math.round(parseFloat(form.pricePerHeadPence) * 100) : null, totalAmountPence: Math.round(parseFloat(form.totalAmountPence) * 100), vatAmountPence: form.vatAmountPence ? Math.round(parseFloat(form.vatAmountPence) * 100) : null, paymentTermsDays: form.paymentTermsDays ? parseInt(String(form.paymentTermsDays)) : 30, herdId: form.herdId && form.herdId !== "__none__" ? parseInt(String(form.herdId)) : null };
            updateMut.mutate({ ...body, id: editRecord.id });
          } else {
            handleSaveNew();
          }
        }, children: pendingUploading ? "Uploading files…" : editRecord ? "Save Changes" : "Add Invoice" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) setDeleteId(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Invoice" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "Permanently delete this livestock purchase invoice?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", disabled: deleteMut.isPending, onClick: () => deleteId !== null && deleteMut.mutate(deleteId), children: "Delete" })
      ] })
    ] }) })
  ] });
}
const PIE_COLOURS = ["#16a34a", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6", "#f97316", "#ec4899", "#6366f1", "#84cc16", "#06b6d4", "#a855f7"];
function FinancialAnalyticsTab({ farmId }) {
  const [yearFilter, setYearFilter] = reactExports.useState(String((/* @__PURE__ */ new Date()).getFullYear()));
  const txQ = useQuery({
    queryKey: ["financial-transactions", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/financial-transactions`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const allTx = txQ.data ?? [];
  const yearOptions = [...new Set(allTx.map((r) => r.transactionDate ? String(new Date(r.transactionDate).getFullYear()) : null).filter((x) => Boolean(x)))].sort().reverse();
  const yearTx = yearFilter === "all" ? allTx : allTx.filter((r) => r.transactionDate && String(new Date(r.transactionDate).getFullYear()) === yearFilter);
  const monthMap = /* @__PURE__ */ new Map();
  yearTx.forEach((r) => {
    if (!r.transactionDate) return;
    const d = new Date(r.transactionDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
    if (!monthMap.has(key)) monthMap.set(key, { month: key, label, income: 0, expense: 0 });
    const b = monthMap.get(key);
    const amt = (r.amountPence ?? 0) / 100;
    if (r.transactionType === "income") b.income += amt;
    else b.expense += amt;
  });
  const monthData = [...monthMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => ({ ...v, income: parseFloat(v.income.toFixed(2)), expense: parseFloat(v.expense.toFixed(2)), net: parseFloat((v.income - v.expense).toFixed(2)) }));
  const catMap = /* @__PURE__ */ new Map();
  yearTx.forEach((r) => {
    const cat = r.category || "Uncategorised";
    if (!catMap.has(cat)) catMap.set(cat, { category: cat, income: 0, expense: 0 });
    const b = catMap.get(cat);
    const amt = (r.amountPence ?? 0) / 100;
    if (r.transactionType === "income") b.income += amt;
    else b.expense += amt;
  });
  const catData = [...catMap.values()].sort((a, b) => b.income + b.expense - (a.income + a.expense)).slice(0, 12);
  const expenseCats = [...catMap.values()].filter((c) => c.expense > 0).sort((a, b) => b.expense - a.expense).slice(0, 8).map((c) => ({ name: c.category, value: parseFloat(c.expense.toFixed(2)) }));
  const incomeCats = [...catMap.values()].filter((c) => c.income > 0).sort((a, b) => b.income - a.income).slice(0, 8).map((c) => ({ name: c.category, value: parseFloat(c.income.toFixed(2)) }));
  let runningNet = 0;
  const cumulData = monthData.map((m) => {
    runningNet += m.net;
    return { label: m.label, cumulative: parseFloat(runningNet.toFixed(2)) };
  });
  const totalIncome = yearTx.filter((r) => r.transactionType === "income").reduce((s, r) => s + (r.amountPence ?? 0), 0) / 100;
  const totalExpense = yearTx.filter((r) => r.transactionType === "expense").reduce((s, r) => s + (r.amountPence ?? 0), 0) / 100;
  const netBalance = totalIncome - totalExpense;
  if (txQ.isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 text-center py-16", children: "Loading financial data…" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-gray-700 shrink-0", children: "Year" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilter, onValueChange: setYearFilter, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
          yearOptions.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 border border-green-200 rounded-xl p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 uppercase font-medium mb-1", children: "Total Income" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-green-700", children: [
          "£",
          totalIncome.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-50 border border-red-200 rounded-xl p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 uppercase font-medium mb-1", children: "Total Expenditure" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-red-600", children: [
          "£",
          totalExpense.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `${netBalance >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"} border rounded-xl p-4`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400 uppercase font-medium mb-1", children: [
          "Net ",
          netBalance >= 0 ? "Surplus" : "Deficit"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `text-2xl font-bold ${netBalance >= 0 ? "text-green-700" : "text-red-600"}`, children: [
          "£",
          Math.abs(netBalance).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        ] })
      ] })
    ] }),
    monthData.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-400", children: "No transaction data for this period." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-4", children: "Monthly Income vs Expenditure (£)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 260, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: monthData, margin: { top: 4, right: 16, left: 0, bottom: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f0f0f0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tick: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tickFormatter: (v) => `£${v >= 1e3 ? `${(v / 1e3).toFixed(0)}k` : v.toFixed(0)}`, tick: { fontSize: 11 }, width: 65 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`£${v.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`, ""] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "income", fill: "#16a34a", name: "Income", radius: [3, 3, 0, 0] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "expense", fill: "#ef4444", name: "Expenditure", radius: [3, 3, 0, 0] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-4", children: "Cumulative Net Position (£)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 200, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: cumulData, margin: { top: 4, right: 16, left: 0, bottom: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f0f0f0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tick: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tickFormatter: (v) => `£${v >= 1e3 ? `${(v / 1e3).toFixed(0)}k` : v >= -1e3 ? v.toFixed(0) : `${(v / 1e3).toFixed(0)}k`}`, tick: { fontSize: 11 }, width: 65 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`£${v.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`, "Running total"] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: "cumulative", stroke: netBalance >= 0 ? "#16a34a" : "#ef4444", strokeWidth: 2.5, dot: false })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
        expenseCats.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-4", children: "Expenditure by Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 220, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: expenseCats, dataKey: "value", nameKey: "name", cx: "40%", cy: "50%", outerRadius: 85, label: false, children: expenseCats.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: PIE_COLOURS[i % PIE_COLOURS.length] }, i)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`£${v.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`, ""] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { layout: "vertical", align: "right", verticalAlign: "middle", formatter: (name) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 11 }, children: name }) })
          ] }) })
        ] }),
        incomeCats.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-4", children: "Income by Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 220, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: incomeCats, dataKey: "value", nameKey: "name", cx: "40%", cy: "50%", outerRadius: 85, label: false, children: incomeCats.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: PIE_COLOURS[i % PIE_COLOURS.length] }, i)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`£${v.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`, ""] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { layout: "vertical", align: "right", verticalAlign: "middle", formatter: (name) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 11 }, children: name }) })
          ] }) })
        ] })
      ] }),
      catData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-4", children: "Income & Expenditure by Category (£)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: Math.max(200, catData.length * 34), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: catData, layout: "vertical", margin: { top: 4, right: 24, left: 0, bottom: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f0f0f0", horizontal: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", tickFormatter: (v) => `£${v >= 1e3 ? `${(v / 1e3).toFixed(0)}k` : v.toFixed(0)}`, tick: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "category", tick: { fontSize: 11 }, width: 160 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`£${v.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`, ""] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "income", fill: "#16a34a", name: "Income", radius: [0, 3, 3, 0] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "expense", fill: "#ef4444", name: "Expenditure", radius: [0, 3, 3, 0] })
        ] }) })
      ] })
    ] })
  ] });
}
function AccountantPackTab({ farmId }) {
  const [yearFilter, setYearFilter] = reactExports.useState(String(CURRENT_YEAR));
  const farmQ = useQuery({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.record
  });
  const farm = farmQ.data;
  const txQ = useQuery({
    queryKey: ["financial-transactions", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/financial-transactions`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const purchasesQ = useQuery({
    queryKey: ["livestock-purchases", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/livestock-purchases`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const allTx = txQ.data ?? [];
  const allPurchases = purchasesQ.data ?? [];
  const isLoading = txQ.isLoading || purchasesQ.isLoading || farmQ.isLoading;
  const yearTx = allTx.filter((r) => {
    if (yearFilter === "all") return true;
    return r.transactionDate && new Date(r.transactionDate).getFullYear() === parseInt(yearFilter);
  });
  const yearPurchases = allPurchases.filter((r) => {
    if (yearFilter === "all") return true;
    const d = r.invoiceDate || r.arrivalDate;
    return d && new Date(d).getFullYear() === parseInt(yearFilter);
  });
  const incomeTx = yearTx.filter((r) => r.transactionType === "income");
  const expenseTx = yearTx.filter((r) => r.transactionType === "expense");
  const incomeByCategory = INCOME_CATEGORIES.map((cat) => ({ cat, total: incomeTx.filter((r) => r.category === cat).reduce((s, r) => s + (r.amountPence ?? 0), 0) })).filter((r) => r.total > 0);
  const otherIncome = incomeTx.filter((r) => !INCOME_CATEGORIES.includes(r.category ?? "")).reduce((s, r) => s + (r.amountPence ?? 0), 0);
  if (otherIncome > 0) incomeByCategory.push({ cat: "Other / Uncategorised Income", total: otherIncome });
  const expenseByCategory = EXPENSE_CATEGORIES.map((cat) => ({ cat, total: expenseTx.filter((r) => r.category === cat).reduce((s, r) => s + (r.amountPence ?? 0), 0) })).filter((r) => r.total > 0);
  const lsPurchaseTotal = yearPurchases.reduce((s, r) => s + (Number(r.totalAmountPence) || 0), 0);
  const lsPurchaseVat = yearPurchases.reduce((s, r) => s + (Number(r.vatAmountPence) || 0), 0);
  const txVatTotal = yearTx.reduce((s, r) => s + (r.vatAmountPence ?? 0), 0);
  if (lsPurchaseTotal > 0) {
    expenseByCategory.unshift({ cat: "Livestock Purchases", total: lsPurchaseTotal });
  }
  const otherExpense = expenseTx.filter((r) => !EXPENSE_CATEGORIES.includes(r.category ?? "")).reduce((s, r) => s + (r.amountPence ?? 0), 0);
  if (otherExpense > 0) expenseByCategory.push({ cat: "Other / Uncategorised Expenses", total: otherExpense });
  const totalIncome = incomeByCategory.reduce((s, r) => s + r.total, 0);
  const totalExpense = expenseByCategory.reduce((s, r) => s + r.total, 0);
  const netProfit = totalIncome - totalExpense;
  const totalVat = txVatTotal + lsPurchaseVat;
  const periodLabel = yearFilter === "all" ? "All Years" : yearFilter;
  function handlePrint() {
    const farmName = farm?.name ?? "Farm";
    const address = [farm?.addressLine1, farm?.addressTown, farm?.addressCounty, farm?.addressPostcode].filter(Boolean).join(", ");
    const vatReg = farm?.vatNumber ? `VAT Reg No: ${farm.vatNumber}` : "";
    const generated = (/* @__PURE__ */ new Date()).toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" });
    const f = (pence) => `£${(pence / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const incomeRows = incomeByCategory.map((r) => `<tr><td>${r.cat}</td><td class="num">${f(r.total)}</td></tr>`).join("");
    const expenseRows = expenseByCategory.map((r) => `<tr><td>${r.cat}</td><td class="num">${f(r.total)}</td></tr>`).join("");
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Accountant's Financial Pack — ${farmName} — ${periodLabel}</title>
  <style>
    @page { size: A4 portrait; margin: 18mm 18mm 16mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 10pt; color: #111; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 10px; border-bottom: 3px solid #15803d; margin-bottom: 16px; }
    .header h1 { font-size: 20pt; font-weight: 800; color: #15803d; }
    .header h2 { font-size: 11pt; font-weight: 600; color: #374151; margin-top: 3px; }
    .header p  { font-size: 9pt; color: #6b7280; margin-top: 2px; }
    .header-right { text-align: right; font-size: 9pt; color: #6b7280; }
    .header-right strong { display: block; font-size: 11pt; color: #111; font-weight: 700; }
    .summary-bar { display: flex; gap: 16px; margin-bottom: 20px; }
    .summary-card { flex: 1; border-radius: 6px; padding: 12px 16px; }
    .summary-card .lbl { font-size: 8pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px; }
    .summary-card .amt { font-size: 16pt; font-weight: 800; }
    .income-card  { background: #f0fdf4; border: 1.5px solid #16a34a; }
    .income-card .lbl { color: #166534; } .income-card .amt { color: #15803d; }
    .expense-card { background: #fff1f2; border: 1.5px solid #ef4444; }
    .expense-card .lbl { color: #991b1b; } .expense-card .amt { color: #dc2626; }
    .net-pos { background: #f0fdf4; border: 2px solid #15803d; }
    .net-pos .lbl { color: #166534; } .net-pos .amt { color: #15803d; }
    .net-neg { background: #fff1f2; border: 2px solid #dc2626; }
    .net-neg .lbl { color: #991b1b; } .net-neg .amt { color: #dc2626; }
    .section-title { font-size: 11pt; font-weight: 700; color: #374151; margin: 0 0 6px; padding-bottom: 4px; border-bottom: 1px solid #e5e7eb; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10pt; }
    th { background: #f9fafb; text-align: left; padding: 6px 10px; font-size: 8.5pt; font-weight: 700; color: #374151; border-bottom: 2px solid #e5e7eb; }
    td { padding: 6px 10px; border-bottom: 1px solid #f3f4f6; }
    .num { text-align: right; font-variant-numeric: tabular-nums; }
    .total-row td { font-weight: 700; background: #f9fafb; border-top: 2px solid #e5e7eb; border-bottom: none; }
    .vat-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px 16px; margin-bottom: 16px; font-size: 9.5pt; }
    .vat-box strong { color: #1d4ed8; }
    .disclaimer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #e5e7eb; font-size: 8pt; color: #9ca3af; }
    .footer { display: flex; justify-content: space-between; font-size: 8pt; color: #9ca3af; margin-top: 6px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>BDE Farm Trac</h1>
      <h2>${farmName}</h2>
      <p>${address}${vatReg ? " &nbsp;·&nbsp; " + vatReg : ""}</p>
    </div>
    <div class="header-right">
      <strong>Accountant's Financial Pack</strong>
      Period: ${periodLabel}<br>
      Produced: ${generated}<br>
      <span style="background:#dcfce7;color:#166534;border-radius:4px;padding:2px 8px;font-size:8pt;font-weight:700;">Barnett Davies Enterprises Ltd</span>
    </div>
  </div>

  <div class="summary-bar">
    <div class="summary-card income-card">
      <div class="lbl">Total Income</div>
      <div class="amt">${f(totalIncome)}</div>
    </div>
    <div class="summary-card expense-card">
      <div class="lbl">Total Expenditure</div>
      <div class="amt">${f(totalExpense)}</div>
    </div>
    <div class="summary-card ${netProfit >= 0 ? "net-pos" : "net-neg"}">
      <div class="lbl">Net ${netProfit >= 0 ? "Profit" : "Loss"} Estimate</div>
      <div class="amt">${netProfit < 0 ? "(" : ""}${f(Math.abs(netProfit))}${netProfit < 0 ? ")" : ""}</div>
    </div>
  </div>

  <p class="section-title">Income</p>
  <table>
    <thead><tr><th>Category</th><th class="num">Amount</th></tr></thead>
    <tbody>
      ${incomeRows || "<tr><td colspan='2' style='color:#9ca3af;text-align:center'>No income recorded for this period</td></tr>"}
      <tr class="total-row"><td>Total Income</td><td class="num">${f(totalIncome)}</td></tr>
    </tbody>
  </table>

  <p class="section-title">Expenditure</p>
  <table>
    <thead><tr><th>Category</th><th class="num">Amount</th></tr></thead>
    <tbody>
      ${expenseRows || "<tr><td colspan='2' style='color:#9ca3af;text-align:center'>No expenditure recorded for this period</td></tr>"}
      <tr class="total-row"><td>Total Expenditure</td><td class="num">${f(totalExpense)}</td></tr>
    </tbody>
  </table>

  ${totalVat > 0 ? `<div class="vat-box"><strong>VAT Note:</strong> Total VAT recorded across all transactions and livestock purchases for ${periodLabel}: <strong>${f(totalVat)}</strong>. This figure is for reference only — please reconcile against your VAT returns.</div>` : ""}

  <div class="disclaimer">
    <p>This report is produced from records entered into BDE Farm Trac and is provided for information purposes only. It does not constitute a set of audited accounts. All figures should be verified by your accountant before submission to HMRC or other authorities. Auto-imported transactions from sales modules are included.</p>
    <div class="footer">
      <span>BDE Farm Trac — Barnett Davies Enterprises Ltd &nbsp;·&nbsp; Confidential</span>
      <span>Generated: ${generated}</span>
    </div>
  </div>
</body>
</html>`;
    const win = window.open("", "_blank", "width=820,height=720");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.addEventListener("afterprint", () => win.close());
      win.print();
    }, 400);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { fontSize: "1.05rem", fontWeight: 700, color: "#111827", marginBottom: 3 }, children: "Accountant's Financial Pack" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.825rem", color: "#6b7280" }, children: "Income & expenditure summary across all modules — ready to send to your accountant." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, alignItems: "center" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilter, onValueChange: setYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { style: { width: 120 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Years" }),
            YEARS.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(y), children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handlePrint, disabled: isLoading, className: "bg-green-800 hover:bg-green-900 text-white", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 14, className: "mr-2" }),
          "Generate & Print Pack"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 28, style: { margin: "0 auto 12px", animation: "spin 1s linear infinite" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: "Loading financial data…" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #bbf7d0", borderRadius: 10, padding: "1rem 1.25rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }, children: "Total Income" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.5rem", fontWeight: 700, color: "#166534" }, children: fmtAmt(totalIncome) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.72rem", color: "#9ca3af", marginTop: 2 }, children: [
            incomeTx.length,
            " transaction",
            incomeTx.length !== 1 ? "s" : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #fecaca", borderRadius: 10, padding: "1rem 1.25rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }, children: "Total Expenditure" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.5rem", fontWeight: 700, color: "#dc2626" }, children: fmtAmt(totalExpense) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.72rem", color: "#9ca3af", marginTop: 2 }, children: [
            expenseTx.length,
            " transaction",
            expenseTx.length !== 1 ? "s" : "",
            lsPurchaseTotal > 0 ? ` + ${yearPurchases.length} livestock purchase invoice${yearPurchases.length !== 1 ? "s" : ""}` : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: `1px solid ${netProfit >= 0 ? "#bbf7d0" : "#fecaca"}`, borderRadius: 10, padding: "1rem 1.25rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.72rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }, children: [
            "Net ",
            netProfit >= 0 ? "Profit" : "Loss",
            " Estimate"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.5rem", fontWeight: 700, color: netProfit >= 0 ? "#166534" : "#dc2626" }, children: fmtAmt(Math.abs(netProfit)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#9ca3af", marginTop: 2 }, children: "Before tax — verify with accountant" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontSize: "0.875rem", fontWeight: 700, color: "#166534", marginBottom: 8 }, children: "Income by Category" }),
          incomeByCategory.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", color: "#9ca3af", padding: "1.5rem", border: "1px dashed #e5e7eb", borderRadius: 8, fontSize: "0.825rem" }, children: [
            "No income recorded for ",
            periodLabel
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "7px 10px", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }, children: "Category" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "7px 10px", textAlign: "right", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }, children: "Amount" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: incomeByCategory.map((r, i, arr) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < arr.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "7px 10px", color: "#374151" }, children: r.cat }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "7px 10px", textAlign: "right", fontWeight: 600, color: "#166534" }, children: fmtAmt(r.total) })
            ] }, r.cat)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderTop: "2px solid #d1fae5", background: "#f0fdf4" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px", fontWeight: 700, color: "#111827" }, children: "Total Income" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px", textAlign: "right", fontWeight: 700, color: "#166534", fontSize: "1rem" }, children: fmtAmt(totalIncome) })
            ] }) })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontSize: "0.875rem", fontWeight: 700, color: "#dc2626", marginBottom: 8 }, children: "Expenditure by Category" }),
          expenseByCategory.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", color: "#9ca3af", padding: "1.5rem", border: "1px dashed #e5e7eb", borderRadius: 8, fontSize: "0.825rem" }, children: [
            "No expenditure recorded for ",
            periodLabel
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "7px 10px", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }, children: "Category" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "7px 10px", textAlign: "right", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }, children: "Amount" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: expenseByCategory.map((r, i, arr) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < arr.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "7px 10px", color: "#374151" }, children: r.cat }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "7px 10px", textAlign: "right", fontWeight: 600, color: "#dc2626" }, children: fmtAmt(r.total) })
            ] }, r.cat)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderTop: "2px solid #fecaca", background: "#fff1f2" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px", fontWeight: 700, color: "#111827" }, children: "Total Expenditure" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px", textAlign: "right", fontWeight: 700, color: "#dc2626", fontSize: "1rem" }, children: fmtAmt(totalExpense) })
            ] }) })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 20, display: "flex", gap: 14, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1, minWidth: 260, background: netProfit >= 0 ? "#f0fdf4" : "#fff1f2", border: `2px solid ${netProfit >= 0 ? "#16a34a" : "#dc2626"}`, borderRadius: 10, padding: "1rem 1.25rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 700, color: netProfit >= 0 ? "#166534" : "#991b1b", marginBottom: 4 }, children: [
            "Net ",
            netProfit >= 0 ? "Profit" : "Loss",
            " Estimate — ",
            periodLabel
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.8rem", fontWeight: 800, color: netProfit >= 0 ? "#15803d" : "#dc2626" }, children: [
            netProfit < 0 ? "(" : "",
            fmtAmt(Math.abs(netProfit)),
            netProfit < 0 ? ")" : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#6b7280", marginTop: 4 }, children: "Before tax. Verify with your accountant before HMRC submission." })
        ] }),
        totalVat > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1, minWidth: 260, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "1rem 1.25rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 700, color: "#1d4ed8", marginBottom: 4 }, children: "VAT Reference Total" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.8rem", fontWeight: 800, color: "#1d4ed8" }, children: fmtAmt(totalVat) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#6b7280", marginTop: 4 }, children: "Combined VAT from all transactions & livestock purchase invoices. Reconcile against your VAT returns." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 16, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", fontSize: "0.78rem", color: "#6b7280" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { style: { color: "#374151" }, children: "Note:" }),
        " Income figures include auto-imported sales from grain, livestock, milk and other modules. Expenditure includes all financial transaction records plus livestock purchase invoices. This is an estimate — your accountant should verify against bank statements and source documents."
      ] })
    ] })
  ] });
}
function FinancialPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = usePersistedTab({
    page: "financial",
    farmId,
    validIds: ["transactions", "crop-contracts", "grants", "livestock-purchases", "analytics", "accountant-pack"],
    defaultTab: "transactions"
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Financial Records", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { maxWidth: 1200, margin: "0 auto" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mb-4", children: "Income, expenses, crop contracts and government scheme payments for this farm." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "transactions", onClick: () => setTab("transactions"), children: "Transactions" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "crop-contracts", onClick: () => setTab("crop-contracts"), children: "Crop Contracts" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "grants", onClick: () => setTab("grants"), children: "Subsidies & Grants" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "livestock-purchases", onClick: () => setTab("livestock-purchases"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "w-3.5 h-3.5" }),
        "Livestock Purchases"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "analytics", onClick: () => setTab("analytics"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "w-3.5 h-3.5" }),
        "Analytics"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "accountant-pack", onClick: () => setTab("accountant-pack"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-3.5 h-3.5" }),
        "Accountant's Pack"
      ] }) })
    ] }),
    farmId && tab === "transactions" && /* @__PURE__ */ jsxRuntimeExports.jsx(TransactionsTab, { farmId }),
    farmId && tab === "crop-contracts" && /* @__PURE__ */ jsxRuntimeExports.jsx(CropContractsTab, { farmId }),
    farmId && tab === "grants" && /* @__PURE__ */ jsxRuntimeExports.jsx(GrantsTab, { farmId }),
    farmId && tab === "livestock-purchases" && /* @__PURE__ */ jsxRuntimeExports.jsx(LivestockPurchasesTab, { farmId }),
    farmId && tab === "analytics" && /* @__PURE__ */ jsxRuntimeExports.jsx(FinancialAnalyticsTab, { farmId }),
    farmId && tab === "accountant-pack" && /* @__PURE__ */ jsxRuntimeExports.jsx(AccountantPackTab, { farmId })
  ] }) });
}
export {
  FinancialPage as default
};
