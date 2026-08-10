import { u as useLocation, a as useToast, b as useAppStore, c as useQueryClient, r as reactExports, j as jsxRuntimeExports, B as Building2, L as Label, I as Input, d as Button, e as LoaderCircle, C as Checkbox } from "./index-D4AsNSyV.js";
import { u as useSafeUser, P as Package } from "./use-safe-clerk-n9BjUZc7.js";
import { a as apiUrl } from "./api-Dhdsf4oM.js";
import { T as Tractor, C as ChevronRight, A as ArrowLeft } from "./tractor-CDXDtxgl.js";
import { C as CreditCard } from "./credit-card-5uByhHC3.js";
import { C as CircleCheck } from "./circle-check-CNIeLZlc.js";
import { L as Lock } from "./lock-CAD7q62M.js";
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
  { key: "sectorDeer", label: "Deer / Venison" }
];
const MODULE_KEY_TO_SECTOR = {
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
  "venison-production": "sectorDeer",
  "field-crop-management": "sectorArable",
  "organic-arable": "sectorArable"
};
async function extractError(res, fallback) {
  try {
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = await res.json();
      if (body.error) return body.error;
    }
  } catch {
  }
  if (res.status === 401) return "Your session has expired. Please sign in again.";
  return `${fallback} (server responded with ${res.status})`;
}
function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 50);
}
const steps = [
  { id: 1, label: "Your Business", icon: Building2 },
  { id: 2, label: "Farm Details", icon: Tractor },
  { id: 3, label: "Choose Modules", icon: Package },
  { id: 4, label: "Get Started", icon: CreditCard }
];
function OnboardingPage() {
  const [, setLocation] = useLocation();
  const { user } = useSafeUser();
  const { toast } = useToast();
  const { setTenantSlug, setFarmId } = useAppStore();
  const queryClient = useQueryClient();
  function finishOnboarding() {
    queryClient.invalidateQueries();
    setLocation("/select");
  }
  const [step, setStep] = reactExports.useState(1);
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [createdTenantSlug, setCreatedTenantSlug] = reactExports.useState(null);
  const [createdFarmId, setCreatedFarmId] = reactExports.useState(null);
  const [modules, setModules] = reactExports.useState([]);
  const [loadingModules, setLoadingModules] = reactExports.useState(false);
  const [selectedModuleIds, setSelectedModuleIds] = reactExports.useState(/* @__PURE__ */ new Set());
  const [bizName, setBizName] = reactExports.useState("");
  const [bizEmail, setBizEmail] = reactExports.useState(user?.primaryEmailAddress?.emailAddress ?? "");
  const [bizPhone, setBizPhone] = reactExports.useState("");
  const [bizAddress, setBizAddress] = reactExports.useState("");
  const [farmName, setFarmName] = reactExports.useState("");
  const [farmCph, setFarmCph] = reactExports.useState("");
  const [farmPostcode, setFarmPostcode] = reactExports.useState("");
  const [farmSectors, setFarmSectors] = reactExports.useState({});
  reactExports.useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress && !bizEmail) {
      setBizEmail(user.primaryEmailAddress.emailAddress);
    }
  }, [user]);
  reactExports.useEffect(() => {
    if (step === 3 && modules.length === 0) {
      setLoadingModules(true);
      fetch(apiUrl("billing/modules")).then((r) => r.json()).then((data) => {
        const mods = data.modules ?? [];
        setModules(mods);
        const coreIds = new Set(mods.filter((m) => m.isCore).map((m) => m.id));
        setSelectedModuleIds(coreIds);
      }).catch(() => toast({ title: "Could not load modules", variant: "destructive" })).finally(() => setLoadingModules(false));
    }
  }, [step]);
  const toggleModule = (id, isCore) => {
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
          fetch(apiUrl(`farms/${createdFarmId}`), {
            method: "PUT",
            headers: { "Content-Type": "application/json", "x-tenant-slug": createdTenantSlug },
            body: JSON.stringify({ name: farmName, ...updated })
          }).then(async (r) => {
            if (!r.ok) {
              const t = await r.text().catch(() => "");
              throw new Error(t || `Request failed (${r.status})`);
            }
            return r;
          }).catch(() => {
          });
        }
      }
    }
  };
  const monthlyTotal = modules.filter((m) => selectedModuleIds.has(m.id)).reduce((sum, m) => sum + m.monthlyPricePence, 0);
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
      const res = await fetch(apiUrl("tenants"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: bizName.trim(),
          slug,
          contactEmail: bizEmail.trim(),
          contactPhone: bizPhone.trim() || void 0,
          address: bizAddress.trim() || void 0
        })
      });
      if (res.status === 409) {
        const uniqueSlug = `${slug}-${Date.now().toString(36)}`;
        const retry = await fetch(apiUrl("tenants"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: bizName.trim(),
            slug: uniqueSlug,
            contactEmail: bizEmail.trim(),
            contactPhone: bizPhone.trim() || void 0,
            address: bizAddress.trim() || void 0
          })
        });
        if (!retry.ok) throw new Error(await extractError(retry, "Could not create your business"));
        const data = await retry.json();
        setCreatedTenantSlug(data.tenant.slug);
        setTenantSlug(data.tenant.slug);
      } else if (!res.ok) {
        throw new Error(await extractError(res, "Could not create your business"));
      } else {
        const data = await res.json();
        setCreatedTenantSlug(data.tenant.slug);
        setTenantSlug(data.tenant.slug);
      }
      setStep(2);
    } catch (err) {
      toast({
        title: "Could not create your business",
        description: err instanceof Error ? err.message : "Something went wrong. Please try again.",
        variant: "destructive"
      });
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
      const res = await fetch(apiUrl("tenants/current/farms"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-slug": createdTenantSlug
        },
        body: JSON.stringify({
          name: farmName.trim(),
          cphNumber: farmCph.trim() || void 0,
          postcode: farmPostcode.trim() || void 0,
          ...farmSectors
        })
      });
      if (!res.ok) throw new Error(await extractError(res, "Could not create your farm"));
      const data = await res.json();
      setCreatedFarmId(data.farm.id);
      setFarmId(data.farm.id);
      setStep(3);
    } catch (err) {
      toast({
        title: "Could not create your farm",
        description: err instanceof Error ? err.message : "Something went wrong. Please try again.",
        variant: "destructive"
      });
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
      finishOnboarding();
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(apiUrl("billing/checkout"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-slug": createdTenantSlug
        },
        body: JSON.stringify({ farmId: createdFarmId, moduleIds: nonCoreIds })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast({ title: err.error ?? "Checkout failed", variant: "destructive" });
        return;
      }
      const data = await res.json();
      const redirectUrl = data.checkoutUrl ?? data.url;
      if (redirectUrl) window.location.href = redirectUrl;
      else finishOnboarding();
    } catch {
      toast({ title: "Something went wrong.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border px-6 py-4 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-xl bg-primary flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: `${"/dashboard/"}images/logo-icon.png`, alt: "Logo", className: "w-5 h-5 object-contain" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display font-bold text-foreground", children: "BDE Farm Trac" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto text-sm text-muted-foreground", children: "Setting up your account…" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 flex flex-col items-center justify-start py-10 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 mb-10", children: steps.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-2 ${step > s.id ? "text-primary" : step === s.id ? "text-foreground" : "text-muted-foreground"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${step > s.id ? "bg-primary border-primary text-primary-foreground" : step === s.id ? "border-primary text-primary" : "border-border"}`, children: step > s.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4" }) : s.id }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:block text-sm font-medium", children: s.label })
        ] }),
        i < steps.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex-1 h-0.5 w-8 sm:w-12 rounded ${step > s.id ? "bg-primary" : "bg-border"}` })
      ] }, s.id)) }),
      step === 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-display font-bold text-foreground mb-1", children: "Your business details" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "We'll use these to set up your Farm Trac account." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "biz-name", children: "Business / Trading name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "biz-name", placeholder: "e.g. Oakfield Farms Ltd", value: bizName, onChange: (e) => setBizName(e.target.value), className: "mt-1" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "biz-email", children: "Contact email *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "biz-email", type: "email", placeholder: "you@example.com", value: bizEmail, onChange: (e) => setBizEmail(e.target.value), className: "mt-1" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "biz-phone", children: "Phone number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "biz-phone", placeholder: "+44 7700 900000", value: bizPhone, onChange: (e) => setBizPhone(e.target.value), className: "mt-1" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "biz-address", children: "Business address" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "biz-address", placeholder: "123 Farm Lane, Shropshire", value: bizAddress, onChange: (e) => setBizAddress(e.target.value), className: "mt-1" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleBusinessSubmit, disabled: submitting, className: "w-full", size: "lg", children: [
          submitting ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 mr-2 animate-spin" }) : null,
          "Continue",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4 ml-2" })
        ] })
      ] }),
      step === 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setStep(1), className: "text-muted-foreground hover:text-foreground transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-5 h-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-display font-bold text-foreground mb-1", children: "Farm details" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Tell us about your farm operation." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "farm-name", children: "Farm name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "farm-name", placeholder: "e.g. Home Farm", value: farmName, onChange: (e) => setFarmName(e.target.value), className: "mt-1" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "farm-cph", children: "CPH Number" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "farm-cph", placeholder: "e.g. 12/345/6789", value: farmCph, onChange: (e) => setFarmCph(e.target.value), className: "mt-1" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "farm-postcode", children: "Postcode" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "farm-postcode", placeholder: "e.g. SY4 1AB", value: farmPostcode, onChange: (e) => setFarmPostcode(e.target.value), className: "mt-1" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-2 block", children: "Farm sectors (tick all that apply)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3", children: SECTORS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 cursor-pointer select-none", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Checkbox,
                {
                  checked: !!farmSectors[s.key],
                  onCheckedChange: (v) => setFarmSectors((prev) => ({ ...prev, [s.key]: !!v }))
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: s.label })
            ] }, s.key)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleFarmSubmit, disabled: submitting, className: "w-full", size: "lg", children: [
          submitting ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 mr-2 animate-spin" }) : null,
          "Continue",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4 ml-2" })
        ] })
      ] }),
      step === 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setStep(2), className: "text-muted-foreground hover:text-foreground transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-5 h-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-display font-bold text-foreground mb-1", children: "Choose your modules" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Red Tractor Compliance is always included. Add what you need." })
          ] })
        ] }),
        loadingModules ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin text-muted-foreground" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: modules.map((mod) => {
          const isSelected = selectedModuleIds.has(mod.id);
          const price = mod.monthlyPricePence === 0 ? "Included" : `£${(mod.monthlyPricePence / 100).toFixed(0)}/mo`;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => toggleModule(mod.id, mod.isCore),
              className: `w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${mod.isCore ? "border-primary/40 bg-primary/5 cursor-default" : isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/40"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5", children: mod.isCore ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-5 h-5 text-primary" }) : isSelected ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-5 h-5 text-primary" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-5 h-5 rounded-full border-2 border-border" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-sm text-foreground", children: mod.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-semibold flex-shrink-0 ${mod.isCore ? "text-primary" : "text-muted-foreground"}`, children: price })
                  ] }),
                  mod.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5 leading-relaxed", children: mod.description })
                ] }),
                mod.isCore && /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-3.5 h-3.5 text-primary/60 mt-1 flex-shrink-0" })
              ]
            },
            mod.id
          );
        }) }),
        monthlyTotal > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border p-4 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "Estimated monthly total" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-foreground", children: [
            "£",
            (monthlyTotal / 100).toFixed(0),
            "/month"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setStep(4), className: "w-full", size: "lg", children: [
          "Review & Continue",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4 ml-2" })
        ] })
      ] }),
      step === 4 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setStep(3), className: "text-muted-foreground hover:text-foreground transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-5 h-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-display font-bold text-foreground mb-1", children: "You're almost there" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Review your setup and get started." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border p-4 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Business" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: bizName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: bizEmail })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border p-4 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Farm" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: farmName }),
            farmPostcode && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: farmPostcode })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border p-4 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Selected Modules" }),
            modules.filter((m) => selectedModuleIds.has(m.id)).map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: m.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: m.monthlyPricePence === 0 ? "Included" : `£${(m.monthlyPricePence / 100).toFixed(0)}/mo` })
            ] }, m.id)),
            monthlyTotal > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pt-2 border-t border-border mt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: "Monthly total" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-bold", children: [
                "£",
                (monthlyTotal / 100).toFixed(0),
                "/mo"
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          monthlyTotal > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleSubscribe, disabled: submitting, className: "w-full", size: "lg", children: [
            submitting ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 mr-2 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "w-4 h-4 mr-2" }),
            "Subscribe Now — £",
            (monthlyTotal / 100).toFixed(0),
            "/month"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: monthlyTotal > 0 ? "outline" : "default",
              size: "lg",
              className: "w-full",
              onClick: finishOnboarding,
              children: monthlyTotal > 0 ? "Start without subscription" : "Go to Dashboard"
            }
          ),
          monthlyTotal > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-xs text-muted-foreground", children: "You can subscribe to additional modules at any time from Settings." })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  OnboardingPage as default
};
