// Codemod: ensure every write-method fetch() throws on non-OK responses.
import fs from "fs";
import path from "path";

const ROOT = path.resolve(process.argv[2] || "src");
const WRITE_RE = /method:\s*["'`](POST|PUT|PATCH|DELETE)/;
const DRY = process.argv.includes("--dry");

let filesChanged = 0, edits = 0, skippedHandled = 0, skippedStatus = 0;
const report = [];

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.(tsx?|jsx?)$/.test(e.name) && !/\.test\./.test(e.name)) yield p;
  }
}

// find matching close paren for open paren at index i (which points at '(')
function matchParen(s, i) {
  let depth = 0, inStr = null, inTemplate = 0;
  for (let j = i; j < s.length; j++) {
    const c = s[j], prev = s[j - 1];
    if (inStr) {
      if (c === inStr && prev !== "\\") inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { inStr = c; continue; }
    if (c === "/" && s[j + 1] === "/") { j = s.indexOf("\n", j); if (j < 0) return -1; continue; }
    if (c === "(") depth++;
    else if (c === ")") { depth--; if (depth === 0) return j; }
  }
  return -1;
}

const OK_THEN = `.then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || \`Request failed (\${r.status})\`); } return r; })`;

for (const file of walk(ROOT)) {
  let src = fs.readFileSync(file, "utf8");
  let out = "";
  let pos = 0;
  let changed = false;
  while (true) {
    const idx = src.indexOf("fetch(", pos);
    if (idx < 0) { out += src.slice(pos); break; }
    // avoid matching e.g. "refetch(" or "apiFetch("
    const before = src[idx - 1];
    if (before && /[\w$.]/.test(before)) { out += src.slice(pos, idx + 6); pos = idx + 6; continue; }
    const open = idx + 5;
    const close = matchParen(src, open);
    if (close < 0) { out += src.slice(pos, idx + 6); pos = idx + 6; continue; }
    const args = src.slice(open + 1, close);
    if (!WRITE_RE.test(args)) { out += src.slice(pos, close + 1); pos = close + 1; continue; }

    // what follows the call?
    let k = close + 1;
    while (k < src.length && /\s/.test(src[k])) k++;
    const following = src.slice(close + 1, close + 500);

    if (src.startsWith(".then", k)) {
      // examine the first .then callback
      const thenOpen = src.indexOf("(", k);
      const thenClose = matchParen(src, thenOpen);
      const cb = src.slice(thenOpen + 1, thenClose + 1);
      if (/\.ok\b|\.status\b/.test(cb)) {
        skippedHandled++;
        out += src.slice(pos, close + 1); pos = close + 1; continue;
      }
      // simple `r => r.json()` style or otherwise: insert ok-check then before it
      out += src.slice(pos, close + 1) + OK_THEN;
      pos = close + 1;
      changed = true; edits++;
      report.push(`${file}: inserted ok-check before .then`);
      continue;
    }

    // no .then chain — check whether nearby following code inspects the response
    if (/\.ok\b|\.status\b/.test(following)) {
      skippedStatus++;
      out += src.slice(pos, close + 1); pos = close + 1; continue;
    }
    out += src.slice(pos, close + 1) + OK_THEN;
    pos = close + 1;
    changed = true; edits++;
    report.push(`${file}: appended ok-check (no chain)`);
  }
  if (changed) {
    filesChanged++;
    if (!DRY) fs.writeFileSync(file, out);
  }
}

console.log(`files changed: ${filesChanged}, edits: ${edits}, skipped(handled in .then): ${skippedHandled}, skipped(status nearby): ${skippedStatus}`);
if (process.argv.includes("--verbose")) console.log(report.join("\n"));
if (DRY && edits > 0) {
  console.error(`FAIL: ${edits} unhandled write-fetch call(s) found under ${ROOT} — they never throw on non-OK responses, so failed saves look successful.`);
  console.error(report.join("\n"));
  console.error(`Fix: add an ok-check (throw on !res.ok), or run: node artifacts/dashboard/scripts/fix-mutation-ok.mjs ${process.argv[2] || "src"}`);
  process.exit(1);
}
