import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Tenant } from "@/lib/api";
import { TenantContactEditDialog } from "./CustomerDetail";

const updateTenant = vi.fn();

vi.mock("@/lib/api", () => ({
  api: {
    updateTenant: (...args: unknown[]) => updateTenant(...args),
  },
}));

vi.mock("@/lib/auth", () => ({ getSecret: () => "test-secret" }));

const tenant: Tenant = {
  id: 42,
  name: "Test Farm",
  slug: "test-farm",
  contactEmail: "owner@example.com",
  contactPhone: "+44 7700 900111",
  isActive: true,
  createdAt: "2026-09-01T12:00:00Z",
};

function renderEditor() {
  const onClose = vi.fn();
  const onSaved = vi.fn();
  render(
    <TenantContactEditDialog
      tenant={tenant}
      onClose={onClose}
      onSaved={onSaved}
    />,
  );
  return { onClose, onSaved };
}

describe("tenant contact editor validation", () => {
  beforeEach(() => {
    updateTenant.mockReset();
  });

  it("shows feedback for a malformed email without sending a request", () => {
    renderEditor();

    const emailInput = screen.getByPlaceholderText("e.g. john@example.com");
    fireEvent.change(emailInput, {
      target: { value: "not-an-email" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(screen.getByText("Enter a valid contact email address")).toBeTruthy();
    expect(emailInput.getAttribute("aria-invalid")).toBe("true");
    expect(updateTenant).not.toHaveBeenCalled();
  });

  it("saves a valid email and clears an optional phone", async () => {
    const updatedTenant = {
      ...tenant,
      contactEmail: "new.owner@example.com",
      contactPhone: undefined,
    };
    updateTenant.mockResolvedValue({ tenant: updatedTenant });
    const { onClose, onSaved } = renderEditor();

    fireEvent.change(screen.getByPlaceholderText("e.g. john@example.com"), {
      target: { value: " new.owner@example.com " },
    });
    fireEvent.change(screen.getByPlaceholderText("e.g. 07700 900000"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() =>
      expect(updateTenant).toHaveBeenCalledWith(
        tenant.id,
        {
          contactName: tenant.name,
          contactEmail: "new.owner@example.com",
          contactPhone: null,
        },
        "test-secret",
      ),
    );
    expect(onSaved).toHaveBeenCalledWith(updatedTenant);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});