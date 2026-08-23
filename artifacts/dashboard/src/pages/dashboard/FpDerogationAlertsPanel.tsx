import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { AlertTriangle, ArrowRight, ExternalLink } from "lucide-react";

type WeekAheadTask = {
  id: string;
  type: string;
  title: string;
  description: string;
  dueDate: string;
  module: string;
  href: string;
  colour: string;
};

function daysUntil(dateStr: string): number {
  const d = new Date(dateStr); d.setHours(0, 0, 0, 0);
  const t = new Date(); t.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - t.getTime()) / 86400000);
}

export function FpDerogationAlertsPanel({ farmId }: { farmId: number }) {
  const { data } = useQuery<{ tasks: WeekAheadTask[] }>({
    queryKey: ["week-ahead-fp-derog", farmId],
    queryFn: () =>
      fetch(`/api/farms/${farmId}/week-ahead?days=60`, { credentials: "include" }).then(r => r.json()),
    staleTime: 5 * 60_000,
    enabled: !!farmId,
  });

  const alerts = (data?.tasks ?? [])
    .filter(t => t.type === "organic_fp_derogation_expiry")
    .map(t => ({ ...t, days: daysUntil(t.dueDate) }))
    .sort((a, b) => a.days - b.days);

  if (alerts.length === 0) return null;

  const overdueCount = alerts.filter(a => a.days < 0).length;

  return (
    <Card className={`border-l-4 ${overdueCount > 0 ? "border-l-red-400" : "border-l-amber-400"}`}>
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className={`w-4 h-4 ${overdueCount > 0 ? "text-red-500" : "text-amber-500"}`} />
          <h3 className="font-bold text-base">FP Input Derogations Expiring</h3>
          {overdueCount > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
              {overdueCount} expired
            </span>
          )}
        </div>
        <Link href="/organic-fresh-produce?tab=input-derogations" className="text-xs text-primary font-medium inline-flex items-center gap-1 hover:underline">
          View all <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {alerts.slice(0, 5).map(alert => {
            const overdue = alert.days < 0;
            const dueToday = alert.days === 0;
            const expiryDate = new Date(alert.dueDate).toLocaleDateString("en-GB", {
              day: "numeric", month: "short", year: "numeric",
            });
            return (
              <Link key={alert.id} href="/organic-fresh-produce?tab=input-derogations">
                <div className={`px-6 py-4 flex items-center justify-between gap-4 hover:bg-black/[0.02] transition-colors cursor-pointer group ${overdue ? "bg-red-50/30" : ""}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${overdue ? "bg-red-100" : "bg-amber-50"}`}>
                      <AlertTriangle className={`w-4 h-4 ${overdue ? "text-red-500" : "text-amber-500"}`} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate ${overdue ? "text-red-800" : "text-foreground"}`}>
                        {/* Strip the "Overdue: " prefix — the badge conveys overdue state */}
                        {alert.title.replace(/^Overdue:\s*/i, "")}
                      </p>
                      <p className={`text-xs font-medium mt-0.5 flex items-center gap-1 ${overdue ? "text-red-600" : dueToday ? "text-amber-600" : "text-foreground/50"}`}>
                        <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                        {overdue ? "Expired" : "Expires"} {expiryDate}
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
                            : "bg-amber-50/60 text-amber-600"
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
        {alerts.length > 5 && (
          <div className="px-6 py-3 border-t border-border">
            <Link href="/organic-fresh-produce?tab=input-derogations" className="text-xs text-primary hover:underline underline-offset-2">
              View all {alerts.length} derogations expiring →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
