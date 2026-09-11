import { chromium, type LaunchOptions } from "@playwright/test";

export const BROWSER_STARTUP_TIMEOUT_MS = 10_000;

export async function verifyChromiumStartup(
  launchOptions: LaunchOptions | undefined,
  timeoutMs = BROWSER_STARTUP_TIMEOUT_MS,
): Promise<void> {
  let browser;

  try {
    browser = await chromium.launch({
      ...launchOptions,
      // Use Playwright's native launch timeout so it terminates the startup
      // operation. A Promise.race would report early but could leave the
      // browser transport alive and keep the release command hanging.
      timeout: Math.min(launchOptions?.timeout ?? timeoutMs, timeoutMs),
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      `[e2e browser startup] Chromium could not start for dashboard browser checks. ` +
        `This is browser infrastructure failure; the dashboard application tests have not started. ` +
        `Install the matching browser with "pnpm --filter @workspace/dashboard run test:e2e:install-browser" ` +
        `and check the Replit Nix shared libraries.\n\n${detail}`,
      { cause: error },
    );
  } finally {
    await browser?.close().catch(() => undefined);
  }
}