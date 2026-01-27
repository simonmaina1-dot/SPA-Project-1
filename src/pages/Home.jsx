import { useState, useMemo, useEffect, useContext, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import useProjects from "../hooks/useProjects";
import ProjectCard from "../components/ProjectCard";
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
 * - Scroll-triggered stats animation
 * 
 * WHY useMemo for filtering?
 * - Prevents unnecessary recalculation on re-renders
 * - Only recalculates when search query or filter changes
 * - Performance optimization
 * 
 * WHY useEffect?
 * - Side effects like showing welcome toast on mount
 * - Intersection Observer for scroll animations
 * - Cleanup not needed here since we only run once
 */
export default function Home() {
  const { projects, isLoading, getFeaturedProjects, formatCurrency } = useProjects();
  const { showToast } = useContext(ToastContext);
  const location = useLocation();
  const aboutRef = useRef(null);
  const statsRef = useRef(null); // Reference for stats animation
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statsVisible, setStatsVisible] = useState(false); // Track stats visibility


  // Show welcome toast on first mount
  useEffect(() => {
    if (projects.length > 0) {
      showToast(`Welcome! ${projects.length} projects available`, "info");
    }
  }, [projects.length, showToast]); // Run when projects length or showToast changes


  // Smooth scroll to about section
  useEffect(() => {
    if (location.hash !== "#about" || !aboutRef.current) {
      return;
    }
    aboutRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location.hash]);


  // Intersection Observer for stats animation on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setStatsVisible(true);
          }
        });
      },
      { 
        threshold: 0.2, // Trigger when 20% of element is visible
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before fully visible
      }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, []);


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
          
          {/* Stats Dashboard with Scroll Animation */}
          <div 
            ref={statsRef} 
            className={`stats-dashboard${statsVisible ? " visible" : ""}`}
          >
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
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>


      {/* About Section */}
      <section className="about-section" id="about" ref={aboutRef}>
        <div className="page-header">
          <h2>About the Architecture</h2>
          <p>
            Community Donation Hub is built with React and a lightweight context
            layer to keep project and toast state in sync.
          </p>
        </div>
        <div className="about-grid">
          <article className="about-card">
            <h3>State flow</h3>
            <p>
              Projects live in a central context and are persisted to local
              storage. Hooks provide a clean API for pages and components.
            </p>
          </article>
          <article className="about-card">
            <h3>Reusable UI</h3>
            <p>
              Core UI blocks like cards, modals, and toasts are shared across
              pages to keep the experience consistent.
            </p>
          </article>
          <article className="about-card">
            <h3>Routing</h3>
            <p>
              Vite powers the build system, while React Router keeps routes and
              page transitions organized.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
