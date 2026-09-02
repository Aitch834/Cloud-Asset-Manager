/**
 * E2E: Ad PDF Generator — required template placeholders
 *
 * The generator must not offer PDF generation or preview for a template that
 * cannot render the required brand/content tokens. The API is intercepted so
 * this remains a deterministic page-level browser check and does not create or
 * change admin templates.
 */

import { expect, test } from "@playwright/test";

const ADMIN_SECRET_PLACEHOLDER = "e2e-ad-pdf-test-secret";

const COMPLETE_BODY = "{{font_css}}{{logo}}{{bg}}{{qr}}<h1>Complete template</h1>";

const templates = [
  {
    id: 901,
    name: "E2E Missing QR Template",
    slug: "e2e-missing-qr-template",
    widthMm: 190,
    heightMm: 133,
    htmlBody: "{{font_css}}{{logo}}{{bg}}<h1>Missing QR</h1>",
    isDefault: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    archivedAt: null,
  },
  {
    id: 902,
    name: "E2E Complete Template",
    slug: "e2e-complete-template",
    widthMm: 190,
    heightMm: 133,
    htmlBody: COMPLETE_BODY,
    isDefault: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    archivedAt: null,
  },
];

test("blocks Generate and Preview for missing placeholders, then re-enables them for a complete template", async ({
  page,
}) => {
  await page.addInitScript((secret) => {
    sessionStorage.setItem("bde_admin_secret", secret);
  }, ADMIN_SECRET_PLACEHOLDER);

  await page.route("**/api/admin/**", async (route) => {
    const path = new URL(route.request().url()).pathname;

    if (path === "/api/admin/ad-templates") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(templates),
      });
      return;
    }

    if (path === "/api/admin/platform-config") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [
            { key: "brand.adLogoDataUrl", currentValue: "", defaultValue: "" },
            { key: "brand.adQrDataUrl", currentValue: "", defaultValue: "" },
          ],
        }),
      });
      return;
    }

    if (path === "/api/admin/ad-brand-assets/status") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ logoResolvable: true, qrResolvable: true }),
      });
      return;
    }

    if (path === "/api/admin/ad-copy-presets") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
      return;
    }

    await route.continue();
  });

  await page.goto("/admin-portal/ad-pdf");

  await expect(
    page.getByRole("heading", { name: "Ad PDF Generator" }),
  ).toBeVisible();

  const generateButton = page.getByRole("button", {
    name: "Generate & Download CMYK PDF",
  });
  const previewButton = page.getByRole("button", { name: "Preview" });

  // The default fixture omits {{qr}}, so both actions must be guarded.
  await expect(generateButton).toBeDisabled();
  await expect(previewButton).toBeDisabled();

  const warning = page.getByText("Generate blocked").locator("..");
  await expect(warning).toBeVisible();
  await expect(warning).toContainText("{{qr}}");
  await expect(warning).toContainText("missing required placeholder");

  // Switching to a valid template must clear both the warning and the guard.
  await page.locator("select").selectOption(String(templates[1].id));
  await expect(generateButton).toBeEnabled();
  await expect(previewButton).toBeEnabled();
  await expect(page.getByText("Generate blocked")).toBeHidden();
});