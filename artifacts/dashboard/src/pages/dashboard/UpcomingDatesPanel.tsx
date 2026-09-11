import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { CalendarDays, ArrowRight, Landmark, ShieldCheck, Leaf, Tag } from "lucide-react";
import { organicInspectionAlertQueryOptions } from "./OrganicInspectionAlertPanel";

interface OrganicInspection {
  certifier: string;
  inspectionDate: string | null;
  nextDueDate: string | null;
}

export function UpcomingDatesPanel({ farmId, activeSubs }: { farmId: number; activeSubs: string[] }) {
  const now = new Date();
  const in60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

  const insuranceQ = useQuery({
    queryKey: ["insurance", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/insurance`).then(r => r.json()),
    select: d => d.records ?? [],
  });
  const grantsQ = useQuery({
    queryKey: ["grants", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/grants`).then(r => r.json()),
    select: d => d.records ?? [],
  });
  const organicCertQ = useQuery({
    queryKey: ["oa-cert", farmId],
    queryFn: async () => {
      const r = await fetch(`/api/farms/${farmId}/organic-arable/certification`, { credentials: "include" });
      if (!r.ok) return [];
      const d = await r.json();
      return (d.records ?? []).filter((c: any) => !["suspended", "withdrawn"].includes(c.status));
    },
  });
  const organicInspectionsQ = useQuery({
    ...organicInspectionAlertQueryOptions(farmId),
    enabled: activeSubs.includes("organic-compliance"),
  });

  const calvingQ = useQuery({
    queryKey: ["dairy-calving", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/dairy/calving-records`, { credentials: "include" }).then(r => r.json()),
    select: (d: any) => (d.records ?? []) as any[],
  });

  const insurance: any[] = insuranceQ.data ?? [];
  const grants: any[] = grantsQ.data ?? [];
  const organicCerts: any[] = organicCertQ.data ?? [];
  const organicInspections: OrganicInspection[] = organicInspectionsQ.data?.records ?? [];
  const calvings: any[] = calvingQ.data ?? [];

  type DateItem = { label: string; date: Date; daysUntil: number; href: string; type: string; urgent: boolean };

  const items: DateItem[] = [];

  for (const pol of insurance) {
    if (!pol.expiryDate) continue;
    const expiry = new Date(pol.expiryDate);
    if (expiry > in60Days) continue;
    const daysUntil = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    items.push({
      label: `${pol.policyType}${pol.insurer ? ` — ${pol.insurer}` : ""} renewal`,
      date: expiry,
      daysUntil,
      href: "/insurance",
      type: "Insurance",
      urgent: daysUntil <= 14,
    });
  }

  const activeGrants = grants.filter((g: any) => !["claimed", "rejected", "withdrawn"].includes(g.status));
  for (const grant of activeGrants) {
    if (grant.purchaseDeadline) {
      const d = new Date(grant.purchaseDeadline);
      if (d <= in60Days) {
        const daysUntil = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        items.push({ label: `${grant.schemeName} — purchase deadline`, date: d, daysUntil, href: "/grants", type: "Grant", urgent: daysUntil <= 14 });
      }
    }
    if (grant.claimDeadline) {
      const d = new Date(grant.claimDeadline);
      if (d <= in60Days) {
        const daysUntil = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        items.push({ label: `${grant.schemeName} — claim deadline`, date: d, daysUntil, href: "/grants", type: "Grant", urgent: daysUntil <= 14 });
      }
    }
  }

  // Calving tag deadlines: tag 1 within 36h of birth, tag 2 within 20 days
  for (const c of calvings) {
    if (c.calfOutcome !== "live") continue;
    const birthDate = new Date(c.calvingDate);
    const tag1Deadline = new Date(birthDate.getTime() + 36 * 60 * 60 * 1000);
    const tag2Deadline = new Date(birthDate.getTime() + 20 * 24 * 60 * 60 * 1000);
    const dam = c.cowEarTag ? ` (dam: ${c.cowEarTag})` : "";

    if (!c.calfEarTag && tag1Deadline <= in60Days) {
      const daysUntil = Math.ceil((tag1Deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      items.push({ label: `Calf tag 1 deadline${dam}`, date: tag1Deadline, daysUntil, href: "/dairy", type: "Calving", urgent: true });
    }
    if (!c.calfEarTag2 && tag2Deadline <= in60Days) {
      const daysUntil = Math.ceil((tag2Deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      items.push({ label: `Calf tag 2 deadline${dam}`, date: tag2Deadline, daysUntil, href: "/dairy", type: "Calving", urgent: daysUntil <= 3 });
    }
  }

  for (const cert of organicCerts) {
    const certifier: string = cert.certifier ?? "Organic cert";
    const addCertDate = (dateStr: string | null | undefined, label: string) => {
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (d > in60Days) return;
      const days = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      items.push({ label: `${label} — ${certifier}`, date: d, daysUntil: days, href: "/organic-arable", type: "Organic", urgent: days <= 14 });
    };
    addCertDate(cert.renewalDate, "Organic cert renewal");
    addCertDate(cert.nextInspectionDue, "Organic inspection due");
    if (cert.annualInspectionDate && new Date(cert.annualInspectionDate) > now)
      addCertDate(cert.annualInspectionDate, "Annual inspection");
  }

  // Only the latest inspection for each certifier represents the current live
  // deadline; older records' nextDueDates are historical.
  const latestInspectionByCertifier = new Map<string, OrganicInspection>();
  for (const inspection of organicInspections) {
    const existing = latestInspectionByCertifier.get(inspection.certifier);
    if (
      !existing ||
      (inspection.inspectionDate &&
        (!existing.inspectionDate || inspection.inspectionDate > existing.inspectionDate))
    ) {
      latestInspectionByCertifier.set(inspection.certifier, inspection);
    }
  }
  for (const inspection of latestInspectionByCertifier.values()) {
    if (!inspection.nextDueDate) continue;
    const d = new Date(inspection.nextDueDate);
    if (Number.isNaN(d.getTime()) || d > in60Days) continue;
    const daysUntil = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    items.push({
      label: `Organic inspection due — ${inspection.certifier || "Organic certifier"}`,
      date: d,
      daysUntil,
      href: "/organic?tab=inspections",
      type: "Organic",
      urgent: daysUntil <= 14,
    });
  }

  items.sort((a, b) => a.daysUntil - b.daysUntil);

  if (items.length === 0) {
    return (
      <Card>
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-lg">Upcoming Key Dates</h3>
          <CalendarDays className="w-5 h-5 text-foreground/40" />
        </div>
        <CardContent className="px-6 py-5">
          <p className="text-sm text-foreground/50">No upcoming deadlines in the next 60 days. <Link href="/week-ahead" className="text-primary underline-offset-2 hover:underline">Open Week Ahead planner →</Link></p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <h3 className="font-bold text-lg">Upcoming Key Dates</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-foreground/50">Next 60 days</span>
          <CalendarDays className="w-5 h-5 text-foreground/40" />
        </div>
      </div>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {items.slice(0, 6).map((item, i) => (
            <Link key={i} href={item.href}>
              <div className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-black/[0.02] transition-colors cursor-pointer group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.type === "Grant" ? "bg-violet-50" : item.type === "Organic" ? "bg-green-50" : item.type === "Calving" ? "bg-amber-50" : "bg-blue-50"}`}>
                    {item.type === "Grant"
                      ? <Landmark className={`w-4 h-4 ${item.urgent ? "text-red-500" : "text-violet-600"}`} />
                      : item.type === "Organic"
                        ? <Leaf className={`w-4 h-4 ${item.urgent ? "text-red-500" : "text-green-600"}`} />
                        : item.type === "Calving"
                          ? <Tag className={`w-4 h-4 ${item.urgent ? "text-red-500" : "text-amber-600"}`} />
                          : <ShieldCheck className={`w-4 h-4 ${item.urgent ? "text-red-500" : "text-blue-600"}`} />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.label}</p>
                    <p className="text-xs text-foreground/50">{item.date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${item.daysUntil < 0 ? "bg-red-100 text-red-700" : item.urgent ? "bg-red-50 text-red-600" : item.daysUntil <= 30 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                    {item.daysUntil < 0 ? `${Math.abs(item.daysUntil)}d overdue` : item.daysUntil === 0 ? "Today" : `${item.daysUntil}d`}
                  </span>
                  <ArrowRight className="w-4 h-4 text-foreground/20 group-hover:text-foreground/50 transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
        {items.length > 6 && (
          <div className="px-6 py-3 border-t border-border">
            <Link href="/week-ahead" className="text-xs text-primary hover:underline underline-offset-2">
              View all {items.length} upcoming dates in Week Ahead →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
