import { Layout } from "@/components/layout/Layout";
import { useState, useMemo, useRef } from "react";
import { Info, Plus, X, Pencil, PoundSterling, CalendarCheck, ToggleRight, FlaskConical, Check, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const BASE_FEE = 15;

const MODULES = [
  { id: "red-tractor-compliance", name: "Red Tractor Compliance (Required)", price: 25, required: true },
  { id: "field-crop-management", name: "Field & Crop Management", price: 20 },
  { id: "crop-trials", name: "Crop Trials", price: 15 },
  { id: "sprays-inputs", name: "Sprays & Inputs", price: 15, note: "Spray application records with GRN-linked batch traceability, operator PA certificate auto-fill, withholding period alerts, equipment lookup, Raise Task from spray, and photo/document evidence capture; IPM Plan — structured written Integrated Pest Management plan (version-controlled, five-section, crop linked to farm crop records, printable A4 compliance document; spray records link to the plan via Spray Rationale field for a complete monitoring-to-application audit trail); LERAP Assessments — CRD LERAP scheme records for Category A/B products near watercourses; CRD Assessment Step selector (Step 1 notify only / Step 2 full buffer maintained / Step 3 full assessment); standard buffer auto-fills from product label; crop type and soil type auto-fill from field record; assessor selected from Staff register (PA1 + PA2/PA6 required); auto-generated LERAP-{id} document reference; Pending Review By assigns a farm member with email notification; recordable from dashboard and mobile app; Bee Precaution flag on products — mark any product as harmful to bees to activate automatic 48-hour notification deadline cards in the Week Ahead Planner; Beekeeper & Neighbour Notification Log — full pre-spray notification register with 48-hour lead time check, Contact Book, printable notification letter, and BeeConnected information panel; Spray Store Stocktake — periodic physical count per registered spray product with system quantity auto-fill, variance badge, conducted-by field, and full history on the Stocktakes tab; mobile capture with offline-first sync" },
  { id: "soil-management", name: "Soil Management", price: 10 },
  { id: "equipment-workshop", name: "Equipment, Workshop & Fuel", price: 30, note: "Combines Equipment Register (with PUWER compliance tab, Insurance tab per machine, Depreciation tab, QR label generation), Workshop (job cards, parts store, Workshop Analytics tab), and Fuel & Energy modules; link workshop jobs to Farm Services customers and raise invoices (labour + parts) with one click; date-validated service and fuel records; operator name pre-fills from the logged-in user on new entries; GPS Tracked flag on every registered asset — mark machines as GPS Tracked with a single toggle, a coloured badge on the equipment list for instant visual confirmation, and a one-click filter to show only GPS-tracked assets; GPS-tracked machines appear automatically on the Resource Map live tracking view when a GPS provider integration is connected" },
  { id: "livestock-management", name: "Livestock & Feed Management", price: 35, note: "Includes Feed Management, Vet Ledger (visit log & invoice reconciliation), BCMS cattle reporting (England — Record BCMS Ref button on all unnotified cattle rows: submit on BCMS Online then record the reference in the dashboard; automated CTS Web Services API in development pending DEFRA vendor registration), LIS LIP cattle submission (integration built; temporarily paused from 21 July 2026 during Defra service transition — use BCMS Online with Record BCMS Ref button in the meantime), LIS one-click sheep/goat/deer on/off submission (England CLA API; births and deaths require LIS keeper portal registration with portal ref recording), EIDCymru one-click sheep/goat/deer submission (Wales — per-farm API key in Farm Settings; full submission history with reference numbers and status; sandbox mode active until EIDCymru/SRUC credentials issued), ScotEID one-click all-species submission (Scotland — cattle, sheep, goats, pigs & deer; per-farm API key in Farm Settings; full submission history; sandbox mode active until ScotEID/SRUC credentials issued), eAML2 XML export (pig movements — export any pig movement record as a compliant XML file for direct upload to eAML2.org.uk to obtain your Animal Movement Licence; no API credentials required), individual animal linking on movements with automatic status updates, incoming animal registration, Bluetooth RFID ear tag scanning (mobile), organic compliance fields on medicines and feed deliveries, medicine stock deduction, TB Test Register (APHA-required), TB test → livestock movement record linkage, Welfare Outcome Assessments (WOA), Sheep Dipping Records (COSHH-compliant), AMRM Antibiotic Usage Report, ATA Number tracking on livestock movements, livestock purchase invoice → movement record linkage, lambing records with perinatal ABP disposal documentation, season-by-season perinatal mortality analytics, BVD Testing Register, Johne's Disease Monitoring Register, Casualty / Emergency Slaughter Records, and full Dairy Management module" },
  { id: "biosecurity", name: "Biosecurity & Visitors", price: 10, note: "Visitor log with digital signature, photo evidence and document attachments (scanned declarations, contractor certificates); pest control records with document attachments; COSHH assessments with SDS photo attachment; cleaning & disinfection logs with photo evidence; 13-section biosecurity plan, feed contingency plan, disease & incident log, and feed recall & withdrawal incidents" },
  { id: "organic-compliance", name: "Organic Compliance", price: 12, note: "Complementary records alongside Soil Association / OF&G portal — certification status, field conversion tracker, certifier inspection log with document attachment, restricted inputs register, and mobile offline inspection & input recording" },
  { id: "organic-livestock", name: "Organic Livestock", price: 25, note: "Full organic livestock compliance hub — links herds to the core Livestock Register, treatment compliance tab auto-populated from the Medicine Register (no double entry), doubled withdrawal period calculation, certifier notification tracking, treatment-number counter, organic feed delivery records, Feed Derogations tab, outdoor access / stocking density logs, and annual parallel production notification manager. Also includes all 15 standard Livestock module tabs. Organic Compliance (£12/mo) bundled at no extra charge." },
  { id: "organic-dairy", name: "Organic Dairy", price: 20, note: "Organic dairy compliance — herd conversion with separate milk certification date, herd register linkage, milk collection records, treatment compliance with separate organic milk and meat withdrawal end dates, organic feed & nutrition records, feed derogation case linker. Also includes all standard Dairy Management tabs. Organic Compliance (£12/mo) bundled at no extra charge." },
  { id: "organic-fresh-produce", name: "Organic Fresh Produce", price: 18, note: "Organic fresh produce compliance — block conversion status register, organic input log, Input Derogations tab, certificates register, and buyer declaration log. All tabs have view-before-edit records and print-ready compliance reports. Also includes all six standard Fresh Produce module tabs. Organic Compliance (£12/mo) bundled at no extra charge." },
  { id: "organic-arable", name: "Organic Arable", price: 28, note: "Complete organic arable compliance and field management hub — Certification tab, Field Conversion tracker, Seed Sourcing register, Seed Stock Ledger, Input Log (33-item Annex II SubstancePicker), Harvest Declarations, and Buyer Declaration dialog. Bundled access to Field & Crop Management (£20/mo) and Organic Compliance (£12/mo) at no extra charge — no separate module required." },
  { id: "staff-training", name: "Staff & Training", price: 10, note: "Training records, certificates (50+ types), right-to-work checks, three-register PPE system, print-ready PPE Compliance Pack, competency tracking, multi-farm staff access management, and Labour & Timesheet Management (timesheet recording, Rota & Shifts, Actual Attendance with Bradford Factor analysis, Holiday & Absence tracking with entitlement balance, Holiday Planner, Pay Summary, Working Time Regulations 1998 compliance monitoring)" },
  { id: "safety-risk-audits", name: "Safety, Risk & Audits", price: 20, note: "Combines HS&R and Inspections & Audits; includes Contractor H&S File (PLI & RAMS tracking, induction records), accident book (RIDDOR), COSHH register, PAT testing with BDE-PAT-XXXX asset codes, QR label printing, mobile scan-to-test workflow, fire extinguisher register, waste disposal, fly-tipping and encampment records; printable H&S Register; inspection correspondence log" },
  { id: "environment-sustainability", name: "Environment & Sustainability", price: 16, note: "Combines Environmental Management and Carbon & Sustainability; includes dedicated SFI / ELM agreement manager, agri-environment scheme correspondence log, Slurry & Manure Management with full store register, Silage & Haylage Stock Tracking, Straw Bale Inventory, and DEFRA 2023 GHG Auto-Calculator with one-click carbon audit creation" },
  { id: "water-irrigation", name: "Water & Irrigation Management", price: 10 },
  { id: "finance-business", name: "Finance & Business", price: 32, note: "Combines Trade Contacts, Financial Records & Business Reports; livestock deadweight kill sheet recording with off-farm movement record linkage; livestock mart / auction sale recording with movement record linkage; and multi-stage Purchase Order approval workflow with product-level approver assignment" },
  { id: "weather-tracking", name: "Weather Tracking", price: 15, note: "Manual weather station readings (temperature, rainfall, wind, humidity, pressure) plus Fetch Live — click once to auto-fill current conditions from Open-Meteo using your browser GPS; free, no API key required; spray-record auto-link and historical charting included" },
  { id: "platform-addons", name: "Platform Add-ons", price: 10, note: "Includes SMS Alerts (8 configurable alert types across Critical and Standard tiers; per-member opt-in level), push notifications to the mobile app when tasks are assigned, and Advisor/Inspector Access" },
  { id: "biofuel-rtfo", name: "Biofuel / RTFO Compliance", price: 30 },
  { id: "report-builder", name: "Report Builder", price: 20, note: "In-app custom report builder with a 4-step wizard — pick from 10 curated datasets; select columns; apply date-range and field-level filters; sort by any column; live preview table; optional bar, line, or pie chart; CSV download; save named report definitions for reuse" },
  { id: "data-api", name: "Data API Access", price: 15, note: "Secure, read-only REST API giving per-farm API keys for connecting BDE Farm Trac data to Excel Power Query, Power BI, Google Sheets, Python, and R; 10 curated endpoints; JSON and CSV output; 100 req/min rate limit per key" },
  { id: "sheep-production", name: "Sheep Production", price: 25, note: "Tupping records, pregnancy scanning, weigh-in & DLWG performance tracking, shearing records, health plans, vaccination programmes, Red Tractor Sheep Assurance checklist, disease monitoring with APHA advisory for reportable diseases, analytics tab, and mobile capture for all record types" },
  { id: "goat-production", name: "Goat Production", price: 25, note: "Mating records, pregnancy scanning, weigh-in & DLWG with BCS, cull & market records, vaccination programmes, disease monitoring (CAE, CLA, Johne's, foot rot), Enterprise Report tab with financial and production KPIs, and mobile capture for all record types" },
  { id: "venison-production", name: "Venison Production", price: 25, note: "Stalking & cull records with food safety inspection, carcass processing & venison sales, herd population surveys (driven count, thermal imaging, drone census), health records (bTB SICCT, gamma-interferon), and firearms & stalking certificate register with expiry alerts" },
  { id: "organic-venison", name: "Organic Venison", price: 20, note: "Organic certification records for farmed deer enterprises — certifying body and certificate register, grazing compartment land register with conversion tracking, organic feed and mineral supplement log, and input derogation case management. Organic Compliance (£12/mo) bundled at no extra charge." },
  { id: "beef-production", name: "Beef Production", price: 20, note: "Beef weigh-in & DLWG records, finishing records, body condition scoring, deadweight settlement recording with cattle movement record linkage, Red Tractor Beef & Lamb readiness, and document attachment on every record row" },
  { id: "pig-production", name: "Pig Production", price: 25, note: "Farrowing & weaning records, stockmanship checks, tail biting risk assessments, feed consumption & FCR, kill records, Pig Salmonella Monitoring (NSMP quarterly blood serology), Vaccination Programme with licensed UK vaccine presets, Disease Monitoring Register, and Red Tractor Pigs scheme readiness checklist" },
  { id: "poultry-production", name: "Poultry Production", price: 25, note: "Placement & depletion records, daily mortality log, egg production, Campylobacter Monitoring (FSA NCP records per flock), Vaccination Programme with licensed UK vaccine presets per disease category, Disease Monitoring Register with AI risk level classification, and Red Tractor Poultry scheme records" },
  { id: "organic-poultry", name: "Organic Poultry", price: 20, note: "Organic certification and compliance hub for poultry enterprises — Certification tab, Outdoor Access tab (with auto-calculated stocking density and compliance status), Feed Records tab with organic approval tracking, and Derogations tab. Organic Compliance (£12/mo) bundled at no extra charge." },
  { id: "fresh-produce", name: "Fresh Produce", price: 25, note: "Growing blocks, crop records, water quality testing, harvest records, pre-cooling & intake, packhouse & despatch, allergen management and cold chain compliance" },
  {
    id: "viticulture",
    name: "Viticulture",
    price: 45,
    note: "Vine register with UK variety & rootstock selects (24 varieties, 14 rootstocks), GI classification, vineyard block management with full planting lifecycle, BBCH phenology records (23 growth stages), canopy & pruning operations, harvest records (yield, Brix, pH, TA, potential alcohol, botrytis flag), disease & pest scouting with intelligent notification system (Xylella fastidiosa and Phytophthora viticola notifiable organism flags with APHA contact prompt, automatic in-app and SMS alerts on critical findings), Winery Management — 8 dedicated production tabs (Harvest Reception, Pressing, Fermentation, Vessel Register, Cellar Operations, Bottling, SO₂ Testing with UK-retained limit compliance check, Equipment Register), GI Compliance (PDO/PGI designation register, automated Block Compliance view, per-vintage APHA Certifications, Harvest Declarations), view-before-edit dialogs on all tabs, per-section task assignment, CSV export, staff auto-fill, 9 dedicated mobile screens with active block picker (all offline-first with sync). Includes bundled access to Sprays & Inputs, Safety Risk & Audits, Staff & Training, and Equipment, Workshop & Fuel — all at no extra charge.",
  },
  {
    id: "organic-viticulture",
    name: "Organic Viticulture",
    price: 45,
    note: "Block conversion register (3-year per-block conversion tracking, certifying body, pre-conversion history — UK Organic Regs 2020), organic inputs log (approved vineyard inputs with approval status and certifier references), copper register with running 28 kg/ha per 7-year limit tracker (colour-coded progress bar), input derogation case register (Sch. 1 / Annex II) with split New Case / Record Decision workflow and Action Required badge, organic wine production additives and SO₂ compliance per vintage (UK-retained EU Reg 203/2012 limits: 100 mg/L red, 150 mg/L white/rosé), certificate register with expiry alerts, and mobile derogation case viewer. Also includes all standard Viticulture tabs and the full 8-tab Winery Management section. Sprays & Inputs, Safety Risk & Audits, Staff & Training, Equipment Workshop & Fuel, and Organic Compliance all bundled at no extra charge. Holdings that subscribe to both Viticulture and Organic Viticulture (producing both certified and conventional wines) receive one module at half price.",
  },
  { id: "farm-diversification", name: "Farm Diversification", price: 15, note: "Farm Shop management, equine & livery health records, shooting & game logs, food hygiene inspections (FHRS), accommodation bookings and diversification income tracking" },
  { id: "grain-crop-storage", name: "Grain & Crop Storage", price: 18, note: "Storage location register, stock movements (intake/dispatch/transfer/drying loss), merchant storage charges, record drill-down linking to haulage, sales and harvest records; Crop Stock Stocktakes with variance badge; mobile capture with offline-first sync" },
  { id: "farm-services-contracting", name: "Farm Services & Contracting", price: 15, note: "Farm-as-service-provider: contracting jobs, equipment hire, customer directory, revenue summary, insurance cross-reference, and workshop job invoicing — raise billable invoices for repairs or maintenance done for other farms directly from the Workshop module" },
  { id: "resource-planner", name: "Resource Planner", price: 20, note: "Centralised resource registry for tractors, implements, sprayers, trailers, vehicles, and named staff — each with a colour dot; drag-and-drop resource assignment onto Week Ahead Gantt task bars; pinch point analysis; materials tracking; Planning Status tab; Plan vs Actual (As-Built) recording with variance charts; automatic conflict detection; real-time conflict resolution" },
];

// ── Sector filter ──────────────────────────────────────────────────────────────
// Maps each sector pill label to the module IDs relevant to that sector.
// red-tractor-compliance is always shown regardless of the active filter.
const SECTORS = ["All", "Arable", "Livestock", "Viticulture", "Organic", "Fresh Produce", "Diversification"] as const;
type Sector = typeof SECTORS[number];

const SECTOR_MODULES: Partial<Record<Sector, string[]>> = {
  Arable: [
    "field-crop-management", "crop-trials", "sprays-inputs", "soil-management",
    "grain-crop-storage", "organic-arable", "weather-tracking", "water-irrigation",
    "environment-sustainability", "equipment-workshop", "staff-training",
    "safety-risk-audits", "finance-business", "resource-planner", "biosecurity",
    "platform-addons", "report-builder", "data-api", "biofuel-rtfo",
  ],
  Livestock: [
    "livestock-management", "biosecurity", "sheep-production", "goat-production",
    "beef-production", "pig-production", "poultry-production", "venison-production",
    "organic-livestock", "organic-dairy", "organic-venison", "organic-poultry",
    "staff-training", "equipment-workshop", "finance-business", "safety-risk-audits",
    "environment-sustainability", "water-irrigation", "platform-addons",
    "report-builder", "data-api",
  ],
  Viticulture: [
    "viticulture", "organic-viticulture", "sprays-inputs", "equipment-workshop",
    "staff-training", "safety-risk-audits", "finance-business", "platform-addons",
    "weather-tracking", "soil-management", "water-irrigation", "report-builder",
    "data-api", "organic-compliance",
  ],
  Organic: [
    "organic-compliance", "organic-arable", "organic-livestock", "organic-dairy",
    "organic-fresh-produce", "organic-viticulture", "organic-venison", "organic-poultry",
  ],
  "Fresh Produce": [
    "fresh-produce", "organic-fresh-produce", "sprays-inputs", "staff-training",
    "safety-risk-audits", "equipment-workshop", "finance-business", "water-irrigation",
    "environment-sustainability", "platform-addons", "report-builder", "data-api",
    "biosecurity",
  ],
  Diversification: [
    "farm-diversification", "farm-services-contracting", "equipment-workshop",
    "finance-business", "staff-training", "safety-risk-audits", "platform-addons",
    "report-builder", "data-api",
  ],
};

// Modules that are bundled (included for free) when a particular module is selected.
// Keys are the parent module ID; values are the IDs of modules included at no extra charge.
const BUNDLE_INCLUSIONS: Record<string, string[]> = {
  "viticulture": ["sprays-inputs", "safety-risk-audits", "staff-training", "equipment-workshop"],
  "organic-viticulture": ["sprays-inputs", "safety-risk-audits", "staff-training", "equipment-workshop", "organic-compliance"],
  "organic-arable": ["field-crop-management", "organic-compliance"],
  "organic-livestock": ["organic-compliance"],
  "organic-dairy": ["organic-compliance"],
  "organic-fresh-produce": ["organic-compliance"],
  "organic-venison": ["organic-compliance"],
  "organic-poultry": ["organic-compliance"],
};

// Returns a Map of bundledModuleId → name of the parent module providing it.
// If two parents bundle the same module, the first one wins (e.g. both viticulture and organic-viticulture bundle sprays-inputs).
function getBundledModules(selectedModules: string[]): Map<string, string> {
  const result = new Map<string, string>();
  for (const modId of selectedModules) {
    const inclusions = BUNDLE_INCLUSIONS[modId];
    if (!inclusions) continue;
    const parentName = MODULES.find(m => m.id === modId)?.name ?? modId;
    for (const bid of inclusions) {
      if (!result.has(bid)) result.set(bid, parentName);
    }
  }
  return result;
}

interface Farm {
  id: number;
  name: string;
  selectedModules: string[];
}

function createFarm(id: number): Farm {
  return {
    id,
    name: `Farm ${id}`,
    selectedModules: ["red-tractor-compliance"],
  };
}

function getFarmDisplayName(farm: Farm): string {
  return farm.name.trim() || `Farm ${farm.id}`;
}

// Half-price discount when a holding subscribes to both Viticulture and Organic Viticulture
// (e.g. producing both certified-organic and conventional wines from the same estate).
function getDualVitDiscount(farm: Farm): number {
  const hasVit = farm.selectedModules.includes("viticulture");
  const hasOrgVit = farm.selectedModules.includes("organic-viticulture");
  return hasVit && hasOrgVit ? 22.5 : 0;
}

// Cost excludes any module that is provided for free via a bundle from another selected module,
// and applies the dual-viticulture discount where eligible.
function getFarmCost(farm: Farm): number {
  const bundled = getBundledModules(farm.selectedModules);
  const moduleCost = BASE_FEE + MODULES
    .filter(m => farm.selectedModules.includes(m.id) && !bundled.has(m.id))
    .reduce((acc, m) => acc + m.price, 0);
  return moduleCost - getDualVitDiscount(farm);
}

// Sum of the retail prices of all bundled-in modules (those included free, not separately charged),
// plus the dual-viticulture discount where eligible.
function getFarmBundleSaving(farm: Farm): number {
  const bundled = getBundledModules(farm.selectedModules);
  // Count savings for bundled modules whether or not separately selected — they aren't charged either way.
  const bundleSaving = MODULES
    .filter(m => bundled.has(m.id))
    .reduce((acc, m) => acc + m.price, 0);
  return bundleSaving + getDualVitDiscount(farm);
}

export default function Pricing() {
  const [farms, setFarms] = useState<Farm[]>([
    { id: 1, name: "Farm 1", selectedModules: ["red-tractor-compliance", "field-crop-management", "equipment-workshop"] },
  ]);
  const [activeFarmId, setActiveFarmId] = useState(1);
  const [editingNameId, setEditingNameId] = useState<number | null>(null);
  const [sectorFilter, setSectorFilter] = useState<Sector>("All");
  const nextFarmIdRef = useRef(2);

  const activeFarm = farms.find(f => f.id === activeFarmId) || farms[0];
  const activeBundled = useMemo(() => getBundledModules(activeFarm.selectedModules), [activeFarm.selectedModules]);

  // Modules visible in the grid given the active sector filter.
  // red-tractor-compliance is always shown; bundled modules are always shown (as green cards).
  const visibleModules = useMemo(() => {
    if (sectorFilter === "All") return MODULES;
    const allowed = new Set(SECTOR_MODULES[sectorFilter] ?? []);
    return MODULES.filter(m => m.required || allowed.has(m.id) || activeBundled.has(m.id));
  }, [sectorFilter, activeBundled]);

  const toggleModule = (moduleId: string, required?: boolean) => {
    if (required) return;
    // Don't allow toggling a module that is currently bundled (it's included for free; it doesn't need selecting)
    if (activeBundled.has(moduleId)) return;
    setFarms(prev => prev.map(f => {
      if (f.id !== activeFarmId) return f;
      const has = f.selectedModules.includes(moduleId);
      return {
        ...f,
        selectedModules: has
          ? f.selectedModules.filter(m => m !== moduleId)
          : [...f.selectedModules, moduleId],
      };
    }));
  };

  const addFarm = () => {
    const id = nextFarmIdRef.current++;
    const newFarm = createFarm(id);
    setFarms(prev => [...prev, newFarm]);
    setActiveFarmId(id);
  };

  const removeFarm = (farmId: number) => {
    if (farms.length <= 1) return;
    const updated = farms.filter(f => f.id !== farmId);
    if (activeFarmId === farmId) {
      setActiveFarmId(updated[0].id);
    }
    setFarms(updated);
  };

  const renameFarm = (farmId: number, name: string) => {
    setFarms(prev => prev.map(f => f.id === farmId ? { ...f, name } : f));
  };

  const totalMonthly = useMemo(() => farms.reduce((acc, f) => acc + getFarmCost(f), 0), [farms]);
  const totalBundleSaving = useMemo(() => farms.reduce((acc, f) => acc + getFarmBundleSaving(f), 0), [farms]);

  return (
    <Layout>
      <div className="bg-brand-forest text-white py-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">Transparent, Module-Based Pricing</h1>
          <p className="text-brand-pale/80 text-lg max-w-2xl mx-auto">
            Pay a low base platform fee plus only the specific modules you need for each farm.
          </p>
        </div>
      </div>

      {/* Small Farm Reassurance Strip */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 mb-12 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-border/60 p-6 md:p-8">
          <p className="text-center text-sm font-semibold text-brand-forest uppercase tracking-wider mb-6">Whether you farm 40 acres or 4,000 — this is built for you</p>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/40 gap-0">
            <div className="flex flex-col items-center text-center px-6 py-4 gap-3">
              <div className="w-11 h-11 bg-brand-pale rounded-xl flex items-center justify-center">
                <PoundSterling className="w-5 h-5 text-brand-forest" />
              </div>
              <div>
                <p className="font-bold text-foreground">Start from £40/month</p>
                <p className="text-sm text-muted-foreground mt-0.5">Base platform + Red Tractor Compliance. Less than £500 a year for a fully compliant farm.</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center px-6 py-4 gap-3">
              <div className="w-11 h-11 bg-brand-pale rounded-xl flex items-center justify-center">
                <CalendarCheck className="w-5 h-5 text-brand-forest" />
              </div>
              <div>
                <p className="font-bold text-foreground">Month to month, no contracts</p>
                <p className="text-sm text-muted-foreground mt-0.5">No annual commitments and nothing to pay upfront. Cancel any time with no questions asked.</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center px-6 py-4 gap-3">
              <div className="w-11 h-11 bg-brand-pale rounded-xl flex items-center justify-center">
                <ToggleRight className="w-5 h-5 text-brand-forest" />
              </div>
              <div>
                <p className="font-bold text-foreground">Only pay for what you need</p>
                <p className="text-sm text-muted-foreground mt-0.5">Pick exactly the modules your farm uses today. Add or remove them as your needs change.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="bg-white rounded-3xl shadow-2xl border border-border p-6 md:p-10 flex flex-col lg:flex-row gap-12">
          
          <div className="flex-1 space-y-8">
            <div>
              <h3 className="text-xl font-bold mb-4">1. Your Farms</h3>
              <div className="flex flex-wrap items-center gap-2">
                {farms.map(farm => (
                  <div
                    key={farm.id}
                    className={`group relative flex items-center gap-1.5 px-4 py-2 rounded-full border-2 cursor-pointer transition-all text-sm font-medium ${
                      activeFarmId === farm.id
                        ? "border-brand-forest bg-brand-forest text-white"
                        : "border-border bg-white text-foreground hover:border-brand-light"
                    }`}
                    onClick={() => setActiveFarmId(farm.id)}
                  >
                    {editingNameId === farm.id ? (
                      <input
                        autoFocus
                        className="bg-transparent border-none outline-none w-24 text-sm font-medium"
                        value={farm.name}
                        onChange={e => renameFarm(farm.id, e.target.value)}
                        onBlur={() => setEditingNameId(null)}
                        onKeyDown={e => { if (e.key === "Enter") setEditingNameId(null); }}
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      <>
                        <span>{getFarmDisplayName(farm)}</span>
                        <button
                          className={`sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-white/20 ${
                            activeFarmId === farm.id ? "text-white/80" : "text-muted-foreground"
                          }`}
                          onClick={e => { e.stopPropagation(); setEditingNameId(farm.id); }}
                          title="Rename farm"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      </>
                    )}
                    <button
                      className={`sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-0.5 rounded ${
                        farms.length <= 1
                          ? "!opacity-30 cursor-not-allowed"
                          : `hover:bg-white/20 ${activeFarmId === farm.id ? "text-white/80" : "text-muted-foreground"}`
                      }`}
                      disabled={farms.length <= 1}
                      onClick={e => { e.stopPropagation(); removeFarm(farm.id); }}
                      title="Remove farm"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addFarm}
                  className="flex items-center gap-1 px-4 py-2 rounded-full border-2 border-dashed border-brand-light text-brand-forest text-sm font-medium hover:bg-brand-pale/30 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Farm
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-1">2. Select Modules</h3>

              {/* Sector filter pills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {SECTORS.map(sector => (
                  <button
                    key={sector}
                    onClick={() => setSectorFilter(sector)}
                    className={`px-3 py-1 rounded-full text-sm font-medium border transition-all ${
                      sectorFilter === sector
                        ? "bg-brand-forest text-white border-brand-forest"
                        : "bg-white text-muted-foreground border-border hover:border-brand-light hover:text-foreground"
                    }`}
                  >
                    {sector}
                  </button>
                ))}
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                Configuring modules for <span className="font-semibold text-brand-forest">{getFarmDisplayName(activeFarm)}</span>
                {activeBundled.size > 0 && (
                  <span className="ml-2 inline-flex items-center gap-1 text-emerald-700 font-medium">
                    <Gift className="w-3.5 h-3.5" />
                    {activeBundled.size} module{activeBundled.size !== 1 ? "s" : ""} included free via bundle
                  </span>
                )}
                {sectorFilter !== "All" && (
                  <span className="ml-2 text-muted-foreground">
                    · Showing {visibleModules.length} of {MODULES.length} modules
                  </span>
                )}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleModules.map(mod => {
                  const isSelected = activeFarm.selectedModules.includes(mod.id);
                  const bundledBy = activeBundled.get(mod.id);
                  const isBundled = !!bundledBy;

                  if (isBundled) {
                    // Module is included for free via a bundle — show as green "included" card
                    return (
                      <div
                        key={mod.id}
                        className="relative p-4 rounded-xl border-2 border-emerald-400 bg-emerald-50 cursor-default"
                        title={`Included with ${bundledBy}`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-semibold text-emerald-900">{mod.name}</span>
                          <span className="flex items-center gap-1 text-emerald-600 font-semibold text-sm whitespace-nowrap flex-shrink-0">
                            <Check className="w-3.5 h-3.5" />
                            Included
                          </span>
                        </div>
                        <p className="text-xs text-emerald-700 mt-1">
                          Bundled with <span className="font-medium">{bundledBy}</span> — <span className="line-through opacity-60">£{mod.price}/mo</span> free
                        </p>
                        {"note" in mod && mod.note && (
                          <p className="text-xs text-emerald-800/60 mt-1 line-clamp-2">{mod.note}</p>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={mod.id}
                      onClick={() => toggleModule(mod.id, mod.required)}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-brand-forest bg-brand-pale/50"
                          : "border-border hover:border-brand-light"
                      } ${mod.required ? "opacity-80 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-foreground">{mod.name}</span>
                        <span className="text-muted-foreground font-mono ml-2 flex-shrink-0">£{mod.price}/mo</span>
                      </div>
                      {"note" in mod && mod.note && (
                        <p className="text-xs text-muted-foreground mt-1">{mod.note}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Estimated Cost box ─────────────────────────────────────── */}
          <div className="w-full lg:w-96 bg-earth-cream rounded-2xl p-8 sticky top-24 h-fit border border-earth-tan/20">
            <h3 className="text-lg font-bold text-earth-brown mb-6">Estimated Cost</h3>
            
            <div className="space-y-5 mb-6 pb-6 border-b border-earth-tan/30">
              {farms.map(farm => {
                const bundled = getBundledModules(farm.selectedModules);
                const bundleSaving = getFarmBundleSaving(farm);
                const farmCost = getFarmCost(farm);
                const dualVitDiscount = getDualVitDiscount(farm);

                // Charged modules = selected and NOT bundled
                const chargedModules = MODULES.filter(m => farm.selectedModules.includes(m.id) && !bundled.has(m.id));
                // Bundled modules = provided free via bundle (whether or not separately selected)
                const bundledModules = MODULES.filter(m => bundled.has(m.id));

                return (
                  <div key={farm.id}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-sm text-earth-brown">{getFarmDisplayName(farm)}</span>
                      <span className="font-bold text-base">£{farmCost}<span className="text-xs font-normal text-muted-foreground">/mo</span></span>
                    </div>
                    <div className="space-y-1 pl-3 border-l-2 border-earth-tan/20">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Platform Base Fee</span>
                        <span>£{BASE_FEE}</span>
                      </div>
                      {chargedModules.map(mod => (
                        <div key={mod.id} className="flex justify-between text-xs text-muted-foreground">
                          <span>{mod.name}</span>
                          <span>£{mod.price}</span>
                        </div>
                      ))}
                      {bundledModules.length > 0 && (
                        <>
                          <div className="pt-1 pb-0.5">
                            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                              <Gift className="w-3 h-3" />
                              Bundle inclusions
                            </div>
                          </div>
                          {bundledModules.map(mod => (
                            <div key={mod.id} className="flex justify-between text-xs text-emerald-700">
                              <span>{mod.name}</span>
                              <span className="font-medium">Included</span>
                            </div>
                          ))}
                          <div className="flex justify-between text-xs font-semibold text-emerald-700 pt-0.5 border-t border-emerald-200/60 mt-1">
                            <span>Bundle saving</span>
                            <span>−£{bundleSaving - dualVitDiscount}/mo</span>
                          </div>
                        </>
                      )}
                      {dualVitDiscount > 0 && (
                        <div className="flex justify-between text-xs font-semibold text-violet-700 pt-1 border-t border-violet-200/60 mt-1">
                          <span>Dual Viticulture discount (50% off one module)</span>
                          <span>−£{dualVitDiscount}/mo</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {totalBundleSaving > 0 && (
              <div className="mb-4 flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2">
                <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5" />
                  Total bundle saving
                </span>
                <span className="text-sm font-bold text-emerald-700">−£{totalBundleSaving}/mo</span>
              </div>
            )}

            <div className="flex justify-between items-end mb-8 text-brand-forest">
              <span className="font-bold text-lg">Total ({farms.length} {farms.length === 1 ? "farm" : "farms"})</span>
              <span className="text-4xl font-extrabold tracking-tight">£{totalMonthly}<span className="text-base font-normal opacity-80">/mo</span></span>
            </div>

            <Button className="w-full h-14 text-base bg-brand-forest hover:bg-brand-sage shadow-lg" asChild>
              <Link href="/contact">Start Custom Setup</Link>
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-4 flex items-center justify-center gap-1">
              <Info className="w-3 h-3" /> All prices exclude VAT.
            </p>
          </div>
        </div>
      </div>

      {/* Sandbox callout */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-14 h-14 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
            <FlaskConical className="w-7 h-7 text-amber-600" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="font-bold text-foreground text-lg mb-1">Sandbox Test Environment — included at no extra cost</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every subscription includes a full sandbox copy of your account. Enter records, explore every module, and train new staff with zero risk of affecting your live data or submitting to any government or third-party system.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
