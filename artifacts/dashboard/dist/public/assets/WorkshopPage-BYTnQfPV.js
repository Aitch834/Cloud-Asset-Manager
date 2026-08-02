import { b as useAppStore, r as reactExports, j as jsxRuntimeExports, R as Redirect, t as useQueryClient, a as useToast, l as useQuery, O as useMutation, d as LoaderCircle, k as cn, c as Button, S as Plus, m as Card, n as CardContent, aZ as CardHeader, a_ as CardTitle, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, I as Input, J as DialogFooter, $ as X, o as Link } from "./index-DjcWYp9D.js";
import { u as useUpload } from "./use-upload-DzWsOrqu.js";
import { Q as QrCode, a as QRCodeSVG } from "./index-CTJ54FWE.js";
import { R as RaiseTaskDialog } from "./RaiseTaskDialog-CuEfNCf8.js";
import { A as AppLayout, U as Users, O as Settings, c as ClipboardList, I as Info, d as Wrench } from "./AppLayout-Bs6sYzMT.js";
import { T as Textarea } from "./textarea-BGqAbjYb.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, e as SelectGroup, f as SelectLabel } from "./select-Ciw4F3uG.js";
import { O as OtherSelect } from "./other-select-0sQXirh1.js";
import { T as TabBar, a as TabButton } from "./tab-button-Du_Fi-nc.js";
import { p as printProReport } from "./print-report-B_FwCCVJ.js";
import { S as StaffSelect } from "./staff-select-Dem2pWp_.js";
import { u as useFarmMembers, m as memberFullName } from "./use-farm-members-R2eZjW1p.js";
import { P as Package } from "./use-safe-clerk-DEOKquCT.js";
import { P as Pencil } from "./pencil-JBQpQmcx.js";
import { T as Trash2, C as ChevronDown } from "./trash-2-CJpL7HSB.js";
import { R as Receipt } from "./receipt-h4hKJDIN.js";
import { P as Printer } from "./printer-DXF6wcRl.js";
import { a as Clock } from "./database-LrDoM_Pi.js";
import { A as ArrowUpFromLine, a as ArrowDownToLine } from "./arrow-up-from-line-m2RsxVNI.js";
import { T as TriangleAlert } from "./triangle-alert-YiyaTuJY.js";
import { C as CircleCheck } from "./circle-check-B_Yf1QtT.js";
import { H as History } from "./history-CMico1IG.js";
import { S as Search } from "./search-BaOeM4x7.js";
import { C as ChevronRight } from "./tractor-C9xKOg09.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, B as Bar, a as LabelList, C as Cell, L as Legend } from "./generateCategoricalChart-BEXPYOHs.js";
import { B as BarChart } from "./BarChart-Bukacs_M.js";
import { C as CartesianGrid } from "./CartesianGrid-BDY5oqSm.js";
import { P as PieChart, a as Pie } from "./PieChart-nUHJUtVN.js";
import { C as ComposedChart } from "./ComposedChart-DbYamWRj.js";
import { L as Line } from "./Line-DVruQrx_.js";
import { E as EyeOff } from "./eye-off-XuW7g3RC.js";
import { E as Eye } from "./eye-BD4YS96V.js";
import { F as FileText } from "./shield-alert-D_CZwyZP.js";
import { U as Upload } from "./upload-DDAv2XhD.js";
import { D as Download } from "./download-Dbc3CJgO.js";
import "./shield-check-DwhYc55e.js";
import "./index-0RfzJYFu.js";
import "./index-DHmdqr34.js";
import "./chevron-up-B__6W0P3.js";
const api = (path) => `/api/${path}`;
function assetNumber(equip) {
  return equip.assetNumber || `EQ-${String(equip.id).padStart(4, "0")}`;
}
const JOB_STATUS = {
  open: { label: "Open", colour: "bg-blue-100 text-blue-700" },
  "in-progress": { label: "In Progress", colour: "bg-amber-100 text-amber-700" },
  "awaiting-parts": { label: "Awaiting Parts", colour: "bg-purple-100 text-purple-700" },
  completed: { label: "Completed", colour: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelled", colour: "bg-gray-100 text-gray-500" }
};
const PRIORITY = {
  low: { label: "Low", colour: "bg-gray-100 text-gray-600" },
  medium: { label: "Medium", colour: "bg-amber-100 text-amber-700" },
  high: { label: "High", colour: "bg-orange-100 text-orange-700" },
  critical: { label: "Critical", colour: "bg-red-100 text-red-700" }
};
function StatusBadge({ value, map }) {
  const s = map[value] ?? { label: value, colour: "bg-gray-100 text-gray-600" };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", s.colour), children: s.label });
}
const WHOLE_UNITS = ["each", "pair", "set", "box", "bag", "roll", "drum", "ibc", "sheet", "tube", "cartridge"];
function qtyStep(unit) {
  return unit && WHOLE_UNITS.includes(unit.toLowerCase()) ? "1" : "0.1";
}
function qtyMin(unit) {
  return unit && WHOLE_UNITS.includes(unit.toLowerCase()) ? "1" : "0.1";
}
function qtyPlaceholder(unit) {
  return unit && WHOLE_UNITS.includes(unit.toLowerCase()) ? "1" : "0.1";
}
const EMPTY_JOB = { jobType: "repair", title: "", priority: "medium", status: "open" };
function JobDocumentsSection({ farmId, jobId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = reactExports.useRef(null);
  const [uploadedBy, setUploadedBy] = reactExports.useState("");
  const [uploadError, setUploadError] = reactExports.useState(null);
  const { data: docs = [], isLoading: docsLoading } = useQuery({
    queryKey: ["job-docs", jobId],
    queryFn: () => fetch(api(`farms/${farmId}/workshop/jobs/${jobId}/documents`), { credentials: "include" }).then((r) => r.json())
  });
  const deleteDoc = useMutation({
    mutationFn: (docId) => fetch(api(`farms/${farmId}/workshop/jobs/${jobId}/documents/${docId}`), { method: "DELETE", credentials: "include" }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["job-docs", jobId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const saveDocMeta = useMutation({
    mutationFn: (body) => fetch(api(`farms/${farmId}/workshop/jobs/${jobId}/documents`), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["job-docs", jobId] });
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: reactExports.useCallback((response) => {
      setUploadError(null);
      saveDocMeta.mutate({
        filename: response.metadata.name,
        storageKey: response.objectPath,
        mimeType: response.metadata.contentType || null,
        fileSizeBytes: response.metadata.size || null,
        uploadedBy: uploadedBy.trim() || ""
      });
    }, [uploadedBy, saveDocMeta]),
    onError: reactExports.useCallback((err) => setUploadError(err.message), [])
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-4 mt-1 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-gray-700 flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 text-gray-500" }),
        "Job Documents & Photos"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Warranty claims, inspection photos, invoices, delivery notes" })
    ] }),
    docsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-3 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-gray-300 mx-auto" }) }) : docs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-4 text-center border-2 border-dashed rounded-lg text-gray-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-6 w-6 mx-auto mb-1 text-gray-300" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", children: "No documents attached yet. Add photos, invoices, or warranty docs below." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: docs.map((doc) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-2 rounded-lg border bg-gray-50 hover:bg-white transition-colors group", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0", children: fileIcon(doc.mimeType) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-gray-900 truncate", children: doc.filename }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400", children: [
          doc.uploadedBy ? `${doc.uploadedBy} · ` : "",
          new Date(doc.uploadedAt).toLocaleDateString("en-GB"),
          doc.fileSizeBytes ? ` · ${fmtFileSize(doc.fileSizeBytes)}` : ""
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "a",
          {
            href: `/api/storage${doc.storageKey}`,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "p-1 text-gray-400 hover:text-blue-600 rounded",
            title: "Open / download",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-3.5 w-3.5" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "p-1 text-gray-400 hover:text-red-500 rounded opacity-0 group-hover:opacity-100",
            title: "Remove",
            onClick: () => deleteDoc.mutate(doc.id),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" })
          }
        )
      ] })
    ] }, doc.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-3 bg-gray-50 rounded-lg border px-3 py-2.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Uploaded By" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-7 text-xs mt-1 w-36", value: uploadedBy, onChange: (e) => setUploadedBy(e.target.value), placeholder: "Your name (optional)" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs", children: [
          "Attach file ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 font-normal", children: "(photo, PDF, Word, Excel)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            ref: fileInputRef,
            type: "file",
            className: "mt-1 block w-full text-xs text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer",
            accept: ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.txt,.heic,.mp4,.mov",
            disabled: isUploading || saveDocMeta.isPending,
            onChange: (e) => {
              const file = e.target.files?.[0];
              if (file) {
                setUploadError(null);
                uploadFile(file);
              }
            }
          }
        )
      ] }),
      isUploading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shrink-0 text-xs text-primary flex items-center gap-1.5 pb-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }),
        progress > 0 ? `${Math.round(progress)}%` : "Uploading…"
      ] }),
      saveDocMeta.isPending && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shrink-0 text-xs text-gray-400 flex items-center gap-1 pb-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }),
        "Saving…"
      ] }),
      uploadError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "shrink-0 text-xs text-red-600 pb-1", children: uploadError })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Photos added via AirDrop to this device will appear in your Downloads — select them using the file picker above." })
  ] });
}
function JobCardsTab({ farmId, openId, initialStatus }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(EMPTY_JOB);
  const [statusFilter, setStatusFilter] = reactExports.useState(initialStatus ?? "all");
  const [raiseTaskFor, setRaiseTaskFor] = reactExports.useState(null);
  const [issuePartId, setIssuePartId] = reactExports.useState("");
  const [issueQty, setIssueQty] = reactExports.useState("");
  const [issueBy, setIssueBy] = reactExports.useState("");
  const { data: membersData, isLoading: membersLoading } = useFarmMembers(farmId);
  const staffNames = (membersData?.members ?? []).map((m) => memberFullName(m));
  const [manualParts, setManualParts] = reactExports.useState([]);
  const [newPart, setNewPart] = reactExports.useState({ name: "", qty: "", cost: "" });
  const [hlId, setHlId] = reactExports.useState(openId ?? null);
  const [pendingLabourEntries, setPendingLabourEntries] = reactExports.useState([]);
  const [newLabourEntry, setNewLabourEntry] = reactExports.useState({ date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), description: "", chargeUnits: "" });
  const [settingsOpen, setSettingsOpen] = reactExports.useState(false);
  const [settingsForm, setSettingsForm] = reactExports.useState({ rate: "", unitMins: "15" });
  const cardRefs = reactExports.useRef(/* @__PURE__ */ new Map());
  const autoOpened = reactExports.useRef(false);
  const editingIdRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    editingIdRef.current = editing?.id ?? null;
  }, [editing]);
  const { data: equipData } = useQuery({
    queryKey: ["equipment", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/equipment`), { credentials: "include" }).then((r) => r.json())
  });
  const { data, isLoading } = useQuery({
    queryKey: ["workshop-jobs", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/workshop/jobs`), { credentials: "include" }).then((r) => r.json())
  });
  reactExports.useEffect(() => {
    if (!data?.jobs || editingIdRef.current === null) return;
    const fresh = data.jobs.find((j) => j.job.id === editingIdRef.current);
    if (!fresh) return;
    setEditing(fresh.job);
    setForm((f) => ({ ...f, partsCostPence: fresh.job.partsCostPence }));
  }, [data?.jobs]);
  const { data: workshopParts = [] } = useQuery({
    queryKey: ["workshop-parts", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/workshop/parts`), { credentials: "include" }).then((r) => r.json()),
    enabled: open && !!editing
  });
  const { data: issuedParts = [] } = useQuery({
    queryKey: ["job-issued-parts", editing?.id],
    queryFn: () => fetch(api(`farms/${farmId}/workshop/jobs/${editing.id}/parts`), { credentials: "include" }).then((r) => r.json()),
    enabled: open && !!editing?.id
  });
  const { data: customersData } = useQuery({
    queryKey: ["farm-customers", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/farm-customers`), { credentials: "include" }).then((r) => r.json())
  });
  const customers = (customersData?.records ?? []).filter((c) => c.isActive);
  const { data: workshopSettings } = useQuery({
    queryKey: ["workshop-settings", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/workshop/settings`), { credentials: "include" }).then((r) => r.json())
  });
  const defaultRate = workshopSettings?.labourRatePence ?? 5e3;
  const unitMins = workshopSettings?.labourChargeUnitMinutes ?? 15;
  const { data: labourEntries = [] } = useQuery({
    queryKey: ["job-labour-entries", editing?.id],
    queryFn: () => fetch(api(`farms/${farmId}/workshop/jobs/${editing.id}/labour`), { credentials: "include" }).then((r) => r.json()),
    enabled: open && !!editing?.id
  });
  const raiseInvoice = useMutation({
    mutationFn: (jobId) => fetch(api(`farms/${farmId}/workshop/jobs/${jobId}/raise-invoice`), {
      method: "POST",
      credentials: "include"
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workshop-jobs", farmId] });
      toast({ title: "Invoice raised", description: "Draft invoice created in Farm Services & Contracting." });
    },
    onError: () => toast({ title: "Failed to raise invoice", variant: "destructive" })
  });
  const selectedIssuePart = workshopParts.find((p) => String(p.id) === issuePartId) ?? null;
  const issueUnit = selectedIssuePart?.unit ?? null;
  const issueIsWhole = WHOLE_UNITS.includes((issueUnit ?? "").toLowerCase());
  const issueStep = qtyStep(issueUnit);
  const issueMin = qtyMin(issueUnit);
  const issuePartsToJob = useMutation({
    mutationFn: () => fetch(api(`farms/${farmId}/workshop/parts/use`), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stockItemId: parseInt(issuePartId), quantity: parseFloat(issueQty), jobId: editing?.id, performedBy: issueBy })
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workshop-parts", farmId] });
      qc.invalidateQueries({ queryKey: ["workshop-jobs", farmId] });
      qc.invalidateQueries({ queryKey: ["job-issued-parts", editing?.id] });
      setIssuePartId("");
      setIssueQty("");
      setIssueBy("");
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const addLabourEntry = useMutation({
    mutationFn: (entry) => fetch(api(`farms/${farmId}/workshop/jobs/${editing.id}/labour`), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(entry) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["job-labour-entries", editing?.id] });
      qc.invalidateQueries({ queryKey: ["workshop-jobs", farmId] });
      setNewLabourEntry({ date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), description: "", chargeUnits: "" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteLabourEntry = useMutation({
    mutationFn: (entryId) => fetch(api(`farms/${farmId}/workshop/jobs/${editing.id}/labour/${entryId}`), { method: "DELETE", credentials: "include" }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["job-labour-entries", editing?.id] });
      qc.invalidateQueries({ queryKey: ["workshop-jobs", farmId] });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const saveWorkshopSettings = useMutation({
    mutationFn: (s) => fetch(api(`farms/${farmId}/workshop/settings`), { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workshop-settings", farmId] });
      setSettingsOpen(false);
      toast({ title: "Workshop settings saved" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const save = useMutation({
    mutationFn: async (body) => {
      const { labourHours: _lh, labourCostPence: _lcp, ...cleanBody } = body;
      if (editing) {
        await fetch(api(`farms/${farmId}/workshop/jobs/${editing.id}`), { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cleanBody) });
        for (const e of pendingLabourEntries) {
          await fetch(api(`farms/${farmId}/workshop/jobs/${editing.id}/labour`), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entryDate: e.date, description: e.description, chargeUnits: e.chargeUnits, ratePence: e.ratePence }) });
        }
      } else {
        const res = await fetch(api(`farms/${farmId}/workshop/jobs`), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cleanBody) });
        const newJob = await res.json();
        if (newJob?.id && pendingLabourEntries.length > 0) {
          for (const e of pendingLabourEntries) {
            await fetch(api(`farms/${farmId}/workshop/jobs/${newJob.id}/labour`), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entryDate: e.date, description: e.description, chargeUnits: e.chargeUnits, ratePence: e.ratePence }) });
          }
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workshop-jobs", farmId] });
      setOpen(false);
      setEditing(null);
      setForm(EMPTY_JOB);
      setPendingLabourEntries([]);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/workshop/jobs/${id}`), { method: "DELETE", credentials: "include" }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workshop-jobs", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditing(null);
    setForm(EMPTY_JOB);
    setOpen(true);
    setManualParts([]);
    setNewPart({ name: "", qty: "", cost: "" });
    setPendingLabourEntries([]);
    setNewLabourEntry({ date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), description: "", chargeUnits: "" });
  }
  function openEdit(j) {
    setEditing(j);
    setForm({ ...j, openedAt: j.openedAt?.slice(0, 10), estimatedCompletionDate: j.estimatedCompletionDate?.slice(0, 10), completedAt: j.completedAt?.slice(0, 10) });
    setOpen(true);
    setManualParts([]);
    setNewPart({ name: "", qty: "", cost: "" });
    setPendingLabourEntries([]);
    setNewLabourEntry({ date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), description: "", chargeUnits: "" });
  }
  function printBlankJobCard() {
    const win = window.open("", "_blank", "width=860,height=1100");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Job Card</title><style>
      body{font-family:Arial,sans-serif;font-size:12px;margin:0;padding:24px;color:#111;}
      h1{font-size:18px;margin:0 0 4px;}
      .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #111;padding-bottom:12px;margin-bottom:16px;}
      .logo{font-size:22px;font-weight:bold;color:#1a6b3a;}
      .meta{text-align:right;font-size:11px;color:#555;}
      .row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:12px;}
      .row3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:12px;}
      .field{border:1px solid #ccc;border-radius:4px;padding:6px 8px;min-height:28px;}
      label{display:block;font-size:10px;font-weight:bold;text-transform:uppercase;letter-spacing:0.05em;color:#555;margin-bottom:3px;}
      .section{border:1px solid #ccc;border-radius:6px;padding:10px 12px;margin-bottom:14px;}
      .section-title{font-size:10px;font-weight:bold;text-transform:uppercase;letter-spacing:0.06em;color:#777;margin-bottom:8px;}
      .desc{min-height:56px;}
      .notes{min-height:48px;}
      .cost-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
      .cost-box{border:2px solid #ccc;border-radius:6px;padding:8px 10px;text-align:center;}
      .cost-box.total{border-color:#1a6b3a;background:#f0faf4;}
      .cost-label{font-size:9px;font-weight:bold;text-transform:uppercase;color:#777;margin-bottom:4px;}
      .cost-value{font-size:16px;font-weight:bold;color:#111;}
      .cost-box.total .cost-value{color:#1a6b3a;}
      .parts-table{width:100%;border-collapse:collapse;font-size:11px;}
      .parts-table th{background:#f5f5f5;font-size:10px;font-weight:bold;text-transform:uppercase;padding:5px 8px;border:1px solid #ddd;text-align:left;}
      .parts-table td{border:1px solid #ddd;padding:6px 8px;height:22px;}
      .sig-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-top:16px;}
      .sig-box{border-top:1px solid #555;padding-top:6px;font-size:10px;color:#555;}
      @media print{body{padding:12px;} button{display:none;}}
    </style></head><body>
      <div class="header">
        <div>
          <div class="logo">BDE Farm Trac</div>
          <h1 style="margin-top:8px;">Workshop Job Card</h1>
        </div>
        <div class="meta">
          <div>Job No: _______________</div>
          <div style="margin-top:4px;">Date Opened: _______________</div>
          <div style="margin-top:4px;">Priority: □ Low &nbsp; □ Medium &nbsp; □ High &nbsp; □ Critical</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Job Details</div>
        <div style="margin-bottom:10px;">
          <label>Job Title</label><div class="field">&nbsp;</div>
        </div>
        <div class="row">
          <div><label>Job Type</label><div class="field">&nbsp;</div></div>
          <div><label>Equipment / Asset</label><div class="field">&nbsp;</div></div>
        </div>
        <div style="margin-bottom:10px;">
          <label>Description of Fault / Work Required</label><div class="field desc">&nbsp;</div>
        </div>
        <div>
          <label>Root Cause</label><div class="field">&nbsp;</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Assignment &amp; Schedule</div>
        <div class="row">
          <div><label>Status</label><div class="field">&nbsp;</div></div>
          <div><label>Customer (if off-farm)</label><div class="field">&nbsp;</div></div>
        </div>
        <div class="row3">
          <div><label>Reported By</label><div class="field">&nbsp;</div></div>
          <div><label>Assigned To</label><div class="field">&nbsp;</div></div>
          <div><label>Est. Completion Date</label><div class="field">&nbsp;</div></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Labour</div>
        <div class="row3">
          <div><label>Hours Worked</label><div class="field">&nbsp;</div></div>
          <div><label>Labour Cost (£)</label><div class="field">&nbsp;</div></div>
          <div><label>Technician</label><div class="field">&nbsp;</div></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Parts Used</div>
        <table class="parts-table">
          <thead>
            <tr><th>Part Name / Description</th><th>Part No.</th><th style="width:60px;text-align:center;">Qty</th><th style="width:80px;text-align:right;">Unit Cost</th><th style="width:80px;text-align:right;">Total</th></tr>
          </thead>
          <tbody>
            ${Array(6).fill("<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>").join("")}
          </tbody>
        </table>
        <div style="margin-top:8px;"><label>Additional Parts Notes</label><div class="field notes">&nbsp;</div></div>
      </div>

      <div class="section">
        <div class="section-title">Cost Summary</div>
        <div class="cost-grid">
          <div class="cost-box"><div class="cost-label">Labour</div><div class="cost-value">£ ________</div></div>
          <div class="cost-box"><div class="cost-label">Parts (Stock)</div><div class="cost-value">£ ________</div></div>
          <div class="cost-box"><div class="cost-label">Parts (External)</div><div class="cost-value">£ ________</div></div>
          <div class="cost-box total"><div class="cost-label">Grand Total</div><div class="cost-value">£ ________</div></div>
        </div>
      </div>

      <div><label>Notes / Comments</label><div class="field notes">&nbsp;</div></div>

      <div class="sig-row">
        <div class="sig-box">Technician Signature</div>
        <div class="sig-box">Authorised By</div>
        <div class="sig-box">Date Completed</div>
      </div>

      <script>window.onload = function(){ window.print(); window.addEventListener("afterprint", function(){ window.close(); }); };<\/script>
    </body></html>`);
    win.document.close();
  }
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  const equipment = equipData?.records ?? [];
  const allJobs = data?.jobs ?? [];
  const filtered = statusFilter === "all" ? allJobs : allJobs.filter((j) => j.job.status === statusFilter);
  reactExports.useEffect(() => {
    if (!openId || autoOpened.current || allJobs.length === 0) return;
    if (allJobs.some((j) => j.job.id === openId)) {
      autoOpened.current = true;
      const jobData = allJobs.find((j) => j.job.id === openId);
      if (jobData) {
        setEditing(jobData.job);
        setForm(jobData.job);
        setOpen(true);
      }
      setTimeout(() => {
        cardRefs.current.get(openId)?.scrollIntoView({ behavior: "smooth", block: "center" });
        const t = setTimeout(() => setHlId(null), 4e3);
        return () => clearTimeout(t);
      }, 200);
    }
  }, [openId, allJobs]);
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-12 text-center text-gray-400", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin mx-auto" }) });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 flex-wrap", children: ["all", "open", "in-progress", "awaiting-parts", "completed"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setStatusFilter(s),
          className: cn(
            "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
            statusFilter === s ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
          ),
          children: s === "all" ? "All Jobs" : JOB_STATUS[s]?.label
        },
        s
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "px-2 text-gray-500 hover:text-gray-700", title: "Workshop settings", onClick: () => {
          setSettingsForm({ rate: (defaultRate / 100).toFixed(2), unitMins: String(unitMins) });
          setSettingsOpen(true);
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
          "New Job"
        ] })
      ] })
    ] }),
    filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-8 text-center text-gray-400 text-sm", children: 'No job cards found. Log a repair or service with "New Job".' }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4", children: filtered.map(({ job, equipmentName, assetNumber: an, customerName, invoiceNumber }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { ref: (el) => {
      if (el) cardRefs.current.set(job.id, el);
    }, className: `transition-shadow${hlId === job.id ? " ring-2 ring-amber-400 bg-amber-50 shadow-md" : " hover:shadow-md"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2 pt-4 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-mono text-gray-400", children: job.jobNumber }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm mt-0.5 leading-snug", children: job.title })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 w-7 p-0", onClick: () => openEdit(job), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 w-7 p-0 text-red-500", onClick: () => del.mutate(job.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) }),
          job.status === "awaiting-parts" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 w-7 p-0 text-purple-600", onClick: () => setRaiseTaskFor(job), title: "Raise Task — awaiting parts", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "h-3.5 w-3.5" }) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "px-4 pb-4 space-y-2", children: [
        equipmentName && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500", children: [
          an ? `${an} — ` : "",
          equipmentName
        ] }),
        customerName && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-medium text-amber-700 flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3 w-3" }),
          "For: ",
          customerName
        ] }),
        job.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600 line-clamp-2", children: job.description }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-wrap pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: job.status, map: JOB_STATUS }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { value: job.priority, map: PRIORITY }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 capitalize", children: job.jobType })
        ] }),
        job.assignedTo && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400", children: [
          "Assigned: ",
          job.assignedTo
        ] }),
        job.estimatedCompletionDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400", children: [
          "Due: ",
          new Date(job.estimatedCompletionDate).toLocaleDateString("en-GB")
        ] }),
        job.labourHours != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400", children: [
          "Labour: ",
          job.labourHours,
          " hrs"
        ] }),
        job.status === "completed" && job.customerId && !job.serviceInvoiceId && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            variant: "outline",
            className: "w-full mt-1 h-7 text-xs border-amber-300 text-amber-700 hover:bg-amber-50",
            onClick: () => raiseInvoice.mutate(job.id),
            disabled: raiseInvoice.isPending,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-3.5 w-3.5 mr-1" }),
              raiseInvoice.isPending ? "Raising…" : "Raise Invoice"
            ]
          }
        ),
        job.serviceInvoiceId && invoiceNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mt-1 px-2 py-1 rounded bg-green-50 border border-green-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-3.5 w-3.5 text-green-600 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-green-700 font-medium", children: [
            "Invoice ",
            invoiceNumber,
            " raised"
          ] })
        ] })
      ] })
    ] }, job.id)) }),
    raiseTaskFor && /* @__PURE__ */ jsxRuntimeExports.jsx(
      RaiseTaskDialog,
      {
        farmId,
        open: !!raiseTaskFor,
        onClose: () => setRaiseTaskFor(null),
        defaultTitle: `Parts Chase — ${raiseTaskFor.title ?? "Workshop Job"}`,
        defaultDescription: `Job ${raiseTaskFor.jobNumber ?? ""} is awaiting parts${raiseTaskFor.equipmentName ? ` for ${raiseTaskFor.equipmentName}` : ""}. Assigned: ${raiseTaskFor.assignedTo ?? "—"}`,
        module: "workshop"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: settingsOpen, onOpenChange: setSettingsOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-4 w-4" }),
        "Workshop Labour Settings"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Labour Rate (£/hr)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm", children: "£" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", className: "pl-6", value: settingsForm.rate, onChange: (e) => setSettingsForm((s) => ({ ...s, rate: e.target.value })), placeholder: "50.00" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Hourly rate charged for workshop labour" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Charge Unit (minutes)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "1", min: "1", max: "60", className: "mt-1", value: settingsForm.unitMins, onChange: (e) => setSettingsForm((s) => ({ ...s, unitMins: e.target.value })), placeholder: "15" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Labour is billed in multiples of this unit (e.g. 15 = quarter-hour billing)" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setSettingsOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => {
              const ratePence = Math.round(parseFloat(settingsForm.rate) * 100);
              const mins = parseInt(settingsForm.unitMins);
              if (isNaN(ratePence) || ratePence <= 0 || isNaN(mins) || mins <= 0) return;
              saveWorkshopSettings.mutate({ labourRatePence: ratePence, labourChargeUnitMinutes: mins });
            },
            disabled: saveWorkshopSettings.isPending,
            children: saveWorkshopSettings.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : "Save"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "68rem" }, className: "flex flex-col p-0 gap-0 max-h-[92vh]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-4 border-b flex items-center justify-between shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "text-base font-semibold", children: editing ? `Edit ${editing.jobNumber}` : "New Job Card" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", className: "text-xs gap-1.5 text-gray-500 hover:text-gray-700", onClick: printBlankJobCard, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-3.5 w-3.5" }),
          "Print Blank Card"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-y-auto flex-1 px-6 py-4 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-6 pb-4 border-b", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-semibold text-gray-400 uppercase tracking-wider", children: "Job Details" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Job Title *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.title || "", onChange: (e) => set("title", e.target.value), placeholder: "e.g. Replace front tyre — JD 6175R" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Job Type" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.jobType || "repair", onValueChange: (v) => set("jobType", v), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "repair", children: "Repair" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "service", children: "Scheduled Service" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "inspection", children: "Inspection" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "commissioning", children: "Commissioning" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "investigation", children: "Investigation" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "modification", children: "Modification" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Priority" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.priority || "medium", onValueChange: (v) => set("priority", v), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "low", children: "Low" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "medium", children: "Medium" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "high", children: "High" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "critical", children: "Critical" })
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Equipment" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.equipmentId ? String(form.equipmentId) : "", onValueChange: (v) => set("equipmentId", v ? parseInt(v) : null), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select equipment…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: equipment.map((eq) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(eq.id), children: [
                  assetNumber(eq),
                  " — ",
                  eq.name
                ] }, eq.id)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.description || "", onChange: (e) => set("description", e.target.value), rows: 3, placeholder: "Describe the fault or work required" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Root Cause" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.rootCause || "", onChange: (e) => set("rootCause", e.target.value), placeholder: "e.g. Impact damage, normal wear, operator error" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-semibold text-gray-400 uppercase tracking-wider", children: "Assignment & Schedule" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status || "open", onValueChange: (v) => set("status", v), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.entries(JOB_STATUS).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: v.label }, k)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3.5 w-3.5 text-amber-600" }),
                "Customer ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 font-normal ml-1", children: "(off-farm / external job)" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.customerId ? String(form.customerId) : "none", onValueChange: (v) => set("customerId", v !== "none" ? parseInt(v) : null), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "None — internal job" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "None — internal job" }),
                  customers.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(c.id), children: c.name }, c.id))
                ] })
              ] }),
              form.customerId && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-700 mt-1.5 flex items-start gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-3.5 w-3.5 mt-0.5 shrink-0" }),
                "When the job is marked ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Completed" }),
                ", a “Raise Invoice” button appears — this creates a draft invoice in Farm Services & Contracting."
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reported By" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.reportedBy || "", onChange: (e) => set("reportedBy", e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assigned To" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.assignedTo || "", onChange: (e) => set("assignedTo", e.target.value) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Opened Date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: form.openedAt?.slice(0, 10) || "", onChange: (e) => set("openedAt", e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Est. Completion" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.estimatedCompletionDate || "", onChange: (e) => set("estimatedCompletionDate", e.target.value) })
              ] })
            ] }),
            (form.status === "completed" || form.status === "cancelled") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Completed Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: form.completedAt || "", onChange: (e) => set("completedAt", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes || "", onChange: (e) => set("notes", e.target.value), rows: 3 })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-gray-200 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3.5 w-3.5" }),
              "Labour"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-400", children: [
                "£",
                (defaultRate / 100).toFixed(2),
                "/hr · ",
                unitMins,
                "-min units"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
                setSettingsForm({ rate: (defaultRate / 100).toFixed(2), unitMins: String(unitMins) });
                setSettingsOpen(true);
              }, className: "text-xs text-primary hover:underline", children: "Change" })
            ] })
          ] }),
          (editing ? labourEntries : pendingLabourEntries).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs border-collapse", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-gray-50 text-gray-500 border-b border-gray-200", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-2 py-1.5 font-medium", children: "Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-2 py-1.5 font-medium", children: "Description" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-2 py-1.5 font-medium", children: "Units" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-2 py-1.5 font-medium", children: "Hours" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-2 py-1.5 font-medium", children: "Rate" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-2 py-1.5 font-medium", children: "Cost" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "w-6" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: editing ? labourEntries.map((e) => {
              const hrs = (e.chargeUnits * unitMins / 60).toFixed(2);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-100 hover:bg-gray-50", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1.5 whitespace-nowrap", children: (/* @__PURE__ */ new Date(e.entryDate + "T00:00:00")).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1.5 text-gray-600 max-w-[140px] truncate", children: e.description || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-300 italic", children: "—" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1.5 text-right", children: e.chargeUnits }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1.5 text-right text-gray-500", children: hrs }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-2 py-1.5 text-right text-gray-500 whitespace-nowrap", children: [
                  "£",
                  (e.ratePence / 100).toFixed(2),
                  "/hr"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-2 py-1.5 text-right font-semibold", children: [
                  "£",
                  (e.costPence / 100).toFixed(2)
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1.5 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => deleteLabourEntry.mutate(e.id), className: "text-gray-300 hover:text-red-500 transition-colors", disabled: deleteLabourEntry.isPending, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" }) }) })
              ] }, e.id);
            }) : pendingLabourEntries.map((e) => {
              const hrs = (e.chargeUnits * unitMins / 60).toFixed(2);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-100 hover:bg-gray-50", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1.5 whitespace-nowrap", children: (/* @__PURE__ */ new Date(e.date + "T00:00:00")).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1.5 text-gray-600 max-w-[140px] truncate", children: e.description || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-300 italic", children: "—" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1.5 text-right", children: e.chargeUnits }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1.5 text-right text-gray-500", children: hrs }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-2 py-1.5 text-right text-gray-500 whitespace-nowrap", children: [
                  "£",
                  (e.ratePence / 100).toFixed(2),
                  "/hr"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-2 py-1.5 text-right font-semibold", children: [
                  "£",
                  (e.costPence / 100).toFixed(2)
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1.5 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setPendingLabourEntries((ps) => ps.filter((x) => x.id !== e.id)), className: "text-gray-300 hover:text-red-500 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" }) }) })
              ] }, e.id);
            }) }),
            (() => {
              const allEntries = editing ? labourEntries : pendingLabourEntries;
              const totalUnits = allEntries.reduce((s, e) => s + e.chargeUnits, 0);
              const totalHrs = (totalUnits * unitMins / 60).toFixed(2);
              const totalCost = allEntries.reduce((s, e) => s + e.costPence, 0);
              return /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t-2 border-gray-300 bg-gray-50 font-semibold", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1.5 text-xs", colSpan: 2, children: "Total" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1.5 text-right text-xs", children: totalUnits }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1.5 text-right text-xs", children: totalHrs }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", {}),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-2 py-1.5 text-right text-sm font-bold", children: [
                  "£",
                  (totalCost / 100).toFixed(2)
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", {})
              ] }) });
            })()
          ] }) }),
          editing && labourEntries.length === 0 && (form.labourCostPence ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1.5 mb-3", children: [
            "Legacy labour cost: £",
            ((form.labourCostPence ?? 0) / 100).toFixed(2),
            " — add line items below to replace."
          ] }),
          (() => {
            const units = parseInt(newLabourEntry.chargeUnits);
            const previewCost = !isNaN(units) && units > 0 ? (units * defaultRate * unitMins / 60 / 100).toFixed(2) : null;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-end flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-36", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] text-gray-400 mb-1", children: "Date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "h-8 text-xs", value: newLabourEntry.date, onChange: (e) => setNewLabourEntry((x) => ({ ...x, date: e.target.value })) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-[120px]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] text-gray-400 mb-1", children: "Description (optional)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-xs", value: newLabourEntry.description, onChange: (e) => setNewLabourEntry((x) => ({ ...x, description: e.target.value })), placeholder: "e.g. Diagnosis, repair" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-28", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-[11px] text-gray-400 mb-1", children: [
                  "Units ×",
                  unitMins,
                  "min"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", step: "1", className: "h-8 text-xs", value: newLabourEntry.chargeUnits, onChange: (e) => setNewLabourEntry((x) => ({ ...x, chargeUnits: e.target.value })), placeholder: "4 = 1hr" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-2 pb-0.5", children: [
                previewCost !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-400 whitespace-nowrap", children: [
                  "= £",
                  previewCost
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    type: "button",
                    size: "sm",
                    variant: "outline",
                    className: "h-8 text-xs gap-1 shrink-0",
                    disabled: !newLabourEntry.chargeUnits || parseInt(newLabourEntry.chargeUnits) <= 0 || addLabourEntry.isPending,
                    onClick: () => {
                      const units2 = parseInt(newLabourEntry.chargeUnits);
                      if (isNaN(units2) || units2 <= 0) return;
                      if (editing) {
                        addLabourEntry.mutate({ entryDate: newLabourEntry.date, description: newLabourEntry.description, chargeUnits: units2, ratePence: defaultRate });
                      } else {
                        const cost = Math.round(units2 * defaultRate * unitMins / 60);
                        setPendingLabourEntries((ps) => [...ps, { id: crypto.randomUUID(), date: newLabourEntry.date, description: newLabourEntry.description, chargeUnits: units2, ratePence: defaultRate, costPence: cost }]);
                        setNewLabourEntry({ date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), description: "", chargeUnits: "" });
                      }
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
                      "Add"
                    ]
                  }
                )
              ] })
            ] });
          })()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-gray-200 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-3.5 w-3.5" }),
            "Parts"
          ] }),
          editing && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            workshopParts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-blue-100 bg-blue-50/40 p-3 mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpFromLine, { className: "h-3.5 w-3.5" }),
                "Issue from Stock"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[1fr_auto_auto] gap-2 items-end", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: issuePartId, onValueChange: (v) => {
                  setIssuePartId(v);
                  setIssueQty("");
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select part…" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: workshopParts.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(p.id), children: [
                    p.name,
                    " — ",
                    parseFloat(p.currentQuantity),
                    " ",
                    p.unit ?? "",
                    " in stock"
                  ] }, p.id)) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-xs w-24", type: "number", step: issueStep, min: issueMin, value: issueQty, onChange: (e) => setIssueQty(e.target.value), placeholder: issueIsWhole ? "1" : "0.1" }),
                  issueUnit && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground whitespace-nowrap", children: issueUnit })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "h-8 text-xs", onClick: () => issuePartsToJob.mutate(), disabled: !issuePartId || !issueQty || issuePartsToJob.isPending, children: issuePartsToJob.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpFromLine, { className: "h-3.5 w-3.5 mr-1" }),
                  "Issue"
                ] }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSelect, { value: issueBy, onChange: setIssueBy, staffNames, loading: membersLoading }) })
            ] }),
            issuedParts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 italic mb-3", children: "No parts issued from stock yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-auto rounded border border-gray-100 mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-gray-50 text-gray-500", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-2 py-1.5 font-medium", children: "Part" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-2 py-1.5 font-medium", children: "Qty" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-2 py-1.5 font-medium", children: form.customerId ? "Unit Price" : "Unit Cost" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-2 py-1.5 font-medium", children: "Line Total" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-2 py-1.5 font-medium", children: "Issued By" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-2 py-1.5 font-medium", children: "Date" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-gray-100", children: issuedParts.map((ip) => {
                const qty = Math.abs(parseFloat(ip.quantityChange));
                const ipPrice = form.customerId ? ip.unitSellPricePence ?? ip.unitCostPence : ip.unitCostPence;
                const lineTotal = ipPrice != null ? ipPrice * qty : null;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50/60", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-2 py-1.5 font-medium text-gray-800", children: [
                    ip.partName,
                    ip.productCode && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-gray-400", children: [
                      "(",
                      ip.productCode,
                      ")"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-2 py-1.5 text-right text-gray-700", children: [
                    qty,
                    " ",
                    ip.unit ?? ""
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1.5 text-right text-gray-500", children: ipPrice != null ? `£${(ipPrice / 100).toFixed(2)}` : "—" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1.5 text-right font-medium text-gray-800", children: lineTotal != null ? `£${(lineTotal / 100).toFixed(2)}` : "—" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1.5 text-gray-500", children: ip.performedBy || "—" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1.5 text-gray-500 whitespace-nowrap", children: new Date(ip.movedAt).toLocaleDateString("en-GB") })
                ] }, ip.id);
              }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t-2 border-gray-200 bg-gray-50", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 3, className: "px-2 py-1.5 text-xs font-semibold text-gray-600 text-right", children: "Stock parts total:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-2 py-1.5 text-right text-xs font-bold text-gray-900", children: [
                  "£",
                  (issuedParts.reduce((sum, ip) => {
                    const qty = Math.abs(parseFloat(ip.quantityChange));
                    const p = form.customerId ? ip.unitSellPricePence ?? ip.unitCostPence : ip.unitCostPence;
                    return sum + (p != null ? p * qty : 0);
                  }, 0) / 100).toFixed(2)
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 2 })
              ] }) })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-gray-200 bg-gray-50/40 p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-gray-600 mb-2", children: [
              editing ? "External / Purchased Parts" : "Parts",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-normal text-gray-400 ml-1", children: "(externally sourced — not from stock)" })
            ] }),
            !editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-700 mb-2 flex items-start gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3.5 w-3.5 mt-0.5 shrink-0" }),
              "Issue from Stock is available after saving the job card. Add parts you plan to use here now."
            ] }),
            manualParts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-auto rounded border border-gray-100 mb-2 bg-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-gray-50 text-gray-500", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-2 py-1.5 font-medium", children: "Part Name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-2 py-1.5 font-medium", children: "Qty" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-2 py-1.5 font-medium", children: "Unit Cost (£)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-2 py-1.5 font-medium", children: "Line Total" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "w-8" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-gray-100", children: manualParts.map((p) => {
                const qty = parseFloat(p.qty) || 0;
                const cost = parseFloat(p.cost) || 0;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50/60", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1.5", children: p.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1.5 text-right", children: qty || "—" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1.5 text-right", children: cost ? `£${cost.toFixed(2)}` : "—" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1.5 text-right font-medium", children: qty && cost ? `£${(qty * cost).toFixed(2)}` : "—" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1.5 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setManualParts((ps) => ps.filter((x) => x.id !== p.id)), className: "text-gray-300 hover:text-red-500 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" }) }) })
                ] }, p.id);
              }) }),
              manualParts.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t-2 border-gray-200 bg-gray-50", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 3, className: "px-2 py-1.5 text-xs font-semibold text-gray-600 text-right", children: "External total:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-2 py-1.5 text-right text-xs font-bold", children: [
                  "£",
                  manualParts.reduce((s, p) => s + (parseFloat(p.qty) || 0) * (parseFloat(p.cost) || 0), 0).toFixed(2)
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", {})
              ] }) })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[2fr_1fr_1fr_auto] gap-2 items-end", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-gray-500", children: "Part Name / Description" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-xs", value: newPart.name, onChange: (e) => setNewPart((p) => ({ ...p, name: e.target.value })), placeholder: "e.g. Front tyre 480/70 R30", onKeyDown: (e) => {
                  if (e.key === "Enter" && newPart.name.trim()) {
                    setManualParts((ps) => [...ps, { id: crypto.randomUUID(), ...newPart }]);
                    setNewPart({ name: "", qty: "", cost: "" });
                  }
                } })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-gray-500", children: "Qty" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-xs", type: "number", step: "1", min: "0", value: newPart.qty, onChange: (e) => setNewPart((p) => ({ ...p, qty: e.target.value })), placeholder: "1" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-gray-500", children: "Unit Cost (£)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-xs", type: "number", step: "0.01", min: "0", value: newPart.cost, onChange: (e) => setNewPart((p) => ({ ...p, cost: e.target.value })), placeholder: "0.00" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", size: "sm", variant: "outline", className: "h-8 text-xs gap-1", disabled: !newPart.name.trim(), onClick: () => {
                if (!newPart.name.trim()) return;
                setManualParts((ps) => [...ps, { id: crypto.randomUUID(), ...newPart }]);
                setNewPart({ name: "", qty: "", cost: "" });
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
                "Add"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Parts Notes ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 font-normal", children: "(free-text — sourcing details, order refs, etc.)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.partsUsed || "", onChange: (e) => set("partsUsed", e.target.value), rows: 2, placeholder: "e.g. Sourced from dealer, delivery 3–5 days — order ref AG2025-441" })
          ] })
        ] }),
        (() => {
          const allLabourEntries = editing ? labourEntries : pendingLabourEntries;
          const labourPence = allLabourEntries.length > 0 ? allLabourEntries.reduce((s, e) => s + e.costPence, 0) : editing ? form.labourCostPence ?? 0 : 0;
          const stockPence = editing ? issuedParts.reduce((sum, ip) => {
            const qty = Math.abs(parseFloat(ip.quantityChange));
            const p = form.customerId ? ip.unitSellPricePence ?? ip.unitCostPence : ip.unitCostPence;
            return sum + (p != null ? p * qty : 0);
          }, 0) : 0;
          const externalPence = Math.round(manualParts.reduce((s, p) => s + (parseFloat(p.qty) || 0) * (parseFloat(p.cost) || 0) * 100, 0));
          const editExtraPence = editing ? Math.max(0, (form.partsCostPence ?? 0) - stockPence) : 0;
          const partsPence = stockPence + externalPence + editExtraPence;
          const grandPence = labourPence + partsPence;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border-2 border-gray-200 bg-gray-50/50 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3", children: "Cost Summary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-4 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg border p-3 text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-semibold text-gray-400 uppercase mb-1.5", children: "Labour" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xl font-bold text-gray-900", children: [
                  "£",
                  (labourPence / 100).toFixed(2)
                ] }),
                allLabourEntries.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400 mt-0.5", children: [
                  (allLabourEntries.reduce((s, e) => s + e.chargeUnits, 0) * unitMins / 60).toFixed(1),
                  " hrs"
                ] }) : editing && (form.labourCostPence ?? 0) > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-500 mt-0.5", children: "legacy" }) : null
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg border p-3 text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-semibold text-gray-400 uppercase mb-1.5", children: "Parts (Stock)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xl font-bold text-gray-900", children: [
                  "£",
                  (stockPence / 100).toFixed(2)
                ] }),
                !editing && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-300 mt-0.5", children: "available after saving" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg border p-3 text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-semibold text-gray-400 uppercase mb-1.5", children: "Parts (External)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xl font-bold text-gray-900", children: [
                  "£",
                  ((externalPence + editExtraPence) / 100).toFixed(2)
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-primary/5 rounded-lg border-2 border-primary/30 p-3 text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-semibold text-primary/70 uppercase mb-1.5", children: "Grand Total" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-primary", children: [
                  "£",
                  (grandPence / 100).toFixed(2)
                ] })
              ] })
            ] })
          ] });
        })(),
        editing && /* @__PURE__ */ jsxRuntimeExports.jsx(JobDocumentsSection, { farmId, jobId: editing.id }),
        !editing && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 text-center pb-1", children: "Save the job card first to attach photos, documents, and issue parts from stock." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-4 border-t flex items-center shrink-0", children: [
        editing && editing.status === "completed" && editing.customerId && !editing.serviceInvoiceId && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            className: "gap-1.5 text-amber-700 border-amber-300 hover:bg-amber-50 mr-auto",
            onClick: () => {
              raiseInvoice.mutate(editing.id);
              setOpen(false);
            },
            disabled: raiseInvoice.isPending,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-4 w-4" }),
              raiseInvoice.isPending ? "Raising…" : "Raise Invoice"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 ml-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              onClick: () => {
                const submitForm = { ...form };
                if (manualParts.length > 0) {
                  const partsText = manualParts.map((p) => `${p.name}${p.qty ? ` ×${parseFloat(p.qty)}` : ""}${p.cost ? ` @ £${parseFloat(p.cost).toFixed(2)}` : ""}`).join("\n");
                  const manualPence = Math.round(manualParts.reduce((s, p) => s + (parseFloat(p.qty) || 0) * (parseFloat(p.cost) || 0) * 100, 0));
                  submitForm.partsUsed = [partsText, form.partsUsed].filter(Boolean).join("\n");
                  submitForm.partsCostPence = (form.partsCostPence ?? 0) + manualPence;
                }
                save.mutate(submitForm);
              },
              disabled: save.isPending || !form.title,
              children: [
                save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
                editing ? "Save Changes" : "Create Job Card"
              ]
            }
          )
        ] })
      ] })
    ] }) })
  ] });
}
function ServiceScheduleTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useQuery({
    queryKey: ["workshop-schedule", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/workshop/schedule`), { credentials: "include" }).then((r) => r.json())
  });
  const [viewEntry, setViewEntry] = reactExports.useState(null);
  const [logEntry, setLogEntry] = reactExports.useState(null);
  const [logForm, setLogForm] = reactExports.useState({ performedDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), performedBy: "", nextDueDate: "", description: "", partsUsed: "", costPence: "", notes: "" });
  const logMut = useMutation({
    mutationFn: ({ equipmentId, body }) => fetch(api(`farms/${farmId}/equipment/${equipmentId}/maintenance`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workshop-schedule", farmId] });
      setLogEntry(null);
      toast({ title: "Service logged", description: "The schedule will update to reflect the new service date." });
    },
    onError: () => toast({ title: "Error", description: "Could not save service record.", variant: "destructive" })
  });
  const today = /* @__PURE__ */ new Date();
  const services = data?.services ?? [];
  function dueStatus(dateStr) {
    const d = new Date(dateStr);
    const diff = Math.ceil((d.getTime() - today.getTime()) / 864e5);
    if (diff < 0) return { label: `Overdue by ${Math.abs(diff)} day${Math.abs(diff) !== 1 ? "s" : ""}`, colour: "bg-red-100 text-red-700", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 text-red-500" }) };
    if (diff <= 14) return { label: `Due in ${diff} day${diff !== 1 ? "s" : ""}`, colour: "bg-amber-100 text-amber-700", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4 text-amber-500" }) };
    return { label: `Due ${d.toLocaleDateString("en-GB")}`, colour: "bg-green-100 text-green-700", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-green-500" }) };
  }
  function openLogService(entry) {
    setLogEntry(entry);
    setLogForm({ performedDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), performedBy: entry.log.performedBy ?? "", nextDueDate: "", description: entry.log.description ?? "", partsUsed: "", costPence: "", notes: "" });
  }
  function submitLog() {
    if (!logEntry) return;
    logMut.mutate({
      equipmentId: logEntry.log.equipmentId,
      body: {
        maintenanceType: logEntry.log.maintenanceType,
        performedDate: logForm.performedDate,
        performedBy: logForm.performedBy || null,
        nextDueDate: logForm.nextDueDate || null,
        description: logForm.description || null,
        partsUsed: logForm.partsUsed || null,
        costPence: logForm.costPence ? Math.round(parseFloat(logForm.costPence) * 100) : null,
        notes: logForm.notes || null
      }
    });
  }
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-12 text-center text-gray-400", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin mx-auto" }) });
  if (services.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-8 text-center text-gray-400 text-sm", children: [
      'No upcoming service dates found. Add a "Next Due Date" to maintenance records on the ',
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { href: "/equipment", className: "text-primary underline underline-offset-2 hover:opacity-75", children: "Equipment page" }),
      " to populate this schedule."
    ] }) });
  }
  const overdueCount = services.filter((s) => new Date(s.log.nextDueDate).getTime() < today.getTime()).length;
  const dueSoonCount = services.filter((s) => {
    const d = new Date(s.log.nextDueDate);
    const diff = Math.ceil((d.getTime() - today.getTime()) / 864e5);
    return diff >= 0 && diff <= 14;
  }).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-500", children: [
        "One entry per service type per asset — completing a service removes the old overdue entry. Log new records on the ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { href: "/equipment", className: "text-primary underline underline-offset-2 hover:opacity-75", children: "Equipment page" }),
        " or use ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Log Service Done" }),
        " below."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs flex-shrink-0", children: [
        overdueCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-red-100 text-red-700 font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
          overdueCount,
          " overdue"
        ] }),
        dueSoonCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-amber-100 text-amber-700 font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
          dueSoonCount,
          " due soon"
        ] })
      ] })
    ] }),
    services.map((entry) => {
      const { log, equipmentName, assetNumber: an, equipmentType } = entry;
      const due = dueStatus(log.nextDueDate);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "hover:shadow-sm transition-shadow cursor-pointer", onClick: () => setViewEntry(entry), children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-0.5", children: due.icon }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: log.maintenanceType }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", due.colour), children: due.label })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-0.5", children: [
            an ? `${an} — ` : "",
            equipmentName,
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-400", children: [
              "(",
              equipmentType,
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400 mt-1", children: [
            "Last done: ",
            new Date(log.performedDate).toLocaleDateString("en-GB"),
            log.performedBy ? ` by ${log.performedBy}` : ""
          ] }),
          log.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-1 italic", children: log.description })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "flex-shrink-0 text-xs h-7 px-2", onClick: (e) => {
          e.stopPropagation();
          openLogService(entry);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5 mr-1 text-green-600" }),
          "Log Service Done"
        ] })
      ] }) }) }, log.id);
    }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!viewEntry, onOpenChange: () => setViewEntry(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Maintenance Record Detail" }) }),
      viewEntry && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 uppercase font-medium mb-0.5", children: "Asset" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
              viewEntry.assetNumber ? `${viewEntry.assetNumber} — ` : "",
              viewEntry.equipmentName
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 uppercase font-medium mb-0.5", children: "Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewEntry.equipmentType })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 uppercase font-medium mb-0.5", children: "Service Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewEntry.log.maintenanceType })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 uppercase font-medium mb-0.5", children: "Last Performed" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: new Date(viewEntry.log.performedDate).toLocaleDateString("en-GB") })
          ] }),
          viewEntry.log.performedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 uppercase font-medium mb-0.5", children: "Performed By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewEntry.log.performedBy })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 uppercase font-medium mb-0.5", children: "Next Due" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: new Date(viewEntry.log.nextDueDate) < today ? "text-red-600 font-semibold" : "", children: new Date(viewEntry.log.nextDueDate).toLocaleDateString("en-GB") })
          ] }),
          viewEntry.log.costPence != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 uppercase font-medium mb-0.5", children: "Last Cost" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              "£",
              (viewEntry.log.costPence / 100).toFixed(2)
            ] })
          ] }),
          viewEntry.log.partsUsed && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 uppercase font-medium mb-0.5", children: "Parts Used" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewEntry.log.partsUsed })
          ] })
        ] }),
        viewEntry.log.description && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 uppercase font-medium mb-0.5", children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700", children: viewEntry.log.description })
        ] }),
        viewEntry.log.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 uppercase font-medium mb-0.5", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 whitespace-pre-line", children: viewEntry.log.notes })
        ] }),
        !viewEntry.log.description && !viewEntry.log.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 italic", children: "No description or notes recorded on the last service. These can be added when logging maintenance on the Equipment page." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => {
          if (viewEntry) openLogService(viewEntry);
          setViewEntry(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5 mr-1.5 text-green-600" }),
          "Log Service Done"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setViewEntry(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!logEntry, onOpenChange: () => setLogEntry(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Log Service Done" }),
        logEntry && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-500 mt-1", children: [
          logEntry.log.maintenanceType,
          " — ",
          logEntry.equipmentName,
          logEntry.assetNumber ? ` (${logEntry.assetNumber})` : ""
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Date Performed ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: logForm.performedDate, onChange: (e) => setLogForm((f) => ({ ...f, performedDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Performed By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Name or contractor", value: logForm.performedBy, onChange: (e) => setLogForm((f) => ({ ...f, performedBy: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Due Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", min: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: logForm.nextDueDate, onChange: (e) => setLogForm((f) => ({ ...f, nextDueDate: e.target.value })) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Set this to keep the item on the schedule going forward." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cost (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", placeholder: "0.00", value: logForm.costPence ? (parseFloat(logForm.costPence) / 100).toFixed(2) : "", onChange: (e) => setLogForm((f) => ({ ...f, costPence: e.target.value ? String(Math.round(parseFloat(e.target.value) * 100)) : "" })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Brief description of work done", value: logForm.description, onChange: (e) => setLogForm((f) => ({ ...f, description: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Parts Used" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Oil filter, 10W-40 5L", value: logForm.partsUsed, onChange: (e) => setLogForm((f) => ({ ...f, partsUsed: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { className: "w-full border border-input rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring", rows: 2, placeholder: "Any observations, issues noted, or follow-up required…", value: logForm.notes, onChange: (e) => setLogForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setLogEntry(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: submitLog, disabled: !logForm.performedDate || logMut.isPending, children: logMut.isPending ? "Saving…" : "Save Service Record" })
      ] })
    ] }) })
  ] });
}
function FleetOverviewTab({ farmId, onNavigate }) {
  const { data: equipData } = useQuery({
    queryKey: ["equipment", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/equipment`), { credentials: "include" }).then((r) => r.json())
  });
  const { data: jobData } = useQuery({
    queryKey: ["workshop-jobs", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/workshop/jobs`), { credentials: "include" }).then((r) => r.json())
  });
  const allEquip = equipData?.records ?? [];
  const equipment = allEquip.filter((e) => e.status !== "disposed");
  const jobs = jobData?.jobs ?? [];
  const byStatus = equipment.reduce((acc, eq) => {
    acc[eq.status] = (acc[eq.status] || 0) + 1;
    return acc;
  }, {});
  const byType = equipment.reduce((acc, eq) => {
    acc[eq.type] = (acc[eq.type] || 0) + 1;
    return acc;
  }, {});
  const openJobs = jobs.filter((j) => j.job.status === "open").length;
  const inProgressJobs = jobs.filter((j) => j.job.status === "in-progress").length;
  const awaitingParts = jobs.filter((j) => j.job.status === "awaiting-parts").length;
  const totalLabourCost = jobs.reduce((sum, j) => sum + (j.job.labourCostPence || 0), 0);
  const totalPartsCost = jobs.reduce((sum, j) => sum + (j.job.partsCostPence || 0), 0);
  function StatCard({ title, value, sub, colour, onClick }) {
    const clickable = !!onClick && value !== 0;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: clickable ? "cursor-pointer hover:shadow-md transition-shadow hover:border-primary/40" : "", onClick: clickable ? onClick : void 0, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn("text-3xl font-bold", colour), children: value }),
      sub && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: sub }),
      clickable && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-primary/70 mt-1.5", children: "Click to view →" })
    ] }) });
  }
  const costsByYear = jobs.reduce((acc, j) => {
    const yr = new Date(j.job.openedAt).getFullYear();
    if (!acc[yr]) acc[yr] = { labour: 0, parts: 0 };
    acc[yr].labour += j.job.labourCostPence || 0;
    acc[yr].parts += j.job.partsCostPence || 0;
    return acc;
  }, {});
  const costYears = Object.keys(costsByYear).map(Number).sort((a, b) => b - a);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-gray-700 mb-1", children: "Fleet Status" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mb-3", children: "Asset register & QR codes are on the Equipment page" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { title: "Total Assets", value: equipment.length, colour: "text-gray-900" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { title: "Operational", value: byStatus["active"] || 0, colour: "text-green-600", sub: `${Math.round((byStatus["active"] || 0) / Math.max(equipment.length, 1) * 100)}% availability` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { title: "Broken Down", value: byStatus["broken"] || 0, colour: "text-red-600", onClick: () => onNavigate("jobs") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { title: "In Service", value: byStatus["in-service"] || 0, colour: "text-amber-600", onClick: () => onNavigate("jobs") })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-gray-700 mb-1", children: "Active Workshop Jobs" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mb-3", children: "Click a card to jump straight to that job list" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { title: "Open Jobs", value: openJobs, colour: "text-blue-600", onClick: () => onNavigate("jobs", "open") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { title: "In Progress", value: inProgressJobs, colour: "text-amber-600", onClick: () => onNavigate("jobs", "in-progress") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { title: "Awaiting Parts", value: awaitingParts, colour: "text-purple-600", onClick: () => onNavigate("jobs", "awaiting-parts") })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm", children: "Workshop Costs by Year" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: costYears.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400", children: "No cost data recorded yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "divide-y", children: [
          costYears.map((yr) => {
            const { labour, parts } = costsByYear[yr];
            const total = labour + parts;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-2 first:pt-0 last:pb-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-600 mb-1", children: yr }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "Labour" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
                    "£",
                    (labour / 100).toFixed(2)
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "Parts" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
                    "£",
                    (parts / 100).toFixed(2)
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "Total" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold text-gray-800", children: [
                    "£",
                    (total / 100).toFixed(2)
                  ] })
                ] })
              ] })
            ] }, yr);
          }),
          costYears.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-2 last:pb-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 text-xs border-t pt-2 mt-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "All Labour" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold", children: [
                "£",
                (totalLabourCost / 100).toFixed(2)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "All Parts" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold", children: [
                "£",
                (totalPartsCost / 100).toFixed(2)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "All Time" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-bold text-primary", children: [
                "£",
                ((totalLabourCost + totalPartsCost) / 100).toFixed(2)
              ] })
            ] })
          ] }) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm", children: "Equipment by Type" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: Object.entries(byType).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400", children: "No equipment registered." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([type, count]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 text-sm text-gray-600 capitalize", children: type }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-24 h-2 rounded-full bg-gray-100 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-primary rounded-full", style: { width: `${count / equipment.length * 100}%` } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500 w-4 text-right", children: count })
          ] })
        ] }, type)) }) })
      ] })
    ] })
  ] });
}
const PART_CATEGORIES = ["Filters", "Belts & Drives", "Bearings", "Seals & Gaskets", "Fasteners", "Electrical", "Hydraulics", "Tyres & Wheels", "Lubricants & Oils", "Welding Supplies", "Safety Equipment", "Tools", "Other"];
const RETURN_REASON_CODES = {
  "faulty": "Faulty / Defective",
  "wrong-part": "Wrong Part Supplied",
  "damaged-transit": "Damaged in Transit",
  "over-delivery": "Over-Delivery",
  "not-required": "No Longer Required",
  "other": "Other"
};
const RETURN_STATUS = {
  "raised": { label: "Raised", colour: "bg-blue-100 text-blue-700" },
  "dispatched": { label: "Dispatched", colour: "bg-amber-100 text-amber-700" },
  "awaiting-credit": { label: "Awaiting Credit", colour: "bg-purple-100 text-purple-700" },
  "credit-received": { label: "Credit Received", colour: "bg-green-100 text-green-700" },
  "closed": { label: "Closed", colour: "bg-gray-100 text-gray-600" }
};
function GoodsReturnsView({ farmId, parts, staffNames, membersLoading }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = reactExports.useState("all");
  const [newOpen, setNewOpen] = reactExports.useState(false);
  const [editReturn, setEditReturn] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({ stockItemId: "", stockItemName: "", supplierId: "", quantity: "", unit: "", unitCostPence: "", returnReasonCode: "faulty", returnReason: "", raisedBy: "", originalDeliveryRef: "", notes: "" });
  const [editForm, setEditForm] = reactExports.useState({ supplierRtnNumber: "", status: "raised", dispatchedAt: "", creditAmountPence: "", creditReceivedAt: "", notes: "" });
  const { data: returns = [], isLoading } = useQuery({
    queryKey: ["workshop-returns", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/workshop/returns`), { credentials: "include" }).then((r) => r.json())
  });
  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers-list", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/suppliers`), { credentials: "include" }).then((r) => r.json().then((d) => d.records ?? []))
  });
  const createReturn = useMutation({
    mutationFn: (body) => fetch(api(`farms/${farmId}/workshop/returns`), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workshop-returns", farmId] });
      qc.invalidateQueries({ queryKey: ["workshop-parts", farmId] });
      setNewOpen(false);
      setForm({ stockItemId: "", stockItemName: "", supplierId: "", quantity: "", unit: "", unitCostPence: "", returnReasonCode: "faulty", returnReason: "", raisedBy: "", originalDeliveryRef: "", notes: "" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const updateReturn = useMutation({
    mutationFn: ({ id, body }) => fetch(api(`farms/${farmId}/workshop/returns/${id}`), { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workshop-returns", farmId] });
      setEditReturn(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteReturn = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/workshop/returns/${id}`), { method: "DELETE", credentials: "include" }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workshop-returns", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function setF(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  function setEF(k, v) {
    setEditForm((f) => ({ ...f, [k]: v }));
  }
  function openEdit(r) {
    setEditReturn(r);
    setEditForm({
      supplierRtnNumber: r.supplierRtnNumber ?? "",
      status: r.status,
      dispatchedAt: r.dispatchedAt ? r.dispatchedAt.slice(0, 10) : "",
      creditAmountPence: r.creditAmountPence ? (r.creditAmountPence / 100).toFixed(2) : "",
      creditReceivedAt: r.creditReceivedAt ? r.creditReceivedAt.slice(0, 10) : "",
      notes: r.notes ?? ""
    });
  }
  function handlePartSelect(partId) {
    const p = parts.find((x) => String(x.id) === partId);
    setForm((f) => ({ ...f, stockItemId: partId, stockItemName: p?.name ?? "", unit: p?.unit ?? f.unit, supplierId: p?.defaultSupplierId ? String(p.defaultSupplierId) : f.supplierId, unitCostPence: p?.unitCostPence ? (p.unitCostPence / 100).toFixed(2) : f.unitCostPence }));
  }
  const filtered = statusFilter === "all" ? returns : returns.filter((r) => r.status === statusFilter);
  const totalCreditPending = returns.filter((r) => ["raised", "dispatched", "awaiting-credit"].includes(r.status) && r.unitCostPence && r.quantity).reduce((sum, r) => sum + Math.round(r.unitCostPence / 100 * parseFloat(r.quantity)), 0);
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-12 text-center text-gray-400", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin mx-auto" }) });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 flex-wrap", children: ["all", ...Object.keys(RETURN_STATUS)].map((s) => {
        const badge = RETURN_STATUS[s];
        const count = s === "all" ? returns.length : returns.filter((r) => r.status === s).length;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setStatusFilter(s),
            className: cn("px-3 py-1 rounded-full text-xs font-medium border transition-colors", statusFilter === s ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"),
            children: [
              badge?.label ?? "All Returns",
              " ",
              count > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("ml-1 rounded-full px-1.5 py-0.5 text-xs", statusFilter === s ? "bg-white/20" : "bg-gray-100"), children: count })
            ]
          },
          s
        );
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setNewOpen(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
        "New Return"
      ] })
    ] }),
    totalCreditPending > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg px-4 py-2.5 text-sm text-purple-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-4 w-4 text-purple-500 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "Outstanding credit due from suppliers: ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
          "~£",
          totalCreditPending.toFixed(2)
        ] })
      ] })
    ] }),
    filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-gray-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpFromLine, { className: "h-10 w-10 mx-auto mb-3 text-gray-300" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-500 mb-1", children: statusFilter === "all" ? "No goods returns logged yet" : `No returns with status "${RETURN_STATUS[statusFilter]?.label}"` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: 'Use "New Return" to log a return to a supplier and track the credit.' })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-gray-200 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "bg-gray-50 border-b border-gray-200", children: ["RTN Ref", "Date", "Part / Item", "Qty", "Supplier", "Reason", "Status", "Supplier RTN", "Credit Due", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-gray-100", children: filtered.map((r) => {
        const st = RETURN_STATUS[r.status] ?? { label: r.status, colour: "bg-gray-100 text-gray-600" };
        const creditDue = r.unitCostPence && r.quantity ? `£${(r.unitCostPence / 100 * parseFloat(r.quantity)).toFixed(2)}` : "—";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50/80 cursor-pointer", onClick: () => openEdit(r), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs font-semibold text-primary", children: r.returnRef }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-gray-500 text-xs whitespace-nowrap", children: new Date(r.raisedAt).toLocaleDateString("en-GB") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-900 text-xs", children: r.stockItemName || "—" }),
            r.originalDeliveryRef && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 font-mono", children: r.originalDeliveryRef })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-3 text-gray-600 text-xs", children: [
            r.quantity,
            r.unit ? ` ${r.unit}` : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-gray-600 text-xs", children: r.supplierName || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-gray-600 text-xs", children: RETURN_REASON_CODES[r.returnReasonCode] ?? r.returnReasonCode }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", st.colour), children: st.label }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-gray-500 text-xs font-mono", children: r.supplierRtnNumber || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-300", children: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-gray-600 text-xs", children: r.creditAmountPence ? `£${(r.creditAmountPence / 100).toFixed(2)}` : creditDue }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => deleteReturn.mutate(r.id), className: "p-1 text-gray-400 hover:text-red-500 rounded", title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) }) })
        ] }, r.id);
      }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: newOpen, onOpenChange: setNewOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "48rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Raise Goods Return" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Part from Store" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.stockItemId || "__none__", onValueChange: (v) => v === "__none__" ? setF("stockItemId", "") : handlePartSelect(v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select part…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select a part —" }),
              parts.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(p.id), children: [
                p.name,
                p.productCode ? ` (${p.productCode})` : ""
              ] }, p.id))
            ] })
          ] })
        ] }),
        !form.stockItemId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Part / Item Description ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 font-normal", children: "(if not in parts store)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.stockItemName, onChange: (e) => setF("stockItemName", e.target.value), placeholder: "e.g. Hydraulic hose assembly" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity to Return *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0.01", value: form.quantity, onChange: (e) => setF("quantity", e.target.value), placeholder: "0" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Unit" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.unit, onChange: (e) => setF("unit", e.target.value), placeholder: "e.g. each, kg, m" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Unit Cost (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.unitCostPence, onChange: (e) => setF("unitCostPence", e.target.value), placeholder: "0.00" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.supplierId || "__none__", onValueChange: (v) => setF("supplierId", v === "__none__" ? "" : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select supplier…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— None —" }),
              suppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(s.id), children: s.name }, s.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Return Reason *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.returnReasonCode, onValueChange: (v) => setF("returnReasonCode", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.entries(RETURN_REASON_CODES).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: v }, k)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Original Delivery Ref ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 font-normal", children: "(GRN number)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.originalDeliveryRef, onChange: (e) => setF("originalDeliveryRef", e.target.value), placeholder: "e.g. GRN-WS-202603-001" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reason Details" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.returnReason, onChange: (e) => setF("returnReason", e.target.value), rows: 2, placeholder: "Describe the specific issue, e.g. bearing seized on first use" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Raised By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSelect, { value: form.raisedBy ?? "", onChange: (v) => setF("raisedBy", v), staffNames, loading: membersLoading })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.notes, onChange: (e) => setF("notes", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Stock level will be automatically decremented when the return is raised." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setNewOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: () => createReturn.mutate({ ...form, unitCostPence: form.unitCostPence ? String(Math.round(parseFloat(form.unitCostPence) * 100)) : "" }),
            disabled: createReturn.isPending || !form.quantity || !form.returnReasonCode || !form.stockItemId && !form.stockItemName,
            children: [
              createReturn.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
              "Raise Return"
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!editReturn, onOpenChange: (open) => {
      if (!open) setEditReturn(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        "Update Return",
        editReturn && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-primary text-base", children: editReturn.returnRef })
      ] }) }),
      editReturn && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-gray-50 border px-4 py-3 text-sm space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 flex-wrap text-xs text-gray-500", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-gray-700", children: "Part:" }),
              " ",
              editReturn.stockItemName || "—"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-gray-700", children: "Qty:" }),
              " ",
              editReturn.quantity,
              editReturn.unit ? ` ${editReturn.unit}` : ""
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-gray-700", children: "Reason:" }),
              " ",
              RETURN_REASON_CODES[editReturn.returnReasonCode] ?? editReturn.returnReasonCode
            ] }),
            editReturn.supplierName && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-gray-700", children: "Supplier:" }),
              " ",
              editReturn.supplierName
            ] })
          ] }),
          editReturn.returnReason && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 italic", children: editReturn.returnReason })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier RTN Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editForm.supplierRtnNumber, onChange: (e) => setEF("supplierRtnNumber", e.target.value), placeholder: "Supplier's own return reference" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: editForm.status, onValueChange: (v) => setEF("status", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.entries(RETURN_STATUS).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: v.label }, k)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Dispatched Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: editForm.dispatchedAt, onChange: (e) => setEF("dispatchedAt", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Credit Amount Received (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: editForm.creditAmountPence, onChange: (e) => setEF("creditAmountPence", e.target.value), placeholder: "0.00" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Credit Received Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: editForm.creditReceivedAt, onChange: (e) => setEF("creditReceivedAt", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: editForm.notes, onChange: (e) => setEF("notes", e.target.value), rows: 2 })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setEditReturn(null), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => updateReturn.mutate({ id: editReturn.id, body: {
            supplierRtnNumber: editForm.supplierRtnNumber || null,
            status: editForm.status,
            dispatchedAt: editForm.dispatchedAt || null,
            creditAmountPence: editForm.creditAmountPence ? String(Math.round(parseFloat(editForm.creditAmountPence) * 100)) : null,
            creditReceivedAt: editForm.creditReceivedAt || null,
            notes: editForm.notes || null
          } }), disabled: updateReturn.isPending, children: [
            updateReturn.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
            "Save Changes"
          ] })
        ] })
      ] })
    ] }) })
  ] });
}
function printQRLabel(qrValue, title, subtitle = "") {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html><head><title>QR Label — ${title}</title>
<style>
  body{font-family:Arial,sans-serif;margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#fff}
  .label{width:200px;border:1.5px solid #333;border-radius:6px;padding:12px;text-align:center;page-break-inside:avoid}
  .label h2{font-size:13px;margin:10px 0 4px;word-break:break-word}
  .label p{font-size:10px;color:#555;margin:2px 0}
  .label .url{font-size:8px;color:#999;margin-top:6px;word-break:break-all}
  button{display:block;margin:20px auto;padding:8px 20px;background:#16a34a;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:13px}
  @media print{button{display:none}body{min-height:auto}}
</style></head><body>
<div>
  <div class="label">
    <div id="qr"></div>
    <h2>${title}</h2>
    ${subtitle ? `<p>${subtitle}</p>` : ""}
    <p class="url">${qrValue}</p>
  </div>
  <button onclick="window.print()">🖨 Print</button>
</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
<script>new QRCode(document.getElementById('qr'),{text:"${qrValue.replace(/"/g, '\\"')}",width:160,height:160,correctLevel:QRCode.CorrectLevel.M})<\/script>
</body></html>`);
  w.document.close();
}
function fmtStocktakeQty(qty, unit) {
  if (qty === null || qty === void 0) return "—";
  const n = parseFloat(qty);
  if (isNaN(n)) return "—";
  return WHOLE_UNITS.includes((unit ?? "").toLowerCase()) ? String(Math.round(n)) : n.toFixed(2);
}
function printBlankStocktakeSheet(items, date) {
  const w = window.open("", "_blank");
  if (!w) return;
  const rows = items.map((item, i) => `<tr>
    <td>${i + 1}</td>
    <td><strong>${item.partName}</strong></td>
    <td class="mono">${item.partNumber || ""}</td>
    <td>${item.location || ""}</td>
    <td>${item.unit || ""}</td>
    <td class="right">${fmtStocktakeQty(item.expectedQty, item.unit)}</td>
    <td class="count-col"></td>
    <td class="notes-col"></td>
  </tr>`).join("");
  w.document.write(`<!DOCTYPE html><html><head><title>Blank Stocktake — ${date}</title>
<style>@page{size:A4;margin:14mm}body{font-family:Arial,sans-serif;font-size:10px;color:#000}h1{font-size:15px;margin:0 0 3px}.meta{font-size:10px;color:#555;margin-bottom:10px}table{width:100%;border-collapse:collapse}th{background:#f0f0f0;border:1px solid #ccc;padding:4px 6px;text-align:left;font-size:9px;text-transform:uppercase}td{border:1px solid #ddd;padding:5px 6px}.right{text-align:right}.mono{font-family:monospace}.count-col{width:80px;background:#f8fff8}.notes-col{width:120px}button{display:block;margin:14px auto;padding:8px 24px;background:#16a34a;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:13px}@media print{button{display:none}}</style></head><body>
<h1>Parts Store Stocktake — Blank Count Sheet</h1>
<p class="meta">Stocktake Date: ${date} &nbsp;|&nbsp; Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")} &nbsp;|&nbsp; Counter:_______________ &nbsp;|&nbsp; Signed:_______________</p>
<table><thead><tr><th style="width:24px">#</th><th>Part Name</th><th>Part No.</th><th>Location</th><th>Unit</th><th class="right">System Qty</th><th class="count-col">Count</th><th class="notes-col">Notes</th></tr></thead><tbody>${rows}</tbody></table>
<button onclick="window.print()">🖨 Print</button></body></html>`);
  w.document.close();
}
function printStocktakeReport(session) {
  const items = session.items ?? [];
  const w = window.open("", "_blank");
  if (!w) return;
  const totalVar = items.reduce((s, i) => s + (i.varianceValue ? parseFloat(i.varianceValue) : 0), 0);
  const shortfalls = items.filter((i) => i.variance !== null && parseFloat(i.variance) < 0).length;
  const surplus = items.filter((i) => i.variance !== null && parseFloat(i.variance) > 0).length;
  const rows = items.map((item, idx) => {
    const varNum = item.variance !== null ? parseFloat(item.variance) : null;
    const varVal = item.varianceValue !== null ? parseFloat(item.varianceValue) : null;
    const rowColor = varNum === null ? "" : varNum < 0 ? "background:#fff0f0" : varNum > 0 ? "background:#fffbe8" : "";
    const varClass = varNum === null ? "grey" : varNum < 0 ? "red" : varNum > 0 ? "amber" : "grn";
    const varValClass = varVal === null ? "grey" : varVal < 0 ? "red" : "";
    return `<tr style="${rowColor}"><td>${idx + 1}</td><td><strong>${item.partName}</strong></td><td class="mono">${item.partNumber || ""}</td><td>${item.location || ""}</td><td>${item.unit || ""}</td><td class="right">${fmtStocktakeQty(item.expectedQty, item.unit)}</td><td class="right ${item.countedQty !== null ? "" : "grey"}">${fmtStocktakeQty(item.countedQty, item.unit)}</td><td class="right ${varClass}">${varNum === null ? "—" : (varNum >= 0 ? "+" : "") + fmtStocktakeQty(String(varNum), item.unit)}</td><td class="right ${varValClass}">${varVal === null ? "—" : (varVal >= 0 ? "+" : "") + "£" + Math.abs(varVal).toFixed(2)}</td></tr>`;
  }).join("");
  w.document.write(`<!DOCTYPE html><html><head><title>Stocktake Report — ${session.stocktakeDate}</title>
<style>@page{size:A4 landscape;margin:12mm}body{font-family:Arial,sans-serif;font-size:9px;color:#000}h1{font-size:14px;margin:0 0 3px}.meta{font-size:9px;color:#555;margin-bottom:8px}.summary{display:flex;gap:20px;margin-bottom:10px;padding:6px 12px;background:#f5f5f5;border-radius:4px}.summary div{text-align:center}.lbl{font-size:8px;color:#888;text-transform:uppercase}.val{font-size:13px;font-weight:bold}table{width:100%;border-collapse:collapse}th{background:#e8e8e8;border:1px solid #bbb;padding:3px 5px;text-align:left;font-size:8px;text-transform:uppercase}td{border:1px solid #ddd;padding:3px 5px}.right{text-align:right}.mono{font-family:monospace}.red{color:#b91c1c;font-weight:bold}.amber{color:#b45309;font-weight:bold}.grn{color:#15803d}.grey{color:#aaa}button{display:block;margin:12px auto;padding:8px 24px;background:#16a34a;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px}@media print{button{display:none}}</style></head><body>
<h1>Parts Store Stocktake Report</h1>
<p class="meta">Date: ${session.stocktakeDate} &nbsp;|&nbsp; Status: Completed &nbsp;|&nbsp; Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}${session.notes ? " &nbsp;|&nbsp; " + session.notes : ""}</p>
<div class="summary"><div><div class="lbl">Total Parts</div><div class="val">${items.length}</div></div><div><div class="lbl">Shortfalls</div><div class="val" style="color:#b91c1c">${shortfalls}</div></div><div><div class="lbl">Surplus</div><div class="val" style="color:#b45309">${surplus}</div></div><div><div class="lbl">Total Variance</div><div class="val" style="color:${totalVar < 0 ? "#b91c1c" : totalVar > 0 ? "#b45309" : "#15803d"}">${totalVar >= 0 ? "+" : ""}£${Math.abs(totalVar).toFixed(2)}</div></div></div>
<table><thead><tr><th style="width:22px">#</th><th>Part Name</th><th>Part No.</th><th>Location</th><th>Unit</th><th class="right">System</th><th class="right">Counted</th><th class="right">Variance</th><th class="right">Variance £</th></tr></thead><tbody>${rows}</tbody></table>
<button onclick="window.print()">🖨 Print</button></body></html>`);
  w.document.close();
}
function LocationManager({ farmId, onClose }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const inv = () => {
    qc.invalidateQueries({ queryKey: ["workshop-rows-lm", farmId] });
    qc.invalidateQueries({ queryKey: ["workshop-rows", farmId] });
  };
  const [rowForm, setRowForm] = reactExports.useState({ name: "", description: "" });
  const [editingRow, setEditingRow] = reactExports.useState(null);
  const [bayFormByRow, setBayFormByRow] = reactExports.useState({});
  const [editingBay, setEditingBay] = reactExports.useState(null);
  const [shelfFormByBay, setShelfFormByBay] = reactExports.useState({});
  const [editingShelf, setEditingShelf] = reactExports.useState(null);
  const [expandedRows, setExpandedRows] = reactExports.useState(/* @__PURE__ */ new Set());
  const [expandedBays, setExpandedBays] = reactExports.useState(/* @__PURE__ */ new Set());
  const { data, isLoading } = useQuery({
    queryKey: ["workshop-rows-lm", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/workshop/rows`), { credentials: "include" }).then((r) => r.json())
  });
  const lmRows = data?.rows ?? [];
  const unassignedBays = data?.unassignedBays ?? [];
  const createRow = useMutation({ mutationFn: (b) => fetch(api(`farms/${farmId}/workshop/rows`), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then((r) => r.json()), onSuccess: () => {
    inv();
    setRowForm({ name: "", description: "" });
  }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const updateRow = useMutation({ mutationFn: ({ id, ...b }) => fetch(api(`farms/${farmId}/workshop/rows/${id}`), { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then((r) => r.json()), onSuccess: () => {
    inv();
    setEditingRow(null);
  }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const deleteRow = useMutation({ mutationFn: (id) => fetch(api(`farms/${farmId}/workshop/rows/${id}`), { method: "DELETE", credentials: "include" }).then((r) => r.json()), onSuccess: inv, onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const createBay = useMutation({ mutationFn: (b) => fetch(api(`farms/${farmId}/workshop/bays`), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then((r) => r.json()), onSuccess: (_d, vars) => {
    inv();
    const k = vars.rowId ? `r-${vars.rowId}` : "unassigned";
    setBayFormByRow((f) => ({ ...f, [k]: { name: "", description: "" } }));
  }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const updateBay = useMutation({ mutationFn: ({ id, ...b }) => fetch(api(`farms/${farmId}/workshop/bays/${id}`), { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then((r) => r.json()), onSuccess: () => {
    inv();
    setEditingBay(null);
  }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const deleteBay = useMutation({ mutationFn: (id) => fetch(api(`farms/${farmId}/workshop/bays/${id}`), { method: "DELETE", credentials: "include" }).then((r) => r.json()), onSuccess: inv, onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const createShelf = useMutation({ mutationFn: ({ bayId, name, capacity }) => fetch(api(`farms/${farmId}/workshop/bays/${bayId}/shelves`), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, capacity: capacity || null }) }).then((r) => r.json()), onSuccess: (_d, vars) => {
    inv();
    setShelfFormByBay((f) => ({ ...f, [vars.bayId]: { name: "", capacity: "" } }));
  }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const updateShelf = useMutation({ mutationFn: ({ id, ...b }) => fetch(api(`farms/${farmId}/workshop/shelves/${id}`), { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then((r) => r.json()), onSuccess: () => {
    inv();
    setEditingShelf(null);
  }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const deleteShelf = useMutation({ mutationFn: (id) => fetch(api(`farms/${farmId}/workshop/shelves/${id}`), { method: "DELETE", credentials: "include" }).then((r) => r.json()), onSuccess: inv, onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  function toggleRow(key) {
    setExpandedRows((s) => {
      const n = new Set(s);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  }
  function toggleBay(id) {
    setExpandedBays((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }
  function renderShelves(bay, rowLabel) {
    const sf = shelfFormByBay[bay.id] ?? { name: "", capacity: "" };
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pl-6 pr-3 py-3 space-y-2 bg-white border-t border-gray-100", children: [
      bay.shelves.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 italic", children: "No shelves in this bay yet." }),
      bay.shelves.map((shelf) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-md border border-gray-100 bg-gray-50 px-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-w-0", children: editingShelf?.id === shelf.id ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-7 text-xs flex-1 min-w-[120px]", value: editingShelf.name, onChange: (e) => setEditingShelf((s) => s ? { ...s, name: e.target.value } : s), autoFocus: true, placeholder: "Shelf name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-7 text-xs w-28", value: editingShelf.capacity, onChange: (e) => setEditingShelf((s) => s ? { ...s, capacity: e.target.value } : s), placeholder: "Capacity (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "h-7 text-xs", onClick: () => updateShelf.mutate({ id: shelf.id, name: editingShelf.name, capacity: editingShelf.capacity }), disabled: updateShelf.isPending, children: "Save" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "h-7 text-xs", onClick: () => setEditingShelf(null), children: "Cancel" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-900", children: shelf.name }),
          shelf.capacity && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 text-xs text-gray-400", children: [
            "Cap: ",
            shelf.capacity
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400 mt-0.5", children: [
            rowLabel,
            " / ",
            bay.name,
            " / ",
            shelf.name
          ] })
        ] }) }),
        editingShelf?.id !== shelf.id && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => printQRLabel(`${window.location.origin}/dashboard/workshop?shelf=${shelf.qrToken}`, `${bay.name} / ${shelf.name}`, rowLabel), className: "p-1.5 text-gray-400 hover:text-primary rounded", title: "Print QR label", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setEditingShelf({ id: shelf.id, name: shelf.name, capacity: shelf.capacity ?? "" }), className: "p-1.5 text-gray-400 hover:text-gray-700 rounded", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => deleteShelf.mutate(shelf.id), className: "p-1.5 text-gray-400 hover:text-red-500 rounded", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" }) })
        ] })
      ] }, shelf.id)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-7 text-xs flex-1", placeholder: "New shelf name, e.g. Shelf A1…", value: sf.name, onChange: (e) => setShelfFormByBay((f) => ({ ...f, [bay.id]: { ...sf, name: e.target.value } })), onKeyDown: (e) => {
          if (e.key === "Enter" && sf.name.trim()) createShelf.mutate({ bayId: bay.id, name: sf.name, capacity: sf.capacity });
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-7 text-xs w-24", placeholder: "Capacity", value: sf.capacity, onChange: (e) => setShelfFormByBay((f) => ({ ...f, [bay.id]: { ...sf, capacity: e.target.value } })) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "h-7 text-xs shrink-0", disabled: !sf.name.trim() || createShelf.isPending, onClick: () => createShelf.mutate({ bayId: bay.id, name: sf.name, capacity: sf.capacity }), children: createShelf.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3 mr-1" }),
          "Add Shelf"
        ] }) })
      ] })
    ] });
  }
  function renderBays(bayList, rowKey, rowLabel, rowId) {
    const bf = bayFormByRow[rowKey] ?? { name: "", description: "" };
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pl-4 space-y-2 py-3 bg-gray-50/60", children: [
      bayList.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 italic pl-2", children: "No bays in this row yet." }),
      bayList.map((bay) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-gray-200 bg-white overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3 py-2 bg-gray-50/80", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toggleBay(bay.id), className: "shrink-0 text-gray-400 hover:text-gray-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: cn("h-3.5 w-3.5 transition-transform", expandedBays.has(bay.id) ? "rotate-180" : "") }) }),
          editingBay?.id === bay.id ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-7 text-xs flex-1 min-w-[100px]", value: editingBay.name, onChange: (e) => setEditingBay((b) => b ? { ...b, name: e.target.value } : b), autoFocus: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-7 text-xs w-36", value: editingBay.description ?? "", onChange: (e) => setEditingBay((b) => b ? { ...b, description: e.target.value } : b), placeholder: "Description" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "h-7 text-xs", onClick: () => updateBay.mutate({ id: bay.id, name: editingBay.name, description: editingBay.description ?? "", rowId }), disabled: updateBay.isPending, children: "Save" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "h-7 text-xs", onClick: () => setEditingBay(null), children: "Cancel" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-gray-800", children: bay.name }),
            bay.description && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400", children: bay.description }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500 bg-gray-200 rounded-full px-1.5 py-0.5", children: [
              bay.shelves.length,
              " shelf",
              bay.shelves.length !== 1 ? "ves" : ""
            ] })
          ] }),
          editingBay?.id !== bay.id && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
              setEditingBay(bay);
              setExpandedBays((s) => /* @__PURE__ */ new Set([...s, bay.id]));
            }, className: "p-1 text-gray-400 hover:text-gray-700 rounded", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => deleteBay.mutate(bay.id), className: "p-1 text-gray-400 hover:text-red-500 rounded", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" }) })
          ] })
        ] }),
        expandedBays.has(bay.id) && renderShelves(bay, rowLabel)
      ] }, bay.id)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-7 text-xs flex-1", placeholder: "New bay name, e.g. Bay 1…", value: bf.name, onChange: (e) => setBayFormByRow((f) => ({ ...f, [rowKey]: { ...bf, name: e.target.value } })), onKeyDown: (e) => {
          if (e.key === "Enter" && bf.name.trim()) createBay.mutate({ name: bf.name, description: bf.description, rowId });
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-7 text-xs w-36", placeholder: "Description (opt.)", value: bf.description, onChange: (e) => setBayFormByRow((f) => ({ ...f, [rowKey]: { ...bf, description: e.target.value } })) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "h-7 text-xs shrink-0", disabled: !bf.name.trim() || createBay.isPending, onClick: () => createBay.mutate({ name: bf.name, description: bf.description, rowId }), children: createBay.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3 mr-1" }),
          "Add Bay"
        ] }) })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl max-h-[88vh] overflow-hidden flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: "h-5 w-5 text-primary" }),
        "Parts Store Location Manager"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mt-0.5", children: "Organise storage into Rows → Bays → Shelves. Each shelf gets a unique QR code for rapid scanning during stocktakes and parts issuance." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto space-y-4 pr-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2", children: "Add New Row" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-end flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-[140px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Row Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-sm mt-1", placeholder: "e.g. Row A, North Aisle", value: rowForm.name, onChange: (e) => setRowForm((f) => ({ ...f, name: e.target.value })), onKeyDown: (e) => {
              if (e.key === "Enter" && rowForm.name.trim()) createRow.mutate(rowForm);
            } })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-[140px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Description (optional)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-sm mt-1", placeholder: "e.g. Main racking aisle", value: rowForm.description, onChange: (e) => setRowForm((f) => ({ ...f, description: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "h-8 shrink-0", disabled: !rowForm.name.trim() || createRow.isPending, onClick: () => createRow.mutate(rowForm), children: createRow.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }),
            "Add Row"
          ] }) })
        ] })
      ] }),
      isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-8 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-gray-300 mx-auto" }) }) : lmRows.length === 0 && unassignedBays.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-10 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: "h-10 w-10 mx-auto mb-2 text-gray-300" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-500", children: "No storage locations set up yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Add your first Row above, then create Bays within it, and Shelves within each Bay" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        lmRows.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-gray-200 overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-primary/5 to-transparent border-b border-gray-100", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toggleRow(`r-${row.id}`), className: "shrink-0 text-gray-400 hover:text-gray-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: cn("h-4 w-4 transition-transform", expandedRows.has(`r-${row.id}`) ? "rotate-180" : "") }) }),
            editingRow?.id === row.id ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-sm flex-1 min-w-[100px]", value: editingRow.name, onChange: (e) => setEditingRow((r) => r ? { ...r, name: e.target.value } : r), autoFocus: true }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-sm flex-1 min-w-[100px]", value: editingRow.description ?? "", onChange: (e) => setEditingRow((r) => r ? { ...r, description: e.target.value } : r), placeholder: "Description" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "h-8 text-xs", onClick: () => updateRow.mutate({ id: row.id, name: editingRow.name, description: editingRow.description ?? "" }), disabled: updateRow.isPending, children: "Save" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "h-8 text-xs", onClick: () => setEditingRow(null), children: "Cancel" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-sm text-primary", children: row.name }),
              row.description && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400", children: row.description }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-primary/70 bg-primary/10 rounded-full px-2 py-0.5", children: [
                row.bays.length,
                " bay",
                row.bays.length !== 1 ? "s" : ""
              ] })
            ] }),
            editingRow?.id !== row.id && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
                setEditingRow(row);
                setExpandedRows((s) => /* @__PURE__ */ new Set([...s, `r-${row.id}`]));
              }, className: "p-1 text-gray-400 hover:text-gray-700 rounded", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => deleteRow.mutate(row.id), className: "p-1 text-gray-400 hover:text-red-500 rounded", title: "Delete row (bays become unassigned)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
            ] })
          ] }),
          expandedRows.has(`r-${row.id}`) && renderBays(row.bays, `r-${row.id}`, row.name, row.id)
        ] }, row.id)),
        unassignedBays.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-dashed border-gray-300 overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 px-4 py-2.5 bg-gray-50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toggleRow("unassigned"), className: "shrink-0 text-gray-400 hover:text-gray-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: cn("h-4 w-4 transition-transform", expandedRows.has("unassigned") ? "rotate-180" : "") }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 text-sm font-medium text-gray-500", children: "Unassigned Bays" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-400", children: [
              unassignedBays.length,
              " bay",
              unassignedBays.length !== 1 ? "s" : "",
              " — not in any row"
            ] })
          ] }),
          expandedRows.has("unassigned") && renderBays(unassignedBays, "unassigned", "Unassigned")
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { className: "shrink-0 pt-3 border-t", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Close" }) })
  ] }) });
}
const EMPTY_PART = { name: "", category: "", productCode: "", unit: "", reorderLevel: "", unitCostPence: "", unitSellPricePence: "", shelfId: "", defaultSupplierId: "", notes: "", supersededById: "", supersessionNotes: "", supersededAt: "", supersedesId: "" };
function fileIcon(mimeType) {
  if (!mimeType) return /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 text-gray-400" });
  if (mimeType.startsWith("image/")) return /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 text-blue-400" });
  if (mimeType === "application/pdf") return /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 text-red-400" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 text-gray-400" });
}
function fmtFileSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function PartPanel({ farmId, part, onClose, onEdit }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = reactExports.useRef(null);
  const [uploadedBy, setUploadedBy] = reactExports.useState("");
  const [uploadError, setUploadError] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
  const { data: docs = [], isLoading: docsLoading } = useQuery({
    queryKey: ["part-docs", part.id],
    queryFn: () => fetch(api(`farms/${farmId}/workshop/parts/${part.id}/documents`), { credentials: "include" }).then((r) => r.json())
  });
  const deleteDoc = useMutation({
    mutationFn: (docId) => fetch(api(`farms/${farmId}/workshop/parts/${part.id}/documents/${docId}`), { method: "DELETE", credentials: "include" }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["part-docs", part.id] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const saveDocMeta = useMutation({
    mutationFn: (body) => fetch(api(`farms/${farmId}/workshop/parts/${part.id}/documents`), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["part-docs", part.id] });
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: reactExports.useCallback((response) => {
      setUploadError(null);
      saveDocMeta.mutate({
        filename: response.metadata.name,
        storageKey: response.objectPath,
        mimeType: response.metadata.contentType || null,
        fileSizeBytes: response.metadata.size || null,
        uploadedBy: uploadedBy.trim() || ""
      });
    }, [uploadedBy, saveDocMeta]),
    onError: reactExports.useCallback((err) => setUploadError(err.message), [])
  });
  const qty = parseFloat(part.currentQuantity);
  const reorder = part.reorderLevel ? parseFloat(part.reorderLevel) : null;
  const isLow = reorder !== null && qty <= reorder;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/20 z-40", onClick: onClose }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed top-0 right-0 h-full w-[440px] bg-white shadow-2xl z-50 flex flex-col overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between px-5 py-4 border-b bg-gray-50 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 pr-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-gray-900 leading-snug truncate", children: part.name }),
          part.productCode && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-mono text-gray-400 mt-0.5", children: part.productCode })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-8 w-8 p-0", onClick: () => onEdit(part), title: "Edit part", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-8 w-8 p-0", onClick: onClose, title: "Close panel", "aria-label": "Close panel", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("mx-5 mt-4 rounded-lg px-4 py-3 flex items-center justify-between", isLow ? "bg-amber-50 border border-amber-200" : "bg-green-50 border border-green-200"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-gray-500 uppercase tracking-wide", children: "Current Stock" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: cn("text-2xl font-bold mt-0.5", isLow ? "text-amber-700" : "text-green-700"), children: [
              isNaN(qty) ? "—" : qty,
              part.unit ? ` ${part.unit}` : ""
            ] })
          ] }),
          isLow && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 rounded-full px-2 py-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
              "Low Stock"
            ] }),
            reorder && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-600 mt-1", children: [
              "Reorder at ",
              reorder,
              part.unit ? ` ${part.unit}` : ""
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 mt-4 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-400 uppercase tracking-wide", children: "Details" }),
          [
            { label: "Category", value: part.category },
            { label: "Unit Cost", value: part.unitCostPence ? `£${(part.unitCostPence / 100).toFixed(2)} per ${part.unit ?? "unit"}` : null },
            { label: "Sell Price", value: part.unitSellPricePence ? `£${(part.unitSellPricePence / 100).toFixed(2)} per ${part.unit ?? "unit"}` : null },
            { label: "Default Supplier", value: part.supplierName },
            { label: "Reorder Level", value: reorder ? `${reorder}${part.unit ? ` ${part.unit}` : ""}` : null }
          ].filter((r) => r.value).map(({ label, value }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500 shrink-0 w-32", children: label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-900 text-right", children: value })
          ] }, label)),
          (part.bayName || part.storageLocation) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500 shrink-0 w-32", children: "Location" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-900 text-right", children: part.bayName ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              part.rowName && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-400", children: [
                part.rowName,
                " / "
              ] }),
              part.bayName,
              part.shelfName && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                " / ",
                part.shelfName
              ] })
            ] }) : part.storageLocation })
          ] }),
          part.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-xs text-gray-500 bg-gray-50 rounded-md px-3 py-2 leading-relaxed", children: part.notes }),
          part.supersededById && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-amber-800", children: "This part has been superseded" }),
              part.supersededByName && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-700 mt-0.5", children: [
                "Replaced by: ",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
                  part.supersededByName,
                  part.supersededByProductCode && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 font-mono font-normal text-amber-600", children: part.supersededByProductCode })
                ] })
              ] }),
              part.supersededAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-600 mt-0.5", children: [
                "Effective: ",
                new Date(part.supersededAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
              ] }),
              part.supersessionNotes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-700 mt-1 italic", children: part.supersessionNotes })
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 mt-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-400 uppercase tracking-wide", children: "Part QR Code" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                className: "text-xs text-primary underline underline-offset-2 hover:no-underline flex items-center gap-1",
                onClick: () => {
                  const qrValue = `${window.location.origin}/dashboard/workshop?part=${part.id}`;
                  const w = window.open("", "_blank");
                  if (!w) return;
                  w.document.write(`<!DOCTYPE html><html><head><title>QR — ${part.name}</title><style>body{font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#fff}canvas,svg{width:180px!important;height:180px!important}h2{font-size:16px;margin-top:12px;text-align:center}p{font-size:11px;color:#666;margin:4px 0;text-align:center}@media print{button{display:none}}</style></head><body><div id="qr"></div><h2>${part.name}</h2>${part.productCode ? `<p>Code: ${part.productCode}</p>` : ""}<p style="font-size:9px;color:#999;margin-top:8px">${qrValue}</p><br><button onclick="window.print()">🖨 Print</button><script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script><script>new QRCode(document.getElementById('qr'),{text:"${qrValue}",width:180,height:180})<\/script></body></html>`);
                  w.document.close();
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-3.5 w-3.5" }),
                  "Print Label"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center bg-white border rounded-lg p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(QRCodeSVG, { value: `${window.location.origin}/dashboard/workshop?part=${part.id}`, size: 120, level: "M" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 text-center mt-1.5", children: "Scan to open this part record" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 mt-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-400 uppercase tracking-wide", children: "Parts Documents" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400", children: "Spec sheets, data sheets, fitting guides" })
          ] }),
          docsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-4 text-center text-gray-300", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin mx-auto" }) }) : docs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-6 text-center text-gray-400 border-2 border-dashed rounded-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-8 w-8 mx-auto mb-2 text-gray-300" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "No documents attached" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1", children: "Upload spec sheets, fitting guides, or data sheets below" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: docs.map((doc) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-2.5 rounded-lg border bg-gray-50 hover:bg-white transition-colors group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0", children: fileIcon(doc.mimeType) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-900 truncate", children: doc.filename }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400", children: [
                doc.uploadedBy ? `Uploaded by ${doc.uploadedBy} · ` : "",
                new Date(doc.uploadedAt).toLocaleDateString("en-GB"),
                doc.fileSizeBytes ? ` · ${fmtFileSize(doc.fileSizeBytes)}` : ""
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "a",
                {
                  href: `/api/storage${doc.storageKey}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "p-1.5 text-gray-400 hover:text-blue-600 rounded transition-colors",
                  title: "Open / download",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  className: "p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors opacity-0 group-hover:opacity-100",
                  title: "Remove document",
                  onClick: () => deleteDoc.mutate(doc.id),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" })
                }
              )
            ] })
          ] }, doc.id)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-lg border bg-gray-50 p-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-gray-600 flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-3.5 w-3.5" }),
              "Upload Document"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs", children: [
                "Uploaded By ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "(optional)" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-7 text-xs mt-1", value: uploadedBy, onChange: (e) => setUploadedBy(e.target.value), placeholder: "Your name" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "File" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  ref: fileInputRef,
                  type: "file",
                  className: "mt-1 block w-full text-xs text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer",
                  accept: ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.txt",
                  disabled: isUploading || saveDocMeta.isPending,
                  onChange: (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadError(null);
                      uploadFile(file);
                    }
                  }
                }
              )
            ] }),
            isUploading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-primary", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }),
                "Uploading… ",
                progress > 0 ? `${Math.round(progress)}%` : ""
              ] }),
              progress > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1 rounded-full bg-gray-200 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-primary rounded-full transition-all", style: { width: `${progress}%` } }) })
            ] }),
            saveDocMeta.isPending && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400 flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }),
              "Saving…"
            ] }),
            uploadError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600", children: uploadError }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "PDF, Word, Excel, images accepted" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8" })
      ] })
    ] })
  ] });
}
function PartsStoreTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: membersData, isLoading: membersLoading } = useFarmMembers(farmId);
  const staffNames = (membersData?.members ?? []).map((m) => memberFullName(m));
  const [view, setView] = reactExports.useState("catalogue");
  const [search, setSearch] = reactExports.useState("");
  const [catFilter, setCatFilter] = reactExports.useState("all");
  const [showSuperseded, setShowSuperseded] = reactExports.useState(false);
  const [selectedPart, setSelectedPart] = reactExports.useState(null);
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(EMPTY_PART);
  const [receiveOpen, setReceiveOpen] = reactExports.useState(false);
  const [receivePart, setReceivePart] = reactExports.useState(null);
  const [receiveForm, setReceiveForm] = reactExports.useState({ qty: "", unitCostPence: "", supplierId: "", invoiceRef: "", date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), notes: "", performedBy: "" });
  const [useOpen, setUseOpen] = reactExports.useState(false);
  const [usePart, setUsePart] = reactExports.useState(null);
  const [useForm, setUseForm] = reactExports.useState({ qty: "", jobId: "", performedBy: "", notes: "" });
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [locationManagerOpen, setLocationManagerOpen] = reactExports.useState(false);
  const [formBayId, setFormBayId] = reactExports.useState("");
  const [formRowId, setFormRowId] = reactExports.useState("");
  const { data: parts = [], isLoading } = useQuery({ queryKey: ["workshop-parts", farmId], queryFn: () => fetch(api(`farms/${farmId}/workshop/parts`), { credentials: "include" }).then((r) => r.json()) });
  const { data: bays = [] } = useQuery({ queryKey: ["workshop-bays", farmId], queryFn: () => fetch(api(`farms/${farmId}/workshop/bays`), { credentials: "include" }).then((r) => r.json()) });
  const { data: rowsData } = useQuery({ queryKey: ["workshop-rows", farmId], queryFn: () => fetch(api(`farms/${farmId}/workshop/rows`), { credentials: "include" }).then((r) => r.json()) });
  const rows = rowsData?.rows ?? [];
  const hasUnassignedBays = (rowsData?.unassignedBays ?? []).length > 0;
  const { data: movements = [] } = useQuery({ queryKey: ["workshop-parts-movements", farmId], queryFn: () => fetch(api(`farms/${farmId}/workshop/parts/movements`), { credentials: "include" }).then((r) => r.json()), enabled: view === "history" });
  const { data: jobsData } = useQuery({ queryKey: ["workshop-jobs", farmId], queryFn: () => fetch(api(`farms/${farmId}/workshop/jobs`), { credentials: "include" }).then((r) => r.json()) });
  const { data: suppliersData } = useQuery({ queryKey: ["suppliers-list", farmId], queryFn: () => fetch(api(`farms/${farmId}/suppliers`), { credentials: "include" }).then((r) => {
    if (!r.ok) return [];
    return r.json().then((d) => Array.isArray(d) ? d : []);
  }) });
  const openJobs = (jobsData?.jobs ?? []).filter((j) => !["completed", "cancelled"].includes(j.job.status));
  const suppliers = Array.isArray(suppliersData) ? suppliersData : [];
  function setF(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  const savePart = useMutation({
    mutationFn: async (body) => {
      const supplierId = body.defaultSupplierId && body.defaultSupplierId !== "__none__" ? body.defaultSupplierId : null;
      const payload = { ...body, unitCostPence: body.unitCostPence ? Math.round(parseFloat(body.unitCostPence) * 100) : null, unitSellPricePence: body.unitSellPricePence ? Math.round(parseFloat(body.unitSellPricePence) * 100) : null, reorderLevel: body.reorderLevel || null, shelfId: body.shelfId || null, defaultSupplierId: supplierId };
      const url = editing ? api(`farms/${farmId}/workshop/parts/${editing.id}`) : api(`farms/${farmId}/workshop/parts`);
      return fetch(url, { method: editing ? "PUT" : "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workshop-parts", farmId] });
      setAddOpen(false);
      setEditing(null);
      setForm(EMPTY_PART);
      setFormBayId("");
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deletePart = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/workshop/parts/${id}`), { method: "DELETE", credentials: "include" }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workshop-parts", farmId] });
      setDeleteId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const receive = useMutation({
    mutationFn: (body) => fetch(api(`farms/${farmId}/workshop/parts/receive`), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stockItemId: receivePart?.id, quantity: body.qty, supplierId: body.supplierId || null, unitCostPence: body.unitCostPence || null, invoiceReference: body.invoiceRef, deliveryDate: body.date, notes: body.notes, performedBy: body.performedBy }) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workshop-parts", farmId] });
      qc.invalidateQueries({ queryKey: ["workshop-parts-movements", farmId] });
      setReceiveOpen(false);
      setReceiveForm({ qty: "", unitCostPence: "", supplierId: "", invoiceRef: "", date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), notes: "", performedBy: "" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const useParts = useMutation({
    mutationFn: (body) => fetch(api(`farms/${farmId}/workshop/parts/use`), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stockItemId: usePart?.id, quantity: body.qty, jobId: body.jobId || null, performedBy: body.performedBy, notes: body.notes }) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workshop-parts", farmId] });
      qc.invalidateQueries({ queryKey: ["workshop-parts-movements", farmId] });
      qc.invalidateQueries({ queryKey: ["workshop-jobs", farmId] });
      setUseOpen(false);
      setUseForm({ qty: "", jobId: "", performedBy: "", notes: "" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const lowStock = parts.filter((p) => p.reorderLevel && parseFloat(p.currentQuantity) <= parseFloat(p.reorderLevel));
  const supersededCount = parts.filter((p) => p.supersededById).length;
  const filteredParts = parts.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || (p.productCode ?? "").toLowerCase().includes(q) || (p.category ?? "").toLowerCase().includes(q) || (p.storageLocation ?? "").toLowerCase().includes(q) || (p.shelfName ?? "").toLowerCase().includes(q) || (p.bayName ?? "").toLowerCase().includes(q) || (p.rowName ?? "").toLowerCase().includes(q);
    const matchesCat = catFilter === "all" || p.category === catFilter;
    const matchesSuperseded = showSuperseded || !p.supersededById;
    return matchesSearch && matchesCat && matchesSuperseded;
  });
  function openAdd() {
    setEditing(null);
    setForm(EMPTY_PART);
    setFormBayId("");
    setFormRowId("");
    setAddOpen(true);
  }
  function openEdit(p) {
    setEditing(p);
    setForm({ name: p.name, category: p.category ?? "", productCode: p.productCode ?? "", unit: p.unit ?? "", reorderLevel: p.reorderLevel ?? "", unitCostPence: p.unitCostPence ? (p.unitCostPence / 100).toFixed(2) : "", unitSellPricePence: p.unitSellPricePence ? (p.unitSellPricePence / 100).toFixed(2) : "", shelfId: p.shelfId ? String(p.shelfId) : "", defaultSupplierId: p.defaultSupplierId ? String(p.defaultSupplierId) : "", notes: p.notes ?? "", supersededById: p.supersededById ? String(p.supersededById) : "", supersessionNotes: p.supersessionNotes ?? "", supersededAt: p.supersededAt ?? "", supersedesId: "" });
    setFormRowId(p.rowId ? String(p.rowId) : "");
    setFormBayId(p.bayId ? String(p.bayId) : "");
    setAddOpen(true);
    setSelectedPart(null);
  }
  function openReceive(p) {
    setReceivePart(p);
    setReceiveForm({ qty: "", unitCostPence: p.unitCostPence ? (p.unitCostPence / 100).toFixed(2) : "", supplierId: p.defaultSupplierId ? String(p.defaultSupplierId) : "", invoiceRef: "", date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), notes: "", performedBy: "" });
    setReceiveOpen(true);
  }
  function openUse(p) {
    setUsePart(p);
    setUseForm({ qty: "", jobId: "", performedBy: "", notes: "" });
    setUseOpen(true);
  }
  function fmtQty(qty, unit) {
    const n = parseFloat(qty);
    return `${isNaN(n) ? 0 : n}${unit ? ` ${unit}` : ""}`;
  }
  function fmtCost(pence) {
    return pence ? `£${(pence / 100).toFixed(2)}` : "—";
  }
  function fmtDate(s) {
    return new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-12 text-center text-gray-400", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin mx-auto" }) });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setView("catalogue"), className: cn("px-3 py-1 rounded-full text-xs font-medium border transition-colors", view === "catalogue" ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-3 w-3 inline-block mr-1" }),
          "Parts Catalogue"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setView("history"), className: cn("px-3 py-1 rounded-full text-xs font-medium border transition-colors", view === "history" ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-3 w-3 inline-block mr-1" }),
          "Movement History"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setView("returns"), className: cn("px-3 py-1 rounded-full text-xs font-medium border transition-colors", view === "returns" ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpFromLine, { className: "h-3 w-3 inline-block mr-1" }),
          "Goods Returns"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setView("stocktake"), className: cn("px-3 py-1 rounded-full text-xs font-medium border transition-colors", view === "stocktake" ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-3 w-3 inline-block mr-1" }),
          "Stocktake"
        ] })
      ] }),
      view === "catalogue" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setLocationManagerOpen(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: "h-4 w-4 mr-1" }),
          "Manage Locations"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
          "Add Part"
        ] })
      ] })
    ] }),
    view === "catalogue" && lowStock.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-sm text-amber-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 text-amber-500 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
          lowStock.length,
          " part",
          lowStock.length > 1 ? "s" : ""
        ] }),
        " at or below reorder level: ",
        lowStock.map((p) => p.name).join(", ")
      ] })
    ] }),
    view === "catalogue" && parts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 min-w-[200px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            className: "pl-8 h-8 text-sm",
            placeholder: "Search parts by name, code, category or location…",
            value: search,
            onChange: (e) => setSearch(e.target.value)
          }
        ),
        search && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600", onClick: () => setSearch(""), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "select",
        {
          className: "h-8 text-sm border border-gray-200 rounded-md px-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary",
          value: catFilter,
          onChange: (e) => setCatFilter(e.target.value),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All categories" }),
            PART_CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c, children: c }, c))
          ]
        }
      ),
      supersededCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setShowSuperseded((v) => !v),
          className: cn("h-8 text-xs px-2.5 rounded-md border flex items-center gap-1.5 whitespace-nowrap", showSuperseded ? "bg-amber-50 border-amber-200 text-amber-700" : "border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300"),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-3.5 w-3.5" }),
            showSuperseded ? "Hiding superseded" : `${supersededCount} superseded`
          ]
        }
      ),
      (search || catFilter !== "all" || showSuperseded) && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-400", children: [
        filteredParts.length,
        " of ",
        parts.length,
        " part",
        parts.length !== 1 ? "s" : ""
      ] })
    ] }),
    view === "catalogue" && (parts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-gray-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-10 w-10 mx-auto mb-3 text-gray-300" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-500 mb-1", children: "No parts registered yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Add parts to track stock levels, receive deliveries, and log usage against job cards." })
    ] }) : filteredParts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-gray-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-8 w-8 mx-auto mb-2 text-gray-300" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-500", children: "No parts match your search" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-1", children: "Try adjusting the search term or category filter" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-gray-200 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400 px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-3 w-3" }),
        "Click a row to view details and manage documents"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "bg-gray-50 border-b border-gray-200", children: ["Part / Part No.", "Category", "Location", "In Stock", "Reorder At", "Cost Price", "Sell Price", "Supplier", "Actions"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap", children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-gray-100", children: filteredParts.map((p) => {
          const qty = parseFloat(p.currentQuantity);
          const reorder = p.reorderLevel ? parseFloat(p.reorderLevel) : null;
          const isLow = reorder !== null && qty <= reorder;
          const isSelected = selectedPart?.id === p.id;
          const isSuperseded = !!p.supersededById;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "tr",
            {
              className: cn("cursor-pointer transition-colors", isSelected ? "bg-primary/5 ring-1 ring-inset ring-primary/20" : isSuperseded ? "bg-gray-50/60 hover:bg-gray-100/60 opacity-75" : "hover:bg-gray-50/80"),
              onClick: () => setSelectedPart(isSelected ? null : p),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn("font-medium", isSuperseded ? "text-gray-500 line-through decoration-gray-400" : "text-gray-900"), children: p.name }),
                      isSuperseded && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-200 whitespace-nowrap", children: "Superseded" })
                    ] }),
                    p.productCode && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 font-mono", children: p.productCode }),
                    isSuperseded && p.supersededByName && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-primary mt-0.5", children: [
                      "→ ",
                      p.supersededByName,
                      p.supersededByProductCode && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 ml-1 font-mono", children: p.supersededByProductCode })
                    ] })
                  ] }),
                  isSelected && /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5 text-primary ml-1 shrink-0" })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-gray-600", children: p.category || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: p.bayName ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs", children: [
                  p.rowName && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-400", children: p.rowName }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 font-medium", children: p.bayName }),
                  p.shelfName && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-400", children: p.shelfName })
                ] }) : p.storageLocation ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600 text-xs", children: p.storageLocation }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-300", children: "—" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("font-semibold", isLow ? "text-amber-600" : "text-gray-900"), children: fmtQty(p.currentQuantity, p.unit) }),
                  isLow && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1.5 text-xs text-amber-500 font-medium", children: "Low" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-gray-500", children: p.reorderLevel ? fmtQty(p.reorderLevel, p.unit) : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-gray-600", children: fmtCost(p.unitCostPence) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-gray-500", children: p.unitSellPricePence ? fmtCost(p.unitSellPricePence) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-300", children: "—" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-gray-500 text-xs", children: p.supplierName || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-7 px-2 text-xs gap-1", onClick: () => openReceive(p), title: "Receive stock", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDownToLine, { className: "h-3 w-3" }),
                    "In"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-7 px-2 text-xs gap-1", onClick: () => openUse(p), title: "Use / issue", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpFromLine, { className: "h-3 w-3" }),
                    "Use"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEdit(p), className: "p-1 text-gray-400 hover:text-gray-700 rounded", title: "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteId(p.id), className: "p-1 text-gray-400 hover:text-red-500 rounded", title: "Remove", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
                ] }) })
              ]
            },
            p.id
          );
        }) })
      ] })
    ] })),
    selectedPart && /* @__PURE__ */ jsxRuntimeExports.jsx(
      PartPanel,
      {
        farmId,
        part: selectedPart,
        onClose: () => setSelectedPart(null),
        onEdit: openEdit
      }
    ),
    view === "history" && (movements.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-gray-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-10 w-10 mx-auto mb-3 text-gray-300" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-500", children: "No movements recorded yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Stock receipts and usage will appear here." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-gray-200 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "bg-gray-50 border-b border-gray-200", children: ["Date", "Part", "Type", "Qty Change", "Reference", "Performed By", "Notes"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-gray-100", children: movements.map((m) => {
        const qty = parseFloat(m.quantityChange);
        const isIn = qty > 0;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-gray-500 whitespace-nowrap", children: fmtDate(m.movedAt) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium text-gray-900", children: m.partName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cn("inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5", isIn ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"), children: [
            isIn ? /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDownToLine, { className: "h-3 w-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpFromLine, { className: "h-3 w-3" }),
            isIn ? "Received" : "Issued"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: cn("px-4 py-3 font-semibold tabular-nums", isIn ? "text-green-700" : "text-blue-700"), children: [
            isIn ? "+" : "",
            qty,
            m.unit ? ` ${m.unit}` : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-gray-500 text-xs", children: m.referenceType === "workshop_job" && m.referenceId ? `Job #${m.referenceId}` : m.referenceType === "workshop_delivery" ? "Delivery" : m.referenceType || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-gray-600", children: m.performedBy || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-gray-500", children: m.notes || "—" })
        ] }, m.id);
      }) })
    ] }) })),
    view === "returns" && /* @__PURE__ */ jsxRuntimeExports.jsx(GoodsReturnsView, { farmId, parts, staffNames, membersLoading }),
    view === "stocktake" && /* @__PURE__ */ jsxRuntimeExports.jsx(WorkshopStocktakeView, { farmId }),
    addOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => {
      setAddOpen(false);
      setEditing(null);
      setForm(EMPTY_PART);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Part" : "Add New Part" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Part Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.name, onChange: (e) => setF("name", e.target.value), placeholder: "e.g. Oil Filter — Massey 5710" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            OtherSelect,
            {
              options: PART_CATEGORIES,
              value: form.category,
              onValueChange: (v) => setF("category", v),
              placeholder: "Select category…",
              specifyPlaceholder: "Please specify category…"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Part / Product Code" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.productCode, onChange: (e) => setF("productCode", e.target.value), placeholder: "e.g. OFS-1234" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Unit" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.unit, onValueChange: (v) => setF("unit", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { className: "max-h-56", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectGroup, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectLabel, { children: "Countable" }),
                ["each", "pair", "set", "box", "bag", "roll", "drum", "sheet", "tube", "cartridge"].map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: u, children: u }, u))
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectGroup, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectLabel, { children: "Liquid volume" }),
                ["ml", "litre", "gallon"].map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: u, children: u }, u))
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectGroup, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectLabel, { children: "Weight" }),
                ["g", "kg", "tonne"].map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: u, children: u }, u))
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectGroup, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectLabel, { children: "Length" }),
                ["mm", "metre"].map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: u, children: u }, u))
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cost Price (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", value: form.unitCostPence, onChange: (e) => setF("unitCostPence", e.target.value), placeholder: "0.00" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Sell Price (£) ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-normal", children: "— external customers" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", value: form.unitSellPricePence, onChange: (e) => setF("unitSellPricePence", e.target.value), placeholder: "0.00" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Reorder Level",
            form.unit ? ` (${form.unit})` : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: qtyStep(form.unit), min: "0", value: form.reorderLevel, onChange: (e) => setF("reorderLevel", e.target.value), placeholder: WHOLE_UNITS.includes((form.unit ?? "").toLowerCase()) ? "e.g. 2" : "e.g. 5.0" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Storage Location ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-normal", children: "— Row, Bay & Shelf" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "text-xs text-primary underline underline-offset-2 hover:no-underline", onClick: () => setLocationManagerOpen(true), children: "Manage Locations" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: formRowId, onValueChange: (v) => {
              setFormRowId(v);
              setFormBayId("");
              setF("shelfId", "");
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Row…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "No row" }),
                rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(r.id), children: r.name }, r.id)),
                hasUnassignedBays && /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__unassigned__", children: "Unassigned" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: formBayId, onValueChange: (v) => {
              setFormBayId(v);
              setF("shelfId", "");
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Bay…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "No bay" }),
                bays.filter((b) => !formRowId || formRowId === "__none__" ? !b.rowId : formRowId === "__unassigned__" ? !b.rowId : String(b.rowId) === formRowId).map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(b.id), children: b.name }, b.id))
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.shelfId, onValueChange: (v) => setF("shelfId", v), disabled: !formBayId || formBayId === "__none__", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Shelf…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "No shelf" }),
                (bays.find((b) => String(b.id) === formBayId)?.shelves ?? []).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(s.id), children: s.name }, s.id))
              ] })
            ] })
          ] }),
          bays.length === 0 && rows.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400 mt-1", children: [
            "No locations set up yet — click ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "Manage Locations" }),
            " to create Rows, Bays and Shelves."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Default Supplier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.defaultSupplierId || "__none__", onValueChange: (v) => setF("defaultSupplierId", v === "__none__" ? "" : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "None" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "None" }),
              suppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(s.id), children: s.name }, s.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes, onChange: (e) => setF("notes", e.target.value), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border-t border-gray-100 pt-3 mt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2", children: "Supersession" }),
          editing ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs", children: [
                "Superseded by ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-normal", children: "(mark this part as replaced by another)" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.supersededById || "__none__", onValueChange: (v) => setF("supersededById", v === "__none__" ? "" : v), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Not superseded" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not superseded" }),
                  parts.filter((x) => x.id !== editing.id && !x.supersededById).map((x) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(x.id), children: [
                    x.name,
                    x.productCode && ` (${x.productCode})`
                  ] }, x.id))
                ] })
              ] })
            ] }),
            form.supersededById && form.supersededById !== "__none__" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Effective Date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1 h-8 text-sm", value: form.supersededAt, onChange: (e) => setF("supersededAt", e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Reason / Notes" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1 h-8 text-sm", placeholder: "e.g. Updated design, Rev 2", value: form.supersessionNotes, onChange: (e) => setF("supersessionNotes", e.target.value) })
              ] })
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs", children: [
              "This part replaces (optional) ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-normal", children: "— marks the old part as superseded" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.supersedesId || "__none__", onValueChange: (v) => setF("supersedesId", v === "__none__" ? "" : v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Does not replace any part" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Does not replace any part" }),
                parts.filter((x) => !x.supersededById).map((x) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(x.id), children: [
                  x.name,
                  x.productCode && ` (${x.productCode})`
                ] }, x.id))
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setAddOpen(false);
          setEditing(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => savePart.mutate(form), disabled: !form.name || savePart.isPending, children: savePart.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : editing ? "Save Changes" : "Add Part" })
      ] })
    ] }) }),
    receiveOpen && receivePart && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setReceiveOpen(false), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Receive Stock — ",
        receivePart.name
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Quantity Received *",
            receivePart.unit ? ` (${receivePart.unit})` : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: qtyStep(receivePart.unit), min: qtyMin(receivePart.unit), value: receiveForm.qty, onChange: (e) => setReceiveForm((f) => ({ ...f, qty: e.target.value })), placeholder: qtyPlaceholder(receivePart.unit) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Unit Cost (£ per ",
            receivePart.unit ?? "unit",
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", value: receiveForm.unitCostPence, onChange: (e) => setReceiveForm((f) => ({ ...f, unitCostPence: e.target.value })), placeholder: "0.00" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Delivery Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: receiveForm.date, onChange: (e) => setReceiveForm((f) => ({ ...f, date: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: receiveForm.supplierId || "__none__", onValueChange: (v) => setReceiveForm((f) => ({ ...f, supplierId: v === "__none__" ? "" : v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "None" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "None" }),
              suppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(s.id), children: s.name }, s.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Invoice / Order Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: receiveForm.invoiceRef, onChange: (e) => setReceiveForm((f) => ({ ...f, invoiceRef: e.target.value })), placeholder: "e.g. INV-2025-001" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Received By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: receiveForm.performedBy, onChange: (e) => setReceiveForm((f) => ({ ...f, performedBy: e.target.value })), placeholder: "Name of person" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: receiveForm.notes, onChange: (e) => setReceiveForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setReceiveOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => receive.mutate(receiveForm), disabled: !receiveForm.qty || receive.isPending, children: receive.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDownToLine, { className: "h-4 w-4 mr-1" }),
          "Receive Stock"
        ] }) })
      ] })
    ] }) }),
    useOpen && usePart && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setUseOpen(false), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Issue Parts — ",
        usePart.name
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-4 w-4 text-gray-400" }),
        "Current stock: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-gray-900", children: fmtQty(usePart.currentQuantity, usePart.unit) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Quantity Used *",
            usePart.unit ? ` (${usePart.unit})` : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: qtyStep(usePart.unit), min: qtyMin(usePart.unit), value: useForm.qty, onChange: (e) => setUseForm((f) => ({ ...f, qty: e.target.value })), placeholder: qtyPlaceholder(usePart.unit) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link to Job Card" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: useForm.jobId || "__none__", onValueChange: (v) => setUseForm((f) => ({ ...f, jobId: v === "__none__" ? "" : v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "None" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "No job" }),
              openJobs.map((j) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(j.job.id), children: [
                j.job.jobNumber,
                " — ",
                j.job.title
              ] }, j.job.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Issued By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSelect, { value: useForm.performedBy, onChange: (v) => setUseForm((f) => ({ ...f, performedBy: v })), staffNames, loading: membersLoading })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: useForm.notes, onChange: (e) => setUseForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setUseOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => useParts.mutate(useForm), disabled: !useForm.qty || useParts.isPending, children: useParts.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpFromLine, { className: "h-4 w-4 mr-1" }),
          "Issue Parts"
        ] }) })
      ] })
    ] }) }),
    deleteId !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setDeleteId(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Remove Part" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "This will remove the part from the catalogue. Stock movement history is retained." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deletePart.mutate(deleteId), disabled: deletePart.isPending, children: deletePart.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : "Remove" })
      ] })
    ] }) }),
    locationManagerOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(LocationManager, { farmId, onClose: () => {
      setLocationManagerOpen(false);
      qc.invalidateQueries({ queryKey: ["workshop-bays", farmId] });
    } })
  ] });
}
const WS_PIE_COLOURS = ["#f59e0b", "#16a34a", "#ef4444", "#8b5cf6", "#3b82f6", "#14b8a6"];
function WorkshopAnalyticsTab({ farmId }) {
  const { data: farmData } = useQuery({
    queryKey: ["farm", farmId],
    queryFn: () => fetch(api(`farms/${farmId}`), { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const farmName = farmData?.record?.name ?? "BDE Farm";
  const jobsQ = useQuery({
    queryKey: ["workshop-jobs", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/workshop/jobs`), { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => (d.jobs ?? []).map((j) => ({ ...j.job, equipmentName: j.equipmentName, assetNumber: j.assetNumber, customerName: j.customerName }))
  });
  const allJobs = jobsQ.data ?? [];
  const PERIODS = [
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
    { key: "last-month", label: "Last Month" },
    { key: "quarter", label: "This Quarter" },
    { key: "year", label: "This Year" },
    { key: "all", label: "All Time" }
  ];
  const [period, setPeriod] = reactExports.useState("month");
  const jobs = reactExports.useMemo(() => {
    if (period === "all") return allJobs;
    const now = /* @__PURE__ */ new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let start;
    let end = now;
    if (period === "week") {
      const dow = today.getDay();
      start = new Date(today);
      start.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
    } else if (period === "month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === "last-month") {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else if (period === "quarter") {
      const q = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), q * 3, 1);
    } else {
      start = new Date(now.getFullYear(), 0, 1);
    }
    return allJobs.filter((j) => {
      const ds = j.openedAt ?? j.completedAt ?? j.createdAt;
      if (!ds) return false;
      const d = new Date(ds);
      return d >= start && d <= end;
    });
  }, [allJobs, period]);
  const wipValue = reactExports.useMemo(() => allJobs.filter((j) => ["open", "in-progress"].includes(j.status)).reduce((s, j) => s + (j.labourCostPence ?? 0) + (j.partsCostPence ?? 0), 0) / 100, [allJobs]);
  const awaitingPartsCount = reactExports.useMemo(() => allJobs.filter((j) => j.status === "awaiting-parts").length, [allJobs]);
  const totalLabour = reactExports.useMemo(() => jobs.reduce((s, j) => s + (j.labourCostPence ?? 0), 0) / 100, [jobs]);
  const totalParts = reactExports.useMemo(() => jobs.reduce((s, j) => s + (j.partsCostPence ?? 0), 0) / 100, [jobs]);
  const totalCost = totalLabour + totalParts;
  const totalHours = reactExports.useMemo(() => jobs.reduce((s, j) => s + (j.labourHours ?? 0), 0), [jobs]);
  const completedCount = reactExports.useMemo(() => jobs.filter((j) => j.status === "completed").length, [jobs]);
  const chargeableJobs = reactExports.useMemo(() => jobs.filter((j) => j.customerId), [jobs]);
  const ownHoldingJobs = reactExports.useMemo(() => jobs.filter((j) => !j.customerId), [jobs]);
  const chargeableCost = chargeableJobs.reduce((s, j) => s + (j.labourCostPence ?? 0) + (j.partsCostPence ?? 0), 0) / 100;
  const ownHoldingCost = ownHoldingJobs.reduce((s, j) => s + (j.labourCostPence ?? 0) + (j.partsCostPence ?? 0), 0) / 100;
  const chargeableHours = chargeableJobs.reduce((s, j) => s + (j.labourHours ?? 0), 0);
  const ownHoldingHours = ownHoldingJobs.reduce((s, j) => s + (j.labourHours ?? 0), 0);
  const staffData = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    jobs.forEach((j) => {
      const name = j.assignedTo?.trim() || "Unassigned";
      if (!m.has(name)) m.set(name, { hours: 0, jobs: 0, cost: 0 });
      const b = m.get(name);
      b.hours += j.labourHours ?? 0;
      b.jobs++;
      b.cost += (j.labourCostPence ?? 0) / 100;
    });
    return [...m.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.hours - a.hours);
  }, [jobs]);
  const costByEquip = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    jobs.forEach((j) => {
      const name = j.equipmentName ?? (j.assetNumber ? `Asset ${j.assetNumber}` : j.equipmentId ? `Asset #${j.equipmentId}` : "No Asset");
      const key = String(j.equipmentId ?? name);
      if (!m.has(key)) m.set(key, { name, labour: 0, parts: 0 });
      const b = m.get(key);
      b.labour += (j.labourCostPence ?? 0) / 100;
      b.parts += (j.partsCostPence ?? 0) / 100;
    });
    return [...m.values()].map((e) => ({ ...e, total: e.labour + e.parts, labour: parseFloat(e.labour.toFixed(2)), parts: parseFloat(e.parts.toFixed(2)) })).sort((a, b) => b.total - a.total).slice(0, 12);
  }, [jobs]);
  const monthlyData = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    allJobs.forEach((j) => {
      const ds = j.openedAt ?? j.completedAt ?? j.createdAt;
      if (!ds) return;
      const d = new Date(ds);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
      if (!m.has(key)) m.set(key, { label, spend: 0, count: 0, hours: 0 });
      const b = m.get(key);
      b.spend += ((j.labourCostPence ?? 0) + (j.partsCostPence ?? 0)) / 100;
      b.count++;
      b.hours += j.labourHours ?? 0;
    });
    return [...m.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-18).map(([key, v]) => ({ ...v, key, spend: parseFloat(v.spend.toFixed(2)) }));
  }, [allJobs]);
  const periodMonths = reactExports.useMemo(() => {
    const ym = (y, mo) => `${y}-${String(mo + 1).padStart(2, "0")}`;
    const now = /* @__PURE__ */ new Date();
    if (period === "all") return null;
    if (period === "week" || period === "month") return /* @__PURE__ */ new Set([ym(now.getFullYear(), now.getMonth())]);
    if (period === "last-month") {
      const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return /* @__PURE__ */ new Set([ym(d.getFullYear(), d.getMonth())]);
    }
    if (period === "quarter") {
      const q = Math.floor(now.getMonth() / 3);
      return new Set([0, 1, 2].map((i) => ym(now.getFullYear(), q * 3 + i)));
    }
    if (period === "year") {
      return new Set(Array.from({ length: now.getMonth() + 1 }, (_, i) => ym(now.getFullYear(), i)));
    }
    return null;
  }, [period]);
  const statusData = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    jobs.forEach((j) => {
      const s = j.status ?? "unknown";
      m.set(s, (m.get(s) ?? 0) + 1);
    });
    return [...m.entries()].map(([name, value]) => ({ name: JOB_STATUS[name]?.label ?? name, value }));
  }, [jobs]);
  const splitData = [{ name: "Labour", value: parseFloat(totalLabour.toFixed(2)) }, { name: "Parts", value: parseFloat(totalParts.toFixed(2)) }];
  const fmt = (v) => `£${v.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const periodLabel = PERIODS.find((p) => p.key === period)?.label ?? "";
  function printReport() {
    const completed = jobs.filter((j) => j.status === "completed");
    const ra = "text-align:right";
    const summaryHtml = `
<div class="section-head">Summary — ${periodLabel}</div>
<table><thead><tr>
  <th>Metric</th><th>Value</th><th>Detail</th>
</tr></thead><tbody>
  <tr><td>Jobs in Period</td><td style="${ra}">${jobs.length}</td><td>${completedCount} completed · ${awaitingPartsCount} awaiting parts · ${jobs.length - completedCount - awaitingPartsCount} other</td></tr>
  <tr><td>Labour Hours</td><td style="${ra}">${totalHours} hrs</td><td>${chargeableHours} chargeable · ${ownHoldingHours} own holding</td></tr>
  <tr><td>Total Spend</td><td style="${ra}">${fmt(totalCost)}</td><td>Labour ${fmt(totalLabour)} · Parts ${fmt(totalParts)}</td></tr>
  <tr><td>Chargeable Revenue</td><td style="${ra}">${fmt(chargeableCost)}</td><td>${chargeableJobs.length} jobs · ${chargeableHours} hrs</td></tr>
  <tr><td>Own Holding Cost</td><td style="${ra}">${fmt(ownHoldingCost)}</td><td>${ownHoldingJobs.length} jobs · ${ownHoldingHours} hrs</td></tr>
  <tr><td>WIP Value (Live)</td><td style="${ra}">${fmt(wipValue)}</td><td>Open &amp; in-progress jobs</td></tr>
</tbody></table>`;
    const staffHtml = staffData.length > 0 ? `
<div class="section-head">Hours by Staff Member</div>
<table><thead><tr><th>Staff Member</th><th style="${ra}">Hours</th><th style="${ra}">Jobs</th><th style="${ra}">Labour Cost</th></tr></thead><tbody>
${staffData.map((s) => `<tr><td>${s.name}</td><td style="${ra}">${s.hours}</td><td style="${ra}">${s.jobs}</td><td style="${ra}">${fmt(s.cost)}</td></tr>`).join("")}
</tbody></table>` : "";
    const assetHtml = costByEquip.length > 0 ? `
<div class="section-head">Cost by Asset / Machine</div>
<table><thead><tr><th>Asset</th><th style="${ra}">Labour</th><th style="${ra}">Parts</th><th style="${ra}">Total</th></tr></thead><tbody>
${costByEquip.map((e) => `<tr><td>${e.name}</td><td style="${ra}">${fmt(e.labour)}</td><td style="${ra}">${fmt(e.parts)}</td><td style="${ra}">${fmt(e.labour + e.parts)}</td></tr>`).join("")}
</tbody></table>` : "";
    const jobHtml = completed.length > 0 ? `
<div class="section-head">Completed Jobs (${completed.length})</div>
<table><thead><tr><th>Job No.</th><th>Description</th><th>Asset</th><th>Customer / Type</th><th style="${ra}">Hours</th><th style="${ra}">Labour</th><th style="${ra}">Parts</th><th style="${ra}">Total</th></tr></thead><tbody>
${completed.map((j) => `<tr><td>${j.jobNumber ?? "—"}</td><td>${j.description ?? "—"}</td><td>${j.equipmentName ?? "—"}</td><td>${j.customerName ?? "Own Holding"}</td><td style="${ra}">${j.labourHours ?? 0}</td><td style="${ra}">${fmt((j.labourCostPence ?? 0) / 100)}</td><td style="${ra}">${fmt((j.partsCostPence ?? 0) / 100)}</td><td style="${ra}">${fmt(((j.labourCostPence ?? 0) + (j.partsCostPence ?? 0)) / 100)}</td></tr>`).join("")}
</tbody></table>` : "";
    printProReport({
      title: "Workshop Management Report",
      farmName,
      subtitle: periodLabel,
      tableHtml: summaryHtml + staffHtml + assetHtml + jobHtml,
      footerNote: "Workshop records — retain for a minimum of 3 years.",
      landscape: true
    });
  }
  if (jobsQ.isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-16 text-center text-gray-400 flex items-center justify-center gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-5 h-5 animate-spin" }),
    "Loading workshop data\\u2026"
  ] });
  if (allJobs.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-12 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { className: "w-10 h-10 mx-auto mb-3 text-gray-300" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-600", children: "No job cards yet" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400", children: "Create job cards to see analytics here." })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-gray-400 uppercase tracking-wide mr-1", children: "Period" }),
        PERIODS.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setPeriod(p.key),
            className: cn("px-3 py-1 rounded-full text-xs font-semibold border transition-colors", period === p.key ? "bg-amber-500 text-white border-amber-500" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"),
            children: p.label
          },
          p.key
        ))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: printReport, className: "flex items-center gap-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-md px-3 py-1.5 hover:bg-gray-50 hover:border-gray-300 transition-colors", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-3.5 w-3.5" }),
        "Management Report"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-xl p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 uppercase font-medium mb-1", children: "Total Job Cost" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-amber-700", children: fmt(totalCost) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
          "Labour ",
          fmt(totalLabour),
          " · Parts ",
          fmt(totalParts)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-xl p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 uppercase font-medium mb-1", children: "Labour Hours" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-blue-700", children: [
          totalHours,
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-normal text-blue-400", children: "hrs" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
          chargeableHours,
          " chargeable · ",
          ownHoldingHours,
          " own holding"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 border border-green-200 rounded-xl p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 uppercase font-medium mb-1", children: "Jobs Completed" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-green-700", children: completedCount }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
          "of ",
          jobs.length,
          " in period"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-purple-50 border border-purple-200 rounded-xl p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 uppercase font-medium mb-1", children: "WIP / Open Value" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-purple-700", children: fmt(wipValue) }),
        awaitingPartsCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-orange-500 font-medium mt-1", children: [
          awaitingPartsCount,
          " awaiting parts"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-4", children: "Chargeable vs Own Holding" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 uppercase font-medium mb-2.5", children: "By Cost" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 rounded-lg border border-orange-200 bg-orange-50 p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-orange-600 font-semibold", children: "Chargeable" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold text-orange-700 mt-1", children: fmt(chargeableCost) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400 mt-0.5", children: [
                chargeableJobs.length,
                " job",
                chargeableJobs.length !== 1 ? "s" : ""
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 rounded-lg border border-gray-200 bg-gray-50 p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600 font-semibold", children: "Own Holding" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold text-gray-700 mt-1", children: fmt(ownHoldingCost) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400 mt-0.5", children: [
                ownHoldingJobs.length,
                " job",
                ownHoldingJobs.length !== 1 ? "s" : ""
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 uppercase font-medium mb-2.5", children: "By Hours" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 rounded-lg border border-orange-200 bg-orange-50 p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-orange-600 font-semibold", children: "Chargeable" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-bold text-orange-700 mt-1", children: [
                chargeableHours,
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-normal", children: "hrs" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400 mt-0.5", children: [
                totalHours > 0 ? Math.round(chargeableHours / totalHours * 100) : 0,
                "% of total"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 rounded-lg border border-gray-200 bg-gray-50 p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600 font-semibold", children: "Own Holding" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-bold text-gray-700 mt-1", children: [
                ownHoldingHours,
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-normal", children: "hrs" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400 mt-0.5", children: [
                totalHours > 0 ? Math.round(ownHoldingHours / totalHours * 100) : 0,
                "% of total"
              ] })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
      staffData.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-4", children: "Hours by Staff Member" }),
        staffData.every((s) => s.hours === 0) ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 py-4 text-center", children: "No hours recorded for this period" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: Math.max(140, staffData.length * 38), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: staffData, layout: "vertical", margin: { top: 2, right: 48, left: 0, bottom: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f0f0f0", horizontal: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", tick: { fontSize: 11 }, tickFormatter: (v) => `${v}h` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "name", tick: { fontSize: 11 }, width: 110 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v} hrs`, "Hours"] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "hours", fill: "#3b82f6", radius: [0, 3, 3, 0], children: /* @__PURE__ */ jsxRuntimeExports.jsx(LabelList, { dataKey: "hours", position: "right", style: { fontSize: 11, fill: "#374151" }, formatter: (v) => v > 0 ? `${v}h` : "" }) })
        ] }) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400", children: "No staff assigned to jobs in this period" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-4", children: "Jobs by Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 220, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: statusData, dataKey: "value", nameKey: "name", cx: "40%", cy: "50%", outerRadius: 85, label: false, children: statusData.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: WS_PIE_COLOURS[i % WS_PIE_COLOURS.length] }, i)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { layout: "vertical", align: "right", verticalAlign: "middle", formatter: (n) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 12 }, children: n }) })
        ] }) })
      ] })
    ] }),
    costByEquip.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-4", children: "Cost by Asset / Machine (\\u00a3)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: Math.max(200, costByEquip.length * 36), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: costByEquip, layout: "vertical", margin: { top: 4, right: 24, left: 0, bottom: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f0f0f0", horizontal: false }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", tickFormatter: (v) => `£${v >= 1e3 ? `${(v / 1e3).toFixed(0)}k` : v.toFixed(0)}`, tick: { fontSize: 11 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "name", tick: { fontSize: 11 }, width: 140 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`£${v.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`, ""] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "labour", stackId: "a", fill: "#3b82f6", name: "Labour" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "parts", stackId: "a", fill: "#8b5cf6", name: "Parts", radius: [0, 3, 3, 0] })
      ] }) })
    ] }),
    monthlyData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-4", children: "Monthly Trend" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 240, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ComposedChart, { data: monthlyData, margin: { top: 4, right: 36, left: 0, bottom: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f0f0f0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tick: { fontSize: 10 }, interval: 0, angle: -35, textAnchor: "end", height: 48 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { yAxisId: "left", tickFormatter: (v) => `£${v >= 1e3 ? `${(v / 1e3).toFixed(0)}k` : v}`, tick: { fontSize: 11 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { yAxisId: "right", orientation: "right", tick: { fontSize: 11 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v, n) => n === "Spend" ? [`£${v.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`, "Spend"] : n === "Hours" ? [`${v} hrs`, "Hours"] : [String(v), "Jobs"] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { yAxisId: "left", dataKey: "spend", name: "Spend", radius: [2, 2, 0, 0], children: monthlyData.map((entry, i) => {
          const inPeriod = periodMonths === null || periodMonths.has(entry.key);
          return /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: inPeriod ? "#f59e0b" : "#fde68a", fillOpacity: inPeriod ? 0.9 : 0.45 }, i);
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { yAxisId: "right", type: "monotone", dataKey: "count", stroke: "#16a34a", strokeWidth: 2, dot: { r: 3, fill: "#16a34a" }, name: "Jobs" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { yAxisId: "right", type: "monotone", dataKey: "hours", stroke: "#3b82f6", strokeWidth: 2, strokeDasharray: "4 2", dot: { r: 3, fill: "#3b82f6" }, name: "Hours" })
      ] }) })
    ] }),
    totalCost > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5 md:max-w-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-4", children: "Labour vs Parts Split" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 200, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Pie, { data: splitData, dataKey: "value", nameKey: "name", cx: "40%", cy: "50%", outerRadius: 80, label: false, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: "#3b82f6" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: "#8b5cf6" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`£${v.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`, ""] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { layout: "vertical", align: "right", verticalAlign: "middle", formatter: (n) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 12 }, children: n }) })
      ] }) })
    ] })
  ] });
}
const EMPTY_CUSTOMER = { name: "", contactName: "", contactPhone: "", contactEmail: "", address: "", holdingNumber: "", vatNumber: "", notes: "" };
function CustomersTab({ farmId, onViewJobs }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showInactive, setShowInactive] = reactExports.useState(false);
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [editRecord, setEditRecord] = reactExports.useState(null);
  const [deactivateId, setDeactivateId] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(EMPTY_CUSTOMER);
  const q = useQuery({
    queryKey: ["farm-customers", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/farm-customers`), { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const records = q.data?.records ?? [];
  const jobsQ = useQuery({
    queryKey: ["workshop-jobs", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/workshop/jobs`), { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => (d.jobs ?? []).map((j) => ({ ...j.job, customerName: j.customerName }))
  });
  const jobs = jobsQ.data ?? [];
  const jobCountByCustomer = reactExports.useMemo(() => {
    const map = {};
    for (const j of jobs) {
      if (j.customerId) map[j.customerId] = (map[j.customerId] ?? 0) + 1;
    }
    return map;
  }, [jobs]);
  const invalidate = () => qc.invalidateQueries({ queryKey: ["farm-customers", farmId] });
  const saveMut = useMutation({
    mutationFn: (body) => {
      if (editRecord) {
        return fetch(api(`farms/${farmId}/farm-customers/${editRecord.id}`), { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
      }
      return fetch(api(`farms/${farmId}/farm-customers`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      toast({ title: editRecord ? "Customer updated" : "Customer added" });
      invalidate();
      setAddOpen(false);
      setEditRecord(null);
      setForm(EMPTY_CUSTOMER);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const deactivateMut = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/farm-customers/${id}`), { method: "DELETE", credentials: "include" }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Customer deactivated" });
      invalidate();
      setDeactivateId(null);
    },
    onError: () => toast({ title: "Failed to deactivate", variant: "destructive" })
  });
  const reactivateMut = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/farm-customers/${id}`), { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ isActive: true }) }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Customer reactivated" });
      invalidate();
    },
    onError: () => toast({ title: "Failed to reactivate", variant: "destructive" })
  });
  function openAdd() {
    setEditRecord(null);
    setForm(EMPTY_CUSTOMER);
    setAddOpen(true);
  }
  function openEdit(r) {
    setEditRecord(r);
    setForm({ name: r.name ?? "", contactName: r.contactName ?? "", contactPhone: r.contactPhone ?? "", contactEmail: r.contactEmail ?? "", address: r.address ?? "", holdingNumber: r.holdingNumber ?? "", vatNumber: r.vatNumber ?? "", notes: r.notes ?? "" });
    setAddOpen(true);
  }
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const visible = records.filter((r) => showInactive || r.isActive);
  const inactiveCount = records.filter((r) => !r.isActive).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Workshop Customers" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mt-0.5", children: "Neighbouring farms and third parties for whom you carry out workshop jobs or machinery hire." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        inactiveCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => setShowInactive((s) => !s), children: [
          showInactive ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-3.5 w-3.5 mr-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5 mr-1" }),
          showInactive ? "Hide inactive" : `Show ${inactiveCount} inactive`
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }),
          "Add Customer"
        ] })
      ] })
    ] }),
    q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-gray-400" }) }) : visible.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 border-2 border-dashed border-gray-200 rounded-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-10 w-10 text-gray-300 mx-auto mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 font-medium", children: "No customers yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-400 text-sm mt-1", children: "Add a neighbouring farm or contractor to assign workshop jobs and raise invoices for them." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "mt-4", onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }),
        "Add first customer"
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3", children: visible.map((r) => {
      const jobCount = jobCountByCustomer[r.id] ?? 0;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("border rounded-xl p-4 bg-white flex items-start gap-4", !r.isActive && "opacity-55 bg-gray-50"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-5 w-5 text-amber-700" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-gray-900", children: r.name }),
            !r.isActive && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-500 font-medium", children: "Inactive" }),
            r.holdingNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200", children: [
              "CPH: ",
              r.holdingNumber
            ] }),
            jobCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: onViewJobs,
                className: "text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors",
                title: "Click to view job cards",
                children: [
                  jobCount,
                  " job",
                  jobCount !== 1 ? "s" : ""
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1.5 flex flex-wrap gap-x-5 gap-y-0.5 text-sm text-gray-500", children: [
            r.contactName && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-600", children: r.contactName }),
            r.contactPhone && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: r.contactPhone }),
            r.contactEmail && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `mailto:${r.contactEmail}`, className: "text-blue-600 hover:underline", children: r.contactEmail }),
            r.vatNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-400", children: [
              "VAT: ",
              r.vatNumber
            ] })
          ] }),
          r.address && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: r.address }),
          r.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400 mt-1 italic", children: [
            '"',
            r.notes,
            '"'
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1 flex-shrink-0", children: r.isActive ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "h-8 w-8 p-0", title: "Edit", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50", title: "Deactivate", onClick: () => setDeactivateId(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => reactivateMut.mutate(r.id), disabled: reactivateMut.isPending, children: reactivateMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : "Reactivate" }) })
      ] }, r.id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen, onOpenChange: (o) => {
      if (!o) {
        setAddOpen(false);
        setEditRecord(null);
        setForm(EMPTY_CUSTOMER);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 520 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editRecord ? "Edit Customer" : "Add Customer" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Business / Farm Name ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.name, onChange: (e) => set("name", e.target.value), placeholder: "e.g. Greenfields Farm" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Contact Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.contactName, onChange: (e) => set("contactName", e.target.value), placeholder: "e.g. John Smith" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "CPH / Holding Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.holdingNumber, onChange: (e) => set("holdingNumber", e.target.value), placeholder: "e.g. 12/345/6789" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Phone" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "tel", value: form.contactPhone, onChange: (e) => set("contactPhone", e.target.value), placeholder: "01234 567890" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: form.contactEmail, onChange: (e) => set("contactEmail", e.target.value), placeholder: "john@farm.co.uk" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.address, onChange: (e) => set("address", e.target.value), placeholder: "Farm address…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "VAT Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.vatNumber, onChange: (e) => set("vatNumber", e.target.value), placeholder: "GB 123456789" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes, onChange: (e) => set("notes", e.target.value), placeholder: "Any notes about this customer…" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setAddOpen(false);
          setEditRecord(null);
          setForm(EMPTY_CUSTOMER);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => {
              if (!form.name.trim()) {
                toast({ title: "Name is required", variant: "destructive" });
                return;
              }
              saveMut.mutate(form);
            },
            disabled: saveMut.isPending,
            children: saveMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : editRecord ? "Save Changes" : "Add Customer"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deactivateId !== null, onOpenChange: (o) => {
      if (!o) setDeactivateId(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Deactivate Customer" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "This customer will be hidden from job card dropdowns but their history is fully preserved. You can reactivate them at any time." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeactivateId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deactivateId !== null && deactivateMut.mutate(deactivateId), disabled: deactivateMut.isPending, children: deactivateMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : "Deactivate" })
      ] })
    ] }) })
  ] });
}
function WorkshopPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = reactExports.useState(() => {
    const p = new URLSearchParams(window.location.search);
    const t = p.get("tab");
    const valid = ["jobs", "schedule", "overview", "parts", "analytics", "customers"];
    return t && valid.includes(t) ? t : "jobs";
  });
  const openId = (() => {
    const n = Number(new URLSearchParams(window.location.search).get("open"));
    return n > 0 ? n : null;
  })();
  const [jobNavStatus, setJobNavStatus] = reactExports.useState("all");
  const [jobNavKey, setJobNavKey] = reactExports.useState(0);
  function navigateTo(dest, status) {
    if (dest === "jobs") {
      setJobNavStatus(status ?? "all");
      setJobNavKey((k) => k + 1);
    }
    setTab(dest);
  }
  if (!farmId) return /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { to: "/select" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Workshop", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-7xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Workshop" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 text-sm mt-1", children: "Job cards, service schedules, parts store, fleet overview, and analytics." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "jobs", onClick: () => {
        setJobNavStatus("all");
        setTab("jobs");
      }, children: "Job Cards" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "schedule", onClick: () => setTab("schedule"), children: "Service Schedule" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "overview", onClick: () => setTab("overview"), children: "Fleet Overview" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "parts", onClick: () => setTab("parts"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-3.5 w-3.5 mr-1 inline-block" }),
        "Parts Store"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "analytics", onClick: () => setTab("analytics"), children: "Analytics" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "customers", onClick: () => setTab("customers"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3.5 w-3.5 mr-1 inline-block" }),
        "Customers"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6", children: [
      tab === "jobs" && /* @__PURE__ */ jsxRuntimeExports.jsx(JobCardsTab, { farmId, openId, initialStatus: jobNavStatus }, jobNavKey),
      tab === "schedule" && /* @__PURE__ */ jsxRuntimeExports.jsx(ServiceScheduleTab, { farmId }),
      tab === "overview" && /* @__PURE__ */ jsxRuntimeExports.jsx(FleetOverviewTab, { farmId, onNavigate: navigateTo }),
      tab === "parts" && /* @__PURE__ */ jsxRuntimeExports.jsx(PartsStoreTab, { farmId }),
      tab === "analytics" && /* @__PURE__ */ jsxRuntimeExports.jsx(WorkshopAnalyticsTab, { farmId }),
      tab === "customers" && /* @__PURE__ */ jsxRuntimeExports.jsx(CustomersTab, { farmId, onViewJobs: () => navigateTo("jobs") })
    ] })
  ] }) });
}
function ConfirmDialogWorkshop({ open, title, message, onConfirm, onCancel, confirmLabel = "Confirm", confirmVariant = "default" }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
    if (!o) onCancel();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "22rem" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: title }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: message }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onCancel, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: confirmVariant, onClick: () => {
        onConfirm();
        onCancel();
      }, children: confirmLabel })
    ] })
  ] }) });
}
function WorkshopStocktakeView({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [activeId, setActiveId] = reactExports.useState(null);
  const [localCounts, setLocalCounts] = reactExports.useState({});
  const [newOpen, setNewOpen] = reactExports.useState(false);
  const [newForm, setNewForm] = reactExports.useState({ stocktakeDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), notes: "" });
  const [confirmState, setConfirmState] = reactExports.useState({ open: false, title: "", message: "", onConfirm: () => {
  } });
  const showConfirm = (title, message, onConfirm, opts) => setConfirmState({ open: true, title, message, onConfirm, ...opts });
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["workshop-stocktakes", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/workshop/stocktakes`), { credentials: "include" }).then((r) => r.json())
  });
  const { data: activeSession } = useQuery({
    queryKey: ["workshop-stocktake-detail", farmId, activeId],
    queryFn: () => fetch(api(`farms/${farmId}/workshop/stocktakes/${activeId}`), { credentials: "include" }).then((r) => r.json()),
    enabled: activeId !== null
  });
  const createMut = useMutation({
    mutationFn: (body) => fetch(api(`farms/${farmId}/workshop/stocktakes`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["workshop-stocktakes", farmId] });
      setNewOpen(false);
      setLocalCounts({});
      setActiveId(data.id);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const updateItemMut = useMutation({
    mutationFn: ({ sessionId, itemId, countedQty }) => fetch(api(`farms/${farmId}/workshop/stocktakes/${sessionId}/items/${itemId}`), { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ countedQty }) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workshop-stocktake-detail", farmId, activeId] });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const completeMut = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/workshop/stocktakes/${id}/complete`), { method: "POST", credentials: "include" }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workshop-stocktakes", farmId] });
      qc.invalidateQueries({ queryKey: ["workshop-stocktake-detail", farmId, activeId] });
      qc.invalidateQueries({ queryKey: ["workshop-parts", farmId] });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/workshop/stocktakes/${id}`), { method: "DELETE", credentials: "include" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workshop-stocktakes", farmId] });
      setActiveId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const fmtDate = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const canComplete = (activeSession?.countedCount ?? 0) >= (activeSession?.itemCount ?? 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialogWorkshop,
      {
        open: confirmState.open,
        title: confirmState.title,
        message: confirmState.message,
        onConfirm: confirmState.onConfirm,
        onCancel: () => setConfirmState((s) => ({ ...s, open: false })),
        confirmLabel: confirmState.confirmLabel,
        confirmVariant: confirmState.variant
      }
    ),
    activeId === null ? (
      /* ── List view ──────────────────────────────────────────────────── */
      /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Parts Store Stocktake" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Count physical workshop parts and compare against system stock quantities to detect discrepancies." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
            setNewForm({ stocktakeDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), notes: "" });
            setNewOpen(true);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
            "New Stocktake"
          ] })
        ] }),
        sessionsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : sessions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 text-muted-foreground text-sm", children: 'No stocktakes recorded yet. Click "New Stocktake" to begin your first count.' }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "border-b", children: ["Date", "Status", "Progress", "Variance £", "Notes", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-3 font-medium text-muted-foreground whitespace-nowrap", children: h }, h)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: sessions.map((s) => {
            const varVal = s.totalVarianceValue ? parseFloat(s.totalVarianceValue) : null;
            const isDraft = s.status === "draft";
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b last:border-0 hover:bg-muted/30 cursor-pointer", onClick: () => {
              setLocalCounts({});
              setActiveId(s.id);
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 whitespace-nowrap font-medium", children: fmtDate(s.stocktakeDate) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isDraft ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-green-50 text-green-700 border border-green-200"}`, children: isDraft ? "In Progress" : "Completed" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 pr-3 text-muted-foreground", children: [
                s.countedCount ?? 0,
                " / ",
                s.itemCount ?? 0,
                " counted"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3", children: varVal === null ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: varVal < 0 ? "text-red-600 font-medium" : varVal > 0 ? "text-amber-600 font-medium" : "text-green-600", children: [
                varVal >= 0 ? "+" : "",
                "£",
                Math.abs(varVal).toFixed(2)
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 text-muted-foreground text-xs max-w-[180px] truncate", children: s.notes || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "h-7 text-xs", onClick: () => {
                  setLocalCounts({});
                  setActiveId(s.id);
                }, children: isDraft ? "Continue" : "View" }),
                isDraft && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => showConfirm("Delete Stocktake", "Delete this draft? All counts entered so far will be lost.", () => deleteMut.mutate(s.id), { confirmLabel: "Delete", variant: "destructive" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-red-400" }) })
              ] }) })
            ] }, s.id);
          }) })
        ] }) })
      ] })
    ) : (
      /* ── Detail view ────────────────────────────────────────────────── */
      /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => {
            setActiveId(null);
            qc.invalidateQueries({ queryKey: ["workshop-stocktakes", farmId] });
          }, children: "← Back" }),
          activeSession && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold text-sm", children: [
                  "Stocktake — ",
                  fmtDate(activeSession.stocktakeDate)
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${activeSession.status === "draft" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-green-50 text-green-700 border border-green-200"}`, children: activeSession.status === "draft" ? "In Progress" : "Completed" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                  activeSession.countedCount ?? 0,
                  " / ",
                  activeSession.itemCount ?? 0,
                  " parts counted"
                ] })
              ] }),
              activeSession.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: activeSession.notes })
            ] }),
            activeSession.status === "draft" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "gap-1.5", onClick: () => printBlankStocktakeSheet(activeSession.items ?? [], activeSession.stocktakeDate), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-3.5 w-3.5" }),
                "Print Blank Sheet"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  disabled: !canComplete || completeMut.isPending,
                  onClick: () => showConfirm("Complete Stocktake", "Workshop part stock levels will be updated to match your physical counts. This cannot be undone.", () => completeMut.mutate(activeSession.id), { confirmLabel: "Complete Stocktake" }),
                  children: [
                    completeMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin mr-1" }) : null,
                    "Complete Stocktake"
                  ]
                }
              )
            ] }),
            activeSession.status === "completed" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "gap-1.5", onClick: () => printStocktakeReport(activeSession), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-3.5 w-3.5" }),
              "Print Report"
            ] })
          ] })
        ] }),
        !activeSession ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : (activeSession.items ?? []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 text-muted-foreground text-sm", children: "No workshop parts found. Add parts to the catalogue first, then start a new stocktake." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          (() => {
            const items = activeSession.items ?? [];
            const totalVar = items.reduce((s, i) => s + (i.varianceValue ? parseFloat(i.varianceValue) : 0), 0);
            const negCount = items.filter((i) => i.variance !== null && parseFloat(i.variance) < 0).length;
            const uncounted = items.filter((i) => i.countedQty === null).length;
            return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-3", children: [
              { label: "Uncounted", value: String(uncounted), sub: "parts remaining", color: uncounted > 0 ? "text-amber-600" : "text-green-600" },
              { label: "Total Variance", value: `${totalVar >= 0 ? "+" : ""}£${Math.abs(totalVar).toFixed(2)}`, sub: "cost value difference", color: totalVar < 0 ? "text-red-600" : totalVar > 0 ? "text-amber-600" : "text-green-600" },
              { label: "Shortfalls", value: String(negCount), sub: "parts below system qty", color: negCount > 0 ? "text-red-600" : "text-green-600" }
            ].map((card) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/40 rounded-lg p-3 text-center border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: card.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-lg font-bold ${card.color}`, children: card.value }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: card.sub })
            ] }, card.label)) });
          })(),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "border-b", children: ["Part Name", "Part No.", "Location", "Unit", "System Qty", "Counted", "Variance", "Variance £"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-3 font-medium text-muted-foreground whitespace-nowrap", children: h }, h)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: (activeSession.items ?? []).map((item) => {
              const varNum = item.variance !== null ? parseFloat(item.variance) : null;
              const varVal = item.varianceValue !== null ? parseFloat(item.varianceValue) : null;
              const varColor = varNum === null ? "" : varNum < 0 ? "text-red-600 font-semibold" : varNum === 0 ? "text-green-600" : "text-amber-600 font-semibold";
              const rowBg = varNum === null ? "" : varNum < 0 ? "bg-red-50/40" : varNum > 0 ? "bg-amber-50/30" : "";
              const isCompleted = activeSession.status === "completed";
              const localVal = localCounts[item.id] !== void 0 ? localCounts[item.id] : item.countedQty ?? "";
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: `border-b last:border-0 ${rowBg}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 font-medium whitespace-nowrap", children: item.partName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 text-muted-foreground text-xs", children: item.partNumber || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 text-muted-foreground text-xs", children: item.location || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 text-muted-foreground text-xs", children: item.unit || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3", children: fmtStocktakeQty(item.expectedQty, item.unit) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3", children: isCompleted ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.countedQty ?? "—" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: "number",
                    min: "0",
                    step: qtyStep(item.unit),
                    className: "h-7 w-24 text-sm",
                    placeholder: qtyStep(item.unit) === "1" ? "0" : "0.00",
                    value: localVal,
                    onChange: (e) => setLocalCounts((prev) => ({ ...prev, [item.id]: e.target.value })),
                    onBlur: () => {
                      const raw = localCounts[item.id];
                      if (raw === void 0) return;
                      const val = raw.trim() === "" ? null : raw;
                      updateItemMut.mutate({ sessionId: activeSession.id, itemId: item.id, countedQty: val });
                    }
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `py-2 pr-3 ${varColor}`, children: varNum === null ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "—" }) : `${varNum >= 0 ? "+" : ""}${varNum.toFixed(2)}` }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `py-2 ${varColor}`, children: varVal === null ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "—" }) : `${varVal >= 0 ? "+" : ""}£${Math.abs(varVal).toFixed(2)}` })
              ] }, item.id);
            }) })
          ] }) }),
          (activeSession.items ?? []).some((i) => i.unitCostPence === null) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground border-t pt-2", children: [
            "* Variance £ shows ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "—" }),
            " for parts without a unit cost. Add unit costs in the Parts Catalogue to see cost-value variance."
          ] }),
          activeSession.status === "draft" && !canComplete && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground text-center border-t pt-3", children: [
            "Count all ",
            (activeSession.itemCount ?? 0) - (activeSession.countedCount ?? 0),
            " remaining parts before completing."
          ] })
        ] })
      ] })
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: newOpen, onOpenChange: (o) => {
      if (!o) setNewOpen(false);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "22rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "New Parts Stocktake" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground -mt-1", children: "Snaps the current system stock for all active workshop parts. You'll then count and enter physical quantities." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Stocktake Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: newForm.stocktakeDate, onChange: (e) => setNewForm((f) => ({ ...f, stocktakeDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: newForm.notes, placeholder: "e.g. Monthly audit", onChange: (e) => setNewForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setNewOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            disabled: !newForm.stocktakeDate || createMut.isPending,
            onClick: () => createMut.mutate({ stocktakeDate: newForm.stocktakeDate, notes: newForm.notes || void 0 }),
            children: createMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : "Start Stocktake"
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  WorkshopPage as default
};
