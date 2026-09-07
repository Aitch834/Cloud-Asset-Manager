import { expect, test, type Page, type Route } from "@playwright/test";
import { clerk, setupClerkTestingToken } from "@clerk/testing/playwright";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5;
const BLOCK_ID = 2172;
const BLOCK_NAME = "E2E Parcel Ref Block";
const SAVED_REF = "SD2172 0001";
const FAILED_REF = "SD2172 0002";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function readSetupFile(name: string): string {
  const stateFile = path.join(__dirname, name);
  if (!fs.existsSync(stateFile)) {
    throw new Error(`global-setup did not run — e2e/${name} is missing`);
  }
  return fs.readFileSync(stateFile, "utf8").trim();
}

function block(fieldParcelRef: string | null) {
  return {
    id: BLOCK_ID,
    blockName: BLOCK_NAME,
    variety: "Chardonnay",
    fieldParcelRef,
    areaHa: "0.10",
  };
}

async function prepareDashboard(page: Page) {
  let persistedRef: string | null = null;
  let failNextPut = false;
  let holdNextGet = false;
  let releaseDelayedGet: (() => void) | undefined;
  let delayedGetStarted: (() => void) | undefined;

  const delayedGet = new Promise<void>(resolve => {
    delayedGetStarted = resolve;
  });

  await page.route(`**/api/farms/${FARM_ID}`, async route => {
    const requestUrl = new URL(route.request().url());
    if (
      route.request().method() !== "GET"
      || !requestUrl.pathname.endsWith(`/farms/${FARM_ID}`)
    ) {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        record: {
          id: FARM_ID,
          name: "E2E Parcel Ref Vineyard",
          sbiNumber: "123456789",
          fsaVineRegisterRef: "E2E-FSA",
          fsaWineProductionRef: "E2E-WINE",
          appaRef: "E2E-APPA",
          winegbMembershipNumber: "E2E-WINEGB",
        },
      }),
    });
  });

  await page.route(`**/api/farms/${FARM_ID}/vineyard-blocks*`, async route => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }

    if (holdNextGet) {
      holdNextGet = false;
      delayedGetStarted?.();
      await new Promise<void>(resolve => {
        releaseDelayedGet = resolve;
      });
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ records: [block(persistedRef)] }),
    });
  });

  await page.route(`**/api/farms/${FARM_ID}/vineyard-blocks/${BLOCK_ID}`, async route => {
    if (route.request().method() !== "PUT") {
      await route.continue();
      return;
    }

    if (failNextPut) {
      failNextPut = false;
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Deliberate E2E save failure" }),
      });
      return;
    }

    const payload = route.request().postDataJSON() as { fieldParcelRef: string };
    persistedRef = payload.fieldParcelRef;
    holdNextGet = true;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ record: block(persistedRef) }),
    });
  });

  await setupClerkTestingToken({ page, userId: readSetupFile(".test-user-id") });
  await page.goto("/dashboard/");
  await page.waitForLoadState("networkidle");
  await clerk.signIn({ page, emailAddress: readSetupFile(".test-user-email") });
  await page.evaluate(
    ([tenantSlug, farmId]) => {
      localStorage.setItem("farmtrac_tenantSlug", tenantSlug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug, farmId }, version: 0 }),
      );
      localStorage.setItem(`viticulture-active-tab-${farmId}`, "vine-register");
    },
    [TENANT_SLUG, FARM_ID] as [string, number],
  );

  return {
    delayedGet,
    releaseDelayedGet: () => releaseDelayedGet?.(),
    failNextPut: () => {
      failNextPut = true;
    },
  };
}

function parcelRefEditor(page: Page) {
  return page.getByText("Edit Parcel / Field Refs", { exact: true }).locator("..");
}

test("Parcel / Field Ref popover updates optimistically and rolls back a failed save", async ({
  page,
}) => {
  const controls = await prepareDashboard(page);

  try {
    await page.goto("/dashboard/viticulture");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Viticulture module not active", { exact: true })).toHaveCount(0);

    const warningButton = page.getByRole("button", { name: /1 missing/ });
    await expect(warningButton).toBeVisible();
    await warningButton.click();

    const editor = parcelRefEditor(page);
    const input = editor.getByLabel(`Parcel / Field Ref for ${BLOCK_NAME}`);
    await expect(editor.getByText("1 still missing.", { exact: false })).toBeVisible();
    await expect(editor.getByText("Missing", { exact: true })).toBeVisible();

    await input.fill(SAVED_REF);
    await editor.getByRole("button", { name: "Save", exact: true }).click();

    await expect(warningButton).toHaveText(/Edit refs/);
    await expect(editor.getByText("Missing", { exact: true })).toHaveCount(0);
    await expect(editor.getByText("Saved", { exact: true })).toBeVisible();
    await expect(
      editor.getByRole("button", { name: "Print now (0 refs still missing)", exact: true }),
    ).toBeVisible();

    await controls.delayedGet;
    await expect(warningButton).toHaveText(/Edit refs/);
    controls.releaseDelayedGet();

    controls.failNextPut();
    await input.fill(FAILED_REF);
    await editor.getByRole("button", { name: "Save", exact: true }).click();

    await expect(input).toHaveValue(SAVED_REF);
    await expect(
      editor.getByText("Failed to save — please try again.", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Failed to save Parcel / Field Ref", { exact: true }),
    ).toBeVisible();
    await expect(warningButton).toHaveText(/Edit refs/);
  } finally {
    controls.releaseDelayedGet();
  }
});