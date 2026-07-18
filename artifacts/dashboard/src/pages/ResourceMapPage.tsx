import { useEffect, useRef, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { Navigation, User, Clock, MapPin, Radio, Truck, Settings, Zap, ZapOff } from "lucide-react";

interface StaffPing {
  userId: string;
  userName: string;
  latitude: number;
  longitude: number;
  accuracyM: number | null;
  isSharing: boolean;
  shiftStartedAt: string | null;
  lastSeenAt: string;
}

interface GpsAsset {
  id: number;
  provider: string;
  externalAssetId: string;
  assetName: string | null;
  assetType: string | null;
  latitude: string;
  longitude: string;
  speedKph: string | null;
  headingDeg: number | null;
  accuracyM: string | null;
  altitudeM: string | null;
  ignitionOn: boolean | null;
  lastSeenAt: string;
}

declare global {
  interface Window { _leafletLoaded?: boolean; }
}

// ── Asset category detection ──────────────────────────────────────────────────

const CATEGORIES = ["tractor", "combine", "sprayer", "vehicle", "plant", "trailer", "atv", "other"] as const;
type AssetCategory = typeof CATEGORIES[number];

const CATEGORY_LABELS: Record<AssetCategory, string> = {
  tractor: "Tractors",
  combine: "Combines",
  sprayer: "Sprayers",
  vehicle: "Vehicles",
  plant: "Plant",
  trailer: "Trailers",
  atv: "ATVs",
  other: "Other",
};

const CATEGORY_COLOURS: Record<AssetCategory, string> = {
  tractor: "#92400e",
  combine: "#78350f",
  sprayer: "#166534",
  vehicle: "#1e3a5f",
  plant: "#7c2d12",
  trailer: "#4b5563",
  atv: "#6b21a8",
  other: "#374151",
};

const STAFF_COLOURS = [
  "#2563eb", "#16a34a", "#dc2626", "#9333ea", "#ea580c",
  "#0891b2", "#ca8a04", "#db2777", "#65a30d", "#7c3aed",
];

function colourForUser(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  return STAFF_COLOURS[Math.abs(hash) % STAFF_COLOURS.length];
}

function getAssetCategory(asset: GpsAsset): AssetCategory {
  const t = (asset.assetType ?? "").toLowerCase();
  const name = (asset.assetName ?? "").toLowerCase();
  if (t === "tractor" || name.includes("tractor")) return "tractor";
  if (name.includes("combine") || name.includes("harvester") || name.includes("header")) return "combine";
  if (t === "sprayer" || name.includes("spray") || name.includes("applicator")) return "sprayer";
  if (t === "trailer" || name.includes("trailer") || name.includes("tipping") || name.includes("flatbed")) return "trailer";
  if (t === "plant" || name.includes("excavat") || name.includes("digger") || name.includes("loader") || name.includes("telehandler") || name.includes("forklift") || name.includes("jcb")) return "plant";
  if (t === "atv" || name.includes("atv") || name.includes("quad") || name.includes("gator") || name.includes("ranger")) return "atv";
  if (t === "vehicle" || name.includes("van") || name.includes("truck") || name.includes("pickup") || name.includes("lorry") || name.includes("transit") || name.includes("hilux") || name.includes("ranger") || name.includes("land rover")) return "vehicle";
  return "other";
}

// ── SVG icon paths (20×20 canvas, fill inherited from parent <g>) ─────────────

function getIconPath(cat: AssetCategory | "staff"): string {
  switch (cat) {
    case "staff":
      // person silhouette
      return `<circle cx="10" cy="5.5" r="3.8"/>
              <path d="M2.5 20 C2.5 12.5 17.5 12.5 17.5 20Z"/>`;

    case "tractor":
      // large rear wheel, small front wheel, hood, cab
      return `<circle cx="14" cy="14" r="5.5" stroke="white" stroke-width="1.5"/>
              <circle cx="4" cy="16" r="3" stroke="white" stroke-width="1.2"/>
              <rect x="5" y="9" width="8" height="5" rx="0.5"/>
              <rect x="8" y="5" width="6" height="5" rx="0.5"/>
              <rect x="8.8" y="5.8" width="4.4" height="3" rx="0.3" fill="white" opacity="0.5"/>`;

    case "combine":
      // header / cutter bar at left, wide body, elevated cab
      return `<rect x="0" y="9" width="7" height="5" rx="0.5" opacity="0.9"/>
              <line x1="1" y1="11" x2="6" y2="11" stroke="white" stroke-width="0.8" fill="none"/>
              <line x1="1" y1="13" x2="6" y2="13" stroke="white" stroke-width="0.8" fill="none"/>
              <rect x="6" y="7" width="13" height="8" rx="1"/>
              <rect x="11" y="3" width="8" height="5" rx="1"/>
              <rect x="12" y="3.8" width="6" height="3" rx="0.3" fill="white" opacity="0.4"/>
              <circle cx="10" cy="17" r="2.5" stroke="white" stroke-width="1.2"/>
              <circle cx="17" cy="17" r="2.5" stroke="white" stroke-width="1.2"/>`;

    case "sprayer":
      // oval tank, wide boom bar, three droplets below
      return `<ellipse cx="10" cy="9" rx="5.5" ry="4"/>
              <rect x="0" y="10.5" width="20" height="2.5" rx="1"/>
              <circle cx="3" cy="15.5" r="1.4"/>
              <circle cx="10" cy="16" r="1.4"/>
              <circle cx="17" cy="15.5" r="1.4"/>`;

    case "vehicle":
      // van body, windscreen, two wheels
      return `<rect x="1" y="9" width="18" height="7" rx="2"/>
              <path d="M9 9 L9 14 L19 14 L19 9 Z" fill="white" opacity="0.35"/>
              <circle cx="5" cy="17" r="2.5" stroke="white" stroke-width="1.2"/>
              <circle cx="15" cy="17" r="2.5" stroke="white" stroke-width="1.2"/>`;

    case "plant":
      // undercarriage tracks, cab, boom arm with bucket
      return `<rect x="1" y="14" width="13" height="4" rx="1.5"/>
              <rect x="3" y="8" width="10" height="7" rx="1"/>
              <rect x="5" y="9" width="5" height="4" rx="0.5" fill="white" opacity="0.4"/>
              <polygon points="12,8 20,3 20,9"/>`;

    case "trailer":
      // flat deck with hitch and two rear wheels
      return `<rect x="3" y="8" width="16" height="8" rx="1"/>
              <line x1="3" y1="12" x2="19" y2="12" stroke="white" stroke-width="0.8" fill="none"/>
              <rect x="0" y="11" width="4" height="2" rx="0.8"/>
              <circle cx="12" cy="17" r="2.5" stroke="white" stroke-width="1.2"/>
              <circle cx="17" cy="17" r="2.5" stroke="white" stroke-width="1.2"/>`;

    case "atv":
      // compact body, handlebars, four big chunky wheels
      return `<rect x="5" y="7" width="10" height="7" rx="2"/>
              <rect x="2" y="4" width="7" height="2" rx="1"/>
              <circle cx="4" cy="15" r="3.5" stroke="white" stroke-width="1.2"/>
              <circle cx="16" cy="15" r="3.5" stroke="white" stroke-width="1.2"/>`;

    default:
      // generic truck
      return `<rect x="2" y="9" width="16" height="7" rx="2"/>
              <circle cx="6" cy="17" r="2.5" stroke="white" stroke-width="1.2"/>
              <circle cx="14" cy="17" r="2.5" stroke="white" stroke-width="1.2"/>`;
  }
}

// ── Pin SVG factories ─────────────────────────────────────────────────────────

function makePinSvg(colour: string, iconPaths: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48">
    <path d="M20 0C9 0 0 9 0 20c0 13 20 28 20 28S40 33 40 20C40 9 31 0 20 0z" fill="${colour}" stroke="white" stroke-width="2"/>
    <circle cx="20" cy="20" r="13" fill="white" opacity="0.93"/>
    <g transform="translate(10,10)" fill="${colour}">${iconPaths}</g>
  </svg>`;
  return "data:image/svg+xml;base64," + btoa(svg);
}

function makeStaffPin(colour: string, initials: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
    <path d="M18 0C8.059 0 0 8.059 0 18c0 12 18 26 18 26S36 30 36 18C36 8.059 27.941 0 18 0z" fill="${colour}" stroke="white" stroke-width="2"/>
    <circle cx="18" cy="18" r="11" fill="white" opacity="0.9"/>
    <text x="18" y="22" text-anchor="middle" fill="${colour}" font-size="10" font-family="sans-serif" font-weight="700">${initials}</text>
  </svg>`;
  return "data:image/svg+xml;base64," + btoa(svg);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name.split(" ").map(n => n[0] ?? "").join("").toUpperCase().slice(0, 2);
}

function timeSince(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

function isRecent(iso: string, maxAgeMs = 120_000): boolean {
  return Date.now() - new Date(iso).getTime() < maxAgeMs;
}

function providerLabel(provider: string): string {
  const labels: Record<string, string> = {
    teltonika: "Teltonika", samsara: "Samsara",
    webfleet: "Webfleet", john_deere: "John Deere", agco: "AGCO",
  };
  return labels[provider] ?? provider;
}

// ── Tooltip HTML (hover — concise) ────────────────────────────────────────────

function staffTooltipHtml(ping: StaffPing): string {
  return `<div style="font-size:12px;line-height:1.5;padding:1px 2px">
    <strong>${ping.userName}</strong><br>
    <span style="color:#64748b">Staff · ${timeSince(ping.lastSeenAt)}</span>
  </div>`;
}

function assetTooltipHtml(asset: GpsAsset): string {
  const cat = getAssetCategory(asset);
  const name = asset.assetName ?? asset.externalAssetId;
  const speed = asset.speedKph != null ? ` · ${Number(asset.speedKph).toFixed(0)} km/h` : "";
  return `<div style="font-size:12px;line-height:1.5;padding:1px 2px">
    <strong>${name}</strong><br>
    <span style="color:#64748b">${CATEGORY_LABELS[cat]} · ${timeSince(asset.lastSeenAt)}${speed}</span>
  </div>`;
}

// ── Popup HTML (click — full detail) ─────────────────────────────────────────

function staffPopupHtml(ping: StaffPing, colour: string): string {
  return `<div style="min-width:180px">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
      <div style="width:28px;height:28px;border-radius:50%;background:${colour};color:white;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0">${getInitials(ping.userName)}</div>
      <div>
        <p style="font-weight:600;margin:0;font-size:13px">${ping.userName}</p>
        <p style="color:#64748b;font-size:11px;margin:0">Last seen ${timeSince(ping.lastSeenAt)}</p>
      </div>
    </div>
    ${ping.shiftStartedAt ? `<p style="font-size:11px;color:#64748b;margin:0">Shift started ${new Date(ping.shiftStartedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</p>` : ""}
    ${ping.accuracyM != null ? `<p style="font-size:11px;color:#94a3b8;margin:2px 0 0">GPS accuracy ±${Math.round(Number(ping.accuracyM))}m</p>` : ""}
  </div>`;
}

function assetPopupHtml(asset: GpsAsset, colour: string): string {
  const cat = getAssetCategory(asset);
  const speed = asset.speedKph != null ? `${Number(asset.speedKph).toFixed(0)} km/h` : null;
  return `<div style="min-width:200px">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
      <div style="width:30px;height:30px;border-radius:6px;background:${colour};color:white;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0">
        ${CATEGORY_LABELS[cat].slice(0, 2).toUpperCase()}
      </div>
      <div>
        <p style="font-weight:600;margin:0;font-size:13px">${asset.assetName ?? asset.externalAssetId}</p>
        <p style="color:#64748b;font-size:11px;margin:0">${CATEGORY_LABELS[cat]} · ${providerLabel(asset.provider)}</p>
      </div>
    </div>
    <div style="font-size:11px;color:#6b7280;display:flex;flex-direction:column;gap:3px">
      ${asset.ignitionOn != null ? `<span style="display:flex;align-items:center;gap:4px"><span style="width:7px;height:7px;border-radius:50%;background:${asset.ignitionOn ? "#16a34a" : "#9ca3af"};display:inline-block"></span>${asset.ignitionOn ? "Engine on" : "Engine off"}</span>` : ""}
      ${speed ? `<span>Speed: ${speed}</span>` : ""}
      ${asset.externalAssetId ? `<span style="font-family:monospace;color:#94a3b8">ID: ${asset.externalAssetId}</span>` : ""}
      <span>Last seen ${timeSince(asset.lastSeenAt)}</span>
      ${asset.accuracyM != null ? `<span>Accuracy ±${Math.round(Number(asset.accuracyM))}m</span>` : ""}
    </div>
  </div>`;
}

// ── Map hook ──────────────────────────────────────────────────────────────────

function useResourceMap(
  containerRef: React.RefObject<HTMLDivElement | null>,
  pings: StaffPing[],
  assets: GpsAsset[]
) {
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const staffMarkersRef = useRef<Map<string, import("leaflet").Marker>>(new Map());
  const assetMarkersRef = useRef<Map<string, import("leaflet").Marker>>(new Map());

  useEffect(() => {
    import("leaflet").then((L) => {
      if (!window._leafletLoaded) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
        window._leafletLoaded = true;
      }

      if (!containerRef.current) return;

      if (!mapRef.current) {
        const allPoints = [
          ...pings.filter(p => p.isSharing).map(p => [Number(p.latitude), Number(p.longitude)] as [number, number]),
          ...assets.map(a => [Number(a.latitude), Number(a.longitude)] as [number, number]),
        ];
        const center: [number, number] = allPoints.length > 0
          ? [
              allPoints.reduce((s, p) => s + p[0], 0) / allPoints.length,
              allPoints.reduce((s, p) => s + p[1], 0) / allPoints.length,
            ]
          : [52.5, -1.5];
        mapRef.current = L.map(containerRef.current, { center, zoom: allPoints.length > 0 ? 14 : 6, scrollWheelZoom: true });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 20,
        }).addTo(mapRef.current);
      }

      const map = mapRef.current;

      // ── Staff markers ────────────────────────────────────────────────────
      const seenStaff = new Set<string>();
      for (const ping of pings) {
        if (!ping.isSharing) continue;
        seenStaff.add(ping.userId);
        const colour = colourForUser(ping.userId);
        const iconUrl = makeStaffPin(colour, getInitials(ping.userName));
        const icon = L.icon({ iconUrl, iconSize: [36, 44], iconAnchor: [18, 44], popupAnchor: [0, -48], tooltipAnchor: [0, -46] });
        const lat = Number(ping.latitude); const lng = Number(ping.longitude);
        const existing = staffMarkersRef.current.get(ping.userId);
        if (existing) {
          existing.setLatLng([lat, lng]);
          existing.setPopupContent(staffPopupHtml(ping, colour));
          existing.setTooltipContent(staffTooltipHtml(ping));
        } else {
          const marker = L.marker([lat, lng], { icon })
            .addTo(map)
            .bindPopup(staffPopupHtml(ping, colour))
            .bindTooltip(staffTooltipHtml(ping), { direction: "top", offset: [0, -44], opacity: 0.97, sticky: false });
          staffMarkersRef.current.set(ping.userId, marker);
        }
      }
      for (const [userId, marker] of staffMarkersRef.current) {
        if (!seenStaff.has(userId)) { marker.remove(); staffMarkersRef.current.delete(userId); }
      }

      // ── Asset markers ────────────────────────────────────────────────────
      const seenAssets = new Set<string>();
      for (const asset of assets) {
        const key = `${asset.provider}::${asset.externalAssetId}`;
        seenAssets.add(key);
        const cat = getAssetCategory(asset);
        const colour = CATEGORY_COLOURS[cat];
        const iconUrl = makePinSvg(colour, getIconPath(cat));
        const icon = L.icon({ iconUrl, iconSize: [40, 48], iconAnchor: [20, 48], popupAnchor: [0, -52], tooltipAnchor: [0, -50] });
        const lat = Number(asset.latitude); const lng = Number(asset.longitude);
        const existing = assetMarkersRef.current.get(key);
        if (existing) {
          existing.setLatLng([lat, lng]);
          existing.setPopupContent(assetPopupHtml(asset, colour));
          existing.setTooltipContent(assetTooltipHtml(asset));
        } else {
          const marker = L.marker([lat, lng], { icon })
            .addTo(map)
            .bindPopup(assetPopupHtml(asset, colour))
            .bindTooltip(assetTooltipHtml(asset), { direction: "top", offset: [0, -48], opacity: 0.97, sticky: false });
          assetMarkersRef.current.set(key, marker);
        }
      }
      for (const [key, marker] of assetMarkersRef.current) {
        if (!seenAssets.has(key)) { marker.remove(); assetMarkersRef.current.delete(key); }
      }
    });
  }, [pings, assets]);

  useEffect(() => {
    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []);
}

// ── Category dot for sidebar ──────────────────────────────────────────────────

function CategoryDot({ cat, size = 28 }: { cat: AssetCategory; size?: number }) {
  const colour = CATEGORY_COLOURS[cat];
  const icon = getIconPath(cat);
  return (
    <div
      title={CATEGORY_LABELS[cat]}
      style={{
        width: size, height: size, borderRadius: 6, background: colour,
        flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
      }}
    >
      <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 20 20" fill="white">
        <g dangerouslySetInnerHTML={{ __html: icon.replace(/fill="white"/g, 'fill="white"') }} />
      </svg>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ResourceMapPage() {
  const { farmId: selectedFarmId } = useAppStore();
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Per-type filter state
  const [showStaff, setShowStaff] = useState(true);
  const [enabledCats, setEnabledCats] = useState<Set<AssetCategory>>(() => new Set(CATEGORIES));

  function toggleCat(cat: AssetCategory) {
    setEnabledCats(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  }

  const staffQ = useQuery<{ pings: StaffPing[] }>({
    queryKey: ["staff-locations-live", selectedFarmId],
    queryFn: () => fetch(`/api/farms/${selectedFarmId}/staff-locations/live`, { credentials: "include" }).then(r => r.json()),
    enabled: !!selectedFarmId,
    refetchInterval: 30_000,
    staleTime: 20_000,
  });

  const assetsQ = useQuery<{ assets: GpsAsset[] }>({
    queryKey: ["gps-assets-live", selectedFarmId],
    queryFn: () => fetch(`/api/farms/${selectedFarmId}/gps-assets/live`, { credentials: "include" }).then(r => r.json()),
    enabled: !!selectedFarmId,
    refetchInterval: 60_000,
    staleTime: 50_000,
  });

  const allPings: StaffPing[] = staffQ.data?.pings ?? [];
  const allAssets: GpsAsset[] = assetsQ.data?.assets ?? [];

  const activePings = allPings.filter(p => p.isSharing && isRecent(p.lastSeenAt, 2 * 60 * 60 * 1000));
  const livePings = activePings.filter(p => isRecent(p.lastSeenAt, 120_000));
  const recentAssets = allAssets.filter(a => isRecent(a.lastSeenAt, 24 * 60 * 60 * 1000));
  const liveAssets = recentAssets.filter(a => isRecent(a.lastSeenAt, 5 * 60 * 1000));

  // Count per category for filter UI
  const catCounts = useMemo(() => {
    const counts = {} as Record<AssetCategory, number>;
    for (const cat of CATEGORIES) counts[cat] = recentAssets.filter(a => getAssetCategory(a) === cat).length;
    return counts;
  }, [recentAssets]);

  // Categories that have at least one asset (to decide what filter pills to show)
  const populatedCats = CATEGORIES.filter(c => catCounts[c] > 0);

  // What actually goes on the map after filtering
  const mapPings = showStaff ? activePings : [];
  const mapAssets = recentAssets.filter(a => enabledCats.has(getAssetCategory(a)));

  useResourceMap(mapContainerRef as React.RefObject<HTMLDivElement | null>, mapPings, mapAssets);

  const nothingOnMap = mapPings.length === 0 && mapAssets.length === 0;

  // Visible sidebar lists
  const visibleAssets = mapAssets;
  const visiblePings = mapPings;

  return (
    <AppLayout>
      <div style={{ padding: "1.5rem", height: "100%", display: "flex", flexDirection: "column", gap: "1rem" }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
          <div>
            <h1 style={{ fontWeight: 700, fontSize: "1.25rem", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Navigation size={20} style={{ color: "#2563eb" }} />
              Resource Map
            </h1>
            <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: "0.25rem 0 0" }}>
              Live staff locations and GPS-tracked assets · hover pins for details, click for full info
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
            <Radio size={13} style={{ color: livePings.length + liveAssets.length > 0 ? "#16a34a" : "#9ca3af" }} />
            {livePings.length + liveAssets.length > 0 ? (
              <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 600 }}>
                {livePings.length > 0 && `${livePings.length} staff`}
                {livePings.length > 0 && liveAssets.length > 0 && " · "}
                {liveAssets.length > 0 && `${liveAssets.length} assets`}
                {" "}live
              </span>
            ) : (
              <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>Nothing live</span>
            )}
          </div>
        </div>

        {/* ── Filter pills ───────────────────────────────────────────────── */}
        {(activePings.length > 0 || recentAssets.length > 0) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginRight: 2 }}>Show:</span>

            {/* Staff toggle */}
            {activePings.length > 0 && (
              <button
                onClick={() => setShowStaff(v => !v)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px",
                  borderRadius: 20, border: "1.5px solid", cursor: "pointer", fontSize: "0.72rem", fontWeight: 600,
                  background: showStaff ? "#2563eb" : "white",
                  color: showStaff ? "white" : "#6b7280",
                  borderColor: showStaff ? "#2563eb" : "#d1d5db",
                  transition: "all 0.15s",
                }}
              >
                <User size={11} />
                Staff ({activePings.length})
              </button>
            )}

            {/* Per-category asset toggles — only show categories that exist */}
            {populatedCats.map(cat => {
              const active = enabledCats.has(cat);
              const colour = CATEGORY_COLOURS[cat];
              return (
                <button
                  key={cat}
                  onClick={() => toggleCat(cat)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px",
                    borderRadius: 20, border: `1.5px solid`, cursor: "pointer", fontSize: "0.72rem", fontWeight: 600,
                    background: active ? colour : "white",
                    color: active ? "white" : "#6b7280",
                    borderColor: active ? colour : "#d1d5db",
                    transition: "all 0.15s",
                  }}
                >
                  {/* Mini inline SVG icon */}
                  <svg width="12" height="12" viewBox="0 0 20 20" fill={active ? "white" : colour} style={{ flexShrink: 0 }}>
                    <g dangerouslySetInnerHTML={{ __html: getIconPath(cat) }} />
                  </svg>
                  {CATEGORY_LABELS[cat]} ({catCounts[cat]})
                </button>
              );
            })}

            {/* "Select all / none" shortcut when there are multiple asset types */}
            {populatedCats.length > 1 && (
              <button
                onClick={() => {
                  if (enabledCats.size === CATEGORIES.length) {
                    setEnabledCats(new Set());
                  } else {
                    setEnabledCats(new Set(CATEGORIES));
                  }
                }}
                style={{ fontSize: "0.68rem", color: "#9ca3af", background: "none", border: "none", cursor: "pointer", padding: "3px 6px", textDecoration: "underline" }}
              >
                {enabledCats.size === CATEGORIES.length ? "Hide all assets" : "Show all assets"}
              </button>
            )}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1rem", flex: 1, minHeight: 0 }}>

          {/* ── Map ──────────────────────────────────────────────────────── */}
          <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #e5e7eb", position: "relative" }}>
            <div ref={mapContainerRef} style={{ width: "100%", height: "100%", minHeight: 500 }} />
            {nothingOnMap && (
              <div style={{
                position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", background: "rgba(248,250,252,0.92)", gap: "0.75rem",
              }}>
                <MapPin size={40} style={{ color: "#cbd5e1" }} />
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontWeight: 600, margin: "0 0 0.25rem", color: "#374151" }}>Nothing on the map</p>
                  <p style={{ fontSize: "0.78rem", color: "#6b7280", margin: 0, maxWidth: 300 }}>
                    Use the filters above to show items, or connect a GPS provider in Farm Settings.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar list ─────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", overflowY: "auto" }}>

            {/* Assets */}
            {visibleAssets.length > 0 && (
              <>
                <p style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280", margin: 0 }}>
                  GPS Assets ({visibleAssets.length}{visibleAssets.length !== recentAssets.length ? ` of ${recentAssets.length}` : ""})
                </p>
                {visibleAssets.map(asset => {
                  const cat = getAssetCategory(asset);
                  const colour = CATEGORY_COLOURS[cat];
                  const live = isRecent(asset.lastSeenAt, 5 * 60 * 1000);
                  const speed = asset.speedKph != null ? `${Number(asset.speedKph).toFixed(0)} km/h` : null;
                  return (
                    <div key={`${asset.provider}-${asset.externalAssetId}`} style={{
                      border: `1px solid ${live ? "#dcfce7" : "#f1f5f9"}`,
                      borderRadius: 8, padding: "0.75rem",
                      background: live ? "#f0fdf4" : "#fafafa",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                        <CategoryDot cat={cat} size={30} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 600, margin: 0, fontSize: "0.83rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {asset.assetName ?? asset.externalAssetId}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: live ? "#16a34a" : "#9ca3af" }} />
                            <span style={{ fontSize: "0.68rem", color: live ? "#15803d" : "#6b7280" }}>
                              {CATEGORY_LABELS[cat]} · {providerLabel(asset.provider)}
                            </span>
                          </div>
                        </div>
                        {asset.ignitionOn != null && (
                          asset.ignitionOn
                            ? <Zap size={13} style={{ color: "#16a34a", flexShrink: 0 }} />
                            : <ZapOff size={13} style={{ color: "#9ca3af", flexShrink: 0 }} />
                        )}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "#6b7280", display: "flex", flexDirection: "column", gap: 2 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Clock size={10} />
                          Last seen {timeSince(asset.lastSeenAt)}
                        </span>
                        {speed && (
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Navigation size={10} />
                            {speed}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {recentAssets.length > 0 && visibleAssets.length === 0 && (
              <div style={{ border: "1px solid #f1f5f9", borderRadius: 8, padding: "1.25rem", textAlign: "center" }}>
                <Truck size={22} style={{ color: "#cbd5e1", marginBottom: "0.4rem" }} />
                <p style={{ fontSize: "0.78rem", color: "#94a3b8", margin: 0 }}>All asset types hidden — use filters above</p>
              </div>
            )}
            {recentAssets.length === 0 && (
              <div style={{ border: "1px solid #f1f5f9", borderRadius: 8, padding: "1.25rem", textAlign: "center" }}>
                <Truck size={22} style={{ color: "#cbd5e1", marginBottom: "0.4rem" }} />
                <p style={{ fontSize: "0.78rem", color: "#94a3b8", margin: 0 }}>No GPS assets — connect a provider in Farm Settings</p>
              </div>
            )}

            {/* Staff */}
            {activePings.length > 0 && (
              <>
                <p style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280", margin: visibleAssets.length > 0 ? "0.5rem 0 0" : 0 }}>
                  Active Staff ({activePings.length})
                </p>
                {!showStaff && (
                  <div style={{ border: "1px solid #f1f5f9", borderRadius: 8, padding: "0.75rem", textAlign: "center" }}>
                    <p style={{ fontSize: "0.78rem", color: "#94a3b8", margin: 0 }}>Staff hidden — toggle "Staff" filter above</p>
                  </div>
                )}
                {showStaff && visiblePings.map(ping => {
                  const colour = colourForUser(ping.userId);
                  const live = isRecent(ping.lastSeenAt, 120_000);
                  return (
                    <div key={ping.userId} style={{
                      border: `1px solid ${live ? "#dcfce7" : "#f1f5f9"}`,
                      borderRadius: 8, padding: "0.75rem",
                      background: live ? "#f0fdf4" : "#fafafa",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%", background: colour,
                          color: "white", display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "11px", fontWeight: 700, flexShrink: 0,
                        }}>
                          {getInitials(ping.userName)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 600, margin: 0, fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {ping.userName}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: live ? "#16a34a" : "#f59e0b" }} />
                            <span style={{ fontSize: "0.7rem", color: live ? "#15803d" : "#b45309" }}>
                              {live ? "Live" : "Stale"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "#6b7280", display: "flex", flexDirection: "column", gap: 2 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Clock size={10} />
                          Last seen {timeSince(ping.lastSeenAt)}
                        </span>
                        {ping.shiftStartedAt && (
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Radio size={10} />
                            On shift since {new Date(ping.shiftStartedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                        {ping.accuracyM != null && (
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <MapPin size={10} />
                            ±{Math.round(Number(ping.accuracyM))}m accuracy
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
            {activePings.length === 0 && (
              <div style={{ border: "1px solid #f1f5f9", borderRadius: 8, padding: "1.25rem", textAlign: "center" }}>
                <User size={22} style={{ color: "#cbd5e1", marginBottom: "0.4rem" }} />
                <p style={{ fontSize: "0.78rem", color: "#94a3b8", margin: 0 }}>No staff currently sharing</p>
              </div>
            )}

            {/* How-to */}
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "0.75rem", background: "#f8fafc", marginTop: "auto" }}>
              <p style={{ fontWeight: 600, fontSize: "0.75rem", margin: "0 0 0.4rem", color: "#374151", display: "flex", alignItems: "center", gap: 4 }}>
                <Settings size={11} /> How to add assets
              </p>
              <ol style={{ fontSize: "0.72rem", color: "#6b7280", margin: 0, paddingLeft: "1rem", lineHeight: 1.6 }}>
                <li>Go to <strong>Farm Settings</strong> (bottom of sidebar)</li>
                <li>Scroll to <strong>GPS Tracking Integration</strong></li>
                <li>Choose a provider and enter your credentials</li>
              </ol>
              <p style={{ fontSize: "0.7rem", color: "#9ca3af", margin: "0.5rem 0 0" }}>
                Staff sharing: toggle on in the mobile app Settings tab.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
