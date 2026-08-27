import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import ts from "typescript";

const sourceDirectory = path.resolve(import.meta.dirname, "../src");
const sourceFiles = [];

function collectSourceFiles(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      collectSourceFiles(entryPath);
    } else if (/\.(?:ts|tsx)$/.test(entry.name) && !entry.name.endsWith(".d.ts")) {
      sourceFiles.push(entryPath);
    }
  }
}

function unwrapExpression(expression) {
  while (
    ts.isParenthesizedExpression(expression) ||
    ts.isAsExpression(expression) ||
    ts.isTypeAssertionExpression(expression) ||
    ts.isNonNullExpression(expression)
  ) {
    expression = expression.expression;
  }
  return expression;
}

function isWindowPrintCall(node) {
  if (!ts.isCallExpression(node)) return false;

  const callee = unwrapExpression(node.expression);
  return (
    ts.isPropertyAccessExpression(callee) &&
    ts.isIdentifier(unwrapExpression(callee.expression)) &&
    unwrapExpression(callee.expression).text === "window" &&
    callee.name.text === "print"
  );
}

collectSourceFiles(sourceDirectory);

const violations = [];
for (const fileName of sourceFiles) {
  const sourceFile = ts.createSourceFile(
    fileName,
    fs.readFileSync(fileName, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    fileName.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  function visit(node) {
    if (isWindowPrintCall(node)) {
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(
        node.getStart(sourceFile),
      );
      violations.push(`${path.relative(process.cwd(), fileName)}:${line + 1}:${character + 1}`);
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

if (violations.length > 0) {
  console.error(
    "Live-page window.print() calls are prohibited. Print standalone documents instead:\n" +
      violations.map((violation) => `  ${violation}`).join("\n"),
  );
  process.exitCode = 1;
} else {
  console.log("No live-page window.print() calls found.");
}