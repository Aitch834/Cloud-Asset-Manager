import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/hooks/use-app-store";
import { useGetFarmDashboard, useGetFarmActivity } from "@workspace/api-client-react/src/generated/api";
import {
  Activity, AlertTriangle, CheckCircle2, Sprout, Tractor, Droplets, FileText,
  Leaf, ArrowRight, ShieldCheck, Landmark, CalendarDays, Package, GraduationCap,
  Wrench, PawPrint, ClipboardList, BarChart3, LineChart, ShieldAlert, CloudRain,
  ClipboardCheck, Layers, MapPin, Wheat,
} from "lucide-react";
import { Link, Redirect } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Dashboard() {
  const { farmId } = useAppStore();

  if (!farmId) return <Redirect href="/select" />;

  const { data: dashboard, isLoading } = useGetFarmDashboard(farmId);
  const { data: activities } = useGetFarmActivity(farmId);

  if (isLoading || !dashboard) {
    return (
      <AppLayout title="Overview">
        <div className="animate-pulse space-y-8">
          <div className="h-24 bg-black/5 rounded-2xl" />
          <div className="grid grid-cols-3 gap-6">
            {[0, 1, 2].map(i => <div key={i} className="h-36 bg-black/5 rounded-2xl" />)}
          </div>
          <div className="h-56 bg-black/5 rounded-2xl" />
          <div className="h-56 bg-black/5 rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  const farm = dashboard.farm as any;
  const activeSubs: string[] = (dashboard.activeSubscriptions ?? []).map((s: any) => s.moduleKey as string);

  const sectors: string[] = [
    farm.sectorArable && "Arable",
    farm.sectorDairy && "Dairy",
    farm.sectorBeef && "Beef & Suckler",
    farm.sectorSheep && "Sheep",
    farm.sectorPigs && "Pigs",
    farm.sectorPoultry && "Poultry",
    farm.sectorHorticulture && "Horticulture",
    farm.sectorEggs && "Eggs",
    farm.sectorGoats && "Goats",
    farm.sectorEquine && "Equine",
  ].filter(Boolean) as string[];

  return (
    <AppLayout title="Overview">
      {/* Farm Profile Strip */}
      <div className="bg-white rounded-2xl border border-border px-6 py-5 flex flex-wrap items-center gap-x-8 gap-y-3 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Wheat className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-foreground leading-tight truncate">{farm.name}</h2>
            {farm.cphNumber && (
              <p className="text-xs text-foreground/50 font-mono">CPH: {farm.cphNumber}</p>
            )}
          </div>
        </div>
        {farm.address && (
          <div className="flex items-center gap-1.5 text-sm text-foreground/60">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{farm.address}</span>
          </div>
        )}
        {farm.totalAcreage && (
          <div className="text-sm text-foreground/60">
            <span className="font-semibold text-foreground">{farm.totalAcreage.toLocaleString()}</span> acres
          </div>
        )}
        {sectors.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {sectors.map(s => (
              <span key={s} className="text-xs font-medium bg-primary/8 text-primary px-2.5 py-1 rounded-full border border-primary/15">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Three Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Compliance Score */}
        <Card className="overflow-hidden relative border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ClipboardCheck className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">Red Tractor</span>
                </div>
                <h3 className="text-4xl font-bold text-primary mb-1">{dashboard.complianceScore}%</h3>
                <p className="text-sm text-foreground/60 font-medium">Compliance Score</p>
              </div>
              <div style={{ width: 56, height: 56, flexShrink: 0 }}>
                <svg width="56" height="56" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="10" className="text-primary/10" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="10" className="text-primary" strokeLinecap="round"
                    strokeDasharray={`${dashboard.complianceScore * 2.51} 251`} />
                </svg>
              </div>
            </div>
            {dashboard.complianceScore > 90 ? (
              <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                ✓ Excellent — audit-ready
              </div>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 cursor-help">
                      ⚠ Attention needed
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs text-left">
                    {((dashboard as any).overdueItems ?? []).length > 0 ? (
                      <ul className="space-y-1">
                        {((dashboard as any).overdueItems as {description: string}[]).map((item, i) => (
                          <li key={i} className="text-xs">{item.description}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs">Open non-conformances or overdue inspections are reducing the compliance score.</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </CardContent>
        </Card>

        {/* Overdue Actions */}
        <Card className={`border-l-4 ${dashboard.overdueActions > 0 ? "border-l-red-400" : "border-l-emerald-400"}`}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className={`w-4 h-4 ${dashboard.overdueActions > 0 ? "text-red-500" : "text-emerald-500"}`} />
                  <span className={`text-xs font-bold uppercase tracking-wider ${dashboard.overdueActions > 0 ? "text-red-600" : "text-emerald-600"}`}>Actions Due</span>
                </div>
                <h3 className={`text-4xl font-bold mb-1 ${dashboard.overdueActions > 0 ? "text-red-600" : "text-emerald-600"}`}>
                  {dashboard.overdueActions}
                </h3>
                <p className="text-sm text-foreground/60 font-medium">Overdue checks & records</p>
              </div>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${dashboard.overdueActions > 0 ? "bg-red-50" : "bg-emerald-50"}`}>
                {dashboard.overdueActions > 0
                  ? <AlertTriangle className="w-6 h-6 text-red-500" />
                  : <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                }
              </div>
            </div>
            {dashboard.overdueActions === 0 ? (
              <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                All clear
              </div>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-700 cursor-help">
                      {dashboard.overdueActions} item{dashboard.overdueActions !== 1 ? "s" : ""} need attention
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs text-left">
                    {((dashboard as any).overdueItems ?? []).length > 0 ? (
                      <ul className="space-y-1">
                        {((dashboard as any).overdueItems as {description: string}[]).map((item, i) => (
                          <li key={i} className="text-xs">{item.description}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs">View Inspections to see overdue items.</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </CardContent>
        </Card>

        {/* Active Modules */}
        <Card className="border-l-4 border-l-indigo-400">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Platform</span>
                </div>
                <h3 className="text-4xl font-bold text-indigo-600 mb-1">{activeSubs.length}</h3>
                <p className="text-sm text-foreground/60 font-medium">Active modules</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <Layers className="w-6 h-6 text-indigo-500" />
              </div>
            </div>
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
              Red Tractor + {Math.max(0, activeSubs.length - 1)} add-ons
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Key Dates */}
      <UpcomingDatesPanel farmId={farmId} />

      {/* Compliance Health */}
      <ComplianceHealthPanel farmId={farmId} />

      {/* Quick Access */}
      <QuickAccessGrid farmId={farmId} activeSubs={activeSubs} dashboard={dashboard} />

      {/* Recent Activity */}
      <Card>
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-lg">Recent Activity</h3>
          <Activity className="w-5 h-5 text-foreground/40" />
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {!activities?.activities?.length ? (
              <div className="px-6 py-8 text-center text-sm text-foreground/50">No activity recorded yet</div>
            ) : activities.activities.slice(0, 8).map((act: any) => (
              <div key={act.id} className="p-4 px-6 flex items-start gap-4 hover:bg-black/[0.02] transition-colors">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{act.description}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-foreground/50">
                    <span className="capitalize">{act.module}</span>
                    <span>&bull;</span>
                    <span>{act.createdAt ? new Date(act.createdAt).toLocaleDateString("en-GB") : "—"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}

function UpcomingDatesPanel({ farmId }: { farmId: number }) {
  const now = new Date();
  const in60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

  const insuranceQ = useQuery({
    queryKey: ["insurance", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/insurance`).then(r => r.json()),
    select: d => d.records ?? [],
  });
  const grantsQ = useQuery({
    queryKey: ["grants", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/grants`).then(r => r.json()),
    select: d => d.records ?? [],
  });

  const insurance: any[] = insuranceQ.data ?? [];
  const grants: any[] = grantsQ.data ?? [];

  type DateItem = { label: string; date: Date; daysUntil: number; href: string; type: string; urgent: boolean };

  const items: DateItem[] = [];

  for (const pol of insurance) {
    if (!pol.expiryDate) continue;
    const expiry = new Date(pol.expiryDate);
    if (expiry > in60Days) continue;
    const daysUntil = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    items.push({
      label: `${pol.policyType}${pol.insurer ? ` — ${pol.insurer}` : ""} renewal`,
      date: expiry,
      daysUntil,
      href: "/insurance",
      type: "Insurance",
      urgent: daysUntil <= 14,
    });
  }

  const activeGrants = grants.filter((g: any) => !["claimed", "rejected", "withdrawn"].includes(g.status));
  for (const grant of activeGrants) {
    if (grant.purchaseDeadline) {
      const d = new Date(grant.purchaseDeadline);
      if (d <= in60Days) {
        const daysUntil = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        items.push({ label: `${grant.schemeName} — purchase deadline`, date: d, daysUntil, href: "/grants", type: "Grant", urgent: daysUntil <= 14 });
      }
    }
    if (grant.claimDeadline) {
      const d = new Date(grant.claimDeadline);
      if (d <= in60Days) {
        const daysUntil = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        items.push({ label: `${grant.schemeName} — claim deadline`, date: d, daysUntil, href: "/grants", type: "Grant", urgent: daysUntil <= 14 });
      }
    }
  }

  items.sort((a, b) => a.daysUntil - b.daysUntil);

  if (items.length === 0) {
    return (
      <Card>
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-lg">Upcoming Key Dates</h3>
          <CalendarDays className="w-5 h-5 text-foreground/40" />
        </div>
        <CardContent className="px-6 py-5">
          <p className="text-sm text-foreground/50">No upcoming deadlines in the next 60 days. <Link href="/week-ahead" className="text-primary underline-offset-2 hover:underline">Open Week Ahead planner →</Link></p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <h3 className="font-bold text-lg">Upcoming Key Dates</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-foreground/50">Next 60 days</span>
          <CalendarDays className="w-5 h-5 text-foreground/40" />
        </div>
      </div>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {items.slice(0, 6).map((item, i) => (
            <Link key={i} href={item.href}>
              <div className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-black/[0.02] transition-colors cursor-pointer group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.type === "Grant" ? "bg-violet-50" : "bg-blue-50"}`}>
                    {item.type === "Grant"
                      ? <Landmark className={`w-4 h-4 ${item.urgent ? "text-red-500" : "text-violet-600"}`} />
                      : <ShieldCheck className={`w-4 h-4 ${item.urgent ? "text-red-500" : "text-blue-600"}`} />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.label}</p>
                    <p className="text-xs text-foreground/50">{item.date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${item.daysUntil < 0 ? "bg-red-100 text-red-700" : item.urgent ? "bg-red-50 text-red-600" : item.daysUntil <= 30 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                    {item.daysUntil < 0 ? `${Math.abs(item.daysUntil)}d overdue` : item.daysUntil === 0 ? "Today" : `${item.daysUntil}d`}
                  </span>
                  <ArrowRight className="w-4 h-4 text-foreground/20 group-hover:text-foreground/50 transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
        {items.length > 6 && (
          <div className="px-6 py-3 border-t border-border">
            <Link href="/week-ahead" className="text-xs text-primary hover:underline underline-offset-2">
              View all {items.length} upcoming dates in Week Ahead →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ComplianceHealthPanel({ farmId }: { farmId: number }) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const ninetyDays = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();

  const spraysQ = useQuery({ queryKey: ["spray-applications", farmId], queryFn: () => fetch(`/api/farms/${farmId}/spray-applications`).then(r => r.json()), select: d => d.records ?? [] });
  const productsQ = useQuery({ queryKey: ["spray-products", farmId], queryFn: () => fetch(`/api/farms/${farmId}/spray-products`).then(r => r.json()), select: d => d.records ?? [] });
  const plansQ = useQuery({ queryKey: ["nmp-plans", farmId], queryFn: () => fetch(`/api/farms/${farmId}/nmp-plans`).then(r => r.json()), select: d => d.records ?? [] });
  const docsQ = useQuery({ queryKey: ["documents", farmId], queryFn: () => fetch(`/api/farms/${farmId}/documents`).then(r => r.json()), select: d => d.records ?? [] });
  const fieldsQ = useQuery({ queryKey: ["fields", farmId], queryFn: () => fetch(`/api/farms/${farmId}/fields`).then(r => r.json()), select: d => d.records ?? [] });
  const insuranceQ = useQuery({ queryKey: ["insurance", farmId], queryFn: () => fetch(`/api/farms/${farmId}/insurance`).then(r => r.json()), select: d => d.records ?? [] });

  const sprays: any[] = spraysQ.data ?? [];
  const products: any[] = productsQ.data ?? [];
  const plans: any[] = plansQ.data ?? [];
  const docs: any[] = docsQ.data ?? [];
  const fields: any[] = fieldsQ.data ?? [];
  const insurance: any[] = insuranceQ.data ?? [];

  const currentYear = now.getFullYear();

  const getInsuranceCheck = (type: "EL" | "PL") => {
    const label = type === "EL" ? "Employers Liability" : "Public Liability";
    const keywords = type === "EL" ? ["employers", "employer"] : ["public liability", "public"];
    const matches = insurance.filter(p =>
      keywords.some(kw => p.policyType?.toLowerCase().includes(kw))
    );
    if (matches.length === 0) return { status: "gap" as const, message: `No ${label} insurance on record — legally required` };
    const expired = matches.filter(p => p.expiryDate && new Date(p.expiryDate) < now);
    const expiring = matches.filter(p => p.expiryDate && new Date(p.expiryDate) >= now && new Date(p.expiryDate) <= new Date(ninetyDays));
    if (expired.length > 0) return { status: "gap" as const, message: `${label} policy expired — renew immediately` };
    if (expiring.length > 0) return { status: "warn" as const, message: `${label} policy expiring within 90 days` };
    return { status: "ok" as const, message: `${label} policy current` };
  };

  const elCheck = getInsuranceCheck("EL");
  const plCheck = getInsuranceCheck("PL");

  const checks = [
    {
      label: "Employers Liability",
      ...elCheck,
      href: "/insurance",
      icon: ShieldCheck,
    },
    {
      label: "Public Liability",
      ...plCheck,
      href: "/insurance",
      icon: ShieldCheck,
    },
    {
      label: "Spray Applications",
      status: sprays.length > 0
        ? sprays.some(s => new Date(s.applicationDate) >= new Date(thirtyDaysAgo)) ? "ok" : "warn"
        : "gap",
      message: sprays.length === 0
        ? "No spray records on file"
        : sprays.some(s => new Date(s.applicationDate) >= new Date(thirtyDaysAgo))
          ? `${sprays.length} total application${sprays.length !== 1 ? "s" : ""} recorded`
          : "Last application over 30 days ago — confirm records are up to date",
      href: "/sprays",
      icon: Droplets,
    },
    {
      label: "Product Register",
      status: products.length > 0 ? "ok" : "gap",
      message: products.length === 0
        ? "No products registered — required before logging applications"
        : `${products.length} product${products.length !== 1 ? "s" : ""} registered`,
      href: "/sprays",
      icon: Droplets,
    },
    {
      label: `NMP ${currentYear}`,
      status: plans.some(p => p.planYear === currentYear || p.planYear === String(currentYear))
        ? "ok"
        : plans.some(p => p.planYear === currentYear - 1 || p.planYear === String(currentYear - 1))
          ? "warn"
          : "gap",
      message: plans.some(p => p.planYear === currentYear || p.planYear === String(currentYear))
        ? `${currentYear} Nutrient Management Plan on record`
        : plans.some(p => p.planYear === currentYear - 1 || p.planYear === String(currentYear - 1))
          ? `Only ${currentYear - 1} NMP on file — ${currentYear} plan needed`
          : "No Nutrient Management Plan for the current year",
      href: "/nmp",
      icon: Leaf,
    },
    {
      label: "Field Coverage",
      status: fields.length === 0 ? "warn" : plans.length === 0 ? "gap" : "ok",
      message: fields.length === 0
        ? "No fields registered yet"
        : plans.length === 0
          ? `${fields.length} field${fields.length !== 1 ? "s" : ""} registered — no NMP entries`
          : `${fields.length} field${fields.length !== 1 ? "s" : ""} — verify all covered in NMP`,
      href: "/nmp",
      icon: Sprout,
    },
    {
      label: "Document Register",
      status: (() => {
        if (docs.length === 0) return "gap";
        const expired = docs.filter(d => d.expiryDate && new Date(d.expiryDate) < now).length;
        if (expired > 0) return "gap";
        const expiring = docs.filter(d => d.expiryDate && new Date(d.expiryDate) > now && new Date(d.expiryDate) < new Date(ninetyDays)).length;
        if (expiring > 0) return "warn";
        return "ok";
      })() as "ok" | "warn" | "gap",
      message: (() => {
        if (docs.length === 0) return "No documents in register — add certificates and compliance records";
        const expired = docs.filter(d => d.expiryDate && new Date(d.expiryDate) < now).length;
        if (expired > 0) return `${expired} expired document${expired !== 1 ? "s" : ""} — renew immediately`;
        const expiring = docs.filter(d => d.expiryDate && new Date(d.expiryDate) > now && new Date(d.expiryDate) < new Date(ninetyDays)).length;
        if (expiring > 0) return `${expiring} document${expiring !== 1 ? "s" : ""} expiring within 90 days`;
        return `${docs.length} document${docs.length !== 1 ? "s" : ""} on record — all valid`;
      })(),
      href: "/documents",
      icon: FileText,
    },
    {
      label: "Spray Operator Certs",
      status: (() => {
        const certs = docs.filter(d => d.documentType === "Spray Operator Certificate (PA1/PA6)");
        if (certs.length === 0) return "warn";
        return certs.filter(d => d.expiryDate && new Date(d.expiryDate) < now).length > 0 ? "gap" : "ok";
      })() as "ok" | "warn" | "gap",
      message: (() => {
        const certs = docs.filter(d => d.documentType === "Spray Operator Certificate (PA1/PA6)");
        if (certs.length === 0) return "No PA1/PA6 certificates on record — required for spray operators";
        const expired = certs.filter(d => d.expiryDate && new Date(d.expiryDate) < now).length;
        return expired > 0 ? `${expired} operator certificate${expired !== 1 ? "s" : ""} expired` : `${certs.length} operator certificate${certs.length !== 1 ? "s" : ""} on record`;
      })(),
      href: "/documents",
      icon: FileText,
    },
  ] as { label: string; status: "ok" | "warn" | "gap"; message: string; href: string; icon: React.ComponentType<{ className?: string }> }[];

  const okCount = checks.filter(c => c.status === "ok").length;
  const gapCount = checks.filter(c => c.status === "gap").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Compliance Health</h3>
        <div className="flex items-center gap-3 text-sm">
          <span className={`font-semibold ${gapCount > 0 ? "text-red-600" : "text-foreground/50"}`}>
            {gapCount > 0 ? `${gapCount} gap${gapCount !== 1 ? "s" : ""}` : ""}
          </span>
          <span className="text-foreground/50">{okCount}/{checks.length} passing</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {checks.map((check) => {
          const Icon = check.icon;
          const cfg = {
            ok: { bg: "bg-emerald-50", border: "border-emerald-100", iconBg: "bg-emerald-100", iconColor: "text-emerald-600", dot: "bg-emerald-500", label: "OK", labelColor: "text-emerald-700" },
            warn: { bg: "bg-amber-50", border: "border-amber-100", iconBg: "bg-amber-100", iconColor: "text-amber-600", dot: "bg-amber-500", label: "Attention", labelColor: "text-amber-700" },
            gap: { bg: "bg-red-50", border: "border-red-100", iconBg: "bg-red-100", iconColor: "text-red-600", dot: "bg-red-500", label: "Action Required", labelColor: "text-red-700" },
          }[check.status];
          return (
            <Link key={check.label} href={check.href}>
              <div className={`p-4 rounded-xl border ${cfg.bg} ${cfg.border} hover:shadow-sm transition-all cursor-pointer group h-full`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg ${cfg.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="text-xs font-semibold text-foreground/70">{check.label}</span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.labelColor}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-foreground/65 leading-snug">{check.message}</p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

interface QuickAccessGridProps {
  farmId: number;
  activeSubs: string[];
  dashboard: any;
}

function QuickAccessGrid({ activeSubs, dashboard }: QuickAccessGridProps) {
  type QuickLink = { href: string; title: string; icon: React.ComponentType<{ className?: string }>; count?: number; color: string; always?: boolean; moduleKey?: string };

  const allLinks: QuickLink[] = [
    { href: "/week-ahead", title: "Week Ahead", icon: CalendarDays, color: "bg-green-50 text-green-600", always: true },
    { href: "/insurance", title: "Insurance", icon: ShieldCheck, color: "bg-blue-50 text-blue-600", always: true },
    { href: "/grants", title: "Grants & Funding", icon: Landmark, color: "bg-violet-50 text-violet-600", always: true },
    { href: "/fields", title: "Fields & Crops", icon: Sprout, count: dashboard.fieldCount ?? 0, color: "bg-emerald-50 text-emerald-600", moduleKey: "field-crop-management" },
    { href: "/sprays", title: "Sprays & Inputs", icon: Droplets, count: dashboard.sprayCount ?? 0, color: "bg-cyan-50 text-cyan-600", moduleKey: "sprays-inputs" },
    { href: "/equipment", title: "Equipment", icon: Tractor, count: dashboard.equipmentCount ?? 0, color: "bg-orange-50 text-orange-600", moduleKey: "equipment-management" },
    { href: "/workshop", title: "Workshop", icon: Wrench, color: "bg-teal-50 text-teal-600", moduleKey: "workshop-management" },
    { href: "/livestock", title: "Livestock", icon: PawPrint, color: "bg-rose-50 text-rose-600", moduleKey: "livestock-management" },
    { href: "/biosecurity", title: "Biosecurity", icon: ShieldAlert, color: "bg-red-50 text-red-600", moduleKey: "biosecurity" },
    { href: "/staff", title: "Staff & Training", icon: GraduationCap, color: "bg-indigo-50 text-indigo-600", moduleKey: "staff-training" },
    { href: "/inspections", title: "Inspections", icon: ClipboardList, count: dashboard.inspectionCount ?? 0, color: "bg-violet-50 text-violet-600", moduleKey: "inspections" },
    { href: "/stock", title: "Stock & Suppliers", icon: Package, color: "bg-amber-50 text-amber-700", moduleKey: "stock-suppliers" },
    { href: "/financial", title: "Financial Records", icon: LineChart, color: "bg-emerald-50 text-emerald-700", moduleKey: "financial-records" },
    { href: "/reports", title: "Business Reports", icon: BarChart3, color: "bg-green-50 text-green-700", moduleKey: "business-reports" },
    { href: "/environmental", title: "Environment", icon: Leaf, color: "bg-green-50 text-green-600", moduleKey: "environmental" },
    { href: "/weather", title: "Weather", icon: CloudRain, color: "bg-sky-50 text-sky-600", moduleKey: "weather-tracking" },
    { href: "/nmp", title: "Soil & NMP", icon: Sprout, color: "bg-lime-50 text-lime-600", moduleKey: "soil-management" },
    { href: "/documents", title: "Documents", icon: FileText, color: "bg-gray-100 text-gray-600", moduleKey: "document-management" },
    { href: "/compliance", title: "Red Tractor", icon: ClipboardCheck, color: "bg-blue-50 text-blue-600", moduleKey: "red-tractor-compliance" },
  ];

  const visible = allLinks.filter(l => l.always || (l.moduleKey && activeSubs.includes(l.moduleKey)));

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Quick Access</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {visible.map(link => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} className="block group">
              <div className="p-4 rounded-xl border border-border/60 bg-white shadow-sm hover:shadow-md hover:border-primary/25 transition-all duration-200 h-full">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${link.color} group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-sm text-foreground leading-tight">{link.title}</h4>
                {link.count !== undefined && (
                  <p className="text-xs text-foreground/50 mt-0.5">{link.count} record{link.count !== 1 ? "s" : ""}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
