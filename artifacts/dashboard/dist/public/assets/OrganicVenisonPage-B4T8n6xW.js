import { q as createLucideIcon, b as useAppStore, r as reactExports, j as jsxRuntimeExports, K as Map, t as useQueryClient, a as useToast, l as useQuery, O as useMutation, d as LoaderCircle, c as Button, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, I as Input, J as DialogFooter, S as Plus } from "./index-CZOZ9PUS.js";
import { A as AppLayout } from "./AppLayout-Do_5oOQY.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BwbieXNY.js";
import { T as Textarea } from "./textarea-2yrjDOZl.js";
import { B as Badge } from "./badge-DMiiHOOT.js";
import { A as Award } from "./award-CFFIecsw.js";
import { P as Package } from "./use-safe-clerk-BYXuxszW.js";
import { L as Leaf } from "./triangle-alert-COBBLke9.js";
import { E as Eye } from "./eye-DTDuM3N0.js";
import { P as Pencil } from "./pencil-BhmthinD.js";
import { T as Trash2 } from "./trash-2-Br8I1Au-.js";
import "./database-BGfW_7Ny.js";
import "./shield-alert-DG8i8Vya.js";
import "./shield-check-CKuh9SkA.js";
import "./tractor-BtvQMpsx.js";
import "./index-Dj8A5pKi.js";
import "./index-BRg5r7vP.js";
import "./chevron-up-C3chbAQz.js";
const __iconNode = [
  ["path", { d: "M12 17h.01", key: "p32p05" }],
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z", key: "1mlx9k" }],
  ["path", { d: "M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3", key: "mhlwft" }]
];
const FileQuestionMark = createLucideIcon("file-question-mark", __iconNode);
const api = (path) => `/api/${path}`;
const CERTIFYING_BODIES = ["Soil Association", "OF&G (Organic Farmers & Growers)", "Biodynamic Association", "OF&G Scotland", "Other"];
const CERT_TYPES = ["Venison / Deer Park", "Full Holding — All Products", "Specific Enterprise Only", "In-Conversion Certificate"];
const CERT_STATUSES = ["active", "pending", "suspended", "withdrawn", "expired"];
const CONVERSION_STATUSES = ["pre-conversion", "year-1-in-conversion", "year-2-in-conversion", "certified organic", "suspended", "withdrawn"];
const PRODUCT_TYPES = ["Mineral supplement", "Salt lick", "Hay / forage", "Concentrate feed", "Organic concentrate", "Drench / liquid supplement", "Other"];
const ORGANIC_APPROVAL_STATUSES = ["Certified organic", "Approved for organic use (non-organic ingredient)", "Derogation required", "Not permitted"];
const DEROGATION_STATUSES = ["pending", "approved", "refused", "withdrawn", "expired"];
function OVTabBar({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 flex-wrap border-b border-border mb-4 pb-2", children });
}
function OVTabButton({ active, onClick, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick, className: `px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1 ${active ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`, children });
}
function OVSectionHeader({ title, onAdd, addLabel }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: onAdd, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
      addLabel
    ] })
  ] });
}
function OVEmptyState({ icon: Icon, message }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-muted-foreground text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-8 h-8 mx-auto mb-3 opacity-30" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: message })
  ] });
}
const fmt = (val) => val == null || val === "" ? "—" : String(val);
const fmtDate = (val) => {
  if (!val) return "—";
  try {
    return new Date(String(val)).toLocaleDateString("en-GB");
  } catch {
    return String(val);
  }
};
function OVFieldView({ label, value }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium mt-0.5", children: value || "—" })
  ] });
}
function statusColor(s) {
  if (s === "active" || s === "certified organic" || s === "approved") return "bg-green-100 text-green-800 border-green-200";
  if (s === "pending" || s.includes("in-conversion")) return "bg-amber-100 text-amber-800 border-amber-200";
  if (s === "refused" || s === "withdrawn" || s === "suspended" || s === "expired") return "bg-red-100 text-red-800 border-red-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
}
function CertificationTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dlg, setDlg] = reactExports.useState({ open: false, mode: "add", row: {} });
  const [form, setForm] = reactExports.useState({});
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["org-venison-cert", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/organic-venison/certification`), { credentials: "include" }).then((r) => r.json())
  });
  const mutSave = useMutation({
    mutationFn: (data) => fetch(api(`farms/${farmId}/organic-venison/certification${data.id ? `/${data.id}` : ""}`), {
      method: data.id ? "PUT" : "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-venison-cert", farmId] });
      setDlg({ open: false, mode: "add", row: {} });
      toast({ title: "Saved" });
    },
    onError: () => toast({ title: "Error saving", variant: "destructive" })
  });
  const mutDel = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/organic-venison/certification/${id}`), { method: "DELETE", credentials: "include" }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-venison-cert", farmId] });
      toast({ title: "Deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const open = (mode, row = {}) => {
    setDlg({ open: true, mode, row });
    setForm(mode === "add" ? { status: "active", certificateType: "Venison / Deer Park" } : row);
  };
  const sf = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const active = records.filter((r) => r.status === "active").length;
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin" }) });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { className: "inline w-4 h-4 mr-1" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Organic Venison Certification" }),
      " — Record your certifying body details, certificate numbers, and renewal dates. Farmed deer enterprises can be certified organic by Soil Association, OF&G, or other approved bodies under UK Organic Regulations (retained from EC No. 834/2007). Wild venison cannot hold organic status."
    ] }),
    active > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: records.filter((r) => r.status === "active").map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 border border-green-100 rounded-xl p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm", children: fmt(r.certifyingBody) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: fmt(r.certificateType) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "bg-green-100 text-green-800 border-green-200 text-xs", children: "Active" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Cert. No.:" }),
          " ",
          fmt(r.certificateNumber)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Expires:" }),
          " ",
          fmtDate(r.expiryDate)
        ] }),
        r.scope && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Scope:" }),
          " ",
          r.scope
        ] })
      ] })
    ] }, r.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(OVSectionHeader, { title: "Certificate Register", onAdd: () => open("add"), addLabel: "Add Certificate" }),
    records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(OVEmptyState, { icon: Award, message: "No organic certificates recorded yet. Add your first certifying body record above." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm border-collapse", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "border-b bg-muted/30", children: ["Certifying Body", "Certificate Type", "Cert. No.", "Issue Date", "Expiry Date", "Scope", "Status", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-3 text-xs text-muted-foreground font-medium whitespace-nowrap", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: records.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b hover:bg-muted/20 transition-colors", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 font-medium", children: fmt(r.certifyingBody) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-xs", children: fmt(r.certificateType) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: fmt(r.certificateNumber) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 whitespace-nowrap", children: fmtDate(r.issueDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 whitespace-nowrap", children: fmtDate(r.expiryDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-xs max-w-[160px] truncate", children: fmt(r.scope) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: `text-xs ${statusColor(r.status || "")}`, children: fmt(r.status) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => open("view", r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => open("edit", r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7 text-destructive", onClick: () => mutDel.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
        ] }) })
      ] }, r.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dlg.open, onOpenChange: (o) => !o && setDlg({ open: false, mode: "add", row: {} }), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: dlg.mode === "view" ? "Organic Certificate" : dlg.mode === "edit" ? "Edit Certificate" : "Add Certificate" }) }),
      dlg.mode === "view" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(OVFieldView, { label: "Certifying Body", value: fmt(dlg.row.certifyingBody) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(OVFieldView, { label: "Certificate Type", value: fmt(dlg.row.certificateType) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(OVFieldView, { label: "Certificate Number", value: fmt(dlg.row.certificateNumber) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(OVFieldView, { label: "Status", value: fmt(dlg.row.status) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(OVFieldView, { label: "Issue Date", value: fmtDate(dlg.row.issueDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(OVFieldView, { label: "Expiry Date", value: fmtDate(dlg.row.expiryDate) }),
        dlg.row.scope && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(OVFieldView, { label: "Scope", value: fmt(dlg.row.scope) }) }),
        dlg.row.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(OVFieldView, { label: "Notes", value: fmt(dlg.row.notes) }) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifying Body *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.certifyingBody || ""), onValueChange: (v) => sf("certifyingBody", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select certifying body" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CERTIFYING_BODIES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certificate Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.certificateType || "Venison / Deer Park"), onValueChange: (v) => sf("certificateType", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CERT_TYPES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.status || "active"), onValueChange: (v) => sf("status", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CERT_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s.charAt(0).toUpperCase() + s.slice(1) }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certificate Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "SA / OF&G certificate number", value: String(form.certificateNumber || ""), onChange: (e) => sf("certificateNumber", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Issue Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.issueDate || ""), onChange: (e) => sf("issueDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expiry Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.expiryDate || ""), onChange: (e) => sf("expiryDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Scope" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Farmed red and fallow deer for venison, Deer Park compartments A–D", value: String(form.scope || ""), onChange: (e) => sf("scope", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: String(form.notes || ""), onChange: (e) => sf("notes", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: dlg.mode !== "view" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => mutSave.mutate({ ...form, id: dlg.row.id }), disabled: mutSave.isPending || !form.certifyingBody, children: [
        mutSave.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-4 h-4 mr-1" }) : null,
        dlg.mode === "edit" ? "Update" : "Save"
      ] }) })
    ] }) })
  ] });
}
function LandRegisterTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dlg, setDlg] = reactExports.useState({ open: false, mode: "add", row: {} });
  const [form, setForm] = reactExports.useState({});
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["org-venison-land", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/organic-venison/land-register`), { credentials: "include" }).then((r) => r.json())
  });
  const mutSave = useMutation({
    mutationFn: (data) => fetch(api(`farms/${farmId}/organic-venison/land-register${data.id ? `/${data.id}` : ""}`), {
      method: data.id ? "PUT" : "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-venison-land", farmId] });
      setDlg({ open: false, mode: "add", row: {} });
      toast({ title: "Saved" });
    },
    onError: () => toast({ title: "Error saving", variant: "destructive" })
  });
  const mutDel = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/organic-venison/land-register/${id}`), { method: "DELETE", credentials: "include" }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-venison-land", farmId] });
      toast({ title: "Deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const open = (mode, row = {}) => {
    setDlg({ open: true, mode, row });
    setForm(mode === "add" ? { conversionStatus: "pre-conversion" } : row);
  };
  const sf = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const totalArea = records.reduce((s, r) => s + (Number(r.areaHa) || 0), 0);
  const certifiedArea = records.filter((r) => r.conversionStatus === "certified organic").reduce((s, r) => s + (Number(r.areaHa) || 0), 0);
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin" }) });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    records.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 border border-green-100 rounded-xl p-4 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-green-800", children: records.length }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-700 mt-0.5", children: "Compartments" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-100 rounded-xl p-4 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xl font-bold text-blue-800", children: [
          totalArea.toFixed(1),
          " ha"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-blue-700 mt-0.5", children: "Total Area" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50 border border-amber-100 rounded-xl p-4 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xl font-bold text-amber-800", children: [
          certifiedArea.toFixed(1),
          " ha"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-700 mt-0.5", children: "Certified Organic" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(OVSectionHeader, { title: "Deer Grazing Compartment Register", onAdd: () => open("add"), addLabel: "Add Compartment" }),
    records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(OVEmptyState, { icon: Map, message: "No compartments registered yet. Add your first grazing compartment or deer park block above." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm border-collapse", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "border-b bg-muted/30", children: ["Compartment Name", "Area (ha)", "Conversion Status", "Conversion Start", "Certified Organic Date", "Certifying Body", "Cert. Reference", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-3 text-xs text-muted-foreground font-medium whitespace-nowrap", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: records.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b hover:bg-muted/20 transition-colors", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 font-medium", children: fmt(r.compartmentName) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: r.areaHa ? `${r.areaHa} ha` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: `text-xs ${statusColor(r.conversionStatus || "")}`, children: fmt(r.conversionStatus) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 whitespace-nowrap", children: fmtDate(r.conversionStartDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 whitespace-nowrap", children: fmtDate(r.certifiedOrganicDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-xs", children: fmt(r.certifyingBody) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-xs", children: fmt(r.certifierReference) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => open("view", r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => open("edit", r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7 text-destructive", onClick: () => mutDel.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
        ] }) })
      ] }, r.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dlg.open, onOpenChange: (o) => !o && setDlg({ open: false, mode: "add", row: {} }), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: dlg.mode === "view" ? "Compartment" : dlg.mode === "edit" ? "Edit Compartment" : "Add Compartment" }) }),
      dlg.mode === "view" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(OVFieldView, { label: "Compartment Name", value: fmt(dlg.row.compartmentName) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(OVFieldView, { label: "Area (ha)", value: dlg.row.areaHa ? `${dlg.row.areaHa} ha` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(OVFieldView, { label: "Conversion Status", value: fmt(dlg.row.conversionStatus) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(OVFieldView, { label: "Conversion Start Date", value: fmtDate(dlg.row.conversionStartDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(OVFieldView, { label: "Certified Organic Date", value: fmtDate(dlg.row.certifiedOrganicDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(OVFieldView, { label: "Certifying Body", value: fmt(dlg.row.certifyingBody) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(OVFieldView, { label: "Certifier Reference", value: fmt(dlg.row.certifierReference) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(OVFieldView, { label: "Previous Land Use", value: fmt(dlg.row.previousLandUse) }),
        dlg.row.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(OVFieldView, { label: "Notes", value: fmt(dlg.row.notes) }) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Compartment Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. North Deer Park, Block A", value: String(form.compartmentName || ""), onChange: (e) => sf("compartmentName", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Area (ha)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", placeholder: "0.00", value: String(form.areaHa || ""), onChange: (e) => sf("areaHa", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Conversion Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.conversionStatus || "pre-conversion"), onValueChange: (v) => sf("conversionStatus", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CONVERSION_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Conversion Start Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.conversionStartDate || ""), onChange: (e) => sf("conversionStartDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certified Organic Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.certifiedOrganicDate || ""), onChange: (e) => sf("certifiedOrganicDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifying Body" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.certifyingBody || ""), onValueChange: (v) => sf("certifyingBody", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select body" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CERTIFYING_BODIES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifier Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Parcel / compartment ref", value: String(form.certifierReference || ""), onChange: (e) => sf("certifierReference", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Previous Land Use" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Conventional arable, improved pasture", value: String(form.previousLandUse || ""), onChange: (e) => sf("previousLandUse", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: String(form.notes || ""), onChange: (e) => sf("notes", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: dlg.mode !== "view" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => mutSave.mutate({ ...form, id: dlg.row.id }), disabled: mutSave.isPending || !form.compartmentName, children: [
        mutSave.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-4 h-4 mr-1" }) : null,
        dlg.mode === "edit" ? "Update" : "Save"
      ] }) })
    ] }) })
  ] });
}
function FeedSupplementsTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dlg, setDlg] = reactExports.useState({ open: false, mode: "add", row: {} });
  const [form, setForm] = reactExports.useState({});
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["org-venison-feed", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/organic-venison/feed-supplements`), { credentials: "include" }).then((r) => r.json())
  });
  const mutSave = useMutation({
    mutationFn: (data) => fetch(api(`farms/${farmId}/organic-venison/feed-supplements${data.id ? `/${data.id}` : ""}`), {
      method: data.id ? "PUT" : "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-venison-feed", farmId] });
      setDlg({ open: false, mode: "add", row: {} });
      toast({ title: "Saved" });
    },
    onError: () => toast({ title: "Error saving", variant: "destructive" })
  });
  const mutDel = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/organic-venison/feed-supplements/${id}`), { method: "DELETE", credentials: "include" }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-venison-feed", farmId] });
      toast({ title: "Deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const open = (mode, row = {}) => {
    setDlg({ open: true, mode, row });
    setForm(mode === "add" ? { organicApprovalStatus: "Certified organic" } : row);
  };
  const sf = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const derogationRequired = records.filter((r) => r.organicApprovalStatus === "Derogation required").length;
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin" }) });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    derogationRequired > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: derogationRequired }),
      " feed or supplement record",
      derogationRequired > 1 ? "s" : "",
      " marked as requiring a derogation. Raise a formal derogation request in the Derogations tab."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(OVSectionHeader, { title: "Feed & Supplement Records", onAdd: () => open("add"), addLabel: "Add Record" }),
    records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(OVEmptyState, { icon: Package, message: "No feed or supplement records yet. Log all supplementary feed inputs including mineral licks and concentrates." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm border-collapse", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "border-b bg-muted/30", children: ["Date", "Product Name", "Type", "Organic Approval Status", "Certifier Approval Ref", "Qty (kg)", "Area / Herd", "Supplier", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-3 text-xs text-muted-foreground font-medium whitespace-nowrap", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: records.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b hover:bg-muted/20 transition-colors", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 whitespace-nowrap", children: fmtDate(r.applicationDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 font-medium", children: fmt(r.productName) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-xs", children: fmt(r.productType) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: `text-xs ${statusColor(r.organicApprovalStatus || "")}`, children: fmt(r.organicApprovalStatus) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-xs", children: fmt(r.certifierApprovalReference) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: r.quantityKg ? `${r.quantityKg} kg` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: fmt(r.areaOrHerd) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: fmt(r.supplierName) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => open("view", r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => open("edit", r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7 text-destructive", onClick: () => mutDel.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
        ] }) })
      ] }, r.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dlg.open, onOpenChange: (o) => !o && setDlg({ open: false, mode: "add", row: {} }), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: dlg.mode === "view" ? "Feed / Supplement Record" : dlg.mode === "edit" ? "Edit Record" : "Add Feed / Supplement" }) }),
      dlg.mode === "view" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(OVFieldView, { label: "Application Date", value: fmtDate(dlg.row.applicationDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(OVFieldView, { label: "Product Name", value: fmt(dlg.row.productName) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(OVFieldView, { label: "Product Type", value: fmt(dlg.row.productType) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(OVFieldView, { label: "Organic Approval Status", value: fmt(dlg.row.organicApprovalStatus) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(OVFieldView, { label: "Certifier Approval Reference", value: fmt(dlg.row.certifierApprovalReference) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(OVFieldView, { label: "Quantity (kg)", value: dlg.row.quantityKg ? `${dlg.row.quantityKg} kg` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(OVFieldView, { label: "Area / Herd", value: fmt(dlg.row.areaOrHerd) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(OVFieldView, { label: "Supplier", value: fmt(dlg.row.supplierName) }),
        dlg.row.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(OVFieldView, { label: "Notes", value: fmt(dlg.row.notes) }) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Application Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.applicationDate || ""), onChange: (e) => sf("applicationDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Product name", value: String(form.productName || ""), onChange: (e) => sf("productName", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.productType || ""), onValueChange: (v) => sf("productType", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PRODUCT_TYPES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Organic Approval Status *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.organicApprovalStatus || "Certified organic"), onValueChange: (v) => sf("organicApprovalStatus", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ORGANIC_APPROVAL_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifier Approval Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Approval reference number", value: String(form.certifierApprovalReference || ""), onChange: (e) => sf("certifierApprovalReference", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", placeholder: "0.0", value: String(form.quantityKg || ""), onChange: (e) => sf("quantityKg", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Area / Herd" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. North Deer Park, full herd", value: String(form.areaOrHerd || ""), onChange: (e) => sf("areaOrHerd", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Supplier", value: String(form.supplierName || ""), onChange: (e) => sf("supplierName", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: String(form.notes || ""), onChange: (e) => sf("notes", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: dlg.mode !== "view" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => mutSave.mutate({ ...form, id: dlg.row.id }), disabled: mutSave.isPending || !form.applicationDate || !form.productName, children: [
        mutSave.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-4 h-4 mr-1" }) : null,
        dlg.mode === "edit" ? "Update" : "Save"
      ] }) })
    ] }) })
  ] });
}
const VENS_STATUS_CFG = {
  pending: { label: "Pending", cls: "bg-blue-100 text-blue-800" },
  approved: { label: "Approved", cls: "bg-green-100 text-green-800" },
  refused: { label: "Refused", cls: "bg-red-100 text-red-800" },
  rejected: { label: "Rejected", cls: "bg-red-100 text-red-800" },
  expired: { label: "Expired", cls: "bg-gray-100 text-gray-600" },
  withdrawn: { label: "Withdrawn", cls: "bg-gray-100 text-gray-600" }
};
function VensDerogCard({ farmId, c: rec, isExpanded, onToggle, qc }) {
  const { toast } = useToast();
  const [recordDecisionOpen, setRecordDecisionOpen] = reactExports.useState(false);
  const [editOpen, setEditOpen] = reactExports.useState(false);
  const [editForm, setEditForm] = reactExports.useState({});
  const [corrOpen, setCorrOpen] = reactExports.useState(false);
  const [editCorr, setEditCorr] = reactExports.useState(null);
  const [corrForm, setCorrForm] = reactExports.useState({ correspondenceDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), direction: "to-certifier", correspondenceType: "Application to Certifier", summary: "", reference: "", notes: "" });
  const [uploading, setUploading] = reactExports.useState(false);
  const [uploadType, setUploadType] = reactExports.useState("Approval Letter");
  const { data: corrData } = useQuery({
    queryKey: ["vens-derog-corr", rec.id],
    queryFn: () => fetch(api(`farms/${farmId}/organic-venison/derogations/${rec.id}/correspondence`), { credentials: "include" }).then((r) => r.json()),
    enabled: isExpanded
  });
  const { data: docsData } = useQuery({
    queryKey: ["vens-derog-docs", rec.id],
    queryFn: () => fetch(api(`farms/${farmId}/organic-venison/derogations/${rec.id}/documents`), { credentials: "include" }).then((r) => r.json()),
    enabled: isExpanded
  });
  const corrItems = corrData?.items ?? [];
  const docs = docsData?.items ?? [];
  const saveEdit = useMutation({
    mutationFn: (body) => fetch(api(`farms/${farmId}/organic-venison/derogations/${rec.id}`), { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-venison-derog", farmId] });
      setEditOpen(false);
      toast({ title: "Saved" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const saveDecision = useMutation({
    mutationFn: (body) => fetch(api(`farms/${farmId}/organic-venison/derogations/${rec.id}`), { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-venison-derog", farmId] });
      setRecordDecisionOpen(false);
      toast({ title: "Decision recorded" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const delDerog = useMutation({
    mutationFn: () => fetch(api(`farms/${farmId}/organic-venison/derogations/${rec.id}`), { method: "DELETE", credentials: "include" }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-venison-derog", farmId] });
      toast({ title: "Deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const saveCorr = useMutation({
    mutationFn: (body) => {
      const url = editCorr ? api(`farms/${farmId}/organic-venison/derogation-correspondence/${editCorr.id}`) : api(`farms/${farmId}/organic-venison/derogations/${rec.id}/correspondence`);
      return fetch(url, { method: editCorr ? "PUT" : "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vens-derog-corr", rec.id] });
      setCorrOpen(false);
      setEditCorr(null);
      toast({ title: "Saved" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const delCorr = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/organic-venison/derogation-correspondence/${id}`), { method: "DELETE", credentials: "include" }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vens-derog-corr", rec.id] });
      toast({ title: "Deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const delDoc = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/organic-venison/derogation-documents/${id}`), { method: "DELETE", credentials: "include" }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vens-derog-docs", rec.id] });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const cfg = VENS_STATUS_CFG[rec.status] ?? VENS_STATUS_CFG.pending;
  const days = rec.expiryDate ? Math.ceil((new Date(rec.expiryDate).getTime() - Date.now()) / 864e5) : null;
  async function handleFileUpload(file, docType) {
    setUploading(true);
    try {
      const presignRes = await fetch(api("uploads/presign"), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileName: file.name, contentType: file.type, recordType: "organic_venison_derogation" }) });
      const { uploadUrl, fileKey } = await presignRes.json();
      await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      await fetch(api(`farms/${farmId}/organic-venison/derogations/${rec.id}/documents`), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileKey, fileName: file.name, fileSize: file.size, mimeType: file.type, documentType: docType }) });
      qc.invalidateQueries({ queryKey: ["vens-derog-docs", rec.id] });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    }
    setUploading(false);
  }
  const [decisionStatus, setDecisionStatus] = reactExports.useState("approved");
  const [decisionDate, setDecisionDate] = reactExports.useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [decisionCertRef, setDecisionCertRef] = reactExports.useState(rec.certifierRef ?? "");
  const [decisionConditions, setDecisionConditions] = reactExports.useState(rec.approvalConditions ?? "");
  const [decisionExpiry, setDecisionExpiry] = reactExports.useState(rec.expiryDate ?? "");
  const [decisionRejReason, setDecisionRejReason] = reactExports.useState("");
  const [decisionRejRef, setDecisionRejRef] = reactExports.useState("");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-md overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 px-4 py-3 bg-card hover:bg-muted/30 cursor-pointer", onClick: onToggle, children: [
      isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-sm", children: "▾" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-sm", children: "▸" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm", children: rec.inputName }),
          rec.caseReference && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-muted-foreground", children: rec.caseReference }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.cls} border-current/20`, children: cfg.label }),
          (rec.status === "rejected" || rec.status === "refused") && !rec.correctiveAction && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-orange-100 text-orange-800 border-orange-300", children: "Action Required" }),
          days !== null && rec.status === "approved" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs px-1.5 py-0.5 rounded ${days < 0 ? "bg-red-100 text-red-700" : days <= 14 ? "bg-red-100 text-red-700" : days <= 60 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`, children: days < 0 ? `Expired ${Math.abs(days)}d ago` : `${days}d remaining` }),
          docs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
            "📎 ",
            docs.length
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap", children: [
          rec.certifyingBody && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Certifier: ",
            rec.certifyingBody
          ] }),
          rec.certifierRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Ref: ",
            rec.certifierRef
          ] }),
          rec.applicationDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Applied: ",
            rec.applicationDate
          ] }),
          rec.expiryDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Expires: ",
            rec.expiryDate
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 shrink-0 items-center", onClick: (e) => e.stopPropagation(), children: [
        rec.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-xs px-2 py-1 border border-amber-300 text-amber-700 rounded hover:bg-amber-50", onClick: () => setRecordDecisionOpen(true), children: "Record Decision" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => {
          setEditForm({ ...rec });
          setEditOpen(true);
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => {
          if (confirm("Delete this derogation case and all its correspondence?")) delDerog.mutate();
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
      ] })
    ] }),
    isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t bg-muted/10 p-4 space-y-5", children: [
      (rec.status === "rejected" || rec.status === "refused") && !rec.correctiveAction && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-orange-300 bg-orange-50 p-3 text-sm text-orange-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Action Required:" }),
        " This derogation was refused. Record a corrective action by editing this case."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm", children: [
        rec.inputType && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Input type: " }),
          rec.inputType
        ] }),
        rec.regulatoryBasis && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Regulatory basis: " }),
          rec.regulatoryBasis
        ] }),
        rec.internalDecisionDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Internal decision: " }),
          rec.internalDecisionDate
        ] }),
        rec.availabilitySearchDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Availability search: " }),
          rec.availabilitySearchDate
        ] }),
        rec.availabilitySearchRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Search ref: " }),
          rec.availabilitySearchRef
        ] }),
        rec.decisionDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Decision date: " }),
          rec.decisionDate
        ] }),
        rec.approvalConditions && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Conditions: " }),
          rec.approvalConditions
        ] }),
        rec.rejectionReason && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Rejection reason: " }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-700", children: rec.rejectionReason })
        ] }),
        rec.rejectionRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Rejection ref: " }),
          rec.rejectionRef
        ] }),
        rec.correctiveAction && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Corrective action: " }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-700", children: rec.correctiveAction })
        ] }),
        rec.justification && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Justification: " }),
          rec.justification
        ] }),
        rec.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Notes: " }),
          rec.notes
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold", children: "Correspondence Log" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "h-7 text-xs", onClick: () => {
            setEditCorr(null);
            setCorrForm({ correspondenceDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), direction: "to-certifier", correspondenceType: "Application to Certifier", summary: "", reference: "", notes: "" });
            setCorrOpen(true);
          }, children: "+ Add" })
        ] }),
        corrItems.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "No correspondence logged yet." }) : corrItems.map((ci) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded p-3 flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: ci.correspondenceDate }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700", children: ci.direction }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: ci.correspondenceType })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: ci.summary }),
            ci.reference && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "Ref: ",
              ci.reference
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => {
              setEditCorr(ci);
              setCorrForm({ ...ci });
              setCorrOpen(true);
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "text-red-500", onClick: () => delCorr.mutate(ci.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
          ] })
        ] }, ci.id))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold", children: "Documents" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: uploadType, onValueChange: setUploadType, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 w-44 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Approval Letter", "Availability Search Evidence", "Application Letter", "Supporting Evidence", "Rejection Notice", "Conditions Letter", "Other"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "h-7 text-xs gap-1", disabled: uploading, onClick: () => {
              const inp = document.createElement("input");
              inp.type = "file";
              inp.accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp";
              inp.onchange = async () => {
                if (inp.files?.[0]) await handleFileUpload(inp.files[0], uploadType);
              };
              inp.click();
            }, children: uploading ? "Uploading…" : "Upload" })
          ] })
        ] }),
        docs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "No documents uploaded yet." }) : docs.map((doc) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded border bg-background px-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-sm", children: "📄" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium truncate", children: doc.fileName }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              doc.notes,
              " · ",
              new Date(doc.uploadedAt).toLocaleDateString("en-GB")
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `/api${doc.fileKey}`, target: "_blank", rel: "noopener noreferrer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", children: "↗" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-red-500", onClick: () => delDoc.mutate(doc.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" }) })
        ] }, doc.id))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: recordDecisionOpen, onOpenChange: (o) => {
      if (!o) setRecordDecisionOpen(false);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Record Certifier Decision" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Decision *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: decisionStatus, onValueChange: setDecisionStatus, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "approved", children: "Approved" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "refused", children: "Refused" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "withdrawn", children: "Withdrawn" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "expired", children: "Expired — no decision" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Decision Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", value: decisionDate, onChange: (e) => setDecisionDate(e.target.value) })
          ] })
        ] }),
        decisionStatus === "approved" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifier Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: decisionCertRef, onChange: (e) => setDecisionCertRef(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Approval Conditions" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { className: "mt-1", value: decisionConditions, onChange: (e) => setDecisionConditions(e.target.value), rows: 2 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expiry Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", value: decisionExpiry, onChange: (e) => setDecisionExpiry(e.target.value) })
          ] })
        ] }),
        decisionStatus === "refused" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Rejection Reason" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { className: "mt-1", value: decisionRejReason, onChange: (e) => setDecisionRejReason(e.target.value), rows: 2 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Rejection Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: decisionRejRef, onChange: (e) => setDecisionRejRef(e.target.value) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setRecordDecisionOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveDecision.mutate({ ...rec, status: decisionStatus, decisionDate: decisionDate || null, certifierRef: decisionCertRef || null, approvalConditions: decisionConditions || null, expiryDate: decisionExpiry || null, rejectionReason: decisionRejReason || null, rejectionRef: decisionRejRef || null }), disabled: saveDecision.isPending, children: saveDecision.isPending ? "Saving…" : "Save Decision" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: editOpen, onOpenChange: (o) => {
      if (!o) setEditOpen(false);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Edit Derogation Case" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Case Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(editForm.caseReference || ""), onChange: (e) => setEditForm((f) => ({ ...f, caseReference: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(editForm.status || "pending"), onValueChange: (v) => setEditForm((f) => ({ ...f, status: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: DEROGATION_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Input Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(editForm.inputName || ""), onChange: (e) => setEditForm((f) => ({ ...f, inputName: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Input Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(editForm.inputType || ""), onChange: (e) => setEditForm((f) => ({ ...f, inputType: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Regulatory Basis" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(editForm.regulatoryBasis || ""), onChange: (e) => setEditForm((f) => ({ ...f, regulatoryBasis: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifying Body" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(editForm.certifyingBody || ""), onValueChange: (v) => setEditForm((f) => ({ ...f, certifyingBody: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select body" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CERTIFYING_BODIES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifier Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(editForm.certifierRef || ""), onChange: (e) => setEditForm((f) => ({ ...f, certifierRef: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Internal Decision Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(editForm.internalDecisionDate || ""), onChange: (e) => setEditForm((f) => ({ ...f, internalDecisionDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Availability Search Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(editForm.availabilitySearchDate || ""), onChange: (e) => setEditForm((f) => ({ ...f, availabilitySearchDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Availability Search Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(editForm.availabilitySearchRef || ""), onChange: (e) => setEditForm((f) => ({ ...f, availabilitySearchRef: e.target.value })), placeholder: "OFAS / UKOAS ref" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Application Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(editForm.applicationDate || ""), onChange: (e) => setEditForm((f) => ({ ...f, applicationDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Decision Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(editForm.decisionDate || ""), onChange: (e) => setEditForm((f) => ({ ...f, decisionDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expiry Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(editForm.expiryDate || ""), onChange: (e) => setEditForm((f) => ({ ...f, expiryDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Justification" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: String(editForm.justification || ""), onChange: (e) => setEditForm((f) => ({ ...f, justification: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Approval Conditions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: String(editForm.approvalConditions || ""), onChange: (e) => setEditForm((f) => ({ ...f, approvalConditions: e.target.value })) })
        ] }),
        (editForm.status === "refused" || editForm.status === "rejected") && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Rejection Reason" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: String(editForm.rejectionReason || ""), onChange: (e) => setEditForm((f) => ({ ...f, rejectionReason: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Rejection Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(editForm.rejectionRef || ""), onChange: (e) => setEditForm((f) => ({ ...f, rejectionRef: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Corrective Action Taken" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: String(editForm.correctiveAction || ""), onChange: (e) => setEditForm((f) => ({ ...f, correctiveAction: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: String(editForm.notes || ""), onChange: (e) => setEditForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setEditOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveEdit.mutate(editForm), disabled: saveEdit.isPending || !editForm.inputName, children: saveEdit.isPending ? "Saving…" : "Save" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: corrOpen, onOpenChange: (o) => {
      if (!o) {
        setCorrOpen(false);
        setEditCorr(null);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editCorr ? "Edit Correspondence" : "Add Correspondence" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: corrForm.correspondenceDate ?? "", onChange: (e) => setCorrForm((f) => ({ ...f, correspondenceDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Direction" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: corrForm.direction ?? "to-certifier", onValueChange: (v) => setCorrForm((f) => ({ ...f, direction: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "to-certifier", children: "To certifier" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "from-certifier", children: "From certifier" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "internal", children: "Internal note" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: corrForm.correspondenceType ?? "", onValueChange: (v) => setCorrForm((f) => ({ ...f, correspondenceType: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Application to Certifier", "Availability Search Evidence", "Supporting Evidence", "Certifier Query", "Approval Letter", "Rejection Notice", "Conditions Letter", "Renewal Request", "Other"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Summary *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: corrForm.summary ?? "", onChange: (e) => setCorrForm((f) => ({ ...f, summary: e.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: corrForm.reference ?? "", onChange: (e) => setCorrForm((f) => ({ ...f, reference: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: corrForm.notes ?? "", onChange: (e) => setCorrForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setCorrOpen(false);
          setEditCorr(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveCorr.mutate(corrForm), disabled: !corrForm.correspondenceDate || !corrForm.correspondenceType || !corrForm.summary || saveCorr.isPending, children: "Save" })
      ] })
    ] }) })
  ] });
}
function DerogationsTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [expandedId, setExpandedId] = reactExports.useState(null);
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [addForm, setAddForm] = reactExports.useState({ status: "pending" });
  const sf = (k, v) => setAddForm((f) => ({ ...f, [k]: v }));
  const { data, isLoading } = useQuery({
    queryKey: ["org-venison-derog", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/organic-venison/derogations`), { credentials: "include" }).then((r) => r.json())
  });
  const records = data ?? [];
  const mutAdd = useMutation({
    mutationFn: (body) => fetch(api(`farms/${farmId}/organic-venison/derogations`), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ["org-venison-derog", farmId] });
      setAddOpen(false);
      setAddForm({ status: "pending" });
      toast({ title: "Case created" });
      setExpandedId(d?.id ?? null);
    },
    onError: () => toast({ title: "Error creating case", variant: "destructive" })
  });
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin" }) });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Derogation Case Register" }),
      " — Record all requests to use non-organic inputs or practices where no organic alternative is available. Each case tracks the availability search, certifier correspondence, decision, and supporting documents."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-wrap", children: [
        Object.entries(VENS_STATUS_CFG).map(([s, cfg]) => {
          const count = records.filter((r) => r.status === s).length;
          return count > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.cls} border-current/20`, children: [
            cfg.label,
            ": ",
            count
          ] }, s) : null;
        }),
        records.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "No derogation cases yet" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        setAddForm({ status: "pending" });
        setAddOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
        "New Derogation"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: records.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      VensDerogCard,
      {
        farmId,
        c: r,
        isExpanded: expandedId === r.id,
        onToggle: () => setExpandedId(expandedId === r.id ? null : r.id),
        qc
      },
      r.id
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen, onOpenChange: (o) => {
      if (!o) setAddOpen(false);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "New Derogation Case" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Case Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: addForm.caseReference || "", onChange: (e) => sf("caseReference", e.target.value), placeholder: "e.g. VENS-DERG-2025-001" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: addForm.status || "pending", onValueChange: (v) => sf("status", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: DEROGATION_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Input Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: addForm.inputName || "", onChange: (e) => sf("inputName", e.target.value), placeholder: "Name of input / treatment" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Input Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: addForm.inputType || "", onChange: (e) => sf("inputType", e.target.value), placeholder: "e.g. Mineral supplement" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Regulatory Basis" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: addForm.regulatoryBasis || "", onChange: (e) => sf("regulatoryBasis", e.target.value), placeholder: "e.g. UK Organic Reg Art. 24" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifying Body" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: addForm.certifyingBody || "", onValueChange: (v) => sf("certifyingBody", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select body" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CERTIFYING_BODIES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Internal Decision Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: addForm.internalDecisionDate || "", onChange: (e) => sf("internalDecisionDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Availability Search Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: addForm.availabilitySearchDate || "", onChange: (e) => sf("availabilitySearchDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Availability Search Ref (OFAS / UKOAS)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: addForm.availabilitySearchRef || "", onChange: (e) => sf("availabilitySearchRef", e.target.value), placeholder: "Search reference number" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Application Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: addForm.applicationDate || "", onChange: (e) => sf("applicationDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Justification" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: addForm.justification || "", onChange: (e) => sf("justification", e.target.value), placeholder: "Why no organic alternative is available" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: addForm.notes || "", onChange: (e) => sf("notes", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAddOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => mutAdd.mutate(addForm), disabled: mutAdd.isPending || !addForm.inputName, children: mutAdd.isPending ? "Saving…" : "Create Case" })
      ] })
    ] }) })
  ] });
}
function OrganicVenisonPage() {
  const { selectedFarm } = useAppStore();
  const farmId = selectedFarm?.id;
  const [tab, setTab] = reactExports.useState("certification");
  if (!farmId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-64 text-muted-foreground text-sm", children: "Select a farm to continue." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 py-6 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Organic Venison" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Certification records, grazing compartment conversion register, feed & supplement log, and derogation case management" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(OVTabBar, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(OVTabButton, { active: tab === "certification", onClick: () => setTab("certification"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "w-3.5 h-3.5" }),
        "Certification"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(OVTabButton, { active: tab === "land", onClick: () => setTab("land"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Map, { className: "w-3.5 h-3.5" }),
        "Land Register"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(OVTabButton, { active: tab === "feed", onClick: () => setTab("feed"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-3.5 h-3.5" }),
        "Feed & Supplements"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(OVTabButton, { active: tab === "derogations", onClick: () => setTab("derogations"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileQuestionMark, { className: "w-3.5 h-3.5" }),
        "Derogations"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-4 bg-card", children: [
      tab === "certification" && /* @__PURE__ */ jsxRuntimeExports.jsx(CertificationTab, { farmId }),
      tab === "land" && /* @__PURE__ */ jsxRuntimeExports.jsx(LandRegisterTab, { farmId }),
      tab === "feed" && /* @__PURE__ */ jsxRuntimeExports.jsx(FeedSupplementsTab, { farmId }),
      tab === "derogations" && /* @__PURE__ */ jsxRuntimeExports.jsx(DerogationsTab, { farmId })
    ] })
  ] }) });
}
export {
  OrganicVenisonPage as default
};
