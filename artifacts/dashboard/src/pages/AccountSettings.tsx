import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiUrl } from "@/lib/api";
import { useState, useEffect } from "react";
import { Smartphone, BellRing, BellOff, AlertTriangle, Loader2, CheckCircle2, Lock } from "lucide-react";
import { useAppStore } from "@/hooks/use-app-store";
import { useQuery } from "@tanstack/react-query";

type SmsOptIn = "all" | "critical" | "none";

interface AccountProfile {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  smsOptIn: string;
  smsConsentAt: string | null;
}

function SmsLevelButton({ value, current, icon: Icon, label, description, onChange, disabled }: {
  value: SmsOptIn;
  current: SmsOptIn;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  onChange: (v: SmsOptIn) => void;
  disabled?: boolean;
}) {
  const isSelected = current === value;
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(value)}
      disabled={disabled}
      className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
        disabled
          ? "border-border opacity-50 cursor-not-allowed"
          : isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border hover:border-primary/40 hover:bg-black/[0.02]"
      }`}
    >
      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isSelected && !disabled ? "text-primary" : "text-muted-foreground"}`} />
      <div>
        <p className={`text-sm font-medium ${isSelected && !disabled ? "text-primary" : "text-foreground"}`}>{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
      </div>
      {isSelected && !disabled && <CheckCircle2 className="w-4 h-4 text-primary ml-auto flex-shrink-0 mt-0.5" />}
    </button>
  );
}

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

  const [phoneNumber, setPhoneNumber] = useState("");
  const [smsOptIn, setSmsOptIn] = useState<SmsOptIn>("none");
  const [consentChecked, setConsentChecked] = useState(false);

  const activeModules = (dashboardData?.activeSubscriptions ?? []) as unknown as Array<Record<string, unknown>>;
  const hasSmsModule = activeModules.some((m) => m.moduleKey === "sms-alerts");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(apiUrl("account/profile"));
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json() as AccountProfile;
        setProfile(data);
        setPhoneNumber(data.phoneNumber ?? "");
        setSmsOptIn((data.smsOptIn as SmsOptIn) ?? "none");
        if (data.smsConsentAt) setConsentChecked(true);
      } catch {
        toast({ title: "Could not load account profile", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  async function handleSave() {
    if (smsOptIn !== "none" && !consentChecked) {
      toast({ title: "Please tick the consent box before enabling SMS alerts.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(apiUrl("account/profile"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phoneNumber.trim(), smsOptIn }),
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

  const smsEnabled = smsOptIn !== "none";

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
              Receive critical compliance alerts by text message. UK mobile numbers only.
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
                    SMS Text Alerts is available as an add-on for £4/month per farm. Once activated, each user on your account can choose their own alert level.
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  To add this, contact your BDE Farm Trac account manager or visit your subscription settings.
                </p>
              </div>
            </CardContent>
          ) : (
            <CardContent className="space-y-4">

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
                  Enter your UK number in international format, e.g. +447911123456
                </p>
              </div>

              {/* Alert level */}
              <div className="space-y-2">
                <Label className="text-sm">Alert level</Label>
                <div className="space-y-2">
                  <SmsLevelButton
                    value="none"
                    current={smsOptIn}
                    icon={BellOff}
                    label="No SMS alerts"
                    description="You will only receive in-app notifications."
                    onChange={setSmsOptIn}
                  />
                  <SmsLevelButton
                    value="critical"
                    current={smsOptIn}
                    icon={AlertTriangle}
                    label="Critical alerts only"
                    description="Text only for the most urgent issues: unnotified livestock movements, water quality failures, expired certificates, and overdue non-conformances."
                    onChange={setSmsOptIn}
                  />
                  <SmsLevelButton
                    value="all"
                    current={smsOptIn}
                    icon={BellRing}
                    label="All alerts"
                    description="Text for every compliance notification including warnings and reminders."
                    onChange={setSmsOptIn}
                  />
                </div>
              </div>

              {/* Manager designation note */}
              <div className="rounded-lg border border-border bg-muted/40 px-3.5 py-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="font-medium text-foreground">Farm Managers</strong> are automatically included in critical alerts when a mobile number is saved — even if no alert level is selected above. Setting "No SMS alerts" will always override this. Your BDE Farm Trac account administrator can update your alert designation.
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
                    I understand I can withdraw consent at any time by setting the alert level to "No SMS alerts".
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
