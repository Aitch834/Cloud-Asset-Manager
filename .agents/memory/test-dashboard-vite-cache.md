---
name: Test-dashboard Vite deps cache — persistent "Invalid hook call" fix
description: Complete root cause and all fix layers for recurring "Invalid hook call" on any tab in the test-dashboard. There are TWO distinct causes — proxy stale-cache AND in-memory transform-cache staleness — both must be addressed.
---

## The TWO root causes (both must be fixed)

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

### Layer 1b — FIXED (tokenless) dep-chunk URLs — STRIP ?v=HASH, NO session token
Absolute dep-chunk URLs embedded in compiled source files are rewritten:
  `/base/node_modules/.vite/deps/react.js?v=HASH`  →  `/base/@td/deps/react.js`
                                                         ↑ NO session token — by design

WHY no token: Replit's external proxy (*.replit.dev) normalises the `@td/TOKEN/` segment
when building its cache key:
  `/base/@td/SESSION_A/@fs/.../SeedStorePage.tsx`  →  cache key: `/base/@fs/.../SeedStorePage.tsx`
This means @fs/ source files CAN be served from proxy cache with an OLD session's dep-chunk
URLs embedded (`@td/SESSION_A/deps/react.js`). If fresh source files embed SESSION_B dep URLs
and cached ones embed SESSION_A dep URLs, the browser sees two react.js module identities →
two React instances → "Invalid hook call".
Fix: dep chunks are at a FIXED tokenless path `/base/@td/deps/react.js`. Every source file
(proxy-cached or fresh) embeds the same URL → one React instance. ✓

WHY strip ?v=HASH: dep chunks use RELATIVE imports internally without ?v=, so the browser
resolves relative chunk refs to `.../dep.js` (no hash). Keeping ?v= would split the module
registry between imports-with-hash and relative-without-hash.

Regex: `"BASE/node_modules/.vite/deps/([^"?#]+)(?:\\?[^"]*)?"`  (group 1 = bare filename)
Replacement: `"BASE/@td/deps/${filename}"`  (no token)

Incoming request handler (in order — MUST check fixed before tokenized):
  1. `tdDepsFixedRe` (`^BASE@td/deps/`) → strip → serve from `.vite/deps/` with body rewriting
  2. `tdDepsRe` (`^BASE@td/[^/]+/deps/`) → strip token+deps → serve from `.vite/deps/` (legacy fallback)
  3. `tdPathRe` (`^BASE@td/[^/]+/`) → strip token → serve @fs/ source file

When tokenized legacy dep-chunk URLs arrive (proxy-cached tabs with old scheme), the legacy
`tdDepsRe` handler also serves the chunk with body rewriting active → cross-chunk refs inside
that chunk are rewritten to `@td/deps/` (fixed) → dep chain unifies at chunk level. ✓

### Layer 1c — relative cross-chunk imports in dep chunks rewritten to absolute fixed-path URLs
Vite pre-bundled dep chunks reference sibling chunks with RELATIVE imports, e.g.:
  `import { require_react } from "./chunk-KC53NVYV.js";`
The browser resolves relative imports relative to the SERVING URL base:
  @td/deps/react.js          → @td/deps/chunk-KC53NVYV.js           ✓ (fixed)
  @td/OLD_TOKEN/deps/react.js → @td/OLD_TOKEN/deps/chunk-KC53NVYV.js ✗ (old-token)
Old-token dep chains propagate the token through every relative import in the chain →
two separate require_react_development factories → two React objects → crash.

FIX: in interceptText body transformer, when `url.includes("/.vite/deps/")` (we're serving
a dep chunk), also rewrite every `"./CHUNK.js"` to `"/base/@td/deps/CHUNK.js"` (absolute,
fixed). Applied AFTER the depsUrlRe pass so ALL cross-chunk references in dep chunks are
fixed regardless of which URL prefix the dep chunk was requested at.
Regex: `/"\.\/([^"?#]+\.js)(?:\?[^"]*)?"/g`  → `"${sessionBase}@td/deps/${filename}"`

Combined effect: any dep chunk served at ANY prefix (fixed or old-token legacy) has ALL its
sibling chunk refs pointing to the same absolute fixed-path URLs → single dep chain → one
React instance even after a hard refresh that hits stale proxy-cached source files. ✓

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
content never causes dual-module issues. Dep chunks are excluded because they already use
fixed canonical URLs.

**Applied:** SeedStorePage.tsx (378KB → 512KB padded). No source file changes needed.

### Layer 6 — Service Worker: normalize old-token dep-chunk AND source-file URLs (sw-v4.js)

**Four distinct proxy-cache problems addressed by the SW:**

**Part A — dep-chunk identity split (fixed by dep-chunk normalization):**
Replit's proxy caches ALL responses by URL path. When a source file is served from proxy
cache it may embed `@td/OLD_TOKEN/deps/react.js`. The browser loads react.js at an old-token
URL → separate module identity from the canonical `@td/deps/react.js` → two React instances.
SW intercepts `@td/TOKEN/deps/FILE`, fetches canonical `@td/deps/FILE`, returns it directly.

**Part B — source-file identity split (fixed by source-file normalization in sw-v4.js):**
The proxy caches source files with cache key stripped of `@td/TOKEN/`:
  `/test-dashboard/@td/SESSION1/@fs/.../SeedStorePage.tsx`  → key: `@fs/.../SeedStorePage.tsx`
SeedStorePage cached from SESSION1 embeds `@td/SESSION1/@fs/.../use-app-store.ts` (old token).
App.tsx (served fresh) imports `use-app-store.ts` at `@td/SESSION2/@fs/.../use-app-store.ts`.
Browser sees TWO different `use-app-store.ts` module URLs → two Zustand stores → `useAppStore()`
from SeedStorePage's chain calls `useSyncExternalStore` in a context where the React dispatcher
doesn't recognize it → "Invalid hook call".

**Part C — raw Vite dep URLs from pre-interceptText proxy cache (sw-v4.js Case 0):**
Source files proxy-cached BEFORE interceptText was added embed raw Vite pre-bundle URLs:
  `import { create } from "/test-dashboard/node_modules/.vite/deps/zustand.js?v=OLD_HASH"`
Those dep files contain RELATIVE chunk imports (`./chunk-KC53NVYV.js`) which the browser
resolves to `node_modules/.vite/deps/chunk-KC53NVYV.js` — a DIFFERENT URL from the canonical
`@td/deps/chunk-KC53NVYV.js` used by `react.js` and `react-dom_client.js` → two React instances
→ "Invalid hook call". OLD_FS_RE only rewrites old-token source file URLS, not their dep imports.
SW Case 0 intercepts `node_modules/.vite/deps/FILE` → redirects to canonical `@td/deps/FILE`.

**Part D — current-token @xfs/ source files bypass OLD_FS_RE (sw-v4.js Case 3):**
OLD_FS_RE has a negative lookahead excluding CURRENT_TOKEN URLs — it only rewrites old-token
source file requests. But when SeedStorePage (proxy-cached, with current-token @xfs/ imports)
imports `use-app-store.ts` at the current token, the SW does NOT intercept it. The proxy serves
its cached `@xfs/use-app-store.ts` entry, which may be stale (from before interceptText). The
stale `use-app-store.ts` has raw dep URLs → Part C cascade. Fix: Case 3 intercepts ALL
current-token `@xfs/FILE` requests and fetches with `?_t=TOKEN` nonce, guaranteeing a proxy
cache miss (unique URL per session) → Vite always serves fresh canonically-URL'd content. ✓

**The SW reads its CURRENT_TOKEN from its own registration URL (`?v=SESSION_TOKEN`), then:**
0. Intercepts `node_modules/.vite/deps/FILE[?v=*]` → fetches canonical `@td/deps/FILE` (Part C)
1. Intercepts `@td/OLD_TOKEN/deps/FILE` → fetches `@td/deps/FILE` (Part A fix)
2. Intercepts `@td/OLD_TOKEN/@[x]fs/FILE` where OLD_TOKEN ≠ CURRENT_TOKEN
   → fetches `@td/CURRENT_TOKEN/@xfs/FILE?_t=TOKEN` (Part B fix with nonce; `@x?fs` handles both)
3. Intercepts `@td/CURRENT_TOKEN/@xfs/FILE` → fetches same URL + `?_t=TOKEN` (Part D fix)

**CRITICAL — ?_t=TOKEN query-string nonce does NOT work (v6 bug, fixed in v7):**
The Replit proxy STRIPS query strings from cache keys for @xfs/ paths. So `@xfs/FILE?_t=TOKEN`
has the SAME cache key as `@xfs/FILE` every session → always a proxy HIT → always stale.

**v7 fix — path-based nonce (@xfs-TOKEN/ scheme):**
SW fetches `@td/TOKEN/@xfs-TOKEN/FILE` instead of `@td/TOKEN/@xfs/FILE?_t=TOKEN`.
Proxy strips `@td/TOKEN/` → cache key `@xfs-TOKEN/FILE`. TOKEN is unique per session →
guaranteed proxy cache MISS → Vite serves fresh padded content → proxy cannot cache (512KB+). ✓
Server middleware strips `/@xfs(?:-[^/]+)?\/` → `/@fs/` (regex handles both old and new scheme).
SW Cases 2 AND 3 both use `@xfs-TOKEN/` fetch scheme. index.html registers sw-v7.js.

Negative lookahead on CURRENT_TOKEN in the regex prevents matching current-session URLs,
avoiding infinite intercept loops. All source files converge on CURRENT_TOKEN URLs. ✓

**CRITICAL: Do NOT use Response.redirect() for ES module imports.**
Browsers do NOT follow SW-returned redirects (`Response.redirect(302)`) for ES module
`import` statements. Use `fetch(canonicalUrl, { cache: 'no-store' })` instead.

**Files:**
- `artifacts/test-dashboard/public/sw-v4.js` — current SW (dep + source-file normalization)
- `artifacts/test-dashboard/index.html` — registers sw-v4.js (NOT type=module script)
- `artifacts/test-dashboard/vite.config.ts` — middleware serving sw-v*.js + HTML rewriter

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
   The HTML body rewriter replaces `sw-v4.js` in the `register()` call with
   `sw-v4.js?v=SESSION_TOKEN`. Each new Vite session → new token → new URL → proxy cache
   miss → server serves fresh `application/javascript`. Middleware strips query params when
   matching. **Never hardcode the SW filename in index.html** — it must receive the session
   token query param from the server-side HTML rewriter. The SW reads its current token from
   `self.location.search` (i.e. from the `?v=` param of its own registration URL).

4. **SW scope and URL filters.**
   Scope = `/test-dashboard/`. Only intercepts same-origin requests. CURRENT_TOKEN-matching
   source-file URLs are excluded by negative lookahead to prevent infinite fetch loops.

5. **Auto-reload when controller is null (hard refresh + first visit recovery).**
   index.html inline script: register SW, then if `!navigator.serviceWorker.controller`,
   call `navigator.serviceWorker.ready.then(() => location.reload())`. For hard refresh
   (SW bypassed → controller null), `.ready` resolves as a microtask BEFORE any module
   scripts execute → reload fires before React renders → zero visible crash. For first visit
   (SW installing), reload fires after SW activates → brief flash, then auto-recovers.

6. **skipWaiting() + clients.claim()** ensure the SW takes control immediately after activation.

7. **Bump SW filename when changing SW behaviour** (sw-v3.js → sw-v4.js). This forces
   browsers that have the old SW installed to register the new one and call skipWaiting().
   The vite.config.ts regex `/sw(?:-v\d+)?\.js/` matches any version suffix automatically.

## React Refresh collision — ALL pages loaded eagerly (CRITICAL — found 2026-07-09)

Dashboard App.tsx imports ALL pages statically (not lazy, except FlyTippingPage).
React Refresh registers component families for EVERY page simultaneously. When two
pages define a component with the SAME function name (e.g. `TabBar`, `EmptyState`,
`ConfirmDialog`), React Refresh conflates their families → `performReactRefresh()`
fires during the initial render → "Invalid hook call" on whichever component's first
hook runs at that moment.

**How to detect:** `grep -rn "^function X\|^export function X" .../pages/ --include="*.tsx"` for any name appearing in 2+ files → collision.

**Fix:** Rename the local functions with a 2-4 char page prefix so each name is unique across the entire pages/ tree. For OrganicVenisonPage use `OV` prefix, VenisonProductionPage use `VP` prefix, etc.

**Applied (2026-07-09):**
- OrganicVenisonPage.tsx: TabBar→OVTabBar, TabButton→OVTabButton, SectionHeader→OVSectionHeader, EmptyState→OVEmptyState, FieldView→OVFieldView
- VenisonProductionPage.tsx: TabBar→VPTabBar, TabButton→VPTabButton, SectionHeader→VPSectionHeader, EmptyState→VPEmptyState, KpiCard→VPKpiCard, FieldView→VPFieldView

**Outstanding collisions (not yet renamed — may cause other page crashes):**
- `ConfirmDialog` — 16 files (LivestockPage, FarmSettings, BeefProductionPage, SheepProductionPage, PigProductionPage, PoultryProductionPage, GoatProductionPage, ViticulturePage, BiofuelPage, CarbonPage, DiversificationPage, EnvironmentalPageFull, WaterIrrigationPage, FreshProducePage, SoilSensorsTab, FlocksTab)
- `EmptyState` — still in BusinessReportsPage, OrganicArablePage, OrganicVenisonPage*, VenisonProductionPage*, SuppliersStock, HarvestPage, SprayPage
- `DataTable` — 11 files; `StatusBadge` — 13 files; `StatCard` — 6 files; etc.

**Rule:** When a new page is crashing with "Invalid hook call" and the SW is active and the file is large (>512KB), check for name collisions FIRST before investigating proxy cache issues.

## HTML response must also have no-store (CRITICAL — fixed 2026-07-09)

The `isModuleUrl` guard that overrides `Cache-Control: no-store` was missing HTML
URL patterns (`rawUrl === "/"`, `rawUrl.endsWith("/")`, `/.html?/`). This meant the
index.html response could be proxy-cached by Replit's proxy WITH the old tokenless SW
registration URL baked in (`sw-v4.js` without `?v=TOKEN`). On the next session:
1. Proxy serves old HTML → SW registered at tokenless `/test-dashboard/sw-v4.js`
2. Proxy has a stale/bad cached response for that tokenless URL → 502
3. SW fails to install → no intercept → SeedStorePage crashes ("Invalid hook call")

**Fix:** Add HTML patterns to `isModuleUrl` in `vite.config.ts` so HTML also gets
`Cache-Control: no-store`. Also bump the SW filename (sw-v4.js → sw-v5.js) to
immediately bust any existing bad cached entry for the tokenless URL.

**Rule:** Whenever the SW filename is bumped, ALSO ensure `isModuleUrl` covers HTML
so the new tokenless URL never accumulates a bad proxy-cache entry.

## Mid-render performReactRefresh() from lazy page compilation (CRITICAL — 2026-07-09)

**Root cause:** Vite compiles source files LAZILY on first browser request. The test-dashboard
has 98 pages all statically imported in App.tsx. Large pages (LivestockPage 500KB+) take 40–60
seconds to compile on their first fetch. When Vite finishes compiling any file mid-session,
`@react-refresh` calls `performReactRefresh()`. If ANOTHER component (e.g. `SeedStorePage`) is
in the middle of its first render at that exact moment, the React dispatcher is in the wrong
state → "Invalid hook call" at the first hook call in that component.

**Symptom:** Crash ~44 seconds after page load, even with fresh session token, fresh source
files, correct dep chunks, no dep re-optimisation. Babel deoptimise log in the workflow log
fires ~44 seconds after the session starts (mid-session, not at startup).

**Fix — two parts (both required in `vite.config.ts`):**

1. **`server.warmup.clientFiles`**: list ALL page files from `artifacts/dashboard/src/pages/*.tsx`.
   Vite pre-compiles them all at server startup, before the browser makes any requests.
   → No more mid-session compilations → no spurious `performReactRefresh()`.

2. **Strip `?_t=NONCE` from `req.url` before Vite sees it:**
   The SW Case 3 appends `?_t=TOKEN` to source-file URLs to bust the proxy cache.
   When the browser fetches `LivestockPage.tsx?_t=TOKEN`, Vite sees a new URL not in
   its transform cache → recompiles the file → triggers `performReactRefresh()` again,
   undoing the warmup benefit. Strip `?_t=` in the middleware (after the `/@td/` strip
   but before the URL reaches Vite's pipeline) → Vite reuses the warmed-up module. ✓

   Added before the existing `?td=TOKEN` strip block:
   ```ts
   if ((req.url as string)?.includes("_t=")) {
     req.url = (req.url as string)
       .replace(/[?&]_t=[^&]*/g, "")
       .replace(/\?&/g, "?")
       .replace(/[?&]$/g, "") || "/";
   }
   ```

**Side effect of _t strip:** `createHotContext` module IDs are now clean paths without the
nonce (e.g. `"/@fs/.../SeedStorePage.tsx"` not `"/@fs/.../SeedStorePage.tsx?_t=TOKEN"`).
React Refresh family IDs are stable across sessions. ✓

**Rule:** Whenever a new page is added to `artifacts/dashboard/src/pages/`, add it to the
`server.warmup.clientFiles` list in `artifacts/test-dashboard/vite.config.ts`. The list is
maintained manually (not glob-generated) because the config is a static file.

## @react-refresh no-op stub — definitive fix for performReactRefresh() crashes

**Root cause of all `performReactRefresh()` triggered crashes:**
`registerExportsForReactRefresh(filename, currentExports)` (line 604 of the real `@react-refresh`)
calls `performReactRefresh()` every time ANY compiled module is evaluated by the browser.
This fires both at startup (warmup) AND when the browser fetches each source file URL.
If a component is mid-render when this fires, React's dispatcher is corrupted → "Invalid hook call".

**Definitive fix:** Intercept `/@react-refresh` in the configureServer middleware and return a
no-op ES module stub instead of the real React Refresh runtime. The test-dashboard is a demo/test
viewer — not a development environment — so HMR is not needed.

**The stub must export ALL these symbols (v5 @vitejs/plugin-react):**
- `injectIntoGlobalHook(globalObj)` — sets `$RefreshReg$` and `$RefreshSig$` as no-ops
- `register(type, id)` — no-op
- `createSignatureFunctionForTransform()` — returns `(type) => type`
- `__hmr_import(moduleId)` — **MUST return `Promise.resolve({})`** — called by compiled preamble
  as `RefreshRuntime.__hmr_import(import.meta.url).then(currentExports => ...)`. Missing this
  export causes `RefreshRuntime.__hmr_import is not a function` crash.
- `registerExportsForReactRefresh(filename, moduleExports)` — no-op, intentionally NO
  `performReactRefresh()` call
- `validateRefreshBoundaryAndEnqueueUpdate(prevExports, nextExports)` — returns `null`
- `default` export: object with all of the above

**Location in vite.config.ts:** Step 4 (before the interceptText step, after the SW file step).
Intercept: `if ((req.url as string)?.includes("/@react-refresh"))`.

**Interaction with warmup:** warmup pre-compiles pages at startup (before browser requests).
The no-op stub means those compilations don't call `performReactRefresh()`. Both fixes are
kept in place for defence-in-depth.

## Mid-render dep discovery via missing use-sync-external-store dep chunks

**Root cause (2026-07-09):** `zustand/traditional.mjs` and `@uppy/react` both import
`use-sync-external-store/shim/with-selector` and `use-sync-external-store/with-selector.js`.
This package is NOT hoisted to `artifacts/test-dashboard/node_modules/` or
`artifacts/dashboard/node_modules/`. Without it in `optimizeDeps.include`:
1. A stale proxy-cached source file requests `@td/deps/use-sync-external-store_shim_with-selector.js`
2. Vite: "file does not exist" → triggers dep re-optimisation → browserHash changes → chunk names change
3. `vite:beforeFullReload` → `regenToken()` → split module graph → two React instances → "Invalid hook call"

**Fix:**
- Add regex aliases for all `use-sync-external-store` sub-paths pointing to the pnpm
  virtual-store path (dynamically resolved via `fs.realpathSync` from zustand's real path):
  ```ts
  { find: /^use-sync-external-store\/shim\/with-selector(?:\.js)?$/, replacement: ses("shim/with-selector.js") },
  { find: /^use-sync-external-store\/shim(?:\/index(?:\.js)?)?$/,    replacement: ses("shim/index.js") },
  { find: /^use-sync-external-store\/with-selector(?:\.js)?$/,       replacement: ses("with-selector.js") },
  { find: /^use-sync-external-store(?:\/index(?:\.js)?)?$/,          replacement: ses("index.js") },
  ```
- Add all four variants + `zustand/traditional` to `optimizeDeps.include` and `dedupe`

**CRITICAL: must use REGEX aliases, NOT string aliases.**
String aliases use `startsWith()` matching: `"use-sync-external-store"` also matches
`"use-sync-external-store/with-selector.js"` → replacement becomes `.../index.js/with-selector.js`
(path does not exist → same crash). Regex aliases use `id.replace(regex, replacement)` which
matches the FULL string exactly.

**Result:** All four dep chunks (`use-sync-external-store.js`, `_shim.js`, `_with-selector.js`,
`_shim_with-selector.js`) pre-bundled at startup. No mid-render dep discovery possible.
React factory chunk (`chunk-KC53NVYV.js`) name is STABLE after adding these new includes.

## Proxy-cached real @react-refresh bypasses server-side stub (CRITICAL — Layer 7)

**Root cause:** The Replit proxy caches the **real** `@react-refresh` module under the cache
key `/test-dashboard/@react-refresh` from a session that predated our no-op stub.
When the browser requests the bare `/test-dashboard/@react-refresh` URL, the proxy serves
the cached real module — our server-side stub intercept at Step 4 is **never reached**.
The real module calls `performReactRefresh()` mid-render → "Invalid hook call" at
`useAppStore()` in SeedStorePage, even though `curl localhost:18652/.../test-dashboard/@react-refresh`
correctly shows our stub (localhost bypasses the proxy).

**Symptom:** Crash persists after stub was added; stub verified server-side via curl; crash
still deterministic at SeedStorePage:447; delay is ~40-170s (Clerk init + first heavy render).

**Why crash is delayed ~60s (not immediate):** The real `@react-refresh`'s `injectIntoGlobalHook()`
wraps `window.__REACT_DEVTOOLS_GLOBAL_HOOK__` to intercept ALL React commits and call
`performReactRefresh()` after each. This includes re-renders triggered by Clerk's session
verification completing (~60s after load). When ClerkProvider context updates → React commit →
`performReactRefresh()` fires → corrupts React's concurrent fiber state → next render of
SeedStorePage throws "Invalid hook call" at the first hook call (`useAppStore()`).

**Fix A (vite.config.ts interceptText):** Rewrite the `@react-refresh` import URL in every
compiled source file from a bare path to a session-tokenized `@xfs/` path:
```
"/test-dashboard/@react-refresh"
  →  "/test-dashboard/@td/TOKEN/@xfs/@react-refresh"
```
Code added after the `fsUrlRe` rewrite block:
```ts
result = result.replace(
  `"${sessionBase}@react-refresh"`,
  `"${sessionBase}@td/${sessionToken}/@xfs/@react-refresh"`,
);
```
Proxy strips `@td/TOKEN/` → cache key `@xfs/@react-refresh` — never seen before → proxy MISS
→ reaches Vite → Step 4 intercept fires → stub returned → proxy caches STUB for all future
sessions. ✓ This handles NEWLY served source files.

**Fix B (sw-v6.js Case 4 — the decisive fix):** SW Case 4 intercepts ANY URL containing
`@react-refresh` and returns the no-op stub **inline** (no network, no proxy). This handles:
- Bare URLs: `/test-dashboard/@react-refresh` (proxy-cached old source files)
- Tokenized URLs: `/test-dashboard/@td/TOKEN/@xfs/@react-refresh` (fresh files via interceptText)

Case 4 is placed FIRST (before Cases 0-3) so it fires immediately without any network round-trip.
The inline `REACT_REFRESH_STUB` string constant is returned as `new Response(stub, { 'Content-Type':
'application/javascript' })`. ✓

**Fix C (index.html version-aware reload):** The SW controller check was upgraded from
`!ctrl` to `!ctrl || !ctrl.scriptURL.includes('sw-v6')`. This forces a reload whenever an OLD
SW version (sw-v5.js etc.) is controlling the page, ensuring sw-v6.js (with Case 4) is always
fully in control before any module scripts execute.

**Why curl vs browser behaves differently:** curl hits `localhost:18652` directly (bypasses
proxy → stub served). Browser hits `*.replit.dev` (goes through proxy → cached real module
served). Always verify proxy behaviour from the browser perspective, not curl.

**Rule:** SW inline response (no network) is the ONLY reliable way to intercept a URL when the
proxy may have the real module cached. A server-side stub is insufficient if the proxy serves
the cached real module before the request reaches the server.

## What NOT to do
- Do NOT look for a hooks violation in the component source — the component code is correct.
- Do NOT add `optimizeDeps.force:true` — it re-hashes chunks on every restart, making
  the proxy caching problem worse.
- Do NOT put a locally-defined hook-heavy tab component inside `<TabsContent>` (Radix
  Presence) — render it OUTSIDE the `<Tabs>` block with a conditional render instead.
- Do NOT leave `export function SameName` in a module that is indirectly loaded alongside
  the consumer — same-named component registrations across modules confuse React Refresh.

## Babel compile failure → stale HMR state (post-resolution note)

When `vite:react-babel` fails to compile a source file (e.g. due to a duplicate
`export { X }` re-export before the function declaration), Vite sends an error event
via WebSocket. The browser's ES module cache may retain the previously-compiled module,
which can have MISMATCHED React Refresh signatures vs the current running code.

Even after the compilation error is fixed and a new HMR update arrives, the browser
can remain in a bad state (hooks counter mismatch → "Invalid hook call") if it has
a mix of old and new compiled modules in its cache.

**Fix for this scenario**: Restart the test-dashboard workflow. The startup script
clears `node_modules/.vite`, which regenerates the session token on next start, 
forcing the browser to reload all modules fresh — any stale HMR state is cleared.

**Key diagnostic**: if the error is deterministic (always on first render of the
specific component) but all dep chunks share the same session token and there are
0 "discovered" deps in _metadata.json, the cause is stale HMR module state, not
a live dep re-optimization race. Restart the server to clear it.

## Confirmed-working state (sw-v7 + @react-refresh no-op)

Verified July 2026: SeedStorePage renders correctly end-to-end. Browser logs confirm:
- `[TD server] @react-refresh no-op stub loaded (server-side)` — first load (pre-SW)
- `[TD sw-v7] @react-refresh no-op stub loaded (SW inline)` — subsequent loads (post-SW claim)

The two-connection sequence (`[vite] connecting...` × 2) is expected: first load goes
direct to server, then `clients.claim()` activates the SW which reconnects the Vite WS.

### Dep-chunk React chain (all confirmed sharing chunk-KC53NVYV.js):
- react.js → chunk-KC53NVYV.js ✓
- react-dom_client.js → chunk-KC53NVYV.js + chunk-AE322PLF.js + chunk-OUZEF5U7.js ✓
- @tanstack_react-query.js → chunk-KC53NVYV.js ✓
- zustand.js → chunk-KC53NVYV.js ✓
- wouter.js → chunk-KC53NVYV.js ✓

ONE React instance. Wouter renders components via `createElement(component, { params })`
(proper React render, not direct function call). SeedStorePage is a STATIC import
in App.tsx (unlike most pages which are React.lazy). This is fine — the module evaluates
at startup but only RENDERS when the route matches.
