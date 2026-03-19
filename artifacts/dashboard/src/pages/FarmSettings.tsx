import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/hooks/use-app-store";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListFarms,
  useUpdateFarm,
  getListFarmsQueryKey,
  getGetFarmDashboardQueryKey,
} from "@workspace/api-client-react/src/generated/api";
import type { Farm } from "@workspace/api-client-react/src/generated/api.schemas";
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

const HOLDING_TYPES = [
  { value: "owned", label: "Owner occupied" },
  { value: "tenanted", label: "Tenanted" },
  { value: "contract", label: "Contract farmed" },
  { value: "managed", label: "Managed / Share farmed" },
] as const;

const ASSURANCE_BODIES = [
  "Acoura",
  "ADAS",
  "Control Union",
  "CERT UK",
  "NSF",
  "SGS",
  "Other",
] as const;

type SectorKey = typeof SECTORS[number]["key"];

interface FarmFormData {
  name: string;
  cphNumber: string;
  sbiNumber: string;
  address: string;
  postcode: string;
  gridReference: string;
  totalAcreage: string;
  totalHectares: string;
  redTractorId: string;
  farmManager: string;
  holdingType: string;
  assuranceBody: string;
  isNvzDesignated: boolean;
  sectors: Record<SectorKey, boolean>;
  eaml2Email: string;
  flockMark: string;
  herdMark: string;
  bcmsHoldingNumber: string;
}

function farmToFormData(farm: Farm & {
  redTractorId?: string | null;
  sbiNumber?: string | null;
  totalHectares?: string | null;
  farmManager?: string | null;
  holdingType?: string | null;
  assuranceBody?: string | null;
  isNvzDesignated?: boolean | null;
}): FarmFormData {
  return {
    name: farm.name || "",
    cphNumber: farm.cphNumber || "",
    sbiNumber: (farm as any).sbiNumber || "",
    address: farm.address || "",
    postcode: farm.postcode || "",
    gridReference: farm.gridReference || "",
    totalAcreage: farm.totalAcreage?.toString() || "",
    totalHectares: (farm as any).totalHectares?.toString() || "",
    redTractorId: (farm as any).redTractorId || "",
    farmManager: (farm as any).farmManager || "",
    holdingType: (farm as any).holdingType || "",
    assuranceBody: (farm as any).assuranceBody || "",
    isNvzDesignated: !!(farm as any).isNvzDesignated,
    sectors: {
      sectorArable: !!farm.sectorArable,
      sectorBeef: !!farm.sectorBeef,
      sectorDairy: !!farm.sectorDairy,
      sectorPigs: !!farm.sectorPigs,
      sectorPoultry: !!farm.sectorPoultry,
      sectorHorticulture: !!farm.sectorHorticulture,
    },
    eaml2Email: (farm as any).eaml2Email || "",
    flockMark: (farm as any).flockMark || "",
    herdMark: (farm as any).herdMark || "",
    bcmsHoldingNumber: (farm as any).bcmsHoldingNumber || "",
  };
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="pb-2 border-b border-border mb-5">
      <h3 className="text-base font-bold">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      )}
    </div>
  );
}

export default function FarmSettings() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: farmsData, isLoading } = useListFarms();
  const { mutate: updateFarm, isPending: isSaving } = useUpdateFarm();

  const currentFarm: Farm | undefined = farmsData?.farms?.find((f) => f.id === farmId);

  const [formData, setFormData] = useState<FarmFormData | null>(null);
  const [loadedFarmId, setLoadedFarmId] = useState<number | null>(null);

  useEffect(() => {
    if (currentFarm && currentFarm.id !== loadedFarmId) {
      setFormData(farmToFormData(currentFarm));
      setLoadedFarmId(currentFarm.id);
    }
  }, [currentFarm, loadedFarmId]);

  if (!farmId) return <Redirect href="/select" />;

  if (isLoading) {
    return (
      <AppLayout title="Farm Settings">
        <div className="animate-pulse space-y-6">
          <div className="h-64 bg-black/5 rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  if (!currentFarm) {
    return <Redirect href="/select" />;
  }

  if (!formData) {
    return (
      <AppLayout title="Farm Settings">
        <div className="animate-pulse space-y-6">
          <div className="h-64 bg-black/5 rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  const updateField = (field: keyof Omit<FarmFormData, "sectors" | "isNvzDesignated">, value: string) => {
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
        redTractorId: formData.redTractorId.trim() || undefined,
        sbiNumber: formData.sbiNumber.trim() || undefined,
        totalHectares: formData.totalHectares.trim() || undefined,
        farmManager: formData.farmManager.trim() || undefined,
        holdingType: formData.holdingType || undefined,
        assuranceBody: formData.assuranceBody.trim() || undefined,
        isNvzDesignated: formData.isNvzDesignated,
        eaml2Email: formData.eaml2Email.trim() || undefined,
        flockMark: formData.flockMark.trim() || undefined,
        herdMark: formData.herdMark.trim() || undefined,
        bcmsHoldingNumber: formData.bcmsHoldingNumber.trim() || undefined,
      } as any,
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
      <div className="max-w-3xl space-y-6">

        {/* ── Farm Identity ── */}
        <Card>
          <CardContent className="p-6 md:p-8 space-y-5">
            <SectionHeader
              title="Farm Identity"
              description="Core identifiers used on compliance reports and correspondence."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                <p className="text-xs text-muted-foreground mt-1">County Parish Holding number (APHA / BCMS)</p>
              </div>

              <div>
                <Label htmlFor="settings-sbi">SBI Number</Label>
                <Input
                  id="settings-sbi"
                  placeholder="e.g. 105123456"
                  value={formData.sbiNumber}
                  onChange={e => updateField("sbiNumber", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">Single Business Identifier (Rural Payments Agency)</p>
              </div>

              <div>
                <Label htmlFor="settings-rt-id">Red Tractor Membership Number</Label>
                <Input
                  id="settings-rt-id"
                  placeholder="e.g. 12345678"
                  value={formData.redTractorId}
                  onChange={e => updateField("redTractorId", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">Appears on all compliance reports</p>
              </div>

              <div>
                <Label htmlFor="settings-assurance-body">Certification / Assurance Body</Label>
                <Select
                  value={formData.assuranceBody || "__none__"}
                  onValueChange={v => updateField("assuranceBody", v === "__none__" ? "" : v)}
                >
                  <SelectTrigger id="settings-assurance-body">
                    <SelectValue placeholder="Select body…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Not specified</SelectItem>
                    {ASSURANCE_BODIES.map(b => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">The body that carries out your Red Tractor inspection</p>
              </div>

              <div>
                <Label htmlFor="settings-manager">Farm Manager / Responsible Person</Label>
                <Input
                  id="settings-manager"
                  placeholder="e.g. John Smith"
                  value={formData.farmManager}
                  onChange={e => updateField("farmManager", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">Named on compliance exports and inspection reports</p>
              </div>

              <div>
                <Label htmlFor="settings-holding-type">Holding Type</Label>
                <Select
                  value={formData.holdingType || "__none__"}
                  onValueChange={v => updateField("holdingType", v === "__none__" ? "" : v)}
                >
                  <SelectTrigger id="settings-holding-type">
                    <SelectValue placeholder="Select type…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Not specified</SelectItem>
                    {HOLDING_TYPES.map(ht => (
                      <SelectItem key={ht.value} value={ht.value}>{ht.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Location ── */}
        <Card>
          <CardContent className="p-6 md:p-8 space-y-5">
            <SectionHeader
              title="Location"
              description="Farm address and map reference."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                <Label htmlFor="settings-grid">OS Grid Reference</Label>
                <Input
                  id="settings-grid"
                  placeholder="e.g. SE 605 515"
                  value={formData.gridReference}
                  onChange={e => updateField("gridReference", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Land & NVZ ── */}
        <Card>
          <CardContent className="p-6 md:p-8 space-y-5">
            <SectionHeader
              title="Land & Compliance Details"
              description="Total farm size and regulatory designations that affect compliance rules."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="settings-hectares">Total Area (hectares)</Label>
                <Input
                  id="settings-hectares"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 101.2"
                  value={formData.totalHectares}
                  onChange={e => updateField("totalHectares", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">Used for NVZ, biofuel, and spray compliance calculations</p>
              </div>

              <div>
                <Label htmlFor="settings-acreage">Total Area (acres)</Label>
                <Input
                  id="settings-acreage"
                  type="number"
                  placeholder="e.g. 250"
                  value={formData.totalAcreage}
                  onChange={e => updateField("totalAcreage", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">For reference — enter either or both</p>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <Checkbox
                  checked={formData.isNvzDesignated}
                  onCheckedChange={checked =>
                    setFormData(prev => prev ? { ...prev, isNvzDesignated: !!checked } : prev)
                  }
                  className="mt-0.5"
                />
                <div>
                  <span className="text-sm font-medium group-hover:text-foreground">
                    Farm is within a Nitrate Vulnerable Zone (NVZ)
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Enables NVZ closed period warnings and the 170 kg N/ha organic manure limit across all relevant modules. You can also flag individual fields within the Field Register.
                  </p>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* ── Sectors ── */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <SectionHeader
              title="Farm Sectors"
              description="Select all types of farming activity on this holding. Sectors determine which Red Tractor standards apply."
            />
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
          </CardContent>
        </Card>

        {/* ── eAML2 / BCMS Integration ── */}
        <Card>
          <CardContent className="p-6 md:p-8 space-y-5">
            <SectionHeader
              title="eAML2 / BCMS Integration"
              description="Reference details for electronic livestock movement reporting to APHA and BCMS. These are stored for reference and appear on movement exports — submission to eAML2.net or BCMS is done separately."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <Label htmlFor="settings-eaml2-email">eAML2 / BCMS Registered Email</Label>
                <Input
                  id="settings-eaml2-email"
                  type="email"
                  placeholder="e.g. farmer@example.com"
                  value={formData.eaml2Email}
                  onChange={e => updateField("eaml2Email", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">The email address registered with eAML2.net / BCMS Online for this holding</p>
              </div>

              <div>
                <Label htmlFor="settings-flock-mark">Flock Mark (Sheep &amp; Goats)</Label>
                <Input
                  id="settings-flock-mark"
                  placeholder="e.g. UK123456"
                  value={formData.flockMark}
                  onChange={e => updateField("flockMark", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">APHA-issued 8-character flock mark (UK + 6 digits). Required for all sheep and goat movement documents.</p>
              </div>

              <div>
                <Label htmlFor="settings-herd-mark">Herd Mark (Cattle)</Label>
                <Input
                  id="settings-herd-mark"
                  placeholder="e.g. UK654321"
                  value={formData.herdMark}
                  onChange={e => updateField("herdMark", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">BCMS-issued herd mark for cattle. Printed on cattle passports and required for BCMS movement notifications.</p>
              </div>

              <div>
                <Label htmlFor="settings-bcms-holding">BCMS Holding Number (Cattle)</Label>
                <Input
                  id="settings-bcms-holding"
                  placeholder="e.g. 32541/0001"
                  value={formData.bcmsHoldingNumber}
                  onChange={e => updateField("bcmsHoldingNumber", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">Your BCMS-registered holding number for cattle movements (may differ from CPH format)</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 mt-2">
              <strong>How eAML2 and BCMS work with BDE Farm Trac:</strong> Record all livestock movements in the Movements section. Use the "Export CSV" button to download a structured report you can use as a reference when submitting to eAML2.net (sheep/pigs) or BCMS Online (cattle). Paste the AML reference number back into each movement record once submitted. Movements must be reported within 3 days for cattle.
            </div>
          </CardContent>
        </Card>

        {/* ── Save ── */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} size="lg">
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>

      </div>
    </AppLayout>
  );
}
