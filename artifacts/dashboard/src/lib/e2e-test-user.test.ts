import { describe, expect, it, vi } from "vitest";
import {
  findReusableClerkTestUser,
  provisionReusableClerkTestUser,
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

  it("adopts generated identities from older dashboard task prefixes", () => {
    expect(
      findReusableClerkTestUser([
        {
          id: "older-task-user",
          email_addresses: [
            { email_address: "e2e-882-1720000000000@bde-test.example.com" },
          ],
        },
      ]),
    ).toEqual({
      id: "older-task-user",
      email: "e2e-882-1720000000000@bde-test.example.com",
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

  it("reuses the persistent identity without creating another Clerk user", async () => {
    const createUser = vi.fn();
    const listUsers = vi.fn().mockResolvedValue([
      {
        id: "shared-user",
        email_addresses: [{ email_address: SHARED_E2E_TEST_EMAIL }],
      },
    ]);

    await expect(
      provisionReusableClerkTestUser({ listUsers, createUser }),
    ).resolves.toEqual({
      id: "shared-user",
      email: SHARED_E2E_TEST_EMAIL,
      reused: true,
    });
    expect(listUsers).toHaveBeenCalledTimes(1);
    expect(createUser).not.toHaveBeenCalled();
  });

  it("adopts an identity found after a quota-limited create race", async () => {
    const listUsers = vi
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: "concurrent-user",
          email_addresses: [{ email_address: SHARED_E2E_TEST_EMAIL }],
        },
      ]);
    const createUser = vi
      .fn()
      .mockRejectedValue(new Error("user_quota_exceeded"));

    await expect(
      provisionReusableClerkTestUser({ listUsers, createUser }),
    ).resolves.toEqual({
      id: "concurrent-user",
      email: SHARED_E2E_TEST_EMAIL,
      reused: true,
    });
    expect(listUsers).toHaveBeenCalledTimes(2);
    expect(createUser).toHaveBeenCalledTimes(1);
  });

  it("fails clearly when quota is full and no reusable identity exists", async () => {
    await expect(
      provisionReusableClerkTestUser({
        listUsers: vi.fn().mockResolvedValue([]),
        createUser: vi
          .fn()
          .mockRejectedValue(new Error("user_quota_exceeded")),
      }),
    ).rejects.toThrow(
      "tenant is at quota and no reusable E2E test identity was found",
    );
  });
});
