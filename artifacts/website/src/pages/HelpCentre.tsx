import { Layout } from "@/components/layout/Layout";
import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  BarChart3, BookOpen, ChevronDown, FlaskConical, Grape, Landmark,
  Leaf, LifeBuoy, PawPrint, Search, ShieldCheck, Sprout, Tractor,
} from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
}

interface FaqCategory {
  title: string;
  icon: React.ElementType;
  color: string;
  items: FaqItem[];
}

const FAQ: FaqCategory[] = [
  {
    title: "Setup & account",
    icon: BookOpen,
    color: "bg-brand/10 text-brand border-brand/20",
    items: [
      { q: "How do I get started?", a: "Choose the modules that fit your holding, register your interest, then use the setup flow to add your business, holding and team details. Start with the records you need most; you can build from there." },
      { q: "Can one account cover more than one holding?", a: "Yes. Multi-holding working is supported, with records kept against the relevant farm or holding. Check the Pricing page for the current per-holding options." },
      { q: "Can I give my adviser or assessor access?", a: "Advisor and inspector access is available as a platform add-on. Use it to share the records you choose without sharing a general staff login." },
      { q: "Where can I compare modules and prices?", a: "The Features page explains the available areas of the platform, and Pricing lets you build a module mix for your farm." },
    ],
  },
  {
    title: "Mobile & offline",
    icon: Tractor,
    color: "bg-sky-50 text-sky-700 border-sky-100",
    items: [
      { q: "Can I record work from my phone?", a: "The mobile app is designed for practical record keeping on the farm, including selected field, livestock, safety and evidence records." },
      { q: "What happens when there is no signal?", a: "Supported mobile forms are designed to save work offline and sync when a connection returns. Check that a record has synced before relying on it for a deadline or submission." },
      { q: "Can I add photos or documents?", a: "Many record types support evidence attachments, such as photos, delivery paperwork and certificates. Availability can vary by module and record type." },
      { q: "Is offline mode a replacement for checking records?", a: "No. Offline capture helps you work away from coverage; review synced records and any validation messages when you are back online." },
    ],
  },
  {
    title: "Fields, crops & sprays",
    icon: Sprout,
    color: "bg-green-50 text-green-700 border-green-100",
    items: [
      { q: "What can I keep in the field register?", a: "Use fields and blocks as the foundation for crop history, operations, inspections, soil information and harvest records. The exact tools depend on your selected modules." },
      { q: "Can I record spray applications and inputs?", a: "Sprays & Inputs provides structured application and input records, supporting an auditable trail from product and field to operator and rationale." },
      { q: "Does the platform make agronomy decisions for me?", a: "No. It helps you record plans, observations and applications. Product choice, label compliance, conditions and professional agronomy advice remain your responsibility." },
      { q: "Can I manage soil, harvest and storage records?", a: "Yes, relevant modules cover soil management, crop and harvest records, and grain or crop storage. See Features to choose the parts you need." },
    ],
  },
  {
    title: "Livestock & submissions",
    icon: PawPrint,
    color: "bg-amber-50 text-amber-700 border-amber-100",
    items: [
      { q: "Can I keep livestock and medicine records?", a: "Livestock & Feed Management supports herd or flock, movement, medicine, feed and welfare-related records, with additional production modules for selected enterprises." },
      { q: "Does BDE Farm Trac submit movements to government services?", a: "Submission routes and availability depend on species, country, service credentials and the relevant authority. Do not assume a record has been submitted: check its status and retain the official confirmation or reference." },
      { q: "What should I do if a submission route is unavailable?", a: "Use the official service or portal required by the authority, meet its deadline, and record the confirmation reference in your farm records where applicable. The official system remains the source of truth." },
      { q: "Can I use it for cattle, sheep, pigs and other livestock?", a: "The available record types and integrations vary by sector and region. Review the Livestock & Feed Management module and discuss your requirements before relying on a particular workflow." },
    ],
  },
  {
    title: "Organic compliance",
    icon: Leaf,
    color: "bg-emerald-50 text-emerald-700 border-emerald-100",
    items: [
      { q: "Does this replace my organic certification body?", a: "No. BDE Farm Trac is a complementary record system. Your certifier sets the standard, approves your arrangements and remains responsible for certification decisions." },
      { q: "What organic records can I keep?", a: "Depending on your module, you can maintain certification, conversion, inspection, input and supporting records alongside day-to-day farm information." },
      { q: "Can I track restricted inputs or derogations?", a: "Organic modules include places to document inputs, approvals and supporting evidence. Always obtain the necessary written approval from your certifier before use." },
      { q: "Can I prepare for an inspection?", a: "Use your records and attachments to assemble an evidence trail, then confirm your certifier's current requirements directly with them." },
    ],
  },
  {
    title: "Viticulture & winery",
    icon: Grape,
    color: "bg-purple-50 text-purple-700 border-purple-100",
    items: [
      { q: "What does Viticulture cover?", a: "Viticulture brings vineyard blocks, vines, phenology, canopy work, scouting and harvest records together. Winery Management adds production records for the cellar workflow." },
      { q: "Can I record harvest and wine production?", a: "Yes. Relevant viticulture and winery records can capture harvest reception, processing, fermentation, vessels, bottling and testing information." },
      { q: "Does it certify GI, wine or food compliance?", a: "No. The platform supports record keeping and review; it does not award certification or replace legal, laboratory, buyer or authority requirements." },
      { q: "Is organic viticulture available?", a: "Organic Viticulture adds organic vineyard and wine records alongside the standard viticulture tools. Certification remains with your chosen certifying body." },
    ],
  },
  {
    title: "Finance, people & safety",
    icon: ShieldCheck,
    color: "bg-rose-50 text-rose-700 border-rose-100",
    items: [
      { q: "Can I track farm finances and trade records?", a: "Finance & Business includes tools for contacts, financial records and business reporting. It is not a substitute for your accountant's advice or statutory accounts." },
      { q: "What can Staff & Training help with?", a: "Keep staff, training, certificates, competency, PPE, rota and timesheet information in one place, helping managers see what needs attention." },
      { q: "Can I manage safety evidence?", a: "Safety, Risk & Audits supports records such as risk assessments, inspections, incidents, COSHH and equipment-related checks. You remain responsible for suitable assessments and legal duties." },
      { q: "Can contractors be included?", a: "Relevant modules can help document contractor details and safety evidence. Verify insurance, competence and site requirements independently before work begins." },
    ],
  },
  {
    title: "Planning, reporting & integrations",
    icon: BarChart3,
    color: "bg-indigo-50 text-indigo-700 border-indigo-100",
    items: [
      { q: "Can I plan people, machinery and field work?", a: "Resource Planner helps bring tasks and available people or equipment into one view, so you can plan ahead and record what happened." },
      { q: "Can I export or build reports?", a: "Reports and exports are available in relevant modules, with Report Builder for configurable views. Review the output before using it for compliance, financial or operational decisions." },
      { q: "Is there an API?", a: "Data API Access is offered as a read-only integration option for selected data sets. Confirm the current endpoints, permissions and intended use before connecting another system." },
      { q: "How do I find the right combination?", a: "Compare modules on Features, build an estimate on Pricing, or register your interest and tell us what you need to manage." },
    ],
  },
];

function FaqAnswer({ item }: { item: FaqItem }) {
  return (
    <details className="group border-b border-border last:border-b-0">
      <summary className="flex min-w-0 cursor-pointer list-none items-start justify-between gap-4 py-4 text-left text-base font-medium text-foreground transition-colors hover:text-brand-forest focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest focus-visible:ring-offset-2 rounded-sm">
        <span className="min-w-0 break-words">{item.q}</span>
        <ChevronDown aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <p className="pb-4 pr-8 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
    </details>
  );
}

export default function HelpCentre() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const normalizedSearch = search.trim().toLowerCase();
  const filtered = useMemo(() => FAQ
    .filter(category => !activeCategory || category.title === activeCategory)
    .map(category => ({
      ...category,
      items: category.items.filter(item => !normalizedSearch
        || `${item.q} ${item.a}`.toLowerCase().includes(normalizedSearch)),
    }))
    .filter(category => category.items.length > 0), [activeCategory, normalizedSearch]);
  const resultCount = filtered.reduce((count, category) => count + category.items.length, 0);

  return (
    <Layout>
      <section className="relative border-b border-border bg-gradient-to-b from-[#166534]/5 to-transparent">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
            <LifeBuoy className="h-3.5 w-3.5" /> Help Centre
          </div>
          <h1 className="mb-4 text-4xl font-bold text-foreground">Answers for everyday farm records</h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Search practical guidance on setup, compliance records, sectors and the modules that support them.
          </p>
          <label className="relative mx-auto block max-w-xl text-left">
            <span className="sr-only">Search help centre questions</span>
            <Search aria-hidden="true" className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search questions, such as “offline” or “organic”"
              className="h-12 w-full rounded-xl border-2 border-border bg-white pl-11 pr-4 text-base text-foreground outline-none transition-colors focus:border-brand-forest"
            />
          </label>
        </div>
      </section>

      <main className="mx-auto max-w-7xl overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 min-w-0 rounded-2xl border border-border bg-secondary/35 p-5 lg:flex lg:items-center lg:justify-between lg:gap-6">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground sm:text-base">Looking for a module rather than an answer?</p>
            <p className="mt-1 text-sm text-muted-foreground">Explore what is available, tailor the modules, or tell us about your holding.</p>
          </div>
          <div className="mt-4 flex min-w-0 flex-wrap gap-x-5 gap-y-3 lg:mt-0 lg:shrink-0">
            <Link href="/features" className="text-sm font-semibold text-brand-forest underline underline-offset-4">Explore features</Link>
            <Link href="/pricing" className="text-sm font-semibold text-brand-forest underline underline-offset-4">View pricing</Link>
            <Link href="/register-interest" className="text-sm font-semibold text-brand-forest underline underline-offset-4">Register interest</Link>
          </div>
        </div>

        <div className="flex flex-col gap-8 md:flex-row">
          <aside className="md:w-56 md:shrink-0">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Browse topics</p>
            <nav aria-label="Help topics" className="flex gap-2 overflow-x-auto pb-2 md:block md:space-y-1 md:overflow-visible">
              <button type="button" onClick={() => setActiveCategory(null)} aria-pressed={!activeCategory} className={`whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm transition-colors md:block md:w-full ${!activeCategory ? "bg-brand-forest font-medium text-white" : "text-foreground/70 hover:bg-secondary"}`}>All topics</button>
              {FAQ.map(category => {
                const Icon = category.icon;
                const selected = activeCategory === category.title;
                 return <button key={category.title} type="button" onClick={() => setActiveCategory(selected ? null : category.title)} aria-pressed={selected} className={`flex whitespace-nowrap items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors md:w-full ${selected ? "bg-brand-forest font-medium text-white" : "text-foreground/70 hover:bg-secondary"}`}><Icon aria-hidden="true" className="h-4 w-4" />{category.title}</button>;
              })}
            </nav>
          </aside>

          <section aria-live="polite" className="min-w-0 max-w-full flex-1">
            <p className="mb-4 text-sm text-muted-foreground">{normalizedSearch ? `${resultCount} answer${resultCount === 1 ? "" : "s"} found for “${search.trim()}”` : "Choose a topic or open a question below."}</p>
            {filtered.length ? (
              <div className="space-y-6">
                {filtered.map(category => {
                  const Icon = category.icon;
                  return <section key={category.title} aria-labelledby={`category-${category.title}`} className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-2 flex items-center gap-3">
                      <div className={`rounded-lg border p-2 ${category.color}`}><Icon aria-hidden="true" className="h-5 w-5" /></div>
                      <h2 id={`category-${category.title}`} className="text-xl font-bold text-foreground">{category.title}</h2>
                    </div>
                    <div>{category.items.map(item => <FaqAnswer key={item.q} item={item} />)}</div>
                  </section>;
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                <p className="font-semibold text-foreground">No matching answers yet</p>
                <p className="mt-2 text-sm text-muted-foreground">Try a different phrase, browse all topics, or contact us with the details of your farm.</p>
                <button type="button" onClick={() => { setSearch(""); setActiveCategory(null); }} className="mt-4 rounded-lg border border-brand-forest px-4 py-2 text-sm font-semibold text-brand-forest hover:bg-brand-forest hover:text-white">Clear search</button>
              </div>
            )}
          </section>
        </div>
      </main>

      <section className="border-t border-border bg-secondary/30">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 lg:px-8">
          <Landmark className="mx-auto mb-3 h-7 w-7 text-brand-forest" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-foreground">Need to check the fit for your farm?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">We can help you understand the available modules. For regulatory deadlines and official submissions, always follow the instructions from the relevant authority.</p>
          <Link href="/register-interest" className="mt-6 inline-flex rounded-lg bg-brand-forest px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-sage">Register your interest</Link>
        </div>
      </section>
    </Layout>
  );
}