import createContextHook from "@nkzw/create-context-hook";
import React, { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

import {
  clearExpiredAgriEnvCaches,
  getItem,
  removeItem,
  setItem,
  STORAGE_KEYS,
} from "@/lib/storage";
import { syncRefData } from "@/lib/refCache";
import { refreshApiModules } from "@/lib/hooks/useApiModules";
import type { Farm, UserProfile } from "@/lib/types";
import { mapApiFarm, type ApiFarm } from "@/lib/utils/mapApiFarm";
import { getMobileAuthToken } from "@/lib/authToken";

async function getAuthToken(): Promise<string | null> {
  return getMobileAuthToken();
}

function buildApiHeaders(token: string | null): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function fetchUserProfileFromApi(token: string | null): Promise<UserProfile | null> {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (!domain) return null;
  try {
    const res = await fetch(`https://${domain}/api/account/profile`, {
      headers: buildApiHeaders(token),
    });
    if (!res.ok) return null;
    const u = await res.json() as { id: string; email: string | null; firstName: string | null; lastName: string | null };
    const name = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email || "Unknown";
    return { id: u.id, name, email: u.email ?? "", farmIds: [] };
  } catch {
    return null;
  }
}

async function fetchFarmsFromApi(token: string | null): Promise<Farm[] | null> {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (!domain) return null;
  try {
    const res = await fetch(`https://${domain}/api/my-farms`, {
      headers: buildApiHeaders(token),
    });
    if (!res.ok) return null;
    const data = await res.json() as { farms?: ApiFarm[] };
    return (data.farms ?? []).map(mapApiFarm);
  } catch {
    return null;
  }
}

async function registerPushToken(token: string | null, farmId: string): Promise<void> {
  if (Platform.OS === "web") return;
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (!domain) return;
  try {
    const Notifications = await import("expo-notifications");

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      console.log("[PUSH] Permission not granted, skipping token registration");
      return;
    }

    const projectId = process.env.EXPO_PUBLIC_PROJECT_ID;
    const pushToken = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    const expoPushToken = pushToken.data;

    await fetch(`https://${domain}/api/farms/${farmId}/push-tokens`, {
      method: "POST",
      headers: buildApiHeaders(token),
      body: JSON.stringify({ expoPushToken, platform: Platform.OS }),
    }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
    console.log("[PUSH] Token registered:", expoPushToken);
  } catch (err) {
    console.warn("[PUSH] Token registration failed:", err);
  }
}

const [FarmProviderInner, useFarm] = createContextHook(
  function useFarmState() {
    const [farms, setFarms] = useState<Farm[]>([]);
    const [currentFarm, setCurrentFarmState] = useState<Farm | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      clearExpiredAgriEnvCaches().catch(() => {});
      (async () => {
        const savedFarms = await getItem<Farm[]>(STORAGE_KEYS.FARM_LIST);
        const savedFarm = await getItem<Farm>(STORAGE_KEYS.CURRENT_FARM);
        const savedUser = await getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE);

        // Clerk supplies a current bearer token through the root token bridge.
        const token = await getAuthToken();
        if (token) {
          const [apiFarms, apiUser] = await Promise.all([
            fetchFarmsFromApi(token),
            fetchUserProfileFromApi(token),
          ]);
          if (apiFarms !== null) {
            const resolvedUser = apiUser || savedUser;
            if (!resolvedUser) {
              setIsLoading(false);
              return;
            }
            await setItem(STORAGE_KEYS.FARM_LIST, apiFarms);
            clearExpiredAgriEnvCaches(apiFarms.map((farm) => farm.id)).catch(() => {});

            if (apiFarms.length === 0) {
              await removeItem(STORAGE_KEYS.CURRENT_FARM);
              await setItem(STORAGE_KEYS.USER_PROFILE, resolvedUser);
              setFarms([]);
              setCurrentFarmState(null);
              setUser(resolvedUser);
              setIsLoading(false);
              return;
            }

            // Always use the fresh API farm object so new fields (e.g. barrel
            // alert thresholds) are never shadowed by a stale cached value.
            const currentApiFarm =
              savedFarm
                ? (apiFarms.find((f) => f.id === savedFarm.id) ?? apiFarms[0])
                : apiFarms[0];
            await setItem(STORAGE_KEYS.CURRENT_FARM, currentApiFarm);
            await setItem(STORAGE_KEYS.USER_PROFILE, resolvedUser);
            setFarms(apiFarms);
            setCurrentFarmState(currentApiFarm);
            setUser(resolvedUser);
            setIsLoading(false);
            syncRefData(currentApiFarm.id).catch(() => {});
            // Register Expo push token in background (fire-and-forget)
            registerPushToken(token, currentApiFarm.id).catch(() => {});
            return;
          }
        }

        // Offline data is available only after a signed-in session has loaded it.
        if (savedFarms && savedFarms.length > 0) {
          setFarms(savedFarms);
          setCurrentFarmState(savedFarm || savedFarms[0]);
          setUser(savedUser);
        }
        setIsLoading(false);
      })();
    }, []);

    const setCurrentFarm = useCallback(async (farm: Farm) => {
      setCurrentFarmState(farm);
      await setItem(STORAGE_KEYS.CURRENT_FARM, farm);
    }, []);

    const updateFarm = useCallback(async (id: string, patch: Partial<Farm>) => {
      setFarms(prev => {
        const next = prev.map(f => f.id === id ? { ...f, ...patch } : f);
        setItem(STORAGE_KEYS.FARM_LIST, next).catch(() => {});
        return next;
      });
      setCurrentFarmState(prev => {
        if (!prev || prev.id !== id) return prev;
        const next = { ...prev, ...patch };
        setItem(STORAGE_KEYS.CURRENT_FARM, next).catch(() => {});
        return next;
      });
    }, []);

    const refreshFarms = useCallback(async () => {
      const token = await getAuthToken();
      if (!token) return;
      const apiFarms = await fetchFarmsFromApi(token);
      if (apiFarms === null) return;
      const currentFarmId = currentFarm?.id;
      await setItem(STORAGE_KEYS.FARM_LIST, apiFarms);
      clearExpiredAgriEnvCaches(apiFarms.map((farm) => farm.id)).catch(() => {});
      setFarms(apiFarms);
      if (apiFarms.length === 0) {
        await removeItem(STORAGE_KEYS.CURRENT_FARM);
        setCurrentFarmState(null);
        return;
      }
      const selectedFarm = currentFarmId
        ? (apiFarms.find((farm) => farm.id === currentFarmId) ?? apiFarms[0])
        : apiFarms[0];
      setCurrentFarmState(prev => {
        if (!prev) return prev;
        const updated = apiFarms.find(f => f.id === prev.id);
        const next = updated ?? apiFarms[0];
        setItem(STORAGE_KEYS.CURRENT_FARM, next).catch(() => {});
        return next;
      });
      await Promise.allSettled([
        syncRefData(selectedFarm.id),
        refreshApiModules(selectedFarm.id, selectedFarm.tenantSlug),
      ]);
    }, [currentFarm?.id]);

    return { farms, currentFarm, setCurrentFarm, updateFarm, refreshFarms, user, isLoading };
  },
);

function FarmProvider({ children }: { children: React.ReactNode }) {
  return <FarmProviderInner>{children}</FarmProviderInner>;
}

export { FarmProvider, useFarm };
