import { CalendarDays } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface YearCompareSelectorProps {
  availableYears: number[];
  selectedYear: number;
  onYearChange: (y: number) => void;
  compareYear: number | null;
  onCompareYearChange: (y: number | null) => void;
  className?: string;
}

/**
 * Reusable year picker + optional comparison year picker for analytics tabs.
 * Renders a compact inline control: [2024 ▾] vs [No comparison ▾]
 * When a comparison year is chosen, the parent component can render
 * two-bar charts and side-by-side KPI values.
 */
export function YearCompareSelector({
  availableYears,
  selectedYear,
  onYearChange,
  compareYear,
  onCompareYearChange,
  className,
}: YearCompareSelectorProps) {
  if (availableYears.length === 0) return null;

  const compareOptions = availableYears.filter((y) => y !== selectedYear);

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className ?? ""}`}>
      <CalendarDays className="w-4 h-4 text-muted-foreground shrink-0" />
      <Select
        value={String(selectedYear)}
        onValueChange={(v) => onYearChange(Number(v))}
      >
        <SelectTrigger className="h-8 w-[6.5rem] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {availableYears.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {compareOptions.length > 0 && (
        <>
          <span className="text-xs text-muted-foreground">vs.</span>
          <Select
            value={compareYear !== null ? String(compareYear) : "__none__"}
            onValueChange={(v) =>
              onCompareYearChange(v === "__none__" ? null : Number(v))
            }
          >
            <SelectTrigger className="h-8 w-[8.5rem] text-xs">
              <SelectValue placeholder="No comparison" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">No comparison</SelectItem>
              {compareOptions.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}
    </div>
  );
}

/** Colour palette: primary year gets index 0, compare year gets index 1 */
export const COMPARE_COLORS = ["#15803d", "#f97316"] as const;
