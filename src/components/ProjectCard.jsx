import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import useProjects from "../hooks/useProjects";

export default function ProjectCard({ project, onClick, featured = false }) {
  const { formatCurrency } = useProjects();

  // Calculate funding progress
  const progress = project.goal
    ? Math.min(100, Math.round((project.currentAmount / project.goal) * 100))
    : 0;

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

  addImage(project.imageUrl);
  galleryUrls.forEach(addImage);
  galleryFiles.forEach((file) =>
    addImage(`/project-images/${project.id}/${file}`)
  );

  if (galleryImages.length === 0) {
    const galleryCount = Number(project.galleryCount) || 0;
    for (let i = 1; i <= galleryCount; i++) {
      addImage(`/project-images/${project.id}/${i}.jpg`);
    }
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedIndexes, setLoadedIndexes] = useState(new Set());

  // Auto-slide with staggered timing for each card
  useEffect(() => {
    if (galleryImages.length <= 1) return;

    const randomDelay = Math.random() * 4000;

    const delayTimer = setTimeout(() => {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
      }, 4000);

      return () => clearInterval(interval);
    }, randomDelay);

    return () => clearTimeout(delayTimer);
  }, [galleryImages.length]);

  const handleImageLoad = (index) => {
    setLoadedIndexes((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

  const handleImageError = (index, src) => {
    console.error(`Failed to load image ${index} for ${project.id}:`, src);
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
            const shouldShow = isActive && isLoaded;

            return (
              <div
                key={index}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundImage: `url(${src})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  opacity: shouldShow ? 1 : 0,
                  transition: "opacity 1s ease-in-out",
                  zIndex: isActive ? 2 : 1,
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
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
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
          <span className="project-category">{project.category}</span>
          <h3 className="project-title">{project.title}</h3>
          <p className="project-description">{project.description}</p>
        </div>

        <div className="project-card-footer">
          <div className="project-funding">
            <span className="funding-percentage">{progress}% funded</span>
            <div className="funding-bar">
              <div
                className="funding-progress"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {actionNode}
        </div>
      </div>
    </article>
  );

  if (onClick) {
    return (
      <button type="button" className="project-card-button" onClick={onClick}>
        {cardBody}
      </button>
    );
  }

  return <div className="project-card-shell">{cardBody}</div>;
}
