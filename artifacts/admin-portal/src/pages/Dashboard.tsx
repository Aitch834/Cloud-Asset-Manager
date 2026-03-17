import { useEffect, useState } from "react";
import { api, type Stats } from "@/lib/api";
import { getSecret } from "@/lib/auth";
import { Users, Building2, CreditCard, UserCheck, TrendingUp } from "lucide-react";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  sub?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
    </div>
  );
}

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

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform-wide metrics at a glance.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-6 h-24 animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
          </div>

          {stats.mrrPence === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-800">
              <strong>Stripe not yet connected.</strong> MRR will show here once customer subscriptions are active.
              Add your <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-xs">STRIPE_SECRET_KEY</code> and{" "}
              <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-xs">STRIPE_WEBHOOK_SECRET</code> to the
              Replit Secrets panel to enable billing.
            </div>
          )}
        </>
      ) : (
        <p className="text-destructive">Failed to load stats.</p>
      )}
    </div>
  );
}
