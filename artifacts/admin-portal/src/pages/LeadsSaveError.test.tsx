import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Lead } from "@/lib/api";
import { LeadPanel } from "./Leads";

const updateLead = vi.fn();

vi.mock("@/lib/api", () => ({
  api: {
    updateLead: (...args: unknown[]) => updateLead(...args),
    deleteLead: vi.fn(),
  },
}));

vi.mock("@/lib/auth", () => ({ getSecret: () => "test-secret" }));
vi.mock("wouter", () => ({ useLocation: () => ["/leads", vi.fn()] }));

const lead: Lead = {
  id: 42,
  businessName: "Hill Farm",
  contactName: "Alex Farmer",
  email: "alex@example.com",
  farmCount: 1,
  modulesInterested: [],
  status: "new",
  notes: "Call next week",
  createdAt: "2026-09-01T12:00:00Z",
};

describe("LeadPanel save errors", () => {
  beforeEach(() => {
    updateLead.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("keeps unsaved values visible after failure and clears the error on a successful retry", async () => {
    const savedLead = { ...lead, notes: "Call tomorrow" };
    updateLead
      .mockRejectedValueOnce(new Error("503 Service Unavailable"))
      .mockResolvedValueOnce({ lead: savedLead });
    const onSaved = vi.fn();

    render(
      <LeadPanel
        lead={lead}
        onClose={vi.fn()}
        onSaved={onSaved}
        onDeleted={vi.fn()}
      />,
    );

    const notes = screen.getByPlaceholderText("Add follow-up notes, call outcomes, next steps…");
    fireEvent.change(notes, { target: { value: "Call tomorrow" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("Lead changes were not saved.");
    expect(alert.textContent).toContain("503 Service Unavailable");
    expect((notes as HTMLTextAreaElement).value).toBe("Call tomorrow");
    expect(screen.getByText("Hill Farm")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledWith(savedLead));
    expect(screen.queryByRole("alert")).toBeNull();
    expect(updateLead).toHaveBeenCalledTimes(2);
  });
});