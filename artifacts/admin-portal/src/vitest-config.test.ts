import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

describe("Vitest unit-test boundaries", () => {
  it("uses the Vitest config and excludes Playwright specs from unit-test collection", () => {
    const configSource = readFileSync(
      path.resolve(process.cwd(), "vitest.config.ts"),
      "utf8",
    );
    const packageJson = JSON.parse(
      readFileSync(path.resolve(process.cwd(), "package.json"), "utf8"),
    ) as { scripts?: Record<string, string> };

    expect(configSource).toContain('"**/e2e/**"');
    expect(packageJson.scripts?.test).toContain(
      "vitest run --config vitest.config.ts",
    );
    expect(packageJson.scripts?.test).toContain("--exclude '**/e2e/**'");
  });
});