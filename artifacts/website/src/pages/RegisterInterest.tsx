import { Layout } from "@/components/layout/Layout";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Loader2, Sprout, Star } from "lucide-react";
import { motion } from "framer-motion";

const FARM_TYPES = [
  "Arable / Combinable Crops",
  "Fresh Produce / Horticulture",
  "Dairy",
  "Beef",
  "Sheep",
  "Pigs",
  "Deer / Venison",
  "Poultry",
  "Mixed (Arable & Livestock)",
  "Organic",
  "Market Garden / Smallholding",
  "Viticulture / Vineyard",
  "Estate / Land Agent",
  "Contractor",
  "Other",
];

const MODULES = [
  { id: "red-tractor-compliance", name: "Red Tractor Compliance", summary: "Organise assurance records, checks and supporting evidence." },
  { id: "field-crop-management", name: "Field & Crop Management", summary: "Plan field work, crop records and seed stock in one place." },
  { id: "sprays-inputs", name: "Sprays & Inputs", summary: "Record applications, inputs and supporting compliance evidence." },
  { id: "soil-management", name: "Soil Management", summary: "Manage nutrient plans, soil sampling and field conditions." },
  { id: "livestock-management", name: "Livestock & Feed Management", summary: "Keep livestock, feed, medicine and movement records together." },
  { id: "biosecurity", name: "Biosecurity & Visitors", summary: "Maintain visitor, cleaning, COSHH and biosecurity records." },
  { id: "organic-compliance", name: "Organic Compliance", summary: "Track certification, conversion and organic inspection records." },
  { id: "organic-livestock", name: "Organic Livestock", summary: "Manage organic livestock treatments, feed and derogations." },
  { id: "organic-dairy", name: "Organic Dairy", summary: "Record organic dairy conversion, milk and feed information." },
  { id: "organic-fresh-produce", name: "Organic Fresh Produce", summary: "Manage organic growing blocks, inputs and buyer records." },
  { id: "organic-arable", name: "Organic Arable", summary: "Run organic arable certification, seed and harvest records." },
  { id: "staff-training", name: "Staff & Training", summary: "Organise training, PPE, rotas, timesheets and leave." },
  { id: "finance-business", name: "Finance & Business", summary: "Manage suppliers, purchasing and business financial records." },
  { id: "safety-risk-audits", name: "Safety, Risk & Audits", summary: "Keep risk assessments, safety checks and audit records." },
  { id: "environment-sustainability", name: "Environment & Sustainability", summary: "Track schemes, environmental records and sustainability data." },
  { id: "equipment-workshop", name: "Equipment, Workshop & Fuel", summary: "Manage machinery, maintenance jobs and fuel records." },
  { id: "biofuel-rtfo", name: "Biofuel / RTFO Compliance", summary: "Maintain records for biofuel and RTFO requirements." },
  { id: "water-irrigation", name: "Water & Irrigation Management", summary: "Plan irrigation and record water use." },
  { id: "fresh-produce", name: "Fresh Produce", summary: "Manage growing, harvest, packhouse and despatch records." },
  { id: "viticulture", name: "Viticulture", summary: "Manage vineyard, winery and wine compliance records." },
  { id: "organic-viticulture", name: "Organic Viticulture", summary: "Manage organic vineyard conversion, inputs and wine records." },
  { id: "sheep-production", name: "Sheep Production", summary: "Record flock performance, health and production activity." },
  { id: "goat-production", name: "Goat Production", summary: "Track goat breeding, health and performance records." },
  { id: "beef-production", name: "Beef Production", summary: "Monitor beef performance, finishing and sale records." },
  { id: "venison-production", name: "Venison Production", summary: "Manage deer herds, culls, processing and sales." },
  { id: "organic-venison", name: "Organic Venison", summary: "Maintain organic deer certification, feed and land records." },
  { id: "pig-production", name: "Pig Production", summary: "Record pig breeding, health, feed and performance." },
  { id: "poultry-production", name: "Poultry Production", summary: "Manage flock, egg, health and biosecurity records." },
  { id: "organic-poultry", name: "Organic Poultry", summary: "Track organic poultry certification, range access and feed." },
  { id: "crop-trials", name: "Crop Trials", summary: "Plan and record crop trials and results." },
  { id: "farm-diversification", name: "Farm Diversification", summary: "Manage income and records from diversified enterprises." },
  { id: "grain-crop-storage", name: "Grain & Crop Storage", summary: "Track crop storage, stock movements and charges." },
  { id: "farm-services-contracting", name: "Farm Services & Contracting", summary: "Manage contracting jobs, customers and equipment hire." },
  { id: "weather-tracking", name: "Weather Tracking", summary: "Record local weather and link it to farm activity." },
  { id: "platform-addons", name: "Platform Add-ons", summary: "Add alerts, mobile notifications and adviser access." },
  { id: "resource-planner", name: "Resource Planner", summary: "Schedule people, machinery and materials across tasks." },
  { id: "report-builder", name: "Report Builder", summary: "Create, save and export tailored farm reports." },
  { id: "data-api", name: "Data API Access", summary: "Connect farm data to your reporting tools securely." },
];

const HEARD_VIA = [
  "Red Tractor Assessor / Auditor",
  "AHDB",
  "NFU",
  "Agronomist / FACTS Adviser",
  "Farm consultant or adviser",
  "Word of mouth / colleague",
  "Social media",
  "Google / web search",
  "Agricultural show or event",
  "Trade publication",
  "Other",
];

const PRICING_SECTOR_TO_FARM_TYPE: Record<string, string> = {
  Arable: "Arable / Combinable Crops",
  Livestock: "Mixed (Arable & Livestock)",
  Viticulture: "Viticulture / Vineyard",
  Organic: "Organic",
  "Fresh Produce": "Fresh Produce / Horticulture",
  Diversification: "Other",
};

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  farmName: string;
  holdingNumber: string;
  county: string;
  farmType: string;
  numberOfHoldings: string;
  modules: string[];
  heardVia: string;
  message: string;
  sector: string;
}

const EMPTY: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  farmName: "",
  holdingNumber: "",
  county: "",
  farmType: "Arable / Combinable Crops",
  numberOfHoldings: "1",
  modules: [],
  heardVia: "",
  message: "",
  sector: "",
};

export default function RegisterInterest() {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Pre-fill sector from ?sector= query param (passed by Sectors page CTAs)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("sector");
    const requestedModules = (params.get("modules") ?? "").split(",").filter(id => MODULES.some(module => module.id === id));
    const rawFarmCount = Number(params.get("farms"));
    const requestedFarms = Number.isFinite(rawFarmCount)
      ? rawFarmCount <= 5 ? String(Math.max(1, rawFarmCount)) : rawFarmCount <= 10 ? "6–10" : "11+"
      : null;
    setForm(f => ({
      ...f,
      ...(s ? { sector: s } : {}),
      ...(s && PRICING_SECTOR_TO_FARM_TYPE[s] ? { farmType: PRICING_SECTOR_TO_FARM_TYPE[s] } : {}),
      ...(requestedModules.length ? { modules: requestedModules } : {}),
      ...(requestedFarms && ["1", "2", "3", "4", "5", "6–10", "11+"].includes(requestedFarms)
        ? { numberOfHoldings: requestedFarms }
        : {}),
    }));
  }, []);

  function toggleModule(id: string) {
    setForm(f => ({
      ...f,
      modules: f.modules.includes(id) ? f.modules.filter(m => m !== id) : [...f.modules, id],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.farmName || !form.farmType) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await fetch("/api/register-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
      setSubmitted(true);
    } catch {
      toast({ title: "Something went wrong. Please try again or email us directly.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="max-w-lg w-full text-center"
          >
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3">Thank you, {form.firstName}!</h1>
            <p className="text-muted-foreground mb-4">
              We have received your interest registration for <strong>{form.farmName}</strong>.
              A member of the BDE Farm Trac team will be in touch within two working days to arrange a demo and set up your free 30-day trial.
            </p>
            <p className="text-sm text-muted-foreground">
              In the meantime, explore our{" "}
              <a href="/features" className="text-brand underline underline-offset-2 hover:text-brand/80">features</a>{" "}
              page, review{" "}
              <a href="/pricing" className="text-brand underline underline-offset-2 hover:text-brand/80">pricing</a>{" "}
              or visit the{" "}
              <a href="/help" className="text-brand underline underline-offset-2 hover:text-brand/80">Help Centre</a>.
            </p>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <div className="relative bg-gradient-to-b from-[#166534]/5 to-transparent border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full mb-4">
            <Sprout className="w-3.5 h-3.5" />Try BDE Farm Trac for 30 days
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">See BDE Farm Trac on your farm</h1>
          <p className="text-lg text-muted-foreground">
            Tell us about your farm and the areas you want to manage. We will use this to prepare a relevant trial and introduction to the system. No payment details are required.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Prefer to compare options first? <a href="/pricing" className="text-brand underline underline-offset-2 hover:text-brand/80">View pricing</a> or <a href="/help" className="text-brand underline underline-offset-2 hover:text-brand/80">visit the Help Centre</a>.
          </p>

          {/* Trial highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            {[
              { icon: Star, label: "30-day trial", sub: "Explore the areas relevant to your farm" },
              { icon: CheckCircle2, label: "No card required", sub: "Submit your details to get started" },
              { icon: Sprout, label: "Built for UK farms", sub: "Keep everyday records in one place" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 bg-white rounded-xl border border-border px-4 py-3 text-left">
                <Icon className="w-5 h-5 text-[#166534] shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Contact details */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-4 pb-2 border-b border-border">Your details</h2>
            <p className="text-sm text-muted-foreground mb-4"><span className="text-red-500" aria-hidden="true">*</span> Required fields</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="first-name" className="block text-sm font-medium text-foreground mb-1.5">First name <span className="text-red-500" aria-hidden="true">*</span></label>
                <Input id="first-name" required value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className="h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base" />
              </div>
              <div>
                <label htmlFor="last-name" className="block text-sm font-medium text-foreground mb-1.5">Last name <span className="text-red-500" aria-hidden="true">*</span></label>
                <Input id="last-name" required value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className="h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">Email address <span className="text-red-500" aria-hidden="true">*</span></label>
                <Input id="email" type="email" required autoComplete="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base" />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1.5">Phone number <span className="font-normal text-muted-foreground">(optional)</span></label>
                <Input id="phone" type="tel" autoComplete="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base" />
              </div>
            </div>
          </section>

          {/* Sector context (pre-filled from Sectors page CTA — read-only) */}
          {form.sector && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-brand/30 bg-brand/5">
              <CheckCircle2 className="w-4 h-4 text-brand-forest shrink-0" />
              <p className="text-sm text-foreground">
                Enquiring about the <strong>{form.sector}</strong> sector
              </p>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, sector: "" }))}
                className="ml-auto text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
              >
                Clear
              </button>
            </div>
          )}

          {/* Farm details */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-4 pb-2 border-b border-border">Farm details</h2>
            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="farm-name" className="block text-sm font-medium text-foreground mb-1.5">Farm name <span className="text-red-500" aria-hidden="true">*</span></label>
                  <Input id="farm-name" required value={form.farmName} onChange={e => setForm(f => ({ ...f, farmName: e.target.value }))} className="h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base" />
                </div>
                <div>
                  <label htmlFor="holding-number" className="block text-sm font-medium text-foreground mb-1.5">CPH / holding number <span className="font-normal text-muted-foreground">(optional)</span></label>
                  <Input id="holding-number" placeholder="For example, 12/345/0001" value={form.holdingNumber} onChange={e => setForm(f => ({ ...f, holdingNumber: e.target.value }))} className="h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="county" className="block text-sm font-medium text-foreground mb-1.5">County <span className="font-normal text-muted-foreground">(optional)</span></label>
                  <Input id="county" autoComplete="address-level1" value={form.county} onChange={e => setForm(f => ({ ...f, county: e.target.value }))} className="h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base" />
                </div>
                <div>
                  <label htmlFor="number-of-holdings" className="block text-sm font-medium text-foreground mb-1.5">Number of holdings</label>
                  <select id="number-of-holdings" value={form.numberOfHoldings} onChange={e => setForm(f => ({ ...f, numberOfHoldings: e.target.value }))} className="h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base w-full">
                    {["1", "2", "3", "4", "5", "6–10", "11+"].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="farm-type" className="block text-sm font-medium text-foreground mb-1.5">Primary farm type <span className="text-red-500" aria-hidden="true">*</span></label>
                <select id="farm-type" required value={form.farmType} onChange={e => setForm(f => ({ ...f, farmType: e.target.value }))} className="h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base w-full">
                  {FARM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Modules */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-1 pb-2 border-b border-border">Modules of interest</h2>
            <p id="modules-help" className="text-sm text-muted-foreground mb-4">Select any areas you would like to discuss. This helps us tailor your trial conversation.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MODULES.map(m => (
                <label key={m.id} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${form.modules.includes(m.id) ? "border-brand bg-brand/5" : "border-border hover:border-brand/40"}`}>
                  <input id={`module-${m.id}`} type="checkbox" checked={form.modules.includes(m.id)} onChange={() => toggleModule(m.id)} aria-describedby="modules-help" className="mt-1 rounded border-border" />
                  <span>
                    <span className="block text-sm font-medium text-foreground">{m.name}</span>
                    <span className="block mt-0.5 text-xs leading-5 text-muted-foreground">{m.summary}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* How did you hear */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-4 pb-2 border-b border-border">A little more</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="heard-via" className="block text-sm font-medium text-foreground mb-1.5">How did you hear about BDE Farm Trac? <span className="font-normal text-muted-foreground">(optional)</span></label>
                <select id="heard-via" value={form.heardVia} onChange={e => setForm(f => ({ ...f, heardVia: e.target.value }))} className="h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base w-full">
                  <option value="">Please select…</option>
                  {HEARD_VIA.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1.5">Anything else you would like us to know? <span className="font-normal text-muted-foreground">(optional)</span></label>
                <Textarea id="message" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={3} placeholder="For example: your current system, records you want to improve, or a preferred contact time." />
              </div>
            </div>
          </section>

          <Button type="submit" size="lg" disabled={loading} className="w-full">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sprout className="w-4 h-4 mr-2" />}
            Register interest
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By submitting this form you agree to be contacted by Barnett Davies Enterprises Ltd regarding BDE Farm Trac. We will not share your details with third parties. See our{" "}
            <a href="/privacy" className="underline underline-offset-2 hover:text-foreground">Privacy Policy</a>.
          </p>
        </form>
      </div>
    </Layout>
  );
}
