/**
 * E2E: VesselRegisterTab — ranked flagged-zone summary.
 *
 * The summary is derived from the live vessel list after applying the active
 * alert flag. Keep the browser fixture limited to the barrels created by each
 * test so unrelated data in the shared development farm cannot change the
 * number of flagged zones.
 */

import { expect, test } from "@playwright/test";
import { setupClerkTestingToken } from "@clerk/testing/playwright";
import * as fs from "node:fs";
import * as path from "node:path";

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5; // Highfield Vineyard — Viticulture is enabled
const RUN_TAG = `E2E-1880-${Date.now()}`;

type ApiRecord = Record<string, unknown>;

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

async function devFetch(
  url: string,
  init: RequestInit = {},
): Promise<ApiRecord> {
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
  return response.json() as Promise<ApiRecord>;
}

async function createBarrel(
  vesselRef: string,
  cellarZone: string,
): Promise<number> {
  const body = await devFetch(`${apiBase()}/api/farms/${FARM_ID}/winery-vessels`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      vesselRef,
      vesselType: "barrel",
      capacityLitres: 225,
      cellarZone,
      status: "active",
    }),
  });
  return Number((body.record as ApiRecord).id);
}

async function moveBarrel(
  vesselId: number,
  fromZone: string,
  toZone: string,
): Promise<void> {
  await devFetch(
    `${apiBase()}/api/farms/${FARM_ID}/winery-vessels/${vesselId}/movements`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        movedDate: new Date().toISOString().slice(0, 10),
        fromZone,
        toZone,
        reason: "Move within cellar",
        operatorName: RUN_TAG,
      }),
    },
  );
}

async function waitForVesselZones(
  expected: Map<string, string>,
): Promise<void> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const body = await devFetch(
      `${apiBase()}/api/farms/${FARM_ID}/winery-vessels`,
    );
    const records = (body.records ?? []) as ApiRecord[];
    const matches = [...expected].every(([ref, zone]) => {
      const record = records.find(candidate => candidate.vessel_ref === ref);
      return record && String(record.cellar_zone ?? "") === zone;
    });
    if (matches) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error("Seeded barrels were not readable in their expected zones");
}

async function deleteBarrel(vesselId: number): Promise<void> {
  await devFetch(`${apiBase()}/api/farms/${FARM_ID}/winery-vessels/${vesselId}`, {
    method: "DELETE",
  });
}

async function openVesselRegister(
  page: import("@playwright/test").Page,
  visibleRefs: string[],
): Promise<void> {
  await setupClerkTestingToken({ page, userId: getTestUserId() });

  // Use the real API response, but scope the browser fixture to this test's
  // barrels. This keeps absence assertions independent of shared farm data.
  await page.route("**/api/farms/5/winery-vessels*", async route => {
    const response = await route.fetch();
    const body = await response.json() as ApiRecord;
    const records = ((body.records ?? []) as ApiRecord[]).filter(record =>
      visibleRefs.includes(String(record.vessel_ref)),
    );
    await route.fulfill({ response, json: { ...body, records } });
  });

  await page.goto("/dashboard/");
  await page.waitForLoadState("networkidle");

  await page.evaluate(
    ([slug, farmId]) => {
      localStorage.setItem("farmtrac_tenantSlug", slug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug: slug, farmId }, version: 0 }),
      );
      localStorage.setItem(`viticulture-active-tab-${farmId}`, "winery-vessels");
      for (const filter of [
        "zone",
        "fill-tier",
        "alert-flag",
        "is-full",
      ]) {
        localStorage.removeItem(`vessel-register-${filter}-filter-${farmId}`);
      }
    },
    [TENANT_SLUG, FARM_ID] as [string, number],
  );

  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Viticulture", exact: true }).first().click();
  await page.waitForLoadState("networkidle");
  await expect(
    page.getByText("Tank & Vessel Register", { exact: true }),
  ).toBeVisible({ timeout: 20_000 });
}

function rankedSummary(page: import("@playwright/test").Page) {
  return page.locator("p.bg-amber-50.border-amber-200");
}

test.describe("VesselRegisterTab — ranked zone summary", () => {
  test("shows correct ranked counts after adding and moving flagged barrels", async ({
    page,
  }) => {
    const zoneA = `${RUN_TAG}-zone-a`;
    const zoneB = `${RUN_TAG}-zone-b`;
    const refs = [
      `${RUN_TAG}-a-1`,
      `${RUN_TAG}-a-2`,
      `${RUN_TAG}-moved`,
    ];
    const vesselIds: number[] = [];

    try {
      vesselIds.push(await createBarrel(refs[0], zoneA));
      vesselIds.push(await createBarrel(refs[1], zoneA));
      const movedId = await createBarrel(refs[2], zoneA);
      vesselIds.push(movedId);
      await waitForVesselZones(new Map(refs.map(ref => [ref, zoneA])));

      await moveBarrel(movedId, zoneA, zoneB);
      await waitForVesselZones(new Map([
        [refs[0], zoneA],
        [refs[1], zoneA],
        [refs[2], zoneB],
      ]));

      await openVesselRegister(page, refs);

      const neverCleanedFilter = page.getByRole("button", {
        name: /Never cleaned \d+/,
      });
      await expect(neverCleanedFilter).toBeVisible({ timeout: 20_000 });
      await neverCleanedFilter.click();

      await expect(rankedSummary(page)).toHaveText(`${zoneA} 2 · ${zoneB} 1`);

      // Clicking the active flag again clears it, so the ranked summary must
      // disappear with the filter rather than remaining stale.
      await neverCleanedFilter.click();
      await expect(rankedSummary(page)).toHaveCount(0);
    } finally {
      for (const vesselId of vesselIds) {
        await deleteBarrel(vesselId).catch(() => {});
      }
    }
  });

  test("hides the summary when flagged barrels are in only one zone", async ({
    page,
  }) => {
    const zone = `${RUN_TAG}-single-zone`;
    const refs = [`${RUN_TAG}-single-1`, `${RUN_TAG}-single-2`];
    const vesselIds: number[] = [];

    try {
      for (const ref of refs) {
        vesselIds.push(await createBarrel(ref, zone));
      }
      await waitForVesselZones(new Map(refs.map(ref => [ref, zone])));
      await openVesselRegister(page, refs);

      await page.getByRole("button", {
        name: /Never cleaned \d+/,
      }).click();

      await expect(rankedSummary(page)).toHaveCount(0);
    } finally {
      for (const vesselId of vesselIds) {
        await deleteBarrel(vesselId).catch(() => {});
      }
    }
  });

  test("hides the summary when no alert flag filter is active", async ({
    page,
  }) => {
    const zoneA = `${RUN_TAG}-unfiltered-a`;
    const zoneB = `${RUN_TAG}-unfiltered-b`;
    const refs = [`${RUN_TAG}-unfiltered-1`, `${RUN_TAG}-unfiltered-2`];
    const vesselIds: number[] = [];

    try {
      vesselIds.push(await createBarrel(refs[0], zoneA));
      vesselIds.push(await createBarrel(refs[1], zoneB));
      await waitForVesselZones(new Map([
        [refs[0], zoneA],
        [refs[1], zoneB],
      ]));
      await openVesselRegister(page, refs);

      await expect(rankedSummary(page)).toHaveCount(0);
    } finally {
      for (const vesselId of vesselIds) {
        await deleteBarrel(vesselId).catch(() => {});
      }
    }
  });
});