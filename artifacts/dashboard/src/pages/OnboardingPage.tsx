import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useSafeUser } from "@/hooks/use-safe-clerk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";
import {
  Building2, Tractor, Package, CreditCard,
  CheckCircle2, ChevronRight, Loader2, ArrowLeft, Lock
} from "lucide-react";

const SECTORS = [
  { key: "sectorArable", label: "Arable" },
  { key: "sectorBeef", label: "Beef Cattle" },
  { key: "sectorSheep", label: "Sheep / Lamb" },
  { key: "sectorDairy", label: "Dairy" },
  { key: "sectorPigs", label: "Pigs" },
  { key: "sectorPoultry", label: "Poultry" },
  { key: "sectorEggs", label: "Eggs" },
  { key: "sectorGoats", label: "Goats" },
  { key: "sectorEquine", label: "Equine" },
  { key: "sectorHorticulture", label: "Horticulture" },
  { key: "sectorViticulture", label: "Viticulture" },
  { key: "sectorFreshProduce", label: "Fresh Produce" },
] as const;

const MODULE_KEY_TO_SECTOR: Record<string, string> = {
  "viticulture": "sectorViticulture",
  "organic-viticulture": "sectorViticulture",
  "beef-production": "sectorBeef",
  "sheep-production": "sectorSheep",
  "sheep-dairy": "sectorSheep",
  "organic-sheep-dairy": "sectorSheep",
  "dairy-management": "sectorDairy",
  "goat-production": "sectorGoats",
  "goat-dairy": "sectorGoats",
  "organic-goat-dairy": "sectorGoats",
  "field-crop-management": "sectorArable",
  "organic-arable": "sectorArable",
};

interface Module {
  id: number;
  name: string;
  moduleKey: string;
  description: string | null;
  monthlyPricePence: number;
  isCore: boolean;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50);
}

const steps = [
  { id: 1, label: "Your Business", icon: Building2 },
  { id: 2, label: "Farm Details", icon: Tractor },
  { id: 3, label: "Choose Modules", icon: Package },
  { id: 4, label: "Get Started", icon: CreditCard },
];

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const { user } = useSafeUser();
  const { toast } = useToast();
  const { setTenantSlug, setFarmId } = useAppStore();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [createdTenantSlug, setCreatedTenantSlug] = useState<string | null>(null);
  const [createdFarmId, setCreatedFarmId] = useState<number | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [selectedModuleIds, setSelectedModuleIds] = useState<Set<number>>(new Set());

  const [bizName, setBizName] = useState("");
  const [bizEmail, setBizEmail] = useState(user?.primaryEmailAddress?.emailAddress ?? "");
  const [bizPhone, setBizPhone] = useState("");
  const [bizAddress, setBizAddress] = useState("");

  const [farmName, setFarmName] = useState("");
  const [farmCph, setFarmCph] = useState("");
  const [farmPostcode, setFarmPostcode] = useState("");
  const [farmSectors, setFarmSectors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress && !bizEmail) {
      setBizEmail(user.primaryEmailAddress.emailAddress);
    }
  }, [user]);

  useEffect(() => {
    if (step === 3 && modules.length === 0) {
      setLoadingModules(true);
      fetch(`${import.meta.env.BASE_URL}api/billing/modules`)
        .then((r) => r.json())
        .then((data) => {
          const mods: Module[] = data.modules ?? [];
          setModules(mods);
          const coreIds = new Set(mods.filter((m) => m.isCore).map((m) => m.id));
          setSelectedModuleIds(coreIds);
        })
        .catch(() => toast({ title: "Could not load modules", variant: "destructive" }))
        .finally(() => setLoadingModules(false));
    }
  }, [step]);

  const toggleModule = (id: number, isCore: boolean) => {
    if (isCore) return;
    const adding = !selectedModuleIds.has(id);
    setSelectedModuleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (adding && createdFarmId && createdTenantSlug) {
      const mod = modules.find((m) => m.id === id);
      if (mod) {
        const sectorKey = MODULE_KEY_TO_SECTOR[mod.moduleKey];
        if (sectorKey && !farmSectors[sectorKey]) {
          const updated = { ...farmSectors, [sectorKey]: true };
          setFarmSectors(updated);
          fetch(`${import.meta.env.BASE_URL}api/farms/${createdFarmId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "x-tenant-slug": createdTenantSlug },
            body: JSON.stringify({ name: farmName, ...updated }),
          }).catch(() => {});
        }
      }
    }
  };

  const monthlyTotal = modules
    .filter((m) => selectedModuleIds.has(m.id))
    .reduce((sum, m) => sum + m.monthlyPricePence, 0);

  async function handleBusinessSubmit() {
    if (!bizName.trim() || !bizEmail.trim()) {
      toast({ title: "Business name and email are required", variant: "destructive" });
      return;
    }
    const slug = slugify(bizName);
    if (!slug) {
      toast({ title: "Business name must contain letters or numbers", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/tenants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: bizName.trim(),
          slug,
          contactEmail: bizEmail.trim(),
          contactPhone: bizPhone.trim() || undefined,
          address: bizAddress.trim() || undefined,
        }),
      });
      if (res.status === 409) {
        const uniqueSlug = `${slug}-${Date.now().toString(36)}`;
        const retry = await fetch(`${import.meta.env.BASE_URL}api/tenants`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: bizName.trim(),
            slug: uniqueSlug,
            contactEmail: bizEmail.trim(),
            contactPhone: bizPhone.trim() || undefined,
            address: bizAddress.trim() || undefined,
          }),
        });
        if (!retry.ok) throw new Error("Failed to create business");
        const data = await retry.json();
        setCreatedTenantSlug(data.tenant.slug);
        setTenantSlug(data.tenant.slug);
      } else if (!res.ok) {
        throw new Error("Failed to create business");
      } else {
        const data = await res.json();
        setCreatedTenantSlug(data.tenant.slug);
        setTenantSlug(data.tenant.slug);
      }
      setStep(2);
    } catch {
      toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFarmSubmit() {
    if (!farmName.trim()) {
      toast({ title: "Farm name is required", variant: "destructive" });
      return;
    }
    if (!createdTenantSlug) {
      toast({ title: "Business not created yet", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/tenants/current/farms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-slug": createdTenantSlug,
        },
        body: JSON.stringify({
          name: farmName.trim(),
          cphNumber: farmCph.trim() || undefined,
          postcode: farmPostcode.trim() || undefined,
          ...farmSectors,
        }),
      });
      if (!res.ok) throw new Error("Failed to create farm");
      const data = await res.json();
      setCreatedFarmId(data.farm.id);
      setFarmId(data.farm.id);
      setStep(3);
    } catch {
      toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubscribe() {
    if (!createdFarmId || !createdTenantSlug) return;
    const nonCoreIds = Array.from(selectedModuleIds).filter((id) => {
      const mod = modules.find((m) => m.id === id);
      return mod && !mod.isCore;
    });
    if (nonCoreIds.length === 0) {
      setLocation("/select");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/billing/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-slug": createdTenantSlug,
        },
        body: JSON.stringify({ farmId: createdFarmId, moduleIds: nonCoreIds }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        toast({ title: err.error ?? "Checkout failed", variant: "destructive" });
        return;
      }
      const data = await res.json() as { checkoutUrl?: string; url?: string };
      const redirectUrl = data.checkoutUrl ?? data.url;
      if (redirectUrl) window.location.href = redirectUrl;
      else setLocation("/select");
    } catch {
      toast({ title: "Something went wrong.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b border-border px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
          <img src={`${import.meta.env.BASE_URL}images/logo-icon.png`} alt="Logo" className="w-5 h-5 object-contain" />
        </div>
        <span className="font-display font-bold text-foreground">BDE Farm Trac</span>
        <span className="ml-auto text-sm text-muted-foreground">Setting up your account…</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start py-10 px-4">
        <div className="w-full max-w-2xl">
          <div className="flex items-center gap-2 mb-10">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 ${step > s.id ? "text-primary" : step === s.id ? "text-foreground" : "text-muted-foreground"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${step > s.id ? "bg-primary border-primary text-primary-foreground" : step === s.id ? "border-primary text-primary" : "border-border"}`}>
                    {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 w-8 sm:w-12 rounded ${step > s.id ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-display font-bold text-foreground mb-1">Your business details</h1>
                <p className="text-muted-foreground">We'll use these to set up your Farm Trac account.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="biz-name">Business / Trading name *</Label>
                  <Input id="biz-name" placeholder="e.g. Oakfield Farms Ltd" value={bizName} onChange={(e) => setBizName(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="biz-email">Contact email *</Label>
                  <Input id="biz-email" type="email" placeholder="you@example.com" value={bizEmail} onChange={(e) => setBizEmail(e.target.value)} className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="biz-phone">Phone number</Label>
                    <Input id="biz-phone" placeholder="+44 7700 900000" value={bizPhone} onChange={(e) => setBizPhone(e.target.value)} className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="biz-address">Business address</Label>
                  <Input id="biz-address" placeholder="123 Farm Lane, Shropshire" value={bizAddress} onChange={(e) => setBizAddress(e.target.value)} className="mt-1" />
                </div>
              </div>
              <Button onClick={handleBusinessSubmit} disabled={submitting} className="w-full" size="lg">
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <button onClick={() => setStep(1)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-display font-bold text-foreground mb-1">Farm details</h1>
                  <p className="text-muted-foreground">Tell us about your farm operation.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="farm-name">Farm name *</Label>
                  <Input id="farm-name" placeholder="e.g. Home Farm" value={farmName} onChange={(e) => setFarmName(e.target.value)} className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="farm-cph">CPH Number</Label>
                    <Input id="farm-cph" placeholder="e.g. 12/345/6789" value={farmCph} onChange={(e) => setFarmCph(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="farm-postcode">Postcode</Label>
                    <Input id="farm-postcode" placeholder="e.g. SY4 1AB" value={farmPostcode} onChange={(e) => setFarmPostcode(e.target.value)} className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">Farm sectors (tick all that apply)</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {SECTORS.map((s) => (
                      <label key={s.key} className="flex items-center gap-2 cursor-pointer select-none">
                        <Checkbox
                          checked={!!farmSectors[s.key]}
                          onCheckedChange={(v) => setFarmSectors((prev) => ({ ...prev, [s.key]: !!v }))}
                        />
                        <span className="text-sm">{s.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <Button onClick={handleFarmSubmit} disabled={submitting} className="w-full" size="lg">
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <button onClick={() => setStep(2)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-display font-bold text-foreground mb-1">Choose your modules</h1>
                  <p className="text-muted-foreground">Red Tractor Compliance is always included. Add what you need.</p>
                </div>
              </div>

              {loadingModules ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-2">
                  {modules.map((mod) => {
                    const isSelected = selectedModuleIds.has(mod.id);
                    const price = mod.monthlyPricePence === 0 ? "Included" : `£${(mod.monthlyPricePence / 100).toFixed(0)}/mo`;
                    return (
                      <button
                        key={mod.id}
                        type="button"
                        onClick={() => toggleModule(mod.id, mod.isCore)}
                        className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${
                          mod.isCore
                            ? "border-primary/40 bg-primary/5 cursor-default"
                            : isSelected
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        <div className="mt-0.5">
                          {mod.isCore ? (
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          ) : isSelected ? (
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-border" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-sm text-foreground">{mod.name}</p>
                            <span className={`text-xs font-semibold flex-shrink-0 ${mod.isCore ? "text-primary" : "text-muted-foreground"}`}>{price}</span>
                          </div>
                          {mod.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{mod.description}</p>
                          )}
                        </div>
                        {mod.isCore && (
                          <Lock className="w-3.5 h-3.5 text-primary/60 mt-1 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {monthlyTotal > 0 && (
                <div className="rounded-xl border border-border p-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Estimated monthly total</span>
                  <span className="font-bold text-foreground">£{(monthlyTotal / 100).toFixed(0)}/month</span>
                </div>
              )}

              <Button onClick={() => setStep(4)} className="w-full" size="lg">
                Review & Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <button onClick={() => setStep(3)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-display font-bold text-foreground mb-1">You're almost there</h1>
                  <p className="text-muted-foreground">Review your setup and get started.</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-border p-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Business</p>
                  <p className="font-medium">{bizName}</p>
                  <p className="text-sm text-muted-foreground">{bizEmail}</p>
                </div>
                <div className="rounded-xl border border-border p-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Farm</p>
                  <p className="font-medium">{farmName}</p>
                  {farmPostcode && <p className="text-sm text-muted-foreground">{farmPostcode}</p>}
                </div>
                <div className="rounded-xl border border-border p-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Selected Modules</p>
                  {modules.filter((m) => selectedModuleIds.has(m.id)).map((m) => (
                    <div key={m.id} className="flex items-center justify-between">
                      <span className="text-sm">{m.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {m.monthlyPricePence === 0 ? "Included" : `£${(m.monthlyPricePence / 100).toFixed(0)}/mo`}
                      </span>
                    </div>
                  ))}
                  {monthlyTotal > 0 && (
                    <div className="flex items-center justify-between pt-2 border-t border-border mt-2">
                      <span className="text-sm font-semibold">Monthly total</span>
                      <span className="text-sm font-bold">£{(monthlyTotal / 100).toFixed(0)}/mo</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {monthlyTotal > 0 && (
                  <Button onClick={handleSubscribe} disabled={submitting} className="w-full" size="lg">
                    {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />}
                    Subscribe Now — £{(monthlyTotal / 100).toFixed(0)}/month
                  </Button>
                )}
                <Button
                  variant={monthlyTotal > 0 ? "outline" : "default"}
                  size="lg"
                  className="w-full"
                  onClick={() => setLocation("/select")}
                >
                  {monthlyTotal > 0 ? "Start without subscription" : "Go to Dashboard"}
                </Button>
                {monthlyTotal > 0 && (
                  <p className="text-center text-xs text-muted-foreground">
                    You can subscribe to additional modules at any time from Settings.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
