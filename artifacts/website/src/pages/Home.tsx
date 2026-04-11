import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  ClipboardCheck, 
  Map as MapIcon, 
  Package, 
  Tractor, 
  FileText, 
  LineChart,
  ArrowRight,
  ShieldCheck,
  PoundSterling,
  CalendarCheck,
  ToggleRight,
  Lock
} from "lucide-react";

export default function Home() {
  const modules = [
    {
      title: "Red Tractor Compliance",
      desc: "Digital record-keeping matching official templates. Instant gap analysis.",
      icon: ClipboardCheck,
    },
    {
      title: "Field & Crop Management",
      desc: "GPS boundary mapping, harvest tracking, and full crop history.",
      icon: MapIcon,
    },
    {
      title: "Trade Contacts & Stock",
      desc: "Track deliveries, manage suppliers, and monitor live stock levels.",
      icon: Package,
    },
    {
      title: "Equipment Management",
      desc: "Maintenance logs, sprayer calibration, and onboarding workflows.",
      icon: Tractor,
    },
    {
      title: "Document Storage",
      desc: "Link photos and PDFs directly to records. Never lose a delivery note.",
      icon: FileText,
    },
    {
      title: "Sales & Trading",
      desc: "Full sales records for every enterprise — grain, livestock kill sheets, milk statements, direct & farm gate. Sync from mobile, view reports on desktop.",
      icon: LineChart,
    },
  ];

  const smallFarmReasons = [
    {
      icon: PoundSterling,
      title: "From just £40 a month",
      desc: "A fully Red Tractor compliant setup for one farm starts at £40/month — no expensive software licences, no hardware to buy, and no IT department needed.",
    },
    {
      icon: CalendarCheck,
      title: "Month to month, no lock-in",
      desc: "No annual contracts. No minimum term. If BDE Farm Trac isn't right for you, simply cancel — there's no penalty and no complicated exit process.",
    },
    {
      icon: ToggleRight,
      title: "Only pay for what you use",
      desc: "Pick only the modules your farm actually needs. Start with compliance alone and add crop management, livestock, or equipment records when the time is right.",
    },
    {
      icon: Lock,
      title: "No upfront cost — ever",
      desc: "There's nothing to install and nothing to pay upfront. Register your interest, we'll set up your account, and you're ready to go from day one.",
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-earth-cream py-20 lg:py-32">
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-pale text-brand-forest text-sm font-medium mb-6 border border-brand-light/30">
                <ShieldCheck className="w-4 h-4" /> Built for UK farms of every size
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Red Tractor Compliance <span className="text-brand-forest">Made Simple.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
                Whether you're running 40 acres or 4,000, BDE Farm Trac keeps your farm compliant, organised, and audit-ready — with no expensive upfront outlay and a straightforward monthly subscription you control.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-brand-forest hover:bg-brand-sage text-white h-14 px-8 text-base shadow-lg shadow-brand-forest/25" asChild>
                  <Link href="/contact">Register Your Interest</Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-base bg-white border-border text-foreground hover:bg-secondary" asChild>
                  <Link href="/features">View Features</Link>
                </Button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white"
            >
              <img 
                src={`${import.meta.env.BASE_URL}hero-tractor.png`}
                alt="Modern tractor in a green field" 
                className="w-full h-auto object-cover aspect-[4/3]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need in one place</h2>
            <p className="text-muted-foreground text-lg">
              Choose the modules that fit your farm's unique requirements. Pay only for what you need — add more as your farm grows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modules.map((mod, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-secondary/30 rounded-2xl p-8 border border-border hover:border-brand-light/50 hover:shadow-lg transition-all group"
              >
                <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <mod.icon className="w-7 h-7 text-brand-forest" />
                </div>
                <h3 className="text-xl font-bold mb-3">{mod.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{mod.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button variant="ghost" className="text-brand-forest hover:text-brand-sage font-semibold" asChild>
              <Link href="/features" className="flex items-center">
                Explore all modules in detail <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Small Farm Section */}
      <section className="py-24 bg-earth-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-pale text-brand-forest text-sm font-medium mb-6 border border-brand-light/30">
              <ShieldCheck className="w-4 h-4" /> For family farms and smallholdings too
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Farm management software.<br />
              <span className="text-brand-forest">Without the enterprise price tag.</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Technology for farm compliance used to mean expensive consultants, big licence fees, and systems built for 10,000-acre estates. BDE Farm Trac is different — designed from the ground up to be affordable and straightforward for farms of any size.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {smallFarmReasons.map((reason, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-white rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow flex gap-5"
              >
                <div className="w-12 h-12 bg-brand-pale rounded-xl flex items-center justify-center shrink-0">
                  <reason.icon className="w-6 h-6 text-brand-forest" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">{reason.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{reason.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button size="lg" variant="outline" className="h-13 px-8 text-base bg-white border-brand-light text-brand-forest hover:bg-brand-pale/40" asChild>
              <Link href="/pricing" className="flex items-center gap-2">
                See full pricing <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Mobile App Highlight */}
      <section className="py-24 bg-brand-forest text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
               <img 
                src={`${import.meta.env.BASE_URL}farmer-field.png`}
                alt="Farmer using mobile app" 
                className="rounded-2xl shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 max-h-[600px] object-cover w-full"
              />
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white">Capture data directly in the field.</h2>
              <p className="text-brand-pale/80 text-lg leading-relaxed">
                No signal? No problem. Our mobile apps for iOS and Android are built offline-first. Record spray applications, take soil samples, map field boundaries with GPS, and log livestock movements right from the tractor cab.
              </p>
              <ul className="space-y-4 mt-8">
                {[
                  "Offline automatic sync when connection returns",
                  "GPS field boundary mapping by walking the perimeter",
                  "Photo capture linked instantly to records",
                  "Available on Apple App Store and Google Play"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 bg-brand-light/30 rounded-full p-1 shrink-0">
                      <ClipboardCheck className="w-4 h-4 text-brand-pale" />
                    </div>
                    <span className="text-brand-pale">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-earth-cream text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to take the paperwork off your plate?</h2>
          <p className="text-lg text-muted-foreground mb-10">
            Family farms and smallholdings across the UK use BDE Farm Trac to stay Red Tractor compliant without the stress. Start for as little as £40 a month — no contract, no upfront cost.
          </p>
          <Button size="lg" className="bg-earth-brown hover:bg-earth-brown/90 text-white h-14 px-10 text-lg shadow-xl" asChild>
            <Link href="/contact">Register Your Interest Today</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
