import { q as createLucideIcon, b as useAppStore, l as useQuery, j as jsxRuntimeExports, m as Card, n as CardContent, M as MapPin, o as Link } from "./index-R4XICohc.js";
import { A as AppLayout, U as Users, o as Bell } from "./AppLayout-p836YkSR.js";
import { C as CreditCard } from "./credit-card-B21Mxhn4.js";
import { C as CircleCheck } from "./circle-check-6m9i0MuK.js";
import { S as ShieldCheck } from "./shield-check-CjTpMlqB.js";
import { P as Package } from "./use-safe-clerk-9Diu1NTz.js";
import { C as ChevronRight } from "./tractor-DsJv_0QH.js";
import "./trash-2-CW0p5gY-.js";
import "./database-Dj8SDLcA.js";
import "./shield-alert-DLMzHCQQ.js";
import "./triangle-alert-DoYQtXrW.js";
const __iconNode = [
  ["circle", { cx: "18", cy: "5", r: "3", key: "gq8acd" }],
  ["circle", { cx: "6", cy: "12", r: "3", key: "w7nqdw" }],
  ["circle", { cx: "18", cy: "19", r: "3", key: "1xt0gg" }],
  ["line", { x1: "8.59", x2: "15.42", y1: "13.51", y2: "17.49", key: "47mynk" }],
  ["line", { x1: "15.41", x2: "8.59", y1: "6.51", y2: "10.49", key: "1n3mei" }]
];
const Share2 = createLucideIcon("share-2", __iconNode);
function SettingRow({ icon: Icon, label, description, href }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { href, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 p-4 rounded-xl hover:bg-black/[0.03] transition-colors cursor-pointer group", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-5 h-5 text-primary" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground text-sm", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: description })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" })
  ] }) });
}
function SettingsPage() {
  const { farmId } = useAppStore();
  const { data: dashboardData } = useQuery({
    queryKey: ["farm-dashboard", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/dashboard`).then((r) => r.json()),
    enabled: !!farmId
  });
  const activeModules = dashboardData?.activeSubscriptions ?? [];
  const farm = dashboardData?.farm;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Settings", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 max-w-2xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xs uppercase tracking-widest font-bold text-foreground/40 mb-3 px-1", children: "Farm & Account" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SettingRow,
          {
            icon: MapPin,
            label: "Farm Settings",
            description: "Name, address, CPH number, sectors and acreage",
            href: "/settings/farm"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SettingRow,
          {
            icon: Users,
            label: "Staff Management",
            description: "Invite team members and manage access",
            href: "/staff"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SettingRow,
          {
            icon: Share2,
            label: "Advisors & External Access",
            description: "Share read-only farm data with advisors, vets, or inspectors",
            href: "/settings/access"
          }
        )
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xs uppercase tracking-widest font-bold text-foreground/40 mb-3 px-1", children: "Subscription & Modules" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "w-4 h-4 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm", children: "Active Modules" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
            activeModules.length,
            " active"
          ] })
        ] }),
        activeModules.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground pl-6", children: "No modules loaded yet — visit the Dashboard to see your subscription." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1", children: activeModules.map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-foreground/80", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3.5 h-3.5 text-green-500 flex-shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: String(m.moduleName ?? m.moduleKey ?? "Module") })
        ] }, i)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xs uppercase tracking-widest font-bold text-foreground/40 mb-3 px-1", children: "Compliance" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-5 h-5 text-green-600" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm", children: "Red Tractor Scheme" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1 leading-relaxed", children: "BDE Farm Trac is designed to support Red Tractor audit compliance. Records must be retained for a minimum of 3 years. Use Print or Export on any module page to produce records for your assessor." }),
          farm && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-3.5 h-3.5 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
              "Scheme: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: "Red Tractor" })
            ] })
          ] })
        ] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xs uppercase tracking-widest font-bold text-foreground/40 mb-3 px-1", children: "Notifications" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        SettingRow,
        {
          icon: Bell,
          label: "Account & Notifications",
          description: "Set your mobile number and choose which compliance alerts to receive by SMS",
          href: "/account"
        }
      ) }) })
    ] })
  ] }) });
}
export {
  SettingsPage as default
};
