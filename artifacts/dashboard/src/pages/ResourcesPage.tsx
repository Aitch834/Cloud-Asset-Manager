import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/hooks/use-app-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Redirect } from "wouter";
import {
  Plus, Pencil, Archive, Tractor, Wrench, Truck, Droplets, Package, User,
  RotateCcw, X, ChevronDown, Download, CheckSquare, Square, Sparkles,
  ChevronLeft, ChevronRight, CalendarDays, AlertCircle, GripVertical, Trash2,
  Clock, ClipboardList, CheckCircle2, CircleDashed, BadgeCheck, Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { toast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
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
      }).then(r => r.json()),
    onSuccess: (result) => {
      const count = result.resources?.length ?? 0;
      queryClient.invalidateQueries({ queryKey: ["resources", farmId] });
      queryClient.invalidateQueries({ queryKey: ["resources-importable", farmId] });
      setSelected(new Set());
      onImported();
      toast({ title: `${count} resource${count !== 1 ? "s" : ""} imported` });
    },
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
      }).then(r => r.json());
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

function PlannerTab({ farmId, resources }: { farmId: number; resources: FarmResource[] }) {
  const queryClient = useQueryClient();
  const [weekBase, setWeekBase] = useState(() => weekStart(new Date()));
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);

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
    }).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resource-planner", farmId, fromDate] }),
    onError: () => toast({ title: "Failed to assign resource", variant: "destructive" }),
  });

  const removeMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/task-resource-allocations/${id}`, { method: "DELETE" }).then(r => r.json()),
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
          </div>
          <div className="flex items-center gap-4 text-xs text-foreground/50">
            <span>{totalTasks} task{totalTasks !== 1 ? "s" : ""}</span>
            {totalSlots > 0 && (
              <span className={cn("font-semibold", filledSlots === totalSlots ? "text-green-600" : "text-amber-600")}>
                {filledSlots}/{totalSlots} slots filled
              </span>
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
                <h3 className="font-bold text-xs text-foreground/60 uppercase tracking-wider mb-3">Resources</h3>
                {activeResources.length === 0 ? (
                  <p className="text-xs text-foreground/40 italic">No resources added yet.</p>
                ) : (
                  <div className="space-y-4">
                    {RESOURCE_TYPES.map(rt => {
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
  const [activeTab, setActiveTab] = useState<"resources" | "planner" | "status">("resources");
  const [showArchived, setShowArchived] = useState(false);

  const { data, isLoading } = useQuery<{ resources: FarmResource[] }>({
    queryKey: ["resources", farmId, showArchived],
    queryFn: () => fetch(`/api/farms/${farmId}/resources?showAll=${showArchived}`).then(r => r.json()),
  });

  const archiveMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/resources/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["resources", farmId] }); toast({ title: "Resource archived" }); },
  });

  const restoreMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/resources/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: true }),
    }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["resources", farmId] }); toast({ title: "Resource restored" }); },
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
        <div className="flex items-center gap-1 border-b border-border">
          {(["resources", "planner", "status"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-2.5 px-4 text-sm font-semibold border-b-2 transition-colors -mb-px",
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-foreground/50 hover:text-foreground"
              )}
            >
              {tab === "resources" ? "Resources" : tab === "planner" ? "Planner" : "Planning Status"}
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
        ) : (
          <PlanningStatusTab farmId={farmId} />
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

  const createMut = useMutation({
    mutationFn: (body: object) => fetch(`/api/farms/${farmId}/resources`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(r => r.json()),
    onSuccess: () => { onInvalidate(); setShowForm(false); toast({ title: "Resource added" }); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, ...body }: { id: number } & object) => fetch(`/api/farms/${farmId}/resources/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(r => r.json()),
    onSuccess: () => { onInvalidate(); setEditingResource(null); toast({ title: "Resource updated" }); },
  });

  const grouped = new Map<string, FarmResource[]>();
  for (const r of resources) {
    if (!grouped.has(r.type)) grouped.set(r.type, []);
    grouped.get(r.type)!.push(r);
  }
  const sortedGroups = [...grouped.entries()].sort(
    (a, b) => RESOURCE_TYPES.findIndex(t => t.value === a[0]) - RESOURCE_TYPES.findIndex(t => t.value === b[0])
  );

  return (
    <div className="space-y-6">
      <ImportPanel farmId={farmId} onImported={onInvalidate} />

      {/* Add button */}
      <div className="flex justify-end">
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
};

type PlanningStatus = "committed" | "planned" | "not_started";

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

  const { data: events = [], isLoading } = useQuery<PlannerEventRecord[]>({
    queryKey: ["planner-events-all", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/planner-events`).then(r => r.json()),
  });

  const commitMut = useMutation({
    mutationFn: ({ id, committed }: { id: number; committed: boolean }) =>
      fetch(`/api/farms/${farmId}/planner-events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reqCommitted: committed }),
      }).then(r => r.json()),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["planner-events-all", farmId] });
      toast({ title: vars.committed ? "Task committed ✓" : "Commitment removed" });
    },
    onError: () => toast({ title: "Failed to update task", variant: "destructive" }),
  });

  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);

  const upcoming = useMemo(() =>
    events
      .filter(e => new Date(e.eventDate) >= today)
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()),
    [events, today]
  );

  const notStarted = upcoming.filter(e => getPlanningStatus(e) === "not_started");
  const planned    = upcoming.filter(e => getPlanningStatus(e) === "planned");
  const committed  = upcoming.filter(e => getPlanningStatus(e) === "committed");

  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-foreground/50 py-10">
        <Clock className="w-4 h-4 animate-spin" /> Loading tasks…
      </div>
    );
  }

  if (upcoming.length === 0) {
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

  function EventRow({ e }: { e: PlannerEventRecord }) {
    const status = getPlanningStatus(e);
    const pending = commitMut.isPending && (commitMut.variables as { id: number } | undefined)?.id === e.id;

    return (
      <div className="flex items-start gap-3 px-4 py-3 border-b border-border last:border-0">
        <div className={cn("w-1 self-stretch rounded-full flex-shrink-0 mt-0.5",
          status === "committed" ? "bg-green-400" : status === "planned" ? "bg-amber-400" : "bg-red-300"
        )} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium leading-snug">{e.title}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-foreground/50">{fmtDate(e.eventDate)}</span>
            <span className="text-foreground/30 text-xs">·</span>
            <ReqSummary e={e} />
          </div>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2">
          {status === "committed" ? (
            <>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                <BadgeCheck className="w-3.5 h-3.5" /> Committed
              </span>
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
        Showing upcoming tasks from today onwards. Enter resource and material requirements on a task, then click <strong>Commit</strong> to mark it as fully planned. Committed tasks will not slip through the net.
      </p>

      <div className="space-y-4">
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
      </div>
    </div>
  );
}
