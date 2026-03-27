import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import {
  ClipboardCheck, Map, Package, Tractor, FileText, LineChart,
  CloudRain, PawPrint, Sprout, ShieldAlert, GraduationCap,
  Droplets, AlertTriangle, ClipboardList, Leaf, Truck, Fuel, Share2, BarChart3, Wrench,
  Ham, Bird, Flower2, Flame, Store, Waves, Landmark, Zap, WheatIcon
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
          "RB209 compliance and NVZ Nitrate Vulnerable Zone records",
        ],
      },
    ],
  },
  {
    title: "Equipment & Operations",
    description: "Full lifecycle management for machinery, vehicles, and the workshop.",
    modules: [
      {
        title: "Equipment & Vehicles",
        icon: Tractor,
        color: "bg-orange-50 text-orange-600 border-orange-100",
        badge: "module",
        features: [
          "Equipment register",
          "Maintenance logs",
          "Sprayer calibration tracking",
          "Asset onboarding/offboarding",
          "Grain Storage Quality — bin register with capacity and type, grain quality test records (moisture, protein, specific weight, Hagberg falling number), and temperature log with automatic alerts for rising or out-of-spec readings",
        ],
      },
      {
        title: "Workshop & Asset Management",
        icon: Wrench,
        color: "bg-teal-50 text-teal-700 border-teal-100",
        badge: "module",
        features: [
          "Job cards — log repairs, scheduled services, inspections & modifications with priority and status tracking",
          "Costing per job — labour hours, labour cost, parts cost & root cause analysis",
          "Service schedule — maintenance intervals, next-due-date tracking with Overdue / Due Soon / OK indicators",
          "QR code labels — generate and print unique EQ- codes for every piece of equipment",
          "Universal mobile QR scanner — scan any BDE Farm Trac label (fields, animals, equipment, storage) to instantly pull up the record",
          "Scan-to-action — quick-log defects, crop events, medicine treatments, or stock movements straight from the scan result",
          "Awaiting-parts workflow — pause job cards mid-repair and resume when parts arrive",
          "Asset onboarding / offboarding — retirement, sale, and disposal records",
          "PAT testing log — record annual portable appliance tests with tester details, certificate numbers, pass / fail / advisory result, and next-due-date alerts",
          "Fire extinguisher register — track type (CO₂, dry powder, foam, water, wet chemical), capacity, serial number, engineer, and annual service dates with overdue warnings",
          "Workshop risk assessments — pre-loaded hazard library covering welding, grinding, lifting, compressed air, and flammable liquids with control measures and review date tracking",
          "Workshop COSHH assessments — substance library for engine oils, fuels, solvents, and welding gases with PPE requirements and emergency procedure records",
        ],
      },
      {
        title: "Transport & Haulage",
        icon: Truck,
        color: "bg-stone-50 text-stone-600 border-stone-200",
        badge: "module",
        features: [
          "Haulage movement records",
          "Load & tonnage tracking",
          "Haulier directory",
          "Delivery confirmation logs",
        ],
      },
    ],
  },
  {
    title: "Livestock",
    description: "Comprehensive livestock records covering welfare, movements, medicine, and veterinary requirements.",
    modules: [
      {
        title: "Livestock Management",
        icon: PawPrint,
        color: "bg-rose-50 text-rose-600 border-rose-100",
        badge: "module",
        features: [
          "Herd & flock register",
          "Movement records (eAML2 / ScotEID / EIDCymru)",
          "Medicine records & withdrawal tracking",
          "Animal mortality records — cause, disposal & BCMS",
          "Feed records with supplier & batch traceability",
          "Annual water quality testing — herd-linked records, lab certificate storage & automated welfare alerts",
          "Daily welfare checks with condition scoring",
          "Annual vet health plans (signed, printable)",
          "AI & Reproduction records — service date, sire/bull ID, breed, method, and confirmation of pregnancy",
          "Veterinary prescriptions — log vet-written prescriptions with drug, dose, withdrawal period, and dispensing vet details for full medicine audit trail",
        ],
      },
      {
        title: "Feed Management",
        icon: WheatIcon,
        color: "bg-yellow-50 text-yellow-800 border-yellow-100",
        badge: "module",
        features: [
          "Feed deliveries (GRN) — log every feed delivery with supplier, delivery note number, invoice reference, feed type, quantity, lot/batch number, and unit price; complete audit trail from supplier batch to livestock feeding event",
          "UFAS / FEMAS supplier traceability — record your feed supplier's UFAS (Universal Feed Assurance Scheme) or FEMAS (Feed Materials Assurance Scheme) registration number on every delivery; UFAS number auto-populated from the Supplier Register for recognised feed suppliers",
          "APHA compound feed registration — record Animal & Plant Health Agency (APHA) registered feed number on GRNs for licensed compound feeds and premixtures",
          "Medicated feed flagging — flag deliveries as medicated with the active ingredient, withdrawal period end date, and licensed indication; medicated feed appears with a dedicated warning label and is excluded from untreated animal feeding until the withdrawal period has cleared",
          "Feed stock levels register — maintain a live stock level per feed type and storage location; reorder alerts when stock falls below your configured minimum; stock is automatically updated when deliveries are recorded",
          "Withdrawal period tracking — active withdrawal periods for medicated feeds surface as warnings on the Feed Management dashboard; alerts remain until the withdrawal date passes or the medicated batch is consumed",
          "Feed supplier certification register — feed suppliers are classified in the Supplier Register with UFAS / FEMAS / APHA numbers, scheme certification expiry dates, and automated 60-day expiry warnings; expired certification flagged with a red banner to prevent inadvertent purchases from non-compliant suppliers",
          "Red Tractor traceability readiness — all feed delivery records satisfy the feed materials traceability requirements of Red Tractor Beef & Lamb, Dairy, and Pigs standards; inspectors can be shown a complete digital record of what was fed, when, from which batch, and from which approved supplier",
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
        ],
      },
      {
        title: "Risk & Waste Management",
        icon: AlertTriangle,
        color: "bg-amber-50 text-amber-600 border-amber-100",
        badge: "module",
        features: [
          "Risk assessment records with hazard rating and review scheduling",
          "COSHH data sheets — substance register with mandatory review dates",
          "Waste disposal logs — EWC codes, carrier licence and transfer note tracking, Duty of Care compliance",
          "Corrective action tracking linked to non-conformances and inspections",
          "Fly-Tipping Incident Register — waste type, quantity, hazard flag, GPS location, access point, clearance status, and reference numbers for police, council, and Environment Agency; photo evidence attached per incident",
          "Unauthorized Encampments Register — vehicle and person counts, land damage, police direction tracking (Section 61 / PCSC Act 2022), legal action log (injunctions, Part 55 CPR possession orders, court order references), insurance claims, and remediation costs",
          "Accident Book — RIDDOR-compliant incident records with injury type, witness details, corrective action and sign-off",
          "Photo evidence upload on all incident records — JPEG, PNG and PDF; multiple files per record",
          "Mobile incident reporting — log fly-tipping and encampments in the field with on-device camera capture; syncs to dashboard automatically",
          "Print-ready incident registers — A4 format suitable for Red Tractor assessor presentation",
        ],
      },
      {
        title: "Inspections & Audits",
        icon: ClipboardList,
        color: "bg-violet-50 text-violet-600 border-violet-100",
        badge: "module",
        features: [
          "Inspection records",
          "Non-conformance logging",
          "Corrective actions",
          "Print-ready audit summaries",
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
      {
        title: "Fuel & Energy Management",
        icon: Zap,
        color: "bg-amber-50 text-amber-700 border-amber-100",
        badge: "module",
        features: [
          "Fuel tank register — diesel (red and white), heating oil (kerosene), bulk LPG (Calor / Flogas) and bottled cylinders, AdBlue, petrol, and other fuels in a single register with gauge visualisation and low-stock alerts",
          "Regulatory framework per fuel type — Oil Storage Regulations 2001 notes on diesel and heating oil tanks; DSEAR 2002 / HSE LPGR / UKLPG Code of Practice notes on all LPG entries; ensures the correct compliance regime is visible at the point of record entry",
          "Bunding compliance tracking — mark each tank as bunded or unbunded; bund capacity recorded; automatic warning banner flags any non-bunded oil tanks ≥201 L as per the Oil Storage Regs 2001",
          "Fuel delivery log — record every tanker delivery with supplier, driver, delivery note number, invoice reference, quantity, unit price, total cost, and qualifying use; retains the full paper trail HMRC may request during a fuel duty inspection",
          "Red diesel usage log — log every draw-down by date, tank, quantity, purpose, qualifying activity, and staff member; demonstrates to HMRC that rebated fuel is used exclusively for permitted activities",
          "Oil storage inspections — annual inspection checklist covering bunding, labelling, spill kit, fill point lock, pipework, overfill protection, and drainage risk; pass / advisory / fail result with issues and actions recorded; overdue inspection warnings surfaced in the Farm Planner",
          "Grid Energy — Meter Register — add electricity meters (identified by 13-digit MPAN), natural gas meters (MPRN), and mains LPG; record supplier, account number, tariff name, unit rate and standing charge",
          "Grid Energy — Readings Log — log cumulative meter readings with consumption (kWh), export kWh (solar / wind feed-in), billing period, invoice reference, and cost per billing period; filter by individual meter",
          "Grid Energy summary cards — year-to-date electricity consumption, year-to-date gas/LPG energy, and year-to-date grid energy cost shown at a glance on the module overview",
          "Carbon reporting ready — all energy consumption data (fuel, electricity, gas) feeds directly into the Carbon & Sustainability module for Scope 1 and Scope 2 emissions calculations, Agrecalc / Cool Farm compatible",
          "ESOS compliance support — auditable energy consumption records suitable for presenting to an Energy Savings Opportunity Scheme (ESOS) lead assessor for farms connected to larger businesses",
        ],
      },
    ],
  },
  {
    title: "Environment & Sustainability",
    description: "Agri-environment obligations, carbon reporting, and water management in one place.",
    modules: [
      {
        title: "Environmental Management",
        icon: Leaf,
        color: "bg-green-50 text-green-600 border-green-100",
        badge: "module",
        features: [
          "Environmental feature mapping",
          "Agri-environment scheme records",
          "Stewardship agreement logging",
          "Habitat & hedgerow records",
          "Management events log (hedge trimming, pond clearance, mowing & more)",
          "Scheme obligation tracking per event",
          "SFI / ELMs Actions — log Sustainable Farming Incentive and Environmental Land Management agreements with action codes, payment rates, area, and annual review tracking",
          "Slurry & Manure Management — store capacity and type records, spreading event logs with application rate, field, date and contractor, and NVZ closed-period compliance notes",
        ],
      },
      {
        title: "Carbon & Sustainability",
        icon: Flame,
        color: "bg-emerald-50 text-emerald-700 border-emerald-100",
        badge: "module",
        features: [
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
          "Soil moisture monitoring integration",
          "Pump maintenance records — service dates and calibration",
          "EA compliance check — CAMS reporting and licence conditions",
          "Drought management planning and restriction alerts",
        ],
      },
    ],
  },
  {
    title: "Finance & Business",
    description: "From input costs and grant applications through to management accounts and business reports.",
    modules: [
      {
        title: "Stock & Suppliers",
        icon: Package,
        color: "bg-earth-cream text-earth-brown border-earth-tan/30",
        badge: "module",
        features: [
          "Supplier directory",
          "Purchase Orders (PO) — raise formal orders against registered suppliers with auto-generated PO-YYYY-0001 reference numbers, multi-line order tables (product, quantity, unit price), and Draft → Sent → Received status tracking",
          "Goods Received Notes (GRN) — auto-generated GRN-YYYY-0001 references on every delivery; link each GRN to an open PO to automatically update received quantities and advance PO status to Partially Received or Fully Received",
          "3-way matching — Purchase Order → GRN → Supplier Invoice for a complete procurement audit trail",
          "Batch & lot number capture on every delivery — batch codes and lot numbers recorded at the point of receipt and carried forward to spray application records",
          "Live inventory tracking",
          "Testing laboratory register — add UKAS-accredited labs as a supplier subtype; labs are linked by picker when recording soil samples, grain quality tests, and water quality tests so every analytical result traces to the accredited laboratory that produced it",
          "Supplier type classification — classify each supplier by type (Feed, Agricultural Chemicals, Fuel & Energy, Veterinary, Laboratory, Machinery, Seed, Haulage, and more) so feed merchants, agchem distributors, and fuel suppliers are held in one searchable register; type-filter on the supplier list narrows results instantly",
          "Feed supplier compliance fields — record UFAS (Universal Feed Assurance Scheme) registration number, FEMAS (Feed Materials Assurance Scheme) number, and APHA compound feed registration number directly on the supplier record; these pre-populate automatically when logging feed deliveries, eliminating re-keying",
          "Supplier certification expiry tracking — enter certification expiry dates (UFAS, FEMAS, Red Tractor supply chain membership, or any other scheme); amber warning at 60 days to expiry, red expired banner after the date; expired suppliers are flagged in the supplier list so orders are not inadvertently placed with non-compliant sources",
        ],
      },
      {
        title: "Financial Records",
        icon: LineChart,
        color: "bg-emerald-50 text-emerald-600 border-emerald-100",
        badge: "module",
        features: [
          "Input cost logging",
          "Crop sales transactions",
          "CSV export",
          "Xero compatible export",
        ],
      },
      {
        title: "Business Reports",
        icon: BarChart3,
        color: "bg-emerald-50 text-emerald-700 border-emerald-100",
        badge: "module",
        features: [
          "Gross margin analysis by crop",
          "Full P&L income statement",
          "Input cost breakdown with category percentages",
          "Grain position — harvested vs moved vs in store",
          "Agri-environment & subsidy income summary",
          "Year-on-year comparison across up to 5 seasons",
          "Asset register with straight-line depreciation",
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
        title: "Advisor & Inspector Access",
        icon: Share2,
        color: "bg-indigo-50 text-indigo-700 border-indigo-100",
        badge: "module",
        features: [
          "Permanent advisor accounts (agronomists, vets, FACTS advisers)",
          "Time-limited inspection sessions for Red Tractor CBs",
          "21-module scope selector — share only what you choose",
          "Full access log with timestamp and accessor name",
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
