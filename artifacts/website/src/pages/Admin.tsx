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
  conversationHistory: string | null;
  status: string;
  createdAt: string;
};

type TicketMessage = {
  id: number;
  ticketId: number;
  senderType: string;
  senderId: string | null;
  message: string;
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
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketItem | null>(null);
  const [ticketMessages, setTicketMessages] = useState<TicketMessage[]>([]);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [loadingTicketDetail, setLoadingTicketDetail] = useState(false);

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

  const openTicketDetail = async (ticket: SupportTicketItem) => {
    setSelectedTicket(ticket);
    setReplyText("");
    setLoadingTicketDetail(true);
    try {
      const r = await fetch(`/api/admin/support-tickets/${ticket.id}`, { credentials: "include" });
      if (r.ok) {
        const data = await r.json() as { ticket: SupportTicketItem; messages: TicketMessage[] };
        setTicketMessages(data.messages);
      }
    } catch (err) {
      console.warn("Failed to load ticket detail:", err);
    }
    setLoadingTicketDetail(false);
  };

  const handleReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    setSendingReply(true);
    try {
      const r = await fetch(`/api/admin/support-tickets/${selectedTicket.id}/reply`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText.trim() }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json() as { message: TicketMessage };
      setTicketMessages((prev) => [...prev, data.message]);
      setReplyText("");
    } catch (err) {
      console.warn("Failed to send reply:", err);
      alert("Failed to send reply. Please try again.");
    }
    setSendingReply(false);
  };

  const handleUpdateTicketStatus = async (ticketId: number, newStatus: string) => {
    try {
      const r = await fetch(`/api/admin/support-tickets/${ticketId}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setTickets((prev) => prev.map((t) => t.id === ticketId ? { ...t, status: newStatus } : t));
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket((prev) => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      console.warn("Failed to update ticket status:", err);
      alert("Failed to update ticket status. Please try again.");
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
                <div className="space-y-4">
                  <div className="bg-white rounded-xl border border-border shadow-sm">
                    <div className="p-6 border-b border-border flex items-center justify-between">
                      <h2 className="text-lg font-semibold">Support Tickets</h2>
                      {selectedTicket && (
                        <Button variant="outline" size="sm" onClick={() => setSelectedTicket(null)}>
                          Back to List
                        </Button>
                      )}
                    </div>

                    {selectedTicket ? (
                      <div className="p-6 space-y-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold">{selectedTicket.subject}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              From: {selectedTicket.name} ({selectedTicket.email}) &middot; {new Date(selectedTicket.createdAt).toLocaleDateString("en-GB")}
                            </p>
                          </div>
                          <select
                            value={selectedTicket.status}
                            onChange={(e) => handleUpdateTicketStatus(selectedTicket.id, e.target.value)}
                            className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white"
                          >
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        </div>

                        <div className="bg-secondary/30 rounded-lg p-4">
                          <p className="text-sm font-medium text-muted-foreground mb-1">Original Message</p>
                          <p className="text-sm whitespace-pre-wrap">{selectedTicket.description}</p>
                        </div>

                        {selectedTicket.conversationHistory && (
                          <div className="bg-blue-50 rounded-lg p-4">
                            <p className="text-sm font-medium text-blue-700 mb-2">AI Chat History</p>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {(() => {
                                try {
                                  const history = JSON.parse(selectedTicket.conversationHistory) as Array<{ role: string; content: string }>;
                                  return history.map((msg, i) => (
                                    <div key={i} className={`text-sm p-2 rounded ${msg.role === "user" ? "bg-white" : "bg-blue-100"}`}>
                                      <span className="font-medium text-xs uppercase text-muted-foreground">{msg.role}: </span>
                                      {msg.content}
                                    </div>
                                  ));
                                } catch {
                                  return <p className="text-sm text-muted-foreground">Unable to parse chat history</p>;
                                }
                              })()}
                            </div>
                          </div>
                        )}

                        <div className="border-t border-border pt-4">
                          <p className="text-sm font-semibold mb-3">Replies</p>
                          {loadingTicketDetail ? (
                            <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-brand-forest" /></div>
                          ) : ticketMessages.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-2">No replies yet.</p>
                          ) : (
                            <div className="space-y-3 mb-4">
                              {ticketMessages.map((msg) => (
                                <div key={msg.id} className={`p-3 rounded-lg text-sm ${msg.senderType === "admin" ? "bg-green-50 border border-green-200" : "bg-gray-50 border border-gray-200"}`}>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-xs uppercase">{msg.senderType === "admin" ? "BDE Admin" : "Customer"}</span>
                                    <span className="text-xs text-muted-foreground">{new Date(msg.createdAt).toLocaleString("en-GB")}</span>
                                  </div>
                                  <p className="whitespace-pre-wrap">{msg.message}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex gap-2">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Type your reply..."
                              rows={3}
                              className="flex-1 border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest"
                            />
                            <Button
                              onClick={handleReply}
                              disabled={!replyText.trim() || sendingReply}
                              className="self-end"
                            >
                              {sendingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reply"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : tickets.length === 0 ? (
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
                              <th className="p-4"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {tickets.map((ticket) => (
                              <tr key={ticket.id} className="border-b border-border last:border-0 hover:bg-secondary/50 cursor-pointer" onClick={() => openTicketDetail(ticket)}>
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
                                <td className="p-4">
                                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
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
