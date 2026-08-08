import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/hooks/use-app-store";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Redirect } from "wouter";
import {
  Plus, Pencil, Archive, Tractor, Wrench, Truck, Droplets, Package, User,
  RotateCcw, X, ChevronDown, Download, CheckSquare, Square, Sparkles,
  ChevronLeft, ChevronRight, CalendarDays, AlertCircle, GripVertical, Trash2,
  Clock, ClipboardList, CheckCircle2, CircleDashed, BadgeCheck, Undo2,
  Search, BarChart2, FileDown, History, CalendarRange, Flag, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo, useRef } from "react";
import { useLocation } from "wouter";
import { toast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import {
  DndContext, DragOverlay, useDraggable, useDroppable,
  useSensors, useSensor, PointerSensor,
  type DragEndEvent, type DragStartEvent,
} from "@dnd-kit/core";

// ─── Types ────────────────────────────────────────────────────────────────────

type FarmResource = {
  id: number;
  name: string;
  type: string;
  description: string | null;
  colour: string;
  isActive: boolean;
};

type ImportableItem = {
  sourceType: "equipment" | "staff";
  sourceId: number;
  name: string;
  resourceType: string;
  description: string | null;
};

type ImportableData = {
  equipment: ImportableItem[];
  staff: ImportableItem[];
};

type PlannerTask = {
  id: number;
  taskRef: string;
  title: string;
  due_date: string;
  end_date: string | null;
  estimated_hours: string | null;
  start_time: string | null;
  end_time: string | null;
  req_tractors: number;
  req_implements: number;
  req_vehicles: number;
  req_sprayers: number;
  req_trailers: number;
  req_staff: number;
  req_other: number;
  req_other_notes: string[];
  req_materials: MaterialReq[];
  status?: string;
  staff_name?: string;
  module?: string;
  colour: string;
  source: "assignment" | "planner_event";
};

type PlannerAllocation = {
  id: number;
  task_ref: string;
  task_assignment_id: number | null;
  resource_id: number;
  allocated_date: string;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
  task_title: string | null;
  resource_name: string;
  resource_type: string;
  resource_colour: string;
};

type ActiveDrag = {
  resourceId?: number;
  resourceName: string;
  resourceType: string;
  resourceColour: string;
  allocationId?: number;
  isReturn?: boolean;
};

type MaterialReq  = { name: string; quantity: number; unit: string };
type MaterialEdit = { name: string; quantity: string; unit: string };
type WeekMaterial = { total: number; unit: string; tasks: string[] };

// ─── Constants ────────────────────────────────────────────────────────────────

const RESOURCE_TYPES = [
  { value: "tractor",   label: "Tractor",            icon: Tractor },
  { value: "implement", label: "Implement",           icon: Wrench },
  { value: "vehicle",   label: "Vehicle",             icon: Truck },
  { value: "sprayer",   label: "Sprayer",             icon: Droplets },
  { value: "trailer",   label: "Trailer",             icon: Package },
  { value: "staff",     label: "Staff / Contractor",  icon: User },
  { value: "other",     label: "Other",               icon: Package },
] as const;

const COLOUR_OPTIONS = [
  { value: "slate",   label: "Slate",   bg: "bg-slate-500" },
  { value: "indigo",  label: "Indigo",  bg: "bg-indigo-500" },
  { value: "blue",    label: "Blue",    bg: "bg-blue-500" },
  { value: "green",   label: "Green",   bg: "bg-green-500" },
  { value: "emerald", label: "Emerald", bg: "bg-emerald-500" },
  { value: "amber",   label: "Amber",   bg: "bg-amber-500" },
  { value: "orange",  label: "Orange",  bg: "bg-orange-500" },
  { value: "red",     label: "Red",     bg: "bg-red-500" },
  { value: "purple",  label: "Purple",  bg: "bg-purple-500" },
] as const;

const DEFAULT_COLOUR: Record<string, string> = {
  tractor: "green", implement: "amber", vehicle: "blue",
  sprayer: "indigo", trailer: "orange", staff: "purple", other: "slate",
};

const REQ_TYPE_MAP: Array<{ key: keyof PlannerTask; type: string }> = [
  { key: "req_tractors",  type: "tractor" },
  { key: "req_implements", type: "implement" },
  { key: "req_vehicles",  type: "vehicle" },
  { key: "req_sprayers",  type: "sprayer" },
  { key: "req_trailers",  type: "trailer" },
  { key: "req_staff",     type: "staff" },
  { key: "req_other",     type: "other" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTypeInfo(type: string) {
  return RESOURCE_TYPES.find(t => t.value === type) ?? { label: type, icon: Package };
}

function getColourBg(colour: string) {
  return COLOUR_OPTIONS.find(c => c.value === colour)?.bg ?? "bg-slate-500";
}

function isoDate(d: Date) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number) {
  const r = new Date(d); r.setDate(r.getDate() + n); return r;
}

function weekStart(d: Date) {
  const r = new Date(d);
  const dow = r.getDay();
  r.setDate(r.getDate() - (dow === 0 ? 6 : dow - 1));
  r.setHours(0, 0, 0, 0);
  return r;
}

// ─── ImportPanel ──────────────────────────────────────────────────────────────

function ImportPanel({ farmId, onImported }: { farmId: number; onImported: () => void }) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dismissed, setDismissed] = useState(false);

  const { data, isLoading } = useQuery<ImportableData>({
    queryKey: ["resources-importable", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/resources/importable`).then(r => r.json()),
  });

  const importMut = useMutation({
    mutationFn: (items: Array<{ name: string; type: string; description?: string }>) =>
      fetch(`/api/farms/${farmId}/resources/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: (result) => {
      const count = result.resources?.length ?? 0;
      queryClient.invalidateQueries({ queryKey: ["resources", farmId] });
      queryClient.invalidateQueries({ queryKey: ["resources-importable", farmId] });
      setSelected(new Set());
      onImported();
      toast({ title: `${count} resource${count !== 1 ? "s" : ""} imported` });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  if (dismissed || isLoading) return null;

  const allItems: ImportableItem[] = [...(data?.equipment ?? []), ...(data?.staff ?? [])];
  if (allItems.length === 0) return null;

  const equipItems = data?.equipment ?? [];
  const staffItems = data?.staff ?? [];
  const key = (item: ImportableItem) => `${item.sourceType}:${item.sourceId}`;

  function toggleItem(item: ImportableItem) {
    setSelected(prev => {
      const next = new Set(prev);
      const k = key(item);
      if (next.has(k)) next.delete(k); else next.add(k);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === allItems.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allItems.map(key)));
    }
  }

  function handleImport() {
    const toImport = allItems
      .filter(i => selected.has(key(i)))
      .map(i => ({ name: i.name, type: i.resourceType, description: i.description ?? undefined }));
    if (toImport.length === 0) return;
    importMut.mutate(toImport);
  }

  const allSelected = selected.size === allItems.length && allItems.length > 0;

  return (
    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50/60 to-white overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Import from your farm records</h3>
              <p className="text-xs text-foreground/50 mt-0.5">
                {allItems.length} item{allItems.length !== 1 ? "s" : ""} found — tick to add as resources.
              </p>
            </div>
          </div>
          <button onClick={() => setDismissed(true)} className="w-6 h-6 flex items-center justify-center rounded-full text-foreground/30 hover:text-foreground hover:bg-muted transition-colors flex-shrink-0 mt-0.5">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <button onClick={toggleAll} className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 mb-3 transition-colors">
          {allSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
          {allSelected ? "Deselect all" : "Select all"}
        </button>
        <div className="space-y-4">
          {equipItems.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 mb-2">Equipment & Machinery</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {equipItems.map(item => {
                  const k = key(item);
                  const isChecked = selected.has(k);
                  const { icon: Icon } = getTypeInfo(item.resourceType);
                  const colourBg = getColourBg(DEFAULT_COLOUR[item.resourceType] ?? "slate");
                  return (
                    <button key={k} onClick={() => toggleItem(item)} className={cn("flex items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all", isChecked ? "border-indigo-300 bg-indigo-50 shadow-sm" : "border-border bg-white hover:border-indigo-200 hover:bg-indigo-50/30")}>
                      <div className={cn("w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0", colourBg + "/10")}>
                        <Icon className={cn("w-3.5 h-3.5", colourBg.replace("bg-", "text-"))} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
                        {item.description && <p className="text-[10px] text-foreground/40 truncate">{item.description}</p>}
                      </div>
                      <div className={cn("w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors", isChecked ? "border-indigo-500 bg-indigo-500" : "border-border")}>
                        {isChecked && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {staffItems.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 mb-2">Staff Members</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {staffItems.map(item => {
                  const k = key(item);
                  const isChecked = selected.has(k);
                  return (
                    <button key={k} onClick={() => toggleItem(item)} className={cn("flex items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all", isChecked ? "border-indigo-300 bg-indigo-50 shadow-sm" : "border-border bg-white hover:border-indigo-200 hover:bg-indigo-50/30")}>
                      <div className="w-7 h-7 rounded-md bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <User className="w-3.5 h-3.5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
                        {item.description && <p className="text-[10px] text-foreground/40 truncate">{item.description}</p>}
                      </div>
                      <div className={cn("w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors", isChecked ? "border-indigo-500 bg-indigo-500" : "border-border")}>
                        {isChecked && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-indigo-100">
          <p className="text-xs text-foreground/40">{selected.size > 0 ? `${selected.size} selected` : "Select items to import"}</p>
          <button onClick={handleImport} disabled={selected.size === 0 || importMut.isPending} className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <Download className="w-3.5 h-3.5" />
            {importMut.isPending ? "Importing…" : `Import ${selected.size > 0 ? selected.size : ""} selected`}
          </button>
        </div>
      </div>
    </Card>
  );
}

// ─── ResourceCard ─────────────────────────────────────────────────────────────

function ResourceCard({ resource, onEdit, onArchive, onRestore }: { resource: FarmResource; onEdit: (r: FarmResource) => void; onArchive: (id: number) => void; onRestore: (id: number) => void; }) {
  const { icon: Icon, label } = getTypeInfo(resource.type);
  const colourBg = getColourBg(resource.colour);
  return (
    <div className={cn("group relative flex items-start gap-3 rounded-xl border bg-white p-3.5 transition-all hover:shadow-md", resource.isActive ? "border-border hover:border-border/80" : "border-dashed border-border/50 opacity-60")}>
      <div className={cn("w-1.5 self-stretch rounded-full flex-shrink-0", colourBg)} />
      <div className={cn("flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center", colourBg + "/10")}>
        <Icon className={cn("w-4.5 h-4.5", colourBg.replace("bg-", "text-"))} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm text-foreground truncate">{resource.name}</p>
          {!resource.isActive && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-muted text-foreground/40 flex-shrink-0">Archived</span>}
        </div>
        <p className="text-[11px] text-foreground/50 font-medium mt-0.5">{label}</p>
        {resource.description && <p className="text-xs text-foreground/50 mt-1 leading-relaxed line-clamp-2">{resource.description}</p>}
      </div>
      <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {resource.isActive ? (
          <>
            <button onClick={() => onEdit(resource)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-foreground/40 hover:text-foreground transition-colors" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
            <button onClick={() => onArchive(resource.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-foreground/40 hover:text-red-500 transition-colors" title="Archive"><Archive className="w-3.5 h-3.5" /></button>
          </>
        ) : (
          <button onClick={() => onRestore(resource.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-foreground/40 hover:text-green-600 transition-colors" title="Restore"><RotateCcw className="w-3.5 h-3.5" /></button>
        )}
      </div>
    </div>
  );
}

// ─── ResourceForm ─────────────────────────────────────────────────────────────

function ResourceForm({ initial, onSave, onCancel, isPending }: { initial?: Partial<FarmResource>; onSave: (data: { name: string; type: string; description: string; colour: string }) => void; onCancel: () => void; isPending: boolean; }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState(initial?.type ?? "tractor");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [colour, setColour] = useState(initial?.colour ?? "slate");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required"); return; }
    setError("");
    onSave({ name: name.trim(), type, description: description.trim(), colour });
  };

  return (
    <Card className="p-5 border-indigo-200 bg-indigo-50/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm text-foreground">{initial?.id ? "Edit Resource" : "Add Custom Resource"}</h3>
        <button onClick={onCancel} className="w-6 h-6 flex items-center justify-center rounded-full text-foreground/30 hover:text-foreground hover:bg-muted transition-colors"><X className="w-3.5 h-3.5" /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-foreground/70 mb-1.5">Name *</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John Deere 6R 155" className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground/70 mb-1.5">Type *</label>
          <div className="relative">
            <select value={type} onChange={e => setType(e.target.value)} className="w-full appearance-none rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 pr-8">
              {RESOURCE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground/70 mb-1.5">Colour</label>
          <div className="flex flex-wrap gap-2">
            {COLOUR_OPTIONS.map(c => (
              <button key={c.value} type="button" onClick={() => setColour(c.value)} className={cn("w-7 h-7 rounded-full transition-all", c.bg, colour === c.value ? "ring-2 ring-offset-2 ring-foreground scale-110" : "opacity-60 hover:opacity-100")} title={c.label} />
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground/70 mb-1.5">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional notes (e.g. reg number, serial, spec details)" rows={2} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex gap-2 pt-1">
          <button type="submit" disabled={isPending} className="flex-1 bg-primary text-primary-foreground text-sm font-semibold py-2 px-4 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {isPending ? "Saving…" : initial?.id ? "Save changes" : "Add resource"}
          </button>
          <button type="button" onClick={onCancel} className="text-sm font-semibold py-2 px-4 rounded-lg border border-border hover:bg-muted transition-colors">Cancel</button>
        </div>
      </form>
    </Card>
  );
}

// ─── DnD: Draggable Resource Chip ─────────────────────────────────────────────

function DraggableResourceChip({ resource, isCommitted }: { resource: FarmResource; isCommitted: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `res:${resource.id}`,
    data: { resourceId: resource.id, resourceName: resource.name, resourceType: resource.type, resourceColour: resource.colour },
    disabled: isCommitted,
  });
  const { icon: Icon } = getTypeInfo(resource.type);
  const colourBg = getColourBg(resource.colour);
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left transition-all select-none",
        isCommitted
          ? "border-border/40 bg-muted/40 opacity-50 cursor-not-allowed"
          : "border-border bg-white shadow-sm hover:shadow hover:border-indigo-200 cursor-grab",
        isDragging && "opacity-30"
      )}
    >
      <GripVertical className="w-3 h-3 text-foreground/30 flex-shrink-0" />
      <div className={cn("w-5 h-5 rounded flex items-center justify-center flex-shrink-0", colourBg + "/15")}>
        <Icon className={cn("w-3 h-3", colourBg.replace("bg-", "text-"))} />
      </div>
      <span className="text-xs font-medium text-foreground truncate max-w-[120px]">{resource.name}</span>
      {isCommitted && <span className="text-[9px] text-foreground/40 flex-shrink-0">busy</span>}
    </div>
  );
}

// ─── DnD: Droppable Requirement Slot ──────────────────────────────────────────

function RequirementSlot({
  id, type, filled, filledWith, onRemove,
}: {
  id: string;
  type: string;
  filled: boolean;
  filledWith?: PlannerAllocation;
  onRemove?: () => void;
}) {
  const { setNodeRef: dropRef, isOver } = useDroppable({ id, disabled: filled });
  const { attributes, listeners, setNodeRef: dragRef, isDragging } = useDraggable({
    id: `alloc:${filledWith?.id ?? "none"}`,
    data: { allocationId: filledWith?.id, resourceName: filledWith?.resource_name ?? "", resourceType: filledWith?.resource_type ?? type, resourceColour: filledWith?.resource_colour ?? "", isReturn: true } satisfies ActiveDrag,
    disabled: !filled || !filledWith,
  });
  const { icon: Icon } = getTypeInfo(type);
  const colourBg = filled && filledWith ? getColourBg(filledWith.resource_colour) : "bg-slate-400";

  if (filled && filledWith) {
    return (
      <div
        ref={dragRef}
        {...listeners}
        {...attributes}
        className={cn(
          "flex items-center gap-1.5 rounded-md border border-green-200 bg-green-50 px-2 py-1 text-xs font-medium text-green-800 group/slot cursor-grab active:cursor-grabbing",
          isDragging && "opacity-30"
        )}
      >
        <GripVertical className="w-3 h-3 text-green-600/30 flex-shrink-0" />
        <div className={cn("w-3.5 h-3.5 rounded-sm flex items-center justify-center flex-shrink-0", colourBg + "/20")}>
          <Icon className={cn("w-2.5 h-2.5", colourBg.replace("bg-", "text-"))} />
        </div>
        <span className="truncate max-w-[80px]">{filledWith.resource_name}</span>
        {onRemove && (
          <button onClick={onRemove} className="opacity-0 group-hover/slot:opacity-100 ml-auto transition-opacity text-green-600 hover:text-red-500 flex-shrink-0">
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      ref={dropRef}
      className={cn(
        "flex items-center gap-1.5 rounded-md border border-dashed px-2 py-1 text-xs transition-all",
        isOver
          ? "border-indigo-400 bg-indigo-50 text-indigo-700"
          : "border-border/60 bg-muted/30 text-foreground/40"
      )}
    >
      <Icon className="w-3 h-3 flex-shrink-0" />
      <span className="text-[10px]">Drop {getTypeInfo(type).label.toLowerCase()}</span>
    </div>
  );
}

// ─── DnD: Droppable Pool Zone ─────────────────────────────────────────────────

function DroppablePoolZone({ children, isReturning }: { children: React.ReactNode; isReturning: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: "pool" });
  return (
    <div ref={setNodeRef} className={cn(
      "rounded-xl transition-all",
      isReturning && isOver && "ring-2 ring-amber-400 ring-offset-1",
      isReturning && !isOver && "ring-2 ring-amber-200 ring-offset-1",
    )}>
      {children}
    </div>
  );
}

// ─── Planner Task Card ────────────────────────────────────────────────────────

const REQ_FIELDS = [
  { label: "Tractors",   k: "tractors"   as const },
  { label: "Implements", k: "implements" as const },
  { label: "Vehicles",   k: "vehicles"   as const },
  { label: "Sprayers",   k: "sprayers"   as const },
  { label: "Trailers",   k: "trailers"   as const },
  { label: "Staff",      k: "staff"      as const },
];

function PlannerTaskCard({
  task, allocations, onRemoveAllocation, farmId, onReqsUpdated,
}: {
  task: PlannerTask;
  allocations: PlannerAllocation[];
  onRemoveAllocation: (id: number) => void;
  farmId: number;
  onReqsUpdated: () => void;
}) {
  const [showEdit, setShowEdit] = useState(false);
  const [reqs, setReqs] = useState({
    tractors: task.req_tractors,
    implements: task.req_implements,
    vehicles: task.req_vehicles,
    sprayers: task.req_sprayers,
    trailers: task.req_trailers,
    staff: task.req_staff,
  });
  const [others, setOthers] = useState<string[]>(() => {
    if (task.req_other_notes.length > 0) return [...task.req_other_notes];
    if (task.req_other > 0) return Array(task.req_other).fill("");
    return [];
  });
  const [materials, setMaterials] = useState<MaterialEdit[]>(() =>
    task.req_materials.map(m => ({ name: m.name, quantity: String(m.quantity || ""), unit: m.unit }))
  );

  const updateMut = useMutation({
    mutationFn: () => {
      const endpoint = task.source === "assignment"
        ? `/api/farms/${farmId}/task-assignments/${task.id}`
        : `/api/farms/${farmId}/planner-events/${task.id}`;
      return fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reqTractors:   reqs.tractors,
          reqImplements: reqs.implements,
          reqVehicles:   reqs.vehicles,
          reqSprayers:   reqs.sprayers,
          reqTrailers:   reqs.trailers,
          reqStaff:      reqs.staff,
          reqOther:      others.length,
          reqOtherNotes: others,
          reqMaterials: materials.filter(m => m.name.trim()).map(m => ({ name: m.name.trim(), quantity: parseFloat(m.quantity) || 0, unit: m.unit.trim() })),
        }),
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json());
    },
    onSuccess: () => { toast({ title: "Requirements updated" }); setShowEdit(false); onReqsUpdated(); },
    onError: () => toast({ title: "Failed to update requirements", variant: "destructive" }),
  });

  const dateLabel = task.due_date
    ? new Date(task.due_date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
    : "No date";

  const totalReqs = REQ_TYPE_MAP.reduce((sum, { key }) => sum + (Number(task[key]) || 0), 0);
  const hasResourceReqs = totalReqs > 0;
  const hasMaterials = task.req_materials.length > 0;
  const hasRequirements = hasResourceReqs || hasMaterials;

  function openEdit() {
    setReqs({
      tractors: task.req_tractors, implements: task.req_implements,
      vehicles: task.req_vehicles, sprayers: task.req_sprayers,
      trailers: task.req_trailers, staff: task.req_staff,
    });
    setOthers(task.req_other_notes.length > 0
      ? [...task.req_other_notes]
      : task.req_other > 0 ? Array(task.req_other).fill("") : []);
    setMaterials(task.req_materials.map(m => ({ name: m.name, quantity: String(m.quantity || ""), unit: m.unit })));
    setShowEdit(e => !e);
  }

  return (
    <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
      <div className="flex items-start gap-3 p-3.5">
        <div className={cn("w-1 self-stretch rounded-full flex-shrink-0", getColourBg(task.colour))} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-sm text-foreground leading-snug">{task.title}</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-[10px] text-foreground/50 font-medium">{dateLabel}</span>
                {task.staff_name && <span className="text-[10px] text-foreground/40">→ {task.staff_name}</span>}
                {task.estimated_hours && (
                  <span className="flex items-center gap-0.5 text-[10px] text-foreground/40">
                    <Clock className="w-2.5 h-2.5" />{task.estimated_hours}h
                  </span>
                )}
                {task.start_time && task.end_time && (
                  <span className="text-[10px] text-foreground/40">{task.start_time}–{task.end_time}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={openEdit}
                title={hasRequirements ? "Edit requirements" : "Set requirements"}
                className={cn(
                  "flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md border transition-colors",
                  showEdit
                    ? "bg-indigo-100 border-indigo-300 text-indigo-700"
                    : hasRequirements
                      ? "border-border text-foreground/40 hover:text-foreground/70 hover:bg-muted"
                      : "border-indigo-200 text-indigo-500 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700"
                )}
              >
                <Pencil className="w-2.5 h-2.5" />
                {!hasRequirements && <span>Set requirements</span>}
              </button>
              <span className={cn(
                "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                task.source === "assignment"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-indigo-50 text-indigo-700 border border-indigo-200"
              )}>
                {task.module ?? "Task"}
              </span>
            </div>
          </div>

          {hasResourceReqs && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {REQ_TYPE_MAP.flatMap(({ key, type }) => {
                const count = Number(task[key]) || 0;
                if (count === 0) return [];
                const typeAllocs = allocations.filter(a => a.resource_type === type);
                return Array.from({ length: count }, (_, i) => {
                  const alloc = typeAllocs[i];
                  return (
                    <RequirementSlot
                      key={`${task.taskRef}:${type}:${i}`}
                      id={`slot:${task.taskRef}:${type}:${i}:${task.due_date}`}
                      type={type}
                      filled={!!alloc}
                      filledWith={alloc}
                      onRemove={alloc ? () => onRemoveAllocation(alloc.id) : undefined}
                    />
                  );
                });
              })}
            </div>
          )}
          {hasMaterials && (
            <div className="mt-2 flex flex-wrap gap-1">
              {task.req_materials.filter(m => m.name).map((m, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5 font-medium">
                  <Package className="w-2.5 h-2.5" />
                  {m.quantity ? `${m.quantity}${m.unit ? '\u00a0' + m.unit : ''}\u00a0` : ''}{m.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Inline requirements editor */}
      {showEdit && (
        <div className="border-t border-border/50 bg-muted/20 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 mb-2.5">How many of each resource does this task need?</p>
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {REQ_FIELDS.map(({ label, k }) => (
              <div key={k} className="flex items-center justify-between gap-2 bg-white rounded-lg border border-border/70 px-2.5 py-1.5">
                <span className="text-[11px] font-medium text-foreground/60">{label}</span>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => setReqs(r => ({ ...r, [k]: Math.max(0, r[k] - 1) }))}
                    className="w-5 h-5 rounded border border-border hover:bg-muted transition-colors text-sm font-bold text-foreground/50 flex items-center justify-center">−</button>
                  <span className="text-xs font-semibold w-4 text-center tabular-nums">{reqs[k]}</span>
                  <button type="button" onClick={() => setReqs(r => ({ ...r, [k]: r[k] + 1 }))}
                    className="w-5 h-5 rounded border border-border hover:bg-muted transition-colors text-sm font-bold text-foreground/50 flex items-center justify-center">+</button>
                </div>
              </div>
            ))}
          </div>
          {/* Other resources — described list */}
          <div className="border-t border-border/40 pt-2.5 mb-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/40">Other resources</p>
              <button type="button" onClick={() => setOthers(o => [...o, ""])}
                className="flex items-center gap-0.5 text-[10px] font-semibold text-indigo-500 hover:text-indigo-700 transition-colors">
                <Plus className="w-3 h-3" />Add
              </button>
            </div>
            {others.length === 0 ? (
              <p className="text-[10px] text-foreground/30 italic">None — click Add to note any other resource needed (e.g. water bowser, generator).</p>
            ) : (
              <div className="space-y-1.5">
                {others.map((desc, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={desc}
                      onChange={e => setOthers(o => o.map((d, j) => j === i ? e.target.value : d))}
                      placeholder="e.g. Water bowser, generator, fuel bowser…"
                      className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-indigo-300 bg-white"
                    />
                    <button type="button" onClick={() => setOthers(o => o.filter((_, j) => j !== i))}
                      className="w-6 h-6 flex items-center justify-center text-foreground/30 hover:text-red-500 transition-colors flex-shrink-0">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Materials needed */}
          <div className="border-t border-border/40 pt-2.5 mb-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/40">Materials needed</p>
              <button type="button" onClick={() => setMaterials(m => [...m, { name: "", quantity: "", unit: "" }])}
                className="flex items-center gap-0.5 text-[10px] font-semibold text-blue-500 hover:text-blue-700 transition-colors">
                <Plus className="w-3 h-3" />Add
              </button>
            </div>
            {materials.length === 0 ? (
              <p className="text-[10px] text-foreground/30 italic">None — click Add to record materials needed (e.g. herbicide, fertiliser, fuel).</p>
            ) : (
              <div className="space-y-1.5">
                {materials.map((mat, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <input type="text" value={mat.name}
                      onChange={e => setMaterials(m => m.map((v, j) => j === i ? { ...v, name: e.target.value } : v))}
                      placeholder="Product / material name"
                      className="flex-1 min-w-0 text-xs px-2.5 py-1.5 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white" />
                    <input type="number" value={mat.quantity} min="0" step="any"
                      onChange={e => setMaterials(m => m.map((v, j) => j === i ? { ...v, quantity: e.target.value } : v))}
                      placeholder="Qty"
                      className="w-14 text-xs px-2 py-1.5 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white text-center" />
                    <input type="text" value={mat.unit}
                      onChange={e => setMaterials(m => m.map((v, j) => j === i ? { ...v, unit: e.target.value } : v))}
                      placeholder="Unit" list="mat-units"
                      className="w-14 text-xs px-2 py-1.5 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white" />
                    <button type="button" onClick={() => setMaterials(m => m.filter((_, j) => j !== i))}
                      className="w-6 h-6 flex items-center justify-center text-foreground/30 hover:text-red-500 transition-colors flex-shrink-0">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <datalist id="mat-units">
                  <option value="L" /><option value="ml" /><option value="kg" /><option value="g" />
                  <option value="t" /><option value="bags" /><option value="bales" /><option value="cans" />
                  <option value="drums" /><option value="pallets" /><option value="rolls" /><option value="m" />
                </datalist>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button onClick={() => updateMut.mutate()} disabled={updateMut.isPending}
              className="flex-1 text-xs font-semibold py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {updateMut.isPending ? "Saving…" : "Save requirements"}
            </button>
            <button onClick={() => setShowEdit(false)}
              className="text-xs font-semibold py-1.5 px-3 rounded-lg border border-border hover:bg-muted transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Pinch Point Panel ────────────────────────────────────────────────────────

type PinchPoint = { date: string; type: string; demand: number; supply: number; shortage: number };

function PinchPointPanel({ pinchPoints, hasTasksWithReqs }: { pinchPoints: PinchPoint[]; hasTasksWithReqs: boolean }) {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(true);

  if (dismissed) return null;

  if (pinchPoints.length === 0) {
    if (!hasTasksWithReqs) return null;
    return (
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-green-200 bg-green-50/70">
        <CheckSquare className="w-4 h-4 text-green-500 flex-shrink-0" />
        <p className="text-xs text-green-700 font-medium flex-1">
          No pinch points this week — your available resources cover all task requirements.
        </p>
        <button onClick={() => setDismissed(true)} className="text-green-400 hover:text-green-600 transition-colors flex-shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  const byDate = new Map<string, PinchPoint[]>();
  for (const pp of pinchPoints) {
    if (!byDate.has(pp.date)) byDate.set(pp.date, []);
    byDate.get(pp.date)!.push(pp);
  }

  const fmtDate = (iso: string) =>
    new Date(iso + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });

  return (
    <Card className="border-amber-200 bg-amber-50/40 overflow-hidden">
      <div className={cn("flex items-start gap-3 p-4", expanded && "pb-2")}>
        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-amber-800">
            {pinchPoints.length} resource pinch point{pinchPoints.length !== 1 ? "s" : ""} this week
          </p>
          <p className="text-[11px] text-amber-700/80 mt-0.5 leading-relaxed">
            A pinch point is where tasks on the same day need more of a resource than you have available — tasks may not run as planned.
          </p>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            onClick={() => setExpanded(e => !e)}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-amber-100 transition-colors text-amber-500"
            title={expanded ? "Collapse" : "Expand"}
          >
            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", !expanded && "-rotate-90")} />
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-amber-100 transition-colors text-amber-400"
            title="Dismiss for this session"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {Array.from(byDate).map(([date, pps]) => (
            <div key={date}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1.5">{fmtDate(date)}</p>
              <div className="space-y-1.5">
                {pps.map((pp, i) => {
                  const rt = RESOURCE_TYPES.find(r => r.value === pp.type);
                  const Icon = rt?.icon ?? Package;
                  const label = rt?.label ?? pp.type;
                  return (
                    <div key={i} className="flex items-start gap-2.5 bg-white/70 rounded-lg border border-amber-200 px-3 py-2.5">
                      <Icon className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-foreground leading-snug">
                          {pp.demand} {label.toLowerCase()}{pp.demand !== 1 ? "s" : ""} needed · {pp.supply === 0 ? "none registered" : `only ${pp.supply} available`}
                          <span className="text-red-600 ml-1.5 font-bold">{pp.shortage} short</span>
                        </p>
                        <p className="text-[10px] text-foreground/55 mt-1 leading-relaxed">
                          {pp.supply === 0
                            ? `You haven't added any ${label.toLowerCase()}s yet. Go to the Resources tab to register them.`
                            : pp.shortage === 1
                              ? `You're one ${label.toLowerCase()} short on this day. Try spreading tasks across more days, or add another ${label.toLowerCase()} in Resources.`
                              : `You're ${pp.shortage} ${label.toLowerCase()}s short. Consider moving some tasks to quieter days, or register additional resources.`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <p className="text-[10px] text-amber-600/70 leading-relaxed border-t border-amber-200/60 pt-2.5">
            <strong>Tip:</strong> Add or update resources in the <strong>Resources</strong> tab, or adjust task dates in <strong>Field Tasks</strong> or <strong>Week Ahead</strong> to spread demand more evenly.
          </p>
        </div>
      )}
    </Card>
  );
}

// ─── Materials Week Summary ────────────────────────────────────────────────────

function MaterialWeeklySummary({ weekMaterials }: { weekMaterials: Map<string, WeekMaterial> }) {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(true);

  if (dismissed || weekMaterials.size === 0) return null;

  const entries = Array.from(weekMaterials.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  const totalTasks = new Set(entries.flatMap(([, { tasks }]) => tasks)).size;

  return (
    <Card className="border-blue-200 bg-blue-50/40 overflow-hidden">
      <div className={cn("flex items-start gap-3 p-4", expanded && "pb-2")}>
        <Package className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-blue-800">Materials needed this week</p>
          <p className="text-[11px] text-blue-700/80 mt-0.5">
            {entries.length} material{entries.length !== 1 ? "s" : ""} across {totalTasks} task{totalTasks !== 1 ? "s" : ""} — use this as your preparation checklist.
          </p>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button onClick={() => setExpanded(e => !e)}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-blue-100 transition-colors text-blue-500"
            title={expanded ? "Collapse" : "Expand"}>
            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", !expanded && "-rotate-90")} />
          </button>
          <button onClick={() => setDismissed(true)}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-blue-100 transition-colors text-blue-400"
            title="Dismiss">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-1.5 mb-2.5">
            {entries.map(([name, { total, unit, tasks }]) => (
              <div key={name} className="bg-white/70 rounded-lg border border-blue-200 px-3 py-2">
                <p className="text-[11px] font-semibold text-foreground capitalize leading-tight">{name}</p>
                <p className="text-sm font-bold text-blue-700 mt-0.5">
                  {Number.isInteger(total) ? total : parseFloat(total.toFixed(3))}{unit ? `\u00a0${unit}` : ""}
                </p>
                <p className="text-[10px] text-foreground/40 mt-0.5">
                  {tasks.length} task{tasks.length !== 1 ? "s" : ""}
                  {tasks.length <= 2 ? ` (${tasks.slice(0, 2).join(", ")})` : ""}
                </p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-blue-600/70 leading-relaxed border-t border-blue-200/60 pt-2.5">
            <strong>Tip:</strong> Quantities are totalled from what's entered on each task card. Check your chemical store, fuel, and other stocks before the week begins.
          </p>
        </div>
      )}
    </Card>
  );
}

// ─── Planner Tab ──────────────────────────────────────────────────────────────

function exportPlannerCSV(weekLabel: string, tasks: PlannerTask[], allocations: PlannerAllocation[]) {
  const rows: string[][] = [["Date", "Task", "Tractors Req", "Implements Req", "Vehicles Req", "Sprayers Req", "Trailers Req", "Staff Req", "Allocated Resources", "Materials"]];
  for (const t of tasks) {
    const taskAllocs = allocations.filter(a => a.task_ref === t.taskRef).map(a => a.resource_name ?? a.resource_id).join("; ");
    const mats = t.req_materials.filter(m => m.name).map(m => `${m.quantity} ${m.unit} ${m.name}`).join("; ");
    rows.push([t.due_date, t.title, String(t.req_tractors || 0), String(t.req_implements || 0), String(t.req_vehicles || 0), String(t.req_sprayers || 0), String(t.req_trailers || 0), String(t.req_staff || 0), taskAllocs, mats]);
  }
  const csv = "\uFEFF" + rows.map(r => r.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a"); a.href = url; a.download = `week-plan-${weekLabel.replace(/[^a-z0-9]/gi, "-")}.csv`; a.click(); URL.revokeObjectURL(url);
}

function PlannerTab({ farmId, resources }: { farmId: number; resources: FarmResource[] }) {
  const queryClient = useQueryClient();
  const [weekBase, setWeekBase] = useState(() => weekStart(new Date()));
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);
  const [poolFilter, setPoolFilter] = useState<string | null>(null);
  const jumpRef = useRef<HTMLInputElement>(null);

  const fromDate = isoDate(weekBase);
  const toDate = isoDate(addDays(weekBase, 6));

  const { data, isLoading, isError } = useQuery<{ tasks: PlannerTask[]; allocations: PlannerAllocation[] }>({
    queryKey: ["resource-planner", farmId, fromDate],
    queryFn: () => fetch(`/api/farms/${farmId}/resource-planner?from=${fromDate}&days=7`).then(r => r.json()),
  });

  const allocateMut = useMutation({
    mutationFn: (body: object) => fetch(`/api/farms/${farmId}/task-resource-allocations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resource-planner", farmId, fromDate] }),
    onError: () => toast({ title: "Failed to assign resource", variant: "destructive" }),
  });

  const removeMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/task-resource-allocations/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resource-planner", farmId, fromDate] }),
    onError: () => toast({ title: "Failed to remove allocation", variant: "destructive" }),
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const tasks = data?.tasks ?? [];
  const allocations = data?.allocations ?? [];

  // Committed resource IDs for the current week (any allocation in this week range)
  const committedIds = useMemo(() => new Set(allocations.map(a => a.resource_id)), [allocations]);

  // Group tasks by date
  const byDate = useMemo(() => {
    const m = new Map<string, PlannerTask[]>();
    for (const t of tasks) {
      const d = t.due_date;
      if (!m.has(d)) m.set(d, []);
      m.get(d)!.push(t);
    }
    return m;
  }, [tasks]);

  // Days in range
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekBase, i);
    return { date: d, iso: isoDate(d) };
  });

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as ActiveDrag;
    setActiveDrag(data);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDrag(null);
    const { active, over } = event;
    if (!over) return;

    const overId = String(over.id);
    const dragData = active.data.current as ActiveDrag;
    if (!dragData) return;

    // Return to pool — unassign allocation
    if (overId === "pool") {
      if (dragData.isReturn && dragData.allocationId != null) {
        removeMut.mutate(dragData.allocationId);
      }
      return;
    }

    if (!overId.startsWith("slot:")) return;

    const [, taskRef, slotType, , allocDate] = overId.split(":");

    if (dragData.resourceType !== slotType) {
      toast({
        title: "Type mismatch",
        description: `This slot requires a ${getTypeInfo(slotType).label.toLowerCase()}`,
        variant: "destructive",
      });
      return;
    }

    if (!dragData.resourceId) return;
    const task = tasks.find(t => t.taskRef === taskRef);
    allocateMut.mutate({
      resourceId: dragData.resourceId,
      taskRef,
      taskTitle: task?.title ?? null,
      allocatedDate: allocDate,
      taskAssignmentId: taskRef.startsWith("assign-") ? Number(taskRef.replace("assign-", "")) : null,
    });
  }

  const activeResources = resources.filter(r => r.isActive);

  // ── Intelligence: supply vs demand ──────────────────────────────────────────
  // How many of each resource type we actually have registered
  const supplyByType = useMemo(() => {
    const m: Record<string, number> = {};
    for (const r of activeResources) m[r.type] = (m[r.type] || 0) + 1;
    return m;
  }, [activeResources]);

  // How many of each type are needed per day (sum of req_* across all tasks that day)
  const demandByDayType = useMemo(() => {
    const m = new Map<string, Record<string, number>>();
    for (const t of tasks) {
      if (!m.has(t.due_date)) m.set(t.due_date, {});
      const day = m.get(t.due_date)!;
      for (const { key, type } of REQ_TYPE_MAP) {
        const n = Number(t[key]) || 0;
        if (n > 0) day[type] = (day[type] || 0) + n;
      }
    }
    return m;
  }, [tasks]);

  // Peak demand per type across the whole week (used in the pool panel)
  const peakDemandByType = useMemo(() => {
    const m: Record<string, number> = {};
    for (const [, dayMap] of demandByDayType)
      for (const [type, n] of Object.entries(dayMap))
        m[type] = Math.max(m[type] || 0, n);
    return m;
  }, [demandByDayType]);

  // Pinch points: days where demand for a type exceeds supply
  const pinchPoints = useMemo<PinchPoint[]>(() => {
    const pp: PinchPoint[] = [];
    for (const [date, dayMap] of demandByDayType) {
      for (const [type, demand] of Object.entries(dayMap)) {
        const supply = supplyByType[type] || 0;
        if (demand > supply) pp.push({ date, type, demand, supply, shortage: demand - supply });
      }
    }
    return pp.sort((a, b) => a.date.localeCompare(b.date) || a.type.localeCompare(b.type));
  }, [demandByDayType, supplyByType]);

  const weekMaterials = useMemo(() => {
    const m = new Map<string, WeekMaterial>();
    for (const t of tasks) {
      for (const mat of t.req_materials) {
        if (!mat.name.trim()) continue;
        const qty = Number(mat.quantity) || 0;
        const key = mat.name.trim().toLowerCase();
        if (!m.has(key)) m.set(key, { total: 0, unit: mat.unit || "", tasks: [] });
        const entry = m.get(key)!;
        entry.total += qty;
        if (!entry.tasks.includes(t.title)) entry.tasks.push(t.title);
      }
    }
    return m;
  }, [tasks]);

  const weekLabel = (() => {
    const endOfWeek = addDays(weekBase, 6);
    const fmt = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    return `${fmt(weekBase)} – ${fmt(endOfWeek)}`;
  })();

  const totalTasks = tasks.length;
  const tasksWithReqs = tasks.filter(t => REQ_TYPE_MAP.some(({ key }) => Number(t[key]) > 0)).length;
  const totalSlots = tasks.reduce((s, t) => s + REQ_TYPE_MAP.reduce((ts, { key }) => ts + (Number(t[key]) || 0), 0), 0);
  const filledSlots = allocations.length;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-4">
        {/* Nav + stats */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <button onClick={() => setWeekBase(w => addDays(w, -7))} className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setWeekBase(weekStart(new Date()))} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors">
              <CalendarDays className="w-3.5 h-3.5" />
              Today
            </button>
            <button onClick={() => setWeekBase(w => addDays(w, 7))} className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-foreground ml-1">{weekLabel}</span>
            {/* Jump to date */}
            <div className="relative ml-1">
              <button
                onClick={() => jumpRef.current?.showPicker?.()}
                className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-foreground/50"
                title="Jump to date"
              >
                <CalendarRange className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Jump to</span>
              </button>
              <input
                ref={jumpRef}
                type="date"
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                onChange={e => { if (e.target.value) { setWeekBase(weekStart(new Date(e.target.value + "T12:00:00"))); e.target.value = ""; } }}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-foreground/50">
            <span>{totalTasks} task{totalTasks !== 1 ? "s" : ""}</span>
            {totalSlots > 0 && (
              <span className={cn("font-semibold", filledSlots === totalSlots ? "text-green-600" : "text-amber-600")}>
                {filledSlots}/{totalSlots} slots filled
              </span>
            )}
            {tasks.length > 0 && (
              <button
                onClick={() => exportPlannerCSV(weekLabel, tasks, allocations)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-foreground/60"
                title="Export week plan to CSV"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16 text-foreground/40 text-sm">Loading planner data…</div>
        )}

        {isError && (
          <Card className="p-6 border-red-200 bg-red-50/40 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">Failed to load planner data. The API may still be restarting.</p>
          </Card>
        )}

        {!isLoading && !isError && (
          <div className="flex gap-4 items-start">
            {/* Left — Task list by day */}
            <div className="flex-1 min-w-0 space-y-4">
              {activeResources.length === 0 && (
                <Card className="p-4 border-amber-200 bg-amber-50/40 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <p className="text-xs text-amber-700">Add resources in the Resources tab before assigning them to tasks.</p>
                </Card>
              )}
              {tasksWithReqs === 0 && tasks.length > 0 && (
                <Card className="p-4 border-indigo-200 bg-indigo-50/40 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <p className="text-xs text-indigo-700">None of this week's tasks have resource requirements set. Click the <strong>Set requirements</strong> button on any task card below to add them.</p>
                </Card>
              )}
              <PinchPointPanel pinchPoints={pinchPoints} hasTasksWithReqs={tasksWithReqs > 0} />
              <MaterialWeeklySummary weekMaterials={weekMaterials} />
              {tasks.length === 0 && (
                <div className="py-12 text-center text-foreground/40 text-sm">No tasks this week.</div>
              )}
              {days.map(({ date, iso }) => {
                const dayTasks = byDate.get(iso) ?? [];
                if (dayTasks.length === 0) return null;
                const dayLabel = date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });
                const isToday = iso === isoDate(new Date());
                const dayPinches = pinchPoints.filter(pp => pp.date === iso);
                return (
                  <div key={iso}>
                    <div className={cn("flex items-center gap-2 mb-2 flex-wrap")}>
                      <span className={cn("text-xs font-bold", isToday ? "text-indigo-600" : "text-foreground/50")}>{dayLabel}</span>
                      {isToday && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">TODAY</span>}
                      {dayPinches.map(pp => {
                        const rt = RESOURCE_TYPES.find(r => r.value === pp.type);
                        const Icon = rt?.icon ?? Package;
                        return (
                          <span key={pp.type} title={`${rt?.label ?? pp.type}: ${pp.demand} needed, ${pp.supply} available`}
                            className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200">
                            <Icon className="w-2.5 h-2.5" />{pp.shortage} short
                          </span>
                        );
                      })}
                    </div>
                    <div className="space-y-2">
                      {dayTasks.map(task => (
                        <PlannerTaskCard
                          key={task.taskRef}
                          task={task}
                          allocations={allocations.filter(a => a.task_ref === task.taskRef)}
                          onRemoveAllocation={id => removeMut.mutate(id)}
                          farmId={farmId}
                          onReqsUpdated={() => queryClient.invalidateQueries({ queryKey: ["resource-planner", farmId, fromDate] })}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right — Available resources */}
            <div className="w-56 flex-shrink-0 sticky top-4">
              <DroppablePoolZone isReturning={!!(activeDrag?.isReturn)}>
              <Card className="p-4 border-border">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-xs text-foreground/60 uppercase tracking-wider">Resources</h3>
                  {poolFilter && (
                    <button onClick={() => setPoolFilter(null)} className="text-[10px] text-foreground/40 hover:text-foreground flex items-center gap-0.5">
                      <X className="w-3 h-3" /> All
                    </button>
                  )}
                </div>
                {/* Type filter pills */}
                {activeResources.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {RESOURCE_TYPES.filter(rt => activeResources.some(r => r.type === rt.value)).map(rt => {
                      const Icon = rt.icon;
                      const active = poolFilter === rt.value;
                      return (
                        <button
                          key={rt.value}
                          onClick={() => setPoolFilter(active ? null : rt.value)}
                          className={cn(
                            "flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full border transition-colors",
                            active ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground/50 hover:bg-muted"
                          )}
                        >
                          <Icon className="w-2.5 h-2.5" />{rt.label}
                        </button>
                      );
                    })}
                  </div>
                )}
                {activeResources.length === 0 ? (
                  <p className="text-xs text-foreground/40 italic">No resources added yet.</p>
                ) : (
                  <div className="space-y-4">
                    {RESOURCE_TYPES.map(rt => {
                      if (poolFilter && poolFilter !== rt.value) return null;
                      const typeResources = activeResources.filter(r => r.type === rt.value);
                      if (typeResources.length === 0) return null;
                      const supply = typeResources.length;
                      const peak = peakDemandByType[rt.value] || 0;
                      const isPinched = peak > supply;
                      const isExact = peak > 0 && peak === supply;
                      return (
                        <div key={rt.value}>
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/40">{rt.label}</p>
                            {peak > 0 && (
                              <span className={cn(
                                "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                                isPinched
                                  ? "bg-red-100 text-red-600 border border-red-200"
                                  : isExact
                                    ? "bg-amber-100 text-amber-700 border border-amber-200"
                                    : "bg-green-100 text-green-700 border border-green-200"
                              )}>
                                {supply}/{peak} needed
                              </span>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            {typeResources.map(r => (
                              <DraggableResourceChip
                                key={r.id}
                                resource={r}
                                isCommitted={committedIds.has(r.id)}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="mt-4 pt-3 border-t border-border/40">
                  <p className="text-[10px] text-foreground/40 leading-relaxed">Drag a resource onto an empty slot to assign it. Drag an assigned resource back here to unassign it.</p>
                </div>
              </Card>
              </DroppablePoolZone>
            </div>
          </div>
        )}
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeDrag && (
          <div className={cn(
            "flex items-center gap-2 rounded-lg border shadow-lg px-2.5 py-1.5 text-xs font-medium text-foreground cursor-grabbing",
            activeDrag.isReturn ? "border-amber-300 bg-amber-50" : "border-indigo-300 bg-white"
          )}>
            <GripVertical className={cn("w-3 h-3", activeDrag.isReturn ? "text-amber-400" : "text-indigo-400")} />
            <span>{activeDrag.resourceName}</span>
            {activeDrag.isReturn && <span className="text-[10px] text-amber-600 ml-0.5">→ unassign</span>}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ResourcesPage() {
  const { farmId } = useAppStore();
  if (!farmId) return <Redirect href="/select" />;

  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = usePersistedTab<"resources" | "planner" | "status" | "analytics">({ page: "resources", farmId, validIds: ["resources", "planner", "status", "analytics"], defaultTab: "resources" });
  const [showArchived, setShowArchived] = useState(false);

  const { data, isLoading } = useQuery<{ resources: FarmResource[] }>({
    queryKey: ["resources", farmId, showArchived],
    queryFn: () => fetch(`/api/farms/${farmId}/resources?showAll=${showArchived}`).then(r => r.json()),
  });

  const archiveMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/resources/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["resources", farmId] }); toast({ title: "Resource archived" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const restoreMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/resources/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: true }),
    }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["resources", farmId] }); toast({ title: "Resource restored" }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const resources = data?.resources ?? [];
  const totalActive = resources.filter(r => r.isActive).length;

  return (
    <AppLayout title="Resource Planner">
      <div className="space-y-6 max-w-5xl">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm text-foreground/50 mt-0.5">
              Manage your farm's resources and assign them to tasks week-by-week.
            </p>
            {totalActive > 0 && (
              <p className="text-xs text-foreground/40 mt-1">{totalActive} active resource{totalActive !== 1 ? "s" : ""}</p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
          {(["resources", "planner", "status", "analytics"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-2.5 px-4 text-sm font-semibold border-b-2 transition-colors -mb-px whitespace-nowrap flex items-center gap-1.5",
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-foreground/50 hover:text-foreground"
              )}
            >
              {tab === "resources" ? "Resources" : tab === "planner" ? "Planner" : tab === "status" ? "Planning Status" : <><BarChart2 className="w-3.5 h-3.5" />Analytics</>}
            </button>
          ))}
        </div>

        {activeTab === "resources" ? (
          <ResourcesTabSimple
            farmId={farmId}
            resources={resources}
            isLoading={isLoading}
            showArchived={showArchived}
            setShowArchived={setShowArchived}
            onArchive={archiveMut.mutate}
            onRestore={restoreMut.mutate}
            onInvalidate={() => queryClient.invalidateQueries({ queryKey: ["resources", farmId] })}
          />
        ) : activeTab === "planner" ? (
          <PlannerTab farmId={farmId} resources={resources.filter(r => r.isActive)} />
        ) : activeTab === "status" ? (
          <PlanningStatusTab farmId={farmId} />
        ) : (
          <AnalyticsTab farmId={farmId} resources={resources} />
        )}
      </div>
    </AppLayout>
  );
}

// ─── ResourcesTabSimple — resource management content ─────────────────────────

function ResourcesTabSimple({ farmId, resources, isLoading, showArchived, setShowArchived, onArchive, onRestore, onInvalidate }: {
  farmId: number;
  resources: FarmResource[];
  isLoading: boolean;
  showArchived: boolean;
  setShowArchived: (v: boolean) => void;
  onArchive: (id: number) => void;
  onRestore: (id: number) => void;
  onInvalidate: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState<FarmResource | null>(null);
  const [resSearch, setResSearch] = useState("");

  const createMut = useMutation({
    mutationFn: (body: object) => fetch(`/api/farms/${farmId}/resources`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { onInvalidate(); setShowForm(false); toast({ title: "Resource added" }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, ...body }: { id: number } & object) => fetch(`/api/farms/${farmId}/resources/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { onInvalidate(); setEditingResource(null); toast({ title: "Resource updated" }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const q = resSearch.trim().toLowerCase();
  const filteredResources = q
    ? resources.filter(r => r.name.toLowerCase().includes(q) || (r.description ?? "").toLowerCase().includes(q))
    : resources;

  const grouped = new Map<string, FarmResource[]>();
  for (const r of filteredResources) {
    if (!grouped.has(r.type)) grouped.set(r.type, []);
    grouped.get(r.type)!.push(r);
  }
  const sortedGroups = [...grouped.entries()].sort(
    (a, b) => RESOURCE_TYPES.findIndex(t => t.value === a[0]) - RESOURCE_TYPES.findIndex(t => t.value === b[0])
  );

  return (
    <div className="space-y-6">
      <ImportPanel farmId={farmId} onImported={onInvalidate} />

      {/* Search + Add */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40 pointer-events-none" />
          <input
            type="text"
            placeholder="Search resources…"
            value={resSearch}
            onChange={e => setResSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
          {resSearch && (
            <button onClick={() => setResSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex-1" />
        <button
          onClick={() => { setShowForm(true); setEditingResource(null); }}
          className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add resource
        </button>
      </div>

      {showForm && !editingResource && (
        <ResourceForm
          onSave={data => createMut.mutate(data)}
          onCancel={() => setShowForm(false)}
          isPending={createMut.isPending}
        />
      )}

      {isLoading ? (
        <div className="py-12 text-center text-foreground/40 text-sm">Loading resources…</div>
      ) : resources.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-foreground/40 text-sm">No resources yet.</p>
          <p className="text-xs text-foreground/30 mt-1">Add tractors, implements, vehicles, staff and more above.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedGroups.map(([type, group]) => {
            const { label } = getTypeInfo(type);
            return (
              <div key={type}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 mb-2">{label}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.map(r =>
                    editingResource?.id === r.id ? (
                      <ResourceForm
                        key={r.id}
                        initial={r}
                        onSave={data => updateMut.mutate({ id: r.id, ...data })}
                        onCancel={() => setEditingResource(null)}
                        isPending={updateMut.isPending}
                      />
                    ) : (
                      <ResourceCard
                        key={r.id}
                        resource={r}
                        onEdit={setEditingResource}
                        onArchive={onArchive}
                        onRestore={onRestore}
                      />
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-2 pt-2">
        <button
          onClick={() => setShowArchived(!showArchived)}
          className={cn("text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors", showArchived ? "border-foreground/30 bg-muted text-foreground" : "border-border text-foreground/50 hover:bg-muted")}
        >
          {showArchived ? "Hide archived" : "Show archived"}
        </button>
      </div>
    </div>
  );
}

// ─── Plan vs Actual — Actual Completion Modal ─────────────────────────────────

type ActualFormState = {
  actualDate: string;
  actualTractors: number;
  actualImplements: number;
  actualVehicles: number;
  actualSprayers: number;
  actualTrailers: number;
  actualStaff: number;
  actualMaterials: MaterialReq[];
  actualNotes: string;
  actualStatus: "completed" | "partial" | "abandoned";
};

function ActualCompletionModal({
  event,
  farmId,
  onClose,
  onSaved,
}: {
  event: PlannerEventRecord;
  farmId: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<ActualFormState>(() => ({
    actualDate: event.actualDate ?? event.eventDate.slice(0, 10),
    actualTractors:   event.actualTractors   || event.reqTractors,
    actualImplements: event.actualImplements || event.reqImplements,
    actualVehicles:   event.actualVehicles   || event.reqVehicles,
    actualSprayers:   event.actualSprayers   || event.reqSprayers,
    actualTrailers:   event.actualTrailers   || event.reqTrailers,
    actualStaff:      event.actualStaff      || event.reqStaff,
    actualMaterials:  parseSafe<MaterialReq>(event.actualMaterials).length
      ? parseSafe<MaterialReq>(event.actualMaterials)
      : parseSafe<MaterialReq>(event.reqMaterials).map(m => ({ ...m })),
    actualNotes: event.actualNotes ?? "",
    actualStatus: (event.actualStatus as ActualFormState["actualStatus"]) ?? "completed",
  }));

  const mut = useMutation({
    mutationFn: (data: ActualFormState) =>
      fetch(`/api/farms/${farmId}/planner-events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, actualMaterials: data.actualMaterials }),
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Actuals recorded ✓" }); onSaved(); onClose(); },
    onError: () => toast({ title: "Failed to save actuals", variant: "destructive" }),
  });

  const clearMut = useMutation({
    mutationFn: () =>
      fetch(`/api/farms/${farmId}/planner-events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clearActuals: true }),
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Actuals cleared" }); onSaved(); onClose(); },
    onError: () => toast({ title: "Failed to clear actuals", variant: "destructive" }),
  });

  const set = <K extends keyof ActualFormState>(k: K, v: ActualFormState[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const fmtPlanned = (n: number) => n > 0 ? String(n) : "—";

  const resourceFields = ([
    { key: "actualTractors"   as const, label: "Tractors",   planned: event.reqTractors },
    { key: "actualImplements" as const, label: "Implements", planned: event.reqImplements },
    { key: "actualVehicles"   as const, label: "Vehicles",   planned: event.reqVehicles },
    { key: "actualSprayers"   as const, label: "Sprayers",   planned: event.reqSprayers },
    { key: "actualTrailers"   as const, label: "Trailers",   planned: event.reqTrailers },
    { key: "actualStaff"      as const, label: "Staff",      planned: event.reqStaff },
  ] as { key: keyof ActualFormState; label: string; planned: number }[]).filter(f => f.planned > 0 || (form[f.key] as number) > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-start justify-between gap-3 rounded-t-xl">
          <div>
            <h2 className="text-base font-bold">Record Actuals</h2>
            <p className="text-xs text-foreground/50 mt-0.5">{event.title}</p>
          </div>
          <button onClick={onClose} className="text-foreground/40 hover:text-foreground mt-0.5"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Outcome */}
          <div>
            <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider block mb-2">Outcome</label>
            <div className="flex gap-2 flex-wrap">
              {(["completed", "partial", "abandoned"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => set("actualStatus", s)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
                    form.actualStatus === s
                      ? s === "completed" ? "bg-green-600 text-white border-green-600"
                        : s === "partial"  ? "bg-amber-500 text-white border-amber-500"
                        : "bg-red-500 text-white border-red-500"
                      : "border-border text-foreground/50 hover:bg-muted"
                  )}
                >
                  {s === "completed" ? "✓ Completed" : s === "partial" ? "⚡ Partial" : "✕ Abandoned"}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider block mb-2">
              Actual date <span className="normal-case font-normal text-foreground/40">(planned: {new Date(event.eventDate).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })})</span>
            </label>
            <input
              type="date"
              value={form.actualDate}
              onChange={e => set("actualDate", e.target.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary/40 w-48"
            />
          </div>

          {/* Resources */}
          {resourceFields.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider block mb-2">Resources used</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {resourceFields.map(f => {
                  const actual = form[f.key] as number;
                  const delta = actual - f.planned;
                  return (
                    <div key={f.key}>
                      <label className="text-xs text-foreground/50 mb-1 block">{f.label} <span className="text-foreground/30">(planned: {fmtPlanned(f.planned)})</span></label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number" min="0"
                          value={actual}
                          onChange={e => set(f.key, Number(e.target.value) as ActualFormState[typeof f.key])}
                          className="w-16 border border-border rounded px-2 py-1 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary/40 text-center"
                        />
                        {delta !== 0 && f.planned > 0 && (
                          <span className={cn("text-[10px] font-bold", delta > 0 ? "text-red-500" : "text-green-600")}>
                            {delta > 0 ? `+${delta}` : delta}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Materials */}
          {form.actualMaterials.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider block mb-2">Materials used</label>
              <div className="space-y-2">
                {form.actualMaterials.map((m, i) => {
                  const planned = parseSafe<MaterialReq>(event.reqMaterials)[i];
                  return (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="flex-1 text-foreground/70">{m.name || `Item ${i + 1}`}</span>
                      <input
                        type="number" min="0" step="0.01"
                        value={m.quantity}
                        onChange={e => setForm(f => {
                          const mats = [...f.actualMaterials];
                          mats[i] = { ...mats[i], quantity: Number(e.target.value) };
                          return { ...f, actualMaterials: mats };
                        })}
                        className="w-20 border border-border rounded px-2 py-1 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary/40 text-center"
                      />
                      <span className="text-foreground/50 text-xs">{m.unit}</span>
                      {planned && Number(m.quantity) !== Number(planned.quantity) && (
                        <span className={cn("text-[10px] font-bold", Number(m.quantity) > Number(planned.quantity) ? "text-red-500" : "text-green-600")}>
                          {Number(m.quantity) > Number(planned.quantity) ? `+${(Number(m.quantity) - Number(planned.quantity)).toFixed(2)}` : (Number(m.quantity) - Number(planned.quantity)).toFixed(2)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider block mb-2">Notes / deviation reason</label>
            <textarea
              value={form.actualNotes}
              onChange={e => set("actualNotes", e.target.value)}
              placeholder="e.g. Weather delay, additional resource required due to wet ground conditions…"
              rows={3}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none"
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-background border-t border-border px-6 py-4 flex items-center justify-between gap-3 rounded-b-xl">
          <div className="flex gap-2">
            {event.actualStatus && (
              <button
                onClick={() => clearMut.mutate()}
                disabled={clearMut.isPending}
                className="text-xs text-foreground/40 hover:text-red-500 transition-colors disabled:opacity-40"
              >
                Clear actuals
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors">Cancel</button>
            <button
              onClick={() => mut.mutate(form)}
              disabled={mut.isPending}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              {mut.isPending ? "Saving…" : "Save actuals"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Planning Status Tab ──────────────────────────────────────────────────────

type PlannerEventRecord = {
  id: number;
  title: string;
  eventDate: string;
  endDate: string | null;
  colour: string;
  reqTractors: number;
  reqImplements: number;
  reqVehicles: number;
  reqSprayers: number;
  reqTrailers: number;
  reqStaff: number;
  reqOther: number;
  reqOtherNotes: string | null;
  reqMaterials: string | null;
  reqCommitted: boolean;
  reqCommittedBy: string | null;
  reqCommittedAt: string | null;
  // Actuals
  actualDate: string | null;
  actualTractors: number;
  actualImplements: number;
  actualVehicles: number;
  actualSprayers: number;
  actualTrailers: number;
  actualStaff: number;
  actualMaterials: string | null;
  actualNotes: string | null;
  actualStatus: string | null;
  actualCompletedAt: string | null;
  actualCompletedBy: string | null;
};

type PlanningStatus = "committed" | "planned" | "not_started";

type AgriEnvMilestoneEvent = {
  id: number;
  projectId: number;
  milestoneName: string;
  dueDate: string;
  status: string;
  schemeName: string;
};

type PlannerEventsResponse = {
  events: PlannerEventRecord[];
  milestones: AgriEnvMilestoneEvent[];
};

function parseSafe<T>(s: string | null): T[] {
  if (!s) return [];
  try { return JSON.parse(s) as T[]; } catch { return []; }
}

function getPlanningStatus(e: PlannerEventRecord): PlanningStatus {
  if (e.reqCommitted) return "committed";
  const hasReqs =
    e.reqTractors > 0 || e.reqImplements > 0 || e.reqVehicles > 0 ||
    e.reqSprayers > 0 || e.reqTrailers > 0 || e.reqStaff > 0 || e.reqOther > 0;
  const otherNotes = parseSafe<string>(e.reqOtherNotes);
  const materials = parseSafe<MaterialReq>(e.reqMaterials);
  if (hasReqs || otherNotes.length > 0 || materials.length > 0) return "planned";
  return "not_started";
}

function PlanningStatusTab({ farmId }: { farmId: number }) {
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const { data: plannerData, isLoading } = useQuery<PlannerEventsResponse>({
    queryKey: ["planner-events-all", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/planner-events`).then(r => r.json()),
  });

  const events: PlannerEventRecord[] = plannerData?.events ?? [];
  const milestones: AgriEnvMilestoneEvent[] = plannerData?.milestones ?? [];

  const commitMut = useMutation({
    mutationFn: ({ id, committed }: { id: number; committed: boolean }) =>
      fetch(`/api/farms/${farmId}/planner-events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reqCommitted: committed }),
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["planner-events-all", farmId] });
      toast({ title: vars.committed ? "Task committed ✓" : "Commitment removed" });
    },
    onError: () => toast({ title: "Failed to update task", variant: "destructive" }),
  });

  const [dateRange, setDateRange] = useState<"1w" | "2w" | "4w" | "8w" | "all">("all");
  const [search, setSearch] = useState("");
  const [showPast, setShowPast] = useState(false);
  const [showPva, setShowPva] = useState(false);
  const [actingOn, setActingOn] = useState<PlannerEventRecord | null>(null);

  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);

  const cutoff = useMemo(() => {
    if (dateRange === "all") return null;
    const d = new Date(today);
    d.setDate(d.getDate() + ({ "1w": 7, "2w": 14, "4w": 28, "8w": 56 } as Record<string, number>)[dateRange]);
    return d;
  }, [dateRange, today]);

  const sq = search.trim().toLowerCase();

  const allUpcoming = useMemo(() =>
    events
      .filter(e => new Date(e.eventDate) >= today)
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()),
    [events, today]
  );

  const upcoming = useMemo(() =>
    allUpcoming
      .filter(e => !cutoff || new Date(e.eventDate) <= cutoff)
      .filter(e => !sq || e.title.toLowerCase().includes(sq)),
    [allUpcoming, cutoff, sq]
  );

  const past = useMemo(() =>
    events
      .filter(e => new Date(e.eventDate) < today)
      .filter(e => !sq || e.title.toLowerCase().includes(sq))
      .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()),
    [events, today, sq]
  );

  const notStarted = upcoming.filter(e => getPlanningStatus(e) === "not_started");
  const planned    = upcoming.filter(e => getPlanningStatus(e) === "planned");
  const committed  = upcoming.filter(e => getPlanningStatus(e) === "committed");

  // Agri-env milestones — filtered to match the same date range and search
  const upcomingMilestones = useMemo(() =>
    milestones
      .filter(m => m.dueDate && new Date(m.dueDate + "T12:00:00") >= today)
      .filter(m => !cutoff || new Date(m.dueDate + "T12:00:00") <= cutoff)
      .filter(m => !sq || m.milestoneName.toLowerCase().includes(sq) || m.schemeName.toLowerCase().includes(sq))
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [milestones, today, cutoff, sq]
  );

  const pastMilestones = useMemo(() =>
    milestones
      .filter(m => m.dueDate && new Date(m.dueDate + "T12:00:00") < today)
      .filter(m => !sq || m.milestoneName.toLowerCase().includes(sq) || m.schemeName.toLowerCase().includes(sq))
      .sort((a, b) => b.dueDate.localeCompare(a.dueDate)),
    [milestones, today, sq]
  );

  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

  function exportStatusCSV() {
    const rows: string[][] = [["Date", "Task", "Status", "Requirements", "Committed By", "Committed At"]];
    for (const e of upcoming) {
      const status = getPlanningStatus(e);
      const parts: string[] = [];
      if (e.reqTractors > 0) parts.push(`${e.reqTractors} tractors`);
      if (e.reqImplements > 0) parts.push(`${e.reqImplements} implements`);
      if (e.reqVehicles > 0) parts.push(`${e.reqVehicles} vehicles`);
      if (e.reqSprayers > 0) parts.push(`${e.reqSprayers} sprayers`);
      if (e.reqTrailers > 0) parts.push(`${e.reqTrailers} trailers`);
      if (e.reqStaff > 0) parts.push(`${e.reqStaff} staff`);
      rows.push([e.eventDate, e.title, status, parts.join("; "), e.reqCommittedBy ?? "", e.reqCommittedAt ? new Date(e.reqCommittedAt).toLocaleDateString("en-GB") : ""]);
    }
    const csv = "\uFEFF" + rows.map(r => r.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = "planning-status.csv"; a.click(); URL.revokeObjectURL(url);
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-foreground/50 py-10">
        <Clock className="w-4 h-4 animate-spin" /> Loading tasks…
      </div>
    );
  }

  if (upcoming.length === 0 && upcomingMilestones.length === 0 && past.length === 0 && pastMilestones.length === 0) {
    return (
      <Card className="p-10 text-center text-sm text-foreground/50">
        No upcoming planner tasks found. Add tasks in the Planner tab first.
      </Card>
    );
  }

  function ReqSummary({ e }: { e: PlannerEventRecord }) {
    const parts: string[] = [];
    if (e.reqTractors > 0)   parts.push(`${e.reqTractors} tractor${e.reqTractors > 1 ? "s" : ""}`);
    if (e.reqImplements > 0) parts.push(`${e.reqImplements} implement${e.reqImplements > 1 ? "s" : ""}`);
    if (e.reqVehicles > 0)   parts.push(`${e.reqVehicles} vehicle${e.reqVehicles > 1 ? "s" : ""}`);
    if (e.reqSprayers > 0)   parts.push(`${e.reqSprayers} sprayer${e.reqSprayers > 1 ? "s" : ""}`);
    if (e.reqTrailers > 0)   parts.push(`${e.reqTrailers} trailer${e.reqTrailers > 1 ? "s" : ""}`);
    if (e.reqStaff > 0)      parts.push(`${e.reqStaff} staff`);
    const others = parseSafe<string>(e.reqOtherNotes);
    if (others.length > 0)   parts.push(`${others.length} other`);
    const mats = parseSafe<MaterialReq>(e.reqMaterials);
    if (mats.length > 0)     parts.push(`${mats.length} material${mats.length > 1 ? "s" : ""}`);
    if (parts.length === 0)  return <span className="text-xs text-foreground/40 italic">No requirements entered yet</span>;
    return <span className="text-xs text-foreground/60">{parts.join(" · ")}</span>;
  }

  function EventRow({ e, showActualsBtn }: { e: PlannerEventRecord; showActualsBtn?: boolean }) {
    const status = getPlanningStatus(e);
    const pending = commitMut.isPending && (commitMut.variables as { id: number } | undefined)?.id === e.id;
    const hasActuals = !!e.actualStatus;

    const ActualBadge = () => {
      if (!hasActuals) return null;
      const cfg = e.actualStatus === "completed"
        ? { cls: "bg-green-100 text-green-700", label: "✓ Completed" }
        : e.actualStatus === "partial"
          ? { cls: "bg-amber-100 text-amber-700", label: "⚡ Partial" }
          : { cls: "bg-red-100 text-red-600", label: "✕ Abandoned" };
      return (
        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border", cfg.cls)}>
          {cfg.label}
        </span>
      );
    };

    return (
      <div className="flex items-start gap-3 px-4 py-3 border-b border-border last:border-0">
        <div className={cn("w-1 self-stretch rounded-full flex-shrink-0 mt-0.5",
          status === "committed" ? "bg-green-400" : status === "planned" ? "bg-amber-400" : "bg-red-300"
        )} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium leading-snug">{e.title}</span>
            <ActualBadge />
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-foreground/50">{fmtDate(e.eventDate)}</span>
            {e.actualDate && e.actualDate !== e.eventDate.slice(0, 10) && (
              <>
                <span className="text-foreground/30 text-xs">→</span>
                <span className="text-xs text-foreground/50">actual: {new Date(e.actualDate + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</span>
              </>
            )}
            <span className="text-foreground/30 text-xs">·</span>
            <ReqSummary e={e} />
          </div>
          {e.actualNotes && (
            <p className="text-xs text-foreground/40 italic mt-1 leading-snug">"{e.actualNotes}"</p>
          )}
        </div>
        <div className="flex-shrink-0 flex items-center gap-2">
          {showActualsBtn && (
            <button
              onClick={() => setActingOn(e)}
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors border",
                hasActuals
                  ? "border-primary/30 text-primary hover:bg-primary/10"
                  : "border-border text-foreground/50 hover:bg-muted"
              )}
            >
              <ClipboardList className="w-3 h-3" />
              {hasActuals ? "Edit actuals" : "Record actuals"}
            </button>
          )}
          {status === "committed" ? (
            <>
              <div className="hidden sm:flex flex-col items-end gap-0.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                  <BadgeCheck className="w-3.5 h-3.5" /> Committed
                </span>
                {(e.reqCommittedBy || e.reqCommittedAt) && (
                  <span className="text-[10px] text-foreground/40 leading-tight">
                    {e.reqCommittedBy ?? ""}
                    {e.reqCommittedBy && e.reqCommittedAt ? " · " : ""}
                    {e.reqCommittedAt
                      ? new Date(e.reqCommittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                      : ""}
                  </span>
                )}
              </div>
              <button
                onClick={() => commitMut.mutate({ id: e.id, committed: false })}
                disabled={pending}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs text-foreground/50 hover:bg-muted border border-border transition-colors disabled:opacity-40"
              >
                <Undo2 className="w-3 h-3" /> Uncommit
              </button>
            </>
          ) : (
            <>
              <span className={cn(
                "hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
                status === "planned" ? "bg-amber-100 text-amber-700" : "bg-red-50 text-red-500"
              )}>
                {status === "planned"
                  ? <><ClipboardList className="w-3.5 h-3.5" /> Needs sign-off</>
                  : <><CircleDashed className="w-3.5 h-3.5" /> Not started</>
                }
              </span>
              <button
                onClick={() => commitMut.mutate({ id: e.id, committed: true })}
                disabled={pending || status === "not_started"}
                title={status === "not_started" ? "Enter resource or material requirements before committing" : "Mark planning complete for this task"}
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
                  status === "planned"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-foreground/40 border border-border"
                )}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Commit
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  function Section({ title, icon, items, accent }: {
    title: string;
    icon: React.ReactNode;
    items: PlannerEventRecord[];
    accent: string;
  }) {
    if (items.length === 0) return null;
    return (
      <div className="space-y-1">
        <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold", accent)}>
          {icon}
          <span>{title}</span>
          <span className="ml-auto font-normal opacity-70">{items.length} task{items.length !== 1 ? "s" : ""}</span>
        </div>
        <Card className="overflow-hidden">
          {items.map(e => <EventRow key={e.id} e={e} />)}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Date range pills */}
        <div className="flex items-center gap-1 flex-wrap">
          {(["1w", "2w", "4w", "8w", "all"] as const).map(r => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className={cn(
                "text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors",
                dateRange === r ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground/50 hover:bg-muted"
              )}
            >
              {r === "all" ? "All upcoming" : r === "1w" ? "Next week" : r === "2w" ? "2 weeks" : r === "4w" ? "4 weeks" : "8 weeks"}
            </button>
          ))}
        </div>
        {/* Search */}
        <div className="relative flex-1 min-w-0 sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40 pointer-events-none" />
          <input
            type="text"
            placeholder="Search tasks…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
          {search && <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground"><X className="w-3.5 h-3.5" /></button>}
        </div>
        {/* Export */}
        {upcoming.length > 0 && (
          <button
            onClick={exportStatusCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border hover:bg-muted transition-colors text-foreground/60 shrink-0"
          >
            <FileDown className="w-3.5 h-3.5" /> Export CSV
          </button>
        )}
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        {([
          { label: "Not started", count: notStarted.length, color: "bg-red-50 border-red-200 text-red-600", icon: <CircleDashed className="w-4 h-4" /> },
          { label: "Needs sign-off", count: planned.length, color: "bg-amber-50 border-amber-200 text-amber-700", icon: <ClipboardList className="w-4 h-4" /> },
          { label: "Committed", count: committed.length, color: "bg-green-50 border-green-200 text-green-700", icon: <BadgeCheck className="w-4 h-4" /> },
        ] as const).map(s => (
          <Card key={s.label} className={cn("flex items-center gap-3 px-4 py-3 border", s.color)}>
            {s.icon}
            <div>
              <div className="text-2xl font-bold leading-none">{s.count}</div>
              <div className="text-xs opacity-80 mt-0.5">{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <p className="text-xs text-foreground/40 -mt-2">
        Enter resource and material requirements on a task, then click <strong>Commit</strong> to mark it as fully planned.
        {dateRange !== "all" && <> Showing tasks in the next {dateRange === "1w" ? "week" : dateRange === "2w" ? "2 weeks" : dateRange === "4w" ? "4 weeks" : "8 weeks"}.</>}
      </p>

      {upcoming.length === 0 && upcomingMilestones.length === 0 && !showPast ? (
        <Card className="p-8 text-center text-sm text-foreground/50">
          No tasks match this filter. Try a wider date range or clear the search.
        </Card>
      ) : (
        <div className="space-y-4">
          {upcoming.length > 0 && <>
            <Section
              title="Not started — planning required"
              icon={<CircleDashed className="w-3.5 h-3.5" />}
              items={notStarted}
              accent="bg-red-50 text-red-700"
            />
            <Section
              title="Requirements entered — awaiting sign-off"
              icon={<ClipboardList className="w-3.5 h-3.5" />}
              items={planned}
              accent="bg-amber-50 text-amber-700"
            />
            <Section
              title="Committed — planning complete"
              icon={<BadgeCheck className="w-3.5 h-3.5" />}
              items={committed}
              accent="bg-green-50 text-green-700"
            />
          </>}

          {/* Agri-environment milestone due dates */}
          {upcomingMilestones.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 text-teal-700">
                <Flag className="w-3.5 h-3.5" />
                <span>Agri-environment milestones</span>
                <span className="ml-auto font-normal opacity-70">{upcomingMilestones.length} due</span>
              </div>
              <Card className="overflow-hidden">
                {upcomingMilestones.map(m => (
                  <div key={m.id} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0">
                    <div className="w-1 self-stretch rounded-full flex-shrink-0 mt-0.5 bg-teal-400" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium leading-snug">{m.milestoneName}</span>
                        {m.status === "completed" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-green-100 text-green-700">✓ Completed</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-foreground/50">{fmtDate(m.dueDate + "T12:00:00")}</span>
                        <span className="text-foreground/30 text-xs">·</span>
                        <span className="text-xs text-teal-600 font-medium">{m.schemeName}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/grants?tab=agrienv&project=${m.projectId}`)}
                      className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-teal-700 hover:bg-teal-50 border border-teal-200 transition-colors"
                      title="Open in Grants & Funding"
                    >
                      <ExternalLink className="w-3 h-3" /> View
                    </button>
                  </div>
                ))}
              </Card>
              <p className="text-xs text-foreground/40 px-1">Read-only. Manage milestones in <button onClick={() => navigate("/grants?tab=agrienv")} className="underline underline-offset-2 hover:text-foreground/60">Grants &amp; Funding → Agri-environment Schemes</button>.</p>
            </div>
          )}
        </div>
      )}

      {/* Past tasks toggle */}
      <div className="pt-2 border-t border-border">
        <button
          onClick={() => setShowPast(p => !p)}
          className={cn(
            "flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors",
            showPast ? "border-foreground/30 bg-muted text-foreground" : "border-border text-foreground/50 hover:bg-muted"
          )}
        >
          <History className="w-3.5 h-3.5" />
          {showPast
            ? "Hide past tasks"
            : `Show past tasks${(past.length + pastMilestones.length) > 0 ? ` (${past.length + pastMilestones.length})` : ""}`}
        </button>
        {showPast && past.length > 0 && (
          <div className="mt-3 space-y-1">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 text-gray-600">
              <History className="w-3.5 h-3.5" />
              <span>Past tasks</span>
              <span className="ml-auto font-normal opacity-70">{past.length} task{past.length !== 1 ? "s" : ""}</span>
            </div>
            <Card className="overflow-hidden">
              {past.map(e => <EventRow key={e.id} e={e} showActualsBtn />)}
            </Card>
          </div>
        )}
        {showPast && pastMilestones.length > 0 && (
          <div className="mt-3 space-y-1">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 text-teal-600">
              <Flag className="w-3.5 h-3.5" />
              <span>Past agri-environment milestones</span>
              <span className="ml-auto font-normal opacity-70">{pastMilestones.length}</span>
            </div>
            <Card className="overflow-hidden">
              {pastMilestones.map(m => (
                <div key={m.id} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 opacity-60">
                  <div className="w-1 self-stretch rounded-full flex-shrink-0 mt-0.5 bg-teal-300" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium leading-snug">{m.milestoneName}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-foreground/50">{fmtDate(m.dueDate + "T12:00:00")}</span>
                      <span className="text-foreground/30 text-xs">·</span>
                      <span className="text-xs text-teal-600">{m.schemeName}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/grants?tab=agrienv&project=${m.projectId}`)}
                    className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-teal-700 hover:bg-teal-50 border border-teal-200 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" /> View
                  </button>
                </div>
              ))}
            </Card>
          </div>
        )}
        {showPast && past.length === 0 && pastMilestones.length === 0 && (
          <p className="mt-3 text-xs text-foreground/40 px-1">No past tasks found.</p>
        )}
      </div>

      {/* Plan vs Actual comparison table */}
      {(() => {
        const withActuals = events.filter(e => !!e.actualStatus);
        return (
          <div className="pt-2 border-t border-border">
            <button
              onClick={() => setShowPva(p => !p)}
              className={cn(
                "flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors",
                showPva ? "border-foreground/30 bg-muted text-foreground" : "border-border text-foreground/50 hover:bg-muted"
              )}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              {showPva ? "Hide plan vs actual" : `Plan vs Actual${withActuals.length > 0 ? ` (${withActuals.length} task${withActuals.length !== 1 ? "s" : ""} recorded)` : " — record actuals on past tasks above"}`}
            </button>
            {showPva && withActuals.length === 0 && (
              <p className="mt-3 text-xs text-foreground/40 px-1">No actuals recorded yet. Use the "Record actuals" button on past tasks above.</p>
            )}
            {showPva && withActuals.length > 0 && (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-xs min-w-[640px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left py-2 px-3 font-semibold text-foreground/50">Task</th>
                      <th className="text-center py-2 px-3 font-semibold text-foreground/50">Planned date</th>
                      <th className="text-center py-2 px-3 font-semibold text-foreground/50">Actual date</th>
                      <th className="text-center py-2 px-3 font-semibold text-foreground/50">Date slip</th>
                      <th className="text-center py-2 px-3 font-semibold text-foreground/50">Planned res.</th>
                      <th className="text-center py-2 px-3 font-semibold text-foreground/50">Actual res.</th>
                      <th className="text-center py-2 px-3 font-semibold text-foreground/50">Res. delta</th>
                      <th className="text-left py-2 px-3 font-semibold text-foreground/50">Outcome</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withActuals.sort((a, b) => (a.actualDate ?? a.eventDate).localeCompare(b.actualDate ?? b.eventDate)).map(e => {
                      const plannedDate = new Date(e.eventDate.slice(0, 10) + "T12:00:00");
                      const actualDate  = e.actualDate ? new Date(e.actualDate + "T12:00:00") : null;
                      const slipDays    = actualDate ? Math.round((actualDate.getTime() - plannedDate.getTime()) / 86400000) : null;
                      const plannedRes  = e.reqTractors + e.reqImplements + e.reqVehicles + e.reqSprayers + e.reqTrailers + e.reqStaff;
                      const actualRes   = e.actualTractors + e.actualImplements + e.actualVehicles + e.actualSprayers + e.actualTrailers + e.actualStaff;
                      const resDelta    = actualRes - plannedRes;
                      const fmtD = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
                      const outcomeCfg = e.actualStatus === "completed"
                        ? "text-green-600 font-semibold"
                        : e.actualStatus === "partial" ? "text-amber-600 font-semibold" : "text-red-500 font-semibold";
                      return (
                        <tr key={e.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                          <td className="py-2 px-3 font-medium max-w-[180px] truncate" title={e.title}>{e.title}</td>
                          <td className="py-2 px-3 text-center text-foreground/60">{fmtD(plannedDate)}</td>
                          <td className="py-2 px-3 text-center text-foreground/60">{actualDate ? fmtD(actualDate) : <span className="text-foreground/30">—</span>}</td>
                          <td className="py-2 px-3 text-center">
                            {slipDays === null ? <span className="text-foreground/30">—</span>
                              : slipDays === 0 ? <span className="text-green-600 font-semibold">On time</span>
                              : slipDays > 0  ? <span className="text-red-500 font-semibold">+{slipDays}d</span>
                              : <span className="text-blue-600 font-semibold">{slipDays}d early</span>}
                          </td>
                          <td className="py-2 px-3 text-center text-foreground/60">{plannedRes || "—"}</td>
                          <td className="py-2 px-3 text-center text-foreground/60">{actualRes || "—"}</td>
                          <td className="py-2 px-3 text-center">
                            {plannedRes === 0 ? <span className="text-foreground/30">—</span>
                              : resDelta === 0 ? <span className="text-green-600 font-semibold">=</span>
                              : resDelta > 0  ? <span className="text-red-500 font-semibold">+{resDelta}</span>
                              : <span className="text-green-600 font-semibold">{resDelta}</span>}
                          </td>
                          <td className={cn("py-2 px-3", outcomeCfg)}>
                            {e.actualStatus === "completed" ? "✓ Completed" : e.actualStatus === "partial" ? "⚡ Partial" : "✕ Abandoned"}
                            {e.actualCompletedBy && <span className="text-foreground/40 font-normal"> · {e.actualCompletedBy}</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {withActuals.some(e => e.actualNotes) && (
                  <div className="mt-4 space-y-1.5">
                    <p className="text-xs font-semibold text-foreground/50 px-1">Deviation notes</p>
                    {withActuals.filter(e => e.actualNotes).map(e => (
                      <div key={e.id} className="px-3 py-2 bg-muted/40 rounded-lg text-xs">
                        <span className="font-medium">{e.title}</span>
                        <span className="text-foreground/40"> — </span>
                        <span className="text-foreground/60 italic">{e.actualNotes}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* Actual Completion Modal */}
      {actingOn && (
        <ActualCompletionModal
          event={actingOn}
          farmId={farmId}
          onClose={() => setActingOn(null)}
          onSaved={() => queryClient.invalidateQueries({ queryKey: ["planner-events-all", farmId] })}
        />
      )}
    </div>
  );
}

// ─── Analytics Tab ─────────────────────────────────────────────────────────────

type AllocRow = {
  resource_id: number;
  resource_name: string;
  resource_type: string;
  resource_colour: string;
  allocated_date: string;
  task_ref: string;
};

function AnalyticsTab({ farmId, resources }: { farmId: number; resources: FarmResource[] }) {
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);

  const start = isoDate(addDays(today, -365));
  const end   = isoDate(addDays(today, 365));

  const { data: plannerData2 } = useQuery<PlannerEventsResponse>({
    queryKey: ["planner-events-all", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/planner-events`).then(r => r.json()),
  });

  const events: PlannerEventRecord[] = plannerData2?.events ?? [];

  const { data: allocData, isLoading: allocLoading } = useQuery<{ allocations: AllocRow[] }>({
    queryKey: ["analytics-allocs", farmId, start, end],
    queryFn: () => fetch(`/api/farms/${farmId}/task-resource-allocations?start=${start}&end=${end}`).then(r => r.json()),
    staleTime: 2 * 60 * 1000,
  });

  const allocations: AllocRow[] = allocData?.allocations ?? [];

  // ── Planning status breakdown ────────────────────────────────────────────────
  const upcoming = useMemo(() => events.filter(e => new Date(e.eventDate) >= today), [events, today]);

  const statusCounts = useMemo(() => {
    let notStarted = 0, planned = 0, committed = 0;
    for (const e of upcoming) {
      const s = getPlanningStatus(e);
      if (s === "not_started") notStarted++;
      else if (s === "planned") planned++;
      else committed++;
    }
    return [
      { name: "Not started", value: notStarted, fill: "#fca5a5" },
      { name: "Needs sign-off", value: planned, fill: "#fcd34d" },
      { name: "Committed", value: committed, fill: "#86efac" },
    ];
  }, [upcoming]);

  // ── Resource demand by type ──────────────────────────────────────────────────
  const demandByType = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const e of upcoming) {
      if (e.reqTractors > 0)   totals["Tractors"]   = (totals["Tractors"]   || 0) + e.reqTractors;
      if (e.reqImplements > 0) totals["Implements"] = (totals["Implements"] || 0) + e.reqImplements;
      if (e.reqVehicles > 0)   totals["Vehicles"]   = (totals["Vehicles"]   || 0) + e.reqVehicles;
      if (e.reqSprayers > 0)   totals["Sprayers"]   = (totals["Sprayers"]   || 0) + e.reqSprayers;
      if (e.reqTrailers > 0)   totals["Trailers"]   = (totals["Trailers"]   || 0) + e.reqTrailers;
      if (e.reqStaff > 0)      totals["Staff"]      = (totals["Staff"]      || 0) + e.reqStaff;
    }
    return Object.entries(totals).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [upcoming]);

  // ── Tasks by week (next 8 weeks) ─────────────────────────────────────────────
  const byWeek = useMemo(() => {
    const weeks: { label: string; notStarted: number; planned: number; committed: number }[] = [];
    for (let i = 0; i < 8; i++) {
      const ws = addDays(weekStart(today), i * 7);
      const we = addDays(ws, 6);
      const wsStr = isoDate(ws);
      const weStr = isoDate(we);
      const label = ws.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      let notStarted = 0, planned = 0, committed = 0;
      for (const e of upcoming) {
        if (e.eventDate >= wsStr && e.eventDate <= weStr) {
          const s = getPlanningStatus(e);
          if (s === "not_started") notStarted++;
          else if (s === "planned") planned++;
          else committed++;
        }
      }
      if (notStarted + planned + committed > 0) weeks.push({ label, notStarted, planned, committed });
    }
    return weeks;
  }, [upcoming, today]);

  // ── Resource utilisation: times each resource is allocated ───────────────────
  const utilisationData = useMemo(() => {
    const counts: Record<number, { name: string; type: string; colour: string; count: number }> = {};
    for (const r of resources) {
      counts[r.id] = { name: r.name, type: r.type, colour: r.colour || "#6366f1", count: 0 };
    }
    for (const a of allocations) {
      if (counts[a.resource_id]) counts[a.resource_id].count++;
      else counts[a.resource_id] = { name: a.resource_name, type: a.resource_type, colour: a.resource_colour || "#6366f1", count: 1 };
    }
    return Object.values(counts).filter(r => r.count > 0).sort((a, b) => b.count - a.count).slice(0, 12);
  }, [allocations, resources]);

  // ── Material totals ──────────────────────────────────────────────────────────
  const materialTotals = useMemo(() => {
    const acc: Record<string, { name: string; unit: string; total: number }> = {};
    for (const e of upcoming) {
      const mats = parseSafe<MaterialReq>(e.reqMaterials);
      for (const m of mats) {
        if (!m.name) continue;
        const key = `${m.name}__${m.unit}`;
        if (!acc[key]) acc[key] = { name: m.name, unit: m.unit, total: 0 };
        acc[key].total += Number(m.quantity) || 0;
      }
    }
    return Object.values(acc).sort((a, b) => a.name.localeCompare(b.name));
  }, [upcoming]);

  const totalUpcoming = upcoming.length;
  const committedPct = totalUpcoming > 0
    ? Math.round((statusCounts[2].value / totalUpcoming) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Upcoming tasks", value: totalUpcoming, sub: "from today", color: "text-foreground" },
          { label: "Planning complete", value: `${committedPct}%`, sub: `${statusCounts[2].value} committed`, color: committedPct === 100 ? "text-green-600" : committedPct >= 50 ? "text-amber-600" : "text-red-500" },
          { label: "Resources on file", value: resources.filter(r => r.isActive).length, sub: `${resources.length} total`, color: "text-foreground" },
          { label: "Allocations (±1yr)", value: allocLoading ? "…" : allocations.length, sub: "resource assignments", color: "text-foreground" },
        ].map(k => (
          <Card key={k.label} className="px-4 py-3">
            <div className={`text-2xl font-bold leading-none ${k.color}`}>{k.value}</div>
            <div className="text-xs font-semibold mt-1">{k.label}</div>
            <div className="text-[11px] text-foreground/40 mt-0.5">{k.sub}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Planning status donut-style bar */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-foreground/50" />Planning Status — Upcoming</h3>
          {totalUpcoming === 0 ? (
            <p className="text-xs text-foreground/40 italic py-6 text-center">No upcoming tasks yet.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={statusCounts} layout="vertical" margin={{ left: 16, right: 16, top: 4, bottom: 4 }}>
                  <CartesianGrid horizontal={false} stroke="currentColor" strokeOpacity={0.06} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                  <Tooltip formatter={(v: number) => [`${v} task${v !== 1 ? "s" : ""}`, ""]} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {statusCounts.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-[11px] text-foreground/50 mb-1">
                  <span>Overall planning progress</span>
                  <span className="font-bold">{committedPct}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-green-400 transition-all" style={{ width: `${committedPct}%` }} />
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Tasks per week (next 8 weeks) */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><CalendarDays className="w-4 h-4 text-foreground/50" />Tasks by Week — Next 8 Weeks</h3>
          {byWeek.length === 0 ? (
            <p className="text-xs text-foreground/40 italic py-6 text-center">No upcoming tasks in this period.</p>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={byWeek} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
                <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.06} />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="committed" stackId="a" fill="#86efac" name="Committed" radius={[0, 0, 0, 0]} />
                <Bar dataKey="planned" stackId="a" fill="#fcd34d" name="Needs sign-off" radius={[0, 0, 0, 0]} />
                <Bar dataKey="notStarted" stackId="a" fill="#fca5a5" name="Not started" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Resource demand by type */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Tractor className="w-4 h-4 text-foreground/50" />Resource Demand — Upcoming Tasks</h3>
          {demandByType.length === 0 ? (
            <p className="text-xs text-foreground/40 italic py-6 text-center">No resource requirements entered yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={demandByType} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
                <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.06} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip formatter={(v: number) => [`${v} slot${v !== 1 ? "s" : ""}`, "Required"]} />
                <Bar dataKey="value" fill="#818cf8" radius={[4, 4, 0, 0]} name="Required" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Resource utilisation */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4 text-foreground/50" />Resource Utilisation — Allocations (±1yr)</h3>
          {allocLoading ? (
            <div className="flex items-center gap-2 text-xs text-foreground/40 py-6 justify-center"><Clock className="w-3.5 h-3.5 animate-spin" /> Loading…</div>
          ) : utilisationData.length === 0 ? (
            <p className="text-xs text-foreground/40 italic py-6 text-center">No allocation data yet. Assign resources to tasks in the Planner.</p>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={utilisationData} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
                <CartesianGrid horizontal={false} stroke="currentColor" strokeOpacity={0.06} />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} />
                <Tooltip formatter={(v: number) => [`${v} assignment${v !== 1 ? "s" : ""}`, "Used"]} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Assignments">
                  {utilisationData.map((entry, i) => <Cell key={i} fill={entry.colour} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Material totals table */}
      {materialTotals.length > 0 && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Package className="w-4 h-4 text-foreground/50" />Material Requirements — Upcoming Tasks</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-foreground/50">Material</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-foreground/50">Total qty</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-foreground/50">Unit</th>
                </tr>
              </thead>
              <tbody>
                {materialTotals.map(m => (
                  <tr key={`${m.name}__${m.unit}`} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-2 px-3 font-medium">{m.name}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{m.total % 1 === 0 ? m.total : m.total.toFixed(2)}</td>
                    <td className="py-2 px-3 text-foreground/60">{m.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {materialTotals.length === 0 && upcoming.length > 0 && (
        <Card className="p-5 text-center text-sm text-foreground/40">
          No material requirements entered on upcoming tasks yet. Add materials when editing tasks in the Planner tab.
        </Card>
      )}

      {/* Plan vs Actual variance charts */}
      {(() => {
        const withActuals = events.filter(e => !!e.actualStatus);
        if (withActuals.length === 0) return (
          <Card className="p-5 text-center text-sm text-foreground/40">
            <p className="font-medium text-foreground/60 mb-1">Plan vs Actual analytics will appear here</p>
            Record actuals on completed tasks in the Planning Status tab to start tracking planning accuracy.
          </Card>
        );

        // Date slip distribution
        const slipData: { label: string; count: number; fill: string }[] = [
          { label: "Early", count: 0, fill: "#60a5fa" },
          { label: "On time", count: 0, fill: "#86efac" },
          { label: "1–3d late", count: 0, fill: "#fcd34d" },
          { label: "4–7d late", count: 0, fill: "#fb923c" },
          { label: ">7d late", count: 0, fill: "#f87171" },
        ];
        let totalSlip = 0; let slipCount = 0;
        for (const e of withActuals) {
          if (!e.actualDate) continue;
          const slip = Math.round((new Date(e.actualDate + "T12:00:00").getTime() - new Date(e.eventDate.slice(0, 10) + "T12:00:00").getTime()) / 86400000);
          totalSlip += slip; slipCount++;
          if (slip < 0) slipData[0].count++;
          else if (slip === 0) slipData[1].count++;
          else if (slip <= 3) slipData[2].count++;
          else if (slip <= 7) slipData[3].count++;
          else slipData[4].count++;
        }
        const avgSlip = slipCount > 0 ? (totalSlip / slipCount).toFixed(1) : "—";

        // Resource variance by type
        type ResKey = "Tractors" | "Implements" | "Vehicles" | "Sprayers" | "Trailers" | "Staff";
        const resVariance: Record<ResKey, { planned: number; actual: number }> = {
          Tractors:   { planned: 0, actual: 0 }, Implements: { planned: 0, actual: 0 },
          Vehicles:   { planned: 0, actual: 0 }, Sprayers:   { planned: 0, actual: 0 },
          Trailers:   { planned: 0, actual: 0 }, Staff:      { planned: 0, actual: 0 },
        };
        for (const e of withActuals) {
          resVariance.Tractors.planned   += e.reqTractors;   resVariance.Tractors.actual   += e.actualTractors;
          resVariance.Implements.planned += e.reqImplements; resVariance.Implements.actual += e.actualImplements;
          resVariance.Vehicles.planned   += e.reqVehicles;   resVariance.Vehicles.actual   += e.actualVehicles;
          resVariance.Sprayers.planned   += e.reqSprayers;   resVariance.Sprayers.actual   += e.actualSprayers;
          resVariance.Trailers.planned   += e.reqTrailers;   resVariance.Trailers.actual   += e.actualTrailers;
          resVariance.Staff.planned      += e.reqStaff;      resVariance.Staff.actual      += e.actualStaff;
        }
        const resData = (Object.entries(resVariance) as [ResKey, { planned: number; actual: number }][])
          .filter(([, v]) => v.planned > 0 || v.actual > 0)
          .map(([name, v]) => ({ name, planned: v.planned, actual: v.actual }));

        // Outcome breakdown
        const outcomeCounts = [
          { name: "Completed", value: withActuals.filter(e => e.actualStatus === "completed").length, fill: "#86efac" },
          { name: "Partial", value: withActuals.filter(e => e.actualStatus === "partial").length, fill: "#fcd34d" },
          { name: "Abandoned", value: withActuals.filter(e => e.actualStatus === "abandoned").length, fill: "#f87171" },
        ].filter(o => o.value > 0);

        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <BarChart2 className="w-4 h-4 text-foreground/40" />
              <h3 className="text-sm font-semibold text-foreground/80">Plan vs Actual — {withActuals.length} task{withActuals.length !== 1 ? "s" : ""} recorded</h3>
              {slipCount > 0 && (
                <span className={cn("ml-auto text-xs font-bold px-2 py-0.5 rounded-full", Number(avgSlip) > 0 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700")}>
                  Avg slip: {Number(avgSlip) > 0 ? `+${avgSlip}d` : Number(avgSlip) < 0 ? `${avgSlip}d early` : "On time"}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-5">
                <h4 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-4">Date Slip Distribution</h4>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={slipData.filter(d => d.count > 0)} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
                    <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.06} />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip formatter={(v: number) => [`${v} task${v !== 1 ? "s" : ""}`, ""]} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Tasks">
                      {slipData.filter(d => d.count > 0).map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
              {resData.length > 0 ? (
                <Card className="p-5">
                  <h4 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-4">Resource Planned vs Actual (totals)</h4>
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={resData} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
                      <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.06} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="planned" fill="#a5b4fc" name="Planned" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="actual"  fill="#6366f1" name="Actual"  radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              ) : (
                <Card className="p-5">
                  <h4 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-4">Task Outcomes</h4>
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={outcomeCounts} layout="vertical" margin={{ left: 16, right: 16, top: 4, bottom: 4 }}>
                      <CartesianGrid horizontal={false} stroke="currentColor" strokeOpacity={0.06} />
                      <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                      <Tooltip formatter={(v: number) => [`${v} task${v !== 1 ? "s" : ""}`, ""]} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Tasks">
                        {outcomeCounts.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
