import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import useProjects from "../hooks/useProjects";

export default function ProjectDetails() {
  const { projectId } = useParams();
  const { projects, formatCurrency } = useProjects();
  
  const project = projects.find((item) => item.id === projectId);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState(new Set());

  // Build gallery images from galleryCount
  const galleryCount = Number(project?.galleryCount) || 0;
  const galleryImages = [];
  
  for (let i = 1; i <= galleryCount; i++) {
    galleryImages.push(`/project-images/${projectId}/${i}.jpg`);
  }

  // Auto-slide gallery images
  useEffect(() => {
    if (galleryImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [galleryImages.length]);

  const handleImageLoad = (index) => {
    setLoadedImages((prev) => new Set([...prev, index]));
  };

  if (!project) {
    return (
      <div className="page project-details-page">
        <section className="empty-state">
          <h2>Project not found</h2>
          <p>The project you are looking for does not exist.</p>
          <Link to="/" className="btn btn-primary">
            Back to projects
          </Link>
        </section>
      </div>
    );
  }

  const progress = project.goal
    ? Math.min(100, Math.round((project.currentAmount / project.goal) * 100))
    : 0;

  return (
    <div className="project-details-page">
      {/* Hero Section with Image Gallery */}
      <section className="details-hero">
        <div className="details-hero-image">
          {galleryImages.length > 0 ? (
            <>
              {galleryImages.map((src, index) => (
                <div
                  key={index}
                  className={`hero-slide${index === currentImageIndex ? " active" : ""}${loadedImages.has(index) ? " loaded" : ""}`}
                  style={{ backgroundImage: `url(${src})` }}
                >
                  <img
                    src={src}
                    alt=""
                    onLoad={() => handleImageLoad(index)}
                    style={{ display: "none" }}
                  />
                </div>
              ))}
              
              {/* Gallery Indicators */}
              {galleryImages.length > 1 && (
                <div className="gallery-indicators">
                  {galleryImages.map((_, index) => (
                    <button
                      key={index}
                      className={`indicator${index === currentImageIndex ? " active" : ""}`}
                      onClick={() => setCurrentImageIndex(index)}
                      aria-label={`View image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="hero-placeholder" />
          )}
          
          <div className="hero-overlay" />
          
          {/* Back Button */}
          <Link to="/" className="back-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Projects
          </Link>
        </div>
      </section>

      {/* Content Section */}
      <section className="details-content">
        <div className="details-container">
          {/* Main Content */}
          <div className="details-main">
            <div className="details-header">
              <span className="project-category-badge">{project.category}</span>
              <h1 className="details-title">{project.title}</h1>
              <p className="details-description">{project.description}</p>
            </div>

            <div className="details-meta-grid">
              <div className="meta-card">
                <div className="meta-icon">💰</div>
                <div className="meta-content">
                  <span className="meta-label">Goal Amount</span>
                  <span className="meta-value">{formatCurrency(project.goal)}</span>
                </div>
              </div>

              <div className="meta-card">
                <div className="meta-icon">📊</div>
                <div className="meta-content">
                  <span className="meta-label">Raised So Far</span>
                  <span className="meta-value">{formatCurrency(project.currentAmount)}</span>
                </div>
              </div>

              <div className="meta-card">
                <div className="meta-icon">👥</div>
                <div className="meta-content">
                  <span className="meta-label">Total Donors</span>
                  <span className="meta-value">{project.donorCount || 0}</span>
                </div>
              </div>

              <div className="meta-card">
                <div className="meta-icon">
                  {project.status === "funded" ? "✅" : project.status === "active" ? "🔥" : "⏳"}
                </div>
                <div className="meta-content">
                  <span className="meta-label">Status</span>
                  <span className={`meta-value status-${project.status}`}>
                    {project.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="details-section">
              <h2>About This Project</h2>
              <p>
                This community-driven initiative aims to make a lasting impact on our neighborhood. 
                Every contribution helps us move closer to our goal and creates positive change for those who need it most.
              </p>
              <ul className="features-list">
                <li>✓ 100% transparent donation tracking</li>
                <li>✓ Regular progress updates</li>
                <li>✓ Community-led decision making</li>
                <li>✓ Direct local impact</li>
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="details-sidebar">
            <div className="donation-card">
              <div className="funding-progress-section">
                <div className="funding-stats">
                  <span className="funding-percentage">{progress}%</span>
                  <span className="funding-text">funded</span>
                </div>
                
                <div className="funding-bar-container">
                  <div className="funding-bar-track">
                    <div 
                      className="funding-bar-fill" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="funding-details">
                  <div>
                    <strong>{formatCurrency(project.currentAmount)}</strong>
                    <span> raised</span>
                  </div>
                  <div>
                    <strong>{formatCurrency(project.goal)}</strong>
                    <span> goal</span>
                  </div>
                </div>
              </div>

              <Link to={`/donate/${project.id}`} className="donate-button">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" fill="currentColor"/>
                </svg>
                Donate Now
              </Link>

              <div className="share-section">
                <p className="share-label">Share this project</p>
                <div className="share-buttons">
                  <button className="share-btn" aria-label="Share on Twitter">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                    </svg>
                  </button>
                  <button className="share-btn" aria-label="Share on Facebook">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                    </svg>
                  </button>
                  <button className="share-btn" aria-label="Copy link">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
