import { useEffect, useState, useCallback } from "react";
import { api, type AlertSubscriptionsState } from "@/lib/api";
import { getSecret } from "@/lib/auth";
import { CheckSquare, Square, ExternalLink, Star, AlertCircle, CheckCircle2, Clock, Shield } from "lucide-react";

// ─── Subscription catalogue ──────────────────────────────────────────────────

interface SubItem {
  id: string;
  name: string;
  url: string;
  priority: boolean;
  /** How BDE actually signs up — shown as a sub-note under the service name */
  signupNote: string;
}
interface Sector { id: string; label: string; diseases: string; headerBg: string; items: SubItem[]; }

// Sign-up URLs verified August 2026
const GOVDELIVERY_APHA = "https://public.govdelivery.com/accounts/UKAPHA/subscriber/topics?qsp=CODE_RED";
const AHDB_PREF        = "https://preferencecentre.ahdb.org.uk/";
const PLANT_PORTAL     = "https://planthealthportal.defra.gov.uk/pests-and-diseases/pest-and-disease-alerts";

const SECTORS: Sector[] = [
  {
    id: "poultry",
    label: "Poultry — HPAI / Avian Influenza",
    diseases: "H5N1 / H5N8 avian influenza, housing orders, protection zones",
    headerBg: "bg-red-600",
    items: [
      {
        id: "hpai-apha",
        name: "APHA Notifiable Disease Alerts (GovDelivery)",
        url: GOVDELIVERY_APHA,
        priority: true,
        signupNote: "Enter email on the GovDelivery page → select 'Notifiable Disease Alerts' topics. Also supports SMS.",
      },
      {
        id: "hpai-bpc",
        name: "British Poultry Council — News",
        url: "https://britishpoultry.org.uk/news-publications/",
        priority: false,
        signupNote: "No public mailing list. Bookmark the news page and check periodically.",
      },
    ],
  },
  {
    id: "arable",
    label: "Arable — Crop Health",
    diseases: "BYDV, phytosanitary pests, crop disease outbreaks",
    headerBg: "bg-amber-600",
    items: [
      {
        id: "arable-apha",
        name: "APHA Plant Health Alerts (GovDelivery)",
        url: GOVDELIVERY_APHA,
        priority: true,
        signupNote: "Same GovDelivery page — select plant health topics (Phytosanitary, Xylella, etc.) alongside any animal topics.",
      },
      {
        id: "arable-ahdb-crop",
        name: "AHDB Cereals & Oilseeds — Arable Focus newsletter",
        url: AHDB_PREF,
        priority: true,
        signupNote: "Create a free AHDB Preference Centre account → tick Cereals & Oilseeds / Arable Focus updates.",
      },
      {
        id: "arable-ahdb-pest",
        name: "AHDB Pest Bulletin",
        url: AHDB_PREF,
        priority: false,
        signupNote: "Via AHDB Preference Centre (same account) — tick the Pest Bulletin preference.",
      },
      {
        id: "arable-basis",
        name: "BASIS Registration — News",
        url: "https://basis-reg.co.uk/news",
        priority: false,
        signupNote: "Industry news for BASIS-qualified advisers. No public subscription; monitor via website.",
      },
    ],
  },
  {
    id: "horticulture",
    label: "Horticulture — Plant Health",
    diseases: "Xylella, Phytophthora, Asian hornet, quarantine pests",
    headerBg: "bg-green-600",
    items: [
      {
        id: "horti-apha",
        name: "APHA Plant Health Alerts (GovDelivery)",
        url: GOVDELIVERY_APHA,
        priority: true,
        signupNote: "Select plant health topics on the GovDelivery sign-up page.",
      },
      {
        id: "horti-portal",
        name: "UK Plant Health Information Portal — Pest & Disease Alerts",
        url: PLANT_PORTAL,
        priority: false,
        signupNote: "View current statutory pest alerts; individual alert pages link to GovDelivery sign-up.",
      },
      {
        id: "horti-adas",
        name: "ADAS Technical Advisories",
        url: "https://www.adas.co.uk/news",
        priority: false,
        signupNote: "News and technical updates on the ADAS website; no public email list.",
      },
    ],
  },
  {
    id: "viticulture",
    label: "Viticulture — Vine Disease",
    diseases: "Xylella fastidiosa, Flavescence dorée, vine moth statutory notices",
    headerBg: "bg-purple-600",
    items: [
      {
        id: "viti-winegb",
        name: "WineGB Trade Newsletter",
        url: "https://mms.winegb.co.uk/newsletter/signup",
        priority: true,
        signupNote: "Fill in name, email and organisation on the sign-up page. Monthly trade newsletter.",
      },
      {
        id: "viti-apha",
        name: "APHA Plant Health Alerts (GovDelivery)",
        url: GOVDELIVERY_APHA,
        priority: true,
        signupNote: "Select Xylella / Flavescence dorée topics on GovDelivery sign-up page.",
      },
      {
        id: "viti-portal",
        name: "UK Plant Health Information Portal — Pest & Disease Alerts",
        url: PLANT_PORTAL,
        priority: false,
        signupNote: "Statutory alerts for vine pests; individual alert pages link to GovDelivery sign-up.",
      },
    ],
  },
  {
    id: "beef",
    label: "Beef & Cattle",
    diseases: "FMD, BVD, Schmallenberg, TB movement restrictions",
    headerBg: "bg-orange-600",
    items: [
      {
        id: "beef-apha",
        name: "APHA Notifiable Disease Alerts (GovDelivery)",
        url: GOVDELIVERY_APHA,
        priority: true,
        signupNote: "Enter email on GovDelivery → select notifiable animal disease topics.",
      },
      {
        id: "beef-ahdb",
        name: "AHDB Beef & Lamb — Market Intelligence & Alerts",
        url: AHDB_PREF,
        priority: true,
        signupNote: "Create a free AHDB Preference Centre account → select Beef & Lamb sector updates.",
      },
      {
        id: "beef-nfu",
        name: "NFU Cattle — Breaking News Alerts",
        url: "https://www.nfuonline.com/news/make-sure-youre-signed-up-to-all-nfu-breaking-news-channels/",
        priority: false,
        signupNote: "NFU alerts are primarily for NFU members. Non-members can follow news at nfuonline.com.",
      },
    ],
  },
  {
    id: "dairy",
    label: "Dairy",
    diseases: "FMD, BVD, Johne's disease, TB movement restrictions",
    headerBg: "bg-blue-600",
    items: [
      {
        id: "dairy-apha",
        name: "APHA Notifiable Disease Alerts (GovDelivery)",
        url: GOVDELIVERY_APHA,
        priority: true,
        signupNote: "Enter email on GovDelivery → select notifiable animal disease topics.",
      },
      {
        id: "dairy-ahdb",
        name: "AHDB Dairy — Market Intelligence & Alerts",
        url: AHDB_PREF,
        priority: true,
        signupNote: "Create a free AHDB Preference Centre account → select Dairy sector updates.",
      },
      {
        id: "dairy-nfu",
        name: "NFU Dairy — Breaking News Alerts",
        url: "https://www.nfuonline.com/news/make-sure-youre-signed-up-to-all-nfu-breaking-news-channels/",
        priority: false,
        signupNote: "NFU alerts are primarily for NFU members. Non-members can follow news at nfuonline.com.",
      },
    ],
  },
  {
    id: "pig",
    label: "Pigs",
    diseases: "African Swine Fever (ASF), PRRS, swine influenza",
    headerBg: "bg-pink-600",
    items: [
      {
        id: "pig-apha",
        name: "APHA Notifiable Disease Alerts (GovDelivery)",
        url: GOVDELIVERY_APHA,
        priority: true,
        signupNote: "Enter email on GovDelivery → select notifiable animal disease topics including ASF.",
      },
      {
        id: "pig-ahdb",
        name: "AHDB Pork — Market Intelligence & Alerts",
        url: AHDB_PREF,
        priority: true,
        signupNote: "Create a free AHDB Preference Centre account → select Pork sector updates.",
      },
      {
        id: "pig-npa",
        name: "National Pig Association — Media Mailing List",
        url: "https://nationalpigassociation.co.uk/media/media-mailing-list-signup/",
        priority: false,
        signupNote: "NPA press/media release mailing list — sign up directly on their website.",
      },
    ],
  },
  {
    id: "sheep",
    label: "Sheep",
    diseases: "Blue Tongue, FMD, Schmallenberg, Scrapie restriction zones",
    headerBg: "bg-lime-600",
    items: [
      {
        id: "sheep-apha",
        name: "APHA Notifiable Disease Alerts (GovDelivery)",
        url: GOVDELIVERY_APHA,
        priority: true,
        signupNote: "Enter email on GovDelivery → select notifiable animal disease topics.",
      },
      {
        id: "sheep-ahdb",
        name: "AHDB Beef & Lamb (Sheep) — Market Intelligence & Alerts",
        url: AHDB_PREF,
        priority: true,
        signupNote: "Create a free AHDB Preference Centre account → select Beef & Lamb / Sheep updates.",
      },
      {
        id: "sheep-nsa",
        name: "National Sheep Association — News",
        url: "https://nationalsheep.org.uk/our-work/news/",
        priority: false,
        signupNote: "NSA alerts are primarily for NSA members. Monitor their news page or contact NSA directly.",
      },
    ],
  },
  {
    id: "goat",
    label: "Goats",
    diseases: "Blue Tongue, FMD, Schmallenberg",
    headerBg: "bg-teal-600",
    items: [
      {
        id: "goat-apha",
        name: "APHA Notifiable Disease Alerts (GovDelivery)",
        url: GOVDELIVERY_APHA,
        priority: true,
        signupNote: "Enter email on GovDelivery → select notifiable animal disease topics.",
      },
      {
        id: "goat-bgs",
        name: "British Goat Society (BGS)",
        url: "https://www.britishgoatsociety.com",
        priority: false,
        signupNote: "BGS health alerts distributed to members. Contact BGS to enquire about advisory mailing list.",
      },
      {
        id: "goat-gvs",
        name: "Goat Veterinary Society (GVS)",
        url: "https://www.goatvetsoc.co.uk",
        priority: false,
        signupNote: "GVS is a professional vet organisation. Monitor their news page for disease guidance.",
      },
    ],
  },
];

const ALL_ITEMS   = SECTORS.flatMap(s => s.items);
const PRIO_ITEMS  = ALL_ITEMS.filter(i => i.priority);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayIso() { return new Date().toISOString().slice(0, 10); }

function fmtDate(iso: string) {
  if (!iso) return "";
  try { return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return iso; }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AlertSubscriptions() {
  const secret = getSecret()!;
  const [subs,    setSubs]    = useState<AlertSubscriptionsState>({});
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [saving,  setSaving]  = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    api.getAlertSubscriptions(secret)
      .then(d => setSubs(d.subscriptions))
      .catch(e => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [secret]);

  const persist = useCallback(async (next: AlertSubscriptionsState) => {
    setSaving(true);
    try {
      await api.putAlertSubscriptions(next, secret);
      setSavedAt(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    } catch { /* retain local state */ } finally { setSaving(false); }
  }, [secret]);

  function toggleEnrolled(id: string) {
    setSubs(prev => {
      const enrolled = !(prev[id]?.enrolled ?? false);
      const date = enrolled ? (prev[id]?.date || todayIso()) : (prev[id]?.date ?? "");
      const next = { ...prev, [id]: { enrolled, date } };
      void persist(next);
      return next;
    });
  }

  function commitDate(id: string, date: string) {
    setSubs(prev => {
      const next = { ...prev, [id]: { enrolled: prev[id]?.enrolled ?? false, date } };
      void persist(next);
      return next;
    });
  }

  const totalEnrolled  = ALL_ITEMS.filter(i => subs[i.id]?.enrolled).length;
  const prioEnrolled   = PRIO_ITEMS.filter(i => subs[i.id]?.enrolled).length;
  const sectorsActive  = SECTORS.filter(s => s.items.some(i => subs[i.id]?.enrolled)).length;

  return (
    <div className="p-8 max-w-4xl">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-2 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Alert Subscription Enrolment</h1>
            <p className="text-sm text-muted-foreground">
              Secure record of which email alert services BDE is enrolled in across all agricultural sectors.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0 mt-1">
          {saving ? (
            <><div className="w-3 h-3 border border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />Saving…</>
          ) : savedAt ? (
            <><CheckCircle2 className="w-3 h-3 text-green-600" />Saved {savedAt}</>
          ) : null}
        </div>
      </div>

      {/* ── Summary stats ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mt-5 mb-5">
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground mb-1">Services enrolled</p>
          <p className="text-2xl font-bold">
            {totalEnrolled}
            <span className="text-sm font-normal text-muted-foreground ml-1">/ {ALL_ITEMS.length}</span>
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground mb-1">Priority services enrolled</p>
          <p className={`text-2xl font-bold ${prioEnrolled === PRIO_ITEMS.length ? "text-green-700" : prioEnrolled > 0 ? "text-amber-700" : "text-red-700"}`}>
            {prioEnrolled}
            <span className="text-sm font-normal text-muted-foreground ml-1">/ {PRIO_ITEMS.length}</span>
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground mb-1">Sectors with any enrolment</p>
          <p className="text-2xl font-bold">
            {sectorsActive}
            <span className="text-sm font-normal text-muted-foreground ml-1">/ {SECTORS.length}</span>
          </p>
        </div>
      </div>

      {/* ── Priority note ───────────────────────────────────────────────────── */}
      <div className="mb-5 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-900 flex items-start gap-2">
        <Star className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
        <span>
          <strong>Priority services</strong> are marked with a star — enrol in these first. APHA is the UK statutory authority for all notifiable animal and plant disease. AHDB provides practical, early-warning intelligence by sector.
          Tick the checkbox once you have enrolled and enter the date it was done.
        </span>
      </div>

      {/* ── States ──────────────────────────────────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-16">
          <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
          Loading enrolment records…
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Sector cards ────────────────────────────────────────────────────── */}
      {!loading && !error && (
        <div className="space-y-5">
          {SECTORS.map(sector => {
            const sectorEnrolled = sector.items.filter(i => subs[i.id]?.enrolled).length;
            const allDone        = sectorEnrolled === sector.items.length;

            return (
              <div key={sector.id} className="rounded-xl border border-border overflow-hidden shadow-sm">

                {/* Sector header */}
                <div className={`${sector.headerBg} text-white px-5 py-3 flex items-center justify-between gap-3`}>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-sm">{sector.label}</h2>
                    <p className="text-xs opacity-75 mt-0.5 truncate">{sector.diseases}</p>
                  </div>
                  <span className={`shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${allDone ? "bg-white text-green-700 border-white" : "bg-white/20 text-white border-white/30"}`}>
                    {sectorEnrolled} / {sector.items.length}
                  </span>
                </div>

                {/* Column headings */}
                <div className="grid grid-cols-[28px_1fr_150px_90px] gap-3 px-5 py-2 bg-muted/40 border-b border-border">
                  <div />
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Service</p>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Date enrolled</p>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</p>
                </div>

                {/* Rows */}
                <div className="divide-y divide-border bg-card">
                  {sector.items.map(item => {
                    const rec      = subs[item.id];
                    const enrolled = rec?.enrolled ?? false;
                    const date     = rec?.date ?? "";

                    return (
                      <div key={item.id} className={`grid grid-cols-[28px_1fr_150px_90px] gap-3 items-center px-5 py-3 transition-colors ${enrolled ? "bg-green-50/40" : ""}`}>

                        {/* Checkbox */}
                        <button
                          onClick={() => toggleEnrolled(item.id)}
                          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                          aria-label={enrolled ? `Remove enrolment for ${item.name}` : `Mark ${item.name} as enrolled`}
                        >
                          {enrolled
                            ? <CheckSquare className="w-5 h-5 text-green-600" />
                            : <Square className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                          }
                        </button>

                        {/* Name + link + signup note */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {item.priority && (
                              <Star className="w-3 h-3 text-amber-500 shrink-0 fill-amber-400" aria-label="Priority service" />
                            )}
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-sm hover:underline flex items-center gap-1 min-w-0 ${enrolled ? "text-foreground font-medium" : "text-muted-foreground"}`}
                            >
                              <span className="truncate">{item.name}</span>
                              <ExternalLink className="w-3 h-3 shrink-0 opacity-40" />
                            </a>
                          </div>
                          <p className="text-[11px] text-muted-foreground/70 mt-0.5 leading-snug pr-2">{item.signupNote}</p>
                        </div>

                        {/* Date input */}
                        <div>
                          <input
                            type="date"
                            value={date}
                            max={todayIso()}
                            onChange={e => setSubs(prev => ({ ...prev, [item.id]: { enrolled: prev[item.id]?.enrolled ?? false, date: e.target.value } }))}
                            onBlur={e => commitDate(item.id, e.target.value)}
                            title={date ? `Enrolled on ${fmtDate(date)}` : "No date recorded"}
                            className="w-full text-xs border border-input rounded-md px-2 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                          />
                        </div>

                        {/* Status badge */}
                        {enrolled ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 whitespace-nowrap">
                            <CheckCircle2 className="w-3 h-3" />Enrolled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border whitespace-nowrap">
                            <Clock className="w-3 h-3" />Pending
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <p className="text-xs text-muted-foreground text-center pb-4">
            Changes are saved automatically. Service URLs are correct as of August 2026 — verify current sign-up pages directly with each provider.
          </p>
        </div>
      )}
    </div>
  );
}
