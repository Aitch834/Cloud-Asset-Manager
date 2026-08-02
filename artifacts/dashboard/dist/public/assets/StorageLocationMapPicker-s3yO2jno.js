const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/leaflet-src-BuKiI4ED.js","assets/index-CG7Bde15.js","assets/index-CNUbH-zj.css"])))=>i.map(i=>d[i]);
import { q as createLucideIcon, r as reactExports, _ as __vitePreload, j as jsxRuntimeExports, M as MapPin, c as Button } from "./index-CG7Bde15.js";
import { T as Trash2 } from "./trash-2-VByqLcbQ.js";
const __iconNode = [
  ["line", { x1: "2", x2: "5", y1: "12", y2: "12", key: "bvdh0s" }],
  ["line", { x1: "19", x2: "22", y1: "12", y2: "12", key: "1tbv5k" }],
  ["line", { x1: "12", x2: "12", y1: "2", y2: "5", key: "11lu5j" }],
  ["line", { x1: "12", x2: "12", y1: "19", y2: "22", key: "x3vr5v" }],
  ["circle", { cx: "12", cy: "12", r: "7", key: "fim9np" }],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
];
const LocateFixed = createLucideIcon("locate-fixed", __iconNode);
function StorageLocationMapPicker({ value, onChange, mapHeight = 280 }) {
  const containerRef = reactExports.useRef(null);
  const leafletRef = reactExports.useRef(null);
  const [ready, setReady] = reactExports.useState(false);
  const [locating, setLocating] = reactExports.useState(false);
  const onChangeRef = reactExports.useRef(onChange);
  onChangeRef.current = onChange;
  reactExports.useEffect(() => {
    __vitePreload(() => import("./leaflet-src-BuKiI4ED.js").then((n) => n.l), true ? __vite__mapDeps([0,1,2]) : void 0).then((L) => {
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
        } catch {
        }
        leafletRef.current = null;
      }
    };
  }, []);
  reactExports.useEffect(() => {
    if (!ready || !containerRef.current || leafletRef.current) return;
    const L = window._L;
    const defaultCenter = value ? [value.lat, value.lng] : [52.8, -1.5];
    const defaultZoom = value ? 16 : 6;
    const map = L.map(containerRef.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      zoomControl: true,
      scrollWheelZoom: true
    });
    map.scrollWheelZoom.enable();
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 20
    }).addTo(map);
    const markerIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    let marker = null;
    if (value) {
      marker = L.marker([value.lat, value.lng], { draggable: true, icon: markerIcon }).addTo(map);
      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        onChangeRef.current({ lat: pos.lat, lng: pos.lng });
      });
    }
    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      if (marker) {
        marker.setLatLng([lat, lng]);
      } else {
        marker = L.marker([lat, lng], { draggable: true, icon: markerIcon }).addTo(map);
        marker.on("dragend", () => {
          const pos = marker.getLatLng();
          onChangeRef.current({ lat: pos.lat, lng: pos.lng });
        });
        leafletRef.current.marker = marker;
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
        const L = window._L;
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
            shadowSize: [41, 41]
          });
          ctx.marker = L.marker([lat, lng], { draggable: true, icon: markerIcon }).addTo(ctx.map);
          ctx.marker.on("dragend", () => {
            const p = ctx.marker.getLatLng();
            onChangeRef.current({ lat: p.lat, lng: p.lng });
          });
        }
        onChangeRef.current({ lat, lng });
      },
      () => {
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 1e4 }
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Click the map to pin the location, or drag the marker to adjust" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            type: "button",
            variant: "outline",
            size: "sm",
            onClick: handleLocate,
            disabled: locating,
            className: "gap-1.5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LocateFixed, { className: "h-3.5 w-3.5" }),
              locating ? "Locating…" : "Use my location"
            ]
          }
        ),
        value && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            type: "button",
            variant: "ghost",
            size: "sm",
            onClick: handleClear,
            className: "gap-1.5 text-destructive hover:text-destructive",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }),
              "Clear"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        ref: containerRef,
        style: { height: mapHeight, borderRadius: 8, border: "1px solid hsl(var(--border))", overflow: "hidden" }
      }
    ),
    value ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground font-mono", children: [
      "📍 ",
      value.lat.toFixed(6),
      ", ",
      value.lng.toFixed(6)
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "No location pinned yet" })
  ] });
}
export {
  StorageLocationMapPicker as S
};
