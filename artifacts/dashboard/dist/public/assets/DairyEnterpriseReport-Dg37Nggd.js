import { c as useQueryClient, r as reactExports, m as useQuery, j as jsxRuntimeExports, a as useToast, S as useMutation, B as Building2, e as LoaderCircle, d as Button, T as Plus, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, I as Input, N as DialogMutationError, J as DialogFooter } from "./index-CXHJP7pq.js";
import { T as Textarea } from "./textarea-DRvbmQLx.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-MBCnG7YB.js";
import { T as TriangleAlert } from "./triangle-alert-D99wAGjr.js";
import { C as ChevronDown, T as Trash2 } from "./trash-2-DwWsdUNA.js";
import { C as ChevronRight } from "./tractor-3BfLHaYU.js";
import { P as Pencil } from "./pencil-CHYgrkFO.js";
import { S as ShoppingCart } from "./shopping-cart-BdwGYRPU.js";
import { P as PackageCheck } from "./SccEquipmentSection-BmW9lZZd.js";
import { R as Receipt } from "./receipt-CXGDSEpQ.js";
import { B as BadgeCheck } from "./badge-check-DySaUkZW.js";
import { a as Clock } from "./database-CRZbwhTL.js";
import { C as CircleX } from "./circle-x-gzMa7ncf.js";
import { P as Printer } from "./printer-DL_-2yWa.js";
import { D as Droplets } from "./shield-alert-fYP6lxIA.js";
import { T as TrendingUp } from "./AppLayout-CmN454at.js";
import { P as Package } from "./use-safe-clerk-C_fmBhxU.js";
import { T as TrendingDown } from "./trending-down-DEctS3RK.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, L as Legend, B as Bar } from "./generateCategoricalChart-D7orILMm.js";
import { C as ComposedChart } from "./ComposedChart-DEfT_Xz3.js";
import { C as CartesianGrid } from "./CartesianGrid-CDptrGJJ.js";
import { L as Line } from "./Line-CK0ZkDzx.js";
import { C as ChevronUp } from "./chevron-up-BksTafDH.js";
const BASE = "/dashboard/";
const api = (path) => `${BASE}api/${path}`;
function formatDate(v) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return v;
  }
}
function today() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function penceToGBP(p) {
  if (p == null) return "—";
  return `£${(p / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function PoBadge({ status }) {
  const map = {
    draft: { bg: "bg-gray-100", text: "text-gray-700", label: "Draft" },
    sent: { bg: "bg-blue-100", text: "text-blue-700", label: "Sent" },
    "part-received": { bg: "bg-amber-100", text: "text-amber-700", label: "Part received" },
    received: { bg: "bg-green-100", text: "text-green-700", label: "Received" },
    cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Cancelled" }
  };
  const s = map[status] ?? map.draft;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-medium px-2 py-0.5 rounded-full ${s.bg} ${s.text}`, children: s.label });
}
function InvoiceBadge({ status }) {
  if (status === "paid") return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "h-3 w-3" }),
    "Paid"
  ] });
  if (status === "part-paid") return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
    "Part paid"
  ] });
  if (status === "overdue") return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3 w-3" }),
    "Overdue"
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
    "Unpaid"
  ] });
}
function GrnConditionBadge({ condition }) {
  if (!condition) return null;
  if (condition === "good") return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700", children: "Good condition" });
  if (condition === "damaged") return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700", children: "Damaged" });
  if (condition === "partial") return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700", children: "Partial delivery" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: condition });
}
function AbrProcurementSection({ farmId }) {
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const suppliersQ = useQuery({
    queryKey: ["abr-suppliers", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/abr-suppliers`), { credentials: "include" }).then((r) => r.json())
  });
  const ordersQ = useQuery({
    queryKey: ["abr-purchase-orders", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/abr-purchase-orders`), { credentials: "include" }).then((r) => r.json())
  });
  const grnsQ = useQuery({
    queryKey: ["abr-grns", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/abr-grns`), { credentials: "include" }).then((r) => r.json())
  });
  const invoicesQ = useQuery({
    queryKey: ["abr-invoices", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/abr-invoices`), { credentials: "include" }).then((r) => r.json())
  });
  const suppliers = suppliersQ.data?.suppliers ?? [];
  const orders = ordersQ.data?.orders ?? [];
  const grns = grnsQ.data?.grns ?? [];
  const invoices = invoicesQ.data?.invoices ?? [];
  const unpaidInvoices = invoices.filter((i) => i.paymentStatus === "unpaid" || i.paymentStatus === "overdue");
  const supplierName = (id) => suppliers.find((s) => s.id === id)?.companyName ?? null;
  const poRef = (id) => orders.find((o) => o.id === id)?.poNumber ?? null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        className: "w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left",
        onClick: () => setOpen((o) => !o),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-sm text-gray-800", children: [
              "ABR Kit Procurement (",
              suppliers.length,
              " suppliers, ",
              orders.length,
              " POs)"
            ] }),
            unpaidInvoices.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
              unpaidInvoices.length,
              " unpaid invoice",
              unpaidInvoices.length !== 1 ? "s" : ""
            ] })
          ] }),
          open ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 text-gray-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 text-gray-500" })
        ]
      }
    ),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "divide-y divide-gray-100", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SupplierSubsection, { farmId, suppliers, loading: suppliersQ.isLoading, qc }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(PurchaseOrderSubsection, { farmId, orders, suppliers, loading: ordersQ.isLoading, qc, supplierName }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(GrnSubsection, { farmId, grns, orders, loading: grnsQ.isLoading, qc, poRef }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(InvoiceSubsection, { farmId, invoices, suppliers, orders, loading: invoicesQ.isLoading, qc, supplierName, poRef })
    ] })
  ] });
}
function SupplierSubsection({ farmId, suppliers, loading, qc }) {
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(true);
  const [dlgOpen, setDlgOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? api(`farms/${farmId}/dairy/abr-suppliers/${editing.id}`) : api(`farms/${farmId}/dairy/abr-suppliers`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["abr-suppliers", farmId] });
      setDlgOpen(false);
      setEditing(null);
      setForm({});
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/dairy/abr-suppliers/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["abr-suppliers", farmId] });
      qc.invalidateQueries({ queryKey: ["abr-purchase-orders", farmId] });
      qc.invalidateQueries({ queryKey: ["abr-invoices", farmId] });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditing(null);
    setForm({});
    setDlgOpen(true);
  }
  function openEdit(s) {
    setEditing(s);
    setForm({ ...s });
    setDlgOpen(true);
  }
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        className: "w-full flex items-center justify-between px-4 py-2.5 bg-white hover:bg-gray-50 transition-colors text-left",
        onClick: () => setOpen((o) => !o),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-4 w-4 text-gray-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-700", children: "Supplier Directory" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full", children: suppliers.length })
          ] }),
          open ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-3.5 w-3.5 text-gray-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5 text-gray-400" })
        ]
      }
    ),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-4 space-y-2", children: [
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-gray-400" }) : suppliers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 italic", children: "No suppliers added yet." }) : suppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between rounded-md border border-gray-200 bg-white px-3 py-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm text-gray-900", children: s.companyName }),
            s.accountRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-400 font-mono", children: [
              "Acc: ",
              s.accountRef
            ] }),
            s.paymentTermsDays != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500", children: [
              s.paymentTermsDays,
              "-day terms"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 text-xs text-gray-500", children: [
            s.contactName && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: s.contactName }),
            s.phone && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `tel:${s.phone}`, className: "hover:text-blue-600", children: s.phone }),
            s.email && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `mailto:${s.email}`, className: "hover:text-blue-600", children: s.email }),
            (s.city || s.postcode) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: [s.city, s.postcode].filter(Boolean).join(", ") })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 ml-2 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => openEdit(s), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-red-400 hover:text-red-600", onClick: () => del.mutate(s.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
        ] })
      ] }, s.id)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }),
        "Add Supplier"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dlgOpen, onOpenChange: (o) => {
      setDlgOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "44rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Supplier" : "Add Supplier" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Company Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Neogen Europe Ltd", value: form.companyName || "", onChange: (e) => set("companyName", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Contact Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Account manager", value: form.contactName || "", onChange: (e) => set("contactName", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Account Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Your account number", value: form.accountRef || "", onChange: (e) => set("accountRef", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Phone" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "tel", placeholder: "01234 567890", value: form.phone || "", onChange: (e) => set("phone", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", placeholder: "orders@supplier.co.uk", value: form.email || "", onChange: (e) => set("email", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Address Line 1" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.addressLine1 || "", onChange: (e) => set("addressLine1", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Address Line 2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.addressLine2 || "", onChange: (e) => set("addressLine2", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "City / Town" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.city || "", onChange: (e) => set("city", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Postcode" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.postcode || "", onChange: (e) => set("postcode", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment Terms (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", placeholder: "30", value: form.paymentTermsDays ?? "", onChange: (e) => set("paymentTermsDays", e.target.value ? parseInt(e.target.value) : null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes || "", onChange: (e) => set("notes", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDlgOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending || !form.companyName?.trim(), children: [
          save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          editing ? "Save Changes" : "Add Supplier"
        ] })
      ] })
    ] }) })
  ] });
}
function PurchaseOrderSubsection({ farmId, orders, suppliers, loading, qc, supplierName }) {
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(true);
  const [dlgOpen, setDlgOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [lineItems, setLineItems] = reactExports.useState([]);
  const [expandedPo, setExpandedPo] = reactExports.useState(null);
  const [itemDlg, setItemDlg] = reactExports.useState(null);
  const [itemForm, setItemForm] = reactExports.useState({});
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? api(`farms/${farmId}/dairy/abr-purchase-orders/${editing.id}`) : api(`farms/${farmId}/dairy/abr-purchase-orders`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["abr-purchase-orders", farmId] });
      setDlgOpen(false);
      setEditing(null);
      setForm({});
      setLineItems([]);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/dairy/abr-purchase-orders/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["abr-purchase-orders", farmId] });
      qc.invalidateQueries({ queryKey: ["abr-grns", farmId] });
      qc.invalidateQueries({ queryKey: ["abr-invoices", farmId] });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const saveItem = useMutation({
    mutationFn: (body) => {
      const url = body.id ? api(`farms/${farmId}/dairy/abr-po-items/${body.id}`) : api(`farms/${farmId}/dairy/abr-purchase-orders/${body.poId}/items`);
      return fetch(url, { method: body.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["abr-purchase-orders", farmId] });
      setItemDlg(null);
      setItemForm({});
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const delItem = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/dairy/abr-po-items/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["abr-purchase-orders", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditing(null);
    setForm({ orderDate: today(), status: "draft" });
    setLineItems([{ productName: "", quantityOrdered: 1 }]);
    setDlgOpen(true);
  }
  function openEdit(o) {
    setEditing(o);
    setForm({ ...o });
    setLineItems([]);
    setDlgOpen(true);
  }
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  const lineTotal = (items) => items.reduce((sum, it) => sum + (it.unitPricePence ?? 0) * (it.quantityOrdered ?? 1), 0);
  function addLineItem() {
    setLineItems((l) => [...l, { productName: "", quantityOrdered: 1 }]);
  }
  function removeLineItem(i) {
    setLineItems((l) => l.filter((_, idx) => idx !== i));
  }
  function setLineItem(i, k, v) {
    setLineItems((l) => l.map((it, idx) => idx === i ? { ...it, [k]: v } : it));
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "w-full flex items-center justify-between px-4 py-2.5 bg-white hover:bg-gray-50 transition-colors text-left", onClick: () => setOpen((o) => !o), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "h-4 w-4 text-gray-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-700", children: "Purchase Orders" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full", children: orders.length })
      ] }),
      open ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-3.5 w-3.5 text-gray-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5 text-gray-400" })
    ] }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-4 space-y-2", children: [
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-gray-400" }) : orders.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 italic", children: "No purchase orders yet." }) : orders.map((o) => {
        const isExpanded = expandedPo === o.id;
        const sName = supplierName(o.supplierId);
        const itemTotal = lineTotal(o.items);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-gray-200 bg-white overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between px-3 py-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "flex-1 text-left", onClick: () => setExpandedPo(isExpanded ? null : o.id), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm text-gray-900 font-mono", children: o.poNumber }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(PoBadge, { status: o.status }),
                sName && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: sName })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 text-xs text-gray-500", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "Ordered: ",
                  formatDate(o.orderDate)
                ] }),
                o.expectedDeliveryDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "Expected: ",
                  formatDate(o.expectedDeliveryDate)
                ] }),
                o.items.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  o.items.length,
                  " line item",
                  o.items.length !== 1 ? "s" : ""
                ] }),
                itemTotal > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-gray-700", children: [
                  "Est. ",
                  penceToGBP(itemTotal)
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 ml-2 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => openEdit(o), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-red-400 hover:text-red-600", onClick: () => del.mutate(o.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
            ] })
          ] }),
          isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-gray-100 px-3 py-2 bg-gray-50 space-y-1.5", children: [
            o.items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 italic", children: "No line items." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-gray-500", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium py-0.5", children: "Product" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right font-medium py-0.5", children: "Qty" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right font-medium py-0.5", children: "Unit price" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right font-medium py-0.5", children: "Line total" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "w-12" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: o.items.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-gray-100", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 pr-2 text-gray-800", children: it.productName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 text-right text-gray-700", children: it.quantityOrdered }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 text-right text-gray-700", children: it.unitPricePence != null ? penceToGBP(it.unitPricePence) : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 text-right font-medium text-gray-800", children: it.unitPricePence != null ? penceToGBP(it.unitPricePence * it.quantityOrdered) : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-0.5 justify-end", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-6 w-6", onClick: () => {
                    setItemDlg({ poId: o.id, item: it });
                    setItemForm({ ...it });
                  }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-6 w-6 text-red-400 hover:text-red-600", onClick: () => delItem.mutate(it.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" }) })
                ] }) })
              ] }, it.id)) }),
              o.items.some((it) => it.unitPricePence != null) && /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-gray-200", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 3, className: "py-1 text-right text-xs font-medium text-gray-600", children: "Total estimated value" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 text-right text-xs font-bold text-gray-900", children: penceToGBP(itemTotal) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", {})
              ] }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-6 text-xs", onClick: () => {
              setItemDlg({ poId: o.id });
              setItemForm({ productName: "", quantityOrdered: 1 });
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3 mr-1" }),
              "Add line item"
            ] }),
            o.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 italic mt-1", children: [
              "Note: ",
              o.notes
            ] })
          ] })
        ] }, o.id);
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }),
        "New Purchase Order"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dlgOpen, onOpenChange: (o) => {
      setDlgOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "46rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Purchase Order" : "New Purchase Order" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "PO Number *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. PO-2026-001", value: form.poNumber || "", onChange: (e) => set("poNumber", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status || "draft", onValueChange: (v) => set("status", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "draft", children: "Draft" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "sent", children: "Sent to supplier" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "part-received", children: "Part received" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "received", children: "Received" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cancelled", children: "Cancelled" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.supplierId?.toString() || "", onValueChange: (v) => set("supplierId", v ? parseInt(v) : null), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select supplier" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: suppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.id.toString(), children: s.companyName }, s.id)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Order Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.orderDate || today(), onChange: (e) => set("orderDate", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expected Delivery" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.expectedDeliveryDate || "", onChange: (e) => set("expectedDeliveryDate", e.target.value || null) })
          ] })
        ] }),
        !editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Line Items" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-7 text-xs", onClick: addLineItem, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3 mr-1" }),
              "Add item"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            lineItems.map((it, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-12 gap-2 items-end", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Product" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-sm", placeholder: "Product name", value: it.productName || "", onChange: (e) => setLineItem(i, "productName", e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Qty" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-sm", type: "number", min: "1", value: it.quantityOrdered ?? 1, onChange: (e) => setLineItem(i, "quantityOrdered", parseInt(e.target.value) || 1) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Unit price (£)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-sm", type: "number", min: "0", step: "0.01", placeholder: "0.00", value: it.unitPricePence != null ? (it.unitPricePence / 100).toFixed(2) : "", onChange: (e) => setLineItem(i, "unitPricePence", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 flex justify-end pb-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8 text-red-400", onClick: () => removeLineItem(i), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) }) })
            ] }, i)),
            lineItems.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 italic", children: "No line items yet — add items above." }),
            lineTotal(lineItems) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right text-sm font-medium text-gray-700", children: [
              "Estimated total: ",
              penceToGBP(lineTotal(lineItems))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes || "", onChange: (e) => set("notes", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDlgOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate({ ...form, items: editing ? void 0 : lineItems.filter((it) => it.productName?.trim()) }), disabled: save.isPending || !form.poNumber?.trim() || !form.orderDate, children: [
          save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          editing ? "Save Changes" : "Create PO"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!itemDlg, onOpenChange: (o) => {
      if (!o) {
        setItemDlg(null);
        setItemForm({});
        saveItem.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "36rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: itemDlg?.item ? "Edit Line Item" : "Add Line Item" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Delvotest Accelerator kit (50)", value: itemForm.productName || "", onChange: (e) => setItemForm((f) => ({ ...f, productName: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity Ordered" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", value: itemForm.quantityOrdered ?? 1, onChange: (e) => setItemForm((f) => ({ ...f, quantityOrdered: parseInt(e.target.value) || 1 })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Unit Price (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "0.01", placeholder: "0.00", value: itemForm.unitPricePence != null ? (itemForm.unitPricePence / 100).toFixed(2) : "", onChange: (e) => setItemForm((f) => ({ ...f, unitPricePence: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: itemForm.notes || "", onChange: (e) => setItemForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveItem, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setItemDlg(null);
          setItemForm({});
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => saveItem.mutate({ ...itemForm, poId: itemDlg.poId, id: itemDlg?.item?.id }), disabled: saveItem.isPending || !itemForm.productName?.trim(), children: [
          saveItem.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          itemDlg?.item ? "Save Changes" : "Add Item"
        ] })
      ] })
    ] }) })
  ] });
}
function GrnSubsection({ farmId, grns, orders, loading, qc, poRef }) {
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(true);
  const [dlgOpen, setDlgOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? api(`farms/${farmId}/dairy/abr-grns/${editing.id}`) : api(`farms/${farmId}/dairy/abr-grns`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["abr-grns", farmId] });
      setDlgOpen(false);
      setEditing(null);
      setForm({});
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/dairy/abr-grns/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["abr-grns", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditing(null);
    setForm({ receivedDate: today(), conditionOnArrival: "good" });
    setDlgOpen(true);
  }
  function openEdit(g) {
    setEditing(g);
    setForm({ ...g });
    setDlgOpen(true);
  }
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "w-full flex items-center justify-between px-4 py-2.5 bg-white hover:bg-gray-50 transition-colors text-left", onClick: () => setOpen((o) => !o), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PackageCheck, { className: "h-4 w-4 text-gray-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-700", children: "Goods Received Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full", children: grns.length })
      ] }),
      open ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-3.5 w-3.5 text-gray-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5 text-gray-400" })
    ] }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-4 space-y-2", children: [
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-gray-400" }) : grns.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 italic", children: "No goods received notes yet." }) : grns.map((g) => {
        const po = poRef(g.poId);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between rounded-md border border-gray-200 bg-white px-3 py-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-0.5", children: [
              g.grnNumber && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm text-gray-900 font-mono", children: g.grnNumber }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(GrnConditionBadge, { condition: g.conditionOnArrival }),
              po && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500", children: [
                "PO: ",
                po
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 text-xs text-gray-500", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Received: ",
                formatDate(g.receivedDate)
              ] }),
              g.receivedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "By: ",
                g.receivedBy
              ] }),
              g.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "italic", children: g.notes })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 ml-2 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => openEdit(g), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-red-400 hover:text-red-600", onClick: () => del.mutate(g.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
          ] })
        ] }, g.id);
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }),
        "Add GRN"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dlgOpen, onOpenChange: (o) => {
      setDlgOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "40rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit GRN" : "Add Goods Received Note" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "GRN Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. GRN-2026-001", value: form.grnNumber || "", onChange: (e) => set("grnNumber", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Received Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.receivedDate || today(), onChange: (e) => set("receivedDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Linked Purchase Order" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.poId?.toString() || "", onValueChange: (v) => set("poId", v ? parseInt(v) : null), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select PO (optional)" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: orders.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.id.toString(), children: o.poNumber }, o.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Received By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Name of person who received", value: form.receivedBy || "", onChange: (e) => set("receivedBy", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Condition on Arrival" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.conditionOnArrival || "", onValueChange: (v) => set("conditionOnArrival", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select condition" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "good", children: "Good condition" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "damaged", children: "Damaged" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "partial", children: "Partial delivery" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes || "", onChange: (e) => set("notes", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDlgOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending || !form.receivedDate, children: [
          save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          editing ? "Save Changes" : "Add GRN"
        ] })
      ] })
    ] }) })
  ] });
}
function InvoiceSubsection({ farmId, invoices, suppliers, orders, loading, qc, supplierName, poRef }) {
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(true);
  const [dlgOpen, setDlgOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? api(`farms/${farmId}/dairy/abr-invoices/${editing.id}`) : api(`farms/${farmId}/dairy/abr-invoices`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["abr-invoices", farmId] });
      setDlgOpen(false);
      setEditing(null);
      setForm({});
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/dairy/abr-invoices/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["abr-invoices", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditing(null);
    setForm({ invoiceDate: today(), paymentStatus: "unpaid" });
    setDlgOpen(true);
  }
  function openEdit(inv) {
    setEditing(inv);
    setForm({ ...inv });
    setDlgOpen(true);
  }
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  const totalOutstanding = invoices.filter((i) => i.paymentStatus !== "paid").reduce((sum, i) => sum + (i.grossAmountPence ?? 0), 0);
  const totalPaid = invoices.filter((i) => i.paymentStatus === "paid").reduce((sum, i) => sum + (i.grossAmountPence ?? 0), 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "w-full flex items-center justify-between px-4 py-2.5 bg-white hover:bg-gray-50 transition-colors text-left", onClick: () => setOpen((o) => !o), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-4 w-4 text-gray-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-700", children: "Invoices" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full", children: invoices.length }),
        totalOutstanding > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full", children: [
          penceToGBP(totalOutstanding),
          " outstanding"
        ] })
      ] }),
      open ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-3.5 w-3.5 text-gray-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5 text-gray-400" })
    ] }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-4 space-y-2", children: [
      invoices.length > 1 && (totalOutstanding > 0 || totalPaid > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50 border border-amber-100 rounded-md px-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-amber-600 font-medium", children: "Outstanding" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-bold text-amber-800", children: penceToGBP(totalOutstanding) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 border border-green-100 rounded-md px-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-green-600 font-medium", children: "Total paid" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-bold text-green-800", children: penceToGBP(totalPaid) })
        ] })
      ] }),
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-gray-400" }) : invoices.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 italic", children: "No invoices recorded yet." }) : invoices.map((inv) => {
        const sName = supplierName(inv.supplierId);
        const po = poRef(inv.poId);
        const isOverdue = inv.paymentStatus === "unpaid" && inv.dueDate && new Date(inv.dueDate) < /* @__PURE__ */ new Date();
        const effectiveStatus = isOverdue ? "overdue" : inv.paymentStatus;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-start justify-between rounded-md border px-3 py-2.5 ${effectiveStatus === "overdue" ? "border-red-200 bg-red-50" : effectiveStatus === "paid" ? "border-green-100 bg-white" : "border-gray-200 bg-white"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm text-gray-900 font-mono", children: inv.invoiceNumber }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(InvoiceBadge, { status: effectiveStatus }),
              sName && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: sName }),
              po && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-400", children: [
                "PO: ",
                po
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 text-xs text-gray-500", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Dated: ",
                formatDate(inv.invoiceDate)
              ] }),
              inv.dueDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: effectiveStatus === "overdue" ? "text-red-600 font-medium" : "", children: [
                "Due: ",
                formatDate(inv.dueDate)
              ] }),
              inv.grossAmountPence != null && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-700", children: penceToGBP(inv.grossAmountPence) }),
              inv.netAmountPence != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Net: ",
                penceToGBP(inv.netAmountPence)
              ] }),
              inv.vatAmountPence != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "VAT: ",
                penceToGBP(inv.vatAmountPence)
              ] }),
              inv.paymentDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-green-600", children: [
                "Paid: ",
                formatDate(inv.paymentDate)
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 ml-2 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => openEdit(inv), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-red-400 hover:text-red-600", onClick: () => del.mutate(inv.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
          ] })
        ] }, inv.id);
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }),
        "Add Invoice"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dlgOpen, onOpenChange: (o) => {
      setDlgOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "46rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Invoice" : "Add Invoice" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Invoice Number *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. INV-12345", value: form.invoiceNumber || "", onChange: (e) => set("invoiceNumber", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.paymentStatus || "unpaid", onValueChange: (v) => set("paymentStatus", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "unpaid", children: "Unpaid" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "part-paid", children: "Part paid" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "paid", children: "Paid" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.supplierId?.toString() || "", onValueChange: (v) => set("supplierId", v ? parseInt(v) : null), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select supplier" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: suppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.id.toString(), children: s.companyName }, s.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Linked PO" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.poId?.toString() || "", onValueChange: (v) => set("poId", v ? parseInt(v) : null), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select PO (optional)" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: orders.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.id.toString(), children: o.poNumber }, o.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Invoice Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.invoiceDate || today(), onChange: (e) => set("invoiceDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Due Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.dueDate || "", onChange: (e) => set("dueDate", e.target.value || null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Net Amount (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "0.01", placeholder: "0.00", value: form.netAmountPence != null ? (form.netAmountPence / 100).toFixed(2) : "", onChange: (e) => {
            const net = e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null;
            set("netAmountPence", net);
            if (net != null && form.vatAmountPence != null) set("grossAmountPence", net + form.vatAmountPence);
          } })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "VAT Amount (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "0.01", placeholder: "0.00", value: form.vatAmountPence != null ? (form.vatAmountPence / 100).toFixed(2) : "", onChange: (e) => {
            const vat = e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null;
            set("vatAmountPence", vat);
            if (vat != null && form.netAmountPence != null) set("grossAmountPence", form.netAmountPence + vat);
          } })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Gross / Total (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "0.01", placeholder: "0.00", value: form.grossAmountPence != null ? (form.grossAmountPence / 100).toFixed(2) : "", onChange: (e) => set("grossAmountPence", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null) })
        ] }),
        (form.paymentStatus === "paid" || form.paymentStatus === "part-paid") && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.paymentDate || "", onChange: (e) => set("paymentDate", e.target.value || null) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. BACS ref, cheque no.", value: form.paymentReference || "", onChange: (e) => set("paymentReference", e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes || "", onChange: (e) => set("notes", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDlgOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending || !form.invoiceNumber?.trim() || !form.invoiceDate, children: [
          save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          editing ? "Save Changes" : "Add Invoice"
        ] })
      ] })
    ] }) })
  ] });
}
const PRINT_ID = "dairy-enterprise-report-print";
function ensurePrintStyle() {
  if (document.getElementById(PRINT_ID + "-css")) return;
  const s = document.createElement("style");
  s.id = PRINT_ID + "-css";
  s.textContent = `@media print{body>*{display:none!important}#${PRINT_ID}{display:block!important;position:fixed;inset:0;overflow:auto;background:#fff;z-index:99999;padding:24px}.no-print{display:none!important}}`;
  document.head.appendChild(s);
}
function fmtGBP(p) {
  return `£${(p / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function fmtPpl(p) {
  return p == null ? "—" : `${p.toFixed(2)}p/L`;
}
function fmtVol(l) {
  return l >= 1e3 ? `${(l / 1e3).toFixed(1)}kL` : `${l.toLocaleString("en-GB", { maximumFractionDigits: 0 })} L`;
}
function monthLabel(m) {
  return (/* @__PURE__ */ new Date(m + "-01")).toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
}
function KpiCard({ label, value, sub, icon, highlight }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-xl border p-3 ${highlight === "emerald" ? "border-emerald-200 bg-emerald-50/50" : highlight === "red" ? "border-red-200 bg-red-50/50" : "border-border bg-card"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/50", children: label }),
      icon
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-lg font-bold ${highlight === "emerald" ? "text-emerald-700" : highlight === "red" ? "text-red-600" : ""}`, children: value }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/40 mt-0.5", children: sub })
  ] });
}
function Collapsible({ title, open, setOpen, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "w-full px-4 py-3 flex items-center justify-between text-sm font-semibold hover:bg-muted/30 transition-colors", onClick: () => setOpen(!open), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: title }),
      open ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-4 h-4" })
    ] }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto border-t border-border", children })
  ] });
}
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-border rounded-lg p-3 text-xs shadow-md space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground mb-1", children: label }),
    payload.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { color: p.color }, children: [
      p.name,
      ": ",
      p.name === "Gross Margin" ? fmtGBP(p.value) : fmtGBP(Math.abs(p.value))
    ] }, p.name))
  ] });
};
function DairyEnterpriseReport({ farmId, endpoint, queryPrefix, speciesNote }) {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const [year, setYear] = reactExports.useState(currentYear);
  const [showMonthly, setShowMonthly] = reactExports.useState(false);
  const actualEndpoint = endpoint ?? `/api/farms/${farmId}/dairy-enterprise-report`;
  const { data, isLoading } = useQuery({
    queryKey: [queryPrefix ?? "dairy-enterprise-report", farmId, year],
    queryFn: () => fetch(`${actualEndpoint}?year=${year}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-16 text-foreground/40 text-sm", children: "Loading report…" });
  const d = data;
  const hasData = d && (d.collectionCount > 0 || d.feedDeliveryCount > 0);
  const marginPositive = (d?.grossMarginPence ?? 0) >= 0;
  const chartData = (d?.monthlyBreakdown ?? []).map((m) => ({
    label: monthLabel(m.month),
    "Milk Income": m.incomePence,
    "Feed Cost": m.feedCostPence,
    "Gross Margin": m.grossMarginPence
  }));
  const feedPct = d && d.totalMilkIncomePence > 0 ? (d.totalFeedCostPence / d.totalMilkIncomePence * 100).toFixed(1) : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { id: PRINT_ID, className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-3 no-print", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Dairy Enterprise Report" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/50", children: "Cost of production · Gross margin · Per-litre analysis" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: "h-9 rounded-lg border border-border bg-background px-3 text-sm", value: year, onChange: (e) => setYear(parseInt(e.target.value)), children: years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: y, children: y }, y)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
          ensurePrintStyle();
          window.print();
        }, className: "h-9 px-3 rounded-lg border border-border bg-background text-sm flex items-center gap-1.5 hover:bg-muted/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5" }),
          "Print"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "print:block hidden mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-bold", children: [
        "Dairy Enterprise Report — ",
        year
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Cost of production and gross margin analysis" })
    ] }),
    !hasData ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-8 text-center text-foreground/40 text-sm", children: [
      "No milk collection or feed delivery data found for ",
      year,
      ".",
      /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: "Record milk collections and priced feed deliveries to generate this report." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Milk Produced", value: fmtVol(d.totalVolumeLitres), sub: `${d.collectionCount} collections`, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Droplets, { className: "w-4 h-4 text-blue-500" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Milk Income", value: fmtGBP(d.totalMilkIncomePence), sub: fmtPpl(d.pencePerLitre), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-4 h-4 text-emerald-500" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Feed Cost", value: fmtGBP(d.totalFeedCostPence), sub: `${d.totalFeedKg.toLocaleString("en-GB")} kg · ${feedPct ? feedPct + "% of income" : ""}`, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-4 h-4 text-amber-500" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          KpiCard,
          {
            label: "Gross Margin",
            value: fmtGBP(d.grossMarginPence),
            sub: fmtPpl(d.grossMarginPerLitrePence),
            icon: marginPositive ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-4 h-4 text-emerald-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "w-4 h-4 text-red-500" }),
            highlight: marginPositive ? "emerald" : "red"
          }
        )
      ] }),
      chartData.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-b border-border bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Monthly Income vs Feed Cost" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 220, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ComposedChart, { data: chartData, margin: { top: 4, right: 8, bottom: 4, left: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#e5e7eb" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tick: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tickFormatter: (v) => `£${(v / 100).toFixed(0)}`, tick: { fontSize: 11 }, width: 60 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(CustomTooltip, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { iconSize: 10, wrapperStyle: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "Milk Income", fill: "#10b981", radius: [3, 3, 0, 0], maxBarSize: 40 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "Feed Cost", fill: "#f59e0b", radius: [3, 3, 0, 0], maxBarSize: 40 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: "Gross Margin", stroke: "#3b82f6", strokeWidth: 2, dot: false })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-b border-border bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold", children: [
          "Cost of Production Summary — ",
          d.year
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/20 text-foreground/60 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left", children: "Item" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "per Litre" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: [
            { label: "Milk income", value: d.totalMilkIncomePence, ppl: d.pencePerLitre, bold: false, positive: true },
            { label: `Feed cost (${d.feedDeliveryCount} deliveries · ${d.totalFeedKg.toLocaleString("en-GB")} kg)`, value: -d.totalFeedCostPence, ppl: d.feedCostPerLitrePence ? -d.feedCostPerLitrePence : null, bold: false },
            ...d.dairyPurchaseCostPence > 0 ? [{ label: "Livestock purchases (dairy)", value: -d.dairyPurchaseCostPence, ppl: null, bold: false }] : [],
            ...d.totalVetCostPence > 0 ? [{ label: "Vet & medicine (invoiced)", value: -d.totalVetCostPence, ppl: null, bold: false }] : [],
            { label: "Total variable costs", value: -d.totalVariableCostPence, ppl: null, bold: true, divider: true },
            { label: "Gross margin", value: d.grossMarginPence, ppl: d.grossMarginPerLitrePence, bold: true, highlight: marginPositive ? "emerald" : "red" }
          ].map((row, i) => {
            const ppl = row.ppl ?? (d.totalVolumeLitres > 0 && row.value !== 0 ? row.value / d.totalVolumeLitres : null);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: `border-t ${row.divider ? "border-t-2 border-border" : "border-border/40"} ${row.highlight === "emerald" ? "bg-emerald-50/30" : row.highlight === "red" ? "bg-red-50/30" : ""}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-4 py-2 ${row.bold ? "font-semibold" : ""}`, children: row.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-4 py-2 text-right font-mono ${row.bold ? "font-bold" : ""} ${row.highlight === "emerald" ? "text-emerald-700" : row.highlight === "red" ? "text-red-600" : row.value < 0 ? "text-red-600" : row.positive ? "text-emerald-700" : ""}`, children: row.value < 0 ? `-${fmtGBP(-row.value)}` : fmtGBP(row.value) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right text-foreground/40 text-xs", children: ppl != null ? `${ppl >= 0 ? "" : "-"}${Math.abs(ppl).toFixed(2)}p/L` : "" })
            ] }, i);
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-2 bg-muted/20 text-xs text-foreground/40", children: "Feed cost from priced deliveries tagged to dairy/cattle. Vet, AI, contractor, and fixed costs not included — add via Financial for a complete P&L. Organic dairy farmers: NMR recording visit data is in the Recording Visits tab." })
      ] }),
      d.monthlyBreakdown.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible, { title: `Monthly Breakdown (${d.monthlyBreakdown.length} months)`, open: showMonthly, setOpen: setShowMonthly, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/20 text-foreground/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "Month" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Collections" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Volume (L)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Income" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "p/L" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Feed Cost" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Gross Margin" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
          d.monthlyBreakdown.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border/40 hover:bg-muted/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 font-medium", children: monthLabel(m.month) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right text-foreground/60", children: m.collections }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right", children: m.volumeLitres.toLocaleString("en-GB", { maximumFractionDigits: 0 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right text-emerald-700 font-medium", children: fmtGBP(m.incomePence) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right text-foreground/60", children: m.pplActual != null ? `${m.pplActual.toFixed(2)}p` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right text-amber-700", children: m.feedCostPence > 0 ? fmtGBP(m.feedCostPence) : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-3 py-1.5 text-right font-medium ${m.grossMarginPence >= 0 ? "text-emerald-700" : "text-red-600"}`, children: fmtGBP(m.grossMarginPence) })
          ] }, m.month)),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t-2 border-border bg-muted/20 font-semibold text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: "Total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: d.collectionCount }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: fmtVol(d.totalVolumeLitres) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right text-emerald-700", children: fmtGBP(d.totalMilkIncomePence) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: fmtPpl(d.pencePerLitre) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right text-amber-700", children: fmtGBP(d.totalFeedCostPence) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-3 py-2 text-right ${marginPositive ? "text-emerald-700" : "text-red-600"}`, children: fmtGBP(d.grossMarginPence) })
          ] })
        ] })
      ] }) })
    ] })
  ] });
}
export {
  AbrProcurementSection as A,
  DairyEnterpriseReport as D
};
