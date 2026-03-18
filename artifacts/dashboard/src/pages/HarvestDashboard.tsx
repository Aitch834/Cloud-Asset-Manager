import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLocation } from "wouter";
import { Wheat, Tractor, BarChart3, Droplets, ChevronRight, Calendar, TrendingUp, CheckCircle2, Clock } from "lucide-react";

const fmt = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};

function SeasonProgressBar({ harvested, total }: { harvested: number; total: number }) {
  const pct = total > 0 ? Math.min(100, (harvested / total) * 100) : 0;
  const colour = pct >= 90 ? "#15803d" : pct >= 50 ? "#1d4ed8" : pct >= 20 ? "#d97706" : "#6b7280";
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151" }}>Season Progress</span>
        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: colour }}>
          {harvested.toFixed(1)} / {total.toFixed(1)} ha ({pct.toFixed(0)}%)
        </span>
      </div>
      <div style={{ background: "#f3f4f6", borderRadius: 999, height: 14, overflow: "hidden" }}>
        <div style={{ background: colour, width: `${pct}%`, height: "100%", borderRadius: 999, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

function FieldStatusPill({ status }: { status: "harvested" | "pending" }) {
  return status === "harvested" ? (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 600, color: "#166534", background: "#dcfce7", borderRadius: 999, padding: "2px 10px" }}>
      <CheckCircle2 size={11} /> Done
    </span>
  ) : (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 600, color: "#92400e", background: "#fef3c7", borderRadius: 999, padding: "2px 10px" }}>
      <Clock size={11} /> Pending
    </span>
  );
}

export default function HarvestDashboard() {
  const { farmId } = useAppStore();
  const [, navigate] = useLocation();

  const harvestQ = useQuery({
    queryKey: ["harvests", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/harvests`).then(r => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? [],
  });

  const fieldCropQ = useQuery({
    queryKey: ["field-crops", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/field-crops`).then(r => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? [],
  });

  const harvests: any[] = harvestQ.data ?? [];
  const fieldCrops: any[] = fieldCropQ.data ?? [];
  const loading = harvestQ.isLoading || fieldCropQ.isLoading;

  const todayStr = new Date().toISOString().slice(0, 10);

  const todayHarvests = harvests.filter((r: any) =>
    r.harvestDate && new Date(r.harvestDate).toISOString().slice(0, 10) === todayStr
  );

  const seasonTotalHa = fieldCrops.reduce((s: number, fc: any) => s + (parseFloat(fc.areaHectares) || 0), 0);
  const harvestedHa = harvests.reduce((s: number, r: any) => s + (parseFloat(r.areaHarvestedHa) || 0), 0);
  const totalTonnes = harvests.reduce((s: number, r: any) => s + (parseFloat(r.yieldTonnes) || 0), 0);
  const avgYieldHa = harvestedHa > 0 ? totalTonnes / harvestedHa : 0;

  const moistureRecords = harvests.filter((r: any) => r.moisturePercent);
  const avgMoisture = moistureRecords.length
    ? moistureRecords.reduce((s: number, r: any) => s + parseFloat(r.moisturePercent), 0) / moistureRecords.length
    : null;

  const harvestedFieldIds = new Set(harvests.map((r: any) => r.fieldCropAssignmentId));
  const fieldStatuses = fieldCrops.map((fc: any) => ({
    ...fc,
    status: harvestedFieldIds.has(fc.id) ? "harvested" : "pending",
    harvestRecords: harvests.filter((r: any) => r.fieldCropAssignmentId === fc.id),
  }));

  const todayTotalHa = todayHarvests.reduce((s: number, r: any) => s + (parseFloat(r.areaHarvestedHa) || 0), 0);
  const todayTotalTonnes = todayHarvests.reduce((s: number, r: any) => s + (parseFloat(r.yieldTonnes) || 0), 0);

  const harvestDays = [...new Set(harvests.map((r: any) => r.harvestDate ? new Date(r.harvestDate).toISOString().slice(0, 10) : null).filter(Boolean))].sort().reverse().slice(0, 7);

  if (!farmId) {
    return (
      <AppLayout title="Harvest Dashboard">
        <div style={{ padding: "4rem 2rem", textAlign: "center", color: "#9ca3af" }}>
          <Wheat size={40} style={{ margin: "0 auto 1rem" }} />
          <p style={{ fontWeight: 600, color: "#6b7280" }}>Select a farm to view the harvest dashboard</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Harvest Dashboard">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
              Real-time snapshot of harvest progress, field status, and season totals.
            </p>
          </div>
          <button
            onClick={() => navigate("/harvest")}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.8rem", fontWeight: 600, color: "#166534", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.4rem 0.9rem", cursor: "pointer" }}
          >
            View Full Harvest Log <ChevronRight size={14} />
          </button>
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: "1.5rem" }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ height: 88, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, animation: "pulse 1.5s infinite" }} />
            ))}
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: "1.5rem" }}>
              {[
                { label: "Fields Harvested", value: `${harvestedFieldIds.size} / ${fieldCrops.length}`, icon: <CheckCircle2 size={18} color="#15803d" />, bg: "#f0fdf4", iconBg: "#dcfce7" },
                { label: "Total Yield", value: `${totalTonnes.toFixed(1)} t`, icon: <Wheat size={18} color="#7c3aed" />, bg: "#f5f3ff", iconBg: "#ede9fe" },
                { label: "Avg Yield / ha", value: avgYieldHa > 0 ? `${avgYieldHa.toFixed(2)} t/ha` : "—", icon: <TrendingUp size={18} color="#1d4ed8" />, bg: "#eff6ff", iconBg: "#dbeafe" },
                { label: "Avg Moisture", value: avgMoisture !== null ? `${avgMoisture.toFixed(1)}%` : "—", icon: <Droplets size={18} color="#0369a1" />, bg: "#f0f9ff", iconBg: "#e0f2fe" },
              ].map(({ label, value, icon, bg, iconBg }) => (
                <div key={label} style={{ background: bg, border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ background: iconBg, borderRadius: 8, padding: 8, flexShrink: 0 }}>{icon}</div>
                  <div>
                    <p style={{ fontSize: "0.72rem", color: "#6b7280", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }}>{label}</p>
                    <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#111827" }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
              <SeasonProgressBar harvested={harvestedHa} total={seasonTotalHa} />
              <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: 8 }}>
                Based on field-crop assignments for the current season. Area harvested vs total cropped area.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: "1.5rem" }}>
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ padding: "0.875rem 1.25rem", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 8 }}>
                  <Calendar size={15} color="#15803d" />
                  <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#111827" }}>
                    Today's Activity{" "}
                    <span style={{ fontWeight: 400, color: "#9ca3af", fontSize: "0.78rem" }}>
                      — {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long" })}
                    </span>
                  </span>
                </div>
                {todayHarvests.length === 0 ? (
                  <div style={{ padding: "2rem 1.25rem", textAlign: "center", color: "#9ca3af" }}>
                    <Wheat size={24} style={{ margin: "0 auto 0.5rem", opacity: 0.3 }} />
                    <p style={{ fontSize: "0.85rem" }}>No harvest activity logged today</p>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, borderBottom: "1px solid #f3f4f6" }}>
                      {[
                        ["Fields cut today", todayHarvests.length],
                        ["Area today", `${todayTotalHa.toFixed(1)} ha`],
                        ["Tonnes today", `${todayTotalTonnes.toFixed(1)} t`],
                        ["Operators", [...new Set(todayHarvests.filter(r => r.operatorName).map(r => r.operatorName))].length || "—"],
                      ].map(([k, v], i) => (
                        <div key={k as string} style={{ padding: "0.75rem 1.25rem", borderRight: i % 2 === 0 ? "1px solid #f3f4f6" : "none", borderBottom: i < 2 ? "1px solid #f3f4f6" : "none" }}>
                          <p style={{ fontSize: "0.7rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600, marginBottom: 2 }}>{k}</p>
                          <p style={{ fontWeight: 700, fontSize: "1.1rem", color: "#111827" }}>{v}</p>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: "0.75rem 1.25rem" }}>
                      {todayHarvests.map((r: any) => (
                        <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 6, marginBottom: 6, borderBottom: "1px solid #f9fafb" }}>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: "0.85rem", color: "#111827" }}>{r.field?.name || "Unknown Field"}</p>
                            <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>{r.crop?.name || "Unknown Crop"}{r.crop?.variety ? ` · ${r.crop.variety}` : ""}</p>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            {r.yieldTonnes && <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "#166534" }}>{r.yieldTonnes}t</p>}
                            {r.areaHarvestedHa && <p style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{parseFloat(r.areaHarvestedHa).toFixed(1)} ha</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ padding: "0.875rem 1.25rem", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 8 }}>
                  <BarChart3 size={15} color="#1d4ed8" />
                  <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#111827" }}>Recent Harvest Days</span>
                </div>
                {harvestDays.length === 0 ? (
                  <div style={{ padding: "2rem 1.25rem", textAlign: "center", color: "#9ca3af" }}>
                    <p style={{ fontSize: "0.85rem" }}>No harvest records yet this season</p>
                  </div>
                ) : (
                  <div>
                    {harvestDays.map((day) => {
                      const dayRecs = harvests.filter((r: any) =>
                        r.harvestDate && new Date(r.harvestDate).toISOString().slice(0, 10) === day
                      );
                      const dayHa = dayRecs.reduce((s: number, r: any) => s + (parseFloat(r.areaHarvestedHa) || 0), 0);
                      const dayT = dayRecs.reduce((s: number, r: any) => s + (parseFloat(r.yieldTonnes) || 0), 0);
                      const isToday = day === todayStr;
                      return (
                        <div key={day} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.65rem 1.25rem", borderBottom: "1px solid #f9fafb", background: isToday ? "#f0fdf4" : "transparent" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {isToday && <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#15803d", background: "#dcfce7", borderRadius: 4, padding: "1px 5px" }}>TODAY</span>}
                            <span style={{ fontSize: "0.85rem", fontWeight: isToday ? 700 : 500, color: "#374151" }}>
                              {new Date(day + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                            </span>
                          </div>
                          <div style={{ display: "flex", gap: 16, fontSize: "0.8rem" }}>
                            <span style={{ color: "#6b7280" }}>{dayRecs.length} field{dayRecs.length !== 1 ? "s" : ""}</span>
                            <span style={{ color: "#374151", fontWeight: 600 }}>{dayHa.toFixed(1)} ha</span>
                            <span style={{ color: "#166534", fontWeight: 700 }}>{dayT.toFixed(1)} t</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "0.875rem 1.25rem", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 8 }}>
                <Tractor size={15} color="#374151" />
                <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#111827" }}>Field Status — This Season</span>
                <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "#9ca3af" }}>
                  {harvestedFieldIds.size} of {fieldCrops.length} fields harvested
                </span>
              </div>
              {fieldStatuses.length === 0 ? (
                <div style={{ padding: "2rem 1.25rem", textAlign: "center", color: "#9ca3af" }}>
                  <p style={{ fontSize: "0.85rem" }}>No field-crop assignments found. Set up your fields and crops first.</p>
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                      {["Field", "Crop / Variety", "Area (ha)", "Status", "Last Harvest", "Yield", "Moisture"].map((h) => (
                        <th key={h} style={{ padding: "0.6rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fieldStatuses.sort((a: any, b: any) => {
                      if (a.status === b.status) return (a.fieldName || "").localeCompare(b.fieldName || "");
                      return a.status === "pending" ? -1 : 1;
                    }).map((fc: any, i: number) => {
                      const lastRec = fc.harvestRecords?.slice().sort((a: any, b: any) =>
                        new Date(b.harvestDate).getTime() - new Date(a.harvestDate).getTime()
                      )[0];
                      const totalFieldTonnes = fc.harvestRecords?.reduce((s: number, r: any) => s + (parseFloat(r.yieldTonnes) || 0), 0) ?? 0;
                      const totalFieldHa = fc.harvestRecords?.reduce((s: number, r: any) => s + (parseFloat(r.areaHarvestedHa) || 0), 0) ?? 0;
                      return (
                        <tr key={fc.id} style={{ borderBottom: "1px solid #f3f4f6", background: fc.status === "pending" ? "transparent" : "#fafffe" }}>
                          <td style={{ padding: "0.65rem 0.875rem", fontWeight: 600, color: "#111827" }}>{fc.fieldName || `Field #${fc.fieldId}`}</td>
                          <td style={{ padding: "0.65rem 0.875rem", color: "#374151" }}>
                            {fc.cropName || "—"}
                            {fc.cropVariety ? <span style={{ color: "#9ca3af", fontSize: "0.75rem" }}> · {fc.cropVariety}</span> : null}
                          </td>
                          <td style={{ padding: "0.65rem 0.875rem", color: "#6b7280" }}>{fc.areaHectares ? parseFloat(String(fc.areaHectares)).toFixed(2) : "—"}</td>
                          <td style={{ padding: "0.65rem 0.875rem" }}><FieldStatusPill status={fc.status} /></td>
                          <td style={{ padding: "0.65rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{lastRec ? fmt(lastRec.harvestDate) : "—"}</td>
                          <td style={{ padding: "0.65rem 0.875rem", fontWeight: 600, color: "#166534" }}>{totalFieldTonnes > 0 ? `${totalFieldTonnes.toFixed(1)} t` : "—"}</td>
                          <td style={{ padding: "0.65rem 0.875rem", color: "#6b7280" }}>{lastRec?.moisturePercent ? `${lastRec.moisturePercent}%` : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
