/**
 * E2E: WineGB overview nudge persistence and reset behaviour.
 *
 * The overview nudge stores its expanded/collapsed state per farm and year.
 * Its collapsed snapshot also records which surveys were pending. If a survey
 * is later un-ticked through the API, the stored state must be cleared so the
 * nudge returns to its default, collapsed-but-visible state.
 */

import { test, expect } from "@playwright/test";
import { setupClerkTestingToken } from "@clerk/testing/playwright";
import * as fs from "fs";
import * as path from "path";

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5;
const YEAR = new Date().getFullYear();
const NUDGE_STORAGE_KEY = `winegb-nudge-${FARM_ID}-${YEAR}`;

type Submission = { submitted: boolean; submittedAt: string | null };

function apiBase() {
  return process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:80";
}

function getTestUserId(): string {
  const stateFile = path.join(__dirname, process.env.PLAYWRIGHT_E2E_USER_ID_FILE!);
  if (!fs.existsSync(stateFile)) {
    throw new Error("global-setup did not run — .test-user-id missing");
  }
  return fs.readFileSync(stateFile, "utf-8").trim();
}

async function devFetch(url: string, init: RequestInit = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init.headers as Record<string, string> | undefined),
      "x-dev-bypass": DEV_BYPASS,
      "x-tenant-slug": TENANT_SLUG,
    },
  });
  if (!response.ok) {
    throw new Error(`${init.method ?? "GET"} ${url} → ${response.status}: ${await response.text()}`);
  }
  return response.json() as Promise<Record<string, unknown>>;
}

async function getSubmissions(): Promise<Record<string, Submission>> {
  const data = await devFetch(
    `${apiBase()}/api/farms/${FARM_ID}/winegb-submissions?year=${YEAR}`,
  );
  return (data.submissions ?? {}) as Record<string, Submission>;
}

async function setSubmission(surveyKey: string, submitted: boolean) {
  await devFetch(`${apiBase()}/api/farms/${FARM_ID}/winegb-submissions/${surveyKey}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ submitted, year: YEAR }),
  });
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const current = await getSubmissions();
    if (current[surveyKey]?.submitted === submitted) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Survey ${surveyKey} did not reach submitted=${submitted}`);
}

async function openOverview(page: import("@playwright/test").Page) {
  await page.goto("/dashboard/");
  await page.waitForLoadState("networkidle");

  await page.evaluate(([slug, farmId, storageKey]) => {
    localStorage.setItem("farmtrac_tenantSlug", slug);
    localStorage.setItem(
      "farmtrac-storage",
      JSON.stringify({ state: { tenantSlug: slug, farmId }, version: 0 }),
    );
    localStorage.setItem(`viticulture-active-tab-${farmId}`, "overview");
    localStorage.removeItem(storageKey);
  }, [TENANT_SLUG, FARM_ID, NUDGE_STORAGE_KEY] as [string, number, string]);

  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Viticulture", exact: true }).first().click();
  await expect(page.getByText("Active Blocks", { exact: true })).toBeVisible({
    timeout: 20_000,
  });
  await expect(
    page.getByText(/^WineGB Seasonal Surveys — .* pending$/),
  ).toBeVisible({ timeout: 20_000 });
}

async function clearNudgeStorage(page: import("@playwright/test").Page) {
  await page.evaluate(storageKey => localStorage.removeItem(storageKey), NUDGE_STORAGE_KEY);
}

test.describe("WineGB overview nudge persistence", () => {
  test("stays collapsed but visible after an overview page refresh", async ({ page }) => {
    await setupClerkTestingToken({ page, userId: getTestUserId() });
    const before = await getSubmissions();
    await setSubmission("bud_burst", false);

    try {
      await openOverview(page);

      const expandButton = page.getByRole("button", { name: "Expand survey checklist" });
      await expect(expandButton).toBeVisible();
      await expandButton.click();
      await expect(
        page.getByRole("button", { name: "Mark Bud Burst as submitted" }),
      ).toBeVisible();

      await page.getByRole("button", { name: "Collapse survey checklist" }).click();
      await expect(
        page.getByRole("button", { name: "Mark Bud Burst as submitted" }),
      ).toHaveCount(0);

      await page.reload({ waitUntil: "networkidle" });

      await expect(page.getByText(/^WineGB Seasonal Surveys — .* pending$/)).toBeVisible({
        timeout: 20_000,
      });
      await expect(
        page.getByRole("button", { name: "Expand survey checklist" }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Mark Bud Burst as submitted" }),
      ).toHaveCount(0);
    } finally {
      await clearNudgeStorage(page).catch(() => {});
      await setSubmission("bud_burst", before.bud_burst?.submitted ?? false);
    }
  });

  test("resets to collapsed and visible when an API un-tick makes a survey pending", async ({
    page,
  }) => {
    await setupClerkTestingToken({ page, userId: getTestUserId() });
    const before = await getSubmissions();
    await setSubmission("bud_burst", true);
    await setSubmission("frost_damage", false);

    try {
      await openOverview(page);

      await page.getByRole("button", { name: "Expand survey checklist" }).click();
      await expect(
        page.getByRole("button", { name: "Unmark Bud Burst as submitted" }),
      ).toBeVisible();
      await page.getByRole("button", { name: "Collapse survey checklist" }).click();
      await expect(
        page.getByRole("button", { name: "Unmark Bud Burst as submitted" }),
      ).toHaveCount(0);

      // Simulate another session un-ticking a previously submitted survey.
      await setSubmission("bud_burst", false);
      await page.reload({ waitUntil: "networkidle" });

      await expect(page.getByText(/^WineGB Seasonal Surveys — .* pending$/)).toBeVisible({
        timeout: 20_000,
      });
      await expect(
        page.getByRole("button", { name: "Expand survey checklist" }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Mark Bud Burst as submitted" }),
      ).toHaveCount(0);
      await expect(
        page.evaluate(storageKey => localStorage.getItem(storageKey), NUDGE_STORAGE_KEY),
      ).resolves.toBeNull();
    } finally {
      await clearNudgeStorage(page).catch(() => {});
      await setSubmission("bud_burst", before.bud_burst?.submitted ?? false);
      await setSubmission("frost_damage", before.frost_damage?.submitted ?? false);
    }
  });
});