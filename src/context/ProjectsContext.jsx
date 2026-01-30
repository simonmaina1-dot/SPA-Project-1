import { createContext, useCallback, useMemo, useState, useEffect, useContext } from "react";
import { defaultCriteriaMet } from "../data/projectCriteria";
import { VerificationContext } from "./VerificationContext";

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

  // Auto-approve pre-loaded sample projects (those without an ownerId)
  // Vetting only applies to new projects submitted via "Start New Project"
  const hasExistingStatus = project.verificationStatus !== undefined;
  const isPreLoadedProject = !ownerId && !createdBy;
  const verificationStatus = hasExistingStatus
    ? project.verificationStatus
    : (isPreLoadedProject ? "approved" : "pending");

  return {
    ...project,
    ownerId,
    ownerName,
    ownerEmail,
    ownerPhone,
    identityDocument: project.identityDocument || "",
    // verificationStatus: "pending" = awaiting review
    // verificationStatus: "under_review" = admin is reviewing
    // verificationStatus: "approved" = admin approved, visible to public
    // verificationStatus: "rejected" = admin rejected, not visible
    verificationStatus,
    verificationNotes: project.verificationNotes || "",
    adminReviewer: project.adminReviewer || null,
    reviewedAt: project.reviewedAt || null,
    criteriaMet,
    fundUsage: Array.isArray(project.fundUsage) ? project.fundUsage : [],
  };
};

export function ProjectsProvider({ children }) {
  // State to hold projects fetched from JSON Server
  const [projects, setProjects] = useState([]);
  // State to track loading status
  const [isLoading, setIsLoading] = useState(true);

  // Fetch projects from JSON Server when component mounts
  useEffect(() => {
    fetch('/data/collections/projects.json')
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
      goal: Number(project.goal) || 0,
      currentAmount: Number(project.currentAmount) || 0,
      donorCount: Number(project.donorCount) || 0,
      status: project.goal > 0 ? "active" : "draft",
      createdAt: project.createdAt || new Date().toISOString(),
      createdBy: project.createdBy || null,
      ownerId: project.ownerId || project.createdBy?.id || "",
      ownerName: project.ownerName || project.createdBy?.name || "",
      ownerEmail: project.ownerEmail || project.createdBy?.email || "",
      ownerPhone: project.ownerPhone || "",
      identityDocument: project.identityDocument || "",
      verificationStatus: project.verificationStatus || "pending",
      verificationNotes: project.verificationNotes || "",
      criteriaMet: project.criteriaMet || defaultCriteriaMet,
      fundUsage: project.fundUsage || [],
    });

    // Send new project to JSON Server
    fetch("http://localhost:3002/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProject),
    })
      .then((res) => res.json())
      .then((savedProject) => {
        setProjects((prev) => [savedProject, ...prev]); // Update state with new project
      })
      .catch((err) => console.error("Failed to add project:", err));

    return id;
  }, []);

  // Update an existing project (PUT request)
  const updateProject = useCallback((id, updates) => {
    const projectToUpdate = projects.find((p) => p.id === id);
    if (!projectToUpdate) return;

    const updatedProject = normalizeProject({ ...projectToUpdate, ...updates });

    fetch(`http://localhost:3002/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedProject),
    })
      .then((res) => res.json())
      .then((savedProject) => {
        setProjects((prev) =>
          prev.map((project) => (project.id === id ? savedProject : project))
        );
      })
      .catch((err) => console.error("Failed to update project:", err));
  }, [projects]);

  // Remove a project via DELETE request
  const removeProject = useCallback((id) => {
    fetch(`http://localhost:3002/projects/${id}`, {
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

    fetch(`http://localhost:3002/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedProject),
    })
      .then((res) => res.json())
      .then((savedProject) => {
        setProjects((prev) =>
          prev.map((project) => (project.id === id ? savedProject : project))
        );
      })
      .catch((err) => console.error("Failed to add donation:", err));
  }, [projects]);

  // Get top 3 featured projects based on progress (only approved projects)
  const getFeaturedProjects = useCallback(() => {
    const approvedProjects = projects.filter((p) => p.verificationStatus === "approved");
    const sorted = [...approvedProjects].sort((a, b) => {
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
    return projects.filter((p) => p.verificationStatus === "pending" || p.verificationStatus === "under_review");
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

    fetch(`http://localhost:3002/projects/${projectId}`, {
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
