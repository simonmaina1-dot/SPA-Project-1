import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import useProjects from "../../hooks/useProjects";

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
  const [loadedIndexes, setLoadedIndexes] = useState(new Set());
  const [imageErrors, setImageErrors] = useState(new Set());
  const [hasAnyImageLoaded, setHasAnyImageLoaded] = useState(false);

  const intervalRef = useRef(null);
  const delayRef = useRef(null);

  // Auto-slide with staggered timing for each card
  useEffect(() => {
    if (galleryImages.length <= 1) return;

    const randomDelay = Math.random() * 5000;

    delayRef.current = window.setTimeout(() => {
      intervalRef.current = window.setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
      }, 5500);
    }, randomDelay);

    return () => {
      if (delayRef.current) {
        clearTimeout(delayRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [galleryImages.length]);

  const handleImageLoad = (index) => {
    setLoadedIndexes((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
    setHasAnyImageLoaded(true);
  };

  const handleImageError = (index, src) => {
    console.warn(`Image failed to load ${index} for ${project.id}:`, src);
    setImageErrors((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

  // Check if current image has error - auto-switch to next working image
  useEffect(() => {
    if (galleryImages.length <= 1 || !hasAnyImageLoaded) return;

    const checkAndSwitch = () => {
      if (imageErrors.has(currentIndex)) {
        // Find next working image
        for (let i = 1; i < galleryImages.length; i++) {
          const nextIndex = (currentIndex + i) % galleryImages.length;
          if (!imageErrors.has(nextIndex) && loadedIndexes.has(nextIndex)) {
            setCurrentIndex(nextIndex);
            return;
          }
        }
      }
    };

    checkAndSwitch();
  }, [currentIndex, galleryImages.length, imageErrors, loadedIndexes, hasAnyImageLoaded]);

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
    <article className={`project-card${featured ? " featured" : ""}`}>
      {/* Background image slideshow */}
      <div className="project-card-slides">
        {galleryImages.length > 0 ? (
          galleryImages.map((src, index) => {
            const isActive = index === currentIndex;
            const isLoaded = loadedIndexes.has(index);
            const hasError = imageErrors.has(index);
            const shouldShow = isActive && isLoaded && !hasError;

            return (
              <div
                key={index}
                className={`project-card-slide${shouldShow ? " active loaded" : ""}`}
                style={{
                  backgroundImage: shouldShow ? `url(${src})` : "none",
                }}
              >
                <img
                  src={src}
                  alt={`${project.title} image ${index + 1}`}
                  onLoad={() => handleImageLoad(index)}
                  onError={() => handleImageError(index, src)}
                  style={{ display: "none" }}
                />
              </div>
            );
          })
        ) : (
          <div
            className="project-card-slide active loaded"
            style={{
              background: "linear-gradient(135deg, #1db954 0%, #1ed760 100%)",
            }}
          />
        )}

        {/* Fallback gradient when no images loaded */}
        {!hasAnyImageLoaded && galleryImages.length === 0 && (
          <div
            className="project-card-slide active loaded"
            style={{
              background: "linear-gradient(135deg, #1db954 0%, #1ed760 100%)",
            }}
          />
        )}
      </div>

      {/* Gradient overlay */}
      <div className="project-card-overlay" />

      {/* Content overlay */}
      <div className="project-card-content">
        <div className="project-card-header">
          {/* Status badge */}
          <span className={`project-status-badge ${getStatusBadgeClass(project.status)}`}>
            {project.status}
          </span>
          
          <span className="project-category">{project.category}</span>
          <h3 className="project-title">{project.title}</h3>
          <p className="project-description">{project.description}</p>
        </div>

        {/* Enhanced funding info */}
        <div className="project-card-details">
          <div className="project-funding-card">
            <div className="project-funding-info">
              <div className="funding-row">
                <span className="funding-label">Raised</span>
                <span className="funding-value">
                  {formatCurrency(project.currentAmount)}
                </span>
              </div>
              <div className="funding-row">
                <span className="funding-label">Goal</span>
                <span className="funding-value">{formatCurrency(project.goal)}</span>
              </div>
              <div className="funding-row">
                <span className="funding-label">Donors</span>
                <span className="funding-value">{project.donorCount || 0}</span>
              </div>
            </div>
          </div>

          <div className="project-progress-card">
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