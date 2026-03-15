import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { 
  useGetMyTenants, 
  useListFarms,
  useCreateFarm,
  getListFarmsQueryKey,
} from "@workspace/api-client-react/src/generated/api";
import { useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
import { Map, Building2, ArrowRight, Loader2, Plus, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SECTORS = [
  { key: "sectorArable", label: "Arable" },
  { key: "sectorBeef", label: "Beef" },
  { key: "sectorDairy", label: "Dairy" },
  { key: "sectorPigs", label: "Pigs" },
  { key: "sectorPoultry", label: "Poultry" },
  { key: "sectorHorticulture", label: "Horticulture" },
] as const;

type SectorKey = typeof SECTORS[number]["key"];

interface FarmFormData {
  name: string;
  cphNumber: string;
  address: string;
  postcode: string;
  gridReference: string;
  totalAcreage: string;
  sectors: Record<SectorKey, boolean>;
}

const emptyFormData: FarmFormData = {
  name: "",
  cphNumber: "",
  address: "",
  postcode: "",
  gridReference: "",
  totalAcreage: "",
  sectors: {
    sectorArable: false,
    sectorBeef: false,
    sectorDairy: false,
    sectorPigs: false,
    sectorPoultry: false,
    sectorHorticulture: false,
  },
};

export default function SelectContext() {
  const [_, setLocation] = useLocation();
  const { tenantSlug, farmId, setTenantSlug, setFarmId } = useAppStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState<FarmFormData>(emptyFormData);

  const { data: tenantsData, isLoading: loadingTenants } = useGetMyTenants();
  const { data: farmsData, isLoading: loadingFarms } = useListFarms({
    query: { enabled: !!tenantSlug }
  });

  const { mutate: createFarm, isPending: isCreating } = useCreateFarm();

  useEffect(() => {
    if (tenantsData?.tenants && tenantsData.tenants.length === 1 && !tenantSlug) {
      setTenantSlug(tenantsData.tenants[0].tenantSlug);
    }
  }, [tenantsData, tenantSlug, setTenantSlug]);

  useEffect(() => {
    if (farmsData?.farms && farmsData.farms.length === 1 && !farmId) {
      setFarmId(farmsData.farms[0].id);
      setLocation('/dashboard');
    }
  }, [farmsData, farmId, setFarmId, setLocation]);

  const handleSelectFarm = (id: number) => {
    setFarmId(id);
    setLocation('/dashboard');
  };

  const openCreateDialog = () => {
    setFormData(emptyFormData);
    setShowCreateDialog(true);
  };

  const handleCreateFarm = () => {
    if (!formData.name.trim()) {
      toast({ title: "Farm name is required", variant: "destructive" });
      return;
    }

    createFarm({
      data: {
        name: formData.name.trim(),
        cphNumber: formData.cphNumber.trim() || undefined,
        address: formData.address.trim() || undefined,
        postcode: formData.postcode.trim() || undefined,
        gridReference: formData.gridReference.trim() || undefined,
        totalAcreage: formData.totalAcreage ? parseInt(formData.totalAcreage, 10) : undefined,
        ...formData.sectors,
      },
    }, {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListFarmsQueryKey() });
        setShowCreateDialog(false);
        toast({ title: "Farm created", description: `${data.farm.name} has been added.` });
        handleSelectFarm(data.farm.id);
      },
      onError: () => {
        toast({ title: "Failed to create farm", variant: "destructive" });
      },
    });
  };

  const updateField = (field: keyof Omit<FarmFormData, "sectors">, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSector = (key: SectorKey) => {
    setFormData(prev => ({
      ...prev,
      sectors: { ...prev.sectors, [key]: !prev.sectors[key] },
    }));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            {!tenantSlug ? "Select your Organization" : "Select a Farm"}
          </h1>
          <p className="mt-2 text-foreground/60">
            {!tenantSlug 
              ? "Choose the business account you want to access." 
              : "Choose which farm you want to manage today."}
          </p>
        </div>

        {!tenantSlug ? (
          <div className="space-y-4">
            {loadingTenants ? (
              <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : tenantsData?.tenants.map(t => (
              <Card 
                key={t.tenantId}
                className="p-6 cursor-pointer hover:border-primary transition-all group flex items-center justify-between"
                onClick={() => setTenantSlug(t.tenantSlug)}
              >
                <div>
                  <h3 className="font-bold text-lg">{t.tenantName}</h3>
                  <p className="text-sm text-foreground/50">{t.isSuperAdmin ? "Admin Access" : "Member"}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button 
              onClick={() => setTenantSlug("")} 
              className="text-sm font-medium text-primary hover:underline mb-4 block"
            >
              &larr; Back to Organizations
            </button>
            
            {loadingFarms ? (
              <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : farmsData?.farms.length === 0 ? (
              <Card className="p-12 text-center border-dashed">
                <Map className="w-12 h-12 text-foreground/30 mx-auto mb-4" />
                <p className="text-foreground/60 mb-4">No farms found in this organization.</p>
                <Button onClick={openCreateDialog}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Farm
                </Button>
              </Card>
            ) : (
              <>
                {farmsData?.farms.map(f => (
                  <Card 
                    key={f.id}
                    className="p-6 cursor-pointer hover:border-primary transition-all group flex items-center justify-between"
                    onClick={() => handleSelectFarm(f.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                        <Map className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{f.name}</h3>
                        <p className="text-sm text-foreground/50">{f.totalAcreage ? `${f.totalAcreage} acres` : 'Setup pending'}</p>
                      </div>
                    </div>
                    <Button variant="secondary" className="group-hover:bg-primary group-hover:text-white transition-colors">
                      Open Dashboard
                    </Button>
                  </Card>
                ))}

                <Button
                  variant="outline"
                  className="w-full border-dashed"
                  onClick={openCreateDialog}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Farm
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create a New Farm</DialogTitle>
            <DialogDescription>
              Set up a new farm holding. You can update these details later in Farm Settings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="farm-name">Farm Name *</Label>
              <Input
                id="farm-name"
                placeholder="e.g. Manor Farm"
                value={formData.name}
                onChange={e => updateField("name", e.target.value)}
                autoFocus
              />
            </div>

            <div>
              <Label htmlFor="cph-number">CPH Number</Label>
              <Input
                id="cph-number"
                placeholder="e.g. 12/345/6789"
                value={formData.cphNumber}
                onChange={e => updateField("cphNumber", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="Farm address"
                value={formData.address}
                onChange={e => updateField("address", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="postcode">Postcode</Label>
                <Input
                  id="postcode"
                  placeholder="e.g. YO1 7HJ"
                  value={formData.postcode}
                  onChange={e => updateField("postcode", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="acreage">Total Acreage</Label>
                <Input
                  id="acreage"
                  type="number"
                  placeholder="e.g. 250"
                  value={formData.totalAcreage}
                  onChange={e => updateField("totalAcreage", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="grid-ref">Grid Reference</Label>
              <Input
                id="grid-ref"
                placeholder="e.g. SE 605 515"
                value={formData.gridReference}
                onChange={e => updateField("gridReference", e.target.value)}
              />
            </div>

            <div>
              <Label className="mb-3 block">Farm Sectors</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SECTORS.map(s => (
                  <label
                    key={s.key}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={formData.sectors[s.key]}
                      onCheckedChange={() => toggleSector(s.key)}
                    />
                    <span className="text-sm">{s.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button onClick={handleCreateFarm} disabled={isCreating}>
              {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Farm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
