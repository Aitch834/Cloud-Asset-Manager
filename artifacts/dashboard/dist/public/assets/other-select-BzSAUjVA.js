import { j as jsxRuntimeExports, I as Input } from "./index-BKiGXyyl.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BjVSIfJu.js";
function OtherSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select…",
  specifyPlaceholder = "Please specify…",
  className
}) {
  const knownNonOther = options.filter((o) => o !== "Other");
  const isCustom = !!value && value !== "Other" && !knownNonOther.includes(value);
  const showInput = value === "Other" || isCustom;
  const selectVal = showInput ? "Other" : value || "__other_none__";
  const inputVal = isCustom ? value : "";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Select,
      {
        value: selectVal,
        onValueChange: (v) => onValueChange(v === "__other_none__" ? "" : v),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: "__other_none__", children: [
              "— ",
              placeholder,
              " —"
            ] }),
            options.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o === "Other" ? "Other (please specify)" : o }, o))
          ] })
        ]
      }
    ),
    showInput && /* @__PURE__ */ jsxRuntimeExports.jsx(
      Input,
      {
        className: "mt-1.5",
        value: inputVal,
        onChange: (e) => onValueChange(e.target.value || "Other"),
        placeholder: specifyPlaceholder,
        autoFocus: value === "Other"
      }
    )
  ] });
}
export {
  OtherSelect as O
};
