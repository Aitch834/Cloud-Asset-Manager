import { s as createLucideIcon, b as useAppStore, c as useQueryClient, a as useToast, m as useQuery, S as useMutation, j as jsxRuntimeExports, d as Button } from "./index-Dq7ETKNw.js";
import { u as usePersistedTab } from "./use-persisted-tab-Cbu2lQoD.js";
import { b as api } from "./api-Dhdsf4oM.js";
import { A as AppLayout, q as Smartphone, p as Bell, U as Users, I as Info } from "./AppLayout-B8I5kP9a.js";
import { S as Switch } from "./switch-xItmlQ06.js";
import { B as Badge } from "./badge-D3UK89x4.js";
import { T as TriangleAlert } from "./triangle-alert-YuC7-1rz.js";
import { C as CircleCheck } from "./circle-check-CO5rUT5B.js";
import { M as MessageSquare } from "./message-square-Ck69PF7I.js";
import "./use-safe-clerk-CWH6qFOJ.js";
import "./trash-2-B051Nk0V.js";
import "./database-Bm6ZiS0t.js";
import "./shield-alert-Duw1BH-c.js";
import "./shield-check-BtwviHfM.js";
import "./tractor-BCHVit-1.js";
const __iconNode = [
  ["path", { d: "M10.268 21a2 2 0 0 0 3.464 0", key: "vwvbt9" }],
  [
    "path",
    {
      d: "M17 17H4a1 1 0 0 1-.74-1.673C4.59 13.956 6 12.499 6 8a6 6 0 0 1 .258-1.742",
      key: "178tsu"
    }
  ],
  ["path", { d: "m2 2 20 20", key: "1ooewy" }],
  ["path", { d: "M8.668 3.01A6 6 0 0 1 18 8c0 2.687.77 4.653 1.707 6.05", key: "1hqiys" }]
];
const BellOff = createLucideIcon("bell-off", __iconNode);
const DEFAULT_ALERT_TYPES = [
  { key: "animal_health_critical", label: "Critical Animal Health", description: "Disease outbreak, suspected notifiable disease", category: "critical" },
  { key: "compliance_deadline", label: "Compliance Deadlines", description: "Overdue inspections, review deadlines, NVZ limits", category: "critical" },
  { key: "stock_reconciliation", label: "Stock Reconciliation Alerts", description: "Unaccounted livestock discrepancies", category: "critical" },
  { key: "tbtest_result", label: "TB Test Results Due", description: "TB test results pending / reactor notification", category: "critical" },
  { key: "medicine_withdrawal", label: "Withdrawal Period Expiry", description: "Animal medicines withdrawal completing today", category: "standard" },
  { key: "movement_pending", label: "Movement Notifications", description: "Livestock movement requires action within 3 days", category: "standard" },
  { key: "weather_alert", label: "Crop & Weather Alerts", description: "Spray block, frost, flood risk on field schedule", category: "standard" },
  { key: "task_overdue", label: "Overdue Tasks", description: "Assigned tasks overdue by more than 24 hours", category: "standard" }
];
function SMSAlertsPage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = usePersistedTab({ page: "sms-alerts", farmId, validIds: ["config", "team", "history"], defaultTab: "config" });
  const teamQ = useQuery({
    queryKey: ["farms", farmId, "team-sms"],
    queryFn: () => api.get(`/farms/${farmId}/team`).then((r) => r.members ?? []),
    enabled: !!farmId
  });
  const alertConfigQ = useQuery({
    queryKey: ["farms", farmId, "alert-config"],
    queryFn: () => api.get(`/farms/${farmId}/alert-config`).then((r) => r).catch(() => ({
      smsEnabled: true,
      alertTypes: DEFAULT_ALERT_TYPES.map((t) => ({ ...t, enabled: t.category === "critical" })),
      recentAlerts: []
    })),
    enabled: !!farmId
  });
  const saveConfigMut = useMutation({
    mutationFn: (body) => api.put(`/farms/${farmId}/alert-config`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["farms", farmId, "alert-config"] });
      toast({ title: "Alert configuration saved" });
    },
    onError: () => toast({ title: "Failed to save configuration", variant: "destructive" })
  });
  const team = teamQ.data ?? [];
  const config = alertConfigQ.data;
  const alertTypes = config?.alertTypes ?? DEFAULT_ALERT_TYPES.map((t) => ({ ...t, enabled: t.category === "critical" }));
  const recentAlerts = config?.recentAlerts ?? [];
  const smsEnabled = team.filter((m) => m.phoneNumber && m.smsOptIn !== "none" && m.receiveAlerts).length;
  const smsOptedOut = team.filter((m) => !m.phoneNumber || m.smsOptIn === "none").length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { title: "SMS & Alert Settings", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "SMS Alerts" }),
      " — Critical farm events trigger text messages to opted-in team members. Standard alerts appear as in-app notifications; only critical alerts send SMS."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-5 grid grid-cols-3 gap-3", children: [
      { label: "SMS Enabled", value: `${smsEnabled} recipient${smsEnabled !== 1 ? "s" : ""}`, icon: Smartphone, green: smsEnabled > 0 },
      { label: "Opted Out / No Number", value: smsOptedOut, icon: BellOff, amber: smsOptedOut > 0 },
      { label: "Recent Alerts (30d)", value: recentAlerts.filter((a) => new Date(a.sentAt) > new Date(Date.now() - 30 * 864e5)).length, icon: Bell }
    ].map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(s.icon, { className: `w-5 h-5 ${s.green ? "text-green-600" : s.amber ? "text-amber-600" : "text-muted-foreground"}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-lg font-bold ${s.green ? "text-green-700" : s.amber ? "text-amber-600" : ""}`, children: s.value }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: s.label })
      ] })
    ] }, i)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 mb-5", children: ["config", "team", "history"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: activeTab === t ? "default" : "outline", onClick: () => setActiveTab(t), children: t === "config" ? "Alert Types" : t === "team" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-3.5 h-3.5 mr-1" }),
      "Team Recipients"
    ] }) : "History" }, t)) }),
    activeTab === "config" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 border-b bg-muted/30 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm", children: "Alert Type Configuration" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "sm",
              onClick: () => saveConfigMut.mutate({ alertTypes }),
              disabled: saveConfigMut.isPending,
              children: saveConfigMut.isPending ? "Saving…" : "Save Changes"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", children: alertTypes.map((at, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 flex items-center justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: at.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `text-xs ${at.category === "critical" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`, children: at.category === "critical" ? "SMS" : "In-app" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: at.description })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Switch,
            {
              checked: at.enabled,
              onCheckedChange: (checked) => {
                const updated = alertTypes.map((a, j) => j === i ? { ...a, enabled: checked } : a);
                saveConfigMut.mutate({ alertTypes: updated });
              }
            }
          )
        ] }, at.key)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 font-medium mb-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4" }),
          "SMS message costs"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", children: "Each SMS costs a small amount per recipient. Critical alerts only fire when the system detects a genuine threshold breach — not on every record save. Estimated volume: 2–5 SMS/month per farm for typical operations." })
      ] })
    ] }),
    activeTab === "team" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 flex items-start gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-4 h-4 shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Each team member controls their own SMS preference from their ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Account & Notifications" }),
          " page. Admins can see the status here."
        ] })
      ] }),
      teamQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading team…" }) : team.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "mx-auto mb-2 w-8 h-8 opacity-30" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No team members found." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left font-medium", children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left font-medium", children: "Phone" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-center font-medium", children: "SMS Preference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-center font-medium", children: "Alerts Active" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-center font-medium", children: "Status" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: team.map((m) => {
          const isEnabled = !!m.phoneNumber && m.smsOptIn !== "none" && m.receiveAlerts;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: m.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: m.email })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-xs", children: m.phoneNumber ?? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-600", children: "Not set" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `text-xs capitalize ${m.smsOptIn === "all" ? "bg-green-100 text-green-800" : m.smsOptIn === "critical" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"}`, children: m.smsOptIn === "all" ? "All alerts" : m.smsOptIn === "critical" ? "Critical only" : "None" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-center", children: m.receiveAlerts ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 text-green-600 mx-auto" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(BellOff, { className: "w-4 h-4 text-gray-400 mx-auto" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-center", children: isEnabled ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-green-100 text-green-800 text-xs", children: "Receiving SMS" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-gray-100 text-gray-600 text-xs", children: "Not receiving" }) })
          ] }, m.id);
        }) })
      ] }) })
    ] }),
    activeTab === "history" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: recentAlerts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-muted-foreground border rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "mx-auto mb-2 w-8 h-8 opacity-30" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No alerts have been sent recently." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left font-medium", children: "Sent" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left font-medium", children: "Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left font-medium", children: "Message" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-center font-medium", children: "Severity" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right font-medium", children: "Recipients" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: recentAlerts.sort((a, b) => b.sentAt.localeCompare(a.sentAt)).map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-xs text-muted-foreground whitespace-nowrap", children: new Date(a.sentAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-xs", children: a.alertType.replace(/_/g, " ") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-xs", children: a.message }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `text-xs ${a.severity === "critical" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`, children: a.severity }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: a.recipientCount })
      ] }, a.id)) })
    ] }) }) })
  ] });
}
export {
  SMSAlertsPage as default
};
