import { describe, expect, it } from "vitest";
import config from "../vitest.config";

describe("Vitest unit-test boundaries", () => {
  it("excludes Playwright end-to-end specs from unit-test collection", () => {
    expect(config.test?.exclude).toEqual(
      expect.arrayContaining(["**/e2e/**"]),
    );
  });
});