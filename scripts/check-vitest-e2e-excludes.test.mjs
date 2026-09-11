import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const guardPath = path.join(repoRoot, "scripts/check-vitest-e2e-excludes.mjs");

function withFixture(callback) {
  const fixtureDir = mkdtempSync(path.join(os.tmpdir(), "vitest-e2e-guard-"));
  try {
    callback(fixtureDir);
  } finally {
    rmSync(fixtureDir, { recursive: true, force: true });
  }
}

function writeConfig(fixtureDir, relativePath, source) {
  const configPath = path.join(fixtureDir, relativePath);
  mkdirSync(path.dirname(configPath), { recursive: true });
  writeFileSync(configPath, source);
}

function runGuard(fixtureDir) {
  return spawnSync(
    process.execPath,
    [guardPath, "--artifacts-dir", fixtureDir],
    { cwd: repoRoot, encoding: "utf8" },
  );
}

test("accepts all supported Vitest config names when e2e tests are excluded", () => {
  withFixture((fixtureDir) => {
    const extensions = ["js", "ts", "cjs", "cts", "mjs", "mts"];
    const patterns = ['"**/e2e/**"', "'e2e/**'", "`**/e2e/**/*`"];

    for (const [index, extension] of extensions.entries()) {
      writeConfig(
        fixtureDir,
        `artifact-${extension}/vitest.config.${extension}`,
        `export default { test: { exclude: [${patterns[index % patterns.length]}] } };`,
      );
      writeConfig(
        fixtureDir,
        `artifact-${extension}/vitest.workspace.${extension}`,
        `export default { test: { exclude: [${patterns[(index + 1) % patterns.length]}] } };`,
      );
    }

    const result = runGuard(fixtureDir);

    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, "");
    assert.match(
      result.stdout,
      /^Checked 12 Vitest config\(s\): all exclude e2e test paths\.\n$/,
    );
  });
});

test("reports nested noncompliant configs with paths relative to the scan root", () => {
  withFixture((fixtureDir) => {
    writeConfig(
      fixtureDir,
      "nested/compliant/vitest.config.ts",
      'export default { test: { exclude: ["**/e2e/**"] } };',
    );
    writeConfig(
      fixtureDir,
      "nested/deeper/broken/vitest.workspace.mts",
      'export default { test: { exclude: ["**/integration/**"] } };',
    );
    writeConfig(
      fixtureDir,
      "nested/deeper/broken/dist/vitest.config.js",
      'export default { test: { exclude: [] } };',
    );

    const result = runGuard(fixtureDir);

    assert.equal(result.status, 1);
    assert.equal(result.stdout, "");
    assert.match(
      result.stderr,
      /Vitest configs must exclude e2e test paths/,
    );
    assert.match(
      result.stderr,
      /  - nested\/deeper\/broken\/vitest\.workspace\.mts\n/,
    );
    assert.doesNotMatch(result.stderr, /dist\/vitest\.config\.js/);
  });
});