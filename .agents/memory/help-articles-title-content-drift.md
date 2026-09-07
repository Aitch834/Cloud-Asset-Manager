---
name: Help article TITLES/CONTENT index-drift risk
description: defaultHelpArticles.ts pairs two parallel arrays by array index; any insertion in the middle of one without the other causes silent, wrong content on live articles.
---

`artifacts/api-server/src/lib/defaultHelpArticles.ts` builds each help article via `TITLES.map(([title, category], idx) => CONTENT[idx])` — a positional (not keyed) pairing between two separately-maintained arrays.

**Why this is dangerous:** if an entry is ever inserted into `TITLES` (or `CONTENT`) anywhere other than the very end — or one array gets an entry the other doesn't — every subsequent index silently pairs the wrong title with the wrong content. TypeScript does not catch this (both arrays satisfy `[string, string][]`), and the app doesn't error; it just serves mismatched or fabricated-sounding help content live to users. A prior instance of this caused ~240 of ~268 articles to show the wrong body text, undetected until a full-file audit.

**How to apply:** Only ever append new entries to the very end of both `TITLES` and `CONTENT` in the same operation, and verify the count matches immediately after (`TITLES.length === CONTENT.length`). Before trusting this file's content is correct, or after any edit to it, run a verification pass: parse both arrays, extract each `CONTENT[i]`'s `<h2>` heading, and confirm it textually matches `TITLES[i]`'s title. The default seed action can safely refresh known exact historical default fingerprints, but it deliberately skips customized rows. Any correction to previously seeded defaults must register the complete prior excerpt/body fingerprint, including all changes within the article, or existing uncustomized rows will not update.
