import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUpload } from "@workspace/object-storage-web";
import { FileText, Upload, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const api = (path: string) => `/api/${path}`;

interface DocAttachProps {
  farmId: number;
  endpoint: string;
  recordId: number;
  documentPath: string | null | undefined;
  documentName: string | null | undefined;
  queryKey: string | (string | number)[];
  compact?: boolean;
}

export function DocAttach({ farmId, endpoint, recordId, documentPath, documentName, queryKey, compact }: DocAttachProps) {
  const qc = useQueryClient();
  const { uploadFile } = useUpload();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const keys = Array.isArray(queryKey) ? queryKey : [queryKey, farmId];

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const response = await uploadFile(file);
      if (!response) throw new Error("Upload failed");
      await fetch(api(`farms/${farmId}/${endpoint}/${recordId}/document`), {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentPath: response.objectPath, documentName: file.name }),
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
    await fetch(api(`farms/${farmId}/${endpoint}/${recordId}/document`), {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentPath: null, documentName: null }),
    });
    qc.invalidateQueries({ queryKey: keys });
  }

  if (documentPath) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <a
          href={`/api/storage${documentPath}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
        >
          <FileText className="w-3 h-3" />
          {compact ? null : (documentName ?? "View")}
        </a>
        <button
          onClick={remove}
          title="Remove document"
          className="text-muted-foreground hover:text-destructive"
        >
          <X className="w-3 h-3" />
        </button>
      </span>
    );
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
        title="Attach document"
      >
        {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
        {compact ? null : (uploading ? "Uploading…" : "Attach")}
      </button>
    </>
  );
}
