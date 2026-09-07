import { signInDashboard } from "./auth";
/**
 * E2E: BulkTankTab — milk statement badges on populated collection lists.
 *
 * Seed the collections through the JSON API so this check does not depend on
 * the dashboard's collection-entry form. The rows are deleted in finally
 * after the visible badge and statement dialog checks complete.
 */

import { expect, test } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5;
const RUN_TAG = `E2E-1930-${Date.now()}`;

type ApiRecord = Record<string, unknown>;
type CollectionResponse = { collection?: { id?: number }; collections?: ApiRecord[] };

function apiBase(): string {
  return process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:80";
}

function getTestUserId(): string {
  const stateFile = path.join(__dirname, process.env.PLAYWRIGHT_E2E_USER_ID_FILE!);
  if (!fs.existsSync(stateFile)) {
    throw new Error("global-setup did not run — .test-user-id missing");
  }
  return fs.readFileSync(stateFile, "utf8").trim();
}

async function devFetch(
  url: string,
  init: RequestInit = {},
): Promise<CollectionResponse> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init.headers as Record<string, string> | undefined),
      "x-dev-bypass": DEV_BYPASS,
      "x-tenant-slug": TENANT_SLUG,
    },
  });
  if (!response.ok) {
    throw new Error(
      `${init.method ?? "GET"} ${url} → ${response.status}: ${await response.text()}`,
    );
  }
  return response.json() as Promise<CollectionResponse>;
}

function dateDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
}

async function createCollection(body: ApiRecord): Promise<number> {
  const response = await devFetch(
    `${apiBase()}/api/farms/${FARM_ID}/dairy/milk-collections`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  const id = Number(response.collection?.id);
  if (!id) throw new Error("Milk collection creation returned no id");
  return id;
}

async function deleteCollection(id: number): Promise<void> {
  await devFetch(
    `${apiBase()}/api/farms/${FARM_ID}/dairy/milk-collections/${id}`,
    { method: "DELETE" },
  );
}

async function openBulkTank(page: import("@playwright/test").Page): Promise<void> {
  await signInDashboard(page);
  await page.goto("/dashboard/");
  await page.waitForLoadState("networkidle");

  await page.evaluate(([slug, farmId]) => {
    localStorage.setItem("farmtrac_tenantSlug", slug);
    localStorage.setItem(
      "farmtrac-storage",
      JSON.stringify({ state: { tenantSlug: slug, farmId }, version: 0 }),
    );
    localStorage.setItem(`dairy-active-tab-${farmId}`, "tank");
  }, [TENANT_SLUG, FARM_ID] as [string, number]);

  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Dairy Records", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Dairy Records", exact: true }),
  ).toBeVisible({ timeout: 20_000 });

  const bulkTankTab = page.getByRole("button", { name: "Bulk Tank", exact: true });
  if (await bulkTankTab.isVisible()) {
    await bulkTankTab.click();
  }
  await expect(
    page.getByText(/Milk Collections \(2\)/, { exact: true }),
  ).toBeVisible({ timeout: 20_000 });
}

test("distinguishes awaiting and received statements and opens the receipt dialog", async ({
  page,
}) => {
  const createdIds: number[] = [];
  const pendingBuyer = `${RUN_TAG} pending`;
  const receivedBuyer = `${RUN_TAG} received`;

  try {
    createdIds.push(await createCollection({
      collectionDate: dateDaysAgo(1),
      volumeCollectedLitres: "8200",
      milkBuyer: pendingBuyer,
      collectionRef: `${RUN_TAG}-pending`,
    }));
    createdIds.push(await createCollection({
      collectionDate: dateDaysAgo(2),
      volumeCollectedLitres: "8150",
      milkBuyer: receivedBuyer,
      collectionRef: `${RUN_TAG}-received`,
      pencePerLitre: "36.25",
    }));

    await openBulkTank(page);

    const pendingRow = page.locator("div.px-4.py-3", { hasText: pendingBuyer });
    const receivedRow = page.locator("div.px-4.py-3", { hasText: receivedBuyer });
    await expect(pendingRow).toContainText("Awaiting statement");
    await expect(receivedRow).toContainText("Statement received");
    await expect(pendingRow).not.toContainText("Statement received");
    await expect(receivedRow).not.toContainText("Awaiting statement");

    await pendingRow.getByTitle("Enter milk statement details").click();
    const statementDialog = page.getByRole("dialog");
    await expect(statementDialog).toBeVisible();
    await expect(
      statementDialog.getByRole("heading", {
        name: "Milk Statement Details",
        exact: true,
      }),
    ).toBeVisible();
    await statementDialog.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(statementDialog).toBeHidden();

    await receivedRow.getByTitle("Enter milk statement details").click();
    await expect(
      page.getByRole("dialog").getByRole("heading", {
        name: "Milk Statement Details",
        exact: true,
      }),
    ).toBeVisible();
  } finally {
    const cleanup = await Promise.allSettled(
      createdIds.map((id) => deleteCollection(id)),
    );
    const failedCleanup = cleanup.find(
      (result): result is PromiseRejectedResult => result.status === "rejected",
    );
    if (failedCleanup) throw failedCleanup.reason;

    const remaining = await devFetch(
      `${apiBase()}/api/farms/${FARM_ID}/dairy/milk-collections`,
    );
    const remainingRows = remaining.collections ?? [];
    expect(
      remainingRows.some((row) =>
        row.id === createdIds[0] || row.id === createdIds[1],
      ),
    ).toBe(false);
  }
});
