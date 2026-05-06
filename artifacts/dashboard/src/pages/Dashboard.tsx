import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/hooks/use-app-store";
import { useGetFarmActivity } from "@workspace/api-client-react/src/generated/api";
import {
  Activity, AlertTriangle, CheckCircle2, Sprout, Tractor, Droplets, FileText,
  Leaf, ShieldCheck, Landmark, CalendarDays, Package, GraduationCap,
  Wrench, PawPrint, ClipboardList, BarChart3, LineChart, ShieldAlert, CloudRain,
  ClipboardCheck, Layers, MapPin, Wheat, ExternalLink,
} from "lucide-react";
import { Link, Redirect } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useUserRole } from "@/hooks/use-user-role";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { UpcomingDatesPanel } from "./dashboard/UpcomingDatesPanel";
import { ComplianceHealthPanel } from "./dashboard/ComplianceHealthPanel";

type OverdueItem = { type: string; description: string; href: string };

function OverdueItemsPopover({
  items,
  label,
  variant = "amber",
}: {
  items: OverdueItem[];
  label: string;
  variant?: "amber" | "red";
}) {
  const colors =
    variant === "red"
      ? { pill: "bg-red-50 text-red-700 border border-red-200", dot: "bg-red-500", header: "text-red-700", item: "text-red-900" }
      : { pill: "bg-amber-50 text-amber-700 border border-amber-200", dot: "bg-amber-500", header: "text-amber-700", item: "text-amber-900" };

  return (
    <HoverCard openDelay={150} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div className={`mt-3 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full cursor-help select-none ${colors.pill}`}>
          <AlertTriangle className="w-3 h-3" />
          {label}
        </div>
      </HoverCardTrigger>
      <HoverCardContent side="bottom" align="start" className="w-80 p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/40">
          <p className={`text-xs font-bold uppercase tracking-wide ${colors.header}`}>Items requiring attention</p>
        </div>
        {items.length > 0 ? (
          <ul className="divide-y divide-border">
            {items.map((item, i) => (
              <li key={i} className="px-4 py-2.5 flex items-start gap-2.5">
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${colors.dot}`} />
                <span className={`text-xs leading-relaxed ${colors.item}`}>{item.description}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 py-3 text-xs text-muted-foreground">Open non-conformances or overdue inspections are reducing the score.</p>
        )}
        <div className="px-4 py-2.5 border-t border-border bg-muted/20">
          <Link href="/inspections" className="text-xs text-primary font-medium inline-flex items-center gap-1 hover:underline">
            View in Inspections <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

export default function Dashboard() {
  const { farmId } = useAppStore();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["farm-dashboard", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/dashboard`).then(r => r.json()),
    enabled: !!farmId,
  });
  const { data: activities } = useGetFarmActivity(farmId ?? 0);

  const { isAtLeast } = useUserRole();
  const { data: poCounts } = useQuery({
    queryKey: ["po-counts", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/purchase-orders/counts`).then(r => r.json()),
    enabled: !!farmId,
    staleTime: 60_000,
  });
  const pendingApprovals = poCounts?.counts?.submitted ?? 0;

  if (!farmId) return <Redirect href="/select" />;

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

  if (!farm) {
    return (
      <AppLayout title="Overview">
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-foreground/50">
          <AlertTriangle className="w-8 h-8 text-amber-400" />
          <p className="text-sm font-medium">Could not load farm data — please refresh the page.</p>
        </div>
      </AppLayout>
    );
  }

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
              <OverdueItemsPopover items={(dashboard as any).overdueItems ?? []} label="⚠ Attention needed" />
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
              <OverdueItemsPopover
                items={(dashboard as any).overdueItems ?? []}
                label={`${dashboard.overdueActions} item${dashboard.overdueActions !== 1 ? "s" : ""} need attention`}
                variant="red"
              />
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

      {/* Pending Approvals Card — managers only */}
      {isAtLeast("manager") && pendingApprovals > 0 && (
        <div style={{ background: "linear-gradient(135deg, #6d28d9, #7c3aed)", borderRadius: 16, padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, color: "white", boxShadow: "0 4px 16px rgba(109,40,217,0.25)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 12, padding: 10, flexShrink: 0 }}>
              <ClipboardList style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "1.1rem" }}>
                {pendingApprovals} Purchase Order{pendingApprovals !== 1 ? "s" : ""} Awaiting Your Approval
              </p>
              <p style={{ margin: "3px 0 0", fontSize: "0.82rem", opacity: 0.85 }}>
                Staff have submitted these orders — review, approve, or return to draft in Trade Contacts & Stock
              </p>
            </div>
          </div>
          <Link href="/stock">
            <div style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.35)", borderRadius: 8, padding: "8px 18px", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", color: "white" }}>
              Review Now →
            </div>
          </Link>
        </div>
      )}

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
    { href: "/stock", title: "Trade Contacts & Stock", icon: Package, color: "bg-amber-50 text-amber-700", moduleKey: "stock-suppliers" },
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
