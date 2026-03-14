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
        <Card className="bg-primary text-white border-transparent lg:col-span-2 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <ShieldIcon className="w-48 h-48" />
          </div>
          <CardContent className="p-8 flex items-center justify-between relative z-10 h-full">
            <div>
              <p className="text-white/80 font-medium mb-1">Compliance Score</p>
              <h2 className="text-5xl font-display font-bold mb-4">{dashboard.complianceScore}%</h2>
              <p className="text-white/90">
                {dashboard.complianceScore > 90 ? "Excellent standing for next Red Tractor audit." : "Requires attention before next audit."}
              </p>
            </div>
            <div className="w-32 h-32 rounded-full border-8 border-white/20 flex items-center justify-center relative">
               <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-white/20" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-white" strokeDasharray={`${dashboard.complianceScore * 2.51} 251`} />
              </svg>
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
          <QuickLinkCard href="/fields" title="Fields & Crops" icon={Sprout} count={12} color="bg-emerald-50 text-emerald-600" />
          <QuickLinkCard href="/equipment" title="Equipment" icon={Tractor} count={8} color="bg-blue-50 text-blue-600" />
          <QuickLinkCard href="/sprays" title="Sprays" icon={Droplets} count={45} color="bg-cyan-50 text-cyan-600" />
          <QuickLinkCard href="/inspections" title="Inspections" icon={CheckCircle2} count={3} color="bg-violet-50 text-violet-600" />
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
                    <span>{new Date(act.createdAt).toLocaleDateString('en-GB')}</span>
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

function ShieldIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

function QuickLinkCard({ href, title, icon: Icon, count, color }: any) {
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
