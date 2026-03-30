import { useEffect, useState, useMemo } from "react";
import { Link } from "wouter";
import { api, type ReferralTenant } from "@/lib/api";
import { getSecret } from "@/lib/auth";
import {
  Gift, Search, Trophy, ChevronRight, CheckCircle, TrendingDown,
  Users, Star,
} from "lucide-react";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function Referrals() {
  const [tenants, setTenants] = useState<ReferralTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const secret = getSecret()!;

  useEffect(() => {
    api.getReferrals(secret)
      .then((d) => setTenants(d.tenants))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return tenants;
    const q = query.toLowerCase();
    return tenants.filter((t) =>
      `${t.name} ${t.slug} ${t.referralCode ?? ""}`.toLowerCase().includes(q)
    );
  }, [tenants, query]);

  const stats = useMemo(() => {
    const withCode = tenants.filter((t) => t.referralCode).length;
    const withReferral = tenants.filter((t) => t.referredBy).length;
    const topReferrers = [...tenants]
      .filter((t) => t.referralCount > 0)
      .sort((a, b) => b.referralCount - a.referralCount)
      .slice(0, 3);
    return { withCode, withReferral, topReferrers };
  }, [tenants]);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Referral Programme</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage referral codes, track attributed sign-ups, and reward customers who bring in new farms.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Codes Issued</p>
            <p className="text-2xl font-bold text-foreground mt-0.5">{loading ? "—" : stats.withCode}</p>
            <p className="text-xs text-muted-foreground mt-0.5">of {tenants.length} customers</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Referred Sign-Ups</p>
            <p className="text-2xl font-bold text-foreground mt-0.5">{loading ? "—" : stats.withReferral}</p>
            <p className="text-xs text-muted-foreground mt-0.5">customers arrived via referral</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Top Referrer</p>
            <p className="text-lg font-bold text-foreground mt-0.5 truncate">
              {loading ? "—" : stats.topReferrers[0]?.name ?? "None yet"}
            </p>
            {stats.topReferrers[0] && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {stats.topReferrers[0].referralCount} referral{stats.topReferrers[0].referralCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Top referrers leaderboard */}
      {!loading && stats.topReferrers.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-amber-600" />
            <p className="text-sm font-semibold text-amber-800">Top Referrers</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {stats.topReferrers.map((t, i) => (
              <Link key={t.id} href={`/customers/${t.id}`}>
                <div className="flex items-center gap-2 bg-white border border-amber-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-amber-50 transition-colors">
                  <span className="text-sm font-bold text-amber-700">#{i + 1}</span>
                  <span className="text-sm font-medium text-foreground">{t.name}</span>
                  <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold">
                    {t.referralCount} ref{t.referralCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search by name, slug or referral code…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 h-10 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-card border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Gift className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No customers found</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-0 text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-2.5 border-b border-border bg-muted/30">
            <span>Customer</span>
            <span className="px-4">Referral Code</span>
            <span className="px-4">Referred By</span>
            <span className="px-4">Referrals</span>
            <span className="px-4">Status</span>
          </div>
          {filtered.map((tenant, i) => (
            <Link key={tenant.id} href={`/customers/${tenant.id}`}>
              <div
                className={`grid grid-cols-[1fr_auto_auto_auto_auto] gap-0 items-center px-5 py-3.5 hover:bg-muted/50 cursor-pointer transition-colors ${
                  i < filtered.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{tenant.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{tenant.slug}</p>
                  <p className="text-xs text-muted-foreground">{fmtDate(tenant.createdAt)}</p>
                </div>
                <div className="px-4">
                  {tenant.referralCode ? (
                    <span className="font-mono font-bold text-sm tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded">
                      {tenant.referralCode}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">none</span>
                  )}
                </div>
                <div className="px-4">
                  {tenant.referredBy ? (
                    <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded text-foreground">
                      {tenant.referredBy}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>
                <div className="px-4 text-center">
                  {tenant.referralCount > 0 ? (
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                      <Users className="w-3 h-3" />
                      {tenant.referralCount}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">0</span>
                  )}
                </div>
                <div className="px-4 flex items-center gap-1.5 justify-end">
                  {tenant.cancelledAt ? (
                    <>
                      <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                      <span className="text-xs text-red-600 font-medium">Churned</span>
                    </>
                  ) : tenant.isActive ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-xs text-green-600 font-medium">Active</span>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">Suspended</span>
                  )}
                  <ChevronRight className="w-4 h-4 text-muted-foreground ml-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
