import { useEffect } from "react";

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

interface AnalyticsChartCardProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Shared card shell for analytics charts.
 *
 * The print-height cap is registered when the first chart card mounts, so
 * every analytics tab gets the same print-safe behaviour without its own
 * stylesheet setup.
 */
export function AnalyticsChartCard({ title, subtitle, children }: AnalyticsChartCardProps) {
  useEffect(() => {
    ensurePrintStyle();
  }, []);

  return (
    <div className="analytics-chart-cap rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <h3 className="text-sm font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-foreground/40">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}