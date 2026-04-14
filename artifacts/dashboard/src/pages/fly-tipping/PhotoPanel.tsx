import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { File, Trash2, Camera, Loader2 } from "lucide-react";

interface Photo { id: number; objectPath: string; fileName: string | null; }

export function PhotoPanel({ incidentId, farmId, photos }: { incidentId: number; farmId: number; photos: Photo[] }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const deleteMut = useMutation({
    mutationFn: (photoId: number) => fetch(`/api/farms/${farmId}/fly-tipping/${incidentId}/photos/${photoId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fly-tipping", farmId] }),
  });

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setIsUploading(true);
      const urlRes = await fetch("/api/storage/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type || "application/octet-stream" }),
      });
      if (!urlRes.ok) throw new Error("Failed to get upload URL");
      const { uploadURL, objectPath } = await urlRes.json();
      const putRes = await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type || "application/octet-stream" } });
      if (!putRes.ok) throw new Error("Upload failed");
      await fetch(`/api/farms/${farmId}/fly-tipping/${incidentId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objectPath, fileName: file.name }),
      });
      qc.invalidateQueries({ queryKey: ["fly-tipping", farmId] });
      toast({ title: "Photo uploaded" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div style={{ padding: "10px 14px 12px", background: "#f9fafb", borderTop: "1px solid #f3f4f6" }}>
      <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 8 }}>Evidence Photos</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: photos.length ? 8 : 0 }}>
        {photos.map(p => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 10px 4px 8px" }}>
            <File size={12} style={{ color: "#2563eb" }} />
            <a href={`/api/storage${p.objectPath}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.8125rem", color: "#2563eb", textDecoration: "none" }}>
              {p.fileName ?? "Photo"}
            </a>
            <button onClick={() => deleteMut.mutate(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0, marginLeft: 2 }}>
              <Trash2 size={11} />
            </button>
          </div>
        ))}
      </div>
      <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
        <input
          type="file"
          accept="image/*,application/pdf"
          style={{ display: "none" }}
          disabled={isUploading}
          onChange={handleFileChange}
        />
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.75rem", padding: "4px 10px", border: "1px solid #d1d5db", borderRadius: 5, color: "#374151", background: "#fff" }}>
          {isUploading ? <><Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> Uploading…</> : <><Camera size={12} /> Add Photo</>}
        </span>
        <span style={{ fontSize: "0.7rem", color: "#9ca3af" }}>JPG, PNG or PDF</span>
      </label>
    </div>
  );
}
