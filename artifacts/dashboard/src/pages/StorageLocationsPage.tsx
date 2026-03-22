import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Warehouse, Plus, Pencil, Trash2, CheckCircle, XCircle, MapPin, QrCode, Loader2, Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/hooks/use-app-store";
import { useToast } from "@/hooks/use-toast";
import { StorageLocationMapPicker } from "@/components/storage/StorageLocationMapPicker";

interface LatLng { lat: number; lng: number; }

interface StorageLocation {
  id: number;
  name: string;
  type: string;
  capacityTonnes?: string | null;
  locationDescription?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  notes?: string | null;
  storageCode?: string | null;
  isActive: boolean;
  createdAt: string;
}

const LOCATION_TYPES: { value: string; label: string }[] = [
  { value: "grain_store", label: "Grain Store" },
  { value: "silo", label: "Silo" },
  { value: "bin", label: "Bin" },
  { value: "temporary", label: "Temporary / Field Heap" },
  { value: "merchant", label: "Merchant / Off-farm" },
  { value: "cold_store", label: "Cold Store" },
  { value: "other", label: "Other" },
];

function typeLabel(type: string) {
  return LOCATION_TYPES.find((t) => t.value === type)?.label ?? type;
}

function typeBadgeVariant(type: string): "default" | "secondary" | "outline" {
  if (type === "grain_store" || type === "silo") return "default";
  if (type === "bin") return "secondary";
  return "outline";
}

function locToLatLng(loc: StorageLocation): LatLng | null {
  if (loc.latitude && loc.longitude) {
    return { lat: parseFloat(loc.latitude), lng: parseFloat(loc.longitude) };
  }
  return null;
}

const emptyForm = () => ({
  name: "",
  type: "grain_store",
  capacityTonnes: "",
  locationDescription: "",
  notes: "",
  isActive: true,
  pin: null as LatLng | null,
});

export default function StorageLocationsPage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [qrLocation, setQrLocation] = useState<StorageLocation | null>(null);
  const [isSavingStorageCode, setIsSavingStorageCode] = useState(false);

  const locationsQ = useQuery({
    queryKey: ["storage-locations", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/storage-locations`).then((r) => r.json()),
    enabled: !!farmId,
  });

  const locations: StorageLocation[] = locationsQ.data?.records ?? [];

  const saveMut = useMutation({
    mutationFn: async (body: Omit<StorageLocation, "id" | "createdAt">) => {
      const url = editId
        ? `/api/farms/${farmId}/storage-locations/${editId}`
        : `/api/farms/${farmId}/storage-locations`;
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["storage-locations", farmId] });
      setDialogOpen(false);
      setEditId(null);
      setForm(emptyForm());
      toast({ title: editId ? "Location updated" : "Location added", description: "Storage location saved." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save storage location.", variant: "destructive" });
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/farms/${farmId}/storage-locations/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["storage-locations", farmId] });
      setDeleteId(null);
      toast({ title: "Deleted", description: "Storage location removed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete storage location.", variant: "destructive" });
    },
  });

  function openAdd() {
    setEditId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  }

  function openEdit(loc: StorageLocation) {
    setEditId(loc.id);
    setForm({
      name: loc.name,
      type: loc.type,
      capacityTonnes: loc.capacityTonnes ?? "",
      locationDescription: loc.locationDescription ?? "",
      notes: loc.notes ?? "",
      isActive: loc.isActive,
      pin: locToLatLng(loc),
    });
    setDialogOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveMut.mutate({
      name: form.name,
      type: form.type,
      capacityTonnes: form.capacityTonnes || null,
      locationDescription: form.locationDescription || null,
      latitude: form.pin ? String(form.pin.lat) : null,
      longitude: form.pin ? String(form.pin.lng) : null,
      notes: form.notes || null,
      isActive: form.isActive,
    } as Omit<StorageLocation, "id" | "createdAt">);
  }

  function openMapFor(loc: StorageLocation) {
    const pin = locToLatLng(loc);
    if (!pin) return;
    window.open(
      `https://www.openstreetmap.org/?mlat=${pin.lat}&mlon=${pin.lng}#map=17/${pin.lat}/${pin.lng}`,
      "_blank",
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Warehouse className="h-7 w-7 text-amber-600" />
            <div>
              <h1 className="text-2xl font-bold">Storage Locations</h1>
              <p className="text-sm text-muted-foreground">
                Manage on-farm and off-farm grain stores, silos and other storage facilities
              </p>
            </div>
          </div>
          <Button onClick={openAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Location
          </Button>
        </div>

        {locationsQ.isLoading && (
          <p className="text-muted-foreground text-sm">Loading storage locations…</p>
        )}

        {!locationsQ.isLoading && locations.length === 0 && (
          <div className="border rounded-xl p-12 text-center text-muted-foreground">
            <Warehouse className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No storage locations yet. Click <strong>Add Location</strong> to create your first entry.</p>
          </div>
        )}

        {locations.length > 0 && (
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium">Type</th>
                  <th className="text-left px-4 py-3 font-medium">Capacity (t)</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Location</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">GPS</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {locations.map((loc) => {
                  const pin = locToLatLng(loc);
                  return (
                    <tr key={loc.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{loc.name}</td>
                      <td className="px-4 py-3">
                        <Badge variant={typeBadgeVariant(loc.type)}>{typeLabel(loc.type)}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {loc.capacityTonnes ? `${loc.capacityTonnes} t` : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell max-w-xs truncate">
                        {loc.locationDescription || "—"}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {pin ? (
                          <button
                            onClick={() => openMapFor(loc)}
                            title="View on OpenStreetMap"
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline font-mono"
                          >
                            <MapPin className="h-3 w-3 shrink-0" />
                            {pin.lat.toFixed(4)}, {pin.lng.toFixed(4)}
                          </button>
                        ) : (
                          <span className="text-muted-foreground text-xs">Not set</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {loc.isActive ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <XCircle className="h-4 w-4" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <Button variant="ghost" size="icon" title="QR Code" onClick={() => setQrLocation(loc)}>
                            <QrCode className="h-4 w-4 text-teal-600" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(loc)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(loc.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {qrLocation && (() => {
          const autoCode = `STG-${String(qrLocation.id).padStart(4, "0")}`;
          const displayCode = qrLocation.storageCode || null;
          const saveStorageCode = async (code: string) => {
            setIsSavingStorageCode(true);
            try {
              await fetch(`/api/farms/${farmId}/storage-locations/${qrLocation.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ storageCode: code }) });
              qc.invalidateQueries({ queryKey: ["storage-locations", farmId] });
              setQrLocation(prev => prev ? { ...prev, storageCode: code } : null);
            } finally { setIsSavingStorageCode(false); }
          };
          return (
            <Dialog open onOpenChange={o => { if (!o) setQrLocation(null); }}>
              <DialogContent style={{ maxWidth: "22rem" }} aria-describedby={undefined}>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2"><QrCode className="w-4 h-4 text-teal-600" /> Storage Location QR Label</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4 py-2">
                  <p className="text-xs text-muted-foreground font-medium">{qrLocation.name}</p>
                  {displayCode ? (
                    <>
                      <span className="font-mono text-lg font-bold tracking-widest text-teal-700">{displayCode}</span>
                      <QRCodeSVG value={displayCode} size={180} bgColor="#ffffff" fgColor="#0f766e" level="M" />
                      <p className="text-xs text-muted-foreground text-center">Fix to the store entrance so field workers can scan on arrival to log deliveries and stock movements.</p>
                      <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2"><Printer className="w-3.5 h-3.5" /> Print Label</Button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center w-[180px] h-[180px] border-2 border-dashed border-muted-foreground/30 rounded-lg">
                        <QrCode className="w-16 h-16 text-muted-foreground/30" />
                      </div>
                      <p className="text-sm text-muted-foreground text-center">No QR code yet. Assign code <strong className="font-mono">{autoCode}</strong> to this location.</p>
                      <Button onClick={() => saveStorageCode(autoCode)} disabled={isSavingStorageCode} className="gap-2">
                        {isSavingStorageCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                        Generate QR Code
                      </Button>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          );
        })()}

        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditId(null); setForm(emptyForm()); } }}>
          <DialogContent style={{ maxWidth: 620 }}>
            <DialogHeader>
              <DialogTitle>{editId ? "Edit Storage Location" : "Add Storage Location"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-1">
                <Label>Name <span className="text-destructive">*</span></Label>
                <Input
                  required
                  placeholder="e.g. Grain Store 1, North Silo, Bin 3"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <Label>Type <span className="text-destructive">*</span></Label>
                <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATION_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Capacity (tonnes)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="e.g. 500"
                  value={form.capacityTonnes}
                  onChange={(e) => setForm((f) => ({ ...f, capacityTonnes: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <Label>Location description</Label>
                <Input
                  placeholder="e.g. North yard, adjacent to main barn"
                  value={form.locationDescription}
                  onChange={(e) => setForm((f) => ({ ...f, locationDescription: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  GPS Pin Location
                </Label>
                <StorageLocationMapPicker
                  key={dialogOpen ? "open" : "closed"}
                  value={form.pin}
                  onChange={(pin) => setForm((f) => ({ ...f, pin }))}
                />
              </div>

              <div className="space-y-1">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Any additional details, ventilation type, drying equipment, etc."
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="h-4 w-4"
                />
                <Label htmlFor="isActive" className="cursor-pointer">Active (available for harvest transport runs)</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saveMut.isPending}>
                  {saveMut.isPending ? "Saving…" : editId ? "Save Changes" : "Add Location"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteId !== null} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
          <DialogContent style={{ maxWidth: 400 }}>
            <DialogHeader>
              <DialogTitle>Delete Storage Location</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this storage location? This cannot be undone.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button
                variant="destructive"
                disabled={deleteMut.isPending}
                onClick={() => deleteId !== null && deleteMut.mutate(deleteId)}
              >
                {deleteMut.isPending ? "Deleting…" : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
