import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Smartphone, BellRing, BellOff, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";

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

function SmsLevelButton({ value, current, icon: Icon, label, description, onChange }: {
  value: SmsOptIn;
  current: SmsOptIn;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  onChange: (v: SmsOptIn) => void;
}) {
  const isSelected = current === value;
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
        isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border hover:border-primary/40 hover:bg-black/[0.02]"
      }`}
    >
      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
      <div>
        <p className={`text-sm font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
      </div>
      {isSelected && <CheckCircle2 className="w-4 h-4 text-primary ml-auto flex-shrink-0 mt-0.5" />}
    </button>
  );
}

export default function AccountSettings() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [smsOptIn, setSmsOptIn] = useState<SmsOptIn>("none");
  const [consentChecked, setConsentChecked] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}api/account/profile`);
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
      const res = await fetch(`${import.meta.env.BASE_URL}api/account/profile`, {
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
            </div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Receive compliance alerts by text message. UK mobile numbers only.
            </p>
          </CardHeader>
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
                  description="Text only for the most urgent issues: unnotified livestock movements, expired certificates, and overdue non-conformances."
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
        </Card>

      </div>
    </AppLayout>
  );
}
