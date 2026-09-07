/**
 * Component-level coverage for the issue age shown by DiseaseAlertBanner.
 *
 * The banner is a pure renderer, so these tests inspect the React element
 * tree directly instead of starting a native renderer. This keeps the test
 * compatible with the mobile package's Node-based Jest projects.
 */

jest.mock("react-native", () => ({
  StyleSheet: {
    create: (styles: Record<string, unknown>) => styles,
  },
  Text: "Text",
  View: "View",
}));

jest.mock("@expo/vector-icons", () => ({
  Feather: "Feather",
}));

import React from "react";
import { DiseaseAlertBanner } from "../components/ui/DiseaseAlertBanner";
import type { DiseaseAlertData } from "../lib/hooks/useDiseaseAlert";

const NOW = new Date("2026-09-01T12:00:00.000Z");
const DAY_MS = 24 * 60 * 60 * 1000;

function daysAgo(days: number): string {
  return new Date(NOW.getTime() - days * DAY_MS).toISOString();
}

function textNodes(node: React.ReactNode): string[] {
  if (typeof node === "string" || typeof node === "number") {
    return [String(node)];
  }
  if (Array.isArray(node)) {
    return node.flatMap(textNodes);
  }
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode };
    return textNodes(props.children);
  }
  return [];
}

function renderedText(alert: DiseaseAlertData): string[] {
  const element = DiseaseAlertBanner({ alert, sector: "Cattle" });
  return textNodes(element);
}

function activeAlert(
  dateFields: Pick<DiseaseAlertData, "issuedAt" | "date">,
): DiseaseAlertData {
  return {
    active: true,
    level: "national",
    message: "National cattle alert",
    ...dateFields,
  };
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(NOW);
});

afterEach(() => {
  jest.useRealTimers();
});

describe("DiseaseAlertBanner issue age", () => {
  it("shows today's issue age", () => {
    expect(renderedText(activeAlert({ issuedAt: daysAgo(0) }))).toContain(
      "Issued today",
    );
  });

  it("shows yesterday's issue age", () => {
    expect(renderedText(activeAlert({ issuedAt: daysAgo(1) }))).toContain(
      "Issued yesterday",
    );
  });

  it("shows the number of days since a five-day-old issue", () => {
    expect(renderedText(activeAlert({ issuedAt: daysAgo(5) }))).toContain(
      "Issued 5 days ago",
    );
  });

  it("falls back to the legacy date when issuedAt is absent", () => {
    expect(
      renderedText(activeAlert({ date: "16 March 2026" })),
    ).toContain("Issued 16 March 2026");
  });

  it("falls back to the legacy date when issuedAt is invalid", () => {
    expect(
      renderedText(
        activeAlert({
          issuedAt: "not-a-valid-timestamp",
          date: "16 March 2026",
        }),
      ),
    ).toContain("Issued 16 March 2026");
  });

  it("does not render a date line when issuedAt is invalid without a fallback", () => {
    expect(
      renderedText(activeAlert({ issuedAt: "not-a-valid-timestamp" })),
    ).not.toContain(expect.stringMatching(/^Issued\b/));
  });

  it("does not render a date line when neither date field is present", () => {
    expect(renderedText(activeAlert({}))).not.toContain(
      expect.stringMatching(/^Issued\b/),
    );
  });

  it("does not retain the prior farm's issue age after the alert changes", () => {
    const previousFarmText = renderedText(
      activeAlert({ issuedAt: daysAgo(5) }),
    );
    const switchedFarmText = renderedText(activeAlert({}));

    expect(previousFarmText).toContain("Issued 5 days ago");
    expect(switchedFarmText).not.toContain(
      expect.stringMatching(/^Issued\b/),
    );
  });
});