import * as fs from "node:fs";
import path from "node:path";

type DiseaseAlertCoverageRule = {
  moduleKey: string;
  sector: "sheep" | "goat" | "pig";
  sectorLabel: "Sheep" | "Goat" | "Pig";
  screenIdPrefix: string;
};

type RecordRegistryEntry = {
  id: string;
  title: string;
  route: string;
  moduleKeys: string[];
};

const RECORD_SCREEN_COVERAGE: DiseaseAlertCoverageRule[] = [
  { moduleKey: "sheep-production", sector: "sheep", sectorLabel: "Sheep", screenIdPrefix: "sheep-" },
  { moduleKey: "goat-production", sector: "goat", sectorLabel: "Goat", screenIdPrefix: "goat-" },
  { moduleKey: "goat-dairy", sector: "goat", sectorLabel: "Goat", screenIdPrefix: "goat-" },
  { moduleKey: "sheep-dairy", sector: "sheep", sectorLabel: "Sheep", screenIdPrefix: "sheep-" },
  { moduleKey: "pig-production", sector: "pig", sectorLabel: "Pig", screenIdPrefix: "pig-" },
];

const mobileRoot = path.resolve(__dirname, "..");
const recordScreenSource = fs.readFileSync(
  path.join(mobileRoot, "app", "(tabs)", "record.tsx"),
  "utf8",
);

function readRecordRegistry(): RecordRegistryEntry[] {
  const registryMatch = recordScreenSource.match(
    /export const recordOptions: RecordOption\[\] = \[([\s\S]*?)\n\];/,
  );
  if (!registryMatch) {
    throw new Error("Could not find the mobile Record screen registry");
  }

  const entries = [...registryMatch[1].matchAll(/^\s{2}\{([\s\S]*?)^\s{2}\},/gm)];
  return entries.flatMap(([, block]) => {
    const id = block.match(/^\s*id: "([^"]+)"/m)?.[1];
    const title = block.match(/^\s*title: "([^"]+)"/m)?.[1];
    const route = block.match(/^\s*route: "([^"]+)"/m)?.[1];
    const moduleKeys = block.match(/^\s*moduleKeys: \[([^\]]*)\]/m)?.[1]
      ?.match(/"([^"]+)"/g)
      ?.map((key) => key.slice(1, -1));

    return id && title && route && moduleKeys ? [{ id, title, route, moduleKeys }] : [];
  });
}

function assertDiseaseAlertCoverage(
  entry: RecordRegistryEntry,
  sector: DiseaseAlertCoverageRule["sector"],
  sectorLabel: DiseaseAlertCoverageRule["sectorLabel"],
): void {
  const screenPath = path.join(mobileRoot, "app", `${entry.route.slice(1)}.tsx`);
  const screenExists = fs.existsSync(screenPath);
  const screenSource = screenExists
    ? fs.readFileSync(screenPath, "utf8")
    : "";

  const bannerIndex = screenSource.indexOf("<DiseaseAlertBanner");
  const headerTitleIndex = screenSource.search(
    /<Text style=\{styles\.(?:headerTitle|title)\}/,
  );
  const contentIndex = screenSource.indexOf("<ScrollView", bannerIndex);

  expect({
    screen: entry.title,
    route: entry.route,
    screenExists,
    matchingHook: screenSource.includes(`useDiseaseAlert("${sector}")`),
    matchingBanner: new RegExp(
      `<DiseaseAlertBanner\\s+alert=\\{${sector}Alert\\}\\s+sector="${sectorLabel}"\\s*/>`,
    ).test(screenSource),
    bannerBelowHeader: headerTitleIndex >= 0 && bannerIndex > headerTitleIndex,
    bannerBeforeContent: contentIndex < 0 || bannerIndex < contentIndex,
  }).toEqual({
    screen: entry.title,
    route: entry.route,
    screenExists: true,
    matchingHook: true,
    matchingBanner: true,
    bannerBelowHeader: true,
    bannerBeforeContent: true,
  });
}

describe("mobile livestock disease-alert coverage", () => {
  const registry = readRecordRegistry();

  for (const rule of RECORD_SCREEN_COVERAGE) {
    it(`covers every ${rule.moduleKey} screen with a ${rule.sector} alert`, () => {
      const coveredEntries = registry.filter(
        (entry) =>
          entry.moduleKeys.includes(rule.moduleKey) &&
          entry.id.startsWith(rule.screenIdPrefix),
      );

      expect(coveredEntries.length).toBeGreaterThan(0);
      for (const entry of coveredEntries) {
        assertDiseaseAlertCoverage(entry, rule.sector, rule.sectorLabel);
      }
    });
  }
});