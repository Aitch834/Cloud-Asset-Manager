const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/leaflet-src-D8FL_s3A.js","assets/index-D7ZO0VGK.js","assets/index-D3ZaVrZB.css"])))=>i.map(i=>d[i]);
import { b as useAppStore, r as reactExports, m as useQuery, j as jsxRuntimeExports, K as Map, p as Link, n as Card, I as Input, B as Building2, U as FlaskConical, M as MapPin, _ as __vitePreload } from "./index-D7ZO0VGK.js";
import { A as AppLayout, O as Settings, W as Warehouse, g as TreePine, U as Users } from "./AppLayout-Dhh_mrn9.js";
import { B as Badge } from "./badge-CiyLYdW8.js";
import { S as Search } from "./search-DdueEEQk.js";
import { T as Tractor } from "./tractor-PFHJjWQR.js";
import { L as LayoutGrid } from "./layout-grid-BbbYff9P.js";
import { E as Eye } from "./eye-BlXP7XZL.js";
import { E as EyeOff } from "./eye-off-C9xtOVRW.js";
import "./use-safe-clerk-7yMW6KhG.js";
import "./trash-2-SD082oaV.js";
import "./database-XSCw2Xzj.js";
import "./shield-alert-B4pSLPwP.js";
import "./triangle-alert-B0-UZQns.js";
import "./shield-check-C2e67sX1.js";
const LOCATION_TYPES = [
  { value: "livestock_building", label: "Livestock Building", icon: Building2, colour: "bg-blue-100 text-blue-800", markerColour: "#3b82f6" },
  { value: "grain_store", label: "Crop & Feed Store", icon: Warehouse, colour: "bg-yellow-100 text-yellow-800", markerColour: "#eab308" },
  { value: "workshop", label: "Equipment & Workshop", icon: Tractor, colour: "bg-orange-100 text-orange-800", markerColour: "#f97316" },
  { value: "chemical_store", label: "Chemical & Fuel Store", icon: FlaskConical, colour: "bg-red-100 text-red-800", markerColour: "#ef4444" },
  { value: "yard", label: "Outdoor Area / Yard", icon: TreePine, colour: "bg-green-100 text-green-800", markerColour: "#22c55e" },
  { value: "field", label: "Field", icon: TreePine, colour: "bg-lime-100 text-lime-800", markerColour: "#84cc16" },
  { value: "welfare_facility", label: "Welfare Facility", icon: Users, colour: "bg-purple-100 text-purple-800", markerColour: "#a855f7" },
  { value: "office", label: "Office / Farm Building", icon: LayoutGrid, colour: "bg-slate-100 text-slate-700", markerColour: "#64748b" },
  { value: "other", label: "Other", icon: MapPin, colour: "bg-gray-100 text-gray-700", markerColour: "#9ca3af" }
];
const typeMap = Object.fromEntries(LOCATION_TYPES.map((t) => [t.value, t]));
const INSPECTION_COLOURS = {
  urgent: "#ef4444",
  treat: "#f97316",
  monitor: "#eab308",
  none: "#6b7280"
};
function makeSvgIcon(colour) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="${colour}" stroke="white" stroke-width="2"/>
    <circle cx="14" cy="14" r="5" fill="white"/>
  </svg>`;
  return "data:image/svg+xml;base64," + btoa(svg);
}
function makeInspectionSvgIcon(colour) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="0 0 24 32">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 8 12 20 12 20S24 20 24 12C24 5.373 18.627 0 12 0z" fill="${colour}" stroke="white" stroke-width="2" opacity="0.9"/>
    <text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-family="sans-serif" font-weight="bold">!</text>
  </svg>`;
  return "data:image/svg+xml;base64," + btoa(svg);
}
function useFarmMap(containerRef, locations, onSelect) {
  const mapRef = reactExports.useRef(null);
  const markersRef = reactExports.useRef(new globalThis.Map());
  reactExports.useEffect(() => {
    __vitePreload(() => import("./leaflet-src-D8FL_s3A.js").then((n) => n.l), true ? __vite__mapDeps([0,1,2]) : void 0).then((L) => {
      if (!window._leafletLoaded) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
        window._leafletLoaded = true;
      }
      window._L = L;
      if (!containerRef.current || mapRef.current) return;
      const pinned = locations.filter((l) => l.latitude != null && l.longitude != null);
      const center = pinned.length > 0 ? [
        pinned.reduce((s, l) => s + l.latitude, 0) / pinned.length,
        pinned.reduce((s, l) => s + l.longitude, 0) / pinned.length
      ] : [52.8, -1.5];
      const zoom = pinned.length > 0 ? 15 : 6;
      const map = L.map(containerRef.current, { center, zoom, scrollWheelZoom: true });
      map.scrollWheelZoom.enable();
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 20
      }).addTo(map);
      map.on("click", () => onSelect(null));
      for (const loc of pinned) {
        const t = typeMap[loc.locationType];
        const colour = t?.markerColour ?? "#9ca3af";
        const icon = L.icon({
          iconUrl: makeSvgIcon(colour),
          iconSize: [28, 36],
          iconAnchor: [14, 36],
          popupAnchor: [0, -36]
        });
        const marker = L.marker([loc.latitude, loc.longitude], { icon }).addTo(map).bindPopup(
          `<div style="min-width:160px">
              <p style="font-weight:600;margin:0 0 4px">${loc.name}</p>
              <p style="color:#64748b;font-size:12px;margin:0 0 4px">${t?.label ?? loc.locationType}</p>
              ${loc.description ? `<p style="font-size:12px;margin:0">${loc.description}</p>` : ""}
            </div>`
        );
        marker.on("click", (e) => {
          e.originalEvent.stopPropagation();
          onSelect(loc.id);
        });
        markersRef.current.set(loc.id, marker);
      }
      if (pinned.length > 1) {
        const group = L.featureGroup(Array.from(markersRef.current.values()));
        map.fitBounds(group.getBounds().pad(0.15));
      }
    });
    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.off();
          mapRef.current.remove();
        } catch {
        }
        mapRef.current = null;
        markersRef.current.clear();
      }
    };
  }, []);
  function panTo(id) {
    const marker = markersRef.current.get(id);
    if (marker && mapRef.current) {
      mapRef.current.setView(marker.getLatLng(), Math.max(mapRef.current.getZoom(), 17), { animate: true });
      marker.openPopup();
    }
  }
  return { panTo, mapRef };
}
function FarmMapPage() {
  const { farmId } = useAppStore();
  const containerRef = reactExports.useRef(null);
  const [search, setSearch] = reactExports.useState("");
  const [selectedId, setSelectedId] = reactExports.useState(null);
  const [filterType, setFilterType] = reactExports.useState("");
  const [showInspections, setShowInspections] = reactExports.useState(false);
  const inspectionMarkersRef = reactExports.useRef([]);
  const { data: locations = [], isLoading } = useQuery({
    queryKey: ["farm-locations", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/farm-locations`).then((r) => r.json()),
    enabled: !!farmId
  });
  const { data: inspectionsData } = useQuery({
    queryKey: ["field-inspections-map", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/field-inspections`).then((r) => r.json()),
    enabled: !!farmId && showInspections
  });
  const inspectionsWithGeo = (inspectionsData?.records ?? []).filter(
    (r) => r.latitude && r.longitude && parseFloat(r.latitude) !== 0 && parseFloat(r.longitude) !== 0
  );
  const pinned = locations.filter((l) => l.isActive && l.latitude != null);
  const unpinned = locations.filter((l) => l.isActive && l.latitude == null);
  const { panTo, mapRef } = useFarmMap(containerRef, pinned, setSelectedId);
  reactExports.useEffect(() => {
    const L = window._L;
    const map = mapRef.current;
    if (!L || !map) return;
    for (const m of inspectionMarkersRef.current) {
      try {
        m.remove();
      } catch {
      }
    }
    inspectionMarkersRef.current = [];
    if (!showInspections) return;
    for (const insp of inspectionsWithGeo) {
      const lat = parseFloat(insp.latitude);
      const lng = parseFloat(insp.longitude);
      if (isNaN(lat) || isNaN(lng)) continue;
      const colour = INSPECTION_COLOURS[insp.actionRequired] ?? INSPECTION_COLOURS.none;
      const icon = L.icon({
        iconUrl: makeInspectionSvgIcon(colour),
        iconSize: [24, 32],
        iconAnchor: [12, 32],
        popupAnchor: [0, -32]
      });
      const dateStr = insp.inspectionDate ? new Date(insp.inspectionDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
      const actionLabel = insp.actionRequired === "urgent" ? "Urgent action" : insp.actionRequired === "treat" ? "Treatment needed" : insp.actionRequired === "monitor" ? "Monitor" : "No action";
      const marker = L.marker([lat, lng], { icon }).addTo(map).bindPopup(
        `<div style="min-width:160px">
            <p style="font-weight:600;margin:0 0 2px;font-size:13px">Field Inspection</p>
            <p style="margin:0 0 2px;font-size:12px;color:#374151">${insp.fieldName}</p>
            <p style="margin:0 0 4px;font-size:11px;color:#64748b">${dateStr}${insp.inspector ? ` · ${insp.inspector}` : ""}</p>
            <p style="margin:0;font-size:11px;font-weight:600;color:${colour}">${actionLabel}</p>
            ${insp.pestDiseaseObservations ? `<p style="margin:4px 0 0;font-size:11px;color:#6b7280">${insp.pestDiseaseObservations.slice(0, 80)}${insp.pestDiseaseObservations.length > 80 ? "…" : ""}</p>` : ""}
          </div>`
      );
      inspectionMarkersRef.current.push(marker);
    }
  }, [showInspections, inspectionsWithGeo.length]);
  const filteredPinned = pinned.filter((l) => {
    if (filterType && l.locationType !== filterType) return false;
    if (search) {
      const s = search.toLowerCase();
      return l.name.toLowerCase().includes(s) || (l.description ?? "").toLowerCase().includes(s);
    }
    return true;
  });
  if (!farmId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-64 text-foreground/50", children: "Please select a farm first." }) });
  }
  if (!isLoading && pinned.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-lg mx-auto mt-20 text-center space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Map, { className: "w-12 h-12 text-foreground/20 mx-auto" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-foreground", children: "No map pins yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground/60 text-sm", children: "Add map pins to your farm buildings and areas to see them plotted here. Open the Farm Buildings & Areas page, edit a location, and drop a pin on the map." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { href: "/farm-locations", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "w-4 h-4" }),
        " Manage Farm Locations"
      ] }) })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl font-bold text-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Map, { className: "w-6 h-6 text-primary" }),
          "Farm Map"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-foreground/60 mt-1", children: [
          pinned.length,
          " location",
          pinned.length !== 1 ? "s" : "",
          " plotted",
          unpinned.length > 0 && ` · ${unpinned.length} without a pin`
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { href: "/farm-locations", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "w-4 h-4" }),
        " Manage Locations"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 items-start", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-0 overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 border-b space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "Search…",
                className: "pl-8 h-8 text-sm bg-white",
                value: search,
                onChange: (e) => setSearch(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              className: "w-full h-8 rounded-md border border-input bg-background px-2 text-xs",
              value: filterType,
              onChange: (e) => setFilterType(e.target.value),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All types" }),
                LOCATION_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t.value, children: t.label }, t.value))
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setShowInspections((v) => !v),
              className: `w-full h-8 flex items-center gap-2 px-2 rounded-md border text-xs transition-colors ${showInspections ? "border-amber-400 bg-amber-50 text-amber-800" : "border-input bg-background text-foreground/60 hover:bg-muted/30"}`,
              children: [
                showInspections ? /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5 flex-shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "w-3.5 h-3.5 flex-shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Field inspections overlay" }),
                showInspections && inspectionsWithGeo.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto bg-amber-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold", children: inspectionsWithGeo.length })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-y-auto max-h-[calc(100vh-320px)]", children: [
          filteredPinned.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 text-center text-xs text-foreground/40", children: "No matching locations" }),
          filteredPinned.map((loc) => {
            const t = typeMap[loc.locationType];
            t?.icon ?? MapPin;
            const isSelected = selectedId === loc.id;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                className: `w-full text-left px-3 py-2.5 flex items-start gap-3 border-b last:border-b-0 transition-colors ${isSelected ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-muted/30"}`,
                onClick: () => {
                  setSelectedId(loc.id);
                  panTo(loc.id);
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "w-2 h-2 rounded-full flex-shrink-0 mt-1.5",
                      style: { backgroundColor: t?.markerColour ?? "#9ca3af" }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground truncate", children: loc.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/50 truncate", children: t?.label ?? loc.locationType }),
                    loc.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/40 truncate", children: loc.description })
                  ] })
                ]
              },
              loc.id
            );
          }),
          unpinned.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-2 bg-muted/20 border-t", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/50 font-medium mb-1.5", children: "Not yet pinned" }),
            unpinned.filter((l) => !filterType || l.locationType === filterType).map((loc) => {
              typeMap[loc.locationType];
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-1 flex items-center gap-2 text-xs text-foreground/40", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-3 h-3 flex-shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: loc.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] py-0 ml-auto flex-shrink-0", children: "No pin" })
              ] }, loc.id);
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { href: "/farm-locations", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-primary hover:underline cursor-pointer mt-1 block", children: "Add pins →" }) })
          ] }),
          showInspections && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-2 bg-amber-50/50 border-t border-amber-100", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-semibold text-amber-800 mb-1.5", children: "Field Inspection Markers" }),
            [
              { key: "urgent", label: "Urgent action" },
              { key: "treat", label: "Treatment needed" },
              { key: "monitor", label: "Monitor" },
              { key: "none", label: "No action" }
            ].map(({ key, label }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-[10px] text-foreground/60 mb-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full flex-shrink-0", style: { backgroundColor: INSPECTION_COLOURS[key] } }),
              label
            ] }, key)),
            inspectionsWithGeo.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-foreground/40 mt-1", children: "No geo-tagged inspections found." })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "overflow-hidden p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          ref: containerRef,
          style: { height: "calc(100vh - 220px)", minHeight: 400 }
        }
      ) })
    ] })
  ] }) });
}
export {
  FarmMapPage as default
};
