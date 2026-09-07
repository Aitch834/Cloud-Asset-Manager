/**
 * Verifies that the action bar stays safe while the server checks whether
 * the configured brand assets can be resolved.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import AdPdfGenerator from "./AdPdfGenerator";

vi.mock("@/lib/auth", () => ({ getSecret: () => "test-secret" }));

const TEMPLATE = {
  id: 1,
  name: "Test Template",
  slug: "test-template",
  widthMm: 190,
  heightMm: 133,
  htmlBody: "{{font_css}}{{logo}}{{bg}}{{qr}}<h1>hello</h1>",
  isDefault: true,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  archivedAt: null,
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

function makeFetch(
  statusResponse: Promise<Response>,
) {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : (input as Request).url;

    if (url.includes("ad-brand-assets/status")) return statusResponse;
    if (url.includes("ad-templates")) return jsonResponse([TEMPLATE]);
    if (url.includes("platform-config")) return jsonResponse({ items: [] });
    if (url.includes("ad-copy-presets")) return jsonResponse([]);

    throw new Error(`Unmocked fetch: ${url}`);
  });
}

function makeSequentialStatusFetch(statusResponses: Response[]) {
  let statusCall = 0;
  return vi.fn(async (input: RequestInfo | URL) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : (input as Request).url;

    if (url.includes("ad-brand-assets/status")) {
      const response = statusResponses[statusCall++];
      if (!response) throw new Error("Unexpected brand-asset status request");
      return response;
    }
    if (url.includes("ad-templates")) return jsonResponse([TEMPLATE]);
    if (url.includes("platform-config")) return jsonResponse({ items: [] });
    if (url.includes("ad-copy-presets")) return jsonResponse([]);

    throw new Error(`Unmocked fetch: ${url}`);
  });
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AdPdfGenerator />
    </QueryClientProvider>,
  );
}

describe("AdPdfGenerator — brand asset status loading", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the skeleton and disables both actions until the status response resolves", async () => {
    const status = deferred<Response>();
    vi.stubGlobal("fetch", makeFetch(status.promise));
    renderPage();

    // The template query is allowed to finish so the only remaining reason for
    // the action lockout is the unresolved brand-asset status request.
    await screen.findByRole("option", { name: /Test Template/i });

    expect(screen.getByTestId("brand-asset-status-skeleton")).toBeDefined();

    const previewButton = screen.getByRole("button", { name: /^Preview$/i });
    const generateButton = screen.getByRole("button", {
      name: /Generate & Download CMYK PDF/i,
    });
    expect((previewButton as HTMLButtonElement).disabled).toBe(true);
    expect((generateButton as HTMLButtonElement).disabled).toBe(true);

    status.resolve(
      jsonResponse({ logoResolvable: true, qrResolvable: true }),
    );

    await waitFor(() => {
      expect(screen.queryByTestId("brand-asset-status-skeleton")).toBeNull();
      expect((previewButton as HTMLButtonElement).disabled).toBe(false);
      expect((generateButton as HTMLButtonElement).disabled).toBe(false);
    });
  });

  it("shows a retryable error and restores both actions after a successful retry", async () => {
    vi.stubGlobal(
      "fetch",
      makeSequentialStatusFetch([
        jsonResponse({ error: "temporary failure" }, 503),
        jsonResponse({ logoResolvable: true, qrResolvable: true }),
      ]),
    );
    renderPage();

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("Brand-asset check failed.");
    expect(alert.textContent).toContain("unavailable until the check succeeds");

    const previewButton = screen.getByRole("button", { name: /^Preview$/i });
    const generateButton = screen.getByRole("button", {
      name: /Generate & Download CMYK PDF/i,
    });
    expect((previewButton as HTMLButtonElement).disabled).toBe(true);
    expect((generateButton as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: /Retry check/i }));

    await waitFor(() => {
      expect(screen.queryByRole("alert")).toBeNull();
      expect((previewButton as HTMLButtonElement).disabled).toBe(false);
      expect((generateButton as HTMLButtonElement).disabled).toBe(false);
    });
  });
});