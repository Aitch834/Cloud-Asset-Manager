import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUpload } from "@workspace/object-storage-web";
import { useToast } from "@/hooks/use-toast";
import { Paperclip, Upload, Loader2, X, FileText, Image as ImageIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Attachment {
  id: number;
  farmId: number;
  recordType: string;
  recordId: number;
  fileUrl: string;
  fileKey: string;
  fileName: string;
  fileSize: number | null;
  mimeType: string | null;
  notes: string | null;
  uploadedByName: string | null;
  uploadedAt: string;
}

interface RecordAttachmentsProps {
  farmId: number;
  recordType: string;
  recordId: number;
  compact?: boolean;
  onAttachmentsChange?: (change: { photoCountDelta: number }) => void;
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImage(mimeType: string | null, fileName: string): boolean {
  if (mimeType?.startsWith("image/")) return true;
  return /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(fileName);
}

export function RecordAttachments({ farmId, recordType, recordId, compact = false, onAttachmentsChange }: RecordAttachmentsProps) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { uploadFile } = useUpload();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const queryKey = ["record-attachments", farmId, recordType, recordId];

  const { data: attachments = [], isLoading } = useQuery<Attachment[]>({
    queryKey,
    queryFn: () =>
      fetch(`/api/farms/${farmId}/record-attachments?recordType=${encodeURIComponent(recordType)}&recordId=${recordId}`, {
        credentials: "include",
      }).then((r) => r.json()),
    enabled: !!farmId && !!recordId,
  });

  async function handleFile(file: File) {
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
          mimeType: file.type || null,
        }),
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
      qc.invalidateQueries({ queryKey });
      onAttachmentsChange?.({ photoCountDelta: isImage(file.type || null, file.name) ? 1 : 0 });
      toast({ title: "Attachment uploaded" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      const attachment = attachments.find(item => item.id === id);
      await fetch(`/api/farms/${farmId}/record-attachments/${id}`, {
        method: "DELETE",
        credentials: "include",
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
      qc.invalidateQueries({ queryKey });
      onAttachmentsChange?.({
        photoCountDelta: attachment && isImage(attachment.mimeType, attachment.fileName) ? -1 : 0,
      });
      toast({ title: "Attachment removed" });
    } catch {
      toast({ title: "Failed to remove attachment", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className={cn("space-y-2", compact ? "text-xs" : "text-sm")}>
      <div className="flex items-center justify-between">
        <span className={cn("font-medium flex items-center gap-1.5 text-muted-foreground", compact ? "text-xs" : "text-sm")}>
          <Paperclip className={compact ? "w-3 h-3" : "w-4 h-4"} />
          Attachments
          {attachments.length > 0 && (
            <span className="bg-muted text-muted-foreground rounded-full px-1.5 py-0 text-[10px] font-semibold">
              {attachments.length}
            </span>
          )}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-7 px-2 gap-1", compact ? "text-xs" : "text-xs")}
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Upload className="w-3 h-3" />
          )}
          {uploading ? "Uploading…" : "Add file"}
        </Button>
      </div>

      {isLoading && (
        <p className="text-xs text-muted-foreground py-1">Loading attachments…</p>
      )}

      {!isLoading && attachments.length === 0 && (
        <p className="text-xs text-muted-foreground py-1 italic">No attachments yet.</p>
      )}

      {attachments.length > 0 && (
        <ul className="space-y-1.5">
          {attachments.map((att) => {
            const img = isImage(att.mimeType, att.fileName);
            return (
              <li
                key={att.id}
                className="flex items-center gap-2 rounded border border-border bg-muted/40 px-2 py-1.5 group"
              >
                {img ? (
                  <ImageIcon className="w-4 h-4 shrink-0 text-blue-500" />
                ) : (
                  <FileText className="w-4 h-4 shrink-0 text-orange-500" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium leading-tight">{att.fileName}</p>
                  {att.fileSize && (
                    <p className="text-[10px] text-muted-foreground">{formatBytes(att.fileSize)}</p>
                  )}
                </div>
                <a
                  href={att.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                  title="Download / view"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => handleDelete(att.id)}
                  disabled={deletingId === att.id}
                  className="shrink-0 text-muted-foreground hover:text-destructive disabled:opacity-50 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove attachment"
                >
                  {deletingId === att.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <X className="w-3.5 h-3.5" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
