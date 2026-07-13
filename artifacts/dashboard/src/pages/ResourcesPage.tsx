import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/hooks/use-app-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Redirect } from "wouter";
import {
  Plus, Pencil, Archive, Tractor, Wrench, Truck, Droplets, Package, User,
  RotateCcw, X, ChevronDown, Download, CheckSquare, Square, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

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

function getTypeInfo(type: string) {
  return RESOURCE_TYPES.find(t => t.value === type) ?? { label: type, icon: Package };
}

function getColourBg(colour: string) {
  return COLOUR_OPTIONS.find(c => c.value === colour)?.bg ?? "bg-slate-500";
}

// ─── Import Panel ────────────────────────────────────────────────────────────

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

  if (dismissed) return null;
  if (isLoading) return null;

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
                {allItems.length} item{allItems.length !== 1 ? "s" : ""} found in your Equipment Register and Staff list — tick to add them as resources.
              </p>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="w-6 h-6 flex items-center justify-center rounded-full text-foreground/30 hover:text-foreground hover:bg-muted transition-colors flex-shrink-0 mt-0.5"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Select all toggle */}
        <button
          onClick={toggleAll}
          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 mb-3 transition-colors"
        >
          {allSelected
            ? <CheckSquare className="w-3.5 h-3.5" />
            : <Square className="w-3.5 h-3.5" />}
          {allSelected ? "Deselect all" : "Select all"}
        </button>

        <div className="space-y-4">
          {/* Equipment section */}
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
                    <button
                      key={k}
                      onClick={() => toggleItem(item)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all",
                        isChecked
                          ? "border-indigo-300 bg-indigo-50 shadow-sm"
                          : "border-border bg-white hover:border-indigo-200 hover:bg-indigo-50/30"
                      )}
                    >
                      <div className={cn("w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0", colourBg + "/10")}>
                        <Icon className={cn("w-3.5 h-3.5", colourBg.replace("bg-", "text-"))} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
                        {item.description && (
                          <p className="text-[10px] text-foreground/40 truncate">{item.description}</p>
                        )}
                      </div>
                      <div className={cn(
                        "w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors",
                        isChecked ? "border-indigo-500 bg-indigo-500" : "border-border"
                      )}>
                        {isChecked && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Staff section */}
          {staffItems.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 mb-2">Staff Members</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {staffItems.map(item => {
                  const k = key(item);
                  const isChecked = selected.has(k);
                  return (
                    <button
                      key={k}
                      onClick={() => toggleItem(item)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all",
                        isChecked
                          ? "border-indigo-300 bg-indigo-50 shadow-sm"
                          : "border-border bg-white hover:border-indigo-200 hover:bg-indigo-50/30"
                      )}
                    >
                      <div className="w-7 h-7 rounded-md bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <User className="w-3.5 h-3.5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
                        {item.description && (
                          <p className="text-[10px] text-foreground/40 truncate">{item.description}</p>
                        )}
                      </div>
                      <div className={cn(
                        "w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors",
                        isChecked ? "border-indigo-500 bg-indigo-500" : "border-border"
                      )}>
                        {isChecked && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer action */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-indigo-100">
          <p className="text-xs text-foreground/40">
            {selected.size > 0 ? `${selected.size} selected` : "Select items to import"}
          </p>
          <button
            onClick={handleImport}
            disabled={selected.size === 0 || importMut.isPending}
            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            {importMut.isPending ? "Importing…" : `Import ${selected.size > 0 ? selected.size : ""} selected`}
          </button>
        </div>
      </div>
    </Card>
  );
}

// ─── Resource Card ────────────────────────────────────────────────────────────

function ResourceCard({
  resource, onEdit, onArchive, onRestore,
}: {
  resource: FarmResource;
  onEdit: (r: FarmResource) => void;
  onArchive: (id: number) => void;
  onRestore: (id: number) => void;
}) {
  const { icon: Icon, label } = getTypeInfo(resource.type);
  const colourBg = getColourBg(resource.colour);
  return (
    <div className={cn(
      "group relative flex items-start gap-3 rounded-xl border bg-white p-3.5 transition-all hover:shadow-md",
      resource.isActive ? "border-border hover:border-border/80" : "border-dashed border-border/50 opacity-60"
    )}>
      <div className={cn("w-1.5 self-stretch rounded-full flex-shrink-0", colourBg)} />
      <div className={cn("flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center", colourBg + "/10")}>
        <Icon className={cn("w-4.5 h-4.5", colourBg.replace("bg-", "text-"))} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm text-foreground truncate">{resource.name}</p>
          {!resource.isActive && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-muted text-foreground/40 flex-shrink-0">Archived</span>
          )}
        </div>
        <p className="text-[11px] text-foreground/50 font-medium mt-0.5">{label}</p>
        {resource.description && (
          <p className="text-xs text-foreground/50 mt-1 leading-relaxed line-clamp-2">{resource.description}</p>
        )}
      </div>
      <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {resource.isActive ? (
          <>
            <button
              onClick={() => onEdit(resource)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-foreground/40 hover:text-foreground transition-colors"
              title="Edit"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onArchive(resource.id)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-foreground/40 hover:text-red-500 transition-colors"
              title="Archive"
            >
              <Archive className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <button
            onClick={() => onRestore(resource.id)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-foreground/40 hover:text-green-600 transition-colors"
            title="Restore"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Resource Form ────────────────────────────────────────────────────────────

function ResourceForm({
  initial, onSave, onCancel, isPending,
}: {
  initial?: Partial<FarmResource>;
  onSave: (data: { name: string; type: string; description: string; colour: string }) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
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
        <button onClick={onCancel} className="w-6 h-6 flex items-center justify-center rounded-full text-foreground/30 hover:text-foreground hover:bg-muted transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-foreground/70 mb-1.5">Name *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. John Deere 6R 155"
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground/70 mb-1.5">Type *</label>
          <div className="relative">
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="w-full appearance-none rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 pr-8"
            >
              {RESOURCE_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground/70 mb-1.5">Colour</label>
          <div className="flex flex-wrap gap-2">
            {COLOUR_OPTIONS.map(c => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColour(c.value)}
                className={cn(
                  "w-7 h-7 rounded-full transition-all",
                  c.bg,
                  colour === c.value ? "ring-2 ring-offset-2 ring-foreground scale-110" : "opacity-60 hover:opacity-100"
                )}
                title={c.label}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground/70 mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Optional notes (e.g. reg number, serial, spec details)"
            rows={2}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 bg-primary text-primary-foreground text-sm font-semibold py-2 px-4 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {isPending ? "Saving…" : initial?.id ? "Save changes" : "Add resource"}
          </button>
          <button type="button" onClick={onCancel} className="text-sm font-semibold py-2 px-4 rounded-lg border border-border hover:bg-muted transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ResourcesPage() {
  const { farmId } = useAppStore();
  if (!farmId) return <Redirect href="/select" />;

  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState<FarmResource | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const { data, isLoading } = useQuery<{ resources: FarmResource[] }>({
    queryKey: ["resources", farmId, showArchived],
    queryFn: () => fetch(`/api/farms/${farmId}/resources?showAll=${showArchived}`).then(r => r.json()),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["resources", farmId] });

  const createMut = useMutation({
    mutationFn: (body: object) => fetch(`/api/farms/${farmId}/resources`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(r => r.json()),
    onSuccess: () => { invalidate(); setShowForm(false); toast({ title: "Resource added" }); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, ...body }: { id: number } & object) => fetch(`/api/farms/${farmId}/resources/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(r => r.json()),
    onSuccess: () => { invalidate(); setEditingResource(null); toast({ title: "Resource updated" }); },
  });

  const archiveMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/resources/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { invalidate(); toast({ title: "Resource archived" }); },
  });

  const restoreMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/resources/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: true }),
    }).then(r => r.json()),
    onSuccess: () => { invalidate(); toast({ title: "Resource restored" }); },
  });

  const resources = data?.resources ?? [];

  const grouped = new Map<string, FarmResource[]>();
  const typeOrder = RESOURCE_TYPES.map(t => t.value);
  for (const r of resources) {
    if (!grouped.has(r.type)) grouped.set(r.type, []);
    grouped.get(r.type)!.push(r);
  }
  const typeOrderStr: string[] = [...typeOrder];
  const sortedGroups = [...grouped.entries()].sort(
    (a, b) => (typeOrderStr.indexOf(a[0]) ?? 99) - (typeOrderStr.indexOf(b[0]) ?? 99)
  );

  const totalActive = resources.filter(r => r.isActive).length;

  return (
    <AppLayout title="Resource Planner">
      <div className="space-y-6 max-w-5xl">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm text-foreground/50 mt-0.5">
              Assign your tractors, implements, vehicles and staff to tasks in the Week Ahead planner.
            </p>
            {totalActive > 0 && (
              <p className="text-xs text-foreground/40 mt-1">{totalActive} active resource{totalActive !== 1 ? "s" : ""}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowArchived(p => !p)}
              className={cn(
                "text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors",
                showArchived ? "bg-muted text-foreground border-border" : "text-foreground/50 border-transparent hover:bg-muted/50"
              )}
            >
              {showArchived ? "Hide archived" : "Show archived"}
            </button>
            <button
              onClick={() => { setEditingResource(null); setShowForm(true); }}
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add custom
            </button>
          </div>
        </div>

        {/* Import panel — always shown while importable items exist */}
        <ImportPanel farmId={farmId} onImported={invalidate} />

        {/* Manual add form */}
        {showForm && !editingResource && (
          <ResourceForm
            onSave={data => createMut.mutate(data)}
            onCancel={() => setShowForm(false)}
            isPending={createMut.isPending}
          />
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-16 text-foreground/30 text-sm">Loading resources…</div>
        )}

        {/* Empty state */}
        {!isLoading && resources.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-border bg-muted/20 py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Tractor className="w-7 h-7 text-foreground/20" />
            </div>
            <h3 className="font-bold text-foreground/50 mb-1">No resources yet</h3>
            <p className="text-sm text-foreground/35 max-w-xs mx-auto mb-1">
              Import from your Equipment Register and Staff list above, or add a custom resource.
            </p>
          </div>
        )}

        {/* Grouped resource lists */}
        {sortedGroups.map(([type, items]) => {
          const { label, icon: Icon } = getTypeInfo(type);
          const active = items.filter(r => r.isActive);
          const archived = items.filter(r => !r.isActive);
          const displayItems = showArchived ? items : active;
          if (displayItems.length === 0) return null;
          return (
            <div key={type}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-4 h-4 text-foreground/40" />
                <h2 className="font-bold text-sm text-foreground/70">{label}s</h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-foreground/50">{active.length}</span>
                {archived.length > 0 && showArchived && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted/50 text-foreground/30">{archived.length} archived</span>
                )}
              </div>

              {/* Edit form for item in this group */}
              {editingResource && items.some(i => i.id === editingResource.id) && (
                <div className="mb-3">
                  <ResourceForm
                    initial={editingResource}
                    onSave={d => updateMut.mutate({ id: editingResource.id, ...d })}
                    onCancel={() => setEditingResource(null)}
                    isPending={updateMut.isPending}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {displayItems.map(r => (
                  <ResourceCard
                    key={r.id}
                    resource={r}
                    onEdit={res => { setEditingResource(res); setShowForm(false); }}
                    onArchive={id => archiveMut.mutate(id)}
                    onRestore={id => restoreMut.mutate(id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
