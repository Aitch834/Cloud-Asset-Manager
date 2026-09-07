/**
 * E2E: the Financial Records enterprise filter includes blank enterprises.
 *
 * This test seeds one untagged and one tagged transaction with unique names,
 * selects "Untagged", and verifies the persisted filter after a reload.
 */

import { expect, test } from "@playwright/test";
import { clerk } from "@clerk/testing/playwright";
import * as fs from "node:fs";

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5;
const YEAR = new Date().getFullYear();

function apiBase() {
  return process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:80";
}

function getTestUserEmail(): string {
  const stateFile = new URL(".test-user-email", import.meta.url);
  if (!fs.existsSync(stateFile)) {
    throw new Error("global-setup did not run — .test-user-email missing");
  }
  return fs.readFileSync(stateFile, "utf8").trim();
}

async function devFetch<T = Record<string, unknown>>(
  url: string,
  init: RequestInit = {},
): Promise<T> {
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
  return response.json() as Promise<T>;
}

async function createTransaction(description: string, enterprise?: string): Promise<number> {
  const data = await devFetch<{ record: { id: number } }>(
    `${apiBase()}/api/farms/${FARM_ID}/financial-transactions`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transactionDate: `${YEAR}-06-15T12:00:00.000Z`,
        transactionType: "expense",
        category: "Other Expenses",
        description,
        amountPence: 12345,
        ...(enterprise ? { enterprise } : {}),
      }),
    },
  );
  return data.record.id;
}

async function openFinancialTransactions(page: import("@playwright/test").Page) {
  await page.goto("/dashboard/");
  await clerk.signIn({ page, emailAddress: getTestUserEmail() });

  await page.evaluate(
    ([slug, farmId, year]) => {
      localStorage.setItem("farmtrac_tenantSlug", slug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug: slug, farmId }, version: 0 }),
      );
      localStorage.setItem(`financial-active-tab-${farmId}`, "transactions");
      localStorage.setItem(`financial-transactions-year-filter-${farmId}`, year);
      localStorage.setItem(`financial-transactions-type-filter-${farmId}`, "all");
      localStorage.setItem(`financial-transactions-source-filter-${farmId}`, "all");
      localStorage.setItem(`financial-transactions-enterprise-filter-${farmId}`, "all");
    },
    [TENANT_SLUG, FARM_ID, String(YEAR)] as [string, number, string],
  );

  await page.goto("/dashboard/financial", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Financial Records", exact: true })).toBeVisible({
    timeout: 15_000,
  });
}

test("Untagged shows only blank-enterprise transactions and survives refresh", async ({ page }) => {
  const runTag = `${Date.now()}`;
  const untaggedDescription = `E2E untagged transaction ${runTag}`;
  const taggedDescription = `E2E tagged transaction ${runTag}`;
  const transactionIds: number[] = [];
  const consoleErrors: string[] = [];

  page.on("console", message => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  try {
    transactionIds.push(await createTransaction(untaggedDescription));
    transactionIds.push(await createTransaction(taggedDescription, "Arable"));

    await openFinancialTransactions(page);
    await expect(page.getByText(untaggedDescription, { exact: true })).toBeVisible();
    await expect(page.getByText(taggedDescription, { exact: true })).toBeVisible();

    const enterpriseFilter = page
      .getByRole("combobox")
      .filter({ hasText: "All Enterprises" });
    await enterpriseFilter.click();
    await page.getByRole("option", { name: "Untagged", exact: true }).click();

    await expect(page.getByText(untaggedDescription, { exact: true })).toBeVisible();
    await expect(page.getByText(taggedDescription, { exact: true })).toHaveCount(0);
    await expect(
      page.getByRole("combobox").filter({ hasText: "Untagged" }),
    ).toBeVisible();

    await page.reload({ waitUntil: "networkidle" });

    await expect(
      page.getByRole("combobox").filter({ hasText: "Untagged" }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(untaggedDescription, { exact: true })).toBeVisible();
    await expect(page.getByText(taggedDescription, { exact: true })).toHaveCount(0);
    expect(consoleErrors).toEqual([]);
  } finally {
    await Promise.all(
      transactionIds.map(id =>
        devFetch(
          `${apiBase()}/api/farms/${FARM_ID}/financial-transactions/${id}`,
          { method: "DELETE" },
        ).catch(() => {}),
      ),
    );
  }
});