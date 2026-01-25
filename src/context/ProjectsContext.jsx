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
      getFeaturedProjects,
      formatCurrency,
    }),
    [
      projects,
      isLoading,
      addProject,
      updateProject,
      removeProject,
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
