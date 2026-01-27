import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ProjectsProvider } from "../context/ProjectsContext";
import { ToastProvider } from "../context/ToastContext";
import Home from "../pages/Home";

const renderHome = () =>
  render(
    <MemoryRouter>
      <ProjectsProvider>
        <ToastProvider>
          <Home />
        </ToastProvider>
      </ProjectsProvider>
    </MemoryRouter>
  );

beforeEach(() => {
  localStorage.clear();
});

describe("Home page", () => {
  it("renders the hero section once data loads", async () => {
    renderHome();

    expect(
      await screen.findByText("Community Donation Hub")
    ).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
  });

  it("filters projects by search query", async () => {
    renderHome();

    const user = userEvent.setup();
    const input = await screen.findByPlaceholderText("Search projects...");

    await user.type(input, "Solar");

    const projectsSection = screen.getByText("All Projects").closest("section");
    const scoped = within(projectsSection);

    expect(scoped.getByText(/projects found$/)).toBeInTheDocument();
    expect(scoped.getByText("Community Solar Garden")).toBeInTheDocument();
    expect(
      scoped.queryByText("Neighborhood Learning Lab")
    ).not.toBeInTheDocument();
  });

  it("filters projects by category", async () => {
    renderHome();

    const user = userEvent.setup();
    const select = await screen.findByLabelText("Filter by:");

    await user.selectOptions(select, "environment");

    const projectsSection = document.getElementById("projects");
    expect(projectsSection).not.toBeNull();

    const scoped = within(projectsSection);
    expect(scoped.getByText("Community Solar Garden")).toBeInTheDocument();
    expect(
      scoped.queryByText("Neighborhood Learning Lab")
    ).not.toBeInTheDocument();
  });

  it("opens and closes the project modal with escape", async () => {
    renderHome();

    const user = userEvent.setup();
    const projectButton = await screen.findByRole("button", {
      name: /Neighborhood Learning Lab/i,
    });

    await user.click(projectButton);

    expect(
      screen.getByRole("button", { name: "Donate Now" })
    ).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });

    expect(
      screen.queryByRole("button", { name: "Donate Now" })
    ).not.toBeInTheDocument();
  });
});
