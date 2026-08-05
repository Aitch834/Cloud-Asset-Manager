import { s as createLucideIcon, b as useAppStore, a as useToast, c as useQueryClient, r as reactExports, m as useQuery, S as useMutation, j as jsxRuntimeExports, R as Redirect, n as Card, o as CardContent, a$ as CardHeader, b0 as CardTitle, d as Button, T as Plus, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, I as Input, N as DialogMutationError, J as DialogFooter, C as Checkbox } from "./index-CdirZOd1.js";
import { A as AppLayout, s as AlertDialog, t as AlertDialogContent, v as AlertDialogHeader, w as AlertDialogTitle, x as AlertDialogDescription, y as AlertDialogFooter, z as AlertDialogCancel, D as AlertDialogAction } from "./AppLayout-BYtQ8m3g.js";
import { B as Badge } from "./badge-CGhXlzsr.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BJ5Ent_f.js";
import { S as ShieldCheck } from "./shield-check-DtcVMmdO.js";
import { U as UserCheck } from "./user-check-Cu7Fa6ca.js";
import { E as Eye } from "./eye-XML_ptWu.js";
import { C as Copy } from "./copy-Dcra9Iir.js";
import { T as Trash2 } from "./trash-2-z6Xcf3lD.js";
import { a as Clock, C as CircleAlert } from "./database-BYZvKxkF.js";
import { A as Activity } from "./activity-BE2MZmi3.js";
import { C as CircleX } from "./circle-x-BrdvxCob.js";
import { C as CircleCheck } from "./circle-check-Ckaymn3D.js";
import "./use-safe-clerk-GosXKq3X.js";
import "./shield-alert-ZRfYfiFT.js";
import "./triangle-alert-CUfGy1ZD.js";
import "./tractor-EgAMV7wt.js";
import "./index-mw0PPnci.js";
import "./index-DRht-o5x.js";
import "./chevron-up-DF39Syyc.js";
const __iconNode = [
  ["path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71", key: "1cjeqo" }],
  ["path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71", key: "19qd67" }]
];
const Link = createLucideIcon("link", __iconNode);
const ALL_MODULES = [
  { key: "spray_records", label: "Spray & Input Applications" },
  { key: "fields_crops", label: "Fields & Crops" },
  { key: "soil_tests", label: "Soil Tests" },
  { key: "harvest", label: "Harvest Records" },
  { key: "equipment", label: "Equipment & Calibration" },
  { key: "workshop", label: "Workshop — Job Cards, PAT Testing & Fire Safety" },
  { key: "livestock", label: "Livestock Records" },
  { key: "medicines", label: "Medicine Records" },
  { key: "movements", label: "Livestock Movements" },
  { key: "biosecurity", label: "Biosecurity & Visitors" },
  { key: "staff_training", label: "Staff Training & Certificates" },
  { key: "inspections", label: "Inspections & Non-Conformances" },
  { key: "nvz", label: "NVZ Records" },
  { key: "risk_assessments", label: "Risk Assessments & COSHH" },
  { key: "environmental", label: "Environmental Records" },
  { key: "pig-production", label: "Pig Production" },
  { key: "poultry-production", label: "Poultry Production" },
  { key: "fresh-produce", label: "Fresh Produce" },
  { key: "carbon-sustainability", label: "Carbon & Sustainability" },
  { key: "farm-diversification", label: "Farm Diversification" },
  { key: "water-irrigation", label: "Water & Irrigation Management" }
];
const ADVISOR_ROLES = [
  { value: "agronomist", label: "Agronomist" },
  { value: "facts_adviser", label: "FACTS Adviser" },
  { value: "basis_consultant", label: "BASIS Consultant" },
  { value: "vet", label: "Veterinary Surgeon" },
  { value: "farm_consultant", label: "Farm Consultant" },
  { value: "accountant", label: "Accountant" },
  { value: "bank_manager", label: "Bank / Land Agent" },
  { value: "other", label: "Other" }
];
const INSPECTION_PURPOSES = [
  { value: "red_tractor_inspection", label: "Red Tractor Inspection" },
  { value: "brcgs_audit", label: "BRCGS / Food Safety Audit" },
  { value: "environmental_audit", label: "Environmental Audit" },
  { value: "vet_visit", label: "Vet / APHA Visit" },
  { value: "bank_review", label: "Bank / Finance Review" },
  { value: "due_diligence", label: "Due Diligence" },
  { value: "other", label: "Other" }
];
function ModuleCheckboxes({ selected, onChange }) {
  const toggle = (key) => {
    if (selected.includes(key)) onChange(selected.filter((k) => k !== key));
    else onChange([...selected, key]);
  };
  const selectAll = () => onChange(ALL_MODULES.map((m) => m.key));
  const clearAll = () => onChange([]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-foreground", children: "Modules to share" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: selectAll, className: "text-xs text-primary underline", children: "Select all" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: clearAll, className: "text-xs text-muted-foreground underline", children: "Clear" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: ALL_MODULES.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 cursor-pointer select-none", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Checkbox,
        {
          checked: selected.includes(m.key),
          onCheckedChange: () => toggle(m.key)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-foreground/80", children: m.label })
    ] }, m.key)) })
  ] });
}
function buildInspectUrl(token) {
  return `${window.location.origin}/dashboard/inspect/${token}`;
}
function copyLink(token, toast) {
  navigator.clipboard.writeText(buildInspectUrl(token)).then(() => {
    toast({ title: "Link copied", description: "Paste it into an email to share access." });
  });
}
function daysUntil(dateStr) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 864e5);
}
function ExpiryBadge({ expiresAt, revokedAt }) {
  if (revokedAt) return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "bg-red-50 text-red-700 border-red-200", children: "Revoked" });
  const days = daysUntil(expiresAt);
  if (days < 0) return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "bg-red-50 text-red-700 border-red-200", children: "Expired" });
  if (days <= 7) return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "bg-amber-50 text-amber-700 border-amber-200", children: [
    "Expires in ",
    days,
    "d"
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "bg-green-50 text-green-700 border-green-200", children: [
    "Expires ",
    new Date(expiresAt).toLocaleDateString("en-GB")
  ] });
}
function AdvisorStatusBadge({ status }) {
  if (status === "revoked") return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "bg-red-50 text-red-700 border-red-200 gap-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-3 h-3" }),
    "Revoked"
  ] });
  if (status === "active") return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "bg-green-50 text-green-700 border-green-200 gap-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3" }),
    "Active"
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "bg-amber-50 text-amber-700 border-amber-200 gap-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-3 h-3" }),
    "Pending"
  ] });
}
function AdvisorsAccessPage() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showAdvisorDialog, setShowAdvisorDialog] = reactExports.useState(false);
  const [showSessionDialog, setShowSessionDialog] = reactExports.useState(false);
  const [revokeTarget, setRevokeTarget] = reactExports.useState(null);
  const [advisorForm, setAdvisorForm] = reactExports.useState({
    advisorName: "",
    advisorEmail: "",
    advisorRole: "",
    notes: "",
    moduleAccess: []
  });
  const [sessionForm, setSessionForm] = reactExports.useState({
    accessorName: "",
    accessorEmail: "",
    accessorOrganisation: "",
    purpose: "",
    expiresAt: "",
    moduleAccess: []
  });
  const { data: advisorsData } = useQuery({
    queryKey: ["advisors", farmId],
    queryFn: async () => {
      const r = await fetch(`/api/farms/${farmId}/advisors`);
      return r.json();
    },
    enabled: !!farmId
  });
  const { data: sessionsData } = useQuery({
    queryKey: ["inspection-sessions", farmId],
    queryFn: async () => {
      const r = await fetch(`/api/farms/${farmId}/inspection-sessions`);
      return r.json();
    },
    enabled: !!farmId
  });
  const { data: logData } = useQuery({
    queryKey: ["access-log", farmId],
    queryFn: async () => {
      const r = await fetch(`/api/farms/${farmId}/access-log`);
      return r.json();
    },
    enabled: !!farmId
  });
  const inviteAdvisor = useMutation({
    mutationFn: async (body) => {
      const r = await fetch(`/api/farms/${farmId}/advisors`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r2) => {
        if (!r2.ok) {
          const t = await r2.text().catch(() => "");
          throw new Error(t || `Request failed (${r2.status})`);
        }
        return r2;
      });
      return r.json();
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["advisors", farmId] });
      setShowAdvisorDialog(false);
      setAdvisorForm({ advisorName: "", advisorEmail: "", advisorRole: "", notes: "", moduleAccess: [] });
      if (data.record?.token) copyLink(data.record.token, toast);
      else toast({ title: "Advisor added" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const createSession = useMutation({
    mutationFn: async (body) => {
      const r = await fetch(`/api/farms/${farmId}/inspection-sessions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r2) => {
        if (!r2.ok) {
          const t = await r2.text().catch(() => "");
          throw new Error(t || `Request failed (${r2.status})`);
        }
        return r2;
      });
      return r.json();
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["inspection-sessions", farmId] });
      setShowSessionDialog(false);
      setSessionForm({ accessorName: "", accessorEmail: "", accessorOrganisation: "", purpose: "", expiresAt: "", moduleAccess: [] });
      if (data.record?.token) copyLink(data.record.token, toast);
      else toast({ title: "Session created" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const revokeAdvisor = useMutation({
    mutationFn: async (id) => fetch(`/api/farms/${farmId}/advisors/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["advisors", farmId] });
      toast({ title: "Advisor access revoked" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const revokeSession = useMutation({
    mutationFn: async (id) => fetch(`/api/farms/${farmId}/inspection-sessions/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inspection-sessions", farmId] });
      toast({ title: "Inspection session revoked" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  if (!farmId) return /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { to: "/select" });
  const advisors = advisorsData?.records ?? [];
  const sessions = sessionsData?.records ?? [];
  const log = logData?.records ?? [];
  const defaultExpiry = () => {
    const d = /* @__PURE__ */ new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { title: "Advisors & External Access", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl space-y-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-primary/20 bg-primary/[0.03]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5 flex gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-5 h-5 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm text-foreground", children: "Read-only external access" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1 leading-relaxed", children: "Share a secure link with advisors, vets, inspectors, or your assurance body. They see exactly the modules you choose — in read-only mode. No account required for inspection sessions. All access is logged." })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "w-4 h-4 text-primary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Advisor Accounts" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setShowAdvisorDialog(true), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
              " Add Advisor"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Permanent access links for agronomists, FACTS advisers, vets, and consultants. Active until you revoke them." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: advisors.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-10 text-muted-foreground text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "w-8 h-8 mx-auto mb-2 opacity-30" }),
          'No advisor accounts yet. Click "Add Advisor" to create one.'
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: advisors.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-3 rounded-lg border bg-white", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm", children: String(a.advisorName) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(AdvisorStatusBadge, { status: String(a.status) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs", children: ADVISOR_ROLES.find((r) => r.value === a.advisorRole)?.label ?? String(a.advisorRole) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: String(a.advisorEmail) }),
            !!a.lastAccessAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5 flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3 h-3" }),
              " Last accessed ",
              new Date(String(a.lastAccessAt)).toLocaleDateString("en-GB")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1 mt-2", children: a.moduleAccess.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-primary/[0.07] text-primary/80 px-1.5 py-0.5 rounded", children: ALL_MODULES.find((m) => m.key === k)?.label ?? k }, k)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 flex-shrink-0", children: a.status !== "revoked" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-8 w-8", onClick: () => copyLink(String(a.token), toast), title: "Copy access link", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "w-4 h-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-8 w-8 text-destructive", onClick: () => setRevokeTarget({ type: "advisor", id: Number(a.id) }), title: "Revoke access", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" }) })
          ] }) })
        ] }, String(a.id))) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4 text-primary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Inspection Sessions" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
              setSessionForm((f) => ({ ...f, expiresAt: defaultExpiry() }));
              setShowSessionDialog(true);
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
              " Create Session"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Time-limited access for Red Tractor CBs, one-off audits, or bank reviews. No account required — the link is the key." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: sessions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-10 text-muted-foreground text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-8 h-8 mx-auto mb-2 opacity-30" }),
          'No inspection sessions yet. Click "Create Session" to generate one.'
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: sessions.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-3 rounded-lg border bg-white", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm", children: String(s.accessorName) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ExpiryBadge, { expiresAt: String(s.expiresAt), revokedAt: s.revokedAt ? String(s.revokedAt) : null })
            ] }),
            !!s.accessorOrganisation && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: String(s.accessorOrganisation) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: INSPECTION_PURPOSES.find((p) => p.value === s.purpose)?.label ?? String(s.purpose) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mt-1", children: [
              Number(s.accessCount) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3 h-3" }),
                " Viewed ",
                Number(s.accessCount),
                " time",
                Number(s.accessCount) !== 1 ? "s" : ""
              ] }),
              !!s.lastAccessAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                "Last accessed ",
                new Date(String(s.lastAccessAt)).toLocaleDateString("en-GB")
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1 mt-2", children: s.moduleAccess.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-primary/[0.07] text-primary/80 px-1.5 py-0.5 rounded", children: ALL_MODULES.find((m) => m.key === k)?.label ?? k }, k)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 flex-shrink-0", children: !s.revokedAt && new Date(String(s.expiresAt)) > /* @__PURE__ */ new Date() && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-8 w-8", onClick: () => copyLink(String(s.token), toast), title: "Copy access link", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "w-4 h-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-8 w-8 text-destructive", onClick: () => setRevokeTarget({ type: "session", id: Number(s.id) }), title: "Revoke session", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" }) })
          ] }) })
        ] }, String(s.id))) }) })
      ] }),
      log.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "w-4 h-4 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Access Log" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Every time an external user views your farm data." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", children: log.slice(0, 50).map((entry) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-2 flex items-center justify-between text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: String(entry.accessorName) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground ml-2 text-xs", children: String(entry.sessionType) === "advisor" ? "Advisor" : "Inspection session" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: new Date(String(entry.accessedAt)).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" }) })
        ] }, String(entry.id))) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-4 h-4 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Inspector / Compliance Officer Mode" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Generate a filtered, read-only compliance pack link for Red Tractor inspectors, assurance body auditors, or bank compliance officers. The link shows only compliance-relevant modules for a specific date range." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(InspectorModeCard, { farmId, toast }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showAdvisorDialog, onOpenChange: (o) => {
      setShowAdvisorDialog(o);
      if (!o) inviteAdvisor.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "44rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "w-4 h-4" }),
        " Add Advisor Account"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Full name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: advisorForm.advisorName, onChange: (e) => setAdvisorForm((f) => ({ ...f, advisorName: e.target.value })), placeholder: "Jane Smith" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email address *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: advisorForm.advisorEmail, onChange: (e) => setAdvisorForm((f) => ({ ...f, advisorEmail: e.target.value })), placeholder: "jane@example.com" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Advisor role *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: ADVISOR_ROLES.filter((r) => r.value !== "other").some((r) => r.value === advisorForm.advisorRole) ? advisorForm.advisorRole : advisorForm.advisorRole ? "other" : "", onValueChange: (v) => setAdvisorForm((f) => ({ ...f, advisorRole: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select role…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ADVISOR_ROLES.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r.value, children: r.label }, r.value)) })
          ] }),
          (advisorForm.advisorRole === "other" || advisorForm.advisorRole && !ADVISOR_ROLES.filter((r) => r.value !== "other").some((r) => r.value === advisorForm.advisorRole)) && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1.5", value: advisorForm.advisorRole === "other" ? "" : advisorForm.advisorRole, onChange: (e) => setAdvisorForm((f) => ({ ...f, advisorRole: e.target.value || "other" })), placeholder: "Please specify role…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: advisorForm.notes, onChange: (e) => setAdvisorForm((f) => ({ ...f, notes: e.target.value })), placeholder: "e.g. Annual agronomist visit contract" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ModuleCheckboxes, { selected: advisorForm.moduleAccess, onChange: (v) => setAdvisorForm((f) => ({ ...f, moduleAccess: v })) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { className: "w-3.5 h-3.5 flex-shrink-0 mt-0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Once added, a secure link will be copied to your clipboard. Share it with the advisor by email. Access is permanent until you revoke it." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: inviteAdvisor, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShowAdvisorDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            disabled: !advisorForm.advisorName || !advisorForm.advisorEmail || !advisorForm.advisorRole || advisorForm.moduleAccess.length === 0 || inviteAdvisor.isPending,
            onClick: () => inviteAdvisor.mutate(advisorForm),
            children: "Add & Copy Link"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showSessionDialog, onOpenChange: (o) => {
      setShowSessionDialog(o);
      if (!o) createSession.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "44rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4" }),
        " Create Inspection Session"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Accessor name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: sessionForm.accessorName, onChange: (e) => setSessionForm((f) => ({ ...f, accessorName: e.target.value })), placeholder: "John Brown" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Organisation" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: sessionForm.accessorOrganisation, onChange: (e) => setSessionForm((f) => ({ ...f, accessorOrganisation: e.target.value })), placeholder: "e.g. NSF, ADAS" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Accessor email (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: sessionForm.accessorEmail, onChange: (e) => setSessionForm((f) => ({ ...f, accessorEmail: e.target.value })), placeholder: "john@certbody.com" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Purpose *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: INSPECTION_PURPOSES.filter((p) => p.value !== "other").some((p) => p.value === sessionForm.purpose) ? sessionForm.purpose : sessionForm.purpose ? "other" : "", onValueChange: (v) => setSessionForm((f) => ({ ...f, purpose: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select purpose…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: INSPECTION_PURPOSES.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p.value, children: p.label }, p.value)) })
          ] }),
          (sessionForm.purpose === "other" || sessionForm.purpose && !INSPECTION_PURPOSES.filter((p) => p.value !== "other").some((p) => p.value === sessionForm.purpose)) && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1.5", value: sessionForm.purpose === "other" ? "" : sessionForm.purpose, onChange: (e) => setSessionForm((f) => ({ ...f, purpose: e.target.value || "other" })), placeholder: "Please specify purpose…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Access expires on *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: sessionForm.expiresAt, onChange: (e) => setSessionForm((f) => ({ ...f, expiresAt: e.target.value })), min: (/* @__PURE__ */ new Date()).toISOString().split("T")[0] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Default is 30 days. For a Red Tractor inspection, 7–14 days is typical." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ModuleCheckboxes, { selected: sessionForm.moduleAccess, onChange: (v) => setSessionForm((f) => ({ ...f, moduleAccess: v })) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { className: "w-3.5 h-3.5 flex-shrink-0 mt-0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "The secure link will be copied to your clipboard. No account is needed — the link alone grants read-only access until the expiry date or until you revoke it." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: createSession, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShowSessionDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            disabled: !sessionForm.accessorName || !sessionForm.purpose || !sessionForm.expiresAt || sessionForm.moduleAccess.length === 0 || createSession.isPending,
            onClick: () => createSession.mutate(sessionForm),
            children: "Create & Copy Link"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!revokeTarget, onOpenChange: (o) => {
      if (!o) {
        setRevokeTarget(null);
        revokeAdvisor.reset();
        revokeSession.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Revoke access?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "This will immediately invalidate the access link. The advisor or inspector will no longer be able to view your farm data." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: revokeAdvisor, message: "Couldn't revoke access — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: revokeSession, message: "Couldn't revoke access — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          AlertDialogAction,
          {
            className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            onClick: () => {
              if (!revokeTarget) return;
              if (revokeTarget.type === "advisor") revokeAdvisor.mutate(revokeTarget.id);
              else revokeSession.mutate(revokeTarget.id);
              setRevokeTarget(null);
            },
            children: "Revoke Access"
          }
        )
      ] })
    ] }) })
  ] });
}
const INSPECTOR_MODULES = [
  "sprays-inputs",
  "field-crop-management",
  "livestock-management",
  "medicines",
  "movements",
  "biosecurity",
  "inspections",
  "risk-waste",
  "training",
  "documents"
];
const INSPECTOR_PURPOSES = [
  { value: "red-tractor-audit", label: "Red Tractor / RSPCA Assured Audit" },
  { value: "bank-compliance", label: "Bank / Finance Compliance Review" },
  { value: "environmental-regulator", label: "Environment Agency / NRW Inspector" },
  { value: "apha-visit", label: "APHA / Trading Standards Visit" },
  { value: "nhbc-survey", label: "Soil Association Organic Inspection" },
  { value: "other-inspector", label: "Other Inspector / Auditor" }
];
function InspectorModeCard({ farmId, toast }) {
  const qc = useQueryClient();
  const defaultExpiry = () => {
    const d = /* @__PURE__ */ new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split("T")[0];
  };
  const [form, setForm] = reactExports.useState({
    accessorName: "",
    accessorEmail: "",
    accessorOrganisation: "",
    purpose: "red-tractor-audit",
    expiresAt: defaultExpiry(),
    inspectorReference: "",
    moduleAccess: INSPECTOR_MODULES
  });
  const [created, setCreated] = reactExports.useState(null);
  const createMut = useMutation({
    mutationFn: async (body) => {
      const r = await fetch(`/api/farms/${farmId}/inspection-sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }).then(async (r2) => {
        if (!r2.ok) {
          const t = await r2.text().catch(() => "");
          throw new Error(t || `Request failed (${r2.status})`);
        }
        return r2;
      });
      return r.json();
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["inspection-sessions", farmId] });
      if (data.record?.token) {
        setCreated({ token: data.record.token });
      } else {
        toast({ title: "Inspector session created" });
      }
    },
    onError: () => toast({ title: "Failed to create session", variant: "destructive" })
  });
  const inspectorLink = created ? buildInspectUrl(created.token) : null;
  if (created && inspectorLink) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-4 h-4 text-green-700 flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-green-800", children: "Inspector access link created" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-700 mt-0.5", children: [
            "Share this link with the inspector. It gives read-only compliance access until ",
            new Date(form.expiresAt).toLocaleDateString("en-GB"),
            "."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: inspectorLink, readOnly: true, className: "font-mono text-xs flex-1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          navigator.clipboard.writeText(inspectorLink);
          toast({ title: "Link copied" });
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "w-4 h-4 mr-1" }),
          " Copy"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => {
        setCreated(null);
        setForm((f) => ({ ...f, accessorName: "", accessorEmail: "", accessorOrganisation: "", inspectorReference: "", expiresAt: defaultExpiry() }));
      }, children: "Create Another" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Inspector / Auditor Name *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.accessorName, onChange: (e) => setForm((f) => ({ ...f, accessorName: e.target.value })), placeholder: "Jane Smith" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Organisation" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.accessorOrganisation, onChange: (e) => setForm((f) => ({ ...f, accessorOrganisation: e.target.value })), placeholder: "Red Tractor Assurance" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Inspection Purpose *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: INSPECTOR_PURPOSES.filter((p) => p.value !== "other-inspector").some((p) => p.value === form.purpose) ? form.purpose : form.purpose ? "other-inspector" : "", onValueChange: (v) => setForm((f) => ({ ...f, purpose: v })), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: INSPECTOR_PURPOSES.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p.value, children: p.label }, p.value)) })
        ] }),
        (form.purpose === "other-inspector" || form.purpose && !INSPECTOR_PURPOSES.filter((p) => p.value !== "other-inspector").some((p) => p.value === form.purpose)) && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1.5", value: form.purpose === "other-inspector" ? "" : form.purpose, onChange: (e) => setForm((f) => ({ ...f, purpose: e.target.value || "other-inspector" })), placeholder: "Please specify inspection type…" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Inspector Reference / Visit Code" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.inspectorReference, onChange: (e) => setForm((f) => ({ ...f, inspectorReference: e.target.value })), placeholder: "e.g. RT-2024-1234" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email (optional)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: form.accessorEmail, onChange: (e) => setForm((f) => ({ ...f, accessorEmail: e.target.value })), placeholder: "inspector@redtractor.org.uk" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link Expires" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.expiresAt, onChange: (e) => setForm((f) => ({ ...f, expiresAt: e.target.value })) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 border rounded-lg bg-muted/40 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground mb-1", children: "Modules included in compliance view:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Spray Records, Livestock Movements, Medicines, NVZ Applications, Training, Documents, Inspections, Risk Assessments, Biosecurity, Field & Crop Records" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs opacity-70", children: "All access is logged. The inspector sees data in read-only mode — no editing or deletion is possible." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        onClick: () => createMut.mutate(form),
        disabled: !form.accessorName || !form.purpose || !form.expiresAt || createMut.isPending,
        className: "w-full",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-4 h-4 mr-2" }),
          createMut.isPending ? "Creating…" : "Generate Inspector Access Link"
        ]
      }
    )
  ] });
}
export {
  AdvisorsAccessPage as default
};
