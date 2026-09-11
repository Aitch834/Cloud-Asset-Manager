import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  hideFallbackDir,
  recoverStaleFallbackDir,
} from "./lib/ad-brand-fallback-dir.mjs";

function withFallbackPaths(run) {
  const root = mkdtempSync(join(tmpdir(), "ad-brand-fallback-"));
  const fallbackDir = join(root, "ad-templates");
  const backupDir = join(root, "ad-templates.bak");

  try {
    run({ fallbackDir, backupDir });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test("restores a stale backup when the primary fallback directory is absent", () => {
  withFallbackPaths(({ fallbackDir, backupDir }) => {
    mkdirSync(backupDir);
    const warnings = [];

    recoverStaleFallbackDir(fallbackDir, backupDir, (message) => warnings.push(message));

    assert.equal(existsSync(fallbackDir), true);
    assert.equal(existsSync(backupDir), false);
    assert.deepEqual(warnings, [
      `WARNING: found stale fallback backup at ${backupDir}; ` +
      `automatically restoring it to ${fallbackDir}.`,
    ]);
  });
});

test("keeps the manual-recovery error when primary and backup directories both exist", () => {
  withFallbackPaths(({ fallbackDir, backupDir }) => {
    mkdirSync(fallbackDir);
    mkdirSync(backupDir);

    assert.throws(
      () => hideFallbackDir(fallbackDir, backupDir),
      {
        message:
          `Backup path ${backupDir} already exists — a previous run may have left it. ` +
          `Rename it back to ${fallbackDir} and re-run.`,
      },
    );
    assert.equal(existsSync(fallbackDir), true);
    assert.equal(existsSync(backupDir), true);
  });
});