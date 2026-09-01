import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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

const PRESET_NAME = "Seasonal campaign";
const INITIAL_PRESET = {
  id: 42,
  name: PRESET_NAME,
  headline: "Initial headline",
  body: "Initial body",
  accentColor: "#111111",
  bgUrl: "",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const UPDATED_PRESET = {
  ...INITIAL_PRESET,
  headline: "Overwritten headline",
  body: "Overwritten body",
  accentColor: "#222222",
  updatedAt: "2026-02-01T00:00:00Z",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function makeStatefulFetch() {
  let currentPreset: typeof INITIAL_PRESET | null = null;
  const overwrittenUpdatedAt = UPDATED_PRESET.updatedAt;

  const fetchSpy = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
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
    if (url.includes("ad-copy-presets") && method === "GET") {
      return jsonResponse(currentPreset ? [currentPreset] : []);
    }
    if (url.includes("ad-copy-presets") && method === "POST") {
      const payload = JSON.parse(String(init?.body)) as {
        name: string;
        headline: string;
        body: string;
        accentColor: string;
        bgUrl: string;
        overwrite?: boolean;
      };

      if (payload.overwrite && currentPreset?.name === payload.name) {
        currentPreset = {
          ...currentPreset,
          headline: payload.headline,
          body: payload.body,
          accentColor: payload.accentColor,
          bgUrl: payload.bgUrl,
          updatedAt: overwrittenUpdatedAt,
        };
        return jsonResponse(currentPreset);
      }

      currentPreset = {
        ...INITIAL_PRESET,
        name: payload.name,
        headline: payload.headline,
        body: payload.body,
        accentColor: payload.accentColor,
        bgUrl: payload.bgUrl,
      };
      return jsonResponse(currentPreset, 201);
    }

    throw new Error(`Unmocked fetch: ${method} ${url}`);
  });

  return { fetchSpy, getCurrentPreset: () => currentPreset };
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

function clickPresetSave() {
  const presetNameInput = screen.getByPlaceholderText("Preset name, e.g. Harvest 2026");
  const saveButton = presetNameInput.parentElement?.querySelector("button");
  if (!saveButton) throw new Error("Preset save button not found");
  fireEvent.click(saveButton);
}

describe("AdPdfGenerator — preset overwrite refresh", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("refetches the saved row with overwritten values and no duplicate", async () => {
    const { fetchSpy, getCurrentPreset } = makeStatefulFetch();
    vi.stubGlobal("fetch", fetchSpy);
    renderPage();

    await screen.findByRole("option", { name: /Test Template/i });
    await screen.findByText("optional overrides");
    fireEvent.click(screen.getByText("Customise copy & colour"));
    await screen.findByPlaceholderText(/Your vineyard/);

    fireEvent.change(screen.getByPlaceholderText(/Your vineyard/), {
      target: { value: INITIAL_PRESET.headline },
    });
    fireEvent.change(screen.getByPlaceholderText(/Vine register, phenology/), {
      target: { value: INITIAL_PRESET.body },
    });
    fireEvent.change(screen.getByPlaceholderText("#C49A6C (default)"), {
      target: { value: INITIAL_PRESET.accentColor },
    });
    fireEvent.change(screen.getByPlaceholderText("Preset name, e.g. Harvest 2026"), {
      target: { value: PRESET_NAME },
    });
    clickPresetSave();

    const savedPresetsHeading = await screen.findByText("Saved presets");
    const savedPresets = savedPresetsHeading.parentElement;
    expect(savedPresets).not.toBeNull();
    await within(savedPresets as HTMLElement).findByText(/Initial headline/);

    fireEvent.change(screen.getByPlaceholderText(/Your vineyard/), {
      target: { value: UPDATED_PRESET.headline },
    });
    fireEvent.change(screen.getByPlaceholderText(/Vine register, phenology/), {
      target: { value: UPDATED_PRESET.body },
    });
    fireEvent.change(screen.getByPlaceholderText("#C49A6C (default)"), {
      target: { value: UPDATED_PRESET.accentColor },
    });
    fireEvent.change(screen.getByPlaceholderText("Preset name, e.g. Harvest 2026"), {
      target: { value: PRESET_NAME },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: /Overwrite existing preset/i }));
    clickPresetSave();

    await waitFor(() => {
      expect(getCurrentPreset()).toEqual(UPDATED_PRESET);
      expect(within(savedPresets as HTMLElement).getByText(/Overwritten headline/)).toBeDefined();
      expect(within(savedPresets as HTMLElement).getByText(/#222222/)).toBeDefined();
      expect(within(savedPresets as HTMLElement).getAllByText(PRESET_NAME, { exact: true })).toHaveLength(1);
    });

    const overwriteRequest = fetchSpy.mock.calls.find(([input, init]) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : (input as Request).url;
      if (!url.includes("ad-copy-presets") || init?.method !== "POST") return false;
      const payload = JSON.parse(String(init.body)) as { overwrite?: boolean };
      return payload.overwrite === true;
    });
    expect(overwriteRequest).toBeDefined();
    expect(overwriteRequest?.[1]?.body).toContain(UPDATED_PRESET.headline);
    expect(overwriteRequest?.[1]?.body).toContain(UPDATED_PRESET.body);
    expect(overwriteRequest?.[1]?.body).toContain(UPDATED_PRESET.accentColor);

    const presetListRequests = fetchSpy.mock.calls.filter(([input, init]) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : (input as Request).url;
      return url.includes("ad-copy-presets") && (init?.method ?? "GET") === "GET";
    });
    expect(presetListRequests.length).toBeGreaterThanOrEqual(3);
  });

  it("requires confirmation before saving near-miss placeholders in ad copy", async () => {
    const { fetchSpy, getCurrentPreset } = makeStatefulFetch();
    vi.stubGlobal("fetch", fetchSpy);
    renderPage();

    await screen.findByRole("option", { name: /Test Template/i });
    fireEvent.click(screen.getByText("Customise copy & colour"));
    await screen.findByPlaceholderText(/Your vineyard/);

    fireEvent.change(screen.getByPlaceholderText(/Your vineyard/), {
      target: { value: "Your {{ headline }}." },
    });
    fireEvent.change(screen.getByPlaceholderText(/Vine register, phenology/), {
      target: { value: "Body copy" },
    });
    fireEvent.change(screen.getByPlaceholderText("Preset name, e.g. Harvest 2026"), {
      target: { value: "Near-miss placeholder preset" },
    });

    clickPresetSave();

    await screen.findByText("Confirm save with typo placeholder");
    expect(
      fetchSpy.mock.calls.some(([input, init]) => {
        const url =
          typeof input === "string"
            ? input
            : input instanceof URL
              ? input.href
              : (input as Request).url;
        return url.includes("ad-copy-presets") && init?.method === "POST";
      }),
    ).toBe(false);
    expect(screen.getByText("{{ headline }}")).toBeDefined();
    expect(screen.getAllByText("{{headline}}").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /Save anyway/i }));

    await waitFor(() => {
      expect(getCurrentPreset()).toMatchObject({
        name: "Near-miss placeholder preset",
        headline: "Your {{ headline }}.",
        body: "Body copy",
      });
    });
  });
});