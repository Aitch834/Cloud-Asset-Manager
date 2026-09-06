# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: vintage-report-grouping-persistence.spec.ts >> restores the Vintage Season Report grouping independently for each farm
- Location: e2e/vintage-report-grouping-persistence.spec.ts:79:1

# Error details

```
Error: page.goto: net::ERR_HTTP_RESPONSE_CODE_FAILURE at http://localhost/dashboard/
Call log:
  - navigating to "http://localhost/dashboard/", waiting until "load"

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e6]:
    - heading "This page isn’t working" [level=1] [ref=e7]
    - paragraph [ref=e8]:
      - strong [ref=e9]: localhost
      - text: is currently unable to handle this request.
    - generic [ref=e10]: HTTP ERROR 502
  - button "Reload" [ref=e13] [cursor=pointer]
```

# Test source

```ts
  9   | 
  10  | type TestFarm = {
  11  |   tenantSlug: string;
  12  |   farmId: number;
  13  | };
  14  | 
  15  | function getTestUserEmail(): string {
  16  |   const emailFile = path.join(__dirname, ".test-user-email");
  17  |   if (!fs.existsSync(emailFile)) {
  18  |     throw new Error("global-setup did not run — e2e/.test-user-email is missing");
  19  |   }
  20  |   return fs.readFileSync(emailFile, "utf8").trim();
  21  | }
  22  | 
  23  | async function getExistingViticultureFarms(): Promise<[TestFarm, TestFarm]> {
  24  |   const db = new Client({ connectionString: process.env.DATABASE_URL });
  25  |   await db.connect();
  26  |   try {
  27  |     const result = await db.query<{
  28  |       tenant_slug: string;
  29  |       farm_id: number;
  30  |     }>(
  31  |       `SELECT t.slug AS tenant_slug, f.id AS farm_id
  32  |        FROM tenants t
  33  |        JOIN farms f ON f.tenant_id = t.id
  34  |        WHERE t.id = $1
  35  |          AND EXISTS (
  36  |            SELECT 1 FROM vineyard_blocks vb WHERE vb.farm_id = f.id
  37  |          )
  38  |        ORDER BY f.id
  39  |        LIMIT 2`,
  40  |       [TENANT_ID],
  41  |     );
  42  | 
  43  |     if (result.rows.length < 2) {
  44  |       throw new Error(
  45  |         "Grouping persistence setup failed: the E2E tenant needs two existing farms with vineyard blocks.",
  46  |       );
  47  |     }
  48  | 
  49  |     return result.rows.map(row => ({
  50  |       tenantSlug: row.tenant_slug,
  51  |       farmId: row.farm_id,
  52  |     })) as [TestFarm, TestFarm];
  53  |   } finally {
  54  |     await db.end();
  55  |   }
  56  | }
  57  | 
  58  | function groupingStorageKey(farmId: number): string {
  59  |   return `vintage-season-report-${GROUPING_FILTER}-filter-${farmId}`;
  60  | }
  61  | 
  62  | async function useFarm(page: Page, farm: TestFarm): Promise<void> {
  63  |   await page.evaluate(
  64  |     ([tenantSlug, farmId]) => {
  65  |       localStorage.setItem("farmtrac_tenantSlug", tenantSlug);
  66  |       localStorage.setItem(
  67  |         "farmtrac-storage",
  68  |         JSON.stringify({ state: { tenantSlug, farmId }, version: 0 }),
  69  |       );
  70  |       localStorage.setItem(`viticulture-active-tab-${farmId}`, "vintage-report");
  71  |     },
  72  |     [farm.tenantSlug, farm.farmId] as [string, number],
  73  |   );
  74  |   await page.reload({ waitUntil: "networkidle" });
  75  |   await page.goto("/dashboard/viticulture");
  76  |   await expect(page.getByRole("heading", { name: "Vintage Season Report" })).toBeVisible();
  77  | }
  78  | 
  79  | test("restores the Vintage Season Report grouping independently for each farm", async ({ page }) => {
  80  |   const [varietyFarm, blockFarm] = await getExistingViticultureFarms();
  81  | 
  82  |   for (const farm of [varietyFarm, blockFarm]) {
  83  |     await page.route(`**/api/farms/${farm.farmId}/vineyard-blocks`, async route => {
  84  |       await route.fulfill({
  85  |         status: 200,
  86  |         contentType: "application/json",
  87  |         body: JSON.stringify(Array.from({ length: 8 }, (_, index) => ({
  88  |           id: farm.farmId * 1000 + index,
  89  |           blockName: `Persistence block ${index + 1}`,
  90  |           variety: index < 4 ? "Chardonnay" : "Pinot Noir",
  91  |           areaHa: "1",
  92  |           numberOfVines: 1000,
  93  |           isActive: true,
  94  |         }))),
  95  |       });
  96  |     });
  97  |     for (const endpoint of [
  98  |       "vineyard-harvest",
  99  |       "vineyard-scouting",
  100 |       "vineyard-operations",
  101 |       "vineyard-spray-diary",
  102 |     ]) {
  103 |       await page.route(`**/api/farms/${farm.farmId}/${endpoint}`, async route => {
  104 |         await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  105 |       });
  106 |     }
  107 |   }
  108 | 
> 109 |   await page.goto("/dashboard/");
      |              ^ Error: page.goto: net::ERR_HTTP_RESPONSE_CODE_FAILURE at http://localhost/dashboard/
  110 |   await clerk.signIn({ page, emailAddress: getTestUserEmail() });
  111 |   await page.waitForLoadState("networkidle");
  112 | 
  113 |   await page.evaluate(
  114 |     ([varietyKey, blockKey]) => {
  115 |       localStorage.setItem(varietyKey, "true");
  116 |       localStorage.setItem(blockKey, "false");
  117 |     },
  118 |     [groupingStorageKey(varietyFarm.farmId), groupingStorageKey(blockFarm.farmId)] as [string, string],
  119 |   );
  120 | 
  121 |   const groupingButton = page.getByRole("button", { name: "By variety" });
  122 | 
  123 |   await useFarm(page, varietyFarm);
  124 |   await expect(groupingButton).toHaveAttribute("aria-pressed", "true");
  125 | 
  126 |   await useFarm(page, blockFarm);
  127 |   await expect(groupingButton).toHaveAttribute("aria-pressed", "false");
  128 | 
  129 |   await groupingButton.click();
  130 |   await expect(groupingButton).toHaveAttribute("aria-pressed", "true");
  131 | 
  132 |   await useFarm(page, varietyFarm);
  133 |   await expect(groupingButton).toHaveAttribute("aria-pressed", "true");
  134 |   await groupingButton.click();
  135 |   await expect(groupingButton).toHaveAttribute("aria-pressed", "false");
  136 | 
  137 |   await useFarm(page, blockFarm);
  138 |   await expect(groupingButton).toHaveAttribute("aria-pressed", "true");
  139 | });
```