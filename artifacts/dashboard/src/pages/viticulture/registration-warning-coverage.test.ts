import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const viticultureDir = dirname(fileURLToPath(import.meta.url));
const reportSource = readFileSync(
  resolve(viticultureDir, "../../components/ViticulturalReports.tsx"),
  "utf8",
);

const printTabs = [
  "ExciseDutyTab.tsx",
  "HarvestTab.tsx",
  "OperationsTab.tsx",
  "PhenologyTab.tsx",
  "ScoutingTab.tsx",
  "SoilAnalysisTab.tsx",
  "SprayDiaryTab.tsx",
  "VineRegisterTab.tsx",
  "WineProductionTab.tsx",
];

describe("Viticulture print-tab registration warning coverage", () => {
  it.each(printTabs)("keeps the registration warning on %s", (fileName) => {
    const source = readFileSync(resolve(viticultureDir, fileName), "utf8");
    expect(source).toMatch(/<FsaCompletenessBar\b/);
    expect(source).toMatch(/Print/);
  });

  it("keeps the shared warning in both report components", () => {
    expect(reportSource.match(/<FsaCompletenessBar\b/g)).toHaveLength(2);
    expect(reportSource).toContain("authorityReferenceLabel: \"WineGB membership number\"");
    expect(reportSource).toContain('{ label: "APPA reference", value: farmMeta?.appaRef');
    expect(reportSource).toContain('{ label: "FSA Wine production reference", value: farmMeta?.fsaWineProductionRef');
  });

  it("keeps the global winery-tab warning coverage", () => {
    const source = readFileSync(resolve(viticultureDir, "ViticulturePage.tsx"), "utf8");
    expect(source).toContain('tab.startsWith("winery-")');
    expect(source).toContain("<FsaCompletenessBar farmId={selectedFarmId} />");
  });
});