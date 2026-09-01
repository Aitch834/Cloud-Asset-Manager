import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React, { useState } from "react";
import { TemplateForm } from "./AdPdfGenerator";

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
});