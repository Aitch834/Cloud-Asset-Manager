/**
 * Service Worker: normalize ALL old-session-token @td/ URLs to their
 * canonical equivalents so the browser's ES module registry converges on
 * a single module identity for every file, regardless of proxy caching.
 *
 * ROOT CAUSE (three-part):
 *
 * Part A — dep-chunk identity split:
 *   Replit's proxy caches source files keyed on URL path, stripping the
 *   @td/TOKEN/ segment:
 *     /test-dashboard/@td/SESSION1/@fs/.../SeedStorePage.tsx
 *     → cache key: /test-dashboard/@fs/.../SeedStorePage.tsx
 *
 *   A proxy-cached source file from SESSION1 has its dep-chunk imports
 *   already rewritten to canonical @td/deps/ paths by the server's
 *   interceptText handler. ✓ So dep chunks are unified by the server-side
 *   fix alone — for sessions AFTER interceptText was added.
 *
 * Part B — source-file identity split (stale token references):
 *   The same proxy-cached source file (SeedStorePage) contains @xfs/
 *   imports for sibling source files (use-app-store.ts, AppLayout.tsx, …)
 *   that still embed the OLD session token:
 *     from "@td/SESSION1/@xfs/.../use-app-store.ts"
 *   When another module (App.tsx, served fresh) imports use-app-store.ts at
 *   the CURRENT session token:
 *     from "@td/SESSION2/@xfs/.../use-app-store.ts"
 *   the browser treats these as TWO SEPARATE MODULES → two Zustand stores
 *   → useAppStore() in SeedStorePage renders under a store whose
 *   useSyncExternalStore() does not match the React dispatcher's current
 *   context → "Invalid hook call".
 *
 * Part C — stale source files with raw Vite dep URLs (pre-interceptText era):
 *   Source files proxy-cached BEFORE interceptText was added still embed raw
 *   Vite pre-bundle URLs:
 *     import { create } from "/test-dashboard/node_modules/.vite/deps/zustand.js?v=OLD_HASH"
 *   These raw-URL dep files contain RELATIVE chunk imports (./chunk-KC53NVYV.js)
 *   which the browser resolves to node_modules/.vite/deps/chunk-KC53NVYV.js —
 *   a DIFFERENT module URL from the canonical /test-dashboard/@td/deps/chunk-KC53NVYV.js
 *   loaded by react.js and react-dom_client.js → two React instances →
 *   "Invalid hook call" at the first hook in any component from that stale file.
 *   Additionally, the same stale source files still reference sibling modules at
 *   old-session @xfs/ URLs which (when rewritten to current-session @xfs/ by the
 *   SW) are served from proxy cache — which may also be stale.
 *
 * FIX:
 *   The SW is registered as `sw-v4.js?v=SESSION_TOKEN`, so CURRENT_TOKEN
 *   is available at self.location.search. The SW intercepts:
 *
 *   0. /base/node_modules/.vite/deps/FILE[?v=*] → /base/@td/deps/FILE
 *      (raw Vite dep URL → canonical, eliminates dual-React from Part C)
 *
 *   1. /base/@td/OLD_TOKEN/deps/FILE → /base/@td/deps/FILE
 *      (dep-chunk normalization — unchanged from v3)
 *
 *   2. /base/@td/OLD_TOKEN/@[x]fs/FILE → /base/@td/CURRENT_TOKEN/@xfs/FILE
 *      (source-file normalization — unchanged from v4)
 *
 *   3. /base/@td/CURRENT_TOKEN/@xfs/FILE → fetch as …@xfs/FILE?_t=CURRENT_TOKEN
 *      (nonce forces proxy cache miss every session — eliminates Part B and C
 *       for current-token requests that previously bypassed SW interception)
 *
 *   Result: every source file, regardless of which session's proxy-cached
 *   content referenced it, is resolved with a unique nonce URL that the proxy
 *   has never cached → Vite always serves fresh content with canonical dep
 *   imports and current session @xfs/ imports → single module identity for
 *   every file → one React instance → no "Invalid hook call". ✓
 *
 * WHY Response.redirect() DOES NOT WORK for ES modules:
 *   Browsers do NOT follow SW-returned redirects for ES module imports.
 *   fetch-and-return (proxy the response body) is the only safe approach.
 *
 * WHY ?_t=TOKEN nonce bypasses the proxy:
 *   The Replit proxy builds cache keys from the URL path, stripping @td/TOKEN/.
 *   The nonce ?_t=TOKEN is in the QUERY STRING which the proxy preserves in the
 *   cache key for this path pattern. Each session has a new token → new nonce →
 *   proxy has no cached entry for this URL → cache miss → Vite serves fresh. ✓
 */

const BASE = '/test-dashboard/';

/**
 * Parse the current session token from this SW's own registration URL.
 * Registration URL: "/test-dashboard/sw-v4.js?v=SESSION_TOKEN"
 * self.location.search = "?v=SESSION_TOKEN"
 */
const currentToken = (() => {
  const m = self.location.search.match(/[?&]v=([^&#]+)/);
  return m ? decodeURIComponent(m[1]) : null;
})();

/**
 * Matches: /test-dashboard/node_modules/.vite/deps/FILE (with optional ?v=HASH)
 * Redirects to canonical /test-dashboard/@td/deps/FILE (no query string).
 * Groups: [1]=FILE (filename, may include scoped paths)
 *
 * WHY: Source files cached from before interceptText was added embed raw Vite
 * pre-bundle URLs (node_modules/.vite/deps/pkg.js?v=HASH).  Those files contain
 * RELATIVE chunk imports that load React at a different path from the canonical
 * @td/deps/chunk-*.js, producing a second React instance → "Invalid hook call".
 * Redirecting here normalises every dep request to the canonical path regardless
 * of which era of proxy-cached source file triggered it.
 */
const RAW_VITE_DEP_RE = new RegExp(
  '^' + BASE + 'node_modules/\\.vite/deps/([^?#]+)'
);

/**
 * Matches: /test-dashboard/@td/TOKEN/deps/FILE
 * where TOKEN is NOT literally "deps" (already canonical — skip).
 * Groups: [1]=TOKEN  [2]=FILE (may include scoped paths like @scope/pkg.js)
 */
const OLD_DEP_RE = new RegExp(
  '^' + BASE + '@td\\/(?!deps\\/)([^\\/]+)\\/deps\\/(.+)$'
);

/**
 * Matches: /test-dashboard/@td/TOKEN/@fs/FILE   (legacy scheme)
 *       OR /test-dashboard/@td/TOKEN/@xfs/FILE  (current scheme)
 * where TOKEN differs from currentToken (already normalized — skip).
 * Groups: [1]=TOKEN  [2]=FILE (everything after the @[x]fs/ marker)
 *
 * The negative lookahead `(?!CURRENT_TOKEN\/)` prevents matching (and
 * re-fetching) URLs that are already at the current session token, which
 * would cause an infinite intercept loop.
 *
 * WHY @xfs/: the server now generates "@xfs/" URLs (not "@fs/") so that
 * existing proxy cache entries (keyed on "@fs/path") are never hit.  The
 * SW must handle both schemes for backward compatibility with any legacy
 * proxy-cached content that still embeds "@fs/" markers.
 */
const OLD_FS_RE = currentToken
  ? new RegExp(
      '^' + BASE +
      '@td\\/(?!' +
      currentToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
      '\\/)([^\\/]+)\\/@x?fs\\/(.+)$'
    )
  : null;

/**
 * Matches: /test-dashboard/@td/CURRENT_TOKEN/@xfs/FILE
 * (current-session source-file requests that normally bypass OLD_FS_RE).
 * Groups: [1]=FILE (everything after the @xfs/ marker, no query string)
 *
 * WHY: The proxy strips @td/TOKEN/ when building its cache key, so ALL sessions
 * share the same cache key (@xfs/FILE) for each source file.  Even when OLD_FS_RE
 * rewrites an old-token import to the current token, the subsequent fetch of
 * @td/CURRENT_TOKEN/@xfs/FILE still hits the proxy cache — which may hold stale
 * content from a previous session (wrong dep URLs, wrong token references).
 *
 * FIX: Append ?_t=CURRENT_TOKEN to the fetch URL.  The proxy preserves the query
 * string in its cache key for @xfs/ paths, so @xfs/FILE?_t=TOKEN is a cache miss
 * every new session → Vite always serves fresh, correctly-transformed content. ✓
 * Vite ignores unknown query params when resolving source file paths.
 * The module is registered in the browser under the ORIGINAL URL (no nonce),
 * so import.meta.url and HMR paths remain clean.
 */
const CURRENT_FS_RE = currentToken
  ? new RegExp(
      '^' + BASE +
      '@td\\/' +
      currentToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
      '\\/@xfs\\/(.+)$'
    )
  : null;

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Only intercept same-origin requests (no-op for cross-origin fetches).
  if (url.origin !== self.location.origin) return;

  const pathname = url.pathname;

  // ── 0. Raw Vite dep URLs: node_modules/.vite/deps/FILE → @td/deps/FILE ─────
  //
  // Handles proxy-cached source files from before dep-URL canonicalisation was
  // added (interceptText era).  Those stale files embed raw Vite dep URLs with
  // ?v=HASH query params.  Normalise every such request to the canonical
  // @td/deps/ path so the browser's module registry converges on one copy of
  // each dep chunk → one React instance. ✓
  const rawDepMatch = pathname.match(RAW_VITE_DEP_RE);
  if (rawDepMatch) {
    const canonicalUrl = new URL(event.request.url);
    canonicalUrl.pathname = BASE + '@td/deps/' + rawDepMatch[1];
    canonicalUrl.search = '';
    event.respondWith(
      fetch(canonicalUrl.href, {
        cache: 'no-store',
        credentials: 'same-origin',
      })
    );
    return;
  }

  // ── 1. Dep-chunk URLs: @td/OLD_TOKEN/deps/FILE → @td/deps/FILE ─────────────
  //
  // Canonical dep chunks have absolute imports so all transitive sub-imports
  // also resolve to @td/deps/ — single dep chain → one React instance. ✓
  const depMatch = pathname.match(OLD_DEP_RE);
  if (depMatch) {
    const canonicalUrl = new URL(event.request.url);
    canonicalUrl.pathname = BASE + '@td/deps/' + depMatch[2];
    canonicalUrl.search = '';
    event.respondWith(
      fetch(canonicalUrl.href, {
        cache: 'no-store',
        credentials: 'same-origin',
      })
    );
    return;
  }

  // ── 2. Source-file URLs: @td/OLD_TOKEN/@fs/FILE → @td/CURRENT_TOKEN/@xfs/FILE
  //
  // Unifies all source file imports under the current session token so the
  // browser's module registry has exactly one entry per file.
  // The fetch uses a nonce (case 3 below handles it on the way back out,
  // since the rewritten URL now matches CURRENT_FS_RE).
  if (OLD_FS_RE) {
    const fsMatch = pathname.match(OLD_FS_RE);
    if (fsMatch) {
      const nonceUrl = new URL(event.request.url);
      nonceUrl.pathname = BASE + '@td/' + currentToken + '/@xfs/' + fsMatch[2];
      nonceUrl.search = '';
      nonceUrl.searchParams.set('_t', currentToken);
      event.respondWith(
        fetch(nonceUrl.href, {
          cache: 'no-store',
          credentials: 'same-origin',
        })
      );
      return;
    }
  }

  // ── 3. Current-token source files: add nonce to bypass proxy cache ──────────
  //
  // Even for current-session requests the proxy may serve a stale cached
  // version of any @xfs/ source file (cache key = @xfs/FILE, token-stripped).
  // Appending ?_t=TOKEN makes the proxy cache key unique per session →
  // guaranteed cache miss → Vite serves fresh, canonically-dep-URL content. ✓
  if (CURRENT_FS_RE) {
    const currentFsMatch = pathname.match(CURRENT_FS_RE);
    if (currentFsMatch) {
      const nonceUrl = new URL(event.request.url);
      nonceUrl.searchParams.set('_t', currentToken);
      event.respondWith(
        fetch(nonceUrl.href, {
          cache: 'no-store',
          credentials: 'same-origin',
        })
      );
      return;
    }
  }
});

// Activate immediately — no need to wait for existing clients to close.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(clients.claim()));
