import {
  chromium,
  expect,
  firefox,
  test,
  webkit,
  type BrowserType,
} from "@playwright/test";

const browserTypes: Record<string, BrowserType> = { chromium, firefox, webkit };

test("configured browser launches with the discovered Replit dependencies", async ({ browserName }, testInfo) => {
  const browserType = browserTypes[browserName];
  let browser;

  try {
    browser = await browserType.launch(testInfo.project.use.launchOptions);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      `${browserName} could not launch for dashboard browser checks. ` +
        `Install the matching Playwright browsers with ` +
        `"pnpm --filter @workspace/dashboard run test:e2e:install-browser". ` +
        `If Replit reports missing shared libraries, add those Nix packages to ` +
        `the workspace before treating this as a product failure.\n\n${detail}`,
    );
  }

  try {
    const page = await browser.newPage();
    await page.goto("about:blank");
    await expect(page.locator("body")).toBeAttached();
  } finally {
    await browser.close();
  }
});