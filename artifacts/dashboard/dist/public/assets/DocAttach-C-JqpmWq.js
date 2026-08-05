import { c as useQueryClient, a as useToast, r as reactExports, j as jsxRuntimeExports, X, e as LoaderCircle } from "./index-BOwJu3F5.js";
import { u as useUpload } from "./use-upload-CoJi57Rr.js";
import { a as apiUrl } from "./api-Dhdsf4oM.js";
import { F as FileText } from "./shield-alert-BtEi-neV.js";
import { U as Upload } from "./upload-2vB7imyr.js";
function DocAttach({ farmId, endpoint, recordId, documentPath, documentName, queryKey, compact }) {
  const qc = useQueryClient();
  const { uploadFile } = useUpload();
  const { toast } = useToast();
  const inputRef = reactExports.useRef(null);
  const [uploading, setUploading] = reactExports.useState(false);
  const keys = Array.isArray(queryKey) ? queryKey : [queryKey, farmId];
  async function handleFile(file) {
    setUploading(true);
    try {
      const response = await uploadFile(file);
      if (!response) throw new Error("Upload failed");
      await fetch(apiUrl(`farms/${farmId}/${endpoint}/${recordId}/document`), {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentPath: response.objectPath, documentName: file.name })
      }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      qc.invalidateQueries({ queryKey: keys });
      toast({ title: "Document attached" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }
  async function remove() {
    await fetch(apiUrl(`farms/${farmId}/${endpoint}/${recordId}/document`), {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentPath: null, documentName: null })
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    });
    qc.invalidateQueries({ queryKey: keys });
  }
  if (documentPath) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "a",
        {
          href: `/api/storage${documentPath}`,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "inline-flex items-center gap-1 text-xs text-blue-600 hover:underline",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-3 h-3" }),
            compact ? null : documentName ?? "View"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: remove,
          title: "Remove document",
          className: "text-muted-foreground hover:text-destructive",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3 h-3" })
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        ref: inputRef,
        type: "file",
        accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp",
        className: "hidden",
        onChange: (e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => inputRef.current?.click(),
        disabled: uploading,
        className: "inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50",
        title: "Attach document",
        children: [
          uploading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3 h-3 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-3 h-3" }),
          compact ? null : uploading ? "Uploading…" : "Attach"
        ]
      }
    )
  ] });
}
export {
  DocAttach as D
};
