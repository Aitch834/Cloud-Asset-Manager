import {
  openVesselRegister as openSharedVesselRegister,
  VESSEL_REGISTER_FARM_ID as FARM_ID,
  VESSEL_REGISTER_TENANT_SLUG as TENANT_SLUG,
} from "./vessel-register";
/**
 * E2E: VesselRegisterTab — "Never cleaned" barrel filter.
 *
 * The filter is derived entirely from each vessel's clean_count. Seed one
 * barrel with no cleaning records and one with a cleaning record, then verify
 * that the alert chip filters the table and toggles back to the full list.
 * Also lock down the combined Never cleaned + cellar-zone shortcut.
 */

import { expect, test } from "@playwright/test";

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const RUN_TAG = `E2E-1865-${Date.now()}`;

type ApiRecord = Record<string, unknown>;

function apiBase() {
  return process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:80";
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
  cellarZone?: string,
  vesselType = "barrel",
  status = "active",
): Promise<number> {
  const body = await devFetch(`${apiBase()}/api/farms/${FARM_ID}/winery-vessels`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      vesselRef,
      vesselType,
      capacityLitres: 225,
      cellarZone,
      status,
    }),
  });
  return Number((body.record as ApiRecord).id);
}

async function createFill(vesselId: number): Promise<number> {
  const body = await devFetch(
    `${apiBase()}/api/farms/${FARM_ID}/winery-vessels/${vesselId}/fills`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fillNumber: 1,
        fillDate: new Date().toISOString().slice(0, 10),
        wineName: `${RUN_TAG} wine`,
        operatorName: RUN_TAG,
      }),
    },
  );
  return Number((body.record as ApiRecord).id);
}

async function createCleaning(vesselId: number): Promise<number> {
  const body = await devFetch(
    `${apiBase()}/api/farms/${FARM_ID}/winery-vessels/${vesselId}/cleans`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cleanDate: new Date().toISOString().slice(0, 10),
        cleanType: "rinse",
        operatorName: RUN_TAG,
      }),
    },
  );
  return Number((body.record as ApiRecord).id);
}

async function deleteBarrel(vesselId: number): Promise<void> {
  await devFetch(`${apiBase()}/api/farms/${FARM_ID}/winery-vessels/${vesselId}`, {
    method: "DELETE",
  });
}

async function waitForCleanCounts(
  expected: Map<string, number>,
): Promise<void> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const body = await devFetch(
      `${apiBase()}/api/farms/${FARM_ID}/winery-vessels`,
    );
    const records = (body.records ?? []) as ApiRecord[];
    const matches = [...expected].every(([ref, cleanCount]) => {
      const record = records.find(candidate => candidate.vessel_ref === ref);
      return record && Number(record.clean_count ?? 0) === cleanCount;
    });
    if (matches) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error("Seeded barrels were not readable with the expected clean counts");
}

async function waitForFillCounts(
  expected: Map<string, number>,
): Promise<void> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const body = await devFetch(
      `${apiBase()}/api/farms/${FARM_ID}/winery-vessels`,
    );
    const records = (body.records ?? []) as ApiRecord[];
    const matches = [...expected].every(([ref, fillCount]) => {
      const record = records.find(candidate => candidate.vessel_ref === ref);
      return record && Number(record.fill_count ?? 0) === fillCount;
    });
    if (matches) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error("Seeded vessels were not readable with the expected fill counts");
}

async function openVesselRegister(
  page: import("@playwright/test").Page,
  visibleRefs?: string[],
): Promise<void> {
  if (visibleRefs) {
    await page.route("**/api/farms/5/winery-vessels*", async route => {
      const response = await route.fetch();
      const body = await response.json() as ApiRecord;
      const records = ((body.records ?? []) as ApiRecord[]).filter(record =>
        visibleRefs.includes(String(record.vessel_ref)),
      );
      await route.fulfill({ response, json: { ...body, records } });
    });
  }

  await openSharedVesselRegister(page, {
    preparePage: async currentPage => {
      await currentPage.evaluate(farmId => {
        for (const filter of [
          "zone",
          "fill-tier",
          "alert-flag",
          "is-full",
        ]) {
          localStorage.removeItem(`vessel-register-${filter}-filter-${farmId}`);
        }
      }, FARM_ID);
    },
  });
}

test.describe("VesselRegisterTab — never-cleaned filter", () => {
  test("counts and filters active no-fill barrel variants", async ({ page }) => {
    const barrelRef = `${RUN_TAG}-barrel-no-fill`;
    const oakBarrelRef = `${RUN_TAG}-oak-barrel-no-fill`;
    const barriqueRef = `${RUN_TAG}-barrique-no-fill`;
    const filledRef = `${RUN_TAG}-filled`;
    const tankRef = `${RUN_TAG}-tank-no-fill`;
    const inactiveRef = `${RUN_TAG}-inactive-no-fill`;
    const visibleRefs = [
      barrelRef,
      oakBarrelRef,
      barriqueRef,
      filledRef,
      tankRef,
      inactiveRef,
    ];
    const vesselIds: number[] = [];

    try {
      vesselIds.push(await createBarrel(barrelRef));
      vesselIds.push(await createBarrel(oakBarrelRef, undefined, "oak-barrel"));
      vesselIds.push(await createBarrel(barriqueRef, undefined, "French barrique"));
      const filledId = await createBarrel(filledRef, undefined, "barrel");
      vesselIds.push(filledId);
      vesselIds.push(await createBarrel(tankRef, undefined, "tank"));
      vesselIds.push(await createBarrel(inactiveRef, undefined, "oak-barrel", "retired"));
      await createFill(filledId);
      await waitForFillCounts(
        new Map([
          [barrelRef, 0],
          [oakBarrelRef, 0],
          [barriqueRef, 0],
          [filledRef, 1],
          [tankRef, 0],
          [inactiveRef, 0],
        ]),
      );

      await openVesselRegister(page, visibleRefs);

      const noFillsChip = page.getByRole("button", {
        name: "No fills — no records 3",
        exact: true,
      });
      await expect(noFillsChip).toBeVisible();
      await noFillsChip.click();

      await expect(page.locator("tbody tr", { hasText: barrelRef })).toBeVisible();
      await expect(page.locator("tbody tr", { hasText: oakBarrelRef })).toBeVisible();
      await expect(page.locator("tbody tr", { hasText: barriqueRef })).toBeVisible();
      await expect(page.locator("tbody tr", { hasText: filledRef })).toHaveCount(0);
      await expect(page.locator("tbody tr", { hasText: tankRef })).toHaveCount(0);
      await expect(page.locator("tbody tr", { hasText: inactiveRef })).toHaveCount(0);
      await expect(page.locator("p", {
        hasText: "Showing barrels flagged as no fills — no records",
      })).toBeVisible();

      await page.getByRole("button", { name: "Show all", exact: true }).click();
      await expect(page.locator("tbody tr", { hasText: filledRef })).toBeVisible();
      await expect(page.locator("tbody tr", { hasText: tankRef })).toBeVisible();
      await expect(page.locator("tbody tr", { hasText: inactiveRef })).toBeVisible();
    } finally {
      for (const vesselId of vesselIds) {
        await deleteBarrel(vesselId).catch(() => {});
      }
    }
  });

  test("hides the no-fills chip when no active barrel lacks fill history", async ({
    page,
  }) => {
    const filledRef = `${RUN_TAG}-only-filled-barrel`;
    const tankRef = `${RUN_TAG}-only-empty-tank`;
    const inactiveRef = `${RUN_TAG}-only-inactive-barrel`;
    const visibleRefs = [filledRef, tankRef, inactiveRef];
    const vesselIds: number[] = [];

    try {
      const filledId = await createBarrel(filledRef, undefined, "oak-barrel");
      vesselIds.push(filledId);
      vesselIds.push(await createBarrel(tankRef, undefined, "tank"));
      vesselIds.push(await createBarrel(inactiveRef, undefined, "barrique", "retired"));
      await createFill(filledId);
      await waitForFillCounts(new Map([
        [filledRef, 1],
        [tankRef, 0],
        [inactiveRef, 0],
      ]));

      await openVesselRegister(page, visibleRefs);

      await expect(page.getByRole("button", {
        name: /No fills — (?:no records|cooperage only)/,
      })).toHaveCount(0);
      await expect(page.locator("tbody tr", { hasText: filledRef })).toBeVisible();
    } finally {
      for (const vesselId of vesselIds) {
        await deleteBarrel(vesselId).catch(() => {});
      }
    }
  });

  test("filters to never-cleaned barrels and restores the full list", async ({
    page,
  }) => {
    const uncleanRef = `${RUN_TAG}-uncleaned`;
    const cleanedRef = `${RUN_TAG}-cleaned`;
    const vesselIds: number[] = [];

    try {
      const uncleanedId = await createBarrel(uncleanRef);
      vesselIds.push(uncleanedId);
      const cleanedId = await createBarrel(cleanedRef);
      vesselIds.push(cleanedId);
      await createCleaning(cleanedId);
      await waitForCleanCounts(
        new Map([
          [uncleanRef, 0],
          [cleanedRef, 1],
        ]),
      );

      await openVesselRegister(page);

      const uncleanedRow = page.locator("tbody tr", { hasText: uncleanRef });
      const cleanedRow = page.locator("tbody tr", { hasText: cleanedRef });
      await expect(uncleanedRow).toBeVisible({ timeout: 20_000 });
      await expect(cleanedRow).toBeVisible({ timeout: 20_000 });

      const neverCleanedChip = page.getByRole("button", {
        name: /Never cleaned \d+/,
      });
      await expect(neverCleanedChip).toBeVisible();

      await neverCleanedChip.click();
      await expect(uncleanedRow).toBeVisible();
      await expect(cleanedRow).toHaveCount(0);

      await neverCleanedChip.click();
      await expect(uncleanedRow).toBeVisible();
      await expect(cleanedRow).toBeVisible();
    } finally {
      for (const vesselId of vesselIds) {
        await deleteBarrel(vesselId).catch(() => {});
      }
    }
  });

  test("keeps Never cleaned and one zone selected together", async ({ page }) => {
    const zoneA = `${RUN_TAG}-zone-a`;
    const zoneB = `${RUN_TAG}-zone-b`;
    const neverCleanedARef = `${RUN_TAG}-never-a`;
    const neverCleanedBRef = `${RUN_TAG}-never-b`;
    const cleanedARef = `${RUN_TAG}-cleaned-a`;
    const visibleRefs = [neverCleanedARef, neverCleanedBRef, cleanedARef];
    const vesselIds: number[] = [];

    try {
      vesselIds.push(await createBarrel(neverCleanedARef, zoneA));
      vesselIds.push(await createBarrel(neverCleanedBRef, zoneB));
      const cleanedAId = await createBarrel(cleanedARef, zoneA);
      vesselIds.push(cleanedAId);
      await createCleaning(cleanedAId);
      await waitForCleanCounts(
        new Map([
          [neverCleanedARef, 0],
          [neverCleanedBRef, 0],
          [cleanedARef, 1],
        ]),
      );

      await openVesselRegister(page, visibleRefs);

      const neverCleanedChip = page.getByRole("button", {
        name: /Never cleaned \d+/,
      });
      await neverCleanedChip.click();

      const zoneAChip = page.getByRole("button", {
        name: new RegExp(`^${zoneA} \\d+ never cleaned$`),
      });
      await zoneAChip.click();

      await expect(page.locator("tbody tr", { hasText: neverCleanedARef })).toBeVisible();
      await expect(page.locator("tbody tr", { hasText: neverCleanedBRef })).toHaveCount(0);
      await expect(page.locator("tbody tr", { hasText: cleanedARef })).toHaveCount(0);

      await expect(neverCleanedChip).toHaveClass(/ring-2/);
      await expect(zoneAChip).toHaveClass(/ring-2/);
      await expect(page.locator("p", {
        hasText: `Showing barrels in ${zoneA} · flagged as never cleaned`,
      })).toBeVisible();
    } finally {
      for (const vesselId of vesselIds) {
        await deleteBarrel(vesselId).catch(() => {});
      }
    }
  });
});
