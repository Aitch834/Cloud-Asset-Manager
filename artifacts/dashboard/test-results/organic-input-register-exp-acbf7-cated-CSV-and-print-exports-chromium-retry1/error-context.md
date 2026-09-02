# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: organic-input-register-exports.spec.ts >> shows derogation expiry in authenticated CSV and print exports
- Location: e2e/organic-input-register-exports.spec.ts:143:1

# Error details

```
ReferenceError: __dirname is not defined
```

# Test source

```ts
  1   | /**
  2   |  * E2E: authenticated Organic Input Register exports retain derogation expiry.
  3   |  *
  4   |  * The browser uses a real Clerk-authenticated tenant/farm context. The input row
  5   |  * itself is supplied as a read-only route fixture so the check is deterministic
  6   |  * and never changes shared farm records.
  7   |  */
  8   | 
  9   | import { expect, test, type Page } from "@playwright/test";
  10  | import { setupClerkTestingToken } from "@clerk/testing/playwright";
  11  | import { Client } from "pg";
  12  | import * as fs from "node:fs";
  13  | import * as path from "node:path";
  14  | 
  15  | const TENANT_ID = 1;
  16  | const PRODUCT_NAME = "E2E Derogation Seed Treatment";
  17  | const EXPIRY_ISO = "2026-12-31";
  18  | const EXPIRY_UK = "31/12/2026";
  19  | 
  20  | type OrganicFarm = {
  21  |   tenantSlug: string;
  22  |   farmId: number;
  23  |   farmName: string;
  24  | };
  25  | 
  26  | function getTestUserId(): string {
> 27  |   const stateFile = path.join(__dirname, ".test-user-id");
      |                               ^ ReferenceError: __dirname is not defined
  28  |   if (!fs.existsSync(stateFile)) {
  29  |     throw new Error("global-setup did not run — e2e/.test-user-id is missing");
  30  |   }
  31  |   return fs.readFileSync(stateFile, "utf8").trim();
  32  | }
  33  | 
  34  | async function getOrganicFarm(): Promise<OrganicFarm> {
  35  |   const db = new Client({ connectionString: process.env.DATABASE_URL });
  36  |   await db.connect();
  37  | 
  38  |   try {
  39  |     const result = await db.query<{
  40  |       tenant_slug: string;
  41  |       farm_id: number;
  42  |       farm_name: string;
  43  |     }>(
  44  |       `SELECT t.slug AS tenant_slug, f.id AS farm_id, f.name AS farm_name
  45  |        FROM tenants t
  46  |        JOIN farms f ON f.tenant_id = t.id
  47  |        JOIN subscriptions s ON s.farm_id = f.id AND s.tenant_id = t.id
  48  |        JOIN modules m ON m.id = s.module_id
  49  |        WHERE t.id = $1
  50  |          AND m.key = 'organic-compliance'
  51  |          AND (
  52  |            s.status = 'active'
  53  |            OR (
  54  |              s.status = 'trial'
  55  |              AND (s.current_period_end IS NULL OR s.current_period_end > NOW())
  56  |            )
  57  |          )
  58  |        ORDER BY f.id
  59  |        LIMIT 1`,
  60  |       [TENANT_ID],
  61  |     );
  62  | 
  63  |     const farm = result.rows[0];
  64  |     if (!farm) {
  65  |       throw new Error(
  66  |         "Input Register export setup failed: no organic-compliance farm is available for the E2E tenant.",
  67  |       );
  68  |     }
  69  | 
  70  |     return {
  71  |       tenantSlug: farm.tenant_slug,
  72  |       farmId: farm.farm_id,
  73  |       farmName: farm.farm_name,
  74  |     };
  75  |   } finally {
  76  |     await db.end();
  77  |   }
  78  | }
  79  | 
  80  | async function prepareInputRegister(page: Page, farm: OrganicFarm): Promise<void> {
  81  |   await page.route(`**/api/farms/${farm.farmId}/organic/inputs*`, async route => {
  82  |     if (route.request().method() !== "GET") {
  83  |       await route.continue();
  84  |       return;
  85  |     }
  86  | 
  87  |     await route.fulfill({
  88  |       status: 200,
  89  |       contentType: "application/json",
  90  |       body: JSON.stringify({
  91  |         records: [
  92  |           {
  93  |             id: 910_028,
  94  |             farmId: farm.farmId,
  95  |             productName: PRODUCT_NAME,
  96  |             inputType: "Seed Treatment",
  97  |             supplier: "E2E Organic Supplies",
  98  |             poReference: "PO-E2E-1928",
  99  |             grnReference: "GRN-E2E-1928",
  100 |             approvalStatus: "derogation",
  101 |             certifierApprovalRef: "DER-E2E-1928",
  102 |             cropYear: 2026,
  103 |             dateOfUse: "2026-09-01",
  104 |             quantityAmount: "25",
  105 |             quantityUnit: "kg",
  106 |             fieldId: null,
  107 |             fieldName: "North Field",
  108 |             justification: "Deterministic browser export fixture",
  109 |             certifierNotified: true,
  110 |             appliedBy: "E2E Tester",
  111 |             derogationExpiryDate: EXPIRY_ISO,
  112 |             notes: "Authenticated export regression fixture",
  113 |             createdAt: "2026-09-01T09:00:00.000Z",
  114 |           },
  115 |         ],
  116 |       }),
  117 |     });
  118 |   });
  119 | 
  120 |   await setupClerkTestingToken({ page, userId: getTestUserId() });
  121 |   await page.goto("/dashboard/");
  122 |   await page.waitForLoadState("networkidle");
  123 |   await page.evaluate(
  124 |     ([tenantSlug, farmId]) => {
  125 |       localStorage.setItem("farmtrac_tenantSlug", tenantSlug);
  126 |       localStorage.setItem(
  127 |         "farmtrac-storage",
```