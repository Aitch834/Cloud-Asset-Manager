import { b as useAppStore, a4 as useSearch, r as reactExports, j as jsxRuntimeExports, d as Button, a as useToast, c as useQueryClient, m as useQuery, O as useMutation, S as Plus, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, J as DialogFooter, L as Label, I as Input, X as DialogMutationError, e as LoaderCircle, Q as React } from "./index-Cgwa2fkn.js";
import { u as useLookupStrings } from "./use-lookup-BeOgW5Yx.js";
import { u as usePersistedTab } from "./use-persisted-tab-CcbPQ_kp.js";
import { A as AppLayout, c as ClipboardList } from "./AppLayout-D8J6skGX.js";
import { T as Textarea } from "./textarea-CIBmhqz8.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CNB9GZVO.js";
import { O as OtherSelect } from "./other-select-COzGu3YE.js";
import { B as Badge } from "./badge-CMY04Lmr.js";
import { T as TabBar, a as TabButton } from "./tab-button-CgtfvXN3.js";
import { R as RaiseTaskDialog } from "./RaiseTaskDialog-CSLGAPOY.js";
import { u as useFarmMembers } from "./use-farm-members-C-gtv1_n.js";
import { S as StaffSelect } from "./staff-select-B9kle9BD.js";
import { P as Printer } from "./printer-F9DFLNWF.js";
import { E as Eye } from "./eye-BWxVZO-0.js";
import { T as Trash2, C as ChevronDown } from "./trash-2-4wGGdwwT.js";
import { C as ChevronUp } from "./chevron-up-F8UAWUQJ.js";
import { F as File } from "./file-C7liTYnX.js";
import { M as MessageSquare } from "./message-square-Df_BcYTF.js";
import { P as Paperclip } from "./paperclip-DpSdwqts.js";
import { T as TriangleAlert } from "./triangle-alert-B-yEgefX.js";
import { C as CircleCheck } from "./circle-check-BsNARtMg.js";
import { C as ChevronRight } from "./tractor-BAeEka3V.js";
import { P as Pencil } from "./pencil-DvtEfriU.js";
import { A as Award } from "./award-D5lRbGQ4.js";
import { R as RefreshCw } from "./refresh-cw-6k2XZCjf.js";
import { E as ExternalLink } from "./external-link-CUT4HXN-.js";
import "./use-safe-clerk-DplYw4dj.js";
import "./database-C40ohlYs.js";
import "./shield-alert-DUKBl-az.js";
import "./shield-check-CVea-cql.js";
import "./index-Ba1Y0sFp.js";
import "./index-BWCLyXRH.js";
const fmt = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
function DocCell({ endpoint, queryKey, documentPath, documentName, portalUrl }) {
  const qc = useQueryClient();
  const fileRef = reactExports.useRef(null);
  const [uploading, setUploading] = reactExports.useState(false);
  async function handleFile(file) {
    setUploading(true);
    try {
      const urlRes = await fetch("/api/storage/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, contentType: file.type || "application/octet-stream" })
      }).then(async (r) => {
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
      await fetch(endpoint, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ documentPath: objectPath, documentName: fileName }) }).then(async (r) => {
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
    await fetch(endpoint, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ documentPath: null, documentName: null }) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    });
    qc.invalidateQueries({ queryKey });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 2, alignItems: "center" }, children: [
    portalUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: portalUrl, target: "_blank", rel: "noopener noreferrer", title: "View on assurance portal", style: { display: "flex", alignItems: "center", color: "#6b7280", padding: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 13 }) }),
    documentPath ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `/api/storage${documentPath}`, target: "_blank", rel: "noopener noreferrer", title: documentName || "View document", style: { display: "flex", alignItems: "center", color: "#2563eb", padding: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(File, { size: 13 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleRemove, title: "Remove document", style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4, fontSize: "0.8rem", lineHeight: 1 }, children: "×" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          ref: fileRef,
          type: "file",
          accept: ".pdf,.jpg,.jpeg,.png",
          style: { display: "none" },
          onChange: (e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }
        }
      ),
      uploading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 13, style: { color: "#9ca3af", padding: 4, animation: "spin 1s linear infinite" } }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => fileRef.current?.click(), title: "Attach document copy", style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { size: 13 }) })
    ] })
  ] });
}
const ORGANIC_BODIES = ["Organic Farmers & Growers", "Soil Association", "OF&G", "Certification of Environmental Farm Management (CEFM)", "Other (Organic)"];
const TYPE_BODY_MAP = {
  "Red Tractor": { body: "Red Tractor Assurance", locked: true, hint: "Red Tractor inspections must be conducted by Red Tractor Assurance Ltd." },
  "LEAF Marque": { body: "Linking Environment and Farming", locked: true, hint: "LEAF Marque inspections are conducted by LEAF (Linking Environment and Farming)." },
  "EHO": { body: "Environmental Health", locked: false, hint: "Usually carried out by your local authority Environmental Health Office." },
  "Trading Standards": { body: "Trading Standards", locked: false, hint: "Conducted by your local Trading Standards office." },
  "Internal Audit": { body: "Internal", locked: true, hint: "Internal audits are carried out by your own team — no external body applies." }
};
function SeverityBadge({ severity }) {
  const map = {
    critical: { bg: "#fee2e2", color: "#991b1b" },
    major: { bg: "#fef3c7", color: "#92400e" },
    minor: { bg: "#eff6ff", color: "#1e40af" }
  };
  const style = map[severity ?? ""] ?? { bg: "#f3f4f6", color: "#374151" };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: style.bg, color: style.color, border: "none", textTransform: "capitalize", fontSize: "0.75rem" }, children: severity || "unset" });
}
function StatusBadge({ status }) {
  const map = {
    open: { bg: "#fee2e2", color: "#991b1b" },
    in_progress: { bg: "#fef3c7", color: "#92400e" },
    closed: { bg: "#dcfce7", color: "#166534" },
    resolved: { bg: "#dcfce7", color: "#166534" },
    verified: { bg: "#eff6ff", color: "#1e40af" },
    pass: { bg: "#dcfce7", color: "#166534" },
    conditional_pass: { bg: "#fef3c7", color: "#92400e" },
    fail: { bg: "#fee2e2", color: "#991b1b" },
    pending: { bg: "#f3f4f6", color: "#374151" }
  };
  const style = map[status] ?? { bg: "#f3f4f6", color: "#374151" };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: style.bg, color: style.color, border: "none", textTransform: "capitalize", fontSize: "0.75rem" }, children: status.replace(/_/g, " ") });
}
function InspectionsTab({ farmId, openInspId, onSwitchToIssues }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const inspectionTypes = useLookupStrings("inspection_types", ["Red Tractor", "Internal Audit", "EHO", "Trading Standards", "Organic", "Other"]);
  const certificationBodies = useLookupStrings("certification_bodies", ["Red Tractor Assurance", "LEAF Marque", "Organic Farmers & Growers", "Soil Association", "RSPCA Assured", "Linking Environment and Farming", "Other"]);
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [editRecord, setEditRecord] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const emptyForm = { inspectionDate: "", inspectorName: "", inspectionBody: "", inspectionType: "", overallResult: "", summary: "", nextInspectionDue: "", notes: "" };
  const [form, setForm] = reactExports.useState(emptyForm);
  const [pendingFile, setPendingFile] = reactExports.useState(null);
  const [docUploading, setDocUploading] = reactExports.useState(false);
  const addFileRef = reactExports.useRef(null);
  const [postSavePrompt, setPostSavePrompt] = reactExports.useState(null);
  const [viewInspTab, setViewInspTab] = reactExports.useState("details");
  const [inspCommOpen, setInspCommOpen] = reactExports.useState(false);
  const [inspCommForm, setInspCommForm] = reactExports.useState({ commDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), commType: "", direction: "outbound", subject: "", summary: "" });
  const q = useQuery({
    queryKey: ["inspections", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/inspections`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  reactExports.useEffect(() => {
    if (!openInspId || !q.data) return;
    const record = q.data.find((r) => r.id === openInspId);
    if (record) setViewRecord(record);
  }, [openInspId, q.data]);
  const invalidate = () => qc.invalidateQueries({ queryKey: ["inspections", farmId] });
  const uploadDoc = async (recordId, file) => {
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
    await fetch(`/api/farms/${farmId}/inspections/${recordId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ documentPath: objectPath, documentName: fileName }) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    });
  };
  const createMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/inspections`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: async (data, variables) => {
      if (pendingFile && data.record?.id) {
        setDocUploading(true);
        try {
          await uploadDoc(data.record.id, pendingFile);
        } finally {
          setDocUploading(false);
        }
      }
      invalidate();
      setAddOpen(false);
      setForm(emptyForm);
      setPendingFile(null);
      const result = variables.overallResult ?? "";
      if (result === "fail") {
        toast({ title: "Inspection recorded as Failed", description: "Log any non-conformances raised in the Issues Register tab.", variant: "destructive" });
        setPostSavePrompt({ result: "fail", inspType: variables.inspectionType ?? "" });
      } else if (result === "conditional_pass") {
        toast({ title: "Conditional pass recorded", description: "Log any non-conformances in the Issues Register tab." });
        setPostSavePrompt({ result: "conditional_pass", inspType: variables.inspectionType ?? "" });
      } else {
        toast({ title: "Inspection saved" });
      }
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const updateMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/inspections/${editRecord?.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Inspection updated" });
      invalidate();
      setEditRecord(null);
      setForm(emptyForm);
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/inspections/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Deleted" });
      invalidate();
      setDeleteId(null);
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  const inspCommsQ = useQuery({
    queryKey: ["inspection-comms", farmId, viewRecord?.id],
    queryFn: () => fetch(`/api/farms/${farmId}/inspections/${viewRecord.id}/communications`).then((r) => r.json()),
    enabled: !!viewRecord
  });
  const addCommMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/inspections/${viewRecord?.id}/communications`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inspection-comms", farmId, viewRecord?.id] });
      setInspCommOpen(false);
      setInspCommForm({ commDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), commType: "", direction: "outbound", subject: "", summary: "" });
      toast({ title: "Communication logged" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const delCommMut = useMutation({
    mutationFn: (commId) => fetch(`/api/farms/${farmId}/inspections/${viewRecord?.id}/communications/${commId}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inspection-comms", farmId, viewRecord?.id] });
      toast({ title: "Deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  const [showOlder, setShowOlder] = reactExports.useState(false);
  const openEdit = (r) => {
    setForm({ inspectionDate: r.inspectionDate?.slice(0, 10) ?? "", inspectorName: r.inspectorName ?? "", inspectionBody: r.inspectionBody ?? "", inspectionType: r.inspectionType ?? "", overallResult: r.overallResult ?? "", summary: r.summary ?? "", nextInspectionDue: r.nextInspectionDue?.slice(0, 10) ?? "", notes: r.notes ?? "" });
    setEditRecord(r);
  };
  const records = q.data ?? [];
  const formOpen = addOpen || !!editRecord;
  const thisYear = (/* @__PURE__ */ new Date()).getFullYear();
  const cutoffYear = thisYear - 1;
  const olderRecords = records.filter((r) => {
    const yr = r.inspectionDate ? new Date(r.inspectionDate).getFullYear() : thisYear;
    return yr < cutoffYear;
  });
  const olderCount = olderRecords.length;
  const deepLinkIsOlder = openInspId ? olderRecords.some((r) => r.id === openInspId) : false;
  const displayedRecords = showOlder || deepLinkIsOlder ? records : records.filter((r) => {
    const yr = r.inspectionDate ? new Date(r.inspectionDate).getFullYear() : thisYear;
    return yr >= cutoffYear;
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 12 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
      setForm(emptyForm);
      setAddOpen(true);
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
      "Add Inspection"
    ] }) }),
    q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 py-8 text-center", children: "Loading..." }) : records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { size: 32, style: { margin: "0 auto 12px", opacity: 0.5 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: "No inspections recorded" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: "Log Red Tractor, internal, and regulatory inspections here." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Date", "Type", "Inspector", "Body", "Result", "Next Due", "Report", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }, children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: displayedRecords.map((r, i) => {
          const yr = r.inspectionDate ? new Date(r.inspectionDate).getFullYear() : thisYear;
          const isOlder = yr < cutoffYear;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < displayedRecords.length - 1 ? "1px solid #f3f4f6" : "none", background: isOlder ? "#fafafa" : "#fff", opacity: isOlder ? 0.85 : 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }, children: [
              fmt(r.inspectionDate),
              isOlder && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { marginLeft: 6, fontSize: "0.65rem", background: "#f3f4f6", color: "#9ca3af", borderRadius: 3, padding: "1px 5px" }, children: "archived" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", fontWeight: 500 }, children: r.inspectionType || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.inspectorName || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.inspectionBody || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: r.overallResult ? /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: r.overallResult }) : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: fmt(r.nextInspectionDue) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.25rem 0.5rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              DocCell,
              {
                endpoint: `/api/farms/${farmId}/inspections/${r.id}`,
                queryKey: ["inspections", farmId],
                documentPath: r.documentPath ?? null,
                documentName: r.documentName ?? null
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewRecord(r), style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }, title: "View", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 13 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteId(r.id), style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }, title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
            ] }) })
          ] }, r.id);
        }) })
      ] }) }),
      olderCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { textAlign: "center", paddingTop: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setShowOlder((v) => !v),
          style: { background: "none", border: "none", cursor: "pointer", fontSize: "0.8125rem", color: "#6b7280", display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 6 },
          children: showOlder ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { size: 13 }),
            " Hide ",
            olderCount,
            " older ",
            olderCount === 1 ? "inspection" : "inspections",
            " (before ",
            cutoffYear,
            ")"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 13 }),
            " Show ",
            olderCount,
            " older ",
            olderCount === 1 ? "inspection" : "inspections",
            " (before ",
            cutoffYear,
            ")"
          ] })
        }
      ) })
    ] }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => {
      setViewRecord(null);
      setViewInspTab("details");
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 600 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Inspection Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 4, borderBottom: "1px solid #e5e7eb", marginBottom: 16 }, children: ["details", "communications"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewInspTab(t), style: { border: "none", background: "none", padding: "8px 14px", fontSize: "0.8125rem", fontWeight: viewInspTab === t ? 600 : 400, color: viewInspTab === t ? "#166534" : "#6b7280", borderBottom: viewInspTab === t ? "2px solid #166534" : "2px solid transparent", cursor: "pointer" }, children: t === "details" ? "Details" : `Communications${inspCommsQ.data?.length > 0 ? ` (${inspCommsQ.data.length})` : ""}` }, t)) }),
      viewInspTab === "details" ? (() => {
        const r = viewRecord;
        const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
        const F = ({ label, value }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 2 }, children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.875rem", color: value ? "#111827" : "#d1d5db" }, children: value || "—" })
        ] });
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gap: 14 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Date", value: fmtD(r.inspectionDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Type", value: r.inspectionType })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Inspector Name", value: r.inspectorName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Inspection Body", value: r.inspectionBody })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 4 }, children: "Overall Result" }),
              r.overallResult ? /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: r.overallResult }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db", fontSize: "0.875rem" }, children: "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Next Inspection Due", value: fmtD(r.nextInspectionDue) })
          ] }),
          r.summary && /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Summary", value: r.summary }),
          r.notes && /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Notes", value: r.notes }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 4 }, children: "Report Document" }),
            r.documentPath ? /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: `/api/storage${r.documentPath}`, target: "_blank", rel: "noopener noreferrer", style: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.875rem", color: "#2563eb", textDecoration: "none" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(File, { size: 14 }),
              r.documentName || "View Report"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.875rem", color: "#d1d5db" }, children: "No report document attached" })
          ] })
        ] });
      })() : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 12 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setInspCommForm({ commDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), commType: "", direction: "outbound", subject: "", summary: "" });
          setInspCommOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
          "Log Communication"
        ] }) }),
        inspCommsQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#9ca3af", textAlign: "center", padding: "2rem" }, children: "Loading…" }) : inspCommsQ.data?.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "2rem", color: "#9ca3af" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 28, style: { margin: "0 auto 8px", opacity: 0.4 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: "No correspondence logged" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem" }, children: "Log emails, letters, phone calls, and meetings relating to this inspection." })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: inspCommsQ.data.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { border: "1px solid #e5e7eb", borderRadius: 8, padding: "0.75rem 1rem", background: "#fff" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", padding: "2px 8px", borderRadius: 20, background: c.direction === "inbound" ? "#eff6ff" : "#f0fdf4", color: c.direction === "inbound" ? "#1d4ed8" : "#15803d" }, children: c.direction === "inbound" ? "Received" : "Sent" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8125rem", fontWeight: 600, color: "#374151" }, children: c.comm_type }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.75rem", color: "#9ca3af" }, children: "·" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.75rem", color: "#6b7280" }, children: c.comm_date ? new Date(c.comm_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => delCommMut.mutate(c.id), style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 2 }, title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 13 }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, fontSize: "0.875rem", color: "#111827", marginTop: 6, marginBottom: c.summary ? 4 : 0 }, children: c.subject }),
          c.summary && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8125rem", color: "#6b7280", margin: 0 }, children: c.summary })
        ] }, c.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setViewRecord(null);
          setViewInspTab("details");
        }, children: "Close" }),
        viewInspTab === "details" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
          const r = viewRecord;
          setViewRecord(null);
          openEdit(r);
        }, children: "Edit Inspection" })
      ] })
    ] }) }),
    inspCommOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      setInspCommOpen(o);
      if (!o) addCommMut.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 480 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Log Communication" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: inspCommForm.commDate, onChange: (e) => setInspCommForm((f) => ({ ...f, commDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Direction" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: inspCommForm.direction, onValueChange: (v) => setInspCommForm((f) => ({ ...f, direction: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "outbound", children: "Sent / Outgoing" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "inbound", children: "Received / Incoming" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: inspCommForm.commType, onValueChange: (v) => setInspCommForm((f) => ({ ...f, commType: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Email", "Letter", "Phone call", "Meeting", "Site visit", "Video call", "Other"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Subject ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Response to inspection report", value: inspCommForm.subject, onChange: (e) => setInspCommForm((f) => ({ ...f, subject: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes / Summary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: inspCommForm.summary, onChange: (e) => setInspCommForm((f) => ({ ...f, summary: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: addCommMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setInspCommOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => addCommMut.mutate(inspCommForm), disabled: !inspCommForm.subject || !inspCommForm.commType || addCommMut.isPending, children: "Save" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: formOpen, onOpenChange: (o) => {
      if (!o) {
        setAddOpen(false);
        setEditRecord(null);
        setForm(emptyForm);
        createMut.reset();
        updateMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 520 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editRecord ? "Edit Inspection" : "Record Inspection" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Date ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().split("T")[0], value: form.inspectionDate, onChange: (e) => setForm((f) => ({ ...f, inspectionDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              OtherSelect,
              {
                options: inspectionTypes,
                value: form.inspectionType,
                onValueChange: (v) => {
                  const mapped = TYPE_BODY_MAP[v ?? ""];
                  setForm((f) => ({ ...f, inspectionType: v, ...mapped ? { inspectionBody: mapped.body } : {} }));
                },
                placeholder: "Select type...",
                specifyPlaceholder: "Specify inspection type…"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Inspector Name ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.inspectorName, onChange: (e) => setForm((f) => ({ ...f, inspectorName: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Inspection Body" }),
            (() => {
              const mapped = TYPE_BODY_MAP[form.inspectionType ?? ""];
              if (mapped?.locked) {
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 6, background: "#f9fafb", fontSize: "0.875rem", color: "#374151" }, children: mapped.body }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#9ca3af", marginTop: 3 }, children: mapped.hint })
                ] });
              }
              if (form.inspectionType === "Organic") {
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.inspectionBody || "__none__", onValueChange: (v) => setForm((f) => ({ ...f, inspectionBody: v === "__none__" ? "" : v })), children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select certifier…" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select certifier" }),
                      ORGANIC_BODIES.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: b, children: b }, b))
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#9ca3af", marginTop: 3 }, children: "Select your organic certification body." })
                ] });
              }
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  OtherSelect,
                  {
                    options: certificationBodies,
                    value: form.inspectionBody,
                    onValueChange: (v) => setForm((f) => ({ ...f, inspectionBody: v })),
                    placeholder: "Select body...",
                    specifyPlaceholder: "Specify certification body…"
                  }
                ),
                mapped && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#9ca3af", marginTop: 3 }, children: mapped.hint })
              ] });
            })()
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Overall Result" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.overallResult || "__none__", onValueChange: (v) => setForm((f) => ({ ...f, overallResult: v === "__none__" ? "" : v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— None —" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pass", children: "Pass" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "conditional_pass", children: "Conditional Pass" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "fail", children: "Fail" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pending", children: "Pending" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Inspection Due" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.nextInspectionDue, onChange: (e) => setForm((f) => ({ ...f, nextInspectionDue: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Summary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Summary of findings...", value: form.summary, onChange: (e) => setForm((f) => ({ ...f, summary: e.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Additional notes...", value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Report Document" }),
          editRecord ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            DocCell,
            {
              endpoint: `/api/farms/${farmId}/inspections/${editRecord.id}`,
              queryKey: ["inspections", farmId],
              documentPath: editRecord.documentPath ?? null,
              documentName: editRecord.documentName ?? null
            }
          ) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1", style: { display: "flex", alignItems: "center", gap: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                ref: addFileRef,
                type: "file",
                accept: ".pdf,.jpg,.jpeg,.png",
                style: { display: "none" },
                onChange: (e) => {
                  const f = e.target.files?.[0];
                  if (f) setPendingFile(f);
                  e.target.value = "";
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => addFileRef.current?.click(), style: { display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", border: "1px solid #e5e7eb", borderRadius: 6, background: "#f9fafb", cursor: "pointer", fontSize: "0.8rem", color: "#374151" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { size: 13 }),
              pendingFile ? pendingFile.name : "Attach report…"
            ] }),
            pendingFile && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setPendingFile(null), style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "0.75rem" }, children: "Remove" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: editRecord ? updateMut : createMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setAddOpen(false);
          setEditRecord(null);
          setForm(emptyForm);
          setPendingFile(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => editRecord ? updateMut.mutate(form) : createMut.mutate(form),
            disabled: !form.inspectionDate || !form.inspectorName || createMut.isPending || updateMut.isPending || docUploading,
            children: docUploading ? "Uploading…" : editRecord ? "Save Changes" : "Save Inspection"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeleteId(null);
        deleteMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Inspection" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "Are you sure you want to delete this inspection record?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteId !== null && deleteMut.mutate(deleteId), disabled: deleteMut.isPending, children: "Delete" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: postSavePrompt !== null, onOpenChange: (o) => {
      if (!o) setPostSavePrompt(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 460 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 18, color: postSavePrompt?.result === "fail" ? "#dc2626" : "#d97706" }),
        postSavePrompt?.result === "fail" ? "Inspection Failed — Log Non-Conformance?" : "Conditional Pass — Log Non-Conformances?"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "4px 0 8px" }, children: [
        postSavePrompt?.result === "fail" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "12px 14px", marginBottom: 12 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.875rem", color: "#991b1b", margin: 0, lineHeight: 1.5 }, children: [
          "This ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: postSavePrompt.inspType || "inspection" }),
          " was recorded as ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Failed" }),
          ". One or more non-conformances should be raised and tracked to closure."
        ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "12px 14px", marginBottom: 12 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.875rem", color: "#92400e", margin: 0, lineHeight: 1.5 }, children: [
          "This ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: postSavePrompt?.inspType || "inspection" }),
          " was recorded as a ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Conditional Pass" }),
          ". Any conditions or minor non-conformances raised should be logged and tracked."
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: "#6b7280", margin: 0 }, children: [
          "Switch to the ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Issues Register" }),
          " tab to log a non-conformance and assign a corrective action with a due date."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { style: { gap: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setPostSavePrompt(null), children: "Not now" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            style: { background: postSavePrompt?.result === "fail" ? "#dc2626" : "#d97706", color: "#fff" },
            onClick: () => {
              setPostSavePrompt(null);
              onSwitchToIssues?.();
            },
            children: "Go to Issues Register"
          }
        )
      ] })
    ] }) })
  ] });
}
const NC_CATEGORIES = ["Animal Health & Welfare", "Biosecurity", "Crop Production", "Documentation", "Equipment & Machinery", "Environmental", "Food Safety", "Hygiene", "Record Keeping", "Staff Training", "Traceability", "Other"];
const NC_CA_SUGGESTIONS = {
  critical: {
    "Animal Health & Welfare": "Immediately segregate affected animals and contact your vet. Notify your certifying body within 24 hours. Document all affected animals by ear tag or identifier.",
    "Biosecurity": "Implement immediate quarantine protocols. Restrict all livestock and personnel movement on farm. Notify APHA and your vet today.",
    "Crop Production": "Halt all operations on affected areas. Review crop inputs and application records. Notify certifying body immediately if organic status may be compromised.",
    "Documentation": "Audit all records for the relevant period. Reconstruct missing data from source documents. Implement immediate corrective controls and notify certifying body.",
    "Equipment & Machinery": "Take affected equipment out of service immediately. Arrange emergency inspection or repair. Do not return to use until safety-cleared in writing.",
    "Environmental": "Stop all operations contributing to the issue. Notify the Environment Agency if water or land has been affected. Implement containment measures immediately.",
    "Food Safety": "Immediately withdraw and quarantine all potentially affected batches. Notify your certifying body and relevant authorities within 24 hours. Initiate root cause investigation.",
    "Hygiene": "Cease all processing/handling operations immediately. Deep-clean and disinfect affected areas. Do not resume until re-tested and cleared.",
    "Record Keeping": "Reconstruct all missing records from source documents. Conduct a full record audit. Brief all relevant staff on recording requirements today.",
    "Staff Training": "Immediately withdraw untrained staff from affected tasks. Arrange emergency training or supervision. Document who was involved and when.",
    "Traceability": "Place a hold on all potentially affected products. Map the full traceability chain. Notify certifying body and trading partners within 24 hours.",
    "Other": "Implement immediate containment measures. Notify your certifying body within 24 hours. Conduct root cause analysis and document all findings."
  },
  major: {
    "Animal Health & Welfare": "Review and update your herd health plan with your vet within 7 days. Schedule re-training for relevant staff on animal welfare procedures.",
    "Biosecurity": "Review biosecurity protocols and update the farm biosecurity plan within 7 days. Brief all staff on changes.",
    "Crop Production": "Review crop management procedures and input records. Update risk assessments and brief relevant staff within 7 days.",
    "Documentation": "Review documentation procedures and schedule staff re-briefing on record-keeping requirements within 7 days.",
    "Equipment & Machinery": "Schedule full inspection and maintenance of affected equipment within 7 days. Update maintenance log.",
    "Environmental": "Review environmental risk assessments and implement revised controls within 7 days. Brief all relevant staff.",
    "Food Safety": "Review food safety procedures and conduct re-training for relevant staff within 7 days. Update HACCP documentation.",
    "Hygiene": "Review cleaning and hygiene schedules. Re-train relevant staff within 7 days and update documented procedures.",
    "Record Keeping": "Review record-keeping procedures and schedule staff re-training within 7 days. Implement a spot-check system.",
    "Staff Training": "Identify training gaps and schedule required training within 7 days. Update staff training records.",
    "Traceability": "Review traceability procedures end-to-end. Update systems and re-brief staff within 7 days.",
    "Other": "Develop a corrective action plan with clear milestones. Review relevant procedures and schedule staff re-briefing within 7 days."
  }
};
function getCaSuggestion(severity, category) {
  const map = NC_CA_SUGGESTIONS[severity] ?? {};
  return map[category] ?? map["Other"] ?? "";
}
function defaultDueDate(severity) {
  const d = /* @__PURE__ */ new Date();
  d.setDate(d.getDate() + (severity === "critical" ? 1 : severity === "major" ? 7 : 14));
  return d.toISOString().slice(0, 10);
}
function computeNcStatus(nc) {
  const cas = nc.correctiveActions;
  if (cas.length === 0) return nc.status ?? "open";
  if (cas.every((ca) => ca.status === "verified")) return "resolved";
  if (cas.every((ca) => ca.status === "closed" || ca.status === "verified")) return "awaiting_verification";
  if (cas.some((ca) => ca.status === "in_progress")) return "in_progress";
  if (cas.some((ca) => ca.status === "open")) return "action_raised";
  return nc.status ?? "open";
}
const PIPELINE_STEPS = ["Identified", "Action Raised", "In Progress", "Awaiting Verification", "Resolved"];
function pipelineStep(computed) {
  if (computed === "resolved") return 4;
  if (computed === "awaiting_verification") return 3;
  if (computed === "in_progress") return 2;
  if (computed === "action_raised") return 1;
  return 0;
}
function ComputedStatusBadge({ computed }) {
  const map = {
    open: { bg: "#fee2e2", color: "#991b1b", label: "Open" },
    action_raised: { bg: "#fef3c7", color: "#92400e", label: "Action Raised" },
    in_progress: { bg: "#dbeafe", color: "#1e40af", label: "In Progress" },
    awaiting_verification: { bg: "#fde68a", color: "#78350f", label: "Awaiting Verification" },
    resolved: { bg: "#dcfce7", color: "#166534", label: "Resolved" }
  };
  const s = map[computed] ?? { bg: "#f3f4f6", color: "#374151", label: computed };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: s.bg, color: s.color, border: "none", fontSize: "0.72rem", whiteSpace: "nowrap" }, children: s.label });
}
function PipelineBar({ step }) {
  const colors = ["#d1d5db", "#f59e0b", "#3b82f6", "#f97316", "#16a34a"];
  const activeColor = colors[step] ?? "#d1d5db";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", alignItems: "center", gap: 0, marginTop: 6 }, children: PIPELINE_STEPS.map((label, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", minWidth: 64 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: 10, height: 10, borderRadius: "50%", background: i <= step ? activeColor : "#e5e7eb", border: `2px solid ${i <= step ? activeColor : "#d1d5db"}`, transition: "background 0.2s" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.6rem", color: i <= step ? activeColor : "#9ca3af", marginTop: 2, fontWeight: i === step ? 700 : 400, textAlign: "center", lineHeight: 1.1 }, children: label })
    ] }),
    i < PIPELINE_STEPS.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { flex: 1, height: 2, background: i < step ? activeColor : "#e5e7eb", margin: "-14px 0 0 0", alignSelf: "flex-start", marginTop: 4 } })
  ] }, label)) });
}
function IssuesRegisterTab({ farmId, openCaId }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: issMembersData, isLoading: issMembersLoading } = useFarmMembers(farmId);
  const issStaffNames = (issMembersData?.members ?? []).filter((m) => m.isActive).map((m) => `${m.firstName} ${m.lastName}`);
  const [expanded, setExpanded] = reactExports.useState(/* @__PURE__ */ new Set());
  const highlightCaRef = reactExports.useRef(null);
  const [showArchived, setShowArchived] = reactExports.useState(false);
  const [ncAddOpen, setNcAddOpen] = reactExports.useState(false);
  const [ncEdit, setNcEdit] = reactExports.useState(null);
  const [ncDeleteId, setNcDeleteId] = reactExports.useState(null);
  const [raiseTaskFor, setRaiseTaskFor] = reactExports.useState(null);
  const [caAddForNc, setCaAddForNc] = reactExports.useState(null);
  const [caEdit, setCaEdit] = reactExports.useState(null);
  const [caDeleteId, setCaDeleteId] = reactExports.useState(null);
  const emptyNcForm = { category: "", description: "", severity: "", identifiedDate: "", identifiedBy: "", notes: "" };
  const emptyCaForm = { description: "", assignedTo: "", dueDate: "", verifiedBy: "", notes: "" };
  const [ncForm, setNcForm] = reactExports.useState(emptyNcForm);
  const [caForm, setCaForm] = reactExports.useState(emptyCaForm);
  const q = useQuery({
    queryKey: ["issues-register", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/issues-register`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.issues ?? []
  });
  const issues = q.data ?? [];
  const { data: staffRaw } = useQuery({
    queryKey: ["staff", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/staff`).then((r) => r.json()).then((d) => d.staff ?? []),
    enabled: !!farmId
  });
  const staffList = staffRaw ?? [];
  reactExports.useEffect(() => {
    if (!openCaId || !q.data) return;
    const parentNc = q.data.find(
      (nc) => (nc.correctiveActions ?? []).some((ca) => ca.id === openCaId)
    );
    if (parentNc) {
      setExpanded((prev) => {
        const s = new Set(prev);
        s.add(parentNc.id);
        return s;
      });
      setTimeout(() => {
        highlightCaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [openCaId, q.data]);
  const invalidate = () => qc.invalidateQueries({ queryKey: ["issues-register", farmId] });
  const createNc = useMutation({
    mutationFn: async (body) => {
      const res = await fetch(`/api/farms/${farmId}/nonconformances`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      return res.json();
    },
    onSuccess: (data, vars) => {
      invalidate();
      setNcAddOpen(false);
      setNcForm(emptyNcForm);
      if (vars.severity === "critical") {
        const newNc = data.record ?? {};
        const suggestion = getCaSuggestion("critical", vars.category ?? "");
        setCaForm({ description: suggestion, assignedTo: "", dueDate: defaultDueDate("critical"), verifiedBy: "", notes: "" });
        setCaAddForNc(newNc);
        toast({
          title: "Critical non-conformance logged",
          description: "An immediate corrective action is required — complete the form below and assign it now.",
          variant: "destructive"
        });
      } else if (vars.severity === "major") {
        toast({
          title: "Major non-conformance logged",
          description: "A corrective action is recommended within 7 days. Expand the issue to add one."
        });
      } else {
        toast({ title: "Non-conformance logged" });
      }
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const updateNc = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/nonconformances/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Updated" });
      invalidate();
      setNcEdit(null);
      setNcForm(emptyNcForm);
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" })
  });
  const deleteNc = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/nonconformances/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Deleted" });
      invalidate();
      setNcDeleteId(null);
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  const createCa = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/corrective-actions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Corrective action added" });
      invalidate();
      setCaAddForNc(null);
      setCaForm(emptyCaForm);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const updateCa = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/corrective-actions/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Updated" });
      invalidate();
      setCaEdit(null);
      setCaForm(emptyCaForm);
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" })
  });
  const deleteCa = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/corrective-actions/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Deleted" });
      invalidate();
      setCaDeleteId(null);
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  const toggleExpand = (id) => setExpanded((prev) => {
    const s = new Set(prev);
    s.has(id) ? s.delete(id) : s.add(id);
    return s;
  });
  const openEditNc = (nc) => {
    setNcForm({ category: nc.category ?? "", description: nc.description ?? "", severity: nc.severity ?? "", identifiedDate: nc.identifiedDate?.slice(0, 10) ?? "", identifiedBy: nc.identifiedBy ?? "", notes: nc.notes ?? "" });
    setNcEdit(nc);
  };
  const openEditCa = (ca) => {
    setCaForm({ description: ca.description ?? "", assignedTo: ca.assignedTo ?? "", dueDate: ca.dueDate?.slice(0, 10) ?? "", verifiedBy: ca.verifiedBy ?? "", notes: ca.notes ?? "", status: ca.status ?? "open" });
    setCaEdit(ca);
  };
  const openCount = issues.filter((nc) => {
    const s = computeNcStatus(nc);
    return s !== "resolved";
  }).length;
  const critCount = issues.filter((nc) => nc.severity === "critical" && computeNcStatus(nc) !== "resolved").length;
  const resolvedCount = issues.filter((nc) => computeNcStatus(nc) === "resolved").length;
  const overdueCount = issues.filter((nc) => {
    const cas = nc.correctiveActions ?? [];
    return cas.some((ca) => ca.status !== "verified" && ca.status !== "closed" && ca.dueDate && new Date(ca.dueDate) < /* @__PURE__ */ new Date());
  }).length;
  const thisYear = (/* @__PURE__ */ new Date()).getFullYear();
  const resolvedAt = (nc) => {
    const ts = [
      nc.updatedAt ? new Date(nc.updatedAt).getTime() : 0,
      ...(nc.correctiveActions ?? []).map((ca) => ca.updatedAt ? new Date(ca.updatedAt).getTime() : 0)
    ];
    return Math.max(...ts);
  };
  const isArchived = (nc) => computeNcStatus(nc) === "resolved" && new Date(resolvedAt(nc)).getFullYear() < thisYear;
  const archivedCount = issues.filter(isArchived).length;
  const deepLinkIsArchived = openCaId ? issues.some((nc) => isArchived(nc) && (nc.correctiveActions ?? []).some((ca) => ca.id === openCaId)) : false;
  const displayedIssues = showArchived || deepLinkIsArchived ? issues : issues.filter((nc) => !isArchived(nc));
  const ncFormOpen = ncAddOpen || !!ncEdit;
  const caFormOpen = !!caAddForNc || !!caEdit;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: [
        openCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "5px 12px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 13, color: "#ef4444" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.8rem", color: "#991b1b", fontWeight: 600 }, children: [
            openCount,
            " open ",
            openCount === 1 ? "issue" : "issues"
          ] })
        ] }),
        critCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8, padding: "5px 12px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 13, color: "#dc2626" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.8rem", color: "#7f1d1d", fontWeight: 600 }, children: [
            critCount,
            " critical"
          ] })
        ] }),
        overdueCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, padding: "5px 12px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 13, color: "#ea580c" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.8rem", color: "#9a3412", fontWeight: 600 }, children: [
            overdueCount,
            " overdue ",
            overdueCount === 1 ? "action" : "actions"
          ] })
        ] }),
        resolvedCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "5px 12px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 13, color: "#16a34a" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.8rem", color: "#166534", fontWeight: 600 }, children: [
            resolvedCount,
            " resolved"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        setNcForm(emptyNcForm);
        setNcAddOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
        "Log Non-Conformance"
      ] })
    ] }),
    q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 py-8 text-center", children: "Loading..." }) : issues.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "4rem", color: "#9ca3af", background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 36, style: { margin: "0 auto 12px", opacity: 0.4 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151", marginBottom: 4 }, children: "No issues recorded" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: "Non-conformances raised during inspections are tracked here, along with their corrective actions and resolution status." })
    ] }) : displayedIssues.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 28, style: { margin: "0 auto 10px", opacity: 0.4 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151", marginBottom: 4 }, children: "All clear — no open issues" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: archivedCount > 0 ? `${archivedCount} resolved ${archivedCount === 1 ? "issue" : "issues"} from prior years are in the archive.` : "No issues have been logged yet." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: [
      displayedIssues.map((nc) => {
        const computed = computeNcStatus(nc);
        const step = pipelineStep(computed);
        const isExpanded = expanded.has(nc.id);
        const cas = nc.correctiveActions ?? [];
        const openCas = cas.filter((ca) => ca.status === "open" || ca.status === "in_progress").length;
        const severityBorderColor = { critical: "#ef4444", major: "#f59e0b", minor: "#60a5fa" };
        const borderLeft = `4px solid ${severityBorderColor[nc.severity ?? ""] ?? "#d1d5db"}`;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", borderLeft }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              onClick: () => toggleExpand(nc.id),
              style: { display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", cursor: "pointer" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { paddingTop: 2, color: "#9ca3af", flexShrink: 0 }, children: isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 16 }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 4 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.72rem", color: "#6b7280", whiteSpace: "nowrap" }, children: fmt(nc.identifiedDate) }),
                    nc.category && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.72rem", background: "#f3f4f6", color: "#374151", borderRadius: 4, padding: "1px 6px" }, children: nc.category }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SeverityBadge, { severity: nc.severity }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ComputedStatusBadge, { computed }),
                    cas.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.72rem", background: openCas > 0 ? "#fef3c7" : "#f0fdf4", color: openCas > 0 ? "#92400e" : "#166534", borderRadius: 4, padding: "1px 7px", border: `1px solid ${openCas > 0 ? "#fde68a" : "#bbf7d0"}` }, children: [
                      cas.length,
                      " ",
                      cas.length === 1 ? "action" : "actions",
                      openCas > 0 ? ` · ${openCas} open` : " · all done"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", fontWeight: 500, color: "#111827", margin: 0, lineHeight: 1.4 }, children: nc.description }),
                  nc.identifiedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.72rem", color: "#9ca3af", margin: "2px 0 0" }, children: [
                    "Identified by ",
                    nc.identifiedBy
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(PipelineBar, { step })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 2, flexShrink: 0 }, onClick: (e) => e.stopPropagation(), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEditNc(nc), title: "Edit NC", style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 13 }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setNcDeleteId(nc.id), title: "Delete NC", style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 13 }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setRaiseTaskFor(nc), title: "Raise Task", style: { background: "none", border: "none", cursor: "pointer", color: "#8b5cf6", padding: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { size: 13 }) })
                ] })
              ]
            }
          ),
          isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { borderTop: "1px solid #f3f4f6", background: "#fafafa" }, children: [
            cas.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: "12px 20px 8px 40px", color: "#9ca3af", fontSize: "0.8rem" }, children: "No corrective actions yet — add one below." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: "8px 14px 4px 40px" }, children: cas.map((ca, i) => {
              const isOverdue = ca.dueDate && new Date(ca.dueDate) < /* @__PURE__ */ new Date() && ca.status !== "verified" && ca.status !== "closed";
              const isHighlighted = openCaId === ca.id;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: isHighlighted ? highlightCaRef : null, style: { borderBottom: i < cas.length - 1 ? "1px solid #f3f4f6" : "none", padding: "8px 6px", display: "flex", alignItems: "flex-start", gap: 10, borderRadius: isHighlighted ? 8 : 0, background: isHighlighted ? "#fef9c3" : "transparent", outline: isHighlighted ? "2px solid #fbbf24" : "none", transition: "background 0.5s" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: 8, height: 8, borderRadius: "50%", background: ca.status === "verified" ? "#16a34a" : ca.status === "closed" ? "#2563eb" : ca.status === "in_progress" ? "#f59e0b" : "#ef4444", marginTop: 6, flexShrink: 0 } }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.825rem", fontWeight: 500, color: "#374151", margin: 0 }, children: ca.description }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 10, marginTop: 3, flexWrap: "wrap", alignItems: "center" }, children: [
                    ca.assignedTo && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.72rem", color: "#6b7280" }, children: [
                      "→ ",
                      ca.assignedTo
                    ] }),
                    ca.dueDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.72rem", color: isOverdue ? "#dc2626" : "#6b7280", fontWeight: isOverdue ? 600 : 400 }, children: [
                      "Due ",
                      fmt(ca.dueDate),
                      isOverdue ? " ⚠ overdue" : ""
                    ] }),
                    ca.verifiedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.72rem", color: "#6b7280" }, children: [
                      "Verified by ",
                      ca.verifiedBy
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: ca.status, onValueChange: (v) => updateCa.mutate({ id: ca.id, body: { status: v } }), children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { style: { height: 26, fontSize: "0.72rem", padding: "0 6px", width: 130 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "open", children: "Open" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "in_progress", children: "In Progress" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "closed", children: "Closed" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "verified", children: "Verified" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEditCa(ca), title: "Edit action", style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 12 }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setCaDeleteId(ca.id), title: "Delete action", style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 12 }) })
                ] })
              ] }, ca.id);
            }) }),
            nc.severity === "major" && cas.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { margin: "0 14px 0 40px", padding: "9px 12px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 7, display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 13, color: "#d97706", style: { flexShrink: 0 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.8rem", color: "#92400e", flex: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Major non-conformance" }),
                " — a corrective action is recommended within 7 days."
              ] })
            ] }),
            nc.severity === "critical" && cas.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { margin: "0 14px 0 40px", padding: "9px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 7, display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 13, color: "#dc2626", style: { flexShrink: 0 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.8rem", color: "#991b1b", flex: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Critical non-conformance" }),
                " — an immediate corrective action is required. No actions have been assigned yet."
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: "8px 14px 12px 40px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => {
              const sev = nc.severity;
              const suggestion = sev === "critical" || sev === "major" ? getCaSuggestion(sev, nc.category ?? "") : "";
              setCaForm({ ...emptyCaForm, description: suggestion, dueDate: defaultDueDate(sev) });
              setCaAddForNc(nc);
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 13, className: "mr-1" }),
              "Add Corrective Action"
            ] }) })
          ] })
        ] }, nc.id);
      }),
      archivedCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { textAlign: "center", paddingTop: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setShowArchived((v) => !v),
          style: { background: "none", border: "none", cursor: "pointer", fontSize: "0.8125rem", color: "#6b7280", display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 6 },
          children: showArchived ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { size: 13 }),
            " Hide ",
            archivedCount,
            " archived ",
            archivedCount === 1 ? "issue" : "issues",
            " from prior years"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 13 }),
            " Show ",
            archivedCount,
            " archived ",
            archivedCount === 1 ? "issue" : "issues",
            " from prior years"
          ] })
        }
      ) })
    ] }),
    !q.isLoading && issues.length > 0 && displayedIssues.length === 0 && archivedCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { textAlign: "center", marginTop: 12 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => setShowArchived(true),
        style: { background: "none", border: "none", cursor: "pointer", fontSize: "0.8125rem", color: "#6b7280", display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 6 },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 13 }),
          " Show ",
          archivedCount,
          " archived ",
          archivedCount === 1 ? "issue" : "issues",
          " from prior years"
        ]
      }
    ) }),
    raiseTaskFor && /* @__PURE__ */ jsxRuntimeExports.jsx(
      RaiseTaskDialog,
      {
        farmId,
        open: !!raiseTaskFor,
        onClose: () => setRaiseTaskFor(null),
        defaultTitle: `NC Resolution — ${raiseTaskFor.category ?? "Non-Conformance"}`,
        defaultDescription: `${raiseTaskFor.description ?? ""}${raiseTaskFor.severity ? ` · Severity: ${raiseTaskFor.severity}` : ""}${raiseTaskFor.identifiedDate ? ` · Identified: ${new Date(raiseTaskFor.identifiedDate).toLocaleDateString("en-GB")}` : ""}`,
        module: "inspections"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: ncFormOpen, onOpenChange: (o) => {
      if (!o) {
        setNcAddOpen(false);
        setNcEdit(null);
        setNcForm(emptyNcForm);
        createNc.reset();
        updateNc.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 520 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: ncEdit ? "Edit Non-Conformance" : "Log Non-Conformance" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Date Identified ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: ncForm.identifiedDate, onChange: (e) => setNcForm((f) => ({ ...f, identifiedDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Identified By" }),
            staffList.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: ncForm.identifiedBy || "__none__", onValueChange: (v) => setNcForm((f) => ({ ...f, identifiedBy: v === "__none__" ? "" : v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select person…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { className: "max-h-56", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select person" }),
                staffList.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: s.name, children: [
                  s.name,
                  s.role ? ` — ${s.role}` : ""
                ] }, s.name)),
                ncForm.identifiedBy && !staffList.some((s) => s.name === ncForm.identifiedBy) && /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: ncForm.identifiedBy, children: [
                  ncForm.identifiedBy,
                  " (previous)"
                ] })
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Name", value: ncForm.identifiedBy, onChange: (e) => setNcForm((f) => ({ ...f, identifiedBy: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Category ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: ncForm.category, onValueChange: (v) => setNcForm((f) => ({ ...f, category: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { className: "max-h-56", children: NC_CATEGORIES.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Severity" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: ncForm.severity || "__none__", onValueChange: (v) => setNcForm((f) => ({ ...f, severity: v === "__none__" ? "" : v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— None —" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "minor", children: "Minor" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "major", children: "Major" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "critical", children: "Critical" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Description ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Describe the non-conformance in detail...", value: ncForm.description, onChange: (e) => setNcForm((f) => ({ ...f, description: e.target.value })), rows: 3 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Additional context...", value: ncForm.notes, onChange: (e) => setNcForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: ncEdit ? updateNc : createNc, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setNcAddOpen(false);
          setNcEdit(null);
          setNcForm(emptyNcForm);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => ncEdit ? updateNc.mutate({ id: ncEdit.id, body: ncForm }) : createNc.mutate(ncForm), disabled: !ncForm.identifiedDate || !ncForm.category || !ncForm.description || createNc.isPending || updateNc.isPending, children: ncEdit ? "Save Changes" : "Log Issue" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: caFormOpen, onOpenChange: (o) => {
      if (!o) {
        setCaAddForNc(null);
        setCaEdit(null);
        setCaForm(emptyCaForm);
        createCa.reset();
        updateCa.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 500 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: caEdit ? "Edit Corrective Action" : "Add Corrective Action" }),
        caAddForNc && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: "#6b7280", margin: "4px 0 0", lineHeight: 1.4 }, children: [
          "For: ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("em", { children: [
            caAddForNc.description?.slice(0, 80),
            (caAddForNc.description?.length ?? 0) > 80 ? "…" : ""
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Action Description ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Describe the corrective action to be taken...", value: caForm.description, onChange: (e) => setCaForm((f) => ({ ...f, description: e.target.value })), rows: 3 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assigned To" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Name", value: caForm.assignedTo, onChange: (e) => setCaForm((f) => ({ ...f, assignedTo: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Due Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: caForm.dueDate, onChange: (e) => setCaForm((f) => ({ ...f, dueDate: e.target.value })) })
          ] })
        ] }),
        caEdit && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: caForm.status ?? "open", onValueChange: (v) => setCaForm((f) => ({ ...f, status: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "open", children: "Open" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "in_progress", children: "In Progress" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "closed", children: "Closed" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "verified", children: "Verified" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Verified By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSelect, { value: caForm.verifiedBy, onChange: (v) => setCaForm((f) => ({ ...f, verifiedBy: v })), staffNames: issStaffNames, loading: issMembersLoading })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Additional notes...", value: caForm.notes, onChange: (e) => setCaForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: caEdit ? updateCa : createCa, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setCaAddForNc(null);
          setCaEdit(null);
          setCaForm(emptyCaForm);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => caEdit ? updateCa.mutate({ id: caEdit.id, body: caForm }) : createCa.mutate({ ...caForm, nonconformanceId: caAddForNc?.id }),
            disabled: !caForm.description || createCa.isPending || updateCa.isPending,
            children: caEdit ? "Save Changes" : "Add Action"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: ncDeleteId !== null, onOpenChange: (o) => {
      if (!o) {
        setNcDeleteId(null);
        deleteNc.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Non-Conformance" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "Are you sure? This will also permanently delete all linked corrective actions." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteNc, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setNcDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => ncDeleteId !== null && deleteNc.mutate(ncDeleteId), disabled: deleteNc.isPending, children: "Delete" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: caDeleteId !== null, onOpenChange: (o) => {
      if (!o) {
        setCaDeleteId(null);
        deleteCa.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Corrective Action" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "Are you sure you want to delete this corrective action?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteCa, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setCaDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => caDeleteId !== null && deleteCa.mutate(caDeleteId), disabled: deleteCa.isPending, children: "Delete" })
      ] })
    ] }) })
  ] });
}
const CERT_BODIES = [
  "Red Tractor Assurance",
  "LEAF Marque",
  "Organic Farmers & Growers",
  "Soil Association",
  "RSPCA Assured",
  "Certus (Assured Food Standards)",
  "QMS (Quality Meat Scotland)",
  "HCC Assured",
  "BRCGS",
  "Other"
];
const CERT_SECTORS = [
  "Combinable Crops",
  "Fruit & Vegetables",
  "Fresh Produce",
  "Beef & Lamb",
  "Dairy",
  "Pigs",
  "Poultry",
  "Eggs",
  "Horticulture",
  "Arable",
  "Other"
];
function computeCertStatus(cert) {
  const stored = cert.status ?? "active";
  if (["suspended", "surrendered", "superseded", "withdrawn"].includes(stored)) return stored;
  if (cert.expiryDate) {
    const exp = new Date(cert.expiryDate);
    const now = /* @__PURE__ */ new Date();
    if (exp < now) return "expired";
    const soon = new Date(now);
    soon.setDate(soon.getDate() + 60);
    if (exp < soon) return "expiring_soon";
  }
  if (stored === "pending") return "pending";
  return "active";
}
function CertStatusBadge({ status, expiryDate }) {
  const cs = computeCertStatus({ status, expiryDate });
  const map = {
    active: { bg: "#dcfce7", color: "#166534", label: "Active" },
    expiring_soon: { bg: "#fef3c7", color: "#92400e", label: "Expiring Soon" },
    expired: { bg: "#fee2e2", color: "#991b1b", label: "Expired" },
    suspended: { bg: "#fef3c7", color: "#92400e", label: "Suspended" },
    surrendered: { bg: "#f3f4f6", color: "#6b7280", label: "Surrendered" },
    superseded: { bg: "#f3f4f6", color: "#9ca3af", label: "Superseded" },
    pending: { bg: "#eff6ff", color: "#1e40af", label: "Pending" }
  };
  const s = map[cs] ?? { bg: "#f3f4f6", color: "#374151", label: cs };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: s.bg, color: s.color, border: "none", fontSize: "0.75rem" }, children: s.label });
}
function ContinuityTimeline({ certs }) {
  const certsWithDates = certs.filter((c) => c.issueDate || c.expiryDate);
  if (certsWithDates.length === 0) return null;
  const today = /* @__PURE__ */ new Date();
  const fiveYearsAgo = new Date(today);
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
  const twoYearsAhead = new Date(today);
  twoYearsAhead.setFullYear(twoYearsAhead.getFullYear() + 2);
  let winStart = fiveYearsAgo.getTime();
  let winEnd = twoYearsAhead.getTime();
  certsWithDates.forEach((c) => {
    if (c.issueDate) winStart = Math.min(winStart, new Date(c.issueDate).getTime());
    if (c.expiryDate) winEnd = Math.max(winEnd, new Date(c.expiryDate).getTime());
  });
  const winDuration = winEnd - winStart;
  if (winDuration <= 0) return null;
  const toPct = (ts) => Math.max(0, Math.min(100, (ts - winStart) / winDuration * 100));
  const todayPct = toPct(today.getTime());
  const groupMap = /* @__PURE__ */ new Map();
  certsWithDates.forEach((c) => {
    const key = [c.certificationBody, c.sectors || c.scheme].filter(Boolean).join(" — ") || "Unknown";
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key).push(c);
  });
  groupMap.forEach((g) => g.sort((a, b) => new Date(a.issueDate || 0).getTime() - new Date(b.issueDate || 0).getTime()));
  const ticks = [];
  const startYear = new Date(winStart).getFullYear();
  const endYear = new Date(winEnd).getFullYear() + 1;
  for (let y = startYear; y <= endYear; y++) {
    const pct = toPct(new Date(y, 0, 1).getTime());
    if (pct >= 0 && pct <= 100) ticks.push({ pct, label: String(y) });
  }
  const ss = {
    active: { bg: "#16a34a" },
    expiring_soon: { bg: "#d97706" },
    expired: { bg: "#dc2626" },
    suspended: { bg: "#d97706" },
    surrendered: { bg: "#6b7280" },
    superseded: { bg: "#9ca3af" },
    pending: { bg: "#2563eb" }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: 20, border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", background: "#fff" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb", padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { size: 13, color: "#166534" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151" }, children: "Certification Continuity" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.72rem", color: "#9ca3af" }, children: "Gaps = periods without active coverage" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "14px 16px 10px" }, children: [
      Array.from(groupMap.entries()).map(([scheme, schemeCerts]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "200px 1fr", gap: 10, marginBottom: 10, alignItems: "center" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.72rem", fontWeight: 600, color: "#374151", lineHeight: 1.35, paddingRight: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, title: scheme, children: scheme }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "relative", height: 26, background: "#f3f4f6", borderRadius: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { position: "absolute", left: `${todayPct}%`, top: 0, bottom: 0, width: 2, background: "#374151", opacity: 0.45, zIndex: 3 } }),
          schemeCerts.map((cert) => {
            const cs = computeCertStatus(cert);
            const st = cert.issueDate ? toPct(new Date(cert.issueDate).getTime()) : 0;
            const en = cert.expiryDate ? toPct(new Date(cert.expiryDate).getTime()) : todayPct;
            const w = Math.max(0.4, en - st);
            const bg = (ss[cs] ?? { bg: "#9ca3af" }).bg;
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                title: `${cert.certificationBody}${cert.certNumber ? ` · ${cert.certNumber}` : ""} · ${fmt(cert.issueDate)} → ${fmt(cert.expiryDate)} · ${cs.replace(/_/g, " ")}`,
                style: { position: "absolute", left: `${st}%`, width: `${w}%`, top: 3, bottom: 3, background: bg, borderRadius: 3, zIndex: 1, cursor: "help", overflow: "hidden", display: "flex", alignItems: "center", paddingLeft: 4 },
                children: w > 8 && cert.certNumber && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.6rem", color: "#fff", fontWeight: 700, whiteSpace: "nowrap" }, children: cert.certNumber })
              },
              cert.id
            );
          })
        ] })
      ] }, scheme)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "200px 1fr", gap: 10, marginTop: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "relative", height: 18 }, children: [
          ticks.map((tick) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { position: "absolute", left: `${tick.pct}%`, transform: "translateX(-50%)", fontSize: "0.63rem", color: "#9ca3af", whiteSpace: "nowrap" }, children: tick.label }, tick.label)),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { position: "absolute", left: `${todayPct}%`, transform: "translateX(-50%)", fontSize: "0.63rem", color: "#374151", fontWeight: 700, whiteSpace: "nowrap" }, children: "Today" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap", paddingLeft: 210 }, children: [
        [["active", "Active"], ["expiring_soon", "Expiring Soon"], ["expired", "Expired"], ["superseded", "Superseded"], ["pending", "Pending"]].map(([cs, label]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: 10, height: 10, borderRadius: 2, background: (ss[cs] ?? { bg: "#9ca3af" }).bg } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.65rem", color: "#6b7280" }, children: label })
        ] }, cs)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: 2, height: 10, background: "#374151", opacity: 0.45 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.65rem", color: "#6b7280" }, children: "Today" })
        ] })
      ] })
    ] })
  ] });
}
function AssuranceCertsTab({ farmId }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [editRecord, setEditRecord] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [renewingFrom, setRenewingFrom] = reactExports.useState(null);
  const [filterTab, setFilterTab] = reactExports.useState("all");
  const emptyForm = { certificationBody: "", scheme: "", certNumber: "", sectors: "", assessorName: "", assessorMembershipNo: "", issueDate: "", expiryDate: "", status: "active", nextVisitDue: "", notes: "" };
  const [form, setForm] = reactExports.useState(emptyForm);
  const certificationBodies = useLookupStrings("certification_bodies", CERT_BODIES);
  const q = useQuery({
    queryKey: ["assurance-certs", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/assurance-certs`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["assurance-certs", farmId] });
  const closeForm = () => {
    setAddOpen(false);
    setEditRecord(null);
    setRenewingFrom(null);
    setForm(emptyForm);
    saveMut.reset();
  };
  const saveMut = useMutation({
    mutationFn: async (body) => {
      const payload = {
        ...body,
        issueDate: body.issueDate ? new Date(body.issueDate).toISOString() : null,
        expiryDate: body.expiryDate ? new Date(body.expiryDate).toISOString() : null,
        nextVisitDue: body.nextVisitDue ? new Date(body.nextVisitDue).toISOString() : null
      };
      if (editRecord) {
        return fetch(`/api/farms/${farmId}/assurance-certs/${editRecord.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then(async (r) => {
          if (!r.ok) {
            const t = await r.text().catch(() => "");
            throw new Error(t || `Request failed (${r.status})`);
          }
          return r;
        });
      }
      const res = await fetch(`/api/farms/${farmId}/assurance-certs`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      if (renewingFrom) {
        await fetch(`/api/farms/${farmId}/assurance-certs/${renewingFrom}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "superseded" }) }).then(async (r) => {
          if (!r.ok) {
            const t = await r.text().catch(() => "");
            throw new Error(t || `Request failed (${r.status})`);
          }
          return r;
        });
      }
      return res;
    },
    onSuccess: () => {
      toast({ title: renewingFrom ? "Certificate renewed — previous marked as superseded" : editRecord ? "Certificate updated" : "Certificate saved" });
      invalidate();
      closeForm();
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/assurance-certs/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Deleted" });
      invalidate();
      setDeleteId(null);
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  const records = q.data ?? [];
  const activeCt = records.filter((r) => computeCertStatus(r) === "active").length;
  const expiringSoonCt = records.filter((r) => computeCertStatus(r) === "expiring_soon").length;
  const expiredCt = records.filter((r) => computeCertStatus(r) === "expired").length;
  const otherCt = records.filter((r) => ["suspended", "surrendered", "superseded", "pending"].includes(computeCertStatus(r))).length;
  const filteredRecords = filterTab === "all" ? records : records.filter((r) => {
    const cs = computeCertStatus(r);
    if (filterTab === "active") return cs === "active";
    if (filterTab === "expiring_soon") return cs === "expiring_soon";
    if (filterTab === "expired") return cs === "expired";
    if (filterTab === "other") return ["suspended", "surrendered", "superseded", "pending"].includes(cs);
    return true;
  });
  const openAdd = () => {
    setEditRecord(null);
    setRenewingFrom(null);
    setForm(emptyForm);
    setAddOpen(true);
  };
  const openEdit = (r) => {
    setEditRecord(r);
    setRenewingFrom(null);
    setForm({ ...r, issueDate: r.issueDate?.slice(0, 10) ?? "", expiryDate: r.expiryDate?.slice(0, 10) ?? "", nextVisitDue: r.nextVisitDue?.slice(0, 10) ?? "" });
    setAddOpen(true);
  };
  const openRenew = (r) => {
    setRenewingFrom(r.id);
    setEditRecord(null);
    setForm({ ...emptyForm, certificationBody: r.certificationBody, scheme: r.scheme || "", sectors: r.sectors || "", assessorName: r.assessorName || "", assessorMembershipNo: r.assessorMembershipNo || "" });
    setAddOpen(true);
  };
  const FILTER_TABS = [
    { key: "all", label: "All", count: records.length },
    { key: "active", label: "Active", count: activeCt },
    { key: "expiring_soon", label: "Expiring Soon", count: expiringSoonCt },
    { key: "expired", label: "Expired", count: expiredCt },
    { key: "other", label: "Other", count: otherCt }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: [
        activeCt > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, padding: "4px 10px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { size: 13, color: "#16a34a" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.8rem", color: "#166534", fontWeight: 600 }, children: [
            activeCt,
            " active certificate",
            activeCt !== 1 ? "s" : ""
          ] })
        ] }),
        expiringSoonCt > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6, padding: "4px 10px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 13, color: "#d97706" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.8rem", color: "#92400e", fontWeight: 600 }, children: [
            expiringSoonCt,
            " expiring within 60 days"
          ] })
        ] }),
        expiredCt > 0 && activeCt === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "4px 10px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 13, color: "#dc2626" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.8rem", color: "#991b1b", fontWeight: 600 }, children: [
            expiredCt,
            " expired — renewal required"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
        "Add Certificate"
      ] })
    ] }),
    records.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(ContinuityTimeline, { certs: records }),
    records.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 0, borderBottom: "1px solid #e5e7eb", marginBottom: 12 }, children: FILTER_TABS.filter((t) => t.count > 0 || t.key === "all").map((tab) => {
      const isAlert = tab.key === "expired" && expiredCt > 0 || tab.key === "expiring_soon" && expiringSoonCt > 0;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setFilterTab(tab.key),
          style: {
            border: "none",
            background: "none",
            padding: "8px 14px",
            fontSize: "0.8125rem",
            fontWeight: filterTab === tab.key ? 600 : 400,
            color: filterTab === tab.key ? isAlert ? "#991b1b" : "#166534" : isAlert ? "#b91c1c" : "#6b7280",
            borderBottom: filterTab === tab.key ? `2px solid ${isAlert ? "#dc2626" : "#166534"}` : "2px solid transparent",
            cursor: "pointer",
            whiteSpace: "nowrap",
            marginBottom: -1
          },
          children: [
            tab.label,
            tab.count > 0 ? ` (${tab.count})` : ""
          ]
        },
        tab.key
      );
    }) }),
    q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 py-8 text-center", children: "Loading..." }) : records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { size: 32, style: { margin: "0 auto 12px", opacity: 0.5 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: "No assurance certificates recorded" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: "Track Red Tractor, LEAF Marque, Organic and other farm assurance certificates here." })
    ] }) : filteredRecords.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { textAlign: "center", padding: "2rem", color: "#9ca3af", fontSize: "0.875rem" }, children: "No certificates match this filter." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Certification Body", "Scheme / Sector", "Cert No.", "Assessor", "Membership No.", "Issue Date", "Expiry", "Next Visit", "Status", "Doc / Portal", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }, children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filteredRecords.map((r, i) => {
        const cs = computeCertStatus(r);
        const isExpired = cs === "expired";
        const isExpiringSoon = cs === "expiring_soon";
        const rowBg = isExpired ? "#fff5f5" : isExpiringSoon ? "#fffdf0" : "#fff";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < filteredRecords.length - 1 ? "1px solid #f3f4f6" : "none", background: rowBg }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", fontWeight: 600 }, children: r.certificationBody }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.sectors || r.scheme || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", fontFamily: r.certNumber ? "monospace" : "inherit" }, children: r.certNumber || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.assessorName || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", fontFamily: r.assessorMembershipNo ? "monospace" : "inherit" }, children: r.assessorMembershipNo || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }, children: fmt(r.issueDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", whiteSpace: "nowrap" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: isExpired ? "#991b1b" : isExpiringSoon ? "#92400e" : "#166534", fontWeight: isExpired || isExpiringSoon ? 600 : 400 }, children: [
            isExpired && "⚠ ",
            isExpiringSoon && "⚡ ",
            fmt(r.expiryDate)
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }, children: fmt(r.nextVisitDue) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CertStatusBadge, { status: r.status, expiryDate: r.expiryDate }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.25rem 0.5rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            DocCell,
            {
              endpoint: `/api/farms/${farmId}/assurance-certs/${r.id}`,
              queryKey: ["assurance-certs", farmId],
              documentPath: r.documentPath ?? null,
              documentName: r.documentName ?? null,
              portalUrl: r.certificationBody?.toLowerCase().includes("red tractor") ? "https://farmershub.redtractor.org.uk" : void 0
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 2, alignItems: "center" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewRecord(r), style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }, title: "View details", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 13 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEdit(r), style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }, title: "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 13 }) }),
            (isExpired || isExpiringSoon) && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openRenew(r), style: { background: "none", border: "none", cursor: "pointer", color: "#16a34a", padding: 4 }, title: "Renew certificate", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 13 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteId(r.id), style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }, title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
          ] }) })
        ] }, r.id);
      }) })
    ] }) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 560 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Assurance Certificate" }) }),
      (() => {
        const r = viewRecord;
        const cs = computeCertStatus(r);
        const isExp = cs === "expired";
        const vfmt = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
        const VF = ({ label, value }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 2 }, children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.875rem", color: value ? "#111827" : "#d1d5db" }, children: value || "—" })
        ] });
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gap: 14 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(VF, { label: "Certification Body", value: r.certificationBody }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(VF, { label: "Scheme / Sector", value: r.sectors || r.scheme })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(VF, { label: "Certificate Number", value: r.certNumber }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 4 }, children: "Effective Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CertStatusBadge, { status: r.status, expiryDate: r.expiryDate })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(VF, { label: "Assessor Name", value: r.assessorName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(VF, { label: "Assessor Membership No.", value: r.assessorMembershipNo })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(VF, { label: "Issue Date", value: vfmt(r.issueDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 2 }, children: "Expiry Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.875rem", fontWeight: isExp ? 600 : 400, color: isExp ? "#991b1b" : "#111827" }, children: [
                isExp ? "⚠ " : "",
                vfmt(r.expiryDate)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(VF, { label: "Next Visit Due", value: vfmt(r.nextVisitDue) })
          ] }),
          r.notes && /* @__PURE__ */ jsxRuntimeExports.jsx(VF, { label: "Notes", value: r.notes }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 4 }, children: "Certificate Document" }),
            r.documentPath ? /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: `/api/storage${r.documentPath}`, target: "_blank", rel: "noopener noreferrer", style: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.875rem", color: "#2563eb", textDecoration: "none" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { size: 14 }),
              r.documentName || "View Certificate"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.875rem", color: "#d1d5db" }, children: "No certificate document attached" })
          ] })
        ] });
      })(),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewRecord(null), children: "Close" }),
        viewRecord && (computeCertStatus(viewRecord) === "expired" || computeCertStatus(viewRecord) === "expiring_soon") && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", style: { color: "#16a34a", borderColor: "#bbf7d0" }, onClick: () => {
          const rec = viewRecord;
          setViewRecord(null);
          openRenew(rec);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 13, className: "mr-1.5" }),
          "Renew"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
          const rec = viewRecord;
          setViewRecord(null);
          openEdit(rec);
        }, children: "Edit Certificate" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen, onOpenChange: (o) => {
      if (!o) closeForm();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 560 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: renewingFrom ? "Renew Certificate" : editRecord ? "Edit Certificate" : "Add Assurance Certificate" }),
        renewingFrom && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8125rem", color: "#6b7280", marginTop: 4 }, children: [
          "Fill in the new certificate details. The previous certificate will be marked as ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Superseded" }),
          " automatically."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Certification Body ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.certificationBody, onValueChange: (v) => setForm((f) => ({ ...f, certificationBody: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: certificationBodies.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: b, children: b }, b)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Scheme / Sector" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.sectors || "__none__", onValueChange: (v) => setForm((f) => ({ ...f, sectors: v === "__none__" ? "" : v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— None —" }),
                CERT_SECTORS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s))
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certificate Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", placeholder: "e.g. RT-CC-2026-001234", value: form.certNumber, onChange: (e) => setForm((f) => ({ ...f, certNumber: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Stored Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status, onValueChange: (v) => setForm((f) => ({ ...f, status: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "active", children: "Active" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pending", children: "Pending" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "suspended", children: "Suspended" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "expired", children: "Expired" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "surrendered", children: "Surrendered" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "superseded", children: "Superseded" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assessor Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", placeholder: "Name of auditor / assessor", value: form.assessorName, onChange: (e) => setForm((f) => ({ ...f, assessorName: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assessor Membership No." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", placeholder: "e.g. FACTS / BASIS no.", value: form.assessorMembershipNo, onChange: (e) => setForm((f) => ({ ...f, assessorMembershipNo: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Issue Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", type: "date", value: form.issueDate, onChange: (e) => setForm((f) => ({ ...f, issueDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expiry Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", type: "date", value: form.expiryDate, onChange: (e) => setForm((f) => ({ ...f, expiryDate: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Visit Due" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", type: "date", value: form.nextVisitDue, onChange: (e) => setForm((f) => ({ ...f, nextVisitDue: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { className: "mt-1", placeholder: "Location of certificate, renewal actions, etc.", value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: closeForm, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveMut.mutate(form), disabled: !form.certificationBody || saveMut.isPending, children: saveMut.isPending ? "Saving…" : renewingFrom ? "Save Renewal" : editRecord ? "Save Changes" : "Add Certificate" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeleteId(null);
        deleteMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Certificate" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "Are you sure you want to remove this certificate record?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteId !== null && deleteMut.mutate(deleteId), disabled: deleteMut.isPending, children: "Delete" })
      ] })
    ] }) })
  ] });
}
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function getCropYearStart() {
  const today = /* @__PURE__ */ new Date();
  const oct1 = new Date(today.getFullYear(), 9, 1);
  return today >= oct1 ? oct1 : new Date(today.getFullYear() - 1, 9, 1);
}
function getCropYearLabel() {
  const start = getCropYearStart();
  const y = start.getFullYear();
  return `${y}/${String(y + 1).slice(2)}`;
}
function ReportSection({ title, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: 32 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { fontSize: "1rem", fontWeight: 700, color: "#166534", fontFamily: "system-ui, sans-serif", margin: "0 0 12px", borderBottom: "2px solid #dcfce7", paddingBottom: 6 }, children: title }),
    children
  ] });
}
function ReportTable({ headers, rows, lastColWide }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { overflowX: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", fontFamily: "system-ui, sans-serif" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f3f4f6" }, children: headers.map((h, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "7px 10px", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }, children: h }, i)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: rows.map((row, ri) => /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { borderBottom: "1px solid #f3f4f6" }, children: row.map((cell, ci) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "7px 10px", color: "#374151", verticalAlign: "top", maxWidth: lastColWide && ci === row.length - 1 ? 260 : void 0 }, children: cell }, ci)) }, ri)) })
  ] }) });
}
function ResultPill({ value }) {
  const map = {
    pass: { bg: "#dcfce7", color: "#166534" },
    conditional_pass: { bg: "#fef3c7", color: "#92400e" },
    fail: { bg: "#fee2e2", color: "#991b1b" },
    pending: { bg: "#f3f4f6", color: "#374151" }
  };
  const s = map[value] ?? { bg: "#f3f4f6", color: "#374151" };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { padding: "2px 8px", borderRadius: 4, background: s.bg, color: s.color, fontSize: "0.75rem", fontWeight: 600, textTransform: "capitalize", whiteSpace: "nowrap" }, children: value.replace(/_/g, " ") });
}
function SeverityPill({ value }) {
  const map = {
    critical: { bg: "#fee2e2", color: "#991b1b" },
    major: { bg: "#fef3c7", color: "#92400e" },
    minor: { bg: "#eff6ff", color: "#1e40af" }
  };
  const s = map[value] ?? { bg: "#f3f4f6", color: "#374151" };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { padding: "2px 7px", borderRadius: 4, background: s.bg, color: s.color, fontSize: "0.72rem", fontWeight: 600, textTransform: "capitalize" }, children: value });
}
function StatusPill({ value }) {
  const map = {
    open: { bg: "#fee2e2", color: "#991b1b" },
    action_raised: { bg: "#fef3c7", color: "#92400e" },
    in_progress: { bg: "#dbeafe", color: "#1e40af" },
    awaiting_verification: { bg: "#fde68a", color: "#78350f" },
    verified: { bg: "#dcfce7", color: "#166534" },
    closed: { bg: "#dcfce7", color: "#166534" }
  };
  const s = map[value] ?? { bg: "#f3f4f6", color: "#374151" };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { padding: "2px 7px", borderRadius: 4, background: s.bg, color: s.color, fontSize: "0.72rem", fontWeight: 600, textTransform: "capitalize", whiteSpace: "nowrap" }, children: value.replace(/_/g, " ") });
}
function ComplianceReportModal({ farmId, onClose }) {
  const farmQ = useQuery({
    queryKey: ["farm-record", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then((r) => r.json())
  });
  const inspQ = useQuery({
    queryKey: ["inspections", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/inspections`).then((r) => r.json()),
    select: (d) => d.records ?? []
  });
  const issuesQ = useQuery({
    queryKey: ["issues-register", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/issues-register`).then((r) => r.json()),
    select: (d) => d.issues ?? []
  });
  const certsQ = useQuery({
    queryKey: ["assurance-certs", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/assurance-certs`).then((r) => r.json()),
    select: (d) => d.records ?? []
  });
  const farm = farmQ.data?.record;
  const allInspections = inspQ.data ?? [];
  const allIssues = issuesQ.data ?? [];
  const allCerts = certsQ.data ?? [];
  const cropYearStart = getCropYearStart();
  const cropYearLabel = getCropYearLabel();
  const cropYearInspections = allInspections.filter((r) => r.inspectionDate && new Date(r.inspectionDate) >= cropYearStart).sort((a, b) => new Date(b.inspectionDate).getTime() - new Date(a.inspectionDate).getTime());
  const outstandingIssues = allIssues.filter((nc) => computeNcStatus(nc) !== "resolved").sort((a, b) => {
    const sevOrder = { critical: 0, major: 1, minor: 2 };
    return (sevOrder[a.severity] ?? 3) - (sevOrder[b.severity] ?? 3);
  });
  const activeCerts = allCerts.filter((c) => {
    const cs = computeCertStatus(c);
    return cs === "active" || cs === "expiring_soon" || cs === "pending";
  });
  const isLoading = farmQ.isLoading || inspQ.isLoading || issuesQ.isLoading || certsQ.isLoading;
  const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const printReport = () => {
    const contentEl = document.getElementById("compliance-report-content");
    if (!contentEl) return;
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Compliance Report — ${today}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #fff; font-family: system-ui, sans-serif; }
    @page { size: A4 portrait; margin: 12mm 15mm; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>${contentEl.innerHTML}</body>
</html>`;
    const win = window.open("", "_blank", "width=980,height=760,toolbar=0,menubar=0,scrollbars=1");
    if (!win) {
      alert("Pop-ups are blocked — please allow pop-ups for this site to open the print dialog.");
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.addEventListener("load", () => {
      win.focus();
      win.addEventListener("afterprint", () => win.close());
      win.print();
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { id: "compliance-report-root", style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, overflow: "auto", padding: "24px 16px 48px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", maxWidth: 920, margin: "0 auto", borderRadius: 12, boxShadow: "0 24px 64px rgba(0,0,0,0.35)", overflow: "hidden" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb", padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 16, style: { color: "#166534" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.875rem", fontWeight: 600, color: "#374151" }, children: "Compliance Report — Preview" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.75rem", color: "#9ca3af" }, children: [
          "· Crop Year ",
          cropYearLabel
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: printReport, disabled: isLoading, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 13, className: "mr-1.5" }),
          "Print / Save PDF"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: onClose, children: "Close" })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "5rem", textAlign: "center", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 28, style: { margin: "0 auto 12px", animation: "spin 1s linear infinite", display: "block" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontFamily: "system-ui, sans-serif", fontSize: "0.875rem" }, children: "Loading report data…" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { id: "compliance-report-content", style: { padding: "40px 48px", fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "0.875rem", color: "#111827", lineHeight: 1.6 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { borderBottom: "3px solid #166534", paddingBottom: 20, marginBottom: 28 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "#9ca3af", fontFamily: "system-ui, sans-serif", marginBottom: 4 }, children: "BDE Farm Trac · Compliance & Inspections Report" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { style: { fontSize: "1.6rem", fontWeight: 700, color: "#111827", margin: "0 0 6px", fontFamily: "system-ui, sans-serif" }, children: farm?.name ?? "—" }),
          farm?.redTractorId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.875rem", fontFamily: "system-ui, sans-serif", color: "#374151" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 600 }, children: "RT Membership ID:" }),
            " ",
            farm.redTractorId
          ] }),
          farm?.address && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.8rem", color: "#6b7280", fontFamily: "system-ui, sans-serif", marginTop: 2 }, children: farm.address })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "right", fontFamily: "system-ui, sans-serif", fontSize: "0.8rem", color: "#6b7280", flexShrink: 0 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 600, color: "#374151", fontSize: "0.875rem" }, children: "Report Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginBottom: 6 }, children: today }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 600, color: "#374151", fontSize: "0.875rem" }, children: "Crop Year" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: cropYearLabel }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginTop: 8, fontSize: "0.68rem", color: "#9ca3af", maxWidth: 160 }, children: "For assessor and compliance body review" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 36, fontFamily: "system-ui, sans-serif" }, children: [
        { label: "Inspections this year", value: cropYearInspections.length, accent: "#166534" },
        { label: "Active certificates", value: activeCerts.length, accent: "#1e40af" },
        { label: "Outstanding issues", value: outstandingIssues.length, accent: outstandingIssues.length > 0 ? "#b91c1c" : "#166534" },
        { label: "Critical / major", value: outstandingIssues.filter((nc) => nc.severity === "critical" || nc.severity === "major").length, accent: outstandingIssues.filter((nc) => nc.severity === "critical" || nc.severity === "major").length > 0 ? "#b91c1c" : "#166534" }
      ].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { border: "1px solid #e5e7eb", borderRadius: 8, padding: "14px 16px", textAlign: "center" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "1.75rem", fontWeight: 700, color: item.accent, lineHeight: 1 }, children: item.value }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.68rem", color: "#6b7280", marginTop: 4 }, children: item.label })
      ] }, item.label)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ReportSection, { title: "1. Assurance Certificates", children: activeCerts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#9ca3af", fontStyle: "italic", fontFamily: "system-ui, sans-serif", fontSize: "0.85rem" }, children: "No active assurance certificates recorded." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        ReportTable,
        {
          headers: ["Certification Body", "Scheme / Sector", "Cert Number", "Status", "Issue Date", "Expiry Date", "Next Visit Due"],
          rows: activeCerts.map((c) => [
            c.certificationBody || "—",
            c.sectors || "—",
            c.certNumber || "—",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { textTransform: "capitalize", fontWeight: computeCertStatus(c) === "expiring_soon" ? 600 : 400, color: computeCertStatus(c) === "expiring_soon" ? "#92400e" : "inherit" }, children: computeCertStatus(c).replace(/_/g, " ") }),
            fmtDate(c.issueDate),
            fmtDate(c.expiryDate),
            fmtDate(c.nextVisitDue)
          ])
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ReportSection, { title: `2. Inspections — Crop Year ${cropYearLabel} (from ${fmtDate(cropYearStart.toISOString())})`, children: cropYearInspections.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#9ca3af", fontStyle: "italic", fontFamily: "system-ui, sans-serif", fontSize: "0.85rem" }, children: "No inspections recorded for the current crop year." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        ReportTable,
        {
          lastColWide: true,
          headers: ["Date", "Type", "Inspector", "Body", "Result", "Summary"],
          rows: cropYearInspections.map((r) => [
            fmtDate(r.inspectionDate),
            r.inspectionType || "—",
            r.inspectorName || "—",
            r.inspectionBody || "—",
            r.overallResult ? /* @__PURE__ */ jsxRuntimeExports.jsx(ResultPill, { value: r.overallResult }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db" }, children: "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.78rem", color: "#6b7280" }, children: r.summary || (r.notes ? r.notes : "—") })
          ])
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(ReportSection, { title: "3. Outstanding Issues Register", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.78rem", color: "#6b7280", fontFamily: "system-ui, sans-serif", marginBottom: 14, fontStyle: "italic" }, children: "All unresolved non-conformances are shown below, regardless of when they were raised. Resolved items are omitted." }),
        outstandingIssues.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "24px", border: "1px solid #dcfce7", borderRadius: 8, background: "#f0fdf4" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 24, style: { color: "#16a34a", margin: "0 auto 8px", display: "block" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#166534", fontWeight: 600, fontFamily: "system-ui, sans-serif", margin: 0 }, children: "No outstanding issues — all non-conformances resolved." })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: 14 }, children: outstandingIssues.map((nc, i) => {
          const computed = computeNcStatus(nc);
          const isCritical = nc.severity === "critical";
          const isMajor = nc.severity === "major";
          const rowBg = isCritical ? "#fef2f2" : isMajor ? "#fffbeb" : "#fafafa";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { border: `1px solid ${isCritical ? "#fecaca" : isMajor ? "#fde68a" : "#e5e7eb"}`, borderRadius: 8, overflow: "hidden" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: rowBg, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontFamily: "system-ui, sans-serif", fontSize: "0.7rem", color: "#9ca3af", marginBottom: 3 }, children: [
                  "NC ",
                  i + 1,
                  "  ·  ",
                  nc.category || "Uncategorised",
                  "  ·  Identified ",
                  fmtDate(nc.identifiedDate),
                  nc.identifiedBy ? ` by ${nc.identifiedBy}` : ""
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontFamily: "system-ui, sans-serif", fontWeight: 600, color: "#111827", fontSize: "0.875rem" }, children: nc.description }),
                nc.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontFamily: "system-ui, sans-serif", fontSize: "0.78rem", color: "#6b7280", marginTop: 4 }, children: nc.notes })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 5, flexShrink: 0 }, children: [
                nc.severity && /* @__PURE__ */ jsxRuntimeExports.jsx(SeverityPill, { value: nc.severity }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { value: computed })
              ] })
            ] }),
            nc.correctiveActions?.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "8px 14px 10px", background: "#fff" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontFamily: "system-ui, sans-serif", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "#9ca3af", marginBottom: 6 }, children: [
                "Corrective Actions (",
                nc.correctiveActions.length,
                ")"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: 4 }, children: nc.correctiveActions.map((ca) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 160px 120px 110px", gap: 8, alignItems: "center", padding: "5px 10px", background: "#f9fafb", borderRadius: 6, fontFamily: "system-ui, sans-serif", fontSize: "0.78rem" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#9ca3af", marginRight: 6 }, children: "→" }),
                  ca.description
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { color: "#6b7280" }, children: ca.assignedTo ? `${ca.assignedTo}` : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db" }, children: "Unassigned" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { color: "#6b7280" }, children: ca.dueDate ? `Due ${fmtDate(ca.dueDate)}` : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db" }, children: "No due date" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { value: ca.status || "open" }) })
              ] }, ca.id)) })
            ] }),
            (!nc.correctiveActions || nc.correctiveActions.length === 0) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: "6px 14px 8px", background: "#fff", fontFamily: "system-ui, sans-serif", fontSize: "0.78rem", color: "#f59e0b" }, children: "⚠ No corrective actions logged for this non-conformance." })
          ] }, nc.id);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 40, paddingTop: 14, borderTop: "1px solid #e5e7eb", fontFamily: "system-ui, sans-serif", fontSize: "0.7rem", color: "#9ca3af", display: "flex", justifyContent: "space-between" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "BDE Farm Trac · bdefarmtrac.co.uk · Barnett Davies Enterprises Ltd." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Generated ",
          today,
          " · For compliance review purposes"
        ] })
      ] })
    ] })
  ] }) });
}
function InspectionsPageFull() {
  const { farmId } = useAppStore();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const urlTab = params.get("tab");
  const urlInspId = params.get("id") ? parseInt(params.get("id"), 10) : void 0;
  const urlCaId = params.get("caId") ? parseInt(params.get("caId"), 10) : void 0;
  const [tab, setTab] = usePersistedTab({ page: "inspections", farmId, validIds: ["inspections", "issues-register", "assurance-certs"], defaultTab: "inspections", urlOverride: urlTab });
  const [reportOpen, setReportOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Inspections & Compliance", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { maxWidth: 1200, margin: "0 auto" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-4 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Track Red Tractor and internal inspections, log non-conformances, manage corrective actions, and record farm assurance certificates." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "shrink-0", onClick: () => setReportOpen(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14, className: "mr-1.5" }),
        "Print Compliance Report"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "inspections", onClick: () => setTab("inspections"), children: "Inspections" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "issues-register", onClick: () => setTab("issues-register"), children: "Issues Register" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "assurance-certs", onClick: () => setTab("assurance-certs"), children: "Assurance Certificates" })
    ] }),
    farmId && tab === "inspections" && /* @__PURE__ */ jsxRuntimeExports.jsx(InspectionsTab, { farmId, openInspId: urlInspId, onSwitchToIssues: () => setTab("issues-register") }),
    farmId && tab === "issues-register" && /* @__PURE__ */ jsxRuntimeExports.jsx(IssuesRegisterTab, { farmId, openCaId: urlCaId }),
    farmId && tab === "assurance-certs" && /* @__PURE__ */ jsxRuntimeExports.jsx(AssuranceCertsTab, { farmId }),
    farmId && reportOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(ComplianceReportModal, { farmId, onClose: () => setReportOpen(false) })
  ] }) });
}
export {
  InspectionsPageFull as default
};
