/**
 * Regression coverage for moving the cover badge between photos.
 *
 * The three photo screens intentionally keep their own record-specific state,
 * so this source guard checks each handler rather than testing only one shared
 * helper. The device checklist in docs/photo-cover-transition-regression.md
 * covers the actual long-press interaction.
 */

import fs from "node:fs";
import path from "node:path";
import { mergeRefreshedPhotoCover } from "../lib/photoCoverTransition";

type Photo = { id: number; isCover: boolean };

const screenSources = [
  {
    name: "scouting records",
    file: "../components/ScoutingPhotoSection.tsx",
  },
  {
    name: "new spray diary records",
    file: "../app/vine-spray-diary.tsx",
  },
  {
    name: "spray diary history records",
    file: "../app/vine-spray-diary-history.tsx",
  },
].map((screen) => ({
  ...screen,
  source: fs.readFileSync(path.resolve(__dirname, screen.file), "utf8"),
}));
const scoutingPhotoApiSource = fs.readFileSync(
  path.resolve(__dirname, "../lib/scoutingPhotosApi.ts"),
  "utf8",
);

function promoteCover(photos: Photo[], promotedId: number): Photo[] {
  return photos.map((photo) => ({
    ...photo,
    isCover: photo.id === promotedId,
  }));
}

describe("mobile photo cover transitions", () => {
  it("makes exactly the promoted photo the cover", () => {
    const photos = promoteCover(
      [
        { id: 101, isCover: true },
        { id: 202, isCover: false },
      ],
      202,
    );

    expect(photos).toEqual([
      { id: 101, isCover: false },
      { id: 202, isCover: true },
    ]);
    expect(photos.filter((photo) => photo.isCover)).toHaveLength(1);
  });

  it.each(["scouting", "spray diary"])(
    "keeps a successful %s cover promotion when an older refresh settles later",
    () => {
      const staleRefresh = [
        { id: 101, isCover: true },
        { id: 202, isCover: false },
      ];
      const locallyPromoted = promoteCover(staleRefresh, 202);

      const photos = mergeRefreshedPhotoCover(
        staleRefresh,
        locallyPromoted,
        0,
        1,
      );

      expect(photos).toEqual([
        { id: 101, isCover: false },
        { id: 202, isCover: true },
      ]);
      expect(photos.filter((photo) => photo.isCover)).toHaveLength(1);
    },
  );

  it("leaves the existing cover visible when a cover request fails", () => {
    const existingPhotos = [
      { id: 101, isCover: true },
      { id: 202, isCover: false },
    ];

    const photos = mergeRefreshedPhotoCover(
      existingPhotos,
      existingPhotos,
      0,
      0,
    );

    expect(photos).toEqual(existingPhotos);
    expect(photos.filter((photo) => photo.isCover)).toEqual([
      { id: 101, isCover: true },
    ]);
  });

  it("scouting records use the shared cover request helper", () => {
    expect(screenSources[0].source).toContain("executeScoutingPhotoSetCover");
  });

  it("the shared cover helper clears the previous cover after success", () => {
    expect(scoutingPhotoApiSource).toMatch(
      /callbacks\.setPhotos\(\(prev\) =>\s*prev\.map\(\(photo\) => \(\{ \.\.\.photo, isCover: photo\.id === Number\(photoId\) \}\)\),?\s*\);/s,
    );
  });

  it.each(screenSources)(
    "$name renders the star badge from current isCover state",
    ({ source }) => {
      expect(source).toContain("photo.isCover ?");
      expect(source).toMatch(/<Text[^>]*>★<\/Text>/);
    },
  );

  it.each(screenSources)(
    "$name reconciles refreshes against successful cover changes",
    ({ source }) => {
      expect(source).toContain("mergeRefreshedPhotoCover");
      expect(source).toContain("coverRevisionRef.current += 1");
    },
  );
});
