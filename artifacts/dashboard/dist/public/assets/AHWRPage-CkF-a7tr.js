import { r as reactExports, j as jsxRuntimeExports, az as useId, f as useControllableState, k as useComposedRefs, P as Primitive, g as composeEventHandlers, h as Presence, aq as Portal$1, i as createContextScope, D as DismissableLayer, b4 as Root, ah as createSlottable, l as cn, b as useAppStore, c as useQueryClient, a as useToast, m as useQuery, S as useMutation, d as Button, T as Plus, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, I as Input } from "./index-CFhHVfpn.js";
import { u as usePersistedTab } from "./use-persisted-tab-oqwB2t5w.js";
import { a as usePersistedFilter } from "./use-persisted-filter-CvcTh-w_.js";
import { b as api } from "./api-Dhdsf4oM.js";
import { A as AppLayout, e as ChartColumn, k as Stethoscope, I as Info } from "./AppLayout-CJMxwOtu.js";
import { T as Textarea } from "./textarea-Ub0f_tpP.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CK5anLxD.js";
import { B as Badge } from "./badge-OHuAJXUy.js";
import { R as Root2, A as Anchor, c as createPopperScope, C as Content, a as Arrow } from "./index-BDRRqczd.js";
import { R as RecordAttachments } from "./RecordAttachments-8kClOB6g.js";
import { a as Clock, C as CircleAlert } from "./database-Brh2FSPt.js";
import { C as CircleCheck } from "./circle-check-T7L6pe32.js";
import { T as TriangleAlert } from "./triangle-alert-BSP6LwrX.js";
import { P as Printer } from "./printer-DEuFboiZ.js";
import { L as ListChecks } from "./list-checks-CQ-kT5Qe.js";
import { C as CalendarCheck } from "./calendar-check-BKHyAuzL.js";
import { R as ResponsiveContainer, C as Cell, T as Tooltip$2, L as Legend, X as XAxis, Y as YAxis, B as Bar } from "./generateCategoricalChart-6hzxYk6d.js";
import { P as PieChart, a as Pie } from "./PieChart-Wsfc5-yl.js";
import { B as BarChart } from "./BarChart-gOj8nDCl.js";
import { U as UserCheck } from "./user-check-B1HlYxoY.js";
import { P as Paperclip } from "./paperclip-DthbVPwb.js";
import "./use-safe-clerk-D2wgdtBi.js";
import "./trash-2-Hdt-o_EI.js";
import "./shield-alert-B2XFbf2E.js";
import "./shield-check-D1bdAnux.js";
import "./tractor-BAmFM0Ow.js";
import "./index-DTaDKWpk.js";
import "./chevron-up-BL8U0Gqc.js";
import "./use-upload-ZmC-80sw.js";
import "./upload-DpvlM3DA.js";
import "./image-DvuUjxPx.js";
import "./download-Pg-1-Bnm.js";
var [createTooltipContext] = createContextScope("Tooltip", [
  createPopperScope
]);
var usePopperScope = createPopperScope();
var PROVIDER_NAME = "TooltipProvider";
var DEFAULT_DELAY_DURATION = 700;
var TOOLTIP_OPEN = "tooltip.open";
var [TooltipProviderContextProvider, useTooltipProviderContext] = createTooltipContext(PROVIDER_NAME);
var TooltipProvider$1 = (props) => {
  const {
    __scopeTooltip,
    delayDuration = DEFAULT_DELAY_DURATION,
    skipDelayDuration = 300,
    disableHoverableContent = false,
    children
  } = props;
  const isOpenDelayedRef = reactExports.useRef(true);
  const isPointerInTransitRef = reactExports.useRef(false);
  const skipDelayTimerRef = reactExports.useRef(0);
  reactExports.useEffect(() => {
    const skipDelayTimer = skipDelayTimerRef.current;
    return () => window.clearTimeout(skipDelayTimer);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    TooltipProviderContextProvider,
    {
      scope: __scopeTooltip,
      isOpenDelayedRef,
      delayDuration,
      onOpen: reactExports.useCallback(() => {
        window.clearTimeout(skipDelayTimerRef.current);
        isOpenDelayedRef.current = false;
      }, []),
      onClose: reactExports.useCallback(() => {
        window.clearTimeout(skipDelayTimerRef.current);
        skipDelayTimerRef.current = window.setTimeout(
          () => isOpenDelayedRef.current = true,
          skipDelayDuration
        );
      }, [skipDelayDuration]),
      isPointerInTransitRef,
      onPointerInTransitChange: reactExports.useCallback((inTransit) => {
        isPointerInTransitRef.current = inTransit;
      }, []),
      disableHoverableContent,
      children
    }
  );
};
TooltipProvider$1.displayName = PROVIDER_NAME;
var TOOLTIP_NAME = "Tooltip";
var [TooltipContextProvider, useTooltipContext] = createTooltipContext(TOOLTIP_NAME);
var Tooltip$1 = (props) => {
  const {
    __scopeTooltip,
    children,
    open: openProp,
    defaultOpen,
    onOpenChange,
    disableHoverableContent: disableHoverableContentProp,
    delayDuration: delayDurationProp
  } = props;
  const providerContext = useTooltipProviderContext(TOOLTIP_NAME, props.__scopeTooltip);
  const popperScope = usePopperScope(__scopeTooltip);
  const [trigger, setTrigger] = reactExports.useState(null);
  const contentId = useId();
  const openTimerRef = reactExports.useRef(0);
  const disableHoverableContent = disableHoverableContentProp ?? providerContext.disableHoverableContent;
  const delayDuration = delayDurationProp ?? providerContext.delayDuration;
  const wasOpenDelayedRef = reactExports.useRef(false);
  const [open, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: (open2) => {
      if (open2) {
        providerContext.onOpen();
        document.dispatchEvent(new CustomEvent(TOOLTIP_OPEN));
      } else {
        providerContext.onClose();
      }
      onOpenChange?.(open2);
    },
    caller: TOOLTIP_NAME
  });
  const stateAttribute = reactExports.useMemo(() => {
    return open ? wasOpenDelayedRef.current ? "delayed-open" : "instant-open" : "closed";
  }, [open]);
  const handleOpen = reactExports.useCallback(() => {
    window.clearTimeout(openTimerRef.current);
    openTimerRef.current = 0;
    wasOpenDelayedRef.current = false;
    setOpen(true);
  }, [setOpen]);
  const handleClose = reactExports.useCallback(() => {
    window.clearTimeout(openTimerRef.current);
    openTimerRef.current = 0;
    setOpen(false);
  }, [setOpen]);
  const handleDelayedOpen = reactExports.useCallback(() => {
    window.clearTimeout(openTimerRef.current);
    openTimerRef.current = window.setTimeout(() => {
      wasOpenDelayedRef.current = true;
      setOpen(true);
      openTimerRef.current = 0;
    }, delayDuration);
  }, [delayDuration, setOpen]);
  reactExports.useEffect(() => {
    return () => {
      if (openTimerRef.current) {
        window.clearTimeout(openTimerRef.current);
        openTimerRef.current = 0;
      }
    };
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Root2, { ...popperScope, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    TooltipContextProvider,
    {
      scope: __scopeTooltip,
      contentId,
      open,
      stateAttribute,
      trigger,
      onTriggerChange: setTrigger,
      onTriggerEnter: reactExports.useCallback(() => {
        if (providerContext.isOpenDelayedRef.current) handleDelayedOpen();
        else handleOpen();
      }, [providerContext.isOpenDelayedRef, handleDelayedOpen, handleOpen]),
      onTriggerLeave: reactExports.useCallback(() => {
        if (disableHoverableContent) {
          handleClose();
        } else {
          window.clearTimeout(openTimerRef.current);
          openTimerRef.current = 0;
        }
      }, [handleClose, disableHoverableContent]),
      onOpen: handleOpen,
      onClose: handleClose,
      disableHoverableContent,
      children
    }
  ) });
};
Tooltip$1.displayName = TOOLTIP_NAME;
var TRIGGER_NAME = "TooltipTrigger";
var TooltipTrigger$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeTooltip, ...triggerProps } = props;
    const context = useTooltipContext(TRIGGER_NAME, __scopeTooltip);
    const providerContext = useTooltipProviderContext(TRIGGER_NAME, __scopeTooltip);
    const popperScope = usePopperScope(__scopeTooltip);
    const ref = reactExports.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, ref, context.onTriggerChange);
    const isPointerDownRef = reactExports.useRef(false);
    const hasPointerMoveOpenedRef = reactExports.useRef(false);
    const handlePointerUp = reactExports.useCallback(() => isPointerDownRef.current = false, []);
    reactExports.useEffect(() => {
      return () => document.removeEventListener("pointerup", handlePointerUp);
    }, [handlePointerUp]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Anchor, { asChild: true, ...popperScope, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.button,
      {
        "aria-describedby": context.open ? context.contentId : void 0,
        "data-state": context.stateAttribute,
        ...triggerProps,
        ref: composedRefs,
        onPointerMove: composeEventHandlers(props.onPointerMove, (event) => {
          if (event.pointerType === "touch") return;
          if (!hasPointerMoveOpenedRef.current && !providerContext.isPointerInTransitRef.current) {
            context.onTriggerEnter();
            hasPointerMoveOpenedRef.current = true;
          }
        }),
        onPointerLeave: composeEventHandlers(props.onPointerLeave, () => {
          context.onTriggerLeave();
          hasPointerMoveOpenedRef.current = false;
        }),
        onPointerDown: composeEventHandlers(props.onPointerDown, () => {
          if (context.open) {
            context.onClose();
          }
          isPointerDownRef.current = true;
          document.addEventListener("pointerup", handlePointerUp, { once: true });
        }),
        onFocus: composeEventHandlers(props.onFocus, () => {
          if (!isPointerDownRef.current) context.onOpen();
        }),
        onBlur: composeEventHandlers(props.onBlur, context.onClose),
        onClick: composeEventHandlers(props.onClick, context.onClose)
      }
    ) });
  }
);
TooltipTrigger$1.displayName = TRIGGER_NAME;
var PORTAL_NAME = "TooltipPortal";
var [PortalProvider, usePortalContext] = createTooltipContext(PORTAL_NAME, {
  forceMount: void 0
});
var TooltipPortal = (props) => {
  const { __scopeTooltip, forceMount, children, container } = props;
  const context = useTooltipContext(PORTAL_NAME, __scopeTooltip);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(PortalProvider, { scope: __scopeTooltip, forceMount, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Portal$1, { asChild: true, container, children }) }) });
};
TooltipPortal.displayName = PORTAL_NAME;
var CONTENT_NAME = "TooltipContent";
var TooltipContent$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const portalContext = usePortalContext(CONTENT_NAME, props.__scopeTooltip);
    const { forceMount = portalContext.forceMount, side = "top", ...contentProps } = props;
    const context = useTooltipContext(CONTENT_NAME, props.__scopeTooltip);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.open, children: context.disableHoverableContent ? /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContentImpl, { side, ...contentProps, ref: forwardedRef }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContentHoverable, { side, ...contentProps, ref: forwardedRef }) });
  }
);
var TooltipContentHoverable = reactExports.forwardRef((props, forwardedRef) => {
  const context = useTooltipContext(CONTENT_NAME, props.__scopeTooltip);
  const providerContext = useTooltipProviderContext(CONTENT_NAME, props.__scopeTooltip);
  const ref = reactExports.useRef(null);
  const composedRefs = useComposedRefs(forwardedRef, ref);
  const [pointerGraceArea, setPointerGraceArea] = reactExports.useState(null);
  const { trigger, onClose } = context;
  const content = ref.current;
  const { onPointerInTransitChange } = providerContext;
  const handleRemoveGraceArea = reactExports.useCallback(() => {
    setPointerGraceArea(null);
    onPointerInTransitChange(false);
  }, [onPointerInTransitChange]);
  const handleCreateGraceArea = reactExports.useCallback(
    (event, hoverTarget) => {
      const currentTarget = event.currentTarget;
      const exitPoint = { x: event.clientX, y: event.clientY };
      const exitSide = getExitSideFromRect(exitPoint, currentTarget.getBoundingClientRect());
      const paddedExitPoints = getPaddedExitPoints(exitPoint, exitSide);
      const hoverTargetPoints = getPointsFromRect(hoverTarget.getBoundingClientRect());
      const graceArea = getHull([...paddedExitPoints, ...hoverTargetPoints]);
      setPointerGraceArea(graceArea);
      onPointerInTransitChange(true);
    },
    [onPointerInTransitChange]
  );
  reactExports.useEffect(() => {
    return () => handleRemoveGraceArea();
  }, [handleRemoveGraceArea]);
  reactExports.useEffect(() => {
    if (trigger && content) {
      const handleTriggerLeave = (event) => handleCreateGraceArea(event, content);
      const handleContentLeave = (event) => handleCreateGraceArea(event, trigger);
      trigger.addEventListener("pointerleave", handleTriggerLeave);
      content.addEventListener("pointerleave", handleContentLeave);
      return () => {
        trigger.removeEventListener("pointerleave", handleTriggerLeave);
        content.removeEventListener("pointerleave", handleContentLeave);
      };
    }
  }, [trigger, content, handleCreateGraceArea, handleRemoveGraceArea]);
  reactExports.useEffect(() => {
    if (pointerGraceArea) {
      const handleTrackPointerGrace = (event) => {
        const target = event.target;
        const pointerPosition = { x: event.clientX, y: event.clientY };
        const hasEnteredTarget = trigger?.contains(target) || content?.contains(target);
        const isPointerOutsideGraceArea = !isPointInPolygon(pointerPosition, pointerGraceArea);
        if (hasEnteredTarget) {
          handleRemoveGraceArea();
        } else if (isPointerOutsideGraceArea) {
          handleRemoveGraceArea();
          onClose();
        }
      };
      document.addEventListener("pointermove", handleTrackPointerGrace);
      return () => document.removeEventListener("pointermove", handleTrackPointerGrace);
    }
  }, [trigger, content, pointerGraceArea, onClose, handleRemoveGraceArea]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContentImpl, { ...props, ref: composedRefs });
});
var [VisuallyHiddenContentContextProvider, useVisuallyHiddenContentContext] = createTooltipContext(TOOLTIP_NAME, { isInside: false });
var Slottable = createSlottable("TooltipContent");
var TooltipContentImpl = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeTooltip,
      children,
      "aria-label": ariaLabel,
      onEscapeKeyDown,
      onPointerDownOutside,
      ...contentProps
    } = props;
    const context = useTooltipContext(CONTENT_NAME, __scopeTooltip);
    const popperScope = usePopperScope(__scopeTooltip);
    const { onClose } = context;
    reactExports.useEffect(() => {
      document.addEventListener(TOOLTIP_OPEN, onClose);
      return () => document.removeEventListener(TOOLTIP_OPEN, onClose);
    }, [onClose]);
    reactExports.useEffect(() => {
      if (context.trigger) {
        const handleScroll = (event) => {
          const target = event.target;
          if (target?.contains(context.trigger)) onClose();
        };
        window.addEventListener("scroll", handleScroll, { capture: true });
        return () => window.removeEventListener("scroll", handleScroll, { capture: true });
      }
    }, [context.trigger, onClose]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      DismissableLayer,
      {
        asChild: true,
        disableOutsidePointerEvents: false,
        onEscapeKeyDown,
        onPointerDownOutside,
        onFocusOutside: (event) => event.preventDefault(),
        onDismiss: onClose,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Content,
          {
            "data-state": context.stateAttribute,
            ...popperScope,
            ...contentProps,
            ref: forwardedRef,
            style: {
              ...contentProps.style,
              // re-namespace exposed content custom properties
              ...{
                "--radix-tooltip-content-transform-origin": "var(--radix-popper-transform-origin)",
                "--radix-tooltip-content-available-width": "var(--radix-popper-available-width)",
                "--radix-tooltip-content-available-height": "var(--radix-popper-available-height)",
                "--radix-tooltip-trigger-width": "var(--radix-popper-anchor-width)",
                "--radix-tooltip-trigger-height": "var(--radix-popper-anchor-height)"
              }
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Slottable, { children }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(VisuallyHiddenContentContextProvider, { scope: __scopeTooltip, isInside: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Root, { id: context.contentId, role: "tooltip", children: ariaLabel || children }) })
            ]
          }
        )
      }
    );
  }
);
TooltipContent$1.displayName = CONTENT_NAME;
var ARROW_NAME = "TooltipArrow";
var TooltipArrow = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeTooltip, ...arrowProps } = props;
    const popperScope = usePopperScope(__scopeTooltip);
    const visuallyHiddenContentContext = useVisuallyHiddenContentContext(
      ARROW_NAME,
      __scopeTooltip
    );
    return visuallyHiddenContentContext.isInside ? null : /* @__PURE__ */ jsxRuntimeExports.jsx(Arrow, { ...popperScope, ...arrowProps, ref: forwardedRef });
  }
);
TooltipArrow.displayName = ARROW_NAME;
function getExitSideFromRect(point, rect) {
  const top = Math.abs(rect.top - point.y);
  const bottom = Math.abs(rect.bottom - point.y);
  const right = Math.abs(rect.right - point.x);
  const left = Math.abs(rect.left - point.x);
  switch (Math.min(top, bottom, right, left)) {
    case left:
      return "left";
    case right:
      return "right";
    case top:
      return "top";
    case bottom:
      return "bottom";
    default:
      throw new Error("unreachable");
  }
}
function getPaddedExitPoints(exitPoint, exitSide, padding = 5) {
  const paddedExitPoints = [];
  switch (exitSide) {
    case "top":
      paddedExitPoints.push(
        { x: exitPoint.x - padding, y: exitPoint.y + padding },
        { x: exitPoint.x + padding, y: exitPoint.y + padding }
      );
      break;
    case "bottom":
      paddedExitPoints.push(
        { x: exitPoint.x - padding, y: exitPoint.y - padding },
        { x: exitPoint.x + padding, y: exitPoint.y - padding }
      );
      break;
    case "left":
      paddedExitPoints.push(
        { x: exitPoint.x + padding, y: exitPoint.y - padding },
        { x: exitPoint.x + padding, y: exitPoint.y + padding }
      );
      break;
    case "right":
      paddedExitPoints.push(
        { x: exitPoint.x - padding, y: exitPoint.y - padding },
        { x: exitPoint.x - padding, y: exitPoint.y + padding }
      );
      break;
  }
  return paddedExitPoints;
}
function getPointsFromRect(rect) {
  const { top, right, bottom, left } = rect;
  return [
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom }
  ];
}
function isPointInPolygon(point, polygon) {
  const { x, y } = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const ii = polygon[i];
    const jj = polygon[j];
    const xi = ii.x;
    const yi = ii.y;
    const xj = jj.x;
    const yj = jj.y;
    const intersect = yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
function getHull(points) {
  const newPoints = points.slice();
  newPoints.sort((a, b) => {
    if (a.x < b.x) return -1;
    else if (a.x > b.x) return 1;
    else if (a.y < b.y) return -1;
    else if (a.y > b.y) return 1;
    else return 0;
  });
  return getHullPresorted(newPoints);
}
function getHullPresorted(points) {
  if (points.length <= 1) return points.slice();
  const upperHull = [];
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    while (upperHull.length >= 2) {
      const q = upperHull[upperHull.length - 1];
      const r = upperHull[upperHull.length - 2];
      if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x)) upperHull.pop();
      else break;
    }
    upperHull.push(p);
  }
  upperHull.pop();
  const lowerHull = [];
  for (let i = points.length - 1; i >= 0; i--) {
    const p = points[i];
    while (lowerHull.length >= 2) {
      const q = lowerHull[lowerHull.length - 1];
      const r = lowerHull[lowerHull.length - 2];
      if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x)) lowerHull.pop();
      else break;
    }
    lowerHull.push(p);
  }
  lowerHull.pop();
  if (upperHull.length === 1 && lowerHull.length === 1 && upperHull[0].x === lowerHull[0].x && upperHull[0].y === lowerHull[0].y) {
    return upperHull;
  } else {
    return upperHull.concat(lowerHull);
  }
}
var Provider = TooltipProvider$1;
var Root3 = Tooltip$1;
var Trigger = TooltipTrigger$1;
var Portal = TooltipPortal;
var Content2 = TooltipContent$1;
const TooltipProvider = Provider;
const Tooltip = Root3;
const TooltipTrigger = Trigger;
const TooltipContent = reactExports.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Portal, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content2,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-tooltip-content-transform-origin]",
      className
    ),
    ...props
  }
) }));
TooltipContent.displayName = Content2.displayName;
const SPECIES = ["Cattle", "Sheep", "Pigs", "Poultry", "Goats", "Deer"];
const SPECIES_COLOUR = {
  Cattle: "bg-blue-100 text-blue-800",
  Sheep: "bg-green-100 text-green-800",
  Pigs: "bg-pink-100 text-pink-800",
  Poultry: "bg-yellow-100 text-yellow-800",
  Goats: "bg-purple-100 text-purple-800",
  Deer: "bg-orange-100 text-orange-800"
};
const PIE_COLOURS = ["#3b82f6", "#22c55e", "#ec4899", "#eab308", "#a855f7", "#f97316"];
const OUTCOMES = [
  { key: "satisfactory", label: "Satisfactory", icon: CircleCheck, colour: "text-green-600", bg: "bg-green-50 border-green-300" },
  { key: "action_required", label: "Action Required", icon: CircleAlert, colour: "text-amber-600", bg: "bg-amber-50 border-amber-300" },
  { key: "urgent_action", label: "Urgent Action", icon: TriangleAlert, colour: "text-red-600", bg: "bg-red-50 border-red-300" }
];
function addOneYear(dateStr) {
  const d = new Date(dateStr);
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}
const VET_OTHER = "__other__";
function AHWRPage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [tab, setTab] = usePersistedTab({
    page: "ahwr",
    farmId,
    validIds: ["reviews", "analytics"],
    defaultTab: "reviews"
  });
  const [speciesFilter, setSpeciesFilter] = usePersistedFilter({
    page: "ahwr",
    filter: "species",
    farmId,
    defaultValue: "all"
  });
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [nextReviewAutoSet, setNextReviewAutoSet] = reactExports.useState(false);
  const [vetSelectVal, setVetSelectVal] = reactExports.useState("");
  const [showTaskPrompt, setShowTaskPrompt] = reactExports.useState(false);
  const [savedRecordId, setSavedRecordId] = reactExports.useState(null);
  const recordsQ = useQuery({
    queryKey: ["farms", farmId, "ahwr-records"],
    queryFn: () => api.get(`/farms/${farmId}/ahwr-records`).then((r) => r.records ?? []),
    enabled: !!farmId
  });
  const farmQ = useQuery({
    queryKey: ["farms", farmId, "info"],
    queryFn: () => api.get(`/farms/${farmId}`).then((r) => r.farm ?? r),
    enabled: !!farmId
  });
  const contactsQ = useQuery({
    queryKey: ["farms", farmId, "ahwr-vet-contacts"],
    queryFn: () => api.get(`/farms/${farmId}/ahwr-vet-contacts`).then((r) => r.contacts ?? []),
    enabled: !!farmId
  });
  const records = recordsQ.data ?? [];
  const contacts = contactsQ.data ?? [];
  const vetContacts = contacts.filter(
    (c) => !c.role || c.role.toLowerCase().includes("vet") || c.role.toLowerCase().includes("veterinar")
  );
  const vetOptions = vetContacts.length > 0 ? vetContacts : contacts;
  const filtered = speciesFilter === "all" ? records : records.filter((r) => r.species === speciesFilter);
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const overdue = records.filter((r) => r.nextReviewDue && r.nextReviewDue < today);
  const f = (field, val) => setForm((p) => ({ ...p, [field]: val }));
  function openAdd() {
    setEditing(null);
    const sbi = farmQ.data?.sbiNumber ?? "";
    const today2 = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    setForm({
      species: "Cattle",
      reviewDate: today2,
      sbiNumber: sbi,
      nextReviewDue: addOneYear(today2)
    });
    setNextReviewAutoSet(true);
    setVetSelectVal("");
    setShowTaskPrompt(false);
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm({ ...r });
    setNextReviewAutoSet(false);
    setVetSelectVal(r.vetContactId ? String(r.vetContactId) : r.vetName ? VET_OTHER : "");
    setShowTaskPrompt(false);
    setOpen(true);
  }
  function closeDialog() {
    setOpen(false);
    setEditing(null);
    setForm({});
    setNextReviewAutoSet(false);
    setVetSelectVal("");
    setShowTaskPrompt(false);
  }
  reactExports.useEffect(() => {
    if (!form.reviewDate) return;
    if (nextReviewAutoSet || !form.nextReviewDue) {
      setForm((p) => ({ ...p, nextReviewDue: addOneYear(form.reviewDate) }));
      setNextReviewAutoSet(true);
    }
  }, [form.reviewDate]);
  function handleVetSelect(val) {
    setVetSelectVal(val);
    if (val === VET_OTHER || val === "") {
      f("vetContactId", null);
    } else {
      const contact = vetOptions.find((c) => String(c.id) === val);
      if (contact) {
        setForm((p) => ({
          ...p,
          vetContactId: contact.id,
          vetName: contact.name,
          vetPractice: contact.organisation ?? "",
          // Pre-fill "agreed with" with vet name if not already set
          agreedWith: p.agreedWith || contact.name
        }));
      }
    }
  }
  const saveMut = useMutation({
    mutationFn: (body) => editing ? api.put(`/farms/${farmId}/ahwr-records/${editing.id}`, body) : api.post(`/farms/${farmId}/ahwr-records`, body),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["farms", farmId, "ahwr-records"] });
      toast({ title: editing ? "AHWR record updated" : "AHWR record saved" });
      if (form.actionsAgreed?.trim()) {
        const id = data?.record?.id ?? editing?.id ?? null;
        setSavedRecordId(id);
        setShowTaskPrompt(true);
      } else {
        closeDialog();
      }
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const taskMut = useMutation({
    mutationFn: (body) => api.post(`/farms/${farmId}/task-assignments`, body),
    onSuccess: () => {
      toast({ title: "Follow-up task created" });
      closeDialog();
    },
    onError: () => {
      toast({ title: "Failed to create task", variant: "destructive" });
      closeDialog();
    }
  });
  function raiseFollowUpTask() {
    taskMut.mutate({
      title: `AHWR follow-up — ${form.species ?? ""}${form.reviewDate ? ` (${form.reviewDate})` : ""}`,
      description: form.actionsAgreed ?? "",
      dueDate: form.nextReviewDue ?? void 0
    });
  }
  const bySpecies = SPECIES.map((s) => ({
    species: s,
    count: records.filter((r) => r.species === s).length
  })).filter((d) => d.count > 0);
  const byYear = Array.from(new Set(records.map((r) => r.reviewDate.slice(0, 4)))).sort().map((yr) => ({
    year: yr,
    count: records.filter((r) => r.reviewDate.startsWith(yr)).length
  }));
  const upcoming = records.filter((r) => r.nextReviewDue && r.nextReviewDue >= today).sort((a, b) => a.nextReviewDue.localeCompare(b.nextReviewDue)).slice(0, 4);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { title: "Annual Health & Welfare Review (AHWR)", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "AHWR" }),
      " — Annual vet health and welfare reviews are a condition of SFI/ELM payments. Records must be kept for at least 5 years. Add your attending vets to ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Farm Settings → Contacts" }),
      " to enable intelligent vet lookup and auto-population."
    ] }),
    overdue.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-amber-800 font-medium text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4" }),
        overdue.length,
        " review",
        overdue.length > 1 ? "s" : "",
        " overdue"
      ] }),
      overdue.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-amber-700 mt-1 cursor-pointer hover:underline", onClick: () => openEdit(r), children: [
        r.species,
        " — due ",
        r.nextReviewDue
      ] }, r.id))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4 gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: tab === "reviews" ? "default" : "outline", onClick: () => setTab("reviews"), children: "Reviews" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: tab === "analytics" ? "default" : "outline", onClick: () => setTab("analytics"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "w-3.5 h-3.5 mr-1" }),
          "Analytics"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-wrap items-center", children: [
        tab === "reviews" && ["all", ...SPECIES].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: speciesFilter === s ? "default" : "outline", onClick: () => setSpeciesFilter(s), children: s === "all" ? "All" : s }, s)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add AHWR"
        ] })
      ] })
    ] }),
    tab === "reviews" && /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: recordsQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stethoscope, { className: "mx-auto mb-2 w-10 h-10 opacity-30" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "No AHWR records",
        speciesFilter !== "all" ? ` for ${speciesFilter}` : "",
        ". Add your first review."
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: filtered.sort((a, b) => b.reviewDate.localeCompare(a.reviewDate)).map((r) => {
      const outcomeObj = OUTCOMES.find((o) => o.key === r.outcome);
      const OutcomeIcon = outcomeObj?.icon;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "bg-white border rounded-lg p-4 cursor-pointer hover:shadow-sm transition-shadow",
          onClick: () => openEdit(r),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: SPECIES_COLOUR[r.species] ?? "bg-gray-100 text-gray-700", children: r.species }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: r.reviewDate }),
                outcomeObj && OutcomeIcon && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `flex items-center gap-1 text-xs font-medium ${outcomeObj.colour}`, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(OutcomeIcon, { className: "w-3 h-3" }),
                  outcomeObj.label
                ] }),
                r.nextReviewDue && r.nextReviewDue < today && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-amber-100 text-amber-800 text-xs", children: "Overdue" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: (e) => {
                e.stopPropagation();
                window.print();
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "Vet: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: r.vetName }),
                r.vetPractice ? ` — ${r.vetPractice}` : ""
              ] }),
              r.ahwrRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "Ref: ",
                r.ahwrRef
              ] }),
              r.keyFindings && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "line-clamp-2", children: [
                "Findings: ",
                r.keyFindings
              ] }),
              r.actionsAgreed && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-1 text-blue-700", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListChecks, { className: "w-3 h-3" }),
                "Actions agreed",
                r.agreedWith ? ` with ${r.agreedWith}` : ""
              ] }),
              r.nextReviewDue && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: r.nextReviewDue < today ? "text-amber-600 font-medium" : "text-blue-700", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarCheck, { className: "inline w-3 h-3 mr-1" }),
                "Next due: ",
                r.nextReviewDue
              ] })
            ] })
          ]
        },
        r.id
      );
    }) }) }),
    tab === "analytics" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
        { label: "Total Reviews", value: records.length },
        { label: "Overdue", value: overdue.length, amber: overdue.length > 0 },
        {
          label: "Upcoming (next 90d)",
          value: records.filter((r) => {
            const d90 = new Date(Date.now() + 90 * 864e5).toISOString().slice(0, 10);
            return r.nextReviewDue && r.nextReviewDue >= today && r.nextReviewDue <= d90;
          }).length,
          blue: true
        },
        { label: "Species Covered", value: new Set(records.map((r) => r.species)).size }
      ].map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-2xl font-bold ${s.amber ? "text-amber-600" : s.blue ? "text-blue-600" : ""}`, children: s.value }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: s.label })
      ] }, i)) }),
      records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-muted-foreground border rounded-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stethoscope, { className: "mx-auto mb-2 w-10 h-10 opacity-30" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No AHWR records yet. Add your first review to see analytics." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          bySpecies.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium mb-3", children: "Reviews by Species" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 180, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: bySpecies, dataKey: "count", nameKey: "species", cx: "50%", cy: "50%", outerRadius: 65, label: (d) => d.species, children: bySpecies.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: PIE_COLOURS[i % PIE_COLOURS.length] }, i)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip$2, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {})
            ] }) })
          ] }),
          byYear.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium mb-3", children: "Annual Review Frequency" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 180, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: byYear, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "year", tick: { fontSize: 11 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { allowDecimals: false, tick: { fontSize: 11 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip$2, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "count", fill: "#3b82f6", radius: [4, 4, 0, 0], name: "Reviews" })
            ] }) })
          ] })
        ] }),
        upcoming.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-medium mb-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarCheck, { className: "w-4 h-4 text-blue-600" }),
            "Upcoming Reviews"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: upcoming.map((r) => {
            const daysUntil = Math.ceil((new Date(r.nextReviewDue).getTime() - Date.now()) / 864e5);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm border rounded p-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: SPECIES_COLOUR[r.species] ?? "bg-gray-100 text-gray-700", children: r.species }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                  "Vet: ",
                  r.vetName
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `text-xs font-medium ${daysUntil <= 30 ? "text-amber-600" : "text-blue-600"}`, children: [
                "Due ",
                r.nextReviewDue,
                " (",
                daysUntil,
                "d)"
              ] })
            ] }, r.id);
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium mb-3", children: "SFI / ELM Compliance Overview" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 text-xs", children: SPECIES.map((sp) => {
            const spRecords = records.filter((r) => r.species === sp);
            const latest = spRecords.sort((a, b) => b.reviewDate.localeCompare(a.reviewDate))[0];
            const isOverdue = latest?.nextReviewDue && latest.nextReviewDue < today;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded p-3 border ${isOverdue ? "border-amber-300 bg-amber-50" : spRecords.length > 0 ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold mb-1", children: sp }),
              spRecords.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "No records" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                  "Last: ",
                  latest.reviewDate
                ] }),
                latest.nextReviewDue && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: isOverdue ? "text-amber-600 font-medium" : "text-green-700", children: [
                  "Next: ",
                  latest.nextReviewDue
                ] })
              ] })
            ] }, sp);
          }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      if (!o) closeDialog();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit AHWR Record" : "Add Annual Health & Welfare Review" }) }),
      showTaskPrompt && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListChecks, { className: "w-4 h-4 text-blue-700 mt-0.5 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-blue-800", children: "Actions recorded — raise a follow-up task?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-blue-700 mt-1", children: "The actions agreed during this review can be added to your Week Ahead task planner so they appear as reminders for your team. The next review date will be set as the due date." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: raiseFollowUpTask, disabled: taskMut.isPending, children: taskMut.isPending ? "Creating…" : "Yes, raise a task" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: closeDialog, children: "No thanks, close" })
        ] })
      ] }),
      !showTaskPrompt && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        saveMut.mutate(form);
      }, className: "space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Review Details" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Species *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.species ?? "Cattle", onValueChange: (v) => f("species", v), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SPECIES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Review Date *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "date",
                  value: form.reviewDate ?? "",
                  onChange: (e) => f("reviewDate", e.target.value),
                  required: true
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "SBI Number" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-3.5 h-3.5 text-muted-foreground cursor-help" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { className: "max-w-xs", children: "Auto-filled from Farm Settings. Edit Farm Settings to change your registered SBI. You can override it here for this record only." })
              ] }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: form.sbiNumber ?? "",
                  onChange: (e) => f("sbiNumber", e.target.value),
                  placeholder: "Single Business Identifier",
                  className: farmQ.data?.sbiNumber && form.sbiNumber === farmQ.data.sbiNumber ? "bg-gray-50" : ""
                }
              ),
              farmQ.data?.sbiNumber && form.sbiNumber === farmQ.data.sbiNumber && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none", children: "from Farm Settings" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Attending Vet" }),
          vetOptions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 flex items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-3.5 h-3.5 shrink-0 mt-0.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "No contacts registered. Add your attending vet in ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Farm Settings → Contacts" }),
              " to enable intelligent vet lookup and automatic practice population. You can still enter details manually below."
            ] })
          ] }) : null,
          vetOptions.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Select Vet" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: vetSelectVal, onValueChange: handleVetSelect, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Choose from registered contacts…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                vetOptions.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(c.id), children: [
                  c.name,
                  c.organisation ? ` — ${c.organisation}` : ""
                ] }, c.id)),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: VET_OTHER, children: "Other / manual entry…" })
              ] })
            ] }),
            vetSelectVal && vetSelectVal !== VET_OTHER && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1 flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "w-3 h-3 text-green-600" }),
              "Vet name and practice auto-populated from your Contacts register"
            ] })
          ] }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet Name *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: form.vetName ?? "",
                  onChange: (e) => f("vetName", e.target.value),
                  required: true,
                  readOnly: !!(vetSelectVal && vetSelectVal !== VET_OTHER && vetOptions.length > 0),
                  className: vetSelectVal && vetSelectVal !== VET_OTHER && vetOptions.length > 0 ? "bg-gray-50" : "",
                  placeholder: "e.g. Dr Sarah Jones"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet Practice" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: form.vetPractice ?? "",
                  onChange: (e) => f("vetPractice", e.target.value),
                  readOnly: !!(vetSelectVal && vetSelectVal !== VET_OTHER && vetOptions.length > 0),
                  className: vetSelectVal && vetSelectVal !== VET_OTHER && vetOptions.length > 0 ? "bg-gray-50" : "",
                  placeholder: "Practice name"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Findings & Priorities" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Areas Reviewed" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: form.areasReviewed ?? "",
                onChange: (e) => f("areasReviewed", e.target.value),
                placeholder: "e.g. Biosecurity, lameness, BVD, nutrition, parasite management"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Key Findings" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                value: form.keyFindings ?? "",
                onChange: (e) => f("keyFindings", e.target.value),
                rows: 3,
                placeholder: "Summary of health status, disease pressures, body condition, welfare indicators…"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Health Priorities for Next 12 Months" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                value: form.healthPriorities ?? "",
                onChange: (e) => f("healthPriorities", e.target.value),
                rows: 2,
                placeholder: "Vaccination protocols, endemic disease management, nutrition plans…"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Recommendations" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                value: form.recommendations ?? "",
                onChange: (e) => f("recommendations", e.target.value),
                rows: 2,
                placeholder: "Vet's formal recommendations for herd / flock health"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Actions Agreed" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Saved actions can be raised as a follow-up task after saving" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Actions Agreed" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                value: form.actionsAgreed ?? "",
                onChange: (e) => f("actionsAgreed", e.target.value),
                rows: 3,
                placeholder: "Specific actions agreed — ideally name a responsible person and target date for each"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Agreed With" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: form.agreedWith ?? "",
                onChange: (e) => f("agreedWith", e.target.value),
                placeholder: "e.g. Dr Sarah Jones and farm manager"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Auto-filled with the vet name when a registered contact is selected" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Outcome & Schedule" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-2 block", children: "Overall Outcome" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 flex-wrap", children: OUTCOMES.map((o) => {
              const Icon = o.icon;
              const selected = form.outcome === o.key;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => f("outcome", selected ? null : o.key),
                  className: `flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${selected ? `${o.bg} ${o.colour} border-current` : "border-gray-200 text-muted-foreground hover:border-gray-400"}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-3.5 h-3.5" }),
                    o.label
                  ]
                },
                o.key
              );
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Review Due" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-3.5 h-3.5 text-muted-foreground cursor-help" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { className: "max-w-xs", children: "Auto-calculated to 12 months from the review date. Appears in the Week Ahead Planner as an upcoming task reminder. Edit to override." })
                ] }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "date",
                  value: form.nextReviewDue ?? "",
                  onChange: (e) => {
                    f("nextReviewDue", e.target.value);
                    setNextReviewAutoSet(false);
                  }
                }
              ),
              nextReviewAutoSet && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Auto-set to 12 months from review date" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "AHWR Reference" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-3.5 h-3.5 text-muted-foreground cursor-help" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { className: "max-w-xs", children: "The reference number on the vet's report, or the RPA action reference assigned when you confirm the review under your SFI agreement. This is not an RPA claim number — it is your own record-keeping reference for this review." })
                ] }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: form.ahwrRef ?? "",
                  onChange: (e) => f("ahwrRef", e.target.value),
                  placeholder: "Vet report or RPA action reference"
                }
              )
            ] })
          ] })
        ] }),
        editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "w-3.5 h-3.5" }),
            "Vet Report & Attachments"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Attach the vet's written report (paper scan, emailed PDF, or photo). Accepted formats: PDF, images, Word documents." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "ahwr_review", recordId: editing.id })
        ] }),
        !editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-muted-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "w-3.5 h-3.5 shrink-0" }),
          "Save this record first, then re-open it to attach the vet's written report or PDF."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: form.notes ?? "",
              onChange: (e) => f("notes", e.target.value),
              rows: 2,
              placeholder: "Additional observations or context"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: closeDialog, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: saveMut.isPending, children: saveMut.isPending ? "Saving…" : editing ? "Update Review" : "Save Review" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  AHWRPage as default
};
