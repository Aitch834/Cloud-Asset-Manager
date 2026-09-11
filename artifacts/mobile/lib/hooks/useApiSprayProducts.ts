import { buildCachedApiHook } from "./buildCachedApiHook";
import { requireArrayEnvelope } from "./apiResponseGuards";

export interface ApiSprayProduct {
  id: number;
  productName: string;
  activeIngredient: string | null;
  mappaNumber: string | null;
  manufacturer: string | null;
  category: string | null;
  harvestInterval: string | null;
  maxApplicationsPerSeason: number | null;
  lerapCategory: string | null;
  lerapStandardBufferM: string | null;
}

const useApiSprayProductsHook = buildCachedApiHook<ApiSprayProduct>(
  (farmId) => `bde_cache_spray_products_${farmId}`,
  (farmId, domain) => `${domain}/api/farms/${farmId}/spray-products`,
  (json) => requireArrayEnvelope<ApiSprayProduct>(json, "records", "spray products"),
);

export function useApiSprayProducts(farmId: string | undefined) {
  const { items, loading, fromCache, lastError } = useApiSprayProductsHook(farmId);
  return {
    products: items,
    loading,
    error: items.length === 0 && lastError ? lastError : null,
    fromCache,
  };
}
