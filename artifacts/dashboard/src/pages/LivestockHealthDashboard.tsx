import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLocation } from "wouter";
import { HeartPulse, AlertTriangle, CheckCircle2, Clock, ChevronRight, Pill, ShieldAlert } from "lucide-react";

function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const d = new Date(dateStr); d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / 86400000);
}

function fmt(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function WithdrawalBadge({ days }: { days: number | null }) {
  if (days === null) return null;
  if (days < 0) return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 600, color: "#166534", background: "#dcfce7", borderRadius: 999, padding: "2px 10px" }}>
      <CheckCircle2 size={11} /> Cleared
    </span>
  );
  if (days <= 3) return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 600, color: "#991b1b", background: "#fee2e2", borderRadius: 999, padding: "2px 10px" }}>
      <AlertTriangle size={11} /> {days}d remaining — URGENT
    </span>
  );
  if (days <= 14) return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 600, color: "#92400e", background: "#fef3c7", borderRadius: 999, padding: "2px 10px" }}>
      <Clock size={11} /> {days}d remaining
    </span>
  );
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 600, color: "#1d4ed8", background: "#dbeafe", borderRadius: 999, padding: "2px 10px" }}>
      <Clock size={11} /> {days}d remaining
    </span>
  );
}

const SPECIES_COLOURS: Record<string, { bg: string; text: string }> = {
  cattle:   { bg: "#f0fdf4", text: "#166534" },
  sheep:    { bg: "#fffbeb", text: "#92400e" },
  pigs:     { bg: "#fdf4ff", text: "#7e22ce" },
  poultry:  { bg: "#fff7ed", text: "#c2410c" },
  goats:    { bg: "#f0f9ff", text: "#0369a1" },
  other:    { bg: "#f9fafb", text: "#374151" },
};
function specieColour(type: string) {
  const key = (type || "other").toLowerCase();
  return SPECIES_COLOURS[key] || SPECIES_COLOURS.other;
}

export default function LivestockHealthDashboard() {
  const { farmId } = useAppStore();
  const [, navigate] = useLocation();

  const herdsQ = useQuery({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/herds`).then(r => r.json()),
    enabled: !!farmId,
    select: d => d.records ?? [],
  });
  const medicineQ = useQuery({
    queryKey: ["medicine-records", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/medicine-records`).then(r => r.json()),
    enabled: !!farmId,
    select: d => d.records ?? [],
  });

  const herds: any[] = herdsQ.data ?? [];
  const medicine: any[] = medicineQ.data ?? [];
  const loading = herdsQ.isLoading || medicineQ.isLoading;

  const now = new Date(); now.setHours(0, 0, 0, 0);
  const todayStr = now.toISOString().slice(0, 10);
  const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);

  const activeWithdrawals = medicine.filter(m =>
    m.withdrawalEndDate && daysUntil(m.withdrawalEndDate) !== null && daysUntil(m.withdrawalEndDate)! >= 0
  ).sort((a, b) => daysUntil(a.withdrawalEndDate)! - daysUntil(b.withdrawalEndDate)!);

  const thisWeekTreatments = medicine.filter(m => {
    if (!m.administeredDate) return false;
    const d = new Date(m.administeredDate); d.setHours(0, 0, 0, 0);
    return d >= weekAgo && d <= now;
  });

  const todayTreatments = medicine.filter(m => {
    if (!m.administeredDate) return false;
    return new Date(m.administeredDate).toISOString().slice(0, 10) === todayStr;
  });

  const urgentWithdrawals = activeWithdrawals.filter(m => (daysUntil(m.withdrawalEndDate) ?? 99) <= 3);

  const herdMap = new Map(herds.map(h => [h.id, h]));
  const herdMedicineCount = new Map<number, number>();
  medicine.forEach(m => {
    if (m.herdId) herdMedicineCount.set(m.herdId, (herdMedicineCount.get(m.herdId) || 0) + 1);
  });

  if (!farmId) {
    return (
      <AppLayout title="Livestock & Poultry Health">
        <div style={{ padding: "4rem 2rem", textAlign: "center", color: "#9ca3af" }}>
          <HeartPulse size={40} style={{ margin: "0 auto 1rem" }} />
          <p style={{ fontWeight: 600, color: "#6b7280" }}>Select a farm to view the health dashboard</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Livestock & Poultry Health">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
            Withdrawal period tracking, active treatments, and herd health overview.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => navigate("/medicine")} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.8rem", fontWeight: 600, color: "#7c3aed", background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: 8, padding: "0.4rem 0.9rem", cursor: "pointer" }}>
              Medicine Records <ChevronRight size={14} />
            </button>
            <button onClick={() => navigate("/livestock")} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.8rem", fontWeight: 600, color: "#166534", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.4rem 0.9rem", cursor: "pointer" }}>
              Herd Register <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ height: 88, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, animation: "pulse 1.5s infinite" }} />
            ))}
          </div>
        ) : (
          <>
            {urgentWithdrawals.length > 0 && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1.25rem", display: "flex", alignItems: "flex-start", gap: 10 }}>
                <ShieldAlert size={18} color="#dc2626" style={{ marginTop: 1, flexShrink: 0 }} />
                <div>
                  <p style={{ fontWeight: 700, color: "#dc2626", fontSize: "0.9rem" }}>Urgent — {urgentWithdrawals.length} withdrawal period{urgentWithdrawals.length > 1 ? "s" : ""} expiring within 3 days</p>
                  <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: 2 }}>
                    {urgentWithdrawals.map(m => m.medicineName).join(", ")} — do not send affected animals for slaughter until clearance date has passed.
                  </p>
                </div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: "1.5rem" }}>
              {[
                { label: "Active Herds / Flocks", value: herds.filter(h => h.isActive !== false).length, bg: "#f0fdf4", iconBg: "#dcfce7", icon: <HeartPulse size={18} color="#15803d" /> },
                { label: "In Withdrawal", value: activeWithdrawals.length, bg: activeWithdrawals.length > 0 ? "#fffbeb" : "#f9fafb", iconBg: activeWithdrawals.length > 0 ? "#fef3c7" : "#f3f4f6", icon: <AlertTriangle size={18} color={activeWithdrawals.length > 0 ? "#d97706" : "#9ca3af"} /> },
                { label: "Treated This Week", value: thisWeekTreatments.length, bg: "#eff6ff", iconBg: "#dbeafe", icon: <Pill size={18} color="#1d4ed8" /> },
                { label: "Treated Today", value: todayTreatments.length, bg: "#f5f3ff", iconBg: "#ede9fe", icon: <Clock size={18} color="#7c3aed" /> },
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

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: "1.5rem" }}>
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ padding: "0.875rem 1.25rem", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 8 }}>
                  <AlertTriangle size={15} color="#d97706" />
                  <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#111827" }}>Active Withdrawal Periods</span>
                  {activeWithdrawals.length > 0 && (
                    <span style={{ marginLeft: "auto", fontSize: "0.75rem", fontWeight: 700, color: "#dc2626" }}>{activeWithdrawals.length} active</span>
                  )}
                </div>
                {activeWithdrawals.length === 0 ? (
                  <div style={{ padding: "2rem 1.25rem", textAlign: "center", color: "#9ca3af" }}>
                    <CheckCircle2 size={24} style={{ margin: "0 auto 0.5rem", color: "#86efac" }} />
                    <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#15803d" }}>No animals currently in withdrawal</p>
                  </div>
                ) : (
                  <div>
                    {activeWithdrawals.map((m: any) => {
                      const days = daysUntil(m.withdrawalEndDate);
                      const herd = m.herdId ? herdMap.get(m.herdId) : null;
                      return (
                        <div key={m.id} style={{ padding: "0.75rem 1.25rem", borderBottom: "1px solid #f9fafb", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "#111827" }}>{m.medicineName}</p>
                            <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: 1 }}>
                              {herd ? herd.name : "Individual animal"}{m.administeredBy ? ` · ${m.administeredBy}` : ""}
                            </p>
                            <p style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: 1 }}>Clearance: {fmt(m.withdrawalEndDate)}</p>
                          </div>
                          <WithdrawalBadge days={days} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ padding: "0.875rem 1.25rem", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 8 }}>
                  <Clock size={15} color="#1d4ed8" />
                  <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#111827" }}>Treatments This Week</span>
                  <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "#9ca3af" }}>{thisWeekTreatments.length} recorded</span>
                </div>
                {thisWeekTreatments.length === 0 ? (
                  <div style={{ padding: "2rem 1.25rem", textAlign: "center", color: "#9ca3af" }}>
                    <p style={{ fontSize: "0.85rem" }}>No treatments recorded in the last 7 days</p>
                  </div>
                ) : (
                  <div>
                    {thisWeekTreatments.slice(0, 8).map((m: any) => {
                      const herd = m.herdId ? herdMap.get(m.herdId) : null;
                      const isToday = m.administeredDate && new Date(m.administeredDate).toISOString().slice(0, 10) === todayStr;
                      return (
                        <div key={m.id} style={{ padding: "0.65rem 1.25rem", borderBottom: "1px solid #f9fafb", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 600, fontSize: "0.85rem", color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.medicineName}</p>
                            <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>{herd ? herd.name : "—"}{m.dosage ? ` · ${m.dosage}` : ""}</p>
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <p style={{ fontSize: "0.78rem", color: "#374151" }}>
                              {new Date(m.administeredDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                            </p>
                            {isToday && <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#15803d", background: "#dcfce7", borderRadius: 4, padding: "1px 5px" }}>TODAY</span>}
                          </div>
                        </div>
                      );
                    })}
                    {thisWeekTreatments.length > 8 && (
                      <a href="/medicine" style={{ display: "block", padding: "0.5rem 1.25rem", fontSize: "0.75rem", color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>
                        +{thisWeekTreatments.length - 8} more — View all in Medicine →
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "0.875rem 1.25rem", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 8 }}>
                <HeartPulse size={15} color="#374151" />
                <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#111827" }}>Herd & Flock Register</span>
                <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "#9ca3af" }}>{herds.length} registered</span>
              </div>
              {herds.length === 0 ? (
                <div style={{ padding: "2rem 1.25rem", textAlign: "center", color: "#9ca3af" }}>
                  <p style={{ fontSize: "0.85rem" }}>No herds or flocks registered. Add them via the Herd Register.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12, padding: "1rem" }}>
                  {herds.map((h: any) => {
                    const col = specieColour(h.type);
                    const medCount = herdMedicineCount.get(h.id) || 0;
                    const activeW = activeWithdrawals.filter(m => m.herdId === h.id).length;
                    return (
                      <div key={h.id} style={{ background: col.bg, border: "1px solid #e5e7eb", borderRadius: 10, padding: "0.875rem 1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <p style={{ fontWeight: 700, color: "#111827", fontSize: "0.9rem" }}>{h.name}</p>
                            <p style={{ fontSize: "0.75rem", color: col.text, fontWeight: 600, textTransform: "capitalize", marginTop: 1 }}>{h.type || "Unknown"}{h.breed ? ` · ${h.breed}` : ""}</p>
                          </div>
                          {activeW > 0 && (
                            <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#92400e", background: "#fef3c7", borderRadius: 4, padding: "2px 6px" }}>
                              {activeW} withdrawal{activeW > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                        <div style={{ marginTop: 8, display: "flex", gap: 12 }}>
                          {h.herdNumber && <span style={{ fontSize: "0.72rem", color: "#6b7280" }}>Herd No: {h.herdNumber}</span>}
                          <span style={{ fontSize: "0.72rem", color: "#6b7280" }}>{medCount} treatment{medCount !== 1 ? "s" : ""} recorded</span>
                        </div>
                        {h.isActive === false && (
                          <p style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: 4 }}>Inactive</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
