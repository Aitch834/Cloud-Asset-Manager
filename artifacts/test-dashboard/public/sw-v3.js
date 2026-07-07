/**
 * Service Worker: normalize old-session-token dep-chunk URLs to canonical
 * @td/deps/ content.
 *
 * ROOT CAUSE:
 * Replit's external proxy caches responses keyed on URL path, stripping
 * @td/TOKEN/. Proxy-cached source files from old sessions embed old-token dep
 * URLs (@td/OLD_TOKEN/deps/react.js). The old dep chunks have relative sibling
 * imports ("./chunk-KC53NVYV.js") that resolve to @td/OLD_TOKEN/deps/chunk-*
 * — a separate module chain from the canonical @td/deps/chunk-* used by fresh
 * files → two React instances → "Invalid hook call".
 *
 * WHY Response.redirect() DOES NOT WORK for ES modules:
 * Browsers do NOT follow SW-returned redirects for ES module imports. The
 * browser treats them as a network error or ignores them, falling back to the
 * original URL which the proxy serves with stale content.
 *
 * FIX — fetch-and-return (proxy the response):
 * Intercept @td/TOKEN/deps/FILE requests, fetch the canonical @td/deps/FILE
 * URL and return that response body directly. The canonical dep chunks now have
 * absolute imports ("/test-dashboard/@td/deps/chunk-KC53NVYV.js") so all
 * sub-imports resolve to the same canonical module map entries used by the rest
 * of the app. Old-token and new-token dep requests converge on the same chain.
 * ONE chunk-KC53NVYV.js → ONE require_react_development → ONE React. ✓
 */

const BASE = '/test-dashboard/';

/**
 * Matches: /test-dashboard/@td/TOKEN/deps/FILE
 * where TOKEN is NOT literally "deps" (already canonical — skip).
 * Groups: [1]=TOKEN  [2]=FILE (may include scoped paths like @scope/pkg.js)
 */
const OLD_DEP_RE = new RegExp(
  '^' + BASE + '@td\\/(?!deps\\/)([^\\/]+)\\/deps\\/(.+)$'
);

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Only intercept same-origin requests.
  if (url.origin !== self.location.origin) return;

  const m = url.pathname.match(OLD_DEP_RE);
  if (!m) return;

  // Build the canonical URL — no session token, no stale ?v= query.
  const canonicalUrl = new URL(event.request.url);
  canonicalUrl.pathname = BASE + '@td/deps/' + m[2];
  canonicalUrl.search = '';

  // Fetch the canonical URL and return its response body directly.
  // The content has absolute canonical imports so all transitive sub-imports
  // resolve to the same @td/deps/ module map entries used by the rest of the
  // module graph → single dep chain → one React instance.
  event.respondWith(
    fetch(canonicalUrl.href, {
      // Bypass browser HTTP cache — always get the proxy/server version with
      // correct absolute imports, never a stale browser-cached response.
      cache: 'no-store',
      credentials: 'same-origin',
    })
  );
});

// Take control immediately so the current page benefits right away.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(clients.claim()));
