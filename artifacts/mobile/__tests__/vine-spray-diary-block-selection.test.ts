import type { VineBlock } from "../lib/hooks/useApiVineBlocks";
import { findPreselectedVineBlock } from "../lib/vineSprayDiaryHelpers";

function makeBlock(id: number, blockName: string): VineBlock {
  return {
    id,
    blockName,
    blockRef: null,
    fieldParcelRef: null,
    variety: "Chardonnay",
    rootstock: null,
    areaHa: 1.2,
    numberOfVines: 1200,
    plantingStatus: "planted",
    isActive: true,
    isOrganicBlock: false,
    coverPhotoUrl: null,
  };
}

describe("vine spray diary route block pre-selection", () => {
  it("keeps the route selection pending during a cold launch and resolves it when blocks load", () => {
    const target = makeBlock(42, "North Field");
    const other = makeBlock(7, "South Field");

    // Record-tab navigation can mount before either cache or API blocks exist.
    expect(findPreselectedVineBlock("42", [], true)).toBeNull();

    // This models the rerender caused by the blocks hook finishing. The
    // screen's effect includes both `blocks` and `blocksLoading` in its
    // dependency list, so this second state is evaluated.
    expect(findPreselectedVineBlock("42", [other, target], false)).toBe(target);
  });

  it("does not select a route block while loading or when the route id is absent", () => {
    const target = makeBlock(42, "North Field");

    expect(findPreselectedVineBlock("42", [target], true)).toBeNull();
    expect(findPreselectedVineBlock(undefined, [target], false)).toBeNull();
    expect(findPreselectedVineBlock("999", [target], false)).toBeNull();
  });
});