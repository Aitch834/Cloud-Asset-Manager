import { signInDashboard } from "./auth";
/**
 * E2E: Disease Scouting CSV photo and caption counts
 *
 * The scouting list endpoint calculates photoCount and captionCount with a
 * grouped SQL aggregate. This test changes the underlying photo rows and then
 * exercises the dashboard's actual CSV download so the aggregate and export
 * stay covered together.
 *
 * Prerequisites (handled by global-setup.ts):
 *   - CLERK_SECRET_KEY, VITE_CLERK_PUBLISHABLE_KEY, DATABASE_URL in env
 *   - Dashboard workflow running (artifacts/dashboard: web)
 *   - API server workflow running (artifacts/api-server: API Server)
 *
 * Photo bytes are not needed: the API accepts an object path and the CSV only
 * depends on the database metadata.
 */

import { test, expect, type Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5; // Highfield Vineyard — has viticulture module
const SCOUT_NAME = `E2EScoutCsv-${Date.now()}`;
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

function getTestUserId(): string {
  const stateFile = path.join(currentDirectory, process.env.PLAYWRIGHT_E2E_USER_ID_FILE!);
  if (!fs.existsSync(stateFile)) {
    throw new Error("global-setup did not run — .test-user-id missing");
  }
  return fs.readFileSync(stateFile, "utf-8").trim();
}

function apiBase(): string {
  return process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:80";
}

const bypassHeaders = {
  "x-dev-bypass": DEV_BYPASS,
  "x-tenant-slug": TENANT_SLUG,
};

async function apiRequest(
  method: "POST" | "PATCH" | "DELETE",
  url: string,
  body?: unknown,
): Promise<Record<string, unknown> | undefined> {
  const response = await fetch(url, {
    method,
    headers: {
      ...bypassHeaders,
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (!response.ok) {
    throw new Error(`${method} ${url} → ${response.status}: ${await response.text()}`);
  }
  if (response.status === 204) return undefined;
  return response.json() as Promise<Record<string, unknown>>;
}

async function createScoutingRecord(): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const response = await apiRequest(
    "POST",
    `${apiBase()}/api/farms/${FARM_ID}/vineyard-scouting`,
    {
      scoutDate: today,
      scoutedBy: SCOUT_NAME,
      downyMildewPressure: 0,
      powderyMildewPressure: 0,
      botrytisPressure: 0,
      phomopsisPressure: 0,
      leafhopperPressure: 0,
      spiderMitePressure: 0,
    },
  );
  const record = response?.record as { id?: number } | undefined;
  if (!record?.id) throw new Error("Scouting record creation returned no id");
  return record.id;
}

async function attachPhoto(scoutingId: number): Promise<number> {
  const response = await apiRequest(
    "POST",
    `${apiBase()}/api/farms/${FARM_ID}/vineyard-scouting/${scoutingId}/photos`,
    {
      objectPath: `/objects/e2e-scouting-csv-${Date.now()}.jpg`,
      fileName: "e2e-scouting-csv.jpg",
    },
  );
  const photo = response?.photo as { id?: number } | undefined;
  if (!photo?.id) throw new Error("Scouting photo creation returned no id");
  return photo.id;
}

async function deleteScoutingRecord(scoutingId: number) {
  await apiRequest(
    "DELETE",
    `${apiBase()}/api/farms/${FARM_ID}/vineyard-scouting/${scoutingId}`,
  );
}

async function navigateToScoutingTab(page: Page) {
  await page.goto("/dashboard/");
  await page.waitForLoadState("networkidle");

  await page.evaluate(([slug, farmId]) => {
    localStorage.setItem("farmtrac_tenantSlug", slug);
    localStorage.setItem(
      "farmtrac-storage",
      JSON.stringify({ state: { tenantSlug: slug, farmId }, version: 0 }),
    );
  }, [TENANT_SLUG, FARM_ID] as [string, number]);

  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("link", { name: /viticulture/i }).click();
  await page.waitForLoadState("networkidle");

  const scoutingTab = page.getByRole("button", { name: /scouting/i });
  if (await scoutingTab.isVisible({ timeout: 3_000 })) {
    await scoutingTab.click();
  }

  await page.reload({ waitUntil: "networkidle" });
  const scoutingTabAfterReload = page.getByRole("button", { name: /scouting/i });
  if (await scoutingTabAfterReload.isVisible({ timeout: 3_000 })) {
    await scoutingTabAfterReload.click();
  }
}

/**
 * Parse the downloaded CSV as a complete CSV document. The export can include
 * a quoted unlinked-record warning before the detailed header, so locating the
 * header by its labels is safer than relying on a fixed line number.
 */
function parseCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < csv.length; index++) {
    const character = csv[index];
    if (quoted) {
      if (character === '"' && csv[index + 1] === '"') {
        field += '"';
        index++;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (field || row.length) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }
  return rows;
}

async function downloadScoutingCounts(page: Page) {
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV" }).click();
  const download = await downloadPromise;
  const filePath = await download.path();
  if (!filePath) throw new Error("CSV download did not produce a local file");

  const rows = parseCsv(fs.readFileSync(filePath, "utf-8").replace(/^\uFEFF/, ""));
  const headerIndex = rows.findIndex(
    row => row[0] === "Scout Date" && row.includes("Photos") && row.includes("Captioned Photos"),
  );
  if (headerIndex < 0) throw new Error("Detailed scouting header not found in CSV");

  const header = rows[headerIndex];
  const recordRow = rows.slice(headerIndex + 1).find(row => row[3] === SCOUT_NAME);
  if (!recordRow) throw new Error(`Scouting record ${SCOUT_NAME} not found in CSV`);

  const photoIndex = header.indexOf("Photos");
  const captionIndex = header.indexOf("Captioned Photos");
  return {
    photoCount: recordRow[photoIndex],
    captionCount: recordRow[captionIndex],
  };
}

test.describe("Disease Scouting CSV photo and caption counts", () => {
  test("refreshes photoCount and captionCount after add, caption, and delete", async ({ page }) => {
    await signInDashboard(page);

    const scoutingId = await createScoutingRecord();
    const consoleErrors: string[] = [];
    const failedScoutingRequests: string[] = [];
    page.on("console", message => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("response", response => {
      if (
        response.status() >= 400
        && response.url().includes(`/api/farms/${FARM_ID}/vineyard-scouting`)
      ) {
        failedScoutingRequests.push(`${response.status()} ${response.request().method()} ${response.url()}`);
      }
    });

    try {
      await attachPhoto(scoutingId);
      await navigateToScoutingTab(page);

      const row = page.locator("tr", { hasText: SCOUT_NAME });
      await expect(row).toBeVisible({ timeout: 15_000 });
      expect(
        await downloadScoutingCounts(page),
        "CSV must show one photo and no captions after adding a photo",
      ).toEqual({ photoCount: "1", captionCount: "0" });

      await row.locator("td").last().getByRole("button").first().click();
      const viewDialog = page.locator('[role="dialog"]').filter({ hasText: "Disease Scouting Record" });
      await expect(viewDialog).toBeVisible();
      await viewDialog.locator("button").filter({ has: page.locator("img") }).click();

      const photoDialog = page.locator('[role="dialog"]').filter({ hasText: "Scouting Photos" });
      await expect(photoDialog).toBeVisible();
      await photoDialog.getByRole("button", { name: "Edit caption" }).click({ force: true });
      await photoDialog.getByPlaceholder("Add a caption…").fill("Inspect canopy");
      await photoDialog.getByRole("button", { name: "Save" }).click();
      await expect(photoDialog.getByText("Inspect canopy")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(photoDialog).not.toBeVisible();
      await viewDialog.getByRole("button", { name: "Close" }).click();
      await expect(viewDialog).not.toBeVisible();

      await row.locator("td").last().getByRole("button").first().click();
      await expect(viewDialog).toBeVisible();
      await expect(
        viewDialog.getByText("Inspect canopy"),
        "Saved caption must remain beneath the thumbnail after reopening the record",
      ).toBeVisible();
      await viewDialog.getByRole("button", { name: "Close" }).click();
      await expect(viewDialog).not.toBeVisible();

      expect(
        await downloadScoutingCounts(page),
        "CSV must show one photo and one caption immediately after saving a caption",
      ).toEqual({ photoCount: "1", captionCount: "1" });

      await row.getByTitle("View photos").click();
      await expect(photoDialog).toBeVisible();
      await photoDialog.getByRole("button", { name: "Delete photo" }).click({ force: true });
      const confirmDialog = page.locator('[role="alertdialog"], [role="dialog"]').last();
      await expect(confirmDialog.getByText("Delete photo?")).toBeVisible();
      await confirmDialog.getByRole("button", { name: "Delete photo" }).click();
      await expect(photoDialog.getByText("No photos attached to this record.")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(photoDialog).not.toBeVisible();

      expect(
        await downloadScoutingCounts(page),
        "CSV must show zero photos and zero captions immediately after deleting the photo",
      ).toEqual({ photoCount: "0", captionCount: "0" });

      expect(consoleErrors, "Scouting caption flow must not log browser console errors").toEqual([]);
      expect(failedScoutingRequests, "Scouting caption flow API requests must succeed").toEqual([]);
    } finally {
      await deleteScoutingRecord(scoutingId);
    }
  });
});
