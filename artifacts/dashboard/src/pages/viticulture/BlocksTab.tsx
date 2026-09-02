import { useFarmName } from "@/hooks/use-farm-name";
import { useState, useMemo, useEffect, useRef, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { StaffSelect } from "@/components/ui/staff-select";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import {
  Plus, Trash2, Loader2, Eye, Grape, Leaf, ClipboardList, Sprout,
  BarChart3, Bug, Scissors, ShieldAlert, CheckCircle2, XCircle, AlertTriangle,
  FileDown, Pencil, Map, FileText, Receipt, CalendarCheck, ShieldCheck, Wine,
  Droplet, FlaskConical, ChevronRight, Package, TrendingUp, BookOpen, Printer,
  Award, Globe, BadgeAlert, Beaker, Wrench, Gauge,
  Camera, Trash, Upload, ImageOff, ClipboardCheck, Star, GripVertical,
} from "lucide-react";
import {
  ViticulturalAnalyticsTab,
  VintageSeasonReportTab,
  ViticulturalEnterpriseReport,
} from "@/components/ViticulturalReports";
import {
  HarvestReceptionTab,
  PressingRecordsTab,
  FermentationRecordsTab,
  VesselRegisterTab,
  CellarOpsTab,
  BottlingRecordsTab,
  So2TestingTab,
  EquipmentRegisterTab,
  BatchTrailQuickSearch,
  WINERY_VIEW_ADDITIONS_EVENT,
} from "@/pages/WineryManagementTabs";
import { sanitiseCsvCell } from "@/lib/csv";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { useAppStore } from "@/hooks/use-app-store";
import { useUserRole } from "@/hooks/use-user-role";
import { useToast } from "@/hooks/use-toast";
import { VineyardBlockBoundaryMapDialog } from "@/components/viticulture/VineyardBlockBoundaryMapDialog";
import { VineyardBlockMapTab } from "@/components/viticulture/VineyardBlockMapTab";
import { Checkbox } from "@/components/ui/checkbox";
import { useLookupStrings } from "@/hooks/use-lookup";
import { usePersistedTab } from "@/hooks/use-persisted-tab";

import { apiUrl as api } from "@/lib/api";
import { fmt, fmtDate, fmtNum, today, exportCSV, printExciseReturn, printOrganicWineRecords, PRESSURE_LABELS, BBCH_STAGES, UK_GRAPE_VARIETIES, UK_ROOTSTOCKS, OPERATION_TYPES, StatCard, Empty, ConfirmDialog, DataTable, useCrud, ViewField, RaiseTaskBtn } from "./shared";

type Block = Record<string, unknown>;

// ─── Block Photo Gallery ──────────────────────────────────────────────────────

type BlockPhoto = { id: number; objectPath: string; fileName: string | null; caption: string | null; isCover: boolean; sortOrder: number | null; uploadedAt: string };

function SortablePhotoThumbnail({
  photo, photoSrc, onDelete, onSetCover, onCaptionSave, onExpand, saving,
}: {
  photo: BlockPhoto;
  photoSrc: string;
  onDelete: () => void;
  onSetCover: () => void;
  onCaptionSave: (caption: string) => void;
  onExpand: () => void;
  saving: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id, disabled: photo.isCover });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const [captionDraft, setCaptionDraft] = useState(photo.caption ?? "");
  const [captionFocused, setCaptionFocused] = useState(false);

  const commitCaption = () => {
    const trimmed = captionDraft.trim();
    if (trimmed !== (photo.caption ?? "")) onCaptionSave(trimmed);
    setCaptionFocused(false);
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group rounded-lg overflow-hidden border bg-gray-50 flex flex-col">
      {/* Image — click opens lightbox */}
      <div className="relative aspect-square">
        <img
          src={photoSrc}
          alt={photo.fileName ?? "Block photo"}
          className="w-full h-full object-cover cursor-pointer"
          onClick={onExpand}
          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
        />

        {/* Cover badge */}
        {photo.isCover && (
          <span className="absolute top-1 left-1 bg-yellow-400 text-yellow-900 rounded-full px-1.5 py-0.5 text-[10px] font-bold flex items-center gap-0.5 shadow pointer-events-none">
            <Star className="w-2.5 h-2.5 fill-yellow-900" />Cover
          </span>
        )}

        {/* Drag handle — only for non-cover photos */}
        {!photo.isCover && (
          <button
            className="absolute top-1 left-1 bg-black/50 hover:bg-black/70 text-white rounded p-0.5 opacity-30 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-grab active:cursor-grabbing touch-none"
            title="Drag to reorder — or use Space/Enter to pick up, arrow keys to move, Space/Enter to drop"
            aria-label="Reorder photo"
            {...attributes}
            {...listeners}
            onClick={e => e.stopPropagation()}
          >
            <GripVertical className="w-3 h-3" />
          </button>
        )}

        {/* Hover action bar */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Star / set-cover button — left side; drag handle occupies this space for non-cover */}
          {photo.isCover ? (
            <button
              className="bg-yellow-400 text-yellow-900 rounded-full p-0.5 shadow"
              title="Cover photo"
              disabled
            >
              <Star className="w-3 h-3 fill-yellow-900" />
            </button>
          ) : (
            <button
              className="ml-6 rounded-full p-0.5 shadow transition-colors bg-black/60 hover:bg-yellow-400 hover:text-yellow-900 text-white"
              onClick={e => { e.stopPropagation(); onSetCover(); }}
              title="Set as cover photo"
              disabled={saving}
            >
              <Star className="w-3 h-3" />
            </button>
          )}
          {/* Delete button */}
          <button
            className="bg-black/60 hover:bg-red-700 text-white rounded-full p-0.5 transition-colors"
            onClick={e => { e.stopPropagation(); onDelete(); }}
            title="Remove photo"
            disabled={saving}
          >
            <Trash className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Caption row — always visible, edit on focus */}
      <div className="px-1.5 py-1 bg-white border-t">
        <input
          className="w-full text-[11px] text-gray-700 placeholder-gray-400 bg-transparent outline-none focus:ring-0 border-0 truncate"
          placeholder="Add caption…"
          value={captionDraft}
          onChange={e => setCaptionDraft(e.target.value)}
          onFocus={() => setCaptionFocused(true)}
          onBlur={commitCaption}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); commitCaption(); (e.target as HTMLInputElement).blur(); } if (e.key === "Escape") { setCaptionDraft(photo.caption ?? ""); setCaptionFocused(false); (e.target as HTMLInputElement).blur(); } }}
        />
        {captionFocused && (
          <p className="text-[10px] text-muted-foreground mt-0.5">Enter to save · Esc to cancel</p>
        )}
      </div>
    </div>
  );
}

// ─── Filmstrip thumbnail (used inside the lightbox) ───────────────────────────

function SortableFilmstripThumb({
  photo, photoSrc, isActive, onClick,
}: {
  photo: BlockPhoto;
  photoSrc: string;
  isActive: boolean;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: photo.id,
    disabled: photo.isCover,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex-none w-16 h-16 rounded overflow-hidden border-2 transition-colors ${isActive ? "border-purple-500 shadow-md" : "border-transparent hover:border-gray-400"}`}
    >
      <img
        src={photoSrc}
        alt={photo.fileName ?? ""}
        className="w-full h-full object-cover cursor-pointer"
        onClick={onClick}
        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
      {photo.isCover && (
        <span className="absolute bottom-0.5 left-0.5 bg-yellow-400 text-yellow-900 rounded text-[8px] font-bold px-0.5 pointer-events-none">★</span>
      )}
      {!photo.isCover && (
        <button
          className="absolute top-0.5 left-0.5 bg-black/40 hover:bg-black/70 text-white rounded p-0.5 opacity-30 hover:opacity-100 focus:opacity-100 transition-opacity cursor-grab active:cursor-grabbing touch-none"
          title="Drag to reorder"
          {...attributes}
          {...listeners}
          onClick={e => e.stopPropagation()}
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-2.5 h-2.5" />
        </button>
      )}
    </div>
  );
}

function BlockPhotoGallery({ farmId, block, onPhotoChanged }: { farmId: number; block: Block; onPhotoChanged: () => void }) {
  const blockId = block.id as number;
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  // Store the lightbox photo ID rather than the object — stays stable across reorders
  const [lightboxId, setLightboxId] = useState<number | null>(null);
  const [deletePhotoId, setDeletePhotoId] = useState<number | null>(null);
  const filmstripRef = useRef<HTMLDivElement>(null);
  const [orderedPhotos, setOrderedPhotos] = useState<BlockPhoto[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const swipeTouchStartX = useRef<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Load gallery photos
  const { data: photosData, refetch } = useQuery<{ photos: BlockPhoto[] }>({
    queryKey: ["vineyard-block-photos", farmId, blockId],
    queryFn: async () => {
      const r = await fetch(api(`farms/${farmId}/vineyard-blocks/${blockId}/photos`), { credentials: "include" });
      if (!r.ok) throw new Error("Failed to load photos");
      return r.json();
    },
    initialData: () => {
      const photos = block.photos as BlockPhoto[] | undefined;
      return photos ? { photos } : undefined;
    },
  });

  // Sync server-ordered photos into local state whenever the query updates
  useEffect(() => {
    setOrderedPhotos(photosData?.photos ?? []);
  }, [photosData]);

  const invalidate = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ["vineyard-blocks", farmId] });
    onPhotoChanged();
  };

  const patchPhoto = async (photoId: number, body: Record<string, unknown>) => {
    setSavingId(photoId);
    try {
      const r = await fetch(api(`farms/${farmId}/vineyard-blocks/${blockId}/photos/${photoId}`), {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error("Save failed");
      invalidate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSavingId(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Separate cover from sortable photos; cover is always first and not draggable
    const cover = orderedPhotos.find(p => p.isCover) ?? null;
    const sortable = orderedPhotos.filter(p => !p.isCover);

    const oldIndex = sortable.findIndex(p => p.id === active.id);
    const newIndex = sortable.findIndex(p => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(sortable, oldIndex, newIndex);

    // Snapshot previous order for rollback
    const prevPhotos = orderedPhotos.slice();

    // Optimistic update
    setOrderedPhotos(cover ? [cover, ...reordered] : reordered);

    // Persist new sortOrder for each photo that changed position
    try {
      await Promise.all(
        reordered.map((photo, idx) =>
          fetch(api(`farms/${farmId}/vineyard-blocks/${blockId}/photos/${photo.id}`), {
            method: "PATCH", credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sortOrder: idx }),
          }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; })
        )
      );
    } catch {
      // Revert optimistic update and surface the error
      setOrderedPhotos(prevPhotos);
      setError("Could not save photo order — please try again.");
      return;
    }

    // Sync server state (don't block UI on this)
    refetch();
    queryClient.invalidateQueries({ queryKey: ["vineyard-blocks", farmId] });
    onPhotoChanged();
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) { setError("Please select an image file."); return; }
    if (file.size > 10 * 1024 * 1024) { setError("Image must be under 10 MB."); return; }
    setError(null);
    setUploading(true);
    try {
      const urlRes = await fetch(api("storage/uploads/request-url"), {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
      });
      if (!urlRes.ok) throw new Error("Could not get upload URL");
      const { uploadURL, objectPath } = await urlRes.json();
      const putRes = await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      if (!putRes.ok) throw new Error("Upload to storage failed");
      const saveRes = await fetch(api(`farms/${farmId}/vineyard-blocks/${blockId}/photos`), {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objectPath, fileName: file.name }),
      });
      if (!saveRes.ok) throw new Error("Failed to save photo");
      invalidate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Derive the active lightbox photo from orderedPhotos (stays correct after reorders)
  const lightboxPhoto = lightboxId !== null ? (orderedPhotos.find(p => p.id === lightboxId) ?? null) : null;
  const lightboxIndex = lightboxPhoto ? orderedPhotos.findIndex(p => p.id === lightboxPhoto.id) : -1;

  const goPrev = () => {
    if (lightboxIndex > 0) setLightboxId(orderedPhotos[lightboxIndex - 1].id);
  };
  const goNext = () => {
    if (lightboxIndex >= 0 && lightboxIndex < orderedPhotos.length - 1)
      setLightboxId(orderedPhotos[lightboxIndex + 1].id);
  };

  // Arrow-key navigation when lightbox is open
  useEffect(() => {
    if (!lightboxPhoto) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const tag = el.tagName;
      // Exclude text-editing elements
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      // Exclude only the filmstrip drag-handle buttons so dnd-kit keyboard
      // reordering keeps working there; all other buttons (Prev, Next, Close,
      // Delete, Cover) should still respond to arrow-key navigation.
      if (el.getAttribute("aria-label") === "Drag to reorder") return;
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
      if (e.key === "ArrowRight") { e.preventDefault(); goNext(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxPhoto, lightboxIndex, orderedPhotos]);

  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: number) => {
      const r = await fetch(api(`farms/${farmId}/vineyard-blocks/${blockId}/photos/${photoId}`), {
        method: "DELETE", credentials: "include",
      });
      if (!r.ok) throw new Error("Failed to remove photo");
    },
    onSuccess: (_data, photoId) => {
      // If the deleted photo is open in the lightbox, close it
      if (lightboxId === photoId) setLightboxId(null);
      setDeletePhotoId(null);
      invalidate();
    },
    onError: (e) => {
      setError(e instanceof Error ? e.message : "Remove failed");
    },
  });

  const handleDelete = (photo: BlockPhoto) => {
    deletePhotoMutation.mutate(photo.id);
  };

  const photoSrc = (p: BlockPhoto) =>
    `${api(`farms/${farmId}/vineyard-blocks/${blockId}/photos/${p.id}`)}?t=${String(p.id)}`;

  const sortableIds = orderedPhotos.filter(p => !p.isCover).map(p => p.id);

  // Scroll the active filmstrip thumb into view when lightboxId changes
  useEffect(() => {
    if (lightboxId === null || !filmstripRef.current) return;
    const el = filmstripRef.current.querySelector<HTMLElement>(`[data-photo-id="${lightboxId}"]`);
    el?.scrollIntoView({ inline: "nearest", behavior: "smooth", block: "nearest" });
  }, [lightboxId]);

  return (
    <div className="border-t pt-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5" />Photos {orderedPhotos.length > 0 && <span className="font-normal">({orderedPhotos.length})</span>}
        </p>
        <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Upload className="w-3 h-3 mr-1" />}
          Add Photo
        </Button>
      </div>

      {orderedPhotos.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          accessibility={{
            announcements: {
              onDragStart: ({ active }) => `Picked up photo ${active.id}. Use arrow keys to move, Space or Enter to drop.`,
              onDragOver: ({ active, over }) =>
                over ? `Photo ${active.id} is now over position ${over.id}.` : `Photo ${active.id} is no longer over a drop target.`,
              onDragEnd: ({ active, over }) =>
                over ? `Photo ${active.id} was dropped at position ${over.id}.` : `Photo ${active.id} was returned to its original position.`,
              onDragCancel: ({ active }) => `Reordering of photo ${active.id} was cancelled.`,
            },
          }}
        >
          <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-3 gap-2">
              {orderedPhotos.map((photo) => (
                <SortablePhotoThumbnail
                  key={photo.id}
                  photo={photo}
                  photoSrc={photoSrc(photo)}
                  saving={savingId === photo.id}
                  onDelete={() => handleDelete(photo)}
                  onSetCover={() => patchPhoto(photo.id, { isCover: true })}
                  onCaptionSave={(caption) => patchPhoto(photo.id, { caption: caption || null })}
                  onExpand={() => setLightboxId(photo.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div
          className="border-2 border-dashed border-border rounded-lg p-5 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/30 transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-7 h-7 text-purple-400 animate-spin" />
              <p className="text-xs text-muted-foreground">Uploading…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <Camera className="w-7 h-7 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">Add block photos</p>
              <p className="text-xs text-muted-foreground/70">JPEG, PNG, WebP · max 10 MB each</p>
            </div>
          )}
        </div>
      )}

      {orderedPhotos.length > 1 && (
        <p className="text-[10px] text-muted-foreground/60 mt-1">Drag or use Space/arrow keys to reorder · cover photo is always shown first</p>
      )}

      {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />

      {/* Lightbox */}
      <Dialog open={!!lightboxPhoto} onOpenChange={o => { if (!o) setLightboxId(null); }}>
        <DialogContent className="max-w-3xl p-2">
          <DialogHeader className="px-1 pb-1">
            <DialogTitle className="text-sm font-medium flex flex-col items-start gap-0.5 min-w-0">
              <span className="flex items-center gap-2 min-w-0 max-w-full">
                <span className="truncate">{lightboxPhoto?.fileName ?? "Block photo"}</span>
                {orderedPhotos.length > 1 && lightboxPhoto && (
                  <span className="flex-none text-xs font-normal text-muted-foreground whitespace-nowrap">
                    {orderedPhotos.findIndex(p => p.id === lightboxPhoto.id) + 1} of {orderedPhotos.length}
                  </span>
                )}
              </span>
              {lightboxPhoto?.caption && (
                <span className="text-xs font-normal text-muted-foreground break-words">
                  {lightboxPhoto.caption}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          {lightboxPhoto && (
            <div className="flex flex-col gap-2">
              {/* Main image */}
              <div
                className="relative group/lightbox"
                onTouchStart={e => { swipeTouchStartX.current = e.touches[0].clientX; }}
                onTouchEnd={e => {
                  if (swipeTouchStartX.current === null) return;
                  const dx = e.changedTouches[0].clientX - swipeTouchStartX.current;
                  swipeTouchStartX.current = null;
                  if (Math.abs(dx) < 40) return; // ignore tiny taps
                  if (dx < 0) goNext(); else goPrev();
                }}
              >
                <img
                  src={photoSrc(lightboxPhoto)}
                  alt={lightboxPhoto.fileName ?? "Block photo"}
                  className="w-full max-h-[60vh] object-contain rounded-lg"
                />
                {/* Prev arrow */}
                {lightboxIndex > 0 && (
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/75 text-white p-1.5 transition-colors opacity-0 group-hover/lightbox:opacity-100 focus:opacity-100"
                    aria-label="Previous photo"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                )}
                {/* Next arrow */}
                {lightboxIndex >= 0 && lightboxIndex < orderedPhotos.length - 1 && (
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/75 text-white p-1.5 transition-colors opacity-0 group-hover/lightbox:opacity-100 focus:opacity-100"
                    aria-label="Next photo"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                )}
                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => setDeletePhotoId(lightboxPhoto.id)}
                  className="absolute top-2 left-2 rounded-full bg-black/50 hover:bg-red-600/90 text-white p-1.5 transition-colors opacity-0 group-hover/lightbox:opacity-100 focus:opacity-100"
                  aria-label="Delete photo"
                  title="Delete this photo"
                >
                  <Trash className="w-4 h-4" />
                </button>
                {/* Set as cover */}
                {!lightboxPhoto.isCover && (
                  <button
                    type="button"
                    onClick={async () => {
                      setOrderedPhotos(prev => prev.map(p => ({ ...p, isCover: p.id === lightboxPhoto.id })));
                      await patchPhoto(lightboxPhoto.id, { isCover: true });
                    }}
                    disabled={savingId === lightboxPhoto.id}
                    className="absolute top-2 left-12 rounded-full bg-black/50 hover:bg-yellow-500/90 text-white p-1.5 transition-colors opacity-0 group-hover/lightbox:opacity-100 focus:opacity-100 disabled:opacity-40"
                    aria-label="Set as cover photo"
                    title="Set as cover photo"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filmstrip — drag to reorder, click to navigate */}
              {orderedPhotos.length > 1 && (
                <div className="flex flex-col gap-1">
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={sortableIds} strategy={horizontalListSortingStrategy}>
                      <div
                        ref={filmstripRef}
                        className="flex gap-1.5 overflow-x-auto pb-1 px-0.5"
                        style={{ scrollbarWidth: "thin" }}
                      >
                        {orderedPhotos.map(photo => (
                          <div key={photo.id} data-photo-id={photo.id}>
                            <SortableFilmstripThumb
                              photo={photo}
                              photoSrc={photoSrc(photo)}
                              isActive={photo.id === lightboxPhoto.id}
                              onClick={() => setLightboxId(photo.id)}
                            />
                          </div>
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                  <p className="text-[10px] text-muted-foreground/60 text-center">
                    Drag thumbnails to reorder · click to view
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete photo confirm */}
      <ConfirmDialog
        open={deletePhotoId !== null}
        title="Delete photo?"
        message="This photo will be permanently removed from the block. This cannot be undone."
        confirmLabel="Delete photo"
        confirmVariant="destructive"
        onConfirm={() => { if (deletePhotoId !== null) deletePhotoMutation.mutate(deletePhotoId); }}
        onCancel={() => { setDeletePhotoId(null); deletePhotoMutation.reset(); }}
        mutation={deletePhotoMutation}
      />
    </div>
  );
}

function plantingStatusBadge(status: unknown) {
  if (status === "active") return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-0">Active</Badge>;
  if (status === "suspended") return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-0">Suspended</Badge>;
  if (status === "removed") return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-0">Removed</Badge>;
  return <Badge variant="secondary">No Planting</Badge>;
}

function PlantingFormFields({ form, sf }: { form: Block; sf: (k: string, v: unknown) => void }) {
  const varieties = useLookupStrings("vineyard_grape_varieties", UK_GRAPE_VARIETIES);
  const rootstocks = useLookupStrings("vineyard_rootstocks", UK_ROOTSTOCKS);
  const trainingSystems = useLookupStrings("vineyard_training_systems", ["Double Guyot", "Single Guyot", "Cordon", "Scott Henry", "Lenz Moser", "VSP", "Other"]);
  const [varietyOther, setVarietyOther] = useState(() => { const v = String(form.variety ?? ""); return !!v && !UK_GRAPE_VARIETIES.includes(v); });
  const [rootstockOther, setRootstockOther] = useState(() => { const v = String(form.rootstock ?? ""); return !!v && !UK_ROOTSTOCKS.includes(v); });
  const [trainingOther, setTrainingOther] = useState(() => { const v = String(form.trainingSystem ?? ""); return !!v && !["Double Guyot", "Single Guyot", "Cordon", "Scott Henry", "Lenz Moser", "VSP", "Other"].includes(v); });
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Variety *</Label>
          <Select
            value={varietyOther ? "Other" : String(form.variety ?? "")}
            onValueChange={v => { if (v === "Other") { setVarietyOther(true); sf("variety", ""); } else { setVarietyOther(false); sf("variety", v); } }}
          >
            <SelectTrigger><SelectValue placeholder="Select variety…" /></SelectTrigger>
            <SelectContent>{varieties.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
          </Select>
          {varietyOther && <Input className="mt-1.5" placeholder="Enter variety name…" value={String(form.variety ?? "")} onChange={e => sf("variety", e.target.value)} />}
        </div>
        <div><Label>Clone</Label><Input value={String(form.clone ?? "")} onChange={e => sf("clone", e.target.value)} placeholder="e.g. Chardonnay 96" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Rootstock</Label>
          <Select
            value={rootstockOther ? "Other" : String(form.rootstock ?? "")}
            onValueChange={v => { if (v === "Other") { setRootstockOther(true); sf("rootstock", ""); } else { setRootstockOther(false); sf("rootstock", v); } }}
          >
            <SelectTrigger><SelectValue placeholder="Select rootstock…" /></SelectTrigger>
            <SelectContent>{rootstocks.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
          </Select>
          {rootstockOther && <Input className="mt-1.5" placeholder="Enter rootstock name…" value={String(form.rootstock ?? "")} onChange={e => sf("rootstock", e.target.value)} />}
        </div>
        <div><Label>Planting Year</Label><Input type="number" min="1900" max={new Date().getFullYear()} value={String(form.plantingYear ?? "")} onChange={e => sf("plantingYear", e.target.value)} placeholder="e.g. 2018" /></div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div><Label>Area (ha)</Label><Input type="number" step="0.0001" value={String(form.areaHa ?? "")} onChange={e => sf("areaHa", e.target.value)} /></div>
        <div><Label>Number of Vines</Label><Input type="number" value={String(form.numberOfVines ?? "")} onChange={e => sf("numberOfVines", e.target.value)} /></div>
        <div><Label>Planted Date</Label><Input type="date" max={today} value={String(form.plantedDate ?? "")} onChange={e => sf("plantedDate", e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Row Spacing (m)</Label><Input type="number" step="0.01" value={String(form.rowSpacingM ?? "")} onChange={e => sf("rowSpacingM", e.target.value)} /></div>
        <div><Label>Vine Spacing (m)</Label><Input type="number" step="0.01" value={String(form.vineSpacingM ?? "")} onChange={e => sf("vineSpacingM", e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Training System</Label>
          <Select
            value={trainingOther ? "Other" : String(form.trainingSystem ?? "")}
            onValueChange={v => { if (v === "Other") { setTrainingOther(true); sf("trainingSystem", ""); } else { setTrainingOther(false); sf("trainingSystem", v); } }}
          >
            <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
            <SelectContent>
              {trainingSystems.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
          {trainingOther && <Input className="mt-1.5" placeholder="Enter training system…" value={String(form.trainingSystem ?? "")} onChange={e => sf("trainingSystem", e.target.value)} />}
        </div>
        <div><Label>Trellis Type</Label><Input value={String(form.trellisType ?? "")} onChange={e => sf("trellisType", e.target.value)} placeholder="e.g. High wire, 2-wire" /></div>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox checked={!!form.isOrganicBlock} onCheckedChange={v => sf("isOrganicBlock", !!v)} id="org-planting" />
        <Label htmlFor="org-planting">Organic planting</Label>
      </div>
    </>
  );
}

export function BlocksTab({ farmId, onNavigate, highlightBlockId }: { farmId: number; onNavigate?: (tab: string, blockId?: number) => void; highlightBlockId?: number }) {
  const { data, isLoading, add, edit, remove } = useCrud<Block>(farmId, "vineyard-blocks", "vineyard-blocks");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["vineyard-blocks", farmId] });

  // Main add/edit dialog
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Block | null>(null);
  const [form, setForm] = useState<Block>({});

  // View dialog
  const [viewing, setViewing] = useState<Block | null>(null);
  const [raiseTaskFor, setRaiseTaskFor] = useState<Block | null>(null);
  const [boundaryBlock, setBoundaryBlock] = useState<Block | null>(null);

  // Retire dialog
  const [retireOpen, setRetireOpen] = useState(false);
  const [retirePlanting, setRetirePlanting] = useState<Block | null>(null);
  const [retireForm, setRetireForm] = useState<Record<string, string>>({});

  // Replant dialog
  const [replantOpen, setReplantOpen] = useState(false);
  const [replantBlock, setReplantBlock] = useState<Block | null>(null);
  const [replantForm, setReplantForm] = useState<Block>({});

  // Reactivate mutation
  const reactivateMutation = useMutation({
    mutationFn: async ({ plantingId }: { plantingId: number }) => {
      const r = await fetch(api(`farms/${farmId}/vineyard-block-plantings/${plantingId}/status`), {
        method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ status: "active" }),
      });
      if (!r.ok) throw new Error("Reactivation failed");
      return r.json();
    },
    onSuccess: invalidate,
    onError: () => toast({ title: "Reactivation failed", variant: "destructive" }),
  });

  // Retire mutation
  const retireMutation = useMutation({
    mutationFn: async ({ plantingId, body }: { plantingId: number; body: Record<string, string> }) => {
      const status = body.deactivationType === "temporary_suspension" ? "suspended" : "removed";
      const r = await fetch(api(`farms/${farmId}/vineyard-block-plantings/${plantingId}/status`), {
        method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ status, ...body }),
      });
      if (!r.ok) throw new Error("Save failed");
      return r.json();
    },
    onSuccess: () => { invalidate(); setRetireOpen(false); setRetirePlanting(null); setRetireForm({}); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  // Replant mutation
  const replantMutation = useMutation({
    mutationFn: async ({ blockId, currentPlantingId, body }: { blockId: number; currentPlantingId: number | null; body: Block }) => {
      const r = await fetch(api(`farms/${farmId}/vineyard-blocks/${blockId}/replant`), {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ currentPlantingId, deactivationType: "replanting", ...body }),
      });
      if (!r.ok) throw new Error("Replant failed");
      return r.json();
    },
    onSuccess: () => { invalidate(); setReplantOpen(false); setReplantBlock(null); setReplantForm({}); },
    onError: () => toast({ title: "Replant failed", variant: "destructive" }),
  });

  // Auto-open edit dialog when a block is highlighted from another tab
  const highlightBlockIdRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (!highlightBlockId || highlightBlockId === highlightBlockIdRef.current) return;
    if (isLoading) return;
    highlightBlockIdRef.current = highlightBlockId;
    const block = data.find(b => b.id === highlightBlockId);
    if (block) openEdit(block);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightBlockId, isLoading, data]);

  const openAdd = () => { setForm({}); setCurrent(null); setOpen(true); };
  const openEdit = (r: Block) => { setForm({ ...r }); setCurrent(r); setOpen(true); };
  const sf = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));
  const sfr = (k: string, v: unknown) => setReplantForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    if (current) await edit.mutateAsync({ ...form, id: current.id as number, plantingId: form.plantingId });
    else await add.mutateAsync(form);
    setOpen(false);
  };

  const openRetire = (block: Block) => {
    setRetirePlanting(block);
    setRetireForm({ deactivationType: "grubbed_up", deactivationReason: "", deactivationNotes: "", deactivatedBy: "" });
    setRetireOpen(true);
    setViewing(null);
  };

  const openReplant = (block: Block) => {
    setReplantBlock(block);
    setReplantForm({ variety: "", plantingYear: String(new Date().getFullYear()) });
    setReplantOpen(true);
    setViewing(null);
  };

  // Filter controls
  const [showAll, setShowAll] = useState(false);
  const displayedBlocks = showAll ? data : data.filter(b => b.isActive !== false || (b.plantingStatus as string) === "suspended");

  const csvCols = [
    { key: "blockName", label: "Block Name" },
    { key: "blockRef", label: "Block Ref" },
    { key: "fieldParcelRef", label: "BPS/SFI Parcel Ref" },
    { key: "aspect", label: "Aspect" },
    { key: "soilType", label: "Soil Type" },
    { key: "variety", label: "Variety" },
    { key: "clone", label: "Clone" },
    { key: "rootstock", label: "Rootstock" },
    { key: "plantingYear", label: "Planting Year" },
    { key: "areaHa", label: "Area (ha)" },
    { key: "numberOfVines", label: "Number of Vines" },
    { key: "rowSpacingM", label: "Row Spacing (m)" },
    { key: "vineSpacingM", label: "Vine Spacing (m)" },
    { key: "trainingSystem", label: "Training System" },
    { key: "isOrganicBlock", label: "Organic", fmt: (r: Record<string, unknown>) => r.isOrganicBlock ? "Yes" : "No" },
    { key: "plantingStatus", label: "Status" },
    { key: "notes", label: "Notes" },
  ];

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin w-6 h-6 text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">Vineyard Blocks</p>
          <p className="text-xs text-muted-foreground">Each block is a permanent geographic site. Individual plantings (variety, rootstock, spacing) are tracked with a full lifecycle — active, suspended, or removed.</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-1.5">
            <Checkbox checked={showAll} onCheckedChange={v => setShowAll(!!v)} id="show-all" />
            <Label htmlFor="show-all" className="text-xs text-muted-foreground cursor-pointer">Show removed</Label>
          </div>
          <Button size="sm" variant="outline" onClick={() => exportCSV(data, "vineyard-blocks.csv", csvCols)} disabled={!data.length}><FileDown className="w-4 h-4 mr-1" />Export CSV</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Block</Button>
        </div>
      </div>

      <div className="bg-slate-50 border rounded-lg p-4 text-xs text-slate-600 space-y-1.5">
        <p className="font-semibold text-slate-700 text-sm flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-slate-500" />Block &amp; Planting Lifecycle</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-1">
          <div><strong>Active</strong> — block is currently in production. Record spray applications, scouting and harvest under this status.</div>
          <div><strong>Suspended</strong> — temporarily out of production (e.g. post-grubbing awaiting replant). No yield obligation but block remains on register.</div>
          <div><strong>Removed / Grubbed up</strong> — planting permanently ended. Notify the FSA Vine Register within 30 days. The block site persists in the system for history.</div>
          <div><strong>Replanting</strong> — use the Replant action on an active or suspended block to close the current planting and open a new one with a fresh variety, rootstock and spacing record.</div>
          <div><strong>FSA notification deadlines</strong> — new planting: within 30 days of planting; removal: within 30 days of grubbing; variety change: before the new planting is established.</div>
          <div><strong>Organic blocks</strong> — flag blocks under conversion or certified organic. These will appear in the Organic Viticulture module for copper/sulphur input tracking and certifier compliance.</div>
        </div>
      </div>

      <DataTable
        cols={[
          {
            key: "coverPhotoUrl",
            label: "",
            render: r => {
              const url = r.coverPhotoUrl as string | null;
              return url ? (
                <img
                  src={url}
                  alt={`${String(r.blockName ?? "")} cover`}
                  className="w-10 h-10 rounded object-cover border border-border flex-shrink-0"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <div className="w-10 h-10 rounded border border-dashed border-border bg-muted flex items-center justify-center flex-shrink-0">
                  <ImageOff className="w-4 h-4 text-muted-foreground/40" />
                </div>
              );
            },
          },
          { key: "blockName", label: "Block" },
          { key: "blockRef", label: "Ref" },
          { key: "variety", label: "Variety" },
          { key: "rootstock", label: "Rootstock" },
          { key: "plantingYear", label: "Planted" },
          { key: "areaHa", label: "Area (ha)", render: r => fmtNum(r.areaHa, 4) },
          { key: "numberOfVines", label: "Vines" },
          { key: "trainingSystem", label: "Training" },
          { key: "isOrganicBlock", label: "Organic", render: r => r.isOrganicBlock ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-0">Organic</Badge> : <span className="text-muted-foreground text-xs">—</span> },
          { key: "plantingStatus", label: "Status", render: r => plantingStatusBadge(r.plantingStatus) },
        ]}
        rows={displayedBlocks}
        onView={setViewing}
        onEdit={openEdit}
        onDelete={r => remove.mutateAsync(r.id as number)} deleteMutation={remove}
      />

      {/* ── View Dialog ─────────────────────────────────────────────────────── */}
      <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Vineyard Block — {fmt(viewing?.blockName)}
              {viewing && plantingStatusBadge(viewing.plantingStatus)}
            </DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-4">
              {/* Block site identity */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Block Site</p>
                <div className="grid grid-cols-3 gap-3">
                  <ViewField label="Block Name" value={fmt(viewing.blockName)} />
                  <ViewField label="Block Ref" value={fmt(viewing.blockRef)} />
                  <ViewField label="BPS/SFI Parcel" value={fmt(viewing.fieldParcelRef)} />
                  <ViewField label="Aspect" value={fmt(viewing.aspect)} />
                  <ViewField label="Soil Type" value={fmt(viewing.soilType)} />
                  {!!viewing.notes && <div className="col-span-3"><ViewField label="Notes" value={fmt(viewing.notes)} /></div>}
                </div>
              </div>

              {/* Current planting */}
              {viewing.plantingStatus !== "no_planting" && (
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Current Planting</p>
                    {viewing.plantingStatus === "suspended" && (
                      <Button size="sm" variant="outline" className="h-6 text-xs text-green-700 border-green-200" onClick={() => reactivateMutation.mutate({ plantingId: viewing.plantingId as number })}>
                        {reactivateMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}Reactivate
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <ViewField label="Variety" value={fmt(viewing.variety)} />
                    <ViewField label="Clone" value={fmt(viewing.clone)} />
                    <ViewField label="Rootstock" value={fmt(viewing.rootstock)} />
                    <ViewField label="Planting Year" value={fmt(viewing.plantingYear)} />
                    <ViewField label="Area (ha)" value={fmtNum(viewing.areaHa, 4)} />
                    <ViewField label="Number of Vines" value={fmt(viewing.numberOfVines)} />
                    <ViewField label="Row Spacing (m)" value={fmtNum(viewing.rowSpacingM, 2)} />
                    <ViewField label="Vine Spacing (m)" value={fmtNum(viewing.vineSpacingM, 2)} />
                    <ViewField label="Training System" value={fmt(viewing.trainingSystem)} />
                    <ViewField label="Trellis Type" value={fmt(viewing.trellisType)} />
                    <ViewField label="Organic" value={!!viewing.isOrganicBlock ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-0">Organic</Badge> : "No"} />
                    <ViewField label="Status" value={plantingStatusBadge(viewing.plantingStatus)} />
                  </div>
                  {/* Deactivation record */}
                  {(viewing.plantingStatus === "suspended" || viewing.plantingStatus === "removed") && (() => {
                    const plantings = viewing.plantings as Block[];
                    const cur = plantings?.find((p: Block) => p.id === viewing.plantingId);
                    if (!cur) return null;
                    return (
                      <div className="mt-3 bg-amber-50 border border-amber-200 rounded p-3 space-y-1 text-xs">
                        <p className="font-semibold text-amber-800 uppercase tracking-wide">Deactivation Record</p>
                        {!!cur.deactivatedAt && <p className="text-amber-700">Date: {fmtDate(cur.deactivatedAt)}</p>}
                        {!!cur.deactivationType && <p className="text-amber-700">Type: {String(cur.deactivationType).replace(/_/g, " ")}</p>}
                        {!!cur.deactivationReason && <p className="text-amber-700">Reason: {fmt(cur.deactivationReason)}</p>}
                        {!!cur.deactivatedBy && <p className="text-amber-700">By: {fmt(cur.deactivatedBy)}</p>}
                        {!!cur.deactivationNotes && <p className="text-amber-700">Notes: {fmt(cur.deactivationNotes)}</p>}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Planting history */}
              {(() => {
                const plantings = (viewing.plantings as Block[]) ?? [];
                const past = plantings.filter((p: Block) => p.id !== viewing.plantingId);
                if (!past.length) return null;
                return (
                  <div className="border-t pt-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Planting History</p>
                    <div className="space-y-2">
                      {past.map((p: Block, i: number) => (
                        <div key={i} className="flex items-start justify-between text-xs bg-gray-50 rounded px-3 py-2 border">
                          <div>
                            <span className="font-medium">{fmt(p.variety)}</span>
                            {p.rootstock ? ` / ${fmt(p.rootstock)}` : ""}
                            {p.plantingYear ? ` · Planted ${fmt(p.plantingYear)}` : ""}
                          </div>
                          <div className="flex flex-col items-end gap-0.5">
                            {plantingStatusBadge(p.status)}
                            {!!p.deactivatedAt && <span className="text-muted-foreground">{String(p.deactivationType ?? "").replace(/_/g, " ")} {fmtDate(p.deactivatedAt)}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Block photo gallery */}
              <BlockPhotoGallery
                farmId={farmId}
                block={viewing}
                onPhotoChanged={() => {
                  queryClient.invalidateQueries({ queryKey: ["vineyard-blocks", farmId] });
                }}
              />

              {/* Quick navigation */}
              {onNavigate && (
                <div className="border-t pt-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Quick Navigation</p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" className="h-7 text-xs text-violet-700 border-violet-200 hover:bg-violet-50" onClick={() => { onNavigate("vine-register", viewing.id as number); setViewing(null); }}>
                      <ClipboardList className="w-3.5 h-3.5 mr-1" />Vine Register
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50" onClick={() => { onNavigate("phenology", viewing.id as number); setViewing(null); }}>
                      <Leaf className="w-3.5 h-3.5 mr-1" />Phenology
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs text-rose-700 border-rose-200 hover:bg-rose-50" onClick={() => { onNavigate("scouting", viewing.id as number); setViewing(null); }}>
                      <Bug className="w-3.5 h-3.5 mr-1" />Disease Scouting
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs text-amber-700 border-amber-200 hover:bg-amber-50" onClick={() => { onNavigate("operations", viewing.id as number); setViewing(null); }}>
                      <Scissors className="w-3.5 h-3.5 mr-1" />Operations
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs text-purple-700 border-purple-200 hover:bg-purple-50" onClick={() => { onNavigate("harvest", viewing.id as number); setViewing(null); }}>
                      <Grape className="w-3.5 h-3.5 mr-1" />Harvest
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex-wrap gap-2">
            <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
            <Button variant="outline" onClick={() => { setBoundaryBlock(viewing); setViewing(null); }}>
              <Map className="w-4 h-4 mr-1" />Draw Boundary
            </Button>
            {viewing && viewing.plantingStatus === "active" && (
              <Button variant="outline" className="text-amber-700 border-amber-200 hover:bg-amber-50" onClick={() => openRetire(viewing!)}>
                Retire / Take Out of Production
              </Button>
            )}
            {viewing && (viewing.plantingStatus === "removed" || viewing.plantingStatus === "no_planting") && (
              <Button variant="outline" className="text-green-700 border-green-200 hover:bg-green-50" onClick={() => openReplant(viewing!)}>
                <Plus className="w-4 h-4 mr-1" />Replant
              </Button>
            )}
            <RaiseTaskBtn onClick={() => { setRaiseTaskFor(viewing); setViewing(null); }} />
            <Button onClick={() => { openEdit(viewing!); setViewing(null); }}>Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {raiseTaskFor && (
        <RaiseTaskDialog
          farmId={farmId}
          open={!!raiseTaskFor}
          onClose={() => setRaiseTaskFor(null)}
          defaultTitle={`Vineyard Block — ${fmt(raiseTaskFor.blockName)}`}
          defaultDescription={`Variety: ${fmt(raiseTaskFor.variety)} · Rootstock: ${fmt(raiseTaskFor.rootstock)} · Area: ${fmtNum(raiseTaskFor.areaHa, 4)} ha · Vines: ${fmt(raiseTaskFor.numberOfVines)}`}
          module="Viticulture"
        />
      )}

      {/* ── Retire Dialog ───────────────────────────────────────────────────── */}
      <Dialog open={retireOpen} onOpenChange={o => { if (!o) { setRetireOpen(false); setRetirePlanting(null); retireMutation.reset(); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Retire / Take Out of Production</DialogTitle>
          </DialogHeader>
          {retirePlanting && (
            <div className="space-y-3">
              <div className="bg-muted/50 rounded p-3 text-sm">
                <span className="font-medium">{fmt(retirePlanting.blockName)}</span>
                {!!retirePlanting.variety && <> — {fmt(retirePlanting.variety)}</>}
                {!!retirePlanting.plantingYear && <> (planted {fmt(retirePlanting.plantingYear)})</>}
              </div>
              <div>
                <Label>Reason for Retirement *</Label>
                <Select value={retireForm.deactivationType} onValueChange={v => setRetireForm(p => ({ ...p, deactivationType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select reason…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="temporary_suspension">Temporary Suspension (will reactivate)</SelectItem>
                    <SelectItem value="grubbed_up">Permanently Grubbed Up</SelectItem>
                    <SelectItem value="replanting">Grubbed Up for Replanting</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {retireForm.deactivationType === "temporary_suspension" && (
                  <p className="text-xs text-amber-700 mt-1">Status will be set to Suspended. You can reactivate this planting later.</p>
                )}
                {retireForm.deactivationType === "grubbed_up" && (
                  <p className="text-xs text-red-700 mt-1">Status will be set to Removed. FSA vine register may need updating.</p>
                )}
                {retireForm.deactivationType === "replanting" && (
                  <p className="text-xs text-blue-700 mt-1">Status will be set to Removed. Use the Replant button to add a new planting on this site afterwards.</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Retired By</Label><Input value={retireForm.deactivatedBy} onChange={e => setRetireForm(p => ({ ...p, deactivatedBy: e.target.value }))} placeholder="Name or role" /></div>
                <div><Label>Reason Summary</Label><Input value={retireForm.deactivationReason} onChange={e => setRetireForm(p => ({ ...p, deactivationReason: e.target.value }))} placeholder="Brief reason" /></div>
              </div>
              <div><Label>Additional Notes</Label><Textarea value={retireForm.deactivationNotes} onChange={e => setRetireForm(p => ({ ...p, deactivationNotes: e.target.value }))} rows={2} placeholder="Any supporting detail for the audit trail…" /></div>
            </div>
          )}
          <DialogMutationError mutation={retireMutation} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRetireOpen(false); setRetirePlanting(null); }}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={!retireForm.deactivationType || retireMutation.isPending}
              onClick={() => retireMutation.mutate({ plantingId: retirePlanting!.plantingId as number, body: retireForm })}
            >
              {retireMutation.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}Confirm Retirement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Replant Dialog ──────────────────────────────────────────────────── */}
      <Dialog open={replantOpen} onOpenChange={o => { if (!o) { setReplantOpen(false); setReplantBlock(null); replantMutation.reset(); } }}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Planting — {fmt(replantBlock?.blockName)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Enter the details for the new planting on this block site. A new planting record will be created and linked to the block's history.</p>
            <PlantingFormFields form={replantForm} sf={sfr} />
            <div><Label>Notes (optional)</Label><Textarea value={String(replantForm.notes ?? "")} onChange={e => sfr("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogMutationError mutation={replantMutation} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setReplantOpen(false); setReplantBlock(null); }}>Cancel</Button>
            <Button
              disabled={!replantForm.variety || replantMutation.isPending}
              onClick={() => replantMutation.mutate({ blockId: replantBlock!.id as number, currentPlantingId: replantBlock!.plantingId as number | null, body: replantForm })}
            >
              {replantMutation.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}Create New Planting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add / Edit Dialog ───────────────────────────────────────────────── */}
      <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); add.reset(); edit.reset(); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{current ? "Edit" : "Add"} Vineyard Block</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Block Site</p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Block Name *</Label><Input value={String(form.blockName ?? "")} onChange={e => sf("blockName", e.target.value)} placeholder="e.g. South Slope" /></div>
              <div><Label>Block Reference</Label><Input value={String(form.blockRef ?? "")} onChange={e => sf("blockRef", e.target.value)} placeholder="e.g. BLK-01" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Aspect</Label>
                <Select value={String(form.aspect ?? "")} onValueChange={v => sf("aspect", v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {["N", "NE", "E", "SE", "S", "SW", "W", "NW", "Flat"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Soil Type</Label><Input value={String(form.soilType ?? "")} onChange={e => sf("soilType", e.target.value)} placeholder="e.g. Greensand over clay" /></div>
              <div><Label>BPS/SFI Parcel Ref</Label><Input value={String(form.fieldParcelRef ?? "")} onChange={e => sf("fieldParcelRef", e.target.value)} /></div>
            </div>
            <div><Label>Block Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => sf("notes", e.target.value)} rows={1} /></div>

            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide border-t pt-3">{current ? "Current Planting" : "Initial Planting"}</p>
            <PlantingFormFields form={form} sf={sf} />
          </div>
          <DialogMutationError mutation={add} message="Failed to save — your entries are still here." />
          <DialogMutationError mutation={edit} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={add.isPending || edit.isPending}>{(add.isPending || edit.isPending) && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {boundaryBlock && (
        <VineyardBlockBoundaryMapDialog
          blockId={boundaryBlock.id as number}
          blockName={fmt(boundaryBlock.blockName)}
          open={!!boundaryBlock}
          onClose={() => setBoundaryBlock(null)}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["vineyard-blocks", farmId] });
            setBoundaryBlock(null);
          }}
        />
      )}
    </div>
  );
}

// ─── Phenology ─────────────────────────────────────────────────────────────────
