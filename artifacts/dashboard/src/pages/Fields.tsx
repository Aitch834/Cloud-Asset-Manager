import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { useAppStore } from "@/hooks/use-app-store";
import { useFields, useAddField, useUpdateField, useDeleteField } from "@/hooks/use-fields";
import { useCrops, useAddCrop, useFieldCropAssignments, useAssignCrop } from "@/hooks/use-crops";
import {
  Plus, Search, Map, MoreVertical, Pencil, Trash2, AlertTriangle,
  Sprout, Leaf, CalendarDays, Wheat, ChevronRight,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { Redirect } from "wouter";

const CURRENT_YEAR = new Date().getFullYear();

interface FieldRecord {
  id: number;
  name?: string;
  fieldReference?: string;
  areaSqMetres?: number;
  soilType?: string;
  currentUse?: string;
  isActive?: boolean;
}

interface CropRecord {
  id: number;
  name: string;
  variety?: string;
  category?: string;
}

interface FieldCropAssignment {
  id: number;
  fieldId: number;
  cropId: number;
  cropName: string;
  plantingDate?: string;
  expectedHarvestDate?: string;
  season?: string;
  year?: number;
}

interface FieldFormData { name: string; areaSqMetres: number; soilType: string; }
interface CropFormData { name: string; variety: string; category: string; }
interface AssignCropFormData { cropId: number; plantingDate: string; expectedHarvestDate: string; season: string; }

function formatDate(dateStr?: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function FieldCardMenu({
  field, farmId, crops, currentCrop, onAssignCrop,
}: {
  field: FieldRecord;
  farmId: number;
  crops: CropRecord[];
  currentCrop?: FieldCropAssignment;
  onAssignCrop: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { mutate: updateField, isPending: isUpdating } = useUpdateField(farmId);
  const { mutate: deleteField, isPending: isDeleting } = useDeleteField(farmId);

  const { register, handleSubmit, reset } = useForm<FieldFormData>({
    defaultValues: { name: field.name ?? "", areaSqMetres: field.areaSqMetres ?? 0, soilType: field.soilType ?? "" },
  });

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleEdit = (values: FieldFormData) => {
    updateField({ farmId, recordId: field.id, data: values }, { onSuccess: () => { setEditOpen(false); reset(values); } });
  };

  const handleDelete = () => {
    deleteField({ farmId, recordId: field.id }, { onSuccess: () => setDeleteOpen(false) });
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(prev => !prev); }}
        className="w-8 h-8 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors cursor-pointer shadow-sm"
        aria-label="Field options"
      >
        <MoreVertical className="w-4 h-4 text-foreground/70" />
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-44 bg-white rounded-xl shadow-xl border border-border/50 z-50 overflow-hidden py-1">
          <button
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-black/5 transition-colors cursor-pointer"
            onClick={() => { setOpen(false); onAssignCrop(); }}
          >
            <Sprout className="w-4 h-4 text-green-600" />
            {currentCrop ? "Change crop" : "Assign crop"}
          </button>
          <div className="h-px bg-border/50 my-1" />
          <button
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-black/5 transition-colors cursor-pointer"
            onClick={() => { setOpen(false); setEditOpen(true); reset({ name: field.name ?? "", areaSqMetres: field.areaSqMetres ?? 0, soilType: field.soilType ?? "" }); }}
          >
            <Pencil className="w-4 h-4 text-foreground/50" />
            Edit field
          </button>
          <button
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            onClick={() => { setOpen(false); setDeleteOpen(true); }}
          >
            <Trash2 className="w-4 h-4" />
            Delete field
          </button>
        </div>
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Field</DialogTitle>
            <DialogDescription>Update details for {field.name || `Field #${field.id}`}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleEdit)} className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Field Name / ID</label>
              <Input {...register("name", { required: true })} placeholder="e.g. North Pasture" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Area (sq metres)</label>
                <Input type="number" step="0.01" {...register("areaSqMetres", { valueAsNumber: true })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Soil Type</label>
                <Input {...register("soilType")} placeholder="e.g. Clay loam" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isUpdating}>{isUpdating ? "Saving..." : "Save Changes"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Delete Field
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{field.name || `Field #${field.id}`}</strong>? All associated crop records will also be removed and this cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Field"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function FieldsPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<"fields" | "crops">("fields");
  const [search, setSearch] = useState("");
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [isAddCropOpen, setIsAddCropOpen] = useState(false);
  const [assignForField, setAssignForField] = useState<FieldRecord | null>(null);

  if (!farmId) return <Redirect href="/select" />;

  const { data: fieldsData, isLoading: fieldsLoading } = useFields(farmId);
  const { data: cropsData, isLoading: cropsLoading } = useCrops(farmId);
  const { data: assignmentsData } = useFieldCropAssignments(farmId);

  const { mutate: createField, isPending: creatingField } = useAddField(farmId);
  const { mutate: createCrop, isPending: creatingCrop } = useAddCrop(farmId);
  const { mutate: assignCrop, isPending: assigningCrop } = useAssignCrop(farmId);

  const fieldForm = useForm<FieldFormData>();
  const cropForm = useForm<CropFormData>();
  const assignForm = useForm<AssignCropFormData>();

  const fields = (fieldsData?.records ?? []) as FieldRecord[];
  const crops = (cropsData?.records ?? []) as CropRecord[];
  const assignments = (assignmentsData?.records ?? []) as FieldCropAssignment[];

  const currentAssignments = assignments.filter(a => a.year === CURRENT_YEAR || !a.year);

  const currentCropByField = Object.fromEntries(
    currentAssignments.map(a => [a.fieldId, a])
  ) as Record<number, FieldCropAssignment>;

  const filteredFields = fields.filter(f =>
    !search || (f.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const onSubmitField = (values: FieldFormData) => {
    createField({ farmId, data: values }, { onSuccess: () => { setIsAddFieldOpen(false); fieldForm.reset(); } });
  };

  const onSubmitCrop = (values: CropFormData) => {
    createCrop({ farmId, data: values }, { onSuccess: () => { setIsAddCropOpen(false); cropForm.reset(); } });
  };

  const onSubmitAssign = (values: AssignCropFormData) => {
    if (!assignForField) return;
    assignCrop(
      { farmId, data: { ...values, fieldId: assignForField.id, cropId: Number(values.cropId), year: CURRENT_YEAR, season: values.season } },
      { onSuccess: () => { setAssignForField(null); assignForm.reset(); } }
    );
  };

  const CROP_CATEGORIES = ["Combinable Crops", "Root Crops", "Vegetables", "Oilseeds", "Pulses", "Grass & Forage", "Other"];

  return (
    <AppLayout title="Fields & Crops">
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-black/5 rounded-xl p-1 w-fit mb-6">
        <button
          onClick={() => setTab("fields")}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${tab === "fields" ? "bg-white shadow text-foreground" : "text-foreground/50 hover:text-foreground"}`}
        >
          Fields
        </button>
        <button
          onClick={() => setTab("crops")}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${tab === "crops" ? "bg-white shadow text-foreground" : "text-foreground/50 hover:text-foreground"}`}
        >
          Crops Register
        </button>
      </div>

      {/* ── FIELDS TAB ── */}
      {tab === "fields" && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
              <Input
                placeholder="Search fields..."
                className="pl-10 bg-white"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Dialog open={isAddFieldOpen} onOpenChange={setIsAddFieldOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto"><Plus className="w-4 h-4 mr-2" /> Add Field</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Field</DialogTitle>
                  <DialogDescription>Register a new field or parcel to your farm holding.</DialogDescription>
                </DialogHeader>
                <form onSubmit={fieldForm.handleSubmit(onSubmitField)} className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Field Name / ID</label>
                    <Input {...fieldForm.register("name", { required: true })} placeholder="e.g. North Pasture" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Area (sq metres)</label>
                      <Input type="number" step="0.01" {...fieldForm.register("areaSqMetres", { valueAsNumber: true })} placeholder="0.00" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Soil Type</label>
                      <Input {...fieldForm.register("soilType")} placeholder="e.g. Clay loam" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddFieldOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={creatingField}>{creatingField ? "Saving..." : "Save Field"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {fieldsLoading ? (
              [1, 2, 3].map(i => <div key={i} className="h-56 rounded-2xl bg-black/5 animate-pulse" />)
            ) : filteredFields.length === 0 ? (
              <div className="col-span-full py-16 text-center text-foreground/50 border-2 border-dashed rounded-2xl">
                <Map className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg">No fields found.</p>
              </div>
            ) : filteredFields.map((field) => {
              const crop = currentCropByField[field.id];
              return (
                <Card key={field.id} className="group relative overflow-visible">
                  <div className="absolute top-3 right-3 z-30">
                    <FieldCardMenu
                      field={field}
                      farmId={farmId}
                      crops={crops}
                      currentCrop={crop}
                      onAssignCrop={() => { setAssignForField(field); assignForm.reset(); }}
                    />
                  </div>

                  {/* Green header — field name */}
                  <div className="bg-gradient-to-br from-green-100 to-emerald-50 rounded-t-2xl border-b border-border/50 px-4 pt-4 pb-3">
                    <h3 className="text-lg font-bold text-foreground pr-8 leading-snug">{field.name || `Field #${field.id}`}</h3>
                  </div>

                  <div className="p-5">
                    {/* Crop badge */}
                    <div className="mb-3">
                      {crop ? (
                        <span className="inline-flex items-center gap-1.5 bg-green-700 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
                          <Wheat className="w-3 h-3" />
                          {crop.cropName}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-black/5 text-foreground/40 text-xs font-medium px-2.5 py-1 rounded-full">
                          <Leaf className="w-3 h-3" />
                          No crop assigned
                        </span>
                      )}
                    </div>

                    {/* Crop details or assign prompt */}
                    {crop ? (
                      <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-3 space-y-1">
                        {crop.plantingDate && (
                          <div className="flex items-center gap-2 text-xs text-foreground/70">
                            <CalendarDays className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                            <span>Planted: <strong>{formatDate(crop.plantingDate)}</strong></span>
                          </div>
                        )}
                        {crop.expectedHarvestDate && (
                          <div className="flex items-center gap-2 text-xs text-foreground/70">
                            <Wheat className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                            <span>Expected harvest: <strong>{formatDate(crop.expectedHarvestDate)}</strong></span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => { setAssignForField(field); assignForm.reset(); }}
                        className="w-full mb-3 flex items-center justify-center gap-2 py-2 border-2 border-dashed border-green-200 rounded-xl text-xs text-green-700 font-medium hover:bg-green-50 transition-colors cursor-pointer"
                      >
                        <Sprout className="w-3.5 h-3.5" />
                        Assign this season's crop
                      </button>
                    )}

                    {/* Field stats */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="text-xs text-foreground/50 uppercase font-semibold mb-0.5">Soil</p>
                        <p className="text-sm font-medium text-foreground">{field.soilType || '—'}</p>
                      </div>
                      <div className="w-px h-8 bg-border" />
                      <div className="flex-1">
                        <p className="text-xs text-foreground/50 uppercase font-semibold mb-0.5">Area</p>
                        <p className="text-sm font-medium text-foreground">
                          {field.areaSqMetres ? `${(field.areaSqMetres / 10000).toFixed(2)} ha` : '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* ── CROPS REGISTER TAB ── */}
      {tab === "crops" && (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-sm text-foreground/60">
                Your crop catalogue — add crop types here, then assign them to fields each season.
              </p>
            </div>
            <Dialog open={isAddCropOpen} onOpenChange={setIsAddCropOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" /> Add Crop</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Crop to Register</DialogTitle>
                  <DialogDescription>Add a crop type to your farm's catalogue. You can then assign it to fields each season.</DialogDescription>
                </DialogHeader>
                <form onSubmit={cropForm.handleSubmit(onSubmitCrop)} className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Crop Name</label>
                    <Input {...cropForm.register("name", { required: true })} placeholder="e.g. Winter Wheat, Oil Seed Rape" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Variety (optional)</label>
                    <Input {...cropForm.register("variety")} placeholder="e.g. KWS Zyatt, Extase" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Category</label>
                    <select
                      {...cropForm.register("category")}
                      className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white"
                    >
                      <option value="">Select category...</option>
                      {CROP_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddCropOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={creatingCrop}>{creatingCrop ? "Saving..." : "Add Crop"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {cropsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-black/5 animate-pulse" />)}
            </div>
          ) : crops.length === 0 ? (
            <div className="py-16 text-center text-foreground/50 border-2 border-dashed rounded-2xl">
              <Sprout className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No crops registered yet</p>
              <p className="text-sm mt-1">Add your crop types above, then assign them to fields each season.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {crops.map(crop => {
                const assignedFields = assignments.filter(a => a.cropId === crop.id && (a.year === CURRENT_YEAR || !a.year));
                return (
                  <div key={crop.id} className="flex items-center gap-4 bg-white border border-border/50 rounded-xl px-5 py-4 hover:shadow-sm transition-shadow">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                      <Wheat className="w-5 h-5 text-green-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{crop.name}</p>
                      <p className="text-sm text-foreground/50">
                        {[crop.variety, crop.category].filter(Boolean).join(" · ") || "No variety / category set"}
                      </p>
                    </div>
                    {assignedFields.length > 0 && (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full flex-shrink-0">
                        <Leaf className="w-3 h-3" />
                        {assignedFields.length} field{assignedFields.length !== 1 ? "s" : ""} this season
                      </div>
                    )}
                    <ChevronRight className="w-4 h-4 text-foreground/20 flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── ASSIGN CROP DIALOG ── */}
      <Dialog open={!!assignForField} onOpenChange={(o) => { if (!o) setAssignForField(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sprout className="w-5 h-5 text-green-600" />
              Assign Crop to {assignForField?.name || "Field"}
            </DialogTitle>
            <DialogDescription>
              Record what's being grown in this field for the {CURRENT_YEAR} season.
            </DialogDescription>
          </DialogHeader>

          {crops.length === 0 ? (
            <div className="py-6 text-center text-foreground/60 text-sm">
              <p>No crops in your register yet.</p>
              <p className="mt-1">Go to the <strong>Crops Register</strong> tab to add crops first.</p>
            </div>
          ) : (
            <form onSubmit={assignForm.handleSubmit(onSubmitAssign)} className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Crop</label>
                <select
                  {...assignForm.register("cropId", { required: true, valueAsNumber: true })}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white"
                >
                  <option value="">Select a crop...</option>
                  {crops.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}{c.variety ? ` — ${c.variety}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Planting Date</label>
                  <Input type="date" {...assignForm.register("plantingDate")} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Expected Harvest</label>
                  <Input type="date" {...assignForm.register("expectedHarvestDate")} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Season</label>
                <Input {...assignForm.register("season")} placeholder="e.g. Winter 2025/26, Spring 2026" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAssignForField(null)}>Cancel</Button>
                <Button type="submit" disabled={assigningCrop}>{assigningCrop ? "Saving..." : "Assign Crop"}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
