import { q as createLucideIcon, a as useToast, b as useAppStore, l as useQuery, r as reactExports, j as jsxRuntimeExports, d as LoaderCircle, m as Card, aZ as CardHeader, a_ as CardTitle, n as CardContent, L as Label, I as Input, c as Button } from "./index-D-jKMZvJ.js";
import { A as AppLayout, p as Smartphone } from "./AppLayout-DvS9fOSf.js";
import { L as Lock } from "./lock-BfXiM4_D.js";
import { B as BellOff } from "./bell-off-CFSw6NVK.js";
import { T as TriangleAlert } from "./triangle-alert-Bh16JzE3.js";
import { C as CircleCheck } from "./circle-check-C84e-I-U.js";
import "./use-safe-clerk-BB-T0FZN.js";
import "./trash-2-BfNU5HPB.js";
import "./database-CQIXn7CT.js";
import "./shield-alert-CkXWHnZC.js";
import "./shield-check-CSEKle18.js";
import "./tractor-Chk-9Qrj.js";
const __iconNode = [
  ["path", { d: "M10.268 21a2 2 0 0 0 3.464 0", key: "vwvbt9" }],
  ["path", { d: "M22 8c0-2.3-.8-4.3-2-6", key: "5bb3ad" }],
  [
    "path",
    {
      d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",
      key: "11g9vi"
    }
  ],
  ["path", { d: "M4 2C2.8 3.7 2 5.7 2 8", key: "tap9e0" }]
];
const BellRing = createLucideIcon("bell-ring", __iconNode);
function SmsLevelButton({ value, current, icon: Icon, label, description, onChange, disabled }) {
  const isSelected = current === value;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      onClick: () => !disabled && onChange(value),
      disabled,
      className: `w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${disabled ? "border-border opacity-50 cursor-not-allowed" : isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/40 hover:bg-black/[0.02]"}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `w-4 h-4 mt-0.5 flex-shrink-0 ${isSelected && !disabled ? "text-primary" : "text-muted-foreground"}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-sm font-medium ${isSelected && !disabled ? "text-primary" : "text-foreground"}`, children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5 leading-relaxed", children: description })
        ] }),
        isSelected && !disabled && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 text-primary ml-auto flex-shrink-0 mt-0.5" })
      ]
    }
  );
}
function AccountSettings() {
  const { toast } = useToast();
  const { farmId } = useAppStore();
  const { data: dashboardData } = useQuery({
    queryKey: ["farm-dashboard", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/dashboard`).then((r) => r.json()),
    enabled: !!farmId
  });
  const [profile, setProfile] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [saving, setSaving] = reactExports.useState(false);
  const [phoneNumber, setPhoneNumber] = reactExports.useState("");
  const [smsOptIn, setSmsOptIn] = reactExports.useState("none");
  const [consentChecked, setConsentChecked] = reactExports.useState(false);
  const activeModules = dashboardData?.activeSubscriptions ?? [];
  const hasSmsModule = activeModules.some((m) => m.moduleKey === "sms-alerts");
  reactExports.useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`${"/dashboard/"}api/account/profile`);
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        setProfile(data);
        setPhoneNumber(data.phoneNumber ?? "");
        setSmsOptIn(data.smsOptIn ?? "none");
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
      const res = await fetch(`${"/dashboard/"}api/account/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phoneNumber.trim(), smsOptIn })
      });
      if (!res.ok) {
        const err = await res.json();
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
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Account & Notifications", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin text-muted-foreground" }) }) });
  }
  const smsEnabled = smsOptIn !== "none";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Account & Notifications", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 max-w-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-semibold", children: "Account" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "First name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium mt-0.5", children: profile?.firstName ?? "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Last name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium mt-0.5", children: profile?.lastName ?? "—" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium mt-0.5", children: profile?.email ?? "—" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "w-4 h-4 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-semibold", children: "SMS Text Notifications" }),
          hasSmsModule && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto text-[10px] font-bold uppercase tracking-widest text-green-600 bg-green-50 px-2 py-0.5 rounded-full", children: "Active" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1 leading-relaxed", children: "Receive critical compliance alerts by text message. UK mobile numbers only." })
      ] }),
      !hasSmsModule ? /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-dashed border-border bg-muted/30 p-5 flex flex-col items-center text-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-muted flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-5 h-5 text-muted-foreground" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground", children: "SMS Alerts add-on not active" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1 leading-relaxed max-w-xs mx-auto", children: "SMS Text Alerts is available as an add-on for £4/month per farm. Once activated, each user on your account can choose their own alert level." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "To add this, contact your BDE Farm Trac account manager or visit your subscription settings." })
      ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "phone", className: "text-sm", children: "Mobile number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "phone",
              type: "tel",
              placeholder: "+447911123456",
              value: phoneNumber,
              onChange: (e) => setPhoneNumber(e.target.value),
              className: "font-mono"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Enter your UK number in international format, e.g. +447911123456" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Alert level" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              SmsLevelButton,
              {
                value: "none",
                current: smsOptIn,
                icon: BellOff,
                label: "No SMS alerts",
                description: "You will only receive in-app notifications.",
                onChange: setSmsOptIn
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              SmsLevelButton,
              {
                value: "critical",
                current: smsOptIn,
                icon: TriangleAlert,
                label: "Critical alerts only",
                description: "Text only for the most urgent issues: unnotified livestock movements, water quality failures, expired certificates, and overdue non-conformances.",
                onChange: setSmsOptIn
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              SmsLevelButton,
              {
                value: "all",
                current: smsOptIn,
                icon: BellRing,
                label: "All alerts",
                description: "Text for every compliance notification including warnings and reminders.",
                onChange: setSmsOptIn
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-border bg-muted/40 px-3.5 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground leading-relaxed", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-medium text-foreground", children: "Farm Managers" }),
          ' are automatically included in critical alerts when a mobile number is saved — even if no alert level is selected above. Setting "No SMS alerts" will always override this. Your BDE Farm Trac account administrator can update your alert designation.'
        ] }) }),
        smsEnabled && /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-3 cursor-pointer select-none group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              checked: consentChecked,
              onChange: (e) => setConsentChecked(e.target.checked),
              className: "mt-0.5 w-4 h-4 rounded border-border accent-primary flex-shrink-0"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors", children: 'I consent to BDE Farm Trac sending me compliance alert text messages to the number above. I understand I can withdraw consent at any time by setting the alert level to "No SMS alerts".' })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleSave, disabled: saving, className: "w-full", children: saving ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 mr-2 animate-spin" }),
          "Saving…"
        ] }) : "Save preferences" })
      ] })
    ] })
  ] }) });
}
export {
  AccountSettings as default
};
