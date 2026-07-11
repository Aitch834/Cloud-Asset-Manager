/**
 * Service Worker v7 (dep-nonce patch v8):
 * path-based session nonce for BOTH source files AND dep chunks.
 *
 * KEY CHANGE (v8 patch):
 *   Previously dep chunks used a fixed canonical URL (@td/deps/FILE) shared
 *   across all sessions.  The Replit proxy cached them under this key.  When
 *   Vite's dep optimisation changes chunk assignments between sessions, the
 *   proxy serves zustand.js from session A (references chunk-OLD.js) while
 *   react.js is from session B (references chunk-KC53NVYV.js) → two React
 *   instances → "Invalid hook call" at useAppStore() in SeedStorePage.
 *
 *   v8 FIX: dep chunks now use the same path-nonce scheme as source files:
 *     @td/TOKEN/@deps-TOKEN/FILE
 *   Proxy strips @td/TOKEN/ → cache key "@deps-TOKEN/FILE".
 *   TOKEN changes every session → unique cache key → always a proxy MISS →
 *   server serves fresh dep chunks with CURRENT sibling-chunk cross-references
 *   → all dep chunks in a session use the same chunk versions → one React. ✓
 *
 *   Source file scheme (unchanged from v7):
 *     @td/TOKEN/@xfs/FILE  →  fetch  @td/TOKEN/@xfs-TOKEN/FILE
 *
 *   Server-side (vite.config.ts) strips:
 *     @td/TOKEN/@xfs-TOKEN/ → @fs/
 *     @td/TOKEN/@deps-TOKEN/ → node_modules/.vite/deps/
 *
 * CASE SUMMARY:
 *   0. /base/node_modules/.vite/deps/FILE[?v=*]        → fetch /base/@td/CURRENT/@deps-CURRENT/FILE
 *   1. /base/@td/OLD/deps/FILE (legacy)                 → fetch /base/@td/CURRENT/@deps-CURRENT/FILE
 *   1b./base/@td/deps/FILE (canonical, no token)        → fetch /base/@td/CURRENT/@deps-CURRENT/FILE
 *   1c./base/@td/OLD/@deps-OLD/FILE (old nonce)         → fetch /base/@td/CURRENT/@deps-CURRENT/FILE
 *   2. /base/@td/OLD/@[x]fs/FILE                        → fetch /base/@td/CURRENT/@xfs-CURRENT/FILE
 *   3. /base/@td/CURRENT/@xfs/FILE                      → fetch /base/@td/CURRENT/@xfs-CURRENT/FILE
 *   4. Any URL with @react-refresh                       → inline no-op stub
 */

const BASE = '/test-dashboard/';

const currentToken = (() => {
  const m = self.location.search.match(/[?&]v=([^&#]+)/);
  return m ? decodeURIComponent(m[1]) : null;
})();

// Case 0: raw Vite dep URLs (before SW interception)
const RAW_VITE_DEP_RE = new RegExp(
  '^' + BASE + 'node_modules/\\.vite/deps/([^?#]+)'
);

// Case 1: legacy tokenised dep URLs (@td/OLD/deps/FILE — old format before v8)
const OLD_DEP_RE = new RegExp(
  '^' + BASE + '@td\\/(?!deps\\/)([^\\/]+)\\/deps\\/(.+)$'
);

// Case 1b: canonical dep URL with NO token (@td/deps/FILE — v7 canonical format)
const CANONICAL_DEP_RE = new RegExp(
  '^' + BASE + '@td\\/deps\\/(.+)$'
);

// Case 1c: old nonce dep URL from a DIFFERENT session (@td/OLD/@deps-OLD/FILE)
// Only active when we know the current token (so we can exclude current-session URLs
// which don't need interception — they go direct to network, proxy misses, fresh served).
const OLD_DEPS_NONCE_RE = currentToken
  ? new RegExp(
      '^' + BASE +
      '@td\\/(?!' + currentToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
      '\\/)([^\\/]+)\\/@deps-[^\\/]+\\/(.+)$'
    )
  : null;

// Cases 2+3: old/current-token source file URLs
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

  // ── 0. Raw Vite dep URLs → current-session nonce dep URL
  const rawDepMatch = pathname.match(RAW_VITE_DEP_RE);
  if (rawDepMatch && currentToken) {
    const nonceUrl = new URL(event.request.url);
    nonceUrl.pathname = BASE + '@td/' + currentToken + '/@deps-' + currentToken + '/' + rawDepMatch[1];
    nonceUrl.search = '';
    event.respondWith(fetch(nonceUrl.href, { cache: 'no-store', credentials: 'same-origin' }));
    return;
  }

  // ── 1. Legacy old-token dep chunks (@td/OLD/deps/FILE) → current-session nonce
  const depMatch = pathname.match(OLD_DEP_RE);
  if (depMatch && currentToken) {
    const nonceUrl = new URL(event.request.url);
    nonceUrl.pathname = BASE + '@td/' + currentToken + '/@deps-' + currentToken + '/' + depMatch[2];
    nonceUrl.search = '';
    event.respondWith(fetch(nonceUrl.href, { cache: 'no-store', credentials: 'same-origin' }));
    return;
  }

  // ── 1b. Canonical dep URL with no token (@td/deps/FILE) → current-session nonce
  //
  // Handles stale source files from before v8 that still embed the canonical
  // @td/deps/ URL format.  Redirect to the current-session nonce URL so the
  // dep chunk is always served fresh (proxy miss guaranteed by unique token). ✓
  const canonDepMatch = pathname.match(CANONICAL_DEP_RE);
  if (canonDepMatch && currentToken) {
    const nonceUrl = new URL(event.request.url);
    nonceUrl.pathname = BASE + '@td/' + currentToken + '/@deps-' + currentToken + '/' + canonDepMatch[1];
    nonceUrl.search = '';
    event.respondWith(fetch(nonceUrl.href, { cache: 'no-store', credentials: 'same-origin' }));
    return;
  }

  // ── 1c. Old-session nonce dep URLs (@td/OLD/@deps-OLD/FILE) → current-session nonce
  //
  // Handles stale source files from a PREVIOUS session that already used the v8
  // nonce scheme but with a different token.  Repoint to current-session nonce. ✓
  if (OLD_DEPS_NONCE_RE) {
    const oldNonceDepMatch = pathname.match(OLD_DEPS_NONCE_RE);
    if (oldNonceDepMatch) {
      const nonceUrl = new URL(event.request.url);
      nonceUrl.pathname = BASE + '@td/' + currentToken + '/@deps-' + currentToken + '/' + oldNonceDepMatch[2];
      nonceUrl.search = '';
      event.respondWith(fetch(nonceUrl.href, { cache: 'no-store', credentials: 'same-origin' }));
      return;
    }
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
