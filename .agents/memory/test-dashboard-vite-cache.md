---
name: Test-dashboard Vite deps cache — persistent "Invalid hook call" fix
description: Complete root cause and all fix layers for recurring "Invalid hook call" on any tab in the test-dashboard. Multiple distinct causes — proxy stale-cache AND in-memory transform-cache staleness — all must be addressed.
---

## The root causes (all must be fixed)

### Cause A — Replit proxy caches dep chunks by path, ignoring ?v=HASH
Replit's preview proxy caches responses keyed on URL PATH only (query params stripped).
Vite's dep-serving sets `Cache-Control: max-age=31536000,immutable` on pre-bundled
dep chunks. The proxy caches them as `node_modules/.vite/deps/chunk-XXX.js` (path key).
When the browserHash changes across sessions/restarts, fresh source files reference NEW
dep-chunk hash URLs, but the proxy serves the OLD cached content from the previous hash.
Two different react.js instances in the browser → "Invalid hook call".

### Cause B — Vite's in-memory transform cache retains stale dep-chunk URL references
When Vite re-optimises deps MID-SESSION (triggered by discovering a new dep at runtime),
the browserHash changes. But Vite's in-memory transform cache still holds the previously
compiled output of every source file (.tsx → .js), with the OLD ?v=HASH baked into every
dep-chunk import URL. When the browser reloads after the full-reload event, Vite serves
the STALE transforms (old hash) alongside newly-compiled dep chunks (new hash) → two
different react.js URLs in the browser (different modules) → "Invalid hook call" on
whichever component renders next.

### Cause D — OLD SW rewrites NEW session source-file URLs to OLD session format (v9 fix)
When the Vite server restarts (new session token NEW_TOKEN), the OLD SW installed in the
user's browser (CURRENT_TOKEN = OLD_TOKEN) is STILL the active controller while the new SW
installs. The OLD SW's OLD_FS_RE regex: `@td/(?!OLD_TOKEN)[^/]+/@x?fs/FILE` — it matches
`@td/NEW_TOKEN/@xfs/FILE` (because NEW_TOKEN ≠ OLD_TOKEN) and REWRITES it to
`@td/OLD_TOKEN/@xfs-OLD_TOKEN/FILE`. The proxy serves OLD session content with
@deps-OLD_TOKEN/ dep-chunk URLs. Those dep chunks load chunk-KC53NVYV.js at OLD session URL.
Later SeedStorePage loads fresh (via new SW) with @deps-NEW_TOKEN/ → loads chunk-KC53NVYV.js
at NEW session URL. Browser module registry sees TWO entries for the same file at different
URLs → two separate React objects → "Invalid hook call" at useAppStore() line 522.

**v9 FIX:** change interceptText to embed source file URLs as `@td/TOKEN/@xfs-TOKEN/FILE`
(self-authenticated nonce — token inside the segment name, not just in @td/).
Old SW regex `@x?fs/` only matches `@xfs/` (literal slash after @xfs).
`@xfs-TOKEN/` has a DASH before the slash → old SW does NOT match → passes through.
Proxy key = `@xfs-TOKEN/FILE` (unique per session) → always cache MISS → always fresh. ✓
@react-refresh URL also updated to `@xfs-TOKEN/` format.

**SW Case 2b added:** handles old-session v9-format URLs `@td/OLD/@xfs-OLD/FILE`
(from proxy-cached documents of a previous v9 session) → redirect to current session nonce.

### Cause C — proxy serves dep chunks from DIFFERENT sessions (v8 fix — the persistent crash)
The proxy caches dep chunks under fixed canonical keys (`@td/deps/FILE`) across sessions.
When Vite's dep optimisation changes chunk assignments between sessions (e.g. after pnpm
install or .vite/deps cleared on restart), the proxy may serve zustand.js from session A
(references `chunk-OLD.js`) while react.js is from session B (references `chunk-KC53NVYV.js`).
Two different chunk files → two separate React instances → "Invalid hook call" at the FIRST
hook call (line 522: `useAppStore()`) in SeedStorePage, because Zustand's React differs from
the renderer's React.

**WHY this is hard to see:** chunk names are content-addressed (hash of content), so chunks
with the same name always have the same content. But WHICH chunks get which names can change
when dep optimisation produces different assignments. When that happens, old sessions in
proxy cache reference the old chunk names, new sessions use new names → mixed versions.

## Fix layers implemented in vite.config.ts (reconnectReloadPlugin)

### Layer 0 — intercept res.setHeader to force Cache-Control: no-store on all module responses
Prevents Vite's sirv from overwriting our header with max-age=immutable.
Targets URLs containing `/.vite/deps/`, `/@fs/`, `/@td/`, `/node_modules/`, `/src/`,
`/@react-refresh`, and `/@vite/`.
**IMPORTANT:** `/@react-refresh` and `/@vite/client` MUST be in this list. Without no-store,
Replit's proxy can cache these at fixed URLs across sessions — the React Refresh runtime
retains stale family registrations and the Vite HMR client retains stale module hot contexts,
both of which can lead to dispatcher confusion on the first render of a component that was
newly extracted to its own file.

### Layer 0b — interceptText must ALWAYS transform (never skip on res.headersSent)
The `interceptText` wrapper patches `res.end` to apply dep-URL rewriting. It must NEVER
skip the transformation even when `res.headersSent` is already true. If headers were already
flushed (e.g. by `res.flushHeaders()` in some Vite middleware path), the body is still
buffered by our `res.write` wrapper and must be transformed before sending. Skipping
transformation when `res.headersSent=true` would serve raw dep URLs (no session token) →
second React instance → "Invalid hook call".
Fix: removed `if (res.headersSent) { return _end(raw); }` bypass; only skip
`res.removeHeader("content-length")` when headers are already sent.

### Layer 1 — path-based session token on source files (@fs/ URLs)
Every @fs/ source-file URL embedded in compiled JS is rewritten to include SESSION TOKEN
in the PATH:  `/base/@fs/path`  →  `/base/@td/TOKEN/@fs/path`
Proxy sees a different path each session → cache miss → always fresh.

### Layer 1b — DEP CHUNK NONCE URLs (v8 fix — @deps-TOKEN/ scheme)
Absolute dep-chunk URLs embedded in compiled source files are rewritten to include a
per-session token in both the @td/ prefix AND the @deps- segment:
  `/base/node_modules/.vite/deps/react.js?v=HASH`
  → `/base/@td/TOKEN/@deps-TOKEN/react.js`

WHY session-token nonce (same scheme as @xfs-TOKEN/ for source files):
Proxy strips `@td/TOKEN/` from cache key → effective key is `@deps-TOKEN/react.js`.
TOKEN is unique per Vite server session → cache key is unique per session → always a
proxy MISS → server always serves fresh dep chunk content with CURRENT sibling-chunk
cross-references → all dep chunks in a session use the same chunk versions → one React. ✓

WHY strip ?v=HASH: dep chunks use RELATIVE imports internally without ?v=, so the browser
resolves relative chunk refs to `.../dep.js` (no hash). Keeping ?v= would split the module
registry between imports-with-hash and relative-without-hash.

Regex: `"BASE/node_modules/.vite/deps/([^"?#]+)(?:\\?[^"]*)?"`  (group 1 = bare filename)
Replacement: `"BASE/@td/${sessionToken}/@deps-${sessionToken}/${filename}"`

Incoming request handler order in vite.config.ts (MUST check fixed before tokenized):
  1. `tdDepsFixedRe` (`^BASE@td/deps/`) → strip → serve from `.vite/deps/` (legacy backward compat)
  2. `tdDepsRe` (`^BASE@td/[^/]+/deps/`) → strip token+deps → serve from `.vite/deps/` (legacy fallback)
  3. `tdDepsNonceRe` (`^BASE@td/[^/]+/@deps-[^/]+/`) → strip → serve from `.vite/deps/` (v8 nonce)
  4. `tdPathRe` (`^BASE@td/[^/]+/`) → strip token → serve @fs/ source file

### Layer 1c — relative cross-chunk imports in dep chunks rewritten to absolute nonce URLs
Vite pre-bundled dep chunks reference sibling chunks with RELATIVE imports, e.g.:
  `import { require_react } from "./chunk-KC53NVYV.js";`
The browser resolves relative imports relative to the SERVING URL base.

FIX: in interceptText body transformer, when `url.includes("/.vite/deps/")` (we're serving
a dep chunk), also rewrite every `"./CHUNK.js"` to the current session nonce URL (absolute).
Regex: `/"\.\/([^"?#]+\.js)(?:\?[^"]*)?"/g`  → `"${sessionBase}@td/${sessionToken}/@deps-${sessionToken}/${filename}"`

Combined effect: any dep chunk served at ANY prefix (fixed, legacy, or nonce) has ALL its
sibling chunk refs pointing to the CURRENT session's nonce URLs → single consistent dep
chain → one React instance. ✓

### Layer 2 — entry-script path token in index.html
The `<script type="module" src="...">` entry point is also rewritten with the session token.

### Layer 3 — startup-token endpoint (server-restart detection)
Client (main.tsx) fetches `/__td_startup_token__` on vite:ws:connect; if token changed
since last load, reloads the page before stale hashes can mix.

### Layer 4 — moduleGraph.invalidateAll() on full-reload + token regen (FIX FOR CAUSE B)
When Vite fires a full-reload event (dep re-optimisation changed the browserHash mid-session),
the plugin calls invalidateAll() BEFORE regenerating the session token. This flushes Vite's
in-memory transform cache. The browser reloads → fetches source files with the new session
token → Vite re-transforms them fresh → embeds the CURRENT browserHash in dep-chunk URLs →
single consistent React instance.

## React Refresh instrumentation limit — very large modules

When a single source file grows large enough to register 9+ components with React Refresh,
the Babel instrumentation can produce corrupted hook-dispatcher state for components near
the end of the registration sequence (e.g. `_c9` / `_s6` in a 7,561-line compiled file).

**Symptom:** "Invalid hook call" on a specific component that is:
  - The 9th+ registered component in its module (9th `$RefreshReg$` call)
  - The 6th+ hook-using component in its module (6th `$RefreshSig$` call)
  - Using the SAME first hook (`useQueryClient()`) as earlier components that work fine
  - Named uniquely (no React Refresh name collisions)
  - Deterministic — crashes on every mount, not just after HMR

**Fix:** Extract the crashing component into its own separate file.
  - The component gets a completely isolated React Refresh module scope
  - Its compiled output has just `_s` (1 sig) and `_c` (1 reg) — no sequence issues
  - The `Cache-Control: no-store` headers (Layer 0) prevent any small-file proxy caching issue

**Applied fix:** OrganicJohnesTab extracted from OrganicDairyPage.tsx
  → `artifacts/dashboard/src/pages/OrganicJohnesTab.tsx`
  OrganicDairyPage.tsx now imports it: `import { OrganicJohnesTab } from "@/pages/OrganicJohnesTab"`

**Rule:** if a page file has 8+ named function components registered by React Refresh AND
one of them crashes with "Invalid hook call" despite correct code, extract the crashing
component to its own file. Do NOT inline it further — the module size IS the problem.

## React Refresh component name collisions

If TWO modules imported by the test-dashboard define a component with the SAME function
name (e.g. both define `function JohnesTab`), React Refresh conflates their families →
"Invalid hook call" on the component that renders second, even after the file renaming.

**Detection:**
  grep -rn "^function EmptyState\|^function XxxTab" artifacts/dashboard/src/pages/ --include="*.tsx"
  # Any function name appearing in 2+ files is a collision candidate.
  grep -oP "^function \K[A-Z][a-zA-Z]+" DairyPage.tsx | sort > /tmp/a.txt
  grep -oP "^function \K[A-Z][a-zA-Z]+" OrganicDairyPage.tsx | sort > /tmp/b.txt
  comm -12 /tmp/a.txt /tmp/b.txt   # prints collisions

**IMPORTANT — generic utility names collide across MANY files:**
Generic names like `EmptyState`, `EmptyRow`, `LoadingSpinner`, `ErrorBanner` are
defined in 5–8 page files simultaneously. React Refresh family conflict from these
causes the SAME "Invalid hook call" crash as the more subtle cache bugs. Always
grep ALL page files for collisions before concluding the cause is a cache issue.

**Fix:** use page-prefixed names (OrganicXxx, DairyXxx, SeedStoreXxx) for ALL
locally-defined components — even tiny utility components like EmptyState.

Collisions fixed:
- OrganicDairyPage.tsx: JohnesTab → OrganicJohnesTab, AbrBadge → OrganicAbrBadge,
  LabResultsBadge → OrganicLabResultsBadge
- SeedStorePage.tsx: EmptyState → SeedStoreEmptyState

## Radix Presence / TabsContent — locally-defined hook-heavy components

Do NOT put a locally-defined hook-heavy tab component inside `<TabsContent>` (Radix
Presence) — render it OUTSIDE the `<Tabs>` block with a conditional render instead.
`{activeTab === "tab-value" && <Component ... />}` — NOT inside `<TabsContent>`.
Leave an empty `<TabsContent value="..." />` placeholder so Radix tracks trigger state.
DairyPage uses this same outside-Tabs pattern for all its locally-defined tab components.

## Child-component small-file trap — "Invalid hook call" on render, not on import

**Symptom:** A component that was extracted to its own file (OrganicJohnesTab.tsx) still
crashes with "Invalid hook call" even though its own hooks are correct. The crash is
attributed to a child component (e.g. `JohnesTabInner`, `DocAttach`, `RecordAttachments`).

**Root cause:** The extracted component IMPORTS and RENDERS other small @fs/ files
(DocAttach.tsx ~100 lines, RecordAttachments.tsx ~200 lines). Those small files are
proxy-cached with stale session tokens → different React instance. If those child
components call hooks (useToast, useUpload, useQueryClient, useQuery), those hooks
fire with the WRONG React → "Invalid hook call". The medium stub didn't crash because
it imported the same files but NEVER RENDERED them (no JSX element created).

**Detection:** "Invalid hook call" error stacktrace names a component that is NOT in
the current file's imports list but IS a child rendered inside it. The component that
actually crashes in the console (`JohnesTabInner`, `DocAttach`) may differ from the
component React attributes the error to.

**Fix:** Inline the problematic child component code directly into the parent's file.
Remove the `import` and copy the function body verbatim. All code in the same file
shares the same module-level React import → single React instance → no crash.

**Applied to:** OrganicJohnesTab.tsx — inlined DocAttach and RecordAttachments
directly; removed `import { DocAttach }` and `import { RecordAttachments }`.

**CRITICAL RENAME RULE:** When inlining a component from a separate file, the original
file still exists and is loaded by other pages (DairyPage.tsx imports DocAttach.tsx,
etc.). React Refresh sees TWO registrations of the same name → family conflict → crash
attributed to the PARENT component (OrganicJohnesTab) not the inlined one. Always
rename inlined copies with a page-specific prefix: `DocAttach` → `JohnesDocAttach`,
`RecordAttachments` → `JohnesRecordAttachments`. Also rename their Props interfaces.

**Rule:** If any extracted component file imports OTHER small component files that
themselves use hooks, inline those child components with UNIQUE names. Only the large
page files (500KB+ that escape proxy caching) can safely import small hook-using
components as separate files.

## Cross-root @fs/ hook import trap — lib/ workspace packages

**Symptom:** "Invalid hook call" on a page that imports a hook from a workspace `lib/`
package (e.g. `@workspace/object-storage-web` aliased to `lib/object-storage-web/src/use-upload.ts`).
The page itself is large (>500KB, immune to proxy caching). No mid-session dep discoveries.
Session token IS being embedded in URLs. Crash is deterministic.

**Root cause:** `lib/object-storage-web/src/use-upload.ts` lives OUTSIDE `artifacts/dashboard/src/`.
Although the session-token and no-store layers apply, the external lib file is a small @fs/
module. In edge cases (timing, content-type detection, or Vite 7 serving order) the dep-chunk
URL rewrite inside the external file can fail to apply, causing `useState`/`useCallback` inside
the hook to load from a different React module identity than the rest of the component tree.

**Fix:** Remove the external workspace lib import. Inline the hook logic directly inside the
component that uses it. For `useUpload`, replace with a plain async function inside `handleFile()`
that performs the two-step presigned-URL upload flow inline using vanilla `fetch()`.

**Applied to:** `SeedStorePage.tsx` — removed `import { useUpload } from "@workspace/object-storage-web"`,
removed `const { uploadFile } = useUpload()`, inlined the upload steps in `handleFile()`.
Also replaced `React.useRef` namespace call with the named `useRef` import for clarity.

**Rule:** Any hook from a `lib/` workspace package (outside `artifacts/dashboard/src/`) that is
imported into a page file is at risk. Inline the hook's logic into the calling component rather
than relying on the @fs/ chain for external lib files.

### Layer 5 — Anti-proxy-cache padding for medium-sized source files (vite.config.ts interceptText)

**Problem:** Source files in the 256KB–490KB compiled-size range are proxy-cached AND embed
session tokens in their @fs/ imports. When the proxy serves a stale-session version, the browser
creates TWO module registry entries for the same file (one at old-token URL, one at current-token
URL). React Refresh detects both entries registering the same family key and calls
`performReactRefresh()` WHILE the component is being rendered for the first time. At that instant
the React dispatcher is in the wrong state → "Invalid hook call" at the first hook call (line 388
of compiled SeedStorePage: `const { farmId } = useAppStore()`).

**Fix:** At the end of the JS body transform in `interceptText`, after all URL rewrites:
- If the result is a source file (not a dep chunk — excludes `/.vite/deps/` and `/@td/deps/`)
- AND the compiled byte length is ≥ 256KB and < 512KB
- Append a `/* [spaces] */` comment to pad the file to exactly 512KB

Files above ~500KB are NOT cached by Replit's proxy (confirmed empirically: CompliancePage
at 500KB+ never crashes; SeedStorePage at 378KB consistently crashes). The padding makes the
proxy issue a cache miss → always-fresh content → consistent single session token → one module
per file → no React Refresh family conflict → hooks work correctly.

**Scope:** Only source files in the dangerous 256KB–490KB zone. Tiny files (<256KB) are excluded
because they only import from canonical dep chunks (no @fs/ sub-imports) so their proxy-cached
content never causes dual-module issues. Dep chunks are excluded because they use session-token
nonce URLs.

**Applied:** SeedStorePage.tsx (378KB → 512KB padded). No source file changes needed.

### Layer 6 — Service Worker: normalize all dep-chunk AND source-file URLs (sw-v7.js)

**Six distinct cases handled by the SW:**

**Case 0 — raw Vite dep URLs** (`/base/node_modules/.vite/deps/FILE[?v=*]`):
Source files proxy-cached BEFORE interceptText was added embed raw Vite pre-bundle URLs.
SW redirects to current-session nonce: `@td/CURRENT/@deps-CURRENT/FILE`.

**Case 1 — legacy tokenised dep URLs** (`@td/OLD/deps/FILE`):
Old-format dep URLs (before v8 nonce scheme). SW redirects to nonce URL.

**Case 1b — canonical dep URLs** (`@td/deps/FILE`, no token):
Source files from the v7-era (before dep nonce was added) embed canonical @td/deps/ URLs.
SW redirects to nonce URL so always-fresh dep chunks are served.

**Case 1c — old-session nonce dep URLs** (`@td/OLD/@deps-OLD/FILE`):
Source files from a PREVIOUS session that already used the v8 nonce scheme but with a
different token. SW redirects to current-session nonce URL.

**Case 2 — old-token source files** (`@td/OLD/@[x]fs/FILE`):
Stale proxy-cached source files from a different session. SW rewrites to current-session
path-nonce: `@td/CURRENT/@xfs-CURRENT/FILE`.

**Case 3 — current-token source files** (`@td/CURRENT/@xfs/FILE`):
Even current-session @xfs/ requests can hit stale proxy cache. SW fetches via nonce.

**Case 4 — @react-refresh** (any URL containing `@react-refresh`):
Returns inline no-op stub. Prevents real React Refresh from calling performReactRefresh()
mid-render → would corrupt dispatcher → "Invalid hook call".

**The SW reads its CURRENT_TOKEN from `self.location.search` (`?v=SESSION_TOKEN`).**

**CRITICAL — ?_t=TOKEN query-string nonce does NOT work (v6 bug, fixed in v7):**
The Replit proxy STRIPS query strings from cache keys for @xfs/ paths. So `@xfs/FILE?_t=TOKEN`
has the SAME cache key as `@xfs/FILE` every session → always a proxy HIT → always stale.

**v7/v8 fix — path-based nonce (@xfs-TOKEN/ and @deps-TOKEN/ schemes):**
SW fetches `@td/TOKEN/@xfs-TOKEN/FILE` for source files (proxy key = `@xfs-TOKEN/FILE`).
SW fetches `@td/TOKEN/@deps-TOKEN/FILE` for dep chunks (proxy key = `@deps-TOKEN/FILE`).
TOKEN is unique per session → guaranteed proxy cache MISS every session. ✓

Server middleware strips `/@xfs(?:-[^/]+)?\/` → `/@fs/` and `@deps-[^/]+/` → `.vite/deps/`.
index.html registers sw-v7.js (filename unchanged; content update triggers auto-reinstall).

**CRITICAL: Do NOT use Response.redirect() for ES module imports.**
Browsers do NOT follow SW-returned redirects (`Response.redirect(302)`) for ES module
`import` statements. Use `fetch(nonceUrl, { cache: 'no-store' })` instead.

**Files:**
- `artifacts/test-dashboard/public/sw-v7.js` — current SW with all 6 cases
- `artifacts/test-dashboard/index.html` — registers sw-v7.js (NOT type=module script)
- `artifacts/test-dashboard/vite.config.ts` — middleware + interceptText rewriting

**Critical implementation notes:**

1. **Serve SW via explicit middleware route, NOT from `public/` directory.**
   Vite's SPA fallback intercepts `.js` URLs and returns `text/html`. Must add explicit
   handler in `configureServer` middleware BEFORE the `!isJsModule && !isHtml → next()` check.
   Regex: `/^.+\/(sw(?:-v\d+)?\.js)(?:\?.*)?$/` — handles any sw-v*.js with optional ?v=.
   Sets `Content-Type: application/javascript`, `Cache-Control: no-store`,
   `Service-Worker-Allowed: /test-dashboard/`.

2. **Proxy caches by Vary: Origin — browser requests get DIFFERENT cache entries from curl.**
   When `Vary: Origin` is set, the proxy creates separate cache entries for requests with/without
   Origin header. Curl (no Origin) → fresh fetch from server → correct JS. Browser (has Origin)
   → may get a STALE cached HTML response (from a prior failed attempt). Verify SW delivery
   with a browser-like tool that sends Origin headers, not just curl.

3. **Inject session token into SW registration URL to bust proxy cache per session.**
   The HTML body rewriter replaces `sw-v7.js` in the `register()` call with
   `sw-v7.js?v=SESSION_TOKEN`. Each new Vite session → new token → new URL → proxy cache
   miss → server serves fresh `application/javascript`. The SW reads its current token from
   `self.location.search` (i.e. from the `?v=` param of its own registration URL).

4. **SW scope and URL filters.**
   Scope = `/test-dashboard/`. Only intercepts same-origin requests. CURRENT_TOKEN-matching
   source-file URLs are excluded by negative lookahead to prevent infinite fetch loops.
   Current-session dep nonce URLs (`@td/CURRENT/@deps-CURRENT/FILE`) are NOT intercepted by
   SW — they pass through to the proxy which misses (unique URL) → server serves fresh. ✓

5. **Auto-reload when controller is null (hard refresh + first visit recovery).**
   index.html inline script: register SW, then if `!navigator.serviceWorker.controller`,
   call `navigator.serviceWorker.ready.then(() => location.reload())`. For hard refresh
   (SW bypassed → controller null), `.ready` resolves as a microtask BEFORE any module
   scripts execute → reload fires before React renders → zero visible crash. For first visit
   (SW installing), reload fires after SW activates → brief flash, then auto-recovers.

6. **skipWaiting() + clients.claim()** ensure the SW takes control immediately after activation.

## React Refresh collision — ALL pages loaded eagerly (CRITICAL — found 2026-07-09)

Dashboard App.tsx imports ALL pages statically (not lazy, except FlyTippingPage).
React Refresh registers component families for EVERY page simultaneously. When two
pages define a component with the SAME function name (e.g. `TabBar`, `EmptyState`,
`ConfirmDialog`), React Refresh conflates their families → `performReactRefresh()`
fires during render → "Invalid hook call".

**ALWAYS grep for name collisions FIRST** before investigating cache/proxy issues:
```
grep -rn "^export default function\|^function [A-Z]" artifacts/dashboard/src/pages/ --include="*.tsx" | grep -oP "function \K[A-Z][a-zA-Z]+" | sort | uniq -d
```
Any name appearing 2+ times across all page files is a collision candidate.

## Dep chunk internals — key chunk names (React 19.1.0)

- `chunk-KC53NVYV.js` — React CJS implementation (require_react_development). Contains FULL React source.
- `chunk-RCACXQ3E.js` — Zustand vanilla store (createStore)
- `chunk-G3PMV62Z.js` — CommonJS helpers (__commonJS, __toESM, etc.)
- `react.js` — thin re-export: `import { require_react } from chunk-KC53NVYV.js; export default require_react();`
- `zustand.js` — imports require_react from chunk-KC53NVYV.js (SAME chunk as react.js → one React)

After v8 fix, ALL cross-chunk imports in dep chunks use session-token nonce URLs
`@td/TOKEN/@deps-TOKEN/CHUNK.js` → proxy cannot serve mixed-session content. ✓
