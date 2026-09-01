/**
 * Verifies that a 422 { missingAssets } response from any of the three PDF
 * action paths renders the inline missing-assets error banner and keeps the
 * page / form open.
 *
 * Three paths under test:
 *   1. Generate PDF   — POST /api/admin/ad-pdf
 *   2. Preview        — GET  /api/admin/ad-pdf/preview
 *   3. Draft Preview  — POST /api/admin/ad-pdf/preview-draft  (inside TemplateForm)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import AdPdfGenerator, { TemplateForm } from "./AdPdfGenerator";

// ── Environment stubs ─────────────────────────────────────────────────────────

vi.mock("@/lib/auth", () => ({ getSecret: () => "test-secret" }));

// jsdom doesn't implement these browser APIs
Object.assign(global.URL, {
  createObjectURL: vi.fn(() => "blob:mock-url"),
  revokeObjectURL: vi.fn(),
});

// ── Fixtures ──────────────────────────────────────────────────────────────────

/** A minimal template that satisfies all four required placeholder checks. */
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

// ── Fetch helpers ─────────────────────────────────────────────────────────────

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function missing422(assets: string[]): Response {
  return jsonResponse(
    { error: "Cannot generate: missing brand assets", missingAssets: assets },
    422,
  );
}

function missingPlaceholders422(placeholders: string[]): Response {
  return jsonResponse(
    {
      error: "Cannot generate: missing required placeholders",
      missingPlaceholders: placeholders,
    },
    422,
  );
}

function successfulPdfResponse(): Response {
  return new Response(new Blob(["pdf"], { type: "application/pdf" }), {
    status: 200,
    headers: { "Content-Type": "application/pdf" },
  });
}

function successfulPreviewResponse(): Response {
  return new Response(new Blob(["png"], { type: "image/png" }), {
    status: 200,
    headers: { "Content-Type": "image/png" },
  });
}

/**
 * Builds a fetch spy with method-aware overrides applied before the default
 * stubs.  Each override fires when both the URL substring and (optional) HTTP
 * method match.
 */
function makeFetch(
  overrides: Array<{
    urlIncludes: string;
    method?: string;
    response: () => Response;
  }> = [],
) {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : (input as Request).url;
    const method = (init?.method ?? "GET").toUpperCase();

    for (const ov of overrides) {
      const methodMatch = !ov.method || ov.method.toUpperCase() === method;
      if (url.includes(ov.urlIncludes) && methodMatch) {
        return ov.response();
      }
    }

    // Default stubs for the queries AdPdfGenerator fires on mount
    if (url.includes("ad-brand-assets/status"))
      return jsonResponse({ logoResolvable: true, qrResolvable: true });
    if (url.includes("ad-templates")) return jsonResponse([TEMPLATE]);
    if (url.includes("platform-config")) return jsonResponse({ items: [] });
    if (url.includes("ad-copy-presets")) return jsonResponse([]);

    throw new Error(`Unmocked fetch: ${method} ${url}`);
  });
}

// ── Render helper ─────────────────────────────────────────────────────────────

function renderWithQueryClient(ui: React.ReactElement) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>{ui}</QueryClientProvider>,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("AdPdfGenerator — missing-assets banner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Path 1: Generate PDF ────────────────────────────────────────────────────

  it("Generate PDF — shows banner when POST /ad-pdf returns 422 missingAssets", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetch([
        {
          urlIncludes: "ad-pdf",
          method: "POST",
          response: () => missing422(["logo"]),
        },
      ]),
    );

    renderWithQueryClient(<AdPdfGenerator />);

    // Wait for the template option to appear in the select — this confirms the
    // templates query has resolved and effectiveId is non-null, so the Generate
    // button is no longer disabled.
    await screen.findByRole("option", { name: /Test Template/i });

    const generateBtn = screen.getByRole("button", {
      name: /Generate & Download CMYK PDF/i,
    });

    fireEvent.click(generateBtn);

    // Banner: "Cannot generate PDF: logo is missing — upload it in Brand Assets ↓"
    await waitFor(() => {
      expect(screen.getByText(/Cannot generate PDF/i)).toBeDefined();
    });

    // The asset name appears in the banner
    const banner = screen.getByText(/Cannot generate PDF/i).closest("p");
    expect(banner?.textContent).toMatch(/logo/i);
    expect(banner?.textContent).toMatch(/missing/i);

    // Page is still open — the page heading is still in the DOM
    expect(screen.getByText("Ad PDF Generator")).toBeDefined();
  });

  it("Generate PDF — clears the missing-assets banner after a successful retry", async () => {
    let generateAttempts = 0;
    vi.stubGlobal(
      "fetch",
      makeFetch([
        {
          urlIncludes: "ad-pdf",
          method: "POST",
          response: () => {
            generateAttempts += 1;
            return generateAttempts === 1
              ? missing422(["logo"])
              : successfulPdfResponse();
          },
        },
      ]),
    );

    renderWithQueryClient(<AdPdfGenerator />);
    await screen.findByRole("option", { name: /Test Template/i });

    const generateBtn = screen.getByRole("button", {
      name: /Generate & Download CMYK PDF/i,
    });

    fireEvent.click(generateBtn);
    await screen.findByText(/Cannot generate PDF/i);

    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(screen.queryByText(/Cannot generate PDF/i)).toBeNull();
      expect(screen.getByText("PDF downloaded")).toBeDefined();
    });
    expect(generateAttempts).toBe(2);
  });

  // ── Path 2: Preview ─────────────────────────────────────────────────────────

  it("Preview — shows banner when GET /ad-pdf/preview returns 422 missingAssets", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetch([
        {
          // GET preview — no method override means method defaults to GET in fetchPreview
          urlIncludes: "ad-pdf/preview",
          method: "GET",
          response: () => missing422(["logo"]),
        },
      ]),
    );

    renderWithQueryClient(<AdPdfGenerator />);

    // Wait for the template option to appear so the Preview button is enabled
    await screen.findByRole("option", { name: /Test Template/i });

    const previewBtn = screen.getByRole("button", { name: /^Preview$/i });

    fireEvent.click(previewBtn);

    // Banner: "Cannot generate preview: logo is missing — upload it in Brand Assets ↓"
    await waitFor(() => {
      expect(screen.getByText(/Cannot generate preview/i)).toBeDefined();
    });

    const banner = screen.getByText(/Cannot generate preview/i).closest("p");
    expect(banner?.textContent).toMatch(/logo/i);
    expect(banner?.textContent).toMatch(/missing/i);

    // Page is still open
    expect(screen.getByText("Ad PDF Generator")).toBeDefined();
  });

  it("Preview — clears the missing-assets banner after a successful retry", async () => {
    let previewAttempts = 0;
    vi.stubGlobal(
      "fetch",
      makeFetch([
        {
          urlIncludes: "ad-pdf/preview",
          method: "GET",
          response: () => {
            previewAttempts += 1;
            return previewAttempts === 1
              ? missing422(["logo"])
              : successfulPreviewResponse();
          },
        },
      ]),
    );

    renderWithQueryClient(<AdPdfGenerator />);
    await screen.findByRole("option", { name: /Test Template/i });

    const previewBtn = screen.getByRole("button", { name: /^Preview$/i });

    fireEvent.click(previewBtn);
    await screen.findByText(/Cannot generate preview/i);

    fireEvent.click(previewBtn);

    await waitFor(() => {
      expect(screen.queryByText(/Cannot generate preview/i)).toBeNull();
      expect(screen.getByRole("img", { name: "Ad preview" })).toBeDefined();
    });
    expect(previewAttempts).toBe(2);
  });

  // ── Path 3: Draft Preview (inside TemplateForm) ────────────────────────────

  it("Draft Preview — shows banner when POST /ad-pdf/preview-draft returns 422 missingAssets", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetch([
        {
          urlIncludes: "ad-pdf/preview-draft",
          method: "POST",
          response: () => missing422(["logo"]),
        },
      ]),
    );

    // Render TemplateForm directly — the draft preview button lives inside it.
    // Passing `initial` with all four required placeholders enables the Preview button
    // immediately (missingPlaceholders will be empty).
    render(
      <TemplateForm
        initial={TEMPLATE}
        onSave={vi.fn()}
        onCancel={vi.fn()}
        isSaving={false}
      />,
    );

    // The inline Preview button next to the HTML body textarea
    const previewBtn = screen.getByRole("button", { name: /^Preview$/i });
    expect((previewBtn as HTMLButtonElement).disabled).toBe(false);

    fireEvent.click(previewBtn);

    // Banner: "Cannot generate preview: logo is missing — upload it in Platform Config"
    await waitFor(() => {
      expect(screen.getByText(/Cannot generate preview/i)).toBeDefined();
    });

    const banner = screen.getByText(/Cannot generate preview/i).closest("p");
    expect(banner?.textContent).toMatch(/logo/i);
    expect(banner?.textContent).toMatch(/missing/i);
    // Draft preview points to Platform Config (not Brand Assets)
    expect(banner?.textContent).toMatch(/Platform Config/i);

    // The form is still open — the Save button is still rendered
    expect(screen.getByRole("button", { name: /Save template/i })).toBeDefined();
  });

  it("Draft Preview — clears the missing-assets banner after a successful retry", async () => {
    let previewAttempts = 0;
    vi.stubGlobal(
      "fetch",
      makeFetch([
        {
          urlIncludes: "ad-pdf/preview-draft",
          method: "POST",
          response: () => {
            previewAttempts += 1;
            return previewAttempts === 1
              ? missing422(["logo"])
              : successfulPreviewResponse();
          },
        },
      ]),
    );

    render(
      <TemplateForm
        initial={TEMPLATE}
        onSave={vi.fn()}
        onCancel={vi.fn()}
        isSaving={false}
      />,
    );

    const previewBtn = screen.getByRole("button", { name: /^Preview$/i });
    expect((previewBtn as HTMLButtonElement).disabled).toBe(false);

    fireEvent.click(previewBtn);
    await screen.findByText(/Cannot generate preview/i);

    fireEvent.click(previewBtn);

    await waitFor(() => {
      expect(screen.queryByText(/Cannot generate preview/i)).toBeNull();
      expect(
        screen.getByRole("img", { name: "Draft template preview" }),
      ).toBeDefined();
    });
    expect(previewAttempts).toBe(2);
  });
});

describe("AdPdfGenerator — missing-placeholder response banner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("Generate PDF — shows the missing-placeholder banner when POST /ad-pdf returns 422 missingPlaceholders", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetch([
        {
          urlIncludes: "ad-pdf",
          method: "POST",
          response: () => missingPlaceholders422(["{{logo}}"]),
        },
      ]),
    );

    renderWithQueryClient(<AdPdfGenerator />);

    await screen.findByRole("option", { name: /Test Template/i });
    fireEvent.click(
      screen.getByRole("button", {
        name: /Generate & Download CMYK PDF/i,
      }),
    );

    await waitFor(() => {
      expect(screen.getByText(/Cannot generate PDF/i)).toBeDefined();
    });

    const banner = screen.getByText(/Cannot generate PDF/i).closest("p");
    expect(banner?.textContent).toMatch(
      /the selected template is missing required placeholder/i,
    );
    expect(banner?.textContent).toMatch(/\{\{logo\}\}/);
    expect(screen.getByText("Ad PDF Generator")).toBeDefined();
  });

  it("Preview — shows the missing-placeholder banner when GET /ad-pdf/preview returns 422 missingPlaceholders", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetch([
        {
          urlIncludes: "ad-pdf/preview",
          method: "GET",
          response: () => missingPlaceholders422(["{{logo}}"]),
        },
      ]),
    );

    renderWithQueryClient(<AdPdfGenerator />);

    await screen.findByRole("option", { name: /Test Template/i });
    fireEvent.click(screen.getByRole("button", { name: /^Preview$/i }));

    await waitFor(() => {
      expect(screen.getByText(/Cannot generate preview/i)).toBeDefined();
    });

    const banner = screen.getByText(/Cannot generate preview/i).closest("p");
    expect(banner?.textContent).toMatch(
      /the selected template is missing required placeholder/i,
    );
    expect(banner?.textContent).toMatch(/\{\{logo\}\}/);
    expect(screen.getByText("Ad PDF Generator")).toBeDefined();
  });

  it("Draft Preview — shows the missing-placeholder banner when POST /ad-pdf/preview-draft returns 422 missingPlaceholders", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetch([
        {
          urlIncludes: "ad-pdf/preview-draft",
          method: "POST",
          response: () => missingPlaceholders422(["{{logo}}"]),
        },
      ]),
    );

    render(
      <TemplateForm
        initial={TEMPLATE}
        onSave={vi.fn()}
        onCancel={vi.fn()}
        isSaving={false}
      />,
    );

    const previewBtn = screen.getByRole("button", { name: /^Preview$/i });
    expect((previewBtn as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(previewBtn);

    await waitFor(() => {
      expect(screen.getByText(/Cannot generate preview/i)).toBeDefined();
    });

    const banner = screen.getByText(/Cannot generate preview/i).closest("p");
    expect(banner?.textContent).toMatch(
      /the following required placeholder is missing from the template/i,
    );
    expect(banner?.textContent).toMatch(/\{\{logo\}\}/);
    expect(screen.getByRole("button", { name: /Save template/i })).toBeDefined();
  });
});
