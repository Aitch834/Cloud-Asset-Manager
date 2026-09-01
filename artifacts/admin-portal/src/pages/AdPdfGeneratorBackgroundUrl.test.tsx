/**
 * Verifies the background-image URL probe used by AdPdfGenerator.
 *
 * The browser cannot reliably inspect cross-origin CDN images because of CORS,
 * so the page delegates the check to /api/admin/check-bg-url.  Keep this test
 * focused on the user-visible state transition: a bad response shows the
 * amber warning and a later good response clears it.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

const BAD_URL = "https://cdn.example.test/broken-background.jpg";
const GOOD_URL = "https://cdn.example.test/cors-blocked-background.jpg";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function makeFetch() {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : (input as Request).url;

    if (url.includes("check-bg-url")) {
      const requestedUrl = new URL(url, "http://admin.test").searchParams.get("url");
      return requestedUrl === GOOD_URL
        ? jsonResponse({ ok: true, contentType: "image/jpeg" })
        : jsonResponse({ ok: false, contentType: "text/html" });
    }
    if (url.includes("ad-brand-assets/status")) {
      return jsonResponse({ logoResolvable: true, qrResolvable: true });
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

describe("AdPdfGenerator — background URL warning", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the amber warning for an unreachable CDN image and clears it for a good image", async () => {
    const fetchSpy = makeFetch();
    vi.stubGlobal("fetch", fetchSpy);
    renderPage();

    await screen.findByRole("option", { name: /Test Template/i });
    const input = screen.getByLabelText(/Background image URL/i);

    fireEvent.change(input, { target: { value: BAD_URL } });
    fireEvent.blur(input);

    const warning = await screen.findByText(
      /This URL doesn't appear to serve a loadable image/i,
    );
    expect(warning).toBeTruthy();

    fireEvent.change(input, { target: { value: GOOD_URL } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(
        screen.queryByText(/This URL doesn't appear to serve a loadable image/i),
      ).toBeNull();
    });

    const probeRequests = fetchSpy.mock.calls
      .map(([input]) =>
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : (input as Request).url,
      )
      .filter((url) => url.includes("check-bg-url"));
    expect(probeRequests).toHaveLength(2);
    expect(new URL(probeRequests[0], "http://admin.test").searchParams.get("url")).toBe(
      BAD_URL,
    );
    expect(new URL(probeRequests[1], "http://admin.test").searchParams.get("url")).toBe(
      GOOD_URL,
    );
  });
});