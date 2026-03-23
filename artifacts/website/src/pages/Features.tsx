import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { 
  ClipboardCheck, Map, Package, Tractor, FileText, LineChart, 
  CloudRain, PawPrint, Sprout, ShieldAlert, GraduationCap,
  Droplets, AlertTriangle, ClipboardList, Leaf, Truck, Fuel, Share2, BarChart3, Wrench,
  Ham, Bird, Flower2, Flame, Store, Waves
} from "lucide-react";

export default function Features() {
  const allModules = [
    {
      title: "Red Tractor Compliance",
      icon: ClipboardCheck,
      color: "bg-blue-50 text-blue-600 border-blue-100",
      features: ["Official template matching", "Automated gap analysis", "Audit history log", "One-click print-ready compliance reports", "Week Ahead planner — 7-day view of all scheduled tasks, due dates & overdue items across every active module"]
    },
    {
      title: "Field & Crop Management",
      icon: Map,
      color: "bg-brand-pale text-brand-forest border-brand-light/30",
      features: ["GPS boundary mapping", "Crop rotation history", "Seed drilling records — crop variety, seed lot, rate & treatment", "Harvest audit trail — transport, storage & yield", "Planned vs. actual harvest cross-referencing", "Field operations log — cultivation, tillage, lime & more", "20 operation types with depth, passes & quantity tracking", "Field inspection logging with action flags — Monitor, Treat, Urgent", "Instant SMS alerts for urgent crop actions", "Resolution tracking with audit trail per inspection"]
    },
    {
      title: "Sprays & Inputs",
      icon: Droplets,
      color: "bg-cyan-50 text-cyan-600 border-cyan-100",
      features: ["Spray application records", "Product & batch tracking with lot number capture", "Operator & equipment logging", "Withholding period alerts", "GRN-linked batch traceability — select a specific goods received delivery when logging an application to automatically populate batch and lot numbers, creating a full chain of custody from supplier batch to treated field"]
    },
    {
      title: "Soil Management",
      icon: Sprout,
      color: "bg-lime-50 text-lime-600 border-lime-100",
      features: ["Soil test records linked to accredited testing laboratories — lab selected from picker, UKAS number stored with every sample", "Nutrient Management Plans", "RB209 compliance", "NVZ Nitrate Vulnerable Zone records"]
    },
    {
      title: "Equipment & Vehicles",
      icon: Tractor,
      color: "bg-orange-50 text-orange-600 border-orange-100",
      features: ["Equipment register", "Maintenance logs", "Sprayer calibration tracking", "Asset onboarding/offboarding", "Grain Storage Quality — bin register with capacity and type, grain quality test records (moisture, protein, specific weight, Hagberg falling number), and temperature log with automatic alerts for rising or out-of-spec readings"]
    },
    {
      title: "Workshop & Asset Management",
      icon: Wrench,
      color: "bg-teal-50 text-teal-700 border-teal-100",
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
      ]
    },
    {
      title: "Livestock Management",
      icon: PawPrint,
      color: "bg-rose-50 text-rose-600 border-rose-100",
      features: ["Herd & flock register", "Movement records (eAML2 / ScotEID / EIDCymru)", "Medicine records & withdrawal tracking", "Animal mortality records — cause, disposal & BCMS", "Feed records with supplier & batch traceability", "Annual water quality testing — herd-linked records, lab certificate storage & automated welfare alerts", "Daily welfare checks with condition scoring", "Annual vet health plans (signed, printable)", "AI & Reproduction records — service date, sire/bull ID, breed, method, and confirmation of pregnancy", "Veterinary prescriptions — log vet-written prescriptions with drug, dose, withdrawal period, and dispensing vet details for full medicine audit trail"]
    },
    {
      title: "Biosecurity & Visitors",
      icon: ShieldAlert,
      color: "bg-red-50 text-red-600 border-red-100",
      features: ["Farm Buildings & Areas registry", "GPS map pins — place each building on the Farm Map for visual location tracking", "Farm Map — interactive satellite view of all registered buildings and areas with colour-coded type markers", "Mobile location registration — add new buildings on site with one-tap GPS capture, saves live to the dashboard", "Visitor & Contractor logs", "Pest control records", "Cleaning & Disinfection logs", "COSHH assessments"]
    },
    {
      title: "Staff & Training",
      icon: GraduationCap,
      color: "bg-indigo-50 text-indigo-600 border-indigo-100",
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
        "Print Register — generates a formatted A4 document with training and certificate tables plus sign-off blocks, suitable for presenting to a Red Tractor inspector"
      ]
    },
    {
      title: "Risk & Waste Management",
      icon: AlertTriangle,
      color: "bg-amber-50 text-amber-600 border-amber-100",
      features: ["Risk assessment records", "COSHH data sheets", "Waste disposal logs", "Corrective action tracking"]
    },
    {
      title: "Inspections & Audits",
      icon: ClipboardList,
      color: "bg-violet-50 text-violet-600 border-violet-100",
      features: ["Inspection records", "Non-conformance logging", "Corrective actions", "Print-ready audit summaries"]
    },
    {
      title: "Environmental Management",
      icon: Leaf,
      color: "bg-green-50 text-green-600 border-green-100",
      features: ["Environmental feature mapping", "Agri-environment scheme records", "Stewardship agreement logging", "Habitat & hedgerow records", "Management events log (hedge trimming, pond clearance, mowing & more)", "Scheme obligation tracking per event", "SFI / ELMs Actions — log Sustainable Farming Incentive and Environmental Land Management agreements with action codes, payment rates, area, and annual review tracking", "Slurry & Manure Management — store capacity and type records, spreading event logs with application rate, field, date and contractor, and NVZ closed-period compliance notes"]
    },
    {
      title: "Transport & Haulage",
      icon: Truck,
      color: "bg-stone-50 text-stone-600 border-stone-200",
      features: ["Haulage movement records", "Load & tonnage tracking", "Haulier directory", "Delivery confirmation logs"]
    },
    {
      title: "Stock & Suppliers",
      icon: Package,
      color: "bg-earth-cream text-earth-brown border-earth-tan/30",
      features: [
        "Supplier directory",
        "Purchase Orders (PO) — raise formal orders against registered suppliers with auto-generated PO-YYYY-0001 reference numbers, multi-line order tables (product, quantity, unit price), and Draft → Sent → Received status tracking",
        "Goods Received Notes (GRN) — auto-generated GRN-YYYY-0001 references on every delivery; link each GRN to an open PO to automatically update received quantities and advance PO status to Partially Received or Fully Received",
        "3-way matching — Purchase Order → GRN → Supplier Invoice for a complete procurement audit trail",
        "Batch & lot number capture on every delivery — batch codes and lot numbers recorded at the point of receipt and carried forward to spray application records",
        "Live inventory tracking",
        "Testing laboratory register — add UKAS-accredited labs as a supplier subtype; labs are linked by picker when recording soil samples, grain quality tests, and water quality tests so every analytical result traces to the accredited laboratory that produced it"
      ]
    },
    {
      title: "Financial Records",
      icon: LineChart,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
      features: ["Input cost logging", "Crop sales transactions", "CSV export", "Xero compatible export"]
    },
    {
      title: "Document Management",
      icon: FileText,
      color: "bg-gray-100 text-gray-700 border-gray-200",
      features: ["PDF & photo storage", "Record attachment", "Thumbnail previews", "Cloud backup"]
    },
    {
      title: "Weather Tracking",
      icon: CloudRain,
      color: "bg-sky-50 text-sky-600 border-sky-100",
      features: ["Farm-base station input", "Vehicle-mounted integration", "Spray-record auto-link", "Historical charting"]
    },
    {
      title: "Biofuel / RTFO Compliance",
      icon: Fuel,
      color: "bg-yellow-50 text-yellow-700 border-yellow-100",
      features: ["RTFO sustainability declarations", "Field eligibility tracking", "GHG traceability records", "Audit pack PDF generation"]
    },
    {
      title: "Business Reports",
      icon: BarChart3,
      color: "bg-emerald-50 text-emerald-700 border-emerald-100",
      features: ["Gross margin analysis by crop", "Full P&L income statement", "Input cost breakdown with category percentages", "Grain position — harvested vs moved vs in store", "Agri-environment & subsidy income summary", "Year-on-year comparison across up to 5 seasons", "Asset register with straight-line depreciation"]
    },
    {
      title: "Advisor & Inspector Access",
      icon: Share2,
      color: "bg-indigo-50 text-indigo-700 border-indigo-100",
      features: ["Permanent advisor accounts (agronomists, vets, FACTS advisers)", "Time-limited inspection sessions for Red Tractor CBs", "21-module scope selector — share only what you choose", "Full access log with timestamp and accessor name"]
    },
    {
      title: "Pig Production",
      icon: Ham,
      color: "bg-pink-50 text-pink-700 border-pink-100",
      features: ["Pig herd register with breed, age and production system", "Farrowing & weaning records — litter size, piglet weights and survival", "Health & medicine records with withdrawal tracking", "Movements — Eartag Scotland / APHA compliant", "Feed consumption & FCR records per house", "Mortality records — cause, disposal and APHA reporting", "Veterinary health plan integration", "Red Tractor Pigs scheme readiness checklist"]
    },
    {
      title: "Poultry Production",
      icon: Bird,
      color: "bg-amber-50 text-amber-700 border-amber-100",
      features: ["Flock register — broiler, layer, turkey, duck and speciality species", "Placement & depletion records with hatchery traceability", "Daily mortality log — cumulative count & cause analysis", "Feed & water consumption per flock / house", "Egg production records — lay rate, grading and packing", "Medicine & vaccine records with batch numbers", "Biosecurity checklist with down-time between placements", "Red Tractor Poultry & Lion Quality scheme records"]
    },
    {
      title: "Horticulture & Fresh Produce",
      icon: Flower2,
      color: "bg-green-50 text-green-700 border-green-100",
      features: ["Crop & variety register with field / block assignment", "Planting, transplanting & harvesting records", "Spray & irrigation records — operator, product and dose", "Harvest grade & quality records — packed weights and rejection rates", "Cold store temperature logs", "Allergen & traceability chain records", "Red Tractor Fresh Produce, LEAF and GlobalG.A.P. readiness", "Assured Produce / BRCGS-ready audit evidence trail"]
    },
    {
      title: "Carbon & Sustainability",
      icon: Flame,
      color: "bg-emerald-50 text-emerald-700 border-emerald-100",
      features: ["Farm carbon footprint calculator — Agrecalc / Cool Farm compatible inputs", "Emissions by category: enteric fermentation, manure, fuel, fertiliser, imported feed", "Year-on-year baseline comparison and trend charts", "Sustainability action plan — log actions, estimate savings, track progress", "Renewable energy production logging — solar, wind and AD", "Biodiversity net gain tracking — habitat creation and baseline scoring", "Supply chain sustainability declarations for retailer assurance schemes"]
    },
    {
      title: "Farm Diversification",
      icon: Store,
      color: "bg-violet-50 text-violet-700 border-violet-100",
      features: ["Diversification enterprise register — glamping, tourism, B&B, farm shop, events", "Planning permission and consent tracking", "Booking & occupancy records for accommodation and events", "Income records by enterprise with monthly summaries", "Public liability and insurance document storage", "Food hygiene ratings and inspections log", "Visitor management — check-in / check-out and visitor waivers", "Business rates and tax liability notes"]
    },
    {
      title: "Water & Irrigation Management",
      icon: Waves,
      color: "bg-sky-50 text-sky-700 border-sky-100",
      features: ["Water source register — bore holes, rivers, reservoirs and mains", "Abstraction licence tracking with annual allocation and usage", "Daily / weekly meter readings and volumetric usage logs", "Irrigation event records — field, crop, volume and method", "Soil moisture monitoring integration", "Pump maintenance records — service dates and calibration", "EA compliance check — CAMS reporting and licence conditions", "Drought management planning and restriction alerts"]
    },
  ];

  return (
    <Layout>
      <div className="bg-earth-cream py-16 md:py-24 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Platform Modules</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            BDE Farm Trac is built modularly. Whether you run a simple arable operation or a complex mixed farm, you only pay for the tools you need.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allModules.map((mod, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: (i % 3) * 0.1, duration: 0.5 }}
              className="bg-white rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 border ${mod.color}`}>
                <mod.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-foreground">{mod.title}</h3>
              <ul className="space-y-3">
                {mod.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-light mt-1.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
