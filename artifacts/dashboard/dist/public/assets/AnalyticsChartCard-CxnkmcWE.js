import { r as reactExports, j as jsxRuntimeExports } from "./index-BEkyPlmL.js";
const PRINT_STYLE_ID = "analytics-chart-card-print-css";
function ensurePrintStyle() {
  if (document.getElementById(PRINT_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = PRINT_STYLE_ID;
  style.textContent = `
    @media print {
      .analytics-chart-cap {
        page-break-inside: avoid;
        break-inside: avoid;
        break-before: avoid;
      }
      .analytics-chart-cap .recharts-responsive-container {
        width: 100% !important;
        max-height: 300px !important;
      }
      .analytics-chart-cap .recharts-wrapper {
        max-height: 300px !important;
      }
      .analytics-chart-cap .recharts-wrapper svg {
        max-height: 300px !important;
      }
    }
  `;
  document.head.appendChild(style);
}
function AnalyticsChartCard({ title, subtitle, children }) {
  reactExports.useEffect(() => {
    ensurePrintStyle();
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "analytics-chart-cap rounded-xl border border-border bg-card overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 border-b border-border bg-muted/30", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: title }),
      subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/40", children: subtitle })
    ] }),
    children
  ] });
}
export {
  AnalyticsChartCard as A
};
