import { signInDashboard } from "./auth";
/**
 * E2E: Batch Trail data-aware jump navigation.
 *
 * Owns the winery responses so each scope has a deliberate set of populated
 * sections. This catches drift between conditional sections, chip IDs, and the
 * dialog's scroll container.
 */

import { expect, test, type Locator, type Page } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5; // Highfield Vineyard — Viticulture is enabled
const BATCH_REF = "E2E-JUMP-2026";
const VINTAGE_YEAR = 2025;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pressings = [
  {
    id: 223_901,
    press_date: "2026-09-01",
    batch_ref: BATCH_REF,
    vintage_year: 2026,
    press_type: "Pneumatic",
    grapes_pressed_kg: "1200",
    notes: "Populated single-batch jump-bar fixture",
  },
  {
    id: 223_902,
    press_date: "2025-09-01",
    batch_ref: null,
    vintage_year: VINTAGE_YEAR,
    press_type: "Basket",
    grapes_pressed_kg: "900",
    notes: "Populated vintage-scoped jump-bar fixture",
  },
];

function getTestUserId(): string {
  const stateFile = path.join(__dirname, process.env.PLAYWRIGHT_E2E_USER_ID_FILE!);
  if (!fs.existsSync(stateFile)) {
    throw new Error("global-setup did not run — .test-user-id missing");
  }
  return fs.readFileSync(stateFile, "utf8").trim();
}

function getTestUserEmail(): string {
  const emailFile = path.join(__dirname, process.env.PLAYWRIGHT_E2E_USER_EMAIL_FILE!);
  if (!fs.existsSync(emailFile)) {
    throw new Error("global-setup did not run — .test-user-email missing");
  }
  return fs.readFileSync(emailFile, "utf8").trim();
}

function batchTrail(scope: "batchRef" | "vintageYear") {
  if (scope === "batchRef") {
    return {
      batchRef: BATCH_REF,
      vintageYear: 2026,
      scope,
      fermentation: Array.from({ length: 8 }, (_, index) => ({
        id: 223_910 + index,
        start_date: `2026-09-${String(index + 2).padStart(2, "0")}`,
        batch_ref: BATCH_REF,
        fermentation_type: "Primary",
        operator_name: `Operator ${index + 1}`,
        notes: "Fermentation fixture row used to create dialog scroll height",
      })),
      cellarOps: [],
      so2Tests: [],
      bottling: [{
        id: 223_930,
        bottling_date: "2026-12-01",
        batch_ref: BATCH_REF,
        lot_code: "LOT-JUMP",
        bottles_produced: 1200,
        notes: "Bottling jump target",
      }],
      pressAdditions: [],
      barrelFills: [],
      barrelMaintenance: [],
      barrelCleaning: [],
      barrelVessels: [],
    };
  }

  return {
    batchRef: null,
    vintageYear: VINTAGE_YEAR,
    scope,
    fermentation: [],
    cellarOps: Array.from({ length: 8 }, (_, index) => ({
      id: 223_940 + index,
      op_date: `2025-10-${String(index + 1).padStart(2, "0")}`,
      vintage_year: VINTAGE_YEAR,
      op_type: "racking",
      operator_name: `Cellar operator ${index + 1}`,
      notes: "Vintage cellar fixture row used to create dialog scroll height",
    })),
    so2Tests: [{
      id: 223_960,
      test_date: "2025-11-01",
      vintage_year: VINTAGE_YEAR,
      test_stage: "Pre-bottling",
      total_so2_mg_l: "82",
      free_so2_mg_l: "28",
    }],
    bottling: [],
    pressAdditions: [],
    pressings: [pressings[1]],
    barrelFills: [],
    barrelMaintenance: [],
    barrelCleaning: [],
    barrelVessels: [],
  };
}

async function mockWineryData(page: Page): Promise<void> {
  await page.route(new RegExp(`/api/farms/${FARM_ID}/winery-[^?]+(?:\\?.*)?$`), async route => {
    const url = new URL(route.request().url());
    const pathname = url.pathname;
    if (pathname.endsWith("/winery-pressing/batch-trail")) {
      await route.fulfill({
        json: batchTrail(url.searchParams.has("batchRef") ? "batchRef" : "vintageYear"),
      });
      return;
    }
    if (pathname.endsWith("/winery-pressing")) {
      await route.fulfill({ json: { records: pressings } });
      return;
    }
    if (pathname.includes("/attachments")) {
      await route.fulfill({ json: { attachments: [] } });
      return;
    }
    if (pathname.endsWith("/winery-batch-settings")) {
      await route.fulfill({ json: { settings: {} } });
      return;
    }
    await route.fulfill({ json: { records: [] } });
  });
}

async function openPressingRecords(page: Page): Promise<void> {
  await signInDashboard(page);
  await page.evaluate(
    ([slug, farmId]) => {
      localStorage.setItem("farmtrac_tenantSlug", slug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug: slug, farmId }, version: 0 }),
      );
      localStorage.setItem(`viticulture-active-tab-${farmId}`, "winery-pressing");
    },
    [TENANT_SLUG, FARM_ID] as [string, number],
  );
  await page.goto("/dashboard/viticulture");
  await expect(page.getByText("Pressing Records", { exact: true })).toBeVisible({
    timeout: 20_000,
  });
}

async function expectOnlyChips(nav: Locator, labels: string[]): Promise<void> {
  await expect(nav.getByRole("button")).toHaveText(labels);
}

async function expectChipJump(dialog: Locator, label: string, sectionId: string): Promise<void> {
  const chip = dialog.getByRole("button", { name: label, exact: true });
  const section = dialog.locator(`#${sectionId}`);
  await chip.click();
  await expect(chip).toHaveAttribute("aria-current", "location");
  await expect.poll(async () => {
    const [dialogBox, sectionBox] = await Promise.all([
      dialog.boundingBox(),
      section.boundingBox(),
    ]);
    return !!dialogBox && !!sectionBox &&
      sectionBox.y >= dialogBox.y &&
      sectionBox.y < dialogBox.y + dialogBox.height;
  }, { message: `${label} section should be visible inside the dialog after its chip is clicked` }).toBe(true);
}

async function expectScrollHighlights(dialog: Locator, label: string, sectionId: string): Promise<void> {
  const section = dialog.locator(`#${sectionId}`);
  await section.evaluate(element => element.scrollIntoView({ block: "start" }));
  await expect(dialog.getByRole("button", { name: label, exact: true }))
    .toHaveAttribute("aria-current", "location");
}

test("jump bar follows populated sections in batch and vintage trails", async ({ page }) => {
  await mockWineryData(page);
  await openPressingRecords(page);

  await page.getByRole("button", { name: `View batch trail for ${BATCH_REF}` }).click();
  let dialog = page.getByRole("dialog", { name: `Batch Trail — ${BATCH_REF}` });
  await expect(dialog).toBeVisible();
  let nav = dialog.getByTestId("batch-trail-section-nav");
  await expectOnlyChips(nav, ["Pressing", "Fermentation", "Bottling"]);
  await expectChipJump(dialog, "Bottling", "bt-bottling");
  await expectScrollHighlights(dialog, "Fermentation", "bt-fermentation");
  await dialog.getByRole("button", { name: "Close" }).click();

  await page.getByRole("button", { name: `View full vintage trail for ${VINTAGE_YEAR}` }).click();
  dialog = page.getByRole("dialog", { name: `Full Vintage Trail — Vintage ${VINTAGE_YEAR}` });
  await expect(dialog).toBeVisible();
  nav = dialog.getByTestId("batch-trail-section-nav");
  await expectOnlyChips(nav, ["Pressing", "SO₂ Summary", "Cellar Ops", "SO₂ Tests"]);
  await expectChipJump(dialog, "SO₂ Tests", "bt-so2tests");
  await expectScrollHighlights(dialog, "Cellar Ops", "bt-cellar");
});
