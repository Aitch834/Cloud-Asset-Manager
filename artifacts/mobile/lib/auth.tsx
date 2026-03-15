import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

const AUTH_TOKEN_KEY = "auth_session_token";
const ISSUER_URL = process.env.EXPO_PUBLIC_ISSUER_URL ?? "https://replit.com/oidc";

const tokenStorage = {
  async get(): Promise<string | null> {
    if (Platform.OS === "web") {
      try { return localStorage.getItem(AUTH_TOKEN_KEY); } catch { return null; }
    }
    const SecureStore = await import("expo-secure-store");
    return SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  },
  async set(value: string): Promise<void> {
    if (Platform.OS === "web") {
      try { localStorage.setItem(AUTH_TOKEN_KEY, value); } catch { /* noop */ }
      return;
    }
    const SecureStore = await import("expo-secure-store");
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, value);
  },
  async remove(): Promise<void> {
    if (Platform.OS === "web") {
      try { localStorage.removeItem(AUTH_TOKEN_KEY); } catch { /* noop */ }
      return;
    }
    const SecureStore = await import("expo-secure-store");
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
  },
};

interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
});

function getApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_DOMAIN) {
    return `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
  }
  return "";
}

function getClientId(): string {
  return process.env.EXPO_PUBLIC_REPL_ID || "";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const discovery = AuthSession.useAutoDiscovery(ISSUER_URL);

  const redirectUri = AuthSession.makeRedirectUri();

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: getClientId(),
      scopes: ["openid", "email", "profile", "offline_access"],
      redirectUri,
      prompt: AuthSession.Prompt.Login,
    },
    discovery,
  );

  const fetchUser = useCallback(async () => {
    try {
      const token = await tokenStorage.get();
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const apiBase = getApiBaseUrl();
      const res = await fetch(`${apiBase}/api/auth/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.user) {
        setUser(data.user);
      } else {
        await tokenStorage.remove();
        setUser(null);
      }
    } catch (fetchErr: unknown) {
      console.warn("Failed to fetch user:", fetchErr instanceof Error ? fetchErr.message : "unknown");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (response?.type !== "success" || !request?.codeVerifier) return;

    const { code, state } = response.params;

    (async () => {
      try {
        const apiBase = getApiBaseUrl();
        if (!apiBase) {
          console.error("API base URL is not configured.");
          return;
        }

        const exchangeRes = await fetch(`${apiBase}/api/mobile-auth/token-exchange`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            code_verifier: request.codeVerifier,
            redirect_uri: redirectUri,
            state,
            nonce: (request as unknown as Record<string, unknown>).nonce ?? undefined,
          }),
        });

        if (!exchangeRes.ok) {
          console.error("Token exchange failed:", exchangeRes.status);
          setIsLoading(false);
          return;
        }

        const data = await exchangeRes.json();
        if (data.token) {
          await tokenStorage.set(data.token);
          setIsLoading(true);
          await fetchUser();
        }
      } catch (err) {
        console.error("Token exchange error:", err);
        setIsLoading(false);
      }
    })();
  }, [response, request, redirectUri, fetchUser]);

  const login = useCallback(async () => {
    try {
      await promptAsync();
    } catch (err) {
      console.error("Login error:", err);
    }
  }, [promptAsync]);

  const logout = useCallback(async () => {
    try {
      const token = await tokenStorage.get();
      if (token) {
        const apiBase = getApiBaseUrl();
        await fetch(`${apiBase}/api/mobile-auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (logoutErr: unknown) {
      console.warn("Logout API call failed:", logoutErr instanceof Error ? logoutErr.message : "unknown");
    } finally {
      await tokenStorage.remove();
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
