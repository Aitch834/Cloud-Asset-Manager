/**
 * E2E: VesselRegisterTab — neglected-barrel Last Activity sorting.
 *
 * The fixture deliberately covers every activity-source combination:
 * - no fill or maintenance record
 * - maintenance only
 * - fill only
 * - a rack-out date without a fill date
 *
 * The API and browser assertions together protect the null handling in the
 * GREATEST() projection and the UI's ascending "most neglected first" sort.
 */

import { expect, test } from "@playwright/test";
import { clerk } from "@clerk/testing/playwright";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const TENANT_SLUG = "oakfield-farms";
const FARM_ID = 5; // Highfield Vineyard — Viticulture is enabled
const RUN_TAG = `E2E-1970-${Date.now()}`;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

type ApiRecord = Record<string, unknown>;

function apiBase() {
  return process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:80";
}

function getTestUserEmail(): string {
  const emailFile = path.join(__dirname, process.env.PLAYWRIGHT_E2E_USER_EMAIL_FILE!);
  if (!fs.existsSync(emailFile)) {
    throw new Error("global-setup did not run — .test-user-email missing");
  }
  return fs.readFileSync(emailFile, "utf8").trim();
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

async function createBarrel(vesselRef: string): Promise<number> {
  const body = await devFetch(`${apiBase()}/api/farms/${FARM_ID}/winery-vessels`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      vesselRef,
      vesselType: "barrel",
      capacityLitres: 225,
      status: "active",
    }),
  });
  return Number((body.record as ApiRecord).id);
}

async function createFill(
  vesselId: number,
  fillDate: string | null,
  rackOutDate?: string,
): Promise<number> {
  const body = await devFetch(
    `${apiBase()}/api/farms/${FARM_ID}/winery-vessels/${vesselId}/fills`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fillNumber: 1,
        fillDate,
        rackOutDate,
        wineName: `${RUN_TAG} wine`,
      }),
    },
  );
  return Number((body.record as ApiRecord).id);
}

async function createMaintenance(
  vesselId: number,
  maintenanceDate: string,
): Promise<number> {
  const body = await devFetch(
    `${apiBase()}/api/farms/${FARM_ID}/winery-vessels/${vesselId}/maintenance`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        maintenanceDate,
        workType: "Inspection",
        cooperageName: `${RUN_TAG} cooperage`,
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

async function openVesselRegister(
  page: import("@playwright/test").Page,
  visibleRefs: string[],
): Promise<void> {
  // Keep the browser fixture limited to the records created by this test.
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
  await clerk.signIn({ page, emailAddress: getTestUserEmail() });

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
        "sort-col",
        "sort-dir",
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

test.describe("VesselRegisterTab — Last Activity sort", () => {
  test("puts never-used barrels first and ranks maintenance, fill, and rack-out dates", async ({
    page,
  }) => {
    const refs = {
      never: `${RUN_TAG}-never`,
      maintenance: `${RUN_TAG}-maintenance`,
      fill: `${RUN_TAG}-fill`,
      rackOutOnly: `${RUN_TAG}-rack-out-only`,
    };
    const vesselIds: number[] = [];

    try {
      vesselIds.push(await createBarrel(refs.never));
      const maintenanceId = await createBarrel(refs.maintenance);
      vesselIds.push(maintenanceId);
      const fillId = await createBarrel(refs.fill);
      vesselIds.push(fillId);
      const rackOutOnlyId = await createBarrel(refs.rackOutOnly);
      vesselIds.push(rackOutOnlyId);

      await createMaintenance(maintenanceId, "2024-01-10");
      await createFill(fillId, "2024-02-10");
      await createFill(rackOutOnlyId, null, "2024-03-10");

      const vesselsBody = await devFetch(
        `${apiBase()}/api/farms/${FARM_ID}/winery-vessels`,
      );
      const vessels = (vesselsBody.records ?? []) as ApiRecord[];
      const byRef = new Map(
        vessels
          .filter(vessel => Object.values(refs).includes(String(vessel.vessel_ref)))
          .map(vessel => [String(vessel.vessel_ref), vessel]),
      );

      const never = byRef.get(refs.never);
      const maintenance = byRef.get(refs.maintenance);
      const fill = byRef.get(refs.fill);
      const rackOutOnly = byRef.get(refs.rackOutOnly);
      expect(never).toBeDefined();
      expect(maintenance).toBeDefined();
      expect(fill).toBeDefined();
      expect(rackOutOnly).toBeDefined();

      // pg returns COUNT(*) as a string unless the query explicitly casts it.
      expect(Number(never?.fill_count)).toBe(0);
      expect(Number(never?.maintenance_count)).toBe(0);
      expect(never?.last_activity).toBeNull();

      expect(Number(maintenance?.fill_count)).toBe(0);
      expect(Number(maintenance?.maintenance_count)).toBe(1);
      expect(maintenance?.last_activity).toBe("2024-01-10");

      expect(Number(fill?.fill_count)).toBe(1);
      expect(Number(fill?.maintenance_count)).toBe(0);
      expect(fill?.last_activity).toBe("2024-02-10");

      expect(Number(rackOutOnly?.fill_count)).toBe(1);
      expect(Number(rackOutOnly?.maintenance_count)).toBe(0);
      expect(rackOutOnly?.last_activity).toBe("2024-03-10");

      await openVesselRegister(page, Object.values(refs));

      await page
        .getByRole("columnheader", { name: /Last Activity/ })
        .click();

      const rows = page.locator("tbody tr");
      await expect(rows).toHaveCount(4);
      await expect(rows.nth(0)).toContainText(refs.never);
      await expect(rows.nth(0)).toContainText("Never");
      await expect(rows.nth(1)).toContainText(refs.maintenance);
      await expect(rows.nth(1)).toContainText("10/01/2024");
      await expect(rows.nth(2)).toContainText(refs.fill);
      await expect(rows.nth(2)).toContainText("10/02/2024");
      await expect(rows.nth(3)).toContainText(refs.rackOutOnly);
      await expect(rows.nth(3)).toContainText("10/03/2024");
    } finally {
      for (const vesselId of vesselIds) {
        await deleteBarrel(vesselId).catch(() => {});
      }
    }
  });
});