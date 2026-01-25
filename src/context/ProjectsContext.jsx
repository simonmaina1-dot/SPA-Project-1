import { createContext, useCallback, useMemo, useState, useEffect } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

const seedProjects = [
  {
    id: "p-1001",
    title: "Neighborhood Learning Lab",
    description:
      "A pop-up classroom with devices, tutors, and weekend workshops for local youth.",
    category: "education",
    goal: 12000,
    currentAmount: 6800,
    donorCount: 42,
    status: "active",
  },
  {
    id: "p-1002",
    title: "Community Solar Garden",
    description:
      "Shared solar panels for residents who cannot install their own rooftop systems.",
    category: "environment",
    goal: 30000,
    currentAmount: 21400,
    donorCount: 96,
    status: "active",
  },
  {
    id: "p-1003",
    title: "Mobile Health Clinic",
    description:
      "Monthly wellness visits and screenings for underserved blocks.",
    category: "health",
    goal: 18000,
    currentAmount: 18000,
    donorCount: 73,
    status: "funded",
  },
  {
    id: "p-1004",
    title: "After-School Arts Collective",
    description:
      "Studio space, supplies, and mentorship for emerging community artists.",
    category: "arts",
    goal: 9500,
    currentAmount: 4100,
    donorCount: 28,
    status: "active",
  },
  {
    id: "p-1005",
    title: "Clean Water Refill Station",
    description:
      "Install a public water refill kiosk to cut plastic waste and improve access.",
    category: "community",
    goal: 15000,
    currentAmount: 5200,
    donorCount: 31,
    status: "active",
  },
  {
    id: "p-1006",
    title: "Neighborhood Food Pantry Fridge",
    description:
      "A solar-powered community fridge stocked weekly with fresh groceries.",
    category: "community",
    goal: 8000,
    currentAmount: 7600,
    donorCount: 54,
    status: "active",
  },
  {
    id: "p-1007",
    title: "Girls in Tech Kit Drive",
    description:
      "Starter kits and mentorship sessions for girls exploring coding and robotics.",
    category: "technology",
    goal: 14000,
    currentAmount: 9300,
    donorCount: 61,
    status: "active",
  },
  {
    id: "p-1008",
    title: "Youth Soccer Equipment Drive",
    description:
      "Uniforms, cones, and balls for weekly practice in neighborhood parks.",
    category: "sports",
    goal: 6000,
    currentAmount: 2500,
    donorCount: 19,
    status: "active",
  },
];

export const ProjectsContext = createContext(null);

export function ProjectsProvider({ children }) {
  const [projects, setProjects] = useLocalStorage("cdh-projects", seedProjects);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  const addProject = useCallback(
    (project) => {
      const id = `p-${Date.now()}`;
      const goal = Number(project.goal) || 0;
      const newProject = {
        id,
        title: project.title.trim(),
        description: project.description.trim(),
        category: project.category || "community",
        goal,
        currentAmount: Number(project.currentAmount) || 0,
        donorCount: Number(project.donorCount) || 0,
        status: goal > 0 ? "active" : "draft",
      };

      setProjects((prev) => [newProject, ...prev]);
      return id;
    },
    [setProjects]
  );

  const updateProject = useCallback(
    (id, updates) => {
      setProjects((prev) =>
        prev.map((project) =>
          project.id === id ? { ...project, ...updates } : project
        )
      );
    },
    [setProjects]
  );

  const removeProject = useCallback(
    (id) => {
      setProjects((prev) => prev.filter((project) => project.id !== id));
    },
    [setProjects]
  );

  const addDonation = useCallback(
    (id, amount) => {
      setProjects((prev) =>
        prev.map((project) => {
          if (project.id !== id) {
            return project;
          }

          const currentAmount = Number(project.currentAmount) || 0;
          const donorCount = Number(project.donorCount) || 0;
          const nextAmount = currentAmount + amount;
          const isFunded = project.goal && nextAmount >= project.goal;
          const nextStatus =
            project.status === "review" ? "review" : isFunded ? "funded" : "active";

          return {
            ...project,
            currentAmount: nextAmount,
            donorCount: donorCount + 1,
            status: nextStatus,
          };
        })
      );
    },
    [setProjects]
  );

  const getFeaturedProjects = useCallback(() => {
    const sorted = [...projects].sort((a, b) => {
      const aProgress = a.goal ? a.currentAmount / a.goal : 0;
      const bProgress = b.goal ? b.currentAmount / b.goal : 0;
      return bProgress - aProgress;
    });

    return sorted.slice(0, 3);
  }, [projects]);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  }, []);

  const value = useMemo(
    () => ({
      projects,
      isLoading,
      addProject,
      updateProject,
      removeProject,
      addDonation,
      getFeaturedProjects,
      formatCurrency,
    }),
    [
      projects,
      isLoading,
      addProject,
      updateProject,
      removeProject,
      addDonation,
      getFeaturedProjects,
      formatCurrency,
    ]
  );

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
}
