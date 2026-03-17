import { useEffect, useState } from "react";
import { Link } from "wouter";
import { api, type Tenant } from "@/lib/api";
import { getSecret } from "@/lib/auth";
import { Search, ChevronRight, CheckCircle, XCircle, Building2 } from "lucide-react";

export default function Customers() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const secret = getSecret()!;

  useEffect(() => {
    api.getTenants(secret)
      .then((d) => setTenants(d.tenants))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = tenants.filter((t) =>
    `${t.name} ${t.contactEmail} ${t.slug}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Customers</h1>
        <p className="text-muted-foreground text-sm mt-1">All tenant accounts registered on the platform.</p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search by name, email or slug…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 h-10 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-card border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No customers found</p>
          <p className="text-sm mt-1">
            {tenants.length === 0 ? "No accounts registered yet." : "Try adjusting your search."}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {filtered.map((tenant, i) => (
            <Link key={tenant.id} href={`/customers/${tenant.id}`}>
              <div
                className={`flex items-center gap-4 px-5 py-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                  i < filtered.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-semibold text-sm">
                    {tenant.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">{tenant.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{tenant.contactEmail}</p>
                </div>
                <div className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                  {tenant.slug}
                </div>
                <div className="flex items-center gap-1">
                  {tenant.isActive ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive" />
                  )}
                  <span className={`text-xs font-medium ${tenant.isActive ? "text-green-600" : "text-destructive"}`}>
                    {tenant.isActive ? "Active" : "Suspended"}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
