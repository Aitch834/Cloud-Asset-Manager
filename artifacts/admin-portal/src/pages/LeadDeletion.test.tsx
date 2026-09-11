import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Lead } from "@/lib/api";
import Leads, { LeadPanel } from "./Leads";

const getLeads = vi.fn();
const deleteLead = vi.fn();

vi.mock("@/lib/api", () => ({
  api: {
    getLeads: (...args: unknown[]) => getLeads(...args),
    updateLead: vi.fn(),
    deleteLead: (...args: unknown[]) => deleteLead(...args),
  },
}));

vi.mock("@/lib/auth", () => ({ getSecret: () => "test-secret" }));
vi.mock("wouter", () => ({ useLocation: () => ["/leads", vi.fn()] }));

const lead: Lead = {
  id: 42,
  businessName: "Spam Test Farm",
  contactName: "Test Submitter",
  email: "spam@example.com",
  farmCount: 1,
  modulesInterested: [],
  status: "new",
  notes: null,
  createdAt: "2026-09-01T12:00:00Z",
};

function renderPanel(overrides: { onDeleted?: () => void } = {}) {
  const onDeleted = overrides.onDeleted ?? vi.fn();
  render(
    <LeadPanel
      lead={lead}
      onClose={vi.fn()}
      onSaved={vi.fn()}
      onDeleted={onDeleted}
    />,
  );
  return { onDeleted };
}

async function openDeleteConfirmation() {
  fireEvent.click(screen.getByRole("button", { name: "Delete lead" }));
  await screen.findByText("Delete Spam Test Farm? This cannot be undone.");
}

describe("lead deletion", () => {
  beforeEach(() => {
    getLeads.mockReset();
    deleteLead.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("leaves the lead unchanged when confirmation is cancelled", async () => {
    const { onDeleted } = renderPanel();

    await openDeleteConfirmation();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() =>
      expect(
        screen.queryByText("Delete Spam Test Farm? This cannot be undone."),
      ).toBeNull(),
    );
    expect(screen.getByText("Spam Test Farm")).toBeTruthy();
    expect(deleteLead).not.toHaveBeenCalled();
    expect(onDeleted).not.toHaveBeenCalled();
  });

  it("keeps a failed confirmation open with an error and allows retry", async () => {
    deleteLead
      .mockRejectedValueOnce(new Error("503 Service Unavailable"))
      .mockResolvedValueOnce({ deleted: true });
    const { onDeleted } = renderPanel();

    await openDeleteConfirmation();
    fireEvent.click(screen.getByRole("button", { name: "Delete lead" }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("Failed — please try again.");
    expect(alert.textContent).toContain("503 Service Unavailable");
    expect(
      screen.getByText("Delete Spam Test Farm? This cannot be undone."),
    ).toBeTruthy();
    expect(onDeleted).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Delete lead" }));

    await waitFor(() => expect(onDeleted).toHaveBeenCalledTimes(1));
    expect(deleteLead).toHaveBeenCalledTimes(2);
    expect(deleteLead).toHaveBeenLastCalledWith(lead.id, "test-secret");
  });

  it("removes a successfully deleted lead from the pipeline list", async () => {
    getLeads.mockResolvedValue({ leads: [lead] });
    deleteLead.mockResolvedValue({ deleted: true });
    render(<Leads />);

    fireEvent.click(await screen.findByText("Spam Test Farm"));
    await openDeleteConfirmation();
    fireEvent.click(screen.getByRole("button", { name: "Delete lead" }));

    await waitFor(() =>
      expect(screen.queryByText("Spam Test Farm")).toBeNull(),
    );
    expect(screen.getByText("No Register Interest submissions yet.")).toBeTruthy();
    expect(deleteLead).toHaveBeenCalledWith(lead.id, "test-secret");
  });
});