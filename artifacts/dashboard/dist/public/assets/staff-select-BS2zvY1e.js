import { j as jsxRuntimeExports, I as Input, o as Link } from "./index-DVTlKOh9.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-DqKMNsik.js";
function StaffSelect({
  value,
  onChange,
  staffNames,
  loading
}) {
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value, onChange: (e) => onChange(e.target.value), placeholder: "Loading staff…", disabled: true });
  }
  if (staffNames.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          value,
          onChange: (e) => onChange(e.target.value),
          placeholder: "Type staff member name…"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginTop: 4 }, children: [
        "No staff registered for this farm.",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { href: "/staff", style: { color: "#16a34a", textDecoration: "underline" }, children: "Add staff members" }),
        " ",
        "to enable the lookup."
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value, onValueChange: onChange, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select staff member…" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: staffNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: n, children: n }, n)) })
  ] });
}
export {
  StaffSelect as S
};
