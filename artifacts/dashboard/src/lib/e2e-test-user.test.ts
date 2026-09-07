import { describe, expect, it } from "vitest";
import {
  findReusableClerkTestUser,
  SHARED_E2E_TEST_EMAIL,
} from "./e2e-test-user";

describe("dashboard Playwright Clerk test identity", () => {
  it("prefers the persistent identity over legacy generated users", () => {
    expect(
      findReusableClerkTestUser([
        {
          id: "legacy-user",
          email_addresses: [
            { email_address: "e2e-1277-100@bde-test.example.com" },
          ],
        },
        {
          id: "shared-user",
          email_addresses: [{ email_address: SHARED_E2E_TEST_EMAIL }],
        },
      ]),
    ).toEqual({ id: "shared-user", email: SHARED_E2E_TEST_EMAIL });
  });

  it("adopts a legacy E2E user without selecting unrelated accounts", () => {
    expect(
      findReusableClerkTestUser([
        {
          id: "unrelated-user",
          email_addresses: [{ email_address: "e2e-other@example.com" }],
        },
        {
          id: "legacy-user",
          email_addresses: [
            { email_address: "e2e-1277-200@bde-test.example.com" },
          ],
        },
      ]),
    ).toEqual({
      id: "legacy-user",
      email: "e2e-1277-200@bde-test.example.com",
    });
  });

  it("returns no user when Clerk has no dashboard E2E identity", () => {
    expect(
      findReusableClerkTestUser([
        {
          id: "unrelated-user",
          email_addresses: [{ email_address: "grower@example.com" }],
        },
      ]),
    ).toBeNull();
  });
});