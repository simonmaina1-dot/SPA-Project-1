import {
  createContext,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from "react";

// Create a React Context for projects
export const ProjectsContext = createContext(null);

// Provider component that wraps your app and provides project data + actions
export function ProjectsProvider({ children }) {
  const [projects, setProjects] = useState([]); // Stores all projects
  const [isLoading, setIsLoading] = useState(true); // Tracks loading state

  // Fetch projects from json-server when component mounts
  useEffect(() => {
    fetch("http://localhost:3001/projects")
      .then((res) => res.json())
      .then((data) => {
        setProjects(data); // Save fetched projects
        setIsLoading(false); // Stop loading
      })
      .catch((err) => {
        console.error("Failed to fetch projects:", err);
        setIsLoading(false); // Stop loading even if there's an error
      });
  }, []);

  // Add a new project
  const addProject = useCallback((project) => {
    const id = `p-${Date.now()}`; // Generate unique ID
    const newProject = {
      id,
      title: project.title.trim(),
      description: project.description.trim(),
      category: project.category || "community",
      imageUrl: project.imageUrl?.trim() || "",
      galleryUrls: Array.isArray(project.galleryUrls)
        ? project.galleryUrls.filter(Boolean)
        : (project.galleryUrls || "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
      goal: Number(project.goal) || 0,
      currentAmount: Number(project.currentAmount) || 0,
      donorCount: Number(project.donorCount) || 0,
      status: project.goal > 0 ? "active" : "draft",
    };

    // Save project to json-server
    fetch("http://localhost:3001/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProject),
    })
      .then((res) => res.json())
      .then((saved) => {
        setProjects((prev) => [saved, ...prev]); // Update local state
      })
      .catch((err) => console.error("Failed to add project:", err));

    return id; // Return generated ID
  }, []);

  // Update an existing project
  const updateProject = useCallback((id, updates) => {
    fetch(`http://localhost:3001/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })
      .then((res) => res.json())
      .then((saved) => {
        // Update project in local state
        setProjects((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...saved } : p))
        );
      })
      .catch((err) => console.error("Failed to update project:", err));
  }, []);

  // Remove a project
  const removeProject = useCallback((id) => {
    fetch(`http://localhost:3001/projects/${id}`, { method: "DELETE" })
      .then(() => {
        setProjects((prev) => prev.filter((p) => p.id !== id)); // Remove from state
      })
      .catch((err) => console.error("Failed to remove project:", err));
  }, []);

  // Add a donation to a project
  const addDonation = useCallback((id, amount) => {
    const project = projects.find((p) => p.id === id);
    if (!project) return;

    const updated = {
      ...project,
      currentAmount: (project.currentAmount || 0) + amount,
      donorCount: (project.donorCount || 0) + 1,
      status:
        project.goal && project.currentAmount + amount >= project.goal
          ? "funded"
          : "active",
    };

    // Update project on server
    fetch(`http://localhost:3001/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    })
      .then((res) => res.json())
      .then((saved) => {
        setProjects((prev) =>
          prev.map((p) => (p.id === id ? saved : p)) // Update state
        );
      })
      .catch((err) => console.error("Failed to add donation:", err));
  }, [projects]);

  // Get top 3 featured projects based on funding progress
  const getFeaturedProjects = useCallback(() => {
    const sorted = [...projects].sort((a, b) => {
      const aProgress = a.goal ? a.currentAmount / a.goal : 0;
      const bProgress = b.goal ? b.currentAmount / b.goal : 0;
      return bProgress - aProgress;
    });
    return sorted.slice(0, 3);
  }, [projects]);

  // Format amount as Kenyan Shillings currency
  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  }, []);

  // Memoize context value to avoid unnecessary re-renders
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

  // Provide projects + actions to child components
  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
}
