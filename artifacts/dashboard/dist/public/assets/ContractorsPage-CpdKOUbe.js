import { b as useAppStore, c as useQueryClient, a as useToast, j as jsxRuntimeExports, R as Redirect, m as useQuery, r as reactExports, S as useMutation, d as Button, T as Plus, I as Input, e as LoaderCircle, n as Card, o as CardContent, M as MapPin, l as cn, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, H as DialogDescription, B as Building2, L as Label, N as DialogMutationError, J as DialogFooter } from "./index-4wIcluQc.js";
import { A as AppLayout, U as Users, C as CalendarDays, c as ClipboardList, M as CheckCheck } from "./AppLayout-DD_uqc9q.js";
import { T as Textarea } from "./textarea-T7FfHphM.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-DzDF-2Py.js";
import { u as useUpload } from "./use-upload-3ZqC7pFx.js";
import { p as printProReport } from "./print-report-ClU8-1P0.js";
import { a as useRawFarmName } from "./use-farm-name-C18kuk3-.js";
import { P as Printer } from "./printer-DJ6mK7iu.js";
import { T as TriangleAlert } from "./triangle-alert-DEYK9HKP.js";
import { S as ShieldCheck } from "./shield-check-DJpoGC73.js";
import { L as Link2 } from "./link-2-D3_CZozT.js";
import { C as CircleX } from "./circle-x-DB1UJTpW.js";
import { C as CircleCheck } from "./circle-check-D-GcN7GQ.js";
import { P as Pencil } from "./pencil-rbaSqCvR.js";
import { T as Trash2, C as ChevronDown } from "./trash-2-C_y_XhGu.js";
import { C as ChevronUp } from "./chevron-up-DXbgD6YR.js";
import { F as FileText, C as ClipboardCheck } from "./shield-alert-NerF-xDF.js";
import { P as Phone } from "./phone-BrMhnOXQ.js";
import { M as Mail } from "./mail-CH_bckhN.js";
import { U as UserPlus } from "./user-plus-BGYyjRp7.js";
import { a as Clock } from "./database-DiuTgWnj.js";
import { S as Send } from "./send-DamG8Xl1.js";
import { U as Upload } from "./upload-Buy5DkIJ.js";
import "./use-safe-clerk-BvAJD8DS.js";
import "./tractor-DWTCodeI.js";
import "./index-DwzJOOtg.js";
import "./index-DkKUu-YL.js";
const fmt = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const EMPTY_FORM = {
  companyName: "",
  tradeType: "general",
  address: null,
  contactName: null,
  phone: null,
  email: null,
  supplierId: null,
  pliNumber: null,
  pliInsurer: null,
  pliCoverAmountGbp: null,
  pliExpiryDate: null,
  pliDocumentUrl: null,
  pliDocumentName: null,
  firstOnSiteDate: null,
  lastOnSiteDate: null,
  notes: null,
  isActive: true
};
const EMPTY_CONTACT = { name: "", role: null, phone: null, email: null, isPrimary: false, notes: null };
const EMPTY_RAMS = { activityDescription: "", documentUrl: null, documentName: null, receivedDate: null, notes: null };
const TRADE_TYPES = {
  "general": "General Building / Maintenance",
  "electrical": "Electrical",
  "plumbing": "Plumbing / Heating",
  "roofing": "Roofing",
  "groundworks": "Groundworks / Drainage",
  "agri-contractor": "Agricultural Contractor",
  "machinery-dealer": "Machinery Dealer / Engineer",
  "haulier": "Haulage / Transport",
  "pest-control": "Pest Control",
  "tree-surgeon": "Tree Surgeon / Arborist",
  "cleaning": "Cleaning / Hygiene",
  "security": "Security / CCTV",
  "it-telecoms": "IT / Telecoms",
  "fuel-delivery": "Fuel / LPG Delivery",
  "waste-removal": "Waste Removal",
  "other": "Other"
};
function isPliExpiringSoon(d) {
  if (!d) return false;
  const diff = (new Date(d).getTime() - Date.now()) / 864e5;
  return diff >= 0 && diff <= 60;
}
function isPliExpired(d) {
  return d ? new Date(d) < /* @__PURE__ */ new Date() : false;
}
function PliUploadWidget({ documentUrl, documentName, onChange }) {
  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: (r) => {
      const resp = r;
      const url = resp.publicUrl ?? resp.objectPath ?? "";
      const name = resp.filename ?? url.split("/").pop() ?? "Certificate";
      onChange(url, name);
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: cn(
      "flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 border-dashed cursor-pointer transition-colors text-sm",
      isUploading ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/40"
    ), children: [
      isUploading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-primary flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
          "Uploading… ",
          progress ?? 0,
          "%"
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4 text-muted-foreground flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: documentName ?? "Upload PLI certificate (PDF, JPG, PNG)" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*,application/pdf", className: "hidden", disabled: isUploading, onChange: (e) => {
        const f = e.target.files?.[0];
        if (f) uploadFile(f);
      } })
    ] }),
    documentUrl && documentName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-primary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3.5 w-3.5 flex-shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: documentUrl, target: "_blank", rel: "noreferrer", className: "underline underline-offset-2 truncate", children: documentName })
    ] })
  ] });
}
function RamsUploadWidget({ documentUrl, documentName, onChange }) {
  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: (r) => {
      const resp = r;
      const url = resp.publicUrl ?? resp.objectPath ?? "";
      const name = resp.filename ?? url.split("/").pop() ?? "RAMS Document";
      onChange(url, name);
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: cn(
      "flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed cursor-pointer transition-colors text-xs",
      isUploading ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/40"
    ), children: [
      isUploading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin text-primary flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
          "Uploading… ",
          progress ?? 0,
          "%"
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-3.5 w-3.5 text-muted-foreground flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: documentName ?? "Attach RAMS document (PDF, DOC, JPG)" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*,application/pdf,.doc,.docx", className: "hidden", disabled: isUploading, onChange: (e) => {
        const f = e.target.files?.[0];
        if (f) uploadFile(f);
      } })
    ] }),
    documentUrl && documentName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs text-primary pl-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3 w-3 flex-shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: documentUrl, target: "_blank", rel: "noreferrer", className: "underline underline-offset-2 truncate", children: documentName })
    ] })
  ] });
}
function ExpandedContractorSection({ contractor, farmId, targetRamsId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const base = `/api/farms/${farmId}/contractors/${contractor.id}`;
  const hasTargetRams = targetRamsId != null && contractor.rams.some((r) => r.id === targetRamsId);
  const [activeTab, setActiveTab] = reactExports.useState(hasTargetRams ? "rams" : "contacts");
  const [highlightRamsId, setHighlightRamsId] = reactExports.useState(null);
  const scrolledToRams = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (!hasTargetRams || scrolledToRams.current) return;
    scrolledToRams.current = true;
    setHighlightRamsId(targetRamsId);
    setTimeout(() => {
      document.getElementById(`rams-entry-${targetRamsId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 200);
    const t = setTimeout(() => setHighlightRamsId(null), 4e3);
    return () => clearTimeout(t);
  }, [hasTargetRams, targetRamsId]);
  const [showContactForm, setShowContactForm] = reactExports.useState(false);
  const [editingContact, setEditingContact] = reactExports.useState(null);
  const [contactForm, setContactForm] = reactExports.useState({ ...EMPTY_CONTACT });
  const setCF = (k, v) => setContactForm((f) => ({ ...f, [k]: v }));
  const addContactMut = useMutation({
    mutationFn: (b) => fetch(`${base}/contacts`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contractors-hs", farmId] });
      setShowContactForm(false);
      setContactForm({ ...EMPTY_CONTACT });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const updateContactMut = useMutation({
    mutationFn: (b) => fetch(`${base}/contacts/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contractors-hs", farmId] });
      setEditingContact(null);
      setShowContactForm(false);
      setContactForm({ ...EMPTY_CONTACT });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteContactMut = useMutation({
    mutationFn: (id) => fetch(`${base}/contacts/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contractors-hs", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const [showRamsForm, setShowRamsForm] = reactExports.useState(false);
  const [editingRams, setEditingRams] = reactExports.useState(null);
  const [ramsForm, setRamsForm] = reactExports.useState({ ...EMPTY_RAMS });
  const setRF = (k, v) => setRamsForm((f) => ({ ...f, [k]: v }));
  const [assignDialog, setAssignDialog] = reactExports.useState(null);
  const [assignMemberId, setAssignMemberId] = reactExports.useState("");
  const [assignDueDate, setAssignDueDate] = reactExports.useState("");
  const [assignNote, setAssignNote] = reactExports.useState("");
  const { data: membersData } = useQuery({
    queryKey: ["farm-members", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/members`).then((r) => r.json()),
    select: (d) => (d.members ?? d ?? []).filter((m) => m.isActive !== false)
  });
  const addRamsMut = useMutation({
    mutationFn: (b) => fetch(`${base}/rams`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contractors-hs", farmId] });
      setShowRamsForm(false);
      setRamsForm({ ...EMPTY_RAMS });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const updateRamsMut = useMutation({
    mutationFn: (b) => fetch(`${base}/rams/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contractors-hs", farmId] });
      setEditingRams(null);
      setShowRamsForm(false);
      setRamsForm({ ...EMPTY_RAMS });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteRamsMut = useMutation({
    mutationFn: (id) => fetch(`${base}/rams/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contractors-hs", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const markReviewedMut = useMutation({
    mutationFn: (ramsId) => fetch(`${base}/rams/${ramsId}/review`, { method: "PATCH" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contractors-hs", farmId] }),
    onError: () => toast({ title: "Update failed", variant: "destructive" })
  });
  const raiseTaskMut = useMutation({
    mutationFn: ({ ramsId, body }) => fetch(`${base}/rams/${ramsId}/review-task`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contractors-hs", farmId] });
      setAssignDialog(null);
      setAssignMemberId("");
      setAssignDueDate("");
      setAssignNote("");
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const { contacts, rams } = contractor;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border mt-0 px-5 pt-4 pb-5 bg-muted/20", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setActiveTab("contacts"), className: cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors", activeTab === "contacts" ? "bg-primary text-primary-foreground" : "text-foreground/60 hover:bg-muted"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3.5 w-3.5" }),
        "Contacts (",
        contacts.length,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setActiveTab("rams"), className: cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors", activeTab === "rams" ? "bg-primary text-primary-foreground" : "text-foreground/60 hover:bg-muted"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "h-3.5 w-3.5" }),
        "RAMS (",
        rams.length,
        ")"
      ] })
    ] }),
    activeTab === "contacts" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      contacts.length === 0 && !showContactForm && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground italic", children: "No contacts recorded yet." }),
      contacts.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 p-3 bg-white rounded-lg border border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 space-y-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-foreground", children: c.name }),
            c.isPrimary && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20", children: "Primary" }),
            c.role && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: c.role })
          ] }),
          c.phone && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3 w-3" }),
            c.phone
          ] }),
          c.email && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-3 w-3" }),
            c.email
          ] }),
          c.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground italic mt-1", children: c.notes })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 flex-shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 w-7 p-0", onClick: () => {
            setEditingContact(c);
            setContactForm({ name: c.name, role: c.role, phone: c.phone, email: c.email, isPrimary: c.isPrimary, notes: c.notes });
            setShowContactForm(true);
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 w-7 p-0 text-destructive hover:text-destructive", onClick: () => deleteContactMut.mutate(c.id), disabled: deleteContactMut.isPending, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" }) })
        ] })
      ] }, c.id)),
      showContactForm ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-white rounded-lg border border-primary/30 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-foreground/70", children: editingContact ? "Edit Contact" : "Add Contact" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Full Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: contactForm.name, onChange: (e) => setCF("name", e.target.value), placeholder: "e.g. Jane Smith", className: "h-8 text-sm" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Role / Position" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: contactForm.role ?? "", onChange: (e) => setCF("role", e.target.value || null), placeholder: "e.g. H&S Contact", className: "h-8 text-sm" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Phone" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "tel", value: contactForm.phone ?? "", onChange: (e) => setCF("phone", e.target.value || null), className: "h-8 text-sm" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: contactForm.email ?? "", onChange: (e) => setCF("email", e.target.value || null), className: "h-8 text-sm" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: `primary-${contractor.id}`, checked: contactForm.isPrimary, onChange: (e) => setCF("isPrimary", e.target.checked), className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `primary-${contractor.id}`, className: "text-xs font-normal", children: "Primary contact" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: contactForm.notes ?? "", onChange: (e) => setCF("notes", e.target.value || null), className: "h-8 text-sm" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 justify-end pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => {
            setShowContactForm(false);
            setEditingContact(null);
            setContactForm({ ...EMPTY_CONTACT });
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              disabled: !contactForm.name || addContactMut.isPending || updateContactMut.isPending,
              onClick: () => editingContact ? updateContactMut.mutate({ ...contactForm, id: editingContact.id }) : addContactMut.mutate(contactForm),
              children: [
                (addContactMut.isPending || updateContactMut.isPending) && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin mr-1" }),
                editingContact ? "Update" : "Add Contact"
              ]
            }
          )
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "h-8 text-xs gap-1.5", onClick: () => {
        setEditingContact(null);
        setContactForm({ ...EMPTY_CONTACT });
        setShowContactForm(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-3.5 w-3.5" }),
        "Add Contact"
      ] })
    ] }),
    activeTab === "rams" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      rams.length === 0 && !showRamsForm && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground italic", children: "No RAMS recorded yet. Add one for each activity this contractor performs on site." }),
      rams.map((r) => {
        const isReviewed = !!(r.reviewDate && r.reviewedBy);
        const hasPendingTask = !!(r.pendingReviewTaskId && r.pendingReviewTaskStaffName);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { id: `rams-entry-${r.id}`, className: cn("p-3 bg-white rounded-lg border space-y-2 transition-all", isReviewed ? "border-green-200" : hasPendingTask ? "border-amber-200" : "border-border", highlightRamsId === r.id && "ring-2 ring-indigo-300 bg-indigo-50"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-foreground leading-snug", children: r.activityDescription }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 flex-shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 w-7 p-0", onClick: () => {
                setEditingRams(r);
                setRamsForm({ activityDescription: r.activityDescription, documentUrl: r.documentUrl, documentName: r.documentName, receivedDate: r.receivedDate, notes: r.notes });
                setShowRamsForm(true);
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 w-7 p-0 text-destructive hover:text-destructive", onClick: () => deleteRamsMut.mutate(r.id), disabled: deleteRamsMut.isPending, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground", children: [
            r.receivedDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "h-3 w-3" }),
              "Received ",
              fmt(r.receivedDate)
            ] }),
            r.documentUrl && r.documentName && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: r.documentUrl, target: "_blank", rel: "noreferrer", className: "flex items-center gap-1 text-primary underline underline-offset-2 truncate max-w-[220px]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3 w-3 flex-shrink-0" }),
              r.documentName
            ] })
          ] }),
          isReviewed ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCheck, { className: "h-3.5 w-3.5" }),
              "Reviewed ",
              fmt(r.reviewDate),
              " by ",
              r.reviewedBy
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                variant: "ghost",
                className: "h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2",
                disabled: markReviewedMut.isPending,
                onClick: () => markReviewedMut.mutate(r.id),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardCheck, { className: "h-3 w-3" }),
                  "Re-review"
                ]
              }
            )
          ] }) : hasPendingTask ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3.5 w-3.5" }),
              "Review task assigned to ",
              r.pendingReviewTaskStaffName
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                className: "h-7 text-xs gap-1 px-2.5",
                disabled: markReviewedMut.isPending,
                onClick: () => markReviewedMut.mutate(r.id),
                children: [
                  markReviewedMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCheck, { className: "h-3 w-3" }),
                  "Mark as Reviewed"
                ]
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                className: "h-7 text-xs gap-1.5 px-2.5",
                disabled: markReviewedMut.isPending,
                onClick: () => markReviewedMut.mutate(r.id),
                children: [
                  markReviewedMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCheck, { className: "h-3 w-3" }),
                  "Mark as Reviewed"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                variant: "outline",
                className: "h-7 text-xs gap-1.5 px-2.5",
                onClick: () => {
                  setAssignDialog({ open: true, ramsId: r.id, activity: r.activityDescription });
                  setAssignMemberId("");
                  setAssignDueDate("");
                  setAssignNote("");
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-3 w-3" }),
                  "Assign for Review"
                ]
              }
            )
          ] }),
          r.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground italic", children: r.notes })
        ] }, r.id);
      }),
      showRamsForm ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-white rounded-lg border border-primary/30 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-foreground/70", children: editingRams ? "Edit RAMS" : "Add RAMS" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Activity / Task Description *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: ramsForm.activityDescription, onChange: (e) => setRF("activityDescription", e.target.value), placeholder: "e.g. Grain store construction", className: "h-8 text-sm" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Date Received" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: ramsForm.receivedDate ?? "", onChange: (e) => setRF("receivedDate", e.target.value || null), className: "h-8 text-sm" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1.5 block", children: "Document" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RamsUploadWidget, { documentUrl: ramsForm.documentUrl, documentName: ramsForm.documentName, onChange: (url, name) => setRamsForm((f) => ({ ...f, documentUrl: url, documentName: name })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: ramsForm.notes ?? "", onChange: (e) => setRF("notes", e.target.value || null), className: "h-8 text-sm" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 justify-end pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => {
            setShowRamsForm(false);
            setEditingRams(null);
            setRamsForm({ ...EMPTY_RAMS });
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              disabled: !ramsForm.activityDescription || addRamsMut.isPending || updateRamsMut.isPending,
              onClick: () => editingRams ? updateRamsMut.mutate({ ...ramsForm, id: editingRams.id }) : addRamsMut.mutate(ramsForm),
              children: [
                (addRamsMut.isPending || updateRamsMut.isPending) && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin mr-1" }),
                editingRams ? "Update RAMS" : "Add RAMS"
              ]
            }
          )
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "h-8 text-xs gap-1.5", onClick: () => {
        setEditingRams(null);
        setRamsForm({ ...EMPTY_RAMS });
        setShowRamsForm(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
        "Add RAMS"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!assignDialog?.open, onOpenChange: (o) => {
      if (!o) {
        setAssignDialog(null);
        raiseTaskMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardCheck, { className: "h-4 w-4 text-primary" }),
          "Assign RAMS for Review"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "text-xs", children: "A Task Board entry will be created for the reviewer, and they'll receive an SMS notification." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-muted/40 rounded-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground mb-0.5", children: "Activity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: assignDialog?.activity }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: contractor.companyName })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Assign to *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: assignMemberId, onValueChange: setAssignMemberId, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9 text-sm mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select team member…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: (membersData ?? []).map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(m.id), children: [
              m.firstName,
              " ",
              m.lastName
            ] }, m.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Due Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: assignDueDate, onChange: (e) => setAssignDueDate(e.target.value), className: "h-9 text-sm mt-1" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Note to reviewer (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: assignNote, onChange: (e) => setAssignNote(e.target.value), placeholder: "e.g. Please review before the contractor arrives on 15 May.", className: "text-sm mt-1 resize-none", rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: raiseTaskMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => setAssignDialog(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            className: "gap-1.5",
            disabled: !assignMemberId || raiseTaskMut.isPending,
            onClick: () => assignDialog && raiseTaskMut.mutate({ ramsId: assignDialog.ramsId, body: { assignedToMemberId: Number(assignMemberId), dueDate: assignDueDate || void 0, note: assignNote || void 0 } }),
            children: [
              raiseTaskMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-3.5 w-3.5" }),
              "Assign & Add to Task Board"
            ]
          }
        )
      ] })
    ] }) })
  ] });
}
function ContractorsPage() {
  const { farmId } = useAppStore();
  const rawFarmName = useRawFarmName(farmId ?? 0);
  const qc = useQueryClient();
  const { toast } = useToast();
  if (!farmId) return /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { href: "/select" });
  const base = `/api/farms/${farmId}/contractors`;
  const { data, isLoading } = useQuery({
    queryKey: ["contractors-hs", farmId],
    queryFn: () => fetch(`${base}?showInactive=false`).then((r) => r.json())
  });
  const [showInactive, setShowInactive] = reactExports.useState(false);
  const { data: allData } = useQuery({
    queryKey: ["contractors-hs-all", farmId],
    queryFn: () => fetch(`${base}?showInactive=true`).then((r) => r.json()),
    enabled: showInactive
  });
  const { data: suppliersData } = useQuery({
    queryKey: ["suppliers", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/suppliers`).then((r) => r.json())
  });
  const contractors = (showInactive ? allData?.contractors : data?.contractors) ?? [];
  const suppliers = suppliersData?.records ?? [];
  const [expandedId, setExpandedId] = reactExports.useState(null);
  const targetRamsId = (() => {
    const v = new URLSearchParams(window.location.search).get("ramsId");
    const n = v ? parseInt(v, 10) : NaN;
    return Number.isFinite(n) && n > 0 ? n : null;
  })();
  const expandedForRams = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (targetRamsId == null || expandedForRams.current || contractors.length === 0) return;
    const owner = contractors.find((c) => c.rams.some((r) => r.id === targetRamsId));
    if (!owner) return;
    expandedForRams.current = true;
    setExpandedId(owner.id);
  }, [targetRamsId, contractors]);
  const autoShowedInactiveForRams = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (targetRamsId == null || expandedForRams.current || autoShowedInactiveForRams.current) return;
    if (!data || showInactive) return;
    const foundInActive = (data.contractors ?? []).some((c) => c.rams.some((r) => r.id === targetRamsId));
    if (foundInActive) return;
    autoShowedInactiveForRams.current = true;
    setShowInactive(true);
    toast({ title: "Showing inactive contractors", description: "The contractor linked to this RAMS review is deactivated, so inactive contractors have been included." });
  }, [targetRamsId, data, showInactive, toast]);
  const notifiedRamsMissing = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (targetRamsId == null || expandedForRams.current || notifiedRamsMissing.current) return;
    if (!autoShowedInactiveForRams.current || !allData) return;
    const found = (allData.contractors ?? []).some((c) => c.rams.some((r) => r.id === targetRamsId));
    if (found) return;
    notifiedRamsMissing.current = true;
    toast({ title: "RAMS entry not found", description: "The RAMS record this task links to no longer exists — it may have been deleted.", variant: "destructive" });
  }, [targetRamsId, allData, toast]);
  const [showForm, setShowForm] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({ ...EMPTY_FORM });
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [search, setSearch] = reactExports.useState("");
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["contractors-hs", farmId] });
    qc.invalidateQueries({ queryKey: ["contractors-hs-all", farmId] });
  };
  const createMut = useMutation({
    mutationFn: (b) => fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: (d) => {
      invalidate();
      setShowForm(false);
      setForm({ ...EMPTY_FORM });
      if (d.contractor) setExpandedId(d.contractor.id);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const updateMut = useMutation({
    mutationFn: (b) => fetch(`${base}/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      invalidate();
      setShowForm(false);
      setEditing(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deactivateMut = useMutation({
    mutationFn: (id) => fetch(`${base}/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      invalidate();
      setDeleteId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openEdit(c) {
    setEditing(c);
    setForm({
      companyName: c.companyName,
      tradeType: c.tradeType,
      address: c.address,
      contactName: c.contactName,
      phone: c.phone,
      email: c.email,
      supplierId: c.supplierId,
      pliNumber: c.pliNumber,
      pliInsurer: c.pliInsurer,
      pliCoverAmountGbp: c.pliCoverAmountGbp,
      pliExpiryDate: c.pliExpiryDate,
      pliDocumentUrl: c.pliDocumentUrl,
      pliDocumentName: c.pliDocumentName,
      firstOnSiteDate: c.firstOnSiteDate,
      lastOnSiteDate: c.lastOnSiteDate,
      notes: c.notes,
      isActive: c.isActive
    });
    setShowForm(true);
  }
  const filtered = contractors.filter(
    (c) => !search || c.companyName.toLowerCase().includes(search.toLowerCase()) || (TRADE_TYPES[c.tradeType] ?? c.tradeType).toLowerCase().includes(search.toLowerCase())
  );
  function printReport() {
    const rows = filtered.map((c) => {
      const pliStatus = isPliExpired(c.pliExpiryDate) ? "EXPIRED" : isPliExpiringSoon(c.pliExpiryDate) ? "Expiring soon" : c.pliNumber ? "Current" : "Not recorded";
      const ramsStatus = c.rams.length > 0 ? `${c.rams.length} RAMS on file` : "None";
      return `<tr><td>${c.companyName}</td><td>${TRADE_TYPES[c.tradeType] ?? c.tradeType}</td><td>${c.address ?? "—"}</td><td>${c.contacts.map((x) => x.name).join(", ") || "—"}</td><td>${c.pliNumber ?? "—"}</td><td>${fmt(c.pliExpiryDate)} (${pliStatus})</td><td>${ramsStatus}</td><td>${fmt(c.firstOnSiteDate)}</td><td>${fmt(c.lastOnSiteDate)}</td></tr>`;
    }).join("");
    printProReport({
      title: "Contractor H&S File",
      subtitle: `${filtered.length} contractors on record`,
      farmName: rawFarmName,
      authority: "Red Tractor",
      tableHtml: `<table><thead><tr><th>Company</th><th>Trade</th><th>Address</th><th>Contacts</th><th>PLI No.</th><th>PLI Expiry</th><th>RAMS</th><th>First On-Site</th><th>Last On-Site</th></tr></thead><tbody>${rows}</tbody></table>`
    });
  }
  const pliIssues = contractors.filter((c) => c.isActive && (isPliExpired(c.pliExpiryDate) || isPliExpiringSoon(c.pliExpiryDate) || !c.pliNumber));
  const ramsIssues = contractors.filter((c) => c.isActive && c.rams.length === 0);
  new Set(contractors.map((c) => c.supplierId).filter(Boolean));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { title: "Contractors H&S File", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4 gap-4 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 max-w-2xl", children: "Public liability insurance, RAMS, and contact records for all contractors working on the farm. Required under Red Tractor and the Health & Safety at Work Act 1974." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: printReport, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-3.5 w-3.5 mr-1" }),
          "Print Register"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setEditing(null);
          setForm({ ...EMPTY_FORM });
          setShowForm(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
          "Add Contractor"
        ] })
      ] })
    ] }),
    (pliIssues.length > 0 || ramsIssues.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 flex items-start gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 flex-shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Action required:" }),
        pliIssues.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          " ",
          pliIssues.length,
          " contractor",
          pliIssues.length > 1 ? "s" : "",
          " with missing, expired, or expiring PLI."
        ] }),
        ramsIssues.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          " ",
          ramsIssues.length,
          " contractor",
          ramsIssues.length > 1 ? "s" : "",
          " without any RAMS on file."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center gap-4 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search by company or trade…", className: "max-w-xs" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm text-gray-600 cursor-pointer", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: showInactive, onChange: (e) => setShowInactive(e.target.checked), className: "h-4 w-4" }),
        "Show inactive contractors"
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-6 w-6 text-muted-foreground" }) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-16 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-10 w-10 mx-auto text-muted-foreground mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium text-gray-700 mb-1", children: [
        "No contractors",
        search ? " matching search" : " added yet"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Add contractors working on the farm to maintain your H&S file." })
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: filtered.map((c) => {
      const pliExpired = isPliExpired(c.pliExpiryDate);
      const pliSoon = !pliExpired && isPliExpiringSoon(c.pliExpiryDate);
      const expanded = expandedId === c.id;
      const linkedSupplier = suppliers.find((s) => s.id === c.supplierId);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("rounded-xl border bg-white overflow-hidden", !c.isActive && "opacity-60"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4 px-5 py-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-base text-foreground", children: c.companyName }),
              !c.isActive && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border", children: "Inactive" }),
              linkedSupplier && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { className: "h-2.5 w-2.5" }),
                "Trade Contact: ",
                linkedSupplier.name
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-2", children: TRADE_TYPES[c.tradeType] ?? c.tradeType }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground", children: [
              c.address && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3 flex-shrink-0" }),
                c.address
              ] }),
              c.contacts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3 w-3" }),
                c.contacts.length,
                " contact",
                c.contacts.length > 1 ? "s" : ""
              ] }),
              c.contacts.length === 0 && (c.contactName || c.phone) && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3 w-3" }),
                c.contactName ?? c.phone
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end gap-1.5 flex-shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-wrap justify-end", children: [
              pliExpired ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3 w-3" }),
                "PLI Expired"
              ] }) : pliSoon ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
                "PLI Expiring ",
                fmt(c.pliExpiryDate)
              ] }) : c.pliNumber ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }),
                "PLI Current"
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3 w-3" }),
                "PLI Not Recorded"
              ] }),
              c.rams.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }),
                c.rams.length,
                " RAMS"
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3 w-3" }),
                "No RAMS"
              ] })
            ] }),
            (c.firstOnSiteDate || c.lastOnSiteDate) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground text-right", children: [
              c.firstOnSiteDate && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                "First: ",
                fmt(c.firstOnSiteDate)
              ] }),
              c.firstOnSiteDate && c.lastOnSiteDate && " · ",
              c.lastOnSiteDate && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                "Last: ",
                fmt(c.lastOnSiteDate)
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 flex-shrink-0 ml-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-8 w-8 p-0", onClick: () => openEdit(c), title: "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-8 w-8 p-0 text-destructive hover:text-destructive", onClick: () => setDeleteId(c.id), title: "Deactivate", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-8 w-8 p-0 text-muted-foreground", onClick: () => setExpandedId(expanded ? null : c.id), title: expanded ? "Collapse" : "Contacts & RAMS", children: expanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4" }) })
          ] })
        ] }),
        c.pliDocumentName && c.pliDocumentUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 pb-3 -mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: c.pliDocumentUrl, target: "_blank", rel: "noreferrer", className: "inline-flex items-center gap-1.5 text-xs text-primary underline underline-offset-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3 w-3" }),
          c.pliDocumentName
        ] }) }),
        expanded && /* @__PURE__ */ jsxRuntimeExports.jsx(ExpandedContractorSection, { contractor: c, farmId, targetRamsId })
      ] }, c.id);
    }) }),
    showForm && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) {
        setShowForm(false);
        setEditing(null);
        createMut.reset();
        updateMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Contractor" : "Add Contractor to H&S File" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Fill in the company details and PLI below. Contacts and RAMS documents are managed from the contractor card after saving." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-2 pb-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Company Information" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Company Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.companyName, onChange: (e) => setF("companyName", e.target.value), placeholder: "e.g. Smith Electrical Services Ltd" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Trade Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: Object.keys(TRADE_TYPES).filter((k) => k !== "other").includes(form.tradeType) ? form.tradeType : form.tradeType ? "other" : "", onValueChange: (v) => setF("tradeType", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.entries(TRADE_TYPES).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: v }, k)) })
          ] }),
          (form.tradeType === "other" || form.tradeType && !Object.keys(TRADE_TYPES).includes(form.tradeType)) && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1.5", value: form.tradeType === "other" ? "" : form.tradeType, onChange: (e) => setF("tradeType", e.target.value || "other"), placeholder: "Please specify trade type…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "cActive", checked: form.isActive, onChange: (e) => setF("isActive", e.target.checked), className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cActive", className: "font-normal", children: "Active contractor" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.address ?? "", onChange: (e) => setF("address", e.target.value || null), rows: 2, placeholder: "Registered or operational address" })
        ] }),
        suppliers.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border-t pt-4 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { className: "h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Trade Contact Link" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link to existing Trade Contact (optional)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.supplierId ? String(form.supplierId) : "__none__", onValueChange: (v) => setF("supplierId", v === "__none__" ? null : parseInt(v)), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Not linked" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not linked" }),
                suppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(s.id), children: s.name }, s.id))
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Linking lets the Trade Contacts register show that a H&S file is held for this supplier." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border-t pt-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Public Liability Insurance" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Policy Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.pliNumber ?? "", onChange: (e) => setF("pliNumber", e.target.value || null), className: "font-mono", placeholder: "e.g. PLI-12345678" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Insurer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.pliInsurer ?? "", onChange: (e) => setF("pliInsurer", e.target.value || null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cover Amount (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: form.pliCoverAmountGbp ?? "", onChange: (e) => setF("pliCoverAmountGbp", e.target.value || null), placeholder: "e.g. 5000000" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expiry Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.pliExpiryDate ?? "", onChange: (e) => setF("pliExpiryDate", e.target.value || null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-1.5 block", children: "PLI Certificate" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            PliUploadWidget,
            {
              documentUrl: form.pliDocumentUrl,
              documentName: form.pliDocumentName,
              onChange: (url, name) => setForm((f) => ({ ...f, pliDocumentUrl: url, pliDocumentName: name }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border-t pt-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "On-Farm Activity" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "First On-Site Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.firstOnSiteDate ?? "", onChange: (e) => setF("firstOnSiteDate", e.target.value || null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Last On-Site Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.lastOnSiteDate ?? "", onChange: (e) => setF("lastOnSiteDate", e.target.value || null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: (e) => setF("notes", e.target.value || null), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: editing ? updateMut : createMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setShowForm(false);
          setEditing(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => editing ? updateMut.mutate({ ...form, id: editing.id }) : createMut.mutate(form), disabled: !form.companyName || createMut.isPending || updateMut.isPending, children: [
          (createMut.isPending || updateMut.isPending) && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-4 w-4 mr-1" }),
          editing ? "Update Contractor" : "Add Contractor"
        ] })
      ] })
    ] }) }),
    deleteId !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) {
        setDeleteId(null);
        deactivateMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Deactivate Contractor?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "The contractor will be marked as inactive and hidden from the active list. All H&S records, contacts, and RAMS are retained." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deactivateMut, message: "Couldn't deactivate — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deactivateMut.mutate(deleteId), disabled: deactivateMut.isPending, children: deactivateMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-4 w-4" }) : "Deactivate" })
      ] })
    ] }) })
  ] });
}
export {
  ContractorsPage as default
};
