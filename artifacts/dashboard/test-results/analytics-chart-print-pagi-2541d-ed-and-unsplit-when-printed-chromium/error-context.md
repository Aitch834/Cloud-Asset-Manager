# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: analytics-chart-print-pagination.spec.ts >> shared analytics chart cards stay capped and unsplit when printed
- Location: e2e/analytics-chart-print-pagination.spec.ts:206:1

# Error details

```
Error: Analytics print setup failed: no current-year chart data for Viticulture
```

# Test source

```ts
  35  |   return fs.readFileSync(stateFile, "utf8").trim();
  36  | }
  37  | 
  38  | async function getAnalyticsModules(): Promise<AnalyticsModule[]> {
  39  |   const db = new Client({ connectionString: process.env.DATABASE_URL });
  40  |   await db.connect();
  41  | 
  42  |   try {
  43  |     const result = await db.query<{
  44  |       tenant_slug: string;
  45  |       viticulture_farm_id: number | null;
  46  |       livestock_farm_id: number | null;
  47  |       poultry_farm_id: number | null;
  48  |     }>(
  49  |       `SELECT
  50  |          t.slug AS tenant_slug,
  51  |          (
  52  |            SELECT f.id
  53  |            FROM farms f
  54  |            WHERE f.tenant_id = t.id
  55  |              AND f.sector_viticulture = true
  56  |              AND (
  57  |                EXISTS (
  58  |                  SELECT 1 FROM vineyard_harvest h
  59  |                  WHERE h.farm_id = f.id AND h.vintage_year = $2
  60  |                )
  61  |                OR EXISTS (
  62  |                  SELECT 1 FROM vineyard_scouting sc
  63  |                  WHERE sc.farm_id = f.id
  64  |                    AND EXTRACT(YEAR FROM sc.scout_date) = $2
  65  |                )
  66  |                OR EXISTS (
  67  |                  SELECT 1 FROM vineyard_operations vo
  68  |                  WHERE vo.farm_id = f.id
  69  |                    AND EXTRACT(YEAR FROM vo.operation_date) = $2
  70  |                )
  71  |              )
  72  |            ORDER BY f.id
  73  |            LIMIT 1
  74  |          ) AS viticulture_farm_id,
  75  |          (
  76  |            SELECT f.id
  77  |            FROM farms f
  78  |            WHERE f.tenant_id = t.id
  79  |              AND (f.sector_beef OR f.sector_dairy OR f.sector_sheep OR f.sector_goats)
  80  |              AND (
  81  |                EXISTS (
  82  |                  SELECT 1 FROM livestock_mortality lm
  83  |                  WHERE lm.farm_id = f.id
  84  |                    AND EXTRACT(YEAR FROM lm.date_of_death) = $2
  85  |                )
  86  |                OR EXISTS (
  87  |                  SELECT 1 FROM bvd_testing_records bt
  88  |                  WHERE bt.farm_id = f.id
  89  |                    AND EXTRACT(YEAR FROM bt.test_date) = $2
  90  |                )
  91  |                OR EXISTS (
  92  |                  SELECT 1 FROM tb_tests tt
  93  |                  WHERE tt.farm_id = f.id
  94  |                    AND EXTRACT(YEAR FROM tt.test_date) = $2
  95  |                )
  96  |              )
  97  |            ORDER BY f.id
  98  |            LIMIT 1
  99  |          ) AS livestock_farm_id,
  100 |          (
  101 |            SELECT f.id
  102 |            FROM farms f
  103 |            WHERE f.tenant_id = t.id
  104 |              AND f.sector_poultry = true
  105 |              AND (
  106 |                EXISTS (
  107 |                  SELECT 1 FROM poultry_flocks pf
  108 |                  WHERE pf.farm_id = f.id
  109 |                    AND EXTRACT(YEAR FROM pf.placement_date) = $2
  110 |                )
  111 |                OR EXISTS (
  112 |                  SELECT 1 FROM poultry_treatments pt
  113 |                  WHERE pt.farm_id = f.id
  114 |                    AND EXTRACT(YEAR FROM pt.treatment_date) = $2
  115 |                )
  116 |              )
  117 |            ORDER BY f.id
  118 |            LIMIT 1
  119 |          ) AS poultry_farm_id
  120 |        FROM tenants t
  121 |        WHERE t.id = $1`,
  122 |       [TENANT_ID, CURRENT_YEAR],
  123 |     );
  124 | 
  125 |     const farms = result.rows[0];
  126 |     if (!farms) throw new Error("Analytics print setup failed: E2E tenant is missing");
  127 | 
  128 |     const definitions = [
  129 |       { name: "Viticulture", path: "/dashboard/viticulture", farmId: farms.viticulture_farm_id },
  130 |       { name: "Livestock", path: "/dashboard/livestock", farmId: farms.livestock_farm_id },
  131 |       { name: "Poultry", path: "/dashboard/poultry-production", farmId: farms.poultry_farm_id },
  132 |     ];
  133 |     const missing = definitions.filter(module => module.farmId === null).map(module => module.name);
  134 |     if (missing.length > 0) {
> 135 |       throw new Error(
      |             ^ Error: Analytics print setup failed: no current-year chart data for Viticulture
  136 |         `Analytics print setup failed: no current-year chart data for ${missing.join(", ")}`,
  137 |       );
  138 |     }
  139 | 
  140 |     return definitions.map(module => ({
  141 |       name: module.name,
  142 |       path: module.path,
  143 |       farm: {
  144 |         tenantSlug: farms.tenant_slug,
  145 |         farmId: module.farmId as number,
  146 |       },
  147 |     }));
  148 |   } finally {
  149 |     await db.end();
  150 |   }
  151 | }
  152 | 
  153 | async function selectFarm(page: Page, farm: AnalyticsFarm): Promise<void> {
  154 |   await page.goto("/dashboard/");
  155 |   await page.evaluate(
  156 |     ([tenantSlug, farmId]) => {
  157 |       localStorage.setItem("farmtrac_tenantSlug", tenantSlug);
  158 |       localStorage.setItem(
  159 |         "farmtrac-storage",
  160 |         JSON.stringify({ state: { tenantSlug, farmId }, version: 0 }),
  161 |       );
  162 |     },
  163 |     [farm.tenantSlug, farm.farmId] as [string, number],
  164 |   );
  165 | }
  166 | 
  167 | async function expectSharedPrintContract(page: Page, moduleName: string): Promise<void> {
  168 |   const cards = page.locator(".analytics-chart-cap");
  169 |   await expect(cards.first(), `${moduleName}: an analytics chart card must render`).toBeVisible();
  170 | 
  171 |   const chart = cards.locator(".recharts-responsive-container").first();
  172 |   await expect(chart, `${moduleName}: the chart card must contain a rendered Recharts chart`).toBeVisible();
  173 | 
  174 |   await page.emulateMedia({ media: "print" });
  175 | 
  176 |   const styles = await cards.first().evaluate(element => {
  177 |     const cardStyle = getComputedStyle(element);
  178 |     const container = element.querySelector<HTMLElement>(".recharts-responsive-container");
  179 |     const wrapper = element.querySelector<HTMLElement>(".recharts-wrapper");
  180 |     const svg = element.querySelector<SVGElement>(".recharts-wrapper svg");
  181 | 
  182 |     return {
  183 |       breakInside: cardStyle.breakInside,
  184 |       pageBreakInside: cardStyle.pageBreakInside,
  185 |       containerMaxHeight: container ? getComputedStyle(container).maxHeight : "",
  186 |       wrapperMaxHeight: wrapper ? getComputedStyle(wrapper).maxHeight : "",
  187 |       svgMaxHeight: svg ? getComputedStyle(svg).maxHeight : "",
  188 |       containerHeight: container?.getBoundingClientRect().height ?? 0,
  189 |       wrapperHeight: wrapper?.getBoundingClientRect().height ?? 0,
  190 |       svgHeight: svg?.getBoundingClientRect().height ?? 0,
  191 |     };
  192 |   });
  193 | 
  194 |   expect(styles.breakInside, `${moduleName}: chart card must not split across pages`).toBe("avoid");
  195 |   expect(styles.pageBreakInside, `${moduleName}: legacy print engines must not split the card`).toBe("avoid");
  196 |   expect(styles.containerMaxHeight).toBe("300px");
  197 |   expect(styles.wrapperMaxHeight).toBe("300px");
  198 |   expect(styles.svgMaxHeight).toBe("300px");
  199 |   expect(styles.containerHeight).toBeLessThanOrEqual(300);
  200 |   expect(styles.wrapperHeight).toBeLessThanOrEqual(300);
  201 |   expect(styles.svgHeight).toBeLessThanOrEqual(300);
  202 | 
  203 |   await page.emulateMedia({ media: "screen" });
  204 | }
  205 | 
  206 | test("shared analytics chart cards stay capped and unsplit when printed", async ({ page }) => {
  207 |   const modules = await getAnalyticsModules();
  208 |   await setupClerkTestingToken({ page, userId: getTestUserId() });
  209 | 
  210 |   for (const module of modules) {
  211 |     await selectFarm(page, module.farm);
  212 |     await page.goto(module.path);
  213 |     await page.waitForLoadState("networkidle");
  214 |     await page.getByRole("button", { name: "Analytics", exact: true }).click();
  215 |     await expectSharedPrintContract(page, module.name);
  216 |   }
  217 | });
```