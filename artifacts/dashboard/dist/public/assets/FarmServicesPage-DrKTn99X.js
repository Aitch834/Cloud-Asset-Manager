import { s as createLucideIcon, b as useAppStore, r as reactExports, m as useQuery, j as jsxRuntimeExports, c as useQueryClient, a as useToast, S as useMutation, d as Button, T as Plus, M as MapPin, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, J as DialogFooter, L as Label, I as Input, N as DialogMutationError, e as LoaderCircle, B as Building2, $ as RefreshCw, A as ArrowRight, X, b5 as printHtml } from "./index-CTNdWNpd.js";
import { A as AppLayout, T as TrendingUp, U as Users, c as ClipboardList, a as Wheat, e as ChartColumn, C as CalendarDays, F as Fuel } from "./AppLayout-UnB4Z3KW.js";
import { T as Textarea } from "./textarea-UyJWocoD.js";
import { C as ConfirmDialog } from "./confirm-dialog-C0c3MML-.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BUhJDDvP.js";
import { u as usePersistedTab } from "./use-persisted-tab-CAaTkOSk.js";
import { a as usePersistedFilter } from "./use-persisted-filter-7kB8-Nqd.js";
import { u as useFarmMembers } from "./use-farm-members-BbnE7DUj.js";
import { S as StaffSelect } from "./staff-select-B9r8xNso.js";
import { T as TabBar, a as TabButton } from "./tab-button-Dw-cltjc.js";
import { R as Receipt } from "./receipt-DffREl1M.js";
import { T as Tractor, A as ArrowLeft } from "./tractor-E5BpJDTm.js";
import { T as TriangleAlert } from "./triangle-alert-C2XQ3roM.js";
import { P as Phone } from "./phone-Dejzzpwr.js";
import { M as Mail } from "./mail-D3mpjgPJ.js";
import { C as CircleCheckBig } from "./circle-check-big-BjD_NO23.js";
import { C as CircleX } from "./circle-x-4MU6mcsw.js";
import { E as Eye } from "./eye-Bcmucein.js";
import { P as Pencil } from "./pencil-DbmEUE1M.js";
import { T as Trash2, C as ChevronDown } from "./trash-2-B-Z0JBqp.js";
import { F as FileText, S as ShieldAlert, C as ClipboardCheck } from "./shield-alert-BmiBeqnv.js";
import { C as Calendar } from "./calendar-DRYUdK3h.js";
import { P as Printer } from "./printer-o6IfmwUB.js";
import { C as ChevronUp } from "./chevron-up-I9_kOSJE.js";
import { S as SquareCheckBig } from "./square-check-big-DkI2VLbC.js";
import { C as Circle } from "./circle-Dknnx_Tk.js";
import { U as User } from "./user-IQp9FxCc.js";
import { a as Clock } from "./database-B3JsLWfZ.js";
import { S as ShieldCheck } from "./shield-check-DXlKaonl.js";
import "./use-safe-clerk-Y4-rOQQn.js";
import "./index-Cge-B78I.js";
import "./index-BVMIuYg2.js";
const __iconNode = [
  ["path", { d: "M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16", key: "jecpp" }],
  ["rect", { width: "20", height: "14", x: "2", y: "6", rx: "2", key: "i6l2r4" }]
];
const Briefcase = createLucideIcon("briefcase", __iconNode);
const AGREEMENT_TYPES = [
  { value: "grain_storage", label: "Grain Storage" },
  { value: "drying_service", label: "Drying Service" },
  { value: "land_rental", label: "Land Rental" },
  { value: "contract_farming", label: "Contract Farming" },
  { value: "machinery_hire", label: "Machinery Hire" },
  { value: "haulage", label: "Haulage" },
  { value: "other", label: "Other" }
];
const AGREEMENT_STATUS = [
  { value: "draft", label: "Draft", colour: "bg-muted text-muted-foreground" },
  { value: "active", label: "Active", colour: "bg-green-100 text-green-800" },
  { value: "expired", label: "Expired", colour: "bg-amber-100 text-amber-800" },
  { value: "terminated", label: "Terminated", colour: "bg-red-100 text-red-800" }
];
const GRAIN_STATUSES = [
  { value: "in_store", label: "In Store", colour: "bg-green-100 text-green-800" },
  { value: "partially_removed", label: "Partially Removed", colour: "bg-amber-100 text-amber-800" },
  { value: "removed", label: "Fully Removed", colour: "bg-muted text-muted-foreground" }
];
const MOVEMENT_TYPES = [
  { value: "outloading", label: "Outloading" },
  { value: "drying", label: "Sent for Drying" },
  { value: "treatment", label: "Treatment" },
  { value: "transfer", label: "Transfer" },
  { value: "loss", label: "Loss / Adjustment" }
];
const INVOICE_STATUSES = [
  { value: "draft", label: "Draft", colour: "bg-muted text-muted-foreground" },
  { value: "sent", label: "Sent", colour: "bg-blue-100 text-blue-800" },
  { value: "paid", label: "Paid", colour: "bg-green-100 text-green-800" },
  { value: "overdue", label: "Overdue", colour: "bg-red-100 text-red-800" },
  { value: "cancelled", label: "Cancelled", colour: "bg-muted text-muted-foreground" }
];
const COMMODITIES = ["Winter Wheat", "Spring Wheat", "Winter Barley", "Spring Barley", "Oilseed Rape", "Oats", "Rye", "Triticale", "Peas", "Beans", "Linseed", "Other"];
const PAYMENT_FREQS = [
  { value: "annual", label: "Annual" },
  { value: "biannual", label: "Bi-annual" },
  { value: "quarterly", label: "Quarterly" },
  { value: "monthly", label: "Monthly" }
];
const HIRE_STATUSES = [
  { value: "booked", label: "Booked", colour: "bg-blue-100 text-blue-800" },
  { value: "active", label: "Active", colour: "bg-green-100 text-green-800" },
  { value: "returned", label: "Returned", colour: "bg-purple-100 text-purple-800" },
  { value: "invoiced", label: "Invoiced", colour: "bg-amber-100 text-amber-800" },
  { value: "cancelled", label: "Cancelled", colour: "bg-muted text-muted-foreground" }
];
const HIRE_RATE_TYPES = [
  { value: "daily", label: "Daily" },
  { value: "hourly", label: "Hourly" },
  { value: "weekly", label: "Weekly" },
  { value: "fixed", label: "Fixed Price" }
];
const HIRE_OPERATOR_TYPES = [
  { value: "customer_operated", label: "Customer Operated" },
  { value: "farm_operator", label: "Farm Operator Provided" }
];
const HIRE_FUEL_POLICIES = [
  { value: "customer_supplied", label: "Customer Supplies Own Fuel" },
  { value: "included_in_rate", label: "Fuel Included in Rate" },
  { value: "billed_back", label: "Fuel Billed Back to Customer" }
];
const HIRE_CONDITION_RATINGS = [
  { value: "good", label: "Good", colour: "bg-green-100 text-green-800" },
  { value: "acceptable", label: "Acceptable", colour: "bg-amber-100 text-amber-800" },
  { value: "poor", label: "Poor — Damage Noted", colour: "bg-red-100 text-red-800" }
];
function fmtPence(p) {
  return `£${(p / 100).toFixed(2)}`;
}
function statusBadge(val, list) {
  const s = list.find((x) => x.value === val);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[11px] font-medium px-2 py-0.5 rounded-full ${s?.colour ?? "bg-muted"}`, children: s?.label ?? val });
}
function agreementTypeLabel(v) {
  return AGREEMENT_TYPES.find((t) => t.value === v)?.label ?? v;
}
function docStyles() {
  return `<style>
    *{box-sizing:border-box}
    body{font-family:'Segoe UI',Arial,sans-serif;font-size:11.5px;color:#1a1a1a;padding:32px;max-width:820px;margin:0 auto}
    h2{font-size:15px;font-weight:600;margin:0 0 12px}
    .doc-header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:14px;border-bottom:3px solid #2d5a27;margin-bottom:20px}
    .farm-name{font-size:18px;font-weight:700;color:#1a1a1a}
    .farm-meta{font-size:11px;color:#555;margin-top:3px;line-height:1.6}
    .doc-meta{text-align:right;font-size:11px;color:#666;line-height:1.6}
    .doc-title{font-size:20px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#2d5a27;margin:0 0 16px}
    table{width:100%;border-collapse:collapse;margin-top:8px}
    th{background:#f0f5ef;text-align:left;padding:7px 10px;border-bottom:2px solid #2d5a27;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#2d5a27}
    td{padding:7px 10px;border-bottom:1px solid #e8eee8;vertical-align:top}
    tr:last-child td{border-bottom:none}
    .tr-total td{border-top:2px solid #2d5a27;font-weight:700;background:#f0f5ef}
    .amount{text-align:right;font-variant-numeric:tabular-nums}
    .section{margin-top:20px}
    .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    .lbl{font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:#888;margin-bottom:2px}
    .val{font-weight:500}
    .footer{margin-top:28px;padding-top:10px;border-top:1px solid #ddd;font-size:10px;color:#888;display:flex;justify-content:space-between}
    .badge{display:inline-block;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:600;background:#f0f5ef;color:#2d5a27;border:1px solid #c5d9c2}
    .highlight{background:#fffbeb;border-left:3px solid #d97706;padding:8px 12px;margin:12px 0;font-size:11px}
    @media print{body{padding:20px}}
  </style>`;
}
function docHeader(farm) {
  const now = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const logoHtml = farm?.invoiceLogoPath ? `<img src="${window.location.origin}/api/storage/objects/${farm.invoiceLogoPath}" style="max-width:200px;max-height:70px;object-fit:contain;display:block;margin-bottom:6px" onerror="this.style.display='none'" />` : "";
  const metaParts = [
    farm?.address || "",
    farm?.postcode || "",
    farm?.bcmsHoldingNumber ? `CPH No: ${farm.bcmsHoldingNumber}` : "",
    farm?.companyNumber ? `Co. Reg: ${farm.companyNumber}` : "",
    farm?.vatNumber ? `VAT Reg: ${farm.vatNumber}` : ""
  ].filter(Boolean).join("<br>");
  return `<div class="doc-header">
    <div>
      ${logoHtml}
      <div class="farm-name">${farm?.name ?? "BDE Farm Trac"}</div>
      <div class="farm-meta">${metaParts}</div>
    </div>
    <div class="doc-meta">
      <div style="font-weight:700;color:#2d5a27;font-size:13px;margin-bottom:4px">BDE Farm Trac</div>
      <div>Barnett Davies Enterprises Ltd</div>
      <div>Produced: ${now}</div>
    </div>
  </div>`;
}
function CustomersTab({ farmId, customers, isLoading }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [edit, setEdit] = reactExports.useState(null);
  const [showInactive, setShowInactive] = reactExports.useState(false);
  const [form, setForm] = reactExports.useState({ name: "", contactName: "", contactPhone: "", contactEmail: "", address: "", holdingNumber: "", vatNumber: "", notes: "", isActive: true });
  const saveMut = useMutation({
    mutationFn: (body) => {
      const url = edit ? `/api/farms/${farmId}/farm-customers/${edit.id}` : `/api/farms/${farmId}/farm-customers`;
      return fetch(url, { method: edit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["farm-customers", farmId] });
      setOpen(false);
      toast({ title: edit ? "Customer updated" : "Customer added" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/farm-customers/${id}`, { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["farm-customers", farmId] });
      toast({ title: "Customer deactivated" });
    },
    onError: () => toast({ title: "Failed", variant: "destructive" })
  });
  function openAdd() {
    setEdit(null);
    setForm({ name: "", contactName: "", contactPhone: "", contactEmail: "", address: "", holdingNumber: "", vatNumber: "", notes: "", isActive: true });
    setOpen(true);
  }
  function openEdit(c) {
    setEdit(c);
    setForm({ name: c.name, contactName: c.contactName ?? "", contactPhone: c.contactPhone ?? "", contactEmail: c.contactEmail ?? "", address: c.address ?? "", holdingNumber: c.holdingNumber ?? "", vatNumber: c.vatNumber ?? "", notes: c.notes ?? "", isActive: c.isActive });
    setOpen(true);
  }
  const visible = customers.filter((c) => showInactive || c.isActive);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm text-muted-foreground cursor-pointer", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: showInactive, onChange: (e) => setShowInactive(e.target.checked), className: "h-4 w-4" }),
        "Show inactive"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, className: "gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " Add Customer"
      ] })
    ] }),
    isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" }),
    !isLoading && visible.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-xl p-10 text-center text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-10 w-10 mx-auto mb-3 opacity-30" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "No customers yet. Add neighbouring farmers, tenants or contracting clients." })
    ] }),
    visible.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-xl overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium", children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium hidden md:table-cell", children: "Contact" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium hidden lg:table-cell", children: "Holding No." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium w-24", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 w-20" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: visible.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 font-medium", children: [
          c.name,
          c.address && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-0.5 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3" }),
            c.address.split(",")[0]
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground hidden md:table-cell", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
          c.contactName && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: c.contactName }),
          c.contactPhone && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3 w-3" }),
            c.contactPhone
          ] }),
          c.contactEmail && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-3 w-3" }),
            c.contactEmail
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground hidden lg:table-cell text-xs font-mono", children: c.holdingNumber || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: c.isActive ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-green-600 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-4 w-4" }),
          " Active"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-muted-foreground text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4" }),
          " Inactive"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 justify-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setViewRecord(c), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => openEdit(c), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => deleteMut.mutate(c.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
        ] }) })
      ] }, c.id)) })
    ] }) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Customer" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.name ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Contact Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.contactName ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Phone" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.contactPhone ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.contactEmail ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Holding No." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium font-mono", children: String(viewRecord.holdingNumber ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "VAT Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.vatNumber ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.address ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium whitespace-pre-wrap", children: String(viewRecord.notes ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.isActive ? "Active" : "Inactive" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) {
        setEdit(null);
        saveMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 560 }, "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: edit ? "Edit Customer" : "Add Customer" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pt-1 max-h-[75vh] overflow-y-auto pr-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Business / Farmer name ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, placeholder: "e.g. J R Atkinson & Sons", value: form.name, onChange: (e) => setForm((f) => ({ ...f, name: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Contact name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Robert Atkinson", value: form.contactName, onChange: (e) => setForm((f) => ({ ...f, contactName: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Phone" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "07700 000000", value: form.contactPhone, onChange: (e) => setForm((f) => ({ ...f, contactPhone: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", placeholder: "farmer@example.com", value: form.contactEmail, onChange: (e) => setForm((f) => ({ ...f, contactEmail: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "CPH / Holding No." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. 22/456/0001", value: form.holdingNumber, onChange: (e) => setForm((f) => ({ ...f, holdingNumber: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Farm address or postcode", value: form.address, onChange: (e) => setForm((f) => ({ ...f, address: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "VAT number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "GB 123 4567 89", value: form.vatNumber, onChange: (e) => setForm((f) => ({ ...f, vatNumber: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "cust-active", checked: form.isActive, onChange: (e) => setForm((f) => ({ ...f, isActive: e.target.checked })), className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cust-active", className: "cursor-pointer font-normal", children: "Active customer" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: saveMut.isPending || !form.name, onClick: () => saveMut.mutate(form), children: saveMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : edit ? "Save Changes" : "Add Customer" })
      ] })
    ] }) })
  ] });
}
function AgreementsTab({ farmId, customers }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [edit, setEdit] = reactExports.useState(null);
  const [showHistory, setShowHistory] = reactExports.useState(false);
  const emptyForm = () => ({
    customerId: "",
    agreementType: "grain_storage",
    title: "",
    referenceNumber: "",
    startDate: "",
    endDate: "",
    status: "active",
    areaHa: "",
    annualRentPence: "",
    paymentFrequency: "annual",
    nextPaymentDate: "",
    maxTonnesContracted: "",
    storageRatePptWeek: "",
    intakeChargePpt: "",
    outloadingChargePpt: "",
    dryingChargePpt: "",
    dayRatePence: "",
    notes: ""
  });
  const [form, setForm] = reactExports.useState(emptyForm());
  const agreementsQ = useQuery({
    queryKey: ["service-agreements", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/service-agreements`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const agreements = agreementsQ.data?.records ?? [];
  const farmQ = useQuery({
    queryKey: ["farm", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const farm = farmQ.data?.record;
  function printAgreementSummary(a) {
    const custName = customers.find((c) => c.id === a.customerId)?.name ?? "—";
    const custAddr = customers.find((c) => c.id === a.customerId)?.address ?? "";
    const custHolding = customers.find((c) => c.id === a.customerId)?.holdingNumber ?? "";
    const isLand = a.agreementType === "land_rental";
    const isStore = ["grain_storage", "drying_service"].includes(a.agreementType);
    const isContract = ["contract_farming", "machinery_hire", "haulage"].includes(a.agreementType);
    const row = (label, val) => val ? `<tr><td class="lbl" style="width:200px;padding-right:16px">${label}</td><td class="val">${val}</td></tr>` : "";
    const termRows = [
      isStore && a.maxTonnesContracted ? row("Max Tonnes", `${a.maxTonnesContracted} t`) : "",
      isStore && a.storageRatePptWeek ? row("Storage Rate", `£${parseFloat(a.storageRatePptWeek).toFixed(4)}/t/week`) : "",
      isStore && a.intakeChargePpt ? row("Intake Charge", `£${parseFloat(a.intakeChargePpt).toFixed(4)}/t`) : "",
      isStore && a.outloadingChargePpt ? row("Outloading Charge", `£${parseFloat(a.outloadingChargePpt).toFixed(4)}/t`) : "",
      isStore && a.dryingChargePpt ? row("Drying Charge", `£${parseFloat(a.dryingChargePpt).toFixed(4)}/t`) : "",
      isLand && a.areaHa ? row("Area", `${a.areaHa} ha`) : "",
      isLand && a.annualRentPence ? row("Annual Rent", fmtPence(a.annualRentPence)) : "",
      isLand && a.paymentFrequency ? row("Payment Frequency", a.paymentFrequency.charAt(0).toUpperCase() + a.paymentFrequency.slice(1)) : "",
      isLand && a.nextPaymentDate ? row("Next Payment Due", a.nextPaymentDate) : "",
      isContract && a.dayRatePence ? row("Day Rate", fmtPence(a.dayRatePence)) : ""
    ].join("");
    const statusLabel = AGREEMENT_STATUS.find((s) => s.value === a.status)?.label ?? a.status;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Agreement — ${a.title}</title>${docStyles()}</head><body>
      ${docHeader(farm)}
      <div class="doc-title">Service Agreement Summary</div>
      <div class="grid-2" style="margin-bottom:20px">
        <div>
          <div class="lbl">Agreement Party</div>
          <div class="val" style="font-size:13px">${custName}</div>
          ${custAddr ? `<div style="font-size:11px;color:#555;margin-top:2px">${custAddr}</div>` : ""}
          ${custHolding ? `<div style="font-size:11px;color:#555">CPH: ${custHolding}</div>` : ""}
        </div>
        <div style="text-align:right">
          <span class="badge">${statusLabel}</span>
          ${a.referenceNumber ? `<div style="margin-top:6px;font-variant-numeric:tabular-nums;font-weight:600;font-size:13px;color:#2d5a27">${a.referenceNumber}</div>` : ""}
        </div>
      </div>
      <table style="margin-bottom:0">
        <tbody>
          ${row("Agreement Title", a.title)}
          ${row("Agreement Type", agreementTypeLabel(a.agreementType))}
          ${row("Start Date", a.startDate)}
          ${row("End Date", a.endDate)}
          ${termRows}
          ${a.notes ? row("Notes", a.notes) : ""}
        </tbody>
      </table>
      <div class="highlight" style="margin-top:20px">
        This agreement summary is for reference only. It is not a legally binding document in isolation. 
        Both parties should retain signed copies of the full agreement. This document was produced by BDE Farm Trac.
      </div>
      <div class="footer"><span>Agreement: ${a.title} — ${custName}</span><span>Produced by BDE Farm Trac</span></div>
    </body></html>`;
    printHtml(html);
  }
  const saveMut = useMutation({
    mutationFn: (body) => {
      const url = edit ? `/api/farms/${farmId}/service-agreements/${edit.id}` : `/api/farms/${farmId}/service-agreements`;
      return fetch(url, { method: edit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["service-agreements", farmId] });
      setOpen(false);
      toast({ title: edit ? "Agreement updated" : "Agreement added" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/service-agreements/${id}`, { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["service-agreements", farmId] });
      toast({ title: "Agreement terminated" });
    },
    onError: () => toast({ title: "Failed", variant: "destructive" })
  });
  function openAdd() {
    setEdit(null);
    setForm(emptyForm());
    setOpen(true);
  }
  function openEdit(a) {
    setEdit(a);
    setForm({
      customerId: String(a.customerId),
      agreementType: a.agreementType,
      title: a.title,
      referenceNumber: a.referenceNumber ?? "",
      startDate: a.startDate ?? "",
      endDate: a.endDate ?? "",
      status: a.status,
      areaHa: a.areaHa ?? "",
      annualRentPence: a.annualRentPence != null ? String(a.annualRentPence / 100) : "",
      paymentFrequency: a.paymentFrequency ?? "annual",
      nextPaymentDate: a.nextPaymentDate ?? "",
      maxTonnesContracted: a.maxTonnesContracted ?? "",
      storageRatePptWeek: a.storageRatePptWeek ?? "",
      intakeChargePpt: a.intakeChargePpt ?? "",
      outloadingChargePpt: a.outloadingChargePpt ?? "",
      dryingChargePpt: a.dryingChargePpt ?? "",
      dayRatePence: a.dayRatePence != null ? String(a.dayRatePence / 100) : "",
      notes: a.notes ?? ""
    });
    setOpen(true);
  }
  function openRenew(a) {
    setEdit(null);
    setForm({
      customerId: String(a.customerId),
      agreementType: a.agreementType,
      title: a.title,
      referenceNumber: "",
      startDate: "",
      endDate: "",
      status: "active",
      areaHa: a.areaHa ?? "",
      annualRentPence: a.annualRentPence != null ? String(a.annualRentPence / 100) : "",
      paymentFrequency: a.paymentFrequency ?? "annual",
      nextPaymentDate: "",
      maxTonnesContracted: a.maxTonnesContracted ?? "",
      storageRatePptWeek: a.storageRatePptWeek ?? "",
      intakeChargePpt: a.intakeChargePpt ?? "",
      outloadingChargePpt: a.outloadingChargePpt ?? "",
      dryingChargePpt: a.dryingChargePpt ?? "",
      dayRatePence: a.dayRatePence != null ? String(a.dayRatePence / 100) : "",
      notes: a.notes ?? ""
    });
    setOpen(true);
  }
  function handleSave() {
    const isLandRental2 = form.agreementType === "land_rental";
    const isStorage2 = ["grain_storage", "drying_service"].includes(form.agreementType);
    const isContracting2 = ["contract_farming", "machinery_hire", "haulage"].includes(form.agreementType);
    saveMut.mutate({
      customerId: parseInt(form.customerId),
      agreementType: form.agreementType,
      title: form.title,
      referenceNumber: form.referenceNumber || null,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      status: form.status,
      areaHa: isLandRental2 ? form.areaHa || null : null,
      annualRentPence: isLandRental2 && form.annualRentPence ? Math.round(parseFloat(form.annualRentPence) * 100) : null,
      paymentFrequency: isLandRental2 ? form.paymentFrequency || null : null,
      nextPaymentDate: isLandRental2 ? form.nextPaymentDate || null : null,
      maxTonnesContracted: isStorage2 ? form.maxTonnesContracted || null : null,
      storageRatePptWeek: isStorage2 ? form.storageRatePptWeek || null : null,
      intakeChargePpt: isStorage2 ? form.intakeChargePpt || null : null,
      outloadingChargePpt: isStorage2 ? form.outloadingChargePpt || null : null,
      dryingChargePpt: isStorage2 ? form.dryingChargePpt || null : null,
      dayRatePence: isContracting2 && form.dayRatePence ? Math.round(parseFloat(form.dayRatePence) * 100) : null,
      notes: form.notes || null
    });
  }
  function customerName(id) {
    return customers.find((c) => c.id === id)?.name ?? "—";
  }
  const isLandRental = form.agreementType === "land_rental";
  const isStorage = ["grain_storage", "drying_service"].includes(form.agreementType);
  const isContracting = ["contract_farming", "machinery_hire", "haulage"].includes(form.agreementType);
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const activeAgreements = agreements.filter((a) => a.status === "active");
  const historicAgreements = agreements.filter((a) => a.status !== "active");
  const visibleAgreements = showHistory ? agreements : activeAgreements;
  const expiringCount = activeAgreements.filter((a) => expiryInfo(a) !== null).length;
  const landRentalAnnualPence = activeAgreements.filter((a) => a.agreementType === "land_rental").reduce((s, a) => s + (a.annualRentPence || 0), 0);
  function expiryInfo(a) {
    if (!a.endDate || a.status !== "active") return null;
    const daysUntil = Math.round(((/* @__PURE__ */ new Date(a.endDate + "T00:00:00Z")).getTime() - (/* @__PURE__ */ new Date(todayStr + "T00:00:00Z")).getTime()) / (24 * 60 * 60 * 1e3));
    if (daysUntil > 30) return null;
    if (daysUntil < 0) return { daysUntil, label: "Expired", colour: "text-red-600 bg-red-50 border-red-200" };
    if (daysUntil <= 7) return { daysUntil, label: `Expires in ${daysUntil}d`, colour: "text-red-600 bg-red-50 border-red-200" };
    return { daysUntil, label: `Expires in ${daysUntil}d`, colour: "text-amber-700 bg-amber-50 border-amber-200" };
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    agreements.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/40 rounded-lg p-3 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold", children: agreements.length }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Total Agreements" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 rounded-lg p-3 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold text-green-800", children: activeAgreements.length }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-green-700", children: "Active" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg p-3 text-center ${expiringCount > 0 ? "bg-amber-50" : "bg-muted/40"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-xl font-bold ${expiringCount > 0 ? "text-amber-800" : ""}`, children: expiringCount }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-xs ${expiringCount > 0 ? "text-amber-700" : "text-muted-foreground"}`, children: "Expiring ≤30 days" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 rounded-lg p-3 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold text-blue-800", children: landRentalAnnualPence ? fmtPence(landRentalAnnualPence) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-blue-700", children: "Annual Land Rent" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: historicAgreements.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setShowHistory((v) => !v),
          className: `text-xs px-3 py-1.5 rounded-full border transition-colors ${showHistory ? "bg-muted border-border text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`,
          children: showHistory ? "Hide history" : `Show history (${historicAgreements.length} ended)`
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, className: "gap-1.5", disabled: customers.length === 0, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " New Agreement"
      ] })
    ] }),
    customers.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3", children: "Add a customer first before creating agreements." }),
    agreementsQ.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" }),
    !agreementsQ.isLoading && activeAgreements.length === 0 && !showHistory && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-xl p-10 text-center text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-10 w-10 mx-auto mb-3 opacity-30" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: historicAgreements.length > 0 ? "No active agreements — use the history toggle to view past ones." : "No service agreements yet — land rentals, storage contracts, drying services and contract farming." })
    ] }),
    visibleAgreements.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      showHistory && historicAgreements.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground px-1 pb-1 border-b", children: [
        "Showing ",
        activeAgreements.length,
        " active + ",
        historicAgreements.length,
        " historic agreement",
        historicAgreements.length !== 1 ? "s" : ""
      ] }),
      visibleAgreements.map((a) => {
        const expiry = expiryInfo(a);
        const isHistoric = a.status !== "active";
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `border rounded-xl p-4 hover:bg-muted/20 ${isHistoric ? "opacity-60" : ""}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-medium ${isHistoric ? "text-muted-foreground" : ""}`, children: a.title }),
              statusBadge(a.status, AGREEMENT_STATUS),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full", children: agreementTypeLabel(a.agreementType) }),
              expiry && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs px-2 py-0.5 rounded-full border font-medium ${expiry.colour}`, children: expiry.label })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground mt-1 flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-3.5 w-3.5" }),
              customerName(a.customerId),
              a.referenceNumber && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 font-mono text-xs", children: a.referenceNumber })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground", children: [
              a.startDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3 w-3" }),
                a.startDate,
                a.endDate ? ` → ${a.endDate}` : ""
              ] }),
              a.annualRentPence && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-foreground", children: [
                fmtPence(a.annualRentPence),
                "/year rent"
              ] }),
              a.maxTonnesContracted && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                a.maxTonnesContracted,
                "t contracted"
              ] }),
              a.storageRatePptWeek && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Storage £",
                parseFloat(a.storageRatePptWeek).toFixed(4),
                "/t/wk"
              ] }),
              a.dayRatePence && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                fmtPence(a.dayRatePence),
                "/day"
              ] }),
              a.areaHa && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                a.areaHa,
                " ha"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: "Print agreement summary", onClick: () => printAgreementSummary(a), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setViewRecord(a), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) }),
            isHistoric ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", className: "text-xs gap-1 h-8 px-2 text-green-700 hover:text-green-800 hover:bg-green-50", onClick: () => openRenew(a), title: "Create a new agreement based on this one", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5" }),
              " Renew"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => openEdit(a), title: "Edit / extend agreement", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => deleteMut.mutate(a.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
          ] })
        ] }) }, a.id);
      })
    ] }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Agreement" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Title" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.title ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Customer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: customerName(viewRecord.customerId) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Agreement Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: agreementTypeLabel(viewRecord.agreementType) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Reference Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.referenceNumber ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Start Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.startDate ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "End Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.endDate ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.status ?? "—") })
        ] }),
        viewRecord.agreementType === "land_rental" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Area (ha)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.areaHa ?? "—") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Annual Rent" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.annualRentPence != null ? fmtPence(viewRecord.annualRentPence) : "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Payment Frequency" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.paymentFrequency ?? "—") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Next Payment Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.nextPaymentDate ?? "—") })
          ] })
        ] }),
        ["grain_storage", "drying_service"].includes(viewRecord.agreementType) && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Max Tonnes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.maxTonnesContracted ?? "—") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Storage Rate (£/t/wk)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.storageRatePptWeek ?? "—") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Intake Charge (£/t)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.intakeChargePpt ?? "—") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Outloading Charge (£/t)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.outloadingChargePpt ?? "—") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Drying Charge (£/t)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.dryingChargePpt ?? "—") })
          ] })
        ] }),
        ["contract_farming", "machinery_hire", "haulage"].includes(viewRecord.agreementType) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Day Rate" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.dayRatePence != null ? fmtPence(viewRecord.dayRatePence) : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium whitespace-pre-wrap", children: String(viewRecord.notes ?? "—") })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "gap-1.5 mr-auto", onClick: () => printAgreementSummary(viewRecord), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-4 w-4" }),
          " Print"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) {
        setEdit(null);
        saveMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 620 }, "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: edit ? "Edit Agreement" : "New Service Agreement" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pt-1 max-h-[78vh] overflow-y-auto pr-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Customer ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.customerId, onValueChange: (v) => setForm((f) => ({ ...f, customerId: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select customer" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: customers.filter((c) => c.isActive).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(c.id), children: c.name }, c.id)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Agreement type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.agreementType, onValueChange: (v) => setForm((f) => ({ ...f, agreementType: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: AGREEMENT_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Title ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Grain storage — Atkinson 2024/25 season", value: form.title, onChange: (e) => setForm((f) => ({ ...f, title: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reference number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. SA-2024-001", value: form.referenceNumber, onChange: (e) => setForm((f) => ({ ...f, referenceNumber: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status, onValueChange: (v) => setForm((f) => ({ ...f, status: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: AGREEMENT_STATUS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.value, children: s.label }, s.value)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Start date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.startDate, onChange: (e) => setForm((f) => ({ ...f, startDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "End date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.endDate, onChange: (e) => setForm((f) => ({ ...f, endDate: e.target.value })) })
          ] })
        ] }),
        isLandRental && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-green-50/50 p-3 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-green-800 uppercase tracking-wide", children: "Land Rental Terms" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Area (ha)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", placeholder: "25.00", value: form.areaHa, onChange: (e) => setForm((f) => ({ ...f, areaHa: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Annual rent (£)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", placeholder: "3500.00", value: form.annualRentPence, onChange: (e) => setForm((f) => ({ ...f, annualRentPence: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment frequency" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.paymentFrequency, onValueChange: (v) => setForm((f) => ({ ...f, paymentFrequency: v })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PAYMENT_FREQS.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p.value, children: p.label }, p.value)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next payment due" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.nextPaymentDate, onChange: (e) => setForm((f) => ({ ...f, nextPaymentDate: e.target.value })) })
            ] })
          ] })
        ] }),
        isStorage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-amber-50/50 p-3 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-amber-800 uppercase tracking-wide", children: "Storage / Drying Rates" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Max tonnes contracted" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", placeholder: "500", value: form.maxTonnesContracted, onChange: (e) => setForm((f) => ({ ...f, maxTonnesContracted: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Storage (£/t/week)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.0001", placeholder: "0.52", value: form.storageRatePptWeek, onChange: (e) => setForm((f) => ({ ...f, storageRatePptWeek: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Intake (£/t)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.0001", placeholder: "1.40", value: form.intakeChargePpt, onChange: (e) => setForm((f) => ({ ...f, intakeChargePpt: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Outloading (£/t)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.0001", placeholder: "1.40", value: form.outloadingChargePpt, onChange: (e) => setForm((f) => ({ ...f, outloadingChargePpt: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Drying (£/t)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.0001", placeholder: "8.50", value: form.dryingChargePpt, onChange: (e) => setForm((f) => ({ ...f, dryingChargePpt: e.target.value })) })
            ] })
          ] })
        ] }),
        isContracting && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-blue-50/50 p-3 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-blue-800 uppercase tracking-wide", children: "Contracting Terms" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Day rate (£/day)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", placeholder: "350.00", value: form.dayRatePence, onChange: (e) => setForm((f) => ({ ...f, dayRatePence: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: saveMut.isPending || !form.customerId || !form.title, onClick: handleSave, children: saveMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : edit ? "Save Changes" : "Create Agreement" })
      ] })
    ] }) })
  ] });
}
function GrainIntakeTab({ farmId, customers }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [edit, setEdit] = reactExports.useState(null);
  const [expandedId, setExpandedId] = reactExports.useState(null);
  const [movementOpen, setMovementOpen] = reactExports.useState(null);
  const emptyMvForm = () => ({
    movementDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    movementType: "outloading",
    quantityTonnes: "",
    destination: "",
    vehicleReg: "",
    haulier: "",
    haulierId: "",
    transportArrangedBy: "customer",
    notes: ""
  });
  const [mvForm, setMvForm] = reactExports.useState(emptyMvForm());
  const emptyForm = () => ({
    customerId: "",
    agreementId: "",
    storageLocationId: "",
    intakeDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    commodity: "Winter Wheat",
    variety: "",
    quantityTonnes: "",
    moisturePercent: "",
    screeningsPercent: "",
    specificWeightKgHl: "",
    grade: "",
    lotReference: "",
    deliveryNoteRef: "",
    vehicleReg: "",
    haulier: "",
    haulierId: "",
    transportArrangedBy: "customer",
    bayOrBin: "",
    status: "in_store",
    notes: ""
  });
  const [form, setForm] = reactExports.useState(emptyForm());
  const intakesQ = useQuery({
    queryKey: ["grain-intakes", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/grain-intakes`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const intakes = intakesQ.data?.records ?? [];
  const agreementsQ = useQuery({
    queryKey: ["service-agreements", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/service-agreements`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const agreements = agreementsQ.data?.records ?? [];
  const storageLocsQ = useQuery({
    queryKey: ["storage-locations", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/storage-locations`, { credentials: "include" }).then((r) => r.ok ? r.json() : { records: [] }),
    enabled: !!farmId
  });
  const storageLocs = storageLocsQ.data?.records ?? [];
  const hauliersQ = useQuery({
    queryKey: ["hauliers", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/hauliers`, { credentials: "include" }).then((r) => r.ok ? r.json() : { records: [] }),
    enabled: !!farmId
  });
  const hauliers = hauliersQ.data?.records ?? [];
  const movementsQ = useQuery({
    queryKey: ["grain-movements", farmId, expandedId],
    queryFn: () => fetch(`/api/farms/${farmId}/grain-intakes/${expandedId}/movements`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId && !!expandedId
  });
  const movements = movementsQ.data?.records ?? [];
  const farmQ = useQuery({
    queryKey: ["farm", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const farm = farmQ.data?.record;
  function printLotCertificate(i, lotMovements) {
    const custName = customers.find((c) => c.id === i.customerId)?.name ?? "—";
    const custAddr = customers.find((c) => c.id === i.customerId)?.address ?? "";
    const custHolding = customers.find((c) => c.id === i.customerId)?.holdingNumber ?? "";
    const agr = agreements.find((a) => a.id === i.agreementId);
    const storageLoc = storageLocs.find((l) => l.id === i.storageLocationId);
    const lotRef = i.lotReference || `LOT-${String(i.id).padStart(5, "0")}`;
    const statusLabel = GRAIN_STATUSES.find((s) => s.value === i.status)?.label ?? i.status;
    const totalOut = lotMovements.filter((m) => m.movementType === "outloading").reduce((s, m) => s + parseFloat(m.quantityTonnes), 0);
    const balance = parseFloat(i.quantityTonnes) - totalOut;
    const mvRows = lotMovements.length > 0 ? lotMovements.map((m) => `<tr>
        <td>${m.movementDate}</td>
        <td>${MOVEMENT_TYPES.find((t) => t.value === m.movementType)?.label ?? m.movementType}</td>
        <td class="amount">${parseFloat(m.quantityTonnes).toFixed(3)} t</td>
        <td>${m.destination ?? "—"}</td>
        <td>${m.vehicleReg ?? "—"}</td>
        <td>${m.haulier ?? "—"}</td>
      </tr>`).join("") : `<tr><td colspan="6" style="color:#888;font-style:italic">No movements recorded</td></tr>`;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Lot Certificate ${lotRef}</title>${docStyles()}</head><body>
      ${docHeader(farm)}
      <div class="doc-title">Grain Intake / Lot Certificate</div>
      <div class="grid-2" style="margin-bottom:20px">
        <div>
          <div class="lbl">Lot Reference</div>
          <div style="font-size:20px;font-weight:700;color:#2d5a27;font-variant-numeric:tabular-nums">${lotRef}</div>
          <div style="margin-top:8px"><div class="lbl">Customer / Supplier</div>
          <div class="val">${custName}</div>
          ${custAddr ? `<div style="font-size:11px;color:#555">${custAddr}</div>` : ""}
          ${custHolding ? `<div style="font-size:11px;color:#555">CPH: ${custHolding}</div>` : ""}</div>
        </div>
        <div style="text-align:right">
          <span class="badge">${statusLabel}</span>
          ${agr ? `<div style="margin-top:6px;font-size:11px;color:#555">Agreement: ${agr.title}</div>` : ""}
        </div>
      </div>
      <table>
        <thead><tr><th colspan="2">Intake Details</th></tr></thead>
        <tbody>
          <tr><td style="width:50%" class="lbl">Intake Date</td><td class="val">${i.intakeDate}</td></tr>
          <tr><td class="lbl">Commodity</td><td class="val">${i.commodity}${i.variety ? " — " + i.variety : ""}</td></tr>
          <tr><td class="lbl">Quantity on Intake</td><td class="val" style="font-weight:700">${parseFloat(i.quantityTonnes).toFixed(3)} t</td></tr>
          ${i.moisturePercent ? `<tr><td class="lbl">Moisture</td><td class="val">${i.moisturePercent}%</td></tr>` : ""}
          ${i.specificWeightKgHl ? `<tr><td class="lbl">Specific Weight</td><td class="val">${i.specificWeightKgHl} kg/hl</td></tr>` : ""}
          ${i.screeningsPercent ? `<tr><td class="lbl">Screenings</td><td class="val">${i.screeningsPercent}%</td></tr>` : ""}
          ${i.grade ? `<tr><td class="lbl">Grade</td><td class="val">${i.grade}</td></tr>` : ""}
          ${i.deliveryNoteRef ? `<tr><td class="lbl">Delivery Note Ref</td><td class="val">${i.deliveryNoteRef}</td></tr>` : ""}
          ${i.vehicleReg ? `<tr><td class="lbl">Vehicle Reg (intake)</td><td class="val">${i.vehicleReg}</td></tr>` : ""}
          ${i.haulier ? `<tr><td class="lbl">Haulier (intake)</td><td class="val">${i.haulier}</td></tr>` : ""}
          ${storageLoc ? `<tr><td class="lbl">Storage Location</td><td class="val">${storageLoc.name}${storageLoc.storageCode ? " (" + storageLoc.storageCode + ")" : ""}</td></tr>` : ""}
          ${i.bayOrBin ? `<tr><td class="lbl">Bay / Bin</td><td class="val">${i.bayOrBin}</td></tr>` : ""}
          ${i.notes ? `<tr><td class="lbl">Notes</td><td class="val">${i.notes}</td></tr>` : ""}
        </tbody>
      </table>
      <div class="section">
        <h2>Movement History</h2>
        <table>
          <thead><tr><th>Date</th><th>Type</th><th class="amount">Quantity</th><th>Destination</th><th>Vehicle</th><th>Haulier</th></tr></thead>
          <tbody>${mvRows}</tbody>
          <tfoot>
            <tr class="tr-total">
              <td colspan="2">Balance Remaining</td>
              <td class="amount">${balance.toFixed(3)} t</td>
              <td colspan="3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div class="footer"><span>Lot Certificate: ${lotRef} — ${custName}</span><span>Produced by BDE Farm Trac · Red Tractor Scheme</span></div>
    </body></html>`;
    printHtml(html);
  }
  function printMovementCertificate(i, m) {
    const custName = customers.find((c) => c.id === i.customerId)?.name ?? "—";
    const lotRef = i.lotReference || `LOT-${String(i.id).padStart(5, "0")}`;
    const mvTypeLabel = MOVEMENT_TYPES.find((t) => t.value === m.movementType)?.label ?? m.movementType;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Movement Certificate</title>${docStyles()}</head><body>
      ${docHeader(farm)}
      <div class="doc-title">${mvTypeLabel} Certificate</div>
      <div class="grid-2" style="margin-bottom:20px">
        <div>
          <div class="lbl">Customer</div>
          <div class="val" style="font-size:13px">${custName}</div>
          <div style="margin-top:8px"><div class="lbl">Lot Reference</div>
          <div style="font-weight:700;color:#2d5a27">${lotRef}</div></div>
        </div>
        <div style="text-align:right">
          <div style="font-size:22px;font-weight:700;color:#2d5a27">${m.movementDate}</div>
          <div style="font-size:11px;color:#888">Movement Date</div>
        </div>
      </div>
      <table>
        <thead><tr><th colspan="2">Movement Details</th></tr></thead>
        <tbody>
          <tr><td style="width:50%" class="lbl">Movement Type</td><td class="val">${mvTypeLabel}</td></tr>
          <tr><td class="lbl">Commodity</td><td class="val">${i.commodity}${i.variety ? " — " + i.variety : ""}</td></tr>
          <tr><td class="lbl">Quantity</td><td class="val" style="font-weight:700;font-size:14px">${parseFloat(m.quantityTonnes).toFixed(3)} t</td></tr>
          ${m.destination ? `<tr><td class="lbl">Destination / Buyer</td><td class="val">${m.destination}</td></tr>` : ""}
          ${m.vehicleReg ? `<tr><td class="lbl">Vehicle Registration</td><td class="val" style="font-family:monospace">${m.vehicleReg}</td></tr>` : ""}
          ${m.haulier ? `<tr><td class="lbl">Haulier</td><td class="val">${m.haulier}</td></tr>` : ""}
          ${m.deliveryNoteRef ? `<tr><td class="lbl">Delivery Note Ref</td><td class="val">${m.deliveryNoteRef}</td></tr>` : ""}
          <tr><td class="lbl">Quantity on Original Intake</td><td class="val">${parseFloat(i.quantityTonnes).toFixed(3)} t</td></tr>
          ${m.notes ? `<tr><td class="lbl">Notes</td><td class="val">${m.notes}</td></tr>` : ""}
        </tbody>
      </table>
      <div class="highlight" style="margin-top:20px">
        This document confirms the ${mvTypeLabel.toLowerCase()} of <strong>${parseFloat(m.quantityTonnes).toFixed(3)} tonnes</strong> of
        <strong>${i.commodity}</strong> from lot <strong>${lotRef}</strong> belonging to <strong>${custName}</strong>
        on <strong>${m.movementDate}</strong>.
      </div>
      <div class="footer"><span>Movement Certificate — ${lotRef} — ${m.movementDate}</span><span>Produced by BDE Farm Trac · Red Tractor Scheme</span></div>
    </body></html>`;
    printHtml(html);
  }
  function printStorageStatement() {
    const activeIntakes = intakes.filter((i) => i.status !== "removed");
    const byCustomer = customers.map((c) => ({
      customer: c,
      lots: activeIntakes.filter((i) => i.customerId === c.id)
    })).filter((g) => g.lots.length > 0);
    const totalInStoreAll = activeIntakes.reduce((s, i) => s + parseFloat(i.quantityTonnes), 0);
    const custSections = byCustomer.map(({ customer: c, lots }) => {
      const custTotal = lots.reduce((s, i) => s + parseFloat(i.quantityTonnes), 0);
      const rows = lots.map((i) => {
        const loc = storageLocs.find((l) => l.id === i.storageLocationId);
        return `<tr>
          <td>${i.lotReference || `LOT-${String(i.id).padStart(5, "0")}`}</td>
          <td>${i.intakeDate}</td>
          <td>${i.commodity}${i.variety ? " — " + i.variety : ""}</td>
          <td class="amount">${parseFloat(i.quantityTonnes).toFixed(3)}</td>
          <td>${loc ? loc.name : i.bayOrBin || "—"}</td>
          <td><span style="font-size:10px;padding:2px 6px;border-radius:9px;background:${i.status === "in_store" ? "#dcfce7" : "#fef9c3"};color:${i.status === "in_store" ? "#166534" : "#713f12"}">${GRAIN_STATUSES.find((s) => s.value === i.status)?.label ?? i.status}</span></td>
        </tr>`;
      }).join("");
      return `<div style="margin-bottom:24px">
        <h2 style="font-size:13px;font-weight:700;margin:0 0 4px;color:#1a1a1a">${c.name}</h2>
        ${c.holdingNumber ? `<div style="font-size:11px;color:#888;margin-bottom:6px">CPH: ${c.holdingNumber}</div>` : ""}
        <table>
          <thead><tr>
            <th>Lot Reference</th><th>Intake Date</th><th>Commodity</th>
            <th class="amount">Quantity (t)</th><th>Location</th><th>Status</th>
          </tr></thead>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr class="tr-total">
              <td colspan="3">Total in Store — ${c.name}</td>
              <td class="amount">${custTotal.toFixed(3)}</td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>
      </div>`;
    }).join("");
    const emptyNote = byCustomer.length === 0 ? `<p style="color:#888;font-style:italic;text-align:center;padding:24px">No third-party grain currently in store.</p>` : "";
    const now = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Grain Storage Statement — ${now}</title>${docStyles()}</head><body>
      ${docHeader(farm)}
      <div class="doc-title">Grain Storage Statement</div>
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:20px">
        <div style="font-size:12px;color:#555">Statement date: <strong>${now}</strong></div>
        <div style="font-size:16px;font-weight:700;color:#2d5a27">Total: ${totalInStoreAll.toFixed(3)} t</div>
      </div>
      ${custSections}${emptyNote}
      <div class="footer"><span>Grain Storage Statement — ${farm?.name ?? ""} — ${now}</span><span>Produced by BDE Farm Trac · Red Tractor Scheme</span></div>
    </body></html>`;
    printHtml(html);
  }
  const saveMut = useMutation({
    mutationFn: (body) => {
      const url = edit ? `/api/farms/${farmId}/grain-intakes/${edit.id}` : `/api/farms/${farmId}/grain-intakes`;
      return fetch(url, { method: edit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grain-intakes", farmId] });
      setOpen(false);
      toast({ title: edit ? "Intake updated" : "Intake recorded" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const saveMv = useMutation({
    mutationFn: ({ intakeId, body }) => fetch(`/api/farms/${farmId}/grain-intakes/${intakeId}/movements`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grain-movements", farmId, expandedId] });
      setMovementOpen(null);
      toast({ title: "Movement recorded" });
    },
    onError: () => toast({ title: "Failed", variant: "destructive" })
  });
  const deleteMv = useMutation({
    mutationFn: ({ intakeId, mvId }) => fetch(`/api/farms/${farmId}/grain-intakes/${intakeId}/movements/${mvId}`, { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grain-movements", farmId, expandedId] });
      toast({ title: "Movement deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEdit(null);
    setForm(emptyForm());
    setOpen(true);
  }
  function openEdit(i) {
    setEdit(i);
    setForm({
      customerId: String(i.customerId),
      agreementId: i.agreementId ? String(i.agreementId) : "",
      storageLocationId: i.storageLocationId ? String(i.storageLocationId) : "",
      intakeDate: i.intakeDate,
      commodity: i.commodity,
      variety: i.variety ?? "",
      quantityTonnes: i.quantityTonnes,
      moisturePercent: i.moisturePercent ?? "",
      screeningsPercent: i.screeningsPercent ?? "",
      specificWeightKgHl: i.specificWeightKgHl ?? "",
      grade: i.grade ?? "",
      lotReference: i.lotReference ?? "",
      deliveryNoteRef: i.deliveryNoteRef ?? "",
      vehicleReg: i.vehicleReg ?? "",
      haulier: i.haulier ?? "",
      haulierId: i.haulierId ? String(i.haulierId) : "",
      transportArrangedBy: i.transportArrangedBy || "customer",
      bayOrBin: i.bayOrBin ?? "",
      status: i.status,
      notes: i.notes ?? ""
    });
    setOpen(true);
  }
  function customerName(id) {
    return customers.find((c) => c.id === id)?.name ?? "—";
  }
  const totalInStore = intakes.filter((i) => i.status !== "removed").reduce((s, i) => s + parseFloat(i.quantityTonnes), 0);
  const lotsInStore = intakes.filter((i) => i.status !== "removed").length;
  const totalReceivedTonnes = intakes.reduce((s, i) => s + parseFloat(i.quantityTonnes), 0);
  const commoditiesInStore = [...new Set(intakes.filter((i) => i.status !== "removed").map((i) => i.commodity))].length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    intakes.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/40 rounded-lg p-3 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold", children: intakes.length }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Total Intakes" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 rounded-lg p-3 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold text-green-800", children: lotsInStore }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-green-700", children: "Lots in Store" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 rounded-lg p-3 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xl font-bold text-blue-800", children: [
          totalInStore.toFixed(1),
          "t"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-blue-700", children: "Tonnes in Store" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/40 rounded-lg p-3 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xl font-bold", children: [
          totalReceivedTonnes.toFixed(1),
          "t"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Total Received" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      intakes.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: commoditiesInStore }),
        " commodity type",
        commoditiesInStore !== 1 ? "s" : "",
        " currently in store"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 ml-auto", children: [
        intakes.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "gap-1.5", onClick: printStorageStatement, title: "Print grain storage statement", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-4 w-4" }),
          " Storage Statement"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "gap-1.5", onClick: openAdd, disabled: customers.length === 0, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          " Book In Grain"
        ] })
      ] })
    ] }),
    customers.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3", children: "Add a customer first." }),
    intakesQ.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" }),
    !intakesQ.isLoading && intakes.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-xl p-10 text-center text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Wheat, { className: "h-10 w-10 mx-auto mb-3 opacity-30" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "No third-party grain intakes recorded. Click Book In Grain when a customer delivers." })
    ] }),
    intakes.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-xl overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium", children: "Customer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium", children: "Commodity" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3 font-medium", children: "Qty (t)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium hidden md:table-cell", children: "Lot Ref" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium w-32", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 w-20" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: intakes.map((i) => {
        const isExp = expandedId === i.id;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 tabular-nums text-muted-foreground", children: i.intakeDate }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium", children: customerName(i.customerId) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
              i.commodity,
              i.variety ? ` — ${i.variety}` : ""
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right tabular-nums font-medium", children: parseFloat(i.quantityTonnes).toFixed(1) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground text-xs hidden md:table-cell font-mono", children: i.lotReference || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: statusBadge(i.status, GRAIN_STATUSES) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 justify-end", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: isExp ? "Collapse" : "Movements", onClick: () => setExpandedId(isExp ? null : i.id), className: "text-amber-600", children: isExp ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: "Print lot certificate", onClick: () => printLotCertificate(i, isExp ? movements : []), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setViewRecord(i), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => openEdit(i), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) })
            ] }) })
          ] }, i.id),
          isExp && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 7, className: "px-0 py-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/20 border-t px-6 py-4 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3.5 w-3.5 text-amber-600" }),
                " Grain Movements"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-7 text-xs gap-1", onClick: () => {
                setMovementOpen(i.id);
                setMvForm(emptyMvForm());
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
                " Record Movement"
              ] })
            ] }),
            movementsQ.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Loading…" }),
            !movementsQ.isLoading && movements.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground italic", children: "No movements recorded yet." }),
            movements.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-xs text-muted-foreground border-b border-muted/30 pb-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums", children: m.movementDate }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px] font-medium", children: MOVEMENT_TYPES.find((t) => t.value === m.movementType)?.label ?? m.movementType }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-foreground", children: [
                parseFloat(m.quantityTonnes).toFixed(1),
                "t"
              ] }),
              m.destination && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3 w-3 inline" }),
                " ",
                m.destination
              ] }),
              m.vehicleReg && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: m.vehicleReg }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { title: "Print movement certificate", onClick: () => printMovementCertificate(i, m), className: "ml-auto text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-3.5 w-3.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => deleteMv.mutate({ intakeId: i.id, mvId: m.id }), className: "text-destructive hover:opacity-70", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
            ] }, m.id))
          ] }) }) }, `${i.id}-mv`)
        ] });
      }) })
    ] }) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Grain Intake" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Intake Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.intakeDate ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Customer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: customerName(viewRecord.customerId) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Commodity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.commodity ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Variety" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.variety ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Quantity (t)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.quantityTonnes ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Moisture (%)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.moisturePercent ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Specific Weight (kg/hl)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.specificWeightKgHl ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Lot Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.lotReference ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Delivery Note Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.deliveryNoteRef ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Vehicle Reg" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.vehicleReg ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Bay / Bin" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.bayOrBin ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.status ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium whitespace-pre-wrap", children: String(viewRecord.notes ?? "—") })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "gap-1.5 mr-auto", onClick: () => printLotCertificate(viewRecord, expandedId === viewRecord.id ? movements : []), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-4 w-4" }),
          " Lot Certificate"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) {
        setEdit(null);
        saveMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 620 }, "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: edit ? "Edit Grain Intake" : "Book In Third-party Grain" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pt-1 max-h-[78vh] overflow-y-auto pr-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Customer ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.customerId, onValueChange: (v) => setForm((f) => ({ ...f, customerId: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select customer" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: customers.filter((c) => c.isActive).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(c.id), children: c.name }, c.id)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Intake date ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.intakeDate, onChange: (e) => setForm((f) => ({ ...f, intakeDate: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Commodity ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: COMMODITIES.filter((c) => c !== "Other").includes(form.commodity) ? form.commodity : form.commodity ? "Other" : "", onValueChange: (v) => setForm((f) => ({ ...f, commodity: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: COMMODITIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c)) })
            ] }),
            (form.commodity === "Other" || form.commodity && !COMMODITIES.filter((c) => c !== "Other").includes(form.commodity)) && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1.5", value: form.commodity === "Other" ? "" : form.commodity, onChange: (e) => setForm((f) => ({ ...f, commodity: e.target.value || "Other" })), placeholder: "Please specify commodity…" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Variety" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. KWS Zyatt", value: form.variety, onChange: (e) => setForm((f) => ({ ...f, variety: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Quantity (t) ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", placeholder: "150.00", value: form.quantityTonnes, onChange: (e) => setForm((f) => ({ ...f, quantityTonnes: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Moisture (%)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", placeholder: "15.2", value: form.moisturePercent, onChange: (e) => setForm((f) => ({ ...f, moisturePercent: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Spec weight (kg/hl)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", placeholder: "76.0", value: form.specificWeightKgHl, onChange: (e) => setForm((f) => ({ ...f, specificWeightKgHl: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lot reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. LOT-ATK-2024-001", value: form.lotReference, onChange: (e) => setForm((f) => ({ ...f, lotReference: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Delivery note ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. DN-2024-1041", value: form.deliveryNoteRef, onChange: (e) => setForm((f) => ({ ...f, deliveryNoteRef: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status, onValueChange: (v) => setForm((f) => ({ ...f, status: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: GRAIN_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.value, children: s.label }, s.value)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Agreement (optional)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.agreementId || "__none__", onValueChange: (v) => setForm((f) => ({ ...f, agreementId: v === "__none__" ? "" : v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "None" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "None" }),
                agreements.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(a.id), children: a.title }, a.id))
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Storage location" }),
            storageLocs.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.storageLocationId || "__none__", onValueChange: (v) => setForm((f) => ({ ...f, storageLocationId: v === "__none__" ? "" : v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select location" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not specified" }),
                storageLocs.map((loc) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(loc.id), children: [
                  loc.name,
                  loc.storageCode ? ` (${loc.storageCode})` : ""
                ] }, loc.id))
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. North Barn", value: form.bayOrBin, onChange: (e) => setForm((f) => ({ ...f, bayOrBin: e.target.value })) })
          ] }),
          storageLocs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bay / Bin (within location)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Bay A, North end", value: form.bayOrBin, onChange: (e) => setForm((f) => ({ ...f, bayOrBin: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-muted/30 p-3 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Transport arranged by" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 mt-1", children: [{ v: "customer", label: "Customer's lorry" }, { v: "holding", label: "Holding arranged" }].map(({ v, label }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setForm((f) => ({ ...f, transportArrangedBy: v, haulierId: v === "customer" ? "" : f.haulierId })),
                className: `text-sm px-3 py-1.5 rounded-lg border transition-colors ${form.transportArrangedBy === v ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:border-primary/50"}`,
                children: label
              },
              v
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: form.transportArrangedBy === "customer" ? "Customer organised their own haulier — record the vehicle that arrived." : "Holding booked a haulier from your directory on the customer's behalf." })
          ] }),
          form.transportArrangedBy === "holding" && hauliers.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Haulier (from directory)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.haulierId || "__none__", onValueChange: (v) => {
              const h = hauliers.find((x) => String(x.id) === v);
              setForm((f) => ({ ...f, haulierId: v === "__none__" ? "" : v, haulier: h ? h.companyName : f.haulier }));
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select haulier" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not in directory" }),
                hauliers.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(h.id), children: h.companyName }, h.id))
              ] })
            ] })
          ] }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vehicle reg" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "AB12 CDE", value: form.vehicleReg, onChange: (e) => setForm((f) => ({ ...f, vehicleReg: e.target.value })) })
            ] }),
            (form.transportArrangedBy === "customer" || !hauliers.length) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                "Haulier ",
                form.transportArrangedBy === "customer" ? "(if known)" : ""
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Haulier name", value: form.haulier, onChange: (e) => setForm((f) => ({ ...f, haulier: e.target.value })) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            disabled: saveMut.isPending || !form.customerId || !form.intakeDate || !form.quantityTonnes,
            onClick: () => saveMut.mutate({
              ...form,
              customerId: parseInt(form.customerId),
              agreementId: form.agreementId ? parseInt(form.agreementId) : null,
              storageLocationId: form.storageLocationId ? parseInt(form.storageLocationId) : null,
              haulierId: form.haulierId ? parseInt(form.haulierId) : null,
              quantityTonnes: form.quantityTonnes,
              moisturePercent: form.moisturePercent || null,
              screeningsPercent: form.screeningsPercent || null,
              specificWeightKgHl: form.specificWeightKgHl || null
            }),
            children: saveMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : edit ? "Save Changes" : "Book In"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: movementOpen !== null, onOpenChange: (o) => {
      if (!o) {
        setMovementOpen(null);
        saveMv.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 520 }, "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Record Grain Movement" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: mvForm.movementDate, onChange: (e) => setMvForm((f) => ({ ...f, movementDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Movement type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: mvForm.movementType, onValueChange: (v) => setMvForm((f) => ({ ...f, movementType: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: MOVEMENT_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Quantity (t) ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", placeholder: "150.00", value: mvForm.quantityTonnes, onChange: (e) => setMvForm((f) => ({ ...f, quantityTonnes: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Destination / buyer" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Frontier Ag Lincoln", value: mvForm.destination, onChange: (e) => setMvForm((f) => ({ ...f, destination: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-muted/30 p-3 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Transport arranged by" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 mt-1", children: [{ v: "customer", label: "Customer's lorry" }, { v: "holding", label: "Holding arranged" }].map(({ v, label }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setMvForm((f) => ({ ...f, transportArrangedBy: v, haulierId: v === "customer" ? "" : f.haulierId })),
                className: `text-sm px-3 py-1.5 rounded-lg border transition-colors ${mvForm.transportArrangedBy === v ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:border-primary/50"}`,
                children: label
              },
              v
            )) })
          ] }),
          mvForm.transportArrangedBy === "holding" && hauliers.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Haulier (from directory)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: mvForm.haulierId || "__none__", onValueChange: (v) => {
              const h = hauliers.find((x) => String(x.id) === v);
              setMvForm((f) => ({ ...f, haulierId: v === "__none__" ? "" : v, haulier: h ? h.companyName : f.haulier }));
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select haulier" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not in directory" }),
                hauliers.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(h.id), children: h.companyName }, h.id))
              ] })
            ] })
          ] }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vehicle reg" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "AB12 CDE", value: mvForm.vehicleReg, onChange: (e) => setMvForm((f) => ({ ...f, vehicleReg: e.target.value })) })
            ] }),
            (mvForm.transportArrangedBy === "customer" || !hauliers.length) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                "Haulier ",
                mvForm.transportArrangedBy === "customer" ? "(if known)" : ""
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Haulier name", value: mvForm.haulier, onChange: (e) => setMvForm((f) => ({ ...f, haulier: e.target.value })) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: mvForm.notes, onChange: (e) => setMvForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveMv, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setMovementOpen(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            disabled: saveMv.isPending || !mvForm.quantityTonnes,
            onClick: () => movementOpen !== null && saveMv.mutate({
              intakeId: movementOpen,
              body: {
                ...mvForm,
                haulierId: mvForm.haulierId ? parseInt(mvForm.haulierId) : null,
                destination: mvForm.destination || null,
                vehicleReg: mvForm.vehicleReg || null,
                haulier: mvForm.haulier || null,
                notes: mvForm.notes || null
              }
            }),
            children: saveMv.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : "Record Movement"
          }
        )
      ] })
    ] }) })
  ] });
}
const WO_STATUSES = [
  { value: "pending", label: "Scheduled", colour: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "in_progress", label: "In Progress", colour: "bg-amber-100 text-amber-800 border-amber-200" },
  { value: "completed", label: "Completed", colour: "bg-green-100 text-green-800 border-green-200" },
  { value: "cancelled", label: "Cancelled", colour: "bg-gray-100 text-gray-600 border-gray-200" }
];
function woBadge(status) {
  const s = WO_STATUSES.find((x) => x.value === status) ?? { label: status, colour: "bg-gray-100 text-gray-600 border-gray-200" };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${s.colour}`, children: s.label });
}
function WorkOrdersTab({ farmId, customers, onRaiseInvoice }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [filter, setFilter] = usePersistedFilter({ page: "farm-services-work-orders", filter: "status", farmId, defaultValue: "open" });
  const [expandedId, setExpandedId] = reactExports.useState(null);
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const [editWo, setEditWo] = reactExports.useState(null);
  const [completionNote, setCompletionNote] = reactExports.useState("");
  const [completingId, setCompletingId] = reactExports.useState(null);
  const [pendingDelete, setPendingDelete] = reactExports.useState(null);
  const emptyWoForm = () => ({
    title: "",
    description: "",
    assignedToMemberId: "",
    dueDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    estimatedHours: "",
    assignmentNote: "",
    customerId: ""
  });
  const [woForm, setWoForm] = reactExports.useState(emptyWoForm());
  const workOrdersQ = useQuery({
    queryKey: ["work-orders", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/work-orders`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const allOrders = workOrdersQ.data?.records ?? [];
  const membersQ = useQuery({
    queryKey: ["farm-members", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/members`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const members = membersQ.data?.members ?? [];
  const orders = filter === "open" ? allOrders.filter((w) => w.status !== "completed" && w.status !== "cancelled") : allOrders;
  const createMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/task-assignments`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["work-orders", farmId] });
      setDialogOpen(false);
      toast({ title: "Work order created" });
    },
    onError: () => toast({ title: "Failed to create work order", variant: "destructive" })
  });
  const updateMut = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/task-assignments/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["work-orders", farmId] });
      setCompletingId(null);
      setCompletionNote("");
      toast({ title: "Work order updated" });
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/task-assignments/${id}`, { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["work-orders", farmId] });
      toast({ title: "Work order deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openCreate() {
    setEditWo(null);
    setWoForm(emptyWoForm());
    setDialogOpen(true);
  }
  function openEdit(wo) {
    setEditWo(wo);
    setWoForm({
      title: wo.title,
      description: wo.description ?? "",
      assignedToMemberId: String(wo.assignedToMemberId),
      dueDate: wo.dueDate ?? "",
      estimatedHours: wo.estimatedHours ?? "",
      assignmentNote: wo.assignmentNote ?? "",
      customerId: wo.customerId ? String(wo.customerId) : ""
    });
    setDialogOpen(true);
  }
  function handleSave() {
    if (!woForm.title || !woForm.assignedToMemberId) {
      toast({ title: "Title and assignee are required", variant: "destructive" });
      return;
    }
    if (editWo) {
      updateMut.mutate({ id: editWo.id, body: {
        title: woForm.title,
        description: woForm.description || null,
        dueDate: woForm.dueDate || null,
        estimatedHours: woForm.estimatedHours || null,
        assignmentNote: woForm.assignmentNote || null,
        assignedToMemberId: parseInt(woForm.assignedToMemberId),
        customerId: woForm.customerId ? parseInt(woForm.customerId) : null
      } });
    } else {
      createMut.mutate({
        title: woForm.title,
        description: woForm.description || null,
        assignedToMemberId: parseInt(woForm.assignedToMemberId),
        dueDate: woForm.dueDate || null,
        estimatedHours: woForm.estimatedHours || null,
        assignmentNote: woForm.assignmentNote || null,
        customerId: woForm.customerId ? parseInt(woForm.customerId) : null,
        isWorkOrder: true
      });
    }
  }
  const openCount = allOrders.filter((w) => w.status !== "completed" && w.status !== "cancelled").length;
  const todayWo = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const thisMonthWo = (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
  const overdueWoCount = allOrders.filter((w) => w.status !== "completed" && w.status !== "cancelled" && w.dueDate && w.dueDate < todayWo).length;
  const completedThisMonth = allOrders.filter((w) => w.status === "completed" && w.completedAt && w.completedAt.startsWith(thisMonthWo)).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    allOrders.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/40 rounded-lg p-3 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold", children: allOrders.length }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Total Orders" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 rounded-lg p-3 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold text-green-800", children: openCount }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-green-700", children: "Open" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg p-3 text-center ${overdueWoCount > 0 ? "bg-red-50" : "bg-muted/40"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-xl font-bold ${overdueWoCount > 0 ? "text-red-700" : ""}`, children: overdueWoCount }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-xs ${overdueWoCount > 0 ? "text-red-600" : "text-muted-foreground"}`, children: "Overdue" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 rounded-lg p-3 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold text-blue-800", children: completedThisMonth }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-blue-700", children: "Completed This Month" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setFilter("open"),
            className: `text-sm px-3 py-1.5 rounded-md font-medium transition-colors ${filter === "open" ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`,
            children: [
              "Open ",
              openCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 bg-white/20 text-inherit rounded-full px-1.5 text-xs", children: openCount })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setFilter("all"),
            className: `text-sm px-3 py-1.5 rounded-md font-medium transition-colors ${filter === "all" ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`,
            children: "All"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "gap-1.5", onClick: openCreate, disabled: members.length === 0, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " New Work Order"
      ] })
    ] }),
    workOrdersQ.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" }),
    !workOrdersQ.isLoading && orders.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-xl p-12 text-center text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { className: "h-10 w-10 mx-auto mb-3 opacity-30" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: filter === "open" ? "No open work orders" : "No work orders yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1", children: filter === "open" ? "All caught up — or switch to 'All' to see completed orders." : "Raise a work order when scheduling contract work for another farmer, or attach one when creating an invoice." }),
      members.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-3 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 inline-block", children: "Add staff members first so you can assign work orders to them." })
    ] }),
    orders.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-xl overflow-hidden divide-y", children: orders.map((wo) => {
      const isExpanded = expandedId === wo.id;
      const isCompleting = completingId === wo.id;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            className: "w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-muted/30 transition-colors",
            onClick: () => setExpandedId(isExpanded ? null : wo.id),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 text-primary/60", children: wo.status === "completed" ? /* @__PURE__ */ jsxRuntimeExports.jsx(SquareCheckBig, { className: "h-4.5 w-4.5 text-green-600" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-4.5 w-4.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                  wo.workOrderRef && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-mono text-muted-foreground", children: wo.workOrderRef }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm truncate", children: wo.title }),
                  woBadge(wo.status)
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap", children: [
                  wo.customerName && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 font-medium text-foreground/70", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-3 w-3" }),
                    " ",
                    wo.customerName
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3 w-3" }),
                    " ",
                    wo.staffName
                  ] }),
                  wo.dueDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3 w-3" }),
                    " ",
                    wo.dueDate
                  ] }),
                  wo.estimatedHours && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
                    " ",
                    wo.estimatedHours,
                    "h est."
                  ] }),
                  wo.invoiceNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-3 w-3" }),
                    " ",
                    wo.invoiceNumber
                  ] })
                ] })
              ] }),
              isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-4 w-4 text-muted-foreground shrink-0 mt-0.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 text-muted-foreground shrink-0 mt-0.5" })
            ]
          }
        ),
        isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-4 space-y-3 bg-muted/20 border-t", children: [
          wo.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground pt-3", children: wo.description }),
          wo.assignmentNote && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm bg-blue-50 border border-blue-200 rounded-lg px-3 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-blue-800", children: "Instructions: " }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-blue-700", children: wo.assignmentNote })
          ] }),
          wo.completionNote && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm bg-green-50 border border-green-200 rounded-lg px-3 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-green-800", children: "Completion note: " }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-700", children: wo.completionNote })
          ] }),
          wo.completedAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "Completed: ",
            new Date(wo.completedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-1 flex-wrap", children: [
            wo.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                variant: "outline",
                className: "h-8 text-xs gap-1.5 text-amber-700 border-amber-300",
                onClick: () => updateMut.mutate({ id: wo.id, body: { status: "in_progress" } }),
                disabled: updateMut.isPending,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
                  " Mark In Progress"
                ]
              }
            ),
            (wo.status === "pending" || wo.status === "in_progress") && !isCompleting && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                variant: "outline",
                className: "h-8 text-xs gap-1.5 text-green-700 border-green-300",
                onClick: () => setCompletingId(wo.id),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-3 w-3" }),
                  " Mark Complete"
                ]
              }
            ),
            isCompleting && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 w-full", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  className: "h-8 text-xs flex-1",
                  placeholder: "Completion note (optional)…",
                  value: completionNote,
                  onChange: (e) => setCompletionNote(e.target.value)
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  className: "h-8 text-xs gap-1",
                  disabled: updateMut.isPending,
                  onClick: () => updateMut.mutate({ id: wo.id, body: { status: "completed", completionNote: completionNote || null } }),
                  children: [
                    updateMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-3 w-3" }),
                    " Confirm"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-8 text-xs", onClick: () => {
                setCompletingId(null);
                setCompletionNote("");
              }, children: "Cancel" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto flex items-center gap-1.5", children: [
              !wo.invoiceNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  className: "h-8 text-xs gap-1.5",
                  onClick: () => onRaiseInvoice({ customerId: wo.customerId ?? 0, customerName: wo.customerName ?? "", title: wo.title }),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-3 w-3" }),
                    " Raise Invoice"
                  ]
                }
              ),
              wo.invoiceNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground flex items-center gap-1 px-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-3 w-3" }),
                " ",
                wo.invoiceNumber
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-8 w-8 p-0", onClick: () => openEdit(wo), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  variant: "ghost",
                  className: "h-8 w-8 p-0 text-destructive hover:text-destructive",
                  onClick: () => setPendingDelete(wo),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" })
                }
              )
            ] })
          ] })
        ] })
      ] }, wo.id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dialogOpen, onOpenChange: (o) => {
      setDialogOpen(o);
      if (!o) {
        createMut.reset();
        updateMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 520 }, "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editWo ? `Edit ${editWo.workOrderRef ?? "Work Order"}` : "New Work Order" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Job title ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Hedge trimming — North Field boundary", value: woForm.title, onChange: (e) => setWoForm((f) => ({ ...f, title: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Customer / farm this work is for" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: woForm.customerId, onValueChange: (v) => setWoForm((f) => ({ ...f, customerId: v === "none" ? "" : v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select customer (optional)" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "— None / internal work —" }),
              customers.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(c.id), children: c.name }, c.id))
            ] })
          ] }),
          customers.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Add customers in the Customers tab to link work orders to them." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, placeholder: "Brief description of the work to be done…", value: woForm.description, onChange: (e) => setWoForm((f) => ({ ...f, description: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Assign to ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: woForm.assignedToMemberId, onValueChange: (v) => setWoForm((f) => ({ ...f, assignedToMemberId: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select staff member" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: members.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(m.id), children: [
                m.firstName,
                " ",
                m.lastName,
                m.jobTitle ? ` · ${m.jobTitle}` : ""
              ] }, m.id)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Scheduled date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", min: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: woForm.dueDate, onChange: (e) => setWoForm((f) => ({ ...f, dueDate: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Estimated hours" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.5", min: "0", placeholder: "e.g. 3.5", value: woForm.estimatedHours, onChange: (e) => setWoForm((f) => ({ ...f, estimatedHours: e.target.value })) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Instructions for assignee" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, placeholder: "Specific instructions, access codes, safety notes…", value: woForm.assignmentNote, onChange: (e) => setWoForm((f) => ({ ...f, assignmentNote: e.target.value })) })
        ] }),
        members.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2", children: "No staff registered — add staff members in the Staff directory first." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: createMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: updateMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDialogOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: createMut.isPending || updateMut.isPending || !woForm.title || !woForm.assignedToMemberId, onClick: handleSave, children: createMut.isPending || updateMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : editWo ? "Save Changes" : "Create Work Order" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: pendingDelete !== null,
        title: "Delete work order",
        message: pendingDelete ? `Delete work order ${pendingDelete.workOrderRef ?? pendingDelete.title}?` : "",
        confirmLabel: "Delete",
        confirmVariant: "destructive",
        mutation: deleteMut,
        onConfirm: () => {
          if (pendingDelete) deleteMut.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
        },
        onCancel: () => {
          setPendingDelete(null);
          deleteMut.reset();
        }
      }
    )
  ] });
}
function InvoicesTab({ farmId, customers, prefill }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [viewId, setViewId] = reactExports.useState(null);
  const [lines, setLines] = reactExports.useState([]);
  const emptyForm = () => ({
    customerId: "",
    agreementId: "",
    invoiceNumber: "",
    invoiceDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    dueDate: "",
    status: "draft",
    vatRatePercent: "20",
    notes: ""
  });
  const [form, setForm] = reactExports.useState(emptyForm());
  const prevPrefillRef = reactExports.useRef(void 0);
  reactExports.useEffect(() => {
    if (prefill && prefill !== prevPrefillRef.current) {
      prevPrefillRef.current = prefill;
      setForm((f) => ({ ...f, customerId: prefill.customerId ? String(prefill.customerId) : "" }));
      if (prefill.suggestedLines?.length) {
        setLines(prefill.suggestedLines);
      } else {
        setLines(prefill.title ? [{ description: prefill.title, quantity: "1", unit: "", unitPricePence: "0", lineTotalPence: 0 }] : []);
      }
      setOpen(true);
    }
  }, [prefill]);
  const emptyWoForm = () => ({ title: "", assignedToMemberId: "", scheduledDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), estimatedHours: "", instructions: "" });
  const [woEnabled, setWoEnabled] = reactExports.useState(false);
  const [woForm, setWoForm] = reactExports.useState(emptyWoForm());
  const membersQ = useQuery({
    queryKey: ["farm-members", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/members`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const members = membersQ.data?.members ?? [];
  const invoicesQ = useQuery({
    queryKey: ["service-invoices", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/service-invoices`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const invoices = invoicesQ.data?.records ?? [];
  const linesQ = useQuery({
    queryKey: ["invoice-lines", farmId, viewId],
    queryFn: () => fetch(`/api/farms/${farmId}/service-invoices/${viewId}/lines`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId && !!viewId
  });
  const agreementsQ = useQuery({
    queryKey: ["service-agreements", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/service-agreements`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const agreements = agreementsQ.data?.records ?? [];
  const farmQ = useQuery({
    queryKey: ["farm", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const farm = farmQ.data?.record;
  function printInvoice(inv) {
    const invLines = linesQ.data?.records ?? [];
    const invNumber = inv.invoiceNumber || `INV-${String(inv.id).padStart(4, "0")}`;
    const customer = customers.find((c) => c.id === inv.customerId);
    const agr = agreements.find((a) => a.id === inv.agreementId);
    const statusLabel = INVOICE_STATUSES.find((s) => s.value === inv.effectiveStatus)?.label ?? inv.effectiveStatus;
    const lineRows = invLines.map(
      (l) => `<tr>
        <td>${l.description}</td>
        <td class="amount">${l.quantity ? (l.quantity + " " + (l.unit ?? "")).trim() : "—"}</td>
        <td class="amount">${fmtPence(l.unitPricePence)}</td>
        <td class="amount">${fmtPence(l.lineTotalPence)}</td>
      </tr>`
    ).join("") || `<tr><td colspan="4" style="color:#888;font-style:italic">No line items</td></tr>`;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${invNumber}</title>${docStyles()}</head><body>
      ${docHeader(farm)}
      <div class="doc-title">Invoice</div>
      <div class="grid-2" style="margin-bottom:24px">
        <div>
          <div class="lbl">Invoice To</div>
          <div class="val" style="font-size:14px">${customer?.name ?? "—"}</div>
          ${customer?.address ? `<div style="font-size:11px;color:#555;margin-top:2px">${customer.address}</div>` : ""}
          ${customer?.holdingNumber ? `<div style="font-size:11px;color:#555">CPH: ${customer.holdingNumber}</div>` : ""}
          ${customer?.vatNumber ? `<div style="font-size:11px;color:#555">VAT No: ${customer.vatNumber}</div>` : ""}
        </div>
        <div style="text-align:right">
          <div style="font-size:20px;font-weight:700;color:#2d5a27;font-variant-numeric:tabular-nums">${invNumber}</div>
          <div style="margin-top:8px"><div class="lbl">Invoice Date</div><div class="val">${inv.invoiceDate}</div></div>
          ${inv.dueDate ? `<div style="margin-top:4px"><div class="lbl">Due Date</div><div class="val">${inv.dueDate}</div></div>` : ""}
          <div style="margin-top:6px"><span class="badge">${statusLabel}</span></div>
          ${agr ? `<div style="margin-top:6px;font-size:11px;color:#555">Agreement: ${agr.title}</div>` : ""}
        </div>
      </div>
      <table>
        <thead><tr><th>Description</th><th class="amount">Qty</th><th class="amount">Unit Price</th><th class="amount">Total</th></tr></thead>
        <tbody>${lineRows}</tbody>
        <tfoot>
          <tr><td colspan="3" class="amount" style="color:#888;padding-top:10px">Subtotal</td><td class="amount">${fmtPence(inv.subtotalPence)}</td></tr>
          <tr><td colspan="3" class="amount" style="color:#888">VAT (${inv.vatRatePercent}%)</td><td class="amount">${fmtPence(inv.vatPence)}</td></tr>
          <tr class="tr-total"><td colspan="3" class="amount">Total Due</td><td class="amount" style="font-size:15px">${fmtPence(inv.totalPence)}</td></tr>
          ${inv.paymentDate ? `<tr><td colspan="3" class="amount" style="color:#888;font-size:11px">Paid ${inv.paymentDate}${inv.paymentMethod ? " via " + inv.paymentMethod : ""}${inv.paymentReference ? " (Ref: " + inv.paymentReference + ")" : ""}</td><td class="amount" style="color:#2d5a27;font-weight:700">✓ Settled</td></tr>` : ""}
        </tfoot>
      </table>
      ${inv.notes ? `<p style="margin-top:16px;color:#555;font-size:11px"><strong>Notes:</strong> ${inv.notes}</p>` : ""}
      ${farm?.bankAccountNumber || farm?.bankSortCode || farm?.bankName ? `
      <div style="margin-top:20px;padding:12px 16px;background:#f0f5ef;border:1px solid #c5d9c2;border-radius:6px">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:#2d5a27;font-weight:700;margin-bottom:8px">Payment Details</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:11px">
          ${farm.bankName ? `<div><span style="color:#888">Bank:</span> ${farm.bankName}</div>` : ""}
          ${farm.bankAccountName ? `<div><span style="color:#888">Account Name:</span> ${farm.bankAccountName}</div>` : ""}
          ${farm.bankAccountNumber ? `<div><span style="color:#888">Account Number:</span> ${farm.bankAccountNumber}</div>` : ""}
          ${farm.bankSortCode ? `<div><span style="color:#888">Sort Code:</span> ${farm.bankSortCode}</div>` : ""}
          ${farm?.paymentTermsDays ? `<div style="grid-column:1/-1;margin-top:4px;color:#2d5a27;font-weight:600">Payment due within ${farm.paymentTermsDays} days of invoice date.</div>` : ""}
        </div>
      </div>` : ""}
      ${farm?.invoiceFooterText ? `<p style="margin-top:14px;font-size:10.5px;color:#555;border-top:1px solid #e5e7eb;padding-top:10px">${farm.invoiceFooterText}</p>` : ""}
      <div class="footer">
        <span>Invoice ${invNumber} — ${customer?.name ?? ""}</span>
        <span>Produced by BDE Farm Trac · Barnett Davies Enterprises Ltd</span>
      </div>
    </body></html>`;
    printHtml(html);
  }
  const saveMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/service-invoices`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: async (data) => {
      qc.invalidateQueries({ queryKey: ["service-invoices", farmId] });
      setOpen(false);
      if (woEnabled && woForm.assignedToMemberId && woForm.title) {
        const invoiceId = data?.record?.id;
        const firstLine = lines.find((l) => l.description)?.description ?? "";
        const woTitle = woForm.title || firstLine || "Ad-hoc work order";
        await fetch(`/api/farms/${farmId}/task-assignments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            isWorkOrder: true,
            title: woTitle,
            assignedToMemberId: parseInt(woForm.assignedToMemberId),
            dueDate: woForm.scheduledDate || null,
            estimatedHours: woForm.estimatedHours || null,
            assignmentNote: woForm.instructions || null,
            serviceInvoiceId: invoiceId ?? null
          })
        }).then(async (r) => {
          if (!r.ok) {
            const t = await r.text().catch(() => "");
            throw new Error(t || `Request failed (${r.status})`);
          }
          return r;
        });
        qc.invalidateQueries({ queryKey: ["work-orders", farmId] });
        toast({ title: "Invoice created + work order raised", description: `${woTitle} has been assigned.` });
      } else {
        toast({ title: "Invoice created" });
      }
      setWoEnabled(false);
      setWoForm(emptyWoForm());
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const markPaid = useMutation({
    mutationFn: ({ id, paymentDate }) => fetch(`/api/farms/${farmId}/service-invoices/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ status: "paid", paymentDate }) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["service-invoices", farmId] });
      toast({ title: "Marked as paid" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/service-invoices/${id}`, { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["service-invoices", farmId] });
      toast({ title: "Invoice deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function addLine() {
    setLines((l) => [...l, { description: "", quantity: "", unit: "tonnes", unitPricePence: "", lineTotalPence: 0 }]);
  }
  function updateLine(i, field, val) {
    setLines((prev) => prev.map((l, idx) => {
      if (idx !== i) return l;
      const updated = { ...l, [field]: val };
      if (field === "quantity" || field === "unitPricePence") {
        const qty = parseFloat(updated.quantity || "1") || 1;
        const unitP = Math.round(parseFloat(updated.unitPricePence || "0") * 100);
        updated.lineTotalPence = Math.round(qty * unitP);
      }
      return updated;
    }));
  }
  function handleCreate() {
    const processedLines = lines.filter((l) => l.description).map((l) => ({
      description: l.description,
      quantity: l.quantity || null,
      unit: l.unit || null,
      unitPricePence: Math.round(parseFloat(l.unitPricePence || "0") * 100),
      lineTotalPence: l.lineTotalPence
    }));
    saveMut.mutate({ ...form, customerId: parseInt(form.customerId), agreementId: form.agreementId ? parseInt(form.agreementId) : null, lines: processedLines });
  }
  function openAdd() {
    setForm(emptyForm());
    setLines([{ description: "", quantity: "", unit: "tonnes", unitPricePence: "", lineTotalPence: 0 }]);
    setWoEnabled(false);
    setWoForm(emptyWoForm());
    setOpen(true);
  }
  function customerName(id) {
    return customers.find((c) => c.id === id)?.name ?? "—";
  }
  const subtotal = lines.reduce((s, l) => s + l.lineTotalPence, 0);
  const vatAmount = Math.round(subtotal * parseFloat(form.vatRatePercent || "20") / 100);
  const total = subtotal + vatAmount;
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const invoicesWithStatus = invoices.map((inv) => ({
    ...inv,
    effectiveStatus: inv.status === "sent" && inv.dueDate && inv.dueDate < today ? "overdue" : inv.status
  }));
  const totalOutstanding = invoicesWithStatus.filter((i) => i.effectiveStatus !== "paid" && i.effectiveStatus !== "cancelled").reduce((s, i) => s + i.totalPence, 0);
  const overdueInvoices = invoicesWithStatus.filter((i) => i.effectiveStatus === "overdue");
  const overdueTotal = overdueInvoices.reduce((s, i) => s + i.totalPence, 0);
  const paidInvoices = invoicesWithStatus.filter((i) => i.effectiveStatus === "paid");
  const paidTotal = paidInvoices.reduce((s, i) => s + i.totalPence, 0);
  const draftCount = invoicesWithStatus.filter((i) => i.effectiveStatus === "draft").length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    overdueInvoices.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-red-800", children: [
        overdueInvoices.length,
        " overdue invoice",
        overdueInvoices.length !== 1 ? "s" : "",
        " — ",
        fmtPence(overdueTotal),
        " outstanding"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600 mt-0.5", children: "Payment is past the due date. Chase customers or mark as paid once received." })
    ] }) }),
    invoicesWithStatus.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/40 rounded-lg p-3 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold", children: invoicesWithStatus.length }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Total Invoices" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg p-3 text-center ${totalOutstanding > 0 ? "bg-amber-50" : "bg-muted/40"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-xl font-bold ${totalOutstanding > 0 ? "text-amber-800" : ""}`, children: fmtPence(totalOutstanding) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-xs ${totalOutstanding > 0 ? "text-amber-700" : "text-muted-foreground"}`, children: "Outstanding" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg p-3 text-center ${overdueInvoices.length > 0 ? "bg-red-50" : "bg-muted/40"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-xl font-bold ${overdueInvoices.length > 0 ? "text-red-700" : ""}`, children: overdueInvoices.length > 0 ? fmtPence(overdueTotal) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `text-xs ${overdueInvoices.length > 0 ? "text-red-600" : "text-muted-foreground"}`, children: [
          "Overdue",
          overdueInvoices.length > 0 ? ` (${overdueInvoices.length})` : ""
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 rounded-lg p-3 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold text-green-800", children: fmtPence(paidTotal) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-green-700", children: [
          "Paid (",
          paidInvoices.length,
          ")"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      draftCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
        draftCount,
        " draft",
        draftCount !== 1 ? "s" : "",
        " not yet sent"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "gap-1.5 ml-auto", onClick: openAdd, disabled: customers.length === 0, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " New Invoice"
      ] })
    ] }),
    invoicesQ.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" }),
    !invoicesQ.isLoading && invoicesWithStatus.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-xl p-10 text-center text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-10 w-10 mx-auto mb-3 opacity-30" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "No invoices yet — raise invoices to customers for storage, drying, land rent or contract work." })
    ] }),
    invoicesWithStatus.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-xl overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium", children: "Invoice" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium", children: "Customer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium hidden md:table-cell", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3 font-medium", children: "Total" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium w-28", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 w-24" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: invoicesWithStatus.map((inv) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: `hover:bg-muted/30 ${inv.effectiveStatus === "overdue" ? "bg-red-50" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono text-xs", children: inv.invoiceNumber || `INV-${String(inv.id).padStart(4, "0")}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium", children: customerName(inv.customerId) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: `px-4 py-3 hidden md:table-cell ${inv.effectiveStatus === "overdue" ? "text-red-600 font-medium" : "text-muted-foreground"}`, children: [
          inv.invoiceDate,
          inv.dueDate ? ` · due ${inv.dueDate}${inv.effectiveStatus === "overdue" ? " ⚠" : ""}` : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right font-semibold tabular-nums", children: fmtPence(inv.totalPence) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: statusBadge(inv.effectiveStatus, INVOICE_STATUSES) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 justify-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: "View lines", onClick: () => setViewId(inv.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4" }) }),
          inv.effectiveStatus !== "paid" && inv.effectiveStatus !== "cancelled" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: "Mark paid", onClick: () => markPaid.mutate({ id: inv.id, paymentDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: `h-4 w-4 ${inv.effectiveStatus === "overdue" ? "text-red-500" : "text-green-600"}` }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => deleteMut.mutate(inv.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
        ] }) })
      ] }, inv.id)) })
    ] }) }),
    viewId && (() => {
      const inv = invoices.find((i) => i.id === viewId);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
        if (!o) setViewId(null);
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 560 }, "aria-describedby": void 0, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          "Invoice ",
          inv?.invoiceNumber || `INV-${String(viewId).padStart(4, "0")}`
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
            inv && customerName(inv.customerId),
            " · ",
            inv?.invoiceDate
          ] }),
          linesQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Loading…" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-1.5", children: "Description" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-1.5", children: "Qty" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-1.5", children: "Unit £" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-1.5", children: "Total" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: (linesQ.data?.records ?? []).map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-muted/30", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 pr-2", children: l.description }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 text-right tabular-nums", children: l.quantity ? `${l.quantity} ${l.unit ?? ""}` : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 text-right tabular-nums", children: fmtPence(l.unitPricePence) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 text-right font-medium tabular-nums", children: fmtPence(l.lineTotalPence) })
            ] }, l.id)) }),
            inv && /* @__PURE__ */ jsxRuntimeExports.jsxs("tfoot", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 3, className: "py-1 text-right text-xs text-muted-foreground", children: "Subtotal" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 text-right tabular-nums", children: fmtPence(inv.subtotalPence) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { colSpan: 3, className: "py-1 text-right text-xs text-muted-foreground", children: [
                  "VAT (",
                  inv.vatRatePercent,
                  "%)"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 text-right tabular-nums", children: fmtPence(inv.vatPence) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 3, className: "py-2 text-right font-bold", children: "Total" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 text-right font-bold text-lg tabular-nums", children: fmtPence(inv.totalPence) })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          (() => {
            const inv2 = invoicesWithStatus.find((i) => i.id === viewId);
            return inv2 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "gap-1.5 mr-auto", onClick: () => printInvoice(inv2), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-4 w-4" }),
              " Print Invoice"
            ] }) : null;
          })(),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewId(null), children: "Close" })
        ] })
      ] }) });
    })(),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) saveMut.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 640 }, "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "New Invoice" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pt-1 max-h-[78vh] overflow-y-auto pr-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Customer ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.customerId, onValueChange: (v) => setForm((f) => ({ ...f, customerId: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select customer" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: customers.filter((c) => c.isActive).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(c.id), children: c.name }, c.id)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Agreement (optional)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.agreementId || "__none__", onValueChange: (v) => setForm((f) => ({ ...f, agreementId: v === "__none__" ? "" : v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "None" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "None" }),
                agreements.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(a.id), children: a.title }, a.id))
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Invoice number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "INV-2024-001", value: form.invoiceNumber, onChange: (e) => setForm((f) => ({ ...f, invoiceNumber: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Invoice date ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: form.invoiceDate, onChange: (e) => setForm((f) => ({ ...f, invoiceDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Due date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.dueDate, onChange: (e) => setForm((f) => ({ ...f, dueDate: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Line items" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-7 text-xs gap-1", onClick: addLine, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3" }),
              " Add line"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: lines.map((l, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-12 gap-2 items-start text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Description", value: l.description, onChange: (e) => updateLine(i, "description", e.target.value) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", placeholder: "Qty", value: l.quantity, onChange: (e) => updateLine(i, "quantity", e.target.value) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", placeholder: "£/unit", value: l.unitPricePence, onChange: (e) => updateLine(i, "unitPricePence", e.target.value) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 text-right pt-2 font-medium tabular-nums", children: fmtPence(l.lineTotalPence) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-1 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: () => setLines((prev) => prev.filter((_, idx) => idx !== i)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-destructive" }) }) })
          ] }, i)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-2 text-sm space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Subtotal" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums", children: fmtPence(subtotal) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-muted-foreground items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "VAT" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.vatRatePercent, onValueChange: (v) => setForm((f) => ({ ...f, vatRatePercent: v })), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 w-20 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "0", children: "0%" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "5", children: "5%" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "20", children: "20%" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums w-20 text-right", children: fmtPence(vatAmount) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between font-bold text-base", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums", children: fmtPence(total) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-xl overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              className: "w-full flex items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-muted/40 transition-colors",
              onClick: () => {
                setWoEnabled((v) => !v);
                if (!woEnabled) setWoForm((f) => ({ ...f, title: lines.find((l) => l.description)?.description ?? "" }));
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { className: "h-4 w-4 text-primary" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 text-left", children: "Schedule a Work Order with this invoice" }),
                woEnabled ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-4 w-4 text-muted-foreground" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 text-muted-foreground" }),
                woEnabled && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-primary font-semibold", children: "On" })
              ]
            }
          ),
          woEnabled && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t px-4 py-4 space-y-3 bg-muted/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "A work order will be raised, assigned to a staff member, and appear in their task list and the Week Ahead planner. It's linked to this invoice for full traceability." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                "Work description ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  placeholder: "e.g. Hedge trimming — North Field",
                  value: woForm.title,
                  onChange: (e) => setWoForm((f) => ({ ...f, title: e.target.value }))
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                  "Assign to ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: woForm.assignedToMemberId, onValueChange: (v) => setWoForm((f) => ({ ...f, assignedToMemberId: v })), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select staff member" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    members.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(m.id), children: [
                      m.firstName,
                      " ",
                      m.lastName
                    ] }, m.id)),
                    members.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "", disabled: true, children: "No staff registered" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Scheduled date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: "date",
                    min: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
                    value: woForm.scheduledDate,
                    onChange: (e) => setWoForm((f) => ({ ...f, scheduledDate: e.target.value }))
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Estimated hours" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  step: "0.5",
                  min: "0",
                  placeholder: "e.g. 4",
                  value: woForm.estimatedHours,
                  onChange: (e) => setWoForm((f) => ({ ...f, estimatedHours: e.target.value }))
                }
              )
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Instructions for assignee" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  rows: 2,
                  placeholder: "Access info, safety notes, specific tasks…",
                  value: woForm.instructions,
                  onChange: (e) => setWoForm((f) => ({ ...f, instructions: e.target.value }))
                }
              )
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: saveMut.isPending || !form.customerId || lines.filter((l) => l.description).length === 0 || woEnabled && (!woForm.title || !woForm.assignedToMemberId), onClick: handleCreate, children: saveMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : woEnabled ? "Create Invoice + Work Order" : "Create Invoice" })
      ] })
    ] }) })
  ] });
}
function printHireAgreement(detail, farm) {
  const b = detail.booking;
  const eq = [detail.equipmentName, detail.equipmentMake, detail.equipmentModel].filter(Boolean).join(" — ");
  const reg = detail.equipmentRegistration ? ` (Reg: ${detail.equipmentRegistration})` : "";
  const rateLabel = HIRE_RATE_TYPES.find((r) => r.value === b.rateType)?.label ?? b.rateType;
  const fuelLabel = HIRE_FUEL_POLICIES.find((f) => f.value === b.fuelPolicy)?.label ?? b.fuelPolicy;
  const opLabel = HIRE_OPERATOR_TYPES.find((o) => o.value === b.operatorType)?.label ?? b.operatorType;
  const rate = b.ratePence ? `£${(b.ratePence / 100).toFixed(2)} per ${rateLabel.toLowerCase()}` : "Rate TBC";
  const deposit = b.depositPence ? `£${(b.depositPence / 100).toFixed(2)}` : "None";
  const html = `<!DOCTYPE html><html><head><title>Hire Agreement — ${b.bookingRef || `#${b.id}`}</title>
  ${docStyles()}</head><body>
  ${docHeader(farm)}
  <h2>Equipment Hire Agreement</h2>
  <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
    <tr><td style="padding:5px 8px;border:1px solid #ddd;background:#f9f9f9;font-weight:600;width:38%">Booking Reference</td><td style="padding:5px 8px;border:1px solid #ddd">${b.bookingRef || `HIRE-${b.id}`}</td></tr>
    <tr><td style="padding:5px 8px;border:1px solid #ddd;background:#f9f9f9;font-weight:600">Hire Date (Start)</td><td style="padding:5px 8px;border:1px solid #ddd">${b.startDate}</td></tr>
    <tr><td style="padding:5px 8px;border:1px solid #ddd;background:#f9f9f9;font-weight:600">Planned Return Date</td><td style="padding:5px 8px;border:1px solid #ddd">${b.plannedEndDate || "Open"}</td></tr>
    <tr><td style="padding:5px 8px;border:1px solid #ddd;background:#f9f9f9;font-weight:600">Customer</td><td style="padding:5px 8px;border:1px solid #ddd">${detail.customer?.name || "—"}</td></tr>
    <tr><td style="padding:5px 8px;border:1px solid #ddd;background:#f9f9f9;font-weight:600">Customer Contact</td><td style="padding:5px 8px;border:1px solid #ddd">${detail.customer?.contactName || "—"}  ${detail.customer?.contactPhone || ""}</td></tr>
    <tr><td style="padding:5px 8px;border:1px solid #ddd;background:#f9f9f9;font-weight:600">Machine</td><td style="padding:5px 8px;border:1px solid #ddd">${eq}${reg}</td></tr>
    <tr><td style="padding:5px 8px;border:1px solid #ddd;background:#f9f9f9;font-weight:600">Operator</td><td style="padding:5px 8px;border:1px solid #ddd">${opLabel}${b.operatorName ? ` — ${b.operatorName}` : ""}</td></tr>
    <tr><td style="padding:5px 8px;border:1px solid #ddd;background:#f9f9f9;font-weight:600">Hire Rate</td><td style="padding:5px 8px;border:1px solid #ddd">${rate}</td></tr>
    <tr><td style="padding:5px 8px;border:1px solid #ddd;background:#f9f9f9;font-weight:600">Deposit</td><td style="padding:5px 8px;border:1px solid #ddd">${deposit}${b.depositPaidDate ? ` — Received ${b.depositPaidDate}` : " — Awaiting"}</td></tr>
    <tr><td style="padding:5px 8px;border:1px solid #ddd;background:#f9f9f9;font-weight:600">Fuel Arrangement</td><td style="padding:5px 8px;border:1px solid #ddd">${fuelLabel}</td></tr>
    <tr><td style="padding:5px 8px;border:1px solid #ddd;background:#f9f9f9;font-weight:600">Insurance Verified</td><td style="padding:5px 8px;border:1px solid #ddd">${b.insuranceVerified ? "✓ Yes — operator has confirmed valid insurance" : "✗ Not yet verified"}${b.insuranceNotes ? ` — ${b.insuranceNotes}` : ""}</td></tr>
    ${b.notes ? `<tr><td style="padding:5px 8px;border:1px solid #ddd;background:#f9f9f9;font-weight:600">Notes</td><td style="padding:5px 8px;border:1px solid #ddd">${b.notes}</td></tr>` : ""}
  </table>
  <h2 style="margin-top:24px">Terms &amp; Conditions</h2>
  <ol style="font-size:11px;line-height:1.7;padding-left:16px;color:#444">
    <li>The hirer shall take full responsibility for the safe operation of the equipment during the hire period.</li>
    <li>The hirer shall return the equipment in the same condition as received, fair wear and tear excepted.</li>
    <li>Any damage beyond fair wear and tear shall be charged to the hirer at cost of repair.</li>
    <li>The hirer must hold valid public liability insurance covering the use of hired agricultural equipment. Evidence of insurance must be provided on request.</li>
    <li>The hire rate is payable as agreed above. Late payment may attract a surcharge of 2% per month.</li>
    <li>Fuel charges (if applicable) will be invoiced at the prevailing farm pump rate at the date of issue.</li>
    <li>The equipment owner reserves the right to recover the equipment immediately in the event of misuse or non-payment.</li>
    <li>Hours meter readings at hire-out and return shall be recorded on the handover checklist and signed by both parties.</li>
  </ol>
  <div style="margin-top:32px;display:grid;grid-template-columns:1fr 1fr;gap:40px">
    <div>
      <p style="font-weight:600;margin-bottom:4px">Equipment Owner / Agent</p>
      <div style="border-bottom:1px solid #333;margin-bottom:6px;padding-bottom:40px"></div>
      <p style="font-size:10px;color:#666">Signature &amp; Date</p>
    </div>
    <div>
      <p style="font-weight:600;margin-bottom:4px">Hirer (Customer)</p>
      <div style="border-bottom:1px solid #333;margin-bottom:6px;padding-bottom:40px"></div>
      <p style="font-size:10px;color:#666">Signature &amp; Date</p>
    </div>
  </div>
  </body></html>`;
  printHtml(html);
}
function printHandoverChecklist(detail, farm, logType) {
  const b = detail.booking;
  const eq = [detail.equipmentName, detail.equipmentMake, detail.equipmentModel].filter(Boolean).join(" — ");
  const reg = detail.equipmentRegistration ? ` (Reg: ${detail.equipmentRegistration})` : "";
  const existing = detail.conditionLogs.find((l) => l.logType === logType);
  const title = logType === "hire_out" ? "Pre-Hire Handover Checklist" : "Return Condition Checklist";
  function row(label, value) {
    return `<tr><td style="padding:6px 8px;border:1px solid #ddd;background:#f9f9f9;font-weight:600;width:35%">${label}</td><td style="padding:6px 8px;border:1px solid #ddd">${value || "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"}</td></tr>`;
  }
  function checkItem(label) {
    return `<tr><td style="padding:6px 8px;border:1px solid #ddd">${label}</td><td style="padding:6px 8px;border:1px solid #ddd;text-align:center;width:80px">☐ OK</td><td style="padding:6px 8px;border:1px solid #ddd;text-align:center;width:80px">☐ Issue</td><td style="padding:6px 8px;border:1px solid #ddd;width:200px">Notes:</td></tr>`;
  }
  const html = `<!DOCTYPE html><html><head><title>${title} — ${b.bookingRef || `#${b.id}`}</title>
  ${docStyles()}</head><body>
  ${docHeader(farm)}
  <h2>${title}</h2>
  <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
    ${row("Booking Ref", b.bookingRef || `HIRE-${b.id}`)}
    ${row("Date", existing?.logDate || "")}
    ${row("Time", existing?.logTime || "")}
    ${row("Machine", `${eq}${reg}`)}
    ${row("Customer", detail.customer?.name || "")}
    ${row("Hours Meter Reading", existing?.hoursReading?.toString() || "")}
    ${row("Fuel Level", existing?.fuelLevelPercent ? `${existing.fuelLevelPercent}%` : "")}
    ${row("Overall Condition", existing?.conditionOverall ? HIRE_CONDITION_RATINGS.find((r) => r.value === existing.conditionOverall)?.label || existing.conditionOverall : "")}
  </table>
  <h2 style="margin-top:18px">Inspection Checklist</h2>
  <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:11px">
    <thead><tr style="background:#2d5a27;color:#fff">
      <th style="padding:6px 8px;text-align:left;border:1px solid #ddd">Item</th>
      <th style="padding:6px 8px;text-align:center;border:1px solid #ddd;width:80px">OK</th>
      <th style="padding:6px 8px;text-align:center;border:1px solid #ddd;width:80px">Issue</th>
      <th style="padding:6px 8px;border:1px solid #ddd;width:200px">Notes</th>
    </tr></thead>
    <tbody>
      ${checkItem("Tyres — condition and pressure")}
      ${checkItem("Lights and indicators")}
      ${checkItem("Hydraulic hoses and connections")}
      ${checkItem("Engine oil level")}
      ${checkItem("Coolant level")}
      ${checkItem("Fuel level")}
      ${checkItem("PTO shaft and guards")}
      ${checkItem("Safety devices and guards")}
      ${checkItem("Cab / ROPS condition")}
      ${checkItem("Attachments / implements")}
      ${checkItem("Seat belts")}
      ${checkItem("Fire extinguisher present")}
      ${checkItem("Operator manual present")}
      ${checkItem("Visible damage / scratches")}
    </tbody>
  </table>
  ${existing?.conditionNotes ? `<p><strong>Condition Notes:</strong> ${existing.conditionNotes}</p>` : ""}
  ${existing?.damageNotes ? `<p><strong>Damage Notes:</strong> ${existing.damageNotes}</p>` : ""}
  ${existing?.attachmentNotes ? `<p><strong>Attachments:</strong> ${existing.attachmentNotes}</p>` : ""}
  <div style="margin-top:28px;display:grid;grid-template-columns:1fr 1fr;gap:40px">
    <div>
      <p style="font-weight:600;margin-bottom:4px">Equipment Owner / Agent</p>
      <div style="border-bottom:1px solid #333;margin-bottom:6px;padding-bottom:40px"></div>
      <p style="font-size:10px;color:#666">Name, Signature &amp; Date</p>
    </div>
    <div>
      <p style="font-weight:600;margin-bottom:4px">Hirer (Customer)</p>
      <div style="border-bottom:1px solid #333;margin-bottom:6px;padding-bottom:40px"></div>
      <p style="font-size:10px;color:#666">Name, Signature &amp; Date</p>
    </div>
  </div>
  </body></html>`;
  printHtml(html);
}
function HireBookingDialog({
  farmId,
  customers,
  equipment,
  open,
  onClose,
  editBooking
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const isEdit = !!editBooking;
  const membersQ = useQuery({
    queryKey: ["farm-members", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/members`, { credentials: "include" }).then((r) => r.json()),
    enabled: open
  });
  const members = membersQ.data?.members ?? [];
  const fieldsQ = useQuery({
    queryKey: ["fields", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fields`, { credentials: "include" }).then((r) => r.json()),
    enabled: open
  });
  const fieldsList = fieldsQ.data?.records ?? [];
  const empty = {
    customerId: "",
    equipmentId: "",
    startDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    plannedEndDate: "",
    rateType: "daily",
    ratePence: "",
    depositPence: "",
    operatorName: "customer_operated",
    fuelPolicy: "customer_supplied",
    insuranceVerified: false,
    insuranceNotes: "",
    depositPaidDate: "",
    jobReference: "",
    fieldId: "",
    notes: "",
    status: "booked"
  };
  const [form, setForm] = reactExports.useState({ ...empty });
  const [insWarning, setInsWarning] = reactExports.useState(null);
  const [checkingIns, setCheckingIns] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (open) {
      if (isEdit) {
        const b = editBooking.booking;
        setForm({
          customerId: String(b.customerId),
          equipmentId: String(b.equipmentId),
          startDate: b.startDate,
          plannedEndDate: b.plannedEndDate || "",
          rateType: b.rateType,
          ratePence: b.ratePence ? String(b.ratePence / 100) : "",
          depositPence: b.depositPence ? String(b.depositPence / 100) : "",
          operatorName: b.operatorType === "customer_operated" ? "customer_operated" : b.operatorName || "customer_operated",
          fuelPolicy: b.fuelPolicy,
          insuranceVerified: b.insuranceVerified,
          insuranceNotes: b.insuranceNotes || "",
          depositPaidDate: b.depositPaidDate || "",
          jobReference: b.jobReference || "",
          fieldId: b.fieldId ? String(b.fieldId) : "",
          notes: b.notes || "",
          status: b.status
        });
      } else {
        setForm({ ...empty });
      }
      setInsWarning(null);
    }
  }, [open, isEdit]);
  async function checkInsurance(startDate, endDate) {
    if (!startDate) return;
    setCheckingIns(true);
    try {
      const params = new URLSearchParams({ startDate });
      if (endDate) params.set("endDate", endDate);
      const r = await fetch(`/api/farms/${farmId}/equipment-hire/insurance-check?${params}`, { credentials: "include" });
      if (r.ok) setInsWarning(await r.json());
    } finally {
      setCheckingIns(false);
    }
  }
  const saveMut = useMutation({
    mutationFn: (data) => fetch(
      isEdit ? `/api/farms/${farmId}/equipment-hire/${editBooking.booking.id}` : `/api/farms/${farmId}/equipment-hire`,
      { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(data) }
    ).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["equipment-hire", farmId] });
      toast({ title: isEdit ? "Booking updated" : "Booking created" });
      onClose();
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  function handleSave() {
    const isCustomerOperated = form.operatorName === "customer_operated";
    const data = {
      customerId: parseInt(form.customerId),
      equipmentId: parseInt(form.equipmentId),
      startDate: form.startDate,
      plannedEndDate: form.plannedEndDate || null,
      rateType: form.rateType,
      ratePence: form.ratePence ? Math.round(parseFloat(form.ratePence) * 100) : null,
      depositPence: form.depositPence ? Math.round(parseFloat(form.depositPence) * 100) : null,
      operatorType: isCustomerOperated ? "customer_operated" : "farm_operator",
      operatorName: isCustomerOperated ? null : form.operatorName,
      fuelPolicy: form.fuelPolicy,
      insuranceVerified: form.insuranceVerified,
      insuranceNotes: form.insuranceNotes || null,
      depositPaid: !!form.depositPaidDate,
      depositPaidDate: form.depositPaidDate || null,
      jobReference: form.jobReference || null,
      fieldId: form.fieldId ? parseInt(form.fieldId) : null,
      notes: form.notes || null
    };
    if (isEdit) data.status = form.status;
    if (!data.customerId || !data.equipmentId || !form.startDate) {
      toast({ title: "Please fill in customer, machine and start date", variant: "destructive" });
      return;
    }
    saveMut.mutate(data);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
    if (!v) {
      saveMut.reset();
      onClose();
    }
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: isEdit ? "Edit Hire Booking" : "New Hire Booking" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Customer *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.customerId, onValueChange: (v) => setForm((f) => ({ ...f, customerId: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select customer" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: customers.filter((c) => c.isActive).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(c.id), children: c.name }, c.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Machine *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.equipmentId, onValueChange: (v) => setForm((f) => ({ ...f, equipmentId: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select equipment" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: equipment.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(e.id), children: [
              e.name,
              e.make ? ` — ${e.make}` : "",
              e.registrationNumber ? ` (${e.registrationNumber})` : ""
            ] }, e.id)) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Start Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.startDate, onChange: (e) => {
            setForm((f) => ({ ...f, startDate: e.target.value }));
            checkInsurance(e.target.value, form.plannedEndDate);
          } })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Planned Return Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.plannedEndDate, onChange: (e) => {
            setForm((f) => ({ ...f, plannedEndDate: e.target.value }));
            checkInsurance(form.startDate, e.target.value);
          } })
        ] })
      ] }),
      checkingIns && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }),
        "Checking insurance…"
      ] }),
      insWarning && !checkingIns && (insWarning.ok ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4 shrink-0" }),
        "Insurance coverage confirmed for hire period."
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg px-3 py-2 space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm font-medium text-red-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-4 w-4 shrink-0" }),
          "Insurance Warning"
        ] }),
        insWarning.warnings.map((w, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-700", children: w }, i))
      ] })),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Rate Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.rateType, onValueChange: (v) => setForm((f) => ({ ...f, rateType: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: HIRE_RATE_TYPES.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r.value, children: r.label }, r.value)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Rate (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", value: form.ratePence, onChange: (e) => setForm((f) => ({ ...f, ratePence: e.target.value })), placeholder: "0.00" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Deposit (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", value: form.depositPence, onChange: (e) => setForm((f) => ({ ...f, depositPence: e.target.value })), placeholder: "0.00" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Operator" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.operatorName, onValueChange: (v) => setForm((f) => ({ ...f, operatorName: v })), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select operator" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "customer_operated", children: "Customer Operated" }),
            members.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: `${m.firstName} ${m.lastName}`, children: [
              m.firstName,
              " ",
              m.lastName,
              m.jobTitle ? ` — ${m.jobTitle}` : ""
            ] }, m.id))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fuel Policy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.fuelPolicy, onValueChange: (v) => setForm((f) => ({ ...f, fuelPolicy: v })), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: HIRE_FUEL_POLICIES.map((fp) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: fp.value, children: fp.label }, fp.value)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Deposit Received Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: form.depositPaidDate, onChange: (e) => setForm((f) => ({ ...f, depositPaidDate: e.target.value })) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Leave blank if deposit not yet received" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-end pb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer select-none", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: form.insuranceVerified, onChange: (e) => setForm((f) => ({ ...f, insuranceVerified: e.target.checked })) }),
          "Insurance verified by customer"
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Insurance Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.insuranceNotes, onChange: (e) => setForm((f) => ({ ...f, insuranceNotes: e.target.value })), placeholder: "e.g. Zurich NFU policy ZP-2024-1234 confirmed" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Job / Operation Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: form.jobReference,
              onChange: (e) => setForm((f) => ({ ...f, jobReference: e.target.value })),
              placeholder: "e.g. August combining — South Block"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Links multiple machine bookings to the same operation" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Linked Field (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.fieldId || "__none__", onValueChange: (v) => setForm((f) => ({ ...f, fieldId: v === "__none__" ? "" : v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "No field linked" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "No field linked" }),
              fieldsList.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(f.id), children: [
                f.name || `Field #${f.id}`,
                f.fieldReference ? ` (${f.fieldReference})` : ""
              ] }, f.id))
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
      ] }),
      isEdit && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status, onValueChange: (v) => setForm((f) => ({ ...f, status: v })), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: HIRE_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.value, children: s.label }, s.value)) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveMut, message: "Failed to save — your entries are still here." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleSave, disabled: saveMut.isPending, children: [
        saveMut.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }),
        isEdit ? "Save Changes" : "Create Booking"
      ] })
    ] })
  ] }) });
}
function ConditionCheckForm({
  farmId,
  bookingId,
  logType,
  onSaved
}) {
  const { toast } = useToast();
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const now = (/* @__PURE__ */ new Date()).toTimeString().slice(0, 5);
  const [form, setForm] = reactExports.useState({
    logDate: today,
    logTime: now,
    hoursReading: "",
    fuelLevelPercent: "",
    conditionOverall: "good",
    conditionNotes: "",
    damageNotes: "",
    tyreConditionNotes: "",
    attachmentNotes: "",
    signedOffBy: ""
  });
  const mut = useMutation({
    mutationFn: (data) => fetch(`/api/farms/${farmId}/equipment-hire/${bookingId}/conditions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data)
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: `${logType === "hire_out" ? "Pre-hire" : "Return"} check saved` });
      onSaved();
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  function handleSave() {
    mut.mutate({
      logType,
      logDate: form.logDate,
      logTime: form.logTime || null,
      hoursReading: form.hoursReading ? parseInt(form.hoursReading) : null,
      fuelLevelPercent: form.fuelLevelPercent ? parseInt(form.fuelLevelPercent) : null,
      conditionOverall: form.conditionOverall,
      conditionNotes: form.conditionNotes || null,
      damageNotes: form.damageNotes || null,
      tyreConditionNotes: form.tyreConditionNotes || null,
      attachmentNotes: form.attachmentNotes || null,
      signedOffBy: form.signedOffBy || null
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/40 border rounded-lg p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium text-sm", children: logType === "hire_out" ? "Pre-hire Condition Check" : "Return Condition Check" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: form.logDate, onChange: (e) => setForm((f) => ({ ...f, logDate: e.target.value })) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Time" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "time", value: form.logTime, onChange: (e) => setForm((f) => ({ ...f, logTime: e.target.value })) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Hours Meter" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.hoursReading, onChange: (e) => setForm((f) => ({ ...f, hoursReading: e.target.value })), placeholder: "e.g. 1450" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Fuel Level %" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", max: "100", value: form.fuelLevelPercent, onChange: (e) => setForm((f) => ({ ...f, fuelLevelPercent: e.target.value })), placeholder: "0–100" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Overall Condition" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.conditionOverall, onValueChange: (v) => setForm((f) => ({ ...f, conditionOverall: v })), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: HIRE_CONDITION_RATINGS.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r.value, children: r.label }, r.value)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Signed Off By" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.signedOffBy, onChange: (e) => setForm((f) => ({ ...f, signedOffBy: e.target.value })), placeholder: "Name" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Condition Notes" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.conditionNotes, onChange: (e) => setForm((f) => ({ ...f, conditionNotes: e.target.value })), rows: 2, placeholder: "General condition remarks…" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Damage Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.damageNotes, onChange: (e) => setForm((f) => ({ ...f, damageNotes: e.target.value })), placeholder: "Any existing or new damage" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Tyre Condition" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.tyreConditionNotes, onChange: (e) => setForm((f) => ({ ...f, tyreConditionNotes: e.target.value })), placeholder: "Tyre condition notes" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Attachments / Implements" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.attachmentNotes, onChange: (e) => setForm((f) => ({ ...f, attachmentNotes: e.target.value })), placeholder: "List of attachments included" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: handleSave, disabled: mut.isPending, children: [
      mut.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin mr-1" }),
      "Save Check"
    ] }) })
  ] });
}
function FuelIssueForm({
  farmId,
  bookingId,
  onSaved
}) {
  const { toast } = useToast();
  const { data: fuelMembersData, isLoading: fuelMembersLoading } = useFarmMembers(farmId);
  const fuelStaffNames = (fuelMembersData?.members ?? []).filter((m) => m.isActive).map((m) => `${m.firstName} ${m.lastName}`);
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const [form, setForm] = reactExports.useState({ issueDate: today, litres: "", pricePerLitrePence: "", billedToCustomer: true, issuedBy: "", notes: "" });
  const mut = useMutation({
    mutationFn: (data) => fetch(`/api/farms/${farmId}/equipment-hire/${bookingId}/fuel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data)
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Fuel issue logged" });
      onSaved();
      setForm({ issueDate: today, litres: "", pricePerLitrePence: "", billedToCustomer: true, issuedBy: "", notes: "" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  function handleSave() {
    if (!form.litres || parseFloat(form.litres) <= 0) {
      toast({ title: "Enter litres issued", variant: "destructive" });
      return;
    }
    mut.mutate({
      issueDate: form.issueDate,
      litres: parseFloat(form.litres),
      pricePerLitrePence: form.pricePerLitrePence ? Math.round(parseFloat(form.pricePerLitrePence) * 100) : null,
      billedToCustomer: form.billedToCustomer,
      issuedBy: form.issuedBy || null,
      notes: form.notes || null
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "font-medium text-sm flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Fuel, { className: "h-4 w-4 text-amber-600" }),
      "Log Fuel Issue"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: form.issueDate, onChange: (e) => setForm((f) => ({ ...f, issueDate: e.target.value })) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Litres Issued" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", min: "0", value: form.litres, onChange: (e) => setForm((f) => ({ ...f, litres: e.target.value })), placeholder: "0.0" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Price per Litre (£)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.001", min: "0", value: form.pricePerLitrePence, onChange: (e) => setForm((f) => ({ ...f, pricePerLitrePence: e.target.value })), placeholder: "0.000" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Issued By" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSelect, { value: form.issuedBy, onChange: (v) => setForm((f) => ({ ...f, issuedBy: v })), staffNames: fuelStaffNames, loading: fuelMembersLoading })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: form.billedToCustomer, onChange: (e) => setForm((f) => ({ ...f, billedToCustomer: e.target.checked })) }),
        "Bill to customer"
      ] }),
      form.litres && form.pricePerLitrePence && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground", children: [
        "Total: £",
        (parseFloat(form.litres) * parseFloat(form.pricePerLitrePence)).toFixed(2)
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: handleSave, disabled: mut.isPending, children: [
      mut.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin mr-1" }),
      "Log Fuel"
    ] }) })
  ] });
}
function BookingDetailPanel({
  farmId,
  bookingId,
  customers,
  equipment,
  onBack,
  onEditBooking,
  onRaiseInvoice
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [innerTab, setInnerTab] = reactExports.useState("overview");
  const [showPreHireForm, setShowPreHireForm] = reactExports.useState(false);
  const [showReturnForm, setShowReturnForm] = reactExports.useState(false);
  const [showFuelForm, setShowFuelForm] = reactExports.useState(false);
  const [plannerPrompt, setPlannerPrompt] = reactExports.useState(false);
  const [plannerCreating, setPlannerCreating] = reactExports.useState(false);
  const detailQ = useQuery({
    queryKey: ["hire-booking-detail", farmId, bookingId],
    queryFn: () => fetch(`/api/farms/${farmId}/equipment-hire/${bookingId}`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!bookingId
  });
  const farmQ = useQuery({
    queryKey: ["farm", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`, { credentials: "include" }).then((r) => r.json())
  });
  const membersQ = useQuery({
    queryKey: ["farm-members", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/members`, { credentials: "include" }).then((r) => r.json())
  });
  const members = membersQ.data?.members ?? [];
  const detailFieldsQ = useQuery({
    queryKey: ["fields", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fields`, { credentials: "include" }).then((r) => r.json())
  });
  const fieldsMap = Object.fromEntries(
    (detailFieldsQ.data?.records ?? []).map((f) => [f.id, [f.name, f.fieldReference ? `(${f.fieldReference})` : ""].filter(Boolean).join(" ")])
  );
  const updateStatusMut = useMutation({
    mutationFn: ({ status }) => fetch(`/api/farms/${farmId}/equipment-hire/${bookingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status })
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: (_, { status, triggerPlanner }) => {
      qc.invalidateQueries({ queryKey: ["hire-booking-detail", farmId, bookingId] });
      qc.invalidateQueries({ queryKey: ["equipment-hire", farmId] });
      toast({ title: `Booking status updated to ${HIRE_STATUSES.find((s) => s.value === status)?.label || status}` });
      if (triggerPlanner) setPlannerPrompt(true);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  async function addToPlanner(b2) {
    const member = members.find((m) => `${m.firstName} ${m.lastName}` === b2.operatorName);
    if (!member) {
      toast({ title: "Could not find staff member to assign", variant: "destructive" });
      setPlannerPrompt(false);
      return;
    }
    setPlannerCreating(true);
    try {
      const equipName = detailQ.data?.equipmentName || `Booking #${b2.id}`;
      const custName = detailQ.data?.customer?.name || "";
      await fetch(`/api/farms/${farmId}/task-assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: `Operate ${equipName}${custName ? ` — ${custName}` : ""}`,
          description: `Equipment hire${b2.bookingRef ? ` ${b2.bookingRef}` : ""}. Machine out from ${b2.startDate}${b2.plannedEndDate ? ` — planned return ${b2.plannedEndDate}` : ""}.`,
          assignedToMemberId: member.id,
          dueDate: b2.startDate,
          customerId: b2.customerId || null,
          isWorkOrder: true
        })
      }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      qc.invalidateQueries({ queryKey: ["work-orders", farmId] });
      toast({ title: `Work order added to planner for ${b2.operatorName}` });
    } catch {
      toast({ title: "Failed to add to planner", variant: "destructive" });
    } finally {
      setPlannerCreating(false);
      setPlannerPrompt(false);
    }
  }
  const deleteCondMut = useMutation({
    mutationFn: (condId) => fetch(`/api/farms/${farmId}/equipment-hire/${bookingId}/conditions/${condId}`, { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hire-booking-detail", farmId, bookingId] });
      toast({ title: "Condition log removed" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const deleteFuelMut = useMutation({
    mutationFn: (fuelId) => fetch(`/api/farms/${farmId}/equipment-hire/${bookingId}/fuel/${fuelId}`, { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hire-booking-detail", farmId, bookingId] });
      toast({ title: "Fuel issue removed" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const updateCostMut = useMutation({
    mutationFn: (totalHireCostPence) => fetch(`/api/farms/${farmId}/equipment-hire/${bookingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ totalHireCostPence })
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hire-booking-detail", farmId, bookingId] });
      toast({ title: "Hire cost updated" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const [costInput, setCostInput] = reactExports.useState("");
  if (detailQ.isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground" }) });
  if (!detailQ.data) return null;
  const detail = detailQ.data;
  const b = detail.booking;
  const farm = farmQ.data?.farm;
  const eq = [detail.equipmentName, detail.equipmentMake, detail.equipmentModel].filter(Boolean).join(" — ");
  const preHireLog = detail.conditionLogs.find((l) => l.logType === "hire_out");
  const returnLog = detail.conditionLogs.find((l) => l.logType === "return");
  const totalFuel = detail.fuelIssues.reduce((s, f) => s + (f.totalCostPence || 0), 0);
  const billedFuel = detail.fuelIssues.filter((f) => f.billedToCustomer).reduce((s, f) => s + (f.totalCostPence || 0), 0);
  const totalLitres = detail.fuelIssues.reduce((s, f) => s + parseFloat(f.litres), 0);
  const hireRevenue = b.totalHireCostPence || 0;
  const totalRevenue = hireRevenue + billedFuel;
  const bookingRow = {
    booking: b,
    customerName: detail.customer?.name || null,
    equipmentName: detail.equipmentName,
    equipmentMake: detail.equipmentMake,
    equipmentModel: detail.equipmentModel,
    equipmentRegistration: detail.equipmentRegistration
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: onBack, className: "gap-1.5 text-muted-foreground hover:text-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
        "Back"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-lg leading-tight", children: b.bookingRef || `Booking #${b.id}` }),
          statusBadge(b.status, HIRE_STATUSES)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
          detail.customer?.name || "—",
          " · ",
          eq,
          detail.equipmentRegistration ? ` (${detail.equipmentRegistration})` : ""
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-wrap justify-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "gap-1.5", onClick: () => printHireAgreement(detail, farm), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-3.5 w-3.5" }),
          "Agreement"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "gap-1.5", onClick: () => printHandoverChecklist(detail, farm, "hire_out"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-3.5 w-3.5" }),
          "Pre-hire Checklist"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "gap-1.5", onClick: () => printHandoverChecklist(detail, farm, "return"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-3.5 w-3.5" }),
          "Return Checklist"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "gap-1.5", onClick: () => onEditBooking(bookingRow), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }),
          "Edit"
        ] })
      ] })
    ] }),
    b.status === "booked" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        size: "sm",
        className: "bg-green-700 hover:bg-green-800 text-white gap-1.5",
        onClick: () => updateStatusMut.mutate({ status: "active", triggerPlanner: b.operatorType === "farm_operator" }),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-3.5 w-3.5" }),
          "Mark as Active (Machine Out)"
        ]
      }
    ) }),
    b.status === "active" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 flex-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "bg-purple-600 hover:bg-purple-700 text-white gap-1.5", onClick: () => updateStatusMut.mutate({ status: "returned" }), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-3.5 w-3.5" }),
      "Mark as Returned"
    ] }) }),
    b.status === "returned" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "bg-amber-600 hover:bg-amber-700 text-white gap-1.5", onClick: () => {
        const label = b.bookingRef || `Booking #${b.id}`;
        onRaiseInvoice({
          customerId: b.customerId,
          customerName: detail.customer?.name || "",
          title: `Equipment hire — ${label}`,
          suggestedLines: [
            { description: `Equipment hire — ${label}`, quantity: "1", unit: "", unitPricePence: "0", lineTotalPence: 0 },
            ...b.depositPaidDate && b.depositPence ? [{ description: `Less: deposit received${b.depositPaidDate ? ` (${b.depositPaidDate})` : ""}`, quantity: "1", unit: "", unitPricePence: String(-(b.depositPence / 100)), lineTotalPence: -b.depositPence }] : []
          ]
        });
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-3.5 w-3.5" }),
        "Raise Invoice"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => updateStatusMut.mutate({ status: "invoiced" }), children: "Mark as Invoiced" })
    ] }),
    plannerPrompt && b.operatorType === "farm_operator" && b.operatorName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "h-4 w-4 text-blue-700 mt-0.5 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-blue-900", children: "Add to Work Planner?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-blue-700 mt-0.5", children: [
          "Create a planner entry for ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: b.operatorName }),
          " so they can see this job in the Work Orders tab."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "bg-blue-700 hover:bg-blue-800 text-white", disabled: plannerCreating, onClick: () => addToPlanner(b), children: plannerCreating ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "h-3.5 w-3.5" }),
          "Add to Planner"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setPlannerPrompt(false), children: "Skip" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 border-b", children: [
      { id: "overview", label: "Overview", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3.5 w-3.5" }) },
      { id: "conditions", label: "Condition Checks", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardCheck, { className: "h-3.5 w-3.5" }) },
      { id: "fuel", label: "Fuel Issues", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Fuel, { className: "h-3.5 w-3.5" }) },
      { id: "revenue", label: "Revenue", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "h-3.5 w-3.5" }) }
    ].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => setInnerTab(t.id),
        className: `flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 transition-colors ${innerTab === t.id ? "border-green-700 text-green-800 font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`,
        children: [
          t.icon,
          t.label
        ]
      },
      t.id
    )) }),
    innerTab === "overview" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3", children: [
      [
        { label: "Start Date", value: b.startDate },
        { label: "Planned Return", value: b.plannedEndDate || "Open-ended" },
        { label: "Actual Return", value: b.actualEndDate || "—" },
        { label: "Rate", value: b.ratePence ? `${fmtPence(b.ratePence)} per ${HIRE_RATE_TYPES.find((r) => r.value === b.rateType)?.label.toLowerCase() || b.rateType}` : "—" },
        { label: "Deposit", value: b.depositPence ? `${fmtPence(b.depositPence)}${b.depositPaidDate ? ` (Received ${b.depositPaidDate})` : " (Awaiting)"}` : "—" },
        { label: "Operator", value: `${HIRE_OPERATOR_TYPES.find((o) => o.value === b.operatorType)?.label || b.operatorType}${b.operatorName ? ` — ${b.operatorName}` : ""}` },
        { label: "Fuel Policy", value: HIRE_FUEL_POLICIES.find((f) => f.value === b.fuelPolicy)?.label || b.fuelPolicy },
        { label: "Insurance", value: b.insuranceVerified ? `Verified${b.insuranceNotes ? ` — ${b.insuranceNotes}` : ""}` : "Not verified" },
        { label: "Machine Hours (current)", value: detail.equipmentCurrentHours ? `${detail.equipmentCurrentHours} hrs` : "—" },
        ...b.jobReference ? [{ label: "Job / Operation", value: b.jobReference }] : [],
        ...b.fieldId ? [{ label: "Linked Field", value: fieldsMap[b.fieldId] || `Field #${b.fieldId}` }] : []
      ].map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/40 rounded-lg p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: row.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm mt-0.5", children: row.value })
      ] }, row.label)),
      b.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-full bg-muted/40 rounded-lg p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: "Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm mt-0.5", children: b.notes })
      ] }),
      !b.insuranceVerified && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-full flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-4 w-4 shrink-0" }),
        "Customer insurance has not been verified — obtain and note their policy details before releasing the machine."
      ] })
    ] }),
    innerTab === "conditions" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
        !preHireLog && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "gap-1.5", onClick: () => setShowPreHireForm(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
          "Pre-hire Check"
        ] }),
        !returnLog && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "gap-1.5", onClick: () => setShowReturnForm(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
          "Return Check"
        ] })
      ] }),
      showPreHireForm && !preHireLog && /* @__PURE__ */ jsxRuntimeExports.jsx(ConditionCheckForm, { farmId, bookingId, logType: "hire_out", onSaved: () => {
        setShowPreHireForm(false);
        qc.invalidateQueries({ queryKey: ["hire-booking-detail", farmId, bookingId] });
      } }),
      showReturnForm && !returnLog && /* @__PURE__ */ jsxRuntimeExports.jsx(ConditionCheckForm, { farmId, bookingId, logType: "return", onSaved: () => {
        setShowReturnForm(false);
        qc.invalidateQueries({ queryKey: ["hire-booking-detail", farmId, bookingId] });
      } }),
      detail.conditionLogs.length === 0 && !showPreHireForm && !showReturnForm && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-muted-foreground text-sm", children: "No condition logs yet — add a pre-hire check before releasing the machine." }),
      detail.conditionLogs.map((log) => {
        const rating = HIRE_CONDITION_RATINGS.find((r) => r.value === log.conditionOverall);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-4 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[11px] font-medium px-2 py-0.5 rounded-full ${log.logType === "hire_out" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`, children: log.logType === "hire_out" ? "Pre-hire" : "Return" }),
              rating && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[11px] font-medium px-2 py-0.5 rounded-full ${rating.colour}`, children: rating.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm", children: [
                log.logDate,
                log.logTime ? ` at ${log.logTime}` : ""
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => deleteCondMut.mutate(log.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-red-500" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm", children: [
            log.hoursReading !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Hours:" }),
              " ",
              log.hoursReading
            ] }),
            log.fuelLevelPercent !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Fuel:" }),
              " ",
              log.fuelLevelPercent,
              "%"
            ] }),
            log.signedOffBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Signed:" }),
              " ",
              log.signedOffBy
            ] })
          ] }),
          log.conditionNotes && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Condition:" }),
            " ",
            log.conditionNotes
          ] }),
          log.damageNotes && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-red-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Damage:" }),
            " ",
            log.damageNotes
          ] }),
          log.tyreConditionNotes && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Tyres:" }),
            " ",
            log.tyreConditionNotes
          ] }),
          log.attachmentNotes && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Attachments:" }),
            " ",
            log.attachmentNotes
          ] })
        ] }, log.id);
      })
    ] }),
    innerTab === "fuel" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "gap-1.5", onClick: () => setShowFuelForm((v) => !v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Fuel, { className: "h-3.5 w-3.5" }),
        showFuelForm ? "Cancel" : "Log Fuel Issue"
      ] }) }),
      showFuelForm && /* @__PURE__ */ jsxRuntimeExports.jsx(FuelIssueForm, { farmId, bookingId, onSaved: () => {
        setShowFuelForm(false);
        qc.invalidateQueries({ queryKey: ["hire-booking-detail", farmId, bookingId] });
      } }),
      detail.fuelIssues.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-lg p-3 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xl font-bold text-amber-800", children: [
              totalLitres.toFixed(1),
              "L"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-amber-700", children: "Total Fuel Issued" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-3 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold text-green-800", children: fmtPence(billedFuel) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-green-700", children: "Billed to Customer" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted rounded-lg p-3 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold", children: fmtPence(totalFuel) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Total Fuel Cost" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-medium", children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right font-medium", children: "Litres" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right font-medium", children: "p/L" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right font-medium", children: "Total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-center font-medium", children: "Billed" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-medium", children: "Issued By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: detail.fuelIssues.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: f.issueDate }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: parseFloat(f.litres).toFixed(1) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: f.pricePerLitrePence ? `${(f.pricePerLitrePence / 100).toFixed(3)}` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right font-medium", children: f.totalCostPence ? fmtPence(f.totalCostPence) : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-center", children: f.billedToCustomer ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-4 w-4 text-green-600 mx-auto" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4 text-muted-foreground mx-auto" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-muted-foreground", children: f.issuedBy || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => deleteFuelMut.mutate(f.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-red-400" }) }) })
          ] }, f.id)) })
        ] }) })
      ] }) : !showFuelForm ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-muted-foreground text-sm", children: "No fuel issues logged yet." }) : null
    ] }),
    innerTab === "revenue" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-green-800", children: fmtPence(hireRevenue) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-green-700 mt-1", children: "Hire Revenue" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-lg p-4 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-amber-800", children: fmtPence(billedFuel) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-amber-700 mt-1", children: "Fuel Billed" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-blue-800", children: fmtPence(totalRevenue) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-blue-700 mt-1", children: "Total Revenue" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/40 rounded-lg p-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium text-sm", children: "Set Total Hire Cost" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Enter the final agreed hire cost for this booking. This will be used in revenue summaries and invoice generation." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground", children: "£" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                step: "0.01",
                min: "0",
                className: "pl-6 w-40",
                value: costInput || (b.totalHireCostPence ? String(b.totalHireCostPence / 100) : ""),
                onChange: (e) => setCostInput(e.target.value),
                placeholder: "0.00"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => {
            if (costInput) updateCostMut.mutate(Math.round(parseFloat(costInput) * 100));
          }, children: "Save Cost" })
        ] })
      ] }),
      b.status === "returned" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "gap-1.5", onClick: () => {
        const label = b.bookingRef || `Booking #${b.id}`;
        onRaiseInvoice({
          customerId: b.customerId,
          customerName: detail.customer?.name || "",
          title: `Equipment hire — ${label}`,
          suggestedLines: [
            { description: `Equipment hire — ${label}`, quantity: "1", unit: "", unitPricePence: "0", lineTotalPence: 0 },
            ...b.depositPaidDate && b.depositPence ? [{ description: `Less: deposit received${b.depositPaidDate ? ` (${b.depositPaidDate})` : ""}`, quantity: "1", unit: "", unitPricePence: String(-(b.depositPence / 100)), lineTotalPence: -b.depositPence }] : []
          ]
        });
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-4 w-4" }),
        "Raise Invoice for This Booking"
      ] })
    ] })
  ] });
}
function EquipmentHireTab({
  farmId,
  customers,
  onRaiseInvoice
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [selectedId, setSelectedId] = reactExports.useState(null);
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const [editRow, setEditRow] = reactExports.useState(null);
  const [filterStatus, setFilterStatus] = usePersistedFilter({ page: "farm-services", filter: "status", farmId, defaultValue: "all" });
  const [showSummary, setShowSummary] = reactExports.useState(false);
  const [pendingCancel, setPendingCancel] = reactExports.useState(null);
  const bookingsQ = useQuery({
    queryKey: ["equipment-hire", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/equipment-hire`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const equipmentQ = useQuery({
    queryKey: ["equipment", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/equipment`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const summaryQ = useQuery({
    queryKey: ["equipment-hire-summary", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/equipment-hire-summary`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId && showSummary
  });
  const cancelMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/equipment-hire/${id}`, { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["equipment-hire", farmId] });
      toast({ title: "Booking cancelled" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const bookings = bookingsQ.data?.records ?? [];
  const equipment = equipmentQ.data?.records ?? [];
  const filtered = filterStatus === "all" ? bookings : bookings.filter((b) => b.booking.status === filterStatus);
  const active = bookings.filter((b) => ["booked", "active"].includes(b.booking.status)).length;
  const returned = bookings.filter((b) => b.booking.status === "returned").length;
  const totalRevenue = bookings.reduce((s, b) => s + (b.booking.totalHireCostPence || 0), 0);
  if (selectedId !== null) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      BookingDetailPanel,
      {
        farmId,
        bookingId: selectedId,
        customers,
        equipment,
        onBack: () => setSelectedId(null),
        onEditBooking: (row) => {
          setEditRow(row);
          setDialogOpen(true);
        },
        onRaiseInvoice: (prefill) => {
          setSelectedId(null);
          onRaiseInvoice(prefill);
        }
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/40 rounded-lg p-3 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold", children: bookings.length }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Total Bookings" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 rounded-lg p-3 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold text-green-800", children: active }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-green-700", children: "Active / Booked" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-purple-50 rounded-lg p-3 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold text-purple-800", children: returned }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-purple-700", children: "Awaiting Invoice" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 rounded-lg p-3 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold text-blue-800", children: fmtPence(totalRevenue) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-blue-700", children: "Hire Revenue" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 flex-wrap", children: ["all", ...HIRE_STATUSES.map((s) => s.value)].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setFilterStatus(s),
          className: `text-xs px-3 py-1.5 rounded-full border transition-colors ${filterStatus === s ? "bg-green-700 text-white border-green-700" : "border-border text-muted-foreground hover:border-green-400"}`,
          children: s === "all" ? "All" : HIRE_STATUSES.find((h) => h.value === s)?.label || s
        },
        s
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "gap-1.5", onClick: () => setShowSummary((v) => !v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "h-3.5 w-3.5" }),
          showSummary ? "Hide" : "Revenue",
          " Summary"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "gap-1.5 bg-green-700 hover:bg-green-800 text-white", onClick: () => {
          setEditRow(null);
          setDialogOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
          "New Booking"
        ] })
      ] })
    ] }),
    showSummary && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-xl p-4 space-y-4 bg-muted/20", children: summaryQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin" }) }) : summaryQ.data ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold", children: summaryQ.data.totalBookings }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Total Bookings" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold text-green-700", children: summaryQ.data.activeBookings }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Active Now" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold", children: fmtPence(summaryQ.data.totalRevenuePence) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Hire Revenue" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold", children: fmtPence(summaryQ.data.totalFuelRevenuePence) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Fuel Revenue" })
        ] })
      ] }),
      summaryQ.data.byMachine.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-medium mb-2", children: "By Machine" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: summaryQ.data.byMachine.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm py-1 border-b last:border-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: m.equipmentName }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
            m.bookingCount,
            " hire",
            m.bookingCount !== 1 ? "s" : "",
            " · ",
            fmtPence(m.totalHirePence)
          ] })
        ] }, m.equipmentName)) })
      ] }),
      summaryQ.data.byCustomer.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-medium mb-2", children: "By Customer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: summaryQ.data.byCustomer.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm py-1 border-b last:border-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: c.customerName }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
            c.bookingCount,
            " hire",
            c.bookingCount !== 1 ? "s" : "",
            " · ",
            fmtPence(c.totalHirePence)
          ] })
        ] }, c.customerName)) })
      ] })
    ] }) : null }),
    bookingsQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground" }) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-14 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tractor, { className: "h-10 w-10 mx-auto text-muted-foreground/50" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: bookings.length === 0 ? "No hire bookings yet — create your first booking." : "No bookings match the selected filter." }),
      bookings.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "bg-green-700 hover:bg-green-800 text-white gap-1.5", onClick: () => setDialogOpen(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
        "New Booking"
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-xl overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-left font-medium", children: "Booking" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-left font-medium", children: "Machine" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-left font-medium hidden sm:table-cell", children: "Customer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-left font-medium hidden md:table-cell", children: "Start" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-left font-medium hidden md:table-cell", children: "Return" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-left font-medium", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-right font-medium", children: "Revenue" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filtered.map((row) => {
        const b = row.booking;
        const insWarn = !b.insuranceVerified && ["booked", "active"].includes(b.status);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t hover:bg-muted/30 transition-colors cursor-pointer", onClick: () => setSelectedId(b.id), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2.5 font-medium", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
              b.bookingRef || `#${b.id}`,
              insWarn && /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-3.5 w-3.5 text-red-500 shrink-0" })
            ] }),
            b.jobReference && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground truncate max-w-[160px]", children: b.jobReference })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: row.equipmentName || "—" }),
            (row.equipmentMake || row.equipmentModel) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: [row.equipmentMake, row.equipmentModel].filter(Boolean).join(" ") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 hidden sm:table-cell", children: row.customerName || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 hidden md:table-cell", children: b.startDate }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 hidden md:table-cell", children: b.actualEndDate || b.plannedEndDate || "Open" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5", children: statusBadge(b.status, HIRE_STATUSES) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 text-right", children: b.totalHireCostPence ? fmtPence(b.totalHireCostPence) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 text-right", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 justify-end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: "View", onClick: () => setSelectedId(b.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: "Edit", onClick: () => {
              setEditRow(row);
              setDialogOpen(true);
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
            !["cancelled", "invoiced"].includes(b.status) && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: "Cancel", onClick: () => setPendingCancel(b.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5 text-red-500" }) })
          ] }) })
        ] }, b.id);
      }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      HireBookingDialog,
      {
        farmId,
        customers,
        equipment,
        open: dialogOpen,
        onClose: () => {
          setDialogOpen(false);
          setEditRow(null);
        },
        editBooking: editRow
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: pendingCancel !== null,
        title: "Cancel booking",
        message: "Cancel this booking?",
        confirmLabel: "Cancel booking",
        confirmVariant: "destructive",
        mutation: cancelMut,
        onConfirm: () => {
          if (pendingCancel !== null) cancelMut.mutate(pendingCancel, { onSuccess: () => setPendingCancel(null) });
        },
        onCancel: () => {
          setPendingCancel(null);
          cancelMut.reset();
        }
      }
    )
  ] });
}
function ComplianceBanner() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-amber-200 bg-amber-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-5 w-5 text-amber-600 shrink-0 mt-0.5" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-amber-900", children: "Important: Farm Service Provider Obligations" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "text-xs text-amber-800 space-y-1 list-disc list-inside", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Insurance:" }),
          " Storing or handling third-party grain requires a ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "goods in custody" }),
          " extension on your farm combined policy. Review your insurance schedule."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "TASCC:" }),
          " Commercial grain storage for third parties falls under the Trade Assurance Scheme for Combinable Crops — separate from Red Tractor."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Red Tractor:" }),
          " Store standards apply regardless of whose grain is held. Traceability (lot references, segregation) is a compliance requirement."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "VAT:" }),
          " Services provided to other farmers are subject to VAT. Ensure you are registered if turnover exceeds the threshold."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Contract work:" }),
          " If operating machinery on third-party land, ensure your machinery insurance covers commercial contracting."
        ] })
      ] })
    ] })
  ] }) });
}
function FarmServicesPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = usePersistedTab({
    page: "farm-services",
    farmId,
    validIds: ["customers", "agreements", "grain", "invoices", "work-orders", "hire"],
    defaultTab: "customers",
    urlOverride: new URLSearchParams(window.location.search).get("tab")
  });
  const [invoicePrefill, setInvoicePrefill] = reactExports.useState(null);
  function handleRaiseInvoice(prefill) {
    setInvoicePrefill({ ...prefill });
    setTab("invoices");
  }
  const customersQ = useQuery({
    queryKey: ["farm-customers", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/farm-customers`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const customers = customersQ.data?.records ?? [];
  const totalCustomers = customers.filter((c) => c.isActive).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6 max-w-6xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-6 w-6 text-amber-600" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Farm Services" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Manage services you provide to other farmers — storage, drying, land rental, contract work and invoicing." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:flex items-center gap-4 text-sm text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-foreground text-lg", children: totalCustomers }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs", children: "Customers" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ComplianceBanner, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "customers", onClick: () => setTab("customers"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3.5 w-3.5" }),
        " Customers"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "agreements", onClick: () => setTab("agreements"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "h-3.5 w-3.5" }),
        " Service Agreements"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "grain", onClick: () => setTab("grain"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Wheat, { className: "h-3.5 w-3.5" }),
        " Third-party Grain"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "invoices", onClick: () => setTab("invoices"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-3.5 w-3.5" }),
        " Invoices"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "work-orders", onClick: () => setTab("work-orders"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { className: "h-3.5 w-3.5" }),
        " Work Orders"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "hire", onClick: () => setTab("hire"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tractor, { className: "h-3.5 w-3.5" }),
        " Equipment Hire"
      ] }) })
    ] }),
    tab === "customers" && farmId && /* @__PURE__ */ jsxRuntimeExports.jsx(CustomersTab, { farmId, customers, isLoading: customersQ.isLoading }),
    tab === "agreements" && farmId && /* @__PURE__ */ jsxRuntimeExports.jsx(AgreementsTab, { farmId, customers }),
    tab === "grain" && farmId && /* @__PURE__ */ jsxRuntimeExports.jsx(GrainIntakeTab, { farmId, customers }),
    tab === "invoices" && farmId && /* @__PURE__ */ jsxRuntimeExports.jsx(InvoicesTab, { farmId, customers, prefill: invoicePrefill }),
    tab === "work-orders" && farmId && /* @__PURE__ */ jsxRuntimeExports.jsx(WorkOrdersTab, { farmId, customers, onRaiseInvoice: handleRaiseInvoice }),
    tab === "hire" && farmId && /* @__PURE__ */ jsxRuntimeExports.jsx(EquipmentHireTab, { farmId, customers, onRaiseInvoice: handleRaiseInvoice })
  ] }) });
}
export {
  FarmServicesPage as default
};
