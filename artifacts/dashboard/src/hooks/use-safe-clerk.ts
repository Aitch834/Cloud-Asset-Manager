import { useClerk, useUser } from "@clerk/react";

// DEV_BYPASS is baked as a compile-time constant by Vite.
// In the test-dashboard bypass build it is `true`; ClerkProvider is NOT
// rendered, so calling real Clerk hooks would throw. We therefore export two
// stable hook functions (one per build variant) and select between them at
// module initialisation — never inside a component body — so the Rules of Hooks
// are respected: every component always calls the same function on every render.
const DEV_BYPASS = import.meta.env.VITE_DEV_BYPASS_AUTH === "true";

// ── useClerk safe wrapper ────────────────────────────────────────────────────

function _useClerkBypass(): ReturnType<typeof useClerk> {
  return {
    signOut: (_cb?: (() => void) | undefined) => Promise.resolve(),
  } as unknown as ReturnType<typeof useClerk>;
}

function _useClerkReal(): ReturnType<typeof useClerk> {
  return useClerk();
}

export const useSafeClerk: () => ReturnType<typeof useClerk> = DEV_BYPASS
  ? _useClerkBypass
  : _useClerkReal;

// ── useUser safe wrapper ─────────────────────────────────────────────────────

function _useUserBypass(): ReturnType<typeof useUser> {
  return {
    user: null,
    isLoaded: true,
    isSignedIn: false,
  } as unknown as ReturnType<typeof useUser>;
}

function _useUserReal(): ReturnType<typeof useUser> {
  return useUser();
}

export const useSafeUser: () => ReturnType<typeof useUser> = DEV_BYPASS
  ? _useUserBypass
  : _useUserReal;
