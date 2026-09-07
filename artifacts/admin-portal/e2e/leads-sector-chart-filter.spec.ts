/**
 * E2E: Leads Pipeline sector-chart filtering.
 *
 * The leads response is intercepted so this test always has multiple sectors
 * available and can verify the chart-to-table filter toggle deterministically.
 */

import { expect, test, type Page } from "@playwright/test";

const ADMIN_SECRET_PLACEHOLDER = "e2e-leads-sector-filter-secret";

const leads = [
  {
    id: 9101,
    businessName: "E2E Arable Farm",
    contactName: "Alex Fields",
    email: "alex.fields@test.local",
    phone: null,
    farmCount: 1,
    modulesInterested: ["field-crop-management"],
    message: null,
    source: "Referral",
    status: "new",
    sector: "Arable",
    county: "Lincolnshire",
    farmType: "Arable",
    cphNumber: null,
    notes: null,
    lastContactedAt: null,
    createdAt: "2026-09-01T09:00:00.000Z",
  },
  {
    id: 9102,
    businessName: "E2E Dairy Farm",
    contactName: "Drew Herd",
    email: "drew.herd@test.local",
    phone: null,
    farmCount: 2,
    modulesInterested: ["livestock-management"],
    message: null,
    source: "NFU",
    status: "signed-up",
    sector: "Beef & Dairy",
    county: "Somerset",
    farmType: "Dairy",
    cphNumber: null,
    notes: null,
    lastContactedAt: null,
    createdAt: "2026-08-20T09:00:00.000Z",
  },
];

function monitorRuntimeErrors(page: Page) {
  const errors: string[] = [];
  const isOptionalDevBannerRequest = (url: string) =>
    new URL(url).pathname === "/@replit/vite-plugin-dev-banner/banner-script.js";

  page.on("pageerror", (error) => {
    errors.push(`Browser page error: ${error.message}`);
  });
  page.on("console", (message) => {
    const sourceUrl = message.location().url;
    if (
      message.type() === "error" &&
      !(sourceUrl && isOptionalDevBannerRequest(sourceUrl))
    ) {
      errors.push(`Browser console error: ${message.text()}`);
    }
  });
  page.on("requestfailed", (request) => {
    if (isOptionalDevBannerRequest(request.url())) return;
    errors.push(
      `Request failed: ${request.method()} ${request.url()} — ${request.failure()?.errorText ?? "unknown error"}`,
    );
  });
  page.on("response", (response) => {
    const path = new URL(response.url()).pathname;
    if (path.startsWith("/api/") && response.status() >= 400) {
      errors.push(
        `API error: ${response.request().method()} ${path} returned ${response.status()}`,
      );
    }
  });

  return errors;
}

test("selects and clears the table sector filter from the breakdown chart", async ({
  page,
}) => {
  const runtimeErrors = monitorRuntimeErrors(page);

  await page.addInitScript((secret) => {
    sessionStorage.setItem("bde_admin_secret", secret);
  }, ADMIN_SECRET_PLACEHOLDER);

  await page.route("**/api/admin/leads", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ leads }),
    });
  });

  await page.goto("/admin-portal/leads");

  await expect(
    page.getByRole("heading", { name: "Leads Pipeline" }),
  ).toBeVisible();
  await expect(page.getByText("2 leads with sector set")).toBeVisible();

  const sectorSelect = page.locator("select").filter({
    has: page.locator('option[value="all"]', { hasText: "All Sectors" }),
  });
  const arableBar = page.getByRole("button", {
    name: "Filter leads by Arable",
  });

  await expect(sectorSelect).toHaveValue("all");
  await expect(arableBar).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByText("E2E Arable Farm", { exact: true })).toBeVisible();
  await expect(page.getByText("E2E Dairy Farm", { exact: true })).toBeVisible();

  await arableBar.click();

  const activeArableBar = page.getByRole("button", {
    name: "Clear leads by Arable",
  });
  await expect(sectorSelect).toHaveValue("Arable");
  await expect(activeArableBar).toHaveAttribute("aria-pressed", "true");
  await expect(activeArableBar.locator("> div")).toHaveClass(/ring-2/);
  await expect(page.getByText("E2E Arable Farm", { exact: true })).toBeVisible();
  await expect(page.getByText("E2E Dairy Farm", { exact: true })).toHaveCount(0);

  await activeArableBar.click();

  await expect(sectorSelect).toHaveValue("all");
  await expect(arableBar).toHaveAttribute("aria-pressed", "false");
  await expect(arableBar.locator("> div")).not.toHaveClass(/ring-2/);
  await expect(page.getByText("E2E Arable Farm", { exact: true })).toBeVisible();
  await expect(page.getByText("E2E Dairy Farm", { exact: true })).toBeVisible();

  expect(runtimeErrors, runtimeErrors.join("\n")).toEqual([]);
});