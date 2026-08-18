/**
 * Canonical module pricing data — single source of truth.
 *
 * Both Pricing.tsx and Sectors.tsx import from here so that any price change
 * is automatically reflected in Sectors page CTAs without manual updates.
 */

export const BASE_FEE = 15;

/** Price for the SMS Alerts add-on (standalone, per farm per month). */
export const SMS_ADDON_PRICE = 4;

export interface PricingModule {
  id: string;
  name: string;
  price: number;
  required?: boolean;
  note?: string;
}

// ⚠️  PRICE CHANGE CHECKLIST — when editing any price below, also run:
//   node artifacts/website/scripts/check-hardcoded-prices.mjs
//   node artifacts/website/scripts/check-annual-pricing-ceiling.mjs
//
// check-hardcoded-prices.mjs catches bare £N/month literals that have drifted
// from these canonical values into pages or components.
//
// check-annual-pricing-ceiling.mjs asserts that
//   (BASE_FEE + red-tractor-compliance price) × 12  <  £500/yr
// so the "Under £500 a year" claim on the Pricing page cannot silently become
// "Under £600 a year" without a copy review.  If prices push the annual total
// to £500 or above, update ANNUAL_CEILING in that script after marketing
// approves new copy.
//
// Use modulePrice() or BASE_FEE from this file instead of embedding raw
// numbers in marketing copy.
export const MODULES: PricingModule[] = [
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
] as const;

/** Look up a module's monthly price by its ID. Returns 0 if the ID is not found (which would be a bug). */
export function modulePrice(id: string): number {
  return MODULES.find(m => m.id === id)?.price ?? 0;
}

// Modules that are bundled (included for free) when a particular module is selected.
export const BUNDLE_INCLUSIONS: Record<string, string[]> = {
  "viticulture": ["sprays-inputs", "safety-risk-audits", "staff-training", "equipment-workshop"],
  "organic-viticulture": ["sprays-inputs", "safety-risk-audits", "staff-training", "equipment-workshop", "organic-compliance"],
  "organic-arable": ["field-crop-management", "organic-compliance"],
  "organic-livestock": ["organic-compliance"],
  "organic-dairy": ["organic-compliance"],
  "organic-fresh-produce": ["organic-compliance"],
  "organic-venison": ["organic-compliance"],
  "organic-poultry": ["organic-compliance"],
};
