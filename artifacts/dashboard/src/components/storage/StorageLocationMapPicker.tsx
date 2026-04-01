import { useEffect, useRef, useState } from "react";
import { MapPin, LocateFixed, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LatLng {
  lat: number;
  lng: number;
}

interface Props {
  value: LatLng | null;
  onChange: (point: LatLng | null) => void;
  mapHeight?: number;
}

declare global {
  interface Window {
    _L?: typeof import("leaflet");
    _leafletLoaded?: boolean;
  }
}

export function StorageLocationMapPicker({ value, onChange, mapHeight = 280 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<{
    map: import("leaflet").Map;
    marker: import("leaflet").Marker | null;
  } | null>(null);
  const [ready, setReady] = useState(false);
  const [locating, setLocating] = useState(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

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
      setReady(true);
    });

    return () => {
      if (leafletRef.current) {
        try {
          leafletRef.current.map.off();
          leafletRef.current.map.remove();
        } catch {}
        leafletRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!ready || !containerRef.current || leafletRef.current) return;
    const L = window._L!;

    const defaultCenter: [number, number] = value
      ? [value.lat, value.lng]
      : [52.8, -1.5];
    const defaultZoom = value ? 16 : 6;

    const map = L.map(containerRef.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      zoomControl: true,
      scrollWheelZoom: true,
    });
    map.scrollWheelZoom.enable();

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 20,
    }).addTo(map);

    const markerIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    let marker: import("leaflet").Marker | null = null;

    if (value) {
      marker = L.marker([value.lat, value.lng], { draggable: true, icon: markerIcon }).addTo(map);
      marker.on("dragend", () => {
        const pos = marker!.getLatLng();
        onChangeRef.current({ lat: pos.lat, lng: pos.lng });
      });
    }

    map.on("click", (e: import("leaflet").LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (marker) {
        marker.setLatLng([lat, lng]);
      } else {
        marker = L.marker([lat, lng], { draggable: true, icon: markerIcon }).addTo(map);
        marker.on("dragend", () => {
          const pos = marker!.getLatLng();
          onChangeRef.current({ lat: pos.lat, lng: pos.lng });
        });
        leafletRef.current!.marker = marker;
      }
      onChangeRef.current({ lat, lng });
    });

    leafletRef.current = { map, marker };
  }, [ready, value]);

  function handleLocate() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude: lat, longitude: lng } = pos.coords;
        const L = window._L!;
        const ctx = leafletRef.current;
        if (!ctx) return;

        ctx.map.setView([lat, lng], 17);

        if (ctx.marker) {
          ctx.marker.setLatLng([lat, lng]);
        } else {
          const markerIcon = L.icon({
            iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
            iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          });
          ctx.marker = L.marker([lat, lng], { draggable: true, icon: markerIcon }).addTo(ctx.map);
          ctx.marker.on("dragend", () => {
            const p = ctx.marker!.getLatLng();
            onChangeRef.current({ lat: p.lat, lng: p.lng });
          });
        }
        onChangeRef.current({ lat, lng });
      },
      () => {
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function handleClear() {
    const ctx = leafletRef.current;
    if (ctx?.marker) {
      ctx.map.removeLayer(ctx.marker);
      ctx.marker = null;
    }
    onChange(null);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>Click the map to pin the location, or drag the marker to adjust</span>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLocate}
            disabled={locating}
            className="gap-1.5"
          >
            <LocateFixed className="h-3.5 w-3.5" />
            {locating ? "Locating…" : "Use my location"}
          </Button>
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="gap-1.5 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <div
        ref={containerRef}
        style={{ height: mapHeight, borderRadius: 8, border: "1px solid hsl(var(--border))", overflow: "hidden" }}
      />

      {value ? (
        <p className="text-xs text-muted-foreground font-mono">
          📍 {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">No location pinned yet</p>
      )}
    </div>
  );
}
