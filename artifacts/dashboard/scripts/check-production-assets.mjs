import { existsSync, readFileSync, statSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const dashboardRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const outputDir = resolve(process.argv[2] ?? resolve(dashboardRoot, "dist/public"));
const indexPath = resolve(outputDir, "index.html");

function fail(message) {
  console.error(`Dashboard production asset check failed: ${message}`);
  process.exitCode = 1;
}

if (!existsSync(indexPath) || !statSync(indexPath).isFile()) {
  fail(`missing index file: ${indexPath}`);
} else {
  const html = readFileSync(indexPath, "utf8");
  const references = new Set();
  const attributePattern = /\b(?:src|href)\s*=\s*(["'])(.*?)\1/gi;

  for (const match of html.matchAll(attributePattern)) {
    const rawReference = match[2].trim();

    if (
      !rawReference ||
      rawReference.startsWith("#") ||
      rawReference.startsWith("//") ||
      /^[a-z][a-z\d+.-]*:/i.test(rawReference)
    ) {
      continue;
    }

    const pathname = rawReference.split(/[?#]/, 1)[0];
    if (!pathname) continue;

    let decodedPath;
    try {
      decodedPath = decodeURIComponent(pathname);
    } catch {
      fail(`invalid encoded asset path in index.html: ${rawReference}`);
      continue;
    }

    const localPath = decodedPath.startsWith("/dashboard/")
      ? decodedPath.slice("/dashboard/".length)
      : decodedPath.startsWith("/")
        ? decodedPath.slice(1)
        : decodedPath;
    const assetPath = resolve(outputDir, localPath);
    const pathFromOutput = relative(outputDir, assetPath);

    if (isAbsolute(pathFromOutput) || pathFromOutput.startsWith("..")) {
      fail(`asset path escapes dashboard output: ${rawReference}`);
      continue;
    }

    references.add(JSON.stringify({ rawReference, assetPath }));
  }

  if (references.size === 0) {
    fail(`index file references no local assets: ${indexPath}`);
  }

  for (const encodedReference of references) {
    const { rawReference, assetPath } = JSON.parse(encodedReference);
    if (!existsSync(assetPath) || !statSync(assetPath).isFile()) {
      fail(`missing local asset referenced by index.html: ${rawReference} (${assetPath})`);
    }
  }

  if (process.exitCode !== 1) {
    console.log(
      `Dashboard production asset check passed: ${references.size} local asset(s) referenced by ${indexPath}`,
    );
  }
}