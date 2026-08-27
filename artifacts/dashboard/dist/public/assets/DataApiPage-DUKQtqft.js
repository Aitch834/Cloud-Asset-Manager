import { s as createLucideIcon, r as reactExports, f as useControllableState, j as jsxRuntimeExports, P as Primitive, az as useId, g as composeEventHandlers, h as Presence, i as createContextScope, k as useComposedRefs, ap as useLayoutEffect2, O as React, ar as createCollection, l as cn, b as useAppStore, a as useToast, c as useQueryClient, m as useQuery, S as useMutation, d as Button, T as Plus, n as Card, a$ as CardHeader, b0 as CardTitle, b1 as CardDescription, o as CardContent, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, H as DialogDescription, I as Input, aA as Check } from "./index-DnpqOjPK.js";
import { u as usePersistedTab } from "./use-persisted-tab-DsCx_GXI.js";
import { B as Badge } from "./badge-vlNYmRlc.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-DP50lvUl.js";
import { u as useDirection } from "./index-DEyNxU4N.js";
import { C as ChevronDown, T as Trash2 } from "./trash-2-B8E7ZM2V.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-R0UnFK4Z.js";
import { D as Database, a as Clock, C as CircleAlert } from "./database-CM9mLyE3.js";
import { S as ShieldCheck } from "./shield-check-DUT5dxRP.js";
import { K as Key } from "./key-C0ZLWvbL.js";
import { f as format } from "./format-Fqx7OmaC.js";
import { C as Copy } from "./copy-CC6QIklA.js";
import "./index-C7CH4vU7.js";
const __iconNode$2 = [
  ["path", { d: "M3 3v16a2 2 0 0 0 2 2h16", key: "c24i48" }],
  ["path", { d: "M7 16h8", key: "srdodz" }],
  ["path", { d: "M7 11h12", key: "127s9w" }],
  ["path", { d: "M7 6h3", key: "w9rmul" }]
];
const ChartBar = createLucideIcon("chart-bar", __iconNode$2);
const __iconNode$1 = [
  ["path", { d: "m18 16 4-4-4-4", key: "1inbqp" }],
  ["path", { d: "m6 8-4 4 4 4", key: "15zrgr" }],
  ["path", { d: "m14.5 4-5 16", key: "e7oirm" }]
];
const CodeXml = createLucideIcon("code-xml", __iconNode$1);
const __iconNode = [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "M8 13h2", key: "yr2amv" }],
  ["path", { d: "M14 13h2", key: "un5t4a" }],
  ["path", { d: "M8 17h2", key: "2yhykz" }],
  ["path", { d: "M14 17h2", key: "10kma7" }]
];
const FileSpreadsheet = createLucideIcon("file-spreadsheet", __iconNode);
var COLLAPSIBLE_NAME = "Collapsible";
var [createCollapsibleContext, createCollapsibleScope] = createContextScope(COLLAPSIBLE_NAME);
var [CollapsibleProvider, useCollapsibleContext] = createCollapsibleContext(COLLAPSIBLE_NAME);
var Collapsible = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeCollapsible,
      open: openProp,
      defaultOpen,
      disabled,
      onOpenChange,
      ...collapsibleProps
    } = props;
    const [open, setOpen] = useControllableState({
      prop: openProp,
      defaultProp: defaultOpen ?? false,
      onChange: onOpenChange,
      caller: COLLAPSIBLE_NAME
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      CollapsibleProvider,
      {
        scope: __scopeCollapsible,
        disabled,
        contentId: useId(),
        open,
        onOpenToggle: reactExports.useCallback(() => setOpen((prevOpen) => !prevOpen), [setOpen]),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.div,
          {
            "data-state": getState$1(open),
            "data-disabled": disabled ? "" : void 0,
            ...collapsibleProps,
            ref: forwardedRef
          }
        )
      }
    );
  }
);
Collapsible.displayName = COLLAPSIBLE_NAME;
var TRIGGER_NAME$1 = "CollapsibleTrigger";
var CollapsibleTrigger = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeCollapsible, ...triggerProps } = props;
    const context = useCollapsibleContext(TRIGGER_NAME$1, __scopeCollapsible);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.button,
      {
        type: "button",
        "aria-controls": context.contentId,
        "aria-expanded": context.open || false,
        "data-state": getState$1(context.open),
        "data-disabled": context.disabled ? "" : void 0,
        disabled: context.disabled,
        ...triggerProps,
        ref: forwardedRef,
        onClick: composeEventHandlers(props.onClick, context.onOpenToggle)
      }
    );
  }
);
CollapsibleTrigger.displayName = TRIGGER_NAME$1;
var CONTENT_NAME$1 = "CollapsibleContent";
var CollapsibleContent = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { forceMount, ...contentProps } = props;
    const context = useCollapsibleContext(CONTENT_NAME$1, props.__scopeCollapsible);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.open, children: ({ present }) => /* @__PURE__ */ jsxRuntimeExports.jsx(CollapsibleContentImpl, { ...contentProps, ref: forwardedRef, present }) });
  }
);
CollapsibleContent.displayName = CONTENT_NAME$1;
var CollapsibleContentImpl = reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeCollapsible, present, children, ...contentProps } = props;
  const context = useCollapsibleContext(CONTENT_NAME$1, __scopeCollapsible);
  const [isPresent, setIsPresent] = reactExports.useState(present);
  const ref = reactExports.useRef(null);
  const composedRefs = useComposedRefs(forwardedRef, ref);
  const heightRef = reactExports.useRef(0);
  const height = heightRef.current;
  const widthRef = reactExports.useRef(0);
  const width = widthRef.current;
  const isOpen = context.open || isPresent;
  const isMountAnimationPreventedRef = reactExports.useRef(isOpen);
  const originalStylesRef = reactExports.useRef(void 0);
  reactExports.useEffect(() => {
    const rAF = requestAnimationFrame(() => isMountAnimationPreventedRef.current = false);
    return () => cancelAnimationFrame(rAF);
  }, []);
  useLayoutEffect2(() => {
    const node = ref.current;
    if (node) {
      originalStylesRef.current = originalStylesRef.current || {
        transitionDuration: node.style.transitionDuration,
        animationName: node.style.animationName
      };
      node.style.transitionDuration = "0s";
      node.style.animationName = "none";
      const rect = node.getBoundingClientRect();
      heightRef.current = rect.height;
      widthRef.current = rect.width;
      if (!isMountAnimationPreventedRef.current) {
        node.style.transitionDuration = originalStylesRef.current.transitionDuration;
        node.style.animationName = originalStylesRef.current.animationName;
      }
      setIsPresent(present);
    }
  }, [context.open, present]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Primitive.div,
    {
      "data-state": getState$1(context.open),
      "data-disabled": context.disabled ? "" : void 0,
      id: context.contentId,
      hidden: !isOpen,
      ...contentProps,
      ref: composedRefs,
      style: {
        [`--radix-collapsible-content-height`]: height ? `${height}px` : void 0,
        [`--radix-collapsible-content-width`]: width ? `${width}px` : void 0,
        ...props.style
      },
      children: isOpen && children
    }
  );
});
function getState$1(open) {
  return open ? "open" : "closed";
}
var Root = Collapsible;
var Trigger = CollapsibleTrigger;
var Content = CollapsibleContent;
var ACCORDION_NAME = "Accordion";
var ACCORDION_KEYS = ["Home", "End", "ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"];
var [Collection, useCollection, createCollectionScope] = createCollection(ACCORDION_NAME);
var [createAccordionContext] = createContextScope(ACCORDION_NAME, [
  createCollectionScope,
  createCollapsibleScope
]);
var useCollapsibleScope = createCollapsibleScope();
var Accordion$1 = React.forwardRef(
  (props, forwardedRef) => {
    const { type, ...accordionProps } = props;
    const singleProps = accordionProps;
    const multipleProps = accordionProps;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.Provider, { scope: props.__scopeAccordion, children: type === "multiple" ? /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionImplMultiple, { ...multipleProps, ref: forwardedRef }) : /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionImplSingle, { ...singleProps, ref: forwardedRef }) });
  }
);
Accordion$1.displayName = ACCORDION_NAME;
var [AccordionValueProvider, useAccordionValueContext] = createAccordionContext(ACCORDION_NAME);
var [AccordionCollapsibleProvider, useAccordionCollapsibleContext] = createAccordionContext(
  ACCORDION_NAME,
  { collapsible: false }
);
var AccordionImplSingle = React.forwardRef(
  (props, forwardedRef) => {
    const {
      value: valueProp,
      defaultValue,
      onValueChange = () => {
      },
      collapsible = false,
      ...accordionSingleProps
    } = props;
    const [value, setValue] = useControllableState({
      prop: valueProp,
      defaultProp: defaultValue ?? "",
      onChange: onValueChange,
      caller: ACCORDION_NAME
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      AccordionValueProvider,
      {
        scope: props.__scopeAccordion,
        value: React.useMemo(() => value ? [value] : [], [value]),
        onItemOpen: setValue,
        onItemClose: React.useCallback(() => collapsible && setValue(""), [collapsible, setValue]),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionCollapsibleProvider, { scope: props.__scopeAccordion, collapsible, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionImpl, { ...accordionSingleProps, ref: forwardedRef }) })
      }
    );
  }
);
var AccordionImplMultiple = React.forwardRef((props, forwardedRef) => {
  const {
    value: valueProp,
    defaultValue,
    onValueChange = () => {
    },
    ...accordionMultipleProps
  } = props;
  const [value, setValue] = useControllableState({
    prop: valueProp,
    defaultProp: defaultValue ?? [],
    onChange: onValueChange,
    caller: ACCORDION_NAME
  });
  const handleItemOpen = React.useCallback(
    (itemValue) => setValue((prevValue = []) => [...prevValue, itemValue]),
    [setValue]
  );
  const handleItemClose = React.useCallback(
    (itemValue) => setValue((prevValue = []) => prevValue.filter((value2) => value2 !== itemValue)),
    [setValue]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    AccordionValueProvider,
    {
      scope: props.__scopeAccordion,
      value,
      onItemOpen: handleItemOpen,
      onItemClose: handleItemClose,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionCollapsibleProvider, { scope: props.__scopeAccordion, collapsible: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionImpl, { ...accordionMultipleProps, ref: forwardedRef }) })
    }
  );
});
var [AccordionImplProvider, useAccordionContext] = createAccordionContext(ACCORDION_NAME);
var AccordionImpl = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAccordion, disabled, dir, orientation = "vertical", ...accordionProps } = props;
    const accordionRef = React.useRef(null);
    const composedRefs = useComposedRefs(accordionRef, forwardedRef);
    const getItems = useCollection(__scopeAccordion);
    const direction = useDirection(dir);
    const isDirectionLTR = direction === "ltr";
    const handleKeyDown = composeEventHandlers(props.onKeyDown, (event) => {
      if (!ACCORDION_KEYS.includes(event.key)) return;
      const target = event.target;
      const triggerCollection = getItems().filter((item) => !item.ref.current?.disabled);
      const triggerIndex = triggerCollection.findIndex((item) => item.ref.current === target);
      const triggerCount = triggerCollection.length;
      if (triggerIndex === -1) return;
      event.preventDefault();
      let nextIndex = triggerIndex;
      const homeIndex = 0;
      const endIndex = triggerCount - 1;
      const moveNext = () => {
        nextIndex = triggerIndex + 1;
        if (nextIndex > endIndex) {
          nextIndex = homeIndex;
        }
      };
      const movePrev = () => {
        nextIndex = triggerIndex - 1;
        if (nextIndex < homeIndex) {
          nextIndex = endIndex;
        }
      };
      switch (event.key) {
        case "Home":
          nextIndex = homeIndex;
          break;
        case "End":
          nextIndex = endIndex;
          break;
        case "ArrowRight":
          if (orientation === "horizontal") {
            if (isDirectionLTR) {
              moveNext();
            } else {
              movePrev();
            }
          }
          break;
        case "ArrowDown":
          if (orientation === "vertical") {
            moveNext();
          }
          break;
        case "ArrowLeft":
          if (orientation === "horizontal") {
            if (isDirectionLTR) {
              movePrev();
            } else {
              moveNext();
            }
          }
          break;
        case "ArrowUp":
          if (orientation === "vertical") {
            movePrev();
          }
          break;
      }
      const clampedIndex = nextIndex % triggerCount;
      triggerCollection[clampedIndex].ref.current?.focus();
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      AccordionImplProvider,
      {
        scope: __scopeAccordion,
        disabled,
        direction: dir,
        orientation,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.Slot, { scope: __scopeAccordion, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.div,
          {
            ...accordionProps,
            "data-orientation": orientation,
            ref: composedRefs,
            onKeyDown: disabled ? void 0 : handleKeyDown
          }
        ) })
      }
    );
  }
);
var ITEM_NAME = "AccordionItem";
var [AccordionItemProvider, useAccordionItemContext] = createAccordionContext(ITEM_NAME);
var AccordionItem$1 = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAccordion, value, ...accordionItemProps } = props;
    const accordionContext = useAccordionContext(ITEM_NAME, __scopeAccordion);
    const valueContext = useAccordionValueContext(ITEM_NAME, __scopeAccordion);
    const collapsibleScope = useCollapsibleScope(__scopeAccordion);
    const triggerId = useId();
    const open = value && valueContext.value.includes(value) || false;
    const disabled = accordionContext.disabled || props.disabled;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      AccordionItemProvider,
      {
        scope: __scopeAccordion,
        open,
        disabled,
        triggerId,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Root,
          {
            "data-orientation": accordionContext.orientation,
            "data-state": getState(open),
            ...collapsibleScope,
            ...accordionItemProps,
            ref: forwardedRef,
            disabled,
            open,
            onOpenChange: (open2) => {
              if (open2) {
                valueContext.onItemOpen(value);
              } else {
                valueContext.onItemClose(value);
              }
            }
          }
        )
      }
    );
  }
);
AccordionItem$1.displayName = ITEM_NAME;
var HEADER_NAME = "AccordionHeader";
var AccordionHeader = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAccordion, ...headerProps } = props;
    const accordionContext = useAccordionContext(ACCORDION_NAME, __scopeAccordion);
    const itemContext = useAccordionItemContext(HEADER_NAME, __scopeAccordion);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.h3,
      {
        "data-orientation": accordionContext.orientation,
        "data-state": getState(itemContext.open),
        "data-disabled": itemContext.disabled ? "" : void 0,
        ...headerProps,
        ref: forwardedRef
      }
    );
  }
);
AccordionHeader.displayName = HEADER_NAME;
var TRIGGER_NAME = "AccordionTrigger";
var AccordionTrigger$1 = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAccordion, ...triggerProps } = props;
    const accordionContext = useAccordionContext(ACCORDION_NAME, __scopeAccordion);
    const itemContext = useAccordionItemContext(TRIGGER_NAME, __scopeAccordion);
    const collapsibleContext = useAccordionCollapsibleContext(TRIGGER_NAME, __scopeAccordion);
    const collapsibleScope = useCollapsibleScope(__scopeAccordion);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.ItemSlot, { scope: __scopeAccordion, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Trigger,
      {
        "aria-disabled": itemContext.open && !collapsibleContext.collapsible || void 0,
        "data-orientation": accordionContext.orientation,
        id: itemContext.triggerId,
        ...collapsibleScope,
        ...triggerProps,
        ref: forwardedRef
      }
    ) });
  }
);
AccordionTrigger$1.displayName = TRIGGER_NAME;
var CONTENT_NAME = "AccordionContent";
var AccordionContent$1 = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAccordion, ...contentProps } = props;
    const accordionContext = useAccordionContext(ACCORDION_NAME, __scopeAccordion);
    const itemContext = useAccordionItemContext(CONTENT_NAME, __scopeAccordion);
    const collapsibleScope = useCollapsibleScope(__scopeAccordion);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Content,
      {
        role: "region",
        "aria-labelledby": itemContext.triggerId,
        "data-orientation": accordionContext.orientation,
        ...collapsibleScope,
        ...contentProps,
        ref: forwardedRef,
        style: {
          ["--radix-accordion-content-height"]: "var(--radix-collapsible-content-height)",
          ["--radix-accordion-content-width"]: "var(--radix-collapsible-content-width)",
          ...props.style
        }
      }
    );
  }
);
AccordionContent$1.displayName = CONTENT_NAME;
function getState(open) {
  return open ? "open" : "closed";
}
var Root2 = Accordion$1;
var Item = AccordionItem$1;
var Header = AccordionHeader;
var Trigger2 = AccordionTrigger$1;
var Content2 = AccordionContent$1;
const Accordion = Root2;
const AccordionItem = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Item,
  {
    ref,
    className: cn("border-b", className),
    ...props
  }
));
AccordionItem.displayName = "AccordionItem";
const AccordionTrigger = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Header, { className: "flex", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Trigger2,
  {
    ref,
    className: cn(
      "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline text-left [&[data-state=open]>svg]:rotate-180",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" })
    ]
  }
) }));
AccordionTrigger.displayName = Trigger2.displayName;
const AccordionContent = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content2,
  {
    ref,
    className: "overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("pb-4 pt-0", className), children })
  }
));
AccordionContent.displayName = Content2.displayName;
const ENDPOINTS = [
  {
    path: "/data-export/fields",
    title: "Field Register",
    description: "All fields on the holding: name, field reference, area (ha), farmable area, soil type, current use, organic flag, NVZ designation.",
    dateFilter: false,
    example: "GET /data-export/fields"
  },
  {
    path: "/data-export/livestock-movements",
    title: "Livestock Movements",
    description: "On/off movements: movement type, date, species, animal count, from/to location, licence number, ear tag numbers, transporter details.",
    dateFilter: true,
    example: "GET /data-export/livestock-movements?from=2025-01-01&to=2025-12-31"
  },
  {
    path: "/data-export/medicine-records",
    title: "Medicine Records",
    description: "Medicine administration: product name, batch number, dosage, administration route, operator, withdrawal period (days) and withdrawal end date.",
    dateFilter: true,
    example: "GET /data-export/medicine-records?from=2025-01-01"
  },
  {
    path: "/data-export/spray-records",
    title: "Spray Applications",
    description: "Spray applications: date, area sprayed (ha), application rate, water volume (L), wind speed (km/h), wind direction, temperature (°C), operator, certificate number, equipment used.",
    dateFilter: true,
    example: "GET /data-export/spray-records?format=csv"
  },
  {
    path: "/data-export/soil-tests",
    title: "Soil Tests",
    description: "Soil sample records joined with nutrient results — one row per nutrient per sample. Includes sample reference, laboratory, depth, and result index/status.",
    dateFilter: true,
    example: "GET /data-export/soil-tests?from=2024-01-01"
  },
  {
    path: "/data-export/inspections",
    title: "Inspections",
    description: "Formal inspection records: type, inspector name, assessing body, inspection date, overall result, summary, next inspection due date.",
    dateFilter: true,
    example: "GET /data-export/inspections"
  },
  {
    path: "/data-export/staff-training",
    title: "Staff Training",
    description: "Training records: course title, provider, training date, expiry date, competency achieved, assessor name.",
    dateFilter: true,
    example: "GET /data-export/staff-training?format=csv"
  },
  {
    path: "/data-export/equipment",
    title: "Equipment Register",
    description: "Equipment: asset number, name, type, make, model, serial number, year of manufacture, current value (pence), status, location.",
    dateFilter: false,
    example: "GET /data-export/equipment"
  },
  {
    path: "/data-export/financial-records",
    title: "Financial Records",
    description: "Financial transactions: type (income/expense), category, description, amount (pence), VAT amount (pence), VAT rate, vendor/customer, payment method, reference.",
    dateFilter: true,
    example: "GET /data-export/financial-records?from=2025-04-01&to=2026-03-31"
  },
  {
    path: "/data-export/risk-assessments",
    title: "Risk Assessments",
    description: "Risk assessments: title, area, hazard description, risk level, control measures, assessed by, assessment date, review date, status.",
    dateFilter: false,
    example: "GET /data-export/risk-assessments"
  }
];
const BASE_URL = "https://bdefarmtrac.co.uk/api";
const QUICK_START = {
  powerQuery: (key) => `// Excel Power Query — paste into Advanced Editor
let
    ApiKey = "${key}",
    BaseUrl = "${BASE_URL}",
    GetData = (endpoint as text) =>
        let
            Headers = [#"X-API-Key" = ApiKey],
            Source = Json.Document(Web.Contents(BaseUrl & endpoint, [Headers = Headers])),
            Data = Source[data]
        in
            Table.FromRecords(Data),
    Fields = GetData("/data-export/fields")
in
    Fields`,
  googleSheets: (key) => `// Google Sheets — paste into any cell
=LET(
  url, "${BASE_URL}/data-export/fields",
  headers, {"X-API-Key", "${key}"},
  data, IMPORTDATA(url)
)

// Or use Apps Script for authenticated requests:
function getFieldData() {
  const response = UrlFetchApp.fetch(
    '${BASE_URL}/data-export/fields',
    { headers: { 'X-API-Key': '${key}' } }
  );
  const data = JSON.parse(response.getContentText()).data;
  const sheet = SpreadsheetApp.getActiveSheet();
  if (data.length > 0) {
    sheet.appendRow(Object.keys(data[0]));
    data.forEach(row => sheet.appendRow(Object.values(row)));
  }
}`,
  python: (key) => `import requests
import pandas as pd

API_KEY = "${key}"
BASE_URL = "${BASE_URL}"
HEADERS = {"X-API-Key": API_KEY}

def get_data(endpoint: str, **params) -> pd.DataFrame:
    response = requests.get(f"{BASE_URL}{endpoint}", headers=HEADERS, params=params)
    response.raise_for_status()
    return pd.DataFrame(response.json()["data"])

# Examples
fields = get_data("/data-export/fields")
movements = get_data("/data-export/livestock-movements", **{"from": "2025-01-01"})
spray_csv = requests.get(f"{BASE_URL}/data-export/spray-records",
    headers=HEADERS, params={"format": "csv"}).text`
};
function CopyButton({ text }) {
  const [copied, setCopied] = reactExports.useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2e3);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      onClick: handleCopy,
      className: "p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground",
      title: "Copy to clipboard",
      children: copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-4 h-4 text-green-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "w-4 h-4" })
    }
  );
}
function DataApiPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = usePersistedTab({
    page: "data-api",
    farmId,
    validIds: ["powerQuery", "googleSheets", "python"],
    defaultTab: "powerQuery"
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newKeyName, setNewKeyName] = reactExports.useState("");
  const [showNewKeyDialog, setShowNewKeyDialog] = reactExports.useState(false);
  const [createdKey, setCreatedKey] = reactExports.useState(null);
  const [revokeConfirmId, setRevokeConfirmId] = reactExports.useState(null);
  const { data, isLoading } = useQuery({
    queryKey: ["data-api-keys", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/api-keys`).then((r) => r.json()),
    enabled: !!farmId
  });
  const createKey = useMutation({
    mutationFn: async (name) => {
      const r = await fetch(`/api/farms/${farmId}/api-keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error ?? "Failed to create key");
      }
      return r.json();
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["data-api-keys", farmId] });
      setCreatedKey(res.rawKey);
      setNewKeyName("");
      setShowNewKeyDialog(false);
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });
  const revokeKey = useMutation({
    mutationFn: async (keyId) => {
      const r = await fetch(`/api/farms/${farmId}/api-keys/${keyId}`, {
        method: "DELETE"
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error ?? "Failed to revoke key");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-api-keys", farmId] });
      setRevokeConfirmId(null);
      toast({ title: "API key revoked", description: "The key can no longer be used to access data." });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });
  const activeKeys = (data?.keys ?? []).filter((k) => !k.revokedAt);
  const revokedKeys = (data?.keys ?? []).filter((k) => k.revokedAt);
  const exampleKey = activeKeys[0]?.keyPrefix ? `${activeKeys[0].keyPrefix}…` : "bdeft_<your-key>";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-5xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl font-bold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Database, { className: "w-6 h-6 text-primary" }),
          "Data API Access"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1 text-sm", children: "Secure, read-only API keys to connect your farm data to Excel, Power BI, Google Sheets, and Python." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setShowNewKeyDialog(true), className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
        "Generate New Key"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-4 flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-5 h-5 text-green-500 mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-sm", children: "Read-only" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "API keys grant read access only — no data can be modified via the API." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-4 flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-5 h-5 text-amber-500 mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-sm", children: "Rate limited" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "100 requests per minute per key. Date-range filtering keeps payloads small." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-4 flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Key, { className: "w-5 h-5 text-primary mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-sm", children: "Per-farm keys" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Each key is scoped to this farm only. Revoke any key instantly from this page." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Active API Keys" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Keys are shown by name and prefix only. The full key is shown once at creation." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-4 text-center", children: "Loading…" }) : activeKeys.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-8 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Key, { className: "w-8 h-8 text-muted-foreground/40 mx-auto mb-2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No active keys yet. Generate your first key to get started." })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Key prefix" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Created" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Last used" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-[80px]" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: activeKeys.map((key) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: key.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("code", { className: "text-xs bg-muted px-1.5 py-0.5 rounded", children: [
              key.keyPrefix,
              "…"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm text-muted-foreground", children: format(new Date(key.createdAt), "d MMM yyyy") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm text-muted-foreground", children: key.lastUsedAt ? format(new Date(key.lastUsedAt), "d MMM yyyy HH:mm") : "Never" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: revokeConfirmId === key.id ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "destructive",
                  size: "sm",
                  className: "h-7 text-xs",
                  onClick: () => revokeKey.mutate(key.id),
                  disabled: revokeKey.isPending,
                  children: "Confirm"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  className: "h-7 text-xs",
                  onClick: () => setRevokeConfirmId(null),
                  children: "Cancel"
                }
              )
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                className: "h-8 w-8 text-muted-foreground hover:text-destructive",
                onClick: () => setRevokeConfirmId(key.id),
                title: "Revoke key",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
              }
            ) })
          ] }, key.id)) })
        ] }),
        revokedKeys.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 pt-4 border-t", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wide", children: "Revoked Keys" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: revokedKeys.map((key) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("code", { className: "text-xs bg-muted px-1.5 py-0.5 rounded line-through", children: [
              key.keyPrefix,
              "…"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: key.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-xs text-red-500 border-red-200", children: [
              "Revoked ",
              format(new Date(key.revokedAt), "d MMM yyyy")
            ] })
          ] }, key.id)) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Quick Start" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { children: [
          "Authenticate using:",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs bg-muted px-1.5 py-0.5 rounded", children: "Authorization: Bearer <key>" }),
          " ",
          "or",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs bg-muted px-1.5 py-0.5 rounded", children: "X-API-Key: <key>" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: tab, onValueChange: setTab, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "powerQuery", className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileSpreadsheet, { className: "w-3.5 h-3.5" }),
            " Excel Power Query"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "googleSheets", className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChartBar, { className: "w-3.5 h-3.5" }),
            " Google Sheets"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "python", className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CodeXml, { className: "w-3.5 h-3.5" }),
            " Python / R"
          ] })
        ] }),
        ["powerQuery", "googleSheets", "python"].map((tab2) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: tab2, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-2 right-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CopyButton, { text: QUICK_START[tab2](exampleKey) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "bg-muted rounded-lg p-4 text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed font-mono pr-10", children: QUICK_START[tab2](exampleKey) })
          ] }),
          tab2 === "googleSheets" && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-2 flex items-start gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" }),
            "IMPORTDATA does not support custom headers. Use the Apps Script method above for authenticated access."
          ] })
        ] }, tab2))
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Available Endpoints" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { children: [
          "All endpoints are prefixed with",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs bg-muted px-1.5 py-0.5 rounded", children: BASE_URL }),
          ". Append ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs bg-muted px-1.5 py-0.5 rounded", children: "?format=csv" }),
          " to any endpoint for CSV output."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Accordion, { type: "multiple", className: "w-full", children: ENDPOINTS.map((ep) => /* @__PURE__ */ jsxRuntimeExports.jsxs(AccordionItem, { value: ep.path, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionTrigger, { className: "text-sm hover:no-underline", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs bg-muted px-1.5 py-0.5 rounded font-mono shrink-0", children: ep.path }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: ep.title }),
          ep.dateFilter && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-xs shrink-0", children: "Date filter" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-1 pb-2 space-y-3 pl-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: ep.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs bg-muted px-2 py-1 rounded font-mono flex-1", children: ep.example }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CopyButton, { text: `${BASE_URL}${ep.example.replace("GET ", "")}` })
          ] }),
          ep.dateFilter && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "Supports ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "bg-muted px-1 rounded", children: "?from=YYYY-MM-DD" }),
            " and ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "bg-muted px-1 rounded", children: "?to=YYYY-MM-DD" }),
            " query parameters."
          ] })
        ] }) })
      ] }, ep.path)) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showNewKeyDialog, onOpenChange: setShowNewKeyDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Generate New API Key" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: 'Give the key a descriptive name so you can identify it later (e.g. "Excel Dashboard", "Power BI Report").' })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Key name",
            value: newKeyName,
            onChange: (e) => setNewKeyName(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter" && newKeyName.trim()) {
                createKey.mutate(newKeyName.trim());
              }
            },
            autoFocus: true
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 justify-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShowNewKeyDialog(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: () => createKey.mutate(newKeyName.trim()),
              disabled: !newKeyName.trim() || createKey.isPending,
              children: createKey.isPending ? "Generating…" : "Generate Key"
            }
          )
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!createdKey, onOpenChange: (open) => {
      if (!open) setCreatedKey(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2 text-green-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-5 h-5" }),
          " API Key Created"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Copy this key now — it will not be shown again. Store it securely (e.g. in your Excel workbook or environment variables)." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted rounded-lg p-3 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-sm font-mono flex-1 break-all", children: createdKey }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CopyButton, { text: createdKey ?? "" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-amber-200 bg-amber-50 p-3 flex items-start gap-2 text-sm text-amber-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4 shrink-0 mt-0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "This is the only time the full key will be displayed. If you lose it, revoke it and generate a new one." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setCreatedKey(null), children: "Done" }) })
      ] })
    ] }) })
  ] });
}
export {
  DataApiPage as default
};
