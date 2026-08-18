/**
 * Lightweight navigation guard for the admin portal.
 *
 * A page registers a guard function via `setNavGuard(fn)`. The guard is called
 * before any navigation attempt and returns `true` to allow or `false` to block.
 * `setNavGuard(null)` clears all guards at once.
 *
 * Three navigation paths are covered:
 *  1. Sidebar / programmatic — Layout's handleNavClick calls `checkNavGuard()`.
 *     After the guard approves, Layout calls `setNavGuard(null)` before acting so
 *     no subsequent event triggers a second prompt.
 *  2. Browser Back / Forward — a capture-phase `popstate` listener intercepts
 *     the event before Wouter processes it; if blocked it restores the URL with
 *     `history.pushState` and stops the event so Wouter never re-renders.
 *  3. Refresh / tab-close / external navigation — a `beforeunload` handler fires
 *     the prompt; the browser shows its own generic "Leave site?" wording.
 *
 * All three listeners are installed together by `setNavGuard` and torn down
 * together by `setNavGuard(null)`, which prevents double-prompt scenarios (e.g.
 * logout confirming via checkNavGuard then immediately triggering beforeunload).
 */

let _guard: (() => boolean) | null = null;
let _safeUrl = "";

function handleBeforeUnload(e: BeforeUnloadEvent) {
  if (!_guard) return;
  e.preventDefault();
  // Modern browsers show their own generic message; returnValue must be set
  // (even as an empty string) for the prompt to appear in most browsers.
  e.returnValue = "";
}

function handlePopState(e: PopStateEvent) {
  if (!_guard) return;
  const allowed = _guard();
  if (!allowed) {
    // Block: prevent Wouter from seeing this event and restore the URL.
    e.stopImmediatePropagation();
    history.pushState(null, "", _safeUrl);
  } else {
    // Allow: clear all guards so no subsequent event re-prompts.
    setNavGuard(null);
  }
}

/** Register (or clear) the active navigation guard. Pass `null` to remove it. */
export function setNavGuard(fn: (() => boolean) | null): void {
  if (fn) {
    // Snapshot the current URL so we can restore it if Back/Forward is blocked.
    _safeUrl = window.location.pathname + window.location.search + window.location.hash;
    if (!_guard) {
      // Capture phase so our popstate handler runs before Wouter's listener.
      window.addEventListener("popstate", handlePopState, true);
      window.addEventListener("beforeunload", handleBeforeUnload);
    }
    _guard = fn;
  } else {
    _guard = null;
    window.removeEventListener("popstate", handlePopState, true);
    window.removeEventListener("beforeunload", handleBeforeUnload);
  }
}

/**
 * Called by the sidebar (and logout) before changing route or clearing credentials.
 * Returns `true` if navigation should proceed, `false` if the user cancelled.
 *
 * IMPORTANT: callers must call `setNavGuard(null)` immediately after this returns
 * `true` to remove the beforeunload listener before triggering any page reload or
 * route change — otherwise the reload will re-prompt with the guard again.
 */
export function checkNavGuard(): boolean {
  if (!_guard) return true;
  return _guard();
}
