import { type ReactNode, createElement, Fragment } from "react";

export function ClerkProvider({ children }: { children: ReactNode }) {
  return createElement(Fragment, null, children);
}

export function SignIn() { return null; }
export function SignUp() { return null; }

export function useClerk() {
  return {
    signOut: (_cb?: (() => void) | undefined) => Promise.resolve(),
    addListener: (_cb: unknown) => () => {},
  };
}

export function useAuth() {
  return {
    isLoaded: true,
    isSignedIn: true,
    userId: "dev-bypass-user",
    sessionId: null,
    actor: null,
    orgId: null,
    orgRole: null,
    orgSlug: null,
    getToken: async () => null,
    has: () => false,
    signOut: () => Promise.resolve(),
  };
}

export function useUser() {
  return { user: null, isLoaded: true, isSignedIn: false };
}

export function useSession() {
  return { session: null, isLoaded: true, isSignedIn: false };
}
