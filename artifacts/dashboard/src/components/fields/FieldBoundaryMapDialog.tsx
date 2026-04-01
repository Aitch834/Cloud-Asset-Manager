import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppStore } from "@/hooks/use-app-store";

interface LatLng { lat: number; lng: number; }

interface Props {
  fieldId: number;
  fieldName: string;
  open: boolean;
  onClose: () => void;
  onSaved: (areaHectares: number) => void;
}

function shoelaceHectares(pts: LatLng[]): number {
  if (pts.length < 3) return 0;
  const R = 6371000;
  let area = 0;
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const xi = (pts[i].lng * Math.PI / 180) * R * Math.cos((pts[i].lat * Math.PI / 180));
    const yi = (pts[i].lat * Math.PI / 180) * R;
    const xj = (pts[j].lng * Math.PI / 180) * R * Math.cos((pts[j].lat * Math.PI / 180));
    const yj = (pts[j].lat * Math.PI / 180) * R;
    area += xi * yj - xj * yi;
  }
  return Math.abs(area / 2) / 10000;
}

function destroyMap(ctx: { map: L.Map; polygon: L.Polygon | null; markers: L.Marker[] } | null) {
  if (!ctx) return;
  try {
    ctx.map.off();
    ctx.map.remove();
  } catch { }
}

export function FieldBoundaryMapDialog({ fieldId, fieldName, open, onClose, onSaved }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<{
    map: L.Map;
    polygon: L.Polygon | null;
    markers: L.Marker[];
  } | null>(null);
  const { farmId } = useAppStore();

  const [points, setPoints] = useState<LatLng[]>([]);
  const [area, setArea] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leafletReady, setLeafletReady] = useState(false);
  const [existingBoundary, setExistingBoundary] = useState<LatLng[] | null>(null);

  useEffect(() => {
    if (open) {
      import("leaflet").then((L) => {
        if (!("_leafletLoaded" in window)) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
          (window as Record<string, unknown>)["_leafletLoaded"] = true;
        }
        (window as Record<string, unknown>)["_L"] = L;
        setLeafletReady(true);
      });
    } else {
      destroyMap(leafletRef.current);
      leafletRef.current = null;
      setPoints([]);
      setArea(0);
      setError(null);
      setExistingBoundary(null);
      setLeafletReady(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !farmId) return;
    fetch(`/api/farms/${farmId}/fields/${fieldId}/boundary`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.boundary?.polygonPoints) {
          setExistingBoundary(d.boundary.polygonPoints as LatLng[]);
        }
      })
      .catch(() => {});
  }, [open, farmId, fieldId]);

  useEffect(() => {
    if (!open || !leafletReady || !mapRef.current) return;
    const L = (window as Record<string, unknown>)["_L"] as typeof import("leaflet");

    destroyMap(leafletRef.current);
    leafletRef.current = null;

    const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: true }).setView([52.2, -1.0], 13);
    map.scrollWheelZoom.enable();

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics",
        maxZoom: 20,
      }
    ).addTo(map);

    leafletRef.current = { map, polygon: null, markers: [] };

    if (existingBoundary && existingBoundary.length >= 3) {
      const latlngs = existingBoundary.map((p) => [p.lat, p.lng] as [number, number]);
      const poly = L.polygon(latlngs, { color: "#16a34a", fillOpacity: 0.2 }).addTo(map);
      leafletRef.current.polygon = poly;
      map.fitBounds(poly.getBounds(), { padding: [40, 40] });
      setPoints(existingBoundary);
      setArea(shoelaceHectares(existingBoundary));

      existingBoundary.forEach((pt) => {
        const marker = L.circleMarker([pt.lat, pt.lng], {
          radius: 6, color: "#16a34a", fillColor: "#fff", fillOpacity: 1, weight: 2,
        } as unknown as L.MarkerOptions).addTo(map) as unknown as L.Marker;
        leafletRef.current!.markers.push(marker);
      });
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => { map.setView([pos.coords.latitude, pos.coords.longitude], 16); },
          () => {}
        );
      }
    }

    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setPoints((prev) => {
        const next = [...prev, { lat, lng }];
        setArea(shoelaceHectares(next));
        const ctx = leafletRef.current;
        if (!ctx) return next;

        const marker = L.circleMarker([lat, lng], {
          radius: 6, color: "#16a34a", fillColor: "#fff", fillOpacity: 1, weight: 2,
        } as unknown as L.MarkerOptions).addTo(ctx.map) as unknown as L.Marker;
        ctx.markers.push(marker);

        if (ctx.polygon) ctx.polygon.remove();
        if (next.length >= 3) {
          ctx.polygon = L.polygon(
            next.map((p) => [p.lat, p.lng] as [number, number]),
            { color: "#16a34a", fillOpacity: 0.2 }
          ).addTo(ctx.map);
        }
        return next;
      });
    });

    return () => {
      destroyMap(leafletRef.current);
      leafletRef.current = null;
    };
  }, [open, leafletReady, existingBoundary]);

  const handleUndo = () => {
    setPoints((prev) => {
      const next = prev.slice(0, -1);
      setArea(shoelaceHectares(next));
      const ctx = leafletRef.current;
      if (ctx) {
        const last = ctx.markers.pop();
        if (last) (last as unknown as L.CircleMarker).remove();
        if (ctx.polygon) ctx.polygon.remove();
        if (next.length >= 3) {
          const L = (window as Record<string, unknown>)["_L"] as typeof import("leaflet");
          ctx.polygon = L.polygon(
            next.map((p) => [p.lat, p.lng] as [number, number]),
            { color: "#16a34a", fillOpacity: 0.2 }
          ).addTo(ctx.map);
        } else {
          ctx.polygon = null;
        }
      }
      return next;
    });
  };

  const handleClear = () => {
    setPoints([]);
    setArea(0);
    const ctx = leafletRef.current;
    if (ctx) {
      ctx.markers.forEach((m) => (m as unknown as L.CircleMarker).remove());
      ctx.markers = [];
      if (ctx.polygon) { ctx.polygon.remove(); ctx.polygon = null; }
    }
  };

  const handleSave = async () => {
    if (!farmId || points.length < 3) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/farms/${farmId}/fields/${fieldId}/boundary`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ polygonPoints: points, areaHectares: area, capturedBy: "web-map" }),
      });
      if (!res.ok) throw new Error("Failed to save boundary");
      onSaved(area);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-6 pt-5 pb-3">
          <DialogTitle>Draw Field Boundary — {fieldName}</DialogTitle>
          <DialogDescription>
            Click on the satellite map to place boundary points. Close the polygon with 3+ points.
          </DialogDescription>
        </DialogHeader>

        <div className="relative w-full" style={{ height: 440 }}>
          <div ref={mapRef} className="w-full h-full" />

          {!leafletReady && open && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
              <div className="text-sm text-white bg-black/60 rounded-lg px-4 py-2">Loading map…</div>
            </div>
          )}

          {leafletReady && (
            <div className="absolute top-3 left-3 bg-white rounded-xl shadow-md px-3 py-2 text-sm z-[999] border border-border/40">
              {points.length === 0 && <span className="text-foreground/60">Click map to add points</span>}
              {points.length > 0 && points.length < 3 && (
                <span className="text-foreground/70">{points.length} point{points.length > 1 ? "s" : ""} — need {3 - points.length} more</span>
              )}
              {points.length >= 3 && (
                <span className="font-semibold text-green-700">
                  {area.toFixed(2)} ha &middot; {points.length} pts
                </span>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 flex-row items-center gap-2 border-t bg-white">
          {error && <p className="text-sm text-red-600 flex-1">{error}</p>}
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={handleUndo} disabled={points.length === 0}>
              Undo
            </Button>
            <Button variant="outline" size="sm" onClick={handleClear} disabled={points.length === 0}>
              Clear
            </Button>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={points.length < 3 || saving}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {saving ? "Saving…" : `Save Boundary (${area.toFixed(2)} ha)`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
