/**
 * Service Worker v7: path-based session nonce for source-file fetches.
 *
 * KEY CHANGE vs v6:
 *   v6 used ?_t=TOKEN (query-string nonce) to bust the proxy cache.
 *   Empirically the Replit proxy STRIPS query strings from its cache keys
 *   for @xfs/ paths, so every session got the same stale cached response.
 *
 *   v7 embeds the token in the URL PATH SCHEME instead:
 *     @td/TOKEN/@xfs/FILE  →  fetch  @td/TOKEN/@xfs-TOKEN/FILE
 *   Proxy strips @td/TOKEN/ → cache key @xfs-TOKEN/FILE.
 *   TOKEN changes every session → unique cache key → always a MISS →
 *   Vite serves fresh, padded content → proxy cannot cache (512 KB+)
 *   → never stale again. ✓
 *
 *   Server-side (vite.config.ts) strips @xfs-TOKEN/ → @fs/ via:
 *     /@xfs(?:-[^/]+)?\//  →  /@fs/
 *
 * CASE SUMMARY:
 *   0. /base/node_modules/.vite/deps/FILE[?v=*]   → /base/@td/deps/FILE
 *   1. /base/@td/OLD_TOKEN/deps/FILE               → /base/@td/deps/FILE
 *   2. /base/@td/OLD_TOKEN/@[x]fs/FILE             → fetch /base/@td/CURRENT/@xfs-CURRENT/FILE
 *   3. /base/@td/CURRENT_TOKEN/@xfs/FILE           → fetch /base/@td/CURRENT/@xfs-CURRENT/FILE
 *   4. Any URL with @react-refresh                 → inline no-op stub
 */

const BASE = '/test-dashboard/';

const currentToken = (() => {
  const m = self.location.search.match(/[?&]v=([^&#]+)/);
  return m ? decodeURIComponent(m[1]) : null;
})();

const RAW_VITE_DEP_RE = new RegExp(
  '^' + BASE + 'node_modules/\\.vite/deps/([^?#]+)'
);

const OLD_DEP_RE = new RegExp(
  '^' + BASE + '@td\\/(?!deps\\/)([^\\/]+)\\/deps\\/(.+)$'
);

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
 * Does NOT match @xfs-TOKEN/ — that is the nonce fetch URL, not an import URL.
 */
const CURRENT_FS_RE = currentToken
  ? new RegExp(
      '^' + BASE +
      '@td\\/' +
      currentToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
      '\\/@xfs\\/(.+)$'
    )
  : null;

const REACT_REFRESH_STUB = `
// @react-refresh no-op stub (sw-v7 inline — HMR disabled in test-dashboard)
console.log('[TD sw-v7] @react-refresh no-op stub loaded (SW inline)');
export function injectIntoGlobalHook(globalObj) {
  globalObj.$RefreshReg$ = function() {};
  globalObj.$RefreshSig$ = function() { return function(type) { return type; }; };
}
export function register(type, id) {}
export function createSignatureFunctionForTransform() {
  return function(type, key, forceReset, getCustomHooks) { return type; };
}
export function __hmr_import(moduleId) { return Promise.resolve({}); }
export function registerExportsForReactRefresh(filename, moduleExports) {}
export function validateRefreshBoundaryAndEnqueueUpdate(prevExports, nextExports) { return null; }
export function performReactRefresh() {}
export default { injectIntoGlobalHook, register, createSignatureFunctionForTransform, __hmr_import, registerExportsForReactRefresh, validateRefreshBoundaryAndEnqueueUpdate, performReactRefresh };
`;

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  const pathname = url.pathname;

  // ── 4. @react-refresh → inline no-op stub (placed first to avoid network risk)
  if (pathname.includes('@react-refresh')) {
    event.respondWith(
      new Response(REACT_REFRESH_STUB, {
        status: 200,
        headers: {
          'Content-Type': 'application/javascript; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      })
    );
    return;
  }

  // ── 0. Raw Vite dep URLs → canonical @td/deps/FILE
  const rawDepMatch = pathname.match(RAW_VITE_DEP_RE);
  if (rawDepMatch) {
    const canonicalUrl = new URL(event.request.url);
    canonicalUrl.pathname = BASE + '@td/deps/' + rawDepMatch[1];
    canonicalUrl.search = '';
    event.respondWith(fetch(canonicalUrl.href, { cache: 'no-store', credentials: 'same-origin' }));
    return;
  }

  // ── 1. Old-token dep chunks → canonical @td/deps/FILE
  const depMatch = pathname.match(OLD_DEP_RE);
  if (depMatch) {
    const canonicalUrl = new URL(event.request.url);
    canonicalUrl.pathname = BASE + '@td/deps/' + depMatch[2];
    canonicalUrl.search = '';
    event.respondWith(fetch(canonicalUrl.href, { cache: 'no-store', credentials: 'same-origin' }));
    return;
  }

  // ── 2. Old-token source files → fetch via @xfs-TOKEN/ path nonce
  //
  // WHY path nonce not query string: the Replit proxy strips query strings from
  // cache keys for @xfs/ paths, making ?_t=TOKEN nonces ineffective (v6 bug).
  // Embedding the token in the PATH SCHEME (@xfs-TOKEN/) creates a unique cache
  // key per session → proxy cache MISS guaranteed → server serves fresh. ✓
  if (OLD_FS_RE) {
    const fsMatch = pathname.match(OLD_FS_RE);
    if (fsMatch) {
      const nonceUrl = new URL(event.request.url);
      nonceUrl.pathname = BASE + '@td/' + currentToken + '/@xfs-' + currentToken + '/' + fsMatch[2];
      nonceUrl.search = '';
      event.respondWith(fetch(nonceUrl.href, { cache: 'no-store', credentials: 'same-origin' }));
      return;
    }
  }

  // ── 3. Current-token source files → fetch via @xfs-TOKEN/ path nonce
  //
  // Even current-session @xfs/ requests can hit a stale proxy cache entry.
  // The @xfs-TOKEN/ path nonce guarantees a miss every session. ✓
  if (CURRENT_FS_RE) {
    const currentFsMatch = pathname.match(CURRENT_FS_RE);
    if (currentFsMatch) {
      const nonceUrl = new URL(event.request.url);
      nonceUrl.pathname = BASE + '@td/' + currentToken + '/@xfs-' + currentToken + '/' + currentFsMatch[1];
      nonceUrl.search = '';
      event.respondWith(fetch(nonceUrl.href, { cache: 'no-store', credentials: 'same-origin' }));
      return;
    }
  }
});

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(clients.claim()));
