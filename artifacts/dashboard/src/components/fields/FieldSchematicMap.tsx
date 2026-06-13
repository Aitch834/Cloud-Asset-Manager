import React, { useState, useRef, useMemo } from "react";
import { Map as MapIcon, Info } from "lucide-react";

interface MapField {
  id: number;
  name?: string;
  fieldReference?: string;
  areaHectares?: string | number | null;
  soilType?: string;
  currentUse?: string;
  isNvz?: boolean;
  isActive?: boolean;
  latitude?: string | number | null;
  longitude?: string | number | null;
}

interface MapCropAssignment {
  fieldId: number;
  cropName?: string;
  season?: string;
  year?: number;
  plantingDate?: string;
  expectedHarvestDate?: string;
}

interface MapLandUseEntry {
  fieldId: number;
  landUse: string;
}

export interface FieldSchematicMapProps {
  fields: MapField[];
  currentCropByField: Record<number, MapCropAssignment>;
  currentLandUseByField: Record<number, MapLandUseEntry>;
  selectedYear: number;
}

const NODE_W = 94;
const NODE_H = 50;
const CANVAS_W = 880;
const CANVAS_H = 500;
const MARGIN_X = 64;
const MARGIN_Y = 52;

const CROP_COLOR_MAP: Array<[string, string, string]> = [
  ["wheat",        "#E32017", "#fff"],
  ["barley",       "#B36305", "#fff"],
  ["oat",          "#B36305", "#fff"],
  ["rye",          "#B36305", "#fff"],
  ["triticale",    "#B36305", "#fff"],
  ["oilseed",      "#FFD300", "#222"],
  ["osr",          "#FFD300", "#222"],
  ["rape",         "#FFD300", "#222"],
  ["linseed",      "#003688", "#fff"],
  ["flax",         "#003688", "#fff"],
  ["bean",         "#007D32", "#fff"],
  ["pea",          "#007D32", "#fff"],
  ["pulse",        "#007D32", "#fff"],
  ["legume",       "#007D32", "#fff"],
  ["potato",       "#9B0056", "#fff"],
  ["sugar beet",   "#9B0056", "#fff"],
  ["sugar",        "#9B0056", "#fff"],
  ["beet",         "#9B0056", "#fff"],
  ["turnip",       "#9B0056", "#fff"],
  ["swede",        "#9B0056", "#fff"],
  ["maize",        "#EE7C0E", "#fff"],
  ["corn",         "#EE7C0E", "#fff"],
  ["grass",        "#76B82A", "#fff"],
  ["ley",          "#76B82A", "#fff"],
  ["pasture",      "#76B82A", "#fff"],
  ["herb",         "#76B82A", "#fff"],
  ["clover",       "#76B82A", "#fff"],
  ["lucerne",      "#76B82A", "#fff"],
  ["alfalfa",      "#76B82A", "#fff"],
  ["vegetable",    "#0098D4", "#fff"],
  ["kale",         "#0098D4", "#fff"],
  ["brassica",     "#0098D4", "#fff"],
  ["leek",         "#0098D4", "#fff"],
  ["onion",        "#0098D4", "#fff"],
  ["carrot",       "#EE7C0E", "#fff"],
  ["parsnip",      "#EE7C0E", "#fff"],
  ["root",         "#9B0056", "#fff"],
  ["mustard",      "#FFD300", "#222"],
  ["phacelia",     "#6950A1", "#fff"],
  ["buckwheat",    "#B36305", "#fff"],
  ["sunflower",    "#FFD300", "#222"],
  ["hemp",         "#76B82A", "#fff"],
];

const LAND_USE_COLORS: Record<string, [string, string]> = {
  fallow:                  ["#A0A5A9", "#fff"],
  sfi:                     ["#76B82A", "#fff"],
  countryside_stewardship: ["#6950A1", "#fff"],
  permanent_grassland:     ["#007D32", "#fff"],
  woodland:                ["#2D5A27", "#fff"],
  set_aside:               ["#A0A5A9", "#fff"],
  out_of_production:       ["#E32017", "#fff"],
  other:                   ["#868F98", "#fff"],
};

const LAND_USE_LABELS: Record<string, string> = {
  fallow:                  "Fallow",
  sfi:                     "SFI Action",
  countryside_stewardship: "CS Scheme",
  permanent_grassland:     "Perm. Grassland",
  woodland:                "Woodland",
  set_aside:               "Set-aside",
  out_of_production:       "Out of Production",
  other:                   "Other",
};

function getFieldColors(cropName?: string | null, landUse?: string | null): [string, string] {
  if (cropName) {
    const lower = cropName.toLowerCase();
    for (const [kw, fill, text] of CROP_COLOR_MAP) {
      if (lower.includes(kw)) return [fill, text];
    }
    return ["#868F98", "#fff"];
  }
  if (landUse && LAND_USE_COLORS[landUse]) return LAND_USE_COLORS[landUse];
  return ["#C5CAD0", "#444"];
}

function truncate(str: string, maxLen: number): string {
  return str.length > maxLen ? str.slice(0, maxLen - 1) + "\u2026" : str;
}

function formatShortDate(s?: string | null): string | null {
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function NorthArrow({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle cx={0} cy={0} r={19} fill="white" stroke="#D1D5DB" strokeWidth={1} opacity={0.92} />
      <polygon points="0,-13 4,-3 0,-1 -4,-3" fill="#E32017" />
      <polygon points="0,13 4,3 0,1 -4,3" fill="#9CA3AF" />
      <text x={0} y={-15} textAnchor="middle" fontSize={9} fontWeight={700} fill="#374151" fontFamily="system-ui, sans-serif">N</text>
    </g>
  );
}

export function FieldSchematicMap({ fields, currentCropByField, currentLandUseByField, selectedYear }: FieldSchematicMapProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const activeFields = useMemo(() => fields.filter(f => f.isActive !== false), [fields]);

  const { positioned, unpositioned } = useMemo(() => {
    const pos: (MapField & { lat: number; lng: number })[] = [];
    const unpos: MapField[] = [];
    for (const f of activeFields) {
      const lat = parseFloat(String(f.latitude ?? ""));
      const lng = parseFloat(String(f.longitude ?? ""));
      if (isFinite(lat) && isFinite(lng) && (lat !== 0 || lng !== 0)) {
        pos.push({ ...f, lat, lng });
      } else {
        unpos.push(f);
      }
    }
    return { positioned: pos, unpositioned: unpos };
  }, [activeFields]);

  const { minLat, maxLat, minLng, maxLng } = useMemo(() => {
    if (positioned.length === 0) return { minLat: 0, maxLat: 1, minLng: 0, maxLng: 1 };
    const lats = positioned.map(f => f.lat);
    const lngs = positioned.map(f => f.lng);
    return {
      minLat: Math.min(...lats), maxLat: Math.max(...lats),
      minLng: Math.min(...lngs), maxLng: Math.max(...lngs),
    };
  }, [positioned]);

  const latRange = Math.max(maxLat - minLat, 0.001);
  const lngRange = Math.max(maxLng - minLng, 0.001);

  const posCanvasH = CANVAS_H;
  const unpCols = Math.min(Math.max(Math.ceil(Math.sqrt(unpositioned.length + 1)), 3), 8);
  const unpRows = Math.ceil(unpositioned.length / unpCols);
  const unpSectionH = unpositioned.length > 0 ? unpRows * (NODE_H + 14) + 68 : 0;
  const totalH = (positioned.length > 0 ? posCanvasH : 40) + unpSectionH;

  const positionedNodes = useMemo(() => {
    const innerW = CANVAS_W - MARGIN_X * 2 - NODE_W;
    const innerH = posCanvasH - MARGIN_Y * 2 - NODE_H;
    return positioned.map(f => ({
      field: f as MapField,
      x: MARGIN_X + ((f.lng - minLng) / lngRange) * innerW,
      y: MARGIN_Y + (1 - (f.lat - minLat) / latRange) * innerH,
    }));
  }, [positioned, minLat, latRange, minLng, lngRange, posCanvasH]);

  const unpositionedNodes = unpositioned.map((f, i) => ({
    field: f,
    x: MARGIN_X + (i % unpCols) * (NODE_W + 14),
    y: (positioned.length > 0 ? posCanvasH : 40) + 56 + Math.floor(i / unpCols) * (NODE_H + 14),
  }));

  const allNodes = [...positionedNodes, ...unpositionedNodes];

  const hoveredField = hoveredId != null ? activeFields.find(f => f.id === hoveredId) ?? null : null;
  const hoveredCrop = hoveredId != null ? currentCropByField[hoveredId] : null;
  const hoveredLandUse = hoveredId != null ? currentLandUseByField[hoveredId] : null;

  const legendEntries = useMemo(() => {
    const seen = new Map<string, { label: string; fill: string; text: string }>();
    for (const f of activeFields) {
      const crop = currentCropByField[f.id];
      const lu = currentLandUseByField[f.id];
      if (crop?.cropName) {
        const [fill, text] = getFieldColors(crop.cropName, null);
        if (!seen.has(crop.cropName)) seen.set(crop.cropName, { label: crop.cropName, fill, text });
      } else if (lu?.landUse) {
        const [fill, text] = getFieldColors(null, lu.landUse);
        const label = LAND_USE_LABELS[lu.landUse] ?? lu.landUse;
        if (!seen.has(lu.landUse)) seen.set(lu.landUse, { label, fill, text });
      } else {
        if (!seen.has("__none__")) seen.set("__none__", { label: "No crop assigned", fill: "#C5CAD0", text: "#444" });
      }
    }
    return Array.from(seen.values());
  }, [activeFields, currentCropByField, currentLandUseByField]);

  const hasAnyNvz = activeFields.some(f => f.isNvz);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  if (activeFields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3 text-foreground/40">
        <MapIcon className="w-10 h-10" />
        <p className="text-sm">No active fields recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      {legendEntries.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold text-foreground/50 uppercase tracking-wide mr-1">Key:</span>
          {legendEntries.map(entry => (
            <span
              key={entry.label}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border border-black/10"
              style={{ backgroundColor: entry.fill, color: entry.text }}
            >
              {entry.label}
            </span>
          ))}
          {hasAnyNvz && (
            <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border border-red-200 bg-red-50 text-red-700 ml-1">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
              NVZ
            </span>
          )}
        </div>
      )}

      {/* Warning for missing coordinates */}
      {unpositioned.length > 0 && (
        <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>
            {unpositioned.length === activeFields.length
              ? "No fields have GPS coordinates — shown in grid layout. Add latitude & longitude to each field record to enable geographic positioning."
              : `${unpositioned.length} field${unpositioned.length !== 1 ? "s have" : " has"} no GPS coordinates and ${unpositioned.length !== 1 ? "are" : "is"} shown below the map.`}
          </span>
        </div>
      )}

      {/* SVG canvas */}
      <div
        ref={containerRef}
        className="relative overflow-auto rounded-2xl border border-border bg-[#F4F5F7] select-none"
        style={{ maxHeight: 640 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredId(null)}
      >
        <svg
          viewBox={`0 0 ${CANVAS_W} ${totalH}`}
          style={{ width: "100%", minHeight: 300, display: "block" }}
          aria-label="Field schematic map"
        >
          {/* Background grid pattern */}
          <defs>
            <pattern id="fsm-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E2E5E9" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width={CANVAS_W} height={totalH} fill="url(#fsm-grid)" />

          {/* Positioned-fields canvas area */}
          {positioned.length > 0 && (
            <rect
              x={MARGIN_X - 24} y={MARGIN_Y - 24}
              width={CANVAS_W - (MARGIN_X - 24) * 2}
              height={posCanvasH - (MARGIN_Y - 24) * 2}
              rx={14}
              fill="rgba(255,255,255,0.55)"
              stroke="#D9DCE1"
              strokeWidth={1}
            />
          )}

          {/* Divider between geo-positioned and grid sections */}
          {unpositioned.length > 0 && positioned.length > 0 && (
            <>
              <line
                x1={MARGIN_X} y1={posCanvasH + 22}
                x2={CANVAS_W - MARGIN_X} y2={posCanvasH + 22}
                stroke="#D1D5DB" strokeWidth={1} strokeDasharray="5 4"
              />
              <text x={MARGIN_X} y={posCanvasH + 40} fill="#9CA3AF" fontSize={10.5} fontFamily="system-ui, sans-serif" fontWeight={500}>
                Fields without GPS coordinates
              </text>
            </>
          )}

          {/* Field nodes */}
          {allNodes.map(({ field, x, y }) => {
            const crop = currentCropByField[field.id];
            const landUse = currentLandUseByField[field.id];
            const [fill, textColor] = getFieldColors(crop?.cropName, landUse?.landUse);
            const isHovered = hoveredId === field.id;
            const hasNvz = !!field.isNvz;
            const showRef = !!field.fieldReference;
            const nameY = showRef ? 29 : 24;
            const areaY = showRef ? 42 : 37;

            return (
              <g
                key={field.id}
                transform={`translate(${x}, ${y})`}
                onMouseEnter={() => setHoveredId(field.id)}
                style={{ cursor: "pointer" }}
              >
                {/* Drop shadow on hover */}
                {isHovered && (
                  <rect x={2} y={4} width={NODE_W} height={NODE_H} rx={10} fill="rgba(0,0,0,0.22)" />
                )}
                {/* Main tile */}
                <rect
                  width={NODE_W} height={NODE_H} rx={10}
                  fill={fill}
                  stroke={isHovered ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.13)"}
                  strokeWidth={isHovered ? 2.5 : 1}
                />
                {/* NVZ dot */}
                {hasNvz && (
                  <circle cx={NODE_W - 8} cy={8} r={4.5} fill="#EF4444" stroke="white" strokeWidth={1.5} />
                )}
                {/* Field reference */}
                {showRef && (
                  <text
                    x={NODE_W / 2} y={16}
                    textAnchor="middle"
                    fill={textColor} fontSize={9} fontWeight={500} opacity={0.82}
                    fontFamily="system-ui, sans-serif"
                  >
                    {truncate(field.fieldReference!, 15)}
                  </text>
                )}
                {/* Field name */}
                <text
                  x={NODE_W / 2} y={nameY}
                  textAnchor="middle"
                  fill={textColor} fontSize={10.5} fontWeight={700}
                  fontFamily="system-ui, sans-serif"
                >
                  {truncate(field.name ?? "\u2014", 12)}
                </text>
                {/* Area */}
                {field.areaHectares != null && parseFloat(String(field.areaHectares)) > 0 && (
                  <text
                    x={NODE_W / 2} y={areaY}
                    textAnchor="middle"
                    fill={textColor} fontSize={9} opacity={0.85}
                    fontFamily="system-ui, sans-serif"
                  >
                    {parseFloat(String(field.areaHectares)).toFixed(1)} ha
                  </text>
                )}
              </g>
            );
          })}

          {/* North arrow — only if we have positioned fields */}
          {positioned.length > 0 && (
            <NorthArrow x={CANVAS_W - 38} y={38} />
          )}
        </svg>

        {/* Floating tooltip */}
        {hoveredField && (
          <div
            className="absolute z-50 pointer-events-none"
            style={{
              left: Math.min(mousePos.x + 16, (containerRef.current?.offsetWidth ?? 640) - 216),
              top: Math.max(mousePos.y - 12, 4),
            }}
          >
            <div className="bg-white rounded-xl shadow-2xl border border-border/70 p-3 w-52">
              <p className="font-bold text-sm text-foreground leading-tight mb-0.5">{hoveredField.name ?? "Unnamed field"}</p>
              {hoveredField.fieldReference && (
                <p className="text-[11px] text-foreground/45 mb-2">Ref: {hoveredField.fieldReference}</p>
              )}
              <div className="space-y-1.5 text-xs">
                {hoveredCrop?.cropName ? (
                  <div className="flex justify-between gap-2">
                    <span className="text-foreground/50 flex-shrink-0">Current crop</span>
                    <span className="font-semibold text-foreground text-right">{hoveredCrop.cropName}</span>
                  </div>
                ) : hoveredLandUse ? (
                  <div className="flex justify-between gap-2">
                    <span className="text-foreground/50 flex-shrink-0">Land use</span>
                    <span className="font-semibold text-foreground text-right">{LAND_USE_LABELS[hoveredLandUse.landUse] ?? hoveredLandUse.landUse}</span>
                  </div>
                ) : (
                  <div className="flex justify-between gap-2">
                    <span className="text-foreground/50 flex-shrink-0">Current crop</span>
                    <span className="text-foreground/40 italic">None assigned</span>
                  </div>
                )}
                {hoveredCrop?.season && (
                  <div className="flex justify-between gap-2">
                    <span className="text-foreground/50 flex-shrink-0">Season</span>
                    <span className="font-medium">{hoveredCrop.season} {selectedYear}</span>
                  </div>
                )}
                {hoveredField.areaHectares != null && (
                  <div className="flex justify-between gap-2">
                    <span className="text-foreground/50 flex-shrink-0">Area</span>
                    <span className="font-medium">{parseFloat(String(hoveredField.areaHectares)).toFixed(2)} ha</span>
                  </div>
                )}
                {hoveredField.soilType && (
                  <div className="flex justify-between gap-2">
                    <span className="text-foreground/50 flex-shrink-0">Soil type</span>
                    <span className="font-medium text-right">{hoveredField.soilType}</span>
                  </div>
                )}
                <div className="flex justify-between gap-2">
                  <span className="text-foreground/50 flex-shrink-0">NVZ</span>
                  <span className={`font-semibold ${hoveredField.isNvz ? "text-red-600" : "text-green-600"}`}>
                    {hoveredField.isNvz ? "Yes" : "No"}
                  </span>
                </div>
                {hoveredCrop?.plantingDate && (
                  <div className="flex justify-between gap-2">
                    <span className="text-foreground/50 flex-shrink-0">Planted</span>
                    <span className="font-medium">{formatShortDate(hoveredCrop.plantingDate)}</span>
                  </div>
                )}
                {hoveredCrop?.expectedHarvestDate && (
                  <div className="flex justify-between gap-2">
                    <span className="text-foreground/50 flex-shrink-0">Est. harvest</span>
                    <span className="font-medium">{formatShortDate(hoveredCrop.expectedHarvestDate)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer stats bar */}
      <div className="flex flex-wrap gap-5 text-xs text-foreground/50 px-1">
        <span>
          <span className="font-semibold text-foreground/70">{activeFields.length}</span> active field{activeFields.length !== 1 ? "s" : ""}
        </span>
        {positioned.length > 0 && positioned.length < activeFields.length && (
          <span>
            <span className="font-semibold text-foreground/70">{positioned.length}</span> geo-positioned
          </span>
        )}
        {(() => {
          const total = activeFields.reduce((s, f) => s + (parseFloat(String(f.areaHectares ?? "0")) || 0), 0);
          return total > 0 ? (
            <span>
              <span className="font-semibold text-foreground/70">{total.toFixed(1)}</span> ha total
            </span>
          ) : null;
        })()}
        {hasAnyNvz && (
          <span className="text-red-600">
            <span className="font-semibold">{activeFields.filter(f => f.isNvz).length}</span> NVZ field{activeFields.filter(f => f.isNvz).length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}
