import { useQuery } from "@tanstack/react-query";

interface FarmLocation {
  id: number;
  name: string;
  locationType: string;
  isActive: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  livestock_building: "Livestock Buildings",
  crop_store: "Crop & Feed Stores",
  equipment_store: "Equipment & Workshop",
  chemical_store: "Chemical & Fuel Stores",
  outdoor_area: "Outdoor Areas & Yards",
  welfare_facility: "Welfare Facilities",
  office: "Offices & Farm Buildings",
  other: "Other",
};

const TYPE_ORDER = [
  "livestock_building",
  "crop_store",
  "equipment_store",
  "chemical_store",
  "outdoor_area",
  "welfare_facility",
  "office",
  "other",
];

interface FarmLocationSelectProps {
  farmId: number | null | undefined;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  id?: string;
}

export function FarmLocationSelect({
  farmId,
  value,
  onChange,
  required,
  placeholder = "Select or type location…",
  id,
}: FarmLocationSelectProps) {
  const { data: locations = [] } = useQuery<FarmLocation[]>({
    queryKey: ["farm-locations", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/farm-locations`).then(r => r.json()),
    enabled: !!farmId,
  });

  const activeLocations = locations.filter(l => l.isActive);
  const grouped = TYPE_ORDER.reduce<Record<string, FarmLocation[]>>((acc, type) => {
    const items = activeLocations.filter(l => l.locationType === type);
    if (items.length) acc[type] = items;
    return acc;
  }, {});

  const hasLocations = activeLocations.length > 0;
  const knownValues = activeLocations.map(l => l.name);
  const isCustom = value && !knownValues.includes(value);

  if (!hasLocations) {
    return (
      <input
        id={id}
        type="text"
        className="w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
        placeholder="e.g. Dairy parlour, Cattle shed 2"
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
      />
    );
  }

  return (
    <div className="space-y-1">
      <select
        id={id}
        className="w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
        value={isCustom ? "__other__" : value}
        onChange={e => {
          if (e.target.value === "__other__") {
            onChange("");
          } else {
            onChange(e.target.value);
          }
        }}
        required={required && !isCustom}
      >
        <option value="">{placeholder}</option>
        {Object.entries(grouped).map(([type, items]) => (
          <optgroup key={type} label={TYPE_LABELS[type] ?? type}>
            {items.map(loc => (
              <option key={loc.id} value={loc.name}>{loc.name}</option>
            ))}
          </optgroup>
        ))}
        <option value="__other__">Other / type your own…</option>
      </select>
      {isCustom && (
        <input
          type="text"
          className="w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Enter location name"
          value={value}
          onChange={e => onChange(e.target.value)}
          required={required}
          autoFocus
        />
      )}
    </div>
  );
}
