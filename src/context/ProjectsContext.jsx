import { createContext, useCallback, useMemo, useState, useEffect } from "react";
import { seedProjects } from "../data/seedData";
import useLocalStorage from "../hooks/useLocalStorage";

// Create the ProjectsContext
export const ProjectsContext = createContext(null);

export function ProjectsProvider({ children }) {
  // Use localStorage to persist projects across page refreshes
  const [storedProjects, setStoredProjects] = useLocalStorage("cdh-projects", null);
  
  const [projects, setProjects] = useState(storedProjects || seedProjects);
  // State to hold projects fetched from JSON Server
  const [projects, setProjects] = useState([]);
  // State to track loading status
  const [isLoading, setIsLoading] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(false);

  // Sync projects to localStorage whenever they change
  useEffect(() => {
    setStoredProjects(projects);
  }, [projects, setStoredProjects]);

  // Fetch projects from JSON Server when component mounts
  useEffect(() => {
    fetch("http://localhost:3002/projects") 
      .then(res => res.json())
      .then(data => {
        setProjects(data); 
        setIsLoading(false); 
      })
      .catch(err => {
        console.error("Failed to fetch projects:", err);
        setIsLoading(false);
      });
  }, []);

  // Add a new project (POST request)
  const addProject = useCallback((project) => {
    const id = `p-${Date.now()}`; // Generate unique ID
    const newProject = {
      id,
      title: project.title.trim(),
      description: project.description.trim(),
      category: project.category || "community",
      imageUrl: project.imageUrl ? project.imageUrl.trim() : "",
      galleryUrls: Array.isArray(project.galleryUrls)
        ? project.galleryUrls.filter(Boolean)
        : (project.galleryUrls || "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
      galleryCount: Number(project.galleryCount) || 0,
      goal: Number(project.goal) || 0,
      currentAmount: Number(project.currentAmount) || 0,
      donorCount: Number(project.donorCount) || 0,
      status: project.goal > 0 ? "active" : "draft",
    };

    // Send new project to JSON Server
    fetch("http://localhost:3002/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProject),
    })
      .then(res => res.json())
      .then(savedProject => {
        setProjects((prev) => [savedProject, ...prev]); // Update state with new project
      })
      .catch(err => console.error("Failed to add project:", err));

    return id;
  }, []);

  // Update an existing project (PUT request)
  const updateProject = useCallback((id, updates) => {
    const projectToUpdate = projects.find(p => p.id === id);
    if (!projectToUpdate) return;

    const updatedProject = { ...projectToUpdate, ...updates };

    fetch(`http://localhost:3002/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedProject),
    })
      .then(res => res.json())
      .then(savedProject => {
        setProjects((prev) =>
          prev.map((project) => project.id === id ? savedProject : project)
        );
      })
      .catch(err => console.error("Failed to update project:", err));
  }, [projects]);

  // Remove a project via DELETE request
  const removeProject = useCallback((id) => {
    fetch(`http://localhost:3002/projects/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        setProjects((prev) => prev.filter((project) => project.id !== id));
      })
      .catch(err => console.error("Failed to delete project:", err));
  }, []);

  // Add a donation to a project via PATCH request
  const addDonation = useCallback((id, amount) => {
    const projectToUpdate = projects.find(p => p.id === id);
    if (!projectToUpdate) return;

    const currentAmount = Number(projectToUpdate.currentAmount) || 0;
    const donorCount = Number(projectToUpdate.donorCount) || 0;
    const nextAmount = currentAmount + amount;
    const isFunded = projectToUpdate.goal && nextAmount >= projectToUpdate.goal;
    const nextStatus = isFunded ? "funded" : "active";

    const updatedProject = {
      ...projectToUpdate,
      currentAmount: nextAmount,
      donorCount: donorCount + 1,
      status: nextStatus,
    };

    fetch(`http://localhost:3002/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedProject),
    })
      .then(res => res.json())
      .then(savedProject => {
        setProjects((prev) =>
          prev.map((project) => project.id === id ? savedProject : project)
        );
      })
      .catch(err => console.error("Failed to add donation:", err));
  }, [projects]);

  // Get top 3 featured projects based on progress
  const getFeaturedProjects = useCallback(() => {
    const sorted = [...projects].sort((a, b) => {
      const aProgress = a.goal ? a.currentAmount / a.goal : 0;
      const bProgress = b.goal ? b.currentAmount / b.goal : 0;
      return bProgress - aProgress;
    });
    return sorted.slice(0, 3);
  }, [projects]);

  // Format currency in Kenyan Shillings
  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  }, []);

  // Memoize context value
  const value = useMemo(() => ({
    projects,
    isLoading,
    addProject,
    updateProject,
    removeProject,
    addDonation,
    getFeaturedProjects,
    formatCurrency,
  }), [projects, isLoading, addProject, updateProject, removeProject, addDonation, getFeaturedProjects, formatCurrency]);

  // Provide context to children
  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
}

