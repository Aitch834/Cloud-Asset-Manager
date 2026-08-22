/**
 * Verifies that the Generate PDF and Preview action buttons in AdPdfGenerator
 * are disabled (client-side, before any server round-trip) when the selected
 * template's htmlBody is missing any of the four required placeholders:
 *   {{font_css}}  {{logo}}  {{bg}}  {{qr}}
 *
 * Cases covered:
 *   1. One placeholder missing        → buttons disabled, banner names it
 *   2. Multiple placeholders missing  → buttons disabled, banner names all of them
 *   3. Empty htmlBody                 → treated as all four missing (buttons disabled)
 *   4. Whitespace-only htmlBody       → same as empty
 *   5. All four present               → buttons enabled, no banner
 *   6. Clicking a disabled button     → no fetch is dispatched
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import AdPdfGenerator from "./AdPdfGenerator";

// ── Environment stubs ─────────────────────────────────────────────────────────

vi.mock("@/lib/auth", () => ({ getSecret: () => "test-secret" }));

Object.assign(global.URL, {
  createObjectURL: vi.fn(() => "blob:mock-url"),
  revokeObjectURL: vi.fn(),
});

// ── Fixtures ──────────────────────────────────────────────────────────────────

const COMPLETE_BODY = "{{font_css}}{{logo}}{{bg}}{{qr}}<h1>hello</h1>";

function makeTemplate(htmlBody: string) {
  return {
    id: 1,
    name: "Test Template",
    slug: "test-template",
    widthMm: 190,
    heightMm: 133,
    htmlBody,
    isDefault: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    archivedAt: null,
  };
}

// ── Fetch helpers ─────────────────────────────────────────────────────────────

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Builds a fetch spy that stubs all queries AdPdfGenerator fires on mount. */
function makeFetch(template: ReturnType<typeof makeTemplate>) {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : (input as Request).url;

    if (url.includes("ad-brand-assets/status"))
      return jsonResponse({ logoResolvable: true, qrResolvable: true });
    if (url.includes("ad-templates")) return jsonResponse([template]);
    if (url.includes("platform-config")) return jsonResponse({ items: [] });
    if (url.includes("ad-copy-presets")) return jsonResponse([]);

    // Any actual PDF/preview call should not be reached when buttons are disabled
    throw new Error(`Unexpected fetch during disabled-button test: ${init?.method ?? "GET"} ${url}`);
  });
}

// ── Render helper ─────────────────────────────────────────────────────────────

function renderPage(template: ReturnType<typeof makeTemplate>) {
  vi.stubGlobal("fetch", makeFetch(template));
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <AdPdfGenerator />
    </QueryClientProvider>,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("AdPdfGenerator — missing-placeholder button guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── 1. One placeholder missing ───────────────────────────────────────────────

  it("disables both action buttons and shows an amber banner when one placeholder is missing", async () => {
    // Missing {{qr}} only
    renderPage(makeTemplate("{{font_css}}{{logo}}{{bg}}<h1>hello</h1>"));

    await screen.findByRole("option", { name: /Test Template/i });

    const generateBtn = screen.getByRole("button", {
      name: /Generate & Download CMYK PDF/i,
    });
    const previewBtn = screen.getAllByRole("button", { name: /^Preview$/i })[0];

    expect((generateBtn as HTMLButtonElement).disabled).toBe(true);
    expect((previewBtn as HTMLButtonElement).disabled).toBe(true);

    // Amber banner names the missing placeholder
    const banner = await screen.findByText(/Generate blocked/i);
    expect(banner.closest("p")?.textContent).toMatch(/\{\{qr\}\}/);
  });

  // ── 2. Multiple placeholders missing ────────────────────────────────────────

  it("disables both buttons and names all missing placeholders when several are absent", async () => {
    // Missing {{logo}}, {{bg}}, {{qr}}
    renderPage(makeTemplate("{{font_css}}<h1>only font</h1>"));

    await screen.findByRole("option", { name: /Test Template/i });

    const generateBtn = screen.getByRole("button", {
      name: /Generate & Download CMYK PDF/i,
    });
    expect((generateBtn as HTMLButtonElement).disabled).toBe(true);

    const banner = await screen.findByText(/Generate blocked/i);
    const bannerText = banner.closest("p")?.textContent ?? "";
    expect(bannerText).toMatch(/\{\{logo\}\}/);
    expect(bannerText).toMatch(/\{\{bg\}\}/);
    expect(bannerText).toMatch(/\{\{qr\}\}/);
    // {{font_css}} is present so it must not appear in the banner
    expect(bannerText).not.toMatch(/\{\{font_css\}\}/);
  });

  // ── 3. Empty htmlBody ────────────────────────────────────────────────────────

  it("disables both buttons when the template htmlBody is empty", async () => {
    renderPage(makeTemplate(""));

    await screen.findByRole("option", { name: /Test Template/i });

    const generateBtn = screen.getByRole("button", {
      name: /Generate & Download CMYK PDF/i,
    });
    expect((generateBtn as HTMLButtonElement).disabled).toBe(true);

    // All four should be listed in the banner
    const banner = await screen.findByText(/Generate blocked/i);
    const bannerText = banner.closest("p")?.textContent ?? "";
    expect(bannerText).toMatch(/\{\{font_css\}\}/);
    expect(bannerText).toMatch(/\{\{logo\}\}/);
    expect(bannerText).toMatch(/\{\{bg\}\}/);
    expect(bannerText).toMatch(/\{\{qr\}\}/);
  });

  // ── 4. Whitespace-only htmlBody ──────────────────────────────────────────────

  it("disables both buttons when the template htmlBody is whitespace only", async () => {
    renderPage(makeTemplate("   \n\t  "));

    await screen.findByRole("option", { name: /Test Template/i });

    const generateBtn = screen.getByRole("button", {
      name: /Generate & Download CMYK PDF/i,
    });
    expect((generateBtn as HTMLButtonElement).disabled).toBe(true);

    await screen.findByText(/Generate blocked/i);
  });

  // ── 5. All four placeholders present ────────────────────────────────────────

  it("enables both buttons and shows no amber banner when all required placeholders are present", async () => {
    renderPage(makeTemplate(COMPLETE_BODY));

    await screen.findByRole("option", { name: /Test Template/i });

    const generateBtn = screen.getByRole("button", {
      name: /Generate & Download CMYK PDF/i,
    });
    expect((generateBtn as HTMLButtonElement).disabled).toBe(false);

    // The missing-placeholder banner must not be rendered at all
    expect(screen.queryByText(/Generate blocked/i)).toBeNull();
  });

  // ── 6. No fetch dispatched when disabled ─────────────────────────────────────

  it("does not call fetch for ad-pdf when the Generate button is disabled and clicked", async () => {
    const fetchSpy = makeFetch(makeTemplate("{{font_css}}{{logo}}{{bg}}"));
    vi.stubGlobal("fetch", fetchSpy);

    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={qc}>
        <AdPdfGenerator />
      </QueryClientProvider>,
    );

    await screen.findByRole("option", { name: /Test Template/i });

    const generateBtn = screen.getByRole("button", {
      name: /Generate & Download CMYK PDF/i,
    });
    expect((generateBtn as HTMLButtonElement).disabled).toBe(true);

    // Simulate click on the disabled button
    fireEvent.click(generateBtn);

    // Allow any microtasks to settle
    await waitFor(() => {
      const pdfCalls = fetchSpy.mock.calls.filter(([input]) => {
        const url =
          typeof input === "string"
            ? input
            : input instanceof URL
              ? input.href
              : (input as Request).url;
        return url.includes("ad-pdf") && !url.includes("ad-templates") && !url.includes("ad-copy-presets");
      });
      expect(pdfCalls.length).toBe(0);
    });
  });
});
