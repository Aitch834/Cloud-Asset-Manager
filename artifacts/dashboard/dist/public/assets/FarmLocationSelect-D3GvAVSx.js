import { m as useQuery, r as reactExports, j as jsxRuntimeExports } from "./index-D3ci1CPp.js";
const TYPE_LABELS = {
  livestock_building: "Livestock Buildings",
  grain_store: "Crop & Feed Stores",
  workshop: "Equipment & Workshop",
  chemical_store: "Chemical & Fuel Stores",
  yard: "Outdoor Areas & Yards",
  field: "Fields",
  welfare_facility: "Welfare Facilities",
  office: "Offices & Farm Buildings",
  other: "Other"
};
const TYPE_ORDER = [
  "livestock_building",
  "grain_store",
  "workshop",
  "chemical_store",
  "yard",
  "field",
  "welfare_facility",
  "office",
  "other"
];
function FarmLocationSelect({
  farmId,
  value,
  onChange,
  required,
  placeholder = "Select or type location…",
  id
}) {
  const { data: locations = [] } = useQuery({
    queryKey: ["farm-locations", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/farm-locations`).then((r) => r.json()),
    enabled: !!farmId
  });
  const activeLocations = locations.filter((l) => l.isActive);
  const grouped = TYPE_ORDER.reduce((acc, type) => {
    const items = activeLocations.filter((l) => l.locationType === type);
    if (items.length) acc[type] = items;
    return acc;
  }, {});
  const hasLocations = activeLocations.length > 0;
  const knownValues = activeLocations.map((l) => l.name);
  const isCustomValue = !!value && !knownValues.includes(value);
  const [otherMode, setOtherMode] = reactExports.useState(isCustomValue);
  const showTextInput = otherMode || isCustomValue;
  if (!hasLocations) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        id,
        type: "text",
        className: "w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50",
        placeholder: "e.g. Dairy parlour, Cattle shed 2",
        value,
        onChange: (e) => onChange(e.target.value),
        required
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "select",
      {
        id,
        className: "w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50",
        value: showTextInput ? "__other__" : value,
        onChange: (e) => {
          if (e.target.value === "__other__") {
            setOtherMode(true);
            onChange("");
          } else {
            setOtherMode(false);
            onChange(e.target.value);
          }
        },
        required: required && !showTextInput,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: placeholder }),
          Object.entries(grouped).map(([type, items]) => /* @__PURE__ */ jsxRuntimeExports.jsx("optgroup", { label: TYPE_LABELS[type] ?? type, children: items.map((loc) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: loc.name, children: loc.name }, loc.id)) }, type)),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "__other__", children: "Other / type your own…" })
        ]
      }
    ),
    showTextInput && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type: "text",
        className: "w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50",
        placeholder: "Enter location name",
        value,
        onChange: (e) => onChange(e.target.value),
        required,
        autoFocus: true
      }
    )
  ] });
}
export {
  FarmLocationSelect as F
};
