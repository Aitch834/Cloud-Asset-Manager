import { useEffect, useRef, useState } from "react";
import { MapPin, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  lat: string;
  lng: string;
  locationDescription: string;
  onLatLngChange: (lat: string, lng: string) => void;
  onDescriptionChange: (desc: string) => void;
}

function destroyMap(map: import("leaflet").Map | null) {
  if (!map) return;
  try { map.off(); map.remove(); } catch { }
}

export function SoilLocationPicker({ lat, lng, locationDescription, onLatLngChange, onDescriptionChange }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<import("leaflet").Map | null>(null);
  const markerRef = useRef<import("leaflet").Marker | null>(null);
  const [leafletReady, setLeafletReady] = useState(false);
  const [expanded, setExpanded] = useState(!!(lat && lng));

  useEffect(() => {
    import("leaflet").then((L) => {
      if (!("_leafletLoaded" in window)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
        (window as unknown as Record<string, unknown>)["_leafletLoaded"] = true;
      }
      (window as unknown as Record<string, unknown>)["_L"] = L;
      setLeafletReady(true);
    });
    return () => {
      destroyMap(leafletMapRef.current);
      leafletMapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!leafletReady || !expanded || !mapRef.current) return;
    const L = (window as unknown as Record<string, unknown>)["_L"] as typeof import("leaflet");

    if (leafletMapRef.current) {
      leafletMapRef.current.invalidateSize();
      return;
    }

    const initLat = lat ? parseFloat(lat) : 52.4;
    const initLng = lng ? parseFloat(lng) : -1.5;
    const initZoom = lat && lng ? 16 : 6;

    const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: true }).setView([initLat, initLng], initZoom);
    map.scrollWheelZoom.enable();
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { attribution: "Tiles &copy; Esri &mdash; Esri, Maxar, Earthstar Geographics", maxZoom: 20 }
    ).addTo(map);
    leafletMapRef.current = map;

    const pinHtml = `<div style="width:28px;height:28px;display:flex;align-items:center;justify-content:center">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#dc2626" width="28" height="28">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    </div>`;
    const icon = L.divIcon({ html: pinHtml, className: "", iconSize: [28, 28], iconAnchor: [14, 28] });

    if (lat && lng) {
      const parsedLat = parseFloat(lat);
      const parsedLng = parseFloat(lng);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        markerRef.current = L.marker([parsedLat, parsedLng], { icon, draggable: true }).addTo(map);
        markerRef.current.on("dragend", () => {
          const pos = markerRef.current!.getLatLng();
          onLatLngChange(pos.lat.toFixed(6), pos.lng.toFixed(6));
        });
      }
    }

    map.on("click", (e: import("leaflet").LeafletMouseEvent) => {
      const { lat: clickLat, lng: clickLng } = e.latlng;
      if (markerRef.current) {
        markerRef.current.setLatLng([clickLat, clickLng]);
      } else {
        markerRef.current = L.marker([clickLat, clickLng], { icon, draggable: true }).addTo(map);
        markerRef.current.on("dragend", () => {
          const pos = markerRef.current!.getLatLng();
          onLatLngChange(pos.lat.toFixed(6), pos.lng.toFixed(6));
        });
      }
      onLatLngChange(clickLat.toFixed(6), clickLng.toFixed(6));
    });
  }, [leafletReady, expanded]);

  useEffect(() => {
    if (!markerRef.current || !lat || !lng) return;
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
      markerRef.current.setLatLng([parsedLat, parsedLng]);
    }
  }, [lat, lng]);

  function handleClear() {
    if (markerRef.current && leafletMapRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    onLatLngChange("", "");
  }

  function handleToggle() {
    const next = !expanded;
    setExpanded(next);
    if (next) {
      setTimeout(() => {
        leafletMapRef.current?.invalidateSize();
      }, 100);
    } else {
      destroyMap(leafletMapRef.current);
      leafletMapRef.current = null;
      markerRef.current = null;
    }
  }

  const hasPin = !!(lat && lng);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground/70 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-red-500" />
          Sample Point Location
        </label>
        <button
          type="button"
          onClick={handleToggle}
          className="text-xs text-primary hover:underline"
        >
          {expanded ? "Hide map" : hasPin ? "Edit on map" : "Pick on map"}
        </button>
      </div>

      {expanded && (
        <div className="rounded-md border border-border overflow-hidden" style={{ position: "relative" }}>
          {!leafletReady && (
            <div className="absolute inset-0 bg-muted flex items-center justify-content-center z-10 flex items-center justify-center" style={{ height: 260 }}>
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}
          <div ref={mapRef} style={{ height: 260, width: "100%" }} />
          <div className="absolute bottom-2 left-2 right-2 z-[1000] pointer-events-none flex justify-center">
            <div className="bg-black/60 text-white text-xs rounded-full px-3 py-1">
              {hasPin ? "Drag pin to adjust · Click to move" : "Click map to place sample point"}
            </div>
          </div>
        </div>
      )}

      {hasPin && (
        <div className="flex items-center gap-2">
          <div className="flex-1 grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground mb-0.5 block">Latitude</label>
              <input
                type="text"
                value={lat}
                onChange={e => onLatLngChange(e.target.value, lng)}
                className="w-full h-8 rounded-md border border-input bg-background px-2 py-1 text-xs font-mono"
                placeholder="51.500000"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-0.5 block">Longitude</label>
              <input
                type="text"
                value={lng}
                onChange={e => onLatLngChange(lat, e.target.value)}
                className="w-full h-8 rounded-md border border-input bg-background px-2 py-1 text-xs font-mono"
                placeholder="-1.500000"
              />
            </div>
          </div>
          <Button type="button" variant="ghost" size="sm" className="mt-4 text-muted-foreground hover:text-destructive" onClick={handleClear}>
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {!hasPin && !expanded && (
        <p className="text-xs text-muted-foreground">No GPS point recorded. Click "Pick on map" to mark the exact sample location within the field.</p>
      )}

      <div>
        <label className="text-xs text-muted-foreground mb-0.5 block">Location description (optional)</label>
        <input
          type="text"
          value={locationDescription}
          onChange={e => onDescriptionChange(e.target.value)}
          className="w-full h-8 rounded-md border border-input bg-background px-2 py-1 text-sm"
          placeholder="e.g. NE corner near hedge, 50m from gate"
        />
      </div>
    </div>
  );
}
