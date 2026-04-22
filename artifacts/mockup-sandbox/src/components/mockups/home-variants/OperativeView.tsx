import { CheckSquare, Droplet, Wrench, Cloud, Clock, AlertCircle, ChevronRight, Circle } from "lucide-react";

const GREEN = "#276B2F";
const GREEN_LIGHT = "#F0FDF4";
const GREEN_MID = "#BBF7D0";
const GREEN_DARK = "#15803D";
const AMBER = "#D97706";
const AMBER_LIGHT = "#FEF3C7";
const RED = "#DC2626";
const RED_LIGHT = "#FEF2F2";
const BORDER = "#E5E7EB";

export function OperativeView() {
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
            <h1 style={{ color: "white", fontSize: 22, fontWeight: 700, margin: "2px 0 0" }}>Tom Fletcher</h1>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, margin: "4px 0 0" }}>Manor Farm · Field Operative</p>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontWeight: 700, fontSize: 15 }}>TF</span>
          </div>
        </div>

        {/* Sync pill */}
        <div style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "4px 10px" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#4ADE80" }} />
          <span style={{ color: "white", fontSize: 11 }}>All records synced</span>
        </div>
      </div>

      {/* My Tasks Hero Card */}
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

        {/* Stats row */}
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

        {/* Next task preview */}
        <div style={{ backgroundColor: GREEN_LIGHT, borderRadius: 10, padding: "10px 12px", borderLeft: `3px solid ${GREEN}` }}>
          <p style={{ fontSize: 10, color: GREEN_DARK, fontWeight: 600, margin: "0 0 3px", textTransform: "uppercase", letterSpacing: 0.4 }}>Up Next</p>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: 0 }}>Apply herbicide — Field 7</p>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
            <Clock size={11} color="#6B7280" />
            <span style={{ fontSize: 11, color: "#6B7280" }}>Due 2:00 PM · Spray record required</span>
          </div>
        </div>

        {/* CTA */}
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: GREEN, fontSize: 13, fontWeight: 600 }}>
          <span>View all tasks</span>
          <ChevronRight size={14} color={GREEN} />
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

      {/* Task list */}
      <div style={{ padding: "20px 16px 0" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: 0.5 }}>Today's Work</p>
        {[
          { title: "Check feed bins — Herd B", due: "Done", done: true, module: "Feed Bin" },
          { title: "Morning equipment walk-round", due: "Done", done: true, module: "Equipment" },
          { title: "Apply herbicide — Field 7", due: "Due 2:00 PM", done: false, module: "Spray" },
          { title: "Evening livestock check", due: "Due 5:30 PM", done: false, module: "Livestock" },
        ].map((task) => (
          <div key={task.title} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, backgroundColor: "white", padding: "12px 14px", borderRadius: 12, border: `1px solid ${BORDER}`, opacity: task.done ? 0.65 : 1 }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", border: task.done ? "none" : `2px solid ${BORDER}`, backgroundColor: task.done ? GREEN : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {task.done && <span style={{ color: "white", fontSize: 11, fontWeight: 700 }}>✓</span>}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: 13, color: "#111827", margin: 0, textDecoration: task.done ? "line-through" : "none" }}>{task.title}</p>
              <p style={{ fontSize: 11, color: task.done ? "#9CA3AF" : "#6B7280", margin: "2px 0 0" }}>{task.due} · {task.module}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
