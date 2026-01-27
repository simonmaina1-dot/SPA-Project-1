import { useState, useMemo, useEffect, useContext, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import useProjects from "../hooks/useProjects";
import ProjectCard from "../components/ProjectCard";
import { ToastContext } from "../context/ToastContext";
import useFeedback from "../hooks/useFeedback";
import useForm from "../hooks/useForm";


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
  const { feedbackList, addFeedback } = useFeedback();
  const {
    values: feedbackValues,
    handleChange: handleFeedbackChange,
    reset: resetFeedback,
  } = useForm({ name: "", email: "", message: "" });
  const location = useLocation();
  const aboutRef = useRef(null);
  const statsRef = useRef(null); // Reference for stats animation
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statsVisible, setStatsVisible] = useState(false); // Track stats visibility
  const [expandedCards, setExpandedCards] = useState({});

  // Toggle expanded state for about cards (only one open at a time)
  const toggleCard = (cardId) => {
    setExpandedCards((prev) =>
      prev[cardId] ? {} : { [cardId]: true }
    );
  };

  const handleFeedbackSubmit = (event) => {
    event.preventDefault();

    if (!feedbackValues.name.trim() || !feedbackValues.message.trim()) {
      showToast("Add your name and feedback message.", "warning");
      return;
    }

    addFeedback(feedbackValues);
    showToast("Thanks for sharing your feedback!", "success");
    resetFeedback();
  };


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
        <section className="featured-section" id="featured">
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
      <section className="projects-section" id="all-projects">
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
        <div className="about-header">
          <h2>About the Community</h2>
          <p className="about-lead">
            Behind every funded project is a parent who stayed up late submitting
            updates, a volunteer who showed up on a Saturday morning, a donor
            who gave Ksh 18,000 because they remembered what it felt like to need help
            and not get it.
          </p>
        </div>

        <div className="about-grid">
          <article className="about-card">
            <h3>Local Spotlights</h3>
            <p>
              Every active project gets a spotlight: a photo, a short update,
              and a clear accounting of where things stand.{" "}
              {!expandedCards.spotlights && (
                <button
                  className="read-more-link"
                  onClick={() => toggleCard("spotlights")}
                >
                  Read more
                </button>
              )}
            </p>
            {expandedCards.spotlights && (
              <div className="about-card-expanded">
                <p>
                  You'll see a food pantry coordinator posting that the new
                  refrigeration unit arrived—and that Tuesday distributions now
                  serve 40 more families. A youth soccer coach sharing a photo
                  of kids in cleats that actually fit. A mobile clinic volunteer
                  explaining that last month's dental screenings caught three
                  cavities early, before they became emergencies.
                </p>
                <p>
                  These aren't success stories crafted for fundraising. They're
                  progress reports written by people in the middle of the work,
                  often tired, sometimes frustrated, always honest about what's
                  working and what still isn't.
                </p>
                <p className="about-emphasis">
                  The goal is visibility, not performance.{" "}
                  <button
                    className="read-more-link"
                    onClick={() => toggleCard("spotlights")}
                  >
                    Show less
                  </button>
                </p>
              </div>
            )}
          </article>

          <article className="about-card">
            <h3>Community Signals</h3>
            <p>
              We track what's moving. When a project picks up five new donors in
              a week, you'll see it. When a volunteer callout goes unanswered,
              you'll see that too.{" "}
              {!expandedCards.signals && (
                <button
                  className="read-more-link"
                  onClick={() => toggleCard("signals")}
                >
                  Read more
                </button>
              )}
            </p>
            {expandedCards.signals && (
              <div className="about-card-expanded">
                <p>
                  Category trends show where attention is flowing—and where it's
                  needed. If education projects are surging while health
                  initiatives stall, that's information worth having. If a
                  neighborhood food pantry is Ksh 200 short of its next milestone
                  with three days left, we surface that so people who want to
                  help can act while it still matters.
                </p>
                <p className="about-emphasis">
                  This isn't gamification. It's coordination.{" "}
                  <button
                    className="read-more-link"
                    onClick={() => toggleCard("signals")}
                  >
                    Show less
                  </button>
                </p>
              </div>
            )}
          </article>

          <article className="about-card">
            <h3>Shared Responsibility</h3>
            <p>
              Transparency isn't a feature here; it's the foundation. When a
              project hits its goal, we celebrate. When something falls short,
              we say so.{" "}
              {!expandedCards.responsibility && (
                <button
                  className="read-more-link"
                  onClick={() => toggleCard("responsibility")}
                >
                  Read more
                </button>
              )}
            </p>
            {expandedCards.responsibility && (
              <div className="about-card-expanded">
                <p>
                  We don't pretend this platform runs itself. It works because
                  people check in, post updates, flag problems, and hold each
                  other accountable.
                </p>
                <p>
                  If you're a donor, you'll find proof that your contribution
                  moved. If you're a volunteer, you'll find places that need
                  hands, not just sympathy. If you're a local organization
                  looking for partners, you'll find a track record you can
                  verify.
                </p>
                <p className="about-emphasis">
                  The door is open. Step in when you're ready.{" "}
                  <button
                    className="read-more-link"
                    onClick={() => toggleCard("responsibility")}
                  >
                    Show less
                  </button>
                </p>
              </div>
            )}
          </article>
        </div>
      </section>

      {/* Feedback Section */}
      <section className="feedback-section">
        <article className="admin-card admin-card-wide">
          <div className="admin-section-header">
            <div>
              <h3>User Feedback</h3>
              <p className="admin-card-subtitle">
                Community suggestions and feedback submissions.
              </p>
            </div>
          </div>
          <form className="feedback-form-card form-card" onSubmit={handleFeedbackSubmit}>
            <div className="form-grid">
              <label className="form-field">
                <span className="form-label">Name</span>
                <input
                  type="text"
                  name="name"
                  value={feedbackValues.name}
                  onChange={handleFeedbackChange}
                  placeholder="Visitor name"
                  required
                />
              </label>
              <label className="form-field">
                <span className="form-label">Email</span>
                <input
                  type="email"
                  name="email"
                  value={feedbackValues.email}
                  onChange={handleFeedbackChange}
                  placeholder="email@example.com"
                />
              </label>
              <label className="form-field form-field-wide">
                <span className="form-label">Message</span>
                <textarea
                  name="message"
                  value={feedbackValues.message}
                  onChange={handleFeedbackChange}
                  rows="3"
                  placeholder="Feedback summary"
                  required
                />
              </label>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Log feedback
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => resetFeedback()}
              >
                Clear
              </button>
            </div>
          </form>
        </article>
      </section>
    </div>
  );
}
