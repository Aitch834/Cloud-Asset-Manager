import type { VineBlock } from "./hooks/useApiVineBlocks";

export type VineSprayDiaryRoute =
  | "/vine-spray-diary"
  | { pathname: "/vine-spray-diary"; params: { blockId: string } };

/**
 * Build the Spray Diary quick-link route without carrying an empty or stale
 * block parameter into the destination form.
 */
export function buildVineSprayDiaryRoute(
  blockId: string | number | null | undefined,
): VineSprayDiaryRoute {
  if (blockId == null || String(blockId).trim() === "") return "/vine-spray-diary";

  return {
    pathname: "/vine-spray-diary",
    params: { blockId: String(blockId) },
  };
}

/**
 * Resolve the block supplied by the route once the block list is ready.
 *
 * A cold launch renders once with an empty list while the cached/API block
 * request is loading. Returning null for that render lets the screen's
 * effect run again when `blocks` or `blocksLoading` changes.
 */
export function findPreselectedVineBlock(
  blockId: string | undefined,
  blocks: VineBlock[],
  blocksLoading: boolean,
): VineBlock | null {
  if (!blockId || blocksLoading || blocks.length === 0) return null;
  return blocks.find((block) => String(block.id) === String(blockId)) ?? null;
}