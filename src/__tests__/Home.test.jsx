import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ProjectsProvider } from "../context/ProjectsContext";
import { ToastProvider } from "../context/ToastContext";
import { FeedbackProvider } from "../context/FeedbackContext";
import { DonationsProvider } from "../context/DonationsContext";
import Home from "../pages/Home";

const renderHome = () =>
  render(
    <MemoryRouter>
      <ProjectsProvider>
        <DonationsProvider>
          <FeedbackProvider>
            <ToastProvider>
              <Home />
            </ToastProvider>
          </FeedbackProvider>
        </DonationsProvider>
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

  it("displays project cards with links to details", async () => {
    renderHome();

    // Wait for projects to load
    await screen.findByText("Community Donation Hub");

    // Find all project links - should have multiple "Donate Page" links
    const projectLinks = await screen.findAllByRole("link", {
      name: /Donate Page/i,
    });

    expect(projectLinks.length).toBeGreaterThan(0);
    expect(projectLinks[0]).toHaveAttribute("href", expect.stringContaining("/projects/"));
  });
});
