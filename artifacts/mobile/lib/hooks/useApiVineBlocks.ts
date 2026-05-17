import { buildCachedApiHook } from "./buildCachedApiHook";

export interface VineBlock {
  id: number;
  blockName: string;
  blockRef: string | null;
  variety: string | null;
  rootstock: string | null;
  areaHa: number | null;
  numberOfVines: number | null;
  plantingStatus: string;
  isActive: boolean;
  isOrganicBlock: boolean;
}

const useApiVineBlocksHook = buildCachedApiHook<VineBlock>(
  (farmId) => `bde_cache_vine_blocks_${farmId}`,
  (farmId, domain) => `${domain}/api/farms/${farmId}/vineyard-blocks`,
  (json) => {
    const records = ((json as { records?: VineBlock[] }).records ?? []) as VineBlock[];
    return records.filter((b) => b.plantingStatus !== "removed" && b.plantingStatus !== "no_planting");
  }
);

export function useApiVineBlocks(farmId: string | undefined) {
  const { items, loading, fromCache, lastError } = useApiVineBlocksHook(farmId);
  return {
    blocks: items,
    loading,
    error: items.length === 0 && lastError ? lastError : null,
    fromCache,
  };
}
