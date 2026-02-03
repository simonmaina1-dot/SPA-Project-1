import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import useProjects from "../../hooks/useProjects";
import "./ProjectCard.css";

export default function ProjectCard({ project, onClick, featured = false }) {
  const { formatCurrency } = useProjects();

  // Calculate funding progress
  const progress = project.goal
    ? Math.min(100, Math.round((project.currentAmount / project.goal) * 100))
    : 0;

  // Get gallery images from database fields
  const galleryImages = [];
  const galleryUrls = Array.isArray(project.galleryUrls)
    ? project.galleryUrls.filter(Boolean)
    : [];
  const galleryFiles = Array.isArray(project.galleryFiles)
    ? project.galleryFiles.filter(Boolean)
    : [];

  const addImage = (url) => {
    if (url && !galleryImages.includes(url)) {
      galleryImages.push(url);
    }
  };

  // Add main image URL from database
  addImage(project.imageUrl);
  // Add gallery URLs from database
  galleryUrls.forEach(addImage);
  // Add gallery files from database (construct path from project id)
  galleryFiles.forEach((file) =>
    addImage(`/project-images/${project.id}/${file}`)
  );

  // Fallback to numbered images if no gallery provided
  if (galleryImages.length === 0) {
    const galleryCount = Number(project.galleryCount) || 0;
    for (let i = 1; i <= galleryCount; i++) {
      addImage(`/project-images/${project.id}/${i}.jpg`);
    }
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  // Intersection Observer - only run slideshow when card is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  // Auto-slide with staggered timing for each card - ONLY when visible
  useEffect(() => {
    if (galleryImages.length <= 1 || !isVisible) return;

    const randomDelay = Math.random() * 4000;

    const delayTimer = setTimeout(() => {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
      }, 4000); // Change every 4 seconds

      return () => clearInterval(interval);
    }, randomDelay);

    return () => clearTimeout(delayTimer);
  }, [galleryImages.length, isVisible]);

  // Status badge class based on project status
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "funded":
        return "status-badge-funded";
      case "active":
        return "status-badge-active";
      case "completed":
        return "status-badge-completed";
      default:
        return "status-badge-default";
    }
  };

  // Action button/link
  const actionLabel = "Donate Page";
  const actionContent = (
    <>
      {actionLabel}
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M7.5 15L12.5 10L7.5 5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </>
  );

  const actionNode = onClick ? (
    <span className="learn-more-btn">{actionContent}</span>
  ) : (
    <Link to={`/projects/${project.id}`} className="learn-more-btn">
      {actionContent}
    </Link>
  );

  // Card body
  const cardBody = (
    <article ref={cardRef} className={`project-card${featured ? " featured" : ""}`}>
      {/* Background image slideshow */}
      <div className="project-card-slides">
        {galleryImages.length > 0 ? (
          galleryImages.map((src, index) => {
            const isActive = index === currentIndex;

            return (
              <div
                key={index}
                className={`project-card-slide${isActive ? " active" : ""}`}
                style={{
                  backgroundImage: `url(${src})`,
                }}
              />
            );
          })
        ) : (
          <div
            className="project-card-slide active"
            style={{
              background: "linear-gradient(135deg, #1db954 0%, #1ed760 100%)",
            }}
          />
        )}
      </div>

      {/* Gradient overlay - ALWAYS VISIBLE */}
      <div className="project-card-overlay" />

      {/* Content overlay - ALWAYS ON TOP */}
      <div className="project-card-content">
        <div className="project-card-header">
          <h3 className="project-title">{project.title}</h3>
          <p className="project-description">{project.description}</p>
        </div>

        {/* Enhanced funding info - ALWAYS VISIBLE */}
        <div className="project-card-details">
          <div className="project-funding-info">
            <div className="funding-row">
              <span className="funding-label">RAISED</span>
              <span className="funding-value">{formatCurrency(project.currentAmount)}</span>
            </div>
            <div className="funding-row">
              <span className="funding-label">GOAL</span>
              <span className="funding-value">{formatCurrency(project.goal)}</span>
            </div>
            <div className="funding-row">
              <span className="funding-label">DONORS</span>
              <span className="funding-value">{project.donorCount || 0}</span>
            </div>
          </div>
          
          <div className="project-funding">
            <span className="funding-percentage">{progress}% funded</span>
            <div className="funding-bar">
              <div
                className="funding-progress"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="project-card-footer">
          {actionNode}
        </div>
      </div>
    </article>
  );

  if (onClick) {
    return (
      <button type="button" className="project-card-wrapper" onClick={onClick}>
        {cardBody}
      </button>
    );
  }

  return <div className="project-card-shell">{cardBody}</div>;
}
