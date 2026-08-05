import { r as reactExports, f as useControllableState, j as jsxRuntimeExports, P as Primitive, g as composeEventHandlers, h as Presence, i as createContextScope, k as useComposedRefs, D as DismissableLayer, l as cn, m as useQuery, n as Card, o as CardContent, p as Link, A as ArrowRight, b as useAppStore, q as useGetFarmActivity, R as Redirect, M as MapPin } from "./index-Cgwa2fkn.js";
import { C as CalendarDays, L as Landmark, S as Sprout, W as Warehouse, u as useUserRole, A as AppLayout, a as Wheat, b as Layers, c as ClipboardList, d as Wrench, e as ChartColumn } from "./AppLayout-D8J6skGX.js";
import { R as Root2$1, A as Anchor, c as createPopperScope, C as Content, a as Arrow } from "./index-BWCLyXRH.js";
import { L as Leaf, T as TriangleAlert } from "./triangle-alert-B-yEgefX.js";
import { T as Tag } from "./tag-BFgqM5YB.js";
import { S as ShieldCheck } from "./shield-check-CVea-cql.js";
import { D as Droplets, F as FileText, C as ClipboardCheck, S as ShieldAlert, G as GraduationCap } from "./shield-alert-DUKBl-az.js";
import { P as Package } from "./use-safe-clerk-DplYw4dj.js";
import { C as CircleCheck } from "./circle-check-BsNARtMg.js";
import { A as Activity } from "./activity-DirAQrNh.js";
import { E as ExternalLink } from "./external-link-CUT4HXN-.js";
import { T as Tractor } from "./tractor-BAeEka3V.js";
import { P as PawPrint } from "./paw-print-BeRSwW9L.js";
import { C as ChartLine } from "./chart-line-DAtrq0Tc.js";
import { C as CloudRain } from "./cloud-rain-DjJMc8XX.js";
import "./trash-2-4wGGdwwT.js";
import "./database-C40ohlYs.js";
var originalBodyUserSelect;
var HOVERCARD_NAME = "HoverCard";
var [createHoverCardContext] = createContextScope(HOVERCARD_NAME, [
  createPopperScope
]);
var usePopperScope = createPopperScope();
var [HoverCardProvider, useHoverCardContext] = createHoverCardContext(HOVERCARD_NAME);
var HoverCard$1 = (props) => {
  const {
    __scopeHoverCard,
    children,
    open: openProp,
    defaultOpen,
    onOpenChange,
    openDelay = 700,
    closeDelay = 300
  } = props;
  const popperScope = usePopperScope(__scopeHoverCard);
  const openTimerRef = reactExports.useRef(0);
  const closeTimerRef = reactExports.useRef(0);
  const hasSelectionRef = reactExports.useRef(false);
  const isPointerDownOnContentRef = reactExports.useRef(false);
  const [open, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
    caller: HOVERCARD_NAME
  });
  const handleOpen = reactExports.useCallback(() => {
    clearTimeout(closeTimerRef.current);
    openTimerRef.current = window.setTimeout(() => setOpen(true), openDelay);
  }, [openDelay, setOpen]);
  const handleClose = reactExports.useCallback(() => {
    clearTimeout(openTimerRef.current);
    if (!hasSelectionRef.current && !isPointerDownOnContentRef.current) {
      closeTimerRef.current = window.setTimeout(() => setOpen(false), closeDelay);
    }
  }, [closeDelay, setOpen]);
  const handleDismiss = reactExports.useCallback(() => setOpen(false), [setOpen]);
  reactExports.useEffect(() => {
    return () => {
      clearTimeout(openTimerRef.current);
      clearTimeout(closeTimerRef.current);
    };
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    HoverCardProvider,
    {
      scope: __scopeHoverCard,
      open,
      onOpenChange: setOpen,
      onOpen: handleOpen,
      onClose: handleClose,
      onDismiss: handleDismiss,
      hasSelectionRef,
      isPointerDownOnContentRef,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Root2$1, { ...popperScope, children })
    }
  );
};
HoverCard$1.displayName = HOVERCARD_NAME;
var TRIGGER_NAME = "HoverCardTrigger";
var HoverCardTrigger$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeHoverCard, ...triggerProps } = props;
    const context = useHoverCardContext(TRIGGER_NAME, __scopeHoverCard);
    const popperScope = usePopperScope(__scopeHoverCard);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Anchor, { asChild: true, ...popperScope, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.a,
      {
        "data-state": context.open ? "open" : "closed",
        ...triggerProps,
        ref: forwardedRef,
        onPointerEnter: composeEventHandlers(props.onPointerEnter, excludeTouch(context.onOpen)),
        onPointerLeave: composeEventHandlers(props.onPointerLeave, excludeTouch(context.onClose)),
        onFocus: composeEventHandlers(props.onFocus, context.onOpen),
        onBlur: composeEventHandlers(props.onBlur, context.onClose),
        onTouchStart: composeEventHandlers(props.onTouchStart, (event) => event.preventDefault())
      }
    ) });
  }
);
HoverCardTrigger$1.displayName = TRIGGER_NAME;
var PORTAL_NAME = "HoverCardPortal";
var [PortalProvider, usePortalContext] = createHoverCardContext(PORTAL_NAME, {
  forceMount: void 0
});
var CONTENT_NAME = "HoverCardContent";
var HoverCardContent$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const portalContext = usePortalContext(CONTENT_NAME, props.__scopeHoverCard);
    const { forceMount = portalContext.forceMount, ...contentProps } = props;
    const context = useHoverCardContext(CONTENT_NAME, props.__scopeHoverCard);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      HoverCardContentImpl,
      {
        "data-state": context.open ? "open" : "closed",
        ...contentProps,
        onPointerEnter: composeEventHandlers(props.onPointerEnter, excludeTouch(context.onOpen)),
        onPointerLeave: composeEventHandlers(props.onPointerLeave, excludeTouch(context.onClose)),
        ref: forwardedRef
      }
    ) });
  }
);
HoverCardContent$1.displayName = CONTENT_NAME;
var HoverCardContentImpl = reactExports.forwardRef((props, forwardedRef) => {
  const {
    __scopeHoverCard,
    onEscapeKeyDown,
    onPointerDownOutside,
    onFocusOutside,
    onInteractOutside,
    ...contentProps
  } = props;
  const context = useHoverCardContext(CONTENT_NAME, __scopeHoverCard);
  const popperScope = usePopperScope(__scopeHoverCard);
  const ref = reactExports.useRef(null);
  const composedRefs = useComposedRefs(forwardedRef, ref);
  const [containSelection, setContainSelection] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (containSelection) {
      const body = document.body;
      originalBodyUserSelect = body.style.userSelect || body.style.webkitUserSelect;
      body.style.userSelect = "none";
      body.style.webkitUserSelect = "none";
      return () => {
        body.style.userSelect = originalBodyUserSelect;
        body.style.webkitUserSelect = originalBodyUserSelect;
      };
    }
  }, [containSelection]);
  reactExports.useEffect(() => {
    if (ref.current) {
      const handlePointerUp = () => {
        setContainSelection(false);
        context.isPointerDownOnContentRef.current = false;
        setTimeout(() => {
          const hasSelection = document.getSelection()?.toString() !== "";
          if (hasSelection) context.hasSelectionRef.current = true;
        });
      };
      document.addEventListener("pointerup", handlePointerUp);
      return () => {
        document.removeEventListener("pointerup", handlePointerUp);
        context.hasSelectionRef.current = false;
        context.isPointerDownOnContentRef.current = false;
      };
    }
  }, [context.isPointerDownOnContentRef, context.hasSelectionRef]);
  reactExports.useEffect(() => {
    if (ref.current) {
      const tabbables = getTabbableNodes(ref.current);
      tabbables.forEach((tabbable) => tabbable.setAttribute("tabindex", "-1"));
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    DismissableLayer,
    {
      asChild: true,
      disableOutsidePointerEvents: false,
      onInteractOutside,
      onEscapeKeyDown,
      onPointerDownOutside,
      onFocusOutside: composeEventHandlers(onFocusOutside, (event) => {
        event.preventDefault();
      }),
      onDismiss: context.onDismiss,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Content,
        {
          ...popperScope,
          ...contentProps,
          onPointerDown: composeEventHandlers(contentProps.onPointerDown, (event) => {
            if (event.currentTarget.contains(event.target)) {
              setContainSelection(true);
            }
            context.hasSelectionRef.current = false;
            context.isPointerDownOnContentRef.current = true;
          }),
          ref: composedRefs,
          style: {
            ...contentProps.style,
            userSelect: containSelection ? "text" : void 0,
            // Safari requires prefix
            WebkitUserSelect: containSelection ? "text" : void 0,
            // re-namespace exposed content custom properties
            ...{
              "--radix-hover-card-content-transform-origin": "var(--radix-popper-transform-origin)",
              "--radix-hover-card-content-available-width": "var(--radix-popper-available-width)",
              "--radix-hover-card-content-available-height": "var(--radix-popper-available-height)",
              "--radix-hover-card-trigger-width": "var(--radix-popper-anchor-width)",
              "--radix-hover-card-trigger-height": "var(--radix-popper-anchor-height)"
            }
          }
        }
      )
    }
  );
});
var ARROW_NAME = "HoverCardArrow";
var HoverCardArrow = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeHoverCard, ...arrowProps } = props;
    const popperScope = usePopperScope(__scopeHoverCard);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Arrow, { ...popperScope, ...arrowProps, ref: forwardedRef });
  }
);
HoverCardArrow.displayName = ARROW_NAME;
function excludeTouch(eventHandler) {
  return (event) => event.pointerType === "touch" ? void 0 : eventHandler();
}
function getTabbableNodes(container) {
  const nodes = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node) => {
      return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
}
var Root2 = HoverCard$1;
var Trigger = HoverCardTrigger$1;
var Content2 = HoverCardContent$1;
const HoverCard = Root2;
const HoverCardTrigger = Trigger;
const HoverCardContent = reactExports.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content2,
  {
    ref,
    align,
    sideOffset,
    className: cn(
      "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-hover-card-content-transform-origin]",
      className
    ),
    ...props
  }
));
HoverCardContent.displayName = Content2.displayName;
function UpcomingDatesPanel({ farmId }) {
  const now = /* @__PURE__ */ new Date();
  const in60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1e3);
  const insuranceQ = useQuery({
    queryKey: ["insurance", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/insurance`).then((r) => r.json()),
    select: (d) => d.records ?? []
  });
  const grantsQ = useQuery({
    queryKey: ["grants", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/grants`).then((r) => r.json()),
    select: (d) => d.records ?? []
  });
  const organicCertQ = useQuery({
    queryKey: ["oa-cert", farmId],
    queryFn: async () => {
      const r = await fetch(`/api/farms/${farmId}/organic-arable/certification`, { credentials: "include" });
      if (!r.ok) return [];
      const d = await r.json();
      return (d.records ?? []).filter((c) => !["suspended", "withdrawn"].includes(c.status));
    }
  });
  const calvingQ = useQuery({
    queryKey: ["dairy-calving", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/dairy/calving-records`, { credentials: "include" }).then((r) => r.json()),
    select: (d) => d.records ?? []
  });
  const insurance = insuranceQ.data ?? [];
  const grants = grantsQ.data ?? [];
  const organicCerts = organicCertQ.data ?? [];
  const calvings = calvingQ.data ?? [];
  const items = [];
  for (const pol of insurance) {
    if (!pol.expiryDate) continue;
    const expiry = new Date(pol.expiryDate);
    if (expiry > in60Days) continue;
    const daysUntil = Math.ceil((expiry.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24));
    items.push({
      label: `${pol.policyType}${pol.insurer ? ` — ${pol.insurer}` : ""} renewal`,
      date: expiry,
      daysUntil,
      href: "/insurance",
      type: "Insurance",
      urgent: daysUntil <= 14
    });
  }
  const activeGrants = grants.filter((g) => !["claimed", "rejected", "withdrawn"].includes(g.status));
  for (const grant of activeGrants) {
    if (grant.purchaseDeadline) {
      const d = new Date(grant.purchaseDeadline);
      if (d <= in60Days) {
        const daysUntil = Math.ceil((d.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24));
        items.push({ label: `${grant.schemeName} — purchase deadline`, date: d, daysUntil, href: "/grants", type: "Grant", urgent: daysUntil <= 14 });
      }
    }
    if (grant.claimDeadline) {
      const d = new Date(grant.claimDeadline);
      if (d <= in60Days) {
        const daysUntil = Math.ceil((d.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24));
        items.push({ label: `${grant.schemeName} — claim deadline`, date: d, daysUntil, href: "/grants", type: "Grant", urgent: daysUntil <= 14 });
      }
    }
  }
  for (const c of calvings) {
    if (c.calfOutcome !== "live") continue;
    const birthDate = new Date(c.calvingDate);
    const tag1Deadline = new Date(birthDate.getTime() + 36 * 60 * 60 * 1e3);
    const tag2Deadline = new Date(birthDate.getTime() + 20 * 24 * 60 * 60 * 1e3);
    const dam = c.cowEarTag ? ` (dam: ${c.cowEarTag})` : "";
    if (!c.calfEarTag && tag1Deadline <= in60Days) {
      const daysUntil = Math.ceil((tag1Deadline.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24));
      items.push({ label: `Calf tag 1 deadline${dam}`, date: tag1Deadline, daysUntil, href: "/dairy", type: "Calving", urgent: true });
    }
    if (!c.calfEarTag2 && tag2Deadline <= in60Days) {
      const daysUntil = Math.ceil((tag2Deadline.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24));
      items.push({ label: `Calf tag 2 deadline${dam}`, date: tag2Deadline, daysUntil, href: "/dairy", type: "Calving", urgent: daysUntil <= 3 });
    }
  }
  for (const cert of organicCerts) {
    const certifier = cert.certifier ?? "Organic cert";
    const addCertDate = (dateStr, label) => {
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (d > in60Days) return;
      const days = Math.ceil((d.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24));
      items.push({ label: `${label} — ${certifier}`, date: d, daysUntil: days, href: "/organic-arable", type: "Organic", urgent: days <= 14 });
    };
    addCertDate(cert.renewalDate, "Organic cert renewal");
    addCertDate(cert.nextInspectionDue, "Organic inspection due");
    if (cert.annualInspectionDate && new Date(cert.annualInspectionDate) > now)
      addCertDate(cert.annualInspectionDate, "Annual inspection");
  }
  items.sort((a, b) => a.daysUntil - b.daysUntil);
  if (items.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-4 border-b border-border flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg", children: "Upcoming Key Dates" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "w-5 h-5 text-foreground/40" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "px-6 py-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-foreground/50", children: [
        "No upcoming deadlines in the next 60 days. ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { href: "/week-ahead", className: "text-primary underline-offset-2 hover:underline", children: "Open Week Ahead planner →" })
      ] }) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-4 border-b border-border flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg", children: "Upcoming Key Dates" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/50", children: "Next 60 days" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "w-5 h-5 text-foreground/40" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: items.slice(0, 6).map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { href: item.href, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-4 flex items-center justify-between gap-4 hover:bg-black/[0.02] transition-colors cursor-pointer group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.type === "Grant" ? "bg-violet-50" : item.type === "Organic" ? "bg-green-50" : item.type === "Calving" ? "bg-amber-50" : "bg-blue-50"}`, children: item.type === "Grant" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Landmark, { className: `w-4 h-4 ${item.urgent ? "text-red-500" : "text-violet-600"}` }) : item.type === "Organic" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { className: `w-4 h-4 ${item.urgent ? "text-red-500" : "text-green-600"}` }) : item.type === "Calving" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { className: `w-4 h-4 ${item.urgent ? "text-red-500" : "text-amber-600"}` }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: `w-4 h-4 ${item.urgent ? "text-red-500" : "text-blue-600"}` }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground truncate", children: item.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/50", children: item.date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 flex-shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-bold px-2.5 py-1 rounded-full ${item.daysUntil < 0 ? "bg-red-100 text-red-700" : item.urgent ? "bg-red-50 text-red-600" : item.daysUntil <= 30 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`, children: item.daysUntil < 0 ? `${Math.abs(item.daysUntil)}d overdue` : item.daysUntil === 0 ? "Today" : `${item.daysUntil}d` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-4 h-4 text-foreground/20 group-hover:text-foreground/50 transition-colors" })
        ] })
      ] }) }, i)) }),
      items.length > 6 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-3 border-t border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { href: "/week-ahead", className: "text-xs text-primary hover:underline underline-offset-2", children: [
        "View all ",
        items.length,
        " upcoming dates in Week Ahead →"
      ] }) })
    ] })
  ] });
}
function ComplianceHealthPanel({ farmId }) {
  const now = /* @__PURE__ */ new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3).toISOString();
  const ninetyDays = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1e3).toISOString();
  const spraysQ = useQuery({ queryKey: ["spray-applications", farmId], queryFn: () => fetch(`/api/farms/${farmId}/spray-applications`).then((r) => r.json()), select: (d) => d.records ?? [] });
  const productsQ = useQuery({ queryKey: ["spray-products", farmId], queryFn: () => fetch(`/api/farms/${farmId}/spray-products`).then((r) => r.json()), select: (d) => d.records ?? [] });
  const plansQ = useQuery({ queryKey: ["nmp-plans", farmId], queryFn: () => fetch(`/api/farms/${farmId}/nmp-plans`).then((r) => r.json()), select: (d) => d.records ?? [] });
  const docsQ = useQuery({ queryKey: ["documents", farmId], queryFn: () => fetch(`/api/farms/${farmId}/documents`).then((r) => r.json()), select: (d) => d.records ?? [] });
  const fieldsQ = useQuery({ queryKey: ["fields", farmId], queryFn: () => fetch(`/api/farms/${farmId}/fields`).then((r) => r.json()), select: (d) => d.records ?? [] });
  const insuranceQ = useQuery({ queryKey: ["insurance", farmId], queryFn: () => fetch(`/api/farms/${farmId}/insurance`).then((r) => r.json()), select: (d) => d.records ?? [] });
  const slurryStoresQ = useQuery({ queryKey: ["slurry-stores", farmId], queryFn: () => fetch(`/api/farms/${farmId}/slurry-stores`).then((r) => r.json()), select: (d) => d.records ?? [] });
  const slurryInspectionsQ = useQuery({ queryKey: ["slurry-store-inspections", farmId], queryFn: () => fetch(`/api/farms/${farmId}/slurry-store-inspections`).then((r) => r.json()), select: (d) => d.records ?? [] });
  const seedSegChecksQ = useQuery({ queryKey: ["seed-storage-checks", farmId], queryFn: () => fetch(`/api/farms/${farmId}/seed-storage-checks`).then((r) => r.json()), select: (d) => d.records ?? [] });
  const sprays = spraysQ.data ?? [];
  const products = productsQ.data ?? [];
  const plans = plansQ.data ?? [];
  const docs = docsQ.data ?? [];
  const fields = fieldsQ.data ?? [];
  const insurance = insuranceQ.data ?? [];
  const slurryStores = slurryStoresQ.data ?? [];
  const slurryInspections = slurryInspectionsQ.data ?? [];
  const seedSegChecks = seedSegChecksQ.data ?? [];
  const currentYear = now.getFullYear();
  const getInsuranceCheck = (type) => {
    const label = type === "EL" ? "Employers Liability" : "Public Liability";
    const keywords = type === "EL" ? ["employers", "employer"] : ["public liability", "public"];
    const matches = insurance.filter(
      (p) => keywords.some((kw) => p.policyType?.toLowerCase().includes(kw))
    );
    if (matches.length === 0) return { status: "gap", message: `No ${label} insurance on record — legally required` };
    const expired = matches.filter((p) => p.expiryDate && new Date(p.expiryDate) < now);
    const expiring = matches.filter((p) => p.expiryDate && new Date(p.expiryDate) >= now && new Date(p.expiryDate) <= new Date(ninetyDays));
    if (expired.length > 0) return { status: "gap", message: `${label} policy expired — renew immediately` };
    if (expiring.length > 0) return { status: "warn", message: `${label} policy expiring within 90 days` };
    return { status: "ok", message: `${label} policy current` };
  };
  const elCheck = getInsuranceCheck("EL");
  const plCheck = getInsuranceCheck("PL");
  const checks = [
    {
      label: "Employers Liability",
      ...elCheck,
      href: "/insurance",
      icon: ShieldCheck
    },
    {
      label: "Public Liability",
      ...plCheck,
      href: "/insurance",
      icon: ShieldCheck
    },
    {
      label: "Spray Applications",
      status: sprays.length > 0 ? sprays.some((s) => new Date(s.applicationDate) >= new Date(thirtyDaysAgo)) ? "ok" : "warn" : "gap",
      message: sprays.length === 0 ? "No spray records on file" : sprays.some((s) => new Date(s.applicationDate) >= new Date(thirtyDaysAgo)) ? `${sprays.length} total application${sprays.length !== 1 ? "s" : ""} recorded` : "Last application over 30 days ago — confirm records are up to date",
      href: "/sprays",
      icon: Droplets
    },
    {
      label: "Product Register",
      status: products.length > 0 ? "ok" : "gap",
      message: products.length === 0 ? "No products registered — required before logging applications" : `${products.length} product${products.length !== 1 ? "s" : ""} registered`,
      href: "/sprays",
      icon: Droplets
    },
    {
      label: `NMP ${currentYear}`,
      status: plans.some((p) => p.planYear === currentYear || p.planYear === String(currentYear)) ? "ok" : plans.some((p) => p.planYear === currentYear - 1 || p.planYear === String(currentYear - 1)) ? "warn" : "gap",
      message: plans.some((p) => p.planYear === currentYear || p.planYear === String(currentYear)) ? `${currentYear} Nutrient Management Plan on record` : plans.some((p) => p.planYear === currentYear - 1 || p.planYear === String(currentYear - 1)) ? `Only ${currentYear - 1} NMP on file — ${currentYear} plan needed` : "No Nutrient Management Plan for the current year",
      href: "/nmp",
      icon: Leaf
    },
    {
      label: "Field Coverage",
      status: fields.length === 0 ? "warn" : plans.length === 0 ? "gap" : "ok",
      message: fields.length === 0 ? "No fields registered yet" : plans.length === 0 ? `${fields.length} field${fields.length !== 1 ? "s" : ""} registered — no NMP entries` : `${fields.length} field${fields.length !== 1 ? "s" : ""} — verify all covered in NMP`,
      href: "/nmp",
      icon: Sprout
    },
    {
      label: "Document Register",
      status: (() => {
        if (docs.length === 0) return "gap";
        const expired = docs.filter((d) => d.expiryDate && new Date(d.expiryDate) < now).length;
        if (expired > 0) return "gap";
        const expiring = docs.filter((d) => d.expiryDate && new Date(d.expiryDate) > now && new Date(d.expiryDate) < new Date(ninetyDays)).length;
        if (expiring > 0) return "warn";
        return "ok";
      })(),
      message: (() => {
        if (docs.length === 0) return "No documents in register — add certificates and compliance records";
        const expired = docs.filter((d) => d.expiryDate && new Date(d.expiryDate) < now).length;
        if (expired > 0) return `${expired} expired document${expired !== 1 ? "s" : ""} — renew immediately`;
        const expiring = docs.filter((d) => d.expiryDate && new Date(d.expiryDate) > now && new Date(d.expiryDate) < new Date(ninetyDays)).length;
        if (expiring > 0) return `${expiring} document${expiring !== 1 ? "s" : ""} expiring within 90 days`;
        return `${docs.length} document${docs.length !== 1 ? "s" : ""} on record — all valid`;
      })(),
      href: "/documents",
      icon: FileText
    },
    {
      label: "Spray Operator Certs",
      status: (() => {
        const certs = docs.filter((d) => d.documentType === "Spray Operator Certificate (PA1/PA6)");
        if (certs.length === 0) return "warn";
        return certs.filter((d) => d.expiryDate && new Date(d.expiryDate) < now).length > 0 ? "gap" : "ok";
      })(),
      message: (() => {
        const certs = docs.filter((d) => d.documentType === "Spray Operator Certificate (PA1/PA6)");
        if (certs.length === 0) return "No PA1/PA6 certificates on record — required for spray operators";
        const expired = certs.filter((d) => d.expiryDate && new Date(d.expiryDate) < now).length;
        return expired > 0 ? `${expired} operator certificate${expired !== 1 ? "s" : ""} expired` : `${certs.length} operator certificate${certs.length !== 1 ? "s" : ""} on record`;
      })(),
      href: "/documents",
      icon: FileText
    },
    {
      label: "Silage & Silo Safety",
      status: (() => {
        const clamps = slurryStores.filter((s) => s.storeType === "Silage Clamp");
        if (clamps.length === 0) return "ok";
        const clampIds = new Set(clamps.map((c) => c.id));
        const clampInspections = slurryInspections.filter((i) => clampIds.has(i.storeId));
        if (clampInspections.length === 0) return "gap";
        const latest = clampInspections.reduce((max, i) => !max || new Date(i.inspectionDate) > new Date(max.inspectionDate) ? i : max, null);
        const twelveMonthsAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1e3);
        return latest && new Date(latest.inspectionDate) < twelveMonthsAgo ? "warn" : "ok";
      })(),
      message: (() => {
        const clamps = slurryStores.filter((s) => s.storeType === "Silage Clamp");
        if (clamps.length === 0) return "No silage clamps registered";
        const clampIds = new Set(clamps.map((c) => c.id));
        const clampInspections = slurryInspections.filter((i) => clampIds.has(i.storeId));
        if (clampInspections.length === 0) return `${clamps.length} silage clamp${clamps.length !== 1 ? "s" : ""} registered — no safety inspections logged`;
        const latest = clampInspections.reduce((max, i) => !max || new Date(i.inspectionDate) > new Date(max.inspectionDate) ? i : max, null);
        const twelveMonthsAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1e3);
        if (latest && new Date(latest.inspectionDate) < twelveMonthsAgo) return `Last silo inspection was ${new Date(latest.inspectionDate).toLocaleDateString("en-GB")} — over 12 months ago`;
        return `${clampInspections.length} silo inspection${clampInspections.length !== 1 ? "s" : ""} on record`;
      })(),
      href: "/environmental-management?tab=silage",
      icon: Warehouse
    },
    {
      label: "Seed Storage Segregation",
      status: (() => {
        if (seedSegChecks.length === 0) return "gap";
        const nonCompliant = seedSegChecks.filter((c) => c.isCompliant === false || c.treatedSeedStoredLoose === true).length;
        if (nonCompliant > 0) return "gap";
        const twelveMonthsAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1e3);
        const latest = seedSegChecks.reduce((max, c) => !max || new Date(c.checkDate) > new Date(max.checkDate) ? c : max, null);
        return latest && new Date(latest.checkDate) < twelveMonthsAgo ? "warn" : "ok";
      })(),
      message: (() => {
        if (seedSegChecks.length === 0) return "No CR.ST.19 segregation checks on record — treated seed must be segregated from stored grain";
        const nonCompliant = seedSegChecks.filter((c) => c.isCompliant === false || c.treatedSeedStoredLoose === true).length;
        if (nonCompliant > 0) return `${nonCompliant} check${nonCompliant !== 1 ? "s" : ""} flagged non-compliant — resolve segregation`;
        const twelveMonthsAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1e3);
        const latest = seedSegChecks.reduce((max, c) => !max || new Date(c.checkDate) > new Date(max.checkDate) ? c : max, null);
        if (latest && new Date(latest.checkDate) < twelveMonthsAgo) return `Last check was ${new Date(latest.checkDate).toLocaleDateString("en-GB")} — over 12 months ago`;
        return `${seedSegChecks.length} segregation check${seedSegChecks.length !== 1 ? "s" : ""} on record — all compliant`;
      })(),
      href: "/seed-store?tab=segregation",
      icon: Package
    }
  ];
  const okCount = checks.filter((c) => c.status === "ok").length;
  const gapCount = checks.filter((c) => c.status === "gap").length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold", children: "Compliance Health" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-semibold ${gapCount > 0 ? "text-red-600" : "text-foreground/50"}`, children: gapCount > 0 ? `${gapCount} gap${gapCount !== 1 ? "s" : ""}` : "" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground/50", children: [
          okCount,
          "/",
          checks.length,
          " passing"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3", children: checks.map((check) => {
      const Icon = check.icon;
      const cfg = {
        ok: { bg: "bg-emerald-50", border: "border-emerald-100", iconBg: "bg-emerald-100", iconColor: "text-emerald-600", dot: "bg-emerald-500", label: "OK", labelColor: "text-emerald-700" },
        warn: { bg: "bg-amber-50", border: "border-amber-100", iconBg: "bg-amber-100", iconColor: "text-amber-600", dot: "bg-amber-500", label: "Attention", labelColor: "text-amber-700" },
        gap: { bg: "bg-red-50", border: "border-red-100", iconBg: "bg-red-100", iconColor: "text-red-600", dot: "bg-red-500", label: "Action Required", labelColor: "text-red-700" }
      }[check.status];
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { href: check.href, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `p-4 rounded-xl border ${cfg.bg} ${cfg.border} hover:shadow-sm transition-all cursor-pointer group h-full`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-8 h-8 rounded-lg ${cfg.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `w-4 h-4 ${cfg.iconColor}` }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-1 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-foreground/70", children: check.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.labelColor}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 h-1.5 rounded-full ${cfg.dot}` }),
              cfg.label
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/65 leading-snug", children: check.message })
        ] })
      ] }) }) }, check.label);
    }) })
  ] });
}
function OverdueItemsPopover({
  items,
  label,
  variant = "amber"
}) {
  const colors = variant === "red" ? { pill: "bg-red-50 text-red-700 border border-red-200", dot: "bg-red-500", header: "text-red-700", item: "text-red-900" } : { pill: "bg-amber-50 text-amber-700 border border-amber-200", dot: "bg-amber-500", header: "text-amber-700", item: "text-amber-900" };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(HoverCard, { openDelay: 150, closeDelay: 100, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(HoverCardTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `mt-3 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full cursor-help select-none ${colors.pill}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3 h-3" }),
      label
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(HoverCardContent, { side: "bottom", align: "start", className: "w-80 p-0 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-b border-border bg-muted/40", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs font-bold uppercase tracking-wide ${colors.header}`, children: "Items requiring attention" }) }),
      items.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-border", children: items.map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "px-4 py-2.5 flex items-start gap-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${colors.dot}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs leading-relaxed ${colors.item}`, children: item.description })
      ] }, i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-4 py-3 text-xs text-muted-foreground", children: "Open non-conformances or overdue inspections are reducing the score." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-2.5 border-t border-border bg-muted/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { href: "/inspections", className: "text-xs text-primary font-medium inline-flex items-center gap-1 hover:underline", children: [
        "View in Inspections ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "w-3 h-3" })
      ] }) })
    ] })
  ] });
}
const PRICING_GROUPS = [
  { keys: ["field-crop-management"] },
  { keys: ["sprays-inputs"] },
  { keys: ["soil-management"] },
  { keys: ["equipment-management", "workshop-management", "fuel-energy"] },
  { keys: ["livestock-management", "feed-management", "dairy-management"] },
  { keys: ["biosecurity"] },
  { keys: ["staff-training"] },
  { keys: ["risk-waste", "inspections"] },
  { keys: ["environmental", "carbon-sustainability"] },
  { keys: ["water-irrigation"] },
  { keys: ["stock-suppliers", "financial-records", "business-reports", "haulage-transport"] },
  { keys: ["weather-tracking"] },
  { keys: ["sms-alerts", "document-management"] },
  { keys: ["biofuel-rtfo"] },
  { keys: ["sheep-production"] },
  { keys: ["beef-production"] },
  { keys: ["pig-production"] },
  { keys: ["poultry-production"] },
  { keys: ["fresh-produce"] },
  { keys: ["viticulture"] },
  { keys: ["organic-compliance"] },
  { keys: ["organic-livestock"] },
  { keys: ["organic-dairy"] },
  { keys: ["organic-fresh-produce"] },
  { keys: ["organic-arable"] },
  { keys: ["organic-viticulture"] },
  { keys: ["farm-diversification"] }
];
function Dashboard() {
  const { farmId } = useAppStore();
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["farm-dashboard", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/dashboard`).then((r) => r.json()),
    enabled: !!farmId
  });
  const { data: activities } = useGetFarmActivity(farmId ?? 0);
  const { isAtLeast } = useUserRole();
  const { data: poCounts } = useQuery({
    queryKey: ["po-counts", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/purchase-orders/counts`).then((r) => r.json()),
    enabled: !!farmId,
    staleTime: 6e4
  });
  const pendingApprovals = poCounts?.counts?.submitted ?? 0;
  if (!farmId) return /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { href: "/select" });
  if (isLoading || !dashboard) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Overview", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "animate-pulse space-y-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-24 bg-black/5 rounded-2xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-6", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-36 bg-black/5 rounded-2xl" }, i)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-56 bg-black/5 rounded-2xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-56 bg-black/5 rounded-2xl" })
    ] }) });
  }
  const farm = dashboard.farm;
  if (!farm) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Overview", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-20 gap-3 text-foreground/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-8 h-8 text-amber-400" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Could not load farm data — please refresh the page." })
    ] }) });
  }
  const activeSubs = (dashboard.activeSubscriptions ?? []).map((s) => s.moduleKey);
  const purchasedModuleCount = PRICING_GROUPS.filter((g) => g.keys.some((k) => activeSubs.includes(k))).length;
  const sectors = [
    farm.sectorArable && "Arable",
    farm.sectorDairy && "Dairy",
    farm.sectorBeef && "Beef & Suckler",
    farm.sectorSheep && "Sheep",
    farm.sectorPigs && "Pigs",
    farm.sectorPoultry && "Poultry",
    farm.sectorHorticulture && "Horticulture",
    farm.sectorEggs && "Eggs",
    farm.sectorGoats && "Goats",
    farm.sectorEquine && "Equine"
  ].filter(Boolean);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { title: "Overview", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl border border-border px-6 py-5 flex flex-wrap items-center gap-x-8 gap-y-3 shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Wheat, { className: "w-5 h-5 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold text-foreground leading-tight truncate", children: farm.name }),
          farm.cphNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/50 font-mono", children: [
            "CPH: ",
            farm.cphNumber
          ] })
        ] })
      ] }),
      farm.address && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-sm text-foreground/60", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-3.5 h-3.5 flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: farm.address })
      ] }),
      farm.totalAcreage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-foreground/60", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: farm.totalAcreage.toLocaleString() }),
        " acres"
      ] }),
      sectors.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1.5 flex-wrap", children: sectors.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium bg-primary/8 text-primary px-2.5 py-1 rounded-full border border-primary/15", children: s }, s)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "overflow-hidden relative border-l-4 border-l-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardCheck, { className: "w-4 h-4 text-primary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-primary uppercase tracking-wider", children: "Red Tractor" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-4xl font-bold text-primary mb-1", children: [
              dashboard.complianceScore,
              "%"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/60 font-medium", children: "Compliance Score" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: 56, height: 56, flexShrink: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "56", height: "56", viewBox: "0 0 100 100", style: { transform: "rotate(-90deg)" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "50", cy: "50", r: "40", fill: "transparent", stroke: "currentColor", strokeWidth: "10", className: "text-primary/10" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "circle",
              {
                cx: "50",
                cy: "50",
                r: "40",
                fill: "transparent",
                stroke: "currentColor",
                strokeWidth: "10",
                className: "text-primary",
                strokeLinecap: "round",
                strokeDasharray: `${dashboard.complianceScore * 2.51} 251`
              }
            )
          ] }) })
        ] }),
        dashboard.complianceScore > 90 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700", children: "✓ Excellent — audit-ready" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(OverdueItemsPopover, { items: dashboard.overdueItems ?? [], label: "⚠ Attention needed" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: `border-l-4 ${dashboard.overdueActions > 0 ? "border-l-red-400" : "border-l-emerald-400"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: `w-4 h-4 ${dashboard.overdueActions > 0 ? "text-red-500" : "text-emerald-500"}` }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-bold uppercase tracking-wider ${dashboard.overdueActions > 0 ? "text-red-600" : "text-emerald-600"}`, children: "Actions Due" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: `text-4xl font-bold mb-1 ${dashboard.overdueActions > 0 ? "text-red-600" : "text-emerald-600"}`, children: dashboard.overdueActions }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/60 font-medium", children: "Overdue checks & records" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${dashboard.overdueActions > 0 ? "bg-red-50" : "bg-emerald-50"}`, children: dashboard.overdueActions > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-6 h-6 text-red-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-6 h-6 text-emerald-500" }) })
        ] }),
        dashboard.overdueActions === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700", children: "All clear" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          OverdueItemsPopover,
          {
            items: dashboard.overdueItems ?? [],
            label: `${dashboard.overdueActions} item${dashboard.overdueActions !== 1 ? "s" : ""} need attention`,
            variant: "red"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-l-4 border-l-indigo-400", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "w-4 h-4 text-indigo-500" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-indigo-600 uppercase tracking-wider", children: "Platform" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-4xl font-bold text-indigo-600 mb-1", children: purchasedModuleCount + 1 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/60 font-medium", children: "Active modules" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "w-6 h-6 text-indigo-500" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700", children: [
          "Red Tractor + ",
          purchasedModuleCount,
          " modules"
        ] })
      ] }) })
    ] }),
    isAtLeast("manager") && pendingApprovals > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "linear-gradient(135deg, #6d28d9, #7c3aed)", borderRadius: 16, padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, color: "white", boxShadow: "0 4px 16px rgba(109,40,217,0.25)" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 14 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "rgba(255,255,255,0.2)", borderRadius: 12, padding: 10, flexShrink: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { style: { width: 22, height: 22 } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: 0, fontWeight: 700, fontSize: "1.1rem" }, children: [
            pendingApprovals,
            " Purchase Order",
            pendingApprovals !== 1 ? "s" : "",
            " Awaiting Your Approval"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "3px 0 0", fontSize: "0.82rem", opacity: 0.85 }, children: "Staff have submitted these orders — review, approve, or return to draft in Trade Contacts & Stock" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { href: "/stock", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.35)", borderRadius: 8, padding: "8px 18px", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", color: "white" }, children: "Review Now →" }) })
    ] }),
    activeSubs.includes("risk-waste") && /* @__PURE__ */ jsxRuntimeExports.jsx(FarmIncidentsSummary, { farmId }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(UpcomingDatesPanel, { farmId }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ComplianceHealthPanel, { farmId }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(QuickAccessGrid, { farmId, activeSubs, dashboard }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-4 border-b border-border flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg", children: "Recent Activity" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "w-5 h-5 text-foreground/40" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: !activities?.activities?.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-8 text-center text-sm text-foreground/50", children: "No activity recorded yet" }) : activities.activities.slice(0, 8).map((act) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 px-6 flex items-start gap-4 hover:bg-black/[0.02] transition-colors", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground text-sm", children: act.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-0.5 text-xs text-foreground/50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize", children: act.module }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "•" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: act.createdAt ? new Date(act.createdAt).toLocaleDateString("en-GB") : "—" })
          ] })
        ] })
      ] }, act.id)) }) })
    ] })
  ] });
}
const OPEN_INCIDENT_STATUSES = /* @__PURE__ */ new Set(["reported", "under_investigation", "claim_raised"]);
function FarmIncidentsSummary({ farmId }) {
  const { data } = useQuery({
    queryKey: ["farm-incidents", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/incidents`).then((r) => r.json()),
    enabled: !!farmId,
    staleTime: 6e4
  });
  const records = data?.records ?? [];
  const open = records.filter((r) => OPEN_INCIDENT_STATUSES.has(r.status));
  if (open.length === 0) return null;
  const byType = /* @__PURE__ */ new Map();
  for (const r of open) byType.set(r.incidentType, (byType.get(r.incidentType) ?? 0) + 1);
  const typeBreakdown = [...byType.entries()].sort((a, b) => b[1] - a[1]);
  const totalLoss = open.reduce((sum, r) => {
    const n = parseFloat(r.estimatedLossValue ?? "");
    return sum + (isNaN(n) ? 0 : n);
  }, 0);
  const HIGH_RISK = /* @__PURE__ */ new Set(["Fire", "Wildfire", "Flood"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-l-4 border-l-red-400", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "w-4 h-4 text-red-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-red-600 uppercase tracking-wider", children: "Farm Incidents" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-2xl font-bold text-foreground mb-1", children: [
        open.length,
        " open incident",
        open.length !== 1 ? "s" : ""
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1.5 flex-wrap mt-1.5", children: typeBreakdown.map(([type, count]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "span",
        {
          className: `text-xs font-semibold px-2.5 py-1 rounded-full border ${HIGH_RISK.has(type) ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"}`,
          children: [
            count,
            " ",
            type
          ]
        },
        type
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold text-foreground/50 uppercase tracking-wider mb-1", children: "Est. Total Losses" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(HoverCard, { openDelay: 150, closeDelay: 100, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(HoverCardTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-red-600 cursor-help select-none", children: [
          "£",
          totalLoss.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(HoverCardContent, { side: "bottom", align: "end", className: "w-96 p-0 overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-b border-border bg-muted/40", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold uppercase tracking-wide text-red-700", children: "Open incidents in this total" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-border max-h-72 overflow-y-auto", children: open.map((r) => {
            const loss = parseFloat(r.estimatedLossValue ?? "");
            return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { href: "/farm-incidents", className: "px-4 py-2.5 flex items-start justify-between gap-3 hover:bg-black/[0.03] transition-colors", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-start gap-2.5 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-red-500" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-xs font-semibold text-red-900 truncate", children: r.incidentType }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-[11px] text-foreground/50", children: r.dateDiscovered ? new Date(r.dateDiscovered).toLocaleDateString("en-GB") : "Date unknown" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-red-600 whitespace-nowrap flex-shrink-0", children: isNaN(loss) ? "—" : `£${loss.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` })
            ] }) }, r.id);
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-2.5 border-t border-border bg-muted/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { href: "/farm-incidents", className: "text-xs text-primary font-medium inline-flex items-center gap-1 hover:underline", children: [
            "View all incidents ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "w-3 h-3" })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { href: "/farm-incidents", className: "mt-2 inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline", children: [
        "View incidents ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "w-3 h-3" })
      ] })
    ] })
  ] }) }) });
}
function QuickAccessGrid({ activeSubs, dashboard }) {
  const allLinks = [
    { href: "/week-ahead", title: "Week Ahead", icon: CalendarDays, color: "bg-green-50 text-green-600", always: true },
    { href: "/insurance", title: "Insurance", icon: ShieldCheck, color: "bg-blue-50 text-blue-600", always: true },
    { href: "/grants", title: "Grants & Funding", icon: Landmark, color: "bg-violet-50 text-violet-600", always: true },
    { href: "/fields", title: "Fields & Crops", icon: Sprout, count: dashboard.fieldCount ?? 0, color: "bg-emerald-50 text-emerald-600", moduleKey: "field-crop-management" },
    { href: "/sprays", title: "Sprays & Inputs", icon: Droplets, count: dashboard.sprayCount ?? 0, color: "bg-cyan-50 text-cyan-600", moduleKey: "sprays-inputs" },
    { href: "/equipment", title: "Equipment", icon: Tractor, count: dashboard.equipmentCount ?? 0, color: "bg-orange-50 text-orange-600", moduleKey: "equipment-management" },
    { href: "/workshop", title: "Workshop", icon: Wrench, color: "bg-teal-50 text-teal-600", moduleKey: "workshop-management" },
    { href: "/livestock", title: "Livestock", icon: PawPrint, color: "bg-rose-50 text-rose-600", moduleKey: "livestock-management" },
    { href: "/biosecurity", title: "Biosecurity", icon: ShieldAlert, color: "bg-red-50 text-red-600", moduleKey: "biosecurity" },
    { href: "/staff", title: "Staff & Training", icon: GraduationCap, color: "bg-indigo-50 text-indigo-600", moduleKey: "staff-training" },
    { href: "/inspections", title: "Inspections", icon: ClipboardList, count: dashboard.inspectionCount ?? 0, color: "bg-violet-50 text-violet-600", moduleKey: "inspections" },
    { href: "/stock", title: "Trade Contacts & Stock", icon: Package, color: "bg-amber-50 text-amber-700", moduleKey: "stock-suppliers" },
    { href: "/financial", title: "Financial Records", icon: ChartLine, color: "bg-emerald-50 text-emerald-700", moduleKey: "financial-records" },
    { href: "/business-reports", title: "Business Reports", icon: ChartColumn, color: "bg-green-50 text-green-700", moduleKey: "business-reports" },
    { href: "/environmental", title: "Environment", icon: Leaf, color: "bg-green-50 text-green-600", moduleKey: "environmental" },
    { href: "/weather", title: "Weather", icon: CloudRain, color: "bg-sky-50 text-sky-600", moduleKey: "weather-tracking" },
    { href: "/nmp", title: "Soil & NMP", icon: Sprout, color: "bg-lime-50 text-lime-600", moduleKey: "soil-management" },
    { href: "/documents", title: "Documents", icon: FileText, color: "bg-gray-100 text-gray-600", moduleKey: "document-management" },
    { href: "/compliance", title: "Red Tractor", icon: ClipboardCheck, color: "bg-blue-50 text-blue-600", moduleKey: "red-tractor-compliance" }
  ];
  const visible = allLinks.filter((l) => l.always || l.moduleKey && activeSubs.includes(l.moduleKey));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold mb-4", children: "Quick Access" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3", children: visible.map((link) => {
      const Icon = link.icon;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { href: link.href, className: "block group", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-xl border border-border/60 bg-white shadow-sm hover:shadow-md hover:border-primary/25 transition-all duration-200 h-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${link.color} group-hover:scale-110 transition-transform duration-200`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-5 h-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-sm text-foreground leading-tight", children: link.title }),
        link.count !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/50 mt-0.5", children: [
          link.count,
          " record",
          link.count !== 1 ? "s" : ""
        ] })
      ] }) }, link.href);
    }) })
  ] });
}
export {
  Dashboard as default
};
