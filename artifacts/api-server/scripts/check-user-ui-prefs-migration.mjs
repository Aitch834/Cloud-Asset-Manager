import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const migrationPath = fileURLToPath(
  new URL("../src/lib/userUiPrefsMigrations.ts", import.meta.url),
);
const migrationSource = readFileSync(migrationPath, "utf8");

assert.match(
  migrationSource,
  /entry\.key ~ '\^winegb_\.\+_\[0-9\]\{4\}\$'/,
  "WineGB cleanup must remain limited to keys ending in a four-digit season",
);
assert.match(
  migrationSource,
  /regexp_match\(entry\.key, '_\(\[0-9\]\{4\}\)\$'\)/,
  "WineGB cleanup must derive the season from the key suffix",
);
assert.match(
  migrationSource,
  /< EXTRACT\(YEAR FROM CURRENT_DATE\)::integer/,
  "WineGB cleanup must only remove seasons before the current year",
);

const currentYear = 2026;
const oldYear = currentYear - 1;
const futureYear = currentYear + 1;
const staleWineGbKey = `winegb_submission_dismissed_${oldYear}`;
const currentWineGbKey = `winegb_submission_dismissed_${currentYear}`;
const futureWineGbKey = `winegb_submission_dismissed_${futureYear}`;

const preferences = {
  [staleWineGbKey]: true,
  [currentWineGbKey]: false,
  [futureWineGbKey]: true,
  winegb_submission_dismissed: true,
  winegb_submission_dismissed_20x6: true,
  winegb_2024_submission_dismissed: true,
  [`not_winegb_dismissed_${oldYear}`]: true,
  dashboard_compact_mode: false,
  preferred_farm_id: "farm-123",
};

function removeStaleWineGbPreferences(uiPrefs, year) {
  return Object.fromEntries(
    Object.entries(uiPrefs).filter(([key]) => {
      const match = /^winegb_.+_([0-9]{4})$/.exec(key);
      return !match || Number(match[1]) >= year;
    }),
  );
}

const cleaned = removeStaleWineGbPreferences(preferences, currentYear);
assert.equal(cleaned[staleWineGbKey], undefined, "old-season key was not removed");
assert.deepEqual(cleaned, {
  [currentWineGbKey]: false,
  [futureWineGbKey]: true,
  winegb_submission_dismissed: true,
  winegb_submission_dismissed_20x6: true,
  winegb_2024_submission_dismissed: true,
  [`not_winegb_dismissed_${oldYear}`]: true,
  dashboard_compact_mode: false,
  preferred_farm_id: "farm-123",
});

const cleanedAgain = removeStaleWineGbPreferences(cleaned, currentYear);
assert.deepEqual(
  cleanedAgain,
  cleaned,
  "WineGB preference cleanup must be idempotent",
);

console.log("User UI preferences migration guard passed");