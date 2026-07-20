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
  { id: "sprays-inputs", name: "Sprays & Inputs", price: 15, note: "Spray application records with GRN-linked batch traceability, operator PA certificate auto-fill, withholding period alerts, equipment lookup, Raise Task from spray, and photo/document evidence capture; IPM Plan — structured written Integrated Pest Management plan (version-controlled, five-section, crop linked to farm crop records, printable A4 compliance document; spray records link to the plan via Spray Rationale field for a complete monitoring-to-application audit trail); LERAP Assessments — CRD LERAP scheme records for Category A/B products near watercourses; CRD Assessment Step selector (Step 1 notify only / Step 2 full buffer maintained / Step 3 full assessment); standard buffer auto-fills from product label; crop type and soil type auto-fill from field record; assessor selected from Staff register (PA1 + PA2/PA6 required); auto-generated LERAP-{id} document reference; Pending Review By assigns a farm member with email notification; recordable from dashboard and mobile app; Bee Precaution flag on products — mark any product as harmful to bees to activate automatic 48-hour notification deadline cards in the Week Ahead Planner; Beekeeper & Neighbour Notification Log — full pre-spray notification register with 48-hour lead time check, Contact Book, printable notification letter, and BeeConnected information panel; Spray Store Stocktake — periodic physical count per registered spray product with system quantity auto-fill, variance badge, conducted-by field, and full history on the Stocktakes tab; mobile capture with offline-first sync" },
  { id: "soil-management", name: "Soil Management", price: 10 },
  { id: "equipment-workshop", name: "Equipment, Workshop & Fuel", price: 30, note: "Combines Equipment Register (with PUWER compliance tab, Insurance tab per machine, Depreciation tab, QR label generation), Workshop (job cards, parts store, Workshop Analytics tab), and Fuel & Energy modules; link workshop jobs to Farm Services customers and raise invoices (labour + parts) with one click; date-validated service and fuel records; operator name pre-fills from the logged-in user on new entries; GPS Tracked flag on every registered asset — mark machines as GPS Tracked with a single toggle, a coloured badge on the equipment list for instant visual confirmation, and a one-click filter to show only GPS-tracked assets; GPS-tracked machines appear automatically on the Resource Map live tracking view when a GPS provider integration is connected" },
  { id: "livestock-management", name: "Livestock & Feed Management", price: 35, note: "Includes Feed Management, Vet Ledger (visit log & invoice reconciliation), BCMS one-click cattle submission (CTS Web Services), LIS LIP one-click cattle submission (OAuth per-farm delegated sign-in — cattle movements, births and deaths via the Livestock Information Platform API), LIS one-click sheep/goat/deer submission (England CLA API), EIDCymru one-click sheep/goat/deer submission (Wales — per-farm API key in Farm Settings; full submission history with reference numbers and status; sandbox mode active until EIDCymru/SRUC credentials issued), ScotEID one-click all-species submission (Scotland — cattle, sheep, goats, pigs & deer; per-farm API key in Farm Settings; full submission history; sandbox mode active until ScotEID/SRUC credentials issued), eAML2 XML export (pig movements — export any pig movement record as a compliant XML file for direct upload to eAML2.org.uk to obtain your Animal Movement Licence; no API credentials required), individual animal linking on movements with automatic status updates, incoming animal registration, Bluetooth RFID ear tag scanning (mobile), organic compliance fields on medicines and feed deliveries, medicine stock deduction (link each treatment record to a stock item in the veterinary medicine register; quantity used is deducted automatically from the stock level on save), TB Test Register (APHA-required), TB test → livestock movement record linkage (link pre- and post-movement tests directly to the corresponding off-farm movement record — satisfies APHA pre-movement testing requirements and provides cross-compliance inspection evidence), Welfare Outcome Assessments (WOA), Sheep Dipping Records (COSHH-compliant), AMRM Antibiotic Usage Report, ATA Number tracking on livestock movements, livestock purchase invoice → movement record linkage (link Finance invoices directly to the corresponding on-holding movement record to create a full invoice-to-BCMS audit trail), lambing records with perinatal ABP disposal documentation (contractor, collection date, NFAS ref, disposal method — auto-prompted when stillborn/died-within-24h recorded), season-by-season perinatal mortality analytics with year-on-year trend comparison, date-validated forms across all livestock record types, staff/assessor/operator name fields auto-populate from the logged-in user, BVD Testing Register (herd-level BVD surveillance tests — test type, laboratory, result, CHeCS certificate reference, and running herd BVD status badge), Johne's Disease Monitoring Register (quarterly and annual paratuberculosis monitoring — test method, lab, result category, herd risk level, and actions applied), Casualty / Emergency Slaughter Records (on-farm emergency killing log — species, ear tag, reason, method, WASK / WATOK certificate reference, carcase disposal details, and vet involvement; mobile app capture with GPS and photo evidence), and full Dairy Management module (milk recording, mastitis & calving records, BCS, mobility scoring, bulk tank logs, Dry Cow Therapy with VMD medicine combobox, SCC auto-fill, POM-V authorisation enforcement, prescribing vet lookup, calving date withdrawal compliance check, estimated prescription fee, auto Vet Ledger entry with 'DCT — invoice expected' badge, Raise Invoice pre-fill, automatic Medicine Records cross-post, and NMR Recording Visits — monthly recorder visit log with herd averages for yield, fat%, protein%, lactose%, SCC, high-SCC ear tag list, F:P ratio with colour-coded acidosis/energy-balance interpretation bands, and 24-visit rolling trend charts), and Dairy Supplies tab across all six dairy sections — PPE drawdown (deducts from PPE Stock Register in real time), chemical drawdown (deducts from spray/chemical stock levels and logs a stock movement), live available-stock panel with low-stock amber alerts, restock request workflow with Routine / Urgent / Critical urgency and admin approval → ordered → received status chain, and printable usage history report for audit" },
  { id: "biosecurity", name: "Biosecurity & Visitors", price: 10, note: "Visitor log with digital signature, photo evidence and document attachments (scanned declarations, contractor certificates); pest control records with document attachments; COSHH assessments with SDS photo attachment; cleaning & disinfection logs with photo evidence; 13-section biosecurity plan, feed contingency plan, disease & incident log, and feed recall & withdrawal incidents" },
  { id: "organic-compliance", name: "Organic Compliance", price: 12, note: "Complementary records alongside Soil Association / OF&G portal — certification status, field conversion tracker, certifier inspection log with document attachment, restricted inputs register, and mobile offline inspection & input recording" },
  { id: "organic-livestock", name: "Organic Livestock", price: 25, note: "Full organic livestock compliance hub — links herds to the core Livestock Register (one click marks a herd as organic across all modules), treatment compliance tab auto-populated from the Medicine Register (no double entry), doubled withdrawal period calculation, certifier notification tracking, treatment-number counter, organic feed delivery records with species-filtered herd selector (draws matching herds from your Livestock Register by species; organic herds marked 🌿), Feed Derogations tab (UK Organic Regs 2020, Art. 22) — dedicated case register per non-organic ingredient with full lifecycle tracking: split New Case / Record Decision workflow keeps application evidence cleanly separated from certifier decision; each case records ingredient name, species, certifier, applied date, availability search date and OFAS/UKOAS reference, internal decision date, certifier decision date and expiry date, approval conditions, and full rejection handling (rejection reason, rejection reference, corrective action); Action Required badge on rejected cases without a corrective action; status summary chips (Pending / Approved / Rejected / Expired / Withdrawn); certifier correspondence log; document upload for approval letters and availability search evidence; derogation case linkage on feed delivery records, outdoor access / stocking density logs with herd cascade, compliance status, year filter, and document attachment on every row, date intelligence (all new record forms default every date field to today), certification document upload per conversion record, parallel production compliance notice (UK Organic Regulations 2020), annual parallel production notification manager with per-year document storage and pre-filled formal notification letter generator, date-anchored Week Ahead Planner alerts for both certification deadlines and annual notification due dates; the Organic Livestock page also includes all 15 standard Livestock module tabs (Herds & Flocks, Animals, Vet Health Plans, Mortality, Contractors, Feed, Water, Sires, Straws, AI & Repro, Vet Rx, Lambing, TB Tests, Welfare Outcome Assessments, Sheep Dipping Records) so organic producers have their complete operational and compliance records in one place" },
  { id: "organic-dairy", name: "Organic Dairy", price: 20, note: "Organic dairy compliance — herd conversion with separate milk certification date, herd register linkage, milk collection records (volume, fat %, protein %, SCC, TBC, organic cert ref, net value), treatment compliance with separate organic milk and meat withdrawal end dates auto-populated from the Medicine Register, organic feed & nutrition records linked to Feed Management deliveries with year filter and document attachment on every row, feed derogation case linker (non-approved feed records auto-fill certifier approval reference from an approved Organic Livestock derogation case with no re-keying), date intelligence (milk collection date, feed record date, and treatment date all default to today on new records); also includes all standard Dairy Management tabs — Mastitis Records, Calving Records, Body Condition Scoring, Mobility Scoring, Bulk Tank, Dry Cow Therapy, and NMR Recording Visits (organic dairy farmers use the same NMR recording service and their organic milk buyer contracts require documented SCC monitoring), and Dairy Supplies tab (PPE drawdown, chemical drawdown, available stock panel, restock request workflow, and usage history — same as standard Dairy Management)" },
  { id: "organic-fresh-produce", name: "Organic Fresh Produce", price: 18, note: "Organic fresh produce compliance — block conversion status register (in-conversion / fully-organic with progress tracking and certifying body), organic input log with supplier datalist suggestions from your Trade Contacts (PO/GRN reference auto-suggested from previous entries for the same supplier), applied-by staff select from your farm team register, application date defaults to today, Input Derogations tab (UK Organic Regulations 2020 — Schedule 1 / Annex II case register per substance with full lifecycle tracking): split New Case / Record Decision workflow; rejection handling with rejection reason, rejection reference, and corrective action fields; internal decision date; Action Required badge on rejected cases without corrective action; certifier correspondence log; document upload for approval letters and availability search evidence; certificates register per certifying body, and buyer declaration log; all tabs have view-before-edit records and print-ready compliance reports; blocks can optionally link to parent farm fields to inherit NVZ and organic status; the Organic Fresh Produce page also includes all six standard Fresh Produce module tabs (Crops, Water Tests, Harvest, Intake, Packhouse, Allergens) so organic growers have their complete operational and compliance records in one place" },
  { id: "organic-arable", name: "Organic Arable", price: 28, note: "Complete organic arable compliance and field management hub — Certification tab (certifying body, certificate number, operator number, parallel production flag, and status with amber compliance notice citing UK Organic Regulations 2020), Field Conversion tracker (per-field register linked to your field list with visual conversion progress bar and days-remaining countdown), Seed Sourcing register (certified organic seed flag, derogation approval flow — Derogation Approved status reveals certifier reference and expiry date with amber advisory confirming OFAS/UKOAS availability search requirement), Seed Stock Ledger (double-entry seed inventory tracker — stock lines record each unique seed lot with crop, variety, lot number, supplier, treatment status, quantity received, and running balance; movements log goods-in receipts with PO/GRN references, consumption events with field and drilling date, stock adjustments, and waste disposals; balance auto-updates after every movement; full movement history per stock line), Input Log (33-item Annex II SubstancePicker, Permitted / Restricted / Derogation Required status with mandatory certifier reference and notified flag for restricted inputs, FieldSelector picker), Harvest Declarations (yield, moisture, grade, organic certified flag, certifier harvest reference) with separate Buyer Declaration dialog; view-before-edit on all tabs; RecordAttachments in every view dialog; FilterPills + Print Register + Export CSV per tab; 5 dedicated mobile screens including offline-first seed stock movement recording; bundled access to Fields & Crops, Field Operations, Field Inspections, Harvest Records, Storage Locations, and Crop Stock — no separate Field & Crop Management module required" },
  { id: "staff-training", name: "Staff & Training", price: 10, note: "Training records, certificates (50+ types), right-to-work checks, three-register PPE system (PPE Stock Register with supplier & invoice traceability; PPE Issue Register with per-staff issue history & condition checks; PPE Risk Assessments with hazard, risk level, fit check, compatibility & training flags under the PPE at Work Regulations 2022), print-ready PPE Compliance Pack and per-staff PPE Record, competency tracking, multi-farm staff access management, and Labour & Timesheet Management (timesheet recording by operation type, Rota & Shifts planning, Actual Attendance recording with Bradford Factor rolling 52-week sickness analysis, Holiday & Absence tracking with entitlement balance and mobile leave request submission with manager approval workflow and SMS notifications both ways, Holiday Planner month-by-month calendar grid with colour-coded absence types and scheduling conflict detection (flags days where ≥40% of staff are absent), rota-only holiday overlay (shows shifts from Rota & Shifts with no formal absence record in lime green so gaps are visible), printable blank leave request form A4 (ref FT-LR-01) for staff without app access, monthly Pay Summary with CSV export and hourly rate history, Working Time Regulations 1998 compliance monitoring with automated 17-week rolling average and opt-out tracking, and department-grouped views across all six Labour Management tabs — colour-coded section headers separate staff by team when departments are configured)" },
  { id: "safety-risk-audits", name: "Safety, Risk & Audits", price: 20, note: "Combines HS&R and Inspections & Audits; includes Contractor H&S File (PLI & RAMS tracking, induction records), accident book (RIDDOR), COSHH register, PAT testing with BDE-PAT-XXXX asset codes auto-assigned per appliance, QR label printing from the dashboard, and mobile scan-to-test workflow (scan the label → log PAT result on the spot), fire extinguisher register with per-unit service history and certificate log, waste disposal, fly-tipping and encampment records; printable H&S Register covering all four areas in one document" },
  { id: "environment-sustainability", name: "Environment & Sustainability", price: 16, note: "Combines Environmental Management and Carbon & Sustainability; includes dedicated SFI / ELM agreement manager page with action codes, evidence-due deadline alerts, and print-ready compliance report; Slurry & Manure Management with full store register, fill-level progress bars, Fill & Intake Events log, and species-specific storage enforcement — material type locked to store configuration on both the spreading form and fill event dialog, with server-side validation blocking mismatched materials to ensure RB209 and NVZ species-split compliance; mobile app capture for field spreading and store fill events with offline-first sync; Carbon & Sustainability: DEFRA 2023 GHG Auto-Calculator — select a year and Pre-fill from Farm Records pulls fuel tank deliveries, fertiliser applications, livestock herd numbers, and grid electricity consumption and applies DEFRA 2023 emission factors to return Scope 1 and Scope 2 totals with source badges; Use these figures → Create Carbon Audit writes pre-filled tCO₂e totals into a new audit record in one click; Sustainability Reports tab tracks carbon and sustainability reports submitted to supply chain customers with certifying body lookup (Carbon Trust, BSI PAS 2060, LRQA, Bureau Veritas, SGS UK, Intertek, ADAS, SAC Consulting, Agrecalc Carbon Assurance, Farm Carbon Toolkit, and more), submission status, PO reference, invoice reference, and document attachments" },
  { id: "water-irrigation", name: "Water & Irrigation Management", price: 10 },
  { id: "finance-business", name: "Finance & Business", price: 32, note: "Combines Trade Contacts, Financial Records & Business Reports; livestock deadweight kill sheet recording (species, deadweight, pence/kg, EUROP grade, gross value, deductions, net payment) with off-farm movement record linkage — kill sheet linked directly to the BCMS movement notification for Red Tractor and AHDB audit trail compliance; livestock mart / auction sale recording (mart, lot number, species, head count, proceeds, auctioneer reference) with off-farm movement record linkage — mart receipt linked to the corresponding LIS movement record for a complete auctioneer-to-notification chain; and multi-stage Purchase Order approval workflow with product-level approver assignment, pending approvals widget for managers, and submitter name tracking on every order" },
  { id: "weather-tracking", name: "Weather Tracking", price: 15, note: "Manual weather station readings (temperature, rainfall, wind, humidity, pressure) plus Fetch Live — click once to auto-fill current conditions from Open-Meteo using your browser GPS; free, no API key required; spray-record auto-link and historical charting included" },
  { id: "platform-addons", name: "Platform Add-ons", price: 10, note: "Includes SMS Alerts (dedicated SMS Alerts page with three tabs — Config: enable/disable SMS and configure 8 alert types across Critical and Standard tiers; Critical: animal health critical events, compliance deadlines, stock reconciliation discrepancies, and TB test results; Standard: medicine withdrawal reminders, movement pending, weather alerts, and task overdue; Team: per-member SMS opt-in level — All Alerts / Critical Only / None; History: full timestamped alert log per member), push notifications to the mobile app when tasks are assigned (alongside SMS — tapping the notification opens the Task Inbox directly), and Advisor/Inspector Access" },
  { id: "biofuel-rtfo", name: "Biofuel / RTFO Compliance", price: 30 },
  { id: "sheep-production", name: "Sheep Production", price: 25, note: "Flocks registered in Livestock → Herds & Animals (single herd register); tupping records, pregnancy scanning, weigh-in & DLWG performance tracking, shearing records (fleece weight, contractor, BWMB traceability), health plans, Red Tractor Sheep Assurance checklist, disease monitoring with APHA advisory for reportable diseases, analytics tab (litter distribution, DLWG by batch, tupping summary, shearing by year), mobile capture for all record types, year filter on all recording tabs, and document attachment on every record row" },
  { id: "goat-production", name: "Goat Production", price: 25, note: "Herds registered in Livestock → Herds & Animals (single herd register); mating records (buck breed, ear tag, owner, mating method, does exposed, expected kidding, CIDR/sponge flag), pregnancy scanning (barren/singles/doubles/triplets with auto scanning %), weigh-in & DLWG with BCS, cull & market records (deadweight, kill-out %, EUROP grade, sale value), vaccination programmes, disease monitoring (CAE, CLA, Johne's, foot rot, cryptosporidiosis, mycoplasma, FEC), Analytics tab (kid type distribution, DLWG by batch, cull summary), Enterprise Report tab (financial and production KPIs across the enterprise — gross margin, revenue per doe, cost per kg liveweight gain, kidding rate, mortality %, replacement rate, and year-on-year trend charts), mobile capture for all record types, year filter on all recording tabs, and document attachment on every record row" },
  { id: "venison-production", name: "Venison Production", price: 25, note: "Deer herds linked from Livestock → Herds & Animals; stalking & cull records (species, sex, age class, beat, larder/carcass number, liveweight, gralloch weight, carcass weight, kill-out %, cull method and reason, food safety inspection result with Passed/Conditionally Passed/Failed chips, notifiable disease suspect flag with APHA advisory on 03000 200 301), carcass processing & venison sales (facility type — on-farm approved larder, AGHE, licensed GHE; destination — game dealer, wholesale, direct, export; Wild Game Declaration number, price/kg, total value), herd population surveys (driven count, thermal imaging, drone census, camera trap; male/female/young counts, M:F ratio, recruitment rate %), health records (vaccination, bTB SICCT skin test, bTB gamma-interferon blood test, post mortem; bTB result chips, APHA reference, vet prescription flag), firearms & stalking certificate register (Section 1 FC, DSC1, DSC2, WGMI hunter food hygiene; expiry alerts at 90 days; red banner for expired certificates), year filter on all recording tabs, and document attachment on every record row" },
  { id: "organic-venison", name: "Organic Venison", price: 20, note: "Organic certification records for farmed deer enterprises — certifying body and certificate register (Soil Association / OF&G / Biodynamic; certificate type, number, issue/expiry dates, scope, and active/pending/suspended status), grazing compartment land register (compartment name, area ha, conversion status from pre-conversion through certified organic, conversion start date, certified organic date, certifier reference, previous land use), organic feed and mineral supplement log (product name and type, organic approval status — Certified organic / Approved for organic use / Derogation required / Not permitted — with certifier approval reference recording, quantity kg, area/herd, and supplier), and input derogation case management: case reference, input name and type, regulatory basis under UK Organic Regulations, certifier, availability search date and OFIS/UKOAS reference, application date, justification, status (Pending / Approved / Refused / Withdrawn), internal decision date, certifier decision date, expiry date, approval conditions; refusal handling with refusal reason, refusal reference, and corrective action fields; mobile offline-first capture form with all fields syncing to dashboard on reconnection" },
  { id: "beef-production", name: "Beef Production", price: 20, note: "Herds linked from Livestock → Herds & Animals; beef weigh-in & DLWG records, finishing records (entry/exit weights, shed/group management, feed conversion), body condition scoring, deadweight settlement recording with cattle movement record linkage (settlement sheet linked directly to the BCMS movement notification — audit trail from farm dispatch to kill sheet, satisfying AHDB and Red Tractor beef traceability requirements), Red Tractor Beef & Lamb readiness, year filter on all recording tabs, and document attachment on every record row" },
  { id: "pig-production", name: "Pig Production", price: 25, note: "Herds linked from Livestock → Herds & Animals; farrowing & weaning records, stockmanship checks with view dialog and RecordAttachments (for vet reports and photographic welfare evidence), tail biting risk assessments with view dialog and RecordAttachments, feed consumption & FCR, movements, kill records, mortality records, vet health plan integration, Red Tractor Pigs scheme readiness checklist, Pig Salmonella Monitoring — NSMP quarterly blood serology records (number of samples, APHA / approved laboratory, Category 1 / 2 / 3 result, seroprevalence %, submission reference, and corrective actions; Category 3 results trigger a compliance alert and action plan prompt), year filter on all recording tabs, and document attachment on every record row" },
  { id: "poultry-production", name: "Poultry Production", price: 25, note: "Flocks registered in Livestock → Herds & Animals (single herd register); placement & depletion records with hatchery traceability, Chick Purchases tab (hatchery, supplier, breed/strain, quantity, cost, delivery reference; year filter and RecordAttachments in view dialog), daily mortality log with year-by-year trend, breed / strain and hatchery / supplier mortality breakdowns, cause analysis, feed & water consumption, egg production, medicine & vaccine records, biosecurity checklist, house cleanout records (farm staff or contractor, DEFRA-approved disinfectant, dilution rate, stock consumption, cost and invoice tracking, photo evidence), Thinning Records tab (year filter and document attachment on every row), Red Tractor Poultry scheme records, Campylobacter Monitoring — FSA National Control Programme records per flock (test type, slaughter house, FSA / NCP submission reference, result, and biosecurity interventions; year filter, document attachment on rows, full RecordAttachments in view dialog, and print report)" },
  { id: "organic-poultry", name: "Organic Poultry", price: 20, note: "Organic certification and compliance hub for poultry enterprises — Certification tab (certifying body, certificate type: laying hens / broilers / turkeys / ducks / geese / mixed poultry, certificate number, issue date, expiry date, scope, and active / pending / suspended / withdrawn status), Outdoor Access tab (flock reference, total birds in flock, birds on range, range area in ha, auto-calculated birds/ha stocking density, access duration, vegetation condition, compliance status — Compliant / Derogation / Non-Compliant, access blocked flag with reason), Feed Records tab (delivery date, product name, product type, organic approval status — Certified Organic / Approved Non-Organic / Conventional Derogation — certifier reference, quantity, supplier, lot number, invoice reference, linked flock; non-approved deliveries linkable to a derogation case), Derogations tab (non-permitted input case register: case reference, input name, regulatory basis under UK Organic Regulations, certifying body, application date, status — Pending / Approved / Rejected / Expired / Withdrawn — internal decision date, certifier decision date, expiry date, approval conditions; rejection handling with rejection reason, reference, and corrective action); 2 dedicated mobile screens (outdoor access log and feed record capture with offline-first sync)" },
  { id: "fresh-produce", name: "Fresh Produce", price: 25, note: "Growing blocks, crop records, water quality testing, harvest records, pre-cooling & intake, packhouse & despatch, allergen management and cold chain compliance" },
  { id: "viticulture", name: "Viticulture", price: 25, note: "Vine register with UK variety & rootstock selects (24 varieties, 14 rootstocks), GI classification (English Wine PDO/PGI, Welsh Wine PDO/PGI, UK Table Wine, No GI), vineyard block management with full planting lifecycle (permanent block sites with Active, Suspended, and Removed planting states; retire and replant workflows with deactivation reason and audit trail; complete planting history per block; training system, soil type, aspect, organic status), BBCH phenology records (23 growth stages with % reached and temperature), canopy & pruning operations (operation type, pruning system, bud counts, pruning weight per vine), harvest records (total yield, kg/vine, t/ha, Brix, pH, titratable acidity, potential alcohol, botrytis flag), disease & pest scouting with intelligent notification system (pressure ratings for 6 diseases/pests, Xylella fastidiosa and Phytophthora viticola notifiable organism flags with APHA contact prompt, automatic in-app and SMS alerts on critical findings, and auto task-raising prompt on the web dashboard), view-before-edit dialogs on all tabs, per-section task assignment, CSV export on all seven tabs, staff auto-fill from logged-in user, 4 dedicated mobile screens with active block picker (vine scouting, phenology, canopy operations, harvest), and bundled access to Sprays & Inputs, Health & Safety (COSHH), Staff & Training, Equipment & Vehicle Management, and Trade Contacts & Stock at no extra charge" },
  { id: "organic-viticulture", name: "Organic Viticulture", price: 20, note: "Block conversion register (3-year conversion tracking per block, certifying body, pre-conversion history — UK Organic Regs 2020), organic inputs log (approved vineyard inputs with approval status and certifier references), copper register with running 28 kg/ha per 7-year limit tracker (colour-coded progress bar, per-application record), input derogation case register (Sch. 1 / Annex II): split New Case / Record Decision workflow; refusal handling with refusal reason, refusal reference, and corrective action fields; internal decision date; Action Required badge on refused cases without corrective action; availability search evidence; certifier correspondence log; expiry urgency badges; organic wine production additives and SO₂ compliance per vintage (UK-retained EU Reg 203/2012 limits: 100 mg/L red, 150 mg/L white/rosé), certificate register with expiry alerts, and mobile derogation case viewer; the Organic Viticulture page also includes all six standard Viticulture module tabs (Overview, Vine Register, Phenology, Pruning & Canopy, Harvest, Disease Scouting) so organic producers have their complete vineyard operational and compliance records in one place" },
  { id: "farm-diversification", name: "Farm Diversification", price: 15, note: "Farm Shop management, equine & livery health records, shooting & game logs, food hygiene inspections (FHRS), accommodation bookings and diversification income tracking" },
  { id: "grain-crop-storage", name: "Grain & Crop Storage", price: 18, note: "Storage location register, stock movements (intake/dispatch/transfer/drying loss), merchant storage charges, record drill-down linking to haulage, sales and harvest records; Crop Stock Stocktakes — periodic physical count per bin with system quantity auto-fill, measurement method picker (probe measurement, auger sample, weighbridge, visual estimate), variance badge (green/amber/red), conducted-by field, and permanent audit entry per stocktake; mobile capture with offline-first sync; operator name pre-fills from the logged-in user on new records" },
  { id: "farm-services-contracting", name: "Farm Services & Contracting", price: 15, note: "Farm-as-service-provider: contracting jobs, equipment hire, customer directory, revenue summary, insurance cross-reference, and workshop job invoicing — raise billable invoices for repairs or maintenance done for other farms directly from the Workshop module" },
  { id: "resource-planner", name: "Resource Planner", price: 20, note: "Centralised resource registry for tractors, implements, sprayers, trailers, vehicles, and named staff — each with a colour dot for visual identification; drag-and-drop resource assignment from a collapsible sidebar onto Week Ahead Gantt task bars; inline assignment picker on expanded task cards; automatic conflict detection flags any resource double-booked on the same day with an amber warning icon; real-time conflict resolution as assignments are added or removed; colour-coded resource chips on Gantt bars for whole-week utilisation overview at a glance; archive / restore resources without losing allocation history" },
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
