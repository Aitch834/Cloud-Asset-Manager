import { q as createLucideIcon, b as useAppStore, a as useToast, t as useQueryClient, r as reactExports, l as useQuery, O as useMutation, j as jsxRuntimeExports, M as MapPin, B as Building2, c as Button, S as Plus, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, J as DialogFooter, L as Label, I as Input } from "./index-BKiGXyyl.js";
import { O as OtherSelect } from "./other-select-BzSAUjVA.js";
import { u as useLookupStrings } from "./use-lookup-CPrTnBV5.js";
import { A as AppLayout, e as ChartColumn, j as Truck, I as Info } from "./AppLayout-CoJeHLc1.js";
import { B as Badge } from "./badge-DF2kAYMk.js";
import { T as Textarea } from "./textarea-DG7cOgNQ.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BjVSIfJu.js";
import { L as Leaf, T as TriangleAlert } from "./triangle-alert-DDfZSw4A.js";
import { A as Award } from "./award-CDgsY581.js";
import { D as Download } from "./download-CodHN7WP.js";
import { C as CircleCheck } from "./circle-check-CNHtC0fx.js";
import { C as CircleX } from "./circle-x-DbvmBwB3.js";
import { E as Eye } from "./eye-DFc2sKUi.js";
import { T as Trash2 } from "./trash-2-BZsfO4G2.js";
import { M as Mail } from "./mail-DquYnWx6.js";
import { P as Phone } from "./phone-DHUArXQV.js";
import { F as FileText } from "./shield-alert-ysywFjdQ.js";
import { a as Clock } from "./database-CsnNyBTj.js";
import "./use-safe-clerk-BYoc4cXB.js";
import "./shield-check-BGZLbyo7.js";
import "./tractor-DTH0LmwK.js";
import "./index-DjesPn3_.js";
import "./index-CILHAycy.js";
import "./chevron-up-C4Lodd_0.js";
const __iconNode = [
  ["path", { d: "M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7", key: "1m0v6g" }],
  [
    "path",
    {
      d: "M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",
      key: "ohrbg2"
    }
  ]
];
const SquarePen = createLucideIcon("square-pen", __iconNode);
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / 864e5);
}
function certStatusBadge(cert) {
  const days = daysUntil(cert.expiryDate);
  if (cert.status !== "active") return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", children: "Inactive" });
  if (days === null) return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-gray-100 text-gray-600", children: "No Expiry Set" });
  if (days < 0) return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", children: "Expired" });
  if (days <= 60) return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-orange-100 text-orange-700", children: [
    "Expires in ",
    days,
    "d"
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-green-100 text-green-700", children: [
    "Active — ",
    days,
    "d left"
  ] });
}
function eligibilityBadge(status) {
  if (status === "eligible") return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-green-100 text-green-700", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3 mr-1" }),
    "Eligible"
  ] });
  if (status === "not-eligible") return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-red-100 text-red-700", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-3 h-3 mr-1" }),
    "Not Eligible"
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-yellow-100 text-yellow-700", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3 mr-1" }),
    "Requires Verification"
  ] });
}
function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = "Confirm", confirmVariant = "default" }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
    if (!o) onCancel();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "22rem" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: title }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: message }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onCancel, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: confirmVariant, onClick: onConfirm, children: confirmLabel })
    ] })
  ] }) });
}
function BiofuelPage() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = reactExports.useState("overview");
  const [certDialog, setCertDialog] = reactExports.useState(false);
  const [fieldDialog, setFieldDialog] = reactExports.useState(false);
  const [deliveryDialog, setDeliveryDialog] = reactExports.useState(false);
  const [buyerDialog, setBuyerDialog] = reactExports.useState(false);
  const [editingCert, setEditingCert] = reactExports.useState(null);
  const [editingField, setEditingField] = reactExports.useState(null);
  const [editingDelivery, setEditingDelivery] = reactExports.useState(null);
  const [editingBuyer, setEditingBuyer] = reactExports.useState(null);
  const [viewCert, setViewCert] = reactExports.useState(null);
  const [viewField, setViewField] = reactExports.useState(null);
  const [viewBuyer, setViewBuyer] = reactExports.useState(null);
  const [viewDelivery, setViewDelivery] = reactExports.useState(null);
  const [declarationDownloading, setDeclarationDownloading] = reactExports.useState(null);
  const [auditPackDownloading, setAuditPackDownloading] = reactExports.useState(false);
  const [pendingConfirm, setPendingConfirm] = reactExports.useState(null);
  const certsQ = useQuery({
    queryKey: ["biofuel-certs", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/biofuel/certification`).then((r) => r.json()),
    enabled: !!farmId
  });
  const fieldsQ = useQuery({
    queryKey: ["biofuel-fields", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/biofuel/field-declarations`).then((r) => r.json()),
    enabled: !!farmId
  });
  const deliveriesQ = useQuery({
    queryKey: ["biofuel-deliveries", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/biofuel/deliveries`).then((r) => r.json()),
    enabled: !!farmId
  });
  const ghgQ = useQuery({
    queryKey: ["biofuel-ghg", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/biofuel/ghg-summary`).then((r) => r.json()),
    enabled: !!farmId
  });
  const buyersQ = useQuery({
    queryKey: ["biofuel-buyers", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/biofuel/buyers`).then((r) => r.json()),
    enabled: !!farmId
  });
  const farmFieldNamesQ = useQuery({
    queryKey: ["farm-fields-lookup", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fields`).then((r) => r.json()),
    enabled: !!farmId
  });
  const tenantUsersQ = useQuery({
    queryKey: ["tenant-users"],
    queryFn: () => fetch(`/api/tenants/current/users`).then((r) => r.json()),
    enabled: !!farmId
  });
  const storageLocationsQ = useQuery({
    queryKey: ["storage-locations", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/storage-locations`).then((r) => r.json()),
    enabled: !!farmId
  });
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["biofuel-certs", farmId] });
    qc.invalidateQueries({ queryKey: ["biofuel-fields", farmId] });
    qc.invalidateQueries({ queryKey: ["biofuel-deliveries", farmId] });
    qc.invalidateQueries({ queryKey: ["biofuel-buyers", farmId] });
    qc.invalidateQueries({ queryKey: ["biofuel-ghg", farmId] });
  };
  const certMut = useMutation({
    mutationFn: (data) => {
      const url = editingCert ? `/api/farms/${farmId}/biofuel/certification/${editingCert.id}` : `/api/farms/${farmId}/biofuel/certification`;
      return fetch(url, { method: editingCert ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    },
    onSuccess: () => {
      invalidate();
      setCertDialog(false);
      setEditingCert(null);
      toast({ title: "Certification saved" });
    },
    onError: () => toast({ title: "Error saving certification", variant: "destructive" })
  });
  const deleteCertMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/biofuel/certification/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      invalidate();
      toast({ title: "Certification deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const fieldMut = useMutation({
    mutationFn: (data) => {
      const url = editingField ? `/api/farms/${farmId}/biofuel/field-declarations/${editingField.id}` : `/api/farms/${farmId}/biofuel/field-declarations`;
      return fetch(url, { method: editingField ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    },
    onSuccess: () => {
      invalidate();
      setFieldDialog(false);
      setEditingField(null);
      toast({ title: "Field declaration saved" });
    },
    onError: () => toast({ title: "Error saving field declaration", variant: "destructive" })
  });
  const deleteFieldMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/biofuel/field-declarations/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      invalidate();
      toast({ title: "Declaration deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const deliveryMut = useMutation({
    mutationFn: (data) => {
      const url = editingDelivery ? `/api/farms/${farmId}/biofuel/deliveries/${editingDelivery.id}` : `/api/farms/${farmId}/biofuel/deliveries`;
      return fetch(url, { method: editingDelivery ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    },
    onSuccess: () => {
      invalidate();
      setDeliveryDialog(false);
      setEditingDelivery(null);
      toast({ title: "Delivery record saved" });
    },
    onError: () => toast({ title: "Error saving delivery", variant: "destructive" })
  });
  const deleteDeliveryMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/biofuel/deliveries/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      invalidate();
      toast({ title: "Delivery deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const buyerMut = useMutation({
    mutationFn: (data) => {
      const url = editingBuyer ? `/api/farms/${farmId}/biofuel/buyers/${editingBuyer.id}` : `/api/farms/${farmId}/biofuel/buyers`;
      return fetch(url, { method: editingBuyer ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    },
    onSuccess: () => {
      invalidate();
      setBuyerDialog(false);
      setEditingBuyer(null);
      toast({ title: "Buyer saved" });
    },
    onError: () => toast({ title: "Error saving buyer", variant: "destructive" })
  });
  const deactivateBuyerMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/biofuel/buyers/${id}/deactivate`, { method: "PATCH" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["biofuel-buyers", farmId] });
      toast({ title: "Buyer marked inactive — all historic records preserved" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const reactivateBuyerMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/biofuel/buyers/${id}/reactivate`, { method: "PATCH" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["biofuel-buyers", farmId] });
      toast({ title: "Buyer reactivated" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const handleDeclarationDownload = async (delivery) => {
    setDeclarationDownloading(delivery.id);
    try {
      const res = await fetch(`/api/farms/${farmId}/biofuel/deliveries/${delivery.id}/sustainability-declaration.pdf`);
      if (!res.ok) throw new Error("Failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const cd = res.headers.get("Content-Disposition") ?? "";
      const match = cd.match(/filename="([^"]+)"/);
      a.download = match?.[1] ?? `Sustainability-Declaration-${delivery.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Could not download declaration", variant: "destructive" });
    } finally {
      setDeclarationDownloading(null);
    }
  };
  const handleAuditPackDownload = async () => {
    setAuditPackDownloading(true);
    try {
      const res = await fetch(`/api/farms/${farmId}/biofuel/audit-pack.pdf`);
      if (!res.ok) throw new Error("Failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const cd = res.headers.get("Content-Disposition") ?? "";
      const match = cd.match(/filename="([^"]+)"/);
      a.download = match?.[1] ?? "RTFO-Audit-Pack.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Could not download audit pack", variant: "destructive" });
    } finally {
      setAuditPackDownloading(false);
    }
  };
  const certs = certsQ.data?.records ?? [];
  const fields = fieldsQ.data?.records ?? [];
  const deliveries = deliveriesQ.data?.records ?? [];
  const buyers = buyersQ.data?.records ?? [];
  const ghg = ghgQ.data;
  const storageLocations = (storageLocationsQ.data?.records ?? []).filter((l) => l.isActive);
  const farmFieldNames = (farmFieldNamesQ.data?.records ?? []).map((f) => f.name).filter(Boolean);
  const eligibleFieldNames = fields.filter((f) => f.eligibilityStatus === "eligible").map((f) => f.fieldName).filter(Boolean);
  const existingDeclarants = [...new Set(fields.map((f) => f.declaredBy ?? "").filter(Boolean))];
  const tenantUserNames = (tenantUsersQ.data?.users ?? []).map((u) => [u.firstName, u.lastName].filter(Boolean).join(" ").trim()).filter(Boolean);
  const declaredByOptions = [.../* @__PURE__ */ new Set([...tenantUserNames, ...existingDeclarants])].sort();
  const activeCert = certs.find((c) => c.status === "active");
  const eligibleFields = fields.filter((f) => f.eligibilityStatus === "eligible").length;
  const ineligibleFields = fields.filter((f) => f.eligibilityStatus === "not-eligible").length;
  const tabs = [
    { id: "overview", label: "Overview", icon: ChartColumn },
    { id: "certification", label: "Certification", icon: Award },
    { id: "fields", label: "Field Declarations", icon: MapPin },
    { id: "buyers", label: "Registered Buyers", icon: Building2 },
    { id: "deliveries", label: "Delivery Records", icon: Truck }
  ];
  if (!farmId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Biofuel / RTFO", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 12, color: "#6b7280" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { size: 40, style: { opacity: 0.4 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600 }, children: "No farm selected" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: 14 }, children: "Select a farm to view biofuel compliance records." })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { title: "Biofuel / RTFO Compliance", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { maxWidth: 1100, margin: "0 auto", padding: "0 0 40px" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ConfirmDialog,
        {
          open: !!pendingConfirm,
          title: pendingConfirm?.title ?? "Confirm",
          message: pendingConfirm?.msg ?? "",
          onConfirm: () => {
            pendingConfirm?.fn();
            setPendingConfirm(null);
          },
          onCancel: () => setPendingConfirm(null),
          confirmLabel: "Delete",
          confirmVariant: "destructive"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "linear-gradient(135deg, #14532d 0%, #166534 100%)", borderRadius: 16, padding: "24px 32px", marginBottom: 24, color: "#fff" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { size: 28 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { style: { fontSize: 22, fontWeight: 700, margin: 0 }, children: "Biofuel & RTFO Sustainability" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: 0, opacity: 0.85, fontSize: 14, maxWidth: 640 }, children: "Manage your Renewable Transport Fuel Obligation (RTFO) compliance — certification, field land eligibility declarations, GHG traceability, and consignment delivery records." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 8, marginBottom: 24, borderBottom: "1px solid #e5e7eb", paddingBottom: 0 }, children: tabs.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setActiveTab(t.id),
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 16px",
            background: "none",
            border: "none",
            borderBottom: activeTab === t.id ? "2px solid #16a34a" : "2px solid transparent",
            cursor: "pointer",
            fontWeight: activeTab === t.id ? 600 : 400,
            color: activeTab === t.id ? "#16a34a" : "#6b7280",
            fontSize: 14
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(t.icon, { size: 15 }),
            t.label
          ]
        },
        t.id
      )) }),
      activeTab === "overview" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 16 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "sm",
            variant: "outline",
            onClick: handleAuditPackDownload,
            disabled: auditPackDownloading,
            style: { display: "flex", alignItems: "center", gap: 6 },
            children: auditPackDownloading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "animate-spin mr-1", children: "⏳" }),
              " Generating…"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 14 }),
              " Export Audit Pack"
            ] })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }, children: [
          { label: "Active Certification", value: activeCert ? activeCert.scheme : "None", sub: activeCert ? certStatusBadge(activeCert) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-red-100 text-red-700", children: "Not Certified" }), icon: Award, color: "#16a34a" },
          { label: "Eligible Fields", value: eligibleFields, sub: `of ${fields.length} declared`, icon: MapPin, color: "#2563eb" },
          { label: "Biofuel Deliveries", value: deliveries.length, sub: `${ghg?.totalBiofuelTonnes ?? "0"} tonnes total`, icon: Truck, color: "#d97706" },
          { label: "Harvest Records", value: ghg?.harvestRecordCount ?? 0, sub: `${ghg?.totalHarvestTonnes ?? "0"} tonnes`, icon: ChartColumn, color: "#7c3aed" }
        ].map((card, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", borderRadius: 12, padding: "20px 24px", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: card.color + "18", borderRadius: 8, padding: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(card.icon, { size: 18, style: { color: card.color } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 12, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }, children: card.label })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 28, fontWeight: 700, color: "#111827", marginBottom: 4 }, children: card.value }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 13, color: "#6b7280" }, children: card.sub })
        ] }, i)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", borderRadius: 12, padding: "20px 24px", border: "1px solid #e5e7eb", marginBottom: 24 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { margin: "0 0 16px", fontWeight: 600, fontSize: 15 }, children: "RTFO Compliance Checklist" }),
          [
            { label: "Certification scheme registered (ISCC / equivalent)", ok: certs.length > 0 },
            { label: "Active certification with valid expiry date", ok: !!activeCert && (daysUntil(activeCert.expiryDate) ?? 1) > 0 },
            { label: "Field land eligibility declarations completed", ok: fields.length > 0 },
            { label: "No high-carbon-stock or high-biodiversity risk fields flagged", ok: fields.every((f) => !f.highCarbonStockRisk && !f.highBiodiversityRisk) },
            { label: "Biofuel delivery records with sustainability declarations", ok: deliveries.length > 0 },
            { label: "Harvest records linked for GHG traceability", ok: (ghg?.harvestRecordCount ?? 0) > 0 }
          ].map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < 5 ? "1px solid #f3f4f6" : "none" }, children: [
            item.ok ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 18, style: { color: "#16a34a", flexShrink: 0 } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { size: 18, style: { color: "#dc2626", flexShrink: 0 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 14, color: item.ok ? "#111827" : "#dc2626" }, children: item.label })
          ] }, i))
        ] }),
        ineligibleFields > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "16px 20px", display: "flex", gap: 12, alignItems: "flex-start" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 18, style: { color: "#dc2626", flexShrink: 0, marginTop: 2 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: "0 0 4px", fontWeight: 600, color: "#dc2626", fontSize: 14 }, children: [
              ineligibleFields,
              " field(s) declared ineligible"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: 0, color: "#7f1d1d", fontSize: 13 }, children: "Crops from ineligible fields cannot be sold into the biofuel supply chain. Review the field declarations tab." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: "16px 20px", display: "flex", gap: 12, alignItems: "flex-start", marginTop: 16 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { size: 18, style: { color: "#2563eb", flexShrink: 0, marginTop: 2 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: 0, color: "#1e40af", fontSize: 13, lineHeight: 1.6 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "GHG data inputs available:" }),
            " ",
            ghg?.nvzApplicationCount ?? 0,
            " NVZ fertiliser applications and ",
            ghg?.sprayApplicationCount ?? 0,
            " spray applications are on record. Your ISCC auditor or biofuel buyer can use this data to calculate your field-level GHG footprint."
          ] })
        ] })
      ] }),
      activeTab === "certification" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { margin: 0, fontWeight: 600, fontSize: 16 }, children: "Certification Records" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
            setEditingCert(null);
            setCertDialog(true);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 15, className: "mr-1" }),
            " Add Certification"
          ] })
        ] }),
        certs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", borderRadius: 12, padding: 48, textAlign: "center", border: "1px solid #e5e7eb" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { size: 40, style: { color: "#d1d5db", margin: "0 auto 12px" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: "No certifications recorded" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#6b7280", fontSize: 14, marginBottom: 16 }, children: "Add your ISCC or equivalent RTFO certification details." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => {
            setEditingCert(null);
            setCertDialog(true);
          }, children: "Add First Certification" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: certs.map((cert) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", borderRadius: 12, padding: "20px 24px", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 16 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#f0fdf4", borderRadius: 8, padding: 10 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { size: 22, style: { color: "#16a34a" } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 600, fontSize: 15, marginBottom: 2 }, children: cert.scheme }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: 13, color: "#6b7280" }, children: [
              cert.certificationNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Cert No: ",
                cert.certificationNumber,
                " · "
              ] }),
              cert.issuingBody && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                cert.issuingBody,
                " · "
              ] }),
              cert.expiryDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Expires: ",
                new Date(cert.expiryDate).toLocaleDateString("en-GB")
              ] })
            ] }),
            cert.rtfoOperatorNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: 12, color: "#6b7280", marginTop: 2 }, children: [
              "RTFO Operator No: ",
              cert.rtfoOperatorNumber
            ] }),
            cert.scope && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: 12, color: "#6b7280", marginTop: 2 }, children: [
              "Scope: ",
              cert.scope
            ] })
          ] }),
          certStatusBadge(cert),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setViewCert(cert), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 14 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => {
              setEditingCert(cert);
              setCertDialog(true);
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { size: 14 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setPendingConfirm({ title: "Delete Certification", msg: "Delete this certification record? This cannot be undone.", fn: () => deleteCertMut.mutate(cert.id) }), style: { color: "#dc2626" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
          ] })
        ] }, cert.id)) })
      ] }),
      activeTab === "fields" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { margin: 0, fontWeight: 600, fontSize: 16 }, children: "Field Land Eligibility Declarations" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
            setEditingField(null);
            setFieldDialog(true);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 15, className: "mr-1" }),
            " Add Declaration"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#92400e" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Requirement:" }),
          " All fields supplying crops to the biofuel chain must have a land-use declaration confirming the land was not converted from high-carbon-stock or high-biodiversity areas after January 2008."
        ] }),
        fields.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", borderRadius: 12, padding: 48, textAlign: "center", border: "1px solid #e5e7eb" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 40, style: { color: "#d1d5db", margin: "0 auto 12px" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: "No field declarations" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#6b7280", fontSize: 14, marginBottom: 16 }, children: "Declare the land use history for each field supplying biofuel crops." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => {
            setEditingField(null);
            setFieldDialog(true);
          }, children: "Add First Declaration" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Field", "Land Use in 2008", "Converted After 2008", "Carbon Risk", "Biodiversity Risk", "Status", "Actions"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em" }, children: h }, h)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: fields.map((f, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < fields.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "12px 16px", fontWeight: 600, fontSize: 14 }, children: f.fieldName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "12px 16px", fontSize: 14, color: "#374151", textTransform: "capitalize" }, children: f.landUseIn2008.replace(/-/g, " ") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "12px 16px" }, children: f.convertedAfter2008 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-red-100 text-red-700", children: "Yes" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-green-100 text-green-700", children: "No" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "12px 16px" }, children: f.highCarbonStockRisk ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-red-100 text-red-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 11, className: "mr-1" }),
              "High"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-green-100 text-green-700", children: "Low" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "12px 16px" }, children: f.highBiodiversityRisk ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-red-100 text-red-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 11, className: "mr-1" }),
              "High"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-green-100 text-green-700", children: "Low" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "12px 16px" }, children: eligibilityBadge(f.eligibilityStatus) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "12px 16px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 6 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setViewField(f), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 13 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => {
                setEditingField(f);
                setFieldDialog(true);
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { size: 13 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", style: { color: "#dc2626" }, onClick: () => setPendingConfirm({ title: "Delete Declaration", msg: "Delete this field land eligibility declaration? This cannot be undone.", fn: () => deleteFieldMut.mutate(f.id) }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 13 }) })
            ] }) })
          ] }, f.id)) })
        ] }) })
      ] }),
      activeTab === "buyers" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { margin: "0 0 4px", fontWeight: 600, fontSize: 16 }, children: "Registered RTFO Buyers" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: 0, fontSize: 13, color: "#6b7280" }, children: [
              "Buyers are obligated fuel suppliers registered with the Department for Transport. Each buyer holds an ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "RTF Obligation Number" }),
              " — the government-issued ID you must record for audit."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
            setEditingBuyer(null);
            setBuyerDialog(true);
          }, style: { flexShrink: 0, marginLeft: 16 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 15, className: "mr-1" }),
            " Add Buyer"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-start" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { size: 16, style: { color: "#2563eb", marginTop: 2, flexShrink: 0 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: 13, color: "#1e40af", lineHeight: 1.5 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "What is an RTF Obligation Number?" }),
            " The Department for Transport assigns this unique reference to every fuel supplier (oil company, fuel distributor, etc.) that is legally obligated to blend renewable fuel into their supplies under the RTFO. It appears on sustainability declarations and is your audit trail that the delivery went to a legitimate, registered buyer. You can verify buyers on the",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://www.gov.uk/guidance/renewable-transport-fuel-obligation", target: "_blank", rel: "noopener noreferrer", style: { color: "#1d4ed8" }, children: "DfT RTFO page" }),
            "."
          ] })
        ] }),
        buyers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", borderRadius: 12, padding: 48, textAlign: "center", border: "1px solid #e5e7eb" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { size: 40, style: { color: "#d1d5db", margin: "0 auto 12px" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: "No buyers added yet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#6b7280", fontSize: 14, marginBottom: 16 }, children: "Add the fuel companies you sell biofuel crops to. Once added, you can select them when recording deliveries." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => {
            setEditingBuyer(null);
            setBuyerDialog(true);
          }, children: "Add First Buyer" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: buyers.map((b) => {
          const isActive = b.isActive !== false;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: isActive ? "#fff" : "#f9fafb", borderRadius: 12, padding: "20px 24px", border: `1px solid ${isActive ? "#e5e7eb" : "#e5e7eb"}`, display: "flex", alignItems: "flex-start", gap: 16, opacity: isActive ? 1 : 0.65 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: isActive ? "#eff6ff" : "#f3f4f6", borderRadius: 8, padding: 10, flexShrink: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { size: 20, style: { color: isActive ? "#2563eb" : "#9ca3af" } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontWeight: 600, fontSize: 15, marginBottom: 2, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { textDecoration: isActive ? "none" : "line-through", color: isActive ? void 0 : "#9ca3af" }, children: b.companyName }),
                !isActive && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 10, background: "#f3f4f6", color: "#6b7280", padding: "2px 6px", borderRadius: 4, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", textDecoration: "none" }, children: "Inactive" }),
                b.tradingName && b.tradingName !== b.companyName && isActive && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontWeight: 400, color: "#6b7280", fontSize: 13 }, children: [
                  " — trading as ",
                  b.tradingName
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexWrap: "wrap", gap: "4px 16px", fontSize: 13, color: "#4b5563", marginTop: 4 }, children: [
                b.rtfoObligationNumber && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { display: "flex", alignItems: "center", gap: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-blue-100 text-blue-700 text-xs font-mono", children: [
                  "RTF ",
                  b.rtfoObligationNumber
                ] }) }),
                b.isccCertNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#6b7280" }, children: [
                  "ISCC: ",
                  b.isccCertNumber
                ] }),
                b.contactName && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#6b7280" }, children: [
                  "Contact: ",
                  b.contactName
                ] }),
                b.contactEmail && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "flex", alignItems: "center", gap: 3, color: "#6b7280" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { size: 12 }),
                  b.contactEmail
                ] }),
                b.contactPhone && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "flex", alignItems: "center", gap: 3, color: "#6b7280" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { size: 12 }),
                  b.contactPhone
                ] })
              ] }),
              (b.town || b.postcode) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 12, color: "#9ca3af", marginTop: 3 }, children: [b.addressLine1, b.town, b.county, b.postcode].filter(Boolean).join(", ") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, flexShrink: 0 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setViewBuyer(b), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 14 }) }),
              isActive && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => {
                setEditingBuyer(b);
                setBuyerDialog(true);
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { size: 14 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  style: { color: isActive ? "#dc2626" : "#16a34a", borderColor: isActive ? "#fecaca" : "#bbf7d0" },
                  onClick: () => isActive ? deactivateBuyerMut.mutate(b.id) : reactivateBuyerMut.mutate(b.id),
                  children: isActive ? "Deactivate" : "Reactivate"
                }
              )
            ] })
          ] }, b.id);
        }) })
      ] }),
      activeTab === "deliveries" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { margin: 0, fontWeight: 600, fontSize: 16 }, children: "Biofuel Delivery Records" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
            setEditingDelivery(null);
            setDeliveryDialog(true);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 15, className: "mr-1" }),
            " Add Delivery"
          ] })
        ] }),
        fields.length > 0 && eligibleFieldNames.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 16px", background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 10, marginBottom: 16 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 16, style: { color: "#d97706", flexShrink: 0, marginTop: 1 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: 0, fontWeight: 600, fontSize: 14, color: "#92400e" }, children: "No eligible fields declared" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: "2px 0 0", fontSize: 13, color: "#78350f" }, children: [
              "All field declarations are either ineligible or pending verification. Delivery records logged now will have an incomplete RTFO audit trail. Go to the ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Field Declarations" }),
              " tab to review."
            ] })
          ] })
        ] }),
        deliveries.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", borderRadius: 12, padding: 48, textAlign: "center", border: "1px solid #e5e7eb" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { size: 40, style: { color: "#d1d5db", margin: "0 auto 12px" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: "No delivery records" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#6b7280", fontSize: 14, marginBottom: 16 }, children: "Record each consignment of biofuel crop delivered to buyers with sustainability declaration references." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => {
            setEditingDelivery(null);
            setDeliveryDialog(true);
          }, children: "Add First Delivery" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: deliveries.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", borderRadius: 12, padding: "20px 24px", border: "1px solid #e5e7eb", display: "flex", alignItems: "flex-start", gap: 16 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fef3c7", borderRadius: 8, padding: 10 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { size: 20, style: { color: "#d97706" } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontWeight: 600, fontSize: 15 }, children: [
                d.buyerName,
                " — ",
                d.cropType
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                fontSize: 11,
                fontWeight: 600,
                padding: "1px 7px",
                borderRadius: 99,
                background: d.sourceType === "ex_field" ? "#dbeafe" : "#dcfce7",
                color: d.sourceType === "ex_field" ? "#1d4ed8" : "#15803d"
              }, children: d.sourceType === "ex_field" ? "Ex-Field" : "From Store" }),
              d.transportType && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 11, fontWeight: 500, padding: "1px 7px", borderRadius: 99, background: "#f3f4f6", color: "#374151" }, children: d.transportType === "own" ? "Own vehicle" : d.transportType === "buyer" ? "Buyer's vehicle" : d.haulierName ?? "3rd party" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: 13, color: "#6b7280" }, children: [
              new Date(d.deliveryDate).toLocaleDateString("en-GB"),
              d.quantityTonnes && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                " · ",
                Number(d.quantityTonnes).toFixed(2),
                "t"
              ] }),
              d.buyerRtfoRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                " · RTFO Ref: ",
                d.buyerRtfoRef
              ] }),
              d.storageLocationName && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                " · ",
                d.storageLocationName
              ] })
            ] }),
            d.deliveryNoteRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: 12, color: "#6b7280", marginTop: 2 }, children: [
              "Note: ",
              d.deliveryNoteRef,
              d.vehicleRegistration ? ` · Reg: ${d.vehicleRegistration}` : ""
            ] }),
            d.sustainabilityScheme && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: 12, color: "#6b7280", marginTop: 2 }, children: [
              "Scheme: ",
              d.sustainabilityScheme
            ] }),
            d.ghgSavingPercent && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: 12, color: "#16a34a", marginTop: 2 }, children: [
              "GHG saving: ",
              d.ghgSavingPercent,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, flexShrink: 0 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setViewDelivery(d), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 14 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                variant: "outline",
                title: "Download Sustainability Declaration PDF",
                disabled: declarationDownloading === d.id,
                onClick: () => handleDeclarationDownload(d),
                style: { display: "flex", alignItems: "center", gap: 5, color: "#16a34a", borderColor: "#16a34a" },
                children: [
                  declarationDownloading === d.id ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "animate-spin", style: { fontSize: 11 }, children: "⏳" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 13 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 12 }, children: declarationDownloading === d.id ? "Generating…" : "Declaration" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => {
              setEditingDelivery(d);
              setDeliveryDialog(true);
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { size: 14 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", style: { color: "#dc2626" }, onClick: () => setPendingConfirm({ title: "Delete Delivery", msg: "Delete this delivery record? This cannot be undone.", fn: () => deleteDeliveryMut.mutate(d.id) }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
          ] })
        ] }, d.id)) })
      ] })
    ] }),
    viewCert && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) setViewCert(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 520 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Certification — ",
        viewCert.scheme
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 12, fontSize: 14 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Certification Scheme" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0", fontWeight: 500 }, children: viewCert.scheme })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginTop: 4 }, children: certStatusBadge(viewCert) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Certification Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0", fontFamily: "monospace" }, children: viewCert.certificationNumber || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Issuing Body" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0" }, children: viewCert.issuingBody || "—" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Issue Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0" }, children: viewCert.issueDate ? new Date(viewCert.issueDate).toLocaleDateString("en-GB") : "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Expiry Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0" }, children: viewCert.expiryDate ? new Date(viewCert.expiryDate).toLocaleDateString("en-GB") : "—" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "RTFO Operator Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0", fontFamily: "monospace" }, children: viewCert.rtfoOperatorNumber || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Certification Scope" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0" }, children: viewCert.scope || "—" })
          ] })
        ] }),
        viewCert.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0" }, children: viewCert.notes })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => {
          setViewCert(null);
          setEditingCert(viewCert);
          setCertDialog(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { size: 13, className: "mr-1" }),
          "Edit"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewCert(null), children: "Close" })
      ] })
    ] }) }),
    viewField && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) setViewField(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 540 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Field Declaration — ",
        viewField.fieldName
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 12, fontSize: 14 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Field Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0", fontWeight: 500 }, children: viewField.fieldName })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Eligibility Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginTop: 4 }, children: eligibilityBadge(viewField.eligibilityStatus) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Land Use in January 2008" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0", textTransform: "capitalize" }, children: viewField.landUseIn2008.replace(/-/g, " ") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Converted After 2008?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0" }, children: viewField.convertedAfter2008 ? "Yes" : "No" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "High Carbon Risk?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0", color: viewField.highCarbonStockRisk ? "#dc2626" : void 0 }, children: viewField.highCarbonStockRisk ? "Yes — High" : "No" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Biodiversity Risk?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0", color: viewField.highBiodiversityRisk ? "#dc2626" : void 0 }, children: viewField.highBiodiversityRisk ? "Yes — High" : "No" })
          ] })
        ] }),
        viewField.conversionFrom && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Converted From" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0" }, children: viewField.conversionFrom })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Declaration Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0" }, children: viewField.declarationDate ? new Date(viewField.declarationDate).toLocaleDateString("en-GB") : "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Declared By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0" }, children: viewField.declaredBy || "—" })
          ] })
        ] }),
        viewField.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0" }, children: viewField.notes })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => {
          setViewField(null);
          setEditingField(viewField);
          setFieldDialog(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { size: 13, className: "mr-1" }),
          "Edit"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewField(null), children: "Close" })
      ] })
    ] }) }),
    viewBuyer && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) setViewBuyer(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 560 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Buyer — ",
        viewBuyer.companyName
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 14, fontSize: 14 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9fafb", borderRadius: 8, padding: "12px 14px", border: "1px solid #e5e7eb" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "0 0 10px", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }, children: "Company Identity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Company Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: "2px 0 0", fontWeight: 600, fontSize: 15 }, children: [
                viewBuyer.companyName,
                viewBuyer.isActive === false && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 11, marginLeft: 8, color: "#6b7280" }, children: "(Inactive)" })
              ] })
            ] }),
            viewBuyer.tradingName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Trading Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0" }, children: viewBuyer.tradingName })
            ] }),
            viewBuyer.rtfoObligationNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "RTF Obligation Number" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0", fontFamily: "monospace" }, children: viewBuyer.rtfoObligationNumber })
            ] }),
            viewBuyer.isccCertNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Buyer's ISCC Cert No." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0", fontFamily: "monospace" }, children: viewBuyer.isccCertNumber })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9fafb", borderRadius: 8, padding: "12px 14px", border: "1px solid #e5e7eb" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "0 0 10px", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }, children: "Contact" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Contact Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0" }, children: viewBuyer.contactName || "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Phone" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0" }, children: viewBuyer.contactPhone || "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Email" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0" }, children: viewBuyer.contactEmail || "—" })
            ] })
          ] })
        ] }),
        (viewBuyer.addressLine1 || viewBuyer.town || viewBuyer.postcode) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9fafb", borderRadius: 8, padding: "12px 14px", border: "1px solid #e5e7eb" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "0 0 10px", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }, children: "Address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: 0, lineHeight: 1.7 }, children: [viewBuyer.addressLine1, viewBuyer.addressLine2, viewBuyer.town, viewBuyer.county, viewBuyer.postcode?.toUpperCase()].filter(Boolean).join(", ") })
        ] }),
        viewBuyer.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0" }, children: viewBuyer.notes })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        viewBuyer.isActive !== false && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => {
          setViewBuyer(null);
          setEditingBuyer(viewBuyer);
          setBuyerDialog(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { size: 13, className: "mr-1" }),
          "Edit"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewBuyer(null), children: "Close" })
      ] })
    ] }) }),
    viewDelivery && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) setViewDelivery(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 580, maxHeight: "90vh", overflowY: "auto" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Delivery — ",
        viewDelivery.buyerName
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 14, fontSize: 14 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9fafb", borderRadius: 8, padding: "12px 14px", border: "1px solid #e5e7eb" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "0 0 10px", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }, children: "Consignment" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Delivery Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0", fontWeight: 500 }, children: new Date(viewDelivery.deliveryDate).toLocaleDateString("en-GB") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Quantity (tonnes)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0", fontWeight: 500 }, children: viewDelivery.quantityTonnes ? Number(viewDelivery.quantityTonnes).toFixed(2) + "t" : "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Buyer" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0" }, children: viewDelivery.buyerName })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Buyer RTFO Ref" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0", fontFamily: "monospace" }, children: viewDelivery.buyerRtfoRef || "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Crop Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0" }, children: viewDelivery.cropType })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Sustainability Scheme" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0" }, children: viewDelivery.sustainabilityScheme || "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "GHG Saving %" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0", color: viewDelivery.ghgSavingPercent ? "#16a34a" : void 0 }, children: viewDelivery.ghgSavingPercent ? viewDelivery.ghgSavingPercent + "%" : "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Certification Ref" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0", fontFamily: "monospace" }, children: viewDelivery.certificationRef || "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Sustainability Declaration Ref" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0", fontFamily: "monospace" }, children: viewDelivery.sustainabilityDeclarationRef || "—" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9fafb", borderRadius: 8, padding: "12px 14px", border: "1px solid #e5e7eb" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "0 0 10px", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }, children: "Stock Source" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Source Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0" }, children: viewDelivery.sourceType === "ex_field" ? "Ex-Field (direct from harvest)" : "From Store" })
            ] }),
            viewDelivery.storageLocationName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Storage Location" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0" }, children: viewDelivery.storageLocationName })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9fafb", borderRadius: 8, padding: "12px 14px", border: "1px solid #e5e7eb" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "0 0 10px", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }, children: "Transport & Haulage" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Transported By" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0" }, children: viewDelivery.transportType === "own" ? "Own vehicle" : viewDelivery.transportType === "buyer" ? "Buyer's vehicle" : viewDelivery.transportType === "contractor" ? "3rd party contractor" : "—" })
            ] }),
            viewDelivery.haulierName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Haulier Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0" }, children: viewDelivery.haulierName })
            ] }),
            viewDelivery.haulierContact && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Haulier Contact" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0" }, children: viewDelivery.haulierContact })
            ] }),
            viewDelivery.vehicleRegistration && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Vehicle Registration" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0", fontFamily: "monospace", textTransform: "uppercase" }, children: viewDelivery.vehicleRegistration })
            ] }),
            viewDelivery.deliveryNoteRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Delivery Note / Weighbridge Ref" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0", fontFamily: "monospace" }, children: viewDelivery.deliveryNoteRef })
            ] })
          ] })
        ] }),
        viewDelivery.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#6b7280", fontSize: 12 }, children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0" }, children: viewDelivery.notes })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => {
          setViewDelivery(null);
          setEditingDelivery(viewDelivery);
          setDeliveryDialog(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { size: 13, className: "mr-1" }),
          "Edit"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewDelivery(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      CertificationDialog,
      {
        open: certDialog,
        onClose: () => {
          setCertDialog(false);
          setEditingCert(null);
        },
        initial: editingCert,
        onSave: (data) => certMut.mutate(data),
        saving: certMut.isPending
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      FieldDeclarationDialog,
      {
        open: fieldDialog,
        onClose: () => {
          setFieldDialog(false);
          setEditingField(null);
        },
        initial: editingField,
        onSave: (data) => fieldMut.mutate(data),
        saving: fieldMut.isPending,
        farmFieldNames,
        declaredByOptions
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DeliveryDialog,
      {
        open: deliveryDialog,
        onClose: () => {
          setDeliveryDialog(false);
          setEditingDelivery(null);
        },
        initial: editingDelivery,
        buyers,
        storageLocations,
        eligibleFieldNames,
        onSave: (data) => deliveryMut.mutate(data),
        saving: deliveryMut.isPending
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      BuyerDialog,
      {
        open: buyerDialog,
        onClose: () => {
          setBuyerDialog(false);
          setEditingBuyer(null);
        },
        initial: editingBuyer,
        onSave: (data) => buyerMut.mutate(data),
        saving: buyerMut.isPending
      }
    )
  ] });
}
function CertificationDialog({ open, onClose, initial, onSave, saving }) {
  const biofuelSchemes = useLookupStrings("biofuel_cert_schemes", ["ISCC EU", "ISCC UK", "Bonsucro", "RTRS", "REDcert", "RSB", "Other"]);
  const [form, setForm] = reactExports.useState({});
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const val = (k) => form[k] ?? initial?.[k] ?? "";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => !v && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 560 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: initial ? "Edit Certification" : "Add Certification" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 14 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certification Scheme *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          OtherSelect,
          {
            options: biofuelSchemes,
            value: val("scheme"),
            onValueChange: (v) => set("scheme", v),
            placeholder: "Select scheme",
            specifyPlaceholder: "Specify certification scheme…"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certification Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: val("certificationNumber"), onChange: (e) => set("certificationNumber", e.target.value), placeholder: "e.g. ISCC-UK-1234567" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Issuing Body" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: val("issuingBody"), onChange: (e) => set("issuingBody", e.target.value), placeholder: "e.g. ISCC System GmbH" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Issue Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: val("issueDate")?.split("T")[0] ?? "", onChange: (e) => set("issueDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expiry Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: val("expiryDate")?.split("T")[0] ?? "", onChange: (e) => set("expiryDate", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "RTFO Operator Number" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: val("rtfoOperatorNumber"), onChange: (e) => set("rtfoOperatorNumber", e.target.value), placeholder: "Your DfT RTFO operator number" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certification Scope" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: val("scope"), onChange: (e) => set("scope", e.target.value), placeholder: "e.g. Wheat, OSR for bioethanol/biodiesel" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: val("status") || "active", onValueChange: (v) => set("status", v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "active", children: "Active" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "expired", children: "Expired" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "suspended", children: "Suspended" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: val("notes"), onChange: (e) => set("notes", e.target.value), rows: 2 })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => onSave(form), disabled: saving, children: saving ? "Saving..." : "Save" })
    ] })
  ] }) });
}
function FieldDeclarationDialog({ open, onClose, initial, onSave, saving, farmFieldNames = [], declaredByOptions = [] }) {
  const [form, setForm] = reactExports.useState({});
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const val = (k) => form[k] ?? initial?.[k] ?? "";
  const bval = (k) => {
    const v = form[k] ?? initial?.[k];
    return v === true;
  };
  const INELIGIBLE_LAND_USES = ["forest", "peatland", "wetland"];
  const currentLandUse = val("landUseIn2008");
  const highCarbonRisk = bval("highCarbonStockRisk");
  const highBioRisk = bval("highBiodiversityRisk");
  const derivedIneligible = INELIGIBLE_LAND_USES.includes(currentLandUse) || highCarbonRisk || highBioRisk;
  reactExports.useEffect(() => {
    if (derivedIneligible) {
      setForm((f) => ({ ...f, eligibilityStatus: "not-eligible" }));
    }
  }, [derivedIneligible]);
  const currentFieldName = val("fieldName");
  const fieldNameInList = farmFieldNames.includes(currentFieldName);
  const fieldSelectValue = farmFieldNames.length === 0 ? "__none__" : fieldNameInList ? currentFieldName : currentFieldName ? "__other__" : "__none__";
  const currentDeclaredBy = val("declaredBy");
  const declaredByInList = declaredByOptions.includes(currentDeclaredBy);
  const declaredBySelectValue = declaredByOptions.length === 0 ? "__none__" : declaredByInList ? currentDeclaredBy : currentDeclaredBy ? "__other__" : "__none__";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => !v && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 580 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: initial ? "Edit Field Declaration" : "Add Field Declaration" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 14 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Field Name *" }),
        farmFieldNames.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: fieldSelectValue, onValueChange: (v) => {
            if (v === "__none__") set("fieldName", "");
            else if (v === "__other__") set("fieldName", "");
            else set("fieldName", v);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select field…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select field —" }),
              farmFieldNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: n, children: n }, n)),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__other__", children: "Other / type manually" })
            ] })
          ] }),
          (fieldSelectValue === "__other__" || !fieldNameInList && currentFieldName) && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: currentFieldName, onChange: (e) => set("fieldName", e.target.value), placeholder: "Type field name" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: currentFieldName, onChange: (e) => set("fieldName", e.target.value), placeholder: "e.g. Home Farm West, Twelve Acres" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Land Use in January 2008 *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: val("landUseIn2008"), onValueChange: (v) => set("landUseIn2008", v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select land use in 2008" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "arable", children: "Arable / Cropland" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "grassland", children: "Improved Grassland" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "rough-grazing", children: "Rough Grazing" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "forest", children: "Forest / Woodland" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "peatland", children: "Peatland / Bog" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "wetland", children: "Wetland" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "other", children: "Other" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: bval("convertedAfter2008"), onChange: (e) => set("convertedAfter2008", e.target.checked) }),
          "Converted after 2008?"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, color: bval("highCarbonStockRisk") ? "#dc2626" : "inherit" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: bval("highCarbonStockRisk"), onChange: (e) => set("highCarbonStockRisk", e.target.checked) }),
          "High Carbon Risk?"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, color: bval("highBiodiversityRisk") ? "#dc2626" : "inherit" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: bval("highBiodiversityRisk"), onChange: (e) => set("highBiodiversityRisk", e.target.checked) }),
          "Biodiversity Risk?"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Eligibility Status" }),
        derivedIneligible ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: 8, marginTop: 6, padding: "10px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { size: 15, style: { color: "#dc2626", flexShrink: 0, marginTop: 1 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: 0, fontSize: 14, fontWeight: 600, color: "#991b1b" }, children: "Not Eligible — auto-set" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: "2px 0 0", fontSize: 12, color: "#b91c1c" }, children: [
              "Reason:",
              " ",
              [
                highCarbonRisk && "high carbon stock risk",
                highBioRisk && "high biodiversity risk",
                INELIGIBLE_LAND_USES.includes(currentLandUse) && "disqualifying 2008 land use"
              ].filter(Boolean).join("; ")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "4px 0 0", fontSize: 11, color: "#9ca3af" }, children: "Remove the risk flags or change the 2008 land use to restore eligibility." })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: val("eligibilityStatus") || "eligible", onValueChange: (v) => set("eligibilityStatus", v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "eligible", children: "Eligible" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "requires-verification", children: "Requires Verification" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Declared By" }),
        declaredByOptions.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: declaredBySelectValue, onValueChange: (v) => {
            if (v === "__none__") set("declaredBy", "");
            else if (v === "__other__") set("declaredBy", "");
            else set("declaredBy", v);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select person…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select person —" }),
              declaredByOptions.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: n, children: n }, n)),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__other__", children: "Other / type manually" })
            ] })
          ] }),
          (declaredBySelectValue === "__other__" || !declaredByInList && currentDeclaredBy) && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: currentDeclaredBy, onChange: (e) => set("declaredBy", e.target.value), placeholder: "Type name of person making declaration" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: currentDeclaredBy, onChange: (e) => set("declaredBy", e.target.value), placeholder: "Name of person making declaration" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: val("notes"), onChange: (e) => set("notes", e.target.value), rows: 2 })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => onSave(form), disabled: saving, children: saving ? "Saving..." : "Save Declaration" })
    ] })
  ] }) });
}
function DeliveryDialog({ open, onClose, initial, buyers, storageLocations, eligibleFieldNames, onSave, saving }) {
  const [form, setForm] = reactExports.useState({});
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const val = (k) => form[k] ?? initial?.[k] ?? "";
  const selectedBuyerId = form.buyerId ?? initial?.buyerId;
  const sourceType = String(val("sourceType") || "store");
  const transportType = String(val("transportType") || "__none__");
  const handleBuyerSelect = (value) => {
    if (value === "__none__") {
      setForm((f) => ({ ...f, buyerId: void 0, buyerName: "", buyerRtfoRef: "" }));
      return;
    }
    const buyer = buyers.find((b) => b.id === parseInt(value, 10));
    if (buyer) {
      setForm((f) => ({
        ...f,
        buyerId: buyer.id,
        buyerName: buyer.companyName,
        buyerRtfoRef: buyer.rtfoObligationNumber ?? f.buyerRtfoRef ?? ""
      }));
    }
  };
  const sectionStyle = { background: "#f9fafb", borderRadius: 8, padding: "12px 14px", border: "1px solid #e5e7eb" };
  const sectionLabel = { margin: "0 0 10px", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => !v && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 600, maxHeight: "90vh", overflowY: "auto" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: initial ? "Edit Delivery Record" : "Add Delivery Record" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 14 }, children: [
      eligibleFieldNames.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 15, style: { color: "#d97706", flexShrink: 0, marginTop: 1 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: 0, fontSize: 13, color: "#92400e" }, children: "No eligible field declarations on file. Add field declarations (Field Declarations tab) before logging deliveries, or your RTFO audit trail will be incomplete." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: sectionStyle, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: sectionLabel, children: "Consignment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Delivery Date *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(val("deliveryDate") || "").split("T")[0], onChange: (e) => set("deliveryDate", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity (tonnes) *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: String(val("quantityTonnes") || ""), onChange: (e) => set("quantityTonnes", e.target.value), placeholder: "e.g. 250.5" })
            ] })
          ] }),
          buyers.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedBuyerId ? String(selectedBuyerId) : "__none__", onValueChange: handleBuyerSelect, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select a registered buyer…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— select buyer —" }),
                buyers.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(b.id), children: [
                  b.companyName,
                  b.rtfoObligationNumber ? ` (RTF ${b.rtfoObligationNumber})` : ""
                ] }, b.id))
              ] })
            ] }),
            selectedBuyerId && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: 12, color: "#6b7280", marginTop: 4 }, children: "Buyer name and RTFO number auto-filled from buyer record." })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(val("buyerName") || ""), onChange: (e) => set("buyerName", e.target.value), placeholder: "e.g. Vivergo Fuels, Ensus" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: 12, color: "#6b7280", marginTop: 4 }, children: 'Tip: Add buyers under "Registered Buyers" to select them from a dropdown here.' })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer RTF Obligation No." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(val("buyerRtfoRef") || ""), onChange: (e) => set("buyerRtfoRef", e.target.value), placeholder: "e.g. RTFO-2024-xxxx", readOnly: !!selectedBuyerId, style: selectedBuyerId ? { background: "#f9fafb", color: "#374151" } : {} })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Crop Type *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(val("cropType") || ""), onChange: (e) => set("cropType", e.target.value), placeholder: "e.g. Feed wheat, OSR" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sustainability Scheme" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(val("sustainabilityScheme") || ""), onChange: (e) => set("sustainabilityScheme", e.target.value), placeholder: "e.g. ISCC UK" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "GHG Saving %" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: String(val("ghgSavingPercent") || ""), onChange: (e) => set("ghgSavingPercent", e.target.value), placeholder: "e.g. 65" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certification Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(val("certificationRef") || ""), onChange: (e) => set("certificationRef", e.target.value), placeholder: "Your cert number for this delivery" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sustainability Declaration Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(val("sustainabilityDeclarationRef") || ""), onChange: (e) => set("sustainabilityDeclarationRef", e.target.value), placeholder: "e.g. SD-2024-001" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: sectionStyle, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: sectionLabel, children: "Stock Source" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "How did the crop leave your holding?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: sourceType, onValueChange: (v) => set("sourceType", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "store", children: "From store / grain facility" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ex_field", children: "Ex-field — direct from harvest" })
              ] })
            ] })
          ] }),
          sourceType === "ex_field" && eligibleFieldNames.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Source Field" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(val("sourceFieldName") || "__none__"), onValueChange: (v) => set("sourceFieldName", v === "__none__" ? void 0 : v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select eligible field…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— not specified —" }),
                eligibleFieldNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: n, children: n }, n))
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: 12, color: "#6b7280", marginTop: 4 }, children: "Only fields with an eligible biofuel declaration are shown." })
          ] }),
          sourceType === "store" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Storage Location" }),
            storageLocations.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: val("storageLocationId") ? String(val("storageLocationId")) : "__none__",
                onValueChange: (v) => set("storageLocationId", v === "__none__" ? void 0 : Number(v)),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select store…" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— not specified —" }),
                    storageLocations.map((loc) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(loc.id), children: [
                      loc.name,
                      loc.capacityTonnes ? ` (cap. ${Number(loc.capacityTonnes).toFixed(0)}t)` : ""
                    ] }, loc.id))
                  ] })
                ]
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: 12, color: "#6b7280", marginTop: 4 }, children: "No storage locations registered — add them in Fields & Crops → Storage to link here." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: 12, color: "#6b7280", marginTop: 4 }, children: "Selecting a store will automatically record a stock-out movement in that location's inventory." })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: 13, color: "#6b7280", background: "#dbeafe", borderRadius: 6, padding: "8px 12px" }, children: "Ex-field: crop goes direct from the combine harvester to the buyer's vehicle at the field gate. No stock deduction is made from any store." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: sectionStyle, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: sectionLabel, children: "Transport & Haulage" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Transported by" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: transportType, onValueChange: (v) => {
              set("transportType", v === "__none__" ? void 0 : v);
              if (v !== "contractor") {
                set("haulierName", void 0);
                set("haulierContact", void 0);
              }
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— not recorded —" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "own", children: "Own vehicle / farm transport" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "buyer", children: "Buyer's vehicle / buyer-arranged" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "contractor", children: "3rd party haulage contractor" })
              ] })
            ] })
          ] }),
          transportType === "contractor" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Haulier Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(val("haulierName") || ""), onChange: (e) => set("haulierName", e.target.value), placeholder: "e.g. Smith Haulage Ltd" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Haulier Contact / Phone" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(val("haulierContact") || ""), onChange: (e) => set("haulierContact", e.target.value), placeholder: "e.g. 07700 900123" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vehicle Registration" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(val("vehicleRegistration") || ""), onChange: (e) => set("vehicleRegistration", e.target.value.toUpperCase()), placeholder: "e.g. AB12 CDE", className: "uppercase" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Delivery Note / Weighbridge Ref" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(val("deliveryNoteRef") || ""), onChange: (e) => set("deliveryNoteRef", e.target.value), placeholder: "e.g. WB-2024-1042" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: String(val("notes") || ""), onChange: (e) => set("notes", e.target.value), rows: 2 })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => onSave({ ...form, sourceType }), disabled: saving, children: saving ? "Saving..." : "Save Delivery" })
    ] })
  ] }) });
}
function BuyerDialog({ open, onClose, initial, onSave, saving }) {
  const [form, setForm] = reactExports.useState({});
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const val = (k) => form[k] ?? initial?.[k] ?? "";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => !v && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 600 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: initial ? "Edit Buyer" : "Add RTFO Buyer" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 14 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9fafb", borderRadius: 8, padding: "12px 14px", border: "1px solid #e5e7eb" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "0 0 10px", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }, children: "Company Identity" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Company Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: val("companyName"), onChange: (e) => set("companyName", e.target.value), placeholder: "e.g. Vivergo Fuels Ltd" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Trading Name ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#9ca3af", fontWeight: 400 }, children: "(if different)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: val("tradingName"), onChange: (e) => set("tradingName", e.target.value), placeholder: "Optional" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "RTF Obligation Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: val("rtfoObligationNumber"), onChange: (e) => set("rtfoObligationNumber", e.target.value), placeholder: "DfT-assigned reference", className: "font-mono" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Buyer's ISCC Cert No. ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#9ca3af", fontWeight: 400 }, children: "(optional)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: val("isccCertNumber"), onChange: (e) => set("isccCertNumber", e.target.value), placeholder: "e.g. ISCC-UK-..." })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9fafb", borderRadius: 8, padding: "12px 14px", border: "1px solid #e5e7eb" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "0 0 10px", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }, children: "Contact" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Contact Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: val("contactName"), onChange: (e) => set("contactName", e.target.value), placeholder: "e.g. Jane Smith" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Phone" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: val("contactPhone"), onChange: (e) => set("contactPhone", e.target.value), placeholder: "e.g. 01234 567890" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: val("contactEmail"), onChange: (e) => set("contactEmail", e.target.value), placeholder: "e.g. sustainability@company.co.uk" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9fafb", borderRadius: 8, padding: "12px 14px", border: "1px solid #e5e7eb" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "0 0 10px", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }, children: "Address" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Address Line 1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: val("addressLine1"), onChange: (e) => set("addressLine1", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Address Line 2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: val("addressLine2"), onChange: (e) => set("addressLine2", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Town / City" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: val("town"), onChange: (e) => set("town", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "County" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: val("county"), onChange: (e) => set("county", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Postcode" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: val("postcode"), onChange: (e) => set("postcode", e.target.value), className: "uppercase" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: val("notes"), onChange: (e) => set("notes", e.target.value), rows: 2, placeholder: "Any additional notes about this buyer…" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => onSave(form), disabled: saving, children: saving ? "Saving..." : "Save Buyer" })
    ] })
  ] }) });
}
export {
  BiofuelPage as default
};
