import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { modulePrice, BASE_FEE, BUNDLE_INCLUSIONS, MODULES } from "@/lib/pricing-data";
import {
  Beef, Wheat, Grape, Tractor, LayoutGrid, Wrench,
  CheckCircle2, ArrowRight, ChevronRight, AlertTriangle,
  ClipboardList, PoundSterling, ShieldCheck, Smartphone,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const SECTORS = [
  {
    id: "beef-dairy",
    label: "Beef & Dairy",
    icon: Beef,
    color: "bg-red-50 text-red-700 border-red-100",
    accent: "bg-red-600",
    pill: "bg-red-100 text-red-700",
    hero: "Complete cattle compliance — from movement records to milk statements.",
    intro: "Beef and dairy operations carry some of the heaviest compliance burdens in UK agriculture. TB testing, BCMS movements, medicine withdrawal periods, and Red Tractor audit trails all demand accurate, up-to-date records. BDE Farm Trac brings every one of those record types into a single platform — accessible from the office or the parlour.",
    pain: [
      { heading: "TB disruption costs time and money", body: "Reactor removals, standstill periods, and re-test scheduling create a paperwork surge at the worst possible moment. BDE Farm Trac tracks every TB test date, read date, result, reactor details, and re-test due date — with automatic planner reminders so nothing is missed between visits." },
      { heading: "Withdrawal periods carry real legal risk", body: "A withdrawal period breach can result in milk rejection, an enforcement notice, or worse. Every medicine in our Vet Ledger carries an automatic withdrawal period calculator — the end date appears in the planner and triggers SMS alerts to the relevant staff member before the animal is moved or milk is collected." },
      { heading: "BCMS submissions eat administrative time", body: "Manual re-keying of cattle movements into BCMS is error-prone and time-consuming. Our direct BCMS integration (in application) will allow one-click submission of births, deaths, and movements direct from BDE Farm Trac — eliminating double entry entirely." },
    ],
    modules: [
      { name: "Cattle Livestock", desc: "Herd register, individual animal records, calving records, calf survival, BVD monitoring, DLWG tracking, and sell-out records." },
      { name: "Vet Ledger & Medicine Records", desc: "Full medicine purchase and administration records with automatic batch tracking, withdrawal period calculation, and vet prescription linkage." },
      { name: "Dairy Records", desc: "Milk yield, bulk tank ABR tests, cell count trend charting, and monthly milk statement uploads." },
      { name: "Red Tractor Compliance", desc: "Core compliance platform covering certificates, insurance, COSHH, contractor H&S, and the Week Ahead farm planner." },
      { name: "Equipment Register & Workshop", desc: "PUWER inspection records, service history, sprayer calibration, MOT tracking, and workshop job cards." },
    ],
    cta: `Start with the Livestock & Feed Management module at £${modulePrice("livestock-management")}/month. Add Vet Ledger, Dairy, and Equipment modules as you need them.`,
  },
  {
    id: "sheep-goat",
    label: "Sheep & Goat",
    icon: () => <span className="text-lg font-bold">🐑</span>,
    color: "bg-amber-50 text-amber-700 border-amber-100",
    accent: "bg-amber-600",
    pill: "bg-amber-100 text-amber-700",
    hero: "EID compliance, flock performance, and lambing analytics — all in one place.",
    intro: "Sheep and goat producers face some of the most detailed movement reporting requirements of any livestock sector — EID ear tag recording, cross-border movement declarations, and LIS submissions. Add lambing season pressure, IPM planning, and flock health monitoring and the paperwork quickly overwhelms. BDE Farm Trac was built to handle all of it with a minimum of effort.",
    pain: [
      { heading: "EID and movement reporting is mandatory and complex", body: "Every sheep and goat movement in England must be reported to LIS within 3 days. Our direct LIS API integration (in application) supports one-click movement submission, batch tag upload, and herd registration — with a full submission log and response tracking built in." },
      { heading: "Lambing data is captured but rarely used", body: "Most flocks record lambing outcomes in a notebook that is never analysed. BDE Farm Trac captures ewes lambed, lamb births, stillborns, 24-hour deaths, and scan data — and turns them into season-on-season perinatal mortality charts, scanning percentage trends, and DLWG performance by group." },
      { heading: "IPM plans are a Red Tractor requirement — but hard to track", body: "Integrated Pest Management plans require documented evidence of thresholds, monitoring, and intervention decisions. Our IPM module stores the full plan with threshold alerts and a decision log that is audit-ready at a moment's notice." },
    ],
    modules: [
      { name: "Sheep / Goat Livestock", desc: "Flock and individual animal records, EID tag management, mating, scanning, lambing / kidding, weigh-in and DLWG, cull and market records." },
      { name: "Vet Ledger & Medicine Records", desc: "Medicine purchase and administration records, flock treatment plans, vaccination programmes, and withdrawal period tracking." },
      { name: "Integrated Pest Management (IPM)", desc: "Crop pest and weed monitoring logs, threshold-based intervention records, and a full decision audit trail for Red Tractor compliance." },
      { name: "Red Tractor Compliance", desc: "Core compliance including certificates, COSHH, contractor H&S, and the Week Ahead farm planner." },
      { name: "Resource Planner", desc: "Labour and equipment planning for peak lambing and shearing periods — with pinch point analysis and Plan vs Actual tracking." },
    ],
    cta: `Start with the Livestock & Feed Management module at £${modulePrice("livestock-management")}/month. Add Vet Ledger and IPM for a complete flock compliance setup.`,
  },
  {
    id: "arable",
    label: "Arable",
    icon: Wheat,
    color: "bg-yellow-50 text-yellow-700 border-yellow-100",
    accent: "bg-yellow-600",
    pill: "bg-yellow-100 text-yellow-700",
    hero: "Field records, spray logs, NVZ compliance, and grain storage — without the paperwork mountain.",
    intro: "Arable operations are subject to some of the most detailed environmental and food safety record-keeping requirements in UK agriculture. NVZ rules, LERAP assessments, spray records, and Red Tractor Crop Assurance all demand evidence that is accurate, contemporaneous, and retrievable. BDE Farm Trac turns those obligations into structured digital records that are ready for an inspector at any time.",
    pain: [
      { heading: "NVZ records are a legal requirement — and frequently wrong", body: "Nitrate Vulnerable Zone regulations require detailed records of every organic and manufactured fertiliser application, with field-level nitrogen balances and closed-period compliance. BDE Farm Trac structures these records correctly from day one — with field-level application logs, N-balance calculations, and a closed-period alert in the farm planner." },
      { heading: "Spray records must be complete and legible for 3 years", body: "Every pesticide application must be recorded within 48 hours of the application being made. Our spray record module captures operator, product, batch, MAPP number, crop, field, area treated, rate, and weather conditions — with COSHH and LERAP assessments linked directly to the record." },
      { heading: "Grain storage compliance is overlooked until it isn't", body: "Grain store hygiene, pesticide store records, and incoming grain certificates are all auditable. The Grain & Crop Storage module tracks stock movements, treatments, and merchant storage charges — with stocktake records for periodic reconciliation." },
    ],
    modules: [
      { name: "Field & Crop Management", desc: "GPS field boundaries, crop histories, soil sampling records, field-level application logs, and harvest records." },
      { name: "Spray Records", desc: "Full pesticide application records with MAPP number validation, LERAP assessment log, and weather capture. Linked to COSHH register." },
      { name: "Organic Arable (optional)", desc: "Conversion tracking per field, organic input register, restricted substance derogation records, and certifier correspondence log." },
      { name: "Grain & Crop Storage", desc: "Storage location register, stock movements, merchant storage charges, and periodic stocktake records." },
      { name: "Equipment Register & Workshop", desc: "PUWER inspections, sprayer calibration (NSTS), service history, and workshop job cards for all arable machinery." },
    ],
    cta: `A typical arable setup (Field & Crop, Spray Records, Grain Storage) starts at around £${BASE_FEE + modulePrice("field-crop-management") + modulePrice("sprays-inputs") + modulePrice("grain-crop-storage")}/month for a single farm holding.`,
  },
  {
    id: "viticulture",
    label: "Viticulture",
    icon: Grape,
    color: "bg-purple-50 text-purple-700 border-purple-100",
    accent: "bg-purple-600",
    pill: "bg-purple-100 text-purple-700",
    hero: "Vine records, winery production management, disease scouting, organic compliance, and harvest traceability — built for UK vineyards.",
    intro: "UK viticulture is one of the fastest-growing sectors in British agriculture — and one of the most under-served when it comes to purpose-built digital record-keeping. From vine register and phenology through winery production management, organic derogations, and SO₂ compliance, BDE Farm Trac provides a complete digital platform for vineyard and winery operations.",
    pain: [
      { heading: "Organic certification creates a significant paper trail", body: "Organic vineyard certification requires documented evidence of input approvals, copper application totals, derogation case records, and restricted substance decisions — all cross-referenced against UK Organic Regulations 2020. Our Organic Viticulture module tracks the 28 kg/ha per 7-year copper limit with a running balance chart, and manages derogation cases through the full New Case → Decision → Corrective Action workflow." },
      { heading: "Disease pressure decisions need a documented basis", body: "Downy and powdery mildew, botrytis, and black rot all require scouting records that demonstrate the monitoring basis for any spray intervention. The Disease Scouting tab captures observed incidence, growth stage, weather conditions, and intervention decisions — with a full history per block." },
      { heading: "Harvest traceability is a food safety requirement", body: "From picking date and yield per block through pressing, fermentation, cellar operations, SO₂ testing, and bottling, every step of the winemaking process creates a compliance record. BDE Farm Trac captures this chain in a single platform — with 8 dedicated Winery Management tabs covering Harvest Reception, Pressing, Fermentation, Vessel Register, Cellar Ops, Bottling, SO₂ Testing, and Equipment Register — and SO₂ compliance automatically checked against UK-retained EU Reg 203/2012 limits." },
    ],
    modules: [
      { name: "Viticulture", desc: "Vine register by block (variety, rootstock, row spacing, vine age), phenology records, pruning and canopy management, disease scouting, and harvest records by block." },
      { name: "Winery Management", desc: "8-tab production record section: Harvest Reception, Pressing, Fermentation, Vessel Register, Cellar Ops, Bottling, SO₂ Testing (with automatic UK limit compliance check), and Equipment Register." },
      { name: "Organic Viticulture (optional)", desc: "Block conversion register, organic input log, copper register with running 28 kg/ha balance, derogation case management, and organic wine SO₂ compliance." },
      { name: "Spray Records", desc: "Full pesticide and fungicide application records linked to vineyard blocks, with LERAP and COSHH documentation." },
      { name: "Equipment Register & Workshop", desc: "PUWER compliance, service records for vineyard machinery, and workshop job cards." },
    ],
    cta: `Viticulture module at £${modulePrice("viticulture")}/month — includes Sprays & Inputs, Safety Risk & Audits, Staff & Training, and Equipment, Workshop & Fuel bundled free (£${modulePrice("sprays-inputs") + modulePrice("safety-risk-audits") + modulePrice("staff-training") + modulePrice("equipment-workshop")}/month of modules included at no extra charge). Add Organic Viticulture at £${modulePrice("organic-viticulture")}/month if you hold or are pursuing organic certification. Holdings producing both organic and conventional wines receive one module at half price.`,
  },
  {
    id: "mixed",
    label: "Mixed Farming",
    icon: LayoutGrid,
    color: "bg-green-50 text-green-700 border-green-100",
    accent: "bg-green-700",
    pill: "bg-green-100 text-green-700",
    hero: "One platform across every enterprise — livestock, arable, and everything in between.",
    intro: "Mixed farms are the most complex operations to manage — multiple livestock species, arable rotations, grazing ground, and shared machinery all competing for the same labour and equipment at the same time. BDE Farm Trac's multi-enterprise architecture means every module shares the same farm calendar, the same equipment register, and the same staff directory — so nothing falls between the gaps.",
    pain: [
      { heading: "Shared labour is always the bottleneck", body: "On a mixed farm, the same tractor driver who needs to be ploughing is also needed for cattle work, and lambing is overlapping with spring drilling. The Resource Planner module gives you a Gantt view of every task across all enterprises — with pinch point analysis that flags days where demand exceeds your registered team and machinery before the conflict arrives." },
      { heading: "Compliance spans multiple regimes simultaneously", body: "A beef-and-arable farm must meet cattle movement rules, NVZ records, spray records, PUWER inspections, and TB testing requirements — all at the same time. BDE Farm Trac's Week Ahead planner draws from all active modules simultaneously, surfacing compliance deadlines from every enterprise in a single calendar view." },
      { heading: "Enterprise performance is hard to compare without shared data", body: "Understanding whether the beef enterprise or the arable enterprise is performing better — or which is pulling its weight in a difficult year — requires consistent financial and production records across both. BDE Farm Trac's enterprise report structure allows per-enterprise gross margin and production KPI analysis within a single farm account." },
    ],
    modules: [
      { name: "Core Platform (Red Tractor Compliance)", desc: "The shared foundation — farm planner, certificates, COSHH, contractor H&S, staff task assignments, and document storage. Included with every subscription." },
      { name: "Resource Planner", desc: "Cross-enterprise Gantt planning, pinch point analysis, materials tracking, Planning Status sign-off workflow, and Plan vs Actual recording." },
      { name: "Livestock modules", desc: "Cattle, Sheep, Goat, Pig, or Deer — choose the species you farm. Each module shares the same vet ledger, medicine records, and farm planner." },
      { name: "Field & Crop Management + Spray Records", desc: "Field histories, GPS boundaries, and full spray records for the arable side of the business." },
      { name: "Equipment Register & Workshop", desc: "Single equipment register shared across all enterprises — PUWER compliance, service records, and workshop job cards for all machinery." },
    ],
    cta: `A typical mixed beef-and-arable setup starts at around £${BASE_FEE + modulePrice("livestock-management") + modulePrice("field-crop-management")}–£${BASE_FEE + modulePrice("livestock-management") + modulePrice("field-crop-management") + modulePrice("sprays-inputs")}/month depending on modules. Every module shares the same farm calendar and staff directory — no double entry.`,
  },
  {
    id: "contracting",
    label: "Agricultural Contracting",
    icon: Wrench,
    color: "bg-slate-50 text-slate-700 border-slate-100",
    accent: "bg-slate-700",
    pill: "bg-slate-100 text-slate-700",
    hero: "Job cards, invoicing, equipment compliance, and customer management — for contractors who run a professional operation.",
    intro: "Agricultural contractors operate at the intersection of farming and business services — maintaining a fleet of specialist machinery, delivering services to multiple farm customers, and managing the invoicing, insurance, and compliance overhead that comes with it. BDE Farm Trac's Farm Services module was built specifically for this model.",
    pain: [
      { heading: "Job tracking and invoicing is still done in spreadsheets", body: "Raising a job card, recording hours and materials, and converting that into an invoice typically involves three or four separate steps across different tools. BDE Farm Trac creates a direct link from job card to invoice — with labour rate, hours, and any parts used appearing as line items on a print-ready invoice, raised in a single click." },
      { heading: "Equipment compliance is a legal liability, not a nice-to-have", body: "Every machine in a contractor's fleet must have a documented PUWER inspection history. A written-off operator, an unserviced PTO shaft, or an overdue sprayer calibration creates personal liability for the business owner. The Equipment Register tracks every inspection, service, and calibration with traffic-light status on the equipment list." },
      { heading: "Customer records and insurance cross-references are scattered", body: "Knowing which customer has current public liability insurance, which farms you're contracted to operate on, and which jobs are outstanding requires a system. The Farm Services customer directory stores contact details, contract notes, insurance cross-references, and job history in one place — linked directly to job cards and invoices." },
    ],
    modules: [
      { name: "Farm Services & Contracting", desc: "Customer directory, contracting jobs, equipment hire records, revenue summary, insurance cross-references, and direct workshop job invoicing." },
      { name: "Equipment Register & Workshop", desc: "Full fleet register with PUWER compliance, service history, MOT tracking, sprayer calibration, and workshop job cards with labour and parts costing." },
      { name: "Red Tractor Compliance", desc: "Core platform with COSHH register, contractor H&S review records, and the Week Ahead farm planner." },
      { name: "Resource Planner (optional)", desc: "Cross-customer job scheduling on a Gantt chart — plan which machines and operators are needed for which customer on which day, with conflict detection." },
    ],
    cta: `Farm Services & Contracting module at £${modulePrice("farm-services-contracting")}/month, combined with the Equipment & Workshop module at £${modulePrice("equipment-workshop")}/month — a complete contracting compliance and invoicing platform at £${modulePrice("farm-services-contracting") + modulePrice("equipment-workshop")}/month.`,
  },
];

// Maps Sectors page sector IDs to the matching filter pill name in Pricing.tsx.
// Sectors with no direct Pricing filter (mixed, contracting) are omitted so the
// Pricing page falls back to "All".
const SECTOR_TO_PRICING: Record<string, string> = {
  "beef-dairy": "Livestock",
  "sheep-goat": "Livestock",
  "arable": "Arable",
  "viticulture": "Viticulture",
};

const WHY = [
  { icon: ClipboardList, title: "Built for compliance, not just record-keeping", body: "Every module in BDE Farm Trac was designed around the specific audit requirements of the sector it serves — Red Tractor, organic certification, NVZ rules, and government livestock movement reporting. Records are structured to be audit-ready, not just stored." },
  { icon: Smartphone, title: "Mobile-first for field workers", body: "The BDE Farm Trac mobile app works offline in areas with poor signal and syncs automatically when connectivity returns. Field workers capture records at the point of work — no transcription from paper notebooks at the end of the day." },
  { icon: PoundSterling, title: "Module-based pricing — only pay for what you need", body: "Start with a single compliance module and add more as your operation grows. There are no annual contracts, no upfront costs, and no penalty for cancelling. Every module is month-to-month." },
  { icon: ShieldCheck, title: "Government integration — built in, not bolted on", body: "Direct API integrations with BCMS (cattle) and LIS (sheep, goat, deer) are in application. When approved, one-click submission to government systems will replace the manual re-keying that currently costs hours every month." },
];

export default function Sectors() {
  const [active, setActive] = useState(SECTORS[0].id);
  // Pre-select sector from ?sector= query param so Sectors page links from other pages work
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("sector");
    if (s && SECTORS.some(sec => sec.id === s)) setActive(s);
  }, []);
  const sector = SECTORS.find((s) => s.id === active)!;
  const Icon = sector.icon as React.ElementType;

  return (
    <Layout>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-forest via-brand-sage to-emerald-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-emerald-300 font-semibold tracking-wide uppercase text-sm mb-3">Solutions by Sector</p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5">
              Purpose-built for every farming enterprise
            </h1>
            <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
              BDE Farm Trac covers the full range of UK farm sectors — each with the specific compliance records, analytics, and workflows that enterprise demands. Choose your sector below.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Sector Tabs */}
      <section className="sticky top-[88px] z-30 bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {SECTORS.map((s) => {
              const SIcon = s.icon as React.ElementType;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    active === s.id
                      ? "bg-brand-forest text-white shadow-sm"
                      : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <SIcon className="w-4 h-4" />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sector Content */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            {/* Sector Hero */}
            <div className="mb-12">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-4 ${sector.pill}`}>
                <Icon className="w-4 h-4" />
                {sector.label}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{sector.hero}</h2>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl">{sector.intro}</p>
            </div>

            {/* Pain Points */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold text-foreground mb-6">The problems we solve</h3>
              <div className="grid md:grid-cols-1 gap-5">
                {sector.pain.map((p, i) => (
                  <div key={i} className="flex gap-4 p-5 rounded-xl border border-border bg-secondary/30">
                    <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground mb-1">{p.heading}</p>
                      <p className="text-muted-foreground text-sm leading-relaxed">{p.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Modules */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold text-foreground mb-6">Recommended modules for {sector.label}</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {sector.modules.map((m, i) => (
                  <div key={i} className="flex gap-3 p-4 rounded-xl border border-border bg-white">
                    <CheckCircle2 className="w-5 h-5 text-brand-forest mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground text-sm">{m.name}</p>
                      <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Viticulture Bundle Callout — derived from BUNDLE_INCLUSIONS["viticulture"] in pricing-data.ts */}
            {sector.id === "viticulture" && (() => {
              // Short marketing descriptions for each bundled module (keyed by module ID).
              // Prices, names, and membership are all derived from pricing-data.ts.
              const VIT_BUNDLE_DESCS: Record<string, string> = {
                "sprays-inputs": "Spray records, LERAP assessments, IPM plan, beekeeper notifications",
                "safety-risk-audits": "H&S register, accident book, COSHH, PAT testing, fire extinguishers",
                "staff-training": "Training records, PPE compliance, timesheets, right-to-work checks",
                "equipment-workshop": "PUWER inspections, service history, workshop job cards, fuel records",
                "organic-compliance": "Organic certification status, field conversion tracker, certifier inspection log",
              };
              const bundledIds = BUNDLE_INCLUSIONS["viticulture"] ?? [];
              const bundledModules = bundledIds.map(id => ({
                id,
                name: MODULES.find(m => m.id === id)?.name ?? id,
                price: modulePrice(id),
                desc: VIT_BUNDLE_DESCS[id] ?? "",
              }));
              const bundleTotal = bundledModules.reduce((sum, m) => sum + m.price, 0);
              return (
              <div className="mb-12 rounded-2xl border-2 border-purple-200 bg-purple-50 p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                        <Gift className="w-5 h-5 text-purple-700" />
                      </div>
                      <p className="text-purple-900 font-bold text-lg leading-snug">
                        £{bundleTotal}/month of modules bundled free
                      </p>
                    </div>
                    <p className="text-purple-800 text-sm leading-relaxed mb-5">
                      Every Viticulture subscription automatically includes {bundledModules.length} additional modules at no extra charge — modules that other sectors pay for separately. That's over £{bundleTotal * 12}/year of additional value included in the £{modulePrice("viticulture")}/month Viticulture price.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {bundledModules.map((m) => (
                        <div key={m.id} className="flex gap-3 p-3.5 rounded-xl bg-white border border-purple-100">
                          <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-foreground text-sm">{m.name}</p>
                              <span className="text-xs font-medium bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">£{m.price}/mo</span>
                            </div>
                            <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">{m.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="md:w-52 shrink-0 flex flex-col items-center text-center bg-white border border-purple-200 rounded-xl p-5 gap-3">
                    <p className="text-4xl font-extrabold text-purple-700">£{bundleTotal}</p>
                    <p className="text-sm text-purple-900 font-medium leading-snug">per month bundled free with Viticulture</p>
                    <div className="w-full border-t border-purple-100 pt-3">
                      <p className="text-xs text-muted-foreground leading-relaxed">Select <strong>Viticulture</strong> in the pricing tool to see the full breakdown.</p>
                    </div>
                    <Link href="/pricing?sector=Viticulture" className="inline-flex items-center gap-1 text-sm font-semibold text-purple-700 hover:text-purple-900 transition-colors">
                      See full pricing <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })()}

            {/* Pricing CTA */}
            <div className="rounded-2xl bg-gradient-to-br from-brand-forest to-brand-sage p-8 text-white flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1">
                <p className="text-emerald-200 text-sm font-medium mb-1">Pricing guide</p>
                <p className="text-white font-semibold text-lg leading-snug">{sector.cta}</p>
              </div>
              <div className="flex gap-3 shrink-0">
                <Button variant="outline" className="border-white/40 text-white hover:bg-white/10 bg-transparent" asChild>
                  <Link href={`/pricing${SECTOR_TO_PRICING[sector.id] ? `?sector=${SECTOR_TO_PRICING[sector.id]}` : ""}`}>See full pricing</Link>
                </Button>
                <Button className="bg-white text-brand-forest hover:bg-emerald-50" asChild>
                  <Link href="/register-interest">
                    Get started <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why BDE Farm Trac */}
      <section className="bg-secondary/40 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-3">Why BDE Farm Trac</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Whatever sector you farm in, these principles run through every module on the platform.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {WHY.map((w, i) => {
              const WIcon = w.icon;
              return (
                <div key={i} className="flex gap-4 p-5 rounded-xl bg-white border border-border">
                  <div className="w-10 h-10 rounded-lg bg-brand-pale flex items-center justify-center shrink-0">
                    <WIcon className="w-5 h-5 text-brand-forest" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">{w.title}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">{w.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-4">Ready to see it in action?</h2>
          <p className="text-muted-foreground mb-8">
            Register your interest and we will set up a personalised demonstration of the modules relevant to your farming enterprise — no sales pressure, no commitment.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button className="bg-brand-forest hover:bg-brand-sage text-white rounded-full px-8 h-12" asChild>
              <Link href="/register-interest">
                Register interest <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" className="rounded-full px-8 h-12" asChild>
              <Link href="/contact">Speak to the team</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
