import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(
  path.resolve(__dirname, "../app/vine-block-photos.tsx"),
  "utf8",
);

const SMALL_VIEWPORT_WIDTH = 320;
const VISIBLE_BUTTON_SIZE = 40;
const ACTION_HIT_SLOP = 24;

function sourceBetween(start: string, end: string): string {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex);

  expect(startIndex).toBeGreaterThanOrEqual(0);
  expect(endIndex).toBeGreaterThan(startIndex);

  return source.slice(startIndex, endIndex);
}

function styleBlock(styleName: string): string {
  return sourceBetween(`  ${styleName}: {`, "\n  },");
}

describe("vine block photo lightbox touch targets", () => {
  it("opens the lightbox from a photo thumbnail", () => {
    const thumbnail = sourceBetween(
      'testID={`vine-block-photo-${photo.id}`}',
      "<View style={styles.thumbImgBox}>",
    );

    expect(thumbnail).toContain("onPress={() => onPress(uri, photo)}");
  });

  it.each([
    {
      name: "delete",
      testID: "vine-block-lightbox-delete",
      styleName: "lbDeleteBtn",
    },
    {
      name: "set cover",
      testID: "vine-block-lightbox-set-cover",
      styleName: "lbSetCoverBtn",
    },
  ])(
    "keeps the $name button visually 40x40 with an expanded 88x88 target",
    ({ testID, styleName }) => {
      const action = sourceBetween(`testID="${testID}"`, "</Pressable>");
      const style = styleBlock(styleName);

      expect(action).toContain(`hitSlop={${ACTION_HIT_SLOP}}`);
      expect(style).toMatch(new RegExp(`width:\\s*${VISIBLE_BUTTON_SIZE},`));
      expect(style).toMatch(new RegExp(`height:\\s*${VISIBLE_BUTTON_SIZE},`));
      expect(VISIBLE_BUTTON_SIZE + ACTION_HIT_SLOP * 2).toBe(88);
    },
  );

  it("keeps both enlarged targets independently reachable on a small viewport", () => {
    const deleteCenter = 16 + VISIBLE_BUTTON_SIZE / 2;
    const setCoverCenter =
      SMALL_VIEWPORT_WIDTH - 64 - VISIBLE_BUTTON_SIZE / 2;
    const targetRadius = VISIBLE_BUTTON_SIZE / 2 + ACTION_HIT_SLOP;

    const deleteTarget = {
      left: deleteCenter - targetRadius,
      right: deleteCenter + targetRadius,
    };
    const setCoverTarget = {
      left: setCoverCenter - targetRadius,
      right: setCoverCenter + targetRadius,
    };

    expect(deleteCenter).toBeGreaterThanOrEqual(0);
    expect(deleteCenter).toBeLessThan(SMALL_VIEWPORT_WIDTH);
    expect(setCoverCenter).toBeGreaterThanOrEqual(0);
    expect(setCoverCenter).toBeLessThan(SMALL_VIEWPORT_WIDTH);
    expect(deleteTarget.right).toBeLessThan(setCoverTarget.left);
  });
});