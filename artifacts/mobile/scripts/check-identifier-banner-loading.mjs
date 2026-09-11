#!/usr/bin/env node
/**
 * Prevent IdentifierBanner's success nudge from flashing before farm
 * identifiers finish loading.
 *
 * Every rendered IdentifierBanner under app/ or components/ must pass loading,
 * and that prop must be bound directly to the `loading` value returned by
 * useFarmIdentifiers() in the same caller.
 *
 * Usage:
 *   node scripts/check-identifier-banner-loading.mjs
 *   node scripts/check-identifier-banner-loading.mjs --self-test
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ts from "typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_DIR = path.resolve(__dirname, "../app");
const COMPONENTS_DIR = path.resolve(__dirname, "../components");
const SOURCE_DIRS = [APP_DIR, COMPONENTS_DIR];

function lineOf(sourceFile, node) {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
}

function collectIdentifierLoadingBindings(sourceFile) {
  const bindings = new Set();

  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isObjectBindingPattern(node.name) &&
      node.initializer &&
      ts.isCallExpression(node.initializer) &&
      ts.isIdentifier(node.initializer.expression) &&
      node.initializer.expression.text === "useFarmIdentifiers"
    ) {
      for (const element of node.name.elements) {
        const sourceName = element.propertyName ?? element.name;
        if (
          ts.isIdentifier(sourceName) &&
          sourceName.text === "loading" &&
          ts.isIdentifier(element.name)
        ) {
          bindings.add(element.name.text);
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return bindings;
}

function findViolations(source, filePath = "<source>") {
  const sourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const loadingBindings = collectIdentifierLoadingBindings(sourceFile);
  const violations = [];

  function visit(node) {
    if (
      (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) &&
      ts.isIdentifier(node.tagName) &&
      node.tagName.text === "IdentifierBanner"
    ) {
      const loadingProp = node.attributes.properties.find(
        (attribute) =>
          ts.isJsxAttribute(attribute) &&
          ts.isIdentifier(attribute.name) &&
          attribute.name.text === "loading",
      );

      if (!loadingProp || !ts.isJsxAttribute(loadingProp)) {
        violations.push({
          filePath,
          line: lineOf(sourceFile, node),
          reason: "missing loading prop",
        });
      } else {
        const expression =
          loadingProp.initializer &&
          ts.isJsxExpression(loadingProp.initializer)
            ? loadingProp.initializer.expression
            : undefined;
        if (
          !expression ||
          !ts.isIdentifier(expression) ||
          !loadingBindings.has(expression.text)
        ) {
          violations.push({
            filePath,
            line: lineOf(sourceFile, loadingProp),
            reason:
              "loading must directly use the loading value from useFarmIdentifiers()",
          });
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return violations;
}

function collectTsxFiles(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectTsxFiles(entryPath));
    } else if (entry.isFile() && entry.name.endsWith(".tsx")) {
      files.push(entryPath);
    }
  }
  return files;
}

function runSelfTest() {
  const cases = [
    {
      name: "accepts an aliased identifier loading binding",
      source: `
        const { loading: identifiersLoading } = useFarmIdentifiers(farmId);
        return <IdentifierBanner loading={identifiersLoading} />;
      `,
      expected: 0,
    },
    {
      name: "accepts the unaliased loading binding",
      source: `
        const { loading } = useFarmIdentifiers(farmId);
        return <IdentifierBanner loading={loading} />;
      `,
      expected: 0,
    },
    {
      name: "accepts a banner rendered from a shared component",
      source: `
        export function SharedIdentifierSummary({ farmId }) {
          const { loading: identifiersLoading } = useFarmIdentifiers(farmId);
          return <IdentifierBanner loading={identifiersLoading} />;
        }
      `,
      expected: 0,
    },
    {
      name: "rejects a shared component banner without identifier loading",
      source: `
        export function SharedIdentifierSummary({ farmId }) {
          const { loading: identifiersLoading } = useFarmIdentifiers(farmId);
          return <IdentifierBanner />;
        }
      `,
      expected: 1,
    },
    {
      name: "rejects a missing loading prop",
      source: `
        const { loading: identifiersLoading } = useFarmIdentifiers(farmId);
        return <IdentifierBanner justSaved={justSaved} />;
      `,
      expected: 1,
    },
    {
      name: "rejects an unrelated loading value",
      source: `
        const { loading: identifiersLoading } = useFarmIdentifiers(farmId);
        return <IdentifierBanner loading={recordsLoading} />;
      `,
      expected: 1,
    },
    {
      name: "rejects a literal loading value",
      source: `
        const { loading: identifiersLoading } = useFarmIdentifiers(farmId);
        return <IdentifierBanner loading={false} />;
      `,
      expected: 1,
    },
    {
      name: "ignores examples in comments and strings",
      source: `
        // <IdentifierBanner />
        const example = "<IdentifierBanner loading={recordsLoading} />";
      `,
      expected: 0,
    },
  ];

  for (const testCase of cases) {
    const actual = findViolations(testCase.source).length;
    if (actual !== testCase.expected) {
      throw new Error(
        `${testCase.name}: expected ${testCase.expected} violation(s), got ${actual}`,
      );
    }
  }

  console.log(`✓ IdentifierBanner loading guard self-test passed (${cases.length} cases).`);
}

if (process.argv.includes("--self-test")) {
  runSelfTest();
  process.exit(0);
}

const violations = [];
let bannerCount = 0;
for (const filePath of SOURCE_DIRS.flatMap(collectTsxFiles)) {
  const source = fs.readFileSync(filePath, "utf8");
  const relativePath = path.relative(process.cwd(), filePath);
  const fileViolations = findViolations(source, relativePath);
  violations.push(...fileViolations);

  const sourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  function countBanners(node) {
    if (
      (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) &&
      ts.isIdentifier(node.tagName) &&
      node.tagName.text === "IdentifierBanner"
    ) {
      bannerCount += 1;
    }
    ts.forEachChild(node, countBanners);
  }
  countBanners(sourceFile);
}

if (violations.length > 0) {
  console.error("✗ IdentifierBanner loading guard failed.");
  console.error(
    "  Every rendered IdentifierBanner under artifacts/mobile/app or artifacts/mobile/components must pass loading from that caller's useFarmIdentifiers() result.",
  );
  for (const violation of violations) {
    console.error(
      `  ${violation.filePath}:${violation.line} — ${violation.reason}`,
    );
  }
  process.exit(1);
}

console.log(
  `✓ IdentifierBanner loading guard passed: all ${bannerCount} rendered banner(s) use their caller's identifier loading state.`,
);