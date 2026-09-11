# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: customer-contact-list-refresh.spec.ts >> customer contact list refresh >> shows an edited contact name after returning through the in-app customer link
- Location: e2e/customer-contact-list-refresh.spec.ts:117:3

# Error details

```
Error: page.goto: net::ERR_HTTP_RESPONSE_CODE_FAILURE at http://localhost/admin-portal/customers
Call log:
  - navigating to "http://localhost/admin-portal/customers", waiting until "load"

```

# Test source

```ts
  40  |     const roleId = roleResult.rows[0]?.id;
  41  |     if (!roleId) throw new Error("A system role is required for the contact refresh fixture");
  42  | 
  43  |     const tenantResult = await db.query<{ id: number }>(
  44  |       `INSERT INTO tenants (name, slug, contact_email)
  45  |        VALUES ($1, $2, $3)
  46  |        RETURNING id`,
  47  |       [
  48  |         ORIGINAL_NAME,
  49  |         `${FIXTURE_TAG.toLowerCase()}-${Date.now()}`,
  50  |         `${FIXTURE_TAG.toLowerCase()}@test.local`,
  51  |       ],
  52  |     );
  53  |     tenantId = tenantResult.rows[0].id;
  54  | 
  55  |     const bypassUserResult = await db.query(
  56  |       `INSERT INTO users (id, email, first_name, last_name)
  57  |        VALUES ($1, 'dev-bypass@test.local', 'DevBypass', 'Test')
  58  |        ON CONFLICT (id) DO NOTHING
  59  |        RETURNING id`,
  60  |       [DEV_BYPASS_USER_ID],
  61  |     );
  62  |     insertedBypassUser = (bypassUserResult.rowCount ?? 0) > 0;
  63  | 
  64  |     await db.query(
  65  |       `INSERT INTO user_tenants
  66  |          (user_id, tenant_id, role_id, is_super_admin, is_active)
  67  |        VALUES ($1, $2, $3, true, true)
  68  |        ON CONFLICT (user_id, tenant_id) DO NOTHING`,
  69  |       [DEV_BYPASS_USER_ID, tenantId, roleId],
  70  |     );
  71  |   } finally {
  72  |     await db.end();
  73  |   }
  74  | }
  75  | 
  76  | async function teardownFixture() {
  77  |   if (!process.env.DATABASE_URL) return;
  78  | 
  79  |   const db = new Client({ connectionString: process.env.DATABASE_URL });
  80  |   await db.connect();
  81  |   try {
  82  |     if (tenantId !== null) {
  83  |       await db.query("DELETE FROM user_tenants WHERE tenant_id = $1", [tenantId]);
  84  |       await db.query("DELETE FROM tenants WHERE id = $1", [tenantId]);
  85  |     }
  86  |     if (insertedBypassUser) {
  87  |       await db.query("DELETE FROM users WHERE id = $1", [DEV_BYPASS_USER_ID]);
  88  |     }
  89  |   } finally {
  90  |     await db.end();
  91  |   }
  92  | }
  93  | 
  94  | async function authenticate(
  95  |   page: Page,
  96  |   beforeAdminRequest?: (request: Request) => Promise<void>,
  97  | ) {
  98  |   await page.addInitScript((secret) => {
  99  |     sessionStorage.setItem("bde_admin_secret", secret);
  100 |   }, ADMIN_SECRET_PLACEHOLDER);
  101 | 
  102 |   await page.route("**/api/admin/**", async (route) => {
  103 |     await beforeAdminRequest?.(route.request());
  104 |     await route.continue({
  105 |       headers: {
  106 |         ...route.request().headers(),
  107 |         "x-dev-bypass": DEV_BYPASS,
  108 |       },
  109 |     });
  110 |   });
  111 | }
  112 | 
  113 | test.describe("customer contact list refresh", () => {
  114 |   test.beforeAll(setupFixture);
  115 |   test.afterAll(teardownFixture);
  116 | 
  117 |   test("shows an edited contact name after returning through the in-app customer link", async ({ page }) => {
  118 |     let tenantListRequestCount = 0;
  119 |     let markRefreshStarted!: () => void;
  120 |     let releaseRefresh!: () => void;
  121 |     const refreshStarted = new Promise<void>((resolve) => {
  122 |       markRefreshStarted = resolve;
  123 |     });
  124 |     const refreshRelease = new Promise<void>((resolve) => {
  125 |       releaseRefresh = resolve;
  126 |     });
  127 | 
  128 |     await authenticate(page, async (request) => {
  129 |       const isTenantListRequest =
  130 |         request.method() === "GET" &&
  131 |         new URL(request.url()).pathname === "/api/admin/tenants";
  132 |       if (!isTenantListRequest) return;
  133 | 
  134 |       tenantListRequestCount += 1;
  135 |       if (tenantListRequestCount === 2) {
  136 |         markRefreshStarted();
  137 |         await refreshRelease;
  138 |       }
  139 |     });
> 140 |     await page.goto(`${appBase()}/admin-portal/customers`);
      |                ^ Error: page.goto: net::ERR_HTTP_RESPONSE_CODE_FAILURE at http://localhost/admin-portal/customers
  141 | 
  142 |     const originalCustomerLink = page.getByRole("link").filter({ hasText: ORIGINAL_NAME });
  143 |     await expect(originalCustomerLink).toBeVisible();
  144 |     await originalCustomerLink.click();
  145 |     await expect(page).toHaveURL(new RegExp(`/admin-portal/customers/${tenantId}$`));
  146 | 
  147 |     await page.getByRole("button", { name: "Edit contact", exact: true }).click();
  148 |     await expect(page.getByRole("heading", { name: "Edit Contact Details" })).toBeVisible();
  149 |     await expect(page.getByLabel("Contact Name", { exact: true })).toBeVisible();
  150 |     await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
  151 |     await expect(page.getByLabel("Phone", { exact: true })).toBeVisible();
  152 |     await page.getByLabel("Contact Name", { exact: true }).fill(UPDATED_NAME);
  153 | 
  154 |     const updateResponse = page.waitForResponse(
  155 |       (response) =>
  156 |         response.url().endsWith(`/api/admin/tenants/${tenantId}`) &&
  157 |         response.request().method() === "PATCH",
  158 |     );
  159 |     await page.getByRole("button", { name: "Save Changes" }).click();
  160 |     expect((await updateResponse).status()).toBe(200);
  161 |     await expect(page.getByRole("heading", { name: UPDATED_NAME })).toBeVisible();
  162 | 
  163 |     await page.getByText("Back to Customers", { exact: true }).click();
  164 |     await expect(page).toHaveURL(/\/admin-portal\/customers$/);
  165 |     await refreshStarted;
  166 | 
  167 |     try {
  168 |       await expect(page.getByRole("link").filter({ hasText: UPDATED_NAME })).toBeVisible();
  169 |       await expect(page.getByText(ORIGINAL_NAME, { exact: true })).toHaveCount(0);
  170 |     } finally {
  171 |       releaseRefresh();
  172 |     }
  173 |   });
  174 | });
```