import { s as createLucideIcon, a1 as useListEquipment, c as useQueryClient, a2 as useCreateEquipment, a3 as getListEquipmentQueryKey, b as useAppStore, r as reactExports, a as useToast, m as useQuery, S as useMutation, j as jsxRuntimeExports, R as Redirect, I as Input, d as Button, z as Dialog, Y as DialogTrigger, T as Plus, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, N as DialogMutationError, J as DialogFooter, e as LoaderCircle, H as DialogDescription, X } from "./index--RDxgHeZ.js";
import { u as usePersistedTab } from "./use-persisted-tab-vv2NTgOl.js";
import { a as usePersistedFilter } from "./use-persisted-filter-CP6NfC_s.js";
import { A as AppLayout, d as Wrench, e as ChartColumn, c as ClipboardList, R as RotateCcw, u as useUserRole } from "./AppLayout-ByvIcI2Y.js";
import { Q as QRCodeSVG } from "./index-DlaeIAVm.js";
import { p as printProReport, o as openPrintWindow } from "./print-report-ClU8-1P0.js";
import { T as Textarea } from "./textarea-DnBXF01l.js";
import { D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, c as DropdownMenuItem } from "./dropdown-menu-DybeRjf7.js";
import { T as TabBar, a as TabButton } from "./tab-button-DHBcM42S.js";
import { R as RaiseTaskDialog } from "./RaiseTaskDialog-CkPnA8Gm.js";
import { R as RecordAttachments } from "./RecordAttachments-6vEKTlVy.js";
import { u as useForm } from "./index.esm-l2RhUqu5.js";
import { E as EQUIPMENT_TYPES } from "./equipmentTypes-DkOagSn9.js";
import { S as Search } from "./search-C0dvsUV-.js";
import { E as EyeOff } from "./eye-off-BwXcd2HP.js";
import { E as Eye } from "./eye-BoSn9B7c.js";
import { P as Printer } from "./printer-BTKq8Lft.js";
import { Q as QrCode } from "./qr-code-DvYRmgGs.js";
import { T as Tractor } from "./tractor-qoZVciyB.js";
import { C as ChevronDown, T as Trash2 } from "./trash-2-BTblqQ9f.js";
import { P as Pencil } from "./pencil-DZCpIO8A.js";
import { T as TriangleAlert } from "./triangle-alert-ShRJ-Swk.js";
import { C as CircleCheck } from "./circle-check-vElB3ACz.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, B as Bar, C as Cell } from "./generateCategoricalChart-Qn6WESqj.js";
import { B as BarChart } from "./BarChart-gXw2yKaq.js";
import { C as CartesianGrid } from "./CartesianGrid-C78ie3yM.js";
import { P as PieChart, a as Pie } from "./PieChart-DPVrkZ1M.js";
import { C as Camera } from "./camera-Bdp_kiFI.js";
import "./use-safe-clerk-B1DvtNOD.js";
import "./database-45RVQtCz.js";
import "./shield-alert-CQ0_UDlT.js";
import "./shield-check-CAU7U2dm.js";
import "./index-Y_cAhWHS.js";
import "./index-BstaApbT.js";
import "./index-SmbaQP4e.js";
import "./circle-GyND8oTu.js";
import "./select-CZD3WD3n.js";
import "./chevron-up-DGVaQAaQ.js";
import "./use-upload-Cie2jqzm.js";
import "./paperclip-TFkeBcwX.js";
import "./upload-LasA3qiW.js";
import "./image-CF_8tXPC.js";
import "./download-DQxavwWc.js";
const __iconNode$2 = [
  [
    "path",
    {
      d: "M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14",
      key: "e7tb2h"
    }
  ],
  ["path", { d: "m7.5 4.27 9 5.15", key: "1c824w" }],
  ["polyline", { points: "3.29 7 12 12 20.71 7", key: "ousv84" }],
  ["line", { x1: "12", x2: "12", y1: "22", y2: "12", key: "a4e8g8" }],
  ["path", { d: "m17 13 5 5m-5 0 5-5", key: "im3w4b" }]
];
const PackageX = createLucideIcon("package-x", __iconNode$2);
const __iconNode$1 = [["path", { d: "M2 20h.01", key: "4haj6o" }]];
const SignalZero = createLucideIcon("signal-zero", __iconNode$1);
const __iconNode = [
  ["path", { d: "M2 20h.01", key: "4haj6o" }],
  ["path", { d: "M7 20v-4", key: "j294jx" }],
  ["path", { d: "M12 20v-8", key: "i3yub9" }],
  ["path", { d: "M17 20V8", key: "1tkaf5" }],
  ["path", { d: "M22 4v16", key: "sih9yq" }]
];
const Signal = createLucideIcon("signal", __iconNode);
function useEquipment(farmId) {
  return useListEquipment(farmId, {
    query: {
      enabled: !!farmId
    }
  });
}
function useAddEquipment(farmId) {
  const queryClient = useQueryClient();
  return useCreateEquipment({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListEquipmentQueryKey(farmId) });
      }
    }
  });
}
const DISPOSAL_METHODS = [
  { value: "sold", label: "Sold", color: "#1d4ed8", bg: "#dbeafe" },
  { value: "scrapped", label: "Scrapped", color: "#7c3aed", bg: "#ede9fe" },
  { value: "part_exchange", label: "Part Exchange", color: "#0891b2", bg: "#cffafe" },
  { value: "stolen", label: "Stolen / Lost", color: "#dc2626", bg: "#fee2e2" },
  { value: "transferred", label: "Transferred to Another Holding", color: "#b45309", bg: "#fef3c7" },
  { value: "other", label: "Other", color: "#4b5563", bg: "#f3f4f6" }
];
const EMPTY_DISPOSE_FORM = {
  disposalMethod: "sold",
  disposalDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
  disposalPrice: "",
  disposalBuyerOrContractor: "",
  wasteTransferNoteRef: "",
  disposalNotes: ""
};
const OPERATIONAL_STATUSES = [
  { value: "active", label: "Operational" },
  { value: "broken", label: "Broken Down" },
  { value: "in-service", label: "In Service (Scheduled Maintenance)" }
];
const MAINT_TYPES = [
  { value: "mot", label: "MOT Test", color: "#1d4ed8", bg: "#dbeafe" },
  { value: "annual_service", label: "Annual / Full Service", color: "#065f46", bg: "#d1fae5" },
  { value: "interim_service", label: "Interim / Oil Service", color: "#6d28d9", bg: "#ede9fe" },
  { value: "repair", label: "Repair", color: "#c2410c", bg: "#ffedd5" },
  { value: "inspection", label: "Safety Inspection", color: "#92400e", bg: "#fef3c7" },
  { value: "pre_use_check", label: "Pre-Use Check", color: "#374151", bg: "#f3f4f6" },
  { value: "warranty_work", label: "Warranty Work", color: "#0e7490", bg: "#cffafe" },
  { value: "other", label: "Other", color: "#4b5563", bg: "#f9fafb" }
];
const EMPTY_SERVICE_FORM = { maintenanceType: "annual_service", description: "", performedBy: "", performedDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), nextDueDate: "", costPence: "", partsUsed: "", notes: "" };
function fmt(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function dueStatus(dateStr) {
  if (!dateStr) return { label: "—", color: "#6b7280", bg: "#f9fafb" };
  const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 864e5);
  if (days < 0) return { label: `Overdue (${Math.abs(days)}d ago)`, color: "#991b1b", bg: "#fee2e2" };
  if (days <= 30) return { label: `Due in ${days}d`, color: "#92400e", bg: "#fef3c7" };
  if (days <= 90) return { label: `Due in ${days}d`, color: "#92400e", bg: "#fef9c3" };
  return { label: fmt(dateStr), color: "#166534", bg: "#dcfce7" };
}
const MAX_PHOTOS = 5;
function parsePhotos(raw) {
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
function PhotoUploader({
  photos,
  onChange
}) {
  const inputRef = reactExports.useRef(null);
  const handleFiles = (files) => {
    if (!files) return;
    const remaining = MAX_PHOTOS - photos.length;
    const toProcess = Array.from(files).slice(0, remaining);
    toProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result;
        onChange([...photos, dataUrl]);
      };
      reader.readAsDataURL(file);
    });
  };
  const remove = (i) => onChange(photos.filter((_, idx) => idx !== i));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mb-2", children: [
      photos.map((src, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-20 h-20 rounded-lg overflow-hidden border border-border group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src, alt: `Photo ${i + 1}`, className: "w-full h-full object-cover" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => remove(i),
            className: "absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3 h-3 text-white" })
          }
        )
      ] }, i)),
      photos.length < MAX_PHOTOS && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => inputRef.current?.click(),
          className: "w-20 h-20 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-foreground/40 hover:text-primary/60 transition-colors",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "w-5 h-5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: "Add" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/40", children: [
      "Up to ",
      MAX_PHOTOS,
      " photos. JPG, PNG accepted."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        ref: inputRef,
        type: "file",
        accept: "image/jpeg,image/png,image/webp",
        multiple: true,
        className: "hidden",
        onChange: (e) => handleFiles(e.target.files)
      }
    )
  ] });
}
const LABEL_CSS = `
  @page{size:62mm 90mm;margin:0}
  body{font-family:'Segoe UI',Arial,sans-serif;padding:10px 12px;text-align:center;background:#fff;margin:0}
  .brand{font-size:9px;color:#0f766e;font-weight:700;letter-spacing:.06em;margin-bottom:3px}
  .divider{border:none;border-top:1px solid #e5e7eb;margin:4px 0}
  .farm{font-size:12px;font-weight:700;color:#111827;text-transform:uppercase;letter-spacing:.05em;margin:4px 0 6px}
  svg{display:block;margin:0 auto}
  .code{font-family:monospace;font-size:17px;font-weight:700;color:#0f766e;margin-top:7px;letter-spacing:.1em}
  .iname{font-size:11px;font-weight:600;color:#374151;margin-top:3px}
  .desc{font-size:9px;color:#9ca3af;margin-top:2px}
  .hint{font-size:8px;color:#d1d5db;margin-top:4px}
`;
function equipAssetNumber(equip) {
  return equip.assetNumber || `EQ-${String(equip.id).padStart(4, "0")}`;
}
function EquipQRDialog({ equip, farmId, farmName, onClose }) {
  const an = equipAssetNumber(equip);
  const qrValue = `BDE:F${farmId}:${an}`;
  const printRef = reactExports.useRef(null);
  function handlePrint() {
    if (!printRef.current) return;
    openPrintWindow(`<html><head><title>Asset Label — ${an}</title><style>${LABEL_CSS}</style></head><body>${printRef.current.innerHTML}</body></html>`);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "22rem" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Asset QR Label" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1.5 py-2 border rounded-xl bg-white px-5 shadow-sm", ref: printRef, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "brand text-[11px] font-bold text-teal-700 tracking-widest mt-1", children: "🌿 BDE Farm Trac" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("hr", { className: "divider w-full border-gray-200" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "farm text-sm font-bold text-gray-900 uppercase tracking-wider", children: farmName }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(QRCodeSVG, { value: qrValue, size: 180, bgColor: "#ffffff", fgColor: "#0f766e", level: "M" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "code font-mono text-xl font-bold tracking-widest text-teal-700 mt-1", children: an }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "iname text-sm font-semibold text-gray-700", children: equip.name ?? "Equipment" }),
      (equip.make || equip.model) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "desc text-xs text-gray-400", children: [equip.make, equip.model].filter(Boolean).join(" · ") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "hint text-[10px] text-gray-300 mb-1", children: "Scan to view equipment record" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Close" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handlePrint, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-4 w-4 mr-1" }),
        "Print Label"
      ] })
    ] })
  ] }) });
}
const DEFECT_EMPTY = { equipmentId: "", description: "", severity: "medium", reportedDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), reportedBy: "", notes: "" };
const SEVERITY_COLORS = {
  low: "text-blue-700 bg-blue-50 border-blue-200",
  medium: "text-amber-700 bg-amber-50 border-amber-200",
  high: "text-orange-700 bg-orange-50 border-orange-200",
  critical: "text-red-700 bg-red-50 border-red-200"
};
function EquipmentDefectsSection({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { displayName } = useUserRole();
  const [statusFilter, setStatusFilter] = usePersistedFilter({ page: "equipment-defects", filter: "status", farmId, defaultValue: "all" });
  const [formOpen, setFormOpen] = reactExports.useState(false);
  const [updatingId, setUpdatingId] = reactExports.useState(null);
  const emptyDefectForm = reactExports.useMemo(() => ({ ...DEFECT_EMPTY, reportedBy: displayName ?? "" }), [displayName]);
  const [form, setForm] = reactExports.useState(() => ({ ...DEFECT_EMPTY, reportedBy: "" }));
  reactExports.useEffect(() => {
    if (formOpen && !form.reportedBy && displayName) setForm((f) => ({ ...f, reportedBy: displayName }));
  }, [formOpen, displayName]);
  const [raiseTaskDefect, setRaiseTaskDefect] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const equipQ = useQuery({
    queryKey: ["equipment-for-defects", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/equipment`, { credentials: "include" }).then((r) => r.json())
  });
  const defectQ = useQuery({
    queryKey: ["equipment-defects", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/equipment-defect-reports`, { credentials: "include" }).then((r) => r.json())
  });
  const equipList = equipQ.data?.records ?? [];
  const allDefects = defectQ.data?.records ?? [];
  const createM = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/equipment-defect-reports`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["equipment-defects", farmId] });
      setFormOpen(false);
      setForm(emptyDefectForm);
      toast({ title: "Defect report created" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const patchM = useMutation({
    mutationFn: ({ id, status }) => fetch(`/api/farms/${farmId}/equipment-defect-reports/${id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ status }) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["equipment-defects", farmId] });
      setUpdatingId(null);
      toast({ title: "Status updated" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const openCount = allDefects.filter((d) => d.status === "open").length;
  const inProgressCount = allDefects.filter((d) => d.status === "in_progress").length;
  const resolvedCount = allDefects.filter((d) => d.status === "resolved").length;
  const criticalCount = allDefects.filter((d) => d.severity === "critical" && d.status !== "resolved").length;
  const filtered = allDefects.filter((d) => statusFilter === "all" || d.status === statusFilter);
  function handleSubmit(e) {
    e.preventDefault();
    createM.mutate({
      equipmentId: form.equipmentId ? Number(form.equipmentId) : null,
      description: form.description,
      severity: form.severity || "medium",
      status: "open",
      reportedDate: form.reportedDate ? new Date(form.reportedDate).toISOString() : null,
      reportedBy: form.reportedBy || null,
      notes: form.notes || null
    });
  }
  const statusLabel = (s) => ({ open: "Open", in_progress: "In Progress", resolved: "Resolved" })[s] ?? s;
  const statusClass = (s) => ({ open: "text-red-700 bg-red-50 border-red-200", in_progress: "text-amber-700 bg-amber-50 border-amber-200", resolved: "text-green-700 bg-green-50 border-green-200" })[s] ?? "text-foreground/60 bg-foreground/5 border-border";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    criticalCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5 border border-red-200 bg-red-50 rounded-xl px-4 py-3 flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-red-800", children: [
          criticalCount,
          " critical defect",
          criticalCount !== 1 ? "s" : "",
          " outstanding — equipment may be unsafe to operate"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-700 mt-0.5", children: "Critical defects must be resolved before the equipment is used. Tag equipment out of service until repaired." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { className: "mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: statusFilter === "all", onClick: () => setStatusFilter("all"), children: [
        "All ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-xs opacity-60", children: [
          "(",
          allDefects.length,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: statusFilter === "open", onClick: () => setStatusFilter("open"), children: [
        "Open ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-xs opacity-60", children: [
          "(",
          openCount,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: statusFilter === "in_progress", onClick: () => setStatusFilter("in_progress"), children: [
        "In Progress ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-xs opacity-60", children: [
          "(",
          inProgressCount,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: statusFilter === "resolved", onClick: () => setStatusFilter("resolved"), children: [
        "Resolved ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-xs opacity-60", children: [
          "(",
          resolvedCount,
          ")"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
      setForm(emptyDefectForm);
      setFormOpen(true);
    }, className: "gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
      " Report Defect"
    ] }) }),
    defectQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-foreground/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin mx-auto mb-2" }),
      "Loading..."
    ] }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-xl text-center py-16 px-6 bg-white", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-7 h-7 text-green-500" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-semibold text-foreground/80 mb-1", children: statusFilter === "all" ? "No defect reports" : `No ${statusLabel(statusFilter).toLowerCase()} defects` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground/50 text-sm", children: statusFilter === "all" ? "Report equipment faults here. Unresolved defects must be tracked until repaired." : `No defects in this status category.` })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: filtered.map((d) => {
      const equip = equipList.find((e) => e.id === d.equipmentId);
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `bg-white border rounded-xl p-4 shadow-sm border-l-4 ${d.status === "resolved" ? "border-l-green-400" : d.severity === "critical" ? "border-l-red-400" : d.severity === "high" ? "border-l-orange-400" : "border-l-amber-400"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-1", children: [
            d.defectRef && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-foreground/40 bg-foreground/5 px-1.5 py-0.5 rounded", children: d.defectRef }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border ${statusClass(d.status)}`, children: statusLabel(d.status) }),
            d.severity && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border capitalize ${SEVERITY_COLORS[d.severity] ?? "text-foreground/60 bg-foreground/5 border-border"}`, children: d.severity })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: d.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 flex-wrap mt-1 text-xs text-foreground/50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-6 w-6", onClick: () => setViewRecord({ ...d, _type: "defect", _equipName: equip?.name }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
            equip && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: equip.name }),
            d.reportedDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "· Reported ",
              new Date(d.reportedDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
            ] }),
            d.reportedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "· by ",
              d.reportedBy
            ] }),
            d.resolvedDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-green-600", children: [
              "· Resolved ",
              new Date(d.resolvedDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
            ] })
          ] })
        ] }),
        d.status !== "resolved" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-shrink-0 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "gap-1 text-xs text-primary border-primary/30 hover:bg-primary/5", onClick: () => setRaiseTaskDefect(d), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-3 h-3" }),
            "Raise Task"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", disabled: updatingId === d.id, className: "gap-1 text-xs", children: [
              updatingId === d.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3 h-3 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-3 h-3" }),
              "Update"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", children: [
              d.status === "open" && /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { onClick: () => {
                setUpdatingId(d.id);
                patchM.mutate({ id: d.id, status: "in_progress" });
              }, children: "Mark In Progress" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { onClick: () => {
                setUpdatingId(d.id);
                patchM.mutate({ id: d.id, status: "resolved" });
              }, children: "Mark Resolved" })
            ] })
          ] })
        ] })
      ] }) }, d.id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: formOpen, onOpenChange: (o) => {
      if (!o) {
        setFormOpen(false);
        setForm(emptyDefectForm);
        createM.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { className: "w-5 h-5 text-primary" }),
          "Report Equipment Defect"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Log a fault or defect. Critical and high severity defects must be resolved before the equipment is used." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Equipment (optional)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50", value: form.equipmentId, onChange: (e) => setForm((f) => ({ ...f, equipmentId: e.target.value })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "General / unspecified equipment" }),
              equipList.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: e.id, children: e.name }, e.id))
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
              "Description of Defect ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Describe the fault or defect observed...", value: form.description, onChange: (e) => setForm((f) => ({ ...f, description: e.target.value })), required: true, className: "min-h-[80px]" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Severity" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50", value: form.severity, onChange: (e) => setForm((f) => ({ ...f, severity: e.target.value })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "low", children: "Low — monitor, no immediate action needed" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "medium", children: "Medium — repair soon" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "high", children: "High — repair before next use" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "critical", children: "Critical — equipment out of service NOW" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Date Reported" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: form.reportedDate, onChange: (e) => setForm((f) => ({ ...f, reportedDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Reported By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Name of person reporting", value: form.reportedBy, onChange: (e) => setForm((f) => ({ ...f, reportedBy: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Additional notes, repair instructions, contractor details...", value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), className: "min-h-[60px]" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: createM, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => {
            setFormOpen(false);
            setForm(emptyDefectForm);
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: createM.isPending, children: [
            createM.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }),
            "Submit Report"
          ] })
        ] })
      ] })
    ] }) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 540 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { className: "w-4 h-4 text-primary" }),
        "Defect Report ",
        viewRecord.defectRef ? `— ${viewRecord.defectRef}` : ""
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-1 text-sm", children: [
        viewRecord._equipName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase font-semibold tracking-widest text-foreground/40 mb-0.5", children: "Equipment" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewRecord._equipName })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase font-semibold tracking-widest text-foreground/40 mb-0.5", children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground", children: viewRecord.description })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase font-semibold tracking-widest text-foreground/40 mb-0.5", children: "Severity" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${SEVERITY_COLORS[viewRecord.severity ?? "medium"]}`, children: viewRecord.severity ?? "medium" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase font-semibold tracking-widest text-foreground/40 mb-0.5", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewRecord.status })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase font-semibold tracking-widest text-foreground/40 mb-0.5", children: "Reported" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewRecord.reportedDate ? new Date(viewRecord.reportedDate).toLocaleDateString("en-GB") : "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase font-semibold tracking-widest text-foreground/40 mb-0.5", children: "Reported By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewRecord.reportedBy || "—" })
          ] }),
          viewRecord.resolvedDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase font-semibold tracking-widest text-foreground/40 mb-0.5", children: "Resolved" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: new Date(viewRecord.resolvedDate).toLocaleDateString("en-GB") })
          ] })
        ] }),
        viewRecord.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase font-semibold tracking-widest text-foreground/40 mb-0.5", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground", children: viewRecord.notes })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "equipment_defect", recordId: viewRecord.id }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { className: "mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewRecord(null), children: "Close" }) })
    ] }) }),
    raiseTaskDefect && /* @__PURE__ */ jsxRuntimeExports.jsx(
      RaiseTaskDialog,
      {
        farmId,
        open: !!raiseTaskDefect,
        onClose: () => setRaiseTaskDefect(null),
        defaultTitle: `Fix defect: ${raiseTaskDefect.defectRef || "Equipment defect"} — ${equipList.find((e) => e.id === raiseTaskDefect.equipmentId)?.name || "Equipment"}`,
        defaultDescription: raiseTaskDefect.description || "",
        taskType: "equipment_defect",
        module: "Equipment"
      }
    )
  ] });
}
const EQUIP_COLORS = ["#15803d", "#a16207", "#1d4ed8", "#b91c1c", "#7c3aed", "#0e7490"];
function EquipmentAnalyticsTab({ farmId }) {
  const { data: equipRaw } = useQuery({ queryKey: ["equipment-list-analytics", farmId], queryFn: () => fetch(`/api/farms/${farmId}/equipment`, { credentials: "include" }).then((r) => r.json()) });
  const { data: defectsRaw } = useQuery({ queryKey: ["equipment-defects", farmId], queryFn: () => fetch(`/api/farms/${farmId}/equipment-defect-reports`, { credentials: "include" }).then((r) => r.json()) });
  const equipment = reactExports.useMemo(() => equipRaw?.records ?? equipRaw ?? [], [equipRaw]);
  const defects = reactExports.useMemo(() => defectsRaw?.records ?? defectsRaw ?? [], [defectsRaw]);
  const byType = reactExports.useMemo(() => {
    const map = {};
    equipment.forEach((r) => {
      const t = String(r.equipmentType || r.type || "Other");
      map[t] = (map[t] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name: name.length > 14 ? name.slice(0, 13) + "…" : name, count }));
  }, [equipment]);
  const defectBySeverity = reactExports.useMemo(() => {
    const map = {};
    defects.forEach((r) => {
      const s = String(r.severity || r.priority || "Unknown");
      map[s] = (map[s] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [defects]);
  const openDefects = reactExports.useMemo(() => defects.filter((r) => r.status !== "resolved" && r.status !== "closed").length, [defects]);
  const disposed = reactExports.useMemo(() => equipment.filter((r) => r.disposalDate || r.isDisposed || r.status === "disposed").length, [equipment]);
  const noData = equipment.length === 0 && defects.length === 0;
  if (noData) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-muted-foreground text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No data yet" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1", children: "Add equipment or defect reports to see analytics." })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
      { label: "Total Equipment", value: equipment.length, bg: "bg-green-50 border-green-100", text: "text-green-800", sub: "text-green-700" },
      { label: "Active Assets", value: equipment.length - disposed, bg: "bg-blue-50 border-blue-100", text: "text-blue-800", sub: "text-blue-700" },
      { label: "Defect Reports", value: defects.length, bg: "bg-amber-50 border-amber-100", text: "text-amber-800", sub: "text-amber-700" },
      { label: "Open Defects", value: openDefects, bg: openDefects > 0 ? "bg-red-50 border-red-100" : "bg-gray-50 border-gray-100", text: openDefects > 0 ? "text-red-800" : "text-gray-800", sub: openDefects > 0 ? "text-red-700" : "text-gray-700" }
    ].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `${c.bg} rounded-xl border p-4 text-center`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-2xl font-bold ${c.text}`, children: c.value }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs mt-0.5 ${c.sub}`, children: c.label })
    ] }, c.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: [
      byType.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-4", children: "Equipment by Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-52", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: byType, layout: "vertical", margin: { left: 4, right: 24, top: 4, bottom: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", horizontal: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", tick: { fontSize: 10 }, allowDecimals: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "name", tick: { fontSize: 10 }, width: 80 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v}`, "Assets"] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "count", fill: "#15803d", radius: [0, 3, 3, 0] })
        ] }) }) })
      ] }),
      defectBySeverity.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-4", children: "Defects by Severity" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-52", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: defectBySeverity, cx: "50%", cy: "50%", outerRadius: 75, dataKey: "value", label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`, labelLine: false, children: defectBySeverity.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: EQUIP_COLORS[i % EQUIP_COLORS.length] }, i)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v}`, "Defects"] })
        ] }) }) })
      ] })
    ] })
  ] });
}
function EquipmentPage() {
  const { farmId } = useAppStore();
  const targetEquipId = (() => {
    const v = new URLSearchParams(window.location.search).get("equipmentId");
    const n = v ? parseInt(v, 10) : NaN;
    return Number.isFinite(n) && n > 0 ? n : null;
  })();
  const [tab, setTab] = usePersistedTab({ page: "equipment", farmId, validIds: ["equipment", "defects", "analytics"], defaultTab: "equipment", urlOverride: targetEquipId ? "equipment" : null });
  const [highlightEquipId, setHighlightEquipId] = reactExports.useState(null);
  const scrolledToTarget = reactExports.useRef(false);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [isAddOpen, setIsAddOpen] = reactExports.useState(false);
  const [addGpsTracked, setAddGpsTracked] = reactExports.useState(false);
  const [editGpsTracked, setEditGpsTracked] = reactExports.useState(false);
  const [managingItem, setManagingItem] = reactExports.useState(null);
  const [manageTab, setManageTab] = reactExports.useState("details");
  const [compForm, setCompForm] = reactExports.useState({});
  const [compSaving, setCompSaving] = reactExports.useState(false);
  const [addPhotos, setAddPhotos] = reactExports.useState([]);
  const [editPhotos, setEditPhotos] = reactExports.useState([]);
  const [printOpen, setPrintOpen] = reactExports.useState(false);
  const [serviceForm, setServiceForm] = reactExports.useState(EMPTY_SERVICE_FORM);
  const [editingLog, setEditingLog] = reactExports.useState(null);
  const [deletingLogId, setDeletingLogId] = reactExports.useState(null);
  const [serviceFormOpen, setServiceFormOpen] = reactExports.useState(false);
  const [showDisposed, setShowDisposed] = reactExports.useState(false);
  const [search, setSearch] = reactExports.useState("");
  const [typeFilter, setTypeFilter] = usePersistedFilter({ page: "equipment", filter: "type", farmId, defaultValue: "" });
  const [gpsFilter, setGpsFilter] = usePersistedFilter({ page: "equipment", filter: "gps", farmId, defaultValue: "all" });
  const [qrItem, setQrItem] = reactExports.useState(null);
  const [disposeItem, setDisposeItem] = reactExports.useState(null);
  const [disposeForm, setDisposeForm] = reactExports.useState(EMPTY_DISPOSE_FORM);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading } = useEquipment(farmId ?? 0);
  const { data: farmData } = useQuery({
    queryKey: ["farm-for-print", farmId],
    queryFn: async () => {
      const r = await fetch(`/api/farms/${farmId}`);
      return r.json();
    },
    enabled: !!farmId
  });
  const farm = farmData?.record;
  const addEquipMut = useAddEquipment(farmId ?? 0);
  const { mutate: createEquip, isPending } = addEquipMut;
  const { register, handleSubmit, reset } = useForm();
  const { register: regEdit, handleSubmit: handleEditSubmit, reset: resetEdit } = useForm();
  const updateMutation = useMutation({
    mutationFn: async ({ id, body }) => {
      const res = await fetch(`/api/farms/${farmId}/equipment/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListEquipmentQueryKey(farmId ?? 0) });
      setManagingItem(null);
      toast({ title: "Equipment updated" });
    },
    onError: () => {
      toast({ title: "Failed to update equipment", variant: "destructive" });
    }
  });
  const disposeMutation = useMutation({
    mutationFn: async ({ id, body }) => {
      const res = await fetch(`/api/farms/${farmId}/equipment/${id}/dispose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error("Failed to record disposal");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListEquipmentQueryKey(farmId ?? 0) });
      setDisposeItem(null);
      setDisposeForm(EMPTY_DISPOSE_FORM);
      toast({ title: "Disposal recorded", description: "The item has been marked as disposed and removed from your active fleet." });
    },
    onError: () => toast({ title: "Failed to record disposal", variant: "destructive" })
  });
  const undoDisposeMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/farms/${farmId}/equipment/${id}/dispose`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to undo disposal");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListEquipmentQueryKey(farmId ?? 0) });
      setManagingItem(null);
      toast({ title: "Disposal reversed", description: "The item has been restored to your active fleet." });
    },
    onError: () => toast({ title: "Failed to undo disposal", variant: "destructive" })
  });
  const assignNumberMutation = useMutation({
    mutationFn: async (item) => {
      const an = `EQ-${String(item.id).padStart(4, "0")}`;
      await fetch(`/api/farms/${farmId}/equipment/${item.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetNumber: an })
      }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: getListEquipmentQueryKey(farmId ?? 0) }),
    onError: () => toast({ title: "Failed to assign asset number", variant: "destructive" })
  });
  const maintQ = useQuery({
    queryKey: ["equipment-maintenance", farmId, managingItem?.id],
    queryFn: () => fetch(`/api/farms/${farmId}/equipment/${managingItem.id}/maintenance`).then((r) => r.json()),
    enabled: !!managingItem && manageTab === "service"
  });
  const maintLogs = maintQ.data?.records ?? [];
  const addMaintMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/equipment/${managingItem.id}/maintenance`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment-maintenance", farmId, managingItem?.id] });
      queryClient.invalidateQueries({ queryKey: getListEquipmentQueryKey(farmId ?? 0) });
      setServiceFormOpen(false);
      setEditingLog(null);
      setServiceForm(EMPTY_SERVICE_FORM);
      toast({ title: "Service record saved" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const editMaintMut = useMutation({
    mutationFn: ({ logId, body }) => fetch(`/api/farms/${farmId}/equipment/${managingItem.id}/maintenance/${logId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment-maintenance", farmId, managingItem?.id] });
      queryClient.invalidateQueries({ queryKey: getListEquipmentQueryKey(farmId ?? 0) });
      setServiceFormOpen(false);
      setEditingLog(null);
      setServiceForm(EMPTY_SERVICE_FORM);
      toast({ title: "Record updated" });
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" })
  });
  const deleteMaintMut = useMutation({
    mutationFn: (logId) => fetch(`/api/farms/${farmId}/equipment/${managingItem.id}/maintenance/${logId}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment-maintenance", farmId, managingItem?.id] });
      queryClient.invalidateQueries({ queryKey: getListEquipmentQueryKey(farmId ?? 0) });
      setDeletingLogId(null);
      toast({ title: "Record deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  const openServiceEdit = (log) => {
    setEditingLog(log);
    setServiceForm({
      maintenanceType: log.maintenanceType,
      description: log.description,
      performedBy: log.performedBy ?? "",
      performedDate: log.performedDate ? new Date(log.performedDate).toISOString().slice(0, 10) : "",
      nextDueDate: log.nextDueDate ? new Date(log.nextDueDate).toISOString().slice(0, 10) : "",
      costPence: log.costPence ? String(log.costPence / 100) : "",
      partsUsed: log.partsUsed ?? "",
      notes: log.notes ?? ""
    });
    setServiceFormOpen(true);
  };
  const submitServiceForm = () => {
    const body = {
      maintenanceType: serviceForm.maintenanceType,
      description: serviceForm.description,
      performedBy: serviceForm.performedBy || null,
      performedDate: serviceForm.performedDate,
      nextDueDate: serviceForm.nextDueDate || null,
      costPence: serviceForm.costPence ? Math.round(parseFloat(serviceForm.costPence) * 100) : null,
      partsUsed: serviceForm.partsUsed || null,
      notes: serviceForm.notes || null
    };
    if (editingLog) {
      editMaintMut.mutate({ logId: editingLog.id, body });
    } else {
      addMaintMut.mutate(body);
    }
  };
  if (!farmId) return /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { href: "/select" });
  const onAdd = (formValues) => {
    createEquip(
      {
        farmId,
        data: {
          ...formValues,
          yearOfManufacture: formValues.yearOfManufacture ? parseInt(formValues.yearOfManufacture, 10) : void 0,
          photos: addPhotos.length ? JSON.stringify(addPhotos) : void 0,
          gpsTracked: addGpsTracked
        }
      },
      {
        onSuccess: () => {
          setIsAddOpen(false);
          reset();
          setAddPhotos([]);
          setAddGpsTracked(false);
          toast({ title: "Equipment registered" });
        },
        onError: () => {
          toast({ title: "Failed to register equipment", variant: "destructive" });
        }
      }
    );
  };
  const openManage = (item) => {
    setManagingItem(item);
    setManageTab("details");
    setServiceFormOpen(false);
    setEditingLog(null);
    setServiceForm(EMPTY_SERVICE_FORM);
    setDeletingLogId(null);
    setEditPhotos(parsePhotos(item.photos));
    setEditGpsTracked(item.gpsTracked ?? false);
    resetEdit({
      name: item.name ?? "",
      type: item.type ?? "",
      make: item.make ?? "",
      model: item.model ?? "",
      serialNumber: item.serialNumber ?? "",
      registrationNumber: item.registrationNumber ?? "",
      yearOfManufacture: item.yearOfManufacture ? String(item.yearOfManufacture) : "",
      location: item.location ?? "",
      notes: item.notes ?? "",
      status: item.status === "disposed" ? "active" : item.status ?? "active"
    });
  };
  const onEdit = (formValues) => {
    if (!managingItem) return;
    const body = {
      ...formValues,
      yearOfManufacture: formValues.yearOfManufacture ? parseInt(formValues.yearOfManufacture, 10) : void 0,
      photos: JSON.stringify(editPhotos),
      gpsTracked: editGpsTracked
    };
    if (managingItem.status === "disposed") delete body.status;
    updateMutation.mutate({ id: managingItem.id, body });
  };
  const allEquipment = data?.records ?? [];
  const equipment = showDisposed ? allEquipment : allEquipment.filter((e) => e.status !== "disposed" || e.id === targetEquipId);
  const disposedCount = allEquipment.filter((e) => e.status === "disposed").length;
  const sq = search.trim().toLowerCase();
  const filtered = equipment.filter((e) => {
    if (e.id === targetEquipId) return true;
    const matchSearch = !sq || (e.name ?? "").toLowerCase().includes(sq) || (e.make ?? "").toLowerCase().includes(sq) || (e.model ?? "").toLowerCase().includes(sq) || (e.serialNumber ?? "").toLowerCase().includes(sq) || (e.registrationNumber ?? "").toLowerCase().includes(sq) || (e.assetNumber ?? "").toLowerCase().includes(sq);
    const matchType = !typeFilter || e.type === typeFilter;
    const matchGps = gpsFilter === "all" || (gpsFilter === "tracked" ? e.gpsTracked : !e.gpsTracked);
    return matchSearch && matchType && matchGps;
  });
  reactExports.useEffect(() => {
    if (targetEquipId == null || scrolledToTarget.current || allEquipment.length === 0) return;
    if (!allEquipment.some((e) => e.id === targetEquipId)) return;
    scrolledToTarget.current = true;
    setHighlightEquipId(targetEquipId);
    setTimeout(() => {
      document.getElementById(`equipment-row-${targetEquipId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
    const t = setTimeout(() => setHighlightEquipId(null), 4e3);
    return () => clearTimeout(t);
  }, [targetEquipId, allEquipment]);
  const availableTypes = EQUIPMENT_TYPES.filter((t) => equipment.some((e) => e.type === t.value));
  const grouped = [];
  for (const t of EQUIPMENT_TYPES) {
    const items = filtered.filter((e) => e.type === t.value);
    if (items.length) grouped.push({ label: t.label, value: t.value, items });
  }
  const unknownItems = filtered.filter((e) => !EQUIPMENT_TYPES.some((t) => t.value === e.type));
  if (unknownItems.length) grouped.push({ label: "Other / Unclassified", value: "__unknown", items: unknownItems });
  const printedDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  function disposalLabel(method) {
    return DISPOSAL_METHODS.find((m) => m.value === method)?.label ?? method ?? "Disposed";
  }
  function disposalMeta(method) {
    return DISPOSAL_METHODS.find((m) => m.value === method) ?? { color: "#4b5563", bg: "#f3f4f6", label: "Disposed" };
  }
  function submitDispose() {
    if (!disposeItem) return;
    disposeMutation.mutate({
      id: disposeItem.id,
      body: {
        disposalMethod: disposeForm.disposalMethod,
        disposalDate: disposeForm.disposalDate,
        disposalPricePence: disposeForm.disposalPrice ? Math.round(parseFloat(disposeForm.disposalPrice) * 100) : null,
        disposalBuyerOrContractor: disposeForm.disposalBuyerOrContractor || null,
        wasteTransferNoteRef: disposeForm.wasteTransferNoteRef || null,
        disposalNotes: disposeForm.disposalNotes || null
      }
    });
  }
  const handleEquipmentPrint = () => {
    const printGroups = [];
    for (const t of EQUIPMENT_TYPES) {
      const items = allEquipment.filter((e) => e.type === t.value);
      if (items.length) printGroups.push({ label: t.label, items });
    }
    const unknownPrint = allEquipment.filter((e) => !EQUIPMENT_TYPES.some((t) => t.value === e.type));
    if (unknownPrint.length) printGroups.push({ label: "Other / Unclassified", items: unknownPrint });
    const cols = `<th>Asset No.</th><th>Name</th><th>Make / Model</th><th>Serial / Reg</th><th>Year</th><th>Status</th><th>Next Service</th>`;
    const itemRow = (item) => `<tr>
      <td style="font-family:monospace">${item.assetNumber || `EQ-${String(item.id).padStart(4, "0")}`}</td>
      <td><strong>${item.name || "Asset #" + item.id}</strong></td>
      <td>${[item.make, item.model].filter(Boolean).join(" ") || "—"}</td>
      <td style="font-family:monospace">${item.serialNumber || item.registrationNumber || "—"}</td>
      <td>${item.yearOfManufacture || "—"}</td>
      <td>${item.status === "disposed" ? `Disposed — ${disposalLabel(item.disposalMethod)}${item.disposalDate ? " (" + new Date(item.disposalDate).toLocaleDateString("en-GB") + ")" : ""}` : "Active"}</td>
      <td>${item.nextServiceDue ? new Date(item.nextServiceDue).toLocaleDateString("en-GB") : "—"}</td>
    </tr>`;
    const tableHtml = printGroups.map((group) => `
      <tr style="background:#1a3a1a!important">
        <td colspan="7" style="padding:5px 6px;font-size:8.5px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:0.07em;border:none">
          ${group.label} <span style="font-weight:400;opacity:0.7">(${group.items.length})</span>
        </td>
      </tr>
      ${group.items.map(itemRow).join("")}
    `).join("");
    printProReport({
      title: "Machinery & Equipment Register",
      farmName: farm?.name,
      cphNumber: farm?.cphNumber ?? void 0,
      recordCount: allEquipment.length,
      recordLabel: "item",
      tableHtml: `<table><thead><tr>${cols}</tr></thead><tbody>${tableHtml}</tbody></table>`,
      landscape: true
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { title: "Machinery & Equipment", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @media print {
          body > * { display: none !important; }
          [role="dialog"] #equipment-print-area { display: block !important; position: fixed; top:0; left:0; width:100%; padding:24px; font-size:11px; color:#000; background:#fff; }
        }
      ` }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "equipment", onClick: () => setTab("equipment"), children: "Equipment Register" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "defects", onClick: () => setTab("defects"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { className: "h-3.5 w-3.5" }),
        " Defect Reports"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "analytics", onClick: () => setTab("analytics"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "h-3.5 w-3.5" }),
        " Analytics"
      ] }) })
    ] }),
    tab === "defects" && farmId && /* @__PURE__ */ jsxRuntimeExports.jsx(EquipmentDefectsSection, { farmId }),
    tab === "analytics" && farmId && /* @__PURE__ */ jsxRuntimeExports.jsx(EquipmentAnalyticsTab, { farmId }),
    tab === "equipment" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row justify-between mb-6 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full sm:w-96", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "Search equipment...",
              className: "pl-10 bg-white",
              value: search,
              onChange: (e) => setSearch(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          disposedCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => setShowDisposed((s) => !s), children: [
            showDisposed ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "w-4 h-4 mr-2" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4 mr-2" }),
            showDisposed ? "Hide Disposed" : `Show Disposed (${disposedCount})`
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setPrintOpen(true), disabled: allEquipment.length === 0, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4 mr-2" }),
            " Print Register"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: isAddOpen, onOpenChange: (open) => {
            setIsAddOpen(open);
            if (!open) {
              reset();
              setAddPhotos([]);
              addEquipMut.reset();
            }
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-2" }),
              " Add Equipment"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "52rem" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Register Equipment" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit(onAdd), className: "space-y-4 mt-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "add-name", children: "Name / Description *" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "add-name", ...register("name", { required: true }), placeholder: "e.g. John Deere 6155R", className: "mt-1" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "add-make", children: "Make" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "add-make", ...register("make"), placeholder: "e.g. John Deere", className: "mt-1" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "add-model", children: "Model" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "add-model", ...register("model"), placeholder: "e.g. 6155R", className: "mt-1" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "add-type", children: "Equipment Type" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { id: "add-type", ...register("type", { required: true }), className: "mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Select type —" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("optgroup", { label: "Vehicles & Self-Propelled", children: EQUIPMENT_TYPES.filter((t) => t.category === "vehicle").map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t.value, children: t.label }, t.value)) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("optgroup", { label: "Implements & Attachments", children: EQUIPMENT_TYPES.filter((t) => t.category === "implement").map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t.value, children: t.label }, t.value)) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("optgroup", { label: "Other Equipment", children: EQUIPMENT_TYPES.filter((t) => t.category === "other").map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t.value, children: t.label }, t.value)) })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "add-year", children: "Year of Manufacture" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "add-year", type: "number", ...register("yearOfManufacture"), placeholder: "e.g. 2021", className: "mt-1" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "add-serial", children: "Serial Number" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "add-serial", ...register("serialNumber"), className: "mt-1" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "add-reg", children: "Registration Number" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "add-reg", ...register("registrationNumber"), className: "mt-1" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "add-location", children: "Location / Storage" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "add-location", ...register("location"), placeholder: "e.g. Main Yard", className: "mt-1" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "add-notes", children: "Notes" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "textarea",
                      {
                        id: "add-notes",
                        ...register("notes"),
                        placeholder: "Service history, condition, etc.",
                        className: "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-y"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-3 cursor-pointer select-none group", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          role: "checkbox",
                          "aria-checked": addGpsTracked,
                          tabIndex: 0,
                          onClick: () => setAddGpsTracked((v) => !v),
                          onKeyDown: (e) => (e.key === " " || e.key === "Enter") && setAddGpsTracked((v) => !v),
                          className: `relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 ${addGpsTracked ? "bg-green-500 border-green-500" : "bg-gray-200 border-gray-200"}`,
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `pointer-events-none inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${addGpsTracked ? "translate-x-5" : "translate-x-0.5"}` })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex items-center gap-1.5 text-sm font-medium", children: addGpsTracked ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Signal, { className: "w-4 h-4 text-green-600" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-700", children: "GPS Tracked" })
                      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SignalZero, { className: "w-4 h-4 text-gray-400" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Not GPS Tracked" })
                      ] }) })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-foreground/50 ml-14", children: "Mark this item as having an active GPS tracker fitted." })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-2 block", children: "Photos (optional)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(PhotoUploader, { photos: addPhotos, onChange: setAddPhotos })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: addEquipMut, message: "Failed to save — your entries are still here." }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => setIsAddOpen(false), children: "Cancel" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: isPending, children: [
                    isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 mr-2 animate-spin" }),
                    "Register"
                  ] })
                ] })
              ] })
            ] })
          ] })
        ] })
      ] }),
      availableTypes.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setTypeFilter(""),
            className: `px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${!typeFilter ? "bg-orange-600 text-white border-orange-600" : "bg-white text-foreground/60 border-border hover:border-orange-400 hover:text-orange-700"}`,
            children: [
              "All (",
              equipment.length,
              ")"
            ]
          }
        ),
        availableTypes.map((t) => {
          const count = equipment.filter((e) => e.type === t.value).length;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setTypeFilter(typeFilter === t.value ? "" : t.value),
              className: `px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${typeFilter === t.value ? "bg-orange-600 text-white border-orange-600" : "bg-white text-foreground/60 border-border hover:border-orange-400 hover:text-orange-700"}`,
              children: [
                t.label,
                " (",
                count,
                ")"
              ]
            },
            t.value
          );
        })
      ] }),
      equipment.some((e) => e.gpsTracked) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/50 font-medium uppercase tracking-wide", children: "GPS:" }),
        ["all", "tracked", "untracked"].map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setGpsFilter(opt),
            className: `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${gpsFilter === opt ? "bg-green-600 text-white border-green-600" : "bg-white text-foreground/60 border-border hover:border-green-500 hover:text-green-700"}`,
            children: [
              opt === "all" && "All",
              opt === "tracked" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Signal, { className: "w-3 h-3" }),
                "GPS Tracked"
              ] }),
              opt === "untracked" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SignalZero, { className: "w-3 h-3" }),
                "Not Tracked"
              ] })
            ]
          },
          opt
        ))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-2xl border border-border/50 overflow-hidden shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-left text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-black/5 text-sm uppercase tracking-wider text-foreground/60 font-semibold border-b border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Asset No." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Equipment" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Reg/Serial" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "MOT Due" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Next Service" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border/50", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 7, className: "px-6 py-12 text-center text-foreground/50", children: "Loading equipment..." }) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 7, className: "px-6 py-12 text-center text-foreground/50", children: equipment.length === 0 ? showDisposed && disposedCount > 0 ? "All equipment is disposed." : "No equipment registered." : "No equipment matches your search or filter." }) }) : grouped.map((group) => /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, { children: [
          !typeFilter && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "bg-orange-50/70 border-b border-orange-100", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { colSpan: 7, className: "px-6 py-2 text-xs font-bold uppercase tracking-wider text-orange-700", children: [
            group.label,
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-normal text-orange-400 ml-1", children: [
              "(",
              group.items.length,
              ")"
            ] })
          ] }) }),
          group.items.map((item) => {
            const isDisposed = item.status === "disposed";
            const dispMeta = isDisposed ? disposalMeta(item.disposalMethod) : null;
            const motSt = dueStatus(item.nextMotDue);
            const svcSt = dueStatus(item.nextServiceDue);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { id: `equipment-row-${item.id}`, className: `transition-colors ${highlightEquipId === item.id ? "bg-indigo-50 ring-2 ring-inset ring-indigo-300" : "hover:bg-black/5"} ${isDisposed ? "opacity-60" : ""}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 whitespace-nowrap", children: item.assetNumber ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-semibold text-primary text-xs", children: item.assetNumber }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-6 w-6 p-0 text-gray-400 hover:text-gray-700", onClick: () => setQrItem(item), title: "Print QR label", children: /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: "h-3.5 w-3.5" }) })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-gray-400", children: `EQ-${String(item.id).padStart(4, "0")}` }),
                !isDisposed && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "sm",
                    variant: "outline",
                    className: "h-5 text-[10px] px-1.5 border-dashed",
                    onClick: () => assignNumberMutation.mutate(item),
                    disabled: assignNumberMutation.isPending,
                    title: "Save this asset number permanently",
                    children: "Save"
                  }
                )
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-lg overflow-hidden bg-orange-50 flex-shrink-0 flex items-center justify-center", children: parsePhotos(item.photos)[0] ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: parsePhotos(item.photos)[0], alt: item.name, className: "w-full h-full object-cover" }) : isDisposed ? /* @__PURE__ */ jsxRuntimeExports.jsx(PackageX, { className: "w-5 h-5 text-gray-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Tractor, { className: "w-5 h-5 text-orange-600" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: isDisposed ? "line-through text-foreground/50" : "", children: item.name || `Asset #${item.id}` }),
                  (item.make || item.model) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/50", children: [item.make, item.model].filter(Boolean).join(" ") }),
                  item.gpsTracked && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-green-100 text-green-700", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Signal, { className: "w-2.5 h-2.5" }),
                    "GPS"
                  ] })
                ] })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs font-mono text-foreground/60 whitespace-nowrap", children: item.serialNumber || item.registrationNumber || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: isDisposed && dispMeta ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 10px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 700, background: dispMeta.bg, color: dispMeta.color }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(PackageX, { size: 11 }),
                  " ",
                  dispMeta.label
                ] }),
                item.disposalDate && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#9ca3af", marginTop: 2 }, children: fmt(item.disposalDate) })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700", children: "Active" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: isDisposed ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/30", children: "—" }) : item.nextMotDue ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.75rem", fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: motSt.bg, color: motSt.color }, children: motSt.label }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/40", children: "—" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: isDisposed ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/30", children: "—" }) : item.nextServiceDue ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.75rem", fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: svcSt.bg, color: svcSt.color }, children: svcSt.label }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/40", children: "—" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: isDisposed ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: () => openManage(item), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4 mr-1.5" }),
                " View"
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", children: [
                  "Actions ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-3.5 h-3.5 ml-1" })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => openManage(item), children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5 mr-2" }),
                    " Manage / Edit"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => setQrItem(item), children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: "w-3.5 h-3.5 mr-2" }),
                    " Print QR Label"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => {
                    setDisposeItem(item);
                    setDisposeForm(EMPTY_DISPOSE_FORM);
                  }, className: "text-red-600", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(PackageX, { className: "w-3.5 h-3.5 mr-2" }),
                    " Record Disposal"
                  ] })
                ] })
              ] }) })
            ] }, item.id);
          })
        ] }, group.value)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!managingItem, onOpenChange: (open) => {
        if (!open) {
          setManagingItem(null);
          setServiceFormOpen(false);
          setEditingLog(null);
          setDeletingLogId(null);
          updateMutation.reset();
          addMaintMut.reset();
          editMaintMut.reset();
          deleteMaintMut.reset();
        }
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "58rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          "Manage Equipment — ",
          managingItem?.name
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { className: "mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: manageTab === "details", onClick: () => setManageTab("details"), children: "Details" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: manageTab === "service", onClick: () => setManageTab("service"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { className: "w-3.5 h-3.5" }),
            " Service & MOT History"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: manageTab === "compliance", onClick: () => {
            setManageTab("compliance");
            if (managingItem) setCompForm({ complianceCategory: managingItem.complianceCategory ?? "standard", puwerLastAssessmentDate: managingItem.puwerLastAssessmentDate?.slice(0, 10) ?? "", puwerNextReviewDate: managingItem.puwerNextReviewDate?.slice(0, 10) ?? "", puwerAssessor: managingItem.puwerAssessor ?? "", puwerOutcome: managingItem.puwerOutcome ?? "", puwerNotes: managingItem.puwerNotes ?? "", lolerLastExamDate: managingItem.lolerLastExamDate?.slice(0, 10) ?? "", lolerNextExamDate: managingItem.lolerNextExamDate?.slice(0, 10) ?? "", lolerExaminer: managingItem.lolerExaminer ?? "", lolerOutcome: managingItem.lolerOutcome ?? "", lolerReportRef: managingItem.lolerReportRef ?? "", lolerNotes: managingItem.lolerNotes ?? "", pssrLastExamDate: managingItem.pssrLastExamDate?.slice(0, 10) ?? "", pssrNextExamDate: managingItem.pssrNextExamDate?.slice(0, 10) ?? "", pssrExaminer: managingItem.pssrExaminer ?? "", pssrWrittenSchemeRef: managingItem.pssrWrittenSchemeRef ?? "", pssrOutcome: managingItem.pssrOutcome ?? "", pssrNotes: managingItem.pssrNotes ?? "", insurerName: managingItem.insurerName ?? "", insurancePolicyRef: managingItem.insurancePolicyRef ?? "", insuranceRenewalDate: managingItem.insuranceRenewalDate?.slice(0, 10) ?? "", insurancePremiumPence: managingItem.insurancePremiumPence != null ? String(managingItem.insurancePremiumPence / 100) : "", depreciationMethod: managingItem.depreciationMethod ?? "none", depreciationRatePct: managingItem.depreciationRatePct != null ? String(managingItem.depreciationRatePct) : "", purchasePricePence: managingItem.purchasePricePence != null ? String(managingItem.purchasePricePence / 100) : "", purchaseDate: managingItem.purchaseDate?.slice(0, 10) ?? "" });
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-3.5 h-3.5" }),
            " Compliance"
          ] }) })
        ] }),
        managingItem && manageTab === "details" && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleEditSubmit(onEdit), className: "space-y-4 mt-2", children: [
          managingItem.status === "disposed" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(PackageX, { size: 16, style: { color: "#dc2626", flexShrink: 0 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 700, color: "#991b1b", fontSize: "0.875rem" }, children: "This item has been disposed" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { marginLeft: "auto", padding: "2px 10px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 700, ...(() => {
                const m = disposalMeta(managingItem.disposalMethod);
                return { background: m.bg, color: m.color };
              })() }, children: disposalLabel(managingItem.disposalMethod) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "4px 16px", fontSize: "0.8125rem", color: "#374151" }, children: [
              managingItem.disposalDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280" }, children: "Date: " }),
                fmt(managingItem.disposalDate)
              ] }),
              managingItem.disposalPricePence != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280" }, children: "Price: " }),
                "£",
                (managingItem.disposalPricePence / 100).toFixed(2)
              ] }),
              managingItem.disposalBuyerOrContractor && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280" }, children: "Buyer / Contractor: " }),
                managingItem.disposalBuyerOrContractor
              ] }),
              managingItem.wasteTransferNoteRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280" }, children: "Waste Transfer Note Ref: " }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontFamily: "monospace" }, children: managingItem.wasteTransferNoteRef })
              ] }),
              managingItem.disposalNotes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280" }, children: "Notes: " }),
                managingItem.disposalNotes
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => undoDisposeMutation.mutate(managingItem.id),
                disabled: undoDisposeMutation.isPending,
                style: { alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.8125rem", padding: "4px 12px", borderRadius: 6, border: "1px solid #fca5a5", background: "#fff", color: "#dc2626", cursor: "pointer" },
                children: [
                  undoDisposeMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 13, style: { animation: "spin 1s linear infinite" } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { size: 13 }),
                  "Undo Disposal — Restore to Active Fleet"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Name / Description" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ...regEdit("name"), className: "mt-1" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Make" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ...regEdit("make"), className: "mt-1" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Model" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ...regEdit("model"), className: "mt-1" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Equipment Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { ...regEdit("type", { required: true }), className: "mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Select type —" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("optgroup", { label: "Vehicles & Self-Propelled", children: EQUIPMENT_TYPES.filter((t) => t.category === "vehicle").map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t.value, children: t.label }, t.value)) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("optgroup", { label: "Implements & Attachments", children: EQUIPMENT_TYPES.filter((t) => t.category === "implement").map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t.value, children: t.label }, t.value)) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("optgroup", { label: "Other Equipment", children: EQUIPMENT_TYPES.filter((t) => t.category === "other").map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t.value, children: t.label }, t.value)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Year of Manufacture" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", ...regEdit("yearOfManufacture"), className: "mt-1" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Serial Number" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ...regEdit("serialNumber"), className: "mt-1" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Registration Number" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ...regEdit("registrationNumber"), className: "mt-1" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Location / Storage" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ...regEdit("location"), className: "mt-1" })
            ] }),
            managingItem.status !== "disposed" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Operational Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "select",
                {
                  ...regEdit("status"),
                  className: "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                  children: OPERATIONAL_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s.value, children: s.label }, s.value))
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { ...regEdit("notes"), className: "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-y" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-3 cursor-pointer select-none group", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    role: "checkbox",
                    "aria-checked": editGpsTracked,
                    tabIndex: 0,
                    onClick: () => setEditGpsTracked((v) => !v),
                    onKeyDown: (e) => (e.key === " " || e.key === "Enter") && setEditGpsTracked((v) => !v),
                    className: `relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 ${editGpsTracked ? "bg-green-500 border-green-500" : "bg-gray-200 border-gray-200"}`,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `pointer-events-none inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${editGpsTracked ? "translate-x-5" : "translate-x-0.5"}` })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex items-center gap-1.5 text-sm font-medium", children: editGpsTracked ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Signal, { className: "w-4 h-4 text-green-600" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-700", children: "GPS Tracked" })
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SignalZero, { className: "w-4 h-4 text-gray-400" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Not GPS Tracked" })
                ] }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-foreground/50 ml-14", children: "Mark this item as having an active GPS tracker fitted." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-2 block", children: "Photos" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(PhotoUploader, { photos: editPhotos, onChange: setEditPhotos })
            ] })
          ] }),
          farmId && managingItem && /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "equipment_item", recordId: managingItem.id }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: updateMutation, message: "Failed to save — your entries are still here." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => setManagingItem(null), children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: updateMutation.isPending, children: [
              updateMutation.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 mr-2 animate-spin" }),
              "Save Changes"
            ] })
          ] })
        ] }),
        managingItem && manageTab === "service" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: [
          (() => {
            const motLog = maintLogs.find((l) => l.maintenanceType === "mot");
            const svcLog = maintLogs.find((l) => l.maintenanceType !== "mot");
            const motSt = dueStatus(motLog?.nextDueDate);
            const svcSt = dueStatus(svcLog?.nextDueDate);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 12, flexWrap: "wrap" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: "1 1 200px", background: motSt.bg, border: `1px solid ${motSt.color}33`, borderRadius: 10, padding: "12px 16px" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#6b7280", marginBottom: 4 }, children: "MOT Status" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "1rem", fontWeight: 700, color: motSt.color }, children: motSt.label }),
                motLog && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.72rem", color: "#6b7280", marginTop: 2 }, children: [
                  "Last test: ",
                  fmt(motLog.performedDate)
                ] }),
                !motLog && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.72rem", color: "#9ca3af", marginTop: 2 }, children: "No MOT recorded yet" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: "1 1 200px", background: svcSt.bg, border: `1px solid ${svcSt.color}33`, borderRadius: 10, padding: "12px 16px" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#6b7280", marginBottom: 4 }, children: "Next Service Due" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "1rem", fontWeight: 700, color: svcSt.color }, children: svcSt.label }),
                svcLog && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.72rem", color: "#6b7280", marginTop: 2 }, children: [
                  "Last service: ",
                  fmt(svcLog.performedDate),
                  svcLog.performedBy ? ` · ${svcLog.performedBy}` : ""
                ] }),
                !svcLog && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.72rem", color: "#9ca3af", marginTop: 2 }, children: "No service recorded yet" })
              ] })
            ] });
          })(),
          serviceFormOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 600, fontSize: "0.85rem", marginBottom: 10 }, children: editingLog ? "Edit Record" : "Log Service / MOT" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                  "Type ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: serviceForm.maintenanceType, onChange: (e) => setServiceForm((f) => ({ ...f, maintenanceType: e.target.value })), className: "mt-1 w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50", children: MAINT_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t.value, children: t.label }, t.value)) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                  "Date Performed ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: serviceForm.performedDate, onChange: (e) => setServiceForm((f) => ({ ...f, performedDate: e.target.value })) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                  "Description / Work Done ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", placeholder: "e.g. Full service — oil, filters, belts replaced", value: serviceForm.description, onChange: (e) => setServiceForm((f) => ({ ...f, description: e.target.value })) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Performed By / Garage" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", placeholder: "e.g. Smith's Agricultural", value: serviceForm.performedBy, onChange: (e) => setServiceForm((f) => ({ ...f, performedBy: e.target.value })) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Due Date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", min: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: serviceForm.nextDueDate, onChange: (e) => setServiceForm((f) => ({ ...f, nextDueDate: e.target.value })) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cost (£)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", className: "mt-1", placeholder: "0.00", value: serviceForm.costPence, onChange: (e) => setServiceForm((f) => ({ ...f, costPence: e.target.value })) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Parts Used" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", placeholder: "e.g. Oil filter, air filter", value: serviceForm.partsUsed, onChange: (e) => setServiceForm((f) => ({ ...f, partsUsed: e.target.value })) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { className: "mt-1", placeholder: "Additional observations, defects noted, etc.", rows: 2, value: serviceForm.notes, onChange: (e) => setServiceForm((f) => ({ ...f, notes: e.target.value })) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: addMaintMut, message: "Failed to save — your entries are still here." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: editMaintMut, message: "Failed to save — your entries are still here." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => {
                setServiceFormOpen(false);
                setEditingLog(null);
                setServiceForm(EMPTY_SERVICE_FORM);
              }, children: "Cancel" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: submitServiceForm, disabled: !serviceForm.description || !serviceForm.performedDate || addMaintMut.isPending || editMaintMut.isPending, children: [
                addMaintMut.isPending || editMaintMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3.5 h-3.5 mr-1 animate-spin" }) : null,
                editingLog ? "Save Changes" : "Save Record"
              ] })
            ] })
          ] }),
          !serviceFormOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
            setEditingLog(null);
            setServiceForm(EMPTY_SERVICE_FORM);
            setServiceFormOpen(true);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1.5" }),
            " Log Service / MOT"
          ] }) }),
          maintQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { textAlign: "center", padding: 24, color: "#9ca3af", fontSize: "0.85rem" }, children: "Loading history…" }) : maintLogs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { textAlign: "center", padding: 24, color: "#9ca3af", fontSize: "0.85rem", border: "1px dashed #e2e8f0", borderRadius: 10 }, children: 'No service or MOT records yet. Click "Log Service / MOT" to add the first entry.' }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }, children: maintLogs.map((log, i) => {
            const mt = MAINT_TYPES.find((t) => t.value === log.maintenanceType) ?? MAINT_TYPES[MAINT_TYPES.length - 1];
            const dueSt = dueStatus(log.nextDueDate);
            const isDeleting = deletingLogId === log.id;
            return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: "12px 16px", borderBottom: i < maintLogs.length - 1 ? "1px solid #f1f5f9" : "none", background: i % 2 === 0 ? "#fff" : "#fafafa" }, children: isDeleting ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 text-red-500 flex-shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.82rem", flex: 1 }, children: "Delete this record? This cannot be undone." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => setDeletingLogId(null), children: "Cancel" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", size: "sm", onClick: () => deleteMaintMut.mutate(log.id), disabled: deleteMaintMut.isPending, children: "Delete" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: 12 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 5, background: mt.bg, color: mt.color }, children: mt.label }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.78rem", fontWeight: 600, color: "#374151" }, children: fmt(log.performedDate) }),
                  log.performedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.75rem", color: "#6b7280" }, children: [
                    "· ",
                    log.performedBy
                  ] }),
                  log.costPence != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.75rem", color: "#6b7280" }, children: [
                    "· £",
                    (log.costPence / 100).toFixed(2)
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.82rem", color: "#1e293b", fontWeight: 500 }, children: log.description }),
                log.partsUsed && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.75rem", color: "#64748b", marginTop: 2 }, children: [
                  "Parts: ",
                  log.partsUsed
                ] }),
                log.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.75rem", color: "#64748b", marginTop: 1 }, children: [
                  "Notes: ",
                  log.notes
                ] }),
                log.nextDueDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 4, display: "flex", alignItems: "center", gap: 6 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "#9ca3af" }, children: "Next Due:" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.72rem", fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: dueSt.bg, color: dueSt.color }, children: dueSt.label })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4, flexShrink: 0 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => setViewRecord({ ...log, _type: "maint" }), style: { padding: "4px 8px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => openServiceEdit(log), style: { padding: "4px 8px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => setDeletingLogId(log.id), style: { padding: "4px 8px", color: "#ef4444" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
              ] })
            ] }) }, log.id);
          }) })
        ] }),
        managingItem && manageTab === "compliance" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 mt-2", style: { maxHeight: "62vh", overflowY: "auto", paddingRight: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 10, padding: "1rem 1.25rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { size: 16, style: { color: "#0369a1" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 700, fontSize: "0.9rem", color: "#0c4a6e" }, children: "Equipment Compliance Classification" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: [
                "Category ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "w-full border border-border rounded-md px-3 py-2 text-sm bg-white", value: compForm.complianceCategory ?? "standard", onChange: (e) => setCompForm((f) => ({ ...f, complianceCategory: e.target.value })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "standard", children: "Standard Work Equipment — PUWER only" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "lifting_goods", children: "Lifting Equipment (Goods) — PUWER + LOLER (12-month examination)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "lifting_persons", children: "Lifting Equipment (Persons) — PUWER + LOLER (6-month examination)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "pressure_system", children: "Pressure System — PUWER + PSSR" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.72rem", color: "#0369a1", marginTop: 6 }, children: [
                compForm.complianceCategory === "lifting_goods" && "Telehandlers, front loaders, bale grabs, pallet forks, chain hoists, grain elevators — annual LOLER thorough examination required.",
                compForm.complianceCategory === "lifting_persons" && "Cherry pickers, MEWPs, vehicle lifts — 6-monthly LOLER thorough examination required by insurance engineer.",
                compForm.complianceCategory === "pressure_system" && "Air compressors, grain drier LPG systems, pressure vessels — Written Scheme of Examination required; examination by specialist engineer.",
                (!compForm.complianceCategory || compForm.complianceCategory === "standard") && "Tractors, combines, sprayers, drills, workshop equipment — annual PUWER assessment by a competent person (can be internal)."
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "1.25rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { size: 16, style: { color: "#2563eb" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 700, fontSize: "0.9rem", color: "#1e293b" }, children: "PUWER Assessment" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.72rem", background: "#dbeafe", color: "#1d4ed8", borderRadius: 999, padding: "1px 8px", fontWeight: 600 }, children: "Provision and Use of Work Equipment Regulations 1998" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Last Assessment Date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), className: "w-full border border-border rounded-md px-3 py-2 text-sm", value: compForm.puwerLastAssessmentDate ?? "", onChange: (e) => {
                  const val = e.target.value;
                  const next = val ? (() => {
                    const d = new Date(val);
                    d.setFullYear(d.getFullYear() + 1);
                    return d.toISOString().slice(0, 10);
                  })() : "";
                  setCompForm((f) => ({ ...f, puwerLastAssessmentDate: val, puwerNextReviewDate: f.puwerNextReviewDate || next }));
                } })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: [
                  "Next Review Date ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", color: "#64748b", fontWeight: 400 }, children: "(auto-set +12 months)" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", className: "w-full border border-border rounded-md px-3 py-2 text-sm", value: compForm.puwerNextReviewDate ?? "", onChange: (e) => setCompForm((f) => ({ ...f, puwerNextReviewDate: e.target.value })) }),
                compForm.puwerNextReviewDate && (() => {
                  const d = dueStatus(compForm.puwerNextReviewDate);
                  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.72rem", fontWeight: 700, padding: "1px 7px", borderRadius: 4, background: d.bg, color: d.color, marginTop: 3, display: "inline-block" }, children: d.label });
                })()
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Assessor Name / Company" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", className: "w-full border border-border rounded-md px-3 py-2 text-sm", placeholder: "e.g. Health & Safety Manager, external consultant", value: compForm.puwerAssessor ?? "", onChange: (e) => setCompForm((f) => ({ ...f, puwerAssessor: e.target.value })) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Assessment Outcome" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "w-full border border-border rounded-md px-3 py-2 text-sm bg-white", value: compForm.puwerOutcome ?? "", onChange: (e) => setCompForm((f) => ({ ...f, puwerOutcome: e.target.value })), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Select outcome —" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "pass", children: "Pass — No defects found" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "advisory", children: "Advisory — Defects noted, not immediate risk" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "fail", children: "Fail — Equipment must not be used" })
                ] }),
                compForm.puwerOutcome === "fail" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#dc2626", marginTop: 3 }, children: "⚠ FAIL — A task and SMS alert will be sent to the farm manager on save. Equipment status will be set to Grounded." }),
                compForm.puwerOutcome === "advisory" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#d97706", marginTop: 3 }, children: "⚠ Advisory — A task will be raised for the farm manager to review defects." })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 12 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Assessment Notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { className: "w-full border border-border rounded-md px-3 py-2 text-sm", rows: 3, placeholder: "Defects found, actions required, guarding condition, operator training requirements...", value: compForm.puwerNotes ?? "", onChange: (e) => setCompForm((f) => ({ ...f, puwerNotes: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#64748b", marginTop: 8, padding: "8px 12px", background: "#eff6ff", borderRadius: 6 }, children: "PUWER applies to all work equipment. Assessments can be performed by an internal competent person. Annual review recommended. Records must be kept and available for inspection." })
          ] }),
          (compForm.complianceCategory === "lifting_goods" || compForm.complianceCategory === "lifting_persons") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, padding: "1.25rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { size: 16, style: { color: "#c2410c" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 700, fontSize: "0.9rem", color: "#1e293b" }, children: "LOLER Thorough Examination" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.72rem", background: "#fed7aa", color: "#c2410c", borderRadius: 999, padding: "1px 8px", fontWeight: 600 }, children: "Lifting Operations & Lifting Equipment Regs 1998" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.72rem", background: "#fef3c7", color: "#92400e", borderRadius: 999, padding: "1px 8px", fontWeight: 600, marginLeft: 2 }, children: compForm.complianceCategory === "lifting_persons" ? "6-month interval" : "12-month interval" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Last Examination Date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), className: "w-full border border-border rounded-md px-3 py-2 text-sm", value: compForm.lolerLastExamDate ?? "", onChange: (e) => {
                  const val = e.target.value;
                  const months = compForm.complianceCategory === "lifting_persons" ? 6 : 12;
                  const next = val ? (() => {
                    const d = new Date(val);
                    d.setMonth(d.getMonth() + months);
                    return d.toISOString().slice(0, 10);
                  })() : "";
                  setCompForm((f) => ({ ...f, lolerLastExamDate: val, lolerNextExamDate: f.lolerNextExamDate || next }));
                } })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: [
                  "Next Examination Due ",
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.7rem", color: "#64748b", fontWeight: 400 }, children: [
                    "(auto-set ",
                    compForm.complianceCategory === "lifting_persons" ? "+6" : "+12",
                    " months)"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", className: "w-full border border-border rounded-md px-3 py-2 text-sm", value: compForm.lolerNextExamDate ?? "", onChange: (e) => setCompForm((f) => ({ ...f, lolerNextExamDate: e.target.value })) }),
                compForm.lolerNextExamDate && (() => {
                  const d = dueStatus(compForm.lolerNextExamDate);
                  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.72rem", fontWeight: 700, padding: "1px 7px", borderRadius: 4, background: d.bg, color: d.color, marginTop: 3, display: "inline-block" }, children: d.label });
                })()
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Examiner Name / Company" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", className: "w-full border border-border rounded-md px-3 py-2 text-sm", placeholder: "e.g. NFU Mutual Insurance Engineer, Zurich Engineering", value: compForm.lolerExaminer ?? "", onChange: (e) => setCompForm((f) => ({ ...f, lolerExaminer: e.target.value })) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Report / Certificate Reference" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", className: "w-full border border-border rounded-md px-3 py-2 text-sm", placeholder: "e.g. LOLER-2024-00123", value: compForm.lolerReportRef ?? "", onChange: (e) => setCompForm((f) => ({ ...f, lolerReportRef: e.target.value })) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Examination Outcome" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "w-full border border-border rounded-md px-3 py-2 text-sm bg-white", value: compForm.lolerOutcome ?? "", onChange: (e) => setCompForm((f) => ({ ...f, lolerOutcome: e.target.value })), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Select outcome —" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "pass", children: "Pass — No defects found, fit for purpose" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "advisory", children: "Advisory — Defects noted, use with caution" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "fail", children: "Fail — Must not be used until repaired" })
                ] }),
                compForm.lolerOutcome === "fail" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#dc2626", marginTop: 3 }, children: "⚠ FAIL — A task and SMS alert will be sent on save. Equipment will be Grounded. LOLER requires the equipment to be taken out of service immediately." }),
                compForm.lolerOutcome === "advisory" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#d97706", marginTop: 3 }, children: "⚠ Advisory — A task will be raised for the farm manager." })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 12 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Examination Notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { className: "w-full border border-border rounded-md px-3 py-2 text-sm", rows: 3, placeholder: "Defects found, safe working load, test certificates, required repairs...", value: compForm.lolerNotes ?? "", onChange: (e) => setCompForm((f) => ({ ...f, lolerNotes: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", color: "#92400e", marginTop: 8, padding: "8px 12px", background: "#fef3c7", borderRadius: 6 }, children: [
              "LOLER requires all lifting equipment to undergo a thorough examination by a competent person (",
              compForm.complianceCategory === "lifting_persons" ? "every 6 months where used to lift persons" : "every 12 months for goods-only lifting equipment",
              "). In practice this is performed by an insurance engineer. The written report must be kept for at least 2 years."
            ] })
          ] }),
          compForm.complianceCategory === "pressure_system" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: 10, padding: "1.25rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { size: 16, style: { color: "#7c3aed" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 700, fontSize: "0.9rem", color: "#1e293b" }, children: "PSSR Examination" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.72rem", background: "#ede9fe", color: "#6d28d9", borderRadius: 999, padding: "1px 8px", fontWeight: 600 }, children: "Pressure Systems Safety Regulations 2000" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Written Scheme Reference" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", className: "w-full border border-border rounded-md px-3 py-2 text-sm", placeholder: "e.g. WSE-2024-FARM001", value: compForm.pssrWrittenSchemeRef ?? "", onChange: (e) => setCompForm((f) => ({ ...f, pssrWrittenSchemeRef: e.target.value })) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Examiner Name / Company" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", className: "w-full border border-border rounded-md px-3 py-2 text-sm", placeholder: "e.g. Zurich Engineering, Allianz Engineering", value: compForm.pssrExaminer ?? "", onChange: (e) => setCompForm((f) => ({ ...f, pssrExaminer: e.target.value })) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Last Examination Date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), className: "w-full border border-border rounded-md px-3 py-2 text-sm", value: compForm.pssrLastExamDate ?? "", onChange: (e) => {
                  const val = e.target.value;
                  const next = val ? (() => {
                    const d = new Date(val);
                    d.setFullYear(d.getFullYear() + 1);
                    return d.toISOString().slice(0, 10);
                  })() : "";
                  setCompForm((f) => ({ ...f, pssrLastExamDate: val, pssrNextExamDate: f.pssrNextExamDate || next }));
                } })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: [
                  "Next Examination Due ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", color: "#64748b", fontWeight: 400 }, children: "(auto-set +12 months)" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", className: "w-full border border-border rounded-md px-3 py-2 text-sm", value: compForm.pssrNextExamDate ?? "", onChange: (e) => setCompForm((f) => ({ ...f, pssrNextExamDate: e.target.value })) }),
                compForm.pssrNextExamDate && (() => {
                  const d = dueStatus(compForm.pssrNextExamDate);
                  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.72rem", fontWeight: 700, padding: "1px 7px", borderRadius: 4, background: d.bg, color: d.color, marginTop: 3, display: "inline-block" }, children: d.label });
                })()
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Examination Outcome" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "w-full border border-border rounded-md px-3 py-2 text-sm bg-white", value: compForm.pssrOutcome ?? "", onChange: (e) => setCompForm((f) => ({ ...f, pssrOutcome: e.target.value })), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Select outcome —" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "pass", children: "Pass — Safe to operate as per Written Scheme" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "advisory", children: "Advisory — Minor defects, use with conditions" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "fail", children: "Fail — Must not be operated until repaired" })
                ] }),
                compForm.pssrOutcome === "fail" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#dc2626", marginTop: 3 }, children: "⚠ FAIL — A task and SMS alert will be sent on save. Equipment will be Grounded. PSSR prohibits operation of a failed system." }),
                compForm.pssrOutcome === "advisory" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#d97706", marginTop: 3 }, children: "⚠ Advisory — A task will be raised for the farm manager." })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 12 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Examination Notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { className: "w-full border border-border rounded-md px-3 py-2 text-sm", rows: 3, placeholder: "Defects found, operating conditions, required repairs, Written Scheme amendments...", value: compForm.pssrNotes ?? "", onChange: (e) => setCompForm((f) => ({ ...f, pssrNotes: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#5b21b6", marginTop: 8, padding: "8px 12px", background: "#ede9fe", borderRadius: 6 }, children: "PSSR requires a Written Scheme of Examination drawn up by a competent person (specialist engineer) before the system is operated. The scheme specifies examination intervals, typically 12–48 months. The examination report must be kept until the next examination." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "1.25rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { size: 16, style: { color: "#0891b2" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 700, fontSize: "0.9rem", color: "#1e293b" }, children: "Insurance" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Insurer Name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", className: "w-full border border-border rounded-md px-3 py-2 text-sm", placeholder: "e.g. NFU Mutual", value: compForm.insurerName ?? "", onChange: (e) => setCompForm((f) => ({ ...f, insurerName: e.target.value })) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Policy Reference" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", className: "w-full border border-border rounded-md px-3 py-2 text-sm", placeholder: "e.g. NFU-12345-M", value: compForm.insurancePolicyRef ?? "", onChange: (e) => setCompForm((f) => ({ ...f, insurancePolicyRef: e.target.value })) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Renewal Date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", className: "w-full border border-border rounded-md px-3 py-2 text-sm", value: compForm.insuranceRenewalDate ?? "", onChange: (e) => setCompForm((f) => ({ ...f, insuranceRenewalDate: e.target.value })) }),
                compForm.insuranceRenewalDate && (() => {
                  const d = dueStatus(compForm.insuranceRenewalDate);
                  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.72rem", fontWeight: 700, padding: "1px 7px", borderRadius: 4, background: d.bg, color: d.color, marginTop: 3, display: "inline-block" }, children: d.label });
                })()
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Annual Premium (£)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", step: "0.01", min: "0", className: "w-full border border-border rounded-md px-3 py-2 text-sm", placeholder: "0.00", value: compForm.insurancePremiumPence ?? "", onChange: (e) => setCompForm((f) => ({ ...f, insurancePremiumPence: e.target.value })) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "1.25rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { size: 16, style: { color: "#7c3aed" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 700, fontSize: "0.9rem", color: "#1e293b" }, children: "Depreciation & Valuation" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Purchase Date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), className: "w-full border border-border rounded-md px-3 py-2 text-sm", value: compForm.purchaseDate ?? "", onChange: (e) => setCompForm((f) => ({ ...f, purchaseDate: e.target.value })) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Purchase Price (£)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", step: "0.01", min: "0", className: "w-full border border-border rounded-md px-3 py-2 text-sm", placeholder: "0.00", value: compForm.purchasePricePence ?? "", onChange: (e) => setCompForm((f) => ({ ...f, purchasePricePence: e.target.value })) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Depreciation Method" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "w-full border border-border rounded-md px-3 py-2 text-sm bg-white", value: compForm.depreciationMethod ?? "none", onChange: (e) => setCompForm((f) => ({ ...f, depreciationMethod: e.target.value })), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "none", children: "None / Not tracked" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "straight_line", children: "Straight Line" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "reducing_balance", children: "Reducing Balance" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }, children: "Depreciation Rate (%/year)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", step: "1", min: "0", max: "100", className: "w-full border border-border rounded-md px-3 py-2 text-sm", placeholder: "e.g. 20", value: compForm.depreciationRatePct ?? "", onChange: (e) => setCompForm((f) => ({ ...f, depreciationRatePct: e.target.value })), disabled: !compForm.depreciationMethod || compForm.depreciationMethod === "none" })
              ] })
            ] }),
            compForm.depreciationMethod && compForm.depreciationMethod !== "none" && compForm.purchasePricePence && compForm.purchaseDate && compForm.depreciationRatePct && (() => {
              const cost = parseFloat(compForm.purchasePricePence);
              const rate = parseFloat(compForm.depreciationRatePct) / 100;
              const years = (Date.now() - new Date(compForm.purchaseDate).getTime()) / (365.25 * 864e5);
              let currentVal = 0;
              if (compForm.depreciationMethod === "straight_line") {
                currentVal = Math.max(0, cost * (1 - rate * years));
              } else {
                currentVal = cost * Math.pow(1 - rate, years);
              }
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 12, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px", display: "flex", gap: 24 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#15803d", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }, children: "Estimated Current Value" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.1rem", fontWeight: 700, color: "#166534" }, children: [
                    "£",
                    currentVal.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#15803d", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }, children: "Total Depreciation" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.1rem", fontWeight: 700, color: "#dc2626" }, children: [
                    "£",
                    (cost - currentVal).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#15803d", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }, children: "Age" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.1rem", fontWeight: 700, color: "#166534" }, children: [
                    years.toFixed(1),
                    " yrs"
                  ] })
                ] })
              ] });
            })()
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 4 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setManageTab("details"), children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                disabled: compSaving,
                onClick: async () => {
                  setCompSaving(true);
                  try {
                    const body = {
                      complianceCategory: compForm.complianceCategory || "standard",
                      puwerLastAssessmentDate: compForm.puwerLastAssessmentDate || null,
                      puwerNextReviewDate: compForm.puwerNextReviewDate || null,
                      puwerAssessor: compForm.puwerAssessor || null,
                      puwerOutcome: compForm.puwerOutcome || null,
                      puwerNotes: compForm.puwerNotes || null,
                      lolerLastExamDate: compForm.lolerLastExamDate || null,
                      lolerNextExamDate: compForm.lolerNextExamDate || null,
                      lolerExaminer: compForm.lolerExaminer || null,
                      lolerOutcome: compForm.lolerOutcome || null,
                      lolerReportRef: compForm.lolerReportRef || null,
                      lolerNotes: compForm.lolerNotes || null,
                      pssrLastExamDate: compForm.pssrLastExamDate || null,
                      pssrNextExamDate: compForm.pssrNextExamDate || null,
                      pssrExaminer: compForm.pssrExaminer || null,
                      pssrWrittenSchemeRef: compForm.pssrWrittenSchemeRef || null,
                      pssrOutcome: compForm.pssrOutcome || null,
                      pssrNotes: compForm.pssrNotes || null,
                      insurerName: compForm.insurerName || null,
                      insurancePolicyRef: compForm.insurancePolicyRef || null,
                      insuranceRenewalDate: compForm.insuranceRenewalDate || null,
                      insurancePremiumPence: compForm.insurancePremiumPence ? Math.round(parseFloat(compForm.insurancePremiumPence) * 100) : null,
                      depreciationMethod: compForm.depreciationMethod || null,
                      depreciationRatePct: compForm.depreciationRatePct ? parseInt(compForm.depreciationRatePct) : null,
                      purchaseDate: compForm.purchaseDate || null,
                      purchasePricePence: compForm.purchasePricePence ? Math.round(parseFloat(compForm.purchasePricePence) * 100) : null
                    };
                    const res = await fetch(`/api/farms/${farmId}/equipment/${managingItem.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
                    if (!res.ok) throw new Error("Save failed");
                    toast({ title: "Compliance record saved" });
                    queryClient.invalidateQueries({ queryKey: getListEquipmentQueryKey(farmId ?? 0) });
                  } catch {
                    toast({ title: "Save failed", variant: "destructive" });
                  } finally {
                    setCompSaving(false);
                  }
                },
                children: compSaving ? "Saving…" : "Save Compliance Record"
              }
            )
          ] })
        ] })
      ] }) }),
      disposeItem && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
        if (!o) {
          setDisposeItem(null);
          setDisposeForm(EMPTY_DISPOSE_FORM);
          disposeMutation.reset();
        }
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "36rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PackageX, { size: 18, style: { color: "#dc2626" } }),
            " Record Disposal — ",
            disposeItem.name
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#6b7280", marginTop: 4 }, children: "This will remove the item from your active fleet and record the disposal in the asset register audit trail." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 14, paddingTop: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                "Disposal Method ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "select",
                {
                  value: disposeForm.disposalMethod,
                  onChange: (e) => setDisposeForm((f) => ({ ...f, disposalMethod: e.target.value })),
                  className: "mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring",
                  children: DISPOSAL_METHODS.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: m.value, children: m.label }, m.value))
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                "Date of Disposal ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "date",
                  max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
                  className: "mt-1",
                  value: disposeForm.disposalDate,
                  onChange: (e) => setDisposeForm((f) => ({ ...f, disposalDate: e.target.value }))
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: disposeForm.disposalMethod === "sold" ? "Sale Price (£)" : disposeForm.disposalMethod === "scrapped" ? "Scrap Value (£, if any)" : disposeForm.disposalMethod === "part_exchange" ? "Part Exchange Value (£)" : "Disposal Price (£, if applicable)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  step: "0.01",
                  min: "0",
                  className: "mt-1",
                  placeholder: "0.00",
                  value: disposeForm.disposalPrice,
                  onChange: (e) => setDisposeForm((f) => ({ ...f, disposalPrice: e.target.value }))
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: disposeForm.disposalMethod === "sold" ? "Buyer Name" : disposeForm.disposalMethod === "scrapped" ? "Scrap Contractor" : disposeForm.disposalMethod === "transferred" ? "Destination Holding" : "Buyer / Contractor / Details" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  className: "mt-1",
                  placeholder: disposeForm.disposalMethod === "sold" ? "e.g. Smith's Farm" : disposeForm.disposalMethod === "scrapped" ? "e.g. Jones Metal Recycling Ltd" : "",
                  value: disposeForm.disposalBuyerOrContractor,
                  onChange: (e) => setDisposeForm((f) => ({ ...f, disposalBuyerOrContractor: e.target.value }))
                }
              )
            ] })
          ] }),
          (disposeForm.disposalMethod === "scrapped" || disposeForm.disposalMethod === "other") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Waste Transfer Note Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                className: "mt-1",
                placeholder: "e.g. WTN-2025-0142",
                value: disposeForm.wasteTransferNoteRef,
                onChange: (e) => setDisposeForm((f) => ({ ...f, wasteTransferNoteRef: e.target.value }))
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginTop: 4 }, children: "Required when scrapping metal or disposing of waste through a licensed carrier." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes (optional)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                className: "mt-1",
                placeholder: "Any additional details about the disposal…",
                value: disposeForm.disposalNotes,
                onChange: (e) => setDisposeForm((f) => ({ ...f, disposalNotes: e.target.value })),
                rows: 3
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", fontSize: "0.8125rem", color: "#92400e" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Note:" }),
            " Disposal records are permanent for audit purposes. The item will remain visible in the register (marked as disposed) and can be filtered out from the active fleet view."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { style: { marginTop: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
            setDisposeItem(null);
            setDisposeForm(EMPTY_DISPOSE_FORM);
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              onClick: submitDispose,
              disabled: disposeMutation.isPending || !disposeForm.disposalDate,
              style: { background: "#dc2626", color: "#fff" },
              children: [
                disposeMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 mr-2 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(PackageX, { className: "w-4 h-4 mr-2" }),
                "Confirm Disposal"
              ]
            }
          )
        ] })
      ] }) }),
      printOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
        if (!o) setPrintOpen(false);
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-5xl max-h-[90vh] overflow-y-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-5 h-5 text-green-600" }),
            "Print — Machinery & Equipment Register"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Review the asset list below, then click Print to produce a compliance document for Red Tractor audit." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { id: "equipment-print-area", className: "border border-border rounded-lg p-6 space-y-4 text-sm mt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start border-b pb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base font-bold text-foreground", children: farm?.name ?? "Farm" }),
              farm?.address && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/60", children: [
                farm.address,
                farm.postcode ? `, ${farm.postcode}` : ""
              ] }),
              farm?.cphNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/60 mt-0.5", children: [
                "CPH: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-semibold", children: farm.cphNumber })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right text-xs text-foreground/50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground text-sm", children: "Machinery & Equipment Register" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "Printed: ",
                printedDate
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                allEquipment.filter((e) => e.status !== "disposed").length,
                " active item",
                allEquipment.filter((e) => e.status !== "disposed").length !== 1 ? "s" : "",
                disposedCount > 0 ? ` · ${disposedCount} disposed` : ""
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs border-collapse", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-green-50 text-foreground/70", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "border border-border/60 px-3 py-2 text-left font-semibold", children: "Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "border border-border/60 px-3 py-2 text-left font-semibold", children: "Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "border border-border/60 px-3 py-2 text-left font-semibold", children: "Make / Model" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "border border-border/60 px-3 py-2 text-left font-semibold", children: "Serial / Reg" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "border border-border/60 px-3 py-2 text-left font-semibold", children: "Year" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "border border-border/60 px-3 py-2 text-left font-semibold", children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "border border-border/60 px-3 py-2 text-left font-semibold", children: "Next Calibration" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: allEquipment.map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: i % 2 === 0 ? "bg-white" : "bg-black/[0.02]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-border/60 px-3 py-2", children: item.name || `Asset #${item.id}` }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-border/60 px-3 py-2", children: item.type || "-" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-border/60 px-3 py-2", children: [item.make, item.model].filter(Boolean).join(" ") || "-" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-border/60 px-3 py-2 font-mono", children: item.serialNumber || item.registrationNumber || "-" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-border/60 px-3 py-2", children: item.yearOfManufacture || "-" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-border/60 px-3 py-2", children: item.status === "disposed" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#6b7280" }, children: [
                "Disposed — ",
                disposalLabel(item.disposalMethod),
                item.disposalDate ? ` (${fmt(item.disposalDate)})` : ""
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#166534", fontWeight: 600 }, children: "Active" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-border/60 px-3 py-2", children: item.nextCalibrationDue ? new Date(item.nextCalibrationDue).toLocaleDateString("en-GB") : "-" })
            ] }, item.id)) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-foreground/40 border-t pt-3 italic", children: [
            "This is an on-farm record for Red Tractor compliance purposes. Retain for a minimum of 3 years and make available for inspection at audit. BDE Farm Trac · Printed ",
            printedDate
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-3 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setPrintOpen(false), children: "Close" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleEquipmentPrint, className: "gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4" }),
            " Print Register"
          ] })
        ] })
      ] }) }),
      qrItem && farmId && /* @__PURE__ */ jsxRuntimeExports.jsx(
        EquipQRDialog,
        {
          equip: qrItem,
          farmId,
          farmName: farm?.name ?? "Farm",
          onClose: () => setQrItem(null)
        }
      )
    ] })
  ] });
}
export {
  EquipmentPage as default
};
