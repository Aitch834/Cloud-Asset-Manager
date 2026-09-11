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
      name: "save",
      testID: "vine-block-lightbox-save",
      styleName: "lbSaveBtn",
    },
    {
      name: "share",
      testID: "vine-block-lightbox-share",
      styleName: "lbShareBtn",
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

  it("keeps every action independently targetable on a small viewport", () => {
    const actions = [
      { name: "delete", left: 16 },
      { name: "save", left: 64 },
      { name: "share", left: 112 },
      {
        name: "set cover",
        left: SMALL_VIEWPORT_WIDTH - 64 - VISIBLE_BUTTON_SIZE,
      },
    ];

    for (const action of actions) {
      const center = action.left + VISIBLE_BUTTON_SIZE / 2;
      expect(center).toBeGreaterThanOrEqual(0);
      expect(center).toBeLessThan(SMALL_VIEWPORT_WIDTH);
    }

    for (let index = 1; index < actions.length; index += 1) {
      const previous = actions[index - 1];
      const current = actions[index];
      expect(current.left).toBeGreaterThanOrEqual(
        previous.left + VISIBLE_BUTTON_SIZE,
      );
    }
  });
});
