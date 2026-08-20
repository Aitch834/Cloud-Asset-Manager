import { j as jsxRuntimeExports } from "./index-LXPEs_eP.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BFdOvATK.js";
import { a as cropYearOptions, c as currentCropYear, b as cropYearLabel } from "./cropYear-Dmv-iNR6.js";
function CropYearSelector({ value, onChange, count = 7, className, showAllYears = false }) {
  const options = cropYearOptions(count);
  const current = currentCropYear();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(value), onValueChange: (v) => onChange(Number(v)), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: className ?? "w-44", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
      showAllYears && /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "0", children: "All years" }),
      options.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(y), children: [
        cropYearLabel(y),
        y === current ? " (current)" : ""
      ] }, y))
    ] })
  ] });
}
export {
  CropYearSelector as C
};
