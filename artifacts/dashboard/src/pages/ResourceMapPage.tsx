import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Navigation, User, Clock, MapPin, Radio } from "lucide-react";

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

declare global {
  interface Window {
    _leafletLoaded?: boolean;
  }
}

const STAFF_COLOURS = [
  "#2563eb", "#16a34a", "#dc2626", "#9333ea", "#ea580c",
  "#0891b2", "#ca8a04", "#db2777", "#65a30d", "#7c3aed",
];

function colourForUser(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  return STAFF_COLOURS[Math.abs(hash) % STAFF_COLOURS.length];
}

function makeStaffSvgIcon(colour: string, initials: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
    <path d="M18 0C8.059 0 0 8.059 0 18c0 12 18 26 18 26S36 30 36 18C36 8.059 27.941 0 18 0z" fill="${colour}" stroke="white" stroke-width="2"/>
    <circle cx="18" cy="18" r="11" fill="white" opacity="0.9"/>
    <text x="18" y="22" text-anchor="middle" fill="${colour}" font-size="10" font-family="sans-serif" font-weight="700">${initials}</text>
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

function useResourceMap(
  containerRef: React.RefObject<HTMLDivElement | null>,
  pings: StaffPing[]
) {
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markersRef = useRef<Map<string, import("leaflet").Marker>>(new Map());

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
        const active = pings.filter(p => p.isSharing);
        const center: [number, number] = active.length > 0
          ? [
              active.reduce((s, p) => s + Number(p.latitude), 0) / active.length,
              active.reduce((s, p) => s + Number(p.longitude), 0) / active.length,
            ]
          : [52.5, -1.5];
        const zoom = active.length > 0 ? 15 : 6;

        mapRef.current = L.map(containerRef.current, { center, zoom, scrollWheelZoom: true });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 20,
        }).addTo(mapRef.current);
      }

      const map = mapRef.current;
      const seen = new Set<string>();

      for (const ping of pings) {
        if (!ping.isSharing) continue;
        seen.add(ping.userId);
        const colour = colourForUser(ping.userId);
        const initials = getInitials(ping.userName);
        const icon = L.icon({
          iconUrl: makeStaffSvgIcon(colour, initials),
          iconSize: [36, 44],
          iconAnchor: [18, 44],
          popupAnchor: [0, -44],
        });
        const lat = Number(ping.latitude);
        const lng = Number(ping.longitude);
        const existing = markersRef.current.get(ping.userId);
        if (existing) {
          existing.setLatLng([lat, lng]);
          existing.setPopupContent(popupHtml(ping, colour));
        } else {
          const marker = L.marker([lat, lng], { icon })
            .addTo(map)
            .bindPopup(popupHtml(ping, colour));
          markersRef.current.set(ping.userId, marker);
        }
      }

      for (const [userId, marker] of markersRef.current) {
        if (!seen.has(userId)) {
          marker.remove();
          markersRef.current.delete(userId);
        }
      }
    });
  }, [pings]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);
}

function popupHtml(ping: StaffPing, colour: string): string {
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

export default function ResourceMapPage() {
  const { farmId: selectedFarmId } = useAppStore();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(Date.now());

  const { data, dataUpdatedAt } = useQuery<{ pings: StaffPing[] }>({
    queryKey: ["staff-locations-live", selectedFarmId],
    queryFn: () =>
      fetch(`/api/farms/${selectedFarmId}/staff-locations/live`, { credentials: "include" }).then(r => r.json()),
    enabled: !!selectedFarmId,
    refetchInterval: 30_000,
    staleTime: 20_000,
  });

  const pings: StaffPing[] = data?.pings ?? [];
  const activePings = pings.filter(p => p.isSharing && isRecent(p.lastSeenAt, 2 * 60 * 60 * 1000));
  const livePings = activePings.filter(p => isRecent(p.lastSeenAt, 120_000));

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  useResourceMap(mapContainerRef as React.RefObject<HTMLDivElement | null>, activePings);

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
              Live staff locations · updates every 30 seconds · staff must enable sharing in the mobile app
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "#6b7280" }}>
            <Radio size={13} style={{ color: livePings.length > 0 ? "#16a34a" : "#9ca3af" }} />
            {livePings.length > 0 ? (
              <span style={{ color: "#16a34a", fontWeight: 600 }}>{livePings.length} live</span>
            ) : (
              <span>No active staff</span>
            )}
            {dataUpdatedAt > 0 && (
              <span style={{ color: "#9ca3af" }}>· refreshed {timeSince(new Date(dataUpdatedAt).toISOString())}</span>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "1rem", flex: 1, minHeight: 0 }}>

          {/* Map */}
          <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #e5e7eb", position: "relative" }}>
            <div ref={mapContainerRef} style={{ width: "100%", height: "100%", minHeight: 500 }} />
            {activePings.length === 0 && (
              <div style={{
                position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", background: "rgba(248,250,252,0.92)",
                gap: "0.75rem",
              }}>
                <MapPin size={40} style={{ color: "#cbd5e1" }} />
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontWeight: 600, margin: "0 0 0.25rem", color: "#374151" }}>No staff sharing location</p>
                  <p style={{ fontSize: "0.78rem", color: "#6b7280", margin: 0, maxWidth: 280 }}>
                    Staff can enable location sharing from the <strong>Settings</strong> tab in the mobile app. Locations update every 30 seconds while sharing is active.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Staff list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", overflowY: "auto" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280", margin: 0 }}>
              Active Staff ({activePings.length})
            </p>
            {activePings.length === 0 && (
              <div style={{ border: "1px solid #f1f5f9", borderRadius: 8, padding: "1.5rem", textAlign: "center" }}>
                <User size={24} style={{ color: "#cbd5e1", marginBottom: "0.5rem" }} />
                <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: 0 }}>No staff currently sharing</p>
              </div>
            )}
            {activePings.map(ping => {
              const colour = colourForUser(ping.userId);
              const live = isRecent(ping.lastSeenAt, 120_000);
              return (
                <div key={ping.userId} style={{
                  border: `1px solid ${live ? "#dcfce7" : "#f1f5f9"}`,
                  borderRadius: 8,
                  padding: "0.75rem",
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

            {/* How-to panel */}
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "0.75rem", background: "#f8fafc", marginTop: "auto" }}>
              <p style={{ fontWeight: 600, fontSize: "0.75rem", margin: "0 0 0.4rem", color: "#374151" }}>How to enable</p>
              <ol style={{ fontSize: "0.72rem", color: "#6b7280", margin: 0, paddingLeft: "1rem", lineHeight: 1.6 }}>
                <li>Open the <strong>BDE Farm Trac</strong> mobile app</li>
                <li>Tap <strong>Settings</strong> (bottom right)</li>
                <li>Toggle <strong>Share My Location</strong></li>
                <li>Accept the location permission prompt</li>
              </ol>
              <p style={{ fontSize: "0.7rem", color: "#9ca3af", margin: "0.5rem 0 0" }}>
                Location sharing stops automatically when you toggle off or close the app.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
