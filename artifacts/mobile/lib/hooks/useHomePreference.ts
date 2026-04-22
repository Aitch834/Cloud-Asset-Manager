import { useCallback, useEffect, useState } from "react";
import { getItem, setItem } from "@/lib/storage";

export type HomeHeroCard = "compliance" | "tasks";

const PREF_KEY = "home_hero_card";

export function useHomePreference() {
  const [heroCard, setHeroCardState] = useState<HomeHeroCard>("compliance");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await getItem<HomeHeroCard>(PREF_KEY);
        if (saved === "tasks" || saved === "compliance") {
          setHeroCardState(saved);
        }
      } catch {
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const setHeroCard = useCallback(async (value: HomeHeroCard) => {
    setHeroCardState(value);
    try {
      await setItem(PREF_KEY, value);
    } catch { }
  }, []);

  return { heroCard, setHeroCard, loaded };
}
