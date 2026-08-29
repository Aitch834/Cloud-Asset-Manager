import { b as useAppStore, a as useToast, c as useQueryClient, r as reactExports, S as useMutation, m as useQuery, j as jsxRuntimeExports, I as Input, d as Button, T as Plus, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, J as DialogFooter, H as DialogDescription, L as Label, N as DialogMutationError, e as LoaderCircle, l as cn, X, p as Link } from "./index-VvTYHuw0.js";
import { u as usePersistedTab } from "./use-persisted-tab-kyW--hnr.js";
import { a as usePersistedFilter } from "./use-persisted-filter-DVMhWhTs.js";
import { A as AppLayout, s as AlertDialog, t as AlertDialogContent, v as AlertDialogHeader, w as AlertDialogTitle, x as AlertDialogDescription, y as AlertDialogFooter, z as AlertDialogCancel, D as AlertDialogAction, c as ClipboardList, T as TrendingUp } from "./AppLayout-CN8o5XCj.js";
import { u as useCrops } from "./use-crops-BGVA4j93.js";
import { u as useFarmMembers } from "./use-farm-members-28zET-iW.js";
import { T as Textarea } from "./textarea-BPBFAafv.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-C6RtAv93.js";
import { C as ConfirmDialog } from "./confirm-dialog-CP_5A4dq.js";
import { B as Badge } from "./badge-CWY73lj-.js";
import { P as Package } from "./use-safe-clerk-7hPmvskt.js";
import { S as ShoppingCart } from "./shopping-cart-DAc3eH6M.js";
import { S as ShieldCheck } from "./shield-check-D2lVFkT1.js";
import { F as FileText } from "./shield-alert-CKkGaXmC.js";
import { S as Search } from "./search-BS8jpLy6.js";
import { T as TriangleAlert } from "./triangle-alert-DsGDrLRU.js";
import { E as Eye } from "./eye-BuDLHyqo.js";
import { P as Pencil } from "./pencil-CLOaIfTX.js";
import { T as Trash2 } from "./trash-2-QHvEUlNF.js";
import { a as Clock, C as CircleAlert } from "./database-Arfl1cWO.js";
import { C as CircleCheck } from "./circle-check-Ad72skpK.js";
import { P as Printer } from "./printer-D743wf_P.js";
import { C as CircleX } from "./circle-x-rDrwY2uv.js";
import { T as TrendingDown } from "./trending-down-DqAaoUsF.js";
import { P as Paperclip } from "./paperclip-DujCxArg.js";
import { U as Upload } from "./upload-hufVKsFV.js";
import { I as Image } from "./image-DhGFpkG-.js";
import { D as Download } from "./download-C7hE0LkU.js";
import "./tractor-D9oijwSI.js";
import "./index-CQP0ezC5.js";
import "./index-jzVm7ECv.js";
import "./chevron-up-D7ki0HoI.js";
function TabBar({ children, className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex items-center w-fit flex-wrap", className), style: { gap: 6, padding: 6, background: "rgba(0,0,0,0.07)", borderRadius: 12 }, children });
}
function TabButton({ active, onClick, children, size = "md" }) {
  const pad = size === "md" ? "10px 20px" : "6px 16px";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick, style: { padding: pad, fontSize: "0.875rem", fontWeight: 600, borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap", transition: "background 0.15s, color 0.15s", background: active ? "#fff" : "transparent", boxShadow: active ? "0 1px 2px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.06)" : "none", border: "none", color: active ? "hsl(var(--foreground))" : "hsl(var(--foreground) / 0.6)" }, className: cn("hover:text-foreground", !active && "hover:bg-black/[0.05]"), children });
}
function StaffSelect({ value, onChange, staffNames, loading }) {
  if (loading) return /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value, onChange: (e) => onChange(e.target.value), placeholder: "Loading staff…", disabled: true });
  if (staffNames.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value, onChange: (e) => onChange(e.target.value), placeholder: "Type staff member name…" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginTop: 4 }, children: [
      "No staff registered. ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { href: "/staff", style: { color: "#16a34a", textDecoration: "underline" }, children: "Add staff members" }),
      " to enable the lookup."
    ] })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value, onValueChange: onChange, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select staff member…" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: staffNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: n, children: n }, n)) })
  ] });
}
function printStocktakeSheet(batches, fieldCrops, farmId) {
  const win = window.open("", "_blank");
  if (!win) return;
  const fmtDate = (d) => {
    try {
      return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return d || "—";
    }
  };
  const batchRows = batches.map((batch) => {
    const assignments = fieldCrops.filter((fc) => fc.seedBatchId === batch.id && fc.bagsAllocated);
    const bagW = Number(batch.bagWeightKg ?? 25);
    const fieldRows = assignments.map((a) => `<tr>
      <td style="padding:5px 8px">${a.fieldName || "—"}</td>
      <td style="text-align:right;padding:5px 8px">${a.bagsAllocated ?? "—"}</td>
      <td style="text-align:right;padding:5px 8px">${a.bagsAllocated && bagW ? (a.bagsAllocated * bagW).toLocaleString() : "—"} kg</td>
      <td style="text-align:right;padding:5px 8px;border-bottom:1px solid #aaa;min-width:90px">&nbsp;</td>
    </tr>`).join("");
    const remBags = bagW > 0 ? Math.round(Number(batch.quantityRemainingKg) / bagW) : "—";
    return `<div style="margin-bottom:28px;page-break-inside:avoid">
      <div style="display:flex;align-items:baseline;gap:12px;margin-bottom:4px;flex-wrap:wrap">
        <span style="font-family:monospace;font-size:13px;font-weight:700">${batch.batchNumber}</span>
        <span style="font-size:12px;color:#374151">${batch.cropName} · ${batch.varietyName}</span>
        <span style="font-size:10px;color:#6b7280">Supplier: ${batch.supplierName || "—"} · Bag: ${bagW}kg · TGW: ${batch.tgwGrams}g · Received: ${fmtDate(batch.dateReceived)}</span>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:11px">
        <thead><tr style="background:#1a3a1a;color:#fff">
          <th style="text-align:left;padding:5px 8px">Field / Description</th>
          <th style="text-align:right;padding:5px 8px">Bags</th>
          <th style="text-align:right;padding:5px 8px">System (kg)</th>
          <th style="text-align:right;padding:5px 8px;min-width:90px">Physical count</th>
        </tr></thead>
        <tbody>${fieldRows}
          <tr style="background:#f3f4f6;font-weight:600">
            <td style="padding:5px 8px">In store (unallocated)</td>
            <td style="text-align:right;padding:5px 8px">${remBags}</td>
            <td style="text-align:right;padding:5px 8px">${Number(batch.quantityRemainingKg).toLocaleString()} kg</td>
            <td style="text-align:right;padding:5px 8px;border-bottom:1px solid #aaa">&nbsp;</td>
          </tr>
          <tr style="background:#e5e7eb;font-weight:700">
            <td style="padding:5px 8px">Total received</td>
            <td style="text-align:right;padding:5px 8px">${bagW > 0 ? Math.round(Number(batch.quantityReceivedKg) / bagW) : "—"}</td>
            <td style="text-align:right;padding:5px 8px">${Number(batch.quantityReceivedKg).toLocaleString()} kg</td>
            <td></td>
          </tr>
        </tbody>
      </table>
      <div style="margin-top:4px;font-size:10px;color:#9ca3af">Notes / discrepancies: _______________________________________________</div>
    </div>`;
  }).join("");
  win.document.write(`<!DOCTYPE html><html><head><title>Seed Store Stocktake Sheet</title>
    <style>body{font-family:Arial,sans-serif;font-size:11px;margin:24px;color:#111}h1{font-size:15px;margin:0 0 4px}.meta{color:#6b7280;font-size:10px;margin:0 0 16px}@media print{button{display:none!important}}</style>
  </head><body>
    <button onclick="window.print()" style="margin-bottom:16px;padding:6px 16px;background:#1a3a1a;color:#fff;border:none;border-radius:4px;cursor:pointer">🖨 Print</button>
    <h1>Seed Store — Stocktake Sheet</h1>
    <p class="meta">Farm ID: ${farmId} &nbsp;·&nbsp; Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</p>
    ${batchRows}
    <div style="margin-top:24px;padding-top:12px;border-top:1px solid #e5e7eb;font-size:10px;color:#6b7280;display:flex;justify-content:space-between">
      <span>Counted by: ________________________</span><span>Date: ________________________</span><span>Signature: ________________________</span>
    </div>
    <script>window.onload=function(){window.print()}<\/script>
  </body></html>`);
  win.document.close();
}
function printSegregationRegister(checks, farmId) {
  const win = window.open("", "_blank");
  if (!win) return;
  const fmtDate = (d) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return d;
    }
  };
  const fmtMethod = (m) => m === "rigid_barrier" ? "Rigid barrier" : m === "distance_3m" ? "3 m distance" : m === "separate_store" ? "Separate store" : m || "—";
  const compliantCount = checks.filter((c) => c.isCompliant !== false && !c.treatedSeedStoredLoose).length;
  const rows = checks.map((c, i) => {
    const nonComp = c.isCompliant === false || c.treatedSeedStoredLoose === true;
    return `<tr style="background:${i % 2 === 0 ? "#fff" : "#f9fafb"}">
      <td>${c.storageLocationName || "—"}</td>
      <td>${fmtDate(c.checkDate)}</td>
      <td>${fmtMethod(c.segregationMethod)}</td>
      <td style="font-weight:600;color:${nonComp ? "#991b1b" : "#166534"}">${nonComp ? "✗ Non-compliant" : "✓ Compliant"}</td>
      <td>${c.treatedSeedStoredLoose ? "Yes ⚠" : "No"}</td>
      <td>${c.checkedBy || "—"}</td>
      <td style="max-width:200px;white-space:pre-wrap">${c.notes || "—"}</td>
    </tr>`;
  }).join("");
  win.document.write(`<!DOCTYPE html><html><head>
    <title>Seed Store Segregation Register — Red Tractor CR.ST.19</title>
    <style>
      body{font-family:Arial,sans-serif;font-size:11px;margin:24px;color:#111}
      h1{font-size:15px;margin:0 0 4px}
      .meta{color:#6b7280;font-size:10px;margin:0 0 6px}
      .summary{display:flex;gap:24px;margin-bottom:16px;padding:8px 12px;background:#f3f4f6;border-radius:6px}
      .summary span{font-weight:600}
      table{width:100%;border-collapse:collapse;margin-top:0}
      th{background:#1a3a1a;color:#fff;text-align:left;padding:6px 10px;font-size:10px;text-transform:uppercase;letter-spacing:.05em}
      td{padding:5px 10px;border-bottom:1px solid #e5e7eb;vertical-align:top}
      @media print{body{margin:12px}button{display:none!important}}
    </style>
  </head><body>
    <h1>Seed Storage Segregation Register — Red Tractor CR.ST.19</h1>
    <p class="meta">Farm ID: ${farmId} &nbsp;·&nbsp; Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</p>
    <div class="summary">
      Total checks: <span>${checks.length}</span>&nbsp;&nbsp;
      Compliant: <span style="color:#166534">${compliantCount}</span>&nbsp;&nbsp;
      Non-compliant: <span style="color:${checks.length - compliantCount > 0 ? "#991b1b" : "#6b7280"}">${checks.length - compliantCount}</span>
    </div>
    <table>
      <thead><tr>
        <th>Storage Location</th><th>Check Date</th><th>Segregation Method</th>
        <th>Compliant?</th><th>Treated Loose?</th><th>Checked By</th><th>Notes</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="margin-top:16px;font-size:10px;color:#6b7280">Red Tractor Combinable Crops Standard — CR.ST.19: treated seed must be physically separated from stored grain by a rigid barrier, a minimum of 3 m distance, or held in a separate store. Treated seed must never be stored loose in a grain store.</p>
    <script>window.onload=function(){window.print()}<\/script>
  </body></html>`);
  win.document.close();
}
const SEED_STORE_TAB_IDS = ["stock", "allocation", "orders", "segregation", "stocktakes"];
function seedStoreFormatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function seedStoreIsImage(mimeType, fileName) {
  if (mimeType?.startsWith("image/")) return true;
  return /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(fileName);
}
function SeedStoreRecordAttachments({ farmId, recordType, recordId, compact = false }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const inputRef = reactExports.useRef(null);
  const [uploading, setUploading] = reactExports.useState(false);
  const [deletingId, setDeletingId] = reactExports.useState(null);
  const queryKey = ["record-attachments", farmId, recordType, recordId];
  const { data: attachments = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => fetch(`/api/farms/${farmId}/record-attachments?recordType=${encodeURIComponent(recordType)}&recordId=${recordId}`, {
      credentials: "include"
    }).then((r) => r.json()),
    enabled: !!farmId && !!recordId
  });
  async function handleFile(file) {
    setUploading(true);
    try {
      const urlRes = await fetch(`/api/storage/uploads/request-url`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          contentType: file.type || "application/octet-stream"
        })
      });
      if (!urlRes.ok) throw new Error("Failed to get upload URL");
      const { uploadURL, objectPath } = await urlRes.json();
      const putRes = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "application/octet-stream" }
      });
      if (!putRes.ok) throw new Error("Failed to upload file");
      await fetch(`/api/farms/${farmId}/record-attachments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordType,
          recordId,
          fileUrl: `/api/storage${objectPath}`,
          fileKey: objectPath,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || null
        })
      }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      qc.invalidateQueries({ queryKey });
      toast({ title: "Attachment uploaded" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }
  async function handleDelete(id) {
    setDeletingId(id);
    try {
      await fetch(`/api/farms/${farmId}/record-attachments/${id}`, {
        method: "DELETE",
        credentials: "include"
      }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      qc.invalidateQueries({ queryKey });
      toast({ title: "Attachment removed" });
    } catch {
      toast({ title: "Failed to remove attachment", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: compact ? "space-y-2 text-xs" : "space-y-2 text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-medium flex items-center gap-1.5 text-muted-foreground ${compact ? "text-xs" : "text-sm"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: compact ? "w-3 h-3" : "w-4 h-4" }),
        "Attachments",
        attachments.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-muted text-muted-foreground rounded-full px-1.5 py-0 text-[10px] font-semibold", children: attachments.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          ref: inputRef,
          type: "file",
          accept: "image/*,.pdf,.doc,.docx",
          className: "hidden",
          onChange: (e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "ghost",
          size: "sm",
          className: "h-7 px-2 gap-1 text-xs",
          onClick: () => inputRef.current?.click(),
          disabled: uploading,
          children: [
            uploading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3 h-3 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-3 h-3" }),
            uploading ? "Uploading…" : "Add file"
          ]
        }
      )
    ] }),
    isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground py-1", children: "Loading attachments…" }),
    !isLoading && attachments.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground py-1 italic", children: "No attachments yet." }),
    attachments.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1.5", children: attachments.map((att) => {
      const img = seedStoreIsImage(att.mimeType, att.fileName);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "li",
        {
          className: "flex items-center gap-2 rounded border border-border bg-muted/40 px-2 py-1.5 group",
          children: [
            img ? /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "w-4 h-4 shrink-0 text-blue-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-4 h-4 shrink-0 text-orange-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate font-medium leading-tight", children: att.fileName }),
              att.fileSize && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: seedStoreFormatBytes(att.fileSize) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "a",
              {
                href: att.fileUrl,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "shrink-0 text-muted-foreground hover:text-foreground",
                title: "Download / view",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-3.5 h-3.5" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => handleDelete(att.id),
                disabled: deletingId === att.id,
                className: "shrink-0 text-muted-foreground hover:text-destructive disabled:opacity-50 opacity-0 group-hover:opacity-100 transition-opacity",
                title: "Remove attachment",
                children: deletingId === att.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3.5 h-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" })
              }
            )
          ]
        },
        att.id
      );
    }) })
  ] });
}
function fmt(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB");
}
function num(v) {
  if (v === null || v === void 0) return 0;
  const n = parseFloat(String(v));
  return isNaN(n) ? 0 : n;
}
function fmtGBP(pence) {
  if (pence === null || pence === void 0 || pence === "") return "—";
  const n = num(pence) / 100;
  return `£${n.toFixed(2)}`;
}
function SeedStoreEmptyState({ icon: Icon, title, subtitle, action }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#f0fdf4", borderRadius: "50%", padding: "1.25rem", marginBottom: "1rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 28, color: "#166534" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-700 mb-1", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 mb-4", children: subtitle }),
    action
  ] });
}
const emptyForm = {
  cropId: "",
  varietyId: "",
  supplierId: "",
  poId: "__none__",
  batchNumber: "",
  tgwGrams: "",
  bagWeightKg: "25",
  quantityReceivedKg: "",
  dateReceived: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
  deliveryNoteNumber: "",
  invoiceReference: "",
  costPounds: "",
  receivedBy: "",
  treatmentNotes: ""
};
const INACTIVE_PO_STATUSES = ["received", "cancelled"];
function SeedStorePage() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const safeFarmId = farmId ?? 0;
  const _mut = reactExports.useRef({});
  const saveMut = useMutation({
    mutationFn: async (body) => {
      const { safeFarmId: fid, editing: editing2 } = _mut.current;
      const url = editing2 ? `/api/farms/${fid}/seed-batches/${editing2.id}` : `/api/farms/${fid}/seed-batches`;
      const res = await fetch(url, { method: editing2 ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      const { toast: t, invalidate: invalidate2, setOpen: setOpen2, setForm: setForm2, setEditing: setEditing2, editing: editing2 } = _mut.current;
      t({ title: editing2 ? "Seed batch updated" : "Seed batch added" });
      invalidate2();
      setOpen2(false);
      setForm2(emptyForm);
      setEditing2(null);
    },
    onError: () => _mut.current.toast({ title: "Failed to save batch", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => {
      const { safeFarmId: fid } = _mut.current;
      return fetch(`/api/farms/${fid}/seed-batches/${id}`, { method: "DELETE" }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      }).then((r) => r.json());
    },
    onSuccess: () => {
      const { toast: t, invalidate: invalidate2, setDeleteTarget: setDeleteTarget2 } = _mut.current;
      t({ title: "Seed batch deleted" });
      invalidate2();
      setDeleteTarget2(null);
    },
    onError: () => _mut.current.toast({ title: "Failed to delete batch", variant: "destructive" })
  });
  const poMut = useMutation({
    mutationFn: async (data) => {
      const { safeFarmId: fid, editPo: editPo2 } = _mut.current;
      const url = editPo2 ? `/api/farms/${fid}/seed-purchase-orders/${editPo2.id}` : `/api/farms/${fid}/seed-purchase-orders`;
      const res = await fetch(url, { method: editPo2 ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      const { invalidate: invalidate2, setShowPoDialog: setShowPoDialog2, toast: t, editPo: editPo2 } = _mut.current;
      invalidate2();
      setShowPoDialog2(false);
      t({ title: editPo2 ? "Order updated" : "Seed order raised" });
    },
    onError: () => _mut.current.toast({ title: "Error saving order", variant: "destructive" })
  });
  const deletePoMut = useMutation({
    mutationFn: (id) => {
      const { safeFarmId: fid } = _mut.current;
      return fetch(`/api/farms/${fid}/seed-purchase-orders/${id}`, { method: "DELETE" }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      }).then((r) => r.json());
    },
    onSuccess: () => {
      const { invalidate: invalidate2, setDeletePoTarget: setDeletePoTarget2, toast: t } = _mut.current;
      invalidate2();
      setDeletePoTarget2(null);
      t({ title: "Order removed" });
    },
    onError: () => _mut.current.toast({ title: "Failed to delete order", variant: "destructive" })
  });
  const receivePoMut = useMutation({
    mutationFn: ({ id, date }) => {
      const { safeFarmId: fid } = _mut.current;
      return fetch(`/api/farms/${fid}/seed-purchase-orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "received", actualDeliveryDate: date })
      }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      }).then((r) => r.json());
    },
    onSuccess: () => {
      const { invalidate: invalidate2, setReceivePoId: setReceivePoId2, toast: t } = _mut.current;
      invalidate2();
      setReceivePoId2(null);
      t({ title: "Order marked as received — log the seed batch (GRN) in the Stock tab." });
    },
    onError: () => _mut.current.toast({ title: "Save failed", variant: "destructive" })
  });
  const cancelPoMut = useMutation({
    mutationFn: (id) => {
      const { safeFarmId: fid } = _mut.current;
      return fetch(`/api/farms/${fid}/seed-purchase-orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" })
      }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      }).then((r) => r.json());
    },
    onSuccess: () => {
      const { invalidate: invalidate2, toast: t } = _mut.current;
      invalidate2();
      t({ title: "Order cancelled" });
    },
    onError: () => _mut.current.toast({ title: "Save failed", variant: "destructive" })
  });
  const segMut = useMutation({
    mutationFn: async (data) => {
      const { safeFarmId: fid, editSeg: editSeg2 } = _mut.current;
      const { caDescription, caAssignedToMemberId, caDueDate, ...checkData } = data;
      const url = editSeg2 ? `/api/farms/${fid}/seed-storage-checks/${editSeg2.id}` : `/api/farms/${fid}/seed-storage-checks`;
      const res = await fetch(url, { method: editSeg2 ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(checkData) });
      if (!res.ok) throw new Error("Failed to save");
      const saved = await res.json();
      const isNonCompliant = !checkData.isCompliant || checkData.treatedSeedStoredLoose;
      if (isNonCompliant && caDescription?.trim() && caAssignedToMemberId) {
        const checkId = saved.id ?? editSeg2?.id;
        await fetch(`/api/farms/${fid}/task-assignments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assignedToMemberId: Number(caAssignedToMemberId),
            title: "Correct seed segregation non-compliance",
            description: caDescription.trim(),
            dueDate: caDueDate || null,
            module: "seed-store",
            href: "/seed-store?tab=segregation",
            taskType: "compliance_corrective",
            taskSourceId: `seed-seg-check-${checkId}`
          })
        }).then(async (r) => {
          if (!r.ok) {
            const t = await r.text().catch(() => "");
            throw new Error(t || `Request failed (${r.status})`);
          }
          return r;
        });
        return { ...saved, taskCreated: true };
      }
      return saved;
    },
    onSuccess: (result) => {
      const { invalidateSeg: invalidateSeg2, setShowSegDialog: setShowSegDialog2, toast: t, editSeg: editSeg2, qc: qcRef, safeFarmId: fid } = _mut.current;
      invalidateSeg2();
      qcRef.invalidateQueries({ queryKey: ["seg-corrective-tasks", fid] });
      setShowSegDialog2(false);
      t({ title: result?.taskCreated ? "Check logged — corrective action task created" : editSeg2 ? "Check updated" : "Segregation check logged" });
    },
    onError: () => _mut.current.toast({ title: "Failed to save check", variant: "destructive" })
  });
  const deleteSegMut = useMutation({
    mutationFn: (id) => {
      const { safeFarmId: fid } = _mut.current;
      return fetch(`/api/farms/${fid}/seed-storage-checks/${id}`, { method: "DELETE" }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      }).then((r) => r.json());
    },
    onSuccess: () => {
      const { invalidateSeg: invalidateSeg2, setDeleteSegTarget: setDeleteSegTarget2, toast: t } = _mut.current;
      invalidateSeg2();
      setDeleteSegTarget2(null);
      t({ title: "Check deleted" });
    },
    onError: () => _mut.current.toast({ title: "Failed to delete check", variant: "destructive" })
  });
  const [tab, setTab] = usePersistedTab({ page: "seed-store", farmId, validIds: SEED_STORE_TAB_IDS, defaultTab: "stock", urlOverride: new URLSearchParams(window.location.search).get("tab") });
  const { data: membersData, isLoading: membersLoading } = useFarmMembers(safeFarmId);
  const staffNames = (membersData?.members ?? []).filter((m) => m.isActive).map((m) => `${m.firstName} ${m.lastName}`);
  const activeMembers = (membersData?.members ?? []).filter((m) => m.isActive);
  const corrTasksQ = useQuery({
    queryKey: ["seg-corrective-tasks", safeFarmId],
    queryFn: () => fetch(`/api/farms/${safeFarmId}/task-assignments?module=seed-store&taskType=compliance_corrective`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!safeFarmId
  });
  const corrTasks = corrTasksQ.data ?? [];
  const { data: cropsData } = useCrops(safeFarmId);
  const cropRows = cropsData?.records ?? [];
  const suppliersQ = useQuery({
    queryKey: ["suppliers", safeFarmId],
    queryFn: () => fetch(`/api/farms/${safeFarmId}/suppliers`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!safeFarmId
  });
  const batchesQ = useQuery({
    queryKey: ["seed-batches", safeFarmId],
    queryFn: () => fetch(`/api/farms/${safeFarmId}/seed-batches`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!safeFarmId
  });
  const batches = batchesQ.data ?? [];
  const posQ = useQuery({
    queryKey: ["seed-purchase-orders", safeFarmId],
    queryFn: () => fetch(`/api/farms/${safeFarmId}/seed-purchase-orders`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!safeFarmId
  });
  const pos = posQ.data ?? [];
  const storageLocationsQ = useQuery({
    queryKey: ["storage-locations", safeFarmId],
    queryFn: () => fetch(`/api/farms/${safeFarmId}/storage-locations`).then((r) => r.json()),
    enabled: !!safeFarmId
  });
  const storageLocations = storageLocationsQ.data?.records ?? (Array.isArray(storageLocationsQ.data) ? storageLocationsQ.data : []);
  const segChecksQ = useQuery({
    queryKey: ["seed-storage-checks", safeFarmId],
    queryFn: () => fetch(`/api/farms/${safeFarmId}/seed-storage-checks`).then((r) => r.json()),
    select: (d) => d.records ?? [],
    enabled: !!safeFarmId
  });
  const segChecks = Array.isArray(segChecksQ.data) ? segChecksQ.data : [];
  const fieldCropsQ = useQuery({
    queryKey: ["field-crops", safeFarmId],
    queryFn: () => fetch(`/api/farms/${safeFarmId}/field-crops`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!safeFarmId
  });
  const fieldCrops = fieldCropsQ.data ?? [];
  const fieldsQ = useQuery({
    queryKey: ["fields", safeFarmId],
    queryFn: () => fetch(`/api/farms/${safeFarmId}/fields`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!safeFarmId
  });
  const farmFields = fieldsQ.data ?? [];
  const stocktakesQ = useQuery({
    queryKey: ["seed-stocktakes", safeFarmId],
    queryFn: () => fetch(`/api/farms/${safeFarmId}/seed-stocktakes`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!safeFarmId
  });
  const stocktakes = stocktakesQ.data ?? [];
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["seed-batches", safeFarmId] });
    qc.invalidateQueries({ queryKey: ["seed-purchase-orders", safeFarmId] });
  };
  const uniqueCrops = reactExports.useMemo(() => {
    const seen = /* @__PURE__ */ new Map();
    for (const c of cropRows) {
      if (!seen.has(c.cropId)) seen.set(c.cropId, { cropId: c.cropId, name: c.name });
    }
    return Array.from(seen.values());
  }, [cropRows]);
  const [search, setSearch] = reactExports.useState("");
  const [showInactive, setShowInactive] = reactExports.useState(false);
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewItem, setViewItem] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = reactExports.useState(null);
  const openPos = reactExports.useMemo(() => pos.filter((p) => !INACTIVE_PO_STATUSES.includes(String(p.status))), [pos]);
  const varietiesForCrop = reactExports.useMemo(() => {
    if (!form.cropId) return [];
    return cropRows.filter((c) => String(c.cropId) === String(form.cropId));
  }, [cropRows, form.cropId]);
  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };
  const applyPoToForm = (poId, base) => {
    if (poId === "__none__") return base;
    const po = pos.find((p) => String(p.id) === poId);
    if (!po) return base;
    return {
      ...base,
      poId,
      cropId: po.cropId ? String(po.cropId) : base.cropId,
      varietyId: po.varietyId ? String(po.varietyId) : base.varietyId,
      supplierId: po.supplierId ? String(po.supplierId) : base.supplierId,
      quantityReceivedKg: base.quantityReceivedKg || (po.quantityKg ? String(po.quantityKg) : "")
    };
  };
  const openEdit = (b) => {
    setEditing(b);
    setForm({
      cropId: String(b.cropId),
      varietyId: String(b.varietyId),
      supplierId: b.supplierId ? String(b.supplierId) : "",
      poId: b.poId ? String(b.poId) : "__none__",
      batchNumber: b.batchNumber ?? "",
      tgwGrams: String(b.tgwGrams ?? ""),
      bagWeightKg: String(b.bagWeightKg ?? "25"),
      quantityReceivedKg: String(b.quantityReceivedKg ?? ""),
      dateReceived: b.dateReceived ? String(b.dateReceived).slice(0, 10) : "",
      deliveryNoteNumber: b.deliveryNoteNumber ?? "",
      invoiceReference: b.invoiceReference ?? "",
      costPounds: b.costPence ? String(num(b.costPence) / 100) : "",
      receivedBy: b.receivedBy ?? "",
      treatmentNotes: b.treatmentNotes ?? ""
    });
    setOpen(true);
  };
  const handleSave = () => {
    if (!form.cropId || !form.varietyId || !form.batchNumber || !form.tgwGrams || !form.quantityReceivedKg) {
      toast({ title: "Crop, variety, batch number, TGW and quantity received are required", variant: "destructive" });
      return;
    }
    const body = {
      cropId: Number(form.cropId),
      varietyId: Number(form.varietyId),
      supplierId: form.supplierId ? Number(form.supplierId) : null,
      poId: form.poId && form.poId !== "__none__" ? Number(form.poId) : null,
      batchNumber: form.batchNumber,
      tgwGrams: form.tgwGrams,
      bagWeightKg: form.bagWeightKg || "25",
      quantityReceivedKg: form.quantityReceivedKg,
      dateReceived: form.dateReceived || null,
      deliveryNoteNumber: form.deliveryNoteNumber || null,
      invoiceReference: form.invoiceReference || null,
      costPence: form.costPounds ? Math.round(num(form.costPounds) * 100) : null,
      receivedBy: form.receivedBy || null,
      treatmentNotes: form.treatmentNotes || null
    };
    saveMut.mutate(body);
  };
  const filtered = batches.filter((b) => {
    if (!showInactive && b.isActive === false) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return b.cropName?.toLowerCase().includes(q) || b.varietyName?.toLowerCase().includes(q) || b.batchNumber?.toLowerCase().includes(q) || b.supplierName?.toLowerCase().includes(q);
  });
  const [showPoDialog, setShowPoDialog] = reactExports.useState(false);
  const [editPo, setEditPo] = reactExports.useState(null);
  const [viewPo, setViewPo] = reactExports.useState(null);
  const [poForm, setPoForm] = reactExports.useState({});
  const [poFilter, setPoFilter] = usePersistedFilter({ page: "seed-store", filter: "po-status", farmId, defaultValue: "active" });
  const [deletePoTarget, setDeletePoTarget] = reactExports.useState(null);
  const [pendingCancelPo, setPendingCancelPo] = reactExports.useState(null);
  const activePos = reactExports.useMemo(() => pos.filter((p) => !INACTIVE_PO_STATUSES.includes(String(p.status))), [pos]);
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const overduePos = reactExports.useMemo(
    () => activePos.filter((p) => p.expectedDeliveryDate && String(p.expectedDeliveryDate).slice(0, 10) < today),
    [activePos, today]
  );
  const filteredPos = poFilter === "active" ? activePos : pos;
  const poCropVarieties = reactExports.useMemo(() => {
    if (!poForm.cropId) return [];
    return cropRows.filter((c) => String(c.cropId) === String(poForm.cropId));
  }, [cropRows, poForm.cropId]);
  function openPoAdd() {
    setEditPo(null);
    setPoForm({
      supplierId: "",
      cropId: "",
      varietyId: "",
      quantityKg: "",
      orderDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      expectedDeliveryDate: "",
      status: "sent",
      orderedBy: "",
      notes: ""
    });
    setShowPoDialog(true);
  }
  function openPoEdit(po) {
    setEditPo(po);
    setPoForm({
      supplierId: po.supplierId ? String(po.supplierId) : "",
      cropId: po.cropId ? String(po.cropId) : "",
      varietyId: po.varietyId ? String(po.varietyId) : "",
      quantityKg: String(po.quantityKg ?? ""),
      orderDate: po.orderDate ? String(po.orderDate).slice(0, 10) : "",
      expectedDeliveryDate: po.expectedDeliveryDate ? String(po.expectedDeliveryDate).slice(0, 10) : "",
      actualDeliveryDate: po.actualDeliveryDate ? String(po.actualDeliveryDate).slice(0, 10) : "",
      status: po.status ?? "sent",
      orderedBy: po.orderedBy ?? "",
      notes: po.notes ?? ""
    });
    setShowPoDialog(true);
  }
  const [receivePoId, setReceivePoId] = reactExports.useState(null);
  const [receivePoDate, setReceivePoDate] = reactExports.useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const savingBatch = saveMut.isPending;
  const emptySegForm = {
    storageLocationId: "__none__",
    checkDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    segregationMethod: "rigid_barrier",
    isCompliant: true,
    treatedSeedStoredLoose: false,
    notes: "",
    checkedBy: "",
    caDescription: "",
    caAssignedToMemberId: "",
    caDueDate: ""
  };
  const [showSegDialog, setShowSegDialog] = reactExports.useState(false);
  const [editSeg, setEditSeg] = reactExports.useState(null);
  const [viewSeg, setViewSeg] = reactExports.useState(null);
  const [segForm, setSegForm] = reactExports.useState(emptySegForm);
  const [deleteSegTarget, setDeleteSegTarget] = reactExports.useState(null);
  const invalidateSeg = () => qc.invalidateQueries({ queryKey: ["seed-storage-checks", safeFarmId] });
  function openSegAdd() {
    setEditSeg(null);
    setSegForm(emptySegForm);
    setShowSegDialog(true);
  }
  function openSegEdit(rec) {
    setEditSeg(rec);
    setSegForm({
      storageLocationId: rec.storageLocationId ? String(rec.storageLocationId) : "__none__",
      checkDate: rec.checkDate ? String(rec.checkDate).slice(0, 10) : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      segregationMethod: rec.segregationMethod ?? "rigid_barrier",
      isCompliant: rec.isCompliant !== false,
      treatedSeedStoredLoose: !!rec.treatedSeedStoredLoose,
      notes: rec.notes ?? "",
      checkedBy: rec.checkedBy ?? ""
    });
    setShowSegDialog(true);
  }
  const nonCompliantSegChecks = reactExports.useMemo(
    () => segChecks.filter((c) => c.isCompliant === false || c.treatedSeedStoredLoose === true),
    [segChecks]
  );
  const [allocCropFilter, setAllocCropFilter] = usePersistedFilter({ page: "seed-store", filter: "alloc-crop", farmId, defaultValue: "all" });
  const [allocStatusFilter, setAllocStatusFilter] = usePersistedFilter({ page: "seed-store", filter: "alloc-status", farmId, defaultValue: "all" });
  const [assignBatch, setAssignBatch] = reactExports.useState(null);
  const [assignFieldId, setAssignFieldId] = reactExports.useState("");
  const [assignBags, setAssignBags] = reactExports.useState("");
  const [assignDate, setAssignDate] = reactExports.useState("");
  const [editAlloc, setEditAlloc] = reactExports.useState(null);
  const [editAllocBags, setEditAllocBags] = reactExports.useState("");
  const [editAllocDate, setEditAllocDate] = reactExports.useState("");
  const allocationByBatch = reactExports.useMemo(() => {
    const map = {};
    for (const fc of fieldCrops) {
      if (!fc.seedBatchId) continue;
      if (!map[fc.seedBatchId]) map[fc.seedBatchId] = [];
      map[fc.seedBatchId].push(fc);
    }
    return map;
  }, [fieldCrops]);
  const filteredAllocBatches = reactExports.useMemo(() => batches.filter((b) => {
    if (!b.isActive) return false;
    if (allocCropFilter !== "all" && String(b.cropId) !== allocCropFilter) return false;
    const allocs = (allocationByBatch[b.id] ?? []).filter((a) => a.bagsAllocated);
    if (allocStatusFilter === "unallocated" && allocs.length > 0) return false;
    if (allocStatusFilter === "instock" && (allocs.length === 0 || Number(b.quantityRemainingKg) === 0)) return false;
    if (allocStatusFilter === "used" && Number(b.quantityRemainingKg) > 0) return false;
    return true;
  }), [batches, allocCropFilter, allocStatusFilter, allocationByBatch]);
  const assignMut = useMutation({
    mutationFn: ({ fieldId, varietyId, seedBatchId, bagsAllocated, plantingDate }) => fetch(`/api/farms/${safeFarmId}/field-crops`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fieldId, varietyId, seedBatchId, bagsAllocated: bagsAllocated || null, plantingDate: plantingDate || null }) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: (data) => {
      if (data.error) {
        toast({ title: data.error, variant: "destructive" });
        return;
      }
      qc.invalidateQueries({ queryKey: ["seed-batches", safeFarmId] });
      qc.invalidateQueries({ queryKey: ["field-crops", safeFarmId] });
      setAssignBatch(null);
      setAssignFieldId("");
      setAssignBags("");
      setAssignDate("");
      toast({ title: "Field allocated successfully" });
    },
    onError: () => toast({ title: "Failed to save allocation", variant: "destructive" })
  });
  const editAllocMut = useMutation({
    mutationFn: ({ id, bagsAllocated, plantingDate }) => fetch(`/api/farms/${safeFarmId}/field-crops/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bagsAllocated: bagsAllocated || null, plantingDate: plantingDate || null }) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: (data) => {
      if (data.error) {
        toast({ title: data.error, variant: "destructive" });
        return;
      }
      qc.invalidateQueries({ queryKey: ["seed-batches", safeFarmId] });
      qc.invalidateQueries({ queryKey: ["field-crops", safeFarmId] });
      setEditAlloc(null);
      toast({ title: "Allocation updated" });
    },
    onError: () => toast({ title: "Failed to update allocation", variant: "destructive" })
  });
  const [showStocktakeDialog, setShowStocktakeDialog] = reactExports.useState(false);
  const [stBatchId, setStBatchId] = reactExports.useState("");
  const [stLocation, setStLocation] = reactExports.useState("");
  const [stSystemBags, setStSystemBags] = reactExports.useState("");
  const [stPhysicalBags, setStPhysicalBags] = reactExports.useState("");
  const [stConductedBy, setStConductedBy] = reactExports.useState("");
  const [stDate, setStDate] = reactExports.useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [stNotes, setStNotes] = reactExports.useState("");
  const stocktakeMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${safeFarmId}/seed-stocktakes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: (data) => {
      if (data.error) {
        toast({ title: data.error, variant: "destructive" });
        return;
      }
      qc.invalidateQueries({ queryKey: ["seed-stocktakes", safeFarmId] });
      setShowStocktakeDialog(false);
      setStBatchId("");
      setStLocation("");
      setStSystemBags("");
      setStPhysicalBags("");
      setStConductedBy("");
      setStDate((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
      setStNotes("");
      toast({ title: "Stocktake recorded" });
    },
    onError: () => toast({ title: "Failed to save stocktake", variant: "destructive" })
  });
  const stVariance = stSystemBags && stPhysicalBags ? Number(stPhysicalBags) - Number(stSystemBags) : null;
  _mut.current = {
    safeFarmId,
    toast,
    invalidate,
    invalidateSeg,
    qc,
    editing,
    setEditing,
    setOpen,
    setForm,
    setDeleteTarget,
    editPo,
    setShowPoDialog,
    setDeletePoTarget,
    setReceivePoId,
    editSeg,
    setShowSegDialog,
    setDeleteSegTarget
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Seed Store", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { maxWidth: 1200, margin: "0 auto" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Manage seed purchase orders, log deliveries (GRN) and track stock levels for crop varieties." }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "stock", onClick: () => setTab("stock"), children: [
        "Seed Stock (",
        batches.length,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "allocation", onClick: () => setTab("allocation"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-3.5 h-3.5 mr-1 inline" }),
        "Field Allocation",
        batches.filter((b) => b.isActive && (allocationByBatch[b.id] ?? []).filter((a) => a.bagsAllocated).length === 0).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1.5 inline-flex items-center justify-center text-[10px] font-bold bg-amber-500 text-white rounded-full w-4 h-4", children: batches.filter((b) => b.isActive && (allocationByBatch[b.id] ?? []).filter((a) => a.bagsAllocated).length === 0).length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "orders", onClick: () => setTab("orders"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "w-3.5 h-3.5 mr-1 inline" }),
        "Seed Orders",
        overduePos.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1.5 inline-flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full w-4 h-4", children: overduePos.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "segregation", onClick: () => setTab("segregation"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-3.5 h-3.5 mr-1 inline" }),
        "Segregation Checks",
        nonCompliantSegChecks.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1.5 inline-flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full w-4 h-4", children: nonCompliantSegChecks.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "stocktakes", onClick: () => setTab("stocktakes"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-3.5 h-3.5 mr-1 inline" }),
        "Stocktakes"
      ] })
    ] }),
    tab === "stock" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "relative", flex: 1 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 14, style: { position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search by crop, variety, batch number or supplier...", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-8" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: showInactive ? "default" : "outline",
            size: "sm",
            onClick: () => setShowInactive((s) => !s),
            children: [
              showInactive ? "Hide" : "Show",
              " Used-Up Batches"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
          "Log Seed Batch"
        ] })
      ] }),
      batchesQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 py-8 text-center", children: "Loading..." }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        SeedStoreEmptyState,
        {
          icon: Package,
          title: "No seed batches recorded yet",
          subtitle: "Log seed batches as they arrive from suppliers to track TGW, stock and generate bag labels",
          action: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
            "Log Seed Batch"
          ] })
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg overflow-hidden overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Crop / Variety", "Batch No.", "Supplier", "TGW", "Remaining / Received", "Bags", "Received", "Status", "Actions"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-medium text-gray-600 whitespace-nowrap text-xs uppercase tracking-wide", children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: filtered.map((b) => {
          const received = num(b.quantityReceivedKg);
          const remaining = num(b.quantityRemainingKg);
          const bagWeight = num(b.bagWeightKg) || 25;
          const bagsRemaining = bagWeight > 0 ? remaining / bagWeight : 0;
          const pctRemaining = received > 0 ? Math.max(0, Math.min(100, remaining / received * 100)) : 0;
          const isLow = received > 0 && pctRemaining <= 15 && remaining > 0;
          const isDepleted = remaining <= 0;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: `hover:bg-gray-50 ${b.isActive === false ? "opacity-60" : ""}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 whitespace-nowrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-900", children: b.cropName }),
              b.varietyName && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-500", children: [
                " — ",
                b.varietyName
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-mono text-xs whitespace-nowrap", children: b.batchNumber }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 whitespace-nowrap", children: b.supplierName || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 whitespace-nowrap font-medium text-green-700", children: [
              num(b.tgwGrams).toFixed(1),
              "g"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              !!isLow && /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 13, color: "#f59e0b" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-medium ${isDepleted ? "text-gray-400" : isLow ? "text-amber-700" : "text-gray-900"}`, children: [
                remaining % 1 === 0 ? remaining.toFixed(0) : remaining.toFixed(1),
                "kg"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-400", children: [
                "/ ",
                received % 1 === 0 ? received.toFixed(0) : received.toFixed(1),
                "kg"
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 whitespace-nowrap", children: [
              bagsRemaining.toFixed(1),
              " @ ",
              bagWeight,
              "kg"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 whitespace-nowrap text-gray-500 text-xs", children: fmt(b.dateReceived) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 whitespace-nowrap", children: isDepleted ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs bg-gray-100 text-gray-600 border-none", children: "Used up" }) : isLow ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs bg-amber-100 text-amber-700 border-none", children: "Low stock" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs bg-green-100 text-green-700 border-none", children: "In stock" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setViewItem(b), title: "View", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => openEdit(b), title: "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setDeleteTarget(b), title: "Delete", className: "text-red-500 hover:text-red-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
            ] }) })
          ] }, b.id);
        }) })
      ] }) })
    ] }),
    tab === "orders" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-gray-900", children: "Seed Orders Register" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Track seed orders raised with suppliers. When delivery arrives, mark as received and log the seed batch (GRN) in the Stock tab." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openPoAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }),
          "Raise Seed Order"
        ] })
      ] }),
      activePos.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3" }),
          activePos.length,
          " active order",
          activePos.length !== 1 ? "s" : ""
        ] }),
        overduePos.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-2.5 py-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-3 h-3" }),
          overduePos.length,
          " overdue — chase supplier"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setPoFilter("active"), className: `text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${poFilter === "active" ? "bg-green-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`, children: [
          "Active (",
          activePos.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setPoFilter("all"), className: `text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${poFilter === "all" ? "bg-green-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`, children: [
          "All (",
          pos.length,
          ")"
        ] })
      ] }),
      filteredPos.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-gray-400", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "w-10 h-10 mx-auto mb-3 opacity-20" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-500", children: poFilter === "active" ? "No active seed orders" : "No seed orders on record" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-1 mb-4", children: "Raise a seed order when purchasing seed from a supplier." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openPoAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }),
          "Raise Seed Order"
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: filteredPos.map((po) => {
        const isOverdue = !INACTIVE_PO_STATUSES.includes(String(po.status)) && po.expectedDeliveryDate && String(po.expectedDeliveryDate).slice(0, 10) < today;
        const isReceived = po.status === "received";
        const isCancelled = po.status === "cancelled";
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `rounded-lg border p-4 ${isOverdue ? "border-red-300 bg-red-50" : isReceived ? "border-green-200 bg-green-50/60" : isCancelled ? "border-gray-200 bg-gray-50/60" : "border-amber-200 bg-white"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              !!isOverdue && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4 text-red-500 flex-shrink-0" }),
              !!isReceived && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 text-green-500 flex-shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-sm font-semibold text-gray-800", children: String(po.poNumber) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-medium px-2 py-0.5 rounded-full ${isReceived ? "bg-green-100 text-green-700" : po.status === "confirmed" ? "bg-blue-100 text-blue-700" : po.status === "sent" ? "bg-amber-100 text-amber-700" : po.status === "draft" ? "bg-gray-100 text-gray-600" : isCancelled ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`, children: String(po.status).charAt(0).toUpperCase() + String(po.status).slice(1) }),
              !!isOverdue && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-red-600 font-medium", children: [
                "Overdue since ",
                fmt(po.expectedDeliveryDate)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-800 mt-0.5", children: [
              po.supplierName ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: String(po.supplierName) }),
                " — "
              ] }) : null,
              String(po.cropName ?? ""),
              po.varietyName ? ` (${po.varietyName})` : ""
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-0.5", children: [
              num(po.quantityKg).toFixed(0),
              "kg",
              !!po.orderDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                " · Ordered ",
                fmt(po.orderDate)
              ] }),
              !!po.expectedDeliveryDate && !isOverdue && !isReceived && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                " · Expected ",
                fmt(po.expectedDeliveryDate)
              ] }),
              !!po.actualDeliveryDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                " · Delivered ",
                fmt(po.actualDeliveryDate)
              ] }),
              !!po.orderedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                " · Raised by ",
                String(po.orderedBy)
              ] })
            ] }),
            !!po.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1 italic truncate max-w-md", children: String(po.notes) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setViewPo(po), title: "View", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
            !isReceived && !isCancelled && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                className: "text-xs font-medium px-2.5 py-1 rounded border border-green-300 text-green-700 bg-white hover:bg-green-50 flex items-center gap-1 transition-colors",
                onClick: () => {
                  setReceivePoId(Number(po.id));
                  setReceivePoDate((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3" }),
                  "Received"
                ]
              }
            ),
            !isCancelled && !isReceived && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "text-xs px-2 py-1 rounded border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 flex items-center gap-1 transition-colors",
                onClick: () => setPendingCancelPo(Number(po.id)),
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "text-xs px-2 py-1 rounded border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 flex items-center gap-1 transition-colors", onClick: () => openPoEdit(po), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3 h-3" }),
              "Edit"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-xs px-2 py-1 rounded border border-red-200 text-red-600 bg-white hover:bg-red-50 flex items-center transition-colors", onClick: () => setDeletePoTarget(po), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3 h-3" }) })
          ] })
        ] }) }, String(po.id));
      }) })
    ] }),
    tab === "segregation" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-gray-900", children: "Seed Storage Segregation Checks" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Red Tractor CR.ST.19: treated seed must not contaminate stored grain — secure segregation via rigid barrier or 3m distance, and treated seed must never be stored loose in a grain store. Log a check for each storage location holding treated seed." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => printSegregationRegister(segChecks, safeFarmId), disabled: segChecks.length === 0, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
            "Print Register"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openSegAdd, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }),
            "Log Check"
          ] })
        ] })
      ] }),
      nonCompliantSegChecks.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-2.5 py-1.5 mb-4 w-fit", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-3.5 h-3.5" }),
        nonCompliantSegChecks.length,
        " check",
        nonCompliantSegChecks.length !== 1 ? "s" : "",
        " flagged non-compliant — resolve and re-check"
      ] }),
      segChecksQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 py-8 text-center", children: "Loading..." }) : segChecks.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        SeedStoreEmptyState,
        {
          icon: ShieldCheck,
          title: "No segregation checks recorded yet",
          subtitle: "Log a check to evidence CR.ST.19 compliance for each storage location holding treated seed",
          action: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openSegAdd, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
            "Log Check"
          ] })
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg overflow-hidden overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Storage Location", "Check Date", "Method", "Compliant?", "Corrective Action", "Checked By", "Evidence", "Actions"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-medium text-gray-600 whitespace-nowrap text-xs uppercase tracking-wide", children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: segChecks.map((c) => {
          const nonCompliant = c.isCompliant === false || c.treatedSeedStoredLoose === true;
          const corrTask = corrTasks.find((t) => t.taskSourceId === `seed-seg-check-${c.id}`);
          const today2 = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
          const taskOverdue = corrTask && corrTask.status !== "completed" && corrTask.dueDate && corrTask.dueDate < today2;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 whitespace-nowrap font-medium text-gray-900", children: c.storageLocationName || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 whitespace-nowrap text-gray-600", children: fmt(c.checkDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 whitespace-nowrap text-gray-600", children: c.segregationMethod === "rigid_barrier" ? "Rigid barrier" : c.segregationMethod === "distance_3m" ? "3m distance" : c.segregationMethod === "separate_store" ? "Separate store" : c.segregationMethod || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 whitespace-nowrap", children: nonCompliant ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "text-xs bg-red-100 text-red-700 border-none flex items-center gap-1 w-fit", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-3 h-3" }),
              "Non-compliant"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "text-xs bg-green-100 text-green-700 border-none flex items-center gap-1 w-fit", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-3 h-3" }),
              "Compliant"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 whitespace-nowrap", children: corrTask ? corrTask.status === "completed" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "text-xs bg-green-100 text-green-700 border-none flex items-center gap-1 w-fit", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-3 h-3" }),
              "Resolved"
            ] }) : taskOverdue ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "text-xs bg-red-100 text-red-700 border-none flex items-center gap-1 w-fit", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-3 h-3" }),
              "Task overdue"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "text-xs bg-amber-100 text-amber-700 border-none flex items-center gap-1 w-fit", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3" }),
              "Task open"
            ] }) : nonCompliant ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400", children: "No task raised" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-300", children: "—" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 whitespace-nowrap text-gray-600", children: c.checkedBy || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 whitespace-nowrap text-gray-500 text-xs", children: c.evidencePhotoName ? "Photo attached" : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setViewSeg(c), title: "View", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => openSegEdit(c), title: "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setDeleteSegTarget(c), title: "Delete", className: "text-red-500 hover:text-red-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
            ] }) })
          ] }, c.id);
        }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: viewSeg !== null, onOpenChange: (o) => {
      if (!o) setViewSeg(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Segregation Check — ",
        viewSeg?.storageLocationName || "—"
      ] }) }),
      viewSeg && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-6 gap-y-2 text-sm pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Storage Location" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewSeg.storageLocationName || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Check Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewSeg.checkDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Segregation Method" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewSeg.segregationMethod === "rigid_barrier" ? "Rigid barrier" : viewSeg.segregationMethod === "distance_3m" ? "3m distance" : viewSeg.segregationMethod === "separate_store" ? "Separate store" : viewSeg.segregationMethod || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Compliant" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewSeg.isCompliant === false ? "No" : "Yes" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Treated Seed Stored Loose" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewSeg.treatedSeedStoredLoose ? "Yes — non-compliant" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Checked By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewSeg.checkedBy || "—" })
        ] }),
        viewSeg.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewSeg.notes })
        ] })
      ] }),
      viewSeg && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2 border-t", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SeedStoreRecordAttachments, { farmId: safeFarmId, recordType: "seed_storage_segregation_check", recordId: viewSeg.id }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewSeg(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
          const it = viewSeg;
          setViewSeg(null);
          if (it) openSegEdit(it);
        }, children: "Edit" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showSegDialog, onOpenChange: (v) => {
      setShowSegDialog(v);
      if (!v) {
        setEditSeg(null);
        setSegForm(emptySegForm);
        segMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editSeg ? "Edit Segregation Check" : "Log Segregation Check" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Evidence for Red Tractor CR.ST.19 — treated seed segregation from stored grain." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 max-h-[60vh] overflow-y-auto pr-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Storage Location" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: segForm.storageLocationId ?? "__none__", onValueChange: (v) => setSegForm((f) => ({ ...f, storageLocationId: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select storage location..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not linked to a location" }),
              storageLocations.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(s.id), children: s.name }, s.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Check Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: segForm.checkDate ?? "", onChange: (e) => setSegForm((f) => ({ ...f, checkDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Segregation Method" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: segForm.segregationMethod ?? "rigid_barrier", onValueChange: (v) => setSegForm((f) => ({ ...f, segregationMethod: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "rigid_barrier", children: "Rigid barrier" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "distance_3m", children: "3m distance" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "separate_store", children: "Separate store" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "other", children: "Other" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Compliant?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: segForm.isCompliant ? "yes" : "no", onValueChange: (v) => setSegForm((f) => ({ ...f, isCompliant: v === "yes" })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "yes", children: "Yes — compliant" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "no", children: "No — non-compliant" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Treated Seed Stored Loose?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: segForm.treatedSeedStoredLoose ? "yes" : "no", onValueChange: (v) => setSegForm((f) => ({ ...f, treatedSeedStoredLoose: v === "yes" })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "no", children: "No" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "yes", children: "Yes — non-compliant" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Checked By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSelect, { value: segForm.checkedBy ?? "", onChange: (v) => setSegForm((f) => ({ ...f, checkedBy: v })), staffNames, loading: membersLoading })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: segForm.notes ?? "", onChange: (e) => setSegForm((f) => ({ ...f, notes: e.target.value })), placeholder: "e.g. Rigid steel bin used to separate treated seed from grain heap", rows: 2 })
        ] }),
        (!segForm.isCompliant || segForm.treatedSeedStoredLoose) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 border border-amber-200 bg-amber-50 rounded-lg p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4 text-amber-600 flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-amber-800", children: "Corrective Action" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-700", children: "Describe what needs to be remedied, assign to a staff member and set a deadline — a task will be raised automatically and will appear in the Resource Planner." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "What needs to be corrected?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: segForm.caDescription ?? "", onChange: (e) => setSegForm((f) => ({ ...f, caDescription: e.target.value })), placeholder: "e.g. Install rigid divider to separate treated seed from grain in Store 2", rows: 2 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Assign To" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: segForm.caAssignedToMemberId ?? "", onValueChange: (v) => setSegForm((f) => ({ ...f, caAssignedToMemberId: v })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select staff member..." }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: activeMembers.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(m.id), children: [
                  m.firstName,
                  " ",
                  m.lastName
                ] }, m.id)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Due Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: segForm.caDueDate ?? "", onChange: (e) => setSegForm((f) => ({ ...f, caDueDate: e.target.value })) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-600 italic", children: "Leave blank to record without raising a task." })
        ] }),
        editSeg && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2 border-t", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SeedStoreRecordAttachments, { farmId: safeFarmId, recordType: "seed_storage_segregation_check", recordId: editSeg.id }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: segMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShowSegDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            disabled: !segForm.checkDate || segMut.isPending,
            onClick: () => {
              const data = {
                storageLocationId: segForm.storageLocationId && segForm.storageLocationId !== "__none__" ? Number(segForm.storageLocationId) : null,
                checkDate: segForm.checkDate,
                segregationMethod: segForm.segregationMethod || "rigid_barrier",
                isCompliant: !!segForm.isCompliant,
                treatedSeedStoredLoose: !!segForm.treatedSeedStoredLoose,
                notes: segForm.notes || null,
                checkedBy: segForm.checkedBy || null,
                caDescription: segForm.caDescription || null,
                caAssignedToMemberId: segForm.caAssignedToMemberId || null,
                caDueDate: segForm.caDueDate || null
              };
              segMut.mutate(data);
            },
            children: segMut.isPending ? "Saving…" : editSeg ? "Save Changes" : "Log Check"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!deleteSegTarget, onOpenChange: (v) => {
      if (!v) {
        setDeleteSegTarget(null);
        deleteSegMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete Segregation Check?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "This will permanently remove this segregation check record. This cannot be undone." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteSegMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: () => deleteSegTarget && deleteSegMut.mutate(deleteSegTarget.id), children: "Delete" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: viewItem !== null, onOpenChange: (o) => {
      if (!o) setViewItem(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Seed Batch — ",
        viewItem?.batchNumber
      ] }) }),
      viewItem && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-6 gap-y-2 text-sm pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Crop" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.cropName || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Variety" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.varietyName || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Supplier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.supplierName || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "TGW" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            num(viewItem.tgwGrams).toFixed(1),
            "g"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Quantity Received" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            num(viewItem.quantityReceivedKg).toFixed(1),
            "kg"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Quantity Remaining" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            num(viewItem.quantityRemainingKg).toFixed(1),
            "kg"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Bag Weight" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            num(viewItem.bagWeightKg) || 25,
            "kg"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Date Received" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewItem.dateReceived) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Delivery Note No." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.deliveryNoteNumber || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Invoice Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.invoiceReference || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Cost" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtGBP(viewItem.costPence) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Received By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.receivedBy || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Linked Order" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: pos.find((p) => p.id === viewItem.poId)?.poNumber || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.isActive === false ? "Used up" : "In stock" })
        ] }),
        viewItem.treatmentNotes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Treatment / Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.treatmentNotes })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewItem(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
          const it = viewItem;
          setViewItem(null);
          if (it) openEdit(it);
        }, children: "Edit" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
      setOpen(v);
      if (!v) {
        setEditing(null);
        setForm(emptyForm);
        saveMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 480 }, className: "max-h-[85vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Seed Batch" : "Log Seed Batch (GRN)" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        !editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link to Purchase Order" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.poId, onValueChange: (v) => setForm((f) => applyPoToForm(v, { ...f })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "No linked order..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "No linked order" }),
              openPos.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(p.id), children: [
                p.poNumber,
                " — ",
                p.cropName,
                p.varietyName ? ` (${p.varietyName})` : ""
              ] }, p.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Crop *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.cropId, onValueChange: (v) => setForm((f) => ({ ...f, cropId: v, varietyId: "" })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select crop..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: uniqueCrops.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(c.cropId), children: c.name }, c.cropId)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Variety *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.varietyId, onValueChange: (v) => setForm((f) => ({ ...f, varietyId: v })), disabled: !form.cropId, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select variety..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: varietiesForCrop.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(v.id), children: v.variety || "—" }, v.id)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.supplierId, onValueChange: (v) => setForm((f) => ({ ...f, supplierId: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select supplier (optional)..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: (suppliersQ.data ?? []).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(s.id), children: s.name }, s.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Batch Number *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.batchNumber, onChange: (e) => setForm((f) => ({ ...f, batchNumber: e.target.value })), placeholder: "e.g. SK-2026-0417" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "TGW (g) *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.tgwGrams, onChange: (e) => setForm((f) => ({ ...f, tgwGrams: e.target.value })), placeholder: "e.g. 48.5" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bag Weight (kg)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.5", value: form.bagWeightKg, onChange: (e) => setForm((f) => ({ ...f, bagWeightKg: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity Received (kg) *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.quantityReceivedKg, onChange: (e) => setForm((f) => ({ ...f, quantityReceivedKg: e.target.value })), disabled: !!editing })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date Received" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.dateReceived, onChange: (e) => setForm((f) => ({ ...f, dateReceived: e.target.value })) })
          ] })
        ] }),
        editing && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#9ca3af" }, children: "Quantity received is fixed once logged — stock is adjusted automatically as it's allocated to fields." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Delivery Note No." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.deliveryNoteNumber, onChange: (e) => setForm((f) => ({ ...f, deliveryNoteNumber: e.target.value })), placeholder: "e.g. DN-4471" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Invoice Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.invoiceReference, onChange: (e) => setForm((f) => ({ ...f, invoiceReference: e.target.value })), placeholder: "e.g. INV-10234" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cost (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.costPounds, onChange: (e) => setForm((f) => ({ ...f, costPounds: e.target.value })), placeholder: "e.g. 850.00" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Received By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSelect, { value: form.receivedBy, onChange: (v) => setForm((f) => ({ ...f, receivedBy: v })), staffNames, loading: membersLoading })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Treatment / Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.treatmentNotes, onChange: (e) => setForm((f) => ({ ...f, treatmentNotes: e.target.value })), placeholder: "e.g. Redigo Deter treated" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleSave, disabled: savingBatch, children: [
          savingBatch && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "mr-1 animate-spin" }),
          editing ? "Save Changes" : "Log Batch"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!deleteTarget, onOpenChange: (v) => {
      if (!v) {
        setDeleteTarget(null);
        deleteMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete Seed Batch?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
          'This will permanently remove batch "',
          deleteTarget?.batchNumber,
          '". This cannot be undone. If field assignments still reference this batch, deletion may fail.'
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: () => deleteTarget && deleteMut.mutate(deleteTarget.id), children: "Delete" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: viewPo !== null, onOpenChange: (o) => {
      if (!o) setViewPo(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Seed Order — ",
        viewPo?.poNumber
      ] }) }),
      viewPo && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-6 gap-y-2 text-sm pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Supplier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewPo.supplierName || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewPo.status).charAt(0).toUpperCase() + String(viewPo.status).slice(1) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Crop" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewPo.cropName || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Variety" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewPo.varietyName || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Quantity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            num(viewPo.quantityKg).toFixed(0),
            "kg"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Order Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewPo.orderDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Expected Delivery" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewPo.expectedDeliveryDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Actual Delivery" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewPo.actualDeliveryDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Raised By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewPo.orderedBy || "—" })
        ] }),
        viewPo.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewPo.notes })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewPo(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
          const it = viewPo;
          setViewPo(null);
          if (it) openPoEdit(it);
        }, children: "Edit" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showPoDialog, onOpenChange: (v) => {
      if (!v) {
        setShowPoDialog(false);
        poMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editPo ? "Edit Seed Order" : "Raise Seed Order" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: editPo ? `Edit details for ${editPo.poNumber}` : "Record a seed purchase order raised with a supplier." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 max-h-[60vh] overflow-y-auto pr-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Supplier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: poForm.supplierId ?? "", onValueChange: (v) => setPoForm((f) => ({ ...f, supplierId: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select supplier (optional)..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: (suppliersQ.data ?? []).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(s.id), children: s.name }, s.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Crop *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: poForm.cropId ?? "", onValueChange: (v) => setPoForm((f) => ({ ...f, cropId: v, varietyId: "" })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select crop..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: uniqueCrops.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(c.cropId), children: c.name }, c.cropId)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Variety *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: poForm.varietyId ?? "", onValueChange: (v) => setPoForm((f) => ({ ...f, varietyId: v })), disabled: !poForm.cropId, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select variety..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: poCropVarieties.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(v.id), children: v.variety || "—" }, v.id)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Quantity (kg) *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: poForm.quantityKg ?? "", onChange: (e) => setPoForm((f) => ({ ...f, quantityKg: e.target.value })), placeholder: "e.g. 500" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Order Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: poForm.orderDate ?? "", onChange: (e) => setPoForm((f) => ({ ...f, orderDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Expected Delivery" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: poForm.expectedDeliveryDate ?? "", onChange: (e) => setPoForm((f) => ({ ...f, expectedDeliveryDate: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: poForm.status ?? "sent", onValueChange: (v) => setPoForm((f) => ({ ...f, status: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "draft", children: "Draft" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "sent", children: "Sent to Supplier" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "confirmed", children: "Confirmed" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "received", children: "Received" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cancelled", children: "Cancelled" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Raised By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSelect, { value: poForm.orderedBy ?? "", onChange: (v) => setPoForm((f) => ({ ...f, orderedBy: v })), staffNames, loading: membersLoading })
          ] })
        ] }),
        poForm.status === "received" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Actual Delivery Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: poForm.actualDeliveryDate ?? "", onChange: (e) => setPoForm((f) => ({ ...f, actualDeliveryDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: poForm.notes ?? "", onChange: (e) => setPoForm((f) => ({ ...f, notes: e.target.value })), placeholder: "Any notes about this order…", rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: poMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShowPoDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            disabled: !poForm.cropId || !poForm.varietyId || !poForm.quantityKg || !poForm.orderDate || poMut.isPending,
            onClick: () => {
              const data = {
                supplierId: poForm.supplierId ? Number(poForm.supplierId) : null,
                cropId: Number(poForm.cropId),
                varietyId: Number(poForm.varietyId),
                quantityKg: poForm.quantityKg,
                orderDate: poForm.orderDate,
                expectedDeliveryDate: poForm.expectedDeliveryDate || null,
                actualDeliveryDate: poForm.actualDeliveryDate || null,
                status: poForm.status || "sent",
                orderedBy: poForm.orderedBy || null,
                notes: poForm.notes || null
              };
              poMut.mutate(data);
            },
            children: poMut.isPending ? "Saving…" : editPo ? "Save Changes" : "Raise Order"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: receivePoId !== null, onOpenChange: (v) => {
      if (!v) {
        setReceivePoId(null);
        receivePoMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Mark Order as Received" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Confirm the actual delivery date. Then log the seed batch (GRN) in the Stock tab." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Actual Delivery Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: receivePoDate, onChange: (e) => setReceivePoDate(e.target.value) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: receivePoMut, message: "Failed to save — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setReceivePoId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            disabled: !receivePoDate || receivePoMut.isPending,
            onClick: () => {
              if (receivePoId !== null) receivePoMut.mutate({ id: receivePoId, date: receivePoDate });
            },
            children: receivePoMut.isPending ? "Saving…" : "Mark Received"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!deletePoTarget, onOpenChange: (v) => {
      if (!v) {
        setDeletePoTarget(null);
        deletePoMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete Seed Order?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
          'This will permanently remove order "',
          deletePoTarget?.poNumber,
          '". This cannot be undone.'
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deletePoMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: () => deletePoTarget && deletePoMut.mutate(deletePoTarget.id), children: "Delete" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: pendingCancelPo !== null,
        title: "Cancel seed order",
        message: "Cancel this seed order?",
        confirmLabel: "Cancel booking",
        confirmVariant: "destructive",
        mutation: cancelPoMut,
        onConfirm: () => {
          if (pendingCancelPo !== null) cancelPoMut.mutate(pendingCancelPo, { onSuccess: () => setPendingCancelPo(null) });
        },
        onCancel: () => {
          setPendingCancelPo(null);
          cancelPoMut.reset();
        }
      }
    ),
    tab === "allocation" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mb-4 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: allocCropFilter,
            onChange: (e) => setAllocCropFilter(e.target.value),
            className: "text-xs border rounded-md px-2 py-1.5 bg-white",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All crops" }),
              uniqueCrops.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: String(c.cropId), children: c.name }, c.cropId))
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: allocStatusFilter,
            onChange: (e) => setAllocStatusFilter(e.target.value),
            className: "text-xs border rounded-md px-2 py-1.5 bg-white",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "unallocated", children: "Unallocated" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "instock", children: "Part allocated" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "used", children: "Fully used" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => printStocktakeSheet(batches.filter((b) => b.isActive), fieldCrops, safeFarmId), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
          "Print Stocktake Sheet"
        ] })
      ] }),
      filteredAllocBatches.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-gray-400", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-10 h-10 mx-auto mb-3 opacity-20" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-500", children: "No active batches found" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-1", children: "Receive seed stock on the Seed Stock tab first." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: filteredAllocBatches.map((batch) => {
        const allocs = (allocationByBatch[batch.id] ?? []).filter((a) => a.bagsAllocated);
        const bagW = Number(batch.bagWeightKg ?? 25);
        const totalBags = bagW > 0 ? Math.round(Number(batch.quantityReceivedKg) / bagW) : 0;
        const allocatedBags = allocs.reduce((s, a) => s + Number(a.bagsAllocated ?? 0), 0);
        const remainingBags = bagW > 0 ? Math.round(Number(batch.quantityRemainingKg) / bagW) : 0;
        const pct = totalBags > 0 ? Math.min(100, Math.round(allocatedBags / totalBags * 100)) : 0;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-4 bg-white", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-sm font-semibold", children: batch.batchNumber }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-gray-600", children: [
                  batch.cropName,
                  " · ",
                  batch.varietyName
                ] }),
                batch.supplierName && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400", children: batch.supplierName })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-gray-500 mt-0.5", children: [
                batch.tgwGrams,
                "g TGW · ",
                bagW,
                "kg bags · ",
                totalBags,
                " bags received"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
              setAssignBatch(batch);
              setAssignFieldId("");
              setAssignBags("");
              setAssignDate("");
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }),
              "Assign to Field"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-gray-500 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                allocatedBags,
                " bags allocated"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                remainingBags,
                " bags in store"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 bg-gray-100 rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-green-600 rounded-full transition-all", style: { width: `${pct}%` } }) })
          ] }),
          allocs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b text-gray-500", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-1 font-medium", children: "Field" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-1 font-medium", children: "Bags" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-1 font-medium", children: "Weight" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-1 font-medium", children: "Planting date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "w-8" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: allocs.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-50 hover:bg-gray-50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5", children: a.fieldName || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 italic", children: "Unknown field" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-right py-1.5", children: a.bagsAllocated }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "text-right py-1.5", children: [
                (Number(a.bagsAllocated) * bagW).toLocaleString(),
                " kg"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-right py-1.5 text-gray-500", children: a.plantingDate ? new Date(a.plantingDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-right py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  className: "text-gray-400 hover:text-green-700 transition-colors",
                  onClick: () => {
                    setEditAlloc({ assignment: a, batch });
                    setEditAllocBags(String(a.bagsAllocated ?? ""));
                    setEditAllocDate(a.plantingDate ? String(a.plantingDate).slice(0, 10) : "");
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3 h-3" })
                }
              ) })
            ] }, a.id)) })
          ] }),
          allocs.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-600 bg-amber-50 rounded px-2 py-1.5", children: "Not yet assigned to any field" })
        ] }, batch.id);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!assignBatch, onOpenChange: (v) => {
        if (!v) {
          setAssignBatch(null);
          assignMut.reset();
        }
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Assign to Field" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
            "Batch: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-semibold", children: assignBatch?.batchNumber }),
            " · ",
            assignBatch?.cropName,
            " ",
            assignBatch?.varietyName
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-gray-700 block mb-1", children: "Field *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: assignFieldId,
                onChange: (e) => setAssignFieldId(e.target.value),
                className: "w-full border rounded-md px-3 py-2 text-sm",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select a field…" }),
                  farmFields.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: String(f.id), children: [
                    f.name,
                    f.areaHectares ? ` (${f.areaHectares} ha)` : ""
                  ] }, f.id))
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs font-medium text-gray-700 block mb-1", children: [
              "Bags *",
              assignBatch && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-normal text-gray-400 ml-1", children: [
                "(",
                Math.round(Number(assignBatch.quantityRemainingKg) / Number(assignBatch.bagWeightKg ?? 25)),
                " in store)"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                min: "1",
                value: assignBags,
                onChange: (e) => setAssignBags(e.target.value),
                placeholder: "Number of bags"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-gray-700 block mb-1", children: "Planting date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: assignDate, onChange: (e) => setAssignDate(e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: assignMut, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAssignBatch(null), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              disabled: !assignFieldId || !assignBags || assignMut.isPending,
              onClick: () => assignBatch && assignMut.mutate({ fieldId: Number(assignFieldId), varietyId: assignBatch.varietyId, seedBatchId: assignBatch.id, bagsAllocated: Number(assignBags), plantingDate: assignDate || null }),
              children: assignMut.isPending ? "Saving…" : "Assign"
            }
          )
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!editAlloc, onOpenChange: (v) => {
        if (!v) {
          setEditAlloc(null);
          editAllocMut.reset();
        }
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Edit Allocation" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
            editAlloc?.batch?.batchNumber,
            " → ",
            editAlloc?.assignment?.fieldName
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-gray-700 block mb-1", children: "Bags *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", value: editAllocBags, onChange: (e) => setEditAllocBags(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-gray-700 block mb-1", children: "Planting date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: editAllocDate, onChange: (e) => setEditAllocDate(e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: editAllocMut, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setEditAlloc(null), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              disabled: !editAllocBags || editAllocMut.isPending,
              onClick: () => editAlloc && editAllocMut.mutate({ id: editAlloc.assignment.id, bagsAllocated: Number(editAllocBags), plantingDate: editAllocDate || null }),
              children: editAllocMut.isPending ? "Saving…" : "Save"
            }
          )
        ] })
      ] }) })
    ] }),
    tab === "stocktakes" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Record physical counts and reconcile against system stock levels." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => printStocktakeSheet(batches.filter((b) => b.isActive), fieldCrops, safeFarmId), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
            "Print Sheet"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setShowStocktakeDialog(true), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }),
            "Record Stocktake"
          ] })
        ] })
      ] }),
      stocktakesQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 text-gray-400 text-sm", children: "Loading…" }) : stocktakes.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-gray-400", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-10 h-10 mx-auto mb-3 opacity-20" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-500", children: "No stocktakes recorded yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-1 mb-4", children: 'Use "Record Stocktake" to log a physical count.' }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setShowStocktakeDialog(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }),
          "Record Stocktake"
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: stocktakes.map((st) => {
        const variance = st.systemQtyBags != null ? st.physicalQtyBags - st.systemQtyBags : null;
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg p-3 bg-white flex items-start gap-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: st.stocktakeDate ? new Date(st.stocktakeDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—" }),
            st.batchNumber && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-gray-600", children: st.batchNumber }),
            st.cropName && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500", children: [
              st.cropName,
              " · ",
              st.varietyName
            ] }),
            st.location && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-400", children: [
              "@ ",
              st.location
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mt-1 text-xs text-gray-600", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Physical: ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                st.physicalQtyBags,
                " bags"
              ] })
            ] }),
            st.systemQtyBags != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "System: ",
              st.systemQtyBags,
              " bags"
            ] }),
            variance != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `flex items-center gap-0.5 font-semibold ${variance === 0 ? "text-green-600" : variance < 0 ? "text-red-600" : "text-amber-600"}`, children: [
              variance > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-3 h-3" }) : variance < 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "w-3 h-3" }) : null,
              variance > 0 ? "+" : "",
              variance
            ] }),
            st.conductedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-400", children: [
              "by ",
              st.conductedBy
            ] })
          ] }),
          st.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-0.5 truncate", children: st.notes })
        ] }) }, st.id);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showStocktakeDialog, onOpenChange: (v) => {
        if (!v) {
          setShowStocktakeDialog(false);
          stocktakeMut.reset();
        }
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Record Stocktake" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Log a physical count of seed bags in store." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2 max-h-[60vh] overflow-y-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-gray-700 block mb-1", children: "Seed batch (optional)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: stBatchId,
                onChange: (e) => {
                  const bId = e.target.value;
                  setStBatchId(bId);
                  if (bId) {
                    const b = batches.find((x) => String(x.id) === bId);
                    const bagW = Number(b?.bagWeightKg ?? 25);
                    const sysBags = bagW > 0 ? Math.round(Number(b?.quantityRemainingKg) / bagW) : 0;
                    setStSystemBags(String(sysBags));
                  } else {
                    setStSystemBags("");
                  }
                },
                className: "w-full border rounded-md px-3 py-2 text-sm",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— All / unspecified —" }),
                  batches.filter((b) => b.isActive).map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: String(b.id), children: [
                    b.batchNumber,
                    " · ",
                    b.cropName,
                    " ",
                    b.varietyName
                  ] }, b.id))
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-gray-700 block mb-1", children: "System bags" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: stSystemBags, onChange: (e) => setStSystemBags(e.target.value), placeholder: "Auto-filled or enter" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-gray-700 block mb-1", children: "Physical bags *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: stPhysicalBags, onChange: (e) => setStPhysicalBags(e.target.value), placeholder: "Counted qty" })
            ] })
          ] }),
          stVariance != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `text-xs font-semibold flex items-center gap-1 px-3 py-2 rounded ${stVariance === 0 ? "bg-green-50 text-green-700" : stVariance < 0 ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"}`, children: [
            stVariance > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-3.5 h-3.5" }) : stVariance < 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "w-3.5 h-3.5" }) : null,
            "Variance: ",
            stVariance > 0 ? "+" : "",
            stVariance,
            " bags",
            stVariance === 0 && " — count matches system"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-gray-700 block mb-1", children: "Storage location" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: stLocation, onChange: (e) => setStLocation(e.target.value), placeholder: "e.g. Main barn, bay 3" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-gray-700 block mb-1", children: "Stocktake date *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: stDate, onChange: (e) => setStDate(e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-gray-700 block mb-1", children: "Conducted by" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: stConductedBy, onChange: (e) => setStConductedBy(e.target.value), placeholder: "Name", list: "staff-names-st" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "staff-names-st", children: staffNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: n }, n)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-gray-700 block mb-1", children: "Notes / discrepancy explanation" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "textarea",
              {
                value: stNotes,
                onChange: (e) => setStNotes(e.target.value),
                rows: 2,
                placeholder: "Any notes about discrepancies or observations…",
                className: "w-full border rounded-md px-3 py-2 text-sm resize-none"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: stocktakeMut, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShowStocktakeDialog(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              disabled: !stPhysicalBags || !stDate || stocktakeMut.isPending,
              onClick: () => stocktakeMut.mutate({
                seedBatchId: stBatchId ? Number(stBatchId) : null,
                location: stLocation || null,
                systemQtyBags: stSystemBags ? Number(stSystemBags) : null,
                physicalQtyBags: Number(stPhysicalBags),
                conductedBy: stConductedBy || null,
                stocktakeDate: stDate,
                notes: stNotes || null
              }),
              children: stocktakeMut.isPending ? "Saving…" : "Record Stocktake"
            }
          )
        ] })
      ] }) })
    ] })
  ] }) });
}
export {
  SeedStorePage as default
};
