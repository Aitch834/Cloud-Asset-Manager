import { useCallback, useEffect, useState } from "react";
import { getItem, setItem } from "@/lib/storage";

export type HomeHeroCard = "compliance" | "tasks";

function prefKey(userId: string): string {
  return `home_hero_card_${userId}`;
}

export function useHomePreference(userId: string | null | undefined) {
  const [heroCard, setHeroCardState] = useState<HomeHeroCard>("compliance");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (userId === undefined) return;

    setLoaded(false);

    const key = userId ? prefKey(userId) : "home_hero_card";

    (async () => {
      try {
        const saved = await getItem<HomeHeroCard>(key);
        if (saved === "tasks" || saved === "compliance") {
          setHeroCardState(saved);
        } else {
          setHeroCardState("compliance");
        }
      } catch {
        setHeroCardState("compliance");
      } finally {
        setLoaded(true);
      }
    })();
  }, [userId]);

  const setHeroCard = useCallback(
    async (value: HomeHeroCard) => {
      setHeroCardState(value);
      const key = userId ? prefKey(userId) : "home_hero_card";
      try {
        await setItem(key, value);
      } catch { }
    },
    [userId]
  );

  return { heroCard, setHeroCard, loaded };
}
