import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { ProjectsProvider } from "../context/ProjectsContext";
import { ToastProvider } from "../context/ToastContext";
import App from "../App";

const renderApp = (route) =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <ProjectsProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </ProjectsProvider>
      </AuthProvider>
    </MemoryRouter>
  );

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Donate flow", () => {
  it("shows a warning toast for invalid donation amounts", async () => {
    renderApp("/donate/p-1001");

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Full name"), "Test Donor");
    await user.type(screen.getByLabelText("Email"), "donor@example.com");
    await user.click(screen.getByRole("button", { name: "Pay now" }));

    expect(
      await screen.findByText("Enter a valid donation amount.")
    ).toBeInTheDocument();
  });

  it("updates donors after a successful donation", async () => {
    vi.useFakeTimers();

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderApp("/donate/p-1001");

    await user.type(screen.getByLabelText("Full name"), "Test Donor");
    await user.type(screen.getByLabelText("Email"), "donor@example.com");
    await user.type(screen.getByLabelText("Donation amount (KSh)"), "500");
    await user.click(screen.getByRole("button", { name: "Pay now" }));

    await act(async () => {
      vi.runAllTimers();
    });

    expect(
      await screen.findByRole("heading", { name: "Neighborhood Learning Lab" })
    ).toBeInTheDocument();
    expect(screen.getByText("43 donors")).toBeInTheDocument();
  });
});
