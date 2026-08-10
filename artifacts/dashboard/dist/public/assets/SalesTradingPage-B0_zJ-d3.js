import { s as createLucideIcon, b as useAppStore, j as jsxRuntimeExports, a as useToast, c as useQueryClient, r as reactExports, m as useQuery, S as useMutation, d as Button, T as Plus, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, J as DialogFooter, L as Label, I as Input, N as DialogMutationError, O as React, e as LoaderCircle } from "./index-D4AsNSyV.js";
import { u as usePersistedTab } from "./use-persisted-tab-CiX3JJax.js";
import { a as usePersistedFilter } from "./use-persisted-filter-CZyggu-9.js";
import { a as Wheat, f as Scale, a0 as Milk, X as Bird, V as PiggyBank, e as ChartColumn, A as AppLayout } from "./AppLayout-CZKO83oK.js";
import { T as Textarea } from "./textarea-CnTJrFrM.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CUGnOMAU.js";
import { B as Badge } from "./badge-Bxsu20B5.js";
import { T as TabBar, a as TabButton } from "./tab-button-1xH8wlS5.js";
import { B as BuyerCombobox } from "./BuyerCombobox-CFSnCKVH.js";
import { S as ShoppingCart } from "./shopping-cart-BZxrd0Mb.js";
import { F as FileText, D as Droplets } from "./shield-alert-CLnYqa-j.js";
import { P as Printer } from "./printer-JjFCmiaU.js";
import { E as Eye } from "./eye-pLChoqtw.js";
import { P as Pencil } from "./pencil-131C-uIw.js";
import { T as Trash2, C as ChevronDown } from "./trash-2-CJSZ9w_v.js";
import { C as ChevronRight } from "./tractor-CDXDtxgl.js";
import { C as CircleAlert } from "./database-03ASw8TL.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, B as Bar, C as Cell, L as Legend } from "./generateCategoricalChart-DtFnfs0d.js";
import { B as BarChart } from "./BarChart-KWE8wqHV.js";
import { C as CartesianGrid } from "./CartesianGrid-g8wznYmA.js";
import { P as PieChart, a as Pie } from "./PieChart-CXXW9uNi.js";
import { F as File } from "./file-B91kemCO.js";
import { P as Paperclip } from "./paperclip-CprV63CG.js";
import "./use-safe-clerk-n9BjUZc7.js";
import "./triangle-alert-DyT2FlKg.js";
import "./shield-check-Ozexp216.js";
import "./index-BfHkg0No.js";
import "./index-CW_8VsbK.js";
import "./chevron-up-DsU9COzZ.js";
import "./popover-5nnoU89W.js";
import "./command-B8td48MX.js";
import "./search-B4vZZYpS.js";
import "./chevrons-up-down-4aL8Yovc.js";
import "./user-plus-DNjnT_dN.js";
const __iconNode = [
  ["path", { d: "m11 17 2 2a1 1 0 1 0 3-3", key: "efffak" }],
  [
    "path",
    {
      d: "m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4",
      key: "9pr0kb"
    }
  ],
  ["path", { d: "m21 3 1 11h-2", key: "1tisrp" }],
  ["path", { d: "M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3", key: "1uvwmv" }],
  ["path", { d: "M3 4h8", key: "1ep09j" }]
];
const Handshake = createLucideIcon("handshake", __iconNode);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtMonth = (m) => {
  if (!m) return "—";
  const [y, mo] = m.split("-");
  return new Date(parseInt(y), parseInt(mo) - 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
};
const pToGBP = (pence) => {
  if (pence == null) return "—";
  return `£${(pence / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const num = (v) => v == null || v === "" ? null : Number(v);
const CHART_COLORS = ["#16a34a", "#2563eb", "#d97706", "#dc2626", "#7c3aed", "#0891b2", "#be185d"];
function DocCell({ endpoint, queryKey, documentPath, documentName }) {
  const qc = useQueryClient();
  const fileRef = reactExports.useRef(null);
  const [uploading, setUploading] = React.useState(false);
  async function handleFile(file) {
    setUploading(true);
    try {
      const urlRes = await fetch("/api/storage/uploads/request-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileName: file.name, contentType: file.type || "application/octet-stream" }) }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      const { uploadURL, objectPath } = await urlRes.json();
      await fetch(uploadURL, { method: "PUT", headers: { "Content-Type": file.type || "application/octet-stream" }, body: file }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      const fileName = objectPath.split("/").pop() ?? file.name;
      await fetch(endpoint, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ documentPath: objectPath, documentName: fileName }) }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      qc.invalidateQueries({ queryKey });
    } finally {
      setUploading(false);
    }
  }
  async function handleRemove() {
    await fetch(endpoint, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ documentPath: null, documentName: null }) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    });
    qc.invalidateQueries({ queryKey });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", alignItems: "center", gap: 2 }, children: documentPath ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `/api/storage${documentPath}`, target: "_blank", rel: "noopener noreferrer", title: documentName || "View document", style: { display: "flex", alignItems: "center", color: "#2563eb", padding: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(File, { size: 13 }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleRemove, title: "Remove document", style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", fontSize: "0.85rem", padding: 4, lineHeight: 1 }, children: "×" })
  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileRef, type: "file", accept: ".pdf,.jpg,.jpeg,.png", style: { display: "none" }, onChange: (e) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
      e.target.value = "";
    } }),
    uploading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 13, style: { animation: "spin 1s linear infinite", color: "#9ca3af" } }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => fileRef.current?.click(), title: "Attach kill sheet / lot sheet", style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { size: 13 }) })
  ] }) });
}
function GrainBinSelect({ farmId, value, onChange }) {
  const q = useQuery({
    queryKey: ["grain-storage-bins", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/grain-storage-bins`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => Array.isArray(d) ? d : d.rows ?? d.records ?? []
  });
  const bins = q.data ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: value ? String(value) : "__none__", onValueChange: (v) => {
    if (v === "__none__") {
      onChange(null, "");
      return;
    }
    const bin = bins.find((b) => String(b.id) === v);
    onChange(bin?.id ?? null, bin?.binName ?? "");
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select bin / store..." }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— None —" }),
      bins.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(b.id), children: [
        b.binName,
        b.binType ? ` (${b.binType})` : ""
      ] }, b.id))
    ] })
  ] });
}
const COMMODITIES = [
  "Winter Wheat",
  "Spring Wheat",
  "Winter Barley",
  "Spring Barley",
  "Malting Barley",
  "Winter Oats",
  "Spring Oats",
  "Oilseed Rape",
  "Winter Beans",
  "Spring Beans",
  "Peas",
  "Maize",
  "Rye",
  "Triticale",
  "Linseed",
  "Other"
];
const SALE_TYPES = [
  { value: "spot", label: "Spot" },
  { value: "forward", label: "Forward Contract Call-Off" },
  { value: "pool", label: "Pool Scheme" },
  { value: "ex-store", label: "Ex-Store" }
];
function GrainSalesTab({ farmId }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewSale, setViewSale] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const empty = {
    saleDate: "",
    saleType: "spot",
    buyerId: null,
    buyer: "",
    merchantRef: "",
    commodity: "",
    variety: "",
    tonnage: "",
    pricePerTonnePence: "",
    grossValuePence: "",
    deductionsPence: "",
    netValuePence: "",
    moisture: "",
    specificWeight: "",
    protein: "",
    gradeAchieved: "",
    qualitySpec: "",
    deliveryDate: "",
    deliveryLocation: "",
    haulierName: "",
    vehicleReg: "",
    weighbridgeTicket: "",
    invoiceNumber: "",
    paymentDate: "",
    cropYear: "",
    field: "",
    storeBin: "",
    storeBinId: null,
    notes: "",
    isOrganicCertified: false,
    organicCertRef: "",
    linkedContractId: null
  };
  const [form, setForm] = reactExports.useState(empty);
  const [cropYearFilter, setCropYearFilter] = usePersistedFilter({ page: "sales-grain", filter: "crop-year", farmId, defaultValue: "__all__" });
  const q = useQuery({ queryKey: ["grain-sales", farmId], queryFn: () => fetch(`/api/farms/${farmId}/grain-sales`).then((r) => r.json()), enabled: !!farmId });
  const records = q.data?.records ?? [];
  const contractsQ = useQuery({ queryKey: ["crop-contracts", farmId], queryFn: () => fetch(`/api/farms/${farmId}/crop-contracts`).then((r) => r.json()), enabled: !!farmId });
  const contracts = contractsQ.data?.records ?? [];
  const availableCropYears = [...new Set(records.map((r) => r.cropYear).filter(Boolean))].sort().reverse();
  const filteredRecords = cropYearFilter === "__all__" ? records : records.filter((r) => r.cropYear === cropYearFilter);
  const postMut = useMutation({
    mutationFn: (body) => editing ? fetch(`/api/farms/${farmId}/grain-sales/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()) : fetch(`/api/farms/${farmId}/grain-sales`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grain-sales", farmId] });
      setOpen(false);
      setEditing(null);
      setForm(empty);
      toast({ title: editing ? "Grain sale updated" : "Grain sale recorded" });
    },
    onError: () => toast({ title: "Error saving", variant: "destructive" })
  });
  const delMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/grain-sales/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grain-sales", farmId] });
      setDeleteId(null);
      toast({ title: "Deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    const body = {
      ...form,
      tonnage: num(form.tonnage),
      pricePerTonnePence: num(form.pricePerTonnePence),
      grossValuePence: num(form.grossValuePence),
      deductionsPence: num(form.deductionsPence),
      netValuePence: num(form.netValuePence),
      moisture: num(form.moisture),
      specificWeight: num(form.specificWeight),
      protein: num(form.protein),
      saleDate: form.saleDate ? new Date(form.saleDate).toISOString() : void 0,
      deliveryDate: form.deliveryDate ? new Date(form.deliveryDate).toISOString() : void 0,
      paymentDate: form.paymentDate ? new Date(form.paymentDate).toISOString() : void 0
    };
    postMut.mutate(body);
  };
  const openEdit = (r) => {
    setEditing(r);
    setForm({
      ...r,
      saleDate: r.saleDate ? r.saleDate.slice(0, 10) : "",
      deliveryDate: r.deliveryDate ? r.deliveryDate.slice(0, 10) : "",
      paymentDate: r.paymentDate ? r.paymentDate.slice(0, 10) : "",
      isOrganicCertified: r.isOrganicCertified ?? false,
      organicCertRef: r.organicCertRef ?? "",
      linkedContractId: r.linkedContractId ?? null
    });
    setOpen(true);
  };
  const totalRevenue = filteredRecords.reduce((s, r) => s + (r.netValuePence ?? r.grossValuePence ?? 0), 0);
  const totalTonnage = filteredRecords.reduce((s, r) => s + parseFloat(r.tonnage ?? "0"), 0);
  const farmGrainQ = useQuery({ queryKey: ["farm-detail", farmId], queryFn: () => fetch(`/api/farms/${farmId}`).then((r) => r.json()), enabled: !!farmId, select: (d) => d.record });
  const farmGrain = farmGrainQ.data;
  function printGrainRegister() {
    const printedAt = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
    const farmName = farmGrain?.name ?? "Farm";
    const cph = farmGrain?.cphNumber ? ` · CPH: ${farmGrain.cphNumber}` : "";
    const yearLabel = cropYearFilter === "__all__" ? "All Crop Years" : cropYearFilter;
    const rows = filteredRecords.map((r) => `<tr>
      <td>${fmtDate(r.saleDate)}</td>
      <td>${r.saleType || "—"}</td>
      <td>${r.buyer || "—"}</td>
      <td>${r.commodity || "—"} ${r.variety ? "— " + r.variety : ""}</td>
      <td style="text-align:right">${r.tonnage ? parseFloat(r.tonnage).toFixed(2) + " t" : "—"}</td>
      <td style="text-align:right">${r.pricePerTonnePence ? "£" + (r.pricePerTonnePence / 100).toFixed(2) + "/t" : "—"}</td>
      <td>${r.weighbridgeTicket || "—"}</td>
      <td>${r.invoiceNumber || "—"}</td>
      <td style="text-align:right">${r.netValuePence ? "£" + (r.netValuePence / 100).toLocaleString("en-GB", { minimumFractionDigits: 2 }) : "—"}</td>
      <td style="text-align:center;color:${r.linkedContractId ? "#166534" : "#9ca3af"};font-weight:${r.linkedContractId ? "700" : "400"}">${r.linkedContractId ? "✓ Contract #" + r.linkedContractId : "—"}</td>
    </tr>`).join("");
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Grain Sales Register</title>
    <style>body{font-family:Arial,sans-serif;font-size:10pt;margin:12mm 14mm;color:#111}h1{font-size:14pt;margin:0 0 2px}p{margin:0;font-size:9pt;color:#555}.hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #16a34a;padding-bottom:10px;margin-bottom:16px}.hdr-r{text-align:right;font-size:9pt;color:#444}table{width:100%;border-collapse:collapse;font-size:8.5pt}th{background:#f0fdf4;border:1px solid #d1fae5;padding:5px 7px;text-align:left;font-weight:700;color:#14532d}td{border:1px solid #e5e7eb;padding:5px 7px}tr:nth-child(even) td{background:#f9fafb}.note{margin-top:10px;font-size:8pt;color:#6b7280}.footer{margin-top:16px;display:flex;justify-content:space-between;font-size:7.5pt;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:8px}@media print{body{margin:8mm 10mm}}</style>
    </head><body>
    <div class="hdr"><div><h1>${farmName}${cph}</h1><p>Grain Sales Register — ${yearLabel}</p></div><div class="hdr-r"><strong>Printed:</strong> ${printedAt}<br>${filteredRecords.length} records · ${totalTonnage.toFixed(2)} t total · £${(totalRevenue / 100).toLocaleString("en-GB", { minimumFractionDigits: 2 })} net</div></div>
    <table><thead><tr><th>Sale Date</th><th>Type</th><th>Buyer</th><th>Commodity / Variety</th><th>Tonnage</th><th>Price/t</th><th>Weighbridge Ref</th><th>Invoice No.</th><th>Net Value</th><th>Forward Contract</th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr><td colspan="4" style="text-align:right;font-weight:600">Totals</td><td style="text-align:right;font-weight:700;background:#f0fdf4;border-top:2px solid #16a34a">${totalTonnage.toFixed(2)} t</td><td></td><td></td><td></td><td style="text-align:right;font-weight:700;background:#f0fdf4;border-top:2px solid #16a34a">£${(totalRevenue / 100).toLocaleString("en-GB", { minimumFractionDigits: 2 })}</td><td></td></tr></tfoot>
    </table>
    <p class="note">Forward Contract — shows the linked forward contract number if this grain sale was recorded as a call-off against a parent forward contract.</p>
    <div class="footer"><span>BDE Farm Trac — Barnett Davies Enterprises Ltd · Confidential</span><span>Generated: ${printedAt}</span></div>
    </body></html>`;
    const win = window.open("", "_blank", "width=1100,height=700");
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
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16, flexWrap: "wrap", gap: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 32, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.75rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }, children: "Total Revenue" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "1.5rem", fontWeight: 700, color: "#16a34a" }, children: pToGBP(totalRevenue) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.75rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }, children: "Total Tonnes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "1.5rem", fontWeight: 700, color: "#1d4ed8" }, children: [
            totalTonnage.toFixed(2),
            " t"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.75rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }, children: "Avg Price" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "1.5rem", fontWeight: 700, color: "#92400e" }, children: filteredRecords.length > 0 && totalTonnage > 0 ? `£${(totalRevenue / 100 / totalTonnage).toFixed(2)}/t` : "—" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, alignItems: "center" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: cropYearFilter,
            onChange: (e) => setCropYearFilter(e.target.value),
            style: { padding: "6px 12px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: "0.875rem", color: "#374151", background: "#fff", cursor: "pointer" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "__all__", children: "All Crop Years" }),
              availableCropYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: y, children: y }, y))
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: printGrainRegister, style: { display: "flex", alignItems: "center", gap: 6, fontSize: "0.8125rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14 }),
          " Print Register"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setEditing(null);
          setForm(empty);
          setOpen(true);
        }, style: { background: "#16a34a", color: "#fff" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16, style: { marginRight: 6 } }),
          " Record Grain Sale"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { overflowX: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { borderBottom: "2px solid #e5e7eb", background: "#f9fafb" }, children: ["Date", "Type", "Buyer", "Commodity", "Variety", "Tonnage", "Price/t", "Net Value", "Invoice", "Actions"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }, children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
        filteredRecords.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 10, style: { padding: 32, textAlign: "center", color: "#9ca3af" }, children: records.length === 0 ? "No grain sales recorded yet" : `No grain sales for ${cropYearFilter}` }) }),
        filteredRecords.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "1px solid #f3f4f6" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px" }, children: fmtDate(r.saleDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "8px 12px" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: r.saleType === "spot" ? "#dbeafe" : r.saleType === "pool" ? "#dcfce7" : "#fef3c7", color: "#374151", border: "none", fontSize: "0.7rem" }, children: SALE_TYPES.find((t) => t.value === r.saleType)?.label ?? r.saleType }),
            r.linkedContractId && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { marginLeft: 4, fontSize: "0.65rem", background: "#dcfce7", color: "#166534", borderRadius: 4, padding: "1px 5px", fontWeight: 600 }, children: "Contract" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", fontWeight: 500 }, children: r.buyer }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px" }, children: r.commodity }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#6b7280" }, children: r.variety ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px" }, children: r.tonnage ? `${parseFloat(r.tonnage).toFixed(2)} t` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px" }, children: r.pricePerTonnePence ? `£${(r.pricePerTonnePence / 100).toFixed(2)}` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", fontWeight: 600, color: "#16a34a" }, children: pToGBP(r.netValuePence ?? r.grossValuePence) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#6b7280", fontSize: "0.8rem" }, children: r.invoiceNumber ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setViewSale(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 14 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 14 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", style: { color: "#dc2626" }, onClick: () => setDeleteId(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
          ] }) })
        ] }, r.id))
      ] })
    ] }) }),
    viewSale && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewSale(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 560 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Grain Sale" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: "0.875rem", padding: "4px 0" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Sale Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: fmtDate(viewSale.saleDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: SALE_TYPES.find((t) => t.value === viewSale.saleType)?.label ?? viewSale.saleType })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Buyer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600 }, children: viewSale.buyer })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Commodity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewSale.commodity })
        ] }),
        viewSale.variety && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Variety" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewSale.variety })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Tonnage" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewSale.tonnage ? `${parseFloat(viewSale.tonnage).toFixed(2)} t` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Price/t" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewSale.pricePerTonnePence ? `£${(viewSale.pricePerTonnePence / 100).toFixed(2)}` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Net Value" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#16a34a" }, children: pToGBP(viewSale.netValuePence ?? viewSale.grossValuePence) })
        ] }),
        viewSale.invoiceNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Invoice" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs", children: viewSale.invoiceNumber })
        ] }),
        viewSale.merchantRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Merchant Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewSale.merchantRef })
        ] }),
        viewSale.deliveryDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Delivery Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: fmtDate(viewSale.deliveryDate) })
        ] }),
        viewSale.deliveryLocation && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Delivery Location" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewSale.deliveryLocation })
        ] }),
        viewSale.gradeAchieved && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Grade" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewSale.gradeAchieved })
        ] }),
        viewSale.linkedContractId != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1/-1" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Linked Forward Contract" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.75rem", fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: "#dcfce7", color: "#166534" }, children: [
            "✓ Contract #",
            viewSale.linkedContractId,
            " — ",
            contracts.find((c) => c.id === viewSale.linkedContractId) ? `${contracts.find((c) => c.id === viewSale.linkedContractId)?.buyer ?? "Unknown"} · ${contracts.find((c) => c.id === viewSale.linkedContractId)?.commodity ?? ""}` : "linked"
          ] })
        ] })
      ] }),
      viewSale.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", whiteSpace: "pre-line", color: "#374151" }, children: viewSale.notes })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => {
          openEdit(viewSale);
          setViewSale(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 13, style: { marginRight: 4 } }),
          "Edit"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setViewSale(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
      setOpen(v);
      if (!v) {
        setEditing(null);
        setForm(empty);
        postMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 700, maxHeight: "90vh", overflowY: "auto" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Grain Sale" : "Record Grain Sale" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sale Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.saleDate, onChange: (e) => setForm((f) => ({ ...f, saleDate: e.target.value })), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sale Type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.saleType, onValueChange: (v) => setForm((f) => ({ ...f, saleType: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SALE_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Buyer / Merchant ",
              form.buyer ? "" : "*"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              BuyerCombobox,
              {
                farmId,
                types: ["grain_merchant"],
                valueId: form.buyerId,
                valueName: form.buyer,
                onChange: (id, name) => setForm((f) => ({ ...f, buyerId: id, buyer: name })),
                required: true,
                placeholder: "Search or add grain merchant...",
                typeLabel: "Grain Merchant",
                postAddNavigatePath: "/suppliers-stock?tab=suppliers"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Merchant Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.merchantRef, onChange: (e) => setForm((f) => ({ ...f, merchantRef: e.target.value })), placeholder: "Contract / lot reference" })
          ] }),
          form.saleType === "forward" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1/-1" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Linked Forward Contract" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: form.linkedContractId ?? "",
                onChange: (e) => setForm((f) => ({ ...f, linkedContractId: e.target.value ? parseInt(e.target.value) : null })),
                style: { width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: "0.875rem", color: "#374151", background: "#fff" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— No linked contract —" }),
                  contracts.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: c.id, children: [
                    c.contractRef ?? `Contract #${c.id}`,
                    " — ",
                    c.buyer ?? "Unknown buyer",
                    " · ",
                    c.commodity ?? "Unknown",
                    " ",
                    c.tonnage ? `· ${parseFloat(c.tonnage).toFixed(0)} t` : ""
                  ] }, c.id))
                ]
              }
            ),
            contracts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginTop: 4 }, children: "No forward contracts found. Add a contract on the Contracts tab first." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginTop: 4 }, children: "Link this call-off to the parent forward contract for tonnage tracking." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Commodity *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: COMMODITIES.filter((c) => c !== "Other").includes(form.commodity) ? form.commodity : form.commodity ? "Other" : "", onValueChange: (v) => setForm((f) => ({ ...f, commodity: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select commodity" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: COMMODITIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c)) })
            ] }),
            (form.commodity === "Other" || form.commodity && !COMMODITIES.filter((c) => c !== "Other").includes(form.commodity)) && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1.5", value: form.commodity === "Other" ? "" : form.commodity, onChange: (e) => setForm((f) => ({ ...f, commodity: e.target.value || "Other" })), placeholder: "Please specify commodity…" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Variety" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.variety, onChange: (e) => setForm((f) => ({ ...f, variety: e.target.value })), placeholder: "e.g. Skyfall, Extase" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tonnage (t) *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.tonnage, onChange: (e) => setForm((f) => ({ ...f, tonnage: e.target.value })), required: true, placeholder: "0.00" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Price (£/tonne)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                step: "0.01",
                value: form.pricePerTonnePence ? (form.pricePerTonnePence / 100).toFixed(2) : "",
                onChange: (e) => setForm((f) => ({ ...f, pricePerTonnePence: Math.round(parseFloat(e.target.value || "0") * 100) })),
                placeholder: "0.00"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Gross Value (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                step: "0.01",
                value: form.grossValuePence ? (form.grossValuePence / 100).toFixed(2) : "",
                onChange: (e) => setForm((f) => ({ ...f, grossValuePence: Math.round(parseFloat(e.target.value || "0") * 100) })),
                placeholder: "0.00"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Deductions (£) ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.75rem", color: "#6b7280" }, children: "(levy, drying, samples)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                step: "0.01",
                value: form.deductionsPence ? (form.deductionsPence / 100).toFixed(2) : "",
                onChange: (e) => setForm((f) => ({ ...f, deductionsPence: Math.round(parseFloat(e.target.value || "0") * 100) })),
                placeholder: "0.00"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Net Value (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                step: "0.01",
                value: form.netValuePence ? (form.netValuePence / 100).toFixed(2) : "",
                onChange: (e) => setForm((f) => ({ ...f, netValuePence: Math.round(parseFloat(e.target.value || "0") * 100) })),
                placeholder: "0.00"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Moisture (%)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.moisture, onChange: (e) => setForm((f) => ({ ...f, moisture: e.target.value })), placeholder: "e.g. 14.5" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Specific Weight (kg/hl)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.specificWeight, onChange: (e) => setForm((f) => ({ ...f, specificWeight: e.target.value })), placeholder: "e.g. 76.0" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Protein (%)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.protein, onChange: (e) => setForm((f) => ({ ...f, protein: e.target.value })), placeholder: "e.g. 13.0" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Grade Achieved" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.gradeAchieved, onChange: (e) => setForm((f) => ({ ...f, gradeAchieved: e.target.value })), placeholder: "e.g. Group 1 Milling" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Crop Year" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.cropYear, onChange: (e) => setForm((f) => ({ ...f, cropYear: e.target.value })), placeholder: "e.g. 2024/25" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Source Bin / Store" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              GrainBinSelect,
              {
                farmId,
                value: form.storeBinId,
                onChange: (id, name) => setForm((f) => ({ ...f, storeBinId: id, storeBin: name }))
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Delivery Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.deliveryDate, onChange: (e) => setForm((f) => ({ ...f, deliveryDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.paymentDate, onChange: (e) => setForm((f) => ({ ...f, paymentDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Delivery Location" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.deliveryLocation, onChange: (e) => setForm((f) => ({ ...f, deliveryLocation: e.target.value })), placeholder: "e.g. Cambs Grain store" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Weighbridge Ticket" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.weighbridgeTicket, onChange: (e) => setForm((f) => ({ ...f, weighbridgeTicket: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Invoice Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.invoiceNumber, onChange: (e) => setForm((f) => ({ ...f, invoiceNumber: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Haulier" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.haulierName, onChange: (e) => setForm((f) => ({ ...f, haulierName: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1/-1" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { gridColumn: "1/-1" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { borderRadius: 12, border: form.isOrganicCertified ? "2px solid #4ade80" : "2px dashed #e5e7eb", background: form.isOrganicCertified ? "#f0fdf4" : "transparent", padding: 12, transition: "all 0.15s" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "checkbox",
                  checked: form.isOrganicCertified ?? false,
                  onChange: (e) => setForm((f) => ({ ...f, isOrganicCertified: e.target.checked })),
                  style: { width: 16, height: 16, marginTop: 2, accentColor: "#16a34a" }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", fontWeight: 600, color: "#111827", margin: 0 }, children: "Organic Certified Sale" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", margin: "2px 0 0" }, children: "Mark this grain sale as organic produce — required for Red Tractor organic traceability and certifier reporting." })
              ] })
            ] }),
            form.isOrganicCertified && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 10 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Organic Certification Reference" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  placeholder: "e.g. SA-CERT-12345 or certifier contract reference",
                  value: form.organicCertRef ?? "",
                  onChange: (e) => setForm((f) => ({ ...f, organicCertRef: e.target.value })),
                  style: { marginTop: 4, borderColor: "#86efac" }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", marginTop: 4 }, children: "Your certifier's reference — links this sale to your organic certification record and provides the buyer with an audit trail." })
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: postMut, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { style: { marginTop: 16 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => {
            setOpen(false);
            setEditing(null);
            setForm(empty);
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", style: { background: "#16a34a", color: "#fff" }, disabled: postMut.isPending, children: postMut.isPending ? "Saving…" : editing ? "Update" : "Save" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (v) => {
      if (!v) {
        setDeleteId(null);
        delMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Grain Sale?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#6b7280" }, children: "This cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: delMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { style: { background: "#dc2626", color: "#fff" }, onClick: () => deleteId && delMut.mutate(deleteId), disabled: delMut.isPending, children: "Delete" })
      ] })
    ] }) })
  ] });
}
const SPECIES = ["Cattle", "Sheep", "Pigs", "Deer", "Goats", "Other"];
const LIVESTOCK_CATEGORIES = ["Store", "Finished", "Breeding", "Pedigree", "Cull"];
function LivestockTradingTab({ farmId }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [subTab, setSubTab] = reactExports.useState("deadweight");
  const [openDW, setOpenDW] = reactExports.useState(false);
  const [editingDW, setEditingDW] = reactExports.useState(null);
  const [deleteDWId, setDeleteDWId] = reactExports.useState(null);
  const [openMart, setOpenMart] = reactExports.useState(false);
  const [editingMart, setEditingMart] = reactExports.useState(null);
  const [deleteMartId, setDeleteMartId] = reactExports.useState(null);
  const [lsYearFilter, setLsYearFilter] = usePersistedFilter({ page: "sales-livestock-trading", filter: "year", farmId, defaultValue: "__all__" });
  const [expandedDWId, setExpandedDWId] = reactExports.useState(null);
  const [viewDW, setViewDW] = reactExports.useState(null);
  const [viewMart, setViewMart] = reactExports.useState(null);
  const emptyDW = {
    killDate: "",
    processorId: null,
    processor: "",
    species: "",
    breed: "",
    headCount: "",
    totalDeadweightKg: "",
    averageDeadweightKg: "",
    pricePerKgPence: "",
    gradeClassification: "",
    fatClass: "",
    conformationClass: "",
    killSheetRef: "",
    grossValuePence: "",
    transportDeductionPence: "",
    levyDeductionPence: "",
    otherDeductionsPence: "",
    netPaymentPence: "",
    paymentDate: "",
    redTractorAssured: false,
    organicCertified: false,
    premiumSchemeName: "",
    premiumPence: "",
    vendorDeclarationRef: "",
    animalIds: "",
    notes: "",
    movementId: null
  };
  const [formDW, setFormDW] = reactExports.useState(emptyDW);
  const emptyMart = {
    saleDate: "",
    martId: null,
    martName: "",
    martLocation: "",
    species: "",
    category: "store",
    lotNumber: "",
    headCount: "",
    averageLiveweightKg: "",
    priceType: "per_head",
    pricePerUnitPence: "",
    grossValuePence: "",
    commissionPence: "",
    levyPence: "",
    transportCostPence: "",
    otherCostsPence: "",
    netPaymentPence: "",
    buyerName: "",
    auctioneerRef: "",
    paymentDate: "",
    vendorDeclarationRef: "",
    animalIds: "",
    notes: "",
    movementId: null
  };
  const [formMart, setFormMart] = reactExports.useState(emptyMart);
  const dwQ = useQuery({ queryKey: ["dw-sales", farmId], queryFn: () => fetch(`/api/farms/${farmId}/livestock-deadweight-sales`).then((r) => r.json()), enabled: !!farmId });
  const dwRecords = dwQ.data?.records ?? [];
  const martQ = useQuery({ queryKey: ["mart-sales", farmId], queryFn: () => fetch(`/api/farms/${farmId}/livestock-mart-sales`).then((r) => r.json()), enabled: !!farmId });
  const martRecords = martQ.data?.records ?? [];
  const outMovQ = useQuery({ queryKey: ["outgoing-movements", farmId], queryFn: () => fetch(`/api/farms/${farmId}/livestock-movements/outgoing`).then((r) => r.json()), enabled: !!farmId });
  const outgoingMovements = outMovQ.data?.records ?? [];
  const dwMut = useMutation({
    mutationFn: (body) => editingDW ? fetch(`/api/farms/${farmId}/livestock-deadweight-sales/${editingDW.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()) : fetch(`/api/farms/${farmId}/livestock-deadweight-sales`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dw-sales", farmId] });
      setOpenDW(false);
      setEditingDW(null);
      setFormDW(emptyDW);
      toast({ title: "Kill sheet saved" });
    },
    onError: () => toast({ title: "Error saving", variant: "destructive" })
  });
  const dwDelMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/livestock-deadweight-sales/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dw-sales", farmId] });
      setDeleteDWId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const martMut = useMutation({
    mutationFn: (body) => editingMart ? fetch(`/api/farms/${farmId}/livestock-mart-sales/${editingMart.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()) : fetch(`/api/farms/${farmId}/livestock-mart-sales`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mart-sales", farmId] });
      setOpenMart(false);
      setEditingMart(null);
      setFormMart(emptyMart);
      toast({ title: "Mart sale saved" });
    },
    onError: () => toast({ title: "Error saving", variant: "destructive" })
  });
  const martDelMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/livestock-mart-sales/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mart-sales", farmId] });
      setDeleteMartId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const submitDW = (e) => {
    e.preventDefault();
    dwMut.mutate({
      ...formDW,
      headCount: num(formDW.headCount),
      totalDeadweightKg: num(formDW.totalDeadweightKg),
      averageDeadweightKg: num(formDW.averageDeadweightKg),
      pricePerKgPence: num(formDW.pricePerKgPence),
      grossValuePence: num(formDW.grossValuePence),
      transportDeductionPence: num(formDW.transportDeductionPence),
      levyDeductionPence: num(formDW.levyDeductionPence),
      otherDeductionsPence: num(formDW.otherDeductionsPence),
      netPaymentPence: num(formDW.netPaymentPence),
      premiumPence: num(formDW.premiumPence),
      killDate: formDW.killDate ? new Date(formDW.killDate).toISOString() : void 0,
      paymentDate: formDW.paymentDate ? new Date(formDW.paymentDate).toISOString() : void 0
    });
  };
  const submitMart = (e) => {
    e.preventDefault();
    martMut.mutate({
      ...formMart,
      headCount: num(formMart.headCount),
      averageLiveweightKg: num(formMart.averageLiveweightKg),
      pricePerUnitPence: num(formMart.pricePerUnitPence),
      grossValuePence: num(formMart.grossValuePence),
      commissionPence: num(formMart.commissionPence),
      levyPence: num(formMart.levyPence),
      transportCostPence: num(formMart.transportCostPence),
      otherCostsPence: num(formMart.otherCostsPence),
      netPaymentPence: num(formMart.netPaymentPence),
      saleDate: formMart.saleDate ? new Date(formMart.saleDate).toISOString() : void 0,
      paymentDate: formMart.paymentDate ? new Date(formMart.paymentDate).toISOString() : void 0
    });
  };
  const lsYears = [...new Set([
    ...dwRecords.map((r) => r.killDate ? new Date(r.killDate).getFullYear().toString() : null),
    ...martRecords.map((r) => r.saleDate ? new Date(r.saleDate).getFullYear().toString() : null)
  ].filter(Boolean))].sort().reverse();
  const filteredDW = lsYearFilter === "__all__" ? dwRecords : dwRecords.filter((r) => r.killDate && new Date(r.killDate).getFullYear().toString() === lsYearFilter);
  const filteredMart = lsYearFilter === "__all__" ? martRecords : martRecords.filter((r) => r.saleDate && new Date(r.saleDate).getFullYear().toString() === lsYearFilter);
  const farmQ = useQuery({ queryKey: ["farm-detail", farmId], queryFn: () => fetch(`/api/farms/${farmId}`).then((r) => r.json()), enabled: !!farmId, select: (d) => d.record });
  const farm = farmQ.data;
  function printDWRegister() {
    const printedAt = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
    const farmName = farm?.name ?? "Farm";
    const cph = farm?.cphNumber ? ` · CPH: ${farm.cphNumber}` : "";
    const yearLabel = lsYearFilter === "__all__" ? "All Years" : lsYearFilter;
    const rows = filteredDW.map((r) => `<tr>
      <td>${fmtDate(r.killDate)}</td><td>${r.processor || "—"}</td><td>${r.species || "—"}</td>
      <td style="text-align:right">${r.headCount || "—"}</td>
      <td>${r.killSheetRef || "—"}</td>
      <td style="text-align:right">${r.totalDeadweightKg ? parseFloat(r.totalDeadweightKg).toFixed(1) : "—"}</td>
      <td style="text-align:right">${r.pricePerKgPence ? r.pricePerKgPence + "p" : "—"}</td>
      <td>${[r.gradeClassification, r.fatClass].filter(Boolean).join(" / ") || "—"}</td>
      <td style="text-align:right">${r.netPaymentPence ? "£" + (r.netPaymentPence / 100).toLocaleString("en-GB", { minimumFractionDigits: 2 }) : "—"}</td>
      <td style="text-align:center;color:${r.movementId ? "#166534" : "#9ca3af"};font-weight:${r.movementId ? "700" : "400"}">${r.movementId ? "✓ Linked" : "—"}</td>
    </tr>`).join("");
    const total = filteredDW.reduce((s, r) => s + (r.netPaymentPence ?? 0), 0) / 100;
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Deadweight Kill Sheet Register</title>
    <style>body{font-family:Arial,sans-serif;font-size:10pt;margin:12mm 14mm;color:#111}h1{font-size:14pt;margin:0 0 2px}p{margin:0;font-size:9pt;color:#555}.hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #15803d;padding-bottom:10px;margin-bottom:16px}.hdr-r{text-align:right;font-size:9pt;color:#444}table{width:100%;border-collapse:collapse;font-size:8.5pt}th{background:#f0fdf4;border:1px solid #d1fae5;padding:5px 7px;text-align:left;font-weight:700;color:#14532d}td{border:1px solid #e5e7eb;padding:5px 7px}tr:nth-child(even) td{background:#f9fafb}.tfoot td{font-weight:700;background:#f0fdf4;border-top:2px solid #15803d}.note{margin-top:10px;font-size:8pt;color:#6b7280}.footer{margin-top:16px;display:flex;justify-content:space-between;font-size:7.5pt;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:8px}@media print{body{margin:8mm 10mm}}</style>
    </head><body>
    <div class="hdr"><div><h1>${farmName}${cph}</h1><p>Deadweight Kill Sheet Register — ${yearLabel}</p></div><div class="hdr-r"><strong>Printed:</strong> ${printedAt}<br>Records shown: <strong>${filteredDW.length}</strong></div></div>
    <table><thead><tr><th>Kill Date</th><th>Processor</th><th>Species</th><th>Head</th><th>Kill Sheet Ref</th><th>Total DW (kg)</th><th>Price/kg</th><th>Grade / Fat</th><th>Net Payment</th><th>Movement Linked</th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr><td colspan="8" style="text-align:right;font-weight:600">Total Net Payment</td><td style="text-align:right;font-weight:700;background:#f0fdf4;border-top:2px solid #15803d">£${total.toLocaleString("en-GB", { minimumFractionDigits: 2 })}</td><td></td></tr></tfoot>
    </table>
    <p class="note">Movement Linked — confirms kill sheet is associated with a BCMS / LIS off-farm movement record. Required for Red Tractor and AHDB audit trail compliance.</p>
    <div class="footer"><span>BDE Farm Trac — Barnett Davies Enterprises Ltd · Confidential</span><span>Generated: ${printedAt}</span></div>
    </body></html>`;
    const win = window.open("", "_blank", "width=1050,height=700");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.addEventListener("afterprint", () => win.close());
      win.print();
    }, 400);
  }
  function printMartRegister() {
    const printedAt = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
    const farmName = farm?.name ?? "Farm";
    const cph = farm?.cphNumber ? ` · CPH: ${farm.cphNumber}` : "";
    const yearLabel = lsYearFilter === "__all__" ? "All Years" : lsYearFilter;
    const rows = filteredMart.map((r) => `<tr>
      <td>${fmtDate(r.saleDate)}</td><td>${r.martName || "—"}</td><td>${r.species || "—"}</td>
      <td>${r.category || "—"}</td><td>${r.lotNumber || "—"}</td>
      <td style="text-align:right">${r.headCount || "—"}</td>
      <td style="text-align:right">${r.averageLiveweightKg ? parseFloat(r.averageLiveweightKg).toFixed(1) + " kg" : "—"}</td>
      <td>${r.auctioneerRef || "—"}</td>
      <td style="text-align:right">${r.netPaymentPence ? "£" + (r.netPaymentPence / 100).toLocaleString("en-GB", { minimumFractionDigits: 2 }) : "—"}</td>
      <td style="text-align:center;color:${r.movementId ? "#1e40af" : "#9ca3af"};font-weight:${r.movementId ? "700" : "400"}">${r.movementId ? "✓ Linked" : "—"}</td>
    </tr>`).join("");
    const total = filteredMart.reduce((s, r) => s + (r.netPaymentPence ?? 0), 0) / 100;
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Mart / Auction Sales Register</title>
    <style>body{font-family:Arial,sans-serif;font-size:10pt;margin:12mm 14mm;color:#111}h1{font-size:14pt;margin:0 0 2px}p{margin:0;font-size:9pt;color:#555}.hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #2563eb;padding-bottom:10px;margin-bottom:16px}.hdr-r{text-align:right;font-size:9pt;color:#444}table{width:100%;border-collapse:collapse;font-size:8.5pt}th{background:#eff6ff;border:1px solid #bfdbfe;padding:5px 7px;text-align:left;font-weight:700;color:#1e3a8a}td{border:1px solid #e5e7eb;padding:5px 7px}tr:nth-child(even) td{background:#f9fafb}.tfoot td{font-weight:700;background:#eff6ff;border-top:2px solid #2563eb}.note{margin-top:10px;font-size:8pt;color:#6b7280}.footer{margin-top:16px;display:flex;justify-content:space-between;font-size:7.5pt;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:8px}@media print{body{margin:8mm 10mm}}</style>
    </head><body>
    <div class="hdr"><div><h1>${farmName}${cph}</h1><p>Mart / Auction Sales Register — ${yearLabel}</p></div><div class="hdr-r"><strong>Printed:</strong> ${printedAt}<br>Records shown: <strong>${filteredMart.length}</strong></div></div>
    <table><thead><tr><th>Sale Date</th><th>Mart</th><th>Species</th><th>Category</th><th>Lot</th><th>Head</th><th>Avg Liveweight</th><th>Auctioneer Ref</th><th>Net Payment</th><th>Movement Linked</th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr><td colspan="8" style="text-align:right;font-weight:600">Total Net Payment</td><td style="text-align:right;font-weight:700;background:#eff6ff;border-top:2px solid #2563eb">£${total.toLocaleString("en-GB", { minimumFractionDigits: 2 })}</td><td></td></tr></tfoot>
    </table>
    <p class="note">Movement Linked — confirms mart sale is associated with the corresponding LIS / BCMS off-farm movement record. Required for livestock traceability audit trail.</p>
    <div class="footer"><span>BDE Farm Trac — Barnett Davies Enterprises Ltd · Confidential</span><span>Generated: ${printedAt}</span></div>
    </body></html>`;
    const win = window.open("", "_blank", "width=1050,height=700");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.addEventListener("afterprint", () => win.close());
      win.print();
    }, 400);
  }
  const dwTotal = filteredDW.reduce((s, r) => s + (r.netPaymentPence ?? r.grossValuePence ?? 0), 0);
  const martTotal = filteredMart.reduce((s, r) => s + (r.netPaymentPence ?? r.grossValuePence ?? 0), 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 24, marginBottom: 16 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "12px 20px" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.75rem", color: "#16a34a", fontWeight: 600 }, children: "Deadweight Revenue" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "1.4rem", fontWeight: 700, color: "#15803d" }, children: pToGBP(dwTotal) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "12px 20px" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.75rem", color: "#2563eb", fontWeight: 600 }, children: "Mart Revenue" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "1.4rem", fontWeight: 700, color: "#1d4ed8" }, children: pToGBP(martTotal) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 8, padding: "12px 20px" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.75rem", color: "#7c3aed", fontWeight: 600 }, children: "Total Livestock Revenue" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "1.4rem", fontWeight: 700, color: "#6d28d9" }, children: pToGBP(dwTotal + martTotal) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSubTab("deadweight"), style: { padding: "6px 16px", borderRadius: 6, border: "1px solid", borderColor: subTab === "deadweight" ? "#15803d" : "#d1d5db", background: subTab === "deadweight" ? "#15803d" : "#fff", color: subTab === "deadweight" ? "#fff" : "#374151", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }, children: "Deadweight / Kill Sheets" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSubTab("mart"), style: { padding: "6px 16px", borderRadius: 6, border: "1px solid", borderColor: subTab === "mart" ? "#2563eb" : "#d1d5db", background: subTab === "mart" ? "#2563eb" : "#fff", color: subTab === "mart" ? "#fff" : "#374151", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }, children: "Mart / Auction Sales" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: lsYearFilter, onChange: (e) => setLsYearFilter(e.target.value), style: { padding: "6px 12px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: "0.875rem", color: "#374151", background: "#fff", cursor: "pointer" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "__all__", children: "All Years" }),
        lsYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: y, children: y }, y))
      ] })
    ] }),
    subTab === "deadweight" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: printDWRegister, style: { display: "flex", alignItems: "center", gap: 6, fontSize: "0.8125rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14 }),
          " Print Register"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setEditingDW(null);
          setFormDW(emptyDW);
          setOpenDW(true);
        }, style: { background: "#15803d", color: "#fff" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16, style: { marginRight: 6 } }),
          " Add Kill Sheet"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { borderBottom: "2px solid #e5e7eb", background: "#f9fafb" }, children: ["Kill Date", "Processor", "Species", "Head", "Total DW (kg)", "Avg DW (kg)", "Price/kg", "Net Payment", "Grade", "Doc", "Actions"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }, children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
          filteredDW.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 11, style: { padding: 32, textAlign: "center", color: "#9ca3af" }, children: dwRecords.length === 0 ? "No kill sheets yet" : `No kill sheets for ${lsYearFilter}` }) }),
          filteredDW.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: expandedDWId === r.id ? "none" : "1px solid #f3f4f6" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "8px 12px" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: fmtDate(r.killDate) }),
                r.movementId && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.65rem", background: "#dcfce7", color: "#166534", borderRadius: 4, padding: "1px 5px", fontWeight: 600 }, children: "Movement" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", fontWeight: 500 }, children: r.processor }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px" }, children: r.species }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px" }, children: r.headCount }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px" }, children: r.totalDeadweightKg ? `${parseFloat(r.totalDeadweightKg).toFixed(1)} kg` : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px" }, children: r.averageDeadweightKg ? `${parseFloat(r.averageDeadweightKg).toFixed(1)} kg` : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px" }, children: r.pricePerKgPence ? `${r.pricePerKgPence}p/kg` : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", fontWeight: 600, color: "#15803d" }, children: pToGBP(r.netPaymentPence) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px" }, children: r.gradeClassification ?? "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                DocCell,
                {
                  endpoint: `/api/farms/${farmId}/livestock-deadweight-sales/${r.id}`,
                  queryKey: ["livestock-deadweight-sales", farmId],
                  documentPath: r.documentPath,
                  documentName: r.documentName
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4 }, children: [
                r.animalIds && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", title: "View ear tags", onClick: () => setExpandedDWId(expandedDWId === r.id ? null : r.id), children: expandedDWId === r.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 14 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 14 }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setViewDW(r), title: "View", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 14 }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => {
                  setEditingDW(r);
                  setFormDW({ ...r, killDate: r.killDate?.slice(0, 10) ?? "", paymentDate: r.paymentDate?.slice(0, 10) ?? "" });
                  setOpenDW(true);
                }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 14 }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", style: { color: "#dc2626" }, onClick: () => setDeleteDWId(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
              ] }) })
            ] }),
            expandedDWId === r.id && r.animalIds && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f0fdf4", borderBottom: "1px solid #bbf7d0" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { colSpan: 11, style: { padding: "8px 16px 12px" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: 12, fontWeight: 600, color: "#15803d", marginBottom: 6 }, children: [
                "Animal Ear Tags — ",
                r.animalIds.split(",").length,
                " head"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 4 }, children: r.animalIds.split(",").map((tag, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { background: "#dcfce7", border: "1px solid #86efac", borderRadius: 4, padding: "2px 8px", fontSize: 12, fontFamily: "monospace", color: "#166534" }, children: tag.trim() }, i)) })
            ] }) })
          ] }, r.id))
        ] })
      ] })
    ] }),
    subTab === "mart" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: printMartRegister, style: { display: "flex", alignItems: "center", gap: 6, fontSize: "0.8125rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14 }),
          " Print Register"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setEditingMart(null);
          setFormMart(emptyMart);
          setOpenMart(true);
        }, style: { background: "#2563eb", color: "#fff" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16, style: { marginRight: 6 } }),
          " Add Mart Sale"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { borderBottom: "2px solid #e5e7eb", background: "#f9fafb" }, children: ["Sale Date", "Mart", "Species", "Category", "Lot", "Head", "Price/Unit", "Net Payment", "Buyer", "Doc", "Actions"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }, children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
          filteredMart.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 11, style: { padding: 32, textAlign: "center", color: "#9ca3af" }, children: martRecords.length === 0 ? "No mart sales yet" : `No mart sales for ${lsYearFilter}` }) }),
          filteredMart.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "1px solid #f3f4f6" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "8px 12px" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: fmtDate(r.saleDate) }),
              r.movementId && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.65rem", background: "#dbeafe", color: "#1e40af", borderRadius: 4, padding: "1px 5px", fontWeight: 600 }, children: "Movement" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", fontWeight: 500 }, children: r.martName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px" }, children: r.species }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: "#f3f4f6", color: "#374151", border: "none", fontSize: "0.7rem" }, children: r.category }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#6b7280" }, children: r.lotNumber ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px" }, children: r.headCount }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px" }, children: r.pricePerUnitPence ? pToGBP(r.pricePerUnitPence) : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", fontWeight: 600, color: "#1d4ed8" }, children: pToGBP(r.netPaymentPence) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#6b7280" }, children: r.buyerName ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              DocCell,
              {
                endpoint: `/api/farms/${farmId}/livestock-mart-sales/${r.id}`,
                queryKey: ["livestock-mart-sales", farmId],
                documentPath: r.documentPath,
                documentName: r.documentName
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setViewMart(r), title: "View", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 14 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => {
                setEditingMart(r);
                setFormMart({ ...r, saleDate: r.saleDate?.slice(0, 10) ?? "", paymentDate: r.paymentDate?.slice(0, 10) ?? "" });
                setOpenMart(true);
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 14 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", style: { color: "#dc2626" }, onClick: () => setDeleteMartId(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
            ] }) })
          ] }, r.id))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: openDW, onOpenChange: (v) => {
      setOpenDW(v);
      if (!v) {
        setEditingDW(null);
        setFormDW(emptyDW);
        dwMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 700, maxHeight: "90vh", overflowY: "auto" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingDW ? "Edit Kill Sheet" : "Add Kill Sheet" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submitDW, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Kill Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: formDW.killDate, onChange: (e) => setFormDW((f) => ({ ...f, killDate: e.target.value })), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Processor ",
              formDW.processor ? "" : "*"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              BuyerCombobox,
              {
                farmId,
                types: ["livestock_processor"],
                valueId: formDW.processorId,
                valueName: formDW.processor,
                onChange: (id, name) => setFormDW((f) => ({ ...f, processorId: id, processor: name })),
                required: true,
                placeholder: "Search or add processor...",
                typeLabel: "Processor",
                postAddNavigatePath: "/suppliers-stock?tab=suppliers"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Species *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: SPECIES.filter((s) => s !== "Other").includes(formDW.species) ? formDW.species : formDW.species ? "Other" : "", onValueChange: (v) => setFormDW((f) => ({ ...f, species: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select species" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SPECIES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
            ] }),
            (formDW.species === "Other" || formDW.species && !SPECIES.filter((s) => s !== "Other").includes(formDW.species)) && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1.5", value: formDW.species === "Other" ? "" : formDW.species, onChange: (e) => setFormDW((f) => ({ ...f, species: e.target.value || "Other" })), placeholder: "Please specify species…" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Breed" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: formDW.breed, onChange: (e) => setFormDW((f) => ({ ...f, breed: e.target.value })), placeholder: "e.g. Limousin x" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Head Count *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", step: "1", value: formDW.headCount, onChange: (e) => setFormDW((f) => ({ ...f, headCount: e.target.value })), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Total Deadweight (kg)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: formDW.totalDeadweightKg, onChange: (e) => setFormDW((f) => ({ ...f, totalDeadweightKg: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Avg Deadweight (kg)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: formDW.averageDeadweightKg, onChange: (e) => setFormDW((f) => ({ ...f, averageDeadweightKg: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Price (pence/kg)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                step: "1",
                value: formDW.pricePerKgPence ? String(formDW.pricePerKgPence) : "",
                onChange: (e) => setFormDW((f) => ({ ...f, pricePerKgPence: Math.round(parseFloat(e.target.value || "0")) })),
                placeholder: "e.g. 512"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Grade / Classification" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: formDW.gradeClassification, onChange: (e) => setFormDW((f) => ({ ...f, gradeClassification: e.target.value })), placeholder: "e.g. R4L, U3" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fat Class" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: formDW.fatClass, onChange: (e) => setFormDW((f) => ({ ...f, fatClass: e.target.value })), placeholder: "e.g. 3" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Kill Sheet Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: formDW.killSheetRef, onChange: (e) => setFormDW((f) => ({ ...f, killSheetRef: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Gross Value (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: formDW.grossValuePence ? (formDW.grossValuePence / 100).toFixed(2) : "", onChange: (e) => setFormDW((f) => ({ ...f, grossValuePence: Math.round(parseFloat(e.target.value || "0") * 100) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Transport Deduction (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: formDW.transportDeductionPence ? (formDW.transportDeductionPence / 100).toFixed(2) : "", onChange: (e) => setFormDW((f) => ({ ...f, transportDeductionPence: Math.round(parseFloat(e.target.value || "0") * 100) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Levy Deduction (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: formDW.levyDeductionPence ? (formDW.levyDeductionPence / 100).toFixed(2) : "", onChange: (e) => setFormDW((f) => ({ ...f, levyDeductionPence: Math.round(parseFloat(e.target.value || "0") * 100) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Net Payment (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: formDW.netPaymentPence ? (formDW.netPaymentPence / 100).toFixed(2) : "", onChange: (e) => setFormDW((f) => ({ ...f, netPaymentPence: Math.round(parseFloat(e.target.value || "0") * 100) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: formDW.paymentDate, onChange: (e) => setFormDW((f) => ({ ...f, paymentDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Premium Scheme" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: formDW.premiumSchemeName, onChange: (e) => setFormDW((f) => ({ ...f, premiumSchemeName: e.target.value })), placeholder: "e.g. RSPCA Assured, Organic" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Premium Value (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: formDW.premiumPence ? (formDW.premiumPence / 100).toFixed(2) : "", onChange: (e) => setFormDW((f) => ({ ...f, premiumPence: Math.round(parseFloat(e.target.value || "0") * 100) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vendor Declaration Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: formDW.vendorDeclarationRef, onChange: (e) => setFormDW((f) => ({ ...f, vendorDeclarationRef: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Animal Ear Tags" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: formDW.animalIds, onChange: (e) => setFormDW((f) => ({ ...f, animalIds: e.target.value })), placeholder: "comma-separated" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: formDW.redTractorAssured, onChange: (e) => setFormDW((f) => ({ ...f, redTractorAssured: e.target.checked })), id: "rtAssured" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rtAssured", children: "Red Tractor Assured" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: formDW.organicCertified, onChange: (e) => setFormDW((f) => ({ ...f, organicCertified: e.target.checked })), id: "organic" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "organic", children: "Organic Certified" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1/-1" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link to Off-Farm Movement Record" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: formDW.movementId ?? "",
                onChange: (e) => setFormDW((f) => ({ ...f, movementId: e.target.value ? parseInt(e.target.value) : null })),
                style: { width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: "0.875rem", color: "#374151", background: "#fff" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Not linked to a movement record —" }),
                  outgoingMovements.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: m.id, children: [
                    new Date(m.movementDate).toLocaleDateString("en-GB"),
                    " · ",
                    m.movementType.toUpperCase(),
                    " · ",
                    m.species ?? "Unknown",
                    " · ",
                    m.numberOfAnimals ?? "?",
                    " head ",
                    m.toLocation ? `→ ${m.toLocation}` : "",
                    " ",
                    m.licenceNumber ? `[${m.licenceNumber}]` : ""
                  ] }, m.id))
                ]
              }
            ),
            outgoingMovements.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginTop: 4 }, children: "No off-farm movement records found. Log a movement (type: Off/Sale/Dispatch) on the Livestock page to link it here." }),
            outgoingMovements.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginTop: 4 }, children: "Linking confirms the BCMS movement record for this kill — essential for audit trail compliance." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1/-1" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: formDW.notes, onChange: (e) => setFormDW((f) => ({ ...f, notes: e.target.value })), rows: 2 })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: dwMut, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { style: { marginTop: 16 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => {
            setOpenDW(false);
            setEditingDW(null);
            setFormDW(emptyDW);
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", style: { background: "#15803d", color: "#fff" }, disabled: dwMut.isPending, children: dwMut.isPending ? "Saving…" : editingDW ? "Update" : "Save" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: openMart, onOpenChange: (v) => {
      setOpenMart(v);
      if (!v) {
        setEditingMart(null);
        setFormMart(emptyMart);
        martMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 700, maxHeight: "90vh", overflowY: "auto" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingMart ? "Edit Mart Sale" : "Add Mart Sale" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submitMart, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sale Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: formMart.saleDate, onChange: (e) => setFormMart((f) => ({ ...f, saleDate: e.target.value })), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Mart Name ",
              formMart.martName ? "" : "*"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              BuyerCombobox,
              {
                farmId,
                types: ["livestock_mart"],
                valueId: formMart.martId,
                valueName: formMart.martName,
                onChange: (id, name) => setFormMart((f) => ({ ...f, martId: id, martName: name })),
                required: true,
                placeholder: "Search or add mart...",
                typeLabel: "Livestock Mart",
                postAddNavigatePath: "/suppliers-stock?tab=suppliers"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mart Location" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: formMart.martLocation, onChange: (e) => setFormMart((f) => ({ ...f, martLocation: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Species *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: SPECIES.filter((s) => s !== "Other").includes(formMart.species) ? formMart.species : formMart.species ? "Other" : "", onValueChange: (v) => setFormMart((f) => ({ ...f, species: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select species" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SPECIES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
            ] }),
            (formMart.species === "Other" || formMart.species && !SPECIES.filter((s) => s !== "Other").includes(formMart.species)) && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1.5", value: formMart.species === "Other" ? "" : formMart.species, onChange: (e) => setFormMart((f) => ({ ...f, species: e.target.value || "Other" })), placeholder: "Please specify species…" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Category" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: formMart.category, onValueChange: (v) => setFormMart((f) => ({ ...f, category: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: LIVESTOCK_CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.toLowerCase(), children: c }, c.toLowerCase())) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lot Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: formMart.lotNumber, onChange: (e) => setFormMart((f) => ({ ...f, lotNumber: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Head Count *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", step: "1", value: formMart.headCount, onChange: (e) => setFormMart((f) => ({ ...f, headCount: e.target.value })), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Avg Liveweight (kg)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: formMart.averageLiveweightKg, onChange: (e) => setFormMart((f) => ({ ...f, averageLiveweightKg: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Price Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: formMart.priceType, onValueChange: (v) => setFormMart((f) => ({ ...f, priceType: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "per_head", children: "Per Head" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "per_kg_lw", children: "Per kg Liveweight" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "per_kg_dw", children: "Per kg Deadweight" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Price per Unit (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: formMart.pricePerUnitPence ? (formMart.pricePerUnitPence / 100).toFixed(2) : "", onChange: (e) => setFormMart((f) => ({ ...f, pricePerUnitPence: Math.round(parseFloat(e.target.value || "0") * 100) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Gross Value (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: formMart.grossValuePence ? (formMart.grossValuePence / 100).toFixed(2) : "", onChange: (e) => setFormMart((f) => ({ ...f, grossValuePence: Math.round(parseFloat(e.target.value || "0") * 100) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Commission (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: formMart.commissionPence ? (formMart.commissionPence / 100).toFixed(2) : "", onChange: (e) => setFormMart((f) => ({ ...f, commissionPence: Math.round(parseFloat(e.target.value || "0") * 100) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Levy (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: formMart.levyPence ? (formMart.levyPence / 100).toFixed(2) : "", onChange: (e) => setFormMart((f) => ({ ...f, levyPence: Math.round(parseFloat(e.target.value || "0") * 100) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Transport Cost (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: formMart.transportCostPence ? (formMart.transportCostPence / 100).toFixed(2) : "", onChange: (e) => setFormMart((f) => ({ ...f, transportCostPence: Math.round(parseFloat(e.target.value || "0") * 100) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Net Payment (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: formMart.netPaymentPence ? (formMart.netPaymentPence / 100).toFixed(2) : "", onChange: (e) => setFormMart((f) => ({ ...f, netPaymentPence: Math.round(parseFloat(e.target.value || "0") * 100) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: formMart.buyerName, onChange: (e) => setFormMart((f) => ({ ...f, buyerName: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Auctioneer Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: formMart.auctioneerRef, onChange: (e) => setFormMart((f) => ({ ...f, auctioneerRef: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: formMart.paymentDate, onChange: (e) => setFormMart((f) => ({ ...f, paymentDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1/-1" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link to Off-Farm Movement Record" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: formMart.movementId ?? "",
                onChange: (e) => setFormMart((f) => ({ ...f, movementId: e.target.value ? parseInt(e.target.value) : null })),
                style: { width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: "0.875rem", color: "#374151", background: "#fff" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Not linked to a movement record —" }),
                  outgoingMovements.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: m.id, children: [
                    new Date(m.movementDate).toLocaleDateString("en-GB"),
                    " · ",
                    m.movementType.toUpperCase(),
                    " · ",
                    m.species ?? "Unknown",
                    " · ",
                    m.numberOfAnimals ?? "?",
                    " head ",
                    m.toLocation ? `→ ${m.toLocation}` : "",
                    " ",
                    m.licenceNumber ? `[${m.licenceNumber}]` : ""
                  ] }, m.id))
                ]
              }
            ),
            outgoingMovements.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginTop: 4 }, children: "No off-farm movement records found. Log a movement (type: Off/Sale/Dispatch) on the Livestock page to link it here." }),
            outgoingMovements.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginTop: 4 }, children: "Linking confirms the BCMS movement record for this mart sale — required for livestock traceability." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1/-1" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: formMart.notes, onChange: (e) => setFormMart((f) => ({ ...f, notes: e.target.value })), rows: 2 })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: martMut, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { style: { marginTop: 16 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => {
            setOpenMart(false);
            setEditingMart(null);
            setFormMart(emptyMart);
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", style: { background: "#2563eb", color: "#fff" }, disabled: martMut.isPending, children: martMut.isPending ? "Saving…" : editingMart ? "Update" : "Save" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteDWId !== null, onOpenChange: (v) => {
      if (!v) {
        setDeleteDWId(null);
        dwDelMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Kill Sheet?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#6b7280" }, children: "This cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: dwDelMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteDWId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { style: { background: "#dc2626", color: "#fff" }, onClick: () => deleteDWId && dwDelMut.mutate(deleteDWId), children: "Delete" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteMartId !== null, onOpenChange: (v) => {
      if (!v) {
        setDeleteMartId(null);
        martDelMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Mart Sale?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#6b7280" }, children: "This cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: martDelMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteMartId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { style: { background: "#dc2626", color: "#fff" }, onClick: () => deleteMartId && martDelMut.mutate(deleteMartId), children: "Delete" })
      ] })
    ] }) }),
    viewDW && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewDW(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 600 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Kill Sheet — ",
        fmtDate(viewDW.killDate)
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: "0.875rem", padding: "4px 0" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Kill Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: fmtDate(viewDW.killDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Processor" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600 }, children: viewDW.processor })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Species" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewDW.species })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Head Count" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewDW.headCount })
        ] }),
        viewDW.breed && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Breed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewDW.breed })
        ] }),
        viewDW.totalDeadweightKg && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Total DW (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            parseFloat(viewDW.totalDeadweightKg).toFixed(1),
            " kg"
          ] })
        ] }),
        viewDW.averageDeadweightKg && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Avg DW (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            parseFloat(viewDW.averageDeadweightKg).toFixed(1),
            " kg"
          ] })
        ] }),
        viewDW.pricePerKgPence && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Price/kg" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            viewDW.pricePerKgPence,
            "p/kg"
          ] })
        ] }),
        viewDW.gradeClassification && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Grade" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewDW.gradeClassification })
        ] }),
        viewDW.fatClass && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Fat Class" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewDW.fatClass })
        ] }),
        viewDW.killSheetRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Kill Sheet Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs", children: viewDW.killSheetRef })
        ] }),
        viewDW.grossValuePence != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Gross Value" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: pToGBP(viewDW.grossValuePence) })
        ] }),
        viewDW.netPaymentPence != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Net Payment" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#15803d" }, children: pToGBP(viewDW.netPaymentPence) })
        ] }),
        viewDW.paymentDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Payment Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: fmtDate(viewDW.paymentDate) })
        ] }),
        viewDW.premiumSchemeName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Premium Scheme" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewDW.premiumSchemeName })
        ] }),
        viewDW.vendorDeclarationRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Vendor Declaration" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs", children: viewDW.vendorDeclarationRef })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1/-1" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Linked Off-Farm Movement" }),
          viewDW.movementId ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.75rem", fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: "#dcfce7", color: "#166534" }, children: [
            "✓ Movement #",
            viewDW.movementId,
            " linked — BCMS audit trail complete"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.875rem", color: "#9ca3af" }, children: "Not linked — edit to link the corresponding off-farm movement record" })
        ] }),
        viewDW.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1/-1" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", whiteSpace: "pre-line", color: "#374151" }, children: viewDW.notes })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { style: { marginTop: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => {
          setEditingDW(viewDW);
          setFormDW({ ...viewDW, killDate: viewDW.killDate?.slice(0, 10) ?? "", paymentDate: viewDW.paymentDate?.slice(0, 10) ?? "" });
          setOpenDW(true);
          setViewDW(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 13, style: { marginRight: 4 } }),
          "Edit"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setViewDW(null), children: "Close" })
      ] })
    ] }) }),
    viewMart && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewMart(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 600 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Mart Sale — ",
        fmtDate(viewMart.saleDate)
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: "0.875rem", padding: "4px 0" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Sale Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: fmtDate(viewMart.saleDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Mart" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600 }, children: viewMart.martName })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Species" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewMart.species })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewMart.category })
        ] }),
        viewMart.lotNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Lot Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs", children: viewMart.lotNumber })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Head Count" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewMart.headCount })
        ] }),
        viewMart.pricePerUnitPence != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Price/Unit" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: pToGBP(viewMart.pricePerUnitPence) })
        ] }),
        viewMart.netPaymentPence != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Net Payment" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#1d4ed8" }, children: pToGBP(viewMart.netPaymentPence) })
        ] }),
        viewMart.buyerName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Buyer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewMart.buyerName })
        ] }),
        viewMart.auctioneerRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Auctioneer Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs", children: viewMart.auctioneerRef })
        ] }),
        viewMart.paymentDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Payment Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: fmtDate(viewMart.paymentDate) })
        ] }),
        viewMart.martLocation && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Mart Location" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewMart.martLocation })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1/-1" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Linked Off-Farm Movement" }),
          viewMart.movementId ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.75rem", fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: "#dbeafe", color: "#1e40af" }, children: [
            "✓ Movement #",
            viewMart.movementId,
            " linked — LIS/BCMS audit trail complete"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.875rem", color: "#9ca3af" }, children: "Not linked — edit to link the corresponding off-farm movement record" })
        ] }),
        viewMart.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1/-1" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", whiteSpace: "pre-line", color: "#374151" }, children: viewMart.notes })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { style: { marginTop: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => {
          setEditingMart(viewMart);
          setFormMart({ ...viewMart, saleDate: viewMart.saleDate?.slice(0, 10) ?? "", paymentDate: viewMart.paymentDate?.slice(0, 10) ?? "" });
          setOpenMart(true);
          setViewMart(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 13, style: { marginRight: 4 } }),
          "Edit"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setViewMart(null), children: "Close" })
      ] })
    ] }) })
  ] });
}
function MilkSalesTab({ farmId }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [milkYearFilter, setMilkYearFilter] = usePersistedFilter({ page: "sales-milk", filter: "year", farmId, defaultValue: "__all__" });
  const empty = {
    statementMonth: "",
    buyerId: null,
    buyer: "",
    cphNumber: "",
    litresSupplied: "",
    pencePerLitre: "",
    grossValuePence: "",
    butterfatPct: "",
    proteinPct: "",
    scc: "",
    bactoscan: "",
    butterfatBonusPence: "",
    proteinBonusPence: "",
    qualityBonusPence: "",
    qualityPenaltyPence: "",
    sccPenaltyPence: "",
    bactoscanPenaltyPence: "",
    transportDeductionPence: "",
    membershipDeductionPence: "",
    otherDeductionsPence: "",
    netPaymentPence: "",
    paymentDate: "",
    organicPremiumPence: "",
    sustainabilityBonusPence: "",
    statementRef: "",
    notes: ""
  };
  const [form, setForm] = reactExports.useState(empty);
  const q = useQuery({ queryKey: ["milk-statements", farmId], queryFn: () => fetch(`/api/farms/${farmId}/milk-statements`).then((r) => r.json()), enabled: !!farmId });
  const records = q.data?.records ?? [];
  const mut = useMutation({
    mutationFn: (body) => editing ? fetch(`/api/farms/${farmId}/milk-statements/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()) : fetch(`/api/farms/${farmId}/milk-statements`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["milk-statements", farmId] });
      setOpen(false);
      setEditing(null);
      setForm(empty);
      toast({ title: "Milk statement saved" });
    },
    onError: () => toast({ title: "Error saving", variant: "destructive" })
  });
  const delMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/milk-statements/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["milk-statements", farmId] });
      setDeleteId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    mut.mutate({
      ...form,
      litresSupplied: num(form.litresSupplied),
      pencePerLitre: num(form.pencePerLitre),
      grossValuePence: num(form.grossValuePence),
      butterfatPct: num(form.butterfatPct),
      proteinPct: num(form.proteinPct),
      scc: num(form.scc),
      bactoscan: num(form.bactoscan),
      butterfatBonusPence: num(form.butterfatBonusPence),
      proteinBonusPence: num(form.proteinBonusPence),
      qualityBonusPence: num(form.qualityBonusPence),
      qualityPenaltyPence: num(form.qualityPenaltyPence),
      sccPenaltyPence: num(form.sccPenaltyPence),
      bactoscanPenaltyPence: num(form.bactoscanPenaltyPence),
      transportDeductionPence: num(form.transportDeductionPence),
      membershipDeductionPence: num(form.membershipDeductionPence),
      otherDeductionsPence: num(form.otherDeductionsPence),
      netPaymentPence: num(form.netPaymentPence),
      organicPremiumPence: num(form.organicPremiumPence),
      sustainabilityBonusPence: num(form.sustainabilityBonusPence),
      paymentDate: form.paymentDate ? new Date(form.paymentDate).toISOString() : void 0
    });
  };
  const milkYears = [...new Set(records.map((r) => r.statementMonth ? new Date(r.statementMonth).getFullYear().toString() : null).filter(Boolean))].sort().reverse();
  const filteredMilk = milkYearFilter === "__all__" ? records : records.filter((r) => r.statementMonth && new Date(r.statementMonth).getFullYear().toString() === milkYearFilter);
  const totalLitres = filteredMilk.reduce((s, r) => s + parseFloat(r.litresSupplied ?? "0"), 0);
  const totalNet = filteredMilk.reduce((s, r) => s + (r.netPaymentPence ?? r.grossValuePence ?? 0), 0);
  const avgPpl = filteredMilk.length > 0 ? filteredMilk.reduce((s, r) => s + parseFloat(r.pencePerLitre ?? "0"), 0) / filteredMilk.length : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 24 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 18px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.72rem", color: "#16a34a", fontWeight: 600 }, children: "Total Litres" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "1.3rem", fontWeight: 700, color: "#15803d" }, children: [
            totalLitres.toLocaleString("en-GB", { maximumFractionDigits: 0 }),
            " L"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 18px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.72rem", color: "#2563eb", fontWeight: 600 }, children: "Net Revenue" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "1.3rem", fontWeight: 700, color: "#1d4ed8" }, children: pToGBP(totalNet) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 8, padding: "10px 18px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.72rem", color: "#7c3aed", fontWeight: 600 }, children: "Avg PPL" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "1.3rem", fontWeight: 700, color: "#6d28d9" }, children: avgPpl > 0 ? `${avgPpl.toFixed(2)}p` : "—" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, alignItems: "center" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: milkYearFilter, onChange: (e) => setMilkYearFilter(e.target.value), style: { padding: "6px 12px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: "0.875rem", color: "#374151", background: "#fff", cursor: "pointer" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "__all__", children: "All Years" }),
          milkYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: y, children: y }, y))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setEditing(null);
          setForm(empty);
          setOpen(true);
        }, style: { background: "#1d4ed8", color: "#fff" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16, style: { marginRight: 6 } }),
          " Add Milk Statement"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { borderBottom: "2px solid #e5e7eb", background: "#f9fafb" }, children: ["Month", "Buyer", "Litres", "PPL", "BF%", "Protein%", "SCC", "Net Payment", "Actions"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "#374151" }, children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
        filteredMilk.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 9, style: { padding: 32, textAlign: "center", color: "#9ca3af" }, children: records.length === 0 ? "No milk statements yet" : `No milk statements for ${milkYearFilter}` }) }),
        filteredMilk.map((r) => {
          const sccWarning = r.scc && parseInt(r.scc) > 200;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "1px solid #f3f4f6" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", fontWeight: 500 }, children: fmtMonth(r.statementMonth) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px" }, children: r.buyer }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px" }, children: r.litresSupplied ? `${parseFloat(r.litresSupplied).toLocaleString("en-GB")} L` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px" }, children: r.pencePerLitre ? `${parseFloat(r.pencePerLitre).toFixed(2)}p` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px" }, children: r.butterfatPct ? `${parseFloat(r.butterfatPct).toFixed(2)}%` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px" }, children: r.proteinPct ? `${parseFloat(r.proteinPct).toFixed(2)}%` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: sccWarning ? "#dc2626" : "#374151", fontWeight: sccWarning ? 600 : 400 }, children: [
              r.scc ?? "—",
              " ",
              sccWarning && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { size: 12, style: { display: "inline" } })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", fontWeight: 600, color: "#1d4ed8" }, children: pToGBP(r.netPaymentPence) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setViewRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 14 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => {
                setEditing(r);
                setForm({ ...r, paymentDate: r.paymentDate?.slice(0, 10) ?? "" });
                setOpen(true);
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 14 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", style: { color: "#dc2626" }, onClick: () => setDeleteId(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
            ] }) })
          ] }, r.id);
        })
      ] })
    ] }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Milk Sale" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Month" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtMonth(viewRecord.statementMonth) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Buyer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.buyer ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Litres" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.litresSupplied ? `${parseFloat(viewRecord.litresSupplied).toLocaleString("en-GB")} L` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "PPL" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.pencePerLitre ? `${parseFloat(viewRecord.pencePerLitre).toFixed(2)}p` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Butterfat %" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.butterfatPct ? `${parseFloat(viewRecord.butterfatPct).toFixed(2)}%` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Protein %" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.proteinPct ? `${parseFloat(viewRecord.proteinPct).toFixed(2)}%` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "SCC" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.scc ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Bactoscan" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.bactoscan ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Gross Value" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: pToGBP(viewRecord.grossValuePence) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Quality Bonus" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: pToGBP(viewRecord.qualityBonusPence) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Quality Penalty" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: pToGBP(viewRecord.qualityPenaltyPence) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "SCC Penalty" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: pToGBP(viewRecord.sccPenaltyPence) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Transport Deduction" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: pToGBP(viewRecord.transportDeductionPence) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Other Deductions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: pToGBP(viewRecord.otherDeductionsPence) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Net Payment" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium font-bold text-blue-600", children: pToGBP(viewRecord.netPaymentPence) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Payment Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.paymentDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Invoice Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.statementRef ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "CPH Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.cphNumber ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Organic Premium" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: pToGBP(viewRecord.organicPremiumPence) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Sustainability Bonus" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: pToGBP(viewRecord.sustainabilityBonusPence) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium whitespace-pre-wrap", children: String(viewRecord.notes ?? "—") })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setEditing(viewRecord);
          setForm({ ...viewRecord, paymentDate: viewRecord.paymentDate?.slice(0, 10) ?? "" });
          setOpen(true);
          setViewRecord(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
      setOpen(v);
      if (!v) {
        setEditing(null);
        setForm(empty);
        mut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 720, maxHeight: "90vh", overflowY: "auto" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Milk Statement" : "Add Milk Statement" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Statement Month *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "month", value: form.statementMonth, onChange: (e) => setForm((f) => ({ ...f, statementMonth: e.target.value })), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Milk Buyer ",
              form.buyer ? "" : "*"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              BuyerCombobox,
              {
                farmId,
                types: ["milk_buyer"],
                valueId: form.buyerId,
                valueName: form.buyer,
                onChange: (id, name) => setForm((f) => ({ ...f, buyerId: id, buyer: name })),
                required: true,
                placeholder: "Search or add milk buyer...",
                typeLabel: "Milk Buyer",
                postAddNavigatePath: "/suppliers-stock?tab=suppliers"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "CPH Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.cphNumber, onChange: (e) => setForm((f) => ({ ...f, cphNumber: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Statement Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.statementRef, onChange: (e) => setForm((f) => ({ ...f, statementRef: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Litres Supplied" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.litresSupplied, onChange: (e) => setForm((f) => ({ ...f, litresSupplied: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Pence per Litre" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.pencePerLitre, onChange: (e) => setForm((f) => ({ ...f, pencePerLitre: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Gross Value (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.grossValuePence ? (form.grossValuePence / 100).toFixed(2) : "", onChange: (e) => setForm((f) => ({ ...f, grossValuePence: Math.round(parseFloat(e.target.value || "0") * 100) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Butterfat %" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.001", value: form.butterfatPct, onChange: (e) => setForm((f) => ({ ...f, butterfatPct: e.target.value })), placeholder: "e.g. 4.12" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Protein %" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.001", value: form.proteinPct, onChange: (e) => setForm((f) => ({ ...f, proteinPct: e.target.value })), placeholder: "e.g. 3.32" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "SCC (000s/ml)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.scc, onChange: (e) => setForm((f) => ({ ...f, scc: e.target.value })), placeholder: "e.g. 150" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bactoscan (000s/ml)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.bactoscan, onChange: (e) => setForm((f) => ({ ...f, bactoscan: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quality Bonus (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.qualityBonusPence ? (form.qualityBonusPence / 100).toFixed(2) : "", onChange: (e) => setForm((f) => ({ ...f, qualityBonusPence: Math.round(parseFloat(e.target.value || "0") * 100) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quality Penalty (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.qualityPenaltyPence ? (form.qualityPenaltyPence / 100).toFixed(2) : "", onChange: (e) => setForm((f) => ({ ...f, qualityPenaltyPence: Math.round(parseFloat(e.target.value || "0") * 100) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "SCC Penalty (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.sccPenaltyPence ? (form.sccPenaltyPence / 100).toFixed(2) : "", onChange: (e) => setForm((f) => ({ ...f, sccPenaltyPence: Math.round(parseFloat(e.target.value || "0") * 100) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Transport Deduction (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.transportDeductionPence ? (form.transportDeductionPence / 100).toFixed(2) : "", onChange: (e) => setForm((f) => ({ ...f, transportDeductionPence: Math.round(parseFloat(e.target.value || "0") * 100) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Other Deductions (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.otherDeductionsPence ? (form.otherDeductionsPence / 100).toFixed(2) : "", onChange: (e) => setForm((f) => ({ ...f, otherDeductionsPence: Math.round(parseFloat(e.target.value || "0") * 100) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Net Payment (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.netPaymentPence ? (form.netPaymentPence / 100).toFixed(2) : "", onChange: (e) => setForm((f) => ({ ...f, netPaymentPence: Math.round(parseFloat(e.target.value || "0") * 100) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.paymentDate, onChange: (e) => setForm((f) => ({ ...f, paymentDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Organic Premium (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.organicPremiumPence ? (form.organicPremiumPence / 100).toFixed(2) : "", onChange: (e) => setForm((f) => ({ ...f, organicPremiumPence: Math.round(parseFloat(e.target.value || "0") * 100) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sustainability Bonus (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.sustainabilityBonusPence ? (form.sustainabilityBonusPence / 100).toFixed(2) : "", onChange: (e) => setForm((f) => ({ ...f, sustainabilityBonusPence: Math.round(parseFloat(e.target.value || "0") * 100) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1/-1" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: mut, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { style: { marginTop: 16 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => {
            setOpen(false);
            setEditing(null);
            setForm(empty);
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", style: { background: "#1d4ed8", color: "#fff" }, disabled: mut.isPending, children: mut.isPending ? "Saving…" : editing ? "Update" : "Save" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (v) => {
      if (!v) {
        setDeleteId(null);
        delMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Milk Statement?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#6b7280" }, children: "This cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: delMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { style: { background: "#dc2626", color: "#fff" }, onClick: () => deleteId && delMut.mutate(deleteId), children: "Delete" })
      ] })
    ] }) })
  ] });
}
function PoultrySettlementTab({ farmId }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [subTab, setSubTab] = reactExports.useState("batch");
  const [openBatch, setOpenBatch] = reactExports.useState(false);
  const [editingBatch, setEditingBatch] = reactExports.useState(null);
  const [viewBatch, setViewBatch] = reactExports.useState(null);
  const [openEgg, setOpenEgg] = reactExports.useState(false);
  const [editingEgg, setEditingEgg] = reactExports.useState(null);
  const [viewEgg, setViewEgg] = reactExports.useState(null);
  const [deleteBatchId, setDeleteBatchId] = reactExports.useState(null);
  const [deleteEggId, setDeleteEggId] = reactExports.useState(null);
  const [poultryYearFilter, setPoultryYearFilter] = usePersistedFilter({ page: "sales-poultry-settlement", filter: "year", farmId, defaultValue: "__all__" });
  const emptyBatch = {
    flockRef: "",
    integratorId: null,
    integratorName: "",
    species: "broiler",
    placementDate: "",
    catchDate: "",
    birdsPlaced: "",
    birdsDelivered: "",
    mortalityPct: "",
    averageLiveweightKg: "",
    totalLiveweightKg: "",
    fcr: "",
    ebi: "",
    settlementRatePence: "",
    grossValuePence: "",
    bonusPence: "",
    penaltyPence: "",
    catchingCostPence: "",
    otherDeductionsPence: "",
    netPaymentPence: "",
    paymentDate: "",
    slaughterhouseName: "",
    settlementRef: "",
    notes: ""
  };
  const [formBatch, setFormBatch] = reactExports.useState(emptyBatch);
  const emptyEgg = {
    weekEnding: "",
    packingStationId: null,
    packingStation: "",
    salesChannel: "packing_station",
    flockRef: "",
    dozensCollected: "",
    dozensDelivered: "",
    gradeADozens: "",
    gradeBDozens: "",
    crackWasteDozens: "",
    layRatePct: "",
    pricePerDozenPence: "",
    grossValuePence: "",
    deductionsPence: "",
    netValuePence: "",
    paymentDate: "",
    eggType: "free_range",
    packingRef: "",
    notes: ""
  };
  const [formEgg, setFormEgg] = reactExports.useState(emptyEgg);
  const batchQ = useQuery({ queryKey: ["poultry-batch-settlements", farmId], queryFn: () => fetch(`/api/farms/${farmId}/poultry-batch-settlements`).then((r) => r.json()), enabled: !!farmId });
  const batchRecords = batchQ.data?.records ?? [];
  const eggQ = useQuery({ queryKey: ["egg-sales", farmId], queryFn: () => fetch(`/api/farms/${farmId}/egg-sales`).then((r) => r.json()), enabled: !!farmId });
  const eggRecords = eggQ.data?.records ?? [];
  const batchMut = useMutation({
    mutationFn: (body) => editingBatch ? fetch(`/api/farms/${farmId}/poultry-batch-settlements/${editingBatch.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()) : fetch(`/api/farms/${farmId}/poultry-batch-settlements`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["poultry-batch-settlements", farmId] });
      setOpenBatch(false);
      setEditingBatch(null);
      setFormBatch(emptyBatch);
      toast({ title: "Batch settlement saved" });
    },
    onError: () => toast({ title: "Error saving", variant: "destructive" })
  });
  const batchDelMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/poultry-batch-settlements/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["poultry-batch-settlements", farmId] });
      setDeleteBatchId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const eggMut = useMutation({
    mutationFn: (body) => editingEgg ? fetch(`/api/farms/${farmId}/egg-sales/${editingEgg.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()) : fetch(`/api/farms/${farmId}/egg-sales`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["egg-sales", farmId] });
      setOpenEgg(false);
      setEditingEgg(null);
      setFormEgg(emptyEgg);
      toast({ title: "Egg sale saved" });
    },
    onError: () => toast({ title: "Error saving", variant: "destructive" })
  });
  const eggDelMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/egg-sales/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["egg-sales", farmId] });
      setDeleteEggId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const submitBatch = (e) => {
    e.preventDefault();
    batchMut.mutate({
      ...formBatch,
      birdsPlaced: num(formBatch.birdsPlaced),
      birdsDelivered: num(formBatch.birdsDelivered),
      mortalityPct: num(formBatch.mortalityPct),
      averageLiveweightKg: num(formBatch.averageLiveweightKg),
      totalLiveweightKg: num(formBatch.totalLiveweightKg),
      fcr: num(formBatch.fcr),
      ebi: num(formBatch.ebi),
      settlementRatePence: num(formBatch.settlementRatePence),
      grossValuePence: num(formBatch.grossValuePence),
      bonusPence: num(formBatch.bonusPence),
      penaltyPence: num(formBatch.penaltyPence),
      catchingCostPence: num(formBatch.catchingCostPence),
      otherDeductionsPence: num(formBatch.otherDeductionsPence),
      netPaymentPence: num(formBatch.netPaymentPence),
      placementDate: formBatch.placementDate ? new Date(formBatch.placementDate).toISOString() : void 0,
      catchDate: formBatch.catchDate ? new Date(formBatch.catchDate).toISOString() : void 0,
      paymentDate: formBatch.paymentDate ? new Date(formBatch.paymentDate).toISOString() : void 0
    });
  };
  const submitEgg = (e) => {
    e.preventDefault();
    eggMut.mutate({
      ...formEgg,
      dozensCollected: num(formEgg.dozensCollected),
      dozensDelivered: num(formEgg.dozensDelivered),
      gradeADozens: num(formEgg.gradeADozens),
      gradeBDozens: num(formEgg.gradeBDozens),
      crackWasteDozens: num(formEgg.crackWasteDozens),
      layRatePct: num(formEgg.layRatePct),
      pricePerDozenPence: num(formEgg.pricePerDozenPence),
      grossValuePence: num(formEgg.grossValuePence),
      deductionsPence: num(formEgg.deductionsPence),
      netValuePence: num(formEgg.netValuePence),
      weekEnding: formEgg.weekEnding ? new Date(formEgg.weekEnding).toISOString() : void 0,
      paymentDate: formEgg.paymentDate ? new Date(formEgg.paymentDate).toISOString() : void 0
    });
  };
  const poultryYears = [...new Set([
    ...batchRecords.map((r) => r.catchDate ? new Date(r.catchDate).getFullYear().toString() : null),
    ...eggRecords.map((r) => r.weekEnding ? new Date(r.weekEnding).getFullYear().toString() : null)
  ].filter(Boolean))].sort().reverse();
  const filteredBatch = poultryYearFilter === "__all__" ? batchRecords : batchRecords.filter((r) => r.catchDate && new Date(r.catchDate).getFullYear().toString() === poultryYearFilter);
  const filteredEgg = poultryYearFilter === "__all__" ? eggRecords : eggRecords.filter((r) => r.weekEnding && new Date(r.weekEnding).getFullYear().toString() === poultryYearFilter);
  const batchTotal = filteredBatch.reduce((s, r) => s + (r.netPaymentPence ?? r.grossValuePence ?? 0), 0);
  const eggTotal = filteredEgg.reduce((s, r) => s + (r.netValuePence ?? r.grossValuePence ?? 0), 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 24, marginBottom: 16 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 18px" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.72rem", color: "#d97706", fontWeight: 600 }, children: "Batch Settlement Revenue" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "1.3rem", fontWeight: 700, color: "#b45309" }, children: pToGBP(batchTotal) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, padding: "10px 18px" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.72rem", color: "#ea580c", fontWeight: 600 }, children: "Egg Sales Revenue" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "1.3rem", fontWeight: 700, color: "#c2410c" }, children: pToGBP(eggTotal) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSubTab("batch"), style: { padding: "6px 16px", borderRadius: 6, border: "1px solid", borderColor: subTab === "batch" ? "#b45309" : "#d1d5db", background: subTab === "batch" ? "#b45309" : "#fff", color: subTab === "batch" ? "#fff" : "#374151", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }, children: "Broiler / Turkey Batches" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSubTab("eggs"), style: { padding: "6px 16px", borderRadius: 6, border: "1px solid", borderColor: subTab === "eggs" ? "#ea580c" : "#d1d5db", background: subTab === "eggs" ? "#ea580c" : "#fff", color: subTab === "eggs" ? "#fff" : "#374151", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }, children: "Egg Sales" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: poultryYearFilter, onChange: (e) => setPoultryYearFilter(e.target.value), style: { padding: "6px 12px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: "0.875rem", color: "#374151", background: "#fff", cursor: "pointer" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "__all__", children: "All Years" }),
        poultryYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: y, children: y }, y))
      ] })
    ] }),
    subTab === "batch" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 12 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
        setEditingBatch(null);
        setFormBatch(emptyBatch);
        setOpenBatch(true);
      }, style: { background: "#b45309", color: "#fff" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16, style: { marginRight: 6 } }),
        " Add Batch Settlement"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { borderBottom: "2px solid #e5e7eb", background: "#f9fafb" }, children: ["Flock Ref", "Integrator", "Species", "Catch Date", "Birds In", "Birds Out", "Mortality", "Avg LW (kg)", "FCR", "Net Payment", "Actions"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }, children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
          filteredBatch.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 11, style: { padding: 32, textAlign: "center", color: "#9ca3af" }, children: batchRecords.length === 0 ? "No batch settlements yet" : `No batch settlements for ${poultryYearFilter}` }) }),
          filteredBatch.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "1px solid #f3f4f6" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px", fontWeight: 500 }, children: r.flockRef }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px" }, children: r.integratorName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px" }, children: r.species }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px" }, children: fmtDate(r.catchDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px" }, children: r.birdsPlaced?.toLocaleString() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px" }, children: r.birdsDelivered?.toLocaleString() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px" }, children: r.mortalityPct ? `${parseFloat(r.mortalityPct).toFixed(2)}%` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px" }, children: r.averageLiveweightKg ? `${parseFloat(r.averageLiveweightKg).toFixed(3)} kg` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px" }, children: r.fcr ? parseFloat(r.fcr).toFixed(3) : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px", fontWeight: 600, color: "#b45309" }, children: pToGBP(r.netPaymentPence) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setViewBatch(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 14 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => {
                setEditingBatch(r);
                setFormBatch({ ...r, placementDate: r.placementDate?.slice(0, 10) ?? "", catchDate: r.catchDate?.slice(0, 10) ?? "", paymentDate: r.paymentDate?.slice(0, 10) ?? "" });
                setOpenBatch(true);
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 14 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", style: { color: "#dc2626" }, onClick: () => setDeleteBatchId(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
            ] }) })
          ] }, r.id))
        ] })
      ] })
    ] }),
    subTab === "eggs" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 12 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
        setEditingEgg(null);
        setFormEgg(emptyEgg);
        setOpenEgg(true);
      }, style: { background: "#ea580c", color: "#fff" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16, style: { marginRight: 6 } }),
        " Add Egg Sale"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { borderBottom: "2px solid #e5e7eb", background: "#f9fafb" }, children: ["Week Ending", "Channel", "Flock", "Type", "Dozens Delivered", "Grade A", "Lay Rate", "Price/Dozen", "Net Value", "Actions"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }, children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
          filteredEgg.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 10, style: { padding: 32, textAlign: "center", color: "#9ca3af" }, children: eggRecords.length === 0 ? "No egg sales yet" : `No egg sales for ${poultryYearFilter}` }) }),
          filteredEgg.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "1px solid #f3f4f6" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px" }, children: fmtDate(r.weekEnding) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px" }, children: r.salesChannel }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px", color: "#6b7280" }, children: r.flockRef ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: "#fff7ed", color: "#c2410c", border: "none", fontSize: "0.7rem" }, children: r.eggType?.replace("_", " ") }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px" }, children: r.dozensDelivered ? `${parseFloat(r.dozensDelivered).toFixed(0)} doz` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px" }, children: r.gradeADozens ? `${parseFloat(r.gradeADozens).toFixed(0)} doz` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px" }, children: r.layRatePct ? `${parseFloat(r.layRatePct).toFixed(1)}%` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px" }, children: r.pricePerDozenPence ? pToGBP(r.pricePerDozenPence) : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px", fontWeight: 600, color: "#c2410c" }, children: pToGBP(r.netValuePence) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setViewEgg(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 14 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => {
                setEditingEgg(r);
                setFormEgg({ ...r, weekEnding: r.weekEnding?.slice(0, 10) ?? "", paymentDate: r.paymentDate?.slice(0, 10) ?? "" });
                setOpenEgg(true);
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 14 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", style: { color: "#dc2626" }, onClick: () => setDeleteEggId(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
            ] }) })
          ] }, r.id))
        ] })
      ] })
    ] }),
    viewBatch && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewBatch(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Batch Settlement" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Flock Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewBatch.flockRef ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Integrator" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewBatch.integratorName ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Species" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewBatch.species ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Placement Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewBatch.placementDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Catch Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewBatch.catchDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Birds Placed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewBatch.birdsPlaced?.toLocaleString() ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Birds Delivered" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewBatch.birdsDelivered?.toLocaleString() ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Mortality %" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewBatch.mortalityPct ? `${parseFloat(viewBatch.mortalityPct).toFixed(2)}%` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Avg Liveweight" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewBatch.averageLiveweightKg ? `${parseFloat(viewBatch.averageLiveweightKg).toFixed(3)} kg` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Total Liveweight" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewBatch.totalLiveweightKg ? `${parseFloat(viewBatch.totalLiveweightKg).toFixed(2)} kg` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "FCR" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewBatch.fcr ? parseFloat(viewBatch.fcr).toFixed(3) : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "EBI" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewBatch.ebi ? parseFloat(viewBatch.ebi).toFixed(2) : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Settlement Rate" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewBatch.settlementRatePence ? `${(viewBatch.settlementRatePence / 100).toFixed(2)}p/kg` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Gross Value" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: pToGBP(viewBatch.grossValuePence) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Performance Bonus" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: pToGBP(viewBatch.bonusPence) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Penalty" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: pToGBP(viewBatch.penaltyPence) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Catching Cost" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: pToGBP(viewBatch.catchingCostPence) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Net Payment" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium font-bold text-blue-600", children: pToGBP(viewBatch.netPaymentPence) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Payment Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewBatch.paymentDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Settlement Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewBatch.settlementRef ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium whitespace-pre-wrap", children: String(viewBatch.notes ?? "—") })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setEditingBatch(viewBatch);
          setFormBatch({ ...viewBatch, placementDate: viewBatch.placementDate?.slice(0, 10) ?? "", catchDate: viewBatch.catchDate?.slice(0, 10) ?? "", paymentDate: viewBatch.paymentDate?.slice(0, 10) ?? "" });
          setOpenBatch(true);
          setViewBatch(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewBatch(null), children: "Close" })
      ] })
    ] }) }),
    viewEgg && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewEgg(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Egg Sale" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Week Ending" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewEgg.weekEnding) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Sales Channel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-capitalize", children: viewEgg.salesChannel?.replace("_", " ") ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Packing Station" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewEgg.packingStation ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Flock Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewEgg.flockRef ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Egg Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-capitalize", children: viewEgg.eggType?.replace("_", " ") ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Dozens Collected" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewEgg.dozensCollected ? `${parseFloat(viewEgg.dozensCollected).toLocaleString()} doz` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Dozens Delivered" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewEgg.dozensDelivered ? `${parseFloat(viewEgg.dozensDelivered).toLocaleString()} doz` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Grade A Dozens" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewEgg.gradeADozens ? `${parseFloat(viewEgg.gradeADozens).toLocaleString()} doz` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Grade B Dozens" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewEgg.gradeBDozens ? `${parseFloat(viewEgg.gradeBDozens).toLocaleString()} doz` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Crack / Waste Dozens" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewEgg.crackWasteDozens ? `${parseFloat(viewEgg.crackWasteDozens).toLocaleString()} doz` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Lay Rate %" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewEgg.layRatePct ? `${parseFloat(viewEgg.layRatePct).toFixed(1)}%` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Price per Dozen" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewEgg.pricePerDozenPence ? pToGBP(viewEgg.pricePerDozenPence) : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Gross Value" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: pToGBP(viewEgg.grossValuePence) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Deductions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: pToGBP(viewEgg.deductionsPence) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Net Value" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium font-bold text-orange-600", children: pToGBP(viewEgg.netValuePence) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Payment Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewEgg.paymentDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium whitespace-pre-wrap", children: String(viewEgg.notes ?? "—") })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setEditingEgg(viewEgg);
          setFormEgg({ ...viewEgg, weekEnding: viewEgg.weekEnding?.slice(0, 10) ?? "", paymentDate: viewEgg.paymentDate?.slice(0, 10) ?? "" });
          setOpenEgg(true);
          setViewEgg(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewEgg(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: openBatch, onOpenChange: (v) => {
      setOpenBatch(v);
      if (!v) {
        setEditingBatch(null);
        setFormBatch(emptyBatch);
        batchMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 720, maxHeight: "90vh", overflowY: "auto" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingBatch ? "Edit Batch Settlement" : "Add Batch Settlement" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submitBatch, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Flock Ref *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: formBatch.flockRef, onChange: (e) => setFormBatch((f) => ({ ...f, flockRef: e.target.value })), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Integrator ",
              formBatch.integratorName ? "" : "*"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              BuyerCombobox,
              {
                farmId,
                types: ["poultry_integrator"],
                valueId: formBatch.integratorId,
                valueName: formBatch.integratorName,
                onChange: (id, name) => setFormBatch((f) => ({ ...f, integratorId: id, integratorName: name })),
                required: true,
                placeholder: "Search or add integrator...",
                typeLabel: "Integrator",
                postAddNavigatePath: "/suppliers-stock?tab=suppliers"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Species" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: formBatch.species, onValueChange: (v) => setFormBatch((f) => ({ ...f, species: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "broiler", children: "Broiler" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "turkey", children: "Turkey" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "duck", children: "Duck" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "layers", children: "Layers" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Settlement Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: formBatch.settlementRef, onChange: (e) => setFormBatch((f) => ({ ...f, settlementRef: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Placement Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: formBatch.placementDate, onChange: (e) => setFormBatch((f) => ({ ...f, placementDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Catch Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: formBatch.catchDate, onChange: (e) => setFormBatch((f) => ({ ...f, catchDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Birds Placed" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", step: "1", value: formBatch.birdsPlaced, onChange: (e) => setFormBatch((f) => ({ ...f, birdsPlaced: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Birds Delivered" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "1", value: formBatch.birdsDelivered, onChange: (e) => setFormBatch((f) => ({ ...f, birdsDelivered: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mortality %" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: formBatch.mortalityPct, onChange: (e) => setFormBatch((f) => ({ ...f, mortalityPct: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Avg Liveweight (kg)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.001", value: formBatch.averageLiveweightKg, onChange: (e) => setFormBatch((f) => ({ ...f, averageLiveweightKg: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Total Liveweight (kg)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: formBatch.totalLiveweightKg, onChange: (e) => setFormBatch((f) => ({ ...f, totalLiveweightKg: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "FCR" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.001", value: formBatch.fcr, onChange: (e) => setFormBatch((f) => ({ ...f, fcr: e.target.value })), placeholder: "Feed Conversion Ratio" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "EBI" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: formBatch.ebi, onChange: (e) => setFormBatch((f) => ({ ...f, ebi: e.target.value })), placeholder: "European Broiler Index" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Settlement Rate (pence/kg LW)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: formBatch.settlementRatePence ? (formBatch.settlementRatePence / 100).toFixed(2) : "", onChange: (e) => setFormBatch((f) => ({ ...f, settlementRatePence: Math.round(parseFloat(e.target.value || "0") * 100) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Gross Value (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: formBatch.grossValuePence ? (formBatch.grossValuePence / 100).toFixed(2) : "", onChange: (e) => setFormBatch((f) => ({ ...f, grossValuePence: Math.round(parseFloat(e.target.value || "0") * 100) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Performance Bonus (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: formBatch.bonusPence ? (formBatch.bonusPence / 100).toFixed(2) : "", onChange: (e) => setFormBatch((f) => ({ ...f, bonusPence: Math.round(parseFloat(e.target.value || "0") * 100) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Penalty (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: formBatch.penaltyPence ? (formBatch.penaltyPence / 100).toFixed(2) : "", onChange: (e) => setFormBatch((f) => ({ ...f, penaltyPence: Math.round(parseFloat(e.target.value || "0") * 100) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Catching Cost (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: formBatch.catchingCostPence ? (formBatch.catchingCostPence / 100).toFixed(2) : "", onChange: (e) => setFormBatch((f) => ({ ...f, catchingCostPence: Math.round(parseFloat(e.target.value || "0") * 100) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Net Payment (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: formBatch.netPaymentPence ? (formBatch.netPaymentPence / 100).toFixed(2) : "", onChange: (e) => setFormBatch((f) => ({ ...f, netPaymentPence: Math.round(parseFloat(e.target.value || "0") * 100) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: formBatch.paymentDate, onChange: (e) => setFormBatch((f) => ({ ...f, paymentDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1/-1" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: formBatch.notes, onChange: (e) => setFormBatch((f) => ({ ...f, notes: e.target.value })), rows: 2 })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: batchMut, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { style: { marginTop: 16 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => {
            setOpenBatch(false);
            setEditingBatch(null);
            setFormBatch(emptyBatch);
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", style: { background: "#b45309", color: "#fff" }, disabled: batchMut.isPending, children: batchMut.isPending ? "Saving…" : editingBatch ? "Update" : "Save" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: openEgg, onOpenChange: (v) => {
      setOpenEgg(v);
      if (!v) {
        setEditingEgg(null);
        setFormEgg(emptyEgg);
        eggMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 700, maxHeight: "90vh", overflowY: "auto" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingEgg ? "Edit Egg Sale" : "Add Egg Sale" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submitEgg, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Week Ending *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: formEgg.weekEnding, onChange: (e) => setFormEgg((f) => ({ ...f, weekEnding: e.target.value })), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sales Channel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: formEgg.salesChannel, onValueChange: (v) => setFormEgg((f) => ({ ...f, salesChannel: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "packing_station", children: "Packing Station" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "direct", children: "Direct" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "farm_gate", children: "Farm Gate" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "processor", children: "Processor" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Packing Station" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              BuyerCombobox,
              {
                farmId,
                types: ["egg_packer"],
                valueId: formEgg.packingStationId,
                valueName: formEgg.packingStation ?? "",
                onChange: (id, name) => setFormEgg((f) => ({ ...f, packingStationId: id, packingStation: name })),
                placeholder: "Search or add packing station...",
                typeLabel: "Packing Station",
                postAddNavigatePath: "/suppliers-stock?tab=suppliers"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Flock Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: formEgg.flockRef, onChange: (e) => setFormEgg((f) => ({ ...f, flockRef: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Egg Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: formEgg.eggType, onValueChange: (v) => setFormEgg((f) => ({ ...f, eggType: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "free_range", children: "Free Range" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "barn", children: "Barn" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "organic", children: "Organic" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "colony", children: "Colony" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "enriched", children: "Enriched Cage" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Dozens Collected" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: formEgg.dozensCollected, onChange: (e) => setFormEgg((f) => ({ ...f, dozensCollected: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Dozens Delivered" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: formEgg.dozensDelivered, onChange: (e) => setFormEgg((f) => ({ ...f, dozensDelivered: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Grade A Dozens" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: formEgg.gradeADozens, onChange: (e) => setFormEgg((f) => ({ ...f, gradeADozens: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Grade B Dozens" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: formEgg.gradeBDozens, onChange: (e) => setFormEgg((f) => ({ ...f, gradeBDozens: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Crack / Waste Dozens" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: formEgg.crackWasteDozens, onChange: (e) => setFormEgg((f) => ({ ...f, crackWasteDozens: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lay Rate %" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: formEgg.layRatePct, onChange: (e) => setFormEgg((f) => ({ ...f, layRatePct: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Price per Dozen (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: formEgg.pricePerDozenPence ? (formEgg.pricePerDozenPence / 100).toFixed(2) : "", onChange: (e) => setFormEgg((f) => ({ ...f, pricePerDozenPence: Math.round(parseFloat(e.target.value || "0") * 100) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Gross Value (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: formEgg.grossValuePence ? (formEgg.grossValuePence / 100).toFixed(2) : "", onChange: (e) => setFormEgg((f) => ({ ...f, grossValuePence: Math.round(parseFloat(e.target.value || "0") * 100) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Deductions (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: formEgg.deductionsPence ? (formEgg.deductionsPence / 100).toFixed(2) : "", onChange: (e) => setFormEgg((f) => ({ ...f, deductionsPence: Math.round(parseFloat(e.target.value || "0") * 100) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Net Value (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: formEgg.netValuePence ? (formEgg.netValuePence / 100).toFixed(2) : "", onChange: (e) => setFormEgg((f) => ({ ...f, netValuePence: Math.round(parseFloat(e.target.value || "0") * 100) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: formEgg.paymentDate, onChange: (e) => setFormEgg((f) => ({ ...f, paymentDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1/-1" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: formEgg.notes, onChange: (e) => setFormEgg((f) => ({ ...f, notes: e.target.value })), rows: 2 })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: eggMut, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { style: { marginTop: 16 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => {
            setOpenEgg(false);
            setEditingEgg(null);
            setFormEgg(emptyEgg);
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", style: { background: "#ea580c", color: "#fff" }, disabled: eggMut.isPending, children: eggMut.isPending ? "Saving…" : editingEgg ? "Update" : "Save" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteBatchId !== null, onOpenChange: (v) => {
      if (!v) {
        setDeleteBatchId(null);
        batchDelMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Batch Settlement?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: batchDelMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteBatchId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { style: { background: "#dc2626", color: "#fff" }, onClick: () => deleteBatchId && batchDelMut.mutate(deleteBatchId), children: "Delete" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteEggId !== null, onOpenChange: (v) => {
      if (!v) {
        setDeleteEggId(null);
        eggDelMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Egg Sale?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: eggDelMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteEggId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { style: { background: "#dc2626", color: "#fff" }, onClick: () => deleteEggId && eggDelMut.mutate(deleteEggId), children: "Delete" })
      ] })
    ] }) })
  ] });
}
function PigSalesTab({ farmId }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [pigYearFilter, setPigYearFilter] = usePersistedFilter({ page: "sales-pig", filter: "year", farmId, defaultValue: "__all__" });
  const empty = {
    killDate: "",
    processorId: null,
    processor: "",
    headCount: "",
    totalDeadweightKg: "",
    averageDeadweightKg: "",
    pricePerKgPence: "",
    grossValuePence: "",
    levyDeductionPence: "",
    transportDeductionPence: "",
    otherDeductionsPence: "",
    netPaymentPence: "",
    paymentDate: "",
    averageP2BackfatMm: "",
    averageMuscleDepthMm: "",
    leanMeatPct: "",
    gradeOut: "",
    sppPriceKgPence: "",
    sppVariancePence: "",
    killSheetRef: "",
    herdMark: "",
    premiumScheme: "",
    premiumPence: "",
    notes: ""
  };
  const [form, setForm] = reactExports.useState(empty);
  const q = useQuery({ queryKey: ["pig-kill-records", farmId], queryFn: () => fetch(`/api/farms/${farmId}/pig-kill-records`).then((r) => r.json()), enabled: !!farmId });
  const records = q.data?.records ?? [];
  const mut = useMutation({
    mutationFn: (body) => editing ? fetch(`/api/farms/${farmId}/pig-kill-records/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()) : fetch(`/api/farms/${farmId}/pig-kill-records`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pig-kill-records", farmId] });
      setOpen(false);
      setEditing(null);
      setForm(empty);
      toast({ title: "Kill record saved" });
    },
    onError: () => toast({ title: "Error saving", variant: "destructive" })
  });
  const delMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/pig-kill-records/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pig-kill-records", farmId] });
      setDeleteId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    mut.mutate({
      ...form,
      headCount: num(form.headCount),
      totalDeadweightKg: num(form.totalDeadweightKg),
      averageDeadweightKg: num(form.averageDeadweightKg),
      pricePerKgPence: num(form.pricePerKgPence),
      grossValuePence: num(form.grossValuePence),
      levyDeductionPence: num(form.levyDeductionPence),
      levelDeductionPence: num(form.levyDeductionPence),
      transportDeductionPence: num(form.transportDeductionPence),
      otherDeductionsPence: num(form.otherDeductionsPence),
      netPaymentPence: num(form.netPaymentPence),
      averageP2BackfatMm: num(form.averageP2BackfatMm),
      averageMuscleDepthMm: num(form.averageMuscleDepthMm),
      leanMeatPct: num(form.leanMeatPct),
      sppPriceKgPence: num(form.sppPriceKgPence),
      sppVariancePence: num(form.sppVariancePence),
      premiumPence: num(form.premiumPence),
      killDate: form.killDate ? new Date(form.killDate).toISOString() : void 0,
      paymentDate: form.paymentDate ? new Date(form.paymentDate).toISOString() : void 0
    });
  };
  const pigYears = [...new Set(records.map((r) => r.killDate ? new Date(r.killDate).getFullYear().toString() : null).filter(Boolean))].sort().reverse();
  const filteredPig = pigYearFilter === "__all__" ? records : records.filter((r) => r.killDate && new Date(r.killDate).getFullYear().toString() === pigYearFilter);
  const totalNet = filteredPig.reduce((s, r) => s + (r.netPaymentPence ?? r.grossValuePence ?? 0), 0);
  const totalHead = filteredPig.reduce((s, r) => s + (r.headCount ?? 0), 0);
  const avgP2 = filteredPig.filter((r) => r.averageP2BackfatMm).length > 0 ? filteredPig.reduce((s, r) => s + parseFloat(r.averageP2BackfatMm ?? "0"), 0) / filteredPig.filter((r) => r.averageP2BackfatMm).length : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 24 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fdf2f8", border: "1px solid #f0abfc", borderRadius: 8, padding: "10px 18px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.72rem", color: "#a21caf", fontWeight: 600 }, children: "Net Revenue" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "1.3rem", fontWeight: 700, color: "#86198f" }, children: pToGBP(totalNet) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 18px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.72rem", color: "#16a34a", fontWeight: 600 }, children: "Total Head" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "1.3rem", fontWeight: 700, color: "#15803d" }, children: totalHead.toLocaleString() })
        ] }),
        avgP2 > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 18px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.72rem", color: "#2563eb", fontWeight: 600 }, children: "Avg P2 Backfat" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "1.3rem", fontWeight: 700, color: "#1d4ed8" }, children: [
            avgP2.toFixed(1),
            " mm"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, alignItems: "center" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: pigYearFilter, onChange: (e) => setPigYearFilter(e.target.value), style: { padding: "6px 12px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: "0.875rem", color: "#374151", background: "#fff", cursor: "pointer" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "__all__", children: "All Years" }),
          pigYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: y, children: y }, y))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setEditing(null);
          setForm(empty);
          setOpen(true);
        }, style: { background: "#86198f", color: "#fff" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16, style: { marginRight: 6 } }),
          " Add Kill Record"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { borderBottom: "2px solid #e5e7eb", background: "#f9fafb" }, children: ["Kill Date", "Processor", "Head", "Total DW (kg)", "Avg DW (kg)", "Price/kg", "P2 (mm)", "Lean%", "Grade", "Net Payment", "vs SPP", "Actions"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }, children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
        filteredPig.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 12, style: { padding: 32, textAlign: "center", color: "#9ca3af" }, children: records.length === 0 ? "No kill records yet" : `No kill records for ${pigYearFilter}` }) }),
        filteredPig.map((r) => {
          const sppVar = r.sppVariancePence;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "1px solid #f3f4f6" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px" }, children: fmtDate(r.killDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px", fontWeight: 500 }, children: r.processor }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px" }, children: r.headCount }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px" }, children: r.totalDeadweightKg ? `${parseFloat(r.totalDeadweightKg).toFixed(1)} kg` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px" }, children: r.averageDeadweightKg ? `${parseFloat(r.averageDeadweightKg).toFixed(1)} kg` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px" }, children: r.pricePerKgPence ? `${r.pricePerKgPence}p/kg` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px" }, children: r.averageP2BackfatMm ? `${parseFloat(r.averageP2BackfatMm).toFixed(1)} mm` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px" }, children: r.leanMeatPct ? `${parseFloat(r.leanMeatPct).toFixed(1)}%` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px" }, children: r.gradeOut ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px", fontWeight: 600, color: "#86198f" }, children: pToGBP(r.netPaymentPence) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px" }, children: sppVar != null ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: sppVar >= 0 ? "#16a34a" : "#dc2626", fontWeight: 600 }, children: [
              sppVar >= 0 ? "+" : "",
              pToGBP(Math.abs(sppVar))
            ] }) : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setViewRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 14 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => {
                setEditing(r);
                setForm({ ...r, killDate: r.killDate?.slice(0, 10) ?? "", paymentDate: r.paymentDate?.slice(0, 10) ?? "" });
                setOpen(true);
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 14 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", style: { color: "#dc2626" }, onClick: () => setDeleteId(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
            ] }) })
          ] }, r.id);
        })
      ] })
    ] }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Kill Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Kill Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.killDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Processor" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.processor ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Head Count" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.headCount ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Herd Mark" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.herdMark ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Total Deadweight" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.totalDeadweightKg ? `${parseFloat(viewRecord.totalDeadweightKg).toFixed(1)} kg` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Avg Deadweight" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.averageDeadweightKg ? `${parseFloat(viewRecord.averageDeadweightKg).toFixed(1)} kg` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Price" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.pricePerKgPence ? `${viewRecord.pricePerKgPence}p/kg` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Avg P2 Backfat" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.averageP2BackfatMm ? `${parseFloat(viewRecord.averageP2BackfatMm).toFixed(1)} mm` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Avg Muscle Depth" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.averageMuscleDepthMm ? `${parseFloat(viewRecord.averageMuscleDepthMm).toFixed(1)} mm` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Lean Meat %" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.leanMeatPct ? `${parseFloat(viewRecord.leanMeatPct).toFixed(1)}%` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Grade Out" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.gradeOut ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Kill Sheet Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.killSheetRef ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Gross Value" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: pToGBP(viewRecord.grossValuePence) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Levy" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: pToGBP(viewRecord.levyDeductionPence) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Transport Deduction" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: pToGBP(viewRecord.transportDeductionPence) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Net Payment" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium font-bold text-purple-600", children: pToGBP(viewRecord.netPaymentPence) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Payment Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.paymentDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "SPP Variance" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.sppVariancePence != null ? (viewRecord.sppVariancePence >= 0 ? "+" : "") + pToGBP(viewRecord.sppVariancePence) : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Premium Scheme" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.premiumScheme ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Premium Value" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: pToGBP(viewRecord.premiumPence) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium whitespace-pre-wrap", children: String(viewRecord.notes ?? "—") })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setEditing(viewRecord);
          setForm({ ...viewRecord, killDate: viewRecord.killDate?.slice(0, 10) ?? "", paymentDate: viewRecord.paymentDate?.slice(0, 10) ?? "" });
          setOpen(true);
          setViewRecord(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
      setOpen(v);
      if (!v) {
        setEditing(null);
        setForm(empty);
        mut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 720, maxHeight: "90vh", overflowY: "auto" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Kill Record" : "Add Kill Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Kill Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.killDate, onChange: (e) => setForm((f) => ({ ...f, killDate: e.target.value })), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Processor ",
              form.processor ? "" : "*"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              BuyerCombobox,
              {
                farmId,
                types: ["pig_processor"],
                valueId: form.processorId,
                valueName: form.processor,
                onChange: (id, name) => setForm((f) => ({ ...f, processorId: id, processor: name })),
                required: true,
                placeholder: "Search or add processor...",
                typeLabel: "Pig Processor",
                postAddNavigatePath: "/suppliers-stock?tab=suppliers"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Head Count *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", step: "1", value: form.headCount, onChange: (e) => setForm((f) => ({ ...f, headCount: e.target.value })), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Herd Mark" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.herdMark, onChange: (e) => setForm((f) => ({ ...f, herdMark: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Total Deadweight (kg)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.totalDeadweightKg, onChange: (e) => setForm((f) => ({ ...f, totalDeadweightKg: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Avg Deadweight (kg)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.averageDeadweightKg, onChange: (e) => setForm((f) => ({ ...f, averageDeadweightKg: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Price (pence/kg)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "1", value: form.pricePerKgPence ? String(form.pricePerKgPence) : "", onChange: (e) => setForm((f) => ({ ...f, pricePerKgPence: Math.round(parseFloat(e.target.value || "0")) })), placeholder: "e.g. 485" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Avg P2 Backfat (mm)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.averageP2BackfatMm, onChange: (e) => setForm((f) => ({ ...f, averageP2BackfatMm: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Avg Muscle Depth (mm)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.averageMuscleDepthMm, onChange: (e) => setForm((f) => ({ ...f, averageMuscleDepthMm: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lean Meat %" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.leanMeatPct, onChange: (e) => setForm((f) => ({ ...f, leanMeatPct: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Grade Out" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.gradeOut, onChange: (e) => setForm((f) => ({ ...f, gradeOut: e.target.value })), placeholder: "e.g. R, O, P" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Kill Sheet Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.killSheetRef, onChange: (e) => setForm((f) => ({ ...f, killSheetRef: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Gross Value (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.grossValuePence ? (form.grossValuePence / 100).toFixed(2) : "", onChange: (e) => setForm((f) => ({ ...f, grossValuePence: Math.round(parseFloat(e.target.value || "0") * 100) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Levy (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.levyDeductionPence ? (form.levyDeductionPence / 100).toFixed(2) : "", onChange: (e) => setForm((f) => ({ ...f, levyDeductionPence: Math.round(parseFloat(e.target.value || "0") * 100) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Transport Deduction (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.transportDeductionPence ? (form.transportDeductionPence / 100).toFixed(2) : "", onChange: (e) => setForm((f) => ({ ...f, transportDeductionPence: Math.round(parseFloat(e.target.value || "0") * 100) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Net Payment (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.netPaymentPence ? (form.netPaymentPence / 100).toFixed(2) : "", onChange: (e) => setForm((f) => ({ ...f, netPaymentPence: Math.round(parseFloat(e.target.value || "0") * 100) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.paymentDate, onChange: (e) => setForm((f) => ({ ...f, paymentDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "SPP Price (pence/kg) ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.75rem", color: "#6b7280" }, children: "for benchmarking" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.sppPriceKgPence ? (form.sppPriceKgPence / 100).toFixed(2) : "", onChange: (e) => setForm((f) => ({ ...f, sppPriceKgPence: Math.round(parseFloat(e.target.value || "0") * 100) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "SPP Variance (£) +/-" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.sppVariancePence ? (form.sppVariancePence / 100).toFixed(2) : "", onChange: (e) => setForm((f) => ({ ...f, sppVariancePence: Math.round(parseFloat(e.target.value || "0") * 100) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Premium Scheme" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.premiumScheme, onChange: (e) => setForm((f) => ({ ...f, premiumScheme: e.target.value })), placeholder: "e.g. Outdoor, Organic" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Premium Value (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.premiumPence ? (form.premiumPence / 100).toFixed(2) : "", onChange: (e) => setForm((f) => ({ ...f, premiumPence: Math.round(parseFloat(e.target.value || "0") * 100) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1/-1" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: mut, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { style: { marginTop: 16 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => {
            setOpen(false);
            setEditing(null);
            setForm(empty);
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", style: { background: "#86198f", color: "#fff" }, disabled: mut.isPending, children: mut.isPending ? "Saving…" : editing ? "Update" : "Save" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (v) => {
      if (!v) {
        setDeleteId(null);
        delMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Kill Record?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: delMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { style: { background: "#dc2626", color: "#fff" }, onClick: () => deleteId && delMut.mutate(deleteId), children: "Delete" })
      ] })
    ] }) })
  ] });
}
const DIRECT_CHANNELS = [
  { value: "farm_shop", label: "Farm Shop" },
  { value: "box_scheme", label: "Box Scheme / Veg Box" },
  { value: "farmers_market", label: "Farmers Market" },
  { value: "wholesale", label: "Wholesale" },
  { value: "online", label: "Online" },
  { value: "restaurant", label: "Restaurant / Hospitality" },
  { value: "school", label: "School / Institution" }
];
const PRODUCT_CATEGORIES = ["Vegetables", "Fruit", "Meat", "Dairy", "Eggs", "Grain", "Honey", "Baked Goods", "Preserves", "Other"];
const UNITS = ["kg", "dozen", "unit", "litre", "bunch", "head", "box", "bag", "jar", "punnet"];
function DirectSalesTab({ farmId }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [channelFilter, setChannelFilter] = usePersistedFilter({ page: "sales-direct", filter: "channel", farmId, defaultValue: "all" });
  const [directYearFilter, setDirectYearFilter] = usePersistedFilter({ page: "sales-direct", filter: "year", farmId, defaultValue: "__all__" });
  const empty = {
    saleDate: "",
    customerId: null,
    channel: "farm_shop",
    productName: "",
    productCategory: "",
    quantity: "",
    unit: "kg",
    unitPricePence: "",
    grossValuePence: "",
    vatPence: "",
    vatRate: "0",
    netValuePence: "",
    paymentMethod: "cash",
    paymentStatus: "paid",
    customerName: "",
    customerRef: "",
    invoiceNumber: "",
    marketName: "",
    notes: ""
  };
  const [form, setForm] = reactExports.useState(empty);
  const q = useQuery({ queryKey: ["direct-sales", farmId], queryFn: () => fetch(`/api/farms/${farmId}/direct-sales`).then((r) => r.json()), enabled: !!farmId });
  const records = q.data?.records ?? [];
  const directYears = [...new Set(records.map((r) => r.saleDate ? new Date(r.saleDate).getFullYear().toString() : null).filter(Boolean))].sort().reverse();
  const filtered = records.filter((r) => channelFilter === "all" || r.channel === channelFilter).filter((r) => directYearFilter === "__all__" || r.saleDate && new Date(r.saleDate).getFullYear().toString() === directYearFilter);
  const mut = useMutation({
    mutationFn: (body) => editing ? fetch(`/api/farms/${farmId}/direct-sales/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()) : fetch(`/api/farms/${farmId}/direct-sales`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["direct-sales", farmId] });
      setOpen(false);
      setEditing(null);
      setForm(empty);
      toast({ title: "Sale recorded" });
    },
    onError: () => toast({ title: "Error saving", variant: "destructive" })
  });
  const delMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/direct-sales/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["direct-sales", farmId] });
      setDeleteId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    mut.mutate({
      ...form,
      quantity: num(form.quantity),
      unitPricePence: num(form.unitPricePence),
      grossValuePence: num(form.grossValuePence),
      vatPence: num(form.vatPence),
      netValuePence: num(form.netValuePence),
      saleDate: form.saleDate ? new Date(form.saleDate).toISOString() : void 0
    });
  };
  const totalGross = filtered.reduce((s, r) => s + (r.grossValuePence ?? 0), 0);
  const totalNet = filtered.reduce((s, r) => s + (r.netValuePence ?? r.grossValuePence ?? 0), 0);
  DIRECT_CHANNELS.map((c) => ({
    channel: c.label,
    value: filtered.filter((r) => r.channel === c.value).reduce((s, r) => s + (r.grossValuePence ?? 0), 0) / 100
  })).filter((c) => c.value > 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 24 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 18px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.72rem", color: "#16a34a", fontWeight: 600 }, children: "Total Gross" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "1.3rem", fontWeight: 700, color: "#15803d" }, children: pToGBP(totalGross) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 18px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.72rem", color: "#2563eb", fontWeight: 600 }, children: "Net (ex-VAT)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "1.3rem", fontWeight: 700, color: "#1d4ed8" }, children: pToGBP(totalNet) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 8, padding: "10px 18px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.72rem", color: "#7c3aed", fontWeight: 600 }, children: "Transactions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "1.3rem", fontWeight: 700, color: "#6d28d9" }, children: filtered.length })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, alignItems: "center" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: directYearFilter, onChange: (e) => setDirectYearFilter(e.target.value), style: { padding: "6px 12px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: "0.875rem", color: "#374151", background: "#fff", cursor: "pointer" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "__all__", children: "All Years" }),
          directYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: y, children: y }, y))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setEditing(null);
          setForm(empty);
          setOpen(true);
        }, style: { background: "#0891b2", color: "#fff" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16, style: { marginRight: 6 } }),
          " Record Sale"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setChannelFilter("all"), style: { padding: "4px 12px", borderRadius: 20, border: "1px solid", borderColor: channelFilter === "all" ? "#0891b2" : "#d1d5db", background: channelFilter === "all" ? "#0891b2" : "#fff", color: channelFilter === "all" ? "#fff" : "#374151", fontSize: "0.8rem", cursor: "pointer" }, children: "All" }),
      DIRECT_CHANNELS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setChannelFilter(c.value), style: { padding: "4px 12px", borderRadius: 20, border: "1px solid", borderColor: channelFilter === c.value ? "#0891b2" : "#d1d5db", background: channelFilter === c.value ? "#0891b2" : "#fff", color: channelFilter === c.value ? "#fff" : "#374151", fontSize: "0.8rem", cursor: "pointer" }, children: c.label }, c.value))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { borderBottom: "2px solid #e5e7eb", background: "#f9fafb" }, children: ["Date", "Channel", "Product", "Category", "Qty", "Unit Price", "Gross Value", "Status", "Customer", "Actions"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }, children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
        filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 10, style: { padding: 32, textAlign: "center", color: "#9ca3af" }, children: "No direct sales yet" }) }),
        filtered.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "1px solid #f3f4f6" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px" }, children: fmtDate(r.saleDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: "#e0f2fe", color: "#0369a1", border: "none", fontSize: "0.7rem" }, children: DIRECT_CHANNELS.find((c) => c.value === r.channel)?.label ?? r.channel }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px", fontWeight: 500 }, children: r.productName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px", color: "#6b7280" }, children: r.productCategory ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px" }, children: r.quantity ? `${parseFloat(r.quantity).toFixed(2)} ${r.unit}` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px" }, children: r.unitPricePence ? pToGBP(r.unitPricePence) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px", fontWeight: 600, color: "#0891b2" }, children: pToGBP(r.grossValuePence) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: r.paymentStatus === "paid" ? "#dcfce7" : r.paymentStatus === "pending" ? "#fef3c7" : "#fee2e2", color: "#374151", border: "none", fontSize: "0.7rem" }, children: r.paymentStatus }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px", color: "#6b7280" }, children: r.customerName ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 10px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setViewRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 14 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => {
              setEditing(r);
              setForm({ ...r, saleDate: r.saleDate?.slice(0, 10) ?? "" });
              setOpen(true);
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 14 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", style: { color: "#dc2626" }, onClick: () => setDeleteId(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
          ] }) })
        ] }, r.id))
      ] })
    ] }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Direct Sale" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.saleDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Channel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: DIRECT_CHANNELS.find((c) => c.value === viewRecord.channel)?.label ?? viewRecord.channel })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Product" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.productName ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.productCategory ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Quantity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.quantity ? `${parseFloat(viewRecord.quantity).toFixed(2)} ${viewRecord.unit}` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Unit Price" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: pToGBP(viewRecord.unitPricePence) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Gross Value" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: pToGBP(viewRecord.grossValuePence) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "VAT Rate" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            viewRecord.vatRate,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "VAT Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: pToGBP(viewRecord.vatPence) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Net Value" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium font-bold text-cyan-600", children: pToGBP(viewRecord.netValuePence) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Payment Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-capitalize", children: viewRecord.paymentStatus })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Payment Method" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-capitalize", children: viewRecord.paymentMethod })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Customer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.customerName ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Invoice Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.invoiceNumber ?? "—") })
        ] }),
        viewRecord.marketName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Market Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.marketName })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium whitespace-pre-wrap", children: String(viewRecord.notes ?? "—") })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setEditing(viewRecord);
          setForm({ ...viewRecord, saleDate: viewRecord.saleDate?.slice(0, 10) ?? "" });
          setOpen(true);
          setViewRecord(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
      setOpen(v);
      if (!v) {
        setEditing(null);
        setForm(empty);
        mut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 700, maxHeight: "90vh", overflowY: "auto" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Sale" : "Record Direct Sale" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sale Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.saleDate, onChange: (e) => setForm((f) => ({ ...f, saleDate: e.target.value })), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sales Channel *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.channel, onValueChange: (v) => setForm((f) => ({ ...f, channel: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: DIRECT_CHANNELS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.value, children: c.label }, c.value)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.productName, onChange: (e) => setForm((f) => ({ ...f, productName: e.target.value })), required: true, placeholder: "e.g. Organic Carrots, Free Range Eggs" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Category" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: PRODUCT_CATEGORIES.filter((c) => c !== "Other").includes(form.productCategory || "") ? form.productCategory : form.productCategory ? "Other" : "__none__", onValueChange: (v) => setForm((f) => ({ ...f, productCategory: v === "__none__" ? "" : v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select category" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "None" }),
                PRODUCT_CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c))
              ] })
            ] }),
            (form.productCategory === "Other" || form.productCategory && !PRODUCT_CATEGORIES.filter((c) => c !== "Other").includes(form.productCategory)) && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1.5", value: form.productCategory === "Other" ? "" : form.productCategory, onChange: (e) => setForm((f) => ({ ...f, productCategory: e.target.value || "Other" })), placeholder: "Please specify category…" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.001", value: form.quantity, onChange: (e) => setForm((f) => ({ ...f, quantity: e.target.value })), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Unit *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.unit, onValueChange: (v) => setForm((f) => ({ ...f, unit: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: UNITS.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: u, children: u }, u)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Unit Price (£) *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.unitPricePence ? (form.unitPricePence / 100).toFixed(2) : "", onChange: (e) => setForm((f) => ({ ...f, unitPricePence: Math.round(parseFloat(e.target.value || "0") * 100) })), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Gross Value (£) *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.grossValuePence ? (form.grossValuePence / 100).toFixed(2) : "", onChange: (e) => setForm((f) => ({ ...f, grossValuePence: Math.round(parseFloat(e.target.value || "0") * 100) })), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "VAT Rate" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.vatRate, onValueChange: (v) => setForm((f) => ({ ...f, vatRate: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "0", children: "Zero-rated (0%)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "5", children: "Reduced (5%)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "20", children: "Standard (20%)" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "VAT Amount (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.vatPence ? (form.vatPence / 100).toFixed(2) : "", onChange: (e) => setForm((f) => ({ ...f, vatPence: Math.round(parseFloat(e.target.value || "0") * 100) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Net Value (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.netValuePence ? (form.netValuePence / 100).toFixed(2) : "", onChange: (e) => setForm((f) => ({ ...f, netValuePence: Math.round(parseFloat(e.target.value || "0") * 100) })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment Method" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.paymentMethod, onValueChange: (v) => setForm((f) => ({ ...f, paymentMethod: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cash", children: "Cash" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "card", children: "Card" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "bank_transfer", children: "Bank Transfer" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "invoice", children: "Invoice" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.paymentStatus, onValueChange: (v) => setForm((f) => ({ ...f, paymentStatus: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "paid", children: "Paid" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pending", children: "Pending" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "overdue", children: "Overdue" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Customer Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              BuyerCombobox,
              {
                farmId,
                types: ["direct_customer"],
                valueId: form.customerId,
                valueName: form.customerName ?? "",
                onChange: (id, name) => setForm((f) => ({ ...f, customerId: id, customerName: name })),
                placeholder: "Search or add customer...",
                typeLabel: "Customer",
                postAddNavigatePath: "/suppliers-stock?tab=suppliers"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Invoice Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.invoiceNumber, onChange: (e) => setForm((f) => ({ ...f, invoiceNumber: e.target.value })) })
          ] }),
          form.channel === "farmers_market" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Market Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.marketName, onChange: (e) => setForm((f) => ({ ...f, marketName: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1/-1" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: mut, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { style: { marginTop: 16 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => {
            setOpen(false);
            setEditing(null);
            setForm(empty);
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", style: { background: "#0891b2", color: "#fff" }, disabled: mut.isPending, children: mut.isPending ? "Saving…" : editing ? "Update" : "Save" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (v) => {
      if (!v) {
        setDeleteId(null);
        delMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Sale Record?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: delMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { style: { background: "#dc2626", color: "#fff" }, onClick: () => deleteId && delMut.mutate(deleteId), children: "Delete" })
      ] })
    ] }) })
  ] });
}
function ReportsTab({ farmId }) {
  const [reportYearFilter, setReportYearFilter] = usePersistedFilter({ page: "sales-reports", filter: "year", farmId, defaultValue: "__all__" });
  const farmQ = useQuery({ queryKey: ["farm-detail", farmId], queryFn: () => fetch(`/api/farms/${farmId}`).then((r) => r.json()), enabled: !!farmId, select: (d) => d.record });
  const farm = farmQ.data;
  const grainQ = useQuery({ queryKey: ["grain-sales", farmId], queryFn: () => fetch(`/api/farms/${farmId}/grain-sales`).then((r) => r.json()), enabled: !!farmId });
  const dwQ = useQuery({ queryKey: ["dw-sales", farmId], queryFn: () => fetch(`/api/farms/${farmId}/livestock-deadweight-sales`).then((r) => r.json()), enabled: !!farmId });
  const martQ = useQuery({ queryKey: ["mart-sales", farmId], queryFn: () => fetch(`/api/farms/${farmId}/livestock-mart-sales`).then((r) => r.json()), enabled: !!farmId });
  const milkQ = useQuery({ queryKey: ["milk-statements", farmId], queryFn: () => fetch(`/api/farms/${farmId}/milk-statements`).then((r) => r.json()), enabled: !!farmId });
  const batchQ = useQuery({ queryKey: ["poultry-batch-settlements", farmId], queryFn: () => fetch(`/api/farms/${farmId}/poultry-batch-settlements`).then((r) => r.json()), enabled: !!farmId });
  const eggQ = useQuery({ queryKey: ["egg-sales", farmId], queryFn: () => fetch(`/api/farms/${farmId}/egg-sales`).then((r) => r.json()), enabled: !!farmId });
  const pigQ = useQuery({ queryKey: ["pig-kill-records", farmId], queryFn: () => fetch(`/api/farms/${farmId}/pig-kill-records`).then((r) => r.json()), enabled: !!farmId });
  const directQ = useQuery({ queryKey: ["direct-sales", farmId], queryFn: () => fetch(`/api/farms/${farmId}/direct-sales`).then((r) => r.json()), enabled: !!farmId });
  const allYears = reactExports.useMemo(() => {
    const yrOf = (d) => d ? new Date(d).getFullYear().toString() : null;
    return [...new Set([
      ...(grainQ.data?.records ?? []).map((r) => yrOf(r.saleDate)),
      ...(dwQ.data?.records ?? []).map((r) => yrOf(r.killDate)),
      ...(martQ.data?.records ?? []).map((r) => yrOf(r.saleDate)),
      ...(milkQ.data?.records ?? []).map((r) => yrOf(r.statementMonth)),
      ...(batchQ.data?.records ?? []).map((r) => yrOf(r.catchDate)),
      ...(eggQ.data?.records ?? []).map((r) => yrOf(r.weekEnding)),
      ...(pigQ.data?.records ?? []).map((r) => yrOf(r.killDate)),
      ...(directQ.data?.records ?? []).map((r) => yrOf(r.saleDate))
    ].filter(Boolean))].sort().reverse();
  }, [grainQ.data, dwQ.data, martQ.data, milkQ.data, batchQ.data, eggQ.data, pigQ.data, directQ.data]);
  const totals = reactExports.useMemo(() => {
    const yr = reportYearFilter;
    const yrOf = (d) => d ? new Date(d).getFullYear().toString() : null;
    const byYr = (date) => yr === "__all__" || yrOf(date) === yr;
    const grain = (grainQ.data?.records ?? []).filter((r) => byYr(r.saleDate)).reduce((s, r) => s + (r.netValuePence ?? r.grossValuePence ?? 0), 0) / 100;
    const dw = (dwQ.data?.records ?? []).filter((r) => byYr(r.killDate)).reduce((s, r) => s + (r.netPaymentPence ?? r.grossValuePence ?? 0), 0) / 100;
    const mart = (martQ.data?.records ?? []).filter((r) => byYr(r.saleDate)).reduce((s, r) => s + (r.netPaymentPence ?? r.grossValuePence ?? 0), 0) / 100;
    const milk = (milkQ.data?.records ?? []).filter((r) => byYr(r.statementMonth)).reduce((s, r) => s + (r.netPaymentPence ?? r.grossValuePence ?? 0), 0) / 100;
    const batch = (batchQ.data?.records ?? []).filter((r) => byYr(r.catchDate)).reduce((s, r) => s + (r.netPaymentPence ?? r.grossValuePence ?? 0), 0) / 100;
    const eggs = (eggQ.data?.records ?? []).filter((r) => byYr(r.weekEnding)).reduce((s, r) => s + (r.netValuePence ?? r.grossValuePence ?? 0), 0) / 100;
    const pigs = (pigQ.data?.records ?? []).filter((r) => byYr(r.killDate)).reduce((s, r) => s + (r.netPaymentPence ?? r.grossValuePence ?? 0), 0) / 100;
    const direct = (directQ.data?.records ?? []).filter((r) => byYr(r.saleDate)).reduce((s, r) => s + (r.grossValuePence ?? 0), 0) / 100;
    return { grain, dw, mart, milk, batch, eggs, pigs, direct };
  }, [reportYearFilter, grainQ.data, dwQ.data, martQ.data, milkQ.data, batchQ.data, eggQ.data, pigQ.data, directQ.data]);
  const sectorData = [
    { name: "Grain", value: totals.grain },
    { name: "Livestock DW", value: totals.dw },
    { name: "Mart", value: totals.mart },
    { name: "Milk", value: totals.milk },
    { name: "Poultry Batch", value: totals.batch },
    { name: "Eggs", value: totals.eggs },
    { name: "Pig Sales", value: totals.pigs },
    { name: "Direct Sales", value: totals.direct }
  ].filter((s) => s.value > 0);
  const totalAll = Object.values(totals).reduce((a, b) => a + b, 0);
  const kpis = [
    { label: "Grain Sales", value: totals.grain, color: "#16a34a" },
    { label: "Livestock Deadweight", value: totals.dw, color: "#15803d" },
    { label: "Mart Sales", value: totals.mart, color: "#1d4ed8" },
    { label: "Milk Revenue", value: totals.milk, color: "#7c3aed" },
    { label: "Poultry Settlement", value: totals.batch, color: "#b45309" },
    { label: "Egg Sales", value: totals.eggs, color: "#c2410c" },
    { label: "Pig Sales", value: totals.pigs, color: "#86198f" },
    { label: "Direct Sales", value: totals.direct, color: "#0891b2" }
  ];
  const periodLabel = reportYearFilter === "__all__" ? "All Time" : reportYearFilter;
  const handlePrint = () => {
    const farmName = farm?.name ?? "Farm";
    const cph = farm?.cphNumber ? `CPH: ${farm.cphNumber}` : "";
    const rtId = farm?.redTractorId ? `Red Tractor ID: ${farm.redTractorId}` : "";
    const address = [farm?.addressLine1, farm?.addressTown, farm?.addressCounty, farm?.addressPostcode].filter(Boolean).join(", ");
    const generatedAt = (/* @__PURE__ */ new Date()).toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" });
    const rows = kpis.map((k) => `
      <tr>
        <td>${k.label}</td>
        <td style="text-align:right; font-weight:600; color:${k.value > 0 ? "#166534" : "#6b7280"}">
          ${k.value > 0 ? `£${k.value.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "No data"}
        </td>
        <td style="text-align:right; color:#6b7280">
          ${totalAll > 0 && k.value > 0 ? `${(k.value / totalAll * 100).toFixed(1)}%` : "—"}
        </td>
      </tr>`).join("");
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Sales &amp; Trading Report — ${farmName}</title>
  <style>
    @page { size: A4 landscape; margin: 18mm 18mm 16mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 10pt; color: #111; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 10px; border-bottom: 2px solid #16a34a; margin-bottom: 14px; }
    .header-left h1 { font-size: 18pt; font-weight: 800; color: #15803d; }
    .header-left h2 { font-size: 12pt; font-weight: 600; color: #374151; margin-top: 2px; }
    .header-left p { font-size: 9pt; color: #6b7280; margin-top: 2px; }
    .header-right { text-align: right; font-size: 9pt; color: #6b7280; }
    .header-right strong { display: block; font-size: 11pt; color: #111; font-weight: 700; }
    .total-box { background: #f0fdf4; border: 2px solid #16a34a; border-radius: 6px; padding: 14px 20px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; }
    .total-box .amount { font-size: 22pt; font-weight: 800; color: #15803d; }
    .total-box .label { font-size: 10pt; color: #166534; font-weight: 600; }
    .total-box .sub { font-size: 9pt; color: #6b7280; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
    th { background: #f9fafb; text-align: left; padding: 7px 10px; font-size: 9pt; font-weight: 700; color: #374151; border-bottom: 2px solid #e5e7eb; }
    th:not(:first-child) { text-align: right; }
    td { padding: 7px 10px; border-bottom: 1px solid #f3f4f6; font-size: 10pt; vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    .total-row td { border-top: 2px solid #16a34a; font-weight: 700; background: #f9fafb; }
    .footer { margin-top: 24px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 8pt; color: #9ca3af; display: flex; justify-content: space-between; }
    .badge { display: inline-block; background: #dcfce7; color: #166534; border-radius: 4px; padding: 2px 8px; font-size: 8pt; font-weight: 600; }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      <h1>BDE Farm Trac</h1>
      <h2>${farmName}</h2>
      <p>${[address, cph, rtId].filter(Boolean).join(" &nbsp;·&nbsp; ")}</p>
    </div>
    <div class="header-right">
      <strong>Sales &amp; Trading Report</strong>
      Period: ${periodLabel}<br>
      Produced: ${generatedAt}<br>
      <span class="badge">Barnett Davies Enterprises Ltd</span>
    </div>
  </div>

  <div class="total-box">
    <div>
      <div class="label">Total Farm Sales Revenue</div>
      <div class="sub">All sectors combined &nbsp;·&nbsp; Period: ${periodLabel}</div>
    </div>
    <div class="amount">£${totalAll.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Sales Sector</th>
        <th style="text-align:right">Revenue</th>
        <th style="text-align:right">% of Total</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
      <tr class="total-row">
        <td>Total</td>
        <td style="text-align:right">£${totalAll.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td style="text-align:right">100.0%</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <span>BDE Farm Trac — Barnett Davies Enterprises Ltd &nbsp;·&nbsp; Confidential — not for circulation</span>
    <span>Generated: ${generatedAt}</span>
  </div>
</body>
</html>`;
    const win = window.open("", "_blank", "width=900,height=650");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.addEventListener("afterprint", () => win.close());
      win.print();
    }, 400);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10, marginBottom: 16 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: reportYearFilter, onChange: (e) => setReportYearFilter(e.target.value), style: { padding: "6px 12px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: "0.875rem", color: "#374151", background: "#fff", cursor: "pointer" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "__all__", children: "All Years" }),
        allYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: y, children: y }, y))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: handlePrint, style: { display: "flex", alignItems: "center", gap: 6 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14 }),
        " Print Report"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "linear-gradient(135deg, #16a34a, #15803d)", borderRadius: 12, padding: "20px 28px", color: "#fff", marginBottom: 24 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.875rem", opacity: 0.8, marginBottom: 4 }, children: reportYearFilter === "__all__" ? "Total Farm Sales Revenue — All Time" : `Total Farm Sales Revenue — ${reportYearFilter}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "2.5rem", fontWeight: 800 }, children: [
        "£",
        totalAll.toLocaleString("en-GB", { minimumFractionDigits: 2 })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.8rem", opacity: 0.7, marginTop: 4 }, children: "All sectors combined" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 32 }, children: kpis.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "14px 16px", borderLeft: `4px solid ${k.color}` }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.72rem", color: "#6b7280", fontWeight: 600, marginBottom: 4 }, children: k.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "1.2rem", fontWeight: 700, color: k.color }, children: k.value > 0 ? `£${k.value.toLocaleString("en-GB", { minimumFractionDigits: 2 })}` : "No data" })
    ] }, k.label)) }),
    sectorData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontWeight: 700, marginBottom: 16, color: "#374151" }, children: "Revenue by Sector" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 280, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: sectorData, margin: { left: 10 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f3f4f6" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "name", tick: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tickFormatter: (v) => `£${(v / 1e3).toFixed(0)}k`, tick: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`£${v.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`, "Revenue"] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "value", fill: "#16a34a", radius: [4, 4, 0, 0] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontWeight: 700, marginBottom: 16, color: "#374151" }, children: "Revenue Mix" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 280, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: sectorData, dataKey: "value", nameKey: "name", cx: "50%", cy: "50%", outerRadius: 100, label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`, labelLine: false, children: sectorData.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: CHART_COLORS[i % CHART_COLORS.length] }, i)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`£${v.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`, ""] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {})
        ] }) })
      ] })
    ] }),
    sectorData.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "60px 0", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { size: 48, style: { margin: "0 auto 16px" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 500 }, children: "No sales data yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: "Start recording sales in each sector to see reports here" })
    ] })
  ] });
}
const CONTRACT_STATUS_STYLE = {
  active: { bg: "#dcfce7", color: "#15803d", label: "Active" },
  fulfilled: { bg: "#dbeafe", color: "#1d4ed8", label: "Fulfilled" },
  pending: { bg: "#fef9c3", color: "#92400e", label: "Pending" },
  cancelled: { bg: "#fee2e2", color: "#b91c1c", label: "Cancelled" },
  disputed: { bg: "#fef3c7", color: "#b45309", label: "Disputed" },
  open: { bg: "#f3f4f6", color: "#374151", label: "Open" }
};
function ContractProgressBar({ calledOff, total, type }) {
  const pct = total > 0 ? Math.min(100, calledOff / total * 100) : 0;
  const isPool = type === "pool";
  const barColor = isPool ? "#7c3aed" : pct >= 100 ? "#16a34a" : "#2563eb";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#e5e7eb", borderRadius: 4, height: 6, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: `${pct}%`, background: barColor, height: "100%", borderRadius: 4, transition: "width 0.3s ease" } }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", marginTop: 3, fontSize: "0.7rem", color: "#6b7280" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        calledOff.toFixed(2),
        "t ",
        isPool ? "allocated" : "called off"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        Math.max(0, total - calledOff).toFixed(2),
        "t remaining of ",
        total.toFixed(2),
        "t"
      ] })
    ] })
  ] });
}
function GrainContractsTab({ farmId }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [cropYearFilter, setCropYearFilter] = usePersistedFilter({ page: "sales-grain-contracts", filter: "crop-year", farmId, defaultValue: "__all__" });
  const [expandedId, setExpandedId] = reactExports.useState(null);
  const [addType, setAddType] = reactExports.useState(null);
  const [editing, setEditing] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const emptyForward = {
    contractType: "forward",
    cropYear: "",
    buyerId: null,
    buyer: "",
    commodity: "",
    variety: "",
    qualitySpec: "",
    quantityTonnes: "",
    contractedPricePence: "",
    contractDate: "",
    deliveryWindowStart: "",
    deliveryWindowEnd: "",
    deliveryLocation: "",
    callOffWindowNotes: "",
    contractReference: "",
    status: "active",
    notes: ""
  };
  const emptyPool = {
    contractType: "pool",
    cropYear: "",
    buyerId: null,
    buyer: "",
    commodity: "",
    variety: "",
    qualitySpec: "",
    quantityTonnes: "",
    advancePaymentPence: "",
    poolLevyPence: "",
    poolClosingDate: "",
    poolSettlementDate: "",
    deliveryLocation: "",
    contractReference: "",
    status: "active",
    notes: ""
  };
  const [form, setForm] = reactExports.useState(emptyForward);
  const q = useQuery({
    queryKey: ["crop-contracts", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/crop-contracts`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const contracts = q.data ?? [];
  const txQ = useQuery({
    queryKey: ["contract-transactions", farmId, expandedId],
    queryFn: () => fetch(`/api/farms/${farmId}/crop-contracts/${expandedId}/transactions`).then((r) => r.json()),
    enabled: !!expandedId,
    select: (d) => d.records ?? []
  });
  const transactions = txQ.data ?? [];
  const availableCropYears = [...new Set(contracts.map((c) => c.cropYear).filter(Boolean))].sort().reverse();
  const filtered = contracts.filter((c) => cropYearFilter === "__all__" || c.cropYear === cropYearFilter);
  const forwardContracts = filtered.filter((c) => c.contractType === "forward" || !c.contractType);
  const poolContracts = filtered.filter((c) => c.contractType === "pool");
  const saveMut = useMutation({
    mutationFn: (body) => editing ? fetch(`/api/farms/${farmId}/crop-contracts/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()) : fetch(`/api/farms/${farmId}/crop-contracts`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crop-contracts", farmId] });
      setAddType(null);
      setEditing(null);
      setForm(emptyForward);
      toast({ title: editing ? "Contract updated" : "Contract created" });
    },
    onError: () => toast({ title: "Error saving contract", variant: "destructive" })
  });
  const delMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/crop-contracts/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crop-contracts", farmId] });
      setDeleteId(null);
      toast({ title: "Contract deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const isPool = form.contractType === "pool";
  const isOpen = addType !== null;
  const handleSubmit = (e) => {
    e.preventDefault();
    const body = {
      ...form,
      quantityTonnes: num(form.quantityTonnes),
      contractDate: form.contractDate ? new Date(form.contractDate).toISOString() : void 0
    };
    if (isPool) {
      body.advancePaymentPence = num(form.advancePaymentPence);
      body.poolLevyPence = num(form.poolLevyPence);
      body.poolClosingDate = form.poolClosingDate ? new Date(form.poolClosingDate).toISOString() : void 0;
      body.poolSettlementDate = form.poolSettlementDate ? new Date(form.poolSettlementDate).toISOString() : void 0;
    } else {
      body.contractedPricePence = num(form.contractedPricePence);
      body.deliveryWindowStart = form.deliveryWindowStart ? new Date(form.deliveryWindowStart).toISOString() : void 0;
      body.deliveryWindowEnd = form.deliveryWindowEnd ? new Date(form.deliveryWindowEnd).toISOString() : void 0;
    }
    saveMut.mutate(body);
  };
  const openEdit = (c) => {
    setEditing(c);
    setForm({
      ...c,
      contractDate: c.contractDate ? c.contractDate.slice(0, 10) : "",
      deliveryWindowStart: c.deliveryWindowStart ? c.deliveryWindowStart.slice(0, 10) : "",
      deliveryWindowEnd: c.deliveryWindowEnd ? c.deliveryWindowEnd.slice(0, 10) : "",
      poolClosingDate: c.poolClosingDate ? c.poolClosingDate.slice(0, 10) : "",
      poolSettlementDate: c.poolSettlementDate ? c.poolSettlementDate.slice(0, 10) : "",
      contractedPricePence: c.contractedPricePence ?? "",
      advancePaymentPence: c.advancePaymentPence ?? "",
      poolLevyPence: c.poolLevyPence ?? "",
      quantityTonnes: c.quantityTonnes ?? ""
    });
    setAddType(c.contractType);
  };
  const totalCommitted = filtered.reduce((s, c) => s + parseFloat(c.quantityTonnes ?? "0"), 0);
  const totalCalledOff = filtered.reduce((s, c) => s + (c.calledOffTonnes ?? 0), 0);
  const totalForwardValue = filtered.filter((c) => c.contractType !== "pool" && c.contractedPricePence).reduce((s, c) => s + parseFloat(c.quantityTonnes ?? "0") * (c.contractedPricePence / 100), 0);
  const renderContractCard = (c) => {
    const qty = parseFloat(c.quantityTonnes ?? "0");
    const calledOff = parseFloat(String(c.calledOffTonnes ?? 0));
    const isExpanded = expandedId === c.id;
    const sty = CONTRACT_STATUS_STYLE[c.status] ?? CONTRACT_STATUS_STYLE.open;
    const cardIsPool = c.contractType === "pool";
    const borderColor = cardIsPool ? "#e9d5ff" : "#e5e7eb";
    const bgColor = cardIsPool ? "#faf5ff" : "#fff";
    const txnLabel = cardIsPool ? "Pool Allocations" : "Call-Off Movements";
    const txnColColor = cardIsPool ? "#7c3aed" : "#6b7280";
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { border: `1px solid ${borderColor}`, borderRadius: 10, overflow: "hidden", background: bgColor, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          onClick: () => setExpandedId(isExpanded ? null : c.id),
          style: { padding: "14px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 700, fontSize: "0.95rem", color: "#111827" }, children: c.buyer }),
                c.cropYear && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.72rem", background: cardIsPool ? "#f3e8ff" : "#dbeafe", color: cardIsPool ? "#7c3aed" : "#1d4ed8", borderRadius: 4, padding: "2px 6px", fontWeight: 600 }, children: c.cropYear }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.72rem", background: sty.bg, color: sty.color, borderRadius: 4, padding: "2px 6px", fontWeight: 600 }, children: sty.label })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.85rem", color: "#374151" }, children: [
                c.commodity,
                c.variety ? ` — ${c.variety}` : ""
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.78rem", color: "#6b7280", marginTop: 2 }, children: [
                cardIsPool ? `${c.advancePaymentPence ? `£${(c.advancePaymentPence / 100).toFixed(2)}/t advance` : "Pool — no advance set"}${c.poolLevyPence ? ` · £${(c.poolLevyPence / 100).toFixed(2)}/t levy` : ""}` : `${c.contractedPricePence ? `£${(c.contractedPricePence / 100).toFixed(2)}/t` : "Price TBC"}`,
                c.contractReference ? ` · ${c.contractReference}` : ""
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginTop: 10 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ContractProgressBar, { calledOff, total: qty, type: c.contractType }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginLeft: 12, flexShrink: 0 }, children: isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 16, color: "#6b7280" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 16, color: "#6b7280" }) })
          ]
        }
      ),
      isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "0 16px 16px", borderTop: `1px solid ${borderColor}` }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12, marginTop: 12 }, children: [
          cardIsPool ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            c.poolClosingDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }, children: "Pool Closes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.82rem", color: "#374151" }, children: fmtDate(c.poolClosingDate) })
            ] }),
            c.poolSettlementDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }, children: "Settlement Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.82rem", color: "#374151" }, children: fmtDate(c.poolSettlementDate) })
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            c.deliveryWindowStart && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }, children: "Delivery Window" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.82rem", color: "#374151" }, children: [
                fmtDate(c.deliveryWindowStart),
                " – ",
                fmtDate(c.deliveryWindowEnd)
              ] })
            ] }),
            c.callOffWindowNotes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }, children: "Call-Off Notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.82rem", color: "#374151" }, children: c.callOffWindowNotes })
            ] })
          ] }),
          c.deliveryLocation && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }, children: "Delivery Location" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.82rem", color: "#374151" }, children: c.deliveryLocation })
          ] }),
          c.qualitySpec && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }, children: "Quality Spec" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.82rem", color: "#374151" }, children: c.qualitySpec })
          ] }),
          c.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }, children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.82rem", color: "#6b7280" }, children: c.notes })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: 6 }, children: txnLabel }),
        txQ.isPending && expandedId === c.id ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { color: "#9ca3af", fontSize: "0.8rem" }, children: "Loading..." }) : transactions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { color: "#9ca3af", fontSize: "0.8rem" }, children: [
          "No ",
          cardIsPool ? "allocations" : "movements",
          " recorded against this ",
          cardIsPool ? "pool position" : "contract",
          "."
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: `1px solid ${borderColor}` }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "3px 6px", color: txnColColor, fontWeight: 600 }, children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "3px 6px", color: txnColColor, fontWeight: 600 }, children: "Buyer" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "right", padding: "3px 6px", color: txnColColor, fontWeight: 600 }, children: "Tonnes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "right", padding: "3px 6px", color: txnColColor, fontWeight: 600 }, children: "£/t" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "right", padding: "3px 6px", color: txnColColor, fontWeight: 600 }, children: "Value" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "3px 6px", color: txnColColor, fontWeight: 600 }, children: "Ref" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: transactions.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: `1px solid ${cardIsPool ? "#f3e8ff" : "#f3f4f6"}` }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "3px 6px" }, children: fmtDate(t.saleDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "3px 6px" }, children: t.buyer }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "3px 6px", textAlign: "right" }, children: [
              parseFloat(t.tonnage ?? "0").toFixed(2),
              "t"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "3px 6px", textAlign: "right" }, children: t.pricePerTonnePence ? `£${(t.pricePerTonnePence / 100).toFixed(2)}` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "3px 6px", textAlign: "right" }, children: t.netValuePence ?? t.grossValuePence ? pToGBP(t.netValuePence ?? t.grossValuePence) : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "3px 6px", color: "#6b7280" }, children: t.merchantRef ?? t.invoiceNumber ?? "—" })
          ] }, t.id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => openEdit(c), style: { fontSize: "0.78rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 12, style: { marginRight: 4 } }),
            " Edit"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setDeleteId(c.id), style: { fontSize: "0.78rem", borderColor: "#fca5a5", color: "#dc2626" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 12, style: { marginRight: 4 } }),
            " Delete"
          ] })
        ] })
      ] })
    ] }, c.id);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 32, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.75rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }, children: "Total Committed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "1.5rem", fontWeight: 700, color: "#1d4ed8" }, children: [
            totalCommitted.toFixed(2),
            " t"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.75rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }, children: "Called Off / Allocated" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "1.5rem", fontWeight: 700, color: "#16a34a" }, children: [
            totalCalledOff.toFixed(2),
            " t"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.75rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }, children: "Forward Contract Value" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "1.5rem", fontWeight: 700, color: "#92400e" }, children: [
            "£",
            totalForwardValue.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: cropYearFilter,
            onChange: (e) => setCropYearFilter(e.target.value),
            style: { padding: "6px 12px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: "0.875rem", color: "#374151", background: "#fff", cursor: "pointer" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "__all__", children: "All Crop Years" }),
              availableCropYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: y, children: y }, y))
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: () => {
              setEditing(null);
              setForm(emptyForward);
              setAddType("forward");
            },
            style: { background: "#2563eb", color: "#fff", padding: "6px 14px", fontSize: "0.85rem" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, style: { marginRight: 5 } }),
              " Forward Contract"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: () => {
              setEditing(null);
              setForm(emptyPool);
              setAddType("pool");
            },
            style: { background: "#7c3aed", color: "#fff", padding: "6px 14px", fontSize: "0.85rem" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Droplets, { size: 14, style: { marginRight: 5 } }),
              " Pool Scheme"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: 32 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Handshake, { size: 18, color: "#2563eb" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { style: { fontSize: "1rem", fontWeight: 700, color: "#1d4ed8", margin: 0 }, children: [
          "Forward Contracts (",
          forwardContracts.length,
          ")"
        ] })
      ] }),
      forwardContracts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", color: "#9ca3af", padding: "32px 0", border: "1px dashed #e5e7eb", borderRadius: 8 }, children: [
        "No forward contracts",
        cropYearFilter !== "__all__" ? ` for ${cropYearFilter}` : "",
        ". Add one above."
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 14 }, children: forwardContracts.map(renderContractCard) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Droplets, { size: 18, color: "#7c3aed" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { style: { fontSize: "1rem", fontWeight: 700, color: "#7c3aed", margin: 0 }, children: [
          "Pool Scheme Positions (",
          poolContracts.length,
          ")"
        ] })
      ] }),
      poolContracts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", color: "#9ca3af", padding: "32px 0", border: "1px dashed #e5e7eb", borderRadius: 8 }, children: [
        "No pool scheme positions",
        cropYearFilter !== "__all__" ? ` for ${cropYearFilter}` : "",
        ". Add one above."
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 14 }, children: poolContracts.map(renderContractCard) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isOpen, onOpenChange: (v) => {
      if (!v) {
        setAddType(null);
        setEditing(null);
        setForm(emptyForward);
        saveMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 600, maxHeight: "80vh", overflowY: "auto" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editing ? "Edit" : "Add",
        " ",
        isPool ? "Pool Scheme Position" : "Forward Contract"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 4 }, children: [
              isPool ? "Pool Operator" : "Merchant / Buyer",
              " *"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              BuyerCombobox,
              {
                farmId,
                types: ["grain_merchant"],
                valueId: form.buyerId,
                valueName: form.buyer,
                onChange: (id, name) => setForm((f) => ({ ...f, buyerId: id, buyer: name })),
                required: true,
                placeholder: isPool ? "Search or add pool operator..." : "Search or add grain merchant...",
                typeLabel: isPool ? "Pool Operator" : "Grain Merchant",
                postAddNavigatePath: "/suppliers-stock?tab=suppliers"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 4 }, children: "Commodity *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                required: true,
                value: form.commodity ?? "",
                onChange: (e) => setForm((f) => ({ ...f, commodity: e.target.value })),
                style: { width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: "0.875rem" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select..." }),
                  ["Winter Wheat", "Winter Barley", "Spring Barley", "Oilseed Rape", "Winter Oats", "Maize", "Spring Oats", "Rye", "Triticale"].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c, children: c }, c))
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 4 }, children: "Variety" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.variety ?? "", onChange: (e) => setForm((f) => ({ ...f, variety: e.target.value })), placeholder: "e.g. KWS Zyatt" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 4 }, children: "Crop Year" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.cropYear ?? "", onChange: (e) => setForm((f) => ({ ...f, cropYear: e.target.value })), placeholder: "e.g. 2024 Harvest" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 4 }, children: "Quantity (tonnes) *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, type: "number", step: "0.01", value: form.quantityTonnes ?? "", onChange: (e) => setForm((f) => ({ ...f, quantityTonnes: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 4 }, children: "Contract Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.contractReference ?? "", onChange: (e) => setForm((f) => ({ ...f, contractReference: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 4 }, children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "select",
              {
                value: form.status ?? "active",
                onChange: (e) => setForm((f) => ({ ...f, status: e.target.value })),
                style: { width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: "0.875rem" },
                children: ["active", "pending", "fulfilled", "cancelled", "disputed", "open"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s, children: s.charAt(0).toUpperCase() + s.slice(1) }, s))
              }
            )
          ] }),
          !isPool && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 4 }, children: "Price (£/t)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  step: "0.01",
                  value: form.contractedPricePence !== "" && form.contractedPricePence !== null ? (Number(form.contractedPricePence) / 100).toFixed(2) : "",
                  onChange: (e) => setForm((f) => ({ ...f, contractedPricePence: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : "" })),
                  placeholder: "e.g. 192.00"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 4 }, children: "Delivery From" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.deliveryWindowStart ?? "", onChange: (e) => setForm((f) => ({ ...f, deliveryWindowStart: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 4 }, children: "Delivery To" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.deliveryWindowEnd ?? "", onChange: (e) => setForm((f) => ({ ...f, deliveryWindowEnd: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 4 }, children: "Call-Off Notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.callOffWindowNotes ?? "", onChange: (e) => setForm((f) => ({ ...f, callOffWindowNotes: e.target.value })), placeholder: "e.g. Full tonnage Aug–Sep, call-off at farm gate" })
            ] })
          ] }),
          isPool && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 4 }, children: "Advance Payment (£/t)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  step: "0.01",
                  value: form.advancePaymentPence !== "" && form.advancePaymentPence !== null ? (Number(form.advancePaymentPence) / 100).toFixed(2) : "",
                  onChange: (e) => setForm((f) => ({ ...f, advancePaymentPence: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : "" })),
                  placeholder: "e.g. 300.00"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 4 }, children: "Pool Levy (£/t)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  step: "0.01",
                  value: form.poolLevyPence !== "" && form.poolLevyPence !== null ? (Number(form.poolLevyPence) / 100).toFixed(2) : "",
                  onChange: (e) => setForm((f) => ({ ...f, poolLevyPence: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : "" })),
                  placeholder: "e.g. 1.50"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 4 }, children: "Pool Closes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.poolClosingDate ?? "", onChange: (e) => setForm((f) => ({ ...f, poolClosingDate: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 4 }, children: "Settlement Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.poolSettlementDate ?? "", onChange: (e) => setForm((f) => ({ ...f, poolSettlementDate: e.target.value })) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 4 }, children: "Delivery Location" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.deliveryLocation ?? "", onChange: (e) => setForm((f) => ({ ...f, deliveryLocation: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 4 }, children: "Quality Specification" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.qualitySpec ?? "", onChange: (e) => setForm((f) => ({ ...f, qualitySpec: e.target.value })), placeholder: "e.g. Feed, min 76 SWt, max 15% moisture" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 4 }, children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "textarea",
              {
                value: form.notes ?? "",
                onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })),
                rows: 2,
                style: { width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: "0.875rem", resize: "vertical" }
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveMut, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => {
            setAddType(null);
            setEditing(null);
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "submit",
              disabled: saveMut.isPending,
              style: { background: isPool ? "#7c3aed" : "#2563eb", color: "#fff" },
              children: saveMut.isPending ? "Saving..." : editing ? "Save Changes" : `Add ${isPool ? "Pool Position" : "Contract"}`
            }
          )
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!deleteId, onOpenChange: (v) => {
      if (!v) {
        setDeleteId(null);
        delMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Contract?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#6b7280", fontSize: "0.875rem" }, children: "This will permanently delete this contract record. This action cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: delMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => deleteId && delMut.mutate(deleteId),
            disabled: delMut.isPending,
            style: { background: "#dc2626", color: "#fff" },
            children: delMut.isPending ? "Deleting..." : "Delete"
          }
        )
      ] })
    ] }) })
  ] });
}
function SettlementNotesTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [subTab, setSubTab] = reactExports.useState("livestock");
  const [open, setOpen] = reactExports.useState(false);
  const [editItem, setEditItem] = reactExports.useState(null);
  const [viewItem, setViewItem] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const emptyLivestock = {
    settlementDate: "",
    buyerName: "",
    marketName: "",
    haulierName: "",
    numHead: "",
    species: "",
    averageWeightKg: "",
    totalWeightKg: "",
    pricePerKg: "",
    pricePerHead: "",
    grossAmount: "",
    deductions: "",
    netAmount: "",
    invoiceReference: "",
    notes: ""
  };
  const emptyGrain = {
    settlementDate: "",
    buyerName: "",
    cropType: "",
    contractReference: "",
    quantityT: "",
    pricePerTonne: "",
    grossAmount: "",
    deductions: "",
    netAmount: "",
    moistureContent: "",
    protein: "",
    specificWeight: "",
    invoiceReference: "",
    notes: ""
  };
  const [lsForm, setLsForm] = reactExports.useState({ ...emptyLivestock });
  const [grForm, setGrForm] = reactExports.useState({ ...emptyGrain });
  const lsQ = useQuery({
    queryKey: ["livestock-settlement-notes", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/livestock-settlement-notes`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const grQ = useQuery({
    queryKey: ["grain-settlement-notes", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/grain-settlement-notes`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const lsRecords = Array.isArray(lsQ.data?.records) ? lsQ.data.records : [];
  const grRecords = Array.isArray(grQ.data?.records) ? grQ.data.records : [];
  const lsSaveMut = useMutation({
    mutationFn: (data) => {
      const id = editItem?.id;
      return fetch(id ? `/api/farms/${farmId}/livestock-settlement-notes/${id}` : `/api/farms/${farmId}/livestock-settlement-notes`, {
        method: id ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["livestock-settlement-notes", farmId] });
      setOpen(false);
      toast({ title: "Settlement note saved" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const grSaveMut = useMutation({
    mutationFn: (data) => {
      const id = editItem?.id;
      return fetch(id ? `/api/farms/${farmId}/grain-settlement-notes/${id}` : `/api/farms/${farmId}/grain-settlement-notes`, {
        method: id ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grain-settlement-notes", farmId] });
      setOpen(false);
      toast({ title: "Settlement note saved" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const lsDelMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/livestock-settlement-notes/${id}`, { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["livestock-settlement-notes", farmId] });
      setDeleteId(null);
      toast({ title: "Record deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const grDelMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/grain-settlement-notes/${id}`, { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grain-settlement-notes", farmId] });
      setDeleteId(null);
      toast({ title: "Record deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const fmtMoney = (v) => v != null ? `£${Number(v).toFixed(2)}` : "—";
  const openAdd = () => {
    setEditItem(null);
    if (subTab === "livestock") setLsForm({ ...emptyLivestock });
    else setGrForm({ ...emptyGrain });
    setOpen(true);
  };
  const openEdit = (r) => {
    setEditItem(r);
    if (subTab === "livestock") setLsForm({
      settlementDate: r.settlementDate?.slice(0, 10) ?? "",
      buyerName: r.buyerName ?? "",
      marketName: r.marketName ?? "",
      haulierName: r.haulierName ?? "",
      numHead: r.numHead ?? "",
      species: r.species ?? "",
      averageWeightKg: r.averageWeightKg ?? "",
      totalWeightKg: r.totalWeightKg ?? "",
      pricePerKg: r.pricePerKg ?? "",
      pricePerHead: r.pricePerHead ?? "",
      grossAmount: r.grossAmount ?? "",
      deductions: r.deductions ?? "",
      netAmount: r.netAmount ?? "",
      invoiceReference: r.invoiceReference ?? "",
      notes: r.notes ?? ""
    });
    else setGrForm({
      settlementDate: r.settlementDate?.slice(0, 10) ?? "",
      buyerName: r.buyerName ?? "",
      cropType: r.cropType ?? "",
      contractReference: r.contractReference ?? "",
      quantityT: r.quantityT ?? "",
      pricePerTonne: r.pricePerTonne ?? "",
      grossAmount: r.grossAmount ?? "",
      deductions: r.deductions ?? "",
      netAmount: r.netAmount ?? "",
      moistureContent: r.moistureContent ?? "",
      protein: r.protein ?? "",
      specificWeight: r.specificWeight ?? "",
      invoiceReference: r.invoiceReference ?? "",
      notes: r.notes ?? ""
    });
    setOpen(true);
  };
  const fl = (k) => (v) => setLsForm((p) => ({ ...p, [k]: v }));
  const fg = (k) => (v) => setGrForm((p) => ({ ...p, [k]: v }));
  const isLoading = subTab === "livestock" ? lsQ.isLoading : grQ.isLoading;
  const records = subTab === "livestock" ? lsRecords : grRecords;
  const delMut = subTab === "livestock" ? lsDelMut : grDelMut;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { fontSize: "1rem", fontWeight: 600, margin: 0 }, children: "Settlement Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#6b7280", fontSize: "0.8rem", marginTop: 4 }, children: "Record livestock and grain settlement notes received from markets, abattoirs, and grain merchants." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { style: { width: 14, height: 14, marginRight: 4 } }),
        "Add Settlement Note"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { className: "mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: subTab === "livestock", onClick: () => {
        setSubTab("livestock");
        setViewItem(null);
        setDeleteId(null);
      }, children: [
        "Livestock (",
        lsRecords.length,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: subTab === "grain", onClick: () => {
        setSubTab("grain");
        setViewItem(null);
        setDeleteId(null);
      }, children: [
        "Grain (",
        grRecords.length,
        ")"
      ] })
    ] }),
    isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#9ca3af", fontSize: "0.875rem" }, children: "Loading…" }),
    !isLoading && records.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { border: "2px dashed #e5e7eb", borderRadius: 12, padding: "40px 0", textAlign: "center", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { style: { width: 36, height: 36, margin: "0 auto 12px", opacity: 0.3 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.875rem", fontWeight: 500 }, children: [
        "No ",
        subTab,
        " settlement notes yet"
      ] })
    ] }),
    records.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", fontSize: "0.8125rem", borderCollapse: "collapse" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { style: { background: "#f9fafb" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "10px 12px", fontWeight: 600, color: "#374151" }, children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "10px 12px", fontWeight: 600, color: "#374151" }, children: "Buyer" }),
        subTab === "livestock" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "10px 12px", fontWeight: 600, color: "#374151" }, children: "Species" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "10px 12px", fontWeight: 600, color: "#374151" }, children: "Head" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "10px 12px", fontWeight: 600, color: "#374151" }, children: "Crop" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "10px 12px", fontWeight: 600, color: "#374151" }, children: "Qty (t)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "10px 12px", fontWeight: 600, color: "#374151" }, children: "Net Amount" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "10px 12px" } })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: records.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderTop: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#fafafa" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "9px 12px" }, children: fmtD(r.settlementDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "9px 12px", fontWeight: 500 }, children: r.buyerName }),
        subTab === "livestock" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "9px 12px" }, children: r.species || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "9px 12px" }, children: r.numHead ?? "—" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "9px 12px" }, children: r.cropType || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "9px 12px" }, children: r.quantityT ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "9px 12px", fontWeight: 600, color: "#16a34a" }, children: fmtMoney(r.netAmount) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "9px 12px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4, justifyContent: "flex-end" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setViewItem(r), title: "View", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { style: { width: 14, height: 14 } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => openEdit(r), title: "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { style: { width: 14, height: 14 } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setDeleteId(r.id), title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { style: { width: 14, height: 14, color: "#ef4444" } }) })
        ] }) })
      ] }, r.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: open && subTab === "livestock", onOpenChange: (o) => {
      if (!o) {
        setOpen(false);
        lsSaveMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 560 }, "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editItem ? "Edit" : "Add",
        " Livestock Settlement Note"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, paddingTop: 8, maxHeight: "70vh", overflowY: "auto", paddingRight: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Settlement Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: lsForm.settlementDate, onChange: (e) => fl("settlementDate")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Species" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: lsForm.species, onValueChange: (v) => fl("species")(v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Cattle", "Sheep", "Pigs", "Poultry", "Other"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1/-1" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: lsForm.buyerName, onChange: (e) => fl("buyerName")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Market" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: lsForm.marketName, onChange: (e) => fl("marketName")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Haulier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: lsForm.haulierName, onChange: (e) => fl("haulierName")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "No. of Head" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "1", value: lsForm.numHead, onChange: (e) => fl("numHead")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Avg Weight (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: lsForm.averageWeightKg, onChange: (e) => fl("averageWeightKg")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Total Weight (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: lsForm.totalWeightKg, onChange: (e) => fl("totalWeightKg")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Price/kg (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.001", value: lsForm.pricePerKg, onChange: (e) => fl("pricePerKg")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Gross Amount (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: lsForm.grossAmount, onChange: (e) => fl("grossAmount")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Deductions (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: lsForm.deductions, onChange: (e) => fl("deductions")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Net Amount (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: lsForm.netAmount, onChange: (e) => fl("netAmount")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1/-1" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Invoice Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: lsForm.invoiceReference, onChange: (e) => fl("invoiceReference")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1/-1" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: lsForm.notes, onChange: (e) => fl("notes")(e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: lsSaveMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !lsForm.settlementDate || !lsForm.buyerName || lsSaveMut.isPending, onClick: () => lsSaveMut.mutate(lsForm), children: lsSaveMut.isPending ? "Saving…" : "Save" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: open && subTab === "grain", onOpenChange: (o) => {
      if (!o) {
        setOpen(false);
        grSaveMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 560 }, "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editItem ? "Edit" : "Add",
        " Grain Settlement Note"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, paddingTop: 8, maxHeight: "70vh", overflowY: "auto", paddingRight: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Settlement Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: grForm.settlementDate, onChange: (e) => fg("settlementDate")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Crop Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: grForm.cropType, onChange: (e) => fg("cropType")(e.target.value), placeholder: "e.g. Winter Wheat" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1/-1" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: grForm.buyerName, onChange: (e) => fg("buyerName")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Contract Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: grForm.contractReference, onChange: (e) => fg("contractReference")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity (tonnes)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.001", value: grForm.quantityT, onChange: (e) => fg("quantityT")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Price/tonne (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: grForm.pricePerTonne, onChange: (e) => fg("pricePerTonne")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Moisture (%)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: grForm.moistureContent, onChange: (e) => fg("moistureContent")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Protein (%)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: grForm.protein, onChange: (e) => fg("protein")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Spec. Weight (kg/hl)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: grForm.specificWeight, onChange: (e) => fg("specificWeight")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Gross Amount (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: grForm.grossAmount, onChange: (e) => fg("grossAmount")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Deductions (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: grForm.deductions, onChange: (e) => fg("deductions")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Net Amount (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: grForm.netAmount, onChange: (e) => fg("netAmount")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1/-1" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Invoice Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: grForm.invoiceReference, onChange: (e) => fg("invoiceReference")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1/-1" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: grForm.notes, onChange: (e) => fg("notes")(e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: grSaveMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !grForm.settlementDate || !grForm.buyerName || !grForm.cropType || grSaveMut.isPending, onClick: () => grSaveMut.mutate(grForm), children: grSaveMut.isPending ? "Saving…" : "Save" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: viewItem !== null, onOpenChange: (o) => {
      if (!o) setViewItem(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 520 }, "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Settlement Note" }) }),
      viewItem && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px", fontSize: "0.875rem", paddingTop: 4, maxHeight: "70vh", overflowY: "auto" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtD(viewItem.settlementDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }, children: "Buyer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.buyerName })
        ] }),
        subTab === "livestock" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", fontWeight: 600 }, children: "Species" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.species || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", fontWeight: 600 }, children: "Head" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.numHead ?? "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", fontWeight: 600 }, children: "Market" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.marketName || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", fontWeight: 600 }, children: "Haulier" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.haulierName || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", fontWeight: 600 }, children: "Avg Weight" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.averageWeightKg ? `${viewItem.averageWeightKg} kg` : "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", fontWeight: 600 }, children: "Total Weight" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.totalWeightKg ? `${viewItem.totalWeightKg} kg` : "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", fontWeight: 600 }, children: "Price/kg" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: fmtMoney(viewItem.pricePerKg) })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", fontWeight: 600 }, children: "Crop" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.cropType || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", fontWeight: 600 }, children: "Quantity (t)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.quantityT ?? "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", fontWeight: 600 }, children: "Price/tonne" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: fmtMoney(viewItem.pricePerTonne) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", fontWeight: 600 }, children: "Contract Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.contractReference || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", fontWeight: 600 }, children: "Moisture" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.moistureContent != null ? `${viewItem.moistureContent}%` : "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", fontWeight: 600 }, children: "Protein" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.protein != null ? `${viewItem.protein}%` : "—" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", fontWeight: 600 }, children: "Gross Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: fmtMoney(viewItem.grossAmount) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", fontWeight: 600 }, children: "Deductions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: fmtMoney(viewItem.deductions) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1/-1" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", fontWeight: 600 }, children: "Net Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 700, fontSize: "1rem", color: "#16a34a" }, children: fmtMoney(viewItem.netAmount) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1/-1" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", fontWeight: 600 }, children: "Invoice Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.invoiceReference || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1/-1" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", fontWeight: 600 }, children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.notes || "—" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeleteId(null);
        delMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 380 }, "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Settlement Note?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#6b7280" }, children: "This cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: delMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", disabled: delMut.isPending, onClick: () => deleteId !== null && delMut.mutate(deleteId), children: delMut.isPending ? "Deleting…" : "Delete" })
      ] })
    ] }) })
  ] });
}
const TABS = [
  { id: "grain", label: "Grain Trading", icon: Wheat },
  { id: "contracts", label: "Grain Contracts", icon: Handshake },
  { id: "livestock", label: "Livestock", icon: Scale },
  { id: "milk", label: "Milk Sales", icon: Milk },
  { id: "poultry", label: "Poultry", icon: Bird },
  { id: "pigs", label: "Pig Sales", icon: PiggyBank },
  { id: "direct", label: "Direct Sales", icon: ShoppingCart },
  { id: "reports", label: "Reports", icon: ChartColumn },
  { id: "settlement-notes", label: "Settlement Notes", icon: FileText }
];
function SalesTradingPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = usePersistedTab({ page: "sales-trading", farmId, validIds: TABS.map((t) => t.id), defaultTab: "grain" });
  if (!farmId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Sales & Trading", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: 32, textAlign: "center", color: "#9ca3af" }, children: "Please select a farm to view Sales & Trading." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Sales & Trading", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "24px 28px", maxWidth: 1400 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: 24 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { style: { fontSize: "1.5rem", fontWeight: 700, color: "#111827", margin: 0 }, children: "Sales & Trading" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#6b7280", marginTop: 4, fontSize: "0.9rem" }, children: "Comprehensive sales records for all farming sectors — grain, livestock, milk, poultry, pigs, and direct sales" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabBar, { children: TABS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === t.id, onClick: () => setTab(t.id), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(t.icon, { size: 14, style: { marginRight: 6 } }),
      t.label
    ] }, t.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 20 }, children: [
      tab === "grain" && /* @__PURE__ */ jsxRuntimeExports.jsx(GrainSalesTab, { farmId }),
      tab === "contracts" && /* @__PURE__ */ jsxRuntimeExports.jsx(GrainContractsTab, { farmId }),
      tab === "livestock" && /* @__PURE__ */ jsxRuntimeExports.jsx(LivestockTradingTab, { farmId }),
      tab === "milk" && /* @__PURE__ */ jsxRuntimeExports.jsx(MilkSalesTab, { farmId }),
      tab === "poultry" && /* @__PURE__ */ jsxRuntimeExports.jsx(PoultrySettlementTab, { farmId }),
      tab === "pigs" && /* @__PURE__ */ jsxRuntimeExports.jsx(PigSalesTab, { farmId }),
      tab === "direct" && /* @__PURE__ */ jsxRuntimeExports.jsx(DirectSalesTab, { farmId }),
      tab === "reports" && /* @__PURE__ */ jsxRuntimeExports.jsx(ReportsTab, { farmId }),
      tab === "settlement-notes" && /* @__PURE__ */ jsxRuntimeExports.jsx(SettlementNotesTab, { farmId })
    ] })
  ] }) });
}
export {
  SalesTradingPage as default
};
