import { j as jsxRuntimeExports } from "./index-DsTqZLGc.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Bq0MMbOJ.js";
import { C as CalendarDays } from "./AppLayout-9hCYNzg8.js";
function YearCompareSelector({
  availableYears,
  selectedYear,
  onYearChange,
  compareYear,
  onCompareYearChange,
  className
}) {
  if (availableYears.length === 0) return null;
  const compareOptions = availableYears.filter((y) => y !== selectedYear);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-2 flex-wrap ${className ?? ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "w-4 h-4 text-muted-foreground shrink-0" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Select,
      {
        value: String(selectedYear),
        onValueChange: (v) => onYearChange(Number(v)),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[6.5rem] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: availableYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(y), children: y }, y)) })
        ]
      }
    ),
    compareOptions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "vs." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Select,
        {
          value: compareYear !== null ? String(compareYear) : "__none__",
          onValueChange: (v) => onCompareYearChange(v === "__none__" ? null : Number(v)),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-[8.5rem] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "No comparison" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "No comparison" }),
              compareOptions.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(y), children: y }, y))
            ] })
          ]
        }
      )
    ] })
  ] });
}
const COMPARE_COLORS = ["#15803d", "#f97316"];
export {
  COMPARE_COLORS as C,
  YearCompareSelector as Y
};
