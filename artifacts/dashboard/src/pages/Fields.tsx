import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter, DialogTrigger 
} from "@/components/ui/dialog";
import { useAppStore } from "@/hooks/use-app-store";
import { useFields, useAddField } from "@/hooks/use-fields";
import { Plus, Search, Map, MoreVertical } from "lucide-react";
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
          <Card key={field.id} className="group">
            <div className="h-24 bg-gradient-to-br from-green-100 to-emerald-50 rounded-t-2xl border-b border-border/50 p-4 relative overflow-hidden">
               <svg className="absolute inset-0 w-full h-full opacity-10" preserveAspectRatio="none">
                 <path d="M0,50 Q25,20 50,50 T100,50 T150,50" stroke="green" fill="none" strokeWidth="2" />
               </svg>
               <div className="absolute top-4 right-4">
                 <button className="w-8 h-8 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors">
                   <MoreVertical className="w-4 h-4 text-foreground/70" />
                 </button>
               </div>
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
