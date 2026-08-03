import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { api } from "@/lib/api";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Bell, BellOff, CheckCircle2, Info, MessageSquare, Smartphone, Users } from "lucide-react";

type TeamMember = {
  id: number;
  name: string;
  email: string;
  phoneNumber: string | null;
  smsOptIn: "all" | "critical" | "none";
  receiveAlerts: boolean;
  role: string;
};

type FarmAlertConfig = {
  smsEnabled: boolean;
  alertTypes: {
    key: string;
    label: string;
    description: string;
    category: "critical" | "standard";
    enabled: boolean;
  }[];
  recentAlerts: {
    id: number;
    alertType: string;
    message: string;
    severity: string;
    sentAt: string;
    recipientCount: number;
  }[];
};

const DEFAULT_ALERT_TYPES = [
  { key: "animal_health_critical", label: "Critical Animal Health", description: "Disease outbreak, suspected notifiable disease", category: "critical" as const },
  { key: "compliance_deadline", label: "Compliance Deadlines", description: "Overdue inspections, review deadlines, NVZ limits", category: "critical" as const },
  { key: "stock_reconciliation", label: "Stock Reconciliation Alerts", description: "Unaccounted livestock discrepancies", category: "critical" as const },
  { key: "tbtest_result", label: "TB Test Results Due", description: "TB test results pending / reactor notification", category: "critical" as const },
  { key: "medicine_withdrawal", label: "Withdrawal Period Expiry", description: "Animal medicines withdrawal completing today", category: "standard" as const },
  { key: "movement_pending", label: "Movement Notifications", description: "Livestock movement requires action within 3 days", category: "standard" as const },
  { key: "weather_alert", label: "Crop & Weather Alerts", description: "Spray block, frost, flood risk on field schedule", category: "standard" as const },
  { key: "task_overdue", label: "Overdue Tasks", description: "Assigned tasks overdue by more than 24 hours", category: "standard" as const },
];

export default function SMSAlertsPage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = usePersistedTab<"config" | "team" | "history">({ page: "sms-alerts", farmId, validIds: ["config", "team", "history"], defaultTab: "config" });

  const teamQ = useQuery<TeamMember[]>({
    queryKey: ["farms", farmId, "team-sms"],
    queryFn: () => api.get(`/farms/${farmId}/team`).then(r => r.members ?? []),
    enabled: !!farmId,
  });

  const alertConfigQ = useQuery<FarmAlertConfig>({
    queryKey: ["farms", farmId, "alert-config"],
    queryFn: () => api.get(`/farms/${farmId}/alert-config`).then(r => r).catch(() => ({
      smsEnabled: true,
      alertTypes: DEFAULT_ALERT_TYPES.map(t => ({ ...t, enabled: t.category === "critical" })),
      recentAlerts: [],
    })),
    enabled: !!farmId,
  });

  const saveConfigMut = useMutation({
    mutationFn: (body: any) => api.put(`/farms/${farmId}/alert-config`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["farms", farmId, "alert-config"] });
      toast({ title: "Alert configuration saved" });
    },
    onError: () => toast({ title: "Failed to save configuration", variant: "destructive" }),
  });

  const team = teamQ.data ?? [];
  const config = alertConfigQ.data;
  const alertTypes = config?.alertTypes ?? DEFAULT_ALERT_TYPES.map(t => ({ ...t, enabled: t.category === "critical" }));
  const recentAlerts = config?.recentAlerts ?? [];

  const smsEnabled = team.filter(m => m.phoneNumber && m.smsOptIn !== "none" && m.receiveAlerts).length;
  const smsOptedOut = team.filter(m => !m.phoneNumber || m.smsOptIn === "none").length;

  return (
    <AppLayout title="SMS & Alert Settings">
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <strong>SMS Alerts</strong> — Critical farm events trigger text messages to opted-in team members. Standard alerts appear as in-app notifications; only critical alerts send SMS.
      </div>

      <div className="mb-5 grid grid-cols-3 gap-3">
        {[
          { label: "SMS Enabled", value: `${smsEnabled} recipient${smsEnabled !== 1 ? "s" : ""}`, icon: Smartphone, green: smsEnabled > 0 },
          { label: "Opted Out / No Number", value: smsOptedOut, icon: BellOff, amber: smsOptedOut > 0 },
          { label: "Recent Alerts (30d)", value: recentAlerts.filter(a => new Date(a.sentAt) > new Date(Date.now() - 30 * 86400000)).length, icon: Bell },
        ].map((s, i) => (
          <div key={i} className="bg-white border rounded-lg p-4 flex items-center gap-3">
            <s.icon className={`w-5 h-5 ${s.green ? "text-green-600" : s.amber ? "text-amber-600" : "text-muted-foreground"}`} />
            <div>
              <div className={`text-lg font-bold ${s.green ? "text-green-700" : s.amber ? "text-amber-600" : ""}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-5">
        {(["config", "team", "history"] as const).map(t => (
          <Button key={t} size="sm" variant={activeTab === t ? "default" : "outline"} onClick={() => setActiveTab(t)}>
            {t === "config" ? "Alert Types" : t === "team" ? <><Users className="w-3.5 h-3.5 mr-1" />Team Recipients</> : "History"}
          </Button>
        ))}
      </div>

      {activeTab === "config" && (
        <div className="space-y-4">
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
              <div className="font-medium text-sm">Alert Type Configuration</div>
              <Button
                size="sm"
                onClick={() => saveConfigMut.mutate({ alertTypes })}
                disabled={saveConfigMut.isPending}
              >
                {saveConfigMut.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </div>

            <div className="divide-y">
              {alertTypes.map((at, i) => (
                <div key={at.key} className="px-4 py-3 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{at.label}</span>
                      <Badge className={`text-xs ${at.category === "critical" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>
                        {at.category === "critical" ? "SMS" : "In-app"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{at.description}</p>
                  </div>
                  <Switch
                    checked={at.enabled}
                    onCheckedChange={checked => {
                      const updated = alertTypes.map((a, j) => j === i ? { ...a, enabled: checked } : a);
                      saveConfigMut.mutate({ alertTypes: updated });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            <div className="flex items-center gap-2 font-medium mb-1">
              <AlertTriangle className="w-4 h-4" />SMS message costs
            </div>
            <p className="text-xs">Each SMS costs a small amount per recipient. Critical alerts only fire when the system detects a genuine threshold breach — not on every record save. Estimated volume: 2–5 SMS/month per farm for typical operations.</p>
          </div>
        </div>
      )}

      {activeTab === "team" && (
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Each team member controls their own SMS preference from their <strong>Account &amp; Notifications</strong> page. Admins can see the status here.</span>
          </div>

          {teamQ.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading team…</p>
          ) : team.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="mx-auto mb-2 w-8 h-8 opacity-30" />
              <p>No team members found.</p>
            </div>
          ) : (
            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Name</th>
                    <th className="px-4 py-2 text-left font-medium">Phone</th>
                    <th className="px-4 py-2 text-center font-medium">SMS Preference</th>
                    <th className="px-4 py-2 text-center font-medium">Alerts Active</th>
                    <th className="px-4 py-2 text-center font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {team.map(m => {
                    const isEnabled = !!m.phoneNumber && m.smsOptIn !== "none" && m.receiveAlerts;
                    return (
                      <tr key={m.id} className="border-t">
                        <td className="px-4 py-2">
                          <div className="font-medium">{m.name}</div>
                          <div className="text-xs text-muted-foreground">{m.email}</div>
                        </td>
                        <td className="px-4 py-2 text-xs">
                          {m.phoneNumber ?? <span className="text-amber-600">Not set</span>}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <Badge className={`text-xs capitalize ${
                            m.smsOptIn === "all" ? "bg-green-100 text-green-800" :
                            m.smsOptIn === "critical" ? "bg-blue-100 text-blue-800" :
                            "bg-gray-100 text-gray-600"
                          }`}>
                            {m.smsOptIn === "all" ? "All alerts" : m.smsOptIn === "critical" ? "Critical only" : "None"}
                          </Badge>
                        </td>
                        <td className="px-4 py-2 text-center">
                          {m.receiveAlerts
                            ? <CheckCircle2 className="w-4 h-4 text-green-600 mx-auto" />
                            : <BellOff className="w-4 h-4 text-gray-400 mx-auto" />}
                        </td>
                        <td className="px-4 py-2 text-center">
                          {isEnabled
                            ? <Badge className="bg-green-100 text-green-800 text-xs">Receiving SMS</Badge>
                            : <Badge className="bg-gray-100 text-gray-600 text-xs">Not receiving</Badge>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-3">
          {recentAlerts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-lg">
              <MessageSquare className="mx-auto mb-2 w-8 h-8 opacity-30" />
              <p>No alerts have been sent recently.</p>
            </div>
          ) : (
            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Sent</th>
                    <th className="px-4 py-2 text-left font-medium">Type</th>
                    <th className="px-4 py-2 text-left font-medium">Message</th>
                    <th className="px-4 py-2 text-center font-medium">Severity</th>
                    <th className="px-4 py-2 text-right font-medium">Recipients</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAlerts.sort((a, b) => b.sentAt.localeCompare(a.sentAt)).map(a => (
                    <tr key={a.id} className="border-t">
                      <td className="px-4 py-2 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(a.sentAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-4 py-2 text-xs">{a.alertType.replace(/_/g, " ")}</td>
                      <td className="px-4 py-2 text-xs">{a.message}</td>
                      <td className="px-4 py-2 text-center">
                        <Badge className={`text-xs ${a.severity === "critical" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>
                          {a.severity}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-right">{a.recipientCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
