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

function authenticationFailureMessage(
  target: "Dashboard" | "Mobile",
  emailAddress: string,
  error: unknown,
): string {
  const detail = error instanceof Error ? error.message : String(error);
  const quotaDetail = /quota|user_quota_exceeded/i.test(detail)
    ? " Clerk user quota is exhausted; the designated reusable identity could not be signed in."
    : "";
  return (
    `${target} test authentication failed for ${emailAddress}: ` +
    `Clerk rejected the test sign-in or did not create a session.${quotaDetail} ${detail}`
  );
}

export async function signInDashboard(
  page: Page,
  emailAddress = readTestUserEmail(),
): Promise<void> {
  await page.goto("/dashboard/");
  await page.waitForFunction(
    () => Boolean((window as Window & { Clerk?: unknown }).Clerk),
  );

  try {
    await clerk.signIn({ page, emailAddress });
    await page.waitForFunction(
      () =>
        Boolean(
          (
            window as Window & {
              Clerk?: { user?: unknown };
            }
          ).Clerk?.user,
        ),
      undefined,
      { timeout: 5_000 },
    );
  } catch (error) {
    throw new Error(authenticationFailureMessage("Dashboard", emailAddress, error), {
      cause: error,
    });
  }
}

/**
 * Sign an Expo-web mobile release check in as the persistent Clerk E2E user.
 * Global setup maps this identity to the active Oakfield Farms fixture before
 * publishing its email, so this helper never provisions a Clerk user.
 */
export async function signInMobile(
  page: Page,
  mobileBaseUrl: string,
  mobileApiBaseUrl: string,
  emailAddress = readTestUserEmail(),
): Promise<void> {
  try {
    const response = await page.goto(mobileBaseUrl, {
      waitUntil: "domcontentloaded",
    });
    if (!response?.ok()) {
      throw new Error(
        `mobile preview returned HTTP ${response?.status() ?? "no response"}`,
      );
    }
    await page.waitForFunction(
      () => Boolean((window as Window & { Clerk?: unknown }).Clerk),
      undefined,
      { timeout: 10_000 },
    );
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Mobile release runtime unavailable at ${mobileBaseUrl}. ` +
        `Start the mobile workflow and rerun the check. ${detail}`,
      { cause: error },
    );
  }

  try {
    await clerk.signIn({ page, emailAddress });
    await page.waitForFunction(
      () =>
        Boolean(
          (
            window as Window & {
              Clerk?: { user?: unknown };
            }
          ).Clerk?.user,
        ),
      undefined,
      { timeout: 5_000 },
    );

    const token = await page.evaluate(async () => {
      const clerk = (
        window as Window & {
          Clerk?: { session?: { getToken: () => Promise<string | null> } };
        }
      ).Clerk;
      return clerk?.session?.getToken() ?? null;
    });
    if (!token) {
      throw new Error("signed-in Clerk session did not issue an API token");
    }

    const farmsResponse = await page.request.get(
      new URL("/api/my-farms", mobileApiBaseUrl).toString(),
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!farmsResponse.ok()) {
      throw new Error(
        `signed-in farm fixture request failed with HTTP ${farmsResponse.status()}`,
      );
    }
    const payload = (await farmsResponse.json()) as { farms?: unknown };
    if (!Array.isArray(payload.farms) || payload.farms.length === 0) {
      throw new Error("signed-in identity has no active farm fixture");
    }
  } catch (error) {
    throw new Error(authenticationFailureMessage("Mobile", emailAddress, error), {
      cause: error,
    });
  }
}
