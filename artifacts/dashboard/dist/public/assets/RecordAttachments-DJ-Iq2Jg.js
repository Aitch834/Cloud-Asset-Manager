import { c as useQueryClient, a as useToast, r as reactExports, m as useQuery, j as jsxRuntimeExports, l as cn, d as Button, e as LoaderCircle, X } from "./index-C9tF1wX-.js";
import { u as useUpload } from "./use-upload-C7su1Tqr.js";
import { P as Paperclip } from "./paperclip-BRxn2UHn.js";
import { U as Upload } from "./upload-CBscblvK.js";
import { I as Image } from "./image-BhAA0t0J.js";
import { F as FileText } from "./shield-alert-DyBrkuHK.js";
import { D as Download } from "./download-z-oOhkE2.js";
function formatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function isImage(mimeType, fileName) {
  if (mimeType?.startsWith("image/")) return true;
  return /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(fileName);
}
function RecordAttachments({ farmId, recordType, recordId, compact = false, onAttachmentsChange }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { uploadFile } = useUpload();
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
      const response = await uploadFile(file);
      if (!response?.objectPath) throw new Error("Upload failed");
      await fetch(`/api/farms/${farmId}/record-attachments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordType,
          recordId,
          fileUrl: `/api/storage${response.objectPath}`,
          fileKey: response.objectPath,
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
      onAttachmentsChange?.();
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
      onAttachmentsChange?.();
      toast({ title: "Attachment removed" });
    } catch {
      toast({ title: "Failed to remove attachment", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("space-y-2", compact ? "text-xs" : "text-sm"), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cn("font-medium flex items-center gap-1.5 text-muted-foreground", compact ? "text-xs" : "text-sm"), children: [
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
          className: cn("h-7 px-2 gap-1", compact ? "text-xs" : "text-xs"),
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
      const img = isImage(att.mimeType, att.fileName);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "li",
        {
          className: "flex items-center gap-2 rounded border border-border bg-muted/40 px-2 py-1.5 group",
          children: [
            img ? /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "w-4 h-4 shrink-0 text-blue-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-4 h-4 shrink-0 text-orange-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate font-medium leading-tight", children: att.fileName }),
              att.fileSize && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: formatBytes(att.fileSize) })
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
export {
  RecordAttachments as R
};
