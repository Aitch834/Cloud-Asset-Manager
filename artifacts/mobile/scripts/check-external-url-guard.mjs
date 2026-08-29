#!/usr/bin/env node
/**
 * Prevents mobile screens from bypassing the shared external URL helper.
 *
 * HTTP(S) URLs must be opened through utils/openExternalUrl.ts so they stay
 * inside the app's in-app browser. Native schemes such as mailto: and tel:
 * may still use Linking.openURL directly.
 *
 * Usage:
 *   node artifacts/mobile/scripts/check-external-url-guard.mjs
 *   node artifacts/mobile/scripts/check-external-url-guard.mjs --self-test
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MOBILE_DIR = path.resolve(__dirname, "..");
const SOURCE_DIRECTORIES = ["app", "components", "hooks", "lib", "utils"];
const SOURCE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx"]);
const HELPER_PATH = path.resolve(MOBILE_DIR, "utils/openExternalUrl.ts");

/**
 * Tokenize enough JavaScript/TypeScript to distinguish API calls from text in
 * comments and strings. This intentionally does not attempt to parse the
 * language; it only needs member names, parentheses, and string literals.
 */
function tokenize(source) {
  const tokens = [];
  let index = 0;

  while (index < source.length) {
    const character = source[index];

    if (/\s/.test(character)) {
      index += 1;
      continue;
    }

    if (character === "/" && source[index + 1] === "/") {
      index += 2;
      while (index < source.length && source[index] !== "\n") index += 1;
      continue;
    }

    if (character === "/" && source[index + 1] === "*") {
      const commentEnd = source.indexOf("*/", index + 2);
      index = commentEnd === -1 ? source.length : commentEnd + 2;
      continue;
    }

    if (character === "'" || character === '"' || character === "`") {
      const quote = character;
      const start = index;
      index += 1;
      let value = "";

      while (index < source.length) {
        const current = source[index];
        if (current === "\\") {
          value += source[index + 1] ?? "";
          index += 2;
          continue;
        }
        if (current === quote) {
          index += 1;
          break;
        }
        value += current;
        index += 1;
      }

      tokens.push({
        type: "literal",
        value,
        line: source.slice(0, start).split("\n").length,
      });
      continue;
    }

    const identifier = source.slice(index).match(/^[A-Za-z_$][\w$]*/);
    if (identifier) {
      const value = identifier[0];
      tokens.push({
        type: "identifier",
        value,
        line: source.slice(0, index).split("\n").length,
      });
      index += value.length;
      continue;
    }

    tokens.push({
      type: "punctuation",
      value: character,
      line: source.slice(0, index).split("\n").length,
    });
    index += 1;
  }

  return tokens;
}

function isMemberCall(tokens, index, objectName, methodName) {
  return (
    tokens[index]?.type === "identifier" &&
    tokens[index]?.value === objectName &&
    tokens[index + 1]?.value === "." &&
    tokens[index + 2]?.type === "identifier" &&
    tokens[index + 2]?.value === methodName &&
    tokens[index + 3]?.value === "("
  );
}

function findViolations(source, filePath) {
  const tokens = tokenize(source);
  const violations = [];

  for (let index = 0; index < tokens.length; index += 1) {
    if (isMemberCall(tokens, index, "WebBrowser", "openBrowserAsync")) {
      violations.push({
        kind: "WebBrowser.openBrowserAsync",
        line: tokens[index].line,
        filePath,
      });
      continue;
    }

    if (!isMemberCall(tokens, index, "Linking", "openURL")) continue;

    const argument = tokens[index + 4];
    if (
      argument?.type === "literal" &&
      /^https?:\/\//i.test(argument.value.trimStart())
    ) {
      violations.push({
        kind: "Linking.openURL with an HTTP(S) URL",
        line: tokens[index].line,
        filePath,
      });
    }
  }

  return violations;
}

function collectSourceFiles(directory) {
  const files = [];
  if (!fs.existsSync(directory)) return files;

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(entryPath));
    } else if (
      entry.isFile() &&
      SOURCE_EXTENSIONS.has(path.extname(entry.name))
    ) {
      files.push(entryPath);
    }
  }

  return files;
}

function runSelfTest() {
  const cases = [
    {
      name: "allows native Linking schemes",
      source: 'Linking.openURL("mailto:help@example.com");',
      expected: 0,
    },
    {
      name: "flags an HTTP literal passed to Linking",
      source: 'Linking.openURL("https://example.com");',
      expected: 1,
    },
    {
      name: "flags a bare WebBrowser call",
      source: "WebBrowser.openBrowserAsync(url);",
      expected: 1,
    },
    {
      name: "ignores comments and strings containing API names",
      source: [
        '// WebBrowser.openBrowserAsync("https://example.com");',
        'const note = "Linking.openURL(\\\'https://example.com\\\')";',
      ].join("\n"),
      expected: 0,
    },
  ];

  for (const testCase of cases) {
    const actual = findViolations(testCase.source, "<self-test>").length;
    if (actual !== testCase.expected) {
      throw new Error(
        `${testCase.name}: expected ${testCase.expected} violation(s), got ${actual}`,
      );
    }
  }

  console.log(`✓ External URL guard self-test passed (${cases.length} cases).`);
}

if (process.argv.includes("--self-test")) {
  runSelfTest();
  process.exit(0);
}

const violations = [];
for (const directory of SOURCE_DIRECTORIES) {
  for (const filePath of collectSourceFiles(path.resolve(MOBILE_DIR, directory))) {
    if (path.resolve(filePath) === HELPER_PATH) continue;
    const relativePath = path.relative(process.cwd(), filePath);
    violations.push(...findViolations(fs.readFileSync(filePath, "utf8"), relativePath));
  }
}

if (violations.length > 0) {
  console.error("✗ Direct external URL API usage found in mobile source.");
  console.error(
    "  Use openExternalUrl() from utils/openExternalUrl.ts for HTTP(S) URLs.",
  );
  for (const violation of violations) {
    console.error(
      `  ${violation.filePath}:${violation.line} — ${violation.kind}`,
    );
  }
  process.exit(1);
}

console.log(
  "✓ Mobile external URL guard passed: HTTP(S) links use the shared helper and no screen calls WebBrowser directly.",
);