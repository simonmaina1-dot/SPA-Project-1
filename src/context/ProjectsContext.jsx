import { createContext, useCallback, useMemo, useState, useEffect } from "react";
import { defaultCriteriaMet } from "../data/projectCriteria";

// Create the ProjectsContext
export const ProjectsContext = createContext(null);

const normalizeProject = (project) => {
  const createdBy = project.createdBy || null;
  const ownerId = project.ownerId || createdBy?.id || "";
  const ownerName = project.ownerName || createdBy?.name || "";
  const ownerEmail = project.ownerEmail || createdBy?.email || "";
  const ownerPhone = project.ownerPhone || "";
  const criteriaMet = {
    ...defaultCriteriaMet,
    ...(project.criteriaMet || {}),
  };
  const verificationStatus =
    project.verificationStatus ||
    (project.status === "review" ? "submitted" : "approved");
  const goalValue = Number(project.goal) || 0;
  const derivedStatus =
    verificationStatus !== "approved"
      ? "review"
      : goalValue > 0
        ? "active"
        : "draft";

  return {
    ...project,
    ownerId,
    ownerName,
    ownerEmail,
    ownerPhone,
    identityDocument: project.identityDocument || "",
    verificationStatus,
    verificationNotes: project.verificationNotes || "",
    adminReviewer: project.adminReviewer || null,
    reviewedAt: project.reviewedAt || null,
    criteriaMet,
    fundUsage: Array.isArray(project.fundUsage) ? project.fundUsage : [],
    status: project.status || derivedStatus,
  };
};

export function ProjectsProvider({ children }) {
  // State to hold projects fetched from JSON Server
  const [projects, setProjects] = useState([]);
  // State to track loading status
  const [isLoading, setIsLoading] = useState(true);

  // API URL from environment or default to local development
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3002";

  // Fetch projects from JSON Server when component mounts
  useEffect(() => {
    fetch(`${apiUrl}/projects`)
      .then((res) => res.json())
      .then((data) => {
        setProjects(data.map(normalizeProject));
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch projects:", err);
        setIsLoading(false);
      });
  }, []);

  // Add a new project (POST request)
  const addProject = useCallback((project) => {
    const id = `p-${Date.now()}`; // Generate unique ID
    const criteriaMet = {
      ...defaultCriteriaMet,
      ...(project.criteriaMet || {}),
    };
    const goalValue = Number(project.goal) || 0;
    const verificationStatus = project.verificationStatus || "submitted";
    const status =
      project.status ||
      (verificationStatus !== "approved"
        ? "review"
        : goalValue > 0
          ? "active"
          : "draft");
    const newProject = normalizeProject({
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
      goal: goalValue,
      currentAmount: Number(project.currentAmount) || 0,
      donorCount: Number(project.donorCount) || 0,
      status,
      createdAt: project.createdAt || new Date().toISOString(),
      createdBy: project.createdBy || null,
      ownerId: project.ownerId || project.createdBy?.id || "",
      ownerName: project.ownerName || project.createdBy?.name || "",
      ownerEmail: project.ownerEmail || project.createdBy?.email || "",
      ownerPhone: project.ownerPhone || "",
      identityDocument: project.identityDocument || "",
      verificationStatus,
      verificationNotes: project.verificationNotes || "",
      criteriaMet,
      fundUsage: Array.isArray(project.fundUsage) ? project.fundUsage : [],
    });

    // Send new project to JSON Server
    fetch(`${apiUrl}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProject),
    })
      .then((res) => res.json())
      .then((savedProject) => {
        setProjects((prev) => [normalizeProject(savedProject), ...prev]); // Update state with new project
      })
      .catch((err) => console.error("Failed to add project:", err));

    return id;
  }, []);

  // Update an existing project (PUT request)
  const updateProject = useCallback((id, updates) => {
    const projectToUpdate = projects.find((p) => p.id === id);
    if (!projectToUpdate) return;

    const updatedProject = normalizeProject({ ...projectToUpdate, ...updates });

    fetch(`${apiUrl}/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedProject),
    })
      .then((res) => res.json())
      .then((savedProject) => {
        setProjects((prev) =>
          prev.map((project) =>
            project.id === id ? normalizeProject(savedProject) : project
          )
        );
      })
      .catch((err) => console.error("Failed to update project:", err));
  }, [projects, apiUrl]);

  // Remove a project via DELETE request
  const removeProject = useCallback((id) => {
    fetch(`${apiUrl}/projects/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        setProjects((prev) => prev.filter((project) => project.id !== id));
      })
      .catch((err) => console.error("Failed to delete project:", err));
  }, []);

  // Add a donation to a project via PATCH request
  const addDonation = useCallback((id, amount) => {
    const projectToUpdate = projects.find((p) => p.id === id);
    if (!projectToUpdate) return;

    const currentAmount = Number(projectToUpdate.currentAmount) || 0;
    const donorCount = Number(projectToUpdate.donorCount) || 0;
    const nextAmount = currentAmount + amount;
    const isFunded = projectToUpdate.goal && nextAmount >= projectToUpdate.goal;
    const nextStatus = isFunded ? "funded" : "active";

    const updatedProject = normalizeProject({
      ...projectToUpdate,
      currentAmount: nextAmount,
      donorCount: donorCount + 1,
      status: nextStatus,
    });

    fetch(`${apiUrl}/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedProject),
    })
      .then((res) => res.json())
      .then((savedProject) => {
        setProjects((prev) =>
          prev.map((project) =>
            project.id === id ? normalizeProject(savedProject) : project
          )
        );
      })
      .catch((err) => console.error("Failed to add donation:", err));
  }, [projects, apiUrl]);

  // Get top 3 featured projects based on progress (only approved projects)
  const getFeaturedProjects = useCallback(() => {
    const visibleProjects = projects.filter(
      (project) => project.verificationStatus === "approved"
    );
    const sorted = [...visibleProjects].sort((a, b) => {
      const aProgress = a.goal ? a.currentAmount / a.goal : 0;
      const bProgress = b.goal ? b.currentAmount / b.goal : 0;
      return bProgress - aProgress;
    });
    return sorted.slice(0, 3);
  }, [projects]);

  // Get only approved projects (for public display)
  const getApprovedProjects = useCallback(() => {
    return projects.filter((p) => p.verificationStatus === "approved");
  }, [projects]);

  // Get projects pending verification (for admin review)
  const getPendingVerificationProjects = useCallback(() => {
    return projects.filter((p) =>
      ["submitted", "under_review", "pending"].includes(p.verificationStatus)
    );
  }, [projects]);

  // Update project verification status (admin action)
  const updateVerificationStatus = useCallback((projectId, status, reviewerId, notes) => {
    const projectToUpdate = projects.find((p) => p.id === projectId);
    if (!projectToUpdate) return;

    const updatedProject = normalizeProject({
      ...projectToUpdate,
      verificationStatus: status,
      adminReviewer: reviewerId,
      reviewedAt: new Date().toISOString(),
      verificationNotes: notes || "",
    });

    fetch(`${apiUrl}/projects/${projectId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedProject),
    })
      .then((res) => res.json())
      .then((savedProject) => {
        setProjects((prev) =>
          prev.map((project) => (project.id === projectId ? savedProject : project))
        );
      })
      .catch((err) => console.error("Failed to update verification status:", err));
  }, [projects, apiUrl]);

  // Format currency in Kenyan Shillings
  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  }, []);

  // Memoize context value
  const value = useMemo(
    () => ({
      projects,
      isLoading,
      addProject,
      updateProject,
      removeProject,
      addDonation,
      getFeaturedProjects,
      getApprovedProjects,
      getPendingVerificationProjects,
      updateVerificationStatus,
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
      getApprovedProjects,
      getPendingVerificationProjects,
      updateVerificationStatus,
      formatCurrency,
    ]
  );

  // Provide context to children
  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
}