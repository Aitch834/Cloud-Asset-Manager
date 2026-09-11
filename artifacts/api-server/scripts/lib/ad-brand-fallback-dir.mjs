import { existsSync, renameSync } from "node:fs";

export function recoverStaleFallbackDir(fallbackDir, backupDir, warn = console.warn) {
  if (existsSync(backupDir) && !existsSync(fallbackDir)) {
    warn(
      `WARNING: found stale fallback backup at ${backupDir}; ` +
      `automatically restoring it to ${fallbackDir}.`,
    );
    renameSync(backupDir, fallbackDir);
  }
}

export function hideFallbackDir(fallbackDir, backupDir) {
  if (!existsSync(fallbackDir)) return false;
  if (existsSync(backupDir)) {
    throw new Error(
      `Backup path ${backupDir} already exists — a previous run may have left it. ` +
      `Rename it back to ${fallbackDir} and re-run.`,
    );
  }
  renameSync(fallbackDir, backupDir);
  return true;
}