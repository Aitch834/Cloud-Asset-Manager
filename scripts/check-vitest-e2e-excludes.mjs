#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const artifactsDir = path.join(repoRoot, "artifacts");
const vitestConfigPattern = /^vitest\.(?:config|workspace)\.[cm]?[jt]s$/;
const ignoredDirectories = new Set(["node_modules", "dist", ".git"]);

function* findVitestConfigs(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        yield* findVitestConfigs(fullPath);
      }
    } else if (vitestConfigPattern.test(entry.name)) {
      yield fullPath;
    }
  }
}

function excludesE2eTests(source) {
  const excludeBlock = source.match(/\bexclude\s*:\s*\[([\s\S]*?)\]/)?.[1];
  if (!excludeBlock) return false;

  return /(["'`])(?:\*\*\/)?e2e\/\*\*(?:\/\*)?\1/.test(excludeBlock);
}

const configs = [...findVitestConfigs(artifactsDir)];
const affectedPaths = configs
  .filter((configPath) => !excludesE2eTests(fs.readFileSync(configPath, "utf8")))
  .map((configPath) => path.relative(repoRoot, configPath));

if (affectedPaths.length > 0) {
  console.error("Vitest configs must exclude e2e test paths (for example, \"**/e2e/**\"):");
  for (const affectedPath of affectedPaths) {
    console.error(`  - ${affectedPath}`);
  }
  process.exit(1);
}

console.log(`Checked ${configs.length} Vitest config(s): all exclude e2e test paths.`);