import { useEffect, useState } from "react";
import { api, type Stats, type WebsiteVisitDay } from "@/lib/api";
import { getSecret } from "@/lib/auth";
import {
  Users, Building2, CreditCard, UserCheck, TrendingUp,
  TrendingDown, BarChart3, Puzzle, AlertTriangle, Globe, CalendarDays, Activity,
} from "lucide-react";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
  alert,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  sub?: string;
  alert?: boolean;
}) {
  return (
    <div className={`bg-card border rounded-xl p-6 flex items-start gap-4 ${alert ? "border-red-200 bg-red-50/50" : "border-border"}`}>
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <p className={`text-2xl font-bold mt-0.5 ${alert ? "text-red-700" : "text-foreground"}`}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ── Mini bar chart for daily visit data ──────────────────────────────────────
function VisitSparkBar({ data }: { data: WebsiteVisitDay[] }) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        No visit data yet — visits will appear here once the website goes live.
      </p>
    );
  }
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  // Build a full 14-day array filling in zeros for missing days
  const days: WebsiteVisitDay[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const found = data.find((r) => r.date === dateStr);
    days.push({ date: dateStr, count: found?.count ?? 0 });
  }
  return (
    <div className="flex items-end gap-1 h-16 w-full mt-3">
      {days.map((day) => {
        const heightPct = Math.max((day.count / maxCount) * 100, day.count > 0 ? 8 : 3);
        const label = day.date.slice(5); // MM-DD
        return (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-0.5 group relative">
            <div
              className="w-full rounded-sm bg-emerald-500/80 group-hover:bg-emerald-600 transition-all"
              style={{ height: `${heightPct}%` }}
            />
            {/* tooltip on hover */}
            <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
              <div className="bg-foreground text-background text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">
                {label}: {day.count}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const SOURCE_COLORS = [
  "bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-amber-500",
  "bg-rose-500", "bg-cyan-500", "bg-orange-500", "bg-indigo-500",
];

const SECTOR_BAR_COLORS: Record<string, string> = {
  "Beef & Dairy": "bg-orange-500",
  "Sheep & Goat": "bg-amber-500",
  "Arable": "bg-yellow-500",
  "Viticulture": "bg-purple-500",
  "Mixed Farming": "bg-teal-500",
  "Agricultural Contracting": "bg-sky-500",
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const secret = getSecret()!;

  useEffect(() => {
    api.getStats(secret)
      .then((d) => setStats(d.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const mrr = stats ? (stats.mrrPence / 100).toFixed(2) : "—";
  const arr = stats ? ((stats.mrrPence * 12) / 100).toFixed(2) : "—";

  const totalLeads = stats?.leadSourceBreakdown?.reduce((s, e) => s + e.count, 0) ?? 0;
  const totalSectorLeads = stats?.sectorBreakdown?.reduce((s, e) => s + e.count, 0) ?? 0;
  const topModules = stats?.moduleAdoption?.filter((m) => m.activeCount > 0) ?? [];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform-wide metrics at a glance.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-6 h-24 animate-pulse" />
            ))}
          </div>
        </div>
      ) : stats ? (
        <div className="space-y-8">
          {/* Key metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              label="Customer Accounts"
              value={String(stats.totalTenants)}
              icon={Building2}
              color="bg-blue-50 text-blue-600"
              sub="Active tenants on the platform"
            />
            <StatCard
              label="Farm Instances"
              value={String(stats.totalFarms)}
              icon={Users}
              color="bg-green-50 text-green-600"
              sub="Across all customer accounts"
            />
            <StatCard
              label="Active Subscriptions"
              value={String(stats.activeSubscriptions)}
              icon={CreditCard}
              color="bg-violet-50 text-violet-600"
              sub="Module subscriptions"
            />
            <StatCard
              label="Platform Users"
              value={String(stats.totalUsers)}
              icon={UserCheck}
              color="bg-orange-50 text-orange-600"
              sub="Registered user accounts"
            />
            <StatCard
              label="Monthly Recurring Revenue"
              value={`£${mrr}`}
              icon={TrendingUp}
              color="bg-emerald-50 text-emerald-600"
              sub={`ARR: £${arr}`}
            />
            <StatCard
              label="Churned Customers"
              value={`${stats.churnedTenants} (${stats.churnRatePct}%)`}
              icon={TrendingDown}
              color={stats.churnedTenants > 0 ? "bg-red-100 text-red-600" : "bg-muted text-muted-foreground"}
              sub="Accounts cancelled to date"
              alert={stats.churnedTenants > 0}
            />
          </div>

          {stats.mrrPence === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-800 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
              <p>
                <strong>Stripe not yet connected.</strong> MRR will show here once customer subscriptions are active.
                Add your <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-xs">STRIPE_SECRET_KEY</code> and{" "}
                <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-xs">STRIPE_WEBHOOK_SECRET</code> to the
                Replit Secrets panel to enable billing.
              </p>
            </div>
          )}

          {/* Website Visits */}
          <div className="border border-border rounded-xl p-6 bg-card">
            <div className="flex items-center gap-2 mb-5">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Website Traffic</h2>
              <span className="ml-auto text-xs text-muted-foreground">
                {stats.websiteVisits?.total ?? 0} total visits
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-5">
              <div className="flex flex-col items-center bg-emerald-50 rounded-lg p-3">
                <Activity className="w-4 h-4 text-emerald-600 mb-1" />
                <span className="text-2xl font-bold text-emerald-700">{stats.websiteVisits?.today ?? 0}</span>
                <span className="text-xs text-muted-foreground mt-0.5">Today</span>
              </div>
              <div className="flex flex-col items-center bg-blue-50 rounded-lg p-3">
                <CalendarDays className="w-4 h-4 text-blue-600 mb-1" />
                <span className="text-2xl font-bold text-blue-700">{stats.websiteVisits?.thisWeek ?? 0}</span>
                <span className="text-xs text-muted-foreground mt-0.5">This week</span>
              </div>
              <div className="flex flex-col items-center bg-violet-50 rounded-lg p-3">
                <Globe className="w-4 h-4 text-violet-600 mb-1" />
                <span className="text-2xl font-bold text-violet-700">{stats.websiteVisits?.thisMonth ?? 0}</span>
                <span className="text-xs text-muted-foreground mt-0.5">This month</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Daily visits — last 14 days</p>
              <VisitSparkBar data={stats.websiteVisits?.dailyLast14 ?? []} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lead Source Breakdown */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Lead Source Breakdown</h2>
                <span className="ml-auto text-xs text-muted-foreground">{totalLeads} total</span>
              </div>
              {(stats.leadSourceBreakdown?.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No lead source data yet. Set sources on the Leads Pipeline page.
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.leadSourceBreakdown.map((entry, i) => {
                    const pct = totalLeads > 0 ? Math.round((entry.count / totalLeads) * 100) : 0;
                    const color = SOURCE_COLORS[i % SOURCE_COLORS.length];
                    return (
                      <div key={entry.source}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium text-foreground">{entry.source}</span>
                          <span className="text-muted-foreground">{entry.count} ({pct}%)</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${color} transition-all`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sector Breakdown */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Sector Breakdown</h2>
                <span className="ml-auto text-xs text-muted-foreground">
                  {totalSectorLeads} leads with sector set
                </span>
              </div>
              {(stats.sectorBreakdown?.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No sector data yet. Sectors are set when leads register on the website.
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.sectorBreakdown.map((entry) => {
                    const pct = totalSectorLeads > 0 ? Math.round((entry.count / totalSectorLeads) * 100) : 0;
                    const color = SECTOR_BAR_COLORS[entry.sector] ?? "bg-gray-400";
                    return (
                      <div key={entry.sector}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium text-foreground">{entry.sector}</span>
                          <span className="text-muted-foreground">{entry.count} ({pct}%)</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${color} transition-all`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Module Adoption */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <Puzzle className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Module Adoption</h2>
                <span className="ml-auto text-xs text-muted-foreground">active subscriptions</span>
              </div>
              {topModules.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No active module subscriptions yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {topModules.slice(0, 10).map((m) => {
                    const maxCount = topModules[0]?.activeCount ?? 1;
                    const pct = maxCount > 0 ? Math.round((m.activeCount / maxCount) * 100) : 0;
                    return (
                      <div key={m.moduleKey} className="flex items-center gap-3">
                        <span className="text-xs text-foreground font-medium w-44 truncate shrink-0">{m.moduleName}</span>
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary/70 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-6 text-right shrink-0">{m.activeCount}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-destructive">Failed to load stats.</p>
      )}
    </div>
  );
}
