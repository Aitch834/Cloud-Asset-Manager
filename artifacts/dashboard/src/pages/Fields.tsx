import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter, DialogTrigger 
} from "@/components/ui/dialog";
import { useAppStore } from "@/hooks/use-app-store";
import { useFields, useAddField, useUpdateField, useDeleteField } from "@/hooks/use-fields";
import { Plus, Search, Map, MoreVertical, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { Redirect } from "wouter";

interface FieldRecord {
  id: number;
  name?: string;
  fieldReference?: string;
  areaSqMetres?: number;
  soilType?: string;
  currentUse?: string;
  isActive?: boolean;
}

interface FieldFormData {
  name: string;
  areaSqMetres: number;
  soilType: string;
}

function FieldCardMenu({ field, farmId }: { field: FieldRecord; farmId: number }) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { mutate: updateField, isPending: isUpdating } = useUpdateField(farmId);
  const { mutate: deleteField, isPending: isDeleting } = useDeleteField(farmId);

  const { register, handleSubmit, reset } = useForm<FieldFormData>({
    defaultValues: {
      name: field.name ?? "",
      areaSqMetres: field.areaSqMetres ?? 0,
      soilType: field.soilType ?? "",
    },
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleEdit = (values: FieldFormData) => {
    updateField(
      { farmId, recordId: field.id, data: values },
      {
        onSuccess: () => {
          setEditOpen(false);
          reset(values);
        },
      }
    );
  };

  const handleDelete = () => {
    deleteField(
      { farmId, recordId: field.id },
      { onSuccess: () => setDeleteOpen(false) }
    );
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(prev => !prev); }}
        className="w-8 h-8 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
        aria-label="Field options"
      >
        <MoreVertical className="w-4 h-4 text-foreground/70" />
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-40 bg-white rounded-xl shadow-xl border border-border/50 z-50 overflow-hidden py-1">
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

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Field</DialogTitle>
            <DialogDescription>Update the details for {field.name || `Field #${field.id}`}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleEdit)} className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Field Name / ID</label>
              <Input {...register("name", { required: true })} placeholder="e.g. North Pasture" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Area (sq metres)</label>
                <Input type="number" step="0.01" {...register("areaSqMetres", { valueAsNumber: true })} placeholder="0.00" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Soil Type</label>
                <Input {...register("soilType")} placeholder="e.g. Clay loam" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Delete Field
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{field.name || `Field #${field.id}`}</strong>? This will also remove all associated crop records and cannot be undone.
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
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  if (!farmId) return <Redirect href="/select" />;

  const { data, isLoading } = useFields(farmId);
  const { mutate: createField, isPending } = useAddField(farmId);
  
  const { register, handleSubmit, reset } = useForm<FieldFormData>();

  const onSubmit = (formValues: FieldFormData) => {
    createField({ farmId, data: formValues }, {
      onSuccess: () => {
        setIsAddOpen(false);
        reset();
      }
    });
  };

  const records = (data?.records ?? []) as FieldRecord[];
  const filtered = records.filter(f => 
    !search || (f.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout title="Fields & Crops">
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
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto"><Plus className="w-4 h-4 mr-2" /> Add Field</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Field</DialogTitle>
              <DialogDescription>Register a new field or parcel to your farm holding.</DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Field Name / ID</label>
                <Input {...register("name", { required: true })} placeholder="e.g. North Pasture" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Area (sq metres)</label>
                  <Input type="number" step="0.01" {...register("areaSqMetres", { valueAsNumber: true })} placeholder="0.00" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Soil Type</label>
                  <Input {...register("soilType")} placeholder="e.g. Clay loam" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : "Save Field"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          [1,2,3].map(i => <div key={i} className="h-48 rounded-2xl bg-black/5 animate-pulse" />)
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-foreground/50 border-2 border-dashed rounded-2xl">
            <Map className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg">No fields found.</p>
          </div>
        ) : filtered.map((field) => (
          <Card key={field.id} className="group relative">
            {/* Options menu — outside overflow-hidden so the dropdown isn't clipped */}
            <div className="absolute top-4 right-4 z-30">
              <FieldCardMenu field={field} farmId={farmId} />
            </div>
            <div className="h-24 bg-gradient-to-br from-green-100 to-emerald-50 rounded-t-2xl border-b border-border/50 p-4 relative overflow-hidden">
              <svg className="absolute inset-0 w-full h-full opacity-10" preserveAspectRatio="none">
                <path d="M0,50 Q25,20 50,50 T100,50 T150,50" stroke="green" fill="none" strokeWidth="2" />
              </svg>
            </div>
            <div className="p-5">
              <h3 className="text-xl font-bold text-foreground mb-1">{field.name || `Field #${field.id}`}</h3>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex-1">
                  <p className="text-xs text-foreground/50 uppercase font-semibold mb-1">Soil</p>
                  <p className="font-medium text-foreground">{field.soilType || 'Unknown'}</p>
                </div>
                <div className="w-px h-8 bg-border"></div>
                <div className="flex-1">
                  <p className="text-xs text-foreground/50 uppercase font-semibold mb-1">Area</p>
                  <p className="font-medium text-foreground">{field.areaSqMetres ? `${(field.areaSqMetres / 10000).toFixed(2)} ha` : '-'}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
