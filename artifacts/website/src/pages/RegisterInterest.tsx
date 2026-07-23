import { Layout } from "@/components/layout/Layout";
import { useState } from "react";
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
  { id: "field-crop-management", label: "Field & Crop Management (spray records, field journal, varieties, Seed Store with field allocation tab and physical stocktake recording)" },
  { id: "sprays-inputs", label: "Sprays & Inputs (spray application records with GRN-linked batch traceability, PA certificate auto-fill, withholding period alerts, IPM Plans, LERAP Assessments, Beekeeper & Neighbour Notification Log with 48-hour lead time check and printable letters, Spray Store Stocktake with system quantity auto-fill and variance badge)" },
  { id: "soil-management", label: "Soil Management (NMP, NVZ, sampling, soil sensors)" },
  { id: "livestock-management", label: "Livestock & Feed Management (BCMS cattle reporting — Record BCMS Ref button on all unnotified cattle rows; automated CTS API in development, LIS one-click sheep/goat/deer on/off submission with LIS portal ref recording for births/deaths, LIS LIP cattle submission — integration built, temporarily paused during Defra service transition, EIDCymru one-click submission (Wales sheep/goat/deer), ScotEID one-click submission (Scotland all-species), eAML2 XML export (pig movements), individual animal linking, Bluetooth RFID scanning, medicine stock deduction (link treatment records to stock items for automatic inventory deduction), lambing records with perinatal ABP disposal, season analytics, date-validated forms, staff/assessor name auto-populates, BVD Testing Register, Johne's Disease Monitoring Register, Casualty/Emergency Slaughter Records with mobile capture, Dairy Management with DCT — POM-V enforcement, VMD medicine database, Vet Ledger finance trail, Dairy Supplies tab — PPE & chemical drawdown against stock registers, live stock overview, restock request workflow with urgency levels and admin approval chain, printable usage history)" },
  { id: "biosecurity", label: "Biosecurity & Visitors (visitor log with digital signature & photo/document attachments, pest control with attachments, COSHH with SDS photo, cleaning & disinfection with photo evidence, biosecurity plan)" },
  { id: "organic-compliance", label: "Organic Compliance (certification status, field conversion tracker, inspection log with document attachment, restricted inputs register & mobile offline recording)" },
  { id: "organic-livestock", label: "Organic Livestock (herd register linkage, treatment compliance from Medicine Register with doubled withdrawal periods, certifier notification, species-filtered herd selector in Feed Records and Outdoor Access tabs, Feed Derogations tab — Art. 22 case register with split New Case / Record Decision workflow, rejection handling with rejection reason / reference / corrective action, Action Required badge, correspondence log and document upload for approval letters and availability search evidence, outdoor access / stocking density logs, date intelligence — all date fields default to today, certification document upload per conversion record, parallel production compliance notice with annual notification manager — record each year's notification, attach certifier acknowledgements, and generate a pre-filled formal notification letter)" },
  { id: "organic-dairy", label: "Organic Dairy (herd conversion with milk certification date, milk collection records, treatment compliance with organic milk & meat withdrawal tracking, organic feed records linked to Feed Management, feed derogation case linker — non-approved feed deliveries auto-fill certifier reference from linked Organic Livestock derogation case, date intelligence — collection date, feed date and treatment date all default to today on new records, Dairy Supplies tab — same PPE drawdown, chemical drawdown, available stock, restock requests, and usage history as standard Dairy Management)" },
  { id: "organic-fresh-produce", label: "Organic Fresh Produce (block conversion status register, organic input log with supplier/PO/GRN/applied-by tracking, Input Derogations tab — UK Organic Regulations 2020 Sched. 1 / Annex II case register per substance with split New Case / Record Decision workflow, rejection handling with rejection reason / reference / corrective action, Action Required badge, correspondence log and document upload for approval letters and availability search evidence, certificates register, buyer declarations, print-ready compliance reports)" },
  { id: "organic-arable", label: "Organic Arable (certification tab with certifying body/parallel production flag, field conversion tracker with visual progress bar, seed sourcing register with derogation approval flow, Seed Stock Ledger — double-entry inventory tracker with stock lines and goods-in/consumption/adjustment/waste movements with running balance, Annex II 33-item input log with Permitted/Restricted/Derogation Required status and certifier notified flag, harvest declarations with separate buyer declaration dialog; view-before-edit on all tabs; RecordAttachments in every view dialog; FilterPills + Print Register + Export CSV per tab; 5 mobile screens — overview hub, offline-first input/seed/stock movement/harvest recording with derogation and restricted-input flows; bundled access to Fields & Crops, Field Operations, Field Inspections, Harvest Records, Storage Locations, and Crop Stock)" },
  { id: "staff-training", label: "Staff & Training (certificates, right-to-work, PPE Stock / Issue / Risk Assessments registers, PPE Compliance Pack & Staff Record reports, labour & timesheet management, rota & shift planning, actual attendance recording with Bradford Factor analysis, mobile leave request submission with manager approval & SMS notifications, holiday & absence tracking, Holiday Planner calendar view with conflict detection, printable blank leave request form (FT-LR-01), WTR compliance monitoring, department-grouped views across all six Labour Management tabs)" },
  { id: "finance", label: "Finance & Business (Trade Contacts with supplier directory & UFAS/FEMAS tracking, Purchase Orders with multi-stage status tracking and manager approval workflow, Goods Received Notes with 3-way matching, Financial Records & Business Reports)" },
  { id: "safety-risk-audits", label: "Safety, Risk & Audits (risk assessments, COSHH, PAT testing with BDE-PAT-XXXX QR label printing & mobile scan-to-test, fire extinguisher register, accident book, contractor H&S file, waste disposal, fly-tipping & encampments, printable H&S Register)" },
  { id: "environment-sustainability", label: "Environment & Sustainability (SFI / ELM agreement manager with action codes, evidence-due deadline alerts, and print-ready compliance report; Slurry & Manure Management with store register, fill-level progress bars, Fill & Intake Events log, and species-specific storage enforcement with 🔒 locked material types and server-side validation; Silage & Haylage Stock Tracking — cut records per clamp with forage type, cut number, area, yield and DM%, live running stock balance per clamp, usage drawdown log; Straw Bale Inventory — bale batches with crop, bale type, quantity, weight per bale, moisture checks across storage period, biomass contract fields (scheme name and unique bale reference for RTFO/AD traceability), usage events with auto-decrement; Season Reports Forage & Straw tab with CSV export; Carbon & Sustainability: DEFRA 2023 GHG Auto-Calculator — Pre-fill from Farm Records pulls fuel, fertiliser, livestock, and electricity data and returns Scope 1/2 tCO₂e with one-click Create Audit flow; Sustainability Reports tab with certifying body lookup, submission status, PO/invoice tracking, and document attachments)" },
  { id: "equipment-workshop", label: "Equipment, Workshop & Fuel (Equipment Register with PUWER, insurance & depreciation tabs per machine, QR labels, Workshop job cards & analytics, Fuel & Energy)" },
  { id: "biofuel-rtfo", label: "Biofuel / RTFO Compliance" },
  { id: "water-irrigation", label: "Water & Irrigation Management" },
  { id: "fresh-produce", label: "Fresh Produce" },
  { id: "viticulture", label: "Viticulture (vine register with UK variety & rootstock selects, GI classification (PDO/PGI/Table Wine), vineyard block management with full planting lifecycle (Active / Suspended / Removed states, retire & replant workflows, complete block history), BBCH phenology records, canopy & pruning operations, harvest records with Brix/pH/TA, disease & pest scouting with intelligent notification alerts (critical SMS for Xylella, Phytophthora, Vine Weevil & high disease pressure), CSV export, 4 dedicated mobile screens with active block picker — bundled with Sprays & Inputs, COSHH, Staff & Training, Equipment Management, and Trade Contacts & Stock)" },
  { id: "organic-viticulture", label: "Organic Viticulture (block conversion register with 3-year period tracking, organic input log, copper register with 28 kg/7yr limit tracker, input derogation case management with split New Case / Record Decision workflow, refusal handling with refusal reason / reference / corrective action, Action Required badge, correspondence log, organic wine production additives and SO₂ compliance (UK-retained EU Reg 203/2012), certificate register, mobile derogation viewer — all Viticulture bundled modules included)" },
  { id: "sheep-production", label: "Sheep Production (flocks via Livestock register, tupping, scanning, weigh-in & DLWG, shearing, health plans, vaccination programmes incl. Gudair for Johne's Disease/Paratuberculosis, Red Tractor Sheep Assurance, year filter on all tabs, document attachment on every record row)" },
  { id: "goat-production", label: "Goat Production (herds via Livestock register, mating records, pregnancy scanning, weigh-in & DLWG with BCS, cull & market records, vaccination programmes incl. Johne's Disease/Paratuberculosis — Gudair, disease monitoring (CAE, CLA, Johne's, FEC), analytics tab, mobile capture, year filter on all tabs, document attachment on every record row)" },
  { id: "beef-production", label: "Beef Production (herds via Livestock register, weigh-in & DLWG, finishing records, body condition scoring, deadweight settlement, year filter on all tabs, document attachment on every record row)" },
  { id: "venison-production", label: "Venison Production (deer herds via Livestock register, stalking & cull records, carcass processing & venison sales, herd population surveys, health records with bTB testing, firearms & stalking certificate register with expiry alerts, year filter on all tabs, document attachment on every record row)" },
  { id: "pig-production", label: "Pig Production (herds via Livestock register, farrowing & weaning, stockmanship checks with RecordAttachments, tail biting risk assessments with RecordAttachments, feed consumption & FCR, movements, kill records, mortality, Salmonella Monitoring — NSMP quarterly records, Red Tractor Pigs, year filter on all tabs, document attachment on every row)" },
  { id: "poultry-production", label: "Poultry Production (flocks via Livestock register, placements & depletions, Chick Purchases tab with year filter & RecordAttachments, Thinning Records with year filter & document attachment, mortality logs, feed & water, egg production, medicines, biosecurity, house cleanout, Campylobacter Monitoring — FSA NCP records with year filter, document attachment, RecordAttachments & print report, Red Tractor Poultry)" },
  { id: "organic-poultry", label: "Organic Poultry (Certification tab — certifying body, certificate type for laying hens/broilers/turkeys/ducks/geese/mixed, issue/expiry/status; Outdoor Access tab — birds on range, range area ha, birds/ha stocking density, duration, vegetation condition, compliance status; Feed Records tab — product name, organic approval status: Certified Organic/Approved Non-Organic/Conventional Derogation, certifier reference, supplier, lot number, derogation case linking; Derogations tab — non-permitted input case register with full lifecycle tracking: Pending/Approved/Rejected/Expired/Withdrawn, rejection handling with corrective action; 2 mobile screens for outdoor access and feed capture with offline sync)" },
  { id: "crop-trials", label: "Crop Trials" },
  { id: "farm-diversification", label: "Farm Diversification" },
  { id: "grain-crop-storage", label: "Grain & Crop Storage (stock movements, merchant charges, record linking, Crop Stock Stocktakes with system quantity auto-fill, measurement method picker and variance badge)" },
  { id: "farm-services-contracting", label: "Farm Services & Contracting (contracting jobs, equipment hire)" },
  { id: "weather-tracking", label: "Weather Tracking (manual station readings + Fetch Live — auto-fills from Open-Meteo GPS weather with one click, no API key needed; spray-record auto-link and historical charting)" },
  { id: "platform-addons", label: "Platform Add-ons (SMS Alerts — 3-tab SMS Alerts page: Config tab to enable SMS and set 8 alert types across Critical tier (animal health critical, compliance deadline, stock reconciliation, TB test result) and Standard tier (medicine withdrawal, movement pending, weather alert, task overdue); Team tab for per-member opt-in level (All Alerts / Critical Only / None); History tab with full alert log; push notifications to mobile app on task assignment; Advisor / Inspector Access)" },
  { id: "resource-planner", label: "Resource Planner (resource registry — tractors, implements, sprayers, trailers, vehicles, staff; drag-and-drop Gantt assignment; conflict detection with amber double-booking warnings; colour-coded resource chips on task bars)" },
  { id: "gps-fleet-tracking", label: "GPS & fleet tracking (live Resource Map, vehicle and machinery live positions, Teltonika RMS, Webfleet, John Deere Operations Center, AGCO Connect integrations)" },
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
};

export default function RegisterInterest() {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

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
      });
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
              and{" "}
              <a href="/pricing" className="text-brand underline underline-offset-2 hover:text-brand/80">pricing</a>{" "}
              pages.
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
            <Sprout className="w-3.5 h-3.5" />Free 30-Day Trial
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Register Interest</h1>
          <p className="text-lg text-muted-foreground">
            Tell us a little about your farm and the modules you need. We will set up your free trial and walk you through the system — no payment details required.
          </p>

          {/* Trial highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            {[
              { icon: Star, label: "30-day free trial", sub: "All modules unlocked" },
              { icon: CheckCircle2, label: "No card required", sub: "No commitment" },
              { icon: Sprout, label: "UK farm compliance", sub: "Red Tractor ready" },
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">First name <span className="text-red-500">*</span></label>
                <Input required value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className="h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Last name <span className="text-red-500">*</span></label>
                <Input required value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className="h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email address <span className="text-red-500">*</span></label>
                <Input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Phone number</label>
                <Input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base" />
              </div>
            </div>
          </section>

          {/* Farm details */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-4 pb-2 border-b border-border">Farm details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Farm name <span className="text-red-500">*</span></label>
                  <Input required value={form.farmName} onChange={e => setForm(f => ({ ...f, farmName: e.target.value }))} className="h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">CPH / Holding number</label>
                  <Input placeholder="e.g. 12/345/0001" value={form.holdingNumber} onChange={e => setForm(f => ({ ...f, holdingNumber: e.target.value }))} className="h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">County</label>
                  <Input value={form.county} onChange={e => setForm(f => ({ ...f, county: e.target.value }))} className="h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Number of holdings</label>
                  <select value={form.numberOfHoldings} onChange={e => setForm(f => ({ ...f, numberOfHoldings: e.target.value }))} className="h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base w-full">
                    {["1", "2", "3", "4", "5", "6–10", "11+"].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Primary farm type <span className="text-red-500">*</span></label>
                <select required value={form.farmType} onChange={e => setForm(f => ({ ...f, farmType: e.target.value }))} className="h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base w-full">
                  {FARM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Modules */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-1 pb-2 border-b border-border">Modules of interest</h2>
            <p className="text-sm text-muted-foreground mb-4">Select all that apply — we will configure your trial accordingly.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MODULES.map(m => (
                <label key={m.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${form.modules.includes(m.id) ? "border-brand bg-brand/5" : "border-border hover:border-brand/40"}`}>
                  <input type="checkbox" checked={form.modules.includes(m.id)} onChange={() => toggleModule(m.id)} className="rounded border-border" />
                  <span className="text-sm text-foreground">{m.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* How did you hear */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-4 pb-2 border-b border-border">A little more</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">How did you hear about BDE Farm Trac?</label>
                <select value={form.heardVia} onChange={e => setForm(f => ({ ...f, heardVia: e.target.value }))} className="h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base w-full">
                  <option value="">Please select…</option>
                  {HEARD_VIA.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Anything else you'd like to tell us?</label>
                <Textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={3} placeholder="e.g. current system you use, specific compliance challenges, preferred contact time…" />
              </div>
            </div>
          </section>

          <Button type="submit" size="lg" disabled={loading} className="w-full">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sprout className="w-4 h-4 mr-2" />}
            Register Interest — Start Free Trial
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
