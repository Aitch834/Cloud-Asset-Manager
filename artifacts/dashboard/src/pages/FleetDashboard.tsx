import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLocation } from "wouter";
import { Wrench, CheckCircle2, AlertTriangle, Clock, ChevronRight, Tractor, Calendar, TrendingUp } from "lucide-react";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { FleetCostReport } from "@/components/FleetCostReport";

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

function ServiceStatus({ days }: { days: number | null }) {
  if (days === null) return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 600, color: "#6b7280", background: "#f3f4f6", borderRadius: 999, padding: "2px 10px" }}>
      <Clock size={11} /> Not scheduled
    </span>
  );
  if (days < 0) return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 600, color: "#991b1b", background: "#fee2e2", borderRadius: 999, padding: "2px 10px" }}>
      <AlertTriangle size={11} /> Overdue {Math.abs(days)}d
    </span>
  );
  if (days <= 14) return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 600, color: "#92400e", background: "#fef3c7", borderRadius: 999, padding: "2px 10px" }}>
      <Clock size={11} /> Due in {days}d
    </span>
  );
  if (days <= 30) return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 600, color: "#1d4ed8", background: "#dbeafe", borderRadius: 999, padding: "2px 10px" }}>
      <Calendar size={11} /> Due in {days}d
    </span>
  );
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 600, color: "#166534", background: "#dcfce7", borderRadius: 999, padding: "2px 10px" }}>
      <CheckCircle2 size={11} /> OK — {days}d
    </span>
  );
}

export default function FleetDashboard() {
  const { farmId } = useAppStore();
  const [, navigate] = useLocation();
  const [tab, setTab] = usePersistedTab<"status" | "cost">({
    page: "fleet",
    farmId,
    validIds: ["status", "cost"],
    defaultTab: "status",
  });

  const equipmentQ = useQuery({
    queryKey: ["equipment", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/equipment`).then(r => r.json()),
    enabled: !!farmId,
    select: d => d.records ?? [],
  });

  const equipment: any[] = equipmentQ.data ?? [];
  const active = equipment.filter(e => e.isActive !== false);

  const overdue = active.filter(e => daysUntil(e.nextCalibrationDue) !== null && daysUntil(e.nextCalibrationDue)! < 0);
  const dueSoon = active.filter(e => {
    const d = daysUntil(e.nextCalibrationDue);
    return d !== null && d >= 0 && d <= 30;
  });
  const ok = active.filter(e => {
    const d = daysUntil(e.nextCalibrationDue);
    return d === null || d > 30;
  });

  const sorted = [
    ...active.filter(e => {
      const d = daysUntil(e.nextCalibrationDue);
      return d !== null && d < 0;
    }),
    ...active.filter(e => {
      const d = daysUntil(e.nextCalibrationDue);
      return d !== null && d >= 0 && d <= 30;
    }).sort((a, b) => daysUntil(a.nextCalibrationDue)! - daysUntil(b.nextCalibrationDue)!),
    ...active.filter(e => {
      const d = daysUntil(e.nextCalibrationDue);
      return d === null || d > 30;
    }),
  ];

  if (!farmId) {
    return (
      <AppLayout title="Fleet Status">
        <div style={{ padding: "4rem 2rem", textAlign: "center", color: "#9ca3af" }}>
          <Wrench size={40} style={{ margin: "0 auto 1rem" }} />
          <p style={{ fontWeight: 600, color: "#6b7280" }}>Select a farm to view fleet status</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Fleet Status">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <TabBar>
            <TabButton active={tab === "status"} onClick={() => setTab("status")}><Wrench className="w-3.5 h-3.5 mr-1 inline" />Service Status</TabButton>
            <TabButton active={tab === "cost"} onClick={() => setTab("cost")}><TrendingUp className="w-3.5 h-3.5 mr-1 inline" />Cost Report</TabButton>
          </TabBar>
          {tab === "status" && (
            <button onClick={() => navigate("/equipment")} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.8rem", fontWeight: 600, color: "#374151", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "0.4rem 0.9rem", cursor: "pointer" }}>
              Equipment Register <ChevronRight size={14} />
            </button>
          )}
        </div>

        {tab === "cost" && <FleetCostReport farmId={farmId!} />}
        {tab === "status" && (equipmentQ.isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ height: 88, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10 }} />
            ))}
          </div>
        ) : (
          <>
            {overdue.length > 0 && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1.25rem", display: "flex", alignItems: "flex-start", gap: 10 }}>
                <AlertTriangle size={18} color="#dc2626" style={{ marginTop: 1, flexShrink: 0 }} />
                <div>
                  <p style={{ fontWeight: 700, color: "#dc2626", fontSize: "0.9rem" }}>
                    {overdue.length} item{overdue.length > 1 ? "s" : ""} overdue for calibration / service
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: 2 }}>
                    {overdue.map(e => e.name).join(", ")} — schedule immediately to maintain Red Tractor compliance.
                  </p>
                </div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: "1.5rem" }}>
              {[
                { label: "Total Fleet", value: active.length, bg: "#f9fafb", iconBg: "#f3f4f6", icon: <Tractor size={18} color="#374151" /> },
                { label: "Overdue", value: overdue.length, bg: overdue.length > 0 ? "#fef2f2" : "#f9fafb", iconBg: overdue.length > 0 ? "#fecaca" : "#f3f4f6", icon: <AlertTriangle size={18} color={overdue.length > 0 ? "#dc2626" : "#9ca3af"} /> },
                { label: "Due ≤ 30 Days", value: dueSoon.length, bg: dueSoon.length > 0 ? "#fffbeb" : "#f9fafb", iconBg: dueSoon.length > 0 ? "#fef3c7" : "#f3f4f6", icon: <Clock size={18} color={dueSoon.length > 0 ? "#d97706" : "#9ca3af"} /> },
                { label: "Status OK", value: ok.length, bg: "#f0fdf4", iconBg: "#dcfce7", icon: <CheckCircle2 size={18} color="#15803d" /> },
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

            {sorted.length === 0 ? (
              <div style={{ padding: "4rem 2rem", textAlign: "center", color: "#9ca3af" }}>
                <Wrench size={32} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
                <p style={{ fontWeight: 600, color: "#6b7280" }}>No equipment registered</p>
                <p style={{ fontSize: "0.875rem", marginTop: 4 }}>Add machinery via the Equipment Register</p>
              </div>
            ) : (
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ padding: "0.875rem 1.25rem", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 8 }}>
                  <Wrench size={15} color="#374151" />
                  <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#111827" }}>Fleet Status — All Equipment</span>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                      {["Machine", "Type", "Make / Model", "Reg / Serial", "Next Calibration", "Status"].map(h => (
                        <th key={h} style={{ padding: "0.6rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((e: any, i: number) => {
                      const days = daysUntil(e.nextCalibrationDue);
                      const rowBg = days !== null && days < 0 ? "#fff5f5" : days !== null && days <= 14 ? "#fffdf5" : "transparent";
                      return (
                        <tr key={e.id} style={{ borderBottom: "1px solid #f3f4f6", background: rowBg }}>
                          <td style={{ padding: "0.65rem 0.875rem", fontWeight: 600, color: "#111827" }}>{e.name || "—"}</td>
                          <td style={{ padding: "0.65rem 0.875rem", color: "#6b7280", textTransform: "capitalize" }}>{e.type || "—"}</td>
                          <td style={{ padding: "0.65rem 0.875rem", color: "#374151" }}>
                            {[e.make, e.model].filter(Boolean).join(" ") || "—"}
                            {e.yearOfManufacture ? <span style={{ color: "#9ca3af", fontSize: "0.75rem" }}> ({e.yearOfManufacture})</span> : null}
                          </td>
                          <td style={{ padding: "0.65rem 0.875rem", color: "#6b7280", fontSize: "0.8rem" }}>
                            {e.registrationNumber || e.serialNumber || "—"}
                          </td>
                          <td style={{ padding: "0.65rem 0.875rem", color: "#374151", whiteSpace: "nowrap" }}>{fmt(e.nextCalibrationDue)}</td>
                          <td style={{ padding: "0.65rem 0.875rem" }}><ServiceStatus days={days} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ))}
      </div>
    </AppLayout>
  );
}
