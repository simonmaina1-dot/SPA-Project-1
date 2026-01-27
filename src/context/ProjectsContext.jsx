import { createContext, useCallback, useMemo, useState, useEffect } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import seedProjects from "../data/projects.json";

export const ProjectsContext = createContext(null);

export function ProjectsProvider({ children }) {
  const [projects, setProjects] = useLocalStorage("cdh-projects-v4", seedProjects);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

 const addProject = useCallback(
  (project) => {
    const id = `p-${Date.now()}`;
    const goal = Number(project.goal) || 0;
    const imageUrl = project.imageUrl ? project.imageUrl.trim() : "";
    const galleryUrls = Array.isArray(project.galleryUrls)
      ? project.galleryUrls.filter(Boolean)
      : (project.galleryUrls || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
    
    const newProject = {
      id,
      title: project.title.trim(),
      description: project.description.trim(),
      category: project.category || "community",
      imageUrl,
      galleryUrls,
      galleryCount: Number(project.galleryCount) || 0, // ADD THIS LINE
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
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
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
