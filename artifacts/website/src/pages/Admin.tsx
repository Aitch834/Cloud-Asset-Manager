import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@workspace/replit-auth-web";
import { useLocation } from "wouter";
import { Loader2, Building2, MapPin, Users, CreditCard, Shield, ChevronDown, ChevronUp, Tractor, Package, MessageSquare, UserCheck } from "lucide-react";

type TenantSummary = {
  id: number;
  name: string;
  slug: string;
  contactEmail: string;
  isActive: boolean;
  stripeCustomerId: string | null;
  createdAt: string;
};

type TenantDetail = {
  tenant: TenantSummary;
  farms: Array<{
    id: number;
    name: string;
    postcode: string | null;
    cphNumber: string | null;
    totalAcreage: number | null;
    sectorArable: boolean;
    sectorBeef: boolean;
    sectorDairy: boolean;
    sectorPigs: boolean;
    sectorPoultry: boolean;
    sectorHorticulture: boolean;
    isActive: boolean;
  }>;
  subscriptions: Array<{
    id: number;
    farmId: number;
    moduleId: number;
    moduleName: string;
    status: string;
    currentPeriodEnd: string | null;
  }>;
  users: Array<{
    userId: string;
    roleId: number;
    isActive: boolean;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
  }>;
};

type SupportTicketItem = {
  id: number;
  name: string;
  email: string;
  subject: string;
  description: string;
  status: string;
  createdAt: string;
};

type AdminStats = {
  totalTenants: number;
  totalFarms: number;
  activeSubscriptions: number;
  totalUsers: number;
};

type AdminTab = "tenants" | "tickets";

export default function Admin() {
  const { isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTenantId, setExpandedTenantId] = useState<number | null>(null);
  const [tenantDetails, setTenantDetails] = useState<Record<number, TenantDetail>>({});
  const [loadingDetail, setLoadingDetail] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>("tenants");
  const [impersonating, setImpersonating] = useState<{ userId: string; email: string | null; tenantId: number } | null>(null);

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
      fetch("/api/admin/support-tickets", { credentials: "include" }).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<{ tickets: SupportTicketItem[] }>;
      }),
    ])
      .then(([tenantsData, statsData, ticketsData]) => {
        setTenants(tenantsData.tenants);
        setStats(statsData.stats);
        setTickets(ticketsData.tickets);
        setLoadingData(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load admin data");
        setLoadingData(false);
      });
  }, [isAuthenticated]);

  const toggleTenantDetail = async (tenantId: number) => {
    if (expandedTenantId === tenantId) {
      setExpandedTenantId(null);
      return;
    }

    setExpandedTenantId(tenantId);

    if (tenantDetails[tenantId]) return;

    setLoadingDetail(tenantId);
    try {
      const r = await fetch(`/api/admin/tenants/${tenantId}`, { credentials: "include" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json() as TenantDetail;
      setTenantDetails((prev) => ({ ...prev, [tenantId]: data }));
    } catch {
      setTenantDetails((prev) => ({ ...prev, [tenantId]: { tenant: tenants.find((t) => t.id === tenantId)!, farms: [], subscriptions: [], users: [] } }));
    }
    setLoadingDetail(null);
  };

  const handleImpersonate = async (userId: string, tenantId: number) => {
    try {
      const r = await fetch("/api/admin/impersonate", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, tenantId }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json() as { impersonation: { userId: string; email: string | null; tenantId: number } };
      setImpersonating(data.impersonation);
    } catch {
      alert("Failed to start impersonation");
    }
  };

  const stopImpersonating = () => {
    setImpersonating(null);
  };

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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">BDE Super Admin</h1>
              <p className="text-muted-foreground mt-2">
                Platform management and tenant overview
              </p>
            </div>
            {impersonating && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 flex items-center gap-3">
                <UserCheck className="w-4 h-4 text-amber-600" />
                <div className="text-sm">
                  <span className="font-medium text-amber-800">Impersonating:</span>{" "}
                  <span className="text-amber-700">{impersonating.email || impersonating.userId}</span>
                </div>
                <Button size="sm" variant="outline" onClick={stopImpersonating} className="text-amber-700 border-amber-300 h-7">
                  Stop
                </Button>
              </div>
            )}
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

              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setActiveTab("tenants")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "tenants" ? "bg-brand-forest text-white" : "bg-white border border-border text-foreground hover:bg-secondary"}`}
                >
                  Tenants ({tenants.length})
                </button>
                <button
                  onClick={() => setActiveTab("tickets")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "tickets" ? "bg-brand-forest text-white" : "bg-white border border-border text-foreground hover:bg-secondary"}`}
                >
                  Support Tickets ({tickets.length})
                </button>
              </div>

              {activeTab === "tenants" && (
                <div className="bg-white rounded-xl border border-border shadow-sm">
                  <div className="p-6 border-b border-border">
                    <h2 className="text-lg font-semibold">All Tenants</h2>
                  </div>
                  {tenants.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                      No tenants registered yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {tenants.map((t) => (
                        <div key={t.id}>
                          <button
                            onClick={() => toggleTenantDetail(t.id)}
                            className="w-full text-left p-4 hover:bg-secondary/50 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{t.name}</div>
                                <div className="text-sm text-muted-foreground">{t.slug} &middot; {t.contactEmail}</div>
                              </div>
                              <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${t.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                {t.isActive ? "Active" : "Inactive"}
                              </span>
                              <span className="text-sm text-muted-foreground whitespace-nowrap">
                                {t.stripeCustomerId ? "Billing connected" : "No billing"}
                              </span>
                              <span className="text-sm text-muted-foreground whitespace-nowrap">
                                {new Date(t.createdAt).toLocaleDateString("en-GB")}
                              </span>
                            </div>
                            {expandedTenantId === t.id ? <ChevronUp className="w-4 h-4 text-muted-foreground ml-2" /> : <ChevronDown className="w-4 h-4 text-muted-foreground ml-2" />}
                          </button>

                          {expandedTenantId === t.id && (
                            <div className="px-4 pb-4 bg-secondary/20">
                              {loadingDetail === t.id ? (
                                <div className="flex justify-center py-6">
                                  <Loader2 className="w-6 h-6 animate-spin text-brand-forest" />
                                </div>
                              ) : tenantDetails[t.id] ? (
                                <TenantDetailView detail={tenantDetails[t.id]} onImpersonate={(userId) => handleImpersonate(userId, t.id)} />
                              ) : null}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "tickets" && (
                <div className="bg-white rounded-xl border border-border shadow-sm">
                  <div className="p-6 border-b border-border">
                    <h2 className="text-lg font-semibold">Support Tickets</h2>
                  </div>
                  {tickets.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                      No support tickets yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-sm text-muted-foreground border-b border-border">
                            <th className="p-4">ID</th>
                            <th className="p-4">Subject</th>
                            <th className="p-4">From</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Created</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tickets.map((ticket) => (
                            <tr key={ticket.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                              <td className="p-4 text-sm font-mono">#{ticket.id}</td>
                              <td className="p-4">
                                <div className="font-medium text-sm">{ticket.subject}</div>
                                <div className="text-xs text-muted-foreground truncate max-w-xs">{ticket.description}</div>
                              </td>
                              <td className="p-4 text-sm">
                                <div>{ticket.name}</div>
                                <div className="text-xs text-muted-foreground">{ticket.email}</div>
                              </td>
                              <td className="p-4">
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${ticket.status === "open" ? "bg-yellow-100 text-yellow-700" : ticket.status === "resolved" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                                  {ticket.status}
                                </span>
                              </td>
                              <td className="p-4 text-sm text-muted-foreground">
                                {new Date(ticket.createdAt).toLocaleDateString("en-GB")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

function TenantDetailView({ detail, onImpersonate }: { detail: TenantDetail; onImpersonate: (userId: string) => void }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-4">
      <div className="bg-white rounded-lg border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Tractor className="w-4 h-4 text-brand-forest" />
          <h3 className="font-semibold text-sm">Farms ({detail.farms.length})</h3>
        </div>
        {detail.farms.length === 0 ? (
          <p className="text-sm text-muted-foreground">No farms registered</p>
        ) : (
          <div className="space-y-2">
            {detail.farms.map((f) => (
              <div key={f.id} className="text-sm border-b border-border/50 pb-2 last:border-0">
                <div className="font-medium">{f.name}</div>
                <div className="text-muted-foreground text-xs">
                  {f.postcode && <span>{f.postcode} &middot; </span>}
                  {f.cphNumber && <span>CPH: {f.cphNumber} &middot; </span>}
                  {f.totalAcreage && <span>{f.totalAcreage} acres</span>}
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {f.sectorArable && <SectorBadge label="Arable" />}
                  {f.sectorBeef && <SectorBadge label="Beef" />}
                  {f.sectorDairy && <SectorBadge label="Dairy" />}
                  {f.sectorPigs && <SectorBadge label="Pigs" />}
                  {f.sectorPoultry && <SectorBadge label="Poultry" />}
                  {f.sectorHorticulture && <SectorBadge label="Horticulture" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Package className="w-4 h-4 text-brand-forest" />
          <h3 className="font-semibold text-sm">Subscriptions ({detail.subscriptions.length})</h3>
        </div>
        {detail.subscriptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active subscriptions</p>
        ) : (
          <div className="space-y-2">
            {detail.subscriptions.map((s) => (
              <div key={s.id} className="text-sm border-b border-border/50 pb-2 last:border-0">
                <div className="font-medium">{s.moduleName}</div>
                <div className="text-muted-foreground text-xs">
                  Farm ID: {s.farmId} &middot;
                  <span className={`ml-1 ${s.status === "active" ? "text-green-600" : "text-red-500"}`}>{s.status}</span>
                  {s.currentPeriodEnd && <span> &middot; Renews {new Date(s.currentPeriodEnd).toLocaleDateString("en-GB")}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-brand-forest" />
          <h3 className="font-semibold text-sm">Users ({detail.users.length})</h3>
        </div>
        {detail.users.length === 0 ? (
          <p className="text-sm text-muted-foreground">No users assigned</p>
        ) : (
          <div className="space-y-2">
            {detail.users.map((u) => (
              <div key={u.userId} className="text-sm border-b border-border/50 pb-2 last:border-0 flex items-center justify-between">
                <div>
                  <div className="font-medium">{u.firstName} {u.lastName}</div>
                  <div className="text-muted-foreground text-xs">
                    {u.email} &middot;
                    <span className={`ml-1 ${u.isActive ? "text-green-600" : "text-red-500"}`}>{u.isActive ? "Active" : "Inactive"}</span>
                  </div>
                </div>
                <button
                  onClick={() => onImpersonate(u.userId)}
                  className="text-xs text-brand-forest hover:underline flex items-center gap-1"
                  title="Impersonate this user"
                >
                  <UserCheck className="w-3 h-3" />
                  Impersonate
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
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

function SectorBadge({ label }: { label: string }) {
  return (
    <span className="text-xs bg-brand-forest/10 text-brand-forest px-1.5 py-0.5 rounded">
      {label}
    </span>
  );
}
