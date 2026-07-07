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
