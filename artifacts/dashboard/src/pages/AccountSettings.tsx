import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiUrl } from "@/lib/api";
import { useState, useEffect } from "react";
import { Smartphone, Loader2, Lock, Info, Mail } from "lucide-react";
import { useAppStore } from "@/hooks/use-app-store";
import { useQuery } from "@tanstack/react-query";

interface AccountProfile {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  smsOptIn: string;
  smsConsentAt: string | null;
  smsCategories: Record<string, boolean> | null;
  emailSectorAlerts: boolean;
}

const SMS_CATEGORIES: ReadonlyArray<{
  key: string;
  label: string;
  description: string;
  moduleGates: ReadonlyArray<string>;
}> = [
  {
    key: "livestock",
    label: "Livestock & Animals",
    description: "Welfare alerts, withdrawal breaches, notifiable disease, herd health follow-ups.",
    moduleGates: [
      "livestock-management", "livestock",
      "beef-production", "sheep-production", "goat-production", "venison-production",
      "pig-production", "poultry-production",
      "organic-livestock",
    ],
  },
  {
    key: "dairy",
    label: "Dairy",
    description: "ABR test results, mastitis records, mobility scoring alerts.",
    moduleGates: [
      "dairy-management",
      "sheep-dairy", "goat-dairy",
      "organic-dairy", "organic-sheep-dairy", "organic-goat-dairy",
    ],
  },
  {
    key: "arable",
    label: "Arable & Crops",
    description: "IPM pest/disease threshold alerts, irrigation advisories, field scouting flags.",
    moduleGates: [
      "field-crop-management", "crop-management",
      "fresh-produce", "organic-fresh-produce",
      "water-irrigation",
      "organic-arable",
    ],
  },
  {
    key: "viticulture",
    label: "Viticulture & Winery",
    description: "Vineyard and winery compliance alerts.",
    moduleGates: ["viticulture"],
  },
  {
    key: "tasks",
    label: "Task Assignments & Reminders",
    description: "Notifications when tasks are assigned to you, and timesheet submission reminders.",
    moduleGates: [],
  },
  {
    key: "regulatory",
    label: "Regulatory Compliance",
    description: "Withdrawal period breaches, biosecurity declarations, SSAFO inspections, RIDDOR incidents.",
    moduleGates: [],
  },
  {
    key: "quality",
    label: "Quality & Non-conformances",
    description: "Non-conformance records, corrective actions, feed intake rejections.",
    moduleGates: [],
  },
  {
    key: "stock",
    label: "Stock & Supplies",
    description: "Stock-low and stock-out alerts across feed, medicines, and supplies.",
    moduleGates: [],
  },
];

export default function AccountSettings() {
  const { toast } = useToast();
  const { farmId } = useAppStore();
  const { data: dashboardData } = useQuery<{
    activeSubscriptions: Array<{ moduleKey: string; moduleName: string; status: string }>;
  }>({
    queryKey: ["farm-dashboard", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/dashboard`).then(r => r.json()),
    enabled: !!farmId,
  });

  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [categoryStates, setCategoryStates] = useState<Record<string, boolean>>({});
  const [consentChecked, setConsentChecked] = useState(false);
  const [emailSectorAlerts, setEmailSectorAlerts] = useState(true);

  const activeModules = (dashboardData?.activeSubscriptions ?? []) as Array<Record<string, unknown>>;
  const hasSmsModule = activeModules.some((m) => m.moduleKey === "sms-alerts");
  const activeModuleKeys = new Set(activeModules.map((m) => String(m.moduleKey)));

  const visibleCategories = SMS_CATEGORIES.filter(cat =>
    cat.moduleGates.length === 0 || cat.moduleGates.some(g => activeModuleKeys.has(g))
  );

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(apiUrl("account/profile"));
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json() as AccountProfile;
        setProfile(data);
        setPhoneNumber(data.phoneNumber ?? "");
        setSmsEnabled(data.smsOptIn !== "none");
        if (data.smsConsentAt) setConsentChecked(true);
        // null = legacy (all categories on); otherwise use saved values, defaulting absent keys to true
        const saved = data.smsCategories;
        const initial: Record<string, boolean> = {};
        for (const cat of SMS_CATEGORIES) {
          initial[cat.key] = saved == null ? true : (saved[cat.key] ?? true);
        }
        setCategoryStates(initial);
        setEmailSectorAlerts(data.emailSectorAlerts ?? true);
      } catch {
        toast({ title: "Could not load account profile", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    void fetchProfile();
  }, [toast]);

  async function handleSaveEmailPrefs() {
    setSavingEmail(true);
    try {
      const res = await fetch(apiUrl("account/profile"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailSectorAlerts }),
      });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "Save failed");
      }
      toast({ title: "Email preferences saved" });
    } catch (err) {
      toast({ title: String(err instanceof Error ? err.message : err), variant: "destructive" });
    } finally {
      setSavingEmail(false);
    }
  }

  async function handleSave() {
    if (smsEnabled && !consentChecked) {
      toast({ title: "Please tick the consent box before enabling SMS alerts.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        phoneNumber: phoneNumber.trim(),
        smsOptIn: smsEnabled ? "all" : "none",
        smsCategories: smsEnabled ? categoryStates : null,
        consentGiven: smsEnabled ? consentChecked : undefined,
      };
      const res = await fetch(apiUrl("account/profile"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "Save failed");
      }
      toast({ title: "Notification preferences saved" });
    } catch (err) {
      toast({ title: String(err instanceof Error ? err.message : err), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AppLayout title="Account & Notifications">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Account & Notifications">
      <div className="space-y-6 max-w-lg">

        {/* Account info (read-only) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">First name</Label>
                <p className="text-sm font-medium mt-0.5">{profile?.firstName ?? "—"}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Last name</Label>
                <p className="text-sm font-medium mt-0.5">{profile?.lastName ?? "—"}</p>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Email</Label>
              <p className="text-sm font-medium mt-0.5">{profile?.email ?? "—"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Email Notifications */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Email Notifications</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Control which platform emails you receive. These settings do not affect your account security emails.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start justify-between gap-3 rounded-xl border border-border px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">Sector alert emails</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Email notifications when a disease or pest sector alert is issued or lifted. Advisors managing many farms may prefer to disable these.
                </p>
              </div>
              <Switch
                checked={emailSectorAlerts}
                onCheckedChange={setEmailSectorAlerts}
                className="mt-0.5 flex-shrink-0"
              />
            </div>
            <Button onClick={handleSaveEmailPrefs} disabled={savingEmail} className="w-full">
              {savingEmail ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : "Save email preferences"}
            </Button>
          </CardContent>
        </Card>

        {/* SMS Notifications */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-semibold">SMS Text Notifications</CardTitle>
              {hasSmsModule && (
                <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Active</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Each team member independently controls which alert categories they receive — so dairy managers only get dairy alerts, cereals managers only get arable alerts.
            </p>
          </CardHeader>

          {!hasSmsModule ? (
            <CardContent>
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5 flex flex-col items-center text-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">SMS Alerts add-on not active</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-xs mx-auto">
                    SMS Text Alerts is available as an add-on for £4/month per farm. Once activated, each team member chooses which alert categories they receive.
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  To add this, contact your BDE Farm Trac account manager or visit your subscription settings.
                </p>
              </div>
            </CardContent>
          ) : (
            <CardContent className="space-y-5">

              {/* Phone number */}
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-sm">Mobile number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+447911123456"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  UK number in international format, e.g. +447911123456
                </p>
              </div>

              {/* Master toggle */}
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Enable SMS text notifications</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Turn off to stop all SMS alerts regardless of category settings below.
                  </p>
                </div>
                <Switch
                  checked={smsEnabled}
                  onCheckedChange={(v) => {
                    setSmsEnabled(v);
                    if (!v) setConsentChecked(false);
                  }}
                  disabled={!phoneNumber.trim()}
                />
              </div>

              {/* Per-category toggles */}
              {smsEnabled && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium">Alert categories</p>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Info className="w-3 h-3 flex-shrink-0" />
                      Only categories relevant to your farm are shown
                    </span>
                  </div>
                  <div className="rounded-xl border border-border divide-y divide-border">
                    {visibleCategories.map((cat) => (
                      <div key={cat.key} className="flex items-start justify-between gap-3 px-3.5 py-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{cat.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{cat.description}</p>
                        </div>
                        <Switch
                          checked={categoryStates[cat.key] ?? true}
                          onCheckedChange={(v) =>
                            setCategoryStates(prev => ({ ...prev, [cat.key]: v }))
                          }
                          className="mt-0.5 flex-shrink-0"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground pt-0.5">
                    Disable categories you're not responsible for. A dairy manager can silence livestock alerts; a cereals manager can silence dairy and livestock alerts.
                  </p>
                  {visibleCategories.length > 0 && visibleCategories.every(cat => categoryStates[cat.key] === false) && (
                    <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-3 text-amber-800">
                      <span className="mt-0.5 text-base leading-none flex-shrink-0">⚠</span>
                      <p className="text-xs leading-relaxed">
                        SMS is enabled but every category is off — you won't receive any text alerts.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Farm Manager note */}
              <div className="rounded-lg border border-border bg-muted/40 px-3.5 py-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="font-medium text-foreground">Farm Managers</strong> are automatically included in critical alerts when a mobile number is saved. Disabling SMS entirely always overrides this designation. Your BDE Farm Trac account administrator can update your alert designation.
                </p>
              </div>

              {/* GDPR consent */}
              {smsEnabled && (
                <label className="flex items-start gap-3 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-border accent-primary flex-shrink-0"
                  />
                  <span className="text-xs text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                    I consent to BDE Farm Trac sending me compliance alert text messages to the number above.
                    I understand I can withdraw consent at any time by disabling SMS notifications above.
                  </span>
                </label>
              )}

              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : "Save preferences"}
              </Button>

            </CardContent>
          )}
        </Card>

      </div>
    </AppLayout>
  );
}
