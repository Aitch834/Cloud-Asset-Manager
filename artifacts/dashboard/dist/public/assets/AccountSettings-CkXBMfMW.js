import { a as useToast, b as useAppStore, m as useQuery, r as reactExports, j as jsxRuntimeExports, e as LoaderCircle, n as Card, a$ as CardHeader, b0 as CardTitle, o as CardContent, L as Label, d as Button, I as Input } from "./index-_JeaBfjF.js";
import { A as AppLayout, q as Smartphone, I as Info } from "./AppLayout-EHbyLFB1.js";
import { S as Switch } from "./switch-DxUV39iH.js";
import { a as apiUrl } from "./api-Dhdsf4oM.js";
import { M as Mail } from "./mail-Cd5Q6djB.js";
import { L as Lock } from "./lock-DasA4_9O.js";
import "./use-safe-clerk-CnSEb5Nk.js";
import "./trash-2-BNupzTBr.js";
import "./database-Dnal3X8e.js";
import "./shield-alert-DUPgwCFb.js";
import "./triangle-alert-5YdtRJw5.js";
import "./shield-check-DNM4U_9y.js";
import "./tractor-Cc4HodSs.js";
const SMS_CATEGORIES = [
  {
    key: "livestock",
    label: "Livestock & Animals",
    description: "Welfare alerts, withdrawal breaches, notifiable disease, herd health follow-ups.",
    moduleGates: [
      "livestock-management",
      "livestock",
      "beef-production",
      "sheep-production",
      "goat-production",
      "venison-production",
      "pig-production",
      "poultry-production",
      "organic-livestock"
    ]
  },
  {
    key: "dairy",
    label: "Dairy",
    description: "ABR test results, mastitis records, mobility scoring alerts.",
    moduleGates: [
      "dairy-management",
      "sheep-dairy",
      "goat-dairy",
      "organic-dairy",
      "organic-sheep-dairy",
      "organic-goat-dairy"
    ]
  },
  {
    key: "arable",
    label: "Arable & Crops",
    description: "IPM pest/disease threshold alerts, irrigation advisories, field scouting flags.",
    moduleGates: [
      "field-crop-management",
      "crop-management",
      "fresh-produce",
      "organic-fresh-produce",
      "water-irrigation",
      "organic-arable"
    ]
  },
  {
    key: "viticulture",
    label: "Viticulture & Winery",
    description: "Vineyard and winery compliance alerts.",
    moduleGates: ["viticulture"]
  },
  {
    key: "tasks",
    label: "Task Assignments & Reminders",
    description: "Notifications when tasks are assigned to you, and timesheet submission reminders.",
    moduleGates: []
  },
  {
    key: "regulatory",
    label: "Regulatory Compliance",
    description: "Withdrawal period breaches, biosecurity declarations, SSAFO inspections, RIDDOR incidents.",
    moduleGates: []
  },
  {
    key: "quality",
    label: "Quality & Non-conformances",
    description: "Non-conformance records, corrective actions, feed intake rejections.",
    moduleGates: []
  },
  {
    key: "stock",
    label: "Stock & Supplies",
    description: "Stock-low and stock-out alerts across feed, medicines, and supplies.",
    moduleGates: []
  }
];
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
  const [savingEmail, setSavingEmail] = reactExports.useState(false);
  const [phoneNumber, setPhoneNumber] = reactExports.useState("");
  const [smsEnabled, setSmsEnabled] = reactExports.useState(false);
  const [categoryStates, setCategoryStates] = reactExports.useState({});
  const [consentChecked, setConsentChecked] = reactExports.useState(false);
  const [emailSectorAlerts, setEmailSectorAlerts] = reactExports.useState(true);
  const activeModules = dashboardData?.activeSubscriptions ?? [];
  const hasSmsModule = activeModules.some((m) => m.moduleKey === "sms-alerts");
  const activeModuleKeys = new Set(activeModules.map((m) => String(m.moduleKey)));
  const visibleCategories = SMS_CATEGORIES.filter(
    (cat) => cat.moduleGates.length === 0 || cat.moduleGates.some((g) => activeModuleKeys.has(g))
  );
  reactExports.useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(apiUrl("account/profile"));
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        setProfile(data);
        setPhoneNumber(data.phoneNumber ?? "");
        setSmsEnabled(data.smsOptIn !== "none");
        if (data.smsConsentAt) setConsentChecked(true);
        const saved = data.smsCategories;
        const initial = {};
        for (const cat of SMS_CATEGORIES) {
          initial[cat.key] = saved == null ? true : saved[cat.key] ?? true;
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
        body: JSON.stringify({ emailSectorAlerts })
      });
      if (!res.ok) {
        const err = await res.json();
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
      const payload = {
        phoneNumber: phoneNumber.trim(),
        smsOptIn: smsEnabled ? "all" : "none",
        smsCategories: smsEnabled ? categoryStates : null,
        consentGiven: smsEnabled ? consentChecked : void 0
      };
      const res = await fetch(apiUrl("account/profile"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "w-4 h-4 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-semibold", children: "Email Notifications" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1 leading-relaxed", children: "Control which platform emails you receive. These settings do not affect your account security emails." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 rounded-xl border border-border px-4 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Sector alert emails" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5 leading-relaxed", children: "Email notifications when a disease or pest sector alert is issued or lifted. Advisors managing many farms may prefer to disable these." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Switch,
            {
              checked: emailSectorAlerts,
              onCheckedChange: setEmailSectorAlerts,
              className: "mt-0.5 flex-shrink-0"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleSaveEmailPrefs, disabled: savingEmail, className: "w-full", children: savingEmail ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 mr-2 animate-spin" }),
          "Saving…"
        ] }) : "Save email preferences" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "w-4 h-4 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-semibold", children: "SMS Text Notifications" }),
          hasSmsModule && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto text-[10px] font-bold uppercase tracking-widest text-green-600 bg-green-50 px-2 py-0.5 rounded-full", children: "Active" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1 leading-relaxed", children: "Each team member independently controls which alert categories they receive — so dairy managers only get dairy alerts, cereals managers only get arable alerts." })
      ] }),
      !hasSmsModule ? /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-dashed border-border bg-muted/30 p-5 flex flex-col items-center text-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-muted flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-5 h-5 text-muted-foreground" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground", children: "SMS Alerts add-on not active" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1 leading-relaxed max-w-xs mx-auto", children: "SMS Text Alerts is available as a paid add-on per farm. Once activated, each team member chooses which alert categories they receive." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "To add this, contact your BDE Farm Trac account manager or visit your subscription settings." })
      ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-5", children: [
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
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "UK number in international format, e.g. +447911123456" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Enable SMS text notifications" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Turn off to stop all SMS alerts regardless of category settings below." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Switch,
            {
              checked: smsEnabled,
              onCheckedChange: (v) => {
                setSmsEnabled(v);
                if (!v) setConsentChecked(false);
              },
              disabled: !phoneNumber.trim()
            }
          )
        ] }),
        smsEnabled && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Alert categories" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-[11px] text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-3 h-3 flex-shrink-0" }),
              "Only categories relevant to your farm are shown"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-border divide-y divide-border", children: visibleCategories.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 px-3.5 py-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: cat.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5 leading-relaxed", children: cat.description })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Switch,
              {
                checked: categoryStates[cat.key] ?? true,
                onCheckedChange: (v) => setCategoryStates((prev) => ({ ...prev, [cat.key]: v })),
                className: "mt-0.5 flex-shrink-0"
              }
            )
          ] }, cat.key)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground pt-0.5", children: "Disable categories you're not responsible for. A dairy manager can silence livestock alerts; a cereals manager can silence dairy and livestock alerts." }),
          visibleCategories.length > 0 && visibleCategories.every((cat) => categoryStates[cat.key] === false) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-3 text-amber-800", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-0.5 text-base leading-none flex-shrink-0", children: "⚠" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs leading-relaxed", children: "SMS is enabled but every category is off — you won't receive any text alerts." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-border bg-muted/40 px-3.5 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground leading-relaxed", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-medium text-foreground", children: "Farm Managers" }),
          " are automatically included in critical alerts when a mobile number is saved. Disabling SMS entirely always overrides this designation. Your BDE Farm Trac account administrator can update your alert designation."
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
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors", children: "I consent to BDE Farm Trac sending me compliance alert text messages to the number above. I understand I can withdraw consent at any time by disabling SMS notifications above." })
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
