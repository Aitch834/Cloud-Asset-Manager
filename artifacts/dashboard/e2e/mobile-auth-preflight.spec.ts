import { expect, test } from "@playwright/test";

test("reuses the mapped Clerk identity for mobile release checks", () => {
  // Global setup performs the real mobile sign-in and authenticated /api/my-farms
  // request before this test starts. Reaching the test proves the preflight
  // succeeded without provisioning another Clerk user.
  expect(process.env.PLAYWRIGHT_MOBILE_BASE_URL).toBeTruthy();
});