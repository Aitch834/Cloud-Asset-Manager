import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import {
  ClipboardCheck, Map, Tractor, FileText, LineChart,
  CloudRain, PawPrint, Sprout, ShieldAlert, GraduationCap,
  Droplets, AlertTriangle, Leaf, Fuel, Zap,
  Ham, Bird, Flower2, Store, Waves, Landmark, WheatIcon
} from "lucide-react";

type Badge = "required" | "module" | "included";

interface ModuleDef {
  title: string;
  icon: React.ElementType;
  color: string;
  badge: Badge;
  features: string[];
}

interface Section {
  title: string;
  description: string;
  modules: ModuleDef[];
}

const BADGE_STYLES: Record<Badge, { label: string; className: string }> = {
  required: {
    label: "Required",
    className: "bg-amber-100 text-amber-800 border border-amber-200",
  },
  module: {
    label: "+ Module",
    className: "bg-blue-50 text-blue-700 border border-blue-200",
  },
  included: {
    label: "Included",
    className: "bg-green-50 text-green-700 border border-green-200",
  },
};

const sections: Section[] = [
  {
    title: "Core Platform",
    description: "Included with every subscription — the foundation of Red Tractor compliance on BDE Farm Trac.",
    modules: [
      {
        title: "Red Tractor Compliance",
        icon: ClipboardCheck,
        color: "bg-blue-50 text-blue-600 border-blue-100",
        badge: "required",
        features: [
          "Official template matching",
          "Automated gap analysis",
          "Audit history log",
          "One-click print-ready compliance reports",
          "Farm Planner — switch between a 7-day Week Ahead and 30-day Month Ahead view; draws from 21 data sources across every active module including certificate expiries, inspection dates, insurance renewals, medicine withdrawal periods, PAT tests, fire extinguisher services, water abstraction licence renewals, COSHH review dates, and expected deliveries; custom reminders let you add one-off events (contractor visits, farm walks, merchant meetings) with colour-coding directly into the planner timeline",
          "Task Assignment — assign any planner task to a named staff member directly from the Week Ahead view; the staff member receives an SMS notification instantly with the task title, due date, and any note you add; assignments are tracked with a pending / in progress / completed / cancelled status workflow",
          "Task Board — dedicated manager view of all open and completed task assignments across the farm; filter by staff member or status; expandable cards show the full assignment history including completion notes and timestamps",
          "Insurance Register — record Employers Liability, Public Liability, and all other farm policies with insurer, policy number, cover level, and expiry date; attach PDF or photo scans of certificates for instant on-screen access during inspections; automatic colour-coded alerts (amber at 60 days, red on expiry) for both legally required and Red Tractor-required policies",
        ],
      },
      {
        title: "Grants & Funding",
        icon: Landmark,
        color: "bg-violet-50 text-violet-600 border-violet-100",
        badge: "included",
        features: [
          "Unified grant register — track FETF, Countryside Stewardship capital grants, SFI capital, RDPE, and other scheme applications in one place",
          "Status workflow — Draft → Applied → Approved → Purchased → Claimed, with rejected and withdrawn states to suppress alerts",
          "FETF item reference picker — searchable list of 30+ items across 8 categories (Precision Technology, Slurry Management, Animal Health, Arable, Irrigation, Horticulture, Environment & Energy) based on previous FETF rounds",
          "Purchase and claim deadline tracking — both dates surface automatically in the Farm Planner (amber within 30 days, red when overdue); alerts suppressed once grant is claimed or withdrawn",
          "Grant value and actual cost recording — approved grant amount vs. real purchase price with net cost calculation",
          "Evidence attachment — upload RPA offer letters, purchase invoices, and equipment photos directly to each grant record",
          "Summary dashboard — total approved grant value, live count by status, upcoming deadline warning card",
          "Application reference tracking — store RPA reference numbers at point of submission for audit trail",
        ],
      },
    ],
  },
  {
    title: "Crop & Field",
    description: "End-to-end arable management from field mapping through to harvest audit trail.",
    modules: [
      {
        title: "Field & Crop Management",
        icon: Map,
        color: "bg-brand-pale text-brand-forest border-brand-light/30",
        badge: "module",
        features: [
          "GPS boundary mapping",
          "Crop rotation history",
          "Seed drilling records — crop variety, seed lot, rate & treatment",
          "Harvest audit trail — transport, storage & yield",
          "Planned vs. actual harvest cross-referencing",
          "Field operations log — cultivation, tillage, lime & more",
          "20 operation types with depth, passes & quantity tracking",
          "Field inspection logging with action flags — Monitor, Treat, Urgent",
          "Instant SMS alerts for urgent crop actions",
          "Resolution tracking with audit trail per inspection",
          "Haulage & grain movement records — log haulier, vehicle registration, load type, tonnage, delivery note number and confirmation receipt; haulier directory for quick selection when booking collections or deliveries",
        ],
      },
      {
        title: "Sprays & Inputs",
        icon: Droplets,
        color: "bg-cyan-50 text-cyan-600 border-cyan-100",
        badge: "module",
        features: [
          "Spray application records",
          "Product & batch tracking with lot number capture",
          "Operator lookup with PA certificate auto-fill — select a spray operator from your staff list; their PA1/PA2/PA6 certificate number and expiry status auto-populate with a green (valid) or amber (expiring) indicator confirming compliance before you save",
          "Equipment Used lookup — pick the sprayer or tractor from your Equipment Register; equipment name is stored with the record and cross-referenced against your NSTS sprayer test log",
          "Supplier auto-fill — supplier pre-populates automatically when a GRN delivery is linked; also selectable as a standalone lookup from your Suppliers register",
          "Withholding period alerts",
          "GRN-linked batch traceability — select a specific goods received delivery when logging an application to automatically populate batch and lot numbers, creating a full chain of custody from supplier batch to treated field",
        ],
      },
      {
        title: "Crop Trials",
        icon: WheatIcon,
        color: "bg-lime-50 text-lime-700 border-lime-100",
        badge: "module",
        features: [
          "Trial register — create named on-farm trials with crop, season, protocol, and status (Planned → Active → Harvested → Completed)",
          "Plot management — define treatment and control plots with plot number, rep, area, and treatment label for each trial",
          "GPS plot pin capture — record the exact latitude and longitude of each plot; coordinates stored and displayed in the plot table",
          "Interactive satellite map view — all GPS-tagged plots shown on a Leaflet satellite map with colour-coded markers (green = control, blue = treatment); click any marker to see plot details",
          "Observation log — record dated in-season observations per plot: emergence, canopy, lodging, disease, pest pressure, and yield notes",
          "Full trial report — generate a print-ready A4 report containing trial overview, all plots with GPS coordinates, and the complete observation log for each plot",
          "Mobile GPS walk-up — use the mobile app to walk to a trial plot in the field, tap to capture your live GPS coordinates, and update the plot's location directly on site",
        ],
      },
      {
        title: "Soil Management",
        icon: Sprout,
        color: "bg-lime-50 text-lime-600 border-lime-100",
        badge: "module",
        features: [
          "Soil sample register with auto-generated SS-YYYY-NNNN reference numbers, status workflow (Sampled → Sent to Lab → Results Received), and printable register for Red Tractor audit",
          "GPS sample-point capture — mobile app records the precise location within the field using device GPS (Best Navigation accuracy), with coordinates and accuracy shown live on screen",
          "Dashboard map pin-picker — click a satellite imagery map inside the Register Sample dialog to drop a draggable pin; co-ordinates populate automatically and link out to Google Maps",
          "Location description field — free-text note attached to each sample point (e.g. 'NE corner near hedge, 50m from gate') recorded on both mobile and dashboard",
          "Soil test records linked to accredited testing laboratories — lab selected from picker, UKAS number stored with every sample",
          "Nutrient results per sample — pH, P, K, Mg, N, S, Organic Matter and more; AHDB index and status (Low/Adequate/High) per nutrient",
          "Nutrient Management Plans — field-by-field soil data feeds directly into NMP view",
          "Sample Map view — all GPS-tagged sample points shown on a satellite map as colour-coded pins by status; click any pin to see the field name, sample reference, date, and key nutrient results in a popup",
          "Soil Trends report — select any field to see line charts for pH, P, K and Mg across all historical sampling events, with AHDB target reference lines and direction-of-travel arrows showing whether each nutrient is improving or declining",
          "RB209 compliance and NVZ Nitrate Vulnerable Zone records",
          "Continuous soil monitoring — register sensor probes from any manufacturer (METER Group, Pessl/METOS, Sentek Technologies, Delta-T Devices, and more), log monitoring depths, field assignment, GPS coordinates, and install date for each device",
          "Time-series readings — log soil moisture %, temperature °C, and electrical conductivity (EC μS/cm) per probe; view as a colour-coded multi-line chart across selectable 30/90/180/365-day windows with dual Y-axes for moisture and temperature",
          "Manual entry and bulk CSV import — record individual readings with timestamp and depth directly from the dashboard or mobile app; import bulk data logger exports up to 5,000 rows with flexible column-name matching and a 5-row preview before committing",
          "Entry source tracking — each reading is tagged as manual, csv, or api so you can see at a glance which records came from direct entry, a data logger export, or an automated integration; foundation for future FieldClimate and ZENTRA Cloud API connections",
        ],
      },
    ],
  },
  {
    title: "Equipment & Operations",
    description: "Full lifecycle management for machinery, vehicles, workshop job cards, fuel compliance, and energy metering — in one module.",
    modules: [
      {
        title: "Equipment, Workshop & Fuel",
        icon: Tractor,
        color: "bg-orange-50 text-orange-600 border-orange-100",
        badge: "module",
        features: [
          "Equipment register — make, model, serial number, asset number, type and status",
          "Service & MOT History — log MOT tests, annual services, interim services, repairs, safety inspections, pre-use checks, warranty work and other events per asset",
          "MOT Due and Next Service columns — traffic-light status badges (green / amber / red) on the equipment list at a glance",
          "Full maintenance history per asset with edit and delete, status cards for MOT and next service interval",
          "Sprayer calibration tracking — NSTS test dates with next-due alerts",
          "Grain Storage Quality — bin register with capacity and type, grain quality test records (moisture, protein, specific weight, Hagberg falling number), and temperature log with automatic alerts for rising or out-of-spec readings",
          "Job cards — log repairs, scheduled services, inspections & modifications with priority and status tracking",
          "Costing per job — labour hours, labour cost and root cause analysis; parts issued from the Parts Store appear as a costed line-item breakdown on the job card with real-time cost totals",
          "Service schedule — maintenance intervals, next-due-date tracking with Overdue / Due Soon / OK indicators",
          "QR code labels — generate and print unique EQ- codes for every piece of equipment",
          "Universal mobile QR scanner — scan any BDE Farm Trac label (fields, animals, equipment, storage) to instantly pull up the record",
          "Scan-to-action — quick-log defects, crop events, medicine treatments, or stock movements straight from the scan result",
          "Awaiting-parts workflow — pause job cards mid-repair and resume when parts arrive",
          "Parts Store — catalogue of workshop parts and consumables with stock levels, unit cost, and low-stock warnings; receive deliveries and issue stock to job cards with full movement history",
          "Fuel tank register — diesel (red and white), heating oil (kerosene), bulk LPG (Calor / Flogas) and bottled cylinders, AdBlue, petrol, and other fuels in a single register with gauge visualisation and low-stock alerts",
          "Regulatory framework per fuel type — Oil Storage Regulations 2001 notes on diesel and heating oil tanks; DSEAR 2002 / HSE LPGR / UKLPG Code of Practice notes on all LPG entries",
          "Bunding compliance tracking — mark each tank as bunded or unbunded; bund capacity recorded; automatic warning banner flags any non-bunded oil tanks ≥201 L as per the Oil Storage Regs 2001",
          "Fuel delivery log — record every tanker delivery with supplier, driver, delivery note number, invoice reference, quantity, unit price, total cost, and qualifying use",
          "Red diesel usage log — log every draw-down by date, tank, quantity, purpose, qualifying activity, and staff member; demonstrates to HMRC that rebated fuel is used exclusively for permitted activities",
          "Oil storage inspections — annual inspection checklist covering bunding, labelling, spill kit, fill point lock, pipework, overfill protection, and drainage risk; overdue inspection warnings surfaced in the Farm Planner",
          "Grid Energy — Meter Register and Readings Log for electricity (MPAN), gas (MPRN), and mains LPG; year-to-date consumption and cost summary cards",
          "Carbon reporting ready — all fuel and energy consumption data feeds into the Environment & Sustainability module for Scope 1 and Scope 2 emissions calculations",
        ],
      },
    ],
  },
  {
    title: "Livestock",
    description: "Complete livestock and feed management — welfare records, movements, medicine, breeding traceability, and feed audit trails in one module.",
    modules: [
      {
        title: "Livestock & Feed Management",
        icon: PawPrint,
        color: "bg-rose-50 text-rose-600 border-rose-100",
        badge: "module",
        features: [
          "Herd & flock register",
          "Movement records (eAML2 / ScotEID / EIDCymru)",
          "Medicine records & withdrawal tracking",
          "Animal mortality records — cause, disposal & BCMS",
          "Annual water quality testing — herd-linked records, lab certificate storage & automated welfare alerts",
          "Daily welfare checks with condition scoring",
          "Annual vet health plans (signed, printable)",
          "Sire Register — centralised directory of bulls, rams, boars, and bucks (owned, hired, or AI stud) with species, breed, ear tag or registration number, date of birth, source, and health status notes; sire auto-fills breed on every AI and reproduction record",
          "AI & Reproduction records — service date, sire/bull ID, breed, method (AI, synchronised AI, natural service, ET), and confirmation of pregnancy; expected calving and lambing dates surface in the Farm Planner",
          "Straw Inventory — log every AI semen delivery with supplier, batch number, straws received, storage location, and cost per straw; remaining stock calculated automatically from linked AI records with green / amber / red stock badges; straw picker in the AI form auto-fills batch reference, sire name, and breed for full supplier-to-female traceability",
          "Veterinary prescriptions — log vet-written prescriptions with drug, dose, withdrawal period, and dispensing vet details for full medicine audit trail",
          "Feed deliveries (GRN) — log every feed delivery with supplier, delivery note number, invoice reference, feed type, quantity, lot/batch number, and unit price; complete audit trail from supplier batch to livestock feeding event",
          "UFAS / FEMAS supplier traceability — record your feed supplier's UFAS (Universal Feed Assurance Scheme) or FEMAS (Feed Materials Assurance Scheme) registration number on every delivery; UFAS number auto-populated from the Supplier Register",
          "APHA compound feed registration — record Animal & Plant Health Agency (APHA) registered feed number on GRNs for licensed compound feeds and premixtures",
          "Medicated feed flagging — flag deliveries as medicated with the active ingredient, withdrawal period end date, and licensed indication; excluded from untreated animal feeding until the withdrawal period has cleared",
          "Feed Bin Register — register each physical feed bin or storage unit with product name, location, supplier, opening balance, and reorder level; in create mode enter an opening stock figure to seed the live balance immediately; in edit mode a manual adjustment field (positive or negative) with a mandatory reason keeps an audit trail of every stock correction alongside automatic deliveries; live balance shown at all times with reorder alert when stock falls below your threshold",
          "Red Tractor traceability readiness — all feed delivery records satisfy the feed materials traceability requirements of Red Tractor Beef & Lamb, Dairy, and Pigs standards",
        ],
      },
    ],
  },
  {
    title: "Compliance & Regulatory",
    description: "The record-keeping that keeps you audit-ready year-round.",
    modules: [
      {
        title: "Biosecurity & Visitors",
        icon: ShieldAlert,
        color: "bg-red-50 text-red-600 border-red-100",
        badge: "module",
        features: [
          "Farm Buildings & Areas registry",
          "GPS map pins — place each building on the Farm Map for visual location tracking",
          "Farm Map — interactive satellite view of all registered buildings and areas with colour-coded type markers",
          "Mobile location registration — add new buildings on site with one-tap GPS capture, saves live to the dashboard",
          "Visitor & Contractor logs",
          "Pest control records",
          "Cleaning & Disinfection logs",
          "COSHH assessments",
          "Biosecurity Plan — 13-section structured written plan (restricted areas, visitor & vehicle controls, footwear hygiene, cleaning protocols, pest management, new animal isolation, feed security, disease outbreak response, notifiable disease procedures, waste management, water protection, staff responsibilities); emergency contacts section for farm vet (auto-populated from your Vet Health Plans) and APHA area office; document control with author, approver, version number, and review dates; Print Plan button generates a formal A4 document with signature blocks suitable for inspector review",
          "Feed Contingency Plan — required under Red Tractor standards; record stock resilience targets (minimum days' cover and kg alert threshold), primary feed supplier (auto-populated from your Supplier Register with phone and email), alternative suppliers with lead times, trigger conditions, immediate actions, rationing procedures, communication plan, incident record-keeping, and recovery actions; review status badge tracks upcoming and overdue review dates",
          "Disease & Incident Log — timestamped log of all disease and health events with species and herd/group selection; notifiable disease flag prompts immediate APHA contact (03000 200 301) with a dropdown covering FMD, Bluetongue, AI, ASF, Classical Swine Fever, Brucellosis, bTB, Anthrax, and more; vet response section (call date, visit date, advice, treatment, prescription reference); biosecurity response (isolation with location, movement restriction with details); APHA reporting (reference number, notified date); outcome summary, lessons learned, and mortality count for resolved incidents",
          "Feed Recall Incidents — raise, track, and close feed withdrawal or recall incidents by concern type (contamination, mislabelling, supplier-issued recall, disease link, or regulatory / APHA advice); feed identification links to delivery batch numbers for supplier-to-farm traceability; impact assessment captures affected herds, estimated animal count, and health impact; records notifications to supplier, authority (APHA, Trading Standards, FSA, DEFRA), and vet with reference numbers and dates; resolution section captures disposal method, replacement sourcing, and lesson learned",
        ],
      },
      {
        title: "Organic Compliance",
        icon: Sprout,
        color: "bg-green-50 text-green-700 border-green-100",
        badge: "module",
        features: [
          "Complementary record — designed to sit alongside your Soil Association or OF&G portal, not to replace it; direct links to both certifier portals from within the module",
          "Farm certification card — certifying body (Soil Association, OF&G, Biodynamic, or other), certificate number, operator number, certification date, and annual renewal date with amber and red expiry alerts",
          "Status tracking — certified organic, in-conversion, or conventional at farm level with a clear status badge",
          "Field status register — record each field as certified organic, in conversion, or conventional; mark fields with parallel production where organic and non-organic land exist on the same holding",
          "Conversion progress tracker — for in-conversion fields, a visual progress bar shows how far through the statutory two-year conversion period the land is, with automatic expected certification date calculation",
          "Organic inspection log — record each annual certifier inspection visit: inspector name, certifying body, date, outcome (Pass / Pass with Advisory Notes / Non-conformance Minor or Major / Suspension), certificate reference, and next inspection due date",
          "Non-conformance and action tracking — fields for recording non-conformances identified and corrective actions required surface automatically when a non-pass outcome is selected",
          "Print-ready Inspection Register — A4 landscape register suitable for presenting to auditors or advisors, printed directly from the browser",
          "Next inspection countdown — colour-coded alerts on upcoming inspection due dates (amber within 60 days, red overdue) surface on the inspection card",
          "Restricted inputs log — document exceptional use of products not normally permitted under organic standards; records product name, category, field, date, applied by, full written justification, certifier approval reference, and a certifier-notified confirmation flag",
          "Certifier notification tracking — each restricted input record shows whether the certifier has been notified, with an amber badge until confirmed",
          "Restricted inputs warning banner — a prominent advisory notice reminds staff to consult their certifier before applying any restricted product",
        ],
      },
      {
        title: "Staff & Training",
        icon: GraduationCap,
        color: "bg-indigo-50 text-indigo-600 border-indigo-100",
        badge: "module",
        features: [
          "Staff directory — create records for every team member; records-only entries for compliance tracking (no login required) or invite staff to the system with a secure 7-day email link they use to set their own password",
          "Four access types per user — No System Access (records only), Mobile App Only, Web Dashboard Only, or Full Access (both platforms) — set independently for each staff member",
          "Four permission levels — Operator (field record entry), Senior / Foreman (all farm records + team oversight), Farm Manager (full operational access including financials), Owner (unrestricted including billing); navigation and sensitive pages are automatically hidden based on each user's level",
          "Multi-farm support — one login can hold different roles on multiple farm holdings within the same group; each association carries its own independent access type and permission level",
          "Right to Work register — record document type, reference, check date and examiner; track expiry for time-limited visas with urgent alerts within 28 days; automatic flag for any staff member with no check on file",
          "Certificate register — 50+ certificate types across 10 groups: Pesticide Application (PA1–PA6AW), Livestock Welfare (WASK/WATOK, disbudding, AI), Animal Transport (Cat 1 & 2), Machinery (telehandler, FLT, ATV, combine), Chainsaw (CS30–CS38), Health & Safety (FAW, EFAW, COSHH, confined space), Agronomy (BASIS, FACTS, NRoSO), Veterinary & Medicines (AMTRA SQP), Food & Hygiene (Level 2 & 3), and Formal Qualifications",
          "Training records — log in-house and external training with provider, assessor, date and competency achieved",
          "Expiry alerts — colour-coded badges (green / amber / red) on every cert and training record; per-person summary visible on the staff list",
          "Compliance gap panel — automatic red/amber banners surface missing critical certs (WASK, Animal Transport, PA1, First Aid) that clear once the cert is recorded",
          "Staff-linked records — cert and training forms use a real-user dropdown so records are tied to the correct person, not a typed name",
          "Post-invite RTW prompt — after inviting a new team member, the system reminds you to carry out a Right to Work check and record their certificates before they start",
          "Print Register — generates a formatted A4 document with training and certificate tables plus sign-off blocks, suitable for presenting to a Red Tractor inspector",
          "Mobile Task Inbox — staff log in to the mobile app to see all tasks assigned to them; each card shows the task, due date, module, and manager's note; staff can mark tasks in progress or complete with an optional completion note; managers see status updates in real time on the Task Board",
        ],
      },
      {
        title: "Safety, Risk & Audits",
        icon: AlertTriangle,
        color: "bg-amber-50 text-amber-600 border-amber-100",
        badge: "module",
        features: [
          "Risk assessment records — hazard description, risk level (low / medium / high / critical), control measures, review date tracking, and pre-loaded template library covering the most common agricultural hazards",
          "COSHH records — substance register with product name, hazard classification, storage, PPE requirements, emergency procedures, and mandatory review date alerts",
          "PAT testing log — record annual Portable Appliance Tests for all electrical equipment on the holding; captures tester details, certificate number, pass / fail / advisory result, and next-due-date alerts; satisfies Electricity at Work Regulations 1989 duty",
          "Fire extinguisher register — track type (CO₂, dry powder, foam, water, wet chemical), capacity, serial number, servicing engineer, and annual service dates with overdue and due-soon warnings; satisfies Regulatory Reform (Fire Safety) Order 2005",
          "Waste disposal logs — EWC codes, carrier licence and transfer note tracking, Duty of Care compliance",
          "Fly-Tipping Incident Register — waste type, quantity, hazard flag, GPS location, clearance status, and reference numbers for police, council, and Environment Agency; photo evidence attached per incident",
          "Unauthorized Encampments Register — vehicle and person counts, land damage, police direction tracking (Section 61 / PCSC Act 2022), legal action log, insurance claims, and remediation costs",
          "Accident Book — RIDDOR-compliant incident records with injury type, witness details, corrective action and sign-off",
          "Mobile incident reporting — log fly-tipping and encampments in the field with on-device camera capture; syncs to dashboard automatically",
          "Inspection records — formal site, process, and compliance inspections with pass / fail / advisory outcomes",
          "Non-conformance logging with corrective action workflow and close-out tracking",
          "Print-ready audit summaries and incident registers — A4 format suitable for Red Tractor assessor presentation",
        ],
      },
      {
        title: "Biofuel / RTFO Compliance",
        icon: Fuel,
        color: "bg-yellow-50 text-yellow-700 border-yellow-100",
        badge: "module",
        features: [
          "RTFO sustainability declarations",
          "Field eligibility tracking",
          "GHG traceability records",
          "Audit pack PDF generation",
        ],
      },
    ],
  },
  {
    title: "Environment & Sustainability",
    description: "Agri-environment scheme records, carbon reporting, and water management — combined in one module.",
    modules: [
      {
        title: "Environment & Sustainability",
        icon: Leaf,
        color: "bg-green-50 text-green-600 border-green-100",
        badge: "module",
        features: [
          "Environmental feature mapping",
          "Agri-environment scheme records — Stewardship agreement logging with habitat, hedgerow, and management event records",
          "Scheme obligation tracking per event — link each management action to the corresponding SFI, CS, or ELM agreement option",
          "SFI / ELMs Actions — log agreements with action codes, payment rates, area, and annual review tracking",
          "Slurry & Manure Management — store capacity and type records, spreading event logs with application rate, field, date and contractor, and NVZ closed-period compliance notes",
          "Farm carbon footprint calculator — Agrecalc / Cool Farm compatible inputs",
          "Emissions by category: enteric fermentation, manure, fuel, fertiliser, imported feed",
          "Year-on-year baseline comparison and trend charts",
          "Sustainability action plan — log actions, estimate savings, track progress",
          "Renewable energy production logging — solar, wind and AD",
          "Biodiversity net gain tracking — habitat creation and baseline scoring",
          "Supply chain sustainability declarations for retailer assurance schemes",
        ],
      },
      {
        title: "Water & Irrigation Management",
        icon: Waves,
        color: "bg-sky-50 text-sky-700 border-sky-100",
        badge: "module",
        features: [
          "Water source register — bore holes, rivers, reservoirs and mains",
          "Abstraction licence tracking with annual allocation and usage",
          "Daily / weekly meter readings and volumetric usage logs",
          "Irrigation event records — field, crop, volume and method",
          "Soil moisture deficit tracking — log SMD readings per field to support irrigation scheduling decisions; separate from the continuous sensor monitoring available in the Soil Management module",
          "Pump maintenance records — service dates and calibration",
          "EA compliance check — CAMS reporting and licence conditions",
          "Drought management planning and restriction alerts",
        ],
      },
    ],
  },
  {
    title: "Finance & Business",
    description: "Procurement, sales, financial records, and business reporting — all in one module, with separate add-ons for document storage, weather, and platform utilities.",
    modules: [
      {
        title: "Finance & Business",
        icon: LineChart,
        color: "bg-emerald-50 text-emerald-600 border-emerald-100",
        badge: "module",
        features: [
          "Supplier directory — classify each supplier by type (Feed, Agricultural Chemicals, Fuel & Energy, Veterinary, Laboratory, Machinery, Seed, Haulage, and more); UFAS / FEMAS / APHA certification expiry tracking with 60-day amber and expired-red warnings",
          "Purchase Orders (PO) — raise formal orders with auto-generated PO-YYYY-0001 references, multi-line order tables (product, quantity, unit price), and Draft → Sent → Received status tracking",
          "Goods Received Notes (GRN) — auto-generated GRN-YYYY-0001 references on every delivery; link to an open PO to update received quantities automatically; batch and lot number captured at point of receipt and carried forward to spray application records",
          "3-way matching — Purchase Order → GRN → Supplier Invoice for a complete procurement audit trail",
          "Testing laboratory register — UKAS-accredited labs as a supplier subtype; linked by picker when recording soil samples, grain quality tests, and water quality tests",
          "Grain trading — spot, forward contract, pool scheme and ex-store sales with buyer, tonnage, £/tonne, moisture, protein, grade, crop year, weighbridge ticket and invoice reference; covers wheat, barley, OSR, beans, peas, oats and more",
          "Livestock deadweight sales — kill sheet capture per species with deadweight, pence/kg, grade classification, gross value, deductions, net payment, and ear tag list",
          "Livestock mart / auction sales — lot number, auction mart, price per head, gross proceeds and auctioneer reference",
          "Milk statements — monthly entry per milk buyer with litres supplied, pence per litre, butterfat %, protein %, SCC, quality bonus/penalty, transport deduction and net payment",
          "Poultry batch settlements, egg sales, and pig kill records with full settlement capture",
          "Direct & farm gate sales — farm shop, box scheme, farmers market, wholesale, online or restaurant sales with payment status tracking",
          "Input cost logging — invoice reference, supplier, cost category and VAT treatment for feed, seed, fertiliser, agrochemicals, fuel and sundry costs",
          "CSV export and Xero-compatible export for seamless handoff to your accountant",
          "Gross margin analysis by crop, full P&L income statement, input cost breakdown with category percentages",
          "Grain position — harvested vs moved vs in store",
          "Agri-environment & subsidy income summary; year-on-year comparison across up to 5 seasons",
          "Asset register with straight-line depreciation",
          "Mobile capture — grain sales, livestock sales, milk statements and direct farm gate sales recorded offline and synced automatically",
        ],
      },
      {
        title: "Document Management",
        icon: FileText,
        color: "bg-gray-100 text-gray-700 border-gray-200",
        badge: "module",
        features: [
          "PDF & photo storage",
          "Record attachment",
          "Thumbnail previews",
          "Cloud backup",
        ],
      },
      {
        title: "Weather Tracking",
        icon: CloudRain,
        color: "bg-sky-50 text-sky-600 border-sky-100",
        badge: "module",
        features: [
          "Farm-base station input",
          "Vehicle-mounted integration",
          "Spray-record auto-link",
          "Historical charting",
        ],
      },
      {
        title: "Platform Add-ons",
        icon: Zap,
        color: "bg-indigo-50 text-indigo-700 border-indigo-100",
        badge: "module",
        features: [
          "SMS Text Alerts — receive critical compliance alerts by text message; unnotified livestock movements, expired staff certificates, water quality failures, overdue inspections, and upcoming key dates delivered instantly to any UK mobile number",
          "Permanent advisor accounts — give agronomists, vets, and FACTS advisers their own login with access scoped to only the modules you choose",
          "Time-limited inspection sessions — generate a secure, expiring link for Red Tractor certification body assessors to view your records during an audit visit",
          "21-module scope selector — share only what you choose; advisors and inspectors cannot access any module not explicitly granted",
          "Full access log with timestamp and accessor name for every advisor or inspector login",
        ],
      },
    ],
  },
  {
    title: "Specialist Enterprises",
    description: "Dedicated modules for specialist production systems with their own scheme requirements.",
    modules: [
      {
        title: "Pig Production",
        icon: Ham,
        color: "bg-pink-50 text-pink-700 border-pink-100",
        badge: "module",
        features: [
          "Pig herd register with breed, age and production system",
          "Farrowing & weaning records — litter size, piglet weights and survival",
          "Health & medicine records with withdrawal tracking",
          "Movements — Eartag Scotland / APHA compliant",
          "Feed consumption & FCR records per house",
          "Mortality records — cause, disposal and APHA reporting",
          "Veterinary health plan integration",
          "Red Tractor Pigs scheme readiness checklist",
        ],
      },
      {
        title: "Poultry Production",
        icon: Bird,
        color: "bg-amber-50 text-amber-700 border-amber-100",
        badge: "module",
        features: [
          "Flock register — broiler, layer, turkey, duck and speciality species",
          "Placement & depletion records with hatchery traceability",
          "Daily mortality log — cumulative count & cause analysis",
          "Feed & water consumption per flock / house",
          "Egg production records — lay rate, grading and packing",
          "Medicine & vaccine records with batch numbers",
          "Biosecurity checklist with down-time between placements",
          "Red Tractor Poultry & Lion Quality scheme records",
        ],
      },
      {
        title: "Horticulture & Fresh Produce",
        icon: Flower2,
        color: "bg-green-50 text-green-700 border-green-100",
        badge: "module",
        features: [
          "Crop & variety register with field / block assignment",
          "Planting, transplanting & harvesting records",
          "Spray & irrigation records — operator, product and dose",
          "Harvest grade & quality records — packed weights and rejection rates",
          "Cold store temperature logs",
          "Allergen & traceability chain records",
          "Red Tractor Fresh Produce, LEAF and GlobalG.A.P. readiness",
          "Assured Produce / BRCGS-ready audit evidence trail",
        ],
      },
      {
        title: "Farm Diversification",
        icon: Store,
        color: "bg-violet-50 text-violet-700 border-violet-100",
        badge: "module",
        features: [
          "Diversification enterprise register — glamping, tourism, B&B, farm shop, events",
          "Planning permission and consent tracking",
          "Booking & occupancy records for accommodation and events",
          "Income records by enterprise with monthly summaries",
          "Public liability and insurance document storage",
          "Food hygiene ratings and inspections log",
          "Visitor management — check-in / check-out and visitor waivers",
          "Business rates and tax liability notes",
        ],
      },
    ],
  },
];

export default function Features() {
  return (
    <Layout>
      {/* Hero */}
      <div className="bg-earth-cream py-16 md:py-24 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Platform Modules</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            BDE Farm Trac is built modularly. Whether you run a simple arable operation or a complex mixed farm, you only pay for the tools you need.
          </p>
          {/* Badge legend */}
          <div className="flex items-center justify-center gap-4 mt-8 flex-wrap">
            {(Object.entries(BADGE_STYLES) as [Badge, typeof BADGE_STYLES[Badge]][]).map(([, cfg]) => (
              <span key={cfg.label} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.className}`}>
                {cfg.label}
              </span>
            ))}
            <span className="text-xs text-muted-foreground">— shown on each module card</span>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        {sections.map((section, sIdx) => (
          <div key={section.title}>
            {/* Section header */}
            <div className="mb-8 pb-4 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground">{section.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
            </div>

            {/* Module cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {section.modules.map((mod, mIdx) => {
                const badge = BADGE_STYLES[mod.badge];
                return (
                  <motion.div
                    key={mod.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: (mIdx % 3) * 0.08 + sIdx * 0.03, duration: 0.45 }}
                    className="relative bg-white rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Badge — top-right corner */}
                    <span className={`absolute top-4 right-4 text-xs font-semibold px-2.5 py-0.5 rounded-full ${badge.className}`}>
                      {badge.label}
                    </span>

                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 border ${mod.color}`}>
                      <mod.icon className="w-6 h-6" />
                    </div>

                    <h3 className="text-xl font-bold mb-4 text-foreground pr-16">{mod.title}</h3>

                    <ul className="space-y-3">
                      {mod.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-light mt-1.5 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
