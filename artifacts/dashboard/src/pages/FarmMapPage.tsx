import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import {
  Map as MapIcon, MapPin, Building2, Warehouse, FlaskConical, Tractor, TreePine, Users, LayoutGrid,
  Search, Settings, Eye, EyeOff,
} from "lucide-react";

interface FarmLocation {
  id: number;
  farmId: number;
  name: string;
  locationType: string;
  description: string | null;
  notes: string | null;
  isActive: boolean;
  latitude: number | null;
  longitude: number | null;
}

interface FieldInspection {
  id: number;
  fieldName: string;
  inspectionDate: string;
  cropType: string | null;
  actionRequired: string;
  pestDiseaseObservations: string | null;
  inspector: string | null;
  latitude: string | null;
  longitude: string | null;
}

const LOCATION_TYPES = [
  { value: "livestock_building", label: "Livestock Building",     icon: Building2,    colour: "bg-blue-100 text-blue-800",   markerColour: "#3b82f6" },
  { value: "grain_store",        label: "Crop & Feed Store",      icon: Warehouse,    colour: "bg-yellow-100 text-yellow-800", markerColour: "#eab308" },
  { value: "workshop",           label: "Equipment & Workshop",   icon: Tractor,      colour: "bg-orange-100 text-orange-800", markerColour: "#f97316" },
  { value: "chemical_store",     label: "Chemical & Fuel Store",  icon: FlaskConical, colour: "bg-red-100 text-red-800",     markerColour: "#ef4444" },
  { value: "yard",               label: "Outdoor Area / Yard",    icon: TreePine,     colour: "bg-green-100 text-green-800", markerColour: "#22c55e" },
  { value: "field",              label: "Field",                  icon: TreePine,     colour: "bg-lime-100 text-lime-800",   markerColour: "#84cc16" },
  { value: "welfare_facility",   label: "Welfare Facility",       icon: Users,        colour: "bg-purple-100 text-purple-800", markerColour: "#a855f7" },
  { value: "office",             label: "Office / Farm Building", icon: LayoutGrid,   colour: "bg-slate-100 text-slate-700", markerColour: "#64748b" },
  { value: "other",              label: "Other",                  icon: MapPin,       colour: "bg-gray-100 text-gray-700",   markerColour: "#9ca3af" },
];

const typeMap = Object.fromEntries(LOCATION_TYPES.map(t => [t.value, t]));

const INSPECTION_COLOURS: Record<string, string> = {
  urgent: "#ef4444",
  treat: "#f97316",
  monitor: "#eab308",
  none: "#6b7280",
};

declare global {
  interface Window {
    _L?: typeof import("leaflet");
    _leafletLoaded?: boolean;
  }
}

function makeSvgIcon(colour: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="${colour}" stroke="white" stroke-width="2"/>
    <circle cx="14" cy="14" r="5" fill="white"/>
  </svg>`;
  return "data:image/svg+xml;base64," + btoa(svg);
}

function makeInspectionSvgIcon(colour: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="0 0 24 32">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 8 12 20 12 20S24 20 24 12C24 5.373 18.627 0 12 0z" fill="${colour}" stroke="white" stroke-width="2" opacity="0.9"/>
    <text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-family="sans-serif" font-weight="bold">!</text>
  </svg>`;
  return "data:image/svg+xml;base64," + btoa(svg);
}

function useFarmMap(
  containerRef: React.RefObject<HTMLDivElement | null>,
  locations: FarmLocation[],
  onSelect: (id: number | null) => void
) {
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markersRef = useRef<globalThis.Map<number, import("leaflet").Marker>>(new globalThis.Map());

  useEffect(() => {
    import("leaflet").then((L) => {
      if (!window._leafletLoaded) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
        window._leafletLoaded = true;
      }
      window._L = L;

      if (!containerRef.current || mapRef.current) return;

      const pinned = locations.filter(l => l.latitude != null && l.longitude != null);
      const center: [number, number] = pinned.length > 0
        ? [pinned.reduce((s, l) => s + l.latitude!, 0) / pinned.length,
           pinned.reduce((s, l) => s + l.longitude!, 0) / pinned.length]
        : [52.8, -1.5];
      const zoom = pinned.length > 0 ? 15 : 6;

      const map = L.map(containerRef.current, { center, zoom, scrollWheelZoom: true });
      map.scrollWheelZoom.enable();
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 20,
      }).addTo(map);

      map.on("click", () => onSelect(null));

      for (const loc of pinned) {
        const t = typeMap[loc.locationType];
        const colour = t?.markerColour ?? "#9ca3af";
        const icon = L.icon({
          iconUrl: makeSvgIcon(colour),
          iconSize: [28, 36],
          iconAnchor: [14, 36],
          popupAnchor: [0, -36],
        });

        const marker = L.marker([loc.latitude!, loc.longitude!], { icon })
          .addTo(map)
          .bindPopup(
            `<div style="min-width:160px">
              <p style="font-weight:600;margin:0 0 4px">${loc.name}</p>
              <p style="color:#64748b;font-size:12px;margin:0 0 4px">${t?.label ?? loc.locationType}</p>
              ${loc.description ? `<p style="font-size:12px;margin:0">${loc.description}</p>` : ""}
            </div>`
          );

        marker.on("click", (e: import("leaflet").LeafletMouseEvent) => {
          e.originalEvent.stopPropagation();
          onSelect(loc.id);
        });

        markersRef.current.set(loc.id, marker);
      }

      if (pinned.length > 1) {
        const group = L.featureGroup(Array.from(markersRef.current.values()));
        map.fitBounds(group.getBounds().pad(0.15));
      }
    });

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.off();
          mapRef.current.remove();
        } catch {}
        mapRef.current = null;
        markersRef.current.clear();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function panTo(id: number) {
    const marker = markersRef.current.get(id);
    if (marker && mapRef.current) {
      mapRef.current.setView(marker.getLatLng(), Math.max(mapRef.current.getZoom(), 17), { animate: true });
      marker.openPopup();
    }
  }

  return { panTo, mapRef };
}

export default function FarmMapPage() {
  const { farmId } = useAppStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filterType, setFilterType] = useState("");
  const [showInspections, setShowInspections] = useState(false);
  const inspectionMarkersRef = useRef<import("leaflet").Marker[]>([]);

  const { data: locations = [], isLoading } = useQuery<FarmLocation[]>({
    queryKey: ["farm-locations", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/farm-locations`).then(r => r.json()),
    enabled: !!farmId,
  });

  const { data: inspectionsData } = useQuery<{ records: FieldInspection[] }>({
    queryKey: ["field-inspections-map", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/field-inspections`).then(r => r.json()),
    enabled: !!farmId && showInspections,
  });

  const inspectionsWithGeo = (inspectionsData?.records ?? []).filter(
    r => r.latitude && r.longitude && parseFloat(r.latitude) !== 0 && parseFloat(r.longitude) !== 0
  );

  const pinned = locations.filter(l => l.isActive && l.latitude != null);
  const unpinned = locations.filter(l => l.isActive && l.latitude == null);

  const { panTo, mapRef } = useFarmMap(containerRef, pinned, setSelectedId);

  // Add/remove field inspection markers when toggle or data changes
  useEffect(() => {
    const L = window._L;
    const map = mapRef.current;
    if (!L || !map) return;

    // Remove old inspection markers
    for (const m of inspectionMarkersRef.current) {
      try { m.remove(); } catch {}
    }
    inspectionMarkersRef.current = [];

    if (!showInspections) return;

    for (const insp of inspectionsWithGeo) {
      const lat = parseFloat(insp.latitude!);
      const lng = parseFloat(insp.longitude!);
      if (isNaN(lat) || isNaN(lng)) continue;

      const colour = INSPECTION_COLOURS[insp.actionRequired] ?? INSPECTION_COLOURS.none;
      const icon = L.icon({
        iconUrl: makeInspectionSvgIcon(colour),
        iconSize: [24, 32],
        iconAnchor: [12, 32],
        popupAnchor: [0, -32],
      });

      const dateStr = insp.inspectionDate
        ? new Date(insp.inspectionDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : "—";

      const actionLabel = insp.actionRequired === "urgent" ? "Urgent action" :
        insp.actionRequired === "treat" ? "Treatment needed" :
        insp.actionRequired === "monitor" ? "Monitor" : "No action";

      const marker = L.marker([lat, lng], { icon })
        .addTo(map)
        .bindPopup(
          `<div style="min-width:160px">
            <p style="font-weight:600;margin:0 0 2px;font-size:13px">Field Inspection</p>
            <p style="margin:0 0 2px;font-size:12px;color:#374151">${insp.fieldName}</p>
            <p style="margin:0 0 4px;font-size:11px;color:#64748b">${dateStr}${insp.inspector ? ` · ${insp.inspector}` : ""}</p>
            <p style="margin:0;font-size:11px;font-weight:600;color:${colour}">${actionLabel}</p>
            ${insp.pestDiseaseObservations ? `<p style="margin:4px 0 0;font-size:11px;color:#6b7280">${insp.pestDiseaseObservations.slice(0, 80)}${insp.pestDiseaseObservations.length > 80 ? "…" : ""}</p>` : ""}
          </div>`
        );

      inspectionMarkersRef.current.push(marker);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showInspections, inspectionsWithGeo.length]);

  const filteredPinned = pinned.filter(l => {
    if (filterType && l.locationType !== filterType) return false;
    if (search) {
      const s = search.toLowerCase();
      return l.name.toLowerCase().includes(s) || (l.description ?? "").toLowerCase().includes(s);
    }
    return true;
  });

  if (!farmId) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64 text-foreground/50">Please select a farm first.</div>
      </AppLayout>
    );
  }

  if (!isLoading && pinned.length === 0) {
    return (
      <AppLayout>
        <div className="max-w-lg mx-auto mt-20 text-center space-y-4">
          <MapIcon className="w-12 h-12 text-foreground/20 mx-auto" />
          <h2 className="text-xl font-bold text-foreground">No map pins yet</h2>
          <p className="text-foreground/60 text-sm">
            Add map pins to your farm buildings and areas to see them plotted here. Open the Farm Buildings &amp; Areas page, edit a location, and drop a pin on the map.
          </p>
          <Link href="/farm-locations">
            <span className="inline-flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer">
              <Settings className="w-4 h-4" /> Manage Farm Locations
            </span>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <MapIcon className="w-6 h-6 text-primary" />
              Farm Map
            </h1>
            <p className="text-sm text-foreground/60 mt-1">
              {pinned.length} location{pinned.length !== 1 ? "s" : ""} plotted
              {unpinned.length > 0 && ` · ${unpinned.length} without a pin`}
            </p>
          </div>
          <Link href="/farm-locations">
            <span className="inline-flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer">
              <Settings className="w-4 h-4" /> Manage Locations
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 items-start">
          {/* Sidebar list */}
          <Card className="p-0 overflow-hidden">
            <div className="p-3 border-b space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40" />
                <Input
                  placeholder="Search…"
                  className="pl-8 h-8 text-sm bg-white"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <select
                className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
              >
                <option value="">All types</option>
                {LOCATION_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>

              {/* Field inspections overlay toggle */}
              <button
                type="button"
                onClick={() => setShowInspections(v => !v)}
                className={`w-full h-8 flex items-center gap-2 px-2 rounded-md border text-xs transition-colors ${
                  showInspections
                    ? "border-amber-400 bg-amber-50 text-amber-800"
                    : "border-input bg-background text-foreground/60 hover:bg-muted/30"
                }`}
              >
                {showInspections ? <Eye className="w-3.5 h-3.5 flex-shrink-0" /> : <EyeOff className="w-3.5 h-3.5 flex-shrink-0" />}
                <span>Field inspections overlay</span>
                {showInspections && inspectionsWithGeo.length > 0 && (
                  <span className="ml-auto bg-amber-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                    {inspectionsWithGeo.length}
                  </span>
                )}
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(100vh-320px)]">
              {filteredPinned.length === 0 && (
                <div className="p-4 text-center text-xs text-foreground/40">No matching locations</div>
              )}
              {filteredPinned.map(loc => {
                const t = typeMap[loc.locationType];
                const Icon = t?.icon ?? MapPin;
                const isSelected = selectedId === loc.id;
                return (
                  <button
                    key={loc.id}
                    type="button"
                    className={`w-full text-left px-3 py-2.5 flex items-start gap-3 border-b last:border-b-0 transition-colors ${
                      isSelected ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-muted/30"
                    }`}
                    onClick={() => {
                      setSelectedId(loc.id);
                      panTo(loc.id);
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                      style={{ backgroundColor: t?.markerColour ?? "#9ca3af" }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{loc.name}</p>
                      <p className="text-xs text-foreground/50 truncate">{t?.label ?? loc.locationType}</p>
                      {loc.description && (
                        <p className="text-xs text-foreground/40 truncate">{loc.description}</p>
                      )}
                    </div>
                  </button>
                );
              })}

              {unpinned.length > 0 && (
                <div className="px-3 py-2 bg-muted/20 border-t">
                  <p className="text-xs text-foreground/50 font-medium mb-1.5">Not yet pinned</p>
                  {unpinned.filter(l => !filterType || l.locationType === filterType).map(loc => {
                    const t = typeMap[loc.locationType];
                    return (
                      <div key={loc.id} className="py-1 flex items-center gap-2 text-xs text-foreground/40">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{loc.name}</span>
                        <Badge variant="outline" className="text-[10px] py-0 ml-auto flex-shrink-0">No pin</Badge>
                      </div>
                    );
                  })}
                  <Link href="/farm-locations">
                    <span className="text-xs text-primary hover:underline cursor-pointer mt-1 block">
                      Add pins →
                    </span>
                  </Link>
                </div>
              )}

              {/* Inspection legend when overlay is active */}
              {showInspections && (
                <div className="px-3 py-2 bg-amber-50/50 border-t border-amber-100">
                  <p className="text-[10px] font-semibold text-amber-800 mb-1.5">Field Inspection Markers</p>
                  {[
                    { key: "urgent", label: "Urgent action" },
                    { key: "treat", label: "Treatment needed" },
                    { key: "monitor", label: "Monitor" },
                    { key: "none", label: "No action" },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-1.5 text-[10px] text-foreground/60 mb-0.5">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: INSPECTION_COLOURS[key] }} />
                      {label}
                    </div>
                  ))}
                  {inspectionsWithGeo.length === 0 && (
                    <p className="text-[10px] text-foreground/40 mt-1">No geo-tagged inspections found.</p>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Map */}
          <Card className="overflow-hidden p-0">
            <div
              ref={containerRef}
              style={{ height: "calc(100vh - 220px)", minHeight: 400 }}
            />
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
