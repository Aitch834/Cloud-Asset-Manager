import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ShieldCheck, ArrowRight, ExternalLink, AlertTriangle } from "lucide-react";
import {
  getOrganicInspectionAlerts,
  type OrganicInspectionAlertRecord,
} from "@/lib/organic-inspection-alert";

type OrganicInspectionResponse = { records: OrganicInspectionAlertRecord[] };

export function organicInspectionAlertQueryOptions(farmId: number) {
  return {
    queryKey: ["organic-inspections-alert", farmId] as const,
    queryFn: async (): Promise<OrganicInspectionResponse> => {
      const response = await fetch(`/api/farms/${farmId}/organic/inspections`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to load organic inspections");
      return response.json();
    },
    staleTime: 5 * 60_000,
    retry: false,
    enabled: !!farmId,
  };
}

export function OrganicInspectionAlertPanel({ farmId }: { farmId: number }) {
  const { data } = useQuery(organicInspectionAlertQueryOptions(farmId));

  return <OrganicInspectionAlertContent records={data?.records} />;
}

export function OrganicInspectionAlertContent({
  records,
}: {
  records?: OrganicInspectionAlertRecord[];
}) {
  const alerts = getOrganicInspectionAlerts(
    records ?? [],
  );

  if (alerts.length === 0) return null;

  const overdueCount = alerts.filter(a => a.days < 0).length;
  const isUrgent = alerts[0].days <= 14;

  return (
    <Card className={`border-l-4 ${overdueCount > 0 ? "border-l-red-400" : isUrgent ? "border-l-amber-400" : "border-l-green-400"}`}>
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          {overdueCount > 0 || isUrgent
            ? <AlertTriangle className={`w-4 h-4 ${overdueCount > 0 ? "text-red-500" : "text-amber-500"}`} />
            : <ShieldCheck className="w-4 h-4 text-green-600" />
          }
          <h3 className="font-bold text-base">Organic Inspection Due</h3>
          {overdueCount > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
              {overdueCount} overdue
            </span>
          )}
        </div>
        <Link href="/organic?tab=inspections" className="text-xs text-primary font-medium inline-flex items-center gap-1 hover:underline">
          View register <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {alerts.slice(0, 3).map(alert => {
            const overdue = alert.days < 0;
            const dueToday = alert.days === 0;
            const dueDateStr = new Date(alert.nextDueDate!).toLocaleDateString("en-GB", {
              day: "numeric", month: "long", year: "numeric",
            });
            return (
              <Link key={alert.id} href="/organic?tab=inspections">
                <div className={`px-6 py-4 flex items-center justify-between gap-4 hover:bg-black/[0.02] transition-colors cursor-pointer group ${overdue ? "bg-red-50/30" : ""}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${overdue ? "bg-red-100" : isUrgent ? "bg-amber-50" : "bg-green-50"}`}>
                      {overdue || isUrgent
                        ? <AlertTriangle className={`w-4 h-4 ${overdue ? "text-red-500" : "text-amber-500"}`} />
                        : <ShieldCheck className="w-4 h-4 text-green-600" />
                      }
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate ${overdue ? "text-red-800" : "text-foreground"}`}>
                        {alert.certifier}
                      </p>
                      <p className={`text-xs mt-0.5 ${overdue ? "text-red-600 font-medium" : dueToday ? "text-amber-600 font-medium" : "text-foreground/50"}`}>
                        {overdue ? "Overdue — was due" : "Next inspection due"} {dueDateStr}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                      overdue
                        ? "bg-red-100 text-red-700"
                        : dueToday
                          ? "bg-amber-100 text-amber-700"
                          : alert.days <= 14
                            ? "bg-amber-50 text-amber-700"
                            : "bg-green-50 text-green-700"
                    }`}>
                      {overdue
                        ? `${Math.abs(alert.days)}d overdue`
                        : dueToday
                          ? "Today"
                          : `${alert.days}d`}
                    </span>
                    <ArrowRight className="w-4 h-4 text-foreground/20 group-hover:text-foreground/50 transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        {alerts.length > 3 && (
          <div className="px-6 py-3 border-t border-border">
            <Link href="/organic?tab=inspections" className="text-xs text-primary hover:underline underline-offset-2">
              View all {alerts.length} upcoming inspections →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
