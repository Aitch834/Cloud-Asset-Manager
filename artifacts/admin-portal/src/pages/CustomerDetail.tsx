import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { api, type Tenant, type Farm, type Subscription, type TenantUser } from "@/lib/api";
import { getSecret } from "@/lib/auth";
import { ArrowLeft, MapPin, CreditCard, Users, CheckCircle, XCircle, Building2, FileDown, Loader2, Mail, MailCheck, Bell, BellOff } from "lucide-react";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{title}</h2>
      {children}
    </div>
  );
}

function UserRow({ user, tenantId, isLast, onUpdated }: {
  user: TenantUser;
  tenantId: number;
  isLast: boolean;
  onUpdated: (updated: TenantUser) => void;
}) {
  const [saving, setSaving] = useState(false);

  async function toggleAlerts() {
    setSaving(true);
    try {
      const secret = getSecret();
      await api.updateUserReceiveAlerts(tenantId, user.userId, !user.receiveAlerts, secret);
      onUpdated({ ...user, receiveAlerts: !user.receiveAlerts });
    } catch {
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={`px-5 py-3.5 flex items-center gap-3 ${!isLast ? "border-b border-border" : ""}`}>
      <Users className="w-4 h-4 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        {user.roleName && (
          <p className="text-[11px] text-muted-foreground mt-0.5">{user.roleName}</p>
        )}
      </div>
      <button
        onClick={toggleAlerts}
        disabled={saving}
        title={user.receiveAlerts ? "Receives critical alerts — click to remove" : "Does not receive alerts — click to enable"}
        className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full transition-colors ${
          user.receiveAlerts
            ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        }`}
      >
        {saving ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : user.receiveAlerts ? (
          <Bell className="w-3 h-3" />
        ) : (
          <BellOff className="w-3 h-3" />
        )}
        {user.receiveAlerts ? "Receives alerts" : "No alerts"}
      </button>
      {user.isActive ? (
        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 text-destructive shrink-0" />
      )}
    </div>
  );
}

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "destructive" | "warning" }) {
  const colors = {
    default: "bg-muted text-muted-foreground",
    success: "bg-green-100 text-green-700",
    destructive: "bg-red-100 text-red-700",
    warning: "bg-amber-100 text-amber-700",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[variant]}`}>
      {children}
    </span>
  );
}

function statusVariant(status: string): "success" | "destructive" | "warning" | "default" {
  if (status === "active") return "success";
  if (status === "cancelled") return "destructive";
  if (status === "past_due") return "warning";
  return "default";
}

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const tenantId = parseInt(id, 10);
  const secret = getSecret()!;

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingFarmId, setDownloadingFarmId] = useState<number | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [emailingFarmId, setEmailingFarmId] = useState<number | null>(null);
  const [emailResult, setEmailResult] = useState<{ farmId: number; success: boolean; to?: string } | null>(null);

  useEffect(() => {
    api.getTenantDetail(tenantId, secret)
      .then((d) => {
        setTenant(d.tenant);
        setFarms(d.farms);
        setSubscriptions(d.subscriptions);
        setUsers(d.users);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tenantId]);

  const handleSendEmail = async (farm: Farm) => {
    setEmailingFarmId(farm.id);
    setEmailResult(null);
    try {
      const result = await api.sendSetupGuide(tenantId, farm.id, secret);
      setEmailResult({ farmId: farm.id, success: result.sent, to: result.to });
    } catch {
      setEmailResult({ farmId: farm.id, success: false });
    } finally {
      setEmailingFarmId(null);
    }
  };

  const handleDownloadGuide = async (farm: Farm) => {
    setDownloadingFarmId(farm.id);
    setDownloadError(null);
    try {
      const { blob, filename } = await api.downloadSetupGuide(tenantId, farm.id, secret);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadError(`Failed to generate guide for ${farm.name}. Please try again.`);
    } finally {
      setDownloadingFarmId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-card border border-border rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>Customer not found.</p>
        <Link href="/customers">
          <span className="text-primary text-sm underline cursor-pointer">Back to customers</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <Link href="/customers">
          <div className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Customers
          </div>
        </Link>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-primary font-bold text-lg">{tenant.name.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-bold text-foreground">{tenant.name}</h1>
                <Badge variant={tenant.isActive ? "success" : "destructive"}>
                  {tenant.isActive ? "Active" : "Suspended"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{tenant.contactEmail}</p>
              {tenant.contactPhone && (
                <p className="text-sm text-muted-foreground">{tenant.contactPhone}</p>
              )}
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p className="font-mono bg-muted px-2 py-1 rounded mb-1">{tenant.slug}</p>
              <p>Joined {new Date(tenant.createdAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</p>
              {tenant.stripeCustomerId && (
                <p className="mt-1 text-emerald-600 font-medium">Stripe connected</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {downloadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {downloadError}
        </div>
      )}

      <Section title={`Farms (${farms.length})`}>
        {farms.length === 0 ? (
          <p className="text-sm text-muted-foreground">No farms registered.</p>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {farms.map((farm, i) => {
              const farmSubs = subscriptions.filter((s) => s.farmId === farm.id && s.status === "active");
              const isDownloading = downloadingFarmId === farm.id;
              return (
                <div
                  key={farm.id}
                  className={`px-5 py-4 flex items-start gap-3 ${i < farms.length - 1 ? "border-b border-border" : ""}`}
                >
                  <Building2 className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{farm.name}</p>
                      {!farm.isActive && <Badge variant="destructive">Inactive</Badge>}
                      {farm.redTractorId && (
                        <Badge variant="success">RT: {farm.redTractorId}</Badge>
                      )}
                    </div>
                    {(farm.address || farm.postcode) && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {[farm.address, farm.postcode].filter(Boolean).join(", ")}
                      </p>
                    )}
                    {farmSubs.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {farmSubs.length} active module{farmSubs.length !== 1 ? "s" : ""}:{" "}
                        {farmSubs.map((s) => s.moduleName).join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 mt-0.5">
                    {/* Download PDF */}
                    <button
                      onClick={() => handleDownloadGuide(farm)}
                      disabled={isDownloading}
                      title="Download tailored setup guide PDF"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-primary border border-primary/30 rounded-lg px-3 py-1.5 hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDownloading
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <FileDown className="w-3.5 h-3.5" />
                      }
                      {isDownloading ? "Generating…" : "Setup Guide"}
                    </button>

                    {/* Email setup guide */}
                    {(() => {
                      const isSending = emailingFarmId === farm.id;
                      const sentResult = emailResult?.farmId === farm.id ? emailResult : null;
                      if (sentResult?.success) {
                        return (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 border border-green-300 rounded-lg px-3 py-1.5 bg-green-50">
                            <MailCheck className="w-3.5 h-3.5" />
                            Sent
                          </span>
                        );
                      }
                      return (
                        <button
                          onClick={() => handleSendEmail(farm)}
                          disabled={isSending}
                          title={`Email setup guide to ${tenant.contactEmail}`}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground border border-border rounded-lg px-3 py-1.5 hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSending
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Mail className="w-3.5 h-3.5" />
                          }
                          {isSending ? "Sending…" : "Email Guide"}
                          {sentResult && !sentResult.success && (
                            <span className="text-red-500 ml-1">(failed)</span>
                          )}
                        </button>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      <Section title={`Subscriptions (${subscriptions.length})`}>
        {subscriptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No subscriptions active.</p>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {subscriptions.map((sub, i) => {
              const farm = farms.find((f) => f.id === sub.farmId);
              return (
                <div
                  key={sub.id}
                  className={`px-5 py-3.5 flex items-center gap-3 ${i < subscriptions.length - 1 ? "border-b border-border" : ""}`}
                >
                  <CreditCard className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{sub.moduleName}</p>
                    {farm && <p className="text-xs text-muted-foreground">{farm.name}</p>}
                  </div>
                  <Badge variant={statusVariant(sub.status)}>{sub.status}</Badge>
                  {sub.currentPeriodEnd && (
                    <span className="text-xs text-muted-foreground">
                      Renews {new Date(sub.currentPeriodEnd).toLocaleDateString("en-GB")}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Section>

      <Section title={`Users (${users.length})`}>
        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground">No users found.</p>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {users.map((user, i) => (
              <UserRow
                key={user.userId}
                user={user}
                tenantId={tenantId}
                isLast={i === users.length - 1}
                onUpdated={(updated) =>
                  setUsers((prev) => prev.map((u) => (u.userId === updated.userId ? updated : u)))
                }
              />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
