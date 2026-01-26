import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { ProjectsProvider } from "../context/ProjectsContext";
import { ToastProvider } from "../context/ToastContext";
import AdminDashboard from "../pages/AdminDashboard";

const renderDashboard = () =>
  render(
    <MemoryRouter>
      <AuthProvider>
        <ProjectsProvider>
          <ToastProvider>
            <AdminDashboard />
          </ToastProvider>
        </ProjectsProvider>
      </AuthProvider>
    </MemoryRouter>
  );

beforeEach(() => {
  localStorage.clear();
});

describe("Admin dashboard", () => {
  it("shows the login form when not authenticated", () => {
    renderDashboard();
    expect(screen.getByText("Admin Access")).toBeInTheDocument();
    expect(screen.getByLabelText("Admin email")).toBeInTheDocument();
  });

  it("allows an admin to sign in and view the dashboard", async () => {
    renderDashboard();

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Admin email"), "kashiku789@gmail.com");
    await user.type(screen.getByLabelText("Password"), "ashanti-2026");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Platform snapshot")).toBeInTheDocument();
  });
});
