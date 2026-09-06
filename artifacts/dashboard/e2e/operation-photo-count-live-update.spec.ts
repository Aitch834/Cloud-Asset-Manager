/**
 * E2E: vineyard operation photo badges update after attachment changes.
 *
 * The attachment and operations routes use one in-browser fixture state so this
 * test exercises the real RecordAttachments mutations and OperationsTab query
 * refresh without writing test files to object storage or the database.
 */

import { expect, test, type Page, type Route } from "@playwright/test";
import { clerk, setupClerkTestingToken } from "@clerk/testing/playwright";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const FARM_ID = 5;
const OPERATION_ID = 921241;
const OPERATOR = "E2E operation photo live count";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

type Attachment = {
  id: number;
  farmId: number;
  recordType: string;
  recordId: number;
  fileUrl: string;
  fileKey: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  notes: null;
  uploadedByName: string;
  uploadedAt: string;
};

function stateFile(name: string): string {
  const file = path.join(__dirname, name);
  if (!fs.existsSync(file)) throw new Error(`global-setup did not run — ${name} missing`);
  return fs.readFileSync(file, "utf8").trim();
}

function isImage(attachment: Attachment): boolean {
  return attachment.mimeType.toLowerCase().startsWith("image/")
    || /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(attachment.fileName);
}

async function json(route: Route, body: unknown): Promise<void> {
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

async function preparePage(page: Page): Promise<void> {
  const attachments: Attachment[] = [];
  let nextAttachmentId = 921250;
  let nextObjectId = 1;

  await page.route(`**/api/farms/${FARM_ID}/vineyard-operations`, async route => {
    if (route.request().method() !== "GET") return route.continue();
    await json(route, {
      records: [{
        id: OPERATION_ID,
        farmId: FARM_ID,
        blockId: 921240,
        operationDate: new Date().toISOString().slice(0, 10),
        operationType: "Pruning",
        pruningSystem: "Double Guyot",
        operatorName: OPERATOR,
        photoCount: attachments.filter(isImage).length,
      }],
    });
  });

  await page.route(`**/api/farms/${FARM_ID}/vineyard-blocks`, async route => {
    if (route.request().method() !== "GET") return route.continue();
    await json(route, {
      records: [{
        id: 921240,
        farmId: FARM_ID,
        blockName: "E2E Photo Count Block",
        variety: "Chardonnay",
        isActive: true,
      }],
    });
  });

  await page.route(`**/api/farms/${FARM_ID}/record-attachments**`, async route => {
    const request = route.request();
    const url = new URL(request.url());

    if (request.method() === "GET") {
      await json(route, attachments);
      return;
    }

    if (request.method() === "POST" && url.pathname.endsWith("/record-attachments")) {
      const submitted = request.postDataJSON() as Partial<Attachment>;
      const attachment: Attachment = {
        id: nextAttachmentId++,
        farmId: FARM_ID,
        recordType: String(submitted.recordType),
        recordId: Number(submitted.recordId),
        fileUrl: String(submitted.fileUrl),
        fileKey: String(submitted.fileKey),
        fileName: String(submitted.fileName),
        fileSize: Number(submitted.fileSize),
        mimeType: String(submitted.mimeType ?? ""),
        notes: null,
        uploadedByName: "E2E",
        uploadedAt: new Date().toISOString(),
      };
      attachments.push(attachment);
      await json(route, { record: attachment });
      return;
    }

    if (request.method() === "DELETE") {
      const id = Number(url.pathname.split("/").pop());
      const index = attachments.findIndex(attachment => attachment.id === id);
      if (index >= 0) attachments.splice(index, 1);
      await json(route, { success: true });
      return;
    }

    await route.continue();
  });

  await page.route("**/api/storage/uploads/request-url", async route => {
    const objectPath = `/objects/e2e-operation-photo-${nextObjectId++}`;
    await json(route, {
      uploadURL: `http://localhost:80/e2e-operation-attachment-upload/${nextObjectId}`,
      objectPath,
    });
  });
  await page.route("**/e2e-operation-attachment-upload/**", route =>
    route.fulfill({ status: 200, body: "" }),
  );

  await setupClerkTestingToken({ page, userId: stateFile(".test-user-id") });
  await page.goto("/dashboard/");
  await page.waitForLoadState("networkidle");
  await clerk.signIn({ page, emailAddress: stateFile(".test-user-email") });

  await page.evaluate(farmId => {
    const tenantSlug = "oakfield-farms";
    localStorage.setItem("farmtrac_tenantSlug", tenantSlug);
    localStorage.setItem(
      "farmtrac-storage",
      JSON.stringify({ state: { tenantSlug, farmId }, version: 0 }),
    );
    localStorage.setItem(`viticulture-active-tab-${farmId}`, "operations");
    localStorage.setItem(`viticulture-operations-year-filter-${farmId}`, "all");
  }, FARM_ID);

  await page.goto("/dashboard/viticulture");
  await expect(page.getByRole("button", { name: "Pruning & Canopy", exact: true }))
    .toBeVisible({ timeout: 15_000 });
}

test("operation photo badge appears and disappears immediately while non-images are ignored", async ({ page }) => {
  await preparePage(page);

  const row = page.getByRole("row").filter({ hasText: OPERATOR });
  await expect(row).toBeVisible();
  await expect(row.getByTitle("View photos")).toHaveCount(0);

  // The first action button in a DataTable row is View.
  await row.getByRole("button").first().click();
  const dialog = page.getByRole("dialog", { name: "Vineyard Operation" });
  await expect(dialog).toBeVisible();

  const fileInput = dialog.locator('input[type="file"]');
  await fileInput.setInputFiles({
    name: "operation-notes.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 E2E"),
  });
  await expect(dialog.getByText("operation-notes.pdf")).toBeVisible();
  await expect(row.getByTitle("View photos")).toHaveCount(0);

  await fileInput.setInputFiles({
    name: "operation-evidence.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.from("e2e image"),
  });
  await expect(dialog.getByText("operation-evidence.jpg")).toBeVisible();
  await expect(row.getByRole("button", { name: "View 1 photo" })).toBeVisible();

  await dialog.getByText("operation-evidence.jpg")
    .locator("xpath=ancestor::li")
    .getByTitle("Remove attachment")
    .click();
  await expect(dialog.getByText("operation-evidence.jpg")).toHaveCount(0);
  await expect(row.getByTitle("View photos")).toHaveCount(0);
  await expect(dialog.getByText("operation-notes.pdf")).toBeVisible();
});