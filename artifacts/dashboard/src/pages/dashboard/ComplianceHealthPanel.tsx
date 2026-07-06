import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Droplets, ShieldCheck, Leaf, Sprout, FileText, Warehouse, Package } from "lucide-react";

export function ComplianceHealthPanel({ farmId }: { farmId: number }) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const ninetyDays = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();

  const spraysQ = useQuery({ queryKey: ["spray-applications", farmId], queryFn: () => fetch(`/api/farms/${farmId}/spray-applications`).then(r => r.json()), select: d => d.records ?? [] });
  const productsQ = useQuery({ queryKey: ["spray-products", farmId], queryFn: () => fetch(`/api/farms/${farmId}/spray-products`).then(r => r.json()), select: d => d.records ?? [] });
  const plansQ = useQuery({ queryKey: ["nmp-plans", farmId], queryFn: () => fetch(`/api/farms/${farmId}/nmp-plans`).then(r => r.json()), select: d => d.records ?? [] });
  const docsQ = useQuery({ queryKey: ["documents", farmId], queryFn: () => fetch(`/api/farms/${farmId}/documents`).then(r => r.json()), select: d => d.records ?? [] });
  const fieldsQ = useQuery({ queryKey: ["fields", farmId], queryFn: () => fetch(`/api/farms/${farmId}/fields`).then(r => r.json()), select: d => d.records ?? [] });
  const insuranceQ = useQuery({ queryKey: ["insurance", farmId], queryFn: () => fetch(`/api/farms/${farmId}/insurance`).then(r => r.json()), select: d => d.records ?? [] });
  const slurryStoresQ = useQuery({ queryKey: ["slurry-stores", farmId], queryFn: () => fetch(`/api/farms/${farmId}/slurry-stores`).then(r => r.json()), select: d => d.records ?? [] });
  const slurryInspectionsQ = useQuery({ queryKey: ["slurry-store-inspections", farmId], queryFn: () => fetch(`/api/farms/${farmId}/slurry-store-inspections`).then(r => r.json()), select: d => d.records ?? [] });
  const seedSegChecksQ = useQuery({ queryKey: ["seed-storage-checks", farmId], queryFn: () => fetch(`/api/farms/${farmId}/seed-storage-checks`).then(r => r.json()), select: d => d.records ?? [] });

  const sprays: any[] = spraysQ.data ?? [];
  const products: any[] = productsQ.data ?? [];
  const plans: any[] = plansQ.data ?? [];
  const docs: any[] = docsQ.data ?? [];
  const fields: any[] = fieldsQ.data ?? [];
  const insurance: any[] = insuranceQ.data ?? [];
  const slurryStores: any[] = slurryStoresQ.data ?? [];
  const slurryInspections: any[] = slurryInspectionsQ.data ?? [];
  const seedSegChecks: any[] = seedSegChecksQ.data ?? [];

  const currentYear = now.getFullYear();

  const getInsuranceCheck = (type: "EL" | "PL") => {
    const label = type === "EL" ? "Employers Liability" : "Public Liability";
    const keywords = type === "EL" ? ["employers", "employer"] : ["public liability", "public"];
    const matches = insurance.filter(p =>
      keywords.some(kw => p.policyType?.toLowerCase().includes(kw))
    );
    if (matches.length === 0) return { status: "gap" as const, message: `No ${label} insurance on record — legally required` };
    const expired = matches.filter(p => p.expiryDate && new Date(p.expiryDate) < now);
    const expiring = matches.filter(p => p.expiryDate && new Date(p.expiryDate) >= now && new Date(p.expiryDate) <= new Date(ninetyDays));
    if (expired.length > 0) return { status: "gap" as const, message: `${label} policy expired — renew immediately` };
    if (expiring.length > 0) return { status: "warn" as const, message: `${label} policy expiring within 90 days` };
    return { status: "ok" as const, message: `${label} policy current` };
  };

  const elCheck = getInsuranceCheck("EL");
  const plCheck = getInsuranceCheck("PL");

  const checks = [
    {
      label: "Employers Liability",
      ...elCheck,
      href: "/insurance",
      icon: ShieldCheck,
    },
    {
      label: "Public Liability",
      ...plCheck,
      href: "/insurance",
      icon: ShieldCheck,
    },
    {
      label: "Spray Applications",
      status: sprays.length > 0
        ? sprays.some(s => new Date(s.applicationDate) >= new Date(thirtyDaysAgo)) ? "ok" : "warn"
        : "gap",
      message: sprays.length === 0
        ? "No spray records on file"
        : sprays.some(s => new Date(s.applicationDate) >= new Date(thirtyDaysAgo))
          ? `${sprays.length} total application${sprays.length !== 1 ? "s" : ""} recorded`
          : "Last application over 30 days ago — confirm records are up to date",
      href: "/sprays",
      icon: Droplets,
    },
    {
      label: "Product Register",
      status: products.length > 0 ? "ok" : "gap",
      message: products.length === 0
        ? "No products registered — required before logging applications"
        : `${products.length} product${products.length !== 1 ? "s" : ""} registered`,
      href: "/sprays",
      icon: Droplets,
    },
    {
      label: `NMP ${currentYear}`,
      status: plans.some(p => p.planYear === currentYear || p.planYear === String(currentYear))
        ? "ok"
        : plans.some(p => p.planYear === currentYear - 1 || p.planYear === String(currentYear - 1))
          ? "warn"
          : "gap",
      message: plans.some(p => p.planYear === currentYear || p.planYear === String(currentYear))
        ? `${currentYear} Nutrient Management Plan on record`
        : plans.some(p => p.planYear === currentYear - 1 || p.planYear === String(currentYear - 1))
          ? `Only ${currentYear - 1} NMP on file — ${currentYear} plan needed`
          : "No Nutrient Management Plan for the current year",
      href: "/nmp",
      icon: Leaf,
    },
    {
      label: "Field Coverage",
      status: fields.length === 0 ? "warn" : plans.length === 0 ? "gap" : "ok",
      message: fields.length === 0
        ? "No fields registered yet"
        : plans.length === 0
          ? `${fields.length} field${fields.length !== 1 ? "s" : ""} registered — no NMP entries`
          : `${fields.length} field${fields.length !== 1 ? "s" : ""} — verify all covered in NMP`,
      href: "/nmp",
      icon: Sprout,
    },
    {
      label: "Document Register",
      status: (() => {
        if (docs.length === 0) return "gap";
        const expired = docs.filter(d => d.expiryDate && new Date(d.expiryDate) < now).length;
        if (expired > 0) return "gap";
        const expiring = docs.filter(d => d.expiryDate && new Date(d.expiryDate) > now && new Date(d.expiryDate) < new Date(ninetyDays)).length;
        if (expiring > 0) return "warn";
        return "ok";
      })() as "ok" | "warn" | "gap",
      message: (() => {
        if (docs.length === 0) return "No documents in register — add certificates and compliance records";
        const expired = docs.filter(d => d.expiryDate && new Date(d.expiryDate) < now).length;
        if (expired > 0) return `${expired} expired document${expired !== 1 ? "s" : ""} — renew immediately`;
        const expiring = docs.filter(d => d.expiryDate && new Date(d.expiryDate) > now && new Date(d.expiryDate) < new Date(ninetyDays)).length;
        if (expiring > 0) return `${expiring} document${expiring !== 1 ? "s" : ""} expiring within 90 days`;
        return `${docs.length} document${docs.length !== 1 ? "s" : ""} on record — all valid`;
      })(),
      href: "/documents",
      icon: FileText,
    },
    {
      label: "Spray Operator Certs",
      status: (() => {
        const certs = docs.filter(d => d.documentType === "Spray Operator Certificate (PA1/PA6)");
        if (certs.length === 0) return "warn";
        return certs.filter(d => d.expiryDate && new Date(d.expiryDate) < now).length > 0 ? "gap" : "ok";
      })() as "ok" | "warn" | "gap",
      message: (() => {
        const certs = docs.filter(d => d.documentType === "Spray Operator Certificate (PA1/PA6)");
        if (certs.length === 0) return "No PA1/PA6 certificates on record — required for spray operators";
        const expired = certs.filter(d => d.expiryDate && new Date(d.expiryDate) < now).length;
        return expired > 0 ? `${expired} operator certificate${expired !== 1 ? "s" : ""} expired` : `${certs.length} operator certificate${certs.length !== 1 ? "s" : ""} on record`;
      })(),
      href: "/documents",
      icon: FileText,
    },
    {
      label: "Silage & Silo Safety",
      status: (() => {
        const clamps = slurryStores.filter((s: any) => s.storeType === "Silage Clamp");
        if (clamps.length === 0) return "ok";
        const clampIds = new Set(clamps.map((c: any) => c.id));
        const clampInspections = slurryInspections.filter((i: any) => clampIds.has(i.storeId));
        if (clampInspections.length === 0) return "gap";
        const latest = clampInspections.reduce((max: any, i: any) => !max || new Date(i.inspectionDate) > new Date(max.inspectionDate) ? i : max, null);
        const twelveMonthsAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        return latest && new Date(latest.inspectionDate) < twelveMonthsAgo ? "warn" : "ok";
      })() as "ok" | "warn" | "gap",
      message: (() => {
        const clamps = slurryStores.filter((s: any) => s.storeType === "Silage Clamp");
        if (clamps.length === 0) return "No silage clamps registered";
        const clampIds = new Set(clamps.map((c: any) => c.id));
        const clampInspections = slurryInspections.filter((i: any) => clampIds.has(i.storeId));
        if (clampInspections.length === 0) return `${clamps.length} silage clamp${clamps.length !== 1 ? "s" : ""} registered — no safety inspections logged`;
        const latest = clampInspections.reduce((max: any, i: any) => !max || new Date(i.inspectionDate) > new Date(max.inspectionDate) ? i : max, null);
        const twelveMonthsAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        if (latest && new Date(latest.inspectionDate) < twelveMonthsAgo) return `Last silo inspection was ${new Date(latest.inspectionDate).toLocaleDateString("en-GB")} — over 12 months ago`;
        return `${clampInspections.length} silo inspection${clampInspections.length !== 1 ? "s" : ""} on record`;
      })(),
      href: "/environmental-management?tab=silage",
      icon: Warehouse,
    },
    {
      label: "Seed Storage Segregation",
      status: (() => {
        if (seedSegChecks.length === 0) return "gap";
        const nonCompliant = seedSegChecks.filter((c: any) => c.isCompliant === false || c.treatedSeedStoredLoose === true).length;
        if (nonCompliant > 0) return "gap";
        const twelveMonthsAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        const latest = seedSegChecks.reduce((max: any, c: any) => !max || new Date(c.checkDate) > new Date(max.checkDate) ? c : max, null);
        return latest && new Date(latest.checkDate) < twelveMonthsAgo ? "warn" : "ok";
      })() as "ok" | "warn" | "gap",
      message: (() => {
        if (seedSegChecks.length === 0) return "No CR.ST.19 segregation checks on record — treated seed must be segregated from stored grain";
        const nonCompliant = seedSegChecks.filter((c: any) => c.isCompliant === false || c.treatedSeedStoredLoose === true).length;
        if (nonCompliant > 0) return `${nonCompliant} check${nonCompliant !== 1 ? "s" : ""} flagged non-compliant — resolve segregation`;
        const twelveMonthsAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        const latest = seedSegChecks.reduce((max: any, c: any) => !max || new Date(c.checkDate) > new Date(max.checkDate) ? c : max, null);
        if (latest && new Date(latest.checkDate) < twelveMonthsAgo) return `Last check was ${new Date(latest.checkDate).toLocaleDateString("en-GB")} — over 12 months ago`;
        return `${seedSegChecks.length} segregation check${seedSegChecks.length !== 1 ? "s" : ""} on record — all compliant`;
      })(),
      href: "/seed-store?tab=segregation",
      icon: Package,
    },
  ] as { label: string; status: "ok" | "warn" | "gap"; message: string; href: string; icon: React.ComponentType<{ className?: string }> }[];

  const okCount = checks.filter(c => c.status === "ok").length;
  const gapCount = checks.filter(c => c.status === "gap").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Compliance Health</h3>
        <div className="flex items-center gap-3 text-sm">
          <span className={`font-semibold ${gapCount > 0 ? "text-red-600" : "text-foreground/50"}`}>
            {gapCount > 0 ? `${gapCount} gap${gapCount !== 1 ? "s" : ""}` : ""}
          </span>
          <span className="text-foreground/50">{okCount}/{checks.length} passing</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {checks.map((check) => {
          const Icon = check.icon;
          const cfg = {
            ok: { bg: "bg-emerald-50", border: "border-emerald-100", iconBg: "bg-emerald-100", iconColor: "text-emerald-600", dot: "bg-emerald-500", label: "OK", labelColor: "text-emerald-700" },
            warn: { bg: "bg-amber-50", border: "border-amber-100", iconBg: "bg-amber-100", iconColor: "text-amber-600", dot: "bg-amber-500", label: "Attention", labelColor: "text-amber-700" },
            gap: { bg: "bg-red-50", border: "border-red-100", iconBg: "bg-red-100", iconColor: "text-red-600", dot: "bg-red-500", label: "Action Required", labelColor: "text-red-700" },
          }[check.status];
          return (
            <Link key={check.label} href={check.href}>
              <div className={`p-4 rounded-xl border ${cfg.bg} ${cfg.border} hover:shadow-sm transition-all cursor-pointer group h-full`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg ${cfg.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="text-xs font-semibold text-foreground/70">{check.label}</span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.labelColor}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-foreground/65 leading-snug">{check.message}</p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
