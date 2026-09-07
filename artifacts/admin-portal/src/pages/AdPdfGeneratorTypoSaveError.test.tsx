import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdPdfGenerator, { TemplateForm } from "./AdPdfGenerator";

vi.mock("@/lib/auth", () => ({ getSecret: () => "test-secret" }));

const TEMPLATE = {
  id: 1,
  name: "Test Template",
  slug: "test-template",
  widthMm: 190,
  heightMm: 133,
  // {{ HEADLINE }} is a near-miss that requires confirmation before saving.
  htmlBody: "{{font_css}}{{logo}}{{bg}}{{qr}}{{ HEADLINE }}",
  isDefault: true,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  archivedAt: null,
};

function FailedSaveHarness() {
  const [saveError, setSaveError] = useState<string>();
  const onSave = vi.fn(() => setSaveError("Slug already exists"));

  return (
    <TemplateForm
      initial={TEMPLATE}
      onSave={onSave}
      onCancel={vi.fn()}
      isSaving={false}
      saveError={saveError}
    />
  );
}

describe("TemplateForm — typo confirmation after a failed save", () => {
  it("dismisses the confirmation panel and keeps the save error visible", async () => {
    render(<FailedSaveHarness />);

    fireEvent.click(screen.getByRole("button", { name: /Save template/i }));

    expect(screen.getByRole("button", { name: /Save anyway/i })).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: /Save anyway/i }));

    await waitFor(() => {
      expect(screen.getByText("Slug already exists")).toBeDefined();
    });

    expect(screen.queryByRole("button", { name: /Save anyway/i })).toBeNull();
    expect(screen.getByRole("button", { name: /Save template/i })).toBeDefined();
    expect(screen.getByText(/Likely placeholder typo detected/i)).toBeDefined();
  });

  it("clears the failed create error when an edited retry starts and closes after success", async () => {
    let saveAttempts = 0;
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const url = String(input);
      const method = init?.method ?? "GET";

      if (url === "/api/admin/ad-templates?includeArchived=1") {
        return new Response(JSON.stringify([]), { status: 200 });
      }
      if (url === "/api/admin/ad-pdf/brand-assets") {
        return new Response(JSON.stringify({ logo: "", qr: "" }), { status: 200 });
      }
      if (url === "/api/admin/ad-pdf/brand-assets/status") {
        return new Response(JSON.stringify({ logoResolvable: true, qrResolvable: true }), { status: 200 });
      }
      if (url === "/api/admin/ad-copy-presets") {
        return new Response(JSON.stringify([]), { status: 200 });
      }
      if (url === "/api/admin/ad-templates" && method === "POST") {
        saveAttempts += 1;
        if (saveAttempts === 1) {
          return new Response(JSON.stringify({ error: "Slug already exists" }), { status: 409 });
        }
        return new Response(JSON.stringify({ ...TEMPLATE, slug: "corrected-template", warnings: [] }), { status: 200 });
      }

      throw new Error(`Unexpected request: ${method} ${url}`);
    });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AdPdfGenerator />
      </QueryClientProvider>,
    );

    fireEvent.click(await screen.findByRole("button", { name: /New template/i }));
    fireEvent.change(screen.getByText("WeasyPrint HTML body").closest("label")!.parentElement!.parentElement!.querySelector("textarea")!, {
      target: { value: TEMPLATE.htmlBody },
    });
    fireEvent.change(screen.getByPlaceholderText("Viticulture — Half Page Horizontal"), {
      target: { value: TEMPLATE.name },
    });

    fireEvent.click(screen.getByRole("button", { name: /Save template/i }));
    fireEvent.click(screen.getByRole("button", { name: /Save anyway/i }));
    expect(await screen.findByText("Slug already exists")).toBeDefined();

    fireEvent.change(screen.getByPlaceholderText("viticulture-horizontal"), {
      target: { value: "corrected-template" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Save template/i }));

    await waitFor(() => {
      expect(screen.queryByText("Slug already exists")).toBeNull();
    });
    fireEvent.click(screen.getByRole("button", { name: /Save anyway/i }));

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /Save template/i })).toBeNull();
    });
    expect(saveAttempts).toBe(2);

    fetchMock.mockRestore();
    queryClient.clear();
  });
});
