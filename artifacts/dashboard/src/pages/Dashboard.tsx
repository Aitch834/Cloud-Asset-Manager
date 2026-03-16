import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/hooks/use-app-store";
import { useGetFarmDashboard, useGetFarmActivity } from "@workspace/api-client-react/src/generated/api";
import { Activity, AlertTriangle, CheckCircle2, Sprout, Tractor, Droplets, FileText, Leaf, Clock, ArrowRight } from "lucide-react";
import { Link, Redirect } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { farmId } = useAppStore();

  if (!farmId) return <Redirect href="/select" />;

  const { data: dashboard, isLoading } = useGetFarmDashboard(farmId);
  const { data: activities } = useGetFarmActivity(farmId);

  if (isLoading || !dashboard) {
    return (
      <AppLayout title="Dashboard">
        <div className="animate-pulse space-y-8">
          <div className="h-40 bg-black/5 rounded-2xl"></div>
          <div className="grid grid-cols-3 gap-6">
            <div className="h-32 bg-black/5 rounded-2xl"></div>
            <div className="h-32 bg-black/5 rounded-2xl"></div>
            <div className="h-32 bg-black/5 rounded-2xl"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Overview">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-transparent lg:col-span-2 overflow-hidden relative bg-white">
          <div className="absolute bottom-0 right-4 opacity-[0.04] pointer-events-none text-primary translate-y-4">
            <ShieldIcon className="w-40 h-40" />
          </div>
          <CardContent className="p-8 flex items-center justify-between gap-6 relative z-10 h-full">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full mb-3">
                <Tractor className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Red Tractor Scheme</span>
              </div>
              <h2 className="text-5xl font-display font-bold mb-3 text-primary">{dashboard.complianceScore}%</h2>
              <p className="text-sm text-foreground/50 font-medium mb-2">Compliance Score</p>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${dashboard.complianceScore > 90 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                {dashboard.complianceScore > 90 ? "✓ Excellent standing for next audit" : "⚠ Requires attention before next audit"}
              </div>
            </div>
            <div style={{ width: 88, height: 88, position: 'relative', flexShrink: 0 }}>
              <svg width="88" height="88" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="9" className="text-primary/10" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="9" className="text-primary" strokeLinecap="round" strokeDasharray={`${dashboard.complianceScore * 2.51} 251`} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-base font-bold text-primary">{dashboard.complianceScore}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent flex flex-col justify-center">
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle className="w-6 h-6 text-accent" />
            </div>
            <p className="text-foreground/60 font-medium mb-1">Action Required</p>
            <h3 className="text-3xl font-display font-bold text-foreground">{dashboard.overdueActions}</h3>
            <p className="text-sm mt-2 mb-4 text-foreground/70">Overdue checks or missing records</p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Health Panel */}
      <ComplianceHealthPanel farmId={farmId} />

      {/* Module Quick Links */}
      <div>
        <h3 className="text-xl font-display font-bold mb-4">Quick Access</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickLinkCard href="/fields" title="Fields & Crops" icon={Sprout} count={dashboard.fieldCount ?? 0} color="bg-emerald-50 text-emerald-600" />
          <QuickLinkCard href="/equipment" title="Equipment" icon={Tractor} count={dashboard.equipmentCount ?? 0} color="bg-blue-50 text-blue-600" />
          <QuickLinkCard href="/sprays" title="Sprays" icon={Droplets} count={dashboard.sprayCount ?? 0} color="bg-cyan-50 text-cyan-600" />
          <QuickLinkCard href="/inspections" title="Inspections" icon={CheckCircle2} count={dashboard.inspectionCount ?? 0} color="bg-violet-50 text-violet-600" />
        </div>
      </div>

      {/* Activity Feed */}
      <Card>
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-display font-bold text-lg">Recent Activity</h3>
          <Activity className="w-5 h-5 text-foreground/40" />
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {activities?.activities.slice(0, 5).map((act) => (
              <div key={act.id} className="p-4 px-6 flex items-start gap-4 hover:bg-black/5 transition-colors">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">{act.description}</p>
                  <div className="flex items-center gap-2 mt-1 text-sm text-foreground/50">
                    <span className="capitalize">{act.module}</span>
                    <span>&bull;</span>
                    <span>{act.createdAt ? new Date(act.createdAt).toLocaleDateString('en-GB') : "—"}</span>
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

function ComplianceHealthPanel({ farmId }: { farmId: number }) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const ninetyDays = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();

  const spraysQ = useQuery({ queryKey: ["spray-applications", farmId], queryFn: () => fetch(`/api/farms/${farmId}/spray-applications`).then(r => r.json()), select: d => d.records ?? [] });
  const productsQ = useQuery({ queryKey: ["spray-products", farmId], queryFn: () => fetch(`/api/farms/${farmId}/spray-products`).then(r => r.json()), select: d => d.records ?? [] });
  const plansQ = useQuery({ queryKey: ["nmp-plans", farmId], queryFn: () => fetch(`/api/farms/${farmId}/nmp-plans`).then(r => r.json()), select: d => d.records ?? [] });
  const docsQ = useQuery({ queryKey: ["documents", farmId], queryFn: () => fetch(`/api/farms/${farmId}/documents`).then(r => r.json()), select: d => d.records ?? [] });
  const fieldsQ = useQuery({ queryKey: ["fields", farmId], queryFn: () => fetch(`/api/farms/${farmId}/fields`).then(r => r.json()), select: d => d.records ?? [] });

  const sprays: any[] = spraysQ.data ?? [];
  const products: any[] = productsQ.data ?? [];
  const plans: any[] = plansQ.data ?? [];
  const docs: any[] = docsQ.data ?? [];
  const fields: any[] = fieldsQ.data ?? [];

  const currentYear = now.getFullYear();

  const checks = [
    {
      label: "Spray Applications",
      status: sprays.length > 0
        ? sprays.some(s => new Date(s.applicationDate) >= new Date(thirtyDaysAgo))
          ? "ok" : "warn"
        : "gap",
      message: sprays.length === 0
        ? "No spray records on file"
        : sprays.some(s => new Date(s.applicationDate) >= new Date(thirtyDaysAgo))
          ? `${sprays.length} total applications recorded`
          : `Last application over 30 days ago — confirm records are up to date`,
      href: "/sprays",
      icon: Droplets,
    },
    {
      label: "Product Register",
      status: products.length > 0 ? "ok" : "gap",
      message: products.length === 0
        ? "No products in spray register — required before logging applications"
        : `${products.length} product${products.length !== 1 ? "s" : ""} registered`,
      href: "/sprays",
      icon: Droplets,
    },
    {
      label: `NMP for ${currentYear}`,
      status: plans.some(p => p.planYear === currentYear || p.planYear === String(currentYear))
        ? "ok"
        : plans.some(p => p.planYear === currentYear - 1 || p.planYear === String(currentYear - 1))
          ? "warn"
          : "gap",
      message: plans.some(p => p.planYear === currentYear || p.planYear === String(currentYear))
        ? `${currentYear} Nutrient Management Plan on record`
        : plans.some(p => p.planYear === currentYear - 1 || p.planYear === String(currentYear - 1))
          ? `Only ${currentYear - 1} NMP on record — ${currentYear} plan not yet created`
          : "No Nutrient Management Plan for the current growing year",
      href: "/nmp",
      icon: Leaf,
    },
    {
      label: "Field Coverage (NMP)",
      status: fields.length === 0 ? "warn" :
        plans.length === 0 ? "gap" : "ok",
      message: fields.length === 0 ? "No fields registered yet" :
        plans.length === 0 ? `${fields.length} field${fields.length !== 1 ? "s" : ""} with no NMP entries` :
        `${fields.length} field${fields.length !== 1 ? "s" : ""} in system — verify all are covered in NMP`,
      href: "/nmp",
      icon: Leaf,
    },
    {
      label: "Document Register",
      status: (() => {
        if (docs.length === 0) return "gap";
        const expired = docs.filter(d => d.expiryDate && new Date(d.expiryDate) < now).length;
        const expiring = docs.filter(d => d.expiryDate && new Date(d.expiryDate) > now && new Date(d.expiryDate) < new Date(ninetyDays)).length;
        if (expired > 0) return "gap";
        if (expiring > 0) return "warn";
        return "ok";
      })(),
      message: (() => {
        if (docs.length === 0) return "No documents in register — add certificates and compliance records";
        const expired = docs.filter(d => d.expiryDate && new Date(d.expiryDate) < now).length;
        const expiring = docs.filter(d => d.expiryDate && new Date(d.expiryDate) > now && new Date(d.expiryDate) < new Date(ninetyDays)).length;
        if (expired > 0) return `${expired} expired document${expired !== 1 ? "s" : ""} — update or renew immediately`;
        if (expiring > 0) return `${expiring} document${expiring !== 1 ? "s" : ""} expiring within 90 days`;
        return `${docs.length} document${docs.length !== 1 ? "s" : ""} on record — all valid`;
      })(),
      href: "/documents",
      icon: FileText,
    },
    {
      label: "Operator Certificates",
      status: (() => {
        const certs = docs.filter(d => d.documentType === "Spray Operator Certificate (PA1/PA6)");
        if (certs.length === 0) return "warn";
        const expired = certs.filter(d => d.expiryDate && new Date(d.expiryDate) < now).length;
        return expired > 0 ? "gap" : "ok";
      })(),
      message: (() => {
        const certs = docs.filter(d => d.documentType === "Spray Operator Certificate (PA1/PA6)");
        if (certs.length === 0) return "No PA1/PA6 certificates on record — required for spray operators";
        const expired = certs.filter(d => d.expiryDate && new Date(d.expiryDate) < now).length;
        return expired > 0 ? `${expired} operator certificate${expired !== 1 ? "s" : ""} expired` : `${certs.length} operator certificate${certs.length !== 1 ? "s" : ""} on record`;
      })(),
      href: "/documents",
      icon: FileText,
    },
  ];

  const okCount = checks.filter(c => c.status === "ok").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-display font-bold">Compliance Health</h3>
        <span className="text-sm text-foreground/50">{okCount}/{checks.length} checks passing</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {checks.map((check) => {
          const Icon = check.icon;
          const statusConfig = {
            ok: { bg: "bg-emerald-50", border: "border-emerald-100", iconBg: "bg-emerald-100", iconColor: "text-emerald-600", dot: "bg-emerald-500", label: "OK", labelColor: "text-emerald-700" },
            warn: { bg: "bg-amber-50", border: "border-amber-100", iconBg: "bg-amber-100", iconColor: "text-amber-600", dot: "bg-amber-500", label: "Attention", labelColor: "text-amber-700" },
            gap: { bg: "bg-red-50", border: "border-red-100", iconBg: "bg-red-100", iconColor: "text-red-600", dot: "bg-red-500", label: "Action Required", labelColor: "text-red-700" },
          }[check.status];
          return (
            <Link key={check.label} href={check.href}>
              <div className={`p-4 rounded-xl border ${statusConfig.bg} ${statusConfig.border} hover:shadow-sm transition-all cursor-pointer group`}>
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg ${statusConfig.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${statusConfig.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-foreground/70">{check.label}</span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${statusConfig.bg} ${statusConfig.labelColor}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                        {statusConfig.label}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/70 leading-snug">{check.message}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-foreground/20 group-hover:text-foreground/50 transition-colors flex-shrink-0 mt-0.5" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

interface QuickLinkCardProps {
  href: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  color: string;
}

function QuickLinkCard({ href, title, icon: Icon, count, color }: QuickLinkCardProps) {
  return (
    <Link href={href} className="block group">
      <div className="p-5 rounded-2xl border border-border/50 bg-white shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{title}</h4>
            <p className="text-sm text-foreground/50">{count} records</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
