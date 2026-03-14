import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogFooter, DialogTrigger 
} from "@/components/ui/dialog";
import { useAppStore } from "@/hooks/use-app-store";
import { useEquipment, useAddEquipment } from "@/hooks/use-equipment";
import { Plus, Search, Tractor, Calendar } from "lucide-react";
import { useForm } from "react-hook-form";
import { Redirect } from "wouter";

interface EquipmentRecord {
  id: number;
  name?: string;
  equipmentType?: string;
  make?: string;
  model?: string;
  serialNumber?: string;
  registrationNumber?: string;
  nextCalibrationDue?: string;
  isActive?: boolean;
}

interface EquipmentFormData {
  name: string;
  serialNumber: string;
  equipmentType: string;
}

export default function EquipmentPage() {
  const { farmId } = useAppStore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  if (!farmId) return <Redirect href="/select" />;

  const { data, isLoading } = useEquipment(farmId);
  const { mutate: createEquip, isPending } = useAddEquipment(farmId);
  const { register, handleSubmit, reset } = useForm<EquipmentFormData>();

  const onSubmit = (formValues: EquipmentFormData) => {
    createEquip({ farmId, data: formValues }, {
      onSuccess: () => { setIsAddOpen(false); reset(); }
    });
  };

  const equipment = (data?.records ?? []) as EquipmentRecord[];

  return (
    <AppLayout title="Machinery & Equipment">
      <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
          <Input placeholder="Search equipment..." className="pl-10 bg-white" />
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Equipment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Register Equipment</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Make & Model</label>
                <Input {...register("name", { required: true })} placeholder="e.g. John Deere 6155R" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Registration / Serial Number</label>
                <Input {...register("serialNumber")} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Equipment Type</label>
                <Input {...register("equipmentType")} placeholder="e.g. Tractor, Sprayer" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isPending}>Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
                <td className="px-6 py-4 font-medium flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                    <Tractor className="w-5 h-5 text-orange-600" />
                  </div>
                  {item.name || `Asset #${item.id}`}
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
                  <Button variant="ghost" size="sm">Manage</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
