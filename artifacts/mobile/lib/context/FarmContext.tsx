import createContextHook from "@nkzw/create-context-hook";
import React, { useCallback, useEffect, useState } from "react";

import { getItem, setItem, STORAGE_KEYS } from "@/lib/storage";
import type { Farm, UserProfile } from "@/lib/types";

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
