import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
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

describe("Routing", () => {
  it("renders home at /", async () => {
    renderApp("/");

    expect(
      await screen.findByRole("heading", { name: "Community Donation Hub" })
    ).toBeInTheDocument();
  });

  it("renders project details for /projects/:id", async () => {
    renderApp("/projects/p-1001");

    expect(
      await screen.findByRole("heading", { name: "Neighborhood Learning Lab" })
    ).toBeInTheDocument();
  });

  it("redirects /dashboard to /admin", () => {
    renderApp("/dashboard");

    expect(
      screen.getByRole("heading", { name: "Admin Access" })
    ).toBeInTheDocument();
  });

  it("renders admin access at /admin", () => {
    renderApp("/admin");

    expect(
      screen.getByRole("heading", { name: "Admin Access" })
    ).toBeInTheDocument();
  });
});
