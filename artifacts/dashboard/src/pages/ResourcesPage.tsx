import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/hooks/use-app-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Redirect } from "wouter";
import {
  Plus, Pencil, Archive, Tractor, Wrench, Truck, Droplets, Package, User,
  RotateCcw, X, ChevronDown,
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

const RESOURCE_TYPES = [
  { value: "tractor",   label: "Tractor",   icon: Tractor },
  { value: "implement", label: "Implement",  icon: Wrench },
  { value: "vehicle",   label: "Vehicle",    icon: Truck },
  { value: "sprayer",   label: "Sprayer",    icon: Droplets },
  { value: "trailer",   label: "Trailer",    icon: Package },
  { value: "staff",     label: "Staff / Contractor", icon: User },
  { value: "other",     label: "Other",      icon: Package },
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

function getTypeInfo(type: string) {
  return RESOURCE_TYPES.find(t => t.value === type) ?? { label: type, icon: Package };
}

function getColourBg(colour: string) {
  return COLOUR_OPTIONS.find(c => c.value === colour)?.bg ?? "bg-slate-500";
}

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
        <h3 className="font-bold text-sm text-foreground">{initial?.id ? "Edit Resource" : "Add New Resource"}</h3>
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
              Register your tractors, implements, vehicles and staff, then assign them to tasks in the Week Ahead Gantt view.
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
              Add resource
            </button>
          </div>
        </div>

        {/* Add form */}
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
          <div className="rounded-2xl border-2 border-dashed border-border bg-muted/20 py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Tractor className="w-7 h-7 text-foreground/20" />
            </div>
            <h3 className="font-bold text-foreground/50 mb-1">No resources yet</h3>
            <p className="text-sm text-foreground/35 max-w-sm mx-auto mb-5">
              Add your tractors, implements, vehicles and staff to start assigning them to tasks in the Week Ahead planner.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add first resource
            </button>
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
