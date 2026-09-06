# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: scouting-csv-photo-counts.spec.ts >> Disease Scouting CSV photo and caption counts >> refreshes photoCount and captionCount after add, caption, and delete
- Location: e2e/scouting-csv-photo-counts.spec.ts:205:3

# Error details

```
ReferenceError: __dirname is not defined
```

# Test source

```ts
  1   | /**
  2   |  * E2E: Disease Scouting CSV photo and caption counts
  3   |  *
  4   |  * The scouting list endpoint calculates photoCount and captionCount with a
  5   |  * grouped SQL aggregate. This test changes the underlying photo rows and then
  6   |  * exercises the dashboard's actual CSV download so the aggregate and export
  7   |  * stay covered together.
  8   |  *
  9   |  * Prerequisites (handled by global-setup.ts):
  10  |  *   - CLERK_SECRET_KEY, VITE_CLERK_PUBLISHABLE_KEY, DATABASE_URL in env
  11  |  *   - Dashboard workflow running (artifacts/dashboard: web)
  12  |  *   - API server workflow running (artifacts/api-server: API Server)
  13  |  *
  14  |  * Photo bytes are not needed: the API accepts an object path and the CSV only
  15  |  * depends on the database metadata.
  16  |  */
  17  | 
  18  | import { test, expect, type Page } from "@playwright/test";
  19  | import { setupClerkTestingToken } from "@clerk/testing/playwright";
  20  | import * as fs from "fs";
  21  | import * as path from "path";
  22  | 
  23  | const DEV_BYPASS = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
  24  | const TENANT_SLUG = "oakfield-farms";
  25  | const FARM_ID = 5; // Highfield Vineyard — has viticulture module
  26  | const SCOUT_NAME = `E2EScoutCsv-${Date.now()}`;
  27  | 
  28  | function getTestUserId(): string {
> 29  |   const stateFile = path.join(__dirname, ".test-user-id");
      |                               ^ ReferenceError: __dirname is not defined
  30  |   if (!fs.existsSync(stateFile)) {
  31  |     throw new Error("global-setup did not run — .test-user-id missing");
  32  |   }
  33  |   return fs.readFileSync(stateFile, "utf-8").trim();
  34  | }
  35  | 
  36  | function apiBase(): string {
  37  |   return process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:80";
  38  | }
  39  | 
  40  | const bypassHeaders = {
  41  |   "x-dev-bypass": DEV_BYPASS,
  42  |   "x-tenant-slug": TENANT_SLUG,
  43  | };
  44  | 
  45  | async function apiRequest(
  46  |   method: "POST" | "PATCH" | "DELETE",
  47  |   url: string,
  48  |   body?: unknown,
  49  | ): Promise<Record<string, unknown> | undefined> {
  50  |   const response = await fetch(url, {
  51  |     method,
  52  |     headers: {
  53  |       ...bypassHeaders,
  54  |       ...(body === undefined ? {} : { "Content-Type": "application/json" }),
  55  |     },
  56  |     ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  57  |   });
  58  |   if (!response.ok) {
  59  |     throw new Error(`${method} ${url} → ${response.status}: ${await response.text()}`);
  60  |   }
  61  |   if (response.status === 204) return undefined;
  62  |   return response.json() as Promise<Record<string, unknown>>;
  63  | }
  64  | 
  65  | async function createScoutingRecord(): Promise<number> {
  66  |   const today = new Date().toISOString().slice(0, 10);
  67  |   const response = await apiRequest(
  68  |     "POST",
  69  |     `${apiBase()}/api/farms/${FARM_ID}/vineyard-scouting`,
  70  |     {
  71  |       scoutDate: today,
  72  |       scoutedBy: SCOUT_NAME,
  73  |       downyMildewPressure: 0,
  74  |       powderyMildewPressure: 0,
  75  |       botrytisPressure: 0,
  76  |       phomopsisPressure: 0,
  77  |       leafhopperPressure: 0,
  78  |       spiderMitePressure: 0,
  79  |     },
  80  |   );
  81  |   const record = response?.record as { id?: number } | undefined;
  82  |   if (!record?.id) throw new Error("Scouting record creation returned no id");
  83  |   return record.id;
  84  | }
  85  | 
  86  | async function attachPhoto(scoutingId: number): Promise<number> {
  87  |   const response = await apiRequest(
  88  |     "POST",
  89  |     `${apiBase()}/api/farms/${FARM_ID}/vineyard-scouting/${scoutingId}/photos`,
  90  |     {
  91  |       objectPath: `/objects/e2e-scouting-csv-${Date.now()}.jpg`,
  92  |       fileName: "e2e-scouting-csv.jpg",
  93  |     },
  94  |   );
  95  |   const photo = response?.photo as { id?: number } | undefined;
  96  |   if (!photo?.id) throw new Error("Scouting photo creation returned no id");
  97  |   return photo.id;
  98  | }
  99  | 
  100 | async function deleteScoutingRecord(scoutingId: number) {
  101 |   await apiRequest(
  102 |     "DELETE",
  103 |     `${apiBase()}/api/farms/${FARM_ID}/vineyard-scouting/${scoutingId}`,
  104 |   );
  105 | }
  106 | 
  107 | async function navigateToScoutingTab(page: Page) {
  108 |   await page.goto("/dashboard/");
  109 |   await page.waitForLoadState("networkidle");
  110 | 
  111 |   await page.evaluate(([slug, farmId]) => {
  112 |     localStorage.setItem("farmtrac_tenantSlug", slug);
  113 |     localStorage.setItem(
  114 |       "farmtrac-storage",
  115 |       JSON.stringify({ state: { tenantSlug: slug, farmId }, version: 0 }),
  116 |     );
  117 |   }, [TENANT_SLUG, FARM_ID] as [string, number]);
  118 | 
  119 |   await page.reload({ waitUntil: "networkidle" });
  120 |   await page.getByRole("link", { name: /viticulture/i }).click();
  121 |   await page.waitForLoadState("networkidle");
  122 | 
  123 |   const scoutingTab = page.getByRole("button", { name: /scouting/i });
  124 |   if (await scoutingTab.isVisible({ timeout: 3_000 })) {
  125 |     await scoutingTab.click();
  126 |   }
  127 | 
  128 |   await page.reload({ waitUntil: "networkidle" });
  129 |   const scoutingTabAfterReload = page.getByRole("button", { name: /scouting/i });
```