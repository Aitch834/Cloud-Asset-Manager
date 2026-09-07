import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import AdPdfGenerator from "./AdPdfGenerator";
import { Layout } from "@/components/Layout";
import { setNavGuard } from "@/lib/nav-guard";

vi.mock("@/lib/auth", () => ({ getSecret: () => "test-secret" }));

const mockNavigate = vi.hoisted(() => vi.fn());
vi.mock("wouter", () => ({
  useLocation: () => ["/ad-pdf", mockNavigate],
}));

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

const PRESET = {
  id: 42,
  name: "Editorial preset",
  headline: "<em>Grow with confidence</em>",
  body: "A short body for the advert.",
  accentColor: "#C49A6C",
  bgUrl: "",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
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
    const method = (init?.method ?? "GET").toUpperCase();

    if (url.includes("ad-brand-assets/status")) {
      return jsonResponse({ logoResolvable: true, qrResolvable: true });
    }
    if (url.includes("ad-templates")) return jsonResponse([TEMPLATE]);
    if (url.includes("platform-config")) return jsonResponse({ items: [] });
    if (url.includes("ad-copy-presets/42") && method === "PUT") {
      return jsonResponse({ ...PRESET, headline: "Updated headline" });
    }
    if (url.includes("ad-copy-presets")) return jsonResponse([PRESET]);

    throw new Error(`Unmocked fetch: ${method} ${url}`);
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

function renderPortalPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <Layout>
        <AdPdfGenerator />
      </Layout>
    </QueryClientProvider>,
  );
}

function dispatchBeforeUnload(): boolean {
  return window.dispatchEvent(new Event("beforeunload", { cancelable: true }));
}

async function openPresetEditor() {
  await screen.findByRole("option", { name: /Test Template/i });
  fireEvent.click(screen.getByRole("button", { name: /Customise copy & colour/i }));
  await screen.findByText("Saved presets");
  fireEvent.click(screen.getByTitle(`Edit "${PRESET.name}"`));
  await screen.findByDisplayValue(PRESET.headline);
}

describe("AdPdfGenerator — preset edit navigation guard", () => {
  beforeEach(() => {
    setNavGuard(null);
    mockNavigate.mockReset();
    vi.stubGlobal("fetch", makeFetch());
  });

  afterEach(() => {
    setNavGuard(null);
    vi.unstubAllGlobals();
  });

  it("does not prompt when a preset is opened but not changed", async () => {
    renderPage();
    await openPresetEditor();

    expect(dispatchBeforeUnload()).toBe(true);
  });

  it("prevents beforeunload while a preset edit is dirty and clears after cancel", async () => {
    renderPage();
    await openPresetEditor();

    fireEvent.change(screen.getByDisplayValue(PRESET.headline), {
      target: { value: "Changed headline" },
    });

    await waitFor(() => {
      expect(dispatchBeforeUnload()).toBe(false);
    });

    fireEvent.click(screen.getByRole("button", { name: /^Cancel$/i }));
    await waitFor(() => {
      expect(screen.queryByDisplayValue("Changed headline")).toBeNull();
      expect(dispatchBeforeUnload()).toBe(true);
    });
  });

  it("clears the beforeunload guard after a successful preset save", async () => {
    const fetchSpy = makeFetch();
    vi.stubGlobal("fetch", fetchSpy);
    renderPage();
    await openPresetEditor();

    fireEvent.change(screen.getByDisplayValue(PRESET.headline), {
      target: { value: "Updated headline" },
    });

    await waitFor(() => {
      expect(dispatchBeforeUnload()).toBe(false);
    });

    fireEvent.click(screen.getByRole("button", { name: /Save changes/i }));

    await waitFor(() => {
      expect(
        fetchSpy.mock.calls.some(([input, init]) => {
          const url =
            typeof input === "string"
              ? input
              : input instanceof URL
                ? input.href
                : (input as Request).url;
          return url.includes("ad-copy-presets/42") && init?.method === "PUT";
        }),
      ).toBe(true);
      expect(screen.queryByRole("button", { name: /Save changes/i })).toBeNull();
      expect(dispatchBeforeUnload()).toBe(true);
    });
  });

  it("keeps the dirty editor open when sidebar discard is cancelled, then navigates without a second prompt when accepted", async () => {
    renderPortalPage();
    await openPresetEditor();

    fireEvent.change(screen.getByDisplayValue(PRESET.headline), {
      target: { value: "Changed headline" },
    });

    const confirmSpy = vi.spyOn(window, "confirm")
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);

    fireEvent.click(screen.getByRole("link", { name: "Dashboard" }));

    expect(confirmSpy).toHaveBeenCalledWith("Discard unsaved changes to this preset?");
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByDisplayValue("Changed headline")).toBeDefined();

    fireEvent.click(screen.getByRole("link", { name: "Dashboard" }));

    expect(confirmSpy).toHaveBeenCalledTimes(2);
    expect(mockNavigate).toHaveBeenCalledWith("/");
    expect(dispatchBeforeUnload()).toBe(true);
  });

  it("keeps the dirty editor open when browser Back is cancelled", async () => {
    renderPage();
    await openPresetEditor();

    fireEvent.change(screen.getByDisplayValue(PRESET.headline), {
      target: { value: "Changed headline" },
    });

    vi.spyOn(window, "confirm").mockReturnValue(false);
    window.history.pushState(null, "", "/admin-portal/");
    window.dispatchEvent(new PopStateEvent("popstate"));

    expect(window.location.pathname).toBe("/");
    expect(screen.getByDisplayValue("Changed headline")).toBeDefined();
  });
});