/**
 * Service Worker: normalize ALL old-session-token @td/ URLs to their
 * canonical equivalents so the browser's ES module registry converges on
 * a single module identity for every file, regardless of proxy caching.
 *
 * ROOT CAUSE (two-part):
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
 *   fix alone.
 *
 * Part B — source-file identity split (the remaining crash):
 *   The same proxy-cached source file (SeedStorePage) contains @fs/
 *   imports for sibling source files (use-app-store.ts, AppLayout.tsx, …)
 *   that still embed the OLD session token:
 *     from "@td/SESSION1/@fs/.../use-app-store.ts"
 *   When another module (App.tsx, served fresh) imports use-app-store.ts at
 *   the CURRENT session token:
 *     from "@td/SESSION2/@fs/.../use-app-store.ts"
 *   the browser treats these as TWO SEPARATE modules → two Zustand stores
 *   → useAppStore() in SeedStorePage renders under a store whose
 *   useSyncExternalStore() does not match the React dispatcher's current
 *   context → "Invalid hook call".
 *
 * FIX:
 *   The SW is registered as `sw-v4.js?v=SESSION_TOKEN`, so CURRENT_TOKEN
 *   is available at self.location.search. The SW intercepts:
 *
 *   1. /base/@td/OLD_TOKEN/deps/FILE → /base/@td/deps/FILE
 *      (dep-chunk normalization — unchanged from v3)
 *
 *   2. /base/@td/OLD_TOKEN/@fs/FILE → /base/@td/CURRENT_TOKEN/@fs/FILE
 *      (source-file normalization — NEW in v4)
 *
 *   Result: every source file, regardless of which session's proxy-cached
 *   content referenced it, is resolved to the CURRENT session token URL.
 *   The server then serves it with canonical dep-chunk imports and current
 *   session @fs/ imports → single module identity for every file → one
 *   React instance → no "Invalid hook call". ✓
 *
 * WHY Response.redirect() DOES NOT WORK for ES modules:
 *   Browsers do NOT follow SW-returned redirects for ES module imports.
 *   fetch-and-return (proxy the response body) is the only safe approach.
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
 * Matches: /test-dashboard/@td/TOKEN/deps/FILE
 * where TOKEN is NOT literally "deps" (already canonical — skip).
 * Groups: [1]=TOKEN  [2]=FILE (may include scoped paths like @scope/pkg.js)
 */
const OLD_DEP_RE = new RegExp(
  '^' + BASE + '@td\\/(?!deps\\/)([^\\/]+)\\/deps\\/(.+)$'
);

/**
 * Matches: /test-dashboard/@td/TOKEN/@fs/FILE
 * where TOKEN differs from currentToken (already normalized — skip).
 * Groups: [1]=TOKEN  [2]=FILE (everything after @fs/)
 *
 * The negative lookahead `(?!CURRENT_TOKEN\/)` prevents matching (and
 * re-fetching) URLs that are already at the current session token, which
 * would cause an infinite intercept loop.
 */
const OLD_FS_RE = currentToken
  ? new RegExp(
      '^' + BASE +
      '@td\\/(?!' +
      currentToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
      '\\/)([^\\/]+)\\/@fs\\/(.+)$'
    )
  : null;

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Only intercept same-origin requests (no-op for cross-origin fetches).
  if (url.origin !== self.location.origin) return;

  // ── 1. Dep-chunk URLs: @td/OLD_TOKEN/deps/FILE → @td/deps/FILE ─────────
  //
  // Canonical dep chunks have absolute imports so all transitive sub-imports
  // also resolve to @td/deps/ — single dep chain → one React instance. ✓
  const depMatch = url.pathname.match(OLD_DEP_RE);
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

  // ── 2. Source-file URLs: @td/OLD_TOKEN/@fs/FILE → @td/CURRENT_TOKEN/@fs/FILE
  //
  // Unifies all source file imports under the current session token so the
  // browser's module registry has exactly one entry per file.
  // The server's interceptText handler serves the re-tokenised URL with
  // canonical dep-chunk imports → consistent module graph. ✓
  if (OLD_FS_RE) {
    const fsMatch = url.pathname.match(OLD_FS_RE);
    if (fsMatch) {
      const canonicalUrl = new URL(event.request.url);
      canonicalUrl.pathname = BASE + '@td/' + currentToken + '/@fs/' + fsMatch[2];
      canonicalUrl.search = '';
      event.respondWith(
        fetch(canonicalUrl.href, {
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
