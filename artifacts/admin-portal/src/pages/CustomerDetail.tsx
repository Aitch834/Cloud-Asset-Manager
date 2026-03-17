import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { api, type Tenant, type Farm, type Subscription, type TenantUser } from "@/lib/api";
import { getSecret } from "@/lib/auth";
import { ArrowLeft, MapPin, CreditCard, Users, CheckCircle, XCircle, Building2 } from "lucide-react";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{title}</h2>
      {children}
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

  const mrrPence = subscriptions
    .filter((s) => s.status === "active")
    .length * 0;

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

      <Section title={`Farms (${farms.length})`}>
        {farms.length === 0 ? (
          <p className="text-sm text-muted-foreground">No farms registered.</p>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {farms.map((farm, i) => (
              <div
                key={farm.id}
                className={`px-5 py-4 flex items-start gap-3 ${i < farms.length - 1 ? "border-b border-border" : ""}`}
              >
                <Building2 className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
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
                </div>
                <div className="text-xs text-muted-foreground">
                  {subscriptions.filter((s) => s.farmId === farm.id).length} modules
                </div>
              </div>
            ))}
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
              <div
                key={user.userId}
                className={`px-5 py-3.5 flex items-center gap-3 ${i < users.length - 1 ? "border-b border-border" : ""}`}
              >
                <Users className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                {user.isActive ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-destructive" />
                )}
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
