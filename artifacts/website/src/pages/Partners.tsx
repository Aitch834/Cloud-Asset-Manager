import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Handshake, CheckCircle2, ArrowRight, ChevronRight,
  Users, Star, MessageSquare, GraduationCap, HeartPulse,
  Sprout, ClipboardList, Gift, Shield, PoundSterling,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const WHO = [
  {
    icon: GraduationCap,
    title: "Agronomists & Crop Advisors",
    body: "You visit farms regularly, you know exactly what records they struggle to keep, and a recommendation from you carries more weight than any advert. Referring a farm to BDE Farm Trac takes five minutes — we do the rest.",
  },
  {
    icon: HeartPulse,
    title: "Farm Vets & Veterinary Practices",
    body: "Medicine withdrawal periods, vet visit records, and TB testing compliance are the areas where farms most often fall short. Pointing clients to a platform that handles all of these correctly protects both the farm and your practice's professional relationship with it.",
  },
  {
    icon: Sprout,
    title: "AHDB Monitor Farm Advisors & Discussion Group Facilitators",
    body: "If you run peer group sessions or monitor farm programmes, BDE Farm Trac is a natural tool to demonstrate and recommend. We can arrange a group demonstration tailored to your network's primary enterprise mix.",
  },
  {
    icon: ClipboardList,
    title: "Farm Business Consultants & Rural Surveyors",
    body: "Compliance record-keeping is increasingly part of business planning, grant application, and lender due diligence. A farm with a complete, auditable digital record is a stronger business — and a stronger client for your practice.",
  },
  {
    icon: Users,
    title: "Breed Societies & Livestock Associations",
    body: "If you work with member farms, BDE Farm Trac can be offered as a recommended record-keeping tool with a referral arrangement for the association. Contact us to discuss a white-label or affiliate arrangement.",
  },
];

const BENEFITS = [
  {
    icon: Gift,
    title: "Free access to evaluate the platform",
    body: "Every referring partner gets a complimentary full-access account so you can evaluate BDE Farm Trac properly before recommending it. You will see exactly what your clients see — no blind recommendations.",
  },
  {
    icon: PoundSterling,
    title: "Referral recognition",
    body: "We recognise referrals formally. When a farm you have referred subscribes, we will acknowledge this with you directly — the specific arrangement depends on the nature of the partnership. Talk to us.",
  },
  {
    icon: MessageSquare,
    title: "Co-branded one-pagers and demonstration materials",
    body: "We can produce sector-specific one-pagers branded with your practice or organisation's name alongside BDE Farm Trac, so you have something professional to leave behind after a farm visit.",
  },
  {
    icon: Star,
    title: "Priority support for your referred clients",
    body: "Farms referred through a partner account receive priority onboarding support — a personal setup call, module configuration help, and a dedicated contact during the first 30 days.",
  },
  {
    icon: Shield,
    title: "No pressure, no hard sell",
    body: "We do not employ high-pressure sales tactics with farms referred through professional advisors. Your professional relationship with your clients is more important than a subscription — and we operate accordingly.",
  },
];

const HOW = [
  { step: "01", heading: "Get in touch", body: "Email or use the contact form below to introduce yourself and your client base. We will set up a short call to explain the platform, answer your questions, and agree on an approach that works for your practice." },
  { step: "02", heading: "Receive your free access", body: "We will set up a full partner account for you within 48 hours. Explore the platform at your own pace — including the specific modules relevant to the farms you advise." },
  { step: "03", heading: "Introduce BDE Farm Trac to your clients", body: "When the timing is right for a specific client — perhaps after an audit, ahead of a compliance review, or when they raise the question of how to manage their records — refer them to us. We will handle the onboarding." },
  { step: "04", heading: "We look after your referrals", body: "Referred farms receive priority onboarding. We will keep you informed of progress and make sure the client experience reflects well on the recommendation you have made." },
];

const TESTIMONIAL_PLACEHOLDER = {
  quote: "We are actively seeking our first formal referral partners as we approach full platform launch. If you are an agronomist, vet, or farm advisor who would like to evaluate BDE Farm Trac and become one of our founding partner network, we would love to hear from you.",
  attribution: "— BDE Farm Trac, founding partner programme",
};

export default function Partners() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-forest via-brand-sage to-emerald-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-emerald-100 mb-6">
              <Handshake className="w-4 h-4" />
              Referral Partner Programme
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5">
              Help the farms you advise keep better records
            </h1>
            <p className="text-emerald-100 text-lg max-w-2xl mx-auto mb-8">
              If you are an agronomist, vet, consultant, or farm advisor, a recommendation from you is worth more than any advertisement. We have built a partner programme to make referring BDE Farm Trac straightforward, professionally appropriate, and worth your time.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button className="bg-white text-brand-forest hover:bg-emerald-50 rounded-full px-8 h-12 font-semibold" asChild>
                <Link href="/contact">
                  Become a partner <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" className="border-white/40 text-white hover:bg-white/10 bg-transparent rounded-full px-8 h-12" asChild>
                <Link href="/features">See the platform</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Who should partner */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-3">Who is this for?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our referral partner programme is open to any professional who works directly with UK farm businesses and has a trusted relationship with the people managing them.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {WHO.map((w, i) => {
              const WIcon = w.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="flex gap-4 p-5 rounded-xl border border-border bg-white"
                >
                  <div className="w-10 h-10 rounded-lg bg-brand-pale flex items-center justify-center shrink-0">
                    <WIcon className="w-5 h-5 text-brand-forest" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">{w.title}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">{w.body}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-secondary/40 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-3">How it works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We have kept the process simple — no lengthy contracts, no complicated approval process.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {HOW.map((h, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-4 p-6 rounded-xl bg-white border border-border"
              >
                <span className="text-3xl font-black text-brand-forest/20 leading-none">{h.step}</span>
                <div>
                  <p className="font-semibold text-foreground mb-1">{h.heading}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{h.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-3">What partners receive</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We want this to be a genuine partnership — not just a referral link. Here is what we offer to advisors who introduce BDE Farm Trac to their clients.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map((b, i) => {
              const BIcon = b.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="flex flex-col gap-3 p-5 rounded-xl border border-border bg-white"
                >
                  <div className="w-9 h-9 rounded-lg bg-brand-pale flex items-center justify-center">
                    <BIcon className="w-4 h-4 text-brand-forest" />
                  </div>
                  <p className="font-semibold text-foreground text-sm">{b.title}</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">{b.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Founding partner callout */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-8">
            <div className="flex gap-3 mb-4">
              <Star className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-amber-800 font-semibold">Founding partner opportunity</p>
            </div>
            <p className="text-amber-900 leading-relaxed">{TESTIMONIAL_PLACEHOLDER.quote}</p>
            <p className="text-amber-700 text-sm mt-3 font-medium">{TESTIMONIAL_PLACEHOLDER.attribution}</p>
          </div>
        </div>
      </section>

      {/* What you will be recommending — checklist */}
      <section className="bg-secondary/40 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-3">What you will be recommending</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Before recommending any tool to a client, you need to be confident it actually works. These are the core things BDE Farm Trac does well.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              "Red Tractor compliance records — all sectors, all templates",
              "Cattle, sheep, goat, pig, and deer livestock records",
              "Medicine withdrawal period tracking with SMS alerts",
              "Spray records with LERAP and COSHH documentation",
              "NVZ and fertiliser application records",
              "Equipment PUWER compliance and service history",
              "TB test records and read-date tracking",
              "Organic certification record-keeping (Soil Association / OF&G)",
              "GPS field mapping and crop history",
              "Labour and machinery planning (Resource Planner)",
              "Farm Planner drawing from 20+ compliance data sources",
              "Mobile app with offline-first sync for field workers",
              "Direct BCMS and LIS government submissions (in application)",
              "Enterprise performance analytics per livestock or crop module",
            ].map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <CheckCircle2 className="w-4 h-4 text-brand-forest mt-0.5 shrink-0" />
                <p className="text-sm text-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-4">Ready to become a partner?</h2>
          <p className="text-muted-foreground mb-8">
            Get in touch to start the conversation. We will set up your free evaluation account within 48 hours and take it from there.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button className="bg-brand-forest hover:bg-brand-sage text-white rounded-full px-8 h-12" asChild>
              <Link href="/contact">
                Contact us <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
            <Button variant="outline" className="rounded-full px-8 h-12" asChild>
              <Link href="/sectors">Explore by sector</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
