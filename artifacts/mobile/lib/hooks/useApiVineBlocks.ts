import { useCallback, useEffect, useMemo } from "react";
import { buildCachedApiHook } from "./buildCachedApiHook";
import { requireArrayEnvelope } from "./apiResponseGuards";

export interface VineBlock {
  id: number;
  blockName: string;
  blockRef: string | null;
  /** Parcel / Field Ref used for RPA rural-payments submissions. */
  fieldParcelRef: string | null;
  variety: string | null;
  rootstock: string | null;
  areaHa: number | null;
  numberOfVines: number | null;
  plantingStatus: string;
  isActive: boolean;
  isOrganicBlock: boolean;
  coverPhotoUrl: string | null;
  /** Total photos for this block. May be absent on records cached by older app
   *  versions; always normalised to a number (default 0) before use. */
  photoCount?: number;
}

// ---------------------------------------------------------------------------
// In-memory cover-photo URL cache
//
// Presigned URLs expire after ~5 minutes, so we cannot persist them in
// AsyncStorage (the cacheTransform below strips them on write). However, we
// can hold them in module-level memory for the duration of an app session.
// TTL is set to 4 minutes — just under the 5-minute presigned expiry — so
// growers who navigate back to the block picker within the same session always
// see the photo immediately instead of a placeholder icon.
// ---------------------------------------------------------------------------
const URL_CACHE_TTL_MS = 4 * 60 * 1000; // 4 minutes

interface UrlEntry {
  url: string;
  expiresAt: number;
}

const coverPhotoUrlCache = new Map<number, UrlEntry>();

/** Read a cached cover-photo URL for a block, or null if absent/expired. */
export function getCachedBlockCoverUrl(blockId: number): string | null {
  const entry = coverPhotoUrlCache.get(blockId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    coverPhotoUrlCache.delete(blockId);
    return null;
  }
  return entry.url;
}

/** Store a cover-photo URL in the in-session cache. No-op when url is null/empty. */
export function setCachedBlockCoverUrl(blockId: number, url: string | null): void {
  if (!url) return;
  coverPhotoUrlCache.set(blockId, { url, expiresAt: Date.now() + URL_CACHE_TTL_MS });
}

// Internal aliases used by the hook below.
const getCachedUrl = getCachedBlockCoverUrl;
const setCachedUrl = setCachedBlockCoverUrl;

/**
 * Overlay in-memory cached URLs onto blocks that currently have null coverPhotoUrl,
 * and normalise any fields that may be absent in records cached by older app versions.
 */
function overlayUrls(blocks: VineBlock[]): VineBlock[] {
  return blocks.map((b) => {
    // Normalise photoCount: absent on records cached before this field was added;
    // default to 0 so the chip always renders correctly, even when fully offline.
    const withCount: VineBlock = typeof b.photoCount === "number" ? b : { ...b, photoCount: 0 };
    if (withCount.coverPhotoUrl) return withCount; // fresh URL already present — keep it
    const cached = getCachedUrl(b.id);
    return cached ? { ...withCount, coverPhotoUrl: cached } : withCount;
  });
}

// ---------------------------------------------------------------------------

const useApiVineBlocksHook = buildCachedApiHook<VineBlock>(
  (farmId) => `bde_cache_vine_blocks_${farmId}`,
  (farmId, domain) => `${domain}/api/farms/${farmId}/vineyard-blocks`,
  (json) => {
    const records = requireArrayEnvelope<VineBlock>(json, "records", "vine blocks");
    return records.filter((b) => b.plantingStatus !== "removed" && b.plantingStatus !== "no_planting");
  },
  // Strip the presigned cover-photo URL before writing to AsyncStorage.
  // Presigned URLs expire after 5 minutes; storing them causes broken image
  // placeholders when the app is re-opened with stale cache. The background
  // API refresh always supplies fresh URLs, so cached items get null until
  // the network response arrives (or the in-memory cache below fills the gap).
  (block) => ({ ...block, coverPhotoUrl: null })
);

export function useApiVineBlocks(farmId: string | undefined) {
  const { items, loading, fromCache, lastError, refresh, updateItems } = useApiVineBlocksHook(farmId);

  // When a fresh API response arrives the items carry real presigned URLs.
  // Store them in the module-level cache so that subsequent renders (e.g.
  // when the user navigates away and comes back within the same session) can
  // show the photo immediately even though AsyncStorage has null.
  useEffect(() => {
    if (!fromCache) {
      items.forEach((b) => setCachedUrl(b.id, b.coverPhotoUrl));
    }
  }, [items, fromCache]);

  // Merge in-memory URLs into the current item list.  This is a no-op when
  // items already carry fresh URLs; it only fills in gaps for items whose
  // coverPhotoUrl is null (i.e. loaded from AsyncStorage cache).
  const blocks = useMemo(() => overlayUrls(items), [items]);
  const updateBlock = useCallback((blockId: number, updates: Partial<VineBlock>) => {
    updateItems((current) =>
      current.map((block) => block.id === blockId ? { ...block, ...updates } : block),
    );
  }, [updateItems]);

  return {
    blocks,
    loading,
    error: items.length === 0 && lastError ? lastError : null,
    fromCache,
    refresh,
    updateBlock,
  };
}
