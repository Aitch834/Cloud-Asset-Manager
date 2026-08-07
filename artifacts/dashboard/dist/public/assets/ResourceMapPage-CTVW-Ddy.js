const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/leaflet-src-CJpDsZ_s.js","assets/index-DdauBpB2.js","assets/index-CKHexFMm.css"])))=>i.map(i=>d[i]);
import { s as createLucideIcon, b as useAppStore, r as reactExports, m as useQuery, j as jsxRuntimeExports, M as MapPin, _ as __vitePreload } from "./index-DdauBpB2.js";
import { A as AppLayout, N as Navigation, Z as Zap, j as Truck, O as Settings } from "./AppLayout-2_59ebxT.js";
import { U as User } from "./user-C4v-c3K8.js";
import { a as Clock } from "./database-DtvJ0M-b.js";
import "./use-safe-clerk-dFUlM-Sf.js";
import "./trash-2-BI4grtF-.js";
import "./shield-alert-DYbiJYaJ.js";
import "./triangle-alert-BvtjyS2s.js";
import "./shield-check-B-7Lcgyq.js";
import "./tractor-DwtiTmyt.js";
const __iconNode$1 = [
  ["path", { d: "M16.247 7.761a6 6 0 0 1 0 8.478", key: "1fwjs5" }],
  ["path", { d: "M19.075 4.933a10 10 0 0 1 0 14.134", key: "ehdyv1" }],
  ["path", { d: "M4.925 19.067a10 10 0 0 1 0-14.134", key: "1q22gi" }],
  ["path", { d: "M7.753 16.239a6 6 0 0 1 0-8.478", key: "r2q7qm" }],
  ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }]
];
const Radio = createLucideIcon("radio", __iconNode$1);
const __iconNode = [
  ["path", { d: "M10.513 4.856 13.12 2.17a.5.5 0 0 1 .86.46l-1.377 4.317", key: "193nxd" }],
  ["path", { d: "M15.656 10H20a1 1 0 0 1 .78 1.63l-1.72 1.773", key: "27a7lr" }],
  [
    "path",
    {
      d: "M16.273 16.273 10.88 21.83a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14H4a1 1 0 0 1-.78-1.63l4.507-4.643",
      key: "1e0qe9"
    }
  ],
  ["path", { d: "m2 2 20 20", key: "1ooewy" }]
];
const ZapOff = createLucideIcon("zap-off", __iconNode);
const CATEGORIES = ["tractor", "combine", "sprayer", "vehicle", "plant", "trailer", "atv", "other"];
const CATEGORY_LABELS = {
  tractor: "Tractors",
  combine: "Combines",
  sprayer: "Sprayers",
  vehicle: "Vehicles",
  plant: "Plant",
  trailer: "Trailers",
  atv: "ATVs",
  other: "Other"
};
const CATEGORY_COLOURS = {
  tractor: "#92400e",
  combine: "#78350f",
  sprayer: "#166534",
  vehicle: "#1e3a5f",
  plant: "#7c2d12",
  trailer: "#4b5563",
  atv: "#6b21a8",
  other: "#374151"
};
const STAFF_COLOURS = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#9333ea",
  "#ea580c",
  "#0891b2",
  "#ca8a04",
  "#db2777",
  "#65a30d",
  "#7c3aed"
];
function colourForUser(userId) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  return STAFF_COLOURS[Math.abs(hash) % STAFF_COLOURS.length];
}
function getAssetCategory(asset) {
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
function getIconPath(cat) {
  switch (cat) {
    case "staff":
      return `<circle cx="10" cy="5.5" r="3.8"/>
              <path d="M2.5 20 C2.5 12.5 17.5 12.5 17.5 20Z"/>`;
    case "tractor":
      return `<circle cx="14" cy="14" r="5.5" stroke="white" stroke-width="1.5"/>
              <circle cx="4" cy="16" r="3" stroke="white" stroke-width="1.2"/>
              <rect x="5" y="9" width="8" height="5" rx="0.5"/>
              <rect x="8" y="5" width="6" height="5" rx="0.5"/>
              <rect x="8.8" y="5.8" width="4.4" height="3" rx="0.3" fill="white" opacity="0.5"/>`;
    case "combine":
      return `<rect x="0" y="9" width="7" height="5" rx="0.5" opacity="0.9"/>
              <line x1="1" y1="11" x2="6" y2="11" stroke="white" stroke-width="0.8" fill="none"/>
              <line x1="1" y1="13" x2="6" y2="13" stroke="white" stroke-width="0.8" fill="none"/>
              <rect x="6" y="7" width="13" height="8" rx="1"/>
              <rect x="11" y="3" width="8" height="5" rx="1"/>
              <rect x="12" y="3.8" width="6" height="3" rx="0.3" fill="white" opacity="0.4"/>
              <circle cx="10" cy="17" r="2.5" stroke="white" stroke-width="1.2"/>
              <circle cx="17" cy="17" r="2.5" stroke="white" stroke-width="1.2"/>`;
    case "sprayer":
      return `<ellipse cx="10" cy="9" rx="5.5" ry="4"/>
              <rect x="0" y="10.5" width="20" height="2.5" rx="1"/>
              <circle cx="3" cy="15.5" r="1.4"/>
              <circle cx="10" cy="16" r="1.4"/>
              <circle cx="17" cy="15.5" r="1.4"/>`;
    case "vehicle":
      return `<rect x="1" y="9" width="18" height="7" rx="2"/>
              <path d="M9 9 L9 14 L19 14 L19 9 Z" fill="white" opacity="0.35"/>
              <circle cx="5" cy="17" r="2.5" stroke="white" stroke-width="1.2"/>
              <circle cx="15" cy="17" r="2.5" stroke="white" stroke-width="1.2"/>`;
    case "plant":
      return `<rect x="1" y="14" width="13" height="4" rx="1.5"/>
              <rect x="3" y="8" width="10" height="7" rx="1"/>
              <rect x="5" y="9" width="5" height="4" rx="0.5" fill="white" opacity="0.4"/>
              <polygon points="12,8 20,3 20,9"/>`;
    case "trailer":
      return `<rect x="3" y="8" width="16" height="8" rx="1"/>
              <line x1="3" y1="12" x2="19" y2="12" stroke="white" stroke-width="0.8" fill="none"/>
              <rect x="0" y="11" width="4" height="2" rx="0.8"/>
              <circle cx="12" cy="17" r="2.5" stroke="white" stroke-width="1.2"/>
              <circle cx="17" cy="17" r="2.5" stroke="white" stroke-width="1.2"/>`;
    case "atv":
      return `<rect x="5" y="7" width="10" height="7" rx="2"/>
              <rect x="2" y="4" width="7" height="2" rx="1"/>
              <circle cx="4" cy="15" r="3.5" stroke="white" stroke-width="1.2"/>
              <circle cx="16" cy="15" r="3.5" stroke="white" stroke-width="1.2"/>`;
    default:
      return `<rect x="2" y="9" width="16" height="7" rx="2"/>
              <circle cx="6" cy="17" r="2.5" stroke="white" stroke-width="1.2"/>
              <circle cx="14" cy="17" r="2.5" stroke="white" stroke-width="1.2"/>`;
  }
}
function makePinSvg(colour, iconPaths) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48">
    <path d="M20 0C9 0 0 9 0 20c0 13 20 28 20 28S40 33 40 20C40 9 31 0 20 0z" fill="${colour}" stroke="white" stroke-width="2"/>
    <circle cx="20" cy="20" r="13" fill="white" opacity="0.93"/>
    <g transform="translate(10,10)" fill="${colour}">${iconPaths}</g>
  </svg>`;
  return "data:image/svg+xml;base64," + btoa(svg);
}
function makeStaffPin(colour, initials) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
    <path d="M18 0C8.059 0 0 8.059 0 18c0 12 18 26 18 26S36 30 36 18C36 8.059 27.941 0 18 0z" fill="${colour}" stroke="white" stroke-width="2"/>
    <circle cx="18" cy="18" r="11" fill="white" opacity="0.9"/>
    <text x="18" y="22" text-anchor="middle" fill="${colour}" font-size="10" font-family="sans-serif" font-weight="700">${initials}</text>
  </svg>`;
  return "data:image/svg+xml;base64," + btoa(svg);
}
function getInitials(name) {
  return name.split(" ").map((n) => n[0] ?? "").join("").toUpperCase().slice(0, 2);
}
function timeSince(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1e3);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}
function isRecent(iso, maxAgeMs = 12e4) {
  return Date.now() - new Date(iso).getTime() < maxAgeMs;
}
function providerLabel(provider) {
  const labels = {
    teltonika: "Teltonika",
    samsara: "Samsara",
    webfleet: "Webfleet",
    john_deere: "John Deere",
    agco: "AGCO"
  };
  return labels[provider] ?? provider;
}
function staffTooltipHtml(ping) {
  return `<div style="font-size:12px;line-height:1.5;padding:1px 2px">
    <strong>${ping.userName}</strong><br>
    <span style="color:#64748b">Staff · ${timeSince(ping.lastSeenAt)}</span>
  </div>`;
}
function assetTooltipHtml(asset) {
  const cat = getAssetCategory(asset);
  const name = asset.assetName ?? asset.externalAssetId;
  const speed = asset.speedKph != null ? ` · ${Number(asset.speedKph).toFixed(0)} km/h` : "";
  return `<div style="font-size:12px;line-height:1.5;padding:1px 2px">
    <strong>${name}</strong><br>
    <span style="color:#64748b">${CATEGORY_LABELS[cat]} · ${timeSince(asset.lastSeenAt)}${speed}</span>
  </div>`;
}
function staffPopupHtml(ping, colour) {
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
function assetPopupHtml(asset, colour) {
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
function useResourceMap(containerRef, pings, assets) {
  const mapRef = reactExports.useRef(null);
  const staffMarkersRef = reactExports.useRef(/* @__PURE__ */ new Map());
  const assetMarkersRef = reactExports.useRef(/* @__PURE__ */ new Map());
  reactExports.useEffect(() => {
    __vitePreload(() => import("./leaflet-src-CJpDsZ_s.js").then((n) => n.l), true ? __vite__mapDeps([0,1,2]) : void 0).then((L) => {
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
          ...pings.filter((p) => p.isSharing).map((p) => [Number(p.latitude), Number(p.longitude)]),
          ...assets.map((a) => [Number(a.latitude), Number(a.longitude)])
        ];
        const center = allPoints.length > 0 ? [
          allPoints.reduce((s, p) => s + p[0], 0) / allPoints.length,
          allPoints.reduce((s, p) => s + p[1], 0) / allPoints.length
        ] : [52.5, -1.5];
        mapRef.current = L.map(containerRef.current, { center, zoom: allPoints.length > 0 ? 14 : 6, scrollWheelZoom: true });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 20
        }).addTo(mapRef.current);
      }
      const map = mapRef.current;
      const seenStaff = /* @__PURE__ */ new Set();
      for (const ping of pings) {
        if (!ping.isSharing) continue;
        seenStaff.add(ping.userId);
        const colour = colourForUser(ping.userId);
        const iconUrl = makeStaffPin(colour, getInitials(ping.userName));
        const icon = L.icon({ iconUrl, iconSize: [36, 44], iconAnchor: [18, 44], popupAnchor: [0, -48], tooltipAnchor: [0, -46] });
        const lat = Number(ping.latitude);
        const lng = Number(ping.longitude);
        const existing = staffMarkersRef.current.get(ping.userId);
        if (existing) {
          existing.setLatLng([lat, lng]);
          existing.setPopupContent(staffPopupHtml(ping, colour));
          existing.setTooltipContent(staffTooltipHtml(ping));
        } else {
          const marker = L.marker([lat, lng], { icon }).addTo(map).bindPopup(staffPopupHtml(ping, colour)).bindTooltip(staffTooltipHtml(ping), { direction: "top", offset: [0, -44], opacity: 0.97, sticky: false });
          staffMarkersRef.current.set(ping.userId, marker);
        }
      }
      for (const [userId, marker] of staffMarkersRef.current) {
        if (!seenStaff.has(userId)) {
          marker.remove();
          staffMarkersRef.current.delete(userId);
        }
      }
      const seenAssets = /* @__PURE__ */ new Set();
      for (const asset of assets) {
        const key = `${asset.provider}::${asset.externalAssetId}`;
        seenAssets.add(key);
        const cat = getAssetCategory(asset);
        const colour = CATEGORY_COLOURS[cat];
        const iconUrl = makePinSvg(colour, getIconPath(cat));
        const icon = L.icon({ iconUrl, iconSize: [40, 48], iconAnchor: [20, 48], popupAnchor: [0, -52], tooltipAnchor: [0, -50] });
        const lat = Number(asset.latitude);
        const lng = Number(asset.longitude);
        const existing = assetMarkersRef.current.get(key);
        if (existing) {
          existing.setLatLng([lat, lng]);
          existing.setPopupContent(assetPopupHtml(asset, colour));
          existing.setTooltipContent(assetTooltipHtml(asset));
        } else {
          const marker = L.marker([lat, lng], { icon }).addTo(map).bindPopup(assetPopupHtml(asset, colour)).bindTooltip(assetTooltipHtml(asset), { direction: "top", offset: [0, -48], opacity: 0.97, sticky: false });
          assetMarkersRef.current.set(key, marker);
        }
      }
      for (const [key, marker] of assetMarkersRef.current) {
        if (!seenAssets.has(key)) {
          marker.remove();
          assetMarkersRef.current.delete(key);
        }
      }
    });
  }, [pings, assets]);
  reactExports.useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);
}
function CategoryDot({ cat, size = 28 }) {
  const colour = CATEGORY_COLOURS[cat];
  const icon = getIconPath(cat);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      title: CATEGORY_LABELS[cat],
      style: {
        width: size,
        height: size,
        borderRadius: 6,
        background: colour,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden"
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: size * 0.7, height: size * 0.7, viewBox: "0 0 20 20", fill: "white", children: /* @__PURE__ */ jsxRuntimeExports.jsx("g", { dangerouslySetInnerHTML: { __html: icon.replace(/fill="white"/g, 'fill="white"') } }) })
    }
  );
}
function ResourceMapPage() {
  const { farmId: selectedFarmId } = useAppStore();
  const mapContainerRef = reactExports.useRef(null);
  const [showStaff, setShowStaff] = reactExports.useState(true);
  const [enabledCats, setEnabledCats] = reactExports.useState(() => new Set(CATEGORIES));
  function toggleCat(cat) {
    setEnabledCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }
  const staffQ = useQuery({
    queryKey: ["staff-locations-live", selectedFarmId],
    queryFn: () => fetch(`/api/farms/${selectedFarmId}/staff-locations/live`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!selectedFarmId,
    refetchInterval: 3e4,
    staleTime: 2e4
  });
  const assetsQ = useQuery({
    queryKey: ["gps-assets-live", selectedFarmId],
    queryFn: () => fetch(`/api/farms/${selectedFarmId}/gps-assets/live`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!selectedFarmId,
    refetchInterval: 6e4,
    staleTime: 5e4
  });
  const allPings = staffQ.data?.pings ?? [];
  const allAssets = assetsQ.data?.assets ?? [];
  const activePings = allPings.filter((p) => p.isSharing && isRecent(p.lastSeenAt, 2 * 60 * 60 * 1e3));
  const livePings = activePings.filter((p) => isRecent(p.lastSeenAt, 12e4));
  const recentAssets = allAssets.filter((a) => isRecent(a.lastSeenAt, 24 * 60 * 60 * 1e3));
  const liveAssets = recentAssets.filter((a) => isRecent(a.lastSeenAt, 5 * 60 * 1e3));
  const catCounts = reactExports.useMemo(() => {
    const counts = {};
    for (const cat of CATEGORIES) counts[cat] = recentAssets.filter((a) => getAssetCategory(a) === cat).length;
    return counts;
  }, [recentAssets]);
  const populatedCats = CATEGORIES.filter((c) => catCounts[c] > 0);
  const mapPings = showStaff ? activePings : [];
  const mapAssets = recentAssets.filter((a) => enabledCats.has(getAssetCategory(a)));
  useResourceMap(mapContainerRef, mapPings, mapAssets);
  const nothingOnMap = mapPings.length === 0 && mapAssets.length === 0;
  const visibleAssets = mapAssets;
  const visiblePings = mapPings;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "1.5rem", height: "100%", display: "flex", flexDirection: "column", gap: "1rem" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { style: { fontWeight: 700, fontSize: "1.25rem", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, { size: 20, style: { color: "#2563eb" } }),
          "Resource Map"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#6b7280", margin: "0.25rem 0 0" }, children: "Live staff locations and GPS-tracked assets · hover pins for details, click for full info" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { size: 13, style: { color: livePings.length + liveAssets.length > 0 ? "#16a34a" : "#9ca3af" } }),
        livePings.length + liveAssets.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.75rem", color: "#16a34a", fontWeight: 600 }, children: [
          livePings.length > 0 && `${livePings.length} staff`,
          livePings.length > 0 && liveAssets.length > 0 && " · ",
          liveAssets.length > 0 && `${liveAssets.length} assets`,
          " ",
          "live"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.75rem", color: "#9ca3af" }, children: "Nothing live" })
      ] })
    ] }),
    (activePings.length > 0 || recentAssets.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexWrap: "wrap", gap: "0.4rem", alignItems: "center" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginRight: 2 }, children: "Show:" }),
      activePings.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setShowStaff((v) => !v),
          style: {
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "3px 10px",
            borderRadius: 20,
            border: "1.5px solid",
            cursor: "pointer",
            fontSize: "0.72rem",
            fontWeight: 600,
            background: showStaff ? "#2563eb" : "white",
            color: showStaff ? "white" : "#6b7280",
            borderColor: showStaff ? "#2563eb" : "#d1d5db",
            transition: "all 0.15s"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(User, { size: 11 }),
            "Staff (",
            activePings.length,
            ")"
          ]
        }
      ),
      populatedCats.map((cat) => {
        const active = enabledCats.has(cat);
        const colour = CATEGORY_COLOURS[cat];
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => toggleCat(cat),
            style: {
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "3px 10px",
              borderRadius: 20,
              border: `1.5px solid`,
              cursor: "pointer",
              fontSize: "0.72rem",
              fontWeight: 600,
              background: active ? colour : "white",
              color: active ? "white" : "#6b7280",
              borderColor: active ? colour : "#d1d5db",
              transition: "all 0.15s"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "12", height: "12", viewBox: "0 0 20 20", fill: active ? "white" : colour, style: { flexShrink: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("g", { dangerouslySetInnerHTML: { __html: getIconPath(cat) } }) }),
              CATEGORY_LABELS[cat],
              " (",
              catCounts[cat],
              ")"
            ]
          },
          cat
        );
      }),
      populatedCats.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            if (enabledCats.size === CATEGORIES.length) {
              setEnabledCats(/* @__PURE__ */ new Set());
            } else {
              setEnabledCats(new Set(CATEGORIES));
            }
          },
          style: { fontSize: "0.68rem", color: "#9ca3af", background: "none", border: "none", cursor: "pointer", padding: "3px 6px", textDecoration: "underline" },
          children: enabledCats.size === CATEGORIES.length ? "Hide all assets" : "Show all assets"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 300px", gap: "1rem", flex: 1, minHeight: 0 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { borderRadius: 10, overflow: "hidden", border: "1px solid #e5e7eb", position: "relative" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: mapContainerRef, style: { width: "100%", height: "100%", minHeight: 500 } }),
        nothingOnMap && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(248,250,252,0.92)",
          gap: "0.75rem"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 40, style: { color: "#cbd5e1" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, margin: "0 0 0.25rem", color: "#374151" }, children: "Nothing on the map" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.78rem", color: "#6b7280", margin: 0, maxWidth: 300 }, children: "Use the filters above to show items, or connect a GPS provider in Farm Settings." })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "0.75rem", overflowY: "auto" }, children: [
        visibleAssets.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280", margin: 0 }, children: [
            "GPS Assets (",
            visibleAssets.length,
            visibleAssets.length !== recentAssets.length ? ` of ${recentAssets.length}` : "",
            ")"
          ] }),
          visibleAssets.map((asset) => {
            const cat = getAssetCategory(asset);
            const live = isRecent(asset.lastSeenAt, 5 * 60 * 1e3);
            const speed = asset.speedKph != null ? `${Number(asset.speedKph).toFixed(0)} km/h` : null;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
              border: `1px solid ${live ? "#dcfce7" : "#f1f5f9"}`,
              borderRadius: 8,
              padding: "0.75rem",
              background: live ? "#f0fdf4" : "#fafafa"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryDot, { cat, size: 30 }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, margin: 0, fontSize: "0.83rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: asset.assetName ?? asset.externalAssetId }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 4 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: 6, height: 6, borderRadius: "50%", background: live ? "#16a34a" : "#9ca3af" } }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.68rem", color: live ? "#15803d" : "#6b7280" }, children: [
                      CATEGORY_LABELS[cat],
                      " · ",
                      providerLabel(asset.provider)
                    ] })
                  ] })
                ] }),
                asset.ignitionOn != null && (asset.ignitionOn ? /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 13, style: { color: "#16a34a", flexShrink: 0 } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ZapOff, { size: 13, style: { color: "#9ca3af", flexShrink: 0 } }))
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.7rem", color: "#6b7280", display: "flex", flexDirection: "column", gap: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "flex", alignItems: "center", gap: 4 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 10 }),
                  "Last seen ",
                  timeSince(asset.lastSeenAt)
                ] }),
                speed && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "flex", alignItems: "center", gap: 4 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, { size: 10 }),
                  speed
                ] })
              ] })
            ] }, `${asset.provider}-${asset.externalAssetId}`);
          })
        ] }),
        recentAssets.length > 0 && visibleAssets.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { border: "1px solid #f1f5f9", borderRadius: 8, padding: "1.25rem", textAlign: "center" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { size: 22, style: { color: "#cbd5e1", marginBottom: "0.4rem" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.78rem", color: "#94a3b8", margin: 0 }, children: "All asset types hidden — use filters above" })
        ] }),
        recentAssets.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { border: "1px solid #f1f5f9", borderRadius: 8, padding: "1.25rem", textAlign: "center" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { size: 22, style: { color: "#cbd5e1", marginBottom: "0.4rem" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.78rem", color: "#94a3b8", margin: 0 }, children: "No GPS assets — connect a provider in Farm Settings" })
        ] }),
        activePings.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280", margin: visibleAssets.length > 0 ? "0.5rem 0 0" : 0 }, children: [
            "Active Staff (",
            activePings.length,
            ")"
          ] }),
          !showStaff && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { border: "1px solid #f1f5f9", borderRadius: 8, padding: "0.75rem", textAlign: "center" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.78rem", color: "#94a3b8", margin: 0 }, children: 'Staff hidden — toggle "Staff" filter above' }) }),
          showStaff && visiblePings.map((ping) => {
            const colour = colourForUser(ping.userId);
            const live = isRecent(ping.lastSeenAt, 12e4);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
              border: `1px solid ${live ? "#dcfce7" : "#f1f5f9"}`,
              borderRadius: 8,
              padding: "0.75rem",
              background: live ? "#f0fdf4" : "#fafafa"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: colour,
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: 700,
                  flexShrink: 0
                }, children: getInitials(ping.userName) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, margin: 0, fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: ping.userName }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 4 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: 6, height: 6, borderRadius: "50%", background: live ? "#16a34a" : "#f59e0b" } }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", color: live ? "#15803d" : "#b45309" }, children: live ? "Live" : "Stale" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.72rem", color: "#6b7280", display: "flex", flexDirection: "column", gap: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "flex", alignItems: "center", gap: 4 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 10 }),
                  "Last seen ",
                  timeSince(ping.lastSeenAt)
                ] }),
                ping.shiftStartedAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "flex", alignItems: "center", gap: 4 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { size: 10 }),
                  "On shift since ",
                  new Date(ping.shiftStartedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
                ] }),
                ping.accuracyM != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "flex", alignItems: "center", gap: 4 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 10 }),
                  "±",
                  Math.round(Number(ping.accuracyM)),
                  "m accuracy"
                ] })
              ] })
            ] }, ping.userId);
          })
        ] }),
        activePings.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { border: "1px solid #f1f5f9", borderRadius: 8, padding: "1.25rem", textAlign: "center" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(User, { size: 22, style: { color: "#cbd5e1", marginBottom: "0.4rem" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.78rem", color: "#94a3b8", margin: 0 }, children: "No staff currently sharing" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { border: "1px solid #e5e7eb", borderRadius: 8, padding: "0.75rem", background: "#f8fafc", marginTop: "auto" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontWeight: 600, fontSize: "0.75rem", margin: "0 0 0.4rem", color: "#374151", display: "flex", alignItems: "center", gap: 4 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { size: 11 }),
            " How to add assets"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { style: { fontSize: "0.72rem", color: "#6b7280", margin: 0, paddingLeft: "1rem", lineHeight: 1.6 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              "Go to ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Farm Settings" }),
              " (bottom of sidebar)"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              "Scroll to ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "GPS Tracking Integration" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Choose a provider and enter your credentials" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#9ca3af", margin: "0.5rem 0 0" }, children: "Staff sharing: toggle on in the mobile app Settings tab." })
        ] })
      ] })
    ] })
  ] }) });
}
export {
  ResourceMapPage as default
};
