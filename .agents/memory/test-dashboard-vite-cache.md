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

### Layer 1b — path-based session token on dep chunks (.vite/deps/ URLs) — STRIP ?v=HASH
Absolute dep-chunk URLs embedded in compiled source files are rewritten:
  `/base/node_modules/.vite/deps/react.js?v=HASH`  →  `/base/@td/TOKEN/deps/react.js`
CRITICAL: ?v=HASH is STRIPPED (not just the prefix replaced). Why: dep chunks use RELATIVE
imports internally without ?v= (e.g. `import "./chunk-KC53NVYV.js"`), which the browser
resolves to `/base/@td/TOKEN/deps/chunk-KC53NVYV.js` (no ?v=). If source files kept
`?v=HASH`, the browser's ES module registry would see two DIFFERENT module identities for
the same React → two React instances → "Invalid hook call".
Stripping ?v= unifies module identity between source-file imports and dep-chunk relative imports.
Regex: `"BASE/node_modules/.vite/deps/([^"?#]+)(?:\\?[^"]*)?"`  (group 1 = bare filename)
Replacement: `"BASE/@td/TOKEN/deps/${filename}"`

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
  grep -oP "^function \K[A-Z][a-zA-Z]+" DairyPage.tsx | sort > /tmp/a.txt
  grep -oP "^function \K[A-Z][a-zA-Z]+" OrganicDairyPage.tsx | sort > /tmp/b.txt
  comm -12 /tmp/a.txt /tmp/b.txt   # prints collisions

**Fix:** use page-prefixed names (OrganicXxx, DairyXxx) for all local components.

Collisions fixed in OrganicDairyPage.tsx:
- JohnesTab → OrganicJohnesTab (DairyPage has DairyJohnesTab)
- AbrBadge → OrganicAbrBadge
- LabResultsBadge → OrganicLabResultsBadge

## Radix Presence / TabsContent — locally-defined hook-heavy components

Do NOT put a locally-defined hook-heavy tab component inside `<TabsContent>` (Radix
Presence) — render it OUTSIDE the `<Tabs>` block with a conditional render instead.
`{activeTab === "tab-value" && <Component ... />}` — NOT inside `<TabsContent>`.
Leave an empty `<TabsContent value="..." />` placeholder so Radix tracks trigger state.
DairyPage uses this same outside-Tabs pattern for all its locally-defined tab components.

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
