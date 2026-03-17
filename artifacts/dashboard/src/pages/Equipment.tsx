import { useState, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
  DialogFooter, DialogTrigger
} from "@/components/ui/dialog";
import { useAppStore } from "@/hooks/use-app-store";
import { useEquipment, useAddEquipment } from "@/hooks/use-equipment";
import { Plus, Search, Tractor, Calendar, Camera, X, Pencil, Loader2, Printer } from "lucide-react";
import { useForm } from "react-hook-form";
import { Redirect } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getListEquipmentQueryKey } from "@workspace/api-client-react/src/generated/api";
import { useToast } from "@/hooks/use-toast";
import { printHtml } from "@/lib/utils";

interface EquipmentRecord {
  id: number;
  name?: string;
  type?: string;
  make?: string;
  model?: string;
  serialNumber?: string;
  registrationNumber?: string;
  yearOfManufacture?: number;
  location?: string;
  status?: string;
  notes?: string;
  photos?: string;
  nextCalibrationDue?: string;
  isActive?: boolean;
}

interface EquipmentFormData {
  name: string;
  type: string;
  make: string;
  model: string;
  serialNumber: string;
  registrationNumber: string;
  yearOfManufacture: string;
  location: string;
  notes: string;
}

const MAX_PHOTOS = 5;

function parsePhotos(raw?: string): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw) as string[]; } catch { return []; }
}

function PhotoUploader({
  photos,
  onChange,
}: {
  photos: string[];
  onChange: (next: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = MAX_PHOTOS - photos.length;
    const toProcess = Array.from(files).slice(0, remaining);
    toProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        onChange([...photos, dataUrl]);
      };
      reader.readAsDataURL(file);
    });
  };

  const remove = (i: number) => onChange(photos.filter((_, idx) => idx !== i));

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {photos.map((src, i) => (
          <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group">
            <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}
        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-20 h-20 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-foreground/40 hover:text-primary/60 transition-colors"
          >
            <Camera className="w-5 h-5" />
            <span className="text-xs">Add</span>
          </button>
        )}
      </div>
      <p className="text-xs text-foreground/40">
        Up to {MAX_PHOTOS} photos. JPG, PNG accepted.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}

interface FarmRecord { name?: string; address?: string; postcode?: string; cphNumber?: string; }

export default function EquipmentPage() {
  const { farmId } = useAppStore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [managingItem, setManagingItem] = useState<EquipmentRecord | null>(null);
  const [addPhotos, setAddPhotos] = useState<string[]>([]);
  const [editPhotos, setEditPhotos] = useState<string[]>([]);
  const [printOpen, setPrintOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading } = useEquipment(farmId ?? 0);

  const { data: farmData } = useQuery<{ record: FarmRecord }>({
    queryKey: ["farm-for-print", farmId],
    queryFn: async () => {
      const r = await fetch(`/api/farms/${farmId}`);
      return r.json();
    },
    enabled: !!farmId,
  });
  const farm = farmData?.record;
  const { mutate: createEquip, isPending } = useAddEquipment(farmId ?? 0);
  const { register, handleSubmit, reset } = useForm<EquipmentFormData>();
  const { register: regEdit, handleSubmit: handleEditSubmit, reset: resetEdit } = useForm<EquipmentFormData>();

  const updateMutation = useMutation({
    mutationFn: async ({ id, body }: { id: number; body: Record<string, unknown> }) => {
      const res = await fetch(`/api/farms/${farmId}/equipment/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListEquipmentQueryKey(farmId ?? 0) });
      setManagingItem(null);
      toast({ title: "Equipment updated" });
    },
    onError: () => {
      toast({ title: "Failed to update equipment", variant: "destructive" });
    },
  });

  if (!farmId) return <Redirect href="/select" />;

  const onAdd = (formValues: EquipmentFormData) => {
    createEquip(
      {
        farmId,
        data: {
          ...formValues,
          yearOfManufacture: formValues.yearOfManufacture ? parseInt(formValues.yearOfManufacture, 10) : undefined,
          photos: addPhotos.length ? JSON.stringify(addPhotos) : undefined,
        },
      },
      {
        onSuccess: () => {
          setIsAddOpen(false);
          reset();
          setAddPhotos([]);
          toast({ title: "Equipment registered" });
        },
        onError: () => {
          toast({ title: "Failed to register equipment", variant: "destructive" });
        },
      }
    );
  };

  const openManage = (item: EquipmentRecord) => {
    setManagingItem(item);
    setEditPhotos(parsePhotos(item.photos));
    resetEdit({
      name: item.name ?? "",
      type: item.type ?? "",
      make: item.make ?? "",
      model: item.model ?? "",
      serialNumber: item.serialNumber ?? "",
      registrationNumber: item.registrationNumber ?? "",
      yearOfManufacture: item.yearOfManufacture ? String(item.yearOfManufacture) : "",
      location: item.location ?? "",
      notes: item.notes ?? "",
    });
  };

  const onEdit = (formValues: EquipmentFormData) => {
    if (!managingItem) return;
    updateMutation.mutate({
      id: managingItem.id,
      body: {
        ...formValues,
        yearOfManufacture: formValues.yearOfManufacture ? parseInt(formValues.yearOfManufacture, 10) : undefined,
        photos: JSON.stringify(editPhotos),
      },
    });
  };

  const equipment = (data?.records ?? []) as EquipmentRecord[];
  const printedDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const handleEquipmentPrint = () => {
    const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>Machinery &amp; Equipment Register</title>
<style>body{font-family:Arial,sans-serif;font-size:11px;color:#000;margin:0;padding:24px}.hdr{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:12px;margin-bottom:12px}.hdr h1{font-size:13px;font-weight:700;margin:0 0 2px}.hdr p{font-size:10px;color:#555;margin:1px 0}.hdr-r{text-align:right;font-size:10px;color:#666}.hdr-r b{display:block;font-size:12px;font-weight:600;color:#000}table{width:100%;border-collapse:collapse;font-size:10px}th{background:#f0fdf4;font-weight:600;text-align:left;border:1px solid #d1d5db;padding:5px 8px}td{border:1px solid #d1d5db;padding:5px 8px}tr:nth-child(even) td{background:#fafafa}.footer{font-size:9px;color:#888;border-top:1px solid #e5e7eb;padding-top:6px;margin-top:4px;font-style:italic}@media print{@page{margin:1.5cm}}</style>
</head><body><div class="hdr"><div><h1>${farm?.name ?? "Farm"}</h1>${farm?.address ? `<p>${farm.address}${farm.postcode ? ", " + farm.postcode : ""}</p>` : ""}${farm?.cphNumber ? `<p>CPH: <span style="font-family:monospace;font-weight:600">${farm.cphNumber}</span></p>` : ""}</div><div class="hdr-r"><b>Machinery &amp; Equipment Register</b>Printed: ${printedDate}<br>${equipment.length} item${equipment.length !== 1 ? "s" : ""}</div></div>
<table><thead><tr><th>Name</th><th>Type</th><th>Make / Model</th><th>Serial / Reg</th><th>Year</th><th>Status</th><th>Next Calibration</th></tr></thead><tbody>${equipment.map(item => `<tr><td>${item.name || "Asset #" + item.id}</td><td>${item.type || "—"}</td><td>${[item.make, item.model].filter(Boolean).join(" ") || "—"}</td><td style="font-family:monospace">${item.serialNumber || item.registrationNumber || "—"}</td><td>${item.yearOfManufacture || "—"}</td><td>${item.isActive !== false ? "Active" : "Inactive"}</td><td>${item.nextCalibrationDue ? new Date(item.nextCalibrationDue).toLocaleDateString("en-GB") : "—"}</td></tr>`).join("")}</tbody></table>
<div class="footer">On-farm record for Red Tractor compliance purposes. Retain for a minimum of 3 years and make available for inspection at audit. BDE Farm Trac · Printed ${printedDate}</div>
</body></html>`;
    printHtml(html, "equipment-register.html");
  };

  return (
    <AppLayout title="Machinery & Equipment">
      <style>{`
        @media print {
          body > * { display: none !important; }
          [role="dialog"] #equipment-print-area { display: block !important; position: fixed; top:0; left:0; width:100%; padding:24px; font-size:11px; color:#000; background:#fff; }
        }
      `}</style>
      <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
          <Input placeholder="Search equipment..." className="pl-10 bg-white" />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setPrintOpen(true)} disabled={equipment.length === 0}>
            <Printer className="w-4 h-4 mr-2" /> Print Register
          </Button>

        <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) { reset(); setAddPhotos([]); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Equipment</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Register Equipment</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onAdd)} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="add-name">Name / Description *</Label>
                  <Input id="add-name" {...register("name", { required: true })} placeholder="e.g. John Deere 6155R" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="add-make">Make</Label>
                  <Input id="add-make" {...register("make")} placeholder="e.g. John Deere" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="add-model">Model</Label>
                  <Input id="add-model" {...register("model")} placeholder="e.g. 6155R" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="add-type">Equipment Type</Label>
                  <Input id="add-type" {...register("type")} placeholder="e.g. Tractor, Sprayer" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="add-year">Year of Manufacture</Label>
                  <Input id="add-year" type="number" {...register("yearOfManufacture")} placeholder="e.g. 2021" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="add-serial">Serial Number</Label>
                  <Input id="add-serial" {...register("serialNumber")} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="add-reg">Registration Number</Label>
                  <Input id="add-reg" {...register("registrationNumber")} className="mt-1" />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="add-location">Location / Storage</Label>
                  <Input id="add-location" {...register("location")} placeholder="e.g. Main Yard" className="mt-1" />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="add-notes">Notes</Label>
                  <textarea
                    id="add-notes"
                    {...register("notes")}
                    placeholder="Service history, condition, etc."
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-y"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="mb-2 block">Photos (optional)</Label>
                  <PhotoUploader photos={addPhotos} onChange={setAddPhotos} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Register
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border/50 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-black/5 text-sm uppercase tracking-wider text-foreground/60 font-semibold border-b border-border/50">
            <tr>
              <th className="px-6 py-4">Equipment</th>
              <th className="px-6 py-4">Reg/Serial</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Next Calibration</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-foreground/50">Loading equipment...</td></tr>
            ) : equipment.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-foreground/50">No equipment registered.</td></tr>
            ) : equipment.map(item => (
              <tr key={item.id} className="hover:bg-black/5 transition-colors">
                <td className="px-6 py-4 font-medium">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-orange-50 flex-shrink-0 flex items-center justify-center">
                      {parsePhotos(item.photos)[0]
                        ? <img src={parsePhotos(item.photos)[0]} alt={item.name} className="w-full h-full object-cover" />
                        : <Tractor className="w-5 h-5 text-orange-600" />
                      }
                    </div>
                    <div>
                      <p>{item.name || `Asset #${item.id}`}</p>
                      {(item.make || item.model) && (
                        <p className="text-xs text-foreground/50">{[item.make, item.model].filter(Boolean).join(" ")}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-foreground/70">{item.serialNumber || item.registrationNumber || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${item.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {item.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-foreground/70">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 opacity-50" />
                    {item.nextCalibrationDue ? new Date(item.nextCalibrationDue).toLocaleDateString('en-GB') : '-'}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="sm" onClick={() => openManage(item)}>
                    <Pencil className="w-4 h-4 mr-1.5" /> Manage
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!managingItem} onOpenChange={(open) => { if (!open) setManagingItem(null); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Equipment — {managingItem?.name}</DialogTitle>
          </DialogHeader>
          {managingItem && (
            <form onSubmit={handleEditSubmit(onEdit)} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Name / Description</Label>
                  <Input {...regEdit("name")} className="mt-1" />
                </div>
                <div>
                  <Label>Make</Label>
                  <Input {...regEdit("make")} className="mt-1" />
                </div>
                <div>
                  <Label>Model</Label>
                  <Input {...regEdit("model")} className="mt-1" />
                </div>
                <div>
                  <Label>Equipment Type</Label>
                  <Input {...regEdit("type")} className="mt-1" />
                </div>
                <div>
                  <Label>Year of Manufacture</Label>
                  <Input type="number" {...regEdit("yearOfManufacture")} className="mt-1" />
                </div>
                <div>
                  <Label>Serial Number</Label>
                  <Input {...regEdit("serialNumber")} className="mt-1" />
                </div>
                <div>
                  <Label>Registration Number</Label>
                  <Input {...regEdit("registrationNumber")} className="mt-1" />
                </div>
                <div className="col-span-2">
                  <Label>Location / Storage</Label>
                  <Input {...regEdit("location")} className="mt-1" />
                </div>
                <div className="col-span-2">
                  <Label>Notes</Label>
                  <textarea
                    {...regEdit("notes")}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-y"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="mb-2 block">Photos</Label>
                  <PhotoUploader photos={editPhotos} onChange={setEditPhotos} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setManagingItem(null)}>Cancel</Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ── PRINT DIALOG ── */}
      {printOpen && (
        <Dialog open onOpenChange={(o) => { if (!o) setPrintOpen(false); }}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-green-600" />
                Print — Machinery &amp; Equipment Register
              </DialogTitle>
              <DialogDescription>
                Review the asset list below, then click Print to produce a compliance document for Red Tractor audit.
              </DialogDescription>
            </DialogHeader>

            <div id="equipment-print-area" className="border border-border rounded-lg p-6 space-y-4 text-sm mt-2">
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <p className="text-base font-bold text-foreground">{farm?.name ?? "Farm"}</p>
                  {farm?.address && <p className="text-xs text-foreground/60">{farm.address}{farm.postcode ? `, ${farm.postcode}` : ""}</p>}
                  {farm?.cphNumber && <p className="text-xs text-foreground/60 mt-0.5">CPH: <span className="font-mono font-semibold">{farm.cphNumber}</span></p>}
                </div>
                <div className="text-right text-xs text-foreground/50">
                  <p className="font-semibold text-foreground text-sm">Machinery &amp; Equipment Register</p>
                  <p>Printed: {printedDate}</p>
                  <p>{equipment.length} item{equipment.length !== 1 ? "s" : ""}</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-green-50 text-foreground/70">
                      <th className="border border-border/60 px-3 py-2 text-left font-semibold">Name</th>
                      <th className="border border-border/60 px-3 py-2 text-left font-semibold">Type</th>
                      <th className="border border-border/60 px-3 py-2 text-left font-semibold">Make / Model</th>
                      <th className="border border-border/60 px-3 py-2 text-left font-semibold">Serial / Reg</th>
                      <th className="border border-border/60 px-3 py-2 text-left font-semibold">Year</th>
                      <th className="border border-border/60 px-3 py-2 text-left font-semibold">Status</th>
                      <th className="border border-border/60 px-3 py-2 text-left font-semibold">Next Calibration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {equipment.map((item, i) => (
                      <tr key={item.id} className={i % 2 === 0 ? "bg-white" : "bg-black/[0.02]"}>
                        <td className="border border-border/60 px-3 py-2">{item.name || `Asset #${item.id}`}</td>
                        <td className="border border-border/60 px-3 py-2">{item.type || "-"}</td>
                        <td className="border border-border/60 px-3 py-2">{[item.make, item.model].filter(Boolean).join(" ") || "-"}</td>
                        <td className="border border-border/60 px-3 py-2 font-mono">{item.serialNumber || item.registrationNumber || "-"}</td>
                        <td className="border border-border/60 px-3 py-2">{item.yearOfManufacture || "-"}</td>
                        <td className="border border-border/60 px-3 py-2">{item.isActive !== false ? "Active" : "Inactive"}</td>
                        <td className="border border-border/60 px-3 py-2">
                          {item.nextCalibrationDue ? new Date(item.nextCalibrationDue).toLocaleDateString("en-GB") : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-xs text-foreground/40 border-t pt-3 italic">
                This is an on-farm record for Red Tractor compliance purposes.
                Retain for a minimum of 3 years and make available for inspection at audit.
                BDE Farm Trac · Printed {printedDate}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setPrintOpen(false)}>Close</Button>
              <Button onClick={handleEquipmentPrint} className="gap-2">
                <Printer className="w-4 h-4" /> Print Register
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AppLayout>
  );
}
