import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Map as MapIcon, AlertCircle, Camera, ClipboardList, Leaf, Bug } from "lucide-react";
import { VineyardBlockBoundaryMapDialog } from "./VineyardBlockBoundaryMapDialog";

import { apiUrl as api } from "@/lib/api";

interface LatLng { lat: number; lng: number; }
interface BlockBoundary { blockId: number; polygonPoints: LatLng[]; capturedAt: string; }

type LeafletCtx = { map: import("leaflet").Map };

const STATUS_STYLES: Record<string, { fill: string; stroke: string; label: string; badge: string }> = {
  active:      { fill: "#16a34a", stroke: "#15803d", label: "Active",      badge: "bg-green-100 text-green-800" },
  suspended:   { fill: "#d97706", stroke: "#b45309", label: "Suspended",   badge: "bg-amber-100 text-amber-800" },
  no_planting: { fill: "#6b7280", stroke: "#4b5563", label: "No Planting", badge: "bg-gray-100 text-gray-600" },
};

function centroid(pts: LatLng[]): LatLng {
  return {
    lat: pts.reduce((s, p) => s + p.lat, 0) / pts.length,
    lng: pts.reduce((s, p) => s + p.lng, 0) / pts.length,
  };
}

function destroyLeaflet(ctx: LeafletCtx | null) {
  if (!ctx) return;
  try { ctx.map.off(); ctx.map.remove(); } catch { /* already removed */ }
}

export function VineyardBlockMapTab({
  farmId,
  blocks,
  onNavigate,
}: {
  farmId: number;
  blocks: Record<string, unknown>[];
  onNavigate?: (tab: string, blockId?: number) => void;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletCtxRef = useRef<LeafletCtx | null>(null);
  const [leafletReady, setLeafletReady] = useState(false);
  const [boundaryDialogBlock, setBoundaryDialogBlock] = useState<{ id: number; name: string } | null>(null);
  const qc = useQueryClient();

  const { data: boundaryData, isLoading } = useQuery<{ boundaries: BlockBoundary[] }>({
    queryKey: ["vineyard-block-boundaries-all", farmId],
    queryFn: async () => {
      const r = await fetch(api(`farms/${farmId}/vineyard-blocks/boundaries`), { credentials: "include" });
      if (!r.ok) throw new Error("Failed to load boundaries");
      return r.json();
    },
    enabled: !!farmId,
  });

  const boundaries = boundaryData?.boundaries ?? [];
  const boundaryByBlockId = new Map(boundaries.map((b) => [b.blockId, b]));
  const blocksWithBoundary = blocks.filter((b) => boundaryByBlockId.has(b.id as number));
  const blocksWithout = blocks.filter((b) => !boundaryByBlockId.has(b.id as number));

  useEffect(() => {
    import("leaflet").then((L) => {
      if (!(window as unknown as Record<string, unknown>)["_leafletLoaded"]) {
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
      destroyLeaflet(leafletCtxRef.current);
      leafletCtxRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!leafletReady || !mapContainerRef.current || isLoading) return;

    const L = (window as unknown as Record<string, unknown>)["_L"] as typeof import("leaflet");

    destroyLeaflet(leafletCtxRef.current);
    leafletCtxRef.current = null;

    const map = L.map(mapContainerRef.current, { zoomControl: true, scrollWheelZoom: true }).setView([52.2, -1.0], 12);
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { attribution: "Tiles &copy; Esri &mdash; Esri, Maxar, Earthstar Geographics", maxZoom: 20 }
    ).addTo(map);

    leafletCtxRef.current = { map };

    const allBounds: import("leaflet").LatLngBounds[] = [];

    boundaries.forEach((boundary) => {
      const block = blocks.find((b) => (b.id as number) === boundary.blockId);
      if (!block || boundary.polygonPoints.length < 3) return;

      const status = String(block.plantingStatus ?? "no_planting");
      const style = STATUS_STYLES[status] ?? STATUS_STYLES.no_planting;
      const latlngs = boundary.polygonPoints.map((p) => [p.lat, p.lng] as [number, number]);

      const poly = L.polygon(latlngs, {
        color: style.stroke,
        fillColor: style.fill,
        fillOpacity: 0.35,
        weight: 2,
      }).addTo(map);

      const areaStr = block.areaHa
        ? parseFloat(String(block.areaHa)).toFixed(2) + " ha"
        : "Area unknown";

      poly.bindPopup(`
        <div style="min-width:160px;font-family:sans-serif">
          <div style="font-weight:700;font-size:14px;margin-bottom:6px">${String(block.blockName ?? "")}</div>
          <div style="font-size:12px;color:#555;margin-bottom:2px">Variety: <strong>${String(block.variety ?? "—")}</strong></div>
          <div style="font-size:12px;color:#555;margin-bottom:2px">Area: <strong>${areaStr}</strong></div>
          <div style="font-size:12px;color:#555">Status: <strong>${style.label}</strong></div>
        </div>
      `);

      const ctr = centroid(boundary.polygonPoints);
      L.marker([ctr.lat, ctr.lng], {
        icon: L.divIcon({
          className: "",
          html: `<div style="background:rgba(255,255,255,0.92);border:1px solid #ccc;border-radius:4px;padding:2px 6px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.2);pointer-events:none">${String(block.blockName ?? "")}</div>`,
          iconAnchor: [0, 0],
        }),
      }).addTo(map);

      allBounds.push(poly.getBounds());
    });

    if (allBounds.length > 0) {
      let combined = allBounds[0];
      allBounds.slice(1).forEach((b) => { combined = combined.extend(b); });
      map.fitBounds(combined, { padding: [48, 48] });
    }
  }, [leafletReady, boundaries, blocks, isLoading]);

  const handleBoundarySaved = () => {
    qc.invalidateQueries({ queryKey: ["vineyard-block-boundaries-all", farmId] });
    setBoundaryDialogBlock(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <p className="text-sm text-muted-foreground">
          Satellite overview of all vineyard block boundaries. Click a block polygon for details.
        </p>
        <div className="flex items-center gap-4 ml-auto">
          {Object.values(STATUS_STYLES).map((s) => (
            <span key={s.label} className="flex items-center gap-1.5 text-xs font-medium">
              <span
                className="w-3 h-3 rounded-sm inline-block"
                style={{ background: s.fill, border: `2px solid ${s.stroke}` }}
              />
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <div
          className="flex-1 rounded-xl overflow-hidden border border-border/50 relative"
          style={{ height: 520 }}
        >
          <div ref={mapContainerRef} className="w-full h-full" />

          {(!leafletReady || isLoading) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
              <div className="text-sm text-white bg-black/60 rounded-lg px-4 py-2">Loading map…</div>
            </div>
          )}

          {leafletReady && !isLoading && boundaries.length === 0 && blocks.length > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/25">
              <div className="bg-white rounded-2xl px-8 py-6 shadow-xl text-center max-w-xs">
                <MapIcon className="w-10 h-10 text-violet-400 mx-auto mb-3" />
                <p className="font-semibold text-sm mb-1">No boundaries drawn yet</p>
                <p className="text-xs text-muted-foreground">
                  Use the "Draw" buttons on the right to map your vineyard blocks.
                </p>
              </div>
            </div>
          )}

          {leafletReady && !isLoading && blocks.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/25">
              <div className="bg-white rounded-2xl px-8 py-6 shadow-xl text-center max-w-xs">
                <MapIcon className="w-10 h-10 text-violet-300 mx-auto mb-3" />
                <p className="font-semibold text-sm mb-1">No blocks registered</p>
                <p className="text-xs text-muted-foreground">
                  Add vineyard blocks in the Blocks tab first, then draw their boundaries here.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="w-72 space-y-2 overflow-y-auto" style={{ maxHeight: 520 }}>
          {blocksWithBoundary.length > 0 && (
            <>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
                Mapped ({blocksWithBoundary.length})
              </p>
              {blocksWithBoundary.map((b) => {
                const status = String(b.plantingStatus ?? "no_planting");
                const style = STATUS_STYLES[status] ?? STATUS_STYLES.no_planting;
                // Use first gallery photo if available, fall back to legacy single photo
                const blockPhotos = b.photos as Array<{ id: number; objectPath: string }> | undefined;
                const firstGalleryPhoto = blockPhotos?.[0];
                const photoSrc = firstGalleryPhoto
                  ? `${api(`farms/${farmId}/vineyard-blocks/${b.id as number}/photos/${firstGalleryPhoto.id}`)}?t=${String(firstGalleryPhoto.id)}`
                  : b.photoObjectPath
                    ? `${api(`farms/${farmId}/vineyard-blocks/${b.id as number}/photo`)}?t=${String(b.id)}`
                    : null;
                return (
                  <div
                    key={String(b.id)}
                    className="bg-white rounded-lg border overflow-hidden text-sm"
                  >
                    {photoSrc && (
                      <img
                        src={photoSrc}
                        alt={String(b.blockName ?? "")}
                        className="w-full h-24 object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    )}
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-semibold truncate">{String(b.blockName ?? "")}</div>
                          {!!b.variety && (
                            <div className="text-xs text-muted-foreground truncate mt-0.5">
                              {String(b.variety)}
                            </div>
                          )}
                          {!!b.areaHa && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {parseFloat(String(b.areaHa)).toFixed(2)} ha
                            </div>
                          )}
                        </div>
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${style.badge}`}
                        >
                          {style.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-violet-700 hover:bg-violet-50"
                          onClick={() =>
                            setBoundaryDialogBlock({ id: b.id as number, name: String(b.blockName ?? "") })
                          }
                        >
                          Edit Boundary
                        </Button>
                        {onNavigate && (
                          <>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-emerald-700 hover:bg-emerald-50" onClick={() => onNavigate("vine-register", b.id as number)}>
                              <ClipboardList className="w-3 h-3 mr-0.5" />Register
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-sky-700 hover:bg-sky-50" onClick={() => onNavigate("phenology", b.id as number)}>
                              <Leaf className="w-3 h-3 mr-0.5" />Phenology
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {blocksWithout.length > 0 && (
            <>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1 mt-3">
                No Boundary ({blocksWithout.length})
              </p>
              {blocksWithout.map((b) => (
                <div
                  key={String(b.id)}
                  className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="font-semibold truncate flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate">{String(b.blockName ?? "")}</span>
                    </div>
                    {!!b.variety && (
                      <div className="text-xs text-muted-foreground truncate mt-0.5 pl-5">
                        {String(b.variety)}
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="h-7 px-3 text-xs bg-violet-600 hover:bg-violet-700 text-white shrink-0"
                    onClick={() =>
                      setBoundaryDialogBlock({ id: b.id as number, name: String(b.blockName ?? "") })
                    }
                  >
                    Draw
                  </Button>
                </div>
              ))}
            </>
          )}

          {blocks.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-10">
              No vineyard blocks registered yet.
            </div>
          )}
        </div>
      </div>

      {boundaryDialogBlock && (
        <VineyardBlockBoundaryMapDialog
          blockId={boundaryDialogBlock.id}
          blockName={boundaryDialogBlock.name}
          open={!!boundaryDialogBlock}
          onClose={() => setBoundaryDialogBlock(null)}
          onSaved={handleBoundarySaved}
        />
      )}
    </div>
  );
}
