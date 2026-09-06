# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: operation-photo-count-live-update.spec.ts >> operation photo badge appears and disappears immediately while non-images are ignored
- Location: e2e/operation-photo-count-live-update.spec.ts:161:1

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
  41  | function isImage(attachment: Attachment): boolean {
  42  |   return attachment.mimeType.toLowerCase().startsWith("image/")
  43  |     || /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(attachment.fileName);
  44  | }
  45  | 
  46  | async function json(route: Route, body: unknown): Promise<void> {
  47  |   await route.fulfill({
  48  |     status: 200,
  49  |     contentType: "application/json",
  50  |     body: JSON.stringify(body),
  51  |   });
  52  | }
  53  | 
  54  | async function preparePage(page: Page): Promise<void> {
  55  |   const attachments: Attachment[] = [];
  56  |   let nextAttachmentId = 921250;
  57  |   let nextObjectId = 1;
  58  | 
  59  |   await page.route(`**/api/farms/${FARM_ID}/vineyard-operations`, async route => {
  60  |     if (route.request().method() !== "GET") return route.continue();
  61  |     await json(route, {
  62  |       records: [{
  63  |         id: OPERATION_ID,
  64  |         farmId: FARM_ID,
  65  |         blockId: 921240,
  66  |         operationDate: new Date().toISOString().slice(0, 10),
  67  |         operationType: "Pruning",
  68  |         pruningSystem: "Double Guyot",
  69  |         operatorName: OPERATOR,
  70  |         photoCount: attachments.filter(isImage).length,
  71  |       }],
  72  |     });
  73  |   });
  74  | 
  75  |   await page.route(`**/api/farms/${FARM_ID}/vineyard-blocks`, async route => {
  76  |     if (route.request().method() !== "GET") return route.continue();
  77  |     await json(route, {
  78  |       records: [{
  79  |         id: 921240,
  80  |         farmId: FARM_ID,
  81  |         blockName: "E2E Photo Count Block",
  82  |         variety: "Chardonnay",
  83  |         isActive: true,
  84  |       }],
  85  |     });
  86  |   });
  87  | 
  88  |   await page.route(`**/api/farms/${FARM_ID}/record-attachments**`, async route => {
  89  |     const request = route.request();
  90  |     const url = new URL(request.url());
  91  | 
  92  |     if (request.method() === "GET") {
  93  |       await json(route, attachments);
  94  |       return;
  95  |     }
  96  | 
  97  |     if (request.method() === "POST" && url.pathname.endsWith("/record-attachments")) {
  98  |       const submitted = request.postDataJSON() as Partial<Attachment>;
  99  |       const attachment: Attachment = {
  100 |         id: nextAttachmentId++,
  101 |         farmId: FARM_ID,
  102 |         recordType: String(submitted.recordType),
  103 |         recordId: Number(submitted.recordId),
  104 |         fileUrl: String(submitted.fileUrl),
  105 |         fileKey: String(submitted.fileKey),
  106 |         fileName: String(submitted.fileName),
  107 |         fileSize: Number(submitted.fileSize),
  108 |         mimeType: String(submitted.mimeType ?? ""),
  109 |         notes: null,
  110 |         uploadedByName: "E2E",
  111 |         uploadedAt: new Date().toISOString(),
  112 |       };
  113 |       attachments.push(attachment);
  114 |       await json(route, { record: attachment });
  115 |       return;
  116 |     }
  117 | 
  118 |     if (request.method() === "DELETE") {
  119 |       const id = Number(url.pathname.split("/").pop());
  120 |       const index = attachments.findIndex(attachment => attachment.id === id);
  121 |       if (index >= 0) attachments.splice(index, 1);
  122 |       await json(route, { success: true });
  123 |       return;
  124 |     }
  125 | 
  126 |     await route.continue();
  127 |   });
  128 | 
  129 |   await page.route("**/api/storage/uploads/request-url", async route => {
  130 |     const objectPath = `/objects/e2e-operation-photo-${nextObjectId++}`;
  131 |     await json(route, {
  132 |       uploadURL: `http://localhost:80/e2e-operation-attachment-upload/${nextObjectId}`,
  133 |       objectPath,
  134 |     });
  135 |   });
  136 |   await page.route("**/e2e-operation-attachment-upload/**", route =>
  137 |     route.fulfill({ status: 200, body: "" }),
  138 |   );
  139 | 
  140 |   await setupClerkTestingToken({ page, userId: stateFile(".test-user-id") });
> 141 |   await page.goto("/dashboard/");
      |              ^ Error: page.goto: net::ERR_HTTP_RESPONSE_CODE_FAILURE at http://localhost/dashboard/
  142 |   await page.waitForLoadState("networkidle");
  143 |   await clerk.signIn({ page, emailAddress: stateFile(".test-user-email") });
  144 | 
  145 |   await page.evaluate(farmId => {
  146 |     const tenantSlug = "oakfield-farms";
  147 |     localStorage.setItem("farmtrac_tenantSlug", tenantSlug);
  148 |     localStorage.setItem(
  149 |       "farmtrac-storage",
  150 |       JSON.stringify({ state: { tenantSlug, farmId }, version: 0 }),
  151 |     );
  152 |     localStorage.setItem(`viticulture-active-tab-${farmId}`, "operations");
  153 |     localStorage.setItem(`viticulture-operations-year-filter-${farmId}`, "all");
  154 |   }, FARM_ID);
  155 | 
  156 |   await page.goto("/dashboard/viticulture");
  157 |   await expect(page.getByRole("button", { name: "Pruning & Canopy", exact: true }))
  158 |     .toBeVisible({ timeout: 15_000 });
  159 | }
  160 | 
  161 | test("operation photo badge appears and disappears immediately while non-images are ignored", async ({ page }) => {
  162 |   await preparePage(page);
  163 | 
  164 |   const row = page.getByRole("row").filter({ hasText: OPERATOR });
  165 |   await expect(row).toBeVisible();
  166 |   await expect(row.getByTitle("View photos")).toHaveCount(0);
  167 | 
  168 |   // The first action button in a DataTable row is View.
  169 |   await row.getByRole("button").first().click();
  170 |   const dialog = page.getByRole("dialog", { name: "Vineyard Operation" });
  171 |   await expect(dialog).toBeVisible();
  172 | 
  173 |   const fileInput = dialog.locator('input[type="file"]');
  174 |   await fileInput.setInputFiles({
  175 |     name: "operation-notes.pdf",
  176 |     mimeType: "application/pdf",
  177 |     buffer: Buffer.from("%PDF-1.4 E2E"),
  178 |   });
  179 |   await expect(dialog.getByText("operation-notes.pdf")).toBeVisible();
  180 |   await expect(row.getByTitle("View photos")).toHaveCount(0);
  181 | 
  182 |   await fileInput.setInputFiles({
  183 |     name: "operation-evidence.jpg",
  184 |     mimeType: "image/jpeg",
  185 |     buffer: Buffer.from("e2e image"),
  186 |   });
  187 |   await expect(dialog.getByText("operation-evidence.jpg")).toBeVisible();
  188 |   await expect(row.getByRole("button", { name: "View 1 photo" })).toBeVisible();
  189 | 
  190 |   await dialog.getByText("operation-evidence.jpg")
  191 |     .locator("xpath=ancestor::li")
  192 |     .getByTitle("Remove attachment")
  193 |     .click();
  194 |   await expect(dialog.getByText("operation-evidence.jpg")).toHaveCount(0);
  195 |   await expect(row.getByTitle("View photos")).toHaveCount(0);
  196 |   await expect(dialog.getByText("operation-notes.pdf")).toBeVisible();
  197 | });
```