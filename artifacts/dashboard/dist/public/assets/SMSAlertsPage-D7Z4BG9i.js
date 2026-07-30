import { r as reactExports, i as useComposedRefs, e as useControllableState, j as jsxRuntimeExports, P as Primitive, f as composeEventHandlers, aD as usePrevious, al as useSize, h as createContextScope, k as cn, b as useAppStore, t as useQueryClient, a as useToast, l as useQuery, O as useMutation, c as Button } from "./index-DZ3-mP8N.js";
import { a as api } from "./api-Bry3C6Hl.js";
import { A as AppLayout, p as Smartphone, o as Bell, U as Users, I as Info } from "./AppLayout-D1dNxWO5.js";
import { B as Badge } from "./badge-DzRqu2VD.js";
import { B as BellOff } from "./bell-off-Dzi5Ezif.js";
import { T as TriangleAlert } from "./triangle-alert-5soG8eC6.js";
import { C as CircleCheck } from "./circle-check-Ba89GTDu.js";
import { M as MessageSquare } from "./message-square-KgX6ASxq.js";
import "./use-safe-clerk-B37BfN3p.js";
import "./trash-2-yB0Depaf.js";
import "./database-DU63sy9h.js";
import "./shield-alert-1bXw9o2C.js";
import "./shield-check-DYcqMjCE.js";
import "./tractor-DwmxHVcA.js";
var SWITCH_NAME = "Switch";
var [createSwitchContext] = createContextScope(SWITCH_NAME);
var [SwitchProvider, useSwitchContext] = createSwitchContext(SWITCH_NAME);
var Switch$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeSwitch,
      name,
      checked: checkedProp,
      defaultChecked,
      required,
      disabled,
      value = "on",
      onCheckedChange,
      form,
      ...switchProps
    } = props;
    const [button, setButton] = reactExports.useState(null);
    const composedRefs = useComposedRefs(forwardedRef, (node) => setButton(node));
    const hasConsumerStoppedPropagationRef = reactExports.useRef(false);
    const isFormControl = button ? form || !!button.closest("form") : true;
    const [checked, setChecked] = useControllableState({
      prop: checkedProp,
      defaultProp: defaultChecked ?? false,
      onChange: onCheckedChange,
      caller: SWITCH_NAME
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(SwitchProvider, { scope: __scopeSwitch, checked, disabled, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Primitive.button,
        {
          type: "button",
          role: "switch",
          "aria-checked": checked,
          "aria-required": required,
          "data-state": getState(checked),
          "data-disabled": disabled ? "" : void 0,
          disabled,
          value,
          ...switchProps,
          ref: composedRefs,
          onClick: composeEventHandlers(props.onClick, (event) => {
            setChecked((prevChecked) => !prevChecked);
            if (isFormControl) {
              hasConsumerStoppedPropagationRef.current = event.isPropagationStopped();
              if (!hasConsumerStoppedPropagationRef.current) event.stopPropagation();
            }
          })
        }
      ),
      isFormControl && /* @__PURE__ */ jsxRuntimeExports.jsx(
        SwitchBubbleInput,
        {
          control: button,
          bubbles: !hasConsumerStoppedPropagationRef.current,
          name,
          value,
          checked,
          required,
          disabled,
          form,
          style: { transform: "translateX(-100%)" }
        }
      )
    ] });
  }
);
Switch$1.displayName = SWITCH_NAME;
var THUMB_NAME = "SwitchThumb";
var SwitchThumb = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSwitch, ...thumbProps } = props;
    const context = useSwitchContext(THUMB_NAME, __scopeSwitch);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.span,
      {
        "data-state": getState(context.checked),
        "data-disabled": context.disabled ? "" : void 0,
        ...thumbProps,
        ref: forwardedRef
      }
    );
  }
);
SwitchThumb.displayName = THUMB_NAME;
var BUBBLE_INPUT_NAME = "SwitchBubbleInput";
var SwitchBubbleInput = reactExports.forwardRef(
  ({
    __scopeSwitch,
    control,
    checked,
    bubbles = true,
    ...props
  }, forwardedRef) => {
    const ref = reactExports.useRef(null);
    const composedRefs = useComposedRefs(ref, forwardedRef);
    const prevChecked = usePrevious(checked);
    const controlSize = useSize(control);
    reactExports.useEffect(() => {
      const input = ref.current;
      if (!input) return;
      const inputProto = window.HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(
        inputProto,
        "checked"
      );
      const setChecked = descriptor.set;
      if (prevChecked !== checked && setChecked) {
        const event = new Event("click", { bubbles });
        setChecked.call(input, checked);
        input.dispatchEvent(event);
      }
    }, [prevChecked, checked, bubbles]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type: "checkbox",
        "aria-hidden": true,
        defaultChecked: checked,
        ...props,
        tabIndex: -1,
        ref: composedRefs,
        style: {
          ...props.style,
          ...controlSize,
          position: "absolute",
          pointerEvents: "none",
          opacity: 0,
          margin: 0
        }
      }
    );
  }
);
SwitchBubbleInput.displayName = BUBBLE_INPUT_NAME;
function getState(checked) {
  return checked ? "checked" : "unchecked";
}
var Root = Switch$1;
var Thumb = SwitchThumb;
const Switch = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Root,
  {
    className: cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    ),
    ...props,
    ref,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Thumb,
      {
        className: cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
        )
      }
    )
  }
));
Switch.displayName = Root.displayName;
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
  const [activeTab, setActiveTab] = reactExports.useState("config");
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
