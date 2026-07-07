/**
 * Service Worker: normalize old-session-token dep-chunk URLs to canonical
 * @td/deps/ URLs.
 *
 * ROOT CAUSE this fixes:
 * Replit's external proxy (*.replit.dev) caches ALL responses from our Vite
 * dev server (including dep chunks) keyed on URL path, stripping the
 * @td/TOKEN/ segment.  When the proxy serves a stale source file from a
 * previous session it has the old session's dep-chunk URL embedded:
 *   @td/OLD_TOKEN/deps/react.js
 * Fresh source files from the current session embed the fixed canonical URL:
 *   @td/deps/react.js
 * Old dep chunks also have relative sibling imports ("./chunk-KC53NVYV.js")
 * which the browser resolves relative to the serving URL base:
 *   @td/OLD_TOKEN/deps/ → @td/OLD_TOKEN/deps/chunk-KC53NVYV.js  (separate chain)
 *   @td/deps/          → @td/deps/chunk-KC53NVYV.js             (canonical chain)
 * Two separate chunk-KC53NVYV.js modules → two require_react_development
 * factories → two React objects → "Invalid hook call".
 *
 * FIX:
 * Intercept every @td/TOKEN/deps/FILE request and respond with a 302 redirect
 * to @td/deps/FILE (canonical).  The browser follows the redirect, the module
 * is registered in the module map under the canonical URL (@td/deps/FILE), and
 * all relative sibling imports resolve within the @td/deps/ namespace →
 * one consistent dep chain → one React instance regardless of which session
 * the proxy-cached source file came from. ✓
 */

const BASE = '/test-dashboard/';

/**
 * Matches:  /test-dashboard/@td/TOKEN/deps/FILE
 * where TOKEN is NOT literally "deps" (which would be the canonical URL already).
 * Groups: [1]=TOKEN  [2]=FILE (including any subpath for scoped packages)
 */
const OLD_DEP_RE = new RegExp(
  '^' + BASE + '@td\\/(?!deps\\/)([^\\/]+)\\/deps\\/(.+)$'
);

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // Only handle requests to this origin under our base path.
  if (url.origin !== self.location.origin) return;

  const m = url.pathname.match(OLD_DEP_RE);
  if (!m) return;

  // Redirect to the canonical fixed-path URL (no session token).
  const canonical = new URL(event.request.url);
  canonical.pathname = BASE + '@td/deps/' + m[2];
  canonical.search = '';  // strip any stale ?v= query

  event.respondWith(Response.redirect(canonical.href, 302));
});

// Take control immediately on install/activate so the current page
// benefits from the SW on the very first navigation after registration.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(clients.claim()));
