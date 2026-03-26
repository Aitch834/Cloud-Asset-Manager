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
import { Loader2, Save, MapPin, Copy, ExternalLink, RefreshCw, Phone, UserRound } from "lucide-react";

const SECTORS = [
  { key: "sectorArable", label: "Arable" },
  { key: "sectorBeef", label: "Beef Cattle" },
  { key: "sectorSheep", label: "Sheep / Lamb" },
  { key: "sectorDairy", label: "Dairy" },
  { key: "sectorPigs", label: "Pigs" },
  { key: "sectorPoultry", label: "Poultry (Broilers / Turkeys)" },
  { key: "sectorEggs", label: "Eggs (Laying Flocks)" },
  { key: "sectorGoats", label: "Goats" },
  { key: "sectorEquine", label: "Equine" },
  { key: "sectorHorticulture", label: "Horticulture" },
  { key: "sectorViticulture", label: "Viticulture" },
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
  latitude: string;
  longitude: string;
  what3words: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  emergencyContactEmail: string;
  totalAcreage: string;
  totalHectares: string;
  redTractorId: string;
  farmManager: string;
  holdingType: string;
  assuranceBody: string;
  isNvzDesignated: boolean;
  sectors: Record<SectorKey, boolean>;
  country: string;
  eaml2Email: string;
  flockMark: string;
  herdMark: string;
  bcmsHoldingNumber: string;
  scotEidNumber: string;
  eidCymruNumber: string;
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
    latitude: (farm as any).latitude || "",
    longitude: (farm as any).longitude || "",
    what3words: (farm as any).what3words || "",
    emergencyContactName: (farm as any).emergencyContactName || "",
    emergencyContactRelationship: (farm as any).emergencyContactRelationship || "",
    emergencyContactPhone: (farm as any).emergencyContactPhone || "",
    emergencyContactEmail: (farm as any).emergencyContactEmail || "",
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
      sectorSheep: !!(farm as any).sectorSheep,
      sectorDairy: !!farm.sectorDairy,
      sectorPigs: !!farm.sectorPigs,
      sectorPoultry: !!farm.sectorPoultry,
      sectorEggs: !!(farm as any).sectorEggs,
      sectorGoats: !!(farm as any).sectorGoats,
      sectorEquine: !!(farm as any).sectorEquine,
      sectorHorticulture: !!farm.sectorHorticulture,
      sectorViticulture: !!(farm as any).sectorViticulture,
    },
    country: (farm as any).country || "england",
    eaml2Email: (farm as any).eaml2Email || "",
    flockMark: (farm as any).flockMark || "",
    herdMark: (farm as any).herdMark || "",
    bcmsHoldingNumber: (farm as any).bcmsHoldingNumber || "",
    scotEidNumber: (farm as any).scotEidNumber || "",
    eidCymruNumber: (farm as any).eidCymruNumber || "",
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
  const [locatingPostcode, setLocatingPostcode] = useState(false);
  const [convertingW3W, setConvertingW3W] = useState(false);
  const [w3wNoKey, setW3wNoKey] = useState(false);
  const [coordsCopied, setCoordsCopied] = useState(false);

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

  const locateFromPostcode = async () => {
    if (!formData?.postcode?.trim()) {
      toast({ title: "Enter a postcode first", variant: "destructive" });
      return;
    }
    setLocatingPostcode(true);
    try {
      const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(formData.postcode.trim())}`);
      const data = await res.json();
      if (data.status === 200 && data.result) {
        const { latitude, longitude } = data.result;
        setFormData(prev => prev ? { ...prev, latitude: String(latitude), longitude: String(longitude) } : prev);
        setW3wNoKey(false);
        toast({ title: "Coordinates set", description: `${latitude}, ${longitude} — drag the pin in W3W to fine-tune.` });
      } else {
        toast({ title: "Postcode not found", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to look up postcode", variant: "destructive" });
    } finally {
      setLocatingPostcode(false);
    }
  };

  const convertToW3W = async () => {
    if (!formData?.latitude || !formData?.longitude) {
      toast({ title: "Set GPS coordinates first", variant: "destructive" });
      return;
    }
    setConvertingW3W(true);
    setW3wNoKey(false);
    try {
      const res = await fetch(`/api/utils/w3w-convert?lat=${encodeURIComponent(formData.latitude)}&lng=${encodeURIComponent(formData.longitude)}`);
      const data = await res.json();
      if (res.status === 503 && data.noKey) {
        setW3wNoKey(true);
        return;
      }
      if (!res.ok) {
        toast({ title: "W3W conversion failed", description: data.error ?? "Unknown error", variant: "destructive" });
        return;
      }
      setFormData(prev => prev ? { ...prev, what3words: data.words } : prev);
      toast({ title: "What3Words address set", description: `///${data.words}${data.nearestPlace ? ` — near ${data.nearestPlace}` : ""}` });
    } catch {
      toast({ title: "Failed to contact W3W service", variant: "destructive" });
    } finally {
      setConvertingW3W(false);
    }
  };

  const copyCoordinates = () => {
    if (!formData?.latitude || !formData?.longitude) return;
    navigator.clipboard.writeText(`${formData.latitude}, ${formData.longitude}`).then(() => {
      setCoordsCopied(true);
      setTimeout(() => setCoordsCopied(false), 2000);
    });
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
        latitude: formData.latitude.trim() || undefined,
        longitude: formData.longitude.trim() || undefined,
        what3words: formData.what3words.trim() || undefined,
        emergencyContactName: formData.emergencyContactName.trim() || undefined,
        emergencyContactRelationship: formData.emergencyContactRelationship.trim() || undefined,
        emergencyContactPhone: formData.emergencyContactPhone.trim() || undefined,
        emergencyContactEmail: formData.emergencyContactEmail.trim() || undefined,
        totalAcreage: formData.totalAcreage ? parseInt(formData.totalAcreage, 10) : undefined,
        ...formData.sectors,
        redTractorId: formData.redTractorId.trim() || undefined,
        sbiNumber: formData.sbiNumber.trim() || undefined,
        totalHectares: formData.totalHectares.trim() || undefined,
        farmManager: formData.farmManager.trim() || undefined,
        holdingType: formData.holdingType || undefined,
        assuranceBody: formData.assuranceBody.trim() || undefined,
        isNvzDesignated: formData.isNvzDesignated,
        country: formData.country || "england",
        eaml2Email: formData.eaml2Email.trim() || undefined,
        flockMark: formData.flockMark.trim() || undefined,
        herdMark: formData.herdMark.trim() || undefined,
        bcmsHoldingNumber: formData.bcmsHoldingNumber.trim() || undefined,
        scotEidNumber: formData.scotEidNumber.trim() || undefined,
        eidCymruNumber: formData.eidCymruNumber.trim() || undefined,
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

              <div>
                <Label htmlFor="settings-country">Country / Devolved Nation</Label>
                <Select
                  value={formData.country || "england"}
                  onValueChange={v => updateField("country", v)}
                >
                  <SelectTrigger id="settings-country">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="england">England</SelectItem>
                    <SelectItem value="scotland">Scotland</SelectItem>
                    <SelectItem value="wales">Wales</SelectItem>
                    <SelectItem value="northern_ireland">Northern Ireland</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Determines which livestock movement portals apply to this holding (eAML2, ScotEID, EIDCymru, or NIFAIS)</p>
              </div>

              {/* ── GPS Coordinates ── */}
              <div className="md:col-span-2 pt-2 border-t border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={14} className="text-muted-foreground" />
                  <span className="text-sm font-semibold text-foreground">GPS Coordinates &amp; What3Words</span>
                  <span className="text-xs text-muted-foreground">— for emergency services, contractors and compliance site visits</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <Label htmlFor="settings-lat">Latitude</Label>
                    <Input
                      id="settings-lat"
                      className="mt-1 font-mono text-sm"
                      placeholder="e.g. 53.958333"
                      value={formData.latitude}
                      onChange={e => updateField("latitude", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="settings-lng">Longitude</Label>
                    <Input
                      id="settings-lng"
                      className="mt-1 font-mono text-sm"
                      placeholder="e.g. -1.080278"
                      value={formData.longitude}
                      onChange={e => updateField("longitude", e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={locateFromPostcode}
                    disabled={locatingPostcode || !formData.postcode?.trim()}
                  >
                    {locatingPostcode ? <Loader2 size={13} className="mr-1.5 animate-spin" /> : <MapPin size={13} className="mr-1.5" />}
                    Locate from Postcode
                  </Button>

                  {formData.latitude && formData.longitude && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={copyCoordinates}
                      >
                        <Copy size={13} className="mr-1.5" />
                        {coordsCopied ? "Copied!" : "Copy Coordinates"}
                      </Button>
                      <a
                        href={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button type="button" variant="outline" size="sm">
                          <ExternalLink size={13} className="mr-1.5" />
                          View in Maps
                        </Button>
                      </a>
                    </>
                  )}
                </div>

                {/* What3Words */}
                <div>
                  <Label htmlFor="settings-w3w">What3Words Address</Label>
                  <div className="flex gap-2 mt-1">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#e11d48] select-none">///</span>
                      <Input
                        id="settings-w3w"
                        className="pl-9 font-mono text-sm"
                        placeholder="three.word.address"
                        value={formData.what3words}
                        onChange={e => updateField("what3words", e.target.value.replace(/^\/+/, ""))}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={convertToW3W}
                      disabled={convertingW3W || !formData.latitude || !formData.longitude}
                      title="Auto-convert from GPS coordinates"
                    >
                      {convertingW3W ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                      <span className="ml-1.5 hidden sm:inline">Auto-convert</span>
                    </Button>
                    {formData.what3words && (
                      <a
                        href={`https://what3words.com/${formData.what3words}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button type="button" variant="outline" size="sm">
                          <ExternalLink size={13} />
                        </Button>
                      </a>
                    )}
                  </div>

                  {w3wNoKey && (
                    <div className="mt-2 flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                      <span className="text-amber-600 text-xs font-semibold mt-0.5">⚠</span>
                      <p className="text-xs text-amber-700">
                        Auto-convert needs a <strong>W3W_API_KEY</strong> environment secret. Register for a free key at{" "}
                        <a href="https://developer.what3words.com" target="_blank" rel="noopener noreferrer" className="underline">developer.what3words.com</a>{" "}
                        and add it to your project secrets. You can also type or paste the W3W address manually above.
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Used by emergency services, delivery drivers and Red Tractor assessors. Find yours at{" "}
                    <a href="https://what3words.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">what3words.com</a>.
                  </p>
                </div>
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

        {/* ── Livestock Movement Reporting ── */}
        <Card>
          <CardContent className="p-6 md:p-8 space-y-5">
            <SectionHeader
              title="Livestock Movement Reporting"
              description="Reference identifiers for electronic livestock movement reporting. Stored here and included in movement exports — submission to the relevant government portal is done separately."
            />

            {/* Country-specific guidance banner */}
            {formData.country === "scotland" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <strong>Scotland:</strong> All livestock movements (cattle, sheep, goats, pigs) are reported to <strong>ScotEID</strong> — Scotland's national electronic identification database. Register at{" "}
                <a href="https://www.scoteid.com" target="_blank" rel="noopener noreferrer" className="underline">scoteid.com</a>.
              </div>
            )}
            {formData.country === "wales" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <strong>Wales:</strong> Sheep and goat movements are reported via <strong>EIDCymru</strong> (eidcymru.org). Cattle movements use <strong>BCMS Online</strong> as in England. Pig movements use <strong>eAML2.org.uk</strong>.
              </div>
            )}
            {formData.country === "northern_ireland" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <strong>Northern Ireland:</strong> Livestock movements are recorded on <strong>NIFAIS</strong> (Northern Ireland Food Animal Information System) for cattle and <strong>APHIS</strong> for sheep and pigs. Contact DAERA for registration.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <Label htmlFor="settings-eaml2-email">Registered Email Address</Label>
                <Input
                  id="settings-eaml2-email"
                  type="email"
                  placeholder="e.g. farmer@example.com"
                  value={formData.eaml2Email}
                  onChange={e => updateField("eaml2Email", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">Email registered with your livestock movement portal (eAML2 / BCMS / ScotEID / EIDCymru)</p>
              </div>

              <div>
                <Label htmlFor="settings-flock-mark">Flock Mark (Sheep, Goats &amp; Pigs)</Label>
                <Input
                  id="settings-flock-mark"
                  placeholder="e.g. UK123456"
                  value={formData.flockMark}
                  onChange={e => updateField("flockMark", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">APHA-issued 8-character flock mark (UK + 6 digits). Required for all sheep, goat and pig movement documents.</p>
              </div>

              <div>
                <Label htmlFor="settings-herd-mark">Herd Mark (Cattle)</Label>
                <Input
                  id="settings-herd-mark"
                  placeholder="e.g. UK654321"
                  value={formData.herdMark}
                  onChange={e => updateField("herdMark", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">BCMS / ScotEID herd mark for cattle. Printed on cattle passports and required for movement notifications.</p>
              </div>

              <div>
                <Label htmlFor="settings-bcms-holding">BCMS Holding Number (Cattle)</Label>
                <Input
                  id="settings-bcms-holding"
                  placeholder="e.g. 32541/0001"
                  value={formData.bcmsHoldingNumber}
                  onChange={e => updateField("bcmsHoldingNumber", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">Your BCMS-registered holding number for cattle movements. Used in England and Wales.</p>
              </div>

              {(formData.country === "scotland") && (
                <div>
                  <Label htmlFor="settings-scoteid">ScotEID Flock / Herd Number</Label>
                  <Input
                    id="settings-scoteid"
                    placeholder="e.g. SC123456"
                    value={formData.scotEidNumber}
                    onChange={e => updateField("scotEidNumber", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Your ScotEID-registered flock or herd number for electronic movement reporting in Scotland.</p>
                </div>
              )}

              {(formData.country === "wales") && (
                <div>
                  <Label htmlFor="settings-eidcymru">EIDCymru Flock Number (Sheep &amp; Goats)</Label>
                  <Input
                    id="settings-eidcymru"
                    placeholder="e.g. WL123456"
                    value={formData.eidCymruNumber}
                    onChange={e => updateField("eidCymruNumber", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Your EIDCymru-registered flock number for electronic sheep and goat movement reporting in Wales.</p>
                </div>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900 mt-2">
              <strong>How movement reporting works with BDE Farm Trac:</strong> Record all livestock movements in the Movements section. Use the "Export CSV" button to download a structured report as a reference when submitting to your relevant portal. Paste the movement reference number back into each record once submitted.
              {" "}<strong>Cattle</strong> must be reported within 3 days.{" "}
              {formData.country === "scotland" && <>All species in Scotland are reported to <strong>ScotEID</strong>.</>}
              {formData.country === "wales" && <>In Wales, sheep and goats use <strong>EIDCymru</strong>; cattle use <strong>BCMS Online</strong>.</>}
              {(formData.country === "england" || !formData.country) && <>In England, sheep, goats and pigs use <strong>eAML2.org.uk</strong>; cattle use <strong>BCMS Online</strong>.</>}
              {formData.country === "northern_ireland" && <>In Northern Ireland, use <strong>NIFAIS</strong> for cattle and <strong>APHIS</strong> for sheep and pigs.</>}
            </div>
          </CardContent>
        </Card>

        {/* ── Emergency Contact ── */}
        <Card>
          <CardContent className="p-6 md:p-8 space-y-5">
            <SectionHeader
              title="Emergency Contact"
              description="The person to contact first in the event of a serious accident or incident on this holding. Visible to all staff with access to Farm Settings."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="settings-ec-name">Full Name</Label>
                <div className="relative mt-1">
                  <UserRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    id="settings-ec-name"
                    className="pl-8"
                    placeholder="e.g. Jane Smith"
                    value={formData.emergencyContactName}
                    onChange={e => updateField("emergencyContactName", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="settings-ec-rel">Relationship</Label>
                <Input
                  id="settings-ec-rel"
                  className="mt-1"
                  placeholder="e.g. Spouse, Farm Owner, Business Partner"
                  value={formData.emergencyContactRelationship}
                  onChange={e => updateField("emergencyContactRelationship", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="settings-ec-phone">Phone Number</Label>
                <div className="relative mt-1">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    id="settings-ec-phone"
                    type="tel"
                    className="pl-8"
                    placeholder="e.g. 07700 900123"
                    value={formData.emergencyContactPhone}
                    onChange={e => updateField("emergencyContactPhone", e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Include country code if outside the UK</p>
              </div>

              <div>
                <Label htmlFor="settings-ec-email">Email Address</Label>
                <Input
                  id="settings-ec-email"
                  type="email"
                  className="mt-1"
                  placeholder="e.g. jane@example.com"
                  value={formData.emergencyContactEmail}
                  onChange={e => updateField("emergencyContactEmail", e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-lg">
              <Phone size={15} className="text-red-600 mt-0.5 shrink-0" />
              <p className="text-xs text-red-800">
                <strong>In a life-threatening emergency, always call 999 first.</strong>{" "}
                This contact is for follow-up notification and farm management decisions, not as a substitute for emergency services.
                {formData.emergencyContactPhone && (
                  <> Quick-dial: <a href={`tel:${formData.emergencyContactPhone.replace(/\s/g, "")}`} className="font-semibold underline">{formData.emergencyContactPhone}</a>.</>
                )}
              </p>
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
