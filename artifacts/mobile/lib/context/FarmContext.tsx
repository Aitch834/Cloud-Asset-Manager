import createContextHook from "@nkzw/create-context-hook";
import React, { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

import { getItem, setItem, STORAGE_KEYS } from "@/lib/storage";
import type { Farm, UserProfile } from "@/lib/types";

async function getAuthToken(): Promise<string | null> {
  try {
    if (Platform.OS !== "web") {
      const SecureStore = await import("expo-secure-store");
      const token = await SecureStore.getItemAsync("auth_session_token");
      if (token) return token;
    } else {
      try { return localStorage.getItem("auth_session_token"); } catch { return null; }
    }
  } catch { }
  return null;
}

async function fetchFarmsFromApi(token: string): Promise<Farm[]> {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (!domain) return [];
  try {
    const res = await fetch(`https://${domain}/api/my-farms`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    const data = await res.json() as { farms?: Array<{ id: number; name: string; tenantSlug: string; sectorArable: boolean; sectorBeef: boolean; sectorDairy: boolean; sectorPigs: boolean; sectorPoultry: boolean; }> };
    return (data.farms ?? []).map((f) => ({
      id: String(f.id),
      name: f.name,
      tenantSlug: f.tenantSlug,
      sectorArable: f.sectorArable,
      sectorBeef: f.sectorBeef,
      sectorDairy: f.sectorDairy,
      sectorPigs: f.sectorPigs,
      sectorPoultry: f.sectorPoultry,
    }));
  } catch {
    return [];
  }
}

const DEMO_FARMS: Farm[] = [
  {
    id: "farm-1",
    name: "Manor Farm",
    tenantSlug: "manor-farm",
    sectorArable: true,
    sectorBeef: true,
    sectorDairy: false,
    sectorPigs: false,
    sectorPoultry: false,
  },
  {
    id: "farm-2",
    name: "Hill Top Farm",
    tenantSlug: "hilltop-farm",
    sectorArable: true,
    sectorBeef: false,
    sectorDairy: true,
    sectorPigs: false,
    sectorPoultry: true,
  },
];

const DEMO_USER: UserProfile = {
  id: "user-1",
  name: "James Wilson",
  email: "james@manorfarm.co.uk",
  farmIds: ["farm-1", "farm-2"],
};

const [FarmProviderInner, useFarm] = createContextHook(
  function useFarmState() {
    const [farms, setFarms] = useState<Farm[]>([]);
    const [currentFarm, setCurrentFarmState] = useState<Farm | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      (async () => {
        const savedFarms = await getItem<Farm[]>(STORAGE_KEYS.FARM_LIST);
        const savedFarm = await getItem<Farm>(STORAGE_KEYS.CURRENT_FARM);
        const savedUser = await getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE);

        // Try to load real farms from the API using the stored auth token.
        // This ensures the farm ID is the real numeric DB ID, not a demo string.
        const token = await getAuthToken();
        if (token) {
          const apiFarms = await fetchFarmsFromApi(token);
          if (apiFarms.length > 0) {
            const currentApiFarm =
              savedFarm && apiFarms.find((f) => f.id === savedFarm.id)
                ? savedFarm
                : apiFarms[0];
            await setItem(STORAGE_KEYS.FARM_LIST, apiFarms);
            await setItem(STORAGE_KEYS.CURRENT_FARM, currentApiFarm);
            setFarms(apiFarms);
            setCurrentFarmState(currentApiFarm);
            setUser(savedUser || DEMO_USER);
            setIsLoading(false);
            return;
          }
        }

        // Fall back to locally stored data or demo farms
        if (savedFarms && savedFarms.length > 0) {
          setFarms(savedFarms);
          setCurrentFarmState(savedFarm || savedFarms[0]);
          setUser(savedUser || DEMO_USER);
        } else {
          await setItem(STORAGE_KEYS.FARM_LIST, DEMO_FARMS);
          await setItem(STORAGE_KEYS.CURRENT_FARM, DEMO_FARMS[0]);
          await setItem(STORAGE_KEYS.USER_PROFILE, DEMO_USER);
          setFarms(DEMO_FARMS);
          setCurrentFarmState(DEMO_FARMS[0]);
          setUser(DEMO_USER);
        }
        setIsLoading(false);
      })();
    }, []);

    const setCurrentFarm = useCallback(async (farm: Farm) => {
      setCurrentFarmState(farm);
      await setItem(STORAGE_KEYS.CURRENT_FARM, farm);
    }, []);

    return { farms, currentFarm, setCurrentFarm, user, isLoading };
  },
);

function FarmProvider({ children }: { children: React.ReactNode }) {
  return <FarmProviderInner>{children}</FarmProviderInner>;
}

export { FarmProvider, useFarm };
