
import { createContext, useCallback, useMemo, useState, useEffect } from "react";
import { seedProjects } from "../data/seedData";

export const ProjectsContext = createContext(null);

const API_BASE = "http://localhost:3002";

const normalizeProject = (project) => {
  const imageUrl =
    project.imageUrl ||
    (project.imageFile ? `/project-images/${project.id}/${project.imageFile}` : "");
  const galleryUrls = Array.isArray(project.galleryUrls)
    ? project.galleryUrls.filter(Boolean)
    : Array.isArray(project.galleryFiles)
      ? project.galleryFiles.map(
          (file) => `/project-images/${project.id}/${file}`
        )
      : [];

  return {
    ...project,
    imageUrl,
    galleryUrls,
    galleryCount:
      Number(project.galleryCount) ||
      (Array.isArray(project.galleryFiles) ? project.galleryFiles.length : 0) ||
      galleryUrls.length,
  };
};

export function ProjectsProvider({ children }) {
  const [projects, setProjects] = useState(seedProjects);
  const [isLoading, setIsLoading] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(false);

  useEffect(() => {
    let isActive = true;
    const loadProjects = async () => {
      try {
        const res = await fetch(`${API_BASE}/projects`);
        if (!res.ok) {
          throw new Error("API unavailable");
        }
        const data = await res.json();
        if (!isActive) return;
        setProjects(data.map(normalizeProject));
        setApiAvailable(true);
      } catch (err) {
        console.warn("Using local seed projects.", err);
        if (!isActive) return;
        setProjects(seedProjects);
        setApiAvailable(false);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadProjects();
    return () => {
      isActive = false;
    };
  }, []);

  const addProject = useCallback(
    async (project) => {
      const id = `p-${Date.now()}`;
      const galleryUrls = Array.isArray(project.galleryUrls)
        ? project.galleryUrls.filter(Boolean)
        : (project.galleryUrls || "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);

      const newProject = normalizeProject({
        id,
        title: project.title.trim(),
        description: project.description.trim(),
        category: project.category || "community",
        imageUrl: project.imageUrl ? project.imageUrl.trim() : "",
        galleryUrls,
        galleryCount: Number(project.galleryCount) || 0,
        goal: Number(project.goal) || 0,
        currentAmount: Number(project.currentAmount) || 0,
        donorCount: Number(project.donorCount) || 0,
        status: project.goal > 0 ? "active" : "draft",
      });

      if (apiAvailable) {
        try {
          const res = await fetch(`${API_BASE}/projects`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newProject),
          });
          if (!res.ok) throw new Error("Failed to add project");
          const saved = await res.json();
          setProjects((prev) => [normalizeProject(saved), ...prev]);
          return id;
        } catch (err) {
          console.error(err);
          setApiAvailable(false);
        }
      }

      setProjects((prev) => [newProject, ...prev]);
      return id;
    },
    [apiAvailable]
  );

  const updateProject = useCallback(
    async (id, updates) => {
      setProjects((prev) =>
        prev.map((project) =>
          project.id === id ? normalizeProject({ ...project, ...updates }) : project
        )
      );

      if (!apiAvailable) return;

      const projectToUpdate = projects.find((project) => project.id === id);
      if (!projectToUpdate) return;

      try {
        const res = await fetch(`${API_BASE}/projects/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...projectToUpdate, ...updates }),
        });
        if (!res.ok) throw new Error("Failed to update project");
        const saved = await res.json();
        setProjects((prev) =>
          prev.map((project) =>
            project.id === id ? normalizeProject(saved) : project
          )
        );
      } catch (err) {
        console.error(err);
        setApiAvailable(false);
      }
    },
    [apiAvailable, projects]
  );

  const removeProject = useCallback(
    async (id) => {
      setProjects((prev) => prev.filter((project) => project.id !== id));

      if (!apiAvailable) return;

      try {
        const res = await fetch(`${API_BASE}/projects/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete project");
      } catch (err) {
        console.error(err);
        setApiAvailable(false);
      }
    },
    [apiAvailable]
  );

  const addDonation = useCallback(
    async (id, amount) => {
      const target = projects.find((project) => project.id === id);
      if (!target) return;

      const currentAmount = Number(target.currentAmount) || 0;
      const donorCount = Number(target.donorCount) || 0;
      const nextAmount = currentAmount + amount;
      const isFunded = target.goal && nextAmount >= target.goal;
      const nextStatus =
        target.status === "review" ? "review" : isFunded ? "funded" : "active";

      const updatedProject = normalizeProject({
        ...target,
        currentAmount: nextAmount,
        donorCount: donorCount + 1,
        status: nextStatus,
      });

      setProjects((prev) =>
        prev.map((project) => (project.id === id ? updatedProject : project))
      );

      if (!apiAvailable) return;

      try {
        const res = await fetch(`${API_BASE}/projects/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedProject),
        });
        if (!res.ok) throw new Error("Failed to add donation");
        const saved = await res.json();
        setProjects((prev) =>
          prev.map((project) =>
            project.id === id ? normalizeProject(saved) : project
          )
        );
      } catch (err) {
        console.error(err);
        setApiAvailable(false);
      }
    },
    [apiAvailable, projects]
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
