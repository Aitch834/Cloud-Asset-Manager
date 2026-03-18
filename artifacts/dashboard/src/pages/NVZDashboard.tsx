import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLocation } from "wouter";
import { Leaf, AlertTriangle, CheckCircle2, ChevronRight, Info, Lock } from "lucide-react";

const ORGANIC_N_LIMIT = 170;
const TOTAL_N_LIMIT = 250;

const LIQUID_TYPES = new Set(["slurry", "digestate"]);

function daysUntilOpen(landType: string | null | undefined): { open: boolean; daysRemaining: number | null } {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const dayOfYear = month * 100 + day;

  let closedEnd: Date | null = null;

  if (landType === "arable" || landType === "mixed") {
    if (dayOfYear >= 801 || dayOfYear <= 131) {
      closedEnd = new Date(now.getFullYear(), 0, 31);
      if (dayOfYear >= 801) closedEnd = new Date(now.getFullYear() + 1, 0, 31);
    }
  } else if (landType === "grassland") {
    if (dayOfYear >= 1015 || dayOfYear <= 131) {
      closedEnd = new Date(now.getFullYear(), 0, 31);
      if (dayOfYear >= 1015) closedEnd = new Date(now.getFullYear() + 1, 0, 31);
    }
  }

  if (closedEnd) {
    const msLeft = closedEnd.getTime() - now.getTime();
    return { open: false, daysRemaining: Math.max(0, Math.ceil(msLeft / 86400000)) };
  }
  return { open: true, daysRemaining: null };
}

function isTodayClosed(landType: string | null | undefined): boolean {
  return !daysUntilOpen(landType).open;
}

function NBar({ value, limit }: { value: number; limit: number }) {
  const pct = Math.min((value / limit) * 100, 100);
  const over = value > limit;
  const warn = value > limit * 0.85 && !over;
  return (
    <div style={{ height: 8, borderRadius: 999, overflow: "hidden", background: "#f3f4f6" }}>
      <div style={{ height: "100%", borderRadius: 999, width: `${pct}%`, background: over ? "#ef4444" : warn ? "#f59e0b" : "#22c55e", transition: "width 0.5s ease" }} />
    </div>
  );
}

export default function NVZDashboard() {
  const { farmId } = useAppStore();
  const [, navigate] = useLocation();

  const summaryQ = useQuery({
    queryKey: ["nvz-summary", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/nvz/field-summary`).then(r => r.json()),
    enabled: !!farmId,
    select: d => d.summaries ?? [],
  });

  const summaries: any[] = summaryQ.data ?? [];
  const nvzFields = summaries.filter((s: any) => s.isNvz);
  const nonNvzFields = summaries.filter((s: any) => !s.isNvz);

  const fieldsOverLimit = nvzFields.filter((s: any) => s.organicNKgHa > ORGANIC_N_LIMIT || s.totalNKgHa > TOTAL_N_LIMIT);
  const fieldsInClosedPeriod = nvzFields.filter((s: any) => isTodayClosed(s.nvzLandType));
  const fieldsOk = nvzFields.filter((s: any) => s.organicNKgHa <= ORGANIC_N_LIMIT && s.totalNKgHa <= TOTAL_N_LIMIT);

  if (!farmId) {
    return (
      <AppLayout title="NVZ Status Board">
        <div style={{ padding: "4rem 2rem", textAlign: "center", color: "#9ca3af" }}>
          <Leaf size={40} style={{ margin: "0 auto 1rem" }} />
          <p style={{ fontWeight: 600, color: "#6b7280" }}>Select a farm to view the NVZ status board</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="NVZ Status Board">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
            Nitrogen balance, closed period status, and limit tracking across all NVZ-designated fields.
          </p>
          <button onClick={() => navigate("/nvz")} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.8rem", fontWeight: 600, color: "#166534", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.4rem 0.9rem", cursor: "pointer" }}>
            NVZ Records <ChevronRight size={14} />
          </button>
        </div>

        {summaryQ.isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ height: 88, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10 }} />
            ))}
          </div>
        ) : (
          <>
            {fieldsOverLimit.length > 0 && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1.25rem", display: "flex", alignItems: "flex-start", gap: 10 }}>
                <AlertTriangle size={18} color="#dc2626" style={{ marginTop: 1, flexShrink: 0 }} />
                <div>
                  <p style={{ fontWeight: 700, color: "#dc2626", fontSize: "0.9rem" }}>
                    {fieldsOverLimit.length} field{fieldsOverLimit.length > 1 ? "s" : ""} exceeding N application limits
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: 2 }}>
                    {fieldsOverLimit.map((s: any) => s.fieldName).join(", ")} — review applications immediately. Breaching NVZ limits carries enforcement risk.
                  </p>
                </div>
              </div>
            )}

            {fieldsInClosedPeriod.length > 0 && (
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1.25rem", display: "flex", alignItems: "flex-start", gap: 10 }}>
                <Lock size={18} color="#d97706" style={{ marginTop: 1, flexShrink: 0 }} />
                <div>
                  <p style={{ fontWeight: 700, color: "#92400e", fontSize: "0.9rem" }}>
                    Slurry / digestate closed period is currently active on {fieldsInClosedPeriod.length} field{fieldsInClosedPeriod.length > 1 ? "s" : ""}
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: 2 }}>
                    Do not apply liquid organic nitrogen to these fields until the closed period ends (31 Jan).
                  </p>
                </div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: "1.5rem" }}>
              {[
                { label: "NVZ Fields", value: nvzFields.length, bg: "#f0f9ff", iconBg: "#e0f2fe", icon: <Leaf size={18} color="#0369a1" /> },
                { label: "Over N Limit", value: fieldsOverLimit.length, bg: fieldsOverLimit.length > 0 ? "#fef2f2" : "#f9fafb", iconBg: fieldsOverLimit.length > 0 ? "#fee2e2" : "#f3f4f6", icon: <AlertTriangle size={18} color={fieldsOverLimit.length > 0 ? "#dc2626" : "#9ca3af"} /> },
                { label: "Closed Period", value: fieldsInClosedPeriod.length, bg: fieldsInClosedPeriod.length > 0 ? "#fffbeb" : "#f9fafb", iconBg: fieldsInClosedPeriod.length > 0 ? "#fef3c7" : "#f3f4f6", icon: <Lock size={18} color={fieldsInClosedPeriod.length > 0 ? "#d97706" : "#9ca3af"} /> },
                { label: "Within Limits", value: fieldsOk.length, bg: "#f0fdf4", iconBg: "#dcfce7", icon: <CheckCircle2 size={18} color="#15803d" /> },
              ].map(({ label, value, bg, iconBg, icon }) => (
                <div key={label} style={{ background: bg, border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ background: iconBg, borderRadius: 8, padding: 8, flexShrink: 0 }}>{icon}</div>
                  <div>
                    <p style={{ fontSize: "0.72rem", color: "#6b7280", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }}>{label}</p>
                    <p style={{ fontSize: "1.375rem", fontWeight: 700, color: "#111827" }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", marginBottom: "1.25rem" }}>
              <div style={{ padding: "0.875rem 1.25rem", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 8 }}>
                <Leaf size={15} color="#374151" />
                <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#111827" }}>NVZ Field N Balance — Rolling 12 Months</span>
                <span style={{ marginLeft: "auto", display: "flex", gap: 16, fontSize: "0.72rem", color: "#9ca3af" }}>
                  <span>Organic limit: <strong>170 kg N/ha</strong></span>
                  <span>Total limit: <strong>250 kg N/ha</strong></span>
                </span>
              </div>
              {nvzFields.length === 0 ? (
                <div style={{ padding: "2rem 1.25rem", textAlign: "center", color: "#9ca3af" }}>
                  <Info size={24} style={{ margin: "0 auto 0.5rem", opacity: 0.4 }} />
                  <p style={{ fontSize: "0.85rem" }}>No NVZ-designated fields found. Mark fields as NVZ in the NVZ module.</p>
                </div>
              ) : (
                <div>
                  {nvzFields.sort((a: any, b: any) => {
                    const aOver = a.organicNKgHa > ORGANIC_N_LIMIT || a.totalNKgHa > TOTAL_N_LIMIT;
                    const bOver = b.organicNKgHa > ORGANIC_N_LIMIT || b.totalNKgHa > TOTAL_N_LIMIT;
                    if (aOver && !bOver) return -1;
                    if (!aOver && bOver) return 1;
                    return (b.totalNKgHa || 0) - (a.totalNKgHa || 0);
                  }).map((fs: any, i: number, arr: any[]) => {
                    const organicOver = fs.organicNKgHa > ORGANIC_N_LIMIT;
                    const totalOver = fs.totalNKgHa > TOTAL_N_LIMIT;
                    const organicWarn = !organicOver && fs.organicNKgHa > ORGANIC_N_LIMIT * 0.85;
                    const totalWarn = !totalOver && fs.totalNKgHa > TOTAL_N_LIMIT * 0.85;
                    const closedInfo = daysUntilOpen(fs.nvzLandType);
                    const rowBg = organicOver || totalOver ? "#fff5f5" : organicWarn || totalWarn ? "#fffdf0" : "transparent";

                    return (
                      <div key={fs.fieldId} style={{ padding: "1rem 1.25rem", borderBottom: i < arr.length - 1 ? "1px solid #f3f4f6" : "none", background: rowBg }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10, gap: 8 }}>
                          <div>
                            <p style={{ fontWeight: 700, color: "#111827", fontSize: "0.9rem" }}>{fs.fieldName}</p>
                            <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: 1 }}>
                              {fs.nvzLandType ? `${fs.nvzLandType} land` : "NVZ field"}{fs.areaHectares ? ` · ${parseFloat(String(fs.areaHectares)).toFixed(1)} ha` : ""}
                              {" · "}{fs.applicationCount || 0} application{fs.applicationCount !== 1 ? "s" : ""}
                            </p>
                          </div>
                          <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                            {!closedInfo.open && (
                              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#92400e", background: "#fef3c7", borderRadius: 4, padding: "2px 6px", display: "inline-flex", alignItems: "center", gap: 3 }}>
                                <Lock size={10} /> Closed — opens in {closedInfo.daysRemaining}d
                              </span>
                            )}
                            {(organicOver || totalOver) && (
                              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#991b1b", background: "#fee2e2", borderRadius: 4, padding: "2px 6px" }}>Over limit</span>
                            )}
                            {!organicOver && !totalOver && !organicWarn && !totalWarn && (
                              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#166534", background: "#dcfce7", borderRadius: 4, padding: "2px 6px" }}>Within limits</span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                              <span style={{ fontSize: "0.72rem", color: "#6b7280", fontWeight: 600 }}>Organic N applied</span>
                              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: organicOver ? "#dc2626" : organicWarn ? "#d97706" : "#374151" }}>
                                {(fs.organicNKgHa || 0).toFixed(1)} / {ORGANIC_N_LIMIT} kg/ha
                              </span>
                            </div>
                            <NBar value={fs.organicNKgHa || 0} limit={ORGANIC_N_LIMIT} />
                          </div>
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                              <span style={{ fontSize: "0.72rem", color: "#6b7280", fontWeight: 600 }}>Total N applied</span>
                              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: totalOver ? "#dc2626" : totalWarn ? "#d97706" : "#374151" }}>
                                {(fs.totalNKgHa || 0).toFixed(1)} / {TOTAL_N_LIMIT} kg/ha
                              </span>
                            </div>
                            <NBar value={fs.totalNKgHa || 0} limit={TOTAL_N_LIMIT} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {nonNvzFields.length > 0 && (
              <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: "0.75rem 1.25rem", fontSize: "0.8rem", color: "#6b7280" }}>
                <strong style={{ color: "#374151" }}>{nonNvzFields.length} non-NVZ field{nonNvzFields.length > 1 ? "s" : ""}</strong> with fertiliser applications are not subject to NVZ limits but are tracked for NMP purposes.
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
