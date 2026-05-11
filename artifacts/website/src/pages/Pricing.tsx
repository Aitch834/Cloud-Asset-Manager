import { Layout } from "@/components/layout/Layout";
import { useState, useMemo, useRef } from "react";
import { Info, Plus, X, Pencil, PoundSterling, CalendarCheck, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const BASE_FEE = 15;

const MODULES = [
  { id: "red-tractor-compliance", name: "Red Tractor Compliance (Required)", price: 25, required: true },
  { id: "field-crop-management", name: "Field & Crop Management", price: 20 },
  { id: "crop-trials", name: "Crop Trials", price: 15 },
  { id: "sprays-inputs", name: "Sprays & Inputs", price: 15 },
  { id: "soil-management", name: "Soil Management", price: 10 },
  { id: "equipment-workshop", name: "Equipment, Workshop & Fuel", price: 30, note: "Combines Equipment, Workshop & Fuel modules; link workshop jobs to Farm Services customers and raise invoices (labour + parts) with one click; date-validated service and fuel records; operator name pre-fills from the logged-in user on new entries" },
  { id: "livestock-management", name: "Livestock & Feed Management", price: 35, note: "Includes Feed Management, Vet Ledger (visit log & invoice reconciliation), BCMS one-click cattle submission (CTS Web Services), LIS one-click sheep/goat/deer submission (England CLA API), individual animal linking on movements with automatic status updates, incoming animal registration, Bluetooth RFID ear tag scanning (mobile), organic compliance fields on medicines and feed deliveries, TB Test Register (APHA-required), TB test → livestock movement record linkage (link pre- and post-movement tests directly to the corresponding off-farm movement record — satisfies APHA pre-movement testing requirements and provides cross-compliance inspection evidence), Welfare Outcome Assessments (WOA), Sheep Dipping Records (COSHH-compliant), AMRM Antibiotic Usage Report, ATA Number tracking on livestock movements, livestock purchase invoice → movement record linkage (link Finance invoices directly to the corresponding on-holding movement record to create a full invoice-to-BCMS audit trail), lambing records with perinatal ABP disposal documentation (contractor, collection date, NFAS ref, disposal method — auto-prompted when stillborn/died-within-24h recorded), season-by-season perinatal mortality analytics with year-on-year trend comparison, date-validated forms across all livestock record types, staff/assessor/operator name fields auto-populate from the logged-in user, and full Dairy Management module (milk recording, mastitis & calving records, BCS, mobility scoring, bulk tank logs, Dry Cow Therapy with VMD medicine combobox, SCC auto-fill, POM-V authorisation enforcement, prescribing vet lookup, calving date withdrawal compliance check, estimated prescription fee, auto Vet Ledger entry with 'DCT — invoice expected' badge, Raise Invoice pre-fill, and automatic Medicine Records cross-post)" },
  { id: "biosecurity", name: "Biosecurity & Visitors", price: 10, note: "Visitor log with digital signature, photo evidence and document attachments (scanned declarations, contractor certificates); pest control records with document attachments; COSHH assessments with SDS photo attachment; cleaning & disinfection logs with photo evidence; 13-section biosecurity plan, feed contingency plan, disease & incident log, and feed recall & withdrawal incidents" },
  { id: "organic-compliance", name: "Organic Compliance", price: 12, note: "Complementary records alongside Soil Association / OF&G portal — certification status, field conversion tracker, certifier inspection log with document attachment, restricted inputs register, and mobile offline inspection & input recording" },
  { id: "organic-livestock", name: "Organic Livestock", price: 25, note: "Full organic livestock compliance hub — links herds to the core Livestock Register (one click marks a herd as organic across all modules), treatment compliance tab auto-populated from the Medicine Register (no double entry), doubled withdrawal period calculation, certifier notification tracking, treatment-number counter, organic feed delivery records, and outdoor access / stocking density logs" },
  { id: "organic-dairy", name: "Organic Dairy", price: 20, note: "Organic dairy compliance — herd conversion with separate milk certification date, herd register linkage, milk collection records (volume, fat %, protein %, SCC, TBC, organic cert ref, net value), treatment compliance with separate organic milk and meat withdrawal end dates auto-populated from the Medicine Register, and organic feed & nutrition records linked to Feed Management deliveries" },
  { id: "organic-fresh-produce", name: "Organic Fresh Produce", price: 18, note: "Organic fresh produce compliance — block conversion status register (in-conversion / fully-organic with progress tracking and certifying body), organic input log with supplier, PO/GRN references and applied-by staff tracking, certificates register per certifying body, and buyer declaration log; all tabs have view-before-edit records and print-ready compliance reports; blocks can optionally link to parent farm fields to inherit NVZ and organic status" },
  { id: "staff-training", name: "Staff & Training", price: 10, note: "Training records, certificates (50+ types), right-to-work checks, three-register PPE system (PPE Stock Register with supplier & invoice traceability; PPE Issue Register with per-staff issue history & condition checks; PPE Risk Assessments with hazard, risk level, fit check, compatibility & training flags under the PPE at Work Regulations 2022), print-ready PPE Compliance Pack and per-staff PPE Record, competency tracking, multi-farm staff access management, and Labour & Timesheet Management (timesheet recording by operation type, Rota & Shifts planning, Holiday & Absence tracking with entitlement balance and mobile leave request submission with manager approval workflow and SMS notifications both ways, Holiday Planner month-by-month calendar grid with colour-coded absence types and scheduling conflict detection (flags days where ≥40% of staff are absent), rota-only holiday overlay (shows shifts from Rota & Shifts with no formal absence record in lime green so gaps are visible), printable blank leave request form A4 (ref FT-LR-01) for staff without app access, monthly Pay Summary with CSV export and hourly rate history, and Working Time Regulations 1998 compliance monitoring with automated 17-week rolling average and opt-out tracking)" },
  { id: "safety-risk-audits", name: "Safety, Risk & Audits", price: 20, note: "Combines HS&R and Inspections & Audits; includes Contractor H&S File (PLI & RAMS tracking, induction records), accident book (RIDDOR), COSHH register, PAT testing, fire extinguisher register with per-unit service history and certificate log, waste disposal, fly-tipping and encampment records; printable H&S Register covering all four areas in one document" },
  { id: "environment-sustainability", name: "Environment & Sustainability", price: 16, note: "Combines Environmental Management and Carbon & Sustainability; includes dedicated SFI / ELM agreement manager page with action codes, evidence-due deadline alerts, and print-ready compliance report" },
  { id: "water-irrigation", name: "Water & Irrigation Management", price: 10 },
  { id: "finance-business", name: "Finance & Business", price: 32, note: "Combines Trade Contacts, Financial Records & Business Reports; livestock deadweight kill sheet recording (species, deadweight, pence/kg, EUROP grade, gross value, deductions, net payment) with off-farm movement record linkage — kill sheet linked directly to the BCMS movement notification for Red Tractor and AHDB audit trail compliance; livestock mart / auction sale recording (mart, lot number, species, head count, proceeds, auctioneer reference) with off-farm movement record linkage — mart receipt linked to the corresponding LIS movement record for a complete auctioneer-to-notification chain; and multi-stage Purchase Order approval workflow with product-level approver assignment, pending approvals widget for managers, and submitter name tracking on every order" },
  { id: "weather-tracking", name: "Weather Tracking", price: 15, note: "Manual weather station readings (temperature, rainfall, wind, humidity, pressure) plus Fetch Live — click once to auto-fill current conditions from Open-Meteo using your browser GPS; free, no API key required; spray-record auto-link and historical charting included" },
  { id: "platform-addons", name: "Platform Add-ons", price: 10, note: "Includes SMS Alerts, push notifications to the mobile app when tasks are assigned (alongside SMS — tapping the notification opens the Task Inbox directly), and Advisor/Inspector Access" },
  { id: "biofuel-rtfo", name: "Biofuel / RTFO Compliance", price: 30 },
  { id: "sheep-production", name: "Sheep Production", price: 25, note: "Flocks registered in Livestock → Herds & Animals (single herd register); tupping records, pregnancy scanning, weigh-in & DLWG performance tracking, shearing records (fleece weight, contractor, BWMB traceability), health plans, and Red Tractor Sheep Assurance checklist" },
  { id: "beef-production", name: "Beef Production", price: 20, note: "Herds linked from Livestock → Herds & Animals; beef weigh-in & DLWG records, finishing records (entry/exit weights, shed/group management, feed conversion), body condition scoring, deadweight settlement recording with cattle movement record linkage (settlement sheet linked directly to the BCMS movement notification — audit trail from farm dispatch to kill sheet, satisfying AHDB and Red Tractor beef traceability requirements), and Red Tractor Beef & Lamb readiness" },
  { id: "pig-production", name: "Pig Production", price: 25, note: "Herds linked from Livestock → Herds & Animals; farrowing & weaning records, feed consumption & FCR, health & medicine records with withdrawal tracking, movements, mortality records, vet health plan integration, and Red Tractor Pigs scheme readiness checklist" },
  { id: "poultry-production", name: "Poultry Production", price: 25, note: "Flocks registered in Livestock → Herds & Animals (single herd register); placement & depletion records with hatchery traceability, daily mortality log with year-by-year trend, breed / strain and hatchery / supplier mortality breakdowns, cause analysis, feed & water consumption, egg production, medicine & vaccine records, biosecurity checklist, house cleanout records (farm staff or contractor, DEFRA-approved disinfectant, dilution rate, stock consumption, cost and invoice tracking, photo evidence), and Red Tractor Poultry scheme records" },
  { id: "fresh-produce", name: "Fresh Produce", price: 25, note: "Growing blocks, crop records, water quality testing, harvest records, pre-cooling & intake, packhouse & despatch, allergen management and cold chain compliance" },
  { id: "viticulture", name: "Viticulture", price: 25, note: "Vine register with UK variety & rootstock selects (24 varieties, 14 rootstocks), GI classification (English Wine PDO/PGI, Welsh Wine PDO/PGI, UK Table Wine, No GI), vineyard block management (training system, soil type, aspect, organic status), BBCH phenology records (23 growth stages with % reached and temperature), canopy & pruning operations (operation type, pruning system, bud counts, pruning weight per vine), harvest records (total yield, kg/vine, t/ha, Brix, pH, titratable acidity, potential alcohol, botrytis flag), disease & pest scouting (leafhopper, spider mite, vine weevil, Eutypa dieback pressure ratings, Xylella fastidiosa and Phytophthora viticola notifiable organism flags with APHA contact prompt), view-before-edit dialogs on all tabs, per-section task assignment, CSV export on every tab, staff auto-fill from logged-in user, and 4 dedicated mobile screens (vine scouting, phenology, canopy operations, harvest)" },
  { id: "farm-diversification", name: "Farm Diversification", price: 15, note: "Farm Shop management, equine & livery health records, shooting & game logs, food hygiene inspections (FHRS), accommodation bookings and diversification income tracking" },
  { id: "grain-crop-storage", name: "Grain & Crop Storage", price: 18, note: "Storage location register, stock movements (intake/dispatch/transfer/drying loss), merchant storage charges, record drill-down linking to haulage, sales and harvest records; operator name pre-fills from the logged-in user on new records" },
  { id: "farm-services-contracting", name: "Farm Services & Contracting", price: 15, note: "Farm-as-service-provider: contracting jobs, equipment hire, customer directory, revenue summary, insurance cross-reference, and workshop job invoicing — raise billable invoices for repairs or maintenance done for other farms directly from the Workshop module" },
];

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

function getFarmCost(farm: Farm): number {
  return BASE_FEE + MODULES.filter(m => farm.selectedModules.includes(m.id)).reduce((acc, m) => acc + m.price, 0);
}

export default function Pricing() {
  const [farms, setFarms] = useState<Farm[]>([
    { id: 1, name: "Farm 1", selectedModules: ["red-tractor-compliance", "field-crop-management", "equipment-workshop"] },
  ]);
  const [activeFarmId, setActiveFarmId] = useState(1);
  const [editingNameId, setEditingNameId] = useState<number | null>(null);
  const nextFarmIdRef = useRef(2);

  const activeFarm = farms.find(f => f.id === activeFarmId) || farms[0];

  const toggleModule = (moduleId: string, required?: boolean) => {
    if (required) return;
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
              <p className="text-sm text-muted-foreground mb-4">Configuring modules for <span className="font-semibold text-brand-forest">{getFarmDisplayName(activeFarm)}</span></p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MODULES.map(mod => {
                  const isSelected = activeFarm.selectedModules.includes(mod.id);
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

          <div className="w-full lg:w-96 bg-earth-cream rounded-2xl p-8 sticky top-24 h-fit border border-earth-tan/20">
            <h3 className="text-lg font-bold text-earth-brown mb-6">Estimated Cost</h3>
            
            <div className="space-y-5 mb-6 pb-6 border-b border-earth-tan/30">
              {farms.map(farm => {
                const farmCost = getFarmCost(farm);
                const farmModules = MODULES.filter(m => farm.selectedModules.includes(m.id));
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
                      {farmModules.map(mod => (
                        <div key={mod.id} className="flex justify-between text-xs text-muted-foreground">
                          <span>{mod.name}</span>
                          <span>£{mod.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

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
    </Layout>
  );
}
