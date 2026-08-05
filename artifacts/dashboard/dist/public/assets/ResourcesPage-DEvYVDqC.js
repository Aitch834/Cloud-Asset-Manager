import { s as createLucideIcon, r as reactExports, Q as React, am as reactDomExports, b as useAppStore, j as jsxRuntimeExports, R as Redirect, c as useQueryClient, m as useQuery, O as useMutation, l as cn, a_ as toast, a0 as X, S as Plus, n as Card } from "./index-Cgwa2fkn.js";
import { A as AppLayout, d as Wrench, j as Truck, C as CalendarDays, c as ClipboardList, R as RotateCcw } from "./AppLayout-D8J6skGX.js";
import { u as usePersistedTab } from "./use-persisted-tab-CcbPQ_kp.js";
import { C as ChartNoAxesColumn } from "./chart-no-axes-column-AyL63pDk.js";
import { T as Tractor, C as ChevronRight } from "./tractor-BAeEka3V.js";
import { D as Droplets } from "./shield-alert-DUKBl-az.js";
import { P as Package } from "./use-safe-clerk-DplYw4dj.js";
import { U as User } from "./user-DWgRMnFP.js";
import { S as Search } from "./search-C5AgqFNe.js";
import { C as ChevronLeft } from "./chevron-left-Bt9D8fZS.js";
import { F as FileDown } from "./file-down-Cez3H3sZ.js";
import { C as CircleAlert, a as Clock } from "./database-C40ohlYs.js";
import { B as BadgeCheck } from "./badge-check-DzsCNvQv.js";
import { H as History } from "./history-CgopUAsg.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, B as Bar, C as Cell } from "./generateCategoricalChart-CoWsB4Q_.js";
import { B as BarChart } from "./BarChart-DXn1CwFj.js";
import { C as CartesianGrid } from "./CartesianGrid-Vy7CRQ2S.js";
import { S as Sparkles } from "./sparkles-ClMrbwu4.js";
import { S as SquareCheckBig } from "./square-check-big-BJcSPSch.js";
import { D as Download } from "./download-BmbZSwjL.js";
import { C as ChevronDown } from "./trash-2-4wGGdwwT.js";
import { P as Pencil } from "./pencil-DvtEfriU.js";
import { A as Archive } from "./archive-CkHNtMqx.js";
import { C as CircleCheck } from "./circle-check-BsNARtMg.js";
import "./triangle-alert-B-yEgefX.js";
import "./shield-check-CVea-cql.js";
const __iconNode$4 = [
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["path", { d: "M3 10h18", key: "8toen8" }],
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M17 14h-6", key: "bkmgh3" }],
  ["path", { d: "M13 18H7", key: "bb0bb7" }],
  ["path", { d: "M7 14h.01", key: "1qa3f1" }],
  ["path", { d: "M17 18h.01", key: "1bdyru" }]
];
const CalendarRange = createLucideIcon("calendar-range", __iconNode$4);
const __iconNode$3 = [
  ["path", { d: "M10.1 2.182a10 10 0 0 1 3.8 0", key: "5ilxe3" }],
  ["path", { d: "M13.9 21.818a10 10 0 0 1-3.8 0", key: "11zvb9" }],
  ["path", { d: "M17.609 3.721a10 10 0 0 1 2.69 2.7", key: "1iw5b2" }],
  ["path", { d: "M2.182 13.9a10 10 0 0 1 0-3.8", key: "c0bmvh" }],
  ["path", { d: "M20.279 17.609a10 10 0 0 1-2.7 2.69", key: "1ruxm7" }],
  ["path", { d: "M21.818 10.1a10 10 0 0 1 0 3.8", key: "qkgqxc" }],
  ["path", { d: "M3.721 6.391a10 10 0 0 1 2.7-2.69", key: "1mcia2" }],
  ["path", { d: "M6.391 20.279a10 10 0 0 1-2.69-2.7", key: "1fvljs" }]
];
const CircleDashed = createLucideIcon("circle-dashed", __iconNode$3);
const __iconNode$2 = [
  ["circle", { cx: "9", cy: "12", r: "1", key: "1vctgf" }],
  ["circle", { cx: "9", cy: "5", r: "1", key: "hp0tcf" }],
  ["circle", { cx: "9", cy: "19", r: "1", key: "fkjjf6" }],
  ["circle", { cx: "15", cy: "12", r: "1", key: "1tmaij" }],
  ["circle", { cx: "15", cy: "5", r: "1", key: "19l28e" }],
  ["circle", { cx: "15", cy: "19", r: "1", key: "f4zoj3" }]
];
const GripVertical = createLucideIcon("grip-vertical", __iconNode$2);
const __iconNode$1 = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }]
];
const Square = createLucideIcon("square", __iconNode$1);
const __iconNode = [
  ["path", { d: "M9 14 4 9l5-5", key: "102s5s" }],
  ["path", { d: "M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11", key: "f3b9sd" }]
];
const Undo2 = createLucideIcon("undo-2", __iconNode);
const canUseDOM = typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined";
function isWindow(element) {
  const elementString = Object.prototype.toString.call(element);
  return elementString === "[object Window]" || // In Electron context the Window object serializes to [object global]
  elementString === "[object global]";
}
function isNode(node) {
  return "nodeType" in node;
}
function getWindow(target) {
  var _target$ownerDocument, _target$ownerDocument2;
  if (!target) {
    return window;
  }
  if (isWindow(target)) {
    return target;
  }
  if (!isNode(target)) {
    return window;
  }
  return (_target$ownerDocument = (_target$ownerDocument2 = target.ownerDocument) == null ? void 0 : _target$ownerDocument2.defaultView) != null ? _target$ownerDocument : window;
}
function isDocument(node) {
  const {
    Document
  } = getWindow(node);
  return node instanceof Document;
}
function isHTMLElement(node) {
  if (isWindow(node)) {
    return false;
  }
  return node instanceof getWindow(node).HTMLElement;
}
function isSVGElement(node) {
  return node instanceof getWindow(node).SVGElement;
}
function getOwnerDocument(target) {
  if (!target) {
    return document;
  }
  if (isWindow(target)) {
    return target.document;
  }
  if (!isNode(target)) {
    return document;
  }
  if (isDocument(target)) {
    return target;
  }
  if (isHTMLElement(target) || isSVGElement(target)) {
    return target.ownerDocument;
  }
  return document;
}
const useIsomorphicLayoutEffect = canUseDOM ? reactExports.useLayoutEffect : reactExports.useEffect;
function useEvent(handler) {
  const handlerRef = reactExports.useRef(handler);
  useIsomorphicLayoutEffect(() => {
    handlerRef.current = handler;
  });
  return reactExports.useCallback(function() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return handlerRef.current == null ? void 0 : handlerRef.current(...args);
  }, []);
}
function useInterval() {
  const intervalRef = reactExports.useRef(null);
  const set = reactExports.useCallback((listener, duration) => {
    intervalRef.current = setInterval(listener, duration);
  }, []);
  const clear = reactExports.useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);
  return [set, clear];
}
function useLatestValue(value, dependencies) {
  if (dependencies === void 0) {
    dependencies = [value];
  }
  const valueRef = reactExports.useRef(value);
  useIsomorphicLayoutEffect(() => {
    if (valueRef.current !== value) {
      valueRef.current = value;
    }
  }, dependencies);
  return valueRef;
}
function useLazyMemo(callback, dependencies) {
  const valueRef = reactExports.useRef();
  return reactExports.useMemo(
    () => {
      const newValue = callback(valueRef.current);
      valueRef.current = newValue;
      return newValue;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...dependencies]
  );
}
function useNodeRef(onChange) {
  const onChangeHandler = useEvent(onChange);
  const node = reactExports.useRef(null);
  const setNodeRef = reactExports.useCallback(
    (element) => {
      if (element !== node.current) {
        onChangeHandler == null ? void 0 : onChangeHandler(element, node.current);
      }
      node.current = element;
    },
    //eslint-disable-next-line
    []
  );
  return [node, setNodeRef];
}
function usePrevious(value) {
  const ref = reactExports.useRef();
  reactExports.useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
let ids = {};
function useUniqueId(prefix, value) {
  return reactExports.useMemo(() => {
    if (value) {
      return value;
    }
    const id = ids[prefix] == null ? 0 : ids[prefix] + 1;
    ids[prefix] = id;
    return prefix + "-" + id;
  }, [prefix, value]);
}
function createAdjustmentFn(modifier) {
  return function(object) {
    for (var _len = arguments.length, adjustments = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      adjustments[_key - 1] = arguments[_key];
    }
    return adjustments.reduce((accumulator, adjustment) => {
      const entries = Object.entries(adjustment);
      for (const [key2, valueAdjustment] of entries) {
        const value = accumulator[key2];
        if (value != null) {
          accumulator[key2] = value + modifier * valueAdjustment;
        }
      }
      return accumulator;
    }, {
      ...object
    });
  };
}
const add = /* @__PURE__ */ createAdjustmentFn(1);
const subtract = /* @__PURE__ */ createAdjustmentFn(-1);
function hasViewportRelativeCoordinates(event) {
  return "clientX" in event && "clientY" in event;
}
function isKeyboardEvent(event) {
  if (!event) {
    return false;
  }
  const {
    KeyboardEvent
  } = getWindow(event.target);
  return KeyboardEvent && event instanceof KeyboardEvent;
}
function isTouchEvent(event) {
  if (!event) {
    return false;
  }
  const {
    TouchEvent
  } = getWindow(event.target);
  return TouchEvent && event instanceof TouchEvent;
}
function getEventCoordinates(event) {
  if (isTouchEvent(event)) {
    if (event.touches && event.touches.length) {
      const {
        clientX: x,
        clientY: y
      } = event.touches[0];
      return {
        x,
        y
      };
    } else if (event.changedTouches && event.changedTouches.length) {
      const {
        clientX: x,
        clientY: y
      } = event.changedTouches[0];
      return {
        x,
        y
      };
    }
  }
  if (hasViewportRelativeCoordinates(event)) {
    return {
      x: event.clientX,
      y: event.clientY
    };
  }
  return null;
}
const CSS = /* @__PURE__ */ Object.freeze({
  Translate: {
    toString(transform) {
      if (!transform) {
        return;
      }
      const {
        x,
        y
      } = transform;
      return "translate3d(" + (x ? Math.round(x) : 0) + "px, " + (y ? Math.round(y) : 0) + "px, 0)";
    }
  },
  Scale: {
    toString(transform) {
      if (!transform) {
        return;
      }
      const {
        scaleX,
        scaleY
      } = transform;
      return "scaleX(" + scaleX + ") scaleY(" + scaleY + ")";
    }
  },
  Transform: {
    toString(transform) {
      if (!transform) {
        return;
      }
      return [CSS.Translate.toString(transform), CSS.Scale.toString(transform)].join(" ");
    }
  },
  Transition: {
    toString(_ref) {
      let {
        property,
        duration,
        easing
      } = _ref;
      return property + " " + duration + "ms " + easing;
    }
  }
});
const SELECTOR = "a,frame,iframe,input:not([type=hidden]):not(:disabled),select:not(:disabled),textarea:not(:disabled),button:not(:disabled),*[tabindex]";
function findFirstFocusableNode(element) {
  if (element.matches(SELECTOR)) {
    return element;
  }
  return element.querySelector(SELECTOR);
}
const hiddenStyles = {
  display: "none"
};
function HiddenText(_ref) {
  let {
    id,
    value
  } = _ref;
  return React.createElement("div", {
    id,
    style: hiddenStyles
  }, value);
}
function LiveRegion(_ref) {
  let {
    id,
    announcement,
    ariaLiveType = "assertive"
  } = _ref;
  const visuallyHidden = {
    position: "fixed",
    top: 0,
    left: 0,
    width: 1,
    height: 1,
    margin: -1,
    border: 0,
    padding: 0,
    overflow: "hidden",
    clip: "rect(0 0 0 0)",
    clipPath: "inset(100%)",
    whiteSpace: "nowrap"
  };
  return React.createElement("div", {
    id,
    style: visuallyHidden,
    role: "status",
    "aria-live": ariaLiveType,
    "aria-atomic": true
  }, announcement);
}
function useAnnouncement() {
  const [announcement, setAnnouncement] = reactExports.useState("");
  const announce = reactExports.useCallback((value) => {
    if (value != null) {
      setAnnouncement(value);
    }
  }, []);
  return {
    announce,
    announcement
  };
}
const DndMonitorContext = /* @__PURE__ */ reactExports.createContext(null);
function useDndMonitor(listener) {
  const registerListener = reactExports.useContext(DndMonitorContext);
  reactExports.useEffect(() => {
    if (!registerListener) {
      throw new Error("useDndMonitor must be used within a children of <DndContext>");
    }
    const unsubscribe = registerListener(listener);
    return unsubscribe;
  }, [listener, registerListener]);
}
function useDndMonitorProvider() {
  const [listeners] = reactExports.useState(() => /* @__PURE__ */ new Set());
  const registerListener = reactExports.useCallback((listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, [listeners]);
  const dispatch = reactExports.useCallback((_ref) => {
    let {
      type,
      event
    } = _ref;
    listeners.forEach((listener) => {
      var _listener$type;
      return (_listener$type = listener[type]) == null ? void 0 : _listener$type.call(listener, event);
    });
  }, [listeners]);
  return [dispatch, registerListener];
}
const defaultScreenReaderInstructions = {
  draggable: "\n    To pick up a draggable item, press the space bar.\n    While dragging, use the arrow keys to move the item.\n    Press space again to drop the item in its new position, or press escape to cancel.\n  "
};
const defaultAnnouncements = {
  onDragStart(_ref) {
    let {
      active
    } = _ref;
    return "Picked up draggable item " + active.id + ".";
  },
  onDragOver(_ref2) {
    let {
      active,
      over
    } = _ref2;
    if (over) {
      return "Draggable item " + active.id + " was moved over droppable area " + over.id + ".";
    }
    return "Draggable item " + active.id + " is no longer over a droppable area.";
  },
  onDragEnd(_ref3) {
    let {
      active,
      over
    } = _ref3;
    if (over) {
      return "Draggable item " + active.id + " was dropped over droppable area " + over.id;
    }
    return "Draggable item " + active.id + " was dropped.";
  },
  onDragCancel(_ref4) {
    let {
      active
    } = _ref4;
    return "Dragging was cancelled. Draggable item " + active.id + " was dropped.";
  }
};
function Accessibility(_ref) {
  let {
    announcements = defaultAnnouncements,
    container,
    hiddenTextDescribedById,
    screenReaderInstructions = defaultScreenReaderInstructions
  } = _ref;
  const {
    announce,
    announcement
  } = useAnnouncement();
  const liveRegionId = useUniqueId("DndLiveRegion");
  const [mounted, setMounted] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setMounted(true);
  }, []);
  useDndMonitor(reactExports.useMemo(() => ({
    onDragStart(_ref2) {
      let {
        active
      } = _ref2;
      announce(announcements.onDragStart({
        active
      }));
    },
    onDragMove(_ref3) {
      let {
        active,
        over
      } = _ref3;
      if (announcements.onDragMove) {
        announce(announcements.onDragMove({
          active,
          over
        }));
      }
    },
    onDragOver(_ref4) {
      let {
        active,
        over
      } = _ref4;
      announce(announcements.onDragOver({
        active,
        over
      }));
    },
    onDragEnd(_ref5) {
      let {
        active,
        over
      } = _ref5;
      announce(announcements.onDragEnd({
        active,
        over
      }));
    },
    onDragCancel(_ref6) {
      let {
        active,
        over
      } = _ref6;
      announce(announcements.onDragCancel({
        active,
        over
      }));
    }
  }), [announce, announcements]));
  if (!mounted) {
    return null;
  }
  const markup = React.createElement(React.Fragment, null, React.createElement(HiddenText, {
    id: hiddenTextDescribedById,
    value: screenReaderInstructions.draggable
  }), React.createElement(LiveRegion, {
    id: liveRegionId,
    announcement
  }));
  return container ? reactDomExports.createPortal(markup, container) : markup;
}
var Action;
(function(Action2) {
  Action2["DragStart"] = "dragStart";
  Action2["DragMove"] = "dragMove";
  Action2["DragEnd"] = "dragEnd";
  Action2["DragCancel"] = "dragCancel";
  Action2["DragOver"] = "dragOver";
  Action2["RegisterDroppable"] = "registerDroppable";
  Action2["SetDroppableDisabled"] = "setDroppableDisabled";
  Action2["UnregisterDroppable"] = "unregisterDroppable";
})(Action || (Action = {}));
function noop() {
}
function useSensor(sensor, options) {
  return reactExports.useMemo(
    () => ({
      sensor,
      options: options != null ? options : {}
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sensor, options]
  );
}
function useSensors() {
  for (var _len = arguments.length, sensors = new Array(_len), _key = 0; _key < _len; _key++) {
    sensors[_key] = arguments[_key];
  }
  return reactExports.useMemo(
    () => [...sensors].filter((sensor) => sensor != null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...sensors]
  );
}
const defaultCoordinates = /* @__PURE__ */ Object.freeze({
  x: 0,
  y: 0
});
function getRelativeTransformOrigin(event, rect) {
  const eventCoordinates = getEventCoordinates(event);
  if (!eventCoordinates) {
    return "0 0";
  }
  const transformOrigin = {
    x: (eventCoordinates.x - rect.left) / rect.width * 100,
    y: (eventCoordinates.y - rect.top) / rect.height * 100
  };
  return transformOrigin.x + "% " + transformOrigin.y + "%";
}
function sortCollisionsDesc(_ref3, _ref4) {
  let {
    data: {
      value: a
    }
  } = _ref3;
  let {
    data: {
      value: b
    }
  } = _ref4;
  return b - a;
}
function getFirstCollision(collisions, property) {
  if (!collisions || collisions.length === 0) {
    return null;
  }
  const [firstCollision] = collisions;
  return firstCollision[property];
}
function getIntersectionRatio(entry, target) {
  const top = Math.max(target.top, entry.top);
  const left = Math.max(target.left, entry.left);
  const right = Math.min(target.left + target.width, entry.left + entry.width);
  const bottom = Math.min(target.top + target.height, entry.top + entry.height);
  const width = right - left;
  const height = bottom - top;
  if (left < right && top < bottom) {
    const targetArea = target.width * target.height;
    const entryArea = entry.width * entry.height;
    const intersectionArea = width * height;
    const intersectionRatio = intersectionArea / (targetArea + entryArea - intersectionArea);
    return Number(intersectionRatio.toFixed(4));
  }
  return 0;
}
const rectIntersection = (_ref) => {
  let {
    collisionRect,
    droppableRects,
    droppableContainers
  } = _ref;
  const collisions = [];
  for (const droppableContainer of droppableContainers) {
    const {
      id
    } = droppableContainer;
    const rect = droppableRects.get(id);
    if (rect) {
      const intersectionRatio = getIntersectionRatio(rect, collisionRect);
      if (intersectionRatio > 0) {
        collisions.push({
          id,
          data: {
            droppableContainer,
            value: intersectionRatio
          }
        });
      }
    }
  }
  return collisions.sort(sortCollisionsDesc);
};
function adjustScale(transform, rect1, rect2) {
  return {
    ...transform,
    scaleX: rect1 && rect2 ? rect1.width / rect2.width : 1,
    scaleY: rect1 && rect2 ? rect1.height / rect2.height : 1
  };
}
function getRectDelta(rect1, rect2) {
  return rect1 && rect2 ? {
    x: rect1.left - rect2.left,
    y: rect1.top - rect2.top
  } : defaultCoordinates;
}
function createRectAdjustmentFn(modifier) {
  return function adjustClientRect(rect) {
    for (var _len = arguments.length, adjustments = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      adjustments[_key - 1] = arguments[_key];
    }
    return adjustments.reduce((acc, adjustment) => ({
      ...acc,
      top: acc.top + modifier * adjustment.y,
      bottom: acc.bottom + modifier * adjustment.y,
      left: acc.left + modifier * adjustment.x,
      right: acc.right + modifier * adjustment.x
    }), {
      ...rect
    });
  };
}
const getAdjustedRect = /* @__PURE__ */ createRectAdjustmentFn(1);
function parseTransform(transform) {
  if (transform.startsWith("matrix3d(")) {
    const transformArray = transform.slice(9, -1).split(/, /);
    return {
      x: +transformArray[12],
      y: +transformArray[13],
      scaleX: +transformArray[0],
      scaleY: +transformArray[5]
    };
  } else if (transform.startsWith("matrix(")) {
    const transformArray = transform.slice(7, -1).split(/, /);
    return {
      x: +transformArray[4],
      y: +transformArray[5],
      scaleX: +transformArray[0],
      scaleY: +transformArray[3]
    };
  }
  return null;
}
function inverseTransform(rect, transform, transformOrigin) {
  const parsedTransform = parseTransform(transform);
  if (!parsedTransform) {
    return rect;
  }
  const {
    scaleX,
    scaleY,
    x: translateX,
    y: translateY
  } = parsedTransform;
  const x = rect.left - translateX - (1 - scaleX) * parseFloat(transformOrigin);
  const y = rect.top - translateY - (1 - scaleY) * parseFloat(transformOrigin.slice(transformOrigin.indexOf(" ") + 1));
  const w = scaleX ? rect.width / scaleX : rect.width;
  const h = scaleY ? rect.height / scaleY : rect.height;
  return {
    width: w,
    height: h,
    top: y,
    right: x + w,
    bottom: y + h,
    left: x
  };
}
const defaultOptions = {
  ignoreTransform: false
};
function getClientRect(element, options) {
  if (options === void 0) {
    options = defaultOptions;
  }
  let rect = element.getBoundingClientRect();
  if (options.ignoreTransform) {
    const {
      transform,
      transformOrigin
    } = getWindow(element).getComputedStyle(element);
    if (transform) {
      rect = inverseTransform(rect, transform, transformOrigin);
    }
  }
  const {
    top,
    left,
    width,
    height,
    bottom,
    right
  } = rect;
  return {
    top,
    left,
    width,
    height,
    bottom,
    right
  };
}
function getTransformAgnosticClientRect(element) {
  return getClientRect(element, {
    ignoreTransform: true
  });
}
function getWindowClientRect(element) {
  const width = element.innerWidth;
  const height = element.innerHeight;
  return {
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    width,
    height
  };
}
function isFixed(node, computedStyle) {
  if (computedStyle === void 0) {
    computedStyle = getWindow(node).getComputedStyle(node);
  }
  return computedStyle.position === "fixed";
}
function isScrollable(element, computedStyle) {
  if (computedStyle === void 0) {
    computedStyle = getWindow(element).getComputedStyle(element);
  }
  const overflowRegex = /(auto|scroll|overlay)/;
  const properties2 = ["overflow", "overflowX", "overflowY"];
  return properties2.some((property) => {
    const value = computedStyle[property];
    return typeof value === "string" ? overflowRegex.test(value) : false;
  });
}
function getScrollableAncestors(element, limit) {
  const scrollParents = [];
  function findScrollableAncestors(node) {
    if (limit != null && scrollParents.length >= limit) {
      return scrollParents;
    }
    if (!node) {
      return scrollParents;
    }
    if (isDocument(node) && node.scrollingElement != null && !scrollParents.includes(node.scrollingElement)) {
      scrollParents.push(node.scrollingElement);
      return scrollParents;
    }
    if (!isHTMLElement(node) || isSVGElement(node)) {
      return scrollParents;
    }
    if (scrollParents.includes(node)) {
      return scrollParents;
    }
    const computedStyle = getWindow(element).getComputedStyle(node);
    if (node !== element) {
      if (isScrollable(node, computedStyle)) {
        scrollParents.push(node);
      }
    }
    if (isFixed(node, computedStyle)) {
      return scrollParents;
    }
    return findScrollableAncestors(node.parentNode);
  }
  if (!element) {
    return scrollParents;
  }
  return findScrollableAncestors(element);
}
function getFirstScrollableAncestor(node) {
  const [firstScrollableAncestor] = getScrollableAncestors(node, 1);
  return firstScrollableAncestor != null ? firstScrollableAncestor : null;
}
function getScrollableElement(element) {
  if (!canUseDOM || !element) {
    return null;
  }
  if (isWindow(element)) {
    return element;
  }
  if (!isNode(element)) {
    return null;
  }
  if (isDocument(element) || element === getOwnerDocument(element).scrollingElement) {
    return window;
  }
  if (isHTMLElement(element)) {
    return element;
  }
  return null;
}
function getScrollXCoordinate(element) {
  if (isWindow(element)) {
    return element.scrollX;
  }
  return element.scrollLeft;
}
function getScrollYCoordinate(element) {
  if (isWindow(element)) {
    return element.scrollY;
  }
  return element.scrollTop;
}
function getScrollCoordinates(element) {
  return {
    x: getScrollXCoordinate(element),
    y: getScrollYCoordinate(element)
  };
}
var Direction;
(function(Direction2) {
  Direction2[Direction2["Forward"] = 1] = "Forward";
  Direction2[Direction2["Backward"] = -1] = "Backward";
})(Direction || (Direction = {}));
function isDocumentScrollingElement(element) {
  if (!canUseDOM || !element) {
    return false;
  }
  return element === document.scrollingElement;
}
function getScrollPosition(scrollingContainer) {
  const minScroll = {
    x: 0,
    y: 0
  };
  const dimensions = isDocumentScrollingElement(scrollingContainer) ? {
    height: window.innerHeight,
    width: window.innerWidth
  } : {
    height: scrollingContainer.clientHeight,
    width: scrollingContainer.clientWidth
  };
  const maxScroll = {
    x: scrollingContainer.scrollWidth - dimensions.width,
    y: scrollingContainer.scrollHeight - dimensions.height
  };
  const isTop = scrollingContainer.scrollTop <= minScroll.y;
  const isLeft = scrollingContainer.scrollLeft <= minScroll.x;
  const isBottom = scrollingContainer.scrollTop >= maxScroll.y;
  const isRight = scrollingContainer.scrollLeft >= maxScroll.x;
  return {
    isTop,
    isLeft,
    isBottom,
    isRight,
    maxScroll,
    minScroll
  };
}
const defaultThreshold = {
  x: 0.2,
  y: 0.2
};
function getScrollDirectionAndSpeed(scrollContainer, scrollContainerRect, _ref, acceleration, thresholdPercentage) {
  let {
    top,
    left,
    right,
    bottom
  } = _ref;
  if (acceleration === void 0) {
    acceleration = 10;
  }
  if (thresholdPercentage === void 0) {
    thresholdPercentage = defaultThreshold;
  }
  const {
    isTop,
    isBottom,
    isLeft,
    isRight
  } = getScrollPosition(scrollContainer);
  const direction = {
    x: 0,
    y: 0
  };
  const speed = {
    x: 0,
    y: 0
  };
  const threshold = {
    height: scrollContainerRect.height * thresholdPercentage.y,
    width: scrollContainerRect.width * thresholdPercentage.x
  };
  if (!isTop && top <= scrollContainerRect.top + threshold.height) {
    direction.y = Direction.Backward;
    speed.y = acceleration * Math.abs((scrollContainerRect.top + threshold.height - top) / threshold.height);
  } else if (!isBottom && bottom >= scrollContainerRect.bottom - threshold.height) {
    direction.y = Direction.Forward;
    speed.y = acceleration * Math.abs((scrollContainerRect.bottom - threshold.height - bottom) / threshold.height);
  }
  if (!isRight && right >= scrollContainerRect.right - threshold.width) {
    direction.x = Direction.Forward;
    speed.x = acceleration * Math.abs((scrollContainerRect.right - threshold.width - right) / threshold.width);
  } else if (!isLeft && left <= scrollContainerRect.left + threshold.width) {
    direction.x = Direction.Backward;
    speed.x = acceleration * Math.abs((scrollContainerRect.left + threshold.width - left) / threshold.width);
  }
  return {
    direction,
    speed
  };
}
function getScrollElementRect(element) {
  if (element === document.scrollingElement) {
    const {
      innerWidth,
      innerHeight
    } = window;
    return {
      top: 0,
      left: 0,
      right: innerWidth,
      bottom: innerHeight,
      width: innerWidth,
      height: innerHeight
    };
  }
  const {
    top,
    left,
    right,
    bottom
  } = element.getBoundingClientRect();
  return {
    top,
    left,
    right,
    bottom,
    width: element.clientWidth,
    height: element.clientHeight
  };
}
function getScrollOffsets(scrollableAncestors) {
  return scrollableAncestors.reduce((acc, node) => {
    return add(acc, getScrollCoordinates(node));
  }, defaultCoordinates);
}
function getScrollXOffset(scrollableAncestors) {
  return scrollableAncestors.reduce((acc, node) => {
    return acc + getScrollXCoordinate(node);
  }, 0);
}
function getScrollYOffset(scrollableAncestors) {
  return scrollableAncestors.reduce((acc, node) => {
    return acc + getScrollYCoordinate(node);
  }, 0);
}
function scrollIntoViewIfNeeded(element, measure) {
  if (measure === void 0) {
    measure = getClientRect;
  }
  if (!element) {
    return;
  }
  const {
    top,
    left,
    bottom,
    right
  } = measure(element);
  const firstScrollableAncestor = getFirstScrollableAncestor(element);
  if (!firstScrollableAncestor) {
    return;
  }
  if (bottom <= 0 || right <= 0 || top >= window.innerHeight || left >= window.innerWidth) {
    element.scrollIntoView({
      block: "center",
      inline: "center"
    });
  }
}
const properties = [["x", ["left", "right"], getScrollXOffset], ["y", ["top", "bottom"], getScrollYOffset]];
class Rect {
  constructor(rect, element) {
    this.rect = void 0;
    this.width = void 0;
    this.height = void 0;
    this.top = void 0;
    this.bottom = void 0;
    this.right = void 0;
    this.left = void 0;
    const scrollableAncestors = getScrollableAncestors(element);
    const scrollOffsets = getScrollOffsets(scrollableAncestors);
    this.rect = {
      ...rect
    };
    this.width = rect.width;
    this.height = rect.height;
    for (const [axis, keys, getScrollOffset] of properties) {
      for (const key2 of keys) {
        Object.defineProperty(this, key2, {
          get: () => {
            const currentOffsets = getScrollOffset(scrollableAncestors);
            const scrollOffsetsDeltla = scrollOffsets[axis] - currentOffsets;
            return this.rect[key2] + scrollOffsetsDeltla;
          },
          enumerable: true
        });
      }
    }
    Object.defineProperty(this, "rect", {
      enumerable: false
    });
  }
}
class Listeners {
  constructor(target) {
    this.target = void 0;
    this.listeners = [];
    this.removeAll = () => {
      this.listeners.forEach((listener) => {
        var _this$target;
        return (_this$target = this.target) == null ? void 0 : _this$target.removeEventListener(...listener);
      });
    };
    this.target = target;
  }
  add(eventName, handler, options) {
    var _this$target2;
    (_this$target2 = this.target) == null ? void 0 : _this$target2.addEventListener(eventName, handler, options);
    this.listeners.push([eventName, handler, options]);
  }
}
function getEventListenerTarget(target) {
  const {
    EventTarget
  } = getWindow(target);
  return target instanceof EventTarget ? target : getOwnerDocument(target);
}
function hasExceededDistance(delta, measurement) {
  const dx = Math.abs(delta.x);
  const dy = Math.abs(delta.y);
  if (typeof measurement === "number") {
    return Math.sqrt(dx ** 2 + dy ** 2) > measurement;
  }
  if ("x" in measurement && "y" in measurement) {
    return dx > measurement.x && dy > measurement.y;
  }
  if ("x" in measurement) {
    return dx > measurement.x;
  }
  if ("y" in measurement) {
    return dy > measurement.y;
  }
  return false;
}
var EventName;
(function(EventName2) {
  EventName2["Click"] = "click";
  EventName2["DragStart"] = "dragstart";
  EventName2["Keydown"] = "keydown";
  EventName2["ContextMenu"] = "contextmenu";
  EventName2["Resize"] = "resize";
  EventName2["SelectionChange"] = "selectionchange";
  EventName2["VisibilityChange"] = "visibilitychange";
})(EventName || (EventName = {}));
function preventDefault(event) {
  event.preventDefault();
}
function stopPropagation(event) {
  event.stopPropagation();
}
var KeyboardCode;
(function(KeyboardCode2) {
  KeyboardCode2["Space"] = "Space";
  KeyboardCode2["Down"] = "ArrowDown";
  KeyboardCode2["Right"] = "ArrowRight";
  KeyboardCode2["Left"] = "ArrowLeft";
  KeyboardCode2["Up"] = "ArrowUp";
  KeyboardCode2["Esc"] = "Escape";
  KeyboardCode2["Enter"] = "Enter";
  KeyboardCode2["Tab"] = "Tab";
})(KeyboardCode || (KeyboardCode = {}));
const defaultKeyboardCodes = {
  start: [KeyboardCode.Space, KeyboardCode.Enter],
  cancel: [KeyboardCode.Esc],
  end: [KeyboardCode.Space, KeyboardCode.Enter, KeyboardCode.Tab]
};
const defaultKeyboardCoordinateGetter = (event, _ref) => {
  let {
    currentCoordinates
  } = _ref;
  switch (event.code) {
    case KeyboardCode.Right:
      return {
        ...currentCoordinates,
        x: currentCoordinates.x + 25
      };
    case KeyboardCode.Left:
      return {
        ...currentCoordinates,
        x: currentCoordinates.x - 25
      };
    case KeyboardCode.Down:
      return {
        ...currentCoordinates,
        y: currentCoordinates.y + 25
      };
    case KeyboardCode.Up:
      return {
        ...currentCoordinates,
        y: currentCoordinates.y - 25
      };
  }
  return void 0;
};
class KeyboardSensor {
  constructor(props) {
    this.props = void 0;
    this.autoScrollEnabled = false;
    this.referenceCoordinates = void 0;
    this.listeners = void 0;
    this.windowListeners = void 0;
    this.props = props;
    const {
      event: {
        target
      }
    } = props;
    this.props = props;
    this.listeners = new Listeners(getOwnerDocument(target));
    this.windowListeners = new Listeners(getWindow(target));
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.attach();
  }
  attach() {
    this.handleStart();
    this.windowListeners.add(EventName.Resize, this.handleCancel);
    this.windowListeners.add(EventName.VisibilityChange, this.handleCancel);
    setTimeout(() => this.listeners.add(EventName.Keydown, this.handleKeyDown));
  }
  handleStart() {
    const {
      activeNode,
      onStart
    } = this.props;
    const node = activeNode.node.current;
    if (node) {
      scrollIntoViewIfNeeded(node);
    }
    onStart(defaultCoordinates);
  }
  handleKeyDown(event) {
    if (isKeyboardEvent(event)) {
      const {
        active,
        context,
        options
      } = this.props;
      const {
        keyboardCodes = defaultKeyboardCodes,
        coordinateGetter = defaultKeyboardCoordinateGetter,
        scrollBehavior = "smooth"
      } = options;
      const {
        code
      } = event;
      if (keyboardCodes.end.includes(code)) {
        this.handleEnd(event);
        return;
      }
      if (keyboardCodes.cancel.includes(code)) {
        this.handleCancel(event);
        return;
      }
      const {
        collisionRect
      } = context.current;
      const currentCoordinates = collisionRect ? {
        x: collisionRect.left,
        y: collisionRect.top
      } : defaultCoordinates;
      if (!this.referenceCoordinates) {
        this.referenceCoordinates = currentCoordinates;
      }
      const newCoordinates = coordinateGetter(event, {
        active,
        context: context.current,
        currentCoordinates
      });
      if (newCoordinates) {
        const coordinatesDelta = subtract(newCoordinates, currentCoordinates);
        const scrollDelta = {
          x: 0,
          y: 0
        };
        const {
          scrollableAncestors
        } = context.current;
        for (const scrollContainer of scrollableAncestors) {
          const direction = event.code;
          const {
            isTop,
            isRight,
            isLeft,
            isBottom,
            maxScroll,
            minScroll
          } = getScrollPosition(scrollContainer);
          const scrollElementRect = getScrollElementRect(scrollContainer);
          const clampedCoordinates = {
            x: Math.min(direction === KeyboardCode.Right ? scrollElementRect.right - scrollElementRect.width / 2 : scrollElementRect.right, Math.max(direction === KeyboardCode.Right ? scrollElementRect.left : scrollElementRect.left + scrollElementRect.width / 2, newCoordinates.x)),
            y: Math.min(direction === KeyboardCode.Down ? scrollElementRect.bottom - scrollElementRect.height / 2 : scrollElementRect.bottom, Math.max(direction === KeyboardCode.Down ? scrollElementRect.top : scrollElementRect.top + scrollElementRect.height / 2, newCoordinates.y))
          };
          const canScrollX = direction === KeyboardCode.Right && !isRight || direction === KeyboardCode.Left && !isLeft;
          const canScrollY = direction === KeyboardCode.Down && !isBottom || direction === KeyboardCode.Up && !isTop;
          if (canScrollX && clampedCoordinates.x !== newCoordinates.x) {
            const newScrollCoordinates = scrollContainer.scrollLeft + coordinatesDelta.x;
            const canScrollToNewCoordinates = direction === KeyboardCode.Right && newScrollCoordinates <= maxScroll.x || direction === KeyboardCode.Left && newScrollCoordinates >= minScroll.x;
            if (canScrollToNewCoordinates && !coordinatesDelta.y) {
              scrollContainer.scrollTo({
                left: newScrollCoordinates,
                behavior: scrollBehavior
              });
              return;
            }
            if (canScrollToNewCoordinates) {
              scrollDelta.x = scrollContainer.scrollLeft - newScrollCoordinates;
            } else {
              scrollDelta.x = direction === KeyboardCode.Right ? scrollContainer.scrollLeft - maxScroll.x : scrollContainer.scrollLeft - minScroll.x;
            }
            if (scrollDelta.x) {
              scrollContainer.scrollBy({
                left: -scrollDelta.x,
                behavior: scrollBehavior
              });
            }
            break;
          } else if (canScrollY && clampedCoordinates.y !== newCoordinates.y) {
            const newScrollCoordinates = scrollContainer.scrollTop + coordinatesDelta.y;
            const canScrollToNewCoordinates = direction === KeyboardCode.Down && newScrollCoordinates <= maxScroll.y || direction === KeyboardCode.Up && newScrollCoordinates >= minScroll.y;
            if (canScrollToNewCoordinates && !coordinatesDelta.x) {
              scrollContainer.scrollTo({
                top: newScrollCoordinates,
                behavior: scrollBehavior
              });
              return;
            }
            if (canScrollToNewCoordinates) {
              scrollDelta.y = scrollContainer.scrollTop - newScrollCoordinates;
            } else {
              scrollDelta.y = direction === KeyboardCode.Down ? scrollContainer.scrollTop - maxScroll.y : scrollContainer.scrollTop - minScroll.y;
            }
            if (scrollDelta.y) {
              scrollContainer.scrollBy({
                top: -scrollDelta.y,
                behavior: scrollBehavior
              });
            }
            break;
          }
        }
        this.handleMove(event, add(subtract(newCoordinates, this.referenceCoordinates), scrollDelta));
      }
    }
  }
  handleMove(event, coordinates) {
    const {
      onMove
    } = this.props;
    event.preventDefault();
    onMove(coordinates);
  }
  handleEnd(event) {
    const {
      onEnd
    } = this.props;
    event.preventDefault();
    this.detach();
    onEnd();
  }
  handleCancel(event) {
    const {
      onCancel
    } = this.props;
    event.preventDefault();
    this.detach();
    onCancel();
  }
  detach() {
    this.listeners.removeAll();
    this.windowListeners.removeAll();
  }
}
KeyboardSensor.activators = [{
  eventName: "onKeyDown",
  handler: (event, _ref, _ref2) => {
    let {
      keyboardCodes = defaultKeyboardCodes,
      onActivation
    } = _ref;
    let {
      active
    } = _ref2;
    const {
      code
    } = event.nativeEvent;
    if (keyboardCodes.start.includes(code)) {
      const activator = active.activatorNode.current;
      if (activator && event.target !== activator) {
        return false;
      }
      event.preventDefault();
      onActivation == null ? void 0 : onActivation({
        event: event.nativeEvent
      });
      return true;
    }
    return false;
  }
}];
function isDistanceConstraint(constraint) {
  return Boolean(constraint && "distance" in constraint);
}
function isDelayConstraint(constraint) {
  return Boolean(constraint && "delay" in constraint);
}
class AbstractPointerSensor {
  constructor(props, events2, listenerTarget) {
    var _getEventCoordinates;
    if (listenerTarget === void 0) {
      listenerTarget = getEventListenerTarget(props.event.target);
    }
    this.props = void 0;
    this.events = void 0;
    this.autoScrollEnabled = true;
    this.document = void 0;
    this.activated = false;
    this.initialCoordinates = void 0;
    this.timeoutId = null;
    this.listeners = void 0;
    this.documentListeners = void 0;
    this.windowListeners = void 0;
    this.props = props;
    this.events = events2;
    const {
      event
    } = props;
    const {
      target
    } = event;
    this.props = props;
    this.events = events2;
    this.document = getOwnerDocument(target);
    this.documentListeners = new Listeners(this.document);
    this.listeners = new Listeners(listenerTarget);
    this.windowListeners = new Listeners(getWindow(target));
    this.initialCoordinates = (_getEventCoordinates = getEventCoordinates(event)) != null ? _getEventCoordinates : defaultCoordinates;
    this.handleStart = this.handleStart.bind(this);
    this.handleMove = this.handleMove.bind(this);
    this.handleEnd = this.handleEnd.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.removeTextSelection = this.removeTextSelection.bind(this);
    this.attach();
  }
  attach() {
    const {
      events: events2,
      props: {
        options: {
          activationConstraint,
          bypassActivationConstraint
        }
      }
    } = this;
    this.listeners.add(events2.move.name, this.handleMove, {
      passive: false
    });
    this.listeners.add(events2.end.name, this.handleEnd);
    if (events2.cancel) {
      this.listeners.add(events2.cancel.name, this.handleCancel);
    }
    this.windowListeners.add(EventName.Resize, this.handleCancel);
    this.windowListeners.add(EventName.DragStart, preventDefault);
    this.windowListeners.add(EventName.VisibilityChange, this.handleCancel);
    this.windowListeners.add(EventName.ContextMenu, preventDefault);
    this.documentListeners.add(EventName.Keydown, this.handleKeydown);
    if (activationConstraint) {
      if (bypassActivationConstraint != null && bypassActivationConstraint({
        event: this.props.event,
        activeNode: this.props.activeNode,
        options: this.props.options
      })) {
        return this.handleStart();
      }
      if (isDelayConstraint(activationConstraint)) {
        this.timeoutId = setTimeout(this.handleStart, activationConstraint.delay);
        this.handlePending(activationConstraint);
        return;
      }
      if (isDistanceConstraint(activationConstraint)) {
        this.handlePending(activationConstraint);
        return;
      }
    }
    this.handleStart();
  }
  detach() {
    this.listeners.removeAll();
    this.windowListeners.removeAll();
    setTimeout(this.documentListeners.removeAll, 50);
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
  handlePending(constraint, offset) {
    const {
      active,
      onPending
    } = this.props;
    onPending(active, constraint, this.initialCoordinates, offset);
  }
  handleStart() {
    const {
      initialCoordinates
    } = this;
    const {
      onStart
    } = this.props;
    if (initialCoordinates) {
      this.activated = true;
      this.documentListeners.add(EventName.Click, stopPropagation, {
        capture: true
      });
      this.removeTextSelection();
      this.documentListeners.add(EventName.SelectionChange, this.removeTextSelection);
      onStart(initialCoordinates);
    }
  }
  handleMove(event) {
    var _getEventCoordinates2;
    const {
      activated,
      initialCoordinates,
      props
    } = this;
    const {
      onMove,
      options: {
        activationConstraint
      }
    } = props;
    if (!initialCoordinates) {
      return;
    }
    const coordinates = (_getEventCoordinates2 = getEventCoordinates(event)) != null ? _getEventCoordinates2 : defaultCoordinates;
    const delta = subtract(initialCoordinates, coordinates);
    if (!activated && activationConstraint) {
      if (isDistanceConstraint(activationConstraint)) {
        if (activationConstraint.tolerance != null && hasExceededDistance(delta, activationConstraint.tolerance)) {
          return this.handleCancel();
        }
        if (hasExceededDistance(delta, activationConstraint.distance)) {
          return this.handleStart();
        }
      }
      if (isDelayConstraint(activationConstraint)) {
        if (hasExceededDistance(delta, activationConstraint.tolerance)) {
          return this.handleCancel();
        }
      }
      this.handlePending(activationConstraint, delta);
      return;
    }
    if (event.cancelable) {
      event.preventDefault();
    }
    onMove(coordinates);
  }
  handleEnd() {
    const {
      onAbort,
      onEnd
    } = this.props;
    this.detach();
    if (!this.activated) {
      onAbort(this.props.active);
    }
    onEnd();
  }
  handleCancel() {
    const {
      onAbort,
      onCancel
    } = this.props;
    this.detach();
    if (!this.activated) {
      onAbort(this.props.active);
    }
    onCancel();
  }
  handleKeydown(event) {
    if (event.code === KeyboardCode.Esc) {
      this.handleCancel();
    }
  }
  removeTextSelection() {
    var _this$document$getSel;
    (_this$document$getSel = this.document.getSelection()) == null ? void 0 : _this$document$getSel.removeAllRanges();
  }
}
const events = {
  cancel: {
    name: "pointercancel"
  },
  move: {
    name: "pointermove"
  },
  end: {
    name: "pointerup"
  }
};
class PointerSensor extends AbstractPointerSensor {
  constructor(props) {
    const {
      event
    } = props;
    const listenerTarget = getOwnerDocument(event.target);
    super(props, events, listenerTarget);
  }
}
PointerSensor.activators = [{
  eventName: "onPointerDown",
  handler: (_ref, _ref2) => {
    let {
      nativeEvent: event
    } = _ref;
    let {
      onActivation
    } = _ref2;
    if (!event.isPrimary || event.button !== 0) {
      return false;
    }
    onActivation == null ? void 0 : onActivation({
      event
    });
    return true;
  }
}];
const events$1 = {
  move: {
    name: "mousemove"
  },
  end: {
    name: "mouseup"
  }
};
var MouseButton;
(function(MouseButton2) {
  MouseButton2[MouseButton2["RightClick"] = 2] = "RightClick";
})(MouseButton || (MouseButton = {}));
class MouseSensor extends AbstractPointerSensor {
  constructor(props) {
    super(props, events$1, getOwnerDocument(props.event.target));
  }
}
MouseSensor.activators = [{
  eventName: "onMouseDown",
  handler: (_ref, _ref2) => {
    let {
      nativeEvent: event
    } = _ref;
    let {
      onActivation
    } = _ref2;
    if (event.button === MouseButton.RightClick) {
      return false;
    }
    onActivation == null ? void 0 : onActivation({
      event
    });
    return true;
  }
}];
const events$2 = {
  cancel: {
    name: "touchcancel"
  },
  move: {
    name: "touchmove"
  },
  end: {
    name: "touchend"
  }
};
class TouchSensor extends AbstractPointerSensor {
  constructor(props) {
    super(props, events$2);
  }
  static setup() {
    window.addEventListener(events$2.move.name, noop2, {
      capture: false,
      passive: false
    });
    return function teardown() {
      window.removeEventListener(events$2.move.name, noop2);
    };
    function noop2() {
    }
  }
}
TouchSensor.activators = [{
  eventName: "onTouchStart",
  handler: (_ref, _ref2) => {
    let {
      nativeEvent: event
    } = _ref;
    let {
      onActivation
    } = _ref2;
    const {
      touches
    } = event;
    if (touches.length > 1) {
      return false;
    }
    onActivation == null ? void 0 : onActivation({
      event
    });
    return true;
  }
}];
var AutoScrollActivator;
(function(AutoScrollActivator2) {
  AutoScrollActivator2[AutoScrollActivator2["Pointer"] = 0] = "Pointer";
  AutoScrollActivator2[AutoScrollActivator2["DraggableRect"] = 1] = "DraggableRect";
})(AutoScrollActivator || (AutoScrollActivator = {}));
var TraversalOrder;
(function(TraversalOrder2) {
  TraversalOrder2[TraversalOrder2["TreeOrder"] = 0] = "TreeOrder";
  TraversalOrder2[TraversalOrder2["ReversedTreeOrder"] = 1] = "ReversedTreeOrder";
})(TraversalOrder || (TraversalOrder = {}));
function useAutoScroller(_ref) {
  let {
    acceleration,
    activator = AutoScrollActivator.Pointer,
    canScroll,
    draggingRect,
    enabled,
    interval = 5,
    order = TraversalOrder.TreeOrder,
    pointerCoordinates,
    scrollableAncestors,
    scrollableAncestorRects,
    delta,
    threshold
  } = _ref;
  const scrollIntent = useScrollIntent({
    delta,
    disabled: !enabled
  });
  const [setAutoScrollInterval, clearAutoScrollInterval] = useInterval();
  const scrollSpeed = reactExports.useRef({
    x: 0,
    y: 0
  });
  const scrollDirection = reactExports.useRef({
    x: 0,
    y: 0
  });
  const rect = reactExports.useMemo(() => {
    switch (activator) {
      case AutoScrollActivator.Pointer:
        return pointerCoordinates ? {
          top: pointerCoordinates.y,
          bottom: pointerCoordinates.y,
          left: pointerCoordinates.x,
          right: pointerCoordinates.x
        } : null;
      case AutoScrollActivator.DraggableRect:
        return draggingRect;
    }
  }, [activator, draggingRect, pointerCoordinates]);
  const scrollContainerRef = reactExports.useRef(null);
  const autoScroll = reactExports.useCallback(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) {
      return;
    }
    const scrollLeft = scrollSpeed.current.x * scrollDirection.current.x;
    const scrollTop = scrollSpeed.current.y * scrollDirection.current.y;
    scrollContainer.scrollBy(scrollLeft, scrollTop);
  }, []);
  const sortedScrollableAncestors = reactExports.useMemo(() => order === TraversalOrder.TreeOrder ? [...scrollableAncestors].reverse() : scrollableAncestors, [order, scrollableAncestors]);
  reactExports.useEffect(
    () => {
      if (!enabled || !scrollableAncestors.length || !rect) {
        clearAutoScrollInterval();
        return;
      }
      for (const scrollContainer of sortedScrollableAncestors) {
        if ((canScroll == null ? void 0 : canScroll(scrollContainer)) === false) {
          continue;
        }
        const index = scrollableAncestors.indexOf(scrollContainer);
        const scrollContainerRect = scrollableAncestorRects[index];
        if (!scrollContainerRect) {
          continue;
        }
        const {
          direction,
          speed
        } = getScrollDirectionAndSpeed(scrollContainer, scrollContainerRect, rect, acceleration, threshold);
        for (const axis of ["x", "y"]) {
          if (!scrollIntent[axis][direction[axis]]) {
            speed[axis] = 0;
            direction[axis] = 0;
          }
        }
        if (speed.x > 0 || speed.y > 0) {
          clearAutoScrollInterval();
          scrollContainerRef.current = scrollContainer;
          setAutoScrollInterval(autoScroll, interval);
          scrollSpeed.current = speed;
          scrollDirection.current = direction;
          return;
        }
      }
      scrollSpeed.current = {
        x: 0,
        y: 0
      };
      scrollDirection.current = {
        x: 0,
        y: 0
      };
      clearAutoScrollInterval();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      acceleration,
      autoScroll,
      canScroll,
      clearAutoScrollInterval,
      enabled,
      interval,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      JSON.stringify(rect),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      JSON.stringify(scrollIntent),
      setAutoScrollInterval,
      scrollableAncestors,
      sortedScrollableAncestors,
      scrollableAncestorRects,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      JSON.stringify(threshold)
    ]
  );
}
const defaultScrollIntent = {
  x: {
    [Direction.Backward]: false,
    [Direction.Forward]: false
  },
  y: {
    [Direction.Backward]: false,
    [Direction.Forward]: false
  }
};
function useScrollIntent(_ref2) {
  let {
    delta,
    disabled
  } = _ref2;
  const previousDelta = usePrevious(delta);
  return useLazyMemo((previousIntent) => {
    if (disabled || !previousDelta || !previousIntent) {
      return defaultScrollIntent;
    }
    const direction = {
      x: Math.sign(delta.x - previousDelta.x),
      y: Math.sign(delta.y - previousDelta.y)
    };
    return {
      x: {
        [Direction.Backward]: previousIntent.x[Direction.Backward] || direction.x === -1,
        [Direction.Forward]: previousIntent.x[Direction.Forward] || direction.x === 1
      },
      y: {
        [Direction.Backward]: previousIntent.y[Direction.Backward] || direction.y === -1,
        [Direction.Forward]: previousIntent.y[Direction.Forward] || direction.y === 1
      }
    };
  }, [disabled, delta, previousDelta]);
}
function useCachedNode(draggableNodes, id) {
  const draggableNode = id != null ? draggableNodes.get(id) : void 0;
  const node = draggableNode ? draggableNode.node.current : null;
  return useLazyMemo((cachedNode) => {
    var _ref;
    if (id == null) {
      return null;
    }
    return (_ref = node != null ? node : cachedNode) != null ? _ref : null;
  }, [node, id]);
}
function useCombineActivators(sensors, getSyntheticHandler) {
  return reactExports.useMemo(() => sensors.reduce((accumulator, sensor) => {
    const {
      sensor: Sensor
    } = sensor;
    const sensorActivators = Sensor.activators.map((activator) => ({
      eventName: activator.eventName,
      handler: getSyntheticHandler(activator.handler, sensor)
    }));
    return [...accumulator, ...sensorActivators];
  }, []), [sensors, getSyntheticHandler]);
}
var MeasuringStrategy;
(function(MeasuringStrategy2) {
  MeasuringStrategy2[MeasuringStrategy2["Always"] = 0] = "Always";
  MeasuringStrategy2[MeasuringStrategy2["BeforeDragging"] = 1] = "BeforeDragging";
  MeasuringStrategy2[MeasuringStrategy2["WhileDragging"] = 2] = "WhileDragging";
})(MeasuringStrategy || (MeasuringStrategy = {}));
var MeasuringFrequency;
(function(MeasuringFrequency2) {
  MeasuringFrequency2["Optimized"] = "optimized";
})(MeasuringFrequency || (MeasuringFrequency = {}));
const defaultValue = /* @__PURE__ */ new Map();
function useDroppableMeasuring(containers, _ref) {
  let {
    dragging,
    dependencies,
    config
  } = _ref;
  const [queue, setQueue] = reactExports.useState(null);
  const {
    frequency,
    measure,
    strategy
  } = config;
  const containersRef = reactExports.useRef(containers);
  const disabled = isDisabled();
  const disabledRef = useLatestValue(disabled);
  const measureDroppableContainers = reactExports.useCallback(function(ids2) {
    if (ids2 === void 0) {
      ids2 = [];
    }
    if (disabledRef.current) {
      return;
    }
    setQueue((value) => {
      if (value === null) {
        return ids2;
      }
      return value.concat(ids2.filter((id) => !value.includes(id)));
    });
  }, [disabledRef]);
  const timeoutId = reactExports.useRef(null);
  const droppableRects = useLazyMemo((previousValue) => {
    if (disabled && !dragging) {
      return defaultValue;
    }
    if (!previousValue || previousValue === defaultValue || containersRef.current !== containers || queue != null) {
      const map = /* @__PURE__ */ new Map();
      for (let container of containers) {
        if (!container) {
          continue;
        }
        if (queue && queue.length > 0 && !queue.includes(container.id) && container.rect.current) {
          map.set(container.id, container.rect.current);
          continue;
        }
        const node = container.node.current;
        const rect = node ? new Rect(measure(node), node) : null;
        container.rect.current = rect;
        if (rect) {
          map.set(container.id, rect);
        }
      }
      return map;
    }
    return previousValue;
  }, [containers, queue, dragging, disabled, measure]);
  reactExports.useEffect(() => {
    containersRef.current = containers;
  }, [containers]);
  reactExports.useEffect(
    () => {
      if (disabled) {
        return;
      }
      measureDroppableContainers();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dragging, disabled]
  );
  reactExports.useEffect(
    () => {
      if (queue && queue.length > 0) {
        setQueue(null);
      }
    },
    //eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(queue)]
  );
  reactExports.useEffect(
    () => {
      if (disabled || typeof frequency !== "number" || timeoutId.current !== null) {
        return;
      }
      timeoutId.current = setTimeout(() => {
        measureDroppableContainers();
        timeoutId.current = null;
      }, frequency);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [frequency, disabled, measureDroppableContainers, ...dependencies]
  );
  return {
    droppableRects,
    measureDroppableContainers,
    measuringScheduled: queue != null
  };
  function isDisabled() {
    switch (strategy) {
      case MeasuringStrategy.Always:
        return false;
      case MeasuringStrategy.BeforeDragging:
        return dragging;
      default:
        return !dragging;
    }
  }
}
function useInitialValue(value, computeFn) {
  return useLazyMemo((previousValue) => {
    if (!value) {
      return null;
    }
    if (previousValue) {
      return previousValue;
    }
    return typeof computeFn === "function" ? computeFn(value) : value;
  }, [computeFn, value]);
}
function useInitialRect(node, measure) {
  return useInitialValue(node, measure);
}
function useMutationObserver(_ref) {
  let {
    callback,
    disabled
  } = _ref;
  const handleMutations = useEvent(callback);
  const mutationObserver = reactExports.useMemo(() => {
    if (disabled || typeof window === "undefined" || typeof window.MutationObserver === "undefined") {
      return void 0;
    }
    const {
      MutationObserver
    } = window;
    return new MutationObserver(handleMutations);
  }, [handleMutations, disabled]);
  reactExports.useEffect(() => {
    return () => mutationObserver == null ? void 0 : mutationObserver.disconnect();
  }, [mutationObserver]);
  return mutationObserver;
}
function useResizeObserver(_ref) {
  let {
    callback,
    disabled
  } = _ref;
  const handleResize = useEvent(callback);
  const resizeObserver = reactExports.useMemo(
    () => {
      if (disabled || typeof window === "undefined" || typeof window.ResizeObserver === "undefined") {
        return void 0;
      }
      const {
        ResizeObserver
      } = window;
      return new ResizeObserver(handleResize);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [disabled]
  );
  reactExports.useEffect(() => {
    return () => resizeObserver == null ? void 0 : resizeObserver.disconnect();
  }, [resizeObserver]);
  return resizeObserver;
}
function defaultMeasure(element) {
  return new Rect(getClientRect(element), element);
}
function useRect(element, measure, fallbackRect) {
  if (measure === void 0) {
    measure = defaultMeasure;
  }
  const [rect, setRect] = reactExports.useState(null);
  function measureRect() {
    setRect((currentRect) => {
      if (!element) {
        return null;
      }
      if (element.isConnected === false) {
        var _ref;
        return (_ref = currentRect != null ? currentRect : fallbackRect) != null ? _ref : null;
      }
      const newRect = measure(element);
      if (JSON.stringify(currentRect) === JSON.stringify(newRect)) {
        return currentRect;
      }
      return newRect;
    });
  }
  const mutationObserver = useMutationObserver({
    callback(records) {
      if (!element) {
        return;
      }
      for (const record of records) {
        const {
          type,
          target
        } = record;
        if (type === "childList" && target instanceof HTMLElement && target.contains(element)) {
          measureRect();
          break;
        }
      }
    }
  });
  const resizeObserver = useResizeObserver({
    callback: measureRect
  });
  useIsomorphicLayoutEffect(() => {
    measureRect();
    if (element) {
      resizeObserver == null ? void 0 : resizeObserver.observe(element);
      mutationObserver == null ? void 0 : mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    } else {
      resizeObserver == null ? void 0 : resizeObserver.disconnect();
      mutationObserver == null ? void 0 : mutationObserver.disconnect();
    }
  }, [element]);
  return rect;
}
function useRectDelta(rect) {
  const initialRect = useInitialValue(rect);
  return getRectDelta(rect, initialRect);
}
const defaultValue$1 = [];
function useScrollableAncestors(node) {
  const previousNode = reactExports.useRef(node);
  const ancestors = useLazyMemo((previousValue) => {
    if (!node) {
      return defaultValue$1;
    }
    if (previousValue && previousValue !== defaultValue$1 && node && previousNode.current && node.parentNode === previousNode.current.parentNode) {
      return previousValue;
    }
    return getScrollableAncestors(node);
  }, [node]);
  reactExports.useEffect(() => {
    previousNode.current = node;
  }, [node]);
  return ancestors;
}
function useScrollOffsets(elements) {
  const [scrollCoordinates, setScrollCoordinates] = reactExports.useState(null);
  const prevElements = reactExports.useRef(elements);
  const handleScroll = reactExports.useCallback((event) => {
    const scrollingElement = getScrollableElement(event.target);
    if (!scrollingElement) {
      return;
    }
    setScrollCoordinates((scrollCoordinates2) => {
      if (!scrollCoordinates2) {
        return null;
      }
      scrollCoordinates2.set(scrollingElement, getScrollCoordinates(scrollingElement));
      return new Map(scrollCoordinates2);
    });
  }, []);
  reactExports.useEffect(() => {
    const previousElements = prevElements.current;
    if (elements !== previousElements) {
      cleanup(previousElements);
      const entries = elements.map((element) => {
        const scrollableElement = getScrollableElement(element);
        if (scrollableElement) {
          scrollableElement.addEventListener("scroll", handleScroll, {
            passive: true
          });
          return [scrollableElement, getScrollCoordinates(scrollableElement)];
        }
        return null;
      }).filter((entry) => entry != null);
      setScrollCoordinates(entries.length ? new Map(entries) : null);
      prevElements.current = elements;
    }
    return () => {
      cleanup(elements);
      cleanup(previousElements);
    };
    function cleanup(elements2) {
      elements2.forEach((element) => {
        const scrollableElement = getScrollableElement(element);
        scrollableElement == null ? void 0 : scrollableElement.removeEventListener("scroll", handleScroll);
      });
    }
  }, [handleScroll, elements]);
  return reactExports.useMemo(() => {
    if (elements.length) {
      return scrollCoordinates ? Array.from(scrollCoordinates.values()).reduce((acc, coordinates) => add(acc, coordinates), defaultCoordinates) : getScrollOffsets(elements);
    }
    return defaultCoordinates;
  }, [elements, scrollCoordinates]);
}
function useScrollOffsetsDelta(scrollOffsets, dependencies) {
  if (dependencies === void 0) {
    dependencies = [];
  }
  const initialScrollOffsets = reactExports.useRef(null);
  reactExports.useEffect(
    () => {
      initialScrollOffsets.current = null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies
  );
  reactExports.useEffect(() => {
    const hasScrollOffsets = scrollOffsets !== defaultCoordinates;
    if (hasScrollOffsets && !initialScrollOffsets.current) {
      initialScrollOffsets.current = scrollOffsets;
    }
    if (!hasScrollOffsets && initialScrollOffsets.current) {
      initialScrollOffsets.current = null;
    }
  }, [scrollOffsets]);
  return initialScrollOffsets.current ? subtract(scrollOffsets, initialScrollOffsets.current) : defaultCoordinates;
}
function useSensorSetup(sensors) {
  reactExports.useEffect(
    () => {
      if (!canUseDOM) {
        return;
      }
      const teardownFns = sensors.map((_ref) => {
        let {
          sensor
        } = _ref;
        return sensor.setup == null ? void 0 : sensor.setup();
      });
      return () => {
        for (const teardown of teardownFns) {
          teardown == null ? void 0 : teardown();
        }
      };
    },
    // TO-DO: Sensors length could theoretically change which would not be a valid dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
    sensors.map((_ref2) => {
      let {
        sensor
      } = _ref2;
      return sensor;
    })
  );
}
function useSyntheticListeners(listeners, id) {
  return reactExports.useMemo(() => {
    return listeners.reduce((acc, _ref) => {
      let {
        eventName,
        handler
      } = _ref;
      acc[eventName] = (event) => {
        handler(event, id);
      };
      return acc;
    }, {});
  }, [listeners, id]);
}
function useWindowRect(element) {
  return reactExports.useMemo(() => element ? getWindowClientRect(element) : null, [element]);
}
const defaultValue$2 = [];
function useRects(elements, measure) {
  if (measure === void 0) {
    measure = getClientRect;
  }
  const [firstElement] = elements;
  const windowRect = useWindowRect(firstElement ? getWindow(firstElement) : null);
  const [rects, setRects] = reactExports.useState(defaultValue$2);
  function measureRects() {
    setRects(() => {
      if (!elements.length) {
        return defaultValue$2;
      }
      return elements.map((element) => isDocumentScrollingElement(element) ? windowRect : new Rect(measure(element), element));
    });
  }
  const resizeObserver = useResizeObserver({
    callback: measureRects
  });
  useIsomorphicLayoutEffect(() => {
    resizeObserver == null ? void 0 : resizeObserver.disconnect();
    measureRects();
    elements.forEach((element) => resizeObserver == null ? void 0 : resizeObserver.observe(element));
  }, [elements]);
  return rects;
}
function getMeasurableNode(node) {
  if (!node) {
    return null;
  }
  if (node.children.length > 1) {
    return node;
  }
  const firstChild = node.children[0];
  return isHTMLElement(firstChild) ? firstChild : node;
}
function useDragOverlayMeasuring(_ref) {
  let {
    measure
  } = _ref;
  const [rect, setRect] = reactExports.useState(null);
  const handleResize = reactExports.useCallback((entries) => {
    for (const {
      target
    } of entries) {
      if (isHTMLElement(target)) {
        setRect((rect2) => {
          const newRect = measure(target);
          return rect2 ? {
            ...rect2,
            width: newRect.width,
            height: newRect.height
          } : newRect;
        });
        break;
      }
    }
  }, [measure]);
  const resizeObserver = useResizeObserver({
    callback: handleResize
  });
  const handleNodeChange = reactExports.useCallback((element) => {
    const node = getMeasurableNode(element);
    resizeObserver == null ? void 0 : resizeObserver.disconnect();
    if (node) {
      resizeObserver == null ? void 0 : resizeObserver.observe(node);
    }
    setRect(node ? measure(node) : null);
  }, [measure, resizeObserver]);
  const [nodeRef, setRef] = useNodeRef(handleNodeChange);
  return reactExports.useMemo(() => ({
    nodeRef,
    rect,
    setRef
  }), [rect, nodeRef, setRef]);
}
const defaultSensors = [{
  sensor: PointerSensor,
  options: {}
}, {
  sensor: KeyboardSensor,
  options: {}
}];
const defaultData = {
  current: {}
};
const defaultMeasuringConfiguration = {
  draggable: {
    measure: getTransformAgnosticClientRect
  },
  droppable: {
    measure: getTransformAgnosticClientRect,
    strategy: MeasuringStrategy.WhileDragging,
    frequency: MeasuringFrequency.Optimized
  },
  dragOverlay: {
    measure: getClientRect
  }
};
class DroppableContainersMap extends Map {
  get(id) {
    var _super$get;
    return id != null ? (_super$get = super.get(id)) != null ? _super$get : void 0 : void 0;
  }
  toArray() {
    return Array.from(this.values());
  }
  getEnabled() {
    return this.toArray().filter((_ref) => {
      let {
        disabled
      } = _ref;
      return !disabled;
    });
  }
  getNodeFor(id) {
    var _this$get$node$curren, _this$get;
    return (_this$get$node$curren = (_this$get = this.get(id)) == null ? void 0 : _this$get.node.current) != null ? _this$get$node$curren : void 0;
  }
}
const defaultPublicContext = {
  activatorEvent: null,
  active: null,
  activeNode: null,
  activeNodeRect: null,
  collisions: null,
  containerNodeRect: null,
  draggableNodes: /* @__PURE__ */ new Map(),
  droppableRects: /* @__PURE__ */ new Map(),
  droppableContainers: /* @__PURE__ */ new DroppableContainersMap(),
  over: null,
  dragOverlay: {
    nodeRef: {
      current: null
    },
    rect: null,
    setRef: noop
  },
  scrollableAncestors: [],
  scrollableAncestorRects: [],
  measuringConfiguration: defaultMeasuringConfiguration,
  measureDroppableContainers: noop,
  windowRect: null,
  measuringScheduled: false
};
const defaultInternalContext = {
  activatorEvent: null,
  activators: [],
  active: null,
  activeNodeRect: null,
  ariaDescribedById: {
    draggable: ""
  },
  dispatch: noop,
  draggableNodes: /* @__PURE__ */ new Map(),
  over: null,
  measureDroppableContainers: noop
};
const InternalContext = /* @__PURE__ */ reactExports.createContext(defaultInternalContext);
const PublicContext = /* @__PURE__ */ reactExports.createContext(defaultPublicContext);
function getInitialState() {
  return {
    draggable: {
      active: null,
      initialCoordinates: {
        x: 0,
        y: 0
      },
      nodes: /* @__PURE__ */ new Map(),
      translate: {
        x: 0,
        y: 0
      }
    },
    droppable: {
      containers: new DroppableContainersMap()
    }
  };
}
function reducer(state, action) {
  switch (action.type) {
    case Action.DragStart:
      return {
        ...state,
        draggable: {
          ...state.draggable,
          initialCoordinates: action.initialCoordinates,
          active: action.active
        }
      };
    case Action.DragMove:
      if (state.draggable.active == null) {
        return state;
      }
      return {
        ...state,
        draggable: {
          ...state.draggable,
          translate: {
            x: action.coordinates.x - state.draggable.initialCoordinates.x,
            y: action.coordinates.y - state.draggable.initialCoordinates.y
          }
        }
      };
    case Action.DragEnd:
    case Action.DragCancel:
      return {
        ...state,
        draggable: {
          ...state.draggable,
          active: null,
          initialCoordinates: {
            x: 0,
            y: 0
          },
          translate: {
            x: 0,
            y: 0
          }
        }
      };
    case Action.RegisterDroppable: {
      const {
        element
      } = action;
      const {
        id
      } = element;
      const containers = new DroppableContainersMap(state.droppable.containers);
      containers.set(id, element);
      return {
        ...state,
        droppable: {
          ...state.droppable,
          containers
        }
      };
    }
    case Action.SetDroppableDisabled: {
      const {
        id,
        key: key2,
        disabled
      } = action;
      const element = state.droppable.containers.get(id);
      if (!element || key2 !== element.key) {
        return state;
      }
      const containers = new DroppableContainersMap(state.droppable.containers);
      containers.set(id, {
        ...element,
        disabled
      });
      return {
        ...state,
        droppable: {
          ...state.droppable,
          containers
        }
      };
    }
    case Action.UnregisterDroppable: {
      const {
        id,
        key: key2
      } = action;
      const element = state.droppable.containers.get(id);
      if (!element || key2 !== element.key) {
        return state;
      }
      const containers = new DroppableContainersMap(state.droppable.containers);
      containers.delete(id);
      return {
        ...state,
        droppable: {
          ...state.droppable,
          containers
        }
      };
    }
    default: {
      return state;
    }
  }
}
function RestoreFocus(_ref) {
  let {
    disabled
  } = _ref;
  const {
    active,
    activatorEvent,
    draggableNodes
  } = reactExports.useContext(InternalContext);
  const previousActivatorEvent = usePrevious(activatorEvent);
  const previousActiveId = usePrevious(active == null ? void 0 : active.id);
  reactExports.useEffect(() => {
    if (disabled) {
      return;
    }
    if (!activatorEvent && previousActivatorEvent && previousActiveId != null) {
      if (!isKeyboardEvent(previousActivatorEvent)) {
        return;
      }
      if (document.activeElement === previousActivatorEvent.target) {
        return;
      }
      const draggableNode = draggableNodes.get(previousActiveId);
      if (!draggableNode) {
        return;
      }
      const {
        activatorNode,
        node
      } = draggableNode;
      if (!activatorNode.current && !node.current) {
        return;
      }
      requestAnimationFrame(() => {
        for (const element of [activatorNode.current, node.current]) {
          if (!element) {
            continue;
          }
          const focusableNode = findFirstFocusableNode(element);
          if (focusableNode) {
            focusableNode.focus();
            break;
          }
        }
      });
    }
  }, [activatorEvent, disabled, draggableNodes, previousActiveId, previousActivatorEvent]);
  return null;
}
function applyModifiers(modifiers, _ref) {
  let {
    transform,
    ...args
  } = _ref;
  return modifiers != null && modifiers.length ? modifiers.reduce((accumulator, modifier) => {
    return modifier({
      transform: accumulator,
      ...args
    });
  }, transform) : transform;
}
function useMeasuringConfiguration(config) {
  return reactExports.useMemo(
    () => ({
      draggable: {
        ...defaultMeasuringConfiguration.draggable,
        ...config == null ? void 0 : config.draggable
      },
      droppable: {
        ...defaultMeasuringConfiguration.droppable,
        ...config == null ? void 0 : config.droppable
      },
      dragOverlay: {
        ...defaultMeasuringConfiguration.dragOverlay,
        ...config == null ? void 0 : config.dragOverlay
      }
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config == null ? void 0 : config.draggable, config == null ? void 0 : config.droppable, config == null ? void 0 : config.dragOverlay]
  );
}
function useLayoutShiftScrollCompensation(_ref) {
  let {
    activeNode,
    measure,
    initialRect,
    config = true
  } = _ref;
  const initialized = reactExports.useRef(false);
  const {
    x,
    y
  } = typeof config === "boolean" ? {
    x: config,
    y: config
  } : config;
  useIsomorphicLayoutEffect(() => {
    const disabled = !x && !y;
    if (disabled || !activeNode) {
      initialized.current = false;
      return;
    }
    if (initialized.current || !initialRect) {
      return;
    }
    const node = activeNode == null ? void 0 : activeNode.node.current;
    if (!node || node.isConnected === false) {
      return;
    }
    const rect = measure(node);
    const rectDelta = getRectDelta(rect, initialRect);
    if (!x) {
      rectDelta.x = 0;
    }
    if (!y) {
      rectDelta.y = 0;
    }
    initialized.current = true;
    if (Math.abs(rectDelta.x) > 0 || Math.abs(rectDelta.y) > 0) {
      const firstScrollableAncestor = getFirstScrollableAncestor(node);
      if (firstScrollableAncestor) {
        firstScrollableAncestor.scrollBy({
          top: rectDelta.y,
          left: rectDelta.x
        });
      }
    }
  }, [activeNode, x, y, initialRect, measure]);
}
const ActiveDraggableContext = /* @__PURE__ */ reactExports.createContext({
  ...defaultCoordinates,
  scaleX: 1,
  scaleY: 1
});
var Status;
(function(Status2) {
  Status2[Status2["Uninitialized"] = 0] = "Uninitialized";
  Status2[Status2["Initializing"] = 1] = "Initializing";
  Status2[Status2["Initialized"] = 2] = "Initialized";
})(Status || (Status = {}));
const DndContext = /* @__PURE__ */ reactExports.memo(function DndContext2(_ref) {
  var _sensorContext$curren, _dragOverlay$nodeRef$, _dragOverlay$rect, _over$rect;
  let {
    id,
    accessibility,
    autoScroll = true,
    children,
    sensors = defaultSensors,
    collisionDetection = rectIntersection,
    measuring,
    modifiers,
    ...props
  } = _ref;
  const store = reactExports.useReducer(reducer, void 0, getInitialState);
  const [state, dispatch] = store;
  const [dispatchMonitorEvent, registerMonitorListener] = useDndMonitorProvider();
  const [status, setStatus] = reactExports.useState(Status.Uninitialized);
  const isInitialized = status === Status.Initialized;
  const {
    draggable: {
      active: activeId,
      nodes: draggableNodes,
      translate
    },
    droppable: {
      containers: droppableContainers
    }
  } = state;
  const node = activeId != null ? draggableNodes.get(activeId) : null;
  const activeRects = reactExports.useRef({
    initial: null,
    translated: null
  });
  const active = reactExports.useMemo(() => {
    var _node$data;
    return activeId != null ? {
      id: activeId,
      // It's possible for the active node to unmount while dragging
      data: (_node$data = node == null ? void 0 : node.data) != null ? _node$data : defaultData,
      rect: activeRects
    } : null;
  }, [activeId, node]);
  const activeRef = reactExports.useRef(null);
  const [activeSensor, setActiveSensor] = reactExports.useState(null);
  const [activatorEvent, setActivatorEvent] = reactExports.useState(null);
  const latestProps = useLatestValue(props, Object.values(props));
  const draggableDescribedById = useUniqueId("DndDescribedBy", id);
  const enabledDroppableContainers = reactExports.useMemo(() => droppableContainers.getEnabled(), [droppableContainers]);
  const measuringConfiguration = useMeasuringConfiguration(measuring);
  const {
    droppableRects,
    measureDroppableContainers,
    measuringScheduled
  } = useDroppableMeasuring(enabledDroppableContainers, {
    dragging: isInitialized,
    dependencies: [translate.x, translate.y],
    config: measuringConfiguration.droppable
  });
  const activeNode = useCachedNode(draggableNodes, activeId);
  const activationCoordinates = reactExports.useMemo(() => activatorEvent ? getEventCoordinates(activatorEvent) : null, [activatorEvent]);
  const autoScrollOptions = getAutoScrollerOptions();
  const initialActiveNodeRect = useInitialRect(activeNode, measuringConfiguration.draggable.measure);
  useLayoutShiftScrollCompensation({
    activeNode: activeId != null ? draggableNodes.get(activeId) : null,
    config: autoScrollOptions.layoutShiftCompensation,
    initialRect: initialActiveNodeRect,
    measure: measuringConfiguration.draggable.measure
  });
  const activeNodeRect = useRect(activeNode, measuringConfiguration.draggable.measure, initialActiveNodeRect);
  const containerNodeRect = useRect(activeNode ? activeNode.parentElement : null);
  const sensorContext = reactExports.useRef({
    activatorEvent: null,
    active: null,
    activeNode,
    collisionRect: null,
    collisions: null,
    droppableRects,
    draggableNodes,
    draggingNode: null,
    draggingNodeRect: null,
    droppableContainers,
    over: null,
    scrollableAncestors: [],
    scrollAdjustedTranslate: null
  });
  const overNode = droppableContainers.getNodeFor((_sensorContext$curren = sensorContext.current.over) == null ? void 0 : _sensorContext$curren.id);
  const dragOverlay = useDragOverlayMeasuring({
    measure: measuringConfiguration.dragOverlay.measure
  });
  const draggingNode = (_dragOverlay$nodeRef$ = dragOverlay.nodeRef.current) != null ? _dragOverlay$nodeRef$ : activeNode;
  const draggingNodeRect = isInitialized ? (_dragOverlay$rect = dragOverlay.rect) != null ? _dragOverlay$rect : activeNodeRect : null;
  const usesDragOverlay = Boolean(dragOverlay.nodeRef.current && dragOverlay.rect);
  const nodeRectDelta = useRectDelta(usesDragOverlay ? null : activeNodeRect);
  const windowRect = useWindowRect(draggingNode ? getWindow(draggingNode) : null);
  const scrollableAncestors = useScrollableAncestors(isInitialized ? overNode != null ? overNode : activeNode : null);
  const scrollableAncestorRects = useRects(scrollableAncestors);
  const modifiedTranslate = applyModifiers(modifiers, {
    transform: {
      x: translate.x - nodeRectDelta.x,
      y: translate.y - nodeRectDelta.y,
      scaleX: 1,
      scaleY: 1
    },
    activatorEvent,
    active,
    activeNodeRect,
    containerNodeRect,
    draggingNodeRect,
    over: sensorContext.current.over,
    overlayNodeRect: dragOverlay.rect,
    scrollableAncestors,
    scrollableAncestorRects,
    windowRect
  });
  const pointerCoordinates = activationCoordinates ? add(activationCoordinates, translate) : null;
  const scrollOffsets = useScrollOffsets(scrollableAncestors);
  const scrollAdjustment = useScrollOffsetsDelta(scrollOffsets);
  const activeNodeScrollDelta = useScrollOffsetsDelta(scrollOffsets, [activeNodeRect]);
  const scrollAdjustedTranslate = add(modifiedTranslate, scrollAdjustment);
  const collisionRect = draggingNodeRect ? getAdjustedRect(draggingNodeRect, modifiedTranslate) : null;
  const collisions = active && collisionRect ? collisionDetection({
    active,
    collisionRect,
    droppableRects,
    droppableContainers: enabledDroppableContainers,
    pointerCoordinates
  }) : null;
  const overId = getFirstCollision(collisions, "id");
  const [over, setOver] = reactExports.useState(null);
  const appliedTranslate = usesDragOverlay ? modifiedTranslate : add(modifiedTranslate, activeNodeScrollDelta);
  const transform = adjustScale(appliedTranslate, (_over$rect = over == null ? void 0 : over.rect) != null ? _over$rect : null, activeNodeRect);
  const activeSensorRef = reactExports.useRef(null);
  const instantiateSensor = reactExports.useCallback(
    (event, _ref2) => {
      let {
        sensor: Sensor,
        options
      } = _ref2;
      if (activeRef.current == null) {
        return;
      }
      const activeNode2 = draggableNodes.get(activeRef.current);
      if (!activeNode2) {
        return;
      }
      const activatorEvent2 = event.nativeEvent;
      const sensorInstance = new Sensor({
        active: activeRef.current,
        activeNode: activeNode2,
        event: activatorEvent2,
        options,
        // Sensors need to be instantiated with refs for arguments that change over time
        // otherwise they are frozen in time with the stale arguments
        context: sensorContext,
        onAbort(id2) {
          const draggableNode = draggableNodes.get(id2);
          if (!draggableNode) {
            return;
          }
          const {
            onDragAbort
          } = latestProps.current;
          const event2 = {
            id: id2
          };
          onDragAbort == null ? void 0 : onDragAbort(event2);
          dispatchMonitorEvent({
            type: "onDragAbort",
            event: event2
          });
        },
        onPending(id2, constraint, initialCoordinates, offset) {
          const draggableNode = draggableNodes.get(id2);
          if (!draggableNode) {
            return;
          }
          const {
            onDragPending
          } = latestProps.current;
          const event2 = {
            id: id2,
            constraint,
            initialCoordinates,
            offset
          };
          onDragPending == null ? void 0 : onDragPending(event2);
          dispatchMonitorEvent({
            type: "onDragPending",
            event: event2
          });
        },
        onStart(initialCoordinates) {
          const id2 = activeRef.current;
          if (id2 == null) {
            return;
          }
          const draggableNode = draggableNodes.get(id2);
          if (!draggableNode) {
            return;
          }
          const {
            onDragStart
          } = latestProps.current;
          const event2 = {
            activatorEvent: activatorEvent2,
            active: {
              id: id2,
              data: draggableNode.data,
              rect: activeRects
            }
          };
          reactDomExports.unstable_batchedUpdates(() => {
            onDragStart == null ? void 0 : onDragStart(event2);
            setStatus(Status.Initializing);
            dispatch({
              type: Action.DragStart,
              initialCoordinates,
              active: id2
            });
            dispatchMonitorEvent({
              type: "onDragStart",
              event: event2
            });
            setActiveSensor(activeSensorRef.current);
            setActivatorEvent(activatorEvent2);
          });
        },
        onMove(coordinates) {
          dispatch({
            type: Action.DragMove,
            coordinates
          });
        },
        onEnd: createHandler(Action.DragEnd),
        onCancel: createHandler(Action.DragCancel)
      });
      activeSensorRef.current = sensorInstance;
      function createHandler(type) {
        return async function handler() {
          const {
            active: active2,
            collisions: collisions2,
            over: over2,
            scrollAdjustedTranslate: scrollAdjustedTranslate2
          } = sensorContext.current;
          let event2 = null;
          if (active2 && scrollAdjustedTranslate2) {
            const {
              cancelDrop
            } = latestProps.current;
            event2 = {
              activatorEvent: activatorEvent2,
              active: active2,
              collisions: collisions2,
              delta: scrollAdjustedTranslate2,
              over: over2
            };
            if (type === Action.DragEnd && typeof cancelDrop === "function") {
              const shouldCancel = await Promise.resolve(cancelDrop(event2));
              if (shouldCancel) {
                type = Action.DragCancel;
              }
            }
          }
          activeRef.current = null;
          reactDomExports.unstable_batchedUpdates(() => {
            dispatch({
              type
            });
            setStatus(Status.Uninitialized);
            setOver(null);
            setActiveSensor(null);
            setActivatorEvent(null);
            activeSensorRef.current = null;
            const eventName = type === Action.DragEnd ? "onDragEnd" : "onDragCancel";
            if (event2) {
              const handler2 = latestProps.current[eventName];
              handler2 == null ? void 0 : handler2(event2);
              dispatchMonitorEvent({
                type: eventName,
                event: event2
              });
            }
          });
        };
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draggableNodes]
  );
  const bindActivatorToSensorInstantiator = reactExports.useCallback((handler, sensor) => {
    return (event, active2) => {
      const nativeEvent = event.nativeEvent;
      const activeDraggableNode = draggableNodes.get(active2);
      if (
        // Another sensor is already instantiating
        activeRef.current !== null || // No active draggable
        !activeDraggableNode || // Event has already been captured
        nativeEvent.dndKit || nativeEvent.defaultPrevented
      ) {
        return;
      }
      const activationContext = {
        active: activeDraggableNode
      };
      const shouldActivate = handler(event, sensor.options, activationContext);
      if (shouldActivate === true) {
        nativeEvent.dndKit = {
          capturedBy: sensor.sensor
        };
        activeRef.current = active2;
        instantiateSensor(event, sensor);
      }
    };
  }, [draggableNodes, instantiateSensor]);
  const activators = useCombineActivators(sensors, bindActivatorToSensorInstantiator);
  useSensorSetup(sensors);
  useIsomorphicLayoutEffect(() => {
    if (activeNodeRect && status === Status.Initializing) {
      setStatus(Status.Initialized);
    }
  }, [activeNodeRect, status]);
  reactExports.useEffect(
    () => {
      const {
        onDragMove
      } = latestProps.current;
      const {
        active: active2,
        activatorEvent: activatorEvent2,
        collisions: collisions2,
        over: over2
      } = sensorContext.current;
      if (!active2 || !activatorEvent2) {
        return;
      }
      const event = {
        active: active2,
        activatorEvent: activatorEvent2,
        collisions: collisions2,
        delta: {
          x: scrollAdjustedTranslate.x,
          y: scrollAdjustedTranslate.y
        },
        over: over2
      };
      reactDomExports.unstable_batchedUpdates(() => {
        onDragMove == null ? void 0 : onDragMove(event);
        dispatchMonitorEvent({
          type: "onDragMove",
          event
        });
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scrollAdjustedTranslate.x, scrollAdjustedTranslate.y]
  );
  reactExports.useEffect(
    () => {
      const {
        active: active2,
        activatorEvent: activatorEvent2,
        collisions: collisions2,
        droppableContainers: droppableContainers2,
        scrollAdjustedTranslate: scrollAdjustedTranslate2
      } = sensorContext.current;
      if (!active2 || activeRef.current == null || !activatorEvent2 || !scrollAdjustedTranslate2) {
        return;
      }
      const {
        onDragOver
      } = latestProps.current;
      const overContainer = droppableContainers2.get(overId);
      const over2 = overContainer && overContainer.rect.current ? {
        id: overContainer.id,
        rect: overContainer.rect.current,
        data: overContainer.data,
        disabled: overContainer.disabled
      } : null;
      const event = {
        active: active2,
        activatorEvent: activatorEvent2,
        collisions: collisions2,
        delta: {
          x: scrollAdjustedTranslate2.x,
          y: scrollAdjustedTranslate2.y
        },
        over: over2
      };
      reactDomExports.unstable_batchedUpdates(() => {
        setOver(over2);
        onDragOver == null ? void 0 : onDragOver(event);
        dispatchMonitorEvent({
          type: "onDragOver",
          event
        });
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [overId]
  );
  useIsomorphicLayoutEffect(() => {
    sensorContext.current = {
      activatorEvent,
      active,
      activeNode,
      collisionRect,
      collisions,
      droppableRects,
      draggableNodes,
      draggingNode,
      draggingNodeRect,
      droppableContainers,
      over,
      scrollableAncestors,
      scrollAdjustedTranslate
    };
    activeRects.current = {
      initial: draggingNodeRect,
      translated: collisionRect
    };
  }, [active, activeNode, collisions, collisionRect, draggableNodes, draggingNode, draggingNodeRect, droppableRects, droppableContainers, over, scrollableAncestors, scrollAdjustedTranslate]);
  useAutoScroller({
    ...autoScrollOptions,
    delta: translate,
    draggingRect: collisionRect,
    pointerCoordinates,
    scrollableAncestors,
    scrollableAncestorRects
  });
  const publicContext = reactExports.useMemo(() => {
    const context = {
      active,
      activeNode,
      activeNodeRect,
      activatorEvent,
      collisions,
      containerNodeRect,
      dragOverlay,
      draggableNodes,
      droppableContainers,
      droppableRects,
      over,
      measureDroppableContainers,
      scrollableAncestors,
      scrollableAncestorRects,
      measuringConfiguration,
      measuringScheduled,
      windowRect
    };
    return context;
  }, [active, activeNode, activeNodeRect, activatorEvent, collisions, containerNodeRect, dragOverlay, draggableNodes, droppableContainers, droppableRects, over, measureDroppableContainers, scrollableAncestors, scrollableAncestorRects, measuringConfiguration, measuringScheduled, windowRect]);
  const internalContext = reactExports.useMemo(() => {
    const context = {
      activatorEvent,
      activators,
      active,
      activeNodeRect,
      ariaDescribedById: {
        draggable: draggableDescribedById
      },
      dispatch,
      draggableNodes,
      over,
      measureDroppableContainers
    };
    return context;
  }, [activatorEvent, activators, active, activeNodeRect, dispatch, draggableDescribedById, draggableNodes, over, measureDroppableContainers]);
  return React.createElement(DndMonitorContext.Provider, {
    value: registerMonitorListener
  }, React.createElement(InternalContext.Provider, {
    value: internalContext
  }, React.createElement(PublicContext.Provider, {
    value: publicContext
  }, React.createElement(ActiveDraggableContext.Provider, {
    value: transform
  }, children)), React.createElement(RestoreFocus, {
    disabled: (accessibility == null ? void 0 : accessibility.restoreFocus) === false
  })), React.createElement(Accessibility, {
    ...accessibility,
    hiddenTextDescribedById: draggableDescribedById
  }));
  function getAutoScrollerOptions() {
    const activeSensorDisablesAutoscroll = (activeSensor == null ? void 0 : activeSensor.autoScrollEnabled) === false;
    const autoScrollGloballyDisabled = typeof autoScroll === "object" ? autoScroll.enabled === false : autoScroll === false;
    const enabled = isInitialized && !activeSensorDisablesAutoscroll && !autoScrollGloballyDisabled;
    if (typeof autoScroll === "object") {
      return {
        ...autoScroll,
        enabled
      };
    }
    return {
      enabled
    };
  }
});
const NullContext = /* @__PURE__ */ reactExports.createContext(null);
const defaultRole = "button";
const ID_PREFIX = "Draggable";
function useDraggable(_ref) {
  let {
    id,
    data,
    disabled = false,
    attributes
  } = _ref;
  const key2 = useUniqueId(ID_PREFIX);
  const {
    activators,
    activatorEvent,
    active,
    activeNodeRect,
    ariaDescribedById,
    draggableNodes,
    over
  } = reactExports.useContext(InternalContext);
  const {
    role = defaultRole,
    roleDescription = "draggable",
    tabIndex = 0
  } = attributes != null ? attributes : {};
  const isDragging = (active == null ? void 0 : active.id) === id;
  const transform = reactExports.useContext(isDragging ? ActiveDraggableContext : NullContext);
  const [node, setNodeRef] = useNodeRef();
  const [activatorNode, setActivatorNodeRef] = useNodeRef();
  const listeners = useSyntheticListeners(activators, id);
  const dataRef = useLatestValue(data);
  useIsomorphicLayoutEffect(
    () => {
      draggableNodes.set(id, {
        id,
        key: key2,
        node,
        activatorNode,
        data: dataRef
      });
      return () => {
        const node2 = draggableNodes.get(id);
        if (node2 && node2.key === key2) {
          draggableNodes.delete(id);
        }
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draggableNodes, id]
  );
  const memoizedAttributes = reactExports.useMemo(() => ({
    role,
    tabIndex,
    "aria-disabled": disabled,
    "aria-pressed": isDragging && role === defaultRole ? true : void 0,
    "aria-roledescription": roleDescription,
    "aria-describedby": ariaDescribedById.draggable
  }), [disabled, role, tabIndex, isDragging, roleDescription, ariaDescribedById.draggable]);
  return {
    active,
    activatorEvent,
    activeNodeRect,
    attributes: memoizedAttributes,
    isDragging,
    listeners: disabled ? void 0 : listeners,
    node,
    over,
    setNodeRef,
    setActivatorNodeRef,
    transform
  };
}
function useDndContext() {
  return reactExports.useContext(PublicContext);
}
const ID_PREFIX$1 = "Droppable";
const defaultResizeObserverConfig = {
  timeout: 25
};
function useDroppable(_ref) {
  let {
    data,
    disabled = false,
    id,
    resizeObserverConfig
  } = _ref;
  const key2 = useUniqueId(ID_PREFIX$1);
  const {
    active,
    dispatch,
    over,
    measureDroppableContainers
  } = reactExports.useContext(InternalContext);
  const previous = reactExports.useRef({
    disabled
  });
  const resizeObserverConnected = reactExports.useRef(false);
  const rect = reactExports.useRef(null);
  const callbackId = reactExports.useRef(null);
  const {
    disabled: resizeObserverDisabled,
    updateMeasurementsFor,
    timeout: resizeObserverTimeout
  } = {
    ...defaultResizeObserverConfig,
    ...resizeObserverConfig
  };
  const ids2 = useLatestValue(updateMeasurementsFor != null ? updateMeasurementsFor : id);
  const handleResize = reactExports.useCallback(
    () => {
      if (!resizeObserverConnected.current) {
        resizeObserverConnected.current = true;
        return;
      }
      if (callbackId.current != null) {
        clearTimeout(callbackId.current);
      }
      callbackId.current = setTimeout(() => {
        measureDroppableContainers(Array.isArray(ids2.current) ? ids2.current : [ids2.current]);
        callbackId.current = null;
      }, resizeObserverTimeout);
    },
    //eslint-disable-next-line react-hooks/exhaustive-deps
    [resizeObserverTimeout]
  );
  const resizeObserver = useResizeObserver({
    callback: handleResize,
    disabled: resizeObserverDisabled || !active
  });
  const handleNodeChange = reactExports.useCallback((newElement, previousElement) => {
    if (!resizeObserver) {
      return;
    }
    if (previousElement) {
      resizeObserver.unobserve(previousElement);
      resizeObserverConnected.current = false;
    }
    if (newElement) {
      resizeObserver.observe(newElement);
    }
  }, [resizeObserver]);
  const [nodeRef, setNodeRef] = useNodeRef(handleNodeChange);
  const dataRef = useLatestValue(data);
  reactExports.useEffect(() => {
    if (!resizeObserver || !nodeRef.current) {
      return;
    }
    resizeObserver.disconnect();
    resizeObserverConnected.current = false;
    resizeObserver.observe(nodeRef.current);
  }, [nodeRef, resizeObserver]);
  reactExports.useEffect(
    () => {
      dispatch({
        type: Action.RegisterDroppable,
        element: {
          id,
          key: key2,
          disabled,
          node: nodeRef,
          rect,
          data: dataRef
        }
      });
      return () => dispatch({
        type: Action.UnregisterDroppable,
        key: key2,
        id
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id]
  );
  reactExports.useEffect(() => {
    if (disabled !== previous.current.disabled) {
      dispatch({
        type: Action.SetDroppableDisabled,
        id,
        key: key2,
        disabled
      });
      previous.current.disabled = disabled;
    }
  }, [id, key2, disabled, dispatch]);
  return {
    active,
    rect,
    isOver: (over == null ? void 0 : over.id) === id,
    node: nodeRef,
    over,
    setNodeRef
  };
}
function AnimationManager(_ref) {
  let {
    animation,
    children
  } = _ref;
  const [clonedChildren, setClonedChildren] = reactExports.useState(null);
  const [element, setElement] = reactExports.useState(null);
  const previousChildren = usePrevious(children);
  if (!children && !clonedChildren && previousChildren) {
    setClonedChildren(previousChildren);
  }
  useIsomorphicLayoutEffect(() => {
    if (!element) {
      return;
    }
    const key2 = clonedChildren == null ? void 0 : clonedChildren.key;
    const id = clonedChildren == null ? void 0 : clonedChildren.props.id;
    if (key2 == null || id == null) {
      setClonedChildren(null);
      return;
    }
    Promise.resolve(animation(id, element)).then(() => {
      setClonedChildren(null);
    });
  }, [animation, clonedChildren, element]);
  return React.createElement(React.Fragment, null, children, clonedChildren ? reactExports.cloneElement(clonedChildren, {
    ref: setElement
  }) : null);
}
const defaultTransform = {
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1
};
function NullifiedContextProvider(_ref) {
  let {
    children
  } = _ref;
  return React.createElement(InternalContext.Provider, {
    value: defaultInternalContext
  }, React.createElement(ActiveDraggableContext.Provider, {
    value: defaultTransform
  }, children));
}
const baseStyles = {
  position: "fixed",
  touchAction: "none"
};
const defaultTransition = (activatorEvent) => {
  const isKeyboardActivator = isKeyboardEvent(activatorEvent);
  return isKeyboardActivator ? "transform 250ms ease" : void 0;
};
const PositionedOverlay = /* @__PURE__ */ reactExports.forwardRef((_ref, ref) => {
  let {
    as,
    activatorEvent,
    adjustScale: adjustScale2,
    children,
    className,
    rect,
    style,
    transform,
    transition = defaultTransition
  } = _ref;
  if (!rect) {
    return null;
  }
  const scaleAdjustedTransform = adjustScale2 ? transform : {
    ...transform,
    scaleX: 1,
    scaleY: 1
  };
  const styles = {
    ...baseStyles,
    width: rect.width,
    height: rect.height,
    top: rect.top,
    left: rect.left,
    transform: CSS.Transform.toString(scaleAdjustedTransform),
    transformOrigin: adjustScale2 && activatorEvent ? getRelativeTransformOrigin(activatorEvent, rect) : void 0,
    transition: typeof transition === "function" ? transition(activatorEvent) : transition,
    ...style
  };
  return React.createElement(as, {
    className,
    style: styles,
    ref
  }, children);
});
const defaultDropAnimationSideEffects = (options) => (_ref) => {
  let {
    active,
    dragOverlay
  } = _ref;
  const originalStyles = {};
  const {
    styles,
    className
  } = options;
  if (styles != null && styles.active) {
    for (const [key2, value] of Object.entries(styles.active)) {
      if (value === void 0) {
        continue;
      }
      originalStyles[key2] = active.node.style.getPropertyValue(key2);
      active.node.style.setProperty(key2, value);
    }
  }
  if (styles != null && styles.dragOverlay) {
    for (const [key2, value] of Object.entries(styles.dragOverlay)) {
      if (value === void 0) {
        continue;
      }
      dragOverlay.node.style.setProperty(key2, value);
    }
  }
  if (className != null && className.active) {
    active.node.classList.add(className.active);
  }
  if (className != null && className.dragOverlay) {
    dragOverlay.node.classList.add(className.dragOverlay);
  }
  return function cleanup() {
    for (const [key2, value] of Object.entries(originalStyles)) {
      active.node.style.setProperty(key2, value);
    }
    if (className != null && className.active) {
      active.node.classList.remove(className.active);
    }
  };
};
const defaultKeyframeResolver = (_ref2) => {
  let {
    transform: {
      initial,
      final
    }
  } = _ref2;
  return [{
    transform: CSS.Transform.toString(initial)
  }, {
    transform: CSS.Transform.toString(final)
  }];
};
const defaultDropAnimationConfiguration = {
  duration: 250,
  easing: "ease",
  keyframes: defaultKeyframeResolver,
  sideEffects: /* @__PURE__ */ defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0"
      }
    }
  })
};
function useDropAnimation(_ref3) {
  let {
    config,
    draggableNodes,
    droppableContainers,
    measuringConfiguration
  } = _ref3;
  return useEvent((id, node) => {
    if (config === null) {
      return;
    }
    const activeDraggable = draggableNodes.get(id);
    if (!activeDraggable) {
      return;
    }
    const activeNode = activeDraggable.node.current;
    if (!activeNode) {
      return;
    }
    const measurableNode = getMeasurableNode(node);
    if (!measurableNode) {
      return;
    }
    const {
      transform
    } = getWindow(node).getComputedStyle(node);
    const parsedTransform = parseTransform(transform);
    if (!parsedTransform) {
      return;
    }
    const animation = typeof config === "function" ? config : createDefaultDropAnimation(config);
    scrollIntoViewIfNeeded(activeNode, measuringConfiguration.draggable.measure);
    return animation({
      active: {
        id,
        data: activeDraggable.data,
        node: activeNode,
        rect: measuringConfiguration.draggable.measure(activeNode)
      },
      draggableNodes,
      dragOverlay: {
        node,
        rect: measuringConfiguration.dragOverlay.measure(measurableNode)
      },
      droppableContainers,
      measuringConfiguration,
      transform: parsedTransform
    });
  });
}
function createDefaultDropAnimation(options) {
  const {
    duration,
    easing,
    sideEffects,
    keyframes
  } = {
    ...defaultDropAnimationConfiguration,
    ...options
  };
  return (_ref4) => {
    let {
      active,
      dragOverlay,
      transform,
      ...rest
    } = _ref4;
    if (!duration) {
      return;
    }
    const delta = {
      x: dragOverlay.rect.left - active.rect.left,
      y: dragOverlay.rect.top - active.rect.top
    };
    const scale = {
      scaleX: transform.scaleX !== 1 ? active.rect.width * transform.scaleX / dragOverlay.rect.width : 1,
      scaleY: transform.scaleY !== 1 ? active.rect.height * transform.scaleY / dragOverlay.rect.height : 1
    };
    const finalTransform = {
      x: transform.x - delta.x,
      y: transform.y - delta.y,
      ...scale
    };
    const animationKeyframes = keyframes({
      ...rest,
      active,
      dragOverlay,
      transform: {
        initial: transform,
        final: finalTransform
      }
    });
    const [firstKeyframe] = animationKeyframes;
    const lastKeyframe = animationKeyframes[animationKeyframes.length - 1];
    if (JSON.stringify(firstKeyframe) === JSON.stringify(lastKeyframe)) {
      return;
    }
    const cleanup = sideEffects == null ? void 0 : sideEffects({
      active,
      dragOverlay,
      ...rest
    });
    const animation = dragOverlay.node.animate(animationKeyframes, {
      duration,
      easing,
      fill: "forwards"
    });
    return new Promise((resolve) => {
      animation.onfinish = () => {
        cleanup == null ? void 0 : cleanup();
        resolve();
      };
    });
  };
}
let key = 0;
function useKey(id) {
  return reactExports.useMemo(() => {
    if (id == null) {
      return;
    }
    key++;
    return key;
  }, [id]);
}
const DragOverlay = /* @__PURE__ */ React.memo((_ref) => {
  let {
    adjustScale: adjustScale2 = false,
    children,
    dropAnimation: dropAnimationConfig,
    style,
    transition,
    modifiers,
    wrapperElement = "div",
    className,
    zIndex = 999
  } = _ref;
  const {
    activatorEvent,
    active,
    activeNodeRect,
    containerNodeRect,
    draggableNodes,
    droppableContainers,
    dragOverlay,
    over,
    measuringConfiguration,
    scrollableAncestors,
    scrollableAncestorRects,
    windowRect
  } = useDndContext();
  const transform = reactExports.useContext(ActiveDraggableContext);
  const key2 = useKey(active == null ? void 0 : active.id);
  const modifiedTransform = applyModifiers(modifiers, {
    activatorEvent,
    active,
    activeNodeRect,
    containerNodeRect,
    draggingNodeRect: dragOverlay.rect,
    over,
    overlayNodeRect: dragOverlay.rect,
    scrollableAncestors,
    scrollableAncestorRects,
    transform,
    windowRect
  });
  const initialRect = useInitialValue(activeNodeRect);
  const dropAnimation = useDropAnimation({
    config: dropAnimationConfig,
    draggableNodes,
    droppableContainers,
    measuringConfiguration
  });
  const ref = initialRect ? dragOverlay.setRef : void 0;
  return React.createElement(NullifiedContextProvider, null, React.createElement(AnimationManager, {
    animation: dropAnimation
  }, active && key2 ? React.createElement(PositionedOverlay, {
    key: key2,
    id: active.id,
    ref,
    as: wrapperElement,
    activatorEvent,
    adjustScale: adjustScale2,
    className,
    transition,
    rect: initialRect,
    style: {
      zIndex,
      ...style
    },
    transform: modifiedTransform
  }, children) : null));
});
const RESOURCE_TYPES = [
  { value: "tractor", label: "Tractor", icon: Tractor },
  { value: "implement", label: "Implement", icon: Wrench },
  { value: "vehicle", label: "Vehicle", icon: Truck },
  { value: "sprayer", label: "Sprayer", icon: Droplets },
  { value: "trailer", label: "Trailer", icon: Package },
  { value: "staff", label: "Staff / Contractor", icon: User },
  { value: "other", label: "Other", icon: Package }
];
const COLOUR_OPTIONS = [
  { value: "slate", label: "Slate", bg: "bg-slate-500" },
  { value: "indigo", label: "Indigo", bg: "bg-indigo-500" },
  { value: "blue", label: "Blue", bg: "bg-blue-500" },
  { value: "green", label: "Green", bg: "bg-green-500" },
  { value: "emerald", label: "Emerald", bg: "bg-emerald-500" },
  { value: "amber", label: "Amber", bg: "bg-amber-500" },
  { value: "orange", label: "Orange", bg: "bg-orange-500" },
  { value: "red", label: "Red", bg: "bg-red-500" },
  { value: "purple", label: "Purple", bg: "bg-purple-500" }
];
const DEFAULT_COLOUR = {
  tractor: "green",
  implement: "amber",
  vehicle: "blue",
  sprayer: "indigo",
  trailer: "orange",
  staff: "purple",
  other: "slate"
};
const REQ_TYPE_MAP = [
  { key: "req_tractors", type: "tractor" },
  { key: "req_implements", type: "implement" },
  { key: "req_vehicles", type: "vehicle" },
  { key: "req_sprayers", type: "sprayer" },
  { key: "req_trailers", type: "trailer" },
  { key: "req_staff", type: "staff" },
  { key: "req_other", type: "other" }
];
function getTypeInfo(type) {
  return RESOURCE_TYPES.find((t) => t.value === type) ?? { label: type, icon: Package };
}
function getColourBg(colour) {
  return COLOUR_OPTIONS.find((c) => c.value === colour)?.bg ?? "bg-slate-500";
}
function isoDate(d) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function weekStart(d) {
  const r = new Date(d);
  const dow = r.getDay();
  r.setDate(r.getDate() - (dow === 0 ? 6 : dow - 1));
  r.setHours(0, 0, 0, 0);
  return r;
}
function ImportPanel({ farmId, onImported }) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = reactExports.useState(/* @__PURE__ */ new Set());
  const [dismissed, setDismissed] = reactExports.useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["resources-importable", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/resources/importable`).then((r) => r.json())
  });
  const importMut = useMutation({
    mutationFn: (items) => fetch(`/api/farms/${farmId}/resources/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items })
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: (result) => {
      const count = result.resources?.length ?? 0;
      queryClient.invalidateQueries({ queryKey: ["resources", farmId] });
      queryClient.invalidateQueries({ queryKey: ["resources-importable", farmId] });
      setSelected(/* @__PURE__ */ new Set());
      onImported();
      toast({ title: `${count} resource${count !== 1 ? "s" : ""} imported` });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  if (dismissed || isLoading) return null;
  const allItems = [...data?.equipment ?? [], ...data?.staff ?? []];
  if (allItems.length === 0) return null;
  const equipItems = data?.equipment ?? [];
  const staffItems = data?.staff ?? [];
  const key2 = (item) => `${item.sourceType}:${item.sourceId}`;
  function toggleItem(item) {
    setSelected((prev) => {
      const next = new Set(prev);
      const k = key2(item);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  }
  function toggleAll() {
    if (selected.size === allItems.length) {
      setSelected(/* @__PURE__ */ new Set());
    } else {
      setSelected(new Set(allItems.map(key2)));
    }
  }
  function handleImport() {
    const toImport = allItems.filter((i) => selected.has(key2(i))).map((i) => ({ name: i.name, type: i.resourceType, description: i.description ?? void 0 }));
    if (toImport.length === 0) return;
    importMut.mutate(toImport);
  }
  const allSelected = selected.size === allItems.length && allItems.length > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-indigo-200 bg-gradient-to-br from-indigo-50/60 to-white overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 sm:p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-4 h-4 text-indigo-600" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-sm text-foreground", children: "Import from your farm records" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/50 mt-0.5", children: [
            allItems.length,
            " item",
            allItems.length !== 1 ? "s" : "",
            " found — tick to add as resources."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDismissed(true), className: "w-6 h-6 flex items-center justify-center rounded-full text-foreground/30 hover:text-foreground hover:bg-muted transition-colors flex-shrink-0 mt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: toggleAll, className: "flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 mb-3 transition-colors", children: [
      allSelected ? /* @__PURE__ */ jsxRuntimeExports.jsx(SquareCheckBig, { className: "w-3.5 h-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { className: "w-3.5 h-3.5" }),
      allSelected ? "Deselect all" : "Select all"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      equipItems.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-bold uppercase tracking-wider text-foreground/40 mb-2", children: "Equipment & Machinery" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2", children: equipItems.map((item) => {
          const k = key2(item);
          const isChecked = selected.has(k);
          const { icon: Icon } = getTypeInfo(item.resourceType);
          const colourBg = getColourBg(DEFAULT_COLOUR[item.resourceType] ?? "slate");
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => toggleItem(item), className: cn("flex items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all", isChecked ? "border-indigo-300 bg-indigo-50 shadow-sm" : "border-border bg-white hover:border-indigo-200 hover:bg-indigo-50/30"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0", colourBg + "/10"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: cn("w-3.5 h-3.5", colourBg.replace("bg-", "text-")) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-foreground truncate", children: item.name }),
              item.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-foreground/40 truncate", children: item.description })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors", isChecked ? "border-indigo-500 bg-indigo-500" : "border-border"), children: isChecked && /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-2.5 h-2.5 text-white", viewBox: "0 0 10 8", fill: "none", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M1 4l3 3 5-6", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) }) })
          ] }, k);
        }) })
      ] }),
      staffItems.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-bold uppercase tracking-wider text-foreground/40 mb-2", children: "Staff Members" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2", children: staffItems.map((item) => {
          const k = key2(item);
          const isChecked = selected.has(k);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => toggleItem(item), className: cn("flex items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all", isChecked ? "border-indigo-300 bg-indigo-50 shadow-sm" : "border-border bg-white hover:border-indigo-200 hover:bg-indigo-50/30"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-7 h-7 rounded-md bg-purple-100 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-3.5 h-3.5 text-purple-600" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-foreground truncate", children: item.name }),
              item.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-foreground/40 truncate", children: item.description })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors", isChecked ? "border-indigo-500 bg-indigo-500" : "border-border"), children: isChecked && /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-2.5 h-2.5 text-white", viewBox: "0 0 10 8", fill: "none", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M1 4l3 3 5-6", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) }) })
          ] }, k);
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-4 pt-4 border-t border-indigo-100", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/40", children: selected.size > 0 ? `${selected.size} selected` : "Select items to import" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleImport, disabled: selected.size === 0 || importMut.isPending, className: "flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-3.5 h-3.5" }),
        importMut.isPending ? "Importing…" : `Import ${selected.size > 0 ? selected.size : ""} selected`
      ] })
    ] })
  ] }) });
}
function ResourceCard({ resource, onEdit, onArchive, onRestore }) {
  const { icon: Icon, label } = getTypeInfo(resource.type);
  const colourBg = getColourBg(resource.colour);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("group relative flex items-start gap-3 rounded-xl border bg-white p-3.5 transition-all hover:shadow-md", resource.isActive ? "border-border hover:border-border/80" : "border-dashed border-border/50 opacity-60"), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("w-1.5 self-stretch rounded-full flex-shrink-0", colourBg) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center", colourBg + "/10"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: cn("w-4.5 h-4.5", colourBg.replace("bg-", "text-")) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm text-foreground truncate", children: resource.name }),
        !resource.isActive && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-muted text-foreground/40 flex-shrink-0", children: "Archived" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-foreground/50 font-medium mt-0.5", children: label }),
      resource.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/50 mt-1 leading-relaxed line-clamp-2", children: resource.description })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity", children: resource.isActive ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onEdit(resource), className: "w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-foreground/40 hover:text-foreground transition-colors", title: "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onArchive(resource.id), className: "w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-foreground/40 hover:text-red-500 transition-colors", title: "Archive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Archive, { className: "w-3.5 h-3.5" }) })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onRestore(resource.id), className: "w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-foreground/40 hover:text-green-600 transition-colors", title: "Restore", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "w-3.5 h-3.5" }) }) })
  ] });
}
function ResourceForm({ initial, onSave, onCancel, isPending }) {
  const [name, setName] = reactExports.useState(initial?.name ?? "");
  const [type, setType] = reactExports.useState(initial?.type ?? "tractor");
  const [description, setDescription] = reactExports.useState(initial?.description ?? "");
  const [colour, setColour] = reactExports.useState(initial?.colour ?? "slate");
  const [error, setError] = reactExports.useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setError("");
    onSave({ name: name.trim(), type, description: description.trim(), colour });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 border-indigo-200 bg-indigo-50/30", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-sm text-foreground", children: initial?.id ? "Edit Resource" : "Add Custom Resource" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onCancel, className: "w-6 h-6 flex items-center justify-center rounded-full text-foreground/30 hover:text-foreground hover:bg-muted transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-foreground/70 mb-1.5", children: "Name *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: name, onChange: (e) => setName(e.target.value), placeholder: "e.g. John Deere 6R 155", className: "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-foreground/70 mb-1.5", children: "Type *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: type, onChange: (e) => setType(e.target.value), className: "w-full appearance-none rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 pr-8", children: RESOURCE_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t.value, children: t.label }, t.value)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40 pointer-events-none" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-foreground/70 mb-1.5", children: "Colour" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: COLOUR_OPTIONS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setColour(c.value), className: cn("w-7 h-7 rounded-full transition-all", c.bg, colour === c.value ? "ring-2 ring-offset-2 ring-foreground scale-110" : "opacity-60 hover:opacity-100"), title: c.label }, c.value)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-foreground/70 mb-1.5", children: "Description" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value), placeholder: "Optional notes (e.g. reg number, serial, spec details)", rows: 2, className: "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" })
      ] }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: isPending, className: "flex-1 bg-primary text-primary-foreground text-sm font-semibold py-2 px-4 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors", children: isPending ? "Saving…" : initial?.id ? "Save changes" : "Add resource" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onCancel, className: "text-sm font-semibold py-2 px-4 rounded-lg border border-border hover:bg-muted transition-colors", children: "Cancel" })
      ] })
    ] })
  ] });
}
function DraggableResourceChip({ resource, isCommitted }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `res:${resource.id}`,
    data: { resourceId: resource.id, resourceName: resource.name, resourceType: resource.type, resourceColour: resource.colour },
    disabled: isCommitted
  });
  const { icon: Icon } = getTypeInfo(resource.type);
  const colourBg = getColourBg(resource.colour);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      ref: setNodeRef,
      ...listeners,
      ...attributes,
      className: cn(
        "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left transition-all select-none",
        isCommitted ? "border-border/40 bg-muted/40 opacity-50 cursor-not-allowed" : "border-border bg-white shadow-sm hover:shadow hover:border-indigo-200 cursor-grab",
        isDragging && "opacity-30"
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(GripVertical, { className: "w-3 h-3 text-foreground/30 flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("w-5 h-5 rounded flex items-center justify-center flex-shrink-0", colourBg + "/15"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: cn("w-3 h-3", colourBg.replace("bg-", "text-")) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-foreground truncate max-w-[120px]", children: resource.name }),
        isCommitted && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-foreground/40 flex-shrink-0", children: "busy" })
      ]
    }
  );
}
function RequirementSlot({
  id,
  type,
  filled,
  filledWith,
  onRemove
}) {
  const { setNodeRef: dropRef, isOver } = useDroppable({ id, disabled: filled });
  const { attributes, listeners, setNodeRef: dragRef, isDragging } = useDraggable({
    id: `alloc:${filledWith?.id ?? "none"}`,
    data: { allocationId: filledWith?.id, resourceName: filledWith?.resource_name ?? "", resourceType: filledWith?.resource_type ?? type, resourceColour: filledWith?.resource_colour ?? "", isReturn: true },
    disabled: !filled || !filledWith
  });
  const { icon: Icon } = getTypeInfo(type);
  const colourBg = filled && filledWith ? getColourBg(filledWith.resource_colour) : "bg-slate-400";
  if (filled && filledWith) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        ref: dragRef,
        ...listeners,
        ...attributes,
        className: cn(
          "flex items-center gap-1.5 rounded-md border border-green-200 bg-green-50 px-2 py-1 text-xs font-medium text-green-800 group/slot cursor-grab active:cursor-grabbing",
          isDragging && "opacity-30"
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(GripVertical, { className: "w-3 h-3 text-green-600/30 flex-shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("w-3.5 h-3.5 rounded-sm flex items-center justify-center flex-shrink-0", colourBg + "/20"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: cn("w-2.5 h-2.5", colourBg.replace("bg-", "text-")) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate max-w-[80px]", children: filledWith.resource_name }),
          onRemove && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onRemove, className: "opacity-0 group-hover/slot:opacity-100 ml-auto transition-opacity text-green-600 hover:text-red-500 flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3 h-3" }) })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      ref: dropRef,
      className: cn(
        "flex items-center gap-1.5 rounded-md border border-dashed px-2 py-1 text-xs transition-all",
        isOver ? "border-indigo-400 bg-indigo-50 text-indigo-700" : "border-border/60 bg-muted/30 text-foreground/40"
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-3 h-3 flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px]", children: [
          "Drop ",
          getTypeInfo(type).label.toLowerCase()
        ] })
      ]
    }
  );
}
function DroppablePoolZone({ children, isReturning }) {
  const { setNodeRef, isOver } = useDroppable({ id: "pool" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: setNodeRef, className: cn(
    "rounded-xl transition-all",
    isReturning && isOver && "ring-2 ring-amber-400 ring-offset-1",
    isReturning && !isOver && "ring-2 ring-amber-200 ring-offset-1"
  ), children });
}
const REQ_FIELDS = [
  { label: "Tractors", k: "tractors" },
  { label: "Implements", k: "implements" },
  { label: "Vehicles", k: "vehicles" },
  { label: "Sprayers", k: "sprayers" },
  { label: "Trailers", k: "trailers" },
  { label: "Staff", k: "staff" }
];
function PlannerTaskCard({
  task,
  allocations,
  onRemoveAllocation,
  farmId,
  onReqsUpdated
}) {
  const [showEdit, setShowEdit] = reactExports.useState(false);
  const [reqs, setReqs] = reactExports.useState({
    tractors: task.req_tractors,
    implements: task.req_implements,
    vehicles: task.req_vehicles,
    sprayers: task.req_sprayers,
    trailers: task.req_trailers,
    staff: task.req_staff
  });
  const [others, setOthers] = reactExports.useState(() => {
    if (task.req_other_notes.length > 0) return [...task.req_other_notes];
    if (task.req_other > 0) return Array(task.req_other).fill("");
    return [];
  });
  const [materials, setMaterials] = reactExports.useState(
    () => task.req_materials.map((m) => ({ name: m.name, quantity: String(m.quantity || ""), unit: m.unit }))
  );
  const updateMut = useMutation({
    mutationFn: () => {
      const endpoint = task.source === "assignment" ? `/api/farms/${farmId}/task-assignments/${task.id}` : `/api/farms/${farmId}/planner-events/${task.id}`;
      return fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reqTractors: reqs.tractors,
          reqImplements: reqs.implements,
          reqVehicles: reqs.vehicles,
          reqSprayers: reqs.sprayers,
          reqTrailers: reqs.trailers,
          reqStaff: reqs.staff,
          reqOther: others.length,
          reqOtherNotes: others,
          reqMaterials: materials.filter((m) => m.name.trim()).map((m) => ({ name: m.name.trim(), quantity: parseFloat(m.quantity) || 0, unit: m.unit.trim() }))
        })
      }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      }).then((r) => r.json());
    },
    onSuccess: () => {
      toast({ title: "Requirements updated" });
      setShowEdit(false);
      onReqsUpdated();
    },
    onError: () => toast({ title: "Failed to update requirements", variant: "destructive" })
  });
  const dateLabel = task.due_date ? (/* @__PURE__ */ new Date(task.due_date + "T12:00:00")).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) : "No date";
  const totalReqs = REQ_TYPE_MAP.reduce((sum, { key: key2 }) => sum + (Number(task[key2]) || 0), 0);
  const hasResourceReqs = totalReqs > 0;
  const hasMaterials = task.req_materials.length > 0;
  const hasRequirements = hasResourceReqs || hasMaterials;
  function openEdit() {
    setReqs({
      tractors: task.req_tractors,
      implements: task.req_implements,
      vehicles: task.req_vehicles,
      sprayers: task.req_sprayers,
      trailers: task.req_trailers,
      staff: task.req_staff
    });
    setOthers(task.req_other_notes.length > 0 ? [...task.req_other_notes] : task.req_other > 0 ? Array(task.req_other).fill("") : []);
    setMaterials(task.req_materials.map((m) => ({ name: m.name, quantity: String(m.quantity || ""), unit: m.unit })));
    setShowEdit((e) => !e);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-white shadow-sm overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-3.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("w-1 self-stretch rounded-full flex-shrink-0", getColourBg(task.colour)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm text-foreground leading-snug", children: task.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-0.5 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-foreground/50 font-medium", children: dateLabel }),
              task.staff_name && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-foreground/40", children: [
                "→ ",
                task.staff_name
              ] }),
              task.estimated_hours && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-0.5 text-[10px] text-foreground/40", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-2.5 h-2.5" }),
                task.estimated_hours,
                "h"
              ] }),
              task.start_time && task.end_time && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-foreground/40", children: [
                task.start_time,
                "–",
                task.end_time
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: openEdit,
                title: hasRequirements ? "Edit requirements" : "Set requirements",
                className: cn(
                  "flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md border transition-colors",
                  showEdit ? "bg-indigo-100 border-indigo-300 text-indigo-700" : hasRequirements ? "border-border text-foreground/40 hover:text-foreground/70 hover:bg-muted" : "border-indigo-200 text-indigo-500 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700"
                ),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-2.5 h-2.5" }),
                  !hasRequirements && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Set requirements" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn(
              "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
              task.source === "assignment" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-indigo-50 text-indigo-700 border border-indigo-200"
            ), children: task.module ?? "Task" })
          ] })
        ] }),
        hasResourceReqs && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2.5 flex flex-wrap gap-1.5", children: REQ_TYPE_MAP.flatMap(({ key: key2, type }) => {
          const count = Number(task[key2]) || 0;
          if (count === 0) return [];
          const typeAllocs = allocations.filter((a) => a.resource_type === type);
          return Array.from({ length: count }, (_, i) => {
            const alloc = typeAllocs[i];
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              RequirementSlot,
              {
                id: `slot:${task.taskRef}:${type}:${i}:${task.due_date}`,
                type,
                filled: !!alloc,
                filledWith: alloc,
                onRemove: alloc ? () => onRemoveAllocation(alloc.id) : void 0
              },
              `${task.taskRef}:${type}:${i}`
            );
          });
        }) }),
        hasMaterials && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex flex-wrap gap-1", children: task.req_materials.filter((m) => m.name).map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5 font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-2.5 h-2.5" }),
          m.quantity ? `${m.quantity}${m.unit ? " " + m.unit : ""} ` : "",
          m.name
        ] }, i)) })
      ] })
    ] }),
    showEdit && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border/50 bg-muted/20 px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-bold uppercase tracking-wider text-foreground/40 mb-2.5", children: "How many of each resource does this task need?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-1.5 mb-3", children: REQ_FIELDS.map(({ label, k }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 bg-white rounded-lg border border-border/70 px-2.5 py-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-medium text-foreground/60", children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setReqs((r) => ({ ...r, [k]: Math.max(0, r[k] - 1) })),
              className: "w-5 h-5 rounded border border-border hover:bg-muted transition-colors text-sm font-bold text-foreground/50 flex items-center justify-center",
              children: "−"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold w-4 text-center tabular-nums", children: reqs[k] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setReqs((r) => ({ ...r, [k]: r[k] + 1 })),
              className: "w-5 h-5 rounded border border-border hover:bg-muted transition-colors text-sm font-bold text-foreground/50 flex items-center justify-center",
              children: "+"
            }
          )
        ] })
      ] }, k)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border/40 pt-2.5 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-bold uppercase tracking-wider text-foreground/40", children: "Other resources" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setOthers((o) => [...o, ""]),
              className: "flex items-center gap-0.5 text-[10px] font-semibold text-indigo-500 hover:text-indigo-700 transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3 h-3" }),
                "Add"
              ]
            }
          )
        ] }),
        others.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-foreground/30 italic", children: "None — click Add to note any other resource needed (e.g. water bowser, generator)." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: others.map((desc, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: desc,
              onChange: (e) => setOthers((o) => o.map((d, j) => j === i ? e.target.value : d)),
              placeholder: "e.g. Water bowser, generator, fuel bowser…",
              className: "flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-indigo-300 bg-white"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setOthers((o) => o.filter((_, j) => j !== i)),
              className: "w-6 h-6 flex items-center justify-center text-foreground/30 hover:text-red-500 transition-colors flex-shrink-0",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" })
            }
          )
        ] }, i)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border/40 pt-2.5 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-bold uppercase tracking-wider text-foreground/40", children: "Materials needed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setMaterials((m) => [...m, { name: "", quantity: "", unit: "" }]),
              className: "flex items-center gap-0.5 text-[10px] font-semibold text-blue-500 hover:text-blue-700 transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3 h-3" }),
                "Add"
              ]
            }
          )
        ] }),
        materials.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-foreground/30 italic", children: "None — click Add to record materials needed (e.g. herbicide, fertiliser, fuel)." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          materials.map((mat, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: mat.name,
                onChange: (e) => setMaterials((m) => m.map((v, j) => j === i ? { ...v, name: e.target.value } : v)),
                placeholder: "Product / material name",
                className: "flex-1 min-w-0 text-xs px-2.5 py-1.5 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                value: mat.quantity,
                min: "0",
                step: "any",
                onChange: (e) => setMaterials((m) => m.map((v, j) => j === i ? { ...v, quantity: e.target.value } : v)),
                placeholder: "Qty",
                className: "w-14 text-xs px-2 py-1.5 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white text-center"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: mat.unit,
                onChange: (e) => setMaterials((m) => m.map((v, j) => j === i ? { ...v, unit: e.target.value } : v)),
                placeholder: "Unit",
                list: "mat-units",
                className: "w-14 text-xs px-2 py-1.5 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setMaterials((m) => m.filter((_, j) => j !== i)),
                className: "w-6 h-6 flex items-center justify-center text-foreground/30 hover:text-red-500 transition-colors flex-shrink-0",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" })
              }
            )
          ] }, i)),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("datalist", { id: "mat-units", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "L" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ml" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "kg" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "g" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "t" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "bags" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "bales" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "cans" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "drums" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "pallets" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "rolls" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "m" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => updateMut.mutate(),
            disabled: updateMut.isPending,
            className: "flex-1 text-xs font-semibold py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors",
            children: updateMut.isPending ? "Saving…" : "Save requirements"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setShowEdit(false),
            className: "text-xs font-semibold py-1.5 px-3 rounded-lg border border-border hover:bg-muted transition-colors",
            children: "Cancel"
          }
        )
      ] })
    ] })
  ] });
}
function PinchPointPanel({ pinchPoints, hasTasksWithReqs }) {
  const [dismissed, setDismissed] = reactExports.useState(false);
  const [expanded, setExpanded] = reactExports.useState(true);
  if (dismissed) return null;
  if (pinchPoints.length === 0) {
    if (!hasTasksWithReqs) return null;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-green-200 bg-green-50/70", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SquareCheckBig, { className: "w-4 h-4 text-green-500 flex-shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-700 font-medium flex-1", children: "No pinch points this week — your available resources cover all task requirements." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDismissed(true), className: "text-green-400 hover:text-green-600 transition-colors flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" }) })
    ] });
  }
  const byDate = /* @__PURE__ */ new Map();
  for (const pp of pinchPoints) {
    if (!byDate.has(pp.date)) byDate.set(pp.date, []);
    byDate.get(pp.date).push(pp);
  }
  const fmtDate = (iso) => (/* @__PURE__ */ new Date(iso + "T12:00:00")).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-amber-200 bg-amber-50/40 overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex items-start gap-3 p-4", expanded && "pb-2"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-bold text-amber-800", children: [
          pinchPoints.length,
          " resource pinch point",
          pinchPoints.length !== 1 ? "s" : "",
          " this week"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-amber-700/80 mt-0.5 leading-relaxed", children: "A pinch point is where tasks on the same day need more of a resource than you have available — tasks may not run as planned." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-0.5 flex-shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setExpanded((e) => !e),
            className: "w-6 h-6 flex items-center justify-center rounded-md hover:bg-amber-100 transition-colors text-amber-500",
            title: expanded ? "Collapse" : "Expand",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: cn("w-3.5 h-3.5 transition-transform", !expanded && "-rotate-90") })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setDismissed(true),
            className: "w-6 h-6 flex items-center justify-center rounded-md hover:bg-amber-100 transition-colors text-amber-400",
            title: "Dismiss for this session",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" })
          }
        )
      ] })
    ] }),
    expanded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-4 space-y-3", children: [
      Array.from(byDate).map(([date, pps]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1.5", children: fmtDate(date) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: pps.map((pp, i) => {
          const rt = RESOURCE_TYPES.find((r) => r.value === pp.type);
          const Icon = rt?.icon ?? Package;
          const label = rt?.label ?? pp.type;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2.5 bg-white/70 rounded-lg border border-amber-200 px-3 py-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] font-semibold text-foreground leading-snug", children: [
                pp.demand,
                " ",
                label.toLowerCase(),
                pp.demand !== 1 ? "s" : "",
                " needed · ",
                pp.supply === 0 ? "none registered" : `only ${pp.supply} available`,
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-red-600 ml-1.5 font-bold", children: [
                  pp.shortage,
                  " short"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-foreground/55 mt-1 leading-relaxed", children: pp.supply === 0 ? `You haven't added any ${label.toLowerCase()}s yet. Go to the Resources tab to register them.` : pp.shortage === 1 ? `You're one ${label.toLowerCase()} short on this day. Try spreading tasks across more days, or add another ${label.toLowerCase()} in Resources.` : `You're ${pp.shortage} ${label.toLowerCase()}s short. Consider moving some tasks to quieter days, or register additional resources.` })
            ] })
          ] }, i);
        }) })
      ] }, date)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-amber-600/70 leading-relaxed border-t border-amber-200/60 pt-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Tip:" }),
        " Add or update resources in the ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Resources" }),
        " tab, or adjust task dates in ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Field Tasks" }),
        " or ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Week Ahead" }),
        " to spread demand more evenly."
      ] })
    ] })
  ] });
}
function MaterialWeeklySummary({ weekMaterials }) {
  const [dismissed, setDismissed] = reactExports.useState(false);
  const [expanded, setExpanded] = reactExports.useState(true);
  if (dismissed || weekMaterials.size === 0) return null;
  const entries = Array.from(weekMaterials.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  const totalTasks = new Set(entries.flatMap(([, { tasks }]) => tasks)).size;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-blue-200 bg-blue-50/40 overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex items-start gap-3 p-4", expanded && "pb-2"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold text-blue-800", children: "Materials needed this week" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-blue-700/80 mt-0.5", children: [
          entries.length,
          " material",
          entries.length !== 1 ? "s" : "",
          " across ",
          totalTasks,
          " task",
          totalTasks !== 1 ? "s" : "",
          " — use this as your preparation checklist."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-0.5 flex-shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setExpanded((e) => !e),
            className: "w-6 h-6 flex items-center justify-center rounded-md hover:bg-blue-100 transition-colors text-blue-500",
            title: expanded ? "Collapse" : "Expand",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: cn("w-3.5 h-3.5 transition-transform", !expanded && "-rotate-90") })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setDismissed(true),
            className: "w-6 h-6 flex items-center justify-center rounded-md hover:bg-blue-100 transition-colors text-blue-400",
            title: "Dismiss",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" })
          }
        )
      ] })
    ] }),
    expanded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-1.5 mb-2.5", children: entries.map(([name, { total, unit, tasks }]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white/70 rounded-lg border border-blue-200 px-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-semibold text-foreground capitalize leading-tight", children: name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-bold text-blue-700 mt-0.5", children: [
          Number.isInteger(total) ? total : parseFloat(total.toFixed(3)),
          unit ? ` ${unit}` : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-foreground/40 mt-0.5", children: [
          tasks.length,
          " task",
          tasks.length !== 1 ? "s" : "",
          tasks.length <= 2 ? ` (${tasks.slice(0, 2).join(", ")})` : ""
        ] })
      ] }, name)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-blue-600/70 leading-relaxed border-t border-blue-200/60 pt-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Tip:" }),
        " Quantities are totalled from what's entered on each task card. Check your chemical store, fuel, and other stocks before the week begins."
      ] })
    ] })
  ] });
}
function exportPlannerCSV(weekLabel, tasks, allocations) {
  const rows = [["Date", "Task", "Tractors Req", "Implements Req", "Vehicles Req", "Sprayers Req", "Trailers Req", "Staff Req", "Allocated Resources", "Materials"]];
  for (const t of tasks) {
    const taskAllocs = allocations.filter((a2) => a2.task_ref === t.taskRef).map((a2) => a2.resource_name ?? a2.resource_id).join("; ");
    const mats = t.req_materials.filter((m) => m.name).map((m) => `${m.quantity} ${m.unit} ${m.name}`).join("; ");
    rows.push([t.due_date, t.title, String(t.req_tractors || 0), String(t.req_implements || 0), String(t.req_vehicles || 0), String(t.req_sprayers || 0), String(t.req_trailers || 0), String(t.req_staff || 0), taskAllocs, mats]);
  }
  const csv = "\uFEFF" + rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `week-plan-${weekLabel.replace(/[^a-z0-9]/gi, "-")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
function PlannerTab({ farmId, resources }) {
  const queryClient = useQueryClient();
  const [weekBase, setWeekBase] = reactExports.useState(() => weekStart(/* @__PURE__ */ new Date()));
  const [activeDrag, setActiveDrag] = reactExports.useState(null);
  const [poolFilter, setPoolFilter] = reactExports.useState(null);
  const jumpRef = reactExports.useRef(null);
  const fromDate = isoDate(weekBase);
  isoDate(addDays(weekBase, 6));
  const { data, isLoading, isError } = useQuery({
    queryKey: ["resource-planner", farmId, fromDate],
    queryFn: () => fetch(`/api/farms/${farmId}/resource-planner?from=${fromDate}&days=7`).then((r) => r.json())
  });
  const allocateMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/task-resource-allocations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resource-planner", farmId, fromDate] }),
    onError: () => toast({ title: "Failed to assign resource", variant: "destructive" })
  });
  const removeMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/task-resource-allocations/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resource-planner", farmId, fromDate] }),
    onError: () => toast({ title: "Failed to remove allocation", variant: "destructive" })
  });
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const tasks = data?.tasks ?? [];
  const allocations = data?.allocations ?? [];
  const committedIds = reactExports.useMemo(() => new Set(allocations.map((a) => a.resource_id)), [allocations]);
  const byDate = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    for (const t of tasks) {
      const d = t.due_date;
      if (!m.has(d)) m.set(d, []);
      m.get(d).push(t);
    }
    return m;
  }, [tasks]);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekBase, i);
    return { date: d, iso: isoDate(d) };
  });
  function handleDragStart(event) {
    const data2 = event.active.data.current;
    setActiveDrag(data2);
  }
  function handleDragEnd(event) {
    setActiveDrag(null);
    const { active, over } = event;
    if (!over) return;
    const overId = String(over.id);
    const dragData = active.data.current;
    if (!dragData) return;
    if (overId === "pool") {
      if (dragData.isReturn && dragData.allocationId != null) {
        removeMut.mutate(dragData.allocationId);
      }
      return;
    }
    if (!overId.startsWith("slot:")) return;
    const [, taskRef, slotType, , allocDate] = overId.split(":");
    if (dragData.resourceType !== slotType) {
      toast({
        title: "Type mismatch",
        description: `This slot requires a ${getTypeInfo(slotType).label.toLowerCase()}`,
        variant: "destructive"
      });
      return;
    }
    if (!dragData.resourceId) return;
    const task = tasks.find((t) => t.taskRef === taskRef);
    allocateMut.mutate({
      resourceId: dragData.resourceId,
      taskRef,
      taskTitle: task?.title ?? null,
      allocatedDate: allocDate,
      taskAssignmentId: taskRef.startsWith("assign-") ? Number(taskRef.replace("assign-", "")) : null
    });
  }
  const activeResources = resources.filter((r) => r.isActive);
  const supplyByType = reactExports.useMemo(() => {
    const m = {};
    for (const r of activeResources) m[r.type] = (m[r.type] || 0) + 1;
    return m;
  }, [activeResources]);
  const demandByDayType = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    for (const t of tasks) {
      if (!m.has(t.due_date)) m.set(t.due_date, {});
      const day = m.get(t.due_date);
      for (const { key: key2, type } of REQ_TYPE_MAP) {
        const n = Number(t[key2]) || 0;
        if (n > 0) day[type] = (day[type] || 0) + n;
      }
    }
    return m;
  }, [tasks]);
  const peakDemandByType = reactExports.useMemo(() => {
    const m = {};
    for (const [, dayMap] of demandByDayType)
      for (const [type, n] of Object.entries(dayMap))
        m[type] = Math.max(m[type] || 0, n);
    return m;
  }, [demandByDayType]);
  const pinchPoints = reactExports.useMemo(() => {
    const pp = [];
    for (const [date, dayMap] of demandByDayType) {
      for (const [type, demand] of Object.entries(dayMap)) {
        const supply = supplyByType[type] || 0;
        if (demand > supply) pp.push({ date, type, demand, supply, shortage: demand - supply });
      }
    }
    return pp.sort((a, b) => a.date.localeCompare(b.date) || a.type.localeCompare(b.type));
  }, [demandByDayType, supplyByType]);
  const weekMaterials = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    for (const t of tasks) {
      for (const mat of t.req_materials) {
        if (!mat.name.trim()) continue;
        const qty = Number(mat.quantity) || 0;
        const key2 = mat.name.trim().toLowerCase();
        if (!m.has(key2)) m.set(key2, { total: 0, unit: mat.unit || "", tasks: [] });
        const entry = m.get(key2);
        entry.total += qty;
        if (!entry.tasks.includes(t.title)) entry.tasks.push(t.title);
      }
    }
    return m;
  }, [tasks]);
  const weekLabel = (() => {
    const endOfWeek = addDays(weekBase, 6);
    const fmt = (d) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    return `${fmt(weekBase)} – ${fmt(endOfWeek)}`;
  })();
  const totalTasks = tasks.length;
  const tasksWithReqs = tasks.filter((t) => REQ_TYPE_MAP.some(({ key: key2 }) => Number(t[key2]) > 0)).length;
  const totalSlots = tasks.reduce((s, t) => s + REQ_TYPE_MAP.reduce((ts, { key: key2 }) => ts + (Number(t[key2]) || 0), 0), 0);
  const filledSlots = allocations.length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DndContext, { sensors, onDragStart: handleDragStart, onDragEnd: handleDragEnd, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setWeekBase((w) => addDays(w, -7)), className: "w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "w-4 h-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setWeekBase(weekStart(/* @__PURE__ */ new Date())), className: "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "w-3.5 h-3.5" }),
            "Today"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setWeekBase((w) => addDays(w, 7)), className: "w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-foreground ml-1", children: weekLabel }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative ml-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => jumpRef.current?.showPicker?.(),
                className: "flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-foreground/50",
                title: "Jump to date",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarRange, { className: "w-3.5 h-3.5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Jump to" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                ref: jumpRef,
                type: "date",
                className: "absolute inset-0 opacity-0 w-full h-full cursor-pointer",
                onChange: (e) => {
                  if (e.target.value) {
                    setWeekBase(weekStart(/* @__PURE__ */ new Date(e.target.value + "T12:00:00")));
                    e.target.value = "";
                  }
                }
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-xs text-foreground/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            totalTasks,
            " task",
            totalTasks !== 1 ? "s" : ""
          ] }),
          totalSlots > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cn("font-semibold", filledSlots === totalSlots ? "text-green-600" : "text-amber-600"), children: [
            filledSlots,
            "/",
            totalSlots,
            " slots filled"
          ] }),
          tasks.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => exportPlannerCSV(weekLabel, tasks, allocations),
              className: "flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-foreground/60",
              title: "Export week plan to CSV",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "w-3.5 h-3.5" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Export CSV" })
              ]
            }
          )
        ] })
      ] }),
      isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-16 text-foreground/40 text-sm", children: "Loading planner data…" }),
      isError && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6 border-red-200 bg-red-50/40 flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-5 h-5 text-red-500 flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-700", children: "Failed to load planner data. The API may still be restarting." })
      ] }),
      !isLoading && !isError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 items-start", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 space-y-4", children: [
          activeResources.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4 border-amber-200 bg-amber-50/40 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4 text-amber-500 flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-700", children: "Add resources in the Resources tab before assigning them to tasks." })
          ] }),
          tasksWithReqs === 0 && tasks.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4 border-indigo-200 bg-indigo-50/40 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4 text-indigo-400 flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-indigo-700", children: [
              "None of this week's tasks have resource requirements set. Click the ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Set requirements" }),
              " button on any task card below to add them."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(PinchPointPanel, { pinchPoints, hasTasksWithReqs: tasksWithReqs > 0 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(MaterialWeeklySummary, { weekMaterials }),
          tasks.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-12 text-center text-foreground/40 text-sm", children: "No tasks this week." }),
          days.map(({ date, iso }) => {
            const dayTasks = byDate.get(iso) ?? [];
            if (dayTasks.length === 0) return null;
            const dayLabel = date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });
            const isToday = iso === isoDate(/* @__PURE__ */ new Date());
            const dayPinches = pinchPoints.filter((pp) => pp.date === iso);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex items-center gap-2 mb-2 flex-wrap"), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("text-xs font-bold", isToday ? "text-indigo-600" : "text-foreground/50"), children: dayLabel }),
                isToday && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700", children: "TODAY" }),
                dayPinches.map((pp) => {
                  const rt = RESOURCE_TYPES.find((r) => r.value === pp.type);
                  const Icon = rt?.icon ?? Package;
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "span",
                    {
                      title: `${rt?.label ?? pp.type}: ${pp.demand} needed, ${pp.supply} available`,
                      className: "flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-2.5 h-2.5" }),
                        pp.shortage,
                        " short"
                      ]
                    },
                    pp.type
                  );
                })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: dayTasks.map((task) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                PlannerTaskCard,
                {
                  task,
                  allocations: allocations.filter((a) => a.task_ref === task.taskRef),
                  onRemoveAllocation: (id) => removeMut.mutate(id),
                  farmId,
                  onReqsUpdated: () => queryClient.invalidateQueries({ queryKey: ["resource-planner", farmId, fromDate] })
                },
                task.taskRef
              )) })
            ] }, iso);
          })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-56 flex-shrink-0 sticky top-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DroppablePoolZone, { isReturning: !!activeDrag?.isReturn, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4 border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-xs text-foreground/60 uppercase tracking-wider", children: "Resources" }),
            poolFilter && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setPoolFilter(null), className: "text-[10px] text-foreground/40 hover:text-foreground flex items-center gap-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3 h-3" }),
              " All"
            ] })
          ] }),
          activeResources.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1 mb-3", children: RESOURCE_TYPES.filter((rt) => activeResources.some((r) => r.type === rt.value)).map((rt) => {
            const Icon = rt.icon;
            const active = poolFilter === rt.value;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => setPoolFilter(active ? null : rt.value),
                className: cn(
                  "flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full border transition-colors",
                  active ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground/50 hover:bg-muted"
                ),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-2.5 h-2.5" }),
                  rt.label
                ]
              },
              rt.value
            );
          }) }),
          activeResources.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/40 italic", children: "No resources added yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: RESOURCE_TYPES.map((rt) => {
            if (poolFilter && poolFilter !== rt.value) return null;
            const typeResources = activeResources.filter((r) => r.type === rt.value);
            if (typeResources.length === 0) return null;
            const supply = typeResources.length;
            const peak = peakDemandByType[rt.value] || 0;
            const isPinched = peak > supply;
            const isExact = peak > 0 && peak === supply;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-bold uppercase tracking-wider text-foreground/40", children: rt.label }),
                peak > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cn(
                  "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                  isPinched ? "bg-red-100 text-red-600 border border-red-200" : isExact ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-green-100 text-green-700 border border-green-200"
                ), children: [
                  supply,
                  "/",
                  peak,
                  " needed"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: typeResources.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                DraggableResourceChip,
                {
                  resource: r,
                  isCommitted: committedIds.has(r.id)
                },
                r.id
              )) })
            ] }, rt.value);
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 pt-3 border-t border-border/40", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-foreground/40 leading-relaxed", children: "Drag a resource onto an empty slot to assign it. Drag an assigned resource back here to unassign it." }) })
        ] }) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DragOverlay, { children: activeDrag && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(
      "flex items-center gap-2 rounded-lg border shadow-lg px-2.5 py-1.5 text-xs font-medium text-foreground cursor-grabbing",
      activeDrag.isReturn ? "border-amber-300 bg-amber-50" : "border-indigo-300 bg-white"
    ), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(GripVertical, { className: cn("w-3 h-3", activeDrag.isReturn ? "text-amber-400" : "text-indigo-400") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: activeDrag.resourceName }),
      activeDrag.isReturn && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-amber-600 ml-0.5", children: "→ unassign" })
    ] }) })
  ] });
}
function ResourcesPage() {
  const { farmId } = useAppStore();
  if (!farmId) return /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { href: "/select" });
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = usePersistedTab({ page: "resources", farmId, validIds: ["resources", "planner", "status", "analytics"], defaultTab: "resources" });
  const [showArchived, setShowArchived] = reactExports.useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["resources", farmId, showArchived],
    queryFn: () => fetch(`/api/farms/${farmId}/resources?showAll=${showArchived}`).then((r) => r.json())
  });
  const archiveMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/resources/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources", farmId] });
      toast({ title: "Resource archived" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const restoreMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/resources/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: true })
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources", farmId] });
      toast({ title: "Resource restored" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const resources = data?.resources ?? [];
  const totalActive = resources.filter((r) => r.isActive).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Resource Planner", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 max-w-5xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-between gap-4 flex-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/50 mt-0.5", children: "Manage your farm's resources and assign them to tasks week-by-week." }),
      totalActive > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/40 mt-1", children: [
        totalActive,
        " active resource",
        totalActive !== 1 ? "s" : ""
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1 border-b border-border overflow-x-auto", children: ["resources", "planner", "status", "analytics"].map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => setActiveTab(tab),
        className: cn(
          "pb-2.5 px-4 text-sm font-semibold border-b-2 transition-colors -mb-px whitespace-nowrap flex items-center gap-1.5",
          activeTab === tab ? "border-primary text-primary" : "border-transparent text-foreground/50 hover:text-foreground"
        ),
        children: tab === "resources" ? "Resources" : tab === "planner" ? "Planner" : tab === "status" ? "Planning Status" : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartNoAxesColumn, { className: "w-3.5 h-3.5" }),
          "Analytics"
        ] })
      },
      tab
    )) }),
    activeTab === "resources" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      ResourcesTabSimple,
      {
        farmId,
        resources,
        isLoading,
        showArchived,
        setShowArchived,
        onArchive: archiveMut.mutate,
        onRestore: restoreMut.mutate,
        onInvalidate: () => queryClient.invalidateQueries({ queryKey: ["resources", farmId] })
      }
    ) : activeTab === "planner" ? /* @__PURE__ */ jsxRuntimeExports.jsx(PlannerTab, { farmId, resources: resources.filter((r) => r.isActive) }) : activeTab === "status" ? /* @__PURE__ */ jsxRuntimeExports.jsx(PlanningStatusTab, { farmId }) : /* @__PURE__ */ jsxRuntimeExports.jsx(AnalyticsTab, { farmId, resources })
  ] }) });
}
function ResourcesTabSimple({ farmId, resources, isLoading, showArchived, setShowArchived, onArchive, onRestore, onInvalidate }) {
  const [showForm, setShowForm] = reactExports.useState(false);
  const [editingResource, setEditingResource] = reactExports.useState(null);
  const [resSearch, setResSearch] = reactExports.useState("");
  const createMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/resources`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      onInvalidate();
      setShowForm(false);
      toast({ title: "Resource added" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const updateMut = useMutation({
    mutationFn: ({ id, ...body }) => fetch(`/api/farms/${farmId}/resources/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      onInvalidate();
      setEditingResource(null);
      toast({ title: "Resource updated" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const q = resSearch.trim().toLowerCase();
  const filteredResources = q ? resources.filter((r) => r.name.toLowerCase().includes(q) || (r.description ?? "").toLowerCase().includes(q)) : resources;
  const grouped = /* @__PURE__ */ new Map();
  for (const r of filteredResources) {
    if (!grouped.has(r.type)) grouped.set(r.type, []);
    grouped.get(r.type).push(r);
  }
  const sortedGroups = [...grouped.entries()].sort(
    (a, b) => RESOURCE_TYPES.findIndex((t) => t.value === a[0]) - RESOURCE_TYPES.findIndex((t) => t.value === b[0])
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ImportPanel, { farmId, onImported: onInvalidate }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 max-w-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40 pointer-events-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            placeholder: "Search resources…",
            value: resSearch,
            onChange: (e) => setResSearch(e.target.value),
            className: "w-full pl-8 pr-3 py-1.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary/40"
          }
        ),
        resSearch && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setResSearch(""), className: "absolute right-2 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => {
            setShowForm(true);
            setEditingResource(null);
          },
          className: "flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
            "Add resource"
          ]
        }
      )
    ] }),
    showForm && !editingResource && /* @__PURE__ */ jsxRuntimeExports.jsx(
      ResourceForm,
      {
        onSave: (data) => createMut.mutate(data),
        onCancel: () => setShowForm(false),
        isPending: createMut.isPending
      }
    ),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-12 text-center text-foreground/40 text-sm", children: "Loading resources…" }) : resources.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-12 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground/40 text-sm", children: "No resources yet." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/30 mt-1", children: "Add tractors, implements, vehicles, staff and more above." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: sortedGroups.map(([type, group]) => {
      const { label } = getTypeInfo(type);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-bold uppercase tracking-wider text-foreground/40 mb-2", children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3", children: group.map(
          (r) => editingResource?.id === r.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            ResourceForm,
            {
              initial: r,
              onSave: (data) => updateMut.mutate({ id: r.id, ...data }),
              onCancel: () => setEditingResource(null),
              isPending: updateMut.isPending
            },
            r.id
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            ResourceCard,
            {
              resource: r,
              onEdit: setEditingResource,
              onArchive,
              onRestore
            },
            r.id
          )
        ) })
      ] }, type);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => setShowArchived(!showArchived),
        className: cn("text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors", showArchived ? "border-foreground/30 bg-muted text-foreground" : "border-border text-foreground/50 hover:bg-muted"),
        children: showArchived ? "Hide archived" : "Show archived"
      }
    ) })
  ] });
}
function ActualCompletionModal({
  event,
  farmId,
  onClose,
  onSaved
}) {
  const [form, setForm] = reactExports.useState(() => ({
    actualDate: event.actualDate ?? event.eventDate.slice(0, 10),
    actualTractors: event.actualTractors || event.reqTractors,
    actualImplements: event.actualImplements || event.reqImplements,
    actualVehicles: event.actualVehicles || event.reqVehicles,
    actualSprayers: event.actualSprayers || event.reqSprayers,
    actualTrailers: event.actualTrailers || event.reqTrailers,
    actualStaff: event.actualStaff || event.reqStaff,
    actualMaterials: parseSafe(event.actualMaterials).length ? parseSafe(event.actualMaterials) : parseSafe(event.reqMaterials).map((m) => ({ ...m })),
    actualNotes: event.actualNotes ?? "",
    actualStatus: event.actualStatus ?? "completed"
  }));
  const mut = useMutation({
    mutationFn: (data) => fetch(`/api/farms/${farmId}/planner-events/${event.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, actualMaterials: data.actualMaterials })
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Actuals recorded ✓" });
      onSaved();
      onClose();
    },
    onError: () => toast({ title: "Failed to save actuals", variant: "destructive" })
  });
  const clearMut = useMutation({
    mutationFn: () => fetch(`/api/farms/${farmId}/planner-events/${event.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clearActuals: true })
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Actuals cleared" });
      onSaved();
      onClose();
    },
    onError: () => toast({ title: "Failed to clear actuals", variant: "destructive" })
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const fmtPlanned = (n) => n > 0 ? String(n) : "—";
  const resourceFields = [
    { key: "actualTractors", label: "Tractors", planned: event.reqTractors },
    { key: "actualImplements", label: "Implements", planned: event.reqImplements },
    { key: "actualVehicles", label: "Vehicles", planned: event.reqVehicles },
    { key: "actualSprayers", label: "Sprayers", planned: event.reqSprayers },
    { key: "actualTrailers", label: "Trailers", planned: event.reqTrailers },
    { key: "actualStaff", label: "Staff", planned: event.reqStaff }
  ].filter((f) => f.planned > 0 || form[f.key] > 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4", onClick: (e) => {
    if (e.target === e.currentTarget) onClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky top-0 bg-background border-b border-border px-6 py-4 flex items-start justify-between gap-3 rounded-t-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-bold", children: "Record Actuals" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/50 mt-0.5", children: event.title })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "text-foreground/40 hover:text-foreground mt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-5 space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-foreground/60 uppercase tracking-wider block mb-2", children: "Outcome" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 flex-wrap", children: ["completed", "partial", "abandoned"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => set("actualStatus", s),
            className: cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
              form.actualStatus === s ? s === "completed" ? "bg-green-600 text-white border-green-600" : s === "partial" ? "bg-amber-500 text-white border-amber-500" : "bg-red-500 text-white border-red-500" : "border-border text-foreground/50 hover:bg-muted"
            ),
            children: s === "completed" ? "✓ Completed" : s === "partial" ? "⚡ Partial" : "✕ Abandoned"
          },
          s
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs font-semibold text-foreground/60 uppercase tracking-wider block mb-2", children: [
          "Actual date ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "normal-case font-normal text-foreground/40", children: [
            "(planned: ",
            new Date(event.eventDate).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }),
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "date",
            value: form.actualDate,
            onChange: (e) => set("actualDate", e.target.value),
            className: "border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary/40 w-48"
          }
        )
      ] }),
      resourceFields.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-foreground/60 uppercase tracking-wider block mb-2", children: "Resources used" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3", children: resourceFields.map((f) => {
          const actual = form[f.key];
          const delta = actual - f.planned;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs text-foreground/50 mb-1 block", children: [
              f.label,
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground/30", children: [
                "(planned: ",
                fmtPlanned(f.planned),
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "number",
                  min: "0",
                  value: actual,
                  onChange: (e) => set(f.key, Number(e.target.value)),
                  className: "w-16 border border-border rounded px-2 py-1 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary/40 text-center"
                }
              ),
              delta !== 0 && f.planned > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("text-[10px] font-bold", delta > 0 ? "text-red-500" : "text-green-600"), children: delta > 0 ? `+${delta}` : delta })
            ] })
          ] }, f.key);
        }) })
      ] }),
      form.actualMaterials.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-foreground/60 uppercase tracking-wider block mb-2", children: "Materials used" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: form.actualMaterials.map((m, i) => {
          const planned = parseSafe(event.reqMaterials)[i];
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 text-foreground/70", children: m.name || `Item ${i + 1}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                min: "0",
                step: "0.01",
                value: m.quantity,
                onChange: (e) => setForm((f) => {
                  const mats = [...f.actualMaterials];
                  mats[i] = { ...mats[i], quantity: Number(e.target.value) };
                  return { ...f, actualMaterials: mats };
                }),
                className: "w-20 border border-border rounded px-2 py-1 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary/40 text-center"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/50 text-xs", children: m.unit }),
            planned && Number(m.quantity) !== Number(planned.quantity) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("text-[10px] font-bold", Number(m.quantity) > Number(planned.quantity) ? "text-red-500" : "text-green-600"), children: Number(m.quantity) > Number(planned.quantity) ? `+${(Number(m.quantity) - Number(planned.quantity)).toFixed(2)}` : (Number(m.quantity) - Number(planned.quantity)).toFixed(2) })
          ] }, i);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-foreground/60 uppercase tracking-wider block mb-2", children: "Notes / deviation reason" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            value: form.actualNotes,
            onChange: (e) => set("actualNotes", e.target.value),
            placeholder: "e.g. Weather delay, additional resource required due to wet ground conditions…",
            rows: 3,
            className: "w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky bottom-0 bg-background border-t border-border px-6 py-4 flex items-center justify-between gap-3 rounded-b-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: event.actualStatus && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => clearMut.mutate(),
          disabled: clearMut.isPending,
          className: "text-xs text-foreground/40 hover:text-red-500 transition-colors disabled:opacity-40",
          children: "Clear actuals"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors", children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => mut.mutate(form),
            disabled: mut.isPending,
            className: "px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40",
            children: mut.isPending ? "Saving…" : "Save actuals"
          }
        )
      ] })
    ] })
  ] }) });
}
function parseSafe(s) {
  if (!s) return [];
  try {
    return JSON.parse(s);
  } catch {
    return [];
  }
}
function getPlanningStatus(e) {
  if (e.reqCommitted) return "committed";
  const hasReqs = e.reqTractors > 0 || e.reqImplements > 0 || e.reqVehicles > 0 || e.reqSprayers > 0 || e.reqTrailers > 0 || e.reqStaff > 0 || e.reqOther > 0;
  const otherNotes = parseSafe(e.reqOtherNotes);
  const materials = parseSafe(e.reqMaterials);
  if (hasReqs || otherNotes.length > 0 || materials.length > 0) return "planned";
  return "not_started";
}
function PlanningStatusTab({ farmId }) {
  const queryClient = useQueryClient();
  const { data: events2 = [], isLoading } = useQuery({
    queryKey: ["planner-events-all", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/planner-events`).then((r) => r.json())
  });
  const commitMut = useMutation({
    mutationFn: ({ id, committed: committed2 }) => fetch(`/api/farms/${farmId}/planner-events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reqCommitted: committed2 })
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["planner-events-all", farmId] });
      toast({ title: vars.committed ? "Task committed ✓" : "Commitment removed" });
    },
    onError: () => toast({ title: "Failed to update task", variant: "destructive" })
  });
  const [dateRange, setDateRange] = reactExports.useState("all");
  const [search, setSearch] = reactExports.useState("");
  const [showPast, setShowPast] = reactExports.useState(false);
  const [showPva, setShowPva] = reactExports.useState(false);
  const [actingOn, setActingOn] = reactExports.useState(null);
  const today = reactExports.useMemo(() => {
    const d = /* @__PURE__ */ new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const cutoff = reactExports.useMemo(() => {
    if (dateRange === "all") return null;
    const d = new Date(today);
    d.setDate(d.getDate() + { "1w": 7, "2w": 14, "4w": 28, "8w": 56 }[dateRange]);
    return d;
  }, [dateRange, today]);
  const sq = search.trim().toLowerCase();
  const allUpcoming = reactExports.useMemo(
    () => events2.filter((e) => new Date(e.eventDate) >= today).sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()),
    [events2, today]
  );
  const upcoming = reactExports.useMemo(
    () => allUpcoming.filter((e) => !cutoff || new Date(e.eventDate) <= cutoff).filter((e) => !sq || e.title.toLowerCase().includes(sq)),
    [allUpcoming, cutoff, sq]
  );
  const past = reactExports.useMemo(
    () => events2.filter((e) => new Date(e.eventDate) < today).filter((e) => !sq || e.title.toLowerCase().includes(sq)).sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()),
    [events2, today, sq]
  );
  const notStarted = upcoming.filter((e) => getPlanningStatus(e) === "not_started");
  const planned = upcoming.filter((e) => getPlanningStatus(e) === "planned");
  const committed = upcoming.filter((e) => getPlanningStatus(e) === "committed");
  const fmtDate = (s) => new Date(s).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  function exportStatusCSV() {
    const rows = [["Date", "Task", "Status", "Requirements", "Committed By", "Committed At"]];
    for (const e of upcoming) {
      const status = getPlanningStatus(e);
      const parts = [];
      if (e.reqTractors > 0) parts.push(`${e.reqTractors} tractors`);
      if (e.reqImplements > 0) parts.push(`${e.reqImplements} implements`);
      if (e.reqVehicles > 0) parts.push(`${e.reqVehicles} vehicles`);
      if (e.reqSprayers > 0) parts.push(`${e.reqSprayers} sprayers`);
      if (e.reqTrailers > 0) parts.push(`${e.reqTrailers} trailers`);
      if (e.reqStaff > 0) parts.push(`${e.reqStaff} staff`);
      rows.push([e.eventDate, e.title, status, parts.join("; "), e.reqCommittedBy ?? "", e.reqCommittedAt ? new Date(e.reqCommittedAt).toLocaleDateString("en-GB") : ""]);
    }
    const csv = "\uFEFF" + rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "planning-status.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-foreground/50 py-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4 animate-spin" }),
      " Loading tasks…"
    ] });
  }
  if (upcoming.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-10 text-center text-sm text-foreground/50", children: "No upcoming planner tasks found. Add tasks in the Planner tab first." });
  }
  function ReqSummary({ e }) {
    const parts = [];
    if (e.reqTractors > 0) parts.push(`${e.reqTractors} tractor${e.reqTractors > 1 ? "s" : ""}`);
    if (e.reqImplements > 0) parts.push(`${e.reqImplements} implement${e.reqImplements > 1 ? "s" : ""}`);
    if (e.reqVehicles > 0) parts.push(`${e.reqVehicles} vehicle${e.reqVehicles > 1 ? "s" : ""}`);
    if (e.reqSprayers > 0) parts.push(`${e.reqSprayers} sprayer${e.reqSprayers > 1 ? "s" : ""}`);
    if (e.reqTrailers > 0) parts.push(`${e.reqTrailers} trailer${e.reqTrailers > 1 ? "s" : ""}`);
    if (e.reqStaff > 0) parts.push(`${e.reqStaff} staff`);
    const others = parseSafe(e.reqOtherNotes);
    if (others.length > 0) parts.push(`${others.length} other`);
    const mats = parseSafe(e.reqMaterials);
    if (mats.length > 0) parts.push(`${mats.length} material${mats.length > 1 ? "s" : ""}`);
    if (parts.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/40 italic", children: "No requirements entered yet" });
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/60", children: parts.join(" · ") });
  }
  function EventRow({ e, showActualsBtn }) {
    const status = getPlanningStatus(e);
    const pending = commitMut.isPending && commitMut.variables?.id === e.id;
    const hasActuals = !!e.actualStatus;
    const ActualBadge = () => {
      if (!hasActuals) return null;
      const cfg = e.actualStatus === "completed" ? { cls: "bg-green-100 text-green-700", label: "✓ Completed" } : e.actualStatus === "partial" ? { cls: "bg-amber-100 text-amber-700", label: "⚡ Partial" } : { cls: "bg-red-100 text-red-600", label: "✕ Abandoned" };
      return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border", cfg.cls), children: cfg.label });
    };
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 px-4 py-3 border-b border-border last:border-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(
        "w-1 self-stretch rounded-full flex-shrink-0 mt-0.5",
        status === "committed" ? "bg-green-400" : status === "planned" ? "bg-amber-400" : "bg-red-300"
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium leading-snug", children: e.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ActualBadge, {})
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-0.5 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/50", children: fmtDate(e.eventDate) }),
          e.actualDate && e.actualDate !== e.eventDate.slice(0, 10) && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/30 text-xs", children: "→" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-foreground/50", children: [
              "actual: ",
              (/* @__PURE__ */ new Date(e.actualDate + "T12:00:00")).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/30 text-xs", children: "·" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ReqSummary, { e })
        ] }),
        e.actualNotes && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/40 italic mt-1 leading-snug", children: [
          '"',
          e.actualNotes,
          '"'
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-shrink-0 flex items-center gap-2", children: [
        showActualsBtn && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setActingOn(e),
            className: cn(
              "inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors border",
              hasActuals ? "border-primary/30 text-primary hover:bg-primary/10" : "border-border text-foreground/50 hover:bg-muted"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-3 h-3" }),
              hasActuals ? "Edit actuals" : "Record actuals"
            ]
          }
        ),
        status === "committed" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden sm:flex flex-col items-end gap-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "w-3.5 h-3.5" }),
              " Committed"
            ] }),
            (e.reqCommittedBy || e.reqCommittedAt) && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-foreground/40 leading-tight", children: [
              e.reqCommittedBy ?? "",
              e.reqCommittedBy && e.reqCommittedAt ? " · " : "",
              e.reqCommittedAt ? new Date(e.reqCommittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : ""
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => commitMut.mutate({ id: e.id, committed: false }),
              disabled: pending,
              className: "inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs text-foreground/50 hover:bg-muted border border-border transition-colors disabled:opacity-40",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Undo2, { className: "w-3 h-3" }),
                " Uncommit"
              ]
            }
          )
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn(
            "hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
            status === "planned" ? "bg-amber-100 text-amber-700" : "bg-red-50 text-red-500"
          ), children: status === "planned" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-3.5 h-3.5" }),
            " Needs sign-off"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleDashed, { className: "w-3.5 h-3.5" }),
            " Not started"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => commitMut.mutate({ id: e.id, committed: true }),
              disabled: pending || status === "not_started",
              title: status === "not_started" ? "Enter resource or material requirements before committing" : "Mark planning complete for this task",
              className: cn(
                "inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
                status === "planned" ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-foreground/40 border border-border"
              ),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3.5 h-3.5" }),
                " Commit"
              ]
            }
          )
        ] })
      ] })
    ] });
  }
  function Section({ title, icon, items, accent }) {
    if (items.length === 0) return null;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold", accent), children: [
        icon,
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: title }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto font-normal opacity-70", children: [
          items.length,
          " task",
          items.length !== 1 ? "s" : ""
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "overflow-hidden", children: items.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx(EventRow, { e }, e.id)) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 max-w-3xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1 flex-wrap", children: ["1w", "2w", "4w", "8w", "all"].map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setDateRange(r),
          className: cn(
            "text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors",
            dateRange === r ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground/50 hover:bg-muted"
          ),
          children: r === "all" ? "All upcoming" : r === "1w" ? "Next week" : r === "2w" ? "2 weeks" : r === "4w" ? "4 weeks" : "8 weeks"
        },
        r
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 min-w-0 sm:max-w-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40 pointer-events-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            placeholder: "Search tasks…",
            value: search,
            onChange: (e) => setSearch(e.target.value),
            className: "w-full pl-8 pr-3 py-1.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary/40"
          }
        ),
        search && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSearch(""), className: "absolute right-2 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" }) })
      ] }),
      upcoming.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: exportStatusCSV,
          className: "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border hover:bg-muted transition-colors text-foreground/60 shrink-0",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "w-3.5 h-3.5" }),
            " Export CSV"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-3", children: [
      { label: "Not started", count: notStarted.length, color: "bg-red-50 border-red-200 text-red-600", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleDashed, { className: "w-4 h-4" }) },
      { label: "Needs sign-off", count: planned.length, color: "bg-amber-50 border-amber-200 text-amber-700", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-4 h-4" }) },
      { label: "Committed", count: committed.length, color: "bg-green-50 border-green-200 text-green-700", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "w-4 h-4" }) }
    ].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: cn("flex items-center gap-3 px-4 py-3 border", s.color), children: [
      s.icon,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold leading-none", children: s.count }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs opacity-80 mt-0.5", children: s.label })
      ] })
    ] }, s.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/40 -mt-2", children: [
      "Enter resource and material requirements on a task, then click ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Commit" }),
      " to mark it as fully planned.",
      dateRange !== "all" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        " Showing tasks in the next ",
        dateRange === "1w" ? "week" : dateRange === "2w" ? "2 weeks" : dateRange === "4w" ? "4 weeks" : "8 weeks",
        "."
      ] })
    ] }),
    upcoming.length === 0 && !showPast ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-8 text-center text-sm text-foreground/50", children: "No tasks match this filter. Try a wider date range or clear the search." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Section,
        {
          title: "Not started — planning required",
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleDashed, { className: "w-3.5 h-3.5" }),
          items: notStarted,
          accent: "bg-red-50 text-red-700"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Section,
        {
          title: "Requirements entered — awaiting sign-off",
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-3.5 h-3.5" }),
          items: planned,
          accent: "bg-amber-50 text-amber-700"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Section,
        {
          title: "Committed — planning complete",
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "w-3.5 h-3.5" }),
          items: committed,
          accent: "bg-green-50 text-green-700"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 border-t border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setShowPast((p) => !p),
          className: cn(
            "flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors",
            showPast ? "border-foreground/30 bg-muted text-foreground" : "border-border text-foreground/50 hover:bg-muted"
          ),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "w-3.5 h-3.5" }),
            showPast ? "Hide past tasks" : `Show past tasks${past.length > 0 ? ` (${past.length})` : ""}`
          ]
        }
      ),
      showPast && past.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 text-gray-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "w-3.5 h-3.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Past tasks" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto font-normal opacity-70", children: [
            past.length,
            " task",
            past.length !== 1 ? "s" : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "overflow-hidden", children: past.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx(EventRow, { e, showActualsBtn: true }, e.id)) })
      ] }),
      showPast && past.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-xs text-foreground/40 px-1", children: "No past tasks found." })
    ] }),
    (() => {
      const withActuals = events2.filter((e) => !!e.actualStatus);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 border-t border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setShowPva((p) => !p),
            className: cn(
              "flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors",
              showPva ? "border-foreground/30 bg-muted text-foreground" : "border-border text-foreground/50 hover:bg-muted"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChartNoAxesColumn, { className: "w-3.5 h-3.5" }),
              showPva ? "Hide plan vs actual" : `Plan vs Actual${withActuals.length > 0 ? ` (${withActuals.length} task${withActuals.length !== 1 ? "s" : ""} recorded)` : " — record actuals on past tasks above"}`
            ]
          }
        ),
        showPva && withActuals.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-xs text-foreground/40 px-1", children: 'No actuals recorded yet. Use the "Record actuals" button on past tasks above.' }),
        showPva && withActuals.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 overflow-x-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs min-w-[640px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border bg-muted/30", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-3 font-semibold text-foreground/50", children: "Task" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center py-2 px-3 font-semibold text-foreground/50", children: "Planned date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center py-2 px-3 font-semibold text-foreground/50", children: "Actual date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center py-2 px-3 font-semibold text-foreground/50", children: "Date slip" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center py-2 px-3 font-semibold text-foreground/50", children: "Planned res." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center py-2 px-3 font-semibold text-foreground/50", children: "Actual res." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center py-2 px-3 font-semibold text-foreground/50", children: "Res. delta" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-3 font-semibold text-foreground/50", children: "Outcome" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: withActuals.sort((a, b) => (a.actualDate ?? a.eventDate).localeCompare(b.actualDate ?? b.eventDate)).map((e) => {
              const plannedDate = /* @__PURE__ */ new Date(e.eventDate.slice(0, 10) + "T12:00:00");
              const actualDate = e.actualDate ? /* @__PURE__ */ new Date(e.actualDate + "T12:00:00") : null;
              const slipDays = actualDate ? Math.round((actualDate.getTime() - plannedDate.getTime()) / 864e5) : null;
              const plannedRes = e.reqTractors + e.reqImplements + e.reqVehicles + e.reqSprayers + e.reqTrailers + e.reqStaff;
              const actualRes = e.actualTractors + e.actualImplements + e.actualVehicles + e.actualSprayers + e.actualTrailers + e.actualStaff;
              const resDelta = actualRes - plannedRes;
              const fmtD = (d) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
              const outcomeCfg = e.actualStatus === "completed" ? "text-green-600 font-semibold" : e.actualStatus === "partial" ? "text-amber-600 font-semibold" : "text-red-500 font-semibold";
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 font-medium max-w-[180px] truncate", title: e.title, children: e.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-center text-foreground/60", children: fmtD(plannedDate) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-center text-foreground/60", children: actualDate ? fmtD(actualDate) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/30", children: "—" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-center", children: slipDays === null ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/30", children: "—" }) : slipDays === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-600 font-semibold", children: "On time" }) : slipDays > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-red-500 font-semibold", children: [
                  "+",
                  slipDays,
                  "d"
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-blue-600 font-semibold", children: [
                  slipDays,
                  "d early"
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-center text-foreground/60", children: plannedRes || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-center text-foreground/60", children: actualRes || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-center", children: plannedRes === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/30", children: "—" }) : resDelta === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-600 font-semibold", children: "=" }) : resDelta > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-red-500 font-semibold", children: [
                  "+",
                  resDelta
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-600 font-semibold", children: resDelta }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: cn("py-2 px-3", outcomeCfg), children: [
                  e.actualStatus === "completed" ? "✓ Completed" : e.actualStatus === "partial" ? "⚡ Partial" : "✕ Abandoned",
                  e.actualCompletedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground/40 font-normal", children: [
                    " · ",
                    e.actualCompletedBy
                  ] })
                ] })
              ] }, e.id);
            }) })
          ] }),
          withActuals.some((e) => e.actualNotes) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-foreground/50 px-1", children: "Deviation notes" }),
            withActuals.filter((e) => e.actualNotes).map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-2 bg-muted/40 rounded-lg text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: e.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/40", children: " — " }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/60 italic", children: e.actualNotes })
            ] }, e.id))
          ] })
        ] })
      ] });
    })(),
    actingOn && /* @__PURE__ */ jsxRuntimeExports.jsx(
      ActualCompletionModal,
      {
        event: actingOn,
        farmId,
        onClose: () => setActingOn(null),
        onSaved: () => queryClient.invalidateQueries({ queryKey: ["planner-events-all", farmId] })
      }
    )
  ] });
}
function AnalyticsTab({ farmId, resources }) {
  const today = reactExports.useMemo(() => {
    const d = /* @__PURE__ */ new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const start = isoDate(addDays(today, -365));
  const end = isoDate(addDays(today, 365));
  const { data: events2 = [] } = useQuery({
    queryKey: ["planner-events-all", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/planner-events`).then((r) => r.json())
  });
  const { data: allocData, isLoading: allocLoading } = useQuery({
    queryKey: ["analytics-allocs", farmId, start, end],
    queryFn: () => fetch(`/api/farms/${farmId}/task-resource-allocations?start=${start}&end=${end}`).then((r) => r.json()),
    staleTime: 2 * 60 * 1e3
  });
  const allocations = allocData?.allocations ?? [];
  const upcoming = reactExports.useMemo(() => events2.filter((e) => new Date(e.eventDate) >= today), [events2, today]);
  const statusCounts = reactExports.useMemo(() => {
    let notStarted = 0, planned = 0, committed = 0;
    for (const e of upcoming) {
      const s = getPlanningStatus(e);
      if (s === "not_started") notStarted++;
      else if (s === "planned") planned++;
      else committed++;
    }
    return [
      { name: "Not started", value: notStarted, fill: "#fca5a5" },
      { name: "Needs sign-off", value: planned, fill: "#fcd34d" },
      { name: "Committed", value: committed, fill: "#86efac" }
    ];
  }, [upcoming]);
  const demandByType = reactExports.useMemo(() => {
    const totals = {};
    for (const e of upcoming) {
      if (e.reqTractors > 0) totals["Tractors"] = (totals["Tractors"] || 0) + e.reqTractors;
      if (e.reqImplements > 0) totals["Implements"] = (totals["Implements"] || 0) + e.reqImplements;
      if (e.reqVehicles > 0) totals["Vehicles"] = (totals["Vehicles"] || 0) + e.reqVehicles;
      if (e.reqSprayers > 0) totals["Sprayers"] = (totals["Sprayers"] || 0) + e.reqSprayers;
      if (e.reqTrailers > 0) totals["Trailers"] = (totals["Trailers"] || 0) + e.reqTrailers;
      if (e.reqStaff > 0) totals["Staff"] = (totals["Staff"] || 0) + e.reqStaff;
    }
    return Object.entries(totals).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [upcoming]);
  const byWeek = reactExports.useMemo(() => {
    const weeks = [];
    for (let i = 0; i < 8; i++) {
      const ws = addDays(weekStart(today), i * 7);
      const we = addDays(ws, 6);
      const wsStr = isoDate(ws);
      const weStr = isoDate(we);
      const label = ws.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      let notStarted = 0, planned = 0, committed = 0;
      for (const e of upcoming) {
        if (e.eventDate >= wsStr && e.eventDate <= weStr) {
          const s = getPlanningStatus(e);
          if (s === "not_started") notStarted++;
          else if (s === "planned") planned++;
          else committed++;
        }
      }
      if (notStarted + planned + committed > 0) weeks.push({ label, notStarted, planned, committed });
    }
    return weeks;
  }, [upcoming, today]);
  const utilisationData = reactExports.useMemo(() => {
    const counts = {};
    for (const r of resources) {
      counts[r.id] = { name: r.name, type: r.type, colour: r.colour || "#6366f1", count: 0 };
    }
    for (const a of allocations) {
      if (counts[a.resource_id]) counts[a.resource_id].count++;
      else counts[a.resource_id] = { name: a.resource_name, type: a.resource_type, colour: a.resource_colour || "#6366f1", count: 1 };
    }
    return Object.values(counts).filter((r) => r.count > 0).sort((a, b) => b.count - a.count).slice(0, 12);
  }, [allocations, resources]);
  const materialTotals = reactExports.useMemo(() => {
    const acc = {};
    for (const e of upcoming) {
      const mats = parseSafe(e.reqMaterials);
      for (const m of mats) {
        if (!m.name) continue;
        const key2 = `${m.name}__${m.unit}`;
        if (!acc[key2]) acc[key2] = { name: m.name, unit: m.unit, total: 0 };
        acc[key2].total += Number(m.quantity) || 0;
      }
    }
    return Object.values(acc).sort((a, b) => a.name.localeCompare(b.name));
  }, [upcoming]);
  const totalUpcoming = upcoming.length;
  const committedPct = totalUpcoming > 0 ? Math.round(statusCounts[2].value / totalUpcoming * 100) : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
      { label: "Upcoming tasks", value: totalUpcoming, sub: "from today", color: "text-foreground" },
      { label: "Planning complete", value: `${committedPct}%`, sub: `${statusCounts[2].value} committed`, color: committedPct === 100 ? "text-green-600" : committedPct >= 50 ? "text-amber-600" : "text-red-500" },
      { label: "Resources on file", value: resources.filter((r) => r.isActive).length, sub: `${resources.length} total`, color: "text-foreground" },
      { label: "Allocations (±1yr)", value: allocLoading ? "…" : allocations.length, sub: "resource assignments", color: "text-foreground" }
    ].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-2xl font-bold leading-none ${k.color}`, children: k.value }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold mt-1", children: k.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-foreground/40 mt-0.5", children: k.sub })
    ] }, k.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartNoAxesColumn, { className: "w-4 h-4 text-foreground/50" }),
          "Planning Status — Upcoming"
        ] }),
        totalUpcoming === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/40 italic py-6 text-center", children: "No upcoming tasks yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 140, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: statusCounts, layout: "vertical", margin: { left: 16, right: 16, top: 4, bottom: 4 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { horizontal: false, stroke: "currentColor", strokeOpacity: 0.06 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", tick: { fontSize: 11 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "name", tick: { fontSize: 11 }, width: 90 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v} task${v !== 1 ? "s" : ""}`, ""] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "value", radius: [0, 4, 4, 0], children: statusCounts.map((entry, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: entry.fill }, i)) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-[11px] text-foreground/50 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Overall planning progress" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold", children: [
                committedPct,
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full bg-green-400 transition-all", style: { width: `${committedPct}%` } }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "w-4 h-4 text-foreground/50" }),
          "Tasks by Week — Next 8 Weeks"
        ] }),
        byWeek.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/40 italic py-6 text-center", children: "No upcoming tasks in this period." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 160, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: byWeek, margin: { left: 0, right: 8, top: 4, bottom: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { vertical: false, stroke: "currentColor", strokeOpacity: 0.06 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tick: { fontSize: 10 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 11 }, allowDecimals: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "committed", stackId: "a", fill: "#86efac", name: "Committed", radius: [0, 0, 0, 0] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "planned", stackId: "a", fill: "#fcd34d", name: "Needs sign-off", radius: [0, 0, 0, 0] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "notStarted", stackId: "a", fill: "#fca5a5", name: "Not started", radius: [4, 4, 0, 0] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tractor, { className: "w-4 h-4 text-foreground/50" }),
          "Resource Demand — Upcoming Tasks"
        ] }),
        demandByType.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/40 italic py-6 text-center", children: "No resource requirements entered yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 160, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: demandByType, margin: { left: 0, right: 8, top: 4, bottom: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { vertical: false, stroke: "currentColor", strokeOpacity: 0.06 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "name", tick: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 11 }, allowDecimals: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v} slot${v !== 1 ? "s" : ""}`, "Required"] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "value", fill: "#818cf8", radius: [4, 4, 0, 0], name: "Required" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-4 h-4 text-foreground/50" }),
          "Resource Utilisation — Allocations (±1yr)"
        ] }),
        allocLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-foreground/40 py-6 justify-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3.5 h-3.5 animate-spin" }),
          " Loading…"
        ] }) : utilisationData.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/40 italic py-6 text-center", children: "No allocation data yet. Assign resources to tasks in the Planner." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 160, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: utilisationData, layout: "vertical", margin: { left: 0, right: 16, top: 4, bottom: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { horizontal: false, stroke: "currentColor", strokeOpacity: 0.06 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", tick: { fontSize: 11 }, allowDecimals: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "name", tick: { fontSize: 10 }, width: 90 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v} assignment${v !== 1 ? "s" : ""}`, "Used"] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "count", radius: [0, 4, 4, 0], name: "Assignments", children: utilisationData.map((entry, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: entry.colour }, i)) })
        ] }) })
      ] })
    ] }),
    materialTotals.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-4 h-4 text-foreground/50" }),
        "Material Requirements — Upcoming Tasks"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-3 text-xs font-semibold text-foreground/50", children: "Material" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-2 px-3 text-xs font-semibold text-foreground/50", children: "Total qty" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-3 text-xs font-semibold text-foreground/50", children: "Unit" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: materialTotals.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 font-medium", children: m.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-right tabular-nums", children: m.total % 1 === 0 ? m.total : m.total.toFixed(2) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-foreground/60", children: m.unit })
        ] }, `${m.name}__${m.unit}`)) })
      ] }) })
    ] }),
    materialTotals.length === 0 && upcoming.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-5 text-center text-sm text-foreground/40", children: "No material requirements entered on upcoming tasks yet. Add materials when editing tasks in the Planner tab." }),
    (() => {
      const withActuals = events2.filter((e) => !!e.actualStatus);
      if (withActuals.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 text-center text-sm text-foreground/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground/60 mb-1", children: "Plan vs Actual analytics will appear here" }),
        "Record actuals on completed tasks in the Planning Status tab to start tracking planning accuracy."
      ] });
      const slipData = [
        { label: "Early", count: 0, fill: "#60a5fa" },
        { label: "On time", count: 0, fill: "#86efac" },
        { label: "1–3d late", count: 0, fill: "#fcd34d" },
        { label: "4–7d late", count: 0, fill: "#fb923c" },
        { label: ">7d late", count: 0, fill: "#f87171" }
      ];
      let totalSlip = 0;
      let slipCount = 0;
      for (const e of withActuals) {
        if (!e.actualDate) continue;
        const slip = Math.round(((/* @__PURE__ */ new Date(e.actualDate + "T12:00:00")).getTime() - (/* @__PURE__ */ new Date(e.eventDate.slice(0, 10) + "T12:00:00")).getTime()) / 864e5);
        totalSlip += slip;
        slipCount++;
        if (slip < 0) slipData[0].count++;
        else if (slip === 0) slipData[1].count++;
        else if (slip <= 3) slipData[2].count++;
        else if (slip <= 7) slipData[3].count++;
        else slipData[4].count++;
      }
      const avgSlip = slipCount > 0 ? (totalSlip / slipCount).toFixed(1) : "—";
      const resVariance = {
        Tractors: { planned: 0, actual: 0 },
        Implements: { planned: 0, actual: 0 },
        Vehicles: { planned: 0, actual: 0 },
        Sprayers: { planned: 0, actual: 0 },
        Trailers: { planned: 0, actual: 0 },
        Staff: { planned: 0, actual: 0 }
      };
      for (const e of withActuals) {
        resVariance.Tractors.planned += e.reqTractors;
        resVariance.Tractors.actual += e.actualTractors;
        resVariance.Implements.planned += e.reqImplements;
        resVariance.Implements.actual += e.actualImplements;
        resVariance.Vehicles.planned += e.reqVehicles;
        resVariance.Vehicles.actual += e.actualVehicles;
        resVariance.Sprayers.planned += e.reqSprayers;
        resVariance.Sprayers.actual += e.actualSprayers;
        resVariance.Trailers.planned += e.reqTrailers;
        resVariance.Trailers.actual += e.actualTrailers;
        resVariance.Staff.planned += e.reqStaff;
        resVariance.Staff.actual += e.actualStaff;
      }
      const resData = Object.entries(resVariance).filter(([, v]) => v.planned > 0 || v.actual > 0).map(([name, v]) => ({ name, planned: v.planned, actual: v.actual }));
      const outcomeCounts = [
        { name: "Completed", value: withActuals.filter((e) => e.actualStatus === "completed").length, fill: "#86efac" },
        { name: "Partial", value: withActuals.filter((e) => e.actualStatus === "partial").length, fill: "#fcd34d" },
        { name: "Abandoned", value: withActuals.filter((e) => e.actualStatus === "abandoned").length, fill: "#f87171" }
      ].filter((o) => o.value > 0);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-2 border-t border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartNoAxesColumn, { className: "w-4 h-4 text-foreground/40" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold text-foreground/80", children: [
            "Plan vs Actual — ",
            withActuals.length,
            " task",
            withActuals.length !== 1 ? "s" : "",
            " recorded"
          ] }),
          slipCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cn("ml-auto text-xs font-bold px-2 py-0.5 rounded-full", Number(avgSlip) > 0 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"), children: [
            "Avg slip: ",
            Number(avgSlip) > 0 ? `+${avgSlip}d` : Number(avgSlip) < 0 ? `${avgSlip}d early` : "On time"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-4", children: "Date Slip Distribution" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 150, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: slipData.filter((d) => d.count > 0), margin: { left: 0, right: 8, top: 4, bottom: 4 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { vertical: false, stroke: "currentColor", strokeOpacity: 0.06 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tick: { fontSize: 11 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 11 }, allowDecimals: false }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v} task${v !== 1 ? "s" : ""}`, ""] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "count", radius: [4, 4, 0, 0], name: "Tasks", children: slipData.filter((d) => d.count > 0).map((entry, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: entry.fill }, i)) })
            ] }) })
          ] }),
          resData.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-4", children: "Resource Planned vs Actual (totals)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 150, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: resData, margin: { left: 0, right: 8, top: 4, bottom: 4 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { vertical: false, stroke: "currentColor", strokeOpacity: 0.06 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "name", tick: { fontSize: 11 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 11 }, allowDecimals: false }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "planned", fill: "#a5b4fc", name: "Planned", radius: [2, 2, 0, 0] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "actual", fill: "#6366f1", name: "Actual", radius: [2, 2, 0, 0] })
            ] }) })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-4", children: "Task Outcomes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 150, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: outcomeCounts, layout: "vertical", margin: { left: 16, right: 16, top: 4, bottom: 4 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { horizontal: false, stroke: "currentColor", strokeOpacity: 0.06 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", tick: { fontSize: 11 }, allowDecimals: false }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "name", tick: { fontSize: 11 }, width: 80 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v} task${v !== 1 ? "s" : ""}`, ""] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "value", radius: [0, 4, 4, 0], name: "Tasks", children: outcomeCounts.map((entry, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: entry.fill }, i)) })
            ] }) })
          ] })
        ] })
      ] });
    })()
  ] });
}
export {
  ResourcesPage as default
};
