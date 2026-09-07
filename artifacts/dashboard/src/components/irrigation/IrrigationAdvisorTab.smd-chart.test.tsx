import React, { isValidElement, type ReactElement, type ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { ReferenceLine } from "recharts";
import {
  SmdHistoryChart,
  type SmdChartPoint,
} from "./IrrigationAdvisorTab";

interface TodayMarkerProps {
  x?: string | number;
  label?: { value?: string };
}

function makeHistory(length: number, today = "09-07"): SmdChartPoint[] {
  return Array.from({ length }, (_, index) => ({
    date: index === length - 1 ? today : `08-${String(index + 1).padStart(2, "0")}`,
    smd: index + 1,
    rain: 0,
    etC: 2,
    smdProjected: index === length - 1 ? index + 1 : null,
  }));
}

function withProjection(history: SmdChartPoint[]): SmdChartPoint[] {
  return [
    ...history,
    ...Array.from({ length: 7 }, (_, index) => ({
      date: `09-${String(index + 8).padStart(2, "0")}`,
      smd: null,
      rain: null,
      etC: null,
      smdProjected: history.at(-1)!.smd! + index + 1,
    })),
  ];
}

function findTodayMarker(node: ReactNode): ReactElement<TodayMarkerProps> | null {
  if (!isValidElement(node)) return null;
  if (
    node.type === ReferenceLine
    && (node.props as TodayMarkerProps).label?.value === "Today"
  ) {
    return node as ReactElement<TodayMarkerProps>;
  }

  const children = (node.props as { children?: ReactNode }).children;
  for (const child of React.Children.toArray(children)) {
    const marker = findTodayMarker(child);
    if (marker) return marker;
  }
  return null;
}

describe("SMD history and projection boundary marker", () => {
  it("renders Today at the current-date category with a full 30-day history", () => {
    const today = "09-07";
    const history = makeHistory(30, today);
    const chart = SmdHistoryChart({
      chartData: withProjection(history),
      todayChartDate: today,
      criticalThreshold: 40,
    });

    expect(history).toHaveLength(30);
    expect(findTodayMarker(chart)?.props.x).toBe(today);
  });

  it("keeps Today date-anchored when the historical series is shorter", () => {
    const today = "09-07";
    const history = makeHistory(8, today);
    const chart = SmdHistoryChart({
      chartData: withProjection(history),
      todayChartDate: today,
      criticalThreshold: 40,
    });

    expect(history).toHaveLength(8);
    const marker = findTodayMarker(chart);
    expect(marker?.props.x).toBe(today);
    expect(marker?.props.x).not.toBe(29);
    expect(marker?.props.label?.value).toBe("Today");
  });
});