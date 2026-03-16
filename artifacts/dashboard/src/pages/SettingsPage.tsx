import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/hooks/use-app-store";
import { useGetFarmDashboard } from "@workspace/api-client-react/src/generated/api";
import { 
  Users, MapPin, Bell, CreditCard, ChevronRight, 
  CheckCircle2, ShieldCheck, Package
} from "lucide-react";
import { Link } from "wouter";

function SettingRow({ icon: Icon, label, description, href }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-black/[0.03] transition-colors cursor-pointer group">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm">{label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
      </div>
    </Link>
  );
}

export default function SettingsPage() {
  const { farmId } = useAppStore();
  const { data: dashboardData } = useGetFarmDashboard(farmId ?? 0, { query: { enabled: !!farmId } });
  const activeModules = dashboardData?.activeSubscriptions ?? [];
  const farm = dashboardData?.farm as Record<string, unknown> | undefined;

  return (
    <AppLayout title="Settings">
      <div className="space-y-6 max-w-2xl">

        {/* Farm & Account */}
        <div>
          <h2 className="text-xs uppercase tracking-widest font-bold text-foreground/40 mb-3 px-1">Farm & Account</h2>
          <Card>
            <CardContent className="p-2">
              <SettingRow
                icon={MapPin}
                label="Farm Settings"
                description="Name, address, CPH number, sectors and acreage"
                href="/settings/farm"
              />
              <SettingRow
                icon={Users}
                label="Staff Management"
                description="Invite team members and manage access"
                href="/staff"
              />
            </CardContent>
          </Card>
        </div>

        {/* Subscription & Modules */}
        <div>
          <h2 className="text-xs uppercase tracking-widest font-bold text-foreground/40 mb-3 px-1">Subscription & Modules</h2>
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">Active Modules</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {activeModules.length} active
                </span>
              </div>
              {activeModules.length === 0 ? (
                <p className="text-xs text-muted-foreground pl-6">No modules loaded yet — visit the Dashboard to see your subscription.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {(activeModules as Array<Record<string, unknown>>).map((m, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-foreground/80">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                      <span className="truncate">{String(m.moduleName ?? m.moduleKey ?? "Module")}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Red Tractor Compliance */}
        <div>
          <h2 className="text-xs uppercase tracking-widest font-bold text-foreground/40 mb-3 px-1">Compliance</h2>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Red Tractor Scheme</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    BDE Farm Trac is designed to support Red Tractor audit compliance. 
                    Records must be retained for a minimum of 3 years. 
                    Use Print or Export on any module page to produce records for your assessor.
                  </p>
                  {farm && (
                    <div className="mt-3 flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Scheme: <span className="font-medium text-foreground">Red Tractor</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications — placeholder for future settings */}
        <div>
          <h2 className="text-xs uppercase tracking-widest font-bold text-foreground/40 mb-3 px-1">Notifications</h2>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">In-app Notifications</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Alerts for overdue inspections, expiring calibrations, and compliance reminders are shown via the bell icon. 
                    Notification preference settings are coming soon.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </AppLayout>
  );
}
