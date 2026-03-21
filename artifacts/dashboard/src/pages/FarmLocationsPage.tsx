import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { StorageLocationMapPicker } from "@/components/storage/StorageLocationMapPicker";
import {
  MapPin, Plus, Pencil, Trash2, Search, Building2, Warehouse, FlaskConical, Tractor, TreePine, Users, LayoutGrid, Map,
} from "lucide-react";
import { Link } from "wouter";

interface FarmLocation {
  id: number;
  farmId: number;
  name: string;
  locationType: string;
  description: string | null;
  notes: string | null;
  isActive: boolean;
  latitude: number | null;
  longitude: number | null;
}

const LOCATION_TYPES = [
  { value: "livestock_building", label: "Livestock Building", icon: Building2, colour: "bg-blue-100 text-blue-800" },
  { value: "crop_store", label: "Crop & Feed Store", icon: Warehouse, colour: "bg-yellow-100 text-yellow-800" },
  { value: "equipment_store", label: "Equipment & Workshop", icon: Tractor, colour: "bg-orange-100 text-orange-800" },
  { value: "chemical_store", label: "Chemical & Fuel Store", icon: FlaskConical, colour: "bg-red-100 text-red-800" },
  { value: "outdoor_area", label: "Outdoor Area / Yard", icon: TreePine, colour: "bg-green-100 text-green-800" },
  { value: "welfare_facility", label: "Welfare Facility", icon: Users, colour: "bg-purple-100 text-purple-800" },
  { value: "office", label: "Office / Farm Building", icon: LayoutGrid, colour: "bg-slate-100 text-slate-700" },
  { value: "other", label: "Other", icon: MapPin, colour: "bg-gray-100 text-gray-700" },
];

const typeMap = Object.fromEntries(LOCATION_TYPES.map(t => [t.value, t]));

interface LatLng { lat: number; lng: number }

const EMPTY_FORM = {
  name: "",
  locationType: "",
  description: "",
  notes: "",
  isActive: true,
  pin: null as LatLng | null,
};

export default function FarmLocationsPage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<FarmLocation | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showMap, setShowMap] = useState(false);

  const { data: locations = [], isLoading } = useQuery<FarmLocation[]>({
    queryKey: ["farm-locations", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/farm-locations`).then(r => r.json()),
    enabled: !!farmId,
  });

  const createMut = useMutation({
    mutationFn: (body: typeof EMPTY_FORM) =>
      fetch(`/api/farms/${farmId}/farm-locations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: body.name,
          locationType: body.locationType,
          description: body.description,
          notes: body.notes,
          isActive: body.isActive,
          latitude: body.pin?.lat ?? null,
          longitude: body.pin?.lng ?? null,
        }),
      }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["farm-locations", farmId] });
      closeDialog();
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: typeof EMPTY_FORM }) =>
      fetch(`/api/farms/${farmId}/farm-locations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: body.name,
          locationType: body.locationType,
          description: body.description,
          notes: body.notes,
          isActive: body.isActive,
          latitude: body.pin?.lat ?? null,
          longitude: body.pin?.lng ?? null,
        }),
      }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["farm-locations", farmId] });
      closeDialog();
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/farms/${farmId}/farm-locations/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["farm-locations", farmId] });
      setDeleteId(null);
    },
  });

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowMap(false);
    setDialogOpen(true);
  }

  function openEdit(loc: FarmLocation) {
    setEditing(loc);
    setForm({
      name: loc.name,
      locationType: loc.locationType,
      description: loc.description ?? "",
      notes: loc.notes ?? "",
      isActive: loc.isActive,
      pin: loc.latitude != null && loc.longitude != null
        ? { lat: loc.latitude, lng: loc.longitude }
        : null,
    });
    setShowMap(loc.latitude != null && loc.longitude != null);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowMap(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      updateMut.mutate({ id: editing.id, body: form });
    } else {
      createMut.mutate(form);
    }
  }

  const filtered = locations.filter(loc => {
    if (!showInactive && !loc.isActive) return false;
    if (filterType && loc.locationType !== filterType) return false;
    if (search) {
      const s = search.toLowerCase();
      return loc.name.toLowerCase().includes(s) || (loc.description ?? "").toLowerCase().includes(s);
    }
    return true;
  });

  const activeCount = locations.filter(l => l.isActive).length;
  const pinnedCount = locations.filter(l => l.latitude != null).length;
  const byType = LOCATION_TYPES.map(t => ({
    ...t,
    count: locations.filter(l => l.locationType === t.value && l.isActive).length,
  })).filter(t => t.count > 0);

  if (!farmId) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64 text-foreground/50">Please select a farm to manage locations.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary" />
              Farm Buildings &amp; Areas
            </h1>
            <p className="text-sm text-foreground/60 mt-1">
              Define the buildings, yards, and areas on your farm. These are used across Cleaning, Pest Control, Risk Assessments, and COSHH to build a complete location history.
            </p>
          </div>
          <div className="flex gap-2">
            {pinnedCount > 0 && (
              <Link href="/farm-map">
                <Button variant="outline" className="gap-2">
                  <Map className="w-4 h-4" /> View Map
                </Button>
              </Link>
            )}
            <Button onClick={openAdd} className="gap-2">
              <Plus className="w-4 h-4" /> Add Location
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-2xl font-bold text-foreground">{activeCount}</div>
            <div className="text-sm text-foreground/60">Active Locations</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-foreground">{pinnedCount}</div>
            <div className="text-sm text-foreground/60">Map Pins Set</div>
          </Card>
          {byType.slice(0, 2).map(t => (
            <Card key={t.value} className="p-4">
              <div className="text-2xl font-bold text-foreground">{t.count}</div>
              <div className="text-sm text-foreground/60">{t.label}</div>
            </Card>
          ))}
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <Input
                placeholder="Search locations…"
                className="pl-9 bg-white"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
            >
              <option value="">All types</option>
              {LOCATION_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-foreground/70 cursor-pointer whitespace-nowrap">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={e => setShowInactive(e.target.checked)}
                className="rounded"
              />
              Show inactive
            </label>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-foreground/50">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-foreground/50">
              {locations.length === 0
                ? "No locations defined yet. Add your first farm building or area to get started."
                : "No locations match your search."}
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map(loc => {
                const t = typeMap[loc.locationType];
                const Icon = t?.icon ?? MapPin;
                const hasPIn = loc.latitude != null;
                return (
                  <div key={loc.id} className="p-4 flex items-start gap-4 hover:bg-muted/20 transition-colors">
                    <div className={`p-2 rounded-lg ${t?.colour ?? "bg-gray-100"} flex-shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground">{loc.name}</span>
                        <Badge variant="outline" className="text-xs">{t?.label ?? loc.locationType}</Badge>
                        {hasPIn && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <MapPin className="w-3 h-3" /> Pinned
                          </Badge>
                        )}
                        {!loc.isActive && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                      </div>
                      {loc.description && (
                        <p className="text-sm text-foreground/60 mt-0.5 truncate">{loc.description}</p>
                      )}
                      {hasPIn && (
                        <p className="text-xs text-foreground/40 mt-0.5">
                          {loc.latitude!.toFixed(5)}, {loc.longitude!.toFixed(5)}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(loc)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteId(loc.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={o => { if (!o) closeDialog(); }}>
        <DialogContent style={{ maxWidth: "42rem" }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              {editing ? "Edit Location" : "Add Farm Location"}
            </DialogTitle>
            <DialogDescription>
              Define a building or area on your farm. Once added, it will appear in dropdown selectors across Cleaning, Pest Control, COSHH, and Risk Assessments.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div>
              <label className="text-sm font-medium text-foreground/70 mb-1 block">
                Location Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. Dairy Parlour, Cattle Shed 2, Grain Store"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/70 mb-1 block">
                Location Type <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                value={form.locationType}
                onChange={e => setForm(f => ({ ...f, locationType: e.target.value }))}
                required
              >
                <option value="">Select type…</option>
                {LOCATION_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/70 mb-1 block">Description</label>
              <Input
                placeholder="e.g. 200-cow loose housing, cleaned between groups"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/70 mb-1 block">Notes</label>
              <Textarea
                rows={2}
                placeholder="Any additional information about this location…"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>

            {/* Map pin section */}
            <div className="border rounded-lg overflow-hidden">
              <button
                type="button"
                className="w-full flex items-center justify-between px-3 py-2.5 bg-muted/40 hover:bg-muted/60 transition-colors text-sm font-medium text-foreground/70"
                onClick={() => setShowMap(v => !v)}
              >
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Map pin (optional)
                  {form.pin && (
                    <span className="text-xs text-primary font-normal">
                      — {form.pin.lat.toFixed(5)}, {form.pin.lng.toFixed(5)}
                    </span>
                  )}
                </span>
                <span className="text-foreground/40 text-xs">{showMap ? "▲ Hide" : "▼ Show"}</span>
              </button>
              {showMap && (
                <div className="p-3">
                  <p className="text-xs text-foreground/50 mb-2">
                    Click on the map to drop a pin. Drag the pin to adjust its position. Use the locate button to jump to your current GPS position.
                  </p>
                  <StorageLocationMapPicker
                    value={form.pin}
                    onChange={pin => setForm(f => ({ ...f, pin }))}
                    mapHeight={260}
                  />
                </div>
              )}
            </div>

            {editing && (
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="rounded"
                />
                Active (appears in dropdowns)
              </label>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
                {editing ? "Save Changes" : "Add Location"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Location?</DialogTitle>
            <DialogDescription>
              This will remove the location from the registry. Existing records that referenced this location by name will not be affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteId !== null && deleteMut.mutate(deleteId)}
              disabled={deleteMut.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
