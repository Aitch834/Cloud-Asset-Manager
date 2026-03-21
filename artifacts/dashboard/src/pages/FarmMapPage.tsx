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
  Search, Settings,
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

const LOCATION_TYPES = [
  { value: "livestock_building", label: "Livestock Building", icon: Building2, colour: "bg-blue-100 text-blue-800", markerColour: "#3b82f6" },
  { value: "crop_store", label: "Crop & Feed Store", icon: Warehouse, colour: "bg-yellow-100 text-yellow-800", markerColour: "#eab308" },
  { value: "equipment_store", label: "Equipment & Workshop", icon: Tractor, colour: "bg-orange-100 text-orange-800", markerColour: "#f97316" },
  { value: "chemical_store", label: "Chemical & Fuel Store", icon: FlaskConical, colour: "bg-red-100 text-red-800", markerColour: "#ef4444" },
  { value: "outdoor_area", label: "Outdoor Area / Yard", icon: TreePine, colour: "bg-green-100 text-green-800", markerColour: "#22c55e" },
  { value: "welfare_facility", label: "Welfare Facility", icon: Users, colour: "bg-purple-100 text-purple-800", markerColour: "#a855f7" },
  { value: "office", label: "Office / Farm Building", icon: LayoutGrid, colour: "bg-slate-100 text-slate-700", markerColour: "#64748b" },
  { value: "other", label: "Other", icon: MapPin, colour: "bg-gray-100 text-gray-700", markerColour: "#9ca3af" },
];

const typeMap = Object.fromEntries(LOCATION_TYPES.map(t => [t.value, t]));

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

function useFarmMap(
  containerRef: React.RefObject<HTMLDivElement>,
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

      const map = L.map(containerRef.current, { center, zoom });
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

  return { panTo };
}

export default function FarmMapPage() {
  const { farmId } = useAppStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filterType, setFilterType] = useState("");

  const { data: locations = [], isLoading } = useQuery<FarmLocation[]>({
    queryKey: ["farm-locations", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/farm-locations`).then(r => r.json()),
    enabled: !!farmId,
  });

  const pinned = locations.filter(l => l.isActive && l.latitude != null);
  const unpinned = locations.filter(l => l.isActive && l.latitude == null);

  const { panTo } = useFarmMap(containerRef, pinned, setSelectedId);

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
            </div>

            <div className="overflow-y-auto max-h-[calc(100vh-280px)]">
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
