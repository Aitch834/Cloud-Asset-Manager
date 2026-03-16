import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/hooks/use-app-store";
import { useGetFarmDashboard, useGetFarmActivity } from "@workspace/api-client-react/src/generated/api";
import { Activity, AlertTriangle, CheckCircle2, Sprout, Tractor, Droplets } from "lucide-react";
import { Link, Redirect } from "wouter";

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
          <CardContent className="p-8">
             <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-accent" />
            </div>
            <p className="text-foreground/60 font-medium mb-1">Action Required</p>
            <h3 className="text-3xl font-display font-bold text-foreground">{dashboard.overdueActions}</h3>
            <p className="text-sm mt-2 text-foreground/70">Overdue checks or missing records</p>
          </CardContent>
        </Card>
      </div>

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
