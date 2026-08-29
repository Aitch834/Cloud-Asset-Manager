import { expect, test } from "@playwright/test";
import { setupClerkTestingToken } from "@clerk/testing/playwright";
import * as fs from "node:fs";
import * as path from "node:path";

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5;
const YEAR = new Date().getFullYear();
const OFFER_PREFIX = `winegb-offer:${FARM_ID}:`;

type Submission = { submitted: boolean; submittedAt: string | null };

function apiBase() {
  return process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:80";
}

function getTestUserId(): string {
  const stateFile = path.join(__dirname, ".test-user-id");
  if (!fs.existsSync(stateFile)) {
    throw new Error("global-setup did not run — .test-user-id missing");
  }
  return fs.readFileSync(stateFile, "utf8").trim();
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
}

async function deleteObservationsByNote(notes: string[]) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const data = await devFetch(`${apiBase()}/api/farms/${FARM_ID}/vineyard-phenology`);
    const records = (data.records ?? data.data ?? []) as Array<Record<string, unknown>>;
    const matches = records.filter(record => notes.includes(String(record.notes ?? "")));
    if (matches.length === notes.length) {
      await Promise.all(
        matches.map(record =>
          devFetch(
            `${apiBase()}/api/farms/${FARM_ID}/vineyard-phenology/${Number(record.id)}`,
            { method: "DELETE" },
          ),
        ),
      );
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 150));
  }
}

async function openPhenology(page: import("@playwright/test").Page) {
  await page.goto("/dashboard/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(
    ([slug, farmId]) => {
      localStorage.setItem("farmtrac_tenantSlug", slug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug: slug, farmId }, version: 0 }),
      );
      localStorage.setItem(`viticulture-active-tab-${farmId}`, "phenology");
    },
    [TENANT_SLUG, FARM_ID] as [string, number],
  );
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Viticulture", exact: true }).first().click();
  await expect(page.getByText("Phenology (BBCH Growth Stages)", { exact: true })).toBeVisible({
    timeout: 20_000,
  });
}

async function saveObservation(
  page: import("@playwright/test").Page,
  stage: "53" | "71",
  note: string,
) {
  await page.getByRole("button", { name: "Add Observation" }).click();
  const dialog = page.getByRole("dialog", { name: "Add Phenology Observation" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("combobox").nth(1).click();
  await page.getByRole("option", { name: new RegExp(`^${stage}\\s+—`) }).click();
  await dialog.getByRole("textbox").last().fill(note);
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(dialog).toBeHidden();
}

test("keeps the Fruit Set WineGB link transient and independently dismissible", async ({
  page,
}) => {
  const runTag = Date.now();
  const fruitSetNote = `E2E-FRUIT-SET-${runTag}`;
  const floweringNote = `E2E-FLOWERING-${runTag}`;
  const originalSubmissions = await getSubmissions();
  await setSubmission("flowering", false);

  await setupClerkTestingToken({ page, userId: getTestUserId() });
  await openPhenology(page);

  const storedOffersBefore = await page.evaluate(prefix => {
    const offers: Record<string, string> = {};
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key?.startsWith(prefix)) offers[key] = localStorage.getItem(key) ?? "";
    }
    return offers;
  }, OFFER_PREFIX);

  try {
    await saveObservation(page, "71", fruitSetNote);

    const fruitSetBanner = page
      .getByText("WineGB Fruit Set Survey", { exact: true })
      .locator("..")
      .locator("..");
    await expect(fruitSetBanner).toBeVisible();
    await expect(
      fruitSetBanner.getByRole("link", { name: "Submit to WineGB →", exact: true }),
    ).toHaveAttribute("href", "https://winegb.co.uk/production/vineyards-wineries/");

    await expect(
      page.evaluate(prefix => {
        const keys: string[] = [];
        for (let index = 0; index < localStorage.length; index += 1) {
          const key = localStorage.key(index);
          if (key?.startsWith(prefix)) keys.push(key);
        }
        return keys.sort();
      }, OFFER_PREFIX),
    ).resolves.toEqual(Object.keys(storedOffersBefore).sort());

    await saveObservation(page, "53", floweringNote);
    await expect(page.getByText("WineGB Flowering Survey", { exact: true })).toBeVisible();

    await fruitSetBanner.getByRole("button", { name: "Dismiss", exact: true }).click();
    await expect(page.getByText("WineGB Fruit Set Survey", { exact: true })).toHaveCount(0);
    await expect(page.getByText("WineGB Flowering Survey", { exact: true })).toBeVisible();
  } finally {
    await deleteObservationsByNote([fruitSetNote, floweringNote]).catch(() => {});
    await setSubmission(
      "flowering",
      originalSubmissions.flowering?.submitted ?? false,
    ).catch(() => {});
    await page
      .evaluate(
        ([prefix, offers]) => {
          const currentKeys: string[] = [];
          for (let index = 0; index < localStorage.length; index += 1) {
            const key = localStorage.key(index);
            if (key?.startsWith(prefix)) currentKeys.push(key);
          }
          currentKeys.forEach(key => localStorage.removeItem(key));
          Object.entries(offers).forEach(([key, value]) => localStorage.setItem(key, value));
        },
        [OFFER_PREFIX, storedOffersBefore] as [string, Record<string, string>],
      )
      .catch(() => {});
  }
});