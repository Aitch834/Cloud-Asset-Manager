import fs from "node:fs";
import path from "node:path";

describe("legacy Operations History route", () => {
  it("stays a compatibility alias for the canonical plural route", () => {
    const routeFile = path.join(
      __dirname,
      "..",
      "app",
      "vine-operation-history.tsx",
    );
    const source = fs.readFileSync(routeFile, "utf8");

    expect(source).toContain(
      'export { default } from "./vine-operations-history";',
    );
    expect(source).not.toMatch(/function\s+VineOperationHistoryScreen/);
  });
});