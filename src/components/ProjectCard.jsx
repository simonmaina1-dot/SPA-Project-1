import { Link } from "react-router-dom";
import { useEffect, useState, memo, useRef, useCallback } from "react";
import useProjects from "../hooks/useProjects";

function ProjectCard({ project, onClick, featured = false }) {
  const { formatCurrency } = useProjects();
  const cardRef = useRef(null);
  const intervalRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedIndexes, setLoadedIndexes] = useState(new Set());

  const progress = project.goal
    ? Math.min(100, Math.round((project.currentAmount / project.goal) * 100))
    : 0;

<<<<<<< HEAD
  // ✅ Handle BOTH galleryUrls (external) AND galleryFiles (local)
  const galleryImages = (() => {
    // Priority 1: Use galleryUrls if available (like p-1009 has)
    if (project.galleryUrls && project.galleryUrls.length > 0) {
      return project.galleryUrls;
    }
    // Priority 2: Use galleryFiles with local images
    if (project.galleryFiles && project.galleryFiles.length > 0) {
      return project.galleryFiles.map(file => `/project-images/${project.id}/${file}`);
=======
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
>>>>>>> main
    }
    // Priority 3: Fallback to main imageUrl
    if (project.imageUrl) {
      return [project.imageUrl];
    }
    // No images available
    return [];
  })();

<<<<<<< HEAD
  // ✅ Intersection Observer - Load when card enters viewport
=======
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedIndexes, setLoadedIndexes] = useState(new Set());
  const [imageErrors, setImageErrors] = useState(new Set());
  const [hasAnyImageLoaded, setHasAnyImageLoaded] = useState(false);

  // Auto-slide with staggered timing for each card
>>>>>>> main
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { 
        rootMargin: '150px',
        threshold: 0.01
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // ✅ Optimized image load handler
  const handleImageLoad = useCallback((index) => {
    setLoadedIndexes((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  const handleImageError = useCallback((index, src) => {
    console.error(`Failed to load: ${src}`);
    // Mark as "loaded" to show gradient instead of trying forever
    setLoadedIndexes((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
<<<<<<< HEAD
  }, []);

  // ✅ Auto-slide with independent random timing per card
  useEffect(() => {
    if (!isVisible || galleryImages.length <= 1) return;
=======
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
>>>>>>> main

    // Each card gets random start delay (0-4 seconds)
    const randomStartDelay = Math.random() * 4000;
    
    const startTimer = setTimeout(() => {
      // Slide interval (4 seconds between transitions)
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
      }, 4000);
    }, randomStartDelay);

    return () => {
      clearTimeout(startTimer);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isVisible, galleryImages.length]);

  const cardBody = (
    <article ref={cardRef} className={`project-card${featured ? " featured" : ""}`}>
      {/* Image slideshow container */}
      <div className="project-card-slides">
        {galleryImages.length > 0 ? (
          galleryImages.map((src, index) => {
            const isActive = index === currentIndex;
            const isLoaded = loadedIndexes.has(index);
<<<<<<< HEAD
            const shouldShow = isActive && isLoaded;
            
            return (
              <div
                key={`${project.id}-${index}`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundImage: isLoaded ? `url(${src})` : 'none',
                  backgroundColor: !isLoaded ? '#1db954' : 'transparent',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  opacity: shouldShow ? 1 : 0,
                  transition: 'opacity 1s ease-in-out',
                  willChange: 'opacity',
                  transform: 'translateZ(0)',
                  zIndex: isActive ? 2 : 1
=======
            const hasError = imageErrors.has(index);
            const shouldShow = isActive && isLoaded && !hasError;

            return (
              <div
                key={index}
                className={`project-card-slide${shouldShow ? " active loaded" : ""}`}
                style={{
                  backgroundImage: shouldShow ? `url(${src})` : "none",
>>>>>>> main
                }}
              >
                {/* Preload image when card is visible */}
                {isVisible && (
                  <img
                    src={src}
                    alt=""
                    onLoad={() => handleImageLoad(index)}
                    onError={() => handleImageError(index, src)}
                    crossOrigin="anonymous"
                    style={{ 
                      position: 'absolute',
                      width: '1px',
                      height: '1px',
                      opacity: 0,
                      pointerEvents: 'none'
                    }}
                  />
                )}
              </div>
            );
          })
        ) : (
<<<<<<< HEAD
          // Fallback gradient when no images
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #1db954 0%, #1ed760 100%)'
          }} />
=======
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
>>>>>>> main
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
          <div className="project-funding-info">
            <div className="funding-row">
              <span className="funding-label">Raised</span>
              <span className="funding-value">{formatCurrency(project.currentAmount)}</span>
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

<<<<<<< HEAD
          <span className="learn-more-btn">
            Learn more
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M7.5 15L12.5 10L7.5 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
=======
        <div className="project-card-footer">
          {actionNode}
>>>>>>> main
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

  return (
    <Link to={`/projects/${project.id}`} className="project-card-wrapper">
      {cardBody}
    </Link>
  );
}

export default memo(ProjectCard);
