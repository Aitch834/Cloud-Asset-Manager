import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLocation } from "wouter";
import { FlaskConical, CheckCircle2, AlertTriangle, Clock, ChevronRight, Info, TrendingUp } from "lucide-react";
import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

function daysSince(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const d = new Date(dateStr); d.setHours(0, 0, 0, 0);
  return Math.round((now.getTime() - d.getTime()) / 86400000);
}

function fmt(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtShort(d: string | null | undefined) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
}

function TestAgeBadge({ days }: { days: number | null }) {
  if (days === null) return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 600, color: "#991b1b", background: "#fee2e2", borderRadius: 999, padding: "2px 10px" }}>
      <AlertTriangle size={11} /> Never tested
    </span>
  );
  if (days > 365 * 5) return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 600, color: "#991b1b", background: "#fee2e2", borderRadius: 999, padding: "2px 10px" }}>
      <AlertTriangle size={11} /> Overdue ({Math.floor(days / 365)}y ago)
    </span>
  );
  if (days > 365 * 3) return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 600, color: "#92400e", background: "#fef3c7", borderRadius: 999, padding: "2px 10px" }}>
      <Clock size={11} /> Review due ({Math.floor(days / 365)}y ago)
    </span>
  );
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 600, color: "#166534", background: "#dcfce7", borderRadius: 999, padding: "2px 10px" }}>
      <CheckCircle2 size={11} /> Current ({Math.floor(days / 365)}y ago)
    </span>
  );
}

function NutrientPill({ label, value, status }: { label: string; value: string | null; status: string | null }) {
  const s = (status || "").toLowerCase();
  const col = s === "low" ? { bg: "#fee2e2", text: "#991b1b" }
    : s === "high" ? { bg: "#dbeafe", text: "#1d4ed8" }
    : s === "adequate" || s === "optimal" ? { bg: "#dcfce7", text: "#166534" }
    : { bg: "#f3f4f6", text: "#6b7280" };
  return (
    <div style={{ background: col.bg, borderRadius: 8, padding: "0.35rem 0.65rem", display: "inline-flex", flexDirection: "column", alignItems: "center", minWidth: 52 }}>
      <span style={{ fontSize: "0.65rem", color: col.text, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
      <span style={{ fontSize: "0.8rem", fontWeight: 700, color: col.text }}>{value !== null && value !== undefined ? value : "—"}</span>
    </div>
  );
}

const FIELD_COLORS = [
  "#2563eb", "#16a34a", "#d97706", "#9333ea", "#dc2626",
  "#0891b2", "#c2410c", "#65a30d", "#db2777", "#0f766e",
  "#7c3aed", "#b45309", "#059669", "#e11d48", "#0369a1",
];

const NUTRIENT_OPTIONS = [
  { key: "ph", label: "pH", domain: [3, 8] as [number, number] },
  { key: "phosphorus", label: "Phosphorus (P Index)", domain: [0, 4] as [number, number] },
  { key: "potassium", label: "Potassium (K Index)", domain: [0, 4] as [number, number] },
  { key: "magnesium", label: "Magnesium (Mg Index)", domain: [0, 4] as [number, number] },
  { key: "organicMatter", label: "Organic Matter %", domain: [0, 10] as [number, number] },
];

export default function SoilDashboard() {
  const { farmId } = useAppStore();
  const [, navigate] = useLocation();
  const [viewTab, setViewTab] = usePersistedTab<"overview" | "trends">({ page: "soil-dashboard", farmId, validIds: ["overview", "trends"], defaultTab: "overview" });
  const [selectedNutrient, setSelectedNutrient] = useState("ph");

  const fieldsQ = useQuery({
    queryKey: ["fields", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fields`).then(r => r.json()),
    enabled: !!farmId,
    select: d => d.records ?? [],
  });
  const soilQ = useQuery({
    queryKey: ["soil-tests", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/soil-tests`).then(r => r.json()),
    enabled: !!farmId,
    select: d => d.records ?? [],
  });

  const fields: any[] = fieldsQ.data ?? [];
  const soilTests: any[] = soilQ.data ?? [];
  const loading = fieldsQ.isLoading || soilQ.isLoading;

  const fieldTestMap = new Map<number, any[]>();
  soilTests.forEach(t => {
    if (!fieldTestMap.has(t.fieldId)) fieldTestMap.set(t.fieldId, []);
    fieldTestMap.get(t.fieldId)!.push(t);
  });

  const fieldSummaries = fields.map(f => {
    const tests = (fieldTestMap.get(f.id) || []).sort((a: any, b: any) =>
      new Date(b.sampleDate).getTime() - new Date(a.sampleDate).getTime()
    );
    const latest = tests[0] || null;
    const days = latest ? daysSince(latest.sampleDate) : null;
    const results: any[] = latest?.results || [];
    const getResult = (nutrient: string) => results.find((r: any) => r.nutrient?.toLowerCase().includes(nutrient.toLowerCase()));
    const ph = getResult("ph");
    const p = getResult("phosphorus");
    const k = getResult("potassium");
    const mg = getResult("magnesium");
    return { field: f, latest, days, ph, p, k, mg, testCount: tests.length, allTests: tests };
  });

  const neverTested = fieldSummaries.filter(s => s.days === null).length;
  const overdue = fieldSummaries.filter(s => s.days !== null && s.days > 365 * 5).length;
  const reviewDue = fieldSummaries.filter(s => s.days !== null && s.days > 365 * 3 && s.days <= 365 * 5).length;
  const current = fieldSummaries.filter(s => s.days !== null && s.days <= 365 * 3).length;

  const sorted = [...fieldSummaries].sort((a, b) => {
    if (a.days === null && b.days !== null) return -1;
    if (a.days !== null && b.days === null) return 1;
    if (a.days === null && b.days === null) return a.field.name.localeCompare(b.field.name);
    return b.days! - a.days!;
  });

  const nutrientConfig = NUTRIENT_OPTIONS.find(n => n.key === selectedNutrient) ?? NUTRIENT_OPTIONS[0];

  const trendData = useMemo(() => {
    const allDates = new Set<string>();
    fieldSummaries.forEach(s => {
      s.allTests.forEach((t: any) => {
        if (t.sampleDate) allDates.add(t.sampleDate.slice(0, 10));
      });
    });
    const sorted = Array.from(allDates).sort();
    return sorted.map(date => {
      const point: any = { date, label: fmtShort(date) };
      fieldSummaries.forEach(s => {
        const test = s.allTests.find((t: any) => t.sampleDate?.slice(0, 10) === date);
        if (test) {
          const results: any[] = test.results || [];
          const match = results.find((r: any) => r.nutrient?.toLowerCase().includes(selectedNutrient.toLowerCase()));
          if (match) {
            const val = parseFloat(match.index ?? match.value ?? "");
            if (!isNaN(val)) point[`field_${s.field.id}`] = val;
          }
        }
      });
      return point;
    });
  }, [fieldSummaries, selectedNutrient]);

  const fieldsWithTrendData = fieldSummaries.filter(s =>
    s.allTests.some((t: any) => {
      const results: any[] = t.results || [];
      return results.some((r: any) => r.nutrient?.toLowerCase().includes(selectedNutrient.toLowerCase()) && (r.index ?? r.value));
    })
  );

  if (!farmId) {
    return (
      <AppLayout title="Soil Health Dashboard">
        <div style={{ padding: "4rem 2rem", textAlign: "center", color: "#9ca3af" }}>
          <FlaskConical size={40} style={{ margin: "0 auto 1rem" }} />
          <p style={{ fontWeight: 600, color: "#6b7280" }}>Select a farm to view soil health status</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Soil Health Dashboard">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
            Per-field soil test status, pH, phosphorus, potassium, and magnesium indices at a glance.
          </p>
          <button onClick={() => navigate("/soil")} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.8rem", fontWeight: 600, color: "#7c3aed", background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: 8, padding: "0.4rem 0.9rem", cursor: "pointer" }}>
            Soil Test Records <ChevronRight size={14} />
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{ display: "flex", gap: 2, background: "#f3f4f6", borderRadius: 10, padding: 3, marginBottom: "1.5rem", width: "fit-content" }}>
          {[
            { key: "overview", label: "Overview", icon: <FlaskConical size={14} /> },
            { key: "trends", label: "Nutrient Trends", icon: <TrendingUp size={14} /> },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setViewTab(t.key as any)}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "0.4rem 1rem", borderRadius: 8, border: "none", cursor: "pointer",
                fontSize: "0.82rem", fontWeight: 600,
                background: viewTab === t.key ? "#fff" : "transparent",
                color: viewTab === t.key ? "#111827" : "#6b7280",
                boxShadow: viewTab === t.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s",
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ height: 88, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10 }} />
            ))}
          </div>
        ) : viewTab === "overview" ? (
          <>
            {(neverTested + overdue) > 0 && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1.25rem", display: "flex", alignItems: "flex-start", gap: 10 }}>
                <AlertTriangle size={18} color="#dc2626" style={{ marginTop: 1, flexShrink: 0 }} />
                <div>
                  <p style={{ fontWeight: 700, color: "#dc2626", fontSize: "0.9rem" }}>
                    {neverTested + overdue} field{neverTested + overdue > 1 ? "s" : ""} need soil testing
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: 2 }}>
                    Soil tests older than 5 years or never conducted. AHDB recommends testing every 3–5 years for accurate fertiliser planning.
                  </p>
                </div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: "1.5rem" }}>
              {[
                { label: "Never Tested", value: neverTested, bg: neverTested > 0 ? "#fef2f2" : "#f9fafb", iconBg: neverTested > 0 ? "#fecaca" : "#f3f4f6", icon: <AlertTriangle size={18} color={neverTested > 0 ? "#dc2626" : "#9ca3af"} /> },
                { label: "Overdue (5y+)", value: overdue, bg: overdue > 0 ? "#fff5f5" : "#f9fafb", iconBg: overdue > 0 ? "#fecaca" : "#f3f4f6", icon: <Clock size={18} color={overdue > 0 ? "#dc2626" : "#9ca3af"} /> },
                { label: "Review Due (3–5y)", value: reviewDue, bg: reviewDue > 0 ? "#fffbeb" : "#f9fafb", iconBg: reviewDue > 0 ? "#fef3c7" : "#f3f4f6", icon: <Clock size={18} color={reviewDue > 0 ? "#d97706" : "#9ca3af"} /> },
                { label: "Current (< 3y)", value: current, bg: "#f0fdf4", iconBg: "#dcfce7", icon: <CheckCircle2 size={18} color="#15803d" /> },
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

            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "0.875rem 1.25rem", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 8 }}>
                <FlaskConical size={15} color="#374151" />
                <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#111827" }}>Field Soil Status</span>
                <span style={{ marginLeft: "auto", fontSize: "0.72rem", color: "#9ca3af" }}>
                  Sorted: most urgent first
                </span>
              </div>
              {sorted.length === 0 ? (
                <div style={{ padding: "2rem 1.25rem", textAlign: "center", color: "#9ca3af" }}>
                  <Info size={24} style={{ margin: "0 auto 0.5rem", opacity: 0.4 }} />
                  <p style={{ fontSize: "0.85rem" }}>No fields found. Add fields via Fields & Crops.</p>
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                      {["Field", "Last Tested", "Test Age", "pH", "P Index", "K Index", "Mg Index", "Tests"].map(h => (
                        <th key={h} style={{ padding: "0.6rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((s) => {
                      const rowBg = s.days === null || s.days > 365 * 5 ? "#fff8f8"
                        : s.days > 365 * 3 ? "#fffef5"
                        : "transparent";
                      return (
                        <tr key={s.field.id} style={{ borderBottom: "1px solid #f3f4f6", background: rowBg }}>
                          <td style={{ padding: "0.65rem 0.875rem", fontWeight: 600, color: "#111827" }}>
                            {s.field.name}
                            {s.field.fieldReference ? <span style={{ color: "#9ca3af", fontSize: "0.75rem" }}> ({s.field.fieldReference})</span> : null}
                          </td>
                          <td style={{ padding: "0.65rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{fmt(s.latest?.sampleDate)}</td>
                          <td style={{ padding: "0.65rem 0.875rem" }}><TestAgeBadge days={s.days} /></td>
                          <td style={{ padding: "0.65rem 0.875rem" }}>
                            {s.ph ? <NutrientPill label="pH" value={s.ph.value} status={s.ph.status} /> : <span style={{ color: "#d1d5db" }}>—</span>}
                          </td>
                          <td style={{ padding: "0.65rem 0.875rem" }}>
                            {s.p ? <NutrientPill label={s.p.index || "P"} value={s.p.index || s.p.value} status={s.p.status} /> : <span style={{ color: "#d1d5db" }}>—</span>}
                          </td>
                          <td style={{ padding: "0.65rem 0.875rem" }}>
                            {s.k ? <NutrientPill label={s.k.index || "K"} value={s.k.index || s.k.value} status={s.k.status} /> : <span style={{ color: "#d1d5db" }}>—</span>}
                          </td>
                          <td style={{ padding: "0.65rem 0.875rem" }}>
                            {s.mg ? <NutrientPill label={s.mg.index || "Mg"} value={s.mg.index || s.mg.value} status={s.mg.status} /> : <span style={{ color: "#d1d5db" }}>—</span>}
                          </td>
                          <td style={{ padding: "0.65rem 0.875rem", color: "#6b7280" }}>{s.testCount}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        ) : (
          /* ── TRENDS TAB ── */
          <div className="space-y-5">
            {/* Nutrient selector */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151" }}>Show:</span>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {NUTRIENT_OPTIONS.map(n => (
                  <button
                    key={n.key}
                    onClick={() => setSelectedNutrient(n.key)}
                    style={{
                      padding: "0.3rem 0.85rem", borderRadius: 999, border: "1.5px solid",
                      fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
                      borderColor: selectedNutrient === n.key ? "#2563eb" : "#e5e7eb",
                      background: selectedNutrient === n.key ? "#dbeafe" : "#fff",
                      color: selectedNutrient === n.key ? "#1d4ed8" : "#6b7280",
                    }}
                  >
                    {n.label}
                  </button>
                ))}
              </div>
            </div>

            {fieldsWithTrendData.length === 0 ? (
              <div style={{ background: "#f9fafb", border: "1px dashed #e5e7eb", borderRadius: 12, padding: "3rem 2rem", textAlign: "center", color: "#9ca3af" }}>
                <TrendingUp size={32} style={{ margin: "0 auto 0.75rem", opacity: 0.3 }} />
                <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "#6b7280" }}>No trend data available</p>
                <p style={{ fontSize: "0.8rem", marginTop: 4 }}>Add multiple soil test records with {nutrientConfig.label} results to see trends over time.</p>
              </div>
            ) : (
              <>
                {/* Trend chart */}
                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.25rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
                    <TrendingUp size={15} color="#374151" />
                    <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#111827" }}>{nutrientConfig.label} — All Fields Over Time</span>
                    <span style={{ marginLeft: "auto", fontSize: "0.72rem", color: "#9ca3af" }}>{fieldsWithTrendData.length} field{fieldsWithTrendData.length !== 1 ? "s" : ""} with data</span>
                  </div>
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b7280" }} />
                      <YAxis domain={nutrientConfig.domain} tick={{ fontSize: 11, fill: "#6b7280" }} width={35} />
                      <Tooltip
                        contentStyle={{ fontSize: "0.8rem", borderRadius: 8, border: "1px solid #e5e7eb" }}
                        formatter={(val: any, name: string) => {
                          const fieldId = parseInt(name.replace("field_", ""));
                          const field = fields.find((f: any) => f.id === fieldId);
                          return [val, field?.name ?? name];
                        }}
                      />
                      <Legend
                        formatter={(value: string) => {
                          const fieldId = parseInt(value.replace("field_", ""));
                          const field = fields.find((f: any) => f.id === fieldId);
                          return field?.name ?? value;
                        }}
                        wrapperStyle={{ fontSize: "0.78rem" }}
                      />
                      {fieldsWithTrendData.map((s, i) => (
                        <Line
                          key={s.field.id}
                          type="monotone"
                          dataKey={`field_${s.field.id}`}
                          stroke={FIELD_COLORS[i % FIELD_COLORS.length]}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                          connectNulls={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Per-field sparkline summary */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
                  {fieldsWithTrendData.map((s, i) => {
                    const color = FIELD_COLORS[i % FIELD_COLORS.length];
                    const fieldTests = s.allTests
                      .map((t: any) => {
                        const results: any[] = t.results || [];
                        const match = results.find((r: any) => r.nutrient?.toLowerCase().includes(selectedNutrient.toLowerCase()));
                        if (!match) return null;
                        const val = parseFloat(match.index ?? match.value ?? "");
                        return isNaN(val) ? null : { date: t.sampleDate?.slice(0, 10), val };
                      })
                      .filter(Boolean)
                      .sort((a: any, b: any) => a.date.localeCompare(b.date));
                    if (fieldTests.length === 0) return null;
                    const latest = fieldTests[fieldTests.length - 1] as any;
                    const first = fieldTests[0] as any;
                    const change = fieldTests.length > 1 ? latest.val - first.val : null;
                    return (
                      <div key={s.field.id} style={{ background: "#fff", border: `1px solid ${color}30`, borderRadius: 10, padding: "0.875rem 1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#111827" }}>{s.field.name}</div>
                            {s.field.fieldReference && <div style={{ fontSize: "0.72rem", color: "#9ca3af" }}>{s.field.fieldReference}</div>}
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "1.1rem", fontWeight: 700, color }}>{latest.val}</div>
                            {change !== null && (
                              <div style={{ fontSize: "0.72rem", fontWeight: 600, color: change > 0 ? "#16a34a" : change < 0 ? "#dc2626" : "#6b7280" }}>
                                {change > 0 ? "▲" : change < 0 ? "▼" : "—"} {Math.abs(change).toFixed(2)} since first test
                              </div>
                            )}
                          </div>
                        </div>
                        <ResponsiveContainer width="100%" height={60}>
                          <LineChart data={fieldTests as any[]}>
                            <Line type="monotone" dataKey="val" stroke={color} strokeWidth={2} dot={false} />
                            <YAxis domain={nutrientConfig.domain} hide />
                            <XAxis dataKey="date" hide />
                            <Tooltip
                              contentStyle={{ fontSize: "0.75rem", borderRadius: 6, border: "1px solid #e5e7eb", padding: "4px 8px" }}
                              formatter={(v: any) => [v, nutrientConfig.label]}
                              labelFormatter={(l: string) => fmtShort(l)}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                        <div style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: 4 }}>
                          {fieldTests.length} test{fieldTests.length !== 1 ? "s" : ""} · First: {fmtShort(first.date)} · Latest: {fmtShort(latest.date)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
