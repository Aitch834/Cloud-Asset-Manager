import { clerk } from "@clerk/testing/playwright";
import type { Page } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getTestUserEmailFile(): string {
  const fileName = process.env.PLAYWRIGHT_E2E_USER_EMAIL_FILE;
  if (!fileName) {
    throw new Error(
      "PLAYWRIGHT_E2E_USER_EMAIL_FILE is missing — run specs through the Playwright config",
    );
  }
  return path.join(__dirname, fileName);
}

function readTestUserEmail(): string {
  const testUserEmailFile = getTestUserEmailFile();
  if (!fs.existsSync(testUserEmailFile)) {
    throw new Error(
      `global-setup did not run — e2e/${path.basename(testUserEmailFile)} is missing`,
    );
  }

  const emailAddress = fs.readFileSync(testUserEmailFile, "utf8").trim();
  if (!emailAddress) {
    throw new Error(
      `global-setup did not publish a test email — e2e/${path.basename(testUserEmailFile)} is empty`,
    );
  }

  return emailAddress;
}

export async function signInDashboard(page: Page): Promise<void> {
  await page.goto("/dashboard/");
  await page.waitForFunction(
    () => Boolean((window as Window & { Clerk?: unknown }).Clerk),
  );
  await clerk.signIn({ page, emailAddress: readTestUserEmail() });
  await page.waitForFunction(() =>
    Boolean(
      (
        window as Window & {
          Clerk?: { user?: unknown };
        }
      ).Clerk?.user,
    ),
  );
}