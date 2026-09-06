import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { modulePrice } from "@/lib/pricing-data";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Map,
  Milk,
  PawPrint,
  ShieldCheck,
  Sprout,
  Tractor,
  Users,
  Wheat,
} from "lucide-react";

const benefits = [
  {
    icon: ClipboardCheck,
    title: "Keep the whole farm record in view",
    description:
      "Bring documents, recurring checks, farm tasks and supporting evidence into one working system instead of chasing paper, folders and spreadsheets.",
    points: ["Shared planner for dates and follow-ups", "Records linked back to the job, field or animal", "Clear history when you need to review work"],
    color: "bg-brand-pale text-brand-forest border-brand-light/30",
  },
  {
    icon: Map,
    title: "Record work where it happens",
    description:
      "Give office and field teams a practical way to capture activity against fields, assets, crops and livestock, then pick it up again when planning the next job.",
    points: ["Field, crop and grazing activity", "Equipment, workshop and fuel records", "Mobile-friendly workflows for day-to-day entries"],
    color: "bg-sky-50 text-sky-700 border-sky-100",
  },
  {
    icon: CalendarCheck,
    title: "Turn records into next actions",
    description:
      "Use due dates, assignments and reminders to make important work visible to the people who need to do it—not buried in a completed form.",
    points: ["Assign work and follow progress", "Plan around services, withdrawals and inspections", "Review outstanding work across the farm"],
    color: "bg-amber-50 text-amber-700 border-amber-100",
  },
  {
    icon: FileText,
    title: "Be ready to explain the detail",
    description:
      "Keep the context alongside the record: notes, documents, dates and linked activity. Create clear reports for your own review and for conversations with advisers or assessors.",
    points: ["Document and photo attachments", "Structured registers and printable views", "Report and export options in selected modules"],
    color: "bg-violet-50 text-violet-700 border-violet-100",
  },
];

const workflows = [
  {
    icon: Sprout,
    title: "Crop, soil & inputs",
    text: "Build a connected picture from field and crop plans through operations, soil samples, applications, harvest and storage.",
    modules: ["Field & Crop Management", "Sprays & Inputs", "Soil Management", "Grain & Crop Storage"],
  },
  {
    icon: PawPrint,
    title: "Livestock & feed",
    text: "Maintain herd and flock records alongside medicine, feeding, welfare, health and production activity.",
    modules: ["Livestock & Feed Management", "Sheep, Beef, Pig & Poultry Production", "Dairy Management"],
  },
  {
    icon: Tractor,
    title: "Machinery & farm operations",
    text: "See what is owned, serviced, used and due next—from equipment records and workshop jobs to fuel and resource planning.",
    modules: ["Equipment, Workshop & Fuel", "Resource Planner", "Farm Services & Contracting"],
  },
  {
    icon: ShieldCheck,
    title: "People, safety & farm management",
    text: "Coordinate staff records, safety work, visitors, environmental activity, water and business administration in one place.",
    modules: ["Staff & Training", "Safety, Risk & Audits", "Biosecurity & Visitors", "Environment & Sustainability"],
  },
];

const sectors = [
  {
    icon: Wheat,
    title: "Arable farms",
    outcome: "Make seasonal decisions with field history close at hand.",
    copy: "Connect field plans, drilling, inspections, inputs, harvest and grain movements, with soil and weather records available when you need them.",
    module: "field-crop-management",
  },
  {
    icon: Milk,
    title: "Dairy & beef enterprises",
    outcome: "Keep animal, medicine and routine management records together.",
    copy: "Work from livestock and feed records while keeping health events, treatments, welfare activity and production information easier to review.",
    module: "livestock-management",
  },
  {
    icon: PawPrint,
    title: "Sheep, goats, pigs & poultry",
    outcome: "Give daily stock work a more consistent record trail.",
    copy: "Use the livestock foundation with production modules for breeding, health, performance and flock or herd activity that fits your enterprise.",
    module: "sheep-production",
  },
  {
    icon: Sprout,
    title: "Fresh produce & horticulture",
    outcome: "Follow activity from growing area to harvest and despatch.",
    copy: "Bring growing blocks, water checks, crop work, harvest records and packhouse activity into a practical operational view.",
    module: "fresh-produce",
  },
  {
    icon: Users,
    title: "Vineyards & wineries",
    outcome: "Keep vineyard work and wine production connected.",
    copy: "Record blocks, phenology, harvest, cellar activity and stock alongside the wider farm records your team already uses.",
    module: "viticulture",
  },
  {
    icon: BarChart3,
    title: "Mixed & diversified farms",
    outcome: "Choose the tools that match the business you run.",
    copy: "Add modules for farm shops, contracting, accommodation, services and financial records without replacing your core farm workflow.",
    module: "farm-diversification",
  },
];

const moduleHighlights = [
  {
    title: "Core farm management",
    description: "The shared foundation for documents, tasks, planning and farm-wide records.",
    items: [
      { name: "Red Tractor Compliance", id: "red-tractor-compliance", required: true },
      { name: "Staff & Training", id: "staff-training" },
      { name: "Safety, Risk & Audits", id: "safety-risk-audits" },
      { name: "Biosecurity & Visitors", id: "biosecurity" },
    ],
  },
  {
    title: "Land, crops & environment",
    description: "Field-led modules for growing, inputs, resources and environmental work.",
    items: [
      { name: "Field & Crop Management", id: "field-crop-management" },
      { name: "Sprays & Inputs", id: "sprays-inputs" },
      { name: "Soil Management", id: "soil-management" },
      { name: "Environment & Sustainability", id: "environment-sustainability" },
    ],
  },
  {
    title: "Animals, assets & business",
    description: "Build around the enterprises, equipment and commercial activity that matter to you.",
    items: [
      { name: "Livestock & Feed Management", id: "livestock-management" },
      { name: "Equipment, Workshop & Fuel", id: "equipment-workshop" },
      { name: "Finance & Business", id: "finance-business" },
      { name: "Farm Diversification", id: "farm-diversification" },
    ],
  },
];

export default function Features() {
  return (
    <Layout>
      <section className="bg-earth-cream border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold tracking-wider uppercase text-brand-forest mb-4">
              BDE Farm Trac features
            </p>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
              Less time hunting for records. More confidence in the next job.
            </h1>
            <p className="mt-6 text-lg md:text-xl leading-relaxed text-muted-foreground max-w-2xl">
              BDE Farm Trac brings the day-to-day records of a working farm into connected, configurable modules—so teams can plan work, capture what happened and review it with context.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="bg-brand-forest hover:bg-brand-forest/90">
                <Link href="/register-interest">
                  Register your interest <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/pricing">Explore module pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-2xl mb-10">
          <p className="text-sm font-semibold tracking-wider uppercase text-brand-forest">Designed around the work</p>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold">Useful before, during and after the job</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {benefits.map((benefit, index) => (
            <motion.article
              key={benefit.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className="rounded-2xl border border-border bg-white p-6 md:p-8 shadow-sm"
            >
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${benefit.color}`}>
                <benefit.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-xl font-bold">{benefit.title}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">{benefit.description}</p>
              <ul className="mt-5 space-y-2.5">
                {benefit.points.map((point) => (
                  <li key={point} className="flex gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-brand-light" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="bg-brand-pale/60 border-y border-brand-light/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold tracking-wider uppercase text-brand-forest">Connected workflows</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold">Choose modules that work around your farm</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Start with the areas that create the most admin for your team, then add capability as the operation changes.
            </p>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 gap-5">
            {workflows.map((workflow) => (
              <article key={workflow.title} className="rounded-2xl bg-white border border-brand-light/20 p-6">
                <workflow.icon className="h-6 w-6 text-brand-forest" aria-hidden="true" />
                <h3 className="mt-4 text-xl font-bold">{workflow.title}</h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">{workflow.text}</p>
                <p className="mt-4 text-sm font-medium text-brand-forest">{workflow.modules.join(" · ")}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold tracking-wider uppercase text-brand-forest">Built for different enterprises</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold">A system that reflects how your farm operates</h2>
          </div>
          <Link href="/pricing" className="inline-flex items-center font-semibold text-brand-forest hover:underline">
            View all modules and pricing <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectors.map((sector) => (
            <article key={sector.title} className="rounded-2xl border border-border p-6 bg-white">
              <sector.icon className="h-7 w-7 text-brand-forest" aria-hidden="true" />
              <h3 className="mt-4 text-xl font-bold">{sector.title}</h3>
              <p className="mt-2 font-medium text-brand-forest">{sector.outcome}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{sector.copy}</p>
              <p className="mt-5 text-sm text-muted-foreground">
                From <span className="font-semibold text-foreground">£{modulePrice(sector.module)}/month</span> for the relevant module
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-earth-cream border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-2xl mb-10">
            <p className="text-sm font-semibold tracking-wider uppercase text-brand-forest">Flexible by design</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold">Start with what you need now</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Select modules for the work you manage today. Review the full selection, inclusions and current terms on the pricing page.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {moduleHighlights.map((group) => (
              <article key={group.title} className="bg-white border border-border rounded-2xl p-6">
                <h3 className="text-xl font-bold">{group.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{group.description}</p>
                <ul className="mt-5 divide-y divide-border">
                  {group.items.map((item) => (
                    <li key={item.id} className="py-3 flex items-start justify-between gap-3 text-sm">
                      <span className="font-medium">{item.name}</span>
                      <span className="shrink-0 text-muted-foreground">
                        {item.required ? "Required" : `£${modulePrice(item.id)}/mo`}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <div className="mt-8">
            <Button asChild variant="outline">
              <Link href="/pricing">See all modules and prices <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
        <h2 className="text-3xl md:text-4xl font-bold">Want to see how it could fit your farm?</h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore the pricing options, register your interest, or visit the Help Centre for practical product guidance.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <Button asChild size="lg" className="bg-brand-forest hover:bg-brand-forest/90">
            <Link href="/register-interest">Register your interest <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/help">Visit the Help Centre</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}