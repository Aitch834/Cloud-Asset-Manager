/**
 * E2E: Farm emergency-contact phone warning
 *
 * Verifies that a short, non-empty phone number shows an advisory warning
 * without disabling Save Changes, and that a valid 10+ digit number clears it.
 * All customer-detail reads are intercepted and the dialog is cancelled, so
 * the test cannot modify existing farm data.
 */

import { expect, test } from "@playwright/test";

const ADMIN_SECRET_PLACEHOLDER = "e2e-farm-phone-warning-secret";
const TENANT_ID = 910_217_3;
const FARM_ID = 920_217_3;

const tenant = {
  id: TENANT_ID,
  name: "E2E Phone Warning Tenant",
  slug: "e2e-phone-warning-tenant",
  contactEmail: "phone-warning@test.local",
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
};

const farm = {
  id: FARM_ID,
  tenantId: TENANT_ID,
  name: "E2E Phone Warning Farm",
  address: "Test Lane",
  postcode: "DT1 1AA",
  emergencyContactPhone: "07700 900123",
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
};

test("warns for a short farm phone while keeping save advisory-only", async ({
  page,
}) => {
  let farmUpdateRequests = 0;

  await page.addInitScript((secret) => {
    sessionStorage.setItem("bde_admin_secret", secret);
  }, ADMIN_SECRET_PLACEHOLDER);

  await page.route("**/api/admin/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;

    if (
      path === `/api/admin/tenants/${TENANT_ID}/farms/${FARM_ID}` &&
      request.method() === "PATCH"
    ) {
      farmUpdateRequests += 1;
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "The test must not save farm data" }),
      });
      return;
    }

    const response =
      path === `/api/admin/tenants/${TENANT_ID}`
        ? { tenant, farms: [farm], subscriptions: [], users: [] }
        : path === "/api/admin/system-roles"
          ? { roles: [] }
          : path === "/api/admin/modules"
            ? { modules: [] }
            : null;

    if (response) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(response),
      });
      return;
    }

    await route.continue();
  });

  await page.goto(`/admin-portal/customers/${TENANT_ID}`);
  await expect(
    page.getByRole("heading", { name: `Farms (1)` }),
  ).toBeVisible();

  const farmRow = page.getByText(farm.name, { exact: true }).locator("xpath=../../..");
  await farmRow.getByRole("button", { name: "Edit" }).click();

  await expect(
    page.getByRole("heading", { name: "Edit Farm Details" }),
  ).toBeVisible();

  const phoneInput = page.locator('input[type="tel"]');
  const saveButton = page.getByRole("button", { name: "Save Changes" });
  const warning = page.getByText(
    /fewer than 10 digits\. You can still save if you're sure\./i,
  );

  await phoneInput.fill("01234");
  await expect(warning).toBeVisible();
  await expect(warning).toHaveClass(/text-amber-600/);
  await expect(saveButton).toBeEnabled();

  await phoneInput.fill("01234 567890");
  await expect(warning).toBeHidden();
  await expect(saveButton).toBeEnabled();

  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(
    page.getByRole("heading", { name: "Edit Farm Details" }),
  ).toBeHidden();
  expect(farmUpdateRequests).toBe(0);
});