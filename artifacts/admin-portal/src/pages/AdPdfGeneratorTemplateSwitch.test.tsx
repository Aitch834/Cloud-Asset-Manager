import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import AdPdfGenerator from "./AdPdfGenerator";

vi.mock("@/lib/auth", () => ({ getSecret: () => "test-secret" }));

Object.assign(global.URL, {
  createObjectURL: vi.fn(() => "blob:mock-preview"),
  revokeObjectURL: vi.fn(),
});

const COMPLETE_BODY = "{{font_css}}{{logo}}{{bg}}{{qr}}<h1>hello</h1>";

const FIRST_TEMPLATE = {
  id: 1,
  name: "First template",
  slug: "first-template",
  widthMm: 190,
  heightMm: 133,
  htmlBody: COMPLETE_BODY,
  isDefault: true,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  archivedAt: null,
};

const SECOND_TEMPLATE = {
  ...FIRST_TEMPLATE,
  id: 2,
  name: "Second template",
  slug: "second-template",
  isDefault: false,
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function makeFetch() {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : (input as Request).url;

    if (url.includes("ad-brand-assets/status")) {
      return jsonResponse({ logoResolvable: true, qrResolvable: true });
    }
    if (url.includes("ad-templates")) {
      return jsonResponse([FIRST_TEMPLATE, SECOND_TEMPLATE]);
    }
    if (url.includes("platform-config")) {
      return jsonResponse({ items: [] });
    }
    if (url.includes("ad-copy-presets")) {
      return jsonResponse([]);
    }
    if (url.includes("ad-pdf/preview-draft") && init?.method === "POST") {
      return new Response(new Blob(["preview"]), {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "X-Ad-Render-Warnings": JSON.stringify(["Unknown placeholder {{headline_html}}"]),
        },
      });
    }

    throw new Error(`Unmocked fetch: ${init?.method ?? "GET"} ${url}`);
  });
}

function makeDeferredPreviewFetch() {
  let resolvePreview!: (response: Response) => void;
  const previewResponse = new Promise<Response>((resolve) => {
    resolvePreview = resolve;
  });
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : (input as Request).url;

    if (url.includes("ad-brand-assets/status")) {
      return jsonResponse({ logoResolvable: true, qrResolvable: true });
    }
    if (url.includes("ad-templates")) {
      return jsonResponse([FIRST_TEMPLATE, SECOND_TEMPLATE]);
    }
    if (url.includes("platform-config")) {
      return jsonResponse({ items: [] });
    }
    if (url.includes("ad-copy-presets")) {
      return jsonResponse([]);
    }
    if (url.includes("ad-pdf/preview-draft") && init?.method === "POST") {
      return previewResponse;
    }

    throw new Error(`Unmocked fetch: ${init?.method ?? "GET"} ${url}`);
  });

  return {
    fetchMock,
    resolvePreview,
  };
}

function previewResponseWithWarning(): Response {
  return new Response(new Blob(["preview"]), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "X-Ad-Render-Warnings": JSON.stringify(["Unknown placeholder {{headline_html}}"]),
    },
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

describe("AdPdfGenerator — template switch preview state", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not carry a previous draft preview warning into the next template", async () => {
    vi.stubGlobal("fetch", makeFetch());
    renderPage();

    await screen.findByRole("option", { name: /First template/i });

    const editButtons = screen.getAllByTitle("Edit");
    expect(editButtons).toHaveLength(2);
    fireEvent.click(editButtons[0]);

    await screen.findByRole("heading", { name: "Edit — First template" });
    const draftPreviewButton = screen
      .getAllByRole("button", { name: /^Preview$/i })
      .find((button) => button.closest("form"));
    expect(draftPreviewButton).toBeDefined();
    fireEvent.click(draftPreviewButton as HTMLButtonElement);

    await screen.findByText(/Likely placeholder typo detected in this draft/i);
    expect(screen.getByAltText("Draft template preview")).toBeDefined();

    fireEvent.click(screen.getAllByTitle("Edit")[1]);

    await screen.findByRole("heading", { name: "Edit — Second template" });
    await waitFor(() => {
      expect(screen.queryByText(/Likely placeholder typo detected in this draft/i)).toBeNull();
      expect(screen.queryByAltText("Draft template preview")).toBeNull();
    });
  });

  it("does not let a delayed old preview affect the next template", async () => {
    const { fetchMock, resolvePreview } = makeDeferredPreviewFetch();
    vi.stubGlobal("fetch", fetchMock);
    renderPage();

    await screen.findByRole("option", { name: /First template/i });

    const editButtons = screen.getAllByTitle("Edit");
    fireEvent.click(editButtons[0]);

    await screen.findByRole("heading", { name: "Edit — First template" });
    const draftPreviewButton = screen
      .getAllByRole("button", { name: /^Preview$/i })
      .find((button) => button.closest("form"));
    expect(draftPreviewButton).toBeDefined();
    fireEvent.click(draftPreviewButton as HTMLButtonElement);
    await screen.findByRole("button", { name: /Rendering…/i });

    fireEvent.click(screen.getAllByTitle("Edit")[1]);
    await screen.findByRole("heading", { name: "Edit — Second template" });

    await act(async () => {
      resolvePreview(previewResponseWithWarning());
    });

    await waitFor(() => {
      expect(screen.queryByText(/Likely placeholder typo detected in this draft/i)).toBeNull();
      expect(screen.queryByAltText("Draft template preview")).toBeNull();
      expect(screen.queryByRole("button", { name: /Rendering…/i })).toBeNull();
    });
  });
});