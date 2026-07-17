import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
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
  interface Window {
    _leafletLoaded?: boolean;
  }
}

const STAFF_COLOURS = [
  "#2563eb", "#16a34a", "#dc2626", "#9333ea", "#ea580c",
  "#0891b2", "#ca8a04", "#db2777", "#65a30d", "#7c3aed",
];

const ASSET_TYPE_COLOURS: Record<string, string> = {
  tractor: "#854d0e",
  vehicle: "#1e3a5f",
  plant: "#166534",
  equipment: "#4c1d95",
  trailer: "#6b7280",
};

function colourForUser(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  return STAFF_COLOURS[Math.abs(hash) % STAFF_COLOURS.length];
}

function assetColour(asset: GpsAsset): string {
  return ASSET_TYPE_COLOURS[asset.assetType ?? "vehicle"] ?? "#374151";
}

function makeStaffSvgIcon(colour: string, initials: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
    <path d="M18 0C8.059 0 0 8.059 0 18c0 12 18 26 18 26S36 30 36 18C36 8.059 27.941 0 18 0z" fill="${colour}" stroke="white" stroke-width="2"/>
    <circle cx="18" cy="18" r="11" fill="white" opacity="0.9"/>
    <text x="18" y="22" text-anchor="middle" fill="${colour}" font-size="10" font-family="sans-serif" font-weight="700">${initials}</text>
  </svg>`;
  return "data:image/svg+xml;base64," + btoa(svg);
}

function makeAssetSvgIcon(colour: string, assetType: string | null): string {
  const icon = assetType === "tractor"
    ? `<path d="M4 14h3V9H4v5zm9-9H9l-2 5h6l-2-5zm4 9h3V9h-3v5z" fill="${colour}" opacity="0.9"/><circle cx="7" cy="17" r="3" fill="${colour}" stroke="white" stroke-width="1.5"/><circle cx="21" cy="17" r="3" fill="${colour}" stroke="white" stroke-width="1.5"/>`
    : `<rect x="3" y="10" width="18" height="8" rx="2" fill="${colour}" opacity="0.9"/><circle cx="7" cy="19" r="2.5" fill="${colour}" stroke="white" stroke-width="1.5"/><circle cx="17" cy="19" r="2.5" fill="${colour}" stroke="white" stroke-width="1.5"/>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48">
    <path d="M20 0C9 0 0 9 0 20c0 13 20 28 20 28S40 33 40 20C40 9 31 0 20 0z" fill="${colour}" stroke="white" stroke-width="2"/>
    <circle cx="20" cy="20" r="13" fill="white" opacity="0.92"/>
    <g transform="translate(8,10)">${icon}</g>
  </svg>`;
  return "data:image/svg+xml;base64," + btoa(svg);
}

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
  const speed = asset.speedKph != null ? `${Number(asset.speedKph).toFixed(0)} km/h` : null;
  return `<div style="min-width:190px">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
      <div style="width:28px;height:28px;border-radius:6px;background:${colour};color:white;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0;text-transform:capitalize">${(asset.assetType ?? "V")[0].toUpperCase()}</div>
      <div>
        <p style="font-weight:600;margin:0;font-size:13px">${asset.assetName ?? asset.externalAssetId}</p>
        <p style="color:#64748b;font-size:11px;margin:0;text-transform:capitalize">${asset.assetType ?? "vehicle"} · ${providerLabel(asset.provider)}</p>
      </div>
    </div>
    <div style="font-size:11px;color:#6b7280;display:flex;flex-direction:column;gap:3px">
      ${asset.ignitionOn != null ? `<span style="display:flex;align-items:center;gap:4px"><span style="width:7px;height:7px;border-radius:50%;background:${asset.ignitionOn ? "#16a34a" : "#9ca3af"};display:inline-block"></span>${asset.ignitionOn ? "Ignition on" : "Ignition off"}</span>` : ""}
      ${speed ? `<span>Speed: ${speed}</span>` : ""}
      <span>Last seen ${timeSince(asset.lastSeenAt)}</span>
      ${asset.accuracyM != null ? `<span>Accuracy ±${Math.round(Number(asset.accuracyM))}m</span>` : ""}
    </div>
  </div>`;
}

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
        const zoom = allPoints.length > 0 ? 14 : 6;

        mapRef.current = L.map(containerRef.current, { center, zoom, scrollWheelZoom: true });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 20,
        }).addTo(mapRef.current);
      }

      const map = mapRef.current;

      // ── Staff markers ────────────────────────────────────────────────────────
      const seenStaff = new Set<string>();
      for (const ping of pings) {
        if (!ping.isSharing) continue;
        seenStaff.add(ping.userId);
        const colour = colourForUser(ping.userId);
        const icon = L.icon({ iconUrl: makeStaffSvgIcon(colour, getInitials(ping.userName)), iconSize: [36, 44], iconAnchor: [18, 44], popupAnchor: [0, -44] });
        const lat = Number(ping.latitude); const lng = Number(ping.longitude);
        const existing = staffMarkersRef.current.get(ping.userId);
        if (existing) {
          existing.setLatLng([lat, lng]);
          existing.setPopupContent(staffPopupHtml(ping, colour));
        } else {
          const marker = L.marker([lat, lng], { icon }).addTo(map).bindPopup(staffPopupHtml(ping, colour));
          staffMarkersRef.current.set(ping.userId, marker);
        }
      }
      for (const [userId, marker] of staffMarkersRef.current) {
        if (!seenStaff.has(userId)) { marker.remove(); staffMarkersRef.current.delete(userId); }
      }

      // ── Asset markers ────────────────────────────────────────────────────────
      const seenAssets = new Set<string>();
      for (const asset of assets) {
        const key = `${asset.provider}::${asset.externalAssetId}`;
        seenAssets.add(key);
        const colour = assetColour(asset);
        const icon = L.icon({ iconUrl: makeAssetSvgIcon(colour, asset.assetType), iconSize: [40, 48], iconAnchor: [20, 48], popupAnchor: [0, -48] });
        const lat = Number(asset.latitude); const lng = Number(asset.longitude);
        const existing = assetMarkersRef.current.get(key);
        if (existing) {
          existing.setLatLng([lat, lng]);
          existing.setPopupContent(assetPopupHtml(asset, colour));
        } else {
          const marker = L.marker([lat, lng], { icon }).addTo(map).bindPopup(assetPopupHtml(asset, colour));
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

export default function ResourceMapPage() {
  const { farmId: selectedFarmId } = useAppStore();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"all" | "staff" | "assets">("all");

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

  const mapPings = (activeTab === "assets") ? [] : activePings;
  const mapAssets = (activeTab === "staff") ? [] : recentAssets;

  useResourceMap(mapContainerRef as React.RefObject<HTMLDivElement | null>, mapPings, mapAssets);

  const nothingOnMap = mapPings.length === 0 && mapAssets.length === 0;

  return (
    <AppLayout>
      <div style={{ padding: "1.5rem", height: "100%", display: "flex", flexDirection: "column", gap: "1rem" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
          <div>
            <h1 style={{ fontWeight: 700, fontSize: "1.25rem", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Navigation size={20} style={{ color: "#2563eb" }} />
              Resource Map
            </h1>
            <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: "0.25rem 0 0" }}>
              Live staff locations and GPS-tracked vehicles · updates every 30 – 60 seconds
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
            {/* Layer tabs */}
            <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 8, padding: 3, gap: 2 }}>
              {(["all", "staff", "assets"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "0.25rem 0.75rem", borderRadius: 6, border: "none", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600,
                    background: activeTab === tab ? "white" : "transparent",
                    color: activeTab === tab ? "#1e40af" : "#6b7280",
                    boxShadow: activeTab === tab ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                    transition: "all 0.15s",
                    textTransform: "capitalize",
                  }}
                >
                  {tab === "all" ? "All" : tab === "staff" ? `Staff (${activePings.length})` : `Assets (${recentAssets.length})`}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "#6b7280" }}>
              <Radio size={13} style={{ color: livePings.length + liveAssets.length > 0 ? "#16a34a" : "#9ca3af" }} />
              {livePings.length + liveAssets.length > 0 ? (
                <span style={{ color: "#16a34a", fontWeight: 600 }}>
                  {livePings.length > 0 && `${livePings.length} staff`}
                  {livePings.length > 0 && liveAssets.length > 0 && " · "}
                  {liveAssets.length > 0 && `${liveAssets.length} assets`}
                  {" "}live
                </span>
              ) : (
                <span>Nothing live</span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1rem", flex: 1, minHeight: 0 }}>

          {/* Map */}
          <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #e5e7eb", position: "relative" }}>
            <div ref={mapContainerRef} style={{ width: "100%", height: "100%", minHeight: 500 }} />
            {nothingOnMap && (
              <div style={{
                position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", background: "rgba(248,250,252,0.92)",
                gap: "0.75rem",
              }}>
                <MapPin size={40} style={{ color: "#cbd5e1" }} />
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontWeight: 600, margin: "0 0 0.25rem", color: "#374151" }}>
                    {activeTab === "staff" ? "No staff sharing location" : activeTab === "assets" ? "No GPS assets found" : "Nothing on the map yet"}
                  </p>
                  <p style={{ fontSize: "0.78rem", color: "#6b7280", margin: 0, maxWidth: 300 }}>
                    {activeTab === "assets"
                      ? "Connect a GPS provider in Farm Settings to see vehicle and plant positions here."
                      : "Staff can enable sharing from the Settings tab in the mobile app."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", overflowY: "auto" }}>

            {/* Assets section */}
            {activeTab !== "staff" && (
              <>
                <p style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280", margin: 0 }}>
                  GPS Assets ({recentAssets.length})
                </p>
                {recentAssets.length === 0 && (
                  <div style={{ border: "1px solid #f1f5f9", borderRadius: 8, padding: "1.25rem", textAlign: "center" }}>
                    <Truck size={22} style={{ color: "#cbd5e1", marginBottom: "0.4rem" }} />
                    <p style={{ fontSize: "0.78rem", color: "#94a3b8", margin: 0 }}>
                      No GPS assets — connect a provider in Farm Settings
                    </p>
                  </div>
                )}
                {recentAssets.map(asset => {
                  const colour = assetColour(asset);
                  const live = isRecent(asset.lastSeenAt, 5 * 60 * 1000);
                  const speed = asset.speedKph != null ? `${Number(asset.speedKph).toFixed(0)} km/h` : null;
                  return (
                    <div key={`${asset.provider}-${asset.externalAssetId}`} style={{
                      border: `1px solid ${live ? "#dcfce7" : "#f1f5f9"}`,
                      borderRadius: 8, padding: "0.75rem",
                      background: live ? "#f0fdf4" : "#fafafa",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: 6, background: colour,
                          color: "white", display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "10px", fontWeight: 700, flexShrink: 0, textTransform: "capitalize",
                        }}>
                          {(asset.assetType ?? "V")[0].toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 600, margin: 0, fontSize: "0.83rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {asset.assetName ?? asset.externalAssetId}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: live ? "#16a34a" : "#9ca3af" }} />
                            <span style={{ fontSize: "0.68rem", color: live ? "#15803d" : "#6b7280", textTransform: "capitalize" }}>
                              {asset.assetType ?? "vehicle"} · {providerLabel(asset.provider)}
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

            {/* Staff section */}
            {activeTab !== "assets" && (
              <>
                <p style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280", margin: activeTab === "all" && recentAssets.length > 0 ? "0.5rem 0 0" : 0 }}>
                  Active Staff ({activePings.length})
                </p>
                {activePings.length === 0 && (
                  <div style={{ border: "1px solid #f1f5f9", borderRadius: 8, padding: "1.25rem", textAlign: "center" }}>
                    <User size={22} style={{ color: "#cbd5e1", marginBottom: "0.4rem" }} />
                    <p style={{ fontSize: "0.78rem", color: "#94a3b8", margin: 0 }}>No staff currently sharing</p>
                  </div>
                )}
                {activePings.map(ping => {
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

            {/* How-to panel */}
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "0.75rem", background: "#f8fafc", marginTop: "auto" }}>
              <p style={{ fontWeight: 600, fontSize: "0.75rem", margin: "0 0 0.4rem", color: "#374151", display: "flex", alignItems: "center", gap: 4 }}>
                <Settings size={11} /> How to add assets
              </p>
              <ol style={{ fontSize: "0.72rem", color: "#6b7280", margin: 0, paddingLeft: "1rem", lineHeight: 1.6 }}>
                <li>Go to <strong>Farm Settings</strong> (bottom of sidebar)</li>
                <li>Scroll to <strong>GPS Tracking Integration</strong></li>
                <li>Choose a provider and enter your API key</li>
                <li>Copy the webhook URL into your device platform</li>
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
