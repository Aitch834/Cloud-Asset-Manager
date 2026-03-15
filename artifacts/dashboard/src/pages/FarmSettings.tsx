import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppStore } from "@/hooks/use-app-store";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListFarms,
  useUpdateFarm,
  getListFarmsQueryKey,
  getGetFarmDashboardQueryKey,
} from "@workspace/api-client-react/src/generated/api";
import { Redirect } from "wouter";
import { Loader2, Save } from "lucide-react";

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

export default function FarmSettings() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: farmsData, isLoading } = useListFarms();
  const { mutate: updateFarm, isPending: isSaving } = useUpdateFarm();

  const currentFarm = farmsData?.farms?.find((f: any) => f.id === farmId);

  const [formData, setFormData] = useState<FarmFormData | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (currentFarm && !initialized) {
      const farm = currentFarm as any;
      setFormData({
        name: farm.name || "",
        cphNumber: farm.cphNumber || "",
        address: farm.address || "",
        postcode: farm.postcode || "",
        gridReference: farm.gridReference || "",
        totalAcreage: farm.totalAcreage?.toString() || "",
        sectors: {
          sectorArable: !!farm.sectorArable,
          sectorBeef: !!farm.sectorBeef,
          sectorDairy: !!farm.sectorDairy,
          sectorPigs: !!farm.sectorPigs,
          sectorPoultry: !!farm.sectorPoultry,
          sectorHorticulture: !!farm.sectorHorticulture,
        },
      });
      setInitialized(true);
    }
  }, [currentFarm, initialized]);

  if (!farmId) return <Redirect href="/select" />;

  if (isLoading || !formData) {
    return (
      <AppLayout title="Farm Settings">
        <div className="animate-pulse space-y-6">
          <div className="h-64 bg-black/5 rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  const updateField = (field: keyof Omit<FarmFormData, "sectors">, value: string) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const toggleSector = (key: SectorKey) => {
    setFormData(prev => prev ? {
      ...prev,
      sectors: { ...prev.sectors, [key]: !prev.sectors[key] },
    } : prev);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({ title: "Farm name is required", variant: "destructive" });
      return;
    }

    updateFarm({
      farmId: farmId,
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
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFarmsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetFarmDashboardQueryKey(farmId) });
        toast({ title: "Farm updated", description: "Your changes have been saved." });
      },
      onError: () => {
        toast({ title: "Failed to update farm", variant: "destructive" });
      },
    });
  };

  return (
    <AppLayout title="Farm Settings">
      <Card>
        <CardContent className="p-6 md:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-bold mb-1">Farm Details</h3>
            <p className="text-sm text-muted-foreground">
              Update your farm's name, location, and type information.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="settings-name">Farm Name *</Label>
              <Input
                id="settings-name"
                placeholder="e.g. Manor Farm"
                value={formData.name}
                onChange={e => updateField("name", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="settings-cph">CPH Number</Label>
              <Input
                id="settings-cph"
                placeholder="e.g. 12/345/6789"
                value={formData.cphNumber}
                onChange={e => updateField("cphNumber", e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">County Parish Holding number</p>
            </div>

            <div>
              <Label htmlFor="settings-grid">Grid Reference</Label>
              <Input
                id="settings-grid"
                placeholder="e.g. SE 605 515"
                value={formData.gridReference}
                onChange={e => updateField("gridReference", e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="settings-address">Address</Label>
              <Input
                id="settings-address"
                placeholder="Farm address"
                value={formData.address}
                onChange={e => updateField("address", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="settings-postcode">Postcode</Label>
              <Input
                id="settings-postcode"
                placeholder="e.g. YO1 7HJ"
                value={formData.postcode}
                onChange={e => updateField("postcode", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="settings-acreage">Total Acreage</Label>
              <Input
                id="settings-acreage"
                type="number"
                placeholder="e.g. 250"
                value={formData.totalAcreage}
                onChange={e => updateField("totalAcreage", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label className="mb-3 block">Farm Sectors</Label>
            <p className="text-xs text-muted-foreground mb-3">
              Select all types of farming activity on this holding.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SECTORS.map(s => (
                <label
                  key={s.key}
                  className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-black/5 transition-colors"
                >
                  <Checkbox
                    checked={formData.sectors[s.key]}
                    onCheckedChange={() => toggleSector(s.key)}
                  />
                  <span className="text-sm font-medium">{s.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
