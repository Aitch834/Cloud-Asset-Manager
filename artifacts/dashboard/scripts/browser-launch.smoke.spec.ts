import { expect, test } from "@playwright/test";

test("Chromium launches with the discovered Nix libraries", async ({ page }) => {
  await page.goto("about:blank");
  await expect(page.locator("body")).toBeAttached();
});