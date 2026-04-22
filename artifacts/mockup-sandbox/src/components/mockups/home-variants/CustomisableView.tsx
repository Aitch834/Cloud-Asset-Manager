import { CheckSquare, Droplet, Wrench, Cloud, Settings2, Shield, ChevronRight, Clock, X } from "lucide-react";

const GREEN = "#276B2F";
const GREEN_LIGHT = "#F0FDF4";
const GREEN_MID = "#BBF7D0";
const GREEN_DARK = "#15803D";
const BORDER = "#E5E7EB";
const RED = "#DC2626";

export function CustomisableView() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: "#F7F8F6", minHeight: "100vh", maxWidth: 390, margin: "0 auto", position: "relative" }}>
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
            <h1 style={{ color: "white", fontSize: 22, fontWeight: 700, margin: "2px 0 0" }}>Tom Fletcher</h1>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, margin: "4px 0 0" }}>Manor Farm · Field Operative</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            {/* Personalise button */}
            <button style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.2)", border: "1.5px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Settings2 size={16} color="white" />
            </button>
            <div style={{ width: 38, height: 38, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "white", fontWeight: 700, fontSize: 15 }}>TF</span>
            </div>
          </div>
        </div>

        {/* Sync pill */}
        <div style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "4px 10px" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#4ADE80" }} />
          <span style={{ color: "white", fontSize: 11 }}>All records synced</span>
        </div>
      </div>

      {/* My Tasks Hero Card — active choice */}
      <div style={{ margin: "-16px 16px 0", backgroundColor: "white", borderRadius: 16, padding: 18, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", border: `1px solid ${BORDER}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <p style={{ color: "#6B7280", fontSize: 11, fontWeight: 500, margin: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>My Tasks Today</p>
            <p style={{ color: GREEN, fontSize: 36, fontWeight: 800, margin: "2px 0 0", lineHeight: 1 }}>4 <span style={{ fontSize: 16, fontWeight: 500, color: "#6B7280" }}>assigned</span></p>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: GREEN_LIGHT, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckSquare size={22} color={GREEN} />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
          <div style={{ flex: 1, textAlign: "center" }}>
            <p style={{ fontWeight: 800, fontSize: 20, color: GREEN, margin: 0 }}>2</p>
            <p style={{ fontSize: 11, color: "#6B7280", margin: "2px 0 0" }}>Done</p>
          </div>
          <div style={{ width: 1, height: 32, backgroundColor: BORDER }} />
          <div style={{ flex: 1, textAlign: "center" }}>
            <p style={{ fontWeight: 800, fontSize: 20, color: "#111827", margin: 0 }}>2</p>
            <p style={{ fontSize: 11, color: "#6B7280", margin: "2px 0 0" }}>To Do</p>
          </div>
          <div style={{ width: 1, height: 32, backgroundColor: BORDER }} />
          <div style={{ flex: 1, textAlign: "center" }}>
            <p style={{ fontWeight: 800, fontSize: 20, color: "#6B7280", margin: 0 }}>0</p>
            <p style={{ fontSize: 11, color: "#6B7280", margin: "2px 0 0" }}>Overdue</p>
          </div>
        </div>

        <div style={{ backgroundColor: GREEN_LIGHT, borderRadius: 10, padding: "10px 12px", borderLeft: `3px solid ${GREEN}` }}>
          <p style={{ fontSize: 10, color: GREEN_DARK, fontWeight: 600, margin: "0 0 3px", textTransform: "uppercase", letterSpacing: 0.4 }}>Up Next</p>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: 0 }}>Apply herbicide — Field 7</p>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
            <Clock size={11} color="#6B7280" />
            <span style={{ fontSize: 11, color: "#6B7280" }}>Due 2:00 PM · Spray record required</span>
          </div>
        </div>

        {/* View toggle pills — shows which card is active */}
        <div style={{ marginTop: 14, display: "flex", gap: 8, justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, backgroundColor: GREEN, borderRadius: 20, padding: "5px 12px" }}>
            <CheckSquare size={12} color="white" />
            <span style={{ fontSize: 11, fontWeight: 600, color: "white" }}>My Tasks</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, backgroundColor: "#F3F4F6", borderRadius: 20, padding: "5px 12px", border: `1px solid ${BORDER}` }}>
            <Shield size={12} color="#9CA3AF" />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF" }}>Compliance</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ paddingTop: 24, paddingLeft: 16, paddingRight: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: 0.5 }}>Quick Actions</p>
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
          {[
            { icon: <Droplet size={18} color="#2563EB" />, label: "Spray Record", bg: "#EFF6FF", border: "#BFDBFE" },
            { icon: <Wrench size={18} color="#9333EA" />, label: "Defect Report", bg: "#FAF5FF", border: "#E9D5FF" },
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

      {/* Personalise Sheet — shown as overlay */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "white", borderRadius: "20px 20px 0 0", boxShadow: "0 -4px 24px rgba(0,0,0,0.12)", padding: "0 20px 32px" }}>
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 16 }}>
          <div style={{ width: 36, height: 4, backgroundColor: "#D1D5DB", borderRadius: 2 }} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <p style={{ fontWeight: 700, fontSize: 17, color: "#111827", margin: 0 }}>Personalise Home</p>
          <button style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: "#F3F4F6", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={14} color="#6B7280" />
          </button>
        </div>
        <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 18px" }}>Choose what you see at the top of your home screen.</p>

        {/* Option 1 — My Tasks (selected) */}
        <div style={{ border: `2px solid ${GREEN}`, borderRadius: 14, padding: 14, marginBottom: 10, display: "flex", alignItems: "center", gap: 12, backgroundColor: GREEN_LIGHT }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: GREEN, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <CheckSquare size={20} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: "#111827", margin: 0 }}>My Tasks</p>
            <p style={{ fontSize: 12, color: "#6B7280", margin: "2px 0 0" }}>See your assigned tasks and daily to-do list</p>
          </div>
          <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${GREEN}`, backgroundColor: GREEN, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontSize: 11 }}>✓</span>
          </div>
        </div>

        {/* Option 2 — Compliance (not selected) */}
        <div style={{ border: `1.5px solid ${BORDER}`, borderRadius: 14, padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Shield size={20} color="#9CA3AF" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: "#111827", margin: 0 }}>Compliance Overview</p>
            <p style={{ fontSize: 12, color: "#6B7280", margin: "2px 0 0" }}>Red Tractor score, completed forms and overdue items</p>
          </div>
          <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${BORDER}`, backgroundColor: "white" }} />
        </div>
      </div>
    </div>
  );
}
