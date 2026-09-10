import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Router } from "wouter";
import { TaskCard, type TaskItem } from "./WeekAheadPage";

const TODAY = new Date(2026, 8, 8, 12);
const useTestLocation = (): [string, (path: string) => void] => ["/", () => undefined];
const FP_EXPIRY_TYPES = [
  "organic_fp_input_log_derogation_expiry",
  "organic_fp_derogation_expiry",
] as const;

function renderTaskCard(type: (typeof FP_EXPIRY_TYPES)[number], dueDate: string) {
  const task: TaskItem = {
    id: `${type}-${dueDate}`,
    type,
    title: "Organic derogation",
    description: "Review the derogation before it expires.",
    dueDate,
    module: "Organic Fresh Produce",
    href: "/organic-fresh-produce",
    colour: "amber",
  };

  return renderToStaticMarkup(
    <Router hook={useTestLocation}>
      <TaskCard
        task={task}
        today={TODAY}
        staff={[]}
        farmId={1}
        onAssigned={() => undefined}
      />
    </Router>,
  );
}

describe.each(FP_EXPIRY_TYPES)("Week Ahead %s task card", type => {
  it("shows the amber expiry date while active", () => {
    const html = renderTaskCard(type, "2026-09-10T12:00:00");

    expect(html).toContain("Expires 10 Sept 2026");
    expect(html).toContain("text-amber-600");
    expect(html).not.toContain("Expired");
    expect(html).not.toContain("overdue");
  });

  it("shows only the red expired date when overdue", () => {
    const html = renderTaskCard(type, "2026-09-05T12:00:00");

    expect(html).toContain("Expired 5 Sept 2026");
    expect(html).toContain("text-red-600");
    expect(html).not.toContain("Expires ");
    expect(html).not.toMatch(/\d+ days? overdue/);
  });
});