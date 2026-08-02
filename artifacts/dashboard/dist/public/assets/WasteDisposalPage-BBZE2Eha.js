import { b as useAppStore, a as useToast, t as useQueryClient, r as reactExports, Q as React, l as useQuery, O as useMutation, j as jsxRuntimeExports, o as Link, I as Input, c as Button, S as Plus, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, J as DialogFooter, L as Label, $ as X } from "./index-D8jCwhfW.js";
import { a as printFromRef } from "./print-report-B_FwCCVJ.js";
import { C as CropYearSelector } from "./CropYearSelector-DDgGJyjO.js";
import { c as currentCropYear, i as isInCropYear, b as cropYearLabel } from "./cropYear-Dmv-iNR6.js";
import { A as AppLayout, K as Recycle, j as Truck, c as ClipboardList } from "./AppLayout-DYpK8B2q.js";
import { T as Textarea } from "./textarea-Sl7n9dUX.js";
import { B as Badge } from "./badge-CiYBRBEi.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CzSsuepM.js";
import { O as OtherSelect } from "./other-select-BjqnC-uM.js";
import { R as RaiseTaskDialog } from "./RaiseTaskDialog-CDqbKAqs.js";
import { F as FileText } from "./shield-alert-BqGLE9Pd.js";
import { T as TriangleAlert } from "./triangle-alert-GOoHEkr7.js";
import { E as ExternalLink } from "./external-link-klVPePWc.js";
import { S as Search } from "./search-D10PCP3w.js";
import { H as History } from "./history-4JH7J0Mw.js";
import { P as Printer } from "./printer-m0avLY_o.js";
import { P as Paperclip } from "./paperclip-By4R45MS.js";
import { E as Eye } from "./eye-o73dJDiw.js";
import { T as Trash2 } from "./trash-2-DDfDtdfa.js";
import { U as Upload } from "./upload-MVbnAdlw.js";
import "./use-safe-clerk-BglVud-0.js";
import "./database-BfpstzXe.js";
import "./shield-check-Cb20ui1N.js";
import "./tractor-Bv8TXwfX.js";
import "./index-kw-tvdla.js";
import "./index-CaQnaC0V.js";
import "./chevron-up-BJyIaQFC.js";
const WASTE_TYPES_WITH_EWC = [
  { label: "Agricultural plastics – bale wrap / silage sheet", ewc: "02 01 04" },
  { label: "Chemical containers / pesticide packaging", ewc: "15 01 10*" },
  { label: "Clinical / veterinary waste (sharps, medicines)", ewc: "18 02 02*" },
  { label: "Waste oil / lubricants", ewc: "13 02 05*" },
  { label: "Scrap metal", ewc: "17 04 05" },
  { label: "Tyres", ewc: "16 01 03" },
  { label: "Batteries", ewc: "16 06 01*" },
  { label: "Electronic waste (WEEE)", ewc: "16 02 14" },
  { label: "Cardboard / paper (non-hazardous)", ewc: "15 01 01" },
  { label: "General farm waste (mixed non-hazardous)", ewc: "02 01 99" },
  { label: "Sewage / slurry (non-hazardous)", ewc: "02 01 06" },
  { label: "Asbestos", ewc: "17 06 01*" },
  { label: "Food waste / organic waste", ewc: "02 01 02" },
  { label: "Spent chemicals / washings", ewc: "07 04 04*" },
  { label: "Mineral oils (non-hazardous)", ewc: "13 01 10" },
  { label: "Mixed construction waste", ewc: "17 09 04" },
  { label: "Other", ewc: "" }
];
const DISPOSAL_METHODS = [
  "Licensed waste carrier collection",
  "Registered waste site drop-off",
  "Agricultural waste contractor",
  "Retailer take-back scheme (e.g. AgXchange)",
  "On-farm composting",
  "On-farm burning (permitted materials only)",
  "Approved incineration facility",
  "Recycling facility",
  "Other"
];
const CARRIER_TYPES = [
  "Environment Agency Registered Carrier",
  "Upper Tier Carrier",
  "Lower Tier Carrier",
  "Exemption holder",
  "Retailer take-back scheme",
  "Other"
];
const fmt = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const fmtFull = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
};
function WasteHistoryDialog({ records, onClose }) {
  const [yearFilter, setYearFilter] = React.useState("all");
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const recentYears = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];
  const sorted = [...records].sort((a, b) => new Date(b.disposalDate ?? 0).getTime() - new Date(a.disposalDate ?? 0).getTime());
  const filtered = yearFilter === "all" ? sorted : sorted.filter((r) => r.disposalDate && new Date(r.disposalDate).getFullYear() === yearFilter);
  function fmtDate(d) {
    return d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  }
  function handlePrint() {
    const rows = filtered.map((r) => `<tr><td>${fmtDate(r.disposalDate)}</td><td>${r.wasteType || "—"}</td><td>${r.ewcCode || "—"}</td><td>${r.quantity ? `${r.quantity} ${r.quantityUnit || ""}`.trim() : "—"}</td><td>${r.disposalMethod || "—"}</td><td>${r.carrierName || "—"}</td><td>${r.wasteTransferNote || "—"}</td><td>${r.notes || ""}</td></tr>`).join("");
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Waste Disposal History</title><style>body{font-family:Arial,sans-serif;font-size:10pt;margin:20mm}table{width:100%;border-collapse:collapse;margin-top:12px}th{background:#166534;color:#fff;padding:5px 7px;text-align:left;font-size:8.5pt}td{padding:4px 7px;border-bottom:1px solid #e5e7eb;font-size:9pt;vertical-align:top}tr:nth-child(even) td{background:#f9fafb}.footer{margin-top:18px;font-size:8pt;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:8px}@media print{body{margin:10mm}}</style></head><body><h1 style="font-size:14pt">Waste Disposal History</h1><p style="font-size:9pt;color:#555">Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")} · ${filtered.length} record${filtered.length !== 1 ? "s" : ""}${yearFilter !== "all" ? ` (${yearFilter})` : ""}</p><table><thead><tr><th>Date</th><th>Waste Type</th><th>EWC Code</th><th>Quantity</th><th>Method</th><th>Carrier</th><th>WTN</th><th>Notes</th></tr></thead><tbody>${rows}</tbody></table><p class="footer">Duty of Care: retain waste records for at least 2 years (3 years for hazardous waste).</p></body></html>`);
      w.document.close();
      w.focus();
      w.print();
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
    if (!o) onClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-4xl max-h-[85vh] flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "w-4 h-4 text-green-700" }),
      "Full Waste Disposal History — All Years"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap border-b pb-3", children: [
      ["all", ...recentYears].map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setYearFilter(y), style: { padding: "3px 12px", borderRadius: 99, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", border: yearFilter === y ? "1.5px solid #15803d" : "1.5px solid #e5e7eb", background: yearFilter === y ? "#f0fdf4" : "#fff", color: yearFilter === y ? "#15803d" : "#6b7280" }, children: y === "all" ? "All years" : y }, y)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto text-xs text-muted-foreground", children: [
        filtered.length,
        " record",
        filtered.length !== 1 ? "s" : ""
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto min-h-0", children: filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-14 text-muted-foreground gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Recycle, { className: "w-9 h-9 text-gray-300" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
        "No waste records",
        yearFilter !== "all" ? ` for ${yearFilter}` : ""
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Date", "Waste Type", "EWC Code", "Quantity", "Method", "Carrier", "WTN", "Notes"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.5rem 0.75rem", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }, children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filtered.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#fafafa" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", whiteSpace: "nowrap", color: "#6b7280" }, children: fmtDate(r.disposalDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.5rem 0.75rem", fontWeight: 500 }, children: [
          r.wasteType || "—",
          r.ewcCode?.includes("*") && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { marginLeft: 4, fontSize: "0.65rem", background: "#fee2e2", color: "#991b1b", padding: "1px 5px", borderRadius: 4 }, children: "Hazardous" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", fontFamily: "monospace", fontSize: "0.8rem", color: "#374151" }, children: r.ewcCode || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", color: "#374151" }, children: r.quantity ? `${r.quantity} ${r.quantityUnit || ""}`.trim() : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", color: "#6b7280" }, children: r.disposalMethod || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", color: "#6b7280" }, children: r.carrierName || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem" }, children: r.wasteTransferNote ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.75rem", background: "#f0fdf4", color: "#15803d", padding: "2px 6px", borderRadius: 4, fontWeight: 600 }, children: r.wasteTransferNote }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444", fontSize: "0.75rem" }, children: "Missing" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", color: "#9ca3af", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: r.notes || "" })
      ] }, r.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "border-t pt-3 flex-row items-center gap-2 sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground flex-1", children: [
        "Duty of Care: retain for at least ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "2 years" }),
        " (3 years for hazardous waste)."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        filtered.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: handlePrint, className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14, className: "mr-1" }),
          "Print / Export"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: onClose, children: "Close" })
      ] })
    ] })
  ] }) });
}
function WasteDisposalPage() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const printRef = reactExports.useRef(null);
  const [search, setSearch] = reactExports.useState("");
  const [cropYear, setCropYear] = reactExports.useState(currentCropYear());
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [editRecord, setEditRecord] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [reportOpen, setReportOpen] = reactExports.useState(false);
  const [historyOpen, setHistoryOpen] = reactExports.useState(false);
  const [raiseTaskFor, setRaiseTaskFor] = reactExports.useState(null);
  const [reportFrom, setReportFrom] = reactExports.useState(() => {
    const d = /* @__PURE__ */ new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d.toISOString().slice(0, 10);
  });
  const [reportTo, setReportTo] = reactExports.useState(() => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [carrierMode, setCarrierMode] = reactExports.useState("registered");
  const emptyForm = {
    wasteType: "",
    ewcCode: "",
    quantity: "",
    disposalMethod: "",
    disposalDate: "",
    sourceDescription: "",
    collectionBuildingId: "",
    carrierId: "",
    carrierName: "",
    carrierLicence: "",
    carrierRegistrationType: "",
    destinationSite: "",
    wasteTransferNote: "",
    receiptPhotoPath: null,
    notes: ""
  };
  const [form, setForm] = reactExports.useState(emptyForm);
  const [selectedFile, setSelectedFile] = reactExports.useState(null);
  const [uploading, setUploading] = reactExports.useState(false);
  const fileInputRef = reactExports.useRef(null);
  const [carrierQuery, setCarrierQuery] = reactExports.useState("");
  const [carrierResults, setCarrierResults] = reactExports.useState([]);
  const [carrierLoading, setCarrierLoading] = reactExports.useState(false);
  const [carrierDropOpen, setCarrierDropOpen] = reactExports.useState(false);
  const carrierTimer = reactExports.useRef(null);
  const [siteQuery, setSiteQuery] = reactExports.useState("");
  const [siteResults, setSiteResults] = reactExports.useState([]);
  const [siteLoading, setSiteLoading] = reactExports.useState(false);
  const [siteDropOpen, setSiteDropOpen] = reactExports.useState(false);
  const siteTimer = reactExports.useRef(null);
  React.useEffect(() => {
    if (carrierTimer.current) clearTimeout(carrierTimer.current);
    if (carrierQuery.length < 3) {
      setCarrierResults([]);
      return;
    }
    carrierTimer.current = setTimeout(async () => {
      setCarrierLoading(true);
      try {
        const r = await fetch(`/api/ea/carriers?q=${encodeURIComponent(carrierQuery)}`);
        const data = await r.json();
        setCarrierResults(data.results ?? []);
      } catch {
        setCarrierResults([]);
      } finally {
        setCarrierLoading(false);
      }
    }, 400);
    return () => {
      if (carrierTimer.current) clearTimeout(carrierTimer.current);
    };
  }, [carrierQuery]);
  React.useEffect(() => {
    if (siteTimer.current) clearTimeout(siteTimer.current);
    if (siteQuery.length < 3) {
      setSiteResults([]);
      return;
    }
    siteTimer.current = setTimeout(async () => {
      setSiteLoading(true);
      try {
        const r = await fetch(`/api/ea/permitted-sites?q=${encodeURIComponent(siteQuery)}`);
        const data = await r.json();
        setSiteResults(data.results ?? []);
      } catch {
        setSiteResults([]);
      } finally {
        setSiteLoading(false);
      }
    }, 400);
    return () => {
      if (siteTimer.current) clearTimeout(siteTimer.current);
    };
  }, [siteQuery]);
  const resetEaSearch = () => {
    setCarrierQuery("");
    setCarrierResults([]);
    setCarrierDropOpen(false);
    setSiteQuery("");
    setSiteResults([]);
    setSiteDropOpen(false);
  };
  const farmQ = useQuery({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const farmRecord = farmQ.data?.record ?? null;
  const q = useQuery({
    queryKey: ["waste", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/waste`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const suppliersQ = useQuery({
    queryKey: ["suppliers", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/suppliers`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const farmLocsQ = useQuery({
    queryKey: ["farm-locations", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/farm-locations`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => Array.isArray(d) ? d : []
  });
  const farmLocations = (farmLocsQ.data ?? []).filter((l) => l.isActive);
  const wasteCarriers = (suppliersQ.data ?? []).filter(
    (s) => s.category === "Waste Carrier" || s.category === "Waste Carrier / Environmental"
  );
  const allSuppliers = suppliersQ.data ?? [];
  const invalidate = () => qc.invalidateQueries({ queryKey: ["waste", farmId] });
  const uploadFileMut = async (file) => {
    const urlRes = await fetch("/api/storage/uploads/request-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type || "application/octet-stream" })
    });
    if (!urlRes.ok) throw new Error("Failed to get upload URL");
    const { uploadURL, objectPath } = await urlRes.json();
    const putRes = await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type || "application/octet-stream" } });
    if (!putRes.ok) throw new Error("Failed to upload file");
    return objectPath;
  };
  const saveMut = useMutation({
    mutationFn: (body) => {
      const payload = {
        ...body,
        disposalDate: body.disposalDate ? new Date(body.disposalDate).toISOString() : void 0,
        carrierId: body.carrierId ? Number(body.carrierId) : null,
        collectionBuildingId: body.collectionBuildingId ? Number(body.collectionBuildingId) : null,
        sourceDescription: body.sourceDescription || null
      };
      if (editRecord) return fetch(`/api/farms/${farmId}/waste/${editRecord.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      return fetch(`/api/farms/${farmId}/waste`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    },
    onSuccess: () => {
      toast({ title: editRecord ? "Record updated" : "Record saved" });
      invalidate();
      setAddOpen(false);
      setEditRecord(null);
      setForm(emptyForm);
      setSelectedFile(null);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const handleSave = async () => {
    try {
      let receiptPhotoPath = form.receiptPhotoPath ?? null;
      if (selectedFile) {
        setUploading(true);
        receiptPhotoPath = await uploadFileMut(selectedFile);
        setUploading(false);
      }
      saveMut.mutate({ ...form, receiptPhotoPath });
    } catch {
      setUploading(false);
      toast({ title: "Failed to upload receipt — record not saved", variant: "destructive" });
    }
  };
  const viewAttachmentUrl = (path) => {
    const stripped = path.startsWith("/objects/") ? path.slice("/objects/".length) : path;
    return `/api/storage/objects/${stripped}`;
  };
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/waste/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Deleted" });
      invalidate();
      setDeleteId(null);
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  const records = q.data ?? [];
  const filtered = records.filter(
    (r) => isInCropYear(r.disposalDate, cropYear) && (!search || r.wasteType?.toLowerCase().includes(search.toLowerCase()) || r.carrierName?.toLowerCase().includes(search.toLowerCase()) || r.destinationSite?.toLowerCase().includes(search.toLowerCase()) || r.sourceDescription?.toLowerCase().includes(search.toLowerCase()) || r.collectionBuildingName?.toLowerCase().includes(search.toLowerCase()))
  );
  const reportRecords = records.filter((r) => {
    if (!r.disposalDate) return false;
    const d = new Date(r.disposalDate);
    if (reportFrom && d < new Date(reportFrom)) return false;
    if (reportTo && d > /* @__PURE__ */ new Date(reportTo + "T23:59:59")) return false;
    return true;
  }).sort((a, b) => new Date(a.disposalDate).getTime() - new Date(b.disposalDate).getTime());
  const openAdd = () => {
    setEditRecord(null);
    setForm(emptyForm);
    setCarrierMode("registered");
    setSelectedFile(null);
    resetEaSearch();
    setAddOpen(true);
  };
  const openEdit = (r) => {
    setEditRecord(r);
    setForm({ ...r, disposalDate: r.disposalDate?.slice(0, 10) ?? "", collectionBuildingId: r.collectionBuildingId ? String(r.collectionBuildingId) : "", sourceDescription: r.sourceDescription ?? "" });
    setCarrierMode(r.carrierId ? "registered" : "manual");
    setSelectedFile(null);
    setCarrierQuery(r.carrierName ?? "");
    setSiteQuery(r.destinationSite ?? "");
    setCarrierDropOpen(false);
    setSiteDropOpen(false);
    setAddOpen(true);
  };
  const onWasteTypeChange = (v) => {
    const match = WASTE_TYPES_WITH_EWC.find((w) => w.label === v);
    setForm((f) => ({ ...f, wasteType: v, ewcCode: match?.ewc || f.ewcCode }));
  };
  const onCarrierSelect = (supplierId) => {
    if (!supplierId || supplierId === "manual") {
      setForm((f) => ({ ...f, carrierId: "", carrierName: "", carrierLicence: "" }));
      return;
    }
    const supplier = allSuppliers.find((s) => s.id === Number(supplierId));
    if (supplier) {
      setForm((f) => ({
        ...f,
        carrierId: supplierId,
        carrierName: supplier.name,
        carrierLicence: supplier.accountNumber || f.carrierLicence
      }));
    }
  };
  const handlePrint = () => {
    printFromRef(printRef, "Waste Disposal Duty of Care Register");
  };
  const hazardCount = reportRecords.filter((r) => r.ewcCode?.includes("*")).length;
  const wtnCount = reportRecords.filter((r) => r.wasteTransferNote).length;
  const uniqueCarriers = new Set(reportRecords.filter((r) => r.carrierName).map((r) => r.carrierName)).size;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Waste Disposal", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { maxWidth: 1200, margin: "0 auto" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mb-4", children: "Waste disposal records — Duty of Care compliance, waste transfer notes, and licensed carrier tracking for Red Tractor and legal requirements." }),
    (() => {
      const thisSeasonRecords = records.filter((r) => isInCropYear(r.disposalDate, cropYear));
      const withWtn = thisSeasonRecords.filter((r) => r.wasteTransferNote).length;
      const missingWtn = thisSeasonRecords.length - withWtn;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: "1.5rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#dcfce7", borderRadius: 8, padding: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Recycle, { size: 18, color: "#16a34a" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }, children: "Disposals This Season" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.375rem", fontWeight: 700, color: "#111827" }, children: thisSeasonRecords.length }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#9ca3af", marginTop: 1 }, children: cropYearLabel(cropYear) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fffbeb", border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fef3c7", borderRadius: 8, padding: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 18, color: "#92400e" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }, children: "Transfer Notes Obtained" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.375rem", fontWeight: 700, color: "#111827" }, children: withWtn }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#9ca3af", marginTop: 1 }, children: thisSeasonRecords.length > 0 ? `${Math.round(withWtn / thisSeasonRecords.length * 100)}% compliance` : "no records" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: missingWtn > 0 ? "#fef2f2" : "#eff6ff", border: `1px solid ${missingWtn > 0 ? "#fecaca" : "#e5e7eb"}`, borderRadius: 10, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: missingWtn > 0 ? "#fee2e2" : "#dbeafe", borderRadius: 8, padding: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 18, color: missingWtn > 0 ? "#dc2626" : "#1d4ed8" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }, children: "Missing Transfer Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.375rem", fontWeight: 700, color: missingWtn > 0 ? "#dc2626" : "#111827" }, children: missingWtn }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#9ca3af", marginTop: 1 }, children: missingWtn > 0 ? "Duty of Care gap" : "fully documented" })
          ] })
        ] })
      ] });
    })(),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff3cd", border: "1px solid #ffc107", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.8rem", color: "#856404" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Duty of Care reminder:" }),
      " Always use licensed waste carriers. Obtain a Waste Transfer Note (WTN) for every collection. EWC codes marked with * are hazardous waste — special rules apply. Records must be retained for at least 2 years (3 years for hazardous waste)."
    ] }),
    wasteCarriers.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 8, padding: "0.625rem 0.875rem", marginBottom: "1rem", fontSize: "0.8rem", color: "#0c4a6e", display: "flex", alignItems: "center", gap: 8 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { size: 13, color: "#0284c7" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
          wasteCarriers.length,
          " registered waste carrier",
          wasteCarriers.length !== 1 ? "s" : ""
        ] }),
        " available from your supplier register. Select them in the Add Record form to auto-fill carrier details."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { href: "/suppliers-stock", style: { marginLeft: "auto", color: "#0284c7", textDecoration: "none", display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem" }, children: [
        "Manage carriers ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 11 })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "relative", flex: 1, minWidth: 200 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 14, style: { position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search waste records...", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-8" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CropYearSelector, { value: cropYear, onChange: setCropYear }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setHistoryOpen(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(History, { size: 14, className: "mr-1" }),
        "Full History"
      ] }),
      historyOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(WasteHistoryDialog, { records, onClose: () => setHistoryOpen(false) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setReportOpen(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14, className: "mr-1" }),
        "Print Register"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
        "Add Waste Record"
      ] })
    ] }),
    !q.isLoading && filtered.length > 0 && (() => {
      const totalWeight = filtered.reduce((s, r) => s + (r.weightTonnes ? parseFloat(String(r.weightTonnes)) : 0), 0);
      const hasWeight = filtered.some((r) => r.weightTonnes);
      const byType = {};
      filtered.forEach((r) => {
        const key = r.wasteType || "Unclassified";
        if (!byType[key]) byType[key] = { count: 0, weight: 0 };
        byType[key].count++;
        if (r.weightTonnes) byType[key].weight += parseFloat(String(r.weightTonnes));
      });
      const typeRows = Object.entries(byType).sort((a, b) => b[1].count - a[1].count).slice(0, 6);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: 14 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 10, marginBottom: typeRows.length > 1 ? 10 : 0, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 16px", minWidth: 120 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#15803d", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Records" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#14532d", lineHeight: 1, margin: 0 }, children: filtered.length })
          ] }),
          hasWeight && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 16px", minWidth: 150 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#15803d", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Total Weight" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#14532d", lineHeight: 1, margin: 0 }, children: [
              totalWeight.toFixed(3),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 500 }, children: "t" })
            ] })
          ] })
        ] }),
        typeRows.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: "6px 14px", borderBottom: "1px solid #f3f4f6", background: "#f9fafb" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em", margin: 0 }, children: "By Type" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "1px solid #f3f4f6" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "5px 14px", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.7rem" }, children: "Waste Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "5px 14px", textAlign: "right", fontWeight: 600, color: "#374151", fontSize: "0.7rem" }, children: "Records" }),
              hasWeight && /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "5px 14px", textAlign: "right", fontWeight: 600, color: "#374151", fontSize: "0.7rem" }, children: "Weight (t)" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: typeRows.map(([type, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "1px solid #f9fafb" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 14px", fontWeight: 500 }, children: type }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 14px", textAlign: "right" }, children: v.count }),
              hasWeight && /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 14px", textAlign: "right" }, children: v.weight > 0 ? `${v.weight.toFixed(3)} t` : "—" })
            ] }, type)) })
          ] })
        ] })
      ] });
    })(),
    q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 py-8 text-center", children: "Loading..." }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 1rem", textAlign: "center" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#f3f4f6", borderRadius: "50%", padding: "1rem", marginBottom: "1rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Recycle, { size: 28, color: "#9ca3af" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151", marginBottom: 4 }, children: records.length === 0 ? "No waste records" : "No records match your search" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#9ca3af", maxWidth: 400, marginBottom: "1.25rem" }, children: "Log all waste movements to maintain your Duty of Care obligations and Red Tractor records." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Date", "Waste Type", "EWC Code", "Qty", "Method", "Carrier", "EA Licence", "Reg. Type", "Destination", "WTN", "Receipt", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }, children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filtered.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }, children: fmt(r.disposalDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.625rem 0.875rem", fontWeight: 500, maxWidth: 200 }, children: [
          r.wasteType || "—",
          r.collectionBuildingName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.7rem", color: "#6b7280", marginTop: 2, display: "flex", alignItems: "center", gap: 3 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { size: 10 }),
            r.collectionBuildingName
          ] }),
          r.sourceDescription && !r.collectionBuildingName && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem", color: "#9ca3af", marginTop: 2 }, children: r.sourceDescription })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: r.ewcCode ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: r.ewcCode.includes("*") ? "#fee2e2" : "#f3f4f6", color: r.ewcCode.includes("*") ? "#991b1b" : "#374151", border: "none", fontFamily: "monospace", fontSize: "0.72rem" }, children: r.ewcCode }) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.quantity || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", maxWidth: 160 }, children: r.disposalMethod || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: r.carrierId ? 500 : "normal", color: r.carrierId ? "#1d4ed8" : "#6b7280" }, children: r.carrierName || "—" }),
          r.carrierId && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem", color: "#6b7280" }, children: "Registered" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", fontFamily: r.carrierLicence ? "monospace" : "inherit", fontSize: r.carrierLicence ? "0.8rem" : "inherit" }, children: r.carrierLicence || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", fontSize: "0.75rem" }, children: r.carrierRegistrationType || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.destinationSite || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: r.wasteTransferNote ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: "#dcfce7", color: "#166534", border: "none", fontFamily: "monospace", fontSize: "0.72rem" }, children: r.wasteTransferNote }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db", fontSize: "0.75rem" }, children: "None" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.5rem", textAlign: "center" }, children: r.receiptPhotoPath ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "a",
          {
            href: viewAttachmentUrl(r.receiptPhotoPath),
            target: "_blank",
            rel: "noreferrer",
            title: "View attached receipt / WTN scan",
            style: { display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 5, padding: "3px 7px", color: "#1d4ed8", gap: 4, fontSize: "0.72rem" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { size: 11 }),
              " View"
            ]
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#e5e7eb", fontSize: "0.72rem" }, children: "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewRecord(r), style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }, title: "View", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 13 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteId(r.id), style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }, title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) }),
          !r.wasteTransferNote && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setRaiseTaskFor(r), style: { background: "none", border: "none", cursor: "pointer", color: "#f59e0b", padding: 4 }, title: "Raise Task — missing WTN", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { size: 13 }) })
        ] }) })
      ] }, r.id)) })
    ] }) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 560 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Waste Disposal Record" }) }),
      (() => {
        const r = viewRecord;
        const fmt2 = (d) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
        const F = ({ label, value }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 2 }, children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.875rem", color: value ? "#111827" : "#d1d5db" }, children: value || "—" })
        ] });
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gap: 14 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Disposal Date", value: fmt2(r.disposalDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Waste Type", value: r.wasteType })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "EWC Code", value: r.ewcCode }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Weight (tonnes)", value: r.weightTonnes != null ? String(r.weightTonnes) : null })
          ] }),
          (r.sourceDescription || r.collectionBuildingName) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Source / Origin", value: r.sourceDescription }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Collection Point", value: r.collectionBuildingName })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Carrier", value: r.carrierName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Carrier Licence", value: r.carrierLicence })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Registration Type", value: r.carrierRegistrationType }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Waste Transfer Note", value: r.wasteTransferNote })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Destination Site", value: r.destinationSite }),
          r.notes && /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Notes", value: r.notes })
        ] });
      })(),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewRecord(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
          const r = viewRecord;
          setViewRecord(null);
          openEdit(r);
        }, children: "Edit Record" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen, onOpenChange: (o) => {
      if (!o) {
        setAddOpen(false);
        setEditRecord(null);
        setForm(emptyForm);
        setSelectedFile(null);
        resetEaSearch();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 620 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editRecord ? "Edit Waste Record" : "Add Waste Disposal Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Disposal Date ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.disposalDate, onChange: (e) => setForm((f) => ({ ...f, disposalDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity / Volume" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. 50 bags, 200 litres, 0.5 tonnes", value: form.quantity, onChange: (e) => setForm((f) => ({ ...f, quantity: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Waste Type ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              OtherSelect,
              {
                options: WASTE_TYPES_WITH_EWC.map((w) => w.label),
                value: form.wasteType,
                onValueChange: onWasteTypeChange,
                placeholder: "Select waste type...",
                specifyPlaceholder: "Please specify waste type…"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "EWC Code" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. 02 01 04", value: form.ewcCode, onChange: (e) => setForm((f) => ({ ...f, ewcCode: e.target.value })), style: { fontFamily: "monospace" } }),
              form.ewcCode?.includes("*") && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#991b1b", fontSize: "0.75rem", whiteSpace: "nowrap" }, children: "⚠ Hazardous" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Disposal Method ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.disposalMethod, onValueChange: (v) => setForm((f) => ({ ...f, disposalMethod: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: DISPOSAL_METHODS.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m, children: m }, m)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { borderTop: "1px solid #f3f4f6", paddingTop: "0.75rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }, children: "Origin & Collection Location" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Source / Origin" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: form.sourceDescription,
                  onChange: (e) => setForm((f) => ({ ...f, sourceDescription: e.target.value })),
                  placeholder: "e.g. Main workshop oil drain, Cattle shed sharps bin"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.68rem", color: "#9ca3af", marginTop: 3 }, children: "Where on the holding this waste was generated" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Collection / Transfer Point" }),
              farmLocations.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.collectionBuildingId || "__none__", onValueChange: (v) => setForm((f) => ({ ...f, collectionBuildingId: v === "__none__" ? "" : v })), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select building or area…" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not specified —" }),
                    farmLocations.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(l.id), children: l.name }, l.id))
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.68rem", color: "#9ca3af", marginTop: 3 }, children: "Where the carrier collects from on the holding" })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { disabled: true, placeholder: "Add buildings in Farm Buildings & Areas to use this picker", style: { background: "#f9fafb", fontSize: "0.8rem" } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.68rem", color: "#9ca3af", marginTop: 3 }, children: "Register farm buildings to enable this picker" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { borderTop: "1px solid #f3f4f6", paddingTop: "0.75rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }, children: "Duty of Care — Carrier Details" }),
            wasteCarriers.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 6 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => setCarrierMode("registered"),
                  style: { fontSize: "0.72rem", padding: "2px 8px", borderRadius: 4, border: `1px solid ${carrierMode === "registered" ? "#1d4ed8" : "#e5e7eb"}`, background: carrierMode === "registered" ? "#eff6ff" : "#fff", color: carrierMode === "registered" ? "#1d4ed8" : "#6b7280", cursor: "pointer" },
                  children: "Registered carrier"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => {
                    setCarrierMode("manual");
                    setForm((f) => ({ ...f, carrierId: "" }));
                  },
                  style: { fontSize: "0.72rem", padding: "2px 8px", borderRadius: 4, border: `1px solid ${carrierMode === "manual" ? "#1d4ed8" : "#e5e7eb"}`, background: carrierMode === "manual" ? "#eff6ff" : "#fff", color: carrierMode === "manual" ? "#1d4ed8" : "#6b7280", cursor: "pointer" },
                  children: "Enter manually"
                }
              )
            ] })
          ] }),
          carrierMode === "registered" && wasteCarriers.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Select Waste Carrier" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.carrierId?.toString() || "", onValueChange: onCarrierSelect, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Choose from registered carriers..." }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: wasteCarriers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: s.id.toString(), children: [
                  s.name,
                  s.accountNumber ? ` — ${s.accountNumber}` : ""
                ] }, s.id)) })
              ] }),
              wasteCarriers.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#9ca3af", marginTop: 4 }, children: 'Add suppliers with category "Waste Carrier" to enable this picker.' })
            ] }),
            form.carrierId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Carrier Name (from record)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.carrierName, readOnly: true, style: { background: "#f9fafb" } })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "EA Registration No." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.carrierLicence, onChange: (e) => setForm((f) => ({ ...f, carrierLicence: e.target.value })), style: { fontFamily: "monospace" }, placeholder: "e.g. CBDU01234" })
              ] })
            ] })
          ] }) : (
            /* EA live register typeahead — used when no registered carriers or in manual mode */
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "0.75rem" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { style: { margin: 0 }, children: "Carrier Company Name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.68rem", color: "#0284c7", fontWeight: 500 }, children: "🔍 Live EA Register" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { style: { display: "block", marginBottom: 4 }, children: "EA Registration No." }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "relative" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      value: carrierQuery,
                      onChange: (e) => {
                        setCarrierQuery(e.target.value);
                        setForm((f) => ({ ...f, carrierName: e.target.value }));
                        setCarrierDropOpen(true);
                      },
                      onFocus: () => {
                        if (carrierResults.length > 0) setCarrierDropOpen(true);
                      },
                      onBlur: () => setTimeout(() => setCarrierDropOpen(false), 150),
                      placeholder: "Type to search EA Waste Carrier Register…"
                    }
                  ),
                  carrierLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: "0.75rem" }, children: "searching…" }),
                  carrierDropOpen && carrierQuery.length >= 3 && !carrierLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { position: "absolute", top: "calc(100% + 2px)", left: 0, right: 0, zIndex: 1e3, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 8px 32px rgba(0,0,0,0.13)", overflow: "hidden", maxHeight: 230, overflowY: "auto" }, children: carrierResults.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: "0.625rem 0.875rem", fontSize: "0.8rem", color: "#6b7280" }, children: "No carriers found — enter details manually below" }) : carrierResults.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      type: "button",
                      onMouseDown: () => {
                        const regType = c.tier === "upper" ? "Upper Tier Carrier" : c.tier === "lower" ? "Lower Tier Carrier" : c.type || "";
                        setForm((f) => ({ ...f, carrierName: c.name, carrierLicence: c.regNumber, carrierRegistrationType: regType }));
                        setCarrierQuery(c.name);
                        setCarrierDropOpen(false);
                      },
                      style: { display: "block", width: "100%", textAlign: "left", padding: "0.5rem 0.875rem", background: "none", border: "none", cursor: "pointer", borderBottom: i < carrierResults.length - 1 ? "1px solid #f3f4f6" : "none" },
                      onMouseEnter: (e) => {
                        e.currentTarget.style.background = "#f8fafc";
                      },
                      onMouseLeave: (e) => {
                        e.currentTarget.style.background = "none";
                      },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 600, fontSize: "0.875rem", color: "#111827" }, children: c.name }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.72rem", color: "#6b7280", marginTop: 1 }, children: [
                          c.regNumber && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontFamily: "monospace", color: "#0284c7", marginRight: 8 }, children: c.regNumber }),
                          c.tier && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                            c.tier === "upper" ? "Upper tier" : c.tier === "lower" ? "Lower tier" : c.tier,
                            " carrier"
                          ] }),
                          c.address && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { marginLeft: 6 }, children: [
                            "· ",
                            c.address
                          ] })
                        ] })
                      ]
                    },
                    i
                  )) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.68rem", color: "#9ca3af", marginTop: 3 }, children: "England · EA Waste Carrier, Broker & Dealer Register" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    placeholder: "e.g. CBDU01234",
                    value: form.carrierLicence,
                    onChange: (e) => setForm((f) => ({ ...f, carrierLicence: e.target.value })),
                    style: { fontFamily: "monospace", background: form.carrierLicence && form.carrierName === carrierQuery ? "#f0f9ff" : void 0 }
                  }
                ),
                form.carrierLicence && form.carrierName === carrierQuery && carrierQuery.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.68rem", color: "#0284c7", marginTop: 3 }, children: "✓ Auto-filled from EA register" })
              ] })
            ] })
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: "0.75rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Carrier Registration Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.carrierRegistrationType, onValueChange: (v) => setForm((f) => ({ ...f, carrierRegistrationType: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CARRIER_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "0.75rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { style: { margin: 0 }, children: "Destination / Permitted Site" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.68rem", color: "#0284c7", fontWeight: 500 }, children: "🔍 EA Register" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { style: { display: "block", marginBottom: 4 }, children: "Waste Transfer Note No." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "relative" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: siteQuery,
                  onChange: (e) => {
                    setSiteQuery(e.target.value);
                    setForm((f) => ({ ...f, destinationSite: e.target.value }));
                    setSiteDropOpen(true);
                  },
                  onFocus: () => {
                    if (siteResults.length > 0) setSiteDropOpen(true);
                  },
                  onBlur: () => setTimeout(() => setSiteDropOpen(false), 150),
                  placeholder: "Type to search permitted waste sites…"
                }
              ),
              siteLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: "0.75rem" }, children: "searching…" }),
              siteDropOpen && siteQuery.length >= 3 && !siteLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { position: "absolute", top: "calc(100% + 2px)", left: 0, right: 0, zIndex: 1e3, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 8px 32px rgba(0,0,0,0.13)", overflow: "hidden", maxHeight: 230, overflowY: "auto" }, children: siteResults.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: "0.625rem 0.875rem", fontSize: "0.8rem", color: "#6b7280" }, children: "No permitted sites found — enter site name manually" }) : siteResults.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onMouseDown: () => {
                    const parts = [s.siteName, s.postcode].filter(Boolean);
                    const full = s.permitNumber ? `${parts.join(", ")} — Permit: ${s.permitNumber}` : parts.join(", ");
                    setForm((f) => ({ ...f, destinationSite: full }));
                    setSiteQuery(full);
                    setSiteDropOpen(false);
                  },
                  style: { display: "block", width: "100%", textAlign: "left", padding: "0.5rem 0.875rem", background: "none", border: "none", cursor: "pointer", borderBottom: i < siteResults.length - 1 ? "1px solid #f3f4f6" : "none" },
                  onMouseEnter: (e) => {
                    e.currentTarget.style.background = "#f8fafc";
                  },
                  onMouseLeave: (e) => {
                    e.currentTarget.style.background = "none";
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 600, fontSize: "0.875rem", color: "#111827" }, children: s.siteName }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.72rem", color: "#6b7280", marginTop: 1 }, children: [
                      s.permitNumber && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontFamily: "monospace", color: "#0284c7", marginRight: 8 }, children: s.permitNumber }),
                      s.postcode && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: s.postcode }),
                      s.operator && s.operator !== s.siteName && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { marginLeft: 6 }, children: [
                        "· ",
                        s.operator
                      ] }),
                      s.siteType && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { marginLeft: 6, color: "#9ca3af" }, children: [
                        "· ",
                        s.siteType
                      ] })
                    ] })
                  ]
                },
                i
              )) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.68rem", color: "#9ca3af", marginTop: 3 }, children: "England · EA Waste Operations Permitted Sites Register" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. WTN-2025-001", value: form.wasteTransferNote, onChange: (e) => setForm((f) => ({ ...f, wasteTransferNote: e.target.value })), style: { fontFamily: "monospace" } }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Additional information, collection reference, driver details...", value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { borderTop: "1px solid #f3f4f6", paddingTop: "0.75rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }, children: "Carrier Receipt / WTN Scan" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.5rem" }, children: "Attach a photo or scan of the paper Waste Transfer Note or carrier receipt handed over at collection." }),
          form.receiptPhotoPath && !selectedFile && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, padding: "0.5rem 0.75rem", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, marginBottom: "0.5rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { size: 14, color: "#16a34a" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8rem", color: "#166534", flex: 1 }, children: "Receipt already attached" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "a",
              {
                href: viewAttachmentUrl(form.receiptPhotoPath),
                target: "_blank",
                rel: "noreferrer",
                style: { fontSize: "0.75rem", color: "#1d4ed8", display: "flex", alignItems: "center", gap: 3 },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 12 }),
                  " View"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setForm((f) => ({ ...f, receiptPhotoPath: null })),
                style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex", alignItems: "center" },
                title: "Remove attachment",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 })
              }
            )
          ] }),
          selectedFile && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, padding: "0.5rem 0.75rem", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 6, marginBottom: "0.5rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { size: 14, color: "#1d4ed8" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8rem", color: "#1e40af", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: selectedFile.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.72rem", color: "#6b7280" }, children: [
              (selectedFile.size / 1024).toFixed(0),
              " KB"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => {
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                },
                style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex", alignItems: "center" },
                title: "Remove",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 })
              }
            )
          ] }),
          !selectedFile && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                ref: fileInputRef,
                type: "file",
                accept: "image/*,.pdf",
                style: { display: "none" },
                onChange: (e) => {
                  const f = e.target.files?.[0] ?? null;
                  setSelectedFile(f);
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                type: "button",
                variant: "outline",
                size: "sm",
                onClick: () => fileInputRef.current?.click(),
                style: { display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 13 }),
                  form.receiptPhotoPath ? "Replace receipt" : "Attach photo / PDF"
                ]
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setAddOpen(false);
          setEditRecord(null);
          setForm(emptyForm);
          setSelectedFile(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleSave, disabled: !form.disposalDate || !form.wasteType || !form.disposalMethod || saveMut.isPending || uploading, children: uploading ? "Uploading…" : saveMut.isPending ? "Saving…" : editRecord ? "Save Changes" : "Save Record" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: reportOpen, onOpenChange: setReportOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 900, maxHeight: "90vh", overflow: "auto" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Duty of Care Register — Print Report" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 12, alignItems: "flex-end" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date from" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: reportFrom, onChange: (e) => setReportFrom(e.target.value), style: { width: 160 } })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date to" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: reportTo, onChange: (e) => setReportTo(e.target.value), style: { width: 160 } })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.8rem", color: "#6b7280", paddingBottom: 6 }, children: [
            reportRecords.length,
            " record",
            reportRecords.length !== 1 ? "s" : "",
            " in this period"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: printRef, style: { border: "1px solid #e5e7eb", borderRadius: 8, padding: "1.5rem", background: "#fff", fontSize: "0.8rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { style: { fontSize: "1.1rem", fontWeight: 700, marginBottom: 4 }, children: "Waste Disposal — Duty of Care Register" }),
          farmRecord && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#111827", marginBottom: 2 }, children: [
            farmRecord.name,
            farmRecord.cphNumber ? ` · CPH: ${farmRecord.cphNumber}` : "",
            farmRecord.redTractorId ? ` · Red Tractor ID: ${farmRecord.redTractorId}` : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.75rem", color: "#6b7280", marginBottom: 12 }, children: [
            "Period: ",
            fmtFull(reportFrom),
            " to ",
            fmtFull(reportTo),
            "  ·  Printed: ",
            (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 16, marginBottom: 12 }, children: [
            { label: "Total Movements", value: reportRecords.length },
            { label: "Hazardous Loads", value: hazardCount },
            { label: "WTNs Recorded", value: wtnCount },
            { label: "Unique Carriers", value: uniqueCarriers }
          ].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { border: "1px solid #e5e7eb", borderRadius: 6, padding: "0.375rem 0.75rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.65rem", color: "#9ca3af", textTransform: "uppercase" }, children: s.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 700, fontSize: "1rem" }, children: s.value })
          ] }, s.label)) }),
          reportRecords.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#9ca3af", textAlign: "center", padding: "2rem" }, children: "No records in this date range." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.72rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f3f4f6" }, children: ["Date", "Waste Type", "EWC Code", "Quantity", "Disposal Method", "Carrier Company", "EA Reg. No.", "Carrier Type", "Destination Site", "WTN Ref.", "Receipt"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { border: "1px solid #d1d5db", padding: "4px 6px", textAlign: "left", fontWeight: 600, fontSize: "0.68rem" }, children: h }, h)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: reportRecords.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { background: i % 2 === 0 ? "#fff" : "#fafafa" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { border: "1px solid #e5e7eb", padding: "4px 6px", whiteSpace: "nowrap" }, children: fmt(r.disposalDate) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { border: "1px solid #e5e7eb", padding: "4px 6px" }, children: r.wasteType || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { border: "1px solid #e5e7eb", padding: "4px 6px", fontFamily: "monospace", color: r.ewcCode?.includes("*") ? "#991b1b" : "#374151", fontWeight: r.ewcCode?.includes("*") ? 600 : "normal" }, children: r.ewcCode || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { border: "1px solid #e5e7eb", padding: "4px 6px" }, children: r.quantity || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { border: "1px solid #e5e7eb", padding: "4px 6px" }, children: r.disposalMethod || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { border: "1px solid #e5e7eb", padding: "4px 6px", fontWeight: 500 }, children: r.carrierName || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { border: "1px solid #e5e7eb", padding: "4px 6px", fontFamily: "monospace", fontSize: "0.65rem" }, children: r.carrierLicence || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { border: "1px solid #e5e7eb", padding: "4px 6px" }, children: r.carrierRegistrationType || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { border: "1px solid #e5e7eb", padding: "4px 6px" }, children: r.destinationSite || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { border: "1px solid #e5e7eb", padding: "4px 6px", fontFamily: "monospace", fontSize: "0.65rem" }, children: r.wasteTransferNote || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { border: "1px solid #e5e7eb", padding: "4px 6px", textAlign: "center", color: r.receiptPhotoPath ? "#166534" : "#9ca3af" }, children: r.receiptPhotoPath ? "Yes" : "—" })
            ] }, r.id)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 24, borderTop: "1px solid #e5e7eb", paddingTop: 12 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#6b7280", marginBottom: 16 }, children: "This register is produced in accordance with the Environmental Protection Act 1990 (Duty of Care) and the Waste (England and Wales) Regulations 2011. Records must be retained for a minimum of 2 years (3 years for hazardous waste consignments marked *). This document should be made available to the Environment Agency, Red Tractor assessors, or other authorised inspecting bodies on request." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 48, marginTop: 8 }, children: [{ label: "Farm Manager / Responsible Person", sub: "Name (print):" }, { label: "Signature", sub: "" }, { label: "Date", sub: "" }].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#374151" }, children: s.label }),
              s.sub && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#9ca3af", marginTop: 2 }, children: s.sub }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { borderBottom: "1px solid #374151", marginTop: 24 } })
            ] }, s.label)) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setReportOpen(false), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handlePrint, disabled: reportRecords.length === 0, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14, className: "mr-1" }),
          "Print / Save as PDF"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) setDeleteId(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Waste Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "Are you sure you want to delete this waste disposal record?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteId !== null && deleteMut.mutate(deleteId), disabled: deleteMut.isPending, children: "Delete" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      RaiseTaskDialog,
      {
        farmId,
        open: !!raiseTaskFor,
        onClose: () => setRaiseTaskFor(null),
        defaultTitle: raiseTaskFor ? `Obtain Waste Transfer Note — ${raiseTaskFor.wasteType} (${fmt(raiseTaskFor.disposalDate)})` : "",
        defaultDescription: raiseTaskFor ? `Disposal on ${fmt(raiseTaskFor.disposalDate)} via ${raiseTaskFor.disposalMethod || "unknown method"}. Carrier: ${raiseTaskFor.carrierName || "not recorded"}. WTN missing — required for Duty of Care compliance.` : "",
        module: "waste"
      }
    )
  ] }) });
}
export {
  WasteDisposalPage as default
};
