import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Router } from "wouter";

const useQueryMock = vi.hoisted(() => vi.fn());

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

import { UpcomingDatesPanel } from "./UpcomingDatesPanel";

const FARM_ID = 42;
const useTestLocation = (): [string, (path: string) => void] => ["/", () => undefined];

interface QueryOptions {
  queryKey: unknown[];
  queryFn: () => Promise<unknown>;
  enabled?: boolean;
}

function inspectionQuery(): QueryOptions {
  const call = useQueryMock.mock.calls.find(
    ([options]) => options.queryKey[0] === "organic-inspections-alert",
  );
  expect(call).toBeDefined();
  return call![0] as QueryOptions;
}

function renderPanel(activeSubs: string[], records: unknown[] = []) {
  useQueryMock.mockImplementation((options: QueryOptions) => {
    if (options.queryKey[0] === "organic-inspections-alert") {
      return { data: { records } };
    }
    return { data: [] };
  });

  return renderToStaticMarkup(
    <Router hook={useTestLocation}>
      <UpcomingDatesPanel farmId={FARM_ID} activeSubs={activeSubs} />
    </Router>,
  );
}

describe("Upcoming Key Dates organic inspections", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-10T12:00:00Z"));
    vi.stubGlobal("React", React);
    useQueryMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("requests active-farm inspections and links a due date within 60 days to the register", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ records: [] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const html = renderPanel(["organic-compliance"], [
      {
        certifier: "Organic Farmers & Growers",
        inspectionDate: "2026-08-20",
        nextDueDate: "2026-10-15",
      },
    ]);

    const query = inspectionQuery();
    expect(query.enabled).toBe(true);
    await query.queryFn();
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/farms/${FARM_ID}/organic/inspections`,
      { credentials: "include" },
    );
    expect(html).toContain("Organic inspection due — Organic Farmers &amp; Growers");
    expect(html).toContain('href="/organic?tab=inspections"');
  });

  it("does not request inspections when organic compliance is inactive", () => {
    renderPanel([]);

    expect(inspectionQuery().enabled).toBe(false);
  });

  it("excludes inspection dates beyond the next 60 days", () => {
    const html = renderPanel(["organic-compliance"], [
      {
        certifier: "Soil Association",
        inspectionDate: "2026-08-20",
        nextDueDate: "2026-11-10",
      },
    ]);

    expect(html).not.toContain("Organic inspection due — Soil Association");
    expect(html).not.toContain('href="/organic?tab=inspections"');
    expect(html).toContain("No upcoming deadlines in the next 60 days.");
  });
});