#!/usr/bin/env node
/**
 * Catch apiFetch requests started by React effects without cancellation.
 *
 * The check starts only from useEffect/useFocusEffect callbacks, so calls made
 * solely by submit, refresh, and delete handlers are outside its scope. It also
 * follows file-local loader functions invoked by an effect.
 *
 * Usage:
 *   node scripts/check-effect-api-fetch-aborts.mjs
 *   node scripts/check-effect-api-fetch-aborts.mjs --self-test
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import ts from "typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MOBILE_DIR = path.resolve(__dirname, "..");
const SOURCE_DIRS = ["app", "components"];
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx"]);
const BASELINE_PATH = path.resolve(__dirname, "effect-api-fetch-aborts-baseline.json");

function fingerprint(filePath, kind, node, sourceFile) {
  const normalized = node.getText(sourceFile).replace(/\s+/g, " ").trim();
  return crypto
    .createHash("sha256")
    .update(`${filePath}\n${kind}\n${normalized}`)
    .digest("hex");
}

function lineOf(sourceFile, node) {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
}

function unwrapEffectCallback(node) {
  if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) return node;
  if (
    ts.isCallExpression(node) &&
    ts.isIdentifier(node.expression) &&
    node.expression.text === "useCallback" &&
    node.arguments[0] &&
    (ts.isArrowFunction(node.arguments[0]) || ts.isFunctionExpression(node.arguments[0]))
  ) {
    return node.arguments[0];
  }
  return undefined;
}

function functionNameForDeclaration(node) {
  if (ts.isFunctionDeclaration(node) && node.name) return node.name.text;
  if (
    ts.isVariableDeclaration(node) &&
    ts.isIdentifier(node.name) &&
    node.initializer
  ) {
    if (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer)) {
      return node.name.text;
    }
    if (
      ts.isCallExpression(node.initializer) &&
      ts.isIdentifier(node.initializer.expression) &&
      node.initializer.expression.text === "useCallback"
    ) {
      return node.name.text;
    }
  }
  return undefined;
}

function functionBodyForDeclaration(node) {
  if (ts.isFunctionDeclaration(node)) return node;
  if (!ts.isVariableDeclaration(node) || !node.initializer) return undefined;
  if (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer)) {
    return node.initializer;
  }
  if (
    ts.isCallExpression(node.initializer) &&
    node.initializer.arguments[0] &&
    (ts.isArrowFunction(node.initializer.arguments[0]) ||
      ts.isFunctionExpression(node.initializer.arguments[0]))
  ) {
    return node.initializer.arguments[0];
  }
  return undefined;
}

function collectLocalFunctions(sourceFile) {
  const functions = new Map();
  function visit(node) {
    const name = functionNameForDeclaration(node);
    const body = functionBodyForDeclaration(node);
    if (name && body) functions.set(name, body);
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return functions;
}

function isApiFetchCall(node) {
  return (
    ts.isCallExpression(node) &&
    ts.isIdentifier(node.expression) &&
    node.expression.text === "apiFetch"
  );
}

function hasSignalOption(call) {
  const init = call.arguments[1];
  if (!init || !ts.isObjectLiteralExpression(init)) return false;
  return init.properties.some((property) => {
    if (ts.isShorthandPropertyAssignment(property)) return property.name.text === "signal";
    return (
      ts.isPropertyAssignment(property) &&
      ((ts.isIdentifier(property.name) && property.name.text === "signal") ||
        (ts.isStringLiteral(property.name) && property.name.text === "signal"))
    );
  });
}

function calledLocalFunctions(root, localFunctions) {
  const calls = [];
  function visit(node) {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      localFunctions.has(node.expression.text)
    ) {
      calls.push(node);
    }
    ts.forEachChild(node, visit);
  }
  visit(root);
  return calls;
}

function apiFetchCallsReachableFrom(root, localFunctions, seen = new Set()) {
  const calls = [];
  function visit(node) {
    if (isApiFetchCall(node)) calls.push(node);
    ts.forEachChild(node, visit);
  }
  visit(root);

  for (const call of calledLocalFunctions(root, localFunctions)) {
    const name = call.expression.text;
    if (seen.has(name)) continue;
    const nextSeen = new Set(seen);
    nextSeen.add(name);
    calls.push(
      ...apiFetchCallsReachableFrom(localFunctions.get(name), localFunctions, nextSeen),
    );
  }
  return calls;
}

function containsControllerConstruction(callback) {
  let found = false;
  function visit(node) {
    if (
      ts.isNewExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === "AbortController"
    ) {
      found = true;
    }
    ts.forEachChild(node, visit);
  }
  visit(callback);
  return found;
}

function containsAbortCleanup(callback) {
  let found = false;
  function cleanupContainsAbort(node) {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === "abort"
    ) {
      found = true;
    }
    ts.forEachChild(node, cleanupContainsAbort);
  }
  function visit(node) {
    if (
      ts.isReturnStatement(node) &&
      node.expression &&
      (ts.isArrowFunction(node.expression) || ts.isFunctionExpression(node.expression))
    ) {
      cleanupContainsAbort(node.expression);
      return;
    }
    ts.forEachChild(node, visit);
  }
  visit(callback);
  return found;
}

function hasSignalArgument(call) {
  return call.arguments.some((argument) => {
    if (
      ts.isPropertyAccessExpression(argument) &&
      argument.name.text === "signal"
    ) {
      return true;
    }
    if (ts.isObjectLiteralExpression(argument)) {
      return argument.properties.some(
        (property) =>
          (ts.isPropertyAssignment(property) || ts.isShorthandPropertyAssignment(property)) &&
          property.name.getText() === "signal",
      );
    }
    return false;
  });
}

function findViolations(source, filePath = "<source>") {
  const sourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith(".ts") ? ts.ScriptKind.TS : ts.ScriptKind.TSX,
  );
  const localFunctions = collectLocalFunctions(sourceFile);
  const violations = [];

  function visit(node) {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      (node.expression.text === "useEffect" || node.expression.text === "useFocusEffect")
    ) {
      const callback = node.arguments[0] && unwrapEffectCallback(node.arguments[0]);
      if (callback) {
        const fetchCalls = apiFetchCallsReachableFrom(callback, localFunctions);
        if (fetchCalls.length > 0) {
          if (!containsControllerConstruction(callback)) {
            const kind = "missing-controller";
            violations.push({
              filePath,
              line: lineOf(sourceFile, node),
              fingerprint: fingerprint(filePath, kind, node, sourceFile),
              reason: `${node.expression.text} starts apiFetch without creating an AbortController`,
            });
          }
          if (!containsAbortCleanup(callback)) {
            const kind = "missing-cleanup";
            violations.push({
              filePath,
              line: lineOf(sourceFile, node),
              fingerprint: fingerprint(filePath, kind, node, sourceFile),
              reason: `${node.expression.text} starts apiFetch without aborting during cleanup`,
            });
          }
          for (const fetchCall of fetchCalls) {
            if (!hasSignalOption(fetchCall)) {
              const kind = "missing-fetch-signal";
              violations.push({
                filePath,
                line: lineOf(sourceFile, fetchCall),
                fingerprint: fingerprint(filePath, kind, fetchCall, sourceFile),
                reason: "effect-triggered apiFetch does not receive a signal option",
              });
            }
          }
          for (const helperCall of calledLocalFunctions(callback, localFunctions)) {
            if (
              apiFetchCallsReachableFrom(
                localFunctions.get(helperCall.expression.text),
                localFunctions,
                new Set([helperCall.expression.text]),
              ).length > 0 &&
              !hasSignalArgument(helperCall)
            ) {
              const kind = "missing-helper-signal";
              violations.push({
                filePath,
                line: lineOf(sourceFile, helperCall),
                fingerprint: fingerprint(filePath, kind, helperCall, sourceFile),
                reason: `effect does not pass its AbortSignal to ${helperCall.expression.text}()`,
              });
            }
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return violations;
}

function collectSourceFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...collectSourceFiles(entryPath));
    else if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name))) files.push(entryPath);
  }
  return files;
}

function runSelfTest() {
  const cases = [
    {
      name: "accepts a direct cancelled effect request",
      expected: 0,
      source: `useEffect(() => {
        const controller = new AbortController();
        apiFetch("/api/items", { signal: controller.signal });
        return () => controller.abort();
      }, []);`,
    },
    {
      name: "rejects a direct effect request without cancellation",
      expected: 3,
      source: `useEffect(() => { apiFetch("/api/items"); }, []);`,
    },
    {
      name: "rejects aborting immediately instead of during cleanup",
      expected: 1,
      source: `useEffect(() => {
        const controller = new AbortController();
        apiFetch("/api/items", { signal: controller.signal });
        controller.abort();
      }, []);`,
    },
    {
      name: "accepts signal forwarding through a loader",
      expected: 0,
      source: `
        const load = useCallback(async (signal) => {
          await apiFetch("/api/items", { signal });
        }, []);
        useFocusEffect(useCallback(() => {
          const controller = new AbortController();
          load(controller.signal);
          return () => controller.abort();
        }, [load]));`,
    },
    {
      name: "rejects a loader invoked without the effect signal",
      expected: 1,
      source: `
        const load = async (signal) => apiFetch("/api/items", { signal });
        useEffect(() => {
          const controller = new AbortController();
          load();
          return () => controller.abort();
        }, []);`,
    },
    {
      name: "ignores user-triggered mutation handlers",
      expected: 0,
      source: `
        const handleSubmit = async () => apiFetch("/api/items", { method: "POST" });
        const handleDelete = async () => apiFetch("/api/items/1", { method: "DELETE" });
        const handleRefresh = async () => apiFetch("/api/items");`,
    },
  ];

  for (const testCase of cases) {
    const actual = findViolations(testCase.source).length;
    if (actual !== testCase.expected) {
      throw new Error(`${testCase.name}: expected ${testCase.expected}, got ${actual}`);
    }
  }
  console.log(`✓ Effect apiFetch abort guard self-test passed (${cases.length} cases).`);
}

if (process.argv.includes("--self-test")) {
  runSelfTest();
  process.exit(0);
}

const violations = [];
let checkedFiles = 0;
for (const directory of SOURCE_DIRS) {
  for (const filePath of collectSourceFiles(path.resolve(MOBILE_DIR, directory))) {
    checkedFiles += 1;
    violations.push(
      ...findViolations(fs.readFileSync(filePath, "utf8"), path.relative(process.cwd(), filePath)),
    );
  }
}

if (process.argv.includes("--update-baseline")) {
  const fingerprints = [...new Set(violations.map((violation) => violation.fingerprint))].sort();
  fs.writeFileSync(BASELINE_PATH, `${JSON.stringify(fingerprints, null, 2)}\n`);
  console.log(`✓ Wrote ${fingerprints.length} legacy fingerprints to ${BASELINE_PATH}.`);
  process.exit(0);
}

const baseline = new Set(
  fs.existsSync(BASELINE_PATH) ? JSON.parse(fs.readFileSync(BASELINE_PATH, "utf8")) : [],
);
const currentFingerprints = new Set(violations.map((violation) => violation.fingerprint));
const newViolations = violations.filter((violation) => !baseline.has(violation.fingerprint));
const staleBaseline = [...baseline].filter(
  (legacyFingerprint) => !currentFingerprints.has(legacyFingerprint),
);

if (newViolations.length > 0 || staleBaseline.length > 0) {
  console.error("✗ Uncancelled effect-triggered mobile apiFetch calls found.");
  console.error("  Effects must own an AbortController, pass its signal, and abort it during cleanup.");
  for (const violation of newViolations) {
    console.error(`  ${violation.filePath}:${violation.line} — ${violation.reason}`);
  }
  if (staleBaseline.length > 0) {
    console.error(
      `  ${staleBaseline.length} legacy fingerprint(s) are stale; remove fixed entries with --update-baseline so the same bug cannot return unnoticed.`,
    );
  }
  process.exit(1);
}

console.log(
  `✓ Effect apiFetch abort guard passed across ${checkedFiles} mobile app/component source files (${currentFingerprints.size} fingerprinted legacy violation(s) unchanged).`,
);