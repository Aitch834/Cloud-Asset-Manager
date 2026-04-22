import { CheckCircle, AlertTriangle, Shield, Droplet, Wrench, CheckSquare, Cloud, ChevronRight, Clock } from "lucide-react";

const GREEN = "#276B2F";
const GREEN_LIGHT = "#F0FDF4";
const GREEN_MID = "#DCF5E0";
const AMBER = "#D97706";
const RED = "#DC2626";
const BORDER = "#E5E7EB";

export function ManagerView() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: "#F7F8F6", minHeight: "100vh", maxWidth: 390, margin: "0 auto" }}>
      {/* Status bar */}
      <div style={{ backgroundColor: GREEN, height: 44, display: "flex", alignItems: "flex-end", paddingBottom: 8, paddingLeft: 20, paddingRight: 20, justifyContent: "space-between" }}>
        <span style={{ color: "white", fontSize: 12, fontWeight: 600 }}>9:41</span>
        <span style={{ color: "white", fontSize: 12 }}>●●● 4G ▐</span>
      </div>

      {/* Header */}
      <div style={{ backgroundColor: GREEN, paddingLeft: 20, paddingRight: 20, paddingTop: 16, paddingBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, margin: 0 }}>Good morning,</p>
            <h1 style={{ color: "white", fontSize: 22, fontWeight: 700, margin: "2px 0 0" }}>James Wilson</h1>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, margin: "4px 0 0" }}>Manor Farm · Staffordshire</p>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontWeight: 700, fontSize: 15 }}>JW</span>
          </div>
        </div>

        {/* Sync pill */}
        <div style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "4px 10px" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#4ADE80" }} />
          <span style={{ color: "white", fontSize: 11 }}>All records synced</span>
        </div>
      </div>

      {/* Compliance Card */}
      <div style={{ margin: "-16px 16px 0", backgroundColor: "white", borderRadius: 16, padding: 18, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", border: `1px solid ${BORDER}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <p style={{ color: "#6B7280", fontSize: 11, fontWeight: 500, margin: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>Red Tractor Compliance</p>
            <p style={{ color: GREEN, fontSize: 36, fontWeight: 800, margin: "2px 0 0", lineHeight: 1 }}>87%</p>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: GREEN_LIGHT, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckCircle size={22} color={GREEN} />
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ backgroundColor: GREEN_MID, borderRadius: 6, height: 7, marginBottom: 14, overflow: "hidden" }}>
          <div style={{ backgroundColor: GREEN, width: "87%", height: "100%", borderRadius: 6 }} />
        </div>

        {/* Stats */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ flex: 1, textAlign: "center" }}>
            <p style={{ fontWeight: 800, fontSize: 20, color: "#111827", margin: 0 }}>14</p>
            <p style={{ fontSize: 11, color: "#6B7280", margin: "2px 0 0" }}>Completed</p>
          </div>
          <div style={{ width: 1, height: 32, backgroundColor: BORDER }} />
          <div style={{ flex: 1, textAlign: "center" }}>
            <p style={{ fontWeight: 800, fontSize: 20, color: "#111827", margin: 0 }}>3</p>
            <p style={{ fontSize: 11, color: "#6B7280", margin: "2px 0 0" }}>Remaining</p>
          </div>
          <div style={{ width: 1, height: 32, backgroundColor: BORDER }} />
          <div style={{ flex: 1, textAlign: "center" }}>
            <p style={{ fontWeight: 800, fontSize: 20, color: RED, margin: 0 }}>1</p>
            <p style={{ fontSize: 11, color: "#6B7280", margin: "2px 0 0" }}>Overdue</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ paddingTop: 24, paddingLeft: 16, paddingRight: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: 0.5 }}>Quick Actions</p>
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
          {[
            { icon: <CheckSquare size={18} color="#16A34A" />, label: "My Tasks", bg: "#F0FDF4", border: "#BBF7D0" },
            { icon: <Droplet size={18} color="#2563EB" />, label: "Spray Record", bg: "#EFF6FF", border: "#BFDBFE" },
            { icon: <Wrench size={18} color="#9333EA" />, label: "Equipment", bg: "#FAF5FF", border: "#E9D5FF" },
            { icon: <Cloud size={18} color="#0891B2" />, label: "Weather", bg: "#ECFEFF", border: "#A5F3FC" },
          ].map((a) => (
            <div key={a.label} style={{ flex: "0 0 80px", backgroundColor: a.bg, border: `1.5px solid ${a.border}`, borderRadius: 14, padding: "12px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "white", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                {a.icon}
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: "#374151", textAlign: "center", lineHeight: 1.2 }}>{a.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ padding: "20px 16px 0" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: 0.5 }}>Recent Activity</p>
        {[
          { title: "Spray record logged", sub: "Field 7 — Winter Wheat", time: "2h ago", dot: "#2563EB" },
          { title: "Equipment defect raised", sub: "Claas Axion 940 — High severity", time: "Yesterday", dot: RED },
          { title: "Visitor log entry", sub: "Agronomist — Smith Bros", time: "Yesterday", dot: "#9333EA" },
        ].map((item) => (
          <div key={item.title} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14, backgroundColor: "white", padding: 14, borderRadius: 12, border: `1px solid ${BORDER}` }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: item.dot, marginTop: 5, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: 13, color: "#111827", margin: 0 }}>{item.title}</p>
              <p style={{ fontSize: 12, color: "#6B7280", margin: "2px 0 0" }}>{item.sub}</p>
            </div>
            <span style={{ fontSize: 11, color: "#9CA3AF", whiteSpace: "nowrap" }}>{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
