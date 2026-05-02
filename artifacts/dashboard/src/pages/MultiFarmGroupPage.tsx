import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/hooks/use-app-store";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Building2, MapPin, Wheat, ChevronRight, TrendingUp, Shield } from "lucide-react";
import { Link } from "wouter";

interface FarmSummary {
  id: number;
  name: string;
  cphNumber: string | null;
  address: string | null;
  totalAcreage: number | null;
  complianceScore: number | null;
  sectorArable?: boolean;
  sectorDairy?: boolean;
  sectorBeef?: boolean;
  sectorSheep?: boolean;
  sectorPigs?: boolean;
  sectorPoultry?: boolean;
  redTractorId?: string | null;
}

function complianceColor(score: number | null): string {
  if (score === null) return "#9ca3af";
  if (score >= 90) return "#16a34a";
  if (score >= 70) return "#d97706";
  return "#dc2626";
}

function complianceBg(score: number | null): string {
  if (score === null) return "#f3f4f6";
  if (score >= 90) return "#f0fdf4";
  if (score >= 70) return "#fffbeb";
  return "#fef2f2";
}

function complianceBorder(score: number | null): string {
  if (score === null) return "#e5e7eb";
  if (score >= 90) return "#bbf7d0";
  if (score >= 70) return "#fcd34d";
  return "#fca5a5";
}

function sectorBadges(farm: FarmSummary): string[] {
  const out: string[] = [];
  if (farm.sectorArable) out.push("Arable");
  if (farm.sectorDairy) out.push("Dairy");
  if (farm.sectorBeef) out.push("Beef");
  if (farm.sectorSheep) out.push("Sheep");
  if (farm.sectorPigs) out.push("Pigs");
  if (farm.sectorPoultry) out.push("Poultry");
  return out;
}

export default function MultiFarmGroupPage() {
  const { setFarmId } = useAppStore();

  const farmsQ = useQuery<{ farms: FarmSummary[] }>({
    queryKey: ["tenant-farms-group"],
    queryFn: () => fetch("/api/tenants/current/farms").then(r => r.json()),
  });

  const dashboardsQ = useQuery<{ results: { farmId: number; complianceScore: number }[] }>({
    queryKey: ["group-dashboards"],
    queryFn: async () => {
      const farms: FarmSummary[] = farmsQ.data?.farms ?? [];
      const results = await Promise.all(
        farms.map(async f => {
          try {
            const d = await fetch(`/api/farms/${f.id}/dashboard`).then(r => r.json());
            return { farmId: f.id, complianceScore: d.complianceScore ?? 0 };
          } catch {
            return { farmId: f.id, complianceScore: 0 };
          }
        })
      );
      return { results };
    },
    enabled: !!farmsQ.data?.farms?.length,
  });

  const farms: FarmSummary[] = farmsQ.data?.farms ?? [];
  const scores: Record<number, number> = {};
  for (const r of dashboardsQ.data?.results ?? []) {
    scores[r.farmId] = r.complianceScore;
  }

  const avgScore = farms.length > 0
    ? Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Math.max(Object.values(scores).length, 1))
    : null;

  const allGood = farms.filter(f => (scores[f.id] ?? 0) >= 90).length;
  const needsAttention = farms.filter(f => (scores[f.id] ?? 100) < 70).length;
  const totalAcres = farms.reduce((sum, f) => sum + (f.totalAcreage ?? 0), 0);

  return (
    <AppLayout title="Group Overview">
      <div className="max-w-5xl space-y-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Multi-Farm Group Overview</h2>
          <p className="text-sm text-gray-500 mt-0.5">Consolidated compliance and status across all farms in your group.</p>
        </div>

        {/* Summary stats */}
        {farms.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-gray-900">{farms.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Farms in group</p>
            </div>
            <div className="bg-white border rounded-xl p-4 text-center">
              <p className="text-3xl font-bold" style={{ color: complianceColor(avgScore) }}>
                {avgScore !== null ? `${avgScore}%` : "—"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Avg compliance score</p>
            </div>
            <div className="bg-white border rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-700">{allGood}</p>
              <p className="text-xs text-gray-500 mt-0.5">Farms audit-ready (≥90%)</p>
            </div>
            <div className="bg-white border rounded-xl p-4 text-center">
              <p className="text-3xl font-bold" style={{ color: needsAttention > 0 ? "#dc2626" : "#9ca3af" }}>
                {totalAcres > 0 ? `${totalAcres.toLocaleString()}` : "—"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Total acres</p>
            </div>
          </div>
        )}

        {/* Alerts */}
        {needsAttention > 0 && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-800">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>{needsAttention} farm{needsAttention !== 1 ? "s" : ""}</strong> ha{needsAttention !== 1 ? "ve" : "s"} a compliance score below 70%. Review those farms to resolve outstanding issues before audit.</span>
          </div>
        )}

        {/* Farm cards */}
        {farmsQ.isLoading ? (
          <div className="grid gap-4">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : farms.length === 0 ? (
          <div className="border rounded-xl p-12 text-center text-gray-400">
            <Building2 className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No farms found</p>
            <p className="text-sm mt-1">You need at least one farm set up to use Group Overview.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">All Farms</h3>
            {farms.map(farm => {
              const score = scores[farm.id] ?? null;
              const loaded = dashboardsQ.isFetched;
              return (
                <div
                  key={farm.id}
                  className="bg-white border rounded-xl p-4 hover:shadow-sm transition-shadow"
                  style={{ borderColor: loaded ? complianceBorder(score) : "#e5e7eb" }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: loaded ? complianceBg(score) : "#f3f4f6" }}
                    >
                      <Wheat className="w-5 h-5" style={{ color: loaded ? complianceColor(score) : "#9ca3af" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-gray-900 text-sm">{farm.name}</span>
                        {farm.cphNumber && (
                          <span className="text-xs font-mono text-gray-400">CPH: {farm.cphNumber}</span>
                        )}
                        {sectorBadges(farm).map(s => (
                          <span key={s} className="text-xs bg-primary/8 text-primary px-2 py-0.5 rounded-full border border-primary/15">
                            {s}
                          </span>
                        ))}
                      </div>
                      {farm.address && (
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{farm.address}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      {loaded ? (
                        <div className="text-right">
                          <p className="text-2xl font-bold" style={{ color: complianceColor(score) }}>
                            {score !== null ? `${score}%` : "—"}
                          </p>
                          <p className="text-xs text-gray-400">compliance</p>
                          {score !== null && score >= 90 && (
                            <div className="flex items-center justify-end gap-1 mt-0.5">
                              <CheckCircle2 className="w-3 h-3 text-green-600" />
                              <span className="text-xs text-green-600 font-medium">Audit-ready</span>
                            </div>
                          )}
                          {score !== null && score < 70 && (
                            <div className="flex items-center justify-end gap-1 mt-0.5">
                              <AlertTriangle className="w-3 h-3 text-red-600" />
                              <span className="text-xs text-red-600 font-medium">Needs attention</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-12 h-10 bg-gray-100 rounded animate-pulse" />
                      )}
                      <button
                        onClick={() => setFarmId(farm.id)}
                        className="flex items-center gap-1.5 text-xs font-medium text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors"
                      >
                        View <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Compliance bar */}
                  {loaded && score !== null && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                        <span>Compliance score</span>
                        <span>{score}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${score}%`, backgroundColor: complianceColor(score) }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-6 text-xs text-gray-500 border rounded-lg px-4 py-2.5 bg-gray-50">
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-600 inline-block" />Audit-ready ≥90%</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />Review needed 70–89%</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />Attention required &lt;70%</div>
        </div>
      </div>
    </AppLayout>
  );
}
