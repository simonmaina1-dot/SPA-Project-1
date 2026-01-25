import { useState, useMemo, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import useProjects from "../hooks/useProjects";
import ProjectCard from "../components/ProjectCard";
import Modal from "../components/Modal";
import { ToastContext } from "../context/ToastContext";

/**
 * Home Page - Main landing page displaying community projects
 * 
 * KEY FEATURES:
 * - Project search functionality
 * - Category filtering
 * - Featured projects section
 * - Loading state handling
 * - Empty state when no projects exist
 * - Toast notifications for user feedback
 * - Modal for project actions
 * 
 * WHY useMemo for filtering?
 * - Prevents unnecessary recalculation on re-renders
 * - Only recalculates when search query or filter changes
 * - Performance optimization
 * 
 * WHY useEffect?
 * - Side effects like showing welcome toast on mount
 * - Cleanup not needed here since we only run once
 */
export default function Home() {
  const { projects, isLoading, getFeaturedProjects, formatCurrency } = useProjects();
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Show welcome toast on first mount
  useEffect(() => {
    if (projects.length > 0) {
      showToast(`Welcome! ${projects.length} projects available`, "info");
    }
  }, [projects.length, showToast]); // Run when projects length or showToast changes

  // Filter projects based on search and category
  // useMemo ensures this only runs when dependencies change
  const filteredProjects = useMemo(() => {
    let result = projects;

    // Apply category filter first
    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Then apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    return result;
  }, [projects, searchQuery, selectedCategory]);

  // Get featured projects for the hero section
  const featuredProjects = useMemo(() => {
    return getFeaturedProjects();
  }, [getFeaturedProjects]);

  // Calculate total funding stats
  const totalStats = useMemo(() => {
    const totalRaised = projects.reduce((sum, p) => sum + (p.currentAmount || 0), 0);
    const totalGoal = projects.reduce((sum, p) => sum + (p.goal || 0), 0);
    const totalDonors = projects.reduce((sum, p) => sum + (p.donorCount || 0), 0);
    const fundedCount = projects.filter((p) => (p.currentAmount || 0) >= (p.goal || 0)).length;

    return { totalRaised, totalGoal, totalDonors, fundedCount };
  }, [projects]);

  // Categories for filter dropdown
  const categories = [
    { value: "all", label: "All Categories" },
    { value: "education", label: "Education" },
    { value: "health", label: "Health & Medical" },
    { value: "environment", label: "Environment" },
    { value: "community", label: "Community" },
    { value: "technology", label: "Technology" },
    { value: "arts", label: "Arts & Culture" },
    { value: "sports", label: "Sports & Recreation" },
    { value: "other", label: "Other" }
  ];

  // Handle project card click - opens modal
  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  // Close modal handler
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="page home-page">
        <div className="loading-state">
          <div className="spinner large"></div>
          <p>Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Community Donation Hub</h1>
          <p className="hero-subtitle">
            Support meaningful projects making a difference in our community
          </p>
          
          {/* Stats Dashboard */}
          <div className="stats-dashboard">
            <div className="stat-card">
              <span className="stat-value">{projects.length}</span>
              <span className="stat-label">Projects</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{formatCurrency(totalStats.totalRaised)}</span>
              <span className="stat-label">Total Raised</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{totalStats.totalDonors}</span>
              <span className="stat-label">Donors</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{totalStats.fundedCount}</span>
              <span className="stat-label">Funded</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects (only show if there are projects) */}
      {featuredProjects.length > 0 && projects.length >= 3 && (
        <section className="featured-section">
          <h2>Featured Projects</h2>
          <div className="featured-grid">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} featured />
            ))}
          </div>
        </section>
      )}

      {/* Search and Filter Section */}
      <section className="search-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
        </div>

        <div className="filter-bar">
          <label htmlFor="category-filter">Filter by:</label>
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          {(searchQuery || selectedCategory !== "all") && (
            <button
              className="btn btn-text"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </section>

      {/* Projects Grid */}
      <section className="projects-section">
        <div className="section-header">
          <h2>
            {selectedCategory === "all" ? "All Projects" : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Projects`}
          </h2>
          <span className="project-count">
            {filteredProjects.length} {filteredProjects.length === 1 ? "project" : "projects"} found
          </span>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="empty-state">
            {searchQuery || selectedCategory !== "all" ? (
              <>
                <div className="empty-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                  </svg>
                </div>
                <h3>No projects found</h3>
                <p>Try adjusting your search or filters</p>
              </>
            ) : (
              <>
                <div className="empty-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                  </svg>
                </div>
                <h3>No projects yet</h3>
                <p>Be the first to create a project and start fundraising!</p>
                <Link to="/add" className="btn btn-primary">
                  Create Project
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="projects-grid">
            {filteredProjects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onClick={() => handleProjectClick(project)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Project Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedProject?.title || "Project Details"}
        footer={
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={handleCloseModal}>
              Close
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => {
                if (!selectedProject) {
                  return;
                }
                showToast("Redirecting to demo checkout...", "info");
                handleCloseModal();
                navigate(`/donate/${selectedProject.id}`);
              }}
            >
              Donate Now
            </button>
          </div>
        }
      >
        {selectedProject && (
          <div className="project-details-modal">
            <p className="project-description">{selectedProject.description}</p>
            <div className="project-meta">
              <p><strong>Category:</strong> {selectedProject.category}</p>
              <p><strong>Goal:</strong> {formatCurrency(selectedProject.goal)}</p>
              <p><strong>Raised:</strong> {formatCurrency(selectedProject.currentAmount || 0)}</p>
              <p><strong>Donors:</strong> {selectedProject.donorCount || 0}</p>
              <p><strong>Status:</strong> {selectedProject.status}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
