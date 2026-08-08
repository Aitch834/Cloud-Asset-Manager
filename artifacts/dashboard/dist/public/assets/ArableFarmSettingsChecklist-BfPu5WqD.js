import { u as useLocation, j as jsxRuntimeExports } from "./index-BXc6C5Pv.js";
import { u as useFarmMeta } from "./shared-Bql1IFei.js";
import { C as CircleCheck } from "./circle-check-DYHYye6z.js";
import { T as TriangleAlert } from "./triangle-alert-wGjK9uJ4.js";
import { C as CircleX } from "./circle-x-BBmbj8JI.js";
function ArableFarmSettingsChecklist({ farmId }) {
  const { farmRecord, isLoading } = useFarmMeta(farmId);
  const [, navigate] = useLocation();
  if (isLoading) return null;
  const fields = [
    { label: "SBI Number", filled: !!farmRecord?.sbiNumber && String(farmRecord.sbiNumber).trim() !== "" },
    { label: "Farm Address", filled: !!farmRecord?.address && String(farmRecord.address).trim() !== "" }
  ];
  const missingCount = fields.filter((f) => !f.filled).length;
  const allComplete = missingCount === 0;
  if (allComplete) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 shrink-0 text-green-600" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Farm Settings complete" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-700", children: "— SBI number and farm address are both filled in." })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-amber-200 bg-amber-50 p-4 mb-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2.5 mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 mt-0.5 shrink-0 text-amber-500" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-amber-800", children: "Farm Settings incomplete" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-700 mt-0.5", children: [
          missingCount,
          " field",
          missingCount === 1 ? "" : "s",
          " below ",
          missingCount === 1 ? "is" : "are",
          " missing — your printed arable reports will have blank header fields."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2", children: fields.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
      f.filled ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 shrink-0 text-green-600" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-4 h-4 shrink-0 text-amber-500" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: f.filled ? "text-green-800" : "text-amber-800", children: f.label }),
      !f.filled && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          className: "ml-auto text-xs text-amber-700 underline underline-offset-2 hover:text-amber-900 font-medium whitespace-nowrap",
          onClick: () => navigate("/settings/farm"),
          children: "Add →"
        }
      )
    ] }, f.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 pt-2.5 border-t border-amber-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        className: "text-xs text-amber-700 underline underline-offset-2 hover:text-amber-900 font-medium",
        onClick: () => navigate("/settings/farm"),
        children: "Open Farm Settings →"
      }
    ) })
  ] });
}
export {
  ArableFarmSettingsChecklist as A
};
