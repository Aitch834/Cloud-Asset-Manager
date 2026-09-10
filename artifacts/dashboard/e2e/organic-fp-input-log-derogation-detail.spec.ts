import { expect, test, type Page } from "@playwright/test";
import { Client } from "pg";
import { signInDashboard } from "./auth";

const TENANT_ID = 1;

type OrganicFreshProduceFarm = {
  tenantSlug: string;
  farmId: number;
};

function calendarDateFromToday(dayOffset: number): string {
  const today = new Date();
  return new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + dayOffset),
  )
    .toISOString()
    .slice(0, 10);
}

function formatUkDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

async function getOrganicFreshProduceFarm(): Promise<OrganicFreshProduceFarm> {
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();

  try {
    const result = await db.query<{
      tenant_slug: string;
      farm_id: number;
    }>(
      `SELECT t.slug AS tenant_slug, f.id AS farm_id
       FROM tenants t
       JOIN farms f ON f.tenant_id = t.id
       JOIN subscriptions s ON s.farm_id = f.id AND s.tenant_id = t.id
       JOIN modules m ON m.id = s.module_id
       WHERE t.id = $1
         AND m.key = 'organic-fresh-produce'
         AND (
           s.status = 'active'
           OR (
             s.status = 'trial'
             AND (s.current_period_end IS NULL OR s.current_period_end > NOW())
           )
         )
       ORDER BY f.id
       LIMIT 1`,
      [TENANT_ID],
    );

    const farm = result.rows[0];
    if (!farm) {
      throw new Error(
        "FP derogation detail setup failed: no organic-fresh-produce farm is available for the E2E tenant.",
      );
    }

    return {
      tenantSlug: farm.tenant_slug,
      farmId: farm.farm_id,
    };
  } finally {
    await db.end();
  }
}

async function openInputLog(
  page: Page,
  farm: OrganicFreshProduceFarm,
  records: Record<string, unknown>[],
): Promise<void> {
  await page.route(
    `**/api/farms/${farm.farmId}/organic-fp-input-log*`,
    async (route) => {
      if (route.request().method() !== "GET") {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(records),
      });
    },
  );
  await page.route(
    `**/api/farms/${farm.farmId}/horticulture-blocks*`,
    (route) => route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
  );
  await page.route(
    `**/api/farms/${farm.farmId}/suppliers*`,
    (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ records: [] }),
      }),
  );
  await page.route(
    `**/api/farms/${farm.farmId}/members*`,
    (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ members: [] }),
      }),
  );

  await signInDashboard(page);
  await page.evaluate(
    ([tenantSlug, farmId]) => {
      localStorage.setItem("farmtrac_tenantSlug", tenantSlug);
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug, farmId }, version: 0 }),
      );
    },
    [farm.tenantSlug, farm.farmId] as [string, number],
  );
  await page.goto("/dashboard/organic-fresh-produce", {
    waitUntil: "networkidle",
  });
  await page.getByRole("button", { name: "Input Log", exact: true }).click();
  await expect(
    page.getByText("Input log — fresh produce & horticultural organic inputs only"),
  ).toBeVisible();
}

test("keeps expired, expiring-soon, and valid derogation treatments in input details", async ({
  page,
}) => {
  const farm = await getOrganicFreshProduceFarm();
  const expiredDate = calendarDateFromToday(-2);
  const soonDate = calendarDateFromToday(12);
  const futureDate = calendarDateFromToday(60);
  const records = [
    ["E2E Expired Derogation", expiredDate],
    ["E2E Soon Derogation", soonDate],
    ["E2E Future Derogation", futureDate],
  ].map(([inputName, derogationExpiryDate], index) => ({
    id: 923_420 + index,
    inputName,
    inputType: "Seed Treatment",
    approvalStatus: "derogation",
    derogationExpiryDate,
    applicationDate: calendarDateFromToday(-10),
    cropYear: new Date().getFullYear(),
  }));

  await openInputLog(page, farm, records);

  const cases = [
    {
      product: "E2E Expired Derogation",
      text: `Derogation expired ${formatUkDate(expiredDate)}`,
      classes: ["bg-red-50", "text-red-700", "border-red-300"],
      hasWarningIcon: true,
    },
    {
      product: "E2E Soon Derogation",
      text: `Derogation expiry: ${formatUkDate(soonDate)} (12d)`,
      classes: ["bg-amber-50", "text-amber-700", "border-amber-300"],
      hasWarningIcon: false,
    },
    {
      product: "E2E Future Derogation",
      text: `Derogation expiry: ${formatUkDate(futureDate)}`,
      classes: ["bg-blue-50", "text-blue-700", "border-blue-200"],
      hasWarningIcon: false,
    },
  ];

  for (const warningCase of cases) {
    const row = page.locator(".rounded-md.border.p-3").filter({
      hasText: warningCase.product,
    });
    await row.getByRole("button").first().click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: "Input Log Entry" })).toBeVisible();
    const treatment = dialog.getByText(warningCase.text, { exact: true });
    await expect(treatment).toBeVisible();
    for (const className of warningCase.classes) {
      await expect(treatment).toHaveClass(new RegExp(`(?:^|\\s)${className}(?:\\s|$)`));
    }
    if (warningCase.hasWarningIcon) {
      await expect(treatment.locator("svg.lucide-triangle-alert")).toHaveCount(1);
    }

    await dialog.getByRole("button", { name: "Close", exact: true }).click();
    await expect(dialog).toBeHidden();
  }
});