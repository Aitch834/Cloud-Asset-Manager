---
name: RLS fix script — regex line-replacement pitfall
description: When a bulk-fix script replaces entire lines matched by regex, trailing content on the same line is silently lost.
---

## The Rule
When a regex matches the START of a line (e.g. `const farmId = ...`) and the script replaces the **entire line**, any content after the matched pattern on the same line is destroyed.

## Why
The farms.ts fix script matched `const farmId = Number(req.params.farmId)` via regex, then replaced the full `lines[i]` string. Some handlers had both declarations on one line:
```ts
const farmId = Number(req.params.farmId); const id = Number(req.params.id);
```
After replacement, `const id` was silently dropped, causing 50+ TypeScript "Cannot find name 'id'" errors.

## How to Apply
- After any bulk regex-line-replace, run `tsc --noEmit` and look for "Cannot find name" errors — these signal dropped trailing content.
- Fix: either (a) scan for multi-statement lines before replacing, or (b) replace only the matched substring rather than the whole line (`line.replace(regex, newSubstring)`), or (c) append the post-match suffix: `line.slice(match.index + match[0].length)`.
- For the `_req`→`req` issue: stub routes with `_req` parameter that gain a `validateFarmAccess(req, res)` call need the parameter renamed from `_req` to `req`.
