import { b as useAppStore, c as useQueryClient, a as useToast, r as reactExports, m as useQuery, j as jsxRuntimeExports, d as Button, T as Plus, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, I as Input, S as useMutation } from "./index-SssA5mtq.js";
import { u as usePersistedTab } from "./use-persisted-tab-DW4ag1mS.js";
import { b as api } from "./api-Dhdsf4oM.js";
import { A as AppLayout, X as Bird, I as Info } from "./AppLayout-z4vlO8Mn.js";
import { T as Textarea } from "./textarea-bflUIEaw.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-6dhlsG3x.js";
import { B as Badge } from "./badge-B0E6S91K.js";
import { T as TriangleAlert, L as Leaf } from "./triangle-alert-BMFOvC2o.js";
import { a as Clock } from "./database-BSrZwwIC.js";
import { F as FileText } from "./shield-alert-RVT43Iez.js";
import { P as Printer } from "./printer-oFmjmgap.js";
import { C as CircleCheck } from "./circle-check-ZzUArrra.js";
import "./use-safe-clerk-BqXwrZKf.js";
import "./trash-2-B4GqgECm.js";
import "./shield-check-C9TcxGVx.js";
import "./tractor-BQszadta.js";
import "./index-DO0E5EPi.js";
import "./index-BpvZ74Dt.js";
import "./chevron-up-CNp919WB.js";
const STATUS_BADGE = {
  active: "bg-green-100 text-green-800",
  expired: "bg-red-100 text-red-800",
  suspended: "bg-amber-100 text-amber-800",
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800"
};
const CERT_TYPES = ["laying_hens", "broilers", "turkeys", "ducks", "geese", "mixed_poultry"];
const APPROVAL_STATUSES = ["certified_organic", "approved_non_organic", "conventional_derogation"];
function OrganicPoultryPage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [tab, setTab] = usePersistedTab({ page: "organic-poultry", farmId, validIds: ["certification", "access", "feed", "derogations"], defaultTab: "certification" });
  const [certOpen, setCertOpen] = reactExports.useState(false);
  const [editingCert, setEditingCert] = reactExports.useState(null);
  const [certForm, setCertForm] = reactExports.useState({ certificateType: "laying_hens", status: "active" });
  const [accessOpen, setAccessOpen] = reactExports.useState(false);
  const [editingAccess, setEditingAccess] = reactExports.useState(null);
  const [accessForm, setAccessForm] = reactExports.useState({
    recordDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    accessBlocked: false,
    complianceStatus: "compliant"
  });
  const [feedOpen, setFeedOpen] = reactExports.useState(false);
  const [editingFeed, setEditingFeed] = reactExports.useState(null);
  const [feedForm, setFeedForm] = reactExports.useState({
    deliveryDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    organicApprovalStatus: "certified_organic"
  });
  const [derogOpen, setDerogOpen] = reactExports.useState(false);
  const [editingDerog, setEditingDerog] = reactExports.useState(null);
  const [derogForm, setDerogForm] = reactExports.useState({ status: "pending" });
  const certQ = useQuery({
    queryKey: ["farms", farmId, "organic-poultry-certifications"],
    queryFn: () => api.get(`/farms/${farmId}/organic-poultry/certification`).then((r) => r.certifications ?? []),
    enabled: !!farmId
  });
  const accessQ = useQuery({
    queryKey: ["farms", farmId, "organic-poultry-access"],
    queryFn: () => api.get(`/farms/${farmId}/organic-poultry/access-records`).then((r) => r.records ?? []),
    enabled: !!farmId
  });
  const feedQ = useQuery({
    queryKey: ["farms", farmId, "organic-poultry-feed"],
    queryFn: () => api.get(`/farms/${farmId}/organic-poultry/feed-records`).then((r) => r.records ?? []),
    enabled: !!farmId
  });
  const derogQ = useQuery({
    queryKey: ["farms", farmId, "organic-poultry-derogations"],
    queryFn: () => api.get(`/farms/${farmId}/organic-poultry/derogations`).then((r) => r.derogations ?? []),
    enabled: !!farmId
  });
  function useCrudMutation(endpoint, id, invalidateKey, successMsg, closeDialog) {
    return useMutation({
      mutationFn: (body) => id ? api.put(`${endpoint}/${id}`, body) : api.post(endpoint, body),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: invalidateKey });
        toast({ title: successMsg });
        closeDialog();
      },
      onError: () => toast({ title: "Failed to save", variant: "destructive" })
    });
  }
  const certMut = useCrudMutation(
    `/farms/${farmId}/organic-poultry/certification`,
    editingCert?.id ?? null,
    ["farms", farmId, "organic-poultry-certifications"],
    editingCert ? "Certification updated" : "Certification saved",
    () => {
      setCertOpen(false);
      setEditingCert(null);
      setCertForm({ certificateType: "laying_hens", status: "active" });
    }
  );
  const accessMut = useCrudMutation(
    `/farms/${farmId}/organic-poultry/access-records`,
    editingAccess?.id ?? null,
    ["farms", farmId, "organic-poultry-access"],
    editingAccess ? "Access record updated" : "Access record saved",
    () => {
      setAccessOpen(false);
      setEditingAccess(null);
      setAccessForm({ recordDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), accessBlocked: false, complianceStatus: "compliant" });
    }
  );
  const feedMut = useCrudMutation(
    `/farms/${farmId}/organic-poultry/feed-records`,
    editingFeed?.id ?? null,
    ["farms", farmId, "organic-poultry-feed"],
    editingFeed ? "Feed record updated" : "Feed record saved",
    () => {
      setFeedOpen(false);
      setEditingFeed(null);
      setFeedForm({ deliveryDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), organicApprovalStatus: "certified_organic" });
    }
  );
  const derogMut = useCrudMutation(
    `/farms/${farmId}/organic-poultry/derogations`,
    editingDerog?.id ?? null,
    ["farms", farmId, "organic-poultry-derogations"],
    editingDerog ? "Derogation updated" : "Derogation submitted",
    () => {
      setDerogOpen(false);
      setEditingDerog(null);
      setDerogForm({ status: "pending" });
    }
  );
  const certs = certQ.data ?? [];
  const accesses = accessQ.data ?? [];
  const feeds = feedQ.data ?? [];
  const derogs = derogQ.data ?? [];
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const expiredCerts = certs.filter((c) => c.expiryDate && c.expiryDate < today);
  const pendingDerogs = derogs.filter((d) => d.status === "pending").length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { title: "Organic Poultry", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Organic Poultry" }),
      " — Records required under EU Regulation 2018/848 (UK equivalent) for organic poultry production: certification body records, outdoor access compliance, organic feed documentation, and derogation audit trail."
    ] }),
    expiredCerts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 text-red-700 mt-0.5 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-red-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
          expiredCerts.length,
          " certification",
          expiredCerts.length > 1 ? "s" : "",
          " expired"
        ] }),
        " — renewal required to maintain organic status."
      ] })
    ] }),
    pendingDerogs > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4 text-amber-700 mt-0.5 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-amber-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
          pendingDerogs,
          " derogation",
          pendingDerogs > 1 ? "s" : "",
          " pending"
        ] }),
        " — awaiting certifier decision."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-5 gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 flex-wrap", children: ["certification", "access", "feed", "derogations"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: tab === t ? "default" : "outline", onClick: () => setTab(t), children: t === "certification" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { className: "w-3.5 h-3.5 mr-1" }),
        "Certification"
      ] }) : t === "access" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bird, { className: "w-3.5 h-3.5 mr-1" }),
        "Outdoor Access"
      ] }) : t === "feed" ? "Organic Feed" : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-3.5 h-3.5 mr-1" }),
        "Derogations (",
        derogs.length,
        ")"
      ] }) }, t)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
        if (tab === "certification") {
          setEditingCert(null);
          setCertForm({ certificateType: "laying_hens", status: "active" });
          setCertOpen(true);
        } else if (tab === "access") {
          setEditingAccess(null);
          setAccessForm({ recordDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), accessBlocked: false, complianceStatus: "compliant" });
          setAccessOpen(true);
        } else if (tab === "feed") {
          setEditingFeed(null);
          setFeedForm({ deliveryDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), organicApprovalStatus: "certified_organic" });
          setFeedOpen(true);
        } else {
          setEditingDerog(null);
          setDerogForm({ status: "pending" });
          setDerogOpen(true);
        }
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
        tab === "certification" ? "Add Certification" : tab === "access" ? "Record Access" : tab === "feed" ? "Add Feed Record" : "Add Derogation"
      ] })
    ] }),
    tab === "certification" && /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: certs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-muted-foreground border rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { className: "mx-auto mb-2 w-10 h-10 opacity-30" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No organic poultry certifications recorded. Add your first certification." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: certs.map((c) => {
      const isExpired = c.expiryDate && c.expiryDate < today;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: `bg-white border rounded-lg p-4 cursor-pointer hover:shadow-sm transition-shadow ${isExpired ? "border-red-300" : ""}`,
          onClick: () => {
            setEditingCert(c);
            setCertForm({ ...c });
            setCertOpen(true);
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: c.certifyingBody }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `text-xs ${STATUS_BADGE[c.status] ?? "bg-gray-100 text-gray-600"}`, children: c.status }),
                isExpired && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-red-100 text-red-800 text-xs", children: "EXPIRED" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: (e) => {
                e.stopPropagation();
                window.print();
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground space-y-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "Type: ",
                c.certificateType.replace(/_/g, " ").replace(/\b\w/g, (x) => x.toUpperCase()),
                c.certificateNumber ? ` · No: ${c.certificateNumber}` : ""
              ] }),
              c.issueDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "Issued: ",
                c.issueDate,
                c.expiryDate ? ` · Expires: ` : "",
                c.expiryDate && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: isExpired ? "text-red-600 font-medium" : "text-green-700", children: c.expiryDate })
              ] }),
              c.scope && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "line-clamp-1", children: [
                "Scope: ",
                c.scope
              ] })
            ] })
          ]
        },
        c.id
      );
    }) }) }),
    tab === "access" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "UK Organic Poultry Standard:" }),
        " Birds must have continuous daytime access to outdoor range. Max stocking density: 2,500 birds/ha for meat birds; 170kg LW/ha for laying hens. Record access compliance regularly."
      ] }),
      accesses.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-muted-foreground border rounded-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bird, { className: "mx-auto mb-2 w-10 h-10 opacity-30" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No outdoor access records. Start logging daily or weekly access compliance." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: accesses.sort((a, b) => b.recordDate.localeCompare(a.recordDate)).map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: `bg-white border rounded-lg p-3 cursor-pointer hover:shadow-sm flex items-start justify-between gap-3 ${a.complianceStatus !== "compliant" ? "border-amber-300" : ""}`,
          onClick: () => {
            setEditingAccess(a);
            setAccessForm({ ...a });
            setAccessOpen(true);
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: a.recordDate }),
              a.flockRef && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: a.flockRef }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `text-xs ${a.complianceStatus === "compliant" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`, children: a.complianceStatus === "compliant" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3 mr-1 inline" }),
                "Compliant"
              ] }) : a.complianceStatus }),
              a.accessBlocked && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs bg-red-100 text-red-800", children: "Access blocked" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground space-x-3", children: [
              a.birdsInFlock && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Flock: ",
                a.birdsInFlock
              ] }),
              a.birdsAccessedRange && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "On range: ",
                a.birdsAccessedRange
              ] }),
              a.rangeAreaHa && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Range: ",
                a.rangeAreaHa,
                "ha"
              ] }),
              a.birdsPerHa && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                a.birdsPerHa,
                "/ha"
              ] }),
              a.accessDurationHours && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                a.accessDurationHours,
                "h access"
              ] }),
              a.accessBlocked && a.accessBlockReason && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-amber-700", children: [
                "Reason: ",
                a.accessBlockReason
              ] })
            ] })
          ] })
        },
        a.id
      )) })
    ] }),
    tab === "feed" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Organic Feed Requirement:" }),
        " 100% organically produced feed. Synthetic amino acids, growth promoters, and GMO ingredients are prohibited. Keep all delivery invoices and certificates of conformity."
      ] }),
      feeds.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-muted-foreground border rounded-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "mx-auto mb-2 w-10 h-10 opacity-30" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No organic feed records. Log each feed delivery with its organic certification status." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: feeds.sort((a, b) => b.deliveryDate.localeCompare(a.deliveryDate)).map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: `bg-white border rounded-lg p-3 cursor-pointer hover:shadow-sm ${f.organicApprovalStatus !== "certified_organic" ? "border-amber-300" : ""}`,
          onClick: () => {
            setEditingFeed(f);
            setFeedForm({ ...f });
            setFeedOpen(true);
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: f.deliveryDate }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: f.productName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `text-xs ${f.organicApprovalStatus === "certified_organic" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`, children: f.organicApprovalStatus.replace(/_/g, " ") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground space-x-3", children: [
              f.quantityKg && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                f.quantityKg,
                "kg"
              ] }),
              f.supplierName && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Supplier: ",
                f.supplierName
              ] }),
              f.certifierApprovalReference && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Cert ref: ",
                f.certifierApprovalReference
              ] }),
              f.flock && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Flock: ",
                f.flock
              ] })
            ] })
          ]
        },
        f.id
      )) })
    ] }),
    tab === "derogations" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Derogations" }),
        " are certifier-approved permissions to use specific non-organic inputs (e.g. conventional feed for young stock, specific medicines). Each derogation requires a written application and certifier approval before use."
      ] }),
      derogs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-muted-foreground border rounded-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "mx-auto mb-2 w-10 h-10 opacity-30" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No derogations recorded." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: derogs.sort((a, b) => (b.applicationDate ?? "").localeCompare(a.applicationDate ?? "")).map((d) => {
        const isExpired = d.expiryDate && d.expiryDate < today;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `bg-white border rounded-lg p-4 cursor-pointer hover:shadow-sm ${isExpired ? "border-red-300" : d.status === "pending" ? "border-amber-300" : ""}`,
            onClick: () => {
              setEditingDerog(d);
              setDerogForm({ ...d });
              setDerogOpen(true);
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2 flex-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: d.inputName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `text-xs ${STATUS_BADGE[d.status] ?? "bg-gray-100 text-gray-600"} capitalize`, children: d.status }),
                isExpired && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-red-100 text-red-800 text-xs", children: "EXPIRED" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground space-y-0.5", children: [
                d.certifyingBody && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                  "Certifier: ",
                  d.certifyingBody,
                  d.caseReference ? ` — Ref: ${d.caseReference}` : ""
                ] }),
                d.applicationDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                  "Applied: ",
                  d.applicationDate,
                  d.decisionDate ? ` · Decision: ${d.decisionDate}` : ""
                ] }),
                d.expiryDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: isExpired ? "text-red-600" : "text-green-700", children: [
                  "Expiry: ",
                  d.expiryDate
                ] }),
                d.justification && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "line-clamp-2", children: [
                  "Justification: ",
                  d.justification
                ] })
              ] })
            ]
          },
          d.id
        );
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: certOpen, onOpenChange: (o) => {
      setCertOpen(o);
      if (!o) {
        setEditingCert(null);
        setCertForm({ certificateType: "laying_hens", status: "active" });
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingCert ? "Edit Certification" : "Add Organic Poultry Certification" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        certMut.mutate(certForm);
      }, className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifying Body *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: certForm.certifyingBody ?? "", onChange: (e) => setCertForm((p) => ({ ...p, certifyingBody: e.target.value })), required: true, placeholder: "e.g. Soil Association, OF&G, Organic Farmers & Growers" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certificate Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: certForm.certificateNumber ?? "", onChange: (e) => setCertForm((p) => ({ ...p, certificateNumber: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certificate Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: certForm.certificateType ?? "laying_hens", onValueChange: (v) => setCertForm((p) => ({ ...p, certificateType: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CERT_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t.replace(/_/g, " ").replace(/\b\w/g, (x) => x.toUpperCase()) }, t)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Issue Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: certForm.issueDate ?? "", onChange: (e) => setCertForm((p) => ({ ...p, issueDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expiry Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: certForm.expiryDate ?? "", onChange: (e) => setCertForm((p) => ({ ...p, expiryDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: certForm.status ?? "active", onValueChange: (v) => setCertForm((p) => ({ ...p, status: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["active", "expired", "suspended"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s.charAt(0).toUpperCase() + s.slice(1) }, s)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Scope (livestock types / units covered)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: certForm.scope ?? "", onChange: (e) => setCertForm((p) => ({ ...p, scope: e.target.value })), placeholder: "e.g. Layer flocks, Houses A & B" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: certForm.notes ?? "", onChange: (e) => setCertForm((p) => ({ ...p, notes: e.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => setCertOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: certMut.isPending, children: certMut.isPending ? "Saving…" : "Save" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: accessOpen, onOpenChange: (o) => {
      setAccessOpen(o);
      if (!o) {
        setEditingAccess(null);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingAccess ? "Edit Access Record" : "Record Outdoor Access" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        accessMut.mutate({ ...accessForm, birdsInFlock: accessForm.birdsInFlock ? Number(accessForm.birdsInFlock) : null, birdsAccessedRange: accessForm.birdsAccessedRange ? Number(accessForm.birdsAccessedRange) : null, accessBlocked: Boolean(accessForm.accessBlocked) });
      }, className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: accessForm.recordDate ?? "", onChange: (e) => setAccessForm((p) => ({ ...p, recordDate: e.target.value })), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Flock / House Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: accessForm.flockRef ?? "", onChange: (e) => setAccessForm((p) => ({ ...p, flockRef: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Birds in Flock" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: accessForm.birdsInFlock ?? "", onChange: (e) => setAccessForm((p) => ({ ...p, birdsInFlock: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Birds on Range" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: accessForm.birdsAccessedRange ?? "", onChange: (e) => setAccessForm((p) => ({ ...p, birdsAccessedRange: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Range Area (ha)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", value: accessForm.rangeAreaHa ?? "", onChange: (e) => setAccessForm((p) => ({ ...p, rangeAreaHa: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Access Duration (hours)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.5", min: "0", value: accessForm.accessDurationHours ?? "", onChange: (e) => setAccessForm((p) => ({ ...p, accessDurationHours: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Compliance Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: accessForm.complianceStatus ?? "compliant", onValueChange: (v) => setAccessForm((p) => ({ ...p, complianceStatus: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "compliant", children: "Compliant" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "non_compliant", children: "Non-compliant" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "partially_compliant", children: "Partially compliant" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vegetation Condition" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: accessForm.vegetationCondition ?? "", onChange: (e) => setAccessForm((p) => ({ ...p, vegetationCondition: e.target.value })), placeholder: "Good / Poor / Bare" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "accessBlocked", checked: Boolean(accessForm.accessBlocked), onChange: (e) => setAccessForm((p) => ({ ...p, accessBlocked: e.target.checked })) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "accessBlocked", children: "Outdoor access blocked today (disease control, weather)" })
        ] }),
        accessForm.accessBlocked && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reason Access Blocked" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: accessForm.accessBlockReason ?? "", onChange: (e) => setAccessForm((p) => ({ ...p, accessBlockReason: e.target.value })), placeholder: "e.g. Avian influenza prevention zone" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: accessForm.notes ?? "", onChange: (e) => setAccessForm((p) => ({ ...p, notes: e.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => setAccessOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: accessMut.isPending, children: accessMut.isPending ? "Saving…" : "Save" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: feedOpen, onOpenChange: (o) => {
      setFeedOpen(o);
      if (!o) {
        setEditingFeed(null);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingFeed ? "Edit Feed Record" : "Add Organic Feed Delivery" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        feedMut.mutate({ ...feedForm, quantityKg: feedForm.quantityKg ? String(feedForm.quantityKg) : null });
      }, className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Delivery Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: feedForm.deliveryDate ?? "", onChange: (e) => setFeedForm((p) => ({ ...p, deliveryDate: e.target.value })), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: feedForm.productName ?? "", onChange: (e) => setFeedForm((p) => ({ ...p, productName: e.target.value })), required: true, placeholder: "e.g. Organic Layer Mash" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: feedForm.productType ?? "", onChange: (e) => setFeedForm((p) => ({ ...p, productType: e.target.value })), placeholder: "e.g. mash, pellets, grain" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Organic Approval Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: feedForm.organicApprovalStatus ?? "certified_organic", onValueChange: (v) => setFeedForm((p) => ({ ...p, organicApprovalStatus: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: APPROVAL_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s.replace(/_/g, " ") }, s)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity (kg)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", value: feedForm.quantityKg ?? "", onChange: (e) => setFeedForm((p) => ({ ...p, quantityKg: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: feedForm.supplierName ?? "", onChange: (e) => setFeedForm((p) => ({ ...p, supplierName: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lot / Batch Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: feedForm.supplierLotNumber ?? "", onChange: (e) => setFeedForm((p) => ({ ...p, supplierLotNumber: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Invoice Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: feedForm.invoiceReference ?? "", onChange: (e) => setFeedForm((p) => ({ ...p, invoiceReference: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifier Approval Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: feedForm.certifierApprovalReference ?? "", onChange: (e) => setFeedForm((p) => ({ ...p, certifierApprovalReference: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Flock / House" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: feedForm.flock ?? "", onChange: (e) => setFeedForm((p) => ({ ...p, flock: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: feedForm.notes ?? "", onChange: (e) => setFeedForm((p) => ({ ...p, notes: e.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => setFeedOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: feedMut.isPending, children: feedMut.isPending ? "Saving…" : "Save" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: derogOpen, onOpenChange: (o) => {
      setDerogOpen(o);
      if (!o) {
        setEditingDerog(null);
        setDerogForm({ status: "pending" });
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingDerog ? "Edit Derogation" : "Add Derogation" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        derogMut.mutate(derogForm);
      }, className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Input Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: derogForm.inputName ?? "", onChange: (e) => setDerogForm((p) => ({ ...p, inputName: e.target.value })), required: true, placeholder: "e.g. Conventional chick feed, Conventional litter" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Input Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: derogForm.inputType ?? "", onChange: (e) => setDerogForm((p) => ({ ...p, inputType: e.target.value })), placeholder: "feed / medicine / bedding" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Case Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: derogForm.caseReference ?? "", onChange: (e) => setDerogForm((p) => ({ ...p, caseReference: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifying Body" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: derogForm.certifyingBody ?? "", onChange: (e) => setDerogForm((p) => ({ ...p, certifyingBody: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: derogForm.status ?? "pending", onValueChange: (v) => setDerogForm((p) => ({ ...p, status: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["pending", "approved", "rejected"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s.charAt(0).toUpperCase() + s.slice(1) }, s)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Application Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: derogForm.applicationDate ?? "", onChange: (e) => setDerogForm((p) => ({ ...p, applicationDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Decision Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: derogForm.decisionDate ?? "", onChange: (e) => setDerogForm((p) => ({ ...p, decisionDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expiry Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: derogForm.expiryDate ?? "", onChange: (e) => setDerogForm((p) => ({ ...p, expiryDate: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Justification" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: derogForm.justification ?? "", onChange: (e) => setDerogForm((p) => ({ ...p, justification: e.target.value })), rows: 3 })
        ] }),
        derogForm.status === "approved" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Approval Conditions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: derogForm.approvalConditions ?? "", onChange: (e) => setDerogForm((p) => ({ ...p, approvalConditions: e.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: derogForm.notes ?? "", onChange: (e) => setDerogForm((p) => ({ ...p, notes: e.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => setDerogOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: derogMut.isPending, children: derogMut.isPending ? "Saving…" : "Save" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  OrganicPoultryPage as default
};
