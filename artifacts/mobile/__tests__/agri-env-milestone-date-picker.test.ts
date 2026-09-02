import fs from "node:fs";
import path from "node:path";

const milestoneDetailSource = fs.readFileSync(
  path.resolve(__dirname, "../app/agri-env-milestone-detail.tsx"),
  "utf8",
);

describe("agri-environment milestone completion date picker", () => {
  it("keeps the Android picker capped at today", () => {
    expect(milestoneDetailSource).toMatch(
      /DateTimePickerAndroid\.open\(\{\s*value,\s*mode:\s*"date",\s*maximumDate:\s*new Date\(\)/,
    );
  });

  it("keeps the iOS picker capped at today", () => {
    expect(milestoneDetailSource).toMatch(
      /<DateTimePicker\s+value=\{parseIsoDateLocal\(editDraft\.completionDate\)\}\s+mode="date"\s+display="spinner"\s+maximumDate=\{new Date\(\)\}/,
    );
  });
});