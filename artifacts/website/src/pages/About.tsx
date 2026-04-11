import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Hourglass } from "lucide-react";

const ACCREDITATIONS = [
  {
    group: "Government API Integrations",
    groupDesc: "Direct data submission to official government livestock systems — no manual re-keying.",
    items: [
      {
        acronym: "BCMS",
        name: "British Cattle Movement Service",
        body: "APHA / Defra",
        purpose: "One-click cattle movement submissions, births, deaths, and herd management directly to BCMS via CTS Web Services.",
        status: "Application in Progress",
        statusColor: "amber",
      },
      {
        acronym: "LIS",
        name: "Livestock Information Service",
        body: "Livestock Information Ltd / Defra",
        purpose: "One-click sheep, goat, and deer movement reporting and holding registration for England via the LIS API.",
        status: "Application in Progress",
        statusColor: "amber",
      },
    ],
  },
  {
    group: "Industry Scheme Recognition",
    groupDesc: "Alignment with major UK agricultural assurance and certification schemes.",
    items: [
      {
        acronym: "RT",
        name: "Red Tractor Assured",
        body: "Red Tractor Assured Ltd",
        purpose: "Formal recognition as a digital record-keeping platform aligned with Red Tractor scheme requirements across all farm sectors.",
        status: "Application in Progress",
        statusColor: "amber",
      },
      {
        acronym: "SA / OF&G",
        name: "Organic Certification Bodies",
        body: "Soil Association & OF&G",
        purpose: "Complementary record-keeping alongside Soil Association and OF&G portals for organic certification, field status, and restricted inputs.",
        status: "Planned",
        statusColor: "blue",
      },
    ],
  },
  {
    group: "Regulatory & Security",
    groupDesc: "Data protection registration and cyber security certification to protect your farm data.",
    items: [
      {
        acronym: "ICO",
        name: "Information Commissioner's Office",
        body: "ICO — UK Government",
        purpose: "Data Controller registration under UK GDPR for the lawful processing of farmer and farm business data.",
        status: "Registration in Progress",
        statusColor: "amber",
      },
      {
        acronym: "CE+",
        name: "Cyber Essentials Plus",
        body: "NCSC / IASME",
        purpose: "UK Government-backed cyber security certification, verifying that BDE Farm Trac infrastructure meets defined security controls.",
        status: "Planned",
        statusColor: "blue",
      },
    ],
  },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: typeof Clock }> = {
  amber: { bg: "bg-amber-100", text: "text-amber-700", icon: Hourglass },
  blue:  { bg: "bg-blue-100",  text: "text-blue-700",  icon: Clock },
  green: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle2 },
};

export default function About() {
  return (
    <Layout>
      {/* Main About Section */}
      <div className="bg-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Born from British Agriculture.</h1>
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
                  BDE Farm Trac was created with a simple mission: to significantly reduce the administrative burden placed on UK farmers by compliance schemes.
                </p>
                <p>
                  We know that Red Tractor compliance is essential for market access, but the paperwork shouldn't keep you out of the field. Traditional spreadsheets and paper binders are prone to errors, easy to lose, and stressful during inspection time.
                </p>
                <p>
                  Our team combines deep agricultural knowledge with modern software engineering to build tools that farmers actually want to use. We focus on modularity, offline reliability, and absolute simplicity.
                </p>
              </div>

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "UK Based Team & Support",
                  "Secure Cloud Infrastructure",
                  "Built for Offline Use",
                  "Constantly Updated for Red Tractor"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-brand-forest" />
                    <span className="font-medium text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <img 
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1000&h=1200&fit=crop" 
                alt="UK Farm Estate" 
                className="rounded-3xl shadow-2xl object-cover w-full h-[600px]"
              />
              <div className="absolute -bottom-8 -left-8 bg-brand-forest text-white p-8 rounded-2xl shadow-xl max-w-xs hidden md:block">
                <h3 className="font-bold text-xl mb-2">Our Promise</h3>
                <p className="text-brand-pale/90 text-sm">We will never lock you into modules you don't need, and your data remains 100% yours.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Accreditations Section */}
      <div className="bg-earth-cream py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-6">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Official Integrations &amp; Accreditations</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              BDE Farm Trac is actively pursuing formal approval and integration status with the following official bodies. Where displayed on the platform, the official approved badge will replace this placeholder once accreditation is granted.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-16 border border-amber-200/60 mx-auto flex justify-center w-fit">
            <Hourglass className="w-3.5 h-3.5" /> Applications in progress — badges will be updated upon approval
          </div>

          <div className="space-y-16">
            {ACCREDITATIONS.map((group, gi) => (
              <motion.div
                key={gi}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: gi * 0.1, duration: 0.5 }}
              >
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-foreground mb-1">{group.group}</h3>
                  <p className="text-muted-foreground text-sm">{group.groupDesc}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {group.items.map((item, ii) => {
                    const style = STATUS_STYLES[item.statusColor];
                    const StatusIcon = style.icon;
                    return (
                      <div
                        key={ii}
                        className="bg-white rounded-2xl border border-border shadow-sm p-6 flex gap-5"
                      >
                        {/* Placeholder logo / acronym block */}
                        <div className="w-16 h-16 rounded-xl border-2 border-dashed border-border bg-secondary/40 flex items-center justify-center shrink-0 text-center">
                          <span className="text-xs font-bold text-muted-foreground leading-tight px-1">{item.acronym}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                            <div>
                              <p className="font-bold text-foreground leading-tight">{item.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{item.body}</p>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text} shrink-0`}>
                              <StatusIcon className="w-3 h-3" />
                              {item.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed mt-2">{item.purpose}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-16 max-w-2xl mx-auto">
            Official logo badges, approval numbers, and scheme marks will be displayed here and within the platform once formal accreditation or approval has been granted by the respective body. Nothing on this page constitutes a claim of current approval.
          </p>
        </div>
      </div>
    </Layout>
  );
}
