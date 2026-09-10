/**
 * E2E: Ad PDF Generator — unresolved brand assets
 *
 * The status endpoint is intercepted so the guard is exercised independently
 * of uploaded platform configuration and legacy on-disk asset fallbacks.
 */

import { expect, test } from "@playwright/test";

const ADMIN_SECRET_PLACEHOLDER = "e2e-ad-pdf-brand-assets-secret";
const COMPLETE_BODY = "{{font_css}}{{logo}}{{bg}}{{qr}}<h1>Complete template</h1>";

const template = {
  id: 903,
  name: "E2E Brand Asset Template",
  slug: "e2e-brand-asset-template",
  widthMm: 190,
  heightMm: 133,
  htmlBody: COMPLETE_BODY,
  isDefault: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  archivedAt: null,
};

for (const fixture of [
  {
    name: "logo",
    unavailableStatus: { logoResolvable: false, qrResolvable: true },
    warning: "Logo cannot be found",
  },
  {
    name: "QR code",
    unavailableStatus: { logoResolvable: true, qrResolvable: false },
    warning: "QR code cannot be found",
  },
] as const) {
  test(`blocks PDF actions while the ${fixture.name} cannot be resolved`, async ({
    page,
  }) => {
    let brandAssetStatus: {
      logoResolvable: boolean;
      qrResolvable: boolean;
    } = fixture.unavailableStatus;

    await page.addInitScript((secret) => {
      sessionStorage.setItem("bde_admin_secret", secret);
    }, ADMIN_SECRET_PLACEHOLDER);

    await page.route("**/api/admin/**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      expect(route.request().headers()["x-admin-secret"]).toBe(
        ADMIN_SECRET_PLACEHOLDER,
      );

      if (path === "/api/admin/ad-templates") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([template]),
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
          body: JSON.stringify(brandAssetStatus),
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

    const previewButton = page.getByRole("button", { name: "Preview" });
    const generateButton = page.getByRole("button", {
      name: "Generate & Download CMYK PDF",
    });

    await expect(page.getByText(fixture.warning, { exact: true })).toBeVisible();
    await expect(previewButton).toBeDisabled();
    await expect(generateButton).toBeDisabled();

    brandAssetStatus = { logoResolvable: true, qrResolvable: true };
    await page.reload();

    await expect(page.getByText(fixture.warning, { exact: true })).toBeHidden();
    await expect(previewButton).toBeEnabled();
    await expect(generateButton).toBeEnabled();
  });
}