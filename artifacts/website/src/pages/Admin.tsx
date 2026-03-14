import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@workspace/replit-auth-web";
import { useLocation } from "wouter";
import { Loader2, Building2, MapPin, Users, CreditCard, Shield } from "lucide-react";

type TenantSummary = {
  id: number;
  name: string;
  slug: string;
  contactEmail: string;
  isActive: boolean;
  stripeCustomerId: string | null;
  createdAt: string;
};

type AdminStats = {
  totalTenants: number;
  totalFarms: number;
  activeSubscriptions: number;
  totalUsers: number;
};

export default function Admin() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  useEffect(() => {
    if (!isAuthenticated) return;

    Promise.all([
      fetch("/api/admin/tenants", { credentials: "include" }).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<{ tenants: TenantSummary[] }>;
      }),
      fetch("/api/admin/stats", { credentials: "include" }).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<{ stats: AdminStats }>;
      }),
    ])
      .then(([tenantsData, statsData]) => {
        setTenants(tenantsData.tenants);
        setStats(statsData.stats);
        setLoadingData(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load admin data");
        setLoadingData(false);
      });
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-forest" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <Shield className="w-12 h-12 text-red-500 mx-auto" />
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => setLocation("/")} variant="outline">
              Return Home
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[80vh] bg-secondary/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">BDE Super Admin</h1>
            <p className="text-muted-foreground mt-2">
              Platform management and tenant overview
            </p>
          </div>

          {loadingData ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-brand-forest" />
            </div>
          ) : (
            <>
              {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                  <StatCard icon={<Building2 className="w-5 h-5" />} label="Total Tenants" value={stats.totalTenants} />
                  <StatCard icon={<MapPin className="w-5 h-5" />} label="Total Farms" value={stats.totalFarms} />
                  <StatCard icon={<CreditCard className="w-5 h-5" />} label="Active Subscriptions" value={stats.activeSubscriptions} />
                  <StatCard icon={<Users className="w-5 h-5" />} label="Total Users" value={stats.totalUsers} />
                </div>
              )}

              <div className="bg-white rounded-xl border border-border shadow-sm">
                <div className="p-6 border-b border-border">
                  <h2 className="text-lg font-semibold">All Tenants</h2>
                </div>
                {tenants.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground">
                    No tenants registered yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-muted-foreground border-b border-border">
                          <th className="p-4">Name</th>
                          <th className="p-4">Slug</th>
                          <th className="p-4">Email</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Billing</th>
                          <th className="p-4">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tenants.map((t) => (
                          <tr key={t.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                            <td className="p-4 font-medium">{t.name}</td>
                            <td className="p-4 text-sm text-muted-foreground">{t.slug}</td>
                            <td className="p-4 text-sm">{t.contactEmail}</td>
                            <td className="p-4">
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${t.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                {t.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="p-4 text-sm">
                              {t.stripeCustomerId ? (
                                <span className="text-green-600">Connected</span>
                              ) : (
                                <span className="text-muted-foreground">Not connected</span>
                              )}
                            </td>
                            <td className="p-4 text-sm text-muted-foreground">
                              {new Date(t.createdAt).toLocaleDateString("en-GB")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-brand-forest">{icon}</div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="text-3xl font-bold text-foreground">{value}</p>
    </div>
  );
}
