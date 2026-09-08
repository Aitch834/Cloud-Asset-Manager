import { expect, test, type Page } from "@playwright/test";
import { signInDashboard } from "./auth";

const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5;
const ORIGINAL_CONTACT_PHONE = "07911 123 456";
const SAVED_SMS_PHONE = "+447700900123";

type FarmRecord = Record<string, unknown> & {
  id: number;
  name: string;
  cphNumber: string | null;
  contactPhone: string | null;
};

async function openFarmSettings(page: Page): Promise<{ smsPutBodies: unknown[] }> {
  const smsPutBodies: unknown[] = [];
  let farm: FarmRecord = {
    id: FARM_ID,
    name: "SMS Nudge Test Farm",
    cphNumber: null,
    contactPhone: ORIGINAL_CONTACT_PHONE,
  };

  await page.route(`**/api/farms/${FARM_ID}`, async route => {
    const method = route.request().method();
    if (method === "GET") {
      await route.fulfill({ json: { record: farm } });
      return;
    }
    if (method === "PUT") {
      const body = route.request().postDataJSON() as { phone?: string | null };
      farm = { ...farm, contactPhone: body.phone ?? null };
      await route.fulfill({ json: { record: farm } });
      return;
    }
    await route.continue();
  });

  await page.route("**/api/account/profile", async route => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        json: {
          phoneNumber: SAVED_SMS_PHONE,
          smsOptIn: "on",
          smsCategories: { weather: true },
          smsConsentAt: "2026-09-01T12:00:00.000Z",
        },
      });
      return;
    }
    if (route.request().method() === "PUT") {
      smsPutBodies.push(route.request().postDataJSON());
      await route.fulfill({ json: { phoneNumber: "+447922222222" } });
      return;
    }
    await route.continue();
  });

  await signInDashboard(page);
  await page.evaluate(
    ([slug, farmId]) => {
      localStorage.setItem("farmtrac_tenantSlug", slug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug: slug, farmId }, version: 0 }),
      );
    },
    [TENANT_SLUG, FARM_ID] as const,
  );
  await page.goto("/dashboard/settings/farm", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Farm Settings", exact: true })).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.getByLabel("Contact Phone")).toHaveValue(ORIGINAL_CONTACT_PHONE);
  return { smsPutBodies };
}

async function saveContactPhone(page: Page, phone: string): Promise<void> {
  await page.getByLabel("Contact Phone").fill(phone);
  await page.getByRole("button", { name: "Save Changes" }).click();
  await expect(page.getByText("Farm updated", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save Changes" })).toBeEnabled();
}

async function expectNoSmsNudge(page: Page): Promise<void> {
  await expect(page.getByText("Update SMS number?", { exact: true })).toHaveCount(0);
}

test("only nudges for a changed UK mobile and dismissing leaves the SMS number unchanged", async ({
  page,
}) => {
  const { smsPutBodies } = await openFarmSettings(page);

  await saveContactPhone(page, ORIGINAL_CONTACT_PHONE);
  await expectNoSmsNudge(page);

  await saveContactPhone(page, "+44 7911 123 456");
  await expectNoSmsNudge(page);

  await saveContactPhone(page, "01234 567890");
  await expectNoSmsNudge(page);

  await saveContactPhone(page, "not a phone");
  await expectNoSmsNudge(page);

  await saveContactPhone(page, "07922 222 222");
  const nudge = page.getByText("Update SMS number?", { exact: true });
  await expect(nudge).toBeVisible();
  await expect(page.getByRole("button", { name: "Update SMS" })).toBeVisible();

  const toast = nudge.locator("xpath=ancestor::*[@data-state][1]");
  await toast.locator("button[toast-close]").click();
  await expect(nudge).toHaveCount(0);
  expect(smsPutBodies).toEqual([]);
});