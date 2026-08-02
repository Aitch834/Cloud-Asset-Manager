import { t as useQueryClient, a as useToast, r as reactExports, O as useMutation, j as jsxRuntimeExports, d as LoaderCircle } from "./index-C3jhrBt5.js";
import { F as File } from "./file-Dt9FQB21.js";
import { T as Trash2 } from "./trash-2-DkQtuHEt.js";
import { C as Camera } from "./camera-DYpw8alZ.js";
function PhotoPanel({ incidentId, farmId, photos, resource = "fly-tipping", queryKey }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = reactExports.useState(false);
  const invalidateKey = queryKey ?? ["fly-tipping", farmId];
  const deleteMut = useMutation({
    mutationFn: (photoId) => fetch(`/api/farms/${farmId}/${resource}/${incidentId}/photos/${photoId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: invalidateKey }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setIsUploading(true);
      const urlRes = await fetch("/api/storage/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type || "application/octet-stream" })
      });
      if (!urlRes.ok) throw new Error("Failed to get upload URL");
      const { uploadURL, objectPath } = await urlRes.json();
      const putRes = await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type || "application/octet-stream" } });
      if (!putRes.ok) throw new Error("Upload failed");
      const attachRes = await fetch(`/api/farms/${farmId}/${resource}/${incidentId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objectPath, fileName: file.name })
      });
      if (!attachRes.ok) throw new Error("Failed to attach photo");
      qc.invalidateQueries({ queryKey: invalidateKey });
      toast({ title: "Photo uploaded" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "10px 14px 12px", background: "#f9fafb", borderTop: "1px solid #f3f4f6" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 8 }, children: "Evidence Photos" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: photos.length ? 8 : 0 }, children: photos.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 10px 4px 8px" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(File, { size: 12, style: { color: "#2563eb" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `/api/storage${p.objectPath}`, target: "_blank", rel: "noopener noreferrer", style: { fontSize: "0.8125rem", color: "#2563eb", textDecoration: "none" }, children: p.fileName ?? "Photo" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => deleteMut.mutate(p.id), style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0, marginLeft: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 11 }) })
    ] }, p.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "file",
          accept: "image/*,application/pdf",
          style: { display: "none" },
          disabled: isUploading,
          onChange: handleFileChange
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.75rem", padding: "4px 10px", border: "1px solid #d1d5db", borderRadius: 5, color: "#374151", background: "#fff" }, children: isUploading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 12, style: { animation: "spin 1s linear infinite" } }),
        " Uploading…"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { size: 12 }),
        " Add Photo"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", color: "#9ca3af" }, children: "JPG, PNG or PDF" })
    ] })
  ] });
}
export {
  PhotoPanel as P
};
