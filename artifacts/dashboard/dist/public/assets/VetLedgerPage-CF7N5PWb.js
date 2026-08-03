import { b as useAppStore, a as useToast, t as useQueryClient, r as reactExports, l as useQuery, O as useMutation, j as jsxRuntimeExports, c as Button, S as Plus, I as Input, T as FlaskConical, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, C as Checkbox, $ as X, J as DialogFooter, Q as React } from "./index-DmKdQ7dc.js";
import { T as Textarea } from "./textarea-B3BnPnd9.js";
import { B as Badge } from "./badge-Dd9DmBNE.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BV5DYUfS.js";
import { R as RaiseTaskDialog } from "./RaiseTaskDialog-CHk2REty.js";
import { A as AppLayout, q as Stethoscope, c as ClipboardList } from "./AppLayout-043XWITg.js";
import { R as RecordAttachments } from "./RecordAttachments-djZZsEr9.js";
import { P as Printer } from "./printer-3OaRJkrz.js";
import { a as Clock, C as CircleAlert } from "./database-BIWxw2sm.js";
import { R as Receipt } from "./receipt-BxvhZKbU.js";
import { T as TriangleAlert } from "./triangle-alert-BqKtXZ3i.js";
import { P as Package } from "./use-safe-clerk-CdeIM_NL.js";
import { E as Eye } from "./eye-DSB64hhJ.js";
import { P as Pen } from "./pen-D-bYgCur.js";
import { T as Trash2 } from "./trash-2-BLmnrwB4.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, B as Bar, C as Cell } from "./generateCategoricalChart-DOYeVRpn.js";
import { B as BarChart } from "./BarChart-B4qWdcWX.js";
import { C as CartesianGrid } from "./CartesianGrid-s4kVRORo.js";
import { P as PieChart, a as Pie } from "./PieChart-7SUMuueP.js";
import { E as ExternalLink } from "./external-link-bHGW0FPH.js";
import { C as CircleCheck } from "./circle-check-CLHgZ2bc.js";
import { C as ChevronRight } from "./tractor-js2Kek-5.js";
import "./index-B1W-aXvq.js";
import "./index-BolDo61T.js";
import "./chevron-up-DTDCi_Cf.js";
import "./shield-alert-Bs5wl-Zd.js";
import "./shield-check-rhIGv_FB.js";
import "./use-upload-0vf59cYw.js";
import "./paperclip-BPYPOACx.js";
import "./upload-Cbg7Msjr.js";
import "./image--TuRSaTs.js";
import "./download-B6tmnwIL.js";
const LINE_TYPES = [
  { value: "call_out", label: "Call-out fee" },
  { value: "consultation", label: "Consultation / Exam" },
  { value: "medicine", label: "Medicine / Vaccination" },
  { value: "lab_test", label: "Lab test / Sample analysis" },
  { value: "scanning", label: "Scanning / Pregnancy testing" },
  { value: "tb_testing", label: "TB Testing" },
  { value: "procedure", label: "Minor procedure / Castration / Disbudding" },
  { value: "other", label: "Other" }
];
const MEDICINE_UNITS = ["ml", "g", "kg", "tablets", "doses", "tubes", "sachets", "other"];
function PaymentBadge({ status }) {
  if (status === "paid") return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", style: { background: "#dcfce7", color: "#166534", border: "none" }, children: "Paid" });
  if (status === "overdue") return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", style: { background: "#fee2e2", color: "#991b1b", border: "none" }, children: "Overdue" });
  if (status === "disputed") return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", style: { background: "#fef9c3", color: "#713f12", border: "none" }, children: "Disputed" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", style: { background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb" }, children: "Unpaid" });
}
function ReconBadge({ status }) {
  if (status === "reconciled") return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", style: { background: "#dcfce7", color: "#166534", border: "none" }, children: "✓ Reconciled" });
  if (status === "partial") return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", style: { background: "#fef3c7", color: "#92400e", border: "none" }, children: "⚡ Partial" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", style: { background: "#fee2e2", color: "#991b1b", border: "none" }, children: "✗ Unreconciled" });
}
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB");
}
function fmtGbp(v) {
  if (!v && v !== 0) return "—";
  return `£${Number(v).toFixed(2)}`;
}
function lineTypeLabel(t) {
  return LINE_TYPES.find((l) => l.value === t)?.label ?? t;
}
function blankMed() {
  return { medicineName: "", batchNumber: "", quantityUsed: "", unit: "ml", withdrawalPeriodDays: "", vetDispensed: true, notes: "" };
}
function blankLine() {
  return { lineType: "consultation", description: "", quantity: "1", unitPriceGbp: "", lineTotalGbp: "", visitId: "", isMatched: false, matchNote: "" };
}
function AnimalMultiPicker({ animals, selected, onChange, filterSpecies, filterHerdIds }) {
  const [q, setQ] = React.useState("");
  const filtered = animals.filter((a) => !filterSpecies || a.species === filterSpecies).filter((a) => !filterHerdIds?.length || a.herdId != null && filterHerdIds.includes(a.herdId)).filter((a) => {
    if (!q.trim()) return true;
    const tag = String(a.tagNumber ?? a.earTagNumber ?? "").toLowerCase();
    return tag.includes(q.toLowerCase());
  });
  if (animals.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 italic", children: "No animals in the Individual Animal Register. Add them in Livestock → Animals first." });
  function toggle(id) {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-md p-2 bg-white", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        value: q,
        onChange: (e) => setQ(e.target.value),
        placeholder: "Search by tag number…",
        className: "w-full text-xs border-0 bg-transparent outline-none placeholder:text-gray-400 mb-2 pb-1 border-b border-gray-100"
      }
    ),
    selected.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1 mb-2", children: selected.map((id) => {
      const a = animals.find((x) => x.id === id);
      if (!a) return null;
      const tag = String(a.tagNumber ?? a.earTagNumber ?? `ID ${a.id}`);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium", children: [
        tag,
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => toggle(id), className: "text-green-600 hover:text-red-600", children: "×" })
      ] }, id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-36 overflow-y-auto flex flex-col gap-0.5", children: [
      filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 italic py-1", children: "No animals match." }),
      filtered.map((a) => {
        const tag = String(a.tagNumber ?? a.earTagNumber ?? `ID ${a.id}`);
        const isSelected = selected.includes(a.id);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => toggle(a.id),
            className: `text-left w-full px-2 py-1 rounded text-xs flex items-center gap-2 transition-colors ${isSelected ? "bg-green-100 text-green-800 font-medium" : "hover:bg-gray-50 text-gray-700"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-3 h-3 rounded-full border-2 shrink-0 ${isSelected ? "bg-green-600 border-green-600" : "border-gray-300"}` }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: tag }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-400 capitalize", children: [
                a.species,
                a.breed ? ` · ${a.breed}` : ""
              ] })
            ]
          },
          a.id
        );
      })
    ] })
  ] });
}
const VET_COLORS = ["#15803d", "#a16207", "#1d4ed8", "#b91c1c", "#7c3aed", "#0e7490"];
function VetAnalyticsSection({ visits, invoices }) {
  const visitsByMonth = reactExports.useMemo(() => {
    const map = {};
    visits.forEach((v) => {
      const d = String(v.visitDate ?? "");
      const k = d.slice(0, 7);
      if (k.length < 7) return;
      map[k] = (map[k] || 0) + 1;
    });
    return Object.entries(map).sort().slice(-12).map(([m, count]) => ({ month: m.slice(5), count }));
  }, [visits]);
  const invoiceCostByMonth = reactExports.useMemo(() => {
    const map = {};
    invoices.forEach((inv) => {
      const d = String(inv.invoiceDate ?? inv.date ?? "");
      const k = d.slice(0, 7);
      if (k.length < 7) return;
      map[k] = (map[k] || 0) + (Number(inv.totalAmountPence) / 100 || Number(inv.totalAmount) || 0);
    });
    return Object.entries(map).sort().slice(-12).map(([m, val]) => ({ month: m.slice(5), cost: +val.toFixed(2) }));
  }, [invoices]);
  const byVet = reactExports.useMemo(() => {
    const map = {};
    visits.forEach((v) => {
      const n = String(v.vetName || v.practice || "Unknown");
      map[n] = (map[n] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name: name.length > 16 ? name.slice(0, 15) + "…" : name, value }));
  }, [visits]);
  const totalCost = reactExports.useMemo(() => invoices.reduce((s, inv) => s + (Number(inv.totalAmountPence) / 100 || Number(inv.totalAmount) || 0), 0), [invoices]);
  const uniqueVets = reactExports.useMemo(() => new Set(visits.map((v) => v.vetName)).size, [visits]);
  const noData = visits.length === 0 && invoices.length === 0;
  if (noData) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-gray-400 text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No data yet" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1", children: "Log vet visits and invoices to see analytics." })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
      { label: "Vet Visits", value: visits.length, bg: "bg-green-50 border-green-100", text: "text-green-800", sub: "text-green-700" },
      { label: "Unique Vets", value: uniqueVets, bg: "bg-blue-50 border-blue-100", text: "text-blue-800", sub: "text-blue-700" },
      { label: "Invoices", value: invoices.length, bg: "bg-amber-50 border-amber-100", text: "text-amber-800", sub: "text-amber-700" },
      { label: "Total Invoice Cost", value: `£${totalCost.toLocaleString(void 0, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, bg: "bg-purple-50 border-purple-100", text: "text-purple-800", sub: "text-purple-700" }
    ].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `${c.bg} rounded-xl border p-4 text-center`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-2xl font-bold ${c.text}`, children: c.value }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs mt-0.5 ${c.sub}`, children: c.label })
    ] }, c.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: [
      visitsByMonth.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-4", children: "Vet Visits by Month" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-52", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: visitsByMonth, margin: { left: 0, right: 8, top: 4, bottom: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "month", tick: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 11 }, allowDecimals: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v}`, "Visits"] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "count", fill: "#15803d", radius: [3, 3, 0, 0] })
        ] }) }) })
      ] }),
      invoiceCostByMonth.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-4", children: "Invoice Cost by Month (£)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-52", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: invoiceCostByMonth, margin: { left: 0, right: 8, top: 4, bottom: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "month", tick: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 11 }, tickFormatter: (v) => `£${v}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`£${Number(v).toLocaleString()}`, "Cost"] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "cost", fill: "#1d4ed8", radius: [3, 3, 0, 0] })
        ] }) }) })
      ] }),
      byVet.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-4", children: "Visits by Vet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-52", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: byVet, cx: "50%", cy: "50%", outerRadius: 75, dataKey: "value", label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`, labelLine: false, children: byVet.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: VET_COLORS[i % VET_COLORS.length] }, i)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v}`, "Visits"] })
        ] }) }) })
      ] })
    ] })
  ] });
}
function VetLedgerPage() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["vet-visits", farmId] });
    queryClient.invalidateQueries({ queryKey: ["vet-invoices", farmId] });
  };
  const [tab, setTab] = reactExports.useState("visits");
  const [amrmYear, setAmrmYear] = reactExports.useState((/* @__PURE__ */ new Date()).getFullYear());
  const [search, setSearch] = reactExports.useState("");
  const [raiseTaskVisit, setRaiseTaskVisit] = reactExports.useState(null);
  const visitsQ = useQuery({
    queryKey: ["vet-visits", farmId],
    queryFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/vet-visits`);
      if (!res.ok) throw new Error("Failed to load vet visits");
      return res.json();
    },
    enabled: !!farmId
  });
  const invoicesQ = useQuery({
    queryKey: ["vet-invoices", farmId],
    queryFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/vet-invoices`);
      if (!res.ok) throw new Error("Failed to load vet invoices");
      return res.json();
    },
    enabled: !!farmId
  });
  const herdsQ = useQuery({
    queryKey: ["herds", farmId],
    queryFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/herds`);
      if (!res.ok) return { records: [] };
      const data = await res.json();
      return { records: data.records ?? data ?? [] };
    },
    enabled: !!farmId
  });
  const visits = visitsQ.data?.records ?? [];
  const invoices = invoicesQ.data?.records ?? [];
  const herds = herdsQ.data?.records ?? [];
  const knownVets = [...new Set([...visits.map((v) => String(v.vetName ?? "")), ...invoices.map((i) => String(i.vetName ?? ""))].filter(Boolean))];
  const knownPractices = [...new Set([...visits.map((v) => String(v.vetPractice ?? "")), ...invoices.map((i) => String(i.vetPractice ?? ""))].filter(Boolean))];
  const medicineNamesQ = useQuery({
    queryKey: ["medicine-names-lookup", farmId],
    queryFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/medicine-records`);
      if (!res.ok) return { records: [] };
      return res.json();
    },
    enabled: !!farmId
  });
  const knownMedicineNames = [...new Set(
    (medicineNamesQ.data?.records ?? []).filter((r) => r.source !== "vet_ledger").map((r) => r.medicineName).filter(Boolean)
  )];
  const AMRM_CLASSES = [
    { label: "Penicillins", keywords: ["penicillin", "amoxicillin", "ampicillin", "cloxacillin", "co-amoxiclav", "synulox", "amoxibactin", "amoxil", "clamoxyl", "ampiclox", "penstrep", "duphapen", "shotapen"] },
    { label: "Tetracyclines", keywords: ["oxytetracycline", "doxycycline", "chlortetracycline", "terramycin", "engemycin", "duphacycline", "oxytetrin", "tetracycline"] },
    { label: "Macrolides", keywords: ["erythromycin", "tylosin", "tylan", "tilmicosin", "micotil", "tulathromycin", "draxxin", "gamithromycin", "zactran", "tildipirosin", "zuprevo"] },
    { label: "Fluoroquinolones", hpCia: true, keywords: ["enrofloxacin", "baytril", "marbofloxacin", "marbocyl", "danofloxacin", "advocin", "floxacin"] },
    { label: "Cephalosporins (3rd/4th gen)", hpCia: true, keywords: ["ceftiofur", "excenel", "cefquinome", "cobactan"] },
    { label: "Cephalosporins (1st/2nd gen)", keywords: ["cephalexin", "cephalosporin", "cefalexin", "cefuroxime", "cephaject", "cephalosporin", "cephaguard", "cefalonium", "pathozone"] },
    { label: "Sulphonamides / Trimethoprim", keywords: ["sulpha", "sulfa", "trimethoprim", "tribrissen", "borgal", "sulfadiazine", "sulfadimidine", "norodine"] },
    { label: "Aminoglycosides", keywords: ["streptomycin", "gentamicin", "genta", "apramycin", "apralan", "neomycin", "spectinomycin"] },
    { label: "Lincosamides", keywords: ["lincomycin", "pirlimycin", "ubrolexin", "lincospectin"] },
    { label: "Polymyxins", hpCia: true, keywords: ["colistin"] }
  ];
  function classifyAntibiotic(name) {
    const lower = name.toLowerCase();
    for (const cls of AMRM_CLASSES) {
      if (cls.keywords.some((k) => lower.includes(k))) return { label: cls.label, hpCia: !!cls.hpCia };
    }
    return null;
  }
  const allMedRecords = medicineNamesQ.data?.records ?? [];
  const amrmRecords = allMedRecords.filter((r) => {
    if (!r.administeredDate) return false;
    const yr = new Date(r.administeredDate).getFullYear();
    return yr === amrmYear && classifyAntibiotic(r.medicineName) !== null;
  });
  const amrmGroups = amrmRecords.reduce((acc, r) => {
    const cls = classifyAntibiotic(r.medicineName);
    if (!acc[cls.label]) acc[cls.label] = { label: cls.label, hpCia: cls.hpCia, count: 0, medicines: [] };
    acc[cls.label].count++;
    if (!acc[cls.label].medicines.includes(r.medicineName)) acc[cls.label].medicines.push(r.medicineName);
    return acc;
  }, {});
  const amrmGroupList = Object.values(amrmGroups).sort((a, b) => b.count - a.count);
  const hasHpCia = amrmGroupList.some((g) => g.hpCia && g.count > 0);
  const totalAntibioticCourses = amrmRecords.length;
  const farmProfile = useAppStore((s) => s.farmProfile);
  function printAmrmReport() {
    const lines = amrmGroupList.map((g) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${g.label}${g.hpCia ? ' <span style="background:#fef3c7;color:#92400e;font-size:0.7rem;padding:1px 4px;border-radius:4px;font-weight:700;">HP-CIA</span>' : ""}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${g.count}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:0.8rem;color:#6b7280;">${g.medicines.join(", ")}</td>
      </tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>AMRM Antibiotic Usage Report ${amrmYear}</title>
<style>body{font-family:Arial,sans-serif;margin:32px;color:#111;}h1{font-size:1.3rem;margin-bottom:4px;}table{width:100%;border-collapse:collapse;margin-top:20px;}th{background:#f3f4f6;padding:8px 12px;text-align:left;font-size:0.8rem;text-transform:uppercase;letter-spacing:.05em;border-bottom:2px solid #d1d5db;}td{vertical-align:top;}.footer{margin-top:32px;font-size:0.8rem;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:12px;}</style>
</head><body>
<h1>Antibiotic Usage Report (AMRM)</h1>
<p style="margin:0;font-size:0.9rem;color:#6b7280;">Farm: <strong>${farmProfile?.farmName ?? ""}</strong> &nbsp;|&nbsp; CPH: <strong>${farmProfile?.cphNumber ?? "—"}</strong> &nbsp;|&nbsp; SBI: <strong>${farmProfile?.sbi ?? "—"}</strong></p>
<p style="margin:4px 0;font-size:0.9rem;color:#6b7280;">Reporting Year: <strong>${amrmYear}</strong> &nbsp;|&nbsp; Generated: <strong>${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</strong></p>
${hasHpCia ? '<p style="background:#fef3c7;border:1px solid #fcd34d;padding:8px 12px;border-radius:6px;font-size:0.85rem;margin-top:12px;"><strong>⚠ HP-CIA use recorded.</strong> Highest Priority Critically Important Antibiotics were administered in this period. Ensure veterinary prescriptions and sensitivity testing documentation are on file.</p>' : ""}
<table>
<thead><tr><th>Antibiotic Class</th><th style="text-align:center;">Courses</th><th>Products Used</th></tr></thead>
<tbody>${lines}</tbody>
<tfoot><tr><td style="padding:8px 12px;font-weight:700;">Total Antibiotic Courses</td><td style="padding:8px 12px;text-align:center;font-weight:700;">${totalAntibioticCourses}</td><td></td></tr></tfoot>
</table>
<div class="footer">
<p>Vet Sign-Off: _____________________________ Date: ___________</p>
<p>This report is generated from livestock medicine records held in BDE Farm Trac. Antibiotic classification is based on medicine name pattern matching. Please verify with your vet or AHDB guidance if any classification is uncertain.</p>
</div>
</body></html>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.addEventListener("afterprint", () => w.close());
    w.print();
  }
  function printVisitLog() {
    const fmtD = (d) => d ? new Date(String(d)).toLocaleDateString("en-GB") : "—";
    const rows = visits.map((v) => `<tr>
      <td>${fmtD(v.visitDate)}</td>
      <td>${String(v.vetName ?? "—")}</td>
      <td>${String(v.vetPractice ?? "—")}</td>
      <td>${String(v.reasonForVisit ?? "—")}</td>
      <td>${String(v.diagnoses ?? "—")}</td>
      <td>${v.estimatedTotalGbp ? `£${parseFloat(String(v.estimatedTotalGbp)).toFixed(2)}` : "—"}</td>
      <td>${v.followUpDueDate ? fmtD(v.followUpDueDate) : "—"}</td>
      <td>${String(v.notes ?? "—")}</td>
    </tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Vet Visit Log</title>
<style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb;font-size:10px;vertical-align:top}tr:nth-child(even) td{background:#fafafa}.footer{margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px}@media print{@page{margin:1.5cm;size:landscape}}</style>
</head><body>
<h1>Vet Visit Log</h1>
<h2>Farm: <strong>${farmProfile?.farmName ?? "—"}</strong> · CPH: <strong>${farmProfile?.cphNumber ?? "—"}</strong> · ${visits.length} visit${visits.length !== 1 ? "s" : ""} · Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</h2>
<table><thead><tr><th>Visit Date</th><th>Vet Name</th><th>Practice</th><th>Reason for Visit</th><th>Diagnoses</th><th>Est. Cost</th><th>Follow-up Due</th><th>Notes</th></tr></thead>
<tbody>${rows}</tbody></table>
<p class="footer">Red Tractor requires documented vet visit records including the reason for visit and any medicines prescribed. Retain for a minimum of 3 years. Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</p>
</body></html>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.addEventListener("afterprint", () => w.close());
    w.print();
  }
  function printInvoiceRegister() {
    const fmtD = (d) => d ? new Date(String(d)).toLocaleDateString("en-GB") : "—";
    const fmtGbpP = (v) => v ? `£${parseFloat(String(v)).toLocaleString("en-GB", { minimumFractionDigits: 2 })}` : "—";
    const rows = invoices.map((inv) => `<tr>
      <td>${String(inv.invoiceNumber ?? "—")}</td>
      <td>${fmtD(inv.invoiceDate)}</td>
      <td>${String(inv.vetPractice ?? "—")}</td>
      <td>${String(inv.vetName ?? "—")}</td>
      <td>${fmtGbpP(inv.totalAmountGbp)}</td>
      <td>${String(inv.paymentStatus ?? "—")}</td>
      <td>${inv.paymentDate ? fmtD(inv.paymentDate) : "—"}</td>
      <td>${String(inv.reconciliationStatus ?? "—")}</td>
    </tr>`).join("");
    const total = invoices.reduce((s, i) => s + (parseFloat(String(i.totalAmountGbp ?? 0)) || 0), 0);
    const html = `<!DOCTYPE html><html><head><title>Vet Invoice Register</title>
<style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb;font-size:10px}tr:nth-child(even) td{background:#fafafa}tfoot td{font-weight:700;border-top:2px solid #d1d5db}.footer{margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px}@media print{@page{margin:1.5cm;size:landscape}}</style>
</head><body>
<h1>Vet Invoice Register</h1>
<h2>Farm: <strong>${farmProfile?.farmName ?? "—"}</strong> · CPH: <strong>${farmProfile?.cphNumber ?? "—"}</strong> · ${invoices.length} invoice${invoices.length !== 1 ? "s" : ""} · Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</h2>
<table><thead><tr><th>Invoice No.</th><th>Date</th><th>Practice</th><th>Vet</th><th>Total</th><th>Payment Status</th><th>Payment Date</th><th>Reconciliation</th></tr></thead>
<tbody>${rows}</tbody>
<tfoot><tr><td colspan="4">Total</td><td>£${total.toLocaleString("en-GB", { minimumFractionDigits: 2 })}</td><td colspan="3"></td></tr></tfoot>
</table>
<p class="footer">Vet invoice records should be retained and reconciled against payment records. Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</p>
</body></html>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.addEventListener("afterprint", () => w.close());
    w.print();
  }
  const animalsQ = useQuery({
    queryKey: ["animals", farmId],
    queryFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/animals`);
      if (!res.ok) return { records: [] };
      return res.json();
    },
    enabled: !!farmId
  });
  const allAnimals = (animalsQ.data?.records ?? []).filter((a) => String(a.status ?? "active") !== "deceased");
  const [showVisitDialog, setShowVisitDialog] = reactExports.useState(false);
  const [editVisit, setEditVisit] = reactExports.useState(null);
  const [visitForm, setVisitForm] = reactExports.useState({});
  const [visitMeds, setVisitMeds] = reactExports.useState([]);
  const [visitHerdIds, setVisitHerdIds] = reactExports.useState([]);
  const [visitAnimalIds, setVisitAnimalIds] = reactExports.useState([]);
  const [showViewVisitDialog, setShowViewVisitDialog] = reactExports.useState(false);
  const [viewVisit, setViewVisit] = reactExports.useState(null);
  const [showInvoiceDialog, setShowInvoiceDialog] = reactExports.useState(false);
  const [editInvoice, setEditInvoice] = reactExports.useState(null);
  const [invoiceForm, setInvoiceForm] = reactExports.useState({});
  const [invoiceLines, setInvoiceLines] = reactExports.useState([]);
  const [showViewInvoiceDialog, setShowViewInvoiceDialog] = reactExports.useState(false);
  const [viewInvoice, setViewInvoice] = reactExports.useState(null);
  const visitMut = useMutation({
    mutationFn: async (data) => {
      const url = editVisit ? `/api/farms/${farmId}/vet-visits/${editVisit.id}` : `/api/farms/${farmId}/vet-visits`;
      const res = await fetch(url, { method: editVisit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed to save visit");
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      setShowVisitDialog(false);
      toast({ title: editVisit ? "Visit updated" : "Visit logged" });
    },
    onError: () => toast({ title: "Error saving visit", variant: "destructive" })
  });
  const delVisitMut = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/farms/${farmId}/vet-visits/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    },
    onSuccess: () => {
      invalidate();
      toast({ title: "Visit deleted" });
    },
    onError: () => toast({ title: "Error deleting visit", variant: "destructive" })
  });
  const invoiceMut = useMutation({
    mutationFn: async (data) => {
      const url = editInvoice ? `/api/farms/${farmId}/vet-invoices/${editInvoice.id}` : `/api/farms/${farmId}/vet-invoices`;
      const res = await fetch(url, { method: editInvoice ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed to save invoice");
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      setShowInvoiceDialog(false);
      toast({ title: editInvoice ? "Invoice updated" : "Invoice added" });
    },
    onError: () => toast({ title: "Error saving invoice", variant: "destructive" })
  });
  const delInvoiceMut = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/farms/${farmId}/vet-invoices/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    },
    onSuccess: () => {
      invalidate();
      toast({ title: "Invoice deleted" });
    },
    onError: () => toast({ title: "Error deleting invoice", variant: "destructive" })
  });
  function openVisitEdit(v) {
    setEditVisit(v ?? null);
    if (v) {
      const form = {};
      for (const [k, val] of Object.entries(v)) {
        if (k === "medicines" || k === "herdIds" || k === "animalIds") continue;
        if (val !== null && val !== void 0) form[k] = String(val);
      }
      setVisitForm(form);
      try {
        setVisitHerdIds(JSON.parse(String(v.herdIds ?? "[]")));
      } catch {
        setVisitHerdIds([]);
      }
      try {
        setVisitAnimalIds(JSON.parse(String(v.animalIds ?? "[]")));
      } catch {
        setVisitAnimalIds([]);
      }
      const meds = v.medicines ?? [];
      setVisitMeds(meds.map((m) => ({
        medicineName: String(m.medicineName ?? ""),
        batchNumber: String(m.batchNumber ?? ""),
        quantityUsed: String(m.quantityUsed ?? ""),
        unit: String(m.unit ?? "ml"),
        withdrawalPeriodDays: String(m.withdrawalPeriodDays ?? ""),
        vetDispensed: m.vetDispensed === true || m.vetDispensed === "true",
        notes: String(m.notes ?? "")
      })));
    } else {
      setVisitForm({ visitDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) });
      setVisitHerdIds([]);
      setVisitAnimalIds([]);
      setVisitMeds([]);
    }
    setShowVisitDialog(true);
  }
  function openInvoiceFromDctVisit(v) {
    setEditInvoice(null);
    setInvoiceForm({
      invoiceDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      paymentStatus: "unpaid",
      vetName: String(v.vetName ?? ""),
      vetPractice: String(v.vetPractice ?? ""),
      ...v.estimatedTotalGbp ? { totalAmountGbp: String(v.estimatedTotalGbp) } : {}
    });
    const reason = String(v.reasonForVisit ?? "");
    setInvoiceLines([{
      lineType: "medicine",
      description: reason,
      quantity: "1",
      unitPriceGbp: v.estimatedTotalGbp ? String(v.estimatedTotalGbp) : "",
      lineTotalGbp: v.estimatedTotalGbp ? String(v.estimatedTotalGbp) : "",
      visitId: String(v.id ?? ""),
      isMatched: false,
      matchNote: ""
    }]);
    setShowInvoiceDialog(true);
  }
  function openInvoiceEdit(inv) {
    setEditInvoice(inv ?? null);
    if (inv) {
      const form = {};
      for (const [k, val] of Object.entries(inv)) {
        if (k === "lines") continue;
        if (val !== null && val !== void 0) form[k] = String(val);
      }
      setInvoiceForm(form);
      const lines = inv.lines ?? [];
      setInvoiceLines(lines.map((l) => ({
        lineType: String(l.lineType ?? "consultation"),
        description: String(l.description ?? ""),
        quantity: String(l.quantity ?? "1"),
        unitPriceGbp: String(l.unitPriceGbp ?? ""),
        lineTotalGbp: String(l.lineTotalGbp ?? ""),
        visitId: String(l.visitId ?? ""),
        isMatched: l.isMatched === true || l.isMatched === "true",
        matchNote: String(l.matchNote ?? "")
      })));
    } else {
      setInvoiceForm({ invoiceDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), paymentStatus: "unpaid" });
      setInvoiceLines([]);
    }
    setShowInvoiceDialog(true);
  }
  function saveVisit() {
    if (!visitForm.visitDate?.trim() || !visitForm.vetName?.trim() || !visitForm.reasonForVisit?.trim()) {
      toast({ title: "Date, vet name, and reason are required", variant: "destructive" });
      return;
    }
    visitMut.mutate({
      ...visitForm,
      herdIds: JSON.stringify(visitHerdIds),
      animalIds: JSON.stringify(visitAnimalIds),
      medicines: visitMeds.filter((m) => m.medicineName.trim())
    });
  }
  function saveInvoice() {
    if (!invoiceForm.invoiceNumber?.trim() || !invoiceForm.invoiceDate?.trim() || !invoiceForm.vetPractice?.trim() || !invoiceForm.totalAmountGbp?.trim()) {
      toast({ title: "Invoice number, date, practice, and total are required", variant: "destructive" });
      return;
    }
    invoiceMut.mutate({
      ...invoiceForm,
      lines: invoiceLines.map((l) => ({ ...l, visitId: l.visitId || null }))
    });
  }
  function updateLineTotal(idx, qty, unitPrice) {
    const q2 = parseFloat(qty) || 0;
    const u = parseFloat(unitPrice) || 0;
    if (q2 && u) {
      setInvoiceLines((ls) => ls.map((l, i) => i === idx ? { ...l, lineTotalGbp: (q2 * u).toFixed(2) } : l));
    }
  }
  function toggleHerd(id) {
    setVisitHerdIds((ids) => ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);
  }
  const q = search.toLowerCase();
  const filteredVisits = visits.filter(
    (v) => String(v.vetName ?? "").toLowerCase().includes(q) || String(v.vetPractice ?? "").toLowerCase().includes(q) || String(v.reasonForVisit ?? "").toLowerCase().includes(q)
  );
  const filteredInvoices = invoices.filter(
    (i) => String(i.invoiceNumber ?? "").toLowerCase().includes(q) || String(i.vetPractice ?? "").toLowerCase().includes(q) || String(i.vetName ?? "").toLowerCase().includes(q)
  );
  const now = /* @__PURE__ */ new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
  const visitsThisYear = visits.filter((v) => String(v.visitDate ?? "") >= yearStart).length;
  const followUpsDue = visits.filter((v) => v.followUpDueDate && String(v.followUpDueDate) <= now.toISOString().slice(0, 10)).length;
  const outstanding = invoices.filter((i) => i.paymentStatus !== "paid").reduce((sum, i) => sum + (Number(i.totalAmountGbp) || 0), 0);
  const unreconciled = invoices.filter((i) => i.reconciliationStatus !== "reconciled").length;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Vet Ledger", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-5xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-lg bg-green-800 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Stethoscope, { className: "w-4 h-4 text-white" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold text-gray-900", children: "Vet Ledger" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Visit records and invoice reconciliation" })
        ] })
      ] }),
      tab !== "amrm" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        tab === "visits" && visits.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "h-8 px-3 text-sm", onClick: printVisitLog, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
          " Print Visit Log"
        ] }),
        tab === "invoices" && invoices.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "h-8 px-3 text-sm", onClick: printInvoiceRegister, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
          " Print Invoice Register"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            className: "bg-green-800 hover:bg-green-900 text-white h-8 px-3 text-sm",
            onClick: () => tab === "visits" ? openVisitEdit() : openInvoiceEdit(),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }),
              tab === "visits" ? "Log Visit" : "Add Invoice"
            ]
          }
        )
      ] }),
      tab === "amrm" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "bg-green-800 hover:bg-green-900 text-white h-8 px-3 text-sm", onClick: printAmrmReport, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
        " Print AMRM Report"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 mb-5", children: [
      { label: "Visits this year", value: visitsThisYear, icon: Stethoscope, color: "#166534" },
      { label: "Follow-ups due", value: followUpsDue, icon: Clock, color: followUpsDue > 0 ? "#92400e" : "#6b7280" },
      { label: "Outstanding", value: outstanding > 0 ? fmtGbp(outstanding) : "£0.00", icon: Receipt, color: outstanding > 0 ? "#991b1b" : "#6b7280" },
      { label: "To reconcile", value: unreconciled, icon: CircleAlert, color: unreconciled > 0 ? "#991b1b" : "#166534" }
    ].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(s.icon, { className: "w-5 h-5 shrink-0", style: { color: s.color } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold text-gray-900 leading-none", children: s.value }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: s.label })
      ] })
    ] }, s.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 border-b border-gray-200 mb-4", children: [
      ["visits", "invoices", "amrm", "analytics"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setTab(t),
          className: `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? "border-green-800 text-green-900" : "border-transparent text-gray-500 hover:text-gray-800"}`,
          children: t === "visits" ? `Vet Visits (${visits.length})` : t === "invoices" ? `Invoices (${invoices.length})` : t === "amrm" ? "AMRM Report" : "Analytics"
        },
        t
      )),
      tab !== "amrm" && tab !== "analytics" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-auto mb-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          placeholder: tab === "visits" ? "Search visits…" : "Search invoices…",
          value: search,
          onChange: (e) => setSearch(e.target.value),
          className: "h-8 text-sm w-52"
        }
      ) }),
      tab === "amrm" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto mb-1 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: "Year:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "select",
          {
            value: amrmYear,
            onChange: (e) => setAmrmYear(Number(e.target.value)),
            className: "h-8 text-sm border border-gray-300 rounded-md px-2 bg-white",
            children: Array.from({ length: 5 }, (_, i) => (/* @__PURE__ */ new Date()).getFullYear() - i).map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: y, children: y }, y))
          }
        )
      ] })
    ] }),
    tab === "visits" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      visitsQ.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Loading…" }),
      !visitsQ.isLoading && filteredVisits.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 border border-dashed border-gray-200 rounded-xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stethoscope, { className: "w-8 h-8 text-gray-300 mx-auto mb-2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "No vet visits recorded yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "mt-3 bg-green-800 hover:bg-green-900 text-white", onClick: () => openVisitEdit(), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }),
          " Log First Visit"
        ] })
      ] }),
      filteredVisits.map((v) => {
        const meds = v.medicines ?? [];
        const followUpOverdue = v.followUpDueDate && String(v.followUpDueDate) < now.toISOString().slice(0, 10);
        const linkedInvoices = invoices.filter((inv) => {
          const lines = inv.lines ?? [];
          return lines.some((l) => l.visitId && String(l.visitId) === String(v.id));
        });
        const isDct = String(v.reasonForVisit ?? "").startsWith("DCT prescription authorisation");
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-gray-900", children: fmtDate(String(v.visitDate ?? "")) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-gray-700", children: [
                String(v.vetName ?? ""),
                v.vetPractice ? ` — ${String(v.vetPractice)}` : ""
              ] }),
              followUpOverdue && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", style: { background: "#fef3c7", color: "#92400e", border: "none" }, children: "Follow-up overdue" }),
              isDct && linkedInvoices.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "text-xs", style: { background: "#fef3c7", color: "#854d0e", border: "1px solid #fde68a" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-2.5 h-2.5 mr-1 inline" }),
                "DCT — invoice expected"
              ] }),
              linkedInvoices.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "text-xs", style: { background: "#e0f2fe", color: "#0369a1", border: "none" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "w-2.5 h-2.5 mr-1 inline" }),
                linkedInvoices.length,
                " invoice",
                linkedInvoices.length > 1 ? "s" : ""
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 font-medium", children: String(v.reasonForVisit ?? "") }),
            !!v.diagnoses && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-0.5 line-clamp-1", children: [
              "Dx: ",
              String(v.diagnoses)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 mt-1.5 text-xs text-gray-500", children: [
              meds.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-3 h-3" }),
                meds.length,
                " medicine",
                meds.length > 1 ? "s" : ""
              ] }),
              !!v.followUpDueDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3" }),
                "Follow-up: ",
                fmtDate(String(v.followUpDueDate))
              ] }),
              !!v.estimatedTotalGbp && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Est. ",
                fmtGbp(v.estimatedTotalGbp)
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 shrink-0 flex-wrap justify-end", children: [
            isDct && linkedInvoices.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-7 px-2 text-xs gap-1 text-amber-700 border-amber-300 hover:bg-amber-50", onClick: () => openInvoiceFromDctVisit(v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "w-3 h-3" }),
              "Raise Invoice"
            ] }),
            (v.followUpDueDate || v.followUpRequired) && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-7 px-2 text-xs gap-1 text-primary border-primary/30 hover:bg-primary/5", onClick: () => setRaiseTaskVisit(v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-3 h-3" }),
              "Raise Task"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", title: "View", onClick: () => {
              setViewVisit(v);
              setShowViewVisitDialog(true);
            }, className: "h-7 px-2 text-gray-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3 h-3" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", title: "Edit", onClick: () => openVisitEdit(v), className: "h-7 px-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "w-3 h-3" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", title: "Delete", onClick: () => {
              if (confirm("Delete this visit record?")) delVisitMut.mutate(Number(v.id));
            }, className: "h-7 px-2 text-red-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3 h-3" }) })
          ] })
        ] }) }, String(v.id));
      })
    ] }),
    tab === "invoices" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      invoicesQ.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Loading…" }),
      !invoicesQ.isLoading && filteredInvoices.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 border border-dashed border-gray-200 rounded-xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "w-8 h-8 text-gray-300 mx-auto mb-2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "No vet invoices recorded yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "mt-3 bg-green-800 hover:bg-green-900 text-white", onClick: () => openInvoiceEdit(), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }),
          " Add First Invoice"
        ] })
      ] }),
      filteredInvoices.map((inv) => {
        const lines = inv.lines ?? [];
        const matchedCount = lines.filter((l) => l.isMatched).length;
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-gray-900", children: String(inv.invoiceNumber ?? "") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: fmtDate(String(inv.invoiceDate ?? "")) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentBadge, { status: String(inv.paymentStatus ?? "unpaid") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ReconBadge, { status: String(inv.reconciliationStatus ?? "unreconciled") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-700", children: [
              String(inv.vetPractice ?? ""),
              inv.vetName ? ` — ${String(inv.vetName)}` : ""
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 mt-1 text-xs text-gray-500", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-gray-800", children: fmtGbp(inv.totalAmountGbp) }),
              lines.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                matchedCount,
                "/",
                lines.length,
                " lines matched"
              ] }),
              inv.paymentDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Paid: ",
                fmtDate(String(inv.paymentDate))
              ] }),
              inv.paymentReference && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Ref: ",
                String(inv.paymentReference)
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", title: "View & reconcile", onClick: () => {
              setViewInvoice(inv);
              setShowViewInvoiceDialog(true);
            }, className: "h-7 px-2 text-gray-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3 h-3" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", title: "Edit", onClick: () => openInvoiceEdit(inv), className: "h-7 px-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "w-3 h-3" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", title: "Delete", onClick: () => {
              if (confirm("Delete this invoice?")) delInvoiceMut.mutate(Number(inv.id));
            }, className: "h-7 px-2 text-red-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3 h-3" }) })
          ] })
        ] }) }, String(inv.id));
      })
    ] }),
    tab === "amrm" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-xl p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-blue-900 mb-1", children: "Antibiotic Monitoring & Responsible Use (AMRM)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-blue-700", children: [
          "This report aggregates your existing Medicine Records by antibiotic class for the selected year. Antibiotics are classified automatically from medicine names — review and verify with your vet if needed. Click ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Print AMRM Report" }),
          " above to generate the printable annual summary for your assurance scheme or vet sign-off."
        ] })
      ] }),
      medicineNamesQ.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Loading medicine records…" }),
      !medicineNamesQ.isLoading && amrmGroupList.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 border border-dashed border-gray-200 rounded-xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "w-8 h-8 text-gray-300 mx-auto mb-2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-500", children: [
          "No recognised antibiotic records found for ",
          amrmYear
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Records appear here automatically once medicines are logged in the Medicine Register with antibiotic product names." })
      ] }),
      hasHpCia && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 bg-amber-50 border border-amber-300 rounded-xl p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 text-amber-600 shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-amber-900", children: "HP-CIA Use Recorded" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-700", children: [
            "Highest Priority Critically Important Antibiotics (Fluoroquinolones, 3rd/4th gen Cephalosporins, or Polymyxins) were administered in ",
            amrmYear,
            ". Ensure veterinary prescriptions and, where required, sensitivity testing results are on file."
          ] })
        ] })
      ] }),
      amrmGroupList.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border border-gray-200 rounded-xl overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-gray-50 border-b border-gray-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 w-56", children: "Antibiotic Class" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 w-24", children: "Courses" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500", children: "Products Used" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
          amrmGroupList.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-900", children: g.label }),
              g.hpCia && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-xs bg-amber-100 text-amber-800 border border-amber-300 rounded px-1.5 py-0.5 font-semibold", children: "HP-CIA" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-center font-bold text-gray-900", children: g.count }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs text-gray-500", children: g.medicines.join(", ") })
          ] }, g.label)),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-gray-50 border-t-2 border-gray-300", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 font-bold text-gray-900 text-sm", children: "Total Antibiotic Courses" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-center font-bold text-gray-900 text-base", children: totalAntibioticCourses }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-2.5 text-xs text-gray-400 italic", children: [
              "All medicine records in ",
              amrmYear,
              " where antibiotic class was detected"
            ] })
          ] })
        ] })
      ] }) }),
      allMedRecords.filter((r) => r.administeredDate && new Date(r.administeredDate).getFullYear() === amrmYear && classifyAntibiotic(r.medicineName) === null).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 border border-gray-200 rounded-xl p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-gray-600 mb-1", children: [
          "Other Medicines (",
          amrmYear,
          ") — not classified as antibiotics"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 leading-relaxed", children: [...new Set(allMedRecords.filter((r) => r.administeredDate && new Date(r.administeredDate).getFullYear() === amrmYear && classifyAntibiotic(r.medicineName) === null).map((r) => r.medicineName))].join(", ") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs text-gray-500", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Note:" }),
        " This report uses keyword matching from medicine names recorded in your Medicine Register. If a product is not classified correctly, please verify with your vet or AHDB guidance. The total course count is based on the number of individual medicine administration records, not the quantity of antibiotic administered."
      ] })
    ] }),
    tab === "analytics" && /* @__PURE__ */ jsxRuntimeExports.jsx(VetAnalyticsSection, { visits, invoices }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showVisitDialog, onOpenChange: setShowVisitDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[92vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editVisit ? "Edit Vet Visit" : "Log Vet Visit" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-3 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-36 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Visit date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "h-8 text-sm mt-1", value: visitForm.visitDate ?? "", onChange: (e) => setVisitForm((f) => ({ ...f, visitDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-[140px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Vet name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-sm mt-1", list: "vl-vet-names", value: visitForm.vetName ?? "", onChange: (e) => setVisitForm((f) => ({ ...f, vetName: e.target.value })), placeholder: "e.g. Mr. James Stewart" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "vl-vet-names", children: knownVets.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: n }, n)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-[140px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Vet practice" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-sm mt-1", list: "vl-practices", value: visitForm.vetPractice ?? "", onChange: (e) => setVisitForm((f) => ({ ...f, vetPractice: e.target.value })), placeholder: "e.g. Westgate Vets" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "vl-practices", children: knownPractices.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: p }, p)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "vl-medicine-names", children: knownMedicineNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: n }, n)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Reason for visit *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-sm mt-1", value: visitForm.reasonForVisit ?? "", onChange: (e) => setVisitForm((f) => ({ ...f, reasonForVisit: e.target.value })), placeholder: "e.g. Routine health check, Lameness investigation, TB test…" })
        ] }),
        herds.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Herds / flocks seen" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 mt-1", children: herds.map((h) => {
            const selected = visitHerdIds.includes(Number(h.id));
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => toggleHerd(Number(h.id)),
                className: `px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${selected ? "bg-green-800 text-white border-green-800" : "bg-white text-gray-700 border-gray-300 hover:border-green-700"}`,
                children: String(h.herdName ?? h.name ?? `Herd ${h.id}`)
              },
              String(h.id)
            );
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs block mb-1", children: [
            "Individual animals seen / treated",
            visitHerdIds.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 font-normal text-gray-500", children: [
              "— showing animals in selected herd",
              visitHerdIds.length !== 1 ? "s" : "",
              " only"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 font-normal text-gray-500", children: "— select a herd above to narrow this list" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            AnimalMultiPicker,
            {
              animals: allAnimals,
              selected: visitAnimalIds,
              onChange: setVisitAnimalIds,
              filterHerdIds: visitHerdIds.length > 0 ? visitHerdIds : void 0
            }
          ),
          visitAnimalIds.length > 0 && visitHerdIds.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-blue-700 mt-1", children: [
            "Medicine records will be linked to these ",
            visitAnimalIds.length,
            " individual animal",
            visitAnimalIds.length !== 1 ? "s" : "",
            "."
          ] }),
          visitAnimalIds.length > 0 && visitHerdIds.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-700 mt-1", children: "Both herds and individual animals are selected — medicine records will be linked to the herds. Use individual animals only if a specific subset was treated." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Diagnoses / findings" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, className: "text-sm mt-1", value: visitForm.diagnoses ?? "", onChange: (e) => setVisitForm((f) => ({ ...f, diagnoses: e.target.value })), placeholder: "Record any diagnoses or clinical findings…" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Treatments carried out" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, className: "text-sm mt-1", value: visitForm.treatmentsCarriedOut ?? "", onChange: (e) => setVisitForm((f) => ({ ...f, treatmentsCarriedOut: e.target.value })), placeholder: "Describe treatments and procedures performed on farm…" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Prescriptions issued" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 1, className: "text-sm mt-1", value: visitForm.prescriptionsIssued ?? "", onChange: (e) => setVisitForm((f) => ({ ...f, prescriptionsIssued: e.target.value })), placeholder: "Any medicines prescribed for farm purchase…" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-3 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-[200px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Follow-up actions required" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-sm mt-1", value: visitForm.followUpActions ?? "", onChange: (e) => setVisitForm((f) => ({ ...f, followUpActions: e.target.value })), placeholder: "e.g. Re-examine in 10 days, retest herd…" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-36 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Follow-up due date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "h-8 text-sm mt-1", value: visitForm.followUpDueDate ?? "", onChange: (e) => setVisitForm((f) => ({ ...f, followUpDueDate: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-3 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-32 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Time on farm (mins)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", className: "h-8 text-sm mt-1", value: visitForm.timeOnFarmMinutes ?? "", onChange: (e) => setVisitForm((f) => ({ ...f, timeOnFarmMinutes: e.target.value })), placeholder: "e.g. 90" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-32 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Call-out fee (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", className: "h-8 text-sm mt-1", value: visitForm.callOutFeeGbp ?? "", onChange: (e) => setVisitForm((f) => ({ ...f, callOutFeeGbp: e.target.value })), placeholder: "0.00" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-36 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Estimated total (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", className: "h-8 text-sm mt-1", value: visitForm.estimatedTotalGbp ?? "", onChange: (e) => setVisitForm((f) => ({ ...f, estimatedTotalGbp: e.target.value })), placeholder: "0.00" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-4 h-4 text-blue-700" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-blue-800", children: "Medicines Administered / Dispensed" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-6 px-2 text-xs", onClick: () => setVisitMeds((ms) => [...ms, blankMed()]), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3 h-3 mr-1" }),
              " Add"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-blue-700 mb-2", children: "Record each medicine given on this visit. These are automatically added to your Medicine Register for Red Tractor traceability — no need to enter them twice." }),
          visitMeds.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-blue-600 italic", children: "No medicines recorded for this visit." }),
          visitMeds.map((med, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-blue-200 rounded-lg p-2 mb-2 bg-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-[140px]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Medicine name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-7 text-xs mt-0.5", list: "vl-medicine-names", value: med.medicineName, onChange: (e) => setVisitMeds((ms) => ms.map((m, i) => i === idx ? { ...m, medicineName: e.target.value } : m)), placeholder: "e.g. Norocillin LA" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-28 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Batch number" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-7 text-xs mt-0.5", value: med.batchNumber, onChange: (e) => setVisitMeds((ms) => ms.map((m, i) => i === idx ? { ...m, batchNumber: e.target.value } : m)), placeholder: "e.g. ABC1234" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-20 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Qty" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", className: "h-7 text-xs mt-0.5", value: med.quantityUsed, onChange: (e) => setVisitMeds((ms) => ms.map((m, i) => i === idx ? { ...m, quantityUsed: e.target.value } : m)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: med.unit === "other" || !MEDICINE_UNITS.filter((u) => u !== "other").includes(med.unit) ? "w-32 shrink-0" : "w-20 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Unit" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: MEDICINE_UNITS.filter((u) => u !== "other").includes(med.unit) ? med.unit : "other", onValueChange: (v) => setVisitMeds((ms) => ms.map((m, i) => i === idx ? { ...m, unit: v } : m)), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 text-xs mt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: MEDICINE_UNITS.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: u, children: u }, u)) })
              ] }),
              (med.unit === "other" || !MEDICINE_UNITS.filter((u) => u !== "other").includes(med.unit)) && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-7 text-xs mt-0.5", value: med.unit === "other" ? "" : med.unit, onChange: (e) => setVisitMeds((ms) => ms.map((m, i) => i === idx ? { ...m, unit: e.target.value || "other" } : m)), placeholder: "Specify…" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-28 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Withdrawal (days)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", className: "h-7 text-xs mt-0.5", value: med.withdrawalPeriodDays, onChange: (e) => setVisitMeds((ms) => ms.map((m, i) => i === idx ? { ...m, withdrawalPeriodDays: e.target.value } : m)), placeholder: "0" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mt-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: med.vetDispensed, onCheckedChange: (v) => setVisitMeds((ms) => ms.map((m, i) => i === idx ? { ...m, vetDispensed: !!v } : m)), id: `vd-${idx}` }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `vd-${idx}`, className: "text-xs", children: "Vet-dispensed" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-1.5 text-red-600 mt-4", onClick: () => setVisitMeds((ms) => ms.filter((_, i) => i !== idx)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3 h-3" }) })
          ] }) }, idx))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, className: "text-sm mt-1", value: visitForm.notes ?? "", onChange: (e) => setVisitForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShowVisitDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "bg-green-800 hover:bg-green-900 text-white", onClick: saveVisit, disabled: visitMut.isPending, children: editVisit ? "Save Changes" : "Log Visit" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showViewVisitDialog, onOpenChange: setShowViewVisitDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-xl max-h-[92vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stethoscope, { className: "w-4 h-4 text-gray-500" }),
        "Vet Visit — ",
        viewVisit ? fmtDate(String(viewVisit.visitDate ?? "")) : ""
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(VetVisitViewBody, { visit: viewVisit, visits, herds, allAnimals }),
      viewVisit && farmId && /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "vet_visit", recordId: Number(viewVisit.id) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShowViewVisitDialog(false), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "bg-green-800 hover:bg-green-900 text-white", onClick: () => {
          setShowViewVisitDialog(false);
          openVisitEdit(viewVisit);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "w-3 h-3 mr-1" }),
          " Edit"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showInvoiceDialog, onOpenChange: setShowInvoiceDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl max-h-[92vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editInvoice ? "Edit Invoice" : "Add Vet Invoice" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-3 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-[140px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Invoice number *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-sm mt-1", value: invoiceForm.invoiceNumber ?? "", onChange: (e) => setInvoiceForm((f) => ({ ...f, invoiceNumber: e.target.value })), placeholder: "e.g. VET-2024-0193" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-36 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Invoice date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "h-8 text-sm mt-1", value: invoiceForm.invoiceDate ?? "", onChange: (e) => setInvoiceForm((f) => ({ ...f, invoiceDate: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-3 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-[160px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Vet practice *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-sm mt-1", list: "inv-practices", value: invoiceForm.vetPractice ?? "", onChange: (e) => setInvoiceForm((f) => ({ ...f, vetPractice: e.target.value })), placeholder: "e.g. Westgate Vets" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "inv-practices", children: knownPractices.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: p }, p)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-[140px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Vet name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-sm mt-1", list: "inv-vet-names", value: invoiceForm.vetName ?? "", onChange: (e) => setInvoiceForm((f) => ({ ...f, vetName: e.target.value })), placeholder: "e.g. Mr. James Stewart" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "inv-vet-names", children: knownVets.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: n }, n)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-32 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Total (£) *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", className: "h-8 text-sm mt-1", value: invoiceForm.totalAmountGbp ?? "", onChange: (e) => setInvoiceForm((f) => ({ ...f, totalAmountGbp: e.target.value })), placeholder: "0.00" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-3 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-36 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Payment status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: invoiceForm.paymentStatus ?? "unpaid", onValueChange: (v) => setInvoiceForm((f) => ({ ...f, paymentStatus: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-sm mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "unpaid", children: "Unpaid" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "paid", children: "Paid" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "overdue", children: "Overdue" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "disputed", children: "Disputed" })
              ] })
            ] })
          ] }),
          invoiceForm.paymentStatus === "paid" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-36 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Payment date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "h-8 text-sm mt-1", value: invoiceForm.paymentDate ?? "", onChange: (e) => setInvoiceForm((f) => ({ ...f, paymentDate: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-[120px]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Payment reference" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-sm mt-1", value: invoiceForm.paymentReference ?? "", onChange: (e) => setInvoiceForm((f) => ({ ...f, paymentReference: e.target.value })), placeholder: "BACS / cheque ref" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Invoice document URL (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-sm mt-1", value: invoiceForm.invoiceDocumentUrl ?? "", onChange: (e) => setInvoiceForm((f) => ({ ...f, invoiceDocumentUrl: e.target.value })), placeholder: "https://…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 border border-gray-200 rounded-lg p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-700", children: "Invoice Line Items" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-6 px-2 text-xs", onClick: () => setInvoiceLines((ls) => [...ls, blankLine()]), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3 h-3 mr-1" }),
              " Add line"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-2", children: "Enter each line from the invoice. Link to a vet visit and mark as matched to reconcile." }),
          invoiceLines.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 italic", children: "No lines added yet — add lines to enable reconciliation." }),
          invoiceLines.map((line, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-gray-200 rounded-lg p-2 mb-2 bg-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-40 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: line.lineType, onValueChange: (v) => setInvoiceLines((ls) => ls.map((l, i) => i === idx ? { ...l, lineType: v } : l)), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 text-xs mt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: LINE_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-[140px]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Description" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-7 text-xs mt-0.5", value: line.description, onChange: (e) => setInvoiceLines((ls) => ls.map((l, i) => i === idx ? { ...l, description: e.target.value } : l)), placeholder: "Description from invoice" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-14 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Qty" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", className: "h-7 text-xs mt-0.5", value: line.quantity, onChange: (e) => {
                setInvoiceLines((ls) => ls.map((l, i) => i === idx ? { ...l, quantity: e.target.value } : l));
                updateLineTotal(idx, e.target.value, line.unitPriceGbp);
              } })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-20 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Unit price (£)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", className: "h-7 text-xs mt-0.5", value: line.unitPriceGbp, onChange: (e) => {
                setInvoiceLines((ls) => ls.map((l, i) => i === idx ? { ...l, unitPriceGbp: e.target.value } : l));
                updateLineTotal(idx, line.quantity, e.target.value);
              } })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-20 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Total (£)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", className: "h-7 text-xs mt-0.5", value: line.lineTotalGbp, onChange: (e) => setInvoiceLines((ls) => ls.map((l, i) => i === idx ? { ...l, lineTotalGbp: e.target.value } : l)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-44 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Link to visit" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: line.visitId || "__none__", onValueChange: (v) => setInvoiceLines((ls) => ls.map((l, i) => i === idx ? { ...l, visitId: v === "__none__" ? "" : v } : l)), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 text-xs mt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "No visit linked" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "No visit linked" }),
                  visits.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(v.id), children: [
                    fmtDate(String(v.visitDate ?? "")),
                    " — ",
                    String(v.vetName ?? "")
                  ] }, String(v.id)))
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mt-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: line.isMatched, onCheckedChange: (v) => setInvoiceLines((ls) => ls.map((l, i) => i === idx ? { ...l, isMatched: !!v } : l)), id: `match-${idx}` }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `match-${idx}`, className: "text-xs", children: "Matched" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-1.5 text-red-600 mt-4", onClick: () => setInvoiceLines((ls) => ls.filter((_, i) => i !== idx)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3 h-3" }) })
          ] }) }, idx)),
          invoiceLines.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end text-xs text-gray-700 font-semibold pt-1 border-t border-gray-200 mt-1", children: [
            "Lines total: ",
            fmtGbp(invoiceLines.reduce((s, l) => s + (parseFloat(l.lineTotalGbp) || 0), 0))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, className: "text-sm mt-1", value: invoiceForm.notes ?? "", onChange: (e) => setInvoiceForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShowInvoiceDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "bg-green-800 hover:bg-green-900 text-white", onClick: saveInvoice, disabled: invoiceMut.isPending, children: editInvoice ? "Save Changes" : "Add Invoice" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showViewInvoiceDialog, onOpenChange: setShowViewInvoiceDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[92vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "w-4 h-4 text-gray-500" }),
        "Invoice ",
        viewInvoice ? String(viewInvoice.invoiceNumber ?? "") : ""
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(InvoiceViewBody, { invoice: viewInvoice, visits }),
      viewInvoice && farmId && /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "vet_invoice", recordId: Number(viewInvoice.id) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShowViewInvoiceDialog(false), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "bg-green-800 hover:bg-green-900 text-white", onClick: () => {
          setShowViewInvoiceDialog(false);
          openInvoiceEdit(viewInvoice);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "w-3 h-3 mr-1" }),
          " Edit"
        ] })
      ] })
    ] }) }),
    raiseTaskVisit && farmId && /* @__PURE__ */ jsxRuntimeExports.jsx(
      RaiseTaskDialog,
      {
        farmId,
        open: !!raiseTaskVisit,
        onClose: () => setRaiseTaskVisit(null),
        defaultTitle: `Vet follow-up: ${String(raiseTaskVisit.reasonForVisit ?? "Visit")}`,
        defaultDescription: raiseTaskVisit.clinicalFindings ? `Clinical findings: ${String(raiseTaskVisit.clinicalFindings)}` : "",
        defaultDueDate: raiseTaskVisit.followUpDueDate ? String(raiseTaskVisit.followUpDueDate).slice(0, 10) : "",
        taskType: "vet_followup",
        module: "Vet Ledger"
      }
    )
  ] }) });
}
function VetVisitViewBody({ visit, visits, herds, allAnimals }) {
  if (!visit) return null;
  const v = visit;
  const meds = v.medicines ?? [];
  let herdIds = [];
  let animalIds = [];
  try {
    herdIds = JSON.parse(String(v.herdIds ?? "[]"));
  } catch {
  }
  try {
    animalIds = JSON.parse(String(v.animalIds ?? "[]"));
  } catch {
  }
  const herdNames = herdIds.map((id) => {
    const h = (herds ?? []).find((h2) => Number(h2.id) === id);
    return h ? String(h.herdName ?? h.name ?? `Herd ${id}`) : `Herd ${id}`;
  });
  const animalTags = animalIds.map((id) => {
    const a = (allAnimals ?? []).find((a2) => a2.id === id);
    return a ? String(a.tagNumber ?? a.earTagNumber ?? `#${id}`) : `#${id}`;
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-1 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-gray-500", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-900", children: String(new Date(String(v.visitDate ?? "")).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-gray-500", children: "Vet / Practice" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-gray-900", children: [
          String(v.vetName ?? ""),
          v.vetPractice ? ` — ${String(v.vetPractice)}` : ""
        ] })
      ] }),
      v.timeOnFarmMinutes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-gray-500", children: "Time on farm" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-gray-900", children: [
          String(v.timeOnFarmMinutes),
          " min"
        ] })
      ] }),
      v.estimatedTotalGbp && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-gray-500", children: "Est. cost" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-gray-900", children: [
          "£",
          Number(v.estimatedTotalGbp).toFixed(2)
        ] })
      ] })
    ] }),
    (herdNames.length > 0 || animalTags.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-gray-100 bg-gray-50 px-3 py-2", children: [
      herdNames.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Herds / flocks seen" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1 mt-1", children: herdNames.map((n, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800 font-medium", children: n }, i)) })
      ] }),
      animalTags.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Individual animals treated" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1 mt-1", children: animalTags.map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800 font-mono", children: t }, i)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-gray-100 bg-gray-50 px-3 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1", children: "Reason for visit" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-900", children: String(v.reasonForVisit ?? "") })
    ] }),
    !!v.diagnoses && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-gray-100 bg-gray-50 px-3 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1", children: "Diagnoses / findings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-900 whitespace-pre-wrap", children: String(v.diagnoses) })
    ] }),
    !!v.treatmentsCarriedOut && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-gray-100 bg-gray-50 px-3 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1", children: "Treatments carried out" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-900 whitespace-pre-wrap", children: String(v.treatmentsCarriedOut) })
    ] }),
    !!v.prescriptionsIssued && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-gray-100 bg-gray-50 px-3 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1", children: "Prescriptions issued" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-900 whitespace-pre-wrap", children: String(v.prescriptionsIssued) })
    ] }),
    !!v.followUpActions && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-amber-100 bg-amber-50 px-3 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1", children: "Follow-up required" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-900", children: String(v.followUpActions) }),
      v.followUpDueDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-700 mt-0.5", children: [
        "Due: ",
        String(new Date(String(v.followUpDueDate)).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }))
      ] })
    ] }),
    meds.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5", children: [
        "Medicines administered (",
        meds.length,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: meds.map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 border border-gray-200 rounded-lg px-3 py-2 bg-white text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-900", children: m.medicineName }),
          m.batchNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-500 text-xs ml-2", children: [
            "Batch: ",
            m.batchNumber
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-gray-500 mt-0.5", children: [
            m.quantityUsed && m.unit && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              m.quantityUsed,
              " ",
              m.unit
            ] }),
            m.withdrawalPeriodDays && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 text-amber-700", children: [
              "Withdrawal: ",
              m.withdrawalPeriodDays,
              " days"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs shrink-0", style: m.vetDispensed ? { background: "#e0f2fe", color: "#0369a1", border: "none" } : { background: "#f3f4f6", color: "#6b7280", border: "none" }, children: m.vetDispensed ? "Vet-dispensed" : "Farm stock" })
      ] }, i)) })
    ] }),
    !!v.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-gray-100 bg-gray-50 px-3 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1", children: "Notes" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-900 whitespace-pre-wrap", children: String(v.notes) })
    ] })
  ] });
}
function InvoiceViewBody({ invoice, visits }) {
  if (!invoice) return null;
  const inv = invoice;
  const lines = inv.lines ?? [];
  const matched = lines.filter((l) => l.isMatched).length;
  const linesTotal = lines.reduce((s, l) => s + (parseFloat(l.lineTotalGbp) || 0), 0);
  const invoiceTotal = Number(inv.totalAmountGbp) || 0;
  const variance = linesTotal - invoiceTotal;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-1 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mb-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentBadge, { status: String(inv.paymentStatus ?? "unpaid") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ReconBadge, { status: String(inv.reconciliationStatus ?? "unreconciled") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-gray-500", children: "Invoice date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-900 font-semibold", children: String(new Date(String(inv.invoiceDate ?? "")).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-gray-500", children: "Practice" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-900", children: String(inv.vetPractice ?? "") })
      ] }),
      inv.vetName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-gray-500", children: "Vet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-900", children: String(inv.vetName) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-gray-500", children: "Invoice total" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-gray-900 font-bold text-base", children: [
          "£",
          Number(inv.totalAmountGbp).toFixed(2)
        ] })
      ] }),
      inv.paymentDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-gray-500", children: "Paid on" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-900", children: String(new Date(String(inv.paymentDate)).toLocaleDateString("en-GB")) })
      ] }),
      inv.paymentReference && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-gray-500", children: "Payment ref" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-900", children: String(inv.paymentReference) })
      ] })
    ] }),
    inv.invoiceDocumentUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: String(inv.invoiceDocumentUrl), target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "w-3.5 h-3.5" }),
      " View invoice document"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-gray-600 uppercase tracking-wide", children: [
          "Line Items (",
          matched,
          "/",
          lines.length,
          " matched)"
        ] }),
        Math.abs(variance) > 0.01 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-red-700 font-medium", children: [
          "Lines total ",
          fmtGbp(linesTotal),
          " — variance ",
          variance > 0 ? "+" : "",
          fmtGbp(variance)
        ] }),
        Math.abs(variance) <= 0.01 && lines.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-green-700 font-medium flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3.5 h-3.5" }),
          " Lines balance"
        ] })
      ] }),
      lines.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 italic", children: "No line items entered — edit the invoice to add line items for reconciliation." }),
      lines.map((l, i) => {
        const linkedVisit = l.visitId ? visits.find((v) => String(v.id) === String(l.visitId)) : null;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-start gap-3 border rounded-lg px-3 py-2 mb-1.5 text-sm ${l.isMatched ? "border-green-200 bg-green-50" : "border-gray-200 bg-white"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: lineTypeLabel(l.lineType) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-900", children: l.description })
            ] }),
            linkedVisit && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-blue-700 mt-0.5 flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-3 h-3" }),
              "Linked: ",
              fmtDate(String(linkedVisit.visitDate ?? "")),
              " — ",
              String(linkedVisit.vetName ?? ""),
              ": ",
              String(linkedVisit.reasonForVisit ?? "")
            ] }),
            l.matchNote && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: l.matchNote })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shrink-0 text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-900", children: fmtGbp(l.lineTotalGbp) }),
            l.isMatched ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-green-700 flex items-center justify-end gap-0.5 mt-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3" }),
              " Matched"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-red-600 mt-0.5 block", children: "Unmatched" })
          ] })
        ] }, i);
      })
    ] }),
    inv.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-gray-100 bg-gray-50 px-3 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1", children: "Notes" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-900 whitespace-pre-wrap", children: String(inv.notes) })
    ] })
  ] });
}
export {
  VetLedgerPage as default
};
