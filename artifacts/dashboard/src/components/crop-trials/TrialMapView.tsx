import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/hooks/use-app-store";
import { cropYearLabel } from "@/lib/cropYear";

interface LatLng { lat: number; lng: number; }

interface Plot {
  id: number;
  plotNumber: string;
  treatmentLabel: string | null;
  isControl: boolean;
  latitude: string | null;
  longitude: string | null;
}

interface Trial {
  id: number;
  trialName: string;
  cropName: string | null;
  season: string | null;
  status: string;
  fieldId: number | null;
  plots: Plot[];
}

interface FieldBoundaryEntry {
  fieldId: number;
  fieldName: string;
  boundary: { polygonPoints: LatLng[] } | null;
}

interface Props {
  trials: Trial[];
  cropYear: number;
}

const STATUS_COLORS: Record<string, { stroke: string; fill: string }> = {
  planned:   { stroke: "#6b7280", fill: "#6b728033" },
  active:    { stroke: "#2563eb", fill: "#2563eb33" },
  harvested: { stroke: "#16a34a", fill: "#16a34a33" },
  completed: { stroke: "#a16207", fill: "#a1620733" },
  cancelled: { stroke: "#dc2626", fill: "#dc262633" },
};

const STATUS_LABELS: Record<string, string> = {
  planned: "Planned", active: "Active", harvested: "Harvested",
  completed: "Completed", cancelled: "Cancelled",
};

function destroyMap(map: import("leaflet").Map | null) {
  if (!map) return;
  try { map.off(); map.remove(); } catch { }
}

export function TrialMapView({ trials, cropYear }: Props) {
  const { farmId } = useAppStore();
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<import("leaflet").Map | null>(null);
  const [boundaries, setBoundaries] = useState<FieldBoundaryEntry[]>([]);
  const [leafletReady, setLeafletReady] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load Leaflet
  useEffect(() => {
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
    return () => { destroyMap(leafletMapRef.current); leafletMapRef.current = null; };
  }, []);

  // Fetch all field boundaries for the farm
  useEffect(() => {
    if (!farmId) return;
    setLoading(true);
    fetch(`/api/farms/${farmId}/fields/boundaries/all`, { credentials: "include" })
      .then(r => r.json())
      .then(d => setBoundaries(d.boundaries ?? []))
      .catch(() => setBoundaries([]))
      .finally(() => setLoading(false));
  }, [farmId]);

  // Draw map
  useEffect(() => {
    if (!leafletReady || !mapRef.current || loading) return;
    const L = (window as Record<string, unknown>)["_L"] as typeof import("leaflet");

    destroyMap(leafletMapRef.current);
    leafletMapRef.current = null;

    const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: true }).setView([52.4, -1.5], 11);
    map.scrollWheelZoom.enable();
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { attribution: "Tiles &copy; Esri &mdash; Esri, Maxar, Earthstar Geographics", maxZoom: 20 }
    ).addTo(map);
    leafletMapRef.current = map;

    const allBounds: [number, number][] = [];
    const seasonLabel = cropYearLabel(cropYear);

    trials.forEach(trial => {
      if (trial.season && trial.season !== seasonLabel) return;
      if (!trial.fieldId) return;

      const fieldEntry = boundaries.find(b => b.fieldId === trial.fieldId);
      const colors = STATUS_COLORS[trial.status] ?? STATUS_COLORS.planned;

      if (fieldEntry?.boundary?.polygonPoints?.length >= 3) {
        const pts = fieldEntry.boundary.polygonPoints as LatLng[];
        const latlngs = pts.map(p => [p.lat, p.lng] as [number, number]);
        const poly = L.polygon(latlngs, {
          color: colors.stroke,
          fillColor: colors.fill.slice(0, 7),
          fillOpacity: 0.35,
          weight: 2.5,
        }).addTo(map);

        const yieldPlots = trial.plots.filter(p => p.latitude);
        const popupHtml = `
          <div style="font-family:system-ui;font-size:13px;min-width:180px">
            <p style="font-weight:700;margin:0 0 4px">${trial.trialName}</p>
            <p style="margin:0 0 2px;color:#6b7280">${[trial.cropName, trial.season].filter(Boolean).join(" · ")}</p>
            <span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;background:${colors.fill.slice(0, 7)}22;color:${colors.stroke};border:1px solid ${colors.stroke}30">${STATUS_LABELS[trial.status] ?? trial.status}</span>
            <p style="margin:6px 0 0;font-size:11px;color:#374151">${trial.plots.length} plot${trial.plots.length !== 1 ? "s" : ""} · ${yieldPlots.length} with GPS</p>
            <p style="margin:2px 0 0;font-size:11px;color:#6b7280">Field: ${fieldEntry.fieldName}</p>
          </div>`;
        poly.bindPopup(popupHtml);
        latlngs.forEach(p => allBounds.push(p));
      }

      // Plot GPS pins
      trial.plots.forEach(plot => {
        if (!plot.latitude || !plot.longitude) return;
        const lat = parseFloat(plot.latitude);
        const lng = parseFloat(plot.longitude);
        if (isNaN(lat) || isNaN(lng)) return;

        const pinHtml = `<div style="width:20px;height:20px;border-radius:50%;background:${plot.isControl ? "#fde047" : colors.stroke};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:${plot.isControl ? "#92400e" : "#fff"}">${plot.plotNumber}</div>`;
        const icon = L.divIcon({ html: pinHtml, className: "", iconSize: [20, 20], iconAnchor: [10, 10] });
        const marker = L.marker([lat, lng], { icon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family:system-ui;font-size:12px">
            <p style="font-weight:700;margin:0">Plot ${plot.plotNumber}${plot.isControl ? " (Control)" : ""}</p>
            ${plot.treatmentLabel ? `<p style="margin:2px 0 0;color:#6b7280">${plot.treatmentLabel}</p>` : ""}
            <p style="margin:4px 0 0;font-size:10px;color:#9ca3af">${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
          </div>`);
        allBounds.push([lat, lng]);
      });
    });

    if (allBounds.length > 0) {
      map.fitBounds(allBounds as [number, number][], { padding: [40, 40] });
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => map.setView([pos.coords.latitude, pos.coords.longitude], 13),
        () => {}
      );
    }
  }, [leafletReady, loading, trials, boundaries, cropYear]);

  const seasonLabel = cropYearLabel(cropYear);
  const visibleTrials = trials.filter(t => !t.season || t.season === seasonLabel);
  const trialsWithBoundary = visibleTrials.filter(t => t.fieldId && boundaries.find(b => b.fieldId === t.fieldId && b.boundary));
  const trialsNoBoundary = visibleTrials.filter(t => t.fieldId && !boundaries.find(b => b.fieldId === t.fieldId && b.boundary));

  const presentStatuses = [...new Set(visibleTrials.map(t => t.status))];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Legend */}
      {presentStatuses.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          {presentStatuses.map(s => {
            const c = STATUS_COLORS[s] ?? STATUS_COLORS.planned;
            return (
              <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.75rem", fontWeight: 600, padding: "3px 10px", borderRadius: 12, background: c.fill.slice(0, 7) + "22", color: c.stroke, border: `1px solid ${c.stroke}50` }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: c.stroke, display: "inline-block" }} />
                {STATUS_LABELS[s]}
              </span>
            );
          })}
          <span style={{ fontSize: "0.75rem", color: "#9ca3af", marginLeft: 4 }}>Click a field polygon for details · Numbered pins = GPS-located plots</span>
        </div>
      )}

      {/* Map */}
      <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1px solid #e5e7eb" }}>
        {(loading || !leafletReady) && (
          <div style={{ position: "absolute", inset: 0, background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
            <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>Loading map…</p>
          </div>
        )}
        <div ref={mapRef} style={{ height: 480, width: "100%" }} />
      </div>

      {/* No-boundary notes */}
      {trialsNoBoundary.length > 0 && (
        <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", fontSize: "0.8125rem", color: "#92400e" }}>
          <strong>Fields without a boundary drawn ({trialsNoBoundary.length}):</strong>{" "}
          {trialsNoBoundary.map(t => t.trialName).join(", ")} — go to the Fields page and draw a boundary to show these on the map.
        </div>
      )}

      {visibleTrials.length === 0 && (
        <div style={{ textAlign: "center", padding: "32px 16px", color: "#9ca3af" }}>
          <p style={{ fontWeight: 600, color: "#374151" }}>No trials for {seasonLabel}</p>
          <p style={{ fontSize: "0.875rem" }}>Select a different crop year or create a new trial.</p>
        </div>
      )}
    </div>
  );
}
