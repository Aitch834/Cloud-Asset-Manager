#!/usr/bin/env node
/**
 * Prevents mobile screens from bypassing the shared external URL helper.
 *
 * URLs that are not provably fixed native schemes must be opened through
 * utils/openExternalUrl.ts so runtime HTTP(S) values stay inside the app's
 * in-app browser. Fixed native schemes such as mailto: and tel: may still use
 * Linking.openURL directly.
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
      let hasInterpolation = false;

      while (index < source.length) {
        const current = source[index];
        if (current === "\\") {
          value += source[index + 1] ?? "";
          index += 2;
          continue;
        }
        if (quote === "`" && current === "$" && source[index + 1] === "{") {
          hasInterpolation = true;
        }
        if (current === quote) {
          index += 1;
          break;
        }
        value += current;
        index += 1;
      }

      tokens.push({
        type: hasInterpolation ? "template" : "literal",
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

function isMemberCall(tokens, index, objectNames, methodName) {
  return (
    tokens[index]?.type === "identifier" &&
    objectNames.has(tokens[index]?.value) &&
    tokens[index + 1]?.value === "." &&
    tokens[index + 2]?.type === "identifier" &&
    tokens[index + 2]?.value === methodName &&
    tokens[index + 3]?.value === "("
  );
}

function collectApiBindings(tokens) {
  const linkingObjects = new Set(["Linking"]);
  const browserObjects = new Set(["WebBrowser"]);
  const linkingFunctions = new Set();
  const browserFunctions = new Set();

  for (let index = 0; index < tokens.length; index += 1) {
    if (tokens[index]?.value !== "import") continue;

    let fromIndex = index + 1;
    while (
      fromIndex < tokens.length &&
      tokens[fromIndex]?.value !== "from" &&
      tokens[fromIndex]?.type !== "literal"
    ) {
      fromIndex += 1;
    }
    if (tokens[fromIndex]?.value === "from") fromIndex += 1;

    const moduleName = tokens[fromIndex]?.value;
    if (
      tokens[fromIndex]?.type !== "literal" ||
      !["expo-linking", "react-native", "expo-web-browser"].includes(moduleName)
    ) {
      continue;
    }

    const isLinkingModule = moduleName === "expo-linking";
    const isBrowserModule = moduleName === "expo-web-browser";
    const objectBindings = isBrowserModule ? browserObjects : linkingObjects;
    const functionBindings = isBrowserModule
      ? browserFunctions
      : linkingFunctions;
    const apiName = isBrowserModule ? "openBrowserAsync" : "openURL";

    if (tokens[index + 1]?.value === "*") {
      const asIndex = index + 2;
      if (
        tokens[asIndex]?.value === "as" &&
        tokens[asIndex + 1]?.type === "identifier"
      ) {
        objectBindings.add(tokens[asIndex + 1].value);
      }
      continue;
    }

    const openBrace = tokens.findIndex(
      (token, tokenIndex) =>
        tokenIndex > index && tokenIndex < fromIndex && token.value === "{",
    );
    if (openBrace === -1) {
      if (
        (isLinkingModule || isBrowserModule) &&
        tokens[index + 1]?.type === "identifier"
      ) {
        objectBindings.add(tokens[index + 1].value);
      }
      continue;
    }

    for (let cursor = openBrace + 1; cursor < fromIndex; cursor += 1) {
      const importedName = tokens[cursor]?.value;
      if (
        importedName !== apiName &&
        !(moduleName === "react-native" && importedName === "Linking")
      ) {
        continue;
      }

      const localName =
        tokens[cursor + 1]?.value === "as"
          ? tokens[cursor + 2]?.value
          : importedName;
      if (moduleName === "react-native") objectBindings.add(localName);
      else functionBindings.add(localName);
    }
  }

  // Track destructuring from any recognized namespace binding.
  for (let index = 0; index < tokens.length; index += 1) {
    if (tokens[index]?.value !== "{") continue;
    const closeBrace = tokens.findIndex(
      (token, tokenIndex) => tokenIndex > index && token.value === "}",
    );
    if (
      closeBrace === -1 ||
      tokens[closeBrace + 1]?.value !== "=" ||
      tokens[closeBrace + 2]?.type !== "identifier"
    ) {
      continue;
    }

    const sourceName = tokens[closeBrace + 2].value;
    const isLinking = linkingObjects.has(sourceName);
    const isBrowser = browserObjects.has(sourceName);
    if (!isLinking && !isBrowser) continue;

    const apiName = isLinking ? "openURL" : "openBrowserAsync";
    const functionBindings = isLinking ? linkingFunctions : browserFunctions;
    for (let cursor = index + 1; cursor < closeBrace; cursor += 1) {
      if (tokens[cursor]?.value !== apiName) continue;
      functionBindings.add(
        tokens[cursor + 1]?.value === ":"
          ? tokens[cursor + 2]?.value
          : apiName,
      );
    }
  }

  return {
    linkingObjects,
    browserObjects,
    linkingFunctions,
    browserFunctions,
  };
}

function findViolations(source, filePath) {
  const tokens = tokenize(source);
  const violations = [];
  const bindings = collectApiBindings(tokens);

  for (let index = 0; index < tokens.length; index += 1) {
    const isBrowserMemberCall = isMemberCall(
      tokens,
      index,
      bindings.browserObjects,
      "openBrowserAsync",
    );
    const isBrowserDirectCall =
      tokens[index]?.type === "identifier" &&
      bindings.browserFunctions.has(tokens[index].value) &&
      tokens[index + 1]?.value === "(";
    if (isBrowserMemberCall || isBrowserDirectCall) {
      violations.push({
        kind: "WebBrowser.openBrowserAsync",
        line: tokens[index].line,
        filePath,
      });
      continue;
    }

    const isLinkingMemberCall = isMemberCall(
      tokens,
      index,
      bindings.linkingObjects,
      "openURL",
    );
    const isLinkingDirectCall =
      tokens[index]?.type === "identifier" &&
      bindings.linkingFunctions.has(tokens[index].value) &&
      tokens[index + 1]?.value === "(";
    if (!isLinkingMemberCall && !isLinkingDirectCall) continue;

    const argumentOffset = isLinkingMemberCall ? 4 : 2;
    const argument = tokens[index + argumentOffset];
    const isFixedNativeScheme =
      argument?.type === "literal" &&
      /^[a-z][a-z0-9+.-]*:/i.test(argument.value.trimStart()) &&
      !/^https?:/i.test(argument.value.trimStart()) &&
      tokens[index + argumentOffset + 1]?.value === ")";

    if (!isFixedNativeScheme) {
      violations.push({
        kind: "Linking.openURL without a fixed native-scheme literal",
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
      name: "flags a multiline dynamically assembled URL",
      source: [
        "const url =",
        '  "https://example.com/" +',
        "  path;",
        "Linking",
        "  .openURL(",
        "    url,",
        "  );",
      ].join("\n"),
      expected: 1,
    },
    {
      name: "flags an interpolated template URL",
      source: "Linking.openURL(`https://example.com/${path}`);",
      expected: 1,
    },
    {
      name: "flags a dynamically assembled native URL for helper routing",
      source: 'Linking.openURL("mailto:" + address);',
      expected: 1,
    },
    {
      name: "flags a bare WebBrowser call",
      source: "WebBrowser.openBrowserAsync(url);",
      expected: 1,
    },
    {
      name: "flags aliased namespace imports",
      source: [
        'import * as Browser from "expo-web-browser";',
        'import * as NativeLinks from "expo-linking";',
        "Browser.openBrowserAsync(url);",
        "NativeLinks.openURL(url);",
      ].join("\n"),
      expected: 2,
    },
    {
      name: "flags direct imports and aliases across multiline calls",
      source: [
        'import { openURL as launchUrl } from "expo-linking";',
        'import { openBrowserAsync as browse } from "expo-web-browser";',
        "launchUrl(",
        "  url,",
        ");",
        "browse(",
        "  url,",
        ");",
      ].join("\n"),
      expected: 2,
    },
    {
      name: "flags React Native Linking aliases",
      source: [
        'import { Linking as NativeLinks } from "react-native";',
        "NativeLinks.openURL(url);",
      ].join("\n"),
      expected: 1,
    },
    {
      name: "flags destructured namespace methods and aliases",
      source: [
        'import * as Links from "expo-linking";',
        'import * as Browser from "expo-web-browser";',
        "const { openURL: launch } = Links;",
        "const { openBrowserAsync } = Browser;",
        "launch(url);",
        "openBrowserAsync(url);",
      ].join("\n"),
      expected: 2,
    },
    {
      name: "allows fixed native schemes through aliased direct imports",
      source: [
        'import { openURL as launchUrl } from "expo-linking";',
        'launchUrl("tel:+441234567890");',
      ].join("\n"),
      expected: 0,
    },
    {
      name: "ignores comments and strings containing API names",
      source: [
        '// import { openURL as launch } from "expo-linking";',
        '// WebBrowser.openBrowserAsync("https://example.com");',
        'const note = "Linking.openURL(\\\'https://example.com\\\')";',
        'const other = "launch(url)";',
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
    "  Use openExternalUrl() from utils/openExternalUrl.ts unless Linking.openURL receives a fixed native-scheme literal.",
  );
  for (const violation of violations) {
    console.error(
      `  ${violation.filePath}:${violation.line} — ${violation.kind}`,
    );
  }
  process.exit(1);
}

console.log(
  "✓ Mobile external URL guard passed: dynamic links use the shared helper, direct Linking calls are fixed native schemes, and no screen calls WebBrowser directly.",
);