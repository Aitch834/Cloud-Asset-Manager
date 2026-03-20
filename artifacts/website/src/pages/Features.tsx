import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { 
  ClipboardCheck, Map, Package, Tractor, FileText, LineChart, 
  CloudRain, PawPrint, Sprout, ShieldAlert, GraduationCap,
  Droplets, AlertTriangle, ClipboardList, Leaf, Truck, Fuel, Share2, BarChart3
} from "lucide-react";

export default function Features() {
  const allModules = [
    {
      title: "Red Tractor Compliance",
      icon: ClipboardCheck,
      color: "bg-blue-50 text-blue-600 border-blue-100",
      features: ["Official template matching", "Automated gap analysis", "Audit history log", "One-click print-ready compliance reports"]
    },
    {
      title: "Field & Crop Management",
      icon: Map,
      color: "bg-brand-pale text-brand-forest border-brand-light/30",
      features: ["GPS boundary mapping", "Crop rotation history", "Harvest audit trail — transport, storage & yield", "Planned vs. actual harvest cross-referencing", "Field operations log — cultivation, tillage, lime & more", "20 operation types with depth, passes & quantity tracking", "Field inspection logging with action flags — Monitor, Treat, Urgent", "Instant SMS alerts for urgent crop actions", "Resolution tracking with audit trail per inspection"]
    },
    {
      title: "Sprays & Inputs",
      icon: Droplets,
      color: "bg-cyan-50 text-cyan-600 border-cyan-100",
      features: ["Spray application records", "Product & batch tracking", "Operator & equipment logging", "Withholding period alerts"]
    },
    {
      title: "Soil Management",
      icon: Sprout,
      color: "bg-lime-50 text-lime-600 border-lime-100",
      features: ["Soil test records", "Nutrient Management Plans", "RB209 compliance", "NVZ Nitrate Vulnerable Zone records"]
    },
    {
      title: "Equipment & Vehicles",
      icon: Tractor,
      color: "bg-orange-50 text-orange-600 border-orange-100",
      features: ["Equipment register", "Maintenance logs", "Sprayer calibration tracking", "Asset onboarding/offboarding"]
    },
    {
      title: "Livestock Management",
      icon: PawPrint,
      color: "bg-rose-50 text-rose-600 border-rose-100",
      features: ["Herd & flock register", "Movement records (eAML2 / ScotEID / EIDCymru)", "Medicine records & withdrawal tracking", "Animal mortality records — cause, disposal & BCMS", "Feed records with supplier & batch traceability", "Annual water quality testing — herd-linked records, lab certificate storage & automated welfare alerts", "Daily welfare checks with condition scoring", "Annual vet health plans (signed, printable)"]
    },
    {
      title: "Biosecurity & Visitors",
      icon: ShieldAlert,
      color: "bg-red-50 text-red-600 border-red-100",
      features: ["Farm Buildings & Areas registry", "Visitor & Contractor logs", "Pest control records", "Cleaning & Disinfection logs", "COSHH assessments"]
    },
    {
      title: "Staff & Training",
      icon: GraduationCap,
      color: "bg-indigo-50 text-indigo-600 border-indigo-100",
      features: ["Certificate tracking", "Expiry alerts (PA1/PA6)", "Role-based permissions", "Farm assignments"]
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
      features: ["Environmental feature mapping", "Agri-environment scheme records", "Stewardship agreement logging", "Habitat & hedgerow records", "Management events log (hedge trimming, pond clearance, mowing & more)", "Scheme obligation tracking per event"]
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
      features: ["Supplier directory", "Delivery receipt logging", "Live inventory tracking", "Batch number trace"]
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
      features: ["Permanent advisor accounts (agronomists, vets, FACTS advisers)", "Time-limited inspection sessions for Red Tractor CBs", "14-module scope selector — share only what you choose", "Full access log with timestamp and accessor name"]
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
