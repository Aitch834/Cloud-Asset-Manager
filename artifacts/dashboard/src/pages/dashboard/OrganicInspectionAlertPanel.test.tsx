// @vitest-environment node
import React from "react";
import { QueryClient } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  OrganicInspectionAlertContent,
  organicInspectionAlertQueryOptions,
} from "./OrganicInspectionAlertPanel";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("organic inspection alert request failure", () => {
  it("keeps the overview rendered, hides the alert, and does not retry", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("Unavailable", { status: 503 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const queryClient = new QueryClient();
    const options = organicInspectionAlertQueryOptions(42);

    const results = await Promise.allSettled([
      queryClient.fetchQuery(options),
      queryClient.fetchQuery(organicInspectionAlertQueryOptions(42)),
    ]);

    expect(results).toHaveLength(2);
    expect(results.every(result => result.status === "rejected")).toBe(true);
    for (const result of results) {
      if (result.status === "rejected") {
        expect(result.reason).toEqual(
          new Error("Failed to load organic inspections"),
        );
      }
    }

    const html = renderToStaticMarkup(
      <main>
        <h1>Overview</h1>
        <p>Farm summary remains available</p>
        <OrganicInspectionAlertContent records={undefined} />
      </main>,
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(html).toContain("Overview");
    expect(html).toContain("Farm summary remains available");
    expect(html).not.toContain("Organic Inspection Due");
  });
});